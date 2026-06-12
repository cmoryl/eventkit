import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, CloudDownload, CloudUpload, Images, LibraryBig, ShieldCheck, Sparkles } from 'lucide-react';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
import { getBrandAssetGenerationContext, getBrandGuideAssetsForProfile } from '@/services/brandAssetLibraryService';
import { pullBrandGuideAssetsFromCloud, syncBrandGuideAssetsToCloud } from '@/services/brandAssetCloudService';
import { evaluateBrandProfileHealth } from '@/services/brandProfileHealthService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statClass = 'rounded-2xl border border-border bg-card p-4 shadow-sm';

const BrandBrain: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const initialProfile = getActiveBrandProfile();
  const [profileId, setProfileId] = useState(initialProfile.id);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('Cloud brain has not been checked this session.');

  const activeProfile = profiles.find((profile) => profile.id === profileId) || initialProfile;
  const assets = useMemo(() => getBrandGuideAssetsForProfile(activeProfile.id), [activeProfile.id, refreshKey]);
  const context = useMemo(() => getBrandAssetGenerationContext(activeProfile.id, activeProfile), [activeProfile, refreshKey]);
  const health = useMemo(() => evaluateBrandProfileHealth(activeProfile), [activeProfile]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleProfileChange = (nextProfileId: string) => {
    const profile = setActiveBrandProfile(nextProfileId);
    setProfileId(profile.id);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncBrandGuideAssetsToCloud(activeProfile);
      setCloudMessage(result.message);
      result.ok ? toast.success(result.message) : toast.error(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloud sync failed';
      setCloudMessage(message);
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async () => {
    setIsSyncing(true);
    try {
      const result = await pullBrandGuideAssetsFromCloud(activeProfile, true);
      setCloudMessage(result.message);
      result.ok ? toast.success(result.message) : toast.error(result.message);
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cloud pull failed';
      setCloudMessage(message);
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const readiness = Math.round((health.score + Math.min(100, assets.length * 8)) / 2);
  const readinessLabel = readiness >= 85 ? 'Production-ready brain' : readiness >= 65 ? 'Usable brain' : 'Needs more training assets';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Library</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><Brain className="h-4 w-4" /> Brand Brain</div>
            <h1 className="text-3xl font-bold tracking-tight">{activeProfile.name}</h1>
            <p className="text-muted-foreground mt-1">One centralized brain combining brand rules, uploaded assets, exact-logo sources, reference visuals, patterns, and generation behavior.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={activeProfile.id} onChange={(event) => handleProfileChange(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <button onClick={handlePull} disabled={isSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><CloudDownload className="h-4 w-4" /> Pull</button>
            <button onClick={handleSync} disabled={isSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"><CloudUpload className="h-4 w-4" /> Sync</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-4">
          <div className={statClass}><div className="text-sm text-muted-foreground">Brain readiness</div><div className="text-3xl font-bold">{readiness}</div><div className="mt-1 text-xs text-muted-foreground">{readinessLabel}</div></div>
          <div className={statClass}><div className="text-sm text-muted-foreground">Profile health</div><div className="text-3xl font-bold">{health.score}</div><div className="mt-1 text-xs capitalize text-muted-foreground">{health.status.replace(/-/g, ' ')}</div></div>
          <div className={statClass}><div className="text-sm text-muted-foreground">Guide assets</div><div className="text-3xl font-bold">{assets.length}</div><div className="mt-1 text-xs text-muted-foreground">logos, refs, patterns, examples</div></div>
          <div className={statClass}><div className="text-sm text-muted-foreground">Primary logo</div><div className="text-3xl font-bold">{context.primaryLogo ? 'Set' : 'Missing'}</div><div className="mt-1 text-xs text-muted-foreground">{context.primaryLogo?.name || 'add a source logo'}</div></div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 font-semibold mb-4"><Sparkles className="h-4 w-4 text-primary" /> What enters generation</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Logo sources', context.logos.length, 'Exact source logos and SVG marks used for deterministic overlay.'],
                ['Visual references', context.visualReferences.length, 'Photography, illustrations, products, and PNGs used for look and feel.'],
                ['Pattern references', context.patternReferences.length, 'Patterns/textures used for recurring background systems.'],
                ['Layout references', context.layoutReferences.length, 'Approved layouts that guide hierarchy and spacing.'],
                ['Do examples', context.doExamples.length, 'Positive examples the generator should learn from.'],
                ['Don’t examples', context.dontExamples.length, 'Negative examples the generator must avoid.'],
              ].map(([label, value, description]) => (
                <div key={label} className="rounded-2xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="mt-1 text-2xl font-bold">{value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold mb-3"><CloudUpload className="h-4 w-4 text-primary" /> Cloud status</div>
              <p className="text-sm text-muted-foreground">{cloudMessage}</p>
              <p className="mt-3 text-xs text-muted-foreground">Generation can hydrate from Supabase when configured and signed in, then falls back to local browser storage if cloud is unavailable.</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold mb-3"><ShieldCheck className="h-4 w-4 text-primary" /> Hard rules</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Exact logos are never recreated by AI.</li>
                <li>Uploaded SVG/PNG marks are authoritative source assets.</li>
                <li>Don’t examples are negative guidance only.</li>
                <li>Brand profile rules and guide assets both feed the brain.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-semibold"><Images className="h-4 w-4 text-primary" /> Recent brand assets</div>
              <p className="text-sm text-muted-foreground mt-1">A quick view into the active brand brain.</p>
            </div>
            <Link to="/brand-assets" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-secondary"><LibraryBig className="h-4 w-4" /> Manage assets</Link>
          </div>
          {assets.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {assets.slice(0, 8).map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-border bg-background p-3">
                  <div className="aspect-[4/3] rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                    {asset.mimeType.startsWith('image/') || asset.mimeType.includes('svg') ? <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" /> : <Images className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div className="mt-3 truncate text-sm font-semibold">{asset.name}</div>
                  <div className={cn('mt-1 text-xs text-muted-foreground')}>{asset.type} · {asset.usage}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No assets yet. Add logos, references, patterns, and examples to train this brand brain.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BrandBrain;
