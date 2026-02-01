import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Maximize2,
  Minimize2,
  Move
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt?: string;
  title?: string;
  onDownload?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageSrc,
  alt = 'Image preview',
  title,
  onDownload
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 5));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container && isOpen) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Reset zoom when closing
  useEffect(() => {
    if (!isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-md flex flex-col z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border"
          >
            <div className="flex items-center gap-4">
              {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 mr-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="px-3 text-sm font-medium text-foreground min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Reset (0)"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {zoom > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                  <Move className="w-3 h-3" />
                  Drag to pan
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-muted-foreground" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex items-center justify-center p-4 overflow-hidden"
          >
            <div
              className={cn(
                "w-full h-full flex items-center justify-center overflow-hidden",
                zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
              )}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={(e) => {
                if (zoom === 1 && e.detail === 1) {
                  handleZoomIn();
                }
              }}
            >
              <img
                src={imageSrc}
                alt={alt}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                }}
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Footer hints */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-3 bg-card/50 border-t border-border flex items-center justify-center"
          >
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">+</kbd> / <kbd className="px-1.5 py-0.5 bg-secondary rounded">-</kbd> Zoom</span>
              <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">0</kbd> Reset</span>
              <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Ctrl</kbd> + Scroll to zoom</span>
              <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
