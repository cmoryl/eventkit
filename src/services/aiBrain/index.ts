// AI Brain - Central Intelligence System
// Coordinates learning, render engines, intelligent generation, and creative suggestions

export * from './types';
export * from './renderEngineService';
export * from './learningService';
export * from './suggestionService';

import { supabase } from '@/integrations/supabase/client';
import type { GenerationContext, GenerationResult, RenderEngine, LearnedInsight } from './types';
import { compileGenerationPrompt } from './promptCompiler';
import { getDefaultRenderEngine } from './renderEngineService';
import { 
  recordGeneration, 
  recordFeedback, 
  getBestPromptTemplate, 
  buildPromptFromTemplate,
  getLearnedInsights,
  applyLearnedInsights,
  recordSponsorLogoAnalysis,
  getSponsorKnowledge,
  buildSponsorAwarePrompt,
  getKnowledge
} from './learningService';
import { parseAIError, handleAIError, type AIError } from '../aiErrorHandler';

/**
 * AI Brain - The central intelligence for asset generation
 * 
 * Key capabilities:
 * 1. Multi-engine support (Lovable, OpenAI, Stability, etc.)
 * 2. Learning from user feedback
 * 3. Smart prompt optimization
 * 4. Cultural context awareness
 * 5. Style consistency tracking
 */
export class AIBrain {
  private userId: string;
  private defaultEngine: RenderEngine | null = null;
  private learnedInsights: LearnedInsight[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    this.defaultEngine = await getDefaultRenderEngine(this.userId);
    this.learnedInsights = await getLearnedInsights(this.userId);
  }

  async generateAsset(context: GenerationContext): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // 1. Get the best prompt template for this asset type
      const template = await getBestPromptTemplate(context.assetType);
      
      // 2. Build base prompt from template or use default
      let basePrompt = template 
        ? buildPromptFromTemplate(template, context)
        : this.buildDefaultPrompt(context);

      // 3. Fetch brand knowledge for this user to inject into prompt
      const brandKnowledgeEntries = await getKnowledge(this.userId, 'brand_preference');
      // Merge all brand knowledge values into a single object for the compiler
      const mergedBrandKnowledge: Record<string, unknown> = {};
      brandKnowledgeEntries.forEach(entry => {
        if (entry.value && typeof entry.value === 'object') {
          Object.assign(mergedBrandKnowledge, entry.value);
        }
      });

      // 3b. Compile robust prompt (DNA + anchors + seed + quality gate + scene rules + brand intelligence)
      let prompt = compileGenerationPrompt({
        basePrompt,
        context,
        variantName: template?.templateName,
        brandKnowledge: Object.keys(mergedBrandKnowledge).length > 0 ? mergedBrandKnowledge : undefined,
      });

      // 3b. Apply sponsor-aware prompt for sponsor-heavy assets
      const sponsorHeavyAssets = new Set([
        'STEP_AND_REPEAT', 'MAIN_STAGE_BACKDROP', 'BACK_WALL',
        'PROGRAM_BOOKLET', 'SPONSOR_PACKAGE', 'BANNER',
        'REGISTRATION_COUNTER', 'SPONSOR_WALL',
      ]);
      if (sponsorHeavyAssets.has(context.assetType)) {
        const sponsorKnowledge = await getSponsorKnowledge(this.userId);
        prompt = buildSponsorAwarePrompt(prompt, sponsorKnowledge);
      }

      // 4. Apply learned insights AFTER compiler (so insights tweak within rules)
      prompt = applyLearnedInsights(prompt, this.learnedInsights, { assetType: context.assetType });

      // 5. Get render engine (use provided or default)
      const engine = context.renderEngine || this.defaultEngine;

      // 5. Generate image
      const result = await this.callRenderEngine(engine, prompt, context);

      // 6. Record generation for learning
      if (result.success && result.imageUrl) {
        await recordGeneration(
          this.userId,
          context,
          result.imageUrl,
          prompt,
          Date.now() - startTime
        );
      }

      return {
        ...result,
        generationTimeMs: Date.now() - startTime,
        promptUsed: prompt,
        renderEngine: engine?.provider || 'lovable',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTimeMs: Date.now() - startTime,
        promptUsed: '',
        renderEngine: 'lovable',
      };
    }
  }

  async provideFeedback(
    generationId: string,
    feedbackType: 'thumbs_up' | 'thumbs_down' | 'edited' | 'regenerated' | 'accepted',
    rating?: number,
    feedbackText?: string
  ): Promise<void> {
    await recordFeedback(generationId, this.userId, feedbackType, rating, feedbackText);
    
    // Refresh insights after feedback
    this.learnedInsights = await getLearnedInsights(this.userId);
  }

  private buildDefaultPrompt(context: GenerationContext): string {
    const parts: string[] = [];

    parts.push(`Create a ${context.assetType.toLowerCase().replace(/_/g, ' ')} for "${context.eventName}".`);

    if (context.styleDescription) {
      parts.push(`Style: ${context.styleDescription}.`);
    }

    if (context.colorPalette?.length) {
      parts.push(`Use these colors: ${context.colorPalette.join(', ')}.`);
    }

    if (context.culturalContext) {
      parts.push(`Cultural context: ${context.culturalContext}.`);
    }

    if (context.location) {
      parts.push(`Location influence: ${context.location}.`);
    }

    parts.push('Professional quality, print-ready, ultra high resolution.');

    return parts.join(' ');
  }

  private async callRenderEngine(
    engine: RenderEngine | null,
    prompt: string,
    context: GenerationContext
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const provider = engine?.provider || 'lovable';

    if (provider === 'lovable') {
      // Use built-in Lovable AI
      return this.callLovableAI(prompt, context);
    }

    // Call custom render engine
    const { data, error } = await supabase.functions.invoke('generate-with-engine', {
      body: {
        engineId: engine?.id,
        provider,
        apiKey: engine?.apiKeyEncrypted,
        config: engine?.config,
        prompt,
        context: {
          logoBase64: context.logoBase64,
          vibeImageBase64: context.vibeImageBase64,
          masterPatternBase64: context.masterPatternBase64,
          dimensions: context.dimensions,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, imageUrl: data?.imageUrl };
  }

  private async callLovableAI(
    prompt: string,
    context: GenerationContext
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        assetType: context.assetType,
        eventName: context.eventName,
        eventDescription: context.eventDescription,
        styleDescription: context.styleDescription,
        colorPalette: context.colorPalette,
        logoBase64: context.logoBase64,
        location: context.location,
        incorporateLocationStyle: !!context.location,
        vibeImageBase64: context.vibeImageBase64,
        masterPatternBase64: context.masterPatternBase64,
        customPrompt: prompt,
        imageModel:
          context.renderEngine?.provider === 'lovable-hq' ? 'quality'
          : context.renderEngine?.provider === 'lovable-nano-banana-2' ? 'nano-banana-2'
          : context.renderEngine?.provider === 'lovable-gpt-image' ? 'gpt-image'
          : 'fast',
      },
    });

    if (error) {
      // Parse error for consistent handling
      const aiError = parseAIError(error);
      
      if (aiError.type === 'RATE_LIMIT') {
        return { success: false, error: aiError.userMessage };
      }
      if (aiError.type === 'PAYMENT_REQUIRED') {
        handleAIError(error); // Show toast for payment issues
        return { success: false, error: aiError.userMessage };
      }
      return { success: false, error: aiError.message };
    }

    return { success: true, imageUrl: data?.imageUrl };
  }

  getInsights(): LearnedInsight[] {
    return this.learnedInsights;
  }

  getDefaultEngine(): RenderEngine | null {
    return this.defaultEngine;
  }
}

// Singleton factory for AI Brain instances
const brainInstances = new Map<string, AIBrain>();

export const getAIBrain = async (userId: string): Promise<AIBrain> => {
  if (!brainInstances.has(userId)) {
    const brain = new AIBrain(userId);
    await brain.initialize();
    brainInstances.set(userId, brain);
  }
  return brainInstances.get(userId)!;
};

export const clearAIBrain = (userId: string): void => {
  brainInstances.delete(userId);
};
