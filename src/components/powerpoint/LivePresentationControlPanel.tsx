import React, { useMemo, useState } from 'react';
import { CheckCircle2, Layers3, MousePointer2, Palette, Play, ShieldCheck, SlidersHorizontal, Type, Wand2 } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { PresentationControlCategory, PresentationInteractionControl } from '@/services/presentationInteractionControlService';
import { buildPresentationInteractionModel, getMaximumInteractionRoadmap } from '@/services/presentationInteractionControlService';
import { cn } from '@/lib/utils';

const categoryIcons: Record<PresentationControlCategory, React.ElementType> = {
  content: Type,
  layout: Layers3,
  visual: Palette,
  data: SlidersHorizontal,
  media: MousePointer2,
  motion: Play,
  brand: ShieldCheck,
  export: CheckCircle2,
};

export interface LivePresentationControlPanelProps {
  slide: SlideData;
  selectedControlId?: string;
  onSelectControl?: (control: PresentationInteractionControl) => void;
  className?: string;
}

export const LivePresentationControlPanel: React.FC<LivePresentationControlPanelProps> = ({
  slide,
  selectedControlId,
  onSelectControl,
  className,
}) => {
  const model = useMemo(() => buildPresentationInteractionModel(slide), [slide]);
  const [category, setCategory] = useState<PresentationControlCategory | 'all'>('all');
  const categories = model.summary.categories;
  const controls = category === 'all' ? model.controls : model.controls.filter((control) => control.category === category);

  return (
    <aside className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Wand2 className="h-4 w-4" /> Live Controls</div>
          <p className="mt-1 text-xs text-muted-foreground">Element-level controls for the active slide area.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-right text-xs text-primary">
          <div className="font-black">{model.summary.enabled}/{model.summary.total}</div>
          <div>available</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Layout</div><div className="mt-1 font-bold capitalize">{model.layout}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Elements</div><div className="mt-1 font-bold">{model.summary.elementLevel}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Modes</div><div className="mt-1 font-bold">{model.summary.categories.length}</div></div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn('rounded-full border px-3 py-1 text-xs font-bold transition', category === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
        >
          All
        </button>
        {categories.map((item) => {
          const Icon = categoryIcons[item];
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold capitalize transition', category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
            >
              <Icon className="h-3 w-3" /> {item}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2">
        {controls.map((control) => {
          const Icon = categoryIcons[control.category];
          return (
            <button
              key={control.id}
              type="button"
              disabled={!control.enabled}
              onClick={() => onSelectControl?.(control)}
              className={cn(
                'rounded-2xl border p-3 text-left transition hover:bg-secondary',
                selectedControlId === control.id ? 'border-primary bg-primary/5' : 'border-border bg-background',
                !control.enabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4 text-primary" /> {control.label}</div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{control.level}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{control.description}</p>
              {control.reason && <p className="mt-1 text-[11px] text-amber-600">{control.reason}</p>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-3">
        <div className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Maximum control roadmap</div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {getMaximumInteractionRoadmap().slice(0, 4).map((item) => (
            <div key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> <span>{item}</span></div>
          ))}
        </div>
      </div>
    </aside>
  );
};
