// src/services/aiBrain/promptCompiler.ts
// Real compiler layer: injects Level-5 DNA, anchors, uniqueness seed, quality gate, and scene rules
// Called BEFORE applyLearnedInsights so insights can tweak within the rules.

import type { GenerationContext } from "./types";
import { getAssetDefault } from "@/config/level5/assetDefaults";
import { getVariantProfile } from "@/config/level5/variantDNA";

/** Deterministic seed — stable per event+asset combo, not random */
function makeUniquenessSeed(context: GenerationContext): string {
  const parts = [
    context.eventName ?? "",
    context.assetType ?? "",
    context.location ?? "",
    context.eventDescription ?? "",
    (context.dimensions?.width ?? "").toString(),
    (context.dimensions?.height ?? "").toString(),
  ].join("|");

  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash * 31 + parts.charCodeAt(i)) >>> 0;
  }
  return `SEED-${hash.toString(16).padStart(8, "0")}`;
}

/** Branding & digital assets should NOT be forced into fake photography */
const BRANDING_ASSETS = new Set([
  "PALETTE", "LOGO", "LOGO_MONOCHROME", "LOGO_REVERSED",
  "SLOGANS", "STYLE_GUIDE", "SEAMLESS_PATTERN",
]);

const DIGITAL_ASSETS = new Set([
  "SOCIAL_POST", "SOCIAL_STORY", "EMAIL_HEADER", "LINKEDIN_BANNER",
  "TWITTER_HEADER", "YOUTUBE_THUMBNAIL", "PODCAST_COVER", "APP_ICON",
  "FAVICON", "ZOOM_BACKGROUND", "WEBINAR_SLIDE", "LIVE_STREAM_OVERLAY",
  "PRESENTATION_SLIDE", "AGENDA_HIGHLIGHTS", "SESSION_EVALUATION",
  "ANIMATED_LOGO", "DIGITAL_SIGNAGE_LOOP", "EVENT_APP_SPLASH",
  "COUNTDOWN_TIMER",
]);

function shouldUseScene(assetType: string): boolean {
  return !(BRANDING_ASSETS.has(assetType) || DIGITAL_ASSETS.has(assetType));
}

/**
 * Compile a generation prompt by layering Level-5 DNA, anchors,
 * uniqueness seed, quality gate, and scene rules onto a base prompt.
 */
export function compileGenerationPrompt(args: {
  basePrompt: string;
  context: GenerationContext;
  variantName?: string;
}): string {
  const { basePrompt, context, variantName } = args;

  const seed = makeUniquenessSeed(context);
  const useScene = shouldUseScene(context.assetType);

  // Resolve variant: explicit → styleDescription → fallback
  const vName = variantName ?? context.styleDescription ?? "Modern Minimal";
  const assetDefault = getAssetDefault(context.assetType as any);
  const variant = getVariantProfile(vName);

  // ── DNA block ──
  const dnaBlock = [
    "TEMPLATE DNA:",
    `- Influence: ${variant.dna.influence}`,
    `- Composition: ${variant.dna.composition}`,
    `- Materials/Finishes: ${variant.dna.materialStory}; ${variant.dna.finishes}`,
    `- Type behavior: ${variant.dna.typeBehavior}`,
    `- Motif: ${variant.dna.graphicMotif}`,
    ...(useScene
      ? [
          `- Lighting intent: ${variant.dna.lightingIntent}`,
          `- Camera language: ${variant.dna.cameraLanguage}`,
        ]
      : []),
  ].join("\n");

  // ── Anchors ──
  const anchorsBlock = [
    "ANCHORS (do not change):",
    ...variant.anchors.map((a) => `- ${a}`),
  ].join("\n");

  // ── Layout ──
  const layoutBlock = [
    "LAYOUT RULES:",
    ...(assetDefault.layoutBase ?? []).map((x) => `- ${x}`),
    ...(variant.layoutHints ?? []).map((x) => `- ${x}`),
  ].join("\n");

  // ── Uniqueness seed ──
  const uniquenessBlock = [
    `UNIQUENESS SEED: ${seed}`,
    "Use the uniqueness seed to vary ONLY these allowed elements:",
    "- micro-variation in background texture/grain (subtle)",
    "- secondary shape placement within safe zones",
    "- pattern offset/scale within approved range",
    "DO NOT change: anchors, hierarchy, logo placement zones, or readability.",
  ].join("\n");

  // ── Quality gate ──
  const qualityGate = [
    "QUALITY GATE (must pass before final output):",
    "1) Logo present + sharp + not distorted (if logo provided).",
    "2) Text is crisp and readable for intended distance/format.",
    "3) No warped edges, melted typography, or nonsense micro-details.",
    ...(useScene
      ? ["4) Correct physical mounting/print realism (no floating mockups)."]
      : []),
    "If any fail: regenerate internally and output only a passing result.",
  ].join("\n");

  // ── Scene / output mode ──
  const sceneBlock = useScene
    ? [
        "PHOTOREAL SCENE:",
        `- Environment: ${variant.sceneOverrides?.environment ?? assetDefault.sceneBase?.environment ?? "Real event venue context"}`,
        `- Mounting: ${variant.sceneOverrides?.mounting ?? assetDefault.sceneBase?.mounting ?? "Physically installed / printed"}`,
        `- People: ${variant.sceneOverrides?.people ?? assetDefault.sceneBase?.people ?? "Optional blurred silhouettes"}`,
        `- Lighting: ${variant.sceneOverrides?.lighting ?? assetDefault.sceneBase?.lighting ?? "Natural venue lighting"}`,
        ...(assetDefault.sceneBase?.realismConstraints ?? []).map(
          (r) => `- Constraint: ${r}`
        ),
      ].join("\n")
    : [
        "OUTPUT MODE: DIGITAL / DESIGN (no fake photography).",
        "Render as a clean, platform-native graphic layout on a flat canvas.",
        "No mockup shadows, no paper texture unless explicitly requested.",
      ].join("\n");

  return [
    basePrompt,
    "",
    dnaBlock,
    "",
    anchorsBlock,
    "",
    layoutBlock,
    "",
    uniquenessBlock,
    "",
    qualityGate,
    "",
    sceneBlock,
  ].join("\n");
}
