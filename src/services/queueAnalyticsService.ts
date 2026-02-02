import { supabase } from '@/integrations/supabase/client';
import { AssetType } from '@/types';

interface AnalyticsRecord {
  userId: string;
  sessionId?: string;
  assetType: AssetType;
  jobId: string;
  status: 'completed' | 'failed';
  durationMs?: number;
  retryCount?: number;
  errorMessage?: string;
  renderEngine?: string;
}

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

// Record a completed or failed job
export async function recordJobAnalytics(record: AnalyticsRecord): Promise<boolean> {
  try {
    const { error } = await supabase.from('queue_analytics').insert({
      user_id: record.userId,
      session_id: record.sessionId,
      asset_type: record.assetType,
      job_id: record.jobId,
      status: record.status,
      duration_ms: record.durationMs,
      retry_count: record.retryCount || 0,
      error_message: record.errorMessage,
      render_engine: record.renderEngine,
    });

    if (error) {
      console.error('Failed to record analytics:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Analytics recording error:', err);
    return false;
  }
}

// Fetch analytics summary for the current user
export async function fetchAnalyticsSummary(
  daysBack: number = 30
): Promise<AnalyticsSummary | null> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const { data, error } = await supabase
      .from('queue_analytics')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalGenerations: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        overallSuccessRate: 0,
        avgDurationMs: 0,
        statsByAssetType: [],
        recentErrors: [],
      };
    }

    // Aggregate by asset type
    const byAssetType = new Map<string, {
      total: number;
      success: number;
      failed: number;
      totalDuration: number;
      durationCount: number;
      totalRetries: number;
    }>();

    let totalDuration = 0;
    let durationCount = 0;
    let successCount = 0;
    let failedCount = 0;

    data.forEach((record) => {
      const assetType = record.asset_type;
      const isSuccess = record.status === 'completed';

      if (isSuccess) successCount++;
      else failedCount++;

      if (record.duration_ms) {
        totalDuration += record.duration_ms;
        durationCount++;
      }

      if (!byAssetType.has(assetType)) {
        byAssetType.set(assetType, {
          total: 0,
          success: 0,
          failed: 0,
          totalDuration: 0,
          durationCount: 0,
          totalRetries: 0,
        });
      }

      const stats = byAssetType.get(assetType)!;
      stats.total++;
      if (isSuccess) stats.success++;
      else stats.failed++;
      if (record.duration_ms) {
        stats.totalDuration += record.duration_ms;
        stats.durationCount++;
      }
      stats.totalRetries += record.retry_count || 0;
    });

    // Convert to array and calculate rates
    const statsByAssetType: AssetTypeStats[] = Array.from(byAssetType.entries())
      .map(([assetType, stats]) => ({
        assetType,
        totalCount: stats.total,
        successCount: stats.success,
        failedCount: stats.failed,
        successRate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
        avgDurationMs: stats.durationCount > 0 ? stats.totalDuration / stats.durationCount : 0,
        avgRetries: stats.total > 0 ? stats.totalRetries / stats.total : 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);

    // Get recent errors
    const recentErrors = data
      .filter((r) => r.status === 'failed' && r.error_message)
      .slice(0, 10)
      .map((r) => ({
        assetType: r.asset_type,
        error: r.error_message || 'Unknown error',
        createdAt: r.created_at,
      }));

    return {
      totalGenerations: data.length,
      successfulGenerations: successCount,
      failedGenerations: failedCount,
      overallSuccessRate: data.length > 0 ? (successCount / data.length) * 100 : 0,
      avgDurationMs: durationCount > 0 ? totalDuration / durationCount : 0,
      statsByAssetType,
      recentErrors,
    };
  } catch (err) {
    console.error('Analytics summary error:', err);
    return null;
  }
}

// Clear analytics for the current user
export async function clearAnalytics(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('queue_analytics')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to clear analytics:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Clear analytics error:', err);
    return false;
  }
}
