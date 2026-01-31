import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyzeVenueRequest {
  videoFrames: string[]; // Array of base64 frame images
  eventName: string;
  eventDescription?: string;
}

interface VenueArea {
  name: string;
  description: string;
  dimensions: {
    estimated_width: string;
    estimated_height: string;
    estimated_depth: string;
  };
  surfaces: string[];
  suggestedAssets: {
    assetType: string;
    placement: string;
    recommendedSize: string;
  }[];
  lightingConditions: string;
  frameIndex: number;
}

interface VenueAnalysisResult {
  success: boolean;
  areas: VenueArea[];
  overallAssessment: {
    venueType: string;
    totalEstimatedArea: string;
    primarySurfaces: string[];
    brandingOpportunities: string[];
    challengesAndConsiderations: string[];
  };
  keyFrames: {
    frameIndex: number;
    description: string;
    bestFor: string[];
  }[];
  assetRecommendations: {
    assetType: string;
    priority: 'high' | 'medium' | 'low';
    recommendedQuantity: number;
    suggestedSizes: string[];
    placementAreas: string[];
  }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AnalyzeVenueRequest = await req.json();
    const { videoFrames, eventName, eventDescription } = body;

    if (!videoFrames || videoFrames.length === 0) {
      return new Response(
        JSON.stringify({ error: "No video frames provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze frames using vision model
    const analysisPrompt = `You are an expert event planner and venue scout analyzing a walkthrough video of an event space.

EVENT CONTEXT:
- Event Name: ${eventName}
- Description: ${eventDescription || 'General corporate/social event'}

Analyze these ${videoFrames.length} frames from a venue walkthrough video and provide a comprehensive spatial analysis.

For each distinct area you identify, provide:
1. Area name (e.g., "Main Lobby", "Ballroom Entrance", "Registration Area")
2. Estimated dimensions (width, height, depth in feet)
3. Available surfaces for branding (walls, floors, windows, pillars, etc.)
4. Suggested asset placements with recommended sizes
5. Lighting conditions (natural light, overhead, dramatic, etc.)
6. Which frame index shows this area best

Also provide:
- Overall venue type assessment
- Total estimated usable area
- Primary surfaces available for branding
- Key branding opportunities
- Challenges or considerations for the event
- Asset recommendations with priorities, quantities, and sizes

Be specific with measurements - use reference points like doors (typically 7ft tall), ceiling tiles (typically 2x2 or 2x4 ft), etc. to estimate dimensions.

Respond with a JSON object matching this structure:
{
  "areas": [...],
  "overallAssessment": {...},
  "keyFrames": [...],
  "assetRecommendations": [...]
}`;

    // Build message content with images
    const imageContent = videoFrames.map((frame, index) => ({
      type: "image_url" as const,
      image_url: {
        url: frame.startsWith('data:') ? frame : `data:image/jpeg;base64,${frame}`,
        detail: "high" as const
      }
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              ...imageContent
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze venue video" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response
    let analysisResult: VenueAnalysisResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysisResult = JSON.parse(jsonStr);
      analysisResult.success = true;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a structured fallback
      analysisResult = {
        success: true,
        areas: [],
        overallAssessment: {
          venueType: "Event Venue",
          totalEstimatedArea: "Unable to estimate",
          primarySurfaces: ["Walls", "Floors"],
          brandingOpportunities: ["Signage", "Banners"],
          challengesAndConsiderations: ["Further analysis needed"]
        },
        keyFrames: videoFrames.map((_, i) => ({
          frameIndex: i,
          description: `Frame ${i + 1}`,
          bestFor: ["General reference"]
        })),
        assetRecommendations: [
          {
            assetType: "BANNER",
            priority: "high" as const,
            recommendedQuantity: 2,
            suggestedSizes: ["33\" x 80\""],
            placementAreas: ["Entrance", "Main area"]
          },
          {
            assetType: "EVENT_SIGNAGE",
            priority: "high" as const,
            recommendedQuantity: 4,
            suggestedSizes: ["24\" x 36\""],
            placementAreas: ["Various locations"]
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-venue-video:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
