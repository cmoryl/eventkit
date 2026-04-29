import React from "react";
import { Check, BarChart3, Quote, Layers } from "lucide-react";
import type { DeckTemplate } from "./TemplateGallery";

/**
 * Per-template demo content. Keeps cards visually distinct & relevant —
 * each preview reads like a real, fully-built mini deck.
 */
export const DEMO_BY_TEMPLATE: Record<
  string,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: { title: string; body: string }[];
    stat: { value: string; label: string };
    quote: { text: string; by: string };
  }
> = {
  string,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: { title: string; body: string }[];
    stat: { value: string; label: string };
    quote: { text: string; by: string };
  }
> = {
  "transperfect-2026": {
    eyebrow: "Global Solutions · 2026",
    title: "Speak every market.",
    subtitle: "Language & AI for the world's biggest brands.",
    cards: [
      { title: "GlobalLink NEXT", body: "AI translation platform" },
      { title: "200+ languages", body: "Native expert network" },
      { title: "24/7 delivery", body: "Always-on localization" },
    ],
    stat: { value: "5B+", label: "words translated yearly" },
    quote: { text: "From content to commerce — in any language.", by: "TransPerfect" },
  },
  "modern-dark": {
    eyebrow: "Product · 2026 Roadmap",
    title: "Build what's next.",
    subtitle: "A high-contrast tech narrative for product teams.",
    cards: [
      { title: "Ship faster", body: "Velocity up 3x" },
      { title: "Stay aligned", body: "Single source of truth" },
      { title: "Scale safely", body: "Enterprise-grade" },
    ],
    stat: { value: "98%", label: "uptime delivered" },
    quote: { text: "Speed is a feature.", by: "Engineering" },
  },
  "editorial-light": {
    eyebrow: "Issue 04 · Spring",
    title: "A quieter kind of confidence.",
    subtitle: "Magazine-grade typography meets executive storytelling.",
    cards: [
      { title: "The Brief", body: "Why now matters" },
      { title: "The Field", body: "What we observed" },
      { title: "The Take", body: "Where we're going" },
    ],
    stat: { value: "12 min", label: "average read time" },
    quote: { text: "Restraint is the loudest design choice.", by: "Editor's Note" },
  },
  "corporate-navy": {
    eyebrow: "Investor Update · Q3",
    title: "Disciplined growth.",
    subtitle: "An investor-ready narrative built for boardrooms.",
    cards: [
      { title: "Revenue", body: "+42% YoY" },
      { title: "Margin", body: "Expanded 380 bps" },
      { title: "Cash", body: "$120M runway" },
    ],
    stat: { value: "$1.2B", label: "ARR exiting Q3" },
    quote: { text: "Compounding execution wins decades.", by: "CEO" },
  },
  "vibrant-startup": {
    eyebrow: "Launch Week",
    title: "Hello, world.",
    subtitle: "A bold opening for products people will actually love.",
    cards: [
      { title: "Free to try", body: "No card needed" },
      { title: "5-min setup", body: "Onboarding done" },
      { title: "Loved by 10k+", body: "Early customers" },
    ],
    stat: { value: "10k", label: "users in week one" },
    quote: { text: "Make it bold or don't ship it.", by: "Founders" },
  },
  "warm-terracotta": {
    eyebrow: "Wellness · Brand Story",
    title: "Slow is the new luxury.",
    subtitle: "Lifestyle storytelling rooted in warmth and craft.",
    cards: [
      { title: "Sourced", body: "Small batch, ethical" },
      { title: "Made", body: "By hand, locally" },
      { title: "Loved", body: "For generations" },
    ],
    stat: { value: "100%", label: "natural ingredients" },
    quote: { text: "Care is the original technology.", by: "Founder" },
  },
  "mono-brutalist": {
    eyebrow: "MANIFESTO / 01",
    title: "TYPE. SPACE. NOISE.",
    subtitle: "An unapologetic deck for unapologetic ideas.",
    cards: [
      { title: "RAW", body: "No gradients" },
      { title: "LOUD", body: "Oversized type" },
      { title: "CLEAR", body: "One idea per slide" },
    ],
    stat: { value: "1", label: "idea per slide" },
    quote: { text: "Less but louder.", by: "Studio" },
  },
};

const FALLBACK_DEMO = {
  eyebrow: "Sample Deck",
  title: "Tell your story.",
  subtitle: "A flexible template for any narrative.",
  cards: [
    { title: "Context", body: "Set the scene" },
    { title: "Insight", body: "Reveal the why" },
    { title: "Action", body: "Drive the next step" },
  ],
  stat: { value: "3x", label: "more memorable" },
  quote: { text: "Great decks earn the next meeting.", by: "Lovable" },
};

interface Props {
  template: DeckTemplate;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const TemplateDemoCard: React.FC<Props> = ({ template: t, selected, disabled, onClick }) => {
  const demo = DEMO_BY_TEMPLATE[t.id] || FALLBACK_DEMO;
  const isLight = isLightColor(t.palette.bg);
  const muted = isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)";
  const subtleBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative rounded-2xl border overflow-hidden text-left transition-all bg-card ${
        selected
          ? "border-primary ring-2 ring-primary/40 shadow-lg"
          : "border-border hover:border-primary/50 hover:shadow-md"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* HERO TITLE SLIDE */}
      <div
        className="aspect-[16/9] p-5 flex flex-col justify-between relative overflow-hidden"
        style={{ background: t.palette.bg, color: t.palette.text }}
      >
        {/* Decorative accent shape */}
        <div
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
          style={{ background: t.palette.accent }}
        />
        <div
          className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
          style={{ background: t.palette.secondary }}
        />

        <div className="relative">
          <div
            className="text-[9px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: t.palette.accent }}
          >
            {demo.eyebrow}
          </div>
          <div
            className="mt-2 text-base sm:text-lg font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          >
            {demo.title}
          </div>
          <div
            className="mt-1 text-[10px] leading-snug line-clamp-2"
            style={{ color: muted }}
          >
            {demo.subtitle}
          </div>
        </div>

        <div className="relative flex items-center gap-1.5">
          <div className="h-1 w-8 rounded-full" style={{ background: t.palette.accent }} />
          <div className="h-1 w-4 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
          <div className="h-1 w-2 rounded-full opacity-30" style={{ background: t.palette.text }} />
        </div>
      </div>

      {/* CONTENT CARDS PREVIEW (mini "card-grid" slide) */}
      <div
        className="px-3 pt-3 pb-2 border-t"
        style={{ borderColor: subtleBorder, background: t.palette.bg, color: t.palette.text }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="h-3 w-3" style={{ color: t.palette.accent }} />
          <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
            Card layout
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {demo.cards.map((c, i) => (
            <div
              key={i}
              className="rounded-md p-1.5"
              style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
            >
              <div
                className="h-0.5 w-3 rounded-full mb-1"
                style={{ background: i === 0 ? t.palette.accent : t.palette.secondary }}
              />
              <div className="text-[8px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
                {c.title}
              </div>
              <div className="text-[7px] leading-tight truncate" style={{ color: muted }}>
                {c.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STAT + QUOTE STRIP (proves multi-layout coverage) */}
      <div
        className="grid grid-cols-2 gap-px"
        style={{ background: subtleBorder }}
      >
        <div
          className="px-3 py-2 flex items-center gap-2"
          style={{ background: t.palette.bg, color: t.palette.text }}
        >
          <BarChart3 className="h-3 w-3 shrink-0" style={{ color: t.palette.accent }} />
          <div className="min-w-0">
            <div className="text-sm font-extrabold leading-none tracking-tight" style={{ color: t.palette.accent }}>
              {demo.stat.value}
            </div>
            <div className="text-[8px] truncate leading-tight mt-0.5" style={{ color: muted }}>
              {demo.stat.label}
            </div>
          </div>
        </div>
        <div
          className="px-3 py-2 flex items-start gap-1.5"
          style={{ background: t.palette.bg, color: t.palette.text }}
        >
          <Quote className="h-3 w-3 shrink-0 mt-0.5" style={{ color: t.palette.secondary }} />
          <div className="min-w-0">
            <div className="text-[9px] italic leading-snug line-clamp-2" style={{ color: t.palette.text }}>
              "{demo.quote.text}"
            </div>
            <div className="text-[8px] mt-0.5 truncate" style={{ color: muted }}>
              — {demo.quote.by}
            </div>
          </div>
        </div>
      </div>

      {/* META FOOTER */}
      <div className="px-3 py-2 bg-card border-t flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{t.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{t.description || "Template"}</p>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.accent }}
            title="Accent"
          />
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.secondary }}
            title="Secondary"
          />
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ background: t.palette.bg }}
            title="Background"
          />
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}
    </button>
  );
};

function isLightColor(input: string): boolean {
  // Handle gradients / non-hex by treating as dark (safer default for white text)
  if (!input || !input.startsWith("#")) return false;
  const hex = input.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return false;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
