import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Video, 
  Grid3X3, 
  LayoutGrid,
  Camera,
  Palette,
  FileImage,
  Share2,
  Flag,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Upload,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';

interface BrandImagery {
  all: string[];
  byType: {
    logos?: string[];
    brandIcons?: string[];
    patterns?: string[];
    photography?: string[];
    heroImages?: string[];
    collateral?: string[];
    social?: string[];
    banners?: string[];
    video?: string[];
  };
}

interface BrandImageryGalleryProps {
  imagery: BrandImagery | undefined;
  brandName: string;
  onImagesAdded?: (images: string[], category: string) => void;
  onImageRemoved?: (url: string) => void;
  editable?: boolean;
}

const categoryConfig = {
  logos: { label: 'Logos', icon: Flag, color: 'text-blue-500' },
  brandIcons: { label: 'Brand Icons', icon: Grid3X3, color: 'text-purple-500' },
  patterns: { label: 'Patterns', icon: Palette, color: 'text-pink-500' },
  photography: { label: 'Photography', icon: Camera, color: 'text-green-500' },
  heroImages: { label: 'Hero Images', icon: LayoutGrid, color: 'text-orange-500' },
  collateral: { label: 'Collateral', icon: FileImage, color: 'text-cyan-500' },
  social: { label: 'Social', icon: Share2, color: 'text-indigo-500' },
  banners: { label: 'Banners', icon: Layers, color: 'text-amber-500' },
  video: { label: 'Video', icon: Video, color: 'text-red-500' }
};

type CategoryKey = keyof typeof categoryConfig;

export const BrandImageryGallery: React.FC<BrandImageryGalleryProps> = ({ 
  imagery, 
  brandName,
  onImagesAdded,
  onImageRemoved,
  editable = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [uploadCategory, setUploadCategory] = useState<CategoryKey>('photography');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImages = imagery && imagery.all && imagery.all.length > 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 20) {
      toast.error('Maximum 20 images per upload');
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push(base64);
    }

    if (newImages.length > 0 && onImagesAdded) {
      onImagesAdded(newImages, uploadCategory);
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added to ${categoryConfig[uploadCategory].label}`);
    }

    setIsUploading(false);
    if (e.target) e.target.value = '';
  };

  if (!hasImages && !editable) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No imagery imported yet</p>
        <p className="text-xs mt-1">Sync from BrandHub to import brand imagery</p>
      </div>
    );
  }

  // Get active categories (those with images)
  const activeCategories = Object.entries(imagery?.byType || {})
    .filter(([_, urls]) => urls && urls.length > 0)
    .map(([key]) => key as CategoryKey);

  const allImages = imagery?.all || [];

  // Get images for current selection
  const currentImages = selectedCategory === 'all' 
    ? allImages 
    : imagery?.byType[selectedCategory] || [];


  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
    } else {
      setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = url.split('/').pop() || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0",
              selectedCategory === 'all'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            All ({allImages.length})
          </button>
          {activeCategories.map((cat) => {
            const config = categoryConfig[cat];
            const count = imagery?.byType[cat]?.length || 0;
            const Icon = config.icon;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 shrink-0",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", selectedCategory !== cat && config.color)} />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Upload Area (editable mode) */}
      {editable && (
        <div className="p-3 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as CategoryKey)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload Images</>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">Select multiple images (max 20 per batch, 10MB each)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        <AnimatePresence mode="popLayout">
          {currentImages.map((url, index) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group relative cursor-pointer rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-colors"
              onClick={() => openLightbox(currentImages, index)}
            >
              <AspectRatio ratio={1}>
                <img 
                  src={url} 
                  alt={`${brandName} asset ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                <span className="text-white text-xs font-medium">View</span>
              </div>
              {editable && onImageRemoved && (
                <button
                  onClick={(e) => { e.stopPropagation(); onImageRemoved(url); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state for editable with no images */}
      {editable && currentImages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No images yet — upload some above</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
        {activeCategories.map((cat) => {
          const config = categoryConfig[cat];
          const count = imagery?.byType[cat]?.length || 0;
          const Icon = config.icon;
          
          return (
            <div 
              key={cat}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Icon className={cn("w-3.5 h-3.5", config.color)} />
              <span>{count} {config.label.toLowerCase()}</span>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={lightboxImages[lightboxIndex]}
              alt={`${brandName} asset`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Footer controls */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-white text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </span>
              <div className="w-px h-4 bg-white/30" />
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8"
                onClick={() => handleDownload(lightboxImages[lightboxIndex])}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8"
                onClick={() => window.open(lightboxImages[lightboxIndex], '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
