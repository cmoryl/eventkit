import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetType } from '../../types';
import { AssetConfig, AssetCategory, ASSET_CATEGORIES } from '../../config/assetConfig';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import AssetCard from './AssetCard';

interface CategorySectionProps {
  categoryKey: AssetCategory;
  assets: AssetConfig[];
  selectedAssets: Set<AssetType>;
  onToggleAsset: (type: AssetType) => void;
  defaultOpen?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryKey,
  assets,
  selectedAssets,
  onToggleAsset,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const category = ASSET_CATEGORIES[categoryKey];
  
  const selectedCount = assets.filter(a => selectedAssets.has(a.type)).length;
  const totalCount = assets.length;
  const progress = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const getIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className={className || "w-4 h-4"} /> : null;
  };

  // Get colors based on category
  const getCategoryColors = () => {
    switch (categoryKey) {
      case 'branding': return { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500', light: 'bg-violet-500/10' };
      case 'print': return { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-500', light: 'bg-orange-500/10' };
      case 'merchandise': return { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-500', light: 'bg-pink-500/10' };
      case 'digital': return { gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500', light: 'bg-cyan-500/10' };
      case 'experience': return { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500', light: 'bg-emerald-500/10' };
      case 'utilities': return { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500', light: 'bg-amber-500/10' };
      default: return { gradient: 'from-primary to-accent', bg: 'bg-primary', light: 'bg-primary/10' };
    }
  };

  const colors = getCategoryColors();

  const toggleAllInCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAllSelected) {
      // Deselect all
      assets.forEach(a => {
        if (selectedAssets.has(a.type)) {
          onToggleAsset(a.type);
        }
      });
    } else {
      // Select all
      assets.forEach(a => {
        if (!selectedAssets.has(a.type)) {
          onToggleAsset(a.type);
        }
      });
    }
  };

  if (assets.length === 0) return null;

  return (
    <motion.div 
      className="rounded-xl border border-border/50 bg-card/30 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      layout
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/20 transition-colors"
      >
        {/* Category icon */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br text-white shadow-sm",
          colors.gradient
        )}>
          {getIcon(category.icon, "w-4 h-4")}
        </div>

        {/* Title and meta */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">{category.label}</h3>
            <span className="text-xs text-muted-foreground">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Progress bar - only show when items selected */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 flex-1 max-w-20 rounded-full bg-secondary overflow-hidden">
                <motion.div 
                  className={cn("h-full rounded-full bg-gradient-to-r", colors.gradient)}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {selectedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Select all toggle */}
          <motion.button
            onClick={toggleAllInCategory}
            className={cn(
              "px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
              isAllSelected
                ? `${colors.light} text-foreground`
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isAllSelected ? 'Clear' : 'All'}
          </motion.button>
          
          {/* Expand/collapse */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <LucideIcons.ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Asset grid */}
            <div className="px-3 pb-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {assets.map((asset, index) => (
                  <AssetCard
                    key={asset.type}
                    asset={asset}
                    isSelected={selectedAssets.has(asset.type)}
                    onToggle={() => onToggleAsset(asset.type)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategorySection;
