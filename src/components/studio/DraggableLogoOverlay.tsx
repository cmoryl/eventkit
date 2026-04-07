import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Move, RotateCcw, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface LogoPlacement {
  /** X position as fraction of image width (0-1) */
  x: number;
  /** Y position as fraction of image height (0-1) */
  y: number;
  /** Scale as fraction of image width (0-1) */
  scale: number;
}

interface DraggableLogoOverlayProps {
  logoUrl: string;
  /** Container dimensions in CSS pixels */
  containerWidth: number;
  containerHeight: number;
  /** Initial placement */
  initialPlacement: LogoPlacement;
  /** Called on every placement change */
  onPlacementChange: (placement: LogoPlacement) => void;
  /** Zoom level of the preview (for coordinate mapping) */
  zoomScale?: number;
  className?: string;
}

export const DraggableLogoOverlay: React.FC<DraggableLogoOverlayProps> = ({
  logoUrl,
  containerWidth,
  containerHeight,
  initialPlacement,
  onPlacementChange,
  zoomScale = 1,
  className,
}) => {
  const [placement, setPlacement] = useState<LogoPlacement>(initialPlacement);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [logoNaturalSize, setLogoNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlacement(initialPlacement);
  }, [initialPlacement.x, initialPlacement.y, initialPlacement.scale]);

  // Compute pixel positions from fractional placement
  const logoPixelWidth = containerWidth * placement.scale;
  const logoAspect = logoNaturalSize ? logoNaturalSize.w / logoNaturalSize.h : 1;
  const logoPixelHeight = logoPixelWidth / logoAspect;
  const pixelX = placement.x * containerWidth;
  const pixelY = placement.y * containerHeight;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = placement.x;
    const startY = placement.y;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startMouseX) / containerWidth;
      const dy = (ev.clientY - startMouseY) / containerHeight;
      const newX = Math.max(0, Math.min(1 - placement.scale, startX + dx));
      const newY = Math.max(0, Math.min(1 - (logoPixelHeight / containerHeight), startY + dy));
      const next = { ...placement, x: newX, y: newY };
      setPlacement(next);
      onPlacementChange(next);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [isLocked, placement, containerWidth, containerHeight, logoPixelHeight, onPlacementChange]);

  const handleScaleChange = useCallback((val: number[]) => {
    const next = { ...placement, scale: val[0] };
    setPlacement(next);
    onPlacementChange(next);
  }, [placement, onPlacementChange]);

  const handleReset = useCallback(() => {
    setPlacement(initialPlacement);
    onPlacementChange(initialPlacement);
  }, [initialPlacement, onPlacementChange]);

  if (!isVisible) {
    return (
      <div className={cn('absolute top-2 right-2 z-30', className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
              onClick={() => setIsVisible(true)}
            >
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Show logo overlay</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <>
      {/* Draggable Logo */}
      <div
        ref={overlayRef}
        className={cn(
          'absolute z-20 select-none',
          isDragging ? 'cursor-grabbing' : isLocked ? 'cursor-default' : 'cursor-grab',
          !isLocked && 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-1',
          isDragging && 'ring-2 ring-primary ring-offset-1',
          className,
        )}
        style={{
          left: pixelX,
          top: pixelY,
          width: logoPixelWidth,
          height: logoPixelHeight,
          transition: isDragging ? 'none' : 'left 0.15s, top 0.15s, width 0.15s, height 0.15s',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* White backing plate */}
        <div className="absolute inset-[-8%] rounded-md bg-white/70 pointer-events-none" />
        <img
          src={logoUrl}
          alt="Logo overlay"
          className="relative w-full h-full object-contain pointer-events-none"
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            setLogoNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />
        {/* Drag indicator */}
        {!isLocked && !isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[9px] font-medium flex items-center gap-1 whitespace-nowrap pointer-events-none"
          >
            <Move className="h-2.5 w-2.5" />
            Drag to move
          </motion.div>
        )}
      </div>

      {/* Controls toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mr-1">Logo</span>

        {/* Scale slider */}
        <div className="flex items-center gap-2 w-28">
          <span className="text-[10px] text-muted-foreground">Size</span>
          <Slider
            value={[placement.scale]}
            onValueChange={handleScaleChange}
            min={0.05}
            max={0.5}
            step={0.01}
            className="flex-1"
          />
          <span className="text-[10px] text-muted-foreground w-7 text-right">{Math.round(placement.scale * 100)}%</span>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Lock toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isLocked ? 'secondary' : 'ghost'}
              className="h-7 w-7 p-0"
              onClick={() => setIsLocked(l => !l)}
            >
              {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isLocked ? 'Unlock logo' : 'Lock logo position'}</TooltipContent>
        </Tooltip>

        {/* Visibility toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setIsVisible(false)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hide logo overlay</TooltipContent>
        </Tooltip>

        {/* Reset */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset to default position</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
