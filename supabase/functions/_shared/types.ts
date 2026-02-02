// Shared type definitions for edge functions

export interface ImageAnalysis {
  dominantColors: string[];
  colorMood: string;
  colorHarmony: string;
  designStyle: string;
  aestheticKeywords: string[];
  era: string;
  mood: string;
  atmosphere: string;
  emotionalTone: string;
  patterns: string[];
  textures: string[];
  shapes: string;
  typographyStyle: string;
  typographyMood: string;
  composition: string;
  whitespace: string;
  visualWeight: string;
  promptEnhancements: string[];
  avoidElements: string[];
  analysisConfidence: number;
}

export interface VenueIntelligence {
  name: string;
  fullAddress?: string;
  city?: string;
  country?: string;
  capacity?: string;
  venueType?: string;
  description?: string;
  amenities?: string[];
  parkingInfo?: string;
  accessibilityInfo?: string;
  cateringOptions?: string;
  technicalSpecs?: string;
  website?: string;
  phone?: string;
  priceRange?: string;
  bestFor?: string[];
  nearbyHotels?: string[];
  localTips?: string;
  culturalContext?: string;
}

export interface BrandContext {
  brandName?: string;
  tagline?: string;
  mission?: string;
  archetype?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  colorPalette?: Array<{ hex: string; name?: string; cmyk?: string; pantone?: string; usage?: string }>;
  approvedColorCombinations?: Array<{ name: string; colors: string[]; status: string }>;
  gradients?: Array<{ name: string; colors: string[]; direction?: string }>;
  headingFont?: string;
  bodyFont?: string;
  accentFont?: string;
  brandVoice?: string[];
  toneKeywords?: string[];
  writingStyle?: string;
  moodKeywords?: string[];
  imageryStyle?: string;
  patternStyle?: string;
  iconStyle?: string;
  targetAudience?: string;
  culturalContext?: string;
  industry?: string;
  printColorMode?: 'CMYK' | 'RGB' | 'Pantone';
  logoUrl?: string;
  customPrompts?: Record<string, unknown>;
}

export interface PromptTemplate {
  id: string;
  asset_type: string;
  template_name: string;
  prompt_template: string;
  variables: Record<string, string>[] | null;
  success_rate: number | null;
  usage_count: number | null;
}

export interface GenerateImageRequest {
  assetType: string;
  eventName: string;
  eventDescription?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  styleDescription?: string;
  colorPalette?: string[];
  logoBase64?: string;
  location?: string;
  incorporateLocationStyle?: boolean;
  vibeImageBase64?: string;
  masterPatternBase64?: string;
  venueImageBase64?: string;
  renderMode?: 'design' | 'mockup' | 'hyperrealistic';
  isPrintAsset?: boolean;
  printDPI?: number;
  imageAnalysis?: ImageAnalysis;
  venueIntelligence?: VenueIntelligence;
  brandContext?: BrandContext;
}

// Error types for consistent error handling
export type AIErrorType = 'RATE_LIMIT' | 'PAYMENT_REQUIRED' | 'API_ERROR' | 'TIMEOUT' | 'UNKNOWN';

export interface AIError {
  type: AIErrorType;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}

export const createAIError = (type: AIErrorType, message?: string): AIError => {
  switch (type) {
    case 'RATE_LIMIT':
      return {
        type,
        message: message || 'Rate limit exceeded. Please try again in a moment.',
        retryable: true,
        retryAfterMs: 5000,
      };
    case 'PAYMENT_REQUIRED':
      return {
        type,
        message: message || 'AI credits exhausted. Please add credits to continue.',
        retryable: false,
      };
    case 'TIMEOUT':
      return {
        type,
        message: message || 'Request timed out. Please try again.',
        retryable: true,
        retryAfterMs: 2000,
      };
    case 'API_ERROR':
      return {
        type,
        message: message || 'AI service error. Please try again.',
        retryable: true,
        retryAfterMs: 3000,
      };
    default:
      return {
        type: 'UNKNOWN',
        message: message || 'An unexpected error occurred.',
        retryable: false,
      };
  }
};
