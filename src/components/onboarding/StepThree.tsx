import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AssetType } from '../../types';
import { 
  ASSET_CONFIGS, 
  ASSET_CATEGORIES, 
  AssetCategory, 
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
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-card to-card/80 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <LucideIcons.Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Select Assets</h3>
            <p className="text-xs text-muted-foreground">
              {stats.total} assets available
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onSelectQuickStart}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LucideIcons.Zap className="w-3.5 h-3.5" />
            Quick Start
            <span className="px-1.5 py-0.5 rounded bg-primary-foreground/20 text-xs">
              {DEFAULT_QUICK_START_ASSETS.length}
            </span>
          </motion.button>
          
          <motion.button
            onClick={onSelectFullSuite}
            className="px-3 py-2 rounded-lg bg-secondary text-foreground font-medium text-sm border border-border flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LucideIcons.Package className="w-3.5 h-3.5" />
            Full Suite
            <span className="px-1.5 py-0.5 rounded bg-muted text-xs text-muted-foreground">
              {FULL_SUITE_ASSETS.length}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary transition-colors"
            >
              <LucideIcons.X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterButtons.map(({ key, label, icon: Icon, count, gradient }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                activeFilter === key
                  ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={cn(
                "px-1 py-0.5 rounded text-[10px]",
                activeFilter === key ? "bg-white/20" : "bg-background/50"
              )}>
                {count}
              </span>
            </button>
          ))}
          
          <div className="h-5 w-px bg-border mx-1" />
          
          {/* Selected only toggle */}
          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
              showSelectedOnly
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <LucideIcons.Filter className="w-3.5 h-3.5" />
            Selected
            {stats.selected > 0 && (
              <span className={cn(
                "px-1 py-0.5 rounded text-[10px]",
                showSelectedOnly ? "bg-white/20" : "bg-primary/20 text-primary font-semibold"
              )}>
                {stats.selected}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredAssets.length}</span> assets
          {searchQuery && (
            <span> matching "<span className="text-primary">{searchQuery}</span>"</span>
          )}
        </p>
        
        <div className="flex items-center gap-1.5">
          <button
            onClick={selectAllFiltered}
            className="text-[10px] px-2 py-1 rounded text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center gap-1"
          >
            <LucideIcons.CheckSquare className="w-3 h-3" />
            Select all
          </button>
          {stats.selected > 0 && (
            <button
              onClick={deselectAll}
              className="text-[10px] px-2 py-1 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center gap-1"
            >
              <LucideIcons.XSquare className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredAssets.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center mb-3">
              <LucideIcons.SearchX className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No assets found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setShowSelectedOnly(false);
              }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors"
            >
              Clear filters
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
              defaultOpen={groupedAssets[key].length > 0 && groupedAssets[key].length <= 12}
            />
          ))
        )}
      </div>

      {/* Selection Summary Footer */}
      <div className="rounded-xl border border-border bg-card/50 p-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Selection counter */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors",
              stats.selected > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {stats.selected}
            </div>
            
            <div>
              <p className="font-medium text-sm text-foreground">
                {stats.selected} asset{stats.selected !== 1 ? 's' : ''} selected
              </p>
              <p className="text-[10px] text-muted-foreground">
                ~{Math.max(1, Math.ceil(stats.selected * 0.5))} min generation time
              </p>
            </div>
          </div>

          {/* Type breakdown - compact */}
          <div className="flex items-center gap-3">
            {[
              { icon: LucideIcons.Printer, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.printSpec).length, color: 'text-orange-500' },
              { icon: LucideIcons.Monitor, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && !a.printSpec && !a.isTextBased && !a.isVideo).length, color: 'text-cyan-500' },
              { icon: LucideIcons.FileText, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && a.isTextBased).length, color: 'text-emerald-500' },
              { icon: LucideIcons.Video, count: ASSET_CONFIGS.filter(a => selectedAssets.has(a.type) && (a.isVideo || a.isAudio)).length, color: 'text-purple-500' },
            ].filter(t => t.count > 0).map(({ icon: Icon, count, color }, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <Icon className={cn("w-3.5 h-3.5", color)} />
                <span className="font-medium text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepThree;
