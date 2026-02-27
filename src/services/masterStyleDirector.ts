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

  return `You are a creative director creating a UNIFIED VISUAL DIRECTION for a complete event design kit.

EVENT: "${eventDetails.name}"
Description: ${eventDetails.description || 'N/A'}
Type: ${eventDetails.eventType || 'conference'}
Location: ${eventDetails.location || 'N/A'}

${brandSection}

COLOR PALETTE: ${colorPalette.map(c => `${c.hex} (${c.name})`).join(', ')}
STYLE: ${styleDescription || 'Modern professional'}

Generate a unified visual direction that ensures ALL assets (banners, badges, social posts, signage, merchandise, etc.) look like they belong to the SAME event and brand.

Respond in this exact JSON format:
{
  "visualNarrative": "2-3 sentence visual story that ties all assets together",
  "designPrinciples": ["principle 1", "principle 2", "principle 3", "principle 4"],
  "colorRules": "How to apply colors consistently: primary for X, secondary for Y, accent for Z",
  "typographyGuidance": "Font pairing and usage rules across assets",
  "imageryDirection": "Photography/illustration style, mood, and treatment",
  "layoutPhilosophy": "Spatial relationships, grid system, and composition approach",
  "avoidElements": ["avoid 1", "avoid 2", "avoid 3"]
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
  const primaryHex = colorPalette[0]?.hex || '#667eea';
  const secondaryHex = colorPalette[1]?.hex || '#764ba2';

  return {
    visualNarrative: `A cohesive design system for "${eventDetails.name}" that combines ${brandContext?.archetype || 'modern professional'} aesthetics with a ${brandContext?.moodKeywords?.[0] || 'polished'} feel. Every touchpoint reinforces the event's identity through consistent use of the brand palette, typography, and visual language.`,
    designPrinciples: [
      'Maintain consistent color hierarchy across all assets',
      'Typography must follow the same scale and pairing rules everywhere',
      'Logo placement follows brand guidelines without exception',
      'White space is treated as a design element, not empty space',
    ],
    colorRules: `Primary (${primaryHex}) for headlines and key elements. Secondary (${secondaryHex}) for accents and supporting elements. Maintain consistent application across all assets.`,
    typographyGuidance: `${brandContext?.headingFont || 'Sans-serif'} for headlines, ${brandContext?.bodyFont || 'clean sans-serif'} for body text. Maintain consistent sizing ratios.`,
    imageryDirection: brandContext?.imageryStyle || 'Professional, high-quality imagery with consistent color treatment.',
    layoutPhilosophy: 'Clean, hierarchical layouts that pass the 3-second scan test. Consistent margins and spacing ratios.',
    avoidElements: brandContext?.restrictedElements || ['cluttered layouts', 'inconsistent spacing', 'off-brand colors'],
  };
}

/**
 * Build a prompt injection block from the master style direction
 * that gets prepended to every individual asset generation prompt.
 */
export function buildMasterDirectionPromptBlock(direction: MasterStyleDirection): string {
  return `
=== MASTER VISUAL DIRECTION (applies to ALL assets in this event kit) ===
VISUAL NARRATIVE: ${direction.visualNarrative}

DESIGN PRINCIPLES:
${direction.designPrinciples.map(p => `  • ${p}`).join('\n')}

COLOR APPLICATION: ${direction.colorRules}
TYPOGRAPHY: ${direction.typographyGuidance}
IMAGERY: ${direction.imageryDirection}
LAYOUT: ${direction.layoutPhilosophy}

AVOID:
${direction.avoidElements.map(a => `  ✗ ${a}`).join('\n')}

CRITICAL: This asset must look like it belongs to the SAME event kit as every other asset.
Maintain visual consistency in color treatment, typography, spacing, and overall aesthetic.
=== END MASTER VISUAL DIRECTION ===
`;
}

/**
 * Clear the cached direction (e.g., when starting a new generation)
 */
export function clearMasterDirectionCache(): void {
  cachedDirection = null;
}
