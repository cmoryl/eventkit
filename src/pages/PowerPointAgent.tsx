import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Presentation, Loader2, Send, Download, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useActiveBrand } from "@/hooks/useActiveBrand";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BrandHubImportModal } from "@/components/brand/BrandHubImportModal";
import { type PdfThumbnail } from "@/lib/pdfThumbnails";
import { type BrandHubSourcePick } from "@/components/powerpoint/BrandHubSourcePicker";
import { VoiceAgentPanel } from "@/components/powerpoint/VoiceAgentPanel";
import { BrandPopover } from "@/components/powerpoint/composer/BrandPopover";
import { SourceSheet } from "@/components/powerpoint/composer/SourceSheet";
import { RefinePopover } from "@/components/powerpoint/composer/RefinePopover";

import { DeckPreview, type DeckOutline } from "@/components/powerpoint/DeckPreview";

interface DeckResult {
  downloadUrl: string;
  filename: string;
  title: string;
  subtitle: string;
  slideCount: number;
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  slides: { layout: string; title: string }[];
  outline?: DeckOutline;
}

interface ChatItem {
  role: "user" | "agent";
  content: string;
  deck?: DeckResult;
}

const FALLBACK_SUGGESTIONS = [
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

  // PDF source
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedSource, setExtractedSource] = useState<any | null>(null);
  const [includeText, setIncludeText] = useState(true);
  const [includeImagery, setIncludeImagery] = useState(true);
  const [includeLookAndFeel, setIncludeLookAndFeel] = useState(true);
  const [influence, setInfluence] = useState<number>(70);
  // Cache of rendered thumbnails (populated lazily by LazyPdfGallery as pages scroll into view)
  const [thumbnails, setThumbnails] = useState<Map<number, PdfThumbnail>>(new Map());
  // Ordered list of selected pages — order is preserved when sent to the deck generator
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const selectedPagesSet = React.useMemo(() => new Set(selectedPages), [selectedPages]);
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());
  // BrandHub source pick (brand / event / product) — alternative or supplement to PDF source
  const [brandHubSource, setBrandHubSource] = useState<BrandHubSourcePick | null>(null);

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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const runExtraction = async (file: File) => {
    setExtractedSource(null);
    setSelectedSections(new Set());
    setExtracting(true);
    try {
      const fileBase64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("extract-pdf-source", {
        body: {
          fileBase64,
          fileName: file.name,
          includeText,
          includeImagery,
          includeLookAndFeel,
          influence,
        },
      });
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        toast({
          title: status === 402 ? "AI credits exhausted" : "Extraction failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      setExtractedSource({ ...data, _imageDescriptions: data.imageDescriptions });
      const sectionCount = (data.extracted?.outline || []).length;
      setSelectedSections(new Set(Array.from({ length: sectionCount }, (_, i) => i)));
      toast({ title: "PDF extracted", description: `${data.extracted?.pageCount || "?"} pages parsed.` });
      return true;
    } catch (e) {
      console.error(e);
      toast({ title: "Couldn't read PDF", variant: "destructive" });
      return false;
    } finally {
      setExtracting(false);
    }
  };

  const rerunExtraction = async () => {
    if (!pdfFile || extracting || isGenerating) return;
    await runExtraction(pdfFile);
  };

  const handlePdfSelect = async (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "PDF only", description: "Please upload a .pdf file.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB.", variant: "destructive" });
      return;
    }
    setPdfFile(file);
    setThumbnails(new Map());
    setSelectedPages([]);
    // Gallery handles lazy thumbnail rendering on its own.

    const ok = await runExtraction(file);
    if (!ok) setPdfFile(null);
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page],
    );
  };

  const reorderSelectedPages = (fromIdx: number, toIdx: number) => {
    setSelectedPages((prev) => {
      if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= prev.length) return prev;
      const next = prev.slice();
      const [moved] = next.splice(fromIdx, 1);
      const insertAt = Math.max(0, Math.min(toIdx, next.length));
      next.splice(insertAt, 0, moved);
      return next;
    });
  };

  const clearPageSelection = () => setSelectedPages([]);

  const toggleSection = (idx: number) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  const selectAllSections = () => {
    const count = (extractedSource?.extracted?.outline || []).length;
    setSelectedSections(new Set(Array.from({ length: count }, (_, i) => i)));
  };
  const clearSectionSelection = () => setSelectedSections(new Set());

  const clearPdf = () => {
    setPdfFile(null);
    setExtractedSource(null);
    setThumbnails(new Map());
    setSelectedPages([]);
    setSelectedSections(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generate = async (overrideTopic?: string) => {
    const finalTopic = (overrideTopic ?? topic).trim();
    if (!finalTopic || isGenerating) return;

    const brandLabel = useBrand && selectedBrand ? `  \nBrand: ${selectedBrand.name}${selectedBrand.isFromBrandHub ? ' (BrandHub)' : ''}` : '';
    const pickedCount = selectedPages.length;
    const fullOutline = extractedSource?.extracted?.outline || [];
    const filteredOutline = fullOutline.filter((_: any, i: number) => selectedSections.has(i));
    const sectionLabel = extractedSource && fullOutline.length
      ? `, ${filteredOutline.length}/${fullOutline.length} section${fullOutline.length === 1 ? '' : 's'}`
      : '';
    const sourceLabel = extractedSource
      ? `  \n📎 Source: ${extractedSource.fileName} (${influence}% influence${pickedCount ? `, ${pickedCount} page${pickedCount === 1 ? '' : 's'} picked` : ''}${sectionLabel})`
      : '';
    const userMsg: ChatItem = {
      role: "user",
      content: `**${finalTopic}**${audience ? `  \nAudience: ${audience}` : ""}  \nSlides: ${slideCount}${tone ? `  \nTone: ${tone}` : ""}${themeOverride ? `  \nTheme: ${themeOverride}` : brandLabel}${sourceLabel}`,
    };
    setHistory((h) => [...h, userMsg]);
    setIsGenerating(true);
    setTopic("");

    // Preserve user-defined order: iterate selectedPages (ordered) and look up each thumbnail
    const pickedImages = selectedPages
      .map((page) => thumbnails.get(page))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .map((t) => ({ page: t.page, dataUrl: t.dataUrl }));

    const pdfSource = extractedSource
      ? {
          ...extractedSource.extracted,
          outline: filteredOutline,
          imageDescriptions: extractedSource._imageDescriptions || [],
          fileName: extractedSource.fileName,
          influence,
          scope: { text: includeText, imagery: includeImagery, lookAndFeel: includeLookAndFeel },
          selectedImages: pickedImages,
        }
      : undefined;

    const brandHubPayload = brandHubSource
      ? {
          type: brandHubSource.type,
          name: brandHubSource.name,
          slug: brandHubSource.slug,
          shareToken: brandHubSource.shareToken,
          guide: brandHubSource.payload,
          influence,
        }
      : undefined;

    const sourcePayload =
      pdfSource || brandHubPayload
        ? { ...(pdfSource || {}), brandHub: brandHubPayload }
        : undefined;

    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: {
          topic: finalTopic,
          audience: audience || undefined,
          slideCount,
          tone: tone || undefined,
          brand: brandPayload,
          themeOverride: themeOverride || undefined,
          source: sourcePayload,
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
    clearPdf();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Empty state — hero composer */}
          {history.length === 0 && (
            <div className="text-center pt-8 pb-4 space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Generate a PowerPoint deck</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Describe your deck. We handle the rest — outline, design, and a downloadable .pptx file.
                </p>
              </div>

              {/* Hero composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  generate();
                }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-3 space-y-3">
                  <div className="flex gap-2 items-stretch">
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          generate();
                        }
                      }}
                      rows={2}
                      placeholder="e.g. Pitch deck for a B2B SaaS launching AI scheduling tool"
                      className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={isGenerating}
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={!topic.trim() || isGenerating}
                      size="lg"
                      className="self-stretch px-6"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Generate
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Chips row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <BrandPopover
                      brands={brands}
                      selectedBrandId={selectedBrandId}
                      setSelectedBrandId={setSelectedBrandId}
                      useBrand={useBrand}
                      setUseBrand={setUseBrand}
                      disabled={isGenerating}
                      onOpenImport={() => setShowImportModal(true)}
                    />
                    <SourceSheet
                      pdfFile={pdfFile}
                      fileInputRef={fileInputRef}
                      extracting={extracting}
                      extractedSource={extractedSource}
                      includeText={includeText}
                      setIncludeText={setIncludeText}
                      includeImagery={includeImagery}
                      setIncludeImagery={setIncludeImagery}
                      includeLookAndFeel={includeLookAndFeel}
                      setIncludeLookAndFeel={setIncludeLookAndFeel}
                      influence={influence}
                      setInfluence={setInfluence}
                      thumbnails={thumbnails}
                      selectedPages={selectedPages}
                      selectedPagesSet={selectedPagesSet}
                      selectedSections={selectedSections}
                      togglePage={togglePage}
                      reorderSelectedPages={reorderSelectedPages}
                      setSelectedPages={setSelectedPages}
                      clearPageSelection={clearPageSelection}
                      toggleSection={toggleSection}
                      selectAllSections={selectAllSections}
                      clearSectionSelection={clearSectionSelection}
                      setThumbnails={setThumbnails}
                      handlePdfSelect={handlePdfSelect}
                      rerunExtraction={rerunExtraction}
                      clearPdf={clearPdf}
                      brandHubSource={brandHubSource}
                      setBrandHubSource={setBrandHubSource}
                      disabled={isGenerating}
                    />
                    <RefinePopover
                      audience={audience}
                      setAudience={setAudience}
                      tone={tone}
                      setTone={setTone}
                      slideCount={slideCount}
                      setSlideCount={setSlideCount}
                      themeOverride={themeOverride}
                      setThemeOverride={setThemeOverride}
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </form>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    disabled={isGenerating}
                    className="px-3 py-1.5 text-xs rounded-full border bg-background hover:border-primary/50 hover:bg-accent/30 transition-colors text-left text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-2">
                Outputs a real .pptx file you can edit in PowerPoint, Keynote, or Google Slides.
              </p>
            </div>
          )}

          {/* Conversation */}
          {history.map((item, i) => (
            <div key={i} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[95%] rounded-2xl px-5 py-4 ${
                  item.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                }`}
              >
                <p
                  className="whitespace-pre-wrap text-sm"
                  dangerouslySetInnerHTML={{
                    __html: item.content
                      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br/>"),
                  }}
                />

                {item.deck && (item.deck.outline ? (
                  <DeckPreview
                    outline={item.deck.outline}
                    downloadUrl={item.deck.downloadUrl}
                    filename={item.deck.filename}
                    onUpdated={(next) => {
                      setHistory((h) =>
                        h.map((x, xi) =>
                          xi === i && x.deck
                            ? { ...x, deck: { ...x.deck, outline: next.outline, downloadUrl: next.downloadUrl, filename: next.filename } }
                            : x,
                        ),
                      );
                    }}
                  />
                ) : (
                  <Card className="mt-4 p-4 bg-background/50 border-primary/30">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `#${item.deck.palette.primary}` }}
                      >
                        <Presentation className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.deck.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{item.deck.subtitle}</p>
                      </div>
                    </div>
                    <Button asChild variant="default" size="sm" className="w-full">
                      <a href={item.deck.downloadUrl} download={item.deck.filename}>
                        <Download className="h-4 w-4" /> Download {item.deck.filename}
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {isGenerating && history.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl px-5 py-3 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Drafting outline, designing slides, building .pptx…</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky footer composer — only shown after the first deck */}
      {history.length > 0 && (
        <footer className="border-t bg-card/60 backdrop-blur-md sticky bottom-0">
          <div className="max-w-6xl mx-auto px-6 py-3 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                generate();
              }}
              className="flex gap-2"
            >
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    generate();
                  }
                }}
                rows={1}
                placeholder="Refine, or describe a new deck…"
                className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isGenerating}
              />
              <Button type="submit" disabled={!topic.trim() || isGenerating} size="default">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Generate</>}
              </Button>
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <BrandPopover
                brands={brands}
                selectedBrandId={selectedBrandId}
                setSelectedBrandId={setSelectedBrandId}
                useBrand={useBrand}
                setUseBrand={setUseBrand}
                disabled={isGenerating}
                onOpenImport={() => setShowImportModal(true)}
              />
              <SourceSheet
                pdfFile={pdfFile}
                fileInputRef={fileInputRef}
                extracting={extracting}
                extractedSource={extractedSource}
                includeText={includeText}
                setIncludeText={setIncludeText}
                includeImagery={includeImagery}
                setIncludeImagery={setIncludeImagery}
                includeLookAndFeel={includeLookAndFeel}
                setIncludeLookAndFeel={setIncludeLookAndFeel}
                influence={influence}
                setInfluence={setInfluence}
                thumbnails={thumbnails}
                selectedPages={selectedPages}
                selectedPagesSet={selectedPagesSet}
                selectedSections={selectedSections}
                togglePage={togglePage}
                reorderSelectedPages={reorderSelectedPages}
                setSelectedPages={setSelectedPages}
                clearPageSelection={clearPageSelection}
                toggleSection={toggleSection}
                selectAllSections={selectAllSections}
                clearSectionSelection={clearSectionSelection}
                setThumbnails={setThumbnails}
                handlePdfSelect={handlePdfSelect}
                rerunExtraction={rerunExtraction}
                clearPdf={clearPdf}
                brandHubSource={brandHubSource}
                setBrandHubSource={setBrandHubSource}
                disabled={isGenerating}
              />
              <RefinePopover
                audience={audience}
                setAudience={setAudience}
                tone={tone}
                setTone={setTone}
                slideCount={slideCount}
                setSlideCount={setSlideCount}
                themeOverride={themeOverride}
                setThemeOverride={setThemeOverride}
                disabled={isGenerating}
              />
            </div>
          </div>
        </footer>
      )}

      <BrandHubImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onBrandImported={() => { setShowImportModal(false); loadBrands(); }}
      />

      <VoiceAgentPanel
        context={{
          brandName: selectedBrand?.name,
          isFromBrandHub: selectedBrand?.isFromBrandHub,
          selectedPages: selectedPages.length,
          topic,
          audience,
          slideCount,
          tone,
          themeOverride,
          useBrand,
        }}
        actions={{
          setTopic,
          setAudience,
          setSlideCount,
          setTone,
          setThemeOverride,
          setUseBrand,
          triggerGenerate: () => generate(),
        }}
      />
    </div>
  );
};

export default PowerPointAgent;
