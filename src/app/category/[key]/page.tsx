import { notFound } from "next/navigation";
import { categories, getCategoryByKey } from "@/data/categories";
import { CategoryView } from "@/components/views/CategoryView";

interface CategoryPageProps {
  params: Promise<{ key: string }>;
}

export function generateStaticParams(): Array<{ key: string }> {
  return categories.map((category) => ({ key: category.key }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { key } = await params;
  const category = getCategoryByKey(key);
  if (category === undefined) {
    notFound();
  }
  return <CategoryView category={category} />;
}
