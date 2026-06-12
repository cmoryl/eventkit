import React, { useMemo, useState } from 'react';
import { CheckCircle2, Crown, Gauge, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import {
  getPresentationCompetitiveEdges,
  type PresentationCompetitiveEdge,
  type PresentationEdgePriority,
} from '@/services/presentationCompetitiveEdgeService';
import { cn } from '@/lib/utils';

const priorityLabels: Record<PresentationEdgePriority, string> = {
  now: 'Now',
  next: 'Next',
  scale: 'Scale',
};

const iconForEdge = (edge: PresentationCompetitiveEdge) => {
  if (edge.id.includes('brand') || edge.id.includes('logo')) return ShieldCheck;
  if (edge.id.includes('export')) return Gauge;
  if (edge.id.includes('content') || edge.id.includes('template')) return Layers3;
  return Sparkles;
};

export const PresentationCompetitiveEdgePanel: React.FC<{ className?: string }> = ({ className }) => {
  const [priority, setPriority] = useState<PresentationEdgePriority>('now');
  const edges = useMemo(() => getPresentationCompetitiveEdges(priority), [priority]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Crown className="h-4 w-4" /> Competitive Edge</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Build the presentation studio that beats generic AI deck tools</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Focus the product around deterministic brand governance, true editable PowerPoint, live controls, template slots, and export fidelity.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{getPresentationCompetitiveEdges().length}</div>
          <div>edges</div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(Object.keys(priorityLabels) as PresentationEdgePriority[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPriority(item)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', priority === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {priorityLabels[item]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {edges.map((edge) => {
          const Icon = iconForEdge(edge);
          return (
            <article key={edge.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-primary" /> {edge.label}</div>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground"><span className="font-bold text-foreground">Baseline:</span> {edge.baseline}</p>
              <div className="mt-3 rounded-xl bg-muted p-3 text-xs"><span className="font-bold">EventKit move:</span> {edge.eventKitMove}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
