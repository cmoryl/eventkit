import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanJsonFromAI(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```json")) s = s.slice(7);
  else if (s.startsWith("```")) s = s.slice(3);
  if (s.endsWith("```")) s = s.slice(0, -3);
  return s.trim();
}

const hexRegex = /^#[0-9A-Fa-f]{6}$/;

function validateHex(c: string | undefined): string | undefined {
  return c && hexRegex.test(c) ? c : undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64) return json(400, { error: "No file provided" });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isImage = fileType?.startsWith("image/");

    const systemPrompt = `You are a brand style analyzer. Analyze the provided brand guide document or image and extract ALL available brand style information comprehensively.

Return valid JSON with these fields (omit any field you can't find):

{
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "color_palette": [{"hex": "#hex", "name": "Name", "usage": "Primary background"}],
  
  "heading_font": "Font name for headings",
  "body_font": "Font name for body text",
  "accent_font": "Font name for accents/captions",
  "typography_scale": {
    "h1": "size", "h2": "size", "body": "size", "caption": "size"
  },
  
  "mood_keywords": ["Professional", "Bold", "Elegant"],
  "tone_keywords": ["Confident", "Inclusive", "Expert"],
  "brand_voice": ["Authoritative", "Warm", "Clear"],
  "writing_style": "Brief description of writing style (sentence case, active voice, etc.)",
  
  "imagery_style": "Description of visual/imagery approach",
  "photography_style": "Description of photography direction",
  "photography_dos": ["Use natural lighting", "Show diverse people"],
  "photography_donts": ["No stock-looking poses", "No heavy filters"],
  "pattern_style": "Description of patterns/textures used",
  "icon_style": "Description of iconography style (stroke, filled, rounded, etc.)",
  
  "logo_clear_space": "Clear space rule (e.g., 'minimum 1x logo height on all sides')",
  "logo_min_size": "Minimum size rule (e.g., '24px digital, 0.5in print')",
  "logo_placement_rules": ["Top-left preferred", "Never rotate", "Never change colors"],
  "logo_backgrounds": ["White", "Dark navy", "Transparent"],
  
  "tagline": "Brand tagline if present",
  "mission": "Mission statement if present",
  "archetype": "Brand archetype (Hero, Creator, Sage, Explorer, etc.)",
  
  "industry": "Industry category",
  "target_audience": "Description of target audience",
  "cultural_context": "Any cultural, regional, or language considerations",
  
  "social_handles": {"instagram": "@handle", "linkedin": "url"},
  "hashtags": ["#BrandHashtag"],
  
  "approved_layouts": ["Centered hero", "Left-aligned with sidebar"],
  "restricted_elements": ["No clip art", "No rounded corners on photos"],
  "approved_color_combinations": [{"primary": "#hex", "secondary": "#hex", "status": "approved"}],
  
  "gradients": [{"name": "Primary gradient", "colors": ["#hex1", "#hex2"]}],
  
  "print_color_mode": "CMYK or RGB",
  "pantone_colors": [{"name": "Pantone 123 C", "hex": "#hex"}]
}

IMPORTANT:
- Extract EVERY section you can find — colors, typography, voice, photography, logo rules, layouts, restrictions, etc.
- If the document has photography guidelines, extract dos and donts as arrays.
- If there are logo usage rules, capture clear space, minimum size, placement, and approved backgrounds.
- Extract actual hex color codes; for named colors, convert to hex.
- For fonts, extract the actual font names used.
- Select mood_keywords and tone_keywords from what the document actually states.
- Return ONLY valid JSON, no markdown or explanation.`;

    const userContent = isImage
      ? [
          { type: "text", text: "Analyze this brand guide image comprehensively. Extract ALL sections: colors, typography, voice, photography rules, logo usage, layouts, restrictions, social handles, and any other brand guidelines visible:" },
          { type: "image_url", image_url: { url: fileBase64 } },
        ]
      : [
          { type: "text", text: `Analyze this brand guide document (${fileName}) comprehensively. Extract ALL sections you can find: colors, typography, voice/tone, photography guidelines, logo usage rules, layout preferences, restrictions, social handles, and any other brand information:` },
          { type: "image_url", image_url: { url: fileBase64 } },
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 4000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);

      if (response.status === 429) {
        return json(429, { error: "Rate limit exceeded. Please try again later." });
      }
      if (response.status === 402) {
        return json(402, { error: "Payment required. Please add credits." });
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || "";

    let extractedStyle: Record<string, unknown> = {};
    try {
      extractedStyle = JSON.parse(cleanJsonFromAI(aiContent));

      // Validate hex colors
      extractedStyle.primary_color = validateHex(extractedStyle.primary_color as string);
      extractedStyle.secondary_color = validateHex(extractedStyle.secondary_color as string);
      extractedStyle.accent_color = validateHex(extractedStyle.accent_color as string);

      if (Array.isArray(extractedStyle.color_palette)) {
        extractedStyle.color_palette = (extractedStyle.color_palette as Array<{ hex: string; name: string }>)
          .filter((c) => c.hex && hexRegex.test(c.hex) && c.name);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      extractedStyle = {};
    }

    // Count how many sections were extracted for reporting
    const sectionCount = Object.keys(extractedStyle).filter(
      (k) => extractedStyle[k] !== undefined && extractedStyle[k] !== null
    ).length;

    console.log(`Extracted ${sectionCount} brand guide sections`);

    return json(200, {
      success: true,
      extractedStyle,
      sectionsExtracted: sectionCount,
      rawResponse: aiContent,
    });
  } catch (error: unknown) {
    console.error("Error analyzing brand guide:", error);
    return json(500, {
      error: error instanceof Error ? error.message : "Failed to analyze brand guide",
    });
  }
});
