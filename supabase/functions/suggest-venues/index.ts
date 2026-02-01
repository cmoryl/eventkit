import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VenueSuggestion {
  name: string;
  city: string;
  country: string;
  type: string;
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

    const { query, eventType } = await req.json();

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Suggesting venues for query: "${query}"${eventType ? ` (event type: ${eventType})` : ''}`);

    const prompt = `You are a venue expert. Based on the partial search query "${query}", suggest up to 6 real, well-known venues, convention centers, hotels, or event spaces that match this search.

${eventType ? `The user is planning a ${eventType} event.` : ''}

Consider:
- Famous convention centers (Javits Center, McCormick Place, etc.)
- Major hotels with event spaces (Marriott, Hilton, etc.)
- Conference venues
- Unique event spaces
- International venues if the query suggests a location

Respond with ONLY a JSON array of venue suggestions. Each suggestion should have:
- name: Full venue name
- city: City name
- country: Country code (e.g., "USA", "UK", "Germany")
- type: Venue type (e.g., "Convention Center", "Hotel", "Conference Center", "Arena", "Historic Venue")

Example response:
[
  {"name": "Javits Center", "city": "New York", "country": "USA", "type": "Convention Center"},
  {"name": "Jacob K. Javits Convention Center", "city": "New York", "country": "USA", "type": "Convention Center"}
]

Return at most 6 suggestions. If no relevant venues match, return an empty array [].`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ suggestions: [], error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    // Extract JSON array from response
    let suggestions: VenueSuggestion[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse venue suggestions:', e);
    }

    // Limit to 6 suggestions and validate structure
    suggestions = suggestions
      .filter((s: VenueSuggestion) => s.name && s.city)
      .slice(0, 6);

    console.log(`Returning ${suggestions.length} venue suggestions`);

    return new Response(
      JSON.stringify({ suggestions }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("suggest-venues error:", error);
    return new Response(
      JSON.stringify({ suggestions: [], error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
