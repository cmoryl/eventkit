import React, { useMemo, useState } from 'react';
import { MessageSquareText, Route } from 'lucide-react';
import { routePresentationCommand } from '@/services/presentationCommandRouterService';
import { cn } from '@/lib/utils';

const examples = [
  'Generate a sales deck from this source PDF',
  'Apply our brand and check the logo placement',
  'Build a roadmap story with metrics and case studies',
  'Run QA and tell me what needs to be fixed before export',
  'Export this to PPTX and save it as a reusable system',
];

export const PresentationCommandRouterPanel: React.FC<{ className?: string }> = ({ className }) => {
  const [command, setCommand] = useState(examples[0]);
  const route = useMemo(() => routePresentationCommand(command), [command]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><Route className="h-4 w-4" /> Command Router</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Natural-language production routing</h3>
          <p className="mt-1 text-sm text-muted-foreground">Type what the user wants. The router maps it to a flow step, function category, required context, and next action.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
          <div className="font-black">Confidence</div>
          <div>{Math.round(route.confidence * 100)}%</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-3">
        <label className="mb-2 flex items-center gap-2 text-xs font-black text-muted-foreground"><MessageSquareText className="h-4 w-4" /> User command</label>
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Example: Run QA and export this deck"
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Intent</div>
          <div className="mt-2 text-sm font-black text-primary">{String(route.intent).replace(/_/g, ' ')}</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Flow Step</div>
          <div className="mt-2 text-sm font-black text-primary">{String(route.flowStep).replace(/_/g, ' ')}</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 text-xs">
          <div className="font-black">Function</div>
          <div className="mt-2 text-sm font-black text-primary">{String(route.functionCategory).replace(/_/g, ' ')}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-xs">
        <div className="font-black">Recommended action</div>
        <p className="mt-2 text-primary font-bold">{route.recommendedAction}</p>
        <p className="mt-2 text-muted-foreground">{route.assistantInstruction}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {route.requiredContext.map((item) => <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">{item}</span>)}
      </div>
    </section>
  );
};
