// Render Engine Generator Service
// Handles image generation using custom render engines (OpenAI, Stability, Replicate, etc.)

import { supabase } from '@/integrations/supabase/client';
import type { RenderEngine } from '@/services/aiBrain/types';
import type { AssetType } from '@/types';
import { getAssetConfig } from '@/config/assetConfig';

interface GenerateWithEngineParams {
  engine: RenderEngine;
  assetType: AssetType | string;
  eventName: string;
  eventDescription?: string;
  styleDescription?: string;
  colorPalette?: string[];
  logoBase64?: string;
  location?: string;
  incorporateLocationStyle?: boolean;
  vibeImageBase64?: string;
  masterPatternBase64?: string;
  venueImageBase64?: string;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  engine: string;
  generationTimeMs: number;
}

/**
 * Build a prompt for image generation based on asset type and context
 */
function buildPrompt(params: GenerateWithEngineParams): string {
  const {
    assetType,
    eventName,
    eventDescription,
    styleDescription,
    colorPalette,
    location,
    incorporateLocationStyle,
  } = params;

  const config = getAssetConfig(assetType as AssetType);
  const assetTitle = config?.title || String(assetType).replace(/_/g, ' ');
  
  // Build base prompt
  let prompt = `Create a professional ${assetTitle.toLowerCase()} design for an event called "${eventName}".`;
  
  // Add description context
  if (eventDescription) {
    prompt += ` The event is described as: ${eventDescription}.`;
  }
  
  // Add style guidance
  if (styleDescription) {
    prompt += ` Design style: ${styleDescription}.`;
  } else {
    prompt += ` Use a modern, clean, professional aesthetic.`;
  }
  
  // Add color guidance
  if (colorPalette && colorPalette.length > 0) {
    prompt += ` Use this color palette: ${colorPalette.join(', ')}.`;
  }
  
  // Add location/cultural context
  if (location && incorporateLocationStyle) {
    prompt += ` Incorporate visual elements inspired by ${location}.`;
  }
  
  // Add print specifications if available
  if (config?.printSpec) {
    prompt += ` Design for print at ${config.printSpec.widthInches}" × ${config.printSpec.heightInches}" at ${config.printSpec.dpi} DPI.`;
  } else if (config?.pixelWidth && config?.pixelHeight) {
    prompt += ` Design at ${config.pixelWidth}×${config.pixelHeight} pixels.`;
  }
  
  // Add type-specific prompts
  const typePrompts: Record<string, string> = {
    SOCIAL_POST: 'Include event name prominently. Optimized for Instagram feed.',
    SOCIAL_STORY: 'Vertical format for Instagram/Facebook stories. Eye-catching with clear text.',
    BANNER: 'Wide format suitable for website header or email banner.',
    EMAIL_HEADER: 'Clean email header with event branding.',
    NAME_TAG: 'Professional attendee name tag with space for name.',
    EVENT_SIGNAGE: 'Large format signage for event venue.',
    LANYARD: 'Lanyard design with event branding.',
    TSHIRT: 'T-shirt front design, centered composition.',
    TSHIRT_BACK: 'T-shirt back design with event details.',
    SWAG_BAG: 'Tote bag design with event branding.',
    STICKER_SHEET: 'Collection of branded stickers in various shapes.',
    THANK_YOU_NOTE: 'Elegant thank you card design.',
    WIFI_SIGN: 'Clear WiFi information sign with network details.',
    HAT: 'Cap/hat embroidery design.',
    WATER_BOTTLE: 'Water bottle label design.',
    MENU: 'Event menu or program design.',
    FOLDER: 'Document folder design with branding.',
  };
  
  const typeStr = String(assetType);
  if (typePrompts[typeStr]) {
    prompt += ` ${typePrompts[typeStr]}`;
  }
  
  // Add quality instructions
  prompt += ' High quality, photorealistic if appropriate, no text spelling errors.';
  
  return prompt;
}

/**
 * Generate an image using a custom render engine
 */
export async function generateWithEngine(params: GenerateWithEngineParams): Promise<GenerationResult> {
  const startTime = Date.now();
  const { engine } = params;
  
  try {
    // Build the prompt
    const prompt = buildPrompt(params);
    console.log(`Generating with ${engine.displayName} (${engine.provider}):`, prompt.substring(0, 100) + '...');
    
    // Get dimensions from config
    const config = getAssetConfig(params.assetType as AssetType);
    const dimensions = config?.printSpec 
      ? { 
          width: Math.min(1920, Math.round(config.printSpec.widthInches * config.printSpec.dpi)),
          height: Math.min(1920, Math.round(config.printSpec.heightInches * config.printSpec.dpi))
        }
      : config?.pixelWidth && config?.pixelHeight
        ? { width: config.pixelWidth, height: config.pixelHeight }
        : { width: 1024, height: 1024 };
    
    // Call the edge function with engine details
    const { data, error } = await supabase.functions.invoke('generate-with-engine', {
      body: {
        provider: engine.provider,
        apiKey: engine.apiKeyEncrypted, // The edge function will decrypt this
        config: engine.config,
        prompt,
        context: {
          logoBase64: params.logoBase64,
          vibeImageBase64: params.vibeImageBase64,
          masterPatternBase64: params.masterPatternBase64,
          dimensions,
        },
      },
    });
    
    const generationTimeMs = Date.now() - startTime;
    
    if (error) {
      console.error('Engine generation error:', error);
      return {
        success: false,
        error: error.message || 'Generation failed',
        engine: engine.displayName,
        generationTimeMs,
      };
    }
    
    if (data?.success && data?.imageUrl) {
      return {
        success: true,
        imageUrl: data.imageUrl,
        engine: engine.displayName,
        generationTimeMs,
      };
    }
    
    return {
      success: false,
      error: data?.error || 'No image returned',
      engine: engine.displayName,
      generationTimeMs,
    };
  } catch (error) {
    const generationTimeMs = Date.now() - startTime;
    console.error('Engine generation exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      engine: engine.displayName,
      generationTimeMs,
    };
  }
}

/**
 * Check if an asset type supports custom engine generation
 */
export function supportsCustomEngine(assetType: AssetType | string): boolean {
  // Only image-based assets can use custom engines
  const imageTypes = [
    'SOCIAL_POST', 'BANNER', 'NAME_TAG', 'EMAIL_HEADER', 'SOCIAL_STORY',
    'EVENT_SIGNAGE', 'TSHIRT', 'TSHIRT_BACK', 'LANYARD', 'SWAG_BAG',
    'STICKER_SHEET', 'THANK_YOU_NOTE', 'WIFI_SIGN', 'HAT', 'WATER_BOTTLE',
    'MENU', 'FOLDER',
  ];
  const typeStr = String(assetType);
  return imageTypes.includes(typeStr);
}
