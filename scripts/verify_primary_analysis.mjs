/**
 * P15 gate for the primary-structure analysis software.
 *
 * Runs the analysis-service default pytest suite (excludes `integration`) and
 * mechanically checks that the four-layer method UI still contains the analysis
 * panel, D17 banner, and result visuals. Does not start Docker or download data.
 *
 * Python lookup order: ANALYSIS_PYTHON, tools-poc/.venv, then `python` on PATH.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..");
const SERVICE_ROOT = path.join(PROJECT_ROOT, "analysis-service");
const failures = [];

function fail(message) {
  failures.push(message);
}

function findPython() {
  const candidates = [
    process.env.ANALYSIS_PYTHON,
    path.join(PROJECT_ROOT, "tools-poc", ".venv", "Scripts", "python.exe"),
    path.join(PROJECT_ROOT, "tools-poc", ".venv", "bin", "python"),
    "python",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate !== "python" && !existsSync(candidate)) {
      continue;
    }
    const probe = spawnSync(candidate, ["-c", "import sys; print(sys.executable)"], {
      encoding: "utf8",
      windowsHide: true,
    });
    if (probe.status === 0) {
      return candidate;
    }
  }
  return null;
}

function mustContain(source, needle, label) {
  if (!source.includes(needle)) {
    fail(`${label}: missing ${needle}`);
  }
}

function checkPanelStructure() {
  const selector = readFileSync(
    path.join(PROJECT_ROOT, "src", "components", "MethodSelector.tsx"),
    "utf8",
  );
  const analysisPanel = readFileSync(
    path.join(PROJECT_ROOT, "src", "components", "MethodAnalysisPanel.tsx"),
    "utf8",
  );
  const resultView = readFileSync(
    path.join(PROJECT_ROOT, "src", "components", "analysis", "AnalysisResultView.tsx"),
    "utf8",
  );
  const messages = readFileSync(path.join(PROJECT_ROOT, "src", "i18n", "messages.ts"), "utf8");

  const contentAt = selector.indexOf("<MethodContentPanel");
  const analysisAt = selector.indexOf("<MethodAnalysisPanel");
  const demoAt = selector.indexOf("<MethodLiveDemo");
  const toolsAt = selector.indexOf("<MethodToolPanel");
  if (contentAt < 0 || analysisAt < 0 || demoAt < 0 || toolsAt < 0) {
    fail("MethodSelector is missing one of the four stacked panels");
  } else if (!(contentAt < analysisAt && analysisAt < demoAt && demoAt < toolsAt)) {
    fail(
      "MethodSelector stack order must be Content → Analysis → LiveDemo → Tool",
    );
  }

  mustContain(
    analysisPanel,
    'config.status === "analyzable"',
    "MethodAnalysisPanel workflow gate",
  );
  mustContain(
    analysisPanel,
    "sheet3RuleUndefined",
    "MethodAnalysisPanel D17 banner",
  );
  mustContain(analysisPanel, "<ImageAxisCalibrationPicker", "MethodAnalysisPanel two-point calibration");
  mustContain(analysisPanel, "imageCalibration", "MethodAnalysisPanel sends imageCalibration");
  mustContain(resultView, "imagePeakHasAxis", "AnalysisResultView calibrated peak axis values");
  mustContain(resultView, "MirrorMassPlot", "AnalysisResultView");
  mustContain(resultView, "ChromatogramOverlayPlot", "AnalysisResultView");
  mustContain(resultView, "SequenceCoveragePlot", "AnalysisResultView");
  mustContain(resultView, "FragmentIonPlot", "AnalysisResultView");
  mustContain(resultView, "PeakMatchTable", "AnalysisResultView");
  mustContain(resultView, "imageComparison", "AnalysisResultView dual-layer image comparison");
  mustContain(resultView, "qualityGates", "AnalysisResultView quality gates");
  mustContain(resultView, "v2RuleConditionsTitle", "AnalysisResultView V2 rule conditions");
  mustContain(resultView, "AnalysisProvenancePanel", "AnalysisResultView");
  mustContain(
    messages,
    "Sheet3 未定义该项程序规则",
    "messages.ts zh D17 copy",
  );
}

function runPytest(pythonExecutable) {
  const result = spawnSync(
    pythonExecutable,
    ["-m", "pytest", "tests/", "-q"],
    {
      cwd: SERVICE_ROOT,
      encoding: "utf8",
      windowsHide: true,
      timeout: 180000,
    },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    fail(`pytest exited ${result.status}`);
  }
  if (!/\d+ passed/.test(output)) {
    fail("pytest output did not report a passed count");
  }
  return output;
}

function main() {
  console.log("Primary-structure analysis verification (P15)");
  console.log("---------------------------------------------");

  checkPanelStructure();

  const pythonExecutable = findPython();
  if (!pythonExecutable) {
    fail("no Python interpreter found (set ANALYSIS_PYTHON or use tools-poc/.venv)");
  } else {
    console.log(`python                      : ${pythonExecutable}`);
    runPytest(pythonExecutable);
  }

  console.log(`panel structure failures     : ${failures.filter((item) => !item.startsWith("pytest") && !item.startsWith("no Python")).length}`);
  console.log(`failures                     : ${failures.length}`);
  for (const failure of failures) {
    console.log(`  FAIL  ${failure}`);
  }

  if (failures.length === 0) {
    console.log("");
    console.log("Default pytest suite and analysis-panel structure checks passed.");
    console.log("Integration tests (Docker RAW conversion / Comet on RAW) stay opt-in:");
    console.log("  pytest -m integration");
  }

  return failures.length === 0 ? 0 : 1;
}

process.exit(main());
