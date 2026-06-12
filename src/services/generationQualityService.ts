import { AssetType } from '@/types';
import { getAssetConfig } from '@/config/assetConfig';
import type { BrandMode } from '@/types/brandProfile';

export type GenerationQualityLevel = 'draft' | 'production';

export interface AssetGenerationContract {
  assetType: AssetType;
  family: 'hero' | 'social' | 'signage' | 'badge' | 'merchandise' | 'deck' | 'utility' | 'content' | 'environmental' | 'brand-core';
  intent: string;
  requiredHierarchy: string[];
  mustHave: string[];
  mustAvoid: string[];
  productionChecks: string[];
}

const baseProductionChecks = [
  'Looks intentionally designed, not like a generic AI filler image.',
  'Uses the same brand system as the rest of the kit.',
  'Readable at the expected viewing distance and output size.',
  'Preserves clean typography zones and safe logo placement.',
  'No fake UI glitches, malformed text, broken logos, random artifacts, or unrelated imagery.',
];

const contracts: Partial<Record<AssetType, Omit<AssetGenerationContract, 'assetType'>>> = {
  [AssetType.Banner]: {
    family: 'hero',
    intent: 'Large-format event/campaign identity asset that establishes the full visual system.',
    requiredHierarchy: ['event/campaign name', 'date or core message', 'location or CTA', 'logo/sponsor zone'],
    mustHave: ['large readable headline', 'strong negative space', 'repeatable background/motif', 'print-safe margins'],
    mustAvoid: ['small text blocks', 'visual clutter', 'changing the style from other assets'],
    productionChecks: ['Must be legible from distance.', 'Must preserve hero-level brand impact.'],
  },
  [AssetType.SocialPost]: {
    family: 'social',
    intent: 'Mobile-first social tile that feels like a cropped/simplified expression of the hero system.',
    requiredHierarchy: ['short hook', 'event/campaign identity', 'date or CTA'],
    mustHave: ['strong thumbnail read', 'same motif/background family', 'safe crop zones', 'minimal copy'],
    mustAvoid: ['paragraph copy', 'new color palette', 'generic stock composition'],
    productionChecks: ['Must work at small mobile preview size.', 'Must still feel connected to signage and hero assets.'],
  },
  [AssetType.SocialStory]: {
    family: 'social',
    intent: 'Vertical story asset optimized for mobile scanning and platform-native rhythm.',
    requiredHierarchy: ['hook', 'event/campaign identity', 'CTA/date'],
    mustHave: ['vertical composition', 'clear top/middle/bottom zones', 'same brand motif', 'safe UI margins'],
    mustAvoid: ['tiny footer text', 'horizontal-only layouts', 'unreadable contrast'],
    productionChecks: ['Must respect vertical safe areas.', 'Must match the social post and hero system.'],
  },
  [AssetType.EventSignage]: {
    family: 'signage',
    intent: 'Directional or informational signage that prioritizes scan speed and brand consistency.',
    requiredHierarchy: ['direction/location/action', 'supporting detail', 'brand/event mark'],
    mustHave: ['large type', 'high contrast', 'consistent arrow/icon style', 'clear margins'],
    mustAvoid: ['decorative clutter', 'thin fonts', 'low-contrast backgrounds'],
    productionChecks: ['Must be readable in three seconds.', 'Must use same wayfinding band/icon language across signage.'],
  },
  [AssetType.NameTag]: {
    family: 'badge',
    intent: 'Attendee identity badge that stays readable at close range and belongs to the event system.',
    requiredHierarchy: ['attendee name zone', 'role/company zone', 'event/brand mark'],
    mustHave: ['clear name field', 'consistent accent stripe/motif', 'logo safe zone', 'simple background'],
    mustAvoid: ['busy pattern behind name', 'tiny role text', 'oversized decorative art'],
    productionChecks: ['Name zone must remain the visual priority.', 'Must align with lanyard and registration assets.'],
  },
  [AssetType.Lanyard]: {
    family: 'badge',
    intent: 'Repeatable small-format identity strip for event access and brand visibility.',
    requiredHierarchy: ['logo/event mark', 'pattern or short text repeat'],
    mustHave: ['simple repeated motif', 'limited color count', 'clear logo repeat spacing'],
    mustAvoid: ['complex scenes', 'tiny paragraphs', 'photorealistic clutter'],
    productionChecks: ['Must work as a repeating strip.', 'Must remain printable on narrow material.'],
  },
  [AssetType.Tshirt]: {
    family: 'merchandise',
    intent: 'Merchandise design that distills the brand system into a memorable wearable mark.',
    requiredHierarchy: ['icon/motif or event name', 'minimal support detail'],
    mustHave: ['print-safe graphic', 'few colors', 'strong central composition', 'recognizable motif'],
    mustAvoid: ['poster-style overload', 'tiny text', 'unprintable detail', 'random mockup artifacts'],
    productionChecks: ['Must work as a simplified print graphic.', 'Must feel related to hero and social assets.'],
  },
  [AssetType.PresentationSlide]: {
    family: 'deck',
    intent: 'Presentation slide that extends the same visual system into structured content.',
    requiredHierarchy: ['slide title', 'one main idea', 'supporting detail/footer'],
    mustHave: ['repeatable title bar', 'content card logic', 'consistent footer/page zone'],
    mustAvoid: ['changing slide systems', 'dense copy over artwork', 'too many type sizes'],
    productionChecks: ['Must support a full deck system, not just one decorative slide.'],
  },
  [AssetType.WifiSign]: {
    family: 'utility',
    intent: 'Functional utility sign that is instantly readable and still branded.',
    requiredHierarchy: ['utility label', 'network/password info zone', 'brand/event mark'],
    mustHave: ['large info panel', 'clean contrast', 'minimal background motif', 'no visual noise around key info'],
    mustAvoid: ['decorative obstruction', 'low contrast', 'tiny functional text'],
    productionChecks: ['Network/password zone must be the clearest part of the sign.'],
  },
  [AssetType.QRCode]: {
    family: 'utility',
    intent: 'Functional QR asset with enough quiet zone and brand context.',
    requiredHierarchy: ['QR code zone', 'clear instruction', 'brand/event mark'],
    mustHave: ['quiet zone', 'high contrast', 'simple instruction', 'safe margins'],
    mustAvoid: ['pattern over QR', 'low contrast code', 'decorative obstruction'],
    productionChecks: ['QR scan area must remain clean and unobstructed.'],
  },
  [AssetType.BackWall]: {
    family: 'environmental',
    intent: 'Large environmental backdrop that scales the hero system into physical space.',
    requiredHierarchy: ['brand/event identity', 'motif/background field', 'sponsor/logo safe zones'],
    mustHave: ['large-scale composition', 'safe edges', 'viewing distance legibility', 'repeatable environmental motif'],
    mustAvoid: ['tiny details', 'overcrowded sponsor zones', 'new art direction'],
    productionChecks: ['Must work as a real physical backdrop viewed from distance.'],
  },
};

const fallbackContract = (assetType: AssetType): AssetGenerationContract => {
  const config = getAssetConfig(assetType);
  return {
    assetType,
    family: config?.category === 'print' ? 'signage' : config?.category === 'merchandise' ? 'merchandise' : config?.category === 'digital' ? 'social' : config?.category === 'utilities' ? 'utility' : 'hero',
    intent: config?.description || 'Create a brand-consistent event asset.',
    requiredHierarchy: ['primary message', 'supporting detail', 'brand/event mark'],
    mustHave: ['clear hierarchy', 'brand colors', 'consistent typography', 'safe margins'],
    mustAvoid: ['generic styling', 'off-brand colors', 'visual clutter', 'unreadable text'],
    productionChecks: ['Must match the coordinated brand kit.', 'Must be suitable for the asset format.'],
  };
};

export const getAssetGenerationContract = (assetType: AssetType): AssetGenerationContract => ({
  ...fallbackContract(assetType),
  ...(contracts[assetType] || {}),
  assetType,
});

export const buildGenerationQualityPromptBlock = (assetType: AssetType, mode: BrandMode, level: GenerationQualityLevel = 'production') => {
  const contract = getAssetGenerationContract(assetType);
  const config = getAssetConfig(assetType);
  const printSpec = config?.printSpec
    ? `${config.printSpec.widthInches}" × ${config.printSpec.heightInches}" @ ${config.printSpec.dpi}dpi, ${config.printSpec.colorMode}, bleed ${config.printSpec.bleedInches}"`
    : config?.aspectRatio || `${config?.pixelWidth || 'auto'} × ${config?.pixelHeight || 'auto'}`;

  return `
=== GENERATION QUALITY CONTRACT ===
QUALITY LEVEL: ${level}
COMPLIANCE MODE: ${mode}
ASSET TYPE: ${config?.title || assetType}
ASSET FAMILY: ${contract.family}
OUTPUT FORMAT / SIZE: ${printSpec}

INTENT:
${contract.intent}

REQUIRED MESSAGE HIERARCHY:
${contract.requiredHierarchy.map((item, index) => `  ${index + 1}. ${item}`).join('\n')}

MUST HAVE:
${contract.mustHave.map((item) => `  • ${item}`).join('\n')}

MUST AVOID:
${contract.mustAvoid.map((item) => `  ✗ ${item}`).join('\n')}

PRODUCTION CHECKS:
${[...baseProductionChecks, ...contract.productionChecks].map((item) => `  ✓ ${item}`).join('\n')}

GENERATION DISCIPLINE:
  • Create the asset as a finished professional design, not an abstract moodboard.
  • Do not invent extra logos, brands, sponsors, random people, or unrelated objects.
  • Use placeholder text only where the product intentionally needs editable attendee/schedule data.
  • Prioritize clean composition, brand consistency, and format-specific readability over visual novelty.
  • If the asset is small or functional, simplify the brand system instead of adding detail.
=== END GENERATION QUALITY CONTRACT ===
`;
};
