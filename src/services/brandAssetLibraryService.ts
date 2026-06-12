import type { BrandProfile } from '@/types/brandProfile';

export type BrandGuideAssetType =
  | 'primary-logo'
  | 'secondary-logo'
  | 'transparent-png'
  | 'svg-mark'
  | 'photography'
  | 'illustration'
  | 'pattern'
  | 'texture'
  | 'icon'
  | 'product'
  | 'campaign-reference'
  | 'do-example'
  | 'dont-example';

export type BrandGuideAssetUsage =
  | 'logo-overlay'
  | 'generation-reference'
  | 'background-system'
  | 'pattern-system'
  | 'icon-system'
  | 'layout-reference'
  | 'style-reference'
  | 'restricted-reference';

export interface BrandGuideAsset {
  id: string;
  brandProfileId: string;
  name: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  type: BrandGuideAssetType;
  usage: BrandGuideAssetUsage;
  tags: string[];
  notes?: string;
  isPrimary?: boolean;
  locked?: boolean;
  createdAt: string;
}

export interface BrandAssetGenerationContext {
  primaryLogo?: BrandGuideAsset;
  logos: BrandGuideAsset[];
  visualReferences: BrandGuideAsset[];
  patternReferences: BrandGuideAsset[];
  layoutReferences: BrandGuideAsset[];
  doExamples: BrandGuideAsset[];
  dontExamples: BrandGuideAsset[];
  promptBlock: string;
}

const BRAND_ASSETS_KEY = 'eventkit-brand-guide-assets';
const MAX_REFERENCE_IMAGES = 8;
const MAX_PROMPT_ASSETS = 12;

const hasStorage = () => typeof localStorage !== 'undefined';

const safeParse = (raw: string | null): BrandGuideAsset[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const readBrandGuideAssets = (): BrandGuideAsset[] => {
  if (!hasStorage()) return [];
  return safeParse(localStorage.getItem(BRAND_ASSETS_KEY));
};

export const writeBrandGuideAssets = (assets: BrandGuideAsset[]) => {
  if (hasStorage()) localStorage.setItem(BRAND_ASSETS_KEY, JSON.stringify(assets));
  return assets;
};

export const getBrandGuideAssetsForProfile = (brandProfileId: string) =>
  readBrandGuideAssets().filter((asset) => asset.brandProfileId === brandProfileId);

export const saveBrandGuideAsset = (asset: BrandGuideAsset) => {
  const current = readBrandGuideAssets();
  const normalizedAsset = asset.isPrimary
    ? { ...asset, usage: asset.usage === 'restricted-reference' ? asset.usage : 'logo-overlay' as BrandGuideAssetUsage }
    : asset;

  const next = current.map((item) => {
    if (item.brandProfileId === normalizedAsset.brandProfileId && normalizedAsset.isPrimary && item.usage === 'logo-overlay') {
      return { ...item, isPrimary: false };
    }
    return item;
  });

  writeBrandGuideAssets([...next.filter((item) => item.id !== normalizedAsset.id), normalizedAsset]);
  return normalizedAsset;
};

export const deleteBrandGuideAsset = (assetId: string) => {
  const next = readBrandGuideAssets().filter((asset) => asset.id !== assetId);
  writeBrandGuideAssets(next);
  return next;
};

export const setPrimaryBrandLogoAsset = (brandProfileId: string, assetId: string) => {
  const next = readBrandGuideAssets().map((asset) => {
    if (asset.brandProfileId !== brandProfileId) return asset;
    return { ...asset, isPrimary: asset.id === assetId, usage: asset.id === assetId ? 'logo-overlay' as BrandGuideAssetUsage : asset.usage };
  });
  writeBrandGuideAssets(next);
  return next.find((asset) => asset.id === assetId);
};

export const fileToBrandGuideAsset = (args: {
  file: File;
  brandProfileId: string;
  type: BrandGuideAssetType;
  usage: BrandGuideAssetUsage;
  tags?: string[];
  notes?: string;
  isPrimary?: boolean;
}): Promise<BrandGuideAsset> => {
  const { file, brandProfileId, type, usage, tags = [], notes, isPrimary } = args;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: `asset-${brandProfileId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        brandProfileId,
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataUrl: String(reader.result),
        type,
        usage,
        tags,
        notes,
        isPrimary,
        locked: isPrimary || type === 'primary-logo',
        createdAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
};

export const inferBrandAssetType = (file: File): BrandGuideAssetType => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (name.includes('logo') || name.includes('wordmark')) return 'primary-logo';
  if (type.includes('svg') || name.endsWith('.svg')) return 'svg-mark';
  if (type.includes('png')) return 'transparent-png';
  if (name.includes('pattern')) return 'pattern';
  if (name.includes('texture')) return 'texture';
  if (name.includes('icon')) return 'icon';
  return 'photography';
};

export const inferBrandAssetUsage = (assetType: BrandGuideAssetType): BrandGuideAssetUsage => {
  if (assetType === 'primary-logo' || assetType === 'secondary-logo' || assetType === 'svg-mark') return 'logo-overlay';
  if (assetType === 'pattern' || assetType === 'texture') return 'pattern-system';
  if (assetType === 'icon') return 'icon-system';
  if (assetType === 'do-example') return 'style-reference';
  if (assetType === 'dont-example') return 'restricted-reference';
  return 'generation-reference';
};

const byCreatedDesc = (a: BrandGuideAsset, b: BrandGuideAsset) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const buildAssetLine = (asset: BrandGuideAsset) => {
  const tags = asset.tags.length ? ` Tags: ${asset.tags.join(', ')}.` : '';
  const notes = asset.notes ? ` Notes: ${asset.notes}` : '';
  return `• ${asset.name} — ${asset.type}, usage: ${asset.usage}.${tags}${notes}`;
};

export const buildBrandAssetPromptBlock = (context: Omit<BrandAssetGenerationContext, 'promptBlock'>, brandProfile?: BrandProfile) => `
=== BRAND GUIDE ASSET LIBRARY ===
BRAND: ${brandProfile?.name || 'Active brand'}

AVAILABLE SOURCE ASSETS:
${[
  ...context.logos,
  ...context.visualReferences,
  ...context.patternReferences,
  ...context.layoutReferences,
  ...context.doExamples,
  ...context.dontExamples,
].slice(0, MAX_PROMPT_ASSETS).map(buildAssetLine).join('\n') || 'No uploaded brand assets saved yet.'}

USAGE RULES:
  • Treat uploaded logos, SVGs, transparent PNGs, icons, product images, patterns, textures, and reference visuals as authoritative brand inputs.
  • Do not redraw, mutate, or approximate any uploaded logo or SVG mark. Exact logos must be overlaid from source assets only.
  • Use photography, illustration, texture, and pattern assets as style/reference material for composition, background systems, motif language, color mood, and design details.
  • Use do-example assets as positive style references.
  • Use dont-example or restricted-reference assets only as negative guidance; never imitate them.
  • When transparent PNG/SVG elements are available, prefer using them as clean overlays or motif references instead of inventing new shapes.
=== END BRAND GUIDE ASSET LIBRARY ===
`;

export const getBrandAssetGenerationContext = (brandProfileId: string, brandProfile?: BrandProfile): BrandAssetGenerationContext => {
  const assets = getBrandGuideAssetsForProfile(brandProfileId).sort(byCreatedDesc);
  const logos = assets.filter((asset) => ['primary-logo', 'secondary-logo', 'svg-mark'].includes(asset.type) || asset.usage === 'logo-overlay');
  const primaryLogo = logos.find((asset) => asset.isPrimary) || logos[0];
  const visualReferences = assets
    .filter((asset) => ['photography', 'illustration', 'transparent-png', 'product', 'campaign-reference'].includes(asset.type) && asset.usage !== 'restricted-reference')
    .slice(0, MAX_REFERENCE_IMAGES);
  const patternReferences = assets
    .filter((asset) => ['pattern', 'texture'].includes(asset.type) || asset.usage === 'pattern-system' || asset.usage === 'background-system')
    .slice(0, MAX_REFERENCE_IMAGES);
  const layoutReferences = assets
    .filter((asset) => asset.usage === 'layout-reference')
    .slice(0, MAX_REFERENCE_IMAGES);
  const doExamples = assets.filter((asset) => asset.type === 'do-example' || asset.usage === 'style-reference').slice(0, MAX_REFERENCE_IMAGES);
  const dontExamples = assets.filter((asset) => asset.type === 'dont-example' || asset.usage === 'restricted-reference').slice(0, MAX_REFERENCE_IMAGES);

  const contextWithoutPrompt = {
    primaryLogo,
    logos,
    visualReferences,
    patternReferences,
    layoutReferences,
    doExamples,
    dontExamples,
  };

  return {
    ...contextWithoutPrompt,
    promptBlock: buildBrandAssetPromptBlock(contextWithoutPrompt, brandProfile),
  };
};
