import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GeneratedAsset, PresentationData, Slide, SlideElement, TextElement, ImageElement, ShapeElement } from '../types';
import { generatePptx } from '../utils';
import Spinner from './Spinner';

interface PresentationEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: PresentationData) => void;
  onSaveAsNew: (assetId: string, newContent: PresentationData) => void;
  eventName: string;
  colorPalette: string[];
}

const DEFAULT_THEME = {
  backgroundColor: '#1a1a2e',
  titleColor: '#ffffff',
  textColor: '#e0e0e0',
  accentColor: '#667eea',
  titleFont: 'Inter',
  bodyFont: 'Inter',
};

const SLIDE_TEMPLATES = {
  title: 'Title Slide',
  content: 'Content Slide',
  'image-split': 'Image & Text',
  chart: 'Chart Slide',
  blank: 'Blank Slide',
};

const PresentationEditorModal: React.FC<PresentationEditorModalProps> = ({
  asset,
  onClose,
  onOverwrite,
  onSaveAsNew,
  eventName,
  colorPalette,
}) => {
  const [presentation, setPresentation] = useState<PresentationData>({
    title: eventName || 'Untitled Presentation',
    theme: { ...DEFAULT_THEME, accentColor: colorPalette[0] || DEFAULT_THEME.accentColor },
    slides: [],
  });
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    if (asset.content && typeof asset.content === 'object' && 'slides' in asset.content) {
      setPresentation(asset.content as PresentationData);
    } else {
      // Initialize with default slides
      const defaultSlides: Slide[] = [
        createSlide('title', `Welcome to ${eventName}`, 'Your Event Tagline Here'),
        createSlide('content', 'Agenda', 'Key topics and highlights'),
        createSlide('content', 'Key Takeaways', 'Summary points'),
      ];
      setPresentation(prev => ({ ...prev, slides: defaultSlides }));
    }
  }, [asset, eventName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Delete' && selectedElementId) {
        handleDeleteElement(selectedElementId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedElementId]);

  const createSlide = (type: Slide['type'], title: string = '', subtitle: string = ''): Slide => {
    const elements: SlideElement[] = [];
    const theme = presentation.theme;

    if (type === 'title') {
      elements.push({
        id: uuidv4(),
        type: 'text',
        x: 10,
        y: 35,
        w: 80,
        h: 20,
        content: title,
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.titleColor,
        align: 'center',
      } as TextElement);
      elements.push({
        id: uuidv4(),
        type: 'text',
        x: 10,
        y: 55,
        w: 80,
        h: 10,
        content: subtitle,
        fontSize: 24,
        fontWeight: 'normal',
        color: theme.textColor,
        align: 'center',
      } as TextElement);
    } else if (type === 'content') {
      elements.push({
        id: uuidv4(),
        type: 'text',
        x: 5,
        y: 8,
        w: 90,
        h: 12,
        content: title,
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.titleColor,
        align: 'left',
      } as TextElement);
      elements.push({
        id: uuidv4(),
        type: 'text',
        x: 5,
        y: 25,
        w: 90,
        h: 60,
        content: '• Point one\n• Point two\n• Point three',
        fontSize: 20,
        fontWeight: 'normal',
        color: theme.textColor,
        align: 'left',
      } as TextElement);
    } else if (type === 'image-split') {
      elements.push({
        id: uuidv4(),
        type: 'shape',
        x: 0,
        y: 0,
        w: 50,
        h: 100,
        shapeType: 'rectangle',
        backgroundColor: theme.accentColor,
      } as ShapeElement);
      elements.push({
        id: uuidv4(),
        type: 'text',
        x: 55,
        y: 30,
        w: 40,
        h: 40,
        content: title || 'Your Content Here',
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.titleColor,
        align: 'left',
      } as TextElement);
    }

    return {
      id: uuidv4(),
      type,
      elements,
      background: theme.backgroundColor,
    };
  };

  const handleAddSlide = (type: Slide['type']) => {
    const newSlide = createSlide(type);
    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setSelectedSlideIndex(presentation.slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return;
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
    if (selectedSlideIndex >= index && selectedSlideIndex > 0) {
      setSelectedSlideIndex(prev => prev - 1);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToDuplicate = presentation.slides[index];
    const duplicatedSlide = {
      ...slideToDuplicate,
      id: uuidv4(),
      elements: slideToDuplicate.elements.map(el => ({ ...el, id: uuidv4() })),
    };
    setPresentation(prev => ({
      ...prev,
      slides: [...prev.slides.slice(0, index + 1), duplicatedSlide, ...prev.slides.slice(index + 1)],
    }));
  };

  const handleSlideReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPresentation(prev => {
      const slides = [...prev.slides];
      const [removed] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, removed);
      return { ...prev, slides };
    });
    setSelectedSlideIndex(toIndex);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<TextElement | ShapeElement | ImageElement>) => {
    setPresentation(prev => {
      const newSlides = prev.slides.map((slide, i) => {
        if (i !== selectedSlideIndex) return slide;
        const newElements = slide.elements.map(el => {
          if (el.id !== elementId) return el;
          return { ...el, ...updates } as SlideElement;
        });
        return { ...slide, elements: newElements };
      });
      return { ...prev, slides: newSlides };
    });
  };

  const handleDeleteElement = (elementId: string) => {
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === selectedSlideIndex
          ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
          : slide
      ),
    }));
    setSelectedElementId(null);
  };

  const handleAddElement = (type: SlideElement['type']) => {
    const theme = presentation.theme;
    let newElement: SlideElement;

    switch (type) {
      case 'text':
        newElement = {
          id: uuidv4(),
          type: 'text',
          x: 20,
          y: 40,
          w: 60,
          h: 20,
          content: 'New Text',
          fontSize: 24,
          fontWeight: 'normal',
          color: theme.textColor,
          align: 'left',
        } as TextElement;
        break;
      case 'shape':
        newElement = {
          id: uuidv4(),
          type: 'shape',
          x: 30,
          y: 30,
          w: 40,
          h: 40,
          shapeType: 'rectangle',
          backgroundColor: theme.accentColor,
        } as ShapeElement;
        break;
      default:
        return;
    }

    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) =>
        i === selectedSlideIndex
          ? { ...slide, elements: [...slide.elements, newElement] }
          : slide
      ),
    }));
    setSelectedElementId(newElement.id);
  };

  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      await generatePptx(presentation);
    } catch (e) {
      console.error('PPTX export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOverwrite = () => onOverwrite(asset.id, presentation);
  const handleSaveAsNew = () => onSaveAsNew(asset.id, presentation);

  const currentSlide = presentation.slides[selectedSlideIndex];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  const renderSlidePreview = (slide: Slide, isSelected: boolean, index: number) => (
    <div
      key={slide.id}
      draggable
      onDragStart={() => setDraggedSlideIndex(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        if (draggedSlideIndex !== null) {
          handleSlideReorder(draggedSlideIndex, index);
          setDraggedSlideIndex(null);
        }
      }}
      onDragEnd={() => setDraggedSlideIndex(null)}
      onClick={() => { setSelectedSlideIndex(index); setSelectedElementId(null); }}
      className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
      }`}
      style={{ aspectRatio: '16/9' }}
    >
      <div
        className="w-full h-full p-2"
        style={{ backgroundColor: slide.background || presentation.theme.backgroundColor }}
      >
        <span className="absolute top-1 left-1 text-[10px] font-mono bg-background/60 px-1.5 py-0.5 rounded">
          {index + 1}
        </span>
        <div className="text-[8px] text-center mt-4 text-foreground/70 truncate">
          {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
        </div>
      </div>
      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(index); }}
          className="p-1.5 bg-secondary rounded-lg hover:bg-secondary/80"
          title="Duplicate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDeleteSlide(index); }}
          className="p-1.5 bg-destructive/20 rounded-lg hover:bg-destructive/40"
          title="Delete"
          disabled={presentation.slides.length <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderSlideCanvas = () => {
    if (!currentSlide) return null;

    return (
      <div
        className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '16/9', backgroundColor: currentSlide.background || presentation.theme.backgroundColor }}
        onClick={() => setSelectedElementId(null)}
      >
        {currentSlide.elements.map(element => (
          <div
            key={element.id}
            onClick={(e) => { e.stopPropagation(); setSelectedElementId(element.id); }}
            className={`absolute cursor-pointer transition-all ${
              selectedElementId === element.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : 'hover:ring-1 hover:ring-primary/50'
            }`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.w}%`,
              height: `${element.h}%`,
            }}
          >
            {element.type === 'text' && (
              <div
                className="w-full h-full flex items-center p-2"
                style={{
                  fontSize: `${(element as TextElement).fontSize * 0.4}px`,
                  fontWeight: (element as TextElement).fontWeight,
                  color: (element as TextElement).color,
                  textAlign: (element as TextElement).align,
                }}
              >
                {(element as TextElement).content}
              </div>
            )}
            {element.type === 'shape' && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: (element as ShapeElement).backgroundColor,
                  borderRadius: (element as ShapeElement).shapeType === 'circle' ? '50%' : '0',
                }}
              />
            )}
            {element.type === 'image' && (
              <img
                src={(element as ImageElement).src}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderElementEditor = () => {
    if (!selectedElement) return null;

    if (selectedElement.type === 'text') {
      const textEl = selectedElement as TextElement;
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Content</label>
            <textarea
              value={textEl.content}
              onChange={(e) => handleUpdateElement(textEl.id, { content: e.target.value })}
              rows={3}
              className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Font Size</label>
              <input
                type="number"
                value={textEl.fontSize}
                onChange={(e) => handleUpdateElement(textEl.id, { fontSize: parseInt(e.target.value) || 16 })}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Color</label>
              <input
                type="color"
                value={textEl.color}
                onChange={(e) => handleUpdateElement(textEl.id, { color: e.target.value })}
                className="w-full h-9 bg-secondary/50 border border-border rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Alignment</label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => handleUpdateElement(textEl.id, { align })}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    textEl.align === align ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border hover:bg-secondary'
                  }`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => handleDeleteElement(textEl.id)}
            className="w-full py-2 text-sm text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
          >
            Delete Element
          </button>
        </div>
      );
    }

    if (selectedElement.type === 'shape') {
      const shapeEl = selectedElement as ShapeElement;
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Shape Type</label>
            <div className="flex gap-2">
              {(['rectangle', 'circle'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleUpdateElement(shapeEl.id, { shapeType: type })}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    shapeEl.shapeType === type ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border hover:bg-secondary'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Color</label>
            <input
              type="color"
              value={shapeEl.backgroundColor}
              onChange={(e) => handleUpdateElement(shapeEl.id, { backgroundColor: e.target.value })}
              className="w-full h-9 bg-secondary/50 border border-border rounded-lg cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleDeleteElement(shapeEl.id)}
            className="w-full py-2 text-sm text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
          >
            Delete Shape
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setPresentation(prev => ({ ...prev, title: e.target.value }))}
              className="text-xl font-bold text-foreground bg-transparent border-none outline-none focus:ring-0"
            />
            <p className="text-sm text-muted-foreground">{presentation.slides.length} slides</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPptx}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2"
          >
            {isExporting ? <Spinner className="w-4 h-4" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export PPTX
          </button>
          {showSaveOptions ? (
            <>
              <button onClick={() => setShowSaveOptions(false)} className="btn-secondary">Back</button>
              <button onClick={handleOverwrite} className="btn-secondary">Overwrite</button>
              <button onClick={handleSaveAsNew} className="btn-primary">Save as Copy</button>
            </>
          ) : (
            <button onClick={() => setShowSaveOptions(true)} className="btn-primary">Save</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <aside className="w-48 border-r border-border bg-card/50 p-3 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            {presentation.slides.map((slide, index) => renderSlidePreview(slide, index === selectedSlideIndex, index))}
          </div>
          
          {/* Add Slide */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Add Slide</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SLIDE_TEMPLATES).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleAddSlide(type as Slide['type'])}
                  className="py-2 px-1 text-[10px] bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-primary/50 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 p-8 flex items-center justify-center bg-secondary/20">
          <div className="w-full max-w-4xl">
            {renderSlideCanvas()}
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-64 border-l border-border bg-card/50 p-4 overflow-y-auto custom-scrollbar">
          {selectedElement ? (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-4">Element Properties</h3>
              {renderElementEditor()}
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-4">Add Elements</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleAddElement('text')}
                  className="w-full py-2.5 text-sm bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                  Add Text
                </button>
                <button
                  onClick={() => handleAddElement('shape')}
                  className="w-full py-2.5 text-sm bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                  Add Shape
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Slide Settings</h3>
                {currentSlide && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Background</label>
                    <input
                      type="color"
                      value={currentSlide.background || presentation.theme.backgroundColor}
                      onChange={(e) => {
                        setPresentation(prev => ({
                          ...prev,
                          slides: prev.slides.map((s, i) =>
                            i === selectedSlideIndex ? { ...s, background: e.target.value } : s
                          ),
                        }));
                      }}
                      className="w-full h-9 bg-secondary/50 border border-border rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Theme Colors</h3>
                <div className="grid grid-cols-4 gap-2">
                  {colorPalette.slice(0, 4).map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setPresentation(prev => ({ ...prev, theme: { ...prev.theme, accentColor: color } }))}
                      className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-105"
                      style={{ backgroundColor: color, borderColor: presentation.theme.accentColor === color ? 'white' : 'transparent' }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PresentationEditorModal;
