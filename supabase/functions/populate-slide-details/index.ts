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
Full slide JSON (PRESERVE every field that already has a value):
${JSON.stringify(slide, null, 2)}`;

    // Track which fields the user has already filled so the model can't clobber them.
    const has = (v: unknown) =>
      v !== undefined && v !== null &&
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === "string" && v.trim() === "") &&
      !(typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);
    const lockedFields = [
      "subtitle", "bullets", "leftColumn", "rightColumn", "stat", "quote",
      "kpis", "metrics", "comparison", "timeline", "agenda", "process", "chart",
    ].filter((k) => has((slide as any)?.[k]));

    const systemPrompt = `You are a senior presentation designer. Given a single slide, you ADD missing details (visual guidance, design notes, supporting bullets) WITHOUT rewriting or replacing what the user already wrote.

ABSOLUTE RULES — content fidelity:
- The user's existing slide content is the source of truth. NEVER replace, rewrite, summarize, condense, or drop any field they have already filled in.
- These fields are LOCKED and must be omitted from your response: ${lockedFields.length ? lockedFields.join(", ") : "(none)"}.
- Only return fields that are currently empty. If everything is filled, return ONLY 'designNotes' and 'visualIntent'.
- Never invent stats, percentages, dollar amounts, or company-specific facts. If a stat is needed but not in the slide, leave it blank.

Style guidance for empty fields only:
- 'bullets': 3-5 punchy bullets (max ~12 words each).
- 'leftColumn'/'rightColumn': heading + 2-3 bullets per side.
- 'stat': single bold value + short label.
- 'quote': <= 25 words + attribution.
- 'subtitle' (for section/title/closing): <= 12 words.
- 'designNotes' (always required): 1-3 sentences on tone, must-haves, visual mood — but DO NOT instruct the AI to "use the KPI grid to visualize…" if kpis are already present; instead describe how the existing content should look.
- 'visualIntent' (always required): auto, photo, infographic, chart, icon-grid, screenshot, none.
- Include 'chart' ONLY if visualIntent === "chart" AND no chart already exists. Use numbers from the slide content if present, never fabricate.`;

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
