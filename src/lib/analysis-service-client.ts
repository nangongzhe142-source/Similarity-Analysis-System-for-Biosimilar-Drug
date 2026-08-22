import type {
  AnalysisInputFileRole,
  AnalysisJobSnapshot,
} from "@/types/analysis-contract";
import type { AnalysisProfileId, LocalizedText } from "@/types/models";

const DEFAULT_BASE_URL = "/api/analysis";

export function analysisServiceBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_ANALYSIS_SERVICE_URL;
  if (override && override.length > 0) {
    return override.replace(/\/$/, "");
  }
  return DEFAULT_BASE_URL;
}

export class AnalysisServiceError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "AnalysisServiceError";
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText;
    let code: string | undefined;
    try {
      const body = (await response.json()) as {
        detail?: string;
        error?: { code?: string; message?: string; safeMessage?: LocalizedText };
      };
      if (body.error?.safeMessage?.zh) {
        message = body.error.safeMessage.zh;
        code = body.error.code;
      } else if (body.error?.message) {
        message = body.error.message;
        code = body.error.code;
      } else if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // keep statusText
    }
    throw new AnalysisServiceError(message, code);
  }
  return (await response.json()) as T;
}

export async function checkAnalysisServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${analysisServiceBaseUrl()}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface CreateAnalysisJobRequest {
  itemId: string;
  methodId: string;
  profile: AnalysisProfileId;
  candidateLabel: string;
  referenceLabel: string;
  pairingDescription: LocalizedText;
  isHeadToHeadBiosimilarDesign: boolean;
  parameters?: Record<string, unknown>;
  autoStart?: boolean;
}

export async function createAnalysisJob(
  request: CreateAnalysisJobRequest,
): Promise<AnalysisJobSnapshot> {
  const response = await fetch(`${analysisServiceBaseUrl()}/v1/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return parseJsonResponse<AnalysisJobSnapshot>(response);
}

export async function uploadAnalysisFile(
  jobId: string,
  role: AnalysisInputFileRole,
  file: File,
): Promise<AnalysisJobSnapshot> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${analysisServiceBaseUrl()}/v1/jobs/${jobId}/upload/${role}`, {
    method: "POST",
    body: formData,
  });
  return parseJsonResponse<AnalysisJobSnapshot>(response);
}

export async function startAnalysisJob(jobId: string): Promise<AnalysisJobSnapshot> {
  const response = await fetch(`${analysisServiceBaseUrl()}/v1/jobs/${jobId}/start`, {
    method: "POST",
  });
  return parseJsonResponse<AnalysisJobSnapshot>(response);
}

export async function getAnalysisJob(jobId: string): Promise<AnalysisJobSnapshot> {
  const response = await fetch(`${analysisServiceBaseUrl()}/v1/jobs/${jobId}`, {
    method: "GET",
    cache: "no-store",
  });
  return parseJsonResponse<AnalysisJobSnapshot>(response);
}

export async function cancelAnalysisJob(jobId: string): Promise<AnalysisJobSnapshot> {
  const response = await fetch(`${analysisServiceBaseUrl()}/v1/jobs/${jobId}`, {
    method: "DELETE",
  });
  return parseJsonResponse<AnalysisJobSnapshot>(response);
}

export function isTerminalJobStatus(status: AnalysisJobSnapshot["status"]): boolean {
  return status === "SUCCEEDED" || status === "FAILED" || status === "CANCELLED";
}

export async function pollAnalysisJob(
  jobId: string,
  onUpdate: (snapshot: AnalysisJobSnapshot) => void,
  signal?: AbortSignal,
): Promise<AnalysisJobSnapshot> {
  while (true) {
    if (signal?.aborted) {
      throw new AnalysisServiceError("polling aborted");
    }
    const snapshot = await getAnalysisJob(jobId);
    onUpdate(snapshot);
    if (isTerminalJobStatus(snapshot.status)) {
      return snapshot;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export function analysisArtifactUrl(jobId: string, fileName: string): string {
  return `${analysisServiceBaseUrl()}/v1/jobs/${jobId}/artifacts/${encodeURIComponent(fileName)}`;
}

export async function downloadAnalysisArtifact(jobId: string, fileName: string): Promise<void> {
  const response = await fetch(analysisArtifactUrl(jobId, fileName), { cache: "no-store" });
  if (!response.ok) {
    throw new AnalysisServiceError("artifact download failed");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
