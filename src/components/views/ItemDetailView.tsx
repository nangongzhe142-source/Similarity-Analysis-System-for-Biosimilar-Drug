"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Category, CharacterizationItem } from "@/types/models";
import { getAdjacentItems } from "@/data/selectors";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ItemDetailContent } from "@/components/views/ItemDetailContent";
import {
  publishAssistantPageContext,
  resetAssistantPageContext,
} from "@/lib/assistant/page-context";

interface ItemDetailViewProps {
  item: CharacterizationItem;
  category: Category;
}

export function ItemDetailView({ item, category }: ItemDetailViewProps) {
  const { localize, messages } = useLanguage();
  const { previous, next } = getAdjacentItems(item.id);

  useEffect(() => {
    publishAssistantPageContext({
      categoryKey: category.key,
      itemId: item.id,
      itemName: localize(item.itemName),
    });
    return () => {
      resetAssistantPageContext([
        "categoryKey",
        "itemId",
        "itemName",
        "methodId",
        "methodName",
        "analysisStatus",
        "analysisResult",
        "analysisProvenance",
      ]);
    };
  }, [category.key, item.id, item.itemName, localize]);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb
        entries={[
          { label: messages.itemPage.breadcrumbHome, href: "/" },
          { label: localize(category.name), href: `/category/${category.key}` },
          { label: localize(item.itemName) },
        ]}
      />

      <ItemDetailContent item={item} />

      <nav className="flex items-center justify-between border-t border-line pt-4 text-sm">
        {previous !== undefined ? (
          <Link
            href={`/item/${previous.id}`}
            className="tap-target max-w-[45%] truncate font-semibold text-brand-800 hover:underline"
          >
            ← {messages.itemPage.previousItem}: {localize(previous.itemName)}
          </Link>
        ) : (
          <span />
        )}
        {next !== undefined ? (
          <Link
            href={`/item/${next.id}`}
            className="tap-target max-w-[45%] truncate text-right font-semibold text-brand-800 hover:underline"
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
