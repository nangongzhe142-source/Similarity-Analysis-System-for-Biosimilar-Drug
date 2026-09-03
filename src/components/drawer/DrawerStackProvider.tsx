"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** One entry of the drawer stack. `content` is plain state, so the pushing view
 *  stays the single owner of its own data flow: when that data changes the view
 *  calls `syncLayerContent` instead of the stack reaching into page state. */
export interface DrawerLayer {
  /** Stable identity of the layer. Pushing an existing id jumps back to it. */
  id: string;
  /** Full layer title, used for the breadcrumb and the dialog aria-label. */
  title: string;
  /** Short form shown vertically on the collapsed layer spine. */
  spineLabel: string;
  content: ReactNode;
}

interface DrawerStackContextValue {
  layers: DrawerLayer[];
  pushLayer: (layer: DrawerLayer) => void;
  popLayer: () => void;
  popToDepth: (depth: number) => void;
  closeAll: () => void;
  syncLayerContent: (layerId: string, content: ReactNode) => void;
  isLayerOpen: (layerId: string) => boolean;
}

const DrawerStackContext = createContext<DrawerStackContextValue | null>(null);

export const DRAWER_LAYER_DOM_ID_PREFIX = "drawer-layer-";

export function drawerLayerDomId(layerId: string): string {
  return `${DRAWER_LAYER_DOM_ID_PREFIX}${layerId}`;
}

export function DrawerStackProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<DrawerLayer[]>([]);
  /** Element that opened each depth, so popping can hand focus back to it. */
  const triggerElementsRef = useRef<Array<HTMLElement | null>>([]);
  /** Element to focus once the pop has been committed to the DOM. */
  const pendingFocusRef = useRef<HTMLElement | null>(null);

  const captureTrigger = useCallback((): HTMLElement | null => {
    const active = document.activeElement;
    return active instanceof HTMLElement ? active : null;
  }, []);

  const truncateTriggers = useCallback((depth: number): HTMLElement | null => {
    const removed = triggerElementsRef.current.slice(depth);
    triggerElementsRef.current = triggerElementsRef.current.slice(0, depth);
    return removed.length > 0 ? removed[0] : null;
  }, []);

  const pushLayer = useCallback(
    (layer: DrawerLayer) => {
      setLayers((currentLayers) => {
        const existingDepth = currentLayers.findIndex(
          (currentLayer) => currentLayer.id === layer.id,
        );
        if (existingDepth >= 0) {
          truncateTriggers(existingDepth + 1);
          const kept = currentLayers.slice(0, existingDepth + 1);
          kept[existingDepth] = layer;
          return kept;
        }
        triggerElementsRef.current = [
          ...triggerElementsRef.current.slice(0, currentLayers.length),
          captureTrigger(),
        ];
        return [...currentLayers, layer];
      });
    },
    [captureTrigger, truncateTriggers],
  );

  const popToDepth = useCallback(
    (depth: number) => {
      const boundedDepth = Math.max(0, depth);
      setLayers((currentLayers) => {
        if (boundedDepth >= currentLayers.length) {
          return currentLayers;
        }
        pendingFocusRef.current = truncateTriggers(boundedDepth);
        return currentLayers.slice(0, boundedDepth);
      });
    },
    [truncateTriggers],
  );

  const popLayer = useCallback(() => {
    setLayers((currentLayers) => {
      if (currentLayers.length === 0) {
        return currentLayers;
      }
      pendingFocusRef.current = truncateTriggers(currentLayers.length - 1);
      return currentLayers.slice(0, currentLayers.length - 1);
    });
  }, [truncateTriggers]);

  const closeAll = useCallback(() => {
    setLayers((currentLayers) => {
      if (currentLayers.length === 0) {
        return currentLayers;
      }
      pendingFocusRef.current = truncateTriggers(0);
      return [];
    });
  }, [truncateTriggers]);

  const syncLayerContent = useCallback((layerId: string, content: ReactNode) => {
    setLayers((currentLayers) => {
      const depth = currentLayers.findIndex((layer) => layer.id === layerId);
      if (depth < 0) {
        return currentLayers;
      }
      const next = [...currentLayers];
      next[depth] = { ...next[depth], content };
      return next;
    });
  }, []);

  const isLayerOpen = useCallback(
    (layerId: string) => layers.some((layer) => layer.id === layerId),
    [layers],
  );

  /** Esc pops exactly one layer, never the whole stack. */
  useEffect(() => {
    if (layers.length === 0) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.stopPropagation();
      popLayer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [layers.length, popLayer]);

  /** Hand focus back to whatever opened the layer that was just popped. */
  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target === null) {
      return;
    }
    pendingFocusRef.current = null;
    if (target.isConnected) {
      target.focus();
    }
  }, [layers.length]);

  const value = useMemo<DrawerStackContextValue>(
    () => ({
      layers,
      pushLayer,
      popLayer,
      popToDepth,
      closeAll,
      syncLayerContent,
      isLayerOpen,
    }),
    [layers, pushLayer, popLayer, popToDepth, closeAll, syncLayerContent, isLayerOpen],
  );

  return (
    <DrawerStackContext.Provider value={value}>
      {children}
    </DrawerStackContext.Provider>
  );
}

export function useDrawerStack(): DrawerStackContextValue {
  const value = useContext(DrawerStackContext);
  if (value === null) {
    throw new Error("useDrawerStack must be used inside a DrawerStackProvider.");
  }
  return value;
}

/** Keeps an already-open layer's content in step with the pushing view's data.
 *  No-op while the layer is closed, so it never re-opens a dismissed layer.
 *  `contentKey` must change exactly when the rendered data changes: the layer is
 *  re-rendered only then, which is what keeps this from looping on itself. */
export function useDrawerLayerSync(
  layerId: string | null,
  contentKey: string,
  buildContent: () => ReactNode,
): void {
  const { layers, syncLayerContent } = useDrawerStack();
  const isOpen = layerId !== null && layers.some((layer) => layer.id === layerId);
  const buildContentRef = useRef(buildContent);

  /** Declared first so the latest builder is stored before the sync effect
   *  below runs in the same commit. */
  useEffect(() => {
    buildContentRef.current = buildContent;
  });

  useEffect(() => {
    if (layerId === null || !isOpen) {
      return;
    }
    syncLayerContent(layerId, buildContentRef.current());
  }, [contentKey, isOpen, layerId, syncLayerContent]);
}
