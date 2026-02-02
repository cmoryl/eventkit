// AI Learning Service
// Tracks generations, feedback, and learns from user interactions

import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert, Json } from '@/integrations/supabase/types';
import type { 
  AIFeedback, 
  AIKnowledge, 
  PromptTemplate,
  GenerationContext,
  LearnedInsight 
} from './types';

// ============ GENERATION TRACKING ============

export const recordGeneration = async (
  userId: string,
  context: GenerationContext & { projectId?: string },
  resultImageUrl: string,
  promptUsed: string,
  generationTimeMs: number
): Promise<string | null> => {
  const insertData: TablesInsert<'ai_generations'> = {
    user_id: userId,
    project_id: context.projectId || null,
    asset_type: context.assetType,
    prompt_used: promptUsed,
    style_description: context.styleDescription || null,
    color_palette: context.colorPalette || null,
    location: context.location || null,
    cultural_context: context.culturalContext || null,
    result_image_url: resultImageUrl || null,
    render_engine: context.renderEngine?.provider || 'lovable',
    generation_time_ms: generationTimeMs,
  };

  const { data, error } = await supabase
    .from('ai_generations')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    console.error('Error recording generation:', error);
    return null;
  }

  return data?.id || null;
};

// ============ FEEDBACK TRACKING ============

export const recordFeedback = async (
  generationId: string,
  userId: string,
  feedbackType: AIFeedback['feedbackType'],
  rating?: number,
  feedbackText?: string,
  editsMade?: Record<string, unknown>
): Promise<boolean> => {
  const insertData: TablesInsert<'ai_feedback'> = {
    generation_id: generationId,
    user_id: userId,
    feedback_type: feedbackType,
    rating: rating || null,
    feedback_text: feedbackText || null,
    edits_made: (editsMade as unknown as Json) || null,
  };

  const { error } = await supabase
    .from('ai_feedback')
    .insert(insertData);

  if (error) {
    console.error('Error recording feedback:', error);
    return false;
  }

  // Trigger learning update
  await updateKnowledgeFromFeedback(userId, generationId, feedbackType, rating);

  return true;
};

// ============ KNOWLEDGE BASE ============

export const getKnowledge = async (
  userId: string,
  knowledgeType?: string,
  category?: string
): Promise<AIKnowledge[]> => {
  let query = supabase
    .from('ai_knowledge')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('confidence_score', { ascending: false });

  if (knowledgeType) {
    query = query.eq('knowledge_type', knowledgeType);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching knowledge:', error);
    return [];
  }

  return (data || []).map(mapDbToKnowledge);
};

export const addOrUpdateKnowledge = async (
  userId: string,
  knowledgeType: AIKnowledge['knowledgeType'],
  category: string,
  key: string,
  value: Record<string, unknown>,
  incrementUsage = true
): Promise<boolean> => {
  // Check if knowledge already exists
  const { data: existing } = await supabase
    .from('ai_knowledge')
    .select('id, usage_count, success_rate')
    .eq('user_id', userId)
    .eq('knowledge_type', knowledgeType)
    .eq('key', key)
    .single();

  if (existing) {
    // Update existing
    const updates: Record<string, unknown> = { value };
    if (incrementUsage) {
      updates.usage_count = (existing.usage_count || 0) + 1;
    }

    const { error } = await supabase
      .from('ai_knowledge')
      .update(updates)
      .eq('id', existing.id);

    return !error;
  } else {
    // Insert new
    const insertData: TablesInsert<'ai_knowledge'> = {
      user_id: userId,
      knowledge_type: knowledgeType,
      category: category || null,
      key,
      value: value as unknown as Json,
      usage_count: 1,
      confidence_score: 0.5,
      success_rate: 0.5,
    };

    const { error } = await supabase
      .from('ai_knowledge')
      .insert(insertData);

    return !error;
  }
};

// ============ PROMPT TEMPLATES ============

export const getPromptTemplates = async (assetType?: string): Promise<PromptTemplate[]> => {
  let query = supabase
    .from('prompt_templates')
    .select('*')
    .order('success_rate', { ascending: false });

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching prompt templates:', error);
    return [];
  }

  return (data || []).map(mapDbToPromptTemplate);
};

export const getBestPromptTemplate = async (assetType: string): Promise<PromptTemplate | null> => {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('asset_type', assetType)
    .order('success_rate', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return mapDbToPromptTemplate(data);
};

export const buildPromptFromTemplate = (
  template: PromptTemplate,
  context: GenerationContext
): string => {
  let prompt = template.promptTemplate;

  const variables: Record<string, string> = {
    eventName: context.eventName,
    eventDescription: context.eventDescription || '',
    styleDescription: context.styleDescription || 'modern, professional',
    colorPalette: context.colorPalette?.join(', ') || 'vibrant colors',
    culturalContext: context.culturalContext || '',
    location: context.location || '',
    dimensions: context.dimensions ? `${context.dimensions.width}x${context.dimensions.height}` : '',
    aspectRatio: context.dimensions ? getAspectRatio(context.dimensions.width, context.dimensions.height) : '1:1',
  };

  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return prompt.trim();
};

// ============ LEARNING INSIGHTS ============

export const getLearnedInsights = async (
  userId: string,
  assetType?: string
): Promise<LearnedInsight[]> => {
  const knowledge = await getKnowledge(userId, undefined, assetType);
  
  return knowledge
    .filter(k => k.confidenceScore > 0.6)
    .map(k => ({
      type: k.knowledgeType.replace('_preference', '').replace('_pattern', '') as LearnedInsight['type'],
      key: k.key,
      value: JSON.stringify(k.value),
      confidence: k.confidenceScore,
      source: k.usageCount > 5 ? 'usage' : 'feedback' as LearnedInsight['source'],
    }));
};

export const applyLearnedInsights = (
  basePrompt: string,
  insights: LearnedInsight[]
): string => {
  let enhancedPrompt = basePrompt;

  // Apply high-confidence insights
  const styleInsights = insights.filter(i => i.type === 'style' && i.confidence > 0.7);
  const culturalInsights = insights.filter(i => i.type === 'cultural' && i.confidence > 0.6);

  if (styleInsights.length > 0) {
    const styleEnhancements = styleInsights.map(i => i.value).join('. ');
    enhancedPrompt += ` Style preferences: ${styleEnhancements}.`;
  }

  if (culturalInsights.length > 0) {
    const culturalEnhancements = culturalInsights.map(i => i.value).join('. ');
    enhancedPrompt += ` Cultural context: ${culturalEnhancements}.`;
  }

  return enhancedPrompt;
};

// ============ SPONSOR LOGO LEARNING ============

export const recordSponsorLogoAnalysis = async (
  userId: string,
  sponsorData: {
    id: string;
    name: string;
    tier: string;
    logoUrl: string;
    brandId?: string;
  },
  analysisResult?: {
    dominantColors?: string[];
    styleKeywords?: string[];
    industry?: string;
  }
): Promise<boolean> => {
  const key = `sponsor_${sponsorData.id}`;
  
  return await addOrUpdateKnowledge(
    userId,
    'sponsor_recognition',
    sponsorData.tier,
    key,
    {
      sponsorId: sponsorData.id,
      name: sponsorData.name,
      tier: sponsorData.tier,
      logoUrl: sponsorData.logoUrl,
      brandId: sponsorData.brandId,
      analysis: analysisResult || {},
      learnedAt: new Date().toISOString(),
    }
  );
};

export const getSponsorKnowledge = async (
  userId: string,
  tier?: string
): Promise<AIKnowledge[]> => {
  return await getKnowledge(userId, 'sponsor_recognition', tier);
};

export const buildSponsorAwarePrompt = (
  basePrompt: string,
  sponsorKnowledge: AIKnowledge[]
): string => {
  if (sponsorKnowledge.length === 0) return basePrompt;
  
  // Group by tier for hierarchical importance
  const byTier: Record<string, AIKnowledge[]> = {};
  sponsorKnowledge.forEach(k => {
    const tier = k.category || 'other';
    byTier[tier] = byTier[tier] || [];
    byTier[tier].push(k);
  });
  
  let enhancedPrompt = basePrompt;
  
  // Add sponsor context based on learned patterns
  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'partner', 'media'];
  const sponsorParts: string[] = [];
  
  tierOrder.forEach(tier => {
    if (byTier[tier] && byTier[tier].length > 0) {
      const names = byTier[tier]
        .map(k => (k.value as { name?: string }).name)
        .filter(Boolean)
        .slice(0, 5);
      if (names.length > 0) {
        sponsorParts.push(`${tier}: ${names.join(', ')}`);
      }
    }
  });
  
  if (sponsorParts.length > 0) {
    enhancedPrompt += ` Event sponsors by tier: ${sponsorParts.join('; ')}.`;
  }
  
  return enhancedPrompt;
};

// ============ INTERNAL HELPERS ============

async function updateKnowledgeFromFeedback(
  userId: string,
  generationId: string,
  feedbackType: string,
  rating?: number
): Promise<void> {
  // Fetch the generation details
  const { data: generation } = await supabase
    .from('ai_generations')
    .select('*')
    .eq('id', generationId)
    .single();

  if (!generation) return;

  const isPositive = feedbackType === 'thumbs_up' || feedbackType === 'accepted' || (rating && rating >= 4);
  
  // Update style preference knowledge
  if (generation.style_description) {
    await addOrUpdateKnowledge(
      userId,
      'style_preference',
      generation.asset_type,
      `style_${generation.asset_type}`,
      {
        description: generation.style_description,
        isPreferred: isPositive,
        lastUsed: new Date().toISOString(),
      }
    );
  }

  // Update cultural mapping if location was used
  if (generation.location && generation.cultural_context) {
    await addOrUpdateKnowledge(
      userId,
      'cultural_mapping',
      generation.location,
      `culture_${generation.location}`,
      {
        context: generation.cultural_context,
        effectiveForAsset: generation.asset_type,
        isPreferred: isPositive,
      }
    );
  }

  // Update prompt pattern success rate
  const promptKey = `prompt_${generation.asset_type}_${hashPrompt(generation.prompt_used)}`;
  const { data: existingKnowledge } = await supabase
    .from('ai_knowledge')
    .select('*')
    .eq('user_id', userId)
    .eq('key', promptKey)
    .single();

  if (existingKnowledge) {
    const currentSuccess = existingKnowledge.success_rate || 0.5;
    const newSuccess = isPositive 
      ? Math.min(currentSuccess + 0.1, 1) 
      : Math.max(currentSuccess - 0.1, 0);

    await supabase
      .from('ai_knowledge')
      .update({ success_rate: newSuccess })
      .eq('id', existingKnowledge.id);
  }
}

// ============ ASSET BRIEF LEARNING ============

export interface AssetBriefData {
  customContent: Record<string, string>;
  stylePreset: string;
  customStyleDescription?: string;
  colorMood: string;
  layoutStyle: string;
  typographyStyle: string;
  imageryStyle: string;
  additionalNotes?: string;
  referencePrompt?: string;
}

/**
 * Record brief preferences for AI learning
 */
export const recordBriefPreference = async (
  userId: string,
  assetType: string,
  brief: AssetBriefData
): Promise<boolean> => {
  const key = `brief_${assetType}`;
  
  return addOrUpdateKnowledge(
    userId,
    'brief_preference',
    assetType,
    key,
    {
      stylePreset: brief.stylePreset,
      colorMood: brief.colorMood,
      layoutStyle: brief.layoutStyle,
      typographyStyle: brief.typographyStyle,
      imageryStyle: brief.imageryStyle,
      hasCustomContent: Object.keys(brief.customContent).length > 0,
      contentFields: Object.keys(brief.customContent),
      lastUsed: new Date().toISOString(),
    }
  );
};

/**
 * Get user's preferred brief settings for an asset type
 */
export const getBriefPreference = async (
  userId: string,
  assetType: string
): Promise<AssetBriefData | null> => {
  const key = `brief_${assetType}`;
  
  const { data, error } = await supabase
    .from('ai_knowledge')
    .select('value')
    .eq('user_id', userId)
    .eq('knowledge_type', 'brief_preference')
    .eq('key', key)
    .single();
  
  if (error || !data?.value) return null;
  
  const value = data.value as Record<string, unknown>;
  
  return {
    customContent: {},
    stylePreset: (value.stylePreset as string) || 'modern',
    colorMood: (value.colorMood as string) || 'vibrant',
    layoutStyle: (value.layoutStyle as string) || 'ai-decide',
    typographyStyle: (value.typographyStyle as string) || 'modern-sans',
    imageryStyle: (value.imageryStyle as string) || 'photographic',
  };
};

/**
 * Get most common brief preferences across all asset types for a user
 */
export const getUserBriefTrends = async (
  userId: string
): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from('ai_knowledge')
    .select('value')
    .eq('user_id', userId)
    .eq('knowledge_type', 'brief_preference')
    .order('usage_count', { ascending: false })
    .limit(10);
  
  if (error || !data?.length) return {};
  
  // Count occurrences of each preference
  const counts: Record<string, Record<string, number>> = {
    stylePreset: {},
    colorMood: {},
    layoutStyle: {},
    imageryStyle: {},
  };
  
  data.forEach(row => {
    const value = row.value as Record<string, unknown>;
    Object.keys(counts).forEach(pref => {
      const val = value[pref] as string;
      if (val) {
        counts[pref][val] = (counts[pref][val] || 0) + 1;
      }
    });
  });
  
  // Get most common for each
  const trends: Record<string, string> = {};
  Object.entries(counts).forEach(([pref, valCounts]) => {
    const sorted = Object.entries(valCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      trends[pref] = sorted[0][0];
    }
  });
  
  return trends;
};

/**
 * Build enhanced prompt from brief preferences
 */
export const buildPromptFromBrief = (
  assetName: string,
  eventName: string,
  brief: AssetBriefData,
  brandContext?: Record<string, unknown>
): string => {
  const parts: string[] = [];
  
  // Base asset request
  parts.push(`Create a professional ${assetName} for "${eventName}".`);
  
  // Style preset
  const styleDescriptions: Record<string, string> = {
    modern: 'Modern and contemporary with clean lines and minimalist aesthetic',
    classic: 'Timeless and sophisticated with elegant traditional elements',
    bold: 'Bold and impactful with high contrast and dynamic energy',
    minimal: 'Minimalist and uncluttered with essential elements only',
    playful: 'Fun and energetic with playful visual elements',
    premium: 'Luxury and high-end with premium sophisticated feel',
  };
  if (brief.stylePreset && styleDescriptions[brief.stylePreset]) {
    parts.push(`Style: ${styleDescriptions[brief.stylePreset]}.`);
  } else if (brief.customStyleDescription) {
    parts.push(`Style: ${brief.customStyleDescription}.`);
  }
  
  // Color mood
  const colorDescriptions: Record<string, string> = {
    vibrant: 'Use vibrant, saturated colors with high energy',
    muted: 'Use muted, desaturated tones for a subtle refined look',
    monochrome: 'Use monochromatic color scheme for elegant simplicity',
    'brand-only': 'Strictly use brand colors only',
  };
  if (brief.colorMood && colorDescriptions[brief.colorMood]) {
    parts.push(colorDescriptions[brief.colorMood] + '.');
  }
  
  // Layout
  const layoutDescriptions: Record<string, string> = {
    centered: 'Centered, balanced composition',
    asymmetric: 'Dynamic asymmetric layout for visual interest',
    grid: 'Structured grid-based layout',
    organic: 'Organic, flowing composition',
  };
  if (brief.layoutStyle && layoutDescriptions[brief.layoutStyle]) {
    parts.push(`Layout: ${layoutDescriptions[brief.layoutStyle]}.`);
  }
  
  // Imagery
  const imageryDescriptions: Record<string, string> = {
    photographic: 'Include photorealistic imagery',
    illustrated: 'Use illustration style graphics',
    abstract: 'Feature abstract visual elements',
    geometric: 'Incorporate geometric patterns and shapes',
    mixed: 'Blend multiple visual styles',
    none: 'Focus on typography and minimal graphics, no imagery',
  };
  if (brief.imageryStyle && imageryDescriptions[brief.imageryStyle]) {
    parts.push(imageryDescriptions[brief.imageryStyle] + '.');
  }
  
  // Custom content
  const contentEntries = Object.entries(brief.customContent).filter(([, v]) => v);
  if (contentEntries.length > 0) {
    parts.push('Include this content:');
    contentEntries.forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      parts.push(`- ${label}: "${value}"`);
    });
  }
  
  // Additional notes
  if (brief.additionalNotes) {
    parts.push(`Additional requirements: ${brief.additionalNotes}`);
  }
  
  // Reference
  if (brief.referencePrompt) {
    parts.push(`Reference style: ${brief.referencePrompt}`);
  }
  
  // Brand context
  if (brandContext) {
    if (brandContext.mood) {
      parts.push(`Brand mood: ${Array.isArray(brandContext.mood) ? brandContext.mood.join(', ') : brandContext.mood}.`);
    }
    if (brandContext.industry) {
      parts.push(`Industry: ${brandContext.industry}.`);
    }
  }
  
  return parts.join(' ');
};

function hashPrompt(prompt: string): string {
  // Simple hash for prompt identification
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function mapDbToKnowledge(row: Record<string, unknown>): AIKnowledge {
  return {
    id: row.id as string,
    userId: row.user_id as string | undefined,
    knowledgeType: row.knowledge_type as AIKnowledge['knowledgeType'],
    category: row.category as string | undefined,
    key: row.key as string,
    value: row.value as Record<string, unknown>,
    confidenceScore: Number(row.confidence_score) || 0.5,
    usageCount: Number(row.usage_count) || 0,
    successRate: Number(row.success_rate) || 0.5,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapDbToPromptTemplate(row: Record<string, unknown>): PromptTemplate {
  return {
    id: row.id as string,
    assetType: row.asset_type as string,
    templateName: row.template_name as string,
    promptTemplate: row.prompt_template as string,
    variables: (row.variables as string[]) || [],
    successRate: Number(row.success_rate) || 0.5,
    usageCount: Number(row.usage_count) || 0,
    isSystem: row.is_system as boolean,
    createdBy: row.created_by as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
