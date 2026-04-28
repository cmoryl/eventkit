// Discover downloadable files (decks, PDFs, images, videos) attached to a
// BrandHub brand and any of its child events/products. Categorizes by file
// extension so the UI can surface "Brand Decks" (.pptx/.key/.gslides),
// "Documents" (.pdf/.docx), "Images" and "Videos" separately.
//
// This is the "auto-discover + asset library" data source. Clients call it
// after the user switches brands so the Presentation Studio (and any other
// surface) can offer existing brand assets as inspiration or direct imports.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDHUB_REST_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/rest/v1";
const BRANDHUB_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeGFpamJ5cWZra2hob29ybnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDU0ODYsImV4cCI6MjA4MzIyMTQ4Nn0.Uw6QPHoOo_15FWCfnSAZYyGZNEr-XlZ8NrVyLlcuiWk";

type FileCategory = "deck" | "document" | "image" | "video" | "other";

interface DiscoveredFile {
  url: string;
  name: string;
  category: FileCategory;
  ext: string;
  source: "brand" | "event" | "product";
  sourceName: string;
  sourceId: string;
  sectionLabel: string;
  thumbnailUrl: string | null;
  description: string | null;
}

const DECK_EXT = new Set(["pptx", "ppt", "key", "odp", "gslides"]);
const DOC_EXT = new Set(["pdf", "docx", "doc", "pages", "rtf", "md"]);
const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "tiff"]);
const VIDEO_EXT = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv"]);

function classify(url: string): { ext: string; category: FileCategory } {
  const cleanUrl = (url || "").split("?")[0].split("#")[0];
  const ext = (cleanUrl.split(".").pop() || "").toLowerCase();
  if (DECK_EXT.has(ext)) return { ext, category: "deck" };
  if (DOC_EXT.has(ext)) return { ext, category: "document" };
  if (IMAGE_EXT.has(ext)) return { ext, category: "image" };
  if (VIDEO_EXT.has(ext)) return { ext, category: "video" };
  // Heuristic fallback for hosted decks
  if (/\/(pptx|presentation|deck)\b/i.test(cleanUrl)) {
    return { ext: ext || "pptx", category: "deck" };
  }
  return { ext, category: "other" };
}

function deriveName(rawName: string | null | undefined, url: string): string {
  if (rawName && rawName.trim()) return rawName.trim();
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").pop() || "file";
    return decodeURIComponent(last);
  } catch {
    const last = (url || "file").split("/").pop() || "file";
    return decodeURIComponent(last);
  }
}

/**
 * Walk all known guide_data sections that may carry file URLs and emit a
 * normalized DiscoveredFile per URL. We intentionally cast through unknown
 * because BrandHub schemas vary per entity type.
 */
function collectFromGuideData(
  guideData: Record<string, unknown> | null | undefined,
  source: DiscoveredFile["source"],
  sourceId: string,
  sourceName: string,
): DiscoveredFile[] {
  if (!guideData) return [];
  const out: DiscoveredFile[] = [];

  const pushUrl = (
    rawUrl: unknown,
    sectionLabel: string,
    extras?: { name?: unknown; thumb?: unknown; description?: unknown },
  ) => {
    if (typeof rawUrl !== "string" || !rawUrl) return;
    const { ext, category } = classify(rawUrl);
    out.push({
      url: rawUrl,
      name: deriveName((extras?.name as string) || null, rawUrl),
      category,
      ext,
      source,
      sourceName,
      sourceId,
      sectionLabel,
      thumbnailUrl: typeof extras?.thumb === "string" ? extras.thumb : null,
      description:
        typeof extras?.description === "string" ? extras.description : null,
    });
  };

  // Generic "files" / "documents" / "downloads" arrays — these are the most
  // likely place to find PPTX/PDF assets in BrandHub.
  const arrayFields: Array<[string, string]> = [
    ["files", "Files"],
    ["documents", "Documents"],
    ["downloads", "Downloads"],
    ["attachments", "Attachments"],
    ["presentations", "Presentations"],
    ["decks", "Decks"],
    ["templates", "Templates"],
    ["brochures", "Brochures"],
    ["assets", "Assets"],
    ["eventDigitalAssets", "Digital Assets"],
    ["eventVideos", "Videos"],
    ["eventBanners", "Event Banners"],
    ["emailBanners", "Email Banners"],
    ["eventSignage", "Signage"],
  ];

  for (const [key, label] of arrayFields) {
    const arr = guideData[key];
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const it = item as Record<string, unknown>;
      // Try every common URL-bearing field
      const urlCandidates = [
        it.url,
        it.fileUrl,
        it.downloadUrl,
        it.assetUrl,
        it.imageUrl,
        it.previewUrl,
        it.src,
        it.href,
      ];
      for (const u of urlCandidates) {
        if (typeof u === "string" && u) {
          pushUrl(u, label, {
            name: it.name || it.title || it.fileName || it.label,
            thumb: it.thumbnailUrl || it.thumbnail || it.previewUrl,
            description: it.description || it.caption,
          });
          break; // one URL per item is enough to avoid duplicates
        }
      }
    }
  }

  // allImagery.all is a flat list of {url} — useful as image fallback
  const allImagery = (guideData.allImagery as Record<string, unknown>) || {};
  if (Array.isArray(allImagery.all)) {
    for (const it of allImagery.all) {
      const url = typeof it === "string" ? it : (it as Record<string, unknown>)?.url;
      if (typeof url === "string") pushUrl(url, "Imagery");
    }
  }

  return out;
}

async function brandHubFetch(path: string): Promise<unknown[]> {
  const res = await fetch(`${BRANDHUB_REST_URL}/${path}`, {
    headers: {
      apikey: BRANDHUB_ANON_KEY,
      Authorization: `Bearer ${BRANDHUB_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    console.warn(
      `BrandHub REST ${path} failed: ${res.status} ${await res.text().catch(() => "")}`,
    );
    return [];
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

interface RequestBody {
  shareToken?: string;
  slug?: string;
  brandId?: string; // BrandHub brand id (not local brands.id)
  includeChildren?: boolean; // pull events + products too. Default true.
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const includeChildren = body.includeChildren !== false;

    // 1. Resolve the parent brand row
    const brandFilter = body.shareToken
      ? `share_token=eq.${encodeURIComponent(body.shareToken)}`
      : body.slug
        ? `slug=eq.${encodeURIComponent(body.slug)}`
        : body.brandId
          ? `id=eq.${encodeURIComponent(body.brandId)}`
          : null;

    if (!brandFilter) {
      return new Response(
        JSON.stringify({ success: false, error: "Provide shareToken, slug, or brandId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const brandRows = await brandHubFetch(
      `brands?${brandFilter}&select=id,name,slug,share_token,guide_data&limit=1`,
    );
    if (!brandRows.length) {
      return new Response(
        JSON.stringify({ success: true, files: [], counts: {}, brand: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const brandRow = brandRows[0] as Record<string, unknown>;
    const brandId = String(brandRow.id);
    const brandName = (brandRow.name as string) || "Brand";
    const allFiles: DiscoveredFile[] = collectFromGuideData(
      brandRow.guide_data as Record<string, unknown>,
      "brand",
      brandId,
      brandName,
    );

    // 2. Walk children if requested
    if (includeChildren) {
      const [eventRows, productRows] = await Promise.all([
        brandHubFetch(
          `events?parent_brand_id=eq.${brandId}&is_public=eq.true&select=id,name,guide_data&limit=100`,
        ),
        brandHubFetch(
          `products?parent_brand_id=eq.${brandId}&is_public=eq.true&select=id,name,guide_data&limit=100`,
        ),
      ]);

      for (const r of eventRows) {
        const row = r as Record<string, unknown>;
        allFiles.push(
          ...collectFromGuideData(
            row.guide_data as Record<string, unknown>,
            "event",
            String(row.id),
            (row.name as string) || "Event",
          ),
        );
      }
      for (const r of productRows) {
        const row = r as Record<string, unknown>;
        allFiles.push(
          ...collectFromGuideData(
            row.guide_data as Record<string, unknown>,
            "product",
            String(row.id),
            (row.name as string) || "Product",
          ),
        );
      }
    }

    // 3. De-dupe by URL
    const seen = new Set<string>();
    const deduped = allFiles.filter((f) => {
      if (seen.has(f.url)) return false;
      seen.add(f.url);
      return true;
    });

    const counts = deduped.reduce<Record<FileCategory, number>>(
      (acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      },
      { deck: 0, document: 0, image: 0, video: 0, other: 0 },
    );

    return new Response(
      JSON.stringify({
        success: true,
        brand: { id: brandId, name: brandName, slug: brandRow.slug, shareToken: brandRow.share_token },
        files: deduped,
        counts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("list-brandhub-files error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
        files: [],
        counts: {},
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
