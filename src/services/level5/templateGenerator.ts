// Level-5 Template Factory — runtime expansion using getAssetDefault + getVariantProfile merge
import type { Level5Template, Level5AssetType, LogoRules, SceneSpec } from "../../types/eventTemplateSystem";
import { getAssetDefault } from "../../config/level5/assetDefaults";
import { getLogoRulesForAsset } from "../../config/level5/logoPlacementPresets";
import { variantPacks } from "../../config/level5/allAssetVariantPacks";
import { getVariantProfile } from "../../config/level5/variantDNA";

/**
 * A strict, reusable logo rules block. Placement/size are finalized later by
 * compileLevel5Prompt() via logoPlacementPresets, so keep this generic but non-negotiable.
 */
function baseLogoRules(assetType: Level5AssetType): LogoRules {
  const presetRules = getLogoRulesForAsset(assetType);
  return {
    reproduction:
      "Use the uploaded logo EXACTLY as provided. Do not redraw, reinterpret, stylize, distort, rotate arbitrarily, or recolor outside approved brand colors.",
    placement: presetRules.placement,
    size: presetRules.size,
    clearSpace:
      "Maintain clear space around the logo equal to at least 10% of the logo's bounding box height on all sides.",
    contrastProtection:
      "If the background is busy or contrast is insufficient, add a simple backing treatment (solid plate or subtle translucent panel). No glow. No heavy drop shadows.",
    failureConditions: [
      "Logo missing",
      "Logo distorted/warped or perspective-stretched",
      "Logo reimagined or replaced by text",
      "Logo cropped unintentionally",
      "Logo too small to read for the asset's intended use",
      "Logo blends into background without contrast protection",
      "Logo placed outside approved zone for this asset type",
    ],
  };
}

/** Generates a stable ID from assetType + variantName. */
function makeId(assetType: string, variantName: string) {
  return `${assetType.toLowerCase()}_${variantName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`.replace(/_+/g, "_");
}

/** Provides reasonable default tags by category + variant name. */
function deriveTags(assetType: Level5AssetType, category: string, variantName: string) {
  const tags = new Set<string>();
  tags.add(category);
  tags.add(assetType);

  if (category === "CredentialsPasses") tags.add("Badges");
  if (category === "PrintSignage" || category === "VenueEnvironmental") tags.add("Signage");
  if (category === "MerchSwag") tags.add("Merch");
  if (category === "DigitalSocial") tags.add("Social");
  if (category === "DocumentsComms") tags.add("Docs");
  if (category === "PresentationsContent") tags.add("Slides");

  const v = variantName.toLowerCase();
  if (v.includes("minimal")) tags.add("Minimal");
  if (v.includes("elegant") || v.includes("gala") || v.includes("lux")) tags.add("Premium");
  if (v.includes("dark")) tags.add("Dark");
  if (v.includes("neon") || v.includes("night")) tags.add("Neon");
  if (v.includes("tech") || v.includes("modular")) tags.add("Tech");
  if (v.includes("festival") || v.includes("bold")) tags.add("Bold");

  return Array.from(tags);
}

/**
 * Converts asset defaults + variant DNA into a complete Level5Template.
 *
 * Logo placement/size are enforced later by compileLevel5Prompt() via logoPlacementPresets.
 * This factory ensures every template has DNA, anchors, scene, guards, and prompt fragments.
 */
export function buildLevel5Template(args: {
  assetType: Level5AssetType;
  variantName: string;
  variablesOverride?: string[];
  extraLayoutRules?: string[];
  extraGuards?: string[];
  sceneContextOverride?: Partial<SceneSpec>;
}): Level5Template {
  const { assetType, variantName, variablesOverride, extraLayoutRules, extraGuards, sceneContextOverride } = args;

  const base = getAssetDefault(assetType);
  const variant = getVariantProfile(variantName);

  // Scene merge: base scene (if any) + variant overrides + caller overrides
  const sceneBase: SceneSpec = base.sceneBase ?? {
    environment: "Neutral studio environment (fallback) — keep it realistic and physically grounded",
    mounting: "Physically plausible mounting/printing for the asset type",
    people: "Optional blurred silhouettes; never block key info",
    lighting: "Neutral soft light with natural shadow falloff",
    realismConstraints: ["No floating designs", "Readable text", "Natural shadows"],
  };

  const mergedScene: SceneSpec = {
    ...sceneBase,
    ...(variant.sceneOverrides ?? {}),
    ...(sceneContextOverride ?? {}),
    realismConstraints: [
      ...new Set([
        ...(sceneBase.realismConstraints ?? []),
        ...((variant.sceneOverrides?.realismConstraints as string[] | undefined) ?? []),
        ...((sceneContextOverride?.realismConstraints as string[] | undefined) ?? []),
      ]),
    ],
  };

  // Variation controls
  const variationControls = variant.variationControls ?? {
    allowed: [
      "Background color within brand palette",
      "Motif intensity low/medium/high within reason",
      "Lighting mode consistent with template DNA",
      "Camera lens within stated camera language range",
    ],
    disallowed: [
      "Moving logo outside approved placement zones",
      "Breaking hierarchy (headline must remain primary when applicable)",
      "Adding clutter or extra brand marks",
      "Random perspective warping",
    ],
  };

  // Layout: base + variant hints + caller extra rules
  const layoutRules = [
    ...(base.layoutBase ?? []),
    ...(variant.layoutHints ?? []),
    ...(extraLayoutRules ?? []),
  ];

  // Guards: base + variant additions + caller additions
  const robustnessGuards = [
    ...(base.robustnessGuards ?? []),
    ...(variant.robustnessAdditions ?? []),
    ...(extraGuards ?? []),
  ];

  const variables = variablesOverride ?? base.variables;

  // Prompt fragments
  const designSpec: string[] = [
    base.dimensions
      ? `Design to spec: ${base.dimensions.size}, ${base.dimensions.dpi} DPI, ${base.dimensions.colorMode}${base.dimensions.bleed ? `, bleed ${base.dimensions.bleed}` : ""}${base.dimensions.safeMargin ? `, safe margin ${base.dimensions.safeMargin}` : ""}.`
      : "Design a brand-consistent system output (no physical scene required unless explicitly requested).",
    `Apply the template DNA: ${variant.dna.influence}.`,
    `Composition: ${variant.dna.composition}.`,
    `Materials/Finishes guidance: ${variant.dna.materialStory}; ${variant.dna.finishes}.`,
    `Typography behavior: ${variant.dna.typeBehavior}.`,
    `Graphic motif: ${variant.dna.graphicMotif}.`,
    "Enforce clean hierarchy and legibility for the intended viewing distance/format.",
    "Do not add extra logos, fake sponsors, or invented marks.",
  ];

  const photorealScene: string[] = [
    `Environment: ${mergedScene.environment}.`,
    `Mounting/physical reality: ${mergedScene.mounting}.`,
    `People: ${mergedScene.people}.`,
    `Lighting: ${mergedScene.lighting}.`,
    `Camera language: ${variant.dna.cameraLanguage}.`,
    ...mergedScene.realismConstraints.map((r) => `Realism constraint: ${r}.`),
  ];

  return {
    id: makeId(assetType, variantName),
    assetType,
    variantName,
    tags: deriveTags(assetType, base.category, variantName),
    dimensions: base.dimensions,
    variables,
    dna: variant.dna,
    anchors: variant.anchors,
    layout: layoutRules,
    logoRules: baseLogoRules(assetType),
    scene: mergedScene,
    variationControls,
    robustnessGuards,
    prompt: { designSpec, photorealScene },
  };
}

/** Convenience: build the 5-pack for an asset type given the variant names. */
export function buildTemplatePack(args: {
  assetType: Level5AssetType;
  variantNames: string[];
  variablesOverride?: string[];
  sceneContextOverride?: Partial<SceneSpec>;
}) {
  const { assetType, variantNames, variablesOverride, sceneContextOverride } = args;
  return variantNames.map((variantName) =>
    buildLevel5Template({ assetType, variantName, variablesOverride, sceneContextOverride })
  );
}

// ─── Public convenience API (backwards-compatible) ───────────────────────────

/** Generate a single template by asset type and variant name. */
export function generateTemplate(assetType: Level5AssetType, variantName: string): Level5Template {
  return buildLevel5Template({ assetType, variantName });
}

/** Generate ALL templates for a given asset type (all 5 variants). */
export function generateTemplatesForAsset(assetType: Level5AssetType): Level5Template[] {
  const variants = variantPacks[assetType];
  if (!variants) return [];
  return buildTemplatePack({ assetType, variantNames: [...variants] });
}

/** Generate ALL templates across ALL asset types. */
export function generateAllTemplates(): Level5Template[] {
  const allTypes = Object.keys(variantPacks) as Level5AssetType[];
  return allTypes.flatMap(generateTemplatesForAsset);
}

/** Get a specific template by asset type and optional variant name. */
export function getTemplate(assetType: Level5AssetType, variantName?: string): Level5Template | null {
  const variants = variantPacks[assetType];
  if (!variants || variants.length === 0) return null;

  const targetVariant = variantName
    ? variants.find((v) => v.toLowerCase() === variantName.toLowerCase()) ?? variants[0]
    : variants[0];

  return buildLevel5Template({ assetType, variantName: targetVariant });
}

/** List all available variant names for an asset type. */
export function getVariantsForAsset(assetType: Level5AssetType): readonly string[] {
  return variantPacks[assetType] ?? [];
}

/** Get the total count of templates in the system. */
export function getTemplateCount(): number {
  return Object.values(variantPacks).reduce((sum, v) => sum + v.length, 0);
}
