import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { ExportReadinessDecision } from './presentationExportReadinessService';

export type PresentationFlowStepId =
  | 'start_mode'
  | 'source_intake'
  | 'brand_lock'
  | 'template_system'
  | 'outline_plan'
  | 'deck_build'
  | 'live_edit'
  | 'qa_review'
  | 'export_ready'
  | 'publish_reuse';

export type PresentationFlowStepStatus = 'locked' | 'available' | 'active' | 'complete' | 'needs_attention';

export interface PresentationFlowStep {
  id: PresentationFlowStepId;
  label: string;
  status: PresentationFlowStepStatus;
  userGoal: string;
  systemFunction: string;
  actionLabel: string;
  successCriteria: string[];
}

export interface PresentationUserFlowInput {
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  hasTemplate?: boolean;
  hasOutline?: boolean;
  hasDeck?: boolean;
  hasEdits?: boolean;
  qaStatus?: 'pass' | 'warning' | 'fail';
  exportDecision?: ExportReadinessDecision;
  hasSavedSnapshot?: boolean;
}

const step = (input: PresentationFlowStep): PresentationFlowStep => input;

export const buildPresentationUserFlow = (input: PresentationUserFlowInput): PresentationFlowStep[] => {
  const brandReady = Boolean(input.hasBrandProfile && input.hasExactLogoSource);
  const deckReady = Boolean(input.hasDeck);
  const qaPassed = input.qaStatus === 'pass';
  const exportReady = input.exportDecision === 'ready' || input.exportDecision === 'ready_with_notes';

  return [
    step({
      id: 'start_mode',
      label: 'Choose creation path',
      status: 'complete',
      userGoal: `Start with ${input.creationMode} mode and ${input.deckStyle} deck style.`,
      systemFunction: 'presentationGammaWorkflowService',
      actionLabel: 'Set creation mode',
      successCriteria: ['Creation mode selected', 'Deck style selected', 'Workflow rules applied'],
    }),
    step({
      id: 'source_intake',
      label: 'Add source material',
      status: input.creationMode === 'generate' ? 'available' : input.hasSourceMaterial ? 'complete' : 'needs_attention',
      userGoal: 'Attach PDF, PPTX, BrandHub, pasted text, URL, or structured source notes.',
      systemFunction: 'presentationStudioRuntimeContextService',
      actionLabel: 'Attach source',
      successCriteria: ['Source attached or generation-only mode confirmed', 'Influence level set', 'Source summary available'],
    }),
    step({
      id: 'brand_lock',
      label: 'Lock brand system',
      status: brandReady ? 'complete' : input.hasBrandProfile ? 'needs_attention' : 'available',
      userGoal: 'Attach Brand Brain, exact logos, colors, fonts, and style rules.',
      systemFunction: 'presentationDeckBrainService',
      actionLabel: 'Lock brand',
      successCriteria: ['Brand profile attached', 'Exact logo source found', 'Prompt overrides included'],
    }),
    step({
      id: 'template_system',
      label: 'Choose template logic',
      status: input.hasTemplate ? 'complete' : 'available',
      userGoal: 'Choose a visual system and deterministic template slots.',
      systemFunction: 'presentationTemplateSlotService',
      actionLabel: 'Choose template',
      successCriteria: ['Template selected', 'Required slots known', 'Logo slots protected'],
    }),
    step({
      id: 'outline_plan',
      label: 'Plan outline',
      status: input.hasOutline ? 'complete' : brandReady ? 'available' : 'locked',
      userGoal: 'Generate an editable outline before building slides.',
      systemFunction: 'PowerPointAgent.planOutline',
      actionLabel: 'Generate outline',
      successCriteria: ['Slide plan produced', 'User can edit outline', 'Speaker-note intent included'],
    }),
    step({
      id: 'deck_build',
      label: 'Build deck',
      status: input.hasDeck ? 'complete' : input.hasOutline ? 'available' : 'locked',
      userGoal: 'Build editable slides from the approved outline and brand intelligence.',
      systemFunction: 'generate-deck',
      actionLabel: 'Build presentation',
      successCriteria: ['Editable slide objects created', 'Brand rules applied', 'Structured data retained'],
    }),
    step({
      id: 'live_edit',
      label: 'Live edit and control',
      status: deckReady ? (input.hasEdits ? 'complete' : 'available') : 'locked',
      userGoal: 'Edit slide content, data, imagery, layout, and brand-safe details in the live editor.',
      systemFunction: 'presentationLiveControlResolver',
      actionLabel: 'Open live controls',
      successCriteria: ['Live toolbar available', 'Right control panel available', 'Slide-specific controls resolved'],
    }),
    step({
      id: 'qa_review',
      label: 'Run QA loop',
      status: deckReady ? (qaPassed ? 'complete' : 'needs_attention') : 'locked',
      userGoal: 'Run source, brand, template, export, and human-review gates.',
      systemFunction: 'presentationAgentQALoopService',
      actionLabel: 'Run QA',
      successCriteria: ['Agent QA scored', 'Fixes listed', 'Human review state captured'],
    }),
    step({
      id: 'export_ready',
      label: 'Check export readiness',
      status: exportReady ? 'complete' : deckReady ? 'needs_attention' : 'locked',
      userGoal: 'Confirm PowerPoint/PDF output will be trustworthy before export.',
      systemFunction: 'presentationExportReadinessService',
      actionLabel: 'Check export',
      successCriteria: ['Export score produced', 'Required fixes known', 'Proceed decision available'],
    }),
    step({
      id: 'publish_reuse',
      label: 'Publish and reuse',
      status: input.hasSavedSnapshot ? 'complete' : exportReady ? 'available' : 'locked',
      userGoal: 'Export, save snapshot, preserve event history, and reuse the deck system.',
      systemFunction: 'presentationIntelligenceCloudService',
      actionLabel: 'Save and export',
      successCriteria: ['Snapshot saved', 'Event history saved', 'Deck can be reused as a system'],
    }),
  ];
};

export const getNextPresentationFlowStep = (steps: PresentationFlowStep[]) =>
  steps.find((item) => item.status === 'needs_attention') ||
  steps.find((item) => item.status === 'active') ||
  steps.find((item) => item.status === 'available') ||
  steps[steps.length - 1];
