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
import { AssetBriefModal, type AssetBrief } from './AssetBriefModal';
import { 
  recordBriefPreference, 
  getBriefPreference,
  buildPromptFromBrief,
  type AssetBriefData 
} from '@/services/aiBrain/learningService';
import { useAuth } from '@/hooks/useAuth';
import { useActiveBrand } from '@/hooks/useActiveBrand';

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
  const { user } = useAuth();
  const { activeBrand, isThemeApplied } = useActiveBrand();
  const [variations, setVariations] = useState<GenerationVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'brief' | 'generating' | 'complete'>('idle');
  const [currentBrief, setCurrentBrief] = useState<AssetBrief | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  // Get brand colors for accents
  const brandPrimary = brand?.styles?.primary_color || activeBrand?.styles?.primary_color;
  const brandSecondary = brand?.styles?.secondary_color || activeBrand?.styles?.secondary_color;
  const brandAccent = brand?.styles?.accent_color || activeBrand?.styles?.accent_color;
  const hasBrandColors = brandPrimary || brandSecondary || brandAccent;

  // Initialize when opened - show brief modal first
  useEffect(() => {
    if (isOpen) {
      // Show brief modal before generation
      setShowBriefModal(true);
      setGenerationPhase('brief');
    } else {
      // Reset state when closed
      setVariations([]);
      setSelectedVariation(null);
      setGenerationPhase('idle');
      setShowEditor(false);
      setShowBriefModal(false);
      setCurrentBrief(null);
    }
  }, [isOpen, assetType]);

  // Handle brief submission
  const handleBriefSubmit = async (brief: AssetBrief) => {
    setCurrentBrief(brief);
    setShowBriefModal(false);
    
    // Record brief preference for AI learning
    if (user?.id) {
      const briefData: AssetBriefData = {
        customContent: brief.customContent,
        stylePreset: brief.stylePreset,
        customStyleDescription: brief.customStyleDescription,
        colorMood: brief.colorMood,
        layoutStyle: brief.layoutStyle,
        typographyStyle: brief.typographyStyle,
        imageryStyle: brief.imageryStyle,
        additionalNotes: brief.additionalNotes,
        referencePrompt: brief.referencePrompt,
        fontPairing: brief.fontPairing,
        customFonts: brief.customFonts,
        fontWeight: brief.fontWeight,
      };
      recordBriefPreference(user.id, assetType, briefData).catch(console.error);
    }
    
    // Start generation with brief
    initializeAndGenerateWithBrief(brief);
  };

  const initializeAndGenerateWithBrief = async (brief: AssetBrief) => {
    // Create initial variation slots
    const initialVariations: GenerationVariation[] = Array.from({ length: VARIATION_COUNT }, (_, i) => ({
      id: `var-${i}`,
      imageUrl: null,
      status: 'pending'
    }));
    setVariations(initialVariations);
    setGenerationPhase('generating');
    setIsGenerating(true);

    // Generate all variations in parallel with style variations based on brief
    const styleVariants = getStyleVariantsFromBrief(brief);

    const generatePromises = initialVariations.map(async (variation, index) => {
      // Update to generating status
      setVariations(prev => prev.map(v => 
        v.id === variation.id ? { ...v, status: 'generating' } : v
      ));

      try {
        const prompt = buildPromptWithBrief(brief, styleVariants[index]);
        
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
            dimensions: parseDimensions(dimensions),
            customContent: brief.customContent
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

  // Get style variants based on brief preferences
  const getStyleVariantsFromBrief = (brief: AssetBrief): string[] => {
    const baseStyle = {
      modern: 'modern and minimalist',
      classic: 'classic and timeless',
      bold: 'bold and impactful',
      minimal: 'minimal and clean',
      playful: 'playful and energetic',
      premium: 'premium and sophisticated',
      custom: brief.customStyleDescription || 'creative',
    }[brief.stylePreset] || 'professional';

    const colorStyle = {
      vibrant: 'vibrant saturated colors',
      muted: 'muted subtle tones',
      monochrome: 'monochromatic palette',
      'brand-only': 'strict brand colors',
      custom: 'custom color palette',
    }[brief.colorMood] || '';

    const layoutStyle = {
      centered: 'centered balanced composition',
      asymmetric: 'dynamic asymmetric layout',
      grid: 'structured grid-based layout',
      organic: 'organic flowing composition',
      'ai-decide': '',
    }[brief.layoutStyle] || '';

    // Create 4 variations with slight modifications
    return [
      `${baseStyle} with ${colorStyle}, ${layoutStyle}`,
      `${baseStyle} with ${colorStyle}, emphasizing visual hierarchy`,
      `${baseStyle} with ${colorStyle}, focus on typography and clarity`,
      `${baseStyle} with ${colorStyle}, creative artistic interpretation`,
    ];
  };

  const buildPromptWithBrief = (brief: AssetBrief, styleVariant: string): string => {
    const briefData: AssetBriefData = {
      customContent: brief.customContent,
      stylePreset: brief.stylePreset,
      customStyleDescription: brief.customStyleDescription,
      colorMood: brief.colorMood,
      layoutStyle: brief.layoutStyle,
      typographyStyle: brief.typographyStyle,
      imageryStyle: brief.imageryStyle,
      additionalNotes: brief.additionalNotes,
      referencePrompt: brief.referencePrompt,
      fontPairing: brief.fontPairing,
      customFonts: brief.customFonts,
      fontWeight: brief.fontWeight,
    };
    
    let prompt = buildPromptFromBrief(assetName, eventName, briefData, brand?.styles as unknown as Record<string, unknown>);
    
    // Add variation-specific style
    prompt += ` Variation emphasis: ${styleVariant}.`;
    
    if (assetDescription) {
      prompt += ` ${assetDescription}`;
    }
    
    return prompt;
  };

  // Legacy function for regeneration without brief
  const buildPrompt = (styleVariant: string): string => {
    if (currentBrief) {
      return buildPromptWithBrief(currentBrief, styleVariant);
    }
    
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
    if (currentBrief) {
      initializeAndGenerateWithBrief(currentBrief);
    } else {
      // Fallback - show brief modal again
      setShowBriefModal(true);
      setGenerationPhase('brief');
    }
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

  // Show brief modal first
  if (showBriefModal) {
    return (
      <AssetBriefModal
        isOpen={showBriefModal}
        onClose={onClose}
        onSubmit={handleBriefSubmit}
        assetType={assetType}
        assetName={assetName}
        brand={brand}
        eventName={eventName}
        studioGradient={studioGradient}
      />
    );
  }

  // Dynamic brand gradient style
  const brandGradientStyle = hasBrandColors 
    ? { 
        background: `linear-gradient(135deg, ${brandPrimary || 'hsl(var(--primary))'}, ${brandAccent || brandSecondary || 'hsl(var(--accent))'})` 
      }
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Brand Color Accent Bar */}
        {hasBrandColors && (
          <div 
            className="h-1 w-full"
            style={brandGradientStyle}
          />
        )}

        {/* Header */}
        <header className={cn(
          "h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm",
          hasBrandColors && "border-b-0"
        )}>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  !hasBrandColors && `bg-gradient-to-br ${studioGradient}`
                )}
                style={hasBrandColors ? brandGradientStyle : undefined}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{assetName}</h1>
                <p className="text-xs text-muted-foreground">{dimensions}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Brand Color Palette Pills */}
            {hasBrandColors && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
                {[brandPrimary, brandSecondary, brandAccent].filter(Boolean).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5">
                  {brand?.name || activeBrand?.name || 'Brand'}
                </span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRegenerateAll}
              disabled={isGenerating}
              className="gap-2"
              style={hasBrandColors ? { 
                borderColor: `${brandPrimary}40`,
                color: brandPrimary
              } : undefined}
            >
              <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              Regenerate All
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content - Split View Layout */}
        <main className={cn(
          "flex-1 overflow-hidden",
          hasBrandColors ? "h-[calc(100vh-4.25rem)]" : "h-[calc(100vh-4rem)]"
        )}>
          <div className={cn(
            "h-full grid gap-6 p-6 transition-all duration-300",
            selectedVariation ? "grid-cols-1 lg:grid-cols-[280px,1fr]" : "grid-cols-1"
          )}>
            {/* Left Panel - Variations Thumbnails */}
            <div className="flex flex-col gap-4 overflow-auto">
              {/* Generation Progress */}
              {generationPhase === 'generating' && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card/50 rounded-xl border border-border p-4"
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium">
                      <Loader2 
                        className="h-4 w-4 animate-spin" 
                        style={{ color: brandPrimary || 'hsl(var(--primary))' }}
                      />
                      Generating {VARIATION_COUNT} variations...
                    </div>
                    
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className={cn(
                          "h-full rounded-full",
                          !hasBrandColors && `bg-gradient-to-r ${studioGradient}`
                        )}
                        style={hasBrandColors ? brandGradientStyle : undefined}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
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
                  className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary mb-1">
                    <Check className="h-4 w-4" />
                    All variations ready!
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click a variation to preview & edit
                  </p>
                </motion.div>
              )}
              
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Variations</h3>
                <span className="text-xs text-muted-foreground">{completedCount}/{VARIATION_COUNT}</span>
              </div>

              {/* Variations Grid - Compact when preview shown */}
              <div className={cn(
                "grid gap-3",
                selectedVariation ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"
              )}>
                {variations.map((variation, index) => (
                  <motion.div
                    key={variation.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all group",
                      selectedVariation === variation.id
                        ? "border-primary ring-2 ring-primary/20"
                        : variation.status === 'complete' 
                          ? "border-border hover:border-primary/50"
                          : "border-border"
                    )}
                    onClick={() => handleSelectVariation(variation.id)}
                  >
                    {/* Variation Label */}
                    <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                      V{index + 1}
                    </div>

                    {/* Selection Indicator */}
                    {selectedVariation === variation.id && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Regenerate Button */}
                    {variation.status === 'complete' && selectedVariation !== variation.id && (
                      <button
                        className="absolute top-2 right-2 z-10 p-1 bg-black/50 backdrop-blur-sm rounded text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateVariation(variation.id);
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    )}

                    {/* Content */}
                    <div className="aspect-square relative overflow-hidden">
                      {variation.status === 'pending' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-card via-muted/50 to-card flex items-center justify-center">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {variation.status === 'generating' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
                          <motion.div
                            className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center", studioGradient)}
                            animate={{ scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Sparkles className="h-4 w-4 text-white" />
                          </motion.div>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-destructive/5">
                          <X className="h-5 w-5 text-destructive" />
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegenerateVariation(variation.id);
                            }}
                          >
                            Retry
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Panel - Live Preview */}
            {selectedVariation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col h-full bg-card/30 rounded-2xl border border-border overflow-hidden"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                  <div className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Live Preview</span>
                    <span className="text-xs text-muted-foreground">
                      Variation {variations.findIndex(v => v.id === selectedVariation) + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        const variation = variations.find(v => v.id === selectedVariation);
                        if (variation?.imageUrl) {
                          setEditingImageUrl(variation.imageUrl);
                          setShowEditor(true);
                        }
                      }}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Edit with AI
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        const variation = variations.find(v => v.id === selectedVariation);
                        if (variation?.imageUrl) {
                          const link = document.createElement('a');
                          link.href = variation.imageUrl;
                          link.download = `${assetName.replace(/\s+/g, '_')}_v${variations.findIndex(v => v.id === selectedVariation) + 1}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Preview Image */}
                <div className="flex-1 relative overflow-auto p-6 flex items-center justify-center bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:20px_20px]">
                  {(() => {
                    const variation = variations.find(v => v.id === selectedVariation);
                    if (variation?.imageUrl) {
                      return (
                        <motion.img
                          key={variation.imageUrl}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={variation.imageUrl}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                          style={{ maxHeight: 'calc(100vh - 280px)' }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Preview Footer - Actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card/50">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVariation(null)}
                    className="gap-1.5"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    View All
                  </Button>
                  
                  <Button
                    onClick={handleUseSelected}
                    size="sm"
                    className={cn("gap-2 bg-gradient-to-r", studioGradient)}
                  >
                    <Check className="h-4 w-4" />
                    Use This Design
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
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
