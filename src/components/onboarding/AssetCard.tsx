import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetConfig } from '../../config/assetConfig';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: AssetConfig;
  isSelected: boolean;
  onToggle: () => void;
  index?: number;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onToggle, index = 0 }) => {
  const getIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className={className || "w-4 h-4"} /> : null;
  };

  // Get accent color based on category
  const getCategoryColor = () => {
    switch (asset.category) {
      case 'branding': return { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30', ring: 'ring-violet-500/20' };
      case 'print': return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30', ring: 'ring-orange-500/20' };
      case 'merchandise': return { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/30', ring: 'ring-pink-500/20' };
      case 'digital': return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/30', ring: 'ring-cyan-500/20' };
      case 'experience': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', ring: 'ring-emerald-500/20' };
      case 'utilities': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', ring: 'ring-amber-500/20' };
      default: return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', ring: 'ring-primary/20' };
    }
  };

  const getTypeLabel = () => {
    if (asset.printSpec) return { icon: 'Printer', label: `${asset.printSpec.widthInches}×${asset.printSpec.heightInches}"` };
    if (asset.isTextBased) return { icon: 'FileText', label: 'Text' };
    if (asset.isVideo) return { icon: 'Video', label: 'Video' };
    if (asset.isAudio) return { icon: 'Music', label: 'Audio' };
    if (asset.pixelWidth && asset.pixelHeight) return { icon: 'Monitor', label: `${asset.pixelWidth}×${asset.pixelHeight}` };
    return { icon: 'Image', label: 'Digital' };
  };

  const colors = getCategoryColor();
  const typeInfo = getTypeLabel();

  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "group relative w-full text-left rounded-xl border transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isSelected
          ? `border-primary/50 bg-primary/5 ${colors.ring} ring-2`
          : "border-border/60 hover:border-border bg-card/50 hover:bg-card"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.015,
        duration: 0.2,
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          isSelected ? `${colors.bg} ${colors.text}` : "bg-muted text-muted-foreground group-hover:bg-secondary"
        )}>
          {getIcon(asset.icon, "w-4.5 h-4.5")}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <h4 className={cn(
            "font-medium text-sm leading-tight truncate transition-colors",
            isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
          )}>
            {asset.title}
          </h4>
          
          {/* Type badge */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase",
              isSelected 
                ? `${colors.bg} ${colors.text}` 
                : "bg-muted/80 text-muted-foreground"
            )}>
              {getIcon(typeInfo.icon, "w-2.5 h-2.5")}
              {typeInfo.label}
            </span>
          </div>
        </div>

        {/* Checkbox */}
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
          isSelected
            ? "border-primary bg-primary"
            : "border-border group-hover:border-muted-foreground/50"
        )}>
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                <LucideIcons.Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description tooltip on hover - only show for cards with descriptions */}
      {asset.description && (
        <div className={cn(
          "absolute left-0 right-0 bottom-0 translate-y-full pt-1 z-50 pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        )}>
          <div className="mx-1 p-2 rounded-lg bg-popover/95 backdrop-blur-sm border border-border shadow-lg">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {asset.description}
            </p>
            {asset.printSpec && (
              <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center gap-3 text-[10px] text-muted-foreground/80">
                <span className="flex items-center gap-0.5">
                  <LucideIcons.Maximize2 className="w-2.5 h-2.5" />
                  {asset.printSpec.dpi} DPI
                </span>
                <span className="flex items-center gap-0.5">
                  <LucideIcons.Droplets className="w-2.5 h-2.5" />
                  {asset.printSpec.bleedInches}" bleed
                </span>
                <span className="flex items-center gap-0.5">
                  <LucideIcons.Palette className="w-2.5 h-2.5" />
                  {asset.printSpec.colorMode}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.button>
  );
};

export default AssetCard;
