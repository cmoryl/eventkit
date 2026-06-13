import React, { useMemo } from 'react';
import { ShieldAlert, Wrench } from 'lucide-react';
import { buildPresentationFixPlan, summarizePresentationFixPlan, type PresentationFixFinding } from '@/services/presentationFixPlannerService';
import { cn } from '@/lib/utils';

const demoFindings: PresentationFixFinding[] = [
  { id: 'density', category: 'content_density', severity: 'medium', message: 'One or more slides may contain too much body text for presentation use.' },
  { id: 'brand', category: 'brand', severity: 'high', message: 'Brand Brain state should be confirmed before final export.' },
  { id: 'export', category: 'export', severity: 'medium', message: 'Export fidelity should be checked before generating PPTX/PDF files.' },
];

export const PresentationFixPlanPanel: React.FC<{
  findings?: PresentationFixFinding[];
  className?: string;
}> = ({ findings = demoFindings, className }) => {
  const actions = useMemo(() => buildPresentationFixPlan(findings), [findings]);
  const summary = useMemo(() => summarizePresentationFixPlan(actions), [actions]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Wrench className="h-4 w-4" /> Fix Plan</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Turn QA findings into ordered actions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Prioritized fixes convert review warnings into production-ready commands.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{summary.total}</div>
          <div>fixes</div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="font-black">Critical</div><div className="mt-1 text-lg font-black text-primary">{summary.critical}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="font-black">High</div><div className="mt-1 text-lg font-black text-primary">{summary.high}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="font-black">Auto Apply</div><div className="mt-1 text-lg font-black text-primary">{summary.autoApply}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="font-black">Review</div><div className="mt-1 text-lg font-black text-primary">{summary.needsHumanReview ? 'Yes' : 'No'}</div></div>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <article key={action.id} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black"><ShieldAlert className="h-4 w-4 text-primary" /> {action.label}</div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{action.severity}</span>
            </div>
            <p className="mt-2 text-muted-foreground">{action.description}</p>
            <div className="mt-3 rounded-xl bg-muted p-2"><span className="font-bold">Command:</span> {action.command}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
