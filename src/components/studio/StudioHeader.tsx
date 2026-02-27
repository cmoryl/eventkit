import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Cloud,
  LayoutDashboard,
  Settings2,
  Package,
  Sparkles,
  ChevronDown,
  Cpu,
  Brain,
  Home,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActiveBrand } from '@/hooks/useActiveBrand';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ThemeToggle';
import { RenderEngineSettings } from '../RenderEngineSettings';
import { ApiSettingsModal } from '../settings/ApiSettingsModal';
import { useApiSettings } from '@/hooks/useApiSettings';
import { ActiveBrandIndicator } from '@/components/brand/ActiveBrandIndicator';
import { BrandColorBar } from '@/components/brand/BrandColorBar';

interface StudioHeaderProps {
  eventName: string;
  assetCount: number;
  onBackToSetup: () => void;
  onGoHome?: () => void;
  onDownloadAll: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onExportBrandGuide: () => void;
  onOpenQRGenerator: () => void;
  onOpenVideoGenerator?: () => void;
  onOpenVenuePreview?: () => void;
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
  onOpenBatchPrintExport?: () => void;
  onOpenRenderEngineSettings?: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
  eventName,
  assetCount,
  onBackToSetup,
  onGoHome,
  onDownloadAll,
  onSave,
  onLoad,
  onExportBrandGuide,
  onOpenQRGenerator,
  onOpenVideoGenerator,
  onOpenVenuePreview,
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
  onOpenBatchPrintExport,
  onOpenRenderEngineSettings,
}) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { activeBrand, brands, setActiveBrand, applyBrandToUI, resetUITheme, isThemeApplied, savedBrandId, projectBrandId, refreshBrands } = useActiveBrand();
  const { configuredKeysCount } = useApiSettings();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRenderSettings, setShowRenderSettings] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
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
    <>
    <motion.header 
      className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-xl"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Brand-aware gradient accent line */}
      <BrandColorBar 
        primaryColor={activeBrand?.styles?.primary_color}
        secondaryColor={activeBrand?.styles?.secondary_color}
        accentColor={activeBrand?.styles?.accent_color}
        position="top"
      />
      
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Home + Back + Event Info */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            {onGoHome && (
              <motion.button
                onClick={onGoHome}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Home"
              >
                <Home className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              onClick={onBackToSetup}
              className="group flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Setup</span>
            </motion.button>
            
            <div className="h-8 w-px bg-border/60 hidden sm:block" />
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate max-w-[150px] sm:max-w-[250px]">
                  {eventName || 'Your Event'}
                </h1>
                <motion.div 
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {assetCount} assets
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hidden file input for loading projects */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* API Settings */}
            <motion.button
              onClick={() => setShowApiSettings(true)}
              className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="API Settings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
              {configuredKeysCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-emerald-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                  {configuredKeysCount}
                </span>
              )}
            </motion.button>

            {/* Active Brand Indicator */}
            {isAuthenticated && activeBrand && (
              <ActiveBrandIndicator
                activeBrand={activeBrand}
                brands={brands}
                onSelectBrand={setActiveBrand}
                onApplyTheme={() => applyBrandToUI()}
                onResetTheme={resetUITheme}
                isThemeApplied={isThemeApplied}
                savedBrandId={savedBrandId}
                projectBrandId={projectBrandId}
                variant="full"
                onBrandsRefresh={refreshBrands}
              />
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Undo/Redo */}
            {(onUndo || onRedo) && (
              <div className="hidden sm:flex items-center gap-0.5 mr-1">
                <motion.button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                  whileHover={canUndo ? { scale: 1.05 } : undefined}
                  whileTap={canUndo ? { scale: 0.95 } : undefined}
                >
                  <Undo2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Y)"
                  whileHover={canRedo ? { scale: 1.05 } : undefined}
                  whileTap={canRedo ? { scale: 0.95 } : undefined}
                >
                  <Redo2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Quick Actions */}
            <motion.button
              onClick={onAddMoreAssets}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Add</span>
            </motion.button>

            <motion.button
              onClick={onOpenQRGenerator}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden xl:inline">QR</span>
            </motion.button>

            {onOpenVideoGenerator && (
              <motion.button
                onClick={onOpenVideoGenerator}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Video className="w-4 h-4" />
                <span className="hidden xl:inline">Video</span>
              </motion.button>
            )}

            {onOpenVenuePreview && (
              <motion.button
                onClick={onOpenVenuePreview}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Video className="w-4 h-4" />
                <span className="hidden xl:inline">Venue Preview</span>
              </motion.button>
            )}

            {onOpenDashboard && (
              <motion.button
                onClick={onOpenDashboard}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LayoutDashboard className="w-4 h-4" />
              </motion.button>
            )}

            {/* More Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  showMoreMenu 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50 hover:bg-secondary text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontal className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    <motion.div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMoreMenu(false)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                    <motion.div 
                      className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 py-2 overflow-hidden"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {/* Gradient accent */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
                      
                      <MenuItem
                        icon={FileText}
                        label="Export Brand Guide"
                        onClick={() => { onExportBrandGuide(); setShowMoreMenu(false); }}
                        isLoading={isGeneratingGuide}
                        gradient="from-violet-500 to-purple-500"
                      />
                      
                      <MenuItem
                        icon={QrCode}
                        label="Generate QR Code"
                        onClick={() => { onOpenQRGenerator(); setShowMoreMenu(false); }}
                        className="lg:hidden"
                        gradient="from-cyan-500 to-blue-500"
                      />
                      
                      <MenuItem
                        icon={Plus}
                        label="Add More Assets"
                        onClick={() => { onAddMoreAssets(); setShowMoreMenu(false); }}
                        className="sm:hidden"
                        gradient="from-emerald-500 to-green-500"
                      />
                      
                      {onOpenAdvancedExport && (
                        <MenuItem
                          icon={Settings2}
                          label="Advanced Export"
                          onClick={() => { onOpenAdvancedExport(); setShowMoreMenu(false); }}
                          gradient="from-orange-500 to-amber-500"
                        />
                      )}
                      
                      {onOpenBatchPrintExport && (
                        <MenuItem
                          icon={Package}
                          label="Batch Print Export"
                          onClick={() => { onOpenBatchPrintExport(); setShowMoreMenu(false); }}
                          gradient="from-pink-500 to-rose-500"
                        />
                      )}
                      
                      {onOpenDashboard && (
                        <MenuItem
                          icon={LayoutDashboard}
                          label="Event Dashboard"
                          onClick={() => { onOpenDashboard(); setShowMoreMenu(false); }}
                          className="lg:hidden"
                          gradient="from-indigo-500 to-violet-500"
                        />
                      )}
                      
                      <MenuItem
                        icon={Brain}
                        label="AI Render Engines"
                        onClick={() => { setShowRenderSettings(true); setShowMoreMenu(false); }}
                        gradient="from-emerald-500 to-teal-500"
                      />
                      
                      <div className="h-px bg-border my-2 mx-3" />
                      
                      <MenuItem
                        icon={Upload}
                        label="Load Project"
                        onClick={() => { fileInputRef.current?.click(); setShowMoreMenu(false); }}
                        isLoading={isLoadingProject}
                      />
                      
                      <MenuItem
                        icon={Save}
                        label="Save Project"
                        onClick={() => { onSave(); setShowMoreMenu(false); }}
                        isLoading={isExporting}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-6 w-px bg-border/60 hidden sm:block" />

            {/* Cloud Save */}
            {isAuthenticated && onSaveToCloud && (
              <motion.button
                onClick={onSaveToCloud}
                disabled={isSavingToCloud}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-600 hover:from-cyan-500/20 hover:to-blue-500/20 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSavingToCloud ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                <span className="hidden md:inline">Cloud</span>
              </motion.button>
            )}

            {/* Auth Button / User Area */}
            {isAuthenticated ? (
              <UserProfileDropdown user={user} onSignOut={signOut} />
            ) : onOpenAuth && (
              <motion.button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </motion.button>
            )}

            {/* Primary Download Button */}
            <motion.button
              onClick={onDownloadAll}
              disabled={assetCount === 0}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                "bg-gradient-to-r from-violet-500 via-primary to-cyan-500 text-white",
                "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              whileHover={assetCount > 0 ? { scale: 1.02, y: -1 } : undefined}
              whileTap={assetCount > 0 ? { scale: 0.98 } : undefined}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-xl overflow-hidden"
                initial={false}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              
              <Download className="w-4 h-4 relative" />
              <span className="hidden sm:inline relative">Download All</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
    
    {/* Render Engine Settings Modal */}
    <RenderEngineSettings
      open={showRenderSettings}
      onOpenChange={setShowRenderSettings}
      userId={user?.id || ''}
    />
    
    {/* API Settings Modal */}
    <ApiSettingsModal 
      isOpen={showApiSettings} 
      onClose={() => setShowApiSettings(false)} 
    />
    </>
  );
};

// User Profile Dropdown Component
interface UserProfileDropdownProps {
  user: { email?: string; id?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
  onSignOut: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  
  return (
    <div className="relative hidden sm:block">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors",
          isOpen ? "bg-secondary" : "hover:bg-secondary/80"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="relative">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white ring-2 ring-primary/20">
              {initials}
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        
        {/* Name & chevron */}
        <div className="hidden md:flex items-center gap-1">
          <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
            {displayName}
          </span>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div 
              className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
              
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-1">
                <button 
                  onClick={() => { onSignOut(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Menu Item Component
interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  gradient?: string;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, onClick, isLoading, gradient, className }) => (
  <motion.button
    onClick={onClick}
    disabled={isLoading}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50",
      className
    )}
    whileHover={{ x: 4 }}
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    ) : (
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center",
        gradient ? `bg-gradient-to-br ${gradient} text-white` : "bg-secondary text-muted-foreground"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    )}
    <span className="font-medium">{label}</span>
  </motion.button>
);

export default StudioHeader;
