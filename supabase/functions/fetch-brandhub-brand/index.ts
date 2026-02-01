/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDHUB_API_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/functions/v1/get-shared-brand";

Deno.serve(async (req) => {
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

    console.log("Fetching brand from BrandHub with token:", shareToken);

    // Call BrandHub's get-shared-brand endpoint
    const response = await fetch(BRANDHUB_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("BrandHub API error:", response.status, data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error || "Failed to fetch brand from BrandHub",
          status: response.status 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully fetched brand from BrandHub:", data.brand?.name);

    // Return the brand data for EventKIT to use
    return new Response(
      JSON.stringify({ success: true, ...data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching BrandHub brand:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
