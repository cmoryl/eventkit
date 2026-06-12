import { AssetType } from '@/types';

export type LogoVisibilityMode = 'auto' | 'visible' | 'hidden';
export type LogoVisibilityRequirement = 'required' | 'visible' | 'optional' | 'hidden';
export type LogoPlacementPriority = 'primary' | 'secondary' | 'tertiary' | 'suppressed';

export interface LogoPlacementConstraints {
  priority: LogoPlacementPriority;
  preferredLocations: string[];
  avoidLocations: string[];
  maxWidthPercent: number;
  maxHeightPercent: number;
  clearSpaceRule: string;
  safeAreaRule: string;
  backgroundRule: string;
  scalingRule: string;
  printRule: string;
  digitalRule: string;
  bestPractices: string[];
  hardStops: string[];
}

export interface LogoVisibilityDecision {
  mode: LogoVisibilityMode;
  requirement: LogoVisibilityRequirement;
  shouldShowLogo: boolean;
  shouldPassLogoReference: boolean;
  placementGuidance: string;
  rationale: string;
  constraints: LogoPlacementConstraints;
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

const baseConstraints: LogoPlacementConstraints = {
  priority: 'secondary',
  preferredLocations: ['top-left', 'top-right', 'bottom-right', 'footer/header logo zone'],
  avoidLocations: ['over the headline', 'over faces', 'over QR codes', 'over dense imagery', 'inside trim/bleed zones'],
  maxWidthPercent: 16,
  maxHeightPercent: 10,
  clearSpaceRule: 'Maintain clear space around the logo equal to at least the height of the logo mark or 1x logo height when brand rules are unknown.',
  safeAreaRule: 'Keep logo inside the safe area, away from bleed/trim edges, platform UI overlays, folds, grommets, seams, and physical hardware.',
  backgroundRule: 'Place logo on a clean high-contrast field. Use approved light/dark logo versions only; do not add glow, shadow, stroke, outline, or effects unless the brand profile explicitly permits it.',
  scalingRule: 'Scale logo proportionally only. Never stretch, skew, crop, rotate, rebuild, recolor, or approximate the logo.',
  printRule: 'For print, keep logo inside live area, away from trim/bleed and production hardware. Use vector/source logo if available.',
  digitalRule: 'For digital, keep logo inside platform safe margins and avoid UI chrome/overlay zones.',
  bestPractices: [
    'Treat the logo as a brand signature, not decoration.',
    'Logo should support the message hierarchy, not compete with the headline.',
    'Use one consistent logo placement system across related asset families.',
    'When the logo is not visible, preserve brand recognition through color, typography, motif, and layout rhythm.',
  ],
  hardStops: [
    'Do not invent a logo when no logo reference is supplied.',
    'Do not place logo over unreadable/noisy imagery.',
    'Do not change logo colors, proportions, or construction.',
    'Do not use multiple competing logo placements in one asset unless it is a step-and-repeat or lanyard repeat pattern.',
  ],
};

const mergeConstraints = (overrides: Partial<LogoPlacementConstraints>): LogoPlacementConstraints => ({
  ...baseConstraints,
  ...overrides,
  preferredLocations: overrides.preferredLocations || baseConstraints.preferredLocations,
  avoidLocations: overrides.avoidLocations || baseConstraints.avoidLocations,
  bestPractices: [...baseConstraints.bestPractices, ...(overrides.bestPractices || [])],
  hardStops: [...baseConstraints.hardStops, ...(overrides.hardStops || [])],
});

const placementByAssetType: Partial<Record<AssetType, string>> = {
  [AssetType.Banner]: 'Place logo in a consistent corner or sponsor-safe zone with clear space; never overpower the event headline.',
  [AssetType.EmailHeader]: 'Place logo in a header-safe zone, usually top-left or top-right, with generous clear space.',
  [AssetType.EventSignage]: 'Place logo in a consistent footer/header zone; wayfinding/action message remains primary.',
  [AssetType.NameTag]: 'Place logo small in the top or bottom brand zone; keep attendee name as highest hierarchy.',
  [AssetType.Lanyard]: 'Repeat logo at controlled intervals with enough spacing for print readability.',
  [AssetType.Tshirt]: 'Use logo only if it works as a clean print mark; otherwise use event motif and keep logo optional.',
  [AssetType.SocialPost]: 'Place logo as a small persistent brand mark or omit if the creative needs a cleaner platform-native crop.',
  [AssetType.SocialStory]: 'Place logo inside platform safe margins; avoid covering hook/CTA zones.',
  [AssetType.PresentationSlide]: 'Place logo in a consistent footer or corner system across slides.',
  [AssetType.QRCode]: 'Do not place logo over the QR code; only use a separate logo zone or QR-safe embedded logo if scan-safe.',
};

const defaultPlacement = 'Place logo in a consistent safe zone with clear space; never distort, crop, recolor, recreate, or add effects to the logo.';

export const getLogoPlacementConstraints = (assetType: AssetType, hidden = false): LogoPlacementConstraints => {
  if (hidden) {
    return mergeConstraints({
      priority: 'suppressed',
      preferredLocations: [],
      avoidLocations: ['any visible logo placement', 'fake wordmarks', 'symbol approximations', 'logo-shaped placeholders'],
      maxWidthPercent: 0,
      maxHeightPercent: 0,
      clearSpaceRule: 'No logo clear-space zone is needed unless reserving an empty future-placement area.',
      safeAreaRule: 'Do not reserve a dominant logo area; use brand color, typography, motif, and layout rhythm instead.',
      backgroundRule: 'No logo background field should appear. Avoid empty boxes that look like a missing logo unless the user specifically needs a placeholder.',
      scalingRule: 'Logo is suppressed. Do not scale, rebuild, or approximate it.',
      printRule: 'Logo is intentionally omitted from print output.',
      digitalRule: 'Logo is intentionally omitted from digital output.',
      bestPractices: ['Preserve brand recognition through approved colors, typography, motif, spacing, and imagery style.'],
      hardStops: ['Do not invent or approximate a logo in hidden mode.'],
    });
  }

  switch (assetType) {
    case AssetType.Banner:
    case AssetType.BackWall:
    case AssetType.MainStageBackdrop:
      return mergeConstraints({
        priority: 'secondary',
        preferredLocations: ['top-left safe zone', 'top-right safe zone', 'bottom-right sponsor/logo zone'],
        maxWidthPercent: 14,
        maxHeightPercent: 12,
        safeAreaRule: 'Keep logo at least 5% inward from edges, trim, grommets, seams, and visible hardware. Preserve a clear headline field.',
        bestPractices: ['Use the same hero-logo zone across banners, back walls, and stage graphics.'],
      });

    case AssetType.EventSignage:
    case AssetType.HangingSignage:
    case AssetType.OutdoorSignage:
    case AssetType.RoomSignage:
    case AssetType.LocationSignage:
    case AssetType.DoorSignage:
    case AssetType.EaselSignage:
    case AssetType.StandUpPillarBanner:
      return mergeConstraints({
        priority: 'tertiary',
        preferredLocations: ['footer band', 'header band', 'bottom-right quiet zone'],
        maxWidthPercent: 12,
        maxHeightPercent: 8,
        safeAreaRule: 'Keep logo below or above the directional message. Direction, room name, or action must remain visually dominant.',
        bestPractices: ['Use one repeated wayfinding logo band across all signs.', 'Avoid placing logo near arrows where it may be mistaken as directional content.'],
      });

    case AssetType.NameTag:
    case AssetType.NameTagBack:
    case AssetType.VIPBadge:
    case AssetType.MediaCredential:
    case AssetType.SecurityBadge:
    case AssetType.BackstagePass:
      return mergeConstraints({
        priority: 'tertiary',
        preferredLocations: ['top brand strip', 'bottom brand strip', 'small corner mark'],
        maxWidthPercent: 22,
        maxHeightPercent: 12,
        safeAreaRule: 'Logo must not intrude on the name, role, barcode/QR, or access-level zones.',
        bestPractices: ['Name/access level is the hero; logo is a trust mark.', 'Use the same badge logo zone across all credential variations.'],
      });

    case AssetType.Lanyard:
    case AssetType.WristbandDesign:
      return mergeConstraints({
        priority: 'primary',
        preferredLocations: ['controlled repeat pattern along the strip', 'alternating mark/text repeat'],
        maxWidthPercent: 28,
        maxHeightPercent: 70,
        safeAreaRule: 'Repeat logo with enough horizontal breathing room for manufacturing. Keep away from clip/seam/fold zones.',
        bestPractices: ['Use simple repeat spacing.', 'Avoid detailed lockups that will become unreadable at narrow width.'],
      });

    case AssetType.Tshirt:
    case AssetType.TshirtBack:
    case AssetType.TshirtSleeve:
    case AssetType.Hat:
    case AssetType.WaterBottle:
    case AssetType.SwagBag:
    case AssetType.StickerSheet:
      return mergeConstraints({
        priority: 'optional',
        preferredLocations: ['single centered print mark', 'small sleeve/side mark', 'bottom corner mark', 'back neck mark'],
        maxWidthPercent: 32,
        maxHeightPercent: 22,
        safeAreaRule: 'Use print-safe placement and avoid seams, folds, curves, bottle wrap distortion, and embroidery detail limits.',
        bestPractices: ['Favor simplified logo treatments for merch.', 'Use fewer colors and avoid detailed backgrounds behind logos.'],
      });

    case AssetType.SocialPost:
    case AssetType.SocialStory:
    case AssetType.LinkedInBanner:
    case AssetType.TwitterHeader:
    case AssetType.YouTubeThumbnail:
      return mergeConstraints({
        priority: 'optional',
        preferredLocations: ['top-right safe margin', 'bottom-right safe margin', 'subtle footer mark'],
        maxWidthPercent: 14,
        maxHeightPercent: 8,
        safeAreaRule: 'Stay inside platform safe margins. Avoid profile-picture overlays, story UI overlays, captions, buttons, and crop-prone edges.',
        bestPractices: ['Small persistent logo is enough.', 'Logo can be omitted when the asset already has strong brand recognition through style and color.'],
      });

    case AssetType.PresentationSlide:
    case AssetType.Presentation:
    case AssetType.WebinarSlide:
      return mergeConstraints({
        priority: 'tertiary',
        preferredLocations: ['footer corner', 'consistent slide master logo zone', 'section-divider corner'],
        maxWidthPercent: 10,
        maxHeightPercent: 7,
        safeAreaRule: 'Logo must not compete with slide title or content. Use the same position across the deck.',
        bestPractices: ['Create one slide-master logo zone and reuse it.', 'Use smaller marks on content slides and stronger marks on title/section slides.'],
      });

    case AssetType.QRCode:
    case AssetType.WifiSign:
      return mergeConstraints({
        priority: 'tertiary',
        preferredLocations: ['separate header/footer zone', 'side panel outside code/credential area'],
        avoidLocations: ['inside QR quiet zone', 'over network/password fields', 'inside scan area'],
        maxWidthPercent: 12,
        maxHeightPercent: 8,
        safeAreaRule: 'Never obstruct scan zones, QR quiet zones, URLs, passwords, or functional instructions.',
        bestPractices: ['Function wins over decoration.', 'Logo should never reduce scanability or readability.'],
      });

    default:
      return baseConstraints;
  }
};

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
      constraints: getLogoPlacementConstraints(assetType, true),
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
      constraints: getLogoPlacementConstraints(assetType, !hasLogo),
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
      constraints: getLogoPlacementConstraints(assetType, true),
    };
  }

  if (requiredLogoAssets.has(assetType)) {
    return {
      mode,
      requirement: 'required',
      shouldShowLogo: hasLogo,
      shouldPassLogoReference: hasLogo,
      placementGuidance: placementByAssetType[assetType] || defaultPlacement,
      rationale: hasLogo ? 'Auto mode requires logo visibility for this brand-facing asset.' : 'This asset normally requires a logo, but no logo reference is available.',
      constraints: getLogoPlacementConstraints(assetType, !hasLogo),
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
      constraints: getLogoPlacementConstraints(assetType, !hasLogo),
    };
  }

  return {
    mode,
    requirement: hasLogo ? 'visible' : 'optional',
    shouldShowLogo: hasLogo,
    shouldPassLogoReference: hasLogo,
    placementGuidance: placementByAssetType[assetType] || defaultPlacement,
    rationale: 'Default logo visibility policy.',
    constraints: getLogoPlacementConstraints(assetType, !hasLogo),
  };
};

export const buildLogoPlacementConstraintsBlock = (constraints: LogoPlacementConstraints) => `
PLACEMENT CONSTRAINTS:
  • Priority: ${constraints.priority}
  • Preferred locations: ${constraints.preferredLocations.length ? constraints.preferredLocations.join(', ') : 'none — logo is suppressed'}
  • Avoid locations: ${constraints.avoidLocations.join(', ')}
  • Max logo width: ${constraints.maxWidthPercent}% of asset width
  • Max logo height: ${constraints.maxHeightPercent}% of asset height
  • Clear space: ${constraints.clearSpaceRule}
  • Safe area: ${constraints.safeAreaRule}
  • Background: ${constraints.backgroundRule}
  • Scaling: ${constraints.scalingRule}
  • Print: ${constraints.printRule}
  • Digital: ${constraints.digitalRule}

BEST PRACTICES:
${constraints.bestPractices.map((item) => `  ✓ ${item}`).join('\n')}

HARD STOPS:
${constraints.hardStops.map((item) => `  ✗ ${item}`).join('\n')}
`;

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
${buildLogoPlacementConstraintsBlock(decision.constraints)}
STRICT LOGO RULES:
  • If LOGO_VISIBILITY is hidden: do not show any logo, fake logo, invented wordmark, or approximate brand mark. Keep only brand colors, typography, imagery style, layout rhythm, and motif language.
  • If a logo is visible: use the supplied logo reference only. Do not redraw, recolor, stretch, warp, crop, rotate, add shadows/effects, or change the logo.
  • If no logo reference is available: do not invent a logo. Reserve a clean logo-safe zone only when the asset normally requires one.
  • Logo visibility is separate from brand look and feel. Even when hidden, the asset must still look fully on-brand.
=== END LOGO VISIBILITY CONTRACT ===
`;
};
