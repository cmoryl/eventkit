// Craft a masterful AI prompt for a specific editable template.
// Inputs: template metadata + optional user brief + optional reference image (base64/URL).
// Output: a refined, production-grade prompt string.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      templateName,
      assetType,
      category,
      description,
      currentPrompt,
      userBrief,
      referenceImage, // legacy: single data URI or https URL
      referenceImages, // new: array of data URIs / URLs
    } = await req.json();

    // Normalize to a single array of image URLs (data URI or https)
    const images: string[] = Array.isArray(referenceImages)
      ? referenceImages.filter((u) => typeof u === "string" && u.length > 0)
      : [];
    if (typeof referenceImage === "string" && referenceImage.length > 0) {
      images.unshift(referenceImage);
    }
    // Cap to a reasonable number to protect tokens / latency
    const cappedImages = images.slice(0, 6);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!templateName && !assetType) {
      return new Response(
        JSON.stringify({ error: "templateName or assetType required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a world-class prompt engineer specializing in AI image generation for branded event design assets.

Your job: produce ONE masterful, production-ready prompt for a specific template. The prompt will be fed into an image-generation model (e.g. Gemini Nano Banana / GPT image) and reused for many variations of this template.

Rules for the output prompt:
1. Lead with the asset type and intent (e.g. "A premium event badge…").
2. Describe composition, layout zones, hierarchy, focal point, and where text/logo should sit (do NOT draw the logo — leave clean space).
3. Specify visual style, mood, era, and aesthetic vocabulary.
4. Specify typography character (weight, style, treatment) without fabricating exact fonts.
5. Specify color treatment (palette feel, contrast, finish) — keep flexible for brand overrides.
6. Add print/production cues when relevant (high resolution, print-ready, clean edges, bleed-safe).
7. Add inline negatives ("avoid clutter, avoid stock photo look, no fake logos, no lorem ipsum").
8. Keep it 90–180 words, single paragraph, professional, no markdown, no headings, no bullet lists.
9. Return ONLY the prompt text — no preamble, no explanation, no quotes around it.`;

    const userTextParts: string[] = [];
    userTextParts.push(`TEMPLATE METADATA:`);
    userTextParts.push(`- Name: ${templateName ?? "(unnamed)"}`);
    userTextParts.push(`- Asset type: ${assetType ?? "(unknown)"}`);
    if (category) userTextParts.push(`- Category: ${category}`);
    if (description) userTextParts.push(`- Description: ${description}`);
    if (currentPrompt) {
      userTextParts.push(`\nCURRENT PROMPT (improve, do not just rephrase):\n${currentPrompt}`);
    }
    if (userBrief) {
      userTextParts.push(`\nUSER DIRECTION:\n${userBrief}`);
    }
    if (cappedImages.length > 0) {
      userTextParts.push(
        `\n${cappedImages.length} REFERENCE IMAGE${cappedImages.length > 1 ? "S are" : " is"} attached. Synthesize their COMBINED visual DNA — the shared color mood, recurring composition cues, typography character, texture, and finish across all of them. Where references diverge, distill the common thread and the strongest unifying aesthetic. Translate that combined DNA into reusable directives. Do NOT copy any single image.`
      );
    }
    userTextParts.push(
      `\nReturn the masterful prompt now. Single paragraph. No quotes. No preface.`
    );

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: userTextParts.join("\n") },
    ];
    for (const url of cappedImages) {
      userContent.push({ type: "image_url", image_url: { url } });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const refined = data.choices?.[0]?.message?.content?.trim();
    if (!refined) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip surrounding quotes if the model added any
    const cleaned = refined.replace(/^["'`]+|["'`]+$/g, "").trim();

    return new Response(JSON.stringify({ prompt: cleaned }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("craft-template-prompt error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
