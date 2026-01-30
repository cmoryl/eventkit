import React, { useState, useEffect } from 'react';
import { AssetType } from '../types';
import { ASSET_CONFIGS } from '../config/assetConfig';
import { 
  Download, 
  FileImage, 
  FileText, 
  Layers, 
  Package,
  Printer,
  Monitor,
  Smartphone,
  ChevronDown,
  Check,
  AlertTriangle,
  Store
} from 'lucide-react';
import { 
  getRecommendedExportSettings,
  downloadProfessionalPdf
} from '../services/printService';
import { printDimensionsMap } from '../utils';
import VendorSelector from './VendorSelector';
import { VendorTemplate } from '../config/printVendorTemplates';

interface ExportFormat {
  id: string;
  label: string;
  extension: string;
  icon: React.ElementType;
  description: string;
  isRecommended?: boolean;
}

interface ExportPreset {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  formats: string[];
  resolutions: string[];
}

interface AssetExportOptionsProps {
  assetType: AssetType;
  imageUrl?: string;
  eventName?: string;
  assetTitle?: string;
  onExport: (format: string, resolution: string, options: ExportOptions) => void;
  isExporting?: boolean;
}

interface ExportOptions {
  includeBleed: boolean;
  includeTrimMarks: boolean;
  colorProfile: 'sRGB' | 'CMYK' | 'Adobe RGB';
  compression: 'none' | 'low' | 'medium' | 'high';
  dpi?: number;
  showSafeZone?: boolean;
  safeZone?: number;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'png', label: 'PNG', extension: '.png', icon: FileImage, description: 'Lossless, transparent background support' },
  { id: 'jpg', label: 'JPEG', extension: '.jpg', icon: FileImage, description: 'Compressed, smaller file size' },
  { id: 'pdf', label: 'PDF', extension: '.pdf', icon: FileText, description: 'Print-ready with CMYK, bleed & trim', isRecommended: true },
  { id: 'svg', label: 'SVG', extension: '.svg', icon: Layers, description: 'Scalable vector format' },
];

const EXPORT_PRESETS: ExportPreset[] = [
  { 
    id: 'print', 
    label: 'Print Production', 
    description: 'High-res PDF with bleed & trim marks',
    icon: Printer,
    formats: ['pdf'],
    resolutions: ['300dpi', '600dpi']
  },
  { 
    id: 'web', 
    label: 'Web & Digital', 
    description: 'Optimized for screens and social media',
    icon: Monitor,
    formats: ['png', 'jpg'],
    resolutions: ['72dpi', '144dpi']
  },
  { 
    id: 'mobile', 
    label: 'Mobile Apps', 
    description: 'Retina-ready assets at multiple sizes',
    icon: Smartphone,
    formats: ['png'],
    resolutions: ['1x', '2x', '3x']
  },
  { 
    id: 'all', 
    label: 'Complete Package', 
    description: 'All formats in a ZIP archive',
    icon: Package,
    formats: ['png', 'jpg', 'pdf', 'svg'],
    resolutions: ['all']
  },
];

const AssetExportOptions: React.FC<AssetExportOptionsProps> = ({
  assetType,
  imageUrl,
  eventName = 'Event',
  assetTitle = 'Asset',
  onExport,
  isExporting = false
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('print');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedResolution, setSelectedResolution] = useState<string>('300dpi');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localExporting, setLocalExporting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorTemplate | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    includeBleed: true,
    includeTrimMarks: true,
    colorProfile: 'CMYK',
    compression: 'none',
    dpi: 300,
    showSafeZone: true,
    safeZone: 0.125
  });

  const config = ASSET_CONFIGS.find(c => c.type === assetType);
  const isPrintAsset = !!config?.printSpec || !!printDimensionsMap[assetType];
  const recommendedSettings = getRecommendedExportSettings(assetType);
  const dims = printDimensionsMap[assetType];

  // Update options when vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      setOptions(prev => ({
        ...prev,
        includeBleed: selectedVendor.specs.bleed > 0,
        includeTrimMarks: selectedVendor.specs.requiresTrimMarks,
        colorProfile: selectedVendor.specs.colorMode === 'CMYK' ? 'CMYK' : 'sRGB',
        dpi: selectedVendor.specs.dpi,
        showSafeZone: selectedVendor.specs.safeZone > 0,
        safeZone: selectedVendor.specs.safeZone
      }));
      setSelectedFormat(selectedVendor.specs.fileFormats[0]);
    }
  }, [selectedVendor]);

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = EXPORT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedFormat(preset.formats[0]);
      setSelectedResolution(preset.resolutions[0]);
      
      // Auto-configure options based on preset
      if (presetId === 'print') {
        setOptions(prev => ({
          ...prev,
          includeBleed: true,
          includeTrimMarks: true,
          colorProfile: 'CMYK',
          compression: 'none',
          dpi: 300,
          showSafeZone: true
        }));
      } else if (presetId === 'web') {
        setOptions(prev => ({
          ...prev,
          includeBleed: false,
          includeTrimMarks: false,
          colorProfile: 'sRGB',
          compression: 'medium',
          dpi: 72,
          showSafeZone: false
        }));
      } else if (presetId === 'mobile') {
        setOptions(prev => ({
          ...prev,
          includeBleed: false,
          includeTrimMarks: false,
          colorProfile: 'sRGB',
          compression: 'low',
          dpi: 144,
          showSafeZone: false
        }));
      }
    }
  };

  const handleExport = async () => {
    // Determine bleed based on vendor or defaults
    const getBleedAmount = () => {
      if (!options.includeBleed) return 0;
      if (selectedVendor) return selectedVendor.specs.bleed;
      return dims && (dims.w > 24 || dims.h > 24) ? 0.5 : 0.125;
    };

    // For PDF with print settings, use the professional PDF export
    if (selectedFormat === 'pdf' && isPrintAsset && imageUrl) {
      setLocalExporting(true);
      try {
        await downloadProfessionalPdf(imageUrl, assetType, assetTitle, eventName, {
          paperSize: 'custom',
          bleed: getBleedAmount(),
          showTrimMarks: options.includeTrimMarks,
          colorMode: options.colorProfile === 'CMYK' ? 'CMYK' : 'RGB',
          showSafeZone: options.showSafeZone,
          safeZone: selectedVendor?.specs.safeZone ?? options.safeZone,
          dpi: selectedVendor?.specs.dpi ?? options.dpi,
          includeJobTicket: true,
          showBleedArea: true
        });
      } catch (e) {
        console.error('PDF export failed:', e);
      } finally {
        setLocalExporting(false);
      }
    } else {
      // For other formats, use the callback
      onExport(selectedFormat, selectedResolution, options);
    }
  };

  const exporting = isExporting || localExporting;

  return (
    <div className="space-y-4">
      {/* Vendor Selector - Only for print assets */}
      {isPrintAsset && (
        <VendorSelector
          assetType={assetType}
          selectedVendor={selectedVendor}
          onSelectVendor={setSelectedVendor}
        />
      )}

      {/* Print Asset Info - Only show if no vendor selected */}
      {isPrintAsset && dims && !selectedVendor && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Printer className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Print Specifications</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
            <div>
              <span className="block text-foreground font-medium">{dims.w}" × {dims.h}"</span>
              <span>Trim Size</span>
            </div>
            <div>
              <span className="block text-foreground font-medium">{selectedVendor?.specs.dpi || recommendedSettings.dpi} DPI</span>
              <span>Resolution</span>
            </div>
            <div>
              <span className="block text-foreground font-medium">{selectedVendor?.specs.colorMode || recommendedSettings.colorMode}</span>
              <span>Color Mode</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Export Preset</label>
        <div className="grid grid-cols-2 gap-2">
          {EXPORT_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPreset === preset.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-muted-foreground bg-secondary/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <preset.icon className={`w-4 h-4 mt-0.5 ${selectedPreset === preset.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">{preset.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{preset.description}</div>
                </div>
                {selectedPreset === preset.id && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Format</label>
        <div className="flex flex-wrap gap-2">
          {EXPORT_FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedFormat === format.id
                  ? 'bg-foreground text-background'
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <format.icon className="w-3.5 h-3.5" />
              {format.label}
              {format.isRecommended && isPrintAsset && selectedFormat !== format.id && (
                <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">REC</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PDF-specific info */}
      {selectedFormat === 'pdf' && isPrintAsset && (
        <div className="p-3 bg-secondary/30 rounded-lg border border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground font-medium">
            <FileText className="w-4 h-4 text-primary" />
            Professional Print PDF
          </div>
          <ul className="text-[10px] text-muted-foreground space-y-1">
            <li className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              CMYK color conversion for accurate print colors
            </li>
            <li className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Trim marks & registration marks included
            </li>
            <li className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Bleed area extends artwork to prevent white edges
            </li>
            <li className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              CMYK color bars for printer calibration
            </li>
            <li className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Job ticket info for print shop reference
            </li>
          </ul>
        </div>
      )}

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <span>Advanced Options</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-3 p-3 bg-secondary/20 rounded-xl border border-border">
          {isPrintAsset && (
            <>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeBleed}
                  onChange={e => setOptions(prev => ({ ...prev, includeBleed: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-foreground">Include bleed area (0.125" for standard, 0.5" for large format)</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeTrimMarks}
                  onChange={e => setOptions(prev => ({ ...prev, includeTrimMarks: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-foreground">Include trim marks & registration marks</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.showSafeZone}
                  onChange={e => setOptions(prev => ({ ...prev, showSafeZone: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-foreground">Show safe zone indicator (magenta line)</span>
              </label>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Color Profile</label>
            <select
              value={options.colorProfile}
              onChange={e => setOptions(prev => ({ ...prev, colorProfile: e.target.value as ExportOptions['colorProfile'] }))}
              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
            >
              <option value="sRGB">sRGB (Web/Digital)</option>
              <option value="CMYK">CMYK (Print)</option>
              <option value="Adobe RGB">Adobe RGB (Photography)</option>
            </select>
            {options.colorProfile === 'CMYK' && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Colors will be converted to CMYK colorspace for accurate print reproduction
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Resolution (DPI)</label>
            <select
              value={options.dpi}
              onChange={e => setOptions(prev => ({ ...prev, dpi: parseInt(e.target.value) }))}
              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
            >
              <option value="72">72 DPI (Web)</option>
              <option value="150">150 DPI (Large Format Print)</option>
              <option value="300">300 DPI (Standard Print)</option>
              <option value="600">600 DPI (High Quality Print)</option>
            </select>
          </div>

          {selectedFormat !== 'pdf' && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Compression</label>
              <select
                value={options.compression}
                onChange={e => setOptions(prev => ({ ...prev, compression: e.target.value as ExportOptions['compression'] }))}
                className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground"
              >
                <option value="none">None (Highest Quality)</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Smallest Size)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Export Summary */}
      {selectedFormat === 'pdf' && isPrintAsset && (
        <div className="p-2 bg-secondary/10 rounded-lg text-[10px] text-muted-foreground">
          <strong className="text-foreground">Export will include:</strong> {options.colorProfile} color profile, 
          {options.includeBleed ? ' bleed area,' : ''} 
          {options.includeTrimMarks ? ' trim/registration marks,' : ''} 
          {options.showSafeZone ? ' safe zone guide,' : ''} 
          {' '}{options.dpi} DPI, job ticket
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
      >
        {exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            {selectedFormat === 'pdf' ? 'Generating Print-Ready PDF...' : 'Exporting...'}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export {selectedFormat.toUpperCase()}
            {selectedFormat === 'pdf' && isPrintAsset && !selectedVendor && ' (Print-Ready)'}
            {selectedVendor && ` for ${selectedVendor.name}`}
          </>
        )}
      </button>

      {/* Vendor Upload Link */}
      {selectedVendor?.uploadUrl && (
        <a
          href={selectedVendor.uploadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          After export, upload to {selectedVendor.name} →
        </a>
      )}
    </div>
  );
};

export default AssetExportOptions;
