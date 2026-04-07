import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Plus, Settings, Clock, Image as ImageIcon, 
  ChevronRight, ChevronDown, Sparkles, Check, Type, Droplets, Link2, Unlink, FolderHeart, Wand2,
  Quote, Target, Globe, Hash, Camera, Brush, Users, Building2, MessageSquare, 
  Shield, Layout, Ban, CheckCircle2, XCircle, Ruler, Images
} from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { BrandAdherenceMode } from '@/types/brand.types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BrandsPanelProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
  onCreateBrand: () => void;
  onEditBrand: (brand: Brand) => void;
  // Per-project brand props
  projectBrandId?: string | null;
  onSetProjectBrand?: (brandId: string | null) => Promise<void>;
  projectName?: string;
  // Brand adherence mode
  brandAdherenceMode?: BrandAdherenceMode;
  onSetBrandAdherenceMode?: (mode: BrandAdherenceMode) => Promise<void>;
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
  onEditBrand,
  projectBrandId,
  onSetProjectBrand,
  projectName,
  brandAdherenceMode = 'inspired',
  onSetBrandAdherenceMode
}) => {
  const [recentCreations, setRecentCreations] = useState<RecentCreation[]>([]);
  const [isLoadingCreations, setIsLoadingCreations] = useState(false);
  const [isSettingProjectBrand, setIsSettingProjectBrand] = useState(false);
  const [isSettingAdherence, setIsSettingAdherence] = useState(false);
  const [isBrandStyleOpen, setIsBrandStyleOpen] = useState(true);

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

  // Handle setting project brand
  const handleSetProjectBrand = async (brandId: string) => {
    if (!onSetProjectBrand) return;
    setIsSettingProjectBrand(true);
    try {
      await onSetProjectBrand(brandId);
    } finally {
      setIsSettingProjectBrand(false);
    }
  };

  const handleClearProjectBrand = async () => {
    if (!onSetProjectBrand) return;
    setIsSettingProjectBrand(true);
    try {
      await onSetProjectBrand(null);
    } finally {
      setIsSettingProjectBrand(false);
    }
  };

  const handleSetAdherenceMode = async (mode: BrandAdherenceMode) => {
    if (!onSetBrandAdherenceMode) return;
    setIsSettingAdherence(true);
    try {
      await onSetBrandAdherenceMode(mode);
    } finally {
      setIsSettingAdherence(false);
    }
  };

  const adherenceModeLabels: Record<BrandAdherenceMode, { label: string; description: string }> = {
    strict: { label: 'Strict', description: 'Exact brand compliance required' },
    inspired: { label: 'Inspired', description: 'Brand-influenced with creative flexibility' },
    none: { label: 'None', description: 'Ignore brand guidelines for this project' }
  };

  return (
    <TooltipProvider>
      <div className="w-64 lg:w-72 border-l border-border bg-card/50 flex flex-col h-[calc(100vh-4rem)]">
        {/* Project Brand Section */}
        {onSetProjectBrand && (
          <div className="p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <FolderHeart className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Project Brand</h3>
            </div>
            
            {projectBrandId ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const linkedBrand = brands.find(b => b.id === projectBrandId);
                    return linkedBrand ? (
                      <>
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ 
                            background: linkedBrand.styles?.primary_color 
                              ? `linear-gradient(135deg, ${linkedBrand.styles.primary_color}, ${linkedBrand.styles.accent_color || linkedBrand.styles.primary_color})`
                              : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                          }}
                        >
                          {linkedBrand.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate">{linkedBrand.name}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={handleClearProjectBrand}
                              disabled={isSettingProjectBrand}
                            >
                              <Unlink className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove from project</TooltipContent>
                        </Tooltip>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Brand not found</span>
                    );
                  })()}
                </div>
                
                {/* Brand Adherence Mode Selector */}
                {onSetBrandAdherenceMode && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Wand2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Brand Flexibility</span>
                    </div>
                    <Select
                      value={brandAdherenceMode}
                      onValueChange={(value) => handleSetAdherenceMode(value as BrandAdherenceMode)}
                      disabled={isSettingAdherence}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(adherenceModeLabels) as [BrandAdherenceMode, { label: string; description: string }][]).map(([mode, { label, description }]) => (
                          <SelectItem key={mode} value={mode}>
                            <div className="flex flex-col">
                              <span className="font-medium">{label}</span>
                              <span className="text-[10px] text-muted-foreground">{description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No brand linked to this project. Select a brand below and click <Link2 className="w-3 h-3 inline" /> to link it.
              </p>
            )}
          </div>
        )}

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
              brands.map((brand) => {
                const isProjectBrand = brand.id === projectBrandId;
                return (
                  <div
                    key={brand.id}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded-lg transition-all",
                      selectedBrand?.id === brand.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted border border-transparent",
                      isProjectBrand && "ring-1 ring-emerald-500/50"
                    )}
                  >
                    <button
                      onClick={() => onSelectBrand(brand)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name}
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{brand.name}</p>
                        <div className="flex items-center gap-1">
                          {brand.is_default && (
                            <span className="text-[10px] text-muted-foreground">Default</span>
                          )}
                          {isProjectBrand && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                              <Link2 className="w-2.5 h-2.5" />
                              Project
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* Link to project button */}
                    {onSetProjectBrand && !isProjectBrand && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={() => handleSetProjectBrand(brand.id)}
                            disabled={isSettingProjectBrand}
                          >
                            <Link2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Link to project</TooltipContent>
                      </Tooltip>
                    )}
                    
                    {selectedBrand?.id === brand.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })
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
            {/* Brand Style Overview - Collapsible */}
            <Collapsible open={isBrandStyleOpen} onOpenChange={setIsBrandStyleOpen}>
              <div className="border-b border-border">
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <h4 className="text-sm font-medium text-foreground">Brand Style</h4>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBrand(selectedBrand);
                        }}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        isBrandStyleOpen && "rotate-180"
                      )} />
                    </div>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="animate-accordion-down">
                  <ScrollArea className="max-h-[50vh]">
                  <div className="px-4 pb-4 space-y-3">
                    {/* Tagline */}
                    {selectedBrand.styles?.tagline && (
                      <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Quote className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Tagline</span>
                        </div>
                        <p className="text-xs font-medium italic text-foreground leading-relaxed">
                          "{selectedBrand.styles.tagline}"
                        </p>
                      </div>
                    )}

                    {/* Mission */}
                    {selectedBrand.styles?.mission && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mission</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                          {selectedBrand.styles.mission}
                        </p>
                      </div>
                    )}

                    {/* Industry & Audience */}
                    {(selectedBrand.styles?.industry || selectedBrand.styles?.target_audience) && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBrand.styles?.industry && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">Industry</span>
                            </div>
                            <p className="text-xs font-medium truncate">{selectedBrand.styles.industry}</p>
                          </div>
                        )}
                        {selectedBrand.styles?.target_audience && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">Audience</span>
                            </div>
                            <p className="text-xs font-medium truncate">{selectedBrand.styles.target_audience}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Archetype */}
                    {selectedBrand.styles?.archetype && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md px-2.5 py-1.5">
                        <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-xs">
                          <span className="text-muted-foreground">Archetype:</span>{' '}
                          <span className="font-medium">{selectedBrand.styles.archetype}</span>
                        </span>
                      </div>
                    )}

                    {/* Color Palette with Names */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Colors</span>
                      </div>
                      {getBrandColors(selectedBrand).length > 0 ? (
                        <>
                          <div className="flex gap-1 mb-1.5">
                            {getBrandColors(selectedBrand).map((color, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-lg shadow-sm border border-border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          {/* Named palette entries */}
                          {(selectedBrand.styles?.color_palette?.filter(c => c.name)?.length ?? 0) > 0 && (
                            <div className="space-y-0.5 mt-1">
                              {selectedBrand.styles!.color_palette.filter(c => c.name).slice(0, 8).map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-border/50" style={{ backgroundColor: c.hex }} />
                                  <span className="text-[10px] text-foreground/70 truncate">{c.name}</span>
                                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">{c.hex}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">No colors defined</div>
                      )}
                    </div>

                    {/* Typography */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Typography</span>
                      </div>
                      <div className="space-y-1">
                        {selectedBrand.styles?.heading_font && (
                          <p className="text-xs">
                            <span className="text-muted-foreground">Heading:</span>{' '}
                            <span className="font-medium">{selectedBrand.styles.heading_font}</span>
                          </p>
                        )}
                        {selectedBrand.styles?.body_font && (
                          <p className="text-xs">
                            <span className="text-muted-foreground">Body:</span>{' '}
                            <span className="font-medium">{selectedBrand.styles.body_font}</span>
                          </p>
                        )}
                        {selectedBrand.styles?.accent_font && (
                          <p className="text-xs">
                            <span className="text-muted-foreground">Accent:</span>{' '}
                            <span className="font-medium">{selectedBrand.styles.accent_font}</span>
                          </p>
                        )}
                        {!selectedBrand.styles?.heading_font && !selectedBrand.styles?.body_font && (
                          <p className="text-xs text-muted-foreground">No fonts defined</p>
                        )}
                      </div>
                    </div>

                    {/* Brand Voice & Tone */}
                    {((selectedBrand.styles?.brand_voice?.length ?? 0) > 0 || (selectedBrand.styles?.tone_keywords?.length ?? 0) > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Voice & Tone</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[...(selectedBrand.styles?.brand_voice || []), ...(selectedBrand.styles?.tone_keywords || [])].slice(0, 6).map((kw, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {kw}
                            </span>
                          ))}
                        </div>
                        {selectedBrand.styles?.writing_style && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                            Style: {selectedBrand.styles.writing_style}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Visual Style */}
                    {(selectedBrand.styles?.imagery_style || selectedBrand.styles?.photography_style || selectedBrand.styles?.icon_style) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Visual Style</span>
                        </div>
                        <div className="space-y-1">
                          {selectedBrand.styles?.imagery_style && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Imagery:</span>{' '}
                              <span className="font-medium">{selectedBrand.styles.imagery_style}</span>
                            </p>
                          )}
                          {selectedBrand.styles?.photography_style && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Photography:</span>{' '}
                              <span className="font-medium">{selectedBrand.styles.photography_style}</span>
                            </p>
                          )}
                          {selectedBrand.styles?.icon_style && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Icons:</span>{' '}
                              <span className="font-medium">{selectedBrand.styles.icon_style}</span>
                            </p>
                          )}
                          {selectedBrand.styles?.pattern_style && (
                            <p className="text-xs">
                              <span className="text-muted-foreground">Patterns:</span>{' '}
                              <span className="font-medium">{selectedBrand.styles.pattern_style}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mood Keywords */}
                    {(selectedBrand.styles?.mood_keywords?.length ?? 0) > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Brush className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mood</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedBrand.styles!.mood_keywords!.slice(0, 6).map((keyword, i) => (
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

                    {/* Social & Hashtags */}
                    {(selectedBrand.styles?.hashtags?.length || selectedBrand.styles?.social_handles) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Social</span>
                        </div>
                        {selectedBrand.styles?.social_handles && Object.keys(selectedBrand.styles.social_handles).length > 0 && (
                          <div className="space-y-0.5 mb-1.5">
                            {Object.entries(selectedBrand.styles.social_handles).slice(0, 3).map(([platform, handle]) => (
                              <p key={platform} className="text-[10px] text-foreground/70 truncate">
                                <span className="capitalize text-muted-foreground">{platform}:</span> {handle as string}
                              </p>
                            ))}
                          </div>
                        )}
                        {(selectedBrand.styles?.hashtags?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedBrand.styles!.hashtags!.slice(0, 4).map((tag, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />
                                {tag.replace(/^#/, '')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Logo Variants */}
                    {(selectedBrand.logo_url || selectedBrand.logo_monochrome_url || selectedBrand.logo_reversed_url) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Logo Variants</span>
                        </div>
                        <div className="flex gap-2">
                          {selectedBrand.logo_url && (
                            <div className="w-10 h-10 rounded-md border border-border bg-background p-1 flex items-center justify-center" title="Primary">
                              <img src={selectedBrand.logo_url} alt="Primary" className="max-w-full max-h-full object-contain" />
                            </div>
                          )}
                          {selectedBrand.logo_monochrome_url && (
                            <div className="w-10 h-10 rounded-md border border-border bg-background p-1 flex items-center justify-center" title="Monochrome">
                              <img src={selectedBrand.logo_monochrome_url} alt="Mono" className="max-w-full max-h-full object-contain grayscale" />
                            </div>
                          )}
                          {selectedBrand.logo_reversed_url && (
                            <div className="w-10 h-10 rounded-md border border-border bg-foreground p-1 flex items-center justify-center" title="Reversed">
                              <img src={selectedBrand.logo_reversed_url} alt="Reversed" className="max-w-full max-h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Photography Guidelines */}
                    {((selectedBrand.styles?.photography_dos?.length ?? 0) > 0 || (selectedBrand.styles?.photography_donts?.length ?? 0) > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Photography Guidelines</span>
                        </div>
                        {(selectedBrand.styles?.photography_dos?.length ?? 0) > 0 && (
                          <div className="mb-1.5">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Do's
                            </p>
                            <div className="space-y-1">
                              {selectedBrand.styles!.photography_dos!.slice(0, 3).map((item, i) => (
                                <p key={i} className="text-[10px] text-foreground/70 leading-relaxed line-clamp-2 pl-4">{item}</p>
                              ))}
                              {(selectedBrand.styles!.photography_dos!.length > 3) && (
                                <p className="text-[10px] text-muted-foreground pl-4">+{selectedBrand.styles!.photography_dos!.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        )}
                        {(selectedBrand.styles?.photography_donts?.length ?? 0) > 0 && (
                          <div>
                            <p className="text-[10px] text-destructive font-medium mb-1 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Don'ts
                            </p>
                            <div className="space-y-1">
                              {selectedBrand.styles!.photography_donts!.slice(0, 3).map((item, i) => (
                                <p key={i} className="text-[10px] text-foreground/70 leading-relaxed line-clamp-2 pl-4">{item}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Logo Rules */}
                    {(selectedBrand.styles?.logo_clear_space || selectedBrand.styles?.logo_min_size || (selectedBrand.styles?.logo_placement_rules?.length ?? 0) > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Ruler className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Logo Rules</span>
                        </div>
                        <div className="space-y-1">
                          {selectedBrand.styles?.logo_clear_space && (
                            <p className="text-[10px]"><span className="text-muted-foreground">Clear space:</span> <span className="font-medium">{selectedBrand.styles.logo_clear_space}</span></p>
                          )}
                          {selectedBrand.styles?.logo_min_size && (
                            <p className="text-[10px]"><span className="text-muted-foreground">Min size:</span> <span className="font-medium">{selectedBrand.styles.logo_min_size}</span></p>
                          )}
                          {(selectedBrand.styles?.logo_placement_rules?.length ?? 0) > 0 && (
                            <div className="mt-1">
                              {selectedBrand.styles!.logo_placement_rules!.slice(0, 3).map((rule, i) => (
                                <p key={i} className="text-[10px] text-foreground/70 pl-2 border-l border-primary/20 mb-0.5">{rule}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Restrictions */}
                    {((selectedBrand.styles?.restricted_elements?.length ?? 0) > 0) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Ban className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Restrictions</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedBrand.styles!.restricted_elements!.slice(0, 4).map((el, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{el}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brand Imagery Gallery */}
                    {selectedBrand.styles?.all_imagery?.all && selectedBrand.styles.all_imagery.all.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Images className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Brand Imagery ({selectedBrand.styles.all_imagery.all.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {selectedBrand.styles.all_imagery.all.slice(0, 8).map((url, i) => (
                            <div key={i} className="aspect-square rounded border border-border overflow-hidden bg-muted">
                              <img src={url} alt={`Brand ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ))}
                        </div>
                        {selectedBrand.styles.all_imagery.all.length > 8 && (
                          <p className="text-[10px] text-muted-foreground text-center mt-1">
                            +{selectedBrand.styles.all_imagery.all.length - 8} more images
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  </ScrollArea>
                </CollapsibleContent>
              </div>
            </Collapsible>

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
    </TooltipProvider>
  );
};
