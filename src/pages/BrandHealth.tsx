import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, HeartPulse, Search, XCircle } from 'lucide-react';
import type { BrandProfileHealthCheck } from '@/services/brandProfileHealthService';
import { evaluateBrandProfileHealth } from '@/services/brandProfileHealthService';
import { getAvailableBrandProfiles } from '@/services/brandProfileService';
import { cn } from '@/lib/utils';

const statusClass = (status: string) => {
  switch (status) {
    case 'production-ready': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    case 'usable': return 'text-primary bg-primary/10 border-primary/20';
    case 'needs-work': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    default: return 'text-destructive bg-destructive/10 border-destructive/20';
  }
};

const checkIcon = (status: BrandProfileHealthCheck['status']) => {
  if (status === 'pass') return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const BrandHealth: React.FC = () => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(profiles[0]?.id || '');
  const selectedProfile = profiles.find((profile) => profile.id === selectedId) || profiles[0];
  const selectedHealth = selectedProfile ? evaluateBrandProfileHealth(selectedProfile) : null;

  const filteredProfiles = profiles.filter((profile) => `${profile.name} ${profile.description}`.toLowerCase().includes(query.toLowerCase()));
  const portfolioHealth = filteredProfiles.map((profile) => ({ profile, health: evaluateBrandProfileHealth(profile) }));
  const averageScore = portfolioHealth.length
    ? Math.round(portfolioHealth.reduce((sum, item) => sum + item.health.score, 0) / portfolioHealth.length)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Library</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><HeartPulse className="h-4 w-4" /> Brand Health</div>
            <h1 className="text-3xl font-bold tracking-tight">Brand Profile Quality Audit</h1>
            <p className="text-muted-foreground mt-1">Score each brand profile for generation readiness, governance, export safety, and rule completeness.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search profiles..." className="rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 grid gap-8 xl:grid-cols-[1fr_480px]">
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5"><div className="text-sm text-muted-foreground">Profiles</div><div className="text-3xl font-bold">{filteredProfiles.length}</div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><div className="text-sm text-muted-foreground">Average Score</div><div className="text-3xl font-bold">{averageScore}</div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><div className="text-sm text-muted-foreground">Production Ready</div><div className="text-3xl font-bold">{portfolioHealth.filter((item) => item.health.status === 'production-ready').length}</div></div>
            <div className="rounded-2xl border border-border bg-card p-5"><div className="text-sm text-muted-foreground">Need Work</div><div className="text-3xl font-bold">{portfolioHealth.filter((item) => item.health.status === 'needs-work' || item.health.status === 'incomplete').length}</div></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {portfolioHealth.map(({ profile, health }) => (
              <button key={profile.id} onClick={() => setSelectedId(profile.id)} className={cn('rounded-3xl border bg-card p-5 text-left shadow-sm transition hover:shadow-md', selectedId === profile.id ? 'border-primary ring-2 ring-primary/15' : 'border-border')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{profile.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{profile.description}</p>
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', statusClass(health.status))}>{health.status.replace('-', ' ')}</span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="text-3xl font-bold">{health.score}</div>
                  <div className="text-xs text-muted-foreground">{health.passCount} pass · {health.warningCount} warn · {health.failCount} fail</div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${health.score}%` }} /></div>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm h-fit xl:sticky xl:top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {selectedProfile && selectedHealth ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{selectedProfile.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedProfile.defaultMode} mode · {selectedProfile.id}</p>
                </div>
                <div className="text-right"><div className="text-3xl font-bold">{selectedHealth.score}</div><span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', statusClass(selectedHealth.status))}>{selectedHealth.status.replace('-', ' ')}</span></div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">Pass</div><div className="font-bold">{selectedHealth.passCount}</div></div>
                <div className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">Warnings</div><div className="font-bold">{selectedHealth.warningCount}</div></div>
                <div className="rounded-xl bg-secondary/50 p-3"><div className="text-xs text-muted-foreground">Fails</div><div className="font-bold">{selectedHealth.failCount}</div></div>
              </div>

              <div className="mt-6 space-y-3">
                {selectedHealth.checks.map((check) => (
                  <div key={`${check.category}-${check.label}`} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 font-semibold">{checkIcon(check.status)} {check.label}</div>
                      <span className="text-sm font-bold">{check.score}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{check.message}</p>
                    {check.recommendation && <p className="mt-2 text-sm">Fix: {check.recommendation}</p>}
                  </div>
                ))}
              </div>

              {selectedHealth.recommendations.length > 0 && (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <h3 className="font-semibold text-amber-700 mb-3">Recommended next fixes</h3>
                  <div className="space-y-2">
                    {selectedHealth.recommendations.map((item) => <p key={item} className="text-sm text-muted-foreground">• {item}</p>)}
                  </div>
                </div>
              )}
            </div>
          ) : <p className="text-sm text-muted-foreground">No brand selected.</p>}
        </aside>
      </main>
    </div>
  );
};

export default BrandHealth;
