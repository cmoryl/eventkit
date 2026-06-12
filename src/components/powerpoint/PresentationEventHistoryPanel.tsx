import React, { useMemo } from 'react';
import { Bot, CheckCircle2, Clock3, History, ShieldCheck, UserRound } from 'lucide-react';
import {
  summarizePresentationEventHistory,
  type PresentationEventRecord,
} from '@/services/presentationEventHistoryService';
import { cn } from '@/lib/utils';

const actorIcon = (role?: string) => {
  if (role === 'user') return UserRound;
  if (role === 'agent') return Bot;
  return ShieldCheck;
};

export const PresentationEventHistoryPanel: React.FC<{ events: PresentationEventRecord[]; className?: string }> = ({ events, className }) => {
  const summary = useMemo(() => summarizePresentationEventHistory(events), [events]);
  const checks = [
    ['Source', summary.sourceAttached],
    ['Brand', summary.brandApplied],
    ['Template', summary.templateValidated],
    ['Export', summary.exportChecked],
    ['Review', summary.humanReviewed],
  ] as const;

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><History className="h-4 w-4" /> Event History</div>
          <p className="mt-1 text-xs text-muted-foreground">First-party audit trail for sources, brand decisions, templates, QA, review, and exports.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{summary.totalEvents}</div>
          <div>events</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-5 gap-2 text-[10px] font-bold">
        {checks.map(([label, active]) => (
          <div key={label} className={cn('rounded-xl border px-2 py-2 text-center', active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-border bg-background text-muted-foreground')}>
            <CheckCircle2 className="mx-auto mb-1 h-3.5 w-3.5" /> {label}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {events.slice(-6).reverse().map((event) => {
          const Icon = actorIcon(event.actor.role);
          return (
            <article key={event.id} className="rounded-2xl border border-border bg-background p-3 text-xs">
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{event.summary}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground"><Clock3 className="h-3 w-3" /> {event.eventType} · {new Date(event.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </article>
          );
        })}
        {!events.length && (
          <div className="rounded-2xl border border-border bg-background p-3 text-xs text-muted-foreground">
            No presentation events tracked yet.
          </div>
        )}
      </div>
    </section>
  );
};
