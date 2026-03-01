import React from 'react';
import { motion } from 'framer-motion';

interface MerchMockupOverlayProps {
  assetType: string;
  imageUrl: string;
  className?: string;
}

/**
 * Renders a realistic product mockup preview for merch items.
 * Used inline in the StudioAssetGrid cards to show designs in context.
 */
const MerchMockupOverlay: React.FC<MerchMockupOverlayProps> = ({ assetType, imageUrl }) => {
  switch (assetType) {
    case 'TSHIRT':
    case 'TSHIRT_BACK':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            {/* T-Shirt silhouette */}
            <path
              d="M30,55 L50,30 L72,42 Q100,52 128,42 L150,30 L170,55 L152,72 L152,195 L48,195 L48,72 Z"
              fill="hsl(var(--muted-foreground) / 0.08)"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Collar */}
            <path
              d="M72,42 Q100,56 128,42"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Design print area */}
            <clipPath id={`tshirt-clip-${assetType}`}>
              <rect x="62" y="65" width="76" height="85" rx="4" />
            </clipPath>
            <image
              href={imageUrl}
              x="62" y="65"
              width="76" height="85"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#tshirt-clip-${assetType})`}
              className="drop-shadow-sm"
            />
            {/* Print area border */}
            <rect
              x="62" y="65" width="76" height="85" rx="4"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
          </svg>
          <MockupLabel label={assetType === 'TSHIRT' ? 'Front Print' : 'Back Print'} />
        </div>
      );

    case 'TSHIRT_SLEEVE':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            <path
              d="M30,55 L50,30 L72,42 Q100,52 128,42 L150,30 L170,55 L152,72 L152,195 L48,195 L48,72 Z"
              fill="hsl(var(--muted-foreground) / 0.08)"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Left sleeve highlight */}
            <path d="M30,55 L48,72 L48,42 L50,30 Z" fill="hsl(var(--primary) / 0.05)" />
            {/* Sleeve print area */}
            <clipPath id="sleeve-clip">
              <rect x="32" y="48" width="22" height="28" rx="2" transform="rotate(-10, 43, 62)" />
            </clipPath>
            <image
              href={imageUrl}
              x="32" y="48"
              width="22" height="28"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#sleeve-clip)"
              transform="rotate(-10, 43, 62)"
            />
            <rect
              x="32" y="48" width="22" height="28" rx="2"
              fill="none"
              stroke="hsl(var(--primary) / 0.3)"
              strokeWidth="0.5"
              strokeDasharray="2 1"
              transform="rotate(-10, 43, 62)"
            />
          </svg>
          <MockupLabel label="Sleeve Print" />
        </div>
      );

    case 'HAT':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 200 160" className="w-full h-full p-4 drop-shadow-md">
            {/* Cap body */}
            <path
              d="M25,115 Q25,50 100,38 Q175,50 175,115"
              fill="hsl(var(--muted-foreground) / 0.15)"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Brim */}
            <path
              d="M175,115 Q195,130 165,140 L35,140 Q5,130 25,115"
              fill="hsl(var(--muted-foreground) / 0.1)"
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Front panel seam */}
            <path d="M100,38 L100,115" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            {/* Logo area */}
            <clipPath id="hat-clip">
              <ellipse cx="100" cy="78" rx="42" ry="28" />
            </clipPath>
            <image
              href={imageUrl}
              x="58" y="50"
              width="84" height="56"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#hat-clip)"
            />
            <ellipse
              cx="100" cy="78" rx="42" ry="28"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
          </svg>
          <MockupLabel label="Cap Mockup" />
        </div>
      );

    case 'SWAG_BAG':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            {/* Bag body */}
            <rect x="40" y="65" width="120" height="130" rx="3" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Handles */}
            <path d="M65,65 Q65,35 82,35 L118,35 Q135,35 135,65" fill="none" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
            {/* Print area */}
            <clipPath id="bag-clip">
              <rect x="55" y="85" width="90" height="85" rx="3" />
            </clipPath>
            <image
              href={imageUrl}
              x="55" y="85"
              width="90" height="85"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#bag-clip)"
            />
            <rect
              x="55" y="85" width="90" height="85" rx="3"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="0.5"
              strokeDasharray="3 2"
            />
          </svg>
          <MockupLabel label="Tote Bag" />
        </div>
      );

    case 'WATER_BOTTLE':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 100 220" className="h-full p-4 drop-shadow-md">
            {/* Cap */}
            <rect x="33" y="8" width="34" height="22" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" stroke="hsl(var(--border))" strokeWidth="1" />
            {/* Neck */}
            <rect x="38" y="30" width="24" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1" />
            {/* Body */}
            <rect x="22" y="42" width="56" height="160" rx="10" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Label wrap */}
            <clipPath id="bottle-clip">
              <rect x="22" y="70" width="56" height="80" rx="6" />
            </clipPath>
            <image
              href={imageUrl}
              x="22" y="70"
              width="56" height="80"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#bottle-clip)"
            />
            <rect
              x="22" y="70" width="56" height="80" rx="6"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          </svg>
          <MockupLabel label="Bottle Wrap" />
        </div>
      );

    case 'LANYARD':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 120 220" className="h-full p-4 drop-shadow-md">
            {/* Lanyard strap */}
            <rect x="47" y="10" width="26" height="170" rx="3" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1" />
            {/* Design on strap */}
            <clipPath id="lanyard-clip">
              <rect x="47" y="10" width="26" height="170" rx="3" />
            </clipPath>
            <image
              href={imageUrl}
              x="47" y="10"
              width="26" height="170"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#lanyard-clip)"
              opacity="0.9"
            />
            {/* Metal clip */}
            <rect x="52" y="180" width="16" height="20" rx="2" fill="hsl(var(--muted-foreground) / 0.25)" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="60" cy="206" r="4" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
          </svg>
          <MockupLabel label="Lanyard" />
        </div>
      );

    case 'STICKER_SHEET':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
          <svg viewBox="0 0 200 200" className="w-full h-full p-4 drop-shadow-md">
            {/* Sheet background */}
            <rect x="20" y="20" width="160" height="160" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" />
            {/* Sticker slots with image */}
            {[
              { x: 30, y: 30, w: 65, h: 65, rx: 8 },
              { x: 105, y: 30, w: 65, h: 65, rx: 32 },
              { x: 30, y: 105, w: 65, h: 65, rx: 32 },
              { x: 105, y: 105, w: 65, h: 65, rx: 8 },
            ].map((s, i) => (
              <g key={i}>
                <clipPath id={`sticker-${i}`}>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />
                </clipPath>
                <image
                  href={imageUrl}
                  x={s.x} y={s.y}
                  width={s.w} height={s.h}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#sticker-${i})`}
                />
                <rect
                  x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
              </g>
            ))}
          </svg>
          <MockupLabel label="Sticker Sheet" />
        </div>
      );

    default:
      return null;
  }
};

const MockupLabel: React.FC<{ label: string }> = ({ label }) => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute bottom-2 left-2 text-[10px] font-medium bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-md text-muted-foreground border border-border/50"
  >
    {label}
  </motion.div>
);

// Asset types that support mockup preview
export const MERCH_MOCKUP_TYPES = new Set([
  'TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE',
  'HAT', 'SWAG_BAG', 'WATER_BOTTLE',
  'LANYARD', 'STICKER_SHEET',
]);

export default MerchMockupOverlay;
