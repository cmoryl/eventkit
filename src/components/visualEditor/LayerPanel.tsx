// Layer Panel - Manage layer ordering and visibility
import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { CanvasElement } from '@/types/visualEditor.types';

interface LayerPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelectElement: (id: string, addToSelection: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onReorderElements: (elements: CanvasElement[]) => void;
}

const getElementIcon = (element: CanvasElement) => {
  switch (element.type) {
    case 'text':
      return 'T';
    case 'image':
      return '🖼';
    case 'shape':
      return element.shapeType === 'circle' ? '○' : element.shapeType === 'triangle' ? '△' : '□';
    case 'logo':
      return '◇';
    case 'qrcode':
      return '⊞';
    default:
      return '◻';
  }
};

export const LayerPanel: React.FC<LayerPanelProps> = ({
  elements,
  selectedIds,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onReorderElements
}) => {
  // Reverse elements so top layers appear at top of list
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleReorder = (reorderedElements: CanvasElement[]) => {
    // Update zIndex based on new order (reversed since list is reversed)
    const updatedElements = reorderedElements.map((el, index) => ({
      ...el,
      zIndex: reorderedElements.length - 1 - index
    }));
    onReorderElements(updatedElements);
  };

  return (
    <div className="w-56 border-l bg-background flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Layers</h3>
        <p className="text-xs text-muted-foreground">{elements.length} elements</p>
      </div>

      <ScrollArea className="flex-1">
        <Reorder.Group
          axis="y"
          values={sortedElements}
          onReorder={handleReorder}
          className="p-2 space-y-1"
        >
          {sortedElements.map(element => (
            <Reorder.Item
              key={element.id}
              value={element}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg border cursor-pointer group',
                'hover:bg-muted transition-colors',
                selectedIds.includes(element.id) && 'bg-primary/10 border-primary',
                element.locked && 'opacity-60'
              )}
              onClick={(e) => onSelectElement(element.id, e.shiftKey)}
            >
              {/* Drag Handle */}
              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Element Icon */}
              <div 
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
                style={{ 
                  backgroundColor: element.style.fill || '#e5e5e5',
                  color: element.type === 'text' ? '#fff' : undefined
                }}
              >
                {getElementIcon(element)}
              </div>

              {/* Element Name */}
              <span className="flex-1 text-sm truncate">{element.name}</span>

              {/* Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateElement(element.id, { visible: !element.visible });
                  }}
                >
                  {element.visible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateElement(element.id, { locked: !element.locked });
                  }}
                >
                  {element.locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteElement(element.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {elements.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No elements yet. Add elements from the sidebar.
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
