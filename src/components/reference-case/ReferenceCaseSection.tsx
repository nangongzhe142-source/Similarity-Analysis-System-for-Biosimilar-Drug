"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SchematicFigureView } from "@/components/reference-case/SchematicFigure";
import type {
  EnglishSourceCheckStatus,
  LocalizedText,
  ReferenceCase,
  ReferenceCaseDataTable,
  ReferenceCaseEvidenceLevel,
  ReferenceCaseSource,
  ReferenceCaseTier,
  ReferenceCaseVerification,
} from "@/types/models";

/** Visual style per evidence level. Verified data reads as authoritative,
 *  narrative data as real-but-incomplete, illustrative as explicitly not real. */
const EVIDENCE_LEVEL_STYLE: Record<ReferenceCaseEvidenceLevel, string> = {
  "regulatory-verified": "border-emerald-300 bg-emerald-50 text-emerald-900",
  "regulatory-narrative": "border-amber-300 bg-amber-50 text-amber-900",
  illustrative: "border-violet-300 bg-violet-50 text-violet-900",
};

const CARD_ACCENT: Record<ReferenceCaseEvidenceLevel, string> = {
  "regulatory-verified": "border-l-emerald-500",
  "regulatory-narrative": "border-l-amber-500",
  illustrative: "border-l-violet-500",
};

function EvidenceLevelBadge({ level }: { level: ReferenceCaseEvidenceLevel }) {
  const { messages } = useLanguage();
  const labels: Record<ReferenceCaseEvidenceLevel, string> = {
    "regulatory-verified": messages.referenceCase.evidenceVerified,
    "regulatory-narrative": messages.referenceCase.evidenceNarrative,
    illustrative: messages.referenceCase.evidenceIllustrative,
  };
  const hints: Record<ReferenceCaseEvidenceLevel, string> = {
    "regulatory-verified": messages.referenceCase.evidenceVerifiedHint,
    "regulatory-narrative": messages.referenceCase.evidenceNarrativeHint,
    illustrative: messages.referenceCase.evidenceIllustrativeHint,
  };

  return (
    <span
      title={hints[level]}
      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${EVIDENCE_LEVEL_STYLE[level]}`}
    >
      {labels[level]}
    </span>
  );
}

function TierBadge({ tier }: { tier: ReferenceCaseTier }) {
  const { messages } = useLanguage();
  if (tier === "not-tiered") {
    return (
      <span className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        {messages.referenceCase.tierNotTiered}
      </span>
    );
  }

  const labels: Record<Exclude<ReferenceCaseTier, "not-tiered">, string> = {
    "tier-1": messages.referenceCase.tier1,
    "tier-2": messages.referenceCase.tier2,
    "tier-3": messages.referenceCase.tier3,
  };
  const styles: Record<Exclude<ReferenceCaseTier, "not-tiered">, string> = {
    "tier-1": "border-sky-300 bg-sky-50 text-sky-900",
    "tier-2": "border-indigo-300 bg-indigo-50 text-indigo-900",
    "tier-3": "border-slate-300 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${styles[tier]}`}
    >
      {labels[tier]}
    </span>
  );
}

function CaseTextBlock({
  label,
  text,
  tone = "default",
}: {
  label: string;
  text: LocalizedText;
  tone?: "default" | "caution";
}) {
  const { localize } = useLanguage();
  const containerClass =
    tone === "caution"
      ? "rounded-lg border border-amber-200 bg-amber-50/60 p-3"
      : "rounded-lg border border-slate-200 bg-white p-3";

  return (
    <div className={containerClass}>
      <p className="text-xs font-semibold tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">
        {localize(text)}
      </p>
    </div>
  );
}

function ComparisonTable({ table }: { table: ReferenceCaseDataTable }) {
  const { localize, messages } = useLanguage();
  const placeholder = messages.referenceCase.emptyValuePlaceholder;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <p className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
        {localize(table.caption)}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-600">
              <th scope="col" className="px-3 py-2 font-medium">
                {messages.referenceCase.indicatorColumn}
              </th>
              <th scope="col" className="px-3 py-2 font-medium text-teal-800">
                {messages.referenceCase.candidateColumn}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {messages.referenceCase.referenceUsColumn}
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                {messages.referenceCase.referenceEuColumn}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label.zh} className="border-t border-slate-100">
                <th
                  scope="row"
                  className="px-3 py-2 text-left text-xs font-normal text-slate-600"
                >
                  {localize(row.label)}
                </th>
                <td className="px-3 py-2 font-medium tabular-nums text-teal-900">
                  {row.candidateValue || placeholder}
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700">
                  {row.referenceUsValue || placeholder}
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700">
                  {row.referenceEuValue || placeholder}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceBlock({ source }: { source: ReferenceCaseSource }) {
  const { localize, messages } = useLanguage();
  const entries: Array<{ label: string; value: string; mono?: boolean }> = [
    {
      label: messages.referenceCase.sourceCandidateLabel,
      value: localize(source.candidateProduct),
    },
    {
      label: messages.referenceCase.sourceReferenceLabel,
      value: localize(source.referenceProduct),
    },
    {
      label: messages.referenceCase.sourceDocumentLabel,
      value: localize(source.documentTitle),
    },
    {
      label: messages.referenceCase.sourceCitationLabel,
      value: localize(source.citation),
    },
    {
      label: messages.referenceCase.sourceFileLabel,
      value: source.localSourcePath,
      mono: true,
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold tracking-wide text-slate-500">
        {messages.referenceCase.sourceLabel}
      </p>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-[max-content_1fr]">
        {entries.map((entry) => (
          <div key={entry.label} className="sm:col-span-2 sm:grid sm:grid-cols-subgrid">
            <dt className="text-xs text-slate-500">{entry.label}</dt>
            <dd
              className={
                entry.mono
                  ? "break-all font-mono text-[11px] text-slate-600"
                  : "text-xs text-slate-800"
              }
            >
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function VerificationBlock({
  verification,
}: {
  verification: ReferenceCaseVerification;
}) {
  const { messages } = useLanguage();

  const englishCheckLabels: Record<EnglishSourceCheckStatus, string> = {
    "not-checked": messages.referenceCase.englishCheckNotChecked,
    checked: messages.referenceCase.englishCheckChecked,
    "discrepancy-found": messages.referenceCase.englishCheckDiscrepancy,
  };

  const entries: Array<{ label: string; value: string; warn?: boolean }> = [
    {
      label: messages.referenceCase.verificationCheckedValues,
      value: `${verification.verifiableValues.length} / ${verification.sourceChunks.join(", ")}`,
    },
    {
      label: messages.referenceCase.verificationEnglishSource,
      value: englishCheckLabels[verification.englishSourceCheck],
      warn: verification.englishSourceCheck !== "checked",
    },
    {
      label: messages.referenceCase.verificationTranscribedBy,
      value: verification.transcribedBy,
    },
    {
      label: messages.referenceCase.verificationTranscribedOn,
      value: verification.transcribedOn,
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold tracking-wide text-slate-500">
        {messages.referenceCase.verificationLabel}
      </p>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-[max-content_1fr]">
        {entries.map((entry) => (
          <div key={entry.label} className="sm:col-span-2 sm:grid sm:grid-cols-subgrid">
            <dt className="text-xs text-slate-500">{entry.label}</dt>
            <dd
              className={
                entry.warn ? "text-xs font-medium text-amber-800" : "text-xs text-slate-800"
              }
            >
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function OcrDamageWarning() {
  const { messages } = useLanguage();
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-3">
      <p className="text-sm font-semibold text-red-900">
        {messages.referenceCase.ocrDamageWarningTitle}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-red-800">
        {messages.referenceCase.ocrDamageWarningText}
      </p>
    </div>
  );
}

function ReferenceCaseCard({ referenceCase }: { referenceCase: ReferenceCase }) {
  const { localize, messages } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className={`rounded-lg border border-l-4 border-slate-200 bg-slate-50/50 ${CARD_ACCENT[referenceCase.evidenceLevel]}`}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceLevelBadge level={referenceCase.evidenceLevel} />
          <TierBadge tier={referenceCase.tier} />
        </div>

        {referenceCase.evidenceLevel !== "illustrative" &&
        referenceCase.verification.hasUnresolvedOcrDamage ? (
          <div className="mt-3">
            <OcrDamageWarning />
          </div>
        ) : null}

        <p className="mt-3 text-sm font-medium leading-relaxed text-slate-900">
          {localize(referenceCase.headline)}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          <span className="font-semibold">
            {messages.referenceCase.methodUsedLabel}：
          </span>
          {localize(referenceCase.methodUsed)}
        </p>

        {referenceCase.source ? (
          <p className="mt-1.5 text-xs text-slate-500">
            {localize(referenceCase.source.candidateProduct)}
            {" vs "}
            {localize(referenceCase.source.referenceProduct)}
          </p>
        ) : null}

        {referenceCase.dataTables.length > 0 ? (
          <div className="mt-3">
            <ComparisonTable table={referenceCase.dataTables[0]} />
          </div>
        ) : null}

        {referenceCase.schematicFigure && !isExpanded ? (
          <div className="mt-3">
            <SchematicFigureView figure={referenceCase.schematicFigure} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
          className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          {isExpanded
            ? messages.referenceCase.collapseAction
            : messages.referenceCase.expandAction}
        </button>
      </div>

      {isExpanded ? (
        <div className="space-y-3 border-t border-slate-200 bg-white/70 p-4">
          {referenceCase.dataTables.slice(1).map((table) => (
            <ComparisonTable key={table.caption.zh} table={table} />
          ))}

          {referenceCase.schematicFigure ? (
            <SchematicFigureView figure={referenceCase.schematicFigure} />
          ) : null}

          {referenceCase.qualitativeFinding ? (
            <CaseTextBlock
              label={messages.referenceCase.qualitativeFindingLabel}
              text={referenceCase.qualitativeFinding}
            />
          ) : null}

          <CaseTextBlock
            label={messages.referenceCase.acceptanceCriterionLabel}
            text={referenceCase.acceptanceCriterion}
          />

          <CaseTextBlock
            label={messages.referenceCase.reviewerConclusionLabel}
            text={referenceCase.reviewerConclusion}
          />

          {referenceCase.methodDeviationNote ? (
            <CaseTextBlock
              label={messages.referenceCase.methodDeviationLabel}
              text={referenceCase.methodDeviationNote}
              tone="caution"
            />
          ) : null}

          {referenceCase.dataCaveat ? (
            <CaseTextBlock
              label={messages.referenceCase.dataCaveatLabel}
              text={referenceCase.dataCaveat}
              tone="caution"
            />
          ) : null}

          {referenceCase.evidenceLevel !== "illustrative" ? (
            <>
              <SourceBlock source={referenceCase.source} />
              <VerificationBlock verification={referenceCase.verification} />
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ReferenceCaseSection({
  referenceCases,
}: {
  referenceCases: ReferenceCase[];
}) {
  const { messages } = useLanguage();

  return (
    <section aria-labelledby="reference-case-heading">
      <h2
        id="reference-case-heading"
        className="text-lg font-semibold tracking-tight text-slate-900"
      >
        {messages.referenceCase.sectionTitle}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {messages.referenceCase.sectionDescription}
      </p>

      {referenceCases.length > 0 ? (
        <details className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-amber-900">
            {messages.referenceCase.disclaimerTitle}
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-amber-900">
            {messages.referenceCase.disclaimerText}
          </p>
        </details>
      ) : null}

      <div className="mt-4 space-y-4">
        {referenceCases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-700">
              {messages.referenceCase.noCaseTitle}
            </p>
            <p className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-slate-500">
              {messages.referenceCase.noCaseDescription}
            </p>
          </div>
        ) : (
          referenceCases.map((referenceCase) => (
            <ReferenceCaseCard key={referenceCase.id} referenceCase={referenceCase} />
          ))
        )}
      </div>
    </section>
  );
}
