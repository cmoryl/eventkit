// Active Brand Indicator - Shows the currently active brand with quick actions
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, ChevronDown, Check, PaintBucket, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  className
}) => {
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

        {/* Theme Actions */}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
