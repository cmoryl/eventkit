import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedAsset, ColorInfo, AssetFolder } from '../../types';
import { AssetType } from '../../types';
import { 
  ASSET_CONFIGS, 
  ASSET_CATEGORIES, 
  AssetCategory, 
  getAssetConfig,
  getCategoryForAsset 
} from '../../config/assetConfig';
import { 
  Eye, 
  Pencil, 
  Trash2, 
  Star, 
  Printer, 
  Monitor, 
  FileText,
  Search,
  LayoutGrid,
  List,
  Download,
  RefreshCw,
  FolderOpen,
  Plus,
  CheckSquare,
  Square,
  Copy,
  X,
  Keyboard,
  Sparkles,
  Layers,
  Filter,
  ChevronDown,
} from 'lucide-react';
import AssetDownloadModal from './AssetDownloadModal';
import FolderTabs from '../FolderTabs';
import MoveToFolderModal from '../MoveToFolderModal';
import { supportsAIGeneration } from '../../services/geminiService';
import { cn } from '@/lib/utils';

interface AssetGridProps {
  assets: GeneratedAsset[];
  eventName: string;
  folders?: AssetFolder[];
  onView: (asset: GeneratedAsset) => void;
  onEdit: (asset: GeneratedAsset) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onToggleFavorite: (asset: GeneratedAsset) => void;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onMoveToFolder?: (assetId: string, folderId?: string) => void;
  onCreateFolder?: (name: string) => void;
  onDuplicate?: (asset: GeneratedAsset) => void;
}

const getCategoryGradient = (category: AssetCategory) => {
  switch (category) {
    case 'branding': return 'from-violet-500 to-purple-600';
    case 'print': return 'from-orange-500 to-red-500';
    case 'merchandise': return 'from-pink-500 to-rose-500';
    case 'digital': return 'from-cyan-500 to-blue-500';
    case 'experience': return 'from-emerald-500 to-teal-500';
    case 'utilities': return 'from-amber-500 to-yellow-500';
    default: return 'from-primary to-accent';
  }
};

const AssetGrid: React.FC<AssetGridProps> = ({ 
  assets, 
  eventName, 
  folders = [],
  onView, 
  onEdit, 
  onDelete,
  onDeleteMultiple,
  onToggleFavorite, 
  onRegenerate,
  onMoveToFolder,
  onCreateFolder,
  onDuplicate
}) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all' | 'favorites'>('all');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadingAsset, setDownloadingAsset] = useState<GeneratedAsset | null>(null);
  const [movingAsset, setMovingAsset] = useState<GeneratedAsset | null>(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const categories = Object.entries(ASSET_CATEGORIES) as [AssetCategory, typeof ASSET_CATEGORIES[AssetCategory]][];

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (activeFolderId) {
      filtered = filtered.filter(a => a.folderId === activeFolderId);
    }

    if (activeCategory === 'favorites') {
      filtered = filtered.filter(a => a.isFavorite);
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(a => getCategoryForAsset(a.type) === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        getAssetConfig(a.type)?.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, activeCategory, activeFolderId, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isSelectionMode) {
        e.preventDefault();
        setSelectedIds(new Set(filteredAssets.map(a => a.id)));
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowKeyboardShortcuts(prev => !prev);
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && isSelectionMode && selectedIds.size > 0 && onDeleteMultiple) {
        e.preventDefault();
        if (confirm(`Delete ${selectedIds.size} selected assets?`)) {
          onDeleteMultiple(Array.from(selectedIds));
          setSelectedIds(new Set());
          setIsSelectionMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectionMode, selectedIds, filteredAssets, onDeleteMultiple]);

  const toggleSelection = useCallback((assetId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAssets.map(a => a.id)));
  }, [filteredAssets]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected assets?`)) {
      if (onDeleteMultiple) {
        onDeleteMultiple(Array.from(selectedIds));
      } else {
        selectedIds.forEach(id => onDelete(id));
      }
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  }, [selectedIds, onDelete, onDeleteMultiple]);

  const handleBatchFavorite = useCallback(() => {
    selectedIds.forEach(id => {
      const asset = assets.find(a => a.id === id);
      if (asset) onToggleFavorite(asset);
    });
  }, [selectedIds, assets, onToggleFavorite]);

  const handleBatchDownload = useCallback(async () => {
    const selectedAssets = assets.filter(a => selectedIds.has(a.id));
    for (const asset of selectedAssets) {
      if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = asset.content;
        link.download = `${asset.title.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }, [selectedIds, assets]);

  const getFolderCount = (folderId: string) => {
    return assets.filter(a => a.folderId === folderId).length;
  };

  const getCategoryCount = (category: AssetCategory | 'all' | 'favorites') => {
    if (category === 'all') return assets.length;
    if (category === 'favorites') return assets.filter(a => a.isFavorite).length;
    return assets.filter(a => getCategoryForAsset(a.type) === category).length;
  };

  const getAssetPreview = (asset: GeneratedAsset) => {
    if (asset.isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/50 to-muted/50">
          <motion.div
            className="w-12 h-12 rounded-full border-3 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }

    if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
      return (
        <img
          src={asset.content}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      );
    }

    if (asset.type === AssetType.Palette && Array.isArray(asset.content)) {
      const colors = asset.content as ColorInfo[];
      return (
        <div className="w-full h-full flex">
          {colors.slice(0, 5).map((color, i) => (
            <motion.div
              key={i}
              className="flex-1 h-full"
              style={{ backgroundColor: color.hex }}
              whileHover={{ scaleY: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          ))}
        </div>
      );
    }

    if (asset.type === AssetType.Slogans && Array.isArray(asset.content)) {
      return (
        <div className="w-full h-full p-5 flex flex-col justify-center bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <div className="text-primary/30 text-4xl font-serif mb-2">"</div>
          <p className="text-sm font-medium text-foreground line-clamp-3 leading-relaxed">
            {(asset.content as string[])[0]}
          </p>
        </div>
      );
    }

    if (typeof asset.content === 'string') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-secondary/30 to-muted/30">
          <p className="text-xs text-muted-foreground line-clamp-5 text-center leading-relaxed">
            {asset.content.substring(0, 180)}...
          </p>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-muted/20">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
          <FileText className="w-7 h-7 text-muted-foreground" />
        </div>
      </div>
    );
  };

  const getAssetBadge = (asset: GeneratedAsset) => {
    const config = getAssetConfig(asset.type);
    if (!config) return null;
    const category = getCategoryForAsset(asset.type);
    const gradient = getCategoryGradient(category);

    if (config.printSpec) {
      return (
        <div className={cn("flex items-center gap-1 text-[10px] text-white px-2 py-0.5 rounded-full bg-gradient-to-r", gradient)}>
          <Printer className="w-2.5 h-2.5" />
          <span>{config.printSpec.widthInches}" × {config.printSpec.heightInches}"</span>
        </div>
      );
    }

    if (config.pixelWidth && config.pixelHeight) {
      return (
        <div className={cn("flex items-center gap-1 text-[10px] text-white px-2 py-0.5 rounded-full bg-gradient-to-r", gradient)}>
          <Monitor className="w-2.5 h-2.5" />
          <span>{config.pixelWidth}×{config.pixelHeight}</span>
        </div>
      );
    }

    if (config.isTextBased) {
      return (
        <div className={cn("flex items-center gap-1 text-[10px] text-white px-2 py-0.5 rounded-full bg-gradient-to-r", gradient)}>
          <FileText className="w-2.5 h-2.5" />
          <span>Text</span>
        </div>
      );
    }

    return null;
  };

  if (assets.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div 
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Layers className="w-12 h-12 text-primary/50" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">No assets yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">Your generated assets will appear here. Go back to setup to create your first design kit.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Folder Tabs */}
      {folders.length > 0 && (
        <FolderTabs
          folders={folders}
          activeView={activeFolderId || 'all'}
          onSelectView={(viewId) => {
            if (viewId === 'all' || viewId === 'favorites') {
              setActiveFolderId(null);
              if (viewId === 'favorites') setActiveCategory('favorites');
              else setActiveCategory('all');
            } else {
              setActiveFolderId(viewId);
              setActiveCategory('all');
            }
          }}
          onCreateFolder={() => {
            const name = prompt('Enter folder name:');
            if (name && onCreateFolder) onCreateFolder(name);
          }}
        />
      )}

      {/* Batch Selection Toolbar */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div 
            className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
          >
            <motion.button 
              onClick={clearSelection} 
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <div className="flex items-center gap-2">
              <motion.button 
                onClick={selectAll} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 text-sm font-medium hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckSquare className="w-4 h-4" />
                Select All
              </motion.button>
              <motion.span 
                className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                key={selectedIds.size}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {selectedIds.size} selected
              </motion.span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <motion.button 
                onClick={handleBatchFavorite} 
                disabled={selectedIds.size === 0} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Star className="w-4 h-4" />
                Favorite
              </motion.button>
              <motion.button 
                onClick={handleBatchDownload} 
                disabled={selectedIds.size === 0} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>
              <motion.button 
                onClick={handleBatchDelete} 
                disabled={selectedIds.size === 0} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* View Toggle + Selection Mode */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedIds(new Set());
            }}
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              isSelectionMode 
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" 
                : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            )}
            title="Toggle selection mode"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckSquare className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Keyboard shortcuts"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Keyboard className="w-4 h-4" />
          </motion.button>
          
          {onCreateFolder && folders.length === 0 && (
            <motion.button
              onClick={() => {
                const name = prompt('Enter folder name:');
                if (name) onCreateFolder(name);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Folder
            </motion.button>
          )}
          
          <div className="flex rounded-xl border border-border overflow-hidden">
            <motion.button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === 'grid' 
                  ? "bg-gradient-to-r from-primary to-accent text-white" 
                  : "bg-background hover:bg-secondary"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LayoutGrid className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2.5 transition-colors",
                viewMode === 'list' 
                  ? "bg-gradient-to-r from-primary to-accent text-white" 
                  : "bg-background hover:bg-secondary"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div 
        className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setActiveCategory('all')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
            activeCategory === 'all'
              ? "bg-gradient-to-r from-violet-500 via-primary to-cyan-500 text-white shadow-lg"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Layers className="w-4 h-4" />
          All
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-xs",
            activeCategory === 'all' ? "bg-white/20" : "bg-primary/10 text-primary"
          )}>
            {getCategoryCount('all')}
          </span>
        </motion.button>

        <motion.button
          onClick={() => setActiveCategory('favorites')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
            activeCategory === 'favorites'
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Star className="w-4 h-4" />
          Favorites
          {getCategoryCount('favorites') > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-xs",
              activeCategory === 'favorites' ? "bg-white/20" : "bg-warning/10 text-warning"
            )}>
              {getCategoryCount('favorites')}
            </span>
          )}
        </motion.button>

        {categories.map(([key, cat]) => {
          const count = getCategoryCount(key);
          if (count === 0) return null;
          const gradient = getCategoryGradient(key);
          
          return (
            <motion.button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === key
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cat.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                activeCategory === key ? "bg-white/20" : "bg-primary/10 text-primary"
              )}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Results info */}
      {searchQuery && (
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredAssets.length} result{filteredAssets.length !== 1 ? 's' : ''} for "<span className="font-medium text-primary">{searchQuery}</span>"
        </motion.p>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredAssets.map((asset, index) => {
            const isSelected = selectedIds.has(asset.id);
            const category = getCategoryForAsset(asset.type);
            const gradient = getCategoryGradient(category);
            
            return (
              <motion.div
                key={asset.id}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all bg-card",
                  isSelected 
                    ? "border-primary ring-2 ring-primary/30" 
                    : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(asset.id);
                  } else if (!asset.isLoading) {
                    onView(asset);
                  }
                }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ y: -4, scale: 1.02 }}
                layout
              >
                {/* Preview */}
                <div className="aspect-square overflow-hidden relative">
                  {getAssetPreview(asset)}
                  
                  {/* Selection checkbox */}
                  {isSelectionMode && !asset.isLoading && (
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); toggleSelection(asset.id); }}
                      className={cn(
                        "absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all z-10 shadow-lg",
                        isSelected 
                          ? "bg-gradient-to-r from-primary to-accent text-white" 
                          : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </motion.button>
                  )}
                  
                  {/* Hover overlay */}
                  {!asset.isLoading && !isSelectionMode && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2"
                      initial={false}
                    >
                      <ActionButton icon={Eye} onClick={() => onView(asset)} title="View" />
                      <ActionButton icon={Pencil} onClick={() => onEdit(asset)} title="Edit" gradient="from-violet-500 to-purple-500" />
                      {onDuplicate && (
                        <ActionButton icon={Copy} onClick={() => onDuplicate(asset)} title="Duplicate" gradient="from-cyan-500 to-blue-500" />
                      )}
                      {onRegenerate && (
                        <ActionButton 
                          icon={supportsAIGeneration(asset.type) ? Sparkles : RefreshCw} 
                          onClick={() => onRegenerate(asset)} 
                          title="Regenerate"
                          gradient={supportsAIGeneration(asset.type) ? "from-pink-500 to-rose-500" : undefined}
                        />
                      )}
                      <ActionButton icon={Download} onClick={() => setDownloadingAsset(asset)} title="Download" gradient="from-emerald-500 to-green-500" />
                      <ActionButton icon={Trash2} onClick={() => onDelete(asset.id)} title="Delete" gradient="from-red-500 to-orange-500" />
                    </motion.div>
                  )}

                  {/* Favorite badge */}
                  {asset.isFavorite && (
                    <motion.div 
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Star className="w-4 h-4 text-white fill-current" />
                    </motion.div>
                  )}

                  {/* Spec badge */}
                  <div className="absolute bottom-3 left-3">
                    {getAssetBadge(asset)}
                  </div>
                </div>

                {/* Title */}
                <div className="p-3 flex items-center justify-between bg-gradient-to-r from-card to-card/50">
                  <span className="text-sm font-semibold text-foreground truncate">{asset.title}</span>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      asset.isFavorite 
                        ? "text-amber-500 bg-amber-500/10" 
                        : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className={cn("w-4 h-4", asset.isFavorite && "fill-current")} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredAssets.map((asset, index) => {
            const config = getAssetConfig(asset.type);
            const category = getCategoryForAsset(asset.type);
            const gradient = getCategoryGradient(category);
            const isSelected = selectedIds.has(asset.id);
            
            return (
              <motion.div
                key={asset.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all bg-card",
                  isSelected 
                    ? "border-primary ring-2 ring-primary/30" 
                    : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(asset.id);
                  } else if (!asset.isLoading) {
                    onView(asset);
                  }
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ x: 4 }}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border/50">
                  {getAssetPreview(asset)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate">{asset.title}</h4>
                    {asset.isFavorite && <Star className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{config?.description}</p>
                </div>

                {/* Badge */}
                {getAssetBadge(asset)}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <ActionButton icon={Eye} onClick={() => onView(asset)} title="View" size="sm" />
                  <ActionButton icon={Pencil} onClick={() => onEdit(asset)} title="Edit" size="sm" />
                  <ActionButton icon={Download} onClick={() => setDownloadingAsset(asset)} title="Download" size="sm" />
                  <ActionButton icon={Trash2} onClick={() => onDelete(asset.id)} title="Delete" size="sm" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Download Modal */}
      {downloadingAsset && (
        <AssetDownloadModal
          asset={downloadingAsset}
          eventName={eventName}
          onClose={() => setDownloadingAsset(null)}
        />
      )}

      {/* Move to Folder Modal */}
      {movingAsset && onMoveToFolder && (
        <MoveToFolderModal
          isOpen={!!movingAsset}
          folders={folders}
          onMove={(folderId) => {
            onMoveToFolder(movingAsset.id, folderId);
            setMovingAsset(null);
          }}
          onClose={() => setMovingAsset(null)}
          onCreateFolder={onCreateFolder || (() => {})}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowKeyboardShortcuts(false)}
            />
            <motion.div 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl z-50 p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h3>
                <motion.button 
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="p-2 rounded-xl hover:bg-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="space-y-3">
                {[
                  { keys: ['Ctrl', 'A'], desc: 'Select all visible assets' },
                  { keys: ['Esc'], desc: 'Exit selection mode' },
                  { keys: ['Delete'], desc: 'Delete selected assets' },
                  { keys: ['?'], desc: 'Show this help' },
                ].map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{shortcut.desc}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd key={i} className="px-2 py-1 rounded-lg bg-secondary text-xs font-mono font-bold">{key}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Action Button Component
interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
  gradient?: string;
  size?: 'sm' | 'md';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, onClick, title, gradient, size = 'md' }) => (
  <motion.button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={cn(
      "rounded-xl flex items-center justify-center transition-all shadow-lg",
      size === 'sm' ? "w-8 h-8" : "w-9 h-9",
      gradient 
        ? `bg-gradient-to-r ${gradient} text-white` 
        : "bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
    )}
    title={title}
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
  >
    <Icon className={size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4"} />
  </motion.button>
);

export default AssetGrid;
