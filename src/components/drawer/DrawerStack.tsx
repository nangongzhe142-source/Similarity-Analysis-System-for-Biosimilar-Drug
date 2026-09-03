"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  drawerLayerDomId,
  useDrawerStack,
  type DrawerLayer,
} from "@/components/drawer/DrawerStackProvider";
import { DrawerLayerShell } from "@/components/drawer/DrawerLayerShell";

/** Layer spine width plus lane gap, in px, mirroring `--drawer-spine-width`. */
const SPINE_SLOT_WIDTH_PX = 50;
/** Spines may not eat more than this share of the viewport before collapsing. */
const SPINE_VIEWPORT_BUDGET = 0.4;
const DESKTOP_MIN_WIDTH_PX = 768;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function focusableElementsWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

function useViewportWidth(): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    function readWidth() {
      setWidth(window.innerWidth);
    }
    readWidth();
    window.addEventListener("resize", readWidth);
    return () => {
      window.removeEventListener("resize", readWidth);
    };
  }, []);
  return width;
}

function LayerSpine({
  layer,
  depthIndex,
  label,
  onSelect,
}: {
  layer: DrawerLayer;
  depthIndex: number;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="drawer-spine tap-target"
      aria-label={label}
      onClick={onSelect}
    >
      <span className="drawer-spine-body">
        <span className="drawer-spine-index" aria-hidden="true">
          {String(depthIndex + 1).padStart(2, "0")}
        </span>
        <span className="drawer-spine-title" aria-hidden="true">
          {layer.spineLabel}
        </span>
      </span>
    </button>
  );
}

export function DrawerStack() {
  const { messages } = useLanguage();
  const copy = messages.drawer;
  const { layers, popLayer, popToDepth, closeAll } = useDrawerStack();
  const viewportWidth = useViewportWidth();
  const topLayerRef = useRef<HTMLDivElement | null>(null);
  const focusedDepthRef = useRef(0);

  const layerCount = layers.length;

  /** Move focus into a freshly pushed layer, never on pop or content sync. */
  useEffect(() => {
    if (layerCount === 0) {
      focusedDepthRef.current = 0;
      return;
    }
    if (layerCount <= focusedDepthRef.current) {
      focusedDepthRef.current = layerCount;
      return;
    }
    focusedDepthRef.current = layerCount;
    const container = topLayerRef.current;
    if (container === null) {
      return;
    }
    const [firstFocusable] = focusableElementsWithin(container);
    if (firstFocusable !== undefined) {
      firstFocusable.focus();
      return;
    }
    container.focus();
  }, [layerCount]);

  if (layerCount === 0) {
    return null;
  }

  const topLayer = layers[layerCount - 1];
  const spineLayers = layers.slice(0, layerCount - 1);
  const isDesktop = viewportWidth >= DESKTOP_MIN_WIDTH_PX;
  const spineBudget =
    viewportWidth > 0
      ? Math.max(1, Math.floor((viewportWidth * SPINE_VIEWPORT_BUDGET) / SPINE_SLOT_WIDTH_PX))
      : spineLayers.length;
  const collapsedCount = Math.max(0, spineLayers.length - spineBudget);
  const visibleSpineLayers = spineLayers.slice(collapsedCount);

  /** Tab must not escape the top layer while the stack is open. */
  function handleTopLayerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }
    const container = topLayerRef.current;
    if (container === null) {
      return;
    }
    const focusable = focusableElementsWithin(container);
    if (focusable.length === 0) {
      event.preventDefault();
      container.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === container)) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="drawer-root">
      <button
        type="button"
        tabIndex={-1}
        className="drawer-scrim"
        aria-label={copy.closeTopLayer}
        onClick={popLayer}
      />
      <div className="drawer-lanes">
        {isDesktop && collapsedCount > 0 ? (
          <button
            type="button"
            className="drawer-spine tap-target"
            aria-label={`${fillTemplate(copy.collapsedLayersTemplate, {
              count: String(collapsedCount),
            })} — ${copy.collapsedLayersHint}`}
            onClick={() => popToDepth(1)}
          >
            <span className="drawer-spine-body">
              <span className="drawer-spine-index" aria-hidden="true">
                +{collapsedCount}
              </span>
              <span className="drawer-spine-title" aria-hidden="true">
                {fillTemplate(copy.collapsedLayersTemplate, { count: String(collapsedCount) })}
              </span>
            </span>
          </button>
        ) : null}

        {isDesktop
          ? visibleSpineLayers.map((layer) => {
              const depthIndex = layers.indexOf(layer);
              return (
                <LayerSpine
                  key={layer.id}
                  layer={layer}
                  depthIndex={depthIndex}
                  label={fillTemplate(copy.returnToLayerTemplate, {
                    index: String(depthIndex + 1),
                    title: layer.title,
                  })}
                  onSelect={() => popToDepth(depthIndex + 1)}
                />
              );
            })
          : null}

        <DrawerLayerShell
          ref={topLayerRef}
          domId={drawerLayerDomId(topLayer.id)}
          title={topLayer.title}
          depth={layerCount}
          totalDepth={layerCount}
          showMobileTrail={!isDesktop}
          trail={spineLayers.map((layer, index) => ({
            id: layer.id,
            title: layer.title,
            depth: index + 1,
          }))}
          onBack={popLayer}
          onCloseAll={closeAll}
          onTrailSelect={(depth) => popToDepth(depth)}
          onKeyDown={handleTopLayerKeyDown}
        >
          {topLayer.content}
        </DrawerLayerShell>
      </div>
    </div>
  );
}
