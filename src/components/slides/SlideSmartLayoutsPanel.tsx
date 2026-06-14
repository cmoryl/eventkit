// Smart Layouts library — replaces the old SlideSectionLibraryPanel.
// Categorised tabs (Basic · Structure · Data · Media), live mini-previews,
// drag-and-drop using the SLIDE_SECTION_MIME payload already wired into
// SlideEditor's canvas/thumbnail drop handlers.
//
// Built on top of the deterministic named-slot template registry so voice
// tools and AI suggestions can reference the same template ids.
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Type, Heading1, Heading2, Columns2, Image as ImageIcon, ImagePlus, Quote,
  Hash, BarChart3, ListChecks, Square, LayoutTemplate, Search, GripVertical,
  GitCompare, Workflow, Calendar, AreaChart,
} from "lucide-react";
import type { SlideData } from "./slideTypes";
import {
  SLIDE_BLOCK_TEMPLATES,
  applySlideTemplate,
  type SlideBlockTemplate,
  type SmartLayoutCategory,
} from "./slideTemplateRegistry";

export const SLIDE_SECTION_MIME = "application/x-eventkit-section";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "title-hero": Heading1,
  "section-divider": Heading2,
  "content-bullets": Type,
  "blank-canvas": Square,
  "two-column-split": Columns2,
  "comparison-vs": GitCompare,
  "agenda-outline": ListChecks,
  "process-arrow": Workflow,
  "timeline-horizontal": Calendar,
  "kpi-trio": BarChart3,
  "stat-hero": Hash,
  "chart-bar": AreaChart,
  "pull-quote": Quote,
  "image-left": ImageIcon,
  "image-right": ImagePlus,
  "full-image-hero": ImageIcon,
};

const tile = "h-full w-full rounded-[3px] bg-background border border-border/60 p-1.5 flex flex-col";

const PREVIEWS: Record<string, React.FC> = {
  "title-hero": () => (
    <div className={tile + " items-center justify-center gap-1"}>
      <div className="h-1.5 w-2/3 rounded-sm bg-foreground/70" />
      <div className="h-1 w-1/3 rounded-sm bg-muted-foreground/50" />
    </div>
  ),
  "section-divider": () => (
    <div className={tile + " items-start justify-end"}>
      <div className="h-0.5 w-4 rounded-sm bg-primary mb-1" />
      <div className="h-1.5 w-3/4 rounded-sm bg-foreground/70" />
    </div>
  ),
  "content-bullets": () => (
    <div className={tile + " gap-1"}>
      <div className="h-1 w-2/3 rounded-sm bg-foreground/70" />
      <div className="mt-1 space-y-0.5">
        <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-4/6 rounded-sm bg-muted-foreground/40" />
      </div>
    </div>
  ),
  "blank-canvas": () => (
    <div className={tile + " items-center justify-center"}>
      <Square className="h-3 w-3 text-muted-foreground/40" />
    </div>
  ),
  "two-column-split": () => (
    <div className={tile + " flex-row gap-1"}>
      {[0, 1].map((i) => (
        <div key={i} className="flex-1 space-y-0.5">
          <div className="h-1 w-full rounded-sm bg-foreground/60" />
          <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
          <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
        </div>
      ))}
    </div>
  ),
  "comparison-vs": () => (
    <div className={tile + " flex-row items-center gap-1 relative"}>
      <div className="flex-1 space-y-0.5">
        <div className="h-1 w-2/3 rounded-sm bg-primary/70" />
        <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
      </div>
      <div className="text-[7px] font-bold text-primary px-0.5">VS</div>
      <div className="flex-1 space-y-0.5">
        <div className="h-1 w-2/3 rounded-sm bg-foreground/60" />
        <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
      </div>
    </div>
  ),
  "agenda-outline": () => (
    <div className={tile + " gap-0.5 justify-center"}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="h-1 w-1 rounded-full bg-primary" />
          <div className="h-[3px] flex-1 rounded-sm bg-muted-foreground/40" />
        </div>
      ))}
    </div>
  ),
  "process-arrow": () => (
    <div className={tile + " flex-row items-center justify-center gap-0.5"}>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <div className="h-3 w-3 rounded-full bg-primary/70 flex items-center justify-center text-[6px] text-primary-foreground font-bold">{i + 1}</div>
          {i < 2 && <div className="h-px flex-1 bg-muted-foreground/40" />}
        </React.Fragment>
      ))}
    </div>
  ),
  "timeline-horizontal": () => (
    <div className={tile + " justify-center"}>
      <div className="relative h-px w-full bg-muted-foreground/40 my-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="absolute -top-0.5 h-1.5 w-1.5 rounded-full bg-primary" style={{ left: `${10 + i * 27}%` }} />
        ))}
      </div>
    </div>
  ),
  "kpi-trio": () => (
    <div className={tile + " flex-row gap-1 items-center justify-center"}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="h-1.5 w-full rounded-sm bg-primary/70" />
          <div className="h-[2px] w-2/3 rounded-sm bg-muted-foreground/50" />
        </div>
      ))}
    </div>
  ),
  "stat-hero": () => (
    <div className={tile + " items-center justify-center"}>
      <div className="text-[10px] font-bold leading-none text-primary">99%</div>
      <div className="h-[3px] w-1/2 rounded-sm bg-muted-foreground/50 mt-0.5" />
    </div>
  ),
  "chart-bar": () => (
    <div className={tile + " flex-row items-end justify-center gap-0.5 pb-1"}>
      {[40, 60, 80, 100].map((h, i) => (
        <div key={i} className="w-1.5 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
      ))}
    </div>
  ),
  "pull-quote": () => (
    <div className={tile + " items-start justify-center"}>
      <Quote className="h-2.5 w-2.5 text-primary mb-0.5" />
      <div className="h-[3px] w-5/6 rounded-sm bg-foreground/60" />
      <div className="h-[3px] w-2/3 rounded-sm bg-foreground/60 mt-0.5" />
    </div>
  ),
  "image-left": () => (
    <div className={tile + " flex-row gap-1"}>
      <div className="w-1/2 rounded-sm bg-muted-foreground/30 flex items-center justify-center">
        <ImageIcon className="h-2.5 w-2.5 text-muted-foreground/60" />
      </div>
      <div className="flex-1 space-y-0.5 pt-1">
        <div className="h-1 w-full rounded-sm bg-foreground/60" />
        <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-2/3 rounded-sm bg-muted-foreground/40" />
      </div>
    </div>
  ),
  "image-right": () => (
    <div className={tile + " flex-row gap-1"}>
      <div className="flex-1 space-y-0.5 pt-1">
        <div className="h-1 w-full rounded-sm bg-foreground/60" />
        <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
        <div className="h-[3px] w-2/3 rounded-sm bg-muted-foreground/40" />
      </div>
      <div className="w-1/2 rounded-sm bg-muted-foreground/30 flex items-center justify-center">
        <ImageIcon className="h-2.5 w-2.5 text-muted-foreground/60" />
      </div>
    </div>
  ),
  "full-image-hero": () => (
    <div className={tile + " items-center justify-center bg-muted-foreground/25"}>
      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
    </div>
  ),
};

const CATEGORIES: { id: SmartLayoutCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "structure", label: "Structure" },
  { id: "data", label: "Data" },
  { id: "media", label: "Media" },
];

interface Props {
  /** Insert this template as a new slide after the active one. */
  onInsertSection: (payload: Omit<SlideData, "id">) => void;
}

export const SlideSmartLayoutsPanel: React.FC<Props> = ({ onInsertSection }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SmartLayoutCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SLIDE_BLOCK_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.category.includes(q)
      );
    });
  }, [query, category]);

  const handleInsert = (template: SlideBlockTemplate) => {
    const payload = applySlideTemplate(template.id);
    if (payload) onInsertSection(payload);
  };

  const handleDragStart = (template: SlideBlockTemplate) => (e: React.DragEvent) => {
    const payload = applySlideTemplate(template.id);
    if (!payload) return;
    e.dataTransfer.setData(SLIDE_SECTION_MIME, JSON.stringify(payload));
    e.dataTransfer.setData("text/plain", template.label);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <LayoutTemplate className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">Smart layouts</span>
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {SLIDE_BLOCK_TEMPLATES.length}
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          Drag onto canvas
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
              category === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-background hover:border-primary/40 text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search layouts…"
          aria-label="Search smart layouts"
          className="h-7 pl-7 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-6 text-center text-[11px] text-muted-foreground">
          No layouts match your search.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-[320px] overflow-y-auto pr-0.5">
          {filtered.map((template) => {
            const Icon = ICONS[template.id] ?? LayoutTemplate;
            const Preview = PREVIEWS[template.id];
            return (
              <button
                key={template.id}
                type="button"
                draggable
                onDragStart={handleDragStart(template)}
                onClick={() => handleInsert(template)}
                aria-label={`Insert ${template.label} layout`}
                title={`${template.label} — ${template.description}\nDrag to canvas or click to insert`}
                className="group relative rounded-md border border-border/60 bg-background hover:border-primary hover:ring-2 hover:ring-primary/30 transition cursor-grab active:cursor-grabbing overflow-hidden text-left"
              >
                <div className="aspect-[4/3] p-1.5 bg-muted/40">
                  {Preview ? <Preview /> : <div className={tile} />}
                </div>
                <div className="px-1.5 py-1 border-t border-border/40 flex items-center gap-1">
                  <Icon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] font-medium truncate">{template.label}</span>
                  <GripVertical className="h-2.5 w-2.5 text-muted-foreground/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlideSmartLayoutsPanel;
