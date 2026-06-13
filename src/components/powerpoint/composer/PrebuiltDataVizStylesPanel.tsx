import React, { useMemo, useState } from 'react';
import { AreaChart, BarChart3, Filter, Search, Sparkles } from 'lucide-react';
import { PREBUILT_DATA_VIZ_STYLES, getDataVizStylesForTemplate, type PrebuiltDataVizStyleKind } from './prebuiltDataVizStyles';

export interface PrebuiltDataVizStylesPanelProps {
  templateId?: string;
}

const kindLabels: Array<{ id: PrebuiltDataVizStyleKind | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'executive-scorecard', label: 'Scorecards' },
  { id: 'comparison-chart', label: 'Compare' },
  { id: 'trend-chart', label: 'Trends' },
  { id: 'status-grid', label: 'Grids' },
  { id: 'flow-diagram', label: 'Flows' },
  { id: 'decision-matrix', label: 'Matrix' },
  { id: 'geo-visual', label: 'Geo' },
  { id: 'micro-chart', label: 'Micro' },
];

export const PrebuiltDataVizStylesPanel: React.FC<PrebuiltDataVizStylesPanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<PrebuiltDataVizStyleKind | 'all'>('all');

  const styles = useMemo(() => {
    const source = templateId ? getDataVizStylesForTemplate(templateId) : PREBUILT_DATA_VIZ_STYLES;
    const q = query.trim().toLowerCase();
    return source.filter((style) => {
      const matchesKind = kind === 'all' || style.kind === kind;
      const matchesQuery = !q || [style.name, style.description, style.kind, ...style.bestFor, ...style.dataInputs].join(' ').toLowerCase().includes(q);
      return matchesKind && matchesQuery;
    });
  }, [query, kind, templateId]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <AreaChart className="h-3.5 w-3.5" /> Graph Style Library
          </div>
          <h3 className="text-xl font-black">Prebuilt graph and visual data styles</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Presentation-ready data visualization patterns for scorecards, trends, heatmaps, waterfalls, funnels, geo maps, matrices, flows, and micro charts.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{styles.length}</div>
          <div className="text-xs font-bold">styles</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search waterfall, heatmap, scorecard, funnel, map, sparkline..."
            className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {kindLabels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black ${kind === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {styles.map((style) => (
          <article key={style.id} className="overflow-hidden rounded-2xl border border-border bg-background/80">
            <div className="relative h-24 border-b border-border bg-muted">
              <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(circle at 18% 22%, hsl(var(--primary) / 0.18), transparent 35%), linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))' }} />
              <div className="absolute inset-x-4 bottom-4 flex items-end gap-2">
                {[28, 52, 38, 72, 56].map((height, index) => (
                  <span key={index} className="flex-1 rounded-t bg-primary/70" style={{ height }} />
                ))}
                <BarChart3 className="ml-2 h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><Filter className="h-3.5 w-3.5" /> {style.kind}</div>
              <h4 className="mt-2 font-black">{style.name}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{style.description}</p>
              <div className="mt-3 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
                <span className="font-black text-primary">Annotation:</span> {style.annotationPattern}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {style.dataInputs.slice(0, 4).map((input) => <span key={input} className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{input}</span>)}
              </div>
            </div>
          </article>
        ))}
        {styles.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6" /> No graph styles match this search.
          </div>
        )}
      </div>
    </section>
  );
};
