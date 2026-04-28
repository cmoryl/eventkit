import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { requireUser } from "../_shared/auth.ts";

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

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

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
      // Advanced infographic interpretation
      dataLens,                       // string|string[] — trend, comparison, composition...
      preferredInfographicLayouts,    // string|string[] — timeline, funnel, quadrant...
      narrativeStyle,                 // 'data-led' | 'story-led' | 'exec-summary' | 'analyst'
      infoDensity,                    // 'minimal' | 'balanced' | 'dense'
      colorEmphasis,                  // 'brand' | 'sequential' | 'diverging' | 'mono'
      annotateInsights,               // boolean-ish
      showSourceAttribution,          // boolean-ish
      normalizeUnits,                 // boolean-ish
      inferBenchmarks,                // boolean-ish
      preferIconography,              // boolean-ish
      autoTitleInsights,              // boolean-ish
      infographicNotes,               // free-form string — highest-priority interpretation guidance
      executiveSummaryNotes,          // free-form string — drives opening summary + closing takeaways
      chartCalloutNotes,              // free-form string — per-chart annotations and callouts
      // Optional style anchors picked by the user from the BrandHub assets library.
      // Each entry: { url, name, category: 'deck'|'document'|'image'|'video', sectionLabel, sourceName }
      references,
    } = await req.json();

    const clampedSlideCount = Math.min(Math.max(parseInt(String(slideCount)) || 6, 1), 20);

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

    // ── Advanced infographic interpretation ───────────────────────────────
    const toArr = (v: unknown): string[] =>
      Array.isArray(v)
        ? v.map(String).map((s) => s.trim()).filter(Boolean)
        : typeof v === "string"
          ? v.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
    const toBool = (v: unknown): boolean =>
      v === true || v === "true" || v === 1 || v === "1";

    const lensList = toArr(dataLens);
    const layoutsList = toArr(preferredInfographicLayouts);

    const advancedFlags: string[] = [];
    if (toBool(annotateInsights)) advancedFlags.push("Add concise callout annotations on chart slides where values spike, drop, or cross thresholds (use the slide's `notes` field if no annotation slot exists).");
    if (toBool(showSourceAttribution)) advancedFlags.push('Include a brief source line on every data slide (e.g. append "Source: …" to the body or notes).');
    if (toBool(normalizeUnits)) advancedFlags.push("Normalize units across charts: consistent currency symbol, k/M/B suffix, and % vs ratios — never mix.");
    if (toBool(inferBenchmarks)) advancedFlags.push("Where reasonable, infer a sensible industry benchmark or prior-period reference and add it as a second data series on comparison/line charts.");
    if (toBool(preferIconography)) advancedFlags.push("In timeline/process/comparison slides, prefer iconographic step descriptions (short label + emoji-style icon hint in the description) over long sentences.");
    if (toBool(autoTitleInsights)) advancedFlags.push('Write insight-style slide titles, not category labels. e.g. "Retention up 18% YoY" instead of "Retention".');

    const densityHint =
      infoDensity === "minimal"
        ? "Information density: MINIMAL. Max 3 bullets per slide, max 4 chart data points, lots of whitespace."
        : infoDensity === "dense"
          ? "Information density: DENSE. Up to 6 bullets, up to 8-10 chart data points, multi-series charts welcome."
          : infoDensity
            ? "Information density: BALANCED."
            : "";

    const colorHint = colorEmphasis
      ? `Color emphasis for charts: "${colorEmphasis}" — ${
          colorEmphasis === "sequential"
            ? "use a single-hue gradient (light → dark) for ordered data."
            : colorEmphasis === "diverging"
              ? "use a two-hue diverging palette around a midpoint (e.g. red ↔ green)."
              : colorEmphasis === "mono"
                ? "use a single brand hue with opacity steps; avoid rainbow palettes."
                : "use the brand's primary palette as the dominant chart colors."
        }`
      : "";

    const narrativeHint = narrativeStyle
      ? `Narrative style: "${narrativeStyle}" — ${
          narrativeStyle === "data-led"
            ? "lead with numbers; titles state the number, body explains it."
            : narrativeStyle === "story-led"
              ? "lead with the insight/story; data appears as supporting evidence."
              : narrativeStyle === "exec-summary"
                ? "every slide stands alone with one headline + one chart/stat — no deep dives."
                : "analyst deep-dive — multiple cuts of the same data, drill-downs encouraged."
        }`
      : "";

    const execNotesText = typeof executiveSummaryNotes === "string" ? executiveSummaryNotes.trim() : "";
    const chartNotesText = typeof chartCalloutNotes === "string" ? chartCalloutNotes.trim() : "";
    const insightNotesText = typeof infographicNotes === "string" ? infographicNotes.trim() : "";

    const advancedInfographicsInfo =
      lensList.length || layoutsList.length || advancedFlags.length || densityHint || colorHint || narrativeHint || insightNotesText || execNotesText || chartNotesText
        ? `\n\nADVANCED INFOGRAPHIC INTERPRETATION:
${lensList.length ? `- Data lens (emphasize these angles when interpreting numbers): ${lensList.join(", ")}` : ""}
${layoutsList.length ? `- Preferred infographic layouts (use these where the content fits): ${layoutsList.join(", ")}. Map them to the closest available slide layout — e.g. "funnel"/"pyramid" → "process" with ordered steps, "quadrant"/"venn"/"comparison-table" → "comparison" or "two-column", "icon-array" → "stats", "gauge" → "stats" with single KPI, "map" → "full-image" with imageQuery hint.` : ""}
${narrativeHint ? `- ${narrativeHint}` : ""}
${densityHint ? `- ${densityHint}` : ""}
${colorHint ? `- ${colorHint} (Express via the chart's data ordering and the slide's variant choice — e.g. "brand" variant for brand emphasis, "minimal" for mono.)` : ""}
${advancedFlags.length ? advancedFlags.map((f) => `- ${f}`).join("\n") : ""}
${insightNotesText ? `- User interpretation notes (highest priority — overrides other settings): ${insightNotesText}` : ""}
${execNotesText ? `\nEXECUTIVE SUMMARY NOTES — drive the opening summary slide AND the closing takeaways slide:
${execNotesText}
Rules:
- Insert a dedicated "content" or "stats" slide right after the title slide that materializes this summary (variant: "brand" or "gradient"). Title it as the bottom-line insight, not "Executive Summary".
- Insert a closing "section" or "content" slide before any Thank-You that mirrors the same takeaways as 3 short bullets.
- Keep both slides scannable in <10 seconds. No deep dives.` : ""}
${chartNotesText ? `\nCHART CALLOUT NOTES — apply per chart/stats slide:
${chartNotesText}
Rules:
- For every "chart" or "stats" slide, scan these notes and apply the matching annotations.
- Encode callouts in the slide's "notes" field (one line per callout) so the renderer can surface them as annotations.
- If a note specifies a target line, reference series, or color treatment, reflect it in the chart's data ordering, series2/series2Name, or variant choice.
- If a note names a chart that does not yet exist, create that chart slide.` : ""}`.replace(/\n{3,}/g, "\n\n")
        : "";

    const formatHint = contentFormat === "structured"
      ? "The content uses headings (## or ###) and bullets — respect that structure when grouping into slides."
      : contentFormat === "freeform"
        ? "The content is free-form notes — analyze meaning, group related ideas, and create logical slide breaks."
        : "Analyze the content and decide the best slide breaks.";

    const userPrompt = content && content.trim()
      ? `Create a ${clampedSlideCount}-slide presentation from the following content brief.

${formatHint}

CONTENT BRIEF:
${content.trim()}

${topic ? `Additional context / title hint: ${topic.trim()}` : ""}`
      : `Create a ${clampedSlideCount}-slide presentation about: ${topic.trim()}`;

    const systemPrompt = `You are a world-class presentation designer. You create decks that communicate clearly, look stunning, and drive action. Given content, you ANALYZE it deeply and architect a deck with a strong narrative arc, visual rhythm, and the right layout for every moment.

═══ LAYOUT REFERENCE ═══

TEXT & STRUCTURE
- title: Opening slide — grand first impression. Required as slide 1.
- section: Divider/transition — marks a new chapter. Use between major topics.
- content: Bullet text — max 5 bullets, each under 10 words. Use for core points.
- two-column: Side-by-side — pros/cons, do/don't, tips/tricks (split with "---" in body).
- blank: Open canvas — minimal, no chrome.

VISUAL HIGHLIGHTS
- agenda: Numbered table of contents — body is newline-separated agenda items. Use as slide 2 on longer decks.
- stats: 2-4 giant KPIs — use "stats" array [{value, label}]. Never repeat in body text.
- big-number: ONE hero metric — use "stats[0]" for value+label, "subtitle" for context. Maximum impact for your single most important number.
- quote: A standout testimonial or insight — quote goes in "title", attribution in "quoteAuthor".
- full-image: Hero image with title overlay — stunning visual moment.

DATA VISUALIZATION
- chart: Recharts chart — use "chart" object {type, title, data, series2}:
  • bar: compare categories (default for most comparisons)
  • line: show trends over time
  • pie / doughnut: show composition / share of whole (max 5 slices)
- timeline: Chronological milestones — use "timeline" array [{date, title, description}], max 6 steps.
- process: Numbered workflow — use "process" array [{title, description}], 3-5 steps with arrows.
- comparison: Before/after, A vs B — two panels split with "---" in body.
- image-left / image-right: Text + supporting visual.

═══ VARIANT GUIDE ═══
- default: Clean white — workhorse for content-heavy slides
- minimal: Soft gray — data and charts, maximum clarity
- dark: Deep slate — drama, quotes, section breaks
- gradient: Indigo-to-slate — title slides, opening impact
- brand: Indigo — hero moments: stats, big-number, key insights
- bold: Pure black — high-contrast punch, bold section breaks

═══ NARRATIVE ARC RULES ═══
1. OPEN STRONG — slide 1 always: layout "title", variant "gradient" or "brand"
2. SIGNPOST — for decks ≥ 8 slides, add an "agenda" layout as slide 2
3. BUILD — alternate between text (content/two-column) and visual (chart/stats/big-number) slides. Never put two content slides back to back.
4. PEAK — place your strongest data insight (big-number or stats, variant "brand") at the ⅔ mark
5. CLOSE — end with a "section" slide (variant "dark" or "gradient") — never end on a data slide

═══ COPY RULES ═══
- Titles: state the INSIGHT, not the category. "Retention up 22% YoY" not "Retention". Under 8 words.
- Bullets: start each with a verb or number. No filler words. 5 bullets max.
- Stats: pick values that surprise or prove a point. Label in 1-3 words.
- Speaker notes: EVERY slide must have a "notes" field with 1-2 sentences the presenter should say — context, caveats, or the "so what."

═══ VISUAL RHYTHM RULE ═══
Score your deck on this pattern — it should never read like: content, content, content.
Good rhythm example: title → agenda → stats → content → chart → quote → big-number → section
Bad rhythm: title → content → content → content → chart → content → section

═══ DATA EXTRACTION ═══
When the content contains numbers, percentages, or trends — DO NOT put them in bullets. Extract and use:
- 2-4 KPIs → "stats" layout
- 1 hero metric → "big-number" layout
- Time series / category data → "chart" layout
- Chronological events → "timeline" layout
- Step-by-step → "process" layout

Generate exactly ${clampedSlideCount} slides${brandInfo}${imageryInfo}${infographicsInfo}${statsInfo}${advancedInfographicsInfo}${referencesInfo}`;

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
                      enum: ["title", "content", "image-left", "image-right", "two-column", "section", "blank", "quote", "stats", "full-image", "comparison", "timeline", "process", "chart", "agenda", "big-number"],
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

    let parsed: { slides?: unknown[] };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return errorResponse("AI returned malformed slide data — please try again", 500);
    }
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
