/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken } = await req.json();

    if (!shareToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Share token is required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("BrandHub import requested with token:", shareToken);

    // Fetch the share page - it's server-side rendered with brand data visible
    const sharePageUrl = `https://brandhubcreator.lovable.app/share/${shareToken}`;
    
    // Use a service that can render JavaScript and return the final HTML
    // We'll use a simple fetch with a browser-like user agent to get SSR content
    const pageRes = await fetch(sharePageUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!pageRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch share page: ${pageRes.status}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await pageRes.text();

    // The share page is a client-side SPA, so we can't scrape it directly.
    // However, BrandHub stores brand data in OG meta tags for SEO.
    // Let's extract what we can from meta tags and any embedded JSON.

    // Extract OG title (brand name)
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                         html.match(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i);
    const brandName = ogTitleMatch?.[1] || "Imported Brand";

    // Extract OG description (tagline)
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                        html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const tagline = ogDescMatch?.[1];

    // Extract OG image (logo)
    const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const logoUrl = ogImageMatch?.[1];

    // Look for any embedded JSON data (some SPAs embed initial state)
    const jsonStateMatch = html.match(/<script[^>]*>window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})<\/script>/i) ||
                           html.match(/<script[^>]*>window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?})<\/script>/i);
    
    let embeddedBrand: Record<string, unknown> = {};
    if (jsonStateMatch) {
      try {
        embeddedBrand = JSON.parse(jsonStateMatch[1]);
      } catch {
        // Ignore parse errors
      }
    }

    // Since BrandHub is a client-side app, we can't easily scrape the full brand data.
    // Return what we can extract from meta tags plus a message about limitations.
    
    // If we got basically nothing, indicate the integration limitation
    if (brandName === "BrandHub" || brandName === "Imported Brand") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "BrandHub Creator uses client-side rendering, which prevents automatic data extraction. Please export your brand as a PDF from BrandHub and use the 'Upload Brand Guide' feature instead.",
          suggestion: "Download your brand guide PDF from BrandHub Creator and upload it here for AI-powered extraction.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // We at least got a brand name from OG tags
    const brand = {
      name: brandName,
      tagline: tagline || undefined,
      logo_url: logoUrl || undefined,
      // These would need to be extracted from the actual rendered page
      // which requires a headless browser - suggest PDF upload instead
      primary_color: undefined,
      secondary_color: undefined,
      accent_color: undefined,
      color_palette: undefined,
      heading_font: undefined,
      body_font: undefined,
      ...embeddedBrand,
    };

    return new Response(
      JSON.stringify({
        success: true,
        brand,
        partial: true,
        message: "Only basic brand info could be extracted. For complete brand data (colors, fonts), please export as PDF from BrandHub and upload it.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in fetch-brandhub-brand:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
