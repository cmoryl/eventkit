import React, { useMemo, useState } from 'react';
import { Box, Layers3, PlusCircle, Search, Sparkles } from 'lucide-react';
import { PREBUILT_PRESENTATION_OBJECTS, getPrebuiltObjectsForTemplate } from './prebuiltPresentationObjects';

export interface PrebuiltPresentationObjectsPanelProps {
  templateId?: string;
}

export const PrebuiltPresentationObjectsPanel: React.FC<PrebuiltPresentationObjectsPanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const objects = useMemo(() => {
    const source = templateId ? getPrebuiltObjectsForTemplate(templateId) : PREBUILT_PRESENTATION_OBJECTS;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((object) => [object.name, object.kind, object.description, ...object.bestFor].join(' ').toLowerCase().includes(q));
  }, [query, templateId]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Box className="h-3.5 w-3.5" /> Object Library
          </div>
          <h3 className="text-xl font-black">Prebuilt objects for deck files</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Insert reusable, editable PowerPoint objects like KPI cards, timelines, QR CTAs, device mockups, logo rails, and approval stamps.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{objects.length}</div>
          <div className="text-xs font-bold">objects</div>
        </div>
      </div>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search KPI, timeline, quote, QR, logo rail, mockup..."
          className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {objects.map((object) => (
          <article key={object.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><Layers3 className="h-3.5 w-3.5" /> {object.kind}</div>
                <h4 className="mt-2 font-black">{object.name}</h4>
              </div>
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{object.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {object.bestFor.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{tag}</span>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <span className="font-black text-primary">Treatment:</span> {object.visualTreatment}
            </div>
          </article>
        ))}
        {objects.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6" /> No objects match this search.
          </div>
        )}
      </div>
    </section>
  );
};
