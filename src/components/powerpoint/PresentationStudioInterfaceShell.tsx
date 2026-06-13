import React from 'react';
import { Gauge, LayoutDashboard, MousePointerClick, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PresentationStudioInterfaceShellProps {
  title?: string;
  subtitle?: string;
  readinessScore?: number;
  activeStage?: string;
  children: React.ReactNode;
  className?: string;
}

const stages = ['Autopilot', 'Command', 'Flow', 'Functions', 'Structure', 'Export', 'Fix', 'Review'];

export const PresentationStudioInterfaceShell: React.FC<PresentationStudioInterfaceShellProps> = ({
  title = 'Presentation Studio Mission Control',
  subtitle = 'One interface for guided creation, smart blocks, QA, fixes, export readiness, and reusable presentation systems.',
  readinessScore = 0,
  activeStage = 'Autopilot',
  children,
  className,
}) => {
  return (
    <div className={cn('rounded-[2rem] border border-border bg-background/80 p-3 shadow-sm backdrop-blur', className)}>
      <div className="sticky top-3 z-20 mb-4 rounded-[1.5rem] border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary"><LayoutDashboard className="h-4 w-4" /> Mission Control</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
            <p className="mt-1 max-w-4xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="grid min-w-[240px] grid-cols-2 gap-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
              <div className="flex items-center gap-1 font-black"><Gauge className="h-4 w-4" /> Readiness</div>
              <div className="mt-1 text-2xl font-black">{Math.round(readinessScore)}%</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-3 text-xs">
              <div className="flex items-center gap-1 font-black"><MousePointerClick className="h-4 w-4 text-primary" /> Active</div>
              <div className="mt-1 truncate text-sm font-black text-primary">{activeStage}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {stages.map((stage) => (
            <span key={stage} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold', stage === activeStage ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground')}>
              {stage}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0 space-y-5">{children}</main>
        <aside className="hidden xl:block">
          <div className="sticky top-36 space-y-3 rounded-[1.5rem] border border-border bg-card p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 font-black text-primary"><Sparkles className="h-4 w-4" /> UI Priorities</div>
            <div className="rounded-2xl bg-background p-3"><span className="font-bold">1.</span> Keep the next action visible.</div>
            <div className="rounded-2xl bg-background p-3"><span className="font-bold">2.</span> Show why each system matters.</div>
            <div className="rounded-2xl bg-background p-3"><span className="font-bold">3.</span> Make QA and export confidence obvious.</div>
            <div className="rounded-2xl bg-background p-3"><span className="font-bold">4.</span> Let users move from command to fix to export.</div>
          </div>
        </aside>
      </div>
    </div>
  );
};
