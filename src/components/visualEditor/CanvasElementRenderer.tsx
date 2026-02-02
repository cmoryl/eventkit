// Canvas Element Component - Renders individual elements with selection/transform handles
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CanvasElement, Position, Size, ResizeHandle } from '@/types/visualEditor.types';

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  isHovered: boolean;
  zoom: number;
  onSelect: (id: string, addToSelection: boolean) => void;
  onMove: (id: string, position: Position, saveHistory: boolean) => void;
  onResize: (id: string, size: Size, position: Position | undefined, saveHistory: boolean) => void;
  onRotate: (id: string, rotation: number, saveHistory: boolean) => void;
  onDoubleClick?: (id: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const HANDLE_SIZE = 8;
const ROTATION_HANDLE_OFFSET = 30;

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  isSelected,
  isHovered,
  zoom,
  onSelect,
  onMove,
  onResize,
  onRotate,
  onDoubleClick,
  onDragStart,
  onDragEnd
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
  const resizeStartRef = useRef<{ 
    mouseX: number; 
    mouseY: number; 
    width: number; 
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const rotateStartRef = useRef<{ 
    centerX: number; 
    centerY: number; 
    startAngle: number;
    initialRotation: number;
  } | null>(null);

  if (!element.visible) return null;

  const { position, size, transform, style, type, content, src, shapeType, textStyle } = element;

  // Handle mouse down on element
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.locked) return;
    e.stopPropagation();
    
    onSelect(element.id, e.shiftKey);
    
    if (!isResizing && !isRotating) {
      setIsDragging(true);
      onDragStart();
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: position.x,
        elementY: position.y
      };
    }
  }, [element.id, element.locked, position, isResizing, isRotating, onSelect, onDragStart]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    if (element.locked) return;
    e.stopPropagation();
    e.preventDefault();
    
    setIsResizing(true);
    setActiveHandle(handle);
    onDragStart();
    
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: size.width,
      height: size.height,
      x: position.x,
      y: position.y
    };
  }, [element.locked, size, position, onDragStart]);

  // Handle rotation start
  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    if (element.locked || !elementRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    
    setIsRotating(true);
    onDragStart();
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    rotateStartRef.current = {
      centerX,
      centerY,
      startAngle,
      initialRotation: transform.rotation
    };
  }, [element.locked, transform.rotation, onDragStart]);

  // Handle mouse move for drag/resize/rotate
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        
        onMove(element.id, {
          x: dragStartRef.current.elementX + dx,
          y: dragStartRef.current.elementY + dy
        }, false);
      }
      
      if (isResizing && resizeStartRef.current && activeHandle) {
        const dx = (e.clientX - resizeStartRef.current.mouseX) / zoom;
        const dy = (e.clientY - resizeStartRef.current.mouseY) / zoom;
        
        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        let newX = resizeStartRef.current.x;
        let newY = resizeStartRef.current.y;
        
        // Calculate new dimensions based on handle
        switch (activeHandle) {
          case 'right':
            newWidth = Math.max(20, resizeStartRef.current.width + dx);
            break;
          case 'left':
            newWidth = Math.max(20, resizeStartRef.current.width - dx);
            newX = resizeStartRef.current.x + (resizeStartRef.current.width - newWidth);
            break;
          case 'bottom':
            newHeight = Math.max(20, resizeStartRef.current.height + dy);
            break;
          case 'top':
            newHeight = Math.max(20, resizeStartRef.current.height - dy);
            newY = resizeStartRef.current.y + (resizeStartRef.current.height - newHeight);
            break;
          case 'bottom-right':
            newWidth = Math.max(20, resizeStartRef.current.width + dx);
            newHeight = Math.max(20, resizeStartRef.current.height + dy);
            break;
          case 'bottom-left':
            newWidth = Math.max(20, resizeStartRef.current.width - dx);
            newHeight = Math.max(20, resizeStartRef.current.height + dy);
            newX = resizeStartRef.current.x + (resizeStartRef.current.width - newWidth);
            break;
          case 'top-right':
            newWidth = Math.max(20, resizeStartRef.current.width + dx);
            newHeight = Math.max(20, resizeStartRef.current.height - dy);
            newY = resizeStartRef.current.y + (resizeStartRef.current.height - newHeight);
            break;
          case 'top-left':
            newWidth = Math.max(20, resizeStartRef.current.width - dx);
            newHeight = Math.max(20, resizeStartRef.current.height - dy);
            newX = resizeStartRef.current.x + (resizeStartRef.current.width - newWidth);
            newY = resizeStartRef.current.y + (resizeStartRef.current.height - newHeight);
            break;
        }
        
        // Maintain aspect ratio if shift is held
        if (e.shiftKey) {
          const aspectRatio = resizeStartRef.current.width / resizeStartRef.current.height;
          if (activeHandle.includes('left') || activeHandle.includes('right')) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }
        
        onResize(
          element.id, 
          { width: newWidth, height: newHeight },
          { x: newX, y: newY },
          false
        );
      }
      
      if (isRotating && rotateStartRef.current) {
        const { centerX, centerY, startAngle, initialRotation } = rotateStartRef.current;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let rotation = initialRotation + ((currentAngle - startAngle) * 180) / Math.PI;
        
        // Snap to 15 degree increments if shift is held
        if (e.shiftKey) {
          rotation = Math.round(rotation / 15) * 15;
        }
        
        onRotate(element.id, rotation, false);
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        onMove(element.id, position, true);
      }
      if (isResizing) {
        onResize(element.id, size, position, true);
      }
      if (isRotating) {
        onRotate(element.id, transform.rotation, true);
      }
      
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setActiveHandle(null);
      dragStartRef.current = null;
      resizeStartRef.current = null;
      rotateStartRef.current = null;
      onDragEnd();
    };
    
    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, activeHandle, zoom, element.id, position, size, transform.rotation, onMove, onResize, onRotate, onDragEnd]);

  // Render element content based on type
  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              fontFamily: textStyle?.fontFamily || 'Inter',
              fontSize: textStyle?.fontSize || 16,
              fontWeight: textStyle?.fontWeight || 'normal',
              fontStyle: textStyle?.fontStyle || 'normal',
              textAlign: textStyle?.textAlign || 'center',
              color: style.fill || '#000000',
              textDecoration: textStyle?.textDecoration || 'none',
              lineHeight: textStyle?.lineHeight || 1.5,
              letterSpacing: textStyle?.letterSpacing || 0,
              textTransform: textStyle?.textTransform || 'none'
            }}
          >
            {content || 'Double-click to edit'}
          </div>
        );
      
      case 'image':
        return src ? (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ borderRadius: style.borderRadius }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
            Drop image
          </div>
        );
      
      case 'shape':
        if (shapeType === 'circle') {
          return (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: style.fill || '#3b82f6',
                border: style.stroke ? `${style.strokeWidth || 1}px solid ${style.stroke}` : undefined
              }}
            />
          );
        }
        if (shapeType === 'triangle') {
          return (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon 
                points="50,0 100,100 0,100" 
                fill={style.fill || '#3b82f6'}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
              />
            </svg>
          );
        }
        // Default rectangle
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: style.fill || '#3b82f6',
              borderRadius: style.borderRadius,
              border: style.stroke ? `${style.strokeWidth || 1}px solid ${style.stroke}` : undefined
            }}
          />
        );
      
      case 'logo':
        return src ? (
          <img
            src={src}
            alt="Logo"
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm border-2 border-dashed">
            Logo
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-muted" />
        );
    }
  };

  // Resize handles positions
  const handles: { handle: ResizeHandle; className: string }[] = [
    { handle: 'top-left', className: '-top-1 -left-1 cursor-nwse-resize' },
    { handle: 'top', className: '-top-1 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { handle: 'top-right', className: '-top-1 -right-1 cursor-nesw-resize' },
    { handle: 'left', className: 'top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize' },
    { handle: 'right', className: 'top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize' },
    { handle: 'bottom-left', className: '-bottom-1 -left-1 cursor-nesw-resize' },
    { handle: 'bottom', className: '-bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize' },
    { handle: 'bottom-right', className: '-bottom-1 -right-1 cursor-nwse-resize' }
  ];

  return (
    <div
      ref={elementRef}
      className={cn(
        'absolute select-none',
        element.locked && 'pointer-events-none',
        isDragging && 'cursor-grabbing',
        !isDragging && !element.locked && 'cursor-grab'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${transform.rotation}deg) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`,
        transformOrigin: 'center center',
        opacity: style.opacity ?? 1,
        zIndex: element.zIndex,
        filter: style.blur ? `blur(${style.blur}px)` : undefined,
        boxShadow: style.shadow 
          ? `${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.spread}px ${style.shadow.color}`
          : undefined
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => onDoubleClick?.(element.id)}
    >
      {/* Element content */}
      {renderContent()}
      
      {/* Selection outline */}
      {(isSelected || isHovered) && !element.locked && (
        <div 
          className={cn(
            'absolute inset-0 pointer-events-none border-2',
            isSelected ? 'border-primary' : 'border-primary/50'
          )}
          style={{ borderRadius: style.borderRadius }}
        />
      )}
      
      {/* Resize handles */}
      {isSelected && !element.locked && (
        <>
          {handles.map(({ handle, className }) => (
            <div
              key={handle}
              className={cn(
                'absolute bg-white border-2 border-primary rounded-sm',
                className
              )}
              style={{ width: HANDLE_SIZE, height: HANDLE_SIZE }}
              onMouseDown={(e) => handleResizeStart(e, handle)}
            />
          ))}
          
          {/* Rotation handle */}
          <div
            className="absolute left-1/2 -translate-x-1/2 cursor-grab"
            style={{ top: -ROTATION_HANDLE_OFFSET }}
            onMouseDown={handleRotateStart}
          >
            <div className="w-0.5 h-5 bg-primary mx-auto" />
            <div 
              className="w-3 h-3 rounded-full bg-white border-2 border-primary -mt-0.5"
            />
          </div>
        </>
      )}
    </div>
  );
};
