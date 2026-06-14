// Deck-level bulk actions — pure functions that take and return a slides array.
// Used by the toolbar Bulk menu and by the voice agent.

import type { SlideData, SlideBgEffect } from '@/components/slides/slideTypes';

export type DeckBulkActionId =
  | 'reverse'
  | 'clearImages'
  | 'clearAccents'
  | 'syncBackground'
  | 'clearTransitions';

export interface DeckBulkAction {
  id: DeckBulkActionId;
  label: string;
  description: string;
  /** When true the action needs an active-slide index (e.g. syncBackground). */
  needsActive?: boolean;
}

export const DECK_BULK_ACTIONS: DeckBulkAction[] = [
  { id: 'reverse', label: 'Reverse slide order', description: 'Flip the deck end-to-end.' },
  { id: 'clearImages', label: 'Remove all body images', description: 'Strip imageUrl from every slide.' },
  { id: 'clearAccents', label: 'Remove all accent images', description: 'Strip Gamma-style accent overlays.' },
  {
    id: 'syncBackground',
    label: 'Sync background from active',
    description: 'Apply the active slide bgColor + bgEffect to every slide.',
    needsActive: true,
  },
  { id: 'clearTransitions', label: 'Clear slide transitions', description: 'Reset per-slide transition overrides.' },
];

interface ApplyOpts {
  activeIndex?: number;
}

export function applyDeckBulkAction(
  action: DeckBulkActionId,
  slides: SlideData[],
  opts: ApplyOpts = {},
): SlideData[] {
  switch (action) {
    case 'reverse':
      return [...slides].reverse();

    case 'clearImages':
      return slides.map((s) => {
        const { imageUrl: _i, ...rest } = s as SlideData & { imageUrl?: string };
        return rest as SlideData;
      });

    case 'clearAccents':
      return slides.map((s) => {
        const { accentImage: _a, ...rest } = s as SlideData & { accentImage?: unknown };
        return rest as SlideData;
      });

    case 'syncBackground': {
      const idx = opts.activeIndex ?? 0;
      const ref = slides[idx];
      if (!ref) return slides;
      const bgColor = (ref as SlideData & { bgColor?: string }).bgColor;
      const bgEffect = (ref as SlideData & { bgEffect?: SlideBgEffect }).bgEffect;
      return slides.map((s) => ({
        ...s,
        ...(bgColor !== undefined ? { bgColor } : {}),
        ...(bgEffect !== undefined ? { bgEffect } : {}),
      }));
    }

    case 'clearTransitions':
      return slides.map((s) => {
        const { transition: _t, ...rest } = s as SlideData & { transition?: unknown };
        return rest as SlideData;
      });

    default:
      return slides;
  }
}
