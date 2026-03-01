import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { topic, slideCount = 6, brandContext } = await req.json();

    if (!topic || typeof topic !== "string") {
      return errorResponse("A topic description is required", 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse("LOVABLE_API_KEY is not configured", 500);
    }

    const brandInfo = brandContext
      ? `\nBrand context: The presentation is for "${brandContext.name}". Use a professional tone aligned with this brand.`
      : "";

    const systemPrompt = `You are a professional presentation designer. Given a topic, generate a structured slide deck.
Each slide must have a layout, title, and content appropriate for that layout.
Available layouts: title, content, image-left, image-right, two-column, section, blank.
Available variants: default (light), dark, gradient.

Guidelines:
- Start with a "title" layout slide using "gradient" variant for the opening
- Use "section" layout for major topic transitions
- Use "content" layout for bullet-point slides
- Use "two-column" layout for comparisons or pros/cons
- End with a "section" layout for closing/thank-you
- Keep titles concise (under 8 words)
- Body text should use bullet points (lines starting with •)
- Generate exactly ${slideCount} slides${brandInfo}`;

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
          { role: "user", content: `Create a ${slideCount}-slide presentation about: ${topic}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_slide_deck",
              description: "Generate a structured slide deck with multiple slides",
              parameters: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        layout: {
                          type: "string",
                          enum: ["title", "content", "image-left", "image-right", "two-column", "section", "blank"],
                        },
                        title: { type: "string", description: "Slide title, concise and impactful" },
                        subtitle: { type: "string", description: "Optional subtitle for title/section slides" },
                        body: { type: "string", description: "Body text content, use bullet points with • character" },
                        notes: { type: "string", description: "Speaker notes for this slide" },
                        variant: {
                          type: "string",
                          enum: ["default", "dark", "gradient"],
                          description: "Visual theme variant",
                        },
                      },
                      required: ["layout", "title", "variant"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["slides"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_slide_deck" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again in a moment.", 429);
      }
      if (response.status === 402) {
        return errorResponse("AI credits exhausted. Please add funds to continue.", 402);
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return errorResponse("Failed to generate slides", 500);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return errorResponse("AI did not return structured slide data", 500);
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return jsonResponse({ slides: parsed.slides });
  } catch (e) {
    console.error("generate-slides error:", e);
    return errorResponse(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
