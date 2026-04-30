// Slide data types for the editor
export type SlideLayout =
  | 'title' | 'content' | 'image-left' | 'image-right' | 'blank'
  | 'section' | 'two-column' | 'quote' | 'stats' | 'full-image'
  | 'comparison' | 'timeline' | 'process' | 'chart'
  | 'agenda' | 'big-number' | 'parallax' | 'demo-mock';

/**
 * One depth layer in a parallax slide.
 * `depth` controls 3D Z-offset and parallax intensity:
 *   -100 = far background (slowest, smallest motion, deepest blur)
 *      0 = mid plane (no depth offset, sharp focus)
 *   +100 = far foreground (largest motion, slight blur from camera DOF)
 */
export interface ParallaxLayer {
  id: string;
  kind: 'image' | 'text' | 'shape';
  /** -100…+100 */
  depth: number;
  /** image src OR text content OR shape color */
  content: string;
  /** Position % of slide width/height (0-100). Default 50/50 = centered. */
  x?: number;
  y?: number;
  /** Scale relative to natural size (1 = 100%). */
  scale?: number;
  /** Text-only styling */
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  fontFamily?: string;
  /** Image-only — apply blur in px when at extreme depth */
  blur?: number;
  /** Optional opacity 0-1 */
  opacity?: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  data: Array<{ label: string; value: number }>;
  /** Optional second series for grouped bar/line */
  series2?: Array<{ label: string; value: number }>;
  series2Name?: string;
  series1Name?: string;
}

export interface TimelineStep {
  date?: string;
  title: string;
  description?: string;
}

export interface ProcessStep {
  title: string;
  description?: string;
}

export type SlideBgEffectType =
  | 'none' | 'orbs' | 'particles' | 'mesh' | 'grid' | 'waves' | 'grain' | 'beam';

export interface SlideBgEffect {
  type: SlideBgEffectType;
  /** Animation speed multiplier. 1.0 = default, 0.5 = half, 3.0 = triple. */
  speed?: number;
  /** Overall opacity, 0-1. */
  intensity?: number;
  /** Hex color override; falls back to brand accent. */
  color?: string;
  // ── per-effect params ─────────────────────────────────────────
  /** orbs, particles */
  count?: number;
  /** orbs */
  size?: number;
  /** orbs, mesh */
  blur?: number;
  /** particles */
  direction?: 'up' | 'down' | 'float';
  /** mesh */
  hueRotate?: number;
  /** grid */
  spacing?: number;
  dotSize?: number;
  pulseDepth?: number;
  /** waves */
  amplitude?: number;
  layers?: number;
  /** grain */
  density?: number;
  /** beam */
  angle?: number;
  width?: number;
}

export type SlideBgEffectPresetName = 'calm' | 'subtle' | 'active' | 'dramatic';

/** Preset parameter overrides per effect — universal speed/intensity + sensible per-effect tweaks. */
export const BG_EFFECT_PRESETS: Record<
  Exclude<SlideBgEffectType, 'none'>,
  Record<SlideBgEffectPresetName, Partial<SlideBgEffect>>
> = {
  orbs: {
    calm:     { speed: 0.5, intensity: 0.45, count: 2, size: 60, blur: 100 },
    subtle:   { speed: 0.8, intensity: 0.55, count: 3, size: 50, blur: 90 },
    active:   { speed: 1.2, intensity: 0.7,  count: 3, size: 55, blur: 70 },
    dramatic: { speed: 1.6, intensity: 0.85, count: 4, size: 65, blur: 50 },
  },
  particles: {
    calm:     { speed: 0.6, intensity: 0.5,  count: 18, direction: 'float' },
    subtle:   { speed: 1.0, intensity: 0.6,  count: 30, direction: 'up' },
    active:   { speed: 1.5, intensity: 0.75, count: 45, direction: 'up' },
    dramatic: { speed: 2.0, intensity: 0.9,  count: 60, direction: 'up' },
  },
  mesh: {
    calm:     { speed: 0.4, intensity: 0.4,  blur: 80, hueRotate: 30 },
    subtle:   { speed: 0.7, intensity: 0.55, blur: 70, hueRotate: 60 },
    active:   { speed: 1.2, intensity: 0.7,  blur: 60, hueRotate: 90 },
    dramatic: { speed: 1.8, intensity: 0.85, blur: 50, hueRotate: 180 },
  },
  grid: {
    calm:     { speed: 0.6, intensity: 0.3,  spacing: 60, dotSize: 1.5, pulseDepth: 0.3 },
    subtle:   { speed: 1.0, intensity: 0.45, spacing: 50, dotSize: 2,   pulseDepth: 0.5 },
    active:   { speed: 1.5, intensity: 0.6,  spacing: 40, dotSize: 2.5, pulseDepth: 0.7 },
    dramatic: { speed: 2.2, intensity: 0.8,  spacing: 35, dotSize: 3,   pulseDepth: 0.9 },
  },
  waves: {
    calm:     { speed: 0.6, intensity: 0.5,  amplitude: 20, layers: 1 },
    subtle:   { speed: 1.0, intensity: 0.6,  amplitude: 30, layers: 2 },
    active:   { speed: 1.5, intensity: 0.75, amplitude: 45, layers: 3 },
    dramatic: { speed: 2.0, intensity: 0.9,  amplitude: 60, layers: 3 },
  },
  grain: {
    calm:     { speed: 0.6, intensity: 0.2,  density: 0.4 },
    subtle:   { speed: 1.0, intensity: 0.35, density: 0.6 },
    active:   { speed: 1.5, intensity: 0.55, density: 0.8 },
    dramatic: { speed: 2.0, intensity: 0.75, density: 1.0 },
  },
  beam: {
    calm:     { speed: 0.5, intensity: 0.35, angle: 25, width: 150 },
    subtle:   { speed: 0.9, intensity: 0.5,  angle: 30, width: 180 },
    active:   { speed: 1.4, intensity: 0.7,  angle: 35, width: 220 },
    dramatic: { speed: 2.0, intensity: 0.9,  angle: 45, width: 280 },
  },
};

export interface SlideData {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  /** Extracted images as data URLs */
  images?: string[];
  notes?: string;
  variant: 'default' | 'dark' | 'gradient' | 'minimal' | 'brand' | 'bold';
  /** Custom background color (hex) */
  bgColor?: string;
  /** Text alignment override */
  textAlign?: 'left' | 'center' | 'right';
  /** Heading font size override (px at 1920x1080) */
  headingSize?: number;
  /** Body font size override (px at 1920x1080) */
  bodySize?: number;
  /** Quote attribution */
  quoteAuthor?: string;
  /** Stats entries for stats layout */
  stats?: { value: string; label: string }[];
  /** Chart configuration for chart layout */
  chart?: ChartData;
  /** Timeline steps for timeline layout */
  timeline?: TimelineStep[];
  /** Process steps for process layout */
  process?: ProcessStep[];
  /** AI-suggested image search query (used for smart matching) */
  imageQuery?: string;
  /** AI-suggested BrandHub category for the image */
  assetCategory?: string;
  /** True if AI flagged this slide to need manual image pick */
  needsImage?: boolean;
  /** Animated background effect — in-app + presentation only, not exported to PPTX */
  bgEffect?: SlideBgEffect;
  /** Visual variation of the active layout — see LAYOUT_VARIATIONS for valid values per layout */
  variation?: string;
  /** Depth layers for parallax slides (back→front order). */
  parallaxLayers?: ParallaxLayer[];
  /** Parallax camera intensity multiplier (0 = static, 1 = default, 2 = dramatic). */
  parallaxIntensity?: number;
  /** Demo-mock layout: render the exact preview slide for a template. */
  demoKind?: string;
  /** Demo-mock content payload (DemoContent shape). */
  demoContent?: any;
  /** Demo-mock template palette + id (DeckTemplate shape, lite). */
  demoTemplate?: any;
  /**
   * Per-shape overrides for demo-mock slides — keyed by `data-slide-shape` id.
   * Lets users recolor/hide individual decorative elements (orbs, grid, brackets,
   * accent bars, cards, badges) without leaving the editor.
   *   { "orb-tl": { color: "#ff0", hidden: false } }
   */
  demoOverrides?: Record<string, { color?: string; hidden?: boolean }>;
  /**
   * Per-section overrides for demo-mock slides — keyed by `data-slide-section` id.
   * Lets users move (translate %), hide, or duplicate entire sections like stat
   * tiles, agenda cards, KPI blocks. dx/dy are in % of slide dims.
   */
  demoSectionOverrides?: Record<
    string,
    {
      dx?: number;
      dy?: number;
      /** Scale multipliers (1 = 100%). sx/sy independently per axis. */
      sx?: number;
      sy?: number;
      /** Rotation in degrees, applied around the section center. */
      rotate?: number;
      hidden?: boolean;
      duplicated?: number;
    }
  >;
}

/** Per-layout visual variations — only layouts with shipped alternates are listed. */
export const LAYOUT_VARIATIONS: Partial<Record<SlideLayout, { value: string; label: string }[]>> = {
  title: [
    { value: 'centered',       label: 'Centered' },
    { value: 'split',          label: 'Split Screen' },
    { value: 'asymmetric',     label: 'Asymmetric' },
    { value: 'hero-image',     label: 'Full-bleed Hero' },
    { value: 'image-overlay',  label: 'Image + Overlay' },
    { value: 'split-image',    label: 'Split + Image' },
    { value: 'editorial',      label: 'Editorial Eyebrow' },
  ],
  content: [
    { value: 'bullets',     label: 'Bullets' },
    { value: 'columns',     label: '2 Columns' },
    { value: 'icons',       label: 'Icon Markers' },
    { value: 'cards',       label: 'Cards' },
  ],
  stats: [
    { value: 'row',         label: 'Row' },
    { value: 'grid',        label: 'Grid' },
    { value: 'ranked',      label: 'Ranked Bars' },
    { value: 'cards',       label: 'Cards' },
    { value: 'brandhub-tiles', label: 'BrandHub Tiles' },
  ],
  timeline: [
    { value: 'rail',        label: 'Horizontal Rail' },
    { value: 'vertical',    label: 'Vertical' },
    { value: 'zigzag',      label: 'Zigzag' },
    { value: 'cards',       label: 'Cards' },
  ],
  process: [
    { value: 'arrows',      label: 'Arrows' },
    { value: 'circular',    label: 'Circular Cycle' },
    { value: 'stairs',      label: 'Stair-Step' },
    { value: 'cards',       label: 'Numbered Cards' },
  ],
  'big-number': [
    { value: 'centered',    label: 'Centered' },
    { value: 'split',       label: 'Split Context' },
    { value: 'gauge',       label: 'Gauge Ring' },
  ],
  quote: [
    { value: 'centered',    label: 'Centered' },
    { value: 'magazine',    label: 'Magazine' },
    { value: 'punch',       label: 'Oversized Punch' },
  ],
  chart: [
    { value: 'plain',         label: 'Plain' },
    { value: 'callout',       label: 'With Callout' },
    { value: 'with-stat',     label: 'Chart + Stat' },
    { value: 'takeaway',      label: 'With Takeaway' },
    { value: 'growth-bars',   label: 'BrandHub Growth Bars' },
  ],
  comparison: [
    { value: 'vs',          label: 'VS Split' },
    { value: 'cards',       label: 'Side Cards' },
    { value: 'stacked',     label: 'Stacked' },
    { value: 'bars',        label: 'Bar Heads' },
  ],
  'two-column': [
    { value: 'equal',       label: 'Equal Split' },
    { value: 'wide-left',   label: '70 / 30' },
    { value: 'image-text',  label: 'Image + Text' },
    { value: 'stacked',     label: 'Stacked' },
  ],
  parallax: [
    { value: 'cinematic',  label: 'Cinematic Drift' },
    { value: 'tilt',       label: 'Mouse / Pointer Tilt' },
    { value: 'dolly',      label: 'Dolly Push-In' },
  ],
};

/** Starter parallax layers — back→front. Used when a user adds a fresh parallax slide. */
export const DEFAULT_PARALLAX_LAYERS: ParallaxLayer[] = [
  { id: 'bg',  kind: 'shape', depth: -90, content: 'linear-gradient(135deg,#1e1b4b,#0b1024)', x: 50, y: 50, scale: 1.4, blur: 0 },
  { id: 'mid', kind: 'shape', depth: -30, content: 'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.55), transparent 60%)', x: 50, y: 50, scale: 1.2, blur: 20 },
  { id: 'h1',  kind: 'text',  depth: 10,  content: 'Depth perception,\nin every slide.', x: 50, y: 50, fontSize: 120, fontWeight: 800, color: '#ffffff' },
  { id: 'sub', kind: 'text',  depth: 40,  content: 'Drag the depth slider to move planes through space.', x: 50, y: 70, fontSize: 36, fontWeight: 400, color: 'rgba(255,255,255,0.75)' },
  { id: 'fg',  kind: 'shape', depth: 80,  content: 'radial-gradient(circle, rgba(167,139,250,0.45), transparent 65%)', x: 80, y: 20, scale: 0.6, blur: 12 },
];

export const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    layout: 'title',
    title: 'Presentation Title',
    subtitle: 'Your subtitle goes here',
    variant: 'gradient',
  },
  {
    id: 'slide-2',
    layout: 'content',
    title: 'Key Points',
    body: '• First important point\n• Second important point\n• Third important point',
    variant: 'default',
  },
  {
    id: 'slide-3',
    layout: 'section',
    title: 'Thank You',
    subtitle: 'Questions?',
    variant: 'dark',
  },
];

/* ------------------------------------------------------------------ */
/* Demo themes — mirror the composer's DECK_TEMPLATES so editor       */
/* templates inherit the same gorgeous look-and-feel as the gallery   */
/* demos (TransPerfect orbs, Modern Dark mesh, Editorial Light, etc.) */
/* ------------------------------------------------------------------ */

export type DemoThemeId =
  | 'transperfect'
  | 'modern-dark'
  | 'editorial-light'
  | 'corporate-navy'
  | 'vibrant-startup'
  | 'warm-terracotta'
  | 'mono-brutalist';

interface DemoTheme {
  /** Strong "hero" colour used for title / section / quote / closing slides. */
  heroBg: string;
  /** Lighter "content" colour used for cards, stats, charts, comparison etc. */
  contentBg: string;
  /** Default variant token applied to every slide so SlideRenderer picks
   *  the right text colour & layout treatment. */
  variant: SlideData['variant'];
  /** Animated background effect applied across the deck (subtle). */
  bgEffect?: SlideBgEffect;
  /** Alternative effect used on hero/section slides (more dramatic). */
  heroBgEffect?: SlideBgEffect;
  /** Layouts that should always use the hero bg + variant 'gradient'/'dark'. */
  heroLayouts?: SlideLayout[];
}

const DEMO_THEMES: Record<DemoThemeId, DemoTheme> = {
  // TransPerfect — deep navy + glowing orb gradients (turquoise / lavender)
  transperfect: {
    heroBg: '#03002C',
    contentBg: '#0A0A3D',
    variant: 'brand',
    bgEffect: { type: 'orbs', speed: 0.6, intensity: 0.5, count: 3, size: 60, blur: 90, color: '#A1F9F9' },
    heroBgEffect: { type: 'orbs', speed: 1.0, intensity: 0.85, count: 4, size: 75, blur: 60, color: '#C2A3FF' },
  },
  // Modern Dark — near-black + electric cyan mesh
  'modern-dark': {
    heroBg: '#0B0F19',
    contentBg: '#111726',
    variant: 'dark',
    bgEffect: { type: 'mesh', speed: 0.7, intensity: 0.4, blur: 80, hueRotate: 30, color: '#22D3EE' },
    heroBgEffect: { type: 'mesh', speed: 1.2, intensity: 0.7, blur: 60, hueRotate: 60, color: '#22D3EE' },
  },
  // Editorial Light — warm off-white + grain texture, charcoal text
  'editorial-light': {
    heroBg: '#1A1A1A',
    contentBg: '#F7F5F1',
    variant: 'minimal',
    bgEffect: { type: 'grain', speed: 0.6, intensity: 0.3, density: 0.6, color: '#C4654A' },
    heroBgEffect: { type: 'beam', speed: 0.8, intensity: 0.5, angle: 30, width: 200, color: '#C4654A' },
    heroLayouts: ['title', 'section', 'quote'],
  },
  // Corporate Navy — deep navy + gold beam accents
  'corporate-navy': {
    heroBg: '#0F1B3D',
    contentBg: '#152854',
    variant: 'brand',
    bgEffect: { type: 'grid', speed: 0.6, intensity: 0.3, spacing: 60, dotSize: 1.5, color: '#C9A84C' },
    heroBgEffect: { type: 'beam', speed: 0.9, intensity: 0.6, angle: 35, width: 220, color: '#C9A84C' },
  },
  // Vibrant Startup — white + coral/indigo waves
  'vibrant-startup': {
    heroBg: '#1E1B4B',
    contentBg: '#FFFFFF',
    variant: 'minimal',
    bgEffect: { type: 'waves', speed: 1.0, intensity: 0.5, amplitude: 30, layers: 2, color: '#F96167' },
    heroBgEffect: { type: 'orbs', speed: 1.4, intensity: 0.85, count: 3, size: 65, blur: 70, color: '#F96167' },
    heroLayouts: ['title', 'section', 'quote'],
  },
  // Warm Terracotta — sand + terracotta + sage
  'warm-terracotta': {
    heroBg: '#B85042',
    contentBg: '#E7E8D1',
    variant: 'minimal',
    bgEffect: { type: 'grain', speed: 0.7, intensity: 0.35, density: 0.7, color: '#A7BEAE' },
    heroBgEffect: { type: 'orbs', speed: 0.9, intensity: 0.7, count: 3, size: 60, blur: 80, color: '#A7BEAE' },
    heroLayouts: ['title', 'section', 'quote'],
  },
  // Mono Brutalist — pure white / pure black + yellow accent
  'mono-brutalist': {
    heroBg: '#000000',
    contentBg: '#FFFFFF',
    variant: 'minimal',
    bgEffect: { type: 'grid', speed: 0.8, intensity: 0.45, spacing: 50, dotSize: 2, color: '#FFEB3B' },
    heroBgEffect: { type: 'beam', speed: 1.5, intensity: 0.75, angle: 45, width: 250, color: '#FFEB3B' },
    heroLayouts: ['title', 'section', 'quote'],
  },
};

const DEFAULT_HERO_LAYOUTS: SlideLayout[] = ['title', 'section', 'quote'];

/** Apply a demo theme uniformly to a list of slides — sets bgColor, variant, bgEffect. */
export function applyDemoTheme(
  slides: Omit<SlideData, 'id'>[],
  themeId: DemoThemeId,
): Omit<SlideData, 'id'>[] {
  const theme = DEMO_THEMES[themeId];
  const heroLayouts = theme.heroLayouts ?? DEFAULT_HERO_LAYOUTS;
  return slides.map((s) => {
    const isHero = heroLayouts.includes(s.layout);
    return {
      ...s,
      bgColor: isHero ? theme.heroBg : theme.contentBg,
      variant: isHero ? 'gradient' : theme.variant,
      bgEffect: isHero ? theme.heroBgEffect ?? theme.bgEffect : theme.bgEffect,
    };
  });
}

/** Maps composer DECK_TEMPLATES ids → DemoThemeId so AI-generated decks
 *  inherit the same look-and-feel as the gallery demos. */
export const DECK_TEMPLATE_TO_DEMO_THEME: Record<string, DemoThemeId> = {
  'transperfect-2026': 'transperfect',
  'modern-dark': 'modern-dark',
  'editorial-light': 'editorial-light',
  'corporate-navy': 'corporate-navy',
  'vibrant-startup': 'vibrant-startup',
  'warm-terracotta': 'warm-terracotta',
  'mono-brutalist': 'mono-brutalist',
};

/** Pick the closest demo theme for any template id, palette-based fallback. */
export function resolveDemoThemeId(
  templateId?: string,
  palette?: { bg?: string; text?: string },
): DemoThemeId {
  if (templateId && DECK_TEMPLATE_TO_DEMO_THEME[templateId]) {
    return DECK_TEMPLATE_TO_DEMO_THEME[templateId];
  }
  // Fallback: dark vs light heuristic from bg luminance
  const bg = (palette?.bg || '').replace('#', '');
  if (bg.length === 6) {
    const r = parseInt(bg.slice(0, 2), 16);
    const g = parseInt(bg.slice(2, 4), 16);
    const b = parseInt(bg.slice(4, 6), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma < 0.4 ? 'modern-dark' : 'editorial-light';
  }
  return 'modern-dark';
}


/** Raw template definitions — content only. Themed at export time below. */
const RAW_SLIDE_TEMPLATES: { name: string; theme: DemoThemeId; slides: Omit<SlideData, 'id'>[] }[] = [
  {
    name: 'Keynote',
    theme: 'modern-dark',
    slides: [
      { layout: 'title', title: 'Keynote Title', subtitle: 'Speaker Name • Date', variant: 'gradient' },
      { layout: 'content', title: 'Agenda', body: '• Introduction\n• Key Topics\n• Demo\n• Q&A', variant: 'default' },
      { layout: 'stats', title: 'By the Numbers', variant: 'brand', stats: [
        { value: '10K+', label: 'Active Users' },
        { value: '99.9%', label: 'Uptime SLA' },
        { value: '4.8★', label: 'CSAT Rating' },
        { value: '38', label: 'Countries' },
      ]},
      { layout: 'chart', title: 'Monthly Active Users', variant: 'default', chart: {
        type: 'line', title: 'MAU growth (last 6 months)',
        data: [
          { label: 'Jan', value: 6200 }, { label: 'Feb', value: 6900 }, { label: 'Mar', value: 7800 },
          { label: 'Apr', value: 8500 }, { label: 'May', value: 9400 }, { label: 'Jun', value: 10800 },
        ],
      }},
      { layout: 'chart', title: 'Where Users Spend Time', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Feature usage share',
        data: [
          { label: 'Editor', value: 42 }, { label: 'Library', value: 23 },
          { label: 'Sharing', value: 18 }, { label: 'Settings', value: 9 }, { label: 'Other', value: 8 },
        ],
      }},
      { layout: 'quote', title: '"Innovation distinguishes between a leader and a follower."', quoteAuthor: 'Steve Jobs', variant: 'dark' },
      { layout: 'section', title: 'Thank You', subtitle: 'Questions?', variant: 'gradient' },
    ],
  },
  {
    name: 'Pitch Deck',
    theme: 'vibrant-startup',
    slides: [
      { layout: 'title', title: 'Company Name', subtitle: 'Tagline that captures your vision', variant: 'bold' },
      { layout: 'content', title: 'The Problem', body: '• Pain point one\n• Pain point two\n• Pain point three', variant: 'default' },
      { layout: 'stats', title: 'Market Size', variant: 'minimal', stats: [
        { value: '$84B', label: 'TAM' },
        { value: '$12B', label: 'SAM' },
        { value: '$1.4B', label: 'SOM by 2028' },
      ]},
      { layout: 'content', title: 'Our Solution', body: '• Feature one\n• Feature two\n• Feature three', variant: 'default' },
      { layout: 'chart', title: 'ARR Growth', variant: 'brand', chart: {
        type: 'bar', title: 'Annual recurring revenue ($M)',
        data: [
          { label: '2021', value: 0.4 }, { label: '2022', value: 1.1 },
          { label: '2023', value: 2.0 }, { label: '2024', value: 4.6 }, { label: '2025E', value: 9.2 },
        ],
      }},
      { layout: 'stats', title: 'Traction', variant: 'brand', stats: [
        { value: '$2M', label: 'ARR' },
        { value: '150%', label: 'YoY Growth' },
        { value: '500+', label: 'Customers' },
        { value: '118%', label: 'Net Retention' },
      ]},
      { layout: 'chart', title: 'Revenue Mix', variant: 'default', chart: {
        type: 'pie', title: 'Revenue by segment',
        data: [
          { label: 'Enterprise', value: 58 }, { label: 'Mid-market', value: 27 }, { label: 'SMB', value: 15 },
        ],
      }},
      { layout: 'comparison', title: 'Before vs After', body: 'Manual processes\nSlow turnaround\nHigh error rate\n---\nAutomated workflows\nInstant results\n99.9% accuracy', variant: 'default' },
      { layout: 'timeline', title: 'Roadmap', variant: 'default', timeline: [
        { date: 'Q1', title: 'Launch v2.0', description: 'New editor + collaboration' },
        { date: 'Q2', title: 'EU Expansion', description: 'GDPR-ready, EU region' },
        { date: 'Q3', title: 'Mobile App', description: 'iOS + Android GA' },
        { date: 'Q4', title: '$10M ARR', description: 'Reach milestone' },
      ]},
      { layout: 'section', title: 'Let\'s Talk', subtitle: 'hello@company.com', variant: 'gradient' },
    ],
  },
  {
    name: 'Workshop',
    theme: 'editorial-light',
    slides: [
      { layout: 'title', title: 'Workshop Title', subtitle: 'Hands-on learning session', variant: 'brand' },
      { layout: 'content', title: 'What You\'ll Learn', body: '• Skill one\n• Skill two\n• Skill three\n• Skill four', variant: 'default' },
      { layout: 'stats', title: 'Today\'s Session', variant: 'minimal', stats: [
        { value: '90', label: 'Minutes' },
        { value: '4', label: 'Exercises' },
        { value: '3', label: 'Live Demos' },
      ]},
      { layout: 'process', title: 'Our Method', variant: 'default', process: [
        { title: 'Discover', description: 'Frame the problem' },
        { title: 'Design', description: 'Sketch solutions' },
        { title: 'Build', description: 'Prototype quickly' },
        { title: 'Test', description: 'Validate with users' },
      ]},
      { layout: 'image-left', title: 'Step-by-Step', body: '1. First step\n2. Second step\n3. Third step', variant: 'default' },
      { layout: 'chart', title: 'Skill Confidence (pre vs post)', variant: 'default', chart: {
        type: 'bar', title: 'Self-rated 1-10',
        data: [
          { label: 'Research', value: 4 }, { label: 'Design', value: 5 },
          { label: 'Prototype', value: 3 }, { label: 'Test', value: 4 },
        ],
        series2: [
          { label: 'Research', value: 8 }, { label: 'Design', value: 9 },
          { label: 'Prototype', value: 7 }, { label: 'Test', value: 8 },
        ],
        series1Name: 'Before', series2Name: 'After',
      }},
      { layout: 'two-column', title: 'Tips & Tricks', body: '✓ Do this\n✓ And this\n✓ Also this\n---\n✗ Avoid this\n✗ And this\n✗ Also this', variant: 'minimal' },
      { layout: 'section', title: 'Practice Time!', subtitle: '15 minutes', variant: 'bold' },
    ],
  },
  {
    name: 'Report',
    theme: 'corporate-navy',
    slides: [
      { layout: 'title', title: 'Q4 Report', subtitle: 'Performance Overview', variant: 'minimal' },
      { layout: 'stats', title: 'Key Metrics', variant: 'default', stats: [
        { value: '↑ 24%', label: 'Revenue' },
        { value: '↑ 18%', label: 'Users' },
        { value: '↓ 5%', label: 'Churn' },
        { value: '92', label: 'NPS' },
      ]},
      { layout: 'chart', title: 'Quarterly Revenue', variant: 'default', chart: {
        type: 'bar', title: 'Revenue by quarter ($M)',
        data: [
          { label: 'Q1', value: 0.9 }, { label: 'Q2', value: 1.1 },
          { label: 'Q3', value: 1.2 }, { label: 'Q4', value: 1.5 },
        ],
      }},
      { layout: 'chart', title: 'Revenue by Region', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Geographic split',
        data: [
          { label: 'NA', value: 52 }, { label: 'EMEA', value: 28 },
          { label: 'APAC', value: 14 }, { label: 'LATAM', value: 6 },
        ],
      }},
      { layout: 'chart', title: 'User Growth Trend', variant: 'default', chart: {
        type: 'line', title: 'Monthly active users (thousands)',
        data: [
          { label: 'Jul', value: 6.4 }, { label: 'Aug', value: 7.1 }, { label: 'Sep', value: 7.8 },
          { label: 'Oct', value: 8.5 }, { label: 'Nov', value: 9.2 }, { label: 'Dec', value: 10.0 },
        ],
      }},
      { layout: 'comparison', title: 'Q3 vs Q4', body: 'Revenue: $1.2M\nUsers: 8,500\nChurn: 7%\nNPS: 84\n---\nRevenue: $1.5M\nUsers: 10,000\nChurn: 5%\nNPS: 92', variant: 'default' },
      { layout: 'stats', title: 'Operational Health', variant: 'brand', stats: [
        { value: '99.97%', label: 'Uptime' },
        { value: '142ms', label: 'P95 Latency' },
        { value: '0.04%', label: 'Error Rate' },
        { value: '12m', label: 'MTTR' },
      ]},
      { layout: 'content', title: 'Next Quarter Goals', body: '• Launch v2.0\n• Expand to EU market\n• Hire 10 engineers\n• Achieve $2M ARR', variant: 'default' },
      { layout: 'section', title: 'Questions?', variant: 'dark' },
    ],
  },
  {
    name: 'Data Story',
    theme: 'modern-dark',
    slides: [
      { layout: 'title', title: 'The State of Our Market', subtitle: 'A data-driven narrative', variant: 'gradient' },
      { layout: 'stats', title: 'Headline Numbers', variant: 'brand', stats: [
        { value: '3.2x', label: 'Category Growth' },
        { value: '64%', label: 'Adoption Rate' },
        { value: '$48B', label: 'Spend in 2025' },
        { value: '12M', label: 'New Buyers' },
      ]},
      { layout: 'chart', title: 'Category Growth (5 years)', variant: 'default', chart: {
        type: 'line', title: 'Total addressable spend ($B)',
        data: [
          { label: '2021', value: 15 }, { label: '2022', value: 22 },
          { label: '2023', value: 31 }, { label: '2024', value: 39 }, { label: '2025', value: 48 },
        ],
      }},
      { layout: 'chart', title: 'Where the Money Goes', variant: 'minimal', chart: {
        type: 'pie', title: 'Spend by category',
        data: [
          { label: 'Software', value: 41 }, { label: 'Services', value: 27 },
          { label: 'Hardware', value: 19 }, { label: 'Training', value: 13 },
        ],
      }},
      { layout: 'chart', title: 'Adoption by Segment', variant: 'default', chart: {
        type: 'bar', title: '% of companies adopting',
        data: [
          { label: 'Enterprise', value: 78 }, { label: 'Mid-market', value: 61 },
          { label: 'SMB', value: 42 }, { label: 'Startup', value: 71 },
        ],
      }},
      { layout: 'stats', title: 'What It Means', variant: 'minimal', stats: [
        { value: '+18pp', label: 'YoY Adoption' },
        { value: '7 of 10', label: 'Plan to Expand' },
        { value: '<2 yrs', label: 'Avg Payback' },
      ]},
      { layout: 'section', title: 'The Takeaway', subtitle: 'The window to lead is now', variant: 'dark' },
    ],
  },
  {
    name: 'Infographic',
    theme: 'vibrant-startup',
    slides: [
      { layout: 'title', title: 'Year in Review', subtitle: 'Visualized', variant: 'bold' },
      { layout: 'stats', title: 'At a Glance', variant: 'brand', stats: [
        { value: '1.2M', label: 'Sessions' },
        { value: '340K', label: 'Signups' },
        { value: '92%', label: 'Retention' },
        { value: '4.9★', label: 'App Rating' },
      ]},
      { layout: 'chart', title: 'Traffic by Channel', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Acquisition mix',
        data: [
          { label: 'Organic', value: 38 }, { label: 'Paid', value: 24 },
          { label: 'Referral', value: 18 }, { label: 'Social', value: 14 }, { label: 'Direct', value: 6 },
        ],
      }},
      { layout: 'process', title: 'Our Funnel', variant: 'default', process: [
        { title: 'Visit', description: '1.2M sessions' },
        { title: 'Signup', description: '340K accounts' },
        { title: 'Activate', description: '210K aha moments' },
        { title: 'Pay', description: '46K subscribers' },
      ]},
      { layout: 'chart', title: 'Engagement Over Time', variant: 'default', chart: {
        type: 'line', title: 'Daily active users (k)',
        data: [
          { label: 'Jan', value: 22 }, { label: 'Mar', value: 28 }, { label: 'May', value: 35 },
          { label: 'Jul', value: 41 }, { label: 'Sep', value: 49 }, { label: 'Nov', value: 58 },
        ],
      }},
      { layout: 'timeline', title: 'Milestones', variant: 'minimal', timeline: [
        { date: 'Feb', title: 'Mobile launch', description: 'iOS + Android' },
        { date: 'May', title: '100K users', description: 'Crossed milestone' },
        { date: 'Aug', title: 'Series A', description: '$12M raised' },
        { date: 'Nov', title: 'Global rollout', description: '38 countries live' },
      ]},
      { layout: 'section', title: 'Onward', subtitle: 'The story continues', variant: 'gradient' },
    ],
  },
  {
    name: 'Board Deck',
    theme: 'corporate-navy',
    slides: [
      { layout: 'title', title: 'Board Meeting', subtitle: 'Q4 Update • [Date]', variant: 'brand' },
      { layout: 'agenda', title: 'Today\'s Agenda', body: 'Financial Highlights\nStrategic Priorities\nProduct & Engineering Update\nCustomer & Market\nOperational Health\nQ&A', variant: 'default' },
      { layout: 'stats', title: 'Financial Highlights', variant: 'brand', stats: [
        { value: '$14.2M', label: 'ARR' },
        { value: '134%', label: 'Net Retention' },
        { value: '↑ 31%', label: 'QoQ Growth' },
        { value: '18mo', label: 'Runway' },
      ]},
      { layout: 'chart', title: 'ARR Progression', variant: 'default', chart: {
        type: 'line', title: 'Annual recurring revenue ($M)',
        data: [
          { label: 'Q1', value: 8.4 }, { label: 'Q2', value: 10.1 },
          { label: 'Q3', value: 12.2 }, { label: 'Q4', value: 14.2 },
        ],
      }},
      { layout: 'content', title: 'Strategic Priorities', body: '• Expand enterprise segment — target Fortune 500\n• Platform API — launch Q1 next year\n• EU market entry — regulatory filing in progress\n• Series B — targeting $40M close by Q2', variant: 'minimal' },
      { layout: 'stats', title: 'Operational Health', variant: 'minimal', stats: [
        { value: '99.95%', label: 'Uptime' },
        { value: '94', label: 'NPS' },
        { value: '1.8%', label: 'Churn Rate' },
        { value: '$18K', label: 'ACV' },
      ]},
      { layout: 'section', title: 'Questions & Discussion', variant: 'dark' },
    ],
  },
  {
    name: 'Sales Proposal',
    theme: 'corporate-navy',
    slides: [
      { layout: 'title', title: 'Proposal for [Company]', subtitle: 'Prepared by [Your Company] • [Date]', variant: 'bold' },
      { layout: 'content', title: 'What We Heard From You', body: '• Growing pains slowing your team down\n• Manual processes eating 15+ hours/week\n• Lack of visibility across projects\n• Hard to scale without adding headcount', variant: 'default' },
      { layout: 'big-number', title: 'Expected ROI', variant: 'brand', stats: [{ value: '3.4×', label: 'return on investment in year one' }], subtitle: 'based on your current team size and process costs' },
      { layout: 'content', title: 'Our Solution', body: '• Automated workflows cut manual work by 80%\n• Real-time dashboards give full visibility\n• Scales to 10x volume without new hires\n• Dedicated onboarding + success team', variant: 'default' },
      { layout: 'comparison', title: 'Before vs After', body: 'Hours wasted on manual tasks\nMissed deadlines\nSiloed teams\nMonthly reporting pain\n---\nFully automated workflows\nOn-time delivery dashboard\nOne shared source of truth\nReal-time reporting, one click', variant: 'minimal' },
      { layout: 'timeline', title: 'Implementation Plan', variant: 'default', timeline: [
        { date: 'Week 1', title: 'Kickoff', description: 'Setup + team training' },
        { date: 'Week 2-3', title: 'Migrate', description: 'Data + workflow migration' },
        { date: 'Week 4', title: 'Go Live', description: 'Full production launch' },
        { date: 'Week 6', title: 'Review', description: 'Outcomes check-in' },
      ]},
      { layout: 'stats', title: 'Why Teams Choose Us', variant: 'minimal', stats: [
        { value: '500+', label: 'Customers' },
        { value: '4.9★', label: 'G2 Rating' },
        { value: '<48h', label: 'Avg Onboarding' },
        { value: '97%', label: 'Renewal Rate' },
      ]},
      { layout: 'section', title: 'Ready to Get Started?', subtitle: 'Let\'s align on next steps', variant: 'gradient' },
    ],
  },
  {
    name: 'Product Launch',
    theme: 'vibrant-startup',
    slides: [
      { layout: 'title', title: 'Introducing [Product]', subtitle: 'The better way to [core benefit]', variant: 'gradient' },
      { layout: 'content', title: 'The Problem We\'re Solving', body: '• Teams waste hours on [pain point]\n• Existing tools are fragmented and slow\n• No single solution does all three things well', variant: 'default' },
      { layout: 'full-image', title: '[Product] — See It in Action', variant: 'dark' },
      { layout: 'content', title: 'Three Core Capabilities', body: '• Feature 1 — [one-line benefit]\n• Feature 2 — [one-line benefit]\n• Feature 3 — [one-line benefit]', variant: 'default' },
      { layout: 'big-number', title: 'Beta Results', variant: 'brand', stats: [{ value: '62%', label: 'faster than the leading alternative' }], subtitle: 'across 250 beta users over 8 weeks' },
      { layout: 'chart', title: 'Market Opportunity', variant: 'default', chart: {
        type: 'bar', title: 'Serviceable market by segment ($M)',
        data: [
          { label: 'Enterprise', value: 1200 }, { label: 'Mid-market', value: 680 },
          { label: 'SMB', value: 420 }, { label: 'Startup', value: 190 },
        ],
      }},
      { layout: 'timeline', title: 'Launch Roadmap', variant: 'minimal', timeline: [
        { date: 'Now', title: 'Early Access', description: 'Waitlist + invite-only' },
        { date: 'Month 1', title: 'Public Beta', description: 'Open sign-up, free tier' },
        { date: 'Month 3', title: 'GA', description: 'Paid plans live' },
        { date: 'Month 6', title: 'Platform API', description: 'Developer ecosystem' },
      ]},
      { layout: 'stats', title: 'Launch Goals', variant: 'brand', stats: [
        { value: '1K', label: 'Signups Wk 1' },
        { value: '100', label: 'Paying Customers' },
        { value: '$25K', label: 'MRR by Month 3' },
        { value: '50+', label: 'Press Mentions' },
      ]},
      { layout: 'section', title: 'Launch Day Is Here', subtitle: 'Go to [url]', variant: 'bold' },
    ],
  },
  {
    name: 'Go-To-Market',
    theme: 'transperfect',
    slides: [
      { layout: 'title', title: 'Go-To-Market Strategy', subtitle: '[Product] • [Year]', variant: 'brand' },
      { layout: 'agenda', title: 'Agenda', body: 'Market Opportunity\nTarget Segments\nGTM Motion\nChannels & Messaging\nLaunch Timeline\nSuccess Metrics', variant: 'default' },
      { layout: 'stats', title: 'Market Opportunity', variant: 'minimal', stats: [
        { value: '$6.2B', label: 'TAM' },
        { value: '$1.1B', label: 'SAM' },
        { value: '$85M', label: 'Year 1 Target' },
      ]},
      { layout: 'chart', title: 'Segment Sizing', variant: 'default', chart: {
        type: 'pie', title: 'Addressable revenue by segment',
        data: [
          { label: 'Enterprise', value: 55 }, { label: 'Mid-market', value: 30 }, { label: 'SMB', value: 15 },
        ],
      }},
      { layout: 'process', title: 'GTM Motion', variant: 'default', process: [
        { title: 'Awareness', description: 'Content + paid social' },
        { title: 'Acquisition', description: 'PLG free trial' },
        { title: 'Activation', description: 'Onboarding flow' },
        { title: 'Expansion', description: 'CSM-led upsell' },
        { title: 'Advocacy', description: 'Referral program' },
      ]},
      { layout: 'two-column', title: 'Channels & Messaging', body: 'Inbound: SEO blog\nProduct-led: Free tier\nOutbound: ABM enterprise\nEvents: 4 conferences/yr\n---\nEnterprise: "Scale without risk"\nMid-market: "Grow without chaos"\nSMB: "Start strong, stay lean"\nDev: "Build on our platform"', variant: 'minimal' },
      { layout: 'timeline', title: 'GTM Timeline', variant: 'default', timeline: [
        { date: 'M1', title: 'Foundation', description: 'ICP + positioning finalized' },
        { date: 'M2', title: 'Seed', description: 'Content + outbound live' },
        { date: 'M3', title: 'Launch', description: 'Public GA + PR push' },
        { date: 'M6', title: 'Scale', description: 'Paid channels + partnerships' },
      ]},
      { layout: 'section', title: 'Align & Execute', subtitle: 'One team, one plan', variant: 'gradient' },
    ],
  },
  {
    name: 'Case Study',
    theme: 'editorial-light',
    slides: [
      { layout: 'title', title: '[Customer] Success Story', subtitle: 'How [outcome] was achieved in [timeframe]', variant: 'dark' },
      { layout: 'content', title: 'The Challenge', body: '• [Customer] was struggling with [pain point]\n• Manual processes created [problem]\n• Teams spent [X] hours/week on [task]\n• Previous solution couldn\'t scale past [limit]', variant: 'default' },
      { layout: 'content', title: 'Our Approach', body: '• Deployed [product] across [N] teams in [timeframe]\n• Migrated [X] workflows in the first week\n• Custom integration with [their existing tools]\n• Dedicated success team for onboarding', variant: 'minimal' },
      { layout: 'stats', title: 'Results After 90 Days', variant: 'brand', stats: [
        { value: '68%', label: 'Time Saved' },
        { value: '3.1×', label: 'Output Increase' },
        { value: '$420K', label: 'Annual Savings' },
        { value: '9.2/10', label: 'Team NPS' },
      ]},
      { layout: 'quote', title: '"This is the first tool our team actually uses every day. The ROI was obvious within two weeks."', quoteAuthor: 'VP of Operations, [Customer]', variant: 'dark' },
      { layout: 'chart', title: 'Time Spent on Manual Work', variant: 'default', chart: {
        type: 'bar', title: 'Hours per week (team average)',
        data: [{ label: 'Before', value: 18 }, { label: 'After', value: 6 }],
      }},
      { layout: 'section', title: 'Ready for Your Story?', subtitle: 'Let\'s talk', variant: 'gradient' },
    ],
  },
  {
    name: 'OKR Review',
    theme: 'modern-dark',
    slides: [
      { layout: 'title', title: 'Q[N] OKR Review', subtitle: '[Company] • [Year]', variant: 'minimal' },
      { layout: 'stats', title: 'Quarter at a Glance', variant: 'brand', stats: [
        { value: '3/4', label: 'Objectives on track' },
        { value: '78%', label: 'Key results met' },
        { value: '↑ 12%', label: 'vs Last Quarter' },
      ]},
      { layout: 'content', title: 'O1: Grow Revenue', body: '• KR1: Reach $5M ARR — ✅ Achieved ($5.2M)\n• KR2: Close 20 enterprise deals — ⚠️ 14/20\n• KR3: Launch new pricing tier — ✅ Done in M2\n• KR4: Improve NRR to 120% — ✅ 124%', variant: 'default' },
      { layout: 'chart', title: 'ARR vs Target', variant: 'default', chart: {
        type: 'bar', title: 'Monthly ARR ($M)',
        data: [
          { label: 'Jul', value: 4.1 }, { label: 'Aug', value: 4.5 },
          { label: 'Sep', value: 5.2 },
        ],
        series2: [
          { label: 'Jul', value: 4.0 }, { label: 'Aug', value: 4.5 },
          { label: 'Sep', value: 5.0 },
        ],
        series1Name: 'Actual', series2Name: 'Target',
      }},
      { layout: 'content', title: 'O2: Improve Product Quality', body: '• KR1: P0 bugs < 2/month — ✅ Avg 1.3\n• KR2: Page load < 1.5s — ❌ P95 still 2.1s\n• KR3: Ship 4 major features — ✅ 4 shipped\n• KR4: User CSAT ≥ 4.5 — ✅ 4.7', variant: 'minimal' },
      { layout: 'comparison', title: 'Planned vs Actual', body: 'Launch 3 integrations\n$5M ARR by Q end\n90-day onboarding\nNPS > 50\n---\nShipped 4 integrations ✅\nReached $5.2M ARR ✅\n60-day onboarding ✅\nNPS = 62 ✅', variant: 'default' },
      { layout: 'process', title: 'Next Quarter Focus', variant: 'minimal', process: [
        { title: 'Revenue', description: 'Hit $7M ARR' },
        { title: 'Platform', description: 'API v2 launch' },
        { title: 'Retention', description: 'NRR > 130%' },
        { title: 'Hiring', description: '12 new hires' },
      ]},
      { layout: 'section', title: 'Q&A + Team Discussion', variant: 'dark' },
    ],
  },
  {
    name: 'Competitive Analysis',
    theme: 'mono-brutalist',
    slides: [
      { layout: 'title', title: 'Competitive Landscape', subtitle: '[Market] • [Year] Analysis', variant: 'gradient' },
      { layout: 'content', title: 'Who We\'re Up Against', body: '• Competitor A — market leader, expensive, slow\n• Competitor B — cheap, missing enterprise features\n• Competitor C — good UX, weak data layer\n• Legacy players — dominant but losing ground', variant: 'default' },
      { layout: 'comparison', title: 'Us vs the Market Leader', body: '5× faster implementation\nNo-code configuration\nModular pricing\n99.95% SLA guarantee\nBuilt-in analytics\n---\n3-6 month implementation\nRequires dev team\nEnterprise bundles only\n99.5% SLA\nThird-party BI only', variant: 'default' },
      { layout: 'chart', title: 'Market Share (Est.)', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Revenue share by vendor',
        data: [
          { label: 'Competitor A', value: 38 }, { label: 'Competitor B', value: 22 },
          { label: 'Us', value: 18 }, { label: 'Competitor C', value: 12 }, { label: 'Other', value: 10 },
        ],
      }},
      { layout: 'chart', title: 'Win Rate by Competitor', variant: 'default', chart: {
        type: 'bar', title: '% of head-to-head deals won',
        data: [
          { label: 'vs A', value: 54 }, { label: 'vs B', value: 71 },
          { label: 'vs C', value: 62 }, { label: 'vs Legacy', value: 83 },
        ],
      }},
      { layout: 'stats', title: 'Our Competitive Edge', variant: 'brand', stats: [
        { value: '54%', label: 'Win Rate vs Leader' },
        { value: '5×', label: 'Faster Setup' },
        { value: '#1', label: 'G2 Category' },
        { value: '2.4×', label: 'More Integrations' },
      ]},
      { layout: 'content', title: 'Strategic Response', body: '• Double down on enterprise: high-touch outbound vs Competitor A\n• Own the mid-market: land-and-expand vs Competitor B\n• Speed narrative: lead with time-to-value in all materials\n• Partnerships: ecosystem approach that competitors can\'t match', variant: 'default' },
      { layout: 'section', title: 'Key Takeaway', subtitle: 'We win on speed, price, and ecosystem', variant: 'dark' },
    ],
  },
  {
    name: 'Project Status',
    theme: 'editorial-light',
    slides: [
      { layout: 'title', title: '[Project Name] Status Update', subtitle: 'Week [N] • [Date]', variant: 'minimal' },
      { layout: 'stats', title: 'Status Overview', variant: 'default', stats: [
        { value: '🟢', label: 'Overall Health' },
        { value: '72%', label: 'Complete' },
        { value: '3', label: 'Open Blockers' },
        { value: 'On Track', label: 'vs Deadline' },
      ]},
      { layout: 'timeline', title: 'Project Milestones', variant: 'default', timeline: [
        { date: 'Week 1', title: 'Kickoff', description: '✅ Done' },
        { date: 'Week 3', title: 'Design', description: '✅ Done' },
        { date: 'Week 6', title: 'Build', description: '🔄 In progress' },
        { date: 'Week 8', title: 'QA', description: '⏳ Upcoming' },
        { date: 'Week 10', title: 'Launch', description: '⏳ Upcoming' },
      ]},
      { layout: 'chart', title: 'Progress by Workstream', variant: 'default', chart: {
        type: 'bar', title: '% complete per workstream',
        data: [
          { label: 'Design', value: 100 }, { label: 'Frontend', value: 80 },
          { label: 'Backend', value: 65 }, { label: 'QA', value: 20 }, { label: 'Docs', value: 40 },
        ],
      }},
      { layout: 'comparison', title: 'Risks & Mitigations', body: 'API dependency delay (high)\nResource gap in QA\nScope creep — feature requests\n---\nParallel dev track started\nContractor engaged for 2 weeks\nChange control process added', variant: 'minimal' },
      { layout: 'process', title: 'Next Steps (This Week)', variant: 'default', process: [
        { title: 'Unblock API', description: 'Sync with vendor Tue' },
        { title: 'QA Sprint', description: 'Start regression testing' },
        { title: 'Stakeholder Demo', description: 'Thursday 3pm' },
        { title: 'Scope Freeze', description: 'Sign-off by Friday' },
      ]},
      { layout: 'section', title: 'Questions & Actions', variant: 'dark' },
    ],
  },
  {
    name: 'Team Introduction',
    theme: 'warm-terracotta',
    slides: [
      { layout: 'title', title: 'Meet the [Team Name] Team', subtitle: '[Company] • [Department]', variant: 'brand' },
      { layout: 'content', title: 'Who We Are', body: '• [N] people across [X] time zones\n• Building [product/service] since [year]\n• Mix of [roles/backgrounds]\n• United by [mission/value]', variant: 'default' },
      { layout: 'stats', title: 'Team by the Numbers', variant: 'minimal', stats: [
        { value: '12', label: 'Team Members' },
        { value: '4', label: 'Time Zones' },
        { value: '8 yrs', label: 'Avg Experience' },
        { value: '94%', label: 'Retention Rate' },
      ]},
      { layout: 'process', title: 'How We Work', variant: 'default', process: [
        { title: 'Async-first', description: 'Docs over meetings' },
        { title: 'Ship weekly', description: 'Small, frequent releases' },
        { title: 'Own it', description: 'One DRI per project' },
        { title: 'Feedback', description: 'Retro every sprint' },
      ]},
      { layout: 'content', title: 'What We\'re Working On', body: '• Priority 1 — [current initiative]\n• Priority 2 — [current initiative]\n• Priority 3 — [current initiative]', variant: 'minimal' },
      { layout: 'two-column', title: 'Our Strengths', body: '✓ Deep domain expertise\n✓ Fast iteration cycles\n✓ Strong cross-functional partnerships\n✓ Data-driven decisions\n---\n✓ Customer obsession\n✓ Transparent communication\n✓ Bias for action\n✓ High ownership culture', variant: 'default' },
      { layout: 'section', title: 'Let\'s Build Together', subtitle: 'Reach us at [team-channel]', variant: 'gradient' },
    ],
  },
  {
    name: 'Annual Review',
    theme: 'transperfect',
    slides: [
      { layout: 'title', title: '[Company] Annual Review', subtitle: 'Year in Review • [Year]', variant: 'gradient' },
      { layout: 'big-number', title: 'Biggest Win of the Year', variant: 'brand', stats: [{ value: '$20M', label: 'ARR crossed — 2× year over year' }], subtitle: 'the milestone we set out to hit on day one' },
      { layout: 'stats', title: 'Year in Numbers', variant: 'brand', stats: [
        { value: '420K', label: 'Total Users' },
        { value: '↑ 210%', label: 'Revenue Growth' },
        { value: '97%', label: 'Customer Retention' },
        { value: '62', label: 'Employees' },
      ]},
      { layout: 'chart', title: 'Revenue Growth', variant: 'default', chart: {
        type: 'line', title: 'Monthly recurring revenue ($K)',
        data: [
          { label: 'Jan', value: 820 }, { label: 'Mar', value: 980 }, { label: 'May', value: 1200 },
          { label: 'Jul', value: 1460 }, { label: 'Sep', value: 1680 }, { label: 'Dec', value: 2100 },
        ],
      }},
      { layout: 'chart', title: 'Customer Mix', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Revenue by customer segment',
        data: [
          { label: 'Enterprise', value: 52 }, { label: 'Mid-market', value: 31 }, { label: 'SMB', value: 17 },
        ],
      }},
      { layout: 'content', title: 'Product Milestones', body: '• Shipped [Feature A] — [impact]\n• Launched platform API — 200+ integrations live\n• Mobile apps — iOS + Android, 4.8★\n• Rebuilt infrastructure — 10× performance', variant: 'default' },
      { layout: 'timeline', title: 'Year Timeline', variant: 'minimal', timeline: [
        { date: 'Q1', title: 'Series B', description: '$30M raised' },
        { date: 'Q2', title: 'EU Launch', description: '12 new markets' },
        { date: 'Q3', title: 'Platform', description: 'API released' },
        { date: 'Q4', title: '$20M ARR', description: 'Milestone hit' },
      ]},
      { layout: 'comparison', title: 'Goals vs Achieved', body: '$18M ARR\n350K users\nLaunch 3 markets\n45 employees\n---\n$20M ARR ✅\n420K users ✅\n12 markets ✅\n62 employees ✅', variant: 'default' },
      { layout: 'content', title: 'Looking Ahead', body: '• Double ARR to $40M\n• Ship next-gen AI features\n• Expand to 30 markets\n• Build toward IPO readiness', variant: 'bold' },
      { layout: 'section', title: 'Thank You', subtitle: 'To our customers, team, and investors', variant: 'dark' },
    ],
  },
];

/**
 * Public template catalog — content + matching demo theme baked in so every
 * template renders with the same look-and-feel as the composer's gallery
 * previews (TransPerfect orbs, Modern Dark mesh, Editorial Light grain, etc.).
 */
export const SLIDE_TEMPLATES: { name: string; theme: DemoThemeId; slides: Omit<SlideData, 'id'>[] }[] =
  RAW_SLIDE_TEMPLATES.map((t) => ({
    name: t.name,
    theme: t.theme,
    slides: applyDemoTheme(t.slides, t.theme),
  }));

