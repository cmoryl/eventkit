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

  const getIcon = (iconName: string, className?: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className={className || "w-4 h-4"} /> : null;
  };

  // Get gradient based on category
  const getCategoryGradient = () => {
    switch (categoryKey) {
      case 'branding': return 'from-violet-500 to-purple-600';
      case 'print': return 'from-orange-500 to-red-500';
      case 'merchandise': return 'from-pink-500 to-rose-500';
      case 'digital': return 'from-cyan-500 to-blue-500';
      case 'experience': return 'from-emerald-500 to-teal-500';
      case 'utilities': return 'from-amber-500 to-yellow-500';
      default: return 'from-primary to-accent';
    }
  };

  const selectAllInCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    assets.forEach(a => {
      if (!selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  const deselectAllInCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    assets.forEach(a => {
      if (selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  if (assets.length === 0) return null;

  return (
    <motion.div 
      className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      layout
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Category icon with gradient */}
        <motion.div 
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
            getCategoryGradient()
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {getIcon(category.icon, "w-5 h-5")}
        </motion.div>

        {/* Title and count */}
        <div className="flex-1 text-left">
          <h3 className="font-bold text-foreground">{category.label}</h3>
          <p className="text-xs text-muted-foreground">
            {totalCount} asset{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Selection progress */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full bg-gradient-to-r", getCategoryGradient())}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
                <motion.span 
                  className={cn(
                    "text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent min-w-[40px]",
                    getCategoryGradient()
                  )}
                  key={selectedCount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {selectedCount}/{totalCount}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Expand/collapse icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <LucideIcons.ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Quick actions bar */}
            <motion.div 
              className="px-4 pb-2 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.button
                onClick={selectAllInCategory}
                className="text-xs px-2.5 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LucideIcons.CheckCircle2 className="w-3 h-3" />
                Select all
              </motion.button>
              <AnimatePresence>
                {selectedCount > 0 && (
                  <motion.button
                    onClick={deselectAllInCategory}
                    className="text-xs px-2.5 py-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LucideIcons.XCircle className="w-3 h-3" />
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Asset grid */}
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategorySection;
