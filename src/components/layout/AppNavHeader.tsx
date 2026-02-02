import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, Home, Settings, ChevronDown, LogIn, LogOut,
  User, Shield, Palette, FolderOpen, Bell, HelpCircle,
  LayoutGrid, Layers, Save, Upload, Download, Cloud, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useActiveBrand } from '@/hooks/useActiveBrand';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { STUDIO_DEFINITIONS, StudioType } from '@/types/studio.types';
import { toast } from 'sonner';
import { ActiveBrandIndicator } from '@/components/brand/ActiveBrandIndicator';
import { BrandColorBar } from '@/components/brand/BrandColorBar';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface AppNavHeaderProps {
  title?: string;
  subtitle?: string;
  showStudioNav?: boolean;
  currentStudioId?: StudioType;
  onGetStarted?: () => void;
  onSignIn?: () => void;
  actions?: React.ReactNode;
  transparent?: boolean;
  // Project controls
  onSaveProject?: () => void;
  onLoadProject?: (file: File) => void;
  onSaveToCloud?: () => void;
  isSaving?: boolean;
  isLoadingProject?: boolean;
  isSavingToCloud?: boolean;
  showProjectControls?: boolean;
}

export const AppNavHeader: React.FC<AppNavHeaderProps> = ({
  title,
  subtitle,
  showStudioNav = false,
  currentStudioId,
  onGetStarted,
  onSignIn,
  actions,
  transparent = false,
  onSaveProject,
  onLoadProject,
  onSaveToCloud,
  isSaving = false,
  isLoadingProject = false,
  isSavingToCloud = false,
  showProjectControls = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const { logoType, logoUrl, logoUrlDark, logoIconUrl, logoIconUrlDark, isLoading: isLoadingSettings } = useAppSettings();
  const { activeBrand, brands, setActiveBrand, applyBrandToUI, resetUITheme, isThemeApplied, savedBrandId, projectBrandId } = useActiveBrand();
  const { resolvedTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStudiosMenu, setShowStudiosMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine which logo to use based on theme
  const isDark = resolvedTheme === 'dark';
  const effectiveLogoUrl = isDark ? (logoUrlDark || logoUrl) : logoUrl;
  const effectiveIconUrl = isDark ? (logoIconUrlDark || logoIconUrl) : logoIconUrl;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // Quick access studios for nav
  const quickStudios = STUDIO_DEFINITIONS.slice(0, 6);

  const isActivePath = (path: string) => location.pathname === path;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.zip')) {
        toast.error('Please select a valid project file (.zip)');
        return;
      }
      onLoadProject?.(file);
    }
    e.target.value = '';
  };

  const handleOpenProject = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      transparent 
        ? "bg-transparent" 
        : "bg-background/80 backdrop-blur-xl border-b border-border/50"
    )}>
      {/* Brand-aware gradient line */}
      <BrandColorBar 
        primaryColor={activeBrand?.styles?.primary_color}
        secondaryColor={activeBrand?.styles?.secondary_color}
        accentColor={activeBrand?.styles?.accent_color}
        position="top"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Custom Logo - only show after settings have loaded */}
              {!isLoadingSettings && logoType === 'custom' && effectiveLogoUrl ? (
                <img 
                  src={effectiveLogoUrl} 
                  alt="Logo" 
                  className="max-h-8 max-w-[140px] w-auto h-auto object-contain" 
                />
              ) : !isLoadingSettings && logoType === 'icon-only' && effectiveIconUrl ? (
                <img 
                  src={effectiveIconUrl} 
                  alt="Logo" 
                  className="max-h-8 max-w-[100px] w-auto h-auto object-contain" 
                />
              ) : (
                /* Default EventKIT Logo - shown while loading or when no custom logo */
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-lg font-bold text-foreground">EventKIT</span>
                    {subtitle && (
                      <span className="ml-2 text-sm text-muted-foreground">{subtitle}</span>
                    )}
                  </div>
                </>
              )}
            </motion.button>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavButton
                onClick={() => navigate('/')}
                isActive={isActivePath('/')}
              >
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </NavButton>

              {/* Studios Dropdown */}
              <div className="relative">
                <NavButton
                  onClick={() => setShowStudiosMenu(!showStudiosMenu)}
                  isActive={location.pathname.startsWith('/studio')}
                >
                  <LayoutGrid className="w-4 h-4 mr-1.5" />
                  Studios
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 ml-1 transition-transform",
                    showStudiosMenu && "rotate-180"
                  )} />
                </NavButton>

                <AnimatePresence>
                  {showStudiosMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowStudiosMenu(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-72 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
                        
                        <div className="p-2">
                          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Creation Studios
                          </p>
                          
                          <div className="grid grid-cols-2 gap-1">
                            {quickStudios.map((studio) => (
                              <button
                                key={studio.id}
                                onClick={() => {
                                  navigate(studio.route);
                                  setShowStudiosMenu(false);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all",
                                  currentStudioId === studio.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-muted"
                                )}
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                                  studio.gradient
                                )}>
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-medium truncate">{studio.shortName}</span>
                              </button>
                            ))}
                          </div>

                          <div className="mt-2 pt-2 border-t border-border">
                            <button
                              onClick={() => {
                                navigate('/');
                                setShowStudiosMenu(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                              <Layers className="w-4 h-4" />
                              View All 12 Studios
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated && (
                <NavButton
                  onClick={() => navigate('/admin')}
                  isActive={isActivePath('/admin')}
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Admin
                </NavButton>
              )}
            </nav>
          </div>

          {/* Right: Actions + User */}
          <div className="flex items-center gap-2">
            {/* Hidden file input for project loading */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Project Controls */}
            {showProjectControls && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Project</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleOpenProject} disabled={isLoadingProject}>
                    {isLoadingProject ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Open Project (.zip)
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={onSaveProject} disabled={isSaving || !onSaveProject}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Save as ZIP
                  </DropdownMenuItem>
                  
                  {isAuthenticated && onSaveToCloud && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onSaveToCloud} disabled={isSavingToCloud}>
                        {isSavingToCloud ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Cloud className="h-4 w-4 mr-2" />
                        )}
                        Save to Cloud
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {actions}

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
                variant="compact"
              />
            )}
            
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {initials}
                    </div>
                  )}
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform hidden sm:block",
                    showUserMenu && "rotate-180"
                  )} />
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowUserMenu(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
                        
                        {/* User Header */}
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-xl object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                                {initials}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{displayName}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <UserMenuItem 
                            icon={FolderOpen} 
                            label="My Projects" 
                            onClick={() => { navigate('/'); setShowUserMenu(false); }}
                          />
                          <UserMenuItem 
                            icon={Palette} 
                            label="Brands" 
                            onClick={() => { navigate('/admin?tab=brands'); setShowUserMenu(false); }}
                          />
                          <UserMenuItem 
                            icon={Shield} 
                            label="Admin Panel" 
                            onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                          />
                          <UserMenuItem 
                            icon={Settings} 
                            label="Settings" 
                            onClick={() => setShowUserMenu(false)}
                          />
                          
                          <div className="h-px bg-border my-2" />
                          
                          <button
                            onClick={() => { signOut(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onGetStarted && (
                  <Button onClick={onGetStarted} size="sm" className="hidden sm:flex">
                    Get Started
                  </Button>
                )}
                <Button 
                  onClick={onSignIn || onGetStarted || (() => navigate('/'))} 
                  size="sm" 
                  variant="outline"
                >
                  <LogIn className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Nav button component
const NavButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}> = ({ children, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    {children}
  </button>
);

// User menu item component
const UserMenuItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  badge?: string;
}> = ({ icon: Icon, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
  >
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
        {badge}
      </span>
    )}
  </button>
);

export default AppNavHeader;
