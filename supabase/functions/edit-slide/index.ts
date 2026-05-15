// Per-slide AI editor — Rewrite / Shorten / Expand / Tone / Convert layout / Regenerate
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Layout = "title" | "section" | "bullets" | "two_column" | "stat" | "quote" | "closing";

interface SlideOutline {
  layout: Layout;
  title: string;
  subtitle?: string;
  bullets?: string[];
  leftColumn?: { heading: string; bullets: string[] };
  rightColumn?: { heading: string; bullets: string[] };
  stat?: { value: string; label: string };
  quote?: { text: string; attribution?: string };
  notes?: string;
}

type Action =
  | "rewrite"
  | "shorten"
  | "expand"
  | "tone"
  | "convert"
  | "regenerate";

interface ReqBody {
  slide: SlideOutline;
  action: Action;
  // optional context
  deckTitle?: string;
  deckTopic?: string;
  audience?: string;
  // for tone change
  tone?: string;
  // for convert
  targetLayout?: Layout;
  // freeform extra instruction
  instruction?: string;
}

const ACTION_PROMPT: Record<Action, (b: ReqBody) => string> = {
  rewrite: () => "Rewrite the slide's text to be sharper, more compelling, and more specific. Keep facts and intent intact.",
  shorten: () => "Aggressively shorten the text. Cut filler. Bullets max 8 words. Keep meaning.",
  expand: () => "Add depth: more specific bullets, a stronger subtitle, fuller speaker notes. Stay concise — bullets max 12 words.",
  tone: (b) => `Rewrite the slide in a ${b.tone || "professional"} tone. Keep facts intact.`,
  convert: (b) => `Convert this slide to a "${b.targetLayout}" layout. Reorganize the content so it makes sense in that layout. Drop fields that don't fit; populate the new layout's required fields.`,
  regenerate: () => "Generate a fresh take on this slide — different angle, sharper hook, but same topic.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as ReqBody;
    if (!body?.slide || !body?.action) {
      return new Response(JSON.stringify({ error: "slide and action required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const targetLayout: Layout = body.action === "convert" && body.targetLayout ? body.targetLayout : body.slide.layout;
    const instruction = ACTION_PROMPT[body.action](body);

    const userPrompt = `Deck: ${body.deckTitle || body.deckTopic || "(untitled)"}
${body.audience ? `Audience: ${body.audience}` : ""}

Current slide (JSON):
${JSON.stringify(body.slide, null, 2)}

Instruction: ${instruction}
${body.instruction ? `Extra: ${body.instruction}` : ""}

Output the full updated slide via the edit_slide tool. Use layout="${targetLayout}". Keep the result concise and presentation-ready.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior presentation designer. Edit slides surgically. Bullets max 6 per slide, max 12 words each. Always include speaker notes (1-3 sentences)." },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "edit_slide",
            description: "Return the updated slide.",
            parameters: {
              type: "object",
              properties: {
                layout: { type: "string", enum: ["title", "section", "bullets", "two_column", "stat", "quote", "closing"] },
                title: { type: "string" },
                subtitle: { type: "string" },
                bullets: { type: "array", items: { type: "string" } },
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
        tool_choice: { type: "function", function: { name: "edit_slide" } },
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
    if (!args) throw new Error("No edit returned");
    const updated = JSON.parse(args) as SlideOutline;

    return new Response(JSON.stringify({ success: true, slide: updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("edit-slide error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
