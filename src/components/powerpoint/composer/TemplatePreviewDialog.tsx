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
  Loader2,
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
import { parsePptxFile } from "@/components/slides/importPptx";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { ScaledSlide } from "@/components/slides/ScaledSlide";
import type { SlideData } from "@/components/slides/slideTypes";
import { useSlideThumbnails } from "./useSlideThumbnails";
import transperfectDeckAsset from "@/assets/transperfect-general-deck.pptx.asset.json";


// Templates that ship with a real .pptx — when present, the preview dialog renders
// the actual parsed slides instead of synthetic mocks.
const BUILTIN_CORPORATE_DECKS: Record<string, { url: string; fileName: string; label: string }> = {
  "transperfect-2026": {
    url: transperfectDeckAsset.url,
    fileName: "TransPerfect_General_Deck.pptx",
    label: "TransPerfect Corporate Deck",
  },
};

// Module-level cache so we only fetch+parse each corporate deck once per session.
const corporateDeckCache: Map<string, SlideData[]> = new Map();
const corporateDeckInflight: Map<string, Promise<SlideData[]>> = new Map();

async function loadCorporateDeckSlides(templateId: string): Promise<SlideData[] | null> {
  const corp = BUILTIN_CORPORATE_DECKS[templateId];
  if (!corp) return null;
  const cached = corporateDeckCache.get(templateId);
  if (cached) return cached;
  const inflight = corporateDeckInflight.get(templateId);
  if (inflight) return inflight;
  const p = (async () => {
    const res = await fetch(corp.url);
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    const blob = await res.blob();
    const file = new File([blob], corp.fileName, {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const slides = await parsePptxFile(file);
    corporateDeckCache.set(templateId, slides);
    return slides;
  })();
  corporateDeckInflight.set(templateId, p);
  try {
    return await p;
  } finally {
    corporateDeckInflight.delete(templateId);
  }
}

interface Props {
  template: DeckTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (t: DeckTemplate) => void;
  /** Optional: open the template's starter deck directly in the Slide Editor, skipping AI generation. */
  onOpenInEditor?: (t: DeckTemplate) => void;
  disabled?: boolean;
  /** Scroll to a specific slide kind when the dialog opens. */
  focusSlideKind?: SlideKind;
  /** Highlight the focused slide as "shared" (used by the compare view). */
  highlightShared?: boolean;
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

const deckSystemFor = (template: DeckTemplate, channel = 'deck') => {
  const override = TEMPLATE_SYSTEM_OVERRIDES[template.id];
  const baseGraphic = override
    ? DATA_GRAPHICS.indexOf(override.graphic)
    : hashString(`${template.id}::graphic`) % DATA_GRAPHICS.length;
  const channelShift = hashString(`${template.id}::${template.name}::${channel}::graphic-system`) % DATA_GRAPHICS.length;
  const graphic = DATA_GRAPHICS[(baseGraphic + channelShift) % DATA_GRAPHICS.length];
  if (override) return { look: override.look, graphic };
  const look = (['orbital-intelligence', 'terminal-grid', 'editorial-atlas', 'boardroom-ledger', 'startup-collage', 'organic-fieldnotes', 'brutalist-poster', 'broadcast-control', 'data-observatory', 'cinematic-storyboard', 'literary-monograph', 'systems-blueprint'] as DeckLookId[])[hashString(`${template.id}::look`) % 12];
  return { look, graphic };
};

const graphicFor = (template: DeckTemplate, channel: string, offset = 0): DataGraphicId => {
  const { graphic } = deckSystemFor(template, channel);
  const base = Math.max(0, DATA_GRAPHICS.indexOf(graphic));
  const jump = 1 + (hashString(`${template.id}::${template.name}::${channel}::visual-jump`) % (DATA_GRAPHICS.length - 1));
  return DATA_GRAPHICS[(base + jump + offset) % DATA_GRAPHICS.length];
};

const graphicSeedFor = (template: DeckTemplate, channel: string, index = 0) =>
  1 + (hashString(`${template.id}::${template.name}::${channel}::${index}::visual-seed`) % 9000);

const uniqueSeriesFor = (
  series: { label: string; value: number }[],
  template: DeckTemplate,
  channel: string,
) => {
  if (!series.length) return series;
  const start = hashString(`${template.id}::${template.name}::${channel}::series-rotate`) % series.length;
  return series.map((_, i) => {
    const src = series[(start + i) % series.length];
    const h = hashString(`${template.id}::${channel}::${src.label}::${i}`);
    const multiplier = 0.82 + (h % 41) / 100;
    const lift = (h >>> 5) % 13;
    return {
      label: src.label,
      value: Math.max(1, Math.round((src.value * multiplier + lift) * 10) / 10),
    };
  });
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

/**
 * Industry-grade infographic renderer. Each chart provides:
 *  - real value-driven geometry derived from `series`
 *  - axes / gridlines / tick labels where appropriate
 *  - value annotations and legend chips
 *  - layered fills (gradients) and subtle shadows for depth
 *  - typographic hierarchy (label / value / unit)
 */
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
  const data = series.length
    ? series
    : [
        { label: 'Q1', value: 24 },
        { label: 'Q2', value: 46 },
        { label: 'Q3', value: 31 },
        { label: 'Q4', value: 68 },
        { label: 'Q5', value: 54 },
        { label: 'Q6', value: 82 },
      ];
  const values = data.map((s) => s.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pct = (n: number) => Math.max(6, Math.min(100, (n / max) * 100));
  const soft = hexToRgba(text, 0.14);
  const faint = hexToRgba(text, 0.06);
  const ink = hexToRgba(text, 0.62);
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : Math.round(n).toString());
  const uid = `dg-${system}-${seed}`;

  switch (system) {
    case 'orbital-rings': {
      // Concentric KPI rings — outer ring shows progress toward max, inner shows secondary metric
      const primary = values[0] ?? 72;
      const secondaryV = values[1] ?? 41;
      const ringMax = Math.max(max, 100);
      const p1 = (primary / ringMax) * 100;
      const p2 = (secondaryV / ringMax) * 100;
      const C = 2 * Math.PI * 70;
      const c2 = 2 * Math.PI * 48;
      return (
        <svg viewBox="0 0 360 220" className="h-full w-full">
          <defs>
            <linearGradient id={`${uid}-g1`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
          </defs>
          <g transform="translate(110 110)">
            <circle r="70" fill="none" stroke={faint} strokeWidth="14" />
            <circle r="70" fill="none" stroke={`url(#${uid}-g1)`} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${(p1 / 100) * C} ${C}`} transform="rotate(-90)" />
            <circle r="48" fill="none" stroke={faint} strokeWidth="10" />
            <circle r="48" fill="none" stroke={secondary} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(p2 / 100) * c2} ${c2}`} transform="rotate(-90)" />
            <text textAnchor="middle" y="-2" fill={text} fontSize="34" fontWeight="800" fontFamily="Inter, system-ui">{Math.round(p1)}%</text>
            <text textAnchor="middle" y="20" fill={ink} fontSize="11" fontWeight="600" letterSpacing="2">{data[0]?.label?.toUpperCase() || 'PRIMARY'}</text>
          </g>
          <g transform="translate(230 40)" fontFamily="Inter, system-ui">
            {data.slice(0, 4).map((d, i) => (
              <g key={i} transform={`translate(0 ${i * 36})`}>
                <rect width="10" height="10" rx="2" fill={i === 0 ? accent : i === 1 ? secondary : hexToRgba(text, 0.3)} />
                <text x="18" y="9" fill={text} fontSize="11" fontWeight="700">{d.label}</text>
                <text x="18" y="24" fill={ink} fontSize="13" fontWeight="800">{fmt(d.value)}</text>
              </g>
            ))}
          </g>
        </svg>
      );
    }

    case 'terminal-spark': {
      // Line chart with grid, axis labels, area fill, point markers, baseline
      const W = 500, H = 220, padL = 38, padR = 16, padT = 18, padB = 32;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const points = data.map((d, i) => ({
        x: padL + (i / Math.max(data.length - 1, 1)) * innerW,
        y: padT + innerH - (d.value / max) * innerH,
        d,
      }));
      const path = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      const area = `${path} L${points[points.length - 1].x} ${padT + innerH} L${points[0].x} ${padT + innerH} Z`;
      const yTicks = 4;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="JetBrains Mono, ui-monospace, monospace">
          <defs>
            <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const y = padT + (i / yTicks) * innerH;
            const val = Math.round(max - (i / yTicks) * max);
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={soft} strokeWidth="1" />
                <text x={padL - 6} y={y + 3} textAnchor="end" fill={ink} fontSize="10">{fmt(val)}</text>
              </g>
            );
          })}
          <path d={area} fill={`url(#${uid}-area)`} />
          <path d={path} fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4.5" fill={bg} stroke={accent} strokeWidth="2.5" />
              <text x={p.x} y={H - padB + 14} textAnchor="middle" fill={ink} fontSize="10">{p.d.label}</text>
            </g>
          ))}
          {/* highlight max */}
          {(() => {
            const peak = points.reduce((a, b) => (b.d.value > a.d.value ? b : a));
            return (
              <g>
                <line x1={peak.x} x2={peak.x} y1={padT} y2={peak.y} stroke={secondary} strokeDasharray="3 3" />
                <rect x={peak.x - 22} y={peak.y - 24} width="44" height="16" rx="3" fill={secondary} />
                <text x={peak.x} y={peak.y - 12} textAnchor="middle" fill={bg} fontSize="10" fontWeight="700">{fmt(peak.d.value)}</text>
              </g>
            );
          })()}
        </svg>
      );
    }

    case 'editorial-lollipop': {
      // Lollipop chart with axis, labels, value tags
      const W = 480, H = 230, padL = 50, padR = 20, padT = 14, padB = 36;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const slice = data.slice(0, 6);
      const step = innerW / slice.length;
      const baseline = padT + innerH;
      const peakIdx = values.indexOf(Math.max(...values));
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Georgia, 'Source Serif Pro', serif">
          {[0, 0.5, 1].map((f, i) => {
            const y = padT + (1 - f) * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={soft} />
                <text x={padL - 8} y={y + 3} textAnchor="end" fill={ink} fontSize="10" fontStyle="italic">{fmt(max * f)}</text>
              </g>
            );
          })}
          <line x1={padL} x2={W - padR} y1={baseline} y2={baseline} stroke={text} strokeWidth="1.5" />
          {slice.map((d, i) => {
            const x = padL + step / 2 + i * step;
            const y = padT + innerH - (d.value / max) * innerH;
            const isPeak = i === peakIdx;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={baseline} y2={y + 8} stroke={isPeak ? accent : hexToRgba(text, 0.42)} strokeWidth={isPeak ? 2 : 1.2} />
                <circle cx={x} cy={y} r="9" fill={isPeak ? accent : bg} stroke={isPeak ? accent : text} strokeWidth="2" />
                <text x={x} y={y - 14} textAnchor="middle" fill={text} fontSize="11" fontWeight="700">{fmt(d.value)}</text>
                <text x={x} y={baseline + 18} textAnchor="middle" fill={ink} fontSize="11">{d.label}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    case 'ledger-waterfall': {
      // Waterfall with running total, +/- color coding, connector lines
      const W = 500, H = 240, padL = 44, padR = 16, padT = 20, padB = 36;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const slice = data.slice(0, 6);
      // Treat values as deltas; running total
      let running = 0;
      const bars = slice.map((d, i) => {
        const start = running;
        running += d.value - max / 3; // make some negative
        const end = running;
        const top = Math.min(start, end);
        const bot = Math.max(start, end);
        return { top, bot, delta: end - start, label: d.label, idx: i };
      });
      const totalMax = Math.max(...bars.map((b) => b.bot), 1);
      const totalMin = Math.min(...bars.map((b) => b.top), 0);
      const range = totalMax - totalMin || 1;
      const yFor = (v: number) => padT + innerH - ((v - totalMin) / range) * innerH;
      const step = innerW / bars.length;
      const barW = step * 0.62;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const y = padT + f * innerH;
            return <line key={i} x1={padL} x2={W - padR} y1={y} y2={y} stroke={soft} />;
          })}
          <line x1={padL} x2={W - padR} y1={yFor(0)} y2={yFor(0)} stroke={text} strokeWidth="1.5" />
          {bars.map((b, i) => {
            const x = padL + i * step + (step - barW) / 2;
            const y = yFor(b.bot);
            const h = Math.abs(yFor(b.top) - yFor(b.bot));
            const pos = b.delta >= 0;
            const fill = pos ? accent : secondary;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={Math.max(h, 2)} fill={fill} rx="2" />
                {i < bars.length - 1 && (
                  <line x1={x + barW} x2={x + step + (step - barW) / 2} y1={yFor(b.bot - (pos ? h : 0) + (pos ? 0 : 0))} y2={yFor(b.bot - (pos ? h : 0))} stroke={ink} strokeDasharray="2 3" />
                )}
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fill={text} fontSize="10" fontWeight="700">{pos ? '+' : ''}{fmt(b.delta)}</text>
                <text x={x + barW / 2} y={H - padB + 16} textAnchor="middle" fill={ink} fontSize="10">{b.label}</text>
              </g>
            );
          })}
          <text x={padL} y={padT - 6} fill={ink} fontSize="10" fontWeight="700" letterSpacing="1.5">CUMULATIVE Δ</text>
        </svg>
      );
    }

    case 'startup-sticker': {
      // Punchy KPI sticker collage with one bold trend line
      const W = 500, H = 240;
      const slice = data.slice(0, 4);
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          <path d="M20 200 C100 120 180 230 260 150 S380 60 480 110" fill="none" stroke={text} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.18" />
          <path d="M20 200 C100 120 180 230 260 150 S380 60 480 110" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="0 12 80 0" strokeLinecap="round" />
          {slice.map((d, i) => {
            const x = 40 + i * 110;
            const y = [150, 60, 130, 30][i];
            const rot = [-6, 5, -3, 7][i];
            const fill = i % 2 ? secondary : accent;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
                <rect x="-46" y="-26" width="92" height="52" rx="12" fill={fill} stroke={text} strokeWidth="3" />
                <text textAnchor="middle" y="-4" fill={bg} fontSize="22" fontWeight="900">{fmt(d.value)}</text>
                <text textAnchor="middle" y="16" fill={bg} fontSize="9" fontWeight="700" letterSpacing="1.5" opacity="0.85">{(d.label || `M${i + 1}`).toUpperCase()}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    case 'fieldnotes-scatter': {
      // Scatter with trend line, axis labels, organic frame
      const W = 460, H = 240, padL = 36, padR = 20, padT = 20, padB = 30;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const pts = data.slice(0, 8).map((d, i) => ({
        x: padL + ((i + 1) / 9) * innerW,
        y: padT + innerH - (d.value / max) * innerH,
        r: 6 + (d.value / max) * 10,
        d,
      }));
      // simple regression line
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const mx = xs.reduce((a, b) => a + b) / xs.length;
      const my = ys.reduce((a, b) => a + b) / ys.length;
      const slope = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / (xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1);
      const intercept = my - slope * mx;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Georgia, serif">
          <line x1={padL} x2={W - padR} y1={padT + innerH} y2={padT + innerH} stroke={text} strokeWidth="1" />
          <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke={text} strokeWidth="1" />
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={padL} x2={W - padR} y1={padT + f * innerH} y2={padT + f * innerH} stroke={soft} strokeDasharray="2 4" />
          ))}
          <line x1={padL} x2={W - padR} y1={slope * padL + intercept} y2={slope * (W - padR) + intercept} stroke={accent} strokeWidth="2" strokeDasharray="6 4" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.r} fill={hexToRgba(i % 2 ? secondary : accent, 0.42)} stroke={i % 2 ? secondary : accent} strokeWidth="1.5" />
              <text x={p.x} y={p.y - p.r - 4} textAnchor="middle" fill={ink} fontSize="9" fontStyle="italic">{p.d.label}</text>
            </g>
          ))}
          <text x={padL - 4} y={padT - 6} fill={ink} fontSize="10" fontStyle="italic">value</text>
          <text x={W - padR} y={padT + innerH + 18} textAnchor="end" fill={ink} fontSize="10" fontStyle="italic">period →</text>
        </svg>
      );
    }

    case 'brutal-blocks': {
      // Bold mosaic with embedded labels & values
      const slice = data.slice(0, 6);
      return (
        <div className="grid h-full w-full grid-cols-4 grid-rows-3 gap-2" style={{ fontFamily: 'Inter, system-ui' }}>
          {slice.map((d, i) => {
            const fills = [accent, text, secondary, hexToRgba(text, 0.85), accent, secondary];
            const fg = [bg, bg, bg, bg, bg, bg][i];
            const spans = [
              'col-span-2 row-span-2',
              'col-span-2',
              '',
              '',
              'col-span-2',
              '',
            ];
            return (
              <div key={i} className={cn('relative flex flex-col justify-between p-3', spans[i])}
                style={{ background: fills[i], border: `3px solid ${text}`, color: fg }}>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">{d.label}</div>
                <div className="text-3xl font-black leading-none">{fmt(d.value)}</div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'broadcast-vu': {
      // VU meter with peak indicators, axis ticks
      const W = 500, H = 220, padL = 40, padR = 16, padT = 16, padB = 30;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const slice = data.length >= 8 ? data : [...data, ...data, ...data].slice(0, 10);
      const step = innerW / slice.length;
      const barW = step * 0.7;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="JetBrains Mono, monospace">
          <defs>
            <linearGradient id={`${uid}-vu`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} />
              <stop offset="60%" stopColor={accent} stopOpacity="0.6" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
            const y = padT + (1 - f) * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={soft} />
                <text x={padL - 6} y={y + 3} textAnchor="end" fill={ink} fontSize="9">{Math.round(f * 100)}</text>
              </g>
            );
          })}
          {slice.map((d, i) => {
            const x = padL + i * step + (step - barW) / 2;
            const h = (d.value / max) * innerH;
            const y = padT + innerH - h;
            const isHot = d.value > max * 0.8;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={h} fill={isHot ? `url(#${uid}-vu)` : secondary} rx="1" />
                <rect x={x} y={y - 3} width={barW} height="2" fill={isHot ? accent : text} />
                <text x={x + barW / 2} y={H - padB + 14} textAnchor="middle" fill={ink} fontSize="9">{d.label?.slice(0, 3) || i + 1}</text>
              </g>
            );
          })}
          <text x={padL} y={padT - 4} fill={ink} fontSize="9" letterSpacing="2">CH · LEVELS</text>
          <circle cx={W - padR - 6} cy={padT} r="3" fill={accent}><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" /></circle>
        </svg>
      );
    }

    case 'observatory-radar': {
      // Radar / spider with multiple axes labeled
      const W = 360, H = 240, cx = 180, cy = 120, R = 96;
      const slice = data.slice(0, 6);
      const n = slice.length;
      const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
      const pt = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
      const poly = slice.map((d, i) => pt(i, (d.value / max) * R).join(',')).join(' ');
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {[0.33, 0.66, 1].map((f, i) => (
            <polygon key={i} points={slice.map((_, j) => pt(j, R * f).join(',')).join(' ')} fill="none" stroke={soft} strokeWidth="1" />
          ))}
          {slice.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, R)[0]} y2={pt(i, R)[1]} stroke={soft} />)}
          <polygon points={poly} fill={hexToRgba(accent, 0.32)} stroke={accent} strokeWidth="2.5" />
          {slice.map((d, i) => {
            const [x, y] = pt(i, (d.value / max) * R);
            const [lx, ly] = pt(i, R + 14);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill={bg} stroke={accent} strokeWidth="2" />
                <text x={lx} y={ly + 4} textAnchor="middle" fill={text} fontSize="10" fontWeight="700">{d.label}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    case 'storyboard-frames': {
      // Three keyframes with mini-charts inside
      const slice = data.slice(0, 3);
      const labels = ['ACT I', 'ACT II', 'ACT III'];
      return (
        <div className="grid h-full w-full grid-cols-3 gap-3" style={{ fontFamily: 'Inter, system-ui' }}>
          {slice.map((d, i) => (
            <div key={i} className="relative flex flex-col justify-between border-2 p-3" style={{ borderColor: text }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.2em]" style={{ color: ink }}>{labels[i]}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: i === 1 ? accent : muted }} />
              </div>
              <svg viewBox="0 0 100 50" className="w-full" preserveAspectRatio="none">
                <path d={`M0 ${50 - (d.value / max) * 40} Q 30 ${20 - i * 6} 60 ${30 + i * 4} T 100 ${50 - (d.value / max) * 30}`}
                  fill="none" stroke={i === 1 ? accent : secondary} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div>
                <div className="text-2xl font-black leading-none" style={{ color: text }}>{fmt(d.value)}</div>
                <div className="text-[10px] font-semibold" style={{ color: ink }}>{d.label}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'monograph-slope': {
      // Slope chart: two periods, lines connecting, labeled endpoints
      const W = 420, H = 240, padL = 80, padR = 80, padT = 24, padB = 36;
      const innerH = H - padT - padB;
      const slice = data.slice(0, 5);
      const startVals = slice.map((d) => d.value);
      const endVals = slice.map((d, i) => Math.min(max, Math.max(2, d.value + ((i - 2) * max) / 4)));
      const localMax = Math.max(...startVals, ...endVals);
      const yL = (v: number) => padT + innerH - (v / localMax) * innerH;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Georgia, serif">
          <line x1={padL} x2={padL} y1={padT} y2={padT + innerH} stroke={text} strokeWidth="1.5" />
          <line x1={W - padR} x2={W - padR} y1={padT} y2={padT + innerH} stroke={text} strokeWidth="1.5" />
          <text x={padL} y={padT - 8} textAnchor="middle" fill={ink} fontSize="10" fontStyle="italic">BEFORE</text>
          <text x={W - padR} y={padT - 8} textAnchor="middle" fill={ink} fontSize="10" fontStyle="italic">AFTER</text>
          {slice.map((d, i) => {
            const y1 = yL(startVals[i]);
            const y2 = yL(endVals[i]);
            const isHero = i === Math.floor(slice.length / 2);
            const col = isHero ? accent : hexToRgba(text, 0.5);
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={y1} y2={y2} stroke={col} strokeWidth={isHero ? 3 : 1.5} />
                <circle cx={padL} cy={y1} r="5" fill={bg} stroke={text} strokeWidth="2" />
                <circle cx={W - padR} cy={y2} r="5" fill={isHero ? accent : bg} stroke={isHero ? accent : text} strokeWidth="2" />
                <text x={padL - 10} y={y1 + 4} textAnchor="end" fill={text} fontSize="11" fontWeight={isHero ? '700' : '400'}>{d.label} {fmt(startVals[i])}</text>
                <text x={W - padR + 10} y={y2 + 4} fill={text} fontSize="11" fontWeight={isHero ? '700' : '400'}>{fmt(endVals[i])}</text>
              </g>
            );
          })}
        </svg>
      );
    }

    case 'blueprint-node': {
      // Node graph with labeled nodes and edge weights
      const W = 420, H = 240;
      const nodes = data.slice(0, 6).map((d, i) => ({
        x: [60, 170, 170, 290, 290, 100][i] || 200,
        y: [70, 50, 190, 100, 200, 180][i] || 120,
        d,
      }));
      const edges = [[0, 1], [1, 3], [0, 2], [2, 4], [3, 4], [2, 5]];
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="JetBrains Mono, monospace">
          <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={faint} strokeWidth="1" />
          </pattern>
          <rect width={W} height={H} fill={`url(#${uid}-grid)`} />
          {edges.map(([a, b], i) => {
            const na = nodes[a], nb = nodes[b];
            if (!na || !nb) return null;
            const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
            return (
              <g key={i}>
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={accent} strokeWidth="2" strokeDasharray="5 4" />
                <rect x={mx - 14} y={my - 8} width="28" height="14" fill={bg} stroke={accent} />
                <text x={mx} y={my + 2} textAnchor="middle" fill={accent} fontSize="9" fontWeight="700">{fmt(((na.d?.value || 0) + (nb.d?.value || 0)) / 2)}</text>
              </g>
            );
          })}
          {nodes.map((n, i) => (
            <g key={i}>
              <rect x={n.x - 22} y={n.y - 14} width="44" height="28" fill={i % 2 ? bg : accent} stroke={i % 2 ? secondary : text} strokeWidth="2.5" rx="3" />
              <text x={n.x} y={n.y - 1} textAnchor="middle" fill={i % 2 ? text : bg} fontSize="10" fontWeight="800">{n.d?.label || `N${i + 1}`}</text>
              <text x={n.x} y={n.y + 10} textAnchor="middle" fill={i % 2 ? ink : hexToRgba(bg, 0.85)} fontSize="8">{fmt(n.d?.value || 0)}</text>
            </g>
          ))}
        </svg>
      );
    }

    case 'heatmap-matrix': {
      // 7x5 heatmap with row/col labels
      const cols = 7, rows = 5;
      const matrix = Array.from({ length: rows * cols }).map((_, i) => {
        const base = (data[i % data.length]?.value || 30) / max;
        const jitter = ((i * 31 + seed * 17) % 100) / 100;
        return base * 0.55 + jitter * 0.45;
      });
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];
      return (
        <div className="flex h-full w-full flex-col gap-1" style={{ fontFamily: 'Inter, system-ui' }}>
          <div className="grid" style={{ gridTemplateColumns: `28px repeat(${cols}, 1fr)`, gap: '3px' }}>
            <span />
            {days.map((d, i) => <span key={i} className="text-center text-[9px] font-bold" style={{ color: ink }}>{d}</span>)}
          </div>
          <div className="grid flex-1" style={{ gridTemplateColumns: `28px repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '3px' }}>
            {Array.from({ length: rows }).map((_, r) => (
              <React.Fragment key={r}>
                <span className="flex items-center text-[9px] font-bold" style={{ color: ink }}>{weeks[r]}</span>
                {Array.from({ length: cols }).map((_, c) => {
                  const v = matrix[r * cols + c];
                  const a = 0.12 + v * 0.85;
                  return <span key={c} className="rounded-sm" style={{ background: hexToRgba(accent, a), border: `1px solid ${hexToRgba(text, 0.06)}` }} />;
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[9px] font-bold" style={{ color: ink }}>LESS</span>
            {[0.12, 0.3, 0.5, 0.7, 0.95].map((a, i) => <span key={i} className="h-2 w-5 rounded-sm" style={{ background: hexToRgba(accent, a) }} />)}
            <span className="text-[9px] font-bold" style={{ color: ink }}>MORE</span>
          </div>
        </div>
      );
    }

    case 'funnel-stack': {
      // Funnel with %s, drop-off labels, segment counts
      const slice = data.slice(0, 5).length ? data.slice(0, 5) : [{ label: 'Visit', value: 100 }, { label: 'Lead', value: 64 }, { label: 'Trial', value: 38 }, { label: 'Paid', value: 18 }, { label: 'Retained', value: 9 }];
      const top = slice[0].value;
      const W = 460, H = 240, padT = 14, padB = 14;
      const innerH = H - padT - padB;
      const stepH = innerH / slice.length;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {slice.map((d, i) => {
            const wTop = (d.value / top) * (W * 0.7);
            const next = slice[i + 1];
            const wBot = next ? (next.value / top) * (W * 0.7) : wTop * 0.4;
            const y = padT + i * stepH;
            const cx = W / 2;
            const path = `M${cx - wTop / 2} ${y} L${cx + wTop / 2} ${y} L${cx + wBot / 2} ${y + stepH - 4} L${cx - wBot / 2} ${y + stepH - 4} Z`;
            const colors = [accent, hexToRgba(accent, 0.78), secondary, hexToRgba(secondary, 0.7), hexToRgba(text, 0.5)];
            const pctRetained = Math.round((d.value / top) * 100);
            return (
              <g key={i}>
                <path d={path} fill={colors[i] || muted} />
                <text x={cx} y={y + stepH / 2} textAnchor="middle" fill={bg} fontSize="13" fontWeight="800">{d.label} · {fmt(d.value)}</text>
                <text x={cx + wTop / 2 + 12} y={y + stepH / 2 + 4} fill={ink} fontSize="11" fontWeight="700">{pctRetained}%</text>
                {next && (
                  <text x={cx - wTop / 2 - 12} y={y + stepH / 2 + 4} textAnchor="end" fill={secondary} fontSize="10" fontWeight="700">
                    −{Math.round(((d.value - next.value) / d.value) * 100)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    case 'treemap-tiles': {
      // Squarified-ish treemap with proportional sizing and labels
      const slice = data.slice(0, 6);
      const total = slice.reduce((a, b) => a + b.value, 0) || 1;
      const colors = [accent, secondary, hexToRgba(accent, 0.7), hexToRgba(secondary, 0.65), hexToRgba(text, 0.4), hexToRgba(accent, 0.45)];
      // simple row-based layout: first big, then row of 2, then row of 3
      const layout = [
        { x: 0, y: 0, w: 60, h: 60 },
        { x: 60, y: 0, w: 40, h: 30 },
        { x: 60, y: 30, w: 40, h: 30 },
        { x: 0, y: 60, w: 33, h: 40 },
        { x: 33, y: 60, w: 33, h: 40 },
        { x: 66, y: 60, w: 34, h: 40 },
      ];
      return (
        <div className="relative h-full w-full" style={{ fontFamily: 'Inter, system-ui' }}>
          {slice.map((d, i) => {
            const l = layout[i];
            const share = Math.round((d.value / total) * 100);
            return (
              <div key={i} className="absolute flex flex-col justify-between p-2"
                style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, height: `${l.h}%`, background: colors[i], border: `2px solid ${bg}`, color: i < 3 ? bg : text }}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{d.label}</span>
                <div>
                  <div className="text-xl font-black leading-none">{fmt(d.value)}</div>
                  <div className="text-[10px] font-semibold opacity-80">{share}%</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'gantt-roadmap': {
      // Gantt chart with month grid, task bars, percent complete
      const W = 500, H = 240, padL = 90, padR = 16, padT = 30, padB = 22;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
      const colW = innerW / months.length;
      const tasks = data.slice(0, 5);
      const rowH = innerH / tasks.length;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {months.map((m, i) => (
            <g key={i}>
              <line x1={padL + i * colW} x2={padL + i * colW} y1={padT} y2={padT + innerH} stroke={soft} />
              <text x={padL + i * colW + colW / 2} y={padT - 10} textAnchor="middle" fill={ink} fontSize="10" fontWeight="700">{m}</text>
            </g>
          ))}
          <line x1={padL + months.length * colW} x2={padL + months.length * colW} y1={padT} y2={padT + innerH} stroke={soft} />
          {tasks.map((t, i) => {
            const start = ((i * 17 + seed * 11) % 4);
            const span = 1 + ((t.value / max) * 3);
            const x = padL + start * colW;
            const w = span * colW;
            const y = padT + i * rowH + rowH * 0.18;
            const h = rowH * 0.6;
            const complete = Math.min(100, Math.max(20, Math.round((t.value / max) * 90)));
            const fill = i % 2 ? secondary : accent;
            return (
              <g key={i}>
                <text x={padL - 8} y={y + h / 2 + 4} textAnchor="end" fill={text} fontSize="10" fontWeight="700">{t.label}</text>
                <rect x={x} y={y} width={w} height={h} fill={hexToRgba(fill, 0.25)} rx="3" />
                <rect x={x} y={y} width={(w * complete) / 100} height={h} fill={fill} rx="3" />
                <text x={x + w + 6} y={y + h / 2 + 4} fill={ink} fontSize="10" fontWeight="700">{complete}%</text>
              </g>
            );
          })}
          {/* today line */}
          <line x1={padL + colW * 2.5} x2={padL + colW * 2.5} y1={padT - 4} y2={padT + innerH + 4} stroke={accent} strokeWidth="2" strokeDasharray="4 3" />
          <text x={padL + colW * 2.5} y={padT - 18} textAnchor="middle" fill={accent} fontSize="9" fontWeight="800">TODAY</text>
        </svg>
      );
    }

    case 'quadrant-bubbles': {
      // 2x2 matrix with labeled quadrants and value-sized bubbles
      const W = 420, H = 240, padL = 50, padR = 20, padT = 24, padB = 30;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const cx = padL + innerW / 2, cy = padT + innerH / 2;
      const bubbles = data.slice(0, 6).map((d, i) => ({
        x: padL + ((i * 47 + seed * 13) % 90) / 100 * innerW * 0.92 + innerW * 0.04,
        y: padT + ((i * 71 + seed * 19) % 90) / 100 * innerH * 0.92 + innerH * 0.04,
        r: 10 + (d.value / max) * 22,
        d,
      }));
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          <rect x={padL} y={padT} width={innerW} height={innerH} fill="none" stroke={soft} />
          <line x1={cx} y1={padT} x2={cx} y2={padT + innerH} stroke={soft} strokeDasharray="3 3" />
          <line x1={padL} y1={cy} x2={padL + innerW} y2={cy} stroke={soft} strokeDasharray="3 3" />
          <text x={padL + 6} y={padT + 14} fill={ink} fontSize="9" fontWeight="800">QUESTION</text>
          <text x={padL + innerW - 6} y={padT + 14} textAnchor="end" fill={ink} fontSize="9" fontWeight="800">LEADERS</text>
          <text x={padL + 6} y={padT + innerH - 6} fill={ink} fontSize="9" fontWeight="800">NICHE</text>
          <text x={padL + innerW - 6} y={padT + innerH - 6} textAnchor="end" fill={ink} fontSize="9" fontWeight="800">CHALLENGERS</text>
          <text x={padL - 8} y={padT + 4} textAnchor="end" fill={ink} fontSize="9">▲ vision</text>
          <text x={padL + innerW} y={padT + innerH + 18} textAnchor="end" fill={ink} fontSize="9">execution ▶</text>
          {bubbles.map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={hexToRgba(i === 2 ? accent : secondary, 0.32)} stroke={i === 2 ? accent : secondary} strokeWidth="2" />
              <text x={b.x} y={b.y + 3} textAnchor="middle" fill={text} fontSize="10" fontWeight="800">{b.d.label}</text>
            </g>
          ))}
        </svg>
      );
    }

    case 'radial-bars': {
      // Stacked radial progress bars with labels
      const slice = data.slice(0, 5);
      const W = 360, H = 240, cx = 180, cy = 130;
      const rings = slice.map((d, i) => {
        const r = 38 + i * 14;
        const c = 2 * Math.PI * r;
        const ratio = Math.min(1, d.value / max);
        return { d, r, c, ratio, i };
      });
      const palette = [accent, secondary, hexToRgba(accent, 0.7), hexToRgba(secondary, 0.6), hexToRgba(text, 0.4)];
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {rings.map(({ r, c, ratio, i }) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <circle r={r} fill="none" stroke={faint} strokeWidth="9" />
              <circle r={r} fill="none" stroke={palette[i]} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={`${c * ratio} ${c}`} transform="rotate(-90)" />
            </g>
          ))}
          <g transform={`translate(${cx + 110} 40)`}>
            {rings.map(({ d, ratio, i }) => (
              <g key={i} transform={`translate(0 ${i * 28})`}>
                <rect width="10" height="10" rx="2" fill={palette[i]} />
                <text x="18" y="6" fill={text} fontSize="11" fontWeight="700">{d.label}</text>
                <text x="18" y="20" fill={ink} fontSize="11" fontWeight="800">{Math.round(ratio * 100)}%</text>
              </g>
            ))}
          </g>
        </svg>
      );
    }

    case 'candlestick-tape': {
      // OHLC candlesticks with axis & moving average
      const W = 500, H = 240, padL = 40, padR = 16, padT = 20, padB = 30;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const slice = (data.length >= 8 ? data : [...data, ...data, ...data]).slice(0, 10);
      const step = innerW / slice.length;
      const localMax = max * 1.15;
      const yFor = (v: number) => padT + innerH - (v / localMax) * innerH;
      const candles = slice.map((d, i) => {
        const open = d.value * (0.85 + ((i * 13 + seed * 7) % 30) / 100);
        const close = d.value * (0.85 + ((i * 29 + seed * 11) % 30) / 100);
        const high = Math.max(open, close) + max * 0.06;
        const low = Math.min(open, close) - max * 0.05;
        return { open, close, high, low, x: padL + i * step + step / 2 };
      });
      // MA line
      const ma = candles.map((_, i) => {
        const slice2 = candles.slice(Math.max(0, i - 2), i + 1);
        const avg = slice2.reduce((a, b) => a + (b.open + b.close) / 2, 0) / slice2.length;
        return { x: candles[i].x, y: yFor(avg) };
      });
      const maPath = ma.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="JetBrains Mono, monospace">
          {[0, 0.5, 1].map((f, i) => {
            const y = padT + f * innerH;
            return (
              <g key={i}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={soft} />
                <text x={padL - 6} y={y + 3} textAnchor="end" fill={ink} fontSize="9">{fmt(localMax * (1 - f))}</text>
              </g>
            );
          })}
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const col = up ? accent : secondary;
            return (
              <g key={i}>
                <line x1={c.x} x2={c.x} y1={yFor(c.high)} y2={yFor(c.low)} stroke={col} strokeWidth="1.5" />
                <rect x={c.x - step * 0.3} y={yFor(Math.max(c.open, c.close))} width={step * 0.6}
                  height={Math.max(2, Math.abs(yFor(c.open) - yFor(c.close)))} fill={col} />
              </g>
            );
          })}
          <path d={maPath} fill="none" stroke={text} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <text x={W - padR} y={padT - 6} textAnchor="end" fill={ink} fontSize="9" letterSpacing="1.5">MA(3) · OHLC</text>
        </svg>
      );
    }

    case 'sankey-ribbons':
    default: {
      // Sankey with source/target nodes and proportional ribbons
      const W = 480, H = 240, padL = 60, padR = 60, padT = 24, padB = 20;
      const innerW = W - padL - padR, innerH = H - padT - padB;
      const sources = data.slice(0, 3).length ? data.slice(0, 3) : [{ label: 'Web', value: 60 }, { label: 'App', value: 25 }, { label: 'API', value: 15 }];
      const targets = [
        { label: 'Convert', value: sources.reduce((a, b) => a + b.value, 0) * 0.42 },
        { label: 'Browse', value: sources.reduce((a, b) => a + b.value, 0) * 0.38 },
        { label: 'Exit', value: sources.reduce((a, b) => a + b.value, 0) * 0.2 },
      ];
      const sTotal = sources.reduce((a, b) => a + b.value, 0) || 1;
      const tTotal = targets.reduce((a, b) => a + b.value, 0) || 1;
      const colors = [accent, secondary, hexToRgba(text, 0.5)];
      // build source rects
      let sy = padT;
      const sRects = sources.map((s, i) => {
        const h = (s.value / sTotal) * innerH;
        const r = { x: padL - 14, y: sy, w: 14, h, color: colors[i % colors.length], d: s };
        sy += h + 4;
        return r;
      });
      let ty = padT;
      const tRects = targets.map((t, i) => {
        const h = (t.value / tTotal) * innerH;
        const r = { x: W - padR, y: ty, w: 14, h, color: colors[i % colors.length], d: t };
        ty += h + 4;
        return r;
      });
      const ribbons: { d: string; color: string }[] = [];
      sRects.forEach((s, si) => {
        let sOff = 0;
        tRects.forEach((t, ti) => {
          const share = (s.d.value / sTotal) * (t.d.value / tTotal);
          const rh = share * innerH * 3;
          if (rh < 1) return;
          let tOff = 0;
          // distribute: target offset proportional to source index
          tOff = (si * t.h) / sRects.length;
          const x1 = s.x + s.w, x2 = t.x;
          const y1a = s.y + sOff, y1b = s.y + sOff + rh;
          const y2a = t.y + tOff, y2b = t.y + tOff + rh;
          const cx1 = x1 + (x2 - x1) * 0.5, cx2 = x1 + (x2 - x1) * 0.5;
          ribbons.push({
            d: `M${x1} ${y1a} C${cx1} ${y1a} ${cx2} ${y2a} ${x2} ${y2a} L${x2} ${y2b} C${cx2} ${y2b} ${cx1} ${y1b} ${x1} ${y1b} Z`,
            color: hexToRgba(s.color, 0.35),
          });
          sOff += rh;
        });
      });
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fontFamily="Inter, system-ui">
          {ribbons.map((r, i) => <path key={i} d={r.d} fill={r.color} />)}
          {sRects.map((r, i) => (
            <g key={`s${i}`}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={r.color} />
              <text x={r.x - 6} y={r.y + r.h / 2 + 4} textAnchor="end" fill={text} fontSize="11" fontWeight="700">{r.d.label}</text>
              <text x={r.x - 6} y={r.y + r.h / 2 + 18} textAnchor="end" fill={ink} fontSize="10">{fmt(r.d.value)}</text>
            </g>
          ))}
          {tRects.map((r, i) => (
            <g key={`t${i}`}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={r.color} />
              <text x={r.x + r.w + 6} y={r.y + r.h / 2 + 4} fill={text} fontSize="11" fontWeight="700">{r.d.label}</text>
              <text x={r.x + r.w + 6} y={r.y + r.h / 2 + 18} fill={ink} fontSize="10">{fmt(r.d.value)}</text>
            </g>
          ))}
        </svg>
      );
    }
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
  const { look } = deckSystemFor(t, kind);
  const graphicAt = (channel: string, offset = 0) => graphicFor(t, `${kind}:${channel}`, offset);
  const seedAt = (channel: string, itemIndex = 0) => graphicSeedFor(t, `${kind}:${channel}`, itemIndex);
  const seriesAt = (channel: string, series = content.chart.series) => uniqueSeriesFor(series, t, `${kind}:${channel}`);
  const primaryGraphic = graphicAt("primary");
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
                  system={graphicAt("section-visual")}
                  series={seriesAt("section-visual")}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
                  muted={muted}
                  seed={seedAt("section-visual", index)}
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
              const metricGraphic = graphicAt(`metric-${i}`);
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
                      series={uniqueSeriesFor([{ label: m.label, value: numeric }, { label: 'A', value: pct * 0.7 }, { label: 'B', value: pct }], t, `${kind}:metric-${i}`)}
                      accent={t.palette.accent}
                      secondary={t.palette.secondary}
                      text={t.palette.text}
                      bg={t.palette.bg}
                      muted={muted}
                      seed={seedAt("metric", i)}
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
                {primaryGraphic.replace(/-/g, ' ')}
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
                system={primaryGraphic}
                series={seriesAt("primary")}
                accent={t.palette.accent}
                secondary={t.palette.secondary}
                text={t.palette.text}
                bg={t.palette.bg}
                muted={muted}
                seed={seedAt("primary", index)}
              />
            </div>
          </div>
          <div className={cn("flex flex-col gap-3 min-h-0", (look === 'brutalist-poster' || look === 'startup-collage') && 'hidden', (look === 'editorial-atlas' || look === 'literary-monograph') && 'border-l pl-5')} style={(look === 'editorial-atlas' || look === 'literary-monograph') ? { borderColor: hexToRgba(t.palette.text, 0.24) } : undefined}>
            <div className="p-4" style={{ background: cardBg, border: `1px solid ${subtleBorder}`, borderRadius: look === 'terminal-grid' || look === 'systems-blueprint' ? 2 : look === 'organic-fieldnotes' ? 22 : 10 }}>
              <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: muted }}>
                Distribution
              </div>
              <DataGraphic
                system={graphicAt("distribution")}
                series={seriesAt("distribution", content.chart.series.slice(0, 4))}
                accent={t.palette.accent}
                secondary={t.palette.secondary}
                text={t.palette.text}
                bg={t.palette.bg}
                muted={muted}
                seed={seedAt("distribution", index)}
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
                <div className="h-14 w-20"><DataGraphic system={graphicAt("compare-before-chip")} series={uniqueSeriesFor([{ label: 'A', value: 32 }, { label: 'B', value: 54 }], t, `${kind}:compare-before-chip`)} accent={t.palette.secondary} secondary={t.palette.accent} text={t.palette.text} bg={t.palette.bg} muted={muted} seed={seedAt("compare-before-chip")} /></div>
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
                  system={graphicAt("compare-before-baseline")}
                  series={uniqueSeriesFor([
                    { label: "Speed", value: 28 },
                    { label: "Cost", value: 64 },
                    { label: "Effort", value: 78 },
                  ], t, `${kind}:compare-before-baseline`)}
                  accent={t.palette.secondary}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
                  muted={muted}
                  seed={seedAt("compare-before-baseline")}
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
                <div className="h-14 w-20"><DataGraphic system={graphicAt("compare-after-chip")} series={uniqueSeriesFor([{ label: 'A', value: 91 }, { label: 'B', value: 38 }], t, `${kind}:compare-after-chip`)} accent={t.palette.accent} secondary={t.palette.secondary} text={t.palette.text} bg={t.palette.bg} muted={muted} seed={seedAt("compare-after-chip")} /></div>
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
                  system={graphicAt("compare-after-lift")}
                  series={uniqueSeriesFor([
                    { label: "Speed", value: 92 },
                    { label: "Cost", value: 38 },
                    { label: "Effort", value: 22 },
                  ], t, `${kind}:compare-after-lift`)}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
                  muted={muted}
                  seed={seedAt("compare-after-lift")}
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
              const kpiGraphic = graphicAt(`kpi-support-${i}`);
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
                    <DataGraphic
                      system={kpiGraphic}
                      series={uniqueSeriesFor([{ label: s.label, value: numeric }, { label: 'Goal', value: pct }, { label: 'Base', value: pct * 0.54 }], t, `${kind}:kpi-support-${i}`)}
                      accent={t.palette.accent}
                      secondary={t.palette.secondary}
                      text={t.palette.text}
                      bg={t.palette.bg}
                      muted={muted}
                      seed={seedAt("kpi-support", i)}
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
                      <DataGraphic
                        system={graphicAt(`bento-tile-${i}`)}
                        series={seriesAt(`bento-tile-${i}`, content.chart.series.slice(0, 5))}
                        accent={t.palette.accent}
                        secondary={t.palette.secondary}
                        text={t.palette.text}
                        bg={t.palette.bg}
                        muted={muted}
                        seed={seedAt("bento-tile", i)}
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
                <DataGraphic
                  system={graphicAt("feature-hero")}
                  series={seriesAt("feature-hero")}
                  accent={t.palette.accent}
                  secondary={t.palette.secondary}
                  text={t.palette.text}
                  bg={t.palette.bg}
                  muted={muted}
                  seed={seedAt("feature-hero", index)}
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
                  <DataGraphic system={graphicAt("feature-card")} series={seriesAt("feature-card", content.chart.series.slice(0, 4))} accent={t.palette.accent} secondary={t.palette.secondary} text={t.palette.text} bg={t.palette.bg} muted={muted} seed={seedAt("feature-card", index)} />
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

export const TemplatePreviewDialog: React.FC<Props> = ({ template, open, onOpenChange, onUse, onOpenInEditor, disabled, focusSlideKind, highlightShared }) => {
  const [editing, setEditing] = useState(false);
  const initial = useMemo(() => (template ? buildInitialContent(template) : null), [template?.id]);
  const [content, setContent] = useState<DemoContent | null>(initial);
  const [saveOpen, setSaveOpen] = useState(false);
  const slideRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (template) {
      setContent(buildInitialContent(template));
      setEditing(false);
    }
  }, [template?.id, open]);

  useEffect(() => {
    if (!open || !focusSlideKind) return;
    // Wait for the dialog content to mount before scrolling.
    const id = window.setTimeout(() => {
      const el = slideRefs.current[focusSlideKind];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [open, focusSlideKind, template?.id]);

  const isCorporate = !!BUILTIN_CORPORATE_DECKS[template?.id ?? ""];
  const corporateLabel = template ? BUILTIN_CORPORATE_DECKS[template.id]?.label : undefined;
  const [realSlides, setRealSlides] = useState<SlideData[] | null>(
    template ? corporateDeckCache.get(template.id) ?? null : null,
  );
  const [realLoading, setRealLoading] = useState(false);
  const [realError, setRealError] = useState<string | null>(null);

  useEffect(() => {
    if (!template || !open) return;
    if (!BUILTIN_CORPORATE_DECKS[template.id]) {
      setRealSlides(null);
      setRealError(null);
      return;
    }
    const cached = corporateDeckCache.get(template.id);
    if (cached) {
      setRealSlides(cached);
      return;
    }
    let cancelled = false;
    setRealLoading(true);
    setRealError(null);
    loadCorporateDeckSlides(template.id)
      .then((slides) => {
        if (cancelled) return;
        setRealSlides(slides);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Corporate deck preview load failed:", err);
        setRealError(err instanceof Error ? err.message : "Failed to load corporate deck");
      })
      .finally(() => {
        if (!cancelled) setRealLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [template?.id, open]);

  if (!template || !content) return null;
  const t = template;
  const showRealDeck = isCorporate && (realSlides?.length ?? 0) > 0;


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
                  : showRealDeck
                    ? `${realSlides!.length} approved slides · ${corporateLabel ?? "Corporate deck"}`
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
            {isCorporate && realLoading && (
              <div className="flex items-center justify-center gap-3 rounded-xl border bg-card/50 p-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading {corporateLabel ?? "corporate deck"}…
              </div>
            )}
            {isCorporate && !realLoading && realError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
                Couldn't load {corporateLabel ?? "the corporate deck"}: {realError}. Showing fallback preview below.
              </div>
            )}

            {showRealDeck ? (
              <>
                <div className="flex items-center justify-between rounded-xl border bg-card/60 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Approved deck · {realSlides!.length} slides
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {thumbsReady
                      ? `Thumbnails · ${corporateLabel}`
                      : `Rendering thumbnails… ${Math.round(thumbProgress * 100)}%`}
                  </div>
                </div>
                {realSlides!.map((slide, i) => {
                  const thumb = realThumbs[i];
                  return (
                    <div
                      key={slide.id ?? `real-${i}`}
                      className="relative rounded-xl overflow-hidden border bg-black/40 shadow-lg"
                    >
                      <div className="absolute top-2 left-3 z-20 text-[11px] font-mono text-white/70 px-2 py-0.5 rounded bg-black/40 backdrop-blur">
                        {String(i + 1).padStart(2, "0")} / {String(realSlides!.length).padStart(2, "0")}
                      </div>
                      <div className="aspect-[16/9] w-full flex items-center justify-center bg-black">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`Slide ${i + 1}`}
                            loading="lazy"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Rendering…
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (

              SLIDES.map((kind, i) => {
                const isFocused = focusSlideKind === kind;
                return (
                  <div
                    key={kind}
                    ref={(el) => { slideRefs.current[kind] = el; }}
                    className={cn(
                      "relative rounded-xl transition-shadow scroll-mt-4",
                      isFocused && highlightShared && "ring-4 ring-yellow-500/80 ring-offset-2 ring-offset-background",
                      isFocused && !highlightShared && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
                    )}
                  >
                    {isFocused && highlightShared && (
                      <span className="absolute -top-3 left-4 z-30 rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow">
                        Shared region · {kind.replace(/-/g, " ")}
                      </span>
                    )}
                    <SlideMock
                      template={t}
                      content={content}
                      setContent={setContent}
                      editing={editing}
                      kind={kind}
                      index={i}
                      total={SLIDES.length}
                    />
                  </div>
                );
              })
            )}


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
