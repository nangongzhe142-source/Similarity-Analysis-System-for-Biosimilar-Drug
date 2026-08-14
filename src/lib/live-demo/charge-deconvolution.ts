/**
 * In-browser charge-state envelope synthesis and a textbook charge
 * deconvolution: recover the neutral mass from the m/z spacing of adjacent
 * peaks. This is the same physical relation UniDec uses, not UniDec itself.
 *
 * Synthetic spectra are labelled as such. Recovered mass is compared with
 * the theoretical mass from protein-mass.ts.
 */

export const PROTON_MASS = 1.007276467;
export const DEFAULT_CHARGE_MIN = 30;
export const DEFAULT_CHARGE_MAX = 60;
export const DEFAULT_CHARGE_CENTER = 45;
export const DEFAULT_CHARGE_ENVELOPE_WIDTH = 7;
export const MASS_RECOVERY_TOLERANCE_DA = 5;

export interface ChargePeak {
  charge: number;
  mz: number;
  intensity: number;
}

export interface DeconvolutionResult {
  peaks: ChargePeak[];
  recoveredMassDa: number;
  inferredChargeOfBasePeak: number;
  theoreticalMassDa: number;
  deviationDa: number;
  deviationPpm: number;
  withinTolerance: boolean;
}

export function synthesizeChargeEnvelope(
  theoreticalMassDa: number,
  chargeMin = DEFAULT_CHARGE_MIN,
  chargeMax = DEFAULT_CHARGE_MAX,
): ChargePeak[] {
  const peaks: ChargePeak[] = [];
  for (let charge = chargeMin; charge <= chargeMax; charge += 1) {
    const mz = (theoreticalMassDa + charge * PROTON_MASS) / charge;
    const intensity = Math.exp(
      -0.5 * ((charge - DEFAULT_CHARGE_CENTER) / DEFAULT_CHARGE_ENVELOPE_WIDTH) ** 2,
    );
    peaks.push({ charge, mz, intensity });
  }
  return peaks;
}

/**
 * Recover the neutral mass from m/z peak spacing without using the charge
 * labels that were used to generate the peaks. Adjacent ESI peaks of the
 * same species satisfy z ≈ mz_next / (mz_current − mz_next).
 */
export function recoverNeutralMass(peaks: ChargePeak[]): { massDa: number; chargeOfBasePeak: number } {
  const sortedByMz = [...peaks].sort((left, right) => left.mz - right.mz);
  const basePeak = peaks.reduce((current, candidate) =>
    candidate.intensity > current.intensity ? candidate : current,
  );
  const baseIndex = sortedByMz.findIndex((peak) => peak.mz === basePeak.mz);
  if (baseIndex < 0 || baseIndex === sortedByMz.length - 1) {
    throw new Error("无法从电荷态包络恢复质量：缺少相邻峰");
  }
  const nextPeak = sortedByMz[baseIndex + 1];
  const mzGap = nextPeak.mz - basePeak.mz;
  if (!(mzGap > 0)) {
    throw new Error("相邻峰 m/z 间距无效");
  }
  const inferredCharge = Math.round(nextPeak.mz / mzGap);
  if (inferredCharge < 1) {
    throw new Error("推断电荷态无效");
  }
  const massDa = inferredCharge * basePeak.mz - inferredCharge * PROTON_MASS;
  return { massDa, chargeOfBasePeak: inferredCharge };
}

export function deconvolveAgainstTheory(theoreticalMassDa: number): DeconvolutionResult {
  const peaks = synthesizeChargeEnvelope(theoreticalMassDa);
  const recovered = recoverNeutralMass(peaks);
  const deviationDa = recovered.massDa - theoreticalMassDa;
  return {
    peaks,
    recoveredMassDa: recovered.massDa,
    inferredChargeOfBasePeak: recovered.chargeOfBasePeak,
    theoreticalMassDa,
    deviationDa,
    deviationPpm: (1e6 * deviationDa) / theoreticalMassDa,
    withinTolerance: Math.abs(deviationDa) <= MASS_RECOVERY_TOLERANCE_DA,
  };
}
