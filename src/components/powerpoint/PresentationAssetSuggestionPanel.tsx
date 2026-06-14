import React, { useMemo, useState } from 'react';
import { Boxes, ImagePlus, Search, Sparkles } from 'lucide-react';
import { getPresentationAssetSuggestionCount, getPresentationAssetSuggestions } from '@/services/presentationAssetSuggestionService';
import type { PresentationAssetSlot } from '@/config/editableTemplates/presentationDragDropAssetKits';

const commonSlots: PresentationAssetSlot[] = ['hero', 'logo', 'product-render', 'device-mockup', 'chart', 'gallery', 'icon', 'qr'];

export const PresentationAssetSuggestionPanel: React.FC<{ templateId?: string }> = ({ templateId }) => {
  const [query, setQuery] = useState('');
  const [slot, setSlot] = useState<PresentationAssetSlot | undefined>();

  const counts = useMemo(() => getPresentationAssetSuggestionCount(), []);
  const suggestions = useMemo(() => getPresentationAssetSuggestions({ templateId, query, slot, limit: 8 }), [templateId, query, slot]);

  return (
    <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <ImagePlus className="h-3.5 w-3.5" /> Asset Intelligence
          </div>
          <h3 className="text-xl font-black">Drag/drop asset recommendations</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Match premium templates with the right logos, images, renders, charts, maps, icons, QR codes, and gallery assets.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-muted px-3 py-2"><div className="font-black text-foreground">{counts.kits}</div><div className="text-muted-foreground">kits</div></div>
          <div className="rounded-2xl bg-muted px-3 py-2"><div className="font-black text-foreground">{counts.kitItems}</div><div className="text-muted-foreground">assets</div></div>
          <div className="rounded-2xl bg-muted px-3 py-2"><div className="font-black text-foreground">{counts.examples}</div><div className="text-muted-foreground">examples</div></div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assets: dashboard, logo, venue, product, map..."
            className="h-11 w-full rounded-2xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSlot(undefined)}
            className={`rounded-full px-3 py-2 text-xs font-bold ${slot ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}
          >
            All
          </button>
          {commonSlots.map((slotName) => (
            <button
              key={slotName}
              type="button"
              onClick={() => setSlot(slotName)}
              className={`rounded-full px-3 py-2 text-xs font-bold ${slot === slotName ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              {slotName}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {suggestions.kitItems.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <Boxes className="h-3.5 w-3.5" /> {item.slot}
            </div>
            <div className="mt-2 font-black">{item.label}</div>
            <p className="mt-1 text-sm text-muted-foreground">{item.usage}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.formats.map((format) => <span key={format} className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{format}</span>)}
            </div>
          </div>
        ))}
      </div>

      {suggestions.examples.length > 0 && (
        <div className="mt-4 rounded-2xl bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Example assets</div>
          <div className="grid gap-2 md:grid-cols-2">
            {suggestions.examples.map((example) => (
              <div key={example.id} className="text-sm">
                <span className="font-bold text-foreground">{example.label}</span>
                <span className="text-muted-foreground"> — {example.recommendedUse}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
