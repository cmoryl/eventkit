import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParseTemplateRequest {
  fileBase64: string;
  fileName: string;
  mimeType: string;
}

interface PrintTemplateSpecs {
  width: number;
  height: number;
  unit: 'in' | 'mm' | 'px';
  bleed: number;
  safeZone: number;
  trimLine?: { offset: number; visible: boolean };
  resolution: number;
  colorMode: 'CMYK' | 'RGB' | 'Grayscale' | 'Spot';
  colorProfile?: string;
  dieLine?: { detected: boolean; path?: string; description?: string };
  foldLines?: { positions: number[]; type: 'valley' | 'mountain' | 'mixed' };
  perforationLines?: { positions: number[]; direction: 'horizontal' | 'vertical' };
  confidenceScore?: number;
  extractionNotes?: string[];
}

const EXTRACTION_PROMPT = `You are a print production expert. Analyze this PDF template and extract the exact specifications.

Look for and extract:
1. **Document Dimensions**: Total page size in inches (width × height)
2. **Bleed Area**: The distance from trim edge to document edge (usually shown in cyan/light blue)
3. **Safe Zone/Margin**: Distance from trim edge inward where text/logos should stay (usually shown in magenta/pink)
4. **Trim Line**: The actual cut line (usually shown as crop marks or solid line)
5. **Resolution**: Any DPI/PPI specifications mentioned (default to 300 if not specified)
6. **Color Mode**: CMYK, RGB, or other color specifications
7. **Die Lines**: Any custom cut shapes (irregular shapes, rounded corners, special cuts)
8. **Fold Lines**: Score/fold lines with positions (common in brochures, packaging)
9. **Perforation Lines**: Tear-off perforations with positions

Return a JSON object with this exact structure:
{
  "width": <number in inches>,
  "height": <number in inches>,
  "unit": "in",
  "bleed": <number in inches, typically 0.125>,
  "safeZone": <number in inches, typically 0.125-0.25>,
  "trimLine": { "offset": <number>, "visible": <boolean> },
  "resolution": <number, default 300>,
  "colorMode": "<CMYK|RGB|Grayscale|Spot>",
  "colorProfile": "<profile name if specified>",
  "dieLine": { "detected": <boolean>, "description": "<description of die cut shape>" },
  "foldLines": { "positions": [<inches from left>], "type": "<valley|mountain|mixed>" },
  "perforationLines": { "positions": [<inches>], "direction": "<horizontal|vertical>" },
  "confidenceScore": <0-100>,
  "extractionNotes": ["<any observations or warnings>"]
}

Important:
- Measure from visible guides, marks, or specified dimensions
- If bleed is shown as a colored area, measure its width
- Common bleed sizes: 0.125" (1/8"), 0.25" (1/4")
- Common safe zones: 0.125" - 0.5"
- If no die lines are visible, set dieLine.detected to false
- Include extraction notes for anything uncertain

Return ONLY the JSON object, no additional text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: ParseTemplateRequest = await req.json();
    const { fileBase64, fileName, mimeType } = body;

    if (!fileBase64) {
      throw new Error("No file data provided");
    }

    console.log(`Parsing template: ${fileName} (${mimeType})`);

    // Use Gemini to analyze the PDF/image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
              {
                type: "image_url",
                image_url: {
                  url: fileBase64.startsWith('data:') ? fileBase64 : `data:${mimeType};base64,${fileBase64}`,
                },
              },
            ],
          },
        ],
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
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI analysis");
    }

    console.log("AI response:", content.substring(0, 500));

    // Parse the JSON response
    let specs: PrintTemplateSpecs;
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      specs = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return default specs with low confidence
      specs = {
        width: 8.5,
        height: 11,
        unit: 'in',
        bleed: 0.125,
        safeZone: 0.25,
        resolution: 300,
        colorMode: 'CMYK',
        confidenceScore: 20,
        extractionNotes: [
          "Could not extract specs from template - using defaults",
          "Please verify dimensions manually"
        ]
      };
    }

    // Validate and sanitize specs
    specs.width = Math.max(0.5, Math.min(100, specs.width || 8.5));
    specs.height = Math.max(0.5, Math.min(100, specs.height || 11));
    specs.bleed = Math.max(0, Math.min(2, specs.bleed || 0.125));
    specs.safeZone = Math.max(0, Math.min(2, specs.safeZone || 0.25));
    specs.resolution = Math.max(72, Math.min(600, specs.resolution || 300));
    specs.unit = specs.unit || 'in';
    specs.colorMode = specs.colorMode || 'CMYK';

    console.log(`Successfully extracted specs: ${specs.width}" × ${specs.height}" with ${specs.bleed}" bleed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        specs,
        message: `Extracted specifications: ${specs.width}" × ${specs.height}" at ${specs.resolution} DPI`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-template error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
