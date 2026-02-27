import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type AssetPlacement = "signage" | "banner" | "counter" | "environmental" | "digital" | "auto";

interface SpecificAsset {
  title: string;
  type: string;
  imageUrl: string;
  placement: AssetPlacement;
}

interface BrandElement {
  type: "signage" | "banner" | "counter" | "environmental" | "digital";
  description: string;
  colorPalette?: string[];
}

interface VenuePreviewRequest {
  venueFrameBase64: string;
  eventName: string;
  eventDescription?: string;
  brandElements?: BrandElement[];
  specificAssets?: SpecificAsset[];
  styleDescription?: string;
  duration?: 5 | 10;
  customPrompt?: string;
  preferCustomPrompt?: boolean;
}

// ── Helpers ──

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function ensureDataUrlJpegOrPng(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `data:image/jpeg;base64,${trimmed}`;
}

function normalizeAssetTypeLabel(assetType: string): string {
  return assetType.replace(/_/g, " ").toLowerCase();
}

function placementGuide(placement: AssetPlacement): string {
  switch (placement) {
    case "banner":
      return "on a wall, truss, or stand, readable at distance, aligned to architectural lines";
    case "signage":
      return "on easels, stanchions, wall mounts, or wayfinding posts; do not block doors/exits";
    case "counter":
      return "on the front panel of registration desks/kiosks; wrap correctly around edges";
    case "environmental":
      return "as pillar wraps, wall graphics, floor decals, window clings; follow surface curvature";
    case "digital":
      return "on screens/displays; ensure screen bezel + realistic bloom/reflection";
    case "auto":
    default:
      return "in the most appropriate physically plausible location for that asset type";
  }
}

function buildSpecificAssetsBulletList(specificAssets: SpecificAsset[]) {
  return specificAssets
    .map((a, idx) => {
      const guide = placementGuide(a.placement);
      return `${idx + 1}) "${a.title}" (${normalizeAssetTypeLabel(a.type)}) — placement: ${a.placement}; guidance: ${guide}`;
    })
    .join("\n");
}

function buildBrandElementsBulletList(brandElements: BrandElement[]) {
  return brandElements
    .map((el) => {
      const colorInfo = el.colorPalette?.length
        ? ` (palette hint: ${el.colorPalette.slice(0, 4).join(", ")})`
        : "";
      return `- ${el.type}: ${el.description}${colorInfo}`;
    })
    .join("\n");
}

// ── Fallback prompt (only used when customPrompt is NOT provided) ──

function buildFallbackPrompt(body: VenuePreviewRequest): string {
  const { eventName, eventDescription, styleDescription, specificAssets, brandElements } = body;

  const header = [
    `GOAL: Transform the provided venue photo into a professionally branded event space for "${eventName}".`,
    eventDescription ? `EVENT DESCRIPTION: ${eventDescription}` : "",
    styleDescription ? `STYLE DIRECTION: ${styleDescription}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const globalRules = [
    `NON-NEGOTIABLE REALISM RULES:`,
    `- Preserve the venue architecture (walls, floors, ceiling, fixtures). Do not redesign the building.`,
    `- Keep correct perspective and scale for all inserted items.`,
    `- Match lighting direction and color temperature from the original photo.`,
    `- Add physically correct shadows/occlusion where objects meet surfaces.`,
    `- Avoid glossy "sticker" look; use correct material response (vinyl, fabric, foamcore, LED screen).`,
    `- Do not invent extra logos, sponsors, or text not requested.`,
    `- Keep all visible text crisp and readable (no warped letters).`,
  ].join("\n");

  const assetStrictRules = [
    `LOGO/ASSET FIDELITY (CRITICAL):`,
    `- If specific asset images are provided, treat them as ground-truth. Keep them recognizable and undistorted.`,
    `- Do not redraw, reinterpret, stylize, or replace logos with lookalikes.`,
    `- Do not crop key parts of provided asset artwork.`,
    `- If a surface is curved, apply realistic wrap perspective without warping the logo itself; use a backing panel if needed.`,
    `- If readability is at risk, adjust placement/scale/background backing—NOT the artwork.`,
  ].join("\n");

  const qualityGate = [
    `QUALITY GATE (must pass):`,
    `1) Provided assets are visible, recognizable, and readable.`,
    `2) No perspective errors: assets sit on real planes, no floating.`,
    `3) Lighting/shadows match the venue photo.`,
    `4) No melted/garbled typography or micro-detail noise.`,
    `If any fail, revise internally and output only a passing result.`,
  ].join("\n");

  if (specificAssets && specificAssets.length > 0) {
    const assetList = buildSpecificAssetsBulletList(specificAssets);
    return [
      header, "",
      `INSERT THESE SPECIFIC ASSETS (must be visible):`,
      assetList, "",
      `PLACEMENT BEHAVIOR:`,
      `- Banners/signage: mount on walls/stands/truss; keep edges straight and aligned.`,
      `- Counters: apply graphics to front panels; wrap edges cleanly.`,
      `- Environmental: wraps/decals/clings must follow surface geometry and safety norms.`,
      `- Digital: place on screens with bezel and realistic screen glow/reflections.`,
      "", globalRules, "", assetStrictRules, "", qualityGate,
    ].join("\n");
  }

  if (brandElements && brandElements.length > 0) {
    const list = buildBrandElementsBulletList(brandElements);
    return [
      header, "",
      `ADD THESE BRANDED ELEMENTS:`,
      list, "",
      `INCLUDE:`,
      `- Welcome/registration counter branding`,
      `- Banners/signage placed where a real event would place them`,
      `- Digital screens with event content`,
      `- Environmental branding (subtle, professional)`,
      "", globalRules, "", qualityGate,
    ].join("\n");
  }

  return header;
}

// ── Multimodal message builder ──

function buildMessageContent(args: {
  prompt: string;
  venueFrameUrl: string;
  specificAssets?: SpecificAsset[];
}) {
  const { prompt, venueFrameUrl, specificAssets } = args;

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: venueFrameUrl } },
  ];

  if (specificAssets?.length) {
    for (const asset of specificAssets.slice(0, 4)) {
      if (asset.imageUrl) {
        content.push({
          type: "image_url",
          image_url: { url: ensureDataUrlJpegOrPng(asset.imageUrl) },
        });
      }
    }
  }

  return content;
}

// ── Stable video prompt ──

function buildStableVideoPrompt() {
  return [
    `Smooth cinematic walkthrough of this branded event venue.`,
    `Gentle camera movement: slow pan + slight parallax.`,
    `Showcase signage, banners, counters, screens, and environmental branding.`,
    `Maintain realism: consistent lighting, no morphing objects, no text warping.`,
    `High production value, subtle motion, no fast cuts.`,
  ].join(" ");
}

// ── AI calls ──

async function generateBrandedImage(args: {
  lovableKey: string;
  prompt: string;
  venueFrameUrl: string;
  specificAssets?: SpecificAsset[];
}) {
  const { lovableKey, prompt, venueFrameUrl, specificAssets } = args;

  const messageContent = buildMessageContent({ prompt, venueFrameUrl, specificAssets });

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: messageContent }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Image generation error:", res.status, errorText);
    if (res.status === 429) {
      return { ok: false as const, status: 429, error: "Rate limit exceeded. Please try again later." };
    }
    return { ok: false as const, status: 500, error: "Failed to generate branded venue image." };
  }

  const data = await res.json();
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageUrl) {
    return { ok: false as const, status: 500, error: "No image URL returned from model." };
  }

  return { ok: true as const, imageUrl };
}

async function generateVideo(args: {
  lovableKey: string;
  brandedImageUrl: string;
  duration: 5 | 10;
}) {
  const { lovableKey, brandedImageUrl, duration } = args;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/video/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: buildStableVideoPrompt(),
      image: brandedImageUrl,
      duration,
      aspect_ratio: "16:9",
      resolution: "1080p",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Video generation error:", res.status, errorText);
    return { ok: false as const };
  }

  const data = await res.json();
  return { ok: true as const, videoUrl: data.url || data.video_url };
}

// ── Main handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: VenuePreviewRequest = await req.json();
    const {
      venueFrameBase64,
      eventName,
      specificAssets,
      brandElements,
      duration = 5,
      customPrompt,
      preferCustomPrompt = false,
    } = body;

    if (!venueFrameBase64) return json(400, { error: "Venue frame image is required" });
    if (!eventName) return json(400, { error: "eventName is required" });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json(500, { error: "LOVABLE_API_KEY not configured" });

    const hasSpecificAssets = !!(specificAssets && specificAssets.length > 0);
    const hasBrandElements = !!(brandElements && brandElements.length > 0);
    const hasCustomPrompt = !!(customPrompt && customPrompt.trim().length > 0);

    if (!hasCustomPrompt && !hasSpecificAssets && !hasBrandElements) {
      return json(400, { error: "Provide either customPrompt, specificAssets, or brandElements." });
    }
    if (preferCustomPrompt && !hasCustomPrompt) {
      return json(400, { error: "preferCustomPrompt is true but customPrompt was not provided." });
    }

    // customPrompt passes through untouched; fallback builds a structured prompt
    const prompt = hasCustomPrompt ? customPrompt!.trim() : buildFallbackPrompt(body);
    const venueFrameUrl = ensureDataUrlJpegOrPng(venueFrameBase64);

    console.log("Generating venue preview...");
    console.log("Prompt head:", prompt.slice(0, 220).replace(/\s+/g, " ") + "...");

    // 1) Generate branded venue image
    const img = await generateBrandedImage({
      lovableKey: LOVABLE_API_KEY,
      prompt,
      venueFrameUrl,
      specificAssets: hasSpecificAssets ? specificAssets : undefined,
    });

    if (!img.ok) return json(img.status, { error: img.error });

    // 2) Attempt video; fallback to image
    const vid = await generateVideo({
      lovableKey: LOVABLE_API_KEY,
      brandedImageUrl: img.imageUrl,
      duration,
    });

    if (!vid.ok) {
      return json(200, {
        success: true,
        type: "image",
        imageUrl: img.imageUrl,
        message: "Video generation unavailable, returning branded image preview",
      });
    }

    return json(200, {
      success: true,
      type: "video",
      videoUrl: vid.videoUrl,
      thumbnailUrl: img.imageUrl,
      duration,
    });
  } catch (error) {
    console.error("Error in generate-venue-preview:", error);
    return json(500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
});
