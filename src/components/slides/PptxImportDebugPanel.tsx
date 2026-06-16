import React, { useEffect, useState } from 'react';
import { AlertTriangle, Bug, CheckCircle2, ChevronDown, ChevronUp, Download, Sparkles, Wand2, X } from 'lucide-react';
import {
  applyPptxImportFixes,
  getLastPptxImportFile,
  getLastPptxImportReport,
  type PptxImportIssue,
  type PptxImportReport,
} from './importPptx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AiResolution {
  title: string;
  action: string;
  audience: 'user' | 'developer';
  affectedScopes?: string[];
  priority: 'high' | 'medium' | 'low';
}

interface AiResolveResult {
  summary: string;
  severity: 'clean' | 'minor' | 'moderate' | 'severe';
  resolutions: AiResolution[];
  followUps?: string[];
}

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
  const [aiLoading, setAiLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [aiResult, setAiResult] = useState<AiResolveResult | null>(null);

  useEffect(() => {
    setAiResult(null);
  }, [report?.fileName, report?.startedAt as unknown as number]);

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

  const triggerDownload = (filename: string, mime: string, content: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const baseName = (report.fileName || 'pptx-import').replace(/\.pptx$/i, '') + '-import-report';

  const exportJson = () => {
    triggerDownload(`${baseName}.json`, 'application/json', JSON.stringify(report, null, 2));
  };

  const exportCsv = () => {
    const header = ['scope', 'scopeId', 'reason', 'detail', 'path'];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const meta = [
      `# file,${escape(report.fileName)}`,
      `# durationMs,${report.durationMs}`,
      `# slidesParsed,${report.slidesParsed}`,
      `# mediaTotal,${report.mediaTotal}`,
      `# mediaLoaded,${report.mediaLoaded}`,
      `# mediaSkipped,${report.mediaSkipped}`,
      `# picturesResolved,${report.picturesResolved}`,
      `# picturesUnresolved,${report.picturesUnresolved}`,
    ].join('\n');
    const rows = report.issues.map((i) =>
      [i.scope, i.scopeId, i.reason, i.detail, i.path].map(escape).join(',')
    );
    triggerDownload(`${baseName}.csv`, 'text/csv', `${meta}\n${header.join(',')}\n${rows.join('\n')}\n`);
  };

  const runAiResolve = async () => {
    if (!report) return;
    setAiLoading(true);
    setOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke('resolve-pptx-issues', {
        body: { report },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'AI resolve failed');
      setAiResult({
        summary: data.summary,
        severity: data.severity,
        resolutions: data.resolutions || [],
        followUps: data.followUps || [],
      });
      toast.success('AI suggested fixes ready');
    } catch (e) {
      console.error('AI resolve error', e);
      const msg = e instanceof Error ? e.message : 'Failed to resolve issues';
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const canApplyFixes = !!getLastPptxImportFile();

  const runApplyFixes = async () => {
    if (!canApplyFixes) {
      toast.error('No imported PPTX available to re-run.');
      return;
    }
    setApplying(true);
    try {
      const result = await applyPptxImportFixes();
      if (!result) throw new Error('Re-import failed');
      const recovered = result.report?.issues.filter(i => i.reason.startsWith('Recovered')).length ?? 0;
      toast.success(
        `Re-imported ${result.slides.length} slides` + (recovered ? ` · ${recovered} recovered` : '')
      );
    } catch (e) {
      console.error('Apply fixes error', e);
      toast.error(e instanceof Error ? e.message : 'Failed to apply fixes');
    } finally {
      setApplying(false);
    }
  };

  const severityClass: Record<NonNullable<AiResolveResult['severity']>, string> = {
    clean: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    minor: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
    moderate: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    severe: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  };

  const priorityClass: Record<AiResolution['priority'], string> = {
    high: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
    medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    low: 'bg-muted text-muted-foreground border-border',
  };

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

      <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-1.5">
        <button
          type="button"
          onClick={runAiResolve}
          disabled={aiLoading || !hasIssues}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          title={hasIssues ? 'Use AI to suggest fixes' : 'No issues to resolve'}
        >
          <Sparkles className="h-3 w-3" /> {aiLoading ? 'Resolving…' : 'AI Resolve'}
        </button>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">Export</span>
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
        >
          <Download className="h-3 w-3" /> JSON
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-bold hover:bg-muted"
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      </div>

      {open && (
        <div className="max-h-[360px] overflow-auto p-2 space-y-2">
          {aiResult && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-2">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wide text-primary">AI Resolution</span>
                <span className={cn('ml-auto rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', severityClass[aiResult.severity])}>
                  {aiResult.severity}
                </span>
              </div>
              <p className="text-[11px] text-foreground">{aiResult.summary}</p>
              {aiResult.resolutions.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {aiResult.resolutions.map((r, i) => (
                    <li key={i} className="rounded-lg border border-border/70 bg-background/80 p-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', priorityClass[r.priority])}>
                          {r.priority}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.audience}</span>
                        <span className="ml-auto text-[10px] font-bold text-foreground">{r.title}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-foreground">{r.action}</div>
                      {r.affectedScopes && r.affectedScopes.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.affectedScopes.map((s, j) => (
                            <span key={j} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{s}</span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {aiResult.followUps && aiResult.followUps.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Verify after fixing</div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-foreground">
                    {aiResult.followUps.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
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
