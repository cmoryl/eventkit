import React, { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DeckOutline, SlideOutline } from "../DeckPreview";

interface Props {
  /** Original user-supplied source (paste text or topic prompt). */
  source: string;
  outline: DeckOutline;
}

/* ---------- extraction helpers ---------- */

// Strip markdown markers, leading bullets, surrounding quotes/whitespace.
const clean = (s: string): string =>
  s
    .replace(/^[\s>*•·\-–—]+/g, "")
    .replace(/[*_`]+/g, "")
    .replace(/^["""'']+|["""'']+$/g, "")
    .trim();

// Drop tiny words; keep meaningful content tokens for fuzzy compare.
const tokenize = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9%+\.\-\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

// Loose containment: ≥60% of source tokens present anywhere in haystack.
const isCovered = (needle: string, haystack: string): boolean => {
  const nTokens = tokenize(needle);
  if (nTokens.length === 0) return true;
  const hay = haystack.toLowerCase();
  const hits = nTokens.filter((t) => hay.includes(t)).length;
  return hits / nTokens.length >= 0.6;
};

interface SourceItem {
  kind: "bullet" | "stat" | "heading";
  text: string;
  /** Slide label parsed from "Slide N:" if present. */
  slideHint?: string;
}

/** Parse source text into bullets, stats, and section headings. */
const extractSourceItems = (source: string): SourceItem[] => {
  const out: SourceItem[] = [];
  if (!source.trim()) return out;

  let currentSlideHint: string | undefined;
  const lines = source.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Slide heading like "Slide 3: The Problem"
    const slideHead = line.match(/^slide\s*\d+\s*[:\-—]\s*(.+)/i);
    if (slideHead) {
      currentSlideHint = slideHead[1].trim();
      out.push({ kind: "heading", text: clean(slideHead[1]), slideHint: currentSlideHint });
      continue;
    }

    // Bulleted line
    const isBullet = /^[\s]*[•·\-–—*]/.test(raw) || /^\s*\d+[.)]\s+/.test(raw);
    const cleaned = clean(line);
    if (!cleaned) continue;

    // Detect stat-like lines (contain a percent, big number, or +/- number)
    const hasStat = /([+\-]?\d{1,3}(?:[.,]\d+)?\s?%|\$\s?\d|[+\-]?\d{2,}|\d+x)/i.test(cleaned);

    if (isBullet) {
      out.push({
        kind: hasStat ? "stat" : "bullet",
        text: cleaned,
        slideHint: currentSlideHint,
      });
    } else if (hasStat && cleaned.length < 160) {
      // Inline standalone stat sentence
      out.push({ kind: "stat", text: cleaned, slideHint: currentSlideHint });
    }
  }

  // De-dupe by text (case-insensitive)
  const seen = new Set<string>();
  return out.filter((it) => {
    const k = it.text.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/** Flatten an outline slide into a single searchable string + per-slide bag. */
const slideToText = (s: SlideOutline): string => {
  const parts: string[] = [s.title || "", s.subtitle || "", s.notes || "", s.designNotes || ""];
  if (s.bullets) parts.push(...s.bullets);
  if (s.stat) parts.push(s.stat.value, s.stat.label);
  if (s.quote) parts.push(s.quote.text, s.quote.attribution || "");
  if (s.leftColumn) parts.push(s.leftColumn.heading, ...(s.leftColumn.bullets || []));
  if (s.rightColumn) parts.push(s.rightColumn.heading, ...(s.rightColumn.bullets || []));
  if (s.kpis) s.kpis.forEach((k) => parts.push(k.value, k.label, k.sublabel || "", k.trend || ""));
  if (s.metrics) s.metrics.forEach((m) => parts.push(m.value, m.label, m.sublabel || ""));
  if (s.agenda) s.agenda.forEach((a) => parts.push(a.step, a.title, a.body || ""));
  if (s.timeline) s.timeline.forEach((t) => parts.push(t.when, t.title, t.body || "", ...(t.deliverables || [])));
  if (s.comparison) {
    parts.push(s.comparison.heading || "");
    parts.push(s.comparison.before.title, ...s.comparison.before.points);
    parts.push(s.comparison.after.title, ...s.comparison.after.points);
  }
  if (s.team) s.team.forEach((t) => parts.push(t.name, t.role, t.location || "", t.focus || ""));
  if (s.process) s.process.forEach((p) => parts.push(p.step, p.title, p.body || ""));
  if (s.chart?.data) s.chart.data.forEach((d) => parts.push(d.label, String(d.value)));
  return parts.filter(Boolean).join(" \n ");
};

interface DiffResult {
  total: number;
  covered: SourceItem[];
  missing: SourceItem[];
  byKind: Record<SourceItem["kind"], { covered: number; missing: number }>;
}

const computeDiff = (source: string, outline: DeckOutline): DiffResult => {
  const items = extractSourceItems(source);
  const haystack = outline.slides.map(slideToText).join(" \n ").toLowerCase();
  const covered: SourceItem[] = [];
  const missing: SourceItem[] = [];
  const byKind: DiffResult["byKind"] = {
    bullet: { covered: 0, missing: 0 },
    stat: { covered: 0, missing: 0 },
    heading: { covered: 0, missing: 0 },
  };
  for (const it of items) {
    if (isCovered(it.text, haystack)) {
      covered.push(it);
      byKind[it.kind].covered++;
    } else {
      missing.push(it);
      byKind[it.kind].missing++;
    }
  }
  return { total: items.length, covered, missing, byKind };
};

/* ---------- component ---------- */

export const ContentIntegrityReport: React.FC<Props> = ({ source, outline }) => {
  const [open, setOpen] = useState(true);
  const diff = useMemo(() => computeDiff(source, outline), [source, outline]);

  if (!source.trim() || diff.total === 0) return null;

  const coveragePct = Math.round((diff.covered.length / diff.total) * 100);
  const allClean = diff.missing.length === 0;

  const statusColor = allClean
    ? "border-emerald-400/40 bg-emerald-400/[0.06]"
    : coveragePct >= 80
      ? "border-amber-400/40 bg-amber-400/[0.06]"
      : "border-rose-400/40 bg-rose-400/[0.08]";

  return (
    <Card
      className={`p-3 border ${statusColor}`}
      style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 text-left"
      >
        {allClean ? (
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-300" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">
            Content integrity · {coveragePct}% of your source preserved
          </div>
          <div className="text-[11px] text-white/60">
            {diff.covered.length} of {diff.total} items found in slides
            {diff.missing.length > 0 && ` · ${diff.missing.length} missing`}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/80">
            bullets {diff.byKind.bullet.covered}/{diff.byKind.bullet.covered + diff.byKind.bullet.missing}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-white/20 text-white/80">
            stats {diff.byKind.stat.covered}/{diff.byKind.stat.covered + diff.byKind.stat.missing}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4 text-white/60" /> : <ChevronDown className="h-4 w-4 text-white/60" />}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {diff.missing.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-rose-200/90 font-semibold flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Missing from slides ({diff.missing.length})
              </div>
              <ul className="space-y-1">
                {diff.missing.map((m, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-white/90 bg-rose-500/10 border border-rose-400/30 rounded-md px-2 py-1.5 flex items-start gap-2"
                  >
                    <span className="text-[9px] uppercase tracking-wider text-rose-200/90 font-semibold mt-0.5 shrink-0">
                      {m.kind}
                    </span>
                    <span className="flex-1 break-words">
                      {m.text}
                      {m.slideHint && (
                        <span className="block text-[10px] text-white/50 italic mt-0.5">
                          from "{m.slideHint}"
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-white/55 italic">
                Tip: Run "AI populate all" or paste these into the matching slide. They won't be
                added to the deck unless they appear in the outline above.
              </p>
            </div>
          )}

          {diff.covered.length > 0 && (
            <details className="group">
              <summary className="text-[10px] uppercase tracking-wider text-emerald-200/90 font-semibold flex items-center gap-1 cursor-pointer list-none">
                <CheckCircle2 className="h-3 w-3" /> Preserved ({diff.covered.length}) ·{" "}
                <span className="text-white/50 group-open:hidden">show</span>
                <span className="text-white/50 hidden group-open:inline">hide</span>
              </summary>
              <ul className="mt-1.5 space-y-0.5 max-h-40 overflow-auto pr-1">
                {diff.covered.map((c, idx) => (
                  <li key={idx} className="text-[11px] text-white/70 truncate">
                    ✓ {c.text}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </Card>
  );
};
