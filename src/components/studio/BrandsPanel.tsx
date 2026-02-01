import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Plus, Settings, Clock, Image as ImageIcon, 
  ChevronRight, Sparkles, Check, Type, Droplets
} from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BrandsPanelProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
  onCreateBrand: () => void;
  onEditBrand: (brand: Brand) => void;
}

interface RecentCreation {
  id: string;
  asset_type: string;
  title: string;
  preview_url?: string;
  created_at: string;
}

export const BrandsPanel: React.FC<BrandsPanelProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
  onCreateBrand,
  onEditBrand
}) => {
  const [recentCreations, setRecentCreations] = useState<RecentCreation[]>([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);

  // Load recent creations for selected brand
  useEffect(() => {
    const loadRecentCreations = async () => {
      if (!selectedBrand) {
        setRecentCreations([]);
        return;
      }

      setIsLoadingCreations(true);
      try {
        // Query ai_generations filtered by brand-related context
        const { data, error } = await supabase
          .from('ai_generations')
          .select('id, asset_type, prompt_used, result_image_url, created_at')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        // Transform to recent creations format
        const creations: RecentCreation[] = (data || []).map(gen => ({
          id: gen.id,
          asset_type: gen.asset_type,
          title: gen.asset_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          preview_url: gen.result_image_url || undefined,
          created_at: gen.created_at
        }));

        setRecentCreations(creations);
      } catch (error) {
        console.error('Error loading recent creations:', error);
      } finally {
        setIsLoadingCreations(false);
      }
    };

    loadRecentCreations();
  }, [selectedBrand?.id]);

  // Get brand colors for display
  const getBrandColors = (brand: Brand): string[] => {
    const colors: string[] = [];
    if (brand.styles?.primary_color) colors.push(brand.styles.primary_color);
    if (brand.styles?.secondary_color) colors.push(brand.styles.secondary_color);
    if (brand.styles?.accent_color) colors.push(brand.styles.accent_color);
    if (brand.styles?.color_palette) {
      brand.styles.color_palette.slice(0, 5 - colors.length).forEach(c => {
        if (c.hex && !colors.includes(c.hex)) colors.push(c.hex);
      });
    }
    return colors.slice(0, 5);
  };

  return (
    <div className="w-72 border-l border-border bg-card/50 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Your Brands
          </h3>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreateBrand}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Brand List */}
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {brands.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-2">No brands yet</p>
                <Button size="sm" variant="outline" onClick={onCreateBrand}>
                  <Plus className="w-3 h-3 mr-1" />
                  Create Brand
                </Button>
              </div>
            ) : (
              brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onSelectBrand(brand)}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left",
                    selectedBrand?.id === brand.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted border border-transparent"
                  )}
                >
                  {brand.logo_url ? (
                    <img 
                      src={brand.logo_url} 
                      alt={brand.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{brand.name}</p>
                    {brand.is_default && (
                      <span className="text-[10px] text-muted-foreground">Default</span>
                    )}
                  </div>
                  {selectedBrand?.id === brand.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Selected Brand Details */}
      <AnimatePresence mode="wait">
        {selectedBrand && (
          <motion.div
            key={selectedBrand.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Brand Style Overview */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground">Brand Style</h4>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => onEditBrand(selectedBrand)}
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>

              {/* Color Palette */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Colors</span>
                </div>
                <div className="flex gap-1">
                  {getBrandColors(selectedBrand).length > 0 ? (
                    getBrandColors(selectedBrand).map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg shadow-sm border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground">No colors defined</div>
                  )}
                </div>
              </div>

              {/* Typography */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Typography</span>
                </div>
                <div className="space-y-1">
                  {selectedBrand.styles?.heading_font ? (
                    <p className="text-xs">
                      <span className="text-muted-foreground">Heading:</span>{' '}
                      <span className="font-medium">{selectedBrand.styles.heading_font}</span>
                    </p>
                  ) : null}
                  {selectedBrand.styles?.body_font ? (
                    <p className="text-xs">
                      <span className="text-muted-foreground">Body:</span>{' '}
                      <span className="font-medium">{selectedBrand.styles.body_font}</span>
                    </p>
                  ) : null}
                  {!selectedBrand.styles?.heading_font && !selectedBrand.styles?.body_font && (
                    <p className="text-xs text-muted-foreground">No fonts defined</p>
                  )}
                </div>
              </div>

              {/* Mood Keywords */}
              {selectedBrand.styles?.mood_keywords && selectedBrand.styles.mood_keywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Mood</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedBrand.styles.mood_keywords.slice(0, 4).map((keyword, i) => (
                      <span 
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Creations */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  Recent Creations
                </h4>
                {recentCreations.length > 0 && (
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    View All
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[calc(100%-2rem)]">
                {isLoadingCreations ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : recentCreations.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {recentCreations.map((creation) => (
                      <motion.div
                        key={creation.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border border-border hover:border-primary/50 transition-all"
                      >
                        {creation.preview_url ? (
                          <img 
                            src={creation.preview_url} 
                            alt={creation.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-[10px] text-white font-medium truncate">
                            {creation.title}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No creations yet</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      Generate assets to see them here
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State when no brand selected */}
      {!selectedBrand && brands.length > 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Palette className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a brand</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              to view style details and creations
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
