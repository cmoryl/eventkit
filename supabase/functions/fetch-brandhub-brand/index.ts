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
        JSON.stringify({ error: "Share token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("BrandHub import requested with token:", shareToken);

    // Proxy to BrandHub Creator (public share endpoint)
    // NOTE: Use the app host (not api.*) to avoid TLS handshake issues seen in some environments.
    const upstreamUrl = "https://brandhubcreator.lovable.app/functions/v1/get-shared-brand";

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareToken }),
    });

    const raw = await upstreamRes.text();
    let upstreamJson: unknown = null;
    try {
      upstreamJson = raw ? JSON.parse(raw) : null;
    } catch {
      upstreamJson = { raw };
    }

    // Always return 200 to the client so the UI can handle errors gracefully without a blank screen.
    if (!upstreamRes.ok) {
      console.warn("BrandHub upstream error", {
        status: upstreamRes.status,
        body: upstreamJson,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch shared brand from BrandHub Creator",
          upstreamStatus: upstreamRes.status,
          upstream: upstreamJson,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Common shapes we might receive:
    // - { brand: {...} }
    // - { data: { brand: {...} } }
    // - { ...brandFields }
    const asRecord = (v: unknown): Record<string, unknown> | null =>
      v && typeof v === "object" ? (v as Record<string, unknown>) : null;

    const r1 = asRecord(upstreamJson);
    const r2 = r1 ? asRecord(r1.data) : null;
    const brand = (r1 && asRecord(r1.brand)) || (r2 && asRecord(r2.brand)) || r1;

    return new Response(
      JSON.stringify({
        success: true,
        brand,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error: unknown) {
    console.error("Error in fetch-brandhub-brand:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    // Return 200 so the frontend can surface a toast instead of treating it as a fatal runtime error.
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
