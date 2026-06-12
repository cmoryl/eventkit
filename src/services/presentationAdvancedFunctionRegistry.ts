export type PresentationAdvancedFunctionCategory =
  | 'creation'
  | 'source'
  | 'brand'
  | 'template'
  | 'layout'
  | 'live_edit'
  | 'qa'
  | 'export'
  | 'reuse'
  | 'analytics';

export interface PresentationAdvancedFunction {
  id: string;
  category: PresentationAdvancedFunctionCategory;
  label: string;
  description: string;
  userValue: string;
  poweredBy: string[];
  status: 'available' | 'planned' | 'experimental';
}

export const presentationAdvancedFunctions: PresentationAdvancedFunction[] = [
  {
    id: 'multi-path-creation',
    category: 'creation',
    label: 'Multi-path creation',
    description: 'Generate, paste, import, template, or agent-guided creation modes.',
    userValue: 'Users can start the way they naturally work instead of forcing one prompt box.',
    poweredBy: ['presentationGammaWorkflowService', 'ModeCards', 'GammaDeckStylePicker'],
    status: 'available',
  },
  {
    id: 'source-intelligence',
    category: 'source',
    label: 'Source intelligence',
    description: 'Understand PDF, PPTX, BrandHub, pasted notes, and source influence.',
    userValue: 'Turns existing materials into deck structure without losing source accountability.',
    poweredBy: ['SourceSheet', 'presentationStudioRuntimeContextService', 'presentationEventHistoryService'],
    status: 'available',
  },
  {
    id: 'brand-brain-lock',
    category: 'brand',
    label: 'Brand Brain lock',
    description: 'Apply brand guide assets, colors, fonts, style systems, prompt overrides, and exact logo policy.',
    userValue: 'Corporate decks stay on brand without manually policing every slide.',
    poweredBy: ['presentationDeckBrainService', 'logoVisibilityService', 'brandStyleSystemService'],
    status: 'available',
  },
  {
    id: 'template-slot-engine',
    category: 'template',
    label: 'Template slot engine',
    description: 'Named template slots with required checks, fallbacks, limits, and asset-safety rules.',
    userValue: 'Templates become reliable production systems, not loose prompt suggestions.',
    poweredBy: ['presentationTemplateSlotService'],
    status: 'available',
  },
  {
    id: 'content-graph-authoring',
    category: 'layout',
    label: 'Content graph authoring',
    description: 'Represent decks as pages, cards, and blocks while preserving fixed export frames.',
    userValue: 'Combines fluid AI-native authoring with PowerPoint-safe output.',
    poweredBy: ['presentationContentGraphService'],
    status: 'available',
  },
  {
    id: 'live-control-system',
    category: 'live_edit',
    label: 'Live control system',
    description: 'Toolbar, control dock, resolver, and slide-specific editing actions.',
    userValue: 'Users get direct control of slide areas instead of regenerating the whole deck.',
    poweredBy: ['presentationLiveControlResolver', 'LiveSlideControlDock', 'LivePresentationControlPanel'],
    status: 'available',
  },
  {
    id: 'agent-qa-loop',
    category: 'qa',
    label: 'Agent QA loop',
    description: 'Source, brand, template, export, and human-review QA gates.',
    userValue: 'Decks get production checks before leaving the studio.',
    poweredBy: ['presentationAgentQALoopService', 'AgentQALoopPanel'],
    status: 'available',
  },
  {
    id: 'export-readiness',
    category: 'export',
    label: 'Export readiness',
    description: 'Final readiness decision from Agent QA and export fidelity checks.',
    userValue: 'Users know if a PPTX/PDF export is safe before sending it.',
    poweredBy: ['presentationExportReadinessService', 'PresentationExportReadinessPanel'],
    status: 'available',
  },
  {
    id: 'event-history',
    category: 'analytics',
    label: 'Event history',
    description: 'Track source, brand, template, generation, editing, QA, review, and export events.',
    userValue: 'Creates an enterprise audit trail for presentation production.',
    poweredBy: ['presentationEventHistoryService', 'presentationIntelligenceCloudService'],
    status: 'available',
  },
  {
    id: 'deck-system-reuse',
    category: 'reuse',
    label: 'Deck system reuse',
    description: 'Save intelligence snapshots, reusable template logic, and event history for future decks.',
    userValue: 'One good deck can become a reusable branded production system.',
    poweredBy: ['presentationIntelligenceLifecycleService', 'presentation_intelligence_snapshots'],
    status: 'available',
  },
];

export const getPresentationAdvancedFunctionsByCategory = (category: PresentationAdvancedFunctionCategory) =>
  presentationAdvancedFunctions.filter((fn) => fn.category === category);

export const buildPresentationAdvancedFunctionPromptBlock = () => [
  'PRESENTATION ADVANCED FUNCTION REGISTRY',
  'Use these functions to guide the user from AI-native creation to enterprise-ready PowerPoint production.',
  ...presentationAdvancedFunctions.map((fn) => `- ${fn.label} [${fn.category}]: ${fn.userValue} Powered by: ${fn.poweredBy.join(', ')}`),
].join('\n');
