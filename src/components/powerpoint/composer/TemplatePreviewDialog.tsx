import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, BarChart3, Quote as QuoteIcon, Layers } from "lucide-react";
import type { DeckTemplate } from "./TemplateGallery";
import { DEMO_BY_TEMPLATE, FALLBACK_DEMO, isLightColor } from "./TemplateDemoCard";
import { TEMPLATE_THUMBNAILS } from "./templateThumbnails";

interface Props {
  template: DeckTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (t: DeckTemplate) => void;
  disabled?: boolean;
}

/** A single large 16:9 slide mockup. */
const SlideMock: React.FC<{
  template: DeckTemplate;
  kind: "title" | "section" | "cards" | "stat" | "quote";
  index: number;
  total: number;
}> = ({ template: t, kind, index, total }) => {
  const demo = DEMO_BY_TEMPLATE[t.id] || FALLBACK_DEMO;
  const isLight = isLightColor(t.palette.bg);
  const muted = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const subtleBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.14)";
  const cardBg = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)";
  const thumb = TEMPLATE_THUMBNAILS[t.id];

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-xl border overflow-hidden shadow-md"
      style={{ background: t.palette.bg, color: t.palette.text, borderColor: subtleBorder }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{ background: t.palette.accent }}
      />
      <div
        className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{ background: t.palette.secondary }}
      />

      {/* Slide number */}
      <div
        className="absolute top-3 right-4 text-[10px] font-mono tracking-wider"
        style={{ color: muted }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {kind === "title" && (
        <div className="relative h-full grid" style={{ gridTemplateColumns: thumb ? "1.1fr 1fr" : "1fr" }}>
          <div className="relative p-10 flex flex-col justify-between z-10">
            <div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: t.palette.accent }}
              >
                {demo.eyebrow}
              </div>
              <h2
                className="mt-4 text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight"
                style={{ color: t.palette.text }}
              >
                {demo.title}
              </h2>
              <p
                className="mt-4 text-base sm:text-lg leading-snug"
                style={{ color: muted }}
              >
                {demo.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 rounded-full" style={{ background: t.palette.accent }} />
              <div className="h-1.5 w-7 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
              <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
            </div>
          </div>
          {thumb && (
            <div className="relative overflow-hidden">
              <img
                src={thumb}
                alt={`${t.name} title visual`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Soft inner gradient so text side blends into image */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${t.palette.bg} 0%, transparent 35%)`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {kind === "section" && (
        <div className="relative h-full">
          {thumb && (
            <>
              <img
                src={thumb}
                alt=""
                loading="lazy"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${t.palette.bg}EE 0%, ${t.palette.bg}AA 100%)`,
                }}
              />
            </>
          )}
          <div className="relative h-full p-10 flex flex-col justify-center z-10">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: t.palette.accent }}
            >
              Section · {String(index + 1).padStart(2, "0")}
            </div>
            <h2
              className="mt-3 text-5xl sm:text-6xl font-extrabold leading-[1] tracking-tight"
              style={{ color: t.palette.text }}
            >
              {demo.cards[0]?.title || "Chapter"}
            </h2>
            <p className="mt-4 text-sm max-w-[60%]" style={{ color: muted }}>
              {demo.cards[0]?.body || "An opening chapter that frames the story."}
            </p>
          </div>
        </div>
      )}

      {kind === "cards" && (
        <div className="relative h-full p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Card layout
            </span>
          </div>
          <h3
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          >
            What you get
          </h3>
          <div className="grid grid-cols-3 gap-3 mt-5 flex-1">
            {demo.cards.map((c, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden flex flex-col"
                style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
              >
                {thumb && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ filter: `hue-rotate(${i * 25}deg) saturate(${1 + i * 0.1})` }}
                    />
                  </div>
                )}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <div
                    className="h-1 w-6 rounded-full"
                    style={{ background: i === 0 ? t.palette.accent : t.palette.secondary }}
                  />
                  <div className="text-sm font-bold leading-tight" style={{ color: t.palette.text }}>
                    {c.title}
                  </div>
                  <div className="text-[11px] leading-snug" style={{ color: muted }}>
                    {c.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {kind === "stat" && (
        <div className="relative h-full p-10 grid grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4" style={{ color: t.palette.accent }} />
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                Headline stat
              </span>
            </div>
            <div
              className="text-7xl sm:text-8xl font-extrabold leading-none tracking-tight"
              style={{ color: t.palette.accent }}
            >
              {demo.stat.value}
            </div>
            <div className="mt-3 text-sm font-medium" style={{ color: t.palette.text }}>
              {demo.stat.label}
            </div>
          </div>
          {thumb ? (
            <div
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
              style={{ border: `1px solid ${subtleBorder}` }}
            >
              <img
                src={thumb}
                alt=""
                loading="lazy"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute bottom-0 left-0 right-0 px-3 py-2 text-[11px] font-medium"
                style={{
                  background: `linear-gradient(0deg, ${t.palette.bg}E6, transparent)`,
                  color: t.palette.text,
                }}
              >
                Featured visual
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {demo.cards.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ background: i === 0 ? t.palette.accent : t.palette.secondary }}
                    />
                    <div className="text-xs font-semibold" style={{ color: t.palette.text }}>
                      {c.title}
                    </div>
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: muted }}>
                    {c.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {kind === "quote" && (
        <div className="relative h-full">
          {thumb && (
            <>
              <img
                src={thumb}
                alt=""
                loading="lazy"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at center, ${t.palette.bg}99 0%, ${t.palette.bg}F2 80%)`,
                }}
              />
            </>
          )}
          <div className="relative h-full p-12 flex flex-col justify-center z-10">
            <QuoteIcon className="h-8 w-8" style={{ color: t.palette.accent }} />
            <p
              className="mt-4 text-2xl sm:text-3xl font-semibold italic leading-snug max-w-[85%]"
              style={{ color: t.palette.text }}
            >
              "{demo.quote.text}"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-10" style={{ background: t.palette.accent }} />
              <div className="text-xs uppercase tracking-wider" style={{ color: muted }}>
                {demo.quote.by}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TemplatePreviewDialog: React.FC<Props> = ({ template, open, onOpenChange, onUse, disabled }) => {
  if (!template) return null;
  const t = template;
  const slides: Array<"title" | "section" | "cards" | "stat" | "quote"> = [
    "title",
    "section",
    "cards",
    "stat",
    "quote",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-9 w-12 rounded-md border shrink-0"
              style={{ background: t.palette.bg, borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div className="flex gap-1 p-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: t.palette.accent }} />
                <span className="h-2 w-2 rounded-full" style={{ background: t.palette.secondary }} />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{t.name}</h2>
              <p className="text-xs text-muted-foreground truncate">
                {t.description || "Look & feel preview"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              disabled={disabled}
              onClick={() => {
                onUse(t);
                onOpenChange(false);
              }}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use this template
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide deck */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {slides.map((kind, i) => (
              <SlideMock key={kind} template={t} kind={kind} index={i} total={slides.length} />
            ))}

            {/* Palette strip */}
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Palette
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Background", value: t.palette.bg },
                  { label: "Text", value: t.palette.text },
                  { label: "Accent", value: t.palette.accent },
                  { label: "Secondary", value: t.palette.secondary },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 rounded-md border p-2">
                    <div
                      className="h-8 w-8 rounded-md border shrink-0"
                      style={{ background: s.value }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold truncate">{s.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        {String(s.value).startsWith("#") ? s.value : "gradient"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
