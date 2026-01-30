import React, { useState } from 'react';
import { AssetType } from '../types';
import { ASSET_CONFIGS, type PrintSpec, type AssetConfig } from '../config/assetConfig';
import { 
  Printer, 
  Ruler, 
  Palette, 
  FileType, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Scissors,
  Eye,
  Grid3x3,
  Maximize2,
  AlertTriangle
} from 'lucide-react';

interface PrintSpecPanelProps {
  assetType: AssetType;
  onExportWithSpecs?: (specs: PrintSpec) => void;
}

const PrintSpecPanel: React.FC<PrintSpecPanelProps> = ({ assetType, onExportWithSpecs }) => {
  const [expanded, setExpanded] = useState(false);
  const [showBleedPreview, setShowBleedPreview] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(false);

  const config = ASSET_CONFIGS.find(c => c.type === assetType);
  
  if (!config?.printSpec) {
    // Digital asset - show digital specs
    if (config?.pixelWidth && config?.pixelHeight) {
      return (
        <div className="bg-secondary/30 rounded-xl p-3 border border-border">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2 text-foreground font-medium">
              <Grid3x3 className="w-4 h-4 text-primary" />
              Digital Specs
            </div>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-mono text-foreground">{config.pixelWidth} × {config.pixelHeight}px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aspect Ratio</span>
                <span className="font-mono text-foreground">{config.aspectRatio || 'Custom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-mono text-foreground">PNG / JPEG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color Mode</span>
                <span className="font-mono text-foreground">sRGB</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  const { printSpec } = config;
  const widthPx = Math.round(printSpec.widthInches * printSpec.dpi);
  const heightPx = Math.round(printSpec.heightInches * printSpec.dpi);
  const bleedPx = Math.round(printSpec.bleedInches * printSpec.dpi);

  return (
    <div className="bg-secondary/30 rounded-xl p-3 border border-border">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Printer className="w-4 h-4 text-primary" />
          Print Specifications
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Size Info */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ruler className="w-3.5 h-3.5" />
              <span>Physical Size</span>
            </div>
            <div className="pl-5 grid grid-cols-2 gap-2">
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground uppercase">Width</div>
                <div className="font-mono text-foreground">{printSpec.widthInches}"</div>
              </div>
              <div className="bg-background/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground uppercase">Height</div>
                <div className="font-mono text-foreground">{printSpec.heightInches}"</div>
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5" /> Resolution
            </span>
            <span className="font-mono text-foreground">{printSpec.dpi} DPI ({widthPx} × {heightPx}px)</span>
          </div>

          {/* Bleed */}
          {printSpec.bleedInches > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" /> Bleed Area
              </span>
              <span className="font-mono text-foreground">{printSpec.bleedInches}" ({bleedPx}px)</span>
            </div>
          )}

          {/* Color Mode */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Color Mode
            </span>
            <span className={`font-mono ${printSpec.colorMode === 'CMYK' ? 'text-amber-500' : 'text-green-500'}`}>
              {printSpec.colorMode}
            </span>
          </div>

          {/* File Format */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileType className="w-3.5 h-3.5" /> Export Format
            </span>
            <span className="font-mono text-foreground">{printSpec.fileFormat}</span>
          </div>

          {/* Notes */}
          {printSpec.notes && (
            <div className="bg-primary/10 rounded-lg p-2 text-xs text-primary flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{printSpec.notes}</span>
            </div>
          )}

          {/* Preview Toggles */}
          <div className="pt-2 border-t border-border space-y-2">
            <button
              onClick={() => setShowBleedPreview(!showBleedPreview)}
              className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors ${showBleedPreview ? 'bg-destructive/20 text-destructive' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Show Bleed Area
              </span>
              <span>{showBleedPreview ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => setShowSafeZone(!showSafeZone)}
              className={`w-full flex items-center justify-between text-xs p-2 rounded-lg transition-colors ${showSafeZone ? 'bg-green-500/20 text-green-600' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}
            >
              <span className="flex items-center gap-1.5">
                <Grid3x3 className="w-3.5 h-3.5" /> Show Safe Zone
              </span>
              <span>{showSafeZone ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* CMYK Warning */}
          {printSpec.colorMode === 'CMYK' && (
            <div className="bg-amber-500/10 rounded-lg p-2 text-xs text-amber-600 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Colors may appear differently when printed. Preview is in RGB.</span>
            </div>
          )}

          {/* Export Button */}
          {onExportWithSpecs && (
            <button
              onClick={() => onExportWithSpecs(printSpec)}
              className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Export Print-Ready File
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PrintSpecPanel;
