import React, { useMemo, useState } from 'react';
import { BrainCircuit, Copy, Search, Sparkles } from 'lucide-react';
import { buildPresentationAssetIntelligenceState } from '@/services/presentationAssetIntelligenceOrchestrator';

export interface PresentationAssetIntelligencePanelProps {
  templateId?: string;
}

export const PresentationAssetIntelligencePanel: React.FC<PresentationAssetIntelligencePanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('boardroom-ready executive asset system');
  const state = useMemo(() => buildPresentationAssetIntelligenceState({ templateId, query }), [templateId, query]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <BrainCircuit className="h-3.5 w-3.5" /> Asset Intelligence
          </div>
          <h3 className="text-xl font-black">One asset brain for the whole studio</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Combines readiness, governance, library assets, drop zones, variants, extended systems, objects, graph styles, data-story blocks, and imagery directives.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{state.matchingAssets}</div>
          <div className="text-xs font-bold">matches</div>
        </div>
      </div>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Describe the asset system you need..."
          className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(state.sections).slice(0, 9).map(([key, value]) => (
          <article key={key} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">{key}</div>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs text-muted-foreground">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        <div className="flex items-center gap-2 font-black"><Copy className="h-4 w-4" /> Orchestrated prompt ready</div>
        <p className="mt-1 text-primary/90">This panel gives generation and editing flows one consolidated asset instruction block instead of scattered asset logic.</p>
      </div>
    </section>
  );
};
