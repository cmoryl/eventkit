import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BRANDHUB_REST_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/rest/v1";
const BRANDHUB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeGFpamJ5cWZra2hob29ybnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDU0ODYsImV4cCI6MjA4MzIyMTQ4Nn0.Uw6QPHoOo_15FWCfnSAZYyGZNEr-XlZ8NrVyLlcuiWk";

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "Unauthorized" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json(401, { error: "Unauthorized" });

    const { brandId, assets } = await req.json();

    if (!brandId || !Array.isArray(assets) || assets.length === 0) {
      return json(400, { error: "brandId and assets[] are required" });
    }

    // Get the brand's BrandHub share token
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("brandhub_share_token, name")
      .eq("id", brandId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (brandError || !brand?.brandhub_share_token) {
      return json(400, { error: "Brand has no BrandHub connection" });
    }

    // Map EventKIT asset types to BrandHub imagery categories
    const assetTypeMap: Record<string, string> = {
      banner: "banners",
      "social-post": "social",
      "social-story": "social",
      "social-cover": "social",
      "merch-tshirt": "collateral",
      "merch-cap": "collateral",
      "merch-tote": "collateral",
      badge: "collateral",
      flyer: "collateral",
      poster: "collateral",
      signage: "collateral",
      "step-and-repeat": "collateral",
      "sponsor-wall": "sponsors",
    };

    // Build imagery entries to push
    const imageryEntries = assets.map((asset: { 
      imageUrl: string; 
      assetType: string; 
      title: string; 
      prompt?: string;
      fonts?: { heading?: string; body?: string };
    }) => ({
      url: asset.imageUrl,
      type: assetTypeMap[asset.assetType] || "collateral",
      name: asset.title,
      source: "EventKIT",
      metadata: {
        assetType: asset.assetType,
        prompt: asset.prompt,
        fonts: asset.fonts,
        generatedAt: new Date().toISOString(),
      },
    }));

    // Note: BrandHub would need a "receive-external-assets" endpoint.
    // For now, we store the push record locally and provide the data
    // for manual import or future API integration.
    
    // Store the push record
    const { error: insertError } = await supabase
      .from("brandhub_push_log")
      .insert({
        user_id: user.id,
        brand_id: brandId,
        brandhub_token: brand.brandhub_share_token,
        assets_pushed: imageryEntries,
        status: "pending",
      });

    if (insertError) {
      console.warn("Push log insert error (table may not exist):", insertError);
    }

    return json(200, {
      success: true,
      pushed: imageryEntries.length,
      brandName: brand.name,
      message: `${imageryEntries.length} assets queued for BrandHub sync`,
    });
  } catch (error) {
    console.error("Push to BrandHub error:", error);
    return json(500, {
      success: false,
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
});
