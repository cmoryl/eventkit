import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRE_APPROVED_ADMINS = ['cmoryl@transperfect.com'];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authorize: caller must be an authenticated user who is either pre-approved
    // by SERVER-VERIFIED email OR has the admin role in the database.
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
    const jwt = authHeader.replace('Bearer ', '');

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401);

    const callerEmail = (userData.user.email || '').toLowerCase();
    const callerId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const { action, targetUserId, role } = body as {
      action: 'list' | 'grant_admin' | 'revoke_admin' | 'delete_generation' | 'delete_project';
      targetUserId?: string;
      role?: 'admin' | 'moderator' | 'user';
    };

    const isPreApproved = PRE_APPROVED_ADMINS.includes(callerEmail);

    // Verify admin role in DB
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!isPreApproved && !roleRow) {
      return json({ error: 'Forbidden' }, 403);
    }

    if (action === 'list') {
      // List auth users (paginated, first 200)
      const { data: usersResp, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;

      const userIds = usersResp.users.map((u) => u.id);

      const [rolesRes, profilesRes, projectsRes, generationsRes] = await Promise.all([
        admin.from('user_roles').select('user_id, role').in('user_id', userIds),
        admin.from('profiles').select('user_id, name, avatar_url').in('user_id', userIds),
        admin.from('projects').select('user_id').in('user_id', userIds),
        admin.from('ai_generations').select('user_id').in('user_id', userIds),
      ]);

      const rolesByUser = new Map<string, string[]>();
      (rolesRes.data || []).forEach((r) => {
        const list = rolesByUser.get(r.user_id) || [];
        list.push(r.role);
        rolesByUser.set(r.user_id, list);
      });

      const profilesByUser = new Map<string, { name: string | null; avatar_url: string | null }>();
      (profilesRes.data || []).forEach((p) =>
        profilesByUser.set(p.user_id, { name: p.name, avatar_url: p.avatar_url })
      );

      const projectCounts = new Map<string, number>();
      (projectsRes.data || []).forEach((p) =>
        projectCounts.set(p.user_id, (projectCounts.get(p.user_id) || 0) + 1)
      );
      const genCounts = new Map<string, number>();
      (generationsRes.data || []).forEach((g) =>
        genCounts.set(g.user_id, (genCounts.get(g.user_id) || 0) + 1)
      );

      const users = usersResp.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        roles: rolesByUser.get(u.id) || [],
        profile: profilesByUser.get(u.id) || null,
        project_count: projectCounts.get(u.id) || 0,
        generation_count: genCounts.get(u.id) || 0,
      }));

      return json({ users, total: usersResp.users.length });
    }

    if (action === 'grant_admin' && targetUserId) {
      const newRole = role || 'admin';
      const { error } = await admin
        .from('user_roles')
        .upsert({ user_id: targetUserId, role: newRole }, { onConflict: 'user_id,role' });
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'revoke_admin' && targetUserId) {
      const { error } = await admin
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role || 'admin');
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'delete_generation' && targetUserId) {
      // targetUserId here actually carries the generation id for moderation
      const { error } = await admin.from('ai_generations').delete().eq('id', targetUserId);
      if (error) throw error;
      return json({ success: true });
    }

    if (action === 'delete_project' && targetUserId) {
      const { error } = await admin.from('projects').delete().eq('id', targetUserId);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('admin-users error:', e);
    return json({ error: e instanceof Error ? e.message : 'Internal error' }, 500);
  }
});
