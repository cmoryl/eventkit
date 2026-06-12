import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Gauge, XCircle } from 'lucide-react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import type { PresentationEventRecord } from '@/services/presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import { buildPresentationStudioIntelligenceState } from '@/services/presentationStudioIntelligenceOrchestrator';
import { cn } from '@/lib/utils';

export interface PresentationStudioIntelligenceStatusProps {
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
  className?: string;
}

export const PresentationStudioIntelligenceStatus: React.FC<PresentationStudioIntelligenceStatusProps> = ({ className, ...input }) => {
  const state = useMemo(() => buildPresentationStudioIntelligenceState(input), [input]);
  const StatusIcon = state.status === 'pass' ? CheckCircle2 : state.status === 'warning' ? AlertTriangle : XCircle;

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Gauge className="h-4 w-4" /> Studio Intelligence</div>
          <h3 className="mt-1 text-2xl font-black tracking-tight">Production readiness score</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Combined agent QA, export fidelity, event history, competitive edge, and Gamma-inspired authoring intelligence.
          </p>
        </div>
        <div className={cn('flex min-w-[160px] items-center justify-center gap-2 rounded-3xl border px-5 py-4 text-xl font-black', state.status === 'pass' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : state.status === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-600' : 'border-destructive/30 bg-destructive/10 text-destructive')}>
          <StatusIcon className="h-6 w-6" /> {state.score}/100
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="text-muted-foreground">Agent QA</div><div className="mt-1 font-black">{state.agentQA.score}/100</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="text-muted-foreground">Export</div><div className="mt-1 font-black">{state.exportFidelity.score}/100</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="text-muted-foreground">Events</div><div className="mt-1 font-black">{state.eventHistory.totalEvents}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3 text-xs"><div className="text-muted-foreground">Edges</div><div className="mt-1 font-black">{state.competitiveEdges.length}</div></div>
      </div>
    </section>
  );
};
