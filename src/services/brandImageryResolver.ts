/**
 * Brand Imagery Resolver
 * Fetches BrandHub photography & pattern URLs and converts them to base64
 * for use as visual references during asset generation.
 */

import type { BrandContext } from '@/types/brand.types';

interface ResolvedBrandImagery {
  /** Brand photography converted to base64 for visual style reference */
  photographyRefs: string[];
  /** Brand pattern images converted to base64 for pattern reference */
  patternRefs: string[];
  /** Brand icon images converted to base64 for icon style reference */
  brandIconRefs: string[];
  /** Master visual direction generated from brand analysis */
  masterDirection?: string;
}

// Cache resolved imagery per brand to avoid re-fetching in the same session
const imageryCache = new Map<string, ResolvedBrandImagery>();

/**
 * Convert a URL to a base64 data URI by fetching it
 */
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to convert URL to base64:', url, e);
    return null;
  }
}

/**
 * Resolve brand imagery from BrandContext URLs to base64 data URIs.
 * Fetches photography and pattern images from BrandHub and converts them
 * for direct use as AI visual references.
 * 
 * @param brandContext - The brand context with allImagery URLs
 * @param maxPhotos - Max photography refs to fetch (default 3)
 * @param maxPatterns - Max pattern refs to fetch (default 2)
 */
export async function resolveBrandImagery(
  brandContext: BrandContext | null | undefined,
  maxPhotos = 3,
  maxPatterns = 2,
  maxIcons = 2
): Promise<ResolvedBrandImagery> {
  const empty: ResolvedBrandImagery = { photographyRefs: [], patternRefs: [], brandIconRefs: [] };
  if (!brandContext?.allImagery) return empty;

  // Check cache
  const cacheKey = brandContext.brandName || 'default';
  const cached = imageryCache.get(cacheKey);
  if (cached) {
    console.log(`Using cached brand imagery for "${cacheKey}" (${cached.photographyRefs.length} photos, ${cached.patternRefs.length} patterns, ${cached.brandIconRefs.length} icons)`);
    return cached;
  }

  const imagery = brandContext.allImagery;

  // Collect photography URLs (prioritize photography, then hero images)
  const photoUrls: string[] = [
    ...(imagery.byType?.photography || []),
    ...(imagery.byType?.heroImages || []),
  ].slice(0, maxPhotos);

  // Collect pattern URLs
  const patternUrls: string[] = [
    ...(imagery.byType?.patterns || []),
  ].slice(0, maxPatterns);

  // Collect brand icon URLs
  const iconUrls: string[] = [
    ...(imagery.byType?.brandIcons || []),
  ].slice(0, maxIcons);

  console.log(`Resolving brand imagery: ${photoUrls.length} photos, ${patternUrls.length} patterns, ${iconUrls.length} icons for "${cacheKey}"`);

  // Fetch all in parallel
  const [photoResults, patternResults, iconResults] = await Promise.all([
    Promise.all(photoUrls.map(urlToBase64)),
    Promise.all(patternUrls.map(urlToBase64)),
    Promise.all(iconUrls.map(urlToBase64)),
  ]);

  const result: ResolvedBrandImagery = {
    photographyRefs: photoResults.filter((r): r is string => r !== null),
    patternRefs: patternResults.filter((r): r is string => r !== null),
    brandIconRefs: iconResults.filter((r): r is string => r !== null),
  };

  console.log(`Resolved: ${result.photographyRefs.length} photos, ${result.patternRefs.length} patterns, ${result.brandIconRefs.length} icons`);

  // Cache for session
  imageryCache.set(cacheKey, result);

  return result;
}

/**
 * Clear the imagery cache (e.g., when switching brands)
 */
export function clearBrandImageryCache(): void {
  imageryCache.clear();
}
