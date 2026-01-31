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
import { cn } from '@/lib/utils';
import CategorySection from './CategorySection';

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
  }, [baseAssets, activeFilter, searchQuery, showSelectedOnly, selectedAssets]);

  // Group filtered assets by category
  const groupedAssets = useMemo(() => {
    const groups: Record<AssetCategory, typeof filteredAssets> = {
      branding: [],
      print: [],
      merchandise: [],
      digital: [],
      experience: [],
      utilities: [],
    };
    
    filteredAssets.forEach(asset => {
      groups[asset.category].push(asset);
    });
    
    return groups;
  }, [filteredAssets]);

  // Stats
  const stats = useMemo(() => ({
    total: baseAssets.length,
    print: baseAssets.filter(a => a.printSpec).length,
    digital: baseAssets.filter(a => !a.printSpec && !a.isTextBased && !a.isVideo).length,
    text: baseAssets.filter(a => a.isTextBased).length,
    video: baseAssets.filter(a => a.isVideo || a.isAudio).length,
    selected: selectedAssets.size,
  }), [baseAssets, selectedAssets]);

  const selectAllFiltered = () => {
    filteredAssets.forEach(a => {
      if (!selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  const deselectAll = () => {
    baseAssets.forEach(a => {
      if (selectedAssets.has(a.type)) {
        onToggleAsset(a.type);
      }
    });
  };

  const filterButtons = [
    { key: 'all' as AssetFilter, label: 'All', icon: LucideIcons.Layers, count: stats.total, gradient: 'from-slate-500 to-slate-600' },
    { key: 'print' as AssetFilter, label: 'Print', icon: LucideIcons.Printer, count: stats.print, gradient: 'from-orange-500 to-red-500' },
    { key: 'digital' as AssetFilter, label: 'Digital', icon: LucideIcons.Monitor, count: stats.digital, gradient: 'from-cyan-500 to-blue-500' },
    { key: 'text' as AssetFilter, label: 'Text', icon: LucideIcons.FileText, count: stats.text, gradient: 'from-emerald-500 to-green-500' },
    { key: 'video' as AssetFilter, label: 'Video', icon: LucideIcons.Video, count: stats.video, gradient: 'from-purple-500 to-violet-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Hero Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 p-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LucideIcons.Sparkles className="w-5 h-5 text-primary" />
              Quick Start
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a preset or pick individual assets from {stats.total}+ options
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectQuickStart}
              className="group relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LucideIcons.Zap className="w-4 h-4" />
              Quick Start
              <span className="px-1.5 py-0.5 rounded-md bg-primary-foreground/20 text-xs">
                {DEFAULT_QUICK_START_ASSETS.length}
              </span>
            </button>
            
            <button
              onClick={onSelectFullSuite}
              className="group px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 text-foreground font-semibold text-sm border border-border hover:border-primary/30 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LucideIcons.Package className="w-4 h-4" />
              Full Suite
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-xs text-muted-foreground">
                {FULL_SUITE_ASSETS.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search Input with glow effect */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
          <div className="relative flex items-center">
            <LucideIcons.Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets by name, type, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <LucideIcons.X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filterButtons.map(({ key, label, icon: Icon, count, gradient }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "group relative px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300",
                activeFilter === key
                  ? "text-white shadow-lg scale-105"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-102"
              )}
            >
              {activeFilter === key && (
                <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-r", gradient)} />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-xs",
                  activeFilter === key
                    ? "bg-white/20"
                    : "bg-muted-foreground/10"
                )}>
                  {count}
                </span>
              </span>
            </button>
          ))}
          
          <div className="h-6 w-px bg-border mx-1" />
          
          {/* Selected only toggle */}
          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={cn(
              "px-3 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300",
              showSelectedOnly
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <LucideIcons.Filter className="w-4 h-4" />
            Selected
            {stats.selected > 0 && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-md text-xs",
                showSelectedOnly ? "bg-white/20" : "bg-primary/10 text-primary font-bold"
              )}>
                {stats.selected}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filteredAssets.length}</span> assets
          {searchQuery && (
            <span> matching "<span className="text-primary font-medium">{searchQuery}</span>"</span>
          )}
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={selectAllFiltered}
            className="text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-1"
          >
            <LucideIcons.CheckSquare className="w-3.5 h-3.5" />
            Select shown
          </button>
          {stats.selected > 0 && (
            <button
              onClick={deselectAll}
              className="text-xs px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
            >
              <LucideIcons.XSquare className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredAssets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center mb-4">
              <LucideIcons.SearchX className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground">No assets found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setShowSelectedOnly(false);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          categories.map(([key]) => (
            <CategorySection
              key={key}
              categoryKey={key}
              assets={groupedAssets[key]}
              selectedAssets={selectedAssets}
              onToggleAsset={onToggleAsset}
              defaultOpen={groupedAssets[key].length > 0 && groupedAssets[key].length <= 15}
            />
          ))
        )}
      </div>

      {/* Selection Summary Footer */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-card to-card/50 p-4">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Animated selection counter */}
            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300",
                stats.selected > 0
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary text-muted-foreground"
              )}>
                {stats.selected}
              </div>
              {stats.selected > 0 && (
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-primary/50 animate-ping opacity-20" />
              )}
            </div>
            
            <div>
              <p className="font-bold text-foreground">
                {stats.selected} asset{stats.selected !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-muted-foreground">
                Est. generation: ~{Math.max(1, Math.ceil(stats.selected * 0.5))} min
              </p>
            </div>
          </div>

          {/* Type breakdown */}
          <div className="flex items-center gap-4">
            {[
              { icon: LucideIcons.Printer, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.printSpec).length, label: 'Print', color: 'text-orange-500' },
              { icon: LucideIcons.Monitor, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && !a.printSpec && !a.isTextBased && !a.isVideo).length, label: 'Digital', color: 'text-cyan-500' },
              { icon: LucideIcons.FileText, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.isTextBased).length, label: 'Text', color: 'text-emerald-500' },
              { icon: LucideIcons.Video, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && (a.isVideo || a.isAudio)).length, label: 'Video', color: 'text-purple-500' },
            ].filter(t => t.count > 0).map(({ icon: Icon, count, label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="font-medium">{count}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;
