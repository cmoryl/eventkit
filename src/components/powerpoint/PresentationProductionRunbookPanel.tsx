import React, { useMemo } from 'react';
import { ClipboardCheck, CircleDashed } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { PresentationEventRecord } from '@/services/presentationEventHistoryService';
import type { ExportReadinessDecision } from '@/services/presentationExportReadinessService';
import type { AgentQAGateStatus } from '@/services/presentationAgentQALoopService';
import { buildPresentationProductionRunbook, getActiveRunbookPhase } from '@/services/presentationProductionRunbookService';
import { cn } from '@/lib/utils';

export const PresentationProductionRunbookPanel: React.FC<{
  slides: SlideData[];
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  qaStatus?: AgentQAGateStatus;
  exportDecision?: ExportReadinessDecision;
  humanApproved?: boolean;
  className?: string;
}> = ({ className, ...input }) => {
  const phases = useMemo(() => buildPresentationProductionRunbook(input), [input]);
  const active = getActiveRunbookPhase(phases);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><ClipboardCheck className="h-4 w-4" /> Production Runbook</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">End-to-end deck operating path</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tracks intake, brand, structure, generation, live edit, QA, export, and reuse.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
          <div className="font-black">Active</div>
          <div>{active.label}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {phases.map((phase, index) => (
          <article key={phase.id} className={cn('rounded-2xl border p-4 text-xs', phase.status === 'complete' && 'border-primary/30 bg-primary/10', phase.status === 'active' && 'border-primary bg-background', phase.status === 'blocked' && 'border-destructive/30 bg-destructive/5', phase.status === 'upcoming' && 'border-border bg-background')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">Step {index + 1}</div>
                <div className="mt-1 text-sm font-black">{phase.label}</div>
              </div>
              <CircleDashed className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-muted-foreground">{phase.action}</p>
            {phase.blockers.length > 0 && <div className="mt-3 rounded-xl bg-background p-2 text-[11px] text-muted-foreground"><span className="font-bold text-foreground">Blocked by:</span> {phase.blockers.join(', ')}</div>}
          </article>
        ))}
      </div>
    </section>
  );
};
