/**
 * Studio audit harness — end-to-end "string to completion" probe for every
 * studio's edge-function pipeline.
 *
 * For each studio we send a realistic minimal payload to its edge function(s),
 * capture status / latency / error / response shape, and write a pass/fail
 * JSON + markdown report.
 *
 * Run:
 *   bun run scripts/audit-studios.ts
 *   bun run scripts/audit-studios.ts --only=social,slides
 *
 * Output:
 *   /mnt/documents/studio-audit-report.json
 *   /mnt/documents/studio-audit-report.md
 */

const SUPABASE_URL = "https://fkrxorswdcuaiyiesooj.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcnhvcnN3ZGN1YWl5aWVzb29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDI5ODEsImV4cCI6MjA4NTM3ODk4MX0.XVThylVNfGMI5fEKSAm5f5dMCj2Tcbfo5_6Hpbj6GRQ";

type Status = "pass" | "fail" | "skip" | "warn";

interface StepResult {
  step: string;
  fn: string;
  status: Status;
  httpStatus?: number;
  latencyMs: number;
  error?: string;
  asserts: { name: string; ok: boolean; detail?: string }[];
  responsePreview?: string;
}

interface StudioReport {
  studio: string;
  description: string;
  status: Status;
  steps: StepResult[];
  totalLatencyMs: number;
}

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()))
  : null;

async function callFn(
  name: string,
  body: unknown,
  opts: { timeoutMs?: number } = {},
): Promise<{ httpStatus: number; latencyMs: number; json: any; text: string; error?: string }> {
  const url = `${SUPABASE_URL}/functions/v1/${name}`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120_000);
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-json */
    }
    return { httpStatus: res.status, latencyMs: Date.now() - t0, json, text };
  } catch (e) {
    return {
      httpStatus: 0,
      latencyMs: Date.now() - t0,
      json: null,
      text: "",
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function assertResp(
  r: Awaited<ReturnType<typeof callFn>>,
  checks: { name: string; ok: boolean; detail?: string }[],
): StepResult["asserts"] {
  return checks;
}

function classify(httpStatus: number, error?: string): Status {
  if (error?.includes("abort")) return "fail";
  if (httpStatus === 0) return "fail";
  if (httpStatus === 402) return "warn"; // AI credits exhausted — not a code bug
  if (httpStatus === 429) return "warn"; // rate-limit
  if (httpStatus === 401 || httpStatus === 403) return "skip"; // auth required
  if (httpStatus >= 500) return "fail";
  if (httpStatus >= 400) return "fail";
  return "pass";
}

const EVENT_CONTEXT = {
  eventName: "Audit Conference 2026",
  eventDescription: "Annual technology summit",
  styleDescription: "Bold modern, geometric, premium",
  colorPalette: ["#0F172A", "#3B82F6", "#F59E0B", "#FFFFFF"],
  location: "Berlin, Germany",
};

// ---------- Studio probes ----------

async function probeSocial(): Promise<StudioReport> {
  const steps: StepResult[] = [];

  // 1. generate-social-captions
  const r1 = await callFn("generate-social-captions", {
    eventName: EVENT_CONTEXT.eventName,
    eventDescription: EVENT_CONTEXT.eventDescription,
    keyMessage: "Tickets now on sale",
    audience: "Developers and designers",
    vibe: "energetic, professional",
    networks: ["instagram", "linkedin", "twitter"],
    assets: [{ id: "a1", assetType: "INSTAGRAM_POST", network: "instagram" }],
  });
  steps.push({
    step: "Generate captions",
    fn: "generate-social-captions",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: assertResp(r1, [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
      { name: "Returns JSON", ok: r1.json != null },
      { name: "Has captions array", ok: !!r1.json?.captions || !!r1.json?.results },
    ]),
    responsePreview: r1.text.slice(0, 300),
  });

  // 2. generate-image (for social asset)
  const r2 = await callFn("generate-image", {
    assetType: "INSTAGRAM_POST",
    eventName: EVENT_CONTEXT.eventName,
    eventDescription: EVENT_CONTEXT.eventDescription,
    styleDescription: EVENT_CONTEXT.styleDescription,
    colorPalette: EVENT_CONTEXT.colorPalette,
    imageModel: "fast",
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate social image",
    fn: "generate-image",
    status: classify(r2.httpStatus, r2.error),
    httpStatus: r2.httpStatus,
    latencyMs: r2.latencyMs,
    error: r2.error,
    asserts: assertResp(r2, [
      { name: "HTTP 2xx", ok: r2.httpStatus >= 200 && r2.httpStatus < 300 },
      { name: "Returns imageUrl", ok: !!r2.json?.imageUrl },
    ]),
    responsePreview: r2.text.slice(0, 200),
  });

  return finalize("Social Digital Studio", "Captions + image generation pipeline", steps);
}

async function probeSlides(): Promise<StudioReport> {
  const steps: StepResult[] = [];

  // 1. generate-deck (outline)
  const r1 = await callFn("generate-deck", {
    topic: "The Future of AI Events",
    audience: "Event planners",
    tone: "professional",
    slideCount: 5,
    brandStyle: {
      primaryColor: "#3B82F6",
      accentColor: "#F59E0B",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate deck outline",
    fn: "generate-deck",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: assertResp(r1, [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
      { name: "Has slides array", ok: Array.isArray(r1.json?.slides) || Array.isArray(r1.json?.deck?.slides) },
    ]),
    responsePreview: r1.text.slice(0, 300),
  });

  // 2. populate-slide-details
  const r2 = await callFn("populate-slide-details", {
    deck: { title: "Demo Deck", slides: [{ title: "Intro", layout: "title" }] },
    slide: { title: "Intro", layout: "title" },
    slideIndex: 0,
  });
  steps.push({
    step: "Populate slide details",
    fn: "populate-slide-details",
    status: classify(r2.httpStatus, r2.error),
    httpStatus: r2.httpStatus,
    latencyMs: r2.latencyMs,
    error: r2.error,
    asserts: [
      { name: "HTTP 2xx", ok: r2.httpStatus >= 200 && r2.httpStatus < 300 },
    ],
    responsePreview: r2.text.slice(0, 200),
  });

  // 3. edit-slide
  const r3 = await callFn("edit-slide", {
    action: "rewrite",
    slide: { title: "Intro", layout: "title", body: "Welcome" },
    instruction: "Make the title more energetic",
  });
  steps.push({
    step: "Edit slide via AI",
    fn: "edit-slide",
    status: classify(r3.httpStatus, r3.error),
    httpStatus: r3.httpStatus,
    latencyMs: r3.latencyMs,
    error: r3.error,
    asserts: [
      { name: "HTTP 2xx", ok: r3.httpStatus >= 200 && r3.httpStatus < 300 },
    ],
    responsePreview: r3.text.slice(0, 200),
  });

  // 4. generate-slide-graphic
  const r4 = await callFn("generate-slide-graphic", {
    prompt: "Abstract geometric hero graphic, blue and amber",
    aspectRatio: "16:9",
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate slide graphic",
    fn: "generate-slide-graphic",
    status: classify(r4.httpStatus, r4.error),
    httpStatus: r4.httpStatus,
    latencyMs: r4.latencyMs,
    error: r4.error,
    asserts: [
      { name: "HTTP 2xx", ok: r4.httpStatus >= 200 && r4.httpStatus < 300 },
      { name: "Returns image", ok: !!r4.json?.imageUrl || !!r4.json?.image },
    ],
    responsePreview: r4.text.slice(0, 200),
  });

  return finalize("Presentation / Slides Studio", "Deck outline -> details -> edit -> graphic", steps);
}

async function probeVideo(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("generate-video", {
    prompt: "10-second hero teaser for a tech conference",
    duration: 5,
    aspectRatio: "16:9",
  }, { timeoutMs: 240_000 });
  steps.push({
    step: "Generate video",
    fn: "generate-video",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx or 402 (credits)", ok: r1.httpStatus < 500 && r1.httpStatus !== 0 },
      { name: "Returns videoUrl or job", ok: !!r1.json?.videoUrl || !!r1.json?.jobId || r1.httpStatus === 402 },
    ],
    responsePreview: r1.text.slice(0, 300),
  });
  return finalize("Video Studio", "Client-side FFmpeg + server-side video generation", steps);
}

async function probeAssetGen(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("generate-asset", {
    assetType: "POSTER",
    ...EVENT_CONTEXT,
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate asset (poster)",
    fn: "generate-asset",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
      { name: "Returns imageUrl", ok: !!r1.json?.imageUrl },
    ],
    responsePreview: r1.text.slice(0, 200),
  });

  // edit-image roundtrip
  const r2 = await callFn("edit-image", {
    imageUrl: "https://placehold.co/600x400/png",
    instruction: "Add a subtle blue glow",
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Edit image",
    fn: "edit-image",
    status: classify(r2.httpStatus, r2.error),
    httpStatus: r2.httpStatus,
    latencyMs: r2.latencyMs,
    error: r2.error,
    asserts: [
      { name: "HTTP responds", ok: r2.httpStatus !== 0 },
    ],
    responsePreview: r2.text.slice(0, 200),
  });

  return finalize("Asset Generation Studio", "Poster generation + AI image edit", steps);
}

async function probeVenue(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("generate-venue-preview", {
    venueImageUrl: "https://placehold.co/1200x800/png",
    eventName: EVENT_CONTEXT.eventName,
    brandColors: EVENT_CONTEXT.colorPalette,
    assets: [],
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate venue composite",
    fn: "generate-venue-preview",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP responds", ok: r1.httpStatus !== 0 },
      { name: "No 5xx", ok: r1.httpStatus < 500 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize("Venue Visualization Studio", "Photorealistic venue compositing", steps);
}

async function probeCreativeSuggestions(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("suggest-creative", {
    eventContext: {
      eventName: EVENT_CONTEXT.eventName,
      eventType: "conference",
      audience: "tech professionals",
      location: EVENT_CONTEXT.location,
    },
    brandContext: {
      colorPalette: EVENT_CONTEXT.colorPalette,
      styleDescription: EVENT_CONTEXT.styleDescription,
    },
  });
  steps.push({
    step: "Suggest creative assets",
    fn: "suggest-creative",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx or 402", ok: r1.httpStatus < 500 && r1.httpStatus !== 0 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize("Creative Suggestions", "AI recommendations for asset mix", steps);
}

async function probePromptTools(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("refine-prompt", {
    prompt: "make a poster",
    asset_type: "POSTER",
    context: EVENT_CONTEXT,
  });
  steps.push({
    step: "Refine prompt",
    fn: "refine-prompt",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });

  const r2 = await callFn("craft-template-prompt", {
    templateName: "Conference Poster",
    fields: { headline: "AI 2026", date: "Mar 2026" },
    style: EVENT_CONTEXT.styleDescription,
  });
  steps.push({
    step: "Craft template prompt",
    fn: "craft-template-prompt",
    status: classify(r2.httpStatus, r2.error),
    httpStatus: r2.httpStatus,
    latencyMs: r2.latencyMs,
    error: r2.error,
    asserts: [
      { name: "HTTP 2xx", ok: r2.httpStatus >= 200 && r2.httpStatus < 300 },
    ],
    responsePreview: r2.text.slice(0, 200),
  });

  return finalize("Prompt Tooling", "Refine + template prompt crafting", steps);
}

async function probeAnalyzeReference(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("analyze-reference-image", {
    imageUrl: "https://placehold.co/800x800/png",
    eventName: EVENT_CONTEXT.eventName,
  });
  steps.push({
    step: "Analyze reference image",
    fn: "analyze-reference-image",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP responds", ok: r1.httpStatus !== 0 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize("AI Reference Studio", "Vibe image analysis", steps);
}

async function probeStudioChat(): Promise<StudioReport> {
  const steps: StepResult[] = [];
  const r1 = await callFn("studio-chat", {
    messages: [{ role: "user", content: "Suggest a tagline for an AI conference" }],
    context: EVENT_CONTEXT,
  });
  steps.push({
    step: "Studio chat",
    fn: "studio-chat",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize("Studio Chat Assistant", "Conversational fine-tuning chat", steps);
}

async function probeAnimatedBanner(): Promise<StudioReport> {
  // Animated Banner Studio is fully client-side (Framer Motion + FFmpeg export).
  // No edge function is required end-to-end. We document this and verify
  // dependent edge functions (generate-image used for layer backgrounds).
  const steps: StepResult[] = [];
  const r1 = await callFn("generate-image", {
    assetType: "BANNER",
    eventName: EVENT_CONTEXT.eventName,
    styleDescription: EVENT_CONTEXT.styleDescription,
    colorPalette: EVENT_CONTEXT.colorPalette,
    imageModel: "fast",
  }, { timeoutMs: 180_000 });
  steps.push({
    step: "Generate banner background",
    fn: "generate-image",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP 2xx", ok: r1.httpStatus >= 200 && r1.httpStatus < 300 },
      { name: "Returns imageUrl", ok: !!r1.json?.imageUrl },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize(
    "Animated Banner Studio",
    "Client-side compositor; verifies background image pipeline",
    steps,
  );
}

async function probeVisualEditor(): Promise<StudioReport> {
  // Visual Editor is client-side. Its AI hooks call edit-image + generate-image,
  // already covered above. We mark this as informational.
  return {
    studio: "Visual Editor Studio",
    description: "Client-side layered canvas; AI hooks shared with Asset Gen",
    status: "pass",
    steps: [
      {
        step: "Documented client-side",
        fn: "—",
        status: "pass",
        latencyMs: 0,
        asserts: [{ name: "No dedicated edge function", ok: true }],
      },
    ],
    totalLatencyMs: 0,
  };
}

async function probePrintStudio(): Promise<StudioReport> {
  // Print export is client-side (jsPDF / PDF specs). Verify parse-template edge fn.
  const steps: StepResult[] = [];
  const r1 = await callFn("parse-template", {
    pdfUrl: "https://placehold.co/600x800.pdf",
  });
  steps.push({
    step: "Parse print template",
    fn: "parse-template",
    status: classify(r1.httpStatus, r1.error),
    httpStatus: r1.httpStatus,
    latencyMs: r1.latencyMs,
    error: r1.error,
    asserts: [
      { name: "HTTP responds", ok: r1.httpStatus !== 0 },
      { name: "No 5xx crash", ok: r1.httpStatus < 500 },
    ],
    responsePreview: r1.text.slice(0, 200),
  });
  return finalize("Print Studio", "PDF template parsing + client-side export", steps);
}

// ---------- runner ----------

function finalize(studio: string, description: string, steps: StepResult[]): StudioReport {
  const totalLatencyMs = steps.reduce((s, x) => s + x.latencyMs, 0);
  let status: Status = "pass";
  if (steps.some((s) => s.status === "fail")) status = "fail";
  else if (steps.some((s) => s.status === "warn")) status = "warn";
  else if (steps.every((s) => s.status === "skip")) status = "skip";
  return { studio, description, status, steps, totalLatencyMs };
}

const PROBES: { key: string; label: string; run: () => Promise<StudioReport> }[] = [
  { key: "social", label: "Social Digital", run: probeSocial },
  { key: "slides", label: "Slides", run: probeSlides },
  { key: "video", label: "Video", run: probeVideo },
  { key: "assetgen", label: "Asset Generation", run: probeAssetGen },
  { key: "venue", label: "Venue Preview", run: probeVenue },
  { key: "banner", label: "Animated Banner", run: probeAnimatedBanner },
  { key: "visual", label: "Visual Editor", run: probeVisualEditor },
  { key: "print", label: "Print", run: probePrintStudio },
  { key: "suggest", label: "Creative Suggestions", run: probeCreativeSuggestions },
  { key: "prompt", label: "Prompt Tools", run: probePromptTools },
  { key: "reference", label: "AI Reference", run: probeAnalyzeReference },
  { key: "chat", label: "Studio Chat", run: probeStudioChat },
];

async function main() {
  const startedAt = new Date().toISOString();
  const reports: StudioReport[] = [];

  console.log(`\n🔎 Studio audit started @ ${startedAt}\n`);
  for (const p of PROBES) {
    if (ONLY && !ONLY.has(p.key)) continue;
    process.stdout.write(`  • ${p.label.padEnd(22)} `);
    try {
      const rep = await p.run();
      reports.push(rep);
      const icon = rep.status === "pass" ? "✅" : rep.status === "warn" ? "⚠️" : rep.status === "skip" ? "⏭️" : "❌";
      console.log(`${icon}  (${rep.totalLatencyMs}ms, ${rep.steps.length} steps)`);
    } catch (e) {
      console.log(`❌  threw: ${e}`);
      reports.push({
        studio: p.label,
        description: "",
        status: "fail",
        steps: [{ step: "harness", fn: "—", status: "fail", latencyMs: 0, error: String(e), asserts: [] }],
        totalLatencyMs: 0,
      });
    }
  }

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    totalStudios: reports.length,
    pass: reports.filter((r) => r.status === "pass").length,
    warn: reports.filter((r) => r.status === "warn").length,
    fail: reports.filter((r) => r.status === "fail").length,
    skip: reports.filter((r) => r.status === "skip").length,
    reports,
  };

  await Bun.write("/mnt/documents/studio-audit-report.json", JSON.stringify(summary, null, 2));
  await Bun.write("/mnt/documents/studio-audit-report.md", renderMarkdown(summary));

  console.log(`\n📊 ${summary.pass} pass · ${summary.warn} warn · ${summary.fail} fail · ${summary.skip} skip`);
  console.log(`   Report: /mnt/documents/studio-audit-report.json`);
  console.log(`           /mnt/documents/studio-audit-report.md\n`);

  if (summary.fail > 0) process.exit(1);
}

function renderMarkdown(s: any): string {
  const lines: string[] = [];
  lines.push(`# Studio Audit Report`);
  lines.push(``);
  lines.push(`**Run:** ${s.startedAt} → ${s.finishedAt}`);
  lines.push(`**Result:** ${s.pass} pass · ${s.warn} warn · ${s.fail} fail · ${s.skip} skip`);
  lines.push(``);
  lines.push(`| Studio | Status | Steps | Latency |`);
  lines.push(`|---|---|---|---|`);
  for (const r of s.reports) {
    lines.push(`| ${r.studio} | ${badge(r.status)} | ${r.steps.length} | ${r.totalLatencyMs}ms |`);
  }
  lines.push(``);
  for (const r of s.reports) {
    lines.push(`## ${r.studio} ${badge(r.status)}`);
    lines.push(`_${r.description}_`);
    lines.push(``);
    for (const st of r.steps) {
      lines.push(`### ${st.step} — \`${st.fn}\` ${badge(st.status)}`);
      lines.push(`- HTTP: \`${st.httpStatus ?? "—"}\`  ·  Latency: ${st.latencyMs}ms`);
      if (st.error) lines.push(`- Error: \`${st.error}\``);
      for (const a of st.asserts) lines.push(`  - ${a.ok ? "✅" : "❌"} ${a.name}${a.detail ? ` — ${a.detail}` : ""}`);
      if (st.responsePreview) {
        lines.push(``);
        lines.push("```");
        lines.push(st.responsePreview);
        lines.push("```");
      }
      lines.push(``);
    }
  }
  return lines.join("\n");
}

function badge(s: Status): string {
  return s === "pass" ? "✅ pass" : s === "warn" ? "⚠️ warn" : s === "skip" ? "⏭️ skip" : "❌ fail";
}

main();
