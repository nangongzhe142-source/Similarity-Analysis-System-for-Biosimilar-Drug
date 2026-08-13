import type { CategoryKey, CharacterizationItem } from "@/types/models";
import { characterizationItems } from "@/data/characterization-items";

export function getItemsByCategory(categoryKey: CategoryKey): CharacterizationItem[] {
  return characterizationItems.filter((item) => item.category === categoryKey);
}

export function getItemById(itemId: string): CharacterizationItem | undefined {
  return characterizationItems.find((item) => item.id === itemId);
}

export function getItemCountByCategory(categoryKey: CategoryKey): number {
  return getItemsByCategory(categoryKey).length;
}

/** Neighboring items within the same category, for prev/next navigation. */
export function getAdjacentItems(itemId: string): {
  previous: CharacterizationItem | undefined;
  next: CharacterizationItem | undefined;
} {
  const currentItem = getItemById(itemId);
  if (currentItem === undefined) {
    return { previous: undefined, next: undefined };
  }
  const siblings = getItemsByCategory(currentItem.category);
  const currentIndex = siblings.findIndex((item) => item.id === itemId);
  return {
    previous: currentIndex > 0 ? siblings[currentIndex - 1] : undefined,
    next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : undefined,
  };
}

export function getTotalMethodCount(): number {
  return characterizationItems.reduce((total, item) => total + item.methods.length, 0);
}

export function getSupplementaryItemCount(): number {
  return characterizationItems.filter((item) => item.isSupplementary).length;
}
