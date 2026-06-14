import React, { useMemo } from 'react';
import { Gauge, ShieldCheck } from 'lucide-react';
import { buildPresentationEditorE2ECoverageReport } from '@/services/presentationEditorE2ECoverageService';

export const PresentationEditorE2ECoveragePanel: React.FC = () => {
  const report = useMemo(() => buildPresentationEditorE2ECoverageReport(), []);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Gauge className="h-3.5 w-3.5" /> Editor coverage
          </div>
          <h3 className="text-xl font-black">Editor E2E readiness report</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Consolidates action contracts, pairwise function combinations, replay simulations, and export gates into one readiness verdict.
          </p>
        </div>
        <div className={`rounded-2xl px-5 py-4 text-right ${report.verdict === 'ready' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
          <div className="flex items-center justify-end gap-2 text-sm font-black uppercase tracking-[0.16em]"><ShieldCheck className="h-4 w-4" /> {report.verdict}</div>
          <div className="mt-1 text-3xl font-black">{report.score}</div>
          <div className="text-xs font-bold">coverage score</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{report.actionCoverage}%</div><div className="text-xs font-bold text-muted-foreground">action hooks</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{report.pairwiseCoverage}%</div><div className="text-xs font-bold text-muted-foreground">pairwise combos</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{report.replayCoverage}%</div><div className="text-xs font-bold text-muted-foreground">replay suite</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{report.exportGateCoverage}%</div><div className="text-xs font-bold text-muted-foreground">export gates</div></div>
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        {report.summary.join(' | ')}
      </div>
    </section>
  );
};
