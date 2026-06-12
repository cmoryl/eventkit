import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { PresentationTemplateSlotSet } from './presentationTemplateSlotService';
import { buildTemplateSlotPromptBlock } from './presentationTemplateSlotService';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import { buildPresentationStudioIntelligencePromptBlock } from './presentationStudioIntelligenceOrchestrator';
import { buildGammaWorkflowPromptAddendum } from './presentationGammaWorkflowService';

export interface PresentationIntelligenceComposerInput {
  slides?: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  sourceSummary?: string;
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
  existingThemeOverride?: string;
}

export interface PresentationIntelligenceComposedPayload {
  themeOverride: string;
  metadata: {
    creationMode: GammaCreationMode;
    deckStyle: GammaDeckStyle;
    hasTemplateSlotSet: boolean;
    eventCount: number;
    slideCount: number;
  };
}

export const composePresentationIntelligencePayload = (input: PresentationIntelligenceComposerInput): PresentationIntelligenceComposedPayload => {
  const workflowBlock = buildGammaWorkflowPromptAddendum({
    creationMode: input.creationMode,
    deckStyle: input.deckStyle,
    sourceSummary: input.sourceSummary,
  });

  const templateBlock = input.templateSlotSet ? buildTemplateSlotPromptBlock(input.templateSlotSet) : undefined;

  const intelligenceBlock = buildPresentationStudioIntelligencePromptBlock({
    slides: input.slides || [],
    creationMode: input.creationMode,
    deckStyle: input.deckStyle,
    events: input.events || [],
    hasSourceMaterial: input.hasSourceMaterial,
    hasBrandProfile: input.hasBrandProfile,
    hasExactLogoSource: input.hasExactLogoSource,
    templateSlotSet: input.templateSlotSet,
    templateSlotValues: input.templateSlotValues,
    humanApproved: input.humanApproved,
  });

  return {
    themeOverride: [
      input.existingThemeOverride,
      workflowBlock,
      templateBlock,
      intelligenceBlock,
    ].filter(Boolean).join('\n\n'),
    metadata: {
      creationMode: input.creationMode,
      deckStyle: input.deckStyle,
      hasTemplateSlotSet: Boolean(input.templateSlotSet),
      eventCount: input.events?.length || 0,
      slideCount: input.slides?.length || 0,
    },
  };
};
