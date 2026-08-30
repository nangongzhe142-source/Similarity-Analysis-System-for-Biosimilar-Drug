import type { ProjectModule } from "@/lib/project";

/** 页面层只依赖这些稳定契约；算法、OCR、LLM 和外部 API 可在后续替换实现。 */
export interface AnalysisAdapter {
  run(module: ProjectModule, input: { candidate: File; reference: File }, signal?: AbortSignal): Promise<unknown>;
}

export interface OcrAdapter {
  extract(file: File): Promise<{ text: string; tables: unknown[]; confidence?: number }>;
}

export interface ReportAdapter {
  build(projectSnapshot: unknown): Promise<{ title: string; sections: unknown[] }>;
}

export interface LlmSummaryAdapter {
  summarize(structuredFacts: unknown): Promise<{ draft: string; model: string }>;
}

export const reservedIntegrationSlots = {
  analysis: "/api/adapters/analysis/:moduleId",
  ocr: "/api/adapters/ocr",
  report: "/api/adapters/report",
  llm: "/api/adapters/llm-summary",
} as const;
