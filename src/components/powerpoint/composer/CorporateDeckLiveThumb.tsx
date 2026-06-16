import React, { useEffect, useState } from 'react';
import { CenteredScaledSlide } from '@/components/slides/ScaledSlide';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { parsePptxFile } from '@/components/slides/importPptx';
import type { SlideData } from '@/components/slides/slideTypes';
import type { CorporateDeckRef } from './corporateDeckPreviews';
import { Loader2 } from 'lucide-react';

/**
 * Module-level cache so each template card only fetches + parses its .pptx
 * once for the whole session. Keyed by deck URL.
 */
const deckCache = new Map<string, Promise<SlideData[]>>();

export const loadDeck = (ref: CorporateDeckRef): Promise<SlideData[]> => {
  const cached = deckCache.get(ref.url);
  if (cached) return cached;
  const p = (async () => {
    const res = await fetch(ref.url);
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    const blob = await res.blob();
    const file = new File([blob], ref.fileName, {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    return await parsePptxFile(file);
  })();
  deckCache.set(ref.url, p);
  // Drop cache entry if the parse failed so a later mount can retry.
  p.catch(() => deckCache.delete(ref.url));
  return p;
};

export type DeckAttachmentStatus = 'loading' | 'ready' | 'failed';

/** Lightweight hook so template cards can show a "deck attached" badge that
 *  reflects whether the bundled .pptx actually fetched + parsed correctly.
 *  Shares the module-level deckCache so it doesn't double-fetch. */
export const useDeckAttachmentStatus = (
  ref?: CorporateDeckRef,
): { status: DeckAttachmentStatus; slideCount: number } => {
  const [status, setStatus] = useState<DeckAttachmentStatus>('loading');
  const [slideCount, setSlideCount] = useState(0);
  useEffect(() => {
    if (!ref) return;
    let alive = true;
    setStatus('loading');
    loadDeck(ref)
      .then((s) => { if (alive) { setSlideCount(s.length); setStatus('ready'); } })
      .catch(() => { if (alive) setStatus('failed'); });
    return () => { alive = false; };
  }, [ref?.url]);
  return { status, slideCount };
};

interface Props {
  deck: CorporateDeckRef;
  /** Optional fallback element rendered while the deck is loading or if parse fails. */
  fallback?: React.ReactNode;
  /** Which slide of the parsed deck to show. Defaults to 0 (cover). */
  slideIndex?: number;
}

/**
 * Live thumbnail of the *real* bundled corporate deck (e.g. TransPerfect 2026).
 * Replaces the synthetic illustration on template cards so what you see in the
 * gallery is what you get when you open the deck in the editor.
 */
export const CorporateDeckLiveThumb: React.FC<Props> = ({ deck, fallback, slideIndex = 0 }) => {
  const [slides, setSlides] = useState<SlideData[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    loadDeck(deck)
      .then((s) => { if (alive) setSlides(s); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [deck]);

  if (failed) return <>{fallback ?? null}</>;
  if (!slides || slides.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <Loader2 className="h-5 w-5 animate-spin text-white/70" />
      </div>
    );
  }
  const slide = slides[Math.min(slideIndex, slides.length - 1)];
  return (
    <div className="absolute inset-0 pointer-events-none">
      <CenteredScaledSlide>
        <SlideRenderer slide={slide} />
      </CenteredScaledSlide>
    </div>
  );
};
