import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-approved admin emails (master accounts)
const PRE_APPROVED_ADMINS = [
  'cmoryl@transperfect.com',
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, email } = await req.json();

    // Check if email is pre-approved (no password needed)
    if (email && PRE_APPROVED_ADMINS.includes(email.toLowerCase())) {
      return new Response(
        JSON.stringify({ success: true, preApproved: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If only email was sent (pre-approval check) and not pre-approved, return gracefully
    if (!password) {
      return new Response(
        JSON.stringify({ success: false, preApproved: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = password === adminPassword;

    return new Response(
      JSON.stringify({ success: isValid }),
      { 
        status: isValid ? 200 : 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Admin verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
