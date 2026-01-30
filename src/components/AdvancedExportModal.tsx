import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image,
  FileArchive,
  Printer,
  Scissors,
  Settings2,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { GeneratedAsset, PdfExportOptions } from '../types';

interface AdvancedExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: GeneratedAsset[];
  eventName: string;
  onExport: (options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'zip';
  quality: number;
  scale: number;
  includeTrimMarks: boolean;
  includeBleed: boolean;
  bleedSize: number;
  colorProfile: 'sRGB' | 'CMYK' | 'AdobeRGB';
  selectedAssets: string[];
  namingConvention: 'default' | 'numbered' | 'dated';
}

const PAPER_SIZES = [
  { id: 'a4', label: 'A4 (210 × 297mm)', width: 210, height: 297 },
  { id: 'a3', label: 'A3 (297 × 420mm)', width: 297, height: 420 },
  { id: 'letter', label: 'US Letter (8.5 × 11")', width: 215.9, height: 279.4 },
  { id: 'tabloid', label: 'Tabloid (11 × 17")', width: 279.4, height: 431.8 },
  { id: 'custom', label: 'Custom Size', width: 0, height: 0 },
];

const AdvancedExportModal: React.FC<AdvancedExportModalProps> = ({
  open,
  onOpenChange,
  assets,
  eventName,
  onExport,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 100,
    scale: 1,
    includeTrimMarks: false,
    includeBleed: false,
    bleedSize: 3,
    colorProfile: 'sRGB',
    selectedAssets: assets.map(a => a.id),
    namingConvention: 'default',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState('a4');

  const exportableAssets = assets.filter(a => 
    !a.isLoading && 
    (typeof a.content === 'string' && a.content.startsWith('data:image'))
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleAsset = (id: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedAssets: prev.selectedAssets.includes(id)
        ? prev.selectedAssets.filter(a => a !== id)
        : [...prev.selectedAssets, id],
    }));
  };

  const selectAll = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedAssets: exportableAssets.map(a => a.id),
    }));
  };

  const selectNone = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedAssets: [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Advanced Export Options
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Asset Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Select Assets</h3>
              <div className="flex gap-2 text-sm">
                <button onClick={selectAll} className="text-primary hover:underline">
                  All
                </button>
                <span className="text-muted-foreground">|</span>
                <button onClick={selectNone} className="text-primary hover:underline">
                  None
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 p-2 rounded-xl bg-secondary/20 border border-border">
              {exportableAssets.map(asset => (
                <label
                  key={asset.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    exportOptions.selectedAssets.includes(asset.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-background border border-transparent hover:bg-secondary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={exportOptions.selectedAssets.includes(asset.id)}
                    onChange={() => toggleAsset(asset.id)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    exportOptions.selectedAssets.includes(asset.id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {exportOptions.selectedAssets.includes(asset.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0">
                    {typeof asset.content === 'string' && asset.content.startsWith('data:image') && (
                      <img src={asset.content} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {asset.title}
                  </span>
                </label>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {exportOptions.selectedAssets.length} of {exportableAssets.length} assets selected
            </p>
          </div>

          {/* Right Column - Export Settings */}
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Export Format</h3>
              <div className="grid grid-cols-5 gap-2">
                {(['png', 'jpg', 'pdf', 'svg', 'zip'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      exportOptions.format === format
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {format === 'png' && <Image className="w-5 h-5 mx-auto mb-1" />}
                    {format === 'jpg' && <Image className="w-5 h-5 mx-auto mb-1" />}
                    {format === 'pdf' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                    {format === 'svg' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                    {format === 'zip' && <FileArchive className="w-5 h-5 mx-auto mb-1" />}
                    <span className="text-xs font-medium uppercase">{format}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            {(exportOptions.format === 'jpg' || exportOptions.format === 'png') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quality: {exportOptions.quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={exportOptions.quality}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}

            {/* Scale */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scale: {exportOptions.scale}x
              </label>
              <div className="flex gap-2">
                {[0.5, 1, 2, 3, 4].map(scale => (
                  <button
                    key={scale}
                    onClick={() => setExportOptions(prev => ({ ...prev, scale }))}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.scale === scale
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </div>

            {/* Print Options */}
            {exportOptions.format === 'pdf' && (
              <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print Options
                </h4>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Paper Size</label>
                  <select
                    value={selectedPaperSize}
                    onChange={(e) => setSelectedPaperSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    {PAPER_SIZES.map(size => (
                      <option key={size.id} value={size.id}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTrimMarks}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTrimMarks: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Include trim marks</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeBleed}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeBleed: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Include bleed area</span>
                </label>

                {exportOptions.includeBleed && (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Bleed Size (mm)</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={exportOptions.bleedSize}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, bleedSize: parseInt(e.target.value) || 3 }))}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Color Profile */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Color Profile</label>
              <div className="flex gap-2">
                {(['sRGB', 'CMYK', 'AdobeRGB'] as const).map(profile => (
                  <button
                    key={profile}
                    onClick={() => setExportOptions(prev => ({ ...prev, colorProfile: profile }))}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      exportOptions.colorProfile === profile
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use CMYK for professional printing
              </p>
            </div>

            {/* Naming Convention */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">File Naming</label>
              <select
                value={exportOptions.namingConvention}
                onChange={(e) => setExportOptions(prev => ({ ...prev, namingConvention: e.target.value as ExportOptions['namingConvention'] }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="default">{eventName}_asset-name</option>
                <option value="numbered">{eventName}_001, _002, etc.</option>
                <option value="dated">{eventName}_2026-01-30_asset-name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || exportOptions.selectedAssets.length === 0}
            className="min-w-[140px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {exportOptions.selectedAssets.length} Files
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedExportModal;
