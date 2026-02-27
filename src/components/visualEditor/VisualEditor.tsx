// Visual Editor - Main component combining all parts with advanced graphic designer features
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Layers, LayoutTemplate, Download, Brain, Users, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useVisualEditor } from '@/hooks/useVisualEditor';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { ElementSidebar } from './ElementSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { LayerPanel } from './LayerPanel';
import { TemplateGallery } from './TemplateGallery';
import { AdvancedExportPanel, ExportOptions } from './AdvancedExportPanel';
import { AIDesignToolsPanel } from './AIDesignToolsPanel';
import { CollaborationPanel } from './CollaborationPanel';
import { toast } from 'sonner';
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
  designId?: string;
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
  showTemplatesOnOpen = true,
  designId
}) => {
  const [showLayers, setShowLayers] = useState(true);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAITools, setShowAITools] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);

  const isMobile = useIsMobile();
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
    toast.success('Design saved successfully!');
  }, [state, onSave]);

  const handleExport = useCallback(() => {
    setShowExportPanel(true);
  }, []);

  const handleAdvancedExport = useCallback((options: ExportOptions) => {
    console.log('Exporting with options:', options);
    onExport?.(state);
    toast.success(`Exporting as ${options.format.toUpperCase()} (${options.colorMode.toUpperCase()})`);
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

  const handleApplyAISuggestion = useCallback((updates: Partial<CanvasState>) => {
    loadState({ ...state, ...updates });
  }, [state, loadState]);

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
        <div className="h-14 border-b flex items-center justify-between px-2 sm:px-4 bg-background">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="font-semibold text-base sm:text-lg truncate">{assetName || 'Visual Editor'}</h2>
              {assetType && (
                <p className="text-xs text-muted-foreground truncate">{assetType}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 sm:gap-2"
                  onClick={() => setShowTemplateGallery(true)}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Browse design templates</TooltipContent>
            </Tooltip>
            
            {!isMobile && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={showLayers ? 'secondary' : 'ghost'}
                      className="gap-2"
                      onClick={() => setShowLayers(!showLayers)}
                    >
                      <Layers className="h-4 w-4" />
                      <span className="hidden lg:inline">Layers</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle layer panel</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={showAITools ? 'secondary' : 'outline'}
                      className="gap-2"
                      onClick={() => {
                        setShowAITools(!showAITools);
                        if (!showAITools) setShowCollaboration(false);
                      }}
                    >
                      <Brain className="h-4 w-4" />
                      <span className="hidden lg:inline">AI Tools</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>AI-powered design assistance</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant={showCollaboration ? 'secondary' : 'outline'}
                      className="gap-2"
                      onClick={() => {
                        setShowCollaboration(!showCollaboration);
                        if (!showCollaboration) setShowAITools(false);
                      }}
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden lg:inline">Collaborate</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Comments, history & sharing</TooltipContent>
                </Tooltip>
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="default"
                  className="gap-1 sm:gap-2"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Advanced export options</TooltipContent>
            </Tooltip>
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
          {/* Element Sidebar - hidden on mobile */}
          {!isMobile && (
            <ElementSidebar
              onAddElement={handleAddElement}
              brandColors={brandColors}
            />
          )}

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

          {/* Layer Panel (optional) - hidden on mobile */}
          {!isMobile && showLayers && !showAITools && !showCollaboration && (
            <LayerPanel
              elements={state.elements}
              selectedIds={state.selectedIds}
              onSelectElement={(id, addToSelection) => selectElements([id], addToSelection)}
              onUpdateElement={updateElement}
              onDeleteElement={(id) => deleteElements([id])}
              onReorderElements={handleReorderElements}
            />
          )}

          {/* Properties Panel - hidden on mobile */}
          {!isMobile && !showAITools && !showCollaboration && (
            <PropertiesPanel
              selectedElements={selectedElements}
              onUpdateElement={updateElement}
              onDeleteElements={deleteElements}
              onDuplicateElements={duplicateElements}
              onReorderElement={reorderElement}
            />
          )}

          {/* AI Design Tools Panel */}
          <AnimatePresence>
            {showAITools && !isMobile && (
              <AIDesignToolsPanel
                isOpen={showAITools}
                onClose={() => setShowAITools(false)}
                canvasState={state}
                onApplySuggestion={handleApplyAISuggestion}
                onAddElement={handleAddElement}
              />
            )}
          </AnimatePresence>

          {/* Collaboration Panel */}
          <AnimatePresence>
            {showCollaboration && !isMobile && (
              <CollaborationPanel
                isOpen={showCollaboration}
                onClose={() => setShowCollaboration(false)}
                designId={designId}
                designName={assetName}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Template Gallery Modal */}
        <TemplateGallery
          isOpen={showTemplateGallery}
          onClose={handleSkipTemplates}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Advanced Export Panel */}
        <AdvancedExportPanel
          isOpen={showExportPanel}
          onClose={() => setShowExportPanel(false)}
          canvasState={state}
          onExport={handleAdvancedExport}
        />
      </motion.div>
    </TooltipProvider>
  );
};

export default VisualEditor;
