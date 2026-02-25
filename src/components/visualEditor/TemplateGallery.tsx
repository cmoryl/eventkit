// Template Gallery - Browse and select templates
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, LayoutGrid, Square, RectangleVertical, RectangleHorizontal,
  Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EDITOR_TEMPLATES, TEMPLATE_CATEGORIES, EditorTemplate } from './editorTemplates';
import type { CanvasState } from '@/types/visualEditor.types';
import { TemplatePreviewRenderer } from '@/components/studio/TemplatePreviewRenderer';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (state: CanvasState) => void;
  currentCategory?: string;
}

// Mini canvas preview renderer
const TemplatePreview: React.FC<{ template: EditorTemplate }> = ({ template }) => {
  const { state } = template;
  const scale = 180 / Math.max(state.width, state.height);
  
  const renderBackground = () => {
    switch (state.background.type) {
      case 'solid':
        return { backgroundColor: state.background.value };
      case 'gradient':
        return { background: state.background.value };
      default:
        return { backgroundColor: '#ffffff' };
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-lg border bg-muted"
      style={{ 
        width: state.width * scale,
        height: state.height * scale,
        maxWidth: '100%',
        ...renderBackground()
      }}
    >
      {state.elements.map(element => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: element.position.x * scale,
          top: element.position.y * scale,
          width: element.size.width * scale,
          height: element.size.height * scale,
          transform: `rotate(${element.transform.rotation}deg)`,
          opacity: element.style.opacity ?? 1
        };

        if (element.type === 'shape') {
          return (
            <div
              key={element.id}
              style={{
                ...style,
                backgroundColor: element.style.fill,
                borderRadius: element.shapeType === 'circle' ? '50%' : element.style.borderRadius,
                border: element.style.stroke ? `${(element.style.strokeWidth || 1) * scale}px solid ${element.style.stroke}` : undefined
              }}
            />
          );
        }

        if (element.type === 'text') {
          return (
            <div
              key={element.id}
              style={{
                ...style,
                color: element.style.fill,
                fontSize: Math.max(4, (element.textStyle?.fontSize || 12) * scale),
                fontWeight: element.textStyle?.fontWeight,
                textAlign: element.textStyle?.textAlign,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.textStyle?.textAlign === 'center' ? 'center' : 
                               element.textStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start'
              }}
            >
              <span className="truncate leading-tight">{element.content}</span>
            </div>
          );
        }

        if (element.type === 'logo') {
          return (
            <div
              key={element.id}
              style={style}
              className="border border-dashed border-muted-foreground/30 rounded flex items-center justify-center"
            >
              <ImageIcon className="w-3 h-3 text-muted-foreground/50" />
            </div>
          );
        }

        if (element.type === 'qrcode') {
          return (
            <div
              key={element.id}
              style={style}
              className="bg-white border rounded flex items-center justify-center"
            >
              <div className="w-2/3 h-2/3 bg-black/10 rounded-sm" />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'All');

  const filteredTemplates = useMemo(() => {
    let templates = EDITOR_TEMPLATES;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      templates = templates.filter(t => t.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return templates;
  }, [selectedCategory, searchQuery]);

  const handleSelectTemplate = (template: EditorTemplate) => {
    // Deep clone the state to avoid mutations
    const clonedState = JSON.parse(JSON.stringify(template.state));
    onSelectTemplate(clonedState);
    onClose();
  };

  const getDimensionIcon = (template: EditorTemplate) => {
    const { width, height } = template.state;
    if (width === height) return <Square className="h-3 w-3" />;
    if (width > height) return <RectangleHorizontal className="h-3 w-3" />;
    return <RectangleVertical className="h-3 w-3" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Choose a Template</h2>
                <p className="text-sm text-muted-foreground">Start with a pre-designed template or blank canvas</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              {TEMPLATE_CATEGORIES.map(category => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTemplates.map(template => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'group relative flex flex-col rounded-xl border p-3 text-left transition-all',
                    'hover:border-primary hover:shadow-lg hover:bg-muted/30',
                    template.category === 'Blank' && 'border-dashed'
                  )}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Preview */}
                  <div className="w-full aspect-square flex items-center justify-center mb-3 bg-muted/50 rounded-lg overflow-hidden">
                    {template.category === 'Blank' ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {getDimensionIcon(template)}
                        <span className="text-xs">{template.state.width} × {template.state.height}</span>
                      </div>
                    ) : (
                      <TemplatePreview template={template} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {template.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Use Template
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No templates found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
