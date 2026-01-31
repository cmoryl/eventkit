import React, { useState } from 'react';
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
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-border">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
      >
        {/* Category icon with gradient */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
          getCategoryGradient()
        )}>
          {getIcon(category.icon, "w-5 h-5")}
        </div>

        {/* Title and count */}
        <div className="flex-1 text-left">
          <h3 className="font-bold text-foreground">{category.label}</h3>
          <p className="text-xs text-muted-foreground">
            {totalCount} asset{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Selection progress */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", getCategoryGradient())}
                  style={{ width: `${(selectedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent",
                getCategoryGradient()
              )}>
                {selectedCount}/{totalCount}
              </span>
            </div>
          )}
          
          {/* Expand/collapse icon */}
          <LucideIcons.ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Content */}
      <div className={cn(
        "grid transition-all duration-300 ease-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          {/* Quick actions bar */}
          <div className="px-4 pb-2 flex items-center gap-2">
            <button
              onClick={selectAllInCategory}
              className="text-xs px-2.5 py-1 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-1"
            >
              <LucideIcons.CheckCircle2 className="w-3 h-3" />
              Select all
            </button>
            {selectedCount > 0 && (
              <button
                onClick={deselectAllInCategory}
                className="text-xs px-2.5 py-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
              >
                <LucideIcons.XCircle className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Asset grid */}
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {assets.map((asset) => (
              <AssetCard
                key={asset.type}
                asset={asset}
                isSelected={selectedAssets.has(asset.type)}
                onToggle={() => onToggleAsset(asset.type)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
