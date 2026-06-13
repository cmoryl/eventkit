import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { PresentationTemplateSlotSet } from './presentationTemplateSlotService';
import { buildTemplateSlotPromptBlock } from './presentationTemplateSlotService';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import { buildPresentationStudioIntelligencePromptBlock } from './presentationStudioIntelligenceOrchestrator';
import { buildGammaWorkflowPromptAddendum } from './presentationGammaWorkflowService';
import type { PresentationSmartBlockType } from './presentationSmartBlockService';
import { buildSmartBlockPromptBlock } from './presentationSmartBlockService';
import { buildPresentationAdvancedFunctionPromptBlock } from './presentationAdvancedFunctionRegistry';
import { buildDeckRecipePromptBlock, buildPresentationDeckRecipe, type PresentationDeckRecipe } from './presentationDeckRecipeService';
import { buildNarrativeDeckRecipe, buildNarrativePromptBlock, type PresentationNarrativeProfile } from './presentationNarrativeEngineService';
import { buildCommandRouterPromptBlock } from './presentationCommandRouterService';

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
  selectedSmartBlocks?: PresentationSmartBlockType[];
  narrativeProfile?: PresentationNarrativeProfile;
  deckRecipe?: PresentationDeckRecipe;
  deckRecipeTitle?: string;
  deckRecipeGoal?: string;
  includeDeckRecipe?: boolean;
  includeFunctionRegistry?: boolean;
  includeCommandRouter?: boolean;
  humanApproved?: boolean;
  existingThemeOverride?: string;
}

export interface PresentationIntelligenceComposedPayload {
  themeOverride: string;
  metadata: {
    creationMode: GammaCreationMode;
    deckStyle: GammaDeckStyle;
    hasTemplateSlotSet: boolean;
    smartBlockCount: number;
    narrativeProfileIncluded: boolean;
    deckRecipeIncluded: boolean;
    deckRecipeSlideCount: number;
    functionRegistryIncluded: boolean;
    commandRouterIncluded: boolean;
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
  const smartBlock = buildSmartBlockPromptBlock(input.selectedSmartBlocks);
  const narrativeBlock = input.narrativeProfile ? buildNarrativePromptBlock({
    title: input.deckRecipeTitle || 'Presentation Narrative',
    profile: input.narrativeProfile,
  }) : undefined;
  const recipe = input.deckRecipe || (input.narrativeProfile ? buildNarrativeDeckRecipe({
    title: input.deckRecipeTitle || 'Presentation Deck Recipe',
    profile: input.narrativeProfile,
  }) : input.includeDeckRecipe ? buildPresentationDeckRecipe({
    title: input.deckRecipeTitle || 'Presentation Deck Recipe',
    goal: input.deckRecipeGoal,
    selectedSmartBlocks: input.selectedSmartBlocks,
  }) : undefined);
  const recipeBlock = recipe ? buildDeckRecipePromptBlock(recipe) : undefined;
  const functionRegistryBlock = input.includeFunctionRegistry ? buildPresentationAdvancedFunctionPromptBlock() : undefined;
  const commandRouterBlock = input.includeCommandRouter ? buildCommandRouterPromptBlock() : undefined;

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
      smartBlock,
      narrativeBlock,
      recipeBlock,
      functionRegistryBlock,
      commandRouterBlock,
      intelligenceBlock,
    ].filter(Boolean).join('\n\n'),
    metadata: {
      creationMode: input.creationMode,
      deckStyle: input.deckStyle,
      hasTemplateSlotSet: Boolean(input.templateSlotSet),
      smartBlockCount: input.selectedSmartBlocks?.length || 0,
      narrativeProfileIncluded: Boolean(input.narrativeProfile),
      deckRecipeIncluded: Boolean(recipe),
      deckRecipeSlideCount: recipe?.slides.length || 0,
      functionRegistryIncluded: Boolean(input.includeFunctionRegistry),
      commandRouterIncluded: Boolean(input.includeCommandRouter),
      eventCount: input.events?.length || 0,
      slideCount: input.slides?.length || 0,
    },
  };
};
