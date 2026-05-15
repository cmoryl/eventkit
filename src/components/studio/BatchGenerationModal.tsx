import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Loader2, Check, AlertCircle, Pause, Play, 
  Download, ChevronDown, ChevronUp, Image as ImageIcon, RotateCw
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

type ErrorKind = 'timeout' | 'rate_limit' | 'quota' | 'auth' | 'network' | 'invalid_input' | 'api';

interface BatchAssetResult {
  assetType: string;
  assetName: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  imageUrl?: string;
  error?: string;
  errorKind?: ErrorKind;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
}

const ERROR_KIND_LABEL: Record<ErrorKind, string> = {
  timeout: 'Timed out',
  rate_limit: 'Rate limit hit',
  quota: 'AI credits exhausted',
  auth: 'Authentication error',
  network: 'Network error',
  invalid_input: 'Invalid input',
  api: 'AI service error',
};

const classifyError = (raw: string | undefined): ErrorKind => {
  const msg = (raw || '').toLowerCase();
  if (!msg) return 'api';
  if (msg.includes('timed out') || msg.includes('timeout')) return 'timeout';
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) return 'rate_limit';
  if (msg.includes('402') || msg.includes('quota') || msg.includes('credits') || msg.includes('payment')) return 'quota';
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthor') || msg.includes('forbidden')) return 'auth';
  if (msg.includes('network') || msg.includes('fetch failed') || msg.includes('econnreset') || msg.includes('failed to fetch')) return 'network';
  if (msg.includes('invalid') || msg.includes('safety') || msg.includes('blocked')) return 'invalid_input';
  return 'api';
};

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
  referenceImages?: string[]; // base64 data URLs
  referenceNotes?: string; // extracted text / filenames from uploaded docs
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
  referenceImages,
  referenceNotes,
}) => {
  const { activeBrand } = useActiveBrand();
  const styleAnchor = useStyleAnchor();
  const [results, setResults] = useState<BatchAssetResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
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
  const generatingCount = results.filter(r => r.status === 'generating').length;
  const totalCount = results.length;
  const settledCount = completedCount + errorCount;
  const progressPct = totalCount > 0 ? (settledCount / totalCount) * 100 : 0;

  // 1Hz tick to refresh elapsed timers while generating
  const [, setNowTick] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNowTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // ETA based on average duration of completed assets
  const avgDurationMs = (() => {
    const done = results.filter(r => r.status === 'complete' && r.durationMs);
    if (done.length === 0) return 0;
    return done.reduce((s, r) => s + (r.durationMs || 0), 0) / done.length;
  })();
  const remainingCount = totalCount - settledCount;
  const etaSeconds = avgDurationMs > 0 && remainingCount > 0
    ? Math.round((avgDurationMs * Math.ceil(remainingCount / MAX_CONCURRENT)) / 1000)
    : 0;

  const formatDuration = (ms: number): string => {
    const s = Math.max(0, Math.round(ms / 1000));
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

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
          referenceImages: referenceImages && referenceImages.length > 0 ? referenceImages : undefined,
          referenceNotes: referenceNotes || undefined,
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
          toast.warning(`Logo could not be applied to ${assetType} — exported without logo overlay.`);
        }
      }
      return { imageUrl: finalUrl };
    } catch (err: any) {
      return { error: err.message || 'Generation failed' };
    }
  }, [effectiveBrand, effectiveLogoUrl, eventName, assetDisplayInfo]);

  // Wrap a promise so it never hangs the UI longer than `ms`.
  const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)
      ),
    ]);

  // Safety net: if results all settled but isRunning never flipped (e.g. an
  // unhandled hang inside the loop), release the UI so the user can close.
  useEffect(() => {
    if (!isRunning) return;
    if (results.length === 0) return;
    const stillWorking = results.some(r => r.status === 'pending' || r.status === 'generating');
    if (!stillWorking) {
      setIsRunning(false);
    }
  }, [results, isRunning]);

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

      // Mark generating + stamp start time
      const startedAt = Date.now();
      setResults(prev => prev.map(r => 
        batch.includes(r.assetType) ? { ...r, status: 'generating' as const, startedAt, finishedAt: undefined, durationMs: undefined } : r
      ));

      const batchResults = await Promise.allSettled(
        batch.map(async (assetType): Promise<{ assetType: string; imageUrl?: string; error?: string }> => {
          const res = await withTimeout(
            generateOne(assetType, batchAnchorUrl || undefined, batchMasterDirectionBlock || undefined),
            120_000,
            `Generation for ${assetType}`
          ).catch((err: any) => ({ error: err?.message || 'Generation timed out' } as { imageUrl?: string; error?: string }));
          return { assetType, ...res };
        })
      );

      // Update results
      const finishedAt = Date.now();
      const newImages: Record<string, string> = {};
      const batchFailures: { name: string; kind: ErrorKind; error: string }[] = [];
      setResults(prev => prev.map(r => {
        const result = batchResults.find(br => {
          if (br.status === 'fulfilled') return br.value.assetType === r.assetType;
          return false;
        });
        if (result && result.status === 'fulfilled') {
          const val = result.value;
          const durationMs = r.startedAt ? finishedAt - r.startedAt : undefined;
          if (val.imageUrl) {
            newImages[val.assetType] = val.imageUrl;
            return { ...r, status: 'complete' as const, imageUrl: val.imageUrl, finishedAt, durationMs };
          }
          const errorKind = classifyError(val.error);
          batchFailures.push({ name: r.assetName, kind: errorKind, error: val.error || 'Unknown error' });
          return { ...r, status: 'error' as const, error: val.error, errorKind, finishedAt, durationMs };
        }
        return r;
      }));

      // Per-asset failure toasts so the user immediately sees which one + why
      batchFailures.forEach(({ name, kind, error }) => {
        toast.error(`${name}: ${ERROR_KIND_LABEL[kind]}`, {
          description: error.length > 160 ? error.slice(0, 160) + '…' : error,
        });
      });

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
      // Read latest results from state at completion via a setter callback
      setResults(prev => {
        const ok = prev.filter(r => r.status === 'complete').length;
        const failed = prev.filter(r => r.status === 'error').length;
        if (failed === 0) {
          toast.success(`Batch generation complete — ${ok} asset${ok === 1 ? '' : 's'} ready`);
        } else if (ok === 0) {
          toast.error(`Batch failed — all ${failed} asset${failed === 1 ? '' : 's'} errored. Use Retry failed to try again.`);
        } else {
          toast.warning(`Batch finished — ${ok} succeeded, ${failed} failed. Use Retry failed to retry.`);
        }
        return prev;
      });
    }
  }, [results, effectiveBrand, generateOne, onImagesGenerated]);

  // Retry a single failed asset without rerunning the whole batch.
  const retryOne = useCallback(async (assetType: string) => {
    if (!effectiveBrand) {
      toast.error('Please select a brand first');
      return;
    }
    const target = results.find(r => r.assetType === assetType);
    if (!target) return;

    // Build master direction block (reuse anchor's if present)
    let masterDirectionBlock = '';
    if (styleAnchor.hasMasterDirection && styleAnchor.masterDirection) {
      masterDirectionBlock = buildMasterDirectionPromptBlock(styleAnchor.masterDirection);
    }
    const anchorUrl = styleAnchor.anchorImageUrl || undefined;

    const startedAt = Date.now();
    setResults(prev => prev.map(r =>
      r.assetType === assetType
        ? { ...r, status: 'generating' as const, error: undefined, errorKind: undefined, startedAt, finishedAt: undefined, durationMs: undefined }
        : r
    ));

    const res = await withTimeout(
      generateOne(assetType, anchorUrl, masterDirectionBlock || undefined),
      120_000,
      `Generation for ${assetType}`
    ).catch((err: any) => ({ error: err?.message || 'Generation timed out' } as { imageUrl?: string; error?: string }));

    const finishedAt = Date.now();
    const durationMs = finishedAt - startedAt;

    if (res.imageUrl) {
      const url = res.imageUrl;
      setResults(prev => prev.map(r =>
        r.assetType === assetType
          ? { ...r, status: 'complete' as const, imageUrl: url, finishedAt, durationMs }
          : r
      ));
      onImagesGenerated({ [assetType]: url });
      toast.success(`${target.assetName} regenerated`);
    } else {
      const errorKind = classifyError(res.error);
      setResults(prev => prev.map(r =>
        r.assetType === assetType
          ? { ...r, status: 'error' as const, error: res.error, errorKind, finishedAt, durationMs }
          : r
      ));
      toast.error(`${target.assetName}: ${ERROR_KIND_LABEL[errorKind]}`, {
        description: (res.error || '').slice(0, 160),
      });
    }
  }, [effectiveBrand, results, styleAnchor, generateOne, onImagesGenerated]);

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
        onClick={(e) => e.target === e.currentTarget && handleClose()}
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
            <Button variant="ghost" size="icon" onClick={handleClose} title={isRunning ? 'Cancel and close' : 'Close'}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress — visible whenever there's any activity or completion */}
          {(isRunning || settledCount > 0) && (
            <div className="px-5 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">{completedCount}</span>
                  /{totalCount} complete
                  {generatingCount > 0 && (
                    <span className="ml-2 text-primary">· {generatingCount} generating</span>
                  )}
                  {errorCount > 0 && (
                    <span className="ml-2 text-destructive">· {errorCount} failed</span>
                  )}
                </span>
                <span className="font-medium tabular-nums">{Math.round(progressPct)}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              {isRunning && etaSeconds > 0 && (
                <p className="text-xs text-muted-foreground">
                  ~{formatDuration(etaSeconds * 1000)} remaining
                  {avgDurationMs > 0 && ` · avg ${formatDuration(avgDurationMs)}/asset`}
                </p>
              )}
            </div>
          )}

          {/* Asset list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {results.map((result) => {
              const elapsedMs = result.status === 'generating' && result.startedAt
                ? Date.now() - result.startedAt
                : result.durationMs || 0;
              return (
                <div 
                  key={result.assetType}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    result.status === 'complete' && "border-primary/30 bg-primary/5",
                    result.status === 'generating' && "border-primary/50 bg-primary/10",
                    result.status === 'error' && "border-destructive/30 bg-destructive/5",
                    result.status === 'pending' && "border-border bg-muted/30"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
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
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{result.assetName}</p>
                      {elapsedMs > 0 && (
                        <span className={cn(
                          "text-[11px] tabular-nums flex-shrink-0",
                          result.status === 'generating' ? "text-primary" : "text-muted-foreground"
                        )}>
                          {formatDuration(elapsedMs)}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "text-xs truncate",
                      result.status === 'error' ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {result.status === 'generating' && 'Rendering design…'}
                      {result.status === 'pending' && 'Queued'}
                      {result.status === 'complete' && 'Ready'}
                      {result.status === 'error' && (
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-medium text-[10px] uppercase tracking-wide flex-shrink-0">
                            {result.errorKind ? ERROR_KIND_LABEL[result.errorKind] : 'Error'}
                          </span>
                          <span className="truncate" title={result.error}>
                            {result.error || 'Failed'}
                          </span>
                        </span>
                      )}
                    </div>
                    {/* Indeterminate per-asset bar while generating */}
                    {result.status === 'generating' && (
                      <div className="mt-1.5 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_1.4s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>

                  {/* Status icon / per-asset retry */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {result.status === 'complete' && <Check className="h-5 w-5 text-primary" />}
                    {result.status === 'generating' && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                    {result.status === 'error' && (
                      <>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={isRunning}
                          onClick={() => retryOne(result.assetType)}
                          title="Retry this asset only"
                        >
                          <RotateCw className="h-3.5 w-3.5 mr-1" />
                          Retry
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border flex items-center justify-between gap-3">
            {!isRunning ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {completedCount > 0 
                    ? `${completedCount} generated · ${totalCount - completedCount - errorCount} remaining${errorCount > 0 ? ` · ${errorCount} failed` : ''}`
                    : `Ready to generate ${totalCount} assets`}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  {errorCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset failed rows to pending so startBatch picks them up
                        setResults(prev => prev.map(r =>
                          r.status === 'error'
                            ? { ...r, status: 'pending' as const, error: undefined, errorKind: undefined, durationMs: undefined, startedAt: undefined, finishedAt: undefined }
                            : r
                        ));
                        // Defer startBatch to next tick so state is applied
                        setTimeout(() => startBatch(), 0);
                      }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Retry {errorCount} failed
                    </Button>
                  )}
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
