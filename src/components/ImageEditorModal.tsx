import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import type { GeneratedAsset, EventDetails } from '../types';
import { AssetType } from '../types';
import { editImageContent } from '../services/geminiService';
import Spinner from './Spinner';
import SkeletonLoader from './SkeletonLoader';
import AssetSpecificFields from './AssetSpecificFields';
import { fileToBase64 } from '../utils';
import { 
  Type, 
  Crop, 
  Palette, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  SunMedium,
  Contrast,
  Droplets,
  Sparkles,
  Layers,
  Undo2,
  Download,
  ZoomIn,
  Move,
  Square,
  Circle,
  Minus
} from 'lucide-react';

interface ImageEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: string, newParams?: Record<string, unknown>) => void;
  onSaveAsNew: (assetId: string, newContent: string) => void;
  eventDetails: EventDetails;
  colorPalette: string[];
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
}

interface ShapeOverlay {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

type EditorTool = 'select' | 'text' | 'crop' | 'brush' | 'shape';
type FilterPreset = 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cool' | 'warm' | 'dramatic';

const FONT_OPTIONS = [
  'Inter', 'Georgia', 'Arial', 'Courier New', 'Impact', 'Comic Sans MS'
];

const FILTER_PRESETS: { name: FilterPreset; label: string; css: string }[] = [
  { name: 'none', label: 'Original', css: '' },
  { name: 'grayscale', label: 'B&W', css: 'grayscale(100%)' },
  { name: 'sepia', label: 'Sepia', css: 'sepia(80%)' },
  { name: 'vintage', label: 'Vintage', css: 'sepia(30%) contrast(110%) brightness(90%)' },
  { name: 'cool', label: 'Cool', css: 'saturate(80%) hue-rotate(20deg)' },
  { name: 'warm', label: 'Warm', css: 'saturate(120%) hue-rotate(-10deg)' },
  { name: 'dramatic', label: 'Dramatic', css: 'contrast(130%) brightness(90%) saturate(120%)' },
];

const ImageEditorModal = forwardRef<HTMLDivElement, ImageEditorModalProps>(
  ({ asset, onClose, onOverwrite, onSaveAsNew, colorPalette }, ref) => {
    // Core states
    const [regenerationPrompt, setRegenerationPrompt] = useState('');
    const [customContent, setCustomContent] = useState<Record<string, string>>({});
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isViewingLarge, setIsViewingLarge] = useState(false);
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
    const [overlayImage, setOverlayImage] = useState<string | null>(null);
    
    // Masking states
    const [isMaskingMode, setIsMaskingMode] = useState(false);
    const [brushSize, setBrushSize] = useState(20);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // New editor states
    const [activeTool, setActiveTool] = useState<EditorTool>('select');
    const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'text' | 'ai'>('ai');
    
    // Adjustments
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterPreset>('none');
    
    // Text overlays
    const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const [newTextInput, setNewTextInput] = useState('');
    
    // Crop
    const [cropArea, setCropArea] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    
    // History for undo
    const [history, setHistory] = useState<string[]>([]);

    let currentImage = asset.content as string;
    if (activeSide === 'back') {
      currentImage = backImagePreview || (asset.backContent as string) || currentImage;
    } else {
      currentImage = newImagePreview || (asset.content as string);
    }

    // Build CSS filter string
    const getFilterStyle = useCallback(() => {
      const preset = FILTER_PRESETS.find(f => f.name === activeFilter)?.css || '';
      const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      return `${adjustments} ${preset}`.trim();
    }, [brightness, contrast, saturation, activeFilter]);

    const getTransformStyle = useCallback(() => {
      let transform = `rotate(${rotation}deg)`;
      if (flipH) transform += ' scaleX(-1)';
      if (flipV) transform += ' scaleY(-1)';
      return transform;
    }, [rotation, flipH, flipV]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault();
          handleUndo();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, history]);

    useEffect(() => {
      if (isMaskingMode && canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const img = container.querySelector('img');
        if (img) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = brushSize;
          }
        }
      }
    }, [isMaskingMode, currentImage, brushSize]);

    const pushToHistory = useCallback(() => {
      setHistory(prev => [...prev.slice(-9), currentImage]);
    }, [currentImage]);

    const handleUndo = useCallback(() => {
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      if (activeSide === 'back') {
        setBackImagePreview(previous);
      } else {
        setNewImagePreview(previous);
      }
    }, [history, activeSide]);

    const startDrawing = (e: React.MouseEvent) => {
      if (!isMaskingMode || !canvasRef.current) return;
      setIsDrawing(true);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent) => {
      if (!isDrawing || !isMaskingMode || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.lineWidth = brushSize;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (isDrawing && canvasRef.current) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const tCtx = tempCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = 'black';
          tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tCtx.drawImage(canvasRef.current, 0, 0);
          const imageData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) {
              data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 255;
            }
          }
          tCtx.putImageData(imageData, 0, 0);
          setMaskImage(tempCanvas.toDataURL('image/png'));
        }
      }
      setIsDrawing(false);
    };

    const clearMask = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setMaskImage(null);
      }
    };

    const handleCustomContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCustomContent(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOverlayUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        try {
          const result = await fileToBase64(e.target.files[0]);
          setOverlayImage(`data:${result.type};base64,${result.data}`);
        } catch (err) {
          console.error("Failed to convert image", err);
        }
      }
    };

    const handleRegenerate = async () => {
      if (!regenerationPrompt.trim() && !Object.values(customContent).some(v => v.trim()) && !overlayImage && !maskImage) {
        alert("Please provide a prompt, custom content, or overlay image.");
        return;
      }
      pushToHistory();
      setIsRegenerating(true);
      setShowSaveOptions(false);
      try {
        let sourceImage = asset.content as string;
        let targetType = asset.type;
        if (asset.type === AssetType.NameTag && activeSide === 'back') {
          sourceImage = asset.backContent as string || sourceImage;
          targetType = AssetType.NameTagBack;
        }
        const result = await editImageContent(
          targetType, sourceImage, colorPalette, regenerationPrompt,
          customContent, overlayImage || undefined, maskImage || undefined
        );
        if (activeSide === 'back') {
          setBackImagePreview(result);
        } else {
          setNewImagePreview(result);
        }
        setIsMaskingMode(false);
      } catch (e) {
        console.error("Image regeneration failed:", e);
        alert("Regeneration failed. Please try again.");
      } finally {
        setIsRegenerating(false);
      }
    };

    const applyEditsToCanvas = useCallback(async (): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          
          // Apply transformations
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          ctx.filter = getFilterStyle();
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
          
          // Draw text overlays
          textOverlays.forEach(overlay => {
            ctx.save();
            ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px ${overlay.fontFamily}`;
            ctx.fillStyle = overlay.color;
            ctx.fillText(overlay.text, overlay.x, overlay.y);
            ctx.restore();
          });
          
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = currentImage;
      });
    }, [currentImage, rotation, flipH, flipV, getFilterStyle, textOverlays]);

    const handleApplyEdits = async () => {
      pushToHistory();
      const edited = await applyEditsToCanvas();
      if (activeSide === 'back') {
        setBackImagePreview(edited);
      } else {
        setNewImagePreview(edited);
      }
      // Reset adjustments
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setActiveFilter('none');
      setTextOverlays([]);
    };

    const addTextOverlay = () => {
      if (!newTextInput.trim()) return;
      const newOverlay: TextOverlay = {
        id: `text-${Date.now()}`,
        text: newTextInput,
        x: 50,
        y: 50,
        fontSize: 32,
        color: colorPalette[0] || '#000000',
        fontWeight: 'bold',
        fontFamily: 'Inter'
      };
      setTextOverlays(prev => [...prev, newOverlay]);
      setSelectedTextId(newOverlay.id);
      setNewTextInput('');
    };

    const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
      setTextOverlays(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTextOverlay = (id: string) => {
      setTextOverlays(prev => prev.filter(t => t.id !== id));
      if (selectedTextId === id) setSelectedTextId(null);
    };

    const handleOverwrite = async () => {
      let finalContent = newImagePreview || (asset.content as string);
      let finalBackContent = backImagePreview || (asset.backContent as string);
      
      // Apply any pending edits
      if (textOverlays.length > 0 || brightness !== 100 || contrast !== 100 || saturation !== 100 || rotation !== 0 || flipH || flipV || activeFilter !== 'none') {
        finalContent = await applyEditsToCanvas();
      }
      
      if (asset.type === AssetType.NameTag) {
        onOverwrite(asset.id, finalContent, { backContent: finalBackContent });
      } else {
        onOverwrite(asset.id, finalContent);
      }
    };

    const handleSaveAsNew = async () => {
      let contentToSave = activeSide === 'back' 
        ? (backImagePreview || asset.backContent) 
        : (newImagePreview || asset.content);
      
      // Apply any pending edits
      if (textOverlays.length > 0 || brightness !== 100 || contrast !== 100 || saturation !== 100 || rotation !== 0 || flipH || flipV || activeFilter !== 'none') {
        contentToSave = await applyEditsToCanvas();
      }
      
      if (contentToSave) onSaveAsNew(asset.id, contentToSave as string);
    };

    const hasBackSide = !!asset.backContent;
    const hasEdits = newImagePreview || backImagePreview || textOverlays.length > 0 || brightness !== 100 || contrast !== 100 || saturation !== 100 || rotation !== 0 || flipH || flipV || activeFilter !== 'none';
    const selectedText = textOverlays.find(t => t.id === selectedTextId);

    const inputClass = "w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all text-sm";
    const toolBtnClass = (active: boolean) => `p-2.5 rounded-xl transition-all ${active ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'}`;
    const tabBtnClass = (active: boolean) => `flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${active ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`;

    return (
      <div ref={ref} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-foreground">Edit: {asset.title}</h2>
              {hasBackSide && (
                <div className="flex bg-secondary/50 p-1 rounded-lg">
                  <button onClick={() => setActiveSide('front')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeSide === 'front' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                    Front
                  </button>
                  <button onClick={() => setActiveSide('back')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeSide === 'back' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                    Back
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleUndo} disabled={history.length === 0} className="btn-icon disabled:opacity-30" title="Undo (Ctrl+Z)">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-grow flex overflow-hidden">
            {/* Left: Canvas Area */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div ref={containerRef} className={`flex-1 bg-[repeating-conic-gradient(#80808012_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] rounded-xl flex items-center justify-center relative overflow-hidden ${isMaskingMode ? 'cursor-crosshair' : ''}`}>
                {isRegenerating ? (
                  <SkeletonLoader className="w-full h-full" />
                ) : (
                  <>
                    <img 
                      src={currentImage} 
                      alt="Asset Preview" 
                      className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg transition-all duration-300"
                      style={{ 
                        filter: getFilterStyle(),
                        transform: getTransformStyle()
                      }}
                    />
                    
                    {/* Text overlays preview */}
                    {textOverlays.map(overlay => (
                      <div
                        key={overlay.id}
                        className={`absolute cursor-move select-none ${selectedTextId === overlay.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        style={{
                          left: overlay.x,
                          top: overlay.y,
                          fontSize: overlay.fontSize,
                          fontWeight: overlay.fontWeight,
                          fontFamily: overlay.fontFamily,
                          color: overlay.color,
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedTextId(overlay.id); }}
                      >
                        {overlay.text}
                      </div>
                    ))}
                    
                    {isMaskingMode && (
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 z-10"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    )}
                    
                    {!isMaskingMode && (
                      <button onClick={() => setIsViewingLarge(true)} className="absolute top-3 right-3 p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-all" title="View larger">
                        <ZoomIn className="w-5 h-5 text-foreground" />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {/* Brush size slider for masking */}
              {isMaskingMode && (
                <div className="mt-3 flex items-center gap-3 bg-secondary/50 p-3 rounded-xl">
                  <span className="text-xs text-muted-foreground">Brush:</span>
                  <input type="range" min="5" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-grow accent-primary h-2 rounded-lg bg-secondary" />
                  <span className="text-xs text-muted-foreground w-8">{brushSize}px</span>
                  <button onClick={clearMask} className="text-xs text-destructive hover:text-destructive/80 px-3 py-1 bg-destructive/10 rounded-lg">Clear</button>
                </div>
              )}
            </div>

            {/* Right: Tools Panel */}
            <div className="w-80 border-l border-border bg-secondary/10 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="p-3 border-b border-border">
                <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
                  <button onClick={() => setActiveTab('ai')} className={tabBtnClass(activeTab === 'ai')}>AI</button>
                  <button onClick={() => setActiveTab('adjust')} className={tabBtnClass(activeTab === 'adjust')}>Adjust</button>
                  <button onClick={() => setActiveTab('filters')} className={tabBtnClass(activeTab === 'filters')}>Filters</button>
                  <button onClick={() => setActiveTab('text')} className={tabBtnClass(activeTab === 'text')}>Text</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* AI Tab */}
                {activeTab === 'ai' && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-foreground">AI Edit Prompt</label>
                        <button onClick={() => setIsMaskingMode(!isMaskingMode)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${isMaskingMode ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}>
                          {isMaskingMode ? 'Done Masking' : '🎨 Paint Mask'}
                        </button>
                      </div>
                      <textarea
                        value={regenerationPrompt}
                        onChange={e => setRegenerationPrompt(e.target.value)}
                        placeholder={isMaskingMode ? "Describe what to put in the masked area..." : "e.g., 'Make the background darker', 'Add confetti'"}
                        rows={3}
                        className={inputClass + " resize-none"}
                      />
                    </div>

                    <AssetSpecificFields
                      assetType={asset.type}
                      customContent={customContent}
                      onChange={handleCustomContentChange}
                      inputClassName={inputClass}
                    />

                    <div className="pt-3 border-t border-border">
                      <label className="text-sm font-medium text-foreground mb-2 block">Overlay Image</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 btn-secondary text-center cursor-pointer text-sm py-2">
                          {overlayImage ? 'Change' : 'Upload'}
                          <input type="file" className="hidden" accept="image/*" onChange={handleOverlayUpload} />
                        </label>
                        {overlayImage && (
                          <>
                            <div className="h-10 w-10 rounded-lg border border-border overflow-hidden">
                              <img src={overlayImage} alt="Overlay" className="w-full h-full object-contain" />
                            </div>
                            <button onClick={() => setOverlayImage(null)} className="p-2 bg-destructive/20 hover:bg-destructive/40 rounded-lg text-destructive transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <button onClick={handleRegenerate} disabled={isRegenerating} className="w-full btn-primary py-3 flex items-center justify-center">
                      {isRegenerating ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Regenerate
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Adjust Tab */}
                {activeTab === 'adjust' && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm text-muted-foreground flex items-center gap-2"><SunMedium className="w-4 h-4" /> Brightness</label>
                          <span className="text-xs text-muted-foreground">{brightness}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm text-muted-foreground flex items-center gap-2"><Contrast className="w-4 h-4" /> Contrast</label>
                          <span className="text-xs text-muted-foreground">{contrast}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-sm text-muted-foreground flex items-center gap-2"><Droplets className="w-4 h-4" /> Saturation</label>
                          <span className="text-xs text-muted-foreground">{saturation}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <label className="text-sm font-medium text-foreground mb-3 block">Transform</label>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setRotation(r => (r - 90) % 360)} className={toolBtnClass(false)} title="Rotate Left">
                          <RotateCw className="w-4 h-4 rotate-180" />
                        </button>
                        <button onClick={() => setRotation(r => (r + 90) % 360)} className={toolBtnClass(false)} title="Rotate Right">
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => setFlipH(!flipH)} className={toolBtnClass(flipH)} title="Flip Horizontal">
                          <FlipHorizontal className="w-4 h-4" />
                        </button>
                        <button onClick={() => setFlipV(!flipV)} className={toolBtnClass(flipV)} title="Flip Vertical">
                          <FlipVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button onClick={handleApplyEdits} className="w-full btn-secondary mt-4">
                      Apply Adjustments
                    </button>
                  </>
                )}

                {/* Filters Tab */}
                {activeTab === 'filters' && (
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setActiveFilter(preset.name)}
                        className={`p-2 rounded-xl border transition-all ${activeFilter === preset.name ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}
                      >
                        <div 
                          className="w-full aspect-square rounded-lg mb-1 overflow-hidden bg-secondary"
                          style={{ 
                            backgroundImage: `url(${currentImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: preset.css || undefined
                          }}
                        />
                        <span className="text-xs text-foreground">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Tab */}
                {activeTab === 'text' && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTextInput}
                        onChange={e => setNewTextInput(e.target.value)}
                        placeholder="Enter text..."
                        className={inputClass + " flex-1"}
                        onKeyDown={e => e.key === 'Enter' && addTextOverlay()}
                      />
                      <button onClick={addTextOverlay} className="btn-primary px-4">
                        <Type className="w-4 h-4" />
                      </button>
                    </div>

                    {textOverlays.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium text-foreground">Text Layers</label>
                        {textOverlays.map(overlay => (
                          <div 
                            key={overlay.id} 
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedTextId === overlay.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                            onClick={() => setSelectedTextId(overlay.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium truncate flex-1">{overlay.text}</span>
                              <button onClick={(e) => { e.stopPropagation(); deleteTextOverlay(overlay.id); }} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            {selectedTextId === overlay.id && (
                              <div className="space-y-2 pt-2 border-t border-border">
                                <div className="flex gap-2">
                                  <select 
                                    value={overlay.fontFamily} 
                                    onChange={e => updateTextOverlay(overlay.id, { fontFamily: e.target.value })}
                                    className={inputClass + " text-xs"}
                                  >
                                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                  </select>
                                  <input 
                                    type="number" 
                                    value={overlay.fontSize} 
                                    onChange={e => updateTextOverlay(overlay.id, { fontSize: Number(e.target.value) })}
                                    className={inputClass + " w-16 text-xs"}
                                    min="8" max="200"
                                  />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="color" 
                                    value={overlay.color} 
                                    onChange={e => updateTextOverlay(overlay.id, { color: e.target.value })}
                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                  />
                                  <button 
                                    onClick={() => updateTextOverlay(overlay.id, { fontWeight: overlay.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                    className={`px-3 py-1 rounded text-xs font-bold ${overlay.fontWeight === 'bold' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                                  >
                                    B
                                  </button>
                                  {colorPalette.slice(0, 4).map((c, i) => (
                                    <button 
                                      key={i}
                                      onClick={() => updateTextOverlay(overlay.id, { color: c })}
                                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {textOverlays.length > 0 && (
                      <button onClick={handleApplyEdits} className="w-full btn-secondary mt-4">
                        Flatten Text to Image
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="p-4 border-t border-border flex justify-between items-center bg-secondary/20">
            <div className="text-xs text-muted-foreground">
              {history.length > 0 && `${history.length} edit${history.length > 1 ? 's' : ''} in history`}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              {showSaveOptions ? (
                <>
                  <button onClick={() => setShowSaveOptions(false)} className="btn-secondary">Back</button>
                  <button onClick={handleOverwrite} className="btn-secondary">Overwrite</button>
                  <button onClick={handleSaveAsNew} className="btn-primary">Save as Copy</button>
                </>
              ) : (
                <button 
                  onClick={() => setShowSaveOptions(true)} 
                  disabled={!hasEdits || isRegenerating} 
                  className="btn-primary disabled:opacity-50"
                >
                  Save Changes
                </button>
              )}
            </div>
          </footer>

          {/* Large view modal */}
          {isViewingLarge && !isMaskingMode && (
            <div className="absolute inset-0 bg-background/95 flex items-center justify-center z-20 animate-fade-in" onClick={() => setIsViewingLarge(false)}>
              <img 
                src={currentImage} 
                alt="Large preview" 
                className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl" 
                style={{ filter: getFilterStyle(), transform: getTransformStyle() }}
                onClick={e => e.stopPropagation()} 
              />
              <button onClick={() => setIsViewingLarge(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground bg-secondary/80 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ImageEditorModal.displayName = 'ImageEditorModal';

export default ImageEditorModal;
