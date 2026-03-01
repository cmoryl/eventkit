import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SlideData } from './slideTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

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

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please describe your presentation topic');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: {
          topic: topic.trim(),
          slideCount: parseInt(slideCount),
          brandContext: brandName ? { name: brandName } : undefined,
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
            Describe your presentation topic and AI will create a complete slide deck with appropriate layouts and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
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
          <Button onClick={handleGenerate} disabled={isGenerating || !topic.trim()}>
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
