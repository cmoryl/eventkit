import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Type, Sparkles, Save, X, Plus, Trash2, 
  Image as ImageIcon, Eye, PaintBucket, Wand2, Upload, FileText, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BrandStyle {
  id?: string;
  brand_id: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette?: { hex: string; name: string }[];
  heading_font?: string;
  body_font?: string;
  accent_font?: string;
  mood_keywords?: string[];
  tone_keywords?: string[];
  brand_voice?: string[];
  imagery_style?: string;
  pattern_style?: string;
  target_audience?: string;
  cultural_context?: string;
  industry?: string;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

interface BrandStyleEditorProps {
  brand: Brand;
  onClose: () => void;
  onSave: () => void;
}

const fontOptions = [
  'Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Roboto', 
  'Open Sans', 'Lato', 'Oswald', 'Raleway', 'Merriweather',
  'Source Sans Pro', 'Ubuntu', 'PT Sans', 'Nunito', 'Work Sans'
];

const moodOptions = [
  'Professional', 'Playful', 'Elegant', 'Bold', 'Minimalist',
  'Luxurious', 'Friendly', 'Modern', 'Classic', 'Innovative',
  'Warm', 'Cool', 'Energetic', 'Calm', 'Sophisticated'
];

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Entertainment',
  'Fashion', 'Food & Beverage', 'Real Estate', 'Travel', 'Non-profit',
  'Sports', 'Corporate', 'Retail', 'Creative Agency', 'Wellness'
];

export const BrandStyleEditor: React.FC<BrandStyleEditorProps> = ({
  brand,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingGuide, setIsParsingGuide] = useState(false);
  const [uploadedGuideUrl, setUploadedGuideUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [style, setStyle] = useState<BrandStyle>({
    brand_id: brand.id,
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#ec4899',
    color_palette: [],
    heading_font: 'Inter',
    body_font: 'Inter',
    mood_keywords: [],
    tone_keywords: [],
    brand_voice: [],
    imagery_style: '',
    pattern_style: '',
    target_audience: '',
    cultural_context: '',
    industry: ''
  });

  const [newPaletteColor, setNewPaletteColor] = useState({ hex: '#6366f1', name: '' });
  const [newMood, setNewMood] = useState('');

  // Handle brand guide upload and AI parsing
  const handleBrandGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be under 20MB');
      return;
    }

    setIsParsingGuide(true);
    toast.info('Analyzing brand guide with AI...', { duration: 5000 });

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call AI to analyze the brand guide
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-brand-guide', {
        body: {
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      if (analysisResult?.extractedStyle) {
        const extracted = analysisResult.extractedStyle;
        
        // Merge extracted values with current style
        setStyle(prev => ({
          ...prev,
          primary_color: extracted.primary_color || prev.primary_color,
          secondary_color: extracted.secondary_color || prev.secondary_color,
          accent_color: extracted.accent_color || prev.accent_color,
          color_palette: extracted.color_palette?.length > 0 
            ? [...(prev.color_palette || []), ...extracted.color_palette]
            : prev.color_palette,
          heading_font: extracted.heading_font || prev.heading_font,
          body_font: extracted.body_font || prev.body_font,
          mood_keywords: extracted.mood_keywords?.length > 0
            ? [...new Set([...(prev.mood_keywords || []), ...extracted.mood_keywords])]
            : prev.mood_keywords,
          imagery_style: extracted.imagery_style || prev.imagery_style,
          industry: extracted.industry || prev.industry,
          target_audience: extracted.target_audience || prev.target_audience
        }));

        setUploadedGuideUrl(file.name);
        toast.success('Brand guide analyzed! Style settings updated.');
      } else {
        toast.warning('Could not extract style information from the document');
      }
    } catch (error) {
      console.error('Error parsing brand guide:', error);
      toast.error('Failed to analyze brand guide. Please try again.');
    } finally {
      setIsParsingGuide(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    loadBrandStyle();
  }, [brand.id]);

  const loadBrandStyle = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_styles')
        .select('*')
        .eq('brand_id', brand.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStyle({
          ...data,
          color_palette: Array.isArray(data.color_palette) 
            ? data.color_palette as { hex: string; name: string }[]
            : [],
          mood_keywords: data.mood_keywords || [],
          tone_keywords: data.tone_keywords || [],
          brand_voice: data.brand_voice || []
        });
      }
    } catch (error) {
      console.error('Error loading brand style:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const styleData = {
        brand_id: brand.id,
        primary_color: style.primary_color,
        secondary_color: style.secondary_color,
        accent_color: style.accent_color,
        color_palette: style.color_palette,
        heading_font: style.heading_font,
        body_font: style.body_font,
        accent_font: style.accent_font,
        mood_keywords: style.mood_keywords,
        tone_keywords: style.tone_keywords,
        brand_voice: style.brand_voice,
        imagery_style: style.imagery_style,
        pattern_style: style.pattern_style,
        target_audience: style.target_audience,
        cultural_context: style.cultural_context,
        industry: style.industry
      };

      if (style.id) {
        const { error } = await supabase
          .from('brand_styles')
          .update(styleData)
          .eq('id', style.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brand_styles')
          .insert(styleData);
        if (error) throw error;
      }

      toast.success('Brand style saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving brand style:', error);
      toast.error('Failed to save brand style');
    } finally {
      setIsSaving(false);
    }
  };

  const addPaletteColor = () => {
    if (!newPaletteColor.hex || !newPaletteColor.name) {
      toast.error('Please enter both color and name');
      return;
    }
    setStyle(prev => ({
      ...prev,
      color_palette: [...(prev.color_palette || []), newPaletteColor]
    }));
    setNewPaletteColor({ hex: '#6366f1', name: '' });
  };

  const removePaletteColor = (index: number) => {
    setStyle(prev => ({
      ...prev,
      color_palette: prev.color_palette?.filter((_, i) => i !== index) || []
    }));
  };

  const addMoodKeyword = (mood: string) => {
    if (!style.mood_keywords?.includes(mood)) {
      setStyle(prev => ({
        ...prev,
        mood_keywords: [...(prev.mood_keywords || []), mood]
      }));
    }
  };

  const removeMoodKeyword = (mood: string) => {
    setStyle(prev => ({
      ...prev,
      mood_keywords: prev.mood_keywords?.filter(m => m !== mood) || []
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading style editor...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Brand Style Editor</h2>
              <p className="text-sm text-muted-foreground">{brand.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Brand Guide Upload Section */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Import Brand Guide
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a brand guide PDF or image from{' '}
                  <a 
                    href="https://brandhubcreator.lovable.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    BrandHub Creator
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  or any brand kit. AI will extract colors, fonts, and style preferences.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleBrandGuideUpload}
                  className="hidden"
                />
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingGuide}
                    className="gap-2"
                  >
                    {isParsingGuide ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Upload Brand Guide
                      </>
                    )}
                  </Button>
                  
                  {uploadedGuideUrl && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="w-4 h-4 text-green-500" />
                      {uploadedGuideUrl}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PaintBucket className="w-5 h-5 text-primary" />
              Brand Colors
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-sm text-muted-foreground">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.primary_color || '#6366f1'}
                    onChange={(e) => setStyle(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.primary_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.secondary_color || '#8b5cf6'}
                    onChange={(e) => setStyle(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.secondary_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Accent Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.accent_color || '#ec4899'}
                    onChange={(e) => setStyle(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.accent_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, accent_color: e.target.value }))}
                    placeholder="#ec4899"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Extended Color Palette</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {style.color_palette?.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border"
                  >
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }} />
                    <span className="text-sm">{color.name}</span>
                    <button onClick={() => removePaletteColor(index)}>
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={newPaletteColor.hex}
                  onChange={(e) => setNewPaletteColor(prev => ({ ...prev, hex: e.target.value }))}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={newPaletteColor.name}
                  onChange={(e) => setNewPaletteColor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Color name"
                  className="flex-1"
                />
                <Button onClick={addPaletteColor} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Typography
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Heading Font</Label>
                <select
                  value={style.heading_font || 'Inter'}
                  onChange={(e) => setStyle(prev => ({ ...prev, heading_font: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Body Font</Label>
                <select
                  value={style.body_font || 'Inter'}
                  onChange={(e) => setStyle(prev => ({ ...prev, body_font: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Font Preview */}
            <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-lg font-semibold" style={{ fontFamily: style.heading_font }}>
                Heading Preview: {brand.name}
              </p>
              <p className="text-muted-foreground mt-2" style={{ fontFamily: style.body_font }}>
                Body text preview: Create stunning event design kits with AI-powered generation.
              </p>
            </div>
          </section>

          {/* Mood & Style Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Mood & Style Keywords
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {style.mood_keywords?.map(mood => (
                <span
                  key={mood}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5"
                >
                  {mood}
                  <button onClick={() => removeMoodKeyword(mood)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {moodOptions.filter(m => !style.mood_keywords?.includes(m)).map(mood => (
                <button
                  key={mood}
                  onClick={() => addMoodKeyword(mood)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  + {mood}
                </button>
              ))}
            </div>
          </section>

          {/* Industry & Audience Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Industry & Audience
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Industry</Label>
                <select
                  value={style.industry || ''}
                  onChange={(e) => setStyle(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">Select industry...</option>
                  {industryOptions.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Target Audience</Label>
                <Input
                  value={style.target_audience || ''}
                  onChange={(e) => setStyle(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Tech professionals, 25-45"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Imagery Style Description</Label>
              <Textarea
                value={style.imagery_style || ''}
                onChange={(e) => setStyle(prev => ({ ...prev, imagery_style: e.target.value }))}
                placeholder="Describe the visual style for generated imagery (e.g., modern and minimalist with bold typography, abstract geometric patterns...)"
                rows={3}
                className="mt-1"
              />
            </div>
          </section>

          {/* Preview Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Style Preview
            </h3>
            <div 
              className="p-6 rounded-2xl border border-border overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${style.primary_color}20, ${style.secondary_color}20, ${style.accent_color}20)`
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: style.primary_color }}>
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ fontFamily: style.heading_font, color: style.primary_color }}>
                    {brand.name}
                  </h4>
                  <p className="text-muted-foreground" style={{ fontFamily: style.body_font }}>
                    {brand.description || 'Your brand tagline here'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.primary_color }} />
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.secondary_color }} />
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.accent_color }} />
              </div>
              {style.mood_keywords && style.mood_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {style.mood_keywords.slice(0, 5).map(mood => (
                    <span key={mood} className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                      {mood}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card/50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Brand Style
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
