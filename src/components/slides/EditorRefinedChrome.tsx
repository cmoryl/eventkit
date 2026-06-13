import React from 'react';
import { Grid3X3, Layers3, Maximize2 } from 'lucide-react';
import type { PresentationEditorActionGroupId } from '@/services/presentationEditorActionAuditService';
import type { PresentationEditorActionId } from '@/services/presentationEditorActionContractService';
import type { SlideData } from './slideTypes';
import { EditorCommandPalette } from './EditorCommandPalette';
import { EditorConsolidatedActionBar } from './EditorConsolidatedActionBar';
import { EditorFloatingToolbar } from './EditorFloatingToolbar';
import { EditorInspectorTabs } from './EditorInspectorTabs';
import { EditorUXStatusBar } from './EditorUXStatusBar';
import { cn } from '@/lib/utils';

export interface EditorRefinedChromeProps {
  slides: SlideData[];
  activeSlideIndex?: number;
  readinessScore?: number;
  hasBrand?: boolean;
  exportReady?: boolean;
  onEditorAction?: (action: PresentationEditorActionId, group: PresentationEditorActionGroupId) => void;
  className?: string;
}

export const EditorRefinedChrome: React.FC<EditorRefinedChromeProps> = ({
  slides,
  activeSlideIndex = 0,
  readinessScore = 0,
  hasBrand,
  exportReady,
  onEditorAction,
  className,
}) => {
  const activeSlide = slides[activeSlideIndex];

  return (
    <div className={cn('overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)/0.72))] shadow-2xl', className)}>
      <div className="border-b border-border/70 bg-card/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Editor Workspace</div>
            <div className="text-sm font-black tracking-tight">Refined canvas-first interface</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-bold"><Grid3X3 className="h-3.5 w-3.5 text-primary" /> Grid</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-bold"><Maximize2 className="h-3.5 w-3.5 text-primary" /> 100%</span>
          </div>
        </div>
        <div className="mt-3">
          <EditorConsolidatedActionBar onAction={onEditorAction} />
        </div>
      </div>

      <div className="grid min-h-[430px] grid-cols-[172px_minmax(0,1fr)_320px]">
        <aside className="border-r border-border/70 bg-card/45 p-3 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-black">Slides</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{slides.length}</span>
          </div>
          <div className="space-y-2">
            {slides.slice(0, 6).map((slide, index) => (
              <button
                key={slide.id || index}
                type="button"
                className={cn(
                  'group w-full rounded-2xl border p-2 text-left transition',
                  index === activeSlideIndex
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/10'
                    : 'border-border bg-background/70 hover:border-primary/40 hover:bg-background',
                )}
              >
                <div className="aspect-video rounded-xl border border-border/70 bg-gradient-to-br from-background to-muted" />
                <div className="mt-2 truncate text-[11px] font-black">{index + 1}. {slide.title || 'Untitled'}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><Layers3 className="h-3 w-3" /> {slide.layout}</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="relative flex min-w-0 items-center justify-center overflow-hidden p-8">
          <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.45)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2">
            <EditorFloatingToolbar />
          </div>
          <div className="relative z-10 w-full max-w-[620px] rounded-[1.75rem] border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="aspect-video rounded-[1.25rem] border border-border bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.2),transparent_32%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.72))] p-8 shadow-inner">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Canvas</div>
              <div className="mt-12 max-w-[420px] text-3xl font-black tracking-tight">{activeSlide?.title || 'Active slide'}</div>
              <p className="mt-3 max-w-[420px] text-sm leading-relaxed text-muted-foreground">Direct editing, contextual toolbar actions, visible brand state, and export confidence live around the canvas.</p>
            </div>
          </div>
          <div className="absolute bottom-5 left-1/2 z-20 w-[520px] max-w-[calc(100%-3rem)] -translate-x-1/2">
            <EditorUXStatusBar slides={slides} activeIndex={activeSlideIndex} readinessScore={readinessScore} hasBrand={hasBrand} exportReady={exportReady} />
          </div>
        </main>

        <aside className="space-y-3 border-l border-border/70 bg-card/55 p-3 backdrop-blur-xl">
          <EditorInspectorTabs slide={activeSlide} />
          <EditorCommandPalette />
        </aside>
      </div>
    </div>
  );
};
