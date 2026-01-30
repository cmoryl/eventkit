import React, { useState } from 'react';
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
  Check
} from 'lucide-react';

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
  onExport: (format: string, resolution: string, options: ExportOptions) => void;
  isExporting?: boolean;
}

interface ExportOptions {
  includeBleed: boolean;
  includeTrimMarks: boolean;
  colorProfile: 'sRGB' | 'CMYK' | 'Adobe RGB';
  compression: 'none' | 'low' | 'medium' | 'high';
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'png', label: 'PNG', extension: '.png', icon: FileImage, description: 'Lossless, transparent background support' },
  { id: 'jpg', label: 'JPEG', extension: '.jpg', icon: FileImage, description: 'Compressed, smaller file size' },
  { id: 'pdf', label: 'PDF', extension: '.pdf', icon: FileText, description: 'Print-ready, vector support', isRecommended: true },
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
  onExport,
  isExporting = false
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('print');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [selectedResolution, setSelectedResolution] = useState<string>('300dpi');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeBleed: true,
    includeTrimMarks: true,
    colorProfile: 'CMYK',
    compression: 'none'
  });

  const config = ASSET_CONFIGS.find(c => c.type === assetType);
  const isPrintAsset = !!config?.printSpec;

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
          compression: 'none'
        }));
      } else if (presetId === 'web') {
        setOptions(prev => ({
          ...prev,
          includeBleed: false,
          includeTrimMarks: false,
          colorProfile: 'sRGB',
          compression: 'medium'
        }));
      }
    }
  };

  const handleExport = () => {
    onExport(selectedFormat, selectedResolution, options);
  };

  return (
    <div className="space-y-4">
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
                <span className="text-foreground">Include bleed area</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeTrimMarks}
                  onChange={e => setOptions(prev => ({ ...prev, includeTrimMarks: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-foreground">Include trim marks</span>
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
              <option value="sRGB">sRGB (Web)</option>
              <option value="CMYK">CMYK (Print)</option>
              <option value="Adobe RGB">Adobe RGB</option>
            </select>
          </div>

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
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export {selectedFormat.toUpperCase()}
          </>
        )}
      </button>
    </div>
  );
};

export default AssetExportOptions;
