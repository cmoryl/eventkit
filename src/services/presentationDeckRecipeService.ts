import type { SlideLayout } from '@/components/slides/slideTypes';
import type { PresentationSmartBlockType } from './presentationSmartBlockService';
import { presentationSmartBlocks } from './presentationSmartBlockService';

export interface PresentationDeckRecipeSlide {
  id: string;
  title: string;
  layout: SlideLayout | string;
  smartBlockId: PresentationSmartBlockType;
  purpose: string;
  requiredInputs: string[];
  editableRegions: string[];
  qualityChecks: string[];
}

export interface PresentationDeckRecipe {
  id: string;
  title: string;
  narrativeArc: string;
  slides: PresentationDeckRecipeSlide[];
  recommendedReviewQuestions: string[];
}

const defaultSequence: PresentationSmartBlockType[] = [
  'executive_summary',
  'before_after',
  'metric_stack',
  'case_study',
  'roadmap',
  'cta_panel',
];

export const buildPresentationDeckRecipe = (input: {
  title: string;
  goal?: string;
  selectedSmartBlocks?: PresentationSmartBlockType[];
}): PresentationDeckRecipe => {
  const selected = input.selectedSmartBlocks?.length ? input.selectedSmartBlocks : defaultSequence;
  const slides = selected.flatMap((id, index) => {
    const block = presentationSmartBlocks.find((item) => item.id === id);
    if (!block) return [];
    return [{
      id: `recipe-slide-${index + 1}-${id}`,
      title: block.label,
      layout: block.recommendedLayouts[0],
      smartBlockId: block.id,
      purpose: block.description,
      requiredInputs: block.requiredInputs,
      editableRegions: block.editableRegions,
      qualityChecks: block.qualityChecks,
    }];
  });

  return {
    id: `recipe-${Date.now()}`,
    title: input.title,
    narrativeArc: input.goal || 'Turn source material into a clear, editable, brand-safe presentation narrative.',
    slides,
    recommendedReviewQuestions: [
      'Does every slide have one clear job?',
      'Are all metrics sourced or contextualized?',
      'Are logo and brand rules handled with source assets?',
      'Can each important element be edited after export?',
      'Is the final ask or next step explicit?',
    ],
  };
};

export const buildDeckRecipePromptBlock = (recipe: PresentationDeckRecipe) => [
  'PRESENTATION DECK RECIPE',
  `Title: ${recipe.title}`,
  `Narrative arc: ${recipe.narrativeArc}`,
  'Build the deck from this deterministic recipe. Keep each slide editable and tied to its smart block.',
  ...recipe.slides.map((slide, index) => [
    `${index + 1}. ${slide.title} [${slide.layout}]`,
    `Purpose: ${slide.purpose}`,
    `Required inputs: ${slide.requiredInputs.join(', ')}`,
    `Editable regions: ${slide.editableRegions.join(', ')}`,
    `Quality checks: ${slide.qualityChecks.join('; ')}`,
  ].join('\n')),
  'Review questions:',
  ...recipe.recommendedReviewQuestions.map((question) => `- ${question}`),
].join('\n');
