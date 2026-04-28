import React, { useState } from "react";
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { DeckOutline, SlideOutline } from "../DeckPreview";

interface Props {
  outline: DeckOutline;
  onChange: (next: DeckOutline) => void;
  onBack: () => void;
  onConfirm: () => void;
  building: boolean;
}

const LAYOUT_LABELS: Record<SlideOutline["layout"], string> = {
  title: "Title",
  section: "Section",
  bullets: "Bullets",
  two_column: "Two Column",
  stat: "Stat",
  quote: "Quote",
  closing: "Closing",
};

/**
 * Gamma-style outline review: edit titles, bullets, reorder, add/remove
 * BEFORE the .pptx is built. Massive trust-builder — the deck never gets
 * built around content the user disagrees with.
 */
export const OutlineReview: React.FC<Props> = ({ outline, onChange, onBack, onConfirm, building }) => {
  const [collapsedIdx, setCollapsedIdx] = useState<number | null>(null);

  const updateSlide = (idx: number, patch: Partial<SlideOutline>) => {
    onChange({ ...outline, slides: outline.slides.map((s, i) => (i === idx ? { ...s, ...patch } : s)) });
  };

  const addSlide = (idx: number) => {
    const n: SlideOutline = { layout: "bullets", title: "New slide", bullets: ["New point"] };
    onChange({ ...outline, slides: [...outline.slides.slice(0, idx + 1), n, ...outline.slides.slice(idx + 1)] });
  };

  const removeSlide = (idx: number) => {
    if (outline.slides.length <= 1) return;
    onChange({ ...outline, slides: outline.slides.filter((_, i) => i !== idx) });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= outline.slides.length) return;
    const slides = outline.slides.slice();
    const [m] = slides.splice(idx, 1);
    slides.splice(ni, 0, m);
    onChange({ ...outline, slides });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={building}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Step 2 of 2 · Review outline
          </div>
          <Input
            value={outline.title}
            onChange={(e) => onChange({ ...outline, title: e.target.value })}
            className="mt-1 text-xl font-bold border-0 px-0 h-auto focus-visible:ring-0 shadow-none"
          />
          <Input
            value={outline.subtitle}
            onChange={(e) => onChange({ ...outline, subtitle: e.target.value })}
            className="text-sm text-muted-foreground border-0 px-0 h-auto focus-visible:ring-0 shadow-none"
          />
        </div>
        <Button size="lg" onClick={onConfirm} disabled={building}>
          {building ? (<><Loader2 className="h-4 w-4 animate-spin" /> Building deck…</>) : (<><Check className="h-4 w-4" /> Generate {outline.slides.length} slides</>)}
        </Button>
      </div>

      {/* Slide list */}
      <div className="space-y-2">
        {outline.slides.map((s, i) => {
          const collapsed = collapsedIdx === i ? false : collapsedIdx !== null && collapsedIdx !== i ? true : false;
          // simpler: always expanded; collapse on click of the chevron later
          void collapsed;
          return (
            <Card key={i} className="p-3 group hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1 pt-1.5 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[10px] font-mono">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={s.layout}
                      onChange={(e) => updateSlide(i, { layout: e.target.value as SlideOutline["layout"] })}
                      className="text-[10px] uppercase tracking-wider rounded-full border bg-background px-2 py-0.5"
                    >
                      {(Object.keys(LAYOUT_LABELS) as SlideOutline["layout"][]).map((l) => (
                        <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
                      ))}
                    </select>
                    <Input
                      value={s.title}
                      onChange={(e) => updateSlide(i, { title: e.target.value })}
                      placeholder="Slide title"
                      className="font-semibold h-8 flex-1"
                    />
                  </div>
                  {(s.layout === "bullets" || s.layout === "section" || s.layout === "title" || s.layout === "closing") && (
                    <Textarea
                      value={(s.bullets || []).join("\n") || s.subtitle || ""}
                      onChange={(e) => {
                        const lines = e.target.value.split("\n").filter(Boolean);
                        if (s.layout === "bullets") updateSlide(i, { bullets: lines });
                        else updateSlide(i, { subtitle: e.target.value });
                      }}
                      placeholder={s.layout === "bullets" ? "One bullet per line" : "Subtitle"}
                      rows={s.layout === "bullets" ? 3 : 1}
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(i, 1)} disabled={i === outline.slides.length - 1} title="Move down">↓</Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeSlide(i)} disabled={outline.slides.length <= 1} title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Add slide between */}
              <div className="flex justify-center -mb-1">
                <button
                  onClick={() => addSlide(i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1 text-muted-foreground hover:text-primary mt-2"
                >
                  <Plus className="h-3 w-3" /> Add slide here
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => addSlide(outline.slides.length - 1)}>
          <Plus className="h-4 w-4" /> Add slide
        </Button>
      </div>
    </div>
  );
};
