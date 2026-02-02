import { useState, useEffect, useCallback } from 'react';
import { 
  fetchAnalyticsSummary, 
  recordJobAnalytics,
  clearAnalytics 
} from '@/services/queueAnalyticsService';
import { supabase } from '@/integrations/supabase/client';
import { AssetType } from '@/types';

interface AssetTypeStats {
  assetType: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  avgDurationMs: number;
  avgRetries: number;
}

interface AnalyticsSummary {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  overallSuccessRate: number;
  avgDurationMs: number;
  statsByAssetType: AssetTypeStats[];
  recentErrors: { assetType: string; error: string; createdAt: string }[];
}

interface UseQueueAnalyticsResult {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  recordJob: (params: {
    assetType: AssetType;
    jobId: string;
    status: 'completed' | 'failed';
    durationMs?: number;
    retryCount?: number;
    errorMessage?: string;
    renderEngine?: string;
    sessionId?: string;
  }) => Promise<boolean>;
  clearAllAnalytics: () => Promise<boolean>;
}

export function useQueueAnalytics(daysBack: number = 30): UseQueueAnalyticsResult {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAnalyticsSummary(daysBack);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [daysBack]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Record a job completion/failure
  const recordJob = useCallback(async (params: {
    assetType: AssetType;
    jobId: string;
    status: 'completed' | 'failed';
    durationMs?: number;
    retryCount?: number;
    errorMessage?: string;
    renderEngine?: string;
    sessionId?: string;
  }): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const success = await recordJobAnalytics({
      userId: user.id,
      sessionId: params.sessionId,
      assetType: params.assetType,
      jobId: params.jobId,
      status: params.status,
      durationMs: params.durationMs,
      retryCount: params.retryCount,
      errorMessage: params.errorMessage,
      renderEngine: params.renderEngine,
    });

    // Refetch summary after recording
    if (success) {
      refetch();
    }

    return success;
  }, [refetch]);

  // Clear all analytics
  const clearAllAnalytics = useCallback(async (): Promise<boolean> => {
    const success = await clearAnalytics();
    if (success) {
      setSummary({
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        overallSuccessRate: 0,
        avgDurationMs: 0,
        statsByAssetType: [],
        recentErrors: [],
      });
    }
    return success;
  }, []);

  return {
    summary,
    isLoading,
    error,
    refetch,
    recordJob,
    clearAllAnalytics,
  };
}
