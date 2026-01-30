import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  QrCode, 
  Plus, 
  MoreHorizontal,
  Loader2,
  Undo2,
  Redo2,
  Upload,
  Video,
  LogIn,
  LogOut,
  User,
  Cloud,
  CloudOff,
  LayoutDashboard,
  Settings2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface StudioHeaderProps {
  eventName: string;
  assetCount: number;
  onBackToSetup: () => void;
  onDownloadAll: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onExportBrandGuide: () => void;
  onOpenQRGenerator: () => void;
  onOpenVideoGenerator?: () => void;
  onAddMoreAssets: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isExporting?: boolean;
  isGeneratingGuide?: boolean;
  isLoadingProject?: boolean;
  onOpenAuth?: () => void;
  onSaveToCloud?: () => void;
  isSavingToCloud?: boolean;
  onOpenDashboard?: () => void;
  onOpenAdvancedExport?: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
  eventName,
  assetCount,
  onBackToSetup,
  onDownloadAll,
  onSave,
  onLoad,
  onExportBrandGuide,
  onOpenQRGenerator,
  onOpenVideoGenerator,
  onAddMoreAssets,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isExporting,
  isGeneratingGuide,
  isLoadingProject,
  onOpenAuth,
  onSaveToCloud,
  isSavingToCloud,
  onOpenDashboard,
  onOpenAdvancedExport,
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && onUndo && canUndo) {
        e.preventDefault();
        onUndo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z')) && onRedo && canRedo) {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, canUndo, canRedo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoad(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 frosted-panel border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back + Event Info */}
          <div className="flex items-center gap-5">
            <button
              onClick={onBackToSetup}
              className="btn-ghost group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
              Setup
            </button>
            <div className="h-8 w-px bg-border/60" />
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{eventName || 'Your Event'}</h1>
              <p className="text-sm text-muted-foreground">
                {assetCount} asset{assetCount !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Hidden file input for loading projects */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Undo/Redo */}
            {(onUndo || onRedo) && (
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="btn-ghost p-2 disabled:opacity-30"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="btn-ghost p-2 disabled:opacity-30"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <button
              onClick={onAddMoreAssets}
              className="btn-ghost hidden sm:flex items-center gap-2"
              title="Add more assets"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add Assets</span>
            </button>

            <button
              onClick={onOpenQRGenerator}
              className="btn-ghost hidden sm:flex items-center gap-2"
              title="Generate QR Code"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden md:inline">QR Code</span>
            </button>

            {onOpenVideoGenerator && (
              <button
                onClick={onOpenVideoGenerator}
                className="btn-ghost hidden sm:flex items-center gap-2"
                title="Generate Video Teaser"
              >
                <Video className="w-4 h-4" />
                <span className="hidden md:inline">Video</span>
              </button>
            )}

            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="btn-ghost hidden sm:flex items-center gap-2"
                title="Event Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            )}

            <div className="h-6 w-px bg-border/60 hidden sm:block" />

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="btn-ghost p-2"
                title="More options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {showMoreMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMoreMenu(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-scale-in">
                    <button
                      onClick={() => { onExportBrandGuide(); setShowMoreMenu(false); }}
                      disabled={isGeneratingGuide}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {isGeneratingGuide ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      Export Brand Style Guide
                    </button>
                    <button
                      onClick={() => { onOpenQRGenerator(); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors sm:hidden"
                    >
                      <QrCode className="w-4 h-4 text-primary" />
                      Generate QR Code
                    </button>
                    <button
                      onClick={() => { onAddMoreAssets(); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors sm:hidden"
                    >
                      <Plus className="w-4 h-4 text-primary" />
                      Add More Assets
                    </button>
                    {onOpenAdvancedExport && (
                      <button
                        onClick={() => { onOpenAdvancedExport(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <Settings2 className="w-4 h-4 text-primary" />
                        Advanced Export
                      </button>
                    )}
                    {onOpenDashboard && (
                      <button
                        onClick={() => { onOpenDashboard(); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors sm:hidden"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        Event Dashboard
                      </button>
                    )}
                    <div className="h-px bg-border my-2" />
                    <button
                      onClick={() => { fileInputRef.current?.click(); setShowMoreMenu(false); }}
                      disabled={isLoadingProject}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {isLoadingProject ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      )}
                      Load Project
                    </button>
                    <button
                      onClick={() => { onSave(); setShowMoreMenu(false); }}
                      disabled={isExporting}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-muted-foreground" />
                      Save Project
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cloud Save */}
            {isAuthenticated && onSaveToCloud && (
              <button
                onClick={onSaveToCloud}
                disabled={isSavingToCloud}
                className="btn-ghost hidden sm:flex items-center gap-2"
                title="Save to Cloud"
              >
                {isSavingToCloud ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4 text-primary" />
                )}
                <span className="hidden md:inline">Cloud</span>
              </button>
            )}

            {/* Auth Button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                  {user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="btn-ghost p-2"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="btn-ghost hidden sm:flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}

            <div className="h-6 w-px bg-border/60 hidden sm:block" />

            {/* Primary Actions */}
            <button
              onClick={onSave}
              disabled={isExporting}
              className="btn-secondary hidden sm:flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={onDownloadAll}
              disabled={assetCount === 0}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download All</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudioHeader;
