import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, Sparkles } from 'lucide-react';
import { getPresentationAssetReadinessReport } from '@/services/presentationAssetReadinessService';

const statusIcon = (status: string) => {
  if (status === 'strong') return <CheckCircle2 className="h-4 w-4 text-primary" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
};

export const PresentationAssetReadinessPanel: React.FC = () => {
  const report = useMemo(() => getPresentationAssetReadinessReport(), []);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Gauge className="h-3.5 w-3.5" /> Asset Readiness
          </div>
          <h3 className="text-xl font-black">Is the asset system the best it can be?</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{report.verdict}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-5 py-4 text-right text-primary">
          <div className="text-3xl font-black">{report.score}</div>
          <div className="text-xs font-bold">readiness score</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-background p-3 text-xs"><span className="font-black text-primary">Kits</span><div className="mt-1 text-2xl font-black">{report.totals.kits}</div></div>
        <div className="rounded-2xl bg-background p-3 text-xs"><span className="font-black text-primary">Kit items</span><div className="mt-1 text-2xl font-black">{report.totals.kitItems}</div></div>
        <div className="rounded-2xl bg-background p-3 text-xs"><span className="font-black text-primary">Objects</span><div className="mt-1 text-2xl font-black">{report.totals.prebuiltObjects}</div></div>
        <div className="rounded-2xl bg-background p-3 text-xs"><span className="font-black text-primary">Data styles</span><div className="mt-1 text-2xl font-black">{report.totals.dataVizStyles}</div></div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {report.areas.map((area) => (
          <article key={area.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-black">{statusIcon(area.status)} {area.label}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${area.score}%` }} />
                </div>
              </div>
              <div className="text-xl font-black text-primary">{area.score}</div>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              {area.evidence.map((item) => <div key={item}>• {item}</div>)}
            </div>
            <div className="mt-3 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <span className="font-black text-primary">Next move:</span> {area.nextMoves[0]}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        <div className="flex items-center gap-2 font-black"><Sparkles className="h-4 w-4" /> Asset verdict</div>
        <p className="mt-1 text-primary/90">The system is much stronger than a standard template picker, but it is not fully best-in-class until every asset has source metadata, generated previews, drop-zone validation, and export-proof insertion mapping.</p>
      </div>
    </section>
  );
};
