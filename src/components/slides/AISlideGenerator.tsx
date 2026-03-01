import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Key } from 'lucide-react';
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

interface AISlideGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSlidesGenerated: (slides: SlideData[]) => void;
  brandName?: string;
}

export function AISlideGenerator({ isOpen, onClose, onSlidesGenerated, brandName }: AISlideGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState('6');
  const [isGenerating, setIsGenerating] = useState(false);
  const [provider, setProvider] = useState<'lovable' | 'google'>('lovable');
  const [model, setModel] = useState('google/gemini-3-flash-preview');
  const [googleApiKey, setGoogleApiKey] = useState('');

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

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: {
          topic: topic.trim(),
          slideCount: parseInt(slideCount),
          brandContext: brandName ? { name: brandName } : undefined,
          model,
          provider,
          googleApiKey: provider === 'google' ? googleApiKey.trim() : undefined,
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
      }));

      onSlidesGenerated(slides);
      toast.success(`Generated ${slides.length} slides!`);
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
      <DialogContent className="sm:max-w-[480px]">
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

          {brandName && (
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
