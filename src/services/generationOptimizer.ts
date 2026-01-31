// Generation Optimizer - Caching & Unified AI Calls
// Optimizes AI usage by caching analysis results and batching requests

import type { ImageAnalysis, ColorInfo } from '../types';

// In-memory cache for image analysis results (per session)
const analysisCache = new Map<string, {
  analysis: ImageAnalysis;
  timestamp: number;
}>();

// In-memory cache for palette results (per session)
const paletteCache = new Map<string, {
  palette: ColorInfo[];
  timestamp: number;
}>();

// Cache TTL: 30 minutes (analysis shouldn't change for same image)
const CACHE_TTL_MS = 30 * 60 * 1000;

// Generate a cache key from image data (hash first 1000 chars for speed)
const generateCacheKey = (imageBase64: string, suffix: string = ''): string => {
  const sample = imageBase64.slice(0, 1000);
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${hash}${suffix}`;
};

// Check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL_MS;
};

/**
 * Get cached analysis or null if not available
 */
export const getCachedAnalysis = (imageBase64: string): ImageAnalysis | null => {
  const key = generateCacheKey(imageBase64, '_analysis');
  const cached = analysisCache.get(key);
  
  if (cached && isCacheValid(cached.timestamp)) {
    console.log('Using cached image analysis');
    return cached.analysis;
  }
  
  // Clean up expired entry
  if (cached) {
    analysisCache.delete(key);
  }
  
  return null;
};

/**
 * Cache an analysis result
 */
export const cacheAnalysis = (imageBase64: string, analysis: ImageAnalysis): void => {
  const key = generateCacheKey(imageBase64, '_analysis');
  analysisCache.set(key, {
    analysis,
    timestamp: Date.now(),
  });
  console.log('Cached image analysis for future use');
};

/**
 * Get cached palette or null if not available
 */
export const getCachedPalette = (imageBase64: string): ColorInfo[] | null => {
  const key = generateCacheKey(imageBase64, '_palette');
  const cached = paletteCache.get(key);
  
  if (cached && isCacheValid(cached.timestamp)) {
    console.log('Using cached color palette');
    return cached.palette;
  }
  
  // Clean up expired entry
  if (cached) {
    paletteCache.delete(key);
  }
  
  return null;
};

/**
 * Cache a palette result
 */
export const cachePalette = (imageBase64: string, palette: ColorInfo[]): void => {
  const key = generateCacheKey(imageBase64, '_palette');
  paletteCache.set(key, {
    palette,
    timestamp: Date.now(),
  });
  console.log('Cached color palette for future use');
};

/**
 * Clear all caches (e.g., when starting a new project)
 */
export const clearGenerationCache = (): void => {
  analysisCache.clear();
  paletteCache.clear();
  console.log('Generation cache cleared');
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = (): { analysisCount: number; paletteCount: number } => {
  return {
    analysisCount: analysisCache.size,
    paletteCount: paletteCache.size,
  };
};

/**
 * Determine if we should skip separate analysis and let generation handle it inline
 * This is an optimization for when we're generating right after uploading an image
 */
export const shouldInlineAnalysis = (
  hasVibeImage: boolean,
  hasExistingAnalysis: boolean,
  assetCount: number
): boolean => {
  // If generating many assets, pre-analyze is better (analyze once, use many times)
  if (assetCount > 3) {
    return false;
  }
  
  // If we already have analysis, don't inline
  if (hasExistingAnalysis) {
    return false;
  }
  
  // For single asset generation with vibe image, inline is faster
  return hasVibeImage && assetCount <= 2;
};

/**
 * Batch generation optimizer - determines optimal request strategy
 */
export interface GenerationStrategy {
  shouldPreAnalyze: boolean;
  shouldBatchText: boolean;
  parallelImageCount: number;
  estimatedAICalls: number;
}

export const optimizeGenerationStrategy = (
  assetTypes: string[],
  hasVibeImage: boolean,
  hasLogo: boolean
): GenerationStrategy => {
  const imageAssets = assetTypes.filter(t => !['PALETTE', 'SLOGANS', 'MARKETING_COPY', 'RUN_OF_SHOW', 'STYLE_GUIDE', 'AGENDA_HIGHLIGHTS'].includes(t));
  const textAssets = assetTypes.filter(t => ['SLOGANS', 'MARKETING_COPY', 'RUN_OF_SHOW'].includes(t));
  
  // If we have many image assets and a vibe image, pre-analyze to avoid redundant work
  const shouldPreAnalyze = hasVibeImage && imageAssets.length > 2;
  
  // Text assets can be batched into fewer calls (though current API doesn't support it)
  const shouldBatchText = textAssets.length > 2;
  
  // Calculate optimal parallel image generation (avoid rate limits)
  const parallelImageCount = Math.min(3, imageAssets.length);
  
  // Estimate total AI calls
  let estimatedAICalls = 0;
  if (shouldPreAnalyze) estimatedAICalls += 1; // One analysis call
  estimatedAICalls += Math.ceil(imageAssets.length / parallelImageCount); // Image generations
  estimatedAICalls += textAssets.length; // Text generations (1 each for now)
  estimatedAICalls += assetTypes.includes('PALETTE') ? 1 : 0; // Palette
  
  return {
    shouldPreAnalyze,
    shouldBatchText,
    parallelImageCount,
    estimatedAICalls,
  };
};

/**
 * Priority queue for asset generation - generate most important first
 */
const ASSET_PRIORITY: Record<string, number> = {
  'PALETTE': 1, // Generate first - needed by others
  'SOCIAL_POST': 2,
  'SOCIAL_STORY': 2,
  'BANNER': 3,
  'EMAIL_HEADER': 3,
  'NAME_TAG': 4,
  'SLOGANS': 5,
  'MARKETING_COPY': 6,
  'RUN_OF_SHOW': 7,
  // Lower priority for complex/slow assets
  'STEP_AND_REPEAT': 10,
  'MAIN_STAGE_BACKDROP': 10,
};

export const prioritizeAssets = (assetTypes: string[]): string[] => {
  return [...assetTypes].sort((a, b) => {
    const priorityA = ASSET_PRIORITY[a] ?? 5;
    const priorityB = ASSET_PRIORITY[b] ?? 5;
    return priorityA - priorityB;
  });
};
