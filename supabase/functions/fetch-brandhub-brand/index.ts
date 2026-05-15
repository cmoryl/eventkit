import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type HubSourceId = "brandhub" | "gasalley";

interface HubConfig {
  apiUrl: string;
  restUrl: string;
  anonKey: string;
  headers: Record<string, string>;
}

const HUB_CONFIGS: Record<HubSourceId, HubConfig> = {
  brandhub: (() => {
    const anonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeGFpamJ5cWZra2hob29ybnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDU0ODYsImV4cCI6MjA4MzIyMTQ4Nn0.Uw6QPHoOo_15FWCfnSAZYyGZNEr-XlZ8NrVyLlcuiWk";
    return {
      apiUrl: "https://nhxaijbyqfkkhhoornzy.supabase.co/functions/v1/get-shared-brand",
      restUrl: "https://nhxaijbyqfkkhhoornzy.supabase.co/rest/v1",
      anonKey,
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    };
  })(),
  gasalley: (() => {
    const anonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHFsbnNhcWZlemx0YWVnbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzY0NDYsImV4cCI6MjA5MTg1MjQ0Nn0.3M8oe-ZIp-Fkrb_vNZXxOJENUs5lphOntEoLFihId6U";
    return {
      apiUrl: "https://wbxqlnsaqfezltaeglko.supabase.co/functions/v1/get-shared-brand",
      restUrl: "https://wbxqlnsaqfezltaeglko.supabase.co/rest/v1",
      anonKey,
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    };
  })(),
};

function getHub(id: unknown): HubConfig {
  if (typeof id === "string" && id in HUB_CONFIGS) {
    return HUB_CONFIGS[id as HubSourceId];
  }
  return HUB_CONFIGS.brandhub;
}

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken, slug, includeEvent, hubSource } = await req.json();
    const hub = getHub(hubSource);

    if (!shareToken && !slug) {
      return json(200, {
        success: false,
        error: "Share token or slug is required",
      });
    }

    let resolvedToken = shareToken;

    // If slug provided, try to resolve via BrandHub REST API (brands table, then events/products table)
    if (!resolvedToken && slug) {
      const directResult = await resolveBrandHubSlug(slug, hub);
      if (directResult.resolvedToken) {
        resolvedToken = directResult.resolvedToken;
      } else if (directResult.response) {
        return directResult.response;
      }
    }

    if (!resolvedToken && slug) {
      console.warn("Could not resolve slug, trying slug as token fallback");
      resolvedToken = slug;
    }

    console.log("Fetching brand from hub", hubSource || "brandhub", "with token:", resolvedToken);

    const response = await fetch(hub.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...hub.headers },
      body: JSON.stringify({
        shareToken: resolvedToken,
        includeEvent: includeEvent ?? true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Users often paste/type product or event slugs (e.g. "dataforce") into the token field.
      // If the share endpoint rejects it, treat the token as a slug and resolve live tables.
      if (shareToken && !slug) {
        const fallbackResult = await resolveBrandHubSlug(shareToken, hub);
        if (
          fallbackResult.resolvedToken &&
          fallbackResult.resolvedToken !== shareToken
        ) {
          resolvedToken = fallbackResult.resolvedToken;
          const retry = await fetch(hub.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...hub.headers },
            body: JSON.stringify({
              shareToken: resolvedToken,
              includeEvent: includeEvent ?? true,
            }),
          });
          const retryData = await retry.json();
          if (retry.ok) {
            return normalizeSharedBrandResponse(retryData, resolvedToken);
          }
        }
        if (fallbackResult.response) {
          return fallbackResult.response;
        }
      }
      console.error("BrandHub API error:", response.status, data);
      return json(200, {
        success: false,
        error: data.error || "Failed to fetch brand from BrandHub",
        status: response.status,
      });
    }

    return await normalizeSharedBrandResponse(data, resolvedToken);
  } catch (error) {
    console.error("Error fetching BrandHub brand:", error);
    return json(200, {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

async function normalizeSharedBrandResponse(
  data: Record<string, unknown>,
  resolvedToken: string,
) {
  const brandData = (data.brand || {}) as Record<string, unknown>;

  console.log("Successfully fetched brand from BrandHub:", brandData.name);

  // ── Map BrandHub's rich data into a normalized structure ──
  // BrandHub returns: colors, fonts, logos, brandIcons, patterns, gradients,
  // photography (approved/rejected), constraints, socialMedia, values,
  // services, sponsorLogos, heroSettings, industry, tagline, voice, mission

  const colors = Array.isArray(brandData.colors) ? brandData.colors : [];
  const fonts = Array.isArray(brandData.fonts) ? brandData.fonts : [];
  const logos = brandData.logos || {};
  const brandIcons = Array.isArray(brandData.brandIcons)
    ? brandData.brandIcons
    : [];
  const patterns = Array.isArray(brandData.patterns) ? brandData.patterns : [];
  const gradients = Array.isArray(brandData.gradients)
    ? brandData.gradients
    : [];
  const photography = brandData.photography || {};
  const constraints = brandData.constraints || {};
  const socialMedia = brandData.socialMedia || {};
  const values = Array.isArray(brandData.values) ? brandData.values : [];
  const services = Array.isArray(brandData.services) ? brandData.services : [];
  const sponsorLogos = brandData.sponsorLogos || {};
  const heroSettings = brandData.heroSettings || {};
  const allImagery = brandData.allImagery || {};

  // Map colors to our format
  const colorPalette = colors.map((c: Record<string, unknown>) => ({
    hex: c.hex,
    name: c.name || "",
    role: c.role || "",
    usage: c.usage || "",
  }));

  // Map fonts
  const headingFont = fonts.find(
    (f: Record<string, unknown>) =>
      f.role === "heading" || f.role === "display",
  );
  const bodyFont = fonts.find(
    (f: Record<string, unknown>) => f.role === "body" || f.role === "paragraph",
  );
  const accentFont = fonts.find(
    (f: Record<string, unknown>) => f.role === "accent" || f.role === "caption",
  );

  // Photography guidelines — enrich with AI analysis
  const rawApproved = Array.isArray(photography.approved)
    ? photography.approved.map((p: Record<string, unknown>) => ({
        url: String(p.url || ""),
        description: String(p.description || ""),
      }))
    : [];
  const rawRejected = Array.isArray(photography.rejected)
    ? photography.rejected.map((p: Record<string, unknown>) => ({
        url: String(p.url || ""),
        description: String(p.description || ""),
      }))
    : [];

  // Deep-analyze approved photography with AI vision
  const photographyApproved = await analyzePhotographyBatch(
    rawApproved,
    brandData.name,
    "approved",
  );
  const photographyRejected = await analyzePhotographyBatch(
    rawRejected,
    brandData.name,
    "rejected",
  );

  // Brand misuse / constraints
  const brandMisuse = Array.isArray(constraints.brandMisuse)
    ? constraints.brandMisuse.map((m: Record<string, unknown>) => ({
        description: m.description,
        exampleUrl: m.exampleUrl,
      }))
    : [];

  // Social handles
  const socialHandles: Record<string, string> = {};
  if (Array.isArray(socialMedia.handles)) {
    socialMedia.handles.forEach((h: Record<string, unknown>) => {
      if (h.platform && h.handle) {
        socialHandles[String(h.platform)] = String(h.handle);
      }
    });
  }
  const hashtags = Array.isArray(socialMedia.hashtags)
    ? socialMedia.hashtags
    : [];

  // Sponsor logos
  const sponsorsList = Array.isArray(sponsorLogos.all) ? sponsorLogos.all : [];

  // All imagery organized by type
  const imageryByType: Record<string, string[]> = {
    logos: [],
    brandIcons: [],
    patterns: [],
    photography: [],
    heroImages: [],
    sponsors: [],
  };
  if (Array.isArray(allImagery.all)) {
    allImagery.all.forEach((img: { url: string; type: string }) => {
      const url = img.url;
      if (!url) return;
      if (img.type === "logo") imageryByType.logos.push(url);
      else if (img.type === "brand-icon") imageryByType.brandIcons.push(url);
      else if (img.type === "pattern") imageryByType.patterns.push(url);
      else if (img.type === "photography-approved")
        imageryByType.photography.push(url);
      else if (img.type === "hero" || img.type === "hero-logo")
        imageryByType.heroImages.push(url);
      else if (img.type === "sponsor-logo") imageryByType.sponsors.push(url);
    });
  }

  // Extract event details from BrandHub data
  const eventData = extractEventDetails(brandData);

  // Build the comprehensive normalized brand object
  const normalizedBrand = {
    // Identity
    id: brandData.id,
    name: brandData.name,
    slug: brandData.slug,
    tagline: brandData.tagline,
    mission: brandData.mission,
    industry: brandData.industry,
    voice: Array.isArray(brandData.voice) ? brandData.voice : [],

    // Colors
    primary_color: colorPalette[0]?.hex,
    secondary_color: colorPalette[1]?.hex,
    accent_color: colorPalette[2]?.hex,
    colors: colorPalette,

    // Fonts
    fonts,
    heading_font: headingFont?.family || headingFont?.fontFamily,
    body_font: bodyFont?.family || bodyFont?.fontFamily,
    accent_font: accentFont?.family || accentFont?.fontFamily,

    // Logos
    logo_url: logos.primary || brandData.logo_url,
    logo_monochrome_url: logos.monochrome,
    logo_reversed_url: logos.reversed,
    logo_icon_url: logos.icon,
    logo_wordmark_url: logos.wordmark,
    all_logos: Array.isArray(logos.all) ? logos.all : [],

    // Visual assets
    brandIcons,
    patterns,
    gradients,

    // Photography guidelines
    photography_approved: photographyApproved,
    photography_rejected: photographyRejected,
    photography_dos: photographyApproved
      .map((p: { description: string }) => p.description)
      .filter(Boolean),
    photography_donts: photographyRejected
      .map((p: { description: string }) => p.description)
      .filter(Boolean),

    // Brand constraints & misuse
    brand_misuse: brandMisuse,
    restricted_elements: brandMisuse
      .map((m: { description: string }) => m.description)
      .filter(Boolean),

    // Social
    social_handles: socialHandles,
    hashtags,

    // Values & services
    values: values.map((v: Record<string, unknown>) => v.text).filter(Boolean),
    services: services.map((s: Record<string, unknown>) => ({
      name: s.name,
      description: s.description,
    })),

    // Sponsors
    sponsors: sponsorsList,

    // Hero
    heroSettings,

    // All imagery organized
    allImagery: {
      all: Array.isArray(allImagery.all)
        ? allImagery.all.map((i: { url: string }) => i.url)
        : [],
      byType: imageryByType,
      totalCount: allImagery.totalCount || 0,
    },

    // Original guide_data for anything we missed
    guide_data: brandData.guide_data || {},
  };

  const sectionCount = Object.keys(normalizedBrand).filter(
    (k) =>
      normalizedBrand[k as keyof typeof normalizedBrand] !== undefined &&
      normalizedBrand[k as keyof typeof normalizedBrand] !== null,
  ).length;

  console.log(`Normalized ${sectionCount} brand sections from BrandHub`);

  return json(200, {
    success: true,
    brand: normalizedBrand,
    event: eventData,
    hasEventData: !!(eventData.name || eventData.date || eventData.venue),
    sectionsImported: sectionCount,
    resolvedToken: resolvedToken,
  });
}

async function resolveBrandHubSlug(
  slug: string,
  hub: HubConfig,
): Promise<{ resolvedToken?: string; response?: Response }> {
  const encodedSlug = encodeURIComponent(slug);
  console.log("Resolving BrandHub slug:", slug);

  const brandRes = await fetch(
    `${hub.restUrl}/brands?slug=eq.${encodedSlug}&is_public=eq.true&select=id,name,slug,share_token,guide_data&limit=1`,
    { headers: hub.headers },
  );
  if (brandRes.ok) {
    const brands = await brandRes.json();
    const brand = Array.isArray(brands) ? brands[0] : null;
    if (brand?.share_token) {
      console.log("Resolved brand slug to token:", brand.share_token);
      return { resolvedToken: brand.share_token };
    }
    if (brand?.guide_data) {
      console.log("Building brand data directly from brand guide_data");
      return {
        response: buildBrandFromEventGuideData(brand, brand.guide_data),
      };
    }
  }

  for (const table of ["events", "products"] as const) {
    console.log(`Trying ${table} table for slug:`, slug);
    const res = await fetch(
      `${hub.restUrl}/${table}?slug=eq.${encodedSlug}&is_public=eq.true&select=id,name,slug,parent_brand_id,guide_data&limit=1`,
      { headers: hub.headers },
    );
    if (!res.ok) continue;

    const rows = await res.json();
    const entityData = Array.isArray(rows) ? rows[0] : null;
    if (!entityData) continue;

    console.log(`Found ${table.slice(0, -1)} by slug:`, entityData.name);
    if (entityData.guide_data) {
      console.log(
        `Building brand data directly from ${table.slice(0, -1)} guide_data`,
      );
      return {
        response: buildBrandFromEventGuideData(
          entityData,
          entityData.guide_data,
        ),
      };
    }

    if (entityData.parent_brand_id) {
      const parentRes = await fetch(
        `${hub.restUrl}/brands?id=eq.${encodeURIComponent(entityData.parent_brand_id)}&select=share_token&limit=1`,
        { headers: hub.headers },
      );
      if (parentRes.ok) {
        const parents = await parentRes.json();
        if (Array.isArray(parents) && parents[0]?.share_token) {
          console.log(
            `Resolved ${table.slice(0, -1)} parent brand to token:`,
            parents[0].share_token,
          );
          return { resolvedToken: parents[0].share_token };
        }
      }
    }
  }

  return {};
}

function extractEventDetails(
  brandData: Record<string, unknown>,
): Record<string, unknown> {
  const guideData = (brandData.guide_data || {}) as Record<string, unknown>;
  const heroData = (guideData.hero || {}) as Record<string, unknown>;

  return {
    name:
      brandData.event_name ||
      brandData.eventName ||
      guideData.eventName ||
      heroData.eventName ||
      brandData.name,
    description:
      brandData.event_description ||
      brandData.eventDescription ||
      heroData.subtitle ||
      heroData.description ||
      brandData.description,
    date: brandData.event_date || brandData.eventDate || guideData.eventDate,
    eventType:
      brandData.event_type ||
      brandData.eventType ||
      guideData.eventType ||
      guideData.category,
    venue:
      (guideData.venue as Record<string, unknown>)?.name ||
      brandData.venue_name,
    venueAddress:
      (guideData.venue as Record<string, unknown>)?.address ||
      brandData.venue_address,
    venueCity:
      (guideData.venue as Record<string, unknown>)?.city || brandData.location,
    sponsors: Array.isArray(brandData.sponsors?.all)
      ? brandData.sponsors.all
      : Array.isArray(guideData.sponsors)
        ? guideData.sponsors
        : undefined,
    attendeeCount:
      brandData.attendee_count ||
      brandData.attendeeCount ||
      guideData.attendeeCount,
    tagline: brandData.tagline || heroData.tagline,
  };
}

/**
 * Deep-analyze a batch of photography images with AI vision.
 * Replaces generic descriptions like "Good example of brand photography"
 * with rich, actionable descriptions of what makes each image on-brand.
 */
async function analyzePhotographyBatch(
  photos: Array<{ url: string; description: string }>,
  brandName: string,
  type: "approved" | "rejected",
): Promise<Array<{ url: string; description: string; aiAnalysis?: string }>> {
  if (photos.length === 0) return [];

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    console.warn("No LOVABLE_API_KEY — skipping photography deep analysis");
    return photos;
  }

  // Build a single batch prompt with all image URLs to minimize API calls
  const imageEntries = photos.filter((p) => p.url).slice(0, 8); // cap at 8 to stay within context limits

  if (imageEntries.length === 0) return photos;

  const direction =
    type === "approved"
      ? "what makes each image ON-BRAND and suitable for the brand"
      : "what makes each image OFF-BRAND or unsuitable for the brand";

  const prompt = `You are a brand photography analyst for "${brandName}".

Analyze each of the ${imageEntries.length} images below and describe ${direction}.

For each image, provide a concise 1-2 sentence analysis covering:
- Subject matter & composition (e.g. "diverse team in modern office", "aerial cityscape")
- Lighting & color treatment (e.g. "warm natural light", "high-contrast corporate blue tones")
- Mood & style (e.g. "energetic and collaborative", "polished editorial")
- Why it works for the brand (e.g. "reinforces global teamwork values", "aligns with professional tone")

Respond with ONLY a JSON array of objects: [{"index": 0, "analysis": "..."}, ...]
One entry per image, in order.`;

  try {
    const content: Array<{
      type: string;
      text?: string;
      image_url?: { url: string };
    }> = [{ type: "text", text: prompt }];
    for (const entry of imageEntries) {
      content.push({ type: "image_url", image_url: { url: entry.url } });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content }],
          temperature: 0.3,
        }),
      },
    );

    if (!response.ok) {
      console.warn("Photography analysis API error:", response.status);
      return photos;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const analyses: Array<{ index: number; analysis: string }> = JSON.parse(
        jsonMatch[0],
      );

      return photos.map((photo, i) => {
        const match = analyses.find((a) => a.index === i);
        return {
          url: photo.url,
          description: match?.analysis || photo.description,
          aiAnalysis: match?.analysis || undefined,
        };
      });
    }
  } catch (e) {
    console.warn("Photography analysis error:", e);
  }

  return photos;
}

/**
 * Build a normalized brand response directly from BrandHub event guide_data
 * when we can't resolve a share token.
 */
function buildBrandFromEventGuideData(
  eventData: Record<string, unknown>,
  guideData: Record<string, unknown>,
): Response {
  const hero = (guideData.hero as Record<string, unknown>) || {};
  const identity = (guideData.identity as Record<string, unknown>) || {};
  const taglineData = (guideData.tagline as Record<string, unknown>) || {};
  const colors = Array.isArray(guideData.colors) ? guideData.colors : [];
  const typography = Array.isArray(guideData.typography)
    ? guideData.typography
    : [];
  const logos = Array.isArray(guideData.logos) ? guideData.logos : [];
  const patterns = Array.isArray(guideData.patterns) ? guideData.patterns : [];
  const gradients = Array.isArray(guideData.gradients)
    ? guideData.gradients
    : [];
  const brandIcons = Array.isArray(guideData.brandIcons)
    ? guideData.brandIcons
    : [];
  const imagery = Array.isArray(guideData.imagery) ? guideData.imagery : [];
  const social = Array.isArray(guideData.social) ? guideData.social : [];
  const values = Array.isArray(guideData.values) ? guideData.values : [];
  const services = Array.isArray(guideData.services) ? guideData.services : [];
  const sponsorLogos = Array.isArray(guideData.sponsorLogos)
    ? guideData.sponsorLogos
    : [];

  const headingFont = typography.find(
    (f: Record<string, unknown>) =>
      f.role === "heading" || f.role === "display",
  );
  const bodyFont = typography.find(
    (f: Record<string, unknown>) => f.role === "body" || f.role === "paragraph",
  );
  const accentFont = typography.find(
    (f: Record<string, unknown>) => f.role === "accent" || f.role === "caption",
  );

  const primaryLogo =
    logos.find((l: Record<string, unknown>) => l.variant === "primary") ||
    logos[0];
  const socialHandles: Record<string, string> = {};
  social.forEach((h: Record<string, unknown>) => {
    if (h.platform && h.handle)
      socialHandles[String(h.platform)] = String(h.handle);
  });

  const colorPalette = colors.map((c: Record<string, unknown>) => ({
    hex: c.hex,
    name: c.name || "",
    role: c.role || "",
    usage: c.usage || "",
  }));

  // Extract event-specific rich data
  const eventDetails =
    (guideData.eventDetails as Record<string, unknown>) || {};
  const eventSchedule = Array.isArray(guideData.eventSchedule)
    ? guideData.eventSchedule
    : [];
  const eventSponsors = Array.isArray(guideData.eventSponsors)
    ? guideData.eventSponsors
    : [];
  const linkedGuides = Array.isArray(guideData.linkedGuides)
    ? guideData.linkedGuides
    : [];
  const colorCombinations = Array.isArray(guideData.colorCombinations)
    ? guideData.colorCombinations
    : [];
  const socialAssets = Array.isArray(guideData.socialAssets)
    ? guideData.socialAssets
    : [];
  const displayBanners = Array.isArray(guideData.displayBanners)
    ? guideData.displayBanners
    : [];
  const partnerBooths = Array.isArray(guideData.partnerBooths)
    ? guideData.partnerBooths
    : [];
  const eventHistory = Array.isArray(guideData.eventHistory)
    ? guideData.eventHistory
    : [];
  const eventSignage = Array.isArray(guideData.eventSignage)
    ? guideData.eventSignage
    : [];
  const emailBanners = Array.isArray(guideData.emailBanners)
    ? guideData.emailBanners
    : [];
  const eventBanners = Array.isArray(guideData.eventBanners)
    ? guideData.eventBanners
    : [];
  const eventVideos = Array.isArray(guideData.eventVideos)
    ? guideData.eventVideos
    : [];
  const brochures = Array.isArray(guideData.brochures)
    ? guideData.brochures
    : [];
  const textStyles = Array.isArray(guideData.textStyles)
    ? guideData.textStyles
    : [];
  const templates = Array.isArray(guideData.templates)
    ? guideData.templates
    : [];
  const assets = Array.isArray(guideData.assets) ? guideData.assets : [];
  const websites = Array.isArray(guideData.websites) ? guideData.websites : [];
  const eventDigitalAssets = Array.isArray(guideData.eventDigitalAssets)
    ? guideData.eventDigitalAssets
    : [];

  const normalizedBrand = {
    id: eventData.id,
    name: hero.name || eventData.name,
    slug: eventData.slug,
    tagline: taglineData.primary || hero.tagline || null,
    tagline_secondary: taglineData.secondary || null,
    tagline_variations: Array.isArray(taglineData.variations)
      ? taglineData.variations
      : Array.isArray(taglineData.variationsV2)
        ? (taglineData.variationsV2 as Array<{ text?: string }>)
            .map((v) => v.text)
            .filter(Boolean)
        : [],
    mission: identity.missionStatement || null,
    industry: guideData.industry || null,
    voice: Array.isArray(identity.toneOfVoice) ? identity.toneOfVoice : [],
    archetype: identity.archetype || null,
    primary_color: colorPalette[0]?.hex,
    secondary_color: colorPalette[1]?.hex,
    accent_color: colorPalette[2]?.hex,
    colors: colorPalette,
    fonts: typography.map((t: Record<string, unknown>) => ({
      id: t.id,
      role: t.role,
      family: t.fontFamily || t.family,
      weight: t.weight,
    })),
    heading_font: headingFont?.fontFamily || headingFont?.family,
    body_font: bodyFont?.fontFamily || bodyFont?.family,
    accent_font: accentFont?.fontFamily || accentFont?.family,
    logo_url: primaryLogo?.url || hero.logoUrl || null,
    logo_monochrome_url:
      logos.find((l: Record<string, unknown>) => l.variant === "monochrome")
        ?.url || null,
    logo_reversed_url:
      logos.find((l: Record<string, unknown>) => l.variant === "reversed")
        ?.url || null,
    brandIcons: brandIcons.map((i: Record<string, unknown>) => ({
      id: i.id,
      name: i.name,
      url: i.url,
    })),
    patterns: patterns.map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      url: p.url,
    })),
    gradients: gradients.map((g: Record<string, unknown>) => ({
      id: g.id,
      name: g.name,
      css: g.css,
    })),
    photography_dos: imagery
      .filter((i: Record<string, unknown>) => i.type === "do")
      .map((i: Record<string, unknown>) => String(i.description || "")),
    photography_donts: imagery
      .filter((i: Record<string, unknown>) => i.type === "dont")
      .map((i: Record<string, unknown>) => String(i.description || "")),
    social_handles: socialHandles,
    hashtags: [eventDetails.hashtag].filter(Boolean),
    values: values.map((v: Record<string, unknown>) => ({
      text: v.text,
      description: v.description,
    })),
    services: services.map((s: Record<string, unknown>) => ({
      name: s.name,
      description: s.description,
    })),
    sponsors: eventSponsors.map((s: Record<string, unknown>) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl,
      tier: s.tier,
    })),
    heroSettings: {
      coverImage: hero.coverImage || null,
      coverVideo: hero.coverVideo || null,
      useVideo: hero.useVideo || false,
    },
    allImagery: { all: [], byType: {}, totalCount: 0 },

    // Rich event data
    eventDetails: {
      eventName: eventDetails.eventName || hero.name || eventData.name,
      eventDates: eventDetails.eventDates,
      eventType: eventDetails.eventType || guideData.eventType,
      hashtag: eventDetails.hashtag,
      location: eventDetails.location,
      registrationUrl: eventDetails.registrationUrl,
      tagline: eventDetails.tagline || taglineData.primary,
    },
    eventSchedule: eventSchedule.map((s: Record<string, unknown>) => ({
      title: s.title,
      time: s.time,
      location: s.location,
      description: s.description,
      track: s.track,
      speaker: s.speaker,
    })),
    linkedGuides: linkedGuides.map((g: Record<string, unknown>) => ({
      name: g.name,
      slug: g.slug,
      region: g.region,
      location: g.location,
      dates: g.dates,
      venue: g.venue,
      attendees: g.attendees,
      accentColor: g.accentColor,
    })),
    colorCombinations: colorCombinations.map((c: Record<string, unknown>) => ({
      name: c.name,
      colors: c.colors,
      status: c.status,
      notes: c.notes,
    })),
    socialAssets: socialAssets.map((s: Record<string, unknown>) => ({
      platform: s.platform,
      postSize: s.postSize,
      storySize: s.storySize,
      coverSize: s.coverSize,
      directive: s.directive,
      textLegibility: s.textLegibility,
    })),
    displayBanners: displayBanners.map((b: Record<string, unknown>) => ({
      name: b.name,
      dimensions: b.dimensions,
      category: b.category,
      safeZonePolicy: b.safeZonePolicy,
      textLegibility: b.textLegibility,
      maxMessaging: b.maxMessaging,
    })),
    partnerBooths: partnerBooths.map((p: Record<string, unknown>) => ({
      divisionName: p.divisionName,
      tagline: p.tagline,
      color: p.color,
      services: p.services,
    })),
    eventHistory: eventHistory.map((h: Record<string, unknown>) => ({
      year: h.year,
      eventName: h.eventName,
      location: h.location,
      attendees: h.attendees,
      theme: h.theme,
      highlights: h.highlights,
    })),
    textStyles: textStyles.map((t: Record<string, unknown>) => ({
      tag: t.tag,
      size: t.size,
      weight: t.weight,
      lineHeight: t.lineHeight,
    })),
    eventSignagePreviewUrls: eventSignage
      .slice(0, 10)
      .map((s: Record<string, unknown>) => s.previewUrl)
      .filter(Boolean),
    emailBannerUrls: emailBanners
      .slice(0, 5)
      .map((b: Record<string, unknown>) => b.imageUrl)
      .filter(Boolean),
    eventBannerUrls: eventBanners
      .slice(0, 5)
      .map((b: Record<string, unknown>) => b.previewUrl)
      .filter(Boolean),
    eventVideoUrls: eventVideos.map((v: Record<string, unknown>) => ({
      title: v.title,
      url: v.url,
      thumbnailUrl: v.thumbnailUrl,
    })),
    eventPhotographyUrls: assets
      .slice(0, 20)
      .map((a: Record<string, unknown>) => a.url)
      .filter(Boolean),
    websites: websites.map((w: Record<string, unknown>) => ({
      name: w.name,
      url: w.url,
    })),
    digitalAssetUrls: eventDigitalAssets.map((d: Record<string, unknown>) => ({
      name: d.name,
      url: d.imageUrl,
    })),
    brochurePreviewUrls: brochures
      .map((b: Record<string, unknown>) => b.previewUrl)
      .filter(Boolean),

    guide_data: guideData,
  };

  const venue = (guideData.venue as Record<string, unknown>) || {};
  const eventDetailsResponse = {
    name: hero.name || eventData.name,
    description: hero.subtitle || hero.description,
    date: eventDetails.eventDates || guideData.eventDate,
    eventType:
      eventDetails.eventType || guideData.eventType || guideData.category,
    venue: venue.name,
    venueAddress: venue.address,
    venueCity: venue.city || eventDetails.location,
    tagline: taglineData.primary || hero.tagline,
    hashtag: eventDetails.hashtag,
    registrationUrl: eventDetails.registrationUrl,
    attendeeCount:
      linkedGuides.reduce(
        (sum: number, g: Record<string, unknown>) =>
          sum + (Number(g.attendees) || 0),
        0,
      ) || undefined,
    linkedEvents: linkedGuides.map((g: Record<string, unknown>) => ({
      name: g.name,
      region: g.region,
      location: g.location,
      dates: g.dates,
      venue: g.venue,
    })),
  };

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };

  return new Response(
    JSON.stringify({
      success: true,
      brand: normalizedBrand,
      event: eventDetailsResponse,
      hasEventData: !!(
        eventDetailsResponse.name ||
        eventDetailsResponse.date ||
        eventDetailsResponse.venue
      ),
      sectionsImported: Object.keys(normalizedBrand).filter(
        (k) => (normalizedBrand as any)[k] != null,
      ).length,
      resolvedToken: String(eventData.slug),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
