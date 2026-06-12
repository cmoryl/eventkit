import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CloudDownload, CloudUpload, FilePenLine, Plus, Save } from 'lucide-react';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
import type { BrandPromptOverride, BrandPromptOverrideScope, BrandPromptOverrideStatus } from '@/services/brandPromptOverrideService';
import { createEmptyBrandPromptOverride, getBrandPromptOverridesForProfile, joinRules, saveBrandPromptOverride, splitRules } from '@/services/brandPromptOverrideService';
import { pullBrandPromptOverridesFromCloud, syncBrandPromptOverridesToCloud } from '@/services/brandCreativeDirectionCloudService';
import type { MasterPromptFamily } from '@/services/masterfulPromptTemplateService';
import { toast } from 'sonner';

const scopes: BrandPromptOverrideScope[] = ['global', 'banner', 'social_post', 'social_story', 'presentation', 'signage', 'badge', 'lanyard', 'merchandise', 'apparel', 'backdrop', 'qr_wifi_functional', 'email_header', 'environmental', 'abstract_pattern', 'content', 'generic'];
const statuses: BrandPromptOverrideStatus[] = ['draft', 'approved', 'archived'];

const TextAreaField: React.FC<{ label: string; value: string[]; onChange: (rules: string[]) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    <textarea value={joinRules(value)} onChange={(event) => onChange(splitRules(event.target.value))} placeholder={placeholder} className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
  </label>
);

const BrandPromptOverrides: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const initialProfile = getActiveBrandProfile();
  const [profileId, setProfileId] = useState(initialProfile.id);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('Cloud prompt overrides have not synced this session.');
  const activeProfile = profiles.find((profile) => profile.id === profileId) || initialProfile;
  const overrides = useMemo(() => getBrandPromptOverridesForProfile(activeProfile.id), [activeProfile.id, refreshKey]);
  const selected = overrides.find((override) => override.id === selectedId) || overrides[0] || null;
  const [draft, setDraft] = useState<BrandPromptOverride | null>(selected);

  React.useEffect(() => setDraft(selected), [selected?.id, refreshKey]);
  const refresh = () => setRefreshKey((value) => value + 1);

  const handleProfileChange = (nextProfileId: string) => {
    const profile = setActiveBrandProfile(nextProfileId);
    setProfileId(profile.id);
    setSelectedId(null);
  };

  const createOverride = (scope: BrandPromptOverrideScope = 'global') => {
    const saved = saveBrandPromptOverride(createEmptyBrandPromptOverride(activeProfile.id, scope));
    setSelectedId(saved.id);
    setDraft(saved);
    refresh();
    toast.success('Prompt override created');
  };

  const updateDraft = (patch: Partial<BrandPromptOverride>) => setDraft((current) => current ? { ...current, ...patch } : current);

  const saveDraft = async () => {
    if (!draft) return;
    const saved = saveBrandPromptOverride(draft);
    setSelectedId(saved.id);
    setDraft(saved);
    refresh();
    toast.success(saved.status === 'approved' ? 'Approved prompt override saved' : 'Prompt override saved');
    try {
      const result = await syncBrandPromptOverridesToCloud(activeProfile);
      setCloudMessage(result.message);
    } catch (error) {
      console.warn('Prompt override cloud sync failed:', error);
      setCloudMessage('Saved locally. Cloud sync can be retried.');
    }
  };

  const pullCloud = async () => {
    setIsCloudSyncing(true);
    try {
      const result = await pullBrandPromptOverridesFromCloud(activeProfile, true);
      setCloudMessage(result.message);
      setSelectedId(null);
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
      const result = await syncBrandPromptOverridesToCloud(activeProfile);
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
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><FilePenLine className="h-4 w-4" /> Brand Prompt Overrides</div>
            <h1 className="text-3xl font-bold tracking-tight">{activeProfile.name}</h1>
            <p className="text-muted-foreground mt-1">Approved brand-specific rules override universal templates per asset family while preserving logo, accessibility, and production safety.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={activeProfile.id} onChange={(event) => handleProfileChange(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <button onClick={pullCloud} disabled={isCloudSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><CloudDownload className="h-4 w-4" /> Pull</button>
            <button onClick={syncCloud} disabled={isCloudSyncing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"><CloudUpload className="h-4 w-4" /> Sync</button>
            <button onClick={() => createOverride('global')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> New override</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold">Saved overrides</div>
            {overrides.length ? <div className="space-y-2">{overrides.map((override) => (
              <button key={override.id} onClick={() => setSelectedId(override.id)} className={`w-full rounded-2xl border p-3 text-left transition hover:bg-secondary ${selected?.id === override.id ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                <div className="flex items-center justify-between gap-2"><div className="truncate text-sm font-semibold">{override.name}</div>{override.status === 'approved' && <CheckCircle2 className="h-4 w-4 text-primary" />}</div>
                <div className="mt-1 text-xs text-muted-foreground">{override.scope} · v{override.version} · {override.status}</div>
              </button>
            ))}</div> : <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No prompt overrides yet.</div>}
            <p className="mt-4 text-xs text-muted-foreground">{cloudMessage}</p>
          </div>
        </aside>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          {draft ? <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="block md:col-span-1"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</span><input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" /></label>
              <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scope</span><select value={draft.scope} onChange={(event) => updateDraft({ scope: event.target.value as MasterPromptFamily | 'global' })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">{scopes.map((scope) => <option key={scope} value={scope}>{scope}</option>)}</select></label>
              <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span><select value={draft.status} onChange={(event) => updateDraft({ status: event.target.value as BrandPromptOverrideStatus })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </div>
            <label className="block"><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strategy notes</span><textarea value={draft.strategyNotes || ''} onChange={(event) => updateDraft({ strategyNotes: event.target.value })} placeholder="Describe the brand-specific creative direction." className="min-h-20 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" /></label>
            <div className="grid gap-4 lg:grid-cols-2">
              <TextAreaField label="Hierarchy rules" value={draft.hierarchyRules} onChange={(rules) => updateDraft({ hierarchyRules: rules })} placeholder="One rule per line." />
              <TextAreaField label="Layout rules" value={draft.layoutRules} onChange={(rules) => updateDraft({ layoutRules: rules })} placeholder="Grid, safe zones, modules." />
              <TextAreaField label="Imagery rules" value={draft.imageryRules} onChange={(rules) => updateDraft({ imageryRules: rules })} placeholder="Human imagery, abstract fields, product shots." />
              <TextAreaField label="Motif rules" value={draft.motifRules} onChange={(rules) => updateDraft({ motifRules: rules })} placeholder="Patterns, orbs, line language." />
              <TextAreaField label="Typography rules" value={draft.typographyRules} onChange={(rules) => updateDraft({ typographyRules: rules })} placeholder="Font behavior and type hierarchy." />
              <TextAreaField label="Production rules" value={draft.productionRules} onChange={(rules) => updateDraft({ productionRules: rules })} placeholder="Print/digital constraints." />
              <TextAreaField label="Negative rules" value={draft.negativeRules} onChange={(rules) => updateDraft({ negativeRules: rules })} placeholder="Things this brand never does." />
              <TextAreaField label="QA rules" value={draft.qaRules} onChange={(rules) => updateDraft({ qaRules: rules })} placeholder="Pass/fail checks." />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-5"><button onClick={saveDraft} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Save className="h-4 w-4" /> Save version</button></div>
          </div> : <div className="rounded-3xl border border-dashed border-border p-12 text-center"><FilePenLine className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-xl font-bold">No override selected</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Create a global override or an asset-family override to teach this brand its own template behavior.</p><button onClick={() => createOverride('global')} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create override</button></div>}
        </section>
      </main>
    </div>
  );
};

export default BrandPromptOverrides;
