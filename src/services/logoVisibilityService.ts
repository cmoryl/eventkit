import { AssetType } from '@/types';

export type LogoVisibilityMode = 'auto' | 'visible' | 'hidden';
export type LogoVisibilityRequirement = 'required' | 'visible' | 'optional' | 'hidden';

export interface LogoVisibilityDecision {
  mode: LogoVisibilityMode;
  requirement: LogoVisibilityRequirement;
  shouldShowLogo: boolean;
  shouldPassLogoReference: boolean;
  placementGuidance: string;
  rationale: string;
}

const LOGO_VISIBILITY_KEY = 'eventkit-logo-visibility-mode';

const hasStorage = () => typeof localStorage !== 'undefined';

export const getLogoVisibilityMode = (): LogoVisibilityMode => {
  if (!hasStorage()) return 'auto';
  const saved = localStorage.getItem(LOGO_VISIBILITY_KEY) as LogoVisibilityMode | null;
  return saved === 'visible' || saved === 'hidden' || saved === 'auto' ? saved : 'auto';
};

export const setLogoVisibilityMode = (mode: LogoVisibilityMode) => {
  if (hasStorage()) localStorage.setItem(LOGO_VISIBILITY_KEY, mode);
  return mode;
};

const requiredLogoAssets = new Set<AssetType>([
  AssetType.Banner,
  AssetType.EmailHeader,
  AssetType.EventSignage,
  AssetType.HangingSignage,
  AssetType.OutdoorSignage,
  AssetType.DoorSignage,
  AssetType.EaselSignage,
  AssetType.LocationSignage,
  AssetType.RoomSignage,
  AssetType.StandUpPillarBanner,
  AssetType.FeatherFlag,
  AssetType.TeardropFlag,
  AssetType.NameTag,
  AssetType.NameTagBack,
  AssetType.Lanyard,
  AssetType.PresentationSlide,
  AssetType.Presentation,
  AssetType.BackWall,
  AssetType.MainStageBackdrop,
  AssetType.RegistrationCounter,
  AssetType.WelcomeCounter,
  AssetType.RegistrationBackWall,
  AssetType.TechnologyCounter,
  AssetType.Kiosk,
  AssetType.StepAndRepeat,
  AssetType.ParkingPass,
  AssetType.TicketDesign,
  AssetType.VIPBadge,
  AssetType.MediaCredential,
  AssetType.SecurityBadge,
  AssetType.BackstagePass,
]);

const optionalLogoAssets = new Set<AssetType>([
  AssetType.SocialPost,
  AssetType.SocialStory,
  AssetType.SocialProfile,
  AssetType.LinkedInBanner,
  AssetType.TwitterHeader,
  AssetType.YouTubeThumbnail,
  AssetType.Tshirt,
  AssetType.TshirtBack,
  AssetType.TshirtSleeve,
  AssetType.Hat,
  AssetType.WaterBottle,
  AssetType.SwagBag,
  AssetType.StickerSheet,
  AssetType.Menu,
  AssetType.Folder,
  AssetType.ThankYouNote,
  AssetType.InvitationCard,
  AssetType.ProgramBooklet,
]);

const hiddenByDefaultAssets = new Set<AssetType>([
  AssetType.Palette,
  AssetType.Slogans,
  AssetType.MarketingCopy,
  AssetType.RunOfShow,
  AssetType.AgendaHighlights,
  AssetType.StyleGuide,
  AssetType.SeamlessPattern,
  AssetType.QRCode,
  AssetType.FloorPlan,
  AssetType.LocationIntel,
]);

const placementByAssetType: Partial<Record<AssetType, string>> = {
  [AssetType.Banner]: 'place logo in a consistent corner or sponsor-safe zone with clear space; never overpower the event headline',
  [AssetType.EmailHeader]: 'place logo in a header-safe zone, usually top-left or top-right, with generous clear space',
  [AssetType.EventSignage]: 'place logo in a consistent footer/header zone; wayfinding/action message remains primary',
  [AssetType.NameTag]: 'place logo small in the top or bottom brand zone; keep attendee name as highest hierarchy',
  [AssetType.Lanyard]: 'repeat logo at controlled intervals with enough spacing for print readability',
  [AssetType.Tshirt]: 'use logo only if it works as a clean print mark; otherwise use event motif and keep logo optional',
  [AssetType.SocialPost]: 'place logo as a small persistent brand mark or omit if the creative needs a cleaner platform-native crop',
  [AssetType.SocialStory]: 'place logo inside platform safe margins; avoid covering hook/CTA zones',
  [AssetType.PresentationSlide]: 'place logo in a consistent footer or corner system across slides',
  [AssetType.QRCode]: 'do not place logo over the QR code; only use a separate logo zone or QR-safe embedded logo if scan-safe',
};

const defaultPlacement = 'place logo in a consistent safe zone with clear space; never distort, crop, recolor, recreate, or add effects to the logo';

export const getLogoVisibilityDecision = (
  assetType: AssetType,
  mode: LogoVisibilityMode = getLogoVisibilityMode(),
  hasLogo = true
): LogoVisibilityDecision => {
  if (mode === 'hidden') {
    return {
      mode,
      requirement: 'hidden',
      shouldShowLogo: false,
      shouldPassLogoReference: false,
      placementGuidance: 'Logo is intentionally hidden. Do not place, redraw, approximate, or invent a logo/brand mark in this asset.',
      rationale: 'User selected hidden logo mode.',
    };
  }

  if (mode === 'visible') {
    return {
      mode,
      requirement: hasLogo ? 'visible' : 'required',
      shouldShowLogo: hasLogo,
      shouldPassLogoReference: hasLogo,
      placementGuidance: placementByAssetType[assetType] || defaultPlacement,
      rationale: hasLogo ? 'User selected visible logo mode.' : 'Logo visibility requested, but no logo reference is available.',
    };
  }

  if (hiddenByDefaultAssets.has(assetType)) {
    return {
      mode,
      requirement: 'hidden',
      shouldShowLogo: false,
      shouldPassLogoReference: false,
      placementGuidance: 'Logo is hidden by default for this functional/text-based asset. Use brand look and feel only.',
      rationale: 'Auto mode hides logos for text-based, utility, or brand-core assets where a logo can reduce function/readability.',
    };
  }

  if (requiredLogoAssets.has(assetType)) {
    return {
      mode,
      requirement: hasLogo ? 'required' : 'required',
      shouldShowLogo: hasLogo,
      shouldPassLogoReference: hasLogo,
      placementGuidance: placementByAssetType[assetType] || defaultPlacement,
      rationale: hasLogo ? 'Auto mode requires logo visibility for this brand-facing asset.' : 'This asset normally requires a logo, but no logo reference is available.',
    };
  }

  if (optionalLogoAssets.has(assetType)) {
    return {
      mode,
      requirement: 'optional',
      shouldShowLogo: hasLogo,
      shouldPassLogoReference: hasLogo,
      placementGuidance: placementByAssetType[assetType] || defaultPlacement,
      rationale: 'Auto mode treats the logo as optional for this asset family; preserve look and feel even if logo is minimized.',
    };
  }

  return {
    mode,
    requirement: hasLogo ? 'visible' : 'optional',
    shouldShowLogo: hasLogo,
    shouldPassLogoReference: hasLogo,
    placementGuidance: placementByAssetType[assetType] || defaultPlacement,
    rationale: 'Default logo visibility policy.',
  };
};

export const buildLogoVisibilityPromptBlock = (
  assetType: AssetType,
  hasLogo: boolean,
  mode: LogoVisibilityMode = getLogoVisibilityMode()
) => {
  const decision = getLogoVisibilityDecision(assetType, mode, hasLogo);

  return `
=== LOGO VISIBILITY CONTRACT ===
LOGO_VISIBILITY: ${decision.requirement}
USER LOGO MODE: ${decision.mode}
HAS LOGO REFERENCE: ${hasLogo ? 'yes' : 'no'}

LOGO DECISION:
${decision.rationale}

PLACEMENT / SUPPRESSION RULE:
${decision.placementGuidance}

STRICT LOGO RULES:
  • If LOGO_VISIBILITY is hidden: do not show any logo, fake logo, invented wordmark, or approximate brand mark. Keep only brand colors, typography, imagery style, layout rhythm, and motif language.
  • If a logo is visible: use the supplied logo reference only. Do not redraw, recolor, stretch, warp, crop, rotate, add shadows/effects, or change the logo.
  • If no logo reference is available: do not invent a logo. Reserve a clean logo-safe zone only when the asset normally requires one.
  • Logo visibility is separate from brand look and feel. Even when hidden, the asset must still look fully on-brand.
=== END LOGO VISIBILITY CONTRACT ===
`;
};
