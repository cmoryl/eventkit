import React, { useMemo, useState } from 'react';
import { Compass, Layers3, Sparkles } from 'lucide-react';
import { TEMPLATE_GALLERY_COLLECTIONS, getTemplateGalleryCollection } from '@/services/templateGalleryCurationService';
import { TemplateGeneratedImagePosterPreview } from './TemplateGeneratedImagePosterPreview';
import { TemplatePosterPreview } from './TemplatePosterPreview';

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
        <div className="mt-3 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-5">
            <div className="absolute inset-0 opacity-70" style={{ background: 'radial-gradient(circle at 18% 18%, hsl(var(--primary) / 0.16), transparent 32%), radial-gradient(circle at 86% 10%, hsl(var(--accent) / 0.16), transparent 28%)' }} />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Active collection</div>
                <div className="mt-2 text-2xl font-black">{active.label}</div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{active.description}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-black text-primary">{active.templateIds.length} systems</div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {active.advancedTemplates.map((template) => (
              <TemplateGeneratedImagePosterPreview key={template.id} template={template} dense />
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
