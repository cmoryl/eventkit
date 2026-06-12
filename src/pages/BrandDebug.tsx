import React, { useMemo, useState } from 'react';
import { getAvailableBrandProfiles } from '@/services/brandProfileService';
import { validateAssetAgainstBrand } from '@/services/brandComplianceValidator';
import type { BrandMode } from '@/types/brandProfile';

const modes: BrandMode[] = ['locked', 'guided', 'inspired', 'experimental'];

const BrandDebug: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const [activeProfileId, setActiveProfileId] = useState(profiles[0]?.id || '');
  const [mode, setMode] = useState<BrandMode>(profiles[0]?.defaultMode || 'guided');
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0];

  const validation = useMemo(() => {
    if (!activeProfile) return null;
    return validateAssetAgainstBrand({
      colors: activeProfile.colors.slice(0, 4).map((color) => color.hex),
      fontFamilies: activeProfile.typography.slice(0, 2).map((type) => type.fontFamily),
      hasLogo: activeProfile.logoRules.length > 0,
      exportDimensions: activeProfile.exportRules.socialDimensions ? Object.values(activeProfile.exportRules.socialDimensions)[0] : '1080x1080',
      assetType: 'debug-preflight',
      mode,
    }, activeProfile);
  }, [activeProfile, mode]);

  if (!activeProfile || !validation) {
    return <div className="min-h-screen bg-background text-foreground p-8">No brand profiles found.</div>;
  }

  const scoreItems = [
    ['Overall', validation.overallScore],
    ['Color', validation.colorScore],
    ['Typography', validation.typographyScore],
    ['Logo', validation.logoScore],
    ['Layout', validation.layoutScore],
    ['Accessibility', validation.accessibilityScore],
    ['Export', validation.exportReadinessScore],
    ['Drift', validation.brandDriftScore],
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/60 bg-card/70 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm text-primary font-semibold mb-2">BrandKit Debug Console</div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Profile Preflight</h1>
            <p className="text-muted-foreground mt-1">Validate presets, modes, tokens, restrictions, and export readiness.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-4 py-2 rounded-xl border border-border bg-background" value={activeProfile.id} onChange={(event) => {
              const next = profiles.find((profile) => profile.id === event.target.value);
              setActiveProfileId(event.target.value);
              if (next) setMode(next.defaultMode);
            }}>
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <select className="px-4 py-2 rounded-xl border border-border bg-background" value={mode} onChange={(event) => setMode(event.target.value as BrandMode)}>
              {modes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scoreItems.map(([label, score]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="text-sm text-muted-foreground mb-2">{label} Score</div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{activeProfile.name}</h2>
            <p className="text-muted-foreground mb-6">{activeProfile.description}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="font-semibold mb-2">Colors</div>
                <div className="flex flex-wrap gap-2">
                  {activeProfile.colors.map((color) => <span key={`${color.name}-${color.hex}`} className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: color.hex }} title={`${color.name} ${color.hex}`} />)}
                </div>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="font-semibold mb-2">Typography</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {activeProfile.typography.map((type) => <div key={`${type.role}-${type.fontFamily}`}>{type.role}: {type.fontFamily} {type.weight}</div>)}
                </div>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="font-semibold mb-2">Imagery</div>
                <p className="text-sm text-muted-foreground">{activeProfile.imageryRules.styleSummary}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Preflight Issues</h2>
            {validation.issues.length === 0 ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm">No issues found for this profile sample.</div>
            ) : (
              <div className="space-y-3">
                {validation.issues.map((issue, index) => (
                  <div key={`${issue.category}-${index}`} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-semibold capitalize">{issue.category}</span>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">{issue.severity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{issue.message}</p>
                    {issue.suggestion && <p className="text-sm mt-2">Fix: {issue.suggestion}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BrandDebug;
