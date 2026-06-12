// src/services/aiBrain/promptCompiler.ts
// Prompt compiler layer: assembles masterful asset-family templates, Level-5 DNA,
// brand intelligence, production QA, safe zones, and no-drift logo instructions.

import type { GenerationContext } from "./types";
import { getAssetDefault } from "@/config/level5/assetDefaults";
import { getVariantProfile } from "@/config/level5/variantDNA";
import { buildMasterfulPromptTemplateBlock } from "@/services/masterfulPromptTemplateService";

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

const list = (title: string, items?: unknown[], max = 6) => {
  if (!items?.length) return "";
  return [title, ...items.slice(0, max).map((item) => `  • ${String(item)}`)].join("\n");
};

/**
 * Build brand intelligence block from knowledge entries.
 * This injects photography rules, logo usage, voice/tone, imagery, constraints,
 * social specs, event metadata, gradients, and approved/rejected examples.
 */
export function buildBrandIntelligenceBlock(
  brandKnowledge: Record<string, unknown>
): string {
  const blocks: string[] = [];

  const photographyStyle = brandKnowledge.photographyStyle as string | undefined;
  const photographyDos = brandKnowledge.photographyDos as string[] | undefined;
  const photographyDonts = brandKnowledge.photographyDonts as string[] | undefined;
  if (photographyStyle || photographyDos?.length || photographyDonts?.length) {
    blocks.push([
      "BRAND PHOTOGRAPHY RULES:",
      photographyStyle ? `  Style: ${photographyStyle}` : "",
      list("  DO:", photographyDos, 6),
      list("  DO NOT:", photographyDonts, 6),
    ].filter(Boolean).join("\n"));
  }

  const logoRules = brandKnowledge.logoPlacementRules as string[] | undefined;
  const logoClearSpace = brandKnowledge.logoClearSpace as string | undefined;
  const logoMinSize = brandKnowledge.logoMinSize as string | undefined;
  const logoBackgrounds = brandKnowledge.logoBackgrounds as string[] | undefined;
  if (logoRules?.length || logoClearSpace || logoMinSize || logoBackgrounds?.length) {
    blocks.push([
      "BRAND LOGO USAGE RULES:",
      logoClearSpace ? `  Clear space: ${logoClearSpace}` : "",
      logoMinSize ? `  Minimum size: ${logoMinSize}` : "",
      logoBackgrounds?.length ? `  Approved backgrounds: ${logoBackgrounds.join(", ")}` : "",
      list("  Rules:", logoRules, 6),
      "  Hard rule: the image model must not redraw, approximate, distort, recolor, or invent the logo. Visible logos are placed by deterministic overlay only.",
    ].filter(Boolean).join("\n"));
  }

  const voice = brandKnowledge.voice as string[] | undefined;
  const tone = brandKnowledge.tone as string[] | undefined;
  const writingStyle = brandKnowledge.writingStyle as string | undefined;
  const tagline = brandKnowledge.tagline as string | undefined;
  const taglineSecondary = brandKnowledge.taglineSecondary as string | undefined;
  const taglineVariations = brandKnowledge.taglineVariations as string[] | undefined;
  const mission = brandKnowledge.mission as string | undefined;
  const industry = brandKnowledge.industry as string | undefined;
  const targetAudience = brandKnowledge.targetAudience as string | undefined;
  if (voice?.length || tone?.length || writingStyle || tagline || mission || industry || targetAudience) {
    blocks.push([
      "BRAND VOICE & TONE:",
      voice?.length ? `  Voice: ${voice.join(", ")}` : "",
      tone?.length ? `  Tone: ${tone.join(", ")}` : "",
      writingStyle ? `  Writing style: ${writingStyle}` : "",
      tagline ? `  Primary tagline: \"${tagline}\"` : "",
      taglineSecondary ? `  Secondary tagline: \"${taglineSecondary}\"` : "",
      taglineVariations?.length ? `  Campaign tagline options: ${taglineVariations.slice(0, 4).map((v) => `\"${v}\"`).join("; ")}` : "",
      mission ? `  Mission: ${mission}` : "",
      industry ? `  Industry: ${industry}` : "",
      targetAudience ? `  Target audience: ${targetAudience}` : "",
    ].filter(Boolean).join("\n"));
  }

  const restricted = brandKnowledge.restrictedElements as string[] | undefined;
  const approvedLayouts = brandKnowledge.approvedLayouts as string[] | undefined;
  if (restricted?.length || approvedLayouts?.length) {
    blocks.push([
      "BRAND CONSTRAINTS:",
      list("  NEVER:", restricted, 8),
      list("  APPROVED LAYOUTS:", approvedLayouts, 6),
    ].filter(Boolean).join("\n"));
  }

  const imagery = brandKnowledge.imagery as string | undefined;
  const archetype = brandKnowledge.archetype as string | undefined;
  const gradients = brandKnowledge.gradients as string[] | undefined;
  if (imagery || archetype || gradients?.length) {
    blocks.push([
      "BRAND VISUAL IDENTITY:",
      archetype ? `  Archetype: ${archetype}` : "",
      imagery ? `  Imagery approach: ${imagery}` : "",
      gradients?.length ? `  Approved gradients: ${gradients.slice(0, 4).join("; ")}` : "",
    ].filter(Boolean).join("\n"));
  }

  const values = brandKnowledge.values as string[] | undefined;
  const services = brandKnowledge.services as string[] | undefined;
  if (values?.length || services?.length) {
    blocks.push([
      "BRAND CONTENT:",
      values?.length ? `  Values: ${values.slice(0, 8).join(", ")}` : "",
      services?.length ? `  Services/offerings: ${services.slice(0, 8).join(", ")}` : "",
    ].filter(Boolean).join("\n"));
  }

  const linkedEvents = brandKnowledge.linkedEvents as Array<{ name?: string; region?: string; location?: string; dates?: string; venue?: string }> | undefined;
  if (linkedEvents?.length) {
    blocks.push([
      "REGIONAL EVENT SERIES:",
      ...linkedEvents.slice(0, 8).map((e) => `  • ${e.name} — ${e.location || e.region || ""}${e.dates ? `, ${e.dates}` : ""}${e.venue ? ` at ${e.venue}` : ""}`),
      "  Design should feel part of this cohesive global event series.",
    ].join("\n"));
  }

  const schedule = brandKnowledge.schedule as Array<{ title?: string; time?: string; track?: string }> | undefined;
  if (schedule?.length) {
    blocks.push([
      "EVENT SCHEDULE:",
      ...schedule.slice(0, 10).map((s) => `  ${s.time || ""}: ${s.title || ""}${s.track ? ` [${s.track}]` : ""}`),
    ].join("\n"));
  }

  const sponsors = brandKnowledge.sponsors as Array<{ name?: string; tier?: string }> | undefined;
  if (sponsors?.length) {
    blocks.push([
      "EVENT SPONSORS:",
      ...sponsors.slice(0, 12).map((s) => `  • ${s.name}${s.tier ? ` (${s.tier})` : ""}`),
    ].join("\n"));
  }

  const divisions = brandKnowledge.divisions as Array<{ name?: string; tagline?: string; services?: string[] }> | undefined;
  if (divisions?.length) {
    blocks.push([
      "BRAND DIVISIONS/PARTNERS:",
      ...divisions.slice(0, 8).map((d) => `  • ${d.name}${d.tagline ? `: \"${d.tagline}\"` : ""}${d.services?.length ? ` — ${d.services.slice(0, 3).join(", ")}` : ""}`),
    ].join("\n"));
  }

  const socialSpecs = brandKnowledge.socialPlatforms as Array<{ platform?: string; postSize?: string; directive?: string }> | undefined;
  if (socialSpecs?.length) {
    blocks.push([
      "SOCIAL MEDIA SPECS:",
      ...socialSpecs.slice(0, 8).map((s) => `  ${s.platform}: ${s.postSize || ""}${s.directive ? ` — ${s.directive}` : ""}`),
    ].join("\n"));
  }

  const eventDetailsData = brandKnowledge.eventDetailsData as Record<string, unknown> | undefined;
  if (eventDetailsData) {
    const lines = [
      eventDetailsData.hashtag ? `  Hashtag: ${eventDetailsData.hashtag}` : "",
      eventDetailsData.registrationUrl ? `  Registration: ${eventDetailsData.registrationUrl}` : "",
      eventDetailsData.eventDates ? `  Dates: ${eventDetailsData.eventDates}` : "",
    ].filter(Boolean);
    if (lines.length) blocks.push(["EVENT DETAILS:", ...lines].join("\n"));
  }

  if (!blocks.length) return "";
  return `\n=== BRAND INTELLIGENCE ===\n${blocks.join("\n\n")}\n=== END BRAND INTELLIGENCE ===\n`;
}

/**
 * Compile a generation prompt by layering:
 * 1) user/base prompt
 * 2) masterful asset-family template
 * 3) Level-5 DNA and variant anchors
 * 4) production QA, scene/output rules, and brand intelligence
 */
export function compileGenerationPrompt(args: {
  basePrompt: string;
  context: GenerationContext;
  variantName?: string;
  brandKnowledge?: Record<string, unknown>;
}): string {
  const { basePrompt, context, variantName, brandKnowledge } = args;

  const seed = makeUniquenessSeed(context);
  const useScene = shouldUseScene(context.assetType);
  const vName = variantName ?? context.styleDescription ?? "Modern Minimal";
  const assetDefault = getAssetDefault(context.assetType as any);
  const variant = getVariantProfile(vName);

  const masterfulTemplateBlock = buildMasterfulPromptTemplateBlock({
    assetType: context.assetType,
    eventDetails: {
      name: context.eventName || "Event",
      description: context.eventDescription || "",
      date: "",
      location: context.location || "",
      website: "",
      email: "",
      incorporateLocationStyle: false,
    },
    colorPalette: context.colorPalette || [],
    styleDescription: basePrompt,
    hasExactLogoSource: Boolean(context.logoBase64),
    hasVisualReferences: Boolean(context.vibeImageBase64),
    hasPatternReferences: Boolean(context.masterPatternBase64),
  });

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

  const anchorsBlock = [
    "ANCHORS (do not change):",
    ...variant.anchors.map((a) => `- ${a}`),
  ].join("\n");

  const layoutBlock = [
    "LAYOUT RULES:",
    ...(assetDefault.layoutBase ?? []).map((x) => `- ${x}`),
    ...(variant.layoutHints ?? []).map((x) => `- ${x}`),
  ].join("\n");

  const uniquenessBlock = [
    `UNIQUENESS SEED: ${seed}`,
    "Use the uniqueness seed to vary ONLY these allowed elements:",
    "- micro-variation in background texture/grain (subtle)",
    "- secondary shape placement within safe zones",
    "- pattern offset/scale within approved range",
    "DO NOT change: anchors, hierarchy, logo placement zones, readability, typography system, or campaign motif.",
  ].join("\n");

  const qualityGate = [
    "QUALITY GATE (must pass before final output):",
    "1) Clear primary/secondary/tertiary hierarchy; no equal-weight clutter.",
    "2) Logo is never drawn by AI; if required, logo zone is blank, clean, and unobstructed for deterministic overlay.",
    "3) Text/content zones are crisp, readable, and safe for intended distance/format.",
    "4) Brand colors, typography behavior, motif, and layout rhythm match the active brand brain.",
    "5) No warped edges, melted typography, fake UI, fake sponsors, or nonsense micro-details.",
    ...(useScene ? ["6) Correct physical mounting/print realism; no floating mockups or impossible perspective."] : []),
    "If any fail: regenerate internally and output only a passing result.",
  ].join("\n");

  const sceneBlock = useScene
    ? [
        "PHOTOREAL SCENE:",
        `- Environment: ${variant.sceneOverrides?.environment ?? assetDefault.sceneBase?.environment ?? "Real event venue context"}`,
        `- Mounting: ${variant.sceneOverrides?.mounting ?? assetDefault.sceneBase?.mounting ?? "Physically installed / printed"}`,
        `- People: ${variant.sceneOverrides?.people ?? assetDefault.sceneBase?.people ?? "Optional blurred silhouettes"}`,
        `- Lighting: ${variant.sceneOverrides?.lighting ?? assetDefault.sceneBase?.lighting ?? "Natural venue lighting"}`,
        ...(assetDefault.sceneBase?.realismConstraints ?? []).map((r) => `- Constraint: ${r}`),
      ].join("\n")
    : [
        "OUTPUT MODE: DIGITAL / DESIGN (no fake photography).",
        "Render as a clean, platform-native graphic layout on a flat canvas.",
        "No mockup shadows, no paper texture unless explicitly requested.",
      ].join("\n");

  const brandBlock = brandKnowledge ? buildBrandIntelligenceBlock(brandKnowledge) : "";

  return [
    basePrompt,
    "",
    masterfulTemplateBlock,
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
    brandBlock,
  ].join("\n");
}
