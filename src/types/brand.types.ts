// Brand Intelligence Types for Asset Generation
// Used to pass comprehensive brand context through the generation pipeline

// Sponsor Logo with tier classification
export interface SponsorLogo {
  id: string;
  name: string;
  url: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner' | 'media';
  websiteUrl?: string;
  placement?: string;
}

// Imagery organized by type from BrandHub
export interface BrandImageryLibrary {
  all: string[];
  byType: {
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
}

// Sponsor logos organized by tier
export interface SponsorLogosLibrary {
  all: SponsorLogo[];
  allLogoUrls: string[];
  byTier: {
    platinum: SponsorLogo[];
    gold: SponsorLogo[];
    silver: SponsorLogo[];
    bronze: SponsorLogo[];
    partner: SponsorLogo[];
    media: SponsorLogo[];
  };
}

export interface BrandContext {
  // Core Identity
  brandName?: string;
  tagline?: string;
  mission?: string;
  archetype?: string;
  
  // Color System
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  colorPalette: BrandColor[];
  approvedColorCombinations?: ColorCombination[];
  gradients?: BrandGradient[];
  
  // Typography
  headingFont?: string;
  bodyFont?: string;
  accentFont?: string;
  typographyScale?: Record<string, unknown>;
  
  // Voice & Tone
  brandVoice: string[];
  toneKeywords: string[];
  writingStyle?: string;
  
  // Visual Style
  moodKeywords: string[];
  imageryStyle?: string;
  patternStyle?: string;
  iconStyle?: string;
  
  // Photography Guidelines
  photographyStyle?: string;
  photographyDos?: string[];
  photographyDonts?: string[];
  
  // Logo Usage Rules
  logoClearSpace?: string;
  logoMinSize?: string;
  logoPlacementRules?: string[];
  logoBackgrounds?: string[];
  
  // Social Media
  socialHandles?: Record<string, string>;
  hashtags?: string[];
  
  // Layout & Restrictions
  approvedLayouts?: string[];
  restrictedElements?: string[];
  
  // Cultural & Audience
  targetAudience?: string;
  culturalContext?: string;
  industry?: string;
  
  // Print Production
  printColorMode?: 'CMYK' | 'RGB' | 'Pantone';
  
  // Logo Assets
  logoUrl?: string;
  logoMonochromeUrl?: string;
  logoReversedUrl?: string;
  
  // All Imagery Library from BrandHub
  allImagery?: BrandImageryLibrary;
  
  // Sponsor Logos Library
  sponsorLogos?: SponsorLogosLibrary;
  
  // AI Generation Context
  customPrompts?: Record<string, unknown>;
}

export interface BrandColor {
  hex: string;
  name?: string;
  cmyk?: string;
  pantone?: string;
  rgb?: string;
  usage?: string;
}

export interface ColorCombination {
  name: string;
  colors: string[];
  status: 'approved' | 'rejected' | 'pending';
}

export interface BrandGradient {
  name: string;
  colors: string[];
  direction?: string;
}

/**
 * Convert BrandStyle from database/studio types to BrandContext for generation
 */
export function buildBrandContext(brand: {
  name?: string;
  logo_url?: string;
  logo_monochrome_url?: string;
  logo_reversed_url?: string;
  styles?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    color_palette?: Array<{ hex: string; name?: string; cmyk?: string; pantone?: string; usage?: string }>;
    heading_font?: string;
    body_font?: string;
    accent_font?: string;
    typography_scale?: Record<string, unknown>;
    brand_voice?: string[];
    tone_keywords?: string[];
    writing_style?: string;
    mood_keywords?: string[];
    imagery_style?: string;
    pattern_style?: string;
    icon_style?: string;
    target_audience?: string;
    cultural_context?: string;
    industry?: string;
    print_color_mode?: 'CMYK' | 'RGB' | 'Pantone';
    custom_prompts?: Record<string, unknown>;
    // Comprehensive fields
    photography_style?: string;
    photography_dos?: string[];
    photography_donts?: string[];
    logo_clear_space?: string;
    logo_min_size?: string;
    logo_placement_rules?: string[];
    logo_backgrounds?: string[];
    social_handles?: Record<string, string>;
    hashtags?: string[];
    tagline?: string;
    mission?: string;
    archetype?: string;
    approved_layouts?: string[];
    restricted_elements?: string[];
    // All imagery library
    all_imagery?: {
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
    };
    // Sponsor logos library
    sponsor_logos?: {
      all?: SponsorLogo[];
      allLogoUrls?: string[];
      byTier?: {
        platinum?: SponsorLogo[];
        gold?: SponsorLogo[];
        silver?: SponsorLogo[];
        bronze?: SponsorLogo[];
        partner?: SponsorLogo[];
        media?: SponsorLogo[];
      };
    };
  };
}): BrandContext | null {
  if (!brand) return null;
  
  const styles = brand.styles;
  const customPrompts = styles?.custom_prompts || {};
  
  return {
    brandName: brand.name,
    // Identity - prefer direct fields, fallback to custom_prompts for legacy
    tagline: styles?.tagline || (customPrompts.tagline as string | undefined),
    mission: styles?.mission || (customPrompts.mission as string | undefined),
    archetype: styles?.archetype || (customPrompts.archetype as string | undefined),
    
    primaryColor: styles?.primary_color,
    secondaryColor: styles?.secondary_color,
    accentColor: styles?.accent_color,
    colorPalette: (styles?.color_palette || []).map(c => ({
      hex: c.hex,
      name: c.name,
      cmyk: c.cmyk,
      pantone: c.pantone,
      usage: c.usage,
    })),
    approvedColorCombinations: customPrompts.approvedColorCombinations as ColorCombination[] | undefined,
    gradients: customPrompts.gradients as BrandGradient[] | undefined,
    
    headingFont: styles?.heading_font,
    bodyFont: styles?.body_font,
    accentFont: styles?.accent_font,
    typographyScale: styles?.typography_scale,
    
    brandVoice: styles?.brand_voice || [],
    toneKeywords: styles?.tone_keywords || [],
    writingStyle: styles?.writing_style,
    
    moodKeywords: styles?.mood_keywords || [],
    imageryStyle: styles?.imagery_style,
    patternStyle: styles?.pattern_style,
    iconStyle: styles?.icon_style,
    
    // Photography guidelines
    photographyStyle: styles?.photography_style,
    photographyDos: styles?.photography_dos || [],
    photographyDonts: styles?.photography_donts || [],
    
    // Logo usage rules
    logoClearSpace: styles?.logo_clear_space,
    logoMinSize: styles?.logo_min_size,
    logoPlacementRules: styles?.logo_placement_rules || [],
    logoBackgrounds: styles?.logo_backgrounds || [],
    
    // Social media
    socialHandles: styles?.social_handles,
    hashtags: styles?.hashtags || [],
    
    // Layout & restrictions
    approvedLayouts: styles?.approved_layouts || [],
    restrictedElements: styles?.restricted_elements || [],
    
    targetAudience: styles?.target_audience,
    culturalContext: styles?.cultural_context,
    industry: styles?.industry,
    
    printColorMode: styles?.print_color_mode,
    
    logoUrl: brand.logo_url,
    logoMonochromeUrl: brand.logo_monochrome_url,
    logoReversedUrl: brand.logo_reversed_url,
    
    // All imagery library from BrandHub
    allImagery: styles?.all_imagery ? {
      all: styles.all_imagery.all || [],
      byType: {
        ...styles.all_imagery.byType,
        // Include sponsor logos in imagery types
        sponsors: styles.sponsor_logos?.allLogoUrls || styles.all_imagery.byType?.sponsors || []
      }
    } : undefined,
    
    // Sponsor logos library
    sponsorLogos: styles?.sponsor_logos ? {
      all: styles.sponsor_logos.all || [],
      allLogoUrls: styles.sponsor_logos.allLogoUrls || [],
      byTier: {
        platinum: styles.sponsor_logos.byTier?.platinum || [],
        gold: styles.sponsor_logos.byTier?.gold || [],
        silver: styles.sponsor_logos.byTier?.silver || [],
        bronze: styles.sponsor_logos.byTier?.bronze || [],
        partner: styles.sponsor_logos.byTier?.partner || [],
        media: styles.sponsor_logos.byTier?.media || [],
      }
    } : undefined,
    
    customPrompts: customPrompts,
  };
}

/**
 * Build a style description prompt from brand context
 * Used to inject brand personality into generation prompts
 */
export function buildBrandStylePrompt(context: BrandContext | null): string {
  if (!context) return '';
  
  const parts: string[] = [];
  
  // Brand identity
  if (context.archetype) {
    parts.push(`Brand archetype: ${context.archetype}.`);
  }
  
  // Mission for context
  if (context.mission) {
    parts.push(`Brand mission: ${context.mission}.`);
  }
  
  // Visual mood
  if (context.moodKeywords && context.moodKeywords.length > 0) {
    parts.push(`Visual mood: ${context.moodKeywords.join(', ')}.`);
  }
  
  // Imagery style
  if (context.imageryStyle) {
    parts.push(`Imagery style: ${context.imageryStyle}.`);
  }
  
  // Photography guidelines
  if (context.photographyStyle) {
    parts.push(`Photography style: ${context.photographyStyle}.`);
  }
  if (context.photographyDos && context.photographyDos.length > 0) {
    parts.push(`Photography DO: ${context.photographyDos.join('; ')}.`);
  }
  if (context.photographyDonts && context.photographyDonts.length > 0) {
    parts.push(`Photography DON'T: ${context.photographyDonts.join('; ')}.`);
  }
  
  // Typography guidance
  if (context.headingFont || context.bodyFont) {
    const fonts = [context.headingFont, context.bodyFont].filter(Boolean);
    parts.push(`Typography: Use ${fonts.join(' and ')} font styles.`);
  }
  
  // Pattern/Icon style
  if (context.patternStyle) {
    parts.push(`Pattern style: ${context.patternStyle}.`);
  }
  if (context.iconStyle) {
    parts.push(`Icon style: ${context.iconStyle}.`);
  }
  
  // Logo placement rules
  if (context.logoPlacementRules && context.logoPlacementRules.length > 0) {
    parts.push(`Logo placement: ${context.logoPlacementRules.join('; ')}.`);
  }
  if (context.logoBackgrounds && context.logoBackgrounds.length > 0) {
    parts.push(`Approved logo backgrounds: ${context.logoBackgrounds.join(', ')}.`);
  }
  
  // Industry context
  if (context.industry) {
    parts.push(`Industry: ${context.industry}.`);
  }
  
  // Target audience
  if (context.targetAudience) {
    parts.push(`Target audience: ${context.targetAudience}.`);
  }
  
  // Brand voice (for text-heavy assets)
  if (context.brandVoice && context.brandVoice.length > 0) {
    parts.push(`Brand voice: ${context.brandVoice.join(', ')}.`);
  }
  
  // Tone
  if (context.toneKeywords && context.toneKeywords.length > 0) {
    parts.push(`Tone: ${context.toneKeywords.join(', ')}.`);
  }
  
  // Writing style
  if (context.writingStyle) {
    parts.push(`Writing style: ${context.writingStyle}.`);
  }
  
  // Cultural context
  if (context.culturalContext) {
    parts.push(`Cultural context: ${context.culturalContext}.`);
  }
  
  // Tagline for inspiration
  if (context.tagline) {
    parts.push(`Brand tagline for inspiration: "${context.tagline}".`);
  }
  
  // Restricted elements (what NOT to include)
  if (context.restrictedElements && context.restrictedElements.length > 0) {
    parts.push(`AVOID: ${context.restrictedElements.join(', ')}.`);
  }
  
  // Sponsor logos context (for assets that may include sponsors)
  if (context.sponsorLogos && context.sponsorLogos.all.length > 0) {
    const sponsorCount = context.sponsorLogos.all.length;
    const tierCounts = Object.entries(context.sponsorLogos.byTier)
      .filter(([_, sponsors]) => sponsors.length > 0)
      .map(([tier, sponsors]) => `${sponsors.length} ${tier}`)
      .join(', ');
    parts.push(`Event sponsors: ${sponsorCount} sponsors (${tierCounts}). Consider sponsor placement and visibility appropriate to tier.`);
    
    // Include top-tier sponsor names for recognition
    const platinumSponsors = context.sponsorLogos.byTier.platinum.map(s => s.name);
    const goldSponsors = context.sponsorLogos.byTier.gold.map(s => s.name);
    if (platinumSponsors.length > 0) {
      parts.push(`Platinum sponsors: ${platinumSponsors.join(', ')}.`);
    }
    if (goldSponsors.length > 0) {
      parts.push(`Gold sponsors: ${goldSponsors.join(', ')}.`);
    }
  }
  
  return parts.join(' ');
}

/**
 * Get approved color palette from brand context
 * Returns hex values for direct use in generation
 */
export function getBrandColorPalette(context: BrandContext | null): string[] {
  if (!context) return [];
  
  const colors: string[] = [];
  
  // Add primary colors first
  if (context.primaryColor) colors.push(context.primaryColor);
  if (context.secondaryColor) colors.push(context.secondaryColor);
  if (context.accentColor) colors.push(context.accentColor);
  
  // Add palette colors
  context.colorPalette.forEach(c => {
    if (c.hex && !colors.includes(c.hex)) {
      colors.push(c.hex);
    }
  });
  
  return colors;
}

/**
 * Get all sponsor logo URLs from brand context
 * Used for AI training and brand recognition
 */
export function getSponsorLogoUrls(context: BrandContext | null): string[] {
  if (!context?.sponsorLogos) return [];
  return context.sponsorLogos.allLogoUrls || [];
}

/**
 * Get all brand imagery URLs including sponsor logos
 * Consolidated list for AI analysis and learning
 */
export function getAllBrandImagery(context: BrandContext | null): {
  all: string[];
  byCategory: Record<string, string[]>;
} {
  if (!context) return { all: [], byCategory: {} };
  
  const byCategory: Record<string, string[]> = {};
  const all: string[] = [];
  
  // Add main logos
  if (context.logoUrl) {
    byCategory.primaryLogos = byCategory.primaryLogos || [];
    byCategory.primaryLogos.push(context.logoUrl);
    all.push(context.logoUrl);
  }
  if (context.logoMonochromeUrl) {
    byCategory.primaryLogos = byCategory.primaryLogos || [];
    byCategory.primaryLogos.push(context.logoMonochromeUrl);
    all.push(context.logoMonochromeUrl);
  }
  if (context.logoReversedUrl) {
    byCategory.primaryLogos = byCategory.primaryLogos || [];
    byCategory.primaryLogos.push(context.logoReversedUrl);
    all.push(context.logoReversedUrl);
  }
  
  // Add all imagery by type
  if (context.allImagery?.byType) {
    for (const [type, urls] of Object.entries(context.allImagery.byType)) {
      if (urls && urls.length > 0) {
        byCategory[type] = urls;
        all.push(...urls);
      }
    }
  }
  
  // Add sponsor logos
  if (context.sponsorLogos?.allLogoUrls) {
    byCategory.sponsors = context.sponsorLogos.allLogoUrls;
    all.push(...context.sponsorLogos.allLogoUrls);
  }
  
  return { all: [...new Set(all)], byCategory };
}

/**
 * Get sponsor information by tier for AI context
 */
export function getSponsorsByTier(context: BrandContext | null, tier: SponsorLogo['tier']): SponsorLogo[] {
  if (!context?.sponsorLogos?.byTier) return [];
  return context.sponsorLogos.byTier[tier] || [];
}
