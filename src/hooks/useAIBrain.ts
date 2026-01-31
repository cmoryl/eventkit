// Hook for using the AI Brain in React components
import { useState, useEffect, useCallback } from 'react';
import { AIBrain, getAIBrain, clearAIBrain } from '@/services/aiBrain';
import type { GenerationContext, GenerationResult, LearnedInsight, RenderEngine } from '@/services/aiBrain/types';
import { useAuth } from './useAuth';

export function useAIBrain() {
  const { user } = useAuth();
  const [brain, setBrain] = useState<AIBrain | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<LearnedInsight[]>([]);
  const [defaultEngine, setDefaultEngine] = useState<RenderEngine | null>(null);

  // Initialize brain when user logs in
  useEffect(() => {
    if (user?.id) {
      initializeBrain(user.id);
    } else {
      setBrain(null);
      setInsights([]);
      setDefaultEngine(null);
    }
  }, [user?.id]);

  const initializeBrain = async (userId: string) => {
    setLoading(true);
    try {
      const aiBrain = await getAIBrain(userId);
      setBrain(aiBrain);
      setInsights(aiBrain.getInsights());
      setDefaultEngine(aiBrain.getDefaultEngine());
    } catch (error) {
      console.error('Failed to initialize AI Brain:', error);
    }
    setLoading(false);
  };

  const generateAsset = useCallback(async (
    context: GenerationContext
  ): Promise<GenerationResult | null> => {
    if (!brain) {
      console.warn('AI Brain not initialized');
      return null;
    }

    try {
      const result = await brain.generateAsset(context);
      return result;
    } catch (error) {
      console.error('Generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTimeMs: 0,
        promptUsed: '',
        renderEngine: 'lovable',
      };
    }
  }, [brain]);

  const provideFeedback = useCallback(async (
    generationId: string,
    feedbackType: 'thumbs_up' | 'thumbs_down' | 'edited' | 'regenerated' | 'accepted',
    rating?: number,
    feedbackText?: string
  ) => {
    if (!brain) return;
    
    await brain.provideFeedback(generationId, feedbackType, rating, feedbackText);
    
    // Refresh insights after feedback
    setInsights(brain.getInsights());
  }, [brain]);

  const refreshBrain = useCallback(async () => {
    if (user?.id) {
      clearAIBrain(user.id);
      await initializeBrain(user.id);
    }
  }, [user?.id]);

  return {
    brain,
    loading,
    insights,
    defaultEngine,
    generateAsset,
    provideFeedback,
    refreshBrain,
    isReady: !!brain,
  };
}
