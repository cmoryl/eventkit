import React, { useMemo } from 'react';
import { Bot, WandSparkles } from 'lucide-react';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import { buildPresentationAutopilotPlan } from '@/services/presentationAutopilotService';
import type { PresentationEventRecord } from '@/services/presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import type { SlideData } from '@/components/slides/slideTypes';
import { cn } from '@/lib/utils';

export const PresentationAutopilotPanel: React.FC<{
  title?: string;
  goal?: string;
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  slides?: SlideData[];
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
  className?: string;
}> = ({
  title = 'Presentation Autopilot',
  goal = 'Create an editable, brand-safe, export-ready presentation system.',
  className,
  ...input
}) => {
  const plan = useMemo(() => buildPresentationAutopilotPlan({ title, goal, ...input }), [title, goal, input]);

  return (
    <section className={cn('rounded-3xl border border-primary/20 bg-primary/5 p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Bot className="h-4 w-4" /> Presentation Autopilot</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Recommended production path</h3>
          <p className="mt-1 text-sm text-muted-foreground">Autopilot selects smart blocks, builds a deck recipe, composes the intelligence payload, and recommends the next action.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-background px-3 py-2 text-xs text-primary">
          <div className="font-black">Next</div>
          <div>{plan.nextAction}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Smart Blocks</div>
          <div className="mt-2 text-2xl font-black text-primary">{plan.selectedSmartBlocks.length}</div>
          <p className="mt-1 text-muted-foreground">selected for this goal</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Deck Recipe</div>
          <div className="mt-2 text-2xl font-black text-primary">{plan.metadata.deckRecipeSlideCount}</div>
          <p className="mt-1 text-muted-foreground">planned recipe slides</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Payload</div>
          <div className="mt-2 text-2xl font-black text-primary">{plan.metadata.functionRegistryIncluded ? 'On' : 'Off'}</div>
          <p className="mt-1 text-muted-foreground">function registry context</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-xs">
        <div className="mb-2 flex items-center gap-2 font-black"><WandSparkles className="h-4 w-4 text-primary" /> Recommended actions</div>
        <div className="flex flex-wrap gap-2">
          {plan.recommendedActions.map((action) => <span key={action} className="rounded-full bg-secondary px-3 py-1 font-bold text-muted-foreground">{action}</span>)}
        </div>
      </div>
    </section>
  );
};
