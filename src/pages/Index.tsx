import React, { useState, useEffect, useMemo } from 'react';
import LandingPage from '../components/landing/LandingPage';
import { v4 as uuidv4 } from 'uuid';
import { AssetType } from '../types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset, QRCodeGenerationParams, PresentationData, VenueVideoAnalysis } from '../types';
import type { RenderEngine } from '@/services/aiBrain/types';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import StudioHeader from '../components/studio/StudioHeader';
import AssetGrid from '../components/studio/AssetGrid';
import AssetPreviewModal from '../components/studio/AssetPreviewModal';
import AssetDownloadModal from '../components/studio/AssetDownloadModal';
import GenerationLoader from '../components/GenerationLoader';
import GenerationSummary from '../components/GenerationSummary';
import { GenerationQueueStatus } from '../components/GenerationQueueStatus';
import Toast from '../components/Toast';
import ImageEditorModal from '../components/ImageEditorModal';
import PaletteEditorModal from '../components/PaletteEditorModal';
import TextEditorModal from '../components/TextEditorModal';
import TextListEditorModal from '../components/TextListEditorModal';
import QRCodeGeneratorModal from '../components/QRCodeGeneratorModal';
import PresentationEditorModal from '../components/PresentationEditorModal';
import { AuthModal } from '../components/auth/AuthModal';
import { VideoTeaserModal } from '../components/VideoTeaserModal';
import { AIImageEditModal } from '../components/AIImageEditModal';
import EventDashboard from '../components/EventDashboard';
import AdvancedExportModal from '../components/AdvancedExportModal';
import BatchPrintExportModal from '../components/BatchPrintExportModal';
import VenuePreviewGenerator from '../components/VenuePreviewGenerator';
import RegenerateWithEngineModal from '../components/RegenerateWithEngineModal';
import { useProjectHistory } from '../hooks/useProjectHistory';
import { useProjectPersistence } from '../hooks/useProjectPersistence';
import { useAIOrchestrator } from '../hooks/useAIOrchestrator';
import { useQueuedGeneration } from '../hooks/useQueuedGeneration';
import { useAuth } from '../hooks/useAuth';
import { useAIBrain } from '../hooks/useAIBrain';
import { fileToBase64, downloadAllAssets } from '../utils';
import { getAssetConfig } from '../config/assetConfig';
import { generateBrandStyleGuide } from '../services/brandGuideGenerator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ensureProtocol = (url: string) => url && !url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url;

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { insights, isReady: isBrainReady } = useAIBrain();
  
  const [view, setView] = useState<'landing' | 'onboarding' | 'studio'>('landing');
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: '',
    description: '',
    date: '',
    location: '',
    website: '',
    email: '',
    incorporateLocationStyle: false,
  });
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [styleDescription, setStyleDescription] = useState('');
  const [colorPalette, setColorPalette] = useState<ColorInfo[]>([]);
  const [vibeImage, setVibeImage] = useState<File | null>(null);
  const [masterPattern, setMasterPattern] = useState<File | null>(null);
  const [venueVideoAnalysis, setVenueVideoAnalysis] = useState<VenueVideoAnalysis | null>(null);
  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [editingAsset, setEditingAsset] = useState<GeneratedAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<GeneratedAsset | null>(null);
  const [downloadingAsset, setDownloadingAsset] = useState<GeneratedAsset | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAIImageEdit, setShowAIImageEdit] = useState(false);
  const [aiEditingAsset, setAiEditingAsset] = useState<GeneratedAsset | null>(null);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [showEventDashboard, setShowEventDashboard] = useState(false);
  const [showAdvancedExport, setShowAdvancedExport] = useState(false);
  const [showBatchPrintExport, setShowBatchPrintExport] = useState(false);
  const [showVenuePreview, setShowVenuePreview] = useState(false);
  const [showGenerationSummary, setShowGenerationSummary] = useState(false);
  const [regeneratingAsset, setRegeneratingAsset] = useState<GeneratedAsset | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToastState({ message, type });

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useProjectHistory({
    eventDetails, generatedAssets, logos, styleDescription, colorPalette, folders
  }, (restored) => {
    setEventDetails(restored.eventDetails);
    setGeneratedAssets(restored.generatedAssets);
    setLogos(restored.logos);
    setStyleDescription(restored.styleDescription);
    setColorPalette(restored.colorPalette);
    setFolders(restored.folders);
  });

  const { handleSaveProject, handleLoadProject, isExporting, isLoadingProject } = useProjectPersistence({
    eventDetails, generatedAssets, logos, styleDescription, colorPalette, folders, showToast,
    onLoad: async (data) => {
      setEventDetails(data.eventDetails);
      setStyleDescription(data.styleDescription);
      setColorPalette(data.colorPalette);
      setFolders(data.folders);
      setGeneratedAssets(data.generatedAssets);
      setLogos(data.logos);
      setView('studio');
    }
  });

  const { generateAssets, isLoading, generationProgress } = useAIOrchestrator({
    eventDetails, logos, styleImage: null, masterPatternImage: null, colorPalette, setColorPalette, generatedAssets, setGeneratedAssets, ensureProtocol
  });

  // Prepare logo base64 for queued generation
  const [primaryLogoBase64, setPrimaryLogoBase64] = useState<string | undefined>();
  
  useEffect(() => {
    const prepareLogoBase64 = async () => {
      if (logos.length > 0 && logos[0].file) {
        try {
          const b64 = await fileToBase64(logos[0].file);
          setPrimaryLogoBase64(`data:${b64.type};base64,${b64.data}`);
        } catch (e) {
          console.warn('Failed to convert logo:', e);
        }
      }
    };
    prepareLogoBase64();
  }, [logos]);

  // Queued generation with priority and retries
  const {
    jobs: queueJobs,
    stats: queueStats,
    startQueuedGeneration,
    retryAllFailed,
    pauseQueue,
    resumeQueue,
    cancelAll: cancelQueue,
    clearQueue,
    isProcessing: isQueueProcessing,
  } = useQueuedGeneration({
    eventDetails,
    colorPalette,
    setColorPalette,
    setGeneratedAssets,
    logoBase64: primaryLogoBase64,
    styleDesc: styleDescription,
  });

  // Track whether to use queue mode (for larger batches)
  const [useQueueMode, setUseQueueMode] = useState(false);

  // Auto-regenerate for non-logged-in users (skip engine selection modal)
  useEffect(() => {
    if (regeneratingAsset && !user) {
      handleRegenerateAsset(regeneratingAsset);
      setRegeneratingAsset(null);
    }
  }, [regeneratingAsset, user]);

  const handleOnboardingComplete = async (data: {
    eventDetails: EventDetails;
    logos: LogoAsset[];
    selectedAssets: Set<AssetType>;
    styleDescription: string;
    vibeImage: File | null;
    masterPattern: File | null;
    venueImage: File | null;
    venueVideoAnalysis: VenueVideoAnalysis | null;
  }, isAddingMore = false) => {
    pushSnapshot();
    
    // In add-more mode, keep existing event details (they're passed back unchanged)
    // but update style if changed
    if (!isAddingMore) {
      setEventDetails(data.eventDetails);
      setLogos(data.logos);
    }
    setStyleDescription(data.styleDescription);
    setVibeImage(data.vibeImage);
    setMasterPattern(data.masterPattern);
    setVenueVideoAnalysis(data.venueVideoAnalysis);
    setView('studio');

    // Create asset placeholders for NEW assets only
    const newAssets: GeneratedAsset[] = [];

    // Only add logos if not in add-more mode (logos are already in the project)
    if (!isAddingMore) {
      for (const logo of data.logos) {
        const b64 = await fileToBase64(logo.file);
        newAssets.push({
          id: uuidv4(),
          type: AssetType.Logo,
          title: logo.name,
          content: `data:${b64.type};base64,${b64.data}`,
          isLoading: false,
        });
      }
    }

    // Add selected assets (loading) using asset config
    // In add-more mode, only add assets that don't already exist
    const existingTypes = new Set(generatedAssets.map(a => a.type));
    
    data.selectedAssets.forEach(type => {
      // Skip if we already have this asset type (unless it's a type that allows duplicates)
      if (isAddingMore && existingTypes.has(type)) {
        return;
      }
      
      const config = getAssetConfig(type);
      newAssets.push({
        id: uuidv4(),
        type,
        title: config?.title || 'Asset',
        content: '',
        isLoading: true,
      });
    });

    if (isAddingMore) {
      // Append new assets to existing ones
      setGeneratedAssets(prev => [...prev, ...newAssets]);
    } else {
      // Replace all assets (fresh start)
      setGeneratedAssets(newAssets);
    }
    
    // Only generate if there are new loading assets
    const assetsToGenerate = newAssets.filter(a => a.isLoading);
    if (assetsToGenerate.length > 0) {
      // Use queue mode for larger batches (5+ assets) or if explicitly enabled
      const shouldUseQueue = useQueueMode || assetsToGenerate.length >= 5;
      
      if (shouldUseQueue) {
        // Queued generation with priority ordering and retries
        startQueuedGeneration(assetsToGenerate);
      } else {
        // Standard parallel generation
        await generateAssets(
          assetsToGenerate, 
          data.styleDescription,
          undefined, // paletteOverride
          data.vibeImage,
          data.masterPattern,
          data.venueImage,
          data.venueVideoAnalysis
        );
      }
      
      // Show generation summary after completion
      setShowGenerationSummary(true);
    }
  };

  const handleDeleteAsset = (id: string) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.filter(a => a.id !== id));
    showToast("Asset deleted", "success");
  };

  const handleDeleteMultiple = (ids: string[]) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.filter(a => !ids.includes(a.id)));
    showToast(`${ids.length} assets deleted`, "success");
  };

  const handleDuplicateAsset = (asset: GeneratedAsset) => {
    pushSnapshot();
    setGeneratedAssets(prev => [...prev, {
      ...asset,
      id: uuidv4(),
      title: `${asset.title} (Copy)`,
      isFavorite: false,
    }]);
    showToast("Asset duplicated", "success");
  };

  const handleViewAsset = (asset: GeneratedAsset) => {
    setViewingAsset(asset);
  };

  const handleEditAsset = (asset: GeneratedAsset) => {
    setEditingAsset(asset);
  };

  const handleOverwriteAsset = (assetId: string, newContent: string | string[] | ColorInfo[] | PresentationData, params?: Record<string, unknown>) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const updated = { ...a, content: newContent };
        if (params?.backContent) updated.backContent = params.backContent as string;
        return updated;
      }
      return a;
    }));
    setEditingAsset(null);
    showToast("Asset updated", "success");
  };

  const handleSaveAsNewAsset = (assetId: string, newContent: string | string[] | ColorInfo[] | PresentationData) => {
    pushSnapshot();
    const original = generatedAssets.find(a => a.id === assetId);
    if (original) {
      setGeneratedAssets(prev => [...prev, {
        ...original,
        id: uuidv4(),
        title: `${original.title} (Copy)`,
        content: newContent,
        isLoading: false,
      }]);
    }
    setEditingAsset(null);
    showToast("Saved as new asset", "success");
  };

  const handleToggleFavorite = (asset: GeneratedAsset) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.map(a =>
      a.id === asset.id ? { ...a, isFavorite: !a.isFavorite } : a
    ));
  };

  const handleDownloadAll = async () => {
    try {
      await downloadAllAssets(generatedAssets, eventDetails.name);
      showToast("Download started", "success");
    } catch (e) {
      console.error("Download failed:", e);
      showToast("Download failed", "error");
    }
  };

  const handleExportBrandGuide = async () => {
    setIsGeneratingGuide(true);
    try {
      const slogansAsset = generatedAssets.find(a => a.type === AssetType.Slogans);
      const slogans = Array.isArray(slogansAsset?.content) 
        ? (slogansAsset.content as string[])
        : [];
      
      const logoAsset = generatedAssets.find(a => a.type === AssetType.Logo);
      const logoDataUrl = typeof logoAsset?.content === 'string' ? logoAsset.content : undefined;

      await generateBrandStyleGuide({
        eventDetails,
        colorPalette,
        slogans,
        logoDataUrl,
        assets: generatedAssets,
      });
      showToast("Brand Style Guide exported", "success");
    } catch (e) {
      console.error("Brand guide export failed:", e);
      showToast("Export failed", "error");
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleQRCodeGenerated = (dataUrl: string, params: QRCodeGenerationParams) => {
    pushSnapshot();
    setGeneratedAssets(prev => [...prev, {
      id: uuidv4(),
      type: AssetType.QRCode,
      title: 'QR Code',
      content: dataUrl,
      isLoading: false,
      generationParams: params,
    }]);
    setShowQRGenerator(false);
    showToast("QR Code added to assets", "success");
  };

  // Track whether we're in "add more" mode vs fresh onboarding
  const [addMoreMode, setAddMoreMode] = useState(false);
  // Track pre-selected asset type from landing page click
  const [preSelectedAssetType, setPreSelectedAssetType] = useState<AssetType | null>(null);

  const handleAddMoreAssets = () => {
    setAddMoreMode(true);
    setPreSelectedAssetType(null);
    setView('onboarding');
  };

  const handleCancelAddMore = () => {
    setAddMoreMode(false);
    setPreSelectedAssetType(null);
    setView('studio');
  };

  // Handle quick asset creation from landing page (logged-in users)
  const handleQuickAssetCreate = (assetType: AssetType) => {
    setPreSelectedAssetType(assetType);
    setView('onboarding');
  };

  // Open regenerate with engine modal instead of immediate regeneration
  const handleOpenRegenerateModal = (asset: GeneratedAsset) => {
    setRegeneratingAsset(asset);
  };

  const handleRegenerateAsset = async (asset: GeneratedAsset, engine?: RenderEngine) => {
    pushSnapshot();
    // Mark asset as loading
    setGeneratedAssets(prev => prev.map(a => 
      a.id === asset.id ? { ...a, isLoading: true } : a
    ));
    
    // Regenerate with the selected engine
    console.log('Regenerating with engine:', engine?.displayName || 'Lovable AI (Default)');
    await generateAssets(
      [{ ...asset, isLoading: true }], 
      styleDescription,
      undefined,  // paletteOverride
      vibeImage,  // vibeImageFile
      masterPattern,  // masterPatternFile  
      null,  // venueImageFile
      venueVideoAnalysis,  // venueVideoAnalysisData
      engine  // renderEngine
    );
    showToast(`${asset.title} regenerated`, "success");
  };
  // Save project to cloud
  const handleSaveToCloud = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true);
      return;
    }

    setIsSavingToCloud(true);
    try {
      // Prepare asset data (without large base64 images in JSONB to avoid db bloat)
      const assetSummary = generatedAssets.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        isLoading: a.isLoading,
        isFavorite: a.isFavorite,
        folderId: a.folderId,
        // Store content reference, not full base64
        hasContent: !!a.content,
        contentType: typeof a.content,
      }));

      // Check if user already has a project
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const projectData = {
        user_id: user.id,
        name: eventDetails.name || 'Untitled Project',
        description: eventDetails.description || null,
        event_details: JSON.parse(JSON.stringify(eventDetails)),
        color_palette: JSON.parse(JSON.stringify(colorPalette)),
        folders: JSON.parse(JSON.stringify(folders)),
        generated_assets: JSON.parse(JSON.stringify(assetSummary)),
      };

      let error;
      if (existingProject) {
        // Update existing project - omit user_id for update
        const { user_id, ...updateData } = projectData;
        const result = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', existingProject.id);
        error = result.error;
      } else {
        // Insert new project
        const result = await supabase
          .from('projects')
          .insert([projectData]);
        error = result.error;
      }

      if (error) throw error;

      toast.success('Project saved to cloud!');
      showToast('Project saved to cloud!', 'success');
    } catch (error) {
      console.error('Cloud save error:', error);
      toast.error('Failed to save to cloud');
      showToast('Failed to save to cloud', 'error');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Handle AI image editing
  const handleOpenAIImageEdit = (asset: GeneratedAsset) => {
    setAiEditingAsset(asset);
    setShowAIImageEdit(true);
  };

  const handleAIImageEdited = (newImageUrl: string) => {
    if (aiEditingAsset) {
      pushSnapshot();
      setGeneratedAssets(prev => prev.map(a =>
        a.id === aiEditingAsset.id ? { ...a, content: newImageUrl } : a
      ));
      showToast('Image updated with AI edits', 'success');
    }
    setShowAIImageEdit(false);
    setAiEditingAsset(null);
  };

  // Handle video teaser generation
  const handleVideoGenerated = (thumbnailUrl: string) => {
    pushSnapshot();
    setGeneratedAssets(prev => [...prev, {
      id: uuidv4(),
      type: AssetType.VideoTeaser,
      title: 'Video Teaser',
      content: thumbnailUrl,
      isLoading: false,
    }]);
    showToast('Video teaser added to assets', 'success');
  };

  // Handle advanced export
  const handleAdvancedExport = async (options: {
    format: string;
    quality: number;
    scale: number;
    selectedAssets: string[];
  }) => {
    // Export selected assets with options
    const selectedAssets = generatedAssets.filter(a => options.selectedAssets.includes(a.id));
    try {
      await downloadAllAssets(selectedAssets, eventDetails.name);
      showToast(`Exported ${selectedAssets.length} assets`, 'success');
    } catch (e) {
      console.error('Export failed:', e);
      showToast('Export failed', 'error');
    }
  };

  const getEditorModal = () => {
    if (!editingAsset) return null;

    if (editingAsset.type === AssetType.Palette && Array.isArray(editingAsset.content)) {
      return (
        <PaletteEditorModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onOverwrite={(id, content) => handleOverwriteAsset(id, content)}
          onSaveAsNew={(id, content) => handleSaveAsNewAsset(id, content)}
        />
      );
    }

    if (editingAsset.type === AssetType.Slogans && Array.isArray(editingAsset.content)) {
      return (
        <TextListEditorModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onOverwrite={(id, content) => handleOverwriteAsset(id, content)}
          onSaveAsNew={(id, content) => handleSaveAsNewAsset(id, content)}
        />
      );
    }

    if (editingAsset.type === AssetType.Presentation) {
      return (
        <PresentationEditorModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onOverwrite={(id, content) => handleOverwriteAsset(id, content)}
          onSaveAsNew={(id, content) => handleSaveAsNewAsset(id, content)}
          eventName={eventDetails.name}
          colorPalette={colorPalette.map(c => c.hex)}
        />
      );
    }

    if ((editingAsset.type === AssetType.MarketingCopy || editingAsset.type === AssetType.RunOfShow) && typeof editingAsset.content === 'string') {
      return (
        <TextEditorModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onOverwrite={(id, content) => handleOverwriteAsset(id, content)}
          onSaveAsNew={(id, content) => handleSaveAsNewAsset(id, content)}
        />
      );
    }

    if (typeof editingAsset.content === 'string' && editingAsset.content.startsWith('data:image')) {
      return (
        <ImageEditorModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onOverwrite={handleOverwriteAsset}
          onSaveAsNew={(id, content) => handleSaveAsNewAsset(id, content)}
          eventDetails={eventDetails}
          colorPalette={colorPalette.map(c => c.hex)}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen text-foreground font-sans depth-orbs">
      <div className="soft-bg" />
      
      {view === 'landing' && (
        <LandingPage 
          onGetStarted={() => setView('onboarding')} 
          isAuthenticated={isAuthenticated}
          onAssetClick={isAuthenticated ? handleQuickAssetCreate : undefined}
        />
      )}

      {view === 'onboarding' && (
        <OnboardingFlow 
          onComplete={(data) => {
            const wasAddingMore = addMoreMode;
            setAddMoreMode(false);
            setPreSelectedAssetType(null);
            handleOnboardingComplete(data, wasAddingMore);
          }}
          initialStep={addMoreMode ? 3 : 1}
          initialEventDetails={addMoreMode ? eventDetails : undefined}
          initialLogos={addMoreMode ? logos : undefined}
          initialStyleDescription={addMoreMode ? styleDescription : undefined}
          preSelectedAssetType={preSelectedAssetType}
          onCancel={addMoreMode ? handleCancelAddMore : undefined}
        />
      )}

      {view === 'studio' && (
        <>
          <StudioHeader
            eventName={eventDetails.name}
            assetCount={generatedAssets.length}
            onBackToSetup={() => setView('onboarding')}
            onGoHome={() => setView('landing')}
            onDownloadAll={handleDownloadAll}
            onSave={handleSaveProject}
            onLoad={handleLoadProject}
            onExportBrandGuide={handleExportBrandGuide}
            onOpenQRGenerator={() => setShowQRGenerator(true)}
            onOpenVideoGenerator={() => setShowVideoModal(true)}
            onOpenVenuePreview={venueVideoAnalysis ? () => setShowVenuePreview(true) : undefined}
            onAddMoreAssets={handleAddMoreAssets}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            isExporting={isExporting}
            isGeneratingGuide={isGeneratingGuide}
            isLoadingProject={isLoadingProject}
            onOpenAuth={() => setShowAuthModal(true)}
            onSaveToCloud={handleSaveToCloud}
            isSavingToCloud={isSavingToCloud}
            onOpenDashboard={() => setShowEventDashboard(true)}
            onOpenAdvancedExport={() => setShowAdvancedExport(true)}
            onOpenBatchPrintExport={() => setShowBatchPrintExport(true)}
          />

          <main className="container mx-auto px-4 py-8 animate-fade-in">
            {/* Standard generation loader */}
            {isLoading && !isQueueProcessing && (
              <GenerationLoader
                progress={generationProgress}
                assets={generatedAssets}
                insights={insights}
              />
            )}
            
            {/* Queue-based generation status */}
            {isQueueProcessing && (
              <div className="fixed bottom-4 right-4 z-50 w-96 animate-fade-in">
                <GenerationQueueStatus
                  jobs={queueJobs}
                  stats={queueStats}
                  onPause={pauseQueue}
                  onResume={resumeQueue}
                  onRetryFailed={retryAllFailed}
                  onCancel={() => {
                    cancelQueue();
                    clearQueue();
                  }}
                />
              </div>
            )}
            
            {/* Generation Summary - shows after generation completes */}
            {showGenerationSummary && !isLoading && !isQueueProcessing && (
              <GenerationSummary
                progress={generationProgress}
                onDismiss={() => setShowGenerationSummary(false)}
              />
            )}

            <AssetGrid
              assets={generatedAssets}
              eventName={eventDetails.name}
              folders={folders}
              onView={handleViewAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onDeleteMultiple={handleDeleteMultiple}
              onToggleFavorite={handleToggleFavorite}
              onRegenerate={handleOpenRegenerateModal}
              onDuplicate={handleDuplicateAsset}
              onMoveToFolder={(assetId, folderId) => {
                pushSnapshot();
                setGeneratedAssets(prev => prev.map(a =>
                  a.id === assetId ? { ...a, folderId } : a
                ));
                showToast("Asset moved", "success");
              }}
              onCreateFolder={(name) => {
                pushSnapshot();
                setFolders(prev => [...prev, { id: `folder-${Date.now()}`, name }]);
                showToast(`Folder "${name}" created`, "success");
              }}
            />
          </main>
        </>
      )}

      {/* Editor Modals */}
      {getEditorModal()}

      {/* View Asset Modal with Zoom/Pan */}
      {viewingAsset && (
        <AssetPreviewModal
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
          onEdit={(asset) => {
            setViewingAsset(null);
            setEditingAsset(asset);
          }}
          onDownload={(asset) => {
            setViewingAsset(null);
            setDownloadingAsset(asset);
          }}
        />
      )}

      {/* Download Modal */}
      {downloadingAsset && (
        <AssetDownloadModal
          asset={downloadingAsset}
          eventName={eventDetails.name}
          onClose={() => setDownloadingAsset(null)}
        />
      )}

      {/* QR Code Generator Modal */}
      <QRCodeGeneratorModal
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
        onGenerate={handleQRCodeGenerated}
        eventDetails={eventDetails}
        colorPalette={colorPalette}
        logoDataUrl={logos[0] ? logos[0].url : undefined}
      />

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={() => {
          showToast('Welcome! You can now save projects to the cloud.', 'success');
        }}
      />

      {/* Video Teaser Modal */}
      <VideoTeaserModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        eventName={eventDetails.name}
        eventDescription={eventDetails.description}
        onVideoGenerated={handleVideoGenerated}
      />

      {/* AI Image Edit Modal */}
      {aiEditingAsset && typeof aiEditingAsset.content === 'string' && (
        <AIImageEditModal
          open={showAIImageEdit}
          onOpenChange={(open) => {
            setShowAIImageEdit(open);
            if (!open) setAiEditingAsset(null);
          }}
          imageUrl={aiEditingAsset.content}
          eventName={eventDetails.name}
          onImageEdited={handleAIImageEdited}
        />
      )}

      {/* Event Dashboard */}
      {showEventDashboard && (
        <EventDashboard
          eventDetails={eventDetails}
          onClose={() => setShowEventDashboard(false)}
        />
      )}

      {/* Advanced Export Modal */}
      <AdvancedExportModal
        open={showAdvancedExport}
        onOpenChange={setShowAdvancedExport}
        assets={generatedAssets}
        eventName={eventDetails.name}
        onExport={handleAdvancedExport}
      />

      {/* Batch Print Export Modal */}
      <BatchPrintExportModal
        isOpen={showBatchPrintExport}
        onClose={() => setShowBatchPrintExport(false)}
        assets={generatedAssets}
        eventDetails={eventDetails}
        colorPalette={colorPalette.map(c => c.hex)}
      />

      {/* Venue Preview Generator */}
      <VenuePreviewGenerator
        isOpen={showVenuePreview}
        onClose={() => setShowVenuePreview(false)}
        venueVideoAnalysis={venueVideoAnalysis}
        eventDetails={eventDetails}
        colorPalette={colorPalette}
        styleDescription={styleDescription}
        generatedAssets={generatedAssets}
      />

      {/* Regenerate With Engine Modal (only for logged-in users) */}
      {regeneratingAsset && user && (
        <RegenerateWithEngineModal
          open={!!regeneratingAsset}
          onOpenChange={(open) => !open && setRegeneratingAsset(null)}
          asset={regeneratingAsset}
          userId={user.id}
          onRegenerate={handleRegenerateAsset}
        />
      )}

      {toastState && <Toast message={toastState.message} type={toastState.type} onClose={() => setToastState(null)} />}
    </div>
  );
};

export default Index;
