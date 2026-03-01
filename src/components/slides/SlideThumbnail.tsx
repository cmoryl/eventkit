import React from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SlideThumbnailProps {
  slideNumber: number;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  isDragOver?: boolean;
  dragPosition?: 'above' | 'below' | null;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function SlideThumbnail({
  slideNumber,
  isActive = false,
  onClick,
  children,
  dragPosition,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: SlideThumbnailProps) {
  return (
    <div
      className="group relative"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop indicator above */}
      <div
        className={cn(
          'absolute -top-1.5 left-6 right-0 h-0.5 rounded-full transition-colors z-10',
          dragPosition === 'above' ? 'bg-primary' : 'bg-transparent'
        )}
      />
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-xs text-muted-foreground font-mono">{slideNumber}</span>
          <GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
        </div>
        <div
          className={cn(
            'relative flex-1 aspect-video bg-white dark:bg-slate-900 rounded-md overflow-hidden border cursor-pointer transition-opacity',
            isActive ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'
          )}
          onClick={onClick}
        >
          <div className="absolute inset-0 bg-white dark:bg-slate-900" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none isolate">
            <div className="origin-top-left" style={{ transform: 'scale(0.125)', width: '800%', height: '800%' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
      {/* Drop indicator below */}
      <div
        className={cn(
          'absolute -bottom-1.5 left-6 right-0 h-0.5 rounded-full transition-colors z-10',
          dragPosition === 'below' ? 'bg-primary' : 'bg-transparent'
        )}
      />
    </div>
  );
}
