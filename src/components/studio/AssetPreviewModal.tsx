import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Edit, 
  Maximize2,
  Minimize2,
  Move,
  Bookmark,
  Check,
  Loader2,
  Palette
} from 'lucide-react';
import type { GeneratedAsset, ColorInfo, PresentationData } from '../../types';
import { AssetType } from '../../types';
import { isImageContent, getImageSrc, isSvgContent } from '../../utils/svgUtils';
import { AIFeedback } from '../AIFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useActiveBrand } from '@/hooks/useActiveBrand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BrandStyles {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

interface AssetPreviewModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
  onEdit?: (asset: GeneratedAsset) => void;
  onDownload?: (asset: GeneratedAsset) => void;
  generationId?: string | null;
  projectId?: string | null;
  brandStyles?: BrandStyles;
}

const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  asset,
  onClose,
  onEdit,
  onDownload,
  generationId,
  projectId,
  brandStyles,
}) => {
  const { user } = useAuth();
  const { activeBrand } = useActiveBrand();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get brand colors - prefer passed props, fallback to active brand
  const brandPrimary = brandStyles?.primary_color || activeBrand?.styles?.primary_color;
  const brandSecondary = brandStyles?.secondary_color || activeBrand?.styles?.secondary_color;
  const brandAccent = brandStyles?.accent_color || activeBrand?.styles?.accent_color;
  const hasBrandColors = brandPrimary || brandSecondary || brandAccent;
  
  // Dynamic brand gradient
  const brandGradientStyle = hasBrandColors 
    ? { 
        background: `linear-gradient(135deg, ${brandPrimary || 'hsl(var(--primary))'}, ${brandAccent || brandSecondary || 'hsl(var(--accent))'})` 
      }
    : undefined;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check content types - now includes SVG
  const isImageAsset = typeof asset.content === 'string' && isImageContent(asset.content);
  const isSvgAsset = typeof asset.content === 'string' && isSvgContent(asset.content);
  const isVideoAsset = typeof asset.content === 'string' && asset.content.startsWith('data:video');
  const isPaletteAsset = asset.type === AssetType.Palette && Array.isArray(asset.content);
  const isSlogansAsset = asset.type === AssetType.Slogans && Array.isArray(asset.content);
  const isPresentationAsset = asset.type === AssetType.Presentation;
  const isTextAsset = typeof asset.content === 'string' && !asset.content.startsWith('data:') && !isSvgAsset;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 5));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Save asset to recent creations
  const handleSaveToRecent = async () => {
    if (!user || !isImageAsset || isSaving) return;
    
    setIsSaving(true);
    try {
      const content = asset.content as string;
      
      // Convert base64 to blob
      const base64Data = content.split(',')[1];
      const mimeType = content.match(/data:([^;]+);/)?.[1] || 'image/png';
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Generate unique filename
      const ext = mimeType.split('/')[1] || 'png';
      const fileName = `${user.id}/${Date.now()}-${asset.type.toLowerCase().replace(/_/g, '-')}.${ext}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('asset-images')
        .upload(fileName, blob, { contentType: mimeType });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('asset-images')
        .getPublicUrl(fileName);
      
      const imageUrl = urlData.publicUrl;
      
      // Save to project_assets if we have a project
      if (projectId) {
        const { error: assetError } = await supabase
          .from('project_assets')
          .insert({
            project_id: projectId,
            asset_type: asset.type,
            title: asset.title,
            content: imageUrl,
            metadata: {
              original_content: 'storage',
              storage_path: fileName,
              saved_at: new Date().toISOString()
            }
          });
        
        if (assetError) throw assetError;
      }
      
      setIsSaved(true);
      toast.success('Asset saved to your creations!');
      
      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    // Handle images (including SVG)
    if (isImageAsset) {
      const imgSrc = getImageSrc(asset.content as string);
      return (
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imgSrc}
            alt={asset.title}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            }}
            draggable={false}
          />
          {isSvgAsset && (
            <div className="absolute top-4 left-4 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
              SVG
            </div>
          )}
        </div>
      );
    }

    if (isVideoAsset) {
      return (
        <video
          src={asset.content as string}
          className="max-w-full max-h-full object-contain"
          controls
          autoPlay
          loop
        />
      );
    }

    if (isPaletteAsset) {
      const colors = asset.content as ColorInfo[];
      return (
        <div className="w-full max-w-2xl bg-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {colors.map((color, i) => (
              <div key={i} className="aspect-square flex flex-col items-center justify-center p-4" style={{ backgroundColor: color.hex }}>
                <span className="text-2xl font-bold mb-2 px-3 py-1 rounded bg-black/20 text-white backdrop-blur-sm">{color.hex}</span>
                <span className="text-sm text-white/80 bg-black/10 px-2 py-0.5 rounded">{color.name}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-card border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {colors.map((color, i) => (
                <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: color.hex }} />
                    <span className="font-medium text-foreground">{color.name}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground font-mono">
                    <p>HEX: {color.hex}</p>
                    <p>RGB: {color.rgb}</p>
                    <p>CMYK: {color.cmyk}</p>
                    <p>Pantone: {color.pantone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (isSlogansAsset) {
      const slogans = asset.content as string[];
      return (
        <div className="w-full max-w-2xl bg-card rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-foreground mb-6">Event Slogans</h3>
          <div className="space-y-4">
            {slogans.map((slogan, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-border">
                <p className="text-lg text-foreground italic">"{slogan}"</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isPresentationAsset) {
      const presentation = asset.content as PresentationData;
      return (
        <div className="w-full max-w-4xl bg-card rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-foreground mb-2">{presentation.title}</h3>
          <p className="text-muted-foreground mb-6">{presentation.slides?.length || 0} slides</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {presentation.slides?.slice(0, 8).map((slide, i) => (
              <div 
                key={slide.id} 
                className="aspect-video rounded-lg overflow-hidden border border-border"
                style={{ backgroundColor: slide.background || presentation.theme.backgroundColor }}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  Slide {i + 1}
                </div>
              </div>
            ))}
            {(presentation.slides?.length || 0) > 8 && (
              <div className="aspect-video rounded-lg border border-border flex items-center justify-center bg-secondary/50">
                <span className="text-muted-foreground">+{(presentation.slides?.length || 0) - 8} more</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isTextAsset) {
      return (
        <div className="w-full max-w-3xl bg-card rounded-2xl p-8 shadow-2xl max-h-[80vh] overflow-auto">
          <h3 className="text-xl font-bold text-foreground mb-4">{asset.title}</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-foreground bg-secondary/30 p-4 rounded-lg">{asset.content as string}</pre>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-lg bg-card rounded-2xl p-8 shadow-2xl text-center">
        <p className="text-muted-foreground">No preview available</p>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background/95 backdrop-blur-md flex flex-col z-50 animate-fade-in"
    >
      {/* Brand Color Accent Bar */}
      {hasBrandColors && (
        <div 
          className="h-1 w-full flex-shrink-0"
          style={brandGradientStyle}
        />
      )}

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm",
        hasBrandColors ? "border-b-0" : "border-b border-border"
      )}>
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">{asset.title}</h2>
          <span 
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-full",
              hasBrandColors 
                ? "text-white" 
                : "bg-secondary text-muted-foreground"
            )}
            style={hasBrandColors ? { 
              backgroundColor: `${brandPrimary}20`,
              color: brandPrimary,
              border: `1px solid ${brandPrimary}40`
            } : undefined}
          >
            {asset.type.replace(/_/g, ' ')}
          </span>
          
          {/* Brand Color Pills */}
          {hasBrandColors && (
            <div className="flex items-center gap-1 ml-2">
              {[brandPrimary, brandSecondary, brandAccent].filter(Boolean).map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls - only for images */}
          {isImageAsset && (
            <>
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 mr-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4 text-muted-foreground" />
                </button>
                <span className="px-3 text-sm font-medium text-foreground min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded hover:bg-secondary transition-colors"
                  title="Reset (0)"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {zoom > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                  <Move className="w-3 h-3" />
                  Drag to pan
                </div>
              )}
            </>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Maximize2 className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Save to Recent Creations - only for authenticated users with images */}
          {user && isImageAsset && (
            <button
              onClick={handleSaveToRecent}
              disabled={isSaving || isSaved}
              className={`p-2 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-green-500/20 text-green-500' 
                  : 'hover:bg-secondary'
              }`}
              title={isSaved ? 'Saved!' : 'Save to Recent Creations'}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : isSaved ? (
                <Check className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          )}

          {onDownload && (
            <button
              onClick={() => onDownload(asset)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(asset)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {renderContent()}
      </div>

      {/* Footer hints */}
      {isImageAsset && (
        <div className={cn(
          "p-3 bg-card/50 flex items-center justify-between",
          hasBrandColors ? "border-t-0" : "border-t border-border"
        )}>
          {/* Brand accent bottom border */}
          {hasBrandColors && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={brandGradientStyle}
            />
          )}
          
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">+</kbd> / <kbd className="px-1.5 py-0.5 bg-secondary rounded">-</kbd> Zoom</span>
            <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">0</kbd> Reset</span>
            <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Ctrl</kbd> + Scroll to zoom</span>
            <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Esc</kbd> Close</span>
          </div>
          
          {/* AI Feedback */}
          {user?.id && (
            <AIFeedback
              generationId={generationId || null}
              userId={user.id}
              compact
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AssetPreviewModal;
