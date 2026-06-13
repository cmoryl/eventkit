import React from 'react';
import { BadgeCheck, FileUp, Presentation, ShieldCheck, WandSparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickActions = [
  { id: 'source', label: 'Attach Source', detail: 'PDF, PPTX, notes', icon: FileUp },
  { id: 'brand', label: 'Lock Brand', detail: 'Brand Brain + logo', icon: BadgeCheck },
  { id: 'generate', label: 'Build Deck', detail: 'Recipe + blocks', icon: Presentation },
  { id: 'qa', label: 'Run QA', detail: 'Fix issues', icon: ShieldCheck },
  { id: 'export', label: 'Export Ready', detail: 'PPTX/PDF check', icon: WandSparkles },
];

export const PresentationStudioQuickActions: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <section className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-primary">Quick Actions</div>
          <p className="text-xs text-muted-foreground">Keep the main production moves one click away.</p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.id} type="button" className="rounded-2xl border border-border bg-background p-3 text-left transition hover:border-primary hover:bg-primary/5">
              <Icon className="mb-2 h-4 w-4 text-primary" />
              <div className="text-xs font-black">{action.label}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">{action.detail}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
