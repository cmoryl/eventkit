// AI Brain Type Definitions
// Centralized types for the learning and render engine system

export type RenderProvider = 'lovable' | 'lovable-hq' | 'lovable-nano-banana-2' | 'lovable-gpt-image' | 'openai' | 'stability' | 'replicate' | 'midjourney';
export type VideoProvider = 'lovable-veo3' | 'replicate-luma' | 'replicate-minimax';
export type EngineType = 'image' | 'video';

export interface RenderEngine {
  id: string;
  userId: string;
  provider: RenderProvider | VideoProvider;
  displayName: string;
  apiKeyEncrypted?: string;
  isActive: boolean;
  isDefault: boolean;
  config: RenderEngineConfig;
  createdAt: string;
  updatedAt: string;
  engineType?: EngineType; // 'image' or 'video'
}

export interface RenderEngineConfig {
  model?: string;
  quality?: 'standard' | 'hd';
  style?: string;
  negativePrompt?: string;
  guidanceScale?: number;
  steps?: number;
  seed?: number;
  // Video-specific config
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  [key: string]: unknown;
}

export interface AIGeneration {
  id: string;
  userId: string;
  projectId?: string;
  assetType: string;
  promptUsed: string;
  styleDescription?: string;
  colorPalette?: string[];
  location?: string;
  culturalContext?: string;
  resultImageUrl?: string;
  renderEngine: string;
  generationTimeMs?: number;
  createdAt: string;
}

export interface AIFeedback {
  id: string;
  generationId: string;
  userId: string;
  rating?: number;
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'edited' | 'regenerated' | 'accepted';
  feedbackText?: string;
  editsMade?: Record<string, unknown>;
  createdAt: string;
}

export interface AIKnowledge {
  id: string;
  userId?: string;
  knowledgeType: 'style_preference' | 'prompt_pattern' | 'asset_template' | 'cultural_mapping' | 'brand_preference' | 'sponsor_recognition' | 'brief_preference';
  category?: string;
  key: string;
  value: Record<string, unknown>;
  confidenceScore: number;
  usageCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

// Asset Brief types for pre-generation customization
export interface AssetBriefPreference {
  assetType: string;
  stylePreset: string;
  colorMood: string;
  layoutStyle: string;
  typographyStyle: string;
  imageryStyle: string;
  usageCount: number;
  lastUsed: string;
}

export interface PromptTemplate {
  id: string;
  assetType: string;
  templateName: string;
  promptTemplate: string;
  variables: string[];
  successRate: number;
  usageCount: number;
  isSystem: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationContext {
  eventName: string;
  eventDescription?: string;
  assetType: string;
  styleDescription?: string;
  colorPalette?: string[];
  location?: string;
  culturalContext?: string;
  logoBase64?: string;
  vibeImageBase64?: string;
  masterPatternBase64?: string;
  dimensions?: { width: number; height: number };
  renderEngine?: RenderEngine;
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  generationTimeMs: number;
  promptUsed: string;
  renderEngine: string;
}

export interface LearnedInsight {
  type: 'style' | 'prompt' | 'cultural' | 'asset';
  key: string;
  value: string;
  confidence: number;
  source: 'feedback' | 'usage' | 'success_rate';
}
