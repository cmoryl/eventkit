import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, ShieldCheck, XCircle } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import { runPresentationAgentQALoop } from '@/services/presentationAgentQALoopService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import { cn } from '@/lib/utils';

export interface AgentQALoopPanelProps {
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
  className?: string;
}

export const AgentQALoopPanel: React.FC<AgentQALoopPanelProps> = ({ className, ...input }) => {
  const report = useMemo(() => runPresentationAgentQALoop(input), [input]);
  const StatusIcon = report.status === 'pass' ? CheckCircle2 : report.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><ShieldCheck className="h-4 w-4" /> Agent QA Loop</div>
          <p className="mt-1 text-xs text-muted-foreground">Brand, source, template-slot, export, and human-review gates before final build.</p>
        </div>
        <div className={cn('flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold', report.status === 'pass' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : report.status === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : 'border-destructive/30 bg-destructive/10 text-destructive')}>
          <StatusIcon className="h-4 w-4" /> {report.score}/100
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Mode</div><div className="mt-1 font-black capitalize">{report.summary.creationMode}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Style</div><div className="mt-1 font-black capitalize">{report.summary.deckStyle}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Slides</div><div className="mt-1 font-black">{report.summary.slides}</div></div>
      </div>

      <div className="space-y-2">
        {report.gates.map((gate) => {
          const Icon = gate.status === 'pass' ? CheckCircle2 : gate.status === 'warning' ? AlertTriangle : XCircle;
          return (
            <article key={gate.id} className="rounded-2xl border border-border bg-background p-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-bold"><Icon className="h-3.5 w-3.5 text-primary" /> {gate.label}</div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{gate.status}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{gate.message}</p>
              {gate.fixes.length > 0 && (
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {gate.fixes.slice(0, 3).map((fix) => <li key={fix} className="flex gap-1.5"><CircleDashed className="mt-0.5 h-3 w-3 shrink-0" /> {fix}</li>)}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
