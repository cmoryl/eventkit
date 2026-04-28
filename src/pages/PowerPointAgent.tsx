import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Presentation, Loader2, Send, Download, Sparkles, RefreshCw, FileText, Library, Plus, Upload, X, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useActiveBrand } from "@/hooks/useActiveBrand";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BrandHubImportModal } from "@/components/brand/BrandHubImportModal";

interface DeckResult {
  downloadUrl: string;
  filename: string;
  title: string;
  subtitle: string;
  slideCount: number;
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  slides: { layout: string; title: string }[];
}

interface ChatItem {
  role: "user" | "agent";
  content: string;
  deck?: DeckResult;
}

const SUGGESTIONS = [
  "Pitch deck for a B2B SaaS launching AI scheduling tool",
  "Investor update for Q3 — revenue, growth, key wins",
  "Workshop deck: Intro to design systems, 12 slides",
  "Sales kickoff: 2026 strategy & territory plan",
];

interface BrandOption {
  id: string;
  name: string;
  logo_url?: string | null;
  isFromBrandHub: boolean;
  styles?: {
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    heading_font?: string | null;
    body_font?: string | null;
  } | null;
}

const PowerPointAgent: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeBrand } = useActiveBrand();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState<number>(10);
  const [tone, setTone] = useState("");
  const [useBrand, setUseBrand] = useState(true);
  const [themeOverride, setThemeOverride] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ChatItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Brand selection
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [showImportModal, setShowImportModal] = useState(false);

  const loadBrands = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, logo_url, brandhub_share_token, brand_styles(primary_color, secondary_color, accent_color, heading_font, body_font)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) return;
    const mapped: BrandOption[] = (data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      logo_url: b.logo_url,
      isFromBrandHub: !!b.brandhub_share_token,
      styles: Array.isArray(b.brand_styles) ? b.brand_styles[0] : b.brand_styles,
    }));
    setBrands(mapped);
    // Default selection: active brand if present, else first
    if (!selectedBrandId) {
      setSelectedBrandId(activeBrand?.id || mapped[0]?.id || "");
    }
  }, [user, activeBrand?.id, selectedBrandId]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, isGenerating]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const brandPayload = useBrand && selectedBrand?.styles
    ? {
        primary: selectedBrand.styles.primary_color || undefined,
        secondary: selectedBrand.styles.secondary_color || undefined,
        accent: selectedBrand.styles.accent_color || undefined,
        headingFont: selectedBrand.styles.heading_font || undefined,
        bodyFont: selectedBrand.styles.body_font || undefined,
      }
    : undefined;

  const generate = async (overrideTopic?: string) => {
    const finalTopic = (overrideTopic ?? topic).trim();
    if (!finalTopic || isGenerating) return;

    const brandLabel = useBrand && selectedBrand ? `  \nBrand: ${selectedBrand.name}${selectedBrand.isFromBrandHub ? ' (BrandHub)' : ''}` : '';
    const userMsg: ChatItem = {
      role: "user",
      content: `**${finalTopic}**${audience ? `  \nAudience: ${audience}` : ""}  \nSlides: ${slideCount}${tone ? `  \nTone: ${tone}` : ""}${themeOverride ? `  \nTheme: ${themeOverride}` : brandLabel}`,
    };
    setHistory((h) => [...h, userMsg]);
    setIsGenerating(true);
    setTopic("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: {
          topic: finalTopic,
          audience: audience || undefined,
          slideCount,
          tone: tone || undefined,
          brand: brandPayload,
          themeOverride: themeOverride || undefined,
        },
      });

      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        if (status === 429) toast({ title: "Rate limit", description: "Please wait a moment.", variant: "destructive" });
        else if (status === 402) toast({ title: "AI credits exhausted", description: "Add credits in Settings → Workspace → Usage.", variant: "destructive" });
        else toast({ title: "Generation failed", description: error.message, variant: "destructive" });
        setHistory((h) => [...h, { role: "agent", content: "❌ Sorry, I couldn't generate the deck. Try again or adjust your prompt." }]);
        return;
      }

      const deck = data as DeckResult;
      setHistory((h) => [
        ...h,
        {
          role: "agent",
          content: `✅ Built **${deck.title}** — ${deck.slideCount} slides, ready to download.`,
          deck,
        },
      ]);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not reach the agent.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setHistory([]);
    setTopic("");
    setAudience("");
    setTone("");
    setThemeOverride("");
    setSlideCount(10);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Presentation className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">PowerPoint Agent</h1>
                <p className="text-xs text-muted-foreground">AI deck designer · exports .pptx</p>
              </div>
            </div>
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> New deck
            </Button>
          )}
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Empty state */}
          {history.length === 0 && (
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Generate a PowerPoint deck</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Describe what you need. I'll draft an outline, design the slides with your brand colors, and export a real .pptx file.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto pt-2">
                {SUGGESTIONS.map((s) => (
                  <Card
                    key={s}
                    onClick={() => { setTopic(s); }}
                    className="p-4 text-left text-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    {s}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          {history.map((item, i) => (
            <div key={i} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  item.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{
                  __html: item.content
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br/>'),
                }} />

                {item.deck && (
                  <Card className="mt-4 p-4 bg-background/50 border-primary/30">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                           style={{ background: `#${item.deck.palette.primary}` }}>
                        <Presentation className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.deck.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{item.deck.subtitle}</p>
                      </div>
                    </div>

                    {/* Palette swatches */}
                    <div className="flex gap-1.5 mb-3">
                      {Object.entries(item.deck.palette).map(([key, hex]) => (
                        <div key={key} className="flex-1 h-6 rounded" style={{ background: `#${hex}` }} title={`${key}: #${hex}`} />
                      ))}
                    </div>

                    {/* Slide list */}
                    <div className="text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto mb-3 pr-1">
                      {item.deck.slides.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0 w-20 text-center">
                            {s.layout}
                          </span>
                          <span className="truncate">{idx + 1}. {s.title}</span>
                        </div>
                      ))}
                    </div>

                    <Button asChild variant="default" size="sm" className="w-full">
                      <a href={item.deck.downloadUrl} download={item.deck.filename}>
                        <Download className="h-4 w-4" /> Download {item.deck.filename}
                      </a>
                    </Button>
                  </Card>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl px-5 py-3 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Drafting outline, designing slides, building .pptx…</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <footer className="border-t bg-card/60 backdrop-blur-md sticky bottom-0">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-3">
          {/* Options row */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[160px]">
              <Label htmlFor="audience" className="text-xs">Audience (optional)</Label>
              <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Series A investors" className="h-9" disabled={isGenerating} />
            </div>
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="tone" className="text-xs">Tone (optional)</Label>
              <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)}
                placeholder="bold, formal, playful…" className="h-9" disabled={isGenerating} />
            </div>
            <div className="w-24">
              <Label htmlFor="slides" className="text-xs">Slides</Label>
              <Input id="slides" type="number" min={3} max={30} value={slideCount}
                onChange={(e) => setSlideCount(Math.max(3, Math.min(30, Number(e.target.value) || 10)))}
                className="h-9" disabled={isGenerating} />
            </div>
          </div>

          {/* Brand picker row */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <Label className="text-xs flex items-center gap-1.5">
                <Library className="h-3 w-3" /> Brand guide reference
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedBrandId || "none"}
                  onValueChange={(v) => {
                    if (v === "none") { setSelectedBrandId(""); setUseBrand(false); }
                    else { setSelectedBrandId(v); setUseBrand(true); }
                  }}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="No brand styling" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="none">No brand — neutral styling</SelectItem>
                    {brands.length > 0 && (
                      <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Your imported brands
                      </div>
                    )}
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        <div className="flex items-center gap-2">
                          {b.styles?.primary_color && (
                            <span className="h-3 w-3 rounded-full border border-border/50" style={{ background: b.styles.primary_color }} />
                          )}
                          <span>{b.name}</span>
                          {b.isFromBrandHub && <span className="text-[10px] text-muted-foreground">· BrandHub</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setShowImportModal(true)}
                  disabled={isGenerating}
                  title="Import from BrandHub"
                >
                  <Plus className="h-4 w-4" /> BrandHub
                </Button>
              </div>
            </div>
            {selectedBrand && (
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg border bg-background">
                <Switch id="brand" checked={useBrand} onCheckedChange={setUseBrand} disabled={isGenerating} />
                <Label htmlFor="brand" className="text-xs cursor-pointer">Apply styling</Label>
              </div>
            )}
          </div>

          {/* Theme override */}
          <Input
            value={themeOverride}
            onChange={(e) => setThemeOverride(e.target.value)}
            placeholder="Theme override (optional) — e.g. 'dark navy with gold accents, serif headings'"
            className="h-9 text-sm"
            disabled={isGenerating}
          />

          {/* Topic */}
          <form onSubmit={(e) => { e.preventDefault(); generate(); }} className="flex gap-2">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); }
              }}
              rows={2}
              placeholder="Describe the deck you need…"
              className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isGenerating}
            />
            <Button type="submit" disabled={!topic.trim() || isGenerating} size="lg">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Generate</>}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <FileText className="h-3 w-3" /> Outputs a real .pptx file you can edit in PowerPoint, Keynote, or Google Slides.
          </p>
        </div>
      </footer>

      <BrandHubImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onBrandImported={() => { setShowImportModal(false); loadBrands(); }}
      />
    </div>
  );
};

export default PowerPointAgent;
