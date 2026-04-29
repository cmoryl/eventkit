import React, { useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Plus, Trash2, GripVertical, Loader2, Check, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DeckOutline, SlideOutline } from "../DeckPreview";
import { SlideDetailsPanel } from "./SlideDetailsPanel";

interface Props {
  outline: DeckOutline;
  onChange: (next: DeckOutline) => void;
  onBack: () => void;
  onConfirm: () => void;
  building: boolean;
}

const LAYOUT_LABELS: Partial<Record<SlideOutline["layout"], string>> = {
  title: "Title",
  section: "Section",
  bullets: "Bullets",
  two_column: "Two Column",
  stat: "Stat",
  quote: "Quote",
  closing: "Closing",
  kpi_grid: "KPI Grid",
  agenda: "Agenda",
  timeline: "Timeline",
  comparison: "Comparison",
  metrics: "Metrics",
  team: "Team",
  image_hero: "Image Hero",
  chart: "Chart",
  process: "Process",
};

export const OutlineReview: React.FC<Props> = ({ outline, onChange, onBack, onConfirm, building }) => {
  const { toast } = useToast();
  // Stable per-slide ids so storage paths stay consistent across edits within this session
  const slideIds = useMemo(() => outline.slides.map(() => crypto.randomUUID()), [outline.slides.length]);
  const [expandedDetails, setExpandedDetails] = useState<Set<number>>(new Set());
  const [populatingIdx, setPopulatingIdx] = useState<Set<number>>(new Set());
  const [populatingAll, setPopulatingAll] = useState(false);

  const toggleDetails = (i: number) => {
    setExpandedDetails((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  // Calls edge fn to enrich a single slide; returns the patched slide.
  const populateOne = async (idx: number, slide: SlideOutline, deckSnapshot: DeckOutline): Promise<SlideOutline | null> => {
    const { data, error } = await supabase.functions.invoke("populate-slide-details", {
      body: { deck: deckSnapshot, slide, slideIndex: idx },
    });
    if (error || (data && (data as any).error)) {
      const msg = (data as any)?.error || error?.message || "AI populate failed";
      toast({ title: "Couldn't populate", description: msg, variant: "destructive" });
      return null;
    }
    const patch = (data as any)?.patch || {};
    return { ...slide, ...patch } as SlideOutline;
  };

  const handlePopulateOne = async (idx: number) => {
    setPopulatingIdx((p) => new Set(p).add(idx));
    try {
      const next = await populateOne(idx, outline.slides[idx], outline);
      if (next) {
        onChange({ ...outline, slides: outline.slides.map((s, i) => (i === idx ? next : s)) });
        // auto-expand so user sees the new details
        setExpandedDetails((prev) => new Set(prev).add(idx));
        toast({ title: "Slide enriched", description: "AI added details for this slide." });
      }
    } finally {
      setPopulatingIdx((p) => { const n = new Set(p); n.delete(idx); return n; });
    }
  };

  const handlePopulateAll = async () => {
    setPopulatingAll(true);
    try {
      // Sequential to be friendly to rate limits; deck snapshot stays consistent.
      const deckSnapshot = outline;
      const updated = [...outline.slides];
      for (let i = 0; i < updated.length; i++) {
        setPopulatingIdx((p) => new Set(p).add(i));
        const next = await populateOne(i, updated[i], { ...deckSnapshot, slides: updated });
        setPopulatingIdx((p) => { const n = new Set(p); n.delete(i); return n; });
        if (next) {
          updated[i] = next;
          onChange({ ...outline, slides: [...updated] });
        }
      }
      toast({ title: "All slides enriched", description: "Review and tweak before generating." });
    } finally {
      setPopulatingAll(false);
    }
  };

  const detailsCount = (s: SlideOutline) => {
    let n = 0;
    if (s.designNotes?.trim()) n++;
    if (s.visualIntent && s.visualIntent !== "auto") n++;
    if (s.chart?.data?.length) n++;
    if (s.references?.length) n += s.references.length;
    return n;
  };

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
        <div className="flex flex-col gap-2 items-end">
          <Button size="lg" onClick={onConfirm} disabled={building || populatingAll}>
            {building ? (<><Loader2 className="h-4 w-4 animate-spin" /> Building deck…</>) : (<><Check className="h-4 w-4" /> Generate {outline.slides.length} slides</>)}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handlePopulateAll}
            disabled={building || populatingAll}
            title="Use AI to fill in details (notes, visuals, data) for every slide"
          >
            {populatingAll ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Populating all…</>) : (<><Wand2 className="h-3.5 w-3.5" /> AI populate all</>)}
          </Button>
        </div>
      </div>

      {/* Slide list */}
      <div className="space-y-2">
        {outline.slides.map((s, i) => {
          const open = expandedDetails.has(i);
          const count = detailsCount(s);
          return (
            <Card
              key={i}
              className="p-3 group transition-colors border border-white/10 bg-[#0A0838]/55 hover:border-cyan-300/40"
              style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1 pt-1.5 text-white/55">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[10px] font-mono">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={s.layout}
                      onChange={(e) => updateSlide(i, { layout: e.target.value as SlideOutline["layout"] })}
                      className="text-[10px] uppercase tracking-wider rounded-full border border-white/15 bg-white/10 text-white/90 px-2 py-0.5 backdrop-blur-sm"
                    >
                      {(Object.keys(LAYOUT_LABELS) as SlideOutline["layout"][]).map((l) => (
                        <option key={l} value={l} className="bg-[#0A0838] text-white">{LAYOUT_LABELS[l]}</option>
                      ))}
                    </select>
                    <Input
                      value={s.title}
                      onChange={(e) => updateSlide(i, { title: e.target.value })}
                      placeholder="Slide title"
                      className="font-semibold h-8 flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => handlePopulateOne(i)}
                      disabled={populatingIdx.has(i) || populatingAll}
                      className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border bg-violet-400/15 border-violet-300/50 text-violet-100 hover:bg-violet-400/25 transition-colors disabled:opacity-60"
                      title="Use AI to write details, bullets, and visual guidance for this slide"
                    >
                      {populatingIdx.has(i) ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                      AI fill
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDetails(i)}
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                        open
                          ? "bg-cyan-300/20 border-cyan-300/60 text-white"
                          : count > 0
                            ? "bg-white/10 border-white/20 text-white/90"
                            : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                      title={open ? "Hide details" : "Add notes, visual intent, chart, images"}
                    >
                      Details
                      {count > 0 && <span className="rounded-full bg-cyan-300/30 px-1.5 text-[10px] leading-4">{count}</span>}
                      {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
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
                      className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  )}
                  {open && (
                    <SlideDetailsPanel
                      slide={s}
                      slideId={slideIds[i]}
                      onChange={(patch) => updateSlide(i, patch)}
                      palette={outline.palette}
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1 text-white/55 hover:text-cyan-300 mt-2"
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
