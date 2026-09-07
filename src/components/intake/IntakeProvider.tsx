"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { characterizationItems } from "@/data/characterization-items";
import {
  applyRegionRecordsToEntries,
  createEmptySponsorEntries,
  regionCanSendToAnalysis,
  visionRegionsToRecords,
} from "@/lib/screen-intake/session-rules";
import { sanitizeVisionExtractResponse } from "@/lib/screen-intake/vision-contract";
import type { ImageCalibrationPayload } from "@/lib/image-axis-calibration";
import type {
  IntakeRole,
  IntakeSession,
  LotRole,
  ScreenExtractStatus,
  ScreenFrame,
  ScreenRegionRecord,
  SponsorItemEntry,
} from "@/types/intake";

const ROLE_STORAGE_KEY = "biosimilar-intake.role";
const ROLE_CHANGE_EVENT = "biosimilar-intake:role-change";
const CHARACTERIZATION_ITEM_IDS = characterizationItems.map((item) => item.id);
const KNOWN_ITEM_IDS = new Set(CHARACTERIZATION_ITEM_IDS);

type SponsorFiles = { candidate: File | null; reference: File | null };

export interface IntakeVisionStatus {
  configured: boolean;
  mockEnabled: boolean;
}

interface IntakeContextValue {
  session: IntakeSession;
  role: IntakeRole | null;
  visionStatus: IntakeVisionStatus | null;
  filesRevision: number;
  setRole: (role: IntakeRole) => void;
  addCapturedFrame: (file: File) => string;
  extractFrame: (frameId: string) => Promise<void>;
  getFrameFile: (frameId: string) => File | null;
  assignRegionItem: (regionId: string, itemId: string | null) => void;
  assignRegionRole: (regionId: string, role: LotRole | null) => void;
  confirmRegion: (regionId: string) => void;
  rejectRegion: (regionId: string) => void;
  confirmAllScreenDrafts: () => void;
  setRegionCalibration: (regionId: string, payload: ImageCalibrationPayload | null) => void;
  getRegionCalibration: (regionId: string) => ImageCalibrationPayload | null;
  regionReadyForAnalysis: (regionId: string) => boolean;
  prepareRegionForAnalysis: (regionId: string) => boolean;
  updateSponsorEntry: (itemId: string, patch: Partial<SponsorItemEntry>) => void;
  setSponsorFile: (itemId: string, role: LotRole, file: File | null) => void;
  getSponsorFiles: (itemId: string) => SponsorFiles;
  getConfirmedFigures: (itemId: string) => SponsorFiles;
}

const IntakeContext = createContext<IntakeContextValue | null>(null);

function isIntakeRole(value: string | null): value is IntakeRole {
  return value === "reviewer" || value === "sponsor";
}

function subscribeToRole(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ROLE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ROLE_CHANGE_EVENT, onStoreChange);
  };
}

let memoryRole: IntakeRole | null = null;

function readStoredRole(): IntakeRole | null {
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (isIntakeRole(stored)) {
      memoryRole = stored;
      return stored;
    }
  } catch {
    return memoryRole;
  }
  return memoryRole;
}

function getRoleSnapshot(): IntakeRole | null {
  return readStoredRole();
}

function getServerRoleSnapshot(): IntakeRole | null {
  return null;
}

function newId(): string {
  return crypto.randomUUID();
}

function emptyFiles(): SponsorFiles {
  return { candidate: null, reference: null };
}

function allRegions(frames: ScreenFrame[]): ScreenRegionRecord[] {
  return frames.flatMap((frame) => frame.regions);
}

export function IntakeProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribeToRole, getRoleSnapshot, getServerRoleSnapshot);
  const [frames, setFrames] = useState<ScreenFrame[]>([]);
  const [sponsorEntries, setSponsorEntries] = useState<Record<string, SponsorItemEntry>>(() =>
    createEmptySponsorEntries(CHARACTERIZATION_ITEM_IDS),
  );
  const [unmatchedRegions, setUnmatchedRegions] = useState<IntakeSession["unmatchedRegions"]>([]);
  const [visionStatus, setVisionStatus] = useState<IntakeVisionStatus | null>(null);
  const [calibrationByRegionId, setCalibrationByRegionId] = useState<
    Record<string, ImageCalibrationPayload>
  >({});
  const [fileEpoch, setFileEpoch] = useState(0);
  const frameFilesRef = useRef<Record<string, File>>({});
  const sponsorFilesRef = useRef<Record<string, SponsorFiles>>({});
  const confirmedFiguresRef = useRef<Record<string, SponsorFiles>>({});
  const objectUrlsRef = useRef<string[]>([]);
  const sessionIdRef = useRef("");

  useEffect(() => {
    document.documentElement.setAttribute("data-intake-ready", "1");
    return () => {
      document.documentElement.removeAttribute("data-intake-ready");
    };
  }, []);

  useEffect(() => {
    if (role) {
      document.documentElement.setAttribute("data-intake-role", role);
    } else {
      document.documentElement.removeAttribute("data-intake-role");
    }
    return () => {
      document.documentElement.removeAttribute("data-intake-role");
    };
  }, [role]);

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
    let cancelled = false;
    void fetch("/api/screen-intake/extract", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return { configured: false, mockEnabled: false };
        }
        return (await response.json()) as IntakeVisionStatus;
      })
      .then((status) => {
        if (!cancelled) {
          setVisionStatus(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisionStatus({ configured: false, mockEnabled: false });
        }
      });
    return () => {
      cancelled = true;
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      objectUrlsRef.current = [];
    };
  }, []);

  const bumpFiles = useCallback(() => {
    setFileEpoch((value) => value + 1);
  }, []);

  const setRole = useCallback((next: IntakeRole) => {
    memoryRole = next;
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, next);
    } catch {
      // Storage may be blocked in a fresh automation profile; keep the in-memory role.
    }
    window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
  }, []);

  const addCapturedFrame = useCallback((file: File): string => {
    const id = newId();
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objectUrl);
    frameFilesRef.current[id] = file;
    const frame: ScreenFrame = {
      id,
      capturedAt: new Date().toISOString(),
      mimeType: "image/png",
      objectUrl,
      extractStatus: "queued",
      regions: [],
    };
    setFrames((current) => [...current, frame]);
    return id;
  }, []);

  const extractFrame = useCallback(
    async (frameId: string) => {
      const file = frameFilesRef.current[frameId];
      if (!file) {
        return;
      }
      const canCall =
        visionStatus === null
          ? true
          : visionStatus.configured === true || visionStatus.mockEnabled === true;
      if (visionStatus !== null && !canCall) {
        setFrames((current) =>
          current.map((frame) =>
            frame.id === frameId
              ? { ...frame, extractStatus: "skipped" as ScreenExtractStatus }
              : frame,
          ),
        );
        return;
      }
      setFrames((current) =>
        current.map((frame) =>
          frame.id === frameId
            ? { ...frame, extractStatus: "running", extractError: undefined }
            : frame,
        ),
      );
      const form = new FormData();
      form.append("image", file);
      form.append("sessionId", sessionIdRef.current);
      try {
        const response = await fetch("/api/screen-intake/extract", {
          method: "POST",
          body: form,
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: { code?: string };
          } | null;
          throw new Error(body?.error?.code ?? "EXTRACT_FAILED");
        }
        const raw: unknown = await response.json();
        const sanitized = sanitizeVisionExtractResponse(raw, KNOWN_ITEM_IDS);
        const records = visionRegionsToRecords(frameId, sanitized.regions, newId);
        setSponsorEntries((current) => applyRegionRecordsToEntries(current, records).entries);
        setUnmatchedRegions((current) => [
          ...current,
          ...records
            .filter((region) => region.itemId === null)
            .map((region) => ({ regionId: region.id, frameId: region.frameId })),
        ]);
        setFrames((current) =>
          current.map((frame) =>
            frame.id === frameId
              ? { ...frame, extractStatus: "succeeded", regions: records }
              : frame,
          ),
        );
      } catch (error) {
        const code = error instanceof Error ? error.message : "EXTRACT_FAILED";
        setFrames((current) =>
          current.map((frame) =>
            frame.id === frameId
              ? { ...frame, extractStatus: "failed", extractError: code }
              : frame,
          ),
        );
      }
    },
    [visionStatus],
  );

  const getFrameFile = useCallback((frameId: string): File | null => {
    return frameFilesRef.current[frameId] ?? null;
  }, []);

  const patchRegion = useCallback(
    (regionId: string, patch: Partial<ScreenRegionRecord>) => {
      setFrames((current) =>
        current.map((frame) => ({
          ...frame,
          regions: frame.regions.map((region) =>
            region.id === regionId ? { ...region, ...patch } : region,
          ),
        })),
      );
    },
    [],
  );

  const assignRegionItem = useCallback(
    (regionId: string, itemId: string | null) => {
      const safeItemId =
        itemId !== null && KNOWN_ITEM_IDS.has(itemId) ? itemId : null;
      patchRegion(regionId, { itemId: safeItemId });
      setUnmatchedRegions((current) => {
        const without = current.filter((entry) => entry.regionId !== regionId);
        if (safeItemId === null) {
          const frame = frames.find((entry) =>
            entry.regions.some((region) => region.id === regionId),
          );
          if (frame) {
            return [...without, { regionId, frameId: frame.id }];
          }
        }
        return without;
      });
    },
    [frames, patchRegion],
  );

  const assignRegionRole = useCallback(
    (regionId: string, lotRole: LotRole | null) => {
      patchRegion(regionId, { assignedLotRole: lotRole });
    },
    [patchRegion],
  );

  const confirmRegion = useCallback(
    (regionId: string) => {
      const region = allRegions(frames).find((entry) => entry.id === regionId);
      if (!region || region.itemId === null || !KNOWN_ITEM_IDS.has(region.itemId)) {
        return;
      }
      patchRegion(regionId, { reviewState: "confirmed" });
      setUnmatchedRegions((current) =>
        current.filter((entry) => entry.regionId !== regionId),
      );
      if (region.kind === "table" && region.lots.length > 0) {
        setSponsorEntries((current) => {
          const existing = current[region.itemId as string];
          if (!existing) {
            return current;
          }
          return {
            ...current,
            [region.itemId as string]: {
              ...existing,
              unit: region.lots[0]?.unit || existing.unit,
              lots: region.lots.map((lot) => ({
                role: lot.role,
                lotId: lot.lotId,
                value: lot.value,
                unit: lot.unit ?? existing.unit,
              })),
              notes: region.note ?? existing.notes,
              reviewState: "confirmed",
              source: "screen-capture",
            },
          };
        });
      }
      const frameFile = frameFilesRef.current[region.frameId];
      if (region.kind === "spectrum" && frameFile && region.assignedLotRole) {
        const itemId = region.itemId;
        const current = confirmedFiguresRef.current[itemId] ?? emptyFiles();
        confirmedFiguresRef.current[itemId] = {
          ...current,
          [region.assignedLotRole]: frameFile,
        };
        bumpFiles();
      }
    },
    [bumpFiles, frames, patchRegion],
  );

  const rejectRegion = useCallback(
    (regionId: string) => {
      patchRegion(regionId, { reviewState: "rejected" });
      setUnmatchedRegions((current) =>
        current.filter((entry) => entry.regionId !== regionId),
      );
    },
    [patchRegion],
  );

  const confirmAllScreenDrafts = useCallback(() => {
    setFrames((current) =>
      current.map((frame) => ({
        ...frame,
        regions: frame.regions.map((region) =>
          region.reviewState === "draft" && region.itemId !== null
            ? { ...region, reviewState: "confirmed" }
            : region,
        ),
      })),
    );
    setSponsorEntries((current) => {
      const next = { ...current };
      for (const [itemId, entry] of Object.entries(current)) {
        if (entry.source === "screen-capture" && entry.reviewState === "draft") {
          next[itemId] = { ...entry, reviewState: "confirmed" };
        }
      }
      return next;
    });
  }, []);

  const setRegionCalibration = useCallback(
    (regionId: string, payload: ImageCalibrationPayload | null) => {
      setCalibrationByRegionId((current) => {
        if (payload === null) {
          const next = { ...current };
          delete next[regionId];
          return next;
        }
        return { ...current, [regionId]: payload };
      });
    },
    [],
  );

  const getRegionCalibration = useCallback(
    (regionId: string): ImageCalibrationPayload | null => {
      return calibrationByRegionId[regionId] ?? null;
    },
    [calibrationByRegionId],
  );

  const regionReadyForAnalysis = useCallback(
    (regionId: string): boolean => {
      const region = allRegions(frames).find((entry) => entry.id === regionId);
      if (!region) {
        return false;
      }
      return regionCanSendToAnalysis(region, calibrationByRegionId[regionId] !== undefined);
    },
    [calibrationByRegionId, frames],
  );

  const prepareRegionForAnalysis = useCallback(
    (regionId: string): boolean => {
      const region = allRegions(frames).find((entry) => entry.id === regionId);
      if (!region || !regionReadyForAnalysis(regionId) || region.itemId === null) {
        return false;
      }
      const file = frameFilesRef.current[region.frameId];
      if (!file) {
        return false;
      }
      const slot = region.assignedLotRole ?? "candidate";
      const current = confirmedFiguresRef.current[region.itemId] ?? emptyFiles();
      confirmedFiguresRef.current[region.itemId] = { ...current, [slot]: file };
      bumpFiles();
      return true;
    },
    [bumpFiles, frames, regionReadyForAnalysis],
  );

  const updateSponsorEntry = useCallback((itemId: string, patch: Partial<SponsorItemEntry>) => {
    if (!KNOWN_ITEM_IDS.has(itemId)) {
      return;
    }
    setSponsorEntries((current) => {
      const existing = current[itemId];
      if (!existing) {
        return current;
      }
      return {
        ...current,
        [itemId]: { ...existing, ...patch, itemId },
      };
    });
  }, []);

  const setSponsorFile = useCallback(
    (itemId: string, lotRole: LotRole, file: File | null) => {
      if (!KNOWN_ITEM_IDS.has(itemId)) {
        return;
      }
      const current = sponsorFilesRef.current[itemId] ?? emptyFiles();
      sponsorFilesRef.current[itemId] = { ...current, [lotRole]: file };
      const fileName = file?.name;
      setSponsorEntries((entries) => {
        const existing = entries[itemId];
        if (!existing) {
          return entries;
        }
        return {
          ...entries,
          [itemId]: {
            ...existing,
            candidateFileName:
              lotRole === "candidate" ? fileName : existing.candidateFileName,
            referenceFileName:
              lotRole === "reference" ? fileName : existing.referenceFileName,
            source: "sponsor-upload",
          },
        };
      });
      bumpFiles();
    },
    [bumpFiles],
  );

  const getSponsorFiles = useCallback((itemId: string): SponsorFiles => {
    return sponsorFilesRef.current[itemId] ?? emptyFiles();
  }, []);

  const getConfirmedFigures = useCallback((itemId: string): SponsorFiles => {
    const fromScreen = confirmedFiguresRef.current[itemId] ?? emptyFiles();
    const fromSponsor = sponsorFilesRef.current[itemId] ?? emptyFiles();
    return {
      candidate: fromScreen.candidate ?? fromSponsor.candidate,
      reference: fromScreen.reference ?? fromSponsor.reference,
    };
  }, []);

  const session = useMemo<IntakeSession>(
    () => ({
      role,
      frames,
      sponsorEntries,
      unmatchedRegions,
    }),
    [frames, role, sponsorEntries, unmatchedRegions],
  );

  const value = useMemo<IntakeContextValue>(
    () => ({
      session,
      role,
      visionStatus,
      filesRevision: fileEpoch,
      setRole,
      addCapturedFrame,
      extractFrame,
      getFrameFile,
      assignRegionItem,
      assignRegionRole,
      confirmRegion,
      rejectRegion,
      confirmAllScreenDrafts,
      setRegionCalibration,
      getRegionCalibration,
      regionReadyForAnalysis,
      prepareRegionForAnalysis,
      updateSponsorEntry,
      setSponsorFile,
      getSponsorFiles,
      getConfirmedFigures,
    }),
    [
      addCapturedFrame,
      assignRegionItem,
      assignRegionRole,
      confirmAllScreenDrafts,
      confirmRegion,
      extractFrame,
      fileEpoch,
      getConfirmedFigures,
      getFrameFile,
      getRegionCalibration,
      getSponsorFiles,
      prepareRegionForAnalysis,
      regionReadyForAnalysis,
      rejectRegion,
      role,
      session,
      setRegionCalibration,
      setRole,
      setSponsorFile,
      updateSponsorEntry,
      visionStatus,
    ],
  );

  return <IntakeContext.Provider value={value}>{children}</IntakeContext.Provider>;
}

export function useIntake(): IntakeContextValue {
  const value = useContext(IntakeContext);
  if (value === null) {
    throw new Error("useIntake must be used within IntakeProvider");
  }
  return value;
}
