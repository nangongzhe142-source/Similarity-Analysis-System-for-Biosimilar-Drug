"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import type {
  RegulatoryCtdRelation,
  RegulatoryCtdRequirement,
  RegulatoryRelationLevel,
} from "@/types/models";

const RELATION_BADGE_STYLES: Record<RegulatoryRelationLevel, string> = {
  "directly-related": "border-emerald-300 bg-emerald-50 text-emerald-800",
  "indirectly-related": "border-sky-300 bg-sky-50 text-sky-800",
  supportive: "border-slate-300 bg-slate-100 text-slate-700",
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
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${RELATION_BADGE_STYLES[relation]}`}
    >
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
              className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50/60"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-teal-800">
                {requirement.ctdSection}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {localize(requirement.subject)}
              </td>
              <td className="px-4 py-3 leading-relaxed text-slate-600">
                {localize(requirement.requirement)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {requirement.pageReference}
              </td>
              <td className="px-4 py-3 leading-relaxed text-slate-500">
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
            <tr
              key={relation.id}
              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-teal-800">
                {relation.ctdSection}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {localize(relation.subject)}
              </td>
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
