import { notFound } from "next/navigation";
import { characterizationItems } from "@/data/characterization-items";
import { getCategoryByKey } from "@/data/categories";
import { getItemById } from "@/data/selectors";
import { ItemDetailView } from "@/components/views/ItemDetailView";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return characterizationItems.map((item) => ({ id: item.id }));
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const item = getItemById(id);
  if (item === undefined) {
    notFound();
  }
  const category = getCategoryByKey(item.category);
  if (category === undefined) {
    notFound();
  }
  return <ItemDetailView item={item} category={category} />;
}
