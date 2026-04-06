/**
 * Brand Context Loader
 * Fetches full brand styles from the database and builds a complete BrandContext
 * for use during asset generation. Unlike useActiveBrand (which loads simplified styles
 * for UI theming), this loads ALL fields including all_imagery, photography rules, etc.
 * 
 * Also enriches with AI knowledge entries (gradients, color combos, brand icons,
 * display specs, sponsor data) stored during BrandHub import.
 */

import { supabase } from '@/integrations/supabase/client';
import { buildBrandContext, type BrandContext, type BrandAdherenceMode, type ColorCombination, type BrandGradient } from '@/types/brand.types';

/**
 * Load full BrandContext for a given brand ID.
 * Fetches the complete brand_styles record (including all_imagery, photography_dos, etc.)
 * and enriches with AI knowledge entries from BrandHub imports.
 */
export async function loadFullBrandContext(
  brandId: string,
  adherenceMode: BrandAdherenceMode = 'inspired'
): Promise<BrandContext | null> {
  try {
    // Fetch brand, styles, and AI knowledge in parallel
    const [brandResult, stylesResult, knowledgeResult] = await Promise.all([
      supabase.from('brands').select('*').eq('id', brandId).maybeSingle(),
      supabase.from('brand_styles').select('*').eq('brand_id', brandId).maybeSingle(),
      supabase.from('ai_knowledge')
        .select('key, value, knowledge_type')
        .or(`key.like.%${brandId}%`)
        .eq('knowledge_type', 'brand_preference'),
    ]);

    if (brandResult.error || !brandResult.data) {
      console.warn('Failed to load brand:', brandResult.error);
      return null;
    }

    const brand = brandResult.data;
    const styles = stylesResult.data;
    const knowledge = knowledgeResult.data || [];

    // Extract enrichment data from knowledge base
    const enrichment = extractKnowledgeEnrichment(knowledge, brandId);

    // Build full BrandContext using the existing builder
    const context = buildBrandContext({
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

    // Enrich context with knowledge base data
    if (context && enrichment) {
      if (enrichment.gradients?.length) {
        context.gradients = enrichment.gradients;
      }
      if (enrichment.colorCombinations?.length) {
        context.approvedColorCombinations = enrichment.colorCombinations;
      }
      if (enrichment.brandIconUrls?.length && context.allImagery) {
        context.allImagery.byType.brandIcons = [
          ...(context.allImagery.byType.brandIcons || []),
          ...enrichment.brandIconUrls,
        ];
      }
      if (enrichment.displaySpecs) {
        context.customPrompts = {
          ...context.customPrompts,
          displayBannerSpecs: enrichment.displaySpecs,
        };
      }
    }

    return context;
  } catch (error) {
    console.error('Failed to load full brand context:', error);
    return null;
  }
}

/**
 * Extract enrichment data from AI knowledge entries
 */
function extractKnowledgeEnrichment(
  knowledge: Array<{ key: string; value: unknown; knowledge_type: string }>,
  brandId: string
) {
  const findEntry = (keySuffix: string) =>
    knowledge.find(k => k.key === `${keySuffix}_${brandId}`)?.value as Record<string, unknown> | undefined;

  const visuals = findEntry('brand_visuals');
  const colorCombos = findEntry('brand_color_combos');
  const displaySpecs = findEntry('brand_display_specs');

  const gradients: BrandGradient[] = [];
  if (visuals?.gradients && Array.isArray(visuals.gradients)) {
    (visuals.gradients as string[]).forEach((css, i) => {
      gradients.push({ name: `Gradient ${i + 1}`, colors: [], direction: css });
    });
  }

  const colorCombinations: ColorCombination[] = [];
  if (colorCombos?.approved && Array.isArray(colorCombos.approved)) {
    (colorCombos.approved as Array<{ name?: string; colors?: string[]; notes?: string }>).forEach(c => {
      colorCombinations.push({
        name: c.name || 'Approved combo',
        colors: c.colors || [],
        status: 'approved',
      });
    });
  }

  const brandIconUrls = visuals?.brandIconUrls as string[] | undefined;

  return {
    gradients: gradients.length > 0 ? gradients : undefined,
    colorCombinations: colorCombinations.length > 0 ? colorCombinations : undefined,
    brandIconUrls: brandIconUrls?.length ? brandIconUrls : undefined,
    displaySpecs: displaySpecs || undefined,
  };
}
