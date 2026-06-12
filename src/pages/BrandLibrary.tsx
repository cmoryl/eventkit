import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Layers, Lock, Palette, ShieldCheck, Sparkles, Type } from 'lucide-react';
import type { BrandProfile } from '@/types/brandProfile';
import { getAvailableBrandProfiles, getActiveBrandProfile, setActiveBrandProfile } from '@/services/brandProfileService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const getModeBadgeClass = (mode: string) => {
  switch (mode) {
    case 'locked': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'guided': return 'bg-primary/10 text-primary border-primary/20';
    case 'inspired': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'experimental': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    default: return 'bg-secondary text-muted-foreground border-border';
  }
};

const BrandCard: React.FC<{
  profile: BrandProfile;
  isActive: boolean;
  onActivate: (id: string) => void;
  onInspect: (profile: BrandProfile) => void;
}> = ({ profile, isActive, onActivate, onInspect }) => {
  return (
    <div className={cn('rounded-3xl border bg-card p-5 shadow-sm transition-all hover:shadow-md', isActive ? 'border-primary/50 ring-2 ring-primary/15' : 'border-border')}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold">{profile.name}</h2>
            {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </div>
          <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', getModeBadgeClass(profile.defaultMode))}>{profile.defaultMode}</span>
        </div>
        {profile.defaultMode === 'locked' ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Sparkles className="h-5 w-5 text-muted-foreground" />}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{profile.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {profile.colors.slice(0, 8).map((color) => (
          <span key={`${profile.id}-${color.name}-${color.hex}`} className="h-7 w-7 rounded-full border border-border" style={{ backgroundColor: color.hex }} title={`${color.name} ${color.hex}`} />
        ))}
        {profile.colors.length === 0 && <span className="text-sm text-muted-foreground">No colors yet</span>}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="rounded-xl bg-secondary/50 p-2"><Palette className="mb-1 h-3.5 w-3.5" />{profile.colors.length} colors</div>
        <div className="rounded-xl bg-secondary/50 p-2"><Type className="mb-1 h-3.5 w-3.5" />{profile.typography.length} fonts</div>
        <div className="rounded-xl bg-secondary/50 p-2"><ShieldCheck className="mb-1 h-3.5 w-3.5" />{profile.restrictedUses.length} rules</div>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={() => onInspect(profile)} className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary">Inspect</button>
        <button onClick={() => onActivate(profile.id)} className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{isActive ? 'Active' : 'Activate'}</button>
      </div>
    </div>
  );
};

const BrandLibrary: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const [activeId, setActiveId] = useState(getActiveBrandProfile().id);
  const [selectedProfile, setSelectedProfile] = useState<BrandProfile | null>(profiles[0] || null);
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all');

  const filteredProfiles = profiles.filter((profile) => {
    const matchesQuery = `${profile.name} ${profile.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesMode = modeFilter === 'all' || profile.defaultMode === modeFilter;
    return matchesQuery && matchesMode;
  });

  const activateProfile = (id: string) => {
    const profile = setActiveBrandProfile(id);
    setActiveId(profile.id);
    setSelectedProfile(profile);
    toast.success(`${profile.name} activated`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to app</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><Layers className="h-4 w-4" /> Brand Library</div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Profile Manager</h1>
            <p className="text-muted-foreground mt-1">Choose, inspect, and activate reusable brand systems for generation and export preflight.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands..." className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            <select value={modeFilter} onChange={(event) => setModeFilter(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <option value="all">All modes</option>
              <option value="locked">Locked</option>
              <option value="guided">Guided</option>
              <option value="inspired">Inspired</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 grid gap-8 xl:grid-cols-[1fr_390px]">
        <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <BrandCard key={profile.id} profile={profile} isActive={profile.id === activeId} onActivate={activateProfile} onInspect={setSelectedProfile} />
          ))}
        </section>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm h-fit xl:sticky xl:top-28">
          {selectedProfile ? (
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-xl font-bold">{selectedProfile.name}</h2>
                <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', getModeBadgeClass(selectedProfile.defaultMode))}>{selectedProfile.defaultMode}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{selectedProfile.description}</p>

              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold mb-2">Colors</h3>
                  <div className="space-y-2">
                    {selectedProfile.colors.map((color) => (
                      <div key={`${color.name}-${color.hex}`} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/50 p-2 text-sm">
                        <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: color.hex }} />{color.name}</div>
                        <code className="text-xs text-muted-foreground">{color.hex}</code>
                      </div>
                    ))}
                    {selectedProfile.colors.length === 0 && <p className="text-sm text-muted-foreground">This custom brand is ready for uploaded tokens.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Typography</h3>
                  <div className="space-y-2">
                    {selectedProfile.typography.map((type) => (
                      <div key={`${type.role}-${type.fontFamily}-${type.weight}`} className="rounded-xl bg-secondary/50 p-2 text-sm">
                        <span className="font-medium capitalize">{type.role}</span>: {type.fontFamily} {type.weight}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rules</h3>
                  <div className="space-y-2">
                    {selectedProfile.restrictedUses.map((rule) => <div key={rule} className="rounded-xl bg-secondary/50 p-2 text-sm text-muted-foreground">{rule}</div>)}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Imagery Direction</h3>
                  <p className="rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground">{selectedProfile.imageryRules.styleSummary}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a brand to inspect its rules.</p>
          )}
        </aside>
      </main>
    </div>
  );
};

export default BrandLibrary;
