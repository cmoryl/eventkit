import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, RotateCcw, Download, Plus, Trash2, 
  Type, Image, Star, Square, Layers, Film, Settings,
  ChevronDown, Copy, Maximize2, Minimize2,
  Sparkles, Zap, ArrowRight, ZoomIn, Sun, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AnimatedBannerConfig, AnimationLayer, AnimationPreset,
  ANIMATION_PRESETS, BANNER_TEMPLATES, PRESET_CATEGORIES,
  getPresetById, getPresetsForElementType, BannerTemplate,
} from '@/config/animationPresets';
import { AnimatedBannerPreview } from './AnimatedBannerPreview';
import { BannerExporter } from './BannerExporter';
import { Brand } from '@/types/studio.types';

interface AnimatedBannerEditorProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
  assetName: string;
  brand?: Brand | null;
  backgroundImage?: string;
  initialWidth?: number;
  initialHeight?: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const AnimatedBannerEditor: React.FC<AnimatedBannerEditorProps> = ({
  isOpen,
  onClose,
  assetType,
  assetName,
  brand,
  backgroundImage,
  initialWidth = 1080,
  initialHeight = 1080,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExporter, setShowExporter] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('templates');

  const brandPrimary = brand?.styles?.primary_color || 'hsl(var(--primary))';
  const brandSecondary = brand?.styles?.secondary_color || 'hsl(var(--secondary))';

  const [config, setConfig] = useState<AnimatedBannerConfig>(() => ({
    id: generateId(),
    name: assetName,
    canvasWidth: initialWidth,
    canvasHeight: initialHeight,
    backgroundColor: '#1a1a2e',
    backgroundGradient: `linear-gradient(135deg, ${brandPrimary}, ${brandSecondary || '#1a1a2e'})`,
    layers: [],
    totalDuration: 4,
    loop: true,
  }));

  // Reset on dimension change
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      canvasWidth: initialWidth,
      canvasHeight: initialHeight,
    }));
  }, [initialWidth, initialHeight]);

  const selectedLayer = config.layers.find(l => l.id === selectedLayerId);

  // Calculate preview scale to fit in the preview area
  const maxPreviewWidth = 640;
  const maxPreviewHeight = 500;
  const scaleX = maxPreviewWidth / config.canvasWidth;
  const scaleY = maxPreviewHeight / config.canvasHeight;
  const previewScale = Math.min(scaleX, scaleY, 1);

  const updateLayer = useCallback((layerId: string, updates: Partial<AnimationLayer>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === layerId ? { ...l, ...updates } : l),
    }));
  }, []);

  const updateLayerStyle = useCallback((layerId: string, styleUpdates: Partial<AnimationLayer['style']>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => 
        l.id === layerId ? { ...l, style: { ...l.style, ...styleUpdates } } : l
      ),
    }));
  }, []);

  const addLayer = useCallback((type: AnimationLayer['type']) => {
    const newLayer: AnimationLayer = {
      id: generateId(),
      type,
      content: type === 'text' ? 'Your Text Here' : type === 'logo' ? 'LOGO' : '',
      preset: type === 'text' ? 'fade-up' : type === 'logo' ? 'zoom-in' : 'fade-in',
      delay: config.layers.length * 0.3,
      style: {
        x: 10,
        y: 30 + config.layers.length * 15,
        width: 80,
        height: 15,
        fontSize: type === 'text' ? 32 : 14,
        fontWeight: type === 'text' ? '700' : '400',
        color: '#FFFFFF',
        textAlign: 'center',
        zIndex: config.layers.length + 1,
      },
    };
    setConfig(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
    setSelectedLayerId(newLayer.id);
    setActiveTab('layers');
  }, [config.layers.length]);

  const removeLayer = useCallback((layerId: string) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== layerId),
    }));
    if (selectedLayerId === layerId) setSelectedLayerId(null);
  }, [selectedLayerId]);

  const applyTemplate = useCallback((template: BannerTemplate) => {
    setConfig(prev => ({
      ...prev,
      canvasWidth: template.width,
      canvasHeight: template.height,
      layers: template.layers.map(l => ({ ...l, id: generateId() })),
      totalDuration: template.totalDuration,
      name: template.name,
    }));
    setSelectedLayerId(null);
    setIsPlaying(false);
    toast.success(`Applied template: ${template.name}`);
  }, []);

  const handleReplay = useCallback(() => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  if (!isOpen) return null;

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'text-reveal': return <Type className="w-3.5 h-3.5" />;
      case 'zoom': return <ZoomIn className="w-3.5 h-3.5" />;
      case 'slide': return <ArrowRight className="w-3.5 h-3.5" />;
      case 'fade': return <Sun className="w-3.5 h-3.5" />;
      case 'dynamic': return <Sparkles className="w-3.5 h-3.5" />;
      case 'cinematic': return <Film className="w-3.5 h-3.5" />;
      default: return <Zap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Top Bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="font-semibold">Animated Banner Editor</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {config.canvasWidth}×{config.canvasHeight}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReplay}>
              <RotateCcw className="h-4 w-4 mr-1" /> Replay
            </Button>
            <Button
              variant={isPlaying ? 'secondary' : 'default'}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button size="sm" className="bg-primary" onClick={() => setShowExporter(true)}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Presets & Templates */}
          <aside className="w-72 border-r border-border bg-card/50 flex flex-col shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent h-10 shrink-0">
                <TabsTrigger value="templates" className="text-xs flex-1">Templates</TabsTrigger>
                <TabsTrigger value="presets" className="text-xs flex-1">Presets</TabsTrigger>
                <TabsTrigger value="layers" className="text-xs flex-1">Layers</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                <TabsContent value="templates" className="m-0 p-3 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Start with a pre-built animated template</p>
                  {BANNER_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Film className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{template.aspectRatio}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{template.totalDuration}s</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{template.layers.length} layers</span>
                      </div>
                    </button>
                  ))}
                </TabsContent>

                <TabsContent value="presets" className="m-0 p-3 space-y-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedLayerId ? 'Click a preset to apply to selected layer' : 'Select a layer first, then choose a preset'}
                  </p>
                  {PRESET_CATEGORIES.map(cat => (
                    <div key={cat.id}>
                      <div className="flex items-center gap-2 mb-2">
                        {categoryIcon(cat.id)}
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ANIMATION_PRESETS.filter(p => p.category === cat.id).map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              if (selectedLayerId) {
                                updateLayer(selectedLayerId, { preset: preset.id });
                                toast.success(`Applied: ${preset.name}`);
                              } else {
                                toast.error('Select a layer first');
                              }
                            }}
                            className={cn(
                              "text-left p-2 rounded-md border transition-all text-xs",
                              selectedLayer?.preset === preset.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/30 hover:bg-muted/50"
                            )}
                          >
                            <span className="font-medium block">{preset.name}</span>
                            <span className="text-muted-foreground text-[10px] line-clamp-1">{preset.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="layers" className="m-0 p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">LAYERS ({config.layers.length})</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addLayer('text')} title="Add Text">
                        <Type className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addLayer('logo')} title="Add Logo">
                        <Star className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addLayer('overlay')} title="Add Overlay">
                        <Square className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {config.layers.map((layer, i) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                        selectedLayerId === layer.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
                        {layer.type === 'text' ? <Type className="w-3 h-3" /> :
                         layer.type === 'logo' ? <Star className="w-3 h-3" /> :
                         layer.type === 'image' ? <Image className="w-3 h-3" /> :
                         <Square className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {layer.content || `${layer.type} layer`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {getPresetById(layer.preset)?.name || 'None'} • {layer.delay}s delay
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" 
                        onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {config.layers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No layers yet</p>
                      <p className="text-[10px]">Pick a template or add layers manually</p>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>

          {/* Center - Preview */}
          <main className="flex-1 flex flex-col items-center justify-center bg-muted/30 p-6 overflow-auto">
            <div className="relative bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] rounded-lg shadow-xl overflow-hidden">
              <AnimatedBannerPreview
                config={config}
                isPlaying={isPlaying}
                scale={previewScale}
                canvasRef={canvasRef}
              />
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{config.layers.length} layers</span>
              <span>•</span>
              <span>{config.totalDuration}s duration</span>
              <span>•</span>
              <span>{config.canvasWidth}×{config.canvasHeight}</span>
              {config.loop && <><span>•</span><span>Looping</span></>}
            </div>
          </main>

          {/* Right Sidebar - Layer Properties */}
          <aside className="w-72 border-l border-border bg-card/50 shrink-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {selectedLayer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Layer Properties</h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLayer(selectedLayer.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>

                    {/* Content */}
                    {(selectedLayer.type === 'text' || selectedLayer.type === 'logo') && (
                      <div className="space-y-2">
                        <Label className="text-xs">Content</Label>
                        <Input
                          value={selectedLayer.content}
                          onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                    )}

                    {/* Animation Preset */}
                    <div className="space-y-2">
                      <Label className="text-xs">Animation</Label>
                      <Select
                        value={selectedLayer.preset}
                        onValueChange={(v) => updateLayer(selectedLayer.id, { preset: v })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMATION_PRESETS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-xs">
                              {p.name} — {p.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Delay */}
                    <div className="space-y-2">
                      <Label className="text-xs">Delay: {selectedLayer.delay.toFixed(1)}s</Label>
                      <Slider
                        value={[selectedLayer.delay]}
                        min={0}
                        max={5}
                        step={0.1}
                        onValueChange={([v]) => updateLayer(selectedLayer.id, { delay: v })}
                      />
                    </div>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">X Position (%)</Label>
                        <Input
                          type="number"
                          value={selectedLayer.style.x}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { x: Number(e.target.value) })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Y Position (%)</Label>
                        <Input
                          type="number"
                          value={selectedLayer.style.y}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { y: Number(e.target.value) })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Width (%)</Label>
                        <Input
                          type="number"
                          value={selectedLayer.style.width}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { width: Number(e.target.value) })}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Height (%)</Label>
                        <Input
                          type="number"
                          value={selectedLayer.style.height}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { height: Number(e.target.value) })}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    {/* Typography */}
                    {(selectedLayer.type === 'text' || selectedLayer.type === 'logo') && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Font Size</Label>
                          <Slider
                            value={[selectedLayer.style.fontSize || 24]}
                            min={10}
                            max={120}
                            step={1}
                            onValueChange={([v]) => updateLayerStyle(selectedLayer.id, { fontSize: v })}
                          />
                          <span className="text-[10px] text-muted-foreground">{selectedLayer.style.fontSize || 24}px</span>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Font Weight</Label>
                          <Select
                            value={selectedLayer.style.fontWeight || '400'}
                            onValueChange={(v) => updateLayerStyle(selectedLayer.id, { fontWeight: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">Light</SelectItem>
                              <SelectItem value="400">Regular</SelectItem>
                              <SelectItem value="500">Medium</SelectItem>
                              <SelectItem value="600">Semibold</SelectItem>
                              <SelectItem value="700">Bold</SelectItem>
                              <SelectItem value="800">Extra Bold</SelectItem>
                              <SelectItem value="900">Black</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Text Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={selectedLayer.style.color || '#FFFFFF'}
                              onChange={(e) => updateLayerStyle(selectedLayer.id, { color: e.target.value })}
                              className="w-8 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={selectedLayer.style.color || '#FFFFFF'}
                              onChange={(e) => updateLayerStyle(selectedLayer.id, { color: e.target.value })}
                              className="h-8 text-xs flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Text Align</Label>
                          <Select
                            value={selectedLayer.style.textAlign || 'center'}
                            onValueChange={(v) => updateLayerStyle(selectedLayer.id, { textAlign: v as any })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label className="text-xs">Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedLayer.style.backgroundColor || '#00000000'}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { backgroundColor: e.target.value })}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          value={selectedLayer.style.backgroundColor || ''}
                          onChange={(e) => updateLayerStyle(selectedLayer.id, { backgroundColor: e.target.value })}
                          placeholder="transparent"
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Banner Settings</h3>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value, backgroundGradient: undefined }))}
                          className="w-8 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value, backgroundGradient: undefined }))}
                          className="h-8 text-xs flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Background Gradient</Label>
                      <Input
                        value={config.backgroundGradient || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, backgroundGradient: e.target.value || undefined }))}
                        placeholder="linear-gradient(135deg, #1a1a2e, #e63946)"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Duration: {config.totalDuration}s</Label>
                      <Slider
                        value={[config.totalDuration]}
                        min={2}
                        max={15}
                        step={0.5}
                        onValueChange={([v]) => setConfig(prev => ({ ...prev, totalDuration: v }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Loop Animation</Label>
                      <Button
                        variant={config.loop ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setConfig(prev => ({ ...prev, loop: !prev.loop }))}
                      >
                        {config.loop ? 'On' : 'Off'}
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        Select a layer to edit its properties, or use the Templates tab to start with a preset.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </motion.div>

      {/* Export Modal */}
      {showExporter && (
        <BannerExporter
          isOpen={showExporter}
          onClose={() => setShowExporter(false)}
          config={config}
          canvasRef={canvasRef}
        />
      )}
    </AnimatePresence>
  );
};
