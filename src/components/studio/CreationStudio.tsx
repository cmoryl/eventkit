import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Palette, Printer, Shirt, Share2, Presentation, Building,
  Ticket, UtensilsCrossed, Video, FileText, Camera, Shield, Plus,
  Grid, List, Sliders, Download, Sparkles, ChevronRight, PanelRightOpen, PanelRightClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppNavHeader } from '@/components/layout/AppNavHeader';
import { 
  StudioType, StudioDefinition, STUDIO_DEFINITIONS, getStudioById,
  Brand
} from '@/types/studio.types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StudioSidebar } from './StudioSidebar';
import { StudioAssetGrid } from './StudioAssetGrid';
import { StudioProductionPanel } from './StudioProductionPanel';
import { BrandSelector } from './BrandSelector';
import { BrandsPanel } from './BrandsPanel';

const iconMap: Record<string, React.ElementType> = {
  'Palette': Palette,
  'Printer': Printer,
  'Shirt': Shirt,
  'Share2': Share2,
  'Presentation': Presentation,
  'Building': Building,
  'Ticket': Ticket,
  'UtensilsCrossed': UtensilsCrossed,
  'Video': Video,
  'FileText': FileText,
  'Camera': Camera,
  'Shield': Shield,
};

export const CreationStudio: React.FC = () => {
  const { studioId } = useParams<{ studioId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [studio, setStudio] = useState<StudioDefinition | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProductionPanel, setShowProductionPanel] = useState(false);
  const [showBrandsPanel, setShowBrandsPanel] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load studio definition
  useEffect(() => {
    if (studioId) {
      const studioData = getStudioById(studioId as StudioType);
      if (studioData) {
        setStudio(studioData);
        setActiveCategory('all');
      } else {
        navigate('/');
        toast.error('Studio not found');
      }
    }
  }, [studioId, navigate]);

  // Load user's brands
  useEffect(() => {
    const loadBrands = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*, brand_styles(*)')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match Brand type with proper type handling
        const transformedBrands: Brand[] = (data || []).map(brand => {
          const rawStyle = brand.brand_styles?.[0];
          return {
            id: brand.id,
            user_id: brand.user_id,
            name: brand.name,
            description: brand.description || undefined,
            logo_url: brand.logo_url || undefined,
            logo_monochrome_url: brand.logo_monochrome_url || undefined,
            logo_reversed_url: brand.logo_reversed_url || undefined,
            is_default: brand.is_default,
            created_at: brand.created_at,
            updated_at: brand.updated_at,
            styles: rawStyle ? {
              id: rawStyle.id,
              brand_id: rawStyle.brand_id,
              primary_color: rawStyle.primary_color || undefined,
              secondary_color: rawStyle.secondary_color || undefined,
              accent_color: rawStyle.accent_color || undefined,
              color_palette: Array.isArray(rawStyle.color_palette) ? rawStyle.color_palette as any[] : [],
              heading_font: rawStyle.heading_font || undefined,
              body_font: rawStyle.body_font || undefined,
              accent_font: rawStyle.accent_font || undefined,
              typography_scale: typeof rawStyle.typography_scale === 'object' ? rawStyle.typography_scale as Record<string, unknown> : {},
              brand_voice: rawStyle.brand_voice || [],
              tone_keywords: rawStyle.tone_keywords || [],
              writing_style: rawStyle.writing_style || undefined,
              mood_keywords: rawStyle.mood_keywords || [],
              imagery_style: rawStyle.imagery_style || undefined,
              pattern_style: rawStyle.pattern_style || undefined,
              icon_style: rawStyle.icon_style || undefined,
              target_audience: rawStyle.target_audience || undefined,
              cultural_context: rawStyle.cultural_context || undefined,
              industry: rawStyle.industry || undefined,
              print_color_mode: (rawStyle.print_color_mode as 'CMYK' | 'RGB' | 'Pantone') || 'CMYK',
              preferred_render_engine: rawStyle.preferred_render_engine || undefined,
              custom_prompts: typeof rawStyle.custom_prompts === 'object' ? rawStyle.custom_prompts as Record<string, string> : {},
              created_at: rawStyle.created_at,
              updated_at: rawStyle.updated_at
            } : undefined
          };
        });
        
        setBrands(transformedBrands);
        
        // Set default brand
        const defaultBrand = transformedBrands.find(b => b.is_default) || transformedBrands[0];
        if (defaultBrand) {
          setSelectedBrand(defaultBrand);
        }
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrands();
  }, [user]);

  if (!studio) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading studio...</div>
      </div>
    );
  }

  const StudioIcon = iconMap[studio.icon] || Sparkles;
  
  const filteredAssetTypes = activeCategory === 'all' 
    ? studio.assetTypes 
    : studio.categories.find(c => c.id === activeCategory)?.assetTypes || [];

  const studioActions = (
    <>
      {/* Brand Selector */}
      <BrandSelector
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        onCreateBrand={() => navigate('/admin?tab=brands')}
      />
      
      <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowProductionPanel(!showProductionPanel)}
        className="hidden md:flex"
      >
        <Sliders className="h-4 w-4 mr-2" />
        Production
      </Button>

      <Button
        variant={showBrandsPanel ? 'secondary' : 'outline'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setShowBrandsPanel(!showBrandsPanel)}
        title={showBrandsPanel ? 'Hide Brands Panel' : 'Show Brands Panel'}
      >
        {showBrandsPanel ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelRightOpen className="h-4 w-4" />
        )}
      </Button>
      
      {selectedAssets.length > 0 && (
        <Button size="sm" className={`bg-gradient-to-r ${studio.gradient}`}>
          <Download className="h-4 w-4 mr-2" />
          Export ({selectedAssets.length})
        </Button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <AppNavHeader 
        subtitle={studio.name}
        showStudioNav
        currentStudioId={studio.id}
        actions={studioActions}
      />

      <div className="flex">
        {/* Sidebar - Categories */}
        <StudioSidebar
          studio={studio}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Category Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{studio.shortName}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">
                {activeCategory === 'all' 
                  ? 'All Assets' 
                  : studio.categories.find(c => c.id === activeCategory)?.name}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeCategory === 'all' 
                    ? 'All Asset Types' 
                    : studio.categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {activeCategory === 'all'
                    ? studio.description
                    : studio.categories.find(c => c.id === activeCategory)?.description}
                </p>
              </div>
              
              <Button className={`bg-gradient-to-r ${studio.gradient}`}>
                <Plus className="h-4 w-4 mr-2" />
                Generate All
              </Button>
            </div>
          </div>
          
          {/* Asset Grid */}
          <StudioAssetGrid
            assetTypes={filteredAssetTypes}
            brand={selectedBrand}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onSelectAsset={(id) => {
              setSelectedAssets(prev => 
                prev.includes(id) 
                  ? prev.filter(a => a !== id)
                  : [...prev, id]
              );
            }}
            studioGradient={studio.gradient}
          />
        </main>

        {/* Brands Panel */}
        <AnimatePresence>
          {showBrandsPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <BrandsPanel
                brands={brands}
                selectedBrand={selectedBrand}
                onSelectBrand={setSelectedBrand}
                onCreateBrand={() => navigate('/admin?tab=brands')}
                onEditBrand={(brand) => navigate(`/admin?tab=brands&edit=${brand.id}`)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Production Panel */}
        <AnimatePresence>
          {showProductionPanel && (
            <StudioProductionPanel
              studio={studio}
              brand={selectedBrand}
              selectedAssets={selectedAssets}
              onClose={() => setShowProductionPanel(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
