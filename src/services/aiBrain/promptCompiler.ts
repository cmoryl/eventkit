// src/services/aiBrain/promptCompiler.ts
// Real compiler layer: injects Level-5 DNA, anchors, uniqueness seed, quality gate,
// scene rules, AND brand intelligence from the knowledge base.

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
 * Build brand intelligence block from knowledge entries.
 * This injects photography rules, logo usage, voice/tone, imagery, and constraints.
 */
export function buildBrandIntelligenceBlock(
  brandKnowledge: Record<string, unknown>
): string {
  const blocks: string[] = [];

  // Photography rules
  const photoDos = brandKnowledge.photographyDos as string[] | undefined;
  const photoDonts = brandKnowledge.photographyDonts as string[] | undefined;
  const photoStyle = brandKnowledge.photographyStyle as string | undefined;
  if (photoStyle || photoDos?.length || photoDonts?.length) {
    const lines = ["BRAND PHOTOGRAPHY RULES:"];
    if (photoStyle) lines.push(`  Style: ${photoStyle}`);
    if (photoDos?.length) {
      lines.push("  DO:");
      photoDos.slice(0, 6).forEach(d => lines.push(`    ✓ ${d}`));
    }
    if (photoDonts?.length) {
      lines.push("  DO NOT:");
      photoDonts.slice(0, 6).forEach(d => lines.push(`    ✗ ${d}`));
    }
    blocks.push(lines.join("\n"));
  }

  // Logo usage rules
  const logoRules = brandKnowledge.logoPlacementRules as string[] | undefined;
  const logoClearSpace = brandKnowledge.logoClearSpace as string | undefined;
  const logoMinSize = brandKnowledge.logoMinSize as string | undefined;
  const logoBgs = brandKnowledge.logoBackgrounds as string[] | undefined;
  if (logoRules?.length || logoClearSpace || logoMinSize) {
    const lines = ["BRAND LOGO USAGE RULES:"];
    if (logoClearSpace) lines.push(`  Clear space: ${logoClearSpace}`);
    if (logoMinSize) lines.push(`  Minimum size: ${logoMinSize}`);
    if (logoBgs?.length) lines.push(`  Approved backgrounds: ${logoBgs.join(", ")}`);
    if (logoRules?.length) {
      logoRules.slice(0, 5).forEach(r => lines.push(`  • ${r}`));
    }
    blocks.push(lines.join("\n"));
  }

  // Voice & tone
  const voice = brandKnowledge.voice as string[] | undefined;
  const tone = brandKnowledge.tone as string[] | undefined;
  const writingStyle = brandKnowledge.writingStyle as string | undefined;
  const tagline = brandKnowledge.tagline as string | undefined;
  const taglineSecondary = brandKnowledge.taglineSecondary as string | undefined;
  const taglineVariations = brandKnowledge.taglineVariations as string[] | undefined;
  const mission = brandKnowledge.mission as string | undefined;
  const industry = brandKnowledge.industry as string | undefined;
  const targetAudience = brandKnowledge.targetAudience as string | undefined;
  if (voice?.length || tone?.length || writingStyle || tagline) {
    const lines = ["BRAND VOICE & TONE:"];
    if (voice?.length) lines.push(`  Voice: ${voice.join(", ")}`);
    if (tone?.length) lines.push(`  Tone: ${tone.join(", ")}`);
    if (writingStyle) lines.push(`  Writing style: ${writingStyle}`);
    if (tagline) lines.push(`  Primary tagline: "${tagline}"`);
    if (taglineSecondary) lines.push(`  Secondary tagline: "${taglineSecondary}"`);
    if (taglineVariations?.length) {
      lines.push(`  Tagline variations for campaign use:`);
      taglineVariations.slice(0, 4).forEach(v => lines.push(`    • "${v}"`));
    }
    if (mission) lines.push(`  Mission: ${mission}`);
    if (industry) lines.push(`  Industry: ${industry}`);
    if (targetAudience) lines.push(`  Target audience: ${targetAudience}`);
    blocks.push(lines.join("\n"));
  }

  // Constraints / restrictions
  const restricted = brandKnowledge.restrictedElements as string[] | undefined;
  const approvedLayouts = brandKnowledge.approvedLayouts as string[] | undefined;
  if (restricted?.length || approvedLayouts?.length) {
    const lines = ["BRAND CONSTRAINTS:"];
    if (restricted?.length) {
      lines.push("  NEVER:");
      restricted.slice(0, 5).forEach(r => lines.push(`    ✗ ${r}`));
    }
    if (approvedLayouts?.length) {
      lines.push("  APPROVED LAYOUTS:");
      approvedLayouts.slice(0, 4).forEach(l => lines.push(`    ✓ ${l}`));
    }
    blocks.push(lines.join("\n"));
  }

  // Imagery style
  const imagery = brandKnowledge.imagery as string | undefined;
  const archetype = brandKnowledge.archetype as string | undefined;
  if (imagery || archetype) {
    const lines = ["BRAND VISUAL IDENTITY:"];
    if (archetype) lines.push(`  Archetype: ${archetype}`);
    if (imagery) lines.push(`  Imagery approach: ${imagery}`);
    blocks.push(lines.join("\n"));
  }

  // Event context from BrandHub
  const eventName = brandKnowledge.name as string | undefined;
  const eventDate = brandKnowledge.date as string | undefined;
  const eventVenue = brandKnowledge.venue as string | undefined;
  const eventType = brandKnowledge.eventType as string | undefined;
  const eventDescription = brandKnowledge.description as string | undefined;
  const attendeeCount = brandKnowledge.attendeeCount as string | number | undefined;
  if (eventName || eventVenue || eventDate) {
    const lines = ["EVENT CONTEXT (from BrandHub):"];
    if (eventName) lines.push(`  Event: ${eventName}`);
    if (eventType) lines.push(`  Type: ${eventType}`);
    if (eventDate) lines.push(`  Date: ${eventDate}`);
    if (eventVenue) lines.push(`  Venue: ${eventVenue}`);
    if (attendeeCount) lines.push(`  Expected attendees: ${attendeeCount}`);
    if (eventDescription) lines.push(`  Description: ${eventDescription}`);
    lines.push("  Use this context to make designs feel event-specific and timely.");
    blocks.push(lines.join("\n"));
  }

  // Content assets — services & values for text-heavy designs
  const values = brandKnowledge.values as string[] | undefined;
  const services = brandKnowledge.services as string[] | undefined;
  if (values?.length || services?.length) {
    const lines = ["BRAND CONTENT (use in copy-heavy assets):"];
    if (values?.length) lines.push(`  Brand values: ${values.slice(0, 5).join(", ")}`);
    if (services?.length) {
      lines.push("  Services/offerings:");
      services.slice(0, 4).forEach(s => lines.push(`    • ${s}`));
    }
    blocks.push(lines.join("\n"));
  }

  // Gradients for design use
  const gradients = brandKnowledge.gradients as string[] | undefined;
  if (gradients?.length) {
    blocks.push(`BRAND GRADIENTS:\n${gradients.slice(0, 3).map(g => `  • ${g}`).join("\n")}`);
  }

  // Color combinations — approved/rejected for design guidance
  const colorCombos = brandKnowledge.colorCombinations as { approved?: Array<{ name?: string; colors?: string[]; notes?: string }>; rejected?: Array<{ name?: string; colors?: string[]; notes?: string }> } | undefined;
  if (colorCombos?.approved?.length || colorCombos?.rejected?.length) {
    const lines = ["APPROVED COLOR COMBINATIONS:"];
    if (colorCombos.approved?.length) {
      colorCombos.approved.slice(0, 4).forEach(c => {
        lines.push(`  ✓ "${c.name}": ${(c.colors || []).join(" + ")}${c.notes ? ` — ${c.notes}` : ''}`);
      });
    }
    if (colorCombos.rejected?.length) {
      lines.push("  REJECTED COMBINATIONS (avoid):");
      colorCombos.rejected.slice(0, 3).forEach(c => {
        lines.push(`  ✗ "${c.name}": ${(c.colors || []).join(" + ")}${c.notes ? ` — ${c.notes}` : ''}`);
      });
    }
    blocks.push(lines.join("\n"));
  }

  // Linked regional events — for multi-event context
  const linkedEvents = brandKnowledge.linkedEvents as Array<{ name?: string; region?: string; location?: string; dates?: string; venue?: string }> | undefined;
  if (linkedEvents?.length) {
    const lines = ["REGIONAL EVENT SERIES:"];
    linkedEvents.slice(0, 6).forEach(e => {
      lines.push(`  • ${e.name} — ${e.location || e.region}${e.dates ? `, ${e.dates}` : ''}${e.venue ? ` at ${e.venue}` : ''}`);
    });
    lines.push("  Design should feel part of this cohesive global event series.");
    blocks.push(lines.join("\n"));
  }

  // Event schedule — for agenda-related assets
  const schedule = brandKnowledge.schedule as Array<{ title?: string; time?: string; track?: string }> | undefined;
  if (schedule?.length) {
    const lines = ["EVENT SCHEDULE (for agenda/program assets):"];
    schedule.slice(0, 8).forEach(s => {
      lines.push(`  ${s.time || ''}: ${s.title}${s.track ? ` [${s.track}]` : ''}`);
    });
    blocks.push(lines.join("\n"));
  }

  // Sponsor list
  const sponsors = brandKnowledge.sponsors as Array<{ name?: string; tier?: string }> | undefined;
  if (sponsors?.length) {
    const lines = ["EVENT SPONSORS:"];
    sponsors.slice(0, 10).forEach(s => {
      lines.push(`  • ${s.name}${s.tier ? ` (${s.tier})` : ''}`);
    });
    blocks.push(lines.join("\n"));
  }

  // Partner divisions/booths
  const divisions = brandKnowledge.divisions as Array<{ name?: string; tagline?: string; services?: string[] }> | undefined;
  if (divisions?.length) {
    const lines = ["BRAND DIVISIONS/PARTNERS:"];
    divisions.slice(0, 6).forEach(d => {
      lines.push(`  • ${d.name}${d.tagline ? `: "${d.tagline}"` : ''}${d.services?.length ? ` — ${d.services.slice(0, 3).join(', ')}` : ''}`);
    });
    blocks.push(lines.join("\n"));
  }

  // Social platform specs
  const socialSpecs = brandKnowledge.socialPlatforms as Array<{ platform?: string; postSize?: string; directive?: string }> | undefined;
  if (socialSpecs?.length) {
    const lines = ["SOCIAL MEDIA SPECS:"];
    socialSpecs.slice(0, 6).forEach(s => {
      lines.push(`  ${s.platform}: ${s.postSize || ''}${s.directive ? ` — ${s.directive}` : ''}`);
    });
    blocks.push(lines.join("\n"));
  }

  // Event details (dates, hashtag, registration)
  const eventDetailsData = brandKnowledge.eventDetailsData as Record<string, unknown> | undefined;
  if (eventDetailsData) {
    const lines: string[] = [];
    if (eventDetailsData.hashtag) lines.push(`  Hashtag: ${eventDetailsData.hashtag}`);
    if (eventDetailsData.registrationUrl) lines.push(`  Registration: ${eventDetailsData.registrationUrl}`);
    if (eventDetailsData.eventDates) lines.push(`  Dates: ${eventDetailsData.eventDates}`);
    if (lines.length) {
      blocks.push(["EVENT DETAILS:", ...lines].join("\n"));
    }
  }

  if (blocks.length === 0) return "";

  return `\n=== BRAND INTELLIGENCE ===\n${blocks.join("\n\n")}\n=== END BRAND INTELLIGENCE ===\n`;
}

/**
 * Compile a generation prompt by layering Level-5 DNA, anchors,
 * uniqueness seed, quality gate, and scene rules onto a base prompt.
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

  // ── Brand Intelligence ──
  const brandBlock = brandKnowledge
    ? buildBrandIntelligenceBlock(brandKnowledge)
    : "";

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
    brandBlock,
  ].join("\n");
}
