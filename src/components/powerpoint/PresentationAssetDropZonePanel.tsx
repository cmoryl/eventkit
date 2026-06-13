import React, { useMemo } from 'react';
import { ImagePlus, Layers3, ShieldCheck } from 'lucide-react';
import { getPresentationAssetDropZoneSummary } from '@/services/presentationAssetDropZoneService';

export const PresentationAssetDropZonePanel: React.FC = () => {
  const summary = useMemo(() => getPresentationAssetDropZoneSummary(), []);

  return (
    <section className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <Layers3 className="h-3.5 w-3.5" /> Drop Zone Map
          </div>
          <h3 className="text-xl font-black">Template asset slots</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Inventory of image, logo, icon, and QR drop zones available across premium presentation templates.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right">
          <div className="text-2xl font-black text-primary">{summary.totalDropZones}</div>
          <div className="text-xs font-bold text-primary">total slots</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="rounded-2xl bg-muted p-3 text-center"><div className="font-black">{summary.templatesWithDropZones}</div><div className="text-xs text-muted-foreground">templates</div></div>
        <div className="rounded-2xl bg-muted p-3 text-center"><ImagePlus className="mx-auto mb-1 h-4 w-4" /><div className="font-black">{summary.imageZones}</div><div className="text-xs text-muted-foreground">images</div></div>
        <div className="rounded-2xl bg-muted p-3 text-center"><ShieldCheck className="mx-auto mb-1 h-4 w-4" /><div className="font-black">{summary.logoZones}</div><div className="text-xs text-muted-foreground">logos</div></div>
        <div className="rounded-2xl bg-muted p-3 text-center"><div className="font-black">{summary.iconZones}</div><div className="text-xs text-muted-foreground">icons</div></div>
        <div className="rounded-2xl bg-muted p-3 text-center"><div className="font-black">{summary.qrZones}</div><div className="text-xs text-muted-foreground">QR</div></div>
      </div>
    </section>
  );
};
