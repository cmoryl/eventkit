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

// Per-platform copy rules. Injected into the system prompt so the AI has
// explicit, platform-native constraints for every network it may encounter.
const PLATFORM_RULES: Record<string, string> = {
  Instagram: `INSTAGRAM RULES:
  • Headline: 5-7 words, hook-first, emoji optional
  • Caption: 125-150 chars before "more" cutoff; use 2-3 line breaks for scannability
  • Hashtags: 5-10 tags — mix branded (#EventName), niche topic, and 1-2 trending
  • CTA: visual-action CTAs — "Save this ↓", "Tag a friend who needs this", "Link in bio 🔗"
  • Tone: visual-first, community-driven, aspirational`,

  LinkedIn: `LINKEDIN RULES:
  • Headline: 8-12 words, value-proposition focused, NO emojis, professional language
  • Caption: 100-200 chars before "see more"; insight-led, cite business outcomes
  • Hashtags: 3-5 only — industry/category tags (#EventMarketing, #Leadership); no personal spam
  • CTA: professional CTAs — "Register now", "Reserve your seat", "Learn more"
  • Tone: thought-leadership, B2B-friendly, benefit-driven`,

  "Twitter/X": `TWITTER/X RULES:
  • Headline: 6-8 words, punchy and retweetable, no hashtags in headline
  • Caption: 240 chars MAX (leave 25 chars for link); NO paragraph breaks; one punchy sentence
  • Hashtags: 1-2 ONLY — one branded, one topical; more hurts engagement
  • CTA: short and direct — "Register →", "Don't miss this", "Happening live"
  • Tone: conversational, shareable, sense of urgency`,

  TikTok: `TIKTOK RULES:
  • Headline: 3-5 words; MUST create urgency or curiosity within the first 3 seconds
  • Caption: 80-120 chars; casual lowercase acceptable; emoji-forward
  • Hashtags: 8-12 tags — trending sound/challenge tags + event-specific tags
  • CTA: participation CTAs — "Comment 👇", "Duet this", "Share with your crew 🎉"
  • Tone: casual, Gen-Z-aware, entertainment-first, authentic over polished`,

  Facebook: `FACEBOOK RULES:
  • Headline: 6-10 words, clear and direct, question format works well
  • Caption: 150-250 chars; conversational, story-driven, community-oriented
  • Hashtags: 2-3 ONLY (Facebook hashtags have low reach); keep them broad
  • CTA: community CTAs — "RSVP now", "Get your tickets", "Join us", "Bring a friend"
  • Tone: warm, inclusive, community-first`,

  YouTube: `YOUTUBE RULES:
  • Headline: 8-12 words; keyword-rich for search; start with strongest benefit or curiosity gap
  • Caption: 125-200 chars; describe the episode/video value; include 1-2 search keywords naturally
  • Hashtags: 3-5 discovery tags — category, topic, brand
  • CTA: "Subscribe for updates", "Watch the full session", "Register below"
  • Tone: educational, value-driven, descriptive — promise what viewer will gain`,

  Email: `EMAIL RULES:
  • Headline: THIS IS THE SUBJECT LINE — 6-9 words; create urgency or curiosity; avoid spam triggers (FREE, GUARANTEED, !!!)
  • Caption: THIS IS THE PREHEADER TEXT — 40-90 chars; complements subject, does not repeat it
  • Hashtags: MUST BE EMPTY ARRAY [] — email has no hashtags
  • CTA: button action text — "Register Now", "Save My Spot", "Claim Your Ticket", "See Full Agenda"
  • Tone: professional, direct, benefit-focused; subscriber already opted in — be concise`,

  Podcast: `PODCAST RULES:
  • Headline: 6-10 words; episode-title style with curiosity-gap or outcome hook
  • Caption: 100-200 chars; describe the episode's core value — what listener will gain or learn
  • Hashtags: 3-5 podcast-specific tags — #podcast, #[EventName]Podcast, category tag
  • CTA: "Subscribe and listen", "New episode out now", "Available on all platforms"
  • Tone: conversational, intimate, knowledge-sharing — speak directly to listener`,
};

const PLATFORM_RULE_FALLBACK = `GENERAL RULES:
  • Headline: 6-8 words, punchy and on-brand
  • Caption: concise and clear, appropriate length for the platform
  • Hashtags: 3-5 relevant tags
  • CTA: "Learn more", "Register now", or "Get tickets"
  • Tone: professional and engaging`;

function buildSystemPrompt(networks: string[]): string {
  const unique = [...new Set(networks)];
  const ruleBlocks = unique
    .map(n => PLATFORM_RULES[n] || `${n.toUpperCase()} RULES:\n  ${PLATFORM_RULE_FALLBACK}`)
    .join("\n\n");

  return `You are a senior social media copywriter who specialises in platform-native event marketing copy.

PLATFORM-SPECIFIC REQUIREMENTS — follow these strictly for each asset's network:

${ruleBlocks}

OUTPUT FORMAT — return STRICT JSON only, no commentary, matching this schema exactly:
{
  "items": [
    { "key": "<asset key>", "headline": "...", "caption": "...", "hashtags": ["#a","#b"], "cta": "..." }
  ]
}

Rules for every item:
- "key" must match the key provided in the user message exactly
- "hashtags" must be an array of strings starting with #
- "cta" is the single call-to-action string (button label or closing line)
- Never add commentary outside the JSON`;
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

    const networks = assets.map(a => a.network);
    const system = buildSystemPrompt(networks);

    const user = `Campaign: ${campaignName || "Untitled"}
Brand: ${brandName || "—"}
Key message: ${keyMessage || "—"}
Audience: ${audience || "—"}
Tone / vibe: ${vibe || "—"}

Write copy for these assets — apply the platform rules above for each network:
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
