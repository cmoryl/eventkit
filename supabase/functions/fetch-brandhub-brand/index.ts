import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDHUB_API_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/functions/v1/get-shared-brand";

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
    const { shareToken, includeEvent } = await req.json();

    if (!shareToken) {
      return json(200, { success: false, error: "Share token is required" });
    }

    console.log("Fetching brand from BrandHub with token:", shareToken);

    const response = await fetch(BRANDHUB_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareToken, includeEvent: includeEvent ?? true }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("BrandHub API error:", response.status, data);
      return json(200, {
        success: false,
        error: data.error || "Failed to fetch brand from BrandHub",
        status: response.status,
      });
    }

    const brandData = data.brand || {};

    console.log("Successfully fetched brand from BrandHub:", brandData.name);

    // ── Map BrandHub's rich data into a normalized structure ──
    // BrandHub returns: colors, fonts, logos, brandIcons, patterns, gradients,
    // photography (approved/rejected), constraints, socialMedia, values,
    // services, sponsorLogos, heroSettings, industry, tagline, voice, mission

    const colors = Array.isArray(brandData.colors) ? brandData.colors : [];
    const fonts = Array.isArray(brandData.fonts) ? brandData.fonts : [];
    const logos = brandData.logos || {};
    const brandIcons = Array.isArray(brandData.brandIcons) ? brandData.brandIcons : [];
    const patterns = Array.isArray(brandData.patterns) ? brandData.patterns : [];
    const gradients = Array.isArray(brandData.gradients) ? brandData.gradients : [];
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
      name: c.name || '',
      role: c.role || '',
      usage: c.usage || '',
    }));

    // Map fonts
    const headingFont = fonts.find((f: Record<string, unknown>) =>
      f.role === 'heading' || f.role === 'display'
    );
    const bodyFont = fonts.find((f: Record<string, unknown>) =>
      f.role === 'body' || f.role === 'paragraph'
    );
    const accentFont = fonts.find((f: Record<string, unknown>) =>
      f.role === 'accent' || f.role === 'caption'
    );

    // Photography guidelines — enrich with AI analysis
    const rawApproved = Array.isArray(photography.approved)
      ? photography.approved.map((p: Record<string, unknown>) => ({
          url: String(p.url || ''),
          description: String(p.description || ''),
        }))
      : [];
    const rawRejected = Array.isArray(photography.rejected)
      ? photography.rejected.map((p: Record<string, unknown>) => ({
          url: String(p.url || ''),
          description: String(p.description || ''),
        }))
      : [];

    // Deep-analyze approved photography with AI vision
    const photographyApproved = await analyzePhotographyBatch(
      rawApproved, brandData.name, 'approved'
    );
    const photographyRejected = await analyzePhotographyBatch(
      rawRejected, brandData.name, 'rejected'
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
    const hashtags = Array.isArray(socialMedia.hashtags) ? socialMedia.hashtags : [];

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
        if (img.type === 'logo') imageryByType.logos.push(url);
        else if (img.type === 'brand-icon') imageryByType.brandIcons.push(url);
        else if (img.type === 'pattern') imageryByType.patterns.push(url);
        else if (img.type === 'photography-approved') imageryByType.photography.push(url);
        else if (img.type === 'hero' || img.type === 'hero-logo') imageryByType.heroImages.push(url);
        else if (img.type === 'sponsor-logo') imageryByType.sponsors.push(url);
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
      photography_dos: photographyApproved.map((p: { description: string }) => p.description).filter(Boolean),
      photography_donts: photographyRejected.map((p: { description: string }) => p.description).filter(Boolean),

      // Brand constraints & misuse
      brand_misuse: brandMisuse,
      restricted_elements: brandMisuse.map((m: { description: string }) => m.description).filter(Boolean),

      // Social
      social_handles: socialHandles,
      hashtags,

      // Values & services
      values: values.map((v: Record<string, unknown>) => v.text).filter(Boolean),
      services: services.map((s: Record<string, unknown>) => ({ name: s.name, description: s.description })),

      // Sponsors
      sponsors: sponsorsList,

      // Hero
      heroSettings,

      // All imagery organized
      allImagery: {
        all: Array.isArray(allImagery.all) ? allImagery.all.map((i: { url: string }) => i.url) : [],
        byType: imageryByType,
        totalCount: allImagery.totalCount || 0,
      },

      // Original guide_data for anything we missed
      guide_data: brandData.guide_data || {},
    };

    const sectionCount = Object.keys(normalizedBrand).filter(
      k => normalizedBrand[k as keyof typeof normalizedBrand] !== undefined &&
           normalizedBrand[k as keyof typeof normalizedBrand] !== null
    ).length;

    console.log(`Normalized ${sectionCount} brand sections from BrandHub`);

    return json(200, {
      success: true,
      brand: normalizedBrand,
      event: eventData,
      hasEventData: !!(eventData.name || eventData.date || eventData.venue),
      sectionsImported: sectionCount,
    });
  } catch (error) {
    console.error("Error fetching BrandHub brand:", error);
    return json(200, {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

function extractEventDetails(
  brandData: Record<string, unknown>
): Record<string, unknown> {
  const guideData = (brandData.guide_data || {}) as Record<string, unknown>;
  const heroData = (guideData.hero || {}) as Record<string, unknown>;

  return {
    name: brandData.event_name || brandData.eventName || guideData.eventName || heroData.eventName || brandData.name,
    description: brandData.event_description || brandData.eventDescription || heroData.subtitle || heroData.description || brandData.description,
    date: brandData.event_date || brandData.eventDate || guideData.eventDate,
    eventType: brandData.event_type || brandData.eventType || guideData.eventType || guideData.category,
    venue: (guideData.venue as Record<string, unknown>)?.name || brandData.venue_name,
    venueAddress: (guideData.venue as Record<string, unknown>)?.address || brandData.venue_address,
    venueCity: (guideData.venue as Record<string, unknown>)?.city || brandData.location,
    sponsors: Array.isArray(brandData.sponsors?.all) ? brandData.sponsors.all : (Array.isArray(guideData.sponsors) ? guideData.sponsors : undefined),
    attendeeCount: brandData.attendee_count || brandData.attendeeCount || guideData.attendeeCount,
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
  type: 'approved' | 'rejected'
): Promise<Array<{ url: string; description: string; aiAnalysis?: string }>> {
  if (photos.length === 0) return [];

  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.warn('No LOVABLE_API_KEY — skipping photography deep analysis');
    return photos;
  }

  // Build a single batch prompt with all image URLs to minimize API calls
  const imageEntries = photos
    .filter(p => p.url)
    .slice(0, 8); // cap at 8 to stay within context limits

  if (imageEntries.length === 0) return photos;

  const direction = type === 'approved'
    ? 'what makes each image ON-BRAND and suitable for the brand'
    : 'what makes each image OFF-BRAND or unsuitable for the brand';

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
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: prompt }
    ];
    for (const entry of imageEntries) {
      content.push({ type: "image_url", image_url: { url: entry.url } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    });

    if (!response.ok) {
      console.warn('Photography analysis API error:', response.status);
      return photos;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const analyses: Array<{ index: number; analysis: string }> = JSON.parse(jsonMatch[0]);
      
      return photos.map((photo, i) => {
        const match = analyses.find(a => a.index === i);
        return {
          url: photo.url,
          description: match?.analysis || photo.description,
          aiAnalysis: match?.analysis || undefined,
        };
      });
    }
  } catch (e) {
    console.warn('Photography analysis error:', e);
  }

  return photos;
}
