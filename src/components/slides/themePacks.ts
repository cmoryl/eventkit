// ============================================================================
// Theme Packs — full stylesheet + asset library per demo PowerPoint design
// ============================================================================
// Each demo theme (TransPerfect 2026, Modern Dark, Editorial Light, etc.)
// owns a locked palette, font pair, chart colour ramp, accent treatment,
// curated image library, and the per-layout variation it reads best in.
//
// Consumers:
//   - TemplateGalleryDialog → applies pack to inserted slides
//   - SlideEditor → "Theme Pack" sidebar (palette swatches, font preview,
//     image library picker, suggested variants)
//   - outlineToSlides → uses pack to assign per-layout variants when AI
//     decks are generated
// ============================================================================

import type { DemoThemeId, SlideLayout } from './slideTypes';

// Bundled demo imagery — generated via Lovable AI image gen, baked into bundle.
import transperfectEarth from '@/assets/themes/transperfect-earth.jpg';
import transperfectCity from '@/assets/themes/transperfect-city.jpg';
import modernDarkMesh from '@/assets/themes/modern-dark-mesh.jpg';
import editorialPaper from '@/assets/themes/editorial-paper.jpg';
import corporateBoardroom from '@/assets/themes/corporate-boardroom.jpg';
import vibrantGradient from '@/assets/themes/vibrant-gradient.jpg';
import terracottaTexture from '@/assets/themes/terracotta-texture.jpg';
import brutalistConcrete from '@/assets/themes/brutalist-concrete.jpg';

export interface ThemeImage {
  src: string;
  label: string;
  /** Where this image fits best — drives auto-suggestions in the editor. */
  role: 'hero' | 'section' | 'background' | 'texture';
}

export interface ThemePack {
  id: DemoThemeId;
  name: string;
  /** Short editorial tagline shown in the Theme Pack panel. */
  tagline: string;

  /** Locked colour palette. */
  palette: {
    /** Hero / title-slide background. */
    heroBg: string;
    /** Content / body slide background. */
    contentBg: string;
    /** Primary brand colour (logo, headings, key fills). */
    primary: string;
    /** Secondary supporting colour. */
    secondary: string;
    /** Sharp accent (callouts, key metrics). */
    accent: string;
    /** Muted text on primary background. */
    muted: string;
    /** Foreground text colour. */
    fg: string;
  };

  /** Curated chart colour ramp — used by Recharts series and BrandHub bars. */
  chartColors: string[];

  /** Locked font pair. */
  fonts: {
    heading: string;
    body: string;
    /** Optional mono / numeric typeface for stats and codes. */
    numeric?: string;
  };

  /** Default per-layout variation that reads best in this theme. */
  variants: Partial<Record<SlideLayout, string>>;

  /** Bundled hero / background image library (always available). */
  images: ThemeImage[];

  /** Title-slide variants this theme ships with — surfaced in the variant
   *  picker above the canvas so users can swap looks instantly. */
  titleVariants: { value: string; label: string; description: string }[];
}

/* -------------------------------------------------------------------------- */
/* Pack definitions                                                            */
/* -------------------------------------------------------------------------- */

export const THEME_PACKS: Record<DemoThemeId, ThemePack> = {
  transperfect: {
    id: 'transperfect',
    name: 'TransPerfect 2026',
    tagline: 'Light-led system with deep teal emphasis. Global, premium, brand-locked.',
    palette: {
      // Dark emphasis slides (section dividers, keynote moments) use Deep Teal Blue.
      heroBg: '#002F49',
      // Light content slides — the majority of the deck per brand rules.
      contentBg: '#FFFFFF',
      // Primary brand mark + accents on light slides.
      primary: '#139DD8',
      // Deep Teal Blue — headings on light, surfaces on dark.
      secondary: '#002F49',
      // 10% usage Teal — CTAs, highlights, accent only.
      accent: '#3BBDB5',
      muted: 'rgba(0,47,73,0.6)',
      fg: '#002F49',
    },
    chartColors: ['#139DD8', '#002F49', '#3BBDB5', '#5FB7E0', '#3B5A75'],
    fonts: { heading: 'Poppins', body: 'Poppins', numeric: 'Poppins' },
    variants: {
      title: 'hero-image',
      stats: 'brandhub-tiles',
      chart: 'growth-bars',
      'big-number': 'split',
      content: 'icons',
      timeline: 'rail',
      quote: 'magazine',
      comparison: 'cards',
    },
    images: [
      { src: transperfectEarth, label: 'Earth from orbit',  role: 'hero' },
      { src: transperfectCity,  label: 'Global city sunset', role: 'hero' },
    ],
    titleVariants: [
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Earth/city image with gradient overlay + huge title' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Hero image dimmed under centred eyebrow + title' },
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left, hero image right, glowing accent strip' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Section number, title, subtitle on dark bg' },
    ],
  },

  'modern-dark': {
    id: 'modern-dark',
    name: 'Modern Dark',
    tagline: 'Near-black + electric cyan mesh. Tech keynote energy.',
    palette: {
      heroBg: '#0B0F19',
      contentBg: '#111726',
      primary: '#22D3EE',
      secondary: '#38BDF8',
      accent: '#22D3EE',
      muted: 'rgba(255,255,255,0.55)',
      fg: '#F8FAFC',
    },
    chartColors: ['#22D3EE', '#38BDF8', '#818CF8', '#A78BFA', '#34D399'],
    fonts: { heading: 'Space Grotesk', body: 'Inter', numeric: 'JetBrains Mono' },
    variants: {
      title: 'image-overlay',
      stats: 'cards',
      chart: 'with-stat',
      'big-number': 'gauge',
      content: 'cards',
      process: 'cards',
      quote: 'punch',
    },
    images: [
      { src: modernDarkMesh, label: 'Cyan mesh gradient', role: 'hero' },
    ],
    titleVariants: [
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Cyan mesh background with bold typography' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Mesh image dimmed under centred eyebrow + title' },
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left, mesh visual right' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Section number, title, subtitle' },
    ],
  },

  'editorial-light': {
    id: 'editorial-light',
    name: 'Editorial Light',
    tagline: 'Warm off-white + grain texture. Magazine-quality whitespace.',
    palette: {
      heroBg: '#1A1A1A',
      contentBg: '#F7F5F1',
      primary: '#C4654A',
      secondary: '#1A1A1A',
      accent: '#C4654A',
      muted: 'rgba(26,26,26,0.55)',
      fg: '#1A1A1A',
    },
    chartColors: ['#C4654A', '#1A1A1A', '#A0522D', '#CD7F32', '#6B3A2A'],
    fonts: { heading: 'Instrument Serif', body: 'Work Sans' },
    variants: {
      title: 'editorial',
      stats: 'grid',
      chart: 'takeaway',
      'big-number': 'split',
      content: 'columns',
      quote: 'magazine',
      comparison: 'stacked',
    },
    images: [
      { src: editorialPaper, label: 'Terracotta brushstroke', role: 'hero' },
    ],
    titleVariants: [
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Serif title on cream paper, terracotta accent' },
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left, brushstroke visual right' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Paper texture as full background' },
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Bold magazine cover style' },
    ],
  },

  'corporate-navy': {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    tagline: 'Deep navy + gold beam accents. Executive authority.',
    palette: {
      heroBg: '#0F1B3D',
      contentBg: '#152854',
      primary: '#C9A84C',
      secondary: '#F0D78C',
      accent: '#C9A84C',
      muted: 'rgba(255,255,255,0.6)',
      fg: '#F5F0E0',
    },
    chartColors: ['#C9A84C', '#F0D78C', '#8B7355', '#3B6FA0', '#1E3A5F'],
    fonts: { heading: 'Libre Baskerville', body: 'IBM Plex Sans' },
    variants: {
      title: 'split-image',
      stats: 'cards',
      chart: 'callout',
      'big-number': 'split',
      content: 'columns',
      timeline: 'rail',
      quote: 'magazine',
    },
    images: [
      { src: corporateBoardroom, label: 'Navy boardroom', role: 'hero' },
    ],
    titleVariants: [
      { value: 'split-image',    label: 'Split Screen',     description: 'Title + meta left, boardroom image right' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Boardroom dimmed under centred title' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Serif title on deep navy with gold rule' },
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Boardroom full-bleed, gold accent strip' },
    ],
  },

  'vibrant-startup': {
    id: 'vibrant-startup',
    name: 'Vibrant Startup',
    tagline: 'Coral + indigo waves. Energetic, confident, modern.',
    palette: {
      heroBg: '#1E1B4B',
      contentBg: '#FFFFFF',
      primary: '#F96167',
      secondary: '#6366F1',
      accent: '#F96167',
      muted: 'rgba(30,27,75,0.6)',
      fg: '#1E1B4B',
    },
    chartColors: ['#F96167', '#6366F1', '#A78BFA', '#FB923C', '#0EA5E9'],
    fonts: { heading: 'Sora', body: 'Manrope' },
    variants: {
      title: 'hero-image',
      stats: 'ranked',
      chart: 'with-stat',
      'big-number': 'gauge',
      content: 'cards',
      process: 'arrows',
      quote: 'punch',
    },
    images: [
      { src: vibrantGradient, label: 'Coral → indigo gradient', role: 'hero' },
    ],
    titleVariants: [
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Vibrant gradient background, oversized title' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Gradient dimmed under centred eyebrow + title' },
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left, gradient right' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Indigo bg, coral accent rule' },
    ],
  },

  'warm-terracotta': {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    tagline: 'Sand + terracotta + sage. Organic, grounded, artisan.',
    palette: {
      heroBg: '#B85042',
      contentBg: '#E7E8D1',
      primary: '#B85042',
      secondary: '#A7BEAE',
      accent: '#B85042',
      muted: 'rgba(184,80,66,0.6)',
      fg: '#3D2C26',
    },
    chartColors: ['#B85042', '#A7BEAE', '#8B6F5E', '#D4A574', '#4A6741'],
    fonts: { heading: 'Cormorant Garamond', body: 'Karla' },
    variants: {
      title: 'split-image',
      stats: 'grid',
      chart: 'takeaway',
      'big-number': 'centered',
      content: 'columns',
      timeline: 'cards',
      quote: 'magazine',
    },
    images: [
      { src: terracottaTexture, label: 'Clay & linen still life', role: 'hero' },
    ],
    titleVariants: [
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left on sand, terracotta still-life right' },
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Texture full bleed with serif title overlay' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Serif title on sand, sage rule' },
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Texture full-bleed magazine style' },
    ],
  },

  'mono-brutalist': {
    id: 'mono-brutalist',
    name: 'Mono Brutalist',
    tagline: 'Pure black/white + yellow accent. Oversized, raw, fearless.',
    palette: {
      heroBg: '#000000',
      contentBg: '#FFFFFF',
      primary: '#000000',
      secondary: '#FFEB3B',
      accent: '#FFEB3B',
      muted: 'rgba(0,0,0,0.55)',
      fg: '#000000',
    },
    chartColors: ['#000000', '#FFEB3B', '#FFFFFF', '#888888', '#FFC107'],
    fonts: { heading: 'Archivo Black', body: 'Hind' },
    variants: {
      title: 'image-overlay',
      stats: 'ranked',
      chart: 'plain',
      'big-number': 'centered',
      content: 'icons',
      quote: 'punch',
      comparison: 'vs',
    },
    images: [
      { src: brutalistConcrete, label: 'Concrete + yellow band', role: 'hero' },
    ],
    titleVariants: [
      { value: 'image-overlay',  label: 'Image + Overlay',  description: 'Concrete bg with oversized white title' },
      { value: 'editorial',      label: 'Editorial Eyebrow', description: 'Pure black bg, yellow accent rule' },
      { value: 'split-image',    label: 'Split Screen',     description: 'Title left on white, concrete right' },
      { value: 'hero-image',     label: 'Full-bleed Hero',  description: 'Concrete bleed with yellow accent strip' },
    ],
  },
};

/** Read a theme pack by id, falling back to TransPerfect. */
export function getThemePack(id: DemoThemeId | undefined): ThemePack {
  if (!id) return THEME_PACKS.transperfect;
  return THEME_PACKS[id] ?? THEME_PACKS.transperfect;
}

/** All theme pack ids in display order. */
export const THEME_PACK_IDS: DemoThemeId[] = [
  'transperfect',
  'modern-dark',
  'editorial-light',
  'corporate-navy',
  'vibrant-startup',
  'warm-terracotta',
  'mono-brutalist',
];
