import type { ColorInfo, GeneratedAsset } from '@/types';
import type { BrandMode, BrandProfile, BrandValidationResult } from '@/types/brandProfile';
import { validateAssetAgainstBrand } from './brandComplianceValidator';

const extractColorsFromAsset = (asset: GeneratedAsset): string[] => {
  if (Array.isArray(asset.content)) {
    return asset.content
      .filter((item): item is ColorInfo => typeof item === 'object' && item !== null && 'hex' in item)
      .map((item) => item.hex);
  }

  const params = asset.generationParams as Record<string, unknown> | undefined;
  const paramColors = params
    ? Object.values(params).filter((value): value is string => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value))
    : [];

  return paramColors;
};

export interface AssetPreflightResult {
  assetId: string;
  assetTitle: string;
  assetType: string;
  validation: BrandValidationResult;
}

export const preflightAsset = (
  asset: GeneratedAsset,
  brandProfile: BrandProfile,
  mode?: BrandMode
): AssetPreflightResult => {
  const colors = extractColorsFromAsset(asset);

  const validation = validateAssetAgainstBrand({
    colors,
    hasLogo: asset.type === 'LOGO' || Boolean(asset.logoId),
    assetType: asset.type,
    mode: mode ?? brandProfile.defaultMode,
  }, brandProfile);

  return {
    assetId: asset.id,
    assetTitle: asset.title,
    assetType: asset.type,
    validation,
  };
};

export const preflightAssetSet = (
  assets: GeneratedAsset[],
  brandProfile: BrandProfile,
  mode?: BrandMode
): AssetPreflightResult[] => assets.map((asset) => preflightAsset(asset, brandProfile, mode));

export const getAssetSetPreflightSummary = (results: AssetPreflightResult[]) => {
  if (results.length === 0) {
    return {
      overallScore: 100,
      approvedCount: 0,
      reviewCount: 0,
      blockingCount: 0,
    };
  }

  const overallScore = Math.round(results.reduce((total, result) => total + result.validation.overallScore, 0) / results.length);
  const approvedCount = results.filter((result) => result.validation.approved).length;
  const blockingCount = results.filter((result) => result.validation.issues.some((issue) => issue.severity === 'error')).length;
  const reviewCount = results.length - approvedCount;

  return {
    overallScore,
    approvedCount,
    reviewCount,
    blockingCount,
  };
};
