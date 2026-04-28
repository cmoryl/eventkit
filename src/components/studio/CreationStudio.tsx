import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Palette, Printer, Shirt, Share2, Presentation, Building,
  Ticket, UtensilsCrossed, Video, FileText, Camera, Shield, Plus,
  Grid, List, Sliders, Download, Sparkles, ChevronRight, PanelRightOpen, PanelRightClose,
  Accessibility
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
import JSZip from 'jszip';
import { StudioSidebar } from './StudioSidebar';
import { StudioAssetGrid } from './StudioAssetGrid';
import { StudioProductionPanel } from './StudioProductionPanel';
import { BrandSelector } from './BrandSelector';
import { BrandsPanel } from './BrandsPanel';
import { StudioReferenceChat } from './StudioReferenceChat';
import { AccessibilityAnalysisPanel } from './AccessibilityAnalysisPanel';
import { AutoSaveIndicator, AutoSaveStatus } from './AutoSaveIndicator';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { LogoOverrideSelector } from './LogoOverrideSelector';
import { FontPickerDropdown } from './FontPickerDropdown';
import { BatchGenerationModal } from './BatchGenerationModal';
import { assetDisplayInfo } from './StudioAssetGrid';
import type { GoogleFontSelection } from './AssetBriefModal';
import { checkAndSyncBrand, forceResyncBrand } from '@/services/brandAutoSync';
import { StyleAnchorProvider } from '@/contexts/StyleAnchorContext';

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
  const [selectedBrand, setSelectedBrandState] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProductionPanel, setShowProductionPanel] = useState(false);
  const [showBrandsPanel, setShowBrandsPanel] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Project persistence state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [projectLogoOverride, setProjectLogoOverride] = useState<string | null>(null);
  const [projectFontSelection, setProjectFontSelection] = useState<GoogleFontSelection | null>(null);
  const [showBatchGeneration, setShowBatchGeneration] = useState(false);
  const [batchGeneratedImages, setBatchGeneratedImages] = useState<Record<string, string>>({});
  const [isBrandSyncing, setIsBrandSyncing] = useState(false);
  
  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousImagesRef = useRef<string>('{}');
  
  // Wrap brand selection to persist to sessionStorage
  const setSelectedBrand = useCallback((brand: Brand | null) => {
    setSelectedBrandState(brand);
    if (brand) {
      sessionStorage.setItem('active-brand-id', brand.id);
    } else {
      sessionStorage.removeItem('active-brand-id');
    }
  }, []);

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
        
        // Priority: sessionStorage > profile persisted brand > is_default > first brand
        const sessionBrandId = sessionStorage.getItem('active-brand-id');
        const sessionBrand = sessionBrandId ? transformedBrands.find(b => b.id === sessionBrandId) : null;
        
        if (sessionBrand) {
          setSelectedBrand(sessionBrand);
        } else {
          // Check profile for persisted brand
          const { data: profileData } = await supabase
            .from('profiles')
            .select('applied_brand_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const persistedBrand = profileData?.applied_brand_id 
            ? transformedBrands.find(b => b.id === profileData.applied_brand_id) 
            : null;
          
          const brandToUse = persistedBrand || transformedBrands.find(b => b.is_default) || transformedBrands[0];
          if (brandToUse) {
            setSelectedBrand(brandToUse);
            sessionStorage.setItem('active-brand-id', brandToUse.id);
          }
        }
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrands();
  }, [user]);

  // Auto-sync BrandHub brands on studio load
  useEffect(() => {
    if (selectedBrand && user) {
      checkAndSyncBrand(selectedBrand.id, user.id, { silent: true }).catch(() => {});
    }
  }, [selectedBrand?.id, user?.id]);

  // Manual re-sync handler
  const handleResyncBrand = useCallback(async (brandId: string) => {
    if (!user) return;
    setIsBrandSyncing(true);
    try {
      await forceResyncBrand(brandId, user.id);
      toast.success('Brand re-synced from BrandHub');
    } finally {
      setIsBrandSyncing(false);
    }
  }, [user]);

  // Save project as ZIP
  const handleSaveProject = async () => {
    if (!studio || !selectedBrand) {
      toast.error('Please select a brand first');
      return;
    }
    
    setIsSaving(true);
    try {
      const zip = new JSZip();
      const assetsFolder = zip.folder("assets");
      
      // Save generated images
      const processedAssets = await Promise.all(
        Object.entries(generatedImages).map(async ([assetType, imageUrl]) => {
          if (imageUrl.startsWith('data:')) {
            const ext = imageUrl.split(';')[0].split('/')[1] || 'png';
            const filename = `${assetType}.${ext}`;
            if (assetsFolder) {
              assetsFolder.file(filename, imageUrl.split(',')[1], { base64: true });
            }
            return { assetType, path: `assets/${filename}` };
          } else if (imageUrl.startsWith('blob:')) {
            try {
              const res = await fetch(imageUrl);
              const blob = await res.blob();
              const ext = blob.type.split('/')[1] || 'png';
              const filename = `${assetType}.${ext}`;
              if (assetsFolder) {
                assetsFolder.file(filename, blob);
              }
              return { assetType, path: `assets/${filename}` };
            } catch (e) {
              console.warn("Failed to fetch blob", e);
              return { assetType, path: imageUrl };
            }
          }
          return { assetType, path: imageUrl };
        })
      );

      const projectData = {
        version: '2.0',
        studioId: studio.id,
        brand: selectedBrand ? {
          id: selectedBrand.id,
          name: selectedBrand.name,
          styles: selectedBrand.styles,
        } : null,
        generatedAssets: processedAssets,
        selectedAssets,
        activeCategory,
        viewMode,
        projectLogoOverride: projectLogoOverride || null,
        projectFontSelection: projectFontSelection || null,
        createdAt: new Date().toISOString(),
      };

      zip.file("project.json", JSON.stringify(projectData, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedBrand?.name || 'project'}_${studio.shortName}_kit.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  // Load project from ZIP
  const handleLoadProject = async (file: File) => {
    setIsLoadingProject(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const projectJson = await zip.file("project.json")?.async("string");

      if (!projectJson) {
        throw new Error("Invalid project file");
      }

      const projectData = JSON.parse(projectJson);

      // Navigate to correct studio if different
      if (projectData.studioId && projectData.studioId !== studioId) {
        navigate(`/studio/${projectData.studioId}`);
      }

      // Restore generated images
      const restoredImages: Record<string, string> = {};
      if (projectData.generatedAssets) {
        await Promise.all(projectData.generatedAssets.map(async (asset: { assetType: string; path?: string; imageUrl?: string }) => {
          // New format: imageUrl is a persistent storage URL
          if (asset.imageUrl && !asset.imageUrl.startsWith('data:')) {
            restoredImages[asset.assetType] = asset.imageUrl;
          } else if (asset.path && asset.path.startsWith('assets/')) {
            // Legacy ZIP format: extract base64 from zip
            const assetFile = await zip.file(asset.path)?.async("base64");
            if (assetFile) {
              const ext = asset.path.split('.').pop();
              restoredImages[asset.assetType] = `data:image/${ext};base64,${assetFile}`;
            }
          }
        }));
      }

      setGeneratedImages(restoredImages);
      if (projectData.projectLogoOverride) setProjectLogoOverride(projectData.projectLogoOverride);
      if (projectData.projectFontSelection) setProjectFontSelection(projectData.projectFontSelection);
      if (projectData.activeCategory) setActiveCategory(projectData.activeCategory);
      if (projectData.viewMode) setViewMode(projectData.viewMode);
      if (projectData.selectedAssets) setSelectedAssets(projectData.selectedAssets);

      toast.success('Project loaded successfully!');
    } catch (error) {
      console.error('Load failed:', error);
      toast.error('Failed to load project');
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Save to cloud
  const handleSaveToCloud = async () => {
    if (!user) {
      toast.error('Please sign in to save to cloud');
      return;
    }
    if (!selectedBrand) {
      toast.error('Please select a brand first');
      return;
    }

    setIsSavingToCloud(true);
    try {
      // Upload base64 images to storage and collect persistent URLs
      const persistedAssets = await Promise.all(
        Object.entries(generatedImages).map(async ([assetType, imageUrl]) => {
          let persistentUrl = imageUrl;
          
          // Convert base64 to storage URL
          if (imageUrl.startsWith('data:')) {
            try {
              const base64Data = imageUrl.split(',')[1];
              const mimeMatch = imageUrl.match(/data:(image\/\w+);/);
              const ext = mimeMatch ? mimeMatch[1].split('/')[1] : 'png';
              const blob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              const fileName = `studio/${user.id}/${studio?.id || 'default'}/${assetType}_${Date.now()}.${ext}`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('asset-images')
                .upload(fileName, blob, { contentType: mimeMatch?.[1] || 'image/png', upsert: true });

              if (!uploadError && uploadData?.path) {
                const { data: urlData } = supabase.storage.from('asset-images').getPublicUrl(uploadData.path);
                if (urlData?.publicUrl) {
                  persistentUrl = urlData.publicUrl;
                }
              }
            } catch (e) {
              console.warn(`Failed to persist ${assetType} to storage:`, e);
            }
          }
          
          return {
            assetType,
            imageUrl: persistentUrl,
            hasContent: true,
          };
        })
      );

      // Update local state with persisted URLs
      const updatedImages: Record<string, string> = {};
      persistedAssets.forEach(a => { updatedImages[a.assetType] = a.imageUrl; });
      setGeneratedImages(updatedImages);

      const projectData = {
        user_id: user.id,
        name: `${selectedBrand.name} - ${studio?.name || 'Studio'}`,
        description: `Created in ${studio?.name || 'Studio'}`,
        event_details: JSON.parse(JSON.stringify({
          name: selectedBrand.name,
          studioId: studio?.id,
          projectLogoOverride: projectLogoOverride || null,
          projectFontSelection: projectFontSelection || null,
        })),
        generated_assets: JSON.parse(JSON.stringify(persistedAssets)),
      };

      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', projectData.name)
        .maybeSingle();

      if (existingProject) {
        const { user_id, ...updateData } = projectData;
        await supabase
          .from('projects')
          .update(updateData)
          .eq('id', existingProject.id);
      } else {
        await supabase
          .from('projects')
          .insert([projectData]);
      }

      toast.success('Project saved to cloud!');
    } catch (error) {
      console.error('Cloud save error:', error);
      toast.error('Failed to save to cloud');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Auto-save: detect changes to generatedImages and trigger background save
  const performAutoSave = useCallback(async () => {
    if (!user || !selectedBrand || !studio) return;
    const imageEntries = Object.entries(generatedImages);
    if (imageEntries.length === 0) return;

    setAutoSaveStatus('saving');
    try {
      const persistedAssets = await Promise.all(
        imageEntries.map(async ([assetType, imageUrl]) => {
          let persistentUrl = imageUrl;
          if (imageUrl.startsWith('data:')) {
            try {
              const base64Data = imageUrl.split(',')[1];
              const mimeMatch = imageUrl.match(/data:(image\/\w+);/);
              const ext = mimeMatch ? mimeMatch[1].split('/')[1] : 'png';
              const blob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              const fileName = `studio/${user.id}/${studio.id}/${assetType}_${Date.now()}.${ext}`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('asset-images')
                .upload(fileName, blob, { contentType: mimeMatch?.[1] || 'image/png', upsert: true });
              if (!uploadError && uploadData?.path) {
                const { data: urlData } = supabase.storage.from('asset-images').getPublicUrl(uploadData.path);
                if (urlData?.publicUrl) persistentUrl = urlData.publicUrl;
              }
            } catch (e) {
              console.warn(`Auto-save: failed to persist ${assetType}`, e);
            }
          }
          return { assetType, imageUrl: persistentUrl, hasContent: true };
        })
      );

      // Update local state with persisted URLs
      const updatedImages: Record<string, string> = {};
      persistedAssets.forEach(a => { updatedImages[a.assetType] = a.imageUrl; });
      setGeneratedImages(updatedImages);

      const projectName = `${selectedBrand.name} - ${studio.name}`;
      const projectPayload = {
        user_id: user.id,
        name: projectName,
        description: `Created in ${studio.name}`,
        event_details: JSON.parse(JSON.stringify({ name: selectedBrand.name, studioId: studio.id, projectLogoOverride: projectLogoOverride || null, projectFontSelection: projectFontSelection || null })),
        generated_assets: JSON.parse(JSON.stringify(persistedAssets)),
      };

      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', projectName)
        .maybeSingle();

      if (existing) {
        const { user_id, ...updateData } = projectPayload;
        await supabase.from('projects').update(updateData).eq('id', existing.id);
      } else {
        await supabase.from('projects').insert([projectPayload]);
      }

      previousImagesRef.current = JSON.stringify(updatedImages);
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [user, selectedBrand, studio, generatedImages]);

  // Watch for changes and schedule auto-save (30s debounce)
  useEffect(() => {
    const currentSnapshot = JSON.stringify(generatedImages);
    if (currentSnapshot === previousImagesRef.current || Object.keys(generatedImages).length === 0) {
      return;
    }
    
    setAutoSaveStatus('pending');
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (user && selectedBrand) {
        performAutoSave();
      }
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [generatedImages, user, selectedBrand, performAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Determine if there are unsaved changes
  const hasUnsavedChanges = autoSaveStatus === 'pending' || autoSaveStatus === 'error';

  // Browser beforeunload warning
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // In-app navigation blocker via popstate (back/forward buttons)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);
  const hasUnsavedRef = useRef(hasUnsavedChanges);
  hasUnsavedRef.current = hasUnsavedChanges;

  // Intercept browser back/forward
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const handlePopState = () => {
      if (hasUnsavedRef.current) {
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
        setShowUnsavedDialog(true);
        pendingNavigationRef.current = '__back__';
      }
    };

    // Push a guard state
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges]);

  // Wrapped navigate that checks for unsaved changes
  const safeNavigate = useCallback((path: string) => {
    if (hasUnsavedRef.current) {
      pendingNavigationRef.current = path;
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  }, [navigate]);

  const handleDiscardAndLeave = () => {
    setShowUnsavedDialog(false);
    previousImagesRef.current = JSON.stringify(generatedImages);
    setAutoSaveStatus('idle');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    const dest = pendingNavigationRef.current;
    pendingNavigationRef.current = null;
    if (dest === '__back__') {
      window.history.back();
    } else if (dest) {
      navigate(dest);
    }
  };

  const handleSaveAndLeave = async () => {
    setIsSavingBeforeLeave(true);
    try {
      await performAutoSave();
    } catch (e) {
      console.error('Save before leave failed:', e);
    } finally {
      setIsSavingBeforeLeave(false);
      setShowUnsavedDialog(false);
      const dest = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      if (dest === '__back__') {
        window.history.back();
      } else if (dest) {
        navigate(dest);
      }
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedDialog(false);
    pendingNavigationRef.current = null;
  };

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
      {/* Auto-Save Indicator */}
      {isAuthenticated && Object.keys(generatedImages).length > 0 && (
        <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
      )}
      
      {/* Brand Selector */}
      <BrandSelector
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        onCreateBrand={() => navigate('/admin?tab=brands')}
        onResyncBrand={handleResyncBrand}
        isSyncing={isBrandSyncing}
      />
      
      {/* Project Logo Override */}
      <LogoOverrideSelector
        overrideLogoUrl={projectLogoOverride}
        brandLogoUrl={selectedBrand?.logo_url}
        onLogoChange={setProjectLogoOverride}
        label="Logo"
      />

      {/* Project Font Selection */}
      <FontPickerDropdown
        selectedFonts={projectFontSelection}
        onFontsChange={setProjectFontSelection}
        compact
      />
      
      <div className="hidden sm:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-foreground/15 text-foreground' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10'}`}
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${viewMode === 'list' ? 'bg-foreground/15 text-foreground' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10'}`}
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowProductionPanel(!showProductionPanel)}
        className="hidden lg:flex"
      >
        <Sliders className="h-4 w-4 mr-2" />
        <span className="hidden xl:inline">Production</span>
      </Button>

      <Button
        variant={showAccessibility ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => setShowAccessibility(!showAccessibility)}
        className="hidden lg:flex"
        title="Accessibility Analysis"
      >
        <Accessibility className="h-4 w-4 mr-2" />
        <span className="hidden xl:inline">A11y</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={`h-8 w-8 hidden md:flex ${showBrandsPanel ? 'bg-foreground/15 text-foreground border-foreground/20' : 'text-foreground/80 hover:text-foreground'}`}
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
          <span className="hidden sm:inline">Export ({selectedAssets.length})</span>
          <span className="sm:hidden">{selectedAssets.length}</span>
        </Button>
      )}
    </>
  );

  return (
    <StyleAnchorProvider>
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <AppNavHeader 
        subtitle={studio.name}
        showStudioNav
        currentStudioId={studio.id}
        actions={studioActions}
        showProjectControls
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onSaveToCloud={handleSaveToCloud}
        isSaving={isSaving}
        isLoadingProject={isLoadingProject}
        isSavingToCloud={isSavingToCloud}
      />

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Categories */}
        <StudioSidebar
          studio={studio}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 min-w-0">
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
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {activeCategory === 'all' 
                    ? 'All Asset Types' 
                    : studio.categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {activeCategory === 'all'
                    ? studio.description
                    : studio.categories.find(c => c.id === activeCategory)?.description}
                </p>
              </div>
              
              <Button 
                className={`bg-gradient-to-r ${studio.gradient} flex-shrink-0`} 
                size="sm"
                onClick={() => setShowBatchGeneration(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
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
            projectLogoOverride={projectLogoOverride}
            projectFontSelection={projectFontSelection}
            batchGeneratedImages={batchGeneratedImages}
          />

          {/* AI Reference Chat */}
          <StudioReferenceChat
            studioType={studio.id}
            studioName={studio.name}
            studioGradient={studio.gradient}
          />
        </main>

        {/* Brands Panel - hidden on small screens */}
        <AnimatePresence>
          {showBrandsPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden hidden md:block"
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

        {/* Accessibility Panel */}
        <AnimatePresence>
          {showAccessibility && (
            <AccessibilityAnalysisPanel
              isOpen={showAccessibility}
              onClose={() => setShowAccessibility(false)}
              brand={selectedBrand}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onDiscard={handleDiscardAndLeave}
        onSaveAndLeave={handleSaveAndLeave}
        onCancel={handleCancelLeave}
        isSaving={isSavingBeforeLeave}
      />

      {/* Batch Generation Modal */}
      <BatchGenerationModal
        isOpen={showBatchGeneration}
        onClose={() => setShowBatchGeneration(false)}
        assetTypes={filteredAssetTypes}
        brand={selectedBrand}
        eventName={selectedBrand?.name || 'Your Event'}
        studioGradient={studio.gradient}
        projectLogoOverride={projectLogoOverride}
        assetDisplayInfo={assetDisplayInfo}
        onImagesGenerated={(newImages) => {
          setBatchGeneratedImages(prev => ({ ...prev, ...newImages }));
          setGeneratedImages(prev => ({ ...prev, ...newImages }));
        }}
      />
    </div>
    </StyleAnchorProvider>
  );
};
