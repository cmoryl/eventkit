import React from 'react';
import type { GeneratedAsset, ColorInfo } from '../../types';
import { AssetType } from '../../types';

interface AssetGridProps {
  assets: GeneratedAsset[];
  onView: (asset: GeneratedAsset) => void;
  onEdit: (asset: GeneratedAsset) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (asset: GeneratedAsset) => void;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, onView, onEdit, onDelete, onToggleFavorite }) => {
  const getAssetPreview = (asset: GeneratedAsset) => {
    if (asset.isLoading) {
      return (
        <div className="w-full h-full shimmer rounded-lg" />
      );
    }

    // Image assets
    if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
      return (
        <img
          src={asset.content}
          alt={asset.title}
          className="w-full h-full object-cover"
        />
      );
    }

    // Color palette
    if (asset.type === AssetType.Palette && Array.isArray(asset.content)) {
      const colors = asset.content as ColorInfo[];
      return (
        <div className="w-full h-full flex">
          {colors.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="flex-1 h-full"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      );
    }

    // Slogans
    if (asset.type === AssetType.Slogans && Array.isArray(asset.content)) {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-center bg-gradient-to-br from-primary/20 to-accent/20">
          <p className="text-sm font-medium text-foreground line-clamp-3">
            {(asset.content as string[])[0]}
          </p>
        </div>
      );
    }

    // Text content
    if (typeof asset.content === 'string') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center bg-secondary/50">
          <p className="text-xs text-muted-foreground line-clamp-4 text-center">
            {asset.content.substring(0, 150)}...
          </p>
        </div>
      );
    }

    // Default placeholder
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary/30">
        <span className="text-2xl">📄</span>
      </div>
    );
  };

  if (assets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No assets yet</h3>
        <p className="text-muted-foreground mb-6">Generate your first assets to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          className="glass-card-hover group cursor-pointer overflow-hidden"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => !asset.isLoading && onView(asset)}
        >
          {/* Preview */}
          <div className="aspect-square overflow-hidden relative">
            {getAssetPreview(asset)}
            
            {/* Hover overlay */}
            {!asset.isLoading && (
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(asset); }}
                  className="btn-icon bg-secondary/80"
                  title="View"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                  className="btn-icon bg-secondary/80"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                  className="btn-icon bg-destructive/20 text-destructive hover:bg-destructive/30"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Favorite badge */}
            {asset.isFavorite && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warning-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            )}

            {/* Loading indicator */}
            {asset.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground truncate">{asset.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
              className={`p-1 transition-colors ${asset.isFavorite ? 'text-warning' : 'text-muted-foreground hover:text-warning'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill={asset.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;
