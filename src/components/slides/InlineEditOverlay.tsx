import React, { useEffect, useRef } from 'react';
import type { SlideData } from './slideTypes';

interface Props {
  slide: SlideData;
  onUpdate: (updates: Partial<SlideData>) => void;
  /** Disable for layouts that already manage their own inline editing (e.g. demo-mock). */
  enabled?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a SlideRenderer and gives every element with a `data-slide-field`
 * (or `data-slide-image`) attribute click-to-edit / double-click-to-edit
 * super-powers without each layout needing its own editor.
 *
 * Field paths supported:
 *   - "title" | "subtitle" | "body" | "quoteAuthor"
 *   - "stats.<i>.value" | "stats.<i>.label"
 *   - "timeline.<i>.title" | "timeline.<i>.date" | "timeline.<i>.description"
 *   - "process.<i>.title" | "process.<i>.description"
 *   - "agenda.<i>"   (writes back into the body string, line-indexed)
 *
 * Image markers:
 *   - data-slide-image="hero"       → updates slide.imageUrl
 *   - data-slide-image="images.<i>" → updates slide.images[i]
 */
export function InlineEditOverlay({ slide, onUpdate, enabled = true, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImageTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = wrapperRef.current;
    if (!root) return;

    const isAlreadyEditing = (el: HTMLElement) =>
      el.getAttribute('contenteditable') === 'true';

    const finishEdit = (el: HTMLElement, field: string) => {
      el.removeAttribute('contenteditable');
      el.style.outline = '';
      el.style.cursor = '';
      const text = (el.innerText || '').replace(/\u00A0/g, ' ').replace(/\s+\n/g, '\n').trimEnd();
      writeField(field, text);
    };

    const writeField = (field: string, text: string) => {
      // Simple top-level fields
      if (field === 'title' || field === 'subtitle' || field === 'body' || field === 'quoteAuthor') {
        if ((slide as any)[field] === text) return;
        onUpdate({ [field]: text } as any);
        return;
      }

      // Indexed array fields like "stats.0.value"
      const parts = field.split('.');
      if (parts.length === 3) {
        const [arrayKey, idxStr, prop] = parts;
        const idx = parseInt(idxStr, 10);
        const arr = ((slide as any)[arrayKey] || []).slice();
        if (!arr[idx]) return;
        if (arr[idx][prop] === text) return;
        arr[idx] = { ...arr[idx], [prop]: text };
        onUpdate({ [arrayKey]: arr } as any);
        return;
      }

      // Agenda lines: "agenda.<i>" — body is newline separated
      if (parts.length === 2 && parts[0] === 'agenda') {
        const idx = parseInt(parts[1], 10);
        const lines = (slide.body || '').split('\n');
        if (lines[idx] === text) return;
        lines[idx] = text;
        onUpdate({ body: lines.join('\n') });
        return;
      }
    };

    const startEdit = (el: HTMLElement, field: string) => {
      if (isAlreadyEditing(el)) return;
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'true');
      el.style.outline = '2px dashed hsl(var(--primary) / 0.6)';
      el.style.cursor = 'text';
      el.focus();

      // Select all text
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
        if (e.key === 'Escape') {
          e.preventDefault();
          el.blur();
        } else if (e.key === 'Enter' && !e.shiftKey && !el.dataset.slideMultiline) {
          e.preventDefault();
          el.blur();
        }
      };
      el.addEventListener('blur', onBlur);
      el.addEventListener('keydown', onKey);
    };

    const onDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Image targets
      const imgEl = target.closest<HTMLElement>('[data-slide-image]');
      if (imgEl) {
        const which = imgEl.getAttribute('data-slide-image') || 'hero';
        pendingImageTargetRef.current = which;
        fileInputRef.current?.click();
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Text targets
      const fieldEl = target.closest<HTMLElement>('[data-slide-field]');
      if (fieldEl) {
        const field = fieldEl.getAttribute('data-slide-field')!;
        e.preventDefault();
        e.stopPropagation();
        startEdit(fieldEl, field);
      }
    };

    // Hover hint cursor for editable elements
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const field = t.closest<HTMLElement>('[data-slide-field], [data-slide-image]');
      if (field && !field.getAttribute('contenteditable')) {
        field.style.cursor = 'pointer';
        field.title = 'Double-click to edit';
      }
    };

    root.addEventListener('dblclick', onDoubleClick);
    root.addEventListener('mouseover', onMouseOver);
    return () => {
      root.removeEventListener('dblclick', onDoubleClick);
      root.removeEventListener('mouseover', onMouseOver);
    };
  }, [enabled, slide, onUpdate]);

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

    if (target === 'hero') {
      onUpdate({ imageUrl: dataUrl });
      return;
    }
    const m = target.match(/^images\.(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10);
      const next = (slide.images || []).slice();
      next[idx] = dataUrl;
      onUpdate({ images: next });
    }
  };

  return (
    <>
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
    </>
  );
}
