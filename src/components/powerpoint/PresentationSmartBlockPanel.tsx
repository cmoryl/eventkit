import React, { useState } from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { presentationSmartBlocks, type PresentationSmartBlockType } from '@/services/presentationSmartBlockService';
import { cn } from '@/lib/utils';

export const PresentationSmartBlockPanel: React.FC<{
  selected?: PresentationSmartBlockType[];
  onToggle?: (id: PresentationSmartBlockType) => void;
  className?: string;
}> = ({ selected = [], onToggle, className }) => {
  const [localSelected, setLocalSelected] = useState<PresentationSmartBlockType[]>(selected);
  const active = onToggle ? selected : localSelected;

  const handleToggle = (id: PresentationSmartBlockType) => {
    if (onToggle) return onToggle(id);
    setLocalSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><LayoutGrid className="h-4 w-4" /> Smart Blocks</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Editable slide building blocks</h3>
          <p className="mt-1 text-sm text-muted-foreground">Structured blocks for high-quality slides that stay editable, brand-safe, and export-ready.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{active.length}</div>
          <div>selected</div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {presentationSmartBlocks.map((block) => {
          const isSelected = active.includes(block.id);
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => handleToggle(block.id)}
              className={cn('rounded-2xl border p-4 text-left text-xs transition', isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-secondary')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black"><Sparkles className="h-4 w-4 text-primary" /> {block.label}</div>
                <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{block.recommendedLayouts[0]}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{block.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {block.requiredInputs.slice(0, 3).map((input) => <span key={input} className="rounded-full border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">{input}</span>)}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
