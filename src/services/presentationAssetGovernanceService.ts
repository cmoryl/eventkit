import { getUnifiedPresentationAssetLibrary } from './presentationUnifiedAssetLibraryService';
import { getPresentationAssetSourceRecord, PRESENTATION_ASSET_SOURCE_REGISTRY } from '@/config/editableTemplates/presentationAssetSourceRegistry';

export const getPresentationAssetGovernanceSummary = () => {
  const library = getUnifiedPresentationAssetLibrary();
  const governedItems = library.items.filter((item) => getPresentationAssetSourceRecord(item.id));
  const ungovernedItems = library.items.filter((item) => !getPresentationAssetSourceRecord(item.id));
  const approved = PRESENTATION_ASSET_SOURCE_REGISTRY.filter((record) => record.rightsStatus === 'approved').length;
  const review = PRESENTATION_ASSET_SOURCE_REGISTRY.filter((record) => record.rightsStatus === 'needs-review').length;

  return {
    totalLibraryItems: library.items.length,
    sourceRecords: PRESENTATION_ASSET_SOURCE_REGISTRY.length,
    governedItems: governedItems.length,
    ungovernedItems: ungovernedItems.length,
    approvedSourceRecords: approved,
    needsReviewSourceRecords: review,
    coveragePercent: Math.round((governedItems.length / Math.max(library.items.length, 1)) * 100),
  };
};

export const buildPresentationAssetGovernancePromptBlock = () => {
  const summary = getPresentationAssetGovernanceSummary();
  return [
    'PRESENTATION ASSET GOVERNANCE',
    `Source coverage: ${summary.coveragePercent}%`,
    `Governed items: ${summary.governedItems}/${summary.totalLibraryItems}`,
    `Approved source records: ${summary.approvedSourceRecords}`,
    `Needs review records: ${summary.needsReviewSourceRecords}`,
    'Before export, verify exact logos, rights/source status, resolution, crop safety, QR scannability, and accessibility labels.',
  ].join('\n');
};
