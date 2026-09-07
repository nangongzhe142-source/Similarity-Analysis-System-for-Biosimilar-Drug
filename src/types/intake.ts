/**
 * Intake session types for reviewer screen-capture and sponsor per-item entry.
 * Independent of AnalysisResult. Do not feed these fields into the analysis
 * contract or the comprehensive-assessment demoStatus roll-up.
 */

export const INTAKE_SOURCE_SCREEN_CAPTURE = "screen-capture" as const;
export const INTAKE_SOURCE_SPONSOR_UPLOAD = "sponsor-upload" as const;
export const INTAKE_EXTRACTOR_VISION_API = "vision-api" as const;

export type IntakeSource =
  | typeof INTAKE_SOURCE_SCREEN_CAPTURE
  | typeof INTAKE_SOURCE_SPONSOR_UPLOAD;

export type IntakeExtractor = typeof INTAKE_EXTRACTOR_VISION_API;

export type IntakeRole = "reviewer" | "sponsor";

export type LotRole = "reference" | "candidate";

export type IntakeReviewState = "draft" | "confirmed" | "rejected";

export type ScreenRegionKind = "table" | "spectrum" | "other";

export type ScreenExtractStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export interface LotNumericRow {
  role: LotRole;
  lotId: string;
  value: number;
  unit: string;
}

export interface VisionLotDraft {
  role: LotRole;
  lotId: string;
  value: number;
  unit?: string;
}

export interface VisionRegion {
  kind: ScreenRegionKind;
  itemId: string | null;
  confidence: number;
  text?: string;
  lots?: VisionLotDraft[];
  note?: string;
}

export interface VisionExtractResponse {
  regions: VisionRegion[];
}

export interface SponsorItemEntry {
  itemId: string;
  omitted: boolean;
  omitReason: string;
  unit: string;
  lots: LotNumericRow[];
  notes: string;
  candidateFileName?: string;
  referenceFileName?: string;
  reviewState: IntakeReviewState;
  source: IntakeSource;
}

export interface ScreenRegionRecord {
  id: string;
  frameId: string;
  kind: ScreenRegionKind;
  itemId: string | null;
  confidence: number;
  text?: string;
  lots: VisionLotDraft[];
  note?: string;
  assignedLotRole: LotRole | null;
  reviewState: IntakeReviewState;
  extractor: IntakeExtractor;
  source: typeof INTAKE_SOURCE_SCREEN_CAPTURE;
}

export interface ScreenFrame {
  id: string;
  capturedAt: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  objectUrl: string;
  extractStatus: ScreenExtractStatus;
  extractError?: string;
  regions: ScreenRegionRecord[];
}

export interface UnmatchedRegionRef {
  regionId: string;
  frameId: string;
}

export interface IntakeSession {
  role: IntakeRole | null;
  frames: ScreenFrame[];
  sponsorEntries: Record<string, SponsorItemEntry>;
  unmatchedRegions: UnmatchedRegionRef[];
}
