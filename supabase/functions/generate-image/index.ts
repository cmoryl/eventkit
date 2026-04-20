import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import type { GenerateImageRequest, ImageAnalysis } from "../_shared/types.ts";
import { getBasePrompt, isPrintAsset } from "../_shared/asset-prompts.ts";
import type { LabeledImage } from "../_shared/ai-gateway.ts";
import { 
  buildMasterWrapper,
  buildBrandContext, 
  buildLocationContext, 
  buildVenueContext, 
  buildLogoInstructions,
  buildAnalysisInstructions,
  buildPrintRequirements,
  buildOutputChecklist,
  buildTextManifest,
  fetchPromptTemplate,
  mergeTemplateWithVariables,
  incrementTemplateUsage
} from "../_shared/prompt-builder.ts";
import { performInlineAnalysis, generateImageWithRetry, analyzeLogoDetails } from "../_shared/ai-gateway.ts";

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateImageRequest & { masterDirection?: string; styleAnchorImage?: string; templateId?: string; templatePrompt?: string } = await req.json();
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
      vibeImageBase64: rawVibeImage,
      masterPatternBase64: rawMasterPattern,
      venueImageBase64,
      renderMode = 'hyperrealistic',
      imageAnalysis: providedAnalysis,
      venueIntelligence,
      brandContext,
      imageModel = 'fast',
      masterDirection,
      styleAnchorImage,
      templateId,
      templatePrompt: templatePromptInline,
    } = body;

    // Normalize logo: if it's an HTTP URL (not base64), fetch and convert
    let logoData = logoBase64;
    if (logoData && (logoData.startsWith('http://') || logoData.startsWith('https://')) && !logoData.startsWith('data:')) {
      try {
        console.log('Logo is a URL, fetching and converting to base64...');
        const logoResp = await fetch(logoData);
        if (logoResp.ok) {
          const logoBlob = await logoResp.arrayBuffer();
          const contentType = logoResp.headers.get('content-type') || 'image/png';
          // Use chunked conversion to avoid call stack overflow on large images
          const bytes = new Uint8Array(logoBlob);
          let binaryStr = '';
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binaryStr += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
          }
          const base64Str = btoa(binaryStr);
          logoData = `data:${contentType};base64,${base64Str}`;
        } else {
          console.warn('Failed to fetch logo URL, skipping logo:', logoResp.status);
          logoData = undefined;
        }
      } catch (e) {
        console.warn('Error fetching logo URL:', e);
        logoData = undefined;
      }
    }

    // CRITICAL: AI gateway does not support SVG images - skip SVG logos as reference images
    // but keep logo instructions in the text prompt so AI knows about the brand
    let logoDataForReference = logoData;
    if (logoData && (logoData.includes('image/svg+xml') || logoData.includes('image/svg'))) {
      console.warn('Logo is SVG format - unsupported by AI gateway. Skipping as reference image, keeping text instructions.');
      logoDataForReference = undefined;
    }

    // Normalize brand colorPalette to array of hex strings
    if (brandContext?.colorPalette && Array.isArray(brandContext.colorPalette)) {
      brandContext.colorPalette = brandContext.colorPalette.map((c: any) => 
        typeof c === 'string' ? c : (c?.hex || String(c))
      );
    }

    // Normalize to arrays for multi-image support
    const vibeImageBase64 = Array.isArray(rawVibeImage) ? rawVibeImage[0] : rawVibeImage;
    const allVibeImages = Array.isArray(rawVibeImage) ? rawVibeImage : (rawVibeImage ? [rawVibeImage] : []);
    const masterPatternBase64 = Array.isArray(rawMasterPattern) ? rawMasterPattern[0] : rawMasterPattern;
    const allPatternImages = Array.isArray(rawMasterPattern) ? rawMasterPattern : (rawMasterPattern ? [rawMasterPattern] : []);

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
    // Logo is composited AFTER generation by the client-side logoCompositor.
    // We do NOT send the logo as a reference image to avoid the AI trying to redraw it (poorly).
    // We still pass hasLogo=true so the prompt reserves clean space for logo placement.
    const [brandContextString, locationContext, venueIntelligenceContext] = await Promise.all([
      Promise.resolve(buildBrandContext(brandContext)),
      Promise.resolve(buildLocationContext(location, incorporateLocationStyle)),
      Promise.resolve(buildVenueContext(venueIntelligence)),
    ]);
    
    const logoInstructions = buildLogoInstructions(!!logoData, assetType);
    const analysisInstructions = buildAnalysisInstructions(imageAnalysis);

    // FETCH TEMPLATE-SPECIFIC PROMPT (admin-curated, per editable template)
    // This is the highest-priority base prompt — it represents the admin's intent
    // for this exact template and must drive the generation.
    let editableTemplatePrompt: string | null = templatePromptInline?.trim() || null;
    if (!editableTemplatePrompt && templateId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supabaseUrl && serviceKey) {
          const tplRes = await fetch(
            `${supabaseUrl}/rest/v1/editable_templates?id=eq.${encodeURIComponent(templateId)}&select=prompt,name`,
            { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
          );
          if (tplRes.ok) {
            const rows = await tplRes.json();
            const row = Array.isArray(rows) ? rows[0] : null;
            if (row?.prompt && typeof row.prompt === 'string' && row.prompt.trim()) {
              editableTemplatePrompt = row.prompt.trim();
              console.log(`Loaded editable_template prompt for "${row.name}" (${templateId})`);
            }
          } else {
            console.warn('Failed to fetch editable_template prompt:', tplRes.status);
          }
        }
      } catch (e) {
        console.warn('Error fetching editable_template prompt:', e);
      }
    }

    // FETCH PROMPT TEMPLATE FROM DATABASE (legacy prompt_templates table)
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
    // Priority: editable_templates.prompt (per-template, admin-curated)
    //        -> prompt_templates (per asset_type, legacy)
    //        -> getBasePrompt (hardcoded asset_type defaults)
    const basePrompt = editableTemplatePrompt || templateBasedPrompt || getBasePrompt(assetType, renderMode);
    
    // Build color context
    const colorContext = colorPalette?.length 
      ? `Use this exact color palette: ${colorPalette.join(', ')}. These colors should be prominently featured.` 
      : '';

    // Build style instructions
    const styleInstructions = styleDescription 
      ? `\nSTYLE DIRECTION:\n${styleDescription}\nFollow these style guidelines precisely.`
      : '';

    // Build vibe image instructions
    const vibeInstructions = allVibeImages.length > 0
      ? `
STYLE REFERENCE - IMPORTANT:
${allVibeImages.length} STYLE/VIBE REFERENCE IMAGE(S) provided. You MUST:
1. Analyze ALL reference images and identify their shared aesthetic, mood, and visual style
2. Match the overall color tones, textures, and design elements across all references
3. Capture the combined energy and feeling conveyed in these references
4. Create a cohesive design that harmoniously blends the best elements from all references
5. Apply this unified visual language throughout the design`
      : '';

    // Build pattern instructions
    const patternInstructions = allPatternImages.length > 0
      ? `
PATTERN REFERENCE - IMPORTANT:
${allPatternImages.length} MASTER PATTERN(S) provided. You MUST:
1. Analyze ALL provided patterns and their design elements
2. Incorporate these patterns as background, accent, or decorative elements
3. Blend multiple patterns harmoniously while maintaining visual coherence
4. Maintain the patterns' colors and style throughout the design`
      : '';

    // Build venue compositing instructions
    const venueInstructions = venueImageBase64
      ? `
VENUE COMPOSITING - CRITICAL:
Reference Image #${(vibeImageBase64 ? 1 : 0) + (masterPatternBase64 ? 1 : 0) + 1} is the ACTUAL VENUE PHOTO where this asset will be displayed.
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

    // BUILD FULL PROMPT — prefixed with Master Wrapper
    let masterWrapper = buildMasterWrapper();
    // Inject the actual event name into the text rendering module
    masterWrapper = masterWrapper.replace('{eventName}', eventName || 'Event');
    
    const outputChecklist = buildOutputChecklist(isPrint, !!logoData);

    // Build explicit text content manifest so AI knows exactly what to render
    const textManifest = buildTextManifest(eventName, eventDescription, eventDate, eventLocation, brandContext);
    
    // Inject master style direction if provided (for cross-asset consistency)
    const masterDirectionSection = masterDirection || '';

    const fullPrompt = `${masterWrapper}
${masterDirectionSection}
${editableTemplatePrompt ? `\nTEMPLATE BLUEPRINT (authoritative — this is the admin-curated direction for THIS specific template; follow it precisely while honoring brand and event context below):\n${editableTemplatePrompt}\n` : ''}
Generate an image: ${basePrompt}

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
${textManifest}

REQUIREMENTS:
- Create a high-quality, professional design
- Ultra high resolution - maximum quality output
- Modern, polished aesthetic
${brandContext ? '- FOLLOW ALL BRAND GUIDELINES AND VISUAL IDENTITY RULES' : ''}
${isPrint ? '- PRINT-OPTIMIZED: CMYK-safe colors, crisp text, production-ready quality' : '- Suitable for digital display'}
- ALL TEXT MUST BE VECTOR-SHARP — render as if professionally typeset, no blur or artifacts
- Maintain visual hierarchy with the event name prominent
- ALL REFERENCE IMAGES PROVIDED SHOULD INFORM THE FINAL DESIGN
${imageAnalysis ? '- APPLY ALL DESIGN INTELLIGENCE FROM IMAGE ANALYSIS' : ''}
${venueIntelligence ? '- APPLY VENUE INTELLIGENCE TO CREATE VENUE-SPECIFIC DESIGN' : ''}
${brandContext ? '- THE DESIGN MUST BE UNMISTAKABLY ON-BRAND' : ''}
${isPrint ? '- This asset WILL BE PRINTED - quality is paramount' : ''}

${outputChecklist}`;

    console.log(`Generating ${isPrint ? 'PRINT-READY' : 'digital'} image for ${assetType}: ${eventName}${location ? ` (Location: ${location})` : ''}${venueIntelligence?.name ? ` [venue: ${venueIntelligence.name}]` : ''}${brandContext?.brandName ? ` [brand: ${brandContext.brandName}]` : ''} [mode: ${renderMode}]${isPrint ? ` [${targetDPI}DPI]` : ''}${vibeImageBase64 ? ' [vibe]' : ''}${masterPatternBase64 ? ' [pattern]' : ''}${venueImageBase64 ? ' [venue-photo]' : ''}${logoData ? ' [logo]' : ''}`);

    // Collect all reference images with labels
    // NOTE: Logo is NOT included as a reference image — the client-side logoCompositor
    // overlays the actual logo file AFTER generation for pixel-perfect results.
    const referenceImages: LabeledImage[] = [];
    // Style anchor: previously generated asset from this kit — ensures visual consistency
    if (styleAnchorImage) {
      referenceImages.push({ url: styleAnchorImage, label: 'KIT STYLE ANCHOR - Match the EXACT visual treatment, color application, typography style, and composition approach of this reference. This asset must look like it belongs to the same event kit.' });
    }
    allVibeImages.forEach((img, i) => referenceImages.push({ url: img, label: `STYLE REFERENCE ${allVibeImages.length > 1 ? i + 1 : ''} - match this visual aesthetic and mood`.trim() }));
    allPatternImages.forEach((img, i) => referenceImages.push({ url: img, label: `PATTERN ${allPatternImages.length > 1 ? i + 1 : ''} - use as decorative/background element`.trim() }));
    if (venueImageBase64) referenceImages.push({ url: venueImageBase64, label: 'VENUE PHOTO - composite the design into this real venue environment' });

    const imageUrl = await generateImageWithRetry(LOVABLE_API_KEY, fullPrompt, assetType, referenceImages, 2, imageModel);
    
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
