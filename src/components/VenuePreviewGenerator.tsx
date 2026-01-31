import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Loader2, Play, Download, X, Sparkles, Building2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { VenueVideoAnalysis, ColorInfo, EventDetails } from '@/types';

interface VenuePreviewGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  venueVideoAnalysis: VenueVideoAnalysis | null;
  eventDetails: EventDetails;
  colorPalette: ColorInfo[];
  styleDescription?: string;
}

type BrandElementType = 'signage' | 'banner' | 'counter' | 'environmental' | 'digital';

interface BrandElement {
  type: BrandElementType;
  label: string;
  description: string;
  icon: string;
  checked: boolean;
}

type GenerationStage = 'selecting' | 'generating' | 'complete' | 'error';

export const VenuePreviewGenerator: React.FC<VenuePreviewGeneratorProps> = ({
  isOpen,
  onClose,
  venueVideoAnalysis,
  eventDetails,
  colorPalette,
  styleDescription,
}) => {
  const [stage, setStage] = useState<GenerationStage>('selecting');
  const [progress, setProgress] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState<number>(0);
  const [result, setResult] = useState<{ type: 'video' | 'image'; url: string; thumbnailUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [brandElements, setBrandElements] = useState<BrandElement[]>([
    { type: 'signage', label: 'Signage & Banners', description: 'Welcome signs, directional signage, and retractable banners', icon: '🪧', checked: true },
    { type: 'counter', label: 'Counters & Structures', description: 'Registration desk, welcome counter, info kiosks', icon: '🏛️', checked: true },
    { type: 'environmental', label: 'Environmental Branding', description: 'Wall graphics, floor decals, pillar wraps', icon: '🎨', checked: true },
    { type: 'digital', label: 'Digital Displays', description: 'Screens showing event content and schedules', icon: '📺', checked: true },
  ]);

  const keyFrames = venueVideoAnalysis?.keyFrames || [];
  const hasFrames = keyFrames.length > 0;

  const toggleElement = (type: BrandElementType) => {
    setBrandElements(prev => prev.map(el => 
      el.type === type ? { ...el, checked: !el.checked } : el
    ));
  };

  const handleGenerate = useCallback(async () => {
    if (!hasFrames) return;

    const selectedElements = brandElements.filter(el => el.checked);
    if (selectedElements.length === 0) return;

    setStage('generating');
    setProgress(10);
    setError(null);

    try {
      const frameData = keyFrames[selectedFrame]?.imageData;
      if (!frameData) throw new Error('No frame data available');

      setProgress(30);

      const { data, error: fnError } = await supabase.functions.invoke('generate-venue-preview', {
        body: {
          venueFrameBase64: frameData,
          eventName: eventDetails.name,
          eventDescription: eventDetails.description,
          brandElements: selectedElements.map(el => ({
            type: el.type,
            description: el.description,
            colorPalette: colorPalette.map(c => c.hex),
          })),
          styleDescription,
          duration: 5,
        },
      });

      if (fnError) throw fnError;

      setProgress(100);

      if (data.success) {
        setResult({
          type: data.type,
          url: data.videoUrl || data.imageUrl,
          thumbnailUrl: data.thumbnailUrl,
        });
        setStage('complete');
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (err) {
      console.error('Venue preview generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
      setStage('error');
    }
  }, [hasFrames, brandElements, keyFrames, selectedFrame, eventDetails, colorPalette, styleDescription]);

  const handleDownload = useCallback(() => {
    if (!result?.url) return;
    
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `${eventDetails.name.replace(/\s+/g, '-')}-venue-preview.${result.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result, eventDetails.name]);

  const handleReset = () => {
    setStage('selecting');
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-violet-500" />
            Generate Branded Venue Preview
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
              AI VIDEO
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* No frames warning */}
          {!hasFrames && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
              <p className="text-sm text-amber-600">
                Upload a venue walkthrough video first to generate a branded preview.
              </p>
            </div>
          )}

          {/* Frame Selection */}
          {hasFrames && stage === 'selecting' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Venue Frame</label>
                <div className="grid grid-cols-4 gap-2">
                  {keyFrames.slice(0, 8).map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFrame(index)}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        selectedFrame === index 
                          ? "border-violet-500 ring-2 ring-violet-500/30" 
                          : "border-transparent hover:border-violet-500/50"
                      )}
                    >
                      <img 
                        src={frame.imageData} 
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedFrame === index && (
                        <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-violet-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Elements Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Branding Elements to Add</label>
                <div className="space-y-2">
                  {brandElements.map((element) => (
                    <label 
                      key={element.type}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                        element.checked 
                          ? "border-violet-500/50 bg-violet-500/5" 
                          : "border-border hover:border-violet-500/30"
                      )}
                    >
                      <Checkbox 
                        checked={element.checked}
                        onCheckedChange={() => toggleElement(element.type)}
                      />
                      <span className="text-xl">{element.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{element.label}</span>
                        <p className="text-xs text-muted-foreground">{element.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={!brandElements.some(el => el.checked)}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Branded Preview
              </Button>
            </>
          )}

          {/* Generating State */}
          {stage === 'generating' && (
            <div className="py-8 text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center"
              >
                <Video className="w-8 h-8 text-violet-500" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg">Generating Branded Preview</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is placing your branded assets into the venue...
                </p>
              </div>
              <Progress value={progress} className="h-2 max-w-xs mx-auto" />
            </div>
          )}

          {/* Complete State */}
          {stage === 'complete' && result && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {result.type === 'video' ? (
                  <video 
                    src={result.url} 
                    controls 
                    autoPlay 
                    loop
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={result.url} 
                    alt="Branded venue preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">
                    {result.type === 'video' ? 'Video' : 'Image'} Generated Successfully
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Generate Another
                  </Button>
                  <Button size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {stage === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-destructive">Generation Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenuePreviewGenerator;
