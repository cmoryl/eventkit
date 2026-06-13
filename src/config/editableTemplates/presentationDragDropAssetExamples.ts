// Presentation drag/drop asset examples — used to guide template QA, docs, and future asset picker presets

export type PresentationDragDropAssetKind =
  | 'hero-image'
  | 'product-render'
  | 'device-mockup'
  | 'logo'
  | 'sponsor-logo'
  | 'icon'
  | 'chart-export'
  | 'qr-code'
  | 'gallery-asset';

export interface PresentationDragDropAssetExample {
  id: string;
  kind: PresentationDragDropAssetKind;
  label: string;
  recommendedFormats: string[];
  recommendedUse: string;
  bestTemplates: string[];
  promptHint?: string;
}

export const PRESENTATION_DRAG_DROP_ASSET_EXAMPLES: PresentationDragDropAssetExample[] = [
  {
    id: 'global-event-venue-photo',
    kind: 'hero-image',
    label: 'Venue or city hero image',
    recommendedFormats: ['jpg', 'png', 'webp'],
    recommendedUse: 'Drop into global event openers, case studies, and cinematic title slides.',
    bestTemplates: ['pres-global-event-opener', 'pres-case-study-cinematic', 'pres-master-hero-orb'],
    promptHint: 'Wide cinematic venue or city image with space for typography on the left.',
  },
  {
    id: 'product-device-render',
    kind: 'product-render',
    label: 'Product or platform render',
    recommendedFormats: ['png', 'webp'],
    recommendedUse: 'Drop transparent product renders into launch and product showcase slides.',
    bestTemplates: ['pres-immersive-product-showcase', 'pres-resource-qr-cta'],
    promptHint: 'Transparent PNG product UI render, angled perspective, premium lighting.',
  },
  {
    id: 'dashboard-chart-export',
    kind: 'chart-export',
    label: 'Chart or dashboard screenshot',
    recommendedFormats: ['png', 'webp'],
    recommendedUse: 'Drop dashboard exports into data-story slides without rebuilding charts manually.',
    bestTemplates: ['pres-data-observatory', 'pres-ai-command-center', 'pres-executive-decision-grid'],
    promptHint: 'Clean data visualization screenshot, high contrast, no tiny unreadable labels.',
  },
  {
    id: 'approved-logo-set',
    kind: 'logo',
    label: 'Approved logo set',
    recommendedFormats: ['svg', 'png'],
    recommendedUse: 'Drop exact approved logos into safe-zone and title systems. Never regenerate logos.',
    bestTemplates: ['pres-logo-safe-zone-master', 'pres-global-event-opener', 'pres-master-hero-orb'],
  },
  {
    id: 'sponsor-logo-rail',
    kind: 'sponsor-logo',
    label: 'Sponsor logo rail',
    recommendedFormats: ['svg', 'png'],
    recommendedUse: 'Drop partner or sponsor marks into event opener logo rails.',
    bestTemplates: ['pres-global-event-opener', 'pres-portfolio-gallery-wall'],
  },
  {
    id: 'signal-icon-pack',
    kind: 'icon',
    label: 'Signal icon pack',
    recommendedFormats: ['svg', 'png'],
    recommendedUse: 'Drop simple icons into signal cards, feature rows, and governance slides.',
    bestTemplates: ['pres-data-observatory', 'pres-logo-safe-zone-master', 'pres-immersive-product-showcase'],
    promptHint: 'Thin-line icon set, one stroke weight, rounded caps, monochrome or brand accent.',
  },
  {
    id: 'campaign-gallery-assets',
    kind: 'gallery-asset',
    label: 'Campaign asset gallery',
    recommendedFormats: ['jpg', 'png', 'webp'],
    recommendedUse: 'Drop a set of campaign outputs into the gallery wall for review or presentation.',
    bestTemplates: ['pres-portfolio-gallery-wall', 'pres-case-study-cinematic'],
  },
  {
    id: 'resource-qr-code',
    kind: 'qr-code',
    label: 'Resource QR code',
    recommendedFormats: ['svg', 'png'],
    recommendedUse: 'Drop QR codes into CTA slides for follow-up resources, surveys, or downloads.',
    bestTemplates: ['pres-resource-qr-cta', 'pres-immersive-product-showcase'],
  },
];
