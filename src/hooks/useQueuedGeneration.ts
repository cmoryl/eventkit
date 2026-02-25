import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  generationQueue, 
  GenerationJob, 
  JobStatus, 
  QueueEvent,
  GenerationPriority 
} from '@/services/generationQueue';
import {
  debouncedSaveQueueState,
  forceSaveQueueState,
  clearQueueState,
  getStoredPendingJobs,
  getQueueSummary,
} from '@/services/queuePersistence';
import { recordJobAnalytics } from '@/services/queueAnalyticsService';
import { supabase } from '@/integrations/supabase/client';
import type { GeneratedAsset, ColorInfo, EventDetails } from '@/types';
import type { RenderEngine } from '@/services/aiBrain/types';
import { generatePlaceholderContent } from '@/services/assetGenerator';
import { AssetType } from '@/types';

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  isPaused: boolean;
  totalJobs: number;
  completionPercentage: number;
}

interface UseQueuedGenerationProps {
  eventDetails: EventDetails;
  colorPalette: ColorInfo[];
  setColorPalette: (palette: ColorInfo[]) => void;
  setGeneratedAssets: React.Dispatch<React.SetStateAction<GeneratedAsset[]>>;
  logoBase64?: string;
  styleDesc?: string;
  vibeImageBase64?: string;
  masterPatternBase64?: string;
  venueImageBase64?: string;
  renderEngine?: RenderEngine;
  onGenerationComplete?: (completed: number, failed: number) => void;
  onAssetComplete?: (title: string, remaining: number) => void;
}

export function useQueuedGeneration({
  eventDetails,
  colorPalette,
  setColorPalette,
  setGeneratedAssets,
  logoBase64,
  styleDesc,
  vibeImageBase64,
  masterPatternBase64,
  venueImageBase64,
  renderEngine,
  onGenerationComplete,
  onAssetComplete,
}: UseQueuedGenerationProps) {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    isPaused: false,
    totalJobs: 0,
    completionPercentage: 0,
  });
  
  const completedCountRef = useRef(0);
  const failedCountRef = useRef(0);
  const totalJobsRef = useRef(0);

  // Update stats helper
  const updateStats = useCallback(() => {
    const currentJobs = generationQueue.getJobs();
    const status = generationQueue.getStatus();
    
    const retryingCount = currentJobs.filter(j => j.status === JobStatus.Retrying).length;
    
    setStats({
      pending: status.pending,
      processing: status.processing,
      completed: completedCountRef.current,
      failed: failedCountRef.current,
      retrying: retryingCount,
      isPaused: status.isPaused,
      totalJobs: totalJobsRef.current,
      completionPercentage: totalJobsRef.current > 0 
        ? Math.round(((completedCountRef.current + failedCountRef.current) / totalJobsRef.current) * 100)
        : 0,
    });
    
    setJobs([...currentJobs]);
  }, []);

  // Handle queue events and persistence
  useEffect(() => {
    const unsubscribe = generationQueue.subscribe((event: QueueEvent) => {
      switch (event.type) {
        case 'job-added':
          updateStats();
          // Save queue state on changes
          debouncedSaveQueueState(
            generationQueue.getJobs(),
            generationQueue.getContextInfo() || undefined
          );
          break;
          
        case 'job-started':
          if (event.job) {
            setGeneratedAssets(prev => prev.map(asset =>
              asset.id === event.job!.assetId
                ? { ...asset, isLoading: true }
                : asset
            ));
          }
          updateStats();
          debouncedSaveQueueState(
            generationQueue.getJobs(),
            generationQueue.getContextInfo() || undefined
          );
          break;
          
        case 'job-completed':
          if (event.job) {
            completedCountRef.current++;
            
            // Calculate duration
            const durationMs = event.job.startedAt 
              ? Date.now() - event.job.startedAt 
              : undefined;
            
            // Record analytics
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                recordJobAnalytics({
                  userId: user.id,
                  assetType: event.job!.assetType,
                  jobId: event.job!.id,
                  status: 'completed',
                  durationMs,
                  retryCount: event.job!.retryCount,
                });
              }
            });
            
            // Update the asset with the result
            setGeneratedAssets(prev => prev.map(asset =>
              asset.id === event.job!.assetId
                ? { ...asset, content: event.job!.result, isLoading: false }
                : asset
            ));
            
            // Update color palette if this was palette generation
            if (event.job.assetType === AssetType.Palette && event.job.result) {
              setColorPalette(event.job.result as ColorInfo[]);
            }

            // Notify asset complete
            const remainingJobs = generationQueue.getJobs().filter(
              j => j.status === JobStatus.Pending || j.status === JobStatus.Processing
            ).length;
            onAssetComplete?.(event.job.assetTitle, remainingJobs);
          }
          updateStats();
          debouncedSaveQueueState(
            generationQueue.getJobs(),
            generationQueue.getContextInfo() || undefined
          );
          break;
          
        case 'job-failed':
          if (event.job) {
            failedCountRef.current++;
            
            // Calculate duration
            const failedDurationMs = event.job.startedAt 
              ? Date.now() - event.job.startedAt 
              : undefined;
            
            // Record analytics for failed job
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                recordJobAnalytics({
                  userId: user.id,
                  assetType: event.job!.assetType,
                  jobId: event.job!.id,
                  status: 'failed',
                  durationMs: failedDurationMs,
                  retryCount: event.job!.retryCount,
                  errorMessage: event.job!.error,
                });
              }
            });
            
            setGeneratedAssets(prev => prev.map(asset =>
              asset.id === event.job!.assetId
                ? { ...asset, content: `Error: ${event.job!.error}`, isLoading: false }
                : asset
            ));
          }
          updateStats();
          debouncedSaveQueueState(
            generationQueue.getJobs(),
            generationQueue.getContextInfo() || undefined
          );
          break;
          
        case 'job-retrying':
          updateStats();
          break;
          
        case 'queue-empty':
          updateStats();
          // Notify generation complete
          if (completedCountRef.current > 0 || failedCountRef.current > 0) {
            onGenerationComplete?.(completedCountRef.current, failedCountRef.current);
          }
          // Clear persisted state when queue is empty
          clearQueueState();
          break;
          
        case 'queue-paused':
        case 'queue-resumed':
          updateStats();
          break;
      }
    });

    // Save queue state on page unload
    const handleBeforeUnload = () => {
      if (generationQueue.hasPendingWork()) {
        forceSaveQueueState(
          generationQueue.getJobs(),
          generationQueue.getContextInfo() || undefined
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateStats, setGeneratedAssets, setColorPalette, onGenerationComplete, onAssetComplete]);

  // Start queued generation for assets
  // Accepts optional overrides for images/style to avoid race conditions
  // when called immediately after state updates (e.g. from onboarding)
  const startQueuedGeneration = useCallback((
    assets: GeneratedAsset[],
    overridePalette?: ColorInfo[],
    overrides?: {
      logoBase64?: string;
      vibeImageBase64?: string;
      masterPatternBase64?: string;
      venueImageBase64?: string;
      styleDesc?: string;
    }
  ) => {
    // Reset counters
    completedCountRef.current = 0;
    failedCountRef.current = 0;
    totalJobsRef.current = assets.length;
    
    // Use overrides if provided (avoids race condition with state-based values)
    const effectiveLogoBase64 = overrides?.logoBase64 ?? logoBase64;
    const effectiveVibeBase64 = overrides?.vibeImageBase64 ?? vibeImageBase64;
    const effectivePatternBase64 = overrides?.masterPatternBase64 ?? masterPatternBase64;
    const effectiveVenueBase64 = overrides?.venueImageBase64 ?? venueImageBase64;
    const effectiveStyleDesc = overrides?.styleDesc ?? styleDesc;
    
    // Set generation context
    generationQueue.setGenerationContext(
      generatePlaceholderContent,
      {
        eventDetails,
        colorPalette: overridePalette || colorPalette,
        logoBase64: effectiveLogoBase64,
        styleDesc: effectiveStyleDesc,
        vibeImageBase64: effectiveVibeBase64,
        masterPatternBase64: effectivePatternBase64,
        venueImageBase64: effectiveVenueBase64,
        renderEngine,
      }
    );
    
    // Add all jobs to queue
    const jobs = generationQueue.addJobs(assets);
    
    console.log(`Started queued generation for ${assets.length} assets`, {
      hasLogo: !!effectiveLogoBase64,
      hasVibeImage: !!effectiveVibeBase64,
      hasPattern: !!effectivePatternBase64,
      hasVenue: !!effectiveVenueBase64,
      style: effectiveStyleDesc?.substring(0, 50),
    });
    
    return jobs;
  }, [
    eventDetails, 
    colorPalette, 
    logoBase64, 
    styleDesc, 
    vibeImageBase64, 
    masterPatternBase64, 
    venueImageBase64, 
    renderEngine
  ]);

  // Retry a specific failed job
  const retryJob = useCallback((assetId: string) => {
    const asset = jobs.find(j => j.assetId === assetId);
    if (asset && asset.status === JobStatus.Failed) {
      // Re-add as new job
      const newJob: GeneratedAsset = {
        id: assetId,
        type: asset.assetType,
        title: asset.assetTitle,
        content: undefined,
        isLoading: true,
      };
      generationQueue.addJob(newJob);
    }
  }, [jobs]);

  // Retry all failed jobs
  const retryAllFailed = useCallback(() => {
    const failedJobs = jobs.filter(j => j.status === JobStatus.Failed);
    
    failedJobs.forEach(job => {
      const newJob: GeneratedAsset = {
        id: job.assetId,
        type: job.assetType,
        title: job.assetTitle,
        content: undefined,
        isLoading: true,
      };
      generationQueue.addJob(newJob);
    });
    
    console.log(`Retrying ${failedJobs.length} failed jobs`);
  }, [jobs]);

  // Pause/resume queue
  const pauseQueue = useCallback(() => {
    generationQueue.pause();
  }, []);

  const resumeQueue = useCallback(() => {
    generationQueue.resume();
  }, []);

  // Cancel all pending jobs
  const cancelAll = useCallback(() => {
    generationQueue.cancelAll();
    updateStats();
  }, [updateStats]);

  // Clear queue state
  const clearQueue = useCallback(() => {
    generationQueue.clear();
    clearQueueState();
    completedCountRef.current = 0;
    failedCountRef.current = 0;
    totalJobsRef.current = 0;
    updateStats();
  }, [updateStats]);

  // Restore queue from persisted state
  const restoreQueue = useCallback((
    setAssetsFn: React.Dispatch<React.SetStateAction<GeneratedAsset[]>>
  ) => {
    const storedJobs = getStoredPendingJobs();
    if (storedJobs.length === 0) return false;

    // Create asset placeholders for restored jobs
    const restoredAssets: GeneratedAsset[] = storedJobs.map(job => ({
      id: job.assetId,
      type: job.assetType,
      title: job.assetTitle,
      content: undefined,
      isLoading: true,
    }));

    setAssetsFn(prev => {
      // Merge with existing assets (avoid duplicates)
      const existingIds = new Set(prev.map(a => a.id));
      const newAssets = restoredAssets.filter(a => !existingIds.has(a.id));
      return [...prev, ...newAssets];
    });

    // Restore jobs to queue
    generationQueue.restoreJobs(storedJobs);
    totalJobsRef.current = storedJobs.length;
    updateStats();

    return true;
  }, [updateStats]);

  // Check for restorable queue
  const checkRestorableQueue = useCallback(() => {
    return getQueueSummary();
  }, []);

  // Discard stored queue
  const discardStoredQueue = useCallback(() => {
    clearQueueState();
  }, []);

  return {
    jobs,
    stats,
    startQueuedGeneration,
    retryJob,
    retryAllFailed,
    pauseQueue,
    resumeQueue,
    cancelAll,
    clearQueue,
    restoreQueue,
    checkRestorableQueue,
    discardStoredQueue,
    isProcessing: stats.processing > 0 || stats.pending > 0,
  };
}
