import React, { useState, useEffect } from 'react';
import type { GeneratedAsset, PdfExportOptions } from '../types';
import { printDimensionsMap, paperSizes } from '../utils';
import Spinner from './Spinner';
import { 
  rgbToCmyk, 
  hexToRgb, 
  formatCmyk, 
  getPrintWarning,
  runPrintPreflight,
  getDefaultPrintSpec,
  type PreflightResult
} from '../services/printService';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PdfExportOptions & { colorMode: 'CMYK' | 'RGB'; showSafeZone: boolean; safeZone: number; dpi: number }) => void;
  asset: GeneratedAsset;
  isExporting?: boolean;
}

const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, onExport, asset, isExporting = false }) => {
  const assetDims = printDimensionsMap[asset.type];
  const isLargeFormat = assetDims && (assetDims.w > 17 || assetDims.h > 17);
  const defaultSpec = getDefaultPrintSpec(asset.type);

  const [paperSize, setPaperSize] = useState(isLargeFormat ? 'custom' : 'letter');
  const [bleed, setBleed] = useState(defaultSpec.bleed);
  const [showTrimMarks, setShowTrimMarks] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [safeZone, setSafeZone] = useState(defaultSpec.safeZone);
  const [colorMode, setColorMode] = useState<'CMYK' | 'RGB'>('CMYK');
  const [dpi, setDpi] = useState(defaultSpec.dpi);
  const [preflightResult, setPreflightResult] = useState<PreflightResult | null>(null);
  const [isRunningPreflight, setIsRunningPreflight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setPaperSize(isLargeFormat ? 'custom' : 'letter');
    setBleed(defaultSpec.bleed);
    setSafeZone(defaultSpec.safeZone);
    setDpi(defaultSpec.dpi);
  }, [asset, isLargeFormat, defaultSpec.bleed, defaultSpec.safeZone, defaultSpec.dpi]);

  // Run preflight check when modal opens
  useEffect(() => {
    if (isOpen && typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
      setIsRunningPreflight(true);
      runPrintPreflight(asset.content, asset.type, {
        width: assetDims?.w || 8.5,
        height: assetDims?.h || 11,
        bleed,
        dpi,
        colorMode,
        showTrimMarks,
        showBleedArea: true,
        showSafeZone,
        safeZone
      }).then(result => {
        setPreflightResult(result);
        setIsRunningPreflight(false);
      }).catch(() => setIsRunningPreflight(false));
    }
  }, [isOpen, asset, bleed, dpi, colorMode, showTrimMarks, showSafeZone, safeZone, assetDims]);

  const handleExportClick = () => {
    onExport({ paperSize, bleed, showTrimMarks, colorMode, showSafeZone, safeZone, dpi });
  };

  if (!isOpen) return null;

  const selectedPaperDims = paperSize === 'custom' ? assetDims : paperSizes[paperSize];
  const canFitOnPaper = selectedPaperDims && assetDims && 
    (assetDims.w + bleed * 2 <= selectedPaperDims.w && assetDims.h + bleed * 2 <= selectedPaperDims.h);

  const inputClass = "w-full bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Professional Print Export</h2>
            <p className="text-sm text-muted-foreground mt-1">{asset.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Preflight Status */}
          {isRunningPreflight ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="w-4 h-4" />
              Running print preflight check...
            </div>
          ) : preflightResult && (
            <div className={`rounded-xl p-4 border ${preflightResult.passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {preflightResult.passed ? (
                  <>
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-emerald-500">Print Ready</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium text-amber-500">Preflight Warnings</span>
                  </>
                )}
              </div>
              {preflightResult.warnings.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {preflightResult.warnings.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{w.message}{w.suggestion && <span className="text-muted-foreground/70"> ({w.suggestion})</span>}</span>
                    </li>
                  ))}
                </ul>
              )}
              {preflightResult.errors.length > 0 && (
                <ul className="text-xs text-destructive space-y-1 mt-2">
                  {preflightResult.errors.map((e, i) => (
                    <li key={i} className="flex gap-2">
                      <span>✕</span>
                      <span>{e.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Asset dimensions info */}
          {assetDims && (
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Final Print Size</p>
                  <p className="text-lg font-bold text-primary">{assetDims.w}" × {assetDims.h}"</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">With bleed</p>
                  <p className="text-sm font-medium text-foreground">{(assetDims.w + bleed * 2).toFixed(2)}" × {(assetDims.h + bleed * 2).toFixed(2)}"</p>
                </div>
                {isLargeFormat && (
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-full">
                    Large Format
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Paper size selector */}
            <div>
              <label htmlFor="paper-size" className="block text-sm font-medium text-foreground mb-2">Paper Size</label>
              <select id="paper-size" value={paperSize} onChange={e => setPaperSize(e.target.value)} className={inputClass}>
                <option value="custom">Match Asset</option>
                <optgroup label="Standard Sizes">
                  <option value="letter">Letter (8.5" × 11")</option>
                  <option value="legal">Legal (8.5" × 14")</option>
                  <option value="tabloid">Tabloid (11" × 17")</option>
                </optgroup>
                <optgroup label="International">
                  <option value="a4">A4 (8.27" × 11.69")</option>
                  <option value="a3">A3 (11.69" × 16.54")</option>
                </optgroup>
              </select>
              {paperSize !== 'custom' && !canFitOnPaper && (
                <p className="text-xs text-amber-500 mt-1">Will be scaled to fit</p>
              )}
            </div>

            {/* DPI selector */}
            <div>
              <label htmlFor="dpi" className="block text-sm font-medium text-foreground mb-2">Resolution (DPI)</label>
              <select id="dpi" value={dpi} onChange={e => setDpi(parseInt(e.target.value))} className={inputClass}>
                <option value="150">150 DPI (Large Format)</option>
                <option value="300">300 DPI (Standard Print)</option>
                <option value="600">600 DPI (High Quality)</option>
              </select>
            </div>
          </div>

          {/* Bleed settings */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bleed Margin</label>
            <div className="flex gap-2">
              {[0, 0.125, 0.25, 0.5].map(val => (
                <button
                  key={val}
                  onClick={() => setBleed(val)}
                  className={`flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all ${bleed === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {val === 0 ? 'None' : `${val}"`}
                </button>
              ))}
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={bleed}
                onChange={e => setBleed(parseFloat(e.target.value) || 0)}
                className="w-20 bg-secondary/50 border border-border text-foreground rounded-lg p-2 text-center text-xs"
                placeholder="Custom"
              />
            </div>
          </div>

          {/* Color mode with CMYK preview */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setColorMode('CMYK')}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${colorMode === 'CMYK' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                <span className="block font-bold">CMYK</span>
                <span className="block text-xs opacity-70">Print-optimized colors</span>
              </button>
              <button
                onClick={() => setColorMode('RGB')}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${colorMode === 'RGB' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                <span className="block font-bold">RGB</span>
                <span className="block text-xs opacity-70">Digital display</span>
              </button>
            </div>
            {colorMode === 'CMYK' && (
              <div className="mt-3 p-3 bg-secondary/20 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-sm bg-cyan-400" title="Cyan"></div>
                    <div className="w-4 h-4 rounded-sm bg-pink-500" title="Magenta"></div>
                    <div className="w-4 h-4 rounded-sm bg-yellow-400" title="Yellow"></div>
                    <div className="w-4 h-4 rounded-sm bg-black" title="Key (Black)"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">CMYK color separation will be applied</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Colors will be converted to CMYK colorspace. Some vibrant RGB colors may appear slightly different in print.
                </p>
              </div>
            )}
          </div>

          {/* Print marks options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground mb-2">Print Marks</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showTrimMarks}
                  onChange={e => setShowTrimMarks(e.target.checked)}
                  className="h-4 w-4 rounded bg-secondary border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-foreground font-medium">Trim Marks</span>
                  <p className="text-[10px] text-muted-foreground">Corner cut guides + registration</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showSafeZone}
                  onChange={e => setShowSafeZone(e.target.checked)}
                  className="h-4 w-4 rounded bg-secondary border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-foreground font-medium">Safe Zone</span>
                  <p className="text-[10px] text-muted-foreground">Keep text inside ({safeZone}" margin)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Specifications
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Size:</span>
                <span className="font-medium text-foreground">{assetDims ? `${(assetDims.w + bleed * 2).toFixed(2)}" × ${(assetDims.h + bleed * 2).toFixed(2)}"` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trim Size:</span>
                <span className="font-medium text-foreground">{assetDims ? `${assetDims.w}" × ${assetDims.h}"` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bleed:</span>
                <span className="font-medium text-foreground">{bleed > 0 ? `${bleed}" all sides` : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Safe Zone:</span>
                <span className="font-medium text-foreground">{safeZone}" inside</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color Profile:</span>
                <span className="font-medium text-foreground">{colorMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resolution:</span>
                <span className="font-medium text-foreground">{dpi} DPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trim Marks:</span>
                <span className="font-medium text-foreground">{showTrimMarks ? 'Included' : 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color Bars:</span>
                <span className="font-medium text-foreground">{colorMode === 'CMYK' && showTrimMarks ? 'Included' : 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={isExporting}>Cancel</button>
          <button onClick={handleExportClick} className="btn-primary flex items-center gap-2" disabled={isExporting}>
            {isExporting ? (
              <>
                <Spinner className="w-4 h-4" />
                Generating PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Print-Ready PDF
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PdfExportModal;
