import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeImageRequest {
  imageBase64: string;
  eventName?: string;
  eventDescription?: string;
}

interface ImageAnalysis {
  // Color analysis
  dominantColors: string[]; // 5 hex codes
  colorMood: string; // warm, cool, neutral, vibrant, muted
  colorHarmony: string; // complementary, analogous, triadic, etc.
  
  // Style analysis
  designStyle: string; // modern, vintage, minimalist, maximalist, organic, geometric, etc.
  aestheticKeywords: string[]; // e.g., ["sleek", "bold", "playful", "elegant"]
  era: string; // contemporary, retro-80s, art-deco, etc.
  
  // Mood & atmosphere
  mood: string; // energetic, calm, luxurious, playful, professional, etc.
  atmosphere: string; // intimate, grand, casual, formal
  emotionalTone: string; // inspiring, sophisticated, fun, serious
  
  // Visual elements
  patterns: string[]; // geometric, organic, abstract, photographic, etc.
  textures: string[]; // smooth, rough, glossy, matte, gradient, etc.
  shapes: string; // angular, curved, mixed
  
  // Typography suggestions
  typographyStyle: string; // sans-serif modern, serif elegant, display bold, etc.
  typographyMood: string; // clean, decorative, bold, refined
  
  // Layout characteristics
  composition: string; // centered, asymmetric, grid-based, organic
  whitespace: string; // minimal, balanced, generous
  visualWeight: string; // heavy, light, balanced
  
  // Generation guidance
  promptEnhancements: string[]; // specific phrases to add to generation prompts
  avoidElements: string[]; // elements to avoid based on the reference
  
  // Confidence
  analysisConfidence: number; // 0-1 confidence score
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: AnalyzeImageRequest = await req.json();
    const { imageBase64, eventName, eventDescription } = body;

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    console.log('Analyzing reference image for comprehensive style extraction...');

    const systemPrompt = `You are an expert visual design analyst and brand strategist. Analyze the provided image in extreme detail to extract comprehensive design intelligence that will inform AI-generated event branding assets.

Your analysis must be thorough and actionable. Extract:

1. **COLOR ANALYSIS**
   - Identify the 5 most prominent colors as exact hex codes
   - Determine the overall color mood (warm/cool/neutral/vibrant/muted)
   - Identify the color harmony type (complementary, analogous, triadic, split-complementary, tetradic)

2. **DESIGN STYLE**
   - Categorize the primary design style (modern, vintage, minimalist, maximalist, organic, geometric, industrial, luxurious, playful, corporate, artistic)
   - List 3-5 aesthetic keywords that describe the visual feel
   - Identify the design era or period influence

3. **MOOD & ATMOSPHERE**
   - Primary mood (energetic, calm, luxurious, playful, professional, edgy, warm, sophisticated)
   - Atmosphere (intimate, grand, casual, formal, festive, serene)
   - Emotional tone the design evokes

4. **VISUAL ELEMENTS**
   - Patterns present (geometric, organic, abstract, photographic, illustrated, none)
   - Textures (smooth, rough, glossy, matte, gradient, textured, flat)
   - Shape language (angular, curved, mixed, organic, geometric)

5. **TYPOGRAPHY GUIDANCE**
   - Suggested typography style that would complement this aesthetic
   - Typography mood (clean, decorative, bold, refined, quirky, elegant)

6. **COMPOSITION**
   - Layout style (centered, asymmetric, grid-based, organic, dynamic)
   - Whitespace usage (minimal, balanced, generous)
   - Visual weight distribution (heavy, light, balanced)

7. **GENERATION GUIDANCE**
   - List 5-8 specific phrases to enhance AI image generation prompts
   - List 2-4 elements or styles to AVOID to maintain consistency

Respond with a valid JSON object matching this exact structure:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "colorMood": "string",
  "colorHarmony": "string",
  "designStyle": "string",
  "aestheticKeywords": ["keyword1", "keyword2", "keyword3"],
  "era": "string",
  "mood": "string",
  "atmosphere": "string",
  "emotionalTone": "string",
  "patterns": ["pattern1", "pattern2"],
  "textures": ["texture1", "texture2"],
  "shapes": "string",
  "typographyStyle": "string",
  "typographyMood": "string",
  "composition": "string",
  "whitespace": "string",
  "visualWeight": "string",
  "promptEnhancements": ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5"],
  "avoidElements": ["avoid1", "avoid2"],
  "analysisConfidence": 0.95
}

ONLY respond with the JSON object. No markdown, no explanation.`;

    const userPrompt = `Analyze this reference image in detail for event branding purposes.
${eventName ? `Event: ${eventName}` : ''}
${eventDescription ? `Event description: ${eventDescription}` : ''}

Extract comprehensive design intelligence that will be used to generate cohesive branded assets including banners, signage, merchandise, digital graphics, and print materials.

Be precise with hex color codes - use a color picker approach to identify exact colors.
Be specific with style descriptors - generic terms are not helpful.
The promptEnhancements should be directly usable in image generation prompts.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Use Pro model for detailed analysis
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    console.log('Raw analysis response:', content.substring(0, 500));

    // Parse the JSON response
    let analysis: ImageAnalysis;
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Return a fallback analysis
      analysis = {
        dominantColors: ["#667eea", "#764ba2", "#f093fb", "#43e97b", "#1f2937"],
        colorMood: "vibrant",
        colorHarmony: "analogous",
        designStyle: "modern",
        aestheticKeywords: ["clean", "bold", "professional"],
        era: "contemporary",
        mood: "energetic",
        atmosphere: "professional",
        emotionalTone: "inspiring",
        patterns: ["geometric"],
        textures: ["smooth", "gradient"],
        shapes: "mixed",
        typographyStyle: "sans-serif modern",
        typographyMood: "clean",
        composition: "balanced",
        whitespace: "balanced",
        visualWeight: "balanced",
        promptEnhancements: ["professional event branding", "cohesive design system", "modern aesthetic"],
        avoidElements: ["cluttered layouts", "conflicting styles"],
        analysisConfidence: 0.5
      };
    }

    console.log('Image analysis complete:', {
      style: analysis.designStyle,
      mood: analysis.mood,
      colorCount: analysis.dominantColors?.length,
      confidence: analysis.analysisConfidence
    });

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
