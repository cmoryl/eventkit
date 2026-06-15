import React, { useMemo, useState } from "react";
import { Columns3, X, Search, AlertTriangle, Check, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MiniSlide,
  lookFor,
  graphSystemFor,
  LOOK_LABELS,
  type PreviewKind,
  type DeckLookId,
  type GraphSystemId,
} from "./TemplatePosterPreview";
import { TemplatePreviewDialog, type SlideKind } from "./TemplatePreviewDialog";
import type { DeckTemplate } from "./TemplateGallery";

// Maps the gallery's PreviewKind taxonomy to the full preview dialog's SlideKind taxonomy.
const PREVIEW_KIND_TO_SLIDE_KIND: Partial<Record<PreviewKind, SlideKind>> = {
  title: "title",
  section: "section",
  stats: "kpi-hero",
  "stat-hero": "stat",
  chart: "chart",
  quote: "quote",
  agenda: "agenda",
  team: "team",
  process: "process",
  "image-split": "feature-split",
  closing: "stat",
  editorial: "section",
  columns: "cards",
  bullet: "cards",
  comparison: "compare",
  "full-bleed": "gallery",
  "webinar-title": "title",
  speaker: "team",
  qa: "quote",
  poll: "metrics",
  stream: "gallery",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: DeckTemplate[];
  initialIds?: string[];
}

const COMPARE_KINDS: { kind: PreviewKind; label: string }[] = [
  { kind: "title", label: "Title" },
  { kind: "section", label: "Section" },
  { kind: "stats", label: "Stats" },
  { kind: "chart", label: "Chart" },
  { kind: "quote", label: "Quote" },
  { kind: "agenda", label: "Agenda" },
  { kind: "team", label: "Team" },
  { kind: "process", label: "Process" },
  { kind: "image-split", label: "Image split" },
  { kind: "closing", label: "Closing" },
];

const MAX_COLS = 4;

export const TemplateCompareDialog: React.FC<Props> = ({ open, onOpenChange, templates, initialIds = [] }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds.slice(0, MAX_COLS));
  const [search, setSearch] = useState("");
  const [focus, setFocus] = useState<{ template: DeckTemplate; kind: PreviewKind; shared: boolean } | null>(null);

  // Reset when reopened with new initial set
  React.useEffect(() => {
    if (open) setSelectedIds((prev) => (prev.length ? prev : initialIds.slice(0, MAX_COLS)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = useMemo(
    () => selectedIds.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as DeckTemplate[],
    [selectedIds, templates],
  );

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= MAX_COLS) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q),
    );
  }, [templates, search]);

  // Per-kind duplicate detection: same (look + graphSystem) signature across templates
  const dupSignatures = useMemo(() => {
    const map = new Map<PreviewKind, Map<string, number>>();
    for (const k of COMPARE_KINDS) {
      const sig = new Map<string, number>();
      for (const t of selected) {
        const look = lookFor(t, k.kind);
        const gs = graphSystemFor(t, k.kind, look);
        const key = `${look}::${gs}`;
        sig.set(key, (sig.get(key) || 0) + 1);
      }
      map.set(k.kind, sig);
    }
    return map;
  }, [selected]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[94vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
              <Columns3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Side-by-side template comparison</h2>
              <p className="text-xs text-muted-foreground">
                Pick up to {MAX_COLS} templates. Cells with a yellow badge share the same look + graph system as another column.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">
              {selected.length}/{MAX_COLS} selected
            </span>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar selector */}
          <div className="w-72 shrink-0 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredList.map((t) => {
                  const active = selectedIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggle(t.id)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:bg-secondary",
                      )}
                    >
                      <span
                        className="h-6 w-10 shrink-0 rounded-sm border"
                        style={{
                          background: t.palette.bg,
                          borderColor: t.palette.accent,
                          boxShadow: `inset 0 -3px 0 ${t.palette.accent}`,
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block font-bold truncate">{t.name}</span>
                        <span className="block text-[10px] text-muted-foreground truncate">{t.id}</span>
                      </span>
                      {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
                {filteredList.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6">No matches.</div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Comparison matrix */}
          <ScrollArea className="flex-1">
            {selected.length === 0 ? (
              <div className="h-full flex items-center justify-center p-16 text-center text-sm text-muted-foreground">
                Select 2–4 templates from the left to compare them slide-by-slide.
              </div>
            ) : (
              <div className="p-5">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `120px repeat(${selected.length}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Column header row */}
                  <div />
                  {selected.map((t) => {
                    const titleLook = lookFor(t, "title");
                    return (
                      <div
                        key={`head-${t.id}`}
                        className="rounded-xl border p-3 bg-card/60 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-black text-sm truncate">{t.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{t.id}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggle(t.id)}
                            className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{
                              background: t.palette.accent,
                              color: t.palette.bg,
                            }}
                          >
                            LOOK · {LOOK_LABELS[titleLook] || titleLook}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[t.palette.bg, t.palette.text, t.palette.accent, t.palette.secondary].map((c, i) => (
                            <span
                              key={i}
                              className="h-4 flex-1 rounded-sm border"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Rows */}
                  {COMPARE_KINDS.map(({ kind, label }) => {
                    const sigMap = dupSignatures.get(kind);
                    return (
                      <React.Fragment key={kind}>
                        <div className="flex flex-col justify-center pr-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-[9px] text-muted-foreground/70">{kind}</span>
                        </div>
                        {selected.map((t) => {
                          const look = lookFor(t, kind);
                          const gs = graphSystemFor(t, kind, look);
                          const sigKey = `${look}::${gs}`;
                          const isDup = (sigMap?.get(sigKey) || 0) > 1;
                          const mapped = PREVIEW_KIND_TO_SLIDE_KIND[kind];
                          return (
                            <button
                              type="button"
                              key={`${kind}-${t.id}`}
                              onClick={() => setFocus({ template: t, kind, shared: isDup })}
                              title={
                                isDup
                                  ? `Open ${t.name} preview — highlights this shared ${LOOK_LABELS[look] || look} / ${gs} region`
                                  : `Open ${t.name} preview at ${label}`
                              }
                              className={cn(
                                "group relative rounded-xl border overflow-hidden bg-card/60 text-left transition hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary",
                                isDup && "ring-2 ring-yellow-500/70",
                              )}
                            >
                              <div className="aspect-video w-full overflow-hidden">
                                <MiniSlide kind={kind} template={t} look={look} />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 pointer-events-none">
                                <span className="flex items-center gap-1 rounded-full bg-background px-2 py-1 text-[10px] font-bold text-foreground shadow">
                                  <Maximize2 className="h-3 w-3" /> Open preview
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t bg-background/70">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[9px] font-bold truncate" title={LOOK_LABELS[look] || look}>
                                    {LOOK_LABELS[look] || look}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground truncate" title={gs}>
                                    graph: {gs}
                                  </span>
                                </div>
                                {isDup && (
                                  <span
                                    className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-1.5 py-0.5 text-[9px] font-black text-black"
                                    title="Another selected template uses this same look + graph system"
                                  >
                                    <AlertTriangle className="h-2.5 w-2.5" /> SHARED
                                  </span>
                                )}
                              </div>
                              {!mapped && (
                                <span className="absolute top-1 left-1 rounded bg-background/80 px-1 py-0.5 text-[8px] text-muted-foreground">
                                  preview maps to closest slide
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>

      <TemplatePreviewDialog
        template={focus?.template ?? null}
        open={!!focus}
        onOpenChange={(o) => { if (!o) setFocus(null); }}
        onUse={() => setFocus(null)}
        focusSlideKind={focus ? PREVIEW_KIND_TO_SLIDE_KIND[focus.kind] : undefined}
        highlightShared={focus?.shared}
      />
    </Dialog>
  );
};
