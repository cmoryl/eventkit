import React, { useState } from 'react';
import { AssetType } from '../../types';
import { AssetConfig } from '../../config/assetConfig';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: AssetConfig;
  isSelected: boolean;
  onToggle: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className={className || "w-4 h-4"} /> : null;
  };

  // Get gradient based on category
  const getCategoryGradient = () => {
    switch (asset.category) {
      case 'branding': return 'from-violet-500 to-purple-600';
      case 'print': return 'from-orange-500 to-red-500';
      case 'merchandise': return 'from-pink-500 to-rose-500';
      case 'digital': return 'from-cyan-500 to-blue-500';
      case 'experience': return 'from-emerald-500 to-teal-500';
      case 'utilities': return 'from-amber-500 to-yellow-500';
      default: return 'from-primary to-accent';
    }
  };

  const getTypeColor = () => {
    if (asset.printSpec) return 'bg-gradient-to-r from-orange-500 to-amber-500';
    if (asset.isTextBased) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (asset.isVideo) return 'bg-gradient-to-r from-purple-500 to-violet-500';
    return 'bg-gradient-to-r from-cyan-500 to-blue-500';
  };

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative w-full p-3 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden",
        isSelected
          ? "border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/10 scale-[1.02]"
          : "border-border/50 hover:border-primary/50 hover:bg-gradient-to-br hover:from-secondary/80 hover:to-secondary/30 hover:shadow-md"
      )}
    >
      {/* Animated background glow on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none",
        isHovered && !isSelected && "opacity-100"
      )}>
        <div className={cn(
          "absolute -inset-1 bg-gradient-to-r blur-xl opacity-20",
          getCategoryGradient()
        )} />
      </div>

      {/* Selection ring animation */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute inset-[-2px] bg-gradient-to-r animate-[spin_3s_linear_infinite] opacity-20",
            getCategoryGradient()
          )} />
          <div className="absolute inset-[1px] bg-background rounded-[10px]" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex items-center gap-3">
        {/* Icon with gradient background */}
        <div className={cn(
          "relative flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
          isSelected
            ? `bg-gradient-to-br ${getCategoryGradient()} text-white shadow-lg`
            : "bg-gradient-to-br from-secondary to-muted text-muted-foreground group-hover:from-secondary group-hover:to-secondary/50"
        )}>
          {getIcon(asset.icon, "w-5 h-5")}
          
          {/* Pulse effect when selected */}
          {isSelected && (
            <div className={cn(
              "absolute inset-0 rounded-lg bg-gradient-to-br animate-ping opacity-30",
              getCategoryGradient()
            )} style={{ animationDuration: '2s' }} />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-sm truncate transition-colors",
            isSelected ? "text-primary" : "text-foreground"
          )}>
            {asset.title}
          </h4>
          
          {/* Type indicator pill */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white",
              getTypeColor()
            )}>
              {asset.printSpec && (
                <>
                  <LucideIcons.Printer className="w-2.5 h-2.5" />
                  {asset.printSpec.widthInches}"×{asset.printSpec.heightInches}"
                </>
              )}
              {asset.pixelWidth && asset.pixelHeight && !asset.printSpec && (
                <>
                  <LucideIcons.Monitor className="w-2.5 h-2.5" />
                  {asset.pixelWidth}×{asset.pixelHeight}
                </>
              )}
              {asset.isTextBased && (
                <>
                  <LucideIcons.FileText className="w-2.5 h-2.5" />
                  Text
                </>
              )}
              {asset.isVideo && (
                <>
                  <LucideIcons.Video className="w-2.5 h-2.5" />
                  Video
                </>
              )}
            </span>
          </div>
        </div>

        {/* Checkbox with animation */}
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          isSelected
            ? "border-primary bg-primary scale-110"
            : "border-muted-foreground/30 group-hover:border-primary/50 group-hover:scale-105"
        )}>
          <LucideIcons.Check className={cn(
            "w-3.5 h-3.5 transition-all duration-200",
            isSelected
              ? "text-primary-foreground scale-100 opacity-100"
              : "scale-50 opacity-0"
          )} />
        </div>
      </div>

      {/* Preview tooltip on hover */}
      {isHovered && (
        <div className="absolute left-0 right-0 -bottom-1 translate-y-full z-50 pointer-events-none animate-fade-in">
          <div className="mx-2 mt-2 p-2.5 rounded-lg bg-popover border border-border shadow-xl">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
            {asset.printSpec && (
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <LucideIcons.Maximize2 className="w-2.5 h-2.5" />
                  {asset.printSpec.dpi} DPI
                </span>
                <span className="flex items-center gap-1">
                  <LucideIcons.Droplets className="w-2.5 h-2.5" />
                  {asset.printSpec.bleedInches}" bleed
                </span>
                <span className="flex items-center gap-1">
                  <LucideIcons.Palette className="w-2.5 h-2.5" />
                  {asset.printSpec.colorMode}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
};

export default AssetCard;
