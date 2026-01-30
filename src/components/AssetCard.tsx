import React, { useState } from 'react';
import { AssetType } from '../types';
import type { GeneratedAsset, ColorInfo, PresentationData } from '../types';
import SkeletonLoader from './SkeletonLoader';
import { getAspectRatioStyle } from '../utils';
import Spinner from './Spinner';

interface AssetCardProps {
  asset: GeneratedAsset;
  onView: (asset: GeneratedAsset) => void;
  onEdit: (asset: GeneratedAsset) => void;
  onDelete: (assetId: string) => void;
  onGeneratePhotorealisticShot: (asset: GeneratedAsset) => void;
  onGenerateVariation?: (asset: GeneratedAsset) => void;
  onToggleFavorite?: (asset: GeneratedAsset) => void;
  onMoveToFolder?: (asset: GeneratedAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onView,
  onEdit,
  onDelete,
  onGeneratePhotorealisticShot,
  onGenerateVariation,
  onToggleFavorite,
  onMoveToFolder
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const contentToShow = isFlipped && asset.backContent ? asset.backContent : asset.content;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      if (typeof asset.content === 'string' && (asset.content.startsWith('data:image') || asset.content.startsWith('blob:'))) {
        const link = document.createElement('a');
        link.href = asset.content;
        link.download = `${asset.title.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (asset.type === AssetType.VideoTeaser && typeof asset.content === 'string') {
        const link = document.createElement('a');
        link.href = asset.content;
        link.download = `${asset.title.replace(/\s+/g, '_')}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const contentString = typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2);
        const blob = new Blob([contentString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${asset.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    if (asset.isLoading) {
      return <SkeletonLoader className="w-full h-full" style={getAspectRatioStyle(asset.type)} />;
    }

    if (asset.type === AssetType.Palette && Array.isArray(asset.content)) {
      const colors = asset.content as ColorInfo[];
      return (
        <div className="w-full h-full flex flex-col" style={{ minHeight: '120px' }}>
          {colors.map((color, i) => (
            <div key={i} className="flex-1 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/30 text-white">{color.hex}</span>
            </div>
          ))}
        </div>
      );
    }

    if (asset.type === AssetType.Slogans && Array.isArray(asset.content)) {
      const slogans = asset.content as string[];
      return (
        <div className="w-full h-full p-4 flex flex-col justify-center bg-gradient-to-br from-fuchsia-900/50 to-purple-900/50" style={{ minHeight: '120px' }}>
          {slogans.slice(0, 3).map((s, i) => (
            <p key={i} className="text-white text-sm mb-2 truncate">"{s}"</p>
          ))}
          {slogans.length > 3 && <p className="text-gray-400 text-xs">+{slogans.length - 3} more</p>}
        </div>
      );
    }

    if (asset.type === AssetType.Presentation) {
      const pres = asset.content as PresentationData;
      return (
        <div className="w-full h-full p-4 flex flex-col justify-center bg-gradient-to-br from-blue-900/50 to-indigo-900/50" style={{ minHeight: '120px' }}>
          <p className="text-white font-bold mb-2">{pres.title}</p>
          <p className="text-gray-300 text-sm">{pres.slides?.length || 0} slides</p>
        </div>
      );
    }

    if (typeof contentToShow === 'string' && contentToShow.startsWith('data:image')) {
      return (
        <img
          src={contentToShow}
          alt={asset.title}
          className="w-full h-full object-cover"
          style={getAspectRatioStyle(asset.type)}
        />
      );
    }

    if (typeof contentToShow === 'string' && contentToShow.startsWith('data:video')) {
      return (
        <video
          src={contentToShow}
          className="w-full h-full object-cover"
          style={getAspectRatioStyle(asset.type)}
          muted
          loop
          playsInline
        />
      );
    }

    if (typeof asset.content === 'string') {
      return (
        <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900" style={{ minHeight: '120px' }}>
          <p className="text-gray-300 text-sm text-center line-clamp-4">{asset.content.substring(0, 200)}...</p>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ minHeight: '120px' }}>
        <span className="text-gray-500">No preview</span>
      </div>
    );
  };

  return (
    <div className="group relative card-style overflow-hidden transition-all hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-500/10 animate-fade-in-fast">
      <div className="cursor-pointer" onClick={() => onView(asset)}>
        {renderContent()}
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        <div className="flex justify-between items-start">
          <span className="text-xs bg-black/50 px-2 py-1 rounded text-white truncate max-w-[70%]">{asset.title}</span>
          <div className="flex gap-1">
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                className={`p-1.5 rounded-full transition-colors ${asset.isFavorite ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button onClick={(e) => { e.stopPropagation(); onView(asset); }} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="View">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50" title="Download">
            {isDownloading ? <Spinner className="h-4 w-4" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors text-red-400" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flip button for double-sided assets */}
      {asset.backContent && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Flip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AssetCard;
