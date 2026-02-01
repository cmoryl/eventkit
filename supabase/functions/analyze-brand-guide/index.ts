/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedStyle {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette?: { hex: string; name: string }[];
  heading_font?: string;
  body_font?: string;
  mood_keywords?: string[];
  imagery_style?: string;
  industry?: string;
  target_audience?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the message content based on file type
    const isImage = fileType.startsWith("image/");
    
    const systemPrompt = `You are a brand style analyzer. Analyze the provided brand guide document or image and extract key brand style information.

Extract and return the following in valid JSON format:
{
  "primary_color": "#hex color (the main brand color)",
  "secondary_color": "#hex color (supporting color)",
  "accent_color": "#hex color (highlight/accent color)",
  "color_palette": [{"hex": "#color", "name": "Color Name"}] (up to 6 additional colors),
  "heading_font": "Font name for headings (match to: Inter, Poppins, Montserrat, Playfair Display, Roboto, Open Sans, Lato, Oswald, Raleway, Merriweather, Source Sans Pro, Ubuntu, PT Sans, Nunito, Work Sans)",
  "body_font": "Font name for body text (match to same list)",
  "mood_keywords": ["Professional", "Playful", "Elegant", "Bold", "Minimalist", "Luxurious", "Friendly", "Modern", "Classic", "Innovative", "Warm", "Cool", "Energetic", "Calm", "Sophisticated"],
  "imagery_style": "Brief description of the visual/imagery style",
  "industry": "Technology, Healthcare, Finance, Education, Entertainment, Fashion, Food & Beverage, Real Estate, Travel, Non-profit, Sports, Corporate, Retail, Creative Agency, or Wellness",
  "target_audience": "Brief description of target audience"
}

IMPORTANT:
- Extract actual hex color codes if visible in the document
- If fonts aren't exact matches, pick the closest from the provided list
- Select mood_keywords from the provided list only (max 5)
- Be concise and accurate
- Return ONLY valid JSON, no markdown or explanation`;

    const userContent = isImage 
      ? [
          { type: "text", text: "Analyze this brand guide image and extract the brand style information:" },
          { type: "image_url", image_url: { url: fileBase64 } }
        ]
      : [
          { type: "text", text: `Analyze this brand guide document (${fileName}) and extract the brand style information. The document is provided as a base64-encoded file. Focus on extracting colors, typography, mood, and style information.` },
          { type: "image_url", image_url: { url: fileBase64 } }
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let extractedStyle: ExtractedStyle = {};
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      extractedStyle = JSON.parse(cleanContent);
      
      // Validate hex colors
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (extractedStyle.primary_color && !hexRegex.test(extractedStyle.primary_color)) {
        delete extractedStyle.primary_color;
      }
      if (extractedStyle.secondary_color && !hexRegex.test(extractedStyle.secondary_color)) {
        delete extractedStyle.secondary_color;
      }
      if (extractedStyle.accent_color && !hexRegex.test(extractedStyle.accent_color)) {
        delete extractedStyle.accent_color;
      }
      
      // Filter color palette to valid hex colors
      if (extractedStyle.color_palette) {
        extractedStyle.color_palette = extractedStyle.color_palette.filter(
          c => c.hex && hexRegex.test(c.hex) && c.name
        );
      }

    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Try to extract what we can
      extractedStyle = {};
    }

    console.log("Extracted style:", extractedStyle);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedStyle,
        rawResponse: aiContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error analyzing brand guide:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze brand guide";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
