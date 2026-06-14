import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { SlideData } from './slideTypes';
import { GraphicSwapPopover } from './GraphicSwapPopover';

interface Props {
  slide: SlideData;
  onUpdate: (updates: Partial<SlideData>) => void;
  /** When false, only image dbl-click works (text + shapes disabled). */
  enabled?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a SlideRenderer and gives every element click/double-click editing
 * super-powers — text via contentEditable, images via file picker, and
 * decorative shapes (orbs, dotted grid, corner brackets, accent bars, cards)
 * via a floating color/visibility toolbar.
 *
 * Field paths supported (data-slide-field):
 *   - "title" | "subtitle" | "body" | "quoteAuthor"
 *   - "stats.<i>.value" | "stats.<i>.label"
 *   - "timeline.<i>.title" | "timeline.<i>.date" | "timeline.<i>.description"
 *   - "process.<i>.title" | "process.<i>.description"
 *   - "agenda.<i>"   (writes back into the body string, line-indexed)
 *
 * Image markers (data-slide-image):
 *   - "hero"       → updates slide.imageUrl
 *   - "images.<i>" → updates slide.images[i]
 *
 * Shape markers — auto-tagged on demo-mock slides via heuristic, then keyed
 * into slide.demoOverrides[id] = { color, hidden }.
 */
export function InlineEditOverlay({ slide, onUpdate: rawOnUpdate, enabled = true, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageTargetRef = useRef<string | null>(null);
  const slideRef = useRef(slide);
  slideRef.current = slide;

  /* ----------------------------------------------------------------------
   * UNDO / REDO — every onUpdate() called from within this overlay first
   * snapshots the previous values of the keys being changed onto an undo
   * stack. Industry-standard shortcuts:
   *   - Cmd/Ctrl + Z       → undo
   *   - Cmd/Ctrl + Shift+Z → redo
   *   - Ctrl + Y           → redo (Windows convention)
   * Stack is capped at 100 entries.
   * -------------------------------------------------------------------- */
  type Snap = Partial<SlideData>;
  const undoStackRef = useRef<Snap[]>([]);
  const redoStackRef = useRef<Snap[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const bumpHistory = () => setHistoryTick((t) => t + 1);

  const onUpdate = React.useCallback((updates: Partial<SlideData>) => {
    // Snapshot the *current* values for the keys about to change
    const prev: Snap = {};
    const cur = slideRef.current as any;
    for (const k of Object.keys(updates)) {
      (prev as any)[k] = cur[k];
    }
    undoStackRef.current.push(prev);
    if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    redoStackRef.current = [];
    bumpHistory();
    rawOnUpdate(updates);
  }, [rawOnUpdate]);

  const undo = React.useCallback(() => {
    const snap = undoStackRef.current.pop();
    if (!snap) return;
    // Save inverse for redo
    const inverse: Snap = {};
    const cur = slideRef.current as any;
    for (const k of Object.keys(snap)) {
      (inverse as any)[k] = cur[k];
    }
    redoStackRef.current.push(inverse);
    bumpHistory();
    rawOnUpdate(snap);
  }, [rawOnUpdate]);

  const redo = React.useCallback(() => {
    const snap = redoStackRef.current.pop();
    if (!snap) return;
    const inverse: Snap = {};
    const cur = slideRef.current as any;
    for (const k of Object.keys(snap)) {
      (inverse as any)[k] = cur[k];
    }
    undoStackRef.current.push(inverse);
    bumpHistory();
    rawOnUpdate(snap);
  }, [rawOnUpdate]);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;
  // Reference historyTick so React re-renders when the stacks change
  void historyTick;

  // Global keyboard shortcuts — Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Ctrl+Y
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      // Don't intercept while typing in editable fields
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.isContentEditable || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, undo, redo]);

  const [shapeToolbar, setShapeToolbar] = useState<{
    id: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const [swapOpen, setSwapOpen] = useState(false);

  const [sectionToolbar, setSectionToolbar] = useState<{
    id: string;
    x: number;
    y: number;
    /** Bounding rect of section in wrapper-local coords — drives handle positions */
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  /** User-configurable rotation snap increment in degrees (used when Shift held). */
  const [rotateSnap, setRotateSnap] = useState<number>(15);
  const rotateSnapRef = useRef(rotateSnap);
  rotateSnapRef.current = rotateSnap;

  const dragRef = useRef<{
    id: string;
    el: HTMLElement;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    slideW: number;
    slideH: number;
  } | null>(null);

  const resizeRef = useRef<{
    id: string;
    el: HTMLElement;
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
    startX: number;
    startY: number;
    baseSx: number;
    baseSy: number;
    /** Natural (unscaled) width/height in px at drag start */
    naturalW: number;
    naturalH: number;
  } | null>(null);

  /* ----------------------------------------------------------------------
   * SHAPE AUTO-TAGGING — walks the rendered tree and assigns a stable
   * data-slide-shape="..." id to every decorative element. We then re-apply
   * any user overrides (color/hide) on every render.
   * -------------------------------------------------------------------- */
  useLayoutEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const overrides = slide.demoOverrides || {};
    const seenIds = new Map<string, number>();
    const nextId = (base: string) => {
      const n = (seenIds.get(base) ?? 0) + 1;
      seenIds.set(base, n);
      return n === 1 ? base : `${base}-${n}`;
    };

    // Heuristic: candidate decorative elements.
    //   - Any element with inline background / backgroundImage that isn't text
    //   - SVG <path> / <rect> / <circle> with a stroke or fill
    //   - Elements with class containing 'rounded-full' (orbs/dots)
    const candidates: HTMLElement[] = [];
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (el.hasAttribute('data-slide-field') || el.hasAttribute('data-slide-image')) return;
      if (el.closest('[data-slide-field]')) return;
      // Already tagged by a previous pass — preserve id, just re-apply overrides
      const existing = el.getAttribute('data-slide-shape');
      if (existing) { candidates.push(el); return; }

      const style = el.getAttribute('style') || '';
      const cls = el.getAttribute('class') || '';

      const looksDecorative =
        /background(-image)?:|background:/i.test(style) ||
        /rounded-full|blur-3xl|opacity-/.test(cls) ||
        el.tagName === 'svg' || el.tagName === 'path' ||
        (el.hasAttribute('aria-hidden') && el.tagName === 'DIV');

      if (!looksDecorative) return;
      // Skip elements that wrap actual text content
      if (el.innerText && el.innerText.trim().length > 0 && el.children.length === 0) return;

      candidates.push(el);
    });

    candidates.forEach((el) => {
      let id = el.getAttribute('data-slide-shape');
      if (!id) {
        // Derive a base name from class hints
        const cls = el.getAttribute('class') || '';
        let base = 'shape';
        if (/blur-3xl/.test(cls)) base = 'orb';
        else if (/rounded-full/.test(cls)) base = 'dot';
        else if (/rounded-(xl|2xl|lg)/.test(cls)) base = 'card';
        else if (el.tagName === 'svg') base = 'svg';
        else if (/dotted|grid|backgroundImage/i.test((el.getAttribute('style') || ''))) base = 'grid';
        else if (/bottom-0|top-0/.test(cls)) base = 'bar';
        id = nextId(base);
        el.setAttribute('data-slide-shape', id);
      }

      // Apply overrides
      const ov = overrides[id];
      if (ov?.hidden) {
        el.style.display = 'none';
      } else {
        // Restore display if previously hidden
        if (el.style.display === 'none') el.style.display = '';
      }
      if (ov?.color) {
        if (el.tagName === 'svg' || el.tagName === 'path' || el.tagName === 'CIRCLE' || el.tagName === 'RECT') {
          el.setAttribute('stroke', ov.color);
          el.querySelectorAll('path, rect, circle').forEach((c) => c.setAttribute('stroke', ov.color!));
        } else {
          el.style.background = ov.color;
        }
      }

      // SVG / image swap — replace the shape's visible content with the
      // chosen library SVG or AI-generated image. Cached via data-* sentinel
      // so we don't re-inject DOM on every render.
      const swapSig =
        (ov?.svg ? `svg:${ov.svg.length}:${ov.svg.slice(0, 40)}` : '') +
        (ov?.imageUrl ? `img:${ov.imageUrl.slice(0, 80)}` : '');
      if (swapSig && el.getAttribute('data-shape-swap') !== swapSig) {
        // Stash the original ONCE so reset can restore it
        if (!el.hasAttribute('data-shape-original')) {
          el.setAttribute('data-shape-original', el.innerHTML);
        }
        el.style.background = '';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.overflow = 'hidden';
        if (ov?.imageUrl) {
          el.innerHTML = `<img src="${ov.imageUrl}" alt="" style="width:100%;height:100%;object-fit:contain;display:block" />`;
        } else if (ov?.svg) {
          // SVG already styles itself to fill 100% via the wrap() helper.
          el.innerHTML = ov.svg;
        }
        el.setAttribute('data-shape-swap', swapSig);
      } else if (!swapSig && el.hasAttribute('data-shape-swap')) {
        // Override removed → restore original markup
        const orig = el.getAttribute('data-shape-original');
        if (orig !== null) el.innerHTML = orig;
        el.removeAttribute('data-shape-swap');
        el.removeAttribute('data-shape-original');
      }
    });

    /* ------------------------------------------------------------------
     * SECTION AUTO-TAGGING — finds top-level "section" blocks inside
     * SlideMock (grid items, agenda cards, stat tiles, KPI columns…)
     * and assigns a stable data-slide-section id. Then applies
     * move/hide/duplicate overrides.
     * ---------------------------------------------------------------- */
    const sectionOverrides = slide.demoSectionOverrides || {};
    const sectionSeen = new Map<string, number>();
    const sectionId = (base: string) => {
      const n = (sectionSeen.get(base) ?? 0) + 1;
      sectionSeen.set(base, n);
      return n === 1 ? base : `${base}-${n}`;
    };

    const sectionCandidates: HTMLElement[] = [];
    // Strategy: any direct child of a `grid` container that contains text/img is
    // a "section". Plus any `.rounded-lg/xl/2xl` block that holds Editable text.
    root.querySelectorAll<HTMLElement>('.grid > *, .flex > .rounded-lg, .flex > .rounded-xl').forEach((el) => {
      if (el.hasAttribute('data-slide-shape')) return;
      if (el.children.length === 0) return;
      // must have visible text or an image inside
      if (!el.innerText.trim() && !el.querySelector('img, svg')) return;
      sectionCandidates.push(el);
    });
    // Also tag big standalone p-* blocks (title, hero text columns)
    root.querySelectorAll<HTMLElement>('[class*="p-10"], [class*="p-8"]').forEach((el) => {
      if (el.parentElement?.classList.contains('grid')) return; // already covered
      if (el.children.length === 0) return;
      sectionCandidates.push(el);
    });

    sectionCandidates.forEach((el) => {
      let id = el.getAttribute('data-slide-section');
      if (!id) {
        const cls = el.getAttribute('class') || '';
        let base = 'section';
        if (/rounded-(lg|xl|2xl)/.test(cls)) base = 'card';
        else if (/p-10|p-8/.test(cls)) base = 'pane';
        id = sectionId(base);
        el.setAttribute('data-slide-section', id);
        // make positioned so transform works
        const pos = getComputedStyle(el).position;
        if (pos === 'static') el.style.position = 'relative';
      }
      const ov = sectionOverrides[id];
      const dx = ov?.dx || 0;
      const dy = ov?.dy || 0;
      const sx = ov?.sx ?? 1;
      const sy = ov?.sy ?? 1;
      const rot = ov?.rotate || 0;
      const hasT = dx || dy || sx !== 1 || sy !== 1 || rot;
      el.style.transform = hasT
        ? `translate(${dx}%, ${dy}%) rotate(${rot}deg) scale(${sx}, ${sy})`
        : '';
      // Center origin keeps rotation visually pivoted on the section,
      // and translate(%) is relative to element size regardless of origin so
      // drag math (% of slide) and resize math (bounding rect deltas) still hold.
      el.style.transformOrigin = 'center center';
      el.style.transition =
        dragRef.current?.id === id || resizeRef.current?.id === id ? 'none' : 'transform 120ms ease-out';
      if (ov?.hidden) el.style.display = 'none';
      else if (el.style.display === 'none' && !overrides[el.getAttribute('data-slide-shape') || '']?.hidden) el.style.display = '';
    });
  });

  /* ----------------------------------------------------------------------
   * Click / dblclick handling — text edit, image swap, shape toolbar.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const isAlreadyEditing = (el: HTMLElement) =>
      el.getAttribute('contenteditable') === 'true';

    const writeField = (field: string, text: string) => {
      const s = slideRef.current;
      if (field === 'title' || field === 'subtitle' || field === 'body' || field === 'quoteAuthor') {
        if ((s as any)[field] === text) return;
        onUpdate({ [field]: text } as any);
        return;
      }
      const parts = field.split('.');
      if (parts.length === 3) {
        const [arrayKey, idxStr, prop] = parts;
        const idx = parseInt(idxStr, 10);
        const arr = ((s as any)[arrayKey] || []).slice();
        if (!arr[idx]) return;
        if (arr[idx][prop] === text) return;
        arr[idx] = { ...arr[idx], [prop]: text };
        onUpdate({ [arrayKey]: arr } as any);
        return;
      }
      if (parts.length === 2 && parts[0] === 'agenda') {
        const idx = parseInt(parts[1], 10);
        const lines = (s.body || '').split('\n');
        if (lines[idx] === text) return;
        lines[idx] = text;
        onUpdate({ body: lines.join('\n') });
      }
    };

    const finishEdit = (el: HTMLElement, field: string) => {
      el.removeAttribute('contenteditable');
      el.style.outline = '';
      el.style.cursor = '';
      const text = (el.innerText || '').replace(/\u00A0/g, ' ').replace(/\s+\n/g, '\n').trimEnd();
      writeField(field, text);
    };

    const startEdit = (el: HTMLElement, field: string) => {
      if (isAlreadyEditing(el)) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'true');
      el.style.outline = '2px dashed hsl(var(--primary) / 0.6)';
      el.style.cursor = 'text';
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const onBlur = () => {
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('keydown', onKey);
        finishEdit(el, field);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); el.blur(); }
        else if (e.key === 'Enter' && !e.shiftKey && !el.dataset.slideMultiline) {
          e.preventDefault();
          el.blur();
        }
      };
      el.addEventListener('blur', onBlur);
      el.addEventListener('keydown', onKey);
    };

    const onClick = (e: MouseEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      // Don't capture clicks on text being edited or on text fields directly
      if (target.closest('[contenteditable="true"]')) return;
      const shapeEl = target.closest<HTMLElement>('[data-slide-shape]');
      if (shapeEl && !target.closest('[data-slide-field]') && !target.closest('[data-slide-image]')) {
        e.preventDefault();
        e.stopPropagation();
        const id = shapeEl.getAttribute('data-slide-shape')!;
        const rect = shapeEl.getBoundingClientRect();
        const wrapRect = root.getBoundingClientRect();
        const computed = getComputedStyle(shapeEl);
        const currentColor =
          slideRef.current.demoOverrides?.[id]?.color ||
          (shapeEl.tagName === 'svg' || shapeEl.tagName === 'path'
            ? shapeEl.getAttribute('stroke') || '#ffffff'
            : rgbToHex(computed.backgroundColor) || '#ffffff');
        setShapeToolbar({
          id,
          x: rect.left - wrapRect.left + rect.width / 2,
          y: rect.top - wrapRect.top,
          color: currentColor,
        });
        // Outline the selected shape
        document.querySelectorAll<HTMLElement>('[data-shape-selected]').forEach((n) => {
          n.removeAttribute('data-shape-selected');
          n.style.outline = '';
        });
        shapeEl.setAttribute('data-shape-selected', '1');
        shapeEl.style.outline = '2px solid hsl(var(--primary))';
        shapeEl.style.outlineOffset = '2px';
        return;
      }

      // SECTION SELECT — Alt+click anywhere in a section, or click on a
      // section's empty padding (no shape/field/image hit).
      const sectionEl = target.closest<HTMLElement>('[data-slide-section]');
      const onAnyEditable =
        target.closest('[data-slide-field]') ||
        target.closest('[data-slide-image]') ||
        target.tagName === 'IMG';
      if (sectionEl && (e.altKey || !onAnyEditable)) {
        e.preventDefault();
        e.stopPropagation();
        const id = sectionEl.getAttribute('data-slide-section')!;
        const rect = sectionEl.getBoundingClientRect();
        const wrapRect = root.getBoundingClientRect();
        setSectionToolbar({
          id,
          x: rect.left - wrapRect.left + rect.width / 2,
          y: rect.top - wrapRect.top,
          left: rect.left - wrapRect.left,
          top: rect.top - wrapRect.top,
          width: rect.width,
          height: rect.height,
        });
        document.querySelectorAll<HTMLElement>('[data-section-selected]').forEach((n) => {
          n.removeAttribute('data-section-selected');
          n.style.outline = '';
        });
        sectionEl.setAttribute('data-section-selected', '1');
        sectionEl.style.outline = '2px solid hsl(var(--primary))';
        sectionEl.style.outlineOffset = '4px';
        return;
      }

      // Click outside any shape/section closes toolbars
      setShapeToolbar(null);
      setSectionToolbar(null);
      setSwapOpen(false);
      document.querySelectorAll<HTMLElement>('[data-shape-selected], [data-section-selected]').forEach((n) => {
        n.removeAttribute('data-shape-selected');
        n.removeAttribute('data-section-selected');
        n.style.outline = '';
      });
    };

    // DRAG to move sections (mousedown on a selected section starts a drag)
    const onMouseDown = (e: MouseEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-slide-field], [data-slide-image], img, [contenteditable="true"]')) return;
      const sectionEl = target.closest<HTMLElement>('[data-slide-section][data-section-selected]');
      if (!sectionEl) return;
      e.preventDefault();
      const id = sectionEl.getAttribute('data-slide-section')!;
      const wrapRect = root.getBoundingClientRect();
      const ov = slideRef.current.demoSectionOverrides?.[id];
      dragRef.current = {
        id,
        el: sectionEl,
        startX: e.clientX,
        startY: e.clientY,
        baseDx: ov?.dx || 0,
        baseDy: ov?.dy || 0,
        slideW: wrapRect.width,
        slideH: wrapRect.height,
      };
      sectionEl.style.cursor = 'grabbing';
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
    };

    const onDragMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dxPct = d.baseDx + ((e.clientX - d.startX) / d.slideW) * 100;
      const dyPct = d.baseDy + ((e.clientY - d.startY) / d.slideH) * 100;
      const ov = slideRef.current.demoSectionOverrides?.[d.id];
      const sx = ov?.sx ?? 1;
      const sy = ov?.sy ?? 1;
      const rot = ov?.rotate || 0;
      d.el.style.transformOrigin = 'center center';
      d.el.style.transform = `translate(${dxPct}%, ${dyPct}%) rotate(${rot}deg) scale(${sx}, ${sy})`;
      d.el.style.transition = 'none';
      // Re-anchor toolbar
      const r = d.el.getBoundingClientRect();
      const wr = root.getBoundingClientRect();
      setSectionToolbar((s) =>
        s
          ? {
              ...s,
              x: r.left - wr.left + r.width / 2,
              y: r.top - wr.top,
              left: r.left - wr.left,
              top: r.top - wr.top,
              width: r.width,
              height: r.height,
            }
          : s,
      );
    };

    const onDragEnd = (e: MouseEvent) => {
      const d = dragRef.current;
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      if (!d) return;
      d.el.style.cursor = '';
      const dx = d.baseDx + ((e.clientX - d.startX) / d.slideW) * 100;
      const dy = d.baseDy + ((e.clientY - d.startY) / d.slideH) * 100;
      const next = { ...(slideRef.current.demoSectionOverrides || {}) };
      next[d.id] = { ...next[d.id], dx, dy };
      onUpdate({ demoSectionOverrides: next });
      dragRef.current = null;
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      if (!target) return;
      const imgEl = target.closest<HTMLElement>('[data-slide-image], img');
      if (imgEl) {
        const which =
          imgEl.getAttribute('data-slide-image') ||
          (imgEl.tagName === 'IMG' ? 'hero' : null);
        if (which) {
          pendingImageTargetRef.current = which;
          fileInputRef.current?.click();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      const fieldEl = target.closest<HTMLElement>('[data-slide-field]');
      if (fieldEl) {
        e.preventDefault();
        e.stopPropagation();
        startEdit(fieldEl, fieldEl.getAttribute('data-slide-field')!);
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const editable = t.closest<HTMLElement>('[data-slide-field], [data-slide-image]');
      if (editable && !editable.getAttribute('contenteditable')) {
        editable.style.cursor = 'pointer';
        editable.title = 'Double-click to edit';
        return;
      }
      const shape = t.closest<HTMLElement>('[data-slide-shape]');
      if (shape) {
        shape.style.cursor = 'pointer';
        shape.title = 'Click to recolor or hide';
        return;
      }
      const section = t.closest<HTMLElement>('[data-slide-section]');
      if (section) {
        section.title = 'Alt+click or click padding to select section · drag to move';
      }
    };

    root.addEventListener('click', onClick);
    root.addEventListener('dblclick', onDoubleClick);
    root.addEventListener('mouseover', onMouseOver);
    root.addEventListener('mousedown', onMouseDown);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('dblclick', onDoubleClick);
      root.removeEventListener('mouseover', onMouseOver);
      root.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [enabled, onUpdate]);

  /* ----------------------------------------------------------------------
   * KEYBOARD FINE-TUNING — when a section is selected, Left/Right arrows
   * rotate it by the current snap increment. Modifiers:
   *   - Alt  = fine (1°)
   *   - Shift = coarse (90°)
   *   - default = current rotateSnap value
   * Up/Down arrows are reserved for future scale tweaks; we ignore them
   * here so they still scroll the page when no section is selected.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (!sectionToolbar) return;
      // Don't intercept while typing in an editable field or input
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.isContentEditable || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const step = e.altKey ? 1 : e.shiftKey ? 90 : (rotateSnapRef.current || 15);
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const cur = slideRef.current.demoSectionOverrides?.[sectionToolbar.id] || {};
      let next = (cur.rotate || 0) + dir * step;
      next = ((next + 180) % 360 + 360) % 360 - 180; // normalize
      updateSection(sectionToolbar.id, { rotate: next });

      // Re-anchor toolbar after the transform updates next frame
      requestAnimationFrame(() => {
        const root = wrapperRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLElement>(`[data-slide-section="${sectionToolbar.id}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const wr = root.getBoundingClientRect();
        setSectionToolbar((s) =>
          s
            ? {
                ...s,
                x: r.left - wr.left + r.width / 2,
                y: r.top - wr.top,
                left: r.left - wr.left,
                top: r.top - wr.top,
                width: r.width,
                height: r.height,
              }
            : s,
        );
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, sectionToolbar, onUpdate]);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const target = pendingImageTargetRef.current;
    pendingImageTargetRef.current = null;
    if (!target) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    if (target === 'hero') { onUpdate({ imageUrl: dataUrl }); return; }
    const m = target.match(/^images\.(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      const next = (slideRef.current.images || []).slice();
      next[idx] = dataUrl;
      onUpdate({ images: next });
    }
  };

  const updateShape = (
    id: string,
    patch: { color?: string; hidden?: boolean; svg?: string; imageUrl?: string },
  ) => {
    const next = { ...(slideRef.current.demoOverrides || {}) };
    next[id] = { ...next[id], ...patch };
    onUpdate({ demoOverrides: next });
  };

  /**
   * Apply a graphic swap to one shape, or to every detected decorative shape
   * on the slide ("all" scope from the swap popover).
   */
  const applySwap = (
    activeId: string,
    payload: { svg?: string; imageUrl?: string },
    scope: 'this' | 'all',
  ) => {
    if (scope === 'this') {
      updateShape(activeId, payload);
      return;
    }
    const root = wrapperRef.current;
    if (!root) {
      updateShape(activeId, payload);
      return;
    }
    const next = { ...(slideRef.current.demoOverrides || {}) };
    // Swap every detected decorative shape EXCEPT pure backgrounds
    // (orbs/grids that span the full slide). Heuristic: skip elements
    // whose own bbox is >= 70% of the slide on either axis.
    const wrapRect = root.getBoundingClientRect();
    root.querySelectorAll<HTMLElement>('[data-slide-shape]').forEach((el) => {
      const id = el.getAttribute('data-slide-shape');
      if (!id) return;
      const r = el.getBoundingClientRect();
      const tooBig = r.width / wrapRect.width > 0.7 || r.height / wrapRect.height > 0.7;
      if (tooBig) return;
      next[id] = { ...next[id], ...payload };
    });
    onUpdate({ demoOverrides: next });
  };

  const updateSection = (
    id: string,
    patch: { dx?: number; dy?: number; sx?: number; sy?: number; rotate?: number; hidden?: boolean },
  ) => {
    const next = { ...(slideRef.current.demoSectionOverrides || {}) };
    next[id] = { ...next[id], ...patch };
    onUpdate({ demoSectionOverrides: next });
  };
  const resetSection = (id: string) => {
    const next = { ...(slideRef.current.demoSectionOverrides || {}) };
    delete next[id];
    onUpdate({ demoSectionOverrides: next });
  };
  const nudge = (id: string, dx: number, dy: number) => {
    const cur = slideRef.current.demoSectionOverrides?.[id] || {};
    updateSection(id, { dx: (cur.dx || 0) + dx, dy: (cur.dy || 0) + dy });
  };

  /** Begin a free-rotation drag from the rotation handle above the section. */
  const startRotate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sectionToolbar) return;
    const root = wrapperRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-slide-section="${sectionToolbar.id}"]`,
    );
    if (!el) return;

    const id = sectionToolbar.id;
    const ov = slideRef.current.demoSectionOverrides?.[id] || {};
    const baseRot = ov.rotate || 0;

    // Pivot = center of the rendered section in viewport coords
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    const apply = (ev: MouseEvent, commit: boolean) => {
      const ang = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      let next = baseRot + (ang - startAngle);
      const snap = rotateSnapRef.current;
      if (ev.shiftKey && snap > 0) next = Math.round(next / snap) * snap; // snap
      next = ((next + 180) % 360 + 360) % 360 - 180;       // normalize

      const cur = slideRef.current.demoSectionOverrides?.[id] || {};
      const dxPct = cur.dx || 0;
      const dyPct = cur.dy || 0;
      const sx = cur.sx ?? 1;
      const sy = cur.sy ?? 1;
      el.style.transformOrigin = 'center center';
      el.style.transform = `translate(${dxPct}%, ${dyPct}%) rotate(${next}deg) scale(${sx}, ${sy})`;
      el.style.transition = 'none';

      const r = el.getBoundingClientRect();
      const wr = root.getBoundingClientRect();
      setSectionToolbar((s) =>
        s
          ? {
              ...s,
              x: r.left - wr.left + r.width / 2,
              y: r.top - wr.top,
              left: r.left - wr.left,
              top: r.top - wr.top,
              width: r.width,
              height: r.height,
            }
          : s,
      );

      if (commit) updateSection(id, { rotate: next });
    };

    const onMove = (ev: MouseEvent) => apply(ev, false);
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      apply(ev, true);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /** Begin a resize drag from one of the 8 handles around the selected section. */
  const startResize = (
    e: React.MouseEvent,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w',
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sectionToolbar) return;
    const root = wrapperRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-slide-section="${sectionToolbar.id}"]`,
    );
    if (!el) return;

    const ov = slideRef.current.demoSectionOverrides?.[sectionToolbar.id] || {};
    const baseSx = ov.sx ?? 1;
    const baseSy = ov.sy ?? 1;
    // Natural (unscaled) dims: undo the current scale on rendered size.
    const rect = el.getBoundingClientRect();
    const naturalW = rect.width / baseSx;
    const naturalH = rect.height / baseSy;

    resizeRef.current = {
      id: sectionToolbar.id,
      el,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      baseSx,
      baseSy,
      naturalW,
      naturalH,
    };

    const onMove = (ev: MouseEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      const dx = ev.clientX - r.startX;
      const dy = ev.clientY - r.startY;
      let sx = r.baseSx;
      let sy = r.baseSy;

      // Sign per handle (which side of the box is being dragged).
      const east = r.handle.includes('e');
      const west = r.handle.includes('w');
      const south = r.handle.includes('s');
      const north = r.handle.includes('n');

      if (east) sx = r.baseSx + dx / r.naturalW;
      if (west) sx = r.baseSx - dx / r.naturalW;
      if (south) sy = r.baseSy + dy / r.naturalH;
      if (north) sy = r.baseSy - dy / r.naturalH;

      // Shift = uniform scale (preserve aspect ratio from the dominant axis)
      if (ev.shiftKey && (east || west) && (north || south)) {
        const uniform = Math.max(sx, sy);
        sx = uniform;
        sy = uniform;
      } else if (ev.shiftKey) {
        if (east || west) sy = r.baseSy * (sx / r.baseSx);
        if (north || south) sx = r.baseSx * (sy / r.baseSy);
      }

      sx = Math.max(0.2, Math.min(4, sx));
      sy = Math.max(0.2, Math.min(4, sy));

      const cur = slideRef.current.demoSectionOverrides?.[r.id] || {};
      const dxPct = cur.dx || 0;
      const dyPct = cur.dy || 0;
      const rot = cur.rotate || 0;
      r.el.style.transformOrigin = 'center center';
      r.el.style.transform = `translate(${dxPct}%, ${dyPct}%) rotate(${rot}deg) scale(${sx}, ${sy})`;
      r.el.style.transition = 'none';

      // Re-anchor toolbar + handles to the new bounding rect
      const newRect = r.el.getBoundingClientRect();
      const wr = root.getBoundingClientRect();
      setSectionToolbar((s) =>
        s
          ? {
              ...s,
              x: newRect.left - wr.left + newRect.width / 2,
              y: newRect.top - wr.top,
              left: newRect.left - wr.left,
              top: newRect.top - wr.top,
              width: newRect.width,
              height: newRect.height,
            }
          : s,
      );
    };

    const onUp = () => {
      const r = resizeRef.current;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (!r) return;
      const finalRect = r.el.getBoundingClientRect();
      const sx = Math.max(0.2, Math.min(4, finalRect.width / r.naturalW));
      const sy = Math.max(0.2, Math.min(4, finalRect.height / r.naturalH));
      updateSection(r.id, { sx, sy });
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ----------------------------------------------------------------------
   * FREE-FLOATING TEXT BOXES — overlay layer above any slide content.
   * Positions/sizes are stored in % so they survive zoom + export.
   * -------------------------------------------------------------------- */
  const textBoxes = (slide as any).textBoxes as SlideData['textBoxes'] | undefined;
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  // Additional multi-selected ids (primary id is selectedTextBoxId). Effective
  // selection = union(selectedTextBoxId, multiIds). Group ops act on the union.
  const [multiIds, setMultiIds] = useState<string[]>([]);
  const tbDragRef = useRef<{
    id: string; mode: 'move' | 'resize'; startX: number; startY: number; rect: DOMRect;
    orig: { xPct: number; yPct: number; wPct: number; fontSize: number };
    snapDisabled: boolean;
    /** Group move payload — populated when 2+ boxes are selected at drag start. */
    group?: Array<{ id: string; xPct: number; yPct: number }>;
  } | null>(null);
  // Marquee selection rect, in % of slide. Active while pointer-dragging on empty canvas.
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeRef = useRef<{ rect: DOMRect; startX: number; startY: number; additive: boolean } | null>(null);
  // Smart guides shown during a drag: arrays of %-positions on each axis.
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });

  // Effective selection = primary + multi (deduped). Used by group ops below.
  const effectiveIds = useMemo(() => {
    const set = new Set<string>(multiIds);
    if (selectedTextBoxId) set.add(selectedTextBoxId);
    return [...set];
  }, [selectedTextBoxId, multiIds]);

  // Bounding box (in % of canvas) around the multi-selection. Measured from the
  // live DOM so it tracks wrapping and font-driven heights. Recomputes when
  // selection or text-box payload changes.
  const [groupBBox, setGroupBBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    if (effectiveIds.length < 2) { setGroupBBox(null); return; }
    const root = wrapperRef.current?.parentElement;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const rects: DOMRect[] = [];
    for (const id of effectiveIds) {
      const el = root.querySelector(`[data-tb-id="${id}"]`) as HTMLElement | null;
      if (el) rects.push(el.getBoundingClientRect());
    }
    if (rects.length === 0) { setGroupBBox(null); return; }
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    setGroupBBox({
      x: ((left - rootRect.left) / rootRect.width) * 100,
      y: ((top - rootRect.top) / rootRect.height) * 100,
      w: ((right - left) / rootRect.width) * 100,
      h: ((bottom - top) / rootRect.height) * 100,
    });
  }, [effectiveIds.join(','), textBoxes]);

  // Group-resize drag: scales every selected text box relative to the anchor
  // (the corner/edge opposite the grabbed handle).
  type GroupHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  const groupResizeRef = useRef<{
    handle: GroupHandle;
    rect: DOMRect;
    bbox: { x: number; y: number; w: number; h: number };
    anchor: { x: number; y: number };
    items: Array<{ id: string; xPct: number; yPct: number; wPct: number; fontSize: number }>;
  } | null>(null);

  const startGroupResize = (e: React.PointerEvent, handle: GroupHandle) => {
    e.stopPropagation();
    e.preventDefault();
    const root = wrapperRef.current?.parentElement;
    if (!root || !groupBBox) return;
    const items = (slideRef.current.textBoxes || [])
      .filter((t) => effectiveIds.includes(t.id))
      .map((t) => ({ id: t.id, xPct: t.xPct, yPct: t.yPct, wPct: t.wPct, fontSize: t.fontSize }));
    const ax = handle.includes('w') ? groupBBox.x + groupBBox.w : groupBBox.x;
    const ay = handle.includes('n') ? groupBBox.y + groupBBox.h : groupBBox.y;
    groupResizeRef.current = {
      handle,
      rect: root.getBoundingClientRect(),
      bbox: groupBBox,
      anchor: { x: ax, y: ay },
      items,
    };
  };

  useEffect(() => {
    const MIN_SCALE = 0.1;
    const onMove = (e: PointerEvent) => {
      const g = groupResizeRef.current;
      if (!g) return;
      const mx = ((e.clientX - g.rect.left) / g.rect.width) * 100;
      const my = ((e.clientY - g.rect.top) / g.rect.height) * 100;
      const axisX = g.handle.includes('w') || g.handle.includes('e');
      const axisY = g.handle.includes('n') || g.handle.includes('s');
      let sx = axisX ? Math.max(MIN_SCALE, Math.abs(mx - g.anchor.x) / g.bbox.w) : 1;
      let sy = axisY ? Math.max(MIN_SCALE, Math.abs(my - g.anchor.y) / g.bbox.h) : 1;
      const isCorner = axisX && axisY;
      // Corners are uniform; Shift forces uniform on side handles too.
      if (isCorner || e.shiftKey) {
        const s = isCorner ? (sx + sy) / 2 : Math.max(sx, sy);
        sx = s; sy = s;
      }
      const next = (slideRef.current.textBoxes || []).map((t) => {
        const orig = g.items.find((i) => i.id === t.id);
        if (!orig) return t;
        const nx = axisX ? g.anchor.x + (orig.xPct - g.anchor.x) * sx : orig.xPct;
        const ny = axisY ? g.anchor.y + (orig.yPct - g.anchor.y) * sy : orig.yPct;
        const nw = axisX ? Math.max(8, Math.min(100, orig.wPct * sx)) : orig.wPct;
        const fs = (isCorner || e.shiftKey)
          ? Math.max(8, Math.min(220, orig.fontSize * sx))
          : axisY
            ? Math.max(8, Math.min(220, orig.fontSize * sy))
            : orig.fontSize;
        return {
          ...t,
          xPct: Math.max(0, Math.min(100, nx)),
          yPct: Math.max(0, Math.min(100, ny)),
          wPct: nw,
          fontSize: fs,
        };
      });
      onUpdate({ textBoxes: next } as Partial<SlideData>);
    };
    const onUp = () => { groupResizeRef.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group rotation: spins each selected text box around the group center.
  // Shift snaps to 15° increments; Alt = 1° precision.
  const groupRotateRef = useRef<{
    rect: DOMRect;
    centerPx: { x: number; y: number };
    startAngle: number;
    items: Array<{ id: string; xPctPx: number; yPctPx: number; rotation: number }>;
  } | null>(null);

  const startGroupRotate = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const root = wrapperRef.current?.parentElement;
    if (!root || !groupBBox) return;
    const rect = root.getBoundingClientRect();
    const cxPx = ((groupBBox.x + groupBBox.w / 2) / 100) * rect.width;
    const cyPx = ((groupBBox.y + groupBBox.h / 2) / 100) * rect.height;
    const items = (slideRef.current.textBoxes || [])
      .filter((t) => effectiveIds.includes(t.id))
      .map((t) => ({
        id: t.id,
        xPctPx: (t.xPct / 100) * rect.width,
        yPctPx: (t.yPct / 100) * rect.height,
        rotation: (t as { rotation?: number }).rotation || 0,
      }));
    const startAngle = Math.atan2(e.clientY - rect.top - cyPx, e.clientX - rect.left - cxPx);
    groupRotateRef.current = { rect, centerPx: { x: cxPx, y: cyPx }, startAngle, items };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = groupRotateRef.current;
      if (!r) return;
      const ang = Math.atan2(e.clientY - r.rect.top - r.centerPx.y, e.clientX - r.rect.left - r.centerPx.x);
      let deltaDeg = ((ang - r.startAngle) * 180) / Math.PI;
      if (e.shiftKey) deltaDeg = Math.round(deltaDeg / 15) * 15;
      else if (e.altKey) deltaDeg = Math.round(deltaDeg);
      const rad = (deltaDeg * Math.PI) / 180;
      const cos = Math.cos(rad), sin = Math.sin(rad);
      const next = (slideRef.current.textBoxes || []).map((t) => {
        const orig = r.items.find((i) => i.id === t.id);
        if (!orig) return t;
        const dx = orig.xPctPx - r.centerPx.x;
        const dy = orig.yPctPx - r.centerPx.y;
        const nxPx = r.centerPx.x + dx * cos - dy * sin;
        const nyPx = r.centerPx.y + dx * sin + dy * cos;
        return {
          ...t,
          xPct: Math.max(0, Math.min(100, (nxPx / r.rect.width) * 100)),
          yPct: Math.max(0, Math.min(100, (nyPx / r.rect.height) * 100)),
          rotation: (orig.rotation + deltaDeg + 360) % 360,
        } as typeof t;
      });
      onUpdate({ textBoxes: next } as Partial<SlideData>);
    };
    const onUp = () => { groupRotateRef.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const updateTextBox = (id: string, patch: Partial<NonNullable<SlideData['textBoxes']>[number]>) => {
    const list = (slideRef.current.textBoxes || []).map((t) => (t.id === id ? { ...t, ...patch } : t));
    onUpdate({ textBoxes: list } as Partial<SlideData>);
  };
  const removeTextBox = (id: string) => {
    const list = (slideRef.current.textBoxes || []).filter((t) => t.id !== id);
    onUpdate({ textBoxes: list } as Partial<SlideData>);
    if (selectedTextBoxId === id) setSelectedTextBoxId(null);
    if (editingTextBoxId === id) setEditingTextBoxId(null);
  };
  const addTextBox = () => {
    const id = `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const next = [
      ...((slideRef.current.textBoxes || []) as NonNullable<SlideData['textBoxes']>),
      { id, text: 'New text', xPct: 50, yPct: 50, wPct: 40, fontSize: 36, color: '#ffffff', bg: 'rgba(0,0,0,0.35)', align: 'center' as const, weight: 600 as const },
    ];
    onUpdate({ textBoxes: next } as Partial<SlideData>);
    setSelectedTextBoxId(id);
  };

  // Pointer-driven move/resize for text boxes — uses the wrapper rect as the
  // coordinate space so % values stay correct at any zoom level.
  useEffect(() => {
    // Snap targets: canvas thirds + center + edges, plus other text boxes' centers/edges.
    const SNAP_PCT = 1.2; // ~1.2% threshold (≈15px on a 1280-wide canvas)
    const buildSnapTargets = (excludeId: string) => {
      const v = new Set<number>([0, 25, 50, 75, 100]);
      const h = new Set<number>([0, 25, 50, 75, 100]);
      for (const t of slideRef.current.textBoxes || []) {
        if (t.id === excludeId || (t as { __hidden?: boolean }).__hidden) continue;
        v.add(t.xPct);
        h.add(t.yPct);
        v.add(Math.max(0, t.xPct - t.wPct / 2));
        v.add(Math.min(100, t.xPct + t.wPct / 2));
      }
      return { v: [...v], h: [...h] };
    };
    const snap = (val: number, targets: number[]) => {
      let best = val;
      let bestDist = SNAP_PCT;
      const hits: number[] = [];
      for (const t of targets) {
        const d = Math.abs(val - t);
        if (d < bestDist) { bestDist = d; best = t; }
      }
      if (Math.abs(val - best) < SNAP_PCT) hits.push(best);
      return { val: best, hits };
    };

    const onMove = (e: PointerEvent) => {
      const drag = tbDragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (drag.mode === 'move') {
        // Group move: translate every selected box by the same delta. Skip snapping
        // for group moves to keep relative offsets intact.
        if (drag.group && drag.group.length > 1) {
          const dxPct = (dx / drag.rect.width) * 100;
          const dyPct = (dy / drag.rect.height) * 100;
          const byId = new Map(drag.group.map((g) => [g.id, g]));
          const list = (slideRef.current.textBoxes || []).map((t) => {
            const g = byId.get(t.id);
            if (!g) return t;
            return {
              ...t,
              xPct: Math.max(0, Math.min(100, g.xPct + dxPct)),
              yPct: Math.max(0, Math.min(100, g.yPct + dyPct)),
            };
          });
          onUpdate({ textBoxes: list } as Partial<SlideData>);
          setGuides({ v: [], h: [] });
          return;
        }
        let xPct = Math.max(0, Math.min(100, drag.orig.xPct + (dx / drag.rect.width) * 100));
        let yPct = Math.max(0, Math.min(100, drag.orig.yPct + (dy / drag.rect.height) * 100));
        const snapDisabled = drag.snapDisabled || e.altKey;
        if (!snapDisabled) {
          const targets = buildSnapTargets(drag.id);
          const sx = snap(xPct, targets.v);
          const sy = snap(yPct, targets.h);
          xPct = sx.val;
          yPct = sy.val;
          setGuides({ v: sx.hits, h: sy.hits });
        } else {
          setGuides({ v: [], h: [] });
        }
        updateTextBox(drag.id, { xPct, yPct });
      } else {
        const wPct = Math.max(8, Math.min(100, drag.orig.wPct + (dx / drag.rect.width) * 200));
        const fontSize = Math.max(10, Math.min(200, drag.orig.fontSize + dy * 0.4));
        updateTextBox(drag.id, { wPct, fontSize });
      }
    };
    const onUp = () => { tbDragRef.current = null; setGuides({ v: [], h: [] }); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTbDrag = (e: React.PointerEvent, id: string, mode: 'move' | 'resize') => {
    if (editingTextBoxId === id) return;
    e.stopPropagation();
    e.preventDefault();
    const root = wrapperRef.current?.parentElement;
    if (!root) return;
    const tb = (slideRef.current.textBoxes || []).find((t) => t.id === id);
    if (!tb) return;
    // If the dragged box is part of a multi-selection, capture origins for all.
    const inGroup = mode === 'move' && (effectiveIds.length > 1) && effectiveIds.includes(id);
    const group = inGroup
      ? (slideRef.current.textBoxes || [])
          .filter((t) => effectiveIds.includes(t.id))
          .map((t) => ({ id: t.id, xPct: t.xPct, yPct: t.yPct }))
      : undefined;
    tbDragRef.current = {
      id, mode,
      startX: e.clientX, startY: e.clientY,
      rect: root.getBoundingClientRect(),
      orig: { xPct: tb.xPct, yPct: tb.yPct, wPct: tb.wPct, fontSize: tb.fontSize },
      snapDisabled: e.altKey,
      group,
    };
  };

  // Keyboard shortcuts for the selected text box(es). Operates on the
  // effective selection (primary + multi). Skipped while editing inline.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (editingTextBoxId) return;
      if (effectiveIds.length === 0) return;
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.isContentEditable || ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
      const all = slideRef.current.textBoxes || [];
      const selected = all.filter((t) => effectiveIds.includes(t.id));
      if (selected.length === 0) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const keep = all.filter((t) => !effectiveIds.includes(t.id));
        onUpdate({ textBoxes: keep } as Partial<SlideData>);
        setSelectedTextBoxId(null);
        setMultiIds([]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedTextBoxId(null);
        setMultiIds([]);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        const copies = selected.map((tb) => ({
          ...tb,
          id: `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          xPct: Math.min(98, tb.xPct + 3),
          yPct: Math.min(98, tb.yPct + 3),
        }));
        onUpdate({ textBoxes: [...all, ...copies] } as Partial<SlideData>);
        setSelectedTextBoxId(copies[0].id);
        setMultiIds(copies.slice(1).map((c) => c.id));
        return;
      }
      // Z-order: only meaningful on a single primary selection.
      if ((e.metaKey || e.ctrlKey) && (e.key === ']' || e.key === '[') && selectedTextBoxId) {
        e.preventDefault();
        const list = [...all];
        const idx = list.findIndex((t) => t.id === selectedTextBoxId);
        if (idx < 0) return;
        const target = e.key === ']' ? idx + 1 : idx - 1;
        if (target < 0 || target >= list.length) return;
        [list[idx], list[target]] = [list[target], list[idx]];
        onUpdate({ textBoxes: list } as Partial<SlideData>);
        return;
      }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 0.5;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        const selIds = new Set(effectiveIds);
        const next = all.map((t) =>
          selIds.has(t.id)
            ? { ...t, xPct: Math.max(0, Math.min(100, t.xPct + dx)), yPct: Math.max(0, Math.min(100, t.yPct + dy)) }
            : t,
        );
        onUpdate({ textBoxes: next } as Partial<SlideData>);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTextBoxId, editingTextBoxId, enabled, effectiveIds.join(',')]);

  const selectedTb = textBoxes?.find((t) => t.id === selectedTextBoxId) || null;

  // Marquee multi-select: pointer-down on empty canvas starts a selection rect.
  // Shift = additive (preserve current selection). Releases pick everything whose
  // center falls inside the rect.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const m = marqueeRef.current;
      if (!m) return;
      const x1 = Math.min(m.startX, e.clientX);
      const y1 = Math.min(m.startY, e.clientY);
      const x2 = Math.max(m.startX, e.clientX);
      const y2 = Math.max(m.startY, e.clientY);
      setMarquee({
        x: ((x1 - m.rect.left) / m.rect.width) * 100,
        y: ((y1 - m.rect.top) / m.rect.height) * 100,
        w: ((x2 - x1) / m.rect.width) * 100,
        h: ((y2 - y1) / m.rect.height) * 100,
      });
    };
    const onUp = () => {
      const m = marqueeRef.current;
      if (!m) return;
      marqueeRef.current = null;
      setMarquee((rect) => {
        if (rect && (rect.w > 0.5 || rect.h > 0.5)) {
          const hits = (slideRef.current.textBoxes || [])
            .filter((tb) => !(tb as { __hidden?: boolean }).__hidden)
            .filter((tb) =>
              tb.xPct >= rect.x && tb.xPct <= rect.x + rect.w &&
              tb.yPct >= rect.y && tb.yPct <= rect.y + rect.h,
            )
            .map((tb) => tb.id);
          if (hits.length > 0) {
            if (m.additive) {
              setMultiIds((prev) => Array.from(new Set([...prev, ...hits, ...(selectedTextBoxId ? [selectedTextBoxId] : [])])));
            } else {
              setSelectedTextBoxId(hits[0]);
              setMultiIds(hits.slice(1));
            }
          }
        }
        return null;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onPointerDown={(e) => {
        // Only start a marquee from primary button on the bare canvas.
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('[data-tb-id]')) return;
        const root = wrapperRef.current?.parentElement;
        if (!root) return;
        if (!e.shiftKey) {
          setSelectedTextBoxId(null);
          setMultiIds([]);
          setEditingTextBoxId(null);
        }
        marqueeRef.current = {
          rect: root.getBoundingClientRect(),
          startX: e.clientX,
          startY: e.clientY,
          additive: e.shiftKey,
        };
      }}
    >
      <div ref={wrapperRef} className="contents">
        {children}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />

      {/* Text-box overlay layer (renders above slide content, below toolbars). */}
      {textBoxes && textBoxes.length > 0 && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          {textBoxes.filter((tb) => !(tb as { __hidden?: boolean }).__hidden).map((tb) => {
            const isPrimary = tb.id === selectedTextBoxId;
            const isMulti = multiIds.includes(tb.id);
            const isSelected = isPrimary || isMulti;
            const isEditing = tb.id === editingTextBoxId;
            return (
              <div
                key={tb.id}
                data-tb-id={tb.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${tb.xPct}%`,
                  top: `${tb.yPct}%`,
                  width: `${tb.wPct}%`,
                  transform: `translate(-50%, -50%) rotate(${(tb as { rotation?: number }).rotation || 0}deg)`,
                  outline: isSelected
                    ? `2px solid hsl(var(--primary)${isMulti && !isPrimary ? ' / 0.7' : ''})`
                    : 'none',
                  outlineOffset: 2,
                  cursor: isEditing ? 'text' : 'move',
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (e.shiftKey) {
                    // Toggle this box in/out of the multi-selection.
                    setMultiIds((prev) => {
                      const set = new Set(prev);
                      if (selectedTextBoxId && selectedTextBoxId !== tb.id) set.add(selectedTextBoxId);
                      if (set.has(tb.id)) set.delete(tb.id); else set.add(tb.id);
                      return [...set];
                    });
                    if (!selectedTextBoxId) setSelectedTextBoxId(tb.id);
                    return;
                  }
                  // Plain click on a box already in the group: keep group, just promote.
                  if (!isSelected) {
                    setSelectedTextBoxId(tb.id);
                    setMultiIds([]);
                  } else {
                    setSelectedTextBoxId(tb.id);
                  }
                  if (!isEditing) startTbDrag(e, tb.id, 'move');
                }}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingTextBoxId(tb.id); setSelectedTextBoxId(tb.id); setMultiIds([]); }}
              >
                <div
                  contentEditable={isEditing && enabled}
                  suppressContentEditableWarning
                  spellCheck={false}
                  onBlur={(e) => {
                    const next = e.currentTarget.textContent || '';
                    if (next !== tb.text) updateTextBox(tb.id, { text: next });
                    setEditingTextBoxId(null);
                  }}
                  style={{
                    fontSize: `clamp(8px, ${(tb.fontSize / 1280) * 100}cqw, 400px)` as string,
                    color: tb.color,
                    background: tb.bg,
                    textAlign: tb.align || 'left',
                    fontWeight: tb.weight || 600,
                    fontStyle: tb.italic ? 'italic' : 'normal',
                    padding: '0.25em 0.5em',
                    borderRadius: 6,
                    lineHeight: 1.2,
                    outline: 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    userSelect: isEditing ? 'text' : 'none',
                  }}
                >
                  {tb.text}
                </div>
                {isSelected && !isEditing && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm bg-primary border border-background cursor-nwse-resize"
                    onPointerDown={(e) => startTbDrag(e, tb.id, 'resize')}
                    title="Drag to resize"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Smart guide lines — shown while dragging a text box, snap to thirds/center/edges. */}
      {(guides.v.length > 0 || guides.h.length > 0) && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {guides.v.map((x) => (
            <div key={`v-${x}`} className="absolute top-0 bottom-0" style={{ left: `${x}%`, width: 1, background: 'hsl(var(--primary))', boxShadow: '0 0 4px hsl(var(--primary))' }} />
          ))}
          {guides.h.map((y) => (
            <div key={`h-${y}`} className="absolute left-0 right-0" style={{ top: `${y}%`, height: 1, background: 'hsl(var(--primary))', boxShadow: '0 0 4px hsl(var(--primary))' }} />
          ))}
        </div>
      )}

      {/* Marquee selection rectangle. */}
      {marquee && (
        <div
          className="absolute z-40 pointer-events-none border border-primary/80 bg-primary/10"
          style={{ left: `${marquee.x}%`, top: `${marquee.y}%`, width: `${marquee.w}%`, height: `${marquee.h}%` }}
        />
      )}

      {/* Group bounding box + 8 resize handles for the multi-selection. */}
      {enabled && !editingTextBoxId && effectiveIds.length >= 2 && groupBBox && (
        <div
          className="absolute z-40 pointer-events-none border border-primary/70 border-dashed"
          style={{ left: `${groupBBox.x}%`, top: `${groupBBox.y}%`, width: `${groupBBox.w}%`, height: `${groupBBox.h}%` }}
        >
          {([
            ['nw', '-top-1.5 -left-1.5 cursor-nwse-resize'],
            ['n',  '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize'],
            ['ne', '-top-1.5 -right-1.5 cursor-nesw-resize'],
            ['e',  'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize'],
            ['se', '-bottom-1.5 -right-1.5 cursor-nwse-resize'],
            ['s',  '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize'],
            ['sw', '-bottom-1.5 -left-1.5 cursor-nesw-resize'],
            ['w',  'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize'],
          ] as Array<['nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w', string]>).map(([h, pos]) => (
            <div
              key={h}
              className={`pointer-events-auto absolute w-3 h-3 rounded-sm bg-primary border border-background shadow ${pos}`}
              title={`Drag to resize group · Shift = uniform`}
              onPointerDown={(e) => startGroupResize(e, h)}
            />
          ))}
        </div>
      )}



      {/* Quick toolbar — single selection: canvas align. Multi: align edges + distribute. */}
      {enabled && !editingTextBoxId && effectiveIds.length === 1 && selectedTb && (
        <div
          className="absolute z-50 top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-lg border bg-background/90 backdrop-blur px-1 py-1 shadow-md text-[10px]"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {([
            ['L', { xPct: 10 }, 'Align left'],
            ['C', { xPct: 50 }, 'Center horizontally'],
            ['R', { xPct: 90 }, 'Align right'],
            ['|', null, ''],
            ['T', { yPct: 10 }, 'Align top'],
            ['M', { yPct: 50 }, 'Center vertically'],
            ['B', { yPct: 90 }, 'Align bottom'],
          ] as Array<[string, Partial<NonNullable<SlideData['textBoxes']>[number]> | null, string]>).map(([label, patch, title], i) =>
            patch ? (
              <button
                key={`${label}-${i}`}
                className="w-6 h-6 rounded hover:bg-muted text-foreground/80 hover:text-foreground font-semibold"
                title={title}
                onClick={() => updateTextBox(selectedTb.id, patch)}
              >
                {label}
              </button>
            ) : (
              <div key={`sep-${i}`} className="w-px h-4 bg-border mx-0.5" />
            ),
          )}
        </div>
      )}

      {/* Multi-selection toolbar: align selected boxes to each other + distribute. */}
      {enabled && !editingTextBoxId && effectiveIds.length >= 2 && (() => {
        const applyAlign = (patcher: (sel: NonNullable<SlideData['textBoxes']>) => Map<string, Partial<NonNullable<SlideData['textBoxes']>[number]>>) => {
          const all = slideRef.current.textBoxes || [];
          const sel = all.filter((t) => effectiveIds.includes(t.id));
          if (sel.length < 2) return;
          const patches = patcher(sel as NonNullable<SlideData['textBoxes']>);
          const next = all.map((t) => (patches.has(t.id) ? { ...t, ...patches.get(t.id) } : t));
          onUpdate({ textBoxes: next } as Partial<SlideData>);
        };
        const alignX = (kind: 'left' | 'center' | 'right') => applyAlign((sel) => {
          const xs = sel.map((t) => t.xPct);
          const target = kind === 'left' ? Math.min(...xs) : kind === 'right' ? Math.max(...xs) : xs.reduce((a, b) => a + b, 0) / xs.length;
          return new Map(sel.map((t) => [t.id, { xPct: target }] as const));
        });
        const alignY = (kind: 'top' | 'middle' | 'bottom') => applyAlign((sel) => {
          const ys = sel.map((t) => t.yPct);
          const target = kind === 'top' ? Math.min(...ys) : kind === 'bottom' ? Math.max(...ys) : ys.reduce((a, b) => a + b, 0) / ys.length;
          return new Map(sel.map((t) => [t.id, { yPct: target }] as const));
        });
        const distribute = (axis: 'x' | 'y') => applyAlign((sel) => {
          if (sel.length < 3) return new Map();
          const sorted = [...sel].sort((a, b) => (axis === 'x' ? a.xPct - b.xPct : a.yPct - b.yPct));
          const lo = axis === 'x' ? sorted[0].xPct : sorted[0].yPct;
          const hi = axis === 'x' ? sorted[sorted.length - 1].xPct : sorted[sorted.length - 1].yPct;
          const step = (hi - lo) / (sorted.length - 1);
          return new Map(sorted.map((t, i) => [t.id, axis === 'x' ? { xPct: lo + step * i } : { yPct: lo + step * i }] as const));
        });
        return (
          <div
            className="absolute z-50 top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-lg border bg-background/90 backdrop-blur px-1 py-1 shadow-md text-[10px]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="px-1.5 text-[10px] text-muted-foreground">{effectiveIds.length} selected</span>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align left edges" onClick={() => alignX('left')}>L</button>
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align horizontal centers" onClick={() => alignX('center')}>C</button>
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align right edges" onClick={() => alignX('right')}>R</button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align top edges" onClick={() => alignY('top')}>T</button>
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align vertical middles" onClick={() => alignY('middle')}>M</button>
            <button className="w-6 h-6 rounded hover:bg-muted font-semibold" title="Align bottom edges" onClick={() => alignY('bottom')}>B</button>
            <div className="w-px h-4 bg-border mx-0.5" />
            <button className="px-1.5 h-6 rounded hover:bg-muted font-semibold" title="Distribute horizontally (3+)" disabled={effectiveIds.length < 3} onClick={() => distribute('x')}>↔</button>
            <button className="px-1.5 h-6 rounded hover:bg-muted font-semibold" title="Distribute vertically (3+)" disabled={effectiveIds.length < 3} onClick={() => distribute('y')}>↕</button>
          </div>
        );
      })()}

      {/* Floating Undo/Redo + Add Text widget — top-left of the slide. */}
      {enabled && (
        <div
          className="absolute z-50 top-2 left-2 flex items-center gap-0.5 rounded-lg border bg-background/90 backdrop-blur px-1 py-1 shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="text-[11px] w-7 h-7 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-foreground"
            title="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
            onClick={undo}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10h10a8 8 0 0 1 8 8v2" />
              <polyline points="9 4 3 10 9 16" />
            </svg>
          </button>
          <button
            type="button"
            className="text-[11px] w-7 h-7 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-foreground"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10H11a8 8 0 0 0-8 8v2" />
              <polyline points="15 4 21 10 15 16" />
            </svg>
          </button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <button
            type="button"
            className="text-[11px] h-7 px-2 rounded hover:bg-muted flex items-center gap-1 text-foreground font-medium"
            title="Add text box (double-click to edit)"
            onClick={addTextBox}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V5h16v2" /><path d="M9 19h6" /><path d="M12 5v14" />
            </svg>
            Text
          </button>
        </div>
      )}

      {/* Selected text-box formatting toolbar */}
      {enabled && selectedTb && !editingTextBoxId && (
        <div
          className="absolute z-50 top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur px-2 py-1.5 shadow-lg"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground pr-1">Text</span>
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const presets: Record<string, Partial<NonNullable<SlideData['textBoxes']>[number]>> = {
                heading:    { fontSize: 72, weight: 800, italic: false, align: 'left',   bg: undefined },
                subheading: { fontSize: 44, weight: 600, italic: false, align: 'left',   bg: undefined },
                body:       { fontSize: 22, weight: 400, italic: false, align: 'left',   bg: undefined },
                callout:    { fontSize: 28, weight: 700, italic: false, align: 'center', bg: 'rgba(0,0,0,0.55)' },
                caption:    { fontSize: 16, weight: 500, italic: true,  align: 'left',   bg: undefined },
                eyebrow:    { fontSize: 14, weight: 700, italic: false, align: 'left',   bg: undefined },
              };
              if (presets[v]) updateTextBox(selectedTb.id, presets[v]);
              e.currentTarget.value = '';
            }}
            className="h-6 rounded border bg-background text-[11px] text-foreground px-1 cursor-pointer"
            title="Apply text style preset"
          >
            <option value="">Style…</option>
            <option value="heading">Heading</option>
            <option value="subheading">Subheading</option>
            <option value="body">Body</option>
            <option value="callout">Callout</option>
            <option value="caption">Caption</option>
            <option value="eyebrow">Eyebrow</option>
          </select>
          <input
            type="color"
            value={selectedTb.color}
            onChange={(e) => updateTextBox(selectedTb.id, { color: e.target.value })}
            className="h-6 w-6 rounded border cursor-pointer"
            title="Text color"
          />
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
            BG
            <input
              type="color"
              value={(selectedTb.bg && selectedTb.bg.startsWith('#')) ? selectedTb.bg : '#000000'}
              onChange={(e) => updateTextBox(selectedTb.id, { bg: e.target.value })}
              className="h-6 w-6 rounded border cursor-pointer"
              title="Background color"
            />
          </label>
          <button
            type="button"
            className="text-[11px] px-1.5 py-0.5 rounded border hover:bg-muted"
            title="Toggle background"
            onClick={() => updateTextBox(selectedTb.id, { bg: selectedTb.bg ? undefined : 'rgba(0,0,0,0.35)' })}
          >
            {selectedTb.bg ? 'BG on' : 'BG off'}
          </button>
          <div className="flex items-center gap-0.5">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={`text-[11px] w-6 h-6 rounded border hover:bg-muted ${selectedTb.align === a ? 'bg-primary/15 border-primary text-primary' : ''}`}
                title={`Align ${a}`}
                onClick={() => updateTextBox(selectedTb.id, { align: a })}
              >
                {a === 'left' ? '⯇' : a === 'center' ? '≡' : '⯈'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`text-[11px] w-6 h-6 rounded border hover:bg-muted font-bold ${(selectedTb.weight || 600) >= 700 ? 'bg-primary/15 border-primary text-primary' : ''}`}
            title="Bold"
            onClick={() => updateTextBox(selectedTb.id, { weight: (selectedTb.weight || 600) >= 700 ? 500 : 700 })}
          >B</button>
          <button
            type="button"
            className={`text-[11px] w-6 h-6 rounded border hover:bg-muted italic ${selectedTb.italic ? 'bg-primary/15 border-primary text-primary' : ''}`}
            title="Italic"
            onClick={() => updateTextBox(selectedTb.id, { italic: !selectedTb.italic })}
          >I</button>
          <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
            Size
            <input
              type="number"
              min={10}
              max={200}
              value={Math.round(selectedTb.fontSize)}
              onChange={(e) => updateTextBox(selectedTb.id, { fontSize: Math.max(10, Math.min(200, Number(e.target.value) || 36)) })}
              className="w-12 h-6 rounded border bg-background px-1 text-[11px] text-foreground"
            />
          </label>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border hover:bg-muted"
            onClick={() => setEditingTextBoxId(selectedTb.id)}
          >Edit</button>
          <button
            type="button"
            className="text-[11px] px-1.5 py-0.5 rounded hover:bg-destructive/10 text-destructive"
            title="Delete (Del)"
            onClick={() => removeTextBox(selectedTb.id)}
          >✕</button>
        </div>
      )}


      {shapeToolbar && (
        <div
          className="absolute z-50 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur px-2 py-1.5 shadow-lg"
          style={{
            left: shapeToolbar.x,
            top: shapeToolbar.y - 44,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground cursor-pointer">
            <span className="inline-block h-4 w-4 rounded border" style={{ background: shapeToolbar.color }} />
            Color
            <input
              type="color"
              value={shapeToolbar.color}
              onChange={(e) => {
                const c = e.target.value;
                setShapeToolbar((s) => (s ? { ...s, color: c } : s));
                updateShape(shapeToolbar.id, { color: c });
              }}
              className="absolute opacity-0 w-0 h-0"
            />
          </label>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-medium"
            title="Swap with a library graphic or generate one with AI"
            onClick={() => setSwapOpen((v) => !v)}
          >
            ✦ Swap
          </button>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border hover:bg-muted"
            onClick={() => updateShape(shapeToolbar.id, { hidden: true })}
          >
            Hide
          </button>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border hover:bg-muted"
            onClick={() => {
              const next = { ...(slideRef.current.demoOverrides || {}) };
              delete next[shapeToolbar.id];
              onUpdate({ demoOverrides: next });
              setShapeToolbar(null);
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="text-[11px] px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground"
            onClick={() => setShapeToolbar(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {shapeToolbar && swapOpen && (
        <GraphicSwapPopover
          anchorX={shapeToolbar.x}
          anchorY={shapeToolbar.y - 4}
          accent={shapeToolbar.color}
          bg={(slide as any).bgColor}
          secondary={(slide as any).demoTemplate?.palette?.secondary}
          onApply={(payload, scope) => {
            applySwap(shapeToolbar.id, payload, scope);
            setSwapOpen(false);
            setShapeToolbar(null);
          }}
          onClose={() => setSwapOpen(false)}
        />
      )}

      {/* Resize handles — 8 around the section bounds. */}
      {sectionToolbar && (() => {
        const HS = 10; // handle size in px
        const handles: Array<{
          h: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';
          x: number;
          y: number;
          cursor: string;
        }> = [
          { h: 'nw', x: sectionToolbar.left,                          y: sectionToolbar.top,                            cursor: 'nwse-resize' },
          { h: 'n',  x: sectionToolbar.left + sectionToolbar.width/2, y: sectionToolbar.top,                            cursor: 'ns-resize' },
          { h: 'ne', x: sectionToolbar.left + sectionToolbar.width,   y: sectionToolbar.top,                            cursor: 'nesw-resize' },
          { h: 'w',  x: sectionToolbar.left,                          y: sectionToolbar.top + sectionToolbar.height/2,  cursor: 'ew-resize' },
          { h: 'e',  x: sectionToolbar.left + sectionToolbar.width,   y: sectionToolbar.top + sectionToolbar.height/2,  cursor: 'ew-resize' },
          { h: 'sw', x: sectionToolbar.left,                          y: sectionToolbar.top + sectionToolbar.height,    cursor: 'nesw-resize' },
          { h: 's',  x: sectionToolbar.left + sectionToolbar.width/2, y: sectionToolbar.top + sectionToolbar.height,    cursor: 'ns-resize' },
          { h: 'se', x: sectionToolbar.left + sectionToolbar.width,   y: sectionToolbar.top + sectionToolbar.height,    cursor: 'nwse-resize' },
        ];
        return handles.map(({ h, x, y, cursor }) => (
          <div
            key={h}
            className="absolute z-50 bg-background border-2 border-primary rounded-sm shadow"
            style={{
              left: x - HS / 2,
              top: y - HS / 2,
              width: HS,
              height: HS,
              cursor,
            }}
            onMouseDown={(e) => startResize(e, h)}
            title="Drag to resize · Shift = uniform"
          />
        ));
      })()}

      {/* Rotation handle — above the top-center, connected by a stem. */}
      {sectionToolbar && (
        <>
          <div
            className="absolute z-50 pointer-events-none bg-primary/70"
            style={{
              left: sectionToolbar.left + sectionToolbar.width / 2 - 1,
              top: sectionToolbar.top - 28,
              width: 2,
              height: 22,
            }}
          />
          <div
            className="absolute z-50 bg-background border-2 border-primary rounded-full shadow flex items-center justify-center text-primary"
            style={{
              left: sectionToolbar.left + sectionToolbar.width / 2 - 8,
              top: sectionToolbar.top - 36,
              width: 16,
              height: 16,
              cursor: 'grab',
            }}
            onMouseDown={startRotate}
            title={`Drag to rotate · Shift = snap to ${rotateSnap}° · ←/→ rotates by ${rotateSnap}° (Alt = 1°, Shift = 90°)`}
          >
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 4 21 10 15 10" />
            </svg>
          </div>
        </>
      )}

      {sectionToolbar && (
        <div
          className="absolute z-50 flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur px-2 py-1.5 shadow-lg"
          style={{
            left: sectionToolbar.x,
            top: sectionToolbar.y - 44,
            transform: 'translateX(-50%)',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground pr-1">
            Section
          </span>
          <div className="flex items-center gap-0.5">
            <button type="button" className="text-[11px] w-6 h-6 rounded border hover:bg-muted" title="Move up"
              onClick={() => nudge(sectionToolbar.id, 0, -2)}>↑</button>
            <button type="button" className="text-[11px] w-6 h-6 rounded border hover:bg-muted" title="Move down"
              onClick={() => nudge(sectionToolbar.id, 0, 2)}>↓</button>
            <button type="button" className="text-[11px] w-6 h-6 rounded border hover:bg-muted" title="Move left"
              onClick={() => nudge(sectionToolbar.id, -2, 0)}>←</button>
            <button type="button" className="text-[11px] w-6 h-6 rounded border hover:bg-muted" title="Move right"
              onClick={() => nudge(sectionToolbar.id, 2, 0)}>→</button>
          </div>
          <label
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground border rounded px-1.5 py-0.5"
            title="Rotation snap increment (hold Shift while rotating to snap)"
          >
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 4 21 10 15 10" />
            </svg>
            <select
              className="bg-transparent text-foreground text-[11px] outline-none cursor-pointer"
              value={rotateSnap}
              onChange={(e) => setRotateSnap(parseFloat(e.target.value))}
            >
              <option value={1}>1°</option>
              <option value={5}>5°</option>
              <option value={10}>10°</option>
              <option value={15}>15°</option>
              <option value={22.5}>22.5°</option>
              <option value={30}>30°</option>
              <option value={45}>45°</option>
              <option value={90}>90°</option>
            </select>
          </label>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border hover:bg-muted"
            title="Hide section"
            onClick={() => { updateSection(sectionToolbar.id, { hidden: true }); setSectionToolbar(null); }}
          >
            Delete
          </button>
          <button
            type="button"
            className="text-[11px] px-2 py-0.5 rounded border hover:bg-muted"
            title="Reset position"
            onClick={() => { resetSection(sectionToolbar.id); setSectionToolbar(null); }}
          >
            Reset
          </button>
          <button
            type="button"
            className="text-[11px] px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground"
            onClick={() => setSectionToolbar(null)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => parseInt(v, 10));
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
