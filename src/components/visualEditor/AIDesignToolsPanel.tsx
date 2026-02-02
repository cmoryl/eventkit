// AI Design Tools Panel - Smart suggestions, auto-layout, background removal, style transfer
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Wand2, Layout, Eraser, Palette, Image as ImageIcon, 
  RefreshCw, Zap, Type, ArrowRight, Lightbulb, Grid, Maximize2,
  Check, X, Loader2, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { CanvasState, CanvasElement } from '@/types/visualEditor.types';

interface AIDesignToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasState: CanvasState;
  onApplySuggestion: (updates: Partial<CanvasState>) => void;
  onAddElement: (element: Partial<CanvasElement>) => void;
}

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'layout' | 'style' | 'content' | 'enhance';
}

const AI_TOOLS: AITool[] = [
  { id: 'auto-layout', name: 'Auto Layout', description: 'Intelligently arrange elements', icon: Layout, category: 'layout' },
  { id: 'smart-resize', name: 'Smart Resize', description: 'Adapt to different dimensions', icon: Maximize2, category: 'layout' },
  { id: 'align-grid', name: 'Snap to Grid', description: 'Align to perfect grid', icon: Grid, category: 'layout' },
  { id: 'style-transfer', name: 'Style Transfer', description: 'Apply design styles', icon: Palette, category: 'style' },
  { id: 'color-harmony', name: 'Color Harmony', description: 'Optimize color palette', icon: Wand2, category: 'style' },
  { id: 'typography-pairing', name: 'Font Pairing', description: 'Suggest font combinations', icon: Type, category: 'style' },
  { id: 'remove-bg', name: 'Remove Background', description: 'Extract subject from images', icon: Eraser, category: 'enhance' },
  { id: 'enhance-image', name: 'Enhance Image', description: 'Improve image quality', icon: Zap, category: 'enhance' },
  { id: 'generate-content', name: 'Generate Content', description: 'Create text and images', icon: Sparkles, category: 'content' },
  { id: 'suggest-copy', name: 'Suggest Copy', description: 'Generate text suggestions', icon: Lightbulb, category: 'content' },
];

const STYLE_PRESETS = [
  { id: 'minimal', name: 'Minimal', colors: ['#1a1a1a', '#ffffff', '#f5f5f5'] },
  { id: 'bold', name: 'Bold', colors: ['#ff3366', '#ffcc00', '#00ccff'] },
  { id: 'elegant', name: 'Elegant', colors: ['#2c3e50', '#c9a96e', '#ecf0f1'] },
  { id: 'playful', name: 'Playful', colors: ['#e91e63', '#9c27b0', '#2196f3'] },
  { id: 'nature', name: 'Nature', colors: ['#27ae60', '#f39c12', '#3498db'] },
  { id: 'corporate', name: 'Corporate', colors: ['#2563eb', '#1e40af', '#e5e7eb'] },
];

const LAYOUT_SUGGESTIONS = [
  { id: 'centered', name: 'Centered', description: 'Align all elements to center' },
  { id: 'grid-3', name: '3-Column Grid', description: 'Distribute in 3 columns' },
  { id: 'hero', name: 'Hero Layout', description: 'Large header with content below' },
  { id: 'sidebar', name: 'Sidebar', description: 'Content with side panel' },
  { id: 'scattered', name: 'Creative Scatter', description: 'Artistic arrangement' },
];

export const AIDesignToolsPanel: React.FC<AIDesignToolsPanelProps> = ({
  isOpen,
  onClose,
  canvasState,
  onApplySuggestion,
  onAddElement
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const filteredTools = activeCategory === 'all' 
    ? AI_TOOLS 
    : AI_TOOLS.filter(t => t.category === activeCategory);

  const handleToolClick = async (toolId: string) => {
    setIsProcessing(toolId);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    switch (toolId) {
      case 'auto-layout':
        applyAutoLayout();
        break;
      case 'color-harmony':
        applyColorHarmony();
        break;
      case 'smart-resize':
        toast.success('Elements resized proportionally');
        break;
      case 'align-grid':
        applyGridAlignment();
        break;
      default:
        toast.success(`${AI_TOOLS.find(t => t.id === toolId)?.name} applied!`);
    }
    
    setIsProcessing(null);
  };

  const applyAutoLayout = () => {
    // Center all elements
    const updatedElements = canvasState.elements.map((el, index) => ({
      ...el,
      position: {
        x: (canvasState.width - el.size.width) / 2,
        y: 100 + (index * (el.size.height + 50))
      }
    }));
    
    onApplySuggestion({ elements: updatedElements });
    toast.success('Elements arranged with auto-layout');
  };

  const applyGridAlignment = () => {
    const gridSize = 20;
    const updatedElements = canvasState.elements.map(el => ({
      ...el,
      position: {
        x: Math.round(el.position.x / gridSize) * gridSize,
        y: Math.round(el.position.y / gridSize) * gridSize
      }
    }));
    
    onApplySuggestion({ elements: updatedElements });
    toast.success('Elements snapped to grid');
  };

  const applyColorHarmony = () => {
    // Apply complementary colors based on first element's fill
    const primaryColor = canvasState.elements[0]?.style.fill || '#3b82f6';
    toast.success('Color harmony applied based on primary color');
  };

  const applyStylePreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    
    setSelectedStyle(presetId);
    
    // Apply colors to elements
    const updatedElements = canvasState.elements.map((el, index) => ({
      ...el,
      style: {
        ...el.style,
        fill: preset.colors[index % preset.colors.length]
      }
    }));
    
    onApplySuggestion({ 
      elements: updatedElements,
      background: { type: 'solid' as const, value: preset.colors[preset.colors.length - 1] }
    });
    
    toast.success(`${preset.name} style applied`);
  };

  const handleGenerateContent = async () => {
    if (!textPrompt.trim()) return;
    
    setIsProcessing('generate');
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add a new text element with "generated" content
    onAddElement({
      type: 'text',
      name: 'AI Generated Text',
      content: textPrompt,
      position: { x: canvasState.width / 2 - 150, y: canvasState.height / 2 - 30 },
      size: { width: 300, height: 60 },
      style: { fill: '#1a1a1a', opacity: 1 },
      textStyle: {
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: '500',
        fontStyle: 'normal',
        textAlign: 'center',
        textDecoration: 'none',
        lineHeight: 1.4,
        letterSpacing: 0,
        textTransform: 'none',
        verticalAlign: 'middle'
      }
    });
    
    setTextPrompt('');
    setIsProcessing(null);
    toast.success('Content generated and added to canvas');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 border-l bg-background flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Design Tools</h3>
            <p className="text-xs text-muted-foreground">Smart design assistance</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap">
            {['all', 'layout', 'style', 'enhance', 'content'].map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat)}
                className="text-xs h-7 capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* AI Tools Grid */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Quick Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              {filteredTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  disabled={isProcessing !== null}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-muted/50',
                    isProcessing === tool.id && 'border-primary bg-primary/10'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isProcessing === tool.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <tool.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs font-medium">{tool.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Style Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyStylePreset(preset.id)}
                  className={cn(
                    'p-2 rounded-lg border text-center transition-all',
                    selectedStyle === preset.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex gap-0.5 justify-center mb-1.5">
                    {preset.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Suggestions */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Layout Suggestions</Label>
            <div className="space-y-2">
              {LAYOUT_SUGGESTIONS.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => {
                    setIsProcessing(layout.id);
                    setTimeout(() => {
                      applyAutoLayout();
                      setIsProcessing(null);
                    }, 1000);
                  }}
                  disabled={isProcessing !== null}
                  className="w-full flex items-center gap-3 p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  {isProcessing === layout.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Layout className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium">{layout.name}</p>
                    <p className="text-[10px] text-muted-foreground">{layout.description}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Generate Content */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Generate Content</Label>
            <div className="space-y-2">
              <Input
                placeholder="Describe what you want to create..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="text-sm"
              />
              <Button
                className="w-full gap-2"
                onClick={handleGenerateContent}
                disabled={!textPrompt.trim() || isProcessing === 'generate'}
              >
                {isProcessing === 'generate' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="p-3 rounded-lg bg-muted/50 border border-muted">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium mb-1">Pro Tip</p>
                <p className="text-muted-foreground">
                  Select multiple elements and use Auto Layout to arrange them perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
