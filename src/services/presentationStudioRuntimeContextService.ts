import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from './presentationTemplateSlotService';
import type { PresentationStudioStartMode } from './presentationGammaWorkflowService';
import { defaultDeckStyleForMode, inferGammaCreationModeFromSources } from './presentationGammaWorkflowService';

export interface PresentationRuntimeBrandSignal {
  id?: string;
  name?: string;
  logoUrl?: string | null;
  isFromBrandHub?: boolean;
}

export interface PresentationRuntimeSourceSignal {
  hasPdfSource?: boolean;
  hasPptxSource?: boolean;
  hasBrandHubSource?: boolean;
  sourceName?: string;
  influence?: number;
}

export interface PresentationRuntimeTemplateSignal {
  templateId?: string;
  templateName?: string;
  slotSet?: PresentationTemplateSlotSet;
  slotValues?: Record<string, unknown>;
}

export interface PresentationStudioRuntimeContextInput {
  mode: PresentationStudioStartMode;
  slides?: SlideData[];
  brand?: PresentationRuntimeBrandSignal | null;
  source?: PresentationRuntimeSourceSignal;
  template?: PresentationRuntimeTemplateSignal;
  events?: PresentationEventRecord[];
  humanApproved?: boolean;
  deckStyle?: GammaDeckStyle;
}

export interface PresentationStudioRuntimeContext {
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  events: PresentationEventRecord[];
  hasSourceMaterial: boolean;
  hasBrandProfile: boolean;
  hasExactLogoSource: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved: boolean;
  sourceSummary?: string;
}

export const buildPresentationStudioRuntimeContext = (input: PresentationStudioRuntimeContextInput): PresentationStudioRuntimeContext => {
  const source = input.source || {};
  const creationMode = inferGammaCreationModeFromSources({
    mode: input.mode,
    hasPdfSource: source.hasPdfSource,
    hasPptxSource: source.hasPptxSource,
    hasBrandHubSource: source.hasBrandHubSource,
    hasTemplate: Boolean(input.template?.templateId),
  });
  const deckStyle = input.deckStyle || defaultDeckStyleForMode(creationMode);
  const hasSourceMaterial = Boolean(source.hasPdfSource || source.hasPptxSource || source.hasBrandHubSource || source.sourceName);

  return {
    slides: input.slides || [],
    creationMode,
    deckStyle,
    events: input.events || [],
    hasSourceMaterial,
    hasBrandProfile: Boolean(input.brand?.id || input.brand?.name),
    hasExactLogoSource: Boolean(input.brand?.logoUrl),
    templateSlotSet: input.template?.slotSet,
    templateSlotValues: input.template?.slotValues,
    humanApproved: Boolean(input.humanApproved),
    sourceSummary: source.sourceName
      ? `${source.sourceName}${source.influence ? ` (${source.influence}% influence)` : ''}`
      : undefined,
  };
};
