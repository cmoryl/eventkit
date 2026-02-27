// Level-5 Template Generator — runtime expansion using getAssetDefault + getVariantProfile merge
import type { Level5Template, Level5AssetType, TemplateDNA, SceneSpec } from "../../types/eventTemplateSystem";
import { getAssetDefault, type AssetDefault } from "../../config/level5/assetDefaults";
import { getLogoRulesForAsset } from "../../config/level5/logoPlacementPresets";
import { variantPacks } from "../../config/level5/allAssetVariantPacks";
import { getVariantProfile, type VariantDNAProfile } from "../../config/level5/variantDNA";

/**
 * Generate a single Level5Template by merging:
 *  - getAssetDefault(assetType)  → dims, variables, scene, layout, guards
 *  - getVariantProfile(variantName) → DNA, anchors, scene overrides, layout hints
 *  - getLogoRulesForAsset(assetType) → hard logo placement rules
 */
export function generateTemplate(
  assetType: Level5AssetType,
  variantName: string
): Level5Template {
  const base = getAssetDefault(assetType);
  const variant = getVariantProfile(variantName);
  const logoRules = getLogoRulesForAsset(assetType);

  const id = `${assetType.toLowerCase()}_${variantName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  // Build DNA from variant profile
  const dna: TemplateDNA = {
    influence: variant.dna.influence,
    composition: variant.dna.composition,
    materialStory: variant.dna.materialStory,
    finishes: variant.dna.finishes,
    typeBehavior: variant.dna.typeBehavior,
    graphicMotif: variant.dna.graphicMotif,
    lightingIntent: variant.dna.lightingIntent,
    cameraLanguage: variant.dna.cameraLanguage,
  };

  // Merge scene: base scene + variant overrides
  const scene: SceneSpec = mergeScene(base, variant);

  // Merge layout: base layout + variant hints
  const layout = [...base.layoutBase, ...(variant.layoutHints ?? [])];

  // Merge guards: base guards + variant additions
  const guards = [...base.robustnessGuards, ...(variant.robustnessAdditions ?? [])];

  // Build tags from category + variant
  const tags = [base.category, ...(variant.dna.influence.split("+").map(s => s.trim()))];

  const assetName = assetType.replace(/_/g, " ").toLowerCase();

  // Build variation controls
  const variationControls = variant.variationControls ?? {
    allowed: [
      "Color palette variations within brand",
      "Typography weight adjustments",
      "Background tone (light/dark) within brand palette",
    ],
    disallowed: [
      "Moving logo out of designated zone",
      "Breaking the composition structure",
      "Adding unlisted sponsors or trademarks",
      "Changing the DNA influence archetype",
    ],
  };

  return {
    id,
    assetType,
    variantName,
    tags,
    dimensions: base.dimensions,
    variables: base.variables,
    dna,
    anchors: variant.anchors,
    layout,
    logoRules,
    scene,
    variationControls,
    robustnessGuards: guards,
    prompt: {
      designSpec: buildDesignSpec(assetName, variantName, variant, base),
      photorealScene: buildPhotorealScene(assetName, scene, variant),
    },
  };
}

// ─── Internal helpers ─────────────────────────────────

function mergeScene(base: AssetDefault, variant: VariantDNAProfile): SceneSpec {
  const baseScene = base.sceneBase;
  const overrides = variant.sceneOverrides;

  if (!baseScene) {
    return {
      environment: overrides?.environment ?? "Professional event context",
      mounting: overrides?.mounting ?? "Appropriate display medium",
      people: overrides?.people ?? "Optional context figures",
      lighting: overrides?.lighting ?? variant.dna.lightingIntent,
      realismConstraints: overrides?.realismConstraints ?? [
        "No floating layouts",
        "Natural shadows",
        "No AI-smudged text",
      ],
    };
  }

  return {
    environment: overrides?.environment ?? baseScene.environment,
    mounting: overrides?.mounting ?? baseScene.mounting,
    people: overrides?.people ?? baseScene.people,
    lighting: overrides?.lighting ?? baseScene.lighting,
    realismConstraints: overrides?.realismConstraints ?? baseScene.realismConstraints,
  };
}

function buildDesignSpec(
  assetName: string,
  variantName: string,
  variant: VariantDNAProfile,
  base: AssetDefault
): string[] {
  const lines = [
    `Design a ${variantName.toLowerCase()} style ${assetName} for "{{eventName}}".`,
    `Apply ${variant.dna.influence} influence with ${variant.dna.composition}.`,
    `Material story: ${variant.dna.materialStory}. Finishes: ${variant.dna.finishes}.`,
    `Typography: ${variant.dna.typeBehavior}. Motif: ${variant.dna.graphicMotif}.`,
  ];

  if (base.dimensions) {
    lines.push(
      base.dimensions.colorMode === "CMYK"
        ? `Output at ${base.dimensions.dpi} DPI, ${base.dimensions.colorMode}, ${base.dimensions.size}. CMYK-safe colors only.`
        : `Output at ${base.dimensions.size}, ${base.dimensions.colorMode} optimized for screen display.`
    );
    if (base.dimensions.bleed) lines.push(`Bleed: ${base.dimensions.bleed}. Safe margin: ${base.dimensions.safeMargin ?? "standard"}.`);
  }

  return lines;
}

function buildPhotorealScene(
  assetName: string,
  scene: SceneSpec,
  variant: VariantDNAProfile
): string[] {
  return [
    `Photograph the ${assetName} in: ${scene.environment}.`,
    `Physical mounting: ${scene.mounting}. ${scene.people}`,
    `Lighting: ${variant.dna.lightingIntent}. Camera: ${variant.dna.cameraLanguage}.`,
    "The asset must look physically present — no floating mockups.",
    ...scene.realismConstraints.map(c => `Constraint: ${c}`),
  ];
}

// ─── Public API ───────────────────────────────────────

/** Generate ALL templates for a given asset type (all 5 variants). */
export function generateTemplatesForAsset(assetType: Level5AssetType): Level5Template[] {
  const variants = variantPacks[assetType];
  if (!variants) return [];
  return variants.map(v => generateTemplate(assetType, v));
}

/** Generate ALL templates across ALL asset types. */
export function generateAllTemplates(): Level5Template[] {
  const allTypes = Object.keys(variantPacks) as Level5AssetType[];
  return allTypes.flatMap(generateTemplatesForAsset);
}

/** Get a specific template by asset type and variant name. */
export function getTemplate(
  assetType: Level5AssetType,
  variantName?: string
): Level5Template | null {
  const variants = variantPacks[assetType];
  if (!variants || variants.length === 0) return null;

  const targetVariant = variantName
    ? variants.find(v => v.toLowerCase() === variantName.toLowerCase()) ?? variants[0]
    : variants[0];

  return generateTemplate(assetType, targetVariant);
}

/** List all available variant names for an asset type. */
export function getVariantsForAsset(assetType: Level5AssetType): readonly string[] {
  return variantPacks[assetType] ?? [];
}

/** Get the total count of templates in the system. */
export function getTemplateCount(): number {
  return Object.values(variantPacks).reduce((sum, v) => sum + v.length, 0);
}
