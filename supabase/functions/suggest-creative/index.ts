import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventContext {
  name: string;
  description?: string;
  eventType?: string;
  date?: string;
  location?: string;
  audienceSize?: number;
  existingAssets?: string[];
}

interface BrandContext {
  brandName?: string;
  archetype?: string;
  industry?: string;
  targetAudience?: string;
  moodKeywords?: string[];
  colorPalette?: string[];
  tagline?: string;
}

interface SuggestionRequest {
  type: 'asset_recommendations' | 'design_variations';
  eventContext: EventContext;
  brandContext?: BrandContext;
  currentAssetType?: string;
  currentDesignDescription?: string;
}

interface AssetRecommendation {
  assetType: string;
  priority: 'essential' | 'recommended' | 'nice_to_have';
  reason: string;
  designHint?: string;
}

interface DesignVariation {
  name: string;
  description: string;
  styleDifference: string;
  moodKeywords: string[];
  colorSuggestion?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    const { type, eventContext, brandContext, currentAssetType, currentDesignDescription } = reqBody as SuggestionRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let userPrompt: string;
    let tools: any[];
    let toolChoice: any;

    if (type === 'asset_recommendations') {
      systemPrompt = `You are an expert event design consultant who recommends event assets and collateral. 
You understand event types deeply and know which assets create the best attendee experience.
Consider the event type, audience, venue, and brand personality when making recommendations.
Focus on practical, high-impact assets that professional event planners would use.`;

      userPrompt = `Analyze this event and recommend the most impactful design assets:

EVENT DETAILS:
- Name: ${eventContext.name}
- Type: ${eventContext.eventType || 'conference'}
- Description: ${eventContext.description || 'Professional event'}
- Date: ${eventContext.date || 'TBD'}
- Location: ${eventContext.location || 'TBD'}
- Expected Audience: ${eventContext.audienceSize || 'Unknown'} attendees

${brandContext ? `BRAND CONTEXT:
- Brand: ${brandContext.brandName || 'Generic'}
- Archetype: ${brandContext.archetype || 'Professional'}
- Industry: ${brandContext.industry || 'Business'}
- Target Audience: ${brandContext.targetAudience || 'Professionals'}
- Mood: ${brandContext.moodKeywords?.join(', ') || 'Modern, professional'}` : ''}

${eventContext.existingAssets?.length ? `ALREADY CREATED: ${eventContext.existingAssets.join(', ')}` : 'No assets created yet.'}

Recommend 5-8 assets that would make this event more impactful and professional. Consider venue signage, attendee materials, digital presence, and brand touchpoints.`;

      tools = [{
        type: "function",
        function: {
          name: "suggest_assets",
          description: "Recommend event assets based on context",
          parameters: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    assetType: { 
                      type: "string",
                      description: "Asset type identifier (e.g., 'banner', 'name_tag', 'social_post', 'step_repeat', 'table_tent', 'lanyard', 'swag_bag', 'wifi_sign', 'room_signage', 'floor_decal', 'menu', 'ticket', 'program_booklet')"
                    },
                    priority: { 
                      type: "string", 
                      enum: ["essential", "recommended", "nice_to_have"] 
                    },
                    reason: { 
                      type: "string",
                      description: "Why this asset is valuable for this specific event"
                    },
                    designHint: { 
                      type: "string",
                      description: "Brief creative direction for this asset"
                    }
                  },
                  required: ["assetType", "priority", "reason"]
                }
              },
              overallStrategy: {
                type: "string",
                description: "Brief summary of the recommended design strategy for this event"
              }
            },
            required: ["recommendations", "overallStrategy"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "suggest_assets" } };

    } else if (type === 'design_variations') {
      systemPrompt = `You are a creative director who proposes design variations and alternative concepts.
You understand design principles, brand expression, and how to create distinctly different visual approaches.
Each variation should be genuinely different, not just minor tweaks.`;

      userPrompt = `Create 4 distinct design variation concepts for this asset:

ASSET TYPE: ${currentAssetType || 'marketing material'}
CURRENT DESIGN: ${currentDesignDescription || 'Modern professional style'}

EVENT: ${eventContext.name} (${eventContext.eventType || 'conference'})
${eventContext.description ? `ABOUT: ${eventContext.description}` : ''}

${brandContext ? `BRAND MOOD: ${brandContext.moodKeywords?.join(', ') || 'Professional'}
BRAND COLORS: ${brandContext.colorPalette?.join(', ') || 'Brand colors'}` : ''}

Generate 4 distinctly different design approaches. Each should have a unique visual identity while still being appropriate for the event.`;

      tools = [{
        type: "function",
        function: {
          name: "suggest_variations",
          description: "Propose design variation concepts",
          parameters: {
            type: "object",
            properties: {
              variations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { 
                      type: "string",
                      description: "Short, evocative name for this variation (e.g., 'Bold & Vibrant', 'Minimalist Elegance')"
                    },
                    description: { 
                      type: "string",
                      description: "Full description of the design approach"
                    },
                    styleDifference: { 
                      type: "string",
                      description: "Key visual difference from the current design"
                    },
                    moodKeywords: { 
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 mood/style keywords"
                    },
                    colorSuggestion: { 
                      type: "string",
                      description: "Optional color direction or palette tweak"
                    }
                  },
                  required: ["name", "description", "styleDifference", "moodKeywords"]
                }
              }
            },
            required: ["variations"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "suggest_variations" } };

    } else if (type === 'master_style_direction') {
      // Master style direction for visual consistency across an event kit
      const body = await req.clone().json();
      const prompt = body.prompt || '';
      
      systemPrompt = `You are a world-class creative director. You create unified visual direction documents that ensure all assets in an event design kit share a cohesive look and feel. Respond ONLY with the requested JSON format.`;
      userPrompt = prompt;
      
      // Use simple completion (no tools) and return the raw text for parsing client-side
      const directResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
        }),
      });

      if (!directResponse.ok) {
        const errText = await directResponse.text();
        console.error("AI gateway error for master_style_direction:", directResponse.status, errText);
        throw new Error(`AI gateway error: ${directResponse.status}`);
      }

      const directData = await directResponse.json();
      const suggestion = directData.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({
        success: true,
        type,
        result: suggestion,
        suggestion,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      throw new Error(`Unknown suggestion type: ${type}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools,
        tool_choice: toolChoice
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          code: "RATE_LIMITED"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please add funds to continue.",
          code: "PAYMENT_REQUIRED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No suggestions generated");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      success: true,
      type,
      ...result
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Suggestion error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate suggestions",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
