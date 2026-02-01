/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // BrandHub integration is not yet configured.
    // IMPORTANT: return 200 so the web client doesn't treat this as a hard runtime failure.
    // The UI should rely on `setupRequired: true` to show a friendly message.
    return new Response(
      JSON.stringify({
        setupRequired: true,
        message:
          "BrandHub Creator import is not yet available in this project. Please create your brand manually using the brand editor or import a brand guide PDF/image.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error: unknown) {
    console.error("Error in fetch-brandhub-brand:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
