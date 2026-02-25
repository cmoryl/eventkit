// Element Sidebar - Add elements and presets
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Type, Image, Square, Circle, Triangle, Star, 
  QrCode, Minus, ArrowRight, Upload, Palette,
  ChevronDown, ChevronRight, Search, Grid3X3, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CanvasElement, ShapeType } from '@/types/visualEditor.types';

interface ElementSidebarProps {
  onAddElement: (element: Partial<CanvasElement>) => void;
  brandColors?: string[];
}

interface ElementCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: ElementItem[];
}

interface ElementItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  element: Partial<CanvasElement>;
}

const SHAPE_ITEMS: ElementItem[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: <Square className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'rectangle', size: { width: 200, height: 150 }, style: { fill: '#3b82f6', borderRadius: 0 } }
  },
  {
    id: 'rounded-rect',
    name: 'Rounded Rectangle',
    icon: <Square className="h-5 w-5 rounded" />,
    element: { type: 'shape', shapeType: 'rectangle', size: { width: 200, height: 150 }, style: { fill: '#3b82f6', borderRadius: 12 } }
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: <Circle className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'circle', size: { width: 150, height: 150 }, style: { fill: '#10b981' } }
  },
  {
    id: 'triangle',
    name: 'Triangle',
    icon: <Triangle className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'triangle', size: { width: 150, height: 130 }, style: { fill: '#f59e0b' } }
  },
  {
    id: 'star',
    name: 'Star',
    icon: <Star className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'star', size: { width: 150, height: 150 }, style: { fill: '#ef4444' } }
  },
  {
    id: 'line',
    name: 'Line',
    icon: <Minus className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'line', size: { width: 200, height: 4 }, style: { fill: '#1a1a1a' } }
  },
  {
    id: 'arrow',
    name: 'Arrow',
    icon: <ArrowRight className="h-5 w-5" />,
    element: { type: 'shape', shapeType: 'arrow', size: { width: 200, height: 40 }, style: { fill: '#1a1a1a' } }
  }
];

const TEXT_ITEMS: ElementItem[] = [
  {
    id: 'heading',
    name: 'Heading',
    icon: <Type className="h-5 w-5" />,
    element: { 
      type: 'text', 
      content: 'Add heading',
      size: { width: 300, height: 60 },
      textStyle: { 
        fontFamily: 'Inter', 
        fontSize: 48, 
        fontWeight: 'bold',
        fontStyle: 'normal',
        textAlign: 'center',
        textDecoration: 'none',
        lineHeight: 1.2,
        letterSpacing: -1,
        textTransform: 'none',
        verticalAlign: 'middle'
      },
      style: { fill: '#1a1a1a' }
    }
  },
  {
    id: 'subheading',
    name: 'Subheading',
    icon: <Type className="h-4 w-4" />,
    element: { 
      type: 'text', 
      content: 'Add subheading',
      size: { width: 280, height: 40 },
      textStyle: { 
        fontFamily: 'Inter', 
        fontSize: 24, 
        fontWeight: '500',
        fontStyle: 'normal',
        textAlign: 'center',
        textDecoration: 'none',
        lineHeight: 1.3,
        letterSpacing: 0,
        textTransform: 'none',
        verticalAlign: 'middle'
      },
      style: { fill: '#4b5563' }
    }
  },
  {
    id: 'body',
    name: 'Body Text',
    icon: <Type className="h-3 w-3" />,
    element: { 
      type: 'text', 
      content: 'Add body text',
      size: { width: 300, height: 80 },
      textStyle: { 
        fontFamily: 'Inter', 
        fontSize: 16, 
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        lineHeight: 1.6,
        letterSpacing: 0,
        textTransform: 'none',
        verticalAlign: 'top'
      },
      style: { fill: '#1a1a1a' }
    }
  }
];

const MEDIA_ITEMS: ElementItem[] = [
  {
    id: 'image',
    name: 'Image',
    icon: <Image className="h-5 w-5" />,
    element: { type: 'image', size: { width: 300, height: 200 } }
  },
  {
    id: 'logo',
    name: 'Logo',
    icon: <Grid3X3 className="h-5 w-5" />,
    element: { type: 'logo', size: { width: 200, height: 100 } }
  },
  {
    id: 'qrcode',
    name: 'QR Code',
    icon: <QrCode className="h-5 w-5" />,
    element: { type: 'qrcode', size: { width: 150, height: 150 }, qrData: 'https://example.com' }
  }
];

const ELEMENT_CATEGORIES: ElementCategory[] = [
  { id: 'text', name: 'Text', icon: <Type className="h-4 w-4" />, items: TEXT_ITEMS },
  { id: 'shapes', name: 'Shapes', icon: <Square className="h-4 w-4" />, items: SHAPE_ITEMS },
  { id: 'media', name: 'Media', icon: <Image className="h-4 w-4" />, items: MEDIA_ITEMS }
];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export const ElementSidebar: React.FC<ElementSidebarProps> = ({
  onAddElement,
  brandColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['text', 'shapes', 'media']);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddElement = (item: ElementItem) => {
    onAddElement({
      ...item.element,
      name: item.name,
      position: { 
        x: 100 + Math.random() * 100, 
        y: 100 + Math.random() * 100 
      }
    });
  };

  // Process uploaded file and convert to data URL
  const processImageFile = useCallback((file: File): Promise<{ dataUrl: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        reject(new Error('Please upload a valid image file (JPG, PNG, GIF, WebP, or SVG)'));
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error('Image must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Get image dimensions
        const img = new window.Image();
        img.onload = () => {
          resolve({
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file input change
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const { dataUrl, width, height } = await processImageFile(file);
        
        // Scale down if too large (max 800px on any side for canvas)
        const maxDimension = 800;
        let scaledWidth = width;
        let scaledHeight = height;
        
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          scaledWidth = Math.round(width * scale);
          scaledHeight = Math.round(height * scale);
        }
        
        onAddElement({
          type: 'image',
          name: file.name.replace(/\.[^/.]+$/, ''),
          src: dataUrl,
          size: { width: scaledWidth, height: scaledHeight },
          position: { 
            x: 100 + Math.random() * 50, 
            y: 100 + Math.random() * 50 
          }
        });
      }
      
      toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''} to canvas`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processImageFile, onAddElement]);

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const filteredCategories = ELEMENT_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="w-48 lg:w-56 xl:w-64 border-r bg-background flex flex-col h-full overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm mb-2">Elements</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Brand Colors Quick Access */}
      <div className="p-3 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">Brand Colors</div>
        <div className="flex gap-1.5 flex-wrap">
          {brandColors.map((color, idx) => (
            <button
              key={idx}
              className="w-7 h-7 rounded-md border-2 border-transparent hover:border-primary transition-colors"
              style={{ backgroundColor: color }}
              onClick={() => onAddElement({
                type: 'shape',
                shapeType: 'rectangle',
                size: { width: 100, height: 100 },
                style: { fill: color },
                position: { x: 100, y: 100 }
              })}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Element Categories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredCategories.map(category => (
            <div key={category.id} className="mb-2">
              {/* Category Header */}
              <button
                className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-lg transition-colors text-sm font-medium"
                onClick={() => toggleCategory(category.id)}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {category.icon}
                {category.name}
                <span className="text-xs text-muted-foreground ml-auto">
                  {category.items.length}
                </span>
              </button>

              {/* Category Items */}
              {expandedCategories.includes(category.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 gap-1.5 pl-6 pr-2 mt-1"
                >
                  {category.items.map(item => (
                    <button
                      key={item.id}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg',
                        'border border-transparent hover:border-primary/20 hover:bg-muted',
                        'transition-colors text-center group'
                      )}
                      onClick={() => handleAddElement(item)}
                    >
                      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-xs">{item.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Upload Section */}
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            or drag & drop onto canvas
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};
