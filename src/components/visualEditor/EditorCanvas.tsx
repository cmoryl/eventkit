// Visual Editor Canvas - Main canvas component with pan/zoom and drag-drop upload
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import type { CanvasState, CanvasElement, Position, SelectionBox } from '@/types/visualEditor.types';

interface EditorCanvasProps {
  state: CanvasState;
  onSelectElements: (ids: string[], addToSelection?: boolean) => void;
  onDeselectAll: () => void;
  onMoveElement: (id: string, position: Position, saveHistory: boolean) => void;
  onResizeElement: (id: string, size: { width: number; height: number }, position: Position | undefined, saveHistory: boolean) => void;
  onRotateElement: (id: string, rotation: number, saveHistory: boolean) => void;
  onEditElement?: (id: string) => void;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Position) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onAddElement: (element: Partial<CanvasElement>) => void;
  activeTool: 'select' | 'pan' | 'text' | 'shape';
}

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  state,
  onSelectElements,
  onDeselectAll,
  onMoveElement,
  onResizeElement,
  onRotateElement,
  onEditElement,
  onZoomChange,
  onPanChange,
  onDragStart,
  onDragEnd,
  onAddElement,
  activeTool
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { width, height, background, elements, selectedIds, zoom, pan } = state;

  // Process dropped image file
  const processImageFile = useCallback((file: File, dropPosition?: Position): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        reject(new Error('Please drop a valid image file (JPG, PNG, GIF, WebP, or SVG)'));
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error('Image must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Get image dimensions
        const img = new window.Image();
        img.onload = () => {
          // Scale down if too large (max 600px on any side for dropped images)
          const maxDimension = 600;
          let scaledWidth = img.naturalWidth;
          let scaledHeight = img.naturalHeight;
          
          if (scaledWidth > maxDimension || scaledHeight > maxDimension) {
            const scale = maxDimension / Math.max(scaledWidth, scaledHeight);
            scaledWidth = Math.round(scaledWidth * scale);
            scaledHeight = Math.round(scaledHeight * scale);
          }
          
          // Calculate position - center at drop point if provided
          const position = dropPosition 
            ? { x: dropPosition.x - scaledWidth / 2, y: dropPosition.y - scaledHeight / 2 }
            : { x: (width - scaledWidth) / 2, y: (height - scaledHeight) / 2 };
          
          onAddElement({
            type: 'image',
            name: file.name.replace(/\.[^/.]+$/, ''),
            src: dataUrl,
            size: { width: scaledWidth, height: scaledHeight },
            position
          });
          
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [width, height, onAddElement]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if files are being dragged
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set to false if leaving the container (not entering a child)
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
    
    if (files.length === 0) {
      toast.error('Please drop image files (JPG, PNG, GIF, WebP, or SVG)');
      return;
    }
    
    // Calculate drop position on canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    let dropPosition: Position | undefined;
    
    if (rect) {
      dropPosition = {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom
      };
    }
    
    // Process all dropped files
    let successCount = 0;
    for (const file of files) {
      try {
        await processImageFile(file, dropPosition);
        successCount++;
        // Offset position for multiple files
        if (dropPosition) {
          dropPosition = { x: dropPosition.x + 30, y: dropPosition.y + 30 };
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add image');
      }
    }
    
    if (successCount > 0) {
      toast.success(`Added ${successCount} image${successCount > 1 ? 's' : ''} to canvas`);
    }
  }, [zoom, processImageFile]);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      onZoomChange(Math.max(0.1, Math.min(5, zoom + delta)));
    } else {
      // Pan with scroll
      onPanChange({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY
      });
    }
  }, [zoom, pan, onZoomChange, onPanChange]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === containerRef.current) {
      onDeselectAll();
    }
  }, [onDeselectAll]);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
    } else if (activeTool === 'select' && e.target === canvasRef.current) {
      // Start selection box
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      }
    }
  }, [activeTool, pan, zoom]);

  // Handle mouse move for pan/selection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && panStartRef.current) {
        onPanChange({
          x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
          y: panStartRef.current.panY + (e.clientY - panStartRef.current.y)
        });
      }
      
      if (isSelecting && selectionBox && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        setSelectionBox(prev => prev ? { ...prev, endX: x, endY: y } : null);
      }
    };
    
    const handleMouseUp = () => {
      if (isSelecting && selectionBox) {
        // Find elements within selection box
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);
        
        const selectedElements = elements.filter(el => {
          const elRight = el.position.x + el.size.width;
          const elBottom = el.position.y + el.size.height;
          return (
            el.position.x < maxX &&
            elRight > minX &&
            el.position.y < maxY &&
            elBottom > minY
          );
        });
        
        if (selectedElements.length > 0) {
          onSelectElements(selectedElements.map(el => el.id));
        }
      }
      
      setIsPanning(false);
      setIsSelecting(false);
      setSelectionBox(null);
      panStartRef.current = null;
    };
    
    if (isPanning || isSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, isSelecting, selectionBox, elements, pan, zoom, onPanChange, onSelectElements]);

  // Render background
  const renderBackground = () => {
    switch (background.type) {
      case 'solid':
        return { backgroundColor: background.value };
      case 'gradient':
        return { background: background.value };
      case 'image':
        return { backgroundImage: `url(${background.value})`, backgroundSize: 'cover' };
      case 'transparent':
        return {
          backgroundImage: `
            repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%)
          `,
          backgroundSize: '20px 20px'
        };
      default:
        return { backgroundColor: '#ffffff' };
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-hidden relative',
        isPanning ? 'cursor-grabbing' : activeTool === 'pan' ? 'cursor-grab' : 'cursor-default'
      )}
      style={{
        backgroundImage: `
          repeating-conic-gradient(#f0f0f0 0% 25%, #fafafa 0% 50%)
        `,
        backgroundSize: '20px 20px'
      }}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border-2 border-dashed border-primary flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Drop images here</p>
              <p className="text-sm text-muted-foreground">JPG, PNG, GIF, WebP, or SVG</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Canvas wrapper for pan/zoom */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Actual canvas */}
        <div
          ref={canvasRef}
          className="relative shadow-2xl"
          style={{
            width,
            height,
            ...renderBackground()
          }}
        >
          {/* Render elements sorted by zIndex */}
          {[...elements]
            .filter(el => !el.parentId) // Don't render children separately
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(element => (
              <CanvasElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                isHovered={hoveredId === element.id}
                zoom={zoom}
                onSelect={(id, addToSelection) => onSelectElements([id], addToSelection)}
                onMove={onMoveElement}
                onResize={onResizeElement}
                onRotate={onRotateElement}
                onDoubleClick={onEditElement}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          
          {/* Selection box */}
          {selectionBox && (
            <div
              className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
              style={{
                left: Math.min(selectionBox.startX, selectionBox.endX),
                top: Math.min(selectionBox.startY, selectionBox.endY),
                width: Math.abs(selectionBox.endX - selectionBox.startX),
                height: Math.abs(selectionBox.endY - selectionBox.startY)
              }}
            />
          )}
        </div>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border shadow-sm text-sm font-medium">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
