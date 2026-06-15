import React from 'react';
import {
  BarChart3,
  CalendarDays,
  Check,
  Hash,
  Image as ImageIcon,
  Layers3,
  ListChecks,
  MessageCircle,
  Mic2,
  MonitorPlay,
  PieChart,
  Presentation,
  Quote,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import type { DeckTemplate } from './TemplateGallery';
import { cn } from '@/lib/utils';

const isLight = (hex: string) => {
  const bg = hex.replace('#', '');
  if (bg.length < 6) return false;
  const r = parseInt(bg.slice(0, 2), 16);
  const g = parseInt(bg.slice(2, 4), 16);
  const b = parseInt(bg.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

const badgeFor = (template: DeckTemplate) => {
  const id = template.id.toLowerCase();
  const name = template.name.toLowerCase();
  const desc = (template.description || '').toLowerCase();
  const hay = `${id} ${name} ${desc}`;
  if (hay.includes('transperfect')) return 'Global brand deck';
  if (hay.includes('corporate') || hay.includes('investor') || hay.includes('executive') || hay.includes('finance')) return 'Executive report';
  if (hay.includes('editorial') || hay.includes('magazine') || hay.includes('journal')) return 'Editorial keynote';
  if (hay.includes('startup') || hay.includes('pitch') || hay.includes('launch') || hay.includes('vibrant')) return 'Launch narrative';
  if (hay.includes('terracotta') || hay.includes('warm') || hay.includes('wellness') || hay.includes('lifestyle')) return 'Warm story deck';
  if (hay.includes('brutalist') || hay.includes('mono')) return 'Bold pitch deck';
  if (hay.includes('dark') || hay.includes('noir') || hay.includes('midnight')) return 'Dark product deck';
  if (hay.includes('sport') || hay.includes('event') || hay.includes('festival')) return 'Event keynote';
  if (hay.includes('luxury') || hay.includes('premium') || hay.includes('gold')) return 'Luxury brand deck';
  if (hay.includes('saas') || hay.includes('product') || hay.includes('tech')) return 'Product deck';
  if (hay.includes('education') || hay.includes('learning') || hay.includes('academic')) return 'Lecture deck';
  if (hay.includes('nonprofit') || hay.includes('impact') || hay.includes('charity')) return 'Impact deck';
  if (hay.includes('creator') || hay.includes('portfolio') || hay.includes('studio')) return 'Creator deck';
  if (hay.includes('report') || hay.includes('annual')) return 'Annual report';
  if (hay.includes('marketing') || hay.includes('campaign')) return 'Campaign deck';
  // Fallback: short uppercased first word of the template name
  const first = template.name.split(/\s+/)[0] || 'Prebuilt';
  return `${first} deck`;
};

type PreviewKind =
  | 'title'
  | 'editorial'
  | 'columns'
  | 'image-split'
  | 'quote'
  | 'stats'
  | 'stat-hero'
  | 'closing'
  | 'section'
  | 'bullet'
  | 'team'
  | 'comparison'
  | 'full-bleed'
  | 'webinar-title'
  | 'agenda'
  | 'speaker'
  | 'qa'
  | 'poll'
  | 'stream'
  | 'chart'
  | 'process';

type PreviewArrangement = 'fan' | 'mosaic' | 'hero' | 'vertical' | 'rail';
type IconComponent = React.ComponentType<{ className?: string }>;

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(clean)) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const hashFor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
};

const ALL_KINDS: PreviewKind[] = [
  'title', 'editorial', 'columns', 'image-split', 'quote', 'stats', 'stat-hero',
  'closing', 'section', 'bullet', 'team', 'comparison', 'full-bleed',
  'webinar-title', 'agenda', 'speaker', 'qa', 'poll', 'stream', 'chart', 'process',
];

const kindFor = (template: DeckTemplate): PreviewKind => {
  const hay = `${template.id} ${template.name} ${template.description || ''} ${(template.tags || []).join(' ')}`.toLowerCase();
  // Strong keyword matches win over hashing
  if (hay.includes('lower third') || hay.includes('starting soon') || hay.includes('stream') || hay.includes('brb')) return 'stream';
  if (hay.includes('webinar title')) return 'webinar-title';
  if (hay.includes('agenda')) return 'agenda';
  if (hay.includes('speaker') || hay.includes('bio')) return 'speaker';
  if (hay.includes('q&a') || hay.includes('qa slide')) return 'qa';
  if (hay.includes('poll') || hay.includes('survey')) return 'poll';
  if (hay.includes('section divider')) return 'section';
  if (hay.includes('bullet')) return 'bullet';
  if (hay.includes('stat highlight') || hay.includes('big number')) return 'stat-hero';
  if (hay.includes('metrics dashboard') || hay.includes('kpi')) return 'stats';
  if (hay.includes('team grid')) return 'team';
  if (hay.includes('comparison')) return 'comparison';
  if (hay.includes('full bleed') || hay.includes('fullbleed')) return 'full-bleed';
  if (hay.includes('thank you') || hay.includes('closing slide')) return 'closing';
  if (hay.includes('image split')) return 'image-split';
  if (hay.includes('two-column') || hay.includes('two column')) return 'columns';
  if (hay.includes('pull quote') || hay.includes('quote slide')) return 'quote';
  // Otherwise: hash the template into ALL kinds so every card is distinct
  const h = hashFor(`${template.id}::${template.name}`);
  return ALL_KINDS[h % ALL_KINDS.length];
};

const ALL_ARRANGEMENTS: PreviewArrangement[] = ['fan', 'mosaic', 'hero', 'vertical', 'rail'];

const arrangementFor = (kind: PreviewKind, template: DeckTemplate): PreviewArrangement => {
  // Hash drives arrangement so visually-similar kinds still get different stacks
  const h = hashFor(`${template.id}//${kind}`);
  // Bias: some kinds have a clearly best arrangement, but still allow variation
  const bias: Partial<Record<PreviewKind, PreviewArrangement[]>> = {
    stats: ['mosaic', 'rail', 'hero'],
    team: ['mosaic', 'rail'],
    comparison: ['mosaic', 'hero'],
    poll: ['mosaic', 'vertical'],
    section: ['hero', 'fan'],
    'full-bleed': ['hero', 'rail'],
    closing: ['hero', 'fan'],
    'webinar-title': ['hero', 'vertical'],
    stream: ['hero', 'rail'],
    agenda: ['vertical', 'rail'],
    speaker: ['vertical', 'hero'],
    qa: ['vertical', 'fan'],
    bullet: ['rail', 'vertical'],
    columns: ['rail', 'mosaic'],
    'image-split': ['rail', 'hero'],
    editorial: ['rail', 'fan'],
    chart: ['mosaic', 'fan'],
    process: ['rail', 'fan'],
    quote: ['hero', 'fan'],
    'stat-hero': ['hero', 'mosaic'],
    title: ['fan', 'hero'],
  };
  const pool = bias[kind] || ALL_ARRANGEMENTS;
  return pool[h % pool.length];
};

// For each lead kind, provide a pool of complementary follow-up slides.
// A per-template hash picks 2 distinct followers, so two templates with the
// same lead kind still get unique 3-slide compositions.
const MINI_DECK_POOL: Record<PreviewKind, PreviewKind[]> = {
  title:           ['chart', 'process', 'stats', 'quote', 'image-split', 'agenda', 'editorial', 'stat-hero'],
  editorial:       ['quote', 'image-split', 'columns', 'bullet', 'full-bleed', 'chart'],
  columns:         ['bullet', 'comparison', 'chart', 'stats', 'process', 'team'],
  'image-split':   ['full-bleed', 'quote', 'editorial', 'stats', 'team', 'closing'],
  quote:           ['editorial', 'section', 'image-split', 'closing', 'speaker', 'full-bleed'],
  stats:           ['chart', 'stat-hero', 'comparison', 'process', 'poll', 'bullet'],
  'stat-hero':     ['stats', 'chart', 'process', 'poll', 'comparison', 'quote'],
  closing:         ['title', 'qa', 'quote', 'stats', 'image-split', 'stat-hero'],
  section:         ['title', 'agenda', 'quote', 'image-split', 'chart', 'process'],
  bullet:          ['columns', 'process', 'comparison', 'agenda', 'chart', 'stats'],
  team:            ['speaker', 'agenda', 'quote', 'columns', 'stats', 'image-split'],
  comparison:      ['columns', 'chart', 'stats', 'bullet', 'poll', 'process'],
  'full-bleed':    ['image-split', 'title', 'quote', 'closing', 'editorial', 'stat-hero'],
  'webinar-title': ['agenda', 'speaker', 'qa', 'poll', 'closing', 'stats'],
  agenda:          ['webinar-title', 'qa', 'speaker', 'bullet', 'process', 'team'],
  speaker:         ['team', 'quote', 'agenda', 'qa', 'webinar-title', 'bullet'],
  qa:              ['poll', 'closing', 'speaker', 'webinar-title', 'agenda', 'quote'],
  poll:            ['chart', 'qa', 'stats', 'comparison', 'bullet', 'agenda'],
  stream:          ['webinar-title', 'closing', 'qa', 'agenda', 'poll', 'speaker'],
  chart:           ['stats', 'comparison', 'stat-hero', 'process', 'bullet', 'poll'],
  process:         ['stat-hero', 'columns', 'chart', 'bullet', 'agenda', 'stats'],
};

const miniDeckFor = (kind: PreviewKind, template: DeckTemplate): PreviewKind[] => {
  const pool = MINI_DECK_POOL[kind].filter((k) => k !== kind);
  const h1 = hashFor(`${template.id}::deck-a::${kind}`);
  const h2 = hashFor(`${template.id}::deck-b::${kind}`);
  const second = pool[h1 % pool.length];
  const remaining = pool.filter((k) => k !== second);
  const third = remaining[h2 % remaining.length];
  return [kind, second, third];
};


const SURFACE_VARIANTS = [
  // 0 — diagonal accent stripe + soft secondary glow
  (t: DeckTemplate, l: boolean) =>
    `linear-gradient(115deg, transparent 0 48%, ${hexToRgba(t.palette.accent, 0.28)} 48% 58%, transparent 58% 100%), radial-gradient(circle at 80% 20%, ${hexToRgba(t.palette.secondary, 0.32)}, transparent 45%)`,
  // 1 — dot grid
  (t: DeckTemplate, l: boolean) =>
    `radial-gradient(${hexToRgba(t.palette.text, l ? 0.18 : 0.22)} 1px, transparent 1.4px) 0 0 / 18px 18px, linear-gradient(180deg, transparent, ${hexToRgba(t.palette.accent, 0.16)})`,
  // 2 — corner orb / aurora
  (t: DeckTemplate) =>
    `radial-gradient(circle at 12% 88%, ${hexToRgba(t.palette.accent, 0.55)}, transparent 38%), radial-gradient(circle at 78% 14%, ${hexToRgba(t.palette.secondary, 0.45)}, transparent 42%)`,
  // 3 — graph paper grid
  (t: DeckTemplate, l: boolean) =>
    `repeating-linear-gradient(90deg, ${hexToRgba(t.palette.text, l ? 0.06 : 0.08)} 0 1px, transparent 1px 32px), repeating-linear-gradient(0deg, ${hexToRgba(t.palette.text, l ? 0.05 : 0.07)} 0 1px, transparent 1px 32px)`,
  // 4 — diagonal hatched stripes
  (t: DeckTemplate) =>
    `repeating-linear-gradient(45deg, ${hexToRgba(t.palette.accent, 0.16)} 0 6px, transparent 6px 22px), linear-gradient(180deg, transparent, ${hexToRgba(t.palette.secondary, 0.2)})`,
  // 5 — editorial column rule
  (t: DeckTemplate) =>
    `linear-gradient(90deg, ${hexToRgba(t.palette.accent, 0.16)} 0 2px, transparent 2px 100%), repeating-linear-gradient(0deg, ${hexToRgba(t.palette.text, 0.04)} 0 1px, transparent 1px 16px)`,
  // 6 — concentric arcs
  (t: DeckTemplate) =>
    `radial-gradient(circle at 100% 0%, transparent 22%, ${hexToRgba(t.palette.accent, 0.22)} 22% 24%, transparent 24% 38%, ${hexToRgba(t.palette.secondary, 0.18)} 38% 40%, transparent 40%)`,
  // 7 — confetti dots in accent
  (t: DeckTemplate) =>
    `radial-gradient(${hexToRgba(t.palette.accent, 0.42)} 2px, transparent 2.4px) 4px 6px / 38px 38px, radial-gradient(${hexToRgba(t.palette.secondary, 0.32)} 1.6px, transparent 2px) 20px 22px / 46px 46px`,
];

const surfaceFor = (template: DeckTemplate, light: boolean, kind: PreviewKind) => {
  const bg = template.backgroundCss && template.backgroundCss !== 'transparent' ? template.backgroundCss : template.palette.bg;
  const base = bg.includes('gradient')
    ? bg
    : `linear-gradient(145deg, ${template.palette.bg} 0%, ${hexToRgba(template.palette.accent, light ? 0.14 : 0.2)} 58%, ${template.palette.secondary} 100%)`;

  // Kind-tied bias: each kind has 2-3 preferred surface variants, then hash picks
  const bias: Partial<Record<PreviewKind, number[]>> = {
    editorial: [5, 1],
    bullet: [5, 3],
    comparison: [3, 5],
    stats: [3, 1],
    chart: [3, 7],
    'stat-hero': [2, 0],
    'webinar-title': [2, 0],
    agenda: [5, 3],
    speaker: [2, 0],
    qa: [6, 2],
    poll: [3, 7],
    section: [0, 4],
    'full-bleed': [0, 2],
    stream: [0, 4],
    closing: [2, 6],
    title: [0, 2, 6],
    quote: [2, 6],
    'image-split': [4, 0],
    columns: [5, 3],
    process: [6, 7],
    team: [7, 1],
  };
  const pool = bias[kind] || [0, 1, 2, 3, 4, 5, 6, 7];
  const idx = pool[hashFor(`${template.id}~surface`) % pool.length];
  return { base, pattern: SURFACE_VARIANTS[idx](template, light) };
};

const miniBgFor = (kind: PreviewKind, template: DeckTemplate) => {
  const lightKinds = ['editorial', 'bullet', 'comparison'];
  if (lightKinds.includes(kind) && isLight(template.palette.bg)) return template.palette.bg;
  if (kind === 'full-bleed') return `linear-gradient(135deg, ${hexToRgba(template.palette.accent, 0.42)}, rgba(0,0,0,0.86)), repeating-linear-gradient(135deg, ${hexToRgba(template.palette.text, 0.18)} 0 6px, transparent 6px 16px)`;
  if (kind === 'stream') return `linear-gradient(90deg, ${hexToRgba(template.palette.bg, 0.96)} 0 66%, transparent 100%)`;
  return template.backgroundCss && template.backgroundCss !== 'transparent'
    ? template.backgroundCss
    : `linear-gradient(135deg, ${template.palette.bg}, ${hexToRgba(template.palette.secondary, 0.62)})`;
};

const shortName = (value: string) => value.replace(/\s+[–-]\s+.*/, '').replace(/\s+Slide$/i, '').slice(0, 28);

// Variant index per template — drives style differences inside each slide kind
// (chart type, stats layout, bullet markers, process shape, etc.) so that two
// templates that both lead with e.g. a "chart" slide still look distinct.
const variantFor = (template: DeckTemplate, kind: PreviewKind, salt = '') =>
  hashFor(`${template.id}::variant::${kind}::${salt}`);

const MiniSlide = ({ kind, template, compact = false }: { kind: PreviewKind; template: DeckTemplate; compact?: boolean }) => {
  const title = shortName(template.name);
  const textColor = ['editorial', 'bullet', 'comparison'].includes(kind) && isLight(template.palette.bg) ? template.palette.text : template.palette.text;
  const lineColor = hexToRgba(textColor, 0.68);
  const faint = hexToRgba(textColor, 0.18);
  const accent = template.palette.accent;
  const secondary = template.palette.secondary;
  const v = variantFor(template, kind);

  const Line = ({ w = '70%', color = lineColor }: { w?: string; color?: string }) => (
    <span className="block h-[3px] rounded-full" style={{ width: w, background: color }} />
  );

  // ---------- chart variants ----------
  const renderChart = () => {
    const variant = v % 6;
    if (variant === 0) {
      // vertical bars
      return (
        <div className="flex h-full items-end gap-1.5">
          {[36, 58, 44, 74, 92].map((h, i) => (
            <span key={i} className="w-full rounded-t-sm" style={{ height: `${h}%`, background: i === 4 ? accent : hexToRgba(textColor, 0.28) }} />
          ))}
        </div>
      );
    }
    if (variant === 1) {
      // horizontal bars
      return (
        <div className="flex h-full flex-col justify-center gap-1.5">
          {[88, 64, 46, 30].map((w, i) => (
            <span key={i} className="block h-2.5 rounded-r-sm" style={{ width: `${w}%`, background: i === 0 ? accent : i === 1 ? secondary : hexToRgba(textColor, 0.28) }} />
          ))}
        </div>
      );
    }
    if (variant === 2) {
      // line chart
      return (
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full">
          <polyline fill="none" stroke={hexToRgba(textColor, 0.3)} strokeWidth="1.4" points="0,50 20,42 40,46 60,28 80,32 100,12" />
          <polyline fill="none" stroke={accent} strokeWidth="2.4" points="0,40 20,30 40,36 60,18 80,22 100,6" />
          {[0, 20, 40, 60, 80, 100].map((x, i) => (
            <circle key={i} cx={x} cy={[40, 30, 36, 18, 22, 6][i]} r="1.6" fill={accent} />
          ))}
        </svg>
      );
    }
    if (variant === 3) {
      // donut
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative h-[78%] aspect-square rounded-full" style={{ background: `conic-gradient(${accent} 0 42%, ${secondary} 42% 68%, ${hexToRgba(textColor, 0.28)} 68% 100%)` }}>
            <div className="absolute inset-[22%] rounded-full" style={{ background: template.palette.bg }} />
          </div>
        </div>
      );
    }
    if (variant === 4) {
      // area chart
      return (
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full">
          <polygon fill={hexToRgba(accent, 0.5)} points="0,60 0,38 20,28 40,32 60,16 80,22 100,8 100,60" />
          <polyline fill="none" stroke={accent} strokeWidth="1.8" points="0,38 20,28 40,32 60,16 80,22 100,8" />
        </svg>
      );
    }
    // stacked bars
    return (
      <div className="flex h-full items-end gap-1.5">
        {[55, 70, 60, 88, 76].map((h, i) => (
          <div key={i} className="flex w-full flex-col" style={{ height: `${h}%` }}>
            <span className="w-full rounded-t-sm" style={{ flex: 1, background: accent }} />
            <span className="w-full" style={{ flex: 1.4, background: secondary }} />
            <span className="w-full" style={{ flex: 1, background: hexToRgba(textColor, 0.32) }} />
          </div>
        ))}
      </div>
    );
  };

  // ---------- stats variants ----------
  const renderStats = () => {
    const variant = v % 4;
    const data = [
      { v: '2.4M', l: 'Reach' },
      { v: '98%', l: 'CSAT' },
      { v: '150+', l: 'Cities' },
      { v: '$12B', l: 'GMV' },
    ];
    if (variant === 0) {
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          {data.map((s, i) => (
            <div key={s.v} className="rounded-md p-1" style={{ background: i % 2 ? faint : hexToRgba(accent, 0.16) }}>
              <div className="text-[10px] font-black leading-none" style={{ color: i === 0 ? accent : textColor }}>{s.v}</div>
              <Line w="54%" color={faint} />
            </div>
          ))}
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="flex h-full flex-col justify-center divide-y" style={{ color: textColor }}>
          {data.slice(0, 3).map((s, i) => (
            <div key={s.v} className="flex items-baseline justify-between py-1" style={{ borderColor: hexToRgba(textColor, 0.18) }}>
              <span className="text-[11px] font-black" style={{ color: i === 0 ? accent : textColor }}>{s.v}</span>
              <span className="text-[7px] font-bold opacity-70 uppercase tracking-wide">{s.l}</span>
            </div>
          ))}
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className="grid h-full grid-cols-4 items-end gap-1">
          {data.map((s, i) => (
            <div key={s.v} className="flex flex-col items-center gap-1">
              <span className="w-full rounded-t-sm" style={{ height: `${40 + i * 14}%`, background: i === 1 ? accent : hexToRgba(textColor, 0.32) }} />
              <span className="text-[7px] font-black" style={{ color: i === 1 ? accent : textColor }}>{s.v}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col justify-center gap-1.5">
        {data.slice(0, 3).map((s, i) => (
          <div key={s.v} className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-[7px] font-black" style={{ background: i === 0 ? accent : secondary, color: template.palette.bg }}>{i + 1}</span>
            <div className="flex-1">
              <div className="text-[9px] font-black leading-none">{s.v}</div>
              <Line w="58%" color={faint} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ---------- bullet variants ----------
  const renderBullet = () => {
    const variant = v % 4;
    const widths = [62, 50, 38];
    return (
      <div className="space-y-2">
        <div className="text-[10px] font-black leading-none">{title}</div>
        {widths.map((w, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {variant === 0 && <span className="h-2 w-2 rounded-full" style={{ background: i === 1 ? secondary : accent }} />}
            {variant === 1 && <span className="h-2 w-2 rotate-45" style={{ background: i === 1 ? secondary : accent }} />}
            {variant === 2 && <span className="text-[8px] font-black" style={{ color: accent }}>{`0${i + 1}`}</span>}
            {variant === 3 && <span className="block h-2.5 w-0.5 rounded-full" style={{ background: i === 1 ? secondary : accent }} />}
            <Line w={`${w}%`} />
          </div>
        ))}
      </div>
    );
  };

  // ---------- process variants ----------
  const renderProcess = () => {
    const variant = v % 3;
    if (variant === 0) {
      return (
        <div className="flex h-full items-center justify-between gap-1">
          {['1', '2', '3'].map((n, i) => (
            <React.Fragment key={n}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black" style={{ background: i === 1 ? secondary : accent, color: template.palette.bg }}>{n}</span>
              {i < 2 && <Line w="18%" color={faint} />}
            </React.Fragment>
          ))}
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="flex h-full items-center justify-between gap-1">
          {['1', '2', '3'].map((n, i) => (
            <React.Fragment key={n}>
              <span className="flex h-8 w-8 rotate-45 items-center justify-center text-[10px] font-black" style={{ background: i === 1 ? secondary : accent, color: template.palette.bg }}>
                <span className="-rotate-45">{n}</span>
              </span>
              {i < 2 && <Line w="14%" color={faint} />}
            </React.Fragment>
          ))}
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col justify-center gap-1.5">
        {['Plan', 'Build', 'Ship'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 rounded-md px-1.5 py-1" style={{ background: hexToRgba(i === 1 ? secondary : accent, 0.18) }}>
            <span className="flex h-4 w-4 items-center justify-center rounded-sm text-[7px] font-black" style={{ background: i === 1 ? secondary : accent, color: template.palette.bg }}>{i + 1}</span>
            <Line w={`${70 - i * 10}%`} />
          </div>
        ))}
      </div>
    );
  };

  // ---------- poll variants ----------
  const renderPoll = () => {
    const variant = v % 3;
    const rows = ['76%', '48%', '31%'];
    if (variant === 0) {
      return (
        <div className="space-y-2">
          <div className="text-[10px] font-black">Poll</div>
          {rows.map((n, i) => (
            <div key={n}><div className="mb-0.5 text-[6px] font-bold opacity-80">{n}</div>
              <span className="block h-2 rounded-full" style={{ width: n, background: i === 0 ? accent : faint }} />
            </div>
          ))}
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="flex h-full items-end gap-1.5">
          {rows.concat(['58%']).map((n, i) => (
            <div key={i} className="flex w-full flex-col items-center gap-1">
              <span className="w-full rounded-t-sm" style={{ height: n, background: i === 0 ? accent : hexToRgba(textColor, 0.32) }} />
              <span className="text-[6px] font-bold opacity-70">{n}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-[78%] aspect-square rounded-full" style={{ background: `conic-gradient(${accent} 0 56%, ${secondary} 56% 80%, ${hexToRgba(textColor, 0.28)} 80% 100%)` }}>
          <div className="absolute inset-[28%] flex items-center justify-center rounded-full text-[8px] font-black" style={{ background: template.palette.bg, color: accent }}>56%</div>
        </div>
      </div>
    );
  };

  // ---------- agenda variants ----------
  const renderAgenda = () => {
    const variant = v % 3;
    const items = ['01', '02', '03', '04'];
    if (variant === 0) {
      return (
        <div className="space-y-1.5">
          {items.map((n, i) => (
            <div key={n} className="flex items-center gap-2 rounded-md px-1.5 py-1" style={{ background: i % 2 ? faint : hexToRgba(accent, 0.14) }}>
              <span className="text-[8px] font-black" style={{ color: accent }}>{n}</span>
              <Line w={`${72 - i * 8}%`} />
            </div>
          ))}
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          {items.map((n, i) => (
            <div key={n} className="rounded-md p-1.5" style={{ background: hexToRgba(i % 2 ? secondary : accent, 0.18) }}>
              <div className="text-[9px] font-black" style={{ color: i % 2 ? secondary : accent }}>{n}</div>
              <Line w="62%" color={faint} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="relative pl-3">
        <span className="absolute left-1 top-0 h-full w-[2px]" style={{ background: hexToRgba(accent, 0.55) }} />
        <div className="space-y-1.5">
          {items.map((n, i) => (
            <div key={n} className="flex items-center gap-2">
              <span className="absolute left-0 h-2 w-2 -translate-x-[1px] rounded-full" style={{ background: i === 1 ? secondary : accent }} />
              <span className="text-[7px] font-black opacity-80">{n}</span>
              <Line w={`${66 - i * 8}%`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------- comparison variants ----------
  const renderComparison = () => {
    const variant = v % 3;
    if (variant === 0) {
      return (
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="rounded-md p-1.5" style={{ background: hexToRgba(secondary, 0.18) }}><Line color={secondary} /><Line w="55%" color={faint} /></div>
          <div className="rounded-md p-1.5" style={{ background: hexToRgba(accent, 0.18) }}><Line color={accent} /><Line w="55%" color={faint} /></div>
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="space-y-1 rounded-md p-1.5 text-center" style={{ background: hexToRgba(secondary, 0.2) }}>
            <div className="text-[11px] font-black" style={{ color: secondary }}>A</div>
            <Line w="80%" color={faint} />
          </div>
          <span className="text-[10px] font-black opacity-60">vs</span>
          <div className="space-y-1 rounded-md p-1.5 text-center" style={{ background: hexToRgba(accent, 0.2) }}>
            <div className="text-[11px] font-black" style={{ color: accent }}>B</div>
            <Line w="80%" color={faint} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr] gap-1">
            <span className="block h-2 rounded-r-sm" style={{ width: `${50 + i * 15}%`, background: hexToRgba(secondary, 0.7), marginLeft: 'auto' }} />
            <span className="block h-2 rounded-l-sm" style={{ width: `${80 - i * 15}%`, background: hexToRgba(accent, 0.8) }} />
          </div>
        ))}
      </div>
    );
  };

  // ---------- columns variants ----------
  const renderColumns = () => {
    const variant = v % 3;
    if (variant === 0) {
      return (
        <div className="flex h-full flex-col gap-2">
          <Line w="34%" color={accent} />
          <div className="grid flex-1 grid-cols-2 gap-2">
            <div className="space-y-1 rounded-md p-1" style={{ background: faint }}><Line /><Line w="65%" /></div>
            <div className="space-y-1 rounded-md p-1" style={{ background: hexToRgba(accent, 0.16) }}><Line /><Line w="54%" /></div>
          </div>
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="grid h-full grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1 rounded-md p-1" style={{ background: hexToRgba(i === 1 ? accent : secondary, 0.16) }}>
              <span className="block h-3 w-3 rounded-sm" style={{ background: i === 1 ? accent : secondary }} />
              <Line /><Line w="58%" color={faint} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col gap-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="grid flex-1 grid-cols-[0.3fr_1fr] gap-2 rounded-md p-1" style={{ background: faint }}>
            <span className="rounded-sm" style={{ background: i === 0 ? accent : secondary }} />
            <div className="space-y-1"><Line /><Line w="60%" color={faint} /></div>
          </div>
        ))}
      </div>
    );
  };

  // ---------- team variants ----------
  const renderTeam = () => {
    const variant = v % 3;
    if (variant === 0) {
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-md p-1" style={{ background: i % 2 ? faint : hexToRgba(accent, 0.14) }}>
              <span className="block h-5 w-5 rounded-full" style={{ background: i % 2 ? secondary : accent }} />
              <Line w="62%" color={faint} />
            </div>
          ))}
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="grid h-full grid-cols-3 items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="h-7 w-7 rounded-full" style={{ background: `linear-gradient(135deg, ${i === 1 ? secondary : accent}, ${i === 1 ? accent : secondary})` }} />
              <Line w="80%" color={faint} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full" style={{ background: i === 1 ? secondary : accent }} />
            <div className="flex-1"><Line /><Line w="48%" color={faint} /></div>
          </div>
        ))}
      </div>
    );
  };

  // ---------- quote variants ----------
  const renderQuote = () => {
    const variant = v % 3;
    if (variant === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="font-serif text-[30px] leading-none opacity-40">"</div>
          <div className="max-w-[84%] text-[9px] font-black italic leading-tight">{title}</div>
          <Line w="24%" color={accent} />
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="flex h-full items-center gap-2">
          <span className="block h-full w-1 rounded-full" style={{ background: accent }} />
          <div className="space-y-1">
            <div className="text-[9px] font-black italic leading-tight">{title}</div>
            <Line w="38%" color={faint} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="font-serif text-[42px] leading-[0.6]" style={{ color: accent }}>"</div>
        <div className="text-[9px] font-black italic leading-tight">{title}</div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: secondary }} />
          <Line w="32%" color={faint} />
        </div>
      </div>
    );
  };

  // ---------- stat-hero variants ----------
  const renderStatHero = () => {
    const variant = v % 3;
    const values = ['87%', '3.2×', '$48M'];
    const value = values[v % values.length];
    if (variant === 0) {
      return (
        <div className="flex h-full flex-col justify-center">
          <div className="text-[32px] font-black leading-none" style={{ color: accent }}>{value}</div>
          <Line w="58%" /><Line w="38%" color={faint} />
        </div>
      );
    }
    if (variant === 1) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="relative h-[80%] aspect-square rounded-full" style={{ background: `conic-gradient(${accent} 0 72%, ${hexToRgba(textColor, 0.2)} 72% 100%)` }}>
            <div className="absolute inset-[18%] flex items-center justify-center rounded-full text-[10px] font-black" style={{ background: template.palette.bg, color: accent }}>{value}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="text-[26px] font-black leading-none" style={{ color: accent }}>{value}</div>
        <div className="mt-1 h-[2px] w-10 rounded-full" style={{ background: secondary }} />
        <div className="mt-1 text-[6px] font-black uppercase opacity-70">vs last cycle</div>
      </div>
    );
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border shadow-2xl"
      style={{ background: miniBgFor(kind, template), color: textColor, borderColor: hexToRgba(textColor, 0.18) }}
    >
      <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${hexToRgba(template.palette.bg, 0.28)})` }} />
      <div className={cn('relative h-full w-full', compact ? 'p-2' : 'p-3')}>
        {kind === 'title' && (
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between"><Line w="22%" color={accent} /><span className="h-3 w-8 rounded-full" style={{ background: faint }} /></div>
            <div className="space-y-1"><div className="text-[10px] font-black leading-none">{title}</div><Line w="56%" /><Line w="38%" color={faint} /></div>
            <div className="flex justify-end gap-1"><span className="h-4 w-4 rounded-full" style={{ border: `2px solid ${accent}` }} /><span className="h-4 w-10 rounded-full" style={{ background: faint }} /></div>
          </div>
        )}

        {kind === 'editorial' && (
          <div className="grid h-full grid-cols-[1fr_0.72fr] gap-2">
            <div className="space-y-2"><Line w="26%" color={accent} /><div className="text-[11px] font-black leading-none">{title}</div><Line /><Line w="52%" color={faint} /></div>
            <div className="rounded-md" style={{ background: `linear-gradient(145deg, ${hexToRgba(accent, 0.24)}, ${hexToRgba(secondary, 0.12)})` }} />
          </div>
        )}

        {kind === 'columns' && renderColumns()}

        {kind === 'image-split' && (
          <div className="grid h-full grid-cols-[0.48fr_0.52fr]"><div className="rounded-md" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.6)}, ${hexToRgba(secondary, 0.32)}), repeating-linear-gradient(45deg, ${faint} 0 4px, transparent 4px 10px)` }} /><div className="space-y-2 p-2"><div className="text-[9px] font-black leading-none">{title}</div><Line /><Line w="62%" color={faint} /><Line w="44%" color={faint} /></div></div>
        )}

        {kind === 'quote' && renderQuote()}

        {kind === 'stats' && renderStats()}

        {kind === 'stat-hero' && renderStatHero()}

        {kind === 'closing' && (
          <div className="flex h-full flex-col items-center justify-center text-center"><div className="text-[14px] font-black leading-none">THANK YOU</div><div className="mt-2 rounded-full px-3 py-1 text-[7px] font-black" style={{ background: accent, color: template.palette.bg }}>CTA</div></div>
        )}

        {kind === 'section' && (
          <div className="flex h-full flex-col justify-end"><div className="absolute right-0 top-0 h-full w-1/2 skew-x-[-18deg]" style={{ background: hexToRgba(accent, 0.22) }} /><Line w="32%" color={accent} /><div className="mt-1 text-[13px] font-black leading-none">SECTION</div></div>
        )}

        {kind === 'bullet' && renderBullet()}

        {kind === 'team' && renderTeam()}

        {kind === 'comparison' && renderComparison()}

        {kind === 'full-bleed' && (
          <div className="flex h-full items-end"><div className="w-full rounded-md p-2" style={{ background: 'rgba(0,0,0,0.58)' }}><div className="text-[10px] font-black leading-none">Full Bleed</div><Line w="42%" color={accent} /></div></div>
        )}

        {kind === 'webinar-title' && (
          <div className="flex h-full flex-col items-center justify-center text-center"><div className="mb-2 rounded-full px-2 py-0.5 text-[6px] font-black" style={{ color: accent, border: `1px solid ${hexToRgba(textColor, 0.28)}` }}>LIVE WEBINAR</div><div className="text-[11px] font-black leading-none">{title}</div><Line w="34%" color={accent} /></div>
        )}

        {kind === 'agenda' && renderAgenda()}

        {kind === 'speaker' && (
          <div className="grid h-full grid-cols-[0.38fr_0.62fr] gap-2"><div className="rounded-md" style={{ background: `linear-gradient(135deg, ${accent}, ${secondary})` }} /><div className="space-y-1.5"><div className="text-[9px] font-black">Speaker</div><Line /><Line w="62%" color={accent} /><Line w="78%" color={faint} /><Line w="54%" color={faint} /></div></div>
        )}

        {kind === 'qa' && (
          <div className="flex h-full flex-col items-center justify-center text-center"><div className="text-[24px] font-black leading-none" style={{ color: accent }}>Q&A</div><div className="mt-2 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-3 w-6 rounded-full" style={{ background: i === 1 ? hexToRgba(secondary, 0.5) : faint }} />)}</div></div>
        )}

        {kind === 'poll' && renderPoll()}

        {kind === 'stream' && (
          <div className="flex h-full items-end"><div className="w-[82%] rounded-md p-2" style={{ background: hexToRgba(template.palette.bg, 0.72), borderLeft: `4px solid ${accent}` }}><div className="text-[9px] font-black">On-screen lower third</div><Line w="52%" color={faint} /></div></div>
        )}

        {kind === 'chart' && renderChart()}

        {kind === 'process' && renderProcess()}
      </div>
    </div>
  );
};

const DeckPreviewVisual = ({ t, kind }: { t: DeckTemplate; kind: PreviewKind }) => {
  const arrangement = arrangementFor(kind, t);
  const hash = hashFor(t.id);
  // miniDeckFor now derives followers per-template, so no rotation needed
  const deck = miniDeckFor(kind, t);

  if (arrangement === 'mosaic') {
    return (
      <div className="pointer-events-none absolute right-4 top-4 grid h-[42%] w-[50%] grid-cols-2 gap-1.5">
        {[...deck, 'title' as PreviewKind].slice(0, 4).map((slideKind, i) => <MiniSlide key={`${slideKind}-${i}`} kind={slideKind} template={t} compact />)}
      </div>
    );
  }

  if (arrangement === 'hero') {
    return (
      <div className="pointer-events-none absolute right-4 top-4 h-[38%] w-[56%]">
        <div className="absolute right-0 top-0 aspect-video w-full overflow-hidden rounded-lg transition-transform duration-300 group-hover:-translate-y-1">
          <MiniSlide kind={deck[0]} template={t} />
        </div>
        <div className="absolute -bottom-5 left-2 aspect-video w-[44%] overflow-hidden rounded-md opacity-85 shadow-xl">
          <MiniSlide kind={deck[1]} template={t} compact />
        </div>
      </div>
    );
  }

  if (arrangement === 'vertical') {
    return (
      <div className="pointer-events-none absolute right-4 top-4 flex h-[50%] w-[45%] flex-col gap-1.5">
        {deck.map((slideKind, i) => (
          <div key={`${slideKind}-${i}`} className="min-h-0 flex-1" style={{ transform: `translateX(${i * -8}px)` }}>
            <MiniSlide kind={slideKind} template={t} compact />
          </div>
        ))}
      </div>
    );
  }

  if (arrangement === 'rail') {
    return (
      <div className="pointer-events-none absolute right-4 top-4 h-[52%] w-[50%]">
        <div className="absolute right-0 top-0 aspect-video w-[82%] overflow-hidden rounded-lg shadow-2xl">
          <MiniSlide kind={deck[0]} template={t} />
        </div>
        <div className="absolute bottom-0 left-0 grid w-[74%] grid-cols-2 gap-1.5">
          {deck.slice(1).map((slideKind, i) => <MiniSlide key={`${slideKind}-${i}`} kind={slideKind} template={t} compact />)}
        </div>
      </div>
    );
  }

  const backRot = hash % 2 ? 8 : -8;
  const midRot = hash % 3 ? -5 : 5;
  return (
    <div className="pointer-events-none absolute right-4 top-4 h-[58%] w-[52%]">
      <div className="absolute right-[-2%] top-[-4%] aspect-video w-[70%] overflow-hidden rounded-md opacity-55 shadow-xl" style={{ transform: `rotate(${backRot}deg)` }}>
        <MiniSlide kind={deck[2]} template={t} compact />
      </div>
      <div className="absolute right-[8%] top-[7%] aspect-video w-[78%] overflow-hidden rounded-md opacity-90 shadow-2xl" style={{ transform: `rotate(${midRot}deg)` }}>
        <MiniSlide kind={deck[1]} template={t} compact />
      </div>
      <div className="absolute right-[2%] top-[20%] aspect-video w-[88%] overflow-hidden rounded-md shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
        <MiniSlide kind={deck[0]} template={t} />
      </div>
    </div>
  );
};

const featureIconsFor = (kind: PreviewKind): Array<{ Icon: IconComponent; colorKey: 'accent' | 'secondary' | 'text' }> => {
  const map: Partial<Record<PreviewKind, Array<{ Icon: IconComponent; colorKey: 'accent' | 'secondary' | 'text' }>>> = {
    stats: [{ Icon: Hash, colorKey: 'accent' }, { Icon: BarChart3, colorKey: 'secondary' }, { Icon: PieChart, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    'stat-hero': [{ Icon: Hash, colorKey: 'accent' }, { Icon: BarChart3, colorKey: 'text' }, { Icon: PieChart, colorKey: 'secondary' }, { Icon: Layers3, colorKey: 'accent' }],
    quote: [{ Icon: Quote, colorKey: 'accent' }, { Icon: MessageCircle, colorKey: 'secondary' }, { Icon: Sparkles, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    agenda: [{ Icon: CalendarDays, colorKey: 'accent' }, { Icon: ListChecks, colorKey: 'secondary' }, { Icon: Timer, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    speaker: [{ Icon: Mic2, colorKey: 'accent' }, { Icon: Users, colorKey: 'secondary' }, { Icon: Quote, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    team: [{ Icon: Users, colorKey: 'accent' }, { Icon: Mic2, colorKey: 'secondary' }, { Icon: Quote, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    'image-split': [{ Icon: ImageIcon, colorKey: 'accent' }, { Icon: Presentation, colorKey: 'secondary' }, { Icon: Quote, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    'full-bleed': [{ Icon: ImageIcon, colorKey: 'accent' }, { Icon: Sparkles, colorKey: 'secondary' }, { Icon: Presentation, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    poll: [{ Icon: BarChart3, colorKey: 'accent' }, { Icon: MessageCircle, colorKey: 'secondary' }, { Icon: ListChecks, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
    qa: [{ Icon: MessageCircle, colorKey: 'accent' }, { Icon: Quote, colorKey: 'secondary' }, { Icon: Mic2, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }],
  };
  return map[kind] || [{ Icon: BarChart3, colorKey: 'accent' }, { Icon: Quote, colorKey: 'secondary' }, { Icon: CalendarDays, colorKey: 'text' }, { Icon: Layers3, colorKey: 'accent' }];
};



export interface TemplatePosterPreviewProps {
  template: DeckTemplate;
  selected?: boolean;
  disabled?: boolean;
  saved?: boolean;
  shared?: boolean;
  dense?: boolean;
  onClick?: () => void;
}

export const TemplatePosterPreview: React.FC<TemplatePosterPreviewProps> = ({ template, selected, disabled, saved, shared, dense, onClick }) => {
  const light = isLight(template.palette.bg);
  const kind = kindFor(template);
  const surface = surfaceFor(template, light, kind);
  const icons = featureIconsFor(kind);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-[32px] border text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        dense ? 'min-h-[220px]' : 'min-h-[310px]',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border/70 hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      style={{ color: template.palette.text }}
    >
      <div className="absolute inset-0" style={{ background: surface.base }} />
      <div className="absolute inset-0 opacity-85" style={{ background: surface.pattern }} />
      <DeckPreviewVisual t={template} kind={kind} />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex max-w-[75%] flex-wrap gap-2">
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.bg}70` }}>{badgeFor(template)}</span>
            {saved && <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.accent}33` }}>Saved</span>}
            {shared && <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.secondary}33` }}>Shared</span>}
          </div>
          {selected && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"><Check className="h-4 w-4" /></span>}
        </div>

        <div className={cn('max-w-[72%]', dense ? 'pt-10' : 'pt-24')}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1 w-14 rounded-full" style={{ background: template.palette.accent }} />
            <Sparkles className="h-4 w-4 opacity-70" />
          </div>
          <h3 className={cn('font-black leading-[0.92] tracking-tight drop-shadow-sm', dense ? 'text-xl' : 'text-3xl')}>{template.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm font-semibold opacity-80">{template.description || 'Prebuilt PowerPoint system'}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-5">
          {icons.map(({ Icon, colorKey }, index) => {
            const color = template.palette[colorKey];
            return (
              <div key={`${colorKey}-${index}`} className="rounded-2xl border p-2 backdrop-blur-md" style={{ borderColor: `${template.palette.text}22`, background: hexToRgba(template.palette.bg, light ? 0.48 : 0.36) }}>
                <Icon className="h-4 w-4" />
                <div className="mt-2 h-1 rounded-full" style={{ background: color }} />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold opacity-85">
          <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Full deck system</span>
          <span className="flex gap-1.5">{[template.palette.accent, template.palette.secondary, template.palette.text].map((color) => <span key={color} className="h-4 w-4 rounded-full border" style={{ background: color, borderColor: `${template.palette.text}44` }} />)}</span>
        </div>
      </div>
    </button>
  );
};
