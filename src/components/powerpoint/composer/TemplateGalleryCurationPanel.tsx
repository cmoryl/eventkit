import React, { useMemo, useState } from 'react';
import { ArrowRight, Compass, Layers3, Sparkles } from 'lucide-react';
import { TEMPLATE_GALLERY_COLLECTIONS, getTemplateGalleryCollection } from '@/services/templateGalleryCurationService';

export const TemplateGalleryCurationPanel: React.FC = () => {
  const [activeId, setActiveId] = useState(TEMPLATE_GALLERY_COLLECTIONS[0]?.id ?? '');
  const active = useMemo(() => getTemplateGalleryCollection(activeId), [activeId]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Compass className="h-3.5 w-3.5" /> Gallery Curation
          </div>
          <h3 className="text-xl font-black">Pick by mission, not just style.</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Curated template collections route users toward the right deck system for the audience, asset needs, and export goal.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{TEMPLATE_GALLERY_COLLECTIONS.length}</div>
          <div className="text-xs font-bold">collections</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {TEMPLATE_GALLERY_COLLECTIONS.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => setActiveId(collection.id)}
            className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black ${activeId === collection.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}
          >
            {collection.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl bg-muted p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Active collection</div>
            <div className="mt-2 text-lg font-black">{active.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {active.advancedTemplates.map((template) => (
              <div key={template.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{template.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 flex gap-1.5">
                  {[template.palette.bg, template.palette.accent, template.palette.secondary].map((color) => (
                    <span key={color} className="h-4 w-4 rounded-full border border-border" style={{ background: color }} />
                  ))}
                </div>
              </div>
            ))}
            {active.advancedTemplates.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <Layers3 className="mx-auto mb-2 h-5 w-5" /> Collection uses built-in gallery systems.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
