import React from 'react';
import { BadgeCheck, CheckCircle2, Download, Eye, Grid3X3, Layers3, Maximize2, PanelLeft, PanelRight, Sparkles, Wand2 } from 'lucide-react';
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

const workflowSteps = ['Create', 'Edit', 'Brand', 'QA', 'Export'];

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
  const activeStep = exportReady ? 'Export' : hasBrand ? 'QA' : slides.length > 0 ? 'Edit' : 'Create';

  return (
    <div className={cn('overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_34%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)/0.74))] shadow-2xl', className)}>
      <div className="border-b border-border/70 bg-card/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Studio Editor V2
            </div>
            <div className="mt-1 truncate text-sm font-black tracking-tight">Canvas-first workspace · fewer buttons · clearer next action</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-bold"><Grid3X3 className="h-3.5 w-3.5 text-primary" /> {slides.length} slides</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-bold"><Maximize2 className="h-3.5 w-3.5 text-primary" /> 100%</span>
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold', exportReady ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600' : 'border-amber-500/40 bg-amber-500/10 text-amber-600')}>
              <BadgeCheck className="h-3.5 w-3.5" /> {exportReady ? 'Export ready' : 'Needs QA'}
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
          <EditorConsolidatedActionBar onAction={onEditorAction} />
          <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 p-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            {workflowSteps.map((step) => (
              <span key={step} className={cn('rounded-full px-2.5 py-1 transition', step === activeStep ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted')}>
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-[196px_minmax(0,1fr)_340px]">
        <aside className="border-r border-border/70 bg-card/45 p-3 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-black"><PanelLeft className="h-3.5 w-3.5 text-primary" /> Filmstrip</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{activeSlideIndex + 1}/{Math.max(slides.length, 1)}</span>
          </div>
          <div className="space-y-2">
            {slides.slice(0, 8).map((slide, index) => (
              <button
                key={slide.id || index}
                type="button"
                className={cn(
                  'group w-full rounded-2xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                  index === activeSlideIndex
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/10'
                    : 'border-border bg-background/70 hover:border-primary/40 hover:bg-background',
                )}
              >
                <div className="aspect-video overflow-hidden rounded-xl border border-border/70 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_30%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)))]">
                  <div className="h-full w-full p-2">
                    <div className="h-1.5 w-8 rounded-full bg-primary/50" />
                    <div className="mt-2 h-1.5 w-16 rounded-full bg-foreground/20" />
                    <div className="mt-1 h-1.5 w-10 rounded-full bg-foreground/10" />
                  </div>
                </div>
                <div className="mt-2 truncate text-[11px] font-black">{index + 1}. {slide.title || 'Untitled'}</div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><Layers3 className="h-3 w-3" /> {slide.layout}</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="relative flex min-w-0 items-center justify-center overflow-hidden p-8">
          <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.45)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute left-6 top-5 z-20 rounded-2xl border border-border bg-card/90 px-3 py-2 text-xs shadow-sm backdrop-blur-xl">
            <div className="font-black">Now editing</div>
            <div className="mt-0.5 text-muted-foreground">{activeSlide?.layout || 'No layout'} · {hasBrand ? 'brand applied' : 'brand pending'}</div>
          </div>
          <div className="absolute top-5 left-1/2 z-20 -translate-x-1/2">
            <EditorFloatingToolbar />
          </div>
          <div className="relative z-10 w-full max-w-[680px] rounded-[1.75rem] border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="aspect-video rounded-[1.25rem] border border-border bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.2),transparent_32%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.72))] p-8 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                <span>Active Canvas</span>
                <span>Safe area on</span>
              </div>
              <div className="mt-12 max-w-[460px] text-3xl font-black tracking-tight">{activeSlide?.title || 'Active slide'}</div>
              <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-muted-foreground">Direct editing, contextual toolbar actions, visible brand state, and export confidence live around the canvas.</p>
            </div>
          </div>
          <div className="absolute bottom-5 left-1/2 z-20 w-[560px] max-w-[calc(100%-3rem)] -translate-x-1/2">
            <EditorUXStatusBar slides={slides} activeIndex={activeSlideIndex} readinessScore={readinessScore} hasBrand={hasBrand} exportReady={exportReady} />
          </div>
        </main>

        <aside className="space-y-3 border-l border-border/70 bg-card/55 p-3 backdrop-blur-xl">
          <div className="rounded-2xl border border-border bg-background/80 p-3 text-xs shadow-sm">
            <div className="mb-2 flex items-center gap-2 font-black"><PanelRight className="h-4 w-4 text-primary" /> Inspector</div>
            <div className="grid gap-2">
              <div className="rounded-xl bg-muted p-3"><div className="font-black">Next best action</div><div className="mt-1 text-muted-foreground">{exportReady ? 'Export deck or save system.' : hasBrand ? 'Run QA and export preflight.' : 'Apply brand and check layout.'}</div></div>
              <div className="rounded-xl bg-muted p-3"><div className="font-black">Confidence</div><div className="mt-1 flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {readinessScore}% ready</div></div>
            </div>
          </div>
          <EditorInspectorTabs slide={activeSlide} />
          <EditorCommandPalette />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" className="rounded-xl border border-border bg-background/80 p-3 font-black transition hover:bg-muted"><Eye className="mb-1 h-4 w-4 text-primary" /> Preview</button>
            <button type="button" className="rounded-xl border border-border bg-background/80 p-3 font-black transition hover:bg-muted"><Download className="mb-1 h-4 w-4 text-primary" /> Export</button>
            <button type="button" className="rounded-xl border border-border bg-background/80 p-3 font-black transition hover:bg-muted"><Wand2 className="mb-1 h-4 w-4 text-primary" /> Fix</button>
            <button type="button" className="rounded-xl border border-border bg-background/80 p-3 font-black transition hover:bg-muted"><Sparkles className="mb-1 h-4 w-4 text-primary" /> AI</button>
          </div>
        </aside>
      </div>
    </div>
  );
};
