import React, { useMemo, useState } from 'react';
import { Layers3, Search, Sparkles } from 'lucide-react';
import { ADVANCED_DATA_STORY_BLOCKS, getAdvancedDataStoryBlocksForTemplate } from './advancedDataStoryBlocks';

export interface AdvancedDataStoryBlocksPanelProps {
  templateId?: string;
}

export const AdvancedDataStoryBlocksPanel: React.FC<AdvancedDataStoryBlocksPanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const blocks = useMemo(() => {
    const source = templateId ? getAdvancedDataStoryBlocksForTemplate(templateId) : ADVANCED_DATA_STORY_BLOCKS;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((block) => [block.name, block.description, block.complexity, ...block.bestFor, ...block.dataInputs].join(' ').toLowerCase().includes(q));
  }, [query, templateId]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Layers3 className="h-3.5 w-3.5" /> Compound Blocks
          </div>
          <h3 className="text-xl font-black">Advanced data-story building blocks</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Multi-object slide systems that combine graphs, KPI objects, imagery, annotations, and decision logic into complete editable slide structures.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{blocks.length}</div>
          <div className="text-xs font-bold">blocks</div>
        </div>
      </div>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search boardroom, AI maturity, funnel, global map, forecast, event recap..."
          className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {blocks.map((block) => (
          <article key={block.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">{block.complexity}</div>
                <h4 className="mt-2 text-lg font-black">{block.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{block.description}</p>
              </div>
              <Layers3 className="h-5 w-5 shrink-0 text-primary" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground"><span className="font-black text-primary">Narrative:</span> {block.narrativePattern}</div>
              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground"><span className="font-black text-primary">Zones:</span> {block.layoutZones.join(' · ')}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {block.graphStyles.slice(0, 4).map((style) => <span key={style} className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{style.replace('viz-', '')}</span>)}
              {block.objectBlocks.slice(0, 4).map((object) => <span key={object} className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{object.replace('object-', '')}</span>)}
            </div>
          </article>
        ))}
        {blocks.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6" /> No advanced story blocks match this search.
          </div>
        )}
      </div>
    </section>
  );
};
