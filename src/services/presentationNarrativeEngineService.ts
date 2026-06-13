import type { PresentationSmartBlockType } from './presentationSmartBlockService';
import { buildPresentationDeckRecipe, type PresentationDeckRecipe } from './presentationDeckRecipeService';

export type PresentationNarrativeIntent =
  | 'persuade'
  | 'inform'
  | 'train'
  | 'sell'
  | 'report'
  | 'launch'
  | 'align';

export interface PresentationNarrativeProfile {
  intent: PresentationNarrativeIntent;
  audience: string;
  tension: string;
  desiredAction: string;
  evidenceLevel: 'light' | 'balanced' | 'heavy';
}

const narrativeSequences: Record<PresentationNarrativeIntent, PresentationSmartBlockType[]> = {
  persuade: ['executive_summary', 'before_after', 'metric_stack', 'case_study', 'roadmap', 'cta_panel'],
  inform: ['executive_summary', 'process_map', 'timeline', 'appendix_table', 'cta_panel'],
  train: ['executive_summary', 'process_map', 'timeline', 'quote_proof', 'appendix_table', 'cta_panel'],
  sell: ['executive_summary', 'before_after', 'case_study', 'metric_stack', 'comparison_grid', 'cta_panel'],
  report: ['executive_summary', 'metric_stack', 'timeline', 'risk_matrix', 'appendix_table', 'cta_panel'],
  launch: ['executive_summary', 'before_after', 'roadmap', 'metric_stack', 'process_map', 'cta_panel'],
  align: ['executive_summary', 'before_after', 'process_map', 'roadmap', 'risk_matrix', 'cta_panel'],
};

export const buildNarrativeDeckRecipe = (input: {
  title: string;
  profile: PresentationNarrativeProfile;
}): PresentationDeckRecipe => {
  const sequence = narrativeSequences[input.profile.intent];
  return buildPresentationDeckRecipe({
    title: input.title,
    goal: `${input.profile.intent} ${input.profile.audience} by resolving: ${input.profile.tension}. Desired action: ${input.profile.desiredAction}. Evidence level: ${input.profile.evidenceLevel}.`,
    selectedSmartBlocks: sequence,
  });
};

export const buildNarrativePromptBlock = (input: {
  title: string;
  profile: PresentationNarrativeProfile;
}) => {
  const recipe = buildNarrativeDeckRecipe(input);
  return [
    'PRESENTATION NARRATIVE ENGINE',
    `Title: ${input.title}`,
    `Intent: ${input.profile.intent}`,
    `Audience: ${input.profile.audience}`,
    `Tension: ${input.profile.tension}`,
    `Desired action: ${input.profile.desiredAction}`,
    `Evidence level: ${input.profile.evidenceLevel}`,
    'Narrative sequence:',
    ...recipe.slides.map((slide, index) => `${index + 1}. ${slide.title} — ${slide.purpose}`),
  ].join('\n');
};
