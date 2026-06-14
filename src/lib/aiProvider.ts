// Client-side AI provider registry & helpers.
// Lets the UI offer Gemini (default), GPT, and Claude per task without
// rewriting every call site. Persists selection in localStorage; falls back
// to per-task defaults.

import { supabase } from "@/integrations/supabase/client";

export type AiProvider = "gemini" | "openai" | "anthropic";

export type AiTask =
  | "deck-outline"
  | "brand-insights"
  | "voice-reasoning"
  | "slide-copy"
  | "general";

export interface AiModelOption {
  id: string;
  provider: AiProvider;
  label: string;
  tier: "fast" | "balanced" | "max";
  notes?: string;
}

export const AI_PROVIDERS: Record<AiProvider, { label: string; badge: string }> = {
  gemini: { label: "Google Gemini", badge: "Gemini" },
  openai: { label: "OpenAI GPT", badge: "GPT" },
  anthropic: { label: "Anthropic Claude", badge: "Claude" },
};

export const AI_MODELS: AiModelOption[] = [
  // Gemini (via Lovable Gateway)
  { id: "google/gemini-3-flash-preview", provider: "gemini", label: "Gemini 3 Flash", tier: "fast", notes: "Default. Fast." },
  { id: "google/gemini-2.5-pro", provider: "gemini", label: "Gemini 2.5 Pro", tier: "max", notes: "Strong reasoning + vision." },
  // OpenAI (via Lovable Gateway)
  { id: "openai/gpt-5", provider: "openai", label: "GPT-5", tier: "max" },
  { id: "openai/gpt-5-mini", provider: "openai", label: "GPT-5 mini", tier: "balanced" },
  // Anthropic (via dedicated edge functions)
  { id: "claude-sonnet-4-5", provider: "anthropic", label: "Claude Sonnet 4.5", tier: "balanced", notes: "Recommended for deck reasoning & brand copy." },
  { id: "claude-opus-4-5", provider: "anthropic", label: "Claude Opus 4.5", tier: "max", notes: "Highest fidelity. Slower." },
  { id: "claude-haiku-4-5", provider: "anthropic", label: "Claude Haiku 4.5", tier: "fast", notes: "Fast copy & classification." },
];

const TASK_DEFAULTS: Record<AiTask, string> = {
  "deck-outline": "google/gemini-2.5-pro",
  "brand-insights": "google/gemini-3-flash-preview",
  "voice-reasoning": "google/gemini-3-flash-preview",
  "slide-copy": "google/gemini-3-flash-preview",
  general: "google/gemini-3-flash-preview",
};

const STORAGE_KEY = "eventkit:ai-preferences:v1";

export type AiPreferences = Partial<Record<AiTask, string>>;

export function loadAiPreferences(): AiPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AiPreferences) : {};
  } catch {
    return {};
  }
}

export function saveAiPreferences(prefs: AiPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota errors */
  }
}

export function getModelForTask(task: AiTask): AiModelOption {
  const prefs = loadAiPreferences();
  const id = prefs[task] ?? TASK_DEFAULTS[task];
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}

export function getProviderForTask(task: AiTask): AiProvider {
  return getModelForTask(task).provider;
}

/**
 * High-level Claude invocation that targets the right edge function for a task.
 * Returns plain text. For structured tasks, hit the edge function directly.
 */
export async function invokeClaude(opts: {
  task: "brand-insights" | "deck-outline";
  body: Record<string, unknown>;
  signal?: AbortSignal;
}): Promise<unknown> {
  const fn = opts.task === "deck-outline" ? "generate-deck-claude" : "brand-insights-claude";
  const { data, error } = await supabase.functions.invoke(fn, {
    body: opts.body,
  });
  if (error) throw error;
  return data;
}

/**
 * Helper that decides which deck-outline backend to call based on the user's
 * provider preference. Returns the same shape the renderer expects.
 */
export async function planDeckOutline(args: {
  topic: string;
  slideCount: number;
  audience?: string;
  tone?: string;
  brandName?: string;
  brandVoice?: string;
  palette?: string[];
  sourceSummary?: string;
  keyFacts?: string[];
}): Promise<{ provider: AiProvider; outline: unknown }> {
  const model = getModelForTask("deck-outline");
  if (model.provider === "anthropic") {
    const data = (await invokeClaude({
      task: "deck-outline",
      body: { ...args, model: model.id },
    })) as { outline: unknown };
    return { provider: "anthropic", outline: data.outline };
  }
  // Existing Gemini/GPT path — generate-deck already supports prebuiltOutline,
  // so callers can pass null here and let generate-deck plan + render.
  return { provider: model.provider, outline: null };
}
