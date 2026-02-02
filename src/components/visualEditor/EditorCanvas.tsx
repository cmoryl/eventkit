// Visual Editor Canvas - Main canvas component with pan/zoom
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import type { CanvasState, Position, SelectionBox } from '@/types/visualEditor.types';

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
  activeTool: 'select' | 'pan' | 'text' | 'shape';
}

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
  activeTool
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { width, height, background, elements, selectedIds, zoom, pan } = state;

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
    >
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
