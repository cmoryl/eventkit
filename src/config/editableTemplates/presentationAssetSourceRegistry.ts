export type PresentationAssetRightsStatus = 'approved' | 'needs-review' | 'unknown' | 'restricted';

export interface PresentationAssetSourceRecord {
  assetId: string;
  sourceType: 'brand-library' | 'generated' | 'uploaded' | 'stock' | 'system-template';
  rightsStatus: PresentationAssetRightsStatus;
  owner: string;
  usageNotes: string;
  requiredChecks: string[];
}

export const PRESENTATION_ASSET_SOURCE_REGISTRY: PresentationAssetSourceRecord[] = [
  {
    assetId: 'brand-primary-logo-svg',
    sourceType: 'brand-library',
    rightsStatus: 'approved',
    owner: 'Brand team',
    usageNotes: 'Use exact source artwork only. Never recolor, skew, redraw, distort, or approximate the logo.',
    requiredChecks: ['exact-logo', 'safe-zone', 'no-distortion', 'approved-format'],
  },
  {
    assetId: 'brand-reverse-logo-svg',
    sourceType: 'brand-library',
    rightsStatus: 'approved',
    owner: 'Brand team',
    usageNotes: 'Use only on approved dark backgrounds with adequate contrast and clearspace.',
    requiredChecks: ['exact-logo', 'contrast', 'safe-zone', 'approved-format'],
  },
  {
    assetId: 'sponsor-logo-set',
    sourceType: 'uploaded',
    rightsStatus: 'needs-review',
    owner: 'Event team',
    usageNotes: 'Sponsor marks require source approval and tier placement review before export.',
    requiredChecks: ['exact-logo', 'sponsor-approval', 'safe-zone', 'no-distortion'],
  },
  {
    assetId: 'venue-stage-hero-set',
    sourceType: 'generated',
    rightsStatus: 'needs-review',
    owner: 'Creative team',
    usageNotes: 'Generated venue imagery should avoid fake signage and should not imply a real venue unless verified.',
    requiredChecks: ['no-fake-signage', 'rights-review', 'title-safe-area', 'resolution'],
  },
  {
    assetId: 'dashboard-screenshot-clean',
    sourceType: 'uploaded',
    rightsStatus: 'needs-review',
    owner: 'Product/Data team',
    usageNotes: 'Dashboard screenshots must remove confidential data and avoid tiny unreadable labels.',
    requiredChecks: ['confidentiality-review', 'readability', 'source-label', 'resolution'],
  },
  {
    assetId: 'global-map-heatmap',
    sourceType: 'system-template',
    rightsStatus: 'approved',
    owner: 'Presentation Studio',
    usageNotes: 'Use simplified geographic silhouettes. Avoid misleading country-level claims unless data supports them.',
    requiredChecks: ['data-source', 'legend', 'direct-labels', 'accessibility'],
  },
  {
    assetId: 'resource-qr',
    sourceType: 'uploaded',
    rightsStatus: 'needs-review',
    owner: 'Campaign team',
    usageNotes: 'QR code must be tested at export size and must point to approved destination.',
    requiredChecks: ['qr-scan', 'destination-review', 'contrast', 'minimum-size'],
  },
  {
    assetId: 'launch-resource-qr-panel',
    sourceType: 'system-template',
    rightsStatus: 'approved',
    owner: 'Presentation Studio',
    usageNotes: 'Use as QR container only; actual QR payload requires scan and destination review.',
    requiredChecks: ['qr-scan', 'destination-review', 'minimum-size'],
  },
];

export const getPresentationAssetSourceRecord = (assetId: string) => PRESENTATION_ASSET_SOURCE_REGISTRY.find((record) => record.assetId === assetId);
