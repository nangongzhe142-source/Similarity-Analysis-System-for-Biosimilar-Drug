"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { methodAnalysisConfigByMethodId } from "@/data/method-analysis-config";
import {
  AnalysisServiceError,
  checkAnalysisServiceHealth,
  createAnalysisJob,
  pollAnalysisJob,
  startAnalysisJob,
  uploadAnalysisFile,
} from "@/lib/analysis-service-client";
import {
  computableItemIds,
  firstAnalyzableMethodId,
  isComputableItemId,
} from "@/lib/workbench/name-match";

export type WorkbenchRunStatus =
  | "not-started"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "planned";

export type WorkbenchDispatchMode = "parallel" | "serial";
export type WorkbenchTheme = "light" | "dark";

export interface WorkbenchItemFiles {
  candidate: File | null;
  reference: File | null;
}

export interface WorkbenchItemRun {
  status: WorkbenchRunStatus;
  progress: number;
  message: string;
  startedAt?: string;
  updatedAt?: string;
  source?: "batch" | "single";
}

const EMPTY_FILES: WorkbenchItemFiles = { candidate: null, reference: null };
const EMPTY_RUN: WorkbenchItemRun = {
  status: "not-started",
  progress: 0,
  message: "",
};

interface WorkbenchContextValue {
  filesByItemId: Record<string, WorkbenchItemFiles>;
  runStatusByItemId: Record<string, WorkbenchItemRun>;
  dispatchMode: WorkbenchDispatchMode;
  batchRunning: boolean;
  theme: WorkbenchTheme;
  error: string | null;
  errorDetail: string | null;
  engineOnline: boolean | null;
  setDispatchMode: (mode: WorkbenchDispatchMode) => void;
  setTheme: (theme: WorkbenchTheme) => void;
  setItemFile: (itemId: string, role: "candidate" | "reference", file: File | null) => void;
  clearError: () => void;
  runItem: (itemId: string, source?: "batch" | "single") => Promise<void>;
  runAll: () => Promise<void>;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);
const THEME_STORAGE_KEY = "biocompare.theme";

function nowIso(): string {
  return new Date().toISOString();
}

export function itemFilesAreReady(files: WorkbenchItemFiles | undefined): boolean {
  return Boolean(files?.candidate && files?.reference);
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [filesByItemId, setFilesByItemId] = useState<Record<string, WorkbenchItemFiles>>({});
  const [runStatusByItemId, setRunStatusByItemId] = useState<Record<string, WorkbenchItemRun>>(
    {},
  );
  const [dispatchMode, setDispatchMode] = useState<WorkbenchDispatchMode>("parallel");
  const [batchRunning, setBatchRunning] = useState(false);
  const [theme, setThemeState] = useState<WorkbenchTheme>("light");
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [engineOnline, setEngineOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = stored;
    const frame = window.requestAnimationFrame(() => setThemeState(stored));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const HEALTH_RETRY_MS = 4000;

    const ping = () => {
      checkAnalysisServiceHealth()
        .then((online) => {
          if (cancelled) return;
          setEngineOnline(online);
          if (!online) {
            retryTimer = setTimeout(ping, HEALTH_RETRY_MS);
          }
        })
        .catch(() => {
          if (cancelled) return;
          setEngineOnline(false);
          retryTimer = setTimeout(ping, HEALTH_RETRY_MS);
        });
    };
    ping();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };
  }, []);

  const setTheme = useCallback((next: WorkbenchTheme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
  }, []);

  const setItemFile = useCallback(
    (itemId: string, role: "candidate" | "reference", file: File | null) => {
      if (!isComputableItemId(itemId)) return;
      setFilesByItemId((current) => {
        const previous = current[itemId] ?? EMPTY_FILES;
        return { ...current, [itemId]: { ...previous, [role]: file } };
      });
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetail(null);
  }, []);

  const patchRun = useCallback((itemId: string, patch: Partial<WorkbenchItemRun>) => {
    setRunStatusByItemId((current) => {
      const previous = current[itemId] ?? EMPTY_RUN;
      return {
        ...current,
        [itemId]: { ...previous, ...patch, updatedAt: nowIso() },
      };
    });
  }, []);

  const runItem = useCallback(
    async (itemId: string, source: "batch" | "single" = "single") => {
      if (!isComputableItemId(itemId)) return;
      const methodId = firstAnalyzableMethodId(itemId);
      if (!methodId) return;
      const config = methodAnalysisConfigByMethodId[methodId];
      if (!config || config.status !== "analyzable" || !config.profile) return;

      const files = filesByItemId[itemId] ?? EMPTY_FILES;
      const startedAt = nowIso();
      patchRun(itemId, {
        status: "queued",
        progress: 5,
        message: "",
        startedAt,
        source,
      });

      try {
        patchRun(itemId, { status: "running", progress: 15, source });
        const created = await createAnalysisJob({
          itemId,
          methodId,
          profile: config.profile,
          candidateLabel: "candidate",
          referenceLabel: "reference",
          pairingDescription: {
            zh: "工作台会话登记的候选药与参照药配对。",
            en: "Candidate and reference pairing registered in the workbench session.",
          },
          isHeadToHeadBiosimilarDesign: false,
          autoStart: false,
        });

        let current = created;
        if (files.candidate) {
          current = await uploadAnalysisFile(created.jobId, "candidate", files.candidate);
        }
        if (files.reference) {
          current = await uploadAnalysisFile(created.jobId, "reference", files.reference);
        }
        current = await startAnalysisJob(created.jobId);
        patchRun(itemId, { status: "running", progress: 35, message: current.status });

        const finished = await pollAnalysisJob(created.jobId, (snapshot) => {
          const progress =
            snapshot.status === "SUCCEEDED"
              ? 100
              : snapshot.status === "RUNNING"
                ? 70
                : 50;
          patchRun(itemId, {
            status: snapshot.status === "FAILED" ? "failed" : "running",
            progress,
            message: snapshot.status,
            source,
          });
        });

        if (finished.status === "SUCCEEDED") {
          patchRun(itemId, { status: "completed", progress: 100, message: finished.status, source });
        } else {
          patchRun(itemId, { status: "failed", progress: 100, message: finished.status, source });
        }
      } catch (caught) {
        const message =
          caught instanceof AnalysisServiceError ? caught.message : String(caught);
        patchRun(itemId, { status: "failed", progress: 100, message, source });
        setError(message);
        setErrorDetail(caught instanceof Error ? caught.stack ?? caught.message : String(caught));
      }
    },
    [filesByItemId, patchRun],
  );

  const runAll = useCallback(async () => {
    const readyIds = computableItemIds.filter((itemId) =>
      itemFilesAreReady(filesByItemId[itemId]),
    );
    if (readyIds.length === 0) return;
    setBatchRunning(true);
    try {
      for (const itemId of readyIds) {
        await runItem(itemId, "batch");
      }
    } finally {
      setBatchRunning(false);
    }
  }, [filesByItemId, runItem]);

  const value = useMemo<WorkbenchContextValue>(
    () => ({
      filesByItemId,
      runStatusByItemId,
      dispatchMode,
      batchRunning,
      theme,
      error,
      errorDetail,
      engineOnline,
      setDispatchMode,
      setTheme,
      setItemFile,
      clearError,
      runItem,
      runAll,
    }),
    [
      filesByItemId,
      runStatusByItemId,
      dispatchMode,
      batchRunning,
      theme,
      error,
      errorDetail,
      engineOnline,
      setTheme,
      setItemFile,
      clearError,
      runItem,
      runAll,
    ],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench(): WorkbenchContextValue {
  const context = useContext(WorkbenchContext);
  if (context === null) {
    throw new Error("useWorkbench must be used within a WorkbenchProvider");
  }
  return context;
}

export function getItemRun(
  runs: Record<string, WorkbenchItemRun>,
  itemId: string,
): WorkbenchItemRun {
  return runs[itemId] ?? EMPTY_RUN;
}

export function getItemFiles(
  files: Record<string, WorkbenchItemFiles>,
  itemId: string,
): WorkbenchItemFiles {
  return files[itemId] ?? EMPTY_FILES;
}
