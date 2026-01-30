import React, { useState, useMemo } from 'react';
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

type AssetFilter = 'all' | 'print' | 'digital' | 'text' | 'video';

const StepThree: React.FC<StepThreeProps> = ({
  selectedAssets,
  onToggleAsset,
  onSelectQuickStart,
  onSelectFullSuite,
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AssetFilter>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const categories = Object.entries(ASSET_CATEGORIES) as [AssetCategory, typeof ASSET_CATEGORIES[AssetCategory]][];
  
  // Filter out secondary assets
  const baseAssets = useMemo(() => 
    ASSET_CONFIGS.filter(a => 
      a.type !== AssetType.NameTagBack &&
      a.type !== AssetType.TshirtBack &&
      a.type !== AssetType.TshirtSleeve
    ), []
  );

  // Apply all filters
  const filteredAssets = useMemo(() => {
    let result = baseAssets;

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(a => a.category === activeCategory);
    }

    // Type filter
    if (activeFilter !== 'all') {
      result = result.filter(a => {
        switch (activeFilter) {
          case 'print':
            return !!a.printSpec;
          case 'digital':
            return !a.printSpec && !a.isTextBased && !a.isVideo && !a.isAudio;
          case 'text':
            return a.isTextBased;
          case 'video':
            return a.isVideo || a.isAudio;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      );
    }

    // Selected only filter
    if (showSelectedOnly) {
      result = result.filter(a => selectedAssets.has(a.type));
    }

    return result;
  }, [baseAssets, activeCategory, activeFilter, searchQuery, showSelectedOnly, selectedAssets]);

  // Stats
  const stats = useMemo(() => ({
    total: baseAssets.length,
    print: baseAssets.filter(a => a.printSpec).length,
    digital: baseAssets.filter(a => !a.printSpec && !a.isTextBased && !a.isVideo).length,
    text: baseAssets.filter(a => a.isTextBased).length,
    video: baseAssets.filter(a => a.isVideo || a.isAudio).length,
  }), [baseAssets]);

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const getCategoryIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const selectAllInView = () => {
    filteredAssets.forEach(a => {
      if (!selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  const deselectAllInView = () => {
    filteredAssets.forEach(a => {
      if (selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onSelectQuickStart}
          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium flex items-center gap-1.5"
        >
          <LucideIcons.Zap className="w-3.5 h-3.5" />
          Quick Start ({DEFAULT_QUICK_START_ASSETS.length})
        </button>
        <button
          onClick={onSelectFullSuite}
          className="px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center gap-1.5"
        >
          <LucideIcons.Package className="w-3.5 h-3.5" />
          Full Suite ({FULL_SUITE_ASSETS.length})
        </button>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={selectAllInView}
          className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-xs flex items-center gap-1.5"
        >
          <LucideIcons.CheckSquare className="w-3.5 h-3.5" />
          Select Shown ({filteredAssets.length})
        </button>
        <button
          onClick={deselectAllInView}
          className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-xs"
        >
          Clear All
        </button>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 100+ assets by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary"
            >
              <LucideIcons.X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
          {[
            { key: 'all', label: 'All', icon: 'Layers', count: stats.total },
            { key: 'print', label: 'Print', icon: 'Printer', count: stats.print },
            { key: 'digital', label: 'Digital', icon: 'Monitor', count: stats.digital },
            { key: 'text', label: 'Text', icon: 'FileText', count: stats.text },
            { key: 'video', label: 'Video', icon: 'Video', count: stats.video },
          ].map(({ key, label, icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as AssetFilter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeFilter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {getCategoryIcon(icon)}
              <span className="hidden sm:inline">{label}</span>
              <span className={`px-1 py-0.5 rounded text-[10px] ${
                activeFilter === key
                  ? 'bg-primary-foreground/20'
                  : 'bg-muted-foreground/20'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <LucideIcons.LayoutGrid className="w-3.5 h-3.5" />
          All Categories
        </button>
        {categories.map(([key, cat]) => {
          const categoryAssets = getAssetsByCategory(key).filter(a => 
            a.type !== AssetType.NameTagBack &&
            a.type !== AssetType.TshirtBack &&
            a.type !== AssetType.TshirtSleeve
          );
          const selectedCount = categoryAssets.filter(a => selectedAssets.has(a.type)).length;
          
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.label}</span>
              {selectedCount > 0 && (
                <span className={`px-1 py-0.5 rounded text-[10px] ${
                  activeCategory === key 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {selectedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredAssets.length}</span> assets
            {searchQuery && (
              <span> matching "<span className="text-primary">{searchQuery}</span>"</span>
            )}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showSelectedOnly}
            onChange={(e) => setShowSelectedOnly(e.target.checked)}
            className="rounded border-border"
          />
          Selected only ({selectedAssets.size})
        </label>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <LucideIcons.SearchX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No assets found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setActiveCategory('all');
                setShowSelectedOnly(false);
              }}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredAssets.map((asset) => {
            const isSelected = selectedAssets.has(asset.type);
            
            return (
              <button
                key={asset.type}
                onClick={() => onToggleAsset(asset.type)}
                className={`group relative p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-secondary/30'
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 group-hover:border-primary/50'
                }`}>
                  {isSelected && <LucideIcons.Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </div>

                {/* Content */}
                <div className="flex items-start gap-2.5 pr-5">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-secondary'}`}>
                    {getIcon(asset.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {asset.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {asset.description}
                    </p>
                    
                    {/* Spec Badge */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {asset.printSpec && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 text-[10px]">
                          <LucideIcons.Printer className="w-2.5 h-2.5" />
                          {asset.printSpec.widthInches}"×{asset.printSpec.heightInches}"
                        </span>
                      )}
                      {asset.pixelWidth && asset.pixelHeight && !asset.printSpec && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px]">
                          <LucideIcons.Monitor className="w-2.5 h-2.5" />
                          {asset.pixelWidth}×{asset.pixelHeight}
                        </span>
                      )}
                      {asset.isTextBased && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 text-[10px]">
                          <LucideIcons.FileText className="w-2.5 h-2.5" />
                          Text
                        </span>
                      )}
                      {asset.isVideo && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px]">
                          <LucideIcons.Video className="w-2.5 h-2.5" />
                          Video
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
        <div>
          <p className="font-medium text-foreground text-sm">
            {selectedAssets.size} asset{selectedAssets.size !== 1 ? 's' : ''} selected
          </p>
          <p className="text-xs text-muted-foreground">
            Estimated generation time: ~{Math.ceil(selectedAssets.size * 0.5)} minute{selectedAssets.size > 2 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <LucideIcons.Printer className="w-3.5 h-3.5 text-orange-500" />
            {ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.printSpec).length} print
          </span>
          <span className="flex items-center gap-1">
            <LucideIcons.Monitor className="w-3.5 h-3.5 text-blue-500" />
            {ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && !a.printSpec && !a.isTextBased && !a.isVideo).length} digital
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
