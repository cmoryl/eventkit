// Prompt building utilities for AI generation
import type { BrandContext, ImageAnalysis, VenueIntelligence, PromptTemplate } from "./types.ts";
import { getLocationCulturalContext } from "./location-context.ts";
import { getBasePrompt, isPrintAsset } from "./asset-prompts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Build brand context string from brand data
 */
export function buildBrandContext(brandContext: BrandContext | undefined): string {
  if (!brandContext) return '';
  
  const brandParts: string[] = [];
  
  // Brand identity
  if (brandContext.brandName) {
    brandParts.push(`This design is for the brand "${brandContext.brandName}".`);
  }
  if (brandContext.archetype) {
    brandParts.push(`Brand archetype: ${brandContext.archetype}.`);
  }
  if (brandContext.tagline) {
    brandParts.push(`Brand tagline for design inspiration: "${brandContext.tagline}".`);
  }
  
  // Visual mood and style
  if (brandContext.moodKeywords && brandContext.moodKeywords.length > 0) {
    brandParts.push(`Visual mood: ${brandContext.moodKeywords.join(', ')}.`);
  }
  if (brandContext.imageryStyle) {
    brandParts.push(`Imagery style: ${brandContext.imageryStyle}.`);
  }
  if (brandContext.patternStyle) {
    brandParts.push(`Pattern style to incorporate: ${brandContext.patternStyle}.`);
  }
  if (brandContext.iconStyle) {
    brandParts.push(`Icon style: ${brandContext.iconStyle}.`);
  }
  
  // Typography
  if (brandContext.headingFont || brandContext.bodyFont) {
    const fonts = [brandContext.headingFont, brandContext.bodyFont].filter(Boolean);
    brandParts.push(`Typography: Use ${fonts.join(' for headings and ')} font styles. Ensure typography feels consistent with the brand.`);
  }
  
  // Industry and audience
  if (brandContext.industry) {
    brandParts.push(`Industry context: ${brandContext.industry}.`);
  }
  if (brandContext.targetAudience) {
    brandParts.push(`Target audience: ${brandContext.targetAudience}. Design should resonate with this demographic.`);
  }
  
  // Brand voice and tone
  if (brandContext.brandVoice && brandContext.brandVoice.length > 0) {
    brandParts.push(`Brand voice: ${brandContext.brandVoice.join(', ')}. Visual design should embody these qualities.`);
  }
  if (brandContext.toneKeywords && brandContext.toneKeywords.length > 0) {
    brandParts.push(`Tone: ${brandContext.toneKeywords.join(', ')}.`);
  }
  
  // Cultural context from brand
  if (brandContext.culturalContext) {
    brandParts.push(`Brand cultural context: ${brandContext.culturalContext}.`);
  }
  
  // Print color mode
  if (brandContext.printColorMode) {
    brandParts.push(`Preferred color mode: ${brandContext.printColorMode}. Ensure colors are appropriate for this output.`);
  }
  
  // Approved color combinations
  if (brandContext.approvedColorCombinations && brandContext.approvedColorCombinations.length > 0) {
    const approved = brandContext.approvedColorCombinations
      .filter(c => c.status === 'approved')
      .map(c => c.colors.join(' + '))
      .slice(0, 3);
    if (approved.length > 0) {
      brandParts.push(`Approved color combinations: ${approved.join('; ')}.`);
    }
  }
  
  // Gradients
  if (brandContext.gradients && brandContext.gradients.length > 0) {
    const gradientDesc = brandContext.gradients
      .slice(0, 2)
      .map(g => `${g.name}: ${g.colors.join(' to ')}`)
      .join('; ');
    brandParts.push(`Brand gradients available: ${gradientDesc}.`);
  }
  
  if (brandParts.length > 0) {
    return `
BRAND INTELLIGENCE - CRITICAL DESIGN CONTEXT:
${brandParts.join('\n')}
Ensure the design is unmistakably on-brand while remaining fresh and contextually appropriate.`;
  }
  
  return '';
}

/**
 * Build location context string
 */
export function buildLocationContext(location: string | undefined, incorporateLocationStyle: boolean | undefined): string {
  if (!location || !incorporateLocationStyle) return '';
  
  const culturalVibes = getLocationCulturalContext(location);
  if (culturalVibes) {
    return `
LOCATION CULTURAL CONTEXT - IMPORTANT:
This event is in ${location}. Incorporate local cultural aesthetics:
${culturalVibes}
Subtly weave these local influences into the design while maintaining brand consistency.`;
  }
  
  return `This event is located in ${location}. Consider any local cultural elements that would resonate with attendees.`;
}

/**
 * Build venue intelligence context string
 */
export function buildVenueContext(venueIntelligence: VenueIntelligence | undefined): string {
  if (!venueIntelligence) return '';
  
  let context = '';
  const hasCulturalData = venueIntelligence.culturalContext || venueIntelligence.description;
  
  if (hasCulturalData) {
    context = `
VENUE INTELLIGENCE - AI-RESEARCHED DESIGN CONTEXT:
This design is for "${venueIntelligence.name}".
${venueIntelligence.venueType ? `Venue Type: ${venueIntelligence.venueType}` : ''}
${venueIntelligence.city ? `City: ${venueIntelligence.city}` : ''}

${venueIntelligence.culturalContext ? `CULTURAL & DESIGN CONTEXT:
${venueIntelligence.culturalContext}
Incorporate these culturally appropriate design elements and respect the venue's heritage.` : ''}

${venueIntelligence.description ? `VENUE DESCRIPTION:
${venueIntelligence.description}
Design should complement this venue's character and atmosphere.` : ''}

${venueIntelligence.bestFor?.length ? `VENUE BEST SUITED FOR: ${venueIntelligence.bestFor.join(', ')}
Consider these typical use cases when designing.` : ''}

The design should feel like it BELONGS in this specific venue - as if it was custom-designed for this exact space.`;
  }
  
  // Add venue-specific practical context
  if (venueIntelligence.venueType || venueIntelligence.capacity) {
    context += `
VENUE ATMOSPHERE:
${venueIntelligence.venueType ? `This is a ${venueIntelligence.venueType}` : 'This venue'}${venueIntelligence.capacity ? ` with capacity for ${venueIntelligence.capacity}` : ''}.
${venueIntelligence.priceRange ? `Price range: ${venueIntelligence.priceRange}.` : ''}
Design should match the expected sophistication and energy level of this type of venue.`;
  }

  // Add local tips
  if (venueIntelligence.localTips) {
    context += `
LOCAL DESIGN TIPS:
${venueIntelligence.localTips}`;
  }
  
  return context;
}

/**
 * Build logo integration instructions
 */
export function buildLogoInstructions(hasLogo: boolean): string {
  if (!hasLogo) return '';
  
  return `
LOGO INTEGRATION - ABSOLUTELY CRITICAL (HIGHEST PRIORITY):
Reference Image #1 is the EVENT LOGO. This is the PRIMARY brand element and MUST be treated with utmost importance.

MANDATORY LOGO PLACEMENT REQUIREMENTS:
1. VISIBILITY: The logo MUST be clearly visible and immediately recognizable in the final design
2. SIZE: The logo should occupy at least 15-25% of the visual hierarchy - it should NEVER be tiny or hidden
3. POSITIONING: Place the logo in a prominent position:
   - For signage/banners: Center or top-center placement preferred
   - For merchandise: Front and center, appropriately sized for the item
   - For digital assets: Above the fold, clearly visible
4. INTEGRITY: The logo MUST remain:
   - Undistorted (maintain original aspect ratio)
   - Unobscured (no elements overlapping or competing)
   - Sharp and crisp (not blurred or pixelated)
   - Properly contrasted against background (ensure readability)
5. PROTECTION: Leave adequate clear space around the logo - no text or design elements crowding it

BRAND COHESION REQUIREMENTS:
6. Extract the logo's color palette and use it as the FOUNDATION for all design choices
7. Match the logo's visual style (modern, vintage, minimal, bold, etc.) throughout the design
8. Typography should complement (not compete with) the logo's typographic style
9. All design elements should feel like natural extensions of the logo's brand identity
10. The logo is the HERO - everything else supports it

FAILURE CRITERIA - DO NOT:
- Make the logo too small or insignificant
- Place the logo in corners where it can be overlooked
- Use colors that clash with or diminish the logo
- Apply effects that distort the logo (extreme shadows, warping)
- Let busy backgrounds make the logo hard to see`;
}

/**
 * Build image analysis instructions
 */
export function buildAnalysisInstructions(imageAnalysis: ImageAnalysis | undefined): string {
  if (!imageAnalysis || imageAnalysis.analysisConfidence <= 0.5) return '';
  
  return `
IMAGE ANALYSIS - DESIGN INTELLIGENCE FROM REFERENCE:
The reference image has been analyzed in detail. Apply these findings:

DESIGN STYLE: ${imageAnalysis.designStyle}
ERA/PERIOD: ${imageAnalysis.era}
MOOD: ${imageAnalysis.mood} | ATMOSPHERE: ${imageAnalysis.atmosphere}
EMOTIONAL TONE: ${imageAnalysis.emotionalTone}

VISUAL CHARACTERISTICS:
- Aesthetic Keywords: ${imageAnalysis.aestheticKeywords?.join(', ') || 'modern, professional'}
- Shapes: ${imageAnalysis.shapes || 'mixed'}
- Patterns: ${imageAnalysis.patterns?.join(', ') || 'none'}
- Textures: ${imageAnalysis.textures?.join(', ') || 'smooth'}

TYPOGRAPHY GUIDANCE:
- Style: ${imageAnalysis.typographyStyle || 'sans-serif modern'}
- Mood: ${imageAnalysis.typographyMood || 'clean'}

COMPOSITION:
- Layout: ${imageAnalysis.composition || 'balanced'}
- Whitespace: ${imageAnalysis.whitespace || 'balanced'}
- Visual Weight: ${imageAnalysis.visualWeight || 'balanced'}

GENERATION GUIDANCE - APPLY THESE:
${imageAnalysis.promptEnhancements?.map(p => `- ${p}`).join('\n') || '- Professional, cohesive design'}

AVOID THESE ELEMENTS:
${imageAnalysis.avoidElements?.map(a => `- DO NOT use: ${a}`).join('\n') || '- Avoid cluttered layouts'}`;
}

/**
 * Build print requirements instructions
 */
export function buildPrintRequirements(isPrint: boolean, targetDPI: number): string {
  if (!isPrint) return '';
  
  return `
PRINT PRODUCTION REQUIREMENTS - CRITICAL:
This asset is destined for professional print production. You MUST ensure:

COLOR & FIDELITY:
- Use CMYK-safe colors only - avoid neon/fluorescent colors that won't print accurately
- Prefer rich, saturated colors that reproduce well in print
- No RGB-only colors like pure blue (#0000FF) - these shift dramatically in print
- Use appropriate contrast for print reproduction (screens appear brighter than print)

RESOLUTION & CLARITY:
- Generate at maximum possible resolution (${targetDPI}+ DPI equivalent quality)
- All text must be crisp, sharp, and anti-aliased for clean print edges
- Fine details must be clear enough to survive print production
- Avoid compression artifacts or noise - clean, professional output

LAYOUT FOR PRINT:
- Keep critical content (text, logos) away from edges (safe zone)
- Extend backgrounds fully to edges for bleed area trimming
- Text should be large enough to read at print size
- High contrast between text and backgrounds

PROFESSIONAL PRINT AESTHETIC:
- Think like a print production designer
- Textures and gradients should be smooth, not banded
- Solid colors should be perfectly solid
- This will be produced by professional print vendors`;
}

/**
 * Fetch prompt template from database
 */
export async function fetchPromptTemplate(assetType: string): Promise<PromptTemplate | null> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not available for template fetch');
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('asset_type', assetType)
      .order('success_rate', { ascending: false, nullsFirst: false })
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(1);
    
    if (error) {
      console.warn('Error fetching prompt template:', error.message);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log(`Found prompt template for ${assetType}: "${data[0].template_name}"`);
      return data[0] as PromptTemplate;
    }
    
    return null;
  } catch (e) {
    console.warn('Failed to fetch prompt template:', e);
    return null;
  }
}

/**
 * Merge template with event variables
 */
export function mergeTemplateWithVariables(
  template: string,
  variables: Record<string, string>
): string {
  let merged = template;
  
  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    merged = merged.replace(pattern, value || '');
  }
  
  // Clean up any remaining unreplaced variables
  merged = merged.replace(/\{\{[^}]+\}\}/g, '');
  
  // Clean up extra whitespace
  merged = merged.replace(/\s+/g, ' ').trim();
  
  return merged;
}

/**
 * Increment usage count for a template (fire and forget)
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) return;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data } = await supabase
      .from('prompt_templates')
      .select('usage_count')
      .eq('id', templateId)
      .single();
    
    if (data) {
      await supabase
        .from('prompt_templates')
        .update({ 
          usage_count: (data.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);
    }
  } catch (e) {
    // Silent fail - usage tracking is not critical
  }
}
