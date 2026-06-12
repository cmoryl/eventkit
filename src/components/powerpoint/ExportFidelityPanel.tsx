import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, XCircle } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import { auditPresentationExportFidelity } from '@/services/presentationExportFidelityService';
import { cn } from '@/lib/utils';

export const ExportFidelityPanel: React.FC<{ slides: SlideData[]; className?: string }> = ({ slides, className }) => {
  const report = useMemo(() => auditPresentationExportFidelity(slides), [slides]);
  const StatusIcon = report.status === 'pass' ? CheckCircle2 : report.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Gauge className="h-4 w-4" /> Export Fidelity</div>
          <p className="mt-1 text-xs text-muted-foreground">Gamma-inspired editor/present/export parity checks before PPTX/PDF output.</p>
        </div>
        <div className={cn('flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold', report.status === 'pass' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : report.status === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : 'border-destructive/30 bg-destructive/10 text-destructive')}>
          <StatusIcon className="h-4 w-4" /> {report.score}/100
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Slides</div><div className="mt-1 font-black">{report.summary.slideCount}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Warnings</div><div className="mt-1 font-black">{report.summary.warnings}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Failures</div><div className="mt-1 font-black">{report.summary.failures}</div></div>
      </div>

      <div className="space-y-2">
        {report.issues.slice(0, 6).map((item) => {
          const Icon = item.severity === 'fail' ? XCircle : AlertTriangle;
          return (
            <div key={item.id} className="rounded-2xl border border-border bg-background p-3 text-xs">
              <div className="flex items-start gap-2 font-bold"><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {item.slideTitle || 'Deck'} · {item.message}</div>
              <p className="mt-1 text-muted-foreground">{item.recommendation}</p>
            </div>
          );
        })}
        {!report.issues.length && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-600">
            No export fidelity issues detected.
          </div>
        )}
      </div>
    </section>
  );
};
