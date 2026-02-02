// Visual Editor - Main component combining all parts
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Layers, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useVisualEditor } from '@/hooks/useVisualEditor';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { ElementSidebar } from './ElementSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { LayerPanel } from './LayerPanel';
import { TemplateGallery } from './TemplateGallery';
import type { CanvasElement, CanvasState } from '@/types/visualEditor.types';

interface VisualEditorProps {
  isOpen: boolean;
  onClose: () => void;
  assetType?: string;
  assetName?: string;
  initialWidth?: number;
  initialHeight?: number;
  brandColors?: string[];
  onSave?: (state: CanvasState) => void;
  onExport?: (state: CanvasState) => void;
  showTemplatesOnOpen?: boolean;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  isOpen,
  onClose,
  assetType,
  assetName,
  initialWidth = 1080,
  initialHeight = 1080,
  brandColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  onSave,
  onExport,
  showTemplatesOnOpen = true
}) => {
  const [showLayers, setShowLayers] = useState(true);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);

  const editor = useVisualEditor(initialWidth, initialHeight);
  const {
    state,
    activeTool,
    setActiveTool,
    addElement,
    updateElement,
    deleteElements,
    selectElements,
    deselectAll,
    moveElement,
    resizeElement,
    rotateElement,
    reorderElement,
    duplicateElements,
    setZoom,
    setPan,
    undo,
    redo,
    canUndo,
    canRedo,
    getSelectedElements,
    setIsDragging,
    loadState,
    resizeCanvas
  } = editor;

  // Show template gallery when editor opens (if no template selected yet)
  useEffect(() => {
    if (isOpen && showTemplatesOnOpen && !hasSelectedTemplate) {
      setShowTemplateGallery(true);
    }
  }, [isOpen, showTemplatesOnOpen, hasSelectedTemplate]);

  const handleAddElement = useCallback((element: Partial<CanvasElement>) => {
    addElement(element);
  }, [addElement]);

  const handleEditElement = useCallback((id: string) => {
    const element = state.elements.find(el => el.id === id);
    if (element?.type === 'text') {
      setEditingTextId(id);
    }
  }, [state.elements]);

  const handleReorderElements = useCallback((elements: CanvasElement[]) => {
    loadState({ ...state, elements });
  }, [state, loadState]);

  const handleSave = useCallback(() => {
    onSave?.(state);
  }, [state, onSave]);

  const handleExport = useCallback(() => {
    onExport?.(state);
  }, [state, onExport]);

  const handleSelectTemplate = useCallback((templateState: CanvasState) => {
    loadState(templateState);
    setHasSelectedTemplate(true);
    setShowTemplateGallery(false);
  }, [loadState]);

  const handleSkipTemplates = useCallback(() => {
    setHasSelectedTemplate(true);
    setShowTemplateGallery(false);
  }, []);

  if (!isOpen) return null;

  const selectedElements = getSelectedElements();

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-lg">{assetName || 'Visual Editor'}</h2>
              {assetType && (
                <p className="text-xs text-muted-foreground">{assetType}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowTemplateGallery(true)}
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <Button
              size="sm"
              variant={showLayers ? 'secondary' : 'ghost'}
              className="gap-2"
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="h-4 w-4" />
              Layers
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assist
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          zoom={state.zoom}
          onZoomChange={setZoom}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onSave={handleSave}
          onExport={handleExport}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Element Sidebar */}
          <ElementSidebar
            onAddElement={handleAddElement}
            brandColors={brandColors}
          />

          {/* Canvas */}
          <EditorCanvas
            state={state}
            onSelectElements={selectElements}
            onDeselectAll={deselectAll}
            onMoveElement={moveElement}
            onResizeElement={resizeElement}
            onRotateElement={rotateElement}
            onEditElement={handleEditElement}
            onZoomChange={setZoom}
            onPanChange={setPan}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onAddElement={handleAddElement}
            activeTool={activeTool}
          />

          {/* Layer Panel (optional) */}
          {showLayers && (
            <LayerPanel
              elements={state.elements}
              selectedIds={state.selectedIds}
              onSelectElement={(id, addToSelection) => selectElements([id], addToSelection)}
              onUpdateElement={updateElement}
              onDeleteElement={(id) => deleteElements([id])}
              onReorderElements={handleReorderElements}
            />
          )}

          {/* Properties Panel */}
          <PropertiesPanel
            selectedElements={selectedElements}
            onUpdateElement={updateElement}
            onDeleteElements={deleteElements}
            onDuplicateElements={duplicateElements}
            onReorderElement={reorderElement}
          />
        </div>

        {/* Template Gallery Modal */}
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={handleSkipTemplates}
          onSelectTemplate={handleSelectTemplate}
        />
      </motion.div>
    </TooltipProvider>
  );
};

export default VisualEditor;
