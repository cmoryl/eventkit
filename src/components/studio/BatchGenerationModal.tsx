import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Loader2, Check, AlertCircle, Pause, Play, 
  Download, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brand } from '@/types/studio.types';
import { useActiveBrand } from '@/hooks/useActiveBrand';
import { compileGenerationPrompt } from '@/services/aiBrain/promptCompiler';
import { normalizeImageForGeneration } from '@/utils';
import { compositeLogoOntoImage, positionFromAssetType, scaleFromAssetType } from '@/services/logoCompositor';
import { useStyleAnchor } from '@/contexts/StyleAnchorContext';
import { generateMasterStyleDirection, buildMasterDirectionPromptBlock } from '@/services/masterStyleDirector';

interface BatchAssetResult {
  assetType: string;
  assetName: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  error?: string;
}

interface BatchGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetTypes: string[];
  brand: Brand | null;
  eventName?: string;
  studioGradient?: string;
  projectLogoOverride?: string | null;
  assetDisplayInfo: Record<string, { name: string; description: string; dimensions?: string }>;
  onImagesGenerated: (results: Record<string, string>) => void;
}

// Max concurrent generations to avoid rate limits
const MAX_CONCURRENT = 2;

export const BatchGenerationModal: React.FC<BatchGenerationModalProps> = ({
  isOpen,
  onClose,
  assetTypes,
  brand,
  eventName = 'Your Event',
  studioGradient = 'from-primary to-accent',
  projectLogoOverride,
  assetDisplayInfo,
  onImagesGenerated,
}) => {
  const { activeBrand } = useActiveBrand();
  const styleAnchor = useStyleAnchor();
  const [results, setResults] = useState<BatchAssetResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [stylePreset, setStylePreset] = useState<'modern' | 'classic' | 'bold' | 'minimal' | 'playful' | 'premium'>('modern');
  const [batchNotes, setBatchNotes] = useState('');
  const isPausedRef = useRef(false);
  const abortRef = useRef(false);

  const effectiveLogoUrl = projectLogoOverride || brand?.logo_url || activeBrand?.logo_url;
  const effectiveBrand = brand || (activeBrand ? {
    ...activeBrand,
    styles: activeBrand.styles,
  } as unknown as Brand : null);

  // Initialize results when opened
  useEffect(() => {
    if (isOpen && assetTypes.length > 0) {
      // Filter out non-image types like PALETTE, SLOGANS
      const imageAssets = assetTypes.filter(t => 
        !['PALETTE', 'SLOGANS'].includes(t)
      );
      setResults(imageAssets.map(type => ({
        assetType: type,
        assetName: assetDisplayInfo[type]?.name || type,
        status: 'pending',
      })));
      abortRef.current = false;
      isPausedRef.current = false;
      setIsPaused(false);
    }
  }, [isOpen, assetTypes]);

  const completedCount = results.filter(r => r.status === 'complete').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalCount = results.length;
  const progressPct = totalCount > 0 ? ((completedCount + errorCount) / totalCount) * 100 : 0;

  // masterDirectionBlock is passed explicitly from startBatch to avoid reading a stale
  // styleAnchor closure — React context updates are async and won't be visible to
  // callbacks already captured in useCallback closures.
  const generateOne = useCallback(async (assetType: string, anchorUrl?: string, masterDirectionBlock?: string): Promise<{ imageUrl?: string; error?: string }> => {
    const info = assetDisplayInfo[assetType];
    const prompt = compileGenerationPrompt({
      basePrompt: `Create a professional ${info?.name || assetType} for "${eventName}". Style: modern and brand-consistent.`,
      context: {
        eventName,
        assetType,
        colorPalette: effectiveBrand?.styles?.color_palette?.map((c: any) => c.hex || c) || [],
      },
    });

    try {
      const logoPayload = await normalizeImageForGeneration(effectiveLogoUrl);

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          assetType,
          eventName,
          masterDirection: masterDirectionBlock || undefined,
          styleAnchorImage: anchorUrl || undefined,
          brandContext: effectiveBrand ? {
            brandName: effectiveBrand.name,
            primaryColor: effectiveBrand.styles?.primary_color,
            secondaryColor: effectiveBrand.styles?.secondary_color,
            accentColor: effectiveBrand.styles?.accent_color,
            colorPalette: effectiveBrand.styles?.color_palette,
            headingFont: effectiveBrand.styles?.heading_font,
            bodyFont: effectiveBrand.styles?.body_font,
            industry: effectiveBrand.styles?.industry,
            moodKeywords: effectiveBrand.styles?.mood_keywords,
            imageryStyle: effectiveBrand.styles?.imagery_style,
          } : null,
          colorPalette: effectiveBrand?.styles?.color_palette?.map((c: any) => c.hex || c),
          logoBase64: logoPayload,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      let finalUrl = data.imageUrl;
      // Post-generation: composite actual logo for pixel-perfect placement
      if (effectiveLogoUrl && finalUrl) {
        try {
          finalUrl = await compositeLogoOntoImage({
            generatedImageUrl: finalUrl,
            logoUrl: effectiveLogoUrl,
            position: positionFromAssetType(assetType),
            scale: scaleFromAssetType(assetType),
          });
        } catch (compErr) {
          console.warn('[BatchCompositor] Logo compositing failed:', compErr);
        }
      }
      return { imageUrl: finalUrl };
    } catch (err: any) {
      return { error: err.message || 'Generation failed' };
    }
  }, [effectiveBrand, effectiveLogoUrl, eventName, assetDisplayInfo]);

  const startBatch = useCallback(async () => {
    if (!effectiveBrand) {
      toast.error('Please select a brand first');
      return;
    }

    setIsRunning(true);
    abortRef.current = false;

    // Generate (or reuse) master style direction and build the prompt block locally.
    // We do NOT read it back from styleAnchor because setMasterDirection triggers an
    // async React re-render — by the time generateOne runs, styleAnchor in its closure
    // would still be stale. Passing the block as a direct parameter avoids this entirely.
    let batchMasterDirectionBlock = '';
    if (styleAnchor.hasMasterDirection && styleAnchor.masterDirection) {
      batchMasterDirectionBlock = buildMasterDirectionPromptBlock(styleAnchor.masterDirection);
    } else {
      const palette = ((effectiveBrand?.styles as any)?.color_palette || []).map((c: any) => ({
        hex: typeof c === 'string' ? c : c.hex || '#667eea',
        name: typeof c === 'string' ? c : c.name || 'Color',
        rgb: '', cmyk: '', hsv: '', pantone: '',
      }));
      const dir = await generateMasterStyleDirection({
        eventDetails: {
          name: eventName,
          description: '',
          date: '', location: '', website: '', email: '',
          incorporateLocationStyle: false,
          eventType: (effectiveBrand?.styles as any)?.industry || 'conference',
        } as any,
        brandContext: effectiveBrand?.styles ? {
          brandName: effectiveBrand.name,
          brandVoice: (effectiveBrand.styles as any)?.brand_voice,
          imageryStyle: (effectiveBrand.styles as any)?.imagery_style,
          patternStyle: (effectiveBrand.styles as any)?.pattern_style,
          moodKeywords: (effectiveBrand.styles as any)?.mood_keywords,
          headingFont: (effectiveBrand.styles as any)?.heading_font,
          bodyFont: (effectiveBrand.styles as any)?.body_font,
        } as any : null,
        colorPalette: palette,
        styleDescription: (effectiveBrand?.styles as any)?.imagery_style,
      }).catch(() => null);
      if (dir) {
        styleAnchor.setMasterDirection(dir);
        batchMasterDirectionBlock = buildMasterDirectionPromptBlock(dir);
        console.log('[BatchGen] Master style direction generated');
      }
    }

    let batchAnchorUrl = styleAnchor.anchorImageUrl;

    const pending = results
      .filter(r => r.status === 'pending' || r.status === 'error')
      .map(r => r.assetType);

    // Process in batches of MAX_CONCURRENT
    for (let i = 0; i < pending.length; i += MAX_CONCURRENT) {
      if (abortRef.current) break;

      // Wait while paused
      while (isPausedRef.current && !abortRef.current) {
        await new Promise(r => setTimeout(r, 500));
      }
      if (abortRef.current) break;

      const batch = pending.slice(i, i + MAX_CONCURRENT);

      // Mark generating
      setResults(prev => prev.map(r => 
        batch.includes(r.assetType) ? { ...r, status: 'generating' as const } : r
      ));

      const batchResults = await Promise.allSettled(
        batch.map(async (assetType) => {
          const res = await generateOne(assetType, batchAnchorUrl || undefined, batchMasterDirectionBlock || undefined);
          return { assetType, ...res };
        })
      );

      // Update results
      const newImages: Record<string, string> = {};
      setResults(prev => prev.map(r => {
        const result = batchResults.find(br => {
          if (br.status === 'fulfilled') return br.value.assetType === r.assetType;
          return false;
        });
        if (result && result.status === 'fulfilled') {
          const val = result.value;
          if (val.imageUrl) {
            newImages[val.assetType] = val.imageUrl;
            return { ...r, status: 'complete' as const, imageUrl: val.imageUrl };
          }
          return { ...r, status: 'error' as const, error: val.error };
        }
        return r;
      }));

      // Push partial results immediately
      if (Object.keys(newImages).length > 0) {
        onImagesGenerated(newImages);
        // Use first successful image as anchor for subsequent batches
        if (!batchAnchorUrl) {
          const firstUrl = Object.values(newImages)[0];
          if (firstUrl) {
            batchAnchorUrl = firstUrl;
            styleAnchor.setAnchorImage(firstUrl, Object.keys(newImages)[0]);
            console.log('[BatchGen] First result set as style anchor');
          }
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + MAX_CONCURRENT < pending.length && !abortRef.current) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    setIsRunning(false);
    if (!abortRef.current) {
      toast.success('Batch generation complete!');
    }
  }, [results, effectiveBrand, generateOne, onImagesGenerated]);

  const handlePauseResume = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(p => !p);
  };

  const handleCancel = () => {
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    isPausedRef.current = false;
  };

  const handleClose = () => {
    if (isRunning) {
      handleCancel();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && !isRunning && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Batch Generate All Assets
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} assets · {effectiveBrand?.name || 'No brand'} 
                {effectiveLogoUrl && ' · Logo applied'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} disabled={isRunning}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="px-5 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedCount}/{totalCount} complete
                  {errorCount > 0 && <span className="text-destructive ml-2">({errorCount} failed)</span>}
                </span>
                <span className="font-medium">{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>
          )}

          {/* Asset list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {results.map((result) => (
              <div 
                key={result.assetType}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  result.status === 'complete' && "border-primary/30 bg-primary/5",
                  result.status === 'generating' && "border-primary/50 bg-primary/10 animate-pulse",
                  result.status === 'error' && "border-destructive/30 bg-destructive/5",
                  result.status === 'pending' && "border-border bg-muted/30"
                )}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {result.imageUrl ? (
                    <img src={result.imageUrl} alt={result.assetName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {result.status === 'generating' ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.assetName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.status === 'generating' && 'Generating...'}
                    {result.status === 'pending' && 'Waiting...'}
                    {result.status === 'complete' && 'Done'}
                    {result.status === 'error' && (result.error || 'Failed')}
                  </p>
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {result.status === 'complete' && <Check className="h-5 w-5 text-primary" />}
                  {result.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                  {result.status === 'generating' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border flex items-center justify-between gap-3">
            {!isRunning ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {completedCount > 0 
                    ? `${completedCount} generated · ${totalCount - completedCount - errorCount} remaining`
                    : `Ready to generate ${totalCount} assets`}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button 
                    onClick={startBatch} 
                    className={`bg-gradient-to-r ${studioGradient}`}
                    disabled={results.every(r => r.status === 'complete')}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {completedCount > 0 ? 'Continue' : 'Generate All'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {isPaused ? 'Paused' : 'Generating...'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePauseResume}>
                    {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
