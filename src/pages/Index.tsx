import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AssetType } from '../types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset } from '../types';
import LogoUploader from '../components/LogoUploader';
import AppHeader from '../components/AppHeader';
import GenerationLoader from '../components/GenerationLoader';
import AssetCard from '../components/AssetCard';
import FolderTabs from '../components/FolderTabs';
import Toast from '../components/Toast';
import { useProjectHistory } from '../hooks/useProjectHistory';
import { useProjectPersistence } from '../hooks/useProjectPersistence';
import { useAIOrchestrator } from '../hooks/useAIOrchestrator';
import { fileToBase64 } from '../utils';

const assetGenerators = [
  { type: AssetType.Palette, title: 'Color Palette' },
  { type: AssetType.Slogans, title: 'Event Slogans' },
  { type: AssetType.SocialPost, title: 'Social Media Post' },
  { type: AssetType.NameTag, title: 'Name Tag' },
  { type: AssetType.Banner, title: 'Event Banner' },
  { type: AssetType.EventSignage, title: 'Event Signage' },
  { type: AssetType.EmailHeader, title: 'Email Header' },
  { type: AssetType.Tshirt, title: 'T-shirt' },
  { type: AssetType.Lanyard, title: 'Lanyard' },
  { type: AssetType.WifiSign, title: 'Wi-Fi Sign' },
  { type: AssetType.MarketingCopy, title: 'Marketing Copy' },
  { type: AssetType.RunOfShow, title: 'Run of Show' },
];

const ensureProtocol = (url: string) => url && !url.match(/^[a-zA-Z]+:\/\//) ? `https://${url}` : url;

const Index: React.FC = () => {
  const [view, setView] = useState<'setup' | 'dashboard'>('setup');
  const [step, setStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails>({ name: '', description: '', date: '', location: '', website: '', email: '', incorporateLocationStyle: false });
  const [logos, setLogos] = useState<LogoAsset[]>([]);
  const [styleImage, setStyleImage] = useState<{ file: File; url: string } | null>(null);
  const [masterPatternImage, setMasterPatternImage] = useState<File | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<Set<AssetType>>(new Set());
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [activeView, setActiveView] = useState('all');
  const [styleDescription, setStyleDescription] = useState('');
  const [colorPalette, setColorPalette] = useState<ColorInfo[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      setView('dashboard');
    }
  });

  const { generateAssets, isLoading, setIsLoading, generationProgress } = useAIOrchestrator({
    eventDetails, logos, styleImage, masterPatternImage, colorPalette, setColorPalette, generatedAssets, setGeneratedAssets, ensureProtocol
  });

  const handleGenerate = async () => {
    pushSnapshot();
    setView('dashboard');
    
    const newAssets: GeneratedAsset[] = [];
    selectedAssets.forEach(type => {
      const gen = assetGenerators.find(g => g.type === type);
      newAssets.push({ id: uuidv4(), type, title: gen?.title || 'Asset', content: '', isLoading: true });
    });

    // Add logos as assets
    if (logos.length > 0) {
      for (const logo of logos) {
        const b64 = await fileToBase64(logo.file);
        newAssets.unshift({ id: uuidv4(), type: AssetType.Logo, title: logo.name, content: `data:${b64.type};base64,${b64.data}`, isLoading: false });
      }
    }

    setGeneratedAssets(newAssets);
    await generateAssets(newAssets.filter(a => a.isLoading), styleDescription);
  };

  const handleDeleteAsset = (id: string) => {
    pushSnapshot();
    setGeneratedAssets(prev => prev.filter(a => a.id !== id));
    showToast("Deleted (Undo available)", "success");
  };

  const filteredAssets = useMemo(() => {
    if (activeView === 'favorites') return generatedAssets.filter(a => a.isFavorite);
    if (activeView !== 'all') return generatedAssets.filter(a => a.folderId === activeView);
    return generatedAssets;
  }, [generatedAssets, activeView]);

  return (
    <div className="min-h-screen text-foreground font-sans relative">
      <div className="animated-background" />
      <div className="relative z-10">
        <AppHeader
          onNewProject={() => { 
            if (confirm("Start new project? Any unsaved changes will be lost.")) { 
              pushSnapshot(); 
              setView('setup'); 
              setStep(1); 
              setGeneratedAssets([]); 
              setLogos([]); 
              setEventDetails({ name: '', description: '', date: '', location: '', website: '', email: '', incorporateLocationStyle: false });
            } 
          }}
          onLoadProject={handleLoadProject}
          onSaveProject={handleSaveProject}
          isSaveDisabled={view === 'setup'}
          isExporting={isExporting}
          showDashboardControls={view === 'dashboard'}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <main className="pt-24 pb-16">
          {(isLoading || isLoadingProject) && (
            <GenerationLoader 
              current={generationProgress.current} 
              total={generationProgress.total} 
              assets={generatedAssets} 
            />
          )}
          
          {view === 'setup' && (
            <LogoUploader
              eventDetails={eventDetails}
              setEventDetails={setEventDetails}
              logos={logos}
              setLogos={setLogos}
              styleImage={styleImage}
              setStyleImage={setStyleImage}
              selectedAssets={selectedAssets}
              setSelectedAssets={setSelectedAssets}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              assetGenerators={assetGenerators}
              step={step}
              setStep={setStep}
              onOpenLogoGenerator={() => showToast("Logo generator coming soon!", "success")}
              onOpenQRCodeGenerator={() => showToast("QR code generator coming soon!", "success")}
              onGenerateVariations={() => {}}
              setMasterPatternImage={setMasterPatternImage}
            />
          )}
          
          {view === 'dashboard' && !isLoading && (
            <div className="container mx-auto px-4 animate-fade-in">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{eventDetails.name || 'Your Event'}</h1>
                <p className="text-muted-foreground">Design Kit Dashboard</p>
              </div>
              
              <FolderTabs
                folders={folders}
                activeView={activeView}
                onSelectView={setActiveView}
                onCreateFolder={() => { 
                  const n = prompt("Enter folder name"); 
                  if (n?.trim()) setFolders(p => [...p, { id: uuidv4(), name: n.trim() }]); 
                }}
              />
              
              {filteredAssets.length === 0 ? (
                <div className="text-center py-24 bg-card/30 rounded-2xl border border-border">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mb-6">No assets in this view</p>
                  <button onClick={() => setView('setup')} className="btn-primary">
                    Create Assets
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {filteredAssets.map(a => (
                    <AssetCard
                      key={a.id}
                      asset={a}
                      onView={() => {}}
                      onEdit={() => {}}
                      onDelete={handleDeleteAsset}
                      onGeneratePhotorealisticShot={() => {}}
                      onToggleFavorite={(asset) => {
                        pushSnapshot();
                        setGeneratedAssets(p => p.map(x => x.id === asset.id ? { ...x, isFavorite: !x.isFavorite } : x));
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default Index;
