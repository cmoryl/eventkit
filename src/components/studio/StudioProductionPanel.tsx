import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileType, Printer, Monitor, Settings2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { StudioDefinition, Brand } from '@/types/studio.types';
import { cn } from '@/lib/utils';

interface StudioProductionPanelProps {
  studio: StudioDefinition;
  brand: Brand | null;
  selectedAssets: string[];
  onClose: () => void;
}

export const StudioProductionPanel: React.FC<StudioProductionPanelProps> = ({
  studio,
  brand,
  selectedAssets,
  onClose
}) => {
  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="w-72 lg:w-80 border-l border-border bg-card min-h-[calc(100vh-65px)] p-3 lg:p-4 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Production Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Assets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Selected Assets</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {selectedAssets.length}
          </span>
        </div>
        {selectedAssets.length === 0 ? (
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Select assets to configure production settings
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedAssets.slice(0, 5).map(asset => (
              <span key={asset} className="text-xs bg-muted px-2 py-1 rounded">
                {asset.replace(/_/g, ' ')}
              </span>
            ))}
            {selectedAssets.length > 5 && (
              <span className="text-xs bg-muted px-2 py-1 rounded">
                +{selectedAssets.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Export Format */}
      <div className="space-y-4">
        <div className="pb-4 border-b border-border">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <FileType className="h-4 w-4" />
            Export Format
          </label>
          <Select defaultValue="png">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG (High Quality)</SelectItem>
              <SelectItem value="jpg">JPG (Compressed)</SelectItem>
              <SelectItem value="pdf">PDF (Print Ready)</SelectItem>
              <SelectItem value="svg">SVG (Vector)</SelectItem>
              <SelectItem value="psd">PSD (Layered)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Print Settings */}
        <div className="pb-4 border-b border-border">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <Printer className="h-4 w-4" />
            Print Production
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Color Mode</span>
              <Select defaultValue="cmyk">
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cmyk">CMYK</SelectItem>
                  <SelectItem value="rgb">RGB</SelectItem>
                  <SelectItem value="pantone">Pantone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Resolution</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">300 DPI</span>
              </div>
              <Slider defaultValue={[300]} max={600} min={72} step={1} className="w-full" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Include Bleed</span>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crop Marks</span>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registration Marks</span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Digital Settings */}
        <div className="pb-4 border-b border-border">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <Monitor className="h-4 w-4" />
            Digital Optimization
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">sRGB Profile</span>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Optimize File Size</span>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Social Media Variants</span>
              <Switch />
            </div>
          </div>
        </div>

        {/* Brand Settings */}
        {brand && (
          <div className="pb-4 border-b border-border">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Palette className="h-4 w-4" />
              Brand Override
            </label>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className={cn("w-8 h-8 rounded bg-gradient-to-br", studio.gradient)} />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">Active Brand</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Settings */}
        <div className="pb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <Settings2 className="h-4 w-4" />
            AI Generation
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality</span>
              <Select defaultValue="high">
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="ultra">Ultra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Style Variations</span>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Refinement</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-6 space-y-2">
        <Button 
          className={cn("w-full bg-gradient-to-r", studio.gradient)}
          disabled={selectedAssets.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export {selectedAssets.length > 0 ? `(${selectedAssets.length})` : 'Selected'}
        </Button>
        
        <Button variant="outline" className="w-full">
          Export All Assets
        </Button>
      </div>
    </motion.aside>
  );
};
