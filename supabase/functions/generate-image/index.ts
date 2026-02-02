import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import type { GenerateImageRequest, ImageAnalysis } from "../_shared/types.ts";
import { getBasePrompt, isPrintAsset } from "../_shared/asset-prompts.ts";
import { 
  buildBrandContext, 
  buildLocationContext, 
  buildVenueContext, 
  buildLogoInstructions,
  buildAnalysisInstructions,
  buildPrintRequirements,
  fetchPromptTemplate,
  mergeTemplateWithVariables,
  incrementTemplateUsage
} from "../_shared/prompt-builder.ts";
import { performInlineAnalysis, generateImageWithRetry } from "../_shared/ai-gateway.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateImageRequest = await req.json();
    const { 
      assetType, 
      eventName, 
      eventDescription,
      eventDate,
      eventLocation,
      eventType,
      styleDescription, 
      colorPalette, 
      logoBase64,
      location,
      incorporateLocationStyle,
      vibeImageBase64,
      masterPatternBase64,
      venueImageBase64,
      renderMode = 'hyperrealistic',
      imageAnalysis: providedAnalysis,
      venueIntelligence,
      brandContext
    } = body;

    // OPTIMIZATION: Perform inline analysis if vibe image exists but no analysis provided
    let imageAnalysis: ImageAnalysis | undefined = providedAnalysis;
    if (!imageAnalysis && vibeImageBase64) {
      console.log('No pre-computed analysis provided, performing inline analysis...');
      const inlineResult = await performInlineAnalysis(LOVABLE_API_KEY, vibeImageBase64, eventName, eventDescription);
      if (inlineResult) {
        imageAnalysis = inlineResult;
        console.log('Inline analysis successful:', imageAnalysis.designStyle, imageAnalysis.mood);
      }
    }

    // BUILD CONTEXT STRINGS USING MODULAR BUILDERS
    const brandContextString = buildBrandContext(brandContext);
    const locationContext = buildLocationContext(location, incorporateLocationStyle);
    const venueIntelligenceContext = buildVenueContext(venueIntelligence);
    const logoInstructions = buildLogoInstructions(!!logoBase64);
    const analysisInstructions = buildAnalysisInstructions(imageAnalysis);

    // FETCH PROMPT TEMPLATE FROM DATABASE
    const promptTemplate = await fetchPromptTemplate(assetType);
    let templateBasedPrompt: string | null = null;
    
    if (promptTemplate) {
      // Build template variables from event data AND brand context
      const brandColors = brandContext?.colorPalette?.map(c => c.hex) || [];
      const effectiveColorPalette = brandColors.length > 0 ? brandColors : (colorPalette || []);
      
      const colors = effectiveColorPalette.join(', ');
      const primaryColor = brandContext?.primaryColor || effectiveColorPalette[0] || '';
      const secondaryColor = brandContext?.secondaryColor || effectiveColorPalette[1] || '';
      const accentColor = brandContext?.accentColor || effectiveColorPalette[2] || '';
      
      const templateVariables: Record<string, string> = {
        eventName: eventName || 'Event',
        eventDescription: eventDescription || '',
        eventDate: eventDate || '',
        eventLocation: eventLocation || location || '',
        eventType: eventType || 'conference',
        mood: styleDescription || brandContext?.moodKeywords?.join(', ') || 'professional and modern',
        style: styleDescription || brandContext?.imageryStyle || 'clean and elegant',
        colors,
        primaryColor,
        secondaryColor,
        accentColor,
        culturalContext: brandContext?.culturalContext || venueIntelligence?.culturalContext || '',
        venueType: venueIntelligence?.venueType || '',
        venueName: venueIntelligence?.name || '',
        city: venueIntelligence?.city || '',
        // Brand-specific variables
        brandName: brandContext?.brandName || '',
        brandVoice: brandContext?.brandVoice?.join(', ') || '',
        brandArchetype: brandContext?.archetype || '',
        imageryStyle: brandContext?.imageryStyle || '',
        patternStyle: brandContext?.patternStyle || '',
        iconStyle: brandContext?.iconStyle || '',
        industry: brandContext?.industry || '',
        targetAudience: brandContext?.targetAudience || '',
        headingFont: brandContext?.headingFont || '',
        bodyFont: brandContext?.bodyFont || '',
        tagline: brandContext?.tagline || '',
      };
      
      templateBasedPrompt = mergeTemplateWithVariables(promptTemplate.prompt_template, templateVariables);
      console.log(`Using database template "${promptTemplate.template_name}" for ${assetType}`);
      
      // Track usage (fire and forget)
      incrementTemplateUsage(promptTemplate.id);
    }

    // Determine base prompt
    const basePrompt = templateBasedPrompt || getBasePrompt(assetType, renderMode);
    
    // Build color context
    const colorContext = colorPalette?.length 
      ? `Use this exact color palette: ${colorPalette.join(', ')}. These colors should be prominently featured.` 
      : '';

    // Build style instructions
    const styleInstructions = styleDescription 
      ? `\nSTYLE DIRECTION:\n${styleDescription}\nFollow these style guidelines precisely.`
      : '';

    // Build vibe image instructions
    const vibeInstructions = vibeImageBase64
      ? `
STYLE REFERENCE - IMPORTANT:
Reference Image #${logoBase64 ? '2' : '1'} is a STYLE/VIBE REFERENCE IMAGE. You MUST:
1. Match the overall aesthetic, mood, and visual style of this reference
2. Use similar color tones, textures, and design elements
3. Capture the same energy and feeling conveyed in this reference
4. Apply this visual language throughout the design`
      : '';

    // Build pattern instructions
    const patternInstructions = masterPatternBase64
      ? `
PATTERN REFERENCE - IMPORTANT:
Reference Image #${(logoBase64 ? 1 : 0) + (vibeImageBase64 ? 1 : 0) + 1} is a MASTER PATTERN. You MUST:
1. Incorporate this pattern as a design element in the final output
2. Use the pattern as a background, accent, or decorative element
3. Maintain the pattern's colors and style throughout the design`
      : '';

    // Build venue compositing instructions
    const venueInstructions = venueImageBase64
      ? `
VENUE COMPOSITING - CRITICAL:
Reference Image #${(logoBase64 ? 1 : 0) + (vibeImageBase64 ? 1 : 0) + (masterPatternBase64 ? 1 : 0) + 1} is the ACTUAL VENUE PHOTO where this asset will be displayed.
You MUST:
1. Composite the branded asset INTO this actual venue environment
2. Match the lighting, perspective, and shadows of the venue photo
3. Make the branded element look like it belongs naturally in the space
4. The final image should look like a real photograph of the installed branding
5. Maintain photorealistic quality - this should look like a professional installation photo`
      : '';

    // Build hyper-realistic requirements
    const realismRequirements = renderMode === 'hyperrealistic' && !assetType.includes('_ISOLATED')
      ? `
PHOTOREALISTIC RENDERING - CRITICAL:
- Render as a professional product/environment photograph
- Use dramatic, professional lighting with soft shadows
- Include shallow depth of field for focus emphasis
- Add subtle environmental context (reflections, ambient occlusion)
- Quality should match high-end advertising photography
- Make viewers believe this is a real photograph, not a render`
      : '';

    // Determine print requirements
    const isPrint = body.isPrintAsset ?? isPrintAsset(assetType);
    const targetDPI = body.printDPI || (isPrint ? 300 : 150);
    const printRequirements = buildPrintRequirements(isPrint, targetDPI);

    // BUILD FULL PROMPT
    const fullPrompt = `Generate an image: ${basePrompt}

Event: "${eventName}"
${eventDescription ? `Event Description: ${eventDescription}` : ''}
${brandContextString}
${styleInstructions}
${analysisInstructions}
${colorContext}
${locationContext}
${venueIntelligenceContext}
${logoInstructions}
${vibeInstructions}
${patternInstructions}
${venueInstructions}
${realismRequirements}
${printRequirements}

REQUIREMENTS:
- Create a high-quality, professional design
- Ultra high resolution - maximum quality output
- Modern, polished aesthetic
${brandContext ? '- FOLLOW ALL BRAND GUIDELINES AND VISUAL IDENTITY RULES' : ''}
${isPrint ? '- PRINT-OPTIMIZED: CMYK-safe colors, crisp text, production-ready quality' : '- Suitable for digital display'}
- Ensure text is razor-sharp and perfectly legible
- Maintain visual hierarchy with the event name prominent
- ALL REFERENCE IMAGES PROVIDED SHOULD INFORM THE FINAL DESIGN
${imageAnalysis ? '- APPLY ALL DESIGN INTELLIGENCE FROM IMAGE ANALYSIS' : ''}
${venueIntelligence ? '- APPLY VENUE INTELLIGENCE TO CREATE VENUE-SPECIFIC DESIGN' : ''}
${brandContext ? '- THE DESIGN MUST BE UNMISTAKABLY ON-BRAND' : ''}
${isPrint ? '- This asset WILL BE PRINTED - quality is paramount' : ''}`;

    console.log(`Generating ${isPrint ? 'PRINT-READY' : 'digital'} image for ${assetType}: ${eventName}${location ? ` (Location: ${location})` : ''}${venueIntelligence?.name ? ` [venue: ${venueIntelligence.name}]` : ''}${brandContext?.brandName ? ` [brand: ${brandContext.brandName}]` : ''} [mode: ${renderMode}]${isPrint ? ` [${targetDPI}DPI]` : ''}${vibeImageBase64 ? ' [vibe]' : ''}${masterPatternBase64 ? ' [pattern]' : ''}${venueImageBase64 ? ' [venue-photo]' : ''}`);

    // Collect all reference images in order
    const referenceImages: string[] = [];
    if (logoBase64) referenceImages.push(logoBase64);
    if (vibeImageBase64) referenceImages.push(vibeImageBase64);
    if (masterPatternBase64) referenceImages.push(masterPatternBase64);
    if (venueImageBase64) referenceImages.push(venueImageBase64);

    const imageUrl = await generateImageWithRetry(LOVABLE_API_KEY, fullPrompt, assetType, referenceImages);
    
    console.log(`Successfully generated ${isPrint ? 'PRINT-READY' : renderMode} image for ${assetType}`);

    return jsonResponse({ success: true, imageUrl });

  } catch (error) {
    console.error("generate-image error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage === "RATE_LIMIT") {
      return errorResponse("Rate limit exceeded. Please try again in a moment.", 429);
    }
    
    if (errorMessage === "PAYMENT_REQUIRED") {
      return errorResponse("AI credits exhausted. Please add credits to continue.", 402);
    }
    
    return errorResponse(errorMessage, 500);
  }
});
