from __future__ import annotations

import json
import hashlib
import os
import sys
import tempfile
import time
import unittest
import zipfile
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.docx_report import build_project_report
from backend.external_engines import ENGINES, all_engine_statuses, engine_status
from backend.result_summary import mass_brief_explanation, ptm_brief_explanation
from backend.service import run_cli
import backend.local_engine_tasks as local_engine_tasks
from backend.local_engine_tasks import LocalEngineTaskManager
from backend.submission_parser import parse_submission_files
from worker.flashdeconv_cli import read_spectrum_tsv
from scripts.sage_to_biocompare_ptm import parse_peptide


class IntegrationSkeletonTests(unittest.TestCase):
    def test_local_engine_task_is_async_and_project_isolated(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        original_unidec = os.environ.get("UNIDEC_BIN")
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                os.environ["UNIDEC_BIN"] = sys.executable
                manager = LocalEngineTaskManager()
                state, folder = manager.prepare("project-A", "intact-mass", {"configFile": "job.txt", "timeoutSeconds": 10})
                script = folder / "inputs" / "job.txt"
                script.write_text("from pathlib import Path\nprint('unidec-test-output', flush=True)\nPath('generated.dat').write_text('42')\n", encoding="utf-8")
                manager.start()
                input_hash = hashlib.sha256(script.read_bytes()).hexdigest()
                manager.enqueue(state["id"], folder, [{"storedName": "job.txt", "name": "job.txt", "size": script.stat().st_size, "sha256": input_hash}])
                deadline = time.time() + 10
                while time.time() < deadline and manager.get(state["id"], "project-A")["status"] not in local_engine_tasks.TERMINAL_STATES:
                    time.sleep(0.05)
                result = manager.get(state["id"], "project-A")
                self.assertEqual(result["status"], "completed", result.get("error"))
                self.assertIn("unidec-test-output", manager.read_log(state["id"], "project-A", "stdout", 20))
                self.assertTrue(str(folder).startswith(str(Path(temporary) / "project-A" / "intact-mass")))
                self.assertNotIn("inputs/job.txt", {item["path"] for item in result["artifacts"]})
                self.assertNotIn("work/job.txt", {item["path"] for item in result["artifacts"]})
                self.assertTrue(manager.artifact(state["id"], "project-A", "work/generated.dat").is_file())
                self.assertTrue(manager.artifact(state["id"], "project-A", "audit.json").is_file())
                audit = json.loads((folder / "audit.json").read_text(encoding="utf-8"))
                self.assertEqual(audit["inputFiles"][0]["sha256"], input_hash)
                self.assertEqual(len(audit["commandSha256"]), 64)
                generated_entry = next(item for item in result["artifacts"] if item["path"] == "work/generated.dat")
                self.assertEqual(generated_entry["sha256"], hashlib.sha256(b"42").hexdigest())
                (folder / "work" / "generated.dat").write_text("tampered", encoding="utf-8")
                with self.assertRaises(FileNotFoundError):
                    manager.artifact(state["id"], "project-A", "work/generated.dat")
                with self.assertRaises(FileNotFoundError):
                    manager.get(state["id"], "project-B")
                with self.assertRaises(FileNotFoundError):
                    manager.artifact(state["id"], "project-A", "inputs/job.txt")
                with self.assertRaises(FileNotFoundError):
                    manager.artifact(state["id"], "project-A", "work/job.txt")
                (folder / "outputs" / "not-registered.txt").write_text("late", encoding="utf-8")
                with self.assertRaises(FileNotFoundError):
                    manager.artifact(state["id"], "project-A", "outputs/not-registered.txt")
                with self.assertRaises(FileNotFoundError):
                    manager.artifact(state["id"], "project-A", "../outside.txt")
                manager.stop()
            finally:
                local_engine_tasks.TASK_ROOT = original_root
                if original_unidec is None:
                    os.environ.pop("UNIDEC_BIN", None)
                else:
                    os.environ["UNIDEC_BIN"] = original_unidec

    def test_free_form_arguments_and_windows_metacharacters_are_rejected(self) -> None:
        manager = LocalEngineTaskManager()
        malicious = ["& calc", "| whoami", "<secret", ">overwrite", "^escape", "%PATH%", "!VAR!"]
        with tempfile.TemporaryDirectory() as temporary:
            original_root = local_engine_tasks.TASK_ROOT
            local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
            try:
                for index, value in enumerate(malicious):
                    with self.assertRaisesRegex(ValueError, "禁止提交 additionalArgs"):
                        manager.prepare(f"project-{index}", "post-translational-modifications", {"additionalArgs": [value]})
            finally:
                local_engine_tasks.TASK_ROOT = original_root

    @unittest.skipUnless(os.name == "nt", "Windows cmd contract")
    def test_windows_batch_launcher_rejects_cmd_metacharacters(self) -> None:
        for malicious in (
            [r"C:\tools\fragpipe&calc.cmd", "--headless"],
            [r"C:\tools\fragpipe.cmd", r"C:\work\%PATH%\workflow"],
            [r"C:\tools\fragpipe.cmd", "safe", "& whoami"],
        ):
            with self.assertRaisesRegex(ValueError, "cmd元字符"):
                local_engine_tasks._windows_launcher(malicious)

    def test_cancel_before_process_start_is_idempotent_and_project_scoped(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                manager = LocalEngineTaskManager()
                state, folder = manager.prepare("project-cancel", "intact-mass", {"configFile": "job.txt"})
                input_path = folder / "inputs" / "job.txt"; input_path.write_text("input", encoding="utf-8")
                manager.enqueue(state["id"], folder, [{
                    "storedName": "job.txt", "name": "job.txt", "size": input_path.stat().st_size,
                    "sha256": hashlib.sha256(input_path.read_bytes()).hexdigest(),
                }])
                cancelled = manager.cancel(state["id"], "project-cancel")
                self.assertEqual(cancelled["status"], "cancelled")
                self.assertEqual(cancelled["terminationEvidence"]["method"], "cancel-before-process-start")
                self.assertEqual(manager.cancel(state["id"], "project-cancel")["status"], "cancelled")
                with self.assertRaises(FileNotFoundError):
                    manager.cancel(state["id"], "another-project")
            finally:
                local_engine_tasks.TASK_ROOT = original_root

    def test_input_manifest_rejects_path_traversal_and_hash_mismatch(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                manager = LocalEngineTaskManager()
                state, folder = manager.prepare("project-input-contract", "intact-mass", {})
                input_path = folder / "inputs" / "safe.txt"; input_path.write_text("safe", encoding="utf-8")
                with self.assertRaisesRegex(ValueError, "不安全的storedName"):
                    manager.enqueue(state["id"], folder, [{"storedName": "../safe.txt", "size": 4, "sha256": hashlib.sha256(b"safe").hexdigest()}])
                with self.assertRaisesRegex(ValueError, "SHA-256"):
                    manager.enqueue(state["id"], folder, [{"storedName": "safe.txt", "size": 4, "sha256": "0" * 64}])
            finally:
                local_engine_tasks.TASK_ROOT = original_root

    def test_running_cancel_records_process_tree_termination_evidence(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                manager = LocalEngineTaskManager()
                state, folder = manager.prepare("project-running-cancel", "intact-mass", {})
                fake_process = mock.Mock(pid=24680)
                manager._processes[state["id"]] = fake_process
                manager._update(folder, status="running", pid=24680, message="running")
                evidence = {"at": local_engine_tasks.utc_now(), "pid": 24680, "reason": "user-cancel", "method": "taskkill-tree"}
                with mock.patch.object(local_engine_tasks, "_kill_process_tree", return_value=evidence) as terminate:
                    cancelling = manager.cancel(state["id"], "project-running-cancel")
                terminate.assert_called_once_with(fake_process, "user-cancel")
                self.assertEqual(cancelling["status"], "cancelling")
                self.assertEqual(cancelling["terminationEvidence"]["method"], "taskkill-tree")
            finally:
                local_engine_tasks.TASK_ROOT = original_root

    def test_restart_marks_nonterminal_task_interrupted_with_evidence(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                manager = LocalEngineTaskManager()
                state, folder = manager.prepare("project-restart", "intact-mass", {})
                manager._update(folder, status="running", pid=43210, message="running")
                manager._mark_abandoned_tasks()
                interrupted = manager.get(state["id"], "project-restart")
                self.assertEqual(interrupted["status"], "interrupted")
                self.assertEqual(interrupted["terminationEvidence"]["reason"], "backend-restart-detected")
                self.assertEqual(interrupted["terminationEvidence"]["previousPid"], 43210)
            finally:
                local_engine_tasks.TASK_ROOT = original_root

    def test_fragpipe_success_waits_for_downstream_ptm_quality_pipeline(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        original_fragpipe = os.environ.get("FRAGPIPE_BIN")
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                launcher = Path(temporary) / "fragpipe.bat"
                launcher.write_text("@echo off\r\nexit /b 0\r\n", encoding="utf-8")
                os.environ["FRAGPIPE_BIN"] = str(launcher)
                manager = LocalEngineTaskManager()
                parameters = {"workflowFile": "MAM.workflow", "manifestFile": "samples.manifest"}
                state, folder = manager.prepare("project-PTM", "post-translational-modifications", parameters)
                workflow = folder / "inputs" / "MAM.workflow"; workflow.write_text("workflow", encoding="utf-8")
                manifest = folder / "inputs" / "samples.manifest"; manifest.write_text("manifest", encoding="utf-8")
                files = [
                    {"storedName": workflow.name, "name": workflow.name, "size": workflow.stat().st_size, "sha256": hashlib.sha256(workflow.read_bytes()).hexdigest()},
                    {"storedName": manifest.name, "name": manifest.name, "size": manifest.stat().st_size, "sha256": hashlib.sha256(manifest.read_bytes()).hexdigest()},
                ]
                manager.enqueue(state["id"], folder, files)
                manager._queue.get_nowait(); manager._queue.task_done()

                def fake_fragpipe(_: Path, __: list[str], ___: int) -> int:
                    (folder / "outputs" / "psm.tsv").write_text("peptide\tq-value\n", encoding="utf-8")
                    return 0

                with mock.patch.object(manager, "_run_process", side_effect=fake_fragpipe):
                    manager._execute(folder)
                final = manager.get(state["id"], "project-PTM")
                result = json.loads((folder / "result.json").read_text(encoding="utf-8"))
                self.assertEqual(final["status"], "awaiting_downstream")
                self.assertEqual(result["upstreamExecutionStatus"], "completed")
                self.assertFalse(result["ptmComparisonCompleted"])
                self.assertEqual(result["ptmStageContract"]["businessStatus"], "upstream_completed")
                self.assertEqual(result["ptmStageContract"]["nextRequiredGate"], "output_contract_parsing")
                self.assertIsNone(result["ptmStageContract"]["comparison"])
                self.assertIn("目标-诱饵FDR控制", result["downstreamRequired"])
                self.assertIn("OpenMS+Sage", result["recommendedDownstream"]["preferredValidatedPath"])
            finally:
                local_engine_tasks.TASK_ROOT = original_root
                if original_fragpipe is None:
                    os.environ.pop("FRAGPIPE_BIN", None)
                else:
                    os.environ["FRAGPIPE_BIN"] = original_fragpipe

    def test_fragpipe_zero_exit_without_outputs_is_quality_blocked(self) -> None:
        original_root = local_engine_tasks.TASK_ROOT
        original_fragpipe = os.environ.get("FRAGPIPE_BIN")
        with tempfile.TemporaryDirectory() as temporary:
            try:
                local_engine_tasks.TASK_ROOT = Path(temporary).resolve()
                launcher = Path(temporary) / "fragpipe.bat"; launcher.write_text("@echo off\r\n", encoding="utf-8")
                os.environ["FRAGPIPE_BIN"] = str(launcher)
                manager = LocalEngineTaskManager()
                parameters = {"workflowFile": "MAM.workflow", "manifestFile": "samples.manifest"}
                state, folder = manager.prepare("project-blocked", "post-translational-modifications", parameters)
                for name in ("MAM.workflow", "samples.manifest"):
                    (folder / "inputs" / name).write_text("test", encoding="utf-8")
                files = [
                    {"storedName": name, "name": name, "size": 4, "sha256": hashlib.sha256((folder / "inputs" / name).read_bytes()).hexdigest()}
                    for name in ("MAM.workflow", "samples.manifest")
                ]
                manager.enqueue(state["id"], folder, files)
                manager._queue.get_nowait(); manager._queue.task_done()
                with mock.patch.object(manager, "_run_process", return_value=0):
                    manager._execute(folder)
                final = manager.get(state["id"], "project-blocked")
                self.assertEqual(final["status"], "quality-blocked")
                self.assertIn("未登记到输出文件", final["message"])
                result = json.loads((folder / "result.json").read_text(encoding="utf-8"))
                self.assertEqual(result["ptmStageContract"]["businessStatus"], "quality_blocked")
                self.assertFalse(result["ptmStageContract"]["ptmComparisonCompleted"])
                self.assertIsNone(result["ptmStageContract"]["comparison"])
            finally:
                local_engine_tasks.TASK_ROOT = original_root
                if original_fragpipe is None:
                    os.environ.pop("FRAGPIPE_BIN", None)
                else:
                    os.environ["FRAGPIPE_BIN"] = original_fragpipe

    def test_fragpipe_command_is_fixed_headless_contract(self) -> None:
        original_fragpipe = os.environ.get("FRAGPIPE_BIN")
        with tempfile.TemporaryDirectory() as temporary:
            try:
                os.environ["FRAGPIPE_BIN"] = sys.executable
                folder = Path(temporary)
                (folder / "outputs").mkdir()
                workflow = folder / "mam.workflow"; workflow.write_text("workflow", encoding="utf-8")
                manifest = folder / "samples.manifest"; manifest.write_text("manifest", encoding="utf-8")
                command = LocalEngineTaskManager()._build_command(
                    local_engine_tasks.MODULES["post-translational-modifications"],
                    {workflow.name: workflow, manifest.name: manifest}, folder,
                    {"workflowFile": workflow.name, "manifestFile": manifest.name},
                )
                self.assertIn("--headless", command)
                self.assertIn("--workflow", command)
                self.assertIn("--manifest", command)
                self.assertIn("--workdir", command)
            finally:
                if original_fragpipe is None:
                    os.environ.pop("FRAGPIPE_BIN", None)
                else:
                    os.environ["FRAGPIPE_BIN"] = original_fragpipe

    def test_external_engine_registry_covers_all_current_modules(self) -> None:
        covered = {module_id for engine in ENGINES.values() for module_id in engine.module_ids}
        self.assertTrue({"intact-mass", "deglycosylated-intact-mass", "light-chain-mass", "heavy-chain-mass", "deglycosylated-heavy-chain-mass", "post-translational-modifications"} <= covered)
        statuses = all_engine_statuses()
        self.assertEqual({status["key"] for status in statuses}, {"unidec", "flashdeconv", "openms-sage", "fragpipe", "covalent-bonds"})
        self.assertTrue(all(status["repository"].startswith("https://github.com/") for status in statuses))
        self.assertTrue(all(status["contractVersion"] == "2.0" for status in statuses))
        self.assertTrue(all(status["available"] == status["productionAvailable"] for status in statuses))

    def test_openms_sage_status_separates_connectivity_from_regulatory_validation(self) -> None:
        status = engine_status("openms-sage")
        self.assertIn("installed", status)
        self.assertIn("detected", status)
        self.assertIn("technicalConnectivityValidated", status)
        self.assertFalse(status["regulatoryWorkflowValidated"])
        self.assertFalse(status["productionAvailable"])
        self.assertIn("onlineConfigurationLoaded", status["onlineConfiguration"])
        sage = next(item for item in status["detectionEvidence"] if item["name"] == "sage")
        self.assertEqual(sage["declaredAssetVersion"], "0.14.6")
        if sage["reportedVersion"] == "0.14.6":
            self.assertTrue(sage["versionConsistent"])
            self.assertEqual(status["versionMismatches"], [])
        self.assertIn("DecoyDatabase", status["requiredExecutables"])
        self.assertIn("sage", status["requiredExecutables"])

    def test_sage_proforma_mass_shifts_are_mapped_to_ptm_sites(self) -> None:
        clean, modifications = parse_peptide("YIC[+57.021465]DN[+0.984016]QM[+15.994915]K")
        self.assertEqual(clean, "YICDNQMK")
        self.assertEqual(modifications, [(5, "N", "Deamidation"), (7, "M", "Oxidation")])

    def test_detected_engines_are_not_mislabeled_as_production_available(self) -> None:
        openms_sage = engine_status("openms-sage")
        flashdeconv = engine_status("flashdeconv")
        for status in (openms_sage, flashdeconv):
            self.assertEqual(status["available"], status["productionAvailable"])
            self.assertFalse(status["regulatoryWorkflowValidated"])
            self.assertFalse(status["productionAvailable"])
        self.assertTrue(any("MAM" in item for item in openms_sage["regulatoryValidationGaps"]))
        self.assertTrue(any("真实mzML专项回归" in item for item in flashdeconv["regulatoryValidationGaps"]))

    def test_flashdeconv_tsv_parser_uses_external_output_columns(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "ms1.tsv"
            path.write_text("AverageMass\tMonoisotopicMass\tSumIntensity\n148058.2\t148057.2\t1000\n148058.3\t148057.2\t500\n9000\t8999\t900\n", encoding="utf-8")
            peaks = read_spectrum_tsv(path, 10000, 250000)
            self.assertEqual(peaks, [{"mass": 148057.2, "intensity": 1500.0}])

    def test_cli_timeout_terminates_process(self) -> None:
        with self.assertRaisesRegex(TimeoutError, "任务已终止"):
            run_cli([sys.executable, "-c", "import time; time.sleep(2)"], cwd=ROOT, env=dict(os.environ), timeout=1)

    def test_docx_report_contains_required_parts(self) -> None:
        payload = {
            "projectName": "生物类似药比对项目",
            "modules": [
                {"code": "IM-01", "name": "完整分子量比对", "kind": "mass", "status": "completed", "statusText": "已完成", "source": "batch", "result": {"summary": {"matchedCount": 4, "meanAbsDeltaDa": 0.3, "maxAbsDeltaPpm": 3.2, "unmatchedCandidateCount": 0}}},
                {"code": "PTM-03", "name": "翻译后修饰位点定量比对", "kind": "ptm", "status": "attention", "statusText": "需关注", "source": "single", "ptmResult": {"summary": {"referenceLotCount": 5, "outsideIntervalCount": 1, "candidateOnlyVariantCount": 1, "integrityWarningCount": 1}}},
            ],
        }
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "report.docx"
            build_project_report(payload, target)
            self.assertGreater(target.stat().st_size, 1000)
            with zipfile.ZipFile(target) as archive:
                self.assertIn("word/document.xml", archive.namelist())
                document = archive.read("word/document.xml").decode("utf-8")
                self.assertIn("完整分子量比对", document)
                self.assertIn("翻译后修饰位点定量比对", document)

    def test_submission_csv_routes_and_splits_roles(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            candidate = root / "完整分子量_候选药.csv"
            reference = root / "完整分子量_参照药.csv"
            ptm = root / "PTM位点定量.csv"
            candidate.write_text("m/z,intensity\n1000,120\n1001,80\n", encoding="utf-8")
            reference.write_text("m/z,intensity\n1000,118\n1001,82\n", encoding="utf-8")
            ptm.write_text("sample_role,lot_id,protein_chain,residue,position,modification,value_percent\n候选药,C1,HC,M,10,Oxidation,1.2\n参照药,R1,HC,M,10,Oxidation,1.0\n", encoding="utf-8")
            result = parse_submission_files([(candidate, candidate.name), (reference, reference.name), (ptm, ptm.name)])
            intact = next(route for route in result["routes"] if route["moduleId"] == "intact-mass")
            ptm_route = next(route for route in result["routes"] if route["moduleId"] == "post-translational-modifications")
            self.assertEqual(intact["status"], "ready")
            self.assertEqual(ptm_route["status"], "ready")
            self.assertIn("1000\t120", intact["candidate"]["content"])
            self.assertIn("候选药", ptm_route["candidate"]["content"])

    def test_submission_xlsx_sheet_name_routes_mass_table(self) -> None:
        def write_xlsx(path: Path, sheet_name: str) -> None:
            content_types = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'
            root_rels = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
            workbook = f'<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="{sheet_name}" sheetId="1" r:id="rId1"/></sheets></workbook>'
            workbook_rels = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'
            sheet = '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>m/z</t></is></c><c r="B1" t="inlineStr"><is><t>intensity</t></is></c></row><row r="2"><c r="A2"><v>1000</v></c><c r="B2"><v>100</v></c></row></sheetData></worksheet>'
            with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
                archive.writestr("[Content_Types].xml", content_types); archive.writestr("_rels/.rels", root_rels); archive.writestr("xl/workbook.xml", workbook); archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels); archive.writestr("xl/worksheets/sheet1.xml", sheet)
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); candidate = root / "candidate.xlsx"; reference = root / "reference.xlsx"
            write_xlsx(candidate, "脱糖完整分子量_候选药"); write_xlsx(reference, "脱糖完整分子量_参照药")
            result = parse_submission_files([(candidate, candidate.name), (reference, reference.name)])
            route = next(item for item in result["routes"] if item["moduleId"] == "deglycosylated-intact-mass")
            self.assertEqual(route["status"], "ready")
            self.assertIn("1000\t100", route["candidate"]["content"])

    def test_docx_tables_are_extracted_and_routed_with_audit_trace(self) -> None:
        document_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
        <w:p><w:r><w:t>PTM 翻译后修饰位点定量</w:t></w:r></w:p><w:tbl>
        <w:tr><w:tc><w:p><w:r><w:t>sample_role</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>lot_id</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>protein_chain</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>residue</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>position</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>modification</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>value_percent</w:t></w:r></w:p></w:tc></w:tr>
        <w:tr><w:tc><w:p><w:r><w:t>候选药</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>C1</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>HC</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>M</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>10</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Oxidation</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>1.2</w:t></w:r></w:p></w:tc></w:tr>
        <w:tr><w:tc><w:p><w:r><w:t>参照药</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>R1</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>HC</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>M</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>10</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Oxidation</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>1.0</w:t></w:r></w:p></w:tc></w:tr>
        </w:tbl></w:body></w:document>'''
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "PTM结果.docx"
            with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
                archive.writestr("word/document.xml", document_xml)
            result = parse_submission_files([(path, path.name)])
            route = next(item for item in result["routes"] if item["moduleId"] == "post-translational-modifications")
            self.assertEqual(route["status"], "ready")
            self.assertEqual(result["documentExtractions"][0]["status"], "parsed")
            self.assertEqual(result["parser"]["version"], "0.2.0")

    def test_raw_ptm_bundle_is_classified_for_openms_sage(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            names = ["reference_R1.mzML", "reference_R2.mzML", "reference_R3.mzML", "candidate_C1.mzML", "drug.fasta"]
            files = []
            for name in names:
                path = root / name; path.write_bytes(b"test"); files.append((path, name))
            result = parse_submission_files(files)
            self.assertEqual(result["rawPtmBundle"]["status"], "ready")
            self.assertEqual(len(result["rawPtmBundle"]["referenceMzmlNames"]), 3)
            self.assertEqual(result["rawPtmBundle"]["fastaName"], "drug.fasta")

    def test_brief_explanations_are_short_and_non_conclusive(self) -> None:
        mass = mass_brief_explanation({"summary": {"matchedCount": 4, "unmatchedCandidateCount": 1, "maxAbsDeltaPpm": 3.2}})
        ptm = ptm_brief_explanation({"summary": {"outsideIntervalCount": 2, "candidateOnlyVariantCount": 1, "integrityWarningCount": 0}})
        self.assertLess(len(mass), 150)
        self.assertLess(len(ptm), 150)
        self.assertIn("不构成相似性结论", mass)
        self.assertIn("不自动给出相似或不相似结论", ptm)


if __name__ == "__main__":
    unittest.main()
