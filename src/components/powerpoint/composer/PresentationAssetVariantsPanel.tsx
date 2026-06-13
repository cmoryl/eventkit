import React, { useMemo, useState } from 'react';
import { Boxes, Search, Sparkles } from 'lucide-react';
import { PRESENTATION_ASSET_VARIANT_FAMILIES, getPresentationAssetVariantFamiliesForTemplate } from '@/config/editableTemplates/presentationAssetVariations';

export interface PresentationAssetVariantsPanelProps {
  templateId?: string;
}

export const PresentationAssetVariantsPanel: React.FC<PresentationAssetVariantsPanelProps> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const families = useMemo(() => {
    const source = templateId ? getPresentationAssetVariantFamiliesForTemplate(templateId) : PRESENTATION_ASSET_VARIANT_FAMILIES;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((family) => [
      family.label,
      family.description,
      family.slot,
      ...family.variants.flatMap((variant) => [variant.label, variant.description, ...variant.subVariants.map((sub) => `${sub.label} ${sub.description} ${sub.promptModifier}`)]),
    ].join(' ').toLowerCase().includes(q));
  }, [query, templateId]);

  const totalVariants = families.reduce((sum, family) => sum + family.variants.length, 0);
  const totalSubVariants = families.reduce((sum, family) => sum + family.variants.reduce((inner, variant) => inner + variant.subVariants.length, 0), 0);

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Boxes className="h-3.5 w-3.5" /> Asset Variants
          </div>
          <h3 className="text-xl font-black">Asset varieties and sub-varieties</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Generate controlled visual alternatives for orbs, event heroes, data visuals, product renders, device mockups, logo rails, editorial imagery, and QR CTAs.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="rounded-2xl bg-primary/10 px-4 py-3 text-primary"><div className="text-2xl font-black">{totalVariants}</div>variants</div>
          <div className="rounded-2xl bg-primary/10 px-4 py-3 text-primary"><div className="text-2xl font-black">{totalSubVariants}</div>sub</div>
        </div>
      </div>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search orb, event hero, data, product, logo rail, QR, editorial..."
          className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {families.map((family) => (
          <article key={family.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">{family.slot}</div>
                <h4 className="mt-1 text-lg font-black">{family.label}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{family.description}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{family.variants.length} variants</span>
            </div>
            <div className="mt-4 space-y-3">
              {family.variants.map((variant) => (
                <div key={variant.id} className="rounded-xl bg-muted p-3">
                  <div className="font-black">{variant.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{variant.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {variant.subVariants.map((subVariant) => (
                      <span key={subVariant.id} className="rounded-full bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground">{subVariant.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
        {families.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-6 w-6" /> No asset variants match this search.
          </div>
        )}
      </div>
    </section>
  );
};
