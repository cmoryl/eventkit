import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Palette, Type, ImageIcon, Wand2, 
  ChevronDown, ChevronUp, Lightbulb, Zap, X, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';
import { Brand } from '@/types/studio.types';
import AssetSpecificFields from '@/components/AssetSpecificFields';

export interface AssetBrief {
  // Content fields (asset-specific)
  customContent: Record<string, string>;
  
  // Style preferences
  stylePreset: 'modern' | 'classic' | 'bold' | 'minimal' | 'playful' | 'premium' | 'custom';
  customStyleDescription?: string;
  
  // Visual preferences
  colorMood: 'vibrant' | 'muted' | 'monochrome' | 'brand-only' | 'custom';
  customColors?: string[];
  
  // Layout preferences
  layoutStyle: 'centered' | 'asymmetric' | 'grid' | 'organic' | 'ai-decide';
  
  // Typography preferences
  typographyStyle: 'bold-headers' | 'elegant-serif' | 'modern-sans' | 'mixed' | 'brand-fonts';
  
  // Imagery preferences
  imageryStyle: 'photographic' | 'illustrated' | 'abstract' | 'geometric' | 'mixed' | 'none';
  
  // Additional notes
  additionalNotes?: string;
  
  // Reference/inspiration
  referencePrompt?: string;
}

interface AssetBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (brief: AssetBrief) => void;
  assetType: AssetType | string;
  assetName: string;
  brand: Brand | null;
  eventName?: string;
  studioGradient?: string;
}

const STYLE_PRESETS = [
  { id: 'modern', label: 'Modern', description: 'Clean lines, contemporary feel', icon: '✨' },
  { id: 'classic', label: 'Classic', description: 'Timeless, sophisticated', icon: '🎩' },
  { id: 'bold', label: 'Bold', description: 'High contrast, impactful', icon: '⚡' },
  { id: 'minimal', label: 'Minimal', description: 'Simple, uncluttered', icon: '◯' },
  { id: 'playful', label: 'Playful', description: 'Fun, energetic vibes', icon: '🎨' },
  { id: 'premium', label: 'Premium', description: 'Luxury, high-end feel', icon: '💎' },
];

const COLOR_MOODS = [
  { id: 'vibrant', label: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] },
  { id: 'muted', label: 'Muted', colors: ['#8D99AE', '#EDF2F4', '#2B2D42'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#1A1A1A', '#666666', '#CCCCCC'] },
  { id: 'brand-only', label: 'Brand Colors', colors: [] },
];

const LAYOUT_OPTIONS = [
  { id: 'centered', label: 'Centered', icon: '⊡' },
  { id: 'asymmetric', label: 'Asymmetric', icon: '◢' },
  { id: 'grid', label: 'Grid-Based', icon: '▦' },
  { id: 'organic', label: 'Organic Flow', icon: '〰' },
  { id: 'ai-decide', label: 'AI Decides', icon: '🤖' },
];

const IMAGERY_OPTIONS = [
  { id: 'photographic', label: 'Photo-realistic' },
  { id: 'illustrated', label: 'Illustrated' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'mixed', label: 'Mixed Media' },
  { id: 'none', label: 'Text Only' },
];

export const AssetBriefModal: React.FC<AssetBriefModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  assetType,
  assetName,
  brand,
  eventName = 'Your Event',
  studioGradient = 'from-primary to-accent'
}) => {
  const [brief, setBrief] = useState<AssetBrief>({
    customContent: {},
    stylePreset: 'modern',
    colorMood: brand ? 'brand-only' : 'vibrant',
    layoutStyle: 'ai-decide',
    typographyStyle: brand ? 'brand-fonts' : 'modern-sans',
    imageryStyle: 'photographic',
  });
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['content', 'style'])
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset brief when asset type changes
  useEffect(() => {
    if (isOpen) {
      setBrief({
        customContent: {},
        stylePreset: 'modern',
        colorMood: brand ? 'brand-only' : 'vibrant',
        layoutStyle: 'ai-decide',
        typographyStyle: brand ? 'brand-fonts' : 'modern-sans',
        imageryStyle: 'photographic',
      });
    }
  }, [isOpen, assetType, brand]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBrief(prev => ({
      ...prev,
      customContent: { ...prev.customContent, [name]: value }
    }));
  };

  const handleSubmit = () => {
    onSubmit(brief);
  };

  if (!isOpen) return null;

  const inputClassName = "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-r from-card to-muted/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", studioGradient)}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{assetName} Brief</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your asset before generation
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Brand indicator */}
            {brand && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg w-fit">
                <div 
                  className="w-4 h-4 rounded-full border border-border" 
                  style={{ backgroundColor: brand.styles?.primary_color || '#6366f1' }} 
                />
                <span className="text-sm font-medium">{brand.name}</span>
                <span className="text-xs text-muted-foreground">brand applied</span>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick AI Suggestion */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">AI Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    The more details you provide, the better your results. Fill in content fields to get 
                    designs with your actual text, or leave blank to get placeholder layouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Content */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('content')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-primary" />
                  <span className="font-medium">Content</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Text, headlines, details
                  </span>
                </div>
                {expandedSections.has('content') ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has('content') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-1">
                      <AssetSpecificFields
                        assetType={assetType as AssetType}
                        customContent={brief.customContent}
                        onChange={handleContentChange}
                        inputClassName={inputClassName}
                      />
                      
                      {/* Fallback for assets without specific fields */}
                      {!brief.customContent && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            name="headline"
                            value={brief.customContent.headline || ''}
                            onChange={handleContentChange}
                            placeholder="Main headline or title"
                            className={inputClassName}
                          />
                          <textarea
                            name="bodyText"
                            value={brief.customContent.bodyText || ''}
                            onChange={handleContentChange}
                            placeholder="Body text or description"
                            rows={3}
                            className={cn(inputClassName, 'resize-none')}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section: Style Preset */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('style')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-accent" />
                  <span className="font-medium">Style</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Overall look and feel
                  </span>
                </div>
                {expandedSections.has('style') ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has('style') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-1">
                      <div className="grid grid-cols-3 gap-2">
                        {STYLE_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setBrief(prev => ({ ...prev, stylePreset: preset.id as any }))}
                            className={cn(
                              "p-3 rounded-xl border-2 text-left transition-all",
                              brief.stylePreset === preset.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground/50"
                            )}
                          >
                            <span className="text-lg mb-1 block">{preset.icon}</span>
                            <span className="text-sm font-medium block">{preset.label}</span>
                            <span className="text-xs text-muted-foreground">{preset.description}</span>
                          </button>
                        ))}
                      </div>
                      
                      {brief.stylePreset === 'custom' && (
                        <textarea
                          value={brief.customStyleDescription || ''}
                          onChange={(e) => setBrief(prev => ({ ...prev, customStyleDescription: e.target.value }))}
                          placeholder="Describe your desired style in detail..."
                          rows={2}
                          className={cn(inputClassName, 'mt-3 resize-none')}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section: Color Mood */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">Colors</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Color palette preference
                  </span>
                </div>
                {expandedSections.has('colors') ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has('colors') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-1">
                      <div className="grid grid-cols-2 gap-2">
                        {COLOR_MOODS.map(mood => (
                          <button
                            key={mood.id}
                            onClick={() => setBrief(prev => ({ ...prev, colorMood: mood.id as any }))}
                            className={cn(
                              "p-3 rounded-xl border-2 flex items-center gap-3 transition-all",
                              brief.colorMood === mood.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground/50"
                            )}
                          >
                            <div className="flex -space-x-1">
                              {mood.id === 'brand-only' && brand?.styles?.primary_color ? (
                                <>
                                  <div className="w-5 h-5 rounded-full border-2 border-background" style={{ backgroundColor: brand.styles.primary_color }} />
                                  {brand.styles.secondary_color && (
                                    <div className="w-5 h-5 rounded-full border-2 border-background" style={{ backgroundColor: brand.styles.secondary_color }} />
                                  )}
                                </>
                              ) : (
                                mood.colors.map((color, i) => (
                                  <div 
                                    key={i} 
                                    className="w-5 h-5 rounded-full border-2 border-background" 
                                    style={{ backgroundColor: color }} 
                                  />
                                ))
                              )}
                            </div>
                            <span className="text-sm font-medium">{mood.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section: Layout */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('layout')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Layout & Imagery</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Composition preferences
                  </span>
                </div>
                {expandedSections.has('layout') ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.has('layout') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-1 space-y-4">
                      {/* Layout Style */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Layout Style</label>
                        <div className="flex flex-wrap gap-2">
                          {LAYOUT_OPTIONS.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setBrief(prev => ({ ...prev, layoutStyle: option.id as any }))}
                              className={cn(
                                "px-3 py-2 rounded-lg border-2 text-sm flex items-center gap-2 transition-all",
                                brief.layoutStyle === option.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground/50"
                              )}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Imagery Style */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Imagery Style</label>
                        <div className="flex flex-wrap gap-2">
                          {IMAGERY_OPTIONS.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setBrief(prev => ({ ...prev, imageryStyle: option.id as any }))}
                              className={cn(
                                "px-3 py-2 rounded-lg border-2 text-sm transition-all",
                                brief.imageryStyle === option.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground/50"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Additional Notes for AI
                    </label>
                    <textarea
                      value={brief.additionalNotes || ''}
                      onChange={(e) => setBrief(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      placeholder="Any specific requirements, things to include or avoid..."
                      rows={3}
                      className={cn(inputClassName, 'resize-none')}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Reference / Inspiration
                    </label>
                    <textarea
                      value={brief.referencePrompt || ''}
                      onChange={(e) => setBrief(prev => ({ ...prev, referencePrompt: e.target.value }))}
                      placeholder="Describe a reference style, brand, or visual you'd like to emulate..."
                      rows={2}
                      className={cn(inputClassName, 'resize-none')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <Zap className="w-4 h-4 inline mr-1 text-primary" />
                AI learns from your preferences for better future results
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className={cn("gap-2 bg-gradient-to-r text-white shadow-lg", studioGradient)}
                >
                  Generate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssetBriefModal;
