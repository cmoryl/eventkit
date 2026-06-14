// Tiny module-scoped event bus that lets external surfaces (e.g. the
// ElevenLabs voice agent) command the live SlideEditor without prop drilling.
//
// SlideEditor calls `slideEditorBus.connect({...})` on mount and
// `disconnect()` on unmount. Voice tools call `slideEditorBus.emit(name, args)`
// which dispatches to the connected handler if one exists, or returns false.

import type { SlideData } from "@/components/slides/slideTypes";

export interface SlideEditorBusHandlers {
  insertTemplate: (
    templateId: string,
    slotValues?: Record<string, unknown>,
  ) => SlideData | null;
  insertSection: (payload: Omit<SlideData, "id">) => SlideData | null;
  setAccentImage: (params: {
    position?: "none" | "top" | "left" | "right" | "background";
    overlay?: "none" | "frosted" | "faded" | "clear";
    intensity?: number;
    url?: string;
  }) => boolean;
  applyBrandImage: (params: { url: string; role?: "body" | "accent" }) => boolean;
  goToSlide: (index: number) => boolean;
  duplicateActive: () => boolean;
  deleteActive: () => boolean;
  getActiveIndex: () => number;
  getSlideCount: () => number;
}

let handlers: Partial<SlideEditorBusHandlers> | null = null;

export const slideEditorBus = {
  connect(h: Partial<SlideEditorBusHandlers>) {
    handlers = h;
  },
  disconnect() {
    handlers = null;
  },
  isConnected() {
    return handlers !== null;
  },
  call<K extends keyof SlideEditorBusHandlers>(
    name: K,
    ...args: Parameters<NonNullable<SlideEditorBusHandlers[K]>>
  ): ReturnType<NonNullable<SlideEditorBusHandlers[K]>> | null {
    const fn = handlers?.[name] as ((...a: unknown[]) => unknown) | undefined;
    if (typeof fn !== "function") return null;
    return fn(...args) as ReturnType<NonNullable<SlideEditorBusHandlers[K]>>;
  },
};
