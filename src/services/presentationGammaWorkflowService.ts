import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';

export type PresentationStudioStartMode = 'prompt' | 'paste' | 'import' | 'blank' | 'agent';

export const mapStudioModeToGammaCreationMode = (mode: PresentationStudioStartMode): GammaCreationMode => {
  switch (mode) {
    case 'prompt':
      return 'generate';
    case 'paste':
      return 'paste';
    case 'import':
      return 'import';
    case 'blank':
      return 'template';
    case 'agent':
      return 'agent';
    default:
      return 'generate';
  }
};

export const inferGammaCreationModeFromSources = (input: {
  mode: PresentationStudioStartMode;
  hasPdfSource?: boolean;
  hasPptxSource?: boolean;
  hasBrandHubSource?: boolean;
  hasTemplate?: boolean;
}): GammaCreationMode => {
  if (input.mode === 'agent') return 'agent';
  if (input.hasPdfSource || input.hasPptxSource || input.hasBrandHubSource) return 'import';
  if (input.hasTemplate || input.mode === 'blank') return 'template';
  return mapStudioModeToGammaCreationMode(input.mode);
};

export const buildGammaWorkflowPromptAddendum = (input: {
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  sourceSummary?: string;
}) => [
  'GAMMA-INSPIRED WORKFLOW SETTINGS',
  `Creation mode: ${input.creationMode}`,
  `Deck style: ${input.deckStyle}`,
  input.sourceSummary ? `Source summary: ${input.sourceSummary}` : undefined,
  'Use creation mode to determine workflow behavior, not brand styling.',
  'Use deck style to guide content structure, density, pacing, and writing voice.',
  'Keep theme tokens, structural templates, and export fidelity separate.',
].filter(Boolean).join('\n');

export const defaultDeckStyleForMode = (mode: GammaCreationMode): GammaDeckStyle => {
  switch (mode) {
    case 'agent':
    case 'template':
      return 'consultant';
    case 'paste':
    case 'import':
      return 'classic';
    case 'generate':
    default:
      return 'visual';
  }
};
