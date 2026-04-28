// Seeds presentation/content/webinar/stream-overlay editable templates from
// the in-app config file into the editable_templates table. Idempotent on id.
// Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Inline mirror of ALL_PRESENTATION_TEMPLATES (kept here so the edge function
// has no client deps). Each entry maps to a row in editable_templates.
// Format: minimal — id, name, description, asset_type, category, background,
// dimensions, fields, default_fonts, default_colors, tags.
import { ALL_TEMPLATES } from "./templates.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify caller is admin
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = ALL_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? null,
      asset_type: t.asset_type,
      category: t.category ?? "universal",
      background: t.background,
      dimensions: t.dimensions,
      fields: t.fields,
      default_fonts: t.default_fonts ?? {},
      default_colors: t.default_colors ?? {},
      tags: t.tags ?? null,
      color_mode: t.color_mode ?? "RGB",
      dpi: t.dpi ?? 72,
      is_system_template: true,
      source: "preset",
    }));

    const { error } = await supabase
      .from("editable_templates")
      .upsert(rows, { onConflict: "id" });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, seeded: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-presentation-templates error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
