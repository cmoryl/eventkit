import React, { useMemo, useState } from 'react';
import { Boxes, Sparkles } from 'lucide-react';
import {
  getPresentationAdvancedFunctionsByCategory,
  presentationAdvancedFunctions,
  type PresentationAdvancedFunctionCategory,
} from '@/services/presentationAdvancedFunctionRegistry';
import { cn } from '@/lib/utils';

const categories: Array<{ id: PresentationAdvancedFunctionCategory; label: string }> = [
  { id: 'creation', label: 'Create' },
  { id: 'source', label: 'Source' },
  { id: 'brand', label: 'Brand' },
  { id: 'template', label: 'Template' },
  { id: 'layout', label: 'Layout' },
  { id: 'live_edit', label: 'Live Edit' },
  { id: 'qa', label: 'QA' },
  { id: 'export', label: 'Export' },
  { id: 'reuse', label: 'Reuse' },
  { id: 'analytics', label: 'History' },
];

export const PresentationFunctionPanel: React.FC<{ className?: string }> = ({ className }) => {
  const [category, setCategory] = useState<PresentationAdvancedFunctionCategory>('creation');
  const functions = useMemo(() => getPresentationAdvancedFunctionsByCategory(category), [category]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Boxes className="h-4 w-4" /> Studio Functions</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Function-first presentation workflow</h3>
          <p className="mt-1 text-sm text-muted-foreground">A production library for creation, source intake, brand control, live editing, QA, export, reuse, and history.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{presentationAdvancedFunctions.length}</div>
          <div>functions</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', category === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {functions.map((fn) => (
          <article key={fn.id} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black"><Sparkles className="h-4 w-4 text-primary" /> {fn.label}</div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{fn.status}</span>
            </div>
            <p className="mt-2 text-muted-foreground">{fn.description}</p>
            <div className="mt-3 rounded-xl bg-muted p-3"><span className="font-bold">User value:</span> {fn.userValue}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {fn.poweredBy.map((system) => <span key={system} className="rounded-full border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">{system}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
