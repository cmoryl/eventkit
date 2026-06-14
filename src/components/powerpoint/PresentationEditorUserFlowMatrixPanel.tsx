import React, { useMemo } from 'react';
import { GitBranch, ShieldCheck, Workflow } from 'lucide-react';
import { buildPresentationEditorUserFlowMatrix, validatePresentationEditorUserFlowMatrix } from '@/services/presentationEditorUserFlowCombinationService';

export const PresentationEditorUserFlowMatrixPanel: React.FC = () => {
  const validation = useMemo(() => validatePresentationEditorUserFlowMatrix(), []);
  const matrix = useMemo(() => buildPresentationEditorUserFlowMatrix(), []);
  const highRisk = matrix.pairwiseCombinations.filter((combo) => combo.risk === 'high').length;
  const mediumRisk = matrix.pairwiseCombinations.filter((combo) => combo.risk === 'medium').length;

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Workflow className="h-3.5 w-3.5" /> Editor E2E
          </div>
          <h3 className="text-xl font-black">Editor user-flow combination matrix</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Tests every pairwise editor function combination and the critical create, edit, brand, QA, export, and reuse paths.
          </p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-right ${validation.pass ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
          <div className="flex items-center justify-end gap-2 text-sm font-black"><ShieldCheck className="h-4 w-4" /> {validation.pass ? 'PASS' : 'REVIEW'}</div>
          <div className="mt-1 text-xs font-bold">flow matrix</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{matrix.summary.actionCount}</div><div className="text-xs font-bold text-muted-foreground">actions</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{matrix.summary.pairwiseCount}</div><div className="text-xs font-bold text-muted-foreground">pairwise combos</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{matrix.summary.criticalFlowCount}</div><div className="text-xs font-bold text-muted-foreground">critical flows</div></div>
        <div className="rounded-2xl bg-muted p-4"><div className="text-2xl font-black">{highRisk}</div><div className="text-xs font-bold text-muted-foreground">high-risk combos</div></div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {matrix.criticalFlows.map((flow) => (
          <article key={flow.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">{flow.exportSafe ? 'export-safe' : 'review path'}</div>
                <h4 className="mt-1 font-black">{flow.label}</h4>
              </div>
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{flow.expectedOutcome}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {flow.actions.map((action) => (
                <span key={action} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{action}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        Pairwise coverage is {validation.actualPairwiseCount}/{validation.expectedPairwiseCount}. Medium-risk cross-group combos: {mediumRisk}. Export flow gate: {validation.exportFlowSafe ? 'QA and export check enforced' : 'needs review'}.
      </div>
    </section>
  );
};
