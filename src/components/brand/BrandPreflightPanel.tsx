import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, ShieldCheck, XCircle } from 'lucide-react';
import type { GeneratedAsset } from '@/types';
import type { BrandMode } from '@/types/brandProfile';
import type { LogoVisibilityMode } from '@/services/logoVisibilityService';
import { getLogoVisibilityMode } from '@/services/logoVisibilityService';
import { getAvailableBrandProfiles } from '@/services/brandProfileService';
import { generatePreflightReportText, getAssetSetPreflightSummary, preflightAssetSet } from '@/services/assetPreflightService';
import { exportAssetsWithBrandPreflight } from '@/services/brandSafeExportService';
import LogoVisibilityControl from './LogoVisibilityControl';
import LogoPlacementGuide from './LogoPlacementGuide';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BrandPreflightPanelProps {
  assets: GeneratedAsset[];
  eventName?: string;
  className?: string;
}

const modes: BrandMode[] = ['locked', 'guided', 'inspired', 'experimental'];

const getScoreStatus = (score: number) => {
  if (score >= 90) return { label: 'Strong', icon: CheckCircle2, className: 'text-emerald-600' };
  if (score >= 75) return { label: 'Review', icon: AlertTriangle, className: 'text-amber-600' };
  return { label: 'Risk', icon: XCircle, className: 'text-destructive' };
};

export const BrandPreflightPanel: React.FC<BrandPreflightPanelProps> = ({ assets, eventName = 'eventkit-assets', className }) => {
  const profiles = useMemo(() => getAvailableBrandProfiles(), []);
  const [profileId, setProfileId] = useState(profiles[0]?.id || '');
  const activeProfile = profiles.find((profile) => profile.id === profileId) || profiles[0];
  const [mode, setMode] = useState<BrandMode>(activeProfile?.defaultMode || 'guided');
  const [logoMode, setLogoMode] = useState<LogoVisibilityMode>(() => getLogoVisibilityMode());
  const [isExporting, setIsExporting] = useState(false);

  const results = useMemo(() => {
    if (!activeProfile) return [];
    return preflightAssetSet(assets.filter((asset) => !asset.isLoading), activeProfile, mode);
  }, [assets, activeProfile, mode]);

  const summary = useMemo(() => getAssetSetPreflightSummary(results), [results]);
  const status = getScoreStatus(summary.overallScore);
  const StatusIcon = status.icon;
  const topIssues = results
    .flatMap((result) => result.validation.issues.map((issue) => ({ ...issue, assetTitle: result.assetTitle })))
    .slice(0, 4);

  if (!activeProfile) return null;

  const downloadReport = () => {
    const report = generatePreflightReportText(results, activeProfile, mode);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brand-preflight-${activeProfile.id}-${mode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBrandSafeExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportAssetsWithBrandPreflight({
        eventName,
        assets,
        brandProfile: activeProfile,
        mode,
        allowWarnings: mode !== 'locked',
      });

      if (result.blocked) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } catch (error) {
      console.error('Brand-safe export failed:', error);
      toast.error('Brand-safe export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
            <ShieldCheck className="h-4 w-4" /> Brand preflight
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{summary.overallScore}</h2>
            <div className={cn('flex items-center gap-1 text-sm font-semibold', status.className)}>
              <StatusIcon className="h-4 w-4" /> {status.label}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {summary.approvedCount} approved · {summary.reviewCount} need review · {summary.blockingCount} blocking
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Logo visibility controls future generations: keep logos visible, hide logos while preserving brand look, or let Auto decide by asset type.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 lg:justify-end">
          <select
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={activeProfile.id}
            onChange={(event) => {
              const next = profiles.find((profile) => profile.id === event.target.value);
              setProfileId(event.target.value);
              if (next) setMode(next.defaultMode);
            }}
          >
            {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
          <select className="rounded-xl border border-border bg-background px-3 py-2 text-sm" value={mode} onChange={(event) => setMode(event.target.value as BrandMode)}>
            {modes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <LogoVisibilityControl compact value={logoMode} onChange={setLogoMode} />
          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            <Download className="h-4 w-4" /> Report
          </button>
          <button
            type="button"
            onClick={handleBrandSafeExport}
            disabled={isExporting || results.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" /> {isExporting ? 'Exporting...' : 'Brand-Safe ZIP'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ['Approved', summary.approvedCount],
          ['Review', summary.reviewCount],
          ['Blocking', summary.blockingCount],
          ['Checked', results.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-secondary/50 p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <LogoPlacementGuide mode={logoMode} hasLogo />
      </div>

      {topIssues.length > 0 && (
        <div className="mt-5 space-y-2">
          <div className="text-sm font-semibold">Top issues</div>
          {topIssues.map((issue, index) => (
            <div key={`${issue.assetTitle}-${issue.category}-${index}`} className="rounded-xl border border-border bg-background p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium truncate">{issue.assetTitle}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{issue.severity}</span>
              </div>
              <p className="text-muted-foreground mt-1">{issue.message}</p>
              {issue.suggestion && <p className="mt-1 text-foreground">Fix: {issue.suggestion}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BrandPreflightPanel;
