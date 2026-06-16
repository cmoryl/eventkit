import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  getLastPptxImportReport,
  type PptxImportIssue,
  type PptxImportReport,
} from './importPptx';
import { cn } from '@/lib/utils';

const scopeBadge: Record<PptxImportIssue['scope'], string> = {
  media: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  slide: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  layout: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
  master: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
};

export interface PptxImportDebugPanelProps {
  className?: string;
  /** If true, the panel auto-opens when a fresh report arrives with issues. */
  autoOpenOnIssues?: boolean;
}

export const PptxImportDebugPanel: React.FC<PptxImportDebugPanelProps> = ({
  className,
  autoOpenOnIssues = true,
}) => {
  const [report, setReport] = useState<PptxImportReport | null>(() => getLastPptxImportReport());
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onReport = (e: Event) => {
      const detail = (e as CustomEvent<PptxImportReport>).detail;
      setReport(detail);
      setDismissed(false);
      if (autoOpenOnIssues && detail.issues.length > 0) setOpen(true);
    };
    window.addEventListener('pptx-import-report', onReport);
    return () => window.removeEventListener('pptx-import-report', onReport);
  }, [autoOpenOnIssues]);

  if (!report || dismissed) return null;

  const hasIssues = report.issues.length > 0;

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card/95 text-xs shadow-2xl backdrop-blur-xl', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-t-2xl border-b border-border/70 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 font-black">
          {hasIssues ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          PPTX Import {hasIssues ? `· ${report.issues.length} issue${report.issues.length === 1 ? '' : 's'}` : '· OK'}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setDismissed(true); } }}
            className="rounded p-0.5 hover:bg-muted"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>

      <div className="grid grid-cols-2 gap-1 border-b border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
        <div><span className="font-bold text-foreground">{report.fileName}</span></div>
        <div className="text-right">{report.durationMs} ms</div>
        <div>Slides: <span className="font-bold text-foreground">{report.slidesParsed}</span></div>
        <div className="text-right">
          Media: <span className="font-bold text-foreground">{report.mediaLoaded}</span>
          {report.mediaSkipped > 0 && <span className="text-amber-600"> · {report.mediaSkipped} skipped</span>}
          {' / '}{report.mediaTotal}
        </div>
        <div>Pics OK: <span className="font-bold text-foreground">{report.picturesResolved}</span></div>
        <div className="text-right">
          {report.picturesUnresolved > 0 ? (
            <span className="text-rose-600">Unresolved: <span className="font-bold">{report.picturesUnresolved}</span></span>
          ) : (
            <span>Unresolved: 0</span>
          )}
        </div>
      </div>

      {open && (
        <div className="max-h-[280px] overflow-auto p-2">
          {!hasIssues && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> All embedded images and SVGs imported cleanly.
            </div>
          )}
          {hasIssues && (
            <ul className="space-y-1.5">
              {report.issues.map((issue, idx) => (
                <li key={idx} className="rounded-xl border border-border/70 bg-background/70 p-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', scopeBadge[issue.scope])}>
                      {issue.scope}
                    </span>
                    {issue.scopeId && <span className="text-[10px] text-muted-foreground">{issue.scopeId}</span>}
                    {issue.path && <span className="ml-auto truncate text-[10px] font-mono text-muted-foreground" title={issue.path}>{issue.path}</span>}
                  </div>
                  <div className="mt-1 font-bold text-foreground">{issue.reason}</div>
                  {issue.detail && <div className="mt-0.5 break-all text-[10px] text-muted-foreground">{issue.detail}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1 rounded-b-2xl px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted"
        >
          <Bug className="h-3 w-3" /> Show details
        </button>
      )}
    </div>
  );
};

export default PptxImportDebugPanel;
