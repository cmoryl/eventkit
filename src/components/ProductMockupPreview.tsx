import React from 'react';
import { AssetType } from '../types';

interface ProductMockupPreviewProps {
  assetType: AssetType;
  imageUrl: string;
  className?: string;
}

const ProductMockupPreview: React.FC<ProductMockupPreviewProps> = ({ 
  assetType, 
  imageUrl,
  className = ''
}) => {
  // Render product-specific mockup previews
  const renderMockup = () => {
    switch (assetType) {
      case AssetType.Tshirt:
      case AssetType.TshirtBack:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              {/* T-Shirt shape */}
              <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                <defs>
                  <clipPath id="tshirt-clip">
                    <path d="M30,50 L50,30 L75,40 Q100,50 125,40 L150,30 L170,50 L150,70 L150,180 L50,180 L50,70 L30,50 Z" />
                  </clipPath>
                </defs>
                {/* T-Shirt body */}
                <path 
                  d="M30,50 L50,30 L75,40 Q100,50 125,40 L150,30 L170,50 L150,70 L150,180 L50,180 L50,70 L30,50 Z" 
                  fill="white" 
                  stroke="#e5e7eb" 
                  strokeWidth="2"
                />
                {/* Print area */}
                <image 
                  href={imageUrl} 
                  x="65" 
                  y="60" 
                  width="70" 
                  height="80" 
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              T-Shirt Mockup
            </div>
          </div>
        );

      case AssetType.Hat:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 150" className="w-full h-full p-6">
                {/* Cap shape */}
                <ellipse cx="100" cy="120" rx="80" ry="20" fill="#1f2937" />
                <path d="M20,110 Q20,50 100,40 Q180,50 180,110" fill="#374151" stroke="#1f2937" strokeWidth="2"/>
                {/* Brim */}
                <path d="M180,110 Q200,130 160,140 L40,140 Q0,130 20,110" fill="#4b5563" stroke="#1f2937" strokeWidth="2"/>
                {/* Logo area */}
                <image 
                  href={imageUrl} 
                  x="60" 
                  y="55" 
                  width="80" 
                  height="40" 
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Hat Mockup
            </div>
          </div>
        );

      case AssetType.Lanyard:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-[1/2] max-h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-8 h-full">
                {/* Lanyard strap */}
                <div 
                  className="absolute inset-0 rounded-sm"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {/* Metal clip */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Lanyard Mockup
            </div>
          </div>
        );

      case AssetType.SwagBag:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                {/* Bag body */}
                <path d="M40,60 L40,180 L160,180 L160,60 L40,60" fill="#f5f5dc" stroke="#d4d4c4" strokeWidth="2"/>
                {/* Handles */}
                <path d="M60,60 Q60,30 80,30 L120,30 Q140,30 140,60" fill="none" stroke="#d4d4c4" strokeWidth="4"/>
                {/* Print */}
                <image 
                  href={imageUrl} 
                  x="55" 
                  y="80" 
                  width="90" 
                  height="80" 
                  preserveAspectRatio="xMidYMid meet"
                />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Tote Bag Mockup
            </div>
          </div>
        );

      case AssetType.WaterBottle:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-[1/2] max-h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 80 200" className="h-full p-4">
                {/* Cap */}
                <rect x="25" y="5" width="30" height="20" rx="3" fill="#374151"/>
                {/* Neck */}
                <rect x="30" y="25" width="20" height="10" fill="#e5e7eb"/>
                {/* Body */}
                <rect x="15" y="35" width="50" height="155" rx="8" fill="#e5e7eb"/>
                {/* Label wrap area */}
                <foreignObject x="15" y="60" width="50" height="80">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '4px'
                    }}
                  />
                </foreignObject>
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Water Bottle Mockup
            </div>
          </div>
        );

      case AssetType.NameTag:
      case AssetType.NameTagBack:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-6">
              <div className="relative w-full h-full">
                {/* Badge with lanyard hole */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-gray-300 bg-white" />
                <div 
                  className="absolute inset-0 mt-4 rounded-lg shadow-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Name Badge Mockup
            </div>
          </div>
        );

      case AssetType.Banner:
      case AssetType.StandUpPillarBanner:
        return (
          <div className={`relative ${className}`}>
            <div className="aspect-[1/2.5] max-h-72 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-full h-full flex flex-col items-center">
                {/* Banner frame */}
                <div className="w-2 h-4 bg-gray-400 rounded-t" />
                <div 
                  className="flex-1 w-full rounded shadow-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {/* Base */}
                <div className="w-16 h-2 bg-gray-500 rounded mt-1" />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground">
              Roll-up Banner Mockup
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const mockup = renderMockup();
  
  if (!mockup) return null;

  return mockup;
};

export default ProductMockupPreview;
