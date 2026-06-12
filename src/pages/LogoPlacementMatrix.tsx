import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileJson, Search, ShieldCheck } from 'lucide-react';
import type { LogoVisibilityMode } from '@/services/logoVisibilityService';
import { exportLogoPlacementMatrixCsv, exportLogoPlacementMatrixJson, getLogoPlacementMatrix, summarizeLogoPlacementMatrix } from '@/services/logoPlacementMatrixService';
import { cn } from '@/lib/utils';

const modeOptions: LogoVisibilityMode[] = ['auto', 'visible', 'hidden'];

const requirementClass = (requirement: string) => {
  switch (requirement) {
    case 'required': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'visible': return 'bg-primary/10 text-primary border-primary/20';
    case 'optional': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    default: return 'bg-secondary text-muted-foreground border-border';
  }
};

const LogoPlacementMatrix: React.FC = () => {
  const [mode, setMode] = useState<LogoVisibilityMode>('auto');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [hasLogo, setHasLogo] = useState(true);

  const rows = useMemo(() => getLogoPlacementMatrix(mode, hasLogo), [mode, hasLogo]);
  const categories = useMemo(() => ['all', ...Array.from(new Set(rows.map((row) => row.category))).sort()], [rows]);
  const filteredRows = rows.filter((row) => {
    const haystack = `${row.assetTitle} ${row.assetType} ${row.category} ${row.requirement} ${row.productionRecommendation}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesCategory = category === 'all' || row.category === category;
    return matchesQuery && matchesCategory;
  });
  const summary = summarizeLogoPlacementMatrix(filteredRows);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/brand-library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="h-4 w-4" /> Back to Brand Library</Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1"><ShieldCheck className="h-4 w-4" /> Logo Governance</div>
            <h1 className="text-3xl font-bold tracking-tight">Logo Placement Matrix</h1>
            <p className="text-muted-foreground mt-1">Asset-by-asset visibility, placement, size, safe-area, and best-practice rules for brand logo usage.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => exportLogoPlacementMatrixJson(filteredRows)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"><FileJson className="h-4 w-4" /> JSON</button>
            <button onClick={() => exportLogoPlacementMatrixCsv(filteredRows)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Download className="h-4 w-4" /> CSV</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search asset types, recommendations, categories..." className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm" />
            </div>
            <select value={mode} onChange={(event) => setMode(event.target.value as LogoVisibilityMode)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {modeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <label className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <input type="checkbox" checked={hasLogo} onChange={(event) => setHasLogo(event.target.checked)} /> Logo available
            </label>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            ['Total', summary.total],
            ['Required', summary.required],
            ['Visible', summary.visible],
            ['Optional', summary.optional],
            ['Hidden', summary.hidden],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="text-3xl font-bold">{value}</div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="border-b border-border bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Preferred placement</th>
                  <th className="px-4 py-3">Max size</th>
                  <th className="px-4 py-3">Avoid</th>
                  <th className="px-4 py-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.assetType} className="border-b border-border/60 align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{row.assetTitle}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{row.assetType} · {row.category}</div>
                    </td>
                    <td className="px-4 py-4"><span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', requirementClass(row.requirement))}>{row.requirement}</span></td>
                    <td className="px-4 py-4 capitalize text-muted-foreground">{row.placementPriority}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.preferredLocations.length ? row.preferredLocations.join(', ') : 'suppressed'}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.maxWidthPercent}% W / {row.maxHeightPercent}% H</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.avoidLocations.slice(0, 3).join(', ')}</td>
                    <td className="px-4 py-4 text-muted-foreground">{row.productionRecommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LogoPlacementMatrix;
