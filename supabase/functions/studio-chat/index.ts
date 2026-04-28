import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface StudioChatRequest {
  messages: ChatMessage[];
  referenceImages?: string[];
  studioType: string;
  action: "analyze" | "chat";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body: StudioChatRequest = await req.json();
    const { messages, referenceImages, studioType, action } = body;

    const systemPrompt = action === "analyze"
      ? `You are an expert visual design analyst for the "${studioType}" studio. The user has uploaded reference images they want to incorporate into their event design assets.

Analyze each uploaded image in detail and extract:
1. **Color Palette** — List 5-8 dominant hex colors
2. **Design Style** — Modern, vintage, minimalist, maximalist, organic, geometric, etc.
3. **Mood & Atmosphere** — The emotional feel (luxurious, playful, corporate, etc.)
4. **Key Visual Elements** — Patterns, textures, typography styles, imagery themes
5. **Composition Insights** — Layout tendencies, spacing, visual weight
6. **How to Recreate** — Specific, actionable prompts/instructions for AI image generation that would reproduce this style

Format your response with clear sections using markdown headers. Be specific and actionable — these insights will drive asset generation. End with a "## Ready to Generate" section summarizing the extracted style profile in 2-3 sentences.`
      : `You are a creative design assistant for the "${studioType}" studio. You've already analyzed the user's reference images and are helping them fine-tune the design direction for their event assets.

You can:
- Adjust colors, moods, typography suggestions
- Suggest how to blend multiple reference styles
- Recommend which assets would best showcase the style
- Modify the generation prompt/direction based on feedback
- Provide specific prompt enhancements for AI generation

Be concise, creative, and actionable. When the user asks for changes, provide the updated style profile or generation guidance clearly.`;

    // Build messages array with images for analysis
    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (action === "analyze" && referenceImages?.length) {
      // First message includes all reference images
      const imageContent: any[] = [
        { type: "text", text: `Analyze these ${referenceImages.length} reference image(s) that I want to use as inspiration for my ${studioType} event design assets. Extract the complete style profile.` }
      ];
      for (const img of referenceImages) {
        imageContent.push({
          type: "image_url",
          image_url: { url: img }
        });
      }
      aiMessages.push({ role: "user", content: imageContent });
    }

    // Add conversation history
    for (const msg of messages) {
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("studio-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
