// Event Planning Agent - streaming chat via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are EventKIT's Event Planning Agent — a senior event producer with 20+ years of experience planning brand activations, conferences, weddings, festivals, and corporate gatherings.

Your role:
- Help the user plan their event end-to-end: concept, venue, vendors, timeline, budget, guest experience, branding & marketing assets.
- Ask focused clarifying questions when key info is missing (event type, date, guest count, budget range, location, vibe).
- Give concrete, actionable recommendations — not generic advice. Suggest specific vendor categories, timeline milestones, asset checklists, and budget allocations (with %).
- When relevant, recommend EventKIT features the user can use next:
  • "Creation Studios" to generate branded assets (signage, social, print)
  • "Venue Finder" to discover venues
  • "Guest Manager" for RSVPs
  • "Budget Tracker" and "Vendor Manager"
  • "Event Checklist" for the 30-task interactive plan
- Use markdown: short paragraphs, bullet lists, bold headings, tables for budgets/timelines.
- Keep momentum: end most replies with ONE next question or next step.
- Never invent specific vendor business names or venue addresses unless the user shares them first.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("event-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
