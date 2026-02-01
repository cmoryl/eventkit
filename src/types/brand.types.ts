// Brand Intelligence Types for Asset Generation
// Used to pass comprehensive brand context through the generation pipeline

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
  };
}): BrandContext | null {
  if (!brand) return null;
  
  const styles = brand.styles;
  const customPrompts = styles?.custom_prompts || {};
  
  return {
    brandName: brand.name,
    tagline: customPrompts.tagline as string | undefined,
    mission: customPrompts.mission as string | undefined,
    archetype: customPrompts.archetype as string | undefined,
    
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
    
    targetAudience: styles?.target_audience,
    culturalContext: styles?.cultural_context,
    industry: styles?.industry,
    
    printColorMode: styles?.print_color_mode,
    
    logoUrl: brand.logo_url,
    logoMonochromeUrl: brand.logo_monochrome_url,
    logoReversedUrl: brand.logo_reversed_url,
    
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
  
  // Visual mood
  if (context.moodKeywords && context.moodKeywords.length > 0) {
    parts.push(`Visual mood: ${context.moodKeywords.join(', ')}.`);
  }
  
  // Imagery style
  if (context.imageryStyle) {
    parts.push(`Imagery style: ${context.imageryStyle}.`);
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
  
  // Cultural context
  if (context.culturalContext) {
    parts.push(`Cultural context: ${context.culturalContext}.`);
  }
  
  // Tagline for inspiration
  if (context.tagline) {
    parts.push(`Brand tagline for inspiration: "${context.tagline}".`);
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
