import React, { useMemo, useState } from 'react';
import { ExternalLink, Image as ImageIcon, Library, Link2, Search, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BrandFile } from '@/hooks/useBrandHubFiles';
import type { SlideData } from './slideTypes';

interface BrandHubImagery {
  logos?: string[];
  brandIcons?: string[];
  patterns?: string[];
  photography?: string[];
  heroImages?: string[];
  collateral?: string[];
  social?: string[];
  banners?: string[];
  sponsors?: string[];
}

interface AssetPreview {
  id: string;
  url: string;
  label: string;
  source: string;
  category: string;
}

interface SlideAssetSearchPanelProps {
  slide: SlideData;
  brandImagery?: BrandHubImagery;
  brandFiles?: BrandFile[];
  onApplyImage: (url: string) => void;
  onOpenAssetLibrary?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  heroImages: 'Hero',
  photography: 'Photo',
  patterns: 'Pattern',
  logos: 'Logo',
  brandIcons: 'Icon',
  collateral: 'Collateral',
  social: 'Social',
  banners: 'Banner',
  sponsors: 'Sponsor',
};

export const SlideAssetSearchPanel: React.FC<SlideAssetSearchPanelProps> = ({ slide, brandImagery, brandFiles = [], onApplyImage, onOpenAssetLibrary }) => {
  const [query, setQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const assets = useMemo<AssetPreview[]>(() => {
    const fromImagery = Object.entries(brandImagery || {}).flatMap(([category, urls]) =>
      (urls || []).map((url, index) => ({
        id: `brand-${category}-${index}`,
        url,
        label: `${CATEGORY_LABELS[category] || category} ${index + 1}`,
        source: 'Brand imagery',
        category,
      })),
    );

    const fromFiles = brandFiles
      .filter((file) => file.category === 'image')
      .map((file, index) => ({
        id: `file-${index}-${file.name}`,
        url: file.thumbnailUrl || file.url,
        label: file.name,
        source: file.sourceName || file.sectionLabel || 'BrandHub',
        category: file.sectionLabel || file.ext || 'image',
      }));

    const current = (slide.images || (slide.imageUrl ? [slide.imageUrl] : [])).map((url, index) => ({
      id: `slide-${index}`,
      url,
      label: `Current slide image ${index + 1}`,
      source: 'Active slide',
      category: 'current',
    }));

    return [...current, ...fromImagery, ...fromFiles];
  }, [brandFiles, brandImagery, slide.imageUrl, slide.images]);

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets.slice(0, 12);
    return assets.filter((asset) => [asset.label, asset.source, asset.category, asset.url].join(' ').toLowerCase().includes(q)).slice(0, 20);
  }, [assets, query]);

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onApplyImage(trimmed);
    setUrlInput('');
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold"><Library className="h-3.5 w-3.5 text-primary" /> Web + brand assets</div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Search, preview, and apply approved image assets to this slide.</p>
        </div>
        {onOpenAssetLibrary && (
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onOpenAssetLibrary}>
            <ExternalLink className="h-3 w-3" /> Library
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-8 text-xs" placeholder="Search logos, photos, icons, web assets…" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onApplyImage(asset.url)}
            className="group overflow-hidden rounded-lg border border-border bg-background text-left transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="relative aspect-video bg-muted">
              <img src={asset.url} alt={asset.label} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">Use asset</div>
            </div>
            <div className="p-2">
              <div className="truncate text-[11px] font-semibold">{asset.label}</div>
              <div className="truncate text-[10px] text-muted-foreground">{asset.source}</div>
            </div>
          </button>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-5 w-5" /> No assets match this search.
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background p-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold"><Link2 className="h-3 w-3 text-primary" /> Paste web image URL</div>
        <div className="flex gap-1.5">
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="h-8 text-xs" placeholder="https://…" />
          <Button type="button" size="sm" className="h-8 px-2" onClick={applyUrl} disabled={!urlInput.trim()}>
            <UploadCloud className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
