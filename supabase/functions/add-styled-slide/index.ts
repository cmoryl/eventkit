// Generate a single new slide that matches the style/voice of a reference deck.
// Powers the "Add slide in <Style> style" one-shot button in the Slide Editor.
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReferenceSlide {
  layout?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  notes?: string;
}

interface ReqBody {
  styleName?: string;
  styleNotes?: string;
  prompt?: string;
  referenceSlides: ReferenceSlide[];
  deckTitle?: string;
  audience?: string;
  // Where this slide will go in the deck (1-based)
  insertPosition?: number;
  // Authoritative brand tokens parsed from the source deck's theme1.xml.
  themeTokens?: {
    name?: string;
    colors?: Record<string, string>;
    fonts?: { major?: string; minor?: string };
  };
  // Real layout catalog parsed from ppt/slideLayouts/*.xml — gives the model
  // a closed set of layouts that actually exist in the master deck.
  layoutCatalog?: {
    slideWidthEmu: number;
    slideHeightEmu: number;
    layouts: Array<{
      fileName: string;
      name: string;
      type?: string;
      index: number;
      placeholders: Array<{
        type: string;
        idx?: number;
        sz?: string;
        xPct?: number;
        yPct?: number;
        wPct?: number;
        hPct?: number;
      }>;
    }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as ReqBody;
    if (!Array.isArray(body.referenceSlides) || body.referenceSlides.length === 0) {
      return new Response(JSON.stringify({ error: "referenceSlides required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Keep payload compact — cap reference set + per-slide body length.
    const refs = body.referenceSlides.slice(0, 24).map((s) => ({
      layout: s.layout,
      title: (s.title || "").slice(0, 140),
      subtitle: (s.subtitle || "").slice(0, 200),
      bullets: Array.isArray(s.bullets) ? s.bullets.slice(0, 6).map((b) => String(b).slice(0, 160)) : undefined,
      body: (s.body || "").slice(0, 600),
    }));

    const styleName = body.styleName || "the existing deck";

    // Compact brand-tokens block — gives the model the real palette + fonts
    // pulled from theme1.xml so phrasing/structure references stay tied to
    // the authoritative brand system.
    const tokens = body.themeTokens;
    const colorEntries = tokens?.colors ? Object.entries(tokens.colors) : [];
    const tokensBlock = tokens && (colorEntries.length || tokens.fonts?.major || tokens.fonts?.minor)
      ? `\nAuthoritative brand tokens (parsed from the source deck's theme):
${tokens.name ? `- Theme name: ${tokens.name}\n` : ""}${colorEntries.length ? `- Colors: ${colorEntries.map(([k, v]) => `${k}=${v}`).join(", ")}\n` : ""}${tokens.fonts?.major ? `- Heading font: ${tokens.fonts.major}\n` : ""}${tokens.fonts?.minor ? `- Body font: ${tokens.fonts.minor}\n` : ""}Treat these as the locked palette + typography for any colors/fonts you describe.\n`
      : "";

    const userPrompt = `You are generating ONE new slide that must match the voice, tone, structure, and visual layout patterns of ${styleName}.

Deck title: ${body.deckTitle || "(untitled)"}
${body.audience ? `Audience: ${body.audience}\n` : ""}
${body.styleNotes ? `Style notes: ${body.styleNotes}\n` : ""}
${body.insertPosition ? `This slide will be inserted at position ${body.insertPosition}.\n` : ""}${tokensBlock}
User request for the new slide: ${body.prompt?.trim() || "Create a useful next slide that fits naturally into the deck. Pick a layout the deck hasn't overused."}

Reference slides (existing deck — match this style precisely):
${JSON.stringify(refs, null, 2)}

Rules:
- Pick a layout that already exists in the reference deck. Do NOT invent new layouts.
- Match phrasing length, bullet style, and tone exactly.
- Bullets: max 6, max 12 words each.
- Always include 1-3 sentence speaker notes.
- Output the new slide via the create_slide tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior presentation designer. Generate a single on-brand slide that fits seamlessly into the reference deck." },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_slide",
            description: "Return the newly generated slide.",
            parameters: {
              type: "object",
              properties: {
                layout: { type: "string", enum: ["title", "section", "bullets", "two_column", "stat", "quote", "closing", "content"] },
                title: { type: "string" },
                subtitle: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
                body: { type: "string" },
                leftColumn: { type: "object", properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } },
                rightColumn: { type: "object", properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } },
                stat: { type: "object", properties: { value: { type: "string" }, label: { type: "string" } } },
                quote: { type: "object", properties: { text: { type: "string" }, attribution: { type: "string" } } },
                notes: { type: "string" },
              },
              required: ["layout", "title"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_slide" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(`AI gateway ${response.status}: ${t}`);
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No slide returned");
    const slide = JSON.parse(args);

    return new Response(JSON.stringify({ success: true, slide }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("add-styled-slide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
