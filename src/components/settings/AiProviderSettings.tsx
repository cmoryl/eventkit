// User-facing model picker per task. Persists to localStorage via aiProvider helpers.
// Drop into Settings or the Admin Suite to expose Claude alongside Gemini/GPT.

import { useEffect, useState } from "react";
import {
  AI_MODELS,
  AI_PROVIDERS,
  loadAiPreferences,
  saveAiPreferences,
  type AiPreferences,
  type AiTask,
} from "@/lib/aiProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const TASKS: { id: AiTask; label: string; description: string }[] = [
  {
    id: "deck-outline",
    label: "Deck outline & structure",
    description: "Plans slide narrative, layouts, and key points.",
  },
  {
    id: "brand-insights",
    label: "Brand insights & copywriting",
    description: "Taglines, brand DNA, event copy, sponsor activation.",
  },
  {
    id: "slide-copy",
    label: "Slide copy refinement",
    description: "Rewrites headlines, bullets, and speaker notes.",
  },
  {
    id: "voice-reasoning",
    label: "Voice agent reasoning",
    description: "Model that powers the voice assistant's responses.",
  },
];

export function AiProviderSettings() {
  const [prefs, setPrefs] = useState<AiPreferences>({});

  useEffect(() => {
    setPrefs(loadAiPreferences());
  }, []);

  function update(task: AiTask, modelId: string) {
    const next = { ...prefs, [task]: modelId };
    setPrefs(next);
    saveAiPreferences(next);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI providers</h2>
          <p className="text-sm text-muted-foreground">
            Choose which model powers each task. Claude is available for reasoning-heavy work; Gemini and GPT remain available for image-aware and high-volume tasks.
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {TASKS.map((task) => {
          const currentId = prefs[task.id];
          const current = AI_MODELS.find((m) => m.id === currentId) ?? AI_MODELS[0];
          return (
            <div
              key={task.id}
              className="rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{task.label}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {AI_PROVIDERS[current.provider].badge}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                </div>
                <div className="w-full sm:w-[260px]">
                  <Select value={currentId ?? current.id} onValueChange={(v) => update(task.id, v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["anthropic", "gemini", "openai"] as const).map((provider) => (
                        <div key={provider}>
                          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {AI_PROVIDERS[provider].label}
                          </div>
                          {AI_MODELS.filter((m) => m.provider === provider).map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex flex-col">
                                <span>{m.label}</span>
                                {m.notes && (
                                  <span className="text-[10px] text-muted-foreground">{m.notes}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Anthropic Claude calls use your <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> secret. Gemini and GPT calls use the Lovable AI gateway.
      </p>
    </div>
  );
}
