import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, ShieldAlert, ShieldCheck, TriangleAlert, XCircle } from 'lucide-react';
import type { LogoVisibilityMode } from '@/services/logoVisibilityService';
import { getLogoVisibilityMode } from '@/services/logoVisibilityService';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from '@/services/brandProfileService';
import { getBrandAssetGenerationContext } from '@/services/brandAssetLibraryService';
import { auditLogoConsistencyAcrossAssets, exportLogoConsistencyAuditJson } from '@/services/logoConsistencyAuditService';
import { cn } from '@/lib/utils';

const modeOptions: LogoVisibilityMode[] = ['auto', 'visible', 'hidden'];

const statusIcon = {
  pass: ShieldCheck,
  warn: TriangleAlert,
  fail: XCircle,
};

const statusClass = {
  pass: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  warn: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  fail: 'border-destructive/20 bg-destructive/10 text-destructive',
};

const LogoConsistencyAudit: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const initialProfile = getActiveBrandProfile();
  const [profileId, setProfileId] = useState(initialProfile.id);
  const [mode, setMode] = useState<LogoVisibilityMode>(() => getLogoVisibilityMode());

  const activeProfile = profiles.find((profile) => profile.id === profileId) || initialProfile;
  const context = useMemo(() => getBrandAssetGenerationContext(activeProfile.id, activeProfile), [activeProfile]);
  const report = useMemo(() => auditLogoConsistencyAcrossAssets({ brandAssetContext: context, mode }), [context, mode]);

  const handleProfileChange = (nextProfileId: string) => {
    const profile = setActiveBrandProfile(nextProfileId);
    setProfileId(profile.id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-brain" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Brain</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><ShieldAlert className="h-4 w-4" /> Logo QA</div>
            <h1 className="text-3xl font-bold tracking-tight">Logo Consistency Audit</h1>
            <p className="text-muted-foreground mt-1">Audits multiple asset types to ensure the AI never renders the logo and every visible logo uses the exact source-overlay path.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={activeProfile.id} onChange={(event) => handleProfileChange(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <select value={mode} onChange={(event) => setMode(event.target.value as LogoVisibilityMode)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {modeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <button onClick={() => exportLogoConsistencyAuditJson(report)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Download className="h-4 w-4" /> Export audit</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-5">
          {[
            ['Audited', report.total],
            ['Pass', report.pass],
            ['Warn', report.warn],
            ['Fail', report.fail],
            ['Logo source', context.primaryLogo ? 'Set' : 'Missing'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-3xl font-bold">{value}</div>
            </div>
          ))}
        </section>

        <section className={cn('rounded-3xl border p-5 shadow-sm', report.fail ? statusClass.fail : report.warn ? statusClass.warn : statusClass.pass)}>
          <div className="flex items-start gap-3">
            {React.createElement(report.fail ? XCircle : report.warn ? TriangleAlert : ShieldCheck, { className: 'h-5 w-5 mt-0.5' })}
            <div>
              <div className="font-semibold">{report.summary}</div>
              <p className="mt-1 text-sm opacity-80">Primary logo source: {report.primaryLogoName || 'not set'}. Mode: {report.mode}.</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Model gets logo?</th>
                  <th className="px-4 py-3">Overlay required?</th>
                  <th className="px-4 py-3">Placement</th>
                  <th className="px-4 py-3">Scale</th>
                  <th className="px-4 py-3">Issues / recommendation</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => {
                  const Icon = statusIcon[row.status];
                  return (
                    <tr key={row.assetType} className="border-b border-border/60 align-top last:border-b-0">
                      <td className="px-4 py-4 font-semibold">{row.assetType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-4"><span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', statusClass[row.status])}><Icon className="h-3.5 w-3.5" /> {row.status}</span></td>
                      <td className="px-4 py-4 text-muted-foreground capitalize">{row.requirement}</td>
                      <td className="px-4 py-4 font-semibold">{row.modelReceivesLogo ? 'YES — problem' : 'No'}</td>
                      <td className="px-4 py-4 font-semibold">{row.overlayRequired ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-4 text-muted-foreground">{row.overlayPosition}</td>
                      <td className="px-4 py-4 text-muted-foreground">{Math.round(row.overlayScale * 100)}%</td>
                      <td className="px-4 py-4 text-muted-foreground">{row.issues.length ? row.issues.join(' ') : row.recommendation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LogoConsistencyAudit;
