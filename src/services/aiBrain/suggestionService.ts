// AI Creative Suggestion Service
// Provides asset recommendations and design variations based on event/brand context

import { supabase } from '@/integrations/supabase/client';
import type { EventDetails } from '@/types';
import type { BrandContext } from '@/types/brand.types';

export interface AssetRecommendation {
  assetType: string;
  priority: 'essential' | 'recommended' | 'nice_to_have';
  reason: string;
  designHint?: string;
}

export interface DesignVariation {
  name: string;
  description: string;
  styleDifference: string;
  moodKeywords: string[];
  colorSuggestion?: string;
}

export interface AssetSuggestionResult {
  success: boolean;
  recommendations?: AssetRecommendation[];
  overallStrategy?: string;
  error?: string;
  code?: string;
}

export interface DesignVariationResult {
  success: boolean;
  variations?: DesignVariation[];
  error?: string;
  code?: string;
}

/**
 * Get AI-powered asset recommendations based on event context
 */
export const getAssetRecommendations = async (
  eventDetails: EventDetails,
  brandContext?: BrandContext | null,
  existingAssets?: string[]
): Promise<AssetSuggestionResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('suggest-creative', {
      body: {
        type: 'asset_recommendations',
        eventContext: {
          name: eventDetails.name,
          description: eventDetails.description,
          eventType: eventDetails.eventType,
          date: eventDetails.date,
          location: eventDetails.location,
          existingAssets
        },
        brandContext: brandContext ? {
          brandName: brandContext.brandName,
          archetype: brandContext.archetype,
          industry: brandContext.industry,
          targetAudience: brandContext.targetAudience,
          moodKeywords: brandContext.moodKeywords,
          colorPalette: brandContext.colorPalette?.map(c => c.hex),
          tagline: brandContext.tagline
        } : undefined
      }
    });

    if (error) throw error;

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to get recommendations',
        code: data?.code
      };
    }

    return {
      success: true,
      recommendations: data.recommendations,
      overallStrategy: data.overallStrategy
    };
  } catch (error) {
    console.error('Asset recommendation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations'
    };
  }
};

/**
 * Get AI-powered design variations for an asset
 */
export const getDesignVariations = async (
  eventDetails: EventDetails,
  assetType: string,
  currentDesignDescription?: string,
  brandContext?: BrandContext | null
): Promise<DesignVariationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('suggest-creative', {
      body: {
        type: 'design_variations',
        eventContext: {
          name: eventDetails.name,
          description: eventDetails.description,
          eventType: eventDetails.eventType,
          date: eventDetails.date,
          location: eventDetails.location
        },
        currentAssetType: assetType,
        currentDesignDescription,
        brandContext: brandContext ? {
          brandName: brandContext.brandName,
          archetype: brandContext.archetype,
          industry: brandContext.industry,
          targetAudience: brandContext.targetAudience,
          moodKeywords: brandContext.moodKeywords,
          colorPalette: brandContext.colorPalette?.map(c => c.hex),
          tagline: brandContext.tagline
        } : undefined
      }
    });

    if (error) throw error;

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || 'Failed to get variations',
        code: data?.code
      };
    }

    return {
      success: true,
      variations: data.variations
    };
  } catch (error) {
    console.error('Design variation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get variations'
    };
  }
};

/**
 * Priority badge styling helper
 */
export const getPriorityBadgeStyles = (priority: AssetRecommendation['priority']): {
  className: string;
  label: string;
} => {
  switch (priority) {
    case 'essential':
      return { 
        className: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
        label: 'Essential'
      };
    case 'recommended':
      return { 
        className: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
        label: 'Recommended'
      };
    case 'nice_to_have':
      return { 
        className: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
        label: 'Nice to Have'
      };
    default:
      return { 
        className: 'bg-muted text-muted-foreground border-border',
        label: priority
      };
  }
};

/**
 * Convert asset type string to display name
 */
export const formatAssetTypeName = (assetType: string): string => {
  return assetType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};
