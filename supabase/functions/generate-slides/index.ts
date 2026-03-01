import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GOOGLE_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { topic, slideCount = 6, brandContext, model, provider, googleApiKey } = await req.json();

    if (!topic || typeof topic !== "string") {
      return errorResponse("A topic description is required", 400);
    }

    const useGoogle = provider === "google" && googleApiKey;
    const selectedModel = model || "google/gemini-3-flash-preview";

    // For Google direct, map model names
    const googleModelMap: Record<string, string> = {
      "google/gemini-2.5-pro": "gemini-2.5-pro",
      "google/gemini-2.5-flash": "gemini-2.5-flash",
      "google/gemini-3-flash-preview": "gemini-2.5-flash",
      "google/gemini-3-pro-preview": "gemini-2.5-pro",
    };

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

    const tools = [
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
    ];

    const requestBody = {
      model: useGoogle ? (googleModelMap[selectedModel] || "gemini-2.5-flash") : selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a ${slideCount}-slide presentation about: ${topic}` },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "create_slide_deck" } },
    };

    let apiUrl: string;
    let headers: Record<string, string>;

    if (useGoogle) {
      apiUrl = GOOGLE_GEMINI_URL;
      headers = {
        Authorization: `Bearer ${googleApiKey}`,
        "Content-Type": "application/json",
      };
    } else {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return errorResponse("LOVABLE_API_KEY is not configured", 500);
      }
      apiUrl = LOVABLE_GATEWAY;
      headers = {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again in a moment.", 429);
      }
      if (response.status === 402) {
        return errorResponse("AI credits exhausted. Please add funds to continue.", 402);
      }
      if (response.status === 401 || response.status === 403) {
        return errorResponse("Invalid API key. Please check your Google API key.", 401);
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
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
