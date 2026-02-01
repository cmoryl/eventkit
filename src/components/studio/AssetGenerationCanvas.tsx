import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, RefreshCw, Check, ArrowLeft, Loader2, 
  Wand2, Download, ChevronRight, Palette, ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brand } from '@/types/studio.types';
import { AIImageEditModal } from '@/components/AIImageEditModal';

interface AssetGenerationCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
  assetName: string;
  assetDescription?: string;
  dimensions?: string;
  brand: Brand | null;
  eventName?: string;
  studioGradient?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

interface GenerationVariation {
  id: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'complete' | 'error';
  prompt?: string;
}

const VARIATION_COUNT = 4;

export const AssetGenerationCanvas: React.FC<AssetGenerationCanvasProps> = ({
  isOpen,
  onClose,
  assetType,
  assetName,
  assetDescription,
  dimensions,
  brand,
  eventName = 'Your Event',
  studioGradient = 'from-primary to-accent',
  onImageGenerated
}) => {
  const [variations, setVariations] = useState<GenerationVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'generating' | 'complete'>('idle');

  // Initialize variations when opened
  useEffect(() => {
    if (isOpen) {
      initializeAndGenerate();
    } else {
      // Reset state when closed
      setVariations([]);
      setSelectedVariation(null);
      setGenerationPhase('idle');
      setShowEditor(false);
    }
  }, [isOpen, assetType]);

  const initializeAndGenerate = async () => {
    // Create initial variation slots
    const initialVariations: GenerationVariation[] = Array.from({ length: VARIATION_COUNT }, (_, i) => ({
      id: `var-${i}`,
      imageUrl: null,
      status: 'pending'
    }));
    setVariations(initialVariations);
    setGenerationPhase('generating');
    setIsGenerating(true);

    // Generate all variations in parallel with slight style variations
    const styleVariants = [
      'modern and minimalist with clean lines',
      'bold and dynamic with vibrant energy',
      'elegant and sophisticated with premium feel',
      'creative and artistic with unique flair'
    ];

    const generatePromises = initialVariations.map(async (variation, index) => {
      // Update to generating status
      setVariations(prev => prev.map(v => 
        v.id === variation.id ? { ...v, status: 'generating' } : v
      ));

      try {
        const prompt = buildPrompt(styleVariants[index]);
        
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: {
            prompt,
            assetType,
            eventName,
            brandContext: brand ? {
              name: brand.name,
              colors: brand.styles?.color_palette,
              primaryColor: brand.styles?.primary_color,
              secondaryColor: brand.styles?.secondary_color,
              headingFont: brand.styles?.heading_font,
              bodyFont: brand.styles?.body_font,
              industry: brand.styles?.industry,
              mood: brand.styles?.mood_keywords,
              imageryStyle: brand.styles?.imagery_style,
              brandVoice: brand.styles?.brand_voice,
              customPrompts: brand.styles?.custom_prompts
            } : null,
            dimensions: parseDimensions(dimensions)
          }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setVariations(prev => prev.map(v => 
          v.id === variation.id 
            ? { ...v, status: 'complete', imageUrl: data.imageUrl, prompt }
            : v
        ));

        return { id: variation.id, success: true, imageUrl: data.imageUrl };
      } catch (err) {
        console.error(`Error generating variation ${index}:`, err);
        setVariations(prev => prev.map(v => 
          v.id === variation.id ? { ...v, status: 'error' } : v
        ));
        return { id: variation.id, success: false };
      }
    });

    await Promise.all(generatePromises);
    setIsGenerating(false);
    setGenerationPhase('complete');
  };

  const buildPrompt = (styleVariant: string): string => {
    let prompt = `Create a professional ${assetName} for "${eventName}". Style: ${styleVariant}.`;
    
    if (brand?.styles) {
      const { mood_keywords, industry, imagery_style } = brand.styles;
      if (mood_keywords?.length) prompt += ` Mood: ${mood_keywords.join(', ')}.`;
      if (industry) prompt += ` Industry: ${industry}.`;
      if (imagery_style) prompt += ` Visual style: ${imagery_style}.`;
    }
    
    if (assetDescription) {
      prompt += ` ${assetDescription}`;
    }
    
    return prompt;
  };

  const parseDimensions = (dims?: string): { width: number; height: number } | undefined => {
    if (!dims) return undefined;
    
    // Handle pixel dimensions like "1080×1080"
    const pixelMatch = dims.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (pixelMatch) {
      return { width: parseInt(pixelMatch[1]), height: parseInt(pixelMatch[2]) };
    }
    
    // Default
    return { width: 1024, height: 1024 };
  };

  const handleSelectVariation = (variationId: string) => {
    const variation = variations.find(v => v.id === variationId);
    if (variation?.status !== 'complete' || !variation.imageUrl) return;
    
    setSelectedVariation(variationId);
    
    // Auto-open editor after selection
    setTimeout(() => {
      setEditingImageUrl(variation.imageUrl);
      setShowEditor(true);
    }, 300);
  };

  const handleImageEdited = (newImageUrl: string) => {
    // Update the selected variation with edited image
    if (selectedVariation) {
      setVariations(prev => prev.map(v => 
        v.id === selectedVariation ? { ...v, imageUrl: newImageUrl } : v
      ));
    }
    setShowEditor(false);
    onImageGenerated?.(newImageUrl);
  };

  const handleRegenerateVariation = async (variationId: string) => {
    const index = variations.findIndex(v => v.id === variationId);
    if (index === -1) return;

    setVariations(prev => prev.map(v => 
      v.id === variationId ? { ...v, status: 'generating', imageUrl: null } : v
    ));

    const styleVariants = [
      'modern and minimalist with clean lines',
      'bold and dynamic with vibrant energy',
      'elegant and sophisticated with premium feel',
      'creative and artistic with unique flair'
    ];

    try {
      const prompt = buildPrompt(styleVariants[index]);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          assetType,
          eventName,
          brandContext: brand ? {
            name: brand.name,
            colors: brand.styles?.color_palette,
            primaryColor: brand.styles?.primary_color,
            secondaryColor: brand.styles?.secondary_color
          } : null,
          dimensions: parseDimensions(dimensions)
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setVariations(prev => prev.map(v => 
        v.id === variationId 
          ? { ...v, status: 'complete', imageUrl: data.imageUrl, prompt }
          : v
      ));
    } catch (err) {
      console.error('Error regenerating:', err);
      setVariations(prev => prev.map(v => 
        v.id === variationId ? { ...v, status: 'error' } : v
      ));
      toast.error('Failed to regenerate variation');
    }
  };

  const handleRegenerateAll = () => {
    initializeAndGenerate();
  };

  const handleUseSelected = () => {
    const variation = variations.find(v => v.id === selectedVariation);
    if (variation?.imageUrl) {
      onImageGenerated?.(variation.imageUrl);
      onClose();
      toast.success(`${assetName} saved to your project`);
    }
  };

  const completedCount = variations.filter(v => v.status === 'complete').length;
  const progressPercent = (completedCount / VARIATION_COUNT) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", studioGradient)}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{assetName}</h1>
                <p className="text-xs text-muted-foreground">{dimensions}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {brand && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: brand.styles?.primary_color || '#6366f1' }} 
                />
                <span className="text-sm font-medium">{brand.name}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRegenerateAll}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              Regenerate All
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-auto p-8">
          {/* Generation Progress */}
          {generationPhase === 'generating' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="max-w-xl mx-auto text-center space-y-4">
                <div className="flex items-center justify-center gap-3 text-lg font-medium">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  Generating {VARIATION_COUNT} variations...
                </div>
                
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full bg-gradient-to-r rounded-full", studioGradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {VARIATION_COUNT} complete
                </p>
              </div>
            </motion.div>
          )}

          {/* Completion Message */}
          {generationPhase === 'complete' && !selectedVariation && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-lg font-medium text-primary mb-2">
                <Check className="h-5 w-5" />
                All variations ready!
              </div>
              <p className="text-muted-foreground">
                Click on a variation to select it and open the editor
              </p>
            </motion.div>
          )}

          {/* Variations Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {variations.map((variation, index) => (
              <motion.div
                key={variation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all",
                  selectedVariation === variation.id
                    ? "border-primary ring-4 ring-primary/20 scale-[1.02]"
                    : variation.status === 'complete' 
                      ? "border-border hover:border-primary/50 hover:scale-[1.01]"
                      : "border-border"
                )}
                onClick={() => handleSelectVariation(variation.id)}
              >
                {/* Variation Label */}
                <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                  Variation {index + 1}
                </div>

                {/* Selection Indicator */}
                {selectedVariation === variation.id && (
                  <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* Regenerate Button */}
                {variation.status === 'complete' && selectedVariation !== variation.id && (
                  <button
                    className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerateVariation(variation.id);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}

                {/* Content */}
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative">
                  {variation.status === 'pending' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-muted-foreground text-sm">Waiting...</div>
                    </div>
                  )}

                  {variation.status === 'generating' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      
                      <div className="relative text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary mx-auto"
                        />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: [0.9, 1.1, 0.9] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="h-5 w-5 text-primary" />
                        </motion.div>
                        <p className="mt-3 text-sm text-muted-foreground">Creating...</p>
                      </div>
                    </div>
                  )}

                  {variation.status === 'complete' && variation.imageUrl && (
                    <img
                      src={variation.imageUrl}
                      alt={`Variation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {variation.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-destructive/10">
                      <X className="h-8 w-8 text-destructive" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateVariation(variation.id);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {variation.status === 'complete' && (
                  <div className="p-3 bg-card border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Style {index + 1}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Wand2 className="h-3 w-3" />
                        Click to edit
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Selected Variation Actions */}
          {selectedVariation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-sm border-t border-border"
            >
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Selected: </span>
                    <span className="font-medium">
                      Variation {variations.findIndex(v => v.id === selectedVariation) + 1}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedVariation(null)}
                  >
                    Deselect
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const variation = variations.find(v => v.id === selectedVariation);
                      if (variation?.imageUrl) {
                        setEditingImageUrl(variation.imageUrl);
                        setShowEditor(true);
                      }
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Edit in AI Editor
                  </Button>
                  
                  <Button
                    onClick={handleUseSelected}
                    className={cn("gap-2 bg-gradient-to-r", studioGradient)}
                  >
                    <Check className="h-4 w-4" />
                    Use This Design
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* AI Image Editor Modal */}
        {editingImageUrl && (
          <AIImageEditModal
            open={showEditor}
            onOpenChange={setShowEditor}
            imageUrl={editingImageUrl}
            eventName={eventName}
            onImageEdited={handleImageEdited}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
