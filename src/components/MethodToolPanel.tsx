"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { getMethodToolSurvey } from "@/data/method-tools";
import type {
  MethodTool,
  ToolDeploymentLevel,
  ToolRecommendation,
} from "@/types/models";

interface MethodToolPanelProps {
  methodId: string;
}

/** 部署层级的配色。L0/L1 用中性灰，避免读者把「装上了」看成「能用了」；
 *  只有真正跑通过数据的层级才给出正向配色。 */
const DEPLOYMENT_LEVEL_STYLES: Record<ToolDeploymentLevel, string> = {
  L0: "bg-slate-200 text-slate-700",
  L1: "bg-slate-300 text-slate-800",
  "L1+": "bg-amber-100 text-amber-900",
  L2: "bg-sky-100 text-sky-900",
  L3: "bg-sky-200 text-sky-900",
  L4: "bg-emerald-100 text-emerald-900",
  L5: "bg-emerald-200 text-emerald-900",
  L6: "bg-emerald-300 text-emerald-950",
};

const RECOMMENDATION_STYLES: Record<ToolRecommendation, string> = {
  preferred: "border-teal-600 bg-teal-50 text-teal-900",
  alternative: "border-slate-300 bg-white text-slate-700",
  conditional: "border-amber-400 bg-amber-50 text-amber-900",
  "not-recommended": "border-rose-300 bg-rose-50 text-rose-900",
};

/** 低于 L2 一律视为未经运行验证，需要在卡片上给出显式警示。 */
const UNVERIFIED_DEPLOYMENT_LEVELS: ToolDeploymentLevel[] = ["L0", "L1"];

function ToolCard({ tool }: { tool: MethodTool }) {
  const { localize, messages } = useLanguage();
  const toolMessages = messages.methodTools;

  const recommendationLabel = {
    preferred: toolMessages.recommendationPreferred,
    alternative: toolMessages.recommendationAlternative,
    conditional: toolMessages.recommendationConditional,
    "not-recommended": toolMessages.recommendationNotRecommended,
  }[tool.recommendation];

  const isUnverified = UNVERIFIED_DEPLOYMENT_LEVELS.includes(tool.deploymentLevel);

  return (
    <article className={`rounded-lg border p-4 ${RECOMMENDATION_STYLES[tool.recommendation]}`}>
      <header className="flex flex-wrap items-center gap-2">
        <a
          href={tool.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold underline underline-offset-2 hover:no-underline"
        >
          {tool.name}
        </a>
        <span className="rounded border border-current px-1.5 py-0.5 text-[11px] font-semibold">
          {recommendationLabel}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
            DEPLOYMENT_LEVEL_STYLES[tool.deploymentLevel]
          }`}
        >
          {toolMessages.deploymentLabel}: {tool.deploymentLevel}
        </span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
          {toolMessages.capabilityLabel}: {tool.capabilityLevels.join(" / ")}
        </span>
      </header>

      <p className="mt-2 text-sm leading-relaxed">{localize(tool.summary)}</p>

      {isUnverified ? (
        <p className="mt-2 rounded border border-dashed border-current px-2 py-1 text-xs font-medium">
          {toolMessages.deploymentUnverifiedWarning}
        </p>
      ) : null}

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="inline font-semibold">{toolMessages.licenseLabel}：</dt>
          <dd className="inline">{tool.license}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">{toolMessages.stackLabel}：</dt>
          <dd className="inline">{tool.stack}</dd>
        </div>
        {tool.repositoryStats ? (
          <div className="sm:col-span-2">
            <dt className="inline font-semibold">{toolMessages.statsLabel}：</dt>
            <dd className="inline">
              {`★ ${tool.repositoryStats.stars} · fork ${tool.repositoryStats.forks} · `}
              {`最近提交 ${tool.repositoryStats.lastPushedOn} · `}
              {`${toolMessages.surveyedOnLabel} ${tool.repositoryStats.queriedOn}`}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-3 text-xs leading-relaxed">
        <p className="font-semibold">{toolMessages.notSupportedLabel}</p>
        <p className="mt-0.5">{localize(tool.notSupported)}</p>
      </div>

      <div className="mt-2 text-xs leading-relaxed">
        <p className="font-semibold">{toolMessages.evidenceLabel}</p>
        <p className="mt-0.5">{localize(tool.deploymentEvidence)}</p>
        {tool.evidencePaths.length > 0 ? (
          <ul className="mt-1 list-inside list-disc font-mono text-[11px] opacity-80">
            {tool.evidencePaths.map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

/** 在方法内容嵌入位下方展示该方法的开源工具调研结果与本机部署实录。
 *  没有调研过的方法显式说明「尚未调研」，而不是静默留白。 */
export function MethodToolPanel({ methodId }: MethodToolPanelProps) {
  const { localize, messages } = useLanguage();
  const toolMessages = messages.methodTools;
  const survey = getMethodToolSurvey(methodId);

  if (!survey) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-700">{toolMessages.sectionTitle}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500">{toolMessages.notSurveyedTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{toolMessages.notSurveyedText}</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">{toolMessages.sectionTitle}</h3>
        <span className="text-xs text-slate-400">
          {toolMessages.surveyedOnLabel} {survey.surveyedOn}
        </span>
      </div>

      {survey.gapNote ? (
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">{toolMessages.gapTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900">{localize(survey.gapNote)}</p>
        </div>
      ) : null}

      {survey.tools.length > 0 ? (
        <div className="mt-3 flex flex-col gap-3">
          {survey.tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : null}

      <p className="mt-3 border-t border-slate-200 pt-2 text-[11px] leading-relaxed text-slate-500">
        {toolMessages.disclaimer}
      </p>
    </section>
  );
}
