import React, { useState } from 'react';
import { AssetType } from '../types';
import type { GeneratedAsset, ColorInfo, PresentationData } from '../types';
import SkeletonLoader from './SkeletonLoader';
import { getAspectRatioStyle } from '../utils';
import Spinner from './Spinner';
import { supportsAIGeneration } from '../services/geminiService';
import { isSvgContent, isImageContent, getImageSrc } from '../utils/svgUtils';

interface AssetCardProps {
  asset: GeneratedAsset;
  onView: (asset: GeneratedAsset) => void;
  onEdit: (asset: GeneratedAsset) => void;
  onDelete: (assetId: string) => void;
  onGeneratePhotorealisticShot: (asset: GeneratedAsset) => void;
  onGenerateVariation?: (asset: GeneratedAsset) => void;
  onToggleFavorite?: (asset: GeneratedAsset) => void;
  onMoveToFolder?: (asset: GeneratedAsset) => void;
  onRegenerateWithAI?: (asset: GeneratedAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onMoveToFolder,
  onRegenerateWithAI
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const canRegenerateWithAI = supportsAIGeneration(asset.type) && typeof asset.content === 'string' && asset.content.startsWith('data:image');

  const handleRegenerateWithAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRegenerateWithAI) return;
    setIsRegenerating(true);
    try {
      await onRegenerateWithAI(asset);
    } finally {
      setIsRegenerating(false);
    }
  };

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
        <div className="w-full h-full flex flex-col" style={{ minHeight: '140px' }}>
          {colors.map((color, i) => (
            <div key={i} className="flex-1 flex items-center justify-center transition-transform hover:scale-105" style={{ backgroundColor: color.hex }}>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm">{color.hex}</span>
            </div>
          ))}
        </div>
      );
    }

    if (asset.type === AssetType.Slogans && Array.isArray(asset.content)) {
      const slogans = asset.content as string[];
      return (
        <div className="w-full h-full p-4 flex flex-col justify-center bg-gradient-to-br from-primary/20 to-accent/20" style={{ minHeight: '140px' }}>
          {slogans.slice(0, 3).map((s, i) => (
            <p key={i} className="text-foreground text-sm mb-2 truncate italic">"{s}"</p>
          ))}
          {slogans.length > 3 && <p className="text-muted-foreground text-xs">+{slogans.length - 3} more</p>}
        </div>
      );
    }

    if (asset.type === AssetType.Presentation) {
      const pres = asset.content as PresentationData;
      return (
        <div className="w-full h-full p-4 flex flex-col justify-center bg-gradient-to-br from-secondary to-muted" style={{ minHeight: '140px' }}>
          <p className="text-foreground font-bold mb-2 truncate">{pres.title}</p>
          <p className="text-muted-foreground text-sm">{pres.slides?.length || 0} slides</p>
        </div>
      );
    }

    // Handle all image types including SVG
    if (typeof contentToShow === 'string' && isImageContent(contentToShow)) {
      const imgSrc = getImageSrc(contentToShow);
      return (
        <img
          src={imgSrc}
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
        <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-card to-secondary" style={{ minHeight: '140px' }}>
          <p className="text-muted-foreground text-sm text-center line-clamp-4">{asset.content.substring(0, 200)}...</p>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary" style={{ minHeight: '140px' }}>
        <span className="text-muted-foreground">No preview</span>
      </div>
    );
  };

  return (
    <div className="group relative card-style overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in-fast">
      <div className="cursor-pointer" onClick={() => onView(asset)}>
        {renderContent()}
      </div>

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
        <div className="flex justify-between items-start">
          <span className="text-xs bg-secondary px-2.5 py-1 rounded-full text-foreground font-medium truncate max-w-[70%]">{asset.title}</span>
          <div className="flex gap-1.5">
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(asset); }}
                className={`p-2 rounded-full transition-all ${
                  asset.isFavorite 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={(e) => { e.stopPropagation(); onView(asset); }} className="p-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors" title="View">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(asset); }} className="p-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {onMoveToFolder && (
            <button onClick={(e) => { e.stopPropagation(); onMoveToFolder(asset); }} className="p-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors" title="Move to Folder">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
          )}
          {canRegenerateWithAI && onRegenerateWithAI && (
            <button 
              onClick={handleRegenerateWithAI} 
              disabled={isRegenerating}
              className="p-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg hover:from-purple-500/40 hover:to-pink-500/40 transition-colors disabled:opacity-50" 
              title="Regenerate with AI"
            >
              {isRegenerating ? <Spinner className="h-4 w-4" /> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </button>
          )}
          <button onClick={handleDownload} disabled={isDownloading} className="p-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50" title="Download">
            {isDownloading ? <Spinner className="h-4 w-4" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }} className="p-2.5 bg-destructive/20 rounded-lg hover:bg-destructive/40 transition-colors" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flip button for double-sided assets */}
      {asset.backContent && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          className="absolute bottom-3 right-3 p-2 bg-secondary/80 backdrop-blur-sm rounded-full text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
