import React, { useMemo, useState } from 'react';
import { Grid2X2, Search, Sparkles } from 'lucide-react';
import { PRESENTATION_EXTENDED_SYSTEM_ASSETS, getExtendedSystemAssetsForTemplate, type PresentationExtendedSystemAssetCategory } from '@/config/editableTemplates/presentationExtendedSystemAssets';

export interface PresentationExtendedSystemAssetsPanelProps {
  templateId?: string;
}

const categories: Array<PresentationExtendedSystemAssetCategory | 'all'> = ['all', 'master-system', 'navigation-system', 'data-system', 'governance-system', 'global-system', 'export-system', 'accessibility-system', 'motion-system', 'workshop-system', 'cta-system'];

export const PresentationExtendedSystemAssetsPanel: React.FC<PresentationExtendedSystemAssetsPanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PresentationExtendedSystemAssetCategory | 'all'>('all');

  const assets = useMemo(() => {
    const source = templateId ? getExtendedSystemAssetsForTemplate(templateId) : PRESENTATION_EXTENDED_SYSTEM_ASSETS;
    const q = query.trim().toLowerCase();
    return source.filter((asset) => {
      const matchesCategory = category === 'all' || asset.category === category;
      const searchText = [asset.name, asset.description, asset.category, ...asset.components, ...asset.variants, ...asset.usageRules].join(' ').toLowerCase();
      return matchesCategory && (!q || searchText.includes(q));
    });
  }, [query, category, templateId]);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Grid2X2 className="h-3.5 w-3.5" /> Extended Assets
          </div>
          <h3 className="text-xl font-black">Extended system assets</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            System-level assets for master slides, navigation, data annotation, governance, global/localization, export, accessibility, motion cues, workshops, and CTAs.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary">
          <div className="text-2xl font-black">{assets.length}</div>
          <div className="text-xs font-bold">systems</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search master, navigation, data, governance, global, export, accessibility..."
            className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black ${category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}
            >
              {item.replace('-system', '').replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">{asset.category}</div>
                <h4 className="mt-1 text-lg font-black">{asset.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{asset.description}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{asset.slots.join(', ')}</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground"><span className="font-black text-primary">Components:</span> {asset.components.join(' · ')}</div>
              <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground"><span className="font-black text-primary">Variants:</span> {asset.variants.join(' · ')}</div>
            </div>
          </article>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6" /> No extended system assets match this search.
          </div>
        )}
      </div>
    </section>
  );
};
