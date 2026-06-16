import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PptxImportIssue {
  scope: 'slide' | 'layout' | 'master' | 'media';
  scopeId?: string;
  path?: string;
  reason: string;
  detail?: string;
}

interface PptxImportReport {
  fileName: string;
  durationMs: number;
  mediaTotal: number;
  mediaLoaded: number;
  mediaSkipped: number;
  slidesParsed: number;
  picturesResolved: number;
  picturesUnresolved: number;
  issues: PptxImportIssue[];
}

interface ResolveRequest {
  report: PptxImportReport;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { report } = (await req.json()) as ResolveRequest;
    if (!report) throw new Error("Missing report payload");

    // Cap issues sent to keep prompt small.
    const issues = (report.issues || []).slice(0, 80);

    const systemPrompt = `You are an expert PowerPoint (.pptx) import diagnostician for a web slide editor.
Given a structured import report describing which embedded images, SVGs, and shapes failed to load
from a .pptx file, produce a prioritized, actionable resolution plan.

Be concrete: reference the specific scope (slide/layout/master/media) and path when relevant.
Group identical root causes. Each fix should be something a user or a developer can act on
(e.g. "Re-export EMF assets as PNG in PowerPoint", "Embed the missing media1.svg in /ppt/media/",
"Flatten grouped shapes on slideLayout7 before re-exporting"). Prefer user-facing fixes first,
developer/parser fixes second.`;

    const userPrompt = `Import report:\n\n${JSON.stringify({ ...report, issues }, null, 2)}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "resolve_pptx_issues",
          description: "Return a prioritized resolution plan for PPTX import issues.",
          parameters: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "1-2 sentence overview of what went wrong and the overall health of the import.",
              },
              severity: {
                type: "string",
                enum: ["clean", "minor", "moderate", "severe"],
              },
              resolutions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Short fix title." },
                    action: { type: "string", description: "What the user/developer should do." },
                    audience: { type: "string", enum: ["user", "developer"] },
                    affectedScopes: {
                      type: "array",
                      items: { type: "string" },
                      description: "Scopes/paths this fix addresses (e.g. 'slide 4', 'ppt/media/image3.emf').",
                    },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["title", "action", "audience", "priority"],
                },
              },
              followUps: {
                type: "array",
                items: { type: "string" },
                description: "Optional QA steps to verify after applying fixes.",
              },
            },
            required: ["summary", "severity", "resolutions"],
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "resolve_pptx_issues" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again shortly.", code: "RATE_LIMITED" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds to continue.", code: "PAYMENT_REQUIRED" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No resolution generated");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("resolve-pptx-issues error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to resolve issues",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
