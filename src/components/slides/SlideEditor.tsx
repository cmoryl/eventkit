import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Copy, ChevronLeft, ChevronRight, Play,
  Type, Layout, Image, Columns, SplitSquareHorizontal, Square,
  ZoomIn, ZoomOut, Maximize, Monitor, ChevronDown, Sparkles, Download, Upload,
  Replace, ImagePlus, Quote, BarChart3, Maximize2, GitCompare,
  AlignLeft, AlignCenter, AlignRight, Palette, LayoutTemplate, Grid3X3, Bookmark
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Brand } from '@/types/studio.types';
import { SlideData, DEFAULT_SLIDES, SLIDE_TEMPLATES, SlideBgEffect, SlideBgEffectType, SlideBgEffectPresetName, BG_EFFECT_PRESETS, LAYOUT_VARIATIONS } from './slideTypes';
import { Slider } from '@/components/ui/slider';
import { TemplateGalleryDialog } from './TemplateGalleryDialog';
import type { InfographicTemplate } from './infographicTemplates';
import { SlideRenderer } from './SlideRenderer';
import { ParallaxLayerEditor } from './ParallaxLayerEditor';
import { SlideThumbnail } from './SlideThumbnail';
import { CenteredScaledSlide } from './ScaledSlide';
import { PresentationMode, SlideTransition } from './PresentationMode';
import { FloatingMenu } from './FloatingMenu';
import { v4 as uuidv4 } from 'uuid';
import { AISlideGenerator } from './AISlideGenerator';
import { exportSlidesToPptx } from './exportPptx';
import { parsePptxFile } from './importPptx';
import { toast } from 'sonner';
import { BrandAssetsLibrary } from '@/components/brand/BrandAssetsLibrary';
import { useBrandHubFiles, type BrandFile } from '@/hooks/useBrandHubFiles';
import { Library } from 'lucide-react';
import { SlideAssetSearchPanel, SLIDE_ASSET_IMAGE_MIME } from './SlideAssetSearchPanel';
import { SlideSmartLayoutsPanel, SLIDE_SECTION_MIME } from './SlideSmartLayoutsPanel';
import { AccentImagePanel } from './AccentImagePanel';
import { AccentImageLayer } from './AccentImageLayer';
import { ShortcutsOverlay } from './ShortcutsOverlay';
import { BrandLockBar, applyBrandLockToSlide } from './BrandLockBar';
import { GeneratedSlidesTray } from './GeneratedSlidesTray';
import { applySlideTemplate, SLIDE_BLOCK_TEMPLATES } from './slideTemplateRegistry';
import { slideEditorBus } from '@/lib/slideEditorBus';
import { SaveAsTemplateDialog } from '@/components/templates/SaveAsTemplateDialog';
import { DemoSlidePropertyEditor } from './DemoSlidePropertyEditor';
import { InlineEditOverlay } from './InlineEditOverlay';
import { useSlidesHistory } from '@/hooks/useSlidesHistory';
import { Undo2, Redo2, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DeckBulkActionsMenu } from './DeckBulkActionsMenu';
import { applyDeckBulkAction, DECK_BULK_ACTIONS, type DeckBulkActionId } from './deckBulkActions';
import { FindReplaceDialog } from './FindReplaceDialog';
import { replaceInDeck } from './findReplace';
import { Search as SearchIcon } from 'lucide-react';
import { EditorNavRail, type NavRailTab } from './EditorNavRail';


import { InsertDrawerTabs } from './InsertDrawerTabs';
import { applySmartObject, SLIDE_OBJECT_MIME } from './smartObjectRegistry';
import { Layers, Plus as PlusIcon, Palette as PaletteIcon, Sparkles as SparklesIcon, MessageSquare, Layers as LayersIcon } from 'lucide-react';
import { LayersPanel } from './LayersPanel';

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

const LAYOUT_OPTIONS: { value: SlideData['layout']; label: string; icon: React.ElementType }[] = [
  { value: 'title', label: 'Title Slide', icon: Type },
  { value: 'content', label: 'Content', icon: Layout },
  { value: 'image-left', label: 'Image Left', icon: SplitSquareHorizontal },
  { value: 'image-right', label: 'Image Right', icon: Columns },
  { value: 'two-column', label: 'Two Column', icon: Columns },
  { value: 'quote', label: 'Quote', icon: Quote },
  { value: 'stats', label: 'Stats', icon: BarChart3 },
  { value: 'full-image', label: 'Full Image', icon: Maximize2 },
  { value: 'comparison', label: 'Comparison', icon: GitCompare },
  { value: 'timeline', label: 'Timeline', icon: Layout },
  { value: 'process', label: 'Process', icon: Layout },
  { value: 'chart', label: 'Chart', icon: BarChart3 },
  { value: 'agenda', label: 'Agenda', icon: Layout },
  { value: 'big-number', label: 'Big Number', icon: BarChart3 },
  { value: 'parallax', label: '3D · Parallax', icon: Maximize2 },
  { value: 'section', label: 'Section Break', icon: Square },
  { value: 'blank', label: 'Blank', icon: Square },
];

interface SlideEditorProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
  assetName: string;
  brand: Brand | null;
  /** Pre-populate the editor with specific slides (e.g. from the template gallery landing page) */
  initialSlides?: SlideData[];
  /**
   * When true, render the editor inline as a full-viewport panel instead of a modal Dialog.
   * Used by /agent/powerpoint so the editor takes over the page after generation rather
   * than appearing in a windowed overlay.
   */
  inline?: boolean;
  /**
   * Optional sidebar content rendered to the left of the editor in `inline` mode.
   * Used by /agent/powerpoint to keep the chat agent visible while editing the deck.
   */
  sidebar?: React.ReactNode;
  /**
   * Optional reference for one-shot "Add slide in <Style> style" generation.
   * When provided, a dedicated button appears next to "Add Slide" that calls
   * the add-styled-slide edge function with these reference slides as the style anchor.
   */
  corporateStyleRef?: {
    label: string;
    slides: SlideData[];
    /** Authoritative theme palette + fonts pulled from the deck's theme1.xml. */
    themeTokens?: {
      name?: string;
      colors: Record<string, string>;
      fonts: { major?: string; minor?: string };
    };
    /** Real slide-layout catalog parsed from the deck's ppt/slideLayouts/*.xml. */
    layoutCatalog?: {
      slideWidthEmu: number;
      slideHeightEmu: number;
      layouts: Array<{
        fileName: string;
        name: string;
        type?: string;
        index: number;
        placeholders: Array<{
          type: string;
          idx?: number;
          sz?: string;
          xPct?: number;
          yPct?: number;
          wPct?: number;
          hPct?: number;
        }>;
      }>;
    };
  } | null;
}

export function SlideEditor({ isOpen, onClose, assetType, assetName, brand, initialSlides, inline, sidebar, corporateStyleRef }: SlideEditorProps) {

  const [slides, setSlides] = useState<SlideData[]>(() =>
    initialSlides && initialSlides.length > 0 ? initialSlides : [...DEFAULT_SLIDES]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDarkCanvas, setIsDarkCanvas] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [slideTransition, setSlideTransition] = useState<SlideTransition>('fade');
  const [isGridView, setIsGridView] = useState(false);
  const [animatedBackgrounds, setAnimatedBackgrounds] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAssetsLibraryOpen, setIsAssetsLibraryOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<BrandFile[]>([]);
  const [canvasFileOver, setCanvasFileOver] = useState(false);
  const [thumbFileOver, setThumbFileOver] = useState<number | null>(null);
  const brandLockKey = brand?.id ? `eventkit:brand-lock:${brand.id}` : null;
  const [brandLocked, setBrandLocked] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !brandLockKey) return false;
    return window.localStorage.getItem(brandLockKey) === '1';
  });
  useEffect(() => {
    if (!brandLockKey || typeof window === 'undefined') return;
    window.localStorage.setItem(brandLockKey, brandLocked ? '1' : '0');
  }, [brandLocked, brandLockKey]);
  // Re-hydrate when brand changes
  useEffect(() => {
    if (!brandLockKey || typeof window === 'undefined') return;
    setBrandLocked(window.localStorage.getItem(brandLockKey) === '1');
  }, [brandLockKey]);
  const [generatedTraySlides, setGeneratedTraySlides] = useState<SlideData[]>([]);
  /** Currently-open NavRail tab — null when drawer is collapsed. */
  const [navRailTab, setNavRailTab] = useState<string | null>(null);
  /** Whether the thumbnail rail is visible (toggled by NavRail "Slides" icon). */
  const [thumbRailVisible, setThumbRailVisible] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);

  // Undo / redo history for the deck.
  const history = useSlidesHistory(slides, (next) => setSlides(next), { enabled: isOpen });


  // Global keyboard shortcuts (only active while editor is open + not in an input).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
      const mod = e.metaKey || e.ctrlKey;

      // Find & Replace — works even while typing in an input.
      if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindOpen((v) => !v);
        return;
      }

      if (inField) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && shortcutsOpen) {
        e.preventDefault();
        setShortcutsOpen(false);
        return;
      }
      if (mod && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setBrandLocked((v) => !v);
        toast.success(`Brand Lock ${!brandLocked ? 'ON' : 'OFF'}`);
        return;
      }
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        history.undo();
        return;
      }
      if (mod && (e.shiftKey && e.key.toLowerCase() === 'z') || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        history.redo();
        return;
      }

      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSlide(activeIndex);
        return;
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && e.shiftKey) {
        e.preventDefault();
        deleteSlide(activeIndex);
        return;
      }
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        if (e.shiftKey) {
          reorderSlide(activeIndex, Math.min(activeIndex + 1, slides.length - 1));
        } else {
          setActiveIndex((i) => Math.min(i + 1, slides.length - 1));
        }
        return;
      }
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        if (e.shiftKey) {
          reorderSlide(activeIndex, Math.max(activeIndex - 1, 0));
        } else {
          setActiveIndex((i) => Math.max(i - 1, 0));
        }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, shortcutsOpen, brandLocked, activeIndex, slides.length, history]);




  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) return;
    setSlides(initialSlides);
    setActiveIndex(0);
  }, [initialSlides]);

  // Auto-discover BrandHub files for the active brand so we can show a "Brand Decks" hint.
  const { byCategory: brandFilesByCategory } = useBrandHubFiles({
    shareToken: brand?.brandhub_share_token ?? null,
    enabled: isOpen,
  });
  const brandDeckCount = brandFilesByCategory.deck.length;

  const activeSlide = slides[activeIndex];

  const brandColors = brand?.styles ? {
    primary: brand.styles.primary_color,
    secondary: brand.styles.secondary_color,
    accent: brand.styles.accent_color,
  } : undefined;

  const brandFonts = brand?.styles ? {
    heading: brand.styles.heading_font,
    body: brand.styles.body_font,
  } : undefined;

  const brandImagery = brand?.styles?.all_imagery?.byType;

  const updateSlide = useCallback((index: number, updates: Partial<SlideData>) => {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  }, []);
  const [isGeneratingStyledSlide, setIsGeneratingStyledSlide] = useState(false);
  const [pendingStyledSlide, setPendingStyledSlide] = useState<SlideData | null>(null);
  const generateStyledSlide = useCallback(async () => {
    if (!corporateStyleRef || corporateStyleRef.slides.length === 0) return;
    setIsGeneratingStyledSlide(true);
    const toastId = toast.loading(`Generating slide in ${corporateStyleRef.label} style…`);
    try {
      const refs = corporateStyleRef.slides.slice(0, 24).map((s) => ({
        layout: s.layout,
        title: s.title,
        subtitle: s.subtitle,
        body: typeof s.body === 'string' ? s.body : undefined,
        bullets: Array.isArray((s as any).bullets) ? (s as any).bullets : undefined,
        notes: s.notes,
      }));
      const { data, error } = await supabase.functions.invoke('add-styled-slide', {
        body: {
          styleName: corporateStyleRef.label,
          deckTitle: assetName,
          referenceSlides: refs,
          insertPosition: activeIndex + 2,
          themeTokens: corporateStyleRef.themeTokens,
          layoutCatalog: corporateStyleRef.layoutCatalog,
        },
      });
      if (error) throw new Error(error.message || 'Generation failed');
      if (!data?.slide) throw new Error('No slide returned');
      const g = data.slide as any;
      const bulletsText = Array.isArray(g.bullets) && g.bullets.length
        ? g.bullets.map((b: string) => `• ${b}`).join('\n')
        : undefined;
      const newSlide: SlideData = {
        id: uuidv4(),
        layout: (g.layout as SlideData['layout']) || 'content',
        title: g.title || 'New Slide',
        subtitle: g.subtitle,
        body: g.body || bulletsText,
        notes: g.notes,
        variant: 'default',
      };
      setPendingStyledSlide(newSlide);
      toast.success(`Preview ready — review before inserting`, { id: toastId });
    } catch (err) {
      console.error('add-styled-slide failed', err);
      toast.error(err instanceof Error ? err.message : 'Could not generate slide', { id: toastId });
    } finally {
      setIsGeneratingStyledSlide(false);
    }
  }, [corporateStyleRef, assetName, activeIndex]);
  const addStyledSlide = generateStyledSlide;
  const confirmInsertPendingSlide = useCallback(() => {
    if (!pendingStyledSlide) return;
    const slideToInsert = pendingStyledSlide;
    setSlides((prev) => {
      const next = [...prev];
      next.splice(activeIndex + 1, 0, slideToInsert);
      return next;
    });
    setActiveIndex(activeIndex + 1);
    setPendingStyledSlide(null);
    toast.success('Slide inserted into deck');
  }, [pendingStyledSlide, activeIndex]);


  const addSlide = useCallback((afterIndex: number) => {
    const newSlide: SlideData = {
      id: uuidv4(),
      layout: 'content',
      title: 'New Slide',
      body: '',
      variant: 'default',
    };
    setSlides(prev => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, newSlide);
      return next;
    });
    setActiveIndex(afterIndex + 1);
  }, []);

  const duplicateSlide = useCallback((index: number) => {
    setSlides(prev => {
      const next = [...prev];
      const copy = { ...next[index], id: uuidv4() };
      next.splice(index + 1, 0, copy);
      return next;
    });
    setActiveIndex(index + 1);
  }, []);

  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(prev => Math.min(prev, slides.length - 2));
  }, [slides.length]);

  const reorderSlide = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setSlides(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setActiveIndex(toIndex);
  }, []);

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDragIndex(null);
    setDragOverIndex(null);
    setDragPosition(null);
  }, []);

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex === null || dragIndex === index) {
      setDragOverIndex(null);
      setDragPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverIndex(index);
    setDragPosition(e.clientY < midY ? 'above' : 'below');
  }, [dragIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
    setDragPosition(null);
  }, []);

  const handleDrop = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    let targetIndex = index;
    if (dragPosition === 'below') targetIndex = index + 1;
    if (dragIndex < targetIndex) targetIndex--;
    reorderSlide(dragIndex, targetIndex);
    setDragIndex(null);
    setDragOverIndex(null);
    setDragPosition(null);
  }, [dragIndex, dragPosition, reorderSlide]);

  // ── File drag-and-drop helpers ────────────────────────────────────────
  const loadImageFile = useCallback((file: File, slideIndex: number) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSlides(prev => prev.map((s, i) => {
        if (i !== slideIndex) return s;
        if (s.layout === 'demo-mock' && s.demoContent) {
          // Demo-mock templates have no photo slot — paint the dropped image as
          // a full-bleed background instead so it's actually visible.
          const nextContent = {
            ...s.demoContent,
            imagery: [dataUrl, ...(s.demoContent.imagery ?? []).slice(1)],
          };
          return {
            ...s,
            bgImage: dataUrl,
            bgImageOpacity: s.bgImageOpacity ?? 0.35,
            demoContent: nextContent,
            imageUrl: dataUrl,
            images: nextContent.imagery,
          };
        }
        const needsImageLayout = !['image-left', 'image-right', 'full-image'].includes(s.layout);
        return {
          ...s,
          imageUrl: dataUrl,
          images: [dataUrl, ...(s.images ?? []).slice(1)],
          ...(needsImageLayout && { layout: 'image-left' as const }),
        };
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  /** Insert dropped image(s) as new full-image slide(s) right after the given index. */
  const insertImageFilesAsSlides = useCallback(async (files: File[], afterIndex: number) => {
    const newSlides = await Promise.all(
      files.map(file =>
        new Promise<SlideData>(resolve => {
          const r = new FileReader();
          r.onload = () => resolve({
            id: uuidv4(),
            layout: 'full-image',
            title: file.name.replace(/\.[^/.]+$/, ''),
            variant: 'default',
            imageUrl: r.result as string,
            images: [r.result as string],
          });
          r.readAsDataURL(file);
        }),
      ),
    );
    setSlides(prev => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, ...newSlides);
      return next;
    });
    return newSlides;
  }, []);

  /** Apply a remote image URL (e.g. a BrandHub asset) to a slide. */
  const applyImageUrlToSlide = useCallback((url: string, slideIndex: number) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s;
      const needsImageLayout = !['image-left', 'image-right', 'full-image'].includes(s.layout);
      return {
        ...s,
        imageUrl: url,
        images: [url, ...(s.images ?? []).slice(1)],
        ...(needsImageLayout && { layout: 'image-left' as const }),
      };
    }));
  }, []);

  /** Set (or clear with url='') a slide's accent image. */
  const setAccentImageForSlide = useCallback((url: string, slideIndex: number, position: 'top' | 'left' | 'right' | 'background' = 'background') => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s;
      if (!url) return { ...s, accentImage: undefined };
      return {
        ...s,
        accentImage: {
          url,
          position,
          overlay: position === 'background' ? 'faded' : 'none',
          intensity: 1,
          focalX: 50,
          focalY: 50,
        },
      };
    }));
  }, []);

  /** Insert a pre-built section template as a new slide after `afterIndex`. */
  const insertSectionAfter = useCallback((afterIndex: number, payload: Omit<SlideData, 'id'>) => {
    const newSlide: SlideData = { id: uuidv4(), ...payload };
    setSlides(prev => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, newSlide);
      return next;
    });
    setActiveIndex(afterIndex + 1);
  }, []);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    // Always preventDefault so the browser shows a "copy" cursor instead of "no-drop".
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    const types = e.dataTransfer.types;
    // Highlight on files, dragged BrandHub images, section templates, or smart objects.
    if (
      types.includes('Files') ||
      types.includes(SLIDE_ASSET_IMAGE_MIME) ||
      types.includes(SLIDE_SECTION_MIME) ||
      types.includes(SLIDE_OBJECT_MIME)
    ) {
      setCanvasFileOver(true);
    }
  }, []);

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setCanvasFileOver(false);
    }
  }, []);

  const handleCanvasDrop = useCallback(async (e: React.DragEvent) => {
    const types = e.dataTransfer.types;
    const hasFiles = types.includes('Files');
    const hasSection = types.includes(SLIDE_SECTION_MIME);
    const hasObject = types.includes(SLIDE_OBJECT_MIME);
    const hasAssetUrl = types.includes(SLIDE_ASSET_IMAGE_MIME);
    if (!hasFiles && !hasSection && !hasObject && !hasAssetUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setCanvasFileOver(false);

    // 1. Pre-built section template → insert as new slide after active.
    if (hasSection) {
      try {
        const raw = e.dataTransfer.getData(SLIDE_SECTION_MIME);
        const payload = JSON.parse(raw) as Omit<SlideData, 'id'>;
        insertSectionAfter(activeIndex, payload);
        toast.success(`Inserted ${payload.layout} section`);
      } catch {
        toast.error('Could not insert section');
      }
      return;
    }

    // 1b. Smart object → merge into active slide (snap or float).
    if (hasObject) {
      try {
        const raw = e.dataTransfer.getData(SLIDE_OBJECT_MIME);
        const { id, mode } = JSON.parse(raw) as { id: string; mode?: 'snap' | 'float' };
        // Compute drop position in % of slide.
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;
        const finalMode = mode ?? (e.altKey ? 'float' : undefined);
        setSlides((prev) => prev.map((s, i) =>
          i === activeIndex ? applySmartObject(id, s, { x: xPct, y: yPct, mode: finalMode }) : s,
        ));
        toast.success('Object added');
      } catch {
        toast.error('Could not insert object');
      }
      return;
    }

    // 2. BrandHub image URL → apply to active slide (Shift = new slide, Alt = accent image).
    if (hasAssetUrl) {
      const url = e.dataTransfer.getData(SLIDE_ASSET_IMAGE_MIME);
      if (url) {
        if (e.altKey) {
          setAccentImageForSlide(url, activeIndex, 'background');
          toast.success('Set as accent image');
        } else if (e.shiftKey) {
          const newSlide: SlideData = {
            id: uuidv4(),
            layout: 'full-image',
            title: '',
            variant: 'default',
            imageUrl: url,
            images: [url],
          };
          setSlides(prev => {
            const next = [...prev];
            next.splice(activeIndex + 1, 0, newSlide);
            return next;
          });
          setActiveIndex(activeIndex + 1);
          toast.success('Added image as new slide');
        } else {
          applyImageUrlToSlide(url, activeIndex);
          toast.success('Image added to slide');
        }
      }
      return;
    }

    // 3. OS files (existing behavior).
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const pptxFile = files.find(f => f.name.toLowerCase().endsWith('.pptx'));

    if (pptxFile) {
      try {
        const imported = await parsePptxFile(pptxFile);
        setSlides(prev => {
          const next = [...prev];
          next.splice(activeIndex + 1, 0, ...imported);
          return next;
        });
        toast.success(`Imported ${imported.length} slides from ${pptxFile.name}`);
      } catch (err: unknown) {
        toast.error((err as Error).message ?? 'Failed to import PPTX');
      }
    }

    // Shift+drop forces "insert as new slide(s) after the current one" behavior
    // — the default is to apply the dropped image to the currently-active slide.
    const insertAsNew = e.shiftKey;

    if (imageFiles.length === 1) {
      if (insertAsNew) {
        await insertImageFilesAsSlides(imageFiles, activeIndex);
        toast.success('Added image as new slide (Shift+drop)');
      } else {
        loadImageFile(imageFiles[0], activeIndex);
        toast.success('Image added to slide');
      }
    } else if (imageFiles.length > 1) {
      if (insertAsNew) {
        await insertImageFilesAsSlides(imageFiles, activeIndex);
        toast.success(`Added ${imageFiles.length} images as new slides (Shift+drop)`);
      } else {
        loadImageFile(imageFiles[0], activeIndex);
        await insertImageFilesAsSlides(imageFiles.slice(1), activeIndex);
        toast.success(`Added ${imageFiles.length} images as slides`);
      }
    }
  }, [activeIndex, loadImageFile, insertImageFilesAsSlides, insertSectionAfter, applyImageUrlToSlide, setAccentImageForSlide]);

  const handleThumbFileDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    const types = e.dataTransfer.types;
    if (
      types.includes('Files') ||
      types.includes(SLIDE_ASSET_IMAGE_MIME) ||
      types.includes(SLIDE_SECTION_MIME) ||
      types.includes(SLIDE_OBJECT_MIME)
    ) {
      setThumbFileOver(index);
    }
  }, []);

  const handleThumbFileDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setThumbFileOver(null);
    }
  }, []);

  const handleThumbFileDrop = useCallback((index: number) => async (e: React.DragEvent) => {
    const types = e.dataTransfer.types;
    const hasFiles = types.includes('Files');
    const hasSection = types.includes(SLIDE_SECTION_MIME);
    const hasObject = types.includes(SLIDE_OBJECT_MIME);
    const hasAssetUrl = types.includes(SLIDE_ASSET_IMAGE_MIME);
    if (!hasFiles && !hasSection && !hasObject && !hasAssetUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setThumbFileOver(null);

    // Pre-built section → insert after this thumbnail.
    if (hasSection) {
      try {
        const payload = JSON.parse(e.dataTransfer.getData(SLIDE_SECTION_MIME)) as Omit<SlideData, 'id'>;
        insertSectionAfter(index, payload);
        toast.success(`Inserted ${payload.layout} section`);
      } catch {
        toast.error('Could not insert section');
      }
      return;
    }

    // Smart object dropped on a thumbnail → merge into THAT slide at center.
    if (hasObject) {
      try {
        const { id, mode } = JSON.parse(e.dataTransfer.getData(SLIDE_OBJECT_MIME)) as { id: string; mode?: 'snap' | 'float' };
        const finalMode = mode ?? (e.altKey ? 'float' : undefined);
        setSlides((prev) => prev.map((s, i) =>
          i === index ? applySmartObject(id, s, { x: 50, y: 50, mode: finalMode }) : s,
        ));
        setActiveIndex(index);
        toast.success('Object added');
      } catch {
        toast.error('Could not insert object');
      }
      return;
    }

    // BrandHub image URL → apply to this slide (Shift = new slide, Alt = accent image).
    if (hasAssetUrl) {
      const url = e.dataTransfer.getData(SLIDE_ASSET_IMAGE_MIME);
      if (!url) return;
      if (e.altKey) {
        setAccentImageForSlide(url, index, 'background');
        setActiveIndex(index);
        toast.success('Set as accent image');
      } else if (e.shiftKey) {
        const newSlide: SlideData = {
          id: uuidv4(),
          layout: 'full-image',
          title: '',
          variant: 'default',
          imageUrl: url,
          images: [url],
        };
        setSlides(prev => {
          const next = [...prev];
          next.splice(index + 1, 0, newSlide);
          return next;
        });
        setActiveIndex(index + 1);
        toast.success('Added image as new slide');
      } else {
        applyImageUrlToSlide(url, index);
        setActiveIndex(index);
        toast.success('Image added to slide');
      }
      return;
    }

    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    if (e.shiftKey) {
      await insertImageFilesAsSlides([file], index);
      toast.success('Added image as new slide (Shift+drop)');
    } else {
      loadImageFile(file, index);
      setActiveIndex(index);
      toast.success('Image added to slide');
    }
  }, [loadImageFile, insertImageFilesAsSlides, insertSectionAfter, applyImageUrlToSlide, setAccentImageForSlide]);

  // Normalize a slide payload against the active brand colors if Brand Lock is on.
  const normalizeWithBrandLock = useCallback(<T extends Partial<SlideData>>(slide: T): T => {
    if (!brandLocked || !brandColors) return slide;
    return applyBrandLockToSlide(slide, brandColors);
  }, [brandLocked, brandColors]);

  const handleAISlidesGenerated = useCallback((newSlides: SlideData[]) => {
    const normalized = newSlides.map((s) => normalizeWithBrandLock(s) as SlideData);
    setSlides(normalized);
    setActiveIndex(0);
    // Also stash drafts in the tray so user can drag/recombine individual slides.
    setGeneratedTraySlides(normalized.map((s) => ({ ...s, id: `tray-${s.id}` })));
  }, [normalizeWithBrandLock]);

  const applyBrandLockToAllSlides = useCallback(() => {
    if (!brandColors) return;
    setSlides((prev) => prev.map((s) => applyBrandLockToSlide(s, brandColors)));
    toast.success('Brand colors applied to all slides');
  }, [brandColors]);

  const runDeckBulkAction = useCallback((id: DeckBulkActionId) => {
    setSlides((prev) => applyDeckBulkAction(id, prev, { activeIndex: activeIndexRef.current }));
    const meta = DECK_BULK_ACTIONS.find((a) => a.id === id);
    toast.success(meta ? meta.label : 'Bulk action applied');
  }, []);

  // Click-to-insert from the SmartObjectsPanel — drops the object at slide center,
  // using its declared defaultMode. Drag-and-drop uses the more precise drop coords.
  const insertSmartObject = useCallback((objectId: string) => {
    setSlides((prev) => prev.map((s, i) =>
      i === activeIndexRef.current ? applySmartObject(objectId, s, { x: 50, y: 50 }) : s,
    ));
    toast.success('Object added to slide');
  }, []);

  // Deck-wide find & replace — used by toolbar dialog and voice agent.
  const runFindReplace = useCallback(
    (find: string, replace: string, opts?: { caseSensitive?: boolean; wholeWord?: boolean }) => {
      if (!find) return 0;
      let replacedCount = 0;
      setSlides((prev) => {
        const result = replaceInDeck(prev, find, replace, opts ?? {});
        replacedCount = result.replacedCount;
        return result.slides;
      });
      return replacedCount;
    },
    [],
  );




  // ── Voice-agent bridge: expose imperative commands to the slideEditorBus
  // so the ElevenLabs voice agent (or any other surface) can drive this
  // editor's state without prop-drilling.
  const activeIndexRef = useRef(0);
  const slidesCountRef = useRef(0);
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { slidesCountRef.current = slides.length; }, [slides.length]);
  useEffect(() => {
    slideEditorBus.connect({
      insertTemplate: (templateId, slotValues) => {
        const payload = applySlideTemplate(templateId, slotValues ?? {});
        if (!payload) return null;
        const newSlide: SlideData = { id: uuidv4(), ...payload };
        setSlides(prev => {
          const next = [...prev];
          next.splice(activeIndexRef.current + 1, 0, newSlide);
          return next;
        });
        setActiveIndex(activeIndexRef.current + 1);
        return newSlide;
      },
      insertSection: (payload) => {
        const newSlide: SlideData = { id: uuidv4(), ...payload };
        setSlides(prev => {
          const next = [...prev];
          next.splice(activeIndexRef.current + 1, 0, newSlide);
          return next;
        });
        setActiveIndex(activeIndexRef.current + 1);
        return newSlide;
      },
      setAccentImage: (params) => {
        const idx = activeIndexRef.current;
        setSlides(prev => prev.map((s, i) => {
          if (i !== idx) return s;
          if (params.position === 'none') return { ...s, accentImage: undefined };
          const current = s.accentImage;
          return {
            ...s,
            accentImage: {
              url: params.url ?? current?.url ?? '',
              position: params.position ?? current?.position ?? 'background',
              overlay: params.overlay ?? current?.overlay ?? 'none',
              intensity: params.intensity ?? current?.intensity ?? 1,
              focalX: current?.focalX ?? 50,
              focalY: current?.focalY ?? 50,
            },
          };
        }));
        return true;
      },
      applyBrandImage: (params) => {
        const idx = activeIndexRef.current;
        if (params.role === 'accent') {
          setAccentImageForSlide(params.url, idx, 'background');
        } else {
          applyImageUrlToSlide(params.url, idx);
        }
        return true;
      },
      setSlideField: (params) => {
        const idx = activeIndexRef.current;
        setSlides((prev) => prev.map((s, i) => {
          if (i !== idx) return s;
          return { ...s, [params.field]: params.value };
        }));
        return true;
      },
      goToSlide: (index) => {
        if (index < 0 || index >= slidesCountRef.current) return false;
        setActiveIndex(index);
        return true;
      },
      duplicateActive: () => {
        const idx = activeIndexRef.current;
        setSlides(prev => {
          if (!prev[idx]) return prev;
          const copy = { ...prev[idx], id: uuidv4() };
          const next = [...prev];
          next.splice(idx + 1, 0, copy);
          return next;
        });
        return true;
      },
      deleteActive: () => {
        const idx = activeIndexRef.current;
        if (slidesCountRef.current <= 1) return false;
        setSlides(prev => prev.filter((_, i) => i !== idx));
        setActiveIndex(Math.max(0, idx - 1));
        return true;
      },
      getActiveIndex: () => activeIndexRef.current,
      getSlideCount: () => slidesCountRef.current,
      toggleBrandLock: (locked) => {
        setBrandLocked(!!locked);
        return true;
      },
      applyBrandLockToAll: () => {
        const colors = brandColorsRef.current;
        if (!colors) return false;
        setSlides((prev) => prev.map((s) => applyBrandLockToSlide(s, colors)));
        return true;
      },
      getBrandLock: () => brandLockedRef.current,
      getDraftCount: () => draftSlidesRef.current.length,
      insertDraft: (index) => {
        const drafts = draftSlidesRef.current;
        const target = drafts[index];
        if (!target) return false;
        const { id: _id, ...payload } = target;
        setSlides((prev) => {
          const next = [...prev];
          next.splice(activeIndexRef.current + 1, 0, { id: uuidv4(), ...payload } as SlideData);
          return next;
        });
        setActiveIndex(activeIndexRef.current + 1);
        return true;
      },
      dismissDraftTray: () => {
        setGeneratedTraySlides([]);
        return true;
      },
      undoEdit: () => {
        if (!historyRef.current.canUndo) return false;
        historyRef.current.undo();
        return true;
      },
      redoEdit: () => {
        if (!historyRef.current.canRedo) return false;
        historyRef.current.redo();
        return true;
      },
      runBulkAction: (id) => {
        runDeckBulkActionRef.current(id);
        return true;
      },
      findReplace: (params) => {
        const replaced = runFindReplaceRef.current(
          params.find,
          params.replace ?? '',
          { caseSensitive: params.caseSensitive, wholeWord: params.wholeWord },
        );
        return replaced;
      },
    });
    return () => slideEditorBus.disconnect();
  }, [applyImageUrlToSlide, setAccentImageForSlide]);


  // Refs the bus closures read so they always see latest state.
  const brandLockedRef = useRef(brandLocked);
  const draftSlidesRef = useRef<SlideData[]>(generatedTraySlides);
  const brandColorsRef = useRef(brandColors);
  const historyRef = useRef(history);
  const runDeckBulkActionRef = useRef(runDeckBulkAction);
  const runFindReplaceRef = useRef(runFindReplace);
  useEffect(() => { brandLockedRef.current = brandLocked; }, [brandLocked]);
  useEffect(() => { draftSlidesRef.current = generatedTraySlides; }, [generatedTraySlides]);
  useEffect(() => { brandColorsRef.current = brandColors; }, [brandColors]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { runDeckBulkActionRef.current = runDeckBulkAction; }, [runDeckBulkAction]);
  useEffect(() => { runFindReplaceRef.current = runFindReplace; }, [runFindReplace]);


  const updateDemoDeckContent = useCallback((nextOrUpdater: unknown) => {
    setSlides(prev => {
      const target = prev[activeIndex];
      if (!target?.demoContent) return prev;
      const nextContent = typeof nextOrUpdater === 'function'
        ? (nextOrUpdater as (current: SlideData['demoContent']) => SlideData['demoContent'])(target.demoContent)
        : nextOrUpdater;
      const templateId = target.demoTemplate?.id;
      const nextDemoContent = nextContent as SlideData['demoContent'];
      const imagery = nextDemoContent?.imagery ?? [];
      return prev.map(s => {
        const sameDemoDeck = s.layout === 'demo-mock' && (!templateId || s.demoTemplate?.id === templateId);
        return sameDemoDeck
          ? {
              ...s,
              demoContent: nextDemoContent,
              title: nextDemoContent?.title || s.title,
              imageUrl: imagery[0] || s.imageUrl,
              images: imagery.length > 0 ? imagery : s.images,
            }
          : s;
      });
    });
  }, [activeIndex]);

  const updateDemoDeckTemplate = useCallback((nextOrUpdater: unknown) => {
    setSlides(prev => {
      const target = prev[activeIndex];
      if (!target?.demoTemplate) return prev;
      const nextTemplate = typeof nextOrUpdater === 'function'
        ? (nextOrUpdater as (current: SlideData['demoTemplate']) => SlideData['demoTemplate'])(target.demoTemplate)
        : nextOrUpdater;
      const nextDemoTemplate = nextTemplate as SlideData['demoTemplate'];
      const templateId = target.demoTemplate?.id;
      return prev.map(s => {
        const sameDemoDeck = s.layout === 'demo-mock' && (!templateId || s.demoTemplate?.id === templateId);
        return sameDemoDeck
          ? { ...s, demoTemplate: nextDemoTemplate, bgColor: nextDemoTemplate?.palette?.bg || s.bgColor }
          : s;
      });
    });
  }, [activeIndex]);

  const handleTemplateSelected = useCallback((template: InfographicTemplate) => {
    const newSlide: SlideData = { ...template.slide, id: uuidv4() };
    setSlides(prev => {
      const next = [...prev];
      next.splice(activeIndex + 1, 0, newSlide);
      return next;
    });
    setActiveIndex(prev => prev + 1);
    toast.success(`Inserted "${template.name}"`);
  }, [activeIndex]);

  const handleImportPptx = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
    try {
      const imported = await parsePptxFile(file);
      setSlides(imported);
      setActiveIndex(0);
      toast.success(`Imported ${imported.length} slides from ${file.name}`);
    } catch (err: unknown) {
      console.error('PPTX import error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to import PPTX file');
    }
  }, []);

  // Load a deck from a BrandHub-hosted URL by fetching the bytes and parsing
  // them with the existing pptx importer. Falls back to opening the URL when
  // the file extension isn't .pptx (e.g. Google Slides links).
  const handleLoadDeckFromBrandHub = useCallback(async (file: BrandFile) => {
    const ext = file.ext.toLowerCase();
    if (ext !== 'pptx' && ext !== 'ppt') {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      toast.info(`${file.name} opened in a new tab — only .pptx files can be imported directly.`);
      return;
    }

    // Try direct → proxy → open-in-new-tab. BrandHub hosts often omit
    // Access-Control-Allow-Origin which causes the browser to throw a TypeError
    // before we ever see a status code, so we fall through to the server-side
    // proxy and finally surface a clear retry message with an "Open" action.
    const loadingToast = toast.loading(`Loading ${file.name}…`);
    const tryParse = async (blob: Blob) => {
      const fakeFile = new File([blob], file.name, {
        type: blob.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const imported = await parsePptxFile(fakeFile);
      setSlides(imported);
      setActiveIndex(0);
      toast.dismiss(loadingToast);
      toast.success(`Imported ${imported.length} slides from ${file.name}`);
      setIsAssetsLibraryOpen(false);
    };

    const fetchViaProxy = async (): Promise<Blob> => {
      const base = import.meta.env?.VITE_SUPABASE_URL;
      if (!base) throw new Error('Proxy unavailable');
      const proxyUrl = `${base}/functions/v1/proxy-brandhub-file?url=${encodeURIComponent(file.url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy returned ${res.status}`);
      return await res.blob();
    };

    const openInNewTabFallback = (reason: string) => {
      toast.dismiss(loadingToast);
      console.warn('BrandHub deck import fallback:', reason);
      toast.error(
        `Couldn't import "${file.name}" automatically — the host blocked the download (CORS). Opening it in a new tab so you can save it locally and re-import.`,
        {
          duration: 8000,
          action: {
            label: 'Open file',
            onClick: () => window.open(file.url, '_blank', 'noopener,noreferrer'),
          },
        },
      );
      // Auto-open as well so the user immediately gets the file.
      window.open(file.url, '_blank', 'noopener,noreferrer');
    };

    // 1) Direct fetch
    try {
      const res = await fetch(file.url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await tryParse(await res.blob());
      return;
    } catch (directErr) {
      console.warn('Direct BrandHub fetch failed, trying proxy:', directErr);
    }

    // 2) Server-side proxy retry
    try {
      toast.loading(`Retrying via secure proxy…`, { id: loadingToast });
      const blob = await fetchViaProxy();
      await tryParse(blob);
      return;
    } catch (proxyErr) {
      // 3) Final fallback — open in new tab with retry messaging.
      openInNewTabFallback(proxyErr instanceof Error ? proxyErr.message : 'proxy failed');
    }
  }, []);

  if (isPresentationMode) {
    return (
      <PresentationMode
        slideCount={slides.length}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onExit={() => setIsPresentationMode(false)}
        transition={slideTransition}
      >
        {(idx) => <SlideRenderer slide={slides[idx]} brandColors={brandColors} brandFonts={brandFonts} animated={animatedBackgrounds} parallaxMotion="time" />}
      </PresentationMode>
    );
  }

  const editorBody = (
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  {assetName}
                  {brandLocked && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/15 text-primary border border-primary/30">
                      BRAND LOCK
                    </span>
                  )}
                  {generatedTraySlides.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {generatedTraySlides.length} DRAFT{generatedTraySlides.length === 1 ? '' : 'S'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">{slides.length} slides</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Smart Layouts quick-insert launcher */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span className="text-xs">Insert</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2" align="end">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground px-1.5 py-1">
                    Smart layouts
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-[320px] overflow-y-auto">
                    {SLIDE_BLOCK_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        className="text-left rounded-md border bg-background hover:border-primary hover:bg-primary/5 transition p-2"
                        onClick={() => {
                          const payload = applySlideTemplate(tpl.id, {});
                          if (payload) insertSectionAfter(activeIndex, payload);
                        }}
                      >
                        <div className="text-xs font-medium">{tpl.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{tpl.description}</div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-0.5 bg-muted/60 rounded-full px-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full"
                  disabled={!history.canUndo}
                  onClick={history.undo}
                  title="Undo (⌘Z)"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full"
                  disabled={!history.canRedo}
                  onClick={history.redo}
                  title="Redo (⌘⇧Z)"
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShortcutsOpen(true)}
                title="Keyboard shortcuts (?)"
              >
                <span className="text-sm font-bold">?</span>
              </Button>

              <BrandLockBar
                brandName={brand?.name}
                brandColors={brandColors}
                locked={brandLocked}
                onToggle={setBrandLocked}
                onApplyAll={applyBrandLockToAllSlides}
              />
              <DeckBulkActionsMenu onRun={runDeckBulkAction} />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                title="Find & Replace (⌘F)"
                onClick={() => setFindOpen(true)}
              >
                <SearchIcon className="h-3.5 w-3.5" />
                Find
              </Button>
              {/* Zoom */}
              <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
                <Button
                  variant="ghost" size="icon" className="h-5 w-5 rounded-full"
                  onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i > 0) setZoom(ZOOM_LEVELS[i - 1]); }}
                  disabled={zoom === ZOOM_LEVELS[0]}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono min-w-[28px] text-center text-muted-foreground">{zoom}%</span>
                <Button
                  variant="ghost" size="icon" className="h-5 w-5 rounded-full"
                  onClick={() => { const i = ZOOM_LEVELS.indexOf(zoom); if (i < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[i + 1]); }}
                  disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full" onClick={() => setZoom(100)}>
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>

              {/* Templates */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline">
                    <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                    Templates
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">Start from a template</p>
                    {SLIDE_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.name}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          const newSlides = tpl.slides.map((s, i) => ({ ...s, id: `tpl-${Date.now()}-${i}` } as SlideData));
                          setSlides(newSlides);
                          setActiveIndex(0);
                          toast.success(`Loaded "${tpl.name}" template`);
                        }}
                      >
                        <span className="font-medium">{tpl.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{tpl.slides.length} slides</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button size="sm" variant="outline" onClick={() => setIsGalleryOpen(true)}>
                <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                Gallery
              </Button>

              <Button size="sm" variant="default" onClick={() => setIsAIGeneratorOpen(true)}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI Generate
              </Button>

              <label>
                <input type="file" accept=".pptx" className="hidden" onChange={handleImportPptx} />
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Import
                  </span>
                </Button>
              </label>

              {brand?.brandhub_share_token && (
                <Button
                  size="sm"
                  variant={brandDeckCount > 0 ? 'default' : 'outline'}
                  onClick={() => setIsAssetsLibraryOpen(true)}
                  className="gap-1.5"
                  title="Browse files attached to this brand on BrandHub"
                >
                  <Library className="h-3.5 w-3.5" />
                  Brand Assets
                  {brandDeckCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-background/20 px-1.5 text-[10px] font-medium">
                      {brandDeckCount} deck{brandDeckCount === 1 ? '' : 's'}
                    </span>
                  )}
                  {referenceFiles.length > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-primary/20 text-primary px-1.5 text-[10px] font-medium">
                      {referenceFiles.length} ref
                    </span>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await exportSlidesToPptx(slides, assetName, { transition: slideTransition });
                    toast.success(`Downloading ${slides.length} slides as .pptx`);
                  } catch (err) {
                    console.error('PPTX export error:', err);
                    toast.error(err instanceof Error ? err.message : 'Could not export deck');
                  }
                }}
                title="Download the edited deck as a PowerPoint (.pptx) file"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export to .pptx
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSaveTemplateOpen(true)}
                title="Save the current deck as a reusable template"
              >
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                Save as Template
              </Button>

              <Select value={slideTransition} onValueChange={(v) => setSlideTransition(v as SlideTransition)}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Transition</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="dissolve">Dissolve</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="flip">Flip</SelectItem>
                  <SelectItem value="cube">Cube</SelectItem>
                </SelectContent>
              </Select>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={animatedBackgrounds ? 'default' : 'outline'}
                      onClick={() => setAnimatedBackgrounds(v => !v)}
                      className="gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Animated BG
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Animate slide backgrounds (canvas + presentation only — does not affect PPTX export).</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                size="sm"
                variant={isGridView ? 'default' : 'outline'}
                onClick={() => setIsGridView(!isGridView)}
              >
                <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
                Grid
              </Button>

              <Button size="sm" variant="outline" onClick={() => setIsPresentationMode(true)}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Present
              </Button>
            </div>
          </div>

          {/* Main area */}
          <div className="flex flex-1 min-h-0">
            {/* Persistent left NavRail — icons + contextual drawer */}
            <EditorNavRail
              activeId={navRailTab}
              onChange={setNavRailTab}
              tabs={[
                {
                  id: 'slides',
                  label: thumbRailVisible ? 'Hide slide rail' : 'Show slide rail',
                  icon: Layers,
                  onClick: () => setThumbRailVisible((v) => !v),
                },
                {
                  id: 'insert',
                  label: 'Insert',
                  icon: PlusIcon,
                  content: (
                    <InsertDrawerTabs
                      onInsertSection={(payload) => insertSectionAfter(activeIndexRef.current, payload)}
                      onInsertObject={insertSmartObject}
                      mediaSlot={brand?.brandhub_share_token ? (
                        <SlideAssetSearchPanel
                          images={brandFilesByCategory.image}
                          brandName={brand?.name}
                          onOpenLibrary={() => setIsAssetsLibraryOpen(true)}
                          onUseImage={(file) => {
                            const currentImages = activeSlide.images || [];
                            updateSlide(activeIndex, {
                              images: [...currentImages, file.url],
                              imageUrl: activeSlide.imageUrl || file.url,
                            });
                            toast.success(`Added "${file.name}" to slide`);
                          }}
                          onUseAsAccent={(file) => {
                            setAccentImageForSlide(file.url, activeIndex, 'background');
                            toast.success(`Set "${file.name}" as accent image`);
                          }}
                        />
                      ) : undefined}
                    />
                  ),
                },
                {
                  id: 'layers',
                  label: 'Layers',
                  icon: LayersIcon,
                  badge: activeSlide?.textBoxes?.length,
                  content: (
                    <LayersPanel
                      slide={activeSlide ?? null}
                      onUpdate={(updates) => updateSlide(activeIndex, updates)}
                    />
                  ),
                },
                {
                  id: 'themes',
                  label: 'Themes',
                  icon: PaletteIcon,
                  content: (
                    <div className="p-3 text-xs text-muted-foreground">
                      Theme picker coming next — for now, change theme from the Design tab in the inspector.
                    </div>
                  ),
                },
                {
                  id: 'ai',
                  label: 'AI Generate',
                  icon: SparklesIcon,
                  onClick: () => setIsAIGeneratorOpen(true),
                },
                {
                  id: 'comments',
                  label: 'Comments (soon)',
                  icon: MessageSquare,
                  content: (
                    <div className="p-3 text-xs text-muted-foreground">
                      Collaborative comments are coming. For now, use slide notes.
                    </div>
                  ),
                },
              ]}
            />

            {/* Sidebar - thumbnails (hidden in grid view or when toggled off) */}
            {!isGridView && thumbRailVisible && (
            <div className="w-[220px] border-r bg-muted/30 flex flex-col shrink-0">

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {slides.map((slide, i) => (
                  <React.Fragment key={slide.id}>
                    {/* Gap drop-zone above this slide — accepts smart sections & objects */}
                    <GapDropZone
                      index={i}
                      active={dragOverIndex === i && dragPosition === 'above'}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = e.dataTransfer.types.includes(SLIDE_SECTION_MIME) ? 'copy' : 'move';
                        if (dragIndex !== null) { setDragOverIndex(i); setDragPosition('above'); }
                      }}
                      onDragLeave={() => { setDragOverIndex(null); setDragPosition(null); }}
                      onDrop={(e) => {
                        const types = e.dataTransfer.types;
                        if (types.includes(SLIDE_SECTION_MIME)) {
                          e.preventDefault();
                          try {
                            const payload = JSON.parse(e.dataTransfer.getData(SLIDE_SECTION_MIME)) as Omit<SlideData, 'id'>;
                            insertSectionAfter(i - 1, payload);
                            toast.success(`Inserted ${payload.layout} section`);
                          } catch { toast.error('Could not insert section'); }
                          return;
                        }
                        handleDrop(i)(e);
                      }}
                    />
                    <div
                      className={cn("relative group mt-2", dragIndex === i && 'opacity-50')}
                      onDragOver={handleThumbFileDragOver(i)}
                      onDragLeave={handleThumbFileDragLeave}
                      onDrop={handleThumbFileDrop(i)}
                    >
                      <SlideThumbnail
                        slideNumber={i + 1}
                        isActive={i === activeIndex}
                        onClick={() => setActiveIndex(i)}
                        dragPosition={dragOverIndex === i ? dragPosition : null}
                        onDragStart={handleDragStart(i)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver(i)}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop(i)}
                      >
                        <SlideRenderer slide={slide} brandColors={brandColors} brandFonts={brandFonts} />
                      </SlideThumbnail>
                      {/* File drop overlay on thumbnail */}
                      {thumbFileOver === i && (
                        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary bg-primary/20 z-20 flex items-center justify-center pointer-events-none">
                          <ImagePlus className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      {/* Hover actions */}
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-5 w-5 bg-background/80 hover:bg-background" onClick={() => duplicateSlide(i)}>
                          <Copy className="h-2.5 w-2.5" />
                        </Button>
                        {slides.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-5 w-5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteSlide(i)}>
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
                {/* Trailing gap drop-zone */}
                <GapDropZone
                  index={slides.length}
                  active={dragOverIndex === slides.length - 1 && dragPosition === 'below'}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = e.dataTransfer.types.includes(SLIDE_SECTION_MIME) ? 'copy' : 'move';
                    if (dragIndex !== null) { setDragOverIndex(slides.length - 1); setDragPosition('below'); }
                  }}
                  onDragLeave={() => { setDragOverIndex(null); setDragPosition(null); }}
                  onDrop={(e) => {
                    const types = e.dataTransfer.types;
                    if (types.includes(SLIDE_SECTION_MIME)) {
                      e.preventDefault();
                      try {
                        const payload = JSON.parse(e.dataTransfer.getData(SLIDE_SECTION_MIME)) as Omit<SlideData, 'id'>;
                        insertSectionAfter(slides.length - 1, payload);
                        toast.success(`Inserted ${payload.layout} section`);
                      } catch { toast.error('Could not insert section'); }
                      return;
                    }
                    handleDrop(slides.length - 1)(e);
                  }}
                  trailing
                />
              </div>
              <div className="p-3 border-t space-y-2">
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => addSlide(slides.length - 1)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Slide
                </Button>
                {corporateStyleRef && corporateStyleRef.slides.length > 0 && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-1.5 bg-gradient-to-r from-primary to-primary/80"
                    onClick={addStyledSlide}
                    disabled={isGeneratingStyledSlide}
                    title={`One-shot generate a new slide using ${corporateStyleRef.label} as the style reference`}
                  >
                    {isGeneratingStyledSlide ? (
                      <>
                        <Wand2 className="h-3.5 w-3.5 animate-pulse" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        Add slide in {corporateStyleRef.label} style
                      </>
                    )}
                  </Button>
                )}
              </div>

            </div>
            )}

            {/* Grid View */}
            {isGridView ? (
              <div className="flex-1 overflow-y-auto p-6 bg-muted/50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slides.map((slide, i) => (
                    <div
                      key={slide.id}
                      className={cn(
                        "group relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg",
                        i === activeIndex
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50",
                        thumbFileOver === i && "border-primary ring-2 ring-primary/30"
                      )}
                      draggable
                      onDragStart={handleDragStart(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => { handleDragOver(i)(e); handleThumbFileDragOver(i)(e); }}
                      onDragLeave={(e) => { handleDragLeave(); handleThumbFileDragLeave(e); }}
                      onDrop={(e) => { handleDrop(i)(e); handleThumbFileDrop(i)(e); }}
                      onClick={() => {
                        setActiveIndex(i);
                        setIsGridView(false);
                      }}
                    >
                      <div className="aspect-video bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="origin-top-left pointer-events-none" style={{ transform: 'scale(0.167)', width: '600%', height: '600%' }}>
                          <SlideRenderer slide={slide} brandColors={brandColors} brandFonts={brandFonts} />
                        </div>
                      </div>
                      {/* File drop overlay on grid card */}
                      {thumbFileOver === i && (
                        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary z-20 flex items-center justify-center pointer-events-none">
                          <ImagePlus className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      {/* Slide number badge */}
                      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground text-xs font-mono px-1.5 py-0.5 rounded">
                        {i + 1}
                      </div>
                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 bg-background/90 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); duplicateSlide(i); }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {slides.length > 1 && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                            onClick={(e) => { e.stopPropagation(); deleteSlide(i); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {/* Title label */}
                      <div className="px-2 py-1.5 bg-card border-t">
                        <p className="text-xs font-medium truncate">{slide.title || 'Untitled'}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{slide.layout}</p>
                      </div>
                    </div>
                  ))}
                  {/* Add slide card */}
                  <button
                    className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    onClick={() => addSlide(slides.length - 1)}
                  >
                    <Plus className="h-8 w-8" />
                    <span className="text-xs font-medium">Add Slide</span>
                  </button>
                </div>
              </div>
            ) : (
            <>
            {/* Canvas */}
            <div className={cn("flex-1 flex flex-col min-w-0", isDarkCanvas ? 'bg-slate-900' : 'bg-muted/50')}>
              {/* Slide canvas — drop zone for files */}
              <div
                className="flex-1 p-8 min-h-0 relative"
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
              >
                <CenteredScaledSlide zoom={zoom}>
                  <InlineEditOverlay
                    slide={activeSlide}
                    onUpdate={(updates) => updateSlide(activeIndex, updates)}
                    enabled={activeSlide.layout !== 'parallax'}
                  >
                    <SlideRenderer
                      slide={activeSlide}
                      brandColors={brandColors}
                      brandFonts={brandFonts}
                      animated={animatedBackgrounds}
                      editable={activeSlide.layout === 'demo-mock'}
                      onDemoContentChange={updateDemoDeckContent}
                    />
                    <AccentImageLayer slide={activeSlide} />
                  </InlineEditOverlay>
                </CenteredScaledSlide>

                {/* Drop overlay */}
                {canvasFileOver && (
                  <div className="absolute inset-4 rounded-xl border-2 border-dashed border-primary bg-primary/10 z-50 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <ImagePlus className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-primary font-semibold text-sm">Drop to add to this slide</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Images · PPTX files</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation pills */}
              <div className="flex items-center justify-center gap-2 pb-4">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-medium min-w-[50px] text-center">
                  {activeIndex + 1} / {slides.length}
                </span>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                  onClick={() => setActiveIndex(Math.min(slides.length - 1, activeIndex + 1))}
                  disabled={activeIndex === slides.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Properties panel */}
            <div className="w-[300px] border-l bg-card overflow-y-auto shrink-0 h-full min-h-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <div className="p-4 pb-12 space-y-5">
                <h3 className="font-semibold text-sm">Slide Properties</h3>

                {activeSlide.layout === 'demo-mock' && activeSlide.demoContent && activeSlide.demoTemplate && (
                  <DemoSlidePropertyEditor
                    slide={activeSlide}
                    onContentChange={updateDemoDeckContent}
                    onTemplateChange={updateDemoDeckTemplate}
                    onSlideChange={(patch) => updateSlide(activeIndex, patch)}
                  />
                )}

                {activeSlide.layout !== 'demo-mock' && (
                <>

                {/* Layout selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Layout</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <TooltipProvider key={value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all",
                                activeSlide.layout === value
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50 text-muted-foreground"
                              )}
                              onClick={() => {
                                if (value === 'parallax' && (!activeSlide.parallaxLayers || activeSlide.parallaxLayers.length === 0)) {
                                  import('./slideTypes').then(({ DEFAULT_PARALLAX_LAYERS }) => {
                                    updateSlide(activeIndex, { layout: value, parallaxLayers: DEFAULT_PARALLAX_LAYERS.map(l => ({ ...l, id: `${l.id}-${Date.now()}` })), parallaxIntensity: 1 });
                                  });
                                } else {
                                  updateSlide(activeIndex, { layout: value });
                                }
                              }}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{label}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                {/* Theme variant */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Theme</label>
                  <Select value={activeSlide.variant} onValueChange={(v) => updateSlide(activeIndex, { variant: v as SlideData['variant'] })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Layout style — only when the active layout has alternate variations */}
                {LAYOUT_VARIATIONS[activeSlide.layout] && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Layout Style</label>
                    <div className="grid grid-cols-2 gap-1">
                      {LAYOUT_VARIATIONS[activeSlide.layout]!.map(({ value, label }) => {
                        const isFirst = LAYOUT_VARIATIONS[activeSlide.layout]![0].value === value;
                        const isActive = (activeSlide.variation || (isFirst ? value : '')) === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateSlide(activeIndex, { variation: isFirst ? undefined : value })}
                            className={cn(
                              'text-[11px] px-2 py-1.5 rounded border transition-colors',
                              isActive
                                ? 'bg-primary/10 border-primary/40 text-foreground font-medium'
                                : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Background color override */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Palette className="h-3 w-3" />
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeSlide.bgColor || '#ffffff'}
                      onChange={(e) => updateSlide(activeIndex, { bgColor: e.target.value })}
                      className="h-8 w-8 rounded border border-border cursor-pointer"
                    />
                    <Input
                      className="h-8 text-xs font-mono flex-1"
                      value={activeSlide.bgColor || ''}
                      onChange={(e) => updateSlide(activeIndex, { bgColor: e.target.value || undefined })}
                      placeholder="Auto (from theme)"
                    />
                    {activeSlide.bgColor && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateSlide(activeIndex, { bgColor: undefined })}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Background effect */}
                <BgEffectEditor slide={activeSlide} onUpdate={(updates) => updateSlide(activeIndex, updates)} />

                {/* Parallax depth layers — only for parallax slides */}
                {activeSlide.layout === 'parallax' && (
                  <ParallaxLayerEditor slide={activeSlide} onChange={(updates) => updateSlide(activeIndex, updates)} />
                )}
                {/* Text alignment */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Text Alignment</label>
                  <div className="flex gap-1">
                    {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([val, Icon]) => (
                      <Button
                        key={val}
                        variant={(activeSlide.textAlign || 'left') === val ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 flex-1"
                        onClick={() => updateSlide(activeIndex, { textAlign: val })}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Font size controls */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Heading Size</label>
                    <Select
                      value={String(activeSlide.headingSize || 0)}
                      onValueChange={(v) => updateSlide(activeIndex, { headingSize: Number(v) || undefined })}
                    >
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Auto" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Auto</SelectItem>
                        <SelectItem value="48">Small (48)</SelectItem>
                        <SelectItem value="64">Medium (64)</SelectItem>
                        <SelectItem value="80">Large (80)</SelectItem>
                        <SelectItem value="96">XL (96)</SelectItem>
                        <SelectItem value="120">XXL (120)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Body Size</label>
                    <Select
                      value={String(activeSlide.bodySize || 0)}
                      onValueChange={(v) => updateSlide(activeIndex, { bodySize: Number(v) || undefined })}
                    >
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Auto" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Auto</SelectItem>
                        <SelectItem value="24">Small (24)</SelectItem>
                        <SelectItem value="32">Medium (32)</SelectItem>
                        <SelectItem value="40">Large (40)</SelectItem>
                        <SelectItem value="48">XL (48)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    className="h-8 text-sm"
                    value={activeSlide.title}
                    onChange={(e) => updateSlide(activeIndex, { title: e.target.value })}
                  />
                </div>

                {/* Subtitle - for title/section layouts */}
                {(activeSlide.layout === 'title' || activeSlide.layout === 'section') && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                    <Input
                      className="h-8 text-sm"
                      value={activeSlide.subtitle || ''}
                      onChange={(e) => updateSlide(activeIndex, { subtitle: e.target.value })}
                    />
                  </div>
                )}

                {/* Body text */}
                {activeSlide.layout !== 'title' && activeSlide.layout !== 'section' && activeSlide.layout !== 'blank' && activeSlide.layout !== 'quote' && activeSlide.layout !== 'stats' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {(activeSlide.layout === 'two-column' || activeSlide.layout === 'comparison') ? 'Body Text (use --- to split columns)' : 'Body Text'}
                    </label>
                    <Textarea
                      className="text-sm min-h-[120px]"
                      value={activeSlide.body || ''}
                      onChange={(e) => updateSlide(activeIndex, { body: e.target.value })}
                      placeholder={
                        (activeSlide.layout === 'two-column' || activeSlide.layout === 'comparison')
                          ? "Left column text\n---\nRight column text"
                          : "Enter content... Use new lines for bullet points"
                      }
                    />
                  </div>
                )}

                {/* Quote author */}
                {activeSlide.layout === 'quote' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Attribution</label>
                    <Input
                      className="h-8 text-sm"
                      value={activeSlide.quoteAuthor || ''}
                      onChange={(e) => updateSlide(activeIndex, { quoteAuthor: e.target.value })}
                      placeholder="Quote author name"
                    />
                  </div>
                )}

                {/* Stats entries */}
                {activeSlide.layout === 'stats' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Statistics</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          const current = activeSlide.stats || [];
                          if (current.length >= 5) return;
                          updateSlide(activeIndex, { stats: [...current, { value: '0', label: 'Label' }] });
                        }}
                        disabled={(activeSlide.stats || []).length >= 5}
                      >
                        <Plus className="h-3 w-3 mr-0.5" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {!(activeSlide.stats?.length) && (
                        <p className="text-xs text-muted-foreground text-center py-2">No stats yet — click Add above.</p>
                      )}
                      {(activeSlide.stats || []).map((stat, si) => (
                        <div key={si} className="flex gap-1.5 items-center">
                          <Input
                            className="h-7 text-xs font-bold flex-1"
                            value={stat.value}
                            onChange={(e) => {
                              const updated = [...(activeSlide.stats || [])];
                              updated[si] = { ...updated[si], value: e.target.value };
                              updateSlide(activeIndex, { stats: updated });
                            }}
                            placeholder="Value"
                          />
                          <Input
                            className="h-7 text-xs flex-1"
                            value={stat.label}
                            onChange={(e) => {
                              const updated = [...(activeSlide.stats || [])];
                              updated[si] = { ...updated[si], label: e.target.value };
                              updateSlide(activeIndex, { stats: updated });
                            }}
                            placeholder="Label"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              const updated = (activeSlide.stats || []).filter((_, i) => i !== si);
                              updateSlide(activeIndex, { stats: updated.length > 0 ? updated : undefined });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline steps */}
                {activeSlide.layout === 'timeline' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Timeline Steps</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          const current = activeSlide.timeline || [];
                          if (current.length >= 8) return;
                          updateSlide(activeIndex, { timeline: [...current, { title: 'Event' }] });
                        }}
                        disabled={(activeSlide.timeline || []).length >= 8}
                      >
                        <Plus className="h-3 w-3 mr-0.5" /> Add
                      </Button>
                    </div>
                    {!(activeSlide.timeline?.length) && (
                      <p className="text-xs text-muted-foreground text-center py-2">No steps yet — click Add above.</p>
                    )}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {(activeSlide.timeline || []).map((step, si) => (
                        <div key={si} className="space-y-1 rounded-md border border-border p-2 bg-muted/30">
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-6 text-xs w-14 font-mono shrink-0"
                              value={step.date || ''}
                              onChange={(e) => {
                                const updated = [...(activeSlide.timeline || [])];
                                updated[si] = { ...updated[si], date: e.target.value || undefined };
                                updateSlide(activeIndex, { timeline: updated });
                              }}
                              placeholder="Date"
                            />
                            <Input
                              className="h-6 text-xs flex-1"
                              value={step.title}
                              onChange={(e) => {
                                const updated = [...(activeSlide.timeline || [])];
                                updated[si] = { ...updated[si], title: e.target.value };
                                updateSlide(activeIndex, { timeline: updated });
                              }}
                              placeholder="Title"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => {
                                const updated = (activeSlide.timeline || []).filter((_, i) => i !== si);
                                updateSlide(activeIndex, { timeline: updated.length > 0 ? updated : undefined });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            className="h-6 text-xs"
                            value={step.description || ''}
                            onChange={(e) => {
                              const updated = [...(activeSlide.timeline || [])];
                              updated[si] = { ...updated[si], description: e.target.value || undefined };
                              updateSlide(activeIndex, { timeline: updated });
                            }}
                            placeholder="Description (optional)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process steps */}
                {activeSlide.layout === 'process' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Process Steps</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => {
                          const current = activeSlide.process || [];
                          if (current.length >= 5) return;
                          updateSlide(activeIndex, { process: [...current, { title: 'Step' }] });
                        }}
                        disabled={(activeSlide.process || []).length >= 5}
                      >
                        <Plus className="h-3 w-3 mr-0.5" /> Add
                      </Button>
                    </div>
                    {!(activeSlide.process?.length) && (
                      <p className="text-xs text-muted-foreground text-center py-2">No steps yet — click Add above.</p>
                    )}
                    <div className="space-y-2">
                      {(activeSlide.process || []).map((step, si) => (
                        <div key={si} className="space-y-1 rounded-md border border-border p-2 bg-muted/30">
                          <div className="flex items-center gap-1.5">
                            <div className="shrink-0 h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary">{si + 1}</span>
                            </div>
                            <Input
                              className="h-6 text-xs flex-1"
                              value={step.title}
                              onChange={(e) => {
                                const updated = [...(activeSlide.process || [])];
                                updated[si] = { ...updated[si], title: e.target.value };
                                updateSlide(activeIndex, { process: updated });
                              }}
                              placeholder="Step title"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => {
                                const updated = (activeSlide.process || []).filter((_, i) => i !== si);
                                updateSlide(activeIndex, { process: updated.length > 0 ? updated : undefined });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            className="h-6 text-xs"
                            value={step.description || ''}
                            onChange={(e) => {
                              const updated = [...(activeSlide.process || [])];
                              updated[si] = { ...updated[si], description: e.target.value || undefined };
                              updateSlide(activeIndex, { process: updated });
                            }}
                            placeholder="Description (optional)"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSlide.layout === 'big-number' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Hero Metric</label>
                    <div className="space-y-2">
                      <Input
                        className="h-7 text-xs"
                        value={activeSlide.stats?.[0]?.value || ''}
                        onChange={(e) => {
                          const current = activeSlide.stats?.[0] || { value: '', label: '' };
                          updateSlide(activeIndex, { stats: [{ ...current, value: e.target.value }] });
                        }}
                        placeholder="Value (e.g. 3.4×, $20M, 62%)"
                      />
                      <Input
                        className="h-7 text-xs"
                        value={activeSlide.stats?.[0]?.label || ''}
                        onChange={(e) => {
                          const current = activeSlide.stats?.[0] || { value: '', label: '' };
                          updateSlide(activeIndex, { stats: [{ ...current, label: e.target.value }] });
                        }}
                        placeholder="Label / descriptor"
                      />
                    </div>
                  </div>
                )}

                {/* Smart Layouts moved to the left NavRail → Insert drawer */}

                {/* Accent image — Gamma-style overlay (background / top / left / right) */}
                <AccentImagePanel
                  slide={activeSlide}
                  onChange={(accent) => updateSlide(activeIndex, { accentImage: accent })}
                />

                {/* BrandHub asset rail — search images for active brand and add to slide */}
                {brand?.brandhub_share_token && (
                  <SlideAssetSearchPanel
                    images={brandFilesByCategory.image}
                    brandName={brand?.name}
                    onOpenLibrary={() => setIsAssetsLibraryOpen(true)}
                    onUseImage={(file) => {
                      const currentImages = activeSlide.images || [];
                      updateSlide(activeIndex, {
                        images: [...currentImages, file.url],
                        imageUrl: activeSlide.imageUrl || file.url,
                      });
                      toast.success(`Added "${file.name}" to slide`);
                    }}
                    onUseAsAccent={(file) => {
                      setAccentImageForSlide(file.url, activeIndex, 'background');
                      toast.success(`Set "${file.name}" as accent image`);
                    }}
                  />
                )}

                {/* Slide Images */}
                {(activeSlide.images && activeSlide.images.length > 0) || activeSlide.imageUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Images</label>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = '';
                            const reader = new FileReader();
                            reader.onload = () => {
                              const dataUrl = reader.result as string;
                              const currentImages = activeSlide.images || [];
                              updateSlide(activeIndex, {
                                images: [...currentImages, dataUrl],
                                imageUrl: activeSlide.imageUrl || dataUrl,
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" asChild>
                          <span><ImagePlus className="h-3 w-3" /> Add</span>
                        </Button>
                      </label>
                    </div>
                    <div className="space-y-2 max-h-[240px] overflow-y-auto">
                      {(activeSlide.images || (activeSlide.imageUrl ? [activeSlide.imageUrl] : [])).map((imgSrc, imgIdx) => (
                        <div key={imgIdx} className="relative group rounded-md border overflow-hidden bg-muted/50">
                          <img src={imgSrc} alt={`Slide image ${imgIdx + 1}`} className="w-full h-20 object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  e.target.value = '';
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const dataUrl = reader.result as string;
                                    const imgs = [...(activeSlide.images || [])];
                                    imgs[imgIdx] = dataUrl;
                                    updateSlide(activeIndex, {
                                      images: imgs,
                                      imageUrl: imgIdx === 0 ? dataUrl : activeSlide.imageUrl,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <Button size="sm" variant="secondary" className="h-7 px-2 text-xs gap-1" asChild>
                                <span><Replace className="h-3 w-3" /> Replace</span>
                              </Button>
                            </label>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => {
                                const imgs = (activeSlide.images || []).filter((_, i) => i !== imgIdx);
                                updateSlide(activeIndex, {
                                  images: imgs.length > 0 ? imgs : undefined,
                                  imageUrl: imgs.length > 0 ? imgs[0] : undefined,
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Images</label>
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          e.target.value = '';
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result as string;
                            updateSlide(activeIndex, {
                              images: [dataUrl],
                              imageUrl: dataUrl,
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" asChild>
                        <span><ImagePlus className="h-3.5 w-3.5" /> Add Image</span>
                      </Button>
                    </label>
                  </div>
                )}

                </>
                )}

                {/* Speaker notes */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Speaker Notes</label>
                  <Textarea
                    className="text-sm min-h-[80px]"
                    value={activeSlide.notes || ''}
                    onChange={(e) => updateSlide(activeIndex, { notes: e.target.value })}
                    placeholder="Notes for the presenter..."
                  />
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
  );

  return (
    <>
    {inline ? (
      isOpen ? (
        <div className="fixed inset-0 z-40 bg-background flex">
          {sidebar ? (
            <aside className="w-[380px] shrink-0 border-r bg-card/40 flex flex-col overflow-hidden">
              {sidebar}
            </aside>
          ) : null}
          <div className="flex-1 min-w-0 h-full">
            {editorBody}
          </div>
        </div>
      ) : null
    ) : (
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent
          className="max-w-[100vw] w-[100vw] h-[100vh] p-0 overflow-hidden rounded-none border-none"
          hideClose
          onInteractOutside={(e) => e.preventDefault()}
        >
          {editorBody}
        </DialogContent>
      </Dialog>
    )}

    {/* AI draft tray — floats over canvas when a generation just completed. */}
    {isOpen && generatedTraySlides.length > 0 && (
      <GeneratedSlidesTray
        slides={generatedTraySlides}
        brandColors={brandColors}
        brandFonts={brandFonts}
        onInsert={(payload) => insertSectionAfter(activeIndex, payload)}
        onDismiss={() => setGeneratedTraySlides([])}
      />
    )}

    <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

    <FindReplaceDialog
      open={findOpen}
      onClose={() => setFindOpen(false)}
      slides={slides}
      onJumpTo={(idx) => setActiveIndex(idx)}
      onReplaceAll={(next, replacedCount, affectedSlides) => {
        setSlides(next);
        toast.success(
          replacedCount > 0
            ? `Replaced ${replacedCount} occurrence${replacedCount === 1 ? '' : 's'} across ${affectedSlides} slide${affectedSlides === 1 ? '' : 's'}`
            : 'No replacements made',
        );
      }}
    />



    <AISlideGenerator
      isOpen={isAIGeneratorOpen}
      onClose={() => setIsAIGeneratorOpen(false)}
      onSlidesGenerated={handleAISlidesGenerated}
      brandName={brand?.name}
      brandId={brand?.id}
      brandImagery={brandImagery}
      referenceFiles={referenceFiles}
    />

    <BrandAssetsLibrary
      isOpen={isAssetsLibraryOpen}
      onClose={() => setIsAssetsLibraryOpen(false)}
      brandName={brand?.name || 'Brand'}
      shareToken={brand?.brandhub_share_token ?? null}
      onLoadDeck={handleLoadDeckFromBrandHub}
      onReferenceSelectionChange={setReferenceFiles}
      initialReferences={referenceFiles}
    />

    <TemplateGalleryDialog
      isOpen={isGalleryOpen}
      onClose={() => setIsGalleryOpen(false)}
      onSelect={handleTemplateSelected}
      brandColors={brandColors}
      brandFonts={brandFonts}
    />

    <SaveAsTemplateDialog
      open={saveTemplateOpen}
      onOpenChange={setSaveTemplateOpen}
      defaults={{
        source_kind: 'deck',
        name: assetName ? `${assetName} template` : 'My deck template',
        description: null,
        palette: {
          bg: brandColors?.primary || '#0F172A',
          text: '#FFFFFF',
          accent: brandColors?.accent || '#3B82F6',
          secondary: brandColors?.secondary || '#64748B',
        },
        content: { slides, slideTransition },
      }}
    />

    {/* Confirmation preview for AI-generated styled slide */}
    <Dialog
      open={!!pendingStyledSlide}
      onOpenChange={(open) => { if (!open) setPendingStyledSlide(null); }}
    >
      <DialogContent className="max-w-5xl w-[90vw] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Preview new {corporateStyleRef?.label ?? ''} slide
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review before inserting after slide {activeIndex + 1}
            </p>
          </div>
        </div>
        <div className="bg-black/40 p-4">
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            {pendingStyledSlide && (
              <CenteredScaledSlide>
                <SlideRenderer
                  slide={pendingStyledSlide}
                  brandColors={brandColors}
                  brandFonts={brandFonts}
                />
              </CenteredScaledSlide>
            )}
          </div>
          {pendingStyledSlide?.notes && (
            <div className="mt-3 text-xs text-muted-foreground bg-background/60 rounded-md p-3 border">
              <span className="font-semibold text-foreground">Speaker notes: </span>
              {pendingStyledSlide.notes}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPendingStyledSlide(null)}
            disabled={isGeneratingStyledSlide}
          >
            Discard
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setPendingStyledSlide(null); generateStyledSlide(); }}
              disabled={isGeneratingStyledSlide}
              className="gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5" />
              {isGeneratingStyledSlide ? 'Regenerating…' : 'Regenerate'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={confirmInsertPendingSlide}
              disabled={isGeneratingStyledSlide}
            >
              Insert into deck
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

// ── Background effect editor ───────────────────────────────────────────────
const EFFECT_LABELS: { value: SlideBgEffectType; label: string }[] = [
  { value: 'none',      label: 'None' },
  { value: 'orbs',      label: 'Orbs' },
  { value: 'particles', label: 'Particles' },
  { value: 'mesh',      label: 'Mesh' },
  { value: 'grid',      label: 'Grid Pulse' },
  { value: 'waves',     label: 'Waves' },
  { value: 'grain',     label: 'Film Grain' },
  { value: 'beam',      label: 'Light Beam' },
];

const PRESET_NAMES: SlideBgEffectPresetName[] = ['calm', 'subtle', 'active', 'dramatic'];

function BgEffectEditor({ slide, onUpdate }: { slide: SlideData; onUpdate: (updates: Partial<SlideData>) => void }) {
  const effect = slide.bgEffect ?? { type: 'none' as const };
  const isOn = effect.type !== 'none';

  const setEffect = (patch: Partial<SlideBgEffect>) => {
    onUpdate({ bgEffect: { ...effect, ...patch } });
  };

  const applyPreset = (name: SlideBgEffectPresetName) => {
    if (effect.type === 'none') return;
    const preset = BG_EFFECT_PRESETS[effect.type][name];
    onUpdate({ bgEffect: { type: effect.type, color: effect.color, ...preset } });
  };

  const changeType = (next: SlideBgEffectType) => {
    if (next === 'none') {
      onUpdate({ bgEffect: undefined });
      return;
    }
    const preset = BG_EFFECT_PRESETS[next].subtle;
    onUpdate({ bgEffect: { type: next, color: effect.color, ...preset } });
  };

  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/20 p-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Background Effect
        </label>
        {isOn && effect.color && (
          <button
            type="button"
            onClick={() => setEffect({ color: undefined })}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            reset color
          </button>
        )}
      </div>

      <Select value={effect.type} onValueChange={(v) => changeType(v as SlideBgEffectType)}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EFFECT_LABELS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isOn && (
        <>
          <div className="grid grid-cols-4 gap-1">
            {PRESET_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => applyPreset(name)}
                className="text-[10px] px-1.5 py-1 rounded border border-border bg-background hover:bg-primary/10 hover:border-primary/40 capitalize"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Speed</span>
              <span className="font-mono">{(effect.speed ?? 1).toFixed(1)}×</span>
            </div>
            <Slider
              value={[effect.speed ?? 1]}
              min={0.3} max={3} step={0.1}
              onValueChange={([v]) => setEffect({ speed: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Intensity</span>
              <span className="font-mono">{Math.round((effect.intensity ?? 0.6) * 100)}%</span>
            </div>
            <Slider
              value={[effect.intensity ?? 0.6]}
              min={0.05} max={1} step={0.05}
              onValueChange={([v]) => setEffect({ intensity: v })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Color</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={effect.color || '#6366f1'}
                onChange={(e) => setEffect({ color: e.target.value })}
                className="h-7 w-7 rounded border border-border cursor-pointer"
              />
              <Input
                className="h-7 text-[10px] font-mono flex-1"
                value={effect.color || ''}
                onChange={(e) => setEffect({ color: e.target.value || undefined })}
                placeholder="Auto (brand accent)"
              />
            </div>
          </div>

          {effect.type === 'orbs' && (
            <>
              <ParamSlider label="Count" value={effect.count ?? 3} min={2} max={6} step={1} unit="" onChange={(v) => setEffect({ count: v })} />
              <ParamSlider label="Size" value={effect.size ?? 50} min={20} max={100} step={5} unit="%" onChange={(v) => setEffect({ size: v })} />
              <ParamSlider label="Blur" value={effect.blur ?? 80} min={20} max={150} step={5} unit="px" onChange={(v) => setEffect({ blur: v })} />
            </>
          )}

          {effect.type === 'particles' && (
            <>
              <ParamSlider label="Count" value={effect.count ?? 30} min={5} max={80} step={1} unit="" onChange={(v) => setEffect({ count: v })} />
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Direction</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['up', 'down', 'float'] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setEffect({ direction: dir })}
                      className={cn(
                        'text-[10px] px-1.5 py-1 rounded border capitalize',
                        (effect.direction || 'up') === dir
                          ? 'bg-primary/10 border-primary/40 text-foreground'
                          : 'bg-background border-border text-muted-foreground',
                      )}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {effect.type === 'mesh' && (
            <>
              <ParamSlider label="Blur" value={effect.blur ?? 60} min={20} max={120} step={5} unit="px" onChange={(v) => setEffect({ blur: v })} />
              <ParamSlider label="Hue Shift" value={effect.hueRotate ?? 60} min={0} max={360} step={15} unit="°" onChange={(v) => setEffect({ hueRotate: v })} />
            </>
          )}

          {effect.type === 'grid' && (
            <>
              <ParamSlider label="Spacing" value={effect.spacing ?? 50} min={20} max={100} step={5} unit="px" onChange={(v) => setEffect({ spacing: v })} />
              <ParamSlider label="Dot Size" value={effect.dotSize ?? 2} min={1} max={5} step={0.5} unit="px" onChange={(v) => setEffect({ dotSize: v })} />
              <ParamSlider label="Pulse Depth" value={effect.pulseDepth ?? 0.5} min={0.1} max={1} step={0.05} unit="" fractionDigits={2} onChange={(v) => setEffect({ pulseDepth: v })} />
            </>
          )}

          {effect.type === 'waves' && (
            <>
              <ParamSlider label="Amplitude" value={effect.amplitude ?? 30} min={10} max={80} step={5} unit="" onChange={(v) => setEffect({ amplitude: v })} />
              <ParamSlider label="Layers" value={effect.layers ?? 2} min={1} max={4} step={1} unit="" onChange={(v) => setEffect({ layers: v })} />
            </>
          )}

          {effect.type === 'grain' && (
            <ParamSlider label="Density" value={effect.density ?? 0.6} min={0.1} max={1} step={0.05} unit="" fractionDigits={2} onChange={(v) => setEffect({ density: v })} />
          )}

          {effect.type === 'beam' && (
            <>
              <ParamSlider label="Angle" value={effect.angle ?? 30} min={-60} max={60} step={5} unit="°" onChange={(v) => setEffect({ angle: v })} />
              <ParamSlider label="Width" value={effect.width ?? 200} min={60} max={400} step={10} unit="px" onChange={(v) => setEffect({ width: v })} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function ParamSlider({ label, value, min, max, step, unit, fractionDigits = 0, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  fractionDigits?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(fractionDigits)}{unit}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

/**
 * Thin drop-zone strip rendered between slide thumbnails. Shows a glowing
 * insertion bar when something is being dragged over it — used so users can
 * drop sections from the Insert drawer into specific positions in the deck,
 * not just onto existing thumbnails.
 */
function GapDropZone({
  index, active, onDragOver, onDragLeave, onDrop, trailing,
}: {
  index: number;
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  trailing?: boolean;
}) {
  return (
    <div
      data-gap-index={index}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative w-full transition-all",
        active ? "h-4" : trailing ? "h-6" : "h-2",
      )}
    >
      <div
        className={cn(
          "absolute left-2 right-2 top-1/2 -translate-y-1/2 rounded-full transition-all",
          active ? "h-1 bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]" : "h-px bg-transparent",
        )}
      />
    </div>
  );
}

export default SlideEditor;
