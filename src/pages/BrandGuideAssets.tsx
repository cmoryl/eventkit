import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image, Layers, ShieldCheck, Star, Trash2, Upload } from 'lucide-react';
import type { BrandGuideAsset, BrandGuideAssetType, BrandGuideAssetUsage } from '@/services/brandAssetLibraryService';
import { deleteBrandGuideAsset, fileToBrandGuideAsset, getBrandGuideAssetsForProfile, inferBrandAssetType, inferBrandAssetUsage, saveBrandGuideAsset, setPrimaryBrandLogoAsset } from '@/services/brandAssetLibraryService';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const typeOptions: BrandGuideAssetType[] = [
  'primary-logo',
  'secondary-logo',
  'transparent-png',
  'svg-mark',
  'photography',
  'illustration',
  'pattern',
  'texture',
  'icon',
  'product',
  'campaign-reference',
  'do-example',
  'dont-example',
];

const usageOptions: BrandGuideAssetUsage[] = [
  'logo-overlay',
  'generation-reference',
  'background-system',
  'pattern-system',
  'icon-system',
  'layout-reference',
  'style-reference',
  'restricted-reference',
];

const getUsageBadgeClass = (usage: BrandGuideAssetUsage) => {
  if (usage === 'logo-overlay') return 'bg-primary/10 text-primary border-primary/20';
  if (usage === 'restricted-reference') return 'bg-destructive/10 text-destructive border-destructive/20';
  if (usage.includes('system')) return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
  return 'bg-secondary text-muted-foreground border-border';
};

const AssetCard: React.FC<{
  asset: BrandGuideAsset;
  onDelete: (id: string) => void;
  onPrimary: (id: string) => void;
}> = ({ asset, onDelete, onPrimary }) => {
  const isVisual = asset.mimeType.startsWith('image/') || asset.mimeType.includes('svg');
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-secondary/40 flex items-center justify-center">
        {isVisual ? <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" /> : <Image className="h-10 w-10 text-muted-foreground" />}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{asset.name}</h3>
            {asset.isPrimary && <Star className="h-4 w-4 fill-primary text-primary" />}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{asset.fileName}</p>
        </div>
        <button onClick={() => onDelete(asset.id)} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{asset.type}</span>
        <span className={cn('rounded-full border px-2.5 py-1 text-xs', getUsageBadgeClass(asset.usage))}>{asset.usage}</span>
      </div>
      {asset.tags.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Tags: {asset.tags.join(', ')}</p>}
      {asset.notes && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{asset.notes}</p>}
      {(asset.type.includes('logo') || asset.usage === 'logo-overlay' || asset.type === 'svg-mark') && (
        <button onClick={() => onPrimary(asset.id)} className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary">
          {asset.isPrimary ? 'Primary logo' : 'Set as primary logo'}
        </button>
      )}
    </div>
  );
};

const BrandGuideAssets: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const initialProfile = getActiveBrandProfile();
  const [profileId, setProfileId] = useState(initialProfile.id);
  const activeProfile = profiles.find((profile) => profile.id === profileId) || initialProfile;
  const [refreshKey, setRefreshKey] = useState(0);
  const [assetType, setAssetType] = useState<BrandGuideAssetType>('photography');
  const [usage, setUsage] = useState<BrandGuideAssetUsage>('generation-reference');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);

  const assets = useMemo(() => getBrandGuideAssetsForProfile(activeProfile.id), [activeProfile.id, refreshKey]);
  const filteredAssets = assets.filter((asset) => filter === 'all' || asset.usage === filter || asset.type === filter);
  const primaryLogo = assets.find((asset) => asset.isPrimary) || assets.find((asset) => asset.usage === 'logo-overlay');

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleProfileChange = (nextProfileId: string) => {
    const profile = setActiveBrandProfile(nextProfileId);
    setProfileId(profile.id);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    try {
      const tagList = tags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const uploaded = await Promise.all(Array.from(files).map(async (file, index) => {
        const inferredType = assetType || inferBrandAssetType(file);
        const inferredUsage = usage || inferBrandAssetUsage(inferredType);
        const shouldBePrimary = inferredUsage === 'logo-overlay' && !primaryLogo && index === 0;
        const asset = await fileToBrandGuideAsset({
          file,
          brandProfileId: activeProfile.id,
          type: inferredType,
          usage: inferredUsage,
          tags: tagList,
          notes,
          isPrimary: shouldBePrimary,
        });
        return saveBrandGuideAsset(asset);
      }));
      toast.success(`${uploaded.length} brand asset${uploaded.length === 1 ? '' : 's'} added`);
      refresh();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Brand asset upload failed:', error);
      toast.error('Brand asset upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (assetId: string) => {
    deleteBrandGuideAsset(assetId);
    refresh();
    toast.success('Brand asset deleted');
  };

  const handlePrimary = (assetId: string) => {
    setPrimaryBrandLogoAsset(activeProfile.id, assetId);
    refresh();
    toast.success('Primary logo source updated');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Library</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><Layers className="h-4 w-4" /> Brand Guide Assets</div>
            <h1 className="text-3xl font-bold tracking-tight">Comprehensive Brand Asset Library</h1>
            <p className="text-muted-foreground mt-1">Upload logos, transparent PNGs, SVGs, patterns, visuals, references, do/don’t examples, and production assets for generation.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={activeProfile.id} onChange={(event) => handleProfileChange(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><Upload className="h-4 w-4" /> {isUploading ? 'Uploading...' : 'Add assets'}</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 grid gap-8 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold mb-4"><Upload className="h-4 w-4 text-primary" /> Upload settings</div>
            <input ref={fileInputRef} type="file" accept="image/*,.svg" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Asset type</span>
                <select value={assetType} onChange={(event) => setAssetType(event.target.value as BrandGuideAssetType)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  {typeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Usage</span>
                <select value={usage} onChange={(event) => setUsage(event.target.value as BrandGuideAssetUsage)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  {usageOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Tags</span>
                <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="hero, blue, abstract, approved" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Notes</span>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="How should this asset influence generation?" className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 font-semibold mb-4"><ShieldCheck className="h-4 w-4 text-primary" /> Generation behavior</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Primary logo:</strong> exact source logo is composited after generation so it never drifts.</p>
              <p><strong className="text-foreground">Visual refs:</strong> photos, illustrations, products, and transparent PNGs influence look, mood, composition, and motif language.</p>
              <p><strong className="text-foreground">Patterns/textures:</strong> used as background and system references across asset families.</p>
              <p><strong className="text-foreground">Do/don’t examples:</strong> teach the generator what to follow and what to avoid.</p>
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Assets</div><div className="text-3xl font-bold">{assets.length}</div></div>
            <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Logo sources</div><div className="text-3xl font-bold">{assets.filter((asset) => asset.usage === 'logo-overlay').length}</div></div>
            <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Visual refs</div><div className="text-3xl font-bold">{assets.filter((asset) => asset.usage === 'generation-reference').length}</div></div>
            <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Patterns</div><div className="text-3xl font-bold">{assets.filter((asset) => asset.usage === 'pattern-system').length}</div></div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{activeProfile.name}</div>
              <p className="text-sm text-muted-foreground">Primary logo source: {primaryLogo?.name || 'not set yet'}</p>
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All assets</option>
              {[...usageOptions, ...typeOptions].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredAssets.map((asset) => <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} onPrimary={handlePrimary} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Image className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-bold">No brand assets yet</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Add logos, PNGs, SVGs, image references, patterns, and do/don’t examples so this brand can learn and generate more accurate asset systems.</p>
              <button onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Add first assets</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BrandGuideAssets;
