import React from "react";
import { Check } from "lucide-react";

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

interface Props {
  selectedId: string | null;
  onSelect: (template: DeckTemplate) => void;
  disabled?: boolean;
}

export const TemplateGallery: React.FC<Props> = ({ selectedId, onSelect, disabled }) => {
  return (
    <div className="max-w-3xl mx-auto pt-2 space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Pick a template
        </p>
        <p className="text-[11px] text-muted-foreground/70">Optional · sets theme</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DECK_TEMPLATES.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(t)}
              className={`group relative rounded-xl border overflow-hidden text-left transition-all ${
                isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* Visual preview */}
              <div
                className="aspect-[16/10] p-3 flex flex-col justify-between"
                style={{ background: t.palette.bg, color: t.palette.text }}
              >
                <div>
                  <div
                    className="text-[10px] font-bold leading-tight truncate"
                    style={{ color: t.palette.text }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="h-[2px] w-6 mt-1 rounded-full"
                    style={{ background: t.palette.accent }}
                  />
                </div>
                <div className="flex gap-1">
                  <div className="h-1.5 flex-1 rounded-full" style={{ background: t.palette.accent }} />
                  <div className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
                  <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
                </div>
              </div>
              {/* Caption */}
              <div className="px-2.5 py-1.5 bg-card border-t">
                <p className="text-[11px] text-muted-foreground truncate">{t.description}</p>
              </div>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
