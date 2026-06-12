import type { BrandProfile } from '@/types/brandProfile';
import type { BrandAssetGenerationContext, BrandGuideAsset } from './brandAssetLibraryService';
import { getBrandAssetGenerationContext } from './brandAssetLibraryService';
import { getCloudBackedBrandAssetGenerationContext } from './brandAssetCloudService';
import { getActiveBrandStyleSystems } from './brandStyleSystemService';
import { buildBrandPromptOverrideBlock, getApprovedBrandPromptOverrides } from './brandPromptOverrideService';
import { getLogoVisibilityMode } from './logoVisibilityService';

export type PresentationExportProfile =
  | 'editable_working_deck'
  | 'executive_presentation'
  | 'sales_pitch'
  | 'training_workshop'
  | 'event_keynote'
  | 'print_handout'
  | 'video_storyboard';

export interface LegacyPresentationBrand {
  id?: string;
  name?: string;
  logoUrl?: string | null;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
}

export interface PresentationDeckBrainOptions {
  profile: BrandProfile;
  brandAssetContext?: BrandAssetGenerationContext;
  legacyBrand?: LegacyPresentationBrand | null;
  templateId?: string;
  templateName?: string;
  exportProfile?: PresentationExportProfile;
  sourceKind?: 'prompt' | 'pdf' | 'pptx' | 'brandhub' | 'mixed';
  parallaxMode?: boolean;
}

export interface PresentationDeckBrainPayload {
  version: '1.0';
  brandProfileId: string;
  brandName: string;
  legacyBrandId?: string;
  templateId?: string;
  templateName?: string;
  exportProfile: PresentationExportProfile;
  sourceKind: string;
  parallaxMode: boolean;
  hasExactLogoSource: boolean;
  primaryLogo?: {
    name: string;
    fileName: string;
    mimeType: string;
    dataUrl?: string;
    placementPolicy: 'deterministic_powerpoint_layer';
  };
  brandTokens: {
    colors: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      foreground?: string;
      available: string[];
    };
    fonts: {
      heading?: string;
      body?: string;
      fallback?: string;
    };
    gradients: string[];
  };
  brandAssets: {
    logos: number;
    visualReferences: number;
    patternReferences: number;
    layoutReferences: number;
    doExamples: number;
    dontExamples: number;
    referenceNames: string[];
  };
  styleSystems: Array<{
    id: string;
    name: string;
    description: string;
    presentationTranslation?: string;
  }>;
  approvedPromptOverrides: {
    count: number;
    scopes: string[];
    promptBlock: string;
  };
  powerpointRules: string[];
  qaChecklist: string[];
  promptBlock: string;
}

const stripHash = (value?: string | null) => value ? value.replace('#', '').trim() : undefined;

const firstColorByRole = (profile: BrandProfile, role: string) => stripHash(profile.colors.find((color) => color.role === role)?.hex);

const fontsFromProfile = (profile: BrandProfile) => {
  const heading = profile.typography.find((rule) => ['headline', 'display'].includes(rule.role))?.fontFamily;
  const body = profile.typography.find((rule) => rule.role === 'body')?.fontFamily;
  const fallback = profile.typography.find((rule) => rule.role === 'fallback')?.fontFamily;
  return { heading, body, fallback };
};

const summarizeAssets = (context: BrandAssetGenerationContext) => {
  const references: BrandGuideAsset[] = [
    ...context.logos,
    ...context.visualReferences,
    ...context.patternReferences,
    ...context.layoutReferences,
    ...context.doExamples,
    ...context.dontExamples,
  ];

  return {
    logos: context.logos.length,
    visualReferences: context.visualReferences.length,
    patternReferences: context.patternReferences.length,
    layoutReferences: context.layoutReferences.length,
    doExamples: context.doExamples.length,
    dontExamples: context.dontExamples.length,
    referenceNames: references.slice(0, 12).map((asset) => `${asset.name} (${asset.type}/${asset.usage})`),
  };
};

const allAssetsFromContext = (context: BrandAssetGenerationContext): BrandGuideAsset[] => [
  ...context.logos,
  ...context.visualReferences,
  ...context.patternReferences,
  ...context.layoutReferences,
  ...context.doExamples,
  ...context.dontExamples,
];

export const getPresentationExportProfileRules = (profile: PresentationExportProfile) => {
  const base = [
    'Build a fully editable PowerPoint deck, not a flattened image deck.',
    'Use real editable text boxes for titles, bullets, KPIs, labels, captions, and notes.',
    'Use editable charts/tables when structured data exists; never fake chart text inside images.',
    'Preserve speaker notes when provided or generated.',
    'Protect slide-safe margins, title zones, footer zones, and logo-safe zones.',
    'Use exact source logos as PowerPoint image layers only; never ask AI to redraw logos.',
  ];

  const profileRules: Record<PresentationExportProfile, string[]> = {
    editable_working_deck: [
      'Favor editability and clean structure over decorative flattening.',
      'Keep layouts flexible enough for user editing after generation.',
    ],
    executive_presentation: [
      'Use fewer words per slide, stronger executive framing, and high-confidence visual hierarchy.',
      'Prefer agenda, KPI, comparison, timeline, and decision slides over dense bullet slides.',
    ],
    sales_pitch: [
      'Frame the narrative around problem, impact, differentiated solution, proof, value, and next step.',
      'Include proof slides, objection-handling structure, and CTA clarity.',
    ],
    training_workshop: [
      'Add learning objectives, section dividers, activity prompts, recap slides, and speaker notes.',
      'Keep slide structure teachable and pacing-friendly.',
    ],
    event_keynote: [
      'Use larger display type, stronger pacing, cinematic section dividers, and minimal body copy.',
      'Speaker notes should carry detail; slides should carry the memorable idea.',
    ],
    print_handout: [
      'Increase text completeness and source fidelity while keeping margins and contrast print-safe.',
      'Avoid dark full-bleed backgrounds unless brand or template requires it.',
    ],
    video_storyboard: [
      'Treat slides as scenes with motion-ready layers, visual beats, and narration notes.',
      'Prefer parallax-ready foreground, midground, and background logic when possible.',
    ],
  };

  return [...base, ...profileRules[profile]];
};

export const getPresentationQAChecklist = (profile: PresentationExportProfile) => [
  'Deck story has a clear beginning, middle, and end.',
  'No slide uses three dense paragraphs or overloaded bullet blocks when a richer layout would work better.',
  'No layout repeats three times in a row unless source fidelity requires it.',
  'Every slide has a clear title and one dominant takeaway.',
  'Speaker notes exist for each slide when the deck is AI-planned.',
  'Brand colors, fonts, motif, imagery, and style systems are consistent across the full deck.',
  'Logo is never AI-generated; exact source logo is reserved for deterministic PowerPoint placement.',
  'Charts, KPI grids, timelines, process diagrams, and comparisons use real editable structures.',
  'Source facts, quoted language, numbers, and slide order are preserved when source material is provided.',
  `Export profile '${profile}' rules are followed.`,
];

export const buildPresentationDeckBrainPayload = (options: PresentationDeckBrainOptions): PresentationDeckBrainPayload => {
  const {
    profile,
    brandAssetContext = getBrandAssetGenerationContext(profile.id, profile),
    legacyBrand,
    templateId,
    templateName,
    exportProfile = 'editable_working_deck',
    sourceKind = 'prompt',
    parallaxMode = false,
  } = options;

  const primaryLogo = brandAssetContext.primaryLogo;
  const allAssets = allAssetsFromContext(brandAssetContext);
  const systems = getActiveBrandStyleSystems(profile, allAssets);
  const approvedOverrides = getApprovedBrandPromptOverrides(profile.id, 'presentation');
  const overrideBlock = buildBrandPromptOverrideBlock(profile.id, 'presentation');
  const profileFonts = fontsFromProfile(profile);
  const colorTokens = {
    primary: stripHash(legacyBrand?.primary) || firstColorByRole(profile, 'primary'),
    secondary: stripHash(legacyBrand?.secondary) || firstColorByRole(profile, 'secondary'),
    accent: stripHash(legacyBrand?.accent) || firstColorByRole(profile, 'accent'),
    background: firstColorByRole(profile, 'background'),
    foreground: firstColorByRole(profile, 'foreground'),
    available: profile.colors.map((color) => stripHash(color.hex)).filter(Boolean) as string[],
  };
  const fontTokens = {
    heading: legacyBrand?.headingFont || profileFonts.heading,
    body: legacyBrand?.bodyFont || profileFonts.body,
    fallback: profileFonts.fallback,
  };
  const logoMode = getLogoVisibilityMode();
  const powerpointRules = getPresentationExportProfileRules(exportProfile);
  const qaChecklist = getPresentationQAChecklist(exportProfile);
  const assetSummary = summarizeAssets(brandAssetContext);

  const styleSystemPrompt = systems.map((system) => [
    `${system.name} (${system.id})`,
    `  Purpose: ${system.description}`,
    `  Full deck behavior: ${system.fullSetBehavior}`,
    `  Presentation translation: ${system.assetFamilyUsage.presentation || 'Translate the system into slide masters, section pacing, title styles, content grids, and imagery rhythm.'}`,
  ].join('\n')).join('\n');

  const promptBlock = `
=== PRESENTATION DECK BRAIN ===
Brand: ${profile.name}${legacyBrand?.name ? ` / selected deck brand: ${legacyBrand.name}` : ''}
Deck template: ${templateName || templateId || 'none selected'}
Export profile: ${exportProfile}
Source kind: ${sourceKind}
Parallax/video intent: ${parallaxMode ? 'enabled' : 'disabled'}

BRAND TOKENS:
  Colors: primary #${colorTokens.primary || 'auto'}, secondary #${colorTokens.secondary || 'auto'}, accent #${colorTokens.accent || 'auto'}, background #${colorTokens.background || 'auto'}, foreground #${colorTokens.foreground || 'auto'}.
  Fonts: heading ${fontTokens.heading || 'brand/default'}, body ${fontTokens.body || 'brand/default'}, fallback ${fontTokens.fallback || 'system'}.
  Gradients: ${profile.gradients.slice(0, 5).map((gradient) => `${gradient.name}: ${gradient.stops.join(' → ')}`).join('; ') || 'none specified'}.

LOGO POLICY:
  Logo visibility mode: ${logoMode}.
  Exact source logo available: ${primaryLogo ? 'yes' : 'no'}.
  Do not redraw, approximate, recolor, distort, crop, or invent any logo.
  If a logo is needed, reserve a clean logo-safe zone and insert the exact source logo as a deterministic PowerPoint image layer.
  The AI planner may describe logo placement zones, but must not create fake logos.

ACTIVE STYLE SYSTEMS:
${styleSystemPrompt || '  No explicit style systems selected; use the brand profile and uploaded assets.'}

BRAND ASSET SUMMARY:
  Logos: ${assetSummary.logos}
  Visual refs: ${assetSummary.visualReferences}
  Pattern refs: ${assetSummary.patternReferences}
  Layout refs: ${assetSummary.layoutReferences}
  Do examples: ${assetSummary.doExamples}
  Don't examples: ${assetSummary.dontExamples}
  Reference names: ${assetSummary.referenceNames.join('; ') || 'none'}

POWERPOINT PRODUCTION RULES:
${powerpointRules.map((rule) => `  • ${rule}`).join('\n')}

APPROVED PRESENTATION OVERRIDES:
${overrideBlock || '  No approved presentation-specific overrides.'}

DECK QA CHECKLIST:
${qaChecklist.map((rule) => `  • ${rule}`).join('\n')}
=== END PRESENTATION DECK BRAIN ===
`;

  return {
    version: '1.0',
    brandProfileId: profile.id,
    brandName: profile.name,
    legacyBrandId: legacyBrand?.id,
    templateId,
    templateName,
    exportProfile,
    sourceKind,
    parallaxMode,
    hasExactLogoSource: Boolean(primaryLogo),
    primaryLogo: primaryLogo ? {
      name: primaryLogo.name,
      fileName: primaryLogo.fileName,
      mimeType: primaryLogo.mimeType,
      dataUrl: primaryLogo.dataUrl,
      placementPolicy: 'deterministic_powerpoint_layer',
    } : undefined,
    brandTokens: {
      colors: colorTokens,
      fonts: fontTokens,
      gradients: profile.gradients.map((gradient) => `${gradient.name}: ${gradient.stops.join(' → ')}`),
    },
    brandAssets: assetSummary,
    styleSystems: systems.map((system) => ({
      id: system.id,
      name: system.name,
      description: system.description,
      presentationTranslation: system.assetFamilyUsage.presentation,
    })),
    approvedPromptOverrides: {
      count: approvedOverrides.length,
      scopes: approvedOverrides.map((override) => override.scope),
      promptBlock: overrideBlock,
    },
    powerpointRules,
    qaChecklist,
    promptBlock,
  };
};

export const getCloudBackedPresentationDeckBrainPayload = async (options: Omit<PresentationDeckBrainOptions, 'brandAssetContext'>) => {
  const cloudContext = await getCloudBackedBrandAssetGenerationContext(options.profile);
  return {
    payload: buildPresentationDeckBrainPayload({ ...options, brandAssetContext: cloudContext.context }),
    cloud: cloudContext.cloud,
  };
};

export const buildPresentationThemeOverride = (payload: PresentationDeckBrainPayload, existingThemeOverride?: string) => [
  existingThemeOverride,
  payload.promptBlock,
].filter(Boolean).join('\n\n');
