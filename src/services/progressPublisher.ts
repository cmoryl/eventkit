import { supabase } from '@/integrations/supabase/client';

export interface ProgressUpdate {
  totalAssets: number;
  completedAssets: number;
  currentAssetName?: string;
  currentAssetType?: string;
  phase: 'preparing' | 'analyzing' | 'generating' | 'complete';
  estimatedSecondsRemaining?: number;
  completedAICalls?: number;
  estimatedAICalls?: number;
  errorMessage?: string;
}

class ProgressPublisher {
  private sessionId: string | null = null;
  private progressId: string | null = null;
  private userId: string | null = null;
  private updateQueue: ProgressUpdate[] = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  async startSession(userId: string): Promise<string> {
    this.userId = userId;
    this.sessionId = crypto.randomUUID();
    
    try {
      const { data, error } = await supabase
        .from('generation_progress')
        .insert({
          session_id: this.sessionId,
          user_id: userId,
          phase: 'preparing',
          total_assets: 0,
          completed_assets: 0,
          completed_ai_calls: 0,
          estimated_ai_calls: 0,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to start progress session:', error);
        throw error;
      }

      this.progressId = data.id;
      console.log('Started progress session:', this.sessionId);
      
      return this.sessionId;
    } catch (err) {
      console.error('Error starting progress session:', err);
      throw err;
    }
  }

  async updateProgress(update: ProgressUpdate): Promise<void> {
    if (!this.progressId || !this.sessionId) {
      console.warn('No active progress session');
      return;
    }

    // Queue the update
    this.updateQueue.push(update);
    
    // Debounce updates to avoid overwhelming the database
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processQueue();
    }, 100); // 100ms debounce
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) return;
    
    this.isProcessing = true;
    
    // Get the latest update (most recent state)
    const latestUpdate = this.updateQueue[this.updateQueue.length - 1];
    this.updateQueue = [];

    try {
      const { error } = await supabase
        .from('generation_progress')
        .update({
          total_assets: latestUpdate.totalAssets,
          completed_assets: latestUpdate.completedAssets,
          current_asset_name: latestUpdate.currentAssetName || null,
          current_asset_type: latestUpdate.currentAssetType || null,
          phase: latestUpdate.phase,
          estimated_seconds_remaining: latestUpdate.estimatedSecondsRemaining || 0,
          completed_ai_calls: latestUpdate.completedAICalls || 0,
          estimated_ai_calls: latestUpdate.estimatedAICalls || 0,
          error_message: latestUpdate.errorMessage || null,
          completed_at: latestUpdate.phase === 'complete' ? new Date().toISOString() : null,
        })
        .eq('id', this.progressId);

      if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      this.isProcessing = false;
      
      // Process any queued updates that came in while we were processing
      if (this.updateQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  async endSession(): Promise<void> {
    if (!this.progressId) return;

    try {
      // Final update to mark as complete
      await supabase
        .from('generation_progress')
        .update({
          phase: 'complete',
          completed_at: new Date().toISOString(),
        })
        .eq('id', this.progressId);

      console.log('Ended progress session:', this.sessionId);
    } catch (err) {
      console.error('Error ending progress session:', err);
    } finally {
      this.reset();
    }
  }

  async cancelSession(): Promise<void> {
    if (!this.progressId) return;

    try {
      await supabase
        .from('generation_progress')
        .delete()
        .eq('id', this.progressId);

      console.log('Cancelled progress session:', this.sessionId);
    } catch (err) {
      console.error('Error cancelling progress session:', err);
    } finally {
      this.reset();
    }
  }

  private reset(): void {
    this.sessionId = null;
    this.progressId = null;
    this.updateQueue = [];
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  isActive(): boolean {
    return this.sessionId !== null && this.progressId !== null;
  }
}

// Singleton instance
export const progressPublisher = new ProgressPublisher();
