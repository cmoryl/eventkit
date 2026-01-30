import React, { useState, useMemo } from 'react';
import type { GeneratedAsset, ColorInfo } from '../../types';
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
  Filter,
  LayoutGrid,
  List,
  Download,
  RefreshCw
} from 'lucide-react';
import AssetDownloadModal from './AssetDownloadModal';

interface AssetGridProps {
  assets: GeneratedAsset[];
  eventName: string;
  onView: (asset: GeneratedAsset) => void;
  onEdit: (asset: GeneratedAsset) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (asset: GeneratedAsset) => void;
  onRegenerate?: (asset: GeneratedAsset) => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, eventName, onView, onEdit, onDelete, onToggleFavorite, onRegenerate }) => {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadingAsset, setDownloadingAsset] = useState<GeneratedAsset | null>(null);

  const categories = Object.entries(ASSET_CATEGORIES) as [AssetCategory, typeof ASSET_CATEGORIES[AssetCategory]][];

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Filter by category
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(a => a.isFavorite);
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(a => getCategoryForAsset(a.type) === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        getAssetConfig(a.type)?.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, activeCategory, searchQuery]);

  const getCategoryCount = (category: AssetCategory | 'all' | 'favorites') => {
    if (category === 'all') return assets.length;
    if (category === 'favorites') return assets.filter(a => a.isFavorite).length;
    return assets.filter(a => getCategoryForAsset(a.type) === category).length;
  };

  const getAssetPreview = (asset: GeneratedAsset) => {
    if (asset.isLoading) {
      return <div className="w-full h-full shimmer rounded-xl" />;
    }

    // Image assets
    if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
      return (
        <img
          src={asset.content}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      );
    }

    // Color palette
    if (asset.type === AssetType.Palette && Array.isArray(asset.content)) {
      const colors = asset.content as ColorInfo[];
      return (
        <div className="w-full h-full flex rounded-t-xl overflow-hidden">
          {colors.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="flex-1 h-full transition-transform duration-300 group-hover:scale-y-105 origin-bottom"
              style={{ backgroundColor: color.hex, transitionDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      );
    }

    // Slogans
    if (asset.type === AssetType.Slogans && Array.isArray(asset.content)) {
      return (
        <div className="w-full h-full p-5 flex flex-col justify-center bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <div className="text-primary/20 text-4xl font-serif mb-2">"</div>
          <p className="text-sm font-medium text-foreground line-clamp-3 leading-relaxed">
            {(asset.content as string[])[0]}
          </p>
        </div>
      );
    }

    // Text content
    if (typeof asset.content === 'string') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center bg-secondary/30">
          <p className="text-xs text-muted-foreground line-clamp-5 text-center leading-relaxed">
            {asset.content.substring(0, 180)}...
          </p>
        </div>
      );
    }

    // Default placeholder
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/20">
        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    );
  };

  const getAssetBadge = (asset: GeneratedAsset) => {
    const config = getAssetConfig(asset.type);
    if (!config) return null;

    if (config.printSpec) {
      return (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
          <Printer className="w-3 h-3" />
          <span>{config.printSpec.widthInches}" × {config.printSpec.heightInches}"</span>
        </div>
      );
    }

    if (config.pixelWidth && config.pixelHeight) {
      return (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
          <Monitor className="w-3 h-3" />
          <span>{config.pixelWidth}×{config.pixelHeight}</span>
        </div>
      );
    }

    if (config.isTextBased) {
      return (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
          <FileText className="w-3 h-3" />
          <span>Text</span>
        </div>
      );
    }

    return null;
  };

  if (assets.length === 0) {
    return (
      <div className="empty-state glass-card p-12">
        <div className="empty-state-icon animate-float">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No assets yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">Your generated assets will appear here. Go back to setup to create your first design kit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          All Assets
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            activeCategory === 'all' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
          }`}>
            {getCategoryCount('all')}
          </span>
        </button>

        <button
          onClick={() => setActiveCategory('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === 'favorites'
              ? 'bg-warning text-warning-foreground shadow-sm'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <Star className="w-4 h-4" />
          Favorites
          {getCategoryCount('favorites') > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeCategory === 'favorites' ? 'bg-warning-foreground/20' : 'bg-warning/10 text-warning'
            }`}>
              {getCategoryCount('favorites')}
            </span>
          )}
        </button>

        {categories.map(([key, cat]) => {
          const count = getCategoryCount(key);
          if (count === 0) return null;
          
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {cat.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeCategory === key ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {filteredAssets.length} result{filteredAssets.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 stagger-children">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="glass-card-hover group cursor-pointer overflow-hidden rounded-2xl"
              onClick={() => !asset.isLoading && onView(asset)}
            >
              {/* Preview */}
              <div className="aspect-square overflow-hidden relative bg-secondary/20">
                {getAssetPreview(asset)}
                
                {/* Hover overlay */}
                {!asset.isLoading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(asset); }}
                      className="w-9 h-9 rounded-xl bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-all hover:scale-110 shadow-md"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                      className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-all hover:scale-110 shadow-md"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {onRegenerate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRegenerate(asset); }}
                        className="w-9 h-9 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-600 transition-all hover:scale-110 shadow-md"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDownloadingAsset(asset); }}
                      className="w-9 h-9 rounded-xl bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-600 transition-all hover:scale-110 shadow-md"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                      className="w-9 h-9 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive transition-all hover:scale-110 shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Favorite badge */}
                {asset.isFavorite && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-warning/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Star className="w-4 h-4 text-warning-foreground fill-current" />
                  </div>
                )}

                {/* Spec badge */}
                <div className="absolute bottom-3 left-3">
                  {getAssetBadge(asset)}
                </div>

                {/* Loading indicator */}
                {asset.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="p-4 flex items-center justify-between bg-white/50">
                <span className="text-sm font-medium text-foreground truncate">{asset.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                  className={`p-1.5 rounded-lg transition-all ${asset.isFavorite ? 'text-warning bg-warning/10' : 'text-muted-foreground hover:text-warning hover:bg-warning/10'}`}
                >
                  <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredAssets.map((asset) => {
            const config = getAssetConfig(asset.type);
            
            return (
              <div
                key={asset.id}
                className="glass-card-hover flex items-center gap-4 p-4 rounded-xl cursor-pointer"
                onClick={() => !asset.isLoading && onView(asset)}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary/20">
                  {asset.isLoading ? (
                    <div className="w-full h-full shimmer" />
                  ) : typeof asset.content === 'string' && asset.content.startsWith('data:image') ? (
                    <img src={asset.content} alt={asset.title} className="w-full h-full object-cover" />
                  ) : asset.type === AssetType.Palette && Array.isArray(asset.content) ? (
                    <div className="w-full h-full flex">
                      {(asset.content as ColorInfo[]).slice(0, 4).map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">{asset.title}</h4>
                    {asset.isFavorite && <Star className="w-4 h-4 text-warning fill-current flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{config?.description}</p>
                  <div className="mt-1">{getAssetBadge(asset)}</div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {onRegenerate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegenerate(asset); }}
                      className="p-2 rounded-lg hover:bg-blue-500/10 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDownloadingAsset(asset); }}
                    className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-muted-foreground hover:text-green-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Favorite"
                  >
                    <Star className={`w-4 h-4 ${asset.isFavorite ? 'text-warning fill-current' : 'text-muted-foreground'}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty filtered state */}
      {filteredAssets.length === 0 && assets.length > 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No matching assets</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Download Modal */}
      {downloadingAsset && (
        <AssetDownloadModal
          asset={downloadingAsset}
          eventName={eventName}
          onClose={() => setDownloadingAsset(null)}
        />
      )}
    </div>
  );
};

export default AssetGrid;
