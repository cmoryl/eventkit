// Level-5 Template Generator — runtime expansion of variant packs into full templates
import type { Level5Template, Level5AssetType, TemplateDNA } from "../../types/eventTemplateSystem";
import { getAssetDefaults } from "../../config/level5/assetDefaults";
import { getLogoRulesForAsset } from "../../config/level5/logoPlacementPresets";
import { variantPacks } from "../../config/level5/allAssetVariantPacks";
import { resolveVariantDNA } from "../../config/level5/variantDNA";

/**
 * Generate a single Level5Template by combining:
 *  - Asset defaults (dims, variables, base scene/layout/guards)
 *  - Variant DNA (style archetype matched by name)
 *  - Logo placement presets (hard rules per asset type)
 */
export function generateTemplate(
  assetType: Level5AssetType,
  variantName: string
): Level5Template {
  const defaults = getAssetDefaults(assetType);
  const logoRules = getLogoRulesForAsset(assetType);
  const dnaPreset = resolveVariantDNA(variantName);

  const id = `${assetType.toLowerCase()}_${variantName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  const dna: TemplateDNA = {
    influence: dnaPreset.influence,
    composition: dnaPreset.composition,
    materialStory: dnaPreset.materialHint,
    finishes: dnaPreset.finishes,
    typeBehavior: dnaPreset.typeBehavior,
    graphicMotif: dnaPreset.motif,
    lightingIntent: dnaPreset.lightingIntent,
    cameraLanguage: dnaPreset.cameraLanguage,
  };

  const scene = dnaPreset.sceneOverrides
    ? { ...defaults.baseScene, ...dnaPreset.sceneOverrides }
    : defaults.baseScene;

  const assetName = assetType.replace(/_/g, " ").toLowerCase();

  return {
    id,
    assetType,
    variantName,
    tags: [...defaults.baseTags, ...(dnaPreset.tags ?? [])],
    dimensions: defaults.dimensions,
    variables: defaults.variables,
    dna,
    anchors: [
      `Visual identity driven by ${dnaPreset.influence}`,
      `Composition follows ${dnaPreset.composition}`,
      `Material feel: ${dnaPreset.materialHint}`,
    ],
    layout: defaults.baseLayout,
    logoRules,
    scene,
    variationControls: {
      allowed: [
        "Color palette variations within brand",
        "Typography weight adjustments",
        "Background tone (light/dark) within brand palette",
        `Motif density adjustment for ${variantName} style`,
      ],
      disallowed: [
        "Moving logo out of designated zone",
        "Breaking the composition structure",
        "Adding unlisted sponsors or trademarks",
        "Changing the DNA influence archetype",
      ],
    },
    robustnessGuards: defaults.baseGuards,
    prompt: {
      designSpec: [
        `Design a ${variantName.toLowerCase()} style ${assetName} for "{{eventName}}".`,
        `Apply ${dnaPreset.influence} influence with ${dnaPreset.composition}.`,
        `Material story: ${dnaPreset.materialHint}. Finishes: ${dnaPreset.finishes}.`,
        `Typography: ${dnaPreset.typeBehavior}. Motif: ${dnaPreset.motif}.`,
        defaults.dimensions.colorMode === "CMYK"
          ? `Output at ${defaults.dimensions.dpi} DPI, ${defaults.dimensions.colorMode}, ${defaults.dimensions.size}. CMYK-safe colors only.`
          : `Output at ${defaults.dimensions.size}, ${defaults.dimensions.colorMode} optimized for screen display.`,
      ],
      photorealScene: [
        `Photograph the ${assetName} in: ${scene.environment}.`,
        `Physical mounting: ${scene.mounting}. ${scene.people}`,
        `Lighting: ${dnaPreset.lightingIntent}. Camera: ${dnaPreset.cameraLanguage}.`,
        "The asset must look physically present — no floating mockups.",
        ...scene.realismConstraints.map(c => `Constraint: ${c}`),
      ],
    },
  };
}

/**
 * Generate ALL templates for a given asset type (all 5 variants).
 */
export function generateTemplatesForAsset(assetType: Level5AssetType): Level5Template[] {
  const variants = variantPacks[assetType];
  if (!variants) return [];
  return variants.map(v => generateTemplate(assetType, v));
}

/**
 * Generate ALL templates across ALL asset types.
 * Returns a flat array of Level5Template objects.
 */
export function generateAllTemplates(): Level5Template[] {
  const allTypes = Object.keys(variantPacks) as Level5AssetType[];
  return allTypes.flatMap(generateTemplatesForAsset);
}

/**
 * Get a specific template by asset type and variant name.
 * If not found, returns the first variant for that asset type.
 */
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

/**
 * List all available variant names for an asset type.
 */
export function getVariantsForAsset(assetType: Level5AssetType): readonly string[] {
  return variantPacks[assetType] ?? [];
}

/**
 * Get the total count of templates in the system.
 */
export function getTemplateCount(): number {
  return Object.values(variantPacks).reduce((sum, v) => sum + v.length, 0);
}
