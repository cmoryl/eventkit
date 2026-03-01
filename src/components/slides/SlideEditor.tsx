import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, Copy, ChevronLeft, ChevronRight, Play,
  Type, Layout, Image, Columns, SplitSquareHorizontal, Square,
  ZoomIn, ZoomOut, Maximize, Monitor, ChevronDown, Sparkles
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Brand } from '@/types/studio.types';
import { SlideData, DEFAULT_SLIDES } from './slideTypes';
import { SlideRenderer } from './SlideRenderer';
import { SlideThumbnail } from './SlideThumbnail';
import { CenteredScaledSlide } from './ScaledSlide';
import { PresentationMode } from './PresentationMode';
import { FloatingMenu } from './FloatingMenu';
import { v4 as uuidv4 } from 'uuid';
import { AISlideGenerator } from './AISlideGenerator';

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

const LAYOUT_OPTIONS: { value: SlideData['layout']; label: string; icon: React.ElementType }[] = [
  { value: 'title', label: 'Title Slide', icon: Type },
  { value: 'content', label: 'Content', icon: Layout },
  { value: 'image-left', label: 'Image Left', icon: SplitSquareHorizontal },
  { value: 'image-right', label: 'Image Right', icon: Columns },
  { value: 'two-column', label: 'Two Column', icon: Columns },
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

  if (isPresentationMode) {
    return (
      <PresentationMode
        slideCount={slides.length}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onExit={() => setIsPresentationMode(false)}
      >
        {(idx) => <SlideRenderer slide={slides[idx]} brandColors={brandColors} brandFonts={brandFonts} />}
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

              <Button size="sm" variant="default" onClick={() => setIsAIGeneratorOpen(true)}>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                AI Generate
              </Button>

              <Button size="sm" variant="outline" onClick={() => setIsPresentationMode(true)}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Present
              </Button>
            </div>
          </div>

          {/* Main area */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar - thumbnails */}
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

            {/* Canvas */}
            <div className={cn("flex-1 flex flex-col min-w-0", isDarkCanvas ? 'bg-slate-900' : 'bg-muted/50')}>
              {/* Slide canvas */}
              <div className="flex-1 p-8 min-h-0">
                <CenteredScaledSlide zoom={zoom}>
                  <SlideRenderer slide={activeSlide} brandColors={brandColors} brandFonts={brandFonts} />
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
            <div className="w-[300px] border-l bg-card overflow-y-auto shrink-0">
              <div className="p-4 space-y-5">
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
                    </SelectContent>
                  </Select>
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
                {activeSlide.layout !== 'title' && activeSlide.layout !== 'section' && activeSlide.layout !== 'blank' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Body Text</label>
                    <Textarea
                      className="text-sm min-h-[120px]"
                      value={activeSlide.body || ''}
                      onChange={(e) => updateSlide(activeIndex, { body: e.target.value })}
                      placeholder="Enter content... Use new lines for bullet points"
                    />
                  </div>
                )}

                {/* Image URL for image layouts */}
                {(activeSlide.layout === 'image-left' || activeSlide.layout === 'image-right') && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                    <Input
                      className="h-8 text-sm"
                      value={activeSlide.imageUrl || ''}
                      onChange={(e) => updateSlide(activeIndex, { imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AISlideGenerator
      isOpen={isAIGeneratorOpen}
      onClose={() => setIsAIGeneratorOpen(false)}
      onSlidesGenerated={handleAISlidesGenerated}
      brandName={brand?.name}
    />
    </>
  );
}

export default SlideEditor;
