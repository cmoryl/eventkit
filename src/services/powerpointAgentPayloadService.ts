import type { BrandProfile } from '@/types/brandProfile';
import type { PresentationExportProfile, LegacyPresentationBrand, PresentationDeckBrainPayload } from './presentationDeckBrainService';
import { buildPresentationThemeOverride, getCloudBackedPresentationDeckBrainPayload } from './presentationDeckBrainService';

export interface PowerPointAgentPayloadBase {
  topic: string;
  audience?: string;
  slideCount?: number;
  tone?: string;
  brand?: unknown;
  template?: unknown;
  source?: unknown;
  planOnly?: boolean;
  prebuiltOutline?: unknown;
  themeOverride?: string;
  [key: string]: unknown;
}

export interface PowerPointAgentPayloadOptions {
  profile: BrandProfile;
  basePayload: PowerPointAgentPayloadBase;
  legacyBrand?: LegacyPresentationBrand | null;
  templateId?: string;
  templateName?: string;
  exportProfile?: PresentationExportProfile;
  sourceKind?: 'prompt' | 'pdf' | 'pptx' | 'brandhub' | 'mixed';
  parallaxMode?: boolean;
}

export interface PresentationAwarePowerPointPayload extends PowerPointAgentPayloadBase {
  presentationIntelligence: PresentationDeckBrainPayload;
  presentationIntelligenceVersion: '1.0';
}

export const buildPresentationAwarePowerPointPayload = async (options: PowerPointAgentPayloadOptions): Promise<{
  payload: PresentationAwarePowerPointPayload;
  cloudMessage: string;
}> => {
  const {
    profile,
    basePayload,
    legacyBrand,
    templateId,
    templateName,
    exportProfile = 'editable_working_deck',
    sourceKind = 'prompt',
    parallaxMode = false,
  } = options;

  const deckBrain = await getCloudBackedPresentationDeckBrainPayload({
    profile,
    legacyBrand,
    templateId,
    templateName,
    exportProfile,
    sourceKind,
    parallaxMode,
  });

  return {
    payload: {
      ...basePayload,
      themeOverride: buildPresentationThemeOverride(deckBrain.payload, String(basePayload.themeOverride || '')),
      presentationIntelligence: deckBrain.payload,
      presentationIntelligenceVersion: '1.0',
    },
    cloudMessage: deckBrain.cloud.message,
  };
};
