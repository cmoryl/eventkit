// Claude-powered deck outline generator.
// Returns the SAME DeckOutline contract as generate-deck so the Presentation Studio
// renderer can ingest Claude's plan via `prebuiltOutline` and render with pptxgenjs.
//
// Use this when the user opts into "Claude" as the deck reasoning provider.
// The visual rendering (pptxgenjs, palette/font lock) stays in generate-deck.

import { corsHeaders } from "../_shared/cors.ts";
import {
  callClaudeJson,
  claudeErrorResponse,
  streamClaudeText,
  type ClaudeModel,
} from "../_shared/anthropic.ts";

interface RequestBody {
  topic: string;
  audience?: string;
  slideCount: number;
  tone?: string;
  brandName?: string;
  brandVoice?: string;
  palette?: string[];
  sourceSummary?: string;
  keyFacts?: string[];
  model?: ClaudeModel;
  /** When true, stream slides as NDJSON (one slide JSON per line). */
  stream?: boolean;
}

const OUTLINE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          layout: {
            type: "string",
            enum: [
              "title", "section", "bullets", "two_column", "stat", "quote", "closing",
              "kpi_grid", "agenda", "timeline", "comparison", "metrics", "team",
              "image_hero", "chart", "process",
            ],
          },
          title: { type: "string" },
          subtitle: { type: "string" },
          body: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          stat: {
            type: "object",
            properties: { value: { type: "string" }, label: { type: "string" } },
          },
          quote: {
            type: "object",
            properties: { text: { type: "string" }, author: { type: "string" } },
          },
          notes: { type: "string" },
        },
        required: ["layout", "title"],
      },
    },
  },
  required: ["title", "slides"],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.topic || !body?.slideCount) {
      return new Response(JSON.stringify({ error: "Missing topic or slideCount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are EventKIT's senior presentation strategist. Plan decks with strong narrative arcs, varied layouts, and tight copy.

RULES
- Vary layouts: never repeat the same layout 3 times in a row.
- Open with "title", close with "closing". Use "section" dividers every 4-6 slides for decks > 10.
- Headlines under 9 words. Bullets under 14 words each. No fluff, no filler verbs.
- For stat/kpi_grid: give real-feeling numbers grounded in the context.
- Match the brand voice and tone exactly.`;

    const ctxLines: string[] = [`Topic: ${body.topic}`, `Slide count: ${body.slideCount}`];
    if (body.audience) ctxLines.push(`Audience: ${body.audience}`);
    if (body.tone) ctxLines.push(`Tone: ${body.tone}`);
    if (body.brandName) ctxLines.push(`Brand: ${body.brandName}`);
    if (body.brandVoice) ctxLines.push(`Brand voice: ${body.brandVoice}`);
    if (body.palette?.length) ctxLines.push(`Palette: ${body.palette.join(", ")}`);
    if (body.sourceSummary) ctxLines.push(`Source summary: ${body.sourceSummary}`);
    if (body.keyFacts?.length) ctxLines.push(`Key facts:\n- ${body.keyFacts.join("\n- ")}`);

    const prompt = `${ctxLines.join("\n")}\n\nReturn a deck outline with exactly ${body.slideCount} slides.`;

    const outline = await callClaudeJson({
      model: body.model ?? "claude-sonnet-4-5",
      system,
      prompt,
      schema: OUTLINE_SCHEMA,
      max_tokens: 6144,
      temperature: 0.8,
      toolName: "return_deck_outline",
    });

    return new Response(JSON.stringify({ provider: "anthropic", outline }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-deck-claude error:", err);
    return claudeErrorResponse(err, corsHeaders);
  }
});
