import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  X,
  BarChart3,
  Quote as QuoteIcon,
  Layers,
  Pencil,
  RotateCcw,
  ListChecks,
  CalendarRange,
  GitCompareArrows,
  LineChart as LineChartIcon,
  TrendingUp,
  Users,
  Workflow,
  LayoutGrid,
  Crown,
  Image as ImageIcon,
  Check as CheckIcon,
  Bookmark,
} from "lucide-react";
import { SaveAsTemplateDialog } from "@/components/templates/SaveAsTemplateDialog";
import type { DeckTemplate } from "./TemplateGallery";
import {
  DEMO_BY_TEMPLATE,
  FALLBACK_DEMO,
  isLightColor,
  type DemoContent,
} from "./TemplateDemoCard";
import { TEMPLATE_THUMBNAILS } from "./templateThumbnails";

interface Props {
  template: DeckTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (t: DeckTemplate) => void;
  /** Optional: open the template's starter deck directly in the Slide Editor, skipping AI generation. */
  onOpenInEditor?: (t: DeckTemplate) => void;
  disabled?: boolean;
}

const buildInitialContent = (t: DeckTemplate): DemoContent => {
  const d = DEMO_BY_TEMPLATE[t.id] || FALLBACK_DEMO;
  // Manual clone — JSON.stringify mangles Lucide icon components (forwardRef objects)
  // into empty {} which then crash React when rendered as <Ic />.
  return {
    eyebrow: d.eyebrow,
    title: d.title,
    subtitle: d.subtitle,
      slideHeadings: d.slideHeadings ? { ...d.slideHeadings } : undefined,
    imagery: d.imagery ? [...d.imagery] : undefined,
    cards: d.cards.map((c) => ({
      title: c.title,
      body: c.body,
      icon: c.icon,
      tag: c.tag,
      subPoints: c.subPoints ? [...c.subPoints] : undefined,
      footnote: c.footnote,
    })),
    stat: { ...d.stat },
    quote: { ...d.quote },
    agenda: d.agenda.map((a) => ({ ...a })),
    metrics: d.metrics.map((m) => ({ ...m })),
    timeline: d.timeline.map((tl) => ({
      ...tl,
      deliverables: tl.deliverables ? [...tl.deliverables] : undefined,
    })),
    compare: {
      heading: d.compare.heading,
      before: { title: d.compare.before.title, points: [...d.compare.before.points] },
      after: { title: d.compare.after.title, points: [...d.compare.after.points] },
    },
    chart: {
      title: d.chart.title,
      unit: d.chart.unit,
      series: d.chart.series.map((s) => ({ ...s })),
      trendline: d.chart.trendline ? [...d.chart.trendline] : undefined,
    },
    team: d.team.map((m) => ({ ...m })),
    pricing: d.pricing.map((p) => ({ ...p, features: [...p.features] })),
    process: d.process.map((p) => ({ ...p })),
    bento: d.bento.map((b) => ({ ...b })),
    kpi: {
      headline: d.kpi.headline,
      big: d.kpi.big,
      bigLabel: d.kpi.bigLabel,
      supporting: d.kpi.supporting.map((s) => ({ ...s })),
    },
  };
};

const Editable: React.FC<{
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel: string;
  as?: "span" | "div";
}> = ({ value, onChange, editing, multiline, className, style, ariaLabel, as = "span" }) => {
  const Tag = as as any;
  if (!editing) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }
  return (
    <Tag
      role="textbox"
      aria-label={ariaLabel}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = (e.currentTarget.innerText || "").replace(/\s+\n/g, "\n").trimEnd();
        if (text !== value) onChange(text);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      className={`${className || ""} outline-none rounded-sm ring-1 ring-dashed ring-current/30 focus:ring-2 focus:ring-current/60 px-0.5 -mx-0.5 cursor-text`}
      style={style}
    >
      {value}
    </Tag>
  );
};

/* ------------------------------ Charts ------------------------------ */
const BarLineChart: React.FC<{
  series: { label: string; value: number }[];
  trendline?: number[];
  accent: string;
  secondary: string;
  text: string;
  muted: string;
  unit?: string;
}> = ({ series, trendline, accent, secondary, text, muted, unit }) => {
  const w = 600;
  const h = 220;
  const pad = { l: 32, r: 12, t: 14, b: 26 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...series.map((s) => s.value), ...(trendline || [0]));
  const min = 0;
  const stepX = innerW / Math.max(series.length - 1, 1);
  const barW = (innerW / series.length) * 0.55;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => max * p);
  const linePts = (trendline || series.map((s) => s.value))
    .map((v, i) => `${pad.l + i * stepX},${pad.t + (1 - (v - min) / (max - min || 1)) * innerH}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" role="img" aria-label="Trend chart">
      {/* Grid + Y labels */}
      {yTicks.map((tv, i) => {
        const y = pad.t + (1 - i / 4) * innerH;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke={muted} strokeWidth={0.4} opacity={0.35} />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize={9} fill={muted}>
              {Math.round(tv)}
              {unit || ""}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {series.map((s, i) => {
        const x = pad.l + i * stepX - barW / 2;
        const bh = ((s.value - min) / (max - min || 1)) * innerH;
        const y = pad.t + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} fill={secondary} opacity={0.5} rx={2} />
            <text x={pad.l + i * stepX} y={h - 8} textAnchor="middle" fontSize={10} fill={muted}>
              {s.label}
            </text>
            <text
              x={pad.l + i * stepX}
              y={y - 4}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={text}
            >
              {s.value}
              {unit || ""}
            </text>
          </g>
        );
      })}
      {/* Line */}
      <polyline points={linePts} fill="none" stroke={accent} strokeWidth={2} />
      {(trendline || series.map((s) => s.value)).map((v, i) => (
        <circle
          key={i}
          cx={pad.l + i * stepX}
          cy={pad.t + (1 - (v - min) / (max - min || 1)) * innerH}
          r={2.6}
          fill={accent}
        />
      ))}
    </svg>
  );
};

/* ------------------------------ Visual fillers ------------------------------ */
// Reusable SVG visuals to make every card/section feel designed instead of empty.

const Sparkline: React.FC<{ accent: string; secondary: string; muted: string; seed?: number; area?: boolean }> = ({
  accent,
  secondary,
  muted,
  seed = 1,
  area = true,
}) => {
  const w = 200;
  const h = 56;
  const n = 14;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const noise = Math.sin(i * 1.7 + seed * 2.3) * 0.18 + Math.cos(i * 0.6 + seed) * 0.12;
    const trend = t * 0.7 + 0.18;
    const v = Math.max(0.05, Math.min(0.95, trend + noise));
    pts.push({ x: t * w, y: (1 - v) * h });
  }
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${line} L${w} ${h} L0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* baseline grid */}
      {[0.25, 0.5, 0.75].map((p) => (
        <line key={p} x1={0} x2={w} y1={h * p} y2={h * p} stroke={muted} strokeWidth={0.3} opacity={0.3} />
      ))}
      {area && <path d={areaPath} fill={`url(#spark-${seed})`} />}
      <path d={line} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.4} fill={accent} />
      <circle cx={last.x} cy={last.y} r={5} fill={accent} opacity={0.25} />
    </svg>
  );
};

const RingGauge: React.FC<{ percent: number; accent: string; track: string; size?: number; thickness?: number; label?: string; text?: string }> = ({
  percent,
  accent,
  track,
  size = 64,
  thickness = 8,
  label,
  text,
}) => {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = (c * Math.min(Math.max(percent, 0), 100)) / 100;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} opacity={0.18} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-extrabold leading-none" style={{ color: text }}>
          {Math.round(percent)}%
        </div>
        {label && <div className="text-[7px] uppercase tracking-wider mt-0.5" style={{ color: text, opacity: 0.6 }}>{label}</div>}
      </div>
    </div>
  );
};

const HBars: React.FC<{ values: { label: string; v: number }[]; accent: string; secondary: string; text: string; muted: string }> = ({
  values,
  accent,
  secondary,
  text,
  muted,
}) => {
  const max = Math.max(...values.map((v) => v.v), 1);
  return (
    <div className="w-full space-y-1.5">
      {values.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-[8px] font-mono uppercase tracking-wider w-10 truncate" style={{ color: muted }}>
            {row.label}
          </div>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: `${secondary}33` }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.v / max) * 100}%`,
                background: i === 0 ? accent : `${accent}88`,
              }}
            />
          </div>
          <div className="text-[9px] font-bold w-7 text-right" style={{ color: text }}>
            {row.v}
          </div>
        </div>
      ))}
    </div>
  );
};

const RadialBlob: React.FC<{ accent: string; secondary: string; seed?: number }> = ({ accent, secondary, seed = 1 }) => (
  <svg viewBox="0 0 200 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id={`blob-${seed}`} cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
        <stop offset="60%" stopColor={secondary} stopOpacity="0.25" />
        <stop offset="100%" stopColor={accent} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="90" r="80" fill={`url(#blob-${seed})`} />
    {/* concentric rings */}
    {[30, 50, 70].map((r) => (
      <circle key={r} cx="100" cy="90" r={r} fill="none" stroke={accent} strokeWidth={0.4} opacity={0.35} />
    ))}
    {/* orbit dots */}
    {[0, 60, 130, 220, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const rr = 70;
      return (
        <circle
          key={i}
          cx={100 + Math.cos(rad) * rr}
          cy={90 + Math.sin(rad) * rr}
          r={i === 0 ? 3 : 1.6}
          fill={accent}
          opacity={i === 0 ? 1 : 0.5}
        />
      );
    })}
  </svg>
);

const IsoStack: React.FC<{ accent: string; secondary: string; text: string }> = ({ accent, secondary, text }) => (
  <svg viewBox="0 0 220 140" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    {/* layered isometric blocks */}
    {[0, 1, 2, 3].map((i) => {
      const y = 90 - i * 14;
      const w = 90 - i * 6;
      const x = 65 + i * 3;
      const fill = i === 3 ? accent : i === 2 ? `${accent}AA` : i === 1 ? `${secondary}99` : `${secondary}66`;
      return (
        <g key={i}>
          <polygon points={`${x},${y} ${x + w},${y - 12} ${x + w + 30},${y} ${x + 30},${y + 12}`} fill={fill} stroke={text} strokeOpacity={0.15} strokeWidth={0.6} />
          <polygon points={`${x},${y} ${x + 30},${y + 12} ${x + 30},${y + 24} ${x},${y + 12}`} fill={fill} fillOpacity={0.7} stroke={text} strokeOpacity={0.15} strokeWidth={0.6} />
          <polygon points={`${x + 30},${y + 12} ${x + w + 30},${y} ${x + w + 30},${y + 12} ${x + 30},${y + 24}`} fill={fill} fillOpacity={0.5} stroke={text} strokeOpacity={0.15} strokeWidth={0.6} />
        </g>
      );
    })}
  </svg>
);

const WavePattern: React.FC<{ accent: string; secondary: string }> = ({ accent, secondary }) => (
  <svg viewBox="0 0 300 160" className="w-full h-full" preserveAspectRatio="none">
    <defs>
      <linearGradient id="wave-grad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
        <stop offset="100%" stopColor={secondary} stopOpacity="0.15" />
      </linearGradient>
    </defs>
    {[0, 14, 28, 42, 56].map((o, i) => (
      <path
        key={i}
        d={`M0 ${80 + o} C 60 ${40 + o}, 120 ${110 + o}, 180 ${60 + o} S 300 ${80 + o}, 300 ${80 + o}`}
        fill="none"
        stroke={i === 0 ? accent : "url(#wave-grad)"}
        strokeWidth={i === 0 ? 1.6 : 1}
        opacity={1 - i * 0.18}
      />
    ))}
  </svg>
);

const GridDecor: React.FC<{ accent: string; secondary: string; text: string }> = ({ accent, secondary, text }) => (
  <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="grid-dec" width="14" height="14" patternUnits="userSpaceOnUse">
        <path d="M14 0 H0 V14" fill="none" stroke={text} strokeOpacity={0.12} strokeWidth={0.5} />
      </pattern>
    </defs>
    <rect width="200" height="120" fill="url(#grid-dec)" />
    {/* highlighted cells */}
    <rect x="56" y="42" width="14" height="14" fill={accent} opacity={0.85} />
    <rect x="70" y="42" width="14" height="14" fill={accent} opacity={0.4} />
    <rect x="84" y="56" width="14" height="14" fill={secondary} opacity={0.6} />
    <rect x="56" y="56" width="14" height="14" fill={accent} opacity={0.25} />
    <rect x="98" y="42" width="14" height="14" fill={secondary} opacity={0.3} />
  </svg>
);

const Donut: React.FC<{ percent: number; accent: string; track: string; label: string; sub: string; text: string; muted: string }> = ({
  percent,
  accent,
  track,
  label,
  sub,
  text,
  muted,
}) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (c * Math.min(Math.max(percent, 0), 100)) / 100;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke={track} strokeWidth={10} opacity={0.3} />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold leading-none" style={{ color: text }}>
          {Math.round(percent)}%
        </div>
        <div className="text-[11px] font-semibold" style={{ color: text }}>
          {label}
        </div>
        <div className="text-[10px]" style={{ color: muted }}>
          {sub}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Visual variants ------------------------------ */
// One unified rotation surface for all the SVG visuals so each slide / card / tile
// pulls a different style. Drives variation across templates AND across slides.
export type VisualVariantId = "spark" | "ring" | "bars" | "wave" | "iso" | "blob" | "grid" | "donut";

const VARIANT_ROTATIONS: Record<string, VisualVariantId[]> = {
  // Per-template ordering — first variant becomes the "signature" look.
  "transperfect-2026": ["ring", "spark", "bars", "iso", "wave", "blob", "grid", "donut"],
  "modern-dark":       ["spark", "wave", "ring", "iso", "grid", "blob", "bars", "donut"],
  "editorial-light":   ["bars", "grid", "spark", "donut", "wave", "ring", "iso", "blob"],
  "corporate-navy":    ["donut", "ring", "bars", "spark", "iso", "grid", "wave", "blob"],
  "vibrant-startup":   ["wave", "blob", "spark", "ring", "iso", "bars", "donut", "grid"],
  "warm-terracotta":   ["blob", "iso", "wave", "grid", "spark", "ring", "bars", "donut"],
  "mono-brutalist":    ["grid", "bars", "iso", "spark", "ring", "donut", "wave", "blob"],
};
const DEFAULT_ROTATION: VisualVariantId[] = ["spark", "ring", "bars", "wave", "iso", "blob", "grid", "donut"];

/** Pick a visual variant deterministically from template id + per-slide channel + index. */
export function pickVariant(templateId: string, channel: string, index: number): VisualVariantId {
  const rot = VARIANT_ROTATIONS[templateId] || DEFAULT_ROTATION;
  // Mix the channel into the offset so different sections of one slide read different variants.
  let h = 0;
  for (let i = 0; i < channel.length; i++) h = (h * 31 + channel.charCodeAt(i)) >>> 0;
  return rot[(index + h) % rot.length];
}

interface VVProps {
  variant: VisualVariantId;
  accent: string;
  secondary: string;
  text: string;
  muted: string;
  /** Used as render seed and pseudo-percent input for ring/donut. */
  seed?: number;
  /** Optional explicit percent for ring/donut (0–100). Falls back to seed-derived. */
  percent?: number;
  /** Optional bar series; if absent, generated from seed. */
  bars?: { label: string; v: number }[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Universal renderer — drop into any empty space to fill it with a brand-tinted visual. */
export const VisualVariant: React.FC<VVProps> = ({
  variant,
  accent,
  secondary,
  text,
  muted,
  seed = 1,
  percent,
  bars,
  size = "md",
  className,
}) => {
  const pct = typeof percent === "number" ? percent : Math.min(96, Math.max(18, ((seed * 37) % 80) + 16));
  const ringSize = size === "sm" ? 44 : size === "lg" ? 84 : 64;
  const ringThick = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const fallbackBars = bars || [
    { label: "wk1", v: Math.round(pct * 0.45) },
    { label: "wk2", v: Math.round(pct * 0.62) },
    { label: "wk3", v: Math.round(pct * 0.81) },
    { label: "wk4", v: Math.round(pct) },
  ];

  return (
    <div className={`w-full h-full flex items-center justify-center ${className || ""}`}>
      {variant === "spark" && (
        <Sparkline accent={accent} secondary={secondary} muted={muted} seed={seed} />
      )}
      {variant === "ring" && (
        <RingGauge percent={pct} accent={accent} track={text} size={ringSize} thickness={ringThick} text={text} label="vs goal" />
      )}
      {variant === "bars" && (
        <div className="w-full px-1">
          <HBars values={fallbackBars} accent={accent} secondary={secondary} text={text} muted={muted} />
        </div>
      )}
      {variant === "wave" && (
        <WavePattern accent={accent} secondary={secondary} />
      )}
      {variant === "iso" && (
        <div className="w-[85%] h-[85%]">
          <IsoStack accent={accent} secondary={secondary} text={text} />
        </div>
      )}
      {variant === "blob" && (
        <RadialBlob accent={accent} secondary={secondary} seed={seed} />
      )}
      {variant === "grid" && (
        <GridDecor accent={accent} secondary={secondary} text={text} />
      )}
      {variant === "donut" && (
        <Donut percent={pct} accent={accent} track={text} label="Share" sub="of total" text={text} muted={muted} />
      )}
    </div>
  );
};

/* ------------------------------ Slide kinds ------------------------------ */
export type SlideKind =
  | "title"
  | "agenda"
  | "section"
  | "kpi-hero"
  | "cards"
  | "bento"
  | "feature-split"
  | "metrics"
  | "chart"
  | "process"
  | "timeline"
  | "compare"
  | "team"
  | "pricing"
  | "gallery"
  | "stat"
  | "quote";

export const PREVIEW_SLIDE_KINDS: SlideKind[] = [
  "title",
  "agenda",
  "kpi-hero",
  "section",
  "cards",
  "bento",
  "feature-split",
  "metrics",
  "chart",
  "process",
  "timeline",
  "compare",
  "team",
  "pricing",
  "gallery",
  "stat",
  "quote",
];

const SLIDES: SlideKind[] = PREVIEW_SLIDE_KINDS;

export const SlideMock: React.FC<{
  template: DeckTemplate;
  content: DemoContent;
  setContent: React.Dispatch<React.SetStateAction<DemoContent | null>>;
  editing: boolean;
  kind: SlideKind;
  index: number;
  total: number;
}> = ({ template: t, content, setContent, editing, kind, index, total }) => {
  const isLight = isLightColor(t.palette.bg);
  const muted = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const subtleBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.14)";
  const cardBg = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)";
  const thumb = TEMPLATE_THUMBNAILS[t.id];
  // Imagery rotation per slide so different layouts feature different visuals.
  const imagery = content.imagery && content.imagery.length > 0 ? content.imagery : (thumb ? [thumb] : []);
  const imageAt = (i: number): string | undefined =>
    imagery.length ? imagery[i % imagery.length] : undefined;
  const titleImg = imageAt(0) || thumb;
  const sectionImg = imageAt(1) || thumb;
  const quoteImg = imageAt(2) || thumb;
  const featureImg = imageAt(3) || thumb;

  const update = (fn: (c: DemoContent) => DemoContent) =>
    setContent((prev) => (prev ? fn(prev) : prev));
  const headingFor = (key: string, fallback: string) => content.slideHeadings?.[key] || fallback;
  const updateHeading = (key: string, value: string) =>
    update((c) => ({ ...c, slideHeadings: { ...(c.slideHeadings || {}), [key]: value } }));

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-xl border overflow-hidden shadow-md"
      style={{ background: t.palette.bg, color: t.palette.text, borderColor: subtleBorder }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: t.palette.accent }}
      />
      <div
        className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: t.palette.secondary }}
      />

      {/* Decorative dotted grid (very low opacity) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(${t.palette.text} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />

      {/* Decorative corner brackets */}
      <svg
        aria-hidden
        className="absolute top-2.5 left-2.5 h-4 w-4 pointer-events-none opacity-60"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M1 6 V1 H6" stroke={t.palette.accent} strokeWidth="1.4" />
      </svg>
      <svg
        aria-hidden
        className="absolute bottom-2.5 right-2.5 h-4 w-4 pointer-events-none opacity-60"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M15 10 V15 H10" stroke={t.palette.accent} strokeWidth="1.4" />
      </svg>

      {/* Watermark eyebrow (very subtle, top-left) */}
      <div
        className="absolute top-3 left-6 text-[9px] font-mono tracking-[0.25em] uppercase z-20 pointer-events-none"
        style={{ color: muted, opacity: 0.7 }}
      >
        {content.eyebrow}
      </div>

      {/* Slide counter (top-right) */}
      <div
        className="absolute top-3 right-4 text-[10px] font-mono tracking-wider z-20"
        style={{ color: muted }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {/* Footer brand bar */}
      <div
        className="absolute bottom-2 left-6 right-6 z-20 flex items-center justify-between text-[9px] font-mono tracking-[0.18em] uppercase pointer-events-none"
        style={{ color: muted }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: t.palette.accent }}
          />
          <span>{t.name}</span>
        </div>
        <div className="opacity-70">{kind.replace(/-/g, " ")}</div>
      </div>

      {/* TITLE */}
      {kind === "title" && (
        <div className="relative h-full grid" style={{ gridTemplateColumns: titleImg ? "1.1fr 1fr" : "1fr" }}>
          <div className="relative p-10 flex flex-col justify-between z-10">
            <div>
              <Editable
                ariaLabel="Eyebrow"
                editing={editing}
                value={content.eyebrow}
                onChange={(v) => update((c) => ({ ...c, eyebrow: v }))}
                className="text-[11px] font-semibold uppercase tracking-[0.22em] inline-block"
                style={{ color: t.palette.accent }}
              />
              <Editable
                as="div"
                ariaLabel="Title"
                editing={editing}
                value={content.title}
                onChange={(v) => update((c) => ({ ...c, title: v }))}
                multiline
                className="mt-4 text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight"
                style={{ color: t.palette.text }}
              />
              <Editable
                as="div"
                ariaLabel="Subtitle"
                editing={editing}
                value={content.subtitle}
                onChange={(v) => update((c) => ({ ...c, subtitle: v }))}
                multiline
                className="mt-4 text-base sm:text-lg leading-snug"
                style={{ color: muted }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-14 rounded-full" style={{ background: t.palette.accent }} />
              <div className="h-1.5 w-7 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
              <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
            </div>
          </div>
          {titleImg && (
            <div className="relative overflow-hidden">
              <img
                src={titleImg}
                alt={`${t.name} title visual`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, ${t.palette.bg} 0%, transparent 35%)` }}
              />
            </div>
          )}
        </div>
      )}

      {/* AGENDA */}
      {kind === "agenda" && (
        <div className="relative h-full p-10 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Agenda
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Agenda heading"
            editing={editing}
            value={headingFor("agenda", "What we'll cover")}
            onChange={(v) => updateHeading("agenda", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
          <div className="grid grid-cols-2 gap-3 mt-5 flex-1">
            {content.agenda.map((a, i) => (
              <div
                key={i}
                className="rounded-lg p-4 flex gap-3 items-start"
                style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
              >
                <div
                  className="h-9 w-9 rounded-md flex items-center justify-center text-sm font-extrabold shrink-0"
                  style={{
                    background: i === 0 ? t.palette.accent : "transparent",
                    color: i === 0 ? t.palette.bg : t.palette.accent,
                    border: `1px solid ${t.palette.accent}`,
                  }}
                >
                  <Editable
                    ariaLabel={`Agenda ${i + 1} step`}
                    editing={editing}
                    value={a.step}
                    onChange={(v) => update((c) => ({ ...c, agenda: c.agenda.map((item, idx) => (idx === i ? { ...item, step: v } : item)) }))}
                    className="inline-block"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Editable
                      as="div"
                      ariaLabel={`Agenda ${i + 1} title`}
                      editing={editing}
                      value={a.title}
                      onChange={(v) => update((c) => ({ ...c, agenda: c.agenda.map((item, idx) => (idx === i ? { ...item, title: v } : item)) }))}
                      className="text-sm font-bold leading-tight"
                    />
                    {a.duration && (
                      <Editable
                        ariaLabel={`Agenda ${i + 1} duration`}
                        editing={editing}
                        value={a.duration}
                        onChange={(v) => update((c) => ({ ...c, agenda: c.agenda.map((item, idx) => (idx === i ? { ...item, duration: v } : item)) }))}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: `${t.palette.accent}22`, color: t.palette.accent }}
                      />
                    )}
                  </div>
                  <Editable
                    as="div"
                    ariaLabel={`Agenda ${i + 1} body`}
                    editing={editing}
                    value={a.body}
                    multiline
                    onChange={(v) => update((c) => ({ ...c, agenda: c.agenda.map((item, idx) => (idx === i ? { ...item, body: v } : item)) }))}
                    className="text-[11px] mt-1 leading-snug"
                    style={{ color: muted }}
                  />
                  {a.owner && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: muted }}>
                      <span
                        className="inline-block h-1 w-1 rounded-full"
                        style={{ background: t.palette.accent }}
                      />
                      <span>Led by</span>
                      <Editable
                        ariaLabel={`Agenda ${i + 1} owner`}
                        editing={editing}
                        value={a.owner}
                        onChange={(v) => update((c) => ({ ...c, agenda: c.agenda.map((item, idx) => (idx === i ? { ...item, owner: v } : item)) }))}
                        className="truncate"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION */}
      {kind === "section" && (
        <div className="relative h-full grid grid-cols-2 z-10">
          <div className="relative p-10 flex flex-col justify-center">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: t.palette.accent }}
            >
              Section · {String(index + 1).padStart(2, "0")}
            </div>
            <Editable
              as="div"
              ariaLabel="Section title"
              editing={editing}
              value={content.cards[0]?.title || "Chapter"}
              onChange={(v) =>
                update((c) => ({
                  ...c,
                  cards: c.cards.map((card, i) => (i === 0 ? { ...card, title: v } : card)),
                }))
              }
              className="mt-3 text-5xl sm:text-6xl font-extrabold leading-[1] tracking-tight"
              style={{ color: t.palette.text }}
            />
            <Editable
              as="div"
              ariaLabel="Section description"
              editing={editing}
              value={content.cards[0]?.body || "An opening chapter that frames the story."}
              multiline
              onChange={(v) =>
                update((c) => ({
                  ...c,
                  cards: c.cards.map((card, i) => (i === 0 ? { ...card, body: v } : card)),
                }))
              }
              className="mt-4 text-sm max-w-[90%]"
              style={{ color: muted }}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: muted }}>
                In this chapter
              </div>
              <div className="h-px flex-1" style={{ background: subtleBorder }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {content.cards.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="rounded-md px-2 py-1.5"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  <div className="text-[8px] font-mono" style={{ color: t.palette.accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
                    {c.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: designed visual composition (no blurred photo) */}
          <div
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${t.palette.accent}18 0%, ${t.palette.secondary}10 60%, transparent 100%)`,
              borderLeft: `1px solid ${subtleBorder}`,
            }}
          >
            <div className="absolute inset-0">
              <RadialBlob accent={t.palette.accent} secondary={t.palette.secondary} seed={index + 5} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[72%] h-[62%]">
                <VisualVariant
                  variant={pickVariant(t.id, "section-hero", index)}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  muted={muted}
                  seed={index + 7}
                  size="lg"
                />
              </div>
            </div>
            <div
              className="absolute top-6 right-6 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm"
              style={{ background: `${t.palette.bg}AA`, color: t.palette.accent, border: `1px solid ${t.palette.accent}55` }}
            >
              Chapter {String(index + 1).padStart(2, "0")}
            </div>
            <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between text-[8px] font-mono uppercase tracking-wider" style={{ color: muted }}>
              <span>{t.palette.accent}</span>
              <span>·</span>
              <span>x: {(index + 1) * 12} / y: {(index + 1) * 8}</span>
            </div>
          </div>
        </div>
      )}

      {/* CARDS w/ icons */}
      {kind === "cards" && (
        <div className="relative h-full p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Card layout
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Cards heading"
            editing={editing}
            value={headingFor("cards", "What you get")}
            onChange={(v) => updateHeading("cards", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
          <div className="grid grid-cols-3 gap-3 mt-5 flex-1">
            {content.cards.map((c, i) => {
              const Ic = c.icon;
              const cardImg = imageAt(i);
              return (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden flex flex-col"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  {cardImg && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={cardImg}
                        alt=""
                        loading="lazy"
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {Ic && (
                        <div
                          className="absolute top-2 left-2 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur"
                          style={{ background: `${t.palette.bg}CC`, border: `1px solid ${subtleBorder}` }}
                        >
                          <Ic className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      {!cardImg && Ic && (
                        <div
                          className="h-7 w-7 rounded-md flex items-center justify-center"
                          style={{ background: `${t.palette.accent}22` }}
                        >
                          <Ic className="h-4 w-4" style={{ color: t.palette.accent }} />
                        </div>
                      )}
                      {c.tag && (
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `${t.palette.accent}1F`,
                            color: t.palette.accent,
                            border: `1px solid ${t.palette.accent}55`,
                          }}
                        >
                          {c.tag}
                        </span>
                      )}
                    </div>
                    <Editable
                      as="div"
                      ariaLabel={`Card ${i + 1} title`}
                      editing={editing}
                      value={c.title}
                      onChange={(v) =>
                        update((cc) => ({
                          ...cc,
                          cards: cc.cards.map((card, idx) => (idx === i ? { ...card, title: v } : card)),
                        }))
                      }
                      className="text-sm font-bold leading-tight"
                      style={{ color: t.palette.text }}
                    />
                    <Editable
                      as="div"
                      ariaLabel={`Card ${i + 1} body`}
                      editing={editing}
                      value={c.body}
                      multiline
                      onChange={(v) =>
                        update((cc) => ({
                          ...cc,
                          cards: cc.cards.map((card, idx) => (idx === i ? { ...card, body: v } : card)),
                        }))
                      }
                      className="text-[11px] leading-snug"
                      style={{ color: muted }}
                    />
                    {c.subPoints && c.subPoints.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {c.subPoints.map((sp, si) => (
                          <li
                            key={si}
                            className="flex items-start gap-1.5 text-[10px] leading-snug"
                            style={{ color: t.palette.text }}
                          >
                            <CheckIcon
                              className="h-2.5 w-2.5 mt-0.5 shrink-0"
                              style={{ color: t.palette.accent }}
                            />
                            <span>{sp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {c.footnote && (
                      <div
                        className="mt-auto pt-2 text-[9px] italic border-t"
                        style={{ color: muted, borderColor: subtleBorder }}
                      >
                        {c.footnote}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* METRICS GRID */}
      {kind === "metrics" && (
        <div className="relative h-full p-8 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              By the numbers
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Metrics heading"
            editing={editing}
            value={headingFor("metrics", "The signals that matter")}
            onChange={(v) => updateHeading("metrics", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
          <div className="grid grid-cols-4 gap-3 mt-5 flex-1">
            {content.metrics.slice(0, 4).map((m, i) => {
              const Ic = m.icon;
              const numeric = parseFloat(String(m.value).replace(/[^0-9.]/g, "")) || (i + 1) * 17;
              const pct = Math.min(98, Math.max(12, (numeric % 100) + 8));
              const variant = pickVariant(t.id, `metric-${i}`, index + i);
              return (
                <div
                  key={i}
                  className="rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  {/* corner accent stripe */}
                  <div
                    aria-hidden
                    className="absolute top-0 left-0 h-1 w-12 rounded-br-md"
                    style={{ background: t.palette.accent }}
                  />
                  <div className="flex items-center justify-between">
                    {Ic && (
                      <div
                        className="h-8 w-8 rounded-md flex items-center justify-center"
                        style={{ background: `${t.palette.accent}22` }}
                      >
                        <Ic className="h-4 w-4" style={{ color: t.palette.accent }} />
                      </div>
                    )}
                    {m.trend && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: `${t.palette.secondary}33`, color: t.palette.text }}
                      >
                        {m.direction === "up" && <span style={{ color: t.palette.accent }}>▲</span>}
                        {m.direction === "down" && <span style={{ color: t.palette.accent }}>▼</span>}
                        {m.direction === "flat" && <span style={{ color: muted }}>—</span>}
                        <Editable
                          ariaLabel={`Metric ${i + 1} trend`}
                          editing={editing}
                          value={m.trend}
                          onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, trend: v } : metric)) }))}
                        />
                      </span>
                    )}
                  </div>

                  {/* Visualization fills the empty middle — rotates per template + per card */}
                  <div className="flex-1 min-h-[60px] flex items-center justify-center">
                    <VisualVariant
                      variant={variant}
                      accent={t.palette.accent}
                      secondary={t.palette.secondary}
                      text={t.palette.text}
                      muted={muted}
                      seed={i + 2}
                      percent={pct}
                      size="md"
                    />
                  </div>

                  <div>
                    <div
                      className="text-3xl font-extrabold leading-none tracking-tight"
                      style={{ color: t.palette.accent }}
                    >
                      <Editable
                        ariaLabel={`Metric ${i + 1} value`}
                        editing={editing}
                        value={m.value}
                        onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, value: v } : metric)) }))}
                        className="inline-block"
                      />
                    </div>
                    <Editable
                      as="div"
                      ariaLabel={`Metric ${i + 1} label`}
                      editing={editing}
                      value={m.label}
                      onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, label: v } : metric)) }))}
                      className="text-[11px] mt-1 font-semibold"
                      style={{ color: t.palette.text }}
                    />
                    {m.sublabel && (
                      <Editable
                        as="div"
                        ariaLabel={`Metric ${i + 1} sublabel`}
                        editing={editing}
                        value={m.sublabel}
                        onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, sublabel: v } : metric)) }))}
                        className="text-[9px] mt-0.5 leading-snug"
                        style={{ color: muted }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHART */}
      {kind === "chart" && (
        <div className="relative h-full p-8 grid grid-cols-3 gap-4 z-10">
          <div className="col-span-2 rounded-lg p-4 flex flex-col" style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}>
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                Trend
              </span>
            </div>
            <Editable
              as="div"
              ariaLabel="Chart title"
              editing={editing}
              value={content.chart.title}
              onChange={(v) => update((c) => ({ ...c, chart: { ...c.chart, title: v } }))}
              className="text-sm font-bold mt-1"
              style={{ color: t.palette.text }}
            />
            <div className="flex-1 mt-2 min-h-0">
              <BarLineChart
                series={content.chart.series}
                trendline={content.chart.trendline}
                accent={t.palette.accent}
                secondary={t.palette.secondary}
                text={t.palette.text}
                muted={muted}
                unit={content.chart.unit}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="rounded-lg p-4" style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: muted }}>
                Distribution
              </div>
              <Donut
                percent={Math.min(
                  100,
                  Math.round(
                    ((content.chart.series.at(-1)?.value || 0) /
                      Math.max(content.chart.series.reduce((a, b) => a + b.value, 0), 1)) *
                      100 *
                      content.chart.series.length,
                  ),
                )}
                accent={t.palette.accent}
                track={t.palette.text}
                label="Latest share"
                sub="of total period"
                text={t.palette.text}
                muted={muted}
              />
            </div>
            <div className="rounded-lg p-4 flex-1 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}>
              <TrendingUp className="h-5 w-5" style={{ color: t.palette.accent }} />
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                  Headline
                </div>
                <div className="text-sm font-bold leading-snug">
                  {content.chart.series.at(-1)?.value}
                  {content.chart.unit || ""} · up from {content.chart.series[0]?.value}
                  {content.chart.unit || ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE */}
      {kind === "timeline" && (
        <div className="relative h-full p-8 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <CalendarRange className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Roadmap
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Timeline heading"
            editing={editing}
            value={headingFor("timeline", "A sequence that compounds")}
            onChange={(v) => updateHeading("timeline", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />

          <div className="relative mt-8 flex-1">
            {/* spine */}
            <div
              className="absolute left-0 right-0 top-5 h-0.5 rounded-full"
              style={{ background: subtleBorder }}
            />
            <div
              className="absolute left-0 top-5 h-0.5 rounded-full"
              style={{ width: "33%", background: t.palette.accent }}
            />
            <div className="grid grid-cols-4 gap-4 relative">
              {content.timeline.map((tl, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="h-3 w-3 rounded-full ring-4"
                      style={{
                        background: i === 0 ? t.palette.accent : t.palette.bg,
                        boxShadow: `inset 0 0 0 2px ${t.palette.accent}`,
                        // @ts-ignore custom var
                        "--tw-ring-color": `${t.palette.bg}`,
                      } as React.CSSProperties}
                    />
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
                      style={{ color: t.palette.accent }}
                    >
                      <Editable
                        ariaLabel={`Timeline ${i + 1} date`}
                        editing={editing}
                        value={tl.when}
                        onChange={(v) => update((c) => ({ ...c, timeline: c.timeline.map((item, idx) => (idx === i ? { ...item, when: v } : item)) }))}
                        className="inline-block"
                      />
                    </span>
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                  >
                    <Editable
                      as="div"
                      ariaLabel={`Timeline ${i + 1} title`}
                      editing={editing}
                      value={tl.title}
                      onChange={(v) => update((c) => ({ ...c, timeline: c.timeline.map((item, idx) => (idx === i ? { ...item, title: v } : item)) }))}
                      className="text-sm font-bold leading-tight"
                      style={{ color: t.palette.text }}
                    />
                    <Editable
                      as="div"
                      ariaLabel={`Timeline ${i + 1} body`}
                      editing={editing}
                      value={tl.body}
                      multiline
                      onChange={(v) => update((c) => ({ ...c, timeline: c.timeline.map((item, idx) => (idx === i ? { ...item, body: v } : item)) }))}
                      className="text-[11px] mt-1 leading-snug"
                      style={{ color: muted }}
                    />
                    {tl.deliverables && tl.deliverables.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {tl.deliverables.map((d, di) => (
                          <li
                            key={di}
                            className="flex items-start gap-1 text-[9px] leading-snug"
                            style={{ color: t.palette.text }}
                          >
                            <span
                              className="mt-1 h-1 w-1 rounded-full shrink-0"
                              style={{ background: t.palette.accent }}
                            />
                            <Editable
                              ariaLabel={`Timeline ${i + 1} deliverable ${di + 1}`}
                              editing={editing}
                              value={d}
                              onChange={(v) => update((c) => ({
                                ...c,
                                timeline: c.timeline.map((item, idx) => idx === i
                                  ? { ...item, deliverables: (item.deliverables || []).map((dd, ddi) => (ddi === di ? v : dd)) }
                                  : item),
                              }))}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    {tl.owner && (
                      <div
                        className="mt-2 pt-2 border-t text-[9px] font-semibold uppercase tracking-wider"
                        style={{ color: muted, borderColor: subtleBorder }}
                      >
                        <Editable
                          ariaLabel={`Timeline ${i + 1} owner`}
                          editing={editing}
                          value={tl.owner}
                          onChange={(v) => update((c) => ({ ...c, timeline: c.timeline.map((item, idx) => (idx === i ? { ...item, owner: v } : item)) }))}
                          className="inline-block"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPARE */}
      {kind === "compare" && (
        <div className="relative h-full p-8 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <GitCompareArrows className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Comparison
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Comparison heading"
            editing={editing}
            value={content.compare.heading}
            onChange={(v) => update((c) => ({ ...c, compare: { ...c.compare, heading: v } }))}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
          <div className="grid grid-cols-2 gap-3 mt-5 flex-1">
            <div className="rounded-lg p-5 flex flex-col relative overflow-hidden" style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}>
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                  <Editable
                    ariaLabel="Before comparison title"
                    editing={editing}
                    value={content.compare.before.title}
                    onChange={(v) => update((c) => ({ ...c, compare: { ...c.compare, before: { ...c.compare.before, title: v } } }))}
                  />
                </div>
                <RingGauge percent={32} accent={t.palette.secondary} track={t.palette.text} size={48} thickness={6} text={t.palette.text} />
              </div>
              <ul className="mt-3 space-y-2 flex-1">
                {content.compare.before.points.map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm" style={{ color: t.palette.text }}>
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: t.palette.secondary, opacity: 0.6 }}
                    />
                    <Editable
                      ariaLabel={`Before comparison point ${i + 1}`}
                      editing={editing}
                      value={p}
                      onChange={(v) => update((c) => ({ ...c, compare: { ...c.compare, before: { ...c.compare.before, points: c.compare.before.points.map((point, idx) => (idx === i ? v : point)) } } }))}
                      style={{ color: muted }}
                    />
                  </li>
                ))}
              </ul>
              {/* baseline bars */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: subtleBorder }}>
                <div className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: muted }}>
                  Baseline performance
                </div>
                <HBars
                  values={[
                    { label: "Speed", v: 28 },
                    { label: "Cost", v: 64 },
                    { label: "Effort", v: 78 },
                  ]}
                  accent={t.palette.secondary}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  muted={muted}
                />
              </div>
            </div>
            <div
              className="rounded-lg p-5 flex flex-col relative overflow-hidden"
              style={{
                background: `${t.palette.accent}14`,
                border: `1px solid ${t.palette.accent}55`,
              }}
            >
              {/* corner accent */}
              <div
                aria-hidden
                className="absolute top-0 right-0 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider rounded-bl-md"
                style={{ background: t.palette.accent, color: t.palette.bg }}
              >
                +218%
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider font-extrabold" style={{ color: t.palette.accent }}>
                  <Editable
                    ariaLabel="After comparison title"
                    editing={editing}
                    value={content.compare.after.title}
                    onChange={(v) => update((c) => ({ ...c, compare: { ...c.compare, after: { ...c.compare.after, title: v } } }))}
                  />
                </div>
                <RingGauge percent={91} accent={t.palette.accent} track={t.palette.text} size={48} thickness={6} text={t.palette.text} />
              </div>
              <ul className="mt-3 space-y-2 flex-1">
                {content.compare.after.points.map((p, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm" style={{ color: t.palette.text }}>
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: t.palette.accent }}
                    />
                    <Editable
                      ariaLabel={`After comparison point ${i + 1}`}
                      editing={editing}
                      value={p}
                      onChange={(v) => update((c) => ({ ...c, compare: { ...c.compare, after: { ...c.compare.after, points: c.compare.after.points.map((point, idx) => (idx === i ? v : point)) } } }))}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t" style={{ borderColor: `${t.palette.accent}33` }}>
                <div className="text-[9px] font-mono uppercase tracking-wider mb-1.5" style={{ color: t.palette.accent }}>
                  Lifted performance
                </div>
                <HBars
                  values={[
                    { label: "Speed", v: 92 },
                    { label: "Cost", v: 38 },
                    { label: "Effort", v: 22 },
                  ]}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  muted={muted}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAT */}
      {kind === "stat" && (
        <div className="relative h-full p-10 grid grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4" style={{ color: t.palette.accent }} />
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                Headline stat
              </span>
            </div>
            <Editable
              as="div"
              ariaLabel="Stat value"
              editing={editing}
              value={content.stat.value}
              onChange={(v) => update((c) => ({ ...c, stat: { ...c.stat, value: v } }))}
              className="text-7xl sm:text-8xl font-extrabold leading-none tracking-tight"
              style={{ color: t.palette.accent }}
            />
            <Editable
              as="div"
              ariaLabel="Stat label"
              editing={editing}
              value={content.stat.label}
              multiline
              onChange={(v) => update((c) => ({ ...c, stat: { ...c.stat, label: v } }))}
              className="mt-3 text-sm font-medium"
              style={{ color: t.palette.text }}
            />
            <div className="mt-6 grid grid-cols-3 gap-2">
              {content.metrics.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="rounded-md px-2 py-2"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  <div className="text-sm font-extrabold" style={{ color: t.palette.text }}>
                    <Editable
                      ariaLabel={`Stat supporting metric ${i + 1} value`}
                      editing={editing}
                      value={m.value}
                      onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, value: v } : metric)) }))}
                      className="inline-block"
                    />
                  </div>
                  <Editable
                    as="div"
                    ariaLabel={`Stat supporting metric ${i + 1} label`}
                    editing={editing}
                    value={m.label}
                    onChange={(v) => update((c) => ({ ...c, metrics: c.metrics.map((metric, idx) => (idx === i ? { ...metric, label: v } : metric)) }))}
                    className="text-[10px] truncate"
                    style={{ color: muted }}
                  />
                </div>
              ))}
            </div>
          </div>
          {featureImg ? (
            <div
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
              style={{ border: `1px solid ${subtleBorder}` }}
            >
              <img
                src={featureImg}
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
              {content.cards.slice(0, 3).map((c, i) => (
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
                      <Editable
                        ariaLabel={`Stat card ${i + 1} title`}
                        editing={editing}
                        value={c.title}
                        onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === i ? { ...card, title: v } : card)) }))}
                      />
                    </div>
                  </div>
                  <Editable
                    as="div"
                    ariaLabel={`Stat card ${i + 1} body`}
                    editing={editing}
                    value={c.body}
                    multiline
                    onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === i ? { ...card, body: v } : card)) }))}
                    className="text-[11px] mt-1"
                    style={{ color: muted }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUOTE */}
      {kind === "quote" && (
        <div className="relative h-full">
          {quoteImg && (
            <>
              <img
                src={quoteImg}
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
            <Editable
              as="div"
              ariaLabel="Quote text"
              editing={editing}
              value={content.quote.text}
              multiline
              onChange={(v) => update((c) => ({ ...c, quote: { ...c.quote, text: v } }))}
              className="mt-4 text-2xl sm:text-3xl font-semibold italic leading-snug max-w-[85%]"
              style={{ color: t.palette.text }}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-10" style={{ background: t.palette.accent }} />
              <Editable
                ariaLabel="Quote attribution"
                editing={editing}
                value={content.quote.by}
                onChange={(v) => update((c) => ({ ...c, quote: { ...c.quote, by: v } }))}
                className="text-xs uppercase tracking-wider inline-block"
                style={{ color: muted }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI HERO — Apple-style giant stat with supporting metrics */}
      {kind === "kpi-hero" && (
        <div className="relative h-full p-10 grid grid-cols-5 gap-6 items-center z-10">
          <div className="col-span-3">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: t.palette.accent }}
            >
              Headline result
            </div>
            <Editable
              as="div"
              ariaLabel="KPI big"
              editing={editing}
              value={content.kpi.big}
              onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, big: v } }))}
              className="mt-3 text-[7rem] sm:text-[9rem] font-extrabold leading-[0.85] tracking-[-0.04em]"
              style={{ color: t.palette.accent }}
            />
            <Editable
              as="div"
              ariaLabel="KPI label"
              editing={editing}
              value={content.kpi.bigLabel}
              onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, bigLabel: v } }))}
              className="mt-3 text-base font-medium"
              style={{ color: t.palette.text }}
            />
            <Editable
              as="div"
              ariaLabel="KPI headline"
              editing={editing}
              multiline
              value={content.kpi.headline}
              onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, headline: v } }))}
              className="mt-4 text-sm max-w-[90%] leading-relaxed"
              style={{ color: muted }}
            />
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {content.kpi.supporting.map((s, i) => {
              const numeric = parseFloat(String(s.value).replace(/[^0-9.]/g, "")) || (i + 1) * 21;
              const pct = Math.min(96, Math.max(20, (numeric % 100) + 14));
              const variant = pickVariant(t.id, `kpi-${i}`, index + i);
              return (
                <div
                  key={i}
                  className="rounded-xl p-3 flex flex-col gap-2 min-h-[7rem] relative overflow-hidden"
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  <div
                    aria-hidden
                    className="absolute top-0 right-0 h-1 w-10 rounded-bl-md"
                    style={{ background: t.palette.accent }}
                  />
                  <div
                    className="text-[10px] uppercase tracking-wider font-semibold"
                    style={{ color: muted }}
                  >
                    <Editable
                      ariaLabel={`KPI supporting ${i + 1} label`}
                      editing={editing}
                      value={s.label}
                      onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, supporting: c.kpi.supporting.map((item, idx) => (idx === i ? { ...item, label: v } : item)) } }))}
                    />
                  </div>
                  <div className="flex-1 min-h-0">
                    <VisualVariant
                      variant={variant}
                      accent={t.palette.accent}
                      secondary={t.palette.secondary}
                      text={t.palette.text}
                      muted={muted}
                      seed={i + 9}
                      percent={pct}
                      size="sm"
                    />
                  </div>
                  <div
                    className="text-xl font-extrabold tracking-tight leading-none"
                    style={{ color: t.palette.text }}
                  >
                    <Editable
                      ariaLabel={`KPI supporting ${i + 1} value`}
                      editing={editing}
                      value={s.value}
                      onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, supporting: c.kpi.supporting.map((item, idx) => (idx === i ? { ...item, value: v } : item)) } }))}
                      className="inline-block"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BENTO — asymmetric feature grid */}
      {kind === "bento" && (
        <div className="relative h-full p-8 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Bento highlights
            </span>
          </div>
          <Editable
            as="div"
            ariaLabel="Bento heading"
            editing={editing}
            value={headingFor("bento", "Why teams pick us")}
            onChange={(v) => updateHeading("bento", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
          <div className="mt-4 grid grid-cols-4 grid-rows-3 gap-2.5 flex-1">
            {content.bento.map((b, i) => {
              const Ic = b.icon;
              const span =
                b.size === "lg"
                  ? "col-span-2 row-span-2"
                  : b.size === "wide"
                  ? "col-span-2 row-span-1"
                  : b.size === "tall"
                  ? "col-span-1 row-span-2"
                  : b.size === "md"
                  ? "col-span-1 row-span-1"
                  : "col-span-1 row-span-1";
              const tileImg = b.imageIndex !== undefined ? imageAt(b.imageIndex) : undefined;
              return (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden p-3 flex flex-col justify-between ${span}`}
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  {tileImg && (
                    <>
                      <img
                        src={tileImg}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, ${t.palette.bg}55 0%, ${t.palette.bg}EE 100%)`,
                        }}
                      />
                    </>
                  )}
                  {/* Non-image tile: inject a brand-tinted visual so it doesn't feel empty */}
                  {!tileImg && (
                    <div className="absolute inset-0 pointer-events-none opacity-80">
                      <VisualVariant
                        variant={pickVariant(t.id, `bento-${i}`, index + i)}
                        accent={t.palette.accent}
                        secondary={t.palette.secondary}
                        text={t.palette.text}
                        muted={muted}
                        seed={i + 4}
                        size="md"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(180deg, transparent 30%, ${t.palette.bg}DD 100%)`,
                        }}
                      />
                    </div>
                  )}
                  <div className="relative flex items-center justify-between">
                    {Ic ? (
                      <div
                        className="h-7 w-7 rounded-md flex items-center justify-center"
                        style={{ background: `${t.palette.accent}22` }}
                      >
                        <Ic className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
                      </div>
                    ) : (
                      <span />
                    )}
                    {b.metric && (
                      <div
                        className="text-xl font-extrabold tracking-tight"
                        style={{ color: t.palette.accent }}
                      >
                        <Editable
                          ariaLabel={`Bento ${i + 1} metric`}
                          editing={editing}
                          value={b.metric}
                          onChange={(v) => update((c) => ({ ...c, bento: c.bento.map((tile, idx) => (idx === i ? { ...tile, metric: v } : tile)) }))}
                          className="inline-block"
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="text-[12px] font-bold leading-tight" style={{ color: t.palette.text }}>
                      <Editable
                        ariaLabel={`Bento ${i + 1} title`}
                        editing={editing}
                        value={b.title}
                        onChange={(v) => update((c) => ({ ...c, bento: c.bento.map((tile, idx) => (idx === i ? { ...tile, title: v } : tile)) }))}
                      />
                    </div>
                    {b.body && (
                      <Editable
                        as="div"
                        ariaLabel={`Bento ${i + 1} body`}
                        editing={editing}
                        value={b.body}
                        multiline
                        onChange={(v) => update((c) => ({ ...c, bento: c.bento.map((tile, idx) => (idx === i ? { ...tile, body: v } : tile)) }))}
                        className="text-[10px] mt-1 leading-snug"
                        style={{ color: muted }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FEATURE SPLIT — left image / right feature list */}
      {kind === "feature-split" && (
        <div className="relative h-full grid grid-cols-2 z-10">
          <div className="relative overflow-hidden">
            {featureImg ? (
              <img
                src={featureImg}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0">
                <VisualVariant
                  variant={pickVariant(t.id, "feature-split-bg", index)}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  muted={muted}
                  seed={index + 17}
                  size="lg"
                />
              </div>
            )}
            {/* Bottom gradient for legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${t.palette.bg}33 0%, ${t.palette.bg}EE 80%, ${t.palette.bg} 100%)`,
              }}
            />
            {/* Floating data card overlay (replaces blank dark gradient) */}
            <div className="relative h-full p-6 flex flex-col justify-between">
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold w-fit backdrop-blur"
                style={{ background: `${t.palette.bg}CC`, color: t.palette.text, border: `1px solid ${subtleBorder}` }}
              >
                <Sparkles className="h-3 w-3" style={{ color: t.palette.accent }} />
                Featured capability
              </div>

              <div
                className="rounded-xl p-3 backdrop-blur-md w-[78%] self-start"
                style={{ background: `${t.palette.bg}DD`, border: `1px solid ${t.palette.accent}55` }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-mono uppercase tracking-wider" style={{ color: muted }}>
                    Live performance
                  </div>
                  <div
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: t.palette.accent, color: t.palette.bg }}
                  >
                    +42%
                  </div>
                </div>
                <div className="mt-2 h-12">
                  <Sparkline accent={t.palette.accent} secondary={t.palette.secondary} muted={muted} seed={index + 11} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[
                    { l: "ARR", v: "$1.2B" },
                    { l: "NRR", v: "126%" },
                    { l: "Margin", v: "78%" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs font-extrabold leading-none" style={{ color: t.palette.text }}>
                        {s.v}
                      </div>
                      <div className="text-[8px] mt-0.5" style={{ color: muted }}>
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: t.palette.accent }}
            >
              {content.cards[0]?.title || "Feature"}
            </div>
            <Editable
              as="div"
              ariaLabel="Feature split headline"
              editing={editing}
              value={content.kpi.headline}
              multiline
              onChange={(v) => update((c) => ({ ...c, kpi: { ...c.kpi, headline: v } }))}
              className="mt-2 text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
              style={{ color: t.palette.text }}
            />
            <ul className="mt-5 space-y-3">
              {content.cards.map((c, i) => {
                const Ic = c.icon;
                return (
                  <li key={i} className="flex gap-3 items-start">
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${t.palette.accent}22` }}
                    >
                      {Ic ? (
                        <Ic className="h-4 w-4" style={{ color: t.palette.accent }} />
                      ) : (
                        <CheckIcon className="h-4 w-4" style={{ color: t.palette.accent }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold leading-tight" style={{ color: t.palette.text }}>
                        <Editable
                          ariaLabel={`Feature ${i + 1} title`}
                          editing={editing}
                          value={c.title}
                          onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === i ? { ...card, title: v } : card)) }))}
                        />
                      </div>
                      <Editable
                        as="div"
                        ariaLabel={`Feature ${i + 1} body`}
                        editing={editing}
                        value={c.body}
                        multiline
                        onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === i ? { ...card, body: v } : card)) }))}
                        className="text-[11px] mt-0.5 leading-snug"
                        style={{ color: muted }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* PROCESS — numbered horizontal flow */}
      {kind === "process" && (
        <div className="relative h-full p-10 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <Workflow className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              How it works
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">A repeatable process</h3>
          <div className="mt-8 grid gap-4 flex-1" style={{ gridTemplateColumns: `repeat(${content.process.length}, 1fr)` }}>
            {content.process.map((p, i) => {
              const Ic = p.icon;
              return (
                <div key={i} className="relative flex flex-col">
                  <div className="relative flex items-center gap-2 mb-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                      style={{
                        background: i === 0 ? t.palette.accent : "transparent",
                        color: i === 0 ? t.palette.bg : t.palette.accent,
                        border: `1.5px solid ${t.palette.accent}`,
                      }}
                    >
                      {p.step}
                    </div>
                    {i < content.process.length - 1 && (
                      <div
                        className="flex-1 h-0.5 rounded-full"
                        style={{ background: subtleBorder }}
                      />
                    )}
                  </div>
                  <div
                    className="rounded-lg p-3 flex-1 flex flex-col"
                    style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                  >
                    {Ic && <Ic className="h-4 w-4 mb-1.5" style={{ color: t.palette.accent }} />}
                    <div className="text-sm font-bold leading-tight" style={{ color: t.palette.text }}>
                      {p.title}
                    </div>
                    <div className="text-[11px] mt-1 leading-snug" style={{ color: muted }}>
                      {p.body}
                    </div>
                    <div className="mt-auto pt-2 space-y-1">
                      {p.output && (
                        <div className="flex items-center gap-1.5 text-[9px]" style={{ color: t.palette.text }}>
                          <span
                            className="font-bold uppercase tracking-wider"
                            style={{ color: t.palette.accent }}
                          >
                            Output
                          </span>
                          <span className="truncate" style={{ color: muted }}>
                            {p.output}
                          </span>
                        </div>
                      )}
                      {p.duration && (
                        <div className="flex items-center gap-1.5 text-[9px]" style={{ color: t.palette.text }}>
                          <span
                            className="font-bold uppercase tracking-wider"
                            style={{ color: t.palette.accent }}
                          >
                            Time
                          </span>
                          <span className="truncate" style={{ color: muted }}>
                            {p.duration}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TEAM — people grid with avatars */}
      {kind === "team" && (
        <div className="relative h-full p-10 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              The team
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Built by operators</h3>
          <div className="mt-6 grid grid-cols-4 gap-4 flex-1">
            {content.team.map((m, i) => (
              <div
                key={i}
                className="relative rounded-xl p-4 flex flex-col items-start overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
              >
                {/* Decorative corner accent */}
                <div
                  aria-hidden
                  className="absolute -top-6 -right-6 h-12 w-12 rounded-full opacity-30 blur-xl"
                  style={{ background: t.palette.accent }}
                />
                <div
                  className="relative h-14 w-14 rounded-full flex items-center justify-center text-base font-extrabold mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${t.palette.accent}, ${t.palette.secondary})`,
                    color: t.palette.bg,
                  }}
                >
                  {m.initials}
                </div>
                <div className="relative text-sm font-bold leading-tight" style={{ color: t.palette.text }}>
                  {m.name}
                </div>
                <div className="relative text-[11px] mt-0.5 leading-snug" style={{ color: muted }}>
                  {m.role}
                </div>
                {m.location && (
                  <div
                    className="relative mt-2 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider"
                    style={{ color: t.palette.accent }}
                  >
                    <span className="inline-block h-1 w-1 rounded-full" style={{ background: t.palette.accent }} />
                    {m.location}
                  </div>
                )}
                {m.focus && (
                  <div
                    className="relative mt-2 pt-2 text-[10px] italic leading-snug border-t"
                    style={{ color: muted, borderColor: subtleBorder }}
                  >
                    "{m.focus}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRICING — three-tier table with highlighted middle */}
      {kind === "pricing" && (
        <div className="relative h-full p-10 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Pricing
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Simple, scalable plans</h3>
          <div className="mt-6 grid grid-cols-3 gap-3 flex-1">
            {content.pricing.map((p, i) => (
              <div
                key={i}
                className="relative rounded-xl p-5 flex flex-col"
                style={{
                  background: p.highlighted ? `${t.palette.accent}14` : cardBg,
                  border: `1.5px solid ${p.highlighted ? t.palette.accent : subtleBorder}`,
                }}
              >
                {p.highlighted && (
                  <div
                    className="absolute -top-2 left-5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider"
                    style={{ background: t.palette.accent, color: t.palette.bg }}
                  >
                    Most popular
                  </div>
                )}
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                  {p.name}
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: t.palette.text }}
                  >
                    {p.price}
                  </span>
                  <span className="text-[10px]" style={{ color: muted }}>
                    {p.cadence}
                  </span>
                </div>
                {p.limit && (
                  <div className="text-[9px] mt-1 font-mono" style={{ color: muted }}>
                    {p.limit}
                  </div>
                )}
                <div className="text-[11px] mt-1 italic" style={{ color: muted }}>
                  {p.tagline}
                </div>
                <ul className="mt-4 space-y-1.5 flex-1">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex gap-2 items-start text-[11px]">
                      <CheckIcon
                        className="h-3 w-3 mt-0.5 shrink-0"
                        style={{ color: p.highlighted ? t.palette.accent : muted }}
                      />
                      <span style={{ color: t.palette.text }}>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.cta && (
                  <div
                    className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider rounded-md py-1.5"
                    style={{
                      background: p.highlighted ? t.palette.accent : "transparent",
                      color: p.highlighted ? t.palette.bg : t.palette.accent,
                      border: `1px solid ${t.palette.accent}`,
                    }}
                  >
                    {p.cta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GALLERY — 4-image mood grid */}
      {kind === "gallery" && (
        <div className="relative h-full p-8 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4" style={{ color: t.palette.accent }} />
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
              Visual language
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">A mood, not a moodboard</h3>
          <div className="mt-5 grid grid-cols-4 grid-rows-2 gap-2 flex-1">
            {[0, 1, 2, 3].map((i) => {
              const img = imageAt(i);
              const span =
                i === 0 ? "col-span-2 row-span-2" : i === 1 ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
              return (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden ${span}`}
                  style={{ background: cardBg, border: `1px solid ${subtleBorder}` }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${t.palette.accent}55, ${t.palette.secondary}55)`,
                      }}
                    />
                  )}
                  {i === 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2 text-[11px] font-semibold"
                      style={{
                        background: `linear-gradient(0deg, ${t.palette.bg}E6, transparent)`,
                        color: t.palette.text,
                      }}
                    >
                      Hero · brand visual
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const TemplatePreviewDialog: React.FC<Props> = ({ template, open, onOpenChange, onUse, onOpenInEditor, disabled }) => {
  const [editing, setEditing] = useState(false);
  const initial = useMemo(() => (template ? buildInitialContent(template) : null), [template?.id]);
  const [content, setContent] = useState<DemoContent | null>(initial);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (template) {
      setContent(buildInitialContent(template));
      setEditing(false);
    }
  }, [template?.id, open]);

  if (!template || !content) return null;
  const t = template;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogTitle className="sr-only">{t.name} template preview</DialogTitle>
        <DialogDescription className="sr-only">
          Preview the {t.name} template's slides — edit content inline, then load into the editor or generate with AI.
        </DialogDescription>
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
                {editing
                  ? "Click any text on the slides to edit it"
                  : `${SLIDES.length} slides · ${t.description || "Look & feel preview"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={editing ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => setEditing((v) => !v)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {editing ? "Done editing" : "Edit content"}
            </Button>
            {editing && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setContent(buildInitialContent(t))}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSaveOpen(true)}
              title="Save your edited content as a reusable template"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Save as template
            </Button>
            {onOpenInEditor && (
              <Button
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onOpenInEditor(t);
                  onOpenChange(false);
                }}
                className="gap-1.5"
                title="Load this template's starter slides into the editor — skip the AI outline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Open in Editor
              </Button>
            )}
            <Button
              size="sm"
              disabled={disabled}
              onClick={() => {
                onUse(t);
                onOpenChange(false);
              }}
              className="gap-1.5"
              title="Lock the look & feel and generate slides with AI"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide deck */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {SLIDES.map((kind, i) => (
              <SlideMock
                key={kind}
                template={t}
                content={content}
                setContent={setContent}
                editing={editing}
                kind={kind}
                index={i}
                total={SLIDES.length}
              />
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
                    <div className="h-8 w-8 rounded-md border shrink-0" style={{ background: s.value }} />
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

      <SaveAsTemplateDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        defaults={{
          source_kind: "preview",
          name: `${t.name} (custom)`,
          description: t.description,
          palette: t.palette,
          theme_prompt: t.themePrompt,
          content: content as unknown,
        }}
      />
    </Dialog>
  );
};
