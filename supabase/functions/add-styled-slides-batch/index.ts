// Generate MULTIPLE new slides in one run that match the voice, layout
// strategy, theme, and master assets of a reference deck. Powers the
// "Batch generate" button in the Slide Editor.
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
  count?: number;
  referenceSlides: ReferenceSlide[];
  deckTitle?: string;
  audience?: string;
  insertPosition?: number;
  themeTokens?: {
    name?: string;
    colors?: Record<string, string>;
    fonts?: { major?: string; minor?: string };
  };
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
        xPct?: number; yPct?: number; wPct?: number; hPct?: number;
      }>;
    }>;
  };
  slideBlueprints?: Array<{
    slideNum: number;
    layoutFile?: string;
    bgFill?: string;
    shapes: Array<{
      kind: 'shape' | 'placeholder' | 'picture';
      phType?: string;
      geom?: string;
      xPct?: number; yPct?: number; wPct?: number; hPct?: number;
      fill?: string;
      line?: string;
      sampleText?: string;
    }>;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as ReqBody;
    if (!Array.isArray(body.referenceSlides) || body.referenceSlides.length === 0) {
      return new Response(JSON.stringify({ error: "referenceSlides required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const count = Math.max(1, Math.min(10, Math.floor(body.count ?? 3)));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const refs = body.referenceSlides.slice(0, 24).map((s) => ({
      layout: s.layout,
      title: (s.title || "").slice(0, 140),
      subtitle: (s.subtitle || "").slice(0, 200),
      bullets: Array.isArray(s.bullets) ? s.bullets.slice(0, 6).map((b) => String(b).slice(0, 160)) : undefined,
      body: (s.body || "").slice(0, 600),
    }));

    const styleName = body.styleName || "the existing deck";

    const tokens = body.themeTokens;
    const colorEntries = tokens?.colors ? Object.entries(tokens.colors) : [];
    const tokensBlock = tokens && (colorEntries.length || tokens.fonts?.major || tokens.fonts?.minor)
      ? `\nAuthoritative brand tokens (parsed from the source deck's theme):
${tokens.name ? `- Theme name: ${tokens.name}\n` : ""}${colorEntries.length ? `- Colors: ${colorEntries.map(([k, v]) => `${k}=${v}`).join(", ")}\n` : ""}${tokens.fonts?.major ? `- Heading font: ${tokens.fonts.major}\n` : ""}${tokens.fonts?.minor ? `- Body font: ${tokens.fonts.minor}\n` : ""}Treat these as the locked palette + typography across ALL ${count} slides.\n`
      : "";

    const catalog = body.layoutCatalog;
    const seen = new Set<string>();
    const compactLayouts = (catalog?.layouts || [])
      .filter((l) => {
        const key = l.name.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key); return true;
      })
      .slice(0, 24)
      .map((l) => ({
        name: l.name, type: l.type,
        placeholders: l.placeholders.map((p) => ({
          t: p.type,
          ...(p.sz ? { sz: p.sz } : {}),
          ...(p.xPct !== undefined ? { x: p.xPct, y: p.yPct, w: p.wPct, h: p.hPct } : {}),
        })),
      }));
    const layoutNames = compactLayouts.map((l) => l.name);
    const layoutBlock = compactLayouts.length
      ? `\nReal slide layouts available in the master deck (every generated slide MUST pick one by NAME for layoutName):
${JSON.stringify(compactLayouts, null, 2)}\n`
      : "";

    const blueprints = body.slideBlueprints || [];
    const interesting = blueprints
      .map((b) => ({
        slideNum: b.slideNum,
        bgFill: b.bgFill,
        decor: b.shapes
          .filter((s) => s.kind === 'shape' && s.fill && s.geom)
          .slice(0, 6)
          .map((s) => ({ geom: s.geom, fill: s.fill, x: s.xPct, y: s.yPct, w: s.wPct, h: s.hPct })),
      }))
      .filter((b) => b.decor.length > 0 || b.bgFill)
      .slice(0, 6);
    const blueprintBlock = interesting.length
      ? `\nMaster-deck composition blueprints — reuse these motifs consistently across the batch:
${JSON.stringify(interesting, null, 2)}\n`
      : "";

    const userPrompt = `You are generating ${count} new slides as ONE cohesive sequence that must match the voice, tone, structure, and visual layout patterns of ${styleName}.

Deck title: ${body.deckTitle || "(untitled)"}
${body.audience ? `Audience: ${body.audience}\n` : ""}
${body.styleNotes ? `Style notes: ${body.styleNotes}\n` : ""}
${body.insertPosition ? `These slides will be inserted starting at position ${body.insertPosition}.\n` : ""}${tokensBlock}${layoutBlock}${blueprintBlock}
User request for the batch: ${body.prompt?.trim() || `Create ${count} useful next slides that flow naturally together. Vary layouts but stay consistent in style.`}

Reference slides (existing deck — match this style precisely):
${JSON.stringify(refs, null, 2)}

Rules for the batch:
- Generate exactly ${count} slides.
- Treat the batch as one continuous narrative — order matters, each builds on the last.
- ${compactLayouts.length ? "Each slide's layoutName MUST come from the catalog above. Vary layouts across the batch (don't repeat the same layoutName more than twice in a row) but stay within the catalog." : "Pick layouts that already exist in the reference deck. Do NOT invent new layouts."}
- Apply the SAME theme tokens (palette + fonts) and the same decorative motifs across every slide. Consistency over novelty.
- Match phrasing length, bullet style, and tone exactly.
- Bullets: max 6, max 12 words each.
- Always include 1-3 sentence speaker notes per slide.
- Output via the create_slides tool with a 'slides' array of length ${count}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior presentation designer. Generate a cohesive batch of on-brand slides that fit seamlessly into the reference deck." },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_slides",
            description: "Return the newly generated batch of slides as an ordered array.",
            parameters: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  minItems: count, maxItems: count,
                  items: {
                    type: "object",
                    properties: {
                      layout: { type: "string", enum: ["title", "section", "bullets", "two_column", "stat", "quote", "closing", "content"] },
                      ...(layoutNames.length ? { layoutName: { type: "string", enum: layoutNames, description: "Exact name of the master-deck slide layout." } } : {}),
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
              },
              required: ["slides"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_slides" } },
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
    if (!args) throw new Error("No slides returned");
    const parsed = JSON.parse(args);
    const slides = Array.isArray(parsed?.slides) ? parsed.slides : [];
    if (!slides.length) throw new Error("Empty slides array");

    return new Response(JSON.stringify({ success: true, slides }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("add-styled-slides-batch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
