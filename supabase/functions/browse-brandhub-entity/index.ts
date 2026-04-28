// Live, no-cache browser for BrandHub top-level entities: brands, events, products.
// Optionally scopes results to a specific parent brand (by share token, slug, or id),
// so the UI can show "events / products that belong to this brand".
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDHUB_REST_URL = "https://nhxaijbyqfkkhhoornzy.supabase.co/rest/v1";
const BRANDHUB_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeGFpamJ5cWZra2hob29ybnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDU0ODYsImV4cCI6MjA4MzIyMTQ4Nn0.Uw6QPHoOo_15FWCfnSAZYyGZNEr-XlZ8NrVyLlcuiWk";

type Entity = "brand" | "event" | "product";

const TABLE_FOR: Record<Entity, string> = {
  brand: "brands",
  event: "events",
  product: "products",
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface BrowseRequest {
  entity?: Entity | "all";
  search?: string;
  limit?: number;
  offset?: number;
  // Optional scoping — match parent brand by any of these
  parentBrandShareToken?: string;
  parentBrandSlug?: string;
  parentBrandId?: string;
  // Only return entities flagged is_public=true (default true).
  publicOnly?: boolean;
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
    console.warn(`BrandHub REST ${path} failed:`, res.status);
    return [];
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

async function resolveParentBrandId(req: BrowseRequest): Promise<string | null> {
  if (req.parentBrandId) return req.parentBrandId;

  if (req.parentBrandShareToken) {
    const rows = await brandHubFetch(
      `brands?share_token=eq.${encodeURIComponent(req.parentBrandShareToken)}&select=id&limit=1`,
    );
    if (rows.length && (rows[0] as Record<string, unknown>).id) {
      return String((rows[0] as Record<string, unknown>).id);
    }
  }
  if (req.parentBrandSlug) {
    const rows = await brandHubFetch(
      `brands?slug=eq.${encodeURIComponent(req.parentBrandSlug)}&select=id&limit=1`,
    );
    if (rows.length && (rows[0] as Record<string, unknown>).id) {
      return String((rows[0] as Record<string, unknown>).id);
    }
  }
  return null;
}

function toCard(row: Record<string, unknown>, entity: Entity) {
  const guideData = (row.guide_data as Record<string, unknown>) || {};
  const hero = (guideData.hero as Record<string, unknown>) || {};
  const colors = Array.isArray(guideData.colors) ? guideData.colors : [];
  const venue = (guideData.venue as Record<string, unknown>) || {};

  return {
    id: row.id as string,
    name: (row.name as string) || (hero.name as string) || "Unnamed",
    slug: (row.slug as string) ?? null,
    shareToken: (row.share_token as string) ?? null,
    parentBrandId: (row.parent_brand_id as string) ?? null,
    type: entity,
    logoUrl: (hero.logoUrl as string) || (row.logo_url as string) || null,
    coverImage: (hero.coverImage as string) || (hero.cardImage as string) || null,
    tagline: (hero.tagline as string) || (row.tagline as string) || null,
    colors: colors
      .slice(0, 5)
      .map((c: Record<string, unknown>) => c.hex as string)
      .filter(Boolean),
    // Event-specific fields (harmless on other types)
    date: (guideData.eventDate as string) || (row.event_date as string) || null,
    location:
      (venue.city as string) ||
      (venue.address as string) ||
      (row.location as string) ||
      null,
    updatedAt: (row.updated_at as string) ?? null,
  };
}

// Schema differs per BrandHub table — brands have no parent_brand_id,
// and only brands carry share_token. Pick exactly the columns that exist.
const SELECT_FOR: Record<Entity, string> = {
  brand: "id,name,slug,share_token,guide_data,updated_at",
  event: "id,name,slug,parent_brand_id,guide_data,updated_at",
  product: "id,name,slug,parent_brand_id,guide_data,updated_at",
};

async function browseEntity(
  entity: Entity,
  req: BrowseRequest,
  parentBrandId: string | null,
): Promise<ReturnType<typeof toCard>[]> {
  const table = TABLE_FOR[entity];
  const publicOnly = req.publicOnly !== false;
  const limit = Math.min(Math.max(req.limit ?? 30, 1), 100);
  const offset = Math.max(req.offset ?? 0, 0);

  const filters: string[] = [
    `select=${SELECT_FOR[entity]}`,
    `order=updated_at.desc`,
    `limit=${limit}`,
    `offset=${offset}`,
  ];
  if (publicOnly) filters.push("is_public=eq.true");
  if (req.search?.trim()) {
    filters.push(`name=ilike.*${encodeURIComponent(req.search.trim())}*`);
  }
  // Only events/products carry parent_brand_id
  if (parentBrandId && entity !== "brand") {
    filters.push(`parent_brand_id=eq.${parentBrandId}`);
  }

  const rows = await brandHubFetch(`${table}?${filters.join("&")}`);
  return rows.map((r) => toCard(r as Record<string, unknown>, entity));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as BrowseRequest;
    const entity = body.entity ?? "all";

    const parentBrandId = await resolveParentBrandId(body);

    const targets: Entity[] =
      entity === "all" ? ["brand", "event", "product"] : [entity as Entity];

    if (!targets.every((t) => TABLE_FOR[t])) {
      return json(400, { success: false, error: "Invalid entity" });
    }

    const results = await Promise.all(targets.map((t) => browseEntity(t, body, parentBrandId)));
    const flat = results.flat();

    return json(200, {
      success: true,
      entity,
      parentBrandId,
      count: flat.length,
      items: flat,
      // Backward-compat key used by older UI
      brands: flat,
    });
  } catch (error) {
    console.error("browse-brandhub-entity error:", error);
    return json(200, {
      success: false,
      error: error instanceof Error ? error.message : "Internal error",
      items: [],
      brands: [],
    });
  }
});
