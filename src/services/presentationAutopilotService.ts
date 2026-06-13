import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { PresentationSmartBlockType } from './presentationSmartBlockService';
import { recommendSmartBlocksForGoal } from './presentationSmartBlockService';
import { buildPresentationDeckRecipe } from './presentationDeckRecipeService';
import { buildPresentationUserFlow } from './presentationUserFlowService';
import { composePresentationIntelligencePayload } from './presentationIntelligencePayloadComposer';
import type { PresentationTemplateSlotSet } from './presentationTemplateSlotService';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import type { SlideData } from '@/components/slides/slideTypes';

export interface PresentationAutopilotInput {
  title: string;
  goal: string;
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  slides?: SlideData[];
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
  existingThemeOverride?: string;
}

export interface PresentationAutopilotPlan {
  selectedSmartBlocks: PresentationSmartBlockType[];
  deckRecipeTitle: string;
  deckRecipeGoal: string;
  nextAction: string;
  recommendedActions: string[];
  payloadThemeOverride: string;
  metadata: ReturnType<typeof composePresentationIntelligencePayload>['metadata'];
}

const fallbackSmartBlocks: PresentationSmartBlockType[] = [
  'executive_summary',
  'before_after',
  'metric_stack',
  'case_study',
  'roadmap',
  'cta_panel',
];

export const buildPresentationAutopilotPlan = (input: PresentationAutopilotInput): PresentationAutopilotPlan => {
  const recommended = recommendSmartBlocksForGoal(input.goal).map((block) => block.id);
  const selectedSmartBlocks = recommended.length ? recommended : fallbackSmartBlocks;
  const deckRecipe = buildPresentationDeckRecipe({
    title: input.title,
    goal: input.goal,
    selectedSmartBlocks,
  });

  const flow = buildPresentationUserFlow({
    creationMode: input.creationMode,
    deckStyle: input.deckStyle,
    hasSourceMaterial: input.hasSourceMaterial,
    hasBrandProfile: input.hasBrandProfile,
    hasExactLogoSource: input.hasExactLogoSource,
    hasTemplate: Boolean(input.templateSlotSet),
    hasOutline: Boolean(input.slides?.length),
    hasDeck: Boolean(input.slides?.length),
    hasEdits: input.events?.some((event) => event.eventType === 'slide_edited'),
    qaStatus: 'warning',
    exportDecision: input.slides?.length ? 'ready_with_notes' : 'needs_fixes',
    hasSavedSnapshot: input.events?.some((event) => event.eventType === 'export_created'),
  });

  const next = flow.find((step) => step.status === 'needs_attention') || flow.find((step) => step.status === 'available') || flow[flow.length - 1];

  const composed = composePresentationIntelligencePayload({
    slides: input.slides,
    creationMode: input.creationMode,
    deckStyle: input.deckStyle,
    sourceSummary: input.goal,
    events: input.events,
    hasSourceMaterial: input.hasSourceMaterial,
    hasBrandProfile: input.hasBrandProfile,
    hasExactLogoSource: input.hasExactLogoSource,
    templateSlotSet: input.templateSlotSet,
    templateSlotValues: input.templateSlotValues,
    selectedSmartBlocks,
    deckRecipe,
    includeDeckRecipe: true,
    includeFunctionRegistry: true,
    humanApproved: input.humanApproved,
    existingThemeOverride: input.existingThemeOverride,
  });

  return {
    selectedSmartBlocks,
    deckRecipeTitle: deckRecipe.title,
    deckRecipeGoal: deckRecipe.narrativeArc,
    nextAction: next.actionLabel,
    recommendedActions: flow
      .filter((step) => step.status === 'available' || step.status === 'needs_attention')
      .slice(0, 4)
      .map((step) => step.actionLabel),
    payloadThemeOverride: composed.themeOverride,
    metadata: composed.metadata,
  };
};
