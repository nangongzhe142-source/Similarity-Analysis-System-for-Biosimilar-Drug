"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category, CharacterizationItem } from "@/types/models";
import { getAdjacentItems } from "@/data/selectors";
import { getReferenceCases } from "@/data/reference-cases";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ApplicabilityBadge } from "@/components/ApplicabilityBadge";
import { SupplementaryTag } from "@/components/SupplementaryTag";
import { FieldBlock } from "@/components/FieldBlock";
import { MethodSelector } from "@/components/MethodSelector";
import { ReferenceCaseSection } from "@/components/reference-case/ReferenceCaseSection";
import { SimilarityAnalysisPlaceholder } from "@/components/SimilarityAnalysisPlaceholder";

interface ItemDetailViewProps {
  item: CharacterizationItem;
  category: Category;
}

export function ItemDetailView({ item, category }: ItemDetailViewProps) {
  const { localize, messages } = useLanguage();
  const { previous, next } = getAdjacentItems(item.id);
  const referenceCases = getReferenceCases(item.id);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: localize(category.name), href: `/category/${category.key}` },
          { label: localize(item.itemName) },
        ]}
      />

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {localize(item.itemName)}
          </h1>
          {item.isSupplementary && <SupplementaryTag />}
        </div>
        <p className="text-sm text-slate-500">
          {messages.itemPage.guidelineTermLabel}: {localize(item.guidelineTerm)}
        </p>
        <div>
          <ApplicabilityBadge applicability={item.applicability} />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          {messages.itemPage.fieldSectionTitle}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldBlock label={messages.itemPage.purposeLabel} value={item.purpose} />
          <FieldBlock
            label={messages.itemPage.detectionIndicatorsLabel}
            value={item.detectionIndicators}
          />
          <FieldBlock
            label={messages.itemPage.similarityMethodLabel}
            value={item.similarityMethod}
          />
          <FieldBlock
            label={messages.itemPage.judgingPrincipleLabel}
            value={item.judgingPrinciple}
            emphasized
          />
          <FieldBlock
            label={messages.itemPage.numericLimitLabel}
            value={item.numericLimit}
            emphasized
          />
          <FieldBlock label={messages.itemPage.remarkLabel} value={item.remark} />
        </div>
      </section>

      <ReferenceCaseSection referenceCases={referenceCases} />

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          {messages.itemPage.methodSectionTitle}
        </h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">
          {messages.itemPage.methodSectionDescription}
        </p>
        <MethodSelector methods={item.methods} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          {messages.itemPage.analysisSectionTitle}
        </h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">
          {messages.itemPage.analysisSectionDescription}
        </p>
        <SimilarityAnalysisPlaceholder analysisPlaceholder={item.analysisPlaceholder} />
      </section>

      <nav className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
        {previous !== undefined ? (
          <Link
            href={`/item/${previous.id}`}
            className="max-w-[45%] truncate font-medium text-teal-700 hover:underline"
          >
            ← {messages.itemPage.previousItem}: {localize(previous.itemName)}
          </Link>
        ) : (
          <span />
        )}
        {next !== undefined ? (
          <Link
            href={`/item/${next.id}`}
            className="max-w-[45%] truncate text-right font-medium text-teal-700 hover:underline"
          >
            {messages.itemPage.nextItem}: {localize(next.itemName)} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
