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
import { cn } from "@/lib/utils";

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

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(clean)) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
};

type DeckLookId =
  | 'orbital-intelligence'
  | 'terminal-grid'
  | 'editorial-atlas'
  | 'boardroom-ledger'
  | 'startup-collage'
  | 'organic-fieldnotes'
  | 'brutalist-poster'
  | 'broadcast-control'
  | 'data-observatory'
  | 'cinematic-storyboard'
  | 'literary-monograph'
  | 'systems-blueprint';

type DataGraphicId =
  | 'orbital-rings'
  | 'terminal-spark'
  | 'editorial-lollipop'
  | 'ledger-waterfall'
  | 'startup-sticker'
  | 'fieldnotes-scatter'
  | 'brutal-blocks'
  | 'broadcast-vu'
  | 'observatory-radar'
  | 'storyboard-frames'
  | 'monograph-slope'
  | 'blueprint-node'
  | 'heatmap-matrix'
  | 'funnel-stack'
  | 'treemap-tiles'
  | 'gantt-roadmap'
  | 'quadrant-bubbles'
  | 'radial-bars'
  | 'candlestick-tape'
  | 'sankey-ribbons';

const DATA_GRAPHICS: DataGraphicId[] = ['orbital-rings', 'terminal-spark', 'editorial-lollipop', 'ledger-waterfall', 'startup-sticker', 'fieldnotes-scatter', 'brutal-blocks', 'broadcast-vu', 'observatory-radar', 'storyboard-frames', 'monograph-slope', 'blueprint-node', 'heatmap-matrix', 'funnel-stack', 'treemap-tiles', 'gantt-roadmap', 'quadrant-bubbles', 'radial-bars', 'candlestick-tape', 'sankey-ribbons'];

const TEMPLATE_SYSTEM_OVERRIDES: Record<string, { look: DeckLookId; graphic: DataGraphicId }> = {
  'transperfect-2026': { look: 'orbital-intelligence', graphic: 'orbital-rings' },
  'modern-dark': { look: 'terminal-grid', graphic: 'terminal-spark' },
  'editorial-light': { look: 'editorial-atlas', graphic: 'editorial-lollipop' },
  'corporate-navy': { look: 'boardroom-ledger', graphic: 'ledger-waterfall' },
  'vibrant-startup': { look: 'startup-collage', graphic: 'startup-sticker' },
  'warm-terracotta': { look: 'organic-fieldnotes', graphic: 'fieldnotes-scatter' },
  'mono-brutalist': { look: 'brutalist-poster', graphic: 'brutal-blocks' },
  'pres-title-dark': { look: 'data-observatory', graphic: 'observatory-radar' },
  'pres-title-light': { look: 'literary-monograph', graphic: 'monograph-slope' },
  'pres-content-two-column': { look: 'systems-blueprint', graphic: 'blueprint-node' },
  'pres-image-left': { look: 'cinematic-storyboard', graphic: 'storyboard-frames' },
  'pres-quote-slide': { look: 'editorial-atlas', graphic: 'editorial-lollipop' },
  'pres-stats-grid': { look: 'data-observatory', graphic: 'heatmap-matrix' },
  'pres-closing-cta': { look: 'literary-monograph', graphic: 'radial-bars' },
  'webinar-title-modern': { look: 'broadcast-control', graphic: 'broadcast-vu' },
  'webinar-agenda-slide': { look: 'systems-blueprint', graphic: 'gantt-roadmap' },
  'webinar-speaker-bio': { look: 'cinematic-storyboard', graphic: 'quadrant-bubbles' },
  'webinar-qa-slide': { look: 'broadcast-control', graphic: 'sankey-ribbons' },
  'webinar-poll-slide': { look: 'startup-collage', graphic: 'funnel-stack' },
  'stream-lower-third': { look: 'broadcast-control', graphic: 'candlestick-tape' },
  'stream-starting-soon': { look: 'terminal-grid', graphic: 'terminal-spark' },
  'stream-brb': { look: 'brutalist-poster', graphic: 'treemap-tiles' },
  'stream-end-screen': { look: 'cinematic-storyboard', graphic: 'radial-bars' },
  'pres-section-divider': { look: 'brutalist-poster', graphic: 'brutal-blocks' },
  'pres-content-bullet': { look: 'systems-blueprint', graphic: 'blueprint-node' },
  'pres-stat-highlight': { look: 'orbital-intelligence', graphic: 'orbital-rings' },
  'pres-team-grid': { look: 'organic-fieldnotes', graphic: 'quadrant-bubbles' },
  'pres-comparison-2col': { look: 'boardroom-ledger', graphic: 'ledger-waterfall' },
  'pres-image-fullbleed': { look: 'cinematic-storyboard', graphic: 'storyboard-frames' },
  'pres-thank-you': { look: 'literary-monograph', graphic: 'monograph-slope' },
};

const deckSystemFor = (template: DeckTemplate) => {
  const override = TEMPLATE_SYSTEM_OVERRIDES[template.id];
  if (override) return override;
  const graphic = DATA_GRAPHICS[hashString(`${template.id}::graphic`) % DATA_GRAPHICS.length];
  const look = (['orbital-intelligence', 'terminal-grid', 'editorial-atlas', 'boardroom-ledger', 'startup-collage', 'organic-fieldnotes', 'brutalist-poster', 'broadcast-control', 'data-observatory', 'cinematic-storyboard', 'literary-monograph', 'systems-blueprint'] as DeckLookId[])[hashString(`${template.id}::look`) % 12];
  return { look, graphic };
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

const DataGraphic: React.FC<{
  system: DataGraphicId;
  series?: { label: string; value: number }[];
  accent: string;
  secondary: string;
  text: string;
  bg: string;
  muted: string;
  seed?: number;
}> = ({ system, series = [], accent, secondary, text, bg, muted, seed = 1 }) => {
  const values = series.length ? series.map((s) => s.value) : [24, 46, 31, 68, 54, 82];
  const max = Math.max(...values, 1);
  const pct = (n: number) => Math.max(8, Math.min(100, (n / max) * 100));
  const soft = hexToRgba(text, 0.16);
  const faint = hexToRgba(text, 0.08);

  switch (system) {
    case 'orbital-rings':
      return <div className="relative h-full min-h-[120px] w-full"><div className="absolute inset-[5%] rounded-full" style={{ background: `radial-gradient(circle, ${hexToRgba(accent, 0.5)} 0 9%, transparent 10%), repeating-radial-gradient(circle, transparent 0 28px, ${hexToRgba(secondary, 0.38)} 29px 31px)` }} />{[18, 38, 63, 81, 50].map((x, i) => <span key={x} className="absolute rounded-full" style={{ left: `${x}%`, top: `${[61, 24, 68, 35, 48][i]}%`, width: 10 + i * 2, height: 10 + i * 2, background: i % 2 ? secondary : accent, boxShadow: `0 0 18px ${hexToRgba(i % 2 ? secondary : accent, 0.72)}` }} />)}</div>;
    case 'terminal-spark':
      return <svg viewBox="0 0 500 220" className="h-full w-full" preserveAspectRatio="none"><path d="M0 180H500M0 120H500M0 60H500M80 0V220M180 0V220M280 0V220M380 0V220" stroke={hexToRgba(accent, 0.16)} /><path d="M12 172 L70 184 L118 102 L180 132 L238 48 L310 86 L370 28 L438 70 L492 26" fill="none" stroke={accent} strokeWidth="8" strokeLinecap="square" /><path d="M12 198 H492" stroke={secondary} strokeWidth="3" strokeDasharray="10 12" />{[70, 180, 238, 370, 492].map((x, i) => <rect key={x} x={x - 7} y={[176, 124, 40, 20, 18][i]} width="14" height="24" fill={i === 2 ? secondary : accent} />)}</svg>;
    case 'editorial-lollipop':
      return <div className="grid h-full grid-cols-5 items-end gap-5 border-b px-4 pb-3" style={{ borderColor: soft }}>{values.slice(0, 5).map((n, i) => <div key={i} className="flex h-full flex-col items-center justify-end gap-2"><span className="h-5 w-5 rounded-full border-2" style={{ background: i === 2 ? accent : bg, borderColor: i === 2 ? accent : text }} /><span className="w-px" style={{ height: `${pct(n)}%`, background: i === 2 ? accent : hexToRgba(text, 0.45) }} /><span className="font-serif text-xs">{series[i]?.label || i + 1}</span></div>)}</div>;
    case 'ledger-waterfall':
      return <div className="relative flex h-full items-end gap-3 border-b border-l p-4" style={{ borderColor: soft }}>{values.slice(0, 6).map((n, i) => <div key={i} className="relative flex-1" style={{ height: `${Math.max(18, pct(n) * 0.55)}%`, marginBottom: `${[4, 26, 14, 42, 20, 54][i] || 0}%` }}><span className="absolute inset-x-0 bottom-0 block" style={{ height: '100%', background: i % 2 ? secondary : accent }} /><span className="absolute -right-4 top-0 h-px w-7" style={{ background: hexToRgba(text, 0.36) }} /></div>)}</div>;
    case 'startup-sticker':
      return <div className="relative h-full w-full overflow-hidden">{values.slice(0, 5).map((n, i) => <div key={i} className="absolute rounded-2xl border-4 px-4 py-2 text-2xl font-black" style={{ left: `${6 + i * 17}%`, top: `${[54, 18, 40, 8, 62][i]}%`, transform: `rotate(${[-8, 7, -4, 10, 3][i]}deg)`, borderColor: text, background: i % 2 ? secondary : accent, color: bg }}>{Math.round(n)}</div>)}<svg className="absolute inset-x-6 bottom-5 h-16" viewBox="0 0 220 58" fill="none"><path d="M4 42 C48 4 82 56 116 22 S176 10 216 36" stroke={text} strokeWidth="6" strokeLinecap="round" /></svg></div>;
    case 'fieldnotes-scatter':
      return <div className="relative h-full w-full rounded-[43%_57%_51%_49%]" style={{ background: hexToRgba(secondary, 0.12), border: `1px solid ${soft}` }}>{[12, 24, 38, 52, 64, 77, 88].map((x, i) => <span key={x} className="absolute rounded-[48%_52%_58%_42%] border" style={{ left: `${x}%`, top: `${[62, 34, 72, 24, 48, 16, 58][i]}%`, width: 14 + (i % 3) * 9, height: 12 + (i % 2) * 11, background: hexToRgba(i % 2 ? secondary : accent, 0.45), borderColor: i === 3 ? text : 'transparent' }} />)}<svg className="absolute inset-6 h-[calc(100%-48px)] w-[calc(100%-48px)]" viewBox="0 0 120 72" fill="none"><path d="M0 62 C34 54 48 34 70 32 C90 30 98 18 120 8" stroke={accent} strokeWidth="3" strokeDasharray="8 8" /></svg></div>;
    case 'brutal-blocks':
      return <div className="grid h-full grid-cols-5 grid-rows-4 gap-2">{Array.from({ length: 13 }).map((_, i) => <span key={i} className={cn(i === 0 && 'col-span-2 row-span-2', i === 5 && 'col-span-2', i === 8 && 'row-span-2')} style={{ background: i % 3 === 0 ? text : i % 2 ? accent : hexToRgba(text, 0.28), border: `4px solid ${i % 3 === 0 ? accent : text}` }} />)}</div>;
    case 'broadcast-vu':
      return <div className="flex h-full items-end gap-2 rounded-xl p-3" style={{ background: faint }}>{[32, 72, 45, 88, 60, 96, 42, 70, 54, 82].map((h, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${i > 5 ? accent : secondary}, ${hexToRgba(i > 5 ? accent : secondary, 0.16)})` }} />)}</div>;
    case 'observatory-radar':
      return <svg viewBox="0 0 360 240" className="h-full w-full"><polygon points="180,18 332,120 180,222 28,120" fill="none" stroke={soft} strokeWidth="3" /><polygon points="180,62 270,120 180,178 90,120" fill="none" stroke={soft} strokeWidth="3" /><path d="M180 120 L180 18 M180 120 L332 120 M180 120 L180 222 M180 120 L28 120" stroke={soft} /><polygon points="180,38 270,116 212,184 86,152 126,84" fill={hexToRgba(accent, 0.34)} stroke={accent} strokeWidth="7" /></svg>;
    case 'storyboard-frames':
      return <div className="grid h-full grid-cols-3 gap-3">{[54, 78, 42].map((h, i) => <div key={i} className="relative border-2 p-2" style={{ borderColor: soft }}><span className="absolute left-2 top-2 text-xs font-black opacity-70">0{i + 1}</span><span className="absolute inset-x-2 bottom-2" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${i === 1 ? accent : secondary}, transparent)` }} /></div>)}</div>;
    case 'monograph-slope':
      return <svg viewBox="0 0 360 230" className="h-full w-full"><path d="M60 34 V196 M300 34 V196" stroke={soft} strokeWidth="3" />{[38, 76, 118, 158].map((y, i) => <g key={y}><path d={`M60 ${y} L300 ${[168, 58, 126, 44][i]}`} stroke={i === 1 ? accent : hexToRgba(text, 0.42)} strokeWidth={i === 1 ? 7 : 4} /><circle cx="60" cy={y} r="7" fill={bg} stroke={text} strokeWidth="3" /><circle cx="300" cy={[168, 58, 126, 44][i]} r="7" fill={i === 1 ? accent : bg} stroke={i === 1 ? accent : text} strokeWidth="3" /></g>)}</svg>;
    case 'blueprint-node':
      return <svg viewBox="0 0 360 230" className="h-full w-full"><path d="M48 58 H150 V170 H278 M150 58 L278 92 M150 170 L74 198" fill="none" stroke={accent} strokeWidth="6" strokeDasharray="12 10" />{[[48,58],[150,58],[150,170],[278,170],[278,92],[74,198]].map(([x, y], i) => <rect key={`${x}-${y}`} x={x - 18} y={y - 18} width="36" height="36" fill={i % 2 ? bg : accent} stroke={i % 2 ? secondary : accent} strokeWidth="6" />)}</svg>;
    case 'heatmap-matrix':
      return <div className="grid h-full grid-cols-6 grid-rows-5 gap-2">{Array.from({ length: 30 }).map((_, i) => <span key={i} className="rounded-sm" style={{ background: [hexToRgba(text, 0.1), hexToRgba(secondary, 0.36), hexToRgba(accent, 0.68), accent][(i * 7 + seed) % 4] }} />)}</div>;
    case 'funnel-stack':
      return <div className="flex h-full flex-col items-center justify-center gap-3">{[92, 76, 59, 42, 26].map((w, i) => <span key={w} className="h-8 rounded-sm" style={{ width: `${w}%`, background: i === 0 ? accent : i === 2 ? secondary : hexToRgba(text, 0.3), clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)' }} />)}</div>;
    case 'treemap-tiles':
      return <div className="grid h-full grid-cols-5 grid-rows-4 gap-2">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={cn(i === 0 && 'col-span-3 row-span-2', i === 1 && 'col-span-2 row-span-2', i === 2 && 'col-span-2', i === 5 && 'col-span-2')} style={{ background: i % 2 ? hexToRgba(secondary, 0.6) : hexToRgba(accent, 0.74) }} />)}</div>;
    case 'gantt-roadmap':
      return <div className="flex h-full flex-col justify-center gap-4 border-l-2 pl-5" style={{ borderColor: soft }}>{[62, 38, 78, 50, 68].map((w, i) => <div key={i} className="grid grid-cols-[44px_1fr] items-center gap-2"><span className="text-xs font-black opacity-60">Q{i + 1}</span><span className="block h-5" style={{ width: `${w}%`, marginLeft: `${[0, 16, 8, 28, 5][i]}%`, background: i === 2 ? accent : secondary }} /></div>)}</div>;
    case 'quadrant-bubbles':
      return <div className="relative h-full w-full" style={{ background: `linear-gradient(90deg, transparent calc(50% - 1px), ${soft} 50%, transparent calc(50% + 1px)), linear-gradient(0deg, transparent calc(50% - 1px), ${soft} 50%, transparent calc(50% + 1px))` }}>{[[22,60,48],[36,30,30],[58,44,66],[76,20,38],[72,68,24]].map(([x, y, s], i) => <span key={i} className="absolute rounded-full border-2" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, transform: 'translate(-50%, -50%)', background: hexToRgba(i === 2 ? accent : secondary, 0.42), borderColor: i === 2 ? accent : hexToRgba(text, 0.34) }} />)}</div>;
    case 'radial-bars':
      return <div className="relative h-full w-full">{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="absolute left-1/2 top-1/2 h-3 origin-left rounded-full" style={{ width: `${22 + i * 9}%`, background: i === 5 ? accent : hexToRgba(text, 0.38), transform: `rotate(${i * 34 - 86}deg)` }} />)}<span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: secondary }} /></div>;
    case 'candlestick-tape':
      return <div className="flex h-full items-center gap-3 border-b-2 border-t-2 py-6" style={{ borderColor: soft }}>{[18, 34, 22, 48, 28, 40, 30, 52].map((h, i) => <span key={i} className="relative flex-1"><span className="absolute left-1/2 top-1/2 w-px -translate-x-1/2 -translate-y-1/2" style={{ height: `${h + 44}px`, background: hexToRgba(text, 0.48) }} /><span className="absolute left-0 right-0 top-1/2 -translate-y-1/2" style={{ height: `${h}px`, background: i % 2 ? secondary : accent }} /></span>)}</div>;
    case 'sankey-ribbons':
    default:
      return <svg viewBox="0 0 360 230" className="h-full w-full"><path d="M20 42 C124 42 136 90 224 90 S304 62 340 62" fill="none" stroke={hexToRgba(accent, 0.62)} strokeWidth="34" strokeLinecap="round" /><path d="M20 124 C112 124 152 154 224 154 S304 190 340 190" fill="none" stroke={hexToRgba(secondary, 0.56)} strokeWidth="42" strokeLinecap="round" /><path d="M20 194 C98 194 152 90 224 90" fill="none" stroke={hexToRgba(text, 0.28)} strokeWidth="24" strokeLinecap="round" />{[20, 224, 340].map((x, i) => <rect key={x} x={x - 10} y="24" width="20" height="184" fill={i === 1 ? bg : text} stroke={i === 1 ? accent : text} strokeWidth="3" />)}</svg>;
  }
};

const slideSurfaceFor = (template: DeckTemplate, look: DeckLookId) => {
  const { bg, text, accent, secondary } = template.palette;
  const patterns: Record<DeckLookId, string> = {
    'orbital-intelligence': `radial-gradient(circle at 78% 34%, ${hexToRgba(accent, 0.42)}, transparent 22%), repeating-radial-gradient(circle at 72% 44%, transparent 0 48px, ${hexToRgba(secondary, 0.18)} 49px 51px), ${bg}`,
    'terminal-grid': `linear-gradient(90deg, ${hexToRgba(accent, 0.13)} 1px, transparent 1px) 0 0 / 34px 34px, linear-gradient(0deg, ${hexToRgba(accent, 0.1)} 1px, transparent 1px) 0 0 / 34px 34px, ${bg}`,
    'editorial-atlas': `linear-gradient(90deg, transparent 0 16%, ${hexToRgba(text, 0.18)} 16% calc(16% + 1px), transparent calc(16% + 1px)), ${bg}`,
    'boardroom-ledger': `linear-gradient(90deg, ${hexToRgba(accent, 0.16)} 0 1px, transparent 1px) 0 0 / 76px 76px, linear-gradient(0deg, ${hexToRgba(text, 0.08)} 0 1px, transparent 1px) 0 0 / 76px 38px, ${bg}`,
    'startup-collage': `radial-gradient(circle at 15% 20%, ${hexToRgba(accent, 0.34)} 0 8%, transparent 8.5%), radial-gradient(circle at 86% 18%, ${hexToRgba(secondary, 0.34)} 0 10%, transparent 10.5%), ${bg}`,
    'organic-fieldnotes': `radial-gradient(ellipse at 14% 88%, ${hexToRgba(secondary, 0.34)}, transparent 42%), radial-gradient(ellipse at 84% 14%, ${hexToRgba(accent, 0.22)}, transparent 36%), ${bg}`,
    'brutalist-poster': `linear-gradient(90deg, ${hexToRgba(text, 0.86)} 0 16px, transparent 16px), repeating-linear-gradient(45deg, transparent 0 28px, ${hexToRgba(text, 0.12)} 28px 31px), ${bg}`,
    'broadcast-control': `linear-gradient(90deg, transparent 0 10%, ${hexToRgba(accent, 0.18)} 10% 10.5%, transparent 10.5%), repeating-linear-gradient(90deg, ${hexToRgba(text, 0.06)} 0 1px, transparent 1px 22px), ${bg}`,
    'data-observatory': `radial-gradient(circle at 68% 48%, ${hexToRgba(accent, 0.25)} 0 12%, transparent 13%), repeating-radial-gradient(circle at 68% 48%, transparent 0 42px, ${hexToRgba(accent, 0.16)} 43px 45px), ${bg}`,
    'cinematic-storyboard': `linear-gradient(90deg, ${hexToRgba('#000000', 0.38)} 0 7%, transparent 7% 93%, ${hexToRgba('#000000', 0.38)} 93%), ${bg}`,
    'literary-monograph': `linear-gradient(90deg, transparent 0 22%, ${hexToRgba(accent, 0.48)} 22% calc(22% + 2px), transparent calc(22% + 2px)), ${bg}`,
    'systems-blueprint': `linear-gradient(90deg, ${hexToRgba(accent, 0.13)} 1px, transparent 1px) 0 0 / 26px 26px, linear-gradient(0deg, ${hexToRgba(accent, 0.13)} 1px, transparent 1px) 0 0 / 26px 26px, ${bg}`,
  };
  return patterns[look];
};

const cardSurfaceFor = (look: DeckLookId, template: DeckTemplate, isLight: boolean) => {
  const { bg, text, accent, secondary } = template.palette;
  if (look === 'brutalist-poster') return hexToRgba(text, isLight ? 0.08 : 0.16);
  if (look === 'editorial-atlas' || look === 'literary-monograph') return 'transparent';
  if (look === 'startup-collage') return hexToRgba(accent, 0.12);
  if (look === 'organic-fieldnotes') return hexToRgba(secondary, 0.14);
  if (look === 'terminal-grid' || look === 'systems-blueprint') return hexToRgba(bg, 0.58);
  return isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)';
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
  const { look, graphic: dataGraphic } = deckSystemFor(t);
  const cardBg = cardSurfaceFor(look, t, isLight);
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
      className={cn(
        "relative w-full aspect-[16/9] border overflow-hidden shadow-md",
        look === 'brutalist-poster' ? 'rounded-none border-2' : look === 'editorial-atlas' || look === 'literary-monograph' ? 'rounded-sm' : look === 'organic-fieldnotes' ? 'rounded-[2rem]' : look === 'terminal-grid' || look === 'systems-blueprint' ? 'rounded-md' : 'rounded-xl',
      )}
      style={{ background: slideSurfaceFor(t, look), color: t.palette.text, borderColor: look === 'brutalist-poster' ? t.palette.text : subtleBorder }}
    >
      {look === 'startup-collage' && <><div className="absolute left-8 top-10 h-24 w-32 -rotate-6 rounded-2xl" style={{ background: t.palette.accent }} /><div className="absolute right-14 top-12 h-20 w-20 rotate-12 rounded-full" style={{ background: t.palette.secondary }} /></>}
      {look === 'brutalist-poster' && <div className="absolute right-[-2rem] top-12 h-44 w-64 rotate-6 border-[14px]" style={{ borderColor: t.palette.text, background: t.palette.accent }} />}
      {(look === 'orbital-intelligence' || look === 'data-observatory') && <div className="absolute right-[-5rem] bottom-[-6rem] h-80 w-80 rounded-full" style={{ background: `radial-gradient(circle, ${hexToRgba(t.palette.accent, 0.28)}, transparent 30%), repeating-radial-gradient(circle, transparent 0 34px, ${hexToRgba(t.palette.secondary, 0.26)} 35px 37px)` }} />}
      {look === 'cinematic-storyboard' && <div className="absolute inset-x-0 top-6 h-10" style={{ background: `repeating-linear-gradient(90deg, ${hexToRgba(t.palette.text, 0.24)} 0 22px, transparent 22px 42px)` }} />}
      {(look === 'editorial-atlas' || look === 'literary-monograph') && <div className="absolute bottom-12 right-14 font-serif text-[11rem] leading-none opacity-10" style={{ color: t.palette.accent }}>{look === 'literary-monograph' ? '”' : '§'}</div>}

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
                  <Editable
                    as="div"
                    ariaLabel={`Section chapter card ${i + 1}`}
                    editing={editing}
                    value={c.title}
                    onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === i ? { ...card, title: v } : card)) }))}
                    className="text-[10px] font-bold leading-tight truncate"
                    style={{ color: t.palette.text }}
                  />
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
                <DataGraphic
                  system={DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + 2) % DATA_GRAPHICS.length]}
                  series={content.chart.series}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
                  muted={muted}
                  seed={index + 7}
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
          <div className={cn("mt-5 flex-1", look === 'brutalist-poster' ? 'grid grid-cols-[1.3fr_0.7fr_1fr_0.8fr] gap-2' : look === 'editorial-atlas' || look === 'literary-monograph' ? 'grid grid-cols-4 gap-0 border-y' : look === 'startup-collage' ? 'grid grid-cols-4 gap-4 rotate-[-1deg]' : look === 'organic-fieldnotes' ? 'grid grid-cols-4 gap-3' : 'grid grid-cols-4 gap-3')} style={(look === 'editorial-atlas' || look === 'literary-monograph') ? { borderColor: hexToRgba(t.palette.text, 0.22) } : undefined}>
            {content.metrics.slice(0, 4).map((m, i) => {
              const Ic = m.icon;
              const numeric = parseFloat(String(m.value).replace(/[^0-9.]/g, "")) || (i + 1) * 17;
              const pct = Math.min(98, Math.max(12, (numeric % 100) + 8));
              const metricGraphic = DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + i * 3) % DATA_GRAPHICS.length];
              return (
                <div
                  key={i}
                  className={cn("p-4 flex flex-col gap-3 relative overflow-hidden", look === 'brutalist-poster' ? 'rounded-none border-4 uppercase' : look === 'editorial-atlas' || look === 'literary-monograph' ? 'rounded-none border-x font-serif' : look === 'startup-collage' ? 'rounded-2xl border-4 odd:rotate-2 even:-rotate-2' : look === 'organic-fieldnotes' ? 'rounded-[1.75rem]' : 'rounded-lg')}
                  style={{ background: look === 'brutalist-poster' && i === 0 ? t.palette.accent : cardBg, border: look === 'brutalist-poster' || look === 'startup-collage' ? `${look === 'brutalist-poster' ? 4 : 3}px solid ${t.palette.text}` : `1px solid ${subtleBorder}` }}
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

                    {/* Visualization fills the empty middle — unique graph system per template + card */}
                  <div className="flex-1 min-h-[60px] flex items-center justify-center">
                    <DataGraphic
                      system={metricGraphic}
                      series={[{ label: m.label, value: numeric }, { label: 'A', value: pct * 0.7 }, { label: 'B', value: pct }]}
                      accent={t.palette.accent}
                      secondary={t.palette.secondary}
                      text={t.palette.text}
                      bg={t.palette.bg}
                      muted={muted}
                      seed={i + 2}
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
        <div className={cn("relative h-full z-10", look === 'brutalist-poster' ? 'grid grid-cols-[0.62fr_1fr] gap-5 p-8' : look === 'editorial-atlas' || look === 'literary-monograph' ? 'grid grid-cols-[0.52fr_1.25fr_0.58fr] gap-6 p-10' : look === 'startup-collage' ? 'p-8' : 'grid grid-cols-3 gap-4 p-8')}>
          {(look === 'brutalist-poster' || look === 'editorial-atlas' || look === 'literary-monograph') && (
            <div className={cn("flex flex-col justify-between", look === 'brutalist-poster' ? 'border-4 p-4 uppercase' : 'border-r pr-5 font-serif')} style={{ borderColor: look === 'brutalist-poster' ? t.palette.text : hexToRgba(t.palette.text, 0.26), background: look === 'brutalist-poster' ? t.palette.accent : 'transparent', color: look === 'brutalist-poster' ? t.palette.bg : t.palette.text }}>
              <span className="text-xs font-black uppercase tracking-widest">{content.chart.unit || 'Index'}</span>
              <span className={cn("leading-none", look === 'brutalist-poster' ? 'text-7xl font-black' : 'text-6xl')}>{content.chart.series.length}</span>
            </div>
          )}
          <div className={cn("flex flex-col", look === 'startup-collage' ? 'absolute bottom-8 right-8 h-[68%] w-[72%] rotate-2 rounded-2xl border-4 p-5' : look === 'brutalist-poster' || look === 'editorial-atlas' || look === 'literary-monograph' ? 'p-0' : 'col-span-2 rounded-lg p-4')} style={{ background: look === 'startup-collage' ? hexToRgba(t.palette.bg, 0.86) : cardBg, border: look === 'startup-collage' ? `4px solid ${t.palette.text}` : look === 'brutalist-poster' || look === 'editorial-atlas' || look === 'literary-monograph' ? 'none' : `1px solid ${subtleBorder}` }}>
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-3.5 w-3.5" style={{ color: t.palette.accent }} />
              <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: muted }}>
                {dataGraphic.replace(/-/g, ' ')}
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
              <DataGraphic
                system={dataGraphic}
                series={content.chart.series}
                accent={t.palette.accent}
                secondary={t.palette.secondary}
                text={t.palette.text}
                bg={t.palette.bg}
                muted={muted}
                seed={index + 3}
              />
            </div>
          </div>
          <div className={cn("flex flex-col gap-3 min-h-0", (look === 'brutalist-poster' || look === 'startup-collage') && 'hidden', (look === 'editorial-atlas' || look === 'literary-monograph') && 'border-l pl-5')} style={(look === 'editorial-atlas' || look === 'literary-monograph') ? { borderColor: hexToRgba(t.palette.text, 0.24) } : undefined}>
            <div className="p-4" style={{ background: cardBg, border: `1px solid ${subtleBorder}`, borderRadius: look === 'terminal-grid' || look === 'systems-blueprint' ? 2 : look === 'organic-fieldnotes' ? 22 : 10 }}>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: muted }}>
                Distribution
              </div>
              <DataGraphic
                system={DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + 5) % DATA_GRAPHICS.length]}
                series={content.chart.series.slice(0, 4)}
                accent={t.palette.accent}
                secondary={t.palette.secondary}
                text={t.palette.text}
                bg={t.palette.bg}
                muted={muted}
                seed={index + 9}
              />
            </div>
            <div className="p-4 flex-1 flex items-center gap-3" style={{ background: cardBg, border: `1px solid ${subtleBorder}`, borderRadius: look === 'terminal-grid' || look === 'systems-blueprint' ? 2 : look === 'organic-fieldnotes' ? 22 : 10 }}>
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
                <div className="h-14 w-20"><DataGraphic system={DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + 7) % DATA_GRAPHICS.length]} series={[{ label: 'A', value: 32 }, { label: 'B', value: 54 }]} accent={t.palette.secondary} secondary={t.palette.accent} text={t.palette.text} bg={t.palette.bg} muted={muted} seed={4} /></div>
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
                <DataGraphic
                  system={DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + 11) % DATA_GRAPHICS.length]}
                  series={[
                    { label: "Speed", value: 28 },
                    { label: "Cost", value: 64 },
                    { label: "Effort", value: 78 },
                  ]}
                  accent={t.palette.secondary}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
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
                <div className="h-14 w-20"><DataGraphic system={dataGraphic} series={[{ label: 'A', value: 91 }, { label: 'B', value: 38 }]} accent={t.palette.accent} secondary={t.palette.secondary} text={t.palette.text} bg={t.palette.bg} muted={muted} seed={8} /></div>
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
                <DataGraphic
                  system={DATA_GRAPHICS[(DATA_GRAPHICS.indexOf(dataGraphic) + 3) % DATA_GRAPHICS.length]}
                  series={[
                    { label: "Speed", value: 92 },
                    { label: "Cost", value: 38 },
                    { label: "Effort", value: 22 },
                  ]}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
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
              <Editable
                ariaLabel="Feature eyebrow"
                editing={editing}
                value={content.cards[0]?.title || "Feature"}
                onChange={(v) => update((cc) => ({ ...cc, cards: cc.cards.map((card, idx) => (idx === 0 ? { ...card, title: v } : card)) }))}
              />
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
          <Editable
            as="div"
            ariaLabel="Process heading"
            editing={editing}
            value={headingFor("process", "A repeatable process")}
            onChange={(v) => updateHeading("process", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
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
                      <Editable
                        ariaLabel={`Process ${i + 1} step`}
                        editing={editing}
                        value={p.step}
                        onChange={(v) => update((c) => ({ ...c, process: c.process.map((item, idx) => (idx === i ? { ...item, step: v } : item)) }))}
                        className="inline-block"
                      />
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
                      <Editable
                        ariaLabel={`Process ${i + 1} title`}
                        editing={editing}
                        value={p.title}
                        onChange={(v) => update((c) => ({ ...c, process: c.process.map((item, idx) => (idx === i ? { ...item, title: v } : item)) }))}
                      />
                    </div>
                    <Editable
                      as="div"
                      ariaLabel={`Process ${i + 1} body`}
                      editing={editing}
                      value={p.body}
                      multiline
                      onChange={(v) => update((c) => ({ ...c, process: c.process.map((item, idx) => (idx === i ? { ...item, body: v } : item)) }))}
                      className="text-[11px] mt-1 leading-snug"
                      style={{ color: muted }}
                    />
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
                            <Editable
                              ariaLabel={`Process ${i + 1} output`}
                              editing={editing}
                              value={p.output}
                              onChange={(v) => update((c) => ({ ...c, process: c.process.map((item, idx) => (idx === i ? { ...item, output: v } : item)) }))}
                            />
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
                            <Editable
                              ariaLabel={`Process ${i + 1} duration`}
                              editing={editing}
                              value={p.duration}
                              onChange={(v) => update((c) => ({ ...c, process: c.process.map((item, idx) => (idx === i ? { ...item, duration: v } : item)) }))}
                            />
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
          <Editable
            as="div"
            ariaLabel="Team heading"
            editing={editing}
            value={headingFor("team", "Built by operators")}
            onChange={(v) => updateHeading("team", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
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
                  <Editable
                    ariaLabel={`Team member ${i + 1} initials`}
                    editing={editing}
                    value={m.initials}
                    onChange={(v) => update((c) => ({ ...c, team: c.team.map((member, idx) => (idx === i ? { ...member, initials: v } : member)) }))}
                    className="inline-block"
                  />
                </div>
                <Editable
                  as="div"
                  ariaLabel={`Team member ${i + 1} name`}
                  editing={editing}
                  value={m.name}
                  onChange={(v) => update((c) => ({ ...c, team: c.team.map((member, idx) => (idx === i ? { ...member, name: v } : member)) }))}
                  className="relative text-sm font-bold leading-tight"
                  style={{ color: t.palette.text }}
                />
                <Editable
                  as="div"
                  ariaLabel={`Team member ${i + 1} role`}
                  editing={editing}
                  value={m.role}
                  onChange={(v) => update((c) => ({ ...c, team: c.team.map((member, idx) => (idx === i ? { ...member, role: v } : member)) }))}
                  className="relative text-[11px] mt-0.5 leading-snug"
                  style={{ color: muted }}
                />
                {m.location && (
                  <div
                    className="relative mt-2 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider"
                    style={{ color: t.palette.accent }}
                  >
                    <span className="inline-block h-1 w-1 rounded-full" style={{ background: t.palette.accent }} />
                    <Editable
                      ariaLabel={`Team member ${i + 1} location`}
                      editing={editing}
                      value={m.location}
                      onChange={(v) => update((c) => ({ ...c, team: c.team.map((member, idx) => (idx === i ? { ...member, location: v } : member)) }))}
                      className="inline-block"
                    />
                  </div>
                )}
                {m.focus && (
                  <div
                    className="relative mt-2 pt-2 text-[10px] italic leading-snug border-t"
                    style={{ color: muted, borderColor: subtleBorder }}
                  >
                    “<Editable
                      ariaLabel={`Team member ${i + 1} focus`}
                      editing={editing}
                      value={m.focus}
                      multiline
                      onChange={(v) => update((c) => ({ ...c, team: c.team.map((member, idx) => (idx === i ? { ...member, focus: v } : member)) }))}
                    />”
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
          <Editable
            as="div"
            ariaLabel="Pricing heading"
            editing={editing}
            value={headingFor("pricing", "Simple, scalable plans")}
            onChange={(v) => updateHeading("pricing", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
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
                  <Editable
                    ariaLabel={`Pricing ${i + 1} plan name`}
                    editing={editing}
                    value={p.name}
                    onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, name: v } : tier)) }))}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: t.palette.text }}
                  >
                    <Editable
                      ariaLabel={`Pricing ${i + 1} price`}
                      editing={editing}
                      value={p.price}
                      onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, price: v } : tier)) }))}
                      className="inline-block"
                    />
                  </span>
                  <Editable
                    ariaLabel={`Pricing ${i + 1} cadence`}
                    editing={editing}
                    value={p.cadence}
                    onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, cadence: v } : tier)) }))}
                    className="text-[10px]"
                    style={{ color: muted }}
                  />
                </div>
                {p.limit && (
                  <div className="text-[9px] mt-1 font-mono" style={{ color: muted }}>
                    <Editable
                      ariaLabel={`Pricing ${i + 1} limit`}
                      editing={editing}
                      value={p.limit}
                      onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, limit: v } : tier)) }))}
                    />
                  </div>
                )}
                <Editable
                  as="div"
                  ariaLabel={`Pricing ${i + 1} tagline`}
                  editing={editing}
                  value={p.tagline}
                  multiline
                  onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, tagline: v } : tier)) }))}
                  className="text-[11px] mt-1 italic"
                  style={{ color: muted }}
                />
                <ul className="mt-4 space-y-1.5 flex-1">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex gap-2 items-start text-[11px]">
                      <CheckIcon
                        className="h-3 w-3 mt-0.5 shrink-0"
                        style={{ color: p.highlighted ? t.palette.accent : muted }}
                      />
                      <Editable
                        ariaLabel={`Pricing ${i + 1} feature ${fi + 1}`}
                        editing={editing}
                        value={f}
                        onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => idx === i ? { ...tier, features: tier.features.map((feature, fidx) => (fidx === fi ? v : feature)) } : tier) }))}
                        style={{ color: t.palette.text }}
                      />
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
                    <Editable
                      ariaLabel={`Pricing ${i + 1} CTA`}
                      editing={editing}
                      value={p.cta}
                      onChange={(v) => update((c) => ({ ...c, pricing: c.pricing.map((tier, idx) => (idx === i ? { ...tier, cta: v } : tier)) }))}
                    />
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
          <Editable
            as="div"
            ariaLabel="Gallery heading"
            editing={editing}
            value={headingFor("gallery", "A mood, not a moodboard")}
            onChange={(v) => updateHeading("gallery", v)}
            className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight"
            style={{ color: t.palette.text }}
          />
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
