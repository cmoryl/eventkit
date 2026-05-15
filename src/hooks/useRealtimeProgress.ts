import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeProgressData {
  id: string;
  session_id: string;
  total_assets: number;
  completed_assets: number;
  current_asset_name: string | null;
  current_asset_type: string | null;
  phase: 'preparing' | 'analyzing' | 'generating' | 'complete';
  estimated_seconds_remaining: number;
  completed_ai_calls: number;
  estimated_ai_calls: number;
  error_message: string | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface UseRealtimeProgressOptions {
  sessionId: string | null;
  enabled?: boolean;
}

export function useRealtimeProgress({ sessionId, enabled = true }: UseRealtimeProgressOptions) {
  const [progress, setProgress] = useState<RealtimeProgressData | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial progress data
  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('generation_progress')
        .select('*')
        .eq('session_id', sessionId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching progress:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        setProgress(data as RealtimeProgressData);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !enabled) {
      setProgress(null);
      return;
    }

    // Fetch initial state
    fetchProgress();

    // Subscribe to realtime updates
    const channel: RealtimeChannel = supabase
      .channel(`generation-progress-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_progress',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setProgress(payload.new as RealtimeProgressData);
          } else if (payload.eventType === 'DELETE') {
            setProgress(null);
          }
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
        if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to realtime updates');
        }
      });

    return () => {
      supabase.removeChannel(channel).catch(() => {});
      setIsSubscribed(false);
    };
  }, [sessionId, enabled, fetchProgress]);

  return {
    progress,
    isSubscribed,
    error,
    refetch: fetchProgress,
  };
}
