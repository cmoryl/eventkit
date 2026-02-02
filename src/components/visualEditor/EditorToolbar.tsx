// Editor Toolbar - Main toolbar with tools and actions
import React from 'react';
import { 
  MousePointer2, Hand, Type, Square, Undo2, Redo2, 
  ZoomIn, ZoomOut, Maximize2, Download, Save, Grid3X3,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  activeTool: 'select' | 'pan' | 'text' | 'shape';
  onToolChange: (tool: 'select' | 'pan' | 'text' | 'shape') => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onSave: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon, label, shortcut, isActive, onClick, disabled 
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        size="sm"
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'h-9 w-9 p-0',
          isActive && 'bg-primary text-primary-foreground'
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="flex items-center gap-2">
      <span>{label}</span>
      {shortcut && <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">{shortcut}</kbd>}
    </TooltipContent>
  </Tooltip>
);

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onToolChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  onSave,
  showGrid,
  onToggleGrid
}) => {
  const zoomPresets = [
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
    { value: 1.5, label: '150%' },
    { value: 2, label: '200%' },
    { value: 3, label: '300%' },
  ];

  return (
    <div className="h-12 border-b bg-background flex items-center px-3 gap-1">
      {/* Tool Selection */}
      <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
        <ToolButton
          icon={<MousePointer2 className="h-4 w-4" />}
          label="Select"
          shortcut="V"
          isActive={activeTool === 'select'}
          onClick={() => onToolChange('select')}
        />
        <ToolButton
          icon={<Hand className="h-4 w-4" />}
          label="Pan"
          shortcut="H"
          isActive={activeTool === 'pan'}
          onClick={() => onToolChange('pan')}
        />
        <ToolButton
          icon={<Type className="h-4 w-4" />}
          label="Text"
          shortcut="T"
          isActive={activeTool === 'text'}
          onClick={() => onToolChange('text')}
        />
        <ToolButton
          icon={<Square className="h-4 w-4" />}
          label="Shape"
          shortcut="R"
          isActive={activeTool === 'shape'}
          onClick={() => onToolChange('shape')}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <ToolButton
          icon={<Undo2 className="h-4 w-4" />}
          label="Undo"
          shortcut="⌘Z"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ToolButton
          icon={<Redo2 className="h-4 w-4" />}
          label="Redo"
          shortcut="⌘⇧Z"
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => onZoomChange(Math.max(0.1, zoom - 0.25))}
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 min-w-[70px] font-medium gap-1"
            >
              {Math.round(zoom * 100)}%
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[100px]">
            {zoomPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.value}
                onClick={() => onZoomChange(preset.value)}
                className={zoom === preset.value ? 'bg-accent' : ''}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={() => onZoomChange(Math.min(5, zoom + 0.25))}
              disabled={zoom >= 5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onZoomChange(1)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to View</TooltipContent>
        </Tooltip>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Grid Toggle */}
      {onToggleGrid && (
        <ToolButton
          icon={<Grid3X3 className="h-4 w-4" />}
          label="Toggle Grid"
          shortcut="G"
          isActive={showGrid}
          onClick={onToggleGrid}
        />
      )}

      <Separator orientation="vertical" className="h-6 mx-2" />

      {/* Actions */}
      <Button size="sm" variant="outline" className="gap-2" onClick={onSave}>
        <Save className="h-4 w-4" />
        Save
      </Button>
      <Button size="sm" className="gap-2" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
};
