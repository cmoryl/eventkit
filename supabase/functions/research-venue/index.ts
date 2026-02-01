import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VenueResearchRequest {
  venueName: string;
  city?: string;
  eventType?: string;
}

interface VenueIntelligence {
  name: string;
  fullAddress?: string;
  city?: string;
  country?: string;
  capacity?: string;
  venueType?: string;
  description?: string;
  amenities?: string[];
  parkingInfo?: string;
  accessibilityInfo?: string;
  cateringOptions?: string;
  technicalSpecs?: string;
  website?: string;
  phone?: string;
  priceRange?: string;
  bestFor?: string[];
  nearbyHotels?: string[];
  localTips?: string;
  culturalContext?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: VenueResearchRequest = await req.json();
    const { venueName, city, eventType } = body;

    if (!venueName || venueName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Venue name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Researching venue: ${venueName}${city ? ` in ${city}` : ''}`);

    const searchQuery = city ? `${venueName}, ${city}` : venueName;

    // Use Lovable AI to research the venue
    const researchPrompt = `You are a venue research specialist. Research and provide detailed information about this event venue:

Venue: "${searchQuery}"
${eventType ? `Event Type: ${eventType}` : ''}

Provide comprehensive venue intelligence in the following JSON format. Be accurate and specific. If you don't have verified information for a field, use null.

{
  "name": "Official venue name",
  "fullAddress": "Complete street address",
  "city": "City name",
  "country": "Country name",
  "capacity": "Capacity range (e.g., '500-2000 guests')",
  "venueType": "Type of venue (e.g., 'Convention Center', 'Hotel Ballroom', 'Historic Theater')",
  "description": "2-3 sentence description of the venue and its character",
  "amenities": ["List", "of", "key", "amenities"],
  "parkingInfo": "Parking availability and options",
  "accessibilityInfo": "Wheelchair access, elevators, etc.",
  "cateringOptions": "In-house catering, preferred vendors, or outside catering allowed",
  "technicalSpecs": "AV equipment, staging, power capacity",
  "website": "Official website URL if known",
  "phone": "Contact phone if known",
  "priceRange": "Estimated price range (e.g., '$$$' or '$5,000-$15,000')",
  "bestFor": ["Types", "of", "events", "best", "suited"],
  "nearbyHotels": ["2-3 nearby hotel names"],
  "localTips": "Local insight about the venue or area",
  "culturalContext": "Cultural or historical significance of the location for event design"
}

Respond with ONLY the JSON object, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: researchPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI research failed:", response.status, errorText);
      
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
      
      throw new Error(`Research failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No research data returned");
    }

    // Parse the JSON response
    let venueIntelligence: VenueIntelligence;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        venueIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse venue data:", parseError, content);
      // Return basic info if parsing fails
      venueIntelligence = {
        name: venueName,
        city: city,
        description: content.substring(0, 500),
      };
    }

    console.log("Successfully researched venue:", venueIntelligence.name);

    return new Response(
      JSON.stringify({
        success: true,
        venue: venueIntelligence,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("research-venue error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
