/** Operator two-point axis calibration for image-only analysis (P24).

The analysis service is the source of the gate: two points, pixel span ≥ 20,
distinct axis values. This module only builds the payload the adapter already
reads as `parameters.imageCalibration`. Incomplete input is omitted rather than
guessed.
*/

export const IMAGE_CALIBRATION_MIN_POINTS = 2;
export const IMAGE_CALIBRATION_MIN_PIXEL_SPAN = 20;

export const FIGURE_IMAGE_SUFFIX = /\.(png|jpe?g|webp|tif|tiff|bmp)$/i;

export type ImageAxisKind = "mass-da" | "mz-da" | "rt-min";

export interface ImageAxisPreset {
  id: ImageAxisKind;
  axisName: string;
  unit: string;
}

export const IMAGE_AXIS_PRESETS: readonly ImageAxisPreset[] = [
  { id: "mass-da", axisName: "mass", unit: "Da" },
  { id: "mz-da", axisName: "m/z", unit: "Da" },
  { id: "rt-min", axisName: "rt", unit: "min" },
];

export interface ImageCalibrationAnchor {
  pixel: number;
  displayY: number;
  axisValueText: string;
}

export interface ImageCalibrationPayload {
  axisName: string;
  unit: string;
  points: Array<{ pixel: number; axisValue: number }>;
}

export function isFigureImageFileName(fileName: string | undefined): boolean {
  if (!fileName) {
    return false;
  }
  return FIGURE_IMAGE_SUFFIX.test(fileName);
}

export function defaultImageAxisKind(profileId: string | undefined): ImageAxisKind {
  if (profileId === "peptide-map") {
    return "rt-min";
  }
  return "mass-da";
}

export function clickToNaturalPixel(
  clientX: number,
  clientY: number,
  rect: { left: number; width: number; top: number; height: number },
  naturalWidth: number,
  naturalHeight: number,
): { x: number; y: number } | null {
  if (naturalWidth < 1 || naturalHeight < 1 || rect.width < 1 || rect.height < 1) {
    return null;
  }
  const x = ((clientX - rect.left) / rect.width) * naturalWidth;
  const y = ((clientY - rect.top) / rect.height) * naturalHeight;
  return {
    x: Math.max(0, Math.min(naturalWidth - 1, x)),
    y: Math.max(0, Math.min(naturalHeight - 1, y)),
  };
}

function parsedAxisValue(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }
  return value;
}

export function imageCalibrationPayload(
  preset: ImageAxisPreset,
  anchors: ImageCalibrationAnchor[],
): ImageCalibrationPayload | null {
  if (anchors.length < IMAGE_CALIBRATION_MIN_POINTS) {
    return null;
  }
  const first = parsedAxisValue(anchors[0].axisValueText);
  const second = parsedAxisValue(anchors[1].axisValueText);
  if (first === null || second === null) {
    return null;
  }
  if (first === second) {
    return null;
  }
  const span = Math.abs(anchors[1].pixel - anchors[0].pixel);
  if (span < IMAGE_CALIBRATION_MIN_PIXEL_SPAN) {
    return null;
  }
  return {
    axisName: preset.axisName,
    unit: preset.unit,
    points: [
      { pixel: anchors[0].pixel, axisValue: first },
      { pixel: anchors[1].pixel, axisValue: second },
    ],
  };
}
