import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, RotateCcw, Eye, EyeOff, Lock, Unlock, Grid3X3, ArrowUpLeft, ArrowUp, ArrowUpRight, Crosshair, ArrowDownLeft, ArrowDown, ArrowDownRight, History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlignmentGuides } from './AlignmentGuides';
import { snapToGuides, type SnapGuide } from './logoSnapping';

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
  containerWidth: number;
  containerHeight: number;
  initialPlacement: LogoPlacement;
  onPlacementChange: (placement: LogoPlacement) => void;
  zoomScale?: number;
  restoredFromSession?: boolean;
  onClearSavedPlacement?: () => void;
  className?: string;
}

export const DraggableLogoOverlay: React.FC<DraggableLogoOverlayProps> = ({
  logoUrl,
  containerWidth,
  containerHeight,
  initialPlacement,
  onPlacementChange,
  restoredFromSession = false,
  onClearSavedPlacement,
  className,
}) => {
  const [placement, setPlacement] = useState<LogoPlacement>(initialPlacement);
  const [showRestoredBadge, setShowRestoredBadge] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [logoNaturalSize, setLogoNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlacement(initialPlacement);
  }, [initialPlacement.x, initialPlacement.y, initialPlacement.scale]);

  // Clear guides when not dragging
  useEffect(() => {
    if (!isDragging) setActiveGuides([]);
  }, [isDragging]);

  // Show restored badge briefly
  useEffect(() => {
    if (restoredFromSession) {
      setShowRestoredBadge(true);
      const t = setTimeout(() => setShowRestoredBadge(false), 4000);
      return () => clearTimeout(t);
    }
  }, [restoredFromSession]);

  const logoPixelWidth = containerWidth * placement.scale;
  const logoAspect = logoNaturalSize ? logoNaturalSize.w / logoNaturalSize.h : 1;
  const logoPixelHeight = logoPixelWidth / logoAspect;
  const logoHeightFrac = logoPixelHeight / containerHeight;
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
    const currentScale = placement.scale;
    const hFrac = logoPixelHeight / containerHeight;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startMouseX) / containerWidth;
      const dy = (ev.clientY - startMouseY) / containerHeight;
      let newX = Math.max(0, Math.min(1 - currentScale, startX + dx));
      let newY = Math.max(0, Math.min(1 - hFrac, startY + dy));

      let guides: SnapGuide[] = [];
      if (snapEnabled) {
        const snap = snapToGuides(newX, newY, currentScale, hFrac);
        newX = Math.max(0, Math.min(1 - currentScale, snap.x));
        newY = Math.max(0, Math.min(1 - hFrac, snap.y));
        guides = snap.activeGuides;
      }
      setActiveGuides(guides);

      const next = { ...placement, x: newX, y: newY };
      setPlacement(next);
      onPlacementChange(next);
    };

    const onUp = () => {
      setIsDragging(false);
      setActiveGuides([]);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [isLocked, placement, containerWidth, containerHeight, logoPixelHeight, onPlacementChange, snapEnabled]);

  const handleScaleChange = useCallback((val: number[]) => {
    const next = { ...placement, scale: val[0] };
    setPlacement(next);
    onPlacementChange(next);
  }, [placement, onPlacementChange]);

  const handleReset = useCallback(() => {
    setPlacement(initialPlacement);
    onPlacementChange(initialPlacement);
  }, [initialPlacement, onPlacementChange]);

  const handlePresetPosition = useCallback((preset: 'tl' | 'tc' | 'tr' | 'cl' | 'cc' | 'cr' | 'bl' | 'bc' | 'br') => {
    const hFrac = logoPixelHeight / containerHeight;
    const margin = 0.05;
    const posMap: Record<string, { x: number; y: number }> = {
      tl: { x: margin, y: margin },
      tc: { x: (1 - placement.scale) / 2, y: margin },
      tr: { x: 1 - placement.scale - margin, y: margin },
      cl: { x: margin, y: (1 - hFrac) / 2 },
      cc: { x: (1 - placement.scale) / 2, y: (1 - hFrac) / 2 },
      cr: { x: 1 - placement.scale - margin, y: (1 - hFrac) / 2 },
      bl: { x: margin, y: 1 - hFrac - margin },
      bc: { x: (1 - placement.scale) / 2, y: 1 - hFrac - margin },
      br: { x: 1 - placement.scale - margin, y: 1 - hFrac - margin },
    };
    const pos = posMap[preset];
    const next = { ...placement, x: Math.max(0, pos.x), y: Math.max(0, pos.y) };
    setPlacement(next);
    onPlacementChange(next);
  }, [placement, containerHeight, logoPixelHeight, onPlacementChange]);

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
      {/* Alignment guides */}
      <AlignmentGuides
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        activeGuides={activeGuides}
        showAll={isDragging && snapEnabled}
      />

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
        <AnimatePresence>
          {showRestoredBadge && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-[9px] font-medium flex items-center gap-1 whitespace-nowrap pointer-events-none shadow-sm border border-border"
            >
              <History className="h-2.5 w-2.5" />
              Restored from last session
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mr-1">Logo</span>

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

        {/* Snap toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={snapEnabled ? 'secondary' : 'ghost'}
              className="h-7 w-7 p-0"
              onClick={() => setSnapEnabled(s => !s)}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{snapEnabled ? 'Disable snap guides' : 'Enable snap guides'}</TooltipContent>
        </Tooltip>

        {/* Preset positions */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Crosshair className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>Preset positions</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-2" side="top" align="center">
            <p className="text-[10px] font-medium text-muted-foreground mb-1.5 text-center">Quick position</p>
            <div className="grid grid-cols-3 gap-1">
              {([
                ['tl', ArrowUpLeft], ['tc', ArrowUp], ['tr', ArrowUpRight],
                ['cl', ArrowUpLeft, 90], ['cc', Crosshair], ['cr', ArrowUpRight, -90],
                ['bl', ArrowDownLeft], ['bc', ArrowDown], ['br', ArrowDownRight],
              ] as const).map(([key, Icon, rotate]) => (
                <Button
                  key={key}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePresetPosition(key as any)}
                >
                  <Icon className="h-3.5 w-3.5" style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined} />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

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

        {/* Clear saved placement */}
        {onClearSavedPlacement && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => {
                  onClearSavedPlacement();
                  handleReset();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear saved placement</TooltipContent>
          </Tooltip>
        )}
      </div>
    </>
  );
};
