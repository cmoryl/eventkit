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
import { getCorporateDeckRef } from './corporateDeckPreviews';
import { CorporateDeckLiveThumb } from './CorporateDeckLiveThumb';

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

export type PreviewKind =
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

type PreviewArrangement = 'fan' | 'mosaic' | 'hero' | 'vertical' | 'rail' | 'split-stage' | 'contact-sheet' | 'cascade';
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

const ALL_ARRANGEMENTS: PreviewArrangement[] = ['fan', 'mosaic', 'hero', 'vertical', 'rail', 'split-stage', 'contact-sheet', 'cascade'];

const arrangementFor = (kind: PreviewKind, template: DeckTemplate): PreviewArrangement => {
  // Hash drives arrangement so visually-similar kinds still get different stacks
  const h = hashFor(`${template.id}//${kind}`);
  // Bias: some kinds have a clearly best arrangement, but still allow variation
  const bias: Partial<Record<PreviewKind, PreviewArrangement[]>> = {
    stats: ['mosaic', 'rail', 'split-stage', 'contact-sheet'],
    team: ['mosaic', 'rail', 'contact-sheet'],
    comparison: ['mosaic', 'hero', 'split-stage'],
    poll: ['mosaic', 'vertical', 'cascade'],
    section: ['hero', 'fan', 'split-stage'],
    'full-bleed': ['hero', 'rail', 'cascade'],
    closing: ['hero', 'fan', 'contact-sheet'],
    'webinar-title': ['hero', 'vertical', 'split-stage'],
    stream: ['hero', 'rail', 'cascade'],
    agenda: ['vertical', 'rail', 'contact-sheet'],
    speaker: ['vertical', 'hero', 'split-stage'],
    qa: ['vertical', 'fan', 'cascade'],
    bullet: ['rail', 'vertical', 'contact-sheet'],
    columns: ['rail', 'mosaic', 'split-stage'],
    'image-split': ['rail', 'hero', 'cascade'],
    editorial: ['rail', 'fan', 'contact-sheet'],
    chart: ['mosaic', 'fan', 'split-stage', 'cascade'],
    process: ['rail', 'fan', 'contact-sheet'],
    quote: ['hero', 'fan', 'split-stage'],
    'stat-hero': ['hero', 'mosaic', 'cascade'],
    title: ['fan', 'hero', 'split-stage'],
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

const surfaceFor = (template: DeckTemplate, light: boolean, kind: PreviewKind, look: DeckLookId) => {
  const bg = template.backgroundCss && template.backgroundCss !== 'transparent' ? template.backgroundCss : template.palette.bg;
  const base = bg.includes('gradient')
    ? bg
    : `linear-gradient(145deg, ${template.palette.bg} 0%, ${hexToRgba(template.palette.accent, light ? 0.14 : 0.2)} 58%, ${template.palette.secondary} 100%)`;

  const lookPattern: Partial<Record<DeckLookId, string>> = {
    'orbital-intelligence': `radial-gradient(circle at 72% 24%, ${hexToRgba(template.palette.accent, 0.5)}, transparent 20%), radial-gradient(circle at 62% 58%, ${hexToRgba(template.palette.secondary, 0.24)} 0 18%, transparent 19%), repeating-radial-gradient(circle at 65% 52%, transparent 0 34px, ${hexToRgba(template.palette.accent, 0.18)} 35px 36px), radial-gradient(${hexToRgba(template.palette.text, 0.2)} 1px, transparent 1.4px) 0 0 / 18px 18px`,
    'terminal-grid': `linear-gradient(90deg, ${hexToRgba(template.palette.accent, 0.2)} 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(0deg, ${hexToRgba(template.palette.accent, 0.14)} 1px, transparent 1px) 0 0 / 28px 28px, repeating-linear-gradient(90deg, transparent 0 54px, ${hexToRgba(template.palette.accent, 0.16)} 54px 56px)`,
    'editorial-atlas': `linear-gradient(90deg, transparent 0 15%, ${hexToRgba(template.palette.text, 0.16)} 15% calc(15% + 1px), transparent calc(15% + 1px) 100%), repeating-linear-gradient(0deg, transparent 0 24px, ${hexToRgba(template.palette.text, 0.07)} 24px 25px)`,
    'boardroom-ledger': `linear-gradient(90deg, ${hexToRgba(template.palette.accent, 0.18)} 0 1px, transparent 1px 100%) 0 0 / 56px 56px, linear-gradient(0deg, ${hexToRgba(template.palette.text, 0.08)} 0 1px, transparent 1px 100%) 0 0 / 56px 28px, linear-gradient(135deg, transparent 0 68%, ${hexToRgba(template.palette.accent, 0.18)} 68% 100%)`,
    'startup-collage': `radial-gradient(circle at 18% 24%, ${hexToRgba(template.palette.accent, 0.38)} 0 7%, transparent 7.5%), radial-gradient(circle at 82% 20%, ${hexToRgba(template.palette.secondary, 0.32)} 0 9%, transparent 9.5%), linear-gradient(135deg, transparent 0 42%, ${hexToRgba(template.palette.accent, 0.22)} 42% 54%, transparent 54% 100%), repeating-linear-gradient(-12deg, transparent 0 34px, ${hexToRgba(template.palette.text, 0.08)} 34px 36px)`,
    'organic-fieldnotes': `radial-gradient(ellipse at 18% 88%, ${hexToRgba(template.palette.secondary, 0.34)}, transparent 42%), radial-gradient(ellipse at 82% 12%, ${hexToRgba(template.palette.accent, 0.28)}, transparent 38%), repeating-linear-gradient(102deg, transparent 0 34px, ${hexToRgba(template.palette.text, 0.07)} 35px 36px)`,
    'brutalist-poster': `linear-gradient(90deg, ${hexToRgba(template.palette.text, 0.82)} 0 12px, transparent 12px 100%), linear-gradient(0deg, ${hexToRgba(template.palette.accent, 0.5)} 0 18px, transparent 18px 100%), repeating-linear-gradient(45deg, transparent 0 20px, ${hexToRgba(template.palette.text, 0.11)} 20px 22px)`,
    'broadcast-control': `linear-gradient(90deg, transparent 0 10%, ${hexToRgba(template.palette.accent, 0.18)} 10% 10.5%, transparent 10.5% 100%), repeating-linear-gradient(90deg, ${hexToRgba(template.palette.text, 0.06)} 0 1px, transparent 1px 18px), radial-gradient(circle at 88% 14%, ${hexToRgba(template.palette.accent, 0.34)}, transparent 22%)`,
    'data-observatory': `radial-gradient(circle at 64% 48%, ${hexToRgba(template.palette.accent, 0.28)} 0 11%, transparent 12%), repeating-radial-gradient(circle at 64% 48%, transparent 0 30px, ${hexToRgba(template.palette.accent, 0.18)} 31px 32px), radial-gradient(${hexToRgba(template.palette.text, 0.18)} 1px, transparent 1.5px) 0 0 / 16px 16px`,
    'cinematic-storyboard': `linear-gradient(90deg, ${hexToRgba('#000000', 0.42)} 0 8%, transparent 8% 92%, ${hexToRgba('#000000', 0.42)} 92% 100%), repeating-linear-gradient(90deg, transparent 0 26px, ${hexToRgba(template.palette.text, 0.12)} 26px 28px), linear-gradient(180deg, ${hexToRgba('#000000', 0.12)}, transparent 32%, ${hexToRgba('#000000', 0.28)})`,
    'literary-monograph': `linear-gradient(90deg, transparent 0 22%, ${hexToRgba(template.palette.accent, 0.5)} 22% calc(22% + 2px), transparent calc(22% + 2px) 100%), repeating-linear-gradient(0deg, transparent 0 20px, ${hexToRgba(template.palette.text, 0.08)} 20px 21px)`,
    'systems-blueprint': `linear-gradient(90deg, ${hexToRgba(template.palette.accent, 0.14)} 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(0deg, ${hexToRgba(template.palette.accent, 0.14)} 1px, transparent 1px) 0 0 / 22px 22px, repeating-linear-gradient(135deg, transparent 0 36px, ${hexToRgba(template.palette.text, 0.07)} 36px 37px)`,
  };

  if (lookPattern[look]) return { base, pattern: lookPattern[look]! };

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

const miniBgFor = (kind: PreviewKind, template: DeckTemplate, look: DeckLookId) => {
  if (look === 'brutalist-poster') return `linear-gradient(135deg, ${template.palette.bg} 0 58%, ${template.palette.accent} 58% 74%, ${template.palette.bg} 74%), repeating-linear-gradient(90deg, ${hexToRgba(template.palette.text, 0.16)} 0 2px, transparent 2px 18px)`;
  if (look === 'editorial-atlas' || look === 'literary-monograph') return `linear-gradient(90deg, ${template.palette.bg} 0 68%, ${hexToRgba(template.palette.secondary, 0.18)} 68% 100%), repeating-linear-gradient(0deg, transparent 0 18px, ${hexToRgba(template.palette.text, 0.07)} 18px 19px)`;
  if (look === 'terminal-grid' || look === 'systems-blueprint') return `linear-gradient(135deg, ${template.palette.bg}, ${hexToRgba(template.palette.secondary, 0.55)}), linear-gradient(90deg, ${hexToRgba(template.palette.accent, 0.2)} 1px, transparent 1px) 0 0 / 18px 18px, linear-gradient(0deg, ${hexToRgba(template.palette.accent, 0.16)} 1px, transparent 1px) 0 0 / 18px 18px`;
  if (look === 'startup-collage') return `radial-gradient(circle at 18% 18%, ${hexToRgba(template.palette.accent, 0.44)}, transparent 26%), radial-gradient(circle at 86% 74%, ${hexToRgba(template.palette.secondary, 0.36)}, transparent 30%), ${template.palette.bg}`;
  if (look === 'organic-fieldnotes') return `radial-gradient(ellipse at 12% 88%, ${hexToRgba(template.palette.secondary, 0.34)}, transparent 42%), linear-gradient(135deg, ${template.palette.bg}, ${hexToRgba(template.palette.accent, 0.16)})`;
  if (look === 'broadcast-control') return `linear-gradient(90deg, ${hexToRgba(template.palette.bg, 0.96)} 0 62%, ${hexToRgba(template.palette.accent, 0.18)} 62% 100%), repeating-linear-gradient(90deg, ${hexToRgba(template.palette.text, 0.08)} 0 1px, transparent 1px 14px)`;
  if (look === 'data-observatory' || look === 'orbital-intelligence') return `radial-gradient(circle at 50% 54%, ${hexToRgba(template.palette.accent, 0.34)}, transparent 30%), repeating-radial-gradient(circle at 50% 54%, transparent 0 24px, ${hexToRgba(template.palette.accent, 0.18)} 25px 26px), ${template.palette.bg}`;
  if (look === 'cinematic-storyboard') return `linear-gradient(90deg, ${hexToRgba('#000000', 0.42)} 0 10%, transparent 10% 90%, ${hexToRgba('#000000', 0.42)} 90% 100%), linear-gradient(135deg, ${template.palette.bg}, ${hexToRgba(template.palette.secondary, 0.55)})`;
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

// Per-template graphic STYLE profile — applied across every data-graphic
// renderer (bars, lines, donuts, stats, poll, stat-hero) so the aesthetic
// of charts varies template-to-template, not just the chart type.
type ChartStyleId = 'flat' | 'pill' | 'outline' | 'gradient' | 'hatched' | 'dotted' | 'glow' | 'segmented';
const CHART_STYLES: ChartStyleId[] = ['flat', 'pill', 'outline', 'gradient', 'hatched', 'dotted', 'glow', 'segmented'];
const chartStyleFor = (template: DeckTemplate): ChartStyleId =>
  CHART_STYLES[hashFor(`${template.id}::chart-style`) % CHART_STYLES.length];

export type GraphSystemId =
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

const GRAPH_SYSTEMS: GraphSystemId[] = [
  'orbital-rings',
  'terminal-spark',
  'editorial-lollipop',
  'ledger-waterfall',
  'startup-sticker',
  'fieldnotes-scatter',
  'brutal-blocks',
  'broadcast-vu',
  'observatory-radar',
  'storyboard-frames',
  'monograph-slope',
  'blueprint-node',
  'heatmap-matrix',
  'funnel-stack',
  'treemap-tiles',
  'gantt-roadmap',
  'quadrant-bubbles',
  'radial-bars',
  'candlestick-tape',
  'sankey-ribbons',
];

const FEATURED_GRAPH_SYSTEMS: Record<string, GraphSystemId> = {
  'transperfect-2026': 'orbital-rings',
  'modern-dark': 'terminal-spark',
  'editorial-light': 'editorial-lollipop',
  'corporate-navy': 'ledger-waterfall',
  'vibrant-startup': 'startup-sticker',
  'warm-terracotta': 'fieldnotes-scatter',
  'mono-brutalist': 'brutal-blocks',
  'pres-title-dark': 'observatory-radar',
  'pres-title-light': 'monograph-slope',
  'pres-content-two-column': 'blueprint-node',
  'pres-image-left': 'storyboard-frames',
  'pres-quote-slide': 'editorial-lollipop',
  'pres-stats-grid': 'heatmap-matrix',
  'pres-closing-cta': 'radial-bars',
  'webinar-title-modern': 'broadcast-vu',
  'webinar-agenda-slide': 'gantt-roadmap',
  'webinar-speaker-bio': 'quadrant-bubbles',
  'webinar-qa-slide': 'sankey-ribbons',
  'webinar-poll-slide': 'funnel-stack',
  'stream-lower-third': 'candlestick-tape',
  'stream-starting-soon': 'terminal-spark',
  'stream-brb': 'treemap-tiles',
  'stream-end-screen': 'radial-bars',
  'pres-section-divider': 'brutal-blocks',
  'pres-content-bullet': 'blueprint-node',
  'pres-stat-highlight': 'orbital-rings',
  'pres-team-grid': 'quadrant-bubbles',
  'pres-comparison-2col': 'ledger-waterfall',
  'pres-image-fullbleed': 'storyboard-frames',
  'pres-thank-you': 'monograph-slope',
};

export const graphSystemFor = (template: DeckTemplate, kind: PreviewKind, look: DeckLookId): GraphSystemId => {
  const featured = FEATURED_GRAPH_SYSTEMS[template.id];
  const baseIndex = featured
    ? GRAPH_SYSTEMS.indexOf(featured)
    : hashFor(`${template.id}::${template.name}::${look}::graph-system`) % GRAPH_SYSTEMS.length;
  const kindShift = hashFor(`${template.id}::${template.name}::${template.description || ''}::${kind}::${look}::graph-shift`) % GRAPH_SYSTEMS.length;
  return GRAPH_SYSTEMS[(baseIndex + kindShift) % GRAPH_SYSTEMS.length];
};

export type DeckLookId =
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

export const LOOK_LABELS: Record<DeckLookId, string> = {
  'orbital-intelligence': 'Orbital intelligence',
  'terminal-grid': 'Terminal grid',
  'editorial-atlas': 'Editorial atlas',
  'boardroom-ledger': 'Boardroom ledger',
  'startup-collage': 'Startup collage',
  'organic-fieldnotes': 'Organic fieldnotes',
  'brutalist-poster': 'Brutalist poster',
  'broadcast-control': 'Broadcast control',
  'data-observatory': 'Data observatory',
  'cinematic-storyboard': 'Cinematic storyboard',
  'literary-monograph': 'Literary monograph',
  'systems-blueprint': 'Systems blueprint',
};

const ALL_LOOKS: DeckLookId[] = [
  'orbital-intelligence',
  'terminal-grid',
  'editorial-atlas',
  'boardroom-ledger',
  'startup-collage',
  'organic-fieldnotes',
  'brutalist-poster',
  'broadcast-control',
  'data-observatory',
  'cinematic-storyboard',
  'literary-monograph',
  'systems-blueprint',
];

const TEMPLATE_LOOK_OVERRIDES: Record<string, DeckLookId> = {
  'transperfect-2026': 'orbital-intelligence',
  'modern-dark': 'terminal-grid',
  'editorial-light': 'editorial-atlas',
  'corporate-navy': 'boardroom-ledger',
  'vibrant-startup': 'startup-collage',
  'warm-terracotta': 'organic-fieldnotes',
  'mono-brutalist': 'brutalist-poster',
  'pres-title-dark': 'data-observatory',
  'pres-title-light': 'literary-monograph',
  'pres-content-two-column': 'systems-blueprint',
  'pres-image-left': 'cinematic-storyboard',
  'pres-quote-slide': 'editorial-atlas',
  'pres-stats-grid': 'data-observatory',
  'pres-closing-cta': 'literary-monograph',
  'webinar-title-modern': 'broadcast-control',
  'webinar-agenda-slide': 'systems-blueprint',
  'webinar-speaker-bio': 'cinematic-storyboard',
  'webinar-qa-slide': 'broadcast-control',
  'webinar-poll-slide': 'startup-collage',
  'stream-lower-third': 'broadcast-control',
  'stream-starting-soon': 'terminal-grid',
  'stream-brb': 'brutalist-poster',
  'stream-end-screen': 'cinematic-storyboard',
  'pres-section-divider': 'brutalist-poster',
  'pres-content-bullet': 'systems-blueprint',
  'pres-stat-highlight': 'orbital-intelligence',
  'pres-team-grid': 'organic-fieldnotes',
  'pres-comparison-2col': 'boardroom-ledger',
  'pres-image-fullbleed': 'cinematic-storyboard',
  'pres-thank-you': 'literary-monograph',
};

export const lookFor = (template: DeckTemplate, kind: PreviewKind): DeckLookId => {
  const override = TEMPLATE_LOOK_OVERRIDES[template.id];
  if (override) return override;
  const hay = `${template.id} ${template.name} ${template.description || ''} ${(template.tags || []).join(' ')}`.toLowerCase();
  if (hay.includes('transperfect') || hay.includes('orb') || hay.includes('cosmic')) return 'orbital-intelligence';
  if (hay.includes('modern dark') || hay.includes('tech') || hay.includes('saas') || hay.includes('product')) return 'terminal-grid';
  if (hay.includes('editorial') || hay.includes('magazine') || hay.includes('journal')) return 'editorial-atlas';
  if (hay.includes('corporate') || hay.includes('investor') || hay.includes('finance') || hay.includes('executive')) return 'boardroom-ledger';
  if (hay.includes('startup') || hay.includes('launch') || hay.includes('vibrant') || hay.includes('campaign')) return 'startup-collage';
  if (hay.includes('terracotta') || hay.includes('wellness') || hay.includes('lifestyle') || hay.includes('warm')) return 'organic-fieldnotes';
  if (hay.includes('brutalist') || hay.includes('mono')) return 'brutalist-poster';
  if (hay.includes('webinar') || hay.includes('stream') || hay.includes('lower third') || hay.includes('speaker') || hay.includes('qa')) return 'broadcast-control';
  if (hay.includes('stats') || hay.includes('metrics') || hay.includes('kpi') || kind === 'chart' || kind === 'poll') return 'data-observatory';
  if (hay.includes('image') || hay.includes('full bleed') || hay.includes('photo')) return 'cinematic-storyboard';
  if (hay.includes('quote') || hay.includes('closing') || hay.includes('thank')) return 'literary-monograph';
  if (hay.includes('agenda') || hay.includes('process') || hay.includes('section') || hay.includes('two-column')) return 'systems-blueprint';
  return ALL_LOOKS[hashFor(`${template.id}::look-system`) % ALL_LOOKS.length];
};

const slideFrameStyleFor = (look: DeckLookId, template: DeckTemplate, textColor: string): React.CSSProperties => {
  const border = hexToRgba(textColor, look === 'brutalist-poster' ? 0.72 : 0.22);
  const common: React.CSSProperties = { borderColor: border };
  if (look === 'brutalist-poster') return { ...common, borderWidth: 2, borderRadius: 0, boxShadow: `5px 5px 0 ${template.palette.accent}` };
  if (look === 'editorial-atlas') return { ...common, borderRadius: 1, boxShadow: `0 10px 24px ${hexToRgba('#000000', 0.14)}` };
  if (look === 'startup-collage') return { ...common, borderRadius: 18, boxShadow: `0 12px 0 ${hexToRgba(template.palette.accent, 0.28)}` };
  if (look === 'organic-fieldnotes') return { ...common, borderRadius: 24, boxShadow: `0 16px 32px ${hexToRgba(template.palette.secondary, 0.18)}` };
  if (look === 'terminal-grid') return { ...common, borderRadius: 6, boxShadow: `0 0 0 1px ${hexToRgba(template.palette.accent, 0.25)}, 0 0 24px ${hexToRgba(template.palette.accent, 0.22)}` };
  if (look === 'broadcast-control') return { ...common, borderRadius: 10, boxShadow: `0 0 0 1px ${hexToRgba(template.palette.accent, 0.28)}` };
  if (look === 'data-observatory') return { ...common, borderRadius: 14, boxShadow: `0 0 28px ${hexToRgba(template.palette.accent, 0.22)}` };
  if (look === 'cinematic-storyboard') return { ...common, borderRadius: 4, boxShadow: `0 14px 32px ${hexToRgba('#000000', 0.34)}` };
  if (look === 'literary-monograph') return { ...common, borderRadius: 2, boxShadow: `0 12px 26px ${hexToRgba('#000000', 0.12)}` };
  if (look === 'systems-blueprint') return { ...common, borderRadius: 3, boxShadow: `0 0 0 1px ${hexToRgba(template.palette.accent, 0.22)}` };
  return { ...common, borderRadius: 12, boxShadow: `0 18px 42px ${hexToRgba(template.palette.accent, 0.22)}` };
};

const copyBlockClassFor = (look: DeckLookId, dense?: boolean) => {
  const pad = dense ? 'pt-8' : 'pt-24';
  const map: Partial<Record<DeckLookId, string>> = {
    'orbital-intelligence': `${dense ? 'pt-8' : 'pt-28'} max-w-[60%]`,
    'terminal-grid': `${dense ? 'pt-6' : 'pt-20'} max-w-[58%] uppercase`,
    'editorial-atlas': `${dense ? 'pt-12' : 'pt-32'} max-w-[48%] ml-[8%]`,
    'boardroom-ledger': `${dense ? 'pt-6' : 'pt-20'} max-w-[64%]`,
    'startup-collage': `${dense ? 'pt-14' : 'pt-36'} max-w-[68%] -rotate-1`,
    'organic-fieldnotes': `${dense ? 'pt-10' : 'pt-28'} max-w-[62%]`,
    'brutalist-poster': `${dense ? 'pt-4' : 'pt-12'} max-w-[86%]`,
    'broadcast-control': `${dense ? 'pt-16' : 'pt-36'} max-w-[58%]`,
    'data-observatory': `${dense ? 'pt-10' : 'pt-28'} max-w-[58%]`,
    'cinematic-storyboard': `${dense ? 'pt-16' : 'pt-40'} max-w-[70%]`,
    'literary-monograph': `${dense ? 'pt-12' : 'pt-32'} max-w-[52%] ml-[10%]`,
    'systems-blueprint': `${dense ? 'pt-8' : 'pt-24'} max-w-[60%]`,
  };
  return map[look] || `${pad} max-w-[72%]`;
};

const LookMotif = ({ look, template, textColor }: { look: DeckLookId; template: DeckTemplate; textColor: string }) => {
  const accent = template.palette.accent;
  const secondary = template.palette.secondary;
  const faint = hexToRgba(textColor, 0.2);
  if (look === 'orbital-intelligence' || look === 'data-observatory') {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute right-[-54px] bottom-[-76px] h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${hexToRgba(accent, 0.34)}, transparent 30%), repeating-radial-gradient(circle, transparent 0 30px, ${hexToRgba(look === 'orbital-intelligence' ? secondary : accent, 0.32)} 31px 32px)` }} />
        {[0, 1, 2, 3].map((i) => <span key={i} className="absolute h-2.5 w-2.5 rounded-full" style={{ right: `${34 + i * 43}px`, bottom: `${42 + (i % 2) * 78}px`, background: i % 2 ? secondary : accent, boxShadow: `0 0 14px ${hexToRgba(accent, 0.6)}` }} />)}
      </div>
    );
  }
  if (look === 'terminal-grid' || look === 'systems-blueprint') {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute right-7 top-12 h-28 w-44 border" style={{ borderColor: hexToRgba(accent, 0.36), clipPath: look === 'systems-blueprint' ? 'polygon(0 0, 100% 0, 82% 100%, 0 100%)' : undefined }} />
        <svg className="absolute right-8 top-20 h-24 w-44" viewBox="0 0 180 96" fill="none"><path d="M4 72 L38 40 L70 58 L112 18 L172 42" stroke={accent} strokeWidth="3" strokeLinecap="square"/><path d="M4 88 H172" stroke={faint} strokeWidth="1"/><path d="M24 8 V88M72 8V88M120 8V88M168 8V88" stroke={faint} strokeWidth="1"/></svg>
      </div>
    );
  }
  if (look === 'editorial-atlas' || look === 'literary-monograph') {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[14%] top-0 h-full w-px" style={{ background: hexToRgba(textColor, 0.28) }} />
        <div className="absolute right-8 top-12 h-48 w-32" style={{ background: `linear-gradient(180deg, ${hexToRgba(accent, 0.32)}, ${hexToRgba(secondary, 0.16)})`, border: `1px solid ${hexToRgba(textColor, 0.2)}` }} />
        <div className="absolute right-20 bottom-14 font-serif text-[132px] leading-none opacity-20" style={{ color: accent }}>{look === 'literary-monograph' ? '”' : '§'}</div>
      </div>
    );
  }
  if (look === 'boardroom-ledger') {
    return <div aria-hidden className="absolute inset-y-8 right-8 w-44 border-l border-r" style={{ borderColor: hexToRgba(accent, 0.35), background: `repeating-linear-gradient(0deg, transparent 0 30px, ${hexToRgba(textColor, 0.1)} 30px 31px)` }} />;
  }
  if (look === 'startup-collage') {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute right-10 top-12 h-28 w-36 rotate-6 rounded-2xl" style={{ background: accent }} />
        <div className="absolute right-28 top-28 h-24 w-24 -rotate-12 rounded-full" style={{ background: secondary }} />
        <div className="absolute right-6 bottom-16 h-20 w-44 rotate-[-8deg] rounded-lg border-2" style={{ borderColor: textColor }} />
      </div>
    );
  }
  if (look === 'organic-fieldnotes') {
    return <div aria-hidden className="absolute right-[-40px] top-12 h-56 w-56 rounded-[42%_58%_48%_52%]" style={{ background: `radial-gradient(ellipse at 35% 35%, ${hexToRgba(accent, 0.4)}, ${hexToRgba(secondary, 0.22)} 58%, transparent 60%)` }} />;
  }
  if (look === 'brutalist-poster') {
    return <div aria-hidden className="absolute right-[-18px] top-10 h-44 w-56 rotate-6 border-[10px]" style={{ borderColor: textColor, background: accent }} />;
  }
  if (look === 'broadcast-control') {
    return <div aria-hidden className="absolute right-6 top-10 h-40 w-52 rounded-xl border" style={{ borderColor: hexToRgba(accent, 0.42), background: `linear-gradient(180deg, ${hexToRgba(accent, 0.18)}, transparent)` }} />;
  }
  if (look === 'cinematic-storyboard') {
    return <div aria-hidden className="absolute inset-x-0 top-10 h-12" style={{ background: `repeating-linear-gradient(90deg, ${hexToRgba(textColor, 0.28)} 0 18px, transparent 18px 34px)` }} />;
  }
  return null;
};

const barStyleFor = (
  style: ChartStyleId,
  color: string,
  faintColor: string,
  orientation: 'v' | 'h' = 'v',
): React.CSSProperties => {
  switch (style) {
    case 'pill':
      return { background: color, borderRadius: 999 };
    case 'outline':
      return { background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 2 };
    case 'gradient':
      return { background: `linear-gradient(${orientation === 'v' ? '180deg' : '90deg'}, ${color}, ${hexToRgba(color, 0.35)})`, borderRadius: 3 };
    case 'hatched':
      return { background: `repeating-linear-gradient(45deg, ${color} 0 3px, ${hexToRgba(color, 0.25)} 3px 6px)`, borderRadius: 2 };
    case 'dotted':
      return { background: `repeating-linear-gradient(${orientation === 'v' ? '0deg' : '90deg'}, ${color} 0 2px, transparent 2px 5px)`, borderRadius: 1 };
    case 'glow':
      return { background: color, borderRadius: 3, boxShadow: `0 0 6px ${hexToRgba(color, 0.85)}, 0 0 12px ${hexToRgba(color, 0.45)}` };
    case 'segmented':
      return { background: `repeating-linear-gradient(${orientation === 'v' ? '180deg' : '90deg'}, ${color} 0 6px, ${hexToRgba(faintColor, 0.6)} 6px 8px)`, borderRadius: 2 };
    case 'flat':
    default:
      return { background: color, borderRadius: 0 };
  }
};

export const MiniSlide = ({ kind, template, compact = false, look: forcedLook }: { kind: PreviewKind; template: DeckTemplate; compact?: boolean; look?: DeckLookId }) => {
  const title = shortName(template.name);
  const textColor = ['editorial', 'bullet', 'comparison'].includes(kind) && isLight(template.palette.bg) ? template.palette.text : template.palette.text;
  const lineColor = hexToRgba(textColor, 0.68);
  const faint = hexToRgba(textColor, 0.18);
  const accent = template.palette.accent;
  const secondary = template.palette.secondary;
  const v = variantFor(template, kind);
  const look = forcedLook || lookFor(template, kind);
  const chartStyle = chartStyleFor(template);
  const graphSystem = graphSystemFor(template, kind, look);
  const bar = (color: string, orient: 'v' | 'h' = 'v') => barStyleFor(chartStyle, color, textColor, orient);

  const Line = ({ w = '70%', color = lineColor }: { w?: string; color?: string }) => (
    <span className="block h-[3px] rounded-full" style={{ width: w, background: color }} />
  );

  const renderLookSlide = () => {
    const isData = ['stats', 'stat-hero', 'chart', 'poll', 'comparison'].includes(kind);
    const isPeople = ['team', 'speaker', 'webinar-title', 'qa', 'stream'].includes(kind);

    if (isData) {
      if (look === 'brutalist-poster') {
        return <div className="grid h-full grid-cols-[0.42fr_1fr] gap-1.5"><div className="flex flex-col justify-between border-2 p-1" style={{ borderColor: textColor, background: accent, color: template.palette.bg }}><span className="text-[8px] font-black uppercase">{kind}</span><span className="text-[24px] font-black leading-none">96</span></div><div className="border-2 p-1" style={{ borderColor: textColor }}>{renderChart()}</div></div>;
      }
      if (look === 'editorial-atlas' || look === 'literary-monograph') {
        return <div className="grid h-full grid-cols-[0.24fr_1fr] gap-2"><div className="border-r pr-1 font-serif" style={{ borderColor: hexToRgba(textColor, 0.32) }}><div className="text-[28px] leading-none" style={{ color: accent }}>{look === 'literary-monograph' ? 'Δ' : '04'}</div><div className="mt-1 text-[5px] font-black uppercase tracking-[0.2em] opacity-60">data</div></div><div className="border-b border-l p-1" style={{ borderColor: hexToRgba(textColor, 0.24) }}>{renderChart()}</div></div>;
      }
      if (look === 'startup-collage') {
        return <div className="relative h-full w-full"><div className="absolute left-1 top-0 rounded-xl border-2 px-2 py-1 text-[7px] font-black rotate-[-6deg]" style={{ borderColor: textColor, background: accent, color: template.palette.bg }}>GROWTH</div><div className="absolute bottom-0 right-0 h-[78%] w-[88%] rotate-2 rounded-xl border-2 p-2" style={{ borderColor: textColor, background: hexToRgba(template.palette.bg, 0.84) }}>{renderChart()}</div></div>;
      }
      if (look === 'organic-fieldnotes') {
        return <div className="relative h-full w-full"><div className="absolute inset-0 rounded-[42%_58%_51%_49%]" style={{ background: hexToRgba(secondary, 0.12), border: `1px solid ${hexToRgba(textColor, 0.2)}` }} /><div className="relative h-full p-2">{renderChart()}</div></div>;
      }
      if (look === 'broadcast-control') {
        return <div className="grid h-full grid-rows-[auto_1fr] gap-1"><div className="flex items-center justify-between"><span className="rounded-full px-1.5 py-0.5 text-[6px] font-black" style={{ background: accent, color: template.palette.bg }}>LIVE DATA</span><span className="text-[6px] font-black opacity-60">REC ●</span></div><div className="rounded-lg border p-1" style={{ borderColor: hexToRgba(accent, 0.38), background: hexToRgba(template.palette.bg, 0.72) }}>{renderChart()}</div></div>;
      }
      if (look === 'systems-blueprint' || look === 'terminal-grid') {
        return <div className="grid h-full grid-cols-[0.18fr_1fr] gap-1.5 font-mono"><div className="flex flex-col items-center justify-between border-r py-1 text-[6px] font-black" style={{ borderColor: hexToRgba(accent, 0.3), color: accent }}><span>Y</span><span>0</span><span>X</span></div><div className="border p-1" style={{ borderColor: hexToRgba(accent, 0.34) }}>{renderChart()}</div></div>;
      }
      if (look === 'boardroom-ledger') {
        return <div className="grid h-full grid-rows-[auto_1fr] gap-1.5"><div className="flex justify-between border-b pb-1" style={{ borderColor: hexToRgba(accent, 0.42) }}><span className="text-[8px] font-black">Q4 MODEL</span><span className="text-[6px] opacity-60">AUDITED</span></div>{renderChart()}</div>;
      }
      if (look === 'cinematic-storyboard') {
        return <div className="grid h-full grid-cols-[0.26fr_1fr] gap-1"><div className="grid grid-rows-4 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} style={{ background: i === 1 ? accent : hexToRgba(textColor, 0.22) }} />)}</div><div className="border p-1" style={{ borderColor: hexToRgba(textColor, 0.24) }}>{renderChart()}</div></div>;
      }
      return <div className="h-full w-full rounded-md border p-1.5" style={{ borderColor: faint, background: hexToRgba(textColor, 0.05) }}>{renderChart()}</div>;
    }

    if (look === 'orbital-intelligence' || look === 'data-observatory') {
      return (
        <div className="relative h-full w-full">
          <div className="absolute right-1 top-1 text-[6px] font-black uppercase tracking-[0.18em] opacity-70">{isData ? 'KPI HERO' : 'SYSTEM'}</div>
          {isData ? (
            <div className="h-full w-full rounded-md border p-1.5" style={{ borderColor: faint, background: hexToRgba(textColor, 0.05) }}>{renderChart()}</div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="relative h-[84%] aspect-square rounded-full" style={{ background: `radial-gradient(circle, ${hexToRgba(accent, 0.45)}, transparent 28%), repeating-radial-gradient(circle, transparent 0 15px, ${hexToRgba(secondary, 0.34)} 16px 17px)` }}>
                {[14, 38, 67, 82].map((p, i) => <span key={p} className="absolute h-2 w-2 rounded-full" style={{ left: `${p}%`, top: `${[28, 70, 22, 54][i]}%`, background: i % 2 ? secondary : accent }} />)}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (look === 'terminal-grid') {
      return (
        <div className="relative h-full w-full font-mono uppercase">
          <div className="mb-2 flex items-center gap-1 text-[6px] font-black" style={{ color: accent }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />RUN / {kind}</div>
          <div className="grid h-[76%] grid-cols-[0.7fr_1fr] gap-2">
            <div className="space-y-1 border p-1" style={{ borderColor: faint }}>{['01', '02', '03'].map((n, i) => <div key={n} className="grid grid-cols-[auto_1fr] gap-1 text-[6px]"><span style={{ color: i === 1 ? secondary : accent }}>{n}</span><Line w={`${72 - i * 12}%`} color={faint} /></div>)}</div>
            <div className="relative border p-1" style={{ borderColor: hexToRgba(accent, 0.42) }}>{renderChart()}</div>
          </div>
        </div>
      );
    }

    if (look === 'editorial-atlas' || look === 'literary-monograph') {
      return (
        <div className="grid h-full grid-cols-[0.32fr_1fr] gap-3">
          <div className="border-r pr-2" style={{ borderColor: hexToRgba(textColor, 0.28) }}><div className="font-serif text-[34px] leading-none" style={{ color: accent }}>{look === 'literary-monograph' ? '“' : '03'}</div><div className="mt-2 text-[5px] font-black uppercase tracking-[0.18em] opacity-60">{kind}</div></div>
          <div className="space-y-1.5 self-center"><div className="font-serif text-[13px] font-bold leading-[0.95]">{title}</div><Line w="78%" /><Line w="52%" color={faint} /><div className="mt-2 grid grid-cols-2 gap-1.5"><span className="h-8" style={{ background: hexToRgba(accent, 0.2) }} /><span className="h-8" style={{ background: hexToRgba(secondary, 0.16) }} /></div></div>
        </div>
      );
    }

    if (look === 'boardroom-ledger') {
      return (
        <div className="h-full w-full">
          <div className="mb-2 flex items-end justify-between border-b pb-1" style={{ borderColor: hexToRgba(accent, 0.45) }}><span className="text-[10px] font-black">{isData ? 'Q4' : 'Brief'}</span><span className="text-[6px] font-bold opacity-60">{kind}</span></div>
          <div className="h-[70%]">{isData ? renderChart() : [72, 54, 88].map((h, i) => <div key={i} className="inline-flex h-full w-1/3 flex-col justify-end border-l pl-1" style={{ borderColor: faint }}><span className="block" style={{ height: `${h}%`, ...bar(i === 2 ? accent : hexToRgba(textColor, 0.35), 'v') }} /><span className="mt-1 text-[6px] font-black">0{i + 1}</span></div>)}</div>
        </div>
      );
    }

    if (look === 'startup-collage') {
      return (
        <div className="relative h-full w-full">
          <div className="absolute left-0 top-2 h-12 w-16 -rotate-6 rounded-xl" style={{ background: hexToRgba(accent, 0.78) }} />
          <div className="absolute right-1 top-0 h-10 w-10 rounded-full" style={{ background: hexToRgba(secondary, 0.78) }} />
          <div className="absolute bottom-1 left-2 right-2 rotate-2 rounded-lg border-2 p-2" style={{ borderColor: textColor, background: hexToRgba(template.palette.bg, 0.72) }}><div className="text-[11px] font-black leading-none">{title}</div><Line w="46%" color={accent} /></div>
        </div>
      );
    }

    if (look === 'organic-fieldnotes') {
      return (
        <div className="relative h-full w-full">
          <div className="absolute right-0 top-1 h-16 w-20 rounded-[48%_52%_60%_40%]" style={{ background: hexToRgba(secondary, 0.38) }} />
          <div className="relative space-y-2 pt-2"><div className="text-[9px] font-black uppercase tracking-wide">{kind}</div>{[0, 1, 2].map((i) => <div key={i} className="flex items-center gap-2"><span className="h-3 w-3 rounded-[45%_55%_60%_40%]" style={{ background: i === 1 ? secondary : accent }} /><Line w={`${70 - i * 12}%`} color={i === 0 ? lineColor : faint} /></div>)}</div>
        </div>
      );
    }

    if (look === 'brutalist-poster') {
      return (
        <div className="relative h-full w-full p-0">
          <div className="absolute left-0 top-0 px-1 text-[7px] font-black uppercase" style={{ background: textColor, color: template.palette.bg }}>{kind}</div>
          <div className="absolute right-0 top-4 h-10 w-12" style={{ background: accent }} />
          <div className="absolute bottom-0 left-0 right-0 text-[24px] font-black uppercase leading-[0.8] tracking-normal">{isData ? '96' : shortName(title).slice(0, 8)}</div>
        </div>
      );
    }

    if (look === 'broadcast-control') {
      return (
        <div className="relative h-full w-full">
          <div className="absolute left-0 top-0 rounded-full px-1.5 py-0.5 text-[6px] font-black uppercase" style={{ background: accent, color: template.palette.bg }}>{isPeople ? 'LIVE' : 'CTRL'}</div>
          <div className="absolute bottom-1 left-0 right-0 rounded-lg border p-1.5" style={{ borderColor: hexToRgba(textColor, 0.24), background: hexToRgba(template.palette.bg, 0.78) }}><div className="text-[9px] font-black">{isPeople ? 'Speaker lower third' : title}</div><div className="mt-1 h-9">{isData ? renderChart() : <div className="flex h-full items-end gap-1">{[44, 72, 55, 86].map((h, i) => <span key={i} className="w-full" style={{ height: `${h}%`, ...bar(i === 3 ? accent : faint, 'v') }} />)}</div>}</div></div>
        </div>
      );
    }

    if (look === 'cinematic-storyboard') {
      return (
        <div className="grid h-full grid-cols-[1fr_0.55fr] gap-1.5">
          <div style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.46)}, ${hexToRgba(secondary, 0.28)})` }} />
          <div className="space-y-1"><span className="block h-5" style={{ background: faint }} /><div className="text-[8px] font-black leading-tight">{title}</div><Line w="60%" color={accent} /></div>
        </div>
      );
    }

    if (look === 'systems-blueprint') {
      return (
        <div className="relative h-full w-full">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 70" fill="none"><path d="M16 18 H48 V48 H86" stroke={accent} strokeWidth="1.5"/><path d="M48 18 L88 14 L104 44" stroke={secondary} strokeWidth="1.2"/><circle cx="16" cy="18" r="5" fill={accent}/><circle cx="48" cy="48" r="5" fill={secondary}/><circle cx="104" cy="44" r="6" fill={accent}/></svg>
          <div className="absolute left-1 bottom-1 text-[7px] font-black uppercase tracking-wide">{kind}</div>
        </div>
      );
    }

    return null;
  };
  // ---------- chart variants ----------
  const renderChart = () => {
    const strokeDash = chartStyle === 'dotted' ? '1 3' : chartStyle === 'segmented' ? '5 3' : chartStyle === 'hatched' ? '2 2' : undefined;
    const glow = chartStyle === 'glow' ? `drop-shadow(0 0 3px ${accent})` : undefined;
    const softPanel: React.CSSProperties = { background: hexToRgba(textColor, 0.06), border: `1px solid ${hexToRgba(textColor, 0.18)}` };
    const seed = variantFor(template, kind, graphSystem);
    const metric = (i: number, min = 18, span = 74) => min + ((seed >>> (i % 16)) + i * 23) % span;
    const miniSeries = Array.from({ length: 8 }, (_, i) => metric(i, 16, 78));
    const xy = (i: number) => [12 + ((seed + i * 19) % 76), 12 + (((seed >> 3) + i * 31) % 48)] as const;
    const pathFrom = (vals: number[], w = 100, h = 60) => vals.map((n, i) => `${i ? 'L' : 'M'}${(i / Math.max(vals.length - 1, 1)) * w} ${h - (n / 100) * h}`).join(' ');

    switch (graphSystem) {
      case 'orbital-rings': {
        const orbitNodes = Array.from({ length: 5 }, (_, i) => ({ left: 14 + metric(i, 0, 72), top: 18 + metric(i + 4, 0, 58) }));
        return (
          <div className="relative h-full w-full">
            <div className="absolute left-1 top-1 text-[6px] font-black uppercase tracking-[0.14em] opacity-70">Orbit</div>
            <div className="absolute inset-2 rounded-full" style={{ background: `radial-gradient(circle at ${44 + metric(1, 0, 24)}% ${38 + metric(2, 0, 20)}%, ${hexToRgba(accent, 0.42)} 0 11%, transparent 12%), repeating-radial-gradient(circle, transparent 0 ${10 + metric(3, 0, 8)}px, ${hexToRgba(secondary, 0.42)} ${11 + metric(3, 0, 8)}px ${12 + metric(3, 0, 8)}px)` }} />
            {orbitNodes.map((p, i) => <span key={`${p.left}-${p.top}`} className="absolute h-2.5 w-2.5 rounded-full" style={{ left: `${p.left}%`, top: `${p.top}%`, background: i % 2 ? secondary : accent, boxShadow: `0 0 10px ${hexToRgba(i % 2 ? secondary : accent, 0.8)}` }} />)}
          </div>
        );
      }
      case 'terminal-spark':
        return (
          <div className="grid h-full grid-cols-[0.28fr_1fr] gap-1.5 font-mono">
            <div className="flex flex-col justify-between border-r pr-1 text-[6px]" style={{ borderColor: hexToRgba(accent, 0.36), color: accent }}>{['>', '02', 'Δ', 'OK'].map((n) => <span key={n}>{n}</span>)}</div>
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full" style={{ filter: glow }}>
              <path d="M0 48 H100 M0 30 H100 M0 12 H100 M20 0 V60 M45 0 V60 M70 0 V60" stroke={hexToRgba(accent, 0.16)} strokeWidth="1" />
              <path d={pathFrom(miniSeries, 100, 56)} fill="none" stroke={accent} strokeWidth="2.4" strokeDasharray={strokeDash} strokeLinecap="square" />
              {miniSeries.filter((_, i) => i % 2 === 1).map((n, i) => <rect key={i} x={((i * 2 + 1) / 7) * 100 - 1.5} y={56 - (n / 100) * 56 - 2} width="3" height="6" fill={i === 1 ? secondary : accent} />)}
            </svg>
          </div>
        );
      case 'editorial-lollipop':
        return (
          <div className="grid h-full grid-cols-5 items-end gap-2 border-b" style={{ borderColor: hexToRgba(textColor, 0.32) }}>
            {miniSeries.slice(0, 5).map((h, i) => <div key={i} className="flex h-full flex-col items-center justify-end gap-1"><span className="h-3 w-3 rounded-full border" style={{ background: h === Math.max(...miniSeries.slice(0, 5)) ? accent : template.palette.bg, borderColor: h === Math.max(...miniSeries.slice(0, 5)) ? accent : textColor }} /><span className="w-px" style={{ height: `${h}%`, background: h === Math.max(...miniSeries.slice(0, 5)) ? accent : hexToRgba(textColor, 0.45) }} /><span className="font-serif text-[6px]">{i + 1}</span></div>)}
          </div>
        );
      case 'ledger-waterfall':
        return (
          <div className="relative flex h-full items-end gap-1.5 border-b border-l p-1" style={{ borderColor: hexToRgba(textColor, 0.26) }}>
            {miniSeries.slice(0, 5).map((height, i) => <div key={i} className="relative flex-1" style={{ height: `${Math.max(18, height * 0.72)}%`, marginBottom: `${metric(i + 9, 6, 46)}%` }}><span className="absolute inset-x-0 bottom-0 block" style={{ height: '100%', ...bar(i % 2 ? secondary : accent, 'v') }} /><span className="absolute -right-2 top-0 h-px w-4" style={{ background: hexToRgba(textColor, 0.38) }} /></div>)}
          </div>
        );
      case 'startup-sticker':
        return (
          <div className="relative h-full w-full overflow-hidden">
            {miniSeries.slice(0, 4).map((n, i) => <div key={i} className="absolute rounded-xl border-2 px-2 py-1 text-[8px] font-black" style={{ left: `${8 + i * 18 + metric(i, 0, 5)}%`, top: `${metric(i + 2, 10, 48)}%`, transform: `rotate(${[-10, 8, -4, 12][i] + (seed % 5)}deg)`, borderColor: textColor, background: i % 2 ? secondary : accent, color: template.palette.bg }}>{i === 1 ? `${Math.max(2, Math.round(n / 18))}×` : n}</div>)}
            <svg className="absolute inset-x-2 bottom-2 h-9" viewBox="0 0 100 30" fill="none"><path d={`M2 ${26 - metric(1, 0, 10)} C22 ${metric(2, 2, 18)} 36 ${metric(3, 12, 16)} 52 ${metric(4, 4, 18)} S78 ${metric(5, 2, 18)} 98 ${metric(6, 8, 18)}`} stroke={textColor} strokeWidth="2" strokeLinecap="round" strokeDasharray={strokeDash}/></svg>
          </div>
        );
      case 'fieldnotes-scatter':
        return (
          <div className="relative h-full w-full rounded-[45%_55%_52%_48%]" style={{ ...softPanel, background: hexToRgba(secondary, 0.12) }}>
            {Array.from({ length: 7 }).map((_, i) => { const [x, y] = xy(i); return <span key={`${x}-${y}`} className="absolute rounded-[48%_52%_58%_42%] border" style={{ left: `${x}%`, top: `${y}%`, width: `${7 + metric(i, 0, 9)}px`, height: `${7 + metric(i + 3, 0, 8)}px`, background: hexToRgba(i % 2 ? secondary : accent, 0.45), borderColor: i === seed % 7 ? textColor : 'transparent' }} />; })}
            <svg className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)]" viewBox="0 0 100 60" fill="none"><path d={pathFrom(miniSeries.slice(0, 6), 100, 58).replace(/L/g, ' L')} stroke={accent} strokeWidth="1.4" strokeDasharray="4 4" fill="none" /></svg>
          </div>
        );
      case 'brutal-blocks':
        return <div className="grid h-full grid-cols-4 grid-rows-3 gap-1">{[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => <span key={n} className={cn(i === 0 && 'col-span-2 row-span-2', i === 5 && 'col-span-2')} style={{ background: i % 3 === 0 ? textColor : i % 2 ? accent : hexToRgba(textColor, 0.32), border: `2px solid ${i % 3 === 0 ? accent : textColor}` }} />)}</div>;
      case 'broadcast-vu':
        return <div className="flex h-full items-end gap-1 rounded-lg p-1" style={softPanel}>{Array.from({ length: 9 }, (_, i) => metric(i, 24, 72)).map((h, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${h > 76 ? accent : secondary}, ${hexToRgba(h > 76 ? accent : secondary, 0.18)})`, boxShadow: h > 76 && chartStyle === 'glow' ? `0 0 8px ${accent}` : undefined }} />)}</div>;
      case 'observatory-radar':
      {
        const radarPts = Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          const r = 18 + metric(i, 0, 30);
          return `${50 + Math.cos(a) * r},${35 + Math.sin(a) * r}`;
        }).join(' ');
        return (
          <svg viewBox="0 0 100 70" className="h-full w-full" style={{ filter: glow }}>
            <polygon points="50,5 92,35 50,65 8,35" fill="none" stroke={hexToRgba(textColor, 0.18)} strokeWidth="1" />
            <polygon points="50,18 78,35 50,52 22,35" fill="none" stroke={hexToRgba(textColor, 0.18)} strokeWidth="1" />
            <path d="M50 35 L50 5 M50 35 L92 35 M50 35 L50 65 M50 35 L8 35" stroke={hexToRgba(textColor, 0.16)} />
            <polygon points={radarPts} fill={hexToRgba(accent, 0.35)} stroke={accent} strokeWidth="2" strokeDasharray={strokeDash} />
          </svg>
        );
      }
      case 'storyboard-frames':
        return <div className="grid h-full grid-cols-3 gap-1.5">{miniSeries.slice(0, 3).map((h, i) => <div key={i} className="relative border p-1" style={{ borderColor: hexToRgba(textColor, 0.34) }}><span className="absolute left-1 top-1 text-[5px] font-black opacity-70">0{i + 1}</span><span className="absolute inset-x-1 bottom-1" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${h === Math.max(...miniSeries.slice(0, 3)) ? accent : secondary}, transparent)` }} /></div>)}</div>;
      case 'monograph-slope':
      {
        const slopeRows = Array.from({ length: 4 }, (_, i) => ({ y1: metric(i, 10, 48), y2: metric(i + 5, 10, 48) }));
        return (
          <svg viewBox="0 0 100 70" className="h-full w-full">
            <path d="M18 10 V62 M82 10 V62" stroke={hexToRgba(textColor, 0.28)} />
            {slopeRows.map(({ y1, y2 }, i) => <g key={i}><path d={`M18 ${y1} L82 ${y2}`} stroke={i === seed % 4 ? accent : hexToRgba(textColor, 0.42)} strokeWidth={i === seed % 4 ? 2.2 : 1.1} strokeDasharray={i === 2 ? '3 2' : undefined}/><circle cx="18" cy={y1} r="2" fill={template.palette.bg} stroke={textColor}/><circle cx="82" cy={y2} r="2" fill={i === seed % 4 ? accent : template.palette.bg} stroke={i === seed % 4 ? accent : textColor}/></g>)}
          </svg>
        );
      }
      case 'blueprint-node':
      {
        const nodes = Array.from({ length: 6 }, (_, i) => xy(i)).map(([x, y], i) => [Math.max(12, Math.min(88, x)), Math.max(12, Math.min(58, y)), i] as const);
        return (
          <svg viewBox="0 0 100 70" className="h-full w-full">
            <path d={`M${nodes[0][0]} ${nodes[0][1]} L${nodes[1][0]} ${nodes[1][1]} L${nodes[3][0]} ${nodes[3][1]} M${nodes[0][0]} ${nodes[0][1]} L${nodes[2][0]} ${nodes[2][1]} L${nodes[4][0]} ${nodes[4][1]} M${nodes[2][0]} ${nodes[2][1]} L${nodes[5][0]} ${nodes[5][1]}`} fill="none" stroke={accent} strokeWidth="1.6" strokeDasharray={strokeDash}/>
            {nodes.map(([x, y], i) => <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width="10" height="10" fill={i % 2 ? template.palette.bg : accent} stroke={i % 2 ? secondary : accent} strokeWidth="2" />)}
          </svg>
        );
      }
      case 'heatmap-matrix':
        return <div className="grid h-full grid-cols-5 grid-rows-4 gap-1">{Array.from({ length: 20 }).map((_, i) => <span key={i} className="rounded-sm" style={{ background: [hexToRgba(textColor, 0.12), hexToRgba(secondary, 0.36), hexToRgba(accent, 0.68), accent][(metric(i, 0, 99) + i) % 4], border: chartStyle === 'outline' ? `1px solid ${hexToRgba(textColor, 0.22)}` : undefined }} />)}</div>;
      case 'funnel-stack':
        return <div className="flex h-full flex-col items-center justify-center gap-1.5">{miniSeries.slice(0, 5).sort((a, b) => b - a).map((w, i) => <span key={`${w}-${i}`} className="h-3 rounded-sm" style={{ width: `${Math.max(20, w)}%`, background: i === 0 ? accent : i === 2 ? secondary : hexToRgba(textColor, 0.3), clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)' }} />)}</div>;
      case 'treemap-tiles':
      {
        const tileLayouts = [
          ['col-span-3 row-span-2', 'col-span-2 row-span-2', 'col-span-2', '', '', 'col-span-2'],
          ['col-span-2 row-span-3', 'col-span-3', 'col-span-2', '', 'col-span-2', ''],
          ['col-span-5', 'col-span-2 row-span-2', 'col-span-3 row-span-2', '', '', 'col-span-2'],
        ];
        return <div className="grid h-full grid-cols-5 grid-rows-4 gap-1">{tileLayouts[seed % tileLayouts.length].map((cls, i) => <span key={i} className={cn(cls)} style={{ background: i % 2 ? hexToRgba(secondary, 0.6) : hexToRgba(accent, 0.72), borderRadius: chartStyle === 'pill' ? 10 : chartStyle === 'flat' ? 0 : 3 }} />)}</div>;
      }
      case 'gantt-roadmap':
        return <div className="flex h-full flex-col justify-center gap-1.5 border-l pl-2" style={{ borderColor: hexToRgba(textColor, 0.28) }}>{miniSeries.slice(0, 4).map((w, i) => <div key={i} className="grid grid-cols-[14px_1fr] items-center gap-1"><span className="text-[6px] font-black opacity-60">Q{i + 1}</span><span className="block h-2.5" style={{ width: `${Math.max(28, w)}%`, marginLeft: `${metric(i + 5, 0, 26)}%`, ...bar(w === Math.max(...miniSeries.slice(0, 4)) ? accent : secondary, 'h') }} /></div>)}</div>;
      case 'quadrant-bubbles':
        return <div className="relative h-full w-full" style={{ background: `linear-gradient(90deg, transparent calc(50% - 0.5px), ${faint} 50%, transparent calc(50% + 0.5px)), linear-gradient(0deg, transparent calc(50% - 0.5px), ${faint} 50%, transparent calc(50% + 0.5px))` }}>{Array.from({ length: 5 }).map((_, i) => { const [x, y] = xy(i + 1); const s = 8 + metric(i, 0, 17); return <span key={i} className="absolute rounded-full border" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, transform: 'translate(-50%, -50%)', background: hexToRgba(i === seed % 5 ? accent : secondary, 0.42), borderColor: i === seed % 5 ? accent : hexToRgba(textColor, 0.34) }} />; })}</div>;
      case 'radial-bars':
        return <div className="relative h-full w-full">{miniSeries.slice(0, 5).map((w, i) => <span key={i} className="absolute left-1/2 top-1/2 h-1.5 origin-left rounded-full" style={{ width: `${18 + w * 0.45}%`, background: w === Math.max(...miniSeries.slice(0, 5)) ? accent : hexToRgba(textColor, 0.38), transform: `rotate(${i * (32 + seed % 17) - 72}deg)`, boxShadow: chartStyle === 'glow' && w === Math.max(...miniSeries.slice(0, 5)) ? `0 0 10px ${accent}` : undefined }} />)}<span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: secondary }} /></div>;
      case 'candlestick-tape':
        return <div className="flex h-full items-center gap-1 border-b border-t py-2" style={{ borderColor: hexToRgba(textColor, 0.2) }}>{miniSeries.slice(0, 7).map((h, i) => <span key={i} className="relative flex-1"><span className="absolute left-1/2 top-1/2 w-px -translate-x-1/2 -translate-y-1/2" style={{ height: `${14 + h * 0.42}px`, background: hexToRgba(textColor, 0.48) }} /><span className="absolute left-0 right-0 top-1/2 -translate-y-1/2" style={{ height: `${8 + h * 0.34}px`, background: i % 2 ? secondary : accent }} /></span>)}</div>;
      case 'sankey-ribbons':
      default:
      {
        const r1 = 5 + metric(0, 0, 18), r2 = 25 + metric(1, 0, 22), r3 = 45 + metric(2, 0, 12);
        return (
          <svg viewBox="0 0 100 70" className="h-full w-full">
            <path d={`M4 ${r1} C34 ${r1} 38 ${r2} 62 ${r2} S82 ${r1 + 4} 96 ${r1 + 4}`} fill="none" stroke={hexToRgba(accent, 0.62)} strokeWidth={`${7 + metric(4, 0, 5)}`} strokeLinecap="round" />
            <path d={`M4 ${r2 + 12} C30 ${r2 + 12} 42 ${r3} 62 ${r3} S82 ${r3 + 10} 96 ${r3 + 10}`} fill="none" stroke={hexToRgba(secondary, 0.56)} strokeWidth={`${8 + metric(5, 0, 6)}`} strokeLinecap="round" />
            <path d={`M4 ${r3 + 10} C26 ${r3 + 10} 42 ${r2} 62 ${r2}`} fill="none" stroke={hexToRgba(textColor, 0.28)} strokeWidth={`${4 + metric(6, 0, 4)}`} strokeLinecap="round" />
            {[4, 62, 96].map((x, i) => <rect key={x} x={x - 3} y="8" width="6" height="54" fill={i === 1 ? template.palette.bg : textColor} stroke={i === 1 ? accent : textColor} />)}
          </svg>
        );
      }
    }
  };

  // ---------- stats variants ----------
  const renderStats = () => {
    const variant = v % 4;
    const statSeed = variantFor(template, kind, 'stats-data');
    const labels = ['Reach', 'CSAT', 'Cities', 'GMV', 'Pipeline', 'Share', 'SLA', 'NRR'];
    const data = Array.from({ length: 4 }, (_, i) => {
      const raw = 18 + ((statSeed >>> (i * 3)) + i * 29) % 84;
      const formats = [`${(raw / 10).toFixed(1)}M`, `${raw}%`, `${80 + raw}+`, `$${Math.max(2, Math.round(raw / 7))}B`];
      return { v: formats[(statSeed + i) % formats.length], l: labels[(statSeed + i * 2) % labels.length] };
    });
    const tileRadius = chartStyle === 'pill' ? 12 : chartStyle === 'flat' ? 0 : 6;
    const tileBorder = chartStyle === 'outline' ? `1px solid ${hexToRgba(textColor, 0.4)}` : undefined;
    if (variant === 0) {
      return (
        <div className="grid h-full grid-cols-2 gap-1.5">
          {data.map((s, i) => (
            <div key={s.v} className="p-1" style={{ background: chartStyle === 'outline' ? 'transparent' : i % 2 ? faint : hexToRgba(accent, 0.16), borderRadius: tileRadius, border: tileBorder }}>
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
              <span className="w-full" style={{ height: `${40 + i * 14}%`, ...bar(i === 1 ? accent : hexToRgba(textColor, 0.32), 'v') }} />
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
              <span className="block h-2" style={{ width: n, ...bar(i === 0 ? accent : hexToRgba(textColor, 0.32), 'h') }} />
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
              <span className="w-full" style={{ height: n, ...bar(i === 0 ? accent : hexToRgba(textColor, 0.32), 'v') }} />
              <span className="text-[6px] font-bold opacity-70">{n}</span>
            </div>
          ))}
        </div>
      );
    }
    const pollDonut =
      chartStyle === 'segmented'
        ? `conic-gradient(${accent} 0 52%, ${template.palette.bg} 52% 56%, ${secondary} 56% 78%, ${template.palette.bg} 78% 80%, ${hexToRgba(textColor, 0.28)} 80% 100%)`
        : chartStyle === 'gradient'
        ? `conic-gradient(${accent} 0 56%, ${hexToRgba(accent, 0.45)} 56% 80%, ${hexToRgba(textColor, 0.22)} 80% 100%)`
        : `conic-gradient(${accent} 0 56%, ${secondary} 56% 80%, ${hexToRgba(textColor, 0.28)} 80% 100%)`;
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="relative h-[78%] aspect-square rounded-full"
          style={{
            background: pollDonut,
            boxShadow: chartStyle === 'glow' ? `0 0 10px ${hexToRgba(accent, 0.7)}` : undefined,
            border: chartStyle === 'outline' ? `1.5px solid ${accent}` : undefined,
          }}
        >
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
      const heroBg =
        chartStyle === 'segmented'
          ? `conic-gradient(${accent} 0 36%, ${template.palette.bg} 36% 40%, ${accent} 40% 72%, ${hexToRgba(textColor, 0.2)} 72% 100%)`
          : chartStyle === 'gradient'
          ? `conic-gradient(${accent} 0 72%, ${hexToRgba(accent, 0.35)} 72% 100%)`
          : `conic-gradient(${accent} 0 72%, ${hexToRgba(textColor, 0.2)} 72% 100%)`;
      return (
        <div className="flex h-full items-center justify-center">
          <div
            className="relative h-[80%] aspect-square rounded-full"
            style={{
              background: heroBg,
              boxShadow: chartStyle === 'glow' ? `0 0 12px ${hexToRgba(accent, 0.75)}` : undefined,
              border: chartStyle === 'outline' ? `1.5px solid ${accent}` : undefined,
            }}
          >
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

  const lookSlide = renderLookSlide();
  if (lookSlide) {
    return (
      <div
        className="relative h-full w-full overflow-hidden rounded-md border shadow-2xl"
        style={{ background: miniBgFor(kind, template, look), color: textColor, ...slideFrameStyleFor(look, template, textColor) }}
      >
        <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, ${hexToRgba(template.palette.bg, 0.22)})` }} />
        <div className={cn('relative h-full w-full', compact ? 'p-2' : 'p-3')}>{lookSlide}</div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border shadow-2xl"
      style={{ background: miniBgFor(kind, template, look), color: textColor, ...slideFrameStyleFor(look, template, textColor) }}
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

const DeckPreviewVisual = ({ t, kind, look, dense }: { t: DeckTemplate; kind: PreviewKind; look: DeckLookId; dense?: boolean }) => {
  const arrangement = arrangementFor(kind, t);
  const hash = hashFor(`${t.id}::${kind}::poster-stage`);
  const deck = miniDeckFor(kind, t);
  const mirror = hash % 2 === 0;
  const primaryShadow = `0 18px 34px ${hexToRgba('#000000', isLight(t.palette.bg) ? 0.16 : 0.32)}`;
  const railBg = `linear-gradient(135deg, ${hexToRgba(t.palette.text, 0.08)}, ${hexToRgba(t.palette.accent, 0.18)})`;
  const frameStyle: React.CSSProperties = { boxShadow: primaryShadow };

  if (arrangement === 'mosaic') {
    return (
      <div className={cn('pointer-events-none absolute grid gap-1.5', dense ? 'inset-x-3 top-9 h-[58%]' : 'inset-x-4 top-10 h-[62%]', mirror ? 'grid-cols-[0.72fr_1fr_1fr]' : 'grid-cols-[1fr_1fr_0.72fr]')}>
        {[...deck, 'title' as PreviewKind].slice(0, 4).map((slideKind, i) => (
          <div key={`${slideKind}-${i}`} className={cn('min-h-0 overflow-hidden rounded-lg', i === 0 && 'row-span-2')} style={i === 0 ? frameStyle : undefined}>
            <MiniSlide kind={slideKind} template={t} look={look} compact={i !== 0} />
          </div>
        ))}
      </div>
    );
  }

  if (arrangement === 'hero') {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className={cn('absolute aspect-video overflow-hidden rounded-xl transition-transform duration-300 group-hover:-translate-y-1', dense ? 'top-10 w-[68%]' : 'top-12 w-[72%]', mirror ? 'left-4' : 'right-4')} style={frameStyle}>
          <MiniSlide kind={deck[0]} template={t} look={look} />
        </div>
        <div className={cn('absolute aspect-video w-[32%] overflow-hidden rounded-lg opacity-90', dense ? 'bottom-5' : 'bottom-7', mirror ? 'right-5' : 'left-5')} style={{ boxShadow: `0 12px 24px ${hexToRgba('#000000', 0.24)}` }}>
          <MiniSlide kind={deck[1]} template={t} look={look} compact />
        </div>
        <div className={cn('absolute h-1.5 rounded-full', mirror ? 'right-6' : 'left-6')} style={{ bottom: dense ? 18 : 24, width: '22%', background: t.palette.accent }} />
      </div>
    );
  }

  if (arrangement === 'vertical') {
    return (
      <div className={cn('pointer-events-none absolute top-9 flex h-[62%] w-[43%] flex-col gap-1.5', mirror ? 'left-4' : 'right-4')}>
        {deck.map((slideKind, i) => (
          <div key={`${slideKind}-${i}`} className="min-h-0 flex-1 overflow-hidden rounded-lg" style={{ transform: `translateX(${mirror ? i * 8 : i * -8}px)`, boxShadow: i === 0 ? primaryShadow : undefined }}>
            <MiniSlide kind={slideKind} template={t} look={look} compact />
          </div>
        ))}
        <div className={cn('absolute top-2 h-full w-[78%] rounded-full opacity-30 blur-xl', mirror ? 'left-full' : 'right-full')} style={{ background: t.palette.accent }} />
      </div>
    );
  }

  if (arrangement === 'rail') {
    return (
      <div className="pointer-events-none absolute inset-x-4 bottom-5 h-[54%] rounded-xl p-2" style={{ background: railBg, border: `1px solid ${hexToRgba(t.palette.text, 0.16)}` }}>
        <div className={cn('absolute top-[-18%] aspect-video w-[55%] overflow-hidden rounded-xl', mirror ? 'left-3' : 'right-3')} style={frameStyle}>
          <MiniSlide kind={deck[0]} template={t} look={look} />
        </div>
        <div className={cn('absolute bottom-2 grid w-[54%] grid-cols-2 gap-1.5', mirror ? 'right-2' : 'left-2')}>
          {deck.slice(1).map((slideKind, i) => <div key={`${slideKind}-${i}`} className="overflow-hidden rounded-lg"><MiniSlide kind={slideKind} template={t} look={look} compact /></div>)}
        </div>
      </div>
    );
  }

  if (arrangement === 'split-stage') {
    return (
      <div className={cn('pointer-events-none absolute top-10 grid h-[60%] w-[76%] gap-2', mirror ? 'left-4 grid-cols-[1fr_0.72fr]' : 'right-4 grid-cols-[0.72fr_1fr]')}>
        <div className={cn('min-w-0 overflow-hidden rounded-xl', !mirror && 'order-2')} style={{ ...frameStyle, transform: hash % 2 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)' }}><MiniSlide kind={deck[0]} template={t} look={look} /></div>
        <div className="flex min-w-0 flex-col gap-2 pt-3">
          {deck.slice(1).map((slideKind, i) => <div key={`${slideKind}-${i}`} className="min-h-0 flex-1 overflow-hidden rounded-lg" style={{ transform: `translateX(${mirror ? (i ? -10 : 4) : (i ? 10 : -4)}px) rotate(${i ? 2 : -3}deg)` }}><MiniSlide kind={slideKind} template={t} look={look} compact /></div>)}
        </div>
      </div>
    );
  }

  if (arrangement === 'contact-sheet') {
    return (
      <div className="pointer-events-none absolute inset-x-4 bottom-5 grid h-[62%] grid-cols-3 grid-rows-2 gap-1.5 rounded-xl p-1.5" style={{ background: hexToRgba(t.palette.text, 0.08), border: `1px solid ${hexToRgba(t.palette.text, 0.18)}` }}>
        {[...deck, 'stats' as PreviewKind, 'quote' as PreviewKind, 'process' as PreviewKind].slice(0, 6).map((slideKind, i) => <MiniSlide key={`${slideKind}-${i}`} kind={slideKind} template={t} look={look} compact />)}
      </div>
    );
  }

  if (arrangement === 'cascade') {
    return (
      <div className={cn('pointer-events-none absolute top-10 h-[62%] w-[68%]', mirror ? 'left-5' : 'right-5')}>
        {deck.map((slideKind, i) => (
          <div key={`${slideKind}-${i}`} className="absolute aspect-video overflow-hidden rounded-xl" style={{ width: `${92 - i * 12}%`, right: mirror ? undefined : `${i * 10}%`, left: mirror ? `${i * 10}%` : undefined, top: `${i * 17}%`, transform: `rotate(${mirror ? [4, -3, 1][i] : [-4, 3, -1][i]}deg)`, opacity: 1 - i * 0.12, boxShadow: i === 0 ? primaryShadow : undefined }}>
            <MiniSlide kind={slideKind} template={t} look={look} compact={i > 0} />
          </div>
        ))}
      </div>
    );
  }

  const backRot = hash % 2 ? 8 : -8;
  const midRot = hash % 3 ? -5 : 5;
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-5 top-10 h-12 w-12 rounded-full opacity-60" style={{ background: `linear-gradient(135deg, ${t.palette.accent}, ${t.palette.secondary})` }} />
      <div className={cn('absolute top-9 h-[60%] w-[66%]', mirror ? 'right-4' : 'left-4')}>
      <div className="absolute right-[-2%] top-[-4%] aspect-video w-[70%] overflow-hidden rounded-lg opacity-55 shadow-xl" style={{ transform: `rotate(${backRot}deg)` }}>
        <MiniSlide kind={deck[2]} template={t} look={look} compact />
      </div>
      <div className="absolute right-[8%] top-[7%] aspect-video w-[78%] overflow-hidden rounded-lg opacity-90 shadow-2xl" style={{ transform: `rotate(${midRot}deg)` }}>
        <MiniSlide kind={deck[1]} template={t} look={look} compact />
      </div>
      <div className="absolute right-[2%] top-[20%] aspect-video w-[88%] overflow-hidden rounded-xl shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
        <MiniSlide kind={deck[0]} template={t} look={look} />
      </div>
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
  const look = lookFor(template, kind);
  const surface = surfaceFor(template, light, kind, look);
  const swatches = [template.palette.accent, template.palette.secondary, template.palette.text, template.palette.bg];

  // Info zone takes on the template's own look-and-feel colors
  const infoBg = `linear-gradient(180deg, ${template.palette.bg} 0%, ${hexToRgba(template.palette.secondary, light ? 0.5 : 0.4)} 100%)`;
  const infoText = template.palette.text;
  const infoMuted = hexToRgba(template.palette.text, 0.65);
  const infoBorder = hexToRgba(template.palette.text, 0.18);
  const infoDivider = hexToRgba(template.palette.text, 0.14);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-primary/40',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      style={{ background: template.palette.bg }}
    >
      {/* Preview zone — contained thumbnail, no overlapping text */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ color: template.palette.text }}
      >
        <div className="absolute inset-0" style={{ background: surface.base }} />
        <div className="absolute inset-0 opacity-80" style={{ background: surface.pattern }} />
        <LookMotif look={look} template={template} textColor={template.palette.text} />
        <DeckPreviewVisual t={template} kind={kind} look={look} dense={dense} />

        {/* Tiny label badges in preview corner */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md"
            style={{ background: hexToRgba(template.palette.bg, 0.7), color: template.palette.text, border: `1px solid ${hexToRgba(template.palette.text, 0.18)}` }}
          >
            {badgeFor(template)}
          </span>
          {shared && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: template.palette.accent, color: template.palette.bg }}
            >
              Shared
            </span>
          )}
          {saved && !shared && (
            <span
              className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: hexToRgba(template.palette.text, 0.92), color: template.palette.bg }}
            >
              Saved
            </span>
          )}
        </div>

        {selected && (
          <span
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full shadow-md"
            style={{ background: template.palette.accent, color: template.palette.bg }}
          >
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Info zone — uses the template's own colors so each card carries its own look & feel */}
      <div
        className={cn('flex flex-1 flex-col gap-2 p-4', dense && 'p-3')}
        style={{ background: infoBg, color: infoText, borderTop: `1px solid ${infoDivider}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className={cn('font-semibold leading-tight tracking-tight line-clamp-2', dense ? 'text-sm' : 'text-base')}
            style={{ color: infoText }}
          >
            {template.name}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            {swatches.slice(0, 4).map((color, i) => (
              <span
                key={`${color}-${i}`}
                className="h-3 w-3 rounded-full"
                style={{ background: color, border: `1px solid ${infoBorder}` }}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <p
          className={cn('line-clamp-2 text-xs', dense && 'line-clamp-1')}
          style={{ color: infoMuted }}
        >
          {template.description || 'Prebuilt PowerPoint deck system'}
        </p>
        <div
          className="mt-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: infoMuted }}
        >
          <MonitorPlay className="h-3 w-3" style={{ color: template.palette.accent }} />
          <span style={{ color: template.palette.accent }}>Full deck</span>
          <span aria-hidden>·</span>
          <span>{LOOK_LABELS[look]}</span>
        </div>
      </div>
    </button>
  );
};
