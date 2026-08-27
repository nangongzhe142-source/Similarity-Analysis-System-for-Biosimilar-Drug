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
    <nav aria-label="Breadcrumb" className="text-sm text-ink-secondary">
      <ol className="flex flex-wrap items-center gap-1">
        {entries.map((entry, index) => (
          <Fragment key={`${entry.label}-${index}`}>
            {index > 0 && (
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
            )}
            <li>
              {entry.href !== undefined ? (
                <Link
                  href={entry.href}
                  className="rounded-sm font-medium text-brand-800 hover:underline"
                >
                  {entry.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{entry.label}</span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
