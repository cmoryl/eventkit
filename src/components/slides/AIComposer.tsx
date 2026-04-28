import React, { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModeCards, type Mode } from "@/components/powerpoint/composer/ModeCards";
import { QuickControls } from "@/components/powerpoint/composer/QuickControls";
import { OutlineReview } from "@/components/powerpoint/composer/OutlineReview";
import type { DeckOutline, SlideOutline } from "@/components/powerpoint/DeckPreview";
import type { SlideData, SlideLayout } from "@/components/slides/slideTypes";
import { v4 as uuidv4 } from "uuid";

interface Props {
  /** Called when the user has approved an outline and we've converted it into editor slides. */
  onSlidesReady: (slides: SlideData[], meta: { title: string; subtitle: string }) => void;
  brandPayload?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    headingFont?: string;
    bodyFont?: string;
  };
}

/**
 * Map a deck-outline layout to the SlideEditor's SlideLayout.
 * The two systems use slightly different layout names.
 */
const LAYOUT_MAP: Record<SlideOutline["layout"], SlideLayout> = {
  title: "title",
  section: "section",
  bullets: "content",
  two_column: "two-column",
  stat: "big-number",
  quote: "quote",
  closing: "section",
};

/** Default per-layout variation that looks great out of the box. */
const VARIATION_MAP: Partial<Record<SlideOutline["layout"], string>> = {
  title: "centered",
  bullets: "bullets",
  two_column: "equal",
  stat: "centered",
  quote: "centered",
};

const outlineToSlides = (outline: DeckOutline): SlideData[] =>
  outline.slides.map((s, idx) => {
    const mappedLayout: SlideLayout = LAYOUT_MAP[s.layout] || "content";
    const base: SlideData = {
      id: uuidv4(),
      layout: mappedLayout,
      title: s.title || "",
      subtitle: s.subtitle,
      notes: s.notes,
      variant:
        s.layout === "title"
          ? "gradient"
          : s.layout === "closing"
          ? "gradient"
          : s.layout === "section"
          ? "dark"
          : s.layout === "stat"
          ? "brand"
          : s.layout === "quote"
          ? "dark"
          : "default",
      variation: VARIATION_MAP[s.layout],
    };

    switch (s.layout) {
      case "title": {
        // Use first bullet as a tagline if no subtitle was provided
        if (!base.subtitle && s.bullets?.length) base.subtitle = s.bullets[0];
        break;
      }
      case "section":
      case "closing": {
        // Section/closing slides are subtitle-driven; promote first bullet if no subtitle
        if (!base.subtitle && s.bullets?.length) base.subtitle = s.bullets[0];
        // Default closing to "Thank You" feel if title is empty
        if (s.layout === "closing" && !base.title) base.title = "Thank You";
        break;
      }
      case "bullets": {
        const bullets = s.bullets?.length ? s.bullets : ["Add your first point here"];
        base.body = bullets.map((b) => `• ${b}`).join("\n");
        break;
      }
      case "two_column": {
        if (s.leftColumn || s.rightColumn) {
          const left = s.leftColumn
            ? [s.leftColumn.heading, ...(s.leftColumn.bullets || []).map((b) => `• ${b}`)]
                .filter(Boolean)
                .join("\n")
            : "";
          const right = s.rightColumn
            ? [s.rightColumn.heading, ...(s.rightColumn.bullets || []).map((b) => `• ${b}`)]
                .filter(Boolean)
                .join("\n")
            : "";
          base.body = `${left}\n---\n${right}`;
        } else if (s.bullets?.length) {
          // Fallback: split bullets evenly into two columns
          const mid = Math.ceil(s.bullets.length / 2);
          const left = s.bullets.slice(0, mid).map((b) => `• ${b}`).join("\n");
          const right = s.bullets.slice(mid).map((b) => `• ${b}`).join("\n");
          base.body = `${left}\n---\n${right}`;
        } else {
          base.body = "• Left point one\n• Left point two\n---\n• Right point one\n• Right point two";
        }
        break;
      }
      case "stat": {
        if (s.stat) {
          base.title = s.stat.value;
          base.subtitle = s.stat.label;
        } else {
          // Fallback when AI forgot the stat object
          base.title = s.title || "100%";
          base.subtitle = s.subtitle || "of the result that matters";
        }
        break;
      }
      case "quote": {
        const rawText = (s.quote?.text || s.title || "Insert a memorable quote here.").trim();
        // Strip any existing leading/trailing straight or smart quotes, then re-wrap consistently.
        const stripped = rawText.replace(/^["“”'']+|["“”'']+$/g, "").trim();
        base.title = `"${stripped}"`;
        // Prefer structured attribution; fall back to subtitle only when attribution is missing.
        const attribution = (s.quote?.attribution ?? s.subtitle ?? "").trim();
        base.quoteAuthor = attribution || undefined;
        base.subtitle = undefined;
        break;
      }
    }

    void idx;
    return base;
  });

export const AIComposer: React.FC<Props> = ({ onSlidesReady, brandPayload }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("prompt");
  const [topic, setTopic] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [slideCount, setSlideCount] = useState(10);
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingOutline, setPendingOutline] = useState<DeckOutline | null>(null);

  const planOutline = async () => {
    const finalTopic = (mode === "paste" ? pasteText : topic).trim();
    if (!finalTopic || busy) {
      if (!finalTopic) toast({ title: "Add a topic", description: "Tell the AI what your deck is about.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: {
          topic: finalTopic,
          audience: audience || undefined,
          slideCount,
          tone: tone || undefined,
          brand: brandPayload,
          planOnly: true,
        },
      });
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        if (status === 429) toast({ title: "Rate limit", description: "Please wait a moment.", variant: "destructive" });
        else if (status === 402) toast({ title: "AI credits exhausted", description: "Add credits in Settings → Workspace → Usage.", variant: "destructive" });
        else toast({ title: "Outline failed", description: error.message, variant: "destructive" });
        return;
      }
      if (data?.outline) setPendingOutline(data.outline as DeckOutline);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not draft outline.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const confirmOutline = () => {
    if (!pendingOutline) return;
    const slides = outlineToSlides(pendingOutline);
    onSlidesReady(slides, { title: pendingOutline.title, subtitle: pendingOutline.subtitle });
    setPendingOutline(null);
    setTopic("");
    setPasteText("");
    toast({ title: "Deck ready", description: `${slides.length} slides loaded into the editor.` });
  };

  // Step 2 — outline review
  if (pendingOutline) {
    return (
      <Card className="p-6 border-primary/30 bg-card/80 backdrop-blur-sm">
        <OutlineReview
          outline={pendingOutline}
          onChange={setPendingOutline}
          onBack={() => setPendingOutline(null)}
          onConfirm={confirmOutline}
          building={busy}
        />
      </Card>
    );
  }

  // Step 1 — composer
  return (
    <Card className="p-6 border-primary/30 bg-card/80 backdrop-blur-sm space-y-5">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          AI Slide Generator
        </div>
        <h2 className="text-2xl font-bold">Describe it. Approve the outline. Edit the deck.</h2>
        <p className="text-sm text-muted-foreground">Gamma-style 2-step flow: AI drafts an outline first, you fine-tune, then it builds.</p>
      </div>

      <ModeCards active={mode} onChange={setMode} disabled={busy} />

      {mode === "prompt" && (
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Pitch deck for a B2B SaaS launching AI scheduling — 10 slides, problem → solution → traction → ask"
          rows={3}
          disabled={busy}
          className="max-w-3xl mx-auto resize-none"
        />
      )}
      {mode === "paste" && (
        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste notes, a brief, or document content. AI will turn it into a structured deck."
          rows={6}
          disabled={busy}
          className="max-w-3xl mx-auto resize-none"
        />
      )}
      {mode === "blank" && (
        <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto py-2">
          Skip the AI step — scroll down and pick a template, or click <span className="font-semibold text-foreground">New Presentation</span> in the header to start blank.
        </div>
      )}

      {mode !== "blank" && (
        <>
          <QuickControls
            slideCount={slideCount}
            setSlideCount={setSlideCount}
            tone={tone}
            setTone={setTone}
            audience={audience}
            setAudience={setAudience}
            disabled={busy}
          />

          <div className="flex justify-center">
            <Button size="lg" onClick={planOutline} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {busy ? "Drafting outline…" : "Draft outline"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
