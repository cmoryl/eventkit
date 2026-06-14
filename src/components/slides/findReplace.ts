// Pure helpers for deck-wide Find & Replace.
// Searches every user-visible string field on a slide:
//   title, subtitle, body, notes, quoteAuthor, textBoxes[].text,
//   stats[].value/label, timeline[].title/description,
//   process[].title/description, slotValues (string values only).

import type { SlideData } from './slideTypes';

export interface FindMatch {
  /** Slide index in the deck. */
  slideIndex: number;
  /** Which field matched — used for the result list label. */
  field: string;
  /** A short snippet around the first match (for the result list). */
  snippet: string;
  /** Total occurrence count inside that field. */
  count: number;
}

export interface FindOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}

function buildRegex(query: string, opts: FindOptions): RegExp | null {
  if (!query) return null;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = opts.wholeWord ? `\\b${escaped}\\b` : escaped;
  const flags = opts.caseSensitive ? 'g' : 'gi';
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

function snippetAround(text: string, re: RegExp): string {
  re.lastIndex = 0;
  const m = re.exec(text);
  if (!m) return text.slice(0, 60);
  const start = Math.max(0, m.index - 24);
  const end = Math.min(text.length, m.index + m[0].length + 24);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

function countMatches(text: string, re: RegExp): number {
  re.lastIndex = 0;
  let n = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  while (re.exec(text)) {
    n += 1;
    if (re.lastIndex === 0) break; // safety against zero-width matches
  }
  return n;
}

/** Iterate every searchable string field on a slide. */
function* slideStringFields(
  slide: SlideData,
): Generator<{ field: string; value: string; set: (v: string) => SlideData }> {
  const make = (field: keyof SlideData, value: string | undefined) => {
    if (typeof value !== 'string' || !value) return null;
    return {
      field: String(field),
      value,
      set: (v: string) => ({ ...slide, [field]: v }) as SlideData,
    };
  };

  for (const key of ['title', 'subtitle', 'body', 'notes', 'quoteAuthor'] as const) {
    const item = make(key, slide[key] as string | undefined);
    if (item) yield item;
  }

  if (slide.textBoxes?.length) {
    for (let idx = 0; idx < slide.textBoxes.length; idx += 1) {
      const tb = slide.textBoxes[idx];
      if (!tb.text) continue;
      yield {
        field: `textBox#${idx + 1}`,
        value: tb.text,
        set: (v: string) => ({
          ...slide,
          textBoxes: slide.textBoxes!.map((t, i) => (i === idx ? { ...t, text: v } : t)),
        }),
      };
    }
  }

  if (slide.stats?.length) {
    for (let idx = 0; idx < slide.stats.length; idx += 1) {
      const s = slide.stats[idx];
      for (const k of ['value', 'label'] as const) {
        const v = s[k];
        if (!v) continue;
        yield {
          field: `stat#${idx + 1}.${k}`,
          value: v,
          set: (nv: string) => ({
            ...slide,
            stats: slide.stats!.map((row, i) => (i === idx ? { ...row, [k]: nv } : row)),
          }),
        };
      }
    }
  }

  if (slide.timeline?.length) {
    for (let idx = 0; idx < slide.timeline.length; idx += 1) {
      const step = slide.timeline[idx];
      for (const k of ['title', 'description', 'date'] as const) {
        const v = step[k];
        if (!v) continue;
        yield {
          field: `timeline#${idx + 1}.${k}`,
          value: v,
          set: (nv: string) => ({
            ...slide,
            timeline: slide.timeline!.map((row, i) => (i === idx ? { ...row, [k]: nv } : row)),
          }),
        };
      }
    }
  }

  if (slide.process?.length) {
    for (let idx = 0; idx < slide.process.length; idx += 1) {
      const step = slide.process[idx];
      for (const k of ['title', 'description'] as const) {
        const v = step[k];
        if (!v) continue;
        yield {
          field: `process#${idx + 1}.${k}`,
          value: v,
          set: (nv: string) => ({
            ...slide,
            process: slide.process!.map((row, i) => (i === idx ? { ...row, [k]: nv } : row)),
          }),
        };
      }
    }
  }

  if (slide.slotValues) {
    for (const [slotKey, slotVal] of Object.entries(slide.slotValues)) {
      if (typeof slotVal !== 'string' || !slotVal) continue;
      yield {
        field: `slot.${slotKey}`,
        value: slotVal,
        set: (nv: string) => ({
          ...slide,
          slotValues: { ...slide.slotValues, [slotKey]: nv },
        }),
      };
    }
  }
}

export function findInDeck(
  slides: SlideData[],
  query: string,
  opts: FindOptions = {},
): FindMatch[] {
  const re = buildRegex(query, opts);
  if (!re) return [];
  const out: FindMatch[] = [];
  slides.forEach((slide, slideIndex) => {
    for (const f of slideStringFields(slide)) {
      const count = countMatches(f.value, re);
      if (count > 0) {
        out.push({
          slideIndex,
          field: f.field,
          snippet: snippetAround(f.value, re),
          count,
        });
      }
    }
  });
  return out;
}

export interface ReplaceResult {
  slides: SlideData[];
  replacedCount: number;
  affectedSlides: number;
}

export function replaceInDeck(
  slides: SlideData[],
  query: string,
  replacement: string,
  opts: FindOptions = {},
): ReplaceResult {
  const re = buildRegex(query, opts);
  if (!re) return { slides, replacedCount: 0, affectedSlides: 0 };

  let replacedCount = 0;
  let affectedSlides = 0;

  const next = slides.map((slide) => {
    let working = slide;
    let touched = false;
    for (const f of slideStringFields(working)) {
      const localRe = new RegExp(re.source, re.flags);
      const occurrences = countMatches(f.value, localRe);
      if (occurrences === 0) continue;
      const newValue = f.value.replace(localRe, replacement);
      replacedCount += occurrences;
      touched = true;
      // Re-derive setter against the working slide (so chained edits compose).
      // We re-iterate from the up-to-date slide for the next field.
      working = { ...f.set(newValue) };
    }
    if (touched) affectedSlides += 1;
    return working;
  });

  return { slides: next, replacedCount, affectedSlides };
}
