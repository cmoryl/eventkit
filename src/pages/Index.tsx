import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AssetType } from '../types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset, QRCodeGenerationParams, PresentationData } from '../types';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import StudioHeader from '../components/studio/StudioHeader';
import AssetGrid from '../components/studio/AssetGrid';
import Toast from '../components/Toast';
import ImageEditorModal from '../components/ImageEditorModal';
import PaletteEditorModal from '../components/PaletteEditorModal';
import TextEditorModal from '../components/TextEditorModal';
import TextListEditorModal from '../components/TextListEditorModal';
import QRCodeGeneratorModal from '../components/QRCodeGeneratorModal';
import PresentationEditorModal from '../components/PresentationEditorModal';
import { useProjectHistory } from '../hooks/useProjectHistory';
import { useProjectPersistence } from '../hooks/useProjectPersistence';
import { useAIOrchestrator } from '../hooks/useAIOrchestrator';
import { fileToBase64, downloadAllAssets } from '../utils';
import { getAssetConfig } from '../config/assetConfig';
import { generateBrandStyleGuide } from '../services/brandGuideGenerator';

const ensureProtocol = (url: string) => url && !url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url;

const Index: React.FC = () => {
  const [view, setView] = useState<'onboarding' | 'studio'>('onboarding');
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal states
  const [editingAsset, setEditingAsset] = useState<GeneratedAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<GeneratedAsset | null>(null);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

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

  const handleOnboardingComplete = async (data: {
    eventDetails: EventDetails;
    logos: LogoAsset[];
    selectedAssets: Set<AssetType>;
    styleDescription: string;
    vibeImage: File | null;
    masterPattern: File | null;
  }) => {
    pushSnapshot();
    setEventDetails(data.eventDetails);
    setLogos(data.logos);
    setStyleDescription(data.styleDescription);
    setView('studio');

    // Create asset placeholders
    const newAssets: GeneratedAsset[] = [];

    // Add logos first (non-loading)
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

    // Add selected assets (loading) using asset config
    data.selectedAssets.forEach(type => {
      const config = getAssetConfig(type);
      newAssets.push({
        id: uuidv4(),
        type,
        title: config?.title || 'Asset',
        content: '',
        isLoading: true,
      });
    });

    setGeneratedAssets(newAssets);
    await generateAssets(newAssets.filter(a => a.isLoading), data.styleDescription);
  };

  const handleDeleteAsset = (id: string) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.filter(a => a.id !== id));
    showToast("Asset deleted", "success");
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

  const handleAddMoreAssets = () => {
    setView('onboarding');
  };

  const handleRegenerateAsset = async (asset: GeneratedAsset) => {
    pushSnapshot();
    // Mark asset as loading
    setGeneratedAssets(prev => prev.map(a => 
      a.id === asset.id ? { ...a, isLoading: true } : a
    ));
    
    // Regenerate
    await generateAssets([{ ...asset, isLoading: true }], styleDescription);
    showToast(`${asset.title} regenerated`, "success");
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
      
      {view === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {view === 'studio' && (
        <>
          <StudioHeader
            eventName={eventDetails.name}
            assetCount={generatedAssets.length}
            onBackToSetup={() => setView('onboarding')}
            onDownloadAll={handleDownloadAll}
            onSave={handleSaveProject}
            onLoad={handleLoadProject}
            onExportBrandGuide={handleExportBrandGuide}
            onOpenQRGenerator={() => setShowQRGenerator(true)}
            onAddMoreAssets={handleAddMoreAssets}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            isExporting={isExporting}
            isGeneratingGuide={isGeneratingGuide}
            isLoadingProject={isLoadingProject}
          />

          <main className="container mx-auto px-4 py-8 animate-fade-in">
            {isLoading && (
              <div className="mb-8 p-4 glass-card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-foreground">Generating assets...</p>
                    <p className="text-sm text-muted-foreground">
                      {generationProgress.current} of {generationProgress.total} complete
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            <AssetGrid
              assets={generatedAssets}
              eventName={eventDetails.name}
              onView={handleViewAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              onToggleFavorite={handleToggleFavorite}
              onRegenerate={handleRegenerateAsset}
            />
          </main>
        </>
      )}

      {/* Editor Modals */}
      {getEditorModal()}

      {/* View Asset Modal */}
      {viewingAsset && (
        <div
          className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setViewingAsset(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {typeof viewingAsset.content === 'string' && viewingAsset.content.startsWith('data:image') ? (
              <img src={viewingAsset.content} alt={viewingAsset.title} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            ) : (
              <div className="glass-card p-8 max-w-2xl">
                <h2 className="text-xl font-bold text-foreground mb-4">{viewingAsset.title}</h2>
                {Array.isArray(viewingAsset.content) ? (
                  <ul className="space-y-2">
                    {(viewingAsset.content as string[]).map((item, i) => (
                      <li key={i} className="text-foreground">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground whitespace-pre-wrap">{String(viewingAsset.content)}</p>
                )}
              </div>
            )}
          </div>
          <button onClick={() => setViewingAsset(null)} className="absolute top-4 right-4 btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Index;
