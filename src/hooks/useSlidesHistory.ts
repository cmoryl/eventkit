// useSlidesHistory — lightweight undo/redo for the slide deck. Snapshots the
// slides array (debounced) and exposes undo/redo handlers. Snapshots are
// deduped by reference so applying setSlides(prev => prev) is free.

import { useEffect, useRef, useState, useCallback } from 'react';
import type { SlideData } from '@/components/slides/slideTypes';

const MAX_HISTORY = 50;

export interface SlidesHistory {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  /** Force-record a snapshot immediately (e.g. before a destructive bulk op). */
  snapshot: () => void;
}

export function useSlidesHistory(
  slides: SlideData[],
  setSlides: (next: SlideData[]) => void,
  opts: { debounceMs?: number; enabled?: boolean } = {}
): SlidesHistory {
  const { debounceMs = 350, enabled = true } = opts;
  const past = useRef<SlideData[][]>([]);
  const future = useRef<SlideData[][]>([]);
  const last = useRef<SlideData[] | null>(null);
  const suspend = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, force] = useState(0);
  const tick = useCallback(() => force((n) => n + 1), []);

  // Seed the first snapshot.
  useEffect(() => {
    if (last.current === null && slides) {
      last.current = slides;
    }
  }, [slides]);

  // Watch slides → push to past stack after a quiet period.
  useEffect(() => {
    if (!enabled) return;
    if (suspend.current) {
      // Undo/redo applied this change — just sync `last`, do not record.
      last.current = slides;
      suspend.current = false;
      return;
    }
    if (last.current === slides) return;
    if (timer.current) clearTimeout(timer.current);
    const prev = last.current;
    timer.current = setTimeout(() => {
      if (!prev) {
        last.current = slides;
        return;
      }
      past.current.push(prev);
      if (past.current.length > MAX_HISTORY) past.current.shift();
      future.current = [];
      last.current = slides;
      tick();
    }, debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [slides, enabled, debounceMs, tick]);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    if (last.current) future.current.push(last.current);
    suspend.current = true;
    setSlides(prev);
    tick();
  }, [setSlides, tick]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    if (last.current) past.current.push(last.current);
    suspend.current = true;
    setSlides(next);
    tick();
  }, [setSlides, tick]);

  const snapshot = useCallback(() => {
    if (!last.current) return;
    past.current.push(last.current);
    if (past.current.length > MAX_HISTORY) past.current.shift();
    future.current = [];
    tick();
  }, [tick]);

  return {
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    undo,
    redo,
    snapshot,
  };
}
