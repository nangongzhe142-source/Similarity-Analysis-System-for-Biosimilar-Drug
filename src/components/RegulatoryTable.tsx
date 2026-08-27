"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type {
  RegulatoryCtdRelation,
  RegulatoryCtdRequirement,
  RegulatoryRelationLevel,
} from "@/types/models";

const RELATION_BADGE_STYLES: Record<RegulatoryRelationLevel, string> = {
  "directly-related": "border-brand-700 bg-canvas text-navy-900",
  "indirectly-related": "border-cyan-700 bg-cyan-100 text-cyan-800",
  supportive: "border-line-strong bg-canvas-muted text-ink",
};

function RelationBadge({ relation }: { relation: RegulatoryRelationLevel }) {
  const { messages } = useLanguage();
  const relationLabels: Record<RegulatoryRelationLevel, string> = {
    "directly-related": messages.regulatoryPage.relationDirectlyRelated,
    "indirectly-related": messages.regulatoryPage.relationIndirectlyRelated,
    supportive: messages.regulatoryPage.relationSupportive,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold ${RELATION_BADGE_STYLES[relation]}`}
    >
      <span aria-hidden="true">
        {relation === "directly-related" ? "●" : relation === "indirectly-related" ? "◆" : "■"}
      </span>
      {relationLabels[relation]}
    </span>
  );
}

interface RegulatoryRequirementsTableProps {
  requirements: RegulatoryCtdRequirement[];
}

export function RegulatoryRequirementsTable({
  requirements,
}: RegulatoryRequirementsTableProps) {
  const { localize, messages } = useLanguage();

  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-navy-800 bg-navy-900 text-xs uppercase tracking-wide text-paper">
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {messages.regulatoryPage.ctdSectionHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {messages.regulatoryPage.subjectHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {messages.regulatoryPage.requirementHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {messages.regulatoryPage.pageReferenceHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {messages.regulatoryPage.remarkHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((requirement) => (
            <tr
              key={requirement.id}
              className="border-b border-line align-top last:border-b-0 hover:bg-canvas-muted"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-brand-800">
                {requirement.ctdSection}
              </td>
              <td className="px-4 py-3 font-medium text-ink">{localize(requirement.subject)}</td>
              <td className="px-4 py-3 leading-relaxed text-ink-secondary">
                {localize(requirement.requirement)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-secondary">
                {requirement.pageReference}
              </td>
              <td className="px-4 py-3 leading-relaxed text-ink-secondary">
                {localize(requirement.remark) || messages.itemPage.emptyFieldPlaceholder}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RegulatoryRelationsTableProps {
  relations: RegulatoryCtdRelation[];
}

export function RegulatoryRelationsTable({ relations }: RegulatoryRelationsTableProps) {
  const { localize, messages } = useLanguage();

  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-navy-800 bg-navy-900 text-xs uppercase tracking-wide text-paper">
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {messages.regulatoryPage.ctdSectionHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              {messages.regulatoryPage.subjectHeader}
            </th>
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {messages.regulatoryPage.relationHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {relations.map((relation) => (
            <tr key={relation.id} className="border-b border-line last:border-b-0 hover:bg-canvas-muted">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-brand-800">
                {relation.ctdSection}
              </td>
              <td className="px-4 py-3 font-medium text-ink">{localize(relation.subject)}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <RelationBadge relation={relation.relation} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
