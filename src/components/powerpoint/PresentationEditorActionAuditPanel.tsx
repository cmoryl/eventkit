import React, { useMemo } from 'react';
import { Combine, ListChecks, MousePointerClick } from 'lucide-react';
import { buildPresentationEditorActionAudit } from '@/services/presentationEditorActionAuditService';
import { cn } from '@/lib/utils';

export const PresentationEditorActionAuditPanel: React.FC<{ className?: string }> = ({ className }) => {
  const audit = useMemo(() => buildPresentationEditorActionAudit(), []);

  return (
    <section className={cn('rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Combine className="h-4 w-4" /> Button + Function Audit</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Consolidate repeated editor actions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Review duplicate buttons, competing entry points, and where functions should combine into cleaner action groups.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
          <div className="font-black">{audit.groups.length}</div>
          <div>action groups</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {audit.groups.map((group) => (
          <article key={group.id} className="rounded-2xl border border-border bg-background/80 p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-black"><MousePointerClick className="h-4 w-4 text-primary" /> {group.label}</div>
            <p className="mt-2 text-muted-foreground">{group.purpose}</p>
            <div className="mt-3 rounded-xl bg-primary/10 p-2 font-black text-primary">Primary: {group.primaryButton}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group.secondaryActions.map((action) => <span key={action} className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">{action}</span>)}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-border bg-background/80 p-4 text-xs shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-black"><ListChecks className="h-4 w-4 text-primary" /> Repeated areas to combine</div>
          <div className="space-y-3">
            {audit.repeatedAreas.map((item) => (
              <div key={item.area} className="rounded-xl border border-border bg-card p-3">
                <div className="font-black">{item.area}</div>
                <p className="mt-1 text-muted-foreground">{item.problem}</p>
                <div className="mt-2 rounded-lg bg-muted p-2 font-bold text-foreground">Combine as: {item.combinedPattern}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-background/80 p-4 text-xs shadow-sm">
          <div className="mb-3 font-black">Consolidation rules</div>
          <div className="space-y-2">
            {audit.consolidationRules.map((rule, index) => (
              <div key={rule} className="rounded-xl bg-muted p-3 text-muted-foreground"><span className="font-black text-foreground">{index + 1}.</span> {rule}</div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background/80 p-4 text-xs shadow-sm">
        <div className="mb-3 font-black">Specific inventory recommendations</div>
        <div className="grid gap-2 md:grid-cols-2">
          {audit.inventory.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-3">
              <div className="font-black">{item.label}</div>
              <p className="mt-1 text-muted-foreground">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
