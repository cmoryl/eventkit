import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { search, limit = 20, offset = 0 } = await req.json();

    const headers = {
      apikey: BRANDHUB_ANON_KEY,
      Authorization: `Bearer ${BRANDHUB_ANON_KEY}`,
      "Content-Type": "application/json",
    };

    // Build query params — only public brands with share tokens
    let query = `${BRANDHUB_REST_URL}/brands?is_public=eq.true&share_token=not.is.null&select=id,name,slug,share_token,guide_data,updated_at&order=updated_at.desc&limit=${limit}&offset=${offset}`;

    if (search && typeof search === "string" && search.trim()) {
      query += `&name=ilike.*${encodeURIComponent(search.trim())}*`;
    }

    const brandsRes = await fetch(query, { headers });

    if (!brandsRes.ok) {
      console.error("BrandHub browse error:", brandsRes.status);
      return json(200, { success: false, brands: [], error: "Failed to browse brands" });
    }

    const brands = await brandsRes.json();

    // Also fetch public events
    let eventsQuery = `${BRANDHUB_REST_URL}/events?is_public=eq.true&select=id,name,slug,guide_data,updated_at&order=updated_at.desc&limit=${limit}&offset=${offset}`;
    if (search && typeof search === "string" && search.trim()) {
      eventsQuery += `&name=ilike.*${encodeURIComponent(search.trim())}*`;
    }

    const eventsRes = await fetch(eventsQuery, { headers });
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Map to compact card data
    const brandCards = (Array.isArray(brands) ? brands : []).map((b: Record<string, unknown>) => {
      const guideData = (b.guide_data as Record<string, unknown>) || {};
      const hero = (guideData.hero as Record<string, unknown>) || {};
      const colors = Array.isArray(guideData.colors) ? guideData.colors : [];

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        shareToken: b.share_token,
        type: "brand" as const,
        logoUrl: hero.logoUrl || null,
        coverImage: hero.coverImage || null,
        colors: colors.slice(0, 5).map((c: Record<string, unknown>) => c.hex),
        updatedAt: b.updated_at,
      };
    });

    const eventCards = (Array.isArray(events) ? events : []).map((e: Record<string, unknown>) => {
      const guideData = (e.guide_data as Record<string, unknown>) || {};
      const hero = (guideData.hero as Record<string, unknown>) || {};
      const colors = Array.isArray(guideData.colors) ? guideData.colors : [];

      return {
        id: e.id,
        name: e.name,
        slug: e.slug,
        shareToken: null, // Events use slug-based import
        type: "event" as const,
        logoUrl: hero.logoUrl || null,
        coverImage: hero.coverImage || null,
        colors: colors.slice(0, 5).map((c: Record<string, unknown>) => c.hex),
        updatedAt: e.updated_at,
      };
    });

    return json(200, {
      success: true,
      brands: [...brandCards, ...eventCards],
      total: brandCards.length + eventCards.length,
    });
  } catch (error) {
    console.error("Browse BrandHub error:", error);
    return json(200, {
      success: false,
      brands: [],
      error: error instanceof Error ? error.message : "Internal error",
    });
  }
});
