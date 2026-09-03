"use client";

import type { KeyboardEvent, ReactNode, Ref } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

export interface DrawerTrailEntry {
  id: string;
  title: string;
  /** 1-based depth of the entry inside the stack. */
  depth: number;
}

interface DrawerLayerShellProps {
  ref?: Ref<HTMLDivElement>;
  domId: string;
  title: string;
  depth: number;
  totalDepth: number;
  /** Mobile drops the spine lane, so the outer layers become a top return stack. */
  showMobileTrail: boolean;
  trail: DrawerTrailEntry[];
  onBack: () => void;
  onCloseAll: () => void;
  onTrailSelect: (depth: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function depthShadowClassName(depth: number): string {
  if (depth <= 1) {
    return "drawer-depth-1";
  }
  if (depth === 2) {
    return "drawer-depth-2";
  }
  return "drawer-depth-3";
}

export function DrawerLayerShell({
  ref,
  domId,
  title,
  depth,
  totalDepth,
  showMobileTrail,
  trail,
  onBack,
  onCloseAll,
  onTrailSelect,
  onKeyDown,
  children,
}: DrawerLayerShellProps) {
  const { messages } = useLanguage();
  const copy = messages.drawer;
  const positionLabel = fillTemplate(copy.layerPositionTemplate, {
    current: String(depth),
    total: String(totalDepth),
  });

  return (
    <div
      ref={ref}
      id={domId}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={`drawer-layer glass-edge outline-none ${depthShadowClassName(depth)}`}
    >
      <header className="relative z-[1] flex flex-col gap-2 border-b border-line bg-paper px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold tracking-wide text-brand-800">
              {positionLabel}
            </p>
            <h2 className="mt-0.5 truncate text-base font-bold text-navy-900 sm:text-lg">
              {title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onBack}
              className="tap-target rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-navy-900 hover:bg-canvas-muted"
            >
              ← {copy.backOneLayer}
            </button>
            <button
              type="button"
              onClick={onCloseAll}
              className="tap-target rounded-sm px-2 text-sm font-semibold text-ink-secondary hover:bg-canvas-muted hover:text-navy-900"
            >
              {copy.closeAllLayers}
            </button>
          </div>
        </div>

        {showMobileTrail && trail.length > 0 ? (
          <nav aria-label={copy.railLabel} className="flex flex-wrap gap-1.5">
            {trail.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onTrailSelect(entry.depth)}
                aria-label={fillTemplate(copy.returnToLayerTemplate, {
                  index: String(entry.depth),
                  title: entry.title,
                })}
                className="tap-target max-w-[14rem] truncate rounded-sm border border-line bg-canvas-muted px-2 text-xs font-semibold text-navy-900"
              >
                {String(entry.depth).padStart(2, "0")} · {entry.title}
              </button>
            ))}
          </nav>
        ) : null}
      </header>

      <div className="drawer-layer-body drawer-stagger relative z-[1]">{children}</div>
    </div>
  );
}
