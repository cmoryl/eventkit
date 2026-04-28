import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-approved admin emails (master accounts)
const PRE_APPROVED_ADMINS = [
  'cmoryl@transperfect.com',
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // REQUIRE a valid Supabase JWT - never trust client-supplied email.
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    const verifiedEmail = (userData.user.email || '').toLowerCase();
    const verifiedUserId = userData.user.id;

    // 1) Pre-approved by SERVER-VERIFIED email (never the request body)
    if (verifiedEmail && PRE_APPROVED_ADMINS.includes(verifiedEmail)) {
      return json({ success: true, preApproved: true });
    }

    // 2) Already has admin role in DB
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', verifiedUserId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleRow) {
      return json({ success: true, preApproved: true });
    }

    // 3) Optional password fallback for legacy gate. The shared password is
    //    NEVER cached client-side; the client passes it once per check.
    const body = await req.json().catch(() => ({} as { password?: string }));
    const password = (body as { password?: string })?.password;

    if (!password) {
      return json({ success: false, preApproved: false });
    }

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured');
      return json({ success: false, error: 'Admin access not configured' }, 500);
    }

    if (password === adminPassword) {
      // Auto-grant the admin role so future requests work without a password.
      await admin
        .from('user_roles')
        .upsert({ user_id: verifiedUserId, role: 'admin' }, { onConflict: 'user_id,role' });
      return json({ success: true });
    }

    return json({ success: false }, 401);
  } catch (error) {
    console.error('Admin verification error:', error);
    return json({ success: false, error: 'Verification failed' }, 500);
  }
});
