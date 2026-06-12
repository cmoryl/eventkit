import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import { buildGammaDeckBrainPromptBlock } from './gammaPresentationResearchService';
import { auditPresentationExportFidelity } from './presentationExportFidelityService';
import { runPresentationAgentQALoop } from './presentationAgentQALoopService';
import type { PresentationTemplateSlotSet } from './presentationTemplateSlotService';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import { buildPresentationEventHistoryPromptBlock, summarizePresentationEventHistory } from './presentationEventHistoryService';
import { buildPresentationCompetitiveEdgePromptBlock, getPresentationCompetitiveEdges } from './presentationCompetitiveEdgeService';

export interface PresentationStudioIntelligenceInput {
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
}

export const buildPresentationStudioIntelligenceState = (input: PresentationStudioIntelligenceInput) => {
  const events = input.events || [];
  const exportFidelity = auditPresentationExportFidelity(input.slides);
  const agentQA = runPresentationAgentQALoop({
    slides: input.slides,
    creationMode: input.creationMode,
    deckStyle: input.deckStyle,
    hasSourceMaterial: input.hasSourceMaterial,
    hasBrandProfile: input.hasBrandProfile,
    hasExactLogoSource: input.hasExactLogoSource,
    templateSlotSet: input.templateSlotSet,
    templateSlotValues: input.templateSlotValues,
    humanApproved: input.humanApproved,
  });
  const eventHistory = summarizePresentationEventHistory(events);
  const competitiveEdges = getPresentationCompetitiveEdges('now');

  const score = Math.round((exportFidelity.score + agentQA.score) / 2);
  const status = agentQA.status === 'fail' || exportFidelity.status === 'fail'
    ? 'fail'
    : agentQA.status === 'warning' || exportFidelity.status === 'warning'
      ? 'warning'
      : 'pass';

  return {
    status,
    score,
    exportFidelity,
    agentQA,
    eventHistory,
    competitiveEdges,
    promptBlocks: {
      gamma: buildGammaDeckBrainPromptBlock(),
      competitiveEdge: buildPresentationCompetitiveEdgePromptBlock(),
      eventHistory: buildPresentationEventHistoryPromptBlock(events),
    },
  };
};

export const buildPresentationStudioIntelligencePromptBlock = (input: PresentationStudioIntelligenceInput) => {
  const state = buildPresentationStudioIntelligenceState(input);
  return [
    'PRESENTATION STUDIO INTELLIGENCE ORCHESTRATOR',
    `Overall status: ${state.status}`,
    `Overall score: ${state.score}/100`,
    `Creation mode: ${input.creationMode}`,
    `Deck style: ${input.deckStyle}`,
    `Slides: ${input.slides.length}`,
    '',
    state.promptBlocks.competitiveEdge,
    '',
    state.promptBlocks.gamma,
    '',
    state.promptBlocks.eventHistory,
  ].join('\n');
};
