import { AssetType } from '@/types';
import type { ColorInfo, EventDetails } from '@/types';
import type { BrandContext } from '@/types/brand.types';
import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { buildGenerationQualityPromptBlock } from './generationQualityService';

export type AssetFamily = 'hero' | 'social' | 'signage' | 'badge' | 'merchandise' | 'deck' | 'utility' | 'content' | 'environmental';

export interface AssetFamilyRule {
  family: AssetFamily;
  purpose: string;
  composition: string;
  hierarchy: string;
  reusableElements: string[];
  avoid: string[];
}

export interface CrossAssetConsistencySystem {
  systemName: string;
  brandName: string;
  mode: BrandMode;
  visualSignature: string;
  compositionGrid: string;
  typographySystem: string;
  colorSystem: string;
  logoSystem: string;
  backgroundSystem: string;
  motifSystem: string;
  assetFamilyRules: Record<AssetFamily, AssetFamilyRule>;
  globalDo: string[];
  globalAvoid: string[];
}

const familyByAssetType: Partial<Record<AssetType, AssetFamily>> = {
  [AssetType.Banner]: 'hero',
  [AssetType.EmailHeader]: 'hero',
  [AssetType.BackWall]: 'hero',
  [AssetType.MainStageBackdrop]: 'hero',
  [AssetType.SocialPost]: 'social',
  [AssetType.SocialStory]: 'social',
  [AssetType.SocialProfile]: 'social',
  [AssetType.NameTag]: 'badge',
  [AssetType.NameTagBack]: 'badge',
  [AssetType.Lanyard]: 'badge',
  [AssetType.EventSignage]: 'signage',
  [AssetType.HangingSignage]: 'signage',
  [AssetType.OutdoorSignage]: 'signage',
  [AssetType.DoorSignage]: 'signage',
  [AssetType.EaselSignage]: 'signage',
  [AssetType.LocationSignage]: 'signage',
  [AssetType.RoomSignage]: 'signage',
  [AssetType.StandUpPillarBanner]: 'signage',
  [AssetType.FeatherFlag]: 'signage',
  [AssetType.TeardropFlag]: 'signage',
  [AssetType.Tshirt]: 'merchandise',
  [AssetType.TshirtBack]: 'merchandise',
  [AssetType.TshirtSleeve]: 'merchandise',
  [AssetType.SwagBag]: 'merchandise',
  [AssetType.StickerSheet]: 'merchandise',
  [AssetType.Hat]: 'merchandise',
  [AssetType.WaterBottle]: 'merchandise',
  [AssetType.PresentationSlide]: 'deck',
  [AssetType.Presentation]: 'deck',
  [AssetType.QRCode]: 'utility',
  [AssetType.WifiSign]: 'utility',
  [AssetType.MarketingCopy]: 'content',
  [AssetType.RunOfShow]: 'content',
  [AssetType.AgendaHighlights]: 'content',
  [AssetType.ThankYouNote]: 'content',
  [AssetType.Folder]: 'content',
  [AssetType.Menu]: 'content',
  [AssetType.FloorPlan]: 'utility',
  [AssetType.RegistrationCounter]: 'environmental',
  [AssetType.WelcomeCounter]: 'environmental',
  [AssetType.RegistrationBackWall]: 'environmental',
  [AssetType.TechnologyCounter]: 'environmental',
  [AssetType.Kiosk]: 'environmental',
  [AssetType.GlassDoor]: 'environmental',
  [AssetType.GlassDoubleDoor]: 'environmental',
  [AssetType.GlassRotatingDoor]: 'environmental',
};

const getAssetFamily = (assetType: AssetType): AssetFamily => familyByAssetType[assetType] || 'hero';

const cleanList = (items: Array<string | undefined | null>) => items.filter(Boolean) as string[];

const getProfileColor = (profile: BrandProfile, role: string, fallback?: string) => profile.colors.find((color) => color.role === role)?.hex || fallback;

const buildFamilyRules = (): Record<AssetFamily, AssetFamilyRule> => ({
  hero: {
    family: 'hero',
    purpose: 'Large-format first impression assets that establish the campaign/event look.',
    composition: 'Use the strongest version of the visual signature: full background treatment, large title lockup, strong negative space, clear sponsor/logo zones.',
    hierarchy: 'Event name or campaign headline first, date/location second, CTA/sponsor details third.',
    reusableElements: ['signature background', 'headline lockup', 'brand motif', 'consistent logo zone'],
    avoid: ['tiny secondary text', 'busy backgrounds behind headlines', 'new visual styles not used elsewhere'],
  },
  social: {
    family: 'social',
    purpose: 'Platform-native campaign tiles that feel like crops from the same master system.',
    composition: 'Reuse hero background/motif but simplify for mobile. Keep the same corner language and title treatment.',
    hierarchy: 'Hook/headline first, event identity second, CTA/date third.',
    reusableElements: ['cropped hero motif', 'same headline treatment', 'same CTA chip style'],
    avoid: ['new gradients per post', 'too much copy', 'unrelated imagery crops'],
  },
  signage: {
    family: 'signage',
    purpose: 'Navigation and directional assets that prioritize scan speed while staying branded.',
    composition: 'Use high-contrast panels, consistent arrows/icons, repeated header/footer bands, and generous margins.',
    hierarchy: 'Location/action first, supporting details second, brand mark third.',
    reusableElements: ['wayfinding band', 'icon badge', 'directional arrow style', 'consistent footer mark'],
    avoid: ['decorative clutter', 'thin type', 'low-contrast directional cues'],
  },
  badge: {
    family: 'badge',
    purpose: 'Personal identification pieces that connect to the wider event system at small size.',
    composition: 'Use a simplified background field, role/name zone, and repeatable accent stripe or motif.',
    hierarchy: 'Name first, role/company second, event/brand mark third.',
    reusableElements: ['accent stripe', 'small motif', 'name field panel', 'consistent logo placement'],
    avoid: ['busy patterns behind names', 'overly small role text', 'unreadable color combinations'],
  },
  merchandise: {
    family: 'merchandise',
    purpose: 'Wearable and physical goods that distill the system into iconic marks.',
    composition: 'Favor fewer elements, single strong mark, simplified motif, and print-safe color count.',
    hierarchy: 'Icon/motif or event name first, supporting text only when necessary.',
    reusableElements: ['hero motif simplified', 'single-color logo treatment', 'limited palette'],
    avoid: ['full poster layouts on shirts', 'tiny details', 'complex gradients unless print-safe'],
  },
  deck: {
    family: 'deck',
    purpose: 'Presentation assets that extend the system into structured storytelling.',
    composition: 'Use repeatable title bars, section markers, content cards, and consistent slide margins.',
    hierarchy: 'Slide title first, one main idea second, supporting detail third.',
    reusableElements: ['section divider style', 'content card style', 'consistent page number/footer'],
    avoid: ['changing slide systems', 'too many type sizes', 'decorative backgrounds behind dense copy'],
  },
  utility: {
    family: 'utility',
    purpose: 'Functional assets that must be clear, accessible, and brand-consistent.',
    composition: 'Use simple panels, strong contrast, minimal motif usage, and large functional content zones.',
    hierarchy: 'Utility instruction first, functional code/info second, brand mark third.',
    reusableElements: ['utility panel', 'rounded card treatment', 'same icon style'],
    avoid: ['visual noise around QR codes', 'low contrast', 'decorative effects over functional content'],
  },
  content: {
    family: 'content',
    purpose: 'Readable written and editorial assets that carry voice and visual consistency.',
    composition: 'Use consistent header bands, section labels, callout boxes, and spacing rhythm.',
    hierarchy: 'Document title first, section labels second, body/detail third.',
    reusableElements: ['header system', 'callout style', 'bullet/icon language', 'footer mark'],
    avoid: ['mixed voice', 'unstructured dense blocks', 'new typography styles'],
  },
  environmental: {
    family: 'environmental',
    purpose: 'Physical venue touchpoints that scale the brand system into space.',
    composition: 'Use bold zones, clear safe areas, real-world viewing distance, and repeated environmental motifs.',
    hierarchy: 'Brand/event identity first, function/zone second, detail third.',
    reusableElements: ['environmental wrap pattern', 'large title band', 'safe logo zone', 'same lighting/color treatment'],
    avoid: ['fine details that vanish at distance', 'unsafe sponsor/logo crops', 'unrealistic scale'],
  },
});

export const buildCrossAssetConsistencySystem = (args: {
  eventDetails: EventDetails;
  brandProfile: BrandProfile;
  mode: BrandMode;
  brandContext?: BrandContext | null;
  colorPalette?: ColorInfo[];
  assetTypes: AssetType[];
}): CrossAssetConsistencySystem => {
  const { eventDetails, brandProfile, mode, brandContext, colorPalette = [], assetTypes } = args;
  const primary = getProfileColor(brandProfile, 'primary', colorPalette[0]?.hex || brandContext?.primaryColor || '#111827');
  const secondary = getProfileColor(brandProfile, 'secondary', colorPalette[1]?.hex || brandContext?.secondaryColor || '#2563EB');
  const accent = getProfileColor(brandProfile, 'accent', colorPalette[2]?.hex || brandContext?.accentColor || secondary);
  const neutral = getProfileColor(brandProfile, 'neutral', getProfileColor(brandProfile, 'background', '#F8FAFC'));
  const headline = brandProfile.typography.find((type) => type.role === 'headline' || type.role === 'display')?.fontFamily || brandContext?.headingFont || 'Inter';
  const body = brandProfile.typography.find((type) => type.role === 'body')?.fontFamily || brandContext?.bodyFont || 'Inter';
  const uniqueFamilies = Array.from(new Set(assetTypes.map(getAssetFamily)));

  return {
    systemName: `${eventDetails.name || brandProfile.name} Unified Asset System`,
    brandName: brandProfile.name || brandContext?.brandName || 'Active Brand',
    mode,
    visualSignature: `Every asset must share one recognizable design DNA: ${brandProfile.imageryRules.styleSummary} Use repeated ${brandProfile.layoutRules.requiredTraits.slice(0, 2).join(' + ') || 'layout rhythm'} and a consistent ${accent} accent treatment across ${uniqueFamilies.join(', ')} touchpoints.`,
    compositionGrid: `Use a repeatable grid across asset sizes: generous safe margins, consistent header/footer bands where useful, aligned logo zones, and a clear 3-level hierarchy. Scale the same system rather than inventing new layouts per asset.`,
    typographySystem: `Use ${headline} for primary headlines and ${body} for supporting copy. Keep headline treatment, casing, weight contrast, and line-height consistent across all assets. Do not introduce additional decorative fonts unless the brand profile explicitly allows them.`,
    colorSystem: `Primary ${primary} is the anchor. Secondary ${secondary} supports sections and panels. Accent ${accent} is reserved for CTAs, wayfinding cues, chips, highlights, and small repeated details. Neutral/background ${neutral} keeps layouts breathable. Do not invent new dominant colors.`,
    logoSystem: brandProfile.logoRules.map((rule) => `${rule.required ? 'Required' : 'Guidance'}: ${rule.name} — ${rule.description}`).join(' '),
    backgroundSystem: `Use one shared background logic across the kit: consistent gradient/pattern/texture treatment, same blur/grain/shape language, and family-specific cropping only. Social, signage, and merch should feel like scaled/cropped relatives of the hero system.`,
    motifSystem: `Create one reusable motif from the brand direction and repeat it: line system, glow/orb, frame, stripe, pattern, soft shape, or icon badge. Vary scale and crop, not style.`,
    assetFamilyRules: buildFamilyRules(),
    globalDo: cleanList([
      `Keep all assets visibly part of ${eventDetails.name || 'the same campaign'}.`,
      `Reuse the same color hierarchy: ${primary} / ${secondary} / ${accent}.`,
      `Use the same typography pairing: ${headline} + ${body}.`,
      'Keep logo placement and clear space consistent.',
      'Use one shared motif/background language across all formats.',
      mode === 'locked' ? 'Locked mode: do not deviate from approved brand tokens.' : 'Allow controlled variation only within the active brand profile.',
    ]),
    globalAvoid: cleanList([
      ...brandProfile.restrictedUses,
      ...brandProfile.imageryRules.avoid,
      ...brandProfile.layoutRules.avoid,
      'Changing art direction from one asset to another.',
      'Using a different dominant color per asset.',
      'Changing typography styles between asset families.',
      'Adding new decorative motifs that are not reused elsewhere.',
    ]),
  };
};

export const buildCrossAssetConsistencyPromptBlock = (
  system: CrossAssetConsistencySystem,
  assetType?: AssetType
): string => {
  const family = assetType ? getAssetFamily(assetType) : undefined;
  const familyRule = family ? system.assetFamilyRules[family] : undefined;
  const qualityContract = assetType ? buildGenerationQualityPromptBlock(assetType, system.mode, 'production') : '';

  return `
=== CROSS-ASSET BRAND CONSISTENCY SYSTEM ===
SYSTEM: ${system.systemName}
ACTIVE BRAND PROFILE: ${system.brandName}
COMPLIANCE MODE: ${system.mode}

VISUAL SIGNATURE:
${system.visualSignature}

COLOR SYSTEM:
${system.colorSystem}

TYPOGRAPHY SYSTEM:
${system.typographySystem}

LOGO SYSTEM:
${system.logoSystem || 'Use the provided logo consistently with safe clear space and no distortion.'}

BACKGROUND + MOTIF SYSTEM:
${system.backgroundSystem}
${system.motifSystem}

GRID / COMPOSITION SYSTEM:
${system.compositionGrid}

GLOBAL DO:
${system.globalDo.map((item) => `  • ${item}`).join('\n')}

GLOBAL AVOID:
${system.globalAvoid.map((item) => `  ✗ ${item}`).join('\n')}
${familyRule ? `
ASSET FAMILY RULE (${familyRule.family.toUpperCase()}):
Purpose: ${familyRule.purpose}
Composition: ${familyRule.composition}
Hierarchy: ${familyRule.hierarchy}
Reusable elements: ${familyRule.reusableElements.join(', ')}
Avoid: ${familyRule.avoid.join(', ')}
` : ''}
${qualityContract}
CRITICAL OUTPUT REQUIREMENT:
This output must look like one member of the same coordinated brand kit, not a standalone design. Preserve the shared color hierarchy, typography, layout rhythm, logo handling, background treatment, and reusable motif across every asset type.
=== END CROSS-ASSET BRAND CONSISTENCY SYSTEM ===
`;
};
