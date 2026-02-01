import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Image as ImageIcon, Loader2, MoreVertical } from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StudioAssetGridProps {
  assetTypes: string[];
  brand: Brand | null;
  viewMode: 'grid' | 'list';
  selectedAssets: string[];
  onSelectAsset: (id: string) => void;
  studioGradient: string;
}

// Asset display info
const assetDisplayInfo: Record<string, { name: string; description: string; dimensions?: string }> = {
  'LOGO': { name: 'Primary Logo', description: 'Main brand logo in full color', dimensions: '1024×1024' },
  'LOGO_MONOCHROME': { name: 'Monochrome Logo', description: 'Single-color logo variant', dimensions: '1024×1024' },
  'LOGO_REVERSED': { name: 'Reversed Logo', description: 'Logo for dark backgrounds', dimensions: '1024×1024' },
  'PALETTE': { name: 'Color Palette', description: 'Brand color system', dimensions: '1200×800' },
  'SLOGANS': { name: 'Brand Taglines', description: 'Collection of brand slogans', dimensions: 'Text' },
  'STYLE_GUIDE': { name: 'Style Guide', description: 'Brand usage guidelines', dimensions: 'Multi-page' },
  'SEAMLESS_PATTERN': { name: 'Brand Pattern', description: 'Tileable background pattern', dimensions: '600×600' },
  'BANNER': { name: 'Event Banner', description: 'Large format display banner', dimensions: '96×36 in' },
  'NAME_TAG': { name: 'Name Badge', description: 'Attendee name badge front', dimensions: '4×3 in' },
  'NAME_TAG_BACK': { name: 'Badge Back', description: 'Name badge back with info', dimensions: '4×3 in' },
  'SOCIAL_POST': { name: 'Social Post', description: 'Square social media post', dimensions: '1080×1080' },
  'SOCIAL_STORY': { name: 'Social Story', description: 'Vertical story format', dimensions: '1080×1920' },
  'TSHIRT': { name: 'T-Shirt Front', description: 'Front print design', dimensions: '12×16 in' },
  'INVITATION_CARD': { name: 'Invitation', description: 'Event invitation card', dimensions: '5×7 in' },
  'VIP_BADGE': { name: 'VIP Badge', description: 'VIP access credential', dimensions: '4×6 in' },
  'PRESENTATION_SLIDE': { name: 'Slide Template', description: 'Presentation slides', dimensions: '1920×1080' },
  // Add more as needed...
};

const getAssetInfo = (assetType: string) => {
  return assetDisplayInfo[assetType] || {
    name: assetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Professional event asset',
    dimensions: 'Standard'
  };
};

export const StudioAssetGrid: React.FC<StudioAssetGridProps> = ({
  assetTypes,
  brand,
  viewMode,
  selectedAssets,
  onSelectAsset,
  studioGradient
}) => {
  const [generatingAssets, setGeneratingAssets] = useState<Set<string>>(new Set());
  
  const handleGenerate = async (assetType: string) => {
    setGeneratingAssets(prev => new Set(prev).add(assetType));
    
    // Simulate generation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratingAssets(prev => {
      const next = new Set(prev);
      next.delete(assetType);
      return next;
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {assetTypes.map((assetType, index) => {
          const info = getAssetInfo(assetType);
          const isSelected = selectedAssets.includes(assetType);
          const isGenerating = generatingAssets.has(assetType);
          
          return (
            <motion.div
              key={assetType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
              )}
              onClick={() => onSelectAsset(assetType)}
            >
              <div 
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  isSelected 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{info.name}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {info.dimensions}
              </div>
              
              <Button
                size="sm"
                className={cn("bg-gradient-to-r", studioGradient)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate(assetType);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assetTypes.map((assetType, index) => {
        const info = getAssetInfo(assetType);
        const isSelected = selectedAssets.includes(assetType);
        const isGenerating = generatingAssets.has(assetType);
        
        return (
          <motion.div
            key={assetType}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "group relative rounded-xl border overflow-hidden transition-all cursor-pointer",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelectAsset(assetType)}
          >
            {/* Selection Checkbox */}
            <div 
              className={cn(
                "absolute top-3 left-3 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "border-primary bg-primary" 
                  : "border-white/50 bg-black/20 group-hover:border-white"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            
            {/* More Options */}
            <button 
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/20 text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {/* Preview Area */}
            <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10",
                studioGradient
              )} />
              <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              
              {/* Generate Overlay */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Button
                  size="sm"
                  className={cn("bg-gradient-to-r shadow-lg", studioGradient)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerate(assetType);
                  }}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              
              {/* Loading Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    <p className="text-xs text-white/80">Generating...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-3 bg-card">
              <h3 className="font-medium text-sm text-foreground truncate">{info.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground truncate">{info.description}</p>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                {info.dimensions}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
