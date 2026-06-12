/**
 * Master Style Director
 * Generates a unified visual direction BEFORE batch asset generation,
 * ensuring all assets in an event kit share a cohesive look and feel.
 */

import { supabase } from '@/integrations/supabase/client';
import type { BrandContext } from '@/types/brand.types';
import type { EventDetails, ColorInfo } from '@/types';

export interface MasterStyleDirection {
  /** Unified visual narrative that guides all assets */
  visualNarrative: string;
  /** Key design principles to maintain across assets */
  designPrinciples: string[];
  /** Color application rules specific to this event+brand combo */
  colorRules: string;
  /** Typography pairing guidance */
  typographyGuidance: string;
  /** Imagery/photography direction */
  imageryDirection: string;
  /** Layout philosophy for consistency */
  layoutPhilosophy: string;
  /** Elements to avoid across all assets */
  avoidElements: string[];
}

// Session cache for the master direction
let cachedDirection: { key: string; direction: MasterStyleDirection } | null = null;

/**
 * Generate a master style direction that unifies all event kit assets.
 * This is called ONCE before batch generation and injected into every asset prompt.
 */
export async function generateMasterStyleDirection(args: {
  eventDetails: EventDetails;
  brandContext: BrandContext | null;
  colorPalette: ColorInfo[];
  styleDescription?: string;
  hasVibeImage?: boolean;
  hasVenueImage?: boolean;
}): Promise<MasterStyleDirection | null> {
  const { eventDetails, brandContext, colorPalette, styleDescription } = args;

  // Build cache key
  const cacheKey = [
    eventDetails.name,
    brandContext?.brandName || '',
    colorPalette.map(c => c.hex).join(','),
    styleDescription || '',
  ].join('|');

  if (cachedDirection?.key === cacheKey) {
    console.log('Using cached master style direction');
    return cachedDirection.direction;
  }

  try {
    console.log('Generating master style direction for visual consistency...');

    const prompt = buildMasterDirectionPrompt(args);

    const { data, error } = await supabase.functions.invoke('suggest-creative', {
      body: {
        type: 'master_style_direction',
        prompt,
        eventName: eventDetails.name,
        eventDescription: eventDetails.description,
      },
    });

    if (error) {
      console.warn('Master style direction generation failed:', error);
      return buildFallbackDirection(args);
    }

    const result = data?.result || data?.suggestion;
    if (typeof result === 'string') {
      const direction = parseMasterDirection(result, args);
      cachedDirection = { key: cacheKey, direction };
      console.log('Master style direction generated successfully');
      return direction;
    }

    return buildFallbackDirection(args);
  } catch (e) {
    console.warn('Master style direction error:', e);
    return buildFallbackDirection(args);
  }
}

function buildMasterDirectionPrompt(args: {
  eventDetails: EventDetails;
  brandContext: BrandContext | null;
  colorPalette: ColorInfo[];
  styleDescription?: string;
  hasVibeImage?: boolean;
  hasVenueImage?: boolean;
}): string {
  const { eventDetails, brandContext, colorPalette, styleDescription } = args;

  const brandSection = brandContext
    ? `
BRAND: "${brandContext.brandName}"
- Archetype: ${brandContext.archetype || 'N/A'}
- Voice: ${brandContext.brandVoice?.join(', ') || 'N/A'}
- Imagery style: ${brandContext.imageryStyle || 'N/A'}
- Pattern style: ${brandContext.patternStyle || 'N/A'}
- Mood: ${brandContext.moodKeywords?.join(', ') || 'N/A'}
- Photography DOs: ${brandContext.photographyDos?.slice(0, 3).join('; ') || 'N/A'}
- Photography DON'Ts: ${brandContext.photographyDonts?.slice(0, 3).join('; ') || 'N/A'}
- Restricted elements: ${brandContext.restrictedElements?.join(', ') || 'N/A'}`
    : 'No brand context provided.';

  return `You are a senior creative director building a LOCKED MULTI-ASSET DESIGN SYSTEM for a complete event/campaign kit.

EVENT: "${eventDetails.name}"
Description: ${eventDetails.description || 'N/A'}
Type: ${eventDetails.eventType || 'conference'}
Location: ${eventDetails.location || 'N/A'}

${brandSection}

COLOR PALETTE: ${colorPalette.map(c => `${c.hex} (${c.name})`).join(', ')}
STYLE: ${styleDescription || 'Modern professional'}

The design system must create consistent outputs across many asset types: hero banners, social posts, stories, signage, room signs, name tags, lanyards, shirts, bags, presentation slides, counters, kiosks, QR/WiFi signs, and environmental graphics.

Do NOT create one-off designs. Create one repeatable brand system that can be scaled and cropped across formats.

Define:
1. one visual narrative
2. one recurring visual motif
3. one color hierarchy
4. one typography hierarchy
5. one logo placement system
6. one background/pattern system
7. one spacing/grid system
8. asset-family translation rules for hero, social, signage, badges, merch, decks, utility, and environmental formats

Respond in this exact JSON format:
{
  "visualNarrative": "2-3 sentence visual story that ties all assets together, including the recurring motif/background logic",
  "designPrinciples": ["principle 1", "principle 2", "principle 3", "principle 4", "principle 5"],
  "colorRules": "How to apply colors consistently: primary for X, secondary for Y, accent for Z, neutral for readable zones. Include what must never change.",
  "typographyGuidance": "Font pairing, casing, hierarchy, and scale rules across all asset sizes.",
  "imageryDirection": "Photography/illustration style, treatment, crop behavior, and how it adapts across asset families.",
  "layoutPhilosophy": "Grid, spacing, safe zones, logo zones, CTA zones, and repeatable family layouts.",
  "avoidElements": ["avoid 1", "avoid 2", "avoid 3", "avoid 4", "avoid 5"]
}`;
}

function parseMasterDirection(
  rawResult: string,
  args: { eventDetails: EventDetails; brandContext: BrandContext | null; colorPalette: ColorInfo[] }
): MasterStyleDirection {
  try {
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        visualNarrative: parsed.visualNarrative || '',
        designPrinciples: parsed.designPrinciples || [],
        colorRules: parsed.colorRules || '',
        typographyGuidance: parsed.typographyGuidance || '',
        imageryDirection: parsed.imageryDirection || '',
        layoutPhilosophy: parsed.layoutPhilosophy || '',
        avoidElements: parsed.avoidElements || [],
      };
    }
  } catch {
    // Fall through to fallback
  }

  return buildFallbackDirection(args);
}

function buildFallbackDirection(args: {
  eventDetails: EventDetails;
  brandContext: BrandContext | null;
  colorPalette: ColorInfo[];
}): MasterStyleDirection {
  const { eventDetails, brandContext, colorPalette } = args;
  const primaryHex = colorPalette[0]?.hex || brandContext?.primaryColor || '#667eea';
  const secondaryHex = colorPalette[1]?.hex || brandContext?.secondaryColor || '#764ba2';
  const accentHex = colorPalette[2]?.hex || brandContext?.accentColor || secondaryHex;

  return {
    visualNarrative: `A cohesive design system for "${eventDetails.name}" that combines ${brandContext?.archetype || 'modern professional'} aesthetics with a ${brandContext?.moodKeywords?.[0] || 'polished'} feel. Every touchpoint uses the same visual signature, scaled from hero formats down to badges, merchandise, social, and utility signs.`,
    designPrinciples: [
      'All assets must feel like crops or extensions of one master design system',
      'Maintain the same color hierarchy across every asset family',
      'Typography must use one consistent scale, casing logic, and pairing system',
      'Logo placement follows brand guidelines without exception',
      'Each format may simplify the system, but must not introduce a new art direction',
    ],
    colorRules: `Primary (${primaryHex}) anchors headlines and major brand zones. Secondary (${secondaryHex}) supports panels, section breaks, and large fields. Accent (${accentHex}) is reserved for CTAs, wayfinding cues, chips, highlights, and small repeated details. Do not introduce new dominant colors per asset.`,
    typographyGuidance: `${brandContext?.headingFont || 'Sans-serif'} for headlines, ${brandContext?.bodyFont || 'clean sans-serif'} for body text. Maintain consistent sizing ratios, casing, weight contrast, and line-height across all formats.`,
    imageryDirection: brandContext?.imageryStyle || 'Professional, high-quality imagery with consistent color treatment, crop behavior, and background treatment across every asset family.',
    layoutPhilosophy: 'Use a repeatable grid: consistent safe margins, logo zones, title zones, footer/header bands, CTA chips, and the same motif/background language. Scale and crop the system instead of redesigning each asset.',
    avoidElements: brandContext?.restrictedElements || ['cluttered layouts', 'inconsistent spacing', 'off-brand colors', 'changing typography systems', 'new motifs per asset'],
  };
}

/**
 * Build a prompt injection block from the master style direction
 * that gets prepended to every individual asset generation prompt.
 */
export function buildMasterDirectionPromptBlock(direction: MasterStyleDirection): string {
  return `
=== MASTER MULTI-ASSET VISUAL SYSTEM (applies to EVERY asset in this kit) ===
VISUAL NARRATIVE:
${direction.visualNarrative}

DESIGN PRINCIPLES:
${direction.designPrinciples.map(p => `  • ${p}`).join('\n')}

COLOR APPLICATION:
${direction.colorRules}

TYPOGRAPHY SYSTEM:
${direction.typographyGuidance}

IMAGERY / ILLUSTRATION SYSTEM:
${direction.imageryDirection}

LAYOUT / GRID SYSTEM:
${direction.layoutPhilosophy}

ASSET FAMILY TRANSLATION RULES:
  • HERO / BANNERS / EMAIL HEADERS: use the fullest expression of the design system; large headline, clear logo zone, strongest background/motif.
  • SOCIAL POSTS / STORIES: crop and simplify the hero system; same colors, type treatment, CTA chip, and motif behavior.
  • SIGNAGE / WAYFINDING: prioritize scan speed; keep the same header/footer bands, icon badge style, directional arrows, and high-contrast panels.
  • BADGES / LANYARDS / NAME TAGS: use a simplified version of the motif with consistent name field, role field, accent stripe, and logo placement.
  • MERCHANDISE: distill the system into an iconic mark; fewer colors, print-safe motif, no tiny poster-like details.
  • DECKS / PRESENTATIONS: use the same title bar, section marker, content card, footer/page number system, and spacing rhythm.
  • UTILITY SIGNS / QR / WIFI: protect functional readability; use simple panels, large info zones, and minimal motif treatment.
  • ENVIRONMENTAL / COUNTERS / KIOSKS: scale up the hero system; preserve safe areas, viewing distance, logo visibility, and repeated spatial motifs.

REUSABLE DESIGN DNA TO KEEP CONSTANT:
  • same primary/secondary/accent hierarchy
  • same typography/casing/weight system
  • same logo zone and clear-space behavior
  • same background treatment and motif family
  • same corner/shape/icon language
  • same spacing rhythm and hierarchy logic

AVOID:
${direction.avoidElements.map(a => `  ✗ ${a}`).join('\n')}
  ✗ one-off designs that do not match the rest of the kit
  ✗ switching art styles between asset types
  ✗ changing dominant colors per asset
  ✗ changing fonts, corner styles, shadows, or motif systems per asset

CRITICAL:
This asset must look like one member of a coordinated brand design system, not a standalone design. Adapt the system to the asset type, but do not invent a new design language.
=== END MASTER MULTI-ASSET VISUAL SYSTEM ===
`;
}

/**
 * Clear the cached direction (e.g., when starting a new generation)
 */
export function clearMasterDirectionCache(): void {
  cachedDirection = null;
}
