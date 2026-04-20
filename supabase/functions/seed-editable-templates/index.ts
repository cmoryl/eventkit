// Seed editable templates: receives template payload from authenticated admin client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const { data: adminRole } = await supabase
      .from('user_roles').select('role')
      .eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!adminRole) throw new Error('Admin access required');

    const { templates } = await req.json();
    if (!Array.isArray(templates)) throw new Error('templates must be an array');

    const rows = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? null,
      asset_type: t.assetType,
      category: t.category ?? 'universal',
      vendor_id: t.vendorId ?? null,
      thumbnail: t.thumbnail ?? null,
      preview_url: t.previewUrl ?? null,
      background: t.background ?? {},
      dimensions: t.dimensions ?? {},
      fields: t.fields ?? [],
      default_fonts: t.defaultFonts ?? {},
      default_colors: t.defaultColors ?? {},
      tags: t.tags ?? [],
      is_premium: t.isPremium ?? false,
      is_system_template: true,
      color_mode: t.colorMode ?? 'CMYK',
      dpi: t.dpi ?? 300,
      source: 'config',
    }));

    // Upsert in chunks of 50
    let synced = 0;
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('editable_templates')
        .upsert(chunk, { onConflict: 'id' });
      if (error) throw error;
      synced += chunk.length;
    }

    return new Response(
      JSON.stringify({ success: true, synced, total: templates.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Seed error:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
