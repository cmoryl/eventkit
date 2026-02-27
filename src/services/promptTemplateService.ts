// Prompt Template Service
// Fetches templates from database and merges with event data for cohesive asset generation

import { supabase } from '@/integrations/supabase/client';
import type { EventDetails, ColorInfo } from '../types';
import { AssetType } from '../types';
import type { BrandContext } from '../types/brand.types';
import { buildBrandStylePrompt, getBrandColorPalette } from '../types/brand.types';
import { buildSponsorWallPrompt } from './sponsorWallGenerator';

interface PromptTemplate {
  id: string;
  asset_type: string;
  template_name: string;
  prompt_template: string;
  variables: Record<string, string>[] | null;
  success_rate: number | null;
  usage_count: number | null;
}

interface TemplateVariables {
  eventName: string;
  eventDescription?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  mood?: string;
  style?: string;
  colors?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoDescription?: string;
  culturalContext?: string;
  venueType?: string;
  audienceType?: string;
  website?: string;
  tagline?: string;
  // Brand-specific variables
  brandName?: string;
  brandVoice?: string;
  brandArchetype?: string;
  imageryStyle?: string;
  patternStyle?: string;
  iconStyle?: string;
  industry?: string;
  targetAudience?: string;
  headingFont?: string;
  bodyFont?: string;
}

// Cache for templates to avoid repeated DB calls
const templateCache: Map<string, { template: PromptTemplate; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Convert AssetType enum to database asset_type string format
 */
export function assetTypeToDbFormat(assetType: AssetType): string {
  // The enum values like 'SOCIAL_POST' should match the database format
  return assetType.toString();
}

/**
 * Fetch the best prompt template for a given asset type
 * Prioritizes by success_rate, then usage_count
 */
export async function fetchPromptTemplate(assetType: AssetType): Promise<PromptTemplate | null> {
  const dbAssetType = assetTypeToDbFormat(assetType);
  
  // Check cache first
  const cached = templateCache.get(dbAssetType);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.template;
  }

  try {
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('asset_type', dbAssetType)
      .order('success_rate', { ascending: false, nullsFirst: false })
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(1)
      .single();

    if (error) {
      // Try fallback without single() in case there are no templates
      const { data: fallbackData } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('asset_type', dbAssetType)
        .limit(1);
      
      if (fallbackData && fallbackData.length > 0) {
        const template = fallbackData[0] as PromptTemplate;
        templateCache.set(dbAssetType, { template, timestamp: Date.now() });
        return template;
      }
      
      console.warn(`No prompt template found for asset type: ${dbAssetType}`);
      return null;
    }

    const template = data as PromptTemplate;
    templateCache.set(dbAssetType, { template, timestamp: Date.now() });
    return template;
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    return null;
  }
}

/**
 * Build template variables from event details, color palette, and brand context
 */
export function buildTemplateVariables(
  eventDetails: EventDetails,
  colorPalette: ColorInfo[] = [],
  styleDescription?: string,
  culturalContext?: string,
  brandContext?: BrandContext | null
): TemplateVariables {
  // Use brand colors if available, otherwise fall back to event palette
  const brandColors = brandContext ? getBrandColorPalette(brandContext) : [];
  const effectivePalette = brandColors.length > 0 
    ? brandColors 
    : colorPalette.map(c => c.hex);
  
  const colors = brandContext?.colorPalette.map(c => c.name || c.hex).join(', ') 
    || colorPalette.map(c => c.name || c.hex).join(', ');
  const primaryColor = brandContext?.primaryColor || colorPalette[0]?.name || colorPalette[0]?.hex || '';
  const secondaryColor = brandContext?.secondaryColor || colorPalette[1]?.name || colorPalette[1]?.hex || '';
  const accentColor = brandContext?.accentColor || colorPalette[2]?.name || colorPalette[2]?.hex || '';

  // Build enhanced style description incorporating brand context
  // Use adherence mode from brand context (defaults to 'inspired' for flexibility)
  const brandStylePrompt = buildBrandStylePrompt(brandContext, brandContext?.adherenceMode || 'inspired');
  const enhancedStyle = brandStylePrompt 
    ? `${styleDescription || 'professional and modern'}. ${brandStylePrompt}`
    : styleDescription || 'professional and modern';

  return {
    eventName: eventDetails.name || 'Event',
    eventDescription: eventDetails.description || '',
    eventDate: eventDetails.date || '',
    eventLocation: eventDetails.location || '',
    eventType: eventDetails.eventType || 'conference',
    mood: enhancedStyle,
    style: enhancedStyle,
    colors,
    primaryColor,
    secondaryColor,
    accentColor,
    logoDescription: '', // Could be extracted from logo analysis
    culturalContext: brandContext?.culturalContext || culturalContext || eventDetails.venueIntelligence?.culturalContext || '',
    venueType: eventDetails.venueIntelligence?.venueType || '',
    audienceType: brandContext?.targetAudience || 'professionals',
    website: eventDetails.website || '',
    tagline: brandContext?.tagline || eventDetails.hashtag || '',
    // Brand-specific variables
    brandName: brandContext?.brandName,
    brandVoice: brandContext?.brandVoice?.join(', '),
    brandArchetype: brandContext?.archetype,
    imageryStyle: brandContext?.imageryStyle,
    patternStyle: brandContext?.patternStyle,
    iconStyle: brandContext?.iconStyle,
    industry: brandContext?.industry,
    targetAudience: brandContext?.targetAudience,
    headingFont: brandContext?.headingFont,
    bodyFont: brandContext?.bodyFont,
  };
}

/**
 * Replace template variables with actual values
 * Supports {{variableName}} syntax
 */
export function mergeTemplateWithVariables(
  template: string,
  variables: TemplateVariables
): string {
  let merged = template;
  
  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    merged = merged.replace(pattern, value || '');
  }
  
  // Clean up any remaining unreplaced variables
  merged = merged.replace(/\{\{[^}]+\}\}/g, '');
  
  // Clean up extra whitespace
  merged = merged.replace(/\s+/g, ' ').trim();
  
  return merged;
}

/**
 * Build the complete prompt for an asset type by fetching template and merging with event data
 */
export async function buildAssetPrompt(
  assetType: AssetType,
  eventDetails: EventDetails,
  colorPalette: ColorInfo[] = [],
  styleDescription?: string,
  culturalContext?: string,
  additionalContext?: string,
  brandContext?: BrandContext | null
): Promise<string> {
  // Fetch the template from database
  const template = await fetchPromptTemplate(assetType);
  
  // Build variables with brand context
  const variables = buildTemplateVariables(
    eventDetails,
    colorPalette,
    styleDescription,
    culturalContext,
    brandContext
  );
  
  let prompt: string;
  
  if (template) {
    // Merge template with variables
    prompt = mergeTemplateWithVariables(template.prompt_template, variables);
    
    // Track usage (fire and forget)
    incrementTemplateUsage(template.id);
  } else {
    // Fallback to a generic prompt if no template exists
    prompt = buildFallbackPrompt(assetType, variables, brandContext);
  }
  
  // Append brand context as additional guidance (respect adherence mode)
  if (brandContext) {
    const brandPrompt = buildBrandStylePrompt(brandContext, brandContext.adherenceMode || 'inspired');
    if (brandPrompt) {
      prompt += ` Brand Guidelines: ${brandPrompt}`;
    }
  }
  
  // Append additional context if provided
  if (additionalContext) {
    prompt += ` ${additionalContext}`;
  }
  
  return prompt;
}

/**
 * Increment the usage count for a template
 */
async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    // Use RPC or raw update to increment
    const { error } = await supabase
      .from('prompt_templates')
      .update({ 
        usage_count: supabase.rpc ? undefined : 1, // Will be handled by trigger or manual increment
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);
    
    if (error) {
      console.warn('Failed to increment template usage:', error);
    }
  } catch (e) {
    // Silent fail - usage tracking is not critical
  }
}

/**
 * Build a fallback prompt when no template exists
 * Uses Master Wrapper structure from the Interactive Prompt Bible
 */
function buildFallbackPrompt(assetType: AssetType, variables: TemplateVariables, brandContext?: BrandContext | null): string {
  const assetName = assetType.toString().replace(/_/g, ' ').toLowerCase();
  
  // Special handling for sponsor assets
  if (assetType === AssetType.SponsorWall || 
      assetType === AssetType.SponsorBanner || 
      assetType === AssetType.SponsorGrid) {
    const sponsorAssetType = assetType === AssetType.SponsorWall ? 'wall' 
      : assetType === AssetType.SponsorBanner ? 'banner' 
      : 'grid';
    
    return buildSponsorWallPrompt(
      variables.eventName,
      brandContext?.sponsorLogos,
      variables.style || variables.mood || 'professional corporate design',
      sponsorAssetType
    );
  }
  
  return `[TEMPLATE_SKELETON]
Template Name: ${assetName}
Category / Asset Type: ${assetType}

Create a professional ${assetName} design for "${variables.eventName}". 
${variables.eventDescription ? `Event description: ${variables.eventDescription}.` : ''}
${variables.eventLocation ? `Location: ${variables.eventLocation}.` : ''}
${variables.eventDate ? `Date: ${variables.eventDate}.` : ''}
Style: ${variables.mood}. 
${variables.colors ? `Use these colors: ${variables.colors}.` : ''}
Create a cohesive, professional design that reflects the event's brand identity.
Ensure the design passes the 3-second scan test for immediate comprehension.`;
}

/**
 * Clear the template cache (useful after seeding new templates)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

/**
 * Prefetch templates for multiple asset types
 */
export async function prefetchTemplates(assetTypes: AssetType[]): Promise<void> {
  const promises = assetTypes.map(type => fetchPromptTemplate(type));
  await Promise.all(promises);
}

/**
 * Check if an asset type is a sponsor-related asset
 */
export function isSponsorAsset(assetType: AssetType): boolean {
  return [
    AssetType.SponsorWall,
    AssetType.SponsorBanner,
    AssetType.SponsorGrid,
  ].includes(assetType);
}
