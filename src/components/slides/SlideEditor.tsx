import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Copy, ChevronLeft, ChevronRight, Play,
  Type, Layout, Image, Columns, SplitSquareHorizontal, Square,
  ZoomIn, ZoomOut, Maximize, Monitor, ChevronDown, Sparkles, Download, Upload,
  Replace, ImagePlus, Quote, BarChart3, Maximize2, GitCompare,
  AlignLeft, AlignCenter, AlignRight, Palette, LayoutTemplate, Grid3X3
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
import { SlideData, DEFAULT_SLIDES, SLIDE_TEMPLATES } from './slideTypes';
import { SlideRenderer } from './SlideRenderer';
import { SlideThumbnail } from './SlideThumbnail';
import { CenteredScaledSlide } from './ScaledSlide';
import { PresentationMode, SlideTransition } from './PresentationMode';
import { FloatingMenu } from './FloatingMenu';
import { v4 as uuidv4 } from 'uuid';
import { AISlideGenerator } from './AISlideGenerator';
import { exportSlidesToPptx } from './exportPptx';
import { parsePptxFile } from './importPptx';
import { toast } from 'sonner';

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
  { value: 'section', label: 'Section Break', icon: Square },
  { value: 'blank', label: 'Blank', icon: Square },
];

interface SlideEditorProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
  assetName: string;
  brand: Brand | null;
}

export function SlideEditor({ isOpen, onClose, assetType, assetName, brand }: SlideEditorProps) {
  const [slides, setSlides] = useState<SlideData[]>(() => [...DEFAULT_SLIDES]);
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

  const handleAISlidesGenerated = useCallback((newSlides: SlideData[]) => {
    setSlides(newSlides);
    setActiveIndex(0);
  }, []);

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
    } catch (err: any) {
      console.error('PPTX import error:', err);
      toast.error(err.message || 'Failed to import PPTX file');
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
        {(idx) => <SlideRenderer slide={slides[idx]} brandColors={brandColors} brandFonts={brandFonts} animated={animatedBackgrounds} />}
      </PresentationMode>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-[100vw] w-[100vw] h-[100vh] p-0 overflow-hidden rounded-none border-none"
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-sm font-semibold">{assetName}</h2>
                <p className="text-xs text-muted-foreground">{slides.length} slides</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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

              <Button size="sm" variant="outline" onClick={() => exportSlidesToPptx(slides, assetName, { transition: slideTransition })}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
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
            {/* Sidebar - thumbnails (hidden in grid view) */}
            {!isGridView && (
            <div className="w-[220px] border-r bg-muted/30 flex flex-col shrink-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {slides.map((slide, i) => (
                  <div key={slide.id} className={cn("relative group", dragIndex === i && 'opacity-50')}>
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
                ))}
              </div>
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => addSlide(slides.length - 1)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Slide
                </Button>
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
                          : "border-border hover:border-primary/50"
                      )}
                      draggable
                      onDragStart={handleDragStart(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver(i)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop(i)}
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
              {/* Slide canvas */}
              <div className="flex-1 p-8 min-h-0">
                <CenteredScaledSlide zoom={zoom}>
                  <SlideRenderer slide={activeSlide} brandColors={brandColors} brandFonts={brandFonts} animated={animatedBackgrounds} />
                </CenteredScaledSlide>
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
                              onClick={() => updateSlide(activeIndex, { layout: value })}
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
      </DialogContent>
    </Dialog>

    <AISlideGenerator
      isOpen={isAIGeneratorOpen}
      onClose={() => setIsAIGeneratorOpen(false)}
      onSlidesGenerated={handleAISlidesGenerated}
      brandName={brand?.name}
      brandId={brand?.id}
      brandImagery={brandImagery}
    />
    </>
  );
}

export default SlideEditor;
