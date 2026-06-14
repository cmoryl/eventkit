import type { PresentationAssetKit } from './presentationDragDropAssetKits';

export const PRESENTATION_ADVANCED_ASSET_PACKS: PresentationAssetKit[] = [
  {
    id: 'boardroom-decision-asset-pack',
    name: 'Boardroom Decision Asset Pack',
    description: 'Executive-ready visuals for decision memos, board packs, strategic recommendations, and risk reviews.',
    items: [
      { id: 'boardroom-decision-grid-bg', slot: 'background', label: 'Boardroom decision grid background', usage: 'Use behind decision matrices and executive recommendation slides.', formats: ['svg', 'png', 'webp'], preferredTemplates: ['boardroom-decision-pack', 'pres-executive-decision-grid'], promptHint: 'Subtle boardroom decision grid, light background, navy lines, premium consulting style.' },
      { id: 'executive-risk-icon-set', slot: 'icon', label: 'Executive risk icon set', usage: 'Use for risk, opportunity, status, action, and owner cards.', formats: ['svg', 'png'], preferredTemplates: ['boardroom-decision-pack', 'brand-governance-kit'], promptHint: 'Minimal line icons, consistent stroke, risk/opportunity/status/action/owner.' },
      { id: 'decision-scorecard-ui', slot: 'ui-panel', label: 'Decision scorecard UI panel', usage: 'Use in boardroom insight stacks and KPI summary panels.', formats: ['svg', 'png', 'webp'], preferredTemplates: ['boardroom-decision-pack', 'data-observatory-pro'], promptHint: 'Clean executive scorecard UI panel, no tiny text, editable-like blocks.' },
      { id: 'recommendation-stamp-set', slot: 'icon', label: 'Recommendation stamp set', usage: 'Use for approved, watch, invest, hold, reduce, and next-step labels.', formats: ['svg', 'png'], preferredTemplates: ['boardroom-decision-pack', 'brand-governance-kit'], promptHint: 'Compact approval and recommendation stamps, simple geometric shape language.' },
    ],
  },
  {
    id: 'ai-command-asset-pack',
    name: 'AI Command Asset Pack',
    description: 'Abstract AI, workflow, governance, and orchestration assets for enterprise AI decks.',
    items: [
      { id: 'ai-command-orb-system', slot: 'orb', label: 'AI command orb system', usage: 'Use as hero and section-divider visual motif for AI transformation decks.', formats: ['png', 'webp', 'svg'], preferredTemplates: ['enterprise-ai-nexus', 'pres-ai-command-center'], promptHint: 'Abstract enterprise AI orb, deep navy, cyan/violet glow, no robots.' },
      { id: 'workflow-node-map', slot: 'map', label: 'Workflow node map', usage: 'Use in AI operating model and workflow orchestration diagrams.', formats: ['svg', 'png'], preferredTemplates: ['enterprise-ai-nexus', 'pres-ai-command-center'], promptHint: 'Node-link workflow map, limited nodes, primary path highlighted.' },
      { id: 'governance-control-panel', slot: 'ui-panel', label: 'Governance control panel', usage: 'Use for approval gates, audit states, and governance checkpoints.', formats: ['svg', 'png', 'webp'], preferredTemplates: ['enterprise-ai-nexus', 'brand-governance-kit'], promptHint: 'Glass governance dashboard, status checks, audit controls, no readable brand names.' },
      { id: 'ai-signal-icon-system', slot: 'icon', label: 'AI signal icon system', usage: 'Use for orchestration, source, review, model, security, and output steps.', formats: ['svg', 'png'], preferredTemplates: ['enterprise-ai-nexus', 'data-observatory-pro'], promptHint: 'Thin line AI workflow icons, geometric, consistent stroke.' },
    ],
  },
  {
    id: 'data-viz-asset-pack',
    name: 'Data Viz Asset Pack',
    description: 'Chart frames, map shells, KPI modules, and visual data overlays for data-heavy presentations.',
    items: [
      { id: 'chart-frame-system', slot: 'chart', label: 'Chart frame system', usage: 'Use around line, bar, heatmap, and waterfall charts as a consistent visual container.', formats: ['svg', 'png'], preferredTemplates: ['data-observatory-pro', 'boardroom-decision-pack'], promptHint: 'Clean chart frame system, direct labels, source note, insight header.' },
      { id: 'map-pin-signal-set', slot: 'map', label: 'Map pin signal set', usage: 'Use on global signal maps and regional performance slides.', formats: ['svg', 'png'], preferredTemplates: ['data-observatory-pro', 'global-launch-keynote'], promptHint: 'Signal pins, status rings, compact legend, global map overlays.' },
      { id: 'sparkline-card-stack', slot: 'ui-panel', label: 'Sparkline card stack', usage: 'Use for small-multiple KPI panels and ticker strips.', formats: ['svg', 'png', 'webp'], preferredTemplates: ['data-observatory-pro', 'enterprise-ai-nexus'], promptHint: 'Small KPI cards with sparklines, direct value labels, calm data styling.' },
      { id: 'data-annotation-callouts', slot: 'icon', label: 'Data annotation callouts', usage: 'Use for trend notes, peak labels, source notes, and recommendation chips.', formats: ['svg', 'png'], preferredTemplates: ['data-observatory-pro', 'thought-leadership-editorial'], promptHint: 'Numbered annotation chips and source labels for charts.' },
    ],
  },
  {
    id: 'event-experience-asset-pack',
    name: 'Event Experience Asset Pack',
    description: 'Venue, speaker, sponsor, activation, and recap assets for premium event decks.',
    items: [
      { id: 'venue-stage-hero-set', slot: 'hero', label: 'Venue stage hero set', usage: 'Use in event openers, keynote sections, and recap decks.', formats: ['jpg', 'png', 'webp'], preferredTemplates: ['global-launch-keynote', 'event-experience-system'], promptHint: 'Cinematic venue stage hero, premium lighting, clean title safe area.' },
      { id: 'activation-render-panel', slot: 'gallery', label: 'Activation render panel', usage: 'Use for booth, signage, sponsor moment, and attendee journey slides.', formats: ['jpg', 'png', 'webp'], preferredTemplates: ['event-experience-system', 'global-launch-keynote'], promptHint: 'Premium event activation render, signage placeholders, no fake logos.' },
      { id: 'speaker-card-image-mask', slot: 'person', label: 'Speaker image mask', usage: 'Use for speaker cards, lineup slides, agenda highlights, and session pages.', formats: ['png', 'svg'], preferredTemplates: ['global-launch-keynote', 'immersive-workshop-lab'], promptHint: 'Speaker portrait mask system with cinematic crop and dark overlay.' },
      { id: 'sponsor-tier-logo-grid', slot: 'sponsor-logo', label: 'Sponsor tier logo grid', usage: 'Use for sponsor tiers and partner acknowledgements with safe logo handling.', formats: ['svg', 'png'], preferredTemplates: ['global-launch-keynote', 'event-experience-system'], promptHint: 'Tiered sponsor logo grid with safe zones and neutral cells.' },
    ],
  },
  {
    id: 'product-launch-asset-pack',
    name: 'Product Launch Asset Pack',
    description: 'Product render, UI mockup, feature callout, and launch CTA assets for product decks.',
    items: [
      { id: 'transparent-product-hero-render', slot: 'product-render', label: 'Transparent product hero render', usage: 'Use in product opener and product proof slides.', formats: ['png', 'webp'], preferredTemplates: ['product-os-launch', 'pres-immersive-product-showcase'], promptHint: 'Transparent product render, premium studio light, no text baked in.' },
      { id: 'device-mockup-system', slot: 'device-mockup', label: 'Device mockup system', usage: 'Use for laptop/tablet/mobile screens with screenshot drop zones.', formats: ['png', 'svg', 'webp'], preferredTemplates: ['product-os-launch', 'data-observatory-pro'], promptHint: 'Clean device frame system, realistic shadows, screenshot safe area.' },
      { id: 'feature-callout-pin-set', slot: 'icon', label: 'Feature callout pin set', usage: 'Use to label product features, dashboard regions, and workflow steps.', formats: ['svg', 'png'], preferredTemplates: ['product-os-launch', 'enterprise-ai-nexus'], promptHint: 'Small numbered callout pins, product marketing style.' },
      { id: 'launch-resource-qr-panel', slot: 'qr', label: 'Launch resource QR panel', usage: 'Use for product launch downloads, demo links, and follow-up resources.', formats: ['svg', 'png'], preferredTemplates: ['product-os-launch', 'global-launch-keynote'], promptHint: 'QR code panel with CTA headline and resource notes.' },
    ],
  },
  {
    id: 'editorial-proof-asset-pack',
    name: 'Editorial Proof Asset Pack',
    description: 'Editorial image crops, quote treatments, proof visuals, and paper textures for thought-leadership decks.',
    items: [
      { id: 'editorial-image-crop-set', slot: 'gallery', label: 'Editorial image crop set', usage: 'Use for essay-style section openers, quotes, and proof pages.', formats: ['jpg', 'png', 'webp'], preferredTemplates: ['thought-leadership-editorial', 'cinematic-case-study-system'], promptHint: 'Magazine editorial image crops, premium negative space, authentic lighting.' },
      { id: 'paper-texture-overlay', slot: 'texture', label: 'Paper texture overlay', usage: 'Use subtly behind editorial slides and thought leadership pages.', formats: ['png', 'webp'], preferredTemplates: ['thought-leadership-editorial', 'editorial-light'], promptHint: 'Subtle warm paper grain texture, no visible pattern repeat.' },
      { id: 'quote-mark-ornament-set', slot: 'icon', label: 'Quote mark ornament set', usage: 'Use in large pull quote and editorial proof slides.', formats: ['svg', 'png'], preferredTemplates: ['thought-leadership-editorial', 'cinematic-case-study-system'], promptHint: 'Elegant oversized quote mark ornament, minimal, editorial.' },
      { id: 'proof-caption-rail', slot: 'ui-panel', label: 'Proof caption rail', usage: 'Use as caption/source/insight strip under imagery and charts.', formats: ['svg', 'png'], preferredTemplates: ['thought-leadership-editorial', 'data-observatory-pro'], promptHint: 'Caption rail with source note, insight sentence, and subtle rule.' },
    ],
  },
];
