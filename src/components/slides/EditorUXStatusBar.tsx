import React from 'react';
import { CheckCircle2, Gauge, Layers3, Palette, Presentation, WandSparkles } from 'lucide-react';
import type { SlideData } from './slideTypes';
import { cn } from '@/lib/utils';

export interface EditorUXStatusBarProps {
  slides: SlideData[];
  activeIndex: number;
  readinessScore?: number;
  hasBrand?: boolean;
  exportReady?: boolean;
  className?: string;
}

export const EditorUXStatusBar: React.FC<EditorUXStatusBarProps> = ({
  slides,
  activeIndex,
  readinessScore = 0,
  hasBrand,
  exportReady,
  className,
}) => {
  const activeSlide = slides[activeIndex];

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 border-t bg-card/95 px-4 py-2 text-xs shadow-sm backdrop-blur', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-bold text-muted-foreground">
          <Presentation className="h-3.5 w-3.5 text-primary" /> Slide {Math.min(activeIndex + 1, slides.length)} / {slides.length}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-bold text-muted-foreground">
          <Layers3 className="h-3.5 w-3.5 text-primary" /> {activeSlide?.layout || 'No layout'}
        </span>
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold', hasBrand ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground')}>
          <Palette className="h-3.5 w-3.5" /> {hasBrand ? 'Brand locked' : 'Brand pending'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-bold text-muted-foreground">
          <Gauge className="h-3.5 w-3.5 text-primary" /> {Math.round(readinessScore)}% ready
        </span>
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold', exportReady ? 'border-primary/30 bg-primary/10 text-primary' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300')}>
          {exportReady ? <CheckCircle2 className="h-3.5 w-3.5" /> : <WandSparkles className="h-3.5 w-3.5" />}
          {exportReady ? 'Export ready' : 'Review before export'}
        </span>
      </div>
    </div>
  );
};
