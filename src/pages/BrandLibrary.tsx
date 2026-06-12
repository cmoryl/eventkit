import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Download, Image, Layers, LayoutTemplate, Lock, Palette, Plus, ShieldCheck, Sparkles, Type } from 'lucide-react';
import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { createCustomBrandProfile, getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
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

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value.trim());

const downloadJson = (profile: BrandProfile) => {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.id}-brand-profile.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const copyJson = async (profile: BrandProfile) => {
  await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
  toast.success(`${profile.name} JSON copied`);
};

const DetailBlock: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <div className="flex items-center gap-2 font-semibold mb-3">
      {icon}
      <span>{title}</span>
    </div>
    {children}
  </div>
);

const TagList: React.FC<{ items: string[]; empty?: string }> = ({ items, empty = 'No details saved yet.' }) => (
  <div className="flex flex-wrap gap-2">
    {items.length > 0 ? items.map((item) => (
      <span key={item} className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">{item}</span>
    )) : <span className="text-sm text-muted-foreground">{empty}</span>}
  </div>
);

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
        {profile.colors.slice(0, 8).map((color) => <span key={`${profile.id}-${color.name}-${color.hex}`} className="h-7 w-7 rounded-full border border-border" style={{ backgroundColor: color.hex }} title={`${color.name} ${color.hex}`} />)}
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
  const [refreshKey, setRefreshKey] = useState(0);
  const profiles = useMemo(() => getAvailableBrandProfiles(), [refreshKey]);
  const [activeId, setActiveId] = useState(getActiveBrandProfile().id);
  const [selectedProfile, setSelectedProfile] = useState<BrandProfile | null>(profiles[0] || null);
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [customName, setCustomName] = useState('');
  const [customColors, setCustomColors] = useState('#111827, #2563EB, #F3F4F6');
  const [customFont, setCustomFont] = useState('Inter');
  const [customMode, setCustomMode] = useState<BrandMode>('guided');

  const filteredProfiles = profiles.filter((profile) => {
    const matchesQuery = `${profile.name} ${profile.description} ${profile.imageryRules.styleSummary}`.toLowerCase().includes(query.toLowerCase());
    const matchesMode = modeFilter === 'all' || profile.defaultMode === modeFilter;
    return matchesQuery && matchesMode;
  });

  const activateProfile = (id: string) => {
    const profile = setActiveBrandProfile(id);
    setActiveId(profile.id);
    setSelectedProfile(profile);
    toast.success(`${profile.name} activated`);
  };

  const createQuickBrand = () => {
    if (!customName.trim()) {
      toast.error('Add a brand name first');
      return;
    }

    const parsedColors = customColors.split(',').map((color) => color.trim()).filter(Boolean);
    const validColors = parsedColors.filter(isHex);

    if (validColors.length === 0) {
      toast.error('Add at least one valid HEX color');
      return;
    }

    const profile: BrandProfile = {
      id: `custom-${slugify(customName)}-${Date.now()}`,
      name: customName.trim(),
      description: 'Custom brand profile created from quick brand setup.',
      defaultMode: customMode,
      colors: validColors.map((hex, index) => ({
        name: index === 0 ? 'Primary' : index === 1 ? 'Secondary' : index === 2 ? 'Accent' : `Color ${index + 1}`,
        hex,
        role: index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'accent' : 'neutral',
      })),
      gradients: validColors.length > 1 ? [{ name: 'Custom Gradient', stops: validColors.slice(0, 4), usage: 'Generated from quick brand colors.' }] : [],
      typography: [
        { role: 'headline', fontFamily: customFont.trim() || 'Inter', weight: '700' },
        { role: 'body', fontFamily: customFont.trim() || 'Inter', weight: '400' },
        { role: 'fallback', fontFamily: 'system-ui', weight: '400' },
      ],
      logoRules: [{ name: 'Preserve uploaded logo', description: 'Do not distort, recolor, crop, or add effects unless approved.', required: true }],
      imageryRules: { styleSummary: 'Custom brand imagery direction pending deeper setup.', requiredTraits: ['consistent', 'brand-specific', 'high quality'], avoid: ['generic filler', 'unvalidated visual style'] },
      layoutRules: { styleSummary: 'Custom layout rules pending deeper setup.', requiredTraits: ['consistent hierarchy', 'responsive layouts'], avoid: ['template drift'] },
      accessibilityRules: { minimumContrastRatio: 4.5, largeTextContrastRatio: 3, notes: ['Run contrast checks before export.'] },
      exportRules: { socialDimensions: { square: '1080x1080', story: '1080x1920', horizontal: '1200x628' } },
      restrictedUses: ['Do not export final assets until logo, typography, colors, and imagery rules are reviewed.'],
    };

    createCustomBrandProfile(profile);
    setRefreshKey((value) => value + 1);
    setCustomName('');
    setSelectedProfile(profile);
    activateProfile(profile.id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70 sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to app</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><Layers className="h-4 w-4" /> Brand Library</div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Profile Manager</h1>
            <p className="text-muted-foreground mt-1">Choose, inspect, create, and activate reusable brand systems for generation and export preflight.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands, imagery, rules..." className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
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

      <main className="container mx-auto px-6 py-8 grid gap-8 xl:grid-cols-[1fr_460px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><Plus className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Quick Custom Brand</h2></div>
            <div className="grid gap-3 md:grid-cols-[1fr_1.4fr_0.8fr_0.8fr_auto]">
              <input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder="Brand name" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <input value={customColors} onChange={(event) => setCustomColors(event.target.value)} placeholder="#111827, #2563EB" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <input value={customFont} onChange={(event) => setCustomFont(event.target.value)} placeholder="Font" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
              <select value={customMode} onChange={(event) => setCustomMode(event.target.value as BrandMode)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                <option value="guided">Guided</option>
                <option value="locked">Locked</option>
                <option value="inspired">Inspired</option>
                <option value="experimental">Experimental</option>
              </select>
              <button onClick={createQuickBrand} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create</button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredProfiles.map((profile) => <BrandCard key={profile.id} profile={profile} isActive={profile.id === activeId} onActivate={activateProfile} onInspect={setSelectedProfile} />)}
          </div>
        </section>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm h-fit xl:sticky xl:top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {selectedProfile ? (
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-xl font-bold">{selectedProfile.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">ID: {selectedProfile.id}</p>
                </div>
                <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', getModeBadgeClass(selectedProfile.defaultMode))}>{selectedProfile.defaultMode}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{selectedProfile.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-5">
                <button onClick={() => copyJson(selectedProfile)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"><Copy className="h-4 w-4" />Copy JSON</button>
                <button onClick={() => downloadJson(selectedProfile)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"><Download className="h-4 w-4" />Export JSON</button>
              </div>

              <div className="space-y-4">
                <DetailBlock title="Color System" icon={<Palette className="h-4 w-4 text-primary" />}>
                  <div className="space-y-2">
                    {selectedProfile.colors.map((color) => (
                      <div key={`${color.name}-${color.hex}`} className="rounded-xl bg-secondary/50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: color.hex }} /> <span className="font-medium">{color.name}</span></div>
                          <code className="text-xs text-muted-foreground">{color.hex}</code>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground capitalize">Role: {color.role}{color.locked ? ' · Locked' : ''}</div>
                        {color.usage && <div className="mt-1 text-xs text-muted-foreground">Usage: {color.usage}</div>}
                      </div>
                    ))}
                    {selectedProfile.colors.length === 0 && <p className="text-sm text-muted-foreground">This custom brand is ready for uploaded tokens.</p>}
                  </div>
                </DetailBlock>

                <DetailBlock title="Gradient System" icon={<Sparkles className="h-4 w-4 text-primary" />}>
                  <div className="space-y-2">
                    {selectedProfile.gradients.map((gradient) => (
                      <div key={gradient.name} className="rounded-xl bg-secondary/50 p-3 text-sm">
                        <div className="font-medium mb-2">{gradient.name}</div>
                        <div className="h-8 rounded-lg border border-border" style={{ background: `linear-gradient(90deg, ${gradient.stops.join(', ')})` }} />
                        <div className="mt-2 text-xs text-muted-foreground">{gradient.stops.join(' → ')}</div>
                        {gradient.usage && <div className="mt-1 text-xs text-muted-foreground">Usage: {gradient.usage}</div>}
                      </div>
                    ))}
                    {selectedProfile.gradients.length === 0 && <p className="text-sm text-muted-foreground">No gradients defined.</p>}
                  </div>
                </DetailBlock>

                <DetailBlock title="Typography" icon={<Type className="h-4 w-4 text-primary" />}>
                  <div className="space-y-2">
                    {selectedProfile.typography.map((type) => (
                      <div key={`${type.role}-${type.fontFamily}-${type.weight}`} className="rounded-xl bg-secondary/50 p-3 text-sm">
                        <div><span className="font-medium capitalize">{type.role}</span>: {type.fontFamily} {type.weight}</div>
                        {type.usage && <div className="mt-1 text-xs text-muted-foreground">Usage: {type.usage}</div>}
                        {type.locked && <div className="mt-1 text-xs text-primary">Locked type rule</div>}
                      </div>
                    ))}
                  </div>
                </DetailBlock>

                <DetailBlock title="Logo Rules" icon={<ShieldCheck className="h-4 w-4 text-primary" />}>
                  <div className="space-y-2">
                    {selectedProfile.logoRules.map((rule) => (
                      <div key={rule.name} className="rounded-xl bg-secondary/50 p-3 text-sm">
                        <div className="font-medium">{rule.name}{rule.required ? ' · Required' : ''}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>

                <DetailBlock title="Imagery Direction" icon={<Image className="h-4 w-4 text-primary" />}>
                  <p className="text-sm text-muted-foreground mb-3">{selectedProfile.imageryRules.styleSummary}</p>
                  <div className="mb-3"><div className="text-xs font-semibold uppercase tracking-wide mb-2">Required traits</div><TagList items={selectedProfile.imageryRules.requiredTraits} /></div>
                  <div><div className="text-xs font-semibold uppercase tracking-wide mb-2">Avoid</div><TagList items={selectedProfile.imageryRules.avoid} /></div>
                  {selectedProfile.imageryRules.promptGuidance && <p className="mt-3 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">{selectedProfile.imageryRules.promptGuidance}</p>}
                </DetailBlock>

                <DetailBlock title="Layout Rules" icon={<LayoutTemplate className="h-4 w-4 text-primary" />}>
                  <p className="text-sm text-muted-foreground mb-3">{selectedProfile.layoutRules.styleSummary}</p>
                  <div className="mb-3"><div className="text-xs font-semibold uppercase tracking-wide mb-2">Required traits</div><TagList items={selectedProfile.layoutRules.requiredTraits} /></div>
                  <div><div className="text-xs font-semibold uppercase tracking-wide mb-2">Avoid</div><TagList items={selectedProfile.layoutRules.avoid} /></div>
                </DetailBlock>

                <DetailBlock title="Accessibility + Export Rules" icon={<CheckCircle2 className="h-4 w-4 text-primary" />}>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">Minimum contrast</div><div className="font-bold">{selectedProfile.accessibilityRules.minimumContrastRatio}:1</div></div>
                    <div className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">Large text</div><div className="font-bold">{selectedProfile.accessibilityRules.largeTextContrastRatio}:1</div></div>
                  </div>
                  <TagList items={selectedProfile.accessibilityRules.notes || []} />
                  {selectedProfile.exportRules.socialDimensions && <pre className="mt-3 max-h-40 overflow-auto rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">{JSON.stringify(selectedProfile.exportRules.socialDimensions, null, 2)}</pre>}
                  {selectedProfile.exportRules.printRules && <div className="mt-3"><div className="text-xs font-semibold uppercase tracking-wide mb-2">Print</div><TagList items={selectedProfile.exportRules.printRules} /></div>}
                  {selectedProfile.exportRules.deckRules && <div className="mt-3"><div className="text-xs font-semibold uppercase tracking-wide mb-2">Decks</div><TagList items={selectedProfile.exportRules.deckRules} /></div>}
                </DetailBlock>

                <DetailBlock title="Restricted Uses" icon={<Lock className="h-4 w-4 text-primary" />}>
                  <div className="space-y-2">{selectedProfile.restrictedUses.map((rule) => <div key={rule} className="rounded-xl bg-secondary/50 p-2 text-sm text-muted-foreground">{rule}</div>)}</div>
                </DetailBlock>

                {selectedProfile.promptKeywords && (
                  <DetailBlock title="Prompt Keywords" icon={<Sparkles className="h-4 w-4 text-primary" />}>
                    <TagList items={selectedProfile.promptKeywords} />
                  </DetailBlock>
                )}
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground">Select a brand to inspect its rules.</p>}
        </aside>
      </main>
    </div>
  );
};

export default BrandLibrary;
