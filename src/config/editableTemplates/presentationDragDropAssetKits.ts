// Presentation drag/drop asset starter kits — curated asset groupings for future asset picker presets

export type PresentationAssetSlot =
  | 'background'
  | 'hero'
  | 'logo'
  | 'sponsor-logo'
  | 'icon'
  | 'product-render'
  | 'device-mockup'
  | 'chart'
  | 'gallery'
  | 'qr'
  | 'map'
  | 'texture'
  | 'person'
  | 'orb'
  | 'ui-panel';

export interface PresentationAssetKitItem {
  id: string;
  slot: PresentationAssetSlot;
  label: string;
  usage: string;
  formats: string[];
  preferredTemplates: string[];
  promptHint?: string;
}

export interface PresentationAssetKit {
  id: string;
  name: string;
  description: string;
  items: PresentationAssetKitItem[];
}

export const PRESENTATION_DRAG_DROP_ASSET_KITS: PresentationAssetKit[] = [
  {
    id: 'executive-brand-system-kit',
    name: 'Executive Brand System Kit',
    description: 'Assets for high-polish executive decks, master slides, decision summaries, and brand-safe review pages.',
    items: [
      {
        id: 'brand-primary-logo-svg',
        slot: 'logo',
        label: 'Primary approved logo',
        usage: 'Use in title, master, CTA, and governance slides. Must be exact source artwork.',
        formats: ['svg', 'png'],
        preferredTemplates: ['pres-master-hero-orb', 'pres-logo-safe-zone-master', 'pres-executive-decision-grid'],
      },
      {
        id: 'brand-reverse-logo-svg',
        slot: 'logo',
        label: 'Reverse approved logo',
        usage: 'Use on dark master slides and cinematic presentation backgrounds.',
        formats: ['svg', 'png'],
        preferredTemplates: ['pres-master-hero-orb', 'pres-ai-command-center', 'pres-global-event-opener'],
      },
      {
        id: 'executive-orb-background',
        slot: 'orb',
        label: 'Atmospheric brand orb',
        usage: 'Use as a non-logo visual motif behind hero titles or section openers.',
        formats: ['png', 'webp'],
        preferredTemplates: ['pres-master-hero-orb', 'pres-ai-command-center'],
        promptHint: 'Abstract glowing orb, deep navy background, premium enterprise keynote lighting.',
      },
      {
        id: 'premium-grid-texture',
        slot: 'texture',
        label: 'Subtle grid texture',
        usage: 'Use behind dashboards, roadmap rails, and command-center layouts.',
        formats: ['png', 'webp', 'svg'],
        preferredTemplates: ['pres-ai-command-center', 'pres-data-observatory', 'pres-roadmap-neon-rail'],
      },
    ],
  },
  {
    id: 'global-event-launch-kit',
    name: 'Global Event Launch Kit',
    description: 'Venue, sponsor, speaker, and CTA assets for event opener decks and conference slides.',
    items: [
      {
        id: 'venue-wide-hero-photo',
        slot: 'hero',
        label: 'Wide venue hero photo',
        usage: 'Drop into event opener slides as the main right-side cinematic image.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-global-event-opener', 'pres-case-study-cinematic'],
        promptHint: 'Wide cinematic venue photo with natural perspective and dark gradient safe area on one side.',
      },
      {
        id: 'city-night-background',
        slot: 'background',
        label: 'City-at-night background',
        usage: 'Use for event openers, party recaps, sponsor slides, and closing CTAs.',
        formats: ['jpg', 'webp'],
        preferredTemplates: ['pres-global-event-opener', 'pres-resource-qr-cta'],
      },
      {
        id: 'sponsor-logo-set',
        slot: 'sponsor-logo',
        label: 'Sponsor logo set',
        usage: 'Drop partner marks into sponsor rails. Use SVG whenever possible.',
        formats: ['svg', 'png'],
        preferredTemplates: ['pres-global-event-opener', 'pres-portfolio-gallery-wall'],
      },
      {
        id: 'speaker-headshot-cinematic',
        slot: 'person',
        label: 'Speaker headshot',
        usage: 'Use for speaker intros, agenda modules, and keynote title slides.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-global-event-opener', 'pres-portfolio-gallery-wall'],
      },
    ],
  },
  {
    id: 'product-story-kit',
    name: 'Product Story Kit',
    description: 'Product renders, device frames, UI panels, and detail shots for launch and demo decks.',
    items: [
      {
        id: 'transparent-product-render',
        slot: 'product-render',
        label: 'Transparent product render',
        usage: 'Drop into product showcase hero areas. Transparent PNG preferred.',
        formats: ['png', 'webp'],
        preferredTemplates: ['pres-immersive-product-showcase'],
        promptHint: 'Transparent product render, premium studio lighting, no text baked into image.',
      },
      {
        id: 'laptop-ui-mockup',
        slot: 'device-mockup',
        label: 'Laptop UI mockup',
        usage: 'Use for product demo, resource CTA, and platform overview slides.',
        formats: ['png', 'webp'],
        preferredTemplates: ['pres-immersive-product-showcase', 'pres-resource-qr-cta'],
      },
      {
        id: 'floating-ui-panel',
        slot: 'ui-panel',
        label: 'Floating UI panel',
        usage: 'Layer inside command center or product slides to imply software workflow.',
        formats: ['png', 'webp', 'svg'],
        preferredTemplates: ['pres-ai-command-center', 'pres-immersive-product-showcase'],
        promptHint: 'Minimal enterprise SaaS UI card, glass panel, clean charts, no readable brand names.',
      },
      {
        id: 'feature-detail-shot',
        slot: 'gallery',
        label: 'Feature detail shot',
        usage: 'Drop into the three detail image slots on product showcase slides.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-immersive-product-showcase', 'pres-portfolio-gallery-wall'],
      },
    ],
  },
  {
    id: 'data-story-kit',
    name: 'Data Story Kit',
    description: 'Dashboard, chart, map, and signal assets for data-heavy executive narratives.',
    items: [
      {
        id: 'dashboard-screenshot-clean',
        slot: 'chart',
        label: 'Clean dashboard screenshot',
        usage: 'Drop into data observatory slides as the main visual proof area.',
        formats: ['png', 'webp'],
        preferredTemplates: ['pres-data-observatory', 'pres-ai-command-center'],
      },
      {
        id: 'global-map-heatmap',
        slot: 'map',
        label: 'Global map heatmap',
        usage: 'Use for market coverage, localization footprint, and regional performance slides.',
        formats: ['png', 'svg', 'webp'],
        preferredTemplates: ['pres-data-observatory', 'pres-executive-decision-grid'],
        promptHint: 'Abstract global heatmap, clean geographic silhouette, enterprise presentation style.',
      },
      {
        id: 'signal-icon-set',
        slot: 'icon',
        label: 'Signal icon set',
        usage: 'Use in signal cards and insight rows. Keep one stroke weight across the set.',
        formats: ['svg', 'png'],
        preferredTemplates: ['pres-data-observatory', 'pres-logo-safe-zone-master'],
      },
      {
        id: 'kpi-card-stack',
        slot: 'ui-panel',
        label: 'KPI card stack',
        usage: 'Use as a modular dashboard element for executive metric slides.',
        formats: ['png', 'webp', 'svg'],
        preferredTemplates: ['pres-ai-command-center', 'pres-data-observatory'],
      },
    ],
  },
  {
    id: 'campaign-review-kit',
    name: 'Campaign Review Kit',
    description: 'Assets for showing campaign outputs, visual systems, case studies, and before/after improvements.',
    items: [
      {
        id: 'campaign-social-tile',
        slot: 'gallery',
        label: 'Social campaign tile',
        usage: 'Drop into portfolio gallery wall panels to show social extensions.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-portfolio-gallery-wall'],
      },
      {
        id: 'event-signage-mockup',
        slot: 'gallery',
        label: 'Event signage mockup',
        usage: 'Use in campaign gallery and case-study proof sections.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-portfolio-gallery-wall', 'pres-case-study-cinematic'],
      },
      {
        id: 'print-piece-mockup',
        slot: 'gallery',
        label: 'Print piece mockup',
        usage: 'Show postcards, one-pagers, packets, or handouts as supporting campaign assets.',
        formats: ['jpg', 'png', 'webp'],
        preferredTemplates: ['pres-portfolio-gallery-wall'],
      },
      {
        id: 'resource-qr',
        slot: 'qr',
        label: 'Resource QR code',
        usage: 'Drop into CTA or product launch slides for downloads and follow-up resources.',
        formats: ['svg', 'png'],
        preferredTemplates: ['pres-resource-qr-cta', 'pres-immersive-product-showcase'],
      },
    ],
  },
];
