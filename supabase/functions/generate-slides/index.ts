import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GOOGLE_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

type ImageryMap = Record<string, string[]>;
type ImageMatchMode = "smart" | "category" | "manual";

/** Tokenize a string into lowercase keywords (no stopwords needed for fuzzy match). */
function tokens(s: string): string[] {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);
}

/** Score how well an asset URL/filename matches a query. */
function matchScore(query: string, url: string): number {
  const q = tokens(query);
  if (!q.length) return 0;
  const filename = url.split("/").pop()?.toLowerCase() || "";
  const haystack = filename + " " + url.toLowerCase();
  let score = 0;
  for (const t of q) if (haystack.includes(t)) score += 1;
  return score;
}

/** Pick best image for a slide based on query + suggested category. */
function pickImage(
  imagery: ImageryMap | undefined,
  query: string | undefined,
  suggestedCategory: string | undefined,
  mode: ImageMatchMode,
  used: Set<string>,
): { url?: string; category?: string } {
  if (!imagery || mode === "manual") return {};

  // Build candidate pool: prefer suggested category, fall back to all
  const categoryAssets = suggestedCategory && imagery[suggestedCategory]?.length
    ? { [suggestedCategory]: imagery[suggestedCategory] }
    : imagery;

  if (mode === "category") {
    // Random pick from suggested (or any) category, avoiding reuse
    const cats = Object.keys(categoryAssets);
    for (const cat of cats) {
      const pool = (categoryAssets[cat] || []).filter(u => !used.has(u));
      if (pool.length) {
        const url = pool[Math.floor(Math.random() * pool.length)];
        used.add(url);
        return { url, category: cat };
      }
    }
    // Fallback: any unused asset
    for (const cat of Object.keys(imagery)) {
      const pool = (imagery[cat] || []).filter(u => !used.has(u));
      if (pool.length) {
        const url = pool[0];
        used.add(url);
        return { url, category: cat };
      }
    }
    return {};
  }

  // smart mode: score every candidate
  let best: { url: string; cat: string; score: number } | null = null;
  for (const cat of Object.keys(categoryAssets)) {
    for (const url of categoryAssets[cat] || []) {
      if (used.has(url)) continue;
      const score = matchScore(query || "", url);
      if (!best || score > best.score) best = { url, cat, score };
    }
  }
  if (best) {
    used.add(best.url);
    return { url: best.url, category: best.cat };
  }
  return {};
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const {
      topic,
      content,
      contentFormat,
      slideCount = 6,
      brandContext,
      model,
      provider,
      googleApiKey,
      brandHubOnly = false,
      approvedImagery,
      approvedCategories,
      enableInfographics = true,
      imageMatchMode = "smart",
      // New: stats-driven chart generation
      keyStats,                       // string — one stat per line
      useStatsForCharts = true,       // toggle: turn keyStats into chart slides
      preferredChartTypes,            // string[] | string — e.g. ["bar","line"]
    } = await req.json();

    const briefSource = (content && content.trim()) || (topic && topic.trim());
    if (!briefSource) {
      return errorResponse("A topic or content brief is required", 400);
    }

    const useGoogle = provider === "google" && googleApiKey;
    const selectedModel = model || "google/gemini-3-flash-preview";

    const googleModelMap: Record<string, string> = {
      "google/gemini-2.5-pro": "gemini-2.5-pro",
      "google/gemini-2.5-flash": "gemini-2.5-flash",
      "google/gemini-3-flash-preview": "gemini-2.5-flash",
      "google/gemini-3-pro-preview": "gemini-2.5-pro",
    };

    const brandInfo = brandContext?.name
      ? `\n\nBRAND: This deck is for "${brandContext.name}". Use a tone aligned with this brand.`
      : "";

    const imageryInfo = brandHubOnly && approvedCategories?.length
      ? `\n\nIMAGERY CONSTRAINTS: All images must come from the brand's BrandHub library. Available categories: ${approvedCategories.join(", ")}. For each slide that needs an image, set "assetCategory" to the most appropriate category and write a short "imageQuery" (3-6 keywords) describing what to look for. Do NOT invent image URLs.`
      : approvedImagery
        ? `\n\nIMAGERY: Brand assets are available. Suggest "imageQuery" and "assetCategory" per slide where imagery would help.`
        : "";

    const infographicsInfo = enableInfographics
      ? `\n\nINFOGRAPHICS: Actively analyze the content for opportunities to use:
- "stats" layout when 2-4 KPIs/big numbers appear
- "chart" layout (bar/line/pie) when numeric data with categories appears (revenue trends, breakdowns, comparisons)
- "comparison" layout for before/after, vs, pros/cons
- "timeline" layout for chronological events, milestones, history
- "process" layout for step-by-step workflows, methodologies, how-to (3-5 steps)
- "quote" layout for testimonials or notable statements
Extract numeric values and convert them into structured chart/stat/timeline data. Do not just put numbers in body text — use the right layout.`
      : "";

    // Normalize chart-type preferences to a clean array
    const normalizedChartTypes: string[] = Array.isArray(preferredChartTypes)
      ? preferredChartTypes
      : typeof preferredChartTypes === "string"
        ? preferredChartTypes.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const cleanStats = (typeof keyStats === "string" ? keyStats : "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const statsInfo = useStatsForCharts && cleanStats.length
      ? `\n\nKEY STATS — TURN INTO CHARTS (mandatory):
The user provided these stats. You MUST materialize them as one or more dedicated visualization slides — never just bullet them in body text.

Stats:
${cleanStats.map((s) => `- ${s}`).join("\n")}

Rules for choosing the chart layout:
- Time series (entries shaped like "2021: 1.2M", "Q1: $4.2M") → "chart" with type "line"
- Category breakdowns / shares of a whole (e.g. "60% mobile, 30% desktop, 10% tablet") → "chart" with type "pie" or "doughnut"
- Comparisons across 3+ named categories → "chart" with type "bar"
- Standalone single-number KPIs (e.g. "92% retention", "$4.2M ARR") → group 2-4 of these into ONE "stats" layout slide
- Parse percentages, currencies (k/M/B), multipliers (3x), and date prefixes correctly into numeric "value" fields
- Set the chart's "data" array to { label, value } objects with clean numeric values
${normalizedChartTypes.length
  ? `\nUSER PREFERENCE: When possible, prefer these chart types: ${normalizedChartTypes.join(", ")}. Only deviate if a stat genuinely doesn't fit any of these.`
  : `\nNo chart-type preference set — pick the best fit per stat group.`}
Generate at least one chart/stats slide for these numbers. Place them where they best support the deck narrative.`
      : cleanStats.length && !useStatsForCharts
        ? `\n\nKEY STATS (reference only — DO NOT auto-chart):
The user provided these stats but disabled chart generation. Weave them into bullet points naturally; do not create dedicated chart or stats slides for them.
${cleanStats.map((s) => `- ${s}`).join("\n")}`
        : "";

    const formatHint = contentFormat === "structured"
      ? "The content uses headings (## or ###) and bullets — respect that structure when grouping into slides."
      : contentFormat === "freeform"
        ? "The content is free-form notes — analyze meaning, group related ideas, and create logical slide breaks."
        : "Analyze the content and decide the best slide breaks.";

    const userPrompt = content && content.trim()
      ? `Create a ${slideCount}-slide presentation from the following content brief.

${formatHint}

CONTENT BRIEF:
${content.trim()}

${topic ? `Additional context / title hint: ${topic.trim()}` : ""}`
      : `Create a ${slideCount}-slide presentation about: ${topic.trim()}`;

    const systemPrompt = `You are an expert presentation designer and information designer.
Given content, you ANALYZE it deeply, then design a deck with the right layout per slide.

Available layouts:
- title: opening slide
- section: divider/transition slide
- content: bullet text
- two-column: side-by-side text or pros/cons (separate halves with "---" in body)
- comparison: before vs after, A vs B (separate with "---" in body)
- stats: 2-4 big-number KPIs (use "stats" array)
- chart: bar/line/pie/doughnut (use "chart" object with type + data)
- timeline: chronological steps with dates (use "timeline" array)
- process: numbered workflow steps (use "process" array, 3-5 steps)
- quote: a notable quote (put quote in title, attribution in "quoteAuthor")
- image-left / image-right: text + supporting image
- full-image: hero image with title overlay
- blank: minimal

Variants: default (light), dark, gradient, minimal, brand, bold.

Guidelines:
- Open with title (gradient or brand variant)
- Use section dividers between major topics
- Close with section (Thank You / Questions)
- Keep titles under 8 words
- Use bullets (•) in body for content layouts
- Generate exactly ${slideCount} slides${brandInfo}${imageryInfo}${infographicsInfo}`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_slide_deck",
          description: "Generate a structured slide deck with the right layout per slide",
          parameters: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    layout: {
                      type: "string",
                      enum: ["title", "content", "image-left", "image-right", "two-column", "section", "blank", "quote", "stats", "full-image", "comparison", "timeline", "process", "chart"],
                    },
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    body: { type: "string", description: "Body text. Use • for bullets. Use --- to split two-column/comparison." },
                    notes: { type: "string", description: "Speaker notes" },
                    variant: { type: "string", enum: ["default", "dark", "gradient", "minimal", "brand", "bold"] },
                    quoteAuthor: { type: "string" },
                    stats: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          value: { type: "string" },
                          label: { type: "string" },
                        },
                        required: ["value", "label"],
                      },
                    },
                    chart: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["bar", "line", "pie", "doughnut"] },
                        title: { type: "string" },
                        series1Name: { type: "string" },
                        series2Name: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string" },
                              value: { type: "number" },
                            },
                            required: ["label", "value"],
                          },
                        },
                        series2: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string" },
                              value: { type: "number" },
                            },
                            required: ["label", "value"],
                          },
                        },
                      },
                      required: ["type", "data"],
                    },
                    timeline: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string" },
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["title"],
                      },
                    },
                    process: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          description: { type: "string" },
                        },
                        required: ["title"],
                      },
                    },
                    imageQuery: { type: "string", description: "Short keywords (3-6 words) for image matching" },
                    assetCategory: {
                      type: "string",
                      description: "Suggested BrandHub category for the image",
                      enum: ["logos", "brandIcons", "patterns", "photography", "heroImages", "collateral", "social", "banners", "sponsors"],
                    },
                  },
                  required: ["layout", "title", "variant"],
                },
              },
            },
            required: ["slides"],
          },
        },
      },
    ];

    const requestBody = {
      model: useGoogle ? (googleModelMap[selectedModel] || "gemini-2.5-flash") : selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "create_slide_deck" } },
    };

    let apiUrl: string;
    let headers: Record<string, string>;

    if (useGoogle) {
      apiUrl = GOOGLE_GEMINI_URL;
      headers = { Authorization: `Bearer ${googleApiKey}`, "Content-Type": "application/json" };
    } else {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return errorResponse("LOVABLE_API_KEY is not configured", 500);
      apiUrl = LOVABLE_GATEWAY;
      headers = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) return errorResponse("Rate limit exceeded. Please try again in a moment.", 429);
      if (response.status === 402) return errorResponse("AI credits exhausted. Please add funds to continue.", 402);
      if (response.status === 401 || response.status === 403) return errorResponse("Invalid API key. Please check your Google API key.", 401);
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return errorResponse("Failed to generate slides", 500);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) return errorResponse("AI did not return structured slide data", 500);

    const parsed = JSON.parse(toolCall.function.arguments);
    const rawSlides = Array.isArray(parsed.slides) ? parsed.slides : [];

    // Server-side image matching against approved BrandHub assets
    const used = new Set<string>();
    const slides = rawSlides.map((s: any) => {
      const enriched = { ...s };
      const wantsImage = ["title", "section", "image-left", "image-right", "full-image", "content"].includes(s.layout) && (s.imageQuery || s.assetCategory);

      if (wantsImage && approvedImagery) {
        const { url, category } = pickImage(
          approvedImagery as ImageryMap,
          s.imageQuery,
          s.assetCategory,
          imageMatchMode as ImageMatchMode,
          used,
        );
        if (url) {
          enriched.imageUrl = url;
          enriched.assetCategory = category;
        } else if (imageMatchMode === "manual") {
          enriched.needsImage = true;
        }
      }
      return enriched;
    });

    return jsonResponse({ slides });
  } catch (e) {
    console.error("generate-slides error:", e);
    return errorResponse(e instanceof Error ? e.message : "Unknown error", 500);
  }
});
