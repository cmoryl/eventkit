// Level-5 Template Factory — runtime expansion using getAssetDefault + getVariantProfile merge
import type { Level5Template, Level5AssetType, LogoRules, SceneSpec } from "../../types/eventTemplateSystem";
import { getAssetDefault, type AssetCategory } from "../../config/level5/assetDefaults";
import { getLogoRulesForAsset } from "../../config/level5/logoPlacementPresets";
import { variantPacks } from "../../config/level5/allAssetVariantPacks";
import { getVariantProfile } from "../../config/level5/variantDNA";
import { getCameraPreset, isGraphicOnlyCategory } from "./cameraPresets";

// ─── Logo Rules ──────────────────────────────────────────────────────────────

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

// ─── Uniqueness Seed ─────────────────────────────────────────────────────────

/**
 * Generate a deterministic uniqueness seed from event context.
 * This ensures each render is distinct but still on-template.
 */
export function generateUniquenessSeed(
  eventName: string,
  assetType: string,
  variantName: string,
  eventDate?: string,
  eventLocation?: string
): string {
  const raw = [eventName, assetType, variantName, eventDate ?? "", eventLocation ?? ""].join("|");
  // Simple hash to produce a short hex-like seed
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  const seed = Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
  return `SEED-${seed}`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeId(assetType: string, variantName: string) {
  return `${assetType.toLowerCase()}_${variantName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`.replace(/_+/g, "_");
}

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

// ─── Main Factory ────────────────────────────────────────────────────────────

/**
 * Converts asset defaults + variant DNA into a complete Level5Template.
 *
 * Upgrade #3: For Branding/Digital categories, scene is set to undefined
 * and photoreal fragments are removed to prevent "fake photo of logo on paper" artifacts.
 */
export function buildLevel5Template(args: {
  assetType: Level5AssetType;
  variantName: string;
  variablesOverride?: string[];
  extraLayoutRules?: string[];
  extraGuards?: string[];
  sceneContextOverride?: Partial<SceneSpec>;
  // Event context for uniqueness seed generation
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}): Level5Template {
  const {
    assetType, variantName, variablesOverride, extraLayoutRules,
    extraGuards, sceneContextOverride, eventName, eventDate, eventLocation,
  } = args;

  const base = getAssetDefault(assetType);
  const variant = getVariantProfile(variantName);
  const category = base.category as AssetCategory;
  const graphicOnly = isGraphicOnlyCategory(category);

  // ── Camera preset (Upgrade #3) ──
  const cameraPreset = getCameraPreset(assetType, category);

  // Override DNA camera language with the deterministic preset
  const finalDna = {
    ...variant.dna,
    cameraLanguage: graphicOnly ? "N/A — graphic output, no camera simulation" : cameraPreset,
  };

  // ── Scene merge (Upgrade #3: null for graphic-only) ──
  let mergedScene: SceneSpec;

  if (graphicOnly) {
    // Branding & Digital: NO photoreal scene — pure graphic output
    mergedScene = {
      environment: "N/A — pure graphic design output",
      mounting: "N/A",
      people: "N/A",
      lighting: "N/A — use design lighting only (gradients, color fields)",
      realismConstraints: ["Do NOT render as a photograph of a printed item", "Output clean vector/raster design only"],
    };
  } else {
    const sceneBase: SceneSpec = base.sceneBase ?? {
      environment: "Neutral studio environment — keep it realistic and physically grounded",
      mounting: "Physically plausible mounting/printing for the asset type",
      people: "Optional blurred silhouettes; never block key info",
      lighting: "Neutral soft light with natural shadow falloff",
      realismConstraints: ["No floating designs", "Readable text", "Natural shadows"],
    };

    mergedScene = {
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
  }

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

  // ── Uniqueness seed (Upgrade #1) ──
  const seed = eventName
    ? generateUniquenessSeed(eventName, assetType, variantName, eventDate, eventLocation)
    : undefined;

  // ── Prompt fragments ──
  const designSpec: string[] = [
    base.dimensions
      ? `Design to spec: ${base.dimensions.size}, ${base.dimensions.dpi} DPI, ${base.dimensions.colorMode}${base.dimensions.bleed ? `, bleed ${base.dimensions.bleed}` : ""}${base.dimensions.safeMargin ? `, safe margin ${base.dimensions.safeMargin}` : ""}.`
      : "Design a brand-consistent system output (no physical scene required unless explicitly requested).",
    `Apply the template DNA: ${finalDna.influence}.`,
    `Composition: ${finalDna.composition}.`,
    `Materials/Finishes guidance: ${finalDna.materialStory}; ${finalDna.finishes}.`,
    `Typography behavior: ${finalDna.typeBehavior}.`,
    `Graphic motif: ${finalDna.graphicMotif}.`,
    "Enforce clean hierarchy and legibility for the intended viewing distance/format.",
    "Do not add extra logos, fake sponsors, or invented marks.",
  ];

  // Inject uniqueness seed instruction
  if (seed) {
    designSpec.push(
      `UNIQUENESS SEED: ${seed}`,
      "Use this seed to vary ONLY allowed elements (pattern micro-variation, background texture grain, secondary shape placement, subtle color temperature shift within palette).",
      "Do NOT change anchors, hierarchy, logo placement, or composition structure based on the seed.",
    );
  }

  // Photoreal scene: only for physical assets
  const photorealScene: string[] = graphicOnly
    ? ["This is a pure graphic design output — do NOT simulate a photograph of a printed item or mockup."]
    : [
        `Environment: ${mergedScene.environment}.`,
        `Mounting/physical reality: ${mergedScene.mounting}.`,
        `People: ${mergedScene.people}.`,
        `Lighting: ${mergedScene.lighting}.`,
        `Camera: ${cameraPreset}.`,
        ...mergedScene.realismConstraints.map((r) => `Realism constraint: ${r}.`),
      ];

  return {
    id: makeId(assetType, variantName),
    assetType,
    variantName,
    tags: deriveTags(assetType, base.category, variantName),
    dimensions: base.dimensions,
    variables,
    dna: finalDna,
    anchors: variant.anchors,
    layout: layoutRules,
    logoRules: baseLogoRules(assetType),
    scene: mergedScene,
    variationControls,
    robustnessGuards,
    prompt: { designSpec, photorealScene },
  };
}

// ─── Convenience wrappers ────────────────────────────────────────────────────

export function buildTemplatePack(args: {
  assetType: Level5AssetType;
  variantNames: string[];
  variablesOverride?: string[];
  sceneContextOverride?: Partial<SceneSpec>;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}) {
  const { assetType, variantNames, variablesOverride, sceneContextOverride, eventName, eventDate, eventLocation } = args;
  return variantNames.map((variantName) =>
    buildLevel5Template({ assetType, variantName, variablesOverride, sceneContextOverride, eventName, eventDate, eventLocation })
  );
}

export function generateTemplate(assetType: Level5AssetType, variantName: string): Level5Template {
  return buildLevel5Template({ assetType, variantName });
}

export function generateTemplatesForAsset(assetType: Level5AssetType): Level5Template[] {
  const variants = variantPacks[assetType];
  if (!variants) return [];
  return buildTemplatePack({ assetType, variantNames: [...variants] });
}

export function generateAllTemplates(): Level5Template[] {
  const allTypes = Object.keys(variantPacks) as Level5AssetType[];
  return allTypes.flatMap(generateTemplatesForAsset);
}

export function getTemplate(assetType: Level5AssetType, variantName?: string): Level5Template | null {
  const variants = variantPacks[assetType];
  if (!variants || variants.length === 0) return null;
  const targetVariant = variantName
    ? variants.find((v) => v.toLowerCase() === variantName.toLowerCase()) ?? variants[0]
    : variants[0];
  return buildLevel5Template({ assetType, variantName: targetVariant });
}

export function getVariantsForAsset(assetType: Level5AssetType): readonly string[] {
  return variantPacks[assetType] ?? [];
}

export function getTemplateCount(): number {
  return Object.values(variantPacks).reduce((sum, v) => sum + v.length, 0);
}
