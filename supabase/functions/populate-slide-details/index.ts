// Populates a slide outline with richer details (designNotes, bullets/subtitle,
// visualIntent, optional chart data) using Lovable AI. Returns a partial patch
// that the client merges into the slide.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { deck, slide, slideIndex } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const deckSummary = `Deck title: ${deck?.title || "Untitled"}
Deck subtitle: ${deck?.subtitle || ""}
All slide titles (for context):
${(deck?.slides || []).map((s: any, i: number) => `  ${i + 1}. [${s.layout}] ${s.title}`).join("\n")}`;

    const slideSummary = `Slide #${(slideIndex ?? 0) + 1}
Layout: ${slide?.layout}
Title: ${slide?.title}
Existing subtitle: ${slide?.subtitle || "(none)"}
Existing bullets: ${(slide?.bullets || []).join(" | ") || "(none)"}
Existing notes: ${slide?.designNotes || "(none)"}`;

    const systemPrompt = `You are a senior presentation designer. Given the full deck context and a single slide, you ENRICH that slide with concrete content and visual guidance so a downstream AI can render a polished slide.

Rules:
- Stay strictly on the deck's topic and tone.
- Be specific and concrete — no fluff like "discuss things" or "key points".
- For 'bullets' layout: write 3-5 punchy bullets (max ~12 words each).
- For 'two_column' layout: write headings + 2-3 bullets per side.
- For 'stat' layout: pick a single bold value + short label.
- For 'quote' layout: write a tight quote (<= 25 words) + attribution.
- For 'section' / 'title' / 'closing': write a tight subtitle (<= 12 words).
- 'designNotes' should be 1-3 sentences guiding tone, must-haves, and visual mood.
- 'visualIntent' must be one of: auto, photo, infographic, chart, icon-grid, screenshot, none.
- Include 'chart' ONLY if visualIntent === "chart" — give realistic illustrative data with 3-7 points.
- NEVER fabricate company-specific stats unless the deck context implies them; if unsure, make it directional ("Q1", "Q2"...).`;

    const tool = {
      type: "function",
      function: {
        name: "populate_slide",
        description: "Return enriched fields for a single slide.",
        parameters: {
          type: "object",
          properties: {
            subtitle: { type: "string" },
            bullets: { type: "array", items: { type: "string" } },
            leftColumn: {
              type: "object",
              properties: {
                heading: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
              },
            },
            rightColumn: {
              type: "object",
              properties: {
                heading: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
              },
            },
            stat: {
              type: "object",
              properties: {
                value: { type: "string" },
                label: { type: "string" },
              },
            },
            quote: {
              type: "object",
              properties: {
                text: { type: "string" },
                attribution: { type: "string" },
              },
            },
            designNotes: { type: "string" },
            visualIntent: {
              type: "string",
              enum: ["auto", "photo", "infographic", "chart", "icon-grid", "screenshot", "none"],
            },
            chart: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["bar", "line", "pie", "donut", "area", "scatter"] },
                title: { type: "string" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "number" },
                    },
                    required: ["label", "value"],
                  },
                },
              },
            },
          },
          required: ["designNotes", "visualIntent"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${deckSummary}\n\n---\n\n${slideSummary}\n\nEnrich this slide.` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "populate_slide" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const call = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments || "{}";
    let patch: Record<string, unknown> = {};
    try {
      patch = JSON.parse(argsStr);
    } catch (e) {
      console.error("Bad tool args:", argsStr);
    }

    // Strip chart unless explicitly chart intent
    if (patch.visualIntent !== "chart") delete (patch as any).chart;

    return new Response(JSON.stringify({ patch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("populate-slide-details error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
