import React, { useMemo, useState } from "react";
import { Check, LayoutGrid, Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ALL_PRESENTATION_TEMPLATES } from "@/config/editableTemplates/presentationTemplates";

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  themePrompt: string;
  palette: { bg: string; text: string; accent: string; secondary: string };
}

export const DECK_TEMPLATES: DeckTemplate[] = [
  {
    id: "transperfect-2026",
    name: "TransPerfect 2026",
    description: "Light bars · Geist · global authority",
    themePrompt:
      "TransPerfect 2026 brand system. Deep navy gradient backgrounds (#03002C → #002673 → #003FC7) on title and section slides; alabaster #E7E3DA or blue-white #E0E8F5 backgrounds on content slides. Use Geist Sans (Google Fonts) — Bold for headings (tight tracking -2 to -4), Regular for body. Visual motif: rhythmic vertical light bars/rays in turquoise #A1F9F9, lavender #C2A3FF, and electric blue #4D88FF used sparingly as a side band or footer rhythm — never decorative noise. Primary text #FFFFFF on dark, #03002C on light. Accent pops in 10% only: turquoise, lavender, orange #FF9878, pink #EC388A. No gradients on text. Generous whitespace, soft transitions between sections. Tone: authoritative, modern, human, transformative.",
    palette: { bg: "#03002C", text: "#FFFFFF", accent: "#A1F9F9", secondary: "#C2A3FF" },
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    description: "High-contrast tech vibe",
    themePrompt: "modern dark theme, near-black background (#0B0F19), white text, electric cyan accents",
    palette: { bg: "#0B0F19", text: "#FFFFFF", accent: "#22D3EE", secondary: "#A5B4FC" },
  },
  {
    id: "editorial-light",
    name: "Editorial Light",
    description: "Magazine-style minimal",
    themePrompt: "editorial light theme, off-white background, charcoal text, single warm accent, generous whitespace",
    palette: { bg: "#F7F5F1", text: "#1A1A1A", accent: "#C4654A", secondary: "#8B7355" },
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    description: "Investor-ready authority",
    themePrompt: "corporate navy theme, deep navy background, ivory text, gold accents, executive feel",
    palette: { bg: "#0F1B3D", text: "#F5F0E0", accent: "#C9A84C", secondary: "#3B6FA0" },
  },
  {
    id: "vibrant-startup",
    name: "Vibrant Startup",
    description: "Bold, energetic launch",
    themePrompt: "vibrant startup theme, white background, hot coral accent, deep indigo headings, playful and confident",
    palette: { bg: "#FFFFFF", text: "#1E1B4B", accent: "#F96167", secondary: "#6366F1" },
  },
  {
    id: "warm-terracotta",
    name: "Warm Terracotta",
    description: "Lifestyle & wellness",
    themePrompt: "warm terracotta theme, sand background, terracotta accents, sage green secondary, organic feel",
    palette: { bg: "#E7E8D1", text: "#2D2D2D", accent: "#B85042", secondary: "#A7BEAE" },
  },
  {
    id: "mono-brutalist",
    name: "Mono Brutalist",
    description: "Stark black & white",
    themePrompt: "brutalist monochrome theme, pure white background, pure black text, single bright yellow accent, oversized type",
    palette: { bg: "#FFFFFF", text: "#000000", accent: "#FFEB3B", secondary: "#666666" },
  },
];

// Convert library templates (PRESENTATION_SLIDE / WEBINAR / STREAM) into DeckTemplate shape
const LIBRARY_TEMPLATES: DeckTemplate[] = ALL_PRESENTATION_TEMPLATES.map((t) => {
  const bg =
    t.background?.type === "solid"
      ? t.background.value
      : t.background?.type === "gradient"
      ? t.background.value
      : "#0F172A";
  const colors = t.defaultColors || ({} as any);
  const palette = {
    bg: typeof bg === "string" && bg.startsWith("#") ? bg : colors.background || "#0F172A",
    text: colors.text || "#FFFFFF",
    accent: colors.accent || colors.primary || "#3B82F6",
    secondary: colors.secondary || "#64748B",
  };
  return {
    id: t.id,
    name: t.name,
    description: t.description || "",
    themePrompt: `${t.name.toLowerCase()} layout — ${t.description || ""}. Use ${palette.bg} background, ${palette.text} text, ${palette.accent} accents.`,
    palette: { ...palette, bg: typeof bg === "string" ? bg : palette.bg },
  } as DeckTemplate;
});

// Combined catalog: theme presets first, then full library
export const ALL_DECK_TEMPLATES: DeckTemplate[] = [...DECK_TEMPLATES, ...LIBRARY_TEMPLATES];

interface Props {
  selectedId: string | null;
  onSelect: (template: DeckTemplate) => void;
  disabled?: boolean;
}

const TemplateCard: React.FC<{
  template: DeckTemplate;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ template: t, selected, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`group relative rounded-xl border overflow-hidden text-left transition-all ${
      selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div
      className="aspect-[16/10] p-3 flex flex-col justify-between"
      style={{ background: t.palette.bg, color: t.palette.text }}
    >
      <div>
        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
          {t.name}
        </div>
        <div className="h-[2px] w-6 mt-1 rounded-full" style={{ background: t.palette.accent }} />
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 flex-1 rounded-full" style={{ background: t.palette.accent }} />
        <div className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
        <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
      </div>
    </div>
    <div className="px-2.5 py-1.5 bg-card border-t">
      <p className="text-[11px] text-muted-foreground truncate">{t.description || "Template"}</p>
    </div>
    {selected && (
      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
    )}
  </button>
);

export const TemplateGallery: React.FC<Props> = ({ selectedId, onSelect, disabled }) => {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_DECK_TEMPLATES;
    return ALL_DECK_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto pt-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pick a template
        </p>
        <button
          type="button"
          onClick={() => setBrowseOpen(true)}
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          <LayoutGrid className="h-3 w-3" />
          Browse all {ALL_DECK_TEMPLATES.length}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DECK_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            selected={selectedId === t.id}
            disabled={disabled}
            onClick={() => onSelect(t)}
          />
        ))}
      </div>

      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] p-0 overflow-hidden flex flex-col gap-0">
          <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">All Deck Templates</h2>
              <span className="text-xs text-muted-foreground">
                {filtered.length} of {ALL_DECK_TEMPLATES.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="h-8 pl-8 w-[260px] text-xs"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBrowseOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selectedId === t.id}
                  disabled={disabled}
                  onClick={() => {
                    onSelect(t);
                    setBrowseOpen(false);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-sm text-muted-foreground py-12">
                  No templates match "{search}".
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
