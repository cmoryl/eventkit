// Pre-built section library for the Slide Editor inspector.
// Each tile represents a ready-to-use slide layout that can be:
//   • clicked to insert a new slide after the active one, or
//   • dragged onto the canvas / thumbnail rail to drop in a precise position.
//
// Drag payload uses MIME type `application/x-eventkit-section` with a JSON
// body of the SlideData partial (no id — generated on insert).
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Type,
  Heading1,
  Heading2,
  Columns2,
  Image as ImageIcon,
  ImagePlus,
  Quote,
  Hash,
  BarChart3,
  ListChecks,
  Square,
  LayoutTemplate,
  Search,
  GripVertical,
} from "lucide-react";
import type { SlideData, SlideLayout } from "./slideTypes";

export const SLIDE_SECTION_MIME = "application/x-eventkit-section";

export interface SectionTemplate {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Partial SlideData (no id) — merged with a fresh uuid on insert. */
  payload: Omit<SlideData, "id">;
  /** Mini visual preview rendered inside the tile. */
  preview: React.ReactNode;
}

const tile = "h-full w-full rounded-[3px] bg-background border border-border/60 p-1.5 flex flex-col";

const PreviewTitle = () => (
  <div className={tile + " items-center justify-center gap-1"}>
    <div className="h-1.5 w-2/3 rounded-sm bg-foreground/70" />
    <div className="h-1 w-1/3 rounded-sm bg-muted-foreground/50" />
  </div>
);
const PreviewSection = () => (
  <div className={tile + " items-start justify-end"}>
    <div className="h-0.5 w-4 rounded-sm bg-primary mb-1" />
    <div className="h-1.5 w-3/4 rounded-sm bg-foreground/70" />
  </div>
);
const PreviewContent = () => (
  <div className={tile + " gap-1"}>
    <div className="h-1 w-2/3 rounded-sm bg-foreground/70" />
    <div className="mt-1 space-y-0.5">
      <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
      <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
      <div className="h-[3px] w-4/6 rounded-sm bg-muted-foreground/40" />
    </div>
  </div>
);
const PreviewTwoCol = () => (
  <div className={tile + " flex-row gap-1"}>
    <div className="flex-1 space-y-0.5">
      <div className="h-1 w-full rounded-sm bg-foreground/60" />
      <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
      <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
    </div>
    <div className="flex-1 space-y-0.5">
      <div className="h-1 w-full rounded-sm bg-foreground/60" />
      <div className="h-[3px] w-full rounded-sm bg-muted-foreground/40" />
      <div className="h-[3px] w-5/6 rounded-sm bg-muted-foreground/40" />
    </div>
  </div>
);
const PreviewImageLeft = () => (
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
);
const PreviewImageRight = () => (
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
);
const PreviewFullImage = () => (
  <div className={tile + " items-center justify-center bg-muted-foreground/25"}>
    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
  </div>
);
const PreviewQuote = () => (
  <div className={tile + " items-start justify-center"}>
    <Quote className="h-2.5 w-2.5 text-primary mb-0.5" />
    <div className="h-[3px] w-5/6 rounded-sm bg-foreground/60" />
    <div className="h-[3px] w-2/3 rounded-sm bg-foreground/60 mt-0.5" />
  </div>
);
const PreviewBigNumber = () => (
  <div className={tile + " items-center justify-center"}>
    <div className="text-[10px] font-bold leading-none text-primary">99%</div>
    <div className="h-[3px] w-1/2 rounded-sm bg-muted-foreground/50 mt-0.5" />
  </div>
);
const PreviewStats = () => (
  <div className={tile + " flex-row gap-1 items-center justify-center"}>
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
        <div className="h-1.5 w-full rounded-sm bg-primary/70" />
        <div className="h-[2px] w-2/3 rounded-sm bg-muted-foreground/50" />
      </div>
    ))}
  </div>
);
const PreviewAgenda = () => (
  <div className={tile + " gap-0.5 justify-center"}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-1">
        <div className="h-1 w-1 rounded-full bg-primary" />
        <div className="h-[3px] flex-1 rounded-sm bg-muted-foreground/40" />
      </div>
    ))}
  </div>
);
const PreviewBlank = () => (
  <div className={tile + " items-center justify-center"}>
    <Square className="h-3 w-3 text-muted-foreground/40" />
  </div>
);

const SECTIONS: SectionTemplate[] = [
  {
    id: "title",
    label: "Title",
    description: "Cover or chapter opener",
    icon: Heading1,
    payload: { layout: "title" as SlideLayout, title: "Presentation Title", subtitle: "Subtitle or tagline", variant: "default" },
    preview: <PreviewTitle />,
  },
  {
    id: "section",
    label: "Section",
    description: "Divider between chapters",
    icon: Heading2,
    payload: { layout: "section" as SlideLayout, title: "Section Header", subtitle: "Brief description", variant: "default" },
    preview: <PreviewSection />,
  },
  {
    id: "content",
    label: "Content",
    description: "Heading + body copy",
    icon: Type,
    payload: { layout: "content" as SlideLayout, title: "Slide Title", body: "Add your key points here.", variant: "default" },
    preview: <PreviewContent />,
  },
  {
    id: "two-column",
    label: "Two Column",
    description: "Side-by-side comparison",
    icon: Columns2,
    payload: { layout: "two-column" as SlideLayout, title: "Two Column Layout", body: "Left column content\n---\nRight column content", variant: "default" },
    preview: <PreviewTwoCol />,
  },
  {
    id: "image-left",
    label: "Image Left",
    description: "Image with text on right",
    icon: ImageIcon,
    payload: { layout: "image-left" as SlideLayout, title: "Slide Title", body: "Supporting copy next to the image.", variant: "default" },
    preview: <PreviewImageLeft />,
  },
  {
    id: "image-right",
    label: "Image Right",
    description: "Text with image on right",
    icon: ImagePlus,
    payload: { layout: "image-right" as SlideLayout, title: "Slide Title", body: "Supporting copy next to the image.", variant: "default" },
    preview: <PreviewImageRight />,
  },
  {
    id: "full-image",
    label: "Full Image",
    description: "Edge-to-edge hero image",
    icon: ImageIcon,
    payload: { layout: "full-image" as SlideLayout, title: "Hero Image", variant: "default" },
    preview: <PreviewFullImage />,
  },
  {
    id: "quote",
    label: "Quote",
    description: "Pull quote with attribution",
    icon: Quote,
    payload: { layout: "quote" as SlideLayout, title: "An inspiring quote that frames the next chapter.", quoteAuthor: "Author Name", variant: "default" },
    preview: <PreviewQuote />,
  },
  {
    id: "big-number",
    label: "Big Number",
    description: "Single hero stat",
    icon: Hash,
    payload: {
      layout: "big-number" as SlideLayout,
      title: "Headline metric",
      stats: [{ value: "99%", label: "Customer satisfaction" }],
      variant: "default",
    },
    preview: <PreviewBigNumber />,
  },
  {
    id: "stats",
    label: "Stats",
    description: "3-up KPI grid",
    icon: BarChart3,
    payload: {
      layout: "stats" as SlideLayout,
      title: "Key Metrics",
      stats: [
        { value: "120K", label: "Active users" },
        { value: "4.8★", label: "Avg rating" },
        { value: "32%", label: "YoY growth" },
      ],
      variant: "default",
    },
    preview: <PreviewStats />,
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Bulleted outline",
    icon: ListChecks,
    payload: {
      layout: "agenda" as SlideLayout,
      title: "Agenda",
      body: "Introduction\nThe challenge\nOur approach\nResults & next steps",
      variant: "default",
    },
    preview: <PreviewAgenda />,
  },
  {
    id: "blank",
    label: "Blank",
    description: "Empty canvas",
    icon: Square,
    payload: { layout: "blank" as SlideLayout, title: "", variant: "default" },
    preview: <PreviewBlank />,
  },
];

export const SECTION_TEMPLATES = SECTIONS;

interface SlideSectionLibraryPanelProps {
  /** Insert this template as a new slide after the active one. */
  onInsertSection: (payload: Omit<SlideData, "id">) => void;
}

export const SlideSectionLibraryPanel: React.FC<SlideSectionLibraryPanelProps> = ({
  onInsertSection,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.id.includes(q),
    );
  }, [query]);

  const handleDragStart = (template: SectionTemplate) => (e: React.DragEvent) => {
    const payload = JSON.stringify(template.payload);
    e.dataTransfer.setData(SLIDE_SECTION_MIME, payload);
    e.dataTransfer.setData("text/plain", template.label);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <LayoutTemplate className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">Pre-built sections</span>
          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
            {SECTIONS.length}
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          Drag onto canvas
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sections…"
          aria-label="Search pre-built sections"
          className="h-7 pl-7 text-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-6 text-center text-[11px] text-muted-foreground">
          No sections match your search.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-[280px] overflow-y-auto pr-0.5">
          {filtered.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                type="button"
                draggable
                onDragStart={handleDragStart(template)}
                onClick={() => onInsertSection(template.payload)}
                aria-label={`Insert ${template.label} section`}
                title={`${template.label} — ${template.description}\nDrag to canvas or click to insert`}
                className="group relative rounded-md border border-border/60 bg-background hover:border-primary hover:ring-2 hover:ring-primary/30 transition cursor-grab active:cursor-grabbing overflow-hidden text-left"
              >
                <div className="aspect-[4/3] p-1.5 bg-muted/40">
                  {template.preview}
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

export default SlideSectionLibraryPanel;
