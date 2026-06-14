import type { PresentationAssetSlot } from './presentationDragDropAssetKits';

export interface PresentationAssetSubVariant {
  id: string;
  label: string;
  description: string;
  promptModifier: string;
  bestFor: string[];
}

export interface PresentationAssetVariant {
  id: string;
  label: string;
  description: string;
  visualRules: string[];
  subVariants: PresentationAssetSubVariant[];
}

export interface PresentationAssetVariantFamily {
  id: string;
  slot: PresentationAssetSlot;
  label: string;
  description: string;
  preferredTemplates: string[];
  variants: PresentationAssetVariant[];
}

export const PRESENTATION_ASSET_VARIANT_FAMILIES: PresentationAssetVariantFamily[] = [
  {
    id: 'variant-family-ai-orb',
    slot: 'orb',
    label: 'AI Orb Systems',
    description: 'Abstract AI aura and command-center orb variations for hero, section break, and dashboard slides.',
    preferredTemplates: ['enterprise-ai-nexus', 'pres-ai-command-center', 'pres-master-hero-orb'],
    variants: [
      {
        id: 'ai-orb-deep-navy',
        label: 'Deep Navy Glow',
        description: 'Premium enterprise orb with cyan/violet lighting on deep navy.',
        visualRules: ['dark background', 'soft radial glow', 'no robot forms', 'ample title-safe space'],
        subVariants: [
          { id: 'ai-orb-deep-navy-calm', label: 'Calm', description: 'Subtle low-energy glow for executive slides.', promptModifier: 'calm low-intensity cyan/violet glow, restrained contrast', bestFor: ['boardroom', 'governance', 'section opener'] },
          { id: 'ai-orb-deep-navy-kinetic', label: 'Kinetic', description: 'Higher-energy orbit trails for launch or transformation slides.', promptModifier: 'kinetic orbit trails, controlled motion feel, premium launch energy', bestFor: ['keynote opener', 'AI transformation', 'product launch'] },
          { id: 'ai-orb-deep-navy-data', label: 'Data Aura', description: 'Adds signal points and subtle data constellations.', promptModifier: 'subtle data constellation points, signal particles, no readable text', bestFor: ['data story', 'AI operations', 'dashboard slides'] },
        ],
      },
      {
        id: 'ai-orb-light-glass',
        label: 'Light Glass Orb',
        description: 'Clean light-mode orb for reports, handouts, and quieter enterprise decks.',
        visualRules: ['light background', 'transparent glass feel', 'low saturation', 'clean edges'],
        subVariants: [
          { id: 'ai-orb-light-glass-ice', label: 'Ice Blue', description: 'Cool translucent orb with pale blue accents.', promptModifier: 'translucent ice blue glass orb, clean white background', bestFor: ['reports', 'training', 'governance'] },
          { id: 'ai-orb-light-glass-prism', label: 'Prism', description: 'Soft prism refractions without rainbow clutter.', promptModifier: 'subtle prism refraction, restrained color split, no rainbow clutter', bestFor: ['innovation', 'AI concept', 'editorial'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-event-hero',
    slot: 'hero',
    label: 'Event Hero Imagery',
    description: 'Venue, stage, city, and activation hero image variations for event and conference decks.',
    preferredTemplates: ['global-launch-keynote', 'event-experience-system', 'pres-global-event-opener'],
    variants: [
      {
        id: 'event-hero-stage',
        label: 'Stage Hero',
        description: 'Cinematic stage image with clean title-safe space.',
        visualRules: ['wide 16:9 crop', 'no readable signage', 'no fake logos', 'dramatic but controlled lighting'],
        subVariants: [
          { id: 'event-stage-keynote', label: 'Keynote', description: 'Large keynote stage with speaker-safe framing.', promptModifier: 'large keynote stage, premium lighting, no readable signage, clean left title area', bestFor: ['event opener', 'speaker intro'] },
          { id: 'event-stage-afterparty', label: 'Afterparty', description: 'Night energy with upscale venue atmosphere.', promptModifier: 'upscale afterparty lighting, rich night tones, tasteful energy, no messy crowd', bestFor: ['recap', 'social highlight'] },
          { id: 'event-stage-sponsor', label: 'Sponsor Moment', description: 'Open composition for sponsor tier overlays.', promptModifier: 'wide sponsor moment composition, neutral signage placeholders, clean logo-safe lower band', bestFor: ['sponsorship', 'partner slide'] },
        ],
      },
      {
        id: 'event-hero-city',
        label: 'City Context',
        description: 'City or destination environment with event-safe negative space.',
        visualRules: ['authentic location tone', 'avoid tourist cliché overload', 'title-safe area', 'no fake signs'],
        subVariants: [
          { id: 'event-city-night', label: 'Night City', description: 'Premium city-at-night look.', promptModifier: 'premium city night background, deep blue atmosphere, clean space for headline', bestFor: ['global launch', 'event opener'] },
          { id: 'event-city-arrival', label: 'Arrival', description: 'Travel/arrival energy for event kickoff.', promptModifier: 'arrival moment, venue exterior feel, premium corporate event energy', bestFor: ['agenda opener', 'welcome'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-data-visual',
    slot: 'chart',
    label: 'Data Visualization Assets',
    description: 'Chart container, dashboard, map, and annotation asset variations for executive data slides.',
    preferredTemplates: ['data-observatory-pro', 'boardroom-decision-pack', 'pres-data-observatory'],
    variants: [
      {
        id: 'data-viz-dashboard',
        label: 'Dashboard Panels',
        description: 'Clean dashboard-style visual modules with editable-feeling blocks.',
        visualRules: ['large readable chart shapes', 'direct label space', 'no tiny UI text', 'source-safe footer area'],
        subVariants: [
          { id: 'dashboard-dark-glass', label: 'Dark Glass', description: 'Dark observatory dashboard with glass cards.', promptModifier: 'dark glass dashboard cards, cyan/green accents, large chart shapes only', bestFor: ['AI data', 'operations', 'executive dashboard'] },
          { id: 'dashboard-light-report', label: 'Light Report', description: 'Clean white report-friendly dashboard.', promptModifier: 'white dashboard report cards, navy labels, subtle dividers, clean whitespace', bestFor: ['board report', 'client handout'] },
          { id: 'dashboard-signal-wall', label: 'Signal Wall', description: 'Multiple small metric panels arranged as an insight wall.', promptModifier: 'metric signal wall, small multiples, readable cards, sorted hierarchy', bestFor: ['portfolio scan', 'regional comparison'] },
        ],
      },
      {
        id: 'data-viz-map',
        label: 'Map Layers',
        description: 'Global/regional map overlays with pins, heat, and status signals.',
        visualRules: ['simplified geography', 'limited legend', 'direct region labels', 'no unsupported claims'],
        subVariants: [
          { id: 'map-global-pins', label: 'Global Pins', description: 'Clean pin-based global signal layer.', promptModifier: 'simplified world map, glowing region pins, compact legend, dark navy background', bestFor: ['global coverage', 'localization'] },
          { id: 'map-heat-coverage', label: 'Coverage Heat', description: 'Single-hue heatmap for market or coverage intensity.', promptModifier: 'single-hue global heatmap, no rainbow scale, direct callout cards', bestFor: ['market coverage', 'regional performance'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-product-renders',
    slot: 'product-render',
    label: 'Product Render Systems',
    description: 'Product hero, detail, and device-render variations for platform/product launch slides.',
    preferredTemplates: ['product-os-launch', 'pres-immersive-product-showcase'],
    variants: [
      {
        id: 'product-render-studio',
        label: 'Studio Product Render',
        description: 'Clean transparent render with polished lighting.',
        visualRules: ['transparent background preferred', 'no baked-in text', 'clean reflections', 'title-safe spacing'],
        subVariants: [
          { id: 'product-render-floating', label: 'Floating', description: 'Floating product angle with soft shadow.', promptModifier: 'floating transparent product render, soft studio shadow, premium SaaS style', bestFor: ['product opener', 'feature overview'] },
          { id: 'product-render-detail', label: 'Detail Cutaway', description: 'Close-up feature detail view.', promptModifier: 'product detail cutaway, highlight feature zone, clean callout-safe area', bestFor: ['feature proof', 'demo slide'] },
          { id: 'product-render-stack', label: 'Multi-Surface Stack', description: 'Stacked screens or panels for ecosystem story.', promptModifier: 'stacked product surfaces, laptop/tablet/mobile mix, no readable fake text', bestFor: ['platform overview', 'ecosystem'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-device-mockup',
    slot: 'device-mockup',
    label: 'Device Mockups',
    description: 'Laptop, tablet, phone, and multi-device variations with screenshot-safe zones.',
    preferredTemplates: ['product-os-launch', 'data-observatory-pro', 'pres-immersive-product-showcase'],
    variants: [
      {
        id: 'device-mockup-saas',
        label: 'SaaS Interface Mockup',
        description: 'Device frame with screenshot drop zone and callout pins.',
        visualRules: ['accurate perspective', 'screenshot-safe crop', 'no fake brand marks', 'editable callout space'],
        subVariants: [
          { id: 'device-laptop-hero', label: 'Laptop Hero', description: 'Large laptop frame for demo screenshots.', promptModifier: 'clean laptop frame, large screenshot drop zone, subtle shadow', bestFor: ['demo opener', 'product proof'] },
          { id: 'device-tablet-workflow', label: 'Tablet Workflow', description: 'Tablet frame for workflow or app experience.', promptModifier: 'tablet frame, workflow UI placeholder, callout pins, clean background', bestFor: ['workflow', 'training'] },
          { id: 'device-multi-platform', label: 'Multi-Platform', description: 'Laptop/tablet/mobile ecosystem composition.', promptModifier: 'multi-device mockup, platform ecosystem, layered screens, no tiny labels', bestFor: ['platform launch', 'solution overview'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-logo-rail',
    slot: 'sponsor-logo',
    label: 'Logo Rail Systems',
    description: 'Partner/sponsor/customer logo rail variations with strict safe-zone behavior.',
    preferredTemplates: ['global-launch-keynote', 'event-experience-system', 'brand-governance-kit'],
    variants: [
      {
        id: 'logo-rail-tiered',
        label: 'Tiered Logo Rail',
        description: 'Logo rail separated by sponsor/customer tier.',
        visualRules: ['exact logos only', 'equal safe cells', 'no recolor unless approved', 'neutral background'],
        subVariants: [
          { id: 'logo-rail-premier', label: 'Premier Tier', description: 'Large primary sponsor/customer logos.', promptModifier: 'large premier tier logo cells, generous safe zone, neutral background strip', bestFor: ['sponsor deck', 'event opener'] },
          { id: 'logo-rail-grid', label: 'Grid Tier', description: 'Balanced grid for many logos.', promptModifier: 'balanced grid of logo cells, equal safe zones, subtle dividers', bestFor: ['partner page', 'case study proof'] },
          { id: 'logo-rail-dark', label: 'Dark Rail', description: 'Dark-mode rail requiring reverse logo checks.', promptModifier: 'dark sponsor rail, reverse logos only, strict contrast and clearspace', bestFor: ['dark keynote', 'closing slide'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-editorial-imagery',
    slot: 'gallery',
    label: 'Editorial Imagery',
    description: 'Magazine-style imagery, proof captions, and editorial visual treatments.',
    preferredTemplates: ['thought-leadership-editorial', 'cinematic-case-study-system', 'editorial-light'],
    variants: [
      {
        id: 'editorial-proof-photo',
        label: 'Proof Photography',
        description: 'Authentic, cinematic imagery for case studies and thought leadership.',
        visualRules: ['authentic lighting', 'avoid stock cliché', 'caption-safe rail', 'clear subject hierarchy'],
        subVariants: [
          { id: 'editorial-human-context', label: 'Human Context', description: 'Human-scale scene without generic corporate stock feel.', promptModifier: 'authentic human-scale editorial scene, natural lighting, no cheesy handshake', bestFor: ['case study', 'thought leadership'] },
          { id: 'editorial-abstract-proof', label: 'Abstract Proof', description: 'Abstract texture or environment supporting a thesis.', promptModifier: 'abstract editorial proof image, premium texture, quiet negative space', bestFor: ['insight opener', 'quote page'] },
          { id: 'editorial-documentary', label: 'Documentary', description: 'Documentary-style proof scene for outcomes.', promptModifier: 'documentary-style business proof scene, cinematic crop, no staged smiles', bestFor: ['results story', 'transformation'] },
        ],
      },
    ],
  },
  {
    id: 'variant-family-qr-cta',
    slot: 'qr',
    label: 'QR CTA Systems',
    description: 'QR and resource CTA component variations for event, product, and sales follow-up slides.',
    preferredTemplates: ['global-launch-keynote', 'product-os-launch', 'event-experience-system', 'pres-resource-qr-cta'],
    variants: [
      {
        id: 'qr-cta-panel',
        label: 'Resource CTA Panel',
        description: 'QR area with supporting copy and follow-up destination.',
        visualRules: ['minimum QR size', 'high contrast', 'scannability required', 'destination review required'],
        subVariants: [
          { id: 'qr-cta-light', label: 'Light Panel', description: 'Clean white QR panel for print and screen.', promptModifier: 'white QR CTA panel, large scan area, clear headline and short URL', bestFor: ['handout', 'closing slide'] },
          { id: 'qr-cta-dark', label: 'Dark Panel', description: 'Dark-mode QR panel with contrast-safe white code area.', promptModifier: 'dark QR CTA panel, white QR safe area, high contrast, premium finish', bestFor: ['keynote', 'event closing'] },
          { id: 'qr-cta-resource-card', label: 'Resource Card', description: 'Small QR resource card paired with contact information.', promptModifier: 'compact resource card, QR block, contact line, CTA headline', bestFor: ['sales handoff', 'product demo'] },
        ],
      },
    ],
  },
];

export const getPresentationAssetVariantFamiliesForSlot = (slot: PresentationAssetSlot) => PRESENTATION_ASSET_VARIANT_FAMILIES.filter((family) => family.slot === slot);

export const getPresentationAssetVariantFamiliesForTemplate = (templateId: string) => PRESENTATION_ASSET_VARIANT_FAMILIES.filter((family) => family.preferredTemplates.includes(templateId));

export const buildPresentationAssetVariantPromptBlock = (templateId?: string) => {
  const families = templateId ? getPresentationAssetVariantFamiliesForTemplate(templateId) : PRESENTATION_ASSET_VARIANT_FAMILIES;
  return [
    'PRESENTATION ASSET VARIANTS AND SUB-VARIANTS',
    templateId ? `Template: ${templateId}` : 'Template: any',
    'Use variants to generate multiple asset directions without breaking brand or export safety.',
    ...families.flatMap((family) => [
      `Family: ${family.label} [${family.slot}]`,
      ...family.variants.flatMap((variant) => [
        `- Variant: ${variant.label}: ${variant.description}`,
        ...variant.subVariants.map((subVariant) => `  - Sub-variant: ${subVariant.label}: ${subVariant.promptModifier}`),
      ]),
    ]),
  ].join('\n');
};
