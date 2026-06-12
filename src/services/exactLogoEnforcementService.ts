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
  // The model must reserve a logo-safe zone; the exact logo is composited afterward.
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

export const enforceExactLogoOnGeneratedContent = async <T = unknown>(args: {
  assetType: AssetType;
  content: T;
  logoUrl?: string;
  mode?: LogoVisibilityMode;
}): Promise<ExactLogoEnforcementResult<T | string>> => {
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

  if (!isImageLikeContent(content)) {
    return { content, applied: false, reason: 'Content is not an image URL/data URL and cannot be composited.' };
  }

  try {
    const composited = await compositeLogoOntoImage({
      generatedImageUrl: content,
      logoUrl,
      position: positionFromAssetType(assetType),
      scale: Math.min(decision.constraints.maxWidthPercent / 100, scaleFromAssetType(assetType)),
      padding: 0.045,
      backingPlate: false,
    });

    return { content: composited, applied: true, reason: 'Exact source logo composited after generation.' };
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
    return 'EXACT LOGO HARD RULE: Do not draw, recreate, trace, recolor, distort, or approximate the logo inside the AI image. Leave a clean logo-safe zone. The real uploaded logo will be composited afterward by deterministic overlay so the logo shape and look never drift.';
  }

  return 'EXACT LOGO HARD RULE: Logo is optional for this asset. Do not invent a logo; use brand look and feel without changing the source logo.';
};
