import React from 'react';
import { CheckCircle2, MonitorPlay, Sparkles } from 'lucide-react';
import type { DeckTemplate } from './TemplateGallery';
import { getGalleryImageAsset } from './galleryImageAssets';

export interface TemplateGeneratedImagePosterPreviewProps {
  template: DeckTemplate;
  dense?: boolean;
}

export const TemplateGeneratedImagePosterPreview: React.FC<TemplateGeneratedImagePosterPreviewProps> = ({ template, dense }) => {
  const asset = getGalleryImageAsset(template.id);

  if (!asset) {
    return null;
  }

  return (
    <article className={`group relative overflow-hidden rounded-[32px] border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${dense ? 'min-h-[220px]' : 'min-h-[310px]'}`} style={{ color: template.palette.text }}>
      <img src={asset.src} alt={asset.alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/5 to-black/65" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md">Generated visual</span>
          <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md">{asset.kind}</span>
        </div>
        <div className="max-w-[75%]">
          <div className="mb-3 flex items-center gap-2"><span className="h-1 w-14 rounded-full" style={{ background: template.palette.accent }} /><Sparkles className="h-4 w-4 opacity-80" /></div>
          <h3 className={`font-black leading-[0.92] tracking-tight drop-shadow-sm ${dense ? 'text-xl' : 'text-3xl'}`}>{template.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm font-semibold opacity-85">{template.description}</p>
        </div>
        <div className="flex items-center justify-between text-xs font-bold opacity-90">
          <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Image-backed system</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Ready</span>
        </div>
      </div>
    </article>
  );
};
