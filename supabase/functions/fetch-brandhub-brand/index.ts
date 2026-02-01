/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// BrandHub Creator's Supabase project URL
// This will need to be updated with the actual BrandHub Creator project URL
const BRANDHUB_API_URL = "https://api.brandhubcreator.lovable.app";

interface BrandHubBrand {
  name?: string;
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
  pattern_style?: string;
  brand_voice?: string[];
  logo_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken } = await req.json();

    if (!shareToken) {
      return new Response(
        JSON.stringify({ error: "Share token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching brand from BrandHub with token:", shareToken);

    // Try to fetch from BrandHub Creator's public share endpoint
    // BrandHub Creator needs to have an endpoint like: /functions/v1/get-shared-brand
    const brandHubResponse = await fetch(`${BRANDHUB_API_URL}/functions/v1/get-shared-brand`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareToken }),
    });

    if (!brandHubResponse.ok) {
      // If the endpoint doesn't exist yet, provide helpful error
      if (brandHubResponse.status === 404) {
        return new Response(
          JSON.stringify({ 
            error: "BrandHub Creator share endpoint not found. Please ensure the share feature is enabled in BrandHub Creator.",
            setupRequired: true
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await brandHubResponse.text();
      console.error("BrandHub API error:", brandHubResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch brand from BrandHub" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brandData = await brandHubResponse.json();
    
    // Map and validate the brand data
    const brand: BrandHubBrand = {
      name: brandData.name || brandData.brand_name,
      primary_color: brandData.primary_color,
      secondary_color: brandData.secondary_color,
      accent_color: brandData.accent_color,
      color_palette: brandData.color_palette,
      heading_font: brandData.heading_font || brandData.headline_font,
      body_font: brandData.body_font || brandData.paragraph_font,
      mood_keywords: brandData.mood_keywords || brandData.brand_mood,
      imagery_style: brandData.imagery_style || brandData.visual_style,
      industry: brandData.industry,
      target_audience: brandData.target_audience,
      pattern_style: brandData.pattern_style,
      brand_voice: brandData.brand_voice || brandData.voice_tone,
      logo_url: brandData.logo_url,
    };

    console.log("Successfully fetched brand:", brand.name);

    return new Response(
      JSON.stringify({ success: true, brand }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error fetching from BrandHub:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch brand";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
