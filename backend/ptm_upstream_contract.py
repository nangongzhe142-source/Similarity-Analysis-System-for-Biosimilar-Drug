"""Deterministic PTM upstream evidence-state contract.

This module does not parse spectra, calculate FDR, localize modifications,
integrate XIC peaks, or build intervals.  It only decides which business state
is allowed from evidence produced by validated professional components.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal


PTMBusinessStatus = Literal[
    "upstream_completed",
    "awaiting_quality_gate",
    "awaiting_quantification",
    "awaiting_interval",
    "quality_blocked",
    "completed",
]


@dataclass(frozen=True)
class GateEvidence:
    evaluated: bool = False
    passed: bool | None = None
    details: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.evaluated and self.passed is not None:
            raise ValueError("未评估的质量门槛不能声明通过或失败")
        if self.evaluated and self.passed is None:
            raise ValueError("已评估的质量门槛必须明确通过或失败")


@dataclass(frozen=True)
class FragPipePTMEvidence:
    upstream_execution_completed: bool
    output_artifacts_detected: bool
    output_contract_parsed: bool = False
    fdr: GateEvidence = field(default_factory=GateEvidence)
    localization: GateEvidence = field(default_factory=GateEvidence)
    system_suitability: GateEvidence = field(default_factory=GateEvidence)
    quantification: GateEvidence = field(default_factory=GateEvidence)
    unified_ptm_table_validated: bool = False
    interval_completed: bool = False
    comparison: dict[str, Any] | None = None


@dataclass(frozen=True)
class PTMContractDecision:
    business_status: PTMBusinessStatus
    ptm_comparison_completed: bool
    comparison: dict[str, Any] | None
    next_required_gate: str | None
    blocking_reasons: tuple[str, ...]
    evidence: dict[str, Any]
    disclaimer: str = (
        "Upstream execution does not constitute PTM comparison or a biosimilarity conclusion."
    )

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["businessStatus"] = payload.pop("business_status")
        payload["ptmComparisonCompleted"] = payload.pop("ptm_comparison_completed")
        payload["nextRequiredGate"] = payload.pop("next_required_gate")
        payload["blockingReasons"] = list(payload.pop("blocking_reasons"))
        return payload


def _decision(
    evidence: FragPipePTMEvidence,
    status: PTMBusinessStatus,
    *,
    next_gate: str | None = None,
    blocking: tuple[str, ...] = (),
) -> PTMContractDecision:
    completed = status == "completed"
    if completed and evidence.comparison is None:
        raise ValueError("PTM业务完成必须包含区间比较结果")
    return PTMContractDecision(
        business_status=status,
        ptm_comparison_completed=completed,
        comparison=evidence.comparison if completed else None,
        next_required_gate=next_gate,
        blocking_reasons=blocking,
        evidence=asdict(evidence),
    )


def evaluate_fragpipe_ptm_evidence(evidence: FragPipePTMEvidence) -> PTMContractDecision:
    """Return the only PTM business state allowed by the supplied evidence."""

    if evidence.interval_completed and evidence.comparison is None:
        raise ValueError("interval_completed不能在没有comparison时为true")
    if evidence.comparison is not None and not evidence.interval_completed:
        raise ValueError("区间尚未完成时不得附带comparison")
    if not evidence.upstream_execution_completed:
        raise ValueError("上游程序尚未完成，不能评估PTM下游合同")
    if not evidence.output_artifacts_detected:
        return _decision(
            evidence,
            "quality_blocked",
            blocking=("FragPipe返回成功但没有登记到上游输出产物",),
        )
    if not evidence.output_contract_parsed:
        return _decision(evidence, "upstream_completed", next_gate="output_contract_parsing")

    quality_gates = (
        ("fdr", evidence.fdr, "FDR未通过预设门槛"),
        ("localization", evidence.localization, "修饰定位概率未通过预设门槛"),
        ("system_suitability", evidence.system_suitability, "系统适用性未通过预设门槛"),
    )
    failures = tuple(message for _, gate, message in quality_gates if gate.evaluated and gate.passed is False)
    if failures:
        return _decision(evidence, "quality_blocked", blocking=failures)
    waiting_quality = next((name for name, gate, _ in quality_gates if not gate.evaluated), None)
    if waiting_quality:
        return _decision(evidence, "awaiting_quality_gate", next_gate=waiting_quality)

    if evidence.quantification.evaluated and evidence.quantification.passed is False:
        return _decision(evidence, "quality_blocked", blocking=("XIC定量未通过LOQ、积分或干扰门槛",))
    if not evidence.quantification.evaluated or not evidence.unified_ptm_table_validated:
        next_gate = "xic_quantification" if not evidence.quantification.evaluated else "unified_ptm_table_validation"
        return _decision(evidence, "awaiting_quantification", next_gate=next_gate)

    if not evidence.interval_completed:
        return _decision(evidence, "awaiting_interval", next_gate="multi_lot_reference_interval")
    return _decision(evidence, "completed")
