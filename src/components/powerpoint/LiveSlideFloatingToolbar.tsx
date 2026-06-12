import React, { useMemo } from 'react';
import { BarChart3, CheckCircle2, Image, Layers3, MousePointer2, Palette, ShieldCheck, Sparkles, Type, Wand2 } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { LiveSlideAction, LiveSlideActionCategory } from '@/services/presentationLiveActionRegistry';
import { buildLiveSlideActions, getDefaultLiveActionForSlide } from '@/services/presentationLiveActionRegistry';
import { cn } from '@/lib/utils';

const iconByCategory: Record<LiveSlideActionCategory, React.ElementType> = {
  edit: Type,
  style: Palette,
  data: BarChart3,
  media: Image,
  motion: Sparkles,
  brand: ShieldCheck,
  qa: CheckCircle2,
};

export interface LiveSlideFloatingToolbarProps {
  slide: SlideData;
  activeActionId?: string;
  onAction?: (action: LiveSlideAction) => void;
  className?: string;
}

export const LiveSlideFloatingToolbar: React.FC<LiveSlideFloatingToolbarProps> = ({ slide, activeActionId, onAction, className }) => {
  const actions = useMemo(() => buildLiveSlideActions(slide), [slide]);
  const defaultAction = useMemo(() => getDefaultLiveActionForSlide(slide), [slide]);

  return (
    <div className={cn('pointer-events-auto rounded-3xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl', className)}>
      <div className="mb-2 flex items-center justify-between gap-3 px-2 pt-1">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
          <MousePointer2 className="h-3.5 w-3.5" /> Live canvas controls
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
          <Layers3 className="h-3 w-3" /> {slide.layout}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const Icon = iconByCategory[action.category];
          const active = activeActionId === action.id || (!activeActionId && defaultAction.id === action.id);
          return (
            <button
              key={action.id}
              type="button"
              disabled={!action.enabled}
              onClick={() => onAction?.(action)}
              title={action.reason || action.description}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 hover:shadow-md',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-secondary',
                !action.enabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">
        <Wand2 className="h-3.5 w-3.5 text-primary" />
        Select a control to open the matching inspector, editor, or Brand Brain action.
      </div>
    </div>
  );
};
