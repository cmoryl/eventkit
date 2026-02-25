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
 * Build logo integration instructions with asset-type-specific placement
 */
export function buildLogoInstructions(hasLogo: boolean, assetType?: string): string {
  if (!hasLogo) return '';

  // Determine placement zone based on asset category
  const placementRules = getLogoPlacementForAsset(assetType);
  
  return `
LOGO INTEGRATION - HIGHEST PRIORITY DIRECTIVE:
Reference Image #1 is the EVENT/BRAND LOGO. You MUST reproduce this logo EXACTLY as provided.

═══════════════════════════════════════════════
  THIS IS NOT A SUGGESTION — IT IS A HARD RULE
═══════════════════════════════════════════════

STEP 1 — EXACT REPRODUCTION (NON-NEGOTIABLE):
- Copy the logo PIXEL-FOR-PIXEL from the reference image into the design
- Do NOT redraw, reinterpret, simplify, or "inspire" a new logo
- Do NOT change any colors, shapes, text, or elements within the logo
- Do NOT add effects like glow, 3D, bevel, emboss, or drop shadow to the logo itself
- The logo must look IDENTICAL to what was uploaded — treat it as a sacred, untouchable element

STEP 2 — PLACEMENT & SIZE:
${placementRules}

STEP 3 — PROTECTION & CONTRAST:
- Surround the logo with adequate CLEAR SPACE (minimum 10% of logo width on all sides)
- If the background is busy, place a subtle solid or semi-transparent panel behind the logo
- Ensure HIGH CONTRAST between logo and background — if logo is light, use dark background area and vice versa
- NEVER place the logo over complex imagery, textures, or patterns that reduce readability
- NEVER crop, clip, or partially hide the logo

STEP 4 — BRAND COHESION:
- Extract the logo's dominant colors and use them throughout the entire design
- Match the logo's visual style (modern/classic/playful/elegant) in all other design elements
- Typography choices should complement the logo's typographic character
- The logo sets the tone — every other element is subordinate to it

CRITICAL FAILURE CONDITIONS (any of these = failed design):
✗ Logo is too small (less than 15% of visual area)
✗ Logo is distorted, stretched, or wrong aspect ratio
✗ Logo is hard to see due to poor contrast or busy background
✗ Logo looks different from the uploaded version (redrawn/reinterpreted)
✗ Logo is hidden in a corner or competing with other elements
✗ Logo colors have been changed or shifted`;
}

/**
 * Get asset-type-specific logo placement rules
 */
function getLogoPlacementForAsset(assetType?: string): string {
  if (!assetType) {
    return `- Place logo in the TOP-CENTER or CENTER of the design
- Logo should occupy 15-25% of the total visual area
- Logo must be the FIRST thing viewers notice`;
  }

  const type = assetType.toUpperCase();

  // Signage & Banners — logo top-center, large
  if (['BANNER', 'ROLLUP_BANNER', 'EVENT_SIGNAGE', 'OUTDOOR_SIGNAGE', 'HANGING_SIGNAGE',
       'DOOR_SIGNAGE', 'ROOM_SIGNAGE', 'LOCATION_SIGNAGE', 'EASEL_SIGNAGE', 'WIFI_SIGN',
       'FEATHER_FLAG', 'TEARDROP_FLAG', 'A_FRAME', 'PORTABLE_BILLBOARD',
       'STAND_UP_PILLAR_BANNER'].includes(type)) {
    return `- Position: TOP-CENTER of the sign/banner, prominently above the event name
- Size: 20-30% of the design area — banners need logos that read from a distance
- The logo is the anchor element — event name and details flow BELOW it
- For tall formats (feather flags, pillars): place logo in upper third`;
  }

  // Stage & Backdrops — logo center or top-center, very large
  if (['STEP_AND_REPEAT', 'BACK_WALL', 'MAIN_STAGE_BACKDROP', 'STAGE_BACKDROP',
       'SPONSOR_WALL', 'REGISTRATION_BACK_WALL', 'REGISTRATION_WALL'].includes(type)) {
    return `- Position: CENTER of the backdrop for step & repeat (tiled), or TOP-CENTER for stage backdrops
- Size: 25-40% of visible area — these are designed to be photographed and seen from afar
- For step & repeat: tile the logo in a clean grid pattern with consistent spacing
- For backdrops: single large logo placement with supporting design elements`;
  }

  // Counters & Structures — logo front-and-center on the counter face
  if (['REGISTRATION_COUNTER', 'WELCOME_COUNTER', 'TECHNOLOGY_COUNTER', 'TECH_COUNTER',
       'KIOSK', 'FEEDBACK_KIOSK'].includes(type)) {
    return `- Position: FRONT-CENTER of the counter/kiosk face panel
- Size: 25-35% of the front panel area
- Logo should be at eye level when attendees approach the counter
- Clean, uncluttered placement with event name below`;
  }

  // Badges & Passes — logo top area, smaller but clear
  if (['NAME_TAG', 'NAME_TAG_BACK', 'VIP_PASS', 'BACKSTAGE_PASS', 'MEDIA_CREDENTIAL',
       'SECURITY_BADGE', 'PARKING_PASS', 'WRISTBAND_DESIGN'].includes(type)) {
    return `- Position: TOP-CENTER of the badge/pass, above the attendee name area
- Size: 15-20% of the badge area — must be clear but leave room for name and details
- Logo anchors the top of the credential, establishing brand identity at first glance
- For wristbands: centered within the narrow band, sized to fill height`;
  }

  // Apparel — centered on garment print area
  if (['TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE', 'HAT', 'VOLUNTEER_VEST'].includes(type)) {
    return `- Position: CENTERED on the print area of the garment
- Size: For front chest — 20-30% of print area; for hat — fill front panel
- Logo should be the dominant graphic element on the garment
- For sleeve prints: scale to fit sleeve width while maintaining readability
- Ensure logo works on the garment color (use reversed version if needed)`;
  }

  // Merchandise — centered, product-appropriate
  if (['SWAG_BAG', 'WATER_BOTTLE', 'LANYARD', 'COASTER_DESIGN', 'NAPKIN_DESIGN',
       'COCKTAIL_NAPKIN', 'GIFT_BOX', 'MATCHBOOK'].includes(type)) {
    return `- Position: CENTERED on the primary face of the product
- Size: 20-35% of the visible product surface
- Logo should be the hero element on the merchandise item
- Scale appropriately for the physical product size (coasters are small, tote bags are large)`;
  }

  // Digital/Social — top or overlay position
  if (['SOCIAL_POST', 'SOCIAL_STORY', 'SOCIAL_PROFILE', 'EMAIL_HEADER',
       'LINKEDIN_BANNER', 'TWITTER_HEADER', 'YOUTUBE_THUMBNAIL',
       'PODCAST_COVER', 'ZOOM_BACKGROUND', 'STREAM_OVERLAY',
       'LIVE_STREAM_OVERLAY', 'SIGNAGE_LOOP', 'COUNTDOWN'].includes(type)) {
    return `- Position: TOP-LEFT or TOP-CENTER — follow social media design conventions
- Size: 12-20% of the design area — present but not overwhelming for digital formats
- Logo should be immediately visible but balanced with the content
- For stories (vertical): place in upper 15% of the frame
- For banners (horizontal): left-aligned or centered in the header zone`;
  }

  // Print materials — top-center or header area
  if (['INVITATION', 'RSVP_CARD', 'TICKET', 'PROGRAM_BOOKLET', 'THANK_YOU_NOTE',
       'ENVELOPE', 'CERTIFICATE', 'MENU', 'BAR_MENU', 'FOLDER',
       'EVALUATION_FORM', 'FLOOR_PLAN', 'SEATING_CHART'].includes(type)) {
    return `- Position: TOP-CENTER as a header element, or centered at the top third
- Size: 15-22% of the design — elegant and prominent without dominating text content
- Logo establishes the brand before the reader engages with content
- For menus/programs: smaller top placement to leave room for text-heavy content`;
  }

  // Table & Dining — centered, elegant
  if (['TABLE_TENT', 'TABLE_NUMBER', 'TABLE_RUNNER', 'TABLECLOTH', 'PLACE_CARD',
       'DIETARY_CARD', 'CATERING_LABEL'].includes(type)) {
    return `- Position: CENTERED on the item, or top-center for tent cards
- Size: 15-25% of the visible area
- Logo placement should be refined and elegant, matching dining aesthetics
- For small items (place cards, dietary cards): subtle but readable logo`;
  }

  // Architectural wraps — prominent, scaled for distance
  if (['GLASS_DOOR', 'GLASS_DOUBLE_DOOR', 'GLASS_ROTATING_DOOR', 'ELEVATOR_WRAP',
       'COLUMN_WRAP', 'CEILING_HANGER', 'WINDOW_CLING', 'FLOOR_DECAL',
       'STAIRS', 'STAIR_GRAPHICS', 'ESCALATOR_GRAPHICS'].includes(type)) {
    return `- Position: CENTERED on the architectural element
- Size: 25-40% of the visible surface — architectural graphics are seen from distance
- Logo must be readable from 10+ feet away
- For floor decals: centered and oriented for foot traffic direction
- For glass: ensure logo contrasts against transparency`;
  }

  // Presentations & Slides
  if (['PRESENTATION_SLIDE', 'WEBINAR_SLIDE'].includes(type)) {
    return `- Position: TOP-LEFT or BOTTOM-RIGHT corner (standard presentation placement)
- Size: 8-12% of the slide area — present but not competing with slide content
- Logo provides consistent brand presence across all slides`;
  }

  // Default fallback
  return `- Place logo in the TOP-CENTER or CENTER of the design
- Logo should occupy 15-25% of the total visual area
- Logo must be the FIRST thing viewers notice`;
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
