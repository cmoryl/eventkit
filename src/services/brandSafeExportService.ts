import JSZip from 'jszip';
import type { AssetType, GeneratedAsset } from '@/types';
import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { sanitizeFileName } from '@/utils';
import { generatePreflightReportText, getAssetSetPreflightSummary, preflightAssetSet } from './assetPreflightService';

interface BrandSafeExportOptions {
  eventName: string;
  assets: GeneratedAsset[];
  brandProfile: BrandProfile;
  mode?: BrandMode;
  allowWarnings?: boolean;
}

export interface BrandSafeExportResult {
  exported: boolean;
  blocked: boolean;
  overallScore: number;
  blockingCount: number;
  reviewCount: number;
  message: string;
}

const addAssetToFolder = (folder: JSZip, asset: { id: string; type: AssetType; title: string; content: string | string[] | unknown }) => {
  if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
    const base64Data = asset.content.split(',')[1];
    const ext = asset.content.includes('image/png') ? 'png' : 'jpg';
    folder.file(`${sanitizeFileName(asset.title)}.${ext}`, base64Data, { base64: true });
    return;
  }

  if (Array.isArray(asset.content)) {
    const text = asset.content.map((item, index) => (
      typeof item === 'string' ? `${index + 1}. ${item}` : JSON.stringify(item, null, 2)
    )).join('\n\n');
    folder.file(`${sanitizeFileName(asset.title)}.txt`, text);
    return;
  }

  if (typeof asset.content === 'string') {
    folder.file(`${sanitizeFileName(asset.title)}.txt`, asset.content);
  }
};

export const exportAssetsWithBrandPreflight = async ({
  eventName,
  assets,
  brandProfile,
  mode,
  allowWarnings = true,
}: BrandSafeExportOptions): Promise<BrandSafeExportResult> => {
  const activeMode = mode ?? brandProfile.defaultMode;
  const completedAssets = assets.filter((asset) => !asset.isLoading);
  const results = preflightAssetSet(completedAssets, brandProfile, activeMode);
  const summary = getAssetSetPreflightSummary(results);
  const hasBlockingErrors = results.some((result) => result.validation.issues.some((issue) => issue.severity === 'error'));

  if (activeMode === 'locked' && hasBlockingErrors) {
    return {
      exported: false,
      blocked: true,
      overallScore: summary.overallScore,
      blockingCount: summary.blockingCount,
      reviewCount: summary.reviewCount,
      message: 'Export blocked: locked mode has brand compliance errors.',
    };
  }

  if (!allowWarnings && summary.reviewCount > 0) {
    return {
      exported: false,
      blocked: true,
      overallScore: summary.overallScore,
      blockingCount: summary.blockingCount,
      reviewCount: summary.reviewCount,
      message: 'Export blocked: review items require approval.',
    };
  }

  const zip = new JSZip();
  const folder = zip.folder(sanitizeFileName(eventName) || 'event-assets');
  if (!folder) throw new Error('Could not create zip folder');

  completedAssets.forEach((asset) => addAssetToFolder(folder, asset));

  zip.file('brand-preflight-report.txt', generatePreflightReportText(results, brandProfile, activeMode));
  zip.file('eventkit-export-manifest.json', JSON.stringify({
    exportedAt: new Date().toISOString(),
    eventName,
    brandProfileId: brandProfile.id,
    brandProfileName: brandProfile.name,
    mode: activeMode,
    summary,
    assetCount: completedAssets.length,
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(eventName) || 'event-assets'}-brand-safe.zip`;
  link.click();
  URL.revokeObjectURL(url);

  return {
    exported: true,
    blocked: false,
    overallScore: summary.overallScore,
    blockingCount: summary.blockingCount,
    reviewCount: summary.reviewCount,
    message: summary.reviewCount > 0 ? 'Export completed with brand review warnings.' : 'Export completed with brand approval.',
  };
};
