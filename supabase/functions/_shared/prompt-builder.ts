// Prompt building utilities for AI generation
import type { BrandContext, ImageAnalysis, VenueIntelligence, PromptTemplate } from "./types.ts";
import { getLocationCulturalContext } from "./location-context.ts";
import { getBasePrompt, isPrintAsset } from "./asset-prompts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export interface LogoAnalysis {
  shape: string;
  textContent: string;
  colors: string[];
  style: string;
  distinctiveFeatures: string[];
  aspectRatio: string;
  iconDescription?: string;
  fontStyle?: string;
}

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
  if (brandContext.mission) {
    brandParts.push(`Brand mission: ${brandContext.mission}.`);
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
  if (brandContext.writingStyle) {
    brandParts.push(`Writing style: ${brandContext.writingStyle}.`);
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
      .filter((c: { status: string }) => c.status === 'approved')
      .map((c: { colors: string[] }) => c.colors.join(' + '))
      .slice(0, 3);
    if (approved.length > 0) {
      brandParts.push(`Approved color combinations: ${approved.join('; ')}.`);
    }
  }
  
  // Gradients
  if (brandContext.gradients && brandContext.gradients.length > 0) {
    const gradientDesc = brandContext.gradients
      .slice(0, 2)
      .map((g: { name: string; colors: string[] }) => `${g.name}: ${g.colors.join(' to ')}`)
      .join('; ');
    brandParts.push(`Brand gradients available: ${gradientDesc}.`);
  }
  
  if (brandParts.length === 0) return '';

  // Build the main brand context
  let result = `
BRAND INTELLIGENCE - CRITICAL DESIGN CONTEXT:
${brandParts.join('\n')}
Ensure the design is unmistakably on-brand while remaining fresh and contextually appropriate.`;

  // === BRAND INTELLIGENCE BLOCK (photography, logo, voice, constraints) ===
  // This mirrors the compileGenerationPrompt brand intelligence from the frontend
  const intelligenceBlocks: string[] = [];

  // Photography rules
  const photoDos = brandContext.photographyDos as string[] | undefined;
  const photoDonts = brandContext.photographyDonts as string[] | undefined;
  const photoStyle = brandContext.photographyStyle as string | undefined;
  if (photoStyle || photoDos?.length || photoDonts?.length) {
    const lines = ["BRAND PHOTOGRAPHY RULES:"];
    if (photoStyle) lines.push(`  Style: ${photoStyle}`);
    if (photoDos?.length) {
      lines.push("  DO:");
      photoDos.slice(0, 6).forEach((d: string) => lines.push(`    ✓ ${d}`));
    }
    if (photoDonts?.length) {
      lines.push("  DO NOT:");
      photoDonts.slice(0, 6).forEach((d: string) => lines.push(`    ✗ ${d}`));
    }
    intelligenceBlocks.push(lines.join("\n"));
  }

  // Logo usage rules
  const logoRules = brandContext.logoPlacementRules as string[] | undefined;
  const logoClearSpace = brandContext.logoClearSpace as string | undefined;
  const logoMinSize = brandContext.logoMinSize as string | undefined;
  const logoBgs = brandContext.logoBackgrounds as string[] | undefined;
  if (logoRules?.length || logoClearSpace || logoMinSize) {
    const lines = ["BRAND LOGO USAGE RULES:"];
    if (logoClearSpace) lines.push(`  Clear space: ${logoClearSpace}`);
    if (logoMinSize) lines.push(`  Minimum size: ${logoMinSize}`);
    if (logoBgs?.length) lines.push(`  Approved backgrounds: ${logoBgs.join(", ")}`);
    if (logoRules?.length) {
      logoRules.slice(0, 5).forEach((r: string) => lines.push(`  • ${r}`));
    }
    intelligenceBlocks.push(lines.join("\n"));
  }

  // Constraints / restrictions
  const restricted = brandContext.restrictedElements as string[] | undefined;
  const approvedLayouts = brandContext.approvedLayouts as string[] | undefined;
  if (restricted?.length || approvedLayouts?.length) {
    const lines = ["BRAND CONSTRAINTS:"];
    if (restricted?.length) {
      lines.push("  NEVER:");
      restricted.slice(0, 5).forEach((r: string) => lines.push(`    ✗ ${r}`));
    }
    if (approvedLayouts?.length) {
      lines.push("  APPROVED LAYOUTS:");
      approvedLayouts.slice(0, 4).forEach((l: string) => lines.push(`    ✓ ${l}`));
    }
    intelligenceBlocks.push(lines.join("\n"));
  }

  if (intelligenceBlocks.length > 0) {
    result += `\n\n=== BRAND INTELLIGENCE ===\n${intelligenceBlocks.join("\n\n")}\n=== END BRAND INTELLIGENCE ===`;
  }
  
  return result;
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
 * Build the Global Master Prompt Wrapper — prefixed to EVERY prompt
 */
export function buildMasterWrapper(): string {
  return `[MASTER_WRAPPER]
ROLE: You are a production design system that outputs print-ready, brand-consistent layouts.
OUTPUT TARGET: A single design concept described precisely (layout, hierarchy, styles, spacing).

HARD REQUIREMENTS:
- Brand fidelity: use provided brand colors/typography; if missing, choose safe defaults
- Legibility + hierarchy: pass a "3-second scan test" — the viewer must instantly understand the main message
- No invented trademarks, fake sponsors, or placeholder text that looks like real branding
- Accessibility: maintain readable contrast (WCAG AA minimum) and avoid tiny type for intended viewing distance
- All text must be spelled correctly and grammatically accurate

[TEXT_RENDERING_MODULE] — PERFECT TYPOGRAPHY DIRECTIVE
This module governs ALL text rendered in the design. Text quality is a PASS/FAIL gate.

SPELLING & ACCURACY (NON-NEGOTIABLE):
- Before rendering ANY word, spell it out letter-by-letter internally and verify correctness
- Event name "${'{eventName}'}" must be spelled EXACTLY as provided — count every character
- Do NOT invent, abbreviate, or paraphrase any provided text (dates, taglines, names)
- If a word has unusual spelling, reproduce it exactly as given — do not "correct" it
- Numbers and dates must match exactly what was provided

TYPOGRAPHIC RENDERING RULES:
- Render all text as vector-sharp glyphs — no blur, no anti-aliasing artifacts, no pixelation
- Each character must have clean, precise edges as if typeset professionally
- Letter-spacing (tracking) must be uniform and intentional — no irregular gaps
- Word-spacing must be consistent throughout each text block
- Line-height must create comfortable reading rhythm (1.2-1.5x for body, 1.0-1.2x for headlines)
- Baseline alignment must be pixel-perfect across all text in the same line

FONT SELECTION HIERARCHY:
- If brand fonts are specified, match their visual character precisely
- Headlines: use bold/heavy weights with high contrast against backgrounds
- Body text: use regular/medium weights with generous x-height for readability
- NEVER mix more than 2-3 font families in one design
- Maintain consistent font usage across the entire design (don't switch styles randomly)

TEXT CONTRAST & READABILITY:
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text (WCAG AA)
- If text overlays an image or pattern, add a backing treatment:
  • Semi-transparent overlay panel behind text
  • Text shadow/outline for guaranteed readability
  • Solid color band behind text blocks
- NEVER place small text on busy, textured, or gradient backgrounds without contrast protection
- White text on dark: ensure pure white (#FFFFFF) or near-white
- Dark text on light: ensure pure black (#000000) or near-black

TEXT LAYOUT PRECISION:
- Headings: centered or left-aligned, never justified
- All text blocks must have adequate margins from design edges (minimum 5% padding)
- Text must NEVER touch or overlap other elements, borders, or edges
- Maintain clear visual hierarchy: headline > subheadline > body > caption
- Text should be placed in "quiet zones" of the design — areas with minimal visual noise

FAILURE CONDITIONS FOR TEXT:
✗ Any misspelled word (including the event name)
✗ Text that is blurry, pixelated, or has inconsistent edges
✗ Text that is unreadable due to poor contrast
✗ Characters that are malformed, merged, or partially rendered
✗ Inconsistent spacing between letters or words
✗ Text placed over busy backgrounds without contrast protection

DELIVERABLE FORMAT (ensure every design addresses):
1. Layout Map — zones, sizes, spatial relationships
2. Typography Rules — type styles, sizes, weights, line heights
3. Color Rules — palette application, primary/secondary/accent usage
4. Logo Placement — per the LOGO MODULE rules below
5. Copy Blocks — exact text placement and hierarchy
6. Print/Export Specs — DPI, bleed, safe area, color mode`;
}

/**
 * Build logo integration instructions with asset-type-specific placement
 * Implements [LOGO_MODULE_EXACT] from the Interactive Prompt Bible
 */
export function buildLogoInstructions(hasLogo: boolean, assetType?: string, logoAnalysis?: LogoAnalysis): string {
  if (!hasLogo) return '';

  // Determine placement zone based on asset category
  const placementRules = getLogoPlacementForAsset(assetType);

  // Build logo anatomy description from pre-analysis
  const anatomyBlock = logoAnalysis ? `
LOGO ANATOMY — USE THIS AS YOUR REPRODUCTION BLUEPRINT:
- Shape/Structure: ${logoAnalysis.shape}
- Text in logo: ${logoAnalysis.textContent || 'none detected'}
- Dominant colors: ${logoAnalysis.colors.join(', ')}
- Style classification: ${logoAnalysis.style}
- Key distinctive features: ${logoAnalysis.distinctiveFeatures.join('; ')}
- Aspect ratio: ${logoAnalysis.aspectRatio}
${logoAnalysis.iconDescription ? `- Icon/Symbol: ${logoAnalysis.iconDescription}` : ''}
${logoAnalysis.fontStyle ? `- Font style: ${logoAnalysis.fontStyle}` : ''}
Cross-check your output against EVERY detail above. If any detail differs, you have failed.
` : '';

  return `
[LOGO_MODULE_EXACT] — HIGHEST PRIORITY DIRECTIVE
Reference Image #1 is the EVENT/BRAND LOGO. You MUST reproduce this logo EXACTLY as provided.

═══════════════════════════════════════════════
  THIS IS NOT A SUGGESTION — IT IS A HARD RULE
═══════════════════════════════════════════════
${anatomyBlock}
STEP 1 — EXACT REPRODUCTION MANDATE (NON-NEGOTIABLE):
- "Use the uploaded logo as-is. Do not redraw, restyle, reinterpret, or 'inspire' from it."
- Copy the logo PIXEL-FOR-PIXEL from the reference image into the design
- Preserve EVERY letter, curve, icon, and color exactly as shown
- Count the letters in any logo text and verify your output has the SAME number of letters in the SAME order
- If the logo has an icon/symbol, reproduce its EXACT geometry — do not simplify or abstract it
- Do NOT change any colors, shapes, text, or elements within the logo
- Do NOT add effects like glow, 3D, bevel, emboss, or drop shadow to the logo itself
- Do NOT merge, blend, or artistically reinterpret any part of the logo
- The logo must look IDENTICAL to what was uploaded — treat it as a sacred, untouchable element

STEP 1b — DETAIL VERIFICATION CHECKLIST:
Before finalizing, verify EACH of these against the reference image:
  ☐ Every letter/character in logo text matches exactly (spelling, case, spacing)
  ☐ Icon/symbol shape is geometrically identical (count points, curves, angles)
  ☐ Color values match the reference (no hue shifts, no saturation changes)
  ☐ Proportions between text and icon elements are preserved
  ☐ Line weights and stroke thicknesses are consistent with original
  ☐ Negative space within the logo is preserved (holes in letters, gaps in icons)

STEP 2 — ASSET-SPECIFIC PLACEMENT & SIZING:
${placementRules}

STEP 3 — CLEAR SPACE & CONTRAST PROTECTION:
- Keep minimum padding around the logo equal to 10% of the logo's bounding box height (or more if layout is busy)
- If the background is busy or low-contrast, add a simple backing treatment:
  • Solid panel (preferred) OR subtle blur plate OR translucent pill behind the logo
  • No heavy effects — backing must be invisible at a glance
- Ensure HIGH CONTRAST between logo and background — if logo is light, use dark background area and vice versa
- NEVER place the logo over complex imagery, textures, or patterns that reduce readability
- NEVER crop, clip, or partially hide the logo

STEP 4 — BRAND COHESION:
- Extract the logo's dominant colors and use them throughout the entire design
- Match the logo's visual style (modern/classic/playful/elegant) in all other design elements
- Typography choices should complement the logo's typographic character
- The logo sets the tone — every other element is subordinate to it

FAILURE CONDITIONS — A result is FAILED if ANY occur:
✗ Logo is missing from the design entirely
✗ Logo is distorted, warped, rotated arbitrarily, re-colored incorrectly, "AI-styled," or replaced by text
✗ Logo text is misspelled, has wrong letters, or wrong letter count
✗ Logo icon/symbol shape differs from original (simplified, abstracted, or redrawn)
✗ Logo is cropped unintentionally
✗ Logo is too small to read for the asset's intended viewing distance
✗ Logo blends into the background (no contrast protection used when needed)
✗ Logo is hard to see due to poor contrast or busy background
✗ Logo looks different from the uploaded version (redrawn/reinterpreted)
✗ Logo colors have been changed or shifted
✗ Logo proportions have been altered (stretched, squished)`;
}

/**
 * Build the output checklist that validates every generated design
 */
export function buildOutputChecklist(isPrint: boolean, hasLogo: boolean): string {
  return `
OUTPUT CHECKLIST — VERIFY BEFORE FINALIZING:
${isPrint ? '☐ Bleed area: backgrounds extend fully to edges for trim' : '☐ Digital dimensions correct for platform'}
${isPrint ? '☐ Safe zone: all critical content (text, logos) inside safe area' : '☐ Content centered and properly padded'}
☐ Hierarchy check: main message passes 3-second scan test
${hasLogo ? '☐ Logo check: PASS (exact reproduction, correct placement, proper sizing, adequate contrast)' : '☐ N/A — no logo provided'}
☐ Contrast check: all text readable against backgrounds (WCAG AA)
☐ Color consistency: palette applied cohesively throughout
☐ Typography: clean, sharp, no orphaned words or awkward line breaks`;
}

/**
 * Get asset-type-specific logo placement rules
 * Based on the Interactive Prompt Bible per-asset placement specifications
 */
function getLogoPlacementForAsset(assetType?: string): string {
  if (!assetType) {
    return `- Zone: TOP-CENTER or CENTER of the design
- Size: 15-25% of the total visual area (percentage-based for consistency)
- Logo must be the FIRST thing viewers notice`;
  }

  const type = assetType.toUpperCase();

  // ═══ BADGES & CREDENTIALS (VIP, Security, Backstage, Media) ═══
  if (['NAME_TAG', 'NAME_TAG_BACK', 'VIP_PASS', 'BACKSTAGE_PASS', 'MEDIA_CREDENTIAL',
       'SECURITY_BADGE', 'PARKING_PASS', 'WRISTBAND_DESIGN', 'VIP_BADGE'].includes(type)) {
    return `- Zone: Top-center or top-left (NEVER floating mid-field)
- Size: 15-20% of the design height
- Backing: allowed if needed, subtle only
- Logo anchors the top of the credential, establishing brand identity at first glance
- For wristbands: centered within the narrow band, sized to fill height`;
  }

  // ═══ SOCIAL (Post/Story/Thumbnail/Banners) ═══
  if (['SOCIAL_POST', 'SOCIAL_STORY', 'SOCIAL_PROFILE', 'EMAIL_HEADER',
       'LINKEDIN_BANNER', 'TWITTER_HEADER', 'YOUTUBE_THUMBNAIL',
       'PODCAST_COVER', 'ZOOM_BACKGROUND', 'STREAM_OVERLAY',
       'LIVE_STREAM_OVERLAY', 'SIGNAGE_LOOP', 'COUNTDOWN',
       'HYBRID_EVENT_SCREEN', 'WEBINAR_SLIDE'].includes(type)) {
    return `- Zone: Bottom corner (right by default), or top corner if the bottom is CTA-heavy
- Size: 12-20% of width depending on format
- Rule: NEVER overpower the headline
- For stories (vertical): place in upper 15% of the frame
- For banners (horizontal): left-aligned or centered in the header zone`;
  }

  // ═══ APPAREL (Shirt front / hat / bag / vest) ═══
  if (['TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE', 'HAT', 'VOLUNTEER_VEST'].includes(type)) {
    return `- Shirt front: LEFT CHEST (primary), optional secondary large center graphic if template calls for it
- Hat: FRONT PANEL CENTER, fill panel
- Size: consistent with print/embroidery realism (avoid billboard logos on hats)
- For sleeve prints: scale to fit sleeve width while maintaining readability
- Ensure logo works on the garment color (use reversed version if needed)`;
  }

  // ═══ LARGE FORMAT / EVENT SIGNAGE ═══
  if (['BANNER', 'ROLLUP_BANNER', 'EVENT_SIGNAGE', 'OUTDOOR_SIGNAGE', 'HANGING_SIGNAGE',
       'DOOR_SIGNAGE', 'ROOM_SIGNAGE', 'LOCATION_SIGNAGE', 'EASEL_SIGNAGE', 'WIFI_SIGN',
       'FEATHER_FLAG', 'TEARDROP_FLAG', 'A_FRAME_SIGN', 'A_FRAME', 'PORTABLE_BILLBOARD',
       'STAND_UP_PILLAR_BANNER', 'ACCESSIBILITY_SIGNAGE', 'SHUTTLE_SIGNAGE',
       'LOADING_DOCK_SIGNAGE', 'BREAKOUT_SESSION_SIGN'].includes(type)) {
    return `- Zone: TOP-CENTER or UPPER THIRD
- Size: 25-40% (depends on format and viewing distance)
- Rule: readability from distance wins — larger is better for signage
- For tall formats (feather flags, pillars): place logo in upper third
- A-Frame: bottom-left or top-left, 12-18% — "one message per side" rule
- Include ADA-friendly sizing guidance for accessibility signage`;
  }

  // ═══ STEP & REPEAT ═══
  if (['STEP_AND_REPEAT'].includes(type)) {
    return `- Zone: TILED GRID ONLY — offset or straight grid pattern
- Spacing: consistent, equal gutters throughout
- Size: set by repeat cadence (typically 12-18" equivalents in the real world)
- Include sponsor tiering rules (primary logos larger, secondary smaller)
- Camera-flash-friendly contrast — avoid low-contrast backgrounds`;
  }

  // ═══ STAGE & BACKDROPS ═══
  if (['BACK_WALL', 'MAIN_STAGE_BACKDROP', 'STAGE_BACKDROP',
       'SPONSOR_WALL', 'REGISTRATION_BACK_WALL', 'REGISTRATION_WALL',
       'SPONSOR_BANNER', 'SPONSOR_GRID'].includes(type)) {
    return `- Zone: TOP-CENTER or UPPER-LEFT, center-safe zone for speaker + screens
- Size: 25-40% of visible area
- For backdrops: single large logo placement with supporting design elements
- Lighting interaction note: avoid low-contrast gradients behind logo
- "Flash reflection avoidance" — design must photograph well
- Photo-friendly: minimal busy detail near where faces will appear`;
  }

  // ═══ COUNTERS & STRUCTURES ═══
  if (['REGISTRATION_COUNTER', 'WELCOME_COUNTER', 'TECHNOLOGY_COUNTER', 'TECH_COUNTER',
       'KIOSK', 'FEEDBACK_KIOSK'].includes(type)) {
    return `- Zone: FRONT-CENTER of the counter/kiosk face panel
- Size: 25-35% of the front panel area
- Logo should be at eye level when attendees approach
- Clean, uncluttered placement with event name below`;
  }

  // ═══ MERCHANDISE ═══
  if (['SWAG_BAG', 'WATER_BOTTLE', 'LANYARD', 'COASTER_DESIGN', 'NAPKIN_DESIGN',
       'COCKTAIL_NAPKIN', 'GIFT_BOX_PACKAGING', 'GIFT_BOX', 'MATCHBOOK_DESIGN', 'MATCHBOOK',
       'STICKER_SHEET'].includes(type)) {
    return `- Zone: CENTERED on the primary face of the product
- Size: 20-35% of the visible product surface
- Logo should be the hero element on the merchandise item
- Scale appropriately for the physical product size (coasters are small, tote bags are large)`;
  }

  // ═══ PRINT MATERIALS — Invitations, Programs, Documents ═══
  if (['INVITATION_CARD', 'INVITATION', 'RSVP_CARD', 'TICKET_DESIGN', 'TICKET',
       'PROGRAM_BOOKLET', 'THANK_YOU_NOTE', 'ENVELOPE_DESIGN', 'ENVELOPE',
       'CERTIFICATE_AWARD', 'CERTIFICATE', 'MENU', 'BAR_MENU', 'FOLDER',
       'SESSION_EVALUATION', 'EVALUATION_FORM', 'FLOOR_PLAN', 'SEATING_CHART',
       'PRESS_RELEASE', 'MEDIA_KIT', 'SPONSOR_PACKAGE'].includes(type)) {
    return `- Zone: TOP-CENTER as a header element, or centered at the top third
- Size: Invitations/cards: subtle 8-15%; Programs/booklets: cover prominent, inside pages smaller
- Logo establishes the brand before the reader engages with content
- For menus/programs: smaller top placement to leave room for text-heavy content
- White space priority — don't crowd the logo`;
  }

  // ═══ TABLE & DINING ═══
  if (['TABLE_TENT', 'TABLE_NUMBER', 'TABLE_RUNNER', 'TABLECLOTH_DESIGN', 'TABLECLOTH',
       'PLACE_CARD', 'DIETARY_CARD', 'CATERING_LABEL'].includes(type)) {
    return `- Zone: BOTTOM CORNER for table tents (10-15%), CENTERED for runners/cloths
- Size: 10-25% depending on item size
- Logo placement should be refined and elegant, matching dining aesthetics
- For small items (place cards, dietary cards): subtle but readable
- QR placement rules: if QR code present, keep logo separate from QR`;
  }

  // ═══ ARCHITECTURAL WRAPS & ENVIRONMENTAL ═══
  if (['GLASS_DOOR', 'GLASS_DOUBLE_DOOR', 'GLASS_ROTATING_DOOR', 'ELEVATOR_WRAP',
       'COLUMN_WRAP', 'CEILING_HANGER', 'WINDOW_CLING', 'FLOOR_DECAL',
       'STAIRS', 'STAIR_GRAPHICS', 'ESCALATOR_GRAPHICS'].includes(type)) {
    return `- Zone: CENTERED on the architectural element
- Size: 25-40% of the visible surface — architectural graphics are seen from distance
- Logo must be readable from 10+ feet away
- Floor decals: logo in lower third or trailing edge, 10-18% (smaller than banners)
  • Directional arrow FIRST, logo secondary
  • Safety compliance + high-contrast arrows required
- Window cling: top corners or center band, 15-25%
  • "Visibility strip" requirement if privacy band used
- For glass: ensure logo contrasts against transparency`;
  }

  // ═══ PRESENTATIONS & SLIDES ═══
  if (['PRESENTATION_SLIDE', 'PRESENTATION'].includes(type)) {
    return `- Zone: TOP-LEFT or BOTTOM-RIGHT corner (standard presentation placement)
- Size: 8-12% of the slide area — present but not competing with slide content
- Logo provides consistent brand presence across all slides`;
  }

  // ═══ SELFIE & PHOTO ═══
  if (['SELFIE_FRAME', 'SELFIE_STATION', 'PHOTO_BOOTH_FRAME', 'PHOTO_BOOTH_PROPS'].includes(type)) {
    return `- Zone: TOP-CENTER or BOTTOM-CENTER of frame
- Size: 15-20% — visible in photos but not dominating faces
- Must photograph well under flash and ambient lighting`;
  }

  // ═══ SPEAKER & SESSION ═══
  if (['SPEAKER_INTRO_CARD', 'SPEAKER_INTRO', 'AGENDA_HIGHLIGHTS',
       'NETWORKING_BINGO', 'SCAVENGER_HUNT_CARD', 'POLL_CARD'].includes(type)) {
    return `- Zone: TOP-LEFT or BOTTOM-CENTER
- Size: 10-15% — supporting element, content is primary
- Logo provides brand context without competing with session content`;
  }

  // Default fallback
  return `- Zone: TOP-CENTER or CENTER of the design
- Size: 15-25% of the total visual area (percentage-based for consistency)
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

/**
 * Build an explicit text content manifest — tells the AI exactly what text to render
 * and how to spell each word, preventing hallucinated or misspelled text.
 */
export function buildTextManifest(
  eventName?: string,
  eventDescription?: string,
  eventDate?: string,
  eventLocation?: string,
  brandContext?: BrandContext
): string {
  const textItems: string[] = [];

  if (eventName) {
    // Spell out the event name character by character for verification
    const spelled = eventName.split('').join(' ');
    textItems.push(`PRIMARY TEXT (HEADLINE): "${eventName}"
   Character-by-character: [ ${spelled} ] (${eventName.length} characters total)
   This MUST appear prominently. Spell it exactly — verify letter count before rendering.`);
  }

  if (eventDate) {
    textItems.push(`DATE TEXT: "${eventDate}" — render exactly as provided, do not reformat`);
  }

  if (eventLocation) {
    textItems.push(`LOCATION TEXT: "${eventLocation}" — render exactly as provided`);
  }

  if (brandContext?.tagline) {
    const spelled = brandContext.tagline.split('').join(' ');
    textItems.push(`TAGLINE: "${brandContext.tagline}"
   Character-by-character: [ ${spelled} ] (${brandContext.tagline.length} characters)
   Must match exactly.`);
  }

  if (textItems.length === 0) return '';

  return `
[TEXT_CONTENT_MANIFEST] — EXACT TEXT TO RENDER
The following text elements MUST appear in the design, spelled EXACTLY as shown.
Before rendering each text element, internally verify the spelling character-by-character.
Do NOT add, remove, or modify any text beyond what is listed here.
Do NOT add placeholder text like "Lorem ipsum" or generic event details not provided.

${textItems.join('\n\n')}

POST-RENDER TEXT VERIFICATION:
After composing the design, re-read every text element in your output and compare
character-by-character against this manifest. If ANY character differs, fix it before finalizing.`;
}
