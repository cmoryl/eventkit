import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AssetSpec {
  key: string;          // unique key (e.g. "instagram::SOCIAL_POST")
  network: string;      // "Instagram"
  assetType: string;    // "SOCIAL_POST"
  assetName: string;    // "Social Post"
}

interface Body {
  campaignName: string;
  keyMessage: string;
  audience?: string;
  vibe?: string;
  brandName?: string;
  assets: AssetSpec[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body: Body = await req.json();
    const { campaignName, keyMessage, audience, vibe, brandName, assets } = body;

    if (!assets?.length) {
      return new Response(JSON.stringify({ captions: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are a senior social media copywriter. For each asset, write platform-native copy:
- Headline (max 8 words, punchy, on the design)
- Body / caption text (length tuned to the platform — short for Instagram/TikTok, professional for LinkedIn, conversational for Facebook, concise for X/Twitter, descriptive for YouTube/Podcast, formal subject line for Email)
- Hashtags (3-6, relevant, no spam) where applicable
- A single short CTA (e.g. "Register now")

Return STRICT JSON only, no commentary, with shape:
{
  "items": [
    { "key": "<asset key>", "headline": "...", "caption": "...", "hashtags": ["#a","#b"], "cta": "..." }
  ]
}`;

    const user = `Campaign: ${campaignName || "Untitled"}
Brand: ${brandName || "—"}
Key message: ${keyMessage || "—"}
Audience: ${audience || "—"}
Tone / vibe: ${vibe || "—"}

Write copy for these assets:
${assets.map(a => `- key=${a.key} | network=${a.network} | asset=${a.assetName}`).join("\n")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed: { items?: Array<{ key: string; headline?: string; caption?: string; hashtags?: string[]; cta?: string }> } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const captions: Record<string, { headline: string; caption: string; hashtags: string[]; cta: string }> = {};
    for (const item of parsed.items || []) {
      if (!item?.key) continue;
      captions[item.key] = {
        headline: item.headline || "",
        caption: item.caption || "",
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
        cta: item.cta || "",
      };
    }

    return new Response(JSON.stringify({ captions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-social-captions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Caption generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
