import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Palette, Type, ImageIcon, Wand2, 
  ChevronDown, ChevronUp, Lightbulb, Zap, X, Settings2, ALargeSmall, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';
import { Brand } from '@/types/studio.types';
import AssetSpecificFields from '@/components/AssetSpecificFields';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';

// Google Fonts configuration for high-quality typography
export interface GoogleFontSelection {
  heading: string;
  body: string;
  accent?: string;
}

// Popular Google Fonts organized by style category
export const GOOGLE_FONTS = {
  // Display/Headlines - High impact for titles
  display: [
    { name: 'Playfair Display', category: 'serif', weight: '400;700' },
    { name: 'Montserrat', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Oswald', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Bebas Neue', category: 'display', weight: '400' },
    { name: 'Anton', category: 'sans-serif', weight: '400' },
    { name: 'Righteous', category: 'display', weight: '400' },
    { name: 'Abril Fatface', category: 'display', weight: '400' },
    { name: 'Alfa Slab One', category: 'display', weight: '400' },
  ],
  // Body text - Readable at smaller sizes
  body: [
    { name: 'Open Sans', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Roboto', category: 'sans-serif', weight: '400;500;700' },
    { name: 'Lato', category: 'sans-serif', weight: '400;700' },
    { name: 'Source Sans 3', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Inter', category: 'sans-serif', weight: '400;500;600;700' },
    { name: 'Nunito', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Poppins', category: 'sans-serif', weight: '400;500;600;700' },
    { name: 'Work Sans', category: 'sans-serif', weight: '400;500;600;700' },
  ],
  // Elegant/Serif - Sophisticated feel
  elegant: [
    { name: 'Cormorant Garamond', category: 'serif', weight: '400;600;700' },
    { name: 'Libre Baskerville', category: 'serif', weight: '400;700' },
    { name: 'Merriweather', category: 'serif', weight: '400;700' },
    { name: 'Crimson Pro', category: 'serif', weight: '400;600;700' },
    { name: 'EB Garamond', category: 'serif', weight: '400;600;700' },
    { name: 'Spectral', category: 'serif', weight: '400;600;700' },
  ],
  // Modern/Geometric - Clean, contemporary
  modern: [
    { name: 'Raleway', category: 'sans-serif', weight: '400;600;700' },
    { name: 'Josefin Sans', category: 'sans-serif', weight: '400;600;700' },
    { name: 'DM Sans', category: 'sans-serif', weight: '400;500;700' },
    { name: 'Outfit', category: 'sans-serif', weight: '400;500;600;700' },
    { name: 'Plus Jakarta Sans', category: 'sans-serif', weight: '400;500;600;700' },
    { name: 'Space Grotesk', category: 'sans-serif', weight: '400;500;700' },
  ],
  // Script/Handwritten - Personal touch
  script: [
    { name: 'Dancing Script', category: 'handwriting', weight: '400;700' },
    { name: 'Pacifico', category: 'handwriting', weight: '400' },
    { name: 'Great Vibes', category: 'handwriting', weight: '400' },
    { name: 'Satisfy', category: 'handwriting', weight: '400' },
    { name: 'Caveat', category: 'handwriting', weight: '400;700' },
    { name: 'Kalam', category: 'handwriting', weight: '400;700' },
  ],
};

// Font pairing presets for quick selection
export const FONT_PAIRINGS = [
  { 
    id: 'modern-clean',
    name: 'Modern & Clean',
    heading: 'Montserrat',
    body: 'Open Sans',
    description: 'Professional, versatile pairing'
  },
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    heading: 'Playfair Display',
    body: 'Lato',
    description: 'Sophisticated, timeless feel'
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    heading: 'Oswald',
    body: 'Roboto',
    description: 'Strong headlines, readable body'
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    heading: 'Space Grotesk',
    body: 'Inter',
    description: 'Modern, tech-forward aesthetic'
  },
  {
    id: 'luxury-premium',
    name: 'Luxury Premium',
    heading: 'Cormorant Garamond',
    body: 'Crimson Pro',
    description: 'High-end, refined appearance'
  },
  {
    id: 'friendly-warm',
    name: 'Friendly & Warm',
    heading: 'Nunito',
    body: 'Poppins',
    description: 'Approachable, inviting tone'
  },
  {
    id: 'editorial-magazine',
    name: 'Editorial',
    heading: 'Abril Fatface',
    body: 'Merriweather',
    description: 'Magazine-style editorial'
  },
  {
    id: 'minimalist-geometric',
    name: 'Minimalist',
    heading: 'Raleway',
    body: 'Work Sans',
    description: 'Clean, geometric simplicity'
  },
];

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
  
  // Typography preferences - Enhanced with Google Fonts
  typographyStyle: 'bold-headers' | 'elegant-serif' | 'modern-sans' | 'mixed' | 'brand-fonts' | 'custom';
  fontPairing?: string; // ID of selected font pairing
  customFonts?: GoogleFontSelection;
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold';
  
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
  const { loadFont, loadFonts, isFontLoaded } = useGoogleFonts();
  const [brief, setBrief] = useState<AssetBrief>({
    customContent: {},
    stylePreset: 'modern',
    colorMood: brand ? 'brand-only' : 'vibrant',
    layoutStyle: 'ai-decide',
    typographyStyle: brand ? 'brand-fonts' : 'modern-sans',
    fontPairing: 'modern-clean',
    fontWeight: 'regular',
    imageryStyle: 'photographic',
  });
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['content', 'style'])
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());

  // Preload all font pairing fonts when typography section is expanded
  useEffect(() => {
    if (expandedSections.has('typography')) {
      const allFonts = FONT_PAIRINGS.flatMap(p => [p.heading, p.body]);
      const uniqueFonts = [...new Set(allFonts)];
      loadFonts(uniqueFonts).catch(console.error);
    }
  }, [expandedSections, loadFonts]);

  // Load custom fonts when selected
  useEffect(() => {
    if (brief.customFonts?.heading) {
      setLoadingFonts(prev => new Set([...prev, brief.customFonts!.heading]));
      loadFont(brief.customFonts.heading)
        .then(() => setLoadingFonts(prev => {
          const next = new Set(prev);
          next.delete(brief.customFonts!.heading);
          return next;
        }))
        .catch(console.error);
    }
    if (brief.customFonts?.body) {
      setLoadingFonts(prev => new Set([...prev, brief.customFonts!.body]));
      loadFont(brief.customFonts.body)
        .then(() => setLoadingFonts(prev => {
          const next = new Set(prev);
          next.delete(brief.customFonts!.body);
          return next;
        }))
        .catch(console.error);
    }
  }, [brief.customFonts, loadFont]);

  // Get all unique fonts for the current view
  const allDisplayFonts = useMemo(() => {
    const fonts = new Set<string>();
    GOOGLE_FONTS.display.forEach(f => fonts.add(f.name));
    GOOGLE_FONTS.body.forEach(f => fonts.add(f.name));
    GOOGLE_FONTS.elegant.forEach(f => fonts.add(f.name));
    GOOGLE_FONTS.modern.forEach(f => fonts.add(f.name));
    GOOGLE_FONTS.script.forEach(f => fonts.add(f.name));
    return Array.from(fonts);
  }, []);

  // Reset brief when asset type changes
  useEffect(() => {
    if (isOpen) {
      setBrief({
        customContent: {},
        stylePreset: 'modern',
        colorMood: brand ? 'brand-only' : 'vibrant',
        layoutStyle: 'ai-decide',
        typographyStyle: brand ? 'brand-fonts' : 'modern-sans',
        fontPairing: 'modern-clean',
        fontWeight: 'regular',
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
    <AnimatePresence mode="wait">
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
              
              <AnimatePresence initial={false}>
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
              
              <AnimatePresence initial={false}>
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
              
              <AnimatePresence initial={false}>
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

            {/* Section: Typography with Google Fonts */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('typography')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ALargeSmall className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Typography</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Fonts & text styling
                  </span>
                </div>
                {expandedSections.has('typography') ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {expandedSections.has('typography') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-4 px-1 space-y-4">
                      {/* Font Pairing Presets with Live Preview */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Font Pairing (Google Fonts)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {FONT_PAIRINGS.map(pairing => {
                            const headingLoaded = isFontLoaded(pairing.heading);
                            const bodyLoaded = isFontLoaded(pairing.body);
                            const isLoading = !headingLoaded || !bodyLoaded;
                            
                            return (
                              <button
                                key={pairing.id}
                                onClick={() => setBrief(prev => ({ 
                                  ...prev, 
                                  fontPairing: pairing.id,
                                  typographyStyle: 'custom',
                                  customFonts: { heading: pairing.heading, body: pairing.body }
                                }))}
                                className={cn(
                                  "p-3 rounded-xl border-2 text-left transition-all group",
                                  brief.fontPairing === pairing.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                                )}
                              >
                                <div className="space-y-2">
                                  {/* Live Font Preview */}
                                  <div className="min-h-[48px] flex flex-col justify-center">
                                    {isLoading ? (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-xs">Loading fonts...</span>
                                      </div>
                                    ) : (
                                      <>
                                        <span 
                                          className="text-base font-bold block leading-tight"
                                          style={{ fontFamily: `'${pairing.heading}', sans-serif` }}
                                        >
                                          {eventName || 'Event Title'}
                                        </span>
                                        <span 
                                          className="text-xs text-muted-foreground leading-snug"
                                          style={{ fontFamily: `'${pairing.body}', sans-serif` }}
                                        >
                                          Sample body text preview
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Font names */}
                                  <div className="pt-2 border-t border-border/50 flex flex-col">
                                    <span className="text-[10px] font-medium text-foreground/70">
                                      {pairing.name}
                                    </span>
                                    <div className="flex gap-2 text-[9px] text-muted-foreground">
                                      <span>H: {pairing.heading}</span>
                                      <span>•</span>
                                      <span>B: {pairing.body}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Preview Panel */}
                      {brief.customFonts && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                          <label className="text-xs font-medium text-muted-foreground mb-3 block">
                            Live Preview
                          </label>
                          <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50">
                            {loadingFonts.has(brief.customFonts.heading) || loadingFonts.has(brief.customFonts.body) ? (
                              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading fonts...</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <h3 
                                  className={cn(
                                    "text-xl leading-tight",
                                    brief.fontWeight === 'light' && 'font-light',
                                    brief.fontWeight === 'regular' && 'font-semibold',
                                    brief.fontWeight === 'medium' && 'font-bold',
                                    brief.fontWeight === 'bold' && 'font-black',
                                  )}
                                  style={{ fontFamily: `'${brief.customFonts.heading}', sans-serif` }}
                                >
                                  {eventName || 'Your Event Title'}
                                </h3>
                                <p 
                                  className="text-sm text-muted-foreground leading-relaxed"
                                  style={{ fontFamily: `'${brief.customFonts.body}', sans-serif` }}
                                >
                                  This is how your body text will appear. The quick brown fox jumps over the lazy dog.
                                </p>
                                <div className="flex gap-4 pt-2 text-xs text-muted-foreground/70">
                                  <span>Heading: {brief.customFonts.heading}</span>
                                  <span>Body: {brief.customFonts.body}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Font Weight */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Font Weight Emphasis
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'light', label: 'Light', sample: 'Aa' },
                            { id: 'regular', label: 'Regular', sample: 'Aa' },
                            { id: 'medium', label: 'Medium', sample: 'Aa' },
                            { id: 'bold', label: 'Bold', sample: 'Aa' },
                          ].map(weight => (
                            <button
                              key={weight.id}
                              onClick={() => setBrief(prev => ({ ...prev, fontWeight: weight.id as any }))}
                              className={cn(
                                "px-4 py-2 rounded-lg border-2 text-sm flex items-center gap-2 transition-all",
                                brief.fontWeight === weight.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-muted-foreground/50"
                              )}
                            >
                              <span 
                                className={cn(
                                  "text-lg",
                                  weight.id === 'light' && 'font-light',
                                  weight.id === 'regular' && 'font-normal',
                                  weight.id === 'medium' && 'font-medium',
                                  weight.id === 'bold' && 'font-bold',
                                )}
                              >
                                {weight.sample}
                              </span>
                              <span>{weight.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Font Selection */}
                      {brief.typographyStyle === 'custom' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Heading Font
                            </label>
                            <select
                              value={brief.customFonts?.heading || ''}
                              onChange={(e) => setBrief(prev => ({
                                ...prev,
                                customFonts: { ...prev.customFonts, heading: e.target.value, body: prev.customFonts?.body || 'Open Sans' }
                              }))}
                              className={inputClassName}
                            >
                              <optgroup label="Display Fonts">
                                {GOOGLE_FONTS.display.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Modern Fonts">
                                {GOOGLE_FONTS.modern.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Elegant Fonts">
                                {GOOGLE_FONTS.elegant.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Script Fonts">
                                {GOOGLE_FONTS.script.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Body Font
                            </label>
                            <select
                              value={brief.customFonts?.body || ''}
                              onChange={(e) => setBrief(prev => ({
                                ...prev,
                                customFonts: { ...prev.customFonts, body: e.target.value, heading: prev.customFonts?.heading || 'Montserrat' }
                              }))}
                              className={inputClassName}
                            >
                              <optgroup label="Body Fonts">
                                {GOOGLE_FONTS.body.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Elegant Fonts">
                                {GOOGLE_FONTS.elegant.map(f => (
                                  <option key={f.name} value={f.name}>{f.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Use Brand Fonts option */}
                      {brand?.styles?.heading_font && (
                        <button
                          onClick={() => setBrief(prev => ({ 
                            ...prev, 
                            typographyStyle: 'brand-fonts',
                            fontPairing: undefined,
                            customFonts: undefined
                          }))}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all",
                            brief.typographyStyle === 'brand-fonts'
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground/50"
                          )}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: brand.styles.primary_color || '#6366f1', color: 'white' }}
                          >
                            Aa
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-medium block">Use Brand Fonts</span>
                            <span className="text-xs text-muted-foreground">
                              {brand.styles.heading_font} / {brand.styles.body_font || 'Default'}
                            </span>
                          </div>
                        </button>
                      )}

                      {/* High-res rendering note */}
                      <div className="p-2 rounded-lg bg-muted/30 flex items-start gap-2">
                        <Type className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          Fonts render at 300+ DPI for print-ready exports. Google Fonts are embedded for consistent display across all devices.
                        </p>
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
              
              <AnimatePresence initial={false}>
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
            <AnimatePresence initial={false}>
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
