import React, { useState, useEffect } from 'react';
import type { GeneratedAsset, PdfExportOptions } from '../types';
import { printDimensionsMap } from '../utils';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PdfExportOptions) => void;
  asset: GeneratedAsset;
}

const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, onExport, asset }) => {
  const assetDims = printDimensionsMap[asset.type];
  const defaultPaperSize = assetDims && (assetDims.w > 11 || assetDims.h > 11) ? 'custom' : 'letter';

  const [paperSize, setPaperSize] = useState(defaultPaperSize);
  const [bleed, setBleed] = useState(0.125);
  const [showTrimMarks, setShowTrimMarks] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleExportClick = () => {
    onExport({ paperSize, bleed, showTrimMarks });
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">PDF Export Settings</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="paper-size" className="block text-sm font-medium text-foreground mb-2">Paper Size</label>
            <select id="paper-size" value={paperSize} onChange={e => setPaperSize(e.target.value)} className={inputClass}>
              <option value="custom">Asset Dimensions ({assetDims?.w}" x {assetDims?.h}")</option>
              <option value="letter">Letter (8.5" x 11")</option>
              <option value="legal">Legal (8.5" x 14")</option>
              <option value="tabloid">Tabloid (11" x 17")</option>
              <option value="a4">A4 (8.27" x 11.69")</option>
              <option value="a3">A3 (11.69" x 16.54")</option>
            </select>
          </div>
          <div>
            <label htmlFor="bleed-size" className="block text-sm font-medium text-foreground mb-2">Bleed (inches)</label>
            <input id="bleed-size" type="number" step="0.01" min="0" value={bleed} onChange={e => setBleed(parseFloat(e.target.value) || 0)} className={inputClass} />
            <p className="text-xs text-muted-foreground mt-1">Extra margin for print trimming</p>
          </div>
          <div>
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
        </div>

        <footer className="p-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleExportClick} className="btn-primary">Export PDF</button>
        </footer>
      </div>
    </div>
  );
};

export default PdfExportModal;
