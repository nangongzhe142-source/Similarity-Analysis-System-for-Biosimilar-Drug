import type { CategoryKey } from "@/types/models";

interface CategoryMarkProps {
  categoryKey: CategoryKey;
  order: number;
}

function CategoryGlyph({ categoryKey }: { categoryKey: CategoryKey }) {
  const common = "h-6 w-6 stroke-current";
  if (categoryKey === "primary-structure") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path strokeWidth="1.75" d="M4 12h16M8 7v10M16 7v10" />
      </svg>
    );
  }
  if (categoryKey === "ptm-glycosylation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <circle cx="8" cy="12" r="3" strokeWidth="1.75" />
        <circle cx="16" cy="8" r="2.2" strokeWidth="1.75" />
        <circle cx="16" cy="16" r="2.2" strokeWidth="1.75" />
        <path strokeWidth="1.75" d="M11 12h3" />
      </svg>
    );
  }
  if (categoryKey === "higher-order-structure") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path strokeWidth="1.75" d="M4 16c2-6 4-9 8-9s6 3 8 9" />
        <path strokeWidth="1.75" d="M8 16c1-3 2-4.5 4-4.5S15 13 16 16" />
      </svg>
    );
  }
  if (categoryKey === "physicochemical") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path strokeWidth="1.75" d="M8 4v16M16 4v16M4 9h16M4 15h16" />
      </svg>
    );
  }
  if (categoryKey === "purity-size-variants") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <rect x="4" y="13" width="4" height="7" strokeWidth="1.75" />
        <rect x="10" y="8" width="4" height="12" strokeWidth="1.75" />
        <rect x="16" y="4" width="4" height="16" strokeWidth="1.75" />
      </svg>
    );
  }
  if (categoryKey === "charge-variants") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path strokeWidth="1.75" d="M12 4v16M7 9h10M7 15h10" />
        <path strokeWidth="1.75" d="M5 12h2M17 12h2" />
      </svg>
    );
  }
  if (categoryKey === "binding-bioactivity") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <circle cx="8" cy="12" r="4" strokeWidth="1.75" />
        <circle cx="16" cy="12" r="4" strokeWidth="1.75" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
      <path strokeWidth="1.75" d="M5 19V6h7l1 3h6v10H5z" />
    </svg>
  );
}

export function CategoryMark({ categoryKey, order }: CategoryMarkProps) {
  return (
    <span className="inline-flex items-center gap-2 text-brand-700">
      <span className="font-mono text-xs font-bold tracking-wide">
        {String(order).padStart(2, "0")}
      </span>
      <CategoryGlyph categoryKey={categoryKey} />
    </span>
  );
}
