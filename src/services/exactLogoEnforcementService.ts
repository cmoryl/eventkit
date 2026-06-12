import { AssetType } from '@/types';
import { compositeLogoOntoImage, positionFromAssetType, scaleFromAssetType } from './logoCompositor';
import type { LogoVisibilityMode } from './logoVisibilityService';
import { getLogoVisibilityDecision, getLogoVisibilityMode } from './logoVisibilityService';

export interface ExactLogoEnforcementResult<T = unknown> {
  content: T;
  applied: boolean;
  reason: string;
}

const isImageLikeContent = (content: unknown): content is string => {
  if (typeof content !== 'string') return false;
  return content.startsWith('data:image/') || content.startsWith('http://') || content.startsWith('https://') || content.startsWith('blob:');
};

export const getLogoReferenceForGeneration = (
  assetType: AssetType,
  logoUrl?: string,
  mode: LogoVisibilityMode = getLogoVisibilityMode()
): string | undefined => {
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));

  // Hard rule: never send the source logo to the image model for visible placement.
  // The model must reserve a blank logo-safe zone; the exact logo is composited afterward.
  if (!decision.shouldShowLogo || !logoUrl) return undefined;
  return undefined;
};

export const shouldApplyExactLogoOverlay = (
  assetType: AssetType,
  logoUrl?: string,
  mode: LogoVisibilityMode = getLogoVisibilityMode()
) => {
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));
  return Boolean(logoUrl && decision.shouldShowLogo && decision.requirement !== 'hidden');
};

const compositeOne = async (assetType: AssetType, content: string, logoUrl: string, mode: LogoVisibilityMode) => {
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));
  return compositeLogoOntoImage({
    generatedImageUrl: content,
    logoUrl,
    position: positionFromAssetType(assetType),
    scale: Math.min(decision.constraints.maxWidthPercent / 100, scaleFromAssetType(assetType)),
    padding: 0.045,
    // Always use a source-safe backing plate. This is intentional: it covers
    // any AI-created placeholder/logo-like marks and guarantees the visible
    // mark comes from the exact source logo file only.
    backingPlate: true,
    backingPlateOpacity: 0.94,
  });
};

export const enforceExactLogoOnGeneratedContent = async <T = unknown>(args: {
  assetType: AssetType;
  content: T;
  logoUrl?: string;
  mode?: LogoVisibilityMode;
}): Promise<ExactLogoEnforcementResult<T | string | string[]>> => {
  const { assetType, content, logoUrl, mode = getLogoVisibilityMode() } = args;
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));

  if (decision.requirement === 'hidden') {
    return { content, applied: false, reason: 'Logo hidden by user or asset policy.' };
  }

  if (!logoUrl) {
    return { content, applied: false, reason: 'No exact logo source available. Logo was not invented.' };
  }

  if (!decision.shouldShowLogo) {
    return { content, applied: false, reason: 'Logo not required for this asset policy.' };
  }

  try {
    if (isImageLikeContent(content)) {
      const composited = await compositeOne(assetType, content, logoUrl, mode);
      return { content: composited, applied: true, reason: 'Exact source logo composited after generation.' };
    }

    if (Array.isArray(content)) {
      const imageItems = content.filter(isImageLikeContent);
      if (!imageItems.length) {
        return { content, applied: false, reason: 'Array content does not contain image URLs/data URLs and cannot be composited.' };
      }

      const compositedItems = await Promise.all(content.map(async (item) => (
        isImageLikeContent(item) ? compositeOne(assetType, item, logoUrl, mode) : item
      )));

      return { content: compositedItems as string[], applied: true, reason: 'Exact source logo composited onto generated image array.' };
    }

    return { content, applied: false, reason: 'Content is not an image URL/data URL and cannot be composited.' };
  } catch (error) {
    console.warn('Exact logo compositing failed; returning generated content without invented logo:', error);
    return { content, applied: false, reason: 'Exact logo compositing failed. Original content returned without logo mutation.' };
  }
};

export const buildExactLogoGenerationInstruction = (
  assetType: AssetType,
  logoUrl?: string,
  mode: LogoVisibilityMode = getLogoVisibilityMode()
) => {
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));

  if (decision.requirement === 'hidden') {
    return 'EXACT LOGO HARD RULE: Logo is hidden. Do not draw, invent, approximate, or leave a fake logo mark. Brand look must come from approved colors, typography, motif, layout, and imagery only.';
  }

  if (!logoUrl) {
    return 'EXACT LOGO HARD RULE: No logo source is available. Do not invent or approximate any logo. Reserve a clean future logo-safe zone only if required by the asset type.';
  }

  if (decision.shouldShowLogo) {
    return 'EXACT LOGO HARD RULE: Do not draw, recreate, trace, recolor, distort, or approximate the logo inside the AI image. Leave a blank, empty, unobstructed logo-safe zone with no placeholder mark, no fake wordmark, and no logo-like shape. The real uploaded/source logo will be composited afterward by deterministic overlay so the logo shape and look never drift.';
  }

  return 'EXACT LOGO HARD RULE: Logo is optional for this asset. Do not invent a logo; use brand look and feel without changing the source logo.';
};
