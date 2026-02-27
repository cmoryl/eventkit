/**
 * Brand Context Loader
 * Fetches full brand styles from the database and builds a complete BrandContext
 * for use during asset generation. Unlike useActiveBrand (which loads simplified styles
 * for UI theming), this loads ALL fields including all_imagery, photography rules, etc.
 */

import { supabase } from '@/integrations/supabase/client';
import { buildBrandContext, type BrandContext, type BrandAdherenceMode } from '@/types/brand.types';

/**
 * Load full BrandContext for a given brand ID.
 * Fetches the complete brand_styles record (including all_imagery, photography_dos, etc.)
 * and builds a BrandContext ready for the generation pipeline.
 */
export async function loadFullBrandContext(
  brandId: string,
  adherenceMode: BrandAdherenceMode = 'inspired'
): Promise<BrandContext | null> {
  try {
    // Fetch brand with full styles in parallel
    const [brandResult, stylesResult] = await Promise.all([
      supabase.from('brands').select('*').eq('id', brandId).maybeSingle(),
      supabase.from('brand_styles').select('*').eq('brand_id', brandId).maybeSingle(),
    ]);

    if (brandResult.error || !brandResult.data) {
      console.warn('Failed to load brand:', brandResult.error);
      return null;
    }

    const brand = brandResult.data;
    const styles = stylesResult.data;

    // Build full BrandContext using the existing builder
    return buildBrandContext({
      name: brand.name,
      logo_url: brand.logo_url ?? undefined,
      logo_monochrome_url: brand.logo_monochrome_url ?? undefined,
      logo_reversed_url: brand.logo_reversed_url ?? undefined,
      styles: styles ? {
        primary_color: styles.primary_color ?? undefined,
        secondary_color: styles.secondary_color ?? undefined,
        accent_color: styles.accent_color ?? undefined,
        color_palette: Array.isArray(styles.color_palette)
          ? styles.color_palette as Array<{ hex: string; name?: string; cmyk?: string; pantone?: string; usage?: string }>
          : [],
        heading_font: styles.heading_font ?? undefined,
        body_font: styles.body_font ?? undefined,
        accent_font: styles.accent_font ?? undefined,
        typography_scale: styles.typography_scale as Record<string, unknown> | undefined,
        brand_voice: styles.brand_voice ?? [],
        tone_keywords: styles.tone_keywords ?? [],
        writing_style: styles.writing_style ?? undefined,
        mood_keywords: styles.mood_keywords ?? [],
        imagery_style: styles.imagery_style ?? undefined,
        pattern_style: styles.pattern_style ?? undefined,
        icon_style: styles.icon_style ?? undefined,
        photography_style: styles.photography_style ?? undefined,
        photography_dos: styles.photography_dos ?? [],
        photography_donts: styles.photography_donts ?? [],
        logo_clear_space: styles.logo_clear_space ?? undefined,
        logo_min_size: styles.logo_min_size ?? undefined,
        logo_placement_rules: styles.logo_placement_rules ?? [],
        logo_backgrounds: styles.logo_backgrounds ?? [],
        social_handles: styles.social_handles as Record<string, string> | undefined,
        hashtags: styles.hashtags ?? [],
        tagline: styles.tagline ?? undefined,
        mission: styles.mission ?? undefined,
        archetype: styles.archetype ?? undefined,
        approved_layouts: styles.approved_layouts ?? [],
        restricted_elements: styles.restricted_elements ?? [],
        target_audience: styles.target_audience ?? undefined,
        cultural_context: styles.cultural_context ?? undefined,
        industry: styles.industry ?? undefined,
        print_color_mode: styles.print_color_mode as 'CMYK' | 'RGB' | 'Pantone' | undefined,
        custom_prompts: styles.custom_prompts as Record<string, unknown> | undefined,
        // Full imagery library from BrandHub
        all_imagery: styles.all_imagery as {
          all?: string[];
          byType?: {
            logos?: string[];
            brandIcons?: string[];
            patterns?: string[];
            photography?: string[];
            heroImages?: string[];
            collateral?: string[];
            social?: string[];
            banners?: string[];
            video?: string[];
            sponsors?: string[];
          };
        } | undefined,
      } : undefined,
    }, adherenceMode);
  } catch (error) {
    console.error('Failed to load full brand context:', error);
    return null;
  }
}
