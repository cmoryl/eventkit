import React, { useState } from 'react';
import { AssetType } from '../../types';
import { 
  ASSET_CONFIGS, 
  ASSET_CATEGORIES, 
  AssetCategory, 
  getAssetsByCategory,
  DEFAULT_QUICK_START_ASSETS,
  FULL_SUITE_ASSETS 
} from '../../config/assetConfig';
import * as LucideIcons from 'lucide-react';

interface StepThreeProps {
  selectedAssets: Set<AssetType>;
  onToggleAsset: (type: AssetType) => void;
  onSelectQuickStart: () => void;
  onSelectFullSuite: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({
  selectedAssets,
  onToggleAsset,
  onSelectQuickStart,
  onSelectFullSuite,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('branding');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.entries(ASSET_CATEGORIES) as [AssetCategory, typeof ASSET_CATEGORIES[AssetCategory]][];
  
  const filteredAssets = searchQuery
    ? ASSET_CONFIGS.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getAssetsByCategory(activeCategory);

  // Don't show secondary assets (backs, sleeves) in selection
  const displayAssets = filteredAssets.filter(a => 
    a.type !== AssetType.NameTagBack &&
    a.type !== AssetType.TshirtBack &&
    a.type !== AssetType.TshirtSleeve
  );

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSelectQuickStart}
          className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <LucideIcons.Zap className="w-4 h-4" />
          Quick Start ({DEFAULT_QUICK_START_ASSETS.length} assets)
        </button>
        <button
          onClick={onSelectFullSuite}
          className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <LucideIcons.Package className="w-4 h-4" />
          Full Suite ({FULL_SUITE_ASSETS.length} assets)
        </button>
        <button
          onClick={() => {
            ASSET_CONFIGS.forEach(a => {
              if (selectedAssets.has(a.type)) onToggleAsset(a.type);
            });
          }}
          className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-sm"
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
          {categories.map(([key, cat]) => {
            const count = getAssetsByCategory(key).filter(a => 
              selectedAssets.has(a.type) && 
              a.type !== AssetType.NameTagBack &&
              a.type !== AssetType.TshirtBack &&
              a.type !== AssetType.TshirtSleeve
            ).length;
            
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeCategory === key 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Category Description */}
      {!searchQuery && (
        <p className="text-sm text-muted-foreground">
          {ASSET_CATEGORIES[activeCategory].description}
        </p>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {displayAssets.map((asset) => {
          const isSelected = selectedAssets.has(asset.type);
          
          return (
            <button
              key={asset.type}
              onClick={() => onToggleAsset(asset.type)}
              className={`group relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/30'
              }`}
            >
              {/* Selection Indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              }`}>
                {isSelected && <LucideIcons.Check className="w-3 h-3 text-primary-foreground" />}
              </div>

              {/* Content */}
              <div className="flex items-start gap-3 pr-6">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {getIcon(asset.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {asset.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {asset.description}
                  </p>
                  
                  {/* Print Spec Badge */}
                  {asset.printSpec && (
                    <div className="flex items-center gap-1 mt-2">
                      <LucideIcons.Printer className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {asset.printSpec.widthInches}" × {asset.printSpec.heightInches}" · {asset.printSpec.dpi}dpi
                      </span>
                    </div>
                  )}
                  
                  {/* Digital Spec Badge */}
                  {asset.pixelWidth && asset.pixelHeight && !asset.printSpec && (
                    <div className="flex items-center gap-1 mt-2">
                      <LucideIcons.Monitor className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {asset.pixelWidth} × {asset.pixelHeight}px
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
        <div>
          <p className="font-medium text-foreground">
            {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimated generation time: ~{Math.ceil(selectedAssets.size * 0.5)} minute{selectedAssets.size > 2 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LucideIcons.Printer className="w-4 h-4" />
          <span>
            {ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.printSpec).length} print-ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
