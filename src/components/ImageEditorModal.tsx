import React, { useState, useEffect, useRef, forwardRef } from 'react';
import type { GeneratedAsset, EventDetails } from '../types';
import { AssetType } from '../types';
import { editImageContent } from '../services/geminiService';
import Spinner from './Spinner';
import SkeletonLoader from './SkeletonLoader';
import { fileToBase64 } from '../utils';

interface ImageEditorModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onOverwrite: (assetId: string, newContent: string, newParams?: Record<string, unknown>) => void;
  onSaveAsNew: (assetId: string, newContent: string) => void;
  eventDetails: EventDetails;
  colorPalette: string[];
}

const ImageEditorModal = forwardRef<HTMLDivElement, ImageEditorModalProps>(
  ({ asset, onClose, onOverwrite, onSaveAsNew, colorPalette }, ref) => {
    const [regenerationPrompt, setRegenerationPrompt] = useState('');
    const [customContent, setCustomContent] = useState<Record<string, string>>({});
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isViewingLarge, setIsViewingLarge] = useState(false);
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const [backImagePreview, setBackImagePreview] = useState<string | null>(null);
    const [overlayImage, setOverlayImage] = useState<string | null>(null);
    const [isMaskingMode, setIsMaskingMode] = useState(false);
    const [brushSize, setBrushSize] = useState(20);
    const [maskImage, setMaskImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    let currentImage = asset.content as string;
    if (activeSide === 'back') {
      currentImage = backImagePreview || (asset.backContent as string) || currentImage;
    } else {
      currentImage = newImagePreview || (asset.content as string);
    }

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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

    const handleOverwrite = () => {
      const newContent = newImagePreview || (asset.content as string);
      const newBackContent = backImagePreview || (asset.backContent as string);
      if (asset.type === AssetType.NameTag) {
        onOverwrite(asset.id, newContent, { backContent: newBackContent });
      } else {
        onOverwrite(asset.id, newContent);
      }
    };

    const handleSaveAsNew = () => {
      const contentToSave = activeSide === 'back' 
        ? (backImagePreview || asset.backContent) 
        : (newImagePreview || asset.content);
      if (contentToSave) onSaveAsNew(asset.id, contentToSave as string);
    };

    const hasBackSide = !!asset.backContent;
    const inputClass = "w-full bg-secondary/50 border border-border text-foreground rounded-lg p-3 focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-all";

    return (
      <div ref={ref} className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
          <header className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Edit: {asset.title}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-grow p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              {hasBackSide && (
                <div className="flex mb-4 bg-secondary/50 p-1 rounded-lg self-center">
                  <button onClick={() => setActiveSide('front')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSide === 'front' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                    Front
                  </button>
                  <button onClick={() => setActiveSide('back')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeSide === 'back' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                    Back
                  </button>
                </div>
              )}
              
              <div ref={containerRef} className={`bg-secondary/30 rounded-xl flex items-center justify-center p-2 relative group flex-grow overflow-hidden ${isMaskingMode ? 'cursor-crosshair' : ''}`}>
                {isRegenerating ? (
                  <SkeletonLoader className="w-full h-64" />
                ) : (
                  <>
                    <img src={currentImage} alt="Asset Preview" className="max-w-full max-h-[55vh] object-contain" />
                    {isMaskingMode && (
                      <canvas
                        ref={canvasRef}
                        className="absolute top-2 left-2 z-10"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    )}
                    {!isMaskingMode && (
                      <button onClick={() => setIsViewingLarge(true)} className="absolute top-2 right-2 p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-all opacity-0 group-hover:opacity-100" title="View larger">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {isMaskingMode && (
                <div className="mt-3 flex items-center gap-3 bg-secondary/50 p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground">Brush:</span>
                  <input type="range" min="5" max="50" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-grow accent-primary h-2 rounded-lg bg-secondary" />
                  <button onClick={clearMask} className="text-xs text-destructive hover:text-destructive/80 px-2">Clear</button>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-foreground">Describe changes:</label>
                  <button onClick={() => setIsMaskingMode(!isMaskingMode)} className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${isMaskingMode ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}>
                    {isMaskingMode ? 'Done Masking' : 'Paint Mask'}
                  </button>
                </div>
                <textarea
                  value={regenerationPrompt}
                  onChange={e => setRegenerationPrompt(e.target.value)}
                  placeholder={isMaskingMode ? "Describe what to put in the masked area..." : "e.g., 'Make the background darker'"}
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>

              {asset.type === AssetType.NameTag && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground">Badge Content:</h4>
                  <input type="text" name="name" value={customContent.name || ''} onChange={handleCustomContentChange} placeholder="Attendee Name" className={inputClass} />
                  <input type="text" name="title" value={customContent.title || ''} onChange={handleCustomContentChange} placeholder="Job Title" className={inputClass} />
                  <input type="text" name="company" value={customContent.company || ''} onChange={handleCustomContentChange} placeholder="Company" className={inputClass} />
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <label className="text-sm font-medium text-foreground mb-2 block">Overlay Image (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 btn-secondary text-center cursor-pointer text-sm py-2">
                    {overlayImage ? 'Change' : 'Upload'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleOverlayUpload} />
                  </label>
                  {overlayImage && (
                    <button onClick={() => setOverlayImage(null)} className="p-2 bg-destructive/20 hover:bg-destructive/40 rounded-lg text-destructive transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                {overlayImage && (
                  <div className="mt-2 h-16 w-16 rounded-lg border border-border overflow-hidden">
                    <img src={overlayImage} alt="Overlay" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex-grow" />

              <button onClick={handleRegenerate} disabled={isRegenerating} className="w-full btn-primary py-3 flex items-center justify-center">
                {isRegenerating ? <><Spinner className="w-5 h-5 mr-2" /> Regenerating...</> : `Regenerate ${activeSide === 'front' ? 'Front' : 'Back'}`}
              </button>
            </div>
          </div>

          <footer className="p-4 border-t border-border flex justify-end items-center gap-3">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            {showSaveOptions ? (
              <>
                <button onClick={() => setShowSaveOptions(false)} className="btn-secondary">Back</button>
                <button onClick={handleOverwrite} className="btn-secondary">Overwrite</button>
                <button onClick={handleSaveAsNew} className="btn-primary">Save as Copy</button>
              </>
            ) : (
              <button onClick={() => setShowSaveOptions(true)} disabled={(activeSide === 'front' && !newImagePreview) || (activeSide === 'back' && !backImagePreview) || isRegenerating} className="btn-primary disabled:opacity-50">
                Save Changes
              </button>
            )}
          </footer>

          {isViewingLarge && !isMaskingMode && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-20 animate-fade-in" onClick={() => setIsViewingLarge(false)}>
              <img src={currentImage} alt="Large preview" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
              <button onClick={() => setIsViewingLarge(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
