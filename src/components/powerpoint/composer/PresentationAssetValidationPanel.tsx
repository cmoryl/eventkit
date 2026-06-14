import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { validatePresentationAssetCandidates, type PresentationAssetCandidate } from '@/services/presentationAssetValidationService';

const demoCandidates: PresentationAssetCandidate[] = [
  { id: 'brand-primary-logo-svg', label: 'Primary approved logo', slot: 'logo', format: 'svg', width: 1200, height: 400, rightsStatus: 'approved', isExactLogo: true, hasAltText: true },
  { id: 'venue-stage-hero-set', label: 'Venue stage hero set', slot: 'hero', format: 'jpg', width: 1400, height: 800, rightsStatus: 'needs-review', hasAltText: false },
  { id: 'launch-resource-qr-panel', label: 'Launch resource QR panel', slot: 'qr', format: 'svg', width: 600, height: 600, rightsStatus: 'approved', isQrScannable: false, hasAltText: true },
];

export interface PresentationAssetValidationPanelProps {
  candidates?: PresentationAssetCandidate[];
}

export const PresentationAssetValidationPanel: React.FC<PresentationAssetValidationPanelProps> = ({ candidates = demoCandidates }) => {
  const results = useMemo(() => validatePresentationAssetCandidates(candidates), [candidates]);
  const passCount = results.filter((result) => result.status === 'pass').length;
  const failCount = results.filter((result) => result.status === 'fail').length;

  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Asset Validation
          </div>
          <h3 className="text-xl font-black">Preflight every asset before export</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Checks exact logo handling, format fit, resolution, rights status, QR scannability, and accessibility labels.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="rounded-2xl bg-primary/10 px-4 py-3 text-primary"><div className="text-2xl font-black">{passCount}</div>pass</div>
          <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive"><div className="text-2xl font-black">{failCount}</div>fail</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {results.map((result) => (
          <article key={result.candidate.id} className="rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-black">
                  {result.status === 'pass' ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  {result.candidate.label}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{result.candidate.slot} · {result.candidate.format || 'format unknown'} · score {result.score}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${result.status === 'pass' ? 'bg-primary/10 text-primary' : result.status === 'fail' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'}`}>{result.status}</span>
            </div>
            {result.issues.length > 0 && (
              <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                {result.issues.map((issue) => (
                  <div key={issue.code} className="rounded-xl bg-muted p-2"><span className="font-black text-foreground">{issue.code}</span>: {issue.message}</div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
