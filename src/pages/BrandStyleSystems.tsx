import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CloudDownload, CloudUpload, Layers3, RefreshCw, Save, Sparkles } from 'lucide-react';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
import { getBrandGuideAssetsForProfile } from '@/services/brandAssetLibraryService';
import type { BrandStyleSystemId } from '@/services/brandStyleSystemService';
import { brandStyleSystems, getActiveBrandStyleSystems, getStoredBrandStyleSystemIds, inferBrandStyleSystemIds, setBrandStyleSystemIds } from '@/services/brandStyleSystemService';
import { pullBrandStyleSystemsFromCloud, syncBrandStyleSystemsToCloud } from '@/services/brandCreativeDirectionCloudService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const allStyleSystems = Object.values(brandStyleSystems);

const BrandStyleSystems: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const initialProfile = getActiveBrandProfile();
  const [profileId, setProfileId] = useState(initialProfile.id);
  const activeProfile = profiles.find((profile) => profile.id === profileId) || initialProfile;
  const assets = useMemo(() => getBrandGuideAssetsForProfile(activeProfile.id), [activeProfile.id]);
  const inferredIds = useMemo(() => inferBrandStyleSystemIds(activeProfile, assets), [activeProfile, assets]);
  const storedIds = getStoredBrandStyleSystemIds(activeProfile.id);
  const [selectedIds, setSelectedIds] = useState<BrandStyleSystemId[]>(storedIds?.length ? storedIds : inferredIds);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('Cloud style systems have not synced this session.');
  const activeSystems = useMemo(() => getActiveBrandStyleSystems(activeProfile, assets), [activeProfile, assets, refreshKey]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleProfileChange = (nextProfileId: string) => {
    const profile = setActiveBrandProfile(nextProfileId);
    const nextAssets = getBrandGuideAssetsForProfile(profile.id);
    const nextStored = getStoredBrandStyleSystemIds(profile.id);
    const nextInferred = inferBrandStyleSystemIds(profile, nextAssets);
    setProfileId(profile.id);
    setSelectedIds(nextStored?.length ? nextStored : nextInferred);
  };

  const toggle = (id: BrandStyleSystemId) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const save = async () => {
    setBrandStyleSystemIds(activeProfile.id, selectedIds);
    refresh();
    toast.success('Brand style systems saved');
    try {
      const result = await syncBrandStyleSystemsToCloud(activeProfile);
      setCloudMessage(result.message);
    } catch (error) {
      console.warn('Style system cloud sync failed:', error);
      setCloudMessage('Saved locally. Cloud sync can be retried.');
    }
  };

  const useInferred = async () => {
    setSelectedIds(inferredIds);
    setBrandStyleSystemIds(activeProfile.id, inferredIds);
    refresh();
    toast.success('Inferred style systems applied');
    try {
      const result = await syncBrandStyleSystemsToCloud(activeProfile);
      setCloudMessage(result.message);
    } catch (error) {
      console.warn('Style system cloud sync failed:', error);
    }
  };

  const pullCloud = async () => {
    setIsCloudSyncing(true);
    try {
      const result = await pullBrandStyleSystemsFromCloud(activeProfile, true);
      setCloudMessage(result.message);
      const pulledStored = getStoredBrandStyleSystemIds(activeProfile.id);
      if (pulledStored?.length) setSelectedIds(pulledStored);
      refresh();
      result.ok ? toast.success(result.message) : toast.error(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloud pull failed';
      setCloudMessage(message);
      toast.error(message);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const syncCloud = async () => {
    setIsCloudSyncing(true);
    try {
      setBrandStyleSystemIds(activeProfile.id, selectedIds);
      const result = await syncBrandStyleSystemsToCloud(activeProfile);
      setCloudMessage(result.message);
      result.ok ? toast.success(result.message) : toast.error(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloud sync failed';
      setCloudMessage(message);
      toast.error(message);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-brain" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Brain</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><Layers3 className="h-4 w-4" /> Full Brand Set Style Systems</div>
            <h1 className="text-3xl font-bold tracking-tight">{activeProfile.name}</h1>
            <p className="text-muted-foreground mt-1">Choose the style systems that control the full brand set across banners, social, signage, decks, badges, merch, apparel, and environmental graphics.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={activeProfile.id} onChange={(event) => handleProfileChange(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <button onClick={pullCloud} disabled={isCloudSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><CloudDownload className="h-4 w-4" /> Pull</button>
            <button onClick={syncCloud} disabled={isCloudSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><CloudUpload className="h-4 w-4" /> Sync</button>
            <button onClick={useInferred} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary"><RefreshCw className="h-4 w-4" /> Use inferred</button>
            <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" /> Save</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Selected systems</div><div className="text-3xl font-bold">{selectedIds.length}</div></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Inferred from brain</div><div className="text-3xl font-bold">{inferredIds.length}</div></div>
          <div className="rounded-2xl border border-border bg-card p-4"><div className="text-sm text-muted-foreground">Active assets influencing style</div><div className="text-3xl font-bold">{assets.length}</div></div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Currently active in generation</div>
          <div className="flex flex-wrap gap-2">
            {activeSystems.map((system) => <span key={system.id} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">{system.name}</span>)}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{cloudMessage}</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {allStyleSystems.map((system) => {
            const selected = selectedIds.includes(system.id);
            const inferred = inferredIds.includes(system.id);
            return (
              <button
                key={system.id}
                type="button"
                onClick={() => toggle(system.id)}
                className={cn(
                  'rounded-3xl border bg-card p-5 text-left shadow-sm transition hover:bg-secondary/60',
                  selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">{system.name}{selected && <CheckCircle2 className="h-4 w-4 text-primary" />}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{system.description}</p>
                  </div>
                  {inferred && <span className="rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">inferred</span>}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{system.fullSetBehavior}</p>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                  <div><strong className="text-foreground">Visual DNA:</strong> {system.visualDNA.slice(0, 3).join(', ')}</div>
                  <div><strong className="text-foreground">Best for:</strong> {system.bestFor.slice(0, 4).join(', ')}</div>
                  <div><strong className="text-foreground">Avoid:</strong> {system.avoid.slice(0, 3).join(', ')}</div>
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default BrandStyleSystems;
