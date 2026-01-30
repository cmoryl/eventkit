import React, { useMemo } from 'react';
import { AssetType } from '../types';
import { ASSET_CONFIGS } from '../config/assetConfig';
import { printDimensionsMap } from '../utils';

interface BleedSafeZoneOverlayProps {
  assetType: AssetType;
  showBleed: boolean;
  showSafeZone: boolean;
  containerWidth?: number;
  containerHeight?: number;
  className?: string;
}

interface OverlayDimensions {
  bleedPercent: number;
  safeZonePercent: number;
  hasBleed: boolean;
  hasSafeZone: boolean;
}

const BleedSafeZoneOverlay: React.FC<BleedSafeZoneOverlayProps> = ({
  assetType,
  showBleed,
  showSafeZone,
  className = ''
}) => {
  const dimensions = useMemo((): OverlayDimensions => {
    // Try to get from asset config first
    const config = ASSET_CONFIGS.find(c => c.type === assetType);
    const printSpec = config?.printSpec;
    
    // Try print dimensions map as fallback
    const dims = printDimensionsMap[assetType];
    
    if (printSpec) {
      const bleedInches = printSpec.bleedInches || 0.125;
      const safeZoneInches = 0.125; // Default safe zone
      const totalWidth = printSpec.widthInches + (bleedInches * 2);
      const totalHeight = printSpec.heightInches + (bleedInches * 2);
      const bleedPercent = (bleedInches / Math.min(totalWidth, totalHeight)) * 100;
      const safeZonePercent = (safeZoneInches / Math.min(printSpec.widthInches, printSpec.heightInches)) * 100;
      
      return {
        bleedPercent: Math.min(bleedPercent, 15),
        safeZonePercent: Math.min(safeZonePercent, 12),
        hasBleed: bleedInches > 0,
        hasSafeZone: true
      };
    }
    
    if (dims) {
      // printDimensionsMap has { w: number, h: number } - use standard bleed values
      const bleedInches = 0.125; // Standard bleed
      const safeZoneInches = 0.125; // Standard safe zone
      const bleedPercent = (bleedInches / Math.min(dims.w, dims.h)) * 100;
      const safeZonePercent = (safeZoneInches / Math.min(dims.w, dims.h)) * 100;
      
      return {
        bleedPercent: Math.min(bleedPercent, 15),
        safeZonePercent: Math.min(safeZonePercent, 12),
        hasBleed: true, // All print assets have bleed
        hasSafeZone: true
      };
    }
    
    // Default fallback for digital assets
    return {
      bleedPercent: 3,
      safeZonePercent: 5,
      hasBleed: false,
      hasSafeZone: true
    };
  }, [assetType]);

  if (!showBleed && !showSafeZone) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Bleed Area Overlay - Cyan */}
      {showBleed && dimensions.hasBleed && (
        <>
          {/* Top bleed */}
          <div 
            className="absolute top-0 left-0 right-0 bg-cyan-500/30 border-b-2 border-cyan-500 border-dashed"
            style={{ height: `${dimensions.bleedPercent}%` }}
          />
          {/* Bottom bleed */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-cyan-500/30 border-t-2 border-cyan-500 border-dashed"
            style={{ height: `${dimensions.bleedPercent}%` }}
          />
          {/* Left bleed */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-cyan-500/30 border-r-2 border-cyan-500 border-dashed"
            style={{ 
              width: `${dimensions.bleedPercent}%`,
              top: `${dimensions.bleedPercent}%`,
              bottom: `${dimensions.bleedPercent}%`
            }}
          />
          {/* Right bleed */}
          <div 
            className="absolute top-0 bottom-0 right-0 bg-cyan-500/30 border-l-2 border-cyan-500 border-dashed"
            style={{ 
              width: `${dimensions.bleedPercent}%`,
              top: `${dimensions.bleedPercent}%`,
              bottom: `${dimensions.bleedPercent}%`
            }}
          />
          {/* Bleed label */}
          <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
            BLEED
          </div>
        </>
      )}

      {/* Safe Zone Overlay - Magenta */}
      {showSafeZone && (
        <>
          {/* Safe zone border rectangle */}
          <div 
            className="absolute border-2 border-fuchsia-500 border-dashed"
            style={{ 
              top: `${dimensions.bleedPercent + dimensions.safeZonePercent}%`,
              right: `${dimensions.bleedPercent + dimensions.safeZonePercent}%`,
              bottom: `${dimensions.bleedPercent + dimensions.safeZonePercent}%`,
              left: `${dimensions.bleedPercent + dimensions.safeZonePercent}%`
            }}
          />
          {/* Safe zone corner markers */}
          <SafeZoneCorner 
            position="top-left" 
            offset={dimensions.bleedPercent + dimensions.safeZonePercent} 
          />
          <SafeZoneCorner 
            position="top-right" 
            offset={dimensions.bleedPercent + dimensions.safeZonePercent} 
          />
          <SafeZoneCorner 
            position="bottom-left" 
            offset={dimensions.bleedPercent + dimensions.safeZonePercent} 
          />
          <SafeZoneCorner 
            position="bottom-right" 
            offset={dimensions.bleedPercent + dimensions.safeZonePercent} 
          />
          {/* Safe zone label */}
          <div 
            className="absolute bg-fuchsia-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{ 
              top: `${dimensions.bleedPercent + dimensions.safeZonePercent + 1}%`,
              right: `${dimensions.bleedPercent + dimensions.safeZonePercent + 1}%`
            }}
          >
            SAFE ZONE
          </div>
        </>
      )}

      {/* Trim line (between bleed and content) */}
      {showBleed && dimensions.hasBleed && (
        <div 
          className="absolute border border-white/80"
          style={{ 
            top: `${dimensions.bleedPercent}%`,
            right: `${dimensions.bleedPercent}%`,
            bottom: `${dimensions.bleedPercent}%`,
            left: `${dimensions.bleedPercent}%`
          }}
        >
          {/* Trim label */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-gray-800 text-[9px] px-1.5 py-0.5 rounded font-medium shadow-sm">
            TRIM LINE
          </div>
        </div>
      )}

      {/* Center crosshair for alignment reference */}
      {(showBleed || showSafeZone) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-[1px] bg-white/50" />
          <div className="w-[1px] h-8 bg-white/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

// Corner marker component for safe zone
const SafeZoneCorner: React.FC<{ 
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  offset: number;
}> = ({ position, offset }) => {
  const size = 12;
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { 
      top: `${offset}%`, 
      left: `${offset}%`,
      borderTop: '2px solid',
      borderLeft: '2px solid'
    },
    'top-right': { 
      top: `${offset}%`, 
      right: `${offset}%`,
      borderTop: '2px solid',
      borderRight: '2px solid'
    },
    'bottom-left': { 
      bottom: `${offset}%`, 
      left: `${offset}%`,
      borderBottom: '2px solid',
      borderLeft: '2px solid'
    },
    'bottom-right': { 
      bottom: `${offset}%`, 
      right: `${offset}%`,
      borderBottom: '2px solid',
      borderRight: '2px solid'
    }
  };

  return (
    <div 
      className="absolute border-fuchsia-500"
      style={{ 
        width: size, 
        height: size,
        ...positionStyles[position]
      }}
    />
  );
};

export default BleedSafeZoneOverlay;
