import { presentationEditorActionContracts, type PresentationEditorActionContract, type PresentationEditorActionId } from './presentationEditorActionContractService';
import type { PresentationEditorActionGroupId } from './presentationEditorActionAuditService';

export interface PresentationEditorFunctionCombination {
  id: string;
  actions: [PresentationEditorActionContract, PresentationEditorActionContract];
  groups: PresentationEditorActionGroupId[];
  risk: 'low' | 'medium' | 'high';
  expectedBehavior: string;
}

export interface PresentationEditorCriticalUserFlow {
  id: string;
  label: string;
  actions: PresentationEditorActionId[];
  expectedOutcome: string;
  exportSafe: boolean;
}

export interface PresentationEditorUserFlowMatrix {
  actions: PresentationEditorActionContract[];
  pairwiseCombinations: PresentationEditorFunctionCombination[];
  criticalFlows: PresentationEditorCriticalUserFlow[];
  summary: {
    actionCount: number;
    pairwiseCount: number;
    groupCount: number;
    exportBlockingActions: number;
    criticalFlowCount: number;
  };
}

const getRisk = (a: PresentationEditorActionContract, b: PresentationEditorActionContract): PresentationEditorFunctionCombination['risk'] => {
  if (a.blocksExportUntilComplete || b.blocksExportUntilComplete) return 'high';
  if (a.group !== b.group) return 'medium';
  return 'low';
};

const getExpectedBehavior = (a: PresentationEditorActionContract, b: PresentationEditorActionContract) => {
  if (a.group === 'review_export' || b.group === 'review_export') {
    return 'Review/export actions must honor QA, logo, and export-readiness gates before file creation.';
  }
  if (a.group === 'brand_assets' || b.group === 'brand_assets') {
    return 'Brand and asset actions must preserve exact logos, approved themes, and safe-zone rules.';
  }
  if (a.group === 'edit_canvas' || b.group === 'edit_canvas') {
    return 'Canvas edits must preserve slide content, undo safety, selection state, and export structure.';
  }
  return 'Actions should route through the canonical action contract without creating duplicate UI logic.';
};

const buildPairwiseCombinations = (actions: PresentationEditorActionContract[]): PresentationEditorFunctionCombination[] => {
  const combinations: PresentationEditorFunctionCombination[] = [];
  for (let i = 0; i < actions.length; i += 1) {
    for (let j = i + 1; j < actions.length; j += 1) {
      const a = actions[i];
      const b = actions[j];
      combinations.push({
        id: `${a.id}__${b.id}`,
        actions: [a, b],
        groups: Array.from(new Set([a.group, b.group])),
        risk: getRisk(a, b),
        expectedBehavior: getExpectedBehavior(a, b),
      });
    }
  }
  return combinations;
};

export const presentationEditorCriticalUserFlows: PresentationEditorCriticalUserFlow[] = [
  {
    id: 'blank-to-export',
    label: 'Blank deck to export-ready PPTX',
    actions: ['create_ai_generate', 'brand_apply_theme', 'edit_layout', 'review_run_qa', 'review_export_check', 'review_export_pptx'],
    expectedOutcome: 'A new deck can be generated, branded, edited, QA checked, export checked, and exported.',
    exportSafe: true,
  },
  {
    id: 'template-to-branded-deck',
    label: 'Template selection to branded deck',
    actions: ['create_templates', 'brand_assets', 'brand_logo_check', 'edit_image', 'review_run_qa', 'review_export_check'],
    expectedOutcome: 'A selected template can receive approved brand assets and pass logo/export checks.',
    exportSafe: true,
  },
  {
    id: 'import-to-repair',
    label: 'Imported deck to repaired brand system',
    actions: ['create_import_pptx', 'brand_repair', 'edit_style', 'review_fix_issues', 'review_run_qa'],
    expectedOutcome: 'Imported slides can be repaired against the brand system and reviewed before export.',
    exportSafe: false,
  },
  {
    id: 'edit-and-reuse',
    label: 'Edit slide and save reusable system',
    actions: ['create_add_slide', 'edit_duplicate', 'edit_text', 'edit_layout', 'reuse_deck_recipe', 'reuse_save_template', 'reuse_save_snapshot'],
    expectedOutcome: 'A modified slide/deck can be turned into a reusable template, recipe, and snapshot.',
    exportSafe: false,
  },
  {
    id: 'view-present-review-loop',
    label: 'View, present, return to QA loop',
    actions: ['create_add_slide', 'view_grid', 'view_zoom', 'view_transitions', 'view_present', 'review_run_qa', 'review_fix_issues'],
    expectedOutcome: 'Presentation preview does not bypass the QA/fix loop.',
    exportSafe: false,
  },
];

export const buildPresentationEditorUserFlowMatrix = (): PresentationEditorUserFlowMatrix => {
  const actions = presentationEditorActionContracts;
  const pairwiseCombinations = buildPairwiseCombinations(actions);
  const groupCount = new Set(actions.map((action) => action.group)).size;
  return {
    actions,
    pairwiseCombinations,
    criticalFlows: presentationEditorCriticalUserFlows,
    summary: {
      actionCount: actions.length,
      pairwiseCount: pairwiseCombinations.length,
      groupCount,
      exportBlockingActions: actions.filter((action) => action.blocksExportUntilComplete).length,
      criticalFlowCount: presentationEditorCriticalUserFlows.length,
    },
  };
};

export const validatePresentationEditorUserFlowMatrix = () => {
  const matrix = buildPresentationEditorUserFlowMatrix();
  const expectedPairwiseCount = (matrix.actions.length * (matrix.actions.length - 1)) / 2;
  const missingHooks = matrix.actions.filter((action) => !action.currentSlideEditorHook || !action.userFeedback);
  const missingCriticalActions = matrix.criticalFlows.flatMap((flow) => flow.actions.filter((actionId) => !matrix.actions.some((action) => action.id === actionId)));
  const exportFlow = matrix.criticalFlows.find((flow) => flow.id === 'blank-to-export');
  const exportFlowSafe = Boolean(exportFlow?.actions.includes('review_run_qa') && exportFlow.actions.includes('review_export_check') && exportFlow.actions.includes('review_export_pptx'));

  return {
    pass: matrix.pairwiseCombinations.length === expectedPairwiseCount && missingHooks.length === 0 && missingCriticalActions.length === 0 && exportFlowSafe,
    expectedPairwiseCount,
    actualPairwiseCount: matrix.pairwiseCombinations.length,
    missingHooks,
    missingCriticalActions,
    exportFlowSafe,
    matrix,
  };
};

export const buildPresentationEditorUserFlowPromptBlock = () => {
  const validation = validatePresentationEditorUserFlowMatrix();
  return [
    'PRESENTATION EDITOR END-TO-END USER FLOW MATRIX',
    `Actions: ${validation.matrix.summary.actionCount}`,
    `Pairwise combinations: ${validation.actualPairwiseCount}/${validation.expectedPairwiseCount}`,
    `Critical flows: ${validation.matrix.summary.criticalFlowCount}`,
    `Export-safe flow: ${validation.exportFlowSafe ? 'yes' : 'no'}`,
    ...validation.matrix.criticalFlows.map((flow) => `- ${flow.label}: ${flow.actions.join(' -> ')}`),
  ].join('\n');
};
