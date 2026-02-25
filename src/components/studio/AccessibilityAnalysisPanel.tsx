import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Accessibility, Eye, EyeOff, Type, Contrast, CheckCircle2, XCircle,
  AlertTriangle, Info, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Brand } from '@/types/studio.types';

// ── Contrast helpers ──────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(c1: [number, number, number], c2: [number, number, number]) {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

// ── Color-blindness simulation (Brettel 1997 simplified) ──

type CbType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const CB_LABELS: Record<CbType, string> = {
  protanopia: 'Protanopia (no red)',
  deuteranopia: 'Deuteranopia (no green)',
  tritanopia: 'Tritanopia (no blue)',
  achromatopsia: 'Achromatopsia (no color)',
};

function simulateCb(rgb: [number, number, number], type: CbType): [number, number, number] {
  const [r, g, b] = rgb.map(c => c / 255);
  let nr: number, ng: number, nb: number;
  switch (type) {
    case 'protanopia':
      nr = 0.567 * r + 0.433 * g;
      ng = 0.558 * r + 0.442 * g;
      nb = 0.242 * g + 0.758 * b;
      break;
    case 'deuteranopia':
      nr = 0.625 * r + 0.375 * g;
      ng = 0.7 * r + 0.3 * g;
      nb = 0.3 * g + 0.7 * b;
      break;
    case 'tritanopia':
      nr = 0.95 * r + 0.05 * g;
      ng = 0.433 * g + 0.567 * b;
      nb = 0.475 * g + 0.525 * b;
      break;
    case 'achromatopsia': {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      nr = ng = nb = gray;
      break;
    }
  }
  return [Math.round(nr! * 255), Math.round(ng! * 255), Math.round(nb! * 255)];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}

// ── Readability scoring ───────────────────────────────────

interface ReadabilityCheck {
  label: string;
  pass: boolean;
  detail: string;
}

function scoreReadability(fontSize: number, fontWeight: number, lineHeight: number, contrastVal: number): ReadabilityCheck[] {
  const checks: ReadabilityCheck[] = [];
  checks.push({
    label: 'Minimum font size',
    pass: fontSize >= 16,
    detail: fontSize >= 16 ? `${fontSize}px meets 16px minimum` : `${fontSize}px below 16px minimum for body text`,
  });
  checks.push({
    label: 'Line height',
    pass: lineHeight >= 1.4,
    detail: lineHeight >= 1.4 ? `${lineHeight} meets 1.4× minimum` : `${lineHeight} below 1.4× recommended`,
  });
  checks.push({
    label: 'Font weight',
    pass: fontWeight >= 400,
    detail: fontWeight >= 400 ? `Weight ${fontWeight} is readable` : `Weight ${fontWeight} may be too thin`,
  });
  checks.push({
    label: 'Contrast (body text)',
    pass: contrastVal >= 4.5,
    detail: contrastVal >= 4.5 ? `${contrastVal.toFixed(1)}:1 passes AA` : `${contrastVal.toFixed(1)}:1 fails AA (need 4.5:1)`,
  });
  return checks;
}

// ── Component ─────────────────────────────────────────────

interface AccessibilityAnalysisPanelProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
}

export const AccessibilityAnalysisPanel: React.FC<AccessibilityAnalysisPanelProps> = ({
  isOpen,
  onClose,
  brand,
}) => {
  const [activeCbType, setActiveCbType] = useState<CbType>('protanopia');
  const [expandedSection, setExpandedSection] = useState<string | null>('contrast');

  // Extract brand colors
  const brandColors = useMemo(() => {
    if (!brand?.styles) return { primary: '#3b82f6', secondary: '#10b981', accent: '#f59e0b', bg: '#ffffff', fg: '#111827' };
    return {
      primary: brand.styles.primary_color || '#3b82f6',
      secondary: brand.styles.secondary_color || '#10b981',
      accent: brand.styles.accent_color || '#f59e0b',
      bg: '#ffffff',
      fg: '#111827',
    };
  }, [brand]);

  // Contrast analysis for all color pairs
  const contrastResults = useMemo(() => {
    const colors = [
      { name: 'Primary', hex: brandColors.primary },
      { name: 'Secondary', hex: brandColors.secondary },
      { name: 'Accent', hex: brandColors.accent },
    ];
    const backgrounds = [
      { name: 'White', hex: '#ffffff' },
      { name: 'Dark', hex: '#111827' },
    ];
    const results: { fg: string; bg: string; fgHex: string; bgHex: string; ratio: number; level: WcagLevel }[] = [];
    for (const c of colors) {
      for (const bg of backgrounds) {
        const cRgb = hexToRgb(c.hex);
        const bgRgb = hexToRgb(bg.hex);
        if (cRgb && bgRgb) {
          const ratio = contrastRatio(cRgb, bgRgb);
          results.push({ fg: c.name, bg: bg.name, fgHex: c.hex, bgHex: bg.hex, ratio, level: wcagLevel(ratio) });
        }
      }
    }
    return results;
  }, [brandColors]);

  // Color blindness simulated palette
  const cbPalette = useMemo(() => {
    const colors = [
      { name: 'Primary', hex: brandColors.primary },
      { name: 'Secondary', hex: brandColors.secondary },
      { name: 'Accent', hex: brandColors.accent },
    ];
    return colors.map(c => {
      const rgb = hexToRgb(c.hex);
      if (!rgb) return { ...c, simulated: c.hex };
      return { ...c, simulated: rgbToHex(simulateCb(rgb, activeCbType)) };
    });
  }, [brandColors, activeCbType]);

  // Readability
  const readabilityChecks = useMemo(() => {
    const primaryRgb = hexToRgb(brandColors.primary);
    const bgRgb = hexToRgb('#ffffff');
    const ratio = primaryRgb && bgRgb ? contrastRatio(primaryRgb, bgRgb) : 1;
    return scoreReadability(16, 400, 1.5, ratio);
  }, [brandColors]);

  const overallScore = useMemo(() => {
    const passing = contrastResults.filter(r => r.level !== 'Fail').length;
    const readPassing = readabilityChecks.filter(r => r.pass).length;
    const total = contrastResults.length + readabilityChecks.length;
    const score = Math.round(((passing + readPassing) / total) * 100);
    return score;
  }, [contrastResults, readabilityChecks]);

  const scoreColor = overallScore >= 80 ? 'text-green-600 dark:text-green-400' : overallScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-destructive';

  if (!isOpen) return null;

  const toggle = (section: string) => setExpandedSection(prev => prev === section ? null : section);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 340, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="border-l bg-card h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Accessibility</h3>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Overall Score */}
          <div className="text-center py-4 px-3 rounded-xl border bg-muted/30">
            <p className={`text-4xl font-bold ${scoreColor}`}>{overallScore}%</p>
            <p className="text-xs text-muted-foreground mt-1">Accessibility Score</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {overallScore >= 80 ? (
                <Badge variant="secondary" className="gap-1 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-3 w-3" /> Good
                </Badge>
              ) : overallScore >= 50 ? (
                <Badge variant="secondary" className="gap-1 text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertTriangle className="h-3 w-3" /> Needs Work
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> Poor
                </Badge>
              )}
            </div>
          </div>

          {!brand && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Select a brand to analyze its color palette for accessibility compliance.</p>
            </div>
          )}

          <Separator />

          {/* ── Contrast Checker ── */}
          <button
            onClick={() => toggle('contrast')}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-primary" />
              WCAG Contrast
            </span>
            {expandedSection === 'contrast' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expandedSection === 'contrast' && (
            <div className="space-y-2">
              {contrastResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-background text-xs">
                  <div className="flex gap-1 shrink-0">
                    <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: r.fgHex }} />
                    <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: r.bgHex }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.fg} on {r.bg}</p>
                    <p className="text-muted-foreground">{r.ratio.toFixed(1)}:1</p>
                  </div>
                  <Badge
                    variant={r.level === 'Fail' ? 'destructive' : 'secondary'}
                    className={`text-[10px] px-1.5 ${r.level === 'AAA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : r.level === 'AA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : r.level === 'AA Large' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}`}
                  >
                    {r.level}
                  </Badge>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-1">AA = 4.5:1 normal text · AAA = 7:1 · AA Large = 3:1 (18px+)</p>
            </div>
          )}

          <Separator />

          {/* ── Color Blindness ── */}
          <button
            onClick={() => toggle('colorblind')}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Color Blindness
            </span>
            {expandedSection === 'colorblind' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expandedSection === 'colorblind' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {(Object.keys(CB_LABELS) as CbType[]).map(t => (
                  <Button
                    key={t}
                    size="sm"
                    variant={activeCbType === t ? 'default' : 'outline'}
                    className="text-[11px] h-7 px-2"
                    onClick={() => setActiveCbType(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1, 5)}…
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{CB_LABELS[activeCbType]}</p>

              <div className="space-y-2">
                {cbPalette.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-md border" style={{ backgroundColor: c.hex }} />
                      <span className="text-muted-foreground">→</span>
                      <span className="w-7 h-7 rounded-md border" style={{ backgroundColor: c.simulated }} />
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-muted-foreground">{c.hex} → {c.simulated}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Distinguishability warning */}
              {cbPalette.length >= 2 && cbPalette[0].simulated === cbPalette[1].simulated && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <p>Primary and Secondary look identical under {activeCbType}. Consider adjusting.</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* ── Readability ── */}
          <button
            onClick={() => toggle('readability')}
            className="flex items-center justify-between w-full text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              Readability
            </span>
            {expandedSection === 'readability' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {expandedSection === 'readability' && (
            <div className="space-y-2">
              {readabilityChecks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg border bg-background text-xs">
                  {check.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{check.label}</p>
                    <p className="text-muted-foreground">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Quick tips */}
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Quick Tips</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use 4.5:1 minimum contrast for body text</li>
              <li>Don't rely on color alone to convey meaning</li>
              <li>Keep body text ≥16px for readability</li>
              <li>Test with screen readers for full compliance</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default AccessibilityAnalysisPanel;
