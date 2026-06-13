import type { PresentationFlowStepId } from './presentationUserFlowService';
import type { PresentationAdvancedFunctionCategory } from './presentationAdvancedFunctionRegistry';

export type PresentationCommandIntent =
  | 'create_deck'
  | 'attach_source'
  | 'apply_brand'
  | 'choose_template'
  | 'select_smart_blocks'
  | 'build_recipe'
  | 'edit_slide'
  | 'run_qa'
  | 'check_export'
  | 'save_reuse'
  | 'unknown';

export interface PresentationCommandRoute {
  intent: PresentationCommandIntent;
  confidence: number;
  flowStep: PresentationFlowStepId;
  functionCategory: PresentationAdvancedFunctionCategory;
  recommendedAction: string;
  assistantInstruction: string;
  requiredContext: string[];
}

const commandMap: Array<{
  intent: PresentationCommandIntent;
  keywords: string[];
  flowStep: PresentationFlowStepId;
  functionCategory: PresentationAdvancedFunctionCategory;
  recommendedAction: string;
  assistantInstruction: string;
  requiredContext: string[];
}> = [
  {
    intent: 'create_deck',
    keywords: ['create', 'generate', 'make', 'build deck', 'new deck', 'presentation'],
    flowStep: 'start_mode',
    functionCategory: 'creation',
    recommendedAction: 'Start creation flow',
    assistantInstruction: 'Clarify the goal, audience, source material, brand, and desired deck style before generating.',
    requiredContext: ['goal', 'audience', 'creation mode', 'deck style'],
  },
  {
    intent: 'attach_source',
    keywords: ['source', 'pdf', 'pptx', 'upload', 'import', 'paste', 'notes', 'url'],
    flowStep: 'source_intake',
    functionCategory: 'source',
    recommendedAction: 'Attach source material',
    assistantInstruction: 'Ingest the source, summarize it, and decide how strongly it should influence the deck.',
    requiredContext: ['source file or source text', 'influence level'],
  },
  {
    intent: 'apply_brand',
    keywords: ['brand', 'logo', 'colors', 'fonts', 'style guide', 'brand brain'],
    flowStep: 'brand_lock',
    functionCategory: 'brand',
    recommendedAction: 'Lock brand system',
    assistantInstruction: 'Apply Brand Brain rules, source logo assets, color tokens, typography, and prompt overrides.',
    requiredContext: ['brand profile', 'exact logo asset', 'style rules'],
  },
  {
    intent: 'choose_template',
    keywords: ['template', 'theme', 'layout system', 'style system'],
    flowStep: 'template_system',
    functionCategory: 'template',
    recommendedAction: 'Choose template logic',
    assistantInstruction: 'Select or extract a template system and validate required named slots.',
    requiredContext: ['template choice', 'slot requirements'],
  },
  {
    intent: 'select_smart_blocks',
    keywords: ['smart block', 'section', 'case study', 'metrics', 'roadmap', 'timeline', 'comparison', 'cta'],
    flowStep: 'outline_plan',
    functionCategory: 'layout',
    recommendedAction: 'Select Smart Blocks',
    assistantInstruction: 'Recommend Smart Blocks based on the user goal and audience, then map them to editable slide sections.',
    requiredContext: ['goal', 'audience', 'selected blocks'],
  },
  {
    intent: 'build_recipe',
    keywords: ['recipe', 'slide plan', 'outline', 'structure', 'arc', 'story'],
    flowStep: 'outline_plan',
    functionCategory: 'layout',
    recommendedAction: 'Build Deck Recipe',
    assistantInstruction: 'Create a deterministic deck recipe with slide purpose, inputs, editable regions, and checks.',
    requiredContext: ['title', 'goal', 'smart blocks'],
  },
  {
    intent: 'edit_slide',
    keywords: ['edit', 'change', 'replace', 'move', 'resize', 'crop', 'rewrite', 'remix'],
    flowStep: 'live_edit',
    functionCategory: 'live_edit',
    recommendedAction: 'Open live controls',
    assistantInstruction: 'Resolve the command to a live slide control and preserve existing editable data.',
    requiredContext: ['active slide', 'target region', 'requested edit'],
  },
  {
    intent: 'run_qa',
    keywords: ['qa', 'audit', 'check', 'review', 'fix issues', 'validate'],
    flowStep: 'qa_review',
    functionCategory: 'qa',
    recommendedAction: 'Run QA loop',
    assistantInstruction: 'Run source, brand, template, export, and human-review gates, then list fixes.',
    requiredContext: ['slides', 'brand state', 'source state'],
  },
  {
    intent: 'check_export',
    keywords: ['export', 'pptx', 'pdf', 'download', 'ready', 'handoff'],
    flowStep: 'export_ready',
    functionCategory: 'export',
    recommendedAction: 'Check export readiness',
    assistantInstruction: 'Run export fidelity and readiness checks before producing export files.',
    requiredContext: ['slides', 'QA report', 'export target'],
  },
  {
    intent: 'save_reuse',
    keywords: ['reuse', 'save', 'snapshot', 'history', 'version', 'system'],
    flowStep: 'publish_reuse',
    functionCategory: 'reuse',
    recommendedAction: 'Save reusable system',
    assistantInstruction: 'Save intelligence snapshot and event history so the deck can become a reusable system.',
    requiredContext: ['artifact id', 'events', 'final state'],
  },
];

export const routePresentationCommand = (command: string): PresentationCommandRoute => {
  const normalized = command.toLowerCase();
  const scored = commandMap.map((item) => {
    const matches = item.keywords.filter((keyword) => normalized.includes(keyword)).length;
    return { item, matches };
  }).sort((a, b) => b.matches - a.matches);

  const best = scored[0];
  if (!best || best.matches === 0) {
    return {
      intent: 'unknown',
      confidence: 0,
      flowStep: 'start_mode',
      functionCategory: 'creation',
      recommendedAction: 'Ask clarifying question',
      assistantInstruction: 'Ask the user whether they want to create, source, brand, edit, QA, export, or reuse a deck.',
      requiredContext: ['user intent'],
    };
  }

  return {
    intent: best.item.intent,
    confidence: Math.min(1, best.matches / 3),
    flowStep: best.item.flowStep,
    functionCategory: best.item.functionCategory,
    recommendedAction: best.item.recommendedAction,
    assistantInstruction: best.item.assistantInstruction,
    requiredContext: best.item.requiredContext,
  };
};

export const buildCommandRouterPromptBlock = () => [
  'PRESENTATION COMMAND ROUTER',
  'Route natural language user commands to the correct production function. Preserve source data, brand rules, editable regions, QA, and export readiness.',
  ...commandMap.map((item) => `- ${item.intent}: ${item.recommendedAction} -> ${item.assistantInstruction}`),
].join('\n');
