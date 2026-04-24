import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Key, Lock, Images, Image as ImageIcon, Layers, Camera, Palette, Award, FileImage, Share2, Layout, FileText, Wand2, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SlideData } from './slideTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const LOVABLE_MODELS = [
  { value: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'google/gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'openai/gpt-5', label: 'GPT-5' },
];

const GOOGLE_MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

interface BrandHubImagery {
  logos?: string[];
  brandIcons?: string[];
  patterns?: string[];
  photography?: string[];
  heroImages?: string[];
  collateral?: string[];
  social?: string[];
  banners?: string[];
  sponsors?: string[];
}

type ImageryCategory = keyof BrandHubImagery;

const CATEGORY_META: Record<ImageryCategory, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  logos: { label: 'Logos', icon: Award, description: 'Primary brand marks' },
  brandIcons: { label: 'Brand icons', icon: Layers, description: 'Iconography & symbols' },
  patterns: { label: 'Patterns', icon: Palette, description: 'Backgrounds & textures' },
  photography: { label: 'Photography', icon: Camera, description: 'Photo library' },
  heroImages: { label: 'Hero images', icon: ImageIcon, description: 'Cover & feature shots' },
  collateral: { label: 'Collateral', icon: FileImage, description: 'Marketing artwork' },
  social: { label: 'Social', icon: Share2, description: 'Social-ready graphics' },
  banners: { label: 'Banners', icon: Layout, description: 'Wide formats' },
  sponsors: { label: 'Sponsors', icon: Award, description: 'Sponsor logos' },
};

const CATEGORY_ORDER: ImageryCategory[] = ['heroImages', 'photography', 'patterns', 'logos', 'brandIcons', 'collateral', 'social', 'banners', 'sponsors'];

interface AISlideGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSlidesGenerated: (slides: SlideData[]) => void;
  brandName?: string;
  brandId?: string;
  brandImagery?: BrandHubImagery;
}

export function AISlideGenerator({
  isOpen,
  onClose,
  onSlidesGenerated,
  brandName,
  brandId,
  brandImagery,
}: AISlideGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState('6');
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<'lovable' | 'google'>('lovable');
  const [model, setModel] = useState('google/gemini-3-flash-preview');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [brandHubOnly, setBrandHubOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<ImageryCategory>>(new Set());

  // Content brief mode
  const [briefMode, setBriefMode] = useState<'topic' | 'content'>('topic');
  const [content, setContent] = useState('');
  const [contentFormat, setContentFormat] = useState<'freeform' | 'structured'>('freeform');
  const [enableInfographics, setEnableInfographics] = useState(true);
  const [imageMatchMode, setImageMatchMode] = useState<'smart' | 'category' | 'manual'>('smart');

  // Count of BrandHub assets available — used to decide if toggle is meaningful
  const imageryStats = useMemo(() => {
    if (!brandImagery) return { total: 0, byType: {} as Record<string, number> };
    const byType: Record<string, number> = {};
    let total = 0;
    (Object.entries(brandImagery) as Array<[string, string[] | undefined]>).forEach(([k, arr]) => {
      const n = arr?.length ?? 0;
      if (n > 0) {
        byType[k] = n;
        total += n;
      }
    });
    return { total, byType };
  }, [brandImagery]);

  const hasBrandHubAssets = imageryStats.total > 0;

  // Categories that actually have assets, in display order
  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter(c => (imageryStats.byType[c] ?? 0) > 0),
    [imageryStats]
  );

  // Filtered imagery payload sent to the edge function — only selected categories
  const filteredImagery = useMemo(() => {
    if (!brandImagery) return undefined;
    const out: BrandHubImagery = {};
    selectedCategories.forEach(cat => {
      const arr = brandImagery[cat];
      if (arr?.length) out[cat] = arr;
    });
    return out;
  }, [brandImagery, selectedCategories]);

  const selectedAssetCount = useMemo(
    () => Array.from(selectedCategories).reduce((sum, c) => sum + (imageryStats.byType[c] ?? 0), 0),
    [selectedCategories, imageryStats]
  );

  // Default the toggle ON whenever the modal opens for a BrandHub-connected brand,
  // and pre-select all available categories.
  useEffect(() => {
    if (isOpen) {
      setBrandHubOnly(hasBrandHubAssets);
      setSelectedCategories(new Set(availableCategories));
    }
  }, [isOpen, hasBrandHubAssets, availableCategories]);

  const toggleCategory = (cat: ImageryCategory) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const selectAllCategories = () => setSelectedCategories(new Set(availableCategories));
  const clearAllCategories = () => setSelectedCategories(new Set());

  const models = provider === 'lovable' ? LOVABLE_MODELS : GOOGLE_MODELS;

  const handleProviderChange = (val: string) => {
    const p = val as 'lovable' | 'google';
    setProvider(p);
    setModel(p === 'lovable' ? 'google/gemini-3-flash-preview' : 'google/gemini-2.5-flash');
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please describe your presentation topic');
      return;
    }

    if (provider === 'google' && !googleApiKey.trim()) {
      toast.error('Please enter your Google API key');
      return;
    }

    if (brandHubOnly && hasBrandHubAssets && selectedAssetCount === 0) {
      toast.error('Select at least one asset category, or turn off BrandHub-only mode.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: {
          topic: topic.trim(),
          slideCount: parseInt(slideCount),
          brandContext: brandName ? { name: brandName, brandId } : undefined,
          model,
          provider,
          googleApiKey: provider === 'google' ? googleApiKey.trim() : undefined,
          // BrandHub-only constraints (filtered to selected categories)
          brandHubOnly: brandHubOnly && hasBrandHubAssets,
          approvedImagery: brandHubOnly && hasBrandHubAssets ? filteredImagery : undefined,
          approvedCategories: brandHubOnly && hasBrandHubAssets ? Array.from(selectedCategories) : undefined,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate slides');
      }

      if (!data?.slides || !Array.isArray(data.slides)) {
        throw new Error('Invalid response from AI');
      }

      const slides: SlideData[] = data.slides.map((s: any) => ({
        id: uuidv4(),
        layout: s.layout || 'content',
        title: s.title || 'Untitled',
        subtitle: s.subtitle || undefined,
        body: s.body || undefined,
        notes: s.notes || undefined,
        variant: s.variant || 'default',
        imageUrl: s.imageUrl || undefined,
      }));

      onSlidesGenerated(slides);
      toast.success(
        brandHubOnly && hasBrandHubAssets
          ? `Generated ${slides.length} slides using BrandHub assets`
          : `Generated ${slides.length} slides!`
      );
      setTopic('');
      onClose();
    } catch (err: any) {
      console.error('Slide generation error:', err);
      if (err.message?.includes('429') || err.message?.includes('Rate limit')) {
        toast.error('Rate limit reached — please wait a moment and try again.');
      } else if (err.message?.includes('402') || err.message?.includes('credits')) {
        toast.error('AI credits exhausted. Please add funds to continue.');
      } else if (err.message?.includes('401') || err.message?.includes('Invalid API key')) {
        toast.error('Invalid Google API key. Please check and try again.');
      } else {
        toast.error(err.message || 'Failed to generate slides');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isGenerating && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Slide Generator
          </DialogTitle>
          <DialogDescription>
            Describe your topic and AI will create a complete slide deck.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Provider selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Provider</label>
            <Select value={provider} onValueChange={handleProviderChange} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lovable">Lovable AI (built-in)</SelectItem>
                <SelectItem value="google">Google Gemini (own key)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Google API key */}
          {provider === 'google' && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                Google API Key
              </label>
              <Input
                type="password"
                placeholder="AIza..."
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Get a key from{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  Google AI Studio
                </a>
              </p>
            </div>
          )}

          {/* Model selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select value={model} onValueChange={setModel} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Textarea
              placeholder="e.g., Q4 2025 Sales Results — cover revenue growth, regional breakdown, top clients, challenges, and next quarter goals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px]"
              disabled={isGenerating}
            />
          </div>

          {/* Slide count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of slides</label>
            <Select value={slideCount} onValueChange={setSlideCount} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 slides</SelectItem>
                <SelectItem value="6">6 slides</SelectItem>
                <SelectItem value="8">8 slides</SelectItem>
                <SelectItem value="10">10 slides</SelectItem>
                <SelectItem value="12">12 slides</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BrandHub-only toggle + category picker */}
          {hasBrandHubAssets && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <label
                    htmlFor="brandhub-only"
                    className="text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Use only BrandHub assets
                  </label>
                  <p className="text-xs text-muted-foreground">
                    AI will draw imagery exclusively from your imported BrandHub library — no stock or generated images.
                  </p>
                </div>
                <Switch
                  id="brandhub-only"
                  checked={brandHubOnly}
                  onCheckedChange={setBrandHubOnly}
                  disabled={isGenerating}
                />
              </div>

              {brandHubOnly && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Images className="h-3 w-3" />
                      Allowed categories
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={selectAllCategories}
                        disabled={isGenerating}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        All
                      </button>
                      <span className="text-xs text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={clearAllCategories}
                        disabled={isGenerating}
                        className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map(cat => {
                      const meta = CATEGORY_META[cat];
                      const Icon = meta.icon;
                      const count = imageryStats.byType[cat] ?? 0;
                      const checked = selectedCategories.has(cat);
                      return (
                        <label
                          key={cat}
                          className={`flex items-start gap-2 rounded-md border p-2 cursor-pointer transition-colors ${
                            checked
                              ? 'border-primary/60 bg-primary/5'
                              : 'border-border bg-background/40 hover:bg-muted/40'
                          } ${isGenerating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCategory(cat)}
                            disabled={isGenerating}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-medium truncate">{meta.label}</span>
                              <span className="text-xs text-muted-foreground ml-auto shrink-0">{count}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                              {meta.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">
                      {selectedCategories.size} of {availableCategories.length} categories
                    </span>
                    <span className={`font-medium ${selectedAssetCount === 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {selectedAssetCount} asset{selectedAssetCount !== 1 ? 's' : ''} available
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {brandName && !hasBrandHubAssets && (
            <p className="text-xs text-muted-foreground">
              Brand: <span className="font-medium text-foreground">{brandName}</span> — AI will match your brand tone.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !topic.trim() || (provider === 'google' && !googleApiKey.trim())}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Deck
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
