// Standalone Claude-powered copywriter. Drop anywhere — pass brand/event context.
// Calls the brand-insights-claude edge function (Anthropic) and streams results.

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { streamEdgeFunction } from "@/lib/aiStream";

type Task = "tagline" | "brand_dna" | "event_description" | "sponsor_copy" | "slide_copy";

interface Props {
  trigger?: React.ReactNode;
  context?: {
    brandName?: string;
    brandVoice?: string;
    eventName?: string;
    eventDescription?: string;
    audience?: string;
    tone?: string;
    palette?: string[];
  };
  defaultTask?: Task;
}

const TASK_LABELS: Record<Task, string> = {
  tagline: "Taglines",
  brand_dna: "Brand DNA",
  event_description: "Event description",
  sponsor_copy: "Sponsor copy",
  slide_copy: "Slide copy",
};

export function ClaudeBrandCopyDialog({ trigger, context = {}, defaultTask = "tagline" }: Props) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<Task>(defaultTask);
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [dna, setDna] = useState<{ essence: string; pillars: string[]; differentiator: string; toneWords: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    setDna(null);
    try {
      const { data, error } = await supabase.functions.invoke("brand-insights-claude", {
        body: {
          task,
          context: { ...context, notes: extra || undefined },
          count: 5,
        },
      });
      if (error) throw new Error(error.message);
      if (task === "brand_dna" && data?.result) {
        setDna(data.result);
      } else if (typeof data?.text === "string") {
        setResult(data.text);
      } else {
        setResult(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("ANTHROPIC_API_KEY")) {
        toast.error("Claude key missing. Ask an admin to set ANTHROPIC_API_KEY.");
      } else if (msg.includes("rate")) {
        toast.error("Claude rate-limited. Try again in a moment.");
      } else if (msg.includes("credit") || msg.includes("402")) {
        toast.error("Anthropic credits exhausted.");
      } else {
        toast.error(msg || "Claude request failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    const text = dna
      ? `Essence: ${dna.essence}\n\nPillars:\n- ${dna.pillars.join("\n- ")}\n\nDifferentiator: ${dna.differentiator}\n\nTone: ${dna.toneWords.join(", ")}`
      : result ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Claude copy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Generate with Claude
            <Badge variant="secondary" className="text-[10px]">Anthropic Sonnet 4.5</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={task} onValueChange={(v) => setTask(v as Task)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-5 h-auto">
            {(Object.keys(TASK_LABELS) as Task[]).map((t) => (
              <TabsTrigger key={t} value={t} className="text-[10px] py-1.5 px-2">
                {TASK_LABELS[t]}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(TASK_LABELS) as Task[]).map((t) => (
            <TabsContent key={t} value={t} className="mt-3 flex-1 overflow-y-auto space-y-3">
              {(context.brandName || context.eventName) && (
                <div className="text-[11px] text-muted-foreground">
                  Using context: {context.brandName && <Badge variant="outline" className="text-[10px] mr-1">{context.brandName}</Badge>}
                  {context.eventName && <Badge variant="outline" className="text-[10px]">{context.eventName}</Badge>}
                </div>
              )}
              <Textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Optional extra direction (e.g. 'lean playful, avoid corporate jargon')"
                className="rounded-xl text-sm min-h-[70px]"
              />
              <Button onClick={run} disabled={loading} className="w-full rounded-xl gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate {TASK_LABELS[t].toLowerCase()}
              </Button>

              {dna && task === "brand_dna" && (
                <div className="rounded-xl border border-border/60 bg-card/40 p-3 space-y-2 text-sm">
                  <div><span className="text-xs text-muted-foreground">Essence</span><p>{dna.essence}</p></div>
                  <div><span className="text-xs text-muted-foreground">Pillars</span>
                    <ul className="list-disc pl-5 mt-0.5">{dna.pillars.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                  <div><span className="text-xs text-muted-foreground">Differentiator</span><p>{dna.differentiator}</p></div>
                  <div><span className="text-xs text-muted-foreground">Tone words</span>
                    <div className="flex flex-wrap gap-1 mt-1">{dna.toneWords.map((w) => <Badge key={w} variant="secondary" className="text-[10px]">{w}</Badge>)}</div>
                  </div>
                </div>
              )}

              {result && !dna && (
                <pre className="rounded-xl border border-border/60 bg-card/40 p-3 text-sm whitespace-pre-wrap font-sans">
                  {result}
                </pre>
              )}

              {(result || dna) && (
                <Button variant="ghost" size="sm" className="w-full rounded-xl gap-2" onClick={copyAll}>
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy result"}
                </Button>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
