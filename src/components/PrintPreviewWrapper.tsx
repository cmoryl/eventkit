import React, { useState } from 'react';
import { AssetType } from '../types';
import { Eye, EyeOff, Layers } from 'lucide-react';
import BleedSafeZoneOverlay from './BleedSafeZoneOverlay';

interface PrintPreviewWrapperProps {
  assetType: AssetType;
  imageUrl: string;
  alt?: string;
  className?: string;
  showControls?: boolean;
}

const PrintPreviewWrapper: React.FC<PrintPreviewWrapperProps> = ({
  assetType,
  imageUrl,
  alt = 'Asset preview',
  className = '',
  showControls = true
}) => {
  const [showBleed, setShowBleed] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Image */}
      <img 
        src={imageUrl} 
        alt={alt}
        className="w-full h-full object-contain rounded-lg"
      />
      
      {/* Overlay */}
      <BleedSafeZoneOverlay
        assetType={assetType}
        showBleed={showBleed}
        showSafeZone={showSafeZone}
        className="rounded-lg"
      />

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-2 left-2 flex gap-1">
          <button
            onClick={() => setShowBleed(!showBleed)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
              showBleed 
                ? 'bg-cyan-500 text-white' 
                : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
            }`}
            title="Toggle bleed area preview"
          >
            {showBleed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Bleed
          </button>
          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
              showSafeZone 
                ? 'bg-fuchsia-500 text-white' 
                : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
            }`}
            title="Toggle safe zone preview"
          >
            <Layers className="w-3 h-3" />
            Safe
          </button>
        </div>
      )}

      {/* Legend when overlays are active */}
      {(showBleed || showSafeZone) && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-[9px] space-y-1">
          {showBleed && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-cyan-500/50 border border-cyan-500 border-dashed rounded-sm" />
              <span className="text-white">Bleed (will be trimmed)</span>
            </div>
          )}
          {showSafeZone && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-fuchsia-500 border-dashed rounded-sm" />
              <span className="text-white">Safe Zone (keep text here)</span>
            </div>
          )}
          {showBleed && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-white rounded-sm" />
              <span className="text-white">Trim Line (final size)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrintPreviewWrapper;
