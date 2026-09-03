"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AssessmentStatusGlyph } from "@/components/comprehensive-analysis/AssessmentStatusGlyph";
import {
  SCHEMATIC_ALIGNMENT,
  SCHEMATIC_POINT_COUNT,
  type DemoProcessViewModel,
} from "@/lib/comprehensive-analysis/demo-process";
import type { CharacterizationItem } from "@/types/models";
import type { ItemAssessmentEntry } from "@/types/comprehensive-analysis";

interface ItemComparisonProcessProps {
  item: CharacterizationItem;
  entry: ItemAssessmentEntry;
  processView: DemoProcessViewModel;
}

const SCHEMATIC_VIEWBOX_WIDTH = 320;
const SCHEMATIC_VIEWBOX_HEIGHT = 88;
const SCHEMATIC_MAX_BAR_HEIGHT = 64;
const SCHEMATIC_HEIGHT_CEILING = 88;

function schematicAlignmentLabel(
  alignment: DemoProcessViewModel["schematicAlignment"],
  copy: {
    schematicAlignmentAligned: string;
    schematicAlignmentOffset: string;
    schematicAlignmentIncomplete: string;
    schematicAlignmentNotApplicable: string;
  },
): string {
  if (alignment === SCHEMATIC_ALIGNMENT.aligned) {
    return copy.schematicAlignmentAligned;
  }
  if (alignment === SCHEMATIC_ALIGNMENT.offset) {
    return copy.schematicAlignmentOffset;
  }
  if (alignment === SCHEMATIC_ALIGNMENT.notApplicable) {
    return copy.schematicAlignmentNotApplicable;
  }
  return copy.schematicAlignmentIncomplete;
}

function displayText(value: string, placeholder: string): string {
  return value.trim() === "" ? placeholder : value;
}

/** One node of the vertical timeline: numbered marker, connector, body. */
function TimelineStep({
  stepNumber,
  title,
  children,
}: {
  stepNumber: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="relative pb-6 pl-10 last:pb-0">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 grid size-7 place-items-center rounded-full border border-brand-700 bg-paper font-mono text-xs font-bold text-brand-800 shadow-[var(--shadow-glow-brand)]"
      >
        {stepNumber}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-[0.84rem] top-7 bottom-0 w-px bg-gradient-to-b from-brand-700/60 to-cyan-700/10"
      />
      <h5 className="text-sm font-semibold text-navy-900">{title}</h5>
      <div className="mt-1.5">{children}</div>
    </li>
  );
}

export function ItemComparisonProcess({
  item,
  entry,
  processView,
}: ItemComparisonProcessProps) {
  const { localize, messages } = useLanguage();
  const copy = messages.comprehensiveAnalysis;
  const placeholder = copy.emptyValuePlaceholder;
  const barSlotWidth = SCHEMATIC_VIEWBOX_WIDTH / SCHEMATIC_POINT_COUNT;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-navy-900">{copy.processTitle}</h4>
        <span className="rounded-sm border border-navy-800 bg-canvas-muted px-2 py-0.5 text-[11px] font-semibold text-navy-900">
          {copy.demoFlowBadge}
        </span>
        <span className="rounded-sm border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink">
          {copy.realComputationNotConnected}
        </span>
        <span className="rounded-sm border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink">
          {copy.notForRegulatoryJudgement}
        </span>
      </div>

      <ol className="flex flex-col">
        <TimelineStep stepNumber={1} title={copy.processStepInput}>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-canvas-muted p-3">
              <dt className="text-xs font-medium text-ink-secondary">
                {copy.candidateDataLabel}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
                {displayText(localize(entry.candidateDescription), placeholder)}
              </dd>
            </div>
            <div className="rounded-md border border-line bg-canvas-muted p-3">
              <dt className="text-xs font-medium text-ink-secondary">
                {copy.referenceDataLabel}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
                {displayText(localize(entry.referenceDescription), placeholder)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-secondary">
            <span className="font-medium">{copy.comparisonNotesLabel}：</span>
            {displayText(localize(entry.comparisonNotes), placeholder)}
          </p>
        </TimelineStep>

        <TimelineStep stepNumber={2} title={copy.processStepNormalization}>
          <p className="text-sm text-ink-secondary">{copy.normalizationNote}</p>
          <p className="mt-2 text-xs text-ink-secondary">
            {copy.textLengthLabel}: {copy.candidateNameLabel} {processView.candidateCharacterCount}{" "}
            / {copy.referenceNameLabel} {processView.referenceCharacterCount}
          </p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-canvas-muted p-3 text-xs text-ink">
            {displayText(processView.normalizedCandidate, placeholder)}
            {"\n---\n"}
            {displayText(processView.normalizedReference, placeholder)}
          </pre>
        </TimelineStep>

        <TimelineStep stepNumber={3} title={copy.processStepSideBySide}>
          <p className="text-xs text-ink-secondary">{copy.schematicCaption}</p>
          <p className="mt-1 text-xs font-medium text-ink">
            {schematicAlignmentLabel(processView.schematicAlignment, copy)}
          </p>
          <svg
            viewBox={`0 0 ${SCHEMATIC_VIEWBOX_WIDTH} ${SCHEMATIC_VIEWBOX_HEIGHT}`}
            role="img"
            aria-label={copy.schematicCaption}
            className="mt-2 h-24 w-full max-w-lg"
          >
            {processView.schematicBars.map((bar, pointIndex) => {
              const referenceBarHeight = Math.min(bar.referenceHeight, SCHEMATIC_MAX_BAR_HEIGHT);
              const candidateBarHeight = Math.min(bar.candidateHeight, SCHEMATIC_MAX_BAR_HEIGHT);
              const x = pointIndex * barSlotWidth + 4;
              return (
                <g key={bar.pointId}>
                  <rect
                    x={x}
                    y={SCHEMATIC_HEIGHT_CEILING - referenceBarHeight}
                    width="8"
                    height={referenceBarHeight}
                    className="fill-line-strong"
                  />
                  <rect
                    x={x + 10}
                    y={SCHEMATIC_HEIGHT_CEILING - candidateBarHeight}
                    width="8"
                    height={candidateBarHeight}
                    className="fill-cyan-700"
                  />
                </g>
              );
            })}
          </svg>
          <p className="mt-1 text-[11px] text-ink-secondary">
            {copy.referenceNameLabel} (rect) / {copy.candidateNameLabel} (rect)
          </p>
        </TimelineStep>

        <TimelineStep stepNumber={4} title={copy.processStepDifference}>
          <p className="text-sm text-ink-secondary">{copy.differenceNote}</p>
          <p className="mt-1 text-sm text-ink">
            {processView.textsAreIdentical ? copy.textsIdenticalNote : copy.textsDifferNote}
          </p>
        </TimelineStep>

        <TimelineStep stepNumber={5} title={copy.processStepPrinciple}>
          <p className="text-xs font-medium text-ink-secondary">
            {copy.judgingPrincipleSourceLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            {localize(item.judgingPrinciple) || placeholder}
          </p>
          <p className="mt-2 text-xs font-medium text-ink-secondary">
            {copy.numericLimitSourceLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            {localize(item.numericLimit) || placeholder}
          </p>
        </TimelineStep>

        <TimelineStep stepNumber={6} title={copy.processStepConclusion}>
          <AssessmentStatusGlyph status={entry.demoStatus} />
          <p className="mt-2 text-xs text-ink-secondary">{copy.differenceNote}</p>
        </TimelineStep>

        <TimelineStep stepNumber={7} title={copy.processStepProvenance}>
          <p className="text-sm leading-relaxed text-ink-secondary">{copy.demoDataSourceNote}</p>
          <p className="mt-1 text-sm text-ink-secondary">{copy.realComputationNotConnected}</p>
        </TimelineStep>
      </ol>
    </div>
  );
}
