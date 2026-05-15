// Active Brand Indicator - Shows the currently active brand with quick actions
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown, Check, PaintBucket, RotateCcw, CheckCircle2, Circle, Settings2, X, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BrandHubImportModal } from './BrandHubImportModal';
import { BrandEventSelector } from './BrandEventSelector';
import { BrandHubProductSelector } from './BrandHubProductSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BrandColors {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  is_default: boolean;
  brandhub_share_token?: string | null;
  styles?: BrandColors;
}

interface ActiveBrandIndicatorProps {
  activeBrand: Brand | null;
  brands: Brand[];
  onSelectBrand: (brand: Brand) => void;
  onApplyTheme?: () => void;
  onResetTheme?: () => void;
  isThemeApplied?: boolean;
  savedBrandId?: string | null;
  projectBrandId?: string | null;
  variant?: 'compact' | 'full';
  className?: string;
  onBrandsRefresh?: () => void;
}

export const ActiveBrandIndicator: React.FC<ActiveBrandIndicatorProps> = ({
  activeBrand,
  brands,
  onSelectBrand,
  onApplyTheme,
  onResetTheme,
  isThemeApplied = false,
  savedBrandId,
  projectBrandId,
  variant = 'compact',
  className,
  onBrandsRefresh
}) => {
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showBrandHubImport, setShowBrandHubImport] = useState(false);

  if (!activeBrand) return null;

  const isSavedBrand = savedBrandId === activeBrand.id;
  const isProjectBrand = projectBrandId === activeBrand.id;

  const brandColors = activeBrand.styles 
    ? [
        activeBrand.styles.primary_color,
        activeBrand.styles.secondary_color,
        activeBrand.styles.accent_color
      ].filter(Boolean)
    : [];

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all",
              "hover:bg-muted/50 border border-transparent hover:border-border/50",
              isThemeApplied && "bg-primary/5 border-primary/20",
              className
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
          {/* Brand Logo/Icon */}
          {activeBrand.logo_url ? (
            <img 
              src={activeBrand.logo_url} 
              alt={activeBrand.name}
              className="w-6 h-6 rounded object-cover"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ 
                background: activeBrand.styles?.primary_color 
                  ? `linear-gradient(135deg, ${activeBrand.styles.primary_color}, ${activeBrand.styles.accent_color || activeBrand.styles.primary_color})`
                  : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
              }}
            >
              {activeBrand.name.charAt(0)}
            </div>
          )}

          {/* Brand Name (full variant only) */}
          {variant === 'full' && (
            <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
              {activeBrand.name}
            </span>
          )}

          {/* Color Pills */}
          {brandColors.length > 0 && (
            <div className="flex gap-0.5">
              {brandColors.slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

            {/* Theme Applied Indicator */}
            {isThemeApplied && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "flex items-center justify-center",
                      isProjectBrand ? "text-blue-500" : isSavedBrand ? "text-emerald-500" : "text-amber-500"
                    )}
                  >
                    {isProjectBrand ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isSavedBrand ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isProjectBrand 
                    ? 'Project brand' 
                    : isSavedBrand 
                      ? 'Theme saved to profile' 
                      : 'Theme applied (not saved)'}
                </TooltipContent>
              </Tooltip>
            )}

            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </motion.button>
        </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Current Brand Header */}
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            {activeBrand.logo_url ? (
              <img 
                src={activeBrand.logo_url} 
                alt={activeBrand.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                style={{ 
                  background: activeBrand.styles?.primary_color 
                    ? `linear-gradient(135deg, ${activeBrand.styles.primary_color}, ${activeBrand.styles.accent_color || activeBrand.styles.primary_color})`
                    : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                }}
              >
                {activeBrand.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{activeBrand.name}</p>
              <p className="text-xs text-muted-foreground">Active Brand</p>
            </div>
          </div>

            {/* Saved/Project Status Badge */}
            {(isSavedBrand || isProjectBrand) && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-md border",
                isProjectBrand 
                  ? "bg-blue-500/10 border-blue-500/20" 
                  : "bg-emerald-500/10 border-emerald-500/20"
              )}>
                <CheckCircle2 className={cn(
                  "w-3.5 h-3.5",
                  isProjectBrand ? "text-blue-500" : "text-emerald-500"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isProjectBrand 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {isProjectBrand ? 'Project brand' : 'Saved to profile'}
                </span>
              </div>
            )}

            {/* Brand Colors Preview */}
            {brandColors.length > 0 && (
              <div className="flex gap-1 mt-2">
                {brandColors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-4 rounded first:rounded-l-lg last:rounded-r-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

        {/* Event + Product selectors for active brand */}
        <div className="px-3 py-1.5 border-b border-border flex items-center gap-2 flex-wrap">
          <BrandEventSelector activeBrandId={activeBrand.id} />
          <BrandHubProductSelector
            parentBrandShareToken={activeBrand.brandhub_share_token || null}
          />
        </div>


        {(onApplyTheme || onResetTheme) && (
          <>
            <div className="p-1">
              {onApplyTheme && (
                <DropdownMenuItem onClick={onApplyTheme} className="gap-2">
                  <PaintBucket className="w-4 h-4 text-primary" />
                  <span>Apply Brand Theme</span>
                </DropdownMenuItem>
              )}
              {onResetTheme && isThemeApplied && (
                <DropdownMenuItem onClick={onResetTheme} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset to Default Theme</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowThemeSettings(true)} className="gap-2">
                <Settings2 className="w-4 h-4" />
                <span>View Theme Settings</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

          {/* Brand Selection */}
          {brands.length > 1 && (
            <div className="p-1">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                Switch Brand
              </p>
              {brands.map((brand) => {
                const isSaved = savedBrandId === brand.id;
                return (
                  <DropdownMenuItem
                    key={brand.id}
                    onClick={() => onSelectBrand(brand)}
                    className="gap-2"
                  >
                    {brand.logo_url ? (
                      <img 
                        src={brand.logo_url} 
                        alt={brand.name}
                        className="w-5 h-5 rounded object-cover"
                      />
                    ) : (
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ 
                          background: brand.styles?.primary_color 
                            ? `linear-gradient(135deg, ${brand.styles.primary_color}, ${brand.styles.accent_color || brand.styles.primary_color})`
                            : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                        }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    <span className="flex-1 truncate">{brand.name}</span>
                    
                    {/* Saved/Project indicator */}
                    {isSaved && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          Saved theme
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {brand.id === projectBrandId && !isSaved && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          Project brand
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {brand.is_default && !isSaved && brand.id !== projectBrandId && (
                      <span className="text-[10px] text-muted-foreground">Default</span>
                    )}
                    {brand.id === activeBrand.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}

          {/* Import from BrandHub */}
          <DropdownMenuSeparator />
          <div className="p-1">
            <DropdownMenuItem onClick={() => setShowBrandHubImport(true)} className="gap-2">
              <Link2 className="w-4 h-4 text-violet-500" />
              <span>Import from BrandHub</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* BrandHub Import Modal */}
      <BrandHubImportModal
        isOpen={showBrandHubImport}
        onClose={() => setShowBrandHubImport(false)}
        onBrandImported={() => onBrandsRefresh?.()}
      />

      {/* Theme Settings Modal */}
      <Dialog open={showThemeSettings} onOpenChange={setShowThemeSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Brand Theme Settings
            </DialogTitle>
            <DialogDescription>
              Current theme configuration for {activeBrand.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Brand Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {activeBrand.logo_url ? (
                <img 
                  src={activeBrand.logo_url} 
                  alt={activeBrand.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                  style={{ 
                    background: activeBrand.styles?.primary_color 
                      ? `linear-gradient(135deg, ${activeBrand.styles.primary_color}, ${activeBrand.styles.accent_color || activeBrand.styles.primary_color})`
                      : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                  }}
                >
                  {activeBrand.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{activeBrand.name}</p>
                <p className="text-sm text-muted-foreground">
                  {isProjectBrand ? 'Project brand' : isSavedBrand ? 'Saved to profile' : 'Active brand'}
                </p>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Color Palette</p>
              <div className="grid grid-cols-3 gap-2">
                {activeBrand.styles?.primary_color && (
                  <div className="space-y-1">
                    <div 
                      className="h-12 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: activeBrand.styles.primary_color }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Primary</p>
                    <p className="text-xs text-center font-mono">{activeBrand.styles.primary_color}</p>
                  </div>
                )}
                {activeBrand.styles?.secondary_color && (
                  <div className="space-y-1">
                    <div 
                      className="h-12 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: activeBrand.styles.secondary_color }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Secondary</p>
                    <p className="text-xs text-center font-mono">{activeBrand.styles.secondary_color}</p>
                  </div>
                )}
                {activeBrand.styles?.accent_color && (
                  <div className="space-y-1">
                    <div 
                      className="h-12 rounded-lg border border-border shadow-sm"
                      style={{ backgroundColor: activeBrand.styles.accent_color }}
                    />
                    <p className="text-xs text-center text-muted-foreground">Accent</p>
                    <p className="text-xs text-center font-mono">{activeBrand.styles.accent_color}</p>
                  </div>
                )}
              </div>
              {!activeBrand.styles?.primary_color && !activeBrand.styles?.secondary_color && !activeBrand.styles?.accent_color && (
                <p className="text-sm text-muted-foreground italic">No custom colors defined</p>
              )}
            </div>

            {/* Theme Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Theme Status</p>
              <div className="flex flex-wrap gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  isThemeApplied 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {isThemeApplied ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  {isThemeApplied ? 'Applied to UI' : 'Not applied'}
                </div>
                {isSavedBrand && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved to profile
                  </div>
                )}
                {isProjectBrand && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Project brand
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {onApplyTheme && (
                <Button 
                  onClick={() => {
                    onApplyTheme();
                    setShowThemeSettings(false);
                  }}
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <PaintBucket className="w-4 h-4" />
                  Apply Theme
                </Button>
              )}
              {onResetTheme && isThemeApplied && (
                <Button 
                  onClick={() => {
                    onResetTheme();
                    setShowThemeSettings(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
