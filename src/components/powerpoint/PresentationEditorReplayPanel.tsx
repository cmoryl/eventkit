import React, { useMemo } from 'react';
import { PlayCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { validatePresentationEditorReplaySuite } from '@/services/presentationEditorFlowReplayService';

export const PresentationEditorReplayPanel: React.FC = () => {
  const suite = useMemo(() => validatePresentationEditorReplaySuite(), []);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <PlayCircle className="h-3.5 w-3.5" /> Editor replay
          </div>
          <h3 className="text-xl font-black">Critical flow replay simulator</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Simulates editor state transitions across critical paths so QA/export/reuse gates are tested as real user journeys.
          </p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-right ${suite.pass ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
          <div className="flex items-center justify-end gap-2 text-sm font-black">
            {suite.pass ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {suite.pass ? 'PASS' : 'REVIEW'}
          </div>
          <div className="mt-1 text-xs font-bold">replay suite</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {suite.results.map((result) => (
          <article key={result.flowId} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-xs font-black uppercase tracking-[0.16em] ${result.pass ? 'text-emerald-600' : 'text-destructive'}`}>
                  {result.pass ? 'replay passed' : 'needs review'}
                </div>
                <h4 className="mt-1 font-black">{result.label}</h4>
              </div>
              {result.pass ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <ShieldAlert className="h-4 w-4 text-destructive" />}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">Deck: {result.finalState.hasDeck ? 'yes' : 'no'}</span>
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">Brand: {result.finalState.hasBrand ? 'yes' : 'no'}</span>
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">QA: {result.finalState.qaPassed ? 'pass' : 'pending'}</span>
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">Preflight: {result.finalState.exportChecked ? 'pass' : 'pending'}</span>
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">Exported: {result.finalState.exported ? 'yes' : 'no'}</span>
              <span className="rounded-xl bg-muted px-3 py-2 font-bold">Reusable: {result.finalState.reusableSaved ? 'yes' : 'no'}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        {suite.warnings.length === 0 ? 'No replay warnings. Export gates are enforced before download.' : suite.warnings.join(' | ')}
      </div>
    </section>
  );
};
