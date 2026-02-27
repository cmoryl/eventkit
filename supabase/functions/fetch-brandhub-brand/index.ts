import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDHUB_API_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/functions/v1/get-shared-brand";

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
    const { shareToken, includeEvent } = await req.json();

    if (!shareToken) {
      return json(200, { success: false, error: "Share token is required" });
    }

    console.log("Fetching brand from BrandHub with token:", shareToken);

    // Call BrandHub's get-shared-brand endpoint
    const response = await fetch(BRANDHUB_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareToken, includeEvent: includeEvent ?? true }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("BrandHub API error:", response.status, data);
      return json(200, {
        success: false,
        error: data.error || "Failed to fetch brand from BrandHub",
        status: response.status,
      });
    }

    console.log("Successfully fetched brand from BrandHub:", data.brand?.name);

    // Extract event data if available (BrandHub Creator stores event info alongside brand)
    const brandData = data.brand || {};
    const guideData = (brandData.guide_data || {}) as Record<string, unknown>;

    // Try to extract event details from BrandHub data
    const eventData = extractEventDetails(brandData, guideData);

    return json(200, {
      success: true,
      brand: brandData,
      event: eventData,
      hasEventData: !!(eventData.name || eventData.date || eventData.venue),
    });
  } catch (error) {
    console.error("Error fetching BrandHub brand:", error);
    return json(200, {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * Extract event details from BrandHub brand data.
 * BrandHub Creator stores event context in various places.
 */
function extractEventDetails(
  brandData: Record<string, unknown>,
  guideData: Record<string, unknown>
): Record<string, unknown> {
  const heroData = (guideData.hero || {}) as Record<string, unknown>;

  // Event name — try multiple sources
  const name =
    brandData.event_name ||
    brandData.eventName ||
    guideData.eventName ||
    heroData.eventName ||
    brandData.name; // fallback to brand name

  // Event description
  const description =
    brandData.event_description ||
    brandData.eventDescription ||
    guideData.eventDescription ||
    heroData.subtitle ||
    heroData.description ||
    brandData.description;

  // Event date
  const date =
    brandData.event_date ||
    brandData.eventDate ||
    guideData.eventDate;

  // Event type
  const eventType =
    brandData.event_type ||
    brandData.eventType ||
    guideData.eventType ||
    guideData.category;

  // Venue info
  const venueData = (guideData.venue || brandData.venue || {}) as Record<string, unknown>;
  const venue = venueData.name || brandData.venue_name || brandData.venueName;
  const venueAddress = venueData.address || brandData.venue_address;
  const venueCity = venueData.city || brandData.venue_city || brandData.location;

  // Sponsors
  const sponsors = (
    brandData.sponsors ||
    guideData.sponsors ||
    []
  ) as Array<Record<string, unknown>>;

  // Attendee count / capacity
  const attendeeCount =
    brandData.attendee_count ||
    brandData.attendeeCount ||
    guideData.attendeeCount;

  // Tagline from hero
  const tagline = heroData.tagline || brandData.tagline;

  return {
    name,
    description,
    date,
    eventType,
    venue,
    venueAddress,
    venueCity,
    sponsors: sponsors.length > 0 ? sponsors : undefined,
    attendeeCount,
    tagline,
  };
}
