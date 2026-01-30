import React, { useState, useEffect } from 'react';
import type { GeneratedAsset, PdfExportOptions } from '../types';
import { printDimensionsMap, paperSizes } from '../utils';
import Spinner from './Spinner';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PdfExportOptions) => void;
  asset: GeneratedAsset;
  isExporting?: boolean;
}

const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, onExport, asset, isExporting = false }) => {
  const assetDims = printDimensionsMap[asset.type];
  const isLargeFormat = assetDims && (assetDims.w > 17 || assetDims.h > 17);
  const defaultPaperSize = isLargeFormat ? 'custom' : 'letter';

  const [paperSize, setPaperSize] = useState(defaultPaperSize);
  const [bleed, setBleed] = useState(0.125);
  const [showTrimMarks, setShowTrimMarks] = useState(true);
  const [colorMode, setColorMode] = useState<'rgb' | 'cmyk'>('cmyk');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Reset to defaults when asset changes
    setPaperSize(isLargeFormat ? 'custom' : 'letter');
  }, [asset, isLargeFormat]);

  const handleExportClick = () => {
    onExport({ paperSize, bleed, showTrimMarks });
  };

  if (!isOpen) return null;

  const selectedPaperDims = paperSize === 'custom' ? assetDims : paperSizes[paperSize];
  const canFitOnPaper = selectedPaperDims && assetDims && 
    (assetDims.w + bleed * 2 <= selectedPaperDims.w && assetDims.h + bleed * 2 <= selectedPaperDims.h);

  const inputClass = "w-full bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Print-Ready PDF Export</h2>
            <p className="text-sm text-muted-foreground mt-1">{asset.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 space-y-6">
          {/* Asset dimensions info */}
          {assetDims && (
            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Asset Dimensions</p>
                  <p className="text-lg font-bold text-primary">{assetDims.w}" × {assetDims.h}"</p>
                </div>
                {isLargeFormat && (
                  <span className="ml-auto px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-full">
                    Large Format
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Paper size selector */}
          <div>
            <label htmlFor="paper-size" className="block text-sm font-medium text-foreground mb-2">Paper Size</label>
            <select id="paper-size" value={paperSize} onChange={e => setPaperSize(e.target.value)} className={inputClass}>
              <option value="custom">Match Asset ({assetDims?.w}" × {assetDims?.h}")</option>
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
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Asset exceeds selected paper size - will be scaled to fit
              </p>
            )}
          </div>

          {/* Bleed settings */}
          <div>
            <label htmlFor="bleed-size" className="block text-sm font-medium text-foreground mb-2">
              Bleed Margin
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setBleed(0)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${bleed === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                None
              </button>
              <button
                onClick={() => setBleed(0.125)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${bleed === 0.125 ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                1/8"
              </button>
              <button
                onClick={() => setBleed(0.25)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${bleed === 0.25 ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                1/4"
              </button>
              <div className="flex-1">
                <input
                  id="bleed-size"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={bleed}
                  onChange={e => setBleed(parseFloat(e.target.value) || 0)}
                  className={inputClass + " text-center"}
                  placeholder="Custom"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Extra margin for print trimming (industry standard: 0.125")</p>
          </div>

          {/* Color mode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setColorMode('cmyk')}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${colorMode === 'cmyk' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                <span className="block font-bold">CMYK</span>
                <span className="block text-xs opacity-70">Print optimized</span>
              </button>
              <button
                onClick={() => setColorMode('rgb')}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${colorMode === 'rgb' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
              >
                <span className="block font-bold">RGB</span>
                <span className="block text-xs opacity-70">Digital display</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
              <input
                type="checkbox"
                checked={showTrimMarks}
                onChange={e => setShowTrimMarks(e.target.checked)}
                className="h-5 w-5 rounded bg-secondary border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-foreground font-medium">Include Trim Marks</span>
                <p className="text-xs text-muted-foreground">Shows where to cut the paper</p>
              </div>
            </label>
          </div>

          {/* Preview summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Export Summary</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Paper: {paperSize === 'custom' ? `${assetDims?.w}" × ${assetDims?.h}"` : paperSize.charAt(0).toUpperCase() + paperSize.slice(1)}</li>
              <li>• Bleed: {bleed > 0 ? `${bleed}" on all sides` : 'None'}</li>
              <li>• Color: {colorMode.toUpperCase()}</li>
              <li>• Trim marks: {showTrimMarks ? 'Yes' : 'No'}</li>
              <li>• Resolution: 300 DPI (print quality)</li>
            </ul>
          </div>
        </div>

        <footer className="p-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={isExporting}>Cancel</button>
          <button onClick={handleExportClick} className="btn-primary flex items-center gap-2" disabled={isExporting}>
            {isExporting ? (
              <>
                <Spinner className="w-4 h-4" />
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PdfExportModal;
