// LayersPanel — Photoshop/Figma-style layer list for the active slide.
// Surfaces free-floating textBoxes plus the slide's built-in elements
// (image, stats, chart, body, title). Supports reorder, hide/show, rename,
// duplicate, delete.
//
// Hidden text boxes are kept in the slide payload but excluded from render +
// export. A textBox is marked hidden when its `__hidden` flag is true; the
// renderer reads it via the `align`/`weight` envelope (we extend the shape
// at runtime so we don't need a schema migration).

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Eye, EyeOff, Trash2, Copy, ChevronUp, ChevronDown,
  Type as TypeIcon, Image as ImageIcon, Hash, BarChart3,
  AlignLeft, Quote, Square, PanelLeftOpen, X, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SlideData } from "./slideTypes";

interface Props {
  slide: SlideData | null;
  onUpdate: (updates: Partial<SlideData>) => void;
}

type AnyTextBox = NonNullable<SlideData["textBoxes"]>[number] & { __hidden?: boolean };

export const LayersPanel: React.FC<Props> = ({ slide, onUpdate }) => {
  const textBoxes = (slide?.textBoxes ?? []) as AnyTextBox[];

  // Synthetic "built-in" layer rows so users see the whole slide stack.
  const builtIns = useMemo(() => {
    if (!slide) return [];
    const rows: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; subtle?: string }> = [];
    if (slide.title) rows.push({ id: "__title", label: "Title", icon: TypeIcon, subtle: slide.title.slice(0, 32) });
    if (slide.subtitle) rows.push({ id: "__subtitle", label: "Subtitle", icon: AlignLeft, subtle: slide.subtitle.slice(0, 32) });
    if (slide.body) rows.push({ id: "__body", label: "Body", icon: AlignLeft, subtle: slide.body.slice(0, 32) });
    if (slide.quoteAuthor) rows.push({ id: "__quote", label: "Quote attribution", icon: Quote, subtle: slide.quoteAuthor });
    if (slide.stats?.length) rows.push({ id: "__stats", label: `Stats (${slide.stats.length})`, icon: Hash });
    if (slide.chart) rows.push({ id: "__chart", label: `Chart · ${slide.chart.type}`, icon: BarChart3 });
    if (slide.imageUrl || slide.images?.length) {
      rows.push({ id: "__image", label: "Image", icon: ImageIcon, subtle: slide.imageUrl ? "1 image" : `${slide.images!.length} images` });
    }
    if (slide.bgColor || slide.bgImage) rows.push({ id: "__bg", label: "Background", icon: Square, subtle: slide.bgImage ? "Image" : slide.bgColor });
    return rows;
  }, [slide]);

  if (!slide) {
    return <div className="p-3 text-xs text-muted-foreground">Select a slide to inspect its layers.</div>;
  }

  const update = (next: AnyTextBox[]) => onUpdate({ textBoxes: next as SlideData["textBoxes"] });

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= textBoxes.length) return;
    const next = [...textBoxes];
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  };

  const toggleHidden = (idx: number) => {
    const next = textBoxes.map((tb, i) => (i === idx ? { ...tb, __hidden: !tb.__hidden } : tb));
    update(next);
  };

  const duplicate = (idx: number) => {
    const src = textBoxes[idx];
    const copy: AnyTextBox = { ...src, id: `${src.id}-copy-${Date.now()}`, xPct: Math.min(98, (src.xPct ?? 50) + 4), yPct: Math.min(98, (src.yPct ?? 50) + 4) };
    const next = [...textBoxes];
    next.splice(idx + 1, 0, copy);
    update(next);
  };

  const remove = (idx: number) => update(textBoxes.filter((_, i) => i !== idx));

  const rename = (idx: number, text: string) => {
    update(textBoxes.map((tb, i) => (i === idx ? { ...tb, text } : tb)));
  };

  // Render front-to-back: last in array sits on top visually, so show reversed.
  const orderedTextBoxes = [...textBoxes].map((tb, idx) => ({ tb, idx })).reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border/60 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold flex items-center justify-between">
        <span>Layers · {textBoxes.length + builtIns.length}</span>
        <span className="text-[9px] normal-case tracking-normal text-muted-foreground/70">Top → Bottom</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Free-floating text-box layers (top of stack) */}
        {orderedTextBoxes.length === 0 && builtIns.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">No layers on this slide.</p>
        )}

        {orderedTextBoxes.map(({ tb, idx }, displayPos) => {
          const isFirst = displayPos === 0;
          const isLast = displayPos === orderedTextBoxes.length - 1;
          const hidden = !!tb.__hidden;
          return (
            <div
              key={tb.id}
              className={cn(
                "group rounded-md border border-border/50 bg-background/60 hover:border-primary/40 transition-colors px-2 py-1.5",
                hidden && "opacity-50",
              )}
            >
              <div className="flex items-center gap-1.5">
                <TypeIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                <Input
                  value={tb.text}
                  onChange={(e) => rename(idx, e.target.value)}
                  className="h-6 text-[11px] px-1.5 bg-transparent border-transparent hover:border-border focus-visible:border-primary"
                />
              </div>
              <div className="flex items-center justify-between mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(idx, +1)} disabled={isFirst} title="Bring forward">
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => move(idx, -1)} disabled={isLast} title="Send back">
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => toggleHidden(idx)} title={hidden ? "Show" : "Hide"}>
                    {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => duplicate(idx)} title="Duplicate">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={() => remove(idx)} title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Built-in layers (read-only summary; cannot reorder or delete from here) */}
        {builtIns.length > 0 && (
          <>
            <div className="px-1 pt-3 pb-1 text-[9px] uppercase tracking-wide text-muted-foreground/70 font-semibold">
              Slot layers
            </div>
            {builtIns.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.id} className="rounded-md border border-border/40 bg-muted/30 px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[11px] font-medium">{row.label}</span>
                  </div>
                  {row.subtle && (
                    <p className="text-[10px] text-muted-foreground truncate ml-4.5 mt-0.5">{row.subtle}</p>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
