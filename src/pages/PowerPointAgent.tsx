import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Presentation, Loader2, Send, Download, Sparkles, RefreshCw, Check, Bot, LayoutTemplate } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SlideEditor } from "@/components/slides/SlideEditor";
import { outlineToThemedSlides } from "@/components/slides/outlineToSlides";
import { parsePptxFile, parsePptxThemeTokens, parsePptxLayoutCatalog, type PptxThemeTokens, type PptxLayoutCatalog } from "@/components/slides/importPptx";
import { type SlideData } from "@/components/slides/slideTypes";
import { DEMO_BY_TEMPLATE, FALLBACK_DEMO } from "@/components/powerpoint/composer/TemplateDemoCard";
import { demoContentToSlides } from "@/components/powerpoint/composer/demoContentToSlides";
import transperfectDeckAsset from "@/assets/transperfect-general-deck.pptx.asset.json";

// Built-in corporate decks: templates that ship with a real .pptx as their source of truth.
// When selected, the actual deck is fetched, parsed, and used both as starter slides
// and as the extracted-source so AI variations stay faithful to the approved look & feel.
const BUILTIN_CORPORATE_DECKS: Record<string, { url: string; fileName: string; label: string }> = {
  "transperfect-2026": {
    url: transperfectDeckAsset.url,
    fileName: "TransPerfect_General_Deck.pptx",
    label: "TransPerfect Corporate Deck",
  },
};

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
import { TemplateGallery, ALL_DECK_TEMPLATES, type DeckTemplate } from "@/components/powerpoint/composer/TemplateGallery";
import { ModeCards, type Mode } from "@/components/powerpoint/composer/ModeCards";
import { QuickControls } from "@/components/powerpoint/composer/QuickControls";
import { OutlineReview } from "@/components/powerpoint/composer/OutlineReview";

import { DeckPreview, type DeckOutline } from "@/components/powerpoint/DeckPreview";
import horizonBg from "@/assets/horizon-bg.png";

// Default 10-slide outline suggestions per template — populates topic area when picked
const TEMPLATE_DEFAULT_TOPICS: Record<string, { topic: string; audience?: string; tone?: string }> = {
  "transperfect-2026": {
    topic: "TransPerfect 2026 — Global Language & AI Solutions overview. 10 slides covering: 1) Cover, 2) Who we are, 3) Mission & vision, 4) Global footprint, 5) Service portfolio, 6) AI platform (GlobalLink NEXT), 7) Industry expertise, 8) Case study highlight, 9) Why TransPerfect, 10) Contact / next steps.",
    audience: "Enterprise prospects, marketing & localization leaders",
    tone: "Authoritative, modern, human, transformative",
  },
};

interface DeckResult {
  downloadUrl: string;
  filename: string;
  templateId?: string;
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
  const { activeBrand, brands: globalBrands, setActiveBrand, applyBrandToUI } = useActiveBrand();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [slideCount, setSlideCount] = useState<number>(10);
  const [tone, setTone] = useState("");
  const [useBrand, setUseBrand] = useState(true);
  const [themeOverride, setThemeOverride] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Brand selection
  const [brands, setBrands] = useState<BrandOption[]>([]);
  // Initialize from sessionStorage so the user's brand pick survives refresh + tab switches
  const [selectedBrandId, setSelectedBrandId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("active-brand-id") || "";
  });
  // Persist every change to sessionStorage (shared key with useActiveBrand)
  useEffect(() => {
    if (selectedBrandId) sessionStorage.setItem("active-brand-id", selectedBrandId);
  }, [selectedBrandId]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [mode, setMode] = useState<Mode>("prompt");
  const [pendingOutline, setPendingOutline] = useState<DeckOutline | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [parallaxMode, setParallaxMode] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") === "editor" ? "editor" : "agent") as "agent" | "editor";
  const setActiveTab = useCallback((t: "agent" | "editor") => {
    const next = new URLSearchParams(searchParams);
    if (t === "agent") next.delete("tab"); else next.set("tab", t);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Holds a starter deck loaded directly from a template (bypasses AI outline).
  // When set, takes priority over the AI-derived editorInitialSlides.
  const [templateStarterSlides, setTemplateStarterSlides] = useState<SlideData[] | null>(null);
  // Real brand tokens parsed from the corporate deck's ppt/theme/theme1.xml.
  // Forwarded into the SlideEditor + add-styled-slide so the AI uses the
  // authoritative palette/fonts instead of regex-guessed ones.
  const [templateThemeTokens, setTemplateThemeTokens] = useState<PptxThemeTokens | null>(null);
  // Real placeholder-level layout catalog parsed from the corporate deck's
  // ppt/slideLayouts/*.xml. Lets the AI pick from layouts that actually exist
  // in the master (with their real placeholder geometry).
  const [templateLayoutCatalog, setTemplateLayoutCatalog] = useState<PptxLayoutCatalog | null>(null);

  // Stable key for SlideEditor — changes when a new AI deck or template starter is loaded,
  // forcing a remount so initialSlides are picked up rather than the stale state.
  const editorKey = useMemo(() => {
    if (templateStarterSlides && templateStarterSlides.length > 0) {
      return `template-${templateStarterSlides[0]?.title ?? ''}-${templateStarterSlides.length}`;
    }
    const lastDeck = [...history].reverse().find((h) => h.deck?.outline)?.deck;
    return lastDeck?.downloadUrl ?? 'blank';
  }, [history, templateStarterSlides]);

  // Convert the most recent built deck's outline into SlideData[] for the inline SlideEditor.
  // Uses the shared outlineToThemedSlides converter so AI-generated decks inherit the same
  // demo theme look-and-feel (TransPerfect orbs, Modern Dark mesh, etc.) as the gallery templates,
  // and so rich layouts (kpi_grid, comparison, agenda, timeline, process, chart) survive intact.
  const editorInitialSlides = useMemo(() => {
    // Template starter deck takes priority — user explicitly chose "Open in Editor".
    if (templateStarterSlides && templateStarterSlides.length > 0) {
      return templateStarterSlides;
    }
    const lastDeck = [...history].reverse().find((h) => h.deck?.outline)?.deck;
    if (!lastDeck?.outline) return undefined;
    if (parallaxMode) {
      // Parallax mode short-circuits: use the legacy gradient/parallax mapping.
      return lastDeck.outline.slides.map((s) => ({
        id: crypto.randomUUID(),
        title: s.title,
        subtitle: s.subtitle,
        body: (s.bullets || []).map((b) => `• ${b}`).join("\n"),
        notes: s.notes,
        variant: "gradient" as const,
        layout: "parallax" as const,
      }));
    }
    return outlineToThemedSlides(lastDeck.outline, { templateId: selectedTemplateId || undefined });
  }, [history, parallaxMode, selectedTemplateId, templateStarterSlides]);

  // Fetch the bundled corporate .pptx (if any) for a template and use it as both the
  // starter slides AND the extracted source so AI follow-ups stay on-brand.
  const loadCorporateDeckForTemplate = useCallback(async (tpl: DeckTemplate, opts: { jumpToEditor: boolean }) => {
    const corp = BUILTIN_CORPORATE_DECKS[tpl.id];
    if (!corp) return false;
    try {
      toast({ title: `Loading ${corp.label}…`, description: "Pulling the approved corporate deck." });
      const res = await fetch(corp.url);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const blob = await res.blob();
      const file = new File([blob], corp.fileName, {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const imported = await parsePptxFile(file);
      if (imported.length) {
        setTemplateStarterSlides(imported);
      }
      // Pull the authoritative color + font scheme from theme1.xml so
      // downstream AI prompts inherit the real brand palette.
      try {
        const tokens = await parsePptxThemeTokens(file);
        setTemplateThemeTokens(tokens);
      } catch (themeErr) {
        console.warn("Theme parse failed (non-fatal):", themeErr);
        setTemplateThemeTokens(null);
      }
      // Pull the slide-layout catalog (real placeholders + geometry) so the
      // AI can pick from layouts that exist in the master.
      try {
        const catalog = await parsePptxLayoutCatalog(file);
        setTemplateLayoutCatalog(catalog);
      } catch (layoutErr) {
        console.warn("Layout catalog parse failed (non-fatal):", layoutErr);
        setTemplateLayoutCatalog(null);
      }
      // Also load as extracted source so the AI Agent can generate variations from it.
      setPdfFile(null);
      setThumbnails(new Map());
      setSelectedPages([]);
      setPptxFile(file);
      await runPptxExtraction(file);
      if (opts.jumpToEditor) setActiveTab("editor");
      toast({
        title: `${corp.label} loaded`,
        description: `${imported.length} approved slides ready — edit anything, or ask the agent to add variations in this style.`,
      });
      return true;
    } catch (err) {
      console.error("Corporate deck load failed:", err);
      toast({
        title: "Couldn't load corporate deck",
        description: err instanceof Error ? err.message : "Falling back to demo content.",
        variant: "destructive",
      });
      return false;
    }
    // runPptxExtraction is defined below — safe via closure at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveTab, toast]);

  const applyTemplate = useCallback((tpl: DeckTemplate) => {
    setSelectedTemplateId(tpl.id);
    setThemeOverride(tpl.themePrompt);
    setShowTemplateGallery(false);
    const defaults = TEMPLATE_DEFAULT_TOPICS[tpl.id];
    if (defaults) {
      // Only prefill empty fields so we never overwrite the user's typing
      setTopic((prev) => prev.trim() ? prev : defaults.topic);
      setAudience((prev) => prev.trim() ? prev : defaults.audience || prev);
      setTone((prev) => prev.trim() ? prev : defaults.tone || prev);
      setSlideCount(10);
    }
    if (BUILTIN_CORPORATE_DECKS[tpl.id]) {
      // Auto-attach the approved corporate deck as a source so AI generations stay on-brand.
      void loadCorporateDeckForTemplate(tpl, { jumpToEditor: false });
    } else {
      toast({ title: `${tpl.name} template applied`, description: "Look & feel locked in. Edit the topic and hit Generate." });
    }
  }, [toast, loadCorporateDeckForTemplate]);

  // Build starter slides that mirror the template's preview deck exactly —
  // converts the same DemoContent shown in TemplatePreviewDialog into SlideData[].
  const buildStarterSlidesForTemplate = useCallback((tpl: DeckTemplate): SlideData[] => {
    const demo = DEMO_BY_TEMPLATE[tpl.id] || FALLBACK_DEMO;
    return demoContentToSlides(tpl, demo);
  }, []);

  const openTemplateInEditor = useCallback((tpl: DeckTemplate) => {
    setSelectedTemplateId(tpl.id);
    setThemeOverride(tpl.themePrompt);
    setShowTemplateGallery(false);
    if (BUILTIN_CORPORATE_DECKS[tpl.id]) {
      // Use the real approved PPTX as the starter deck.
      void loadCorporateDeckForTemplate(tpl, { jumpToEditor: true });
      return;
    }
    const starter = buildStarterSlidesForTemplate(tpl);
    setTemplateStarterSlides(starter);
    // Jump straight into the editor tab — bypass outline review entirely.
    setActiveTab("editor");
    toast({
      title: `${tpl.name} loaded into editor`,
      description: `${starter.length} slides loaded from the preview — edit anything, then Save as Template to keep your version.`,
    });
  }, [buildStarterSlidesForTemplate, loadCorporateDeckForTemplate, setActiveTab, toast]);

  // Direct .pptx → editor import (bypasses AI). Loads parsed slides as the
  // starter deck and jumps to the Editor tab so the user can edit immediately.
  const importPptxAsDeckRef = useRef<HTMLInputElement>(null);
  const handleImportPptxAsDeck = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.name.toLowerCase().endsWith(".pptx")) {
      toast({ title: "PPTX only", description: "Please upload a .pptx file.", variant: "destructive" });
      return;
    }
    try {
      const imported = await parsePptxFile(file);
      if (!imported.length) {
        toast({ title: "No slides found", description: "We couldn't read any slides from that file.", variant: "destructive" });
        return;
      }
      setTemplateStarterSlides(imported);
      setActiveTab("editor");
      toast({ title: "Deck imported", description: `${imported.length} slides loaded — edit anything you like.` });
    } catch (err) {
      console.error("PPTX import error:", err);
      toast({ title: "Import failed", description: err instanceof Error ? err.message : "Could not read .pptx", variant: "destructive" });
    }
  }, [setActiveTab, toast]);

  // Apply ?template= from URL once brands etc. are ready
  useEffect(() => {
    const tplId = searchParams.get("template");
    if (!tplId || selectedTemplateId) return;
    const tpl = ALL_DECK_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) applyTemplate(tpl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


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
  // PPTX source — uses the same `extractedSource` slot as PDF (mutually exclusive)
  const [pptxFile, setPptxFile] = useState<File | null>(null);
  const pptxInputRef = useRef<HTMLInputElement>(null);

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
    // Default selection priority: existing local pick > sessionStorage > active brand > first
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("active-brand-id") : null;
    const validStored = stored && mapped.some((m) => m.id === stored) ? stored : "";
    if (!selectedBrandId || !mapped.some((m) => m.id === selectedBrandId)) {
      setSelectedBrandId(validStored || activeBrand?.id || mapped[0]?.id || "");
    }
  }, [user, activeBrand?.id, selectedBrandId]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Keep the GLOBAL active brand in sync with the Agent's local selection so the
  // Editor tab, theming, and downstream components all see the same brand.
  // Guarded by a ref so we only apply the theme once per brand id (prevents the
  // applyBrandToUI -> activeBrand change -> effect re-run -> re-apply loop).
  const lastAppliedBrandIdRef = useRef<string>("");
  useEffect(() => {
    if (!selectedBrandId) return;
    if (lastAppliedBrandIdRef.current === selectedBrandId) return;
    const match = globalBrands.find((b) => b.id === selectedBrandId);
    if (!match) return;
    lastAppliedBrandIdRef.current = selectedBrandId;
    if (activeBrand?.id !== selectedBrandId) {
      setActiveBrand(match);
    }
    // Apply brand theme to UI without persisting to profile (session-only sync)
    applyBrandToUI(match, false).catch(() => undefined);
    // Intentionally exclude activeBrand?.id and applyBrandToUI from deps to
    // avoid re-firing when their identities change as a result of our update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, globalBrands]);

  // Inverse: if the global active brand changes elsewhere (e.g. header brand
  // switcher), reflect it in the Agent's local selection.
  useEffect(() => {
    if (activeBrand?.id && activeBrand.id !== selectedBrandId && brands.some((b) => b.id === activeBrand.id)) {
      setSelectedBrandId(activeBrand.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrand?.id, brands]);

  // Load suggestion chips from agent_prompt_presets so admins can edit them
  // without redeploys. Falls back to the hardcoded list on any failure.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("agent_prompt_presets")
        .select("prompt")
        .eq("agent_key", "powerpoint")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length) {
        setSuggestions(data.map((r: { prompt: string }) => r.prompt));
      }
    })();
  }, []);

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

  // ── PPTX source ────────────────────────────────────────────────────────────
  const runPptxExtraction = async (file: File) => {
    setExtractedSource(null);
    setSelectedSections(new Set());
    setExtracting(true);
    try {
      const { extractPptxAsSource } = await import("@/components/powerpoint/composer/extractPptxSource");
      const data = await extractPptxAsSource(file, {
        includeText,
        includeImagery,
        includeLookAndFeel,
        influence,
      });
      setExtractedSource(data);
      const sectionCount = data.extracted.outline.length;
      setSelectedSections(new Set(Array.from({ length: sectionCount }, (_, i) => i)));
      toast({ title: "PPTX extracted", description: `${data.extracted.pageCount} slides parsed.` });
      return true;
    } catch (e: any) {
      console.error(e);
      toast({ title: "Couldn't read PPTX", description: e?.message || "Parse failed", variant: "destructive" });
      return false;
    } finally {
      setExtracting(false);
    }
  };

  const handlePptxSelect = async (file: File | null) => {
    if (!file) return;
    const isPptx =
      file.name.toLowerCase().endsWith(".pptx") ||
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    if (!isPptx) {
      toast({ title: "PPTX only", description: "Please upload a .pptx file.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20MB.", variant: "destructive" });
      return;
    }
    // PPTX replaces any existing PDF source.
    setPdfFile(null);
    setThumbnails(new Map());
    setSelectedPages([]);
    setPptxFile(file);
    const ok = await runPptxExtraction(file);
    if (!ok) setPptxFile(null);
  };

  const clearPptx = () => {
    setPptxFile(null);
    setExtractedSource(null);
    setSelectedSections(new Set());
    if (pptxInputRef.current) pptxInputRef.current.value = "";
  };

  const rerunPptxExtraction = async () => {
    if (!pptxFile || extracting || isGenerating) return;
    await runPptxExtraction(pptxFile);
  };

  /**
   * Build the shared body sent to generate-deck. Used for both planning and final build.
   */
  const buildInvokePayload = (finalTopic: string, opts: { planOnly?: boolean; prebuiltOutline?: DeckOutline } = {}) => {
    const fullOutline = extractedSource?.extracted?.outline || [];
    const filteredOutline = fullOutline.filter((_: any, i: number) => selectedSections.has(i));

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
      pdfSource || brandHubPayload ? { ...(pdfSource || {}), brandHub: brandHubPayload } : undefined;

    const selectedTpl = selectedTemplateId
      ? ALL_DECK_TEMPLATES.find((t) => t.id === selectedTemplateId)
      : undefined;
    const templatePayload = selectedTpl
      ? {
          id: selectedTpl.id,
          name: selectedTpl.name,
          description: selectedTpl.description,
          themePrompt: selectedTpl.themePrompt,
          palette: selectedTpl.palette,
        }
      : undefined;

    return {
      topic: finalTopic,
      audience: audience || undefined,
      slideCount,
      tone: tone || undefined,
      brand: brandPayload,
      themeOverride: [
        themeOverride,
        parallaxMode
          ? "Design the deck for a cinematic 3D parallax video export: bold full-bleed hero imagery, dramatic depth, layered foreground/midground/background, large display typography, dark gradient backgrounds with strong color accents — exports as MP4 video deck with parallax depth layers."
          : null,
      ].filter(Boolean).join(" — ") || undefined,
      templateId: selectedTemplateId || undefined,
      template: templatePayload,
      source: sourcePayload,
      planOnly: opts.planOnly || undefined,
      prebuiltOutline: opts.prebuiltOutline,
    };
  };

  /**
   * Step 1 — Outline-first flow (Gamma-style).
   * Asks AI for an outline only; user reviews/edits before we build the .pptx.
   */
  const planOutline = async (overrideTopic?: string) => {
    const finalTopic = (overrideTopic ?? topic).trim();
    if (!finalTopic || isGenerating) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: buildInvokePayload(finalTopic, { planOnly: true }),
      });
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        if (status === 429) toast({ title: "Rate limit", description: "Please wait a moment.", variant: "destructive" });
        else if (status === 402) toast({ title: "AI credits exhausted", description: "Add credits in Settings → Workspace → Usage.", variant: "destructive" });
        else toast({ title: "Outline failed", description: error.message, variant: "destructive" });
        return;
      }
      if (data?.outline) {
        setPendingOutline(data.outline as DeckOutline);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Could not draft outline.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Step 2 — Build .pptx from approved outline (or directly when called without one).
   */
  const generate = async (opts: { overrideTopic?: string; prebuiltOutline?: DeckOutline } = {}) => {
    const finalTopic = (opts.overrideTopic ?? pendingOutline?.title ?? topic).trim();
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
    // Detect pre-structured "Slide N:" content the user pasted — show effective slide count.
    const slideMarkers = (finalTopic.match(/^\s*Slide\s+\d+\s*[:\-–.]/gim) || []).length;
    const verbatim = slideMarkers >= 2;
    const effectiveCount = verbatim ? slideMarkers : slideCount;
    const verbatimLabel = verbatim ? `  \n📝 Verbatim mode: ${slideMarkers} slides detected — content will be preserved as written.` : "";
    const userMsg: ChatItem = {
      role: "user",
      content: `**${finalTopic.length > 200 ? finalTopic.slice(0, 200) + "…" : finalTopic}**${audience ? `  \nAudience: ${audience}` : ""}  \nSlides: ${effectiveCount}${tone ? `  \nTone: ${tone}` : ""}${themeOverride ? `  \nTheme: ${themeOverride}` : brandLabel}${sourceLabel}${verbatimLabel}`,
    };
    setHistory((h) => [...h, userMsg]);
    setIsGenerating(true);
    setTopic("");
    setPendingOutline(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: buildInvokePayload(finalTopic, { prebuiltOutline: opts.prebuiltOutline }),
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

      // Auto-switch into the full Presentation Studio (Editor tab) so the user lands on
      // an editable view of the freshly generated deck. The chat agent stays available
      // as a sidebar inside the editor for refinements.
      setActiveTab("editor");

      // Archive the outline so it isn't lost. Best-effort — never block the UX.
      if (user && deck.outline) {
        supabase
          .from("deck_outlines")
          .insert({
            user_id: user.id,
            title: deck.title,
            subtitle: deck.subtitle,
            outline: deck.outline as any,
            download_url: deck.downloadUrl,
            filename: deck.filename,
            source_kind: pptxFile ? "pptx" : extractedSource ? "pdf" : brandHubSource ? "brandhub" : "prompt",
            brand_id: useBrand && selectedBrand ? selectedBrand.id : null,
          })
          .then(({ error: archiveErr }) => {
            if (archiveErr) console.warn("Deck archive failed:", archiveErr);
          });
      }
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
    <div
      data-ppt-agent
      className="ppt-agent-page min-h-screen flex flex-col relative"
      style={{
        backgroundColor: '#03002C',
        backgroundImage: `url(${horizonBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}>
      {/* Readability scrim — keeps body content legible against the bright cyan
          horizon dome without losing the atmospheric glow at the edges. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(3,0,44,0.55) 0%, rgba(3,0,44,0.35) 45%, rgba(3,0,44,0) 80%)',
        }}
      />
      {/* Scoped readable typography — works against navy sky AND bright cyan dome,
          independent of light/dark theme */}
      <style>{`
        .ppt-agent-page {
          color: #F4F7FF;
          font-family: 'Geist', 'Inter', system-ui, -apple-system, "Segoe UI", sans-serif;
          font-feature-settings: "ss01", "cv11";
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        .ppt-agent-page h1,
        .ppt-agent-page h2,
        .ppt-agent-page h3,
        .ppt-agent-page h4 {
          color: #FFFFFF;
          letter-spacing: -0.02em;
          text-shadow: 0 1px 2px rgba(3, 0, 44, 0.55);
        }
        .ppt-agent-page p,
        .ppt-agent-page span,
        .ppt-agent-page label,
        .ppt-agent-page li {
          text-shadow: 0 1px 1px rgba(3, 0, 44, 0.45);
        }
        .ppt-agent-page .text-foreground { color: #FFFFFF !important; }
        .ppt-agent-page .text-muted-foreground { color: rgba(228, 232, 245, 0.78) !important; }
        /* Cards/headers stay readable: lift their surface so text above gets a dark backdrop */
        .ppt-agent-page header.bg-card\\/60,
        .ppt-agent-page .bg-card\\/60 {
          background-color: rgba(3, 0, 44, 0.55) !important;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .ppt-agent-page .bg-card\\/80 {
          background-color: rgba(3, 0, 44, 0.7) !important;
        }
        .ppt-agent-page .border,
        .ppt-agent-page .border-b {
          border-color: rgba(255, 255, 255, 0.14) !important;
        }
        /* Inputs/textareas need their own readable surface */
        .ppt-agent-page input,
        .ppt-agent-page textarea,
        .ppt-agent-page select {
          background-color: rgba(3, 0, 44, 0.55) !important;
          color: #FFFFFF !important;
          border-color: rgba(255, 255, 255, 0.18) !important;
        }
        .ppt-agent-page input::placeholder,
        .ppt-agent-page textarea::placeholder {
          color: rgba(228, 232, 245, 0.55) !important;
        }
        /* Buttons — ensure readable text regardless of variant.
           Light/white-surfaced buttons (outline, secondary, ghost-on-light) need dark ink;
           filled primary buttons keep white ink. */
        .ppt-agent-page button,
        .ppt-agent-page [role="button"] {
          text-shadow: none;
        }
        /* Default outline/secondary/white pill buttons -> dark navy text */
        .ppt-agent-page button.bg-background,
        .ppt-agent-page button.bg-secondary,
        .ppt-agent-page button.bg-white,
        .ppt-agent-page button[data-variant="outline"],
        .ppt-agent-page button[data-variant="secondary"] {
          color: #03002C !important;
          background-color: rgba(255, 255, 255, 0.92) !important;
          border-color: rgba(3, 0, 44, 0.18) !important;
        }
        .ppt-agent-page button.bg-background:hover,
        .ppt-agent-page button.bg-secondary:hover,
        .ppt-agent-page button.bg-white:hover {
          background-color: #FFFFFF !important;
          color: #03002C !important;
        }
        /* Selected/active pill state stays primary blue with white text */
        .ppt-agent-page button.bg-primary,
        .ppt-agent-page button[data-state="active"].bg-primary {
          color: #FFFFFF !important;
        }
        /* Ghost buttons sitting over the navy background keep light ink */
        .ppt-agent-page button.hover\\:bg-accent:not(.bg-background):not(.bg-secondary):not(.bg-primary) {
          color: #F4F7FF !important;
        }
      `}</style>
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-20 relative">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Presentation className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold leading-tight truncate">Presentation Studio</h1>
                <p className="text-xs text-muted-foreground truncate">AI deck designer · slide editor · .pptx + MP4 export</p>
              </div>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "agent" | "editor")}>
            <TabsList className="bg-card/40 backdrop-blur">
              <TabsTrigger value="agent" className="gap-2"><Bot className="h-4 w-4" /> Agent</TabsTrigger>
              <TabsTrigger value="editor" className="gap-2"><LayoutTemplate className="h-4 w-4" /> Editor</TabsTrigger>
            </TabsList>
          </Tabs>
          {history.length > 0 && activeTab === "agent" && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="h-4 w-4" /> New deck
            </Button>
          )}
        </div>
      </header>

      <main ref={scrollRef} className={`flex-1 overflow-y-auto relative z-10 ${activeTab === "editor" ? "hidden" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {/* Outline review step (Gamma-style) */}
          {pendingOutline && (
            <OutlineReview
              outline={pendingOutline}
              onChange={setPendingOutline}
              onBack={() => setPendingOutline(null)}
              onConfirm={() => generate({ prebuiltOutline: pendingOutline })}
              building={isGenerating}
            />
          )}

          {/* Empty state — hero composer */}
          {history.length === 0 && !pendingOutline && (
            <div className="text-center pt-4 pb-4 space-y-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Generate a PowerPoint deck</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Pick how you want to start. We draft an outline you can edit before building the .pptx.
                </p>
              </div>

              {/* Step 1 — choose mode */}
              <ModeCards active={mode} onChange={setMode} disabled={isGenerating} />

              {/* Blank mode — prominent template showcase at the top */}
              {mode === "blank" && (
                <div className="pt-2">
                  {selectedTemplateId ? (() => {
                    const tpl = ALL_DECK_TEMPLATES.find((t) => t.id === selectedTemplateId);
                    if (!tpl) return null;
                    return (
                      <div className="max-w-3xl mx-auto flex items-center gap-3 rounded-xl border bg-card/60 backdrop-blur-sm p-3 text-left">
                        <div
                          className="h-10 w-14 rounded-md border shrink-0"
                          style={{ background: tpl.palette.bg }}
                        >
                          <div className="flex gap-1 p-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: tpl.palette.accent }} />
                            <span className="h-2 w-2 rounded-full" style={{ background: tpl.palette.secondary }} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-primary" />
                            {tpl.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{tpl.description || "Look & feel applied to your deck"}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedTemplateId(""); setThemeOverride(""); }}
                        >
                          Change
                        </Button>
                      </div>
                    );
                  })() : (
                    <TemplateGallery
                      selectedId={selectedTemplateId}
                      onSelect={applyTemplate}
                      onOpenInEditor={openTemplateInEditor}
                      disabled={isGenerating}
                      variant="showcase"
                    />
                  )}
                </div>
              )}


              {/* Step 2 — composer (user input) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mode === "paste" && pasteText.trim()) {
                    // Use the pasted text as the topic + add it as light context
                    planOutline(`Build a deck from this content:\n\n${pasteText.trim().slice(0, 4000)}`);
                  } else {
                    planOutline();
                  }
                }}
                className="max-w-3xl mx-auto"
              >
                <div className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm p-3 space-y-3">
                  {mode === "paste" ? (
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={6}
                      placeholder="Paste your notes, brief, transcript, or article here…"
                      className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={isGenerating}
                    />
                  ) : (
                    <div className="flex gap-2 items-stretch">
                      <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            planOutline();
                          }
                        }}
                        rows={2}
                        placeholder={mode === "blank"
                          ? "Title for your deck (e.g. Q3 Sales Review)"
                          : "e.g. Pitch deck for a B2B SaaS launching AI scheduling tool"}
                        className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled={isGenerating}
                        autoFocus
                      />
                    </div>
                  )}

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
                      pptxFile={pptxFile}
                      pptxInputRef={pptxInputRef}
                      handlePptxSelect={handlePptxSelect}
                      clearPptx={clearPptx}
                      rerunPptxExtraction={rerunPptxExtraction}
                      disabled={isGenerating}
                    />
                    <input
                      ref={importPptxAsDeckRef}
                      type="file"
                      accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      className="hidden"
                      onChange={handleImportPptxAsDeck}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1.5"
                      onClick={() => importPptxAsDeckRef.current?.click()}
                      disabled={isGenerating}
                      title="Import a .pptx file straight into the editor — fully editable, no AI"
                    >
                      <Presentation className="h-3.5 w-3.5" />
                      Import .pptx
                    </Button>
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
                    <div className="flex-1" />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isGenerating || (mode === "paste" ? !pasteText.trim() : !topic.trim())}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> {mode === "blank" ? "Draft outline" : "Generate outline"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Step 3 — slides, tone, audience */}
              <QuickControls
                slideCount={slideCount}
                setSlideCount={setSlideCount}
                tone={tone}
                setTone={setTone}
                audience={audience}
                setAudience={setAudience}
                parallaxMode={parallaxMode}
                setParallaxMode={setParallaxMode}
                disabled={isGenerating}
              />

              {/* Step 4 — preset prompt chips (prompt mode only) */}
              {mode === "prompt" && (
                <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto pt-2">
                  {suggestions.map((s) => (
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
              )}

              {/* Step 5 — Start from a template (collapsible) */}
              <div className="max-w-3xl mx-auto pt-2 space-y-3">
                {selectedTemplateId ? (() => {
                  const tpl = ALL_DECK_TEMPLATES.find((t) => t.id === selectedTemplateId);
                  if (!tpl) return null;
                  return (
                    <div className="flex items-center gap-3 rounded-xl border bg-card/60 backdrop-blur-sm p-3 text-left">
                      <div
                        className="h-10 w-14 rounded-md border shrink-0"
                        style={{ background: tpl.palette.bg }}
                      >
                        <div className="flex gap-1 p-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: tpl.palette.accent }} />
                          <span className="h-2 w-2 rounded-full" style={{ background: tpl.palette.secondary }} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          {tpl.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{tpl.description || "Look & feel applied to your deck"}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedTemplateId(""); setThemeOverride(""); setShowTemplateGallery(true); }}
                      >
                        Change
                      </Button>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setShowTemplateGallery((v) => !v)}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      <LayoutTemplate className="h-4 w-4" />
                      {showTemplateGallery ? "Hide templates" : "Pick a template"}
                    </Button>
                    {showTemplateGallery && (
                      <div className="w-full">
                        <TemplateGallery
                          selectedId={selectedTemplateId}
                          onSelect={applyTemplate}
                          onOpenInEditor={openTemplateInEditor}
                          disabled={isGenerating}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground/80 pt-2">
                Outline first → review & edit → we build a real .pptx you can open in PowerPoint, Keynote, or Google Slides.
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
                    templateId={item.deck.templateId}
                    onUpdated={(next) => {
                      setHistory((h) =>
                        h.map((x, xi) =>
                          xi === i && x.deck
                            ? { ...x, deck: { ...x.deck, outline: next.outline, downloadUrl: next.downloadUrl, filename: next.filename, templateId: next.templateId } }
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
      {history.length > 0 && activeTab === "agent" && (
        <footer className="border-t bg-card/60 backdrop-blur-md sticky bottom-0 z-20 relative">
          <div className="max-w-6xl mx-auto px-6 py-3 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                planOutline();
              }}
              className="flex gap-2"
            >
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    planOutline();
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
                pptxFile={pptxFile}
                pptxInputRef={pptxInputRef}
                handlePptxSelect={handlePptxSelect}
                clearPptx={clearPptx}
                rerunPptxExtraction={rerunPptxExtraction}
                disabled={isGenerating}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full gap-1.5"
                onClick={() => importPptxAsDeckRef.current?.click()}
                disabled={isGenerating}
                title="Import a .pptx file straight into the editor — fully editable, no AI"
              >
                <Presentation className="h-3.5 w-3.5" />
                Import .pptx
              </Button>
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

      {/* Editor tab — full-page (inline) Presentation Studio with the chat agent
           docked on the left as a sidebar so the user can keep refining the deck. */}
      <SlideEditor
        key={editorKey}
        inline
        isOpen={activeTab === "editor"}
        onClose={() => setActiveTab("agent")}
        assetType="presentation"
        assetName={history.find((h) => h.deck)?.deck?.title || "New Presentation"}
        brand={(globalBrands.find((b) => b.id === selectedBrandId) || activeBrand) as any || null}
        initialSlides={editorInitialSlides}
        corporateStyleRef={
          selectedTemplateId && BUILTIN_CORPORATE_DECKS[selectedTemplateId] && templateStarterSlides && templateStarterSlides.length > 0
            ? {
                label: BUILTIN_CORPORATE_DECKS[selectedTemplateId].label,
                slides: templateStarterSlides,
                themeTokens: templateThemeTokens ?? undefined,
                layoutCatalog: templateLayoutCatalog ?? undefined,
              }
            : null
        }
        sidebar={
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b bg-card/60 shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">AI Agent</h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Refine, edit, and send deck changes
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setActiveTab("agent")}
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Chat
                </Button>
              </div>

              {/* Context chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" /> Live editor
                </span>
                {selectedBrand?.name && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-[160px]"
                    title={selectedBrand.name}
                  >
                    <Presentation className="h-3 w-3 text-primary" />
                    <span className="truncate">{selectedBrand.name}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <LayoutTemplate className="h-3 w-3 text-primary" />
                  {editorInitialSlides?.length ?? 0} slide{(editorInitialSlides?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {history.length === 0 && (
                <div className="text-xs text-muted-foreground py-8 px-2 space-y-3">
                  <div className="flex items-center gap-2 text-foreground/80">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">Edit your deck with words</span>
                  </div>
                  <p className="leading-relaxed">
                    Ask the agent to rewrite a slide, swap a layout, tighten copy, or add a
                    section — changes flow straight into the editor on the right.
                  </p>
                  <ul className="space-y-1 text-[11px] list-disc list-inside marker:text-primary/60">
                    <li>"Make slide 2 shorter and punchier"</li>
                    <li>"Swap the intro to a hero layout"</li>
                    <li>"Add a closing CTA slide"</li>
                  </ul>
                </div>
              )}
              {history.map((item, i) => (
                <div key={i} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[92%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      item.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 border border-border/60"
                    }`}
                  >
                    <p
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: item.content
                          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                    {item.deck?.downloadUrl && (
                      <a
                        href={item.deck.downloadUrl}
                        download={item.deck.filename}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] underline opacity-90 hover:opacity-100"
                      >
                        <Download className="h-3 w-3" /> {item.deck.filename}
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-muted/60 border rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Working on it…</span>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); planOutline(); }}
              className="border-t p-3 space-y-2 bg-card/60 shrink-0"
              aria-label="Send deck edit to AI agent"
            >
              <label htmlFor="ppt-agent-sidebar-input" className="sr-only">
                Describe a change to the deck
              </label>
              <textarea
                id="ppt-agent-sidebar-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); planOutline(); }
                }}
                rows={2}
                placeholder="Refine slides, swap layouts, add a section…"
                aria-label="Describe a change to the deck"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                size="sm"
                className="w-full gap-1.5"
                disabled={!topic.trim() || isGenerating}
                aria-label="Send message to AI agent"
              >
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Send</>}
              </Button>
            </form>
          </div>
        }
      />

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
          triggerGenerate: () => planOutline(),
        }}
      />
    </div>
  );
};

export default PowerPointAgent;
