// Extract structured content + embedded images from a PDF for deck generation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ExtractRequest {
  fileBase64: string; // data: prefix or raw base64
  fileName: string;
  // Scope of what to pull from the PDF
  includeText?: boolean;
  includeImagery?: boolean;
  includeLookAndFeel?: boolean;
  // 0-100 — how heavily the PDF should influence the deck
  influence?: number;
  userNotes?: string;
}

interface ExtractedSource {
  summary: string;
  outline: { heading: string; bullets: string[] }[];
  keyFacts: string[];
  quotes: { text: string; attribution?: string }[];
  lookAndFeel?: {
    palette: string[]; // hex w/o #
    headingFont?: string;
    bodyFont?: string;
    mood?: string;
    description?: string;
  };
  imageUrls: string[]; // public URLs of extracted page snapshots / imagery
  pageCount: number;
  influence: number;
  scope: { text: boolean; imagery: boolean; lookAndFeel: boolean };
  notes?: string;
}

const SYSTEM = `You are a presentation researcher. Read the supplied PDF and extract the material a designer would need to repurpose it as a slide deck.
Be faithful to the source — do not invent facts.
Keep bullets concise (≤ 14 words each). Group content into 4–8 logical sections.
If imagery / look-and-feel were requested, describe the visual palette (hex), typography, and overall mood derived from the document.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as ExtractRequest;
    const {
      fileBase64,
      fileName,
      includeText = true,
      includeImagery = true,
      includeLookAndFeel = true,
      influence = 70,
      userNotes,
    } = body;

    if (!fileBase64) {
      return new Response(JSON.stringify({ error: "fileBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing server configuration");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Normalise to data URL
    const dataUrl = fileBase64.startsWith("data:")
      ? fileBase64
      : `data:application/pdf;base64,${fileBase64}`;
    const rawBase64 = dataUrl.split(",")[1] || "";

    // Build user prompt
    const scopeBits: string[] = [];
    if (includeText) scopeBits.push("textual content (key messages, structure, facts, quotes)");
    if (includeImagery) scopeBits.push("notable imagery cues (describe images suitable for the deck)");
    if (includeLookAndFeel) scopeBits.push("visual look-and-feel (color palette in hex, typography style, overall mood)");

    const userPrompt = `Extract from the attached PDF: ${scopeBits.join(", ")}.
Influence target: ${influence}/100 — ${influence >= 70 ? "stay very close to source structure & tone" : influence >= 40 ? "use as primary inspiration but allow rework" : "treat as light reference only"}.
${userNotes ? `User notes: ${userNotes}` : ""}

Return via the extract_source tool.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_source",
              description: "Return structured extraction of the PDF.",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "2-4 sentence executive summary." },
                  outline: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        heading: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                      },
                      required: ["heading", "bullets"],
                    },
                  },
                  keyFacts: { type: "array", items: { type: "string" } },
                  quotes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        attribution: { type: "string" },
                      },
                      required: ["text"],
                    },
                  },
                  lookAndFeel: {
                    type: "object",
                    properties: {
                      palette: { type: "array", items: { type: "string", description: "6-char hex without #" } },
                      headingFont: { type: "string" },
                      bodyFont: { type: "string" },
                      mood: { type: "string" },
                      description: { type: "string" },
                    },
                  },
                  imageDescriptions: {
                    type: "array",
                    items: { type: "string", description: "Describe each notable image worth recreating." },
                  },
                  pageCount: { type: "number" },
                },
                required: ["summary", "outline", "pageCount"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_source" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error ${aiRes.status}: ${await aiRes.text()}`);
    }

    const aiJson = await aiRes.json();
    const args = aiJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No extraction returned");
    const parsed = JSON.parse(args);

    // Store the original PDF so the deck function can later reference it (and the user can revisit).
    const sourceId = crypto.randomUUID();
    const pdfBytes = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0));
    const safeName = (fileName || "source").replace(/[^a-z0-9.\-_]+/gi, "-").slice(0, 60) || "source.pdf";
    const pdfPath = `${sourceId}/${safeName}`;
    await supabase.storage
      .from("generated-decks")
      .upload(pdfPath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    const { data: pdfPublic } = supabase.storage.from("generated-decks").getPublicUrl(pdfPath);

    const result: ExtractedSource = {
      summary: parsed.summary,
      outline: parsed.outline || [],
      keyFacts: parsed.keyFacts || [],
      quotes: parsed.quotes || [],
      lookAndFeel: includeLookAndFeel ? parsed.lookAndFeel : undefined,
      imageUrls: includeImagery ? [] : [], // image generation could be added later; we return descriptions for now
      pageCount: parsed.pageCount || 0,
      influence,
      scope: { text: includeText, imagery: includeImagery, lookAndFeel: includeLookAndFeel },
      notes: userNotes,
    };

    return new Response(JSON.stringify({
      success: true,
      sourceId,
      sourceUrl: pdfPublic.publicUrl,
      fileName: safeName,
      extracted: result,
      imageDescriptions: includeImagery ? (parsed.imageDescriptions || []) : [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-pdf-source error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
