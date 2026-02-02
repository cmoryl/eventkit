// Hook for AI-powered creative suggestions
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { EventDetails } from '@/types';
import type { BrandContext } from '@/types/brand.types';
import {
  getAssetRecommendations,
  getDesignVariations,
  type AssetRecommendation,
  type DesignVariation,
  type AssetSuggestionResult,
  type DesignVariationResult
} from '@/services/aiBrain/suggestionService';

interface UseAISuggestionsOptions {
  eventDetails: EventDetails;
  brandContext?: BrandContext | null;
}

interface UseAISuggestionsReturn {
  // Asset recommendations
  assetRecommendations: AssetRecommendation[];
  overallStrategy: string | null;
  isLoadingRecommendations: boolean;
  fetchAssetRecommendations: (existingAssets?: string[]) => Promise<void>;
  
  // Design variations
  designVariations: DesignVariation[];
  isLoadingVariations: boolean;
  fetchDesignVariations: (assetType: string, currentDescription?: string) => Promise<void>;
  
  // Shared state
  lastError: string | null;
  clearSuggestions: () => void;
}

export const useAISuggestions = ({
  eventDetails,
  brandContext
}: UseAISuggestionsOptions): UseAISuggestionsReturn => {
  // Asset recommendations state
  const [assetRecommendations, setAssetRecommendations] = useState<AssetRecommendation[]>([]);
  const [overallStrategy, setOverallStrategy] = useState<string | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Design variations state
  const [designVariations, setDesignVariations] = useState<DesignVariation[]>([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  
  // Error state
  const [lastError, setLastError] = useState<string | null>(null);

  // Fetch asset recommendations
  const fetchAssetRecommendations = useCallback(async (existingAssets?: string[]) => {
    if (!eventDetails.name) {
      toast.error('Please enter event details first');
      return;
    }

    setIsLoadingRecommendations(true);
    setLastError(null);

    try {
      const result = await getAssetRecommendations(eventDetails, brandContext, existingAssets);

      if (!result.success) {
        const errorMsg = result.error || 'Failed to get recommendations';
        setLastError(errorMsg);
        
        if (result.code === 'RATE_LIMITED') {
          toast.error('Rate limited', { description: 'Please wait a moment and try again' });
        } else if (result.code === 'PAYMENT_REQUIRED') {
          toast.error('AI credits exhausted', { description: 'Please add funds to continue' });
        } else {
          toast.error('Failed to get recommendations');
        }
        return;
      }

      setAssetRecommendations(result.recommendations || []);
      setOverallStrategy(result.overallStrategy || null);
      
      if (result.recommendations?.length) {
        toast.success(`${result.recommendations.length} asset recommendations generated`);
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMsg);
      toast.error('Failed to get recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [eventDetails, brandContext]);

  // Fetch design variations
  const fetchDesignVariations = useCallback(async (assetType: string, currentDescription?: string) => {
    if (!eventDetails.name) {
      toast.error('Please enter event details first');
      return;
    }

    setIsLoadingVariations(true);
    setLastError(null);

    try {
      const result = await getDesignVariations(
        eventDetails,
        assetType,
        currentDescription,
        brandContext
      );

      if (!result.success) {
        const errorMsg = result.error || 'Failed to get variations';
        setLastError(errorMsg);
        
        if (result.code === 'RATE_LIMITED') {
          toast.error('Rate limited', { description: 'Please wait a moment and try again' });
        } else if (result.code === 'PAYMENT_REQUIRED') {
          toast.error('AI credits exhausted', { description: 'Please add funds to continue' });
        } else {
          toast.error('Failed to get design variations');
        }
        return;
      }

      setDesignVariations(result.variations || []);
      
      if (result.variations?.length) {
        toast.success(`${result.variations.length} design variations generated`);
      }
    } catch (error) {
      console.error('Variation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLastError(errorMsg);
      toast.error('Failed to get design variations');
    } finally {
      setIsLoadingVariations(false);
    }
  }, [eventDetails, brandContext]);

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setAssetRecommendations([]);
    setOverallStrategy(null);
    setDesignVariations([]);
    setLastError(null);
  }, []);

  return {
    assetRecommendations,
    overallStrategy,
    isLoadingRecommendations,
    fetchAssetRecommendations,
    designVariations,
    isLoadingVariations,
    fetchDesignVariations,
    lastError,
    clearSuggestions
  };
};
