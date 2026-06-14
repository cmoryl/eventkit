// Claude-powered brand insights & copywriting.
// Tasks: tagline, brand_dna, event_description, sponsor_copy, slide_copy, custom.
// Streams plain text back to the browser when { stream: true }, otherwise returns JSON.

import { corsHeaders } from "../_shared/cors.ts";
import {
  callClaude,
  callClaudeJson,
  claudeErrorResponse,
  claudeText,
  streamClaudeText,
  type ClaudeModel,
} from "../_shared/anthropic.ts";

type Task =
  | "tagline"
  | "brand_dna"
  | "event_description"
  | "sponsor_copy"
  | "slide_copy"
  | "custom";

interface RequestBody {
  task: Task;
  prompt?: string;
  context?: {
    brandName?: string;
    brandVoice?: string;
    eventName?: string;
    eventDescription?: string;
    audience?: string;
    tone?: string;
    palette?: string[];
    sponsorName?: string;
    sponsorTier?: string;
    notes?: string;
  };
  count?: number;
  stream?: boolean;
  model?: ClaudeModel;
}

const SYSTEM_BY_TASK: Record<Task, string> = {
  tagline:
    "You are EventKIT's senior brand copywriter. Generate punchy, on-brand taglines (5-8 words). Avoid clichés. Lean into the brand voice and event context provided.",
  brand_dna:
    "You are a brand strategist distilling brand DNA. Be precise, concrete, and avoid generic adjectives. Surface tensions, contradictions, and the true differentiator.",
  event_description:
    "You are an event copywriter. Write vivid, sensory event descriptions that make people want to attend. Match the requested tone exactly.",
  sponsor_copy:
    "You are a partnerships copywriter. Write sponsor activation copy that flatters the sponsor while serving the host brand. Be specific to the tier.",
  slide_copy:
    "You are a presentation copywriter. Write tight, scannable slide copy. Headlines under 8 words, bullets under 12. No fluff.",
  custom:
    "You are EventKIT's brand creative assistant. Follow the user's instructions exactly using the provided brand and event context.",
};

function buildUserPrompt(body: RequestBody): string {
  const ctx = body.context ?? {};
  const ctxLines: string[] = [];
  if (ctx.brandName) ctxLines.push(`Brand: ${ctx.brandName}`);
  if (ctx.brandVoice) ctxLines.push(`Brand voice: ${ctx.brandVoice}`);
  if (ctx.eventName) ctxLines.push(`Event: ${ctx.eventName}`);
  if (ctx.eventDescription) ctxLines.push(`Event description: ${ctx.eventDescription}`);
  if (ctx.audience) ctxLines.push(`Audience: ${ctx.audience}`);
  if (ctx.tone) ctxLines.push(`Tone: ${ctx.tone}`);
  if (ctx.palette?.length) ctxLines.push(`Palette: ${ctx.palette.join(", ")}`);
  if (ctx.sponsorName) ctxLines.push(`Sponsor: ${ctx.sponsorName}${ctx.sponsorTier ? ` (${ctx.sponsorTier})` : ""}`);
  if (ctx.notes) ctxLines.push(`Notes: ${ctx.notes}`);
  const header = ctxLines.length ? `CONTEXT\n${ctxLines.join("\n")}\n\n` : "";
  const ask = body.prompt?.trim() ?? defaultPromptFor(body.task, body.count ?? 5);
  return `${header}TASK\n${ask}`;
}

function defaultPromptFor(task: Task, count: number): string {
  switch (task) {
    case "tagline":
      return `Write ${count} tagline candidates. Return as a numbered list. No explanations.`;
    case "brand_dna":
      return "Return a tight brand DNA brief covering: essence (1 sentence), pillars (3 bullets), differentiator (1 sentence), tone words (5).";
    case "event_description":
      return "Write a 2-paragraph event description: opening hook, then what attendees will experience.";
    case "sponsor_copy":
      return "Write sponsor activation copy: 1 headline, 1 sub-headline, 2 sentence body, 1 CTA.";
    case "slide_copy":
      return `Write copy for ${count} slides. For each: HEADLINE then 3 bullets.`;
    case "custom":
      return "Follow the user's instructions.";
  }
}

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
    if (!body?.task) {
      return new Response(JSON.stringify({ error: "Missing 'task'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = SYSTEM_BY_TASK[body.task] ?? SYSTEM_BY_TASK.custom;
    const prompt = buildUserPrompt(body);

    // Structured DNA path
    if (body.task === "brand_dna" && !body.stream) {
      const out = await callClaudeJson<{
        essence: string;
        pillars: string[];
        differentiator: string;
        toneWords: string[];
      }>({
        model: body.model,
        system,
        prompt,
        schema: {
          type: "object",
          properties: {
            essence: { type: "string" },
            pillars: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
            differentiator: { type: "string" },
            toneWords: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
          },
          required: ["essence", "pillars", "differentiator", "toneWords"],
        },
      });
      return new Response(JSON.stringify({ provider: "anthropic", task: body.task, result: out }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.stream) {
      const stream = await streamClaude({
        model: body.model,
        system,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
      });
      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-AI-Provider": "anthropic",
        },
      });
    }

    const res = await callClaude({
      model: body.model,
      system,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    });
    return new Response(
      JSON.stringify({
        provider: "anthropic",
        model: res.model,
        task: body.task,
        text: claudeText(res),
        usage: res.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("brand-insights-claude error:", err);
    return claudeErrorResponse(err, corsHeaders);
  }
});
