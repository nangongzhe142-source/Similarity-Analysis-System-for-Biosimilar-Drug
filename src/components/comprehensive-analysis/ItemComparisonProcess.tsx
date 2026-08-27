"use client";

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
    <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{copy.processTitle}</h4>
        <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
          {copy.demoFlowBadge}
        </span>
        <span className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {copy.realComputationNotConnected}
        </span>
        <span className="rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {copy.notForRegulatoryJudgement}
        </span>
      </div>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepInput}</h5>
        <dl className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">{copy.candidateDataLabel}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
              {displayText(localize(entry.candidateDescription), placeholder)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">{copy.referenceDataLabel}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
              {displayText(localize(entry.referenceDescription), placeholder)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600">
          <span className="font-medium">{copy.comparisonNotesLabel}：</span>
          {displayText(localize(entry.comparisonNotes), placeholder)}
        </p>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepNormalization}</h5>
        <p className="mt-1 text-sm text-slate-600">{copy.normalizationNote}</p>
        <p className="mt-2 text-xs text-slate-500">
          {copy.textLengthLabel}: {copy.candidateNameLabel} {processView.candidateCharacterCount} /{" "}
          {copy.referenceNameLabel} {processView.referenceCharacterCount}
        </p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          {displayText(processView.normalizedCandidate, placeholder)}
          {"\n---\n"}
          {displayText(processView.normalizedReference, placeholder)}
        </pre>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepSideBySide}</h5>
        <p className="mt-1 text-xs text-slate-500">{copy.schematicCaption}</p>
        <p className="mt-1 text-xs font-medium text-slate-700">
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
                  className="fill-slate-400"
                />
                <rect
                  x={x + 10}
                  y={SCHEMATIC_HEIGHT_CEILING - candidateBarHeight}
                  width="8"
                  height={candidateBarHeight}
                  className="fill-teal-700"
                />
              </g>
            );
          })}
        </svg>
        <p className="mt-1 text-[11px] text-slate-500">
          {copy.referenceNameLabel} (rect) / {copy.candidateNameLabel} (rect)
        </p>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepDifference}</h5>
        <p className="mt-1 text-sm text-slate-600">{copy.differenceNote}</p>
        <p className="mt-1 text-sm text-slate-700">
          {processView.textsAreIdentical ? copy.textsIdenticalNote : copy.textsDifferNote}
        </p>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepPrinciple}</h5>
        <p className="mt-1 text-xs font-medium text-slate-500">{copy.judgingPrincipleSourceLabel}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          {localize(item.judgingPrinciple) || placeholder}
        </p>
        <p className="mt-2 text-xs font-medium text-slate-500">{copy.numericLimitSourceLabel}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          {localize(item.numericLimit) || placeholder}
        </p>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepConclusion}</h5>
        <div className="mt-2">
          <AssessmentStatusGlyph status={entry.demoStatus} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{copy.differenceNote}</p>
      </section>

      <section>
        <h5 className="text-sm font-semibold text-slate-800">{copy.processStepProvenance}</h5>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{copy.demoDataSourceNote}</p>
        <p className="mt-1 text-sm text-slate-600">{copy.realComputationNotConnected}</p>
      </section>
    </div>
  );
}
