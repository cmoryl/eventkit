import React, { useMemo, useState } from 'react';
import { ExternalLink, Image as ImageIcon, Library, Link2, Search, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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

type AssetSourceFilter = 'all' | 'current' | 'brandImagery' | 'brandHub';

interface AssetPreview {
  id: string;
  url: string;
  label: string;
  source: string;
  category: string;
  sourceFilter: AssetSourceFilter;
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

const SOURCE_FILTERS: Array<{ value: AssetSourceFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'current', label: 'Slide' },
  { value: 'brandImagery', label: 'Brand' },
  { value: 'brandHub', label: 'Hub' },
];

const normalizeCategory = (category: string) => CATEGORY_LABELS[category] || category.replace(/[-_]/g, ' ');
const isWebUrl = (value: string) => /^https?:\/\//i.test(value.trim());

export const SlideAssetSearchPanel: React.FC<SlideAssetSearchPanelProps> = ({ slide, brandImagery, brandFiles = [], onApplyImage, onOpenAssetLibrary }) => {
  const [query, setQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [sourceFilter, setSourceFilter] = useState<AssetSourceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const assets = useMemo<AssetPreview[]>(() => {
    const fromImagery = Object.entries(brandImagery || {}).flatMap(([category, urls]) =>
      (urls || []).map((url, index) => ({
        id: `brand-${category}-${index}`,
        url,
        label: `${CATEGORY_LABELS[category] || category} ${index + 1}`,
        source: 'Brand imagery',
        category,
        sourceFilter: 'brandImagery' as const,
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
        sourceFilter: 'brandHub' as const,
      }));

    const current = (slide.images || (slide.imageUrl ? [slide.imageUrl] : [])).map((url, index) => ({
      id: `slide-${index}`,
      url,
      label: `Current slide image ${index + 1}`,
      source: 'Active slide',
      category: 'current',
      sourceFilter: 'current' as const,
    }));

    return [...current, ...fromImagery, ...fromFiles];
  }, [brandFiles, brandImagery, slide.imageUrl, slide.images]);

  const sourceCounts = useMemo(() => ({
    all: assets.length,
    current: assets.filter((asset) => asset.sourceFilter === 'current').length,
    brandImagery: assets.filter((asset) => asset.sourceFilter === 'brandImagery').length,
    brandHub: assets.filter((asset) => asset.sourceFilter === 'brandHub').length,
  }), [assets]);

  const sourceScopedAssets = useMemo(
    () => assets.filter((asset) => sourceFilter === 'all' || asset.sourceFilter === sourceFilter),
    [assets, sourceFilter],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of sourceScopedAssets) counts.set(asset.category, (counts.get(asset.category) || 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [sourceScopedAssets]);

  const visibleCategoryFilter = categoryFilter === 'all' || categoryCounts.some(([category]) => category === categoryFilter) ? categoryFilter : 'all';

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceScopedAssets
      .filter((asset) => visibleCategoryFilter === 'all' || asset.category === visibleCategoryFilter)
      .filter((asset) => !q || [asset.label, asset.source, asset.category, asset.url].join(' ').toLowerCase().includes(q))
      .slice(0, q ? 24 : 12);
  }, [sourceScopedAssets, query, visibleCategoryFilter]);

  const trimmedUrlInput = urlInput.trim();
  const canApplyUrl = isWebUrl(trimmedUrlInput);
  const showUrlHint = Boolean(trimmedUrlInput) && !canApplyUrl;
  const hasActiveFilters = Boolean(query.trim()) || sourceFilter !== 'all' || visibleCategoryFilter !== 'all';

  const handleSourceFilterChange = (filter: AssetSourceFilter) => {
    setSourceFilter(filter);
    setCategoryFilter('all');
  };

  const clearFilters = () => {
    setQuery('');
    setSourceFilter('all');
    setCategoryFilter('all');
  };

  const applyUrl = () => {
    if (!canApplyUrl) return;
    onApplyImage(trimmedUrlInput);
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
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onOpenAssetLibrary} aria-label="Open asset library">
            <ExternalLink className="h-3 w-3" /> Library
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-8 text-xs" placeholder="Search logos, photos, icons, web assets…" aria-label="Search assets" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SOURCE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleSourceFilterChange(filter.value)}
            aria-pressed={sourceFilter === filter.value}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
              sourceFilter === filter.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}
          >
            {filter.label} · {sourceCounts[filter.value]}
          </button>
        ))}
      </div>

      {categoryCounts.length > 0 && (
        <div className="flex max-h-[62px] flex-wrap gap-1.5 overflow-hidden rounded-lg border border-border bg-background p-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            aria-pressed={visibleCategoryFilter === 'all'}
            className={cn('rounded-md px-2 py-1 text-[10px] font-semibold transition', visibleCategoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
          >
            Any category
          </button>
          {categoryCounts.map(([category, count]) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              aria-pressed={visibleCategoryFilter === category}
              className={cn('rounded-md px-2 py-1 text-[10px] font-semibold capitalize transition', visibleCategoryFilter === category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
            >
              {normalizeCategory(category)} · {count}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground">
        <span>{filteredAssets.length} preview{filteredAssets.length === 1 ? '' : 's'} shown</span>
        {hasActiveFilters ? (
          <button type="button" onClick={clearFilters} className="font-semibold text-primary hover:underline" aria-label="Clear asset filters">
            Clear filters
          </button>
        ) : (
          <span>Click a preview to apply</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onApplyImage(asset.url)}
            aria-label={`Apply ${asset.label} from ${asset.source}`}
            className="group overflow-hidden rounded-lg border border-border bg-background text-left transition hover:border-primary/50 hover:shadow-sm"
          >
            <div className="relative aspect-video bg-muted">
              <img src={asset.url} alt={asset.label} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">Use asset</div>
            </div>
            <div className="p-2">
              <div className="truncate text-[11px] font-semibold">{asset.label}</div>
              <div className="mt-1 flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                <span className="truncate">{asset.source}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 uppercase">{normalizeCategory(asset.category)}</span>
              </div>
            </div>
          </button>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-border p-4 text-center text-[11px] text-muted-foreground">
            <ImageIcon className="mx-auto mb-2 h-5 w-5" /> No assets match this search.
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-2 block w-full text-[10px] font-semibold text-primary hover:underline" aria-label="Reset asset filters">
                Reset asset filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-background p-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold"><Link2 className="h-3 w-3 text-primary" /> Paste web image URL</div>
        <div className="flex gap-1.5">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyUrl();
            }}
            className="h-8 text-xs"
            placeholder="https://…"
            aria-label="Paste image address"
          />
          <Button type="button" size="sm" className="h-8 px-2" onClick={applyUrl} disabled={!canApplyUrl} aria-label="Use pasted image">
            <UploadCloud className="h-3.5 w-3.5" />
          </Button>
        </div>
        {showUrlHint && <p className="text-[10px] text-muted-foreground">Use a full http or https image URL.</p>}
      </div>
    </div>
  );
};
