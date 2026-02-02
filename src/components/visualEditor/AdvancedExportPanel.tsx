// Advanced Export Panel - Print-ready exports with bleed, crop marks, CMYK, vendor presets
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Download, FileImage, FileText, Printer, Settings2, 
  ChevronDown, Check, Palette, Ruler, Grid3X3, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CanvasState } from '@/types/visualEditor.types';

interface AdvancedExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasState: CanvasState;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality: number;
  scale: number;
  colorMode: 'rgb' | 'cmyk';
  includeBleed: boolean;
  bleedSize: number;
  includeCropMarks: boolean;
  includeColorBars: boolean;
  transparentBackground: boolean;
  vendorPreset: string | null;
  resolution: number;
}

const VENDOR_PRESETS = [
  { id: 'vistaprint', name: 'Vistaprint', bleed: 0.125, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: '4over', name: '4over', bleed: 0.125, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: '4imprint', name: '4imprint', bleed: 0.0625, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: 'staples', name: 'Staples', bleed: 0.125, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: 'fedex', name: 'FedEx Office', bleed: 0.125, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: 'costco', name: 'Costco Photo', bleed: 0, format: 'jpg', colorMode: 'rgb' as const, dpi: 300 },
  { id: 'moo', name: 'Moo', bleed: 0.1, format: 'pdf', colorMode: 'cmyk' as const, dpi: 300 },
  { id: 'shutterfly', name: 'Shutterfly', bleed: 0.125, format: 'jpg', colorMode: 'rgb' as const, dpi: 300 },
];

const FORMAT_OPTIONS = [
  { id: 'png', name: 'PNG', description: 'Lossless, transparent', icon: FileImage },
  { id: 'jpg', name: 'JPEG', description: 'Compressed, smaller size', icon: FileImage },
  { id: 'pdf', name: 'PDF', description: 'Print-ready document', icon: FileText },
  { id: 'svg', name: 'SVG', description: 'Vector, scalable', icon: FileImage },
];

export const AdvancedExportPanel: React.FC<AdvancedExportPanelProps> = ({
  isOpen,
  onClose,
  canvasState,
  onExport
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 100,
    scale: 1,
    colorMode: 'rgb',
    includeBleed: false,
    bleedSize: 0.125,
    includeCropMarks: false,
    includeColorBars: false,
    transparentBackground: false,
    vendorPreset: null,
    resolution: 300
  });

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const applyVendorPreset = (presetId: string) => {
    const preset = VENDOR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setOptions(prev => ({
        ...prev,
        vendorPreset: presetId,
        format: preset.format as ExportOptions['format'],
        colorMode: preset.colorMode,
        includeBleed: preset.bleed > 0,
        bleedSize: preset.bleed,
        includeCropMarks: preset.colorMode === 'cmyk',
        resolution: preset.dpi
      }));
    }
  };

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  // Calculate final dimensions
  const finalWidth = canvasState.width * options.scale + (options.includeBleed ? options.bleedSize * 2 * 72 : 0);
  const finalHeight = canvasState.height * options.scale + (options.includeBleed ? options.bleedSize * 2 * 72 : 0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Export Design</h2>
                <p className="text-sm text-muted-foreground">Configure export settings for print or digital</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Vendor Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Vendor Presets</Label>
                <div className="grid grid-cols-4 gap-2">
                  {VENDOR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyVendorPreset(preset.id)}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-all',
                        options.vendorPreset === preset.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <p className="text-xs font-medium truncate">{preset.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{preset.colorMode.toUpperCase()}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Tabs defaultValue="format" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="format">Format</TabsTrigger>
                  <TabsTrigger value="print">Print Settings</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="format" className="mt-4 space-y-4">
                  {/* Format Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">File Format</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {FORMAT_OPTIONS.map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => updateOption('format', fmt.id as ExportOptions['format'])}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-all',
                            options.format === fmt.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <fmt.icon className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                          <p className="text-xs font-medium">{fmt.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{fmt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality (for JPG) */}
                  {options.format === 'jpg' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Quality</Label>
                        <span className="text-sm text-muted-foreground">{options.quality}%</span>
                      </div>
                      <Slider
                        value={[options.quality]}
                        onValueChange={([v]) => updateOption('quality', v)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  )}

                  {/* Scale */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Scale</Label>
                      <span className="text-sm text-muted-foreground">{options.scale}x</span>
                    </div>
                    <Slider
                      value={[options.scale]}
                      onValueChange={([v]) => updateOption('scale', v)}
                      min={0.5}
                      max={4}
                      step={0.5}
                    />
                  </div>

                  {/* Transparent Background */}
                  {(options.format === 'png' || options.format === 'svg') && (
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Transparent Background</Label>
                      <Switch
                        checked={options.transparentBackground}
                        onCheckedChange={(v) => updateOption('transparentBackground', v)}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="print" className="mt-4 space-y-4">
                  {/* Color Mode */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Color Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOption('colorMode', 'rgb')}
                        className={cn(
                          'p-4 rounded-lg border text-left transition-all',
                          options.colorMode === 'rgb'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-sm font-medium">RGB</p>
                        <p className="text-xs text-muted-foreground">Digital screens</p>
                      </button>
                      <button
                        onClick={() => updateOption('colorMode', 'cmyk')}
                        className={cn(
                          'p-4 rounded-lg border text-left transition-all',
                          options.colorMode === 'cmyk'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-cyan-500" />
                          <div className="w-3 h-3 rounded-full bg-pink-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-black" />
                        </div>
                        <p className="text-sm font-medium">CMYK</p>
                        <p className="text-xs text-muted-foreground">Professional print</p>
                      </button>
                    </div>
                  </div>

                  {/* Bleed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Include Bleed</Label>
                      <Switch
                        checked={options.includeBleed}
                        onCheckedChange={(v) => updateOption('includeBleed', v)}
                      />
                    </div>
                    {options.includeBleed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={options.bleedSize}
                          onChange={(e) => updateOption('bleedSize', parseFloat(e.target.value))}
                          className="w-24"
                          step={0.0625}
                          min={0}
                          max={0.5}
                        />
                        <span className="text-sm text-muted-foreground">inches</span>
                      </div>
                    )}
                  </div>

                  {/* Crop Marks */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Crop Marks</Label>
                      <p className="text-xs text-muted-foreground">Trim guides for print shop</p>
                    </div>
                    <Switch
                      checked={options.includeCropMarks}
                      onCheckedChange={(v) => updateOption('includeCropMarks', v)}
                    />
                  </div>

                  {/* Color Bars */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Color Calibration Bars</Label>
                      <p className="text-xs text-muted-foreground">For color accuracy verification</p>
                    </div>
                    <Switch
                      checked={options.includeColorBars}
                      onCheckedChange={(v) => updateOption('includeColorBars', v)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="mt-4 space-y-4">
                  {/* Resolution */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Resolution (DPI)</Label>
                    <Select
                      value={options.resolution.toString()}
                      onValueChange={(v) => updateOption('resolution', parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="72">72 DPI (Screen)</SelectItem>
                        <SelectItem value="150">150 DPI (Low Print)</SelectItem>
                        <SelectItem value="300">300 DPI (Standard Print)</SelectItem>
                        <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Output Preview */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Grid3X3 className="h-4 w-4" />
                      Output Dimensions
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Canvas Size</p>
                        <p className="font-mono">{canvasState.width} × {canvasState.height} px</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Final Size</p>
                        <p className="font-mono">{Math.round(finalWidth)} × {Math.round(finalHeight)} px</p>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {options.colorMode === 'cmyk' && options.format !== 'pdf' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-500">CMYK requires PDF</p>
                        <p className="text-muted-foreground">Switch to PDF format for accurate CMYK output</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{options.format.toUpperCase()}</Badge>
              <Badge variant="outline">{options.colorMode.toUpperCase()}</Badge>
              {options.includeBleed && <Badge variant="outline">+Bleed</Badge>}
              {options.includeCropMarks && <Badge variant="outline">+Marks</Badge>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
