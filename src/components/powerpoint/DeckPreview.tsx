import React, { useState } from "react";
import { Download, Pencil, Check, X, Loader2, RefreshCw, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Wand2, Minimize2, Maximize2, Shuffle, Sparkles, BarChart3, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssetEditDialog, type AssetEditTarget } from "./composer/AssetEditDialog";
import transperfectHero from "@/assets/templates/transperfect-hero.jpg";
import transperfectHeroSquare from "@/assets/templates/transperfect-hero-square.jpg";
import transperfectSectionBg from "@/assets/templates/transperfect-section-bg.jpg";
import transperfectLightPattern from "@/assets/templates/transperfect-light-pattern.jpg";
import transperfectCard from "@/assets/templates/transperfect-card.jpg";

export type VisualIntent = "auto" | "photo" | "infographic" | "chart" | "icon-grid" | "screenshot" | "none";
export type ChartType = "bar" | "line" | "pie" | "donut" | "area" | "scatter";

export interface SlideChartSpec {
  type: ChartType;
  title?: string;
  /** Free-form data; either CSV-like rows or {label, value} pairs the AI will interpret. */
  data: Array<{ label: string; value: number }>;
  notes?: string;
  /** Optional axis labels (used for bar/line/area/scatter charts). */
  xLabel?: string;
  yLabel?: string;
  /** Series colors as hex (without #). Falls back to deck palette when omitted. */
  colors?: string[];
  /** Whether to render a legend below the chart. */
  showLegend?: boolean;
}

export interface SlideReferenceImage {
  url: string;            // public storage URL
  caption?: string;       // user-provided context for the AI
  treatment?: "style-match" | "as-is" | "inspiration"; // default style-match
}

export interface SlideOutline {
  layout:
    | "title" | "section" | "bullets" | "two_column" | "stat" | "quote" | "closing"
    // Rich layouts the server may emit — keep on the client type so the UI can render them.
    | "kpi_grid" | "agenda" | "timeline" | "comparison" | "metrics" | "team" | "image_hero" | "chart" | "process";
  title: string;
  subtitle?: string;
  bullets?: string[];
  leftColumn?: { heading: string; bullets: string[] };
  rightColumn?: { heading: string; bullets: string[] };
  stat?: { value: string; label: string };
  quote?: { text: string; attribution?: string };
  notes?: string;
  /** Per-slide AI guidance — what this slide should communicate, mood, must-haves. */
  designNotes?: string;
  /** Hint to the AI about the dominant visual treatment to use. */
  visualIntent?: VisualIntent;
  /** Optional inline chart/data the AI should render. */
  chart?: SlideChartSpec;
  /** User-uploaded reference images for this slide. */
  references?: SlideReferenceImage[];
  // ---- rich layout fields ----
  kpis?: Array<{ value: string; label: string; sublabel?: string; trend?: string }>;
  agenda?: Array<{ step: string; title: string; body?: string; duration?: string; owner?: string }>;
  timeline?: Array<{ when: string; title: string; body?: string; deliverables?: string[] }>;
  comparison?: { heading?: string; before: { title: string; points: string[] }; after: { title: string; points: string[] } };
  metrics?: Array<{ value: string; label: string; sublabel?: string }>;
  team?: Array<{ name: string; role: string; initials: string; location?: string; focus?: string }>;
  process?: Array<{ step: string; title: string; body?: string }>;
}

export interface DeckOutline {
  title: string;
  subtitle: string;
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  fonts: { heading: string; body: string };
  slides: SlideOutline[];
}

interface Props {
  outline: DeckOutline;
  downloadUrl: string;
  filename: string;
  templateId?: string;
  onUpdated?: (next: { outline: DeckOutline; downloadUrl: string; filename: string; templateId?: string }) => void;
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

const LAYOUT_OPTIONS: SlideOutline["layout"][] = [
  "title", "section", "bullets", "two_column", "stat", "quote", "closing",
];

const TEMPLATE_PREVIEW_IMAGES: Record<string, Partial<Record<SlideOutline["layout"], string>>> = {
  "transperfect-2026": {
    title: transperfectHero,
    closing: transperfectHero,
    section: transperfectSectionBg,
    bullets: transperfectLightPattern,
    two_column: transperfectLightPattern,
    stat: transperfectCard,
    quote: transperfectHeroSquare,
  },
};

const templatePreviewImage = (templateId: string | undefined, layout: SlideOutline["layout"]) =>
  templateId ? TEMPLATE_PREVIEW_IMAGES[templateId]?.[layout] : undefined;

export const DeckPreview: React.FC<Props> = ({ outline: initial, downloadUrl: initialUrl, filename: initialFile, templateId, onUpdated }) => {
  const { toast } = useToast();
  const [outline, setOutline] = useState<DeckOutline>(initial);
  const [downloadUrl, setDownloadUrl] = useState(initialUrl);
  const [filename, setFilename] = useState(initialFile);
  const [activeIdx, setActiveIdx] = useState(0);
  const [editingMeta, setEditingMeta] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AssetEditTarget | null>(null);
  // Stable per-slide ids — keyed by index, regenerated only when slide count changes
  const [slideIds] = useState<string[]>(() => initial.slides.map(() => crypto.randomUUID()));
  const slideIdFor = (i: number) => slideIds[i] || `slide-${i}`;

  const active = outline.slides[activeIdx];

  const updateSlide = (patch: Partial<SlideOutline>) => {
    setOutline((o) => ({
      ...o,
      slides: o.slides.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)),
    }));
    setDirty(true);
  };

  const updateMeta = (patch: Partial<DeckOutline>) => {
    setOutline((o) => ({ ...o, ...patch }));
    setDirty(true);
  };

  const addSlide = () => {
    const newSlide: SlideOutline = { layout: "bullets", title: "New slide", bullets: ["New point"] };
    setOutline((o) => ({ ...o, slides: [...o.slides.slice(0, activeIdx + 1), newSlide, ...o.slides.slice(activeIdx + 1)] }));
    setActiveIdx((i) => i + 1);
    setDirty(true);
  };

  const duplicateSlide = () => {
    setOutline((o) => ({
      ...o,
      slides: [...o.slides.slice(0, activeIdx + 1), JSON.parse(JSON.stringify(o.slides[activeIdx])), ...o.slides.slice(activeIdx + 1)],
    }));
    setActiveIdx((i) => i + 1);
    setDirty(true);
  };

  const deleteSlide = () => {
    if (outline.slides.length <= 1) return;
    setOutline((o) => ({ ...o, slides: o.slides.filter((_, i) => i !== activeIdx) }));
    setActiveIdx((i) => Math.max(0, i - 1));
    setDirty(true);
  };

  const moveSlide = (dir: -1 | 1) => {
    const ni = activeIdx + dir;
    if (ni < 0 || ni >= outline.slides.length) return;
    setOutline((o) => {
      const slides = o.slides.slice();
      const [m] = slides.splice(activeIdx, 1);
      slides.splice(ni, 0, m);
      return { ...o, slides };
    });
    setActiveIdx(ni);
    setDirty(true);
  };

  const runAi = async (
    action: "rewrite" | "shorten" | "expand" | "tone" | "convert" | "regenerate",
    extras: { tone?: string; targetLayout?: SlideOutline["layout"]; instruction?: string } = {},
  ) => {
    setAiBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("edit-slide", {
        body: {
          slide: outline.slides[activeIdx],
          action,
          deckTitle: outline.title,
          deckTopic: outline.subtitle,
          ...extras,
        },
      });
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        toast({
          title: status === 402 ? "AI credits exhausted" : status === 429 ? "Rate limited" : "AI edit failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      if (data?.slide) {
        setOutline((o) => ({ ...o, slides: o.slides.map((s, i) => (i === activeIdx ? data.slide : s)) }));
        setDirty(true);
        toast({ title: "Slide updated", description: "AI rewrote this slide." });
      }
    } catch (e) {
      toast({ title: "AI edit failed", description: String(e), variant: "destructive" });
    } finally {
      setAiBusy(null);
    }
  };

  const rebuild = async () => {
    setRebuilding(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: { topic: outline.title, slideCount: outline.slides.length, prebuiltOutline: outline, templateId },
      });
      if (error) {
        toast({ title: "Rebuild failed", description: error.message, variant: "destructive" });
        return;
      }
      setDownloadUrl(data.downloadUrl);
      setFilename(data.filename);
      setDirty(false);
      onUpdated?.({ outline, downloadUrl: data.downloadUrl, filename: data.filename, templateId: data.templateId || templateId });
      toast({ title: "Updated .pptx ready", description: "Your edits are baked into a fresh download." });
    } catch (e) {
      toast({ title: "Rebuild failed", description: String(e), variant: "destructive" });
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <Card className="mt-4 overflow-hidden border-primary/30">
      {/* Header: title + palette + actions */}
      <div className="p-4 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: `#${outline.palette.primary}` }}>
            <span className="text-white font-bold text-sm">{outline.slides.length}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editingMeta ? (
              <div className="space-y-2">
                <Input value={outline.title} onChange={(e) => updateMeta({ title: e.target.value })} className="h-8 font-semibold" />
                <Input value={outline.subtitle} onChange={(e) => updateMeta({ subtitle: e.target.value })} className="h-7 text-xs" />
                <Button size="sm" variant="ghost" onClick={() => setEditingMeta(false)}><Check className="h-3 w-3" /> Done</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{outline.title}</h3>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingMeta(true)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate">{outline.subtitle}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          {Object.entries(outline.palette).map(([k, hex]) => (
            <div key={k} className="flex-1 h-5 rounded" style={{ background: `#${hex}` }} title={`${k}: #${hex}`} />
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Button asChild variant="default" size="sm" className="flex-1" disabled={dirty}>
            <a href={downloadUrl} download={filename}>
              <Download className="h-4 w-4" /> {dirty ? "Rebuild to download" : `Download ${filename}`}
            </a>
          </Button>
          {dirty && (
            <Button onClick={rebuild} variant="default" size="sm" disabled={rebuilding}>
              {rebuilding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4" /> Rebuild .pptx</>}
            </Button>
          )}
        </div>
      </div>

      {/* Body: thumbs + canvas + editor */}
      <div className="grid grid-cols-[140px_1fr] min-h-[420px]">
        {/* Thumbnails */}
        <div className="border-r bg-muted/20 overflow-y-auto max-h-[520px] p-2 space-y-1.5">
          {outline.slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-full text-left rounded-md border-2 transition-all overflow-hidden ${
                i === activeIdx ? "border-primary shadow-sm" : "border-transparent hover:border-border"
              }`}
              style={{
                backgroundColor: `#${outline.palette.background}`,
                backgroundImage: templatePreviewImage(templateId, s.layout) ? `url(${templatePreviewImage(templateId, s.layout)})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="aspect-video p-2 relative">
                <div className="text-[6px] font-bold leading-tight line-clamp-2" style={{ color: `#${outline.palette.text}` }}>
                  {s.title}
                </div>
                <div className="absolute bottom-0.5 left-1 text-[6px] uppercase tracking-wider opacity-60" style={{ color: `#${outline.palette.text}` }}>
                  {i + 1} · {LAYOUT_LABELS[s.layout]}
                </div>
                {s.layout === "title" && (
                  <div className="absolute inset-x-2 bottom-3 h-0.5 rounded" style={{ background: `#${outline.palette.accent}` }} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Main canvas + editor */}
        <div className="flex flex-col">
          {/* Canvas preview */}
          <div className="p-4 border-b" style={{ background: `#${outline.palette.background}` }}>
            <div
              className="aspect-video w-full rounded-lg p-6 flex flex-col justify-between shadow-inner bg-cover bg-center cursor-pointer"
              style={{
                color: `#${outline.palette.text}`,
                fontFamily: outline.fonts?.body,
                backgroundColor: `#${outline.palette.background}`,
                backgroundImage: templatePreviewImage(templateId, active.layout) ? `url(${templatePreviewImage(templateId, active.layout)})` : undefined,
              }}
              onDoubleClick={() => {
                // Prefer chart, then first reference image
                if (active.chart || active.visualIntent === "chart") {
                  setEditTarget({ kind: "chart", chart: active.chart });
                } else if (active.references && active.references.length > 0) {
                  setEditTarget({ kind: "image", image: active.references[0], index: 0 });
                } else {
                  toast({ title: "No editable assets on this slide", description: "Add a chart or reference image below to edit." });
                }
              }}
              title="Double-click to edit chart or first reference image"
            >
              <SlideRenderer slide={active} palette={outline.palette} fonts={outline.fonts} templateId={templateId} />
            </div>
          </div>

          {/* Slide controls */}
          <div className="px-3 py-2 border-b bg-card flex items-center gap-1 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => setActiveIdx((i) => Math.max(0, i - 1))} disabled={activeIdx === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Slide {activeIdx + 1} / {outline.slides.length}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setActiveIdx((i) => Math.min(outline.slides.length - 1, i + 1))} disabled={activeIdx === outline.slides.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button size="sm" variant="ghost" onClick={() => moveSlide(-1)} disabled={activeIdx === 0} title="Move up">↑</Button>
            <Button size="sm" variant="ghost" onClick={() => moveSlide(1)} disabled={activeIdx === outline.slides.length - 1} title="Move down">↓</Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button size="sm" variant="ghost" onClick={addSlide}><Plus className="h-3 w-3" /> Add</Button>
            <Button size="sm" variant="ghost" onClick={duplicateSlide}><Copy className="h-3 w-3" /> Duplicate</Button>
            <Button size="sm" variant="ghost" onClick={deleteSlide} disabled={outline.slides.length <= 1} className="text-destructive hover:text-destructive">
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>

          {/* AI action bar — Gamma-style per-slide AI editing */}
          <div className="px-3 py-2 border-b bg-gradient-to-r from-primary/5 via-accent/5 to-transparent flex items-center gap-1 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground pr-2">
              <Sparkles className="h-3 w-3 text-primary" /> AI
            </div>
            <Button size="sm" variant="ghost" disabled={!!aiBusy} onClick={() => runAi("rewrite")} title="Rewrite for clarity">
              {aiBusy === "rewrite" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} Rewrite
            </Button>
            <Button size="sm" variant="ghost" disabled={!!aiBusy} onClick={() => runAi("shorten")} title="Cut filler">
              {aiBusy === "shorten" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minimize2 className="h-3 w-3" />} Shorten
            </Button>
            <Button size="sm" variant="ghost" disabled={!!aiBusy} onClick={() => runAi("expand")} title="Add depth">
              {aiBusy === "expand" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Maximize2 className="h-3 w-3" />} Expand
            </Button>
            <Button size="sm" variant="ghost" disabled={!!aiBusy} onClick={() => runAi("regenerate")} title="Different angle">
              {aiBusy === "regenerate" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shuffle className="h-3 w-3" />} Regenerate
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <select
              disabled={!!aiBusy}
              onChange={(e) => { if (e.target.value) { runAi("tone", { tone: e.target.value }); e.target.value = ""; } }}
              defaultValue=""
              className="text-xs rounded border bg-background px-2 py-1 h-7"
              title="Change tone"
            >
              <option value="" disabled>Change tone…</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="bold">Bold</option>
              <option value="friendly">Friendly</option>
              <option value="executive">Executive</option>
              <option value="storytelling">Storytelling</option>
            </select>
            <select
              disabled={!!aiBusy}
              onChange={(e) => {
                const v = e.target.value as SlideOutline["layout"] | "";
                if (v && v !== active.layout) { runAi("convert", { targetLayout: v }); }
                e.target.value = "";
              }}
              defaultValue=""
              className="text-xs rounded border bg-background px-2 py-1 h-7"
              title="Convert layout"
            >
              <option value="" disabled>Convert to…</option>
              {LAYOUT_OPTIONS.filter((l) => l !== active.layout).map((l) => (
                <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
              ))}
            </select>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[280px]">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{LAYOUT_LABELS[active.layout]}</Badge>
              <select
                value={active.layout}
                onChange={(e) => updateSlide({ layout: e.target.value as SlideOutline["layout"] })}
                className="text-xs rounded border bg-background px-2 py-1"
              >
                {LAYOUT_OPTIONS.map((l) => (
                  <option key={l} value={l}>{LAYOUT_LABELS[l]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Title</label>
              <Input value={active.title} onChange={(e) => updateSlide({ title: e.target.value })} className="h-8" />
            </div>

            {(active.layout === "title" || active.layout === "section" || active.layout === "closing") && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subtitle</label>
                <Input value={active.subtitle || ""} onChange={(e) => updateSlide({ subtitle: e.target.value })} className="h-8" />
              </div>
            )}

            {active.layout === "bullets" && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bullets (one per line)</label>
                <Textarea
                  value={(active.bullets || []).join("\n")}
                  onChange={(e) => updateSlide({ bullets: e.target.value.split("\n").filter(Boolean) })}
                  rows={4}
                  className="text-sm"
                />
              </div>
            )}

            {active.layout === "two_column" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    placeholder="Left heading"
                    value={active.leftColumn?.heading || ""}
                    onChange={(e) => updateSlide({ leftColumn: { ...(active.leftColumn || { bullets: [] }), heading: e.target.value } })}
                    className="h-8 mb-1"
                  />
                  <Textarea
                    placeholder="Left bullets"
                    value={(active.leftColumn?.bullets || []).join("\n")}
                    onChange={(e) => updateSlide({ leftColumn: { heading: active.leftColumn?.heading || "", bullets: e.target.value.split("\n").filter(Boolean) } })}
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Right heading"
                    value={active.rightColumn?.heading || ""}
                    onChange={(e) => updateSlide({ rightColumn: { ...(active.rightColumn || { bullets: [] }), heading: e.target.value } })}
                    className="h-8 mb-1"
                  />
                  <Textarea
                    placeholder="Right bullets"
                    value={(active.rightColumn?.bullets || []).join("\n")}
                    onChange={(e) => updateSlide({ rightColumn: { heading: active.rightColumn?.heading || "", bullets: e.target.value.split("\n").filter(Boolean) } })}
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {active.layout === "stat" && (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Value (e.g. 87%)" value={active.stat?.value || ""} onChange={(e) => updateSlide({ stat: { value: e.target.value, label: active.stat?.label || "" } })} className="h-8" />
                <Input placeholder="Label" value={active.stat?.label || ""} onChange={(e) => updateSlide({ stat: { value: active.stat?.value || "", label: e.target.value } })} className="h-8" />
              </div>
            )}

            {active.layout === "quote" && (
              <>
                <Textarea placeholder="Quote text" value={active.quote?.text || ""} onChange={(e) => updateSlide({ quote: { text: e.target.value, attribution: active.quote?.attribution } })} rows={2} />
                <Input placeholder="Attribution" value={active.quote?.attribution || ""} onChange={(e) => updateSlide({ quote: { text: active.quote?.text || "", attribution: e.target.value } })} className="h-8" />
              </>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Speaker notes</label>
              <Textarea value={active.notes || ""} onChange={(e) => updateSlide({ notes: e.target.value })} rows={2} className="text-xs" />
            </div>

            {/* Assets — chart + reference images. Double-click any tile to open the editor. */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Assets on this slide</label>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setEditTarget({ kind: "chart", chart: active.chart })}
                    title="Add or edit chart"
                  >
                    <BarChart3 className="h-3 w-3" /> {active.chart ? "Edit chart" : "Add chart"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {active.chart && (
                  <button
                    type="button"
                    onDoubleClick={() => setEditTarget({ kind: "chart", chart: active.chart })}
                    onClick={() => setEditTarget({ kind: "chart", chart: active.chart })}
                    className="aspect-video rounded-md border border-border bg-muted/40 hover:border-primary/60 transition-colors flex flex-col items-center justify-center text-[10px] text-muted-foreground gap-1 p-2"
                    title="Double-click to edit chart"
                  >
                    <BarChart3 className="h-5 w-5" style={{ color: `#${outline.palette.accent}` }} />
                    <span className="font-medium text-foreground">{active.chart.title || `${active.chart.type} chart`}</span>
                    <span>{active.chart.data?.length || 0} rows · double-click to edit</span>
                  </button>
                )}
                {(active.references || []).map((r, i) => (
                  <button
                    type="button"
                    key={r.url + i}
                    onDoubleClick={() => setEditTarget({ kind: "image", image: r, index: i })}
                    onClick={() => setEditTarget({ kind: "image", image: r, index: i })}
                    className="relative aspect-video rounded-md border border-border bg-muted/40 hover:border-primary/60 transition-colors overflow-hidden group"
                    title="Double-click to edit (replace, restyle, caption, treatment)"
                  >
                    <img src={r.url} alt={r.caption || `ref ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <ImageIcon className="absolute top-1 right-1 h-3 w-3 text-white drop-shadow opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
                {!active.chart && (!active.references || active.references.length === 0) && (
                  <div className="col-span-3 text-[11px] text-muted-foreground italic px-1">
                    No assets yet. Click "Add chart" above, or add reference images during outline review.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssetEditDialog
        open={editTarget !== null}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        target={editTarget}
        slideId={slideIdFor(activeIdx)}
        palette={outline.palette}
        onChartChange={(chart) => updateSlide({ chart })}
        onImageChange={(idx, img) => {
          const next = (active.references || []).map((r, i) => (i === idx ? img : r));
          updateSlide({ references: next });
        }}
        onImageRemove={(idx) => {
          const next = (active.references || []).filter((_, i) => i !== idx);
          updateSlide({ references: next });
        }}
      />
    </Card>
  );
};

const SlideRenderer: React.FC<{ slide: SlideOutline; palette: DeckOutline["palette"]; fonts: DeckOutline["fonts"]; templateId?: string }> = ({ slide, palette, fonts, templateId }) => {
  const headingStyle: React.CSSProperties = { fontFamily: fonts?.heading, color: `#${palette.text}` };
  const accent = `#${palette.accent}`;
  const hasTemplateImage = !!templatePreviewImage(templateId, slide.layout);
  const surfaceClass = hasTemplateImage ? "rounded-lg bg-background/70 p-4 backdrop-blur-sm" : "";

  if (slide.layout === "title" || slide.layout === "closing") {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center gap-3">
        <div className={surfaceClass}>
          <h1 className="text-3xl font-bold leading-tight" style={headingStyle}>{slide.title}</h1>
          {slide.subtitle && <p className="text-sm opacity-75">{slide.subtitle}</p>}
          <div className="h-1 w-16 rounded mt-2 mx-auto" style={{ background: accent }} />
        </div>
      </div>
    );
  }
  if (slide.layout === "section") {
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: accent }}>Section</div>
        <h1 className="text-3xl font-bold" style={headingStyle}>{slide.title}</h1>
        {slide.subtitle && <p className="text-sm opacity-75 mt-2">{slide.subtitle}</p>}
      </div>
    );
  }
  if (slide.layout === "stat") {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center">
        <div className="text-6xl font-black leading-none" style={{ color: accent, fontFamily: fonts?.heading }}>{slide.stat?.value}</div>
        <div className="text-sm opacity-75 mt-3 max-w-md">{slide.stat?.label}</div>
        <h2 className="text-xs uppercase tracking-widest mt-4 opacity-60">{slide.title}</h2>
      </div>
    );
  }
  if (slide.layout === "quote") {
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="text-3xl leading-none mb-2" style={{ color: accent }}>"</div>
        <p className="text-base italic leading-relaxed">{slide.quote?.text}</p>
        {slide.quote?.attribution && <p className="text-xs opacity-60 mt-3">— {slide.quote.attribution}</p>}
      </div>
    );
  }
  if (slide.layout === "two_column") {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-bold mb-3" style={headingStyle}>{slide.title}</h2>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {[slide.leftColumn, slide.rightColumn].map((col, i) => col && (
            <div key={i}>
              <div className="text-xs font-semibold mb-1" style={{ color: accent }}>{col.heading}</div>
              <ul className="text-xs space-y-1">
                {col.bullets.map((b, bi) => <li key={bi}>• {b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // bullets (default)
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3" style={headingStyle}>{slide.title}</h2>
      <ul className="text-sm space-y-1.5 flex-1">
        {(slide.bullets || []).map((b, i) => (
          <li key={i} className="flex gap-2">
            <span style={{ color: accent }}>▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
