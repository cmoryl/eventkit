import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, CircleDashed, Lock, Route, TriangleAlert } from 'lucide-react';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import type { ExportReadinessDecision } from '@/services/presentationExportReadinessService';
import { buildPresentationUserFlow, getNextPresentationFlowStep } from '@/services/presentationUserFlowService';
import { cn } from '@/lib/utils';

export const PresentationUserFlowPanel: React.FC<{
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  hasTemplate?: boolean;
  hasOutline?: boolean;
  hasDeck?: boolean;
  hasEdits?: boolean;
  qaStatus?: 'pass' | 'warning' | 'fail';
  exportDecision?: ExportReadinessDecision;
  hasSavedSnapshot?: boolean;
  className?: string;
}> = ({ className, ...input }) => {
  const steps = useMemo(() => buildPresentationUserFlow(input), [input]);
  const nextStep = getNextPresentationFlowStep(steps);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Route className="h-4 w-4" /> Guided User Flow</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">From source to export, without losing brand control</h3>
          <p className="mt-1 text-sm text-muted-foreground">A guided flow that turns the studio into a production system, not just a generator.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
          <div className="font-black">Next</div>
          <div>{nextStep?.label}</div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.status === 'complete' ? CheckCircle2 : step.status === 'locked' ? Lock : step.status === 'needs_attention' ? TriangleAlert : CircleDashed;
          return (
            <article key={step.id} className={cn('rounded-2xl border p-4 text-xs', step.status === 'complete' ? 'border-emerald-500/30 bg-emerald-500/10' : step.status === 'needs_attention' ? 'border-amber-500/30 bg-amber-500/10' : step.status === 'locked' ? 'border-border bg-muted/40 opacity-70' : 'border-border bg-background')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-primary" /> {step.label}</div>
                <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{step.status.replace('_', ' ')}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{step.userGoal}</p>
              <div className="mt-3 rounded-xl bg-background/70 p-2"><span className="font-bold">Function:</span> {step.systemFunction}</div>
              <div className="mt-3 flex items-center gap-1.5 font-bold text-primary"><ArrowRight className="h-3.5 w-3.5" /> {step.actionLabel}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
