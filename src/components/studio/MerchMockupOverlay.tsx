import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MerchMockupOverlayProps {
  assetType: string;
  imageUrl: string;
  className?: string;
}

/** Print zone definition for each product type */
interface PrintZone {
  x: number; y: number; w: number; h: number;
  rx?: number;
  /** For non-rectangular clips (ellipse, rotated) */
  clipType?: 'rect' | 'ellipse' | 'rotated-rect';
  cx?: number; cy?: number; radiusX?: number; radiusY?: number;
  rotation?: number;
}

const PRINT_ZONES: Record<string, PrintZone> = {
  TSHIRT:          { x: 62, y: 65, w: 76, h: 85, rx: 4 },
  TSHIRT_BACK:     { x: 62, y: 65, w: 76, h: 85, rx: 4 },
  TSHIRT_SLEEVE:   { x: 32, y: 48, w: 22, h: 28, rx: 2, clipType: 'rotated-rect', rotation: -10, cx: 43, cy: 62 },
  HAT:             { x: 58, y: 50, w: 84, h: 56, clipType: 'ellipse', cx: 100, cy: 78, radiusX: 42, radiusY: 28 },
  SWAG_BAG:        { x: 55, y: 85, w: 90, h: 85, rx: 3 },
  WATER_BOTTLE:    { x: 22, y: 70, w: 56, h: 80, rx: 6 },
  LANYARD:         { x: 47, y: 10, w: 26, h: 170, rx: 3 },
};

function useDragOffset(zone: PrintZone) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const clamp = (val: number, limit: number) => Math.max(-limit, Math.min(limit, val));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // Convert pixel delta to SVG coordinate delta
    const vb = svg.viewBox.baseVal;
    const scaleX = vb.width / rect.width;
    const scaleY = vb.height / rect.height;
    const dx = (e.clientX - start.current.x) * scaleX;
    const dy = (e.clientY - start.current.y) * scaleY;
    setOffset({
      x: clamp(start.current.ox + dx, zone.w * 0.6),
      y: clamp(start.current.oy + dy, zone.h * 0.6),
    });
  }, [zone]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const reset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return { offset, onPointerDown, onPointerMove, onPointerUp, svgRef, reset, isDragged: offset.x !== 0 || offset.y !== 0 };
}

/** Reusable draggable print zone image */
const DraggableImage: React.FC<{
  zone: PrintZone;
  imageUrl: string;
  clipId: string;
  drag: ReturnType<typeof useDragOffset>;
}> = ({ zone, imageUrl, clipId, drag }) => {
  const imgX = zone.x + drag.offset.x;
  const imgY = zone.y + drag.offset.y;
  const transform = zone.clipType === 'rotated-rect' && zone.rotation
    ? `rotate(${zone.rotation}, ${zone.cx}, ${zone.cy})`
    : undefined;

  return (
    <>
      <clipPath id={clipId}>
        {zone.clipType === 'ellipse' ? (
          <ellipse cx={zone.cx} cy={zone.cy} rx={zone.radiusX} ry={zone.radiusY} />
        ) : (
          <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={zone.rx ?? 0} transform={transform} />
        )}
      </clipPath>
      <image
        href={imageUrl}
        x={imgX} y={imgY}
        width={zone.w} height={zone.h}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
        className="cursor-grab active:cursor-grabbing"
        transform={transform}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
      />
      {/* Print area border */}
      {zone.clipType === 'ellipse' ? (
        <ellipse
          cx={zone.cx} cy={zone.cy} rx={zone.radiusX} ry={zone.radiusY}
          fill="none"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="0.5"
          strokeDasharray="3 2"
        />
      ) : (
        <rect
          x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={zone.rx ?? 0}
          fill="none"
          stroke="hsl(var(--primary) / 0.2)"
          strokeWidth="0.5"
          strokeDasharray="3 2"
          transform={transform}
        />
      )}
    </>
  );
};

const RepositionHint: React.FC<{ isDragged: boolean; onReset: () => void }> = ({ isDragged, onReset }) => (
  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm text-muted-foreground text-[9px] px-1.5 py-0.5 rounded border border-border/50">
      <Move className="w-2.5 h-2.5" />
      Drag to reposition
    </div>
    {isDragged && (
      <button
        onClick={(e) => { e.stopPropagation(); onReset(); }}
        className="bg-background/80 backdrop-blur-sm text-muted-foreground text-[9px] px-1.5 py-0.5 rounded border border-border/50 hover:text-foreground transition-colors"
      >
        Reset
      </button>
    )}
  </div>
);

const MerchMockupOverlay: React.FC<MerchMockupOverlayProps> = ({ assetType, imageUrl }) => {
  const zone = PRINT_ZONES[assetType];
  const drag = useDragOffset(zone ?? PRINT_ZONES.TSHIRT);

  const clipId = `mockup-clip-${assetType}`;

  switch (assetType) {
    case 'TSHIRT':
    case 'TSHIRT_BACK':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            <path d="M30,55 L50,30 L72,42 Q100,52 128,42 L150,30 L170,55 L152,72 L152,195 L48,195 L48,72 Z" fill="hsl(var(--muted-foreground) / 0.08)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M72,42 Q100,56 128,42" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
          </svg>
          <MockupLabel label={assetType === 'TSHIRT' ? 'Front Print' : 'Back Print'} />
        </div>
      );

    case 'TSHIRT_SLEEVE':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            <path d="M30,55 L50,30 L72,42 Q100,52 128,42 L150,30 L170,55 L152,72 L152,195 L48,195 L48,72 Z" fill="hsl(var(--muted-foreground) / 0.08)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M30,55 L48,72 L48,42 L50,30 Z" fill="hsl(var(--primary) / 0.05)" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
          </svg>
          <MockupLabel label="Sleeve Print" />
        </div>
      );

    case 'HAT':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 200 160" className="w-full h-full p-4 drop-shadow-md">
            <path d="M25,115 Q25,50 100,38 Q175,50 175,115" fill="hsl(var(--muted-foreground) / 0.15)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M175,115 Q195,130 165,140 L35,140 Q5,130 25,115" fill="hsl(var(--muted-foreground) / 0.1)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M100,38 L100,115" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
          </svg>
          <MockupLabel label="Cap Mockup" />
        </div>
      );

    case 'SWAG_BAG':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 200 220" className="w-full h-full p-3 drop-shadow-md">
            <rect x="40" y="65" width="120" height="130" rx="3" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <path d="M65,65 Q65,35 82,35 L118,35 Q135,35 135,65" fill="none" stroke="hsl(var(--border))" strokeWidth="3" strokeLinecap="round" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
          </svg>
          <MockupLabel label="Tote Bag" />
        </div>
      );

    case 'WATER_BOTTLE':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 100 220" className="h-full p-4 drop-shadow-md">
            <rect x="33" y="8" width="34" height="22" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" stroke="hsl(var(--border))" strokeWidth="1" />
            <rect x="38" y="30" width="24" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1" />
            <rect x="22" y="42" width="56" height="160" rx="10" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1.5" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
          </svg>
          <MockupLabel label="Bottle Wrap" />
        </div>
      );

    case 'LANYARD':
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 group">
          <RepositionHint isDragged={drag.isDragged} onReset={drag.reset} />
          <svg ref={drag.svgRef} viewBox="0 0 120 220" className="h-full p-4 drop-shadow-md">
            <rect x="47" y="10" width="26" height="170" rx="3" fill="hsl(var(--muted-foreground) / 0.06)" stroke="hsl(var(--border))" strokeWidth="1" />
            <DraggableImage zone={zone} imageUrl={imageUrl} clipId={clipId} drag={drag} />
            <rect x="52" y="180" width="16" height="20" rx="2" fill="hsl(var(--muted-foreground) / 0.25)" stroke="hsl(var(--border))" strokeWidth="1" />
            <circle cx="60" cy="206" r="4" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
          </svg>
          <MockupLabel label="Lanyard" />
        </div>
      );

    case 'STICKER_SHEET':
      return <StickersWithDrag imageUrl={imageUrl} />;

    default:
      return null;
  }
};

/** Sticker sheet has multiple zones — special handling */
const StickersWithDrag: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const stickers = [
    { x: 30, y: 30, w: 65, h: 65, rx: 8 },
    { x: 105, y: 30, w: 65, h: 65, rx: 32 },
    { x: 30, y: 105, w: 65, h: 65, rx: 32 },
    { x: 105, y: 105, w: 65, h: 65, rx: 8 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
      <svg viewBox="0 0 200 200" className="w-full h-full p-4 drop-shadow-md">
        <rect x="20" y="20" width="160" height="160" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        {stickers.map((s, i) => (
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

export const MERCH_MOCKUP_TYPES = new Set([
  'TSHIRT', 'TSHIRT_BACK', 'TSHIRT_SLEEVE',
  'HAT', 'SWAG_BAG', 'WATER_BOTTLE',
  'LANYARD', 'STICKER_SHEET',
]);

export default MerchMockupOverlay;
