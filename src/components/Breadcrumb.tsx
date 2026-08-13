"use client";

import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  entries: BreadcrumbEntry[];
}

export function Breadcrumb({ entries }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {entries.map((entry, index) => (
          <Fragment key={`${entry.label}-${index}`}>
            {index > 0 && <li aria-hidden="true">/</li>}
            <li>
              {entry.href !== undefined ? (
                <Link href={entry.href} className="hover:text-teal-700 hover:underline">
                  {entry.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{entry.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
