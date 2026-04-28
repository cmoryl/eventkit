// Shared JWT validator for AI-consuming edge functions.
// Returns the authenticated user id or a Response (401) if unauthenticated.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export async function requireUser(req: Request, corsHeaders: Record<string, string>): Promise<
  | { userId: string; email: string | null }
  | { error: Response }
> {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return {
      error: new Response(
        JSON.stringify({ error: "Server auth misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    return {
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  return { userId: data.user.id, email: data.user.email ?? null };
}
