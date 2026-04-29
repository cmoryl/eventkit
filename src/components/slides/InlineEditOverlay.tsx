import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { SlideData } from './slideTypes';

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
export function InlineEditOverlay({ slide, onUpdate, enabled = true, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageTargetRef = useRef<string | null>(null);
  const slideRef = useRef(slide);
  slideRef.current = slide;

  const [shapeToolbar, setShapeToolbar] = useState<{
    id: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const [sectionToolbar, setSectionToolbar] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

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
      el.style.transform = dx || dy ? `translate(${dx}%, ${dy}%)` : '';
      el.style.transition = dragRef.current?.id === id ? 'none' : 'transform 120ms ease-out';
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
      d.el.style.transform = `translate(${dxPct}%, ${dyPct}%)`;
      d.el.style.transition = 'none';
      // Re-anchor toolbar
      const r = d.el.getBoundingClientRect();
      const wr = root.getBoundingClientRect();
      setSectionToolbar((s) =>
        s ? { ...s, x: r.left - wr.left + r.width / 2, y: r.top - wr.top } : s,
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

  const updateShape = (id: string, patch: { color?: string; hidden?: boolean }) => {
    const next = { ...(slideRef.current.demoOverrides || {}) };
    next[id] = { ...next[id], ...patch };
    onUpdate({ demoOverrides: next });
  };

  const updateSection = (id: string, patch: { dx?: number; dy?: number; hidden?: boolean }) => {
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

  return (
    <div className="relative w-full h-full">
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
