import React, { useMemo } from 'react';
import { MousePointerClick, PanelRight, Keyboard } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import { EditorCommandPalette } from '@/components/slides/EditorCommandPalette';
import { EditorUXStatusBar } from '@/components/slides/EditorUXStatusBar';
import { buildPresentationEditorUXState } from '@/services/presentationEditorUXService';
import { cn } from '@/lib/utils';

export const PresentationEditorUXPanel: React.FC<{
  slides: SlideData[];
  activeSlideIndex?: number;
  readinessScore?: number;
  hasBrand?: boolean;
  exportReady?: boolean;
  className?: string;
}> = ({ slides, activeSlideIndex = 0, readinessScore = 0, hasBrand, exportReady, className }) => {
  const state = useMemo(() => buildPresentationEditorUXState({ slides, activeSlideIndex }), [slides, activeSlideIndex]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><MousePointerClick className="h-4 w-4" /> Editor UX</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Canvas-first editing experience</h3>
          <p className="mt-1 text-sm text-muted-foreground">Improves the slide editor around direct manipulation, contextual controls, inspector clarity, and fast command access.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
          <div className="font-black">Slide {state.activeSlideIndex + 1}</div>
          <div>{state.activeLayout || 'none'}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
        <span className="font-bold text-foreground">Recommended focus:</span> {state.recommendedFocus}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-background">
        <div className="grid min-h-[260px] grid-cols-[150px_minmax(0,1fr)_260px]">
          <div className="border-r bg-muted/40 p-3 text-xs">
            <div className="mb-2 font-black">Slide Rail</div>
            {slides.slice(0, 4).map((slide, index) => (
              <div key={slide.id || index} className={cn('mb-2 rounded-xl border p-2', index === activeSlideIndex ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground')}>
                <div className="font-bold">{index + 1}. {slide.title || 'Untitled'}</div>
                <div className="text-[10px]">{slide.layout}</div>
              </div>
            ))}
          </div>
          <div className="relative flex items-center justify-center bg-muted/20 p-5">
            <div className="aspect-video w-full max-w-[480px] rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-xs font-bold uppercase text-muted-foreground">Canvas preview</div>
              <div className="mt-8 text-2xl font-black">{slides[activeSlideIndex]?.title || 'Active slide'}</div>
              <div className="mt-3 text-sm text-muted-foreground">Inline editing, drag/drop, floating tools, and contextual feedback should all happen here.</div>
            </div>
            <div className="absolute bottom-4 left-1/2 w-[340px] -translate-x-1/2">
              <EditorUXStatusBar slides={slides} activeIndex={activeSlideIndex} readinessScore={readinessScore} hasBrand={hasBrand} exportReady={exportReady} />
            </div>
          </div>
          <div className="border-l bg-muted/30 p-3">
            <EditorCommandPalette />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {state.zones.map((zone) => (
          <article key={zone.id} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="flex items-center gap-2 font-black"><PanelRight className="h-4 w-4 text-primary" /> {zone.label}</div>
            <p className="mt-2 text-muted-foreground">{zone.purpose}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {zone.primaryActions.slice(0, 3).map((action) => <span key={action} className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">{action}</span>)}
            </div>
            <div className="mt-3 rounded-xl bg-muted p-2 text-[11px] text-muted-foreground"><span className="font-bold text-foreground">Rule:</span> {zone.uxRule}</div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-xs">
        <div className="mb-3 flex items-center gap-2 font-black"><Keyboard className="h-4 w-4 text-primary" /> Interaction model</div>
        <div className="grid gap-2 md:grid-cols-2">
          {state.interactions.map((interaction) => (
            <div key={interaction.id} className="rounded-xl bg-muted p-3">
              <div className="font-black">{interaction.label}</div>
              <p className="mt-1 text-muted-foreground"><span className="font-bold text-foreground">Trigger:</span> {interaction.trigger}</p>
              <p className="mt-1 text-muted-foreground"><span className="font-bold text-foreground">Feedback:</span> {interaction.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {state.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300">
          <div className="font-black">Editor warnings</div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {state.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
};
