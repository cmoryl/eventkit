import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import type { ExportFidelityReport } from '@/services/presentationExportFidelityService';
import type { PresentationAgentQALoopReport } from '@/services/presentationAgentQALoopService';
import { evaluatePresentationExportReadiness } from '@/services/presentationExportReadinessService';
import { cn } from '@/lib/utils';

export const PresentationExportReadinessPanel: React.FC<{
  exportFidelity: ExportFidelityReport;
  agentQA: PresentationAgentQALoopReport;
  allowReviewedProceed?: boolean;
  className?: string;
}> = ({ exportFidelity, agentQA, allowReviewedProceed, className }) => {
  const readiness = useMemo(() => evaluatePresentationExportReadiness({ exportFidelity, agentQA, allowReviewedProceed }), [exportFidelity, agentQA, allowReviewedProceed]);
  const Icon = readiness.decision === 'ready' ? CheckCircle2 : readiness.decision === 'ready_with_notes' ? AlertTriangle : XCircle;

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><ClipboardCheck className="h-4 w-4" /> Export Readiness</div>
          <p className="mt-1 text-xs text-muted-foreground">Final readiness decision from Agent QA and export-fidelity checks.</p>
        </div>
        <div className={cn('flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold', readiness.decision === 'ready' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : readiness.decision === 'ready_with_notes' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : 'border-destructive/30 bg-destructive/10 text-destructive')}>
          <Icon className="h-4 w-4" /> {readiness.score}/100
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-border bg-background p-3 text-xs">
        <div className="font-bold capitalize">{String(readiness.decision).replace(/_/g, ' ')}</div>
        <div className="mt-1 text-muted-foreground">{readiness.canProceed ? 'Export may proceed.' : 'Fix required items before final delivery.'}</div>
      </div>

      <div className="space-y-2">
        {readiness.nextActions.map((action) => (
          <div key={action} className="rounded-xl bg-muted p-2 text-xs text-muted-foreground">{action}</div>
        ))}
      </div>
    </section>
  );
};
