// Render Engine Service
// Manages multiple AI image and video generation providers

import { supabase } from '@/integrations/supabase/client';
import type { RenderEngine, RenderProvider, RenderEngineConfig, VideoProvider, EngineType } from './types';
import type { TablesInsert, Json } from '@/integrations/supabase/types';

interface ProviderInfo {
  name: string;
  description: string;
  requiresKey: boolean;
  models: string[];
  type: EngineType;
}

const IMAGE_PROVIDER_INFO: Record<RenderProvider, ProviderInfo> = {
  lovable: {
    name: 'Lovable AI',
    description: 'Built-in AI powered by Google Gemini. Fast (Nano Banana) or high-quality (Pro) modes.',
    requiresKey: false,
    models: ['gemini-2.5-flash-image (Fast)', 'gemini-3-pro-image-preview (Quality)'],
    type: 'image',
  },
  openai: {
    name: 'OpenAI DALL-E',
    description: 'OpenAI\'s image generation models including DALL-E 3.',
    requiresKey: true,
    models: ['dall-e-3', 'dall-e-2'],
    type: 'image',
  },
  stability: {
    name: 'Stability AI',
    description: 'Stable Diffusion models for high-quality image generation.',
    requiresKey: true,
    models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6'],
    type: 'image',
  },
  replicate: {
    name: 'Replicate',
    description: 'Access various open-source models via Replicate API.',
    requiresKey: true,
    models: ['flux-pro', 'flux-schnell', 'sdxl'],
    type: 'image',
  },
  midjourney: {
    name: 'Midjourney Style',
    description: 'Midjourney-style image generation via Replicate (requires Replicate API key).',
    requiresKey: true,
    models: ['openjourney', 'sdxl-lightning'],
    type: 'image',
  },
};

const VIDEO_PROVIDER_INFO: Record<VideoProvider, ProviderInfo> = {
  'lovable-veo3': {
    name: 'Lovable AI (Veo 3)',
    description: 'Google Veo 3 powered video generation. Creates cinematic 5-10 second clips.',
    requiresKey: false,
    models: ['veo-3', 'veo-3-fast'],
    type: 'video',
  },
  'replicate-luma': {
    name: 'Luma Ray',
    description: 'Luma\'s Ray model for high-quality video generation via Replicate.',
    requiresKey: true,
    models: ['luma/ray'],
    type: 'video',
  },
  'replicate-minimax': {
    name: 'Minimax Video',
    description: 'Minimax video generation model for text-to-video via Replicate.',
    requiresKey: true,
    models: ['minimax/video-01'],
    type: 'video',
  },
};

export const getProviderInfo = (provider: RenderProvider | VideoProvider) => {
  return IMAGE_PROVIDER_INFO[provider as RenderProvider] || VIDEO_PROVIDER_INFO[provider as VideoProvider];
};

export const getAllProviders = () => Object.entries(IMAGE_PROVIDER_INFO).map(([key, value]) => ({
  id: key as RenderProvider,
  ...value,
}));

export const getAllVideoProviders = () => Object.entries(VIDEO_PROVIDER_INFO).map(([key, value]) => ({
  id: key as VideoProvider,
  ...value,
}));

export const getAllEngineProviders = () => [
  ...getAllProviders(),
  ...getAllVideoProviders(),
];

export const getUserRenderEngines = async (userId: string): Promise<RenderEngine[]> => {
  const { data, error } = await supabase
    .from('render_engines')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching render engines:', error);
    return [];
  }

  return (data || []).map(mapDbToRenderEngine);
};

export const getDefaultRenderEngine = async (userId: string): Promise<RenderEngine | null> => {
  const { data, error } = await supabase
    .from('render_engines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error || !data) {
    // Return Lovable as default if no custom engine
    return {
      id: 'lovable-default',
      userId,
      provider: 'lovable',
      displayName: 'Lovable AI (Default)',
      isActive: true,
      isDefault: true,
      config: { model: 'gemini-2.5-flash-image' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return mapDbToRenderEngine(data);
};

export const addRenderEngine = async (
  userId: string,
  provider: RenderProvider,
  displayName: string,
  apiKey?: string,
  config: RenderEngineConfig = {}
): Promise<RenderEngine | null> => {
  const insertData: TablesInsert<'render_engines'> = {
    user_id: userId,
    provider,
    display_name: displayName,
    api_key_encrypted: apiKey || null,
    config: config as unknown as Json,
    is_active: true,
    is_default: false,
  };

  const { data, error } = await supabase
    .from('render_engines')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error adding render engine:', error);
    return null;
  }

  return mapDbToRenderEngine(data);
};

export const updateRenderEngine = async (
  engineId: string,
  updates: Partial<{
    displayName: string;
    apiKey: string;
    isActive: boolean;
    isDefault: boolean;
    config: RenderEngineConfig;
  }>
): Promise<boolean> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.displayName) dbUpdates.display_name = updates.displayName;
  if (updates.apiKey) dbUpdates.api_key_encrypted = updates.apiKey;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;
  if (updates.config) dbUpdates.config = updates.config;

  const { error } = await supabase
    .from('render_engines')
    .update(dbUpdates)
    .eq('id', engineId);

  if (error) {
    console.error('Error updating render engine:', error);
    return false;
  }

  return true;
};

export const setDefaultRenderEngine = async (userId: string, engineId: string): Promise<boolean> => {
  // First, unset all defaults
  await supabase
    .from('render_engines')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the new default
  const { error } = await supabase
    .from('render_engines')
    .update({ is_default: true })
    .eq('id', engineId);

  return !error;
};

export const deleteRenderEngine = async (engineId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('render_engines')
    .delete()
    .eq('id', engineId);

  return !error;
};

export const testRenderEngine = async (engine: RenderEngine): Promise<{ success: boolean; message: string }> => {
  // Test by generating a simple image
  try {
    const response = await supabase.functions.invoke('generate-with-engine', {
      body: {
        engineId: engine.id,
        provider: engine.provider,
        apiKey: engine.apiKeyEncrypted,
        config: engine.config,
        prompt: 'A simple test pattern with geometric shapes',
        test: true,
      },
    });

    if (response.error) {
      return { success: false, message: response.error.message };
    }

    return { success: true, message: 'Connection successful!' };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : 'Unknown error' };
  }
};

// Helper to map database row to RenderEngine type
function mapDbToRenderEngine(row: Record<string, unknown>): RenderEngine {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    provider: row.provider as RenderProvider,
    displayName: row.display_name as string,
    apiKeyEncrypted: row.api_key_encrypted as string | undefined,
    isActive: row.is_active as boolean,
    isDefault: row.is_default as boolean,
    config: (row.config as RenderEngineConfig) || {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
