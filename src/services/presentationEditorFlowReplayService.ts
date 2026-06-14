import { presentationEditorCriticalUserFlows } from './presentationEditorUserFlowCombinationService';
import type { PresentationEditorActionId } from './presentationEditorActionContractService';

export interface PresentationEditorReplayState {
  hasDeck: boolean;
  hasBrand: boolean;
  hasEdits: boolean;
  logoChecked: boolean;
  qaPassed: boolean;
  exportChecked: boolean;
  exported: boolean;
  reusableSaved: boolean;
  presentationPreviewed: boolean;
  warnings: string[];
}

export interface PresentationEditorReplayResult {
  flowId: string;
  label: string;
  actions: PresentationEditorActionId[];
  finalState: PresentationEditorReplayState;
  pass: boolean;
}

const initialState = (): PresentationEditorReplayState => ({
  hasDeck: false,
  hasBrand: false,
  hasEdits: false,
  logoChecked: false,
  qaPassed: false,
  exportChecked: false,
  exported: false,
  reusableSaved: false,
  presentationPreviewed: false,
  warnings: [],
});

export const applyPresentationEditorReplayAction = (state: PresentationEditorReplayState, action: PresentationEditorActionId): PresentationEditorReplayState => {
  const next = { ...state, warnings: [...state.warnings] };

  if (action.startsWith('create_')) next.hasDeck = true;
  if (action.startsWith('edit_')) next.hasEdits = true;
  if (action === 'brand_assets' || action === 'brand_apply_theme' || action === 'brand_repair') next.hasBrand = true;
  if (action === 'brand_logo_check') next.logoChecked = true;
  if (action === 'review_run_qa') {
    if (!next.hasDeck) next.warnings.push('QA blocked: no deck exists.');
    next.qaPassed = next.hasDeck;
  }
  if (action === 'review_fix_issues') next.hasEdits = true;
  if (action === 'review_export_check') {
    if (!next.qaPassed) next.warnings.push('Export preflight blocked: QA has not passed.');
    next.exportChecked = next.qaPassed;
  }
  if (action === 'view_present') {
    if (!next.hasDeck) next.warnings.push('Present blocked: no deck exists.');
    next.presentationPreviewed = next.hasDeck;
  }
  if (action.startsWith('reuse_')) next.reusableSaved = true;

  if (action === 'review_export_pptx') {
    if (!next.hasDeck) next.warnings.push('Export blocked: no deck exists.');
    if (!next.qaPassed) next.warnings.push('Export blocked: QA has not passed.');
    if (!next.exportChecked) next.warnings.push('Export blocked: export preflight has not passed.');
    next.exported = next.hasDeck && next.qaPassed && next.exportChecked;
  }

  return next;
};

export const replayPresentationEditorUserFlow = (flowId: string): PresentationEditorReplayResult => {
  const flow = presentationEditorCriticalUserFlows.find((item) => item.id === flowId);
  if (!flow) throw new Error(`Unknown editor user flow: ${flowId}`);
  const finalState = flow.actions.reduce(applyPresentationEditorReplayAction, initialState());
  const includesExportAction = flow.actions.includes('review_export_pptx');
  const exportReady = finalState.hasDeck && finalState.qaPassed && finalState.exportChecked && finalState.warnings.length === 0;
  const pass = flow.exportSafe ? (includesExportAction ? finalState.exported && finalState.warnings.length === 0 : exportReady) : !finalState.exported;
  return { flowId: flow.id, label: flow.label, actions: flow.actions, finalState, pass };
};

export const replayAllPresentationEditorUserFlows = () => presentationEditorCriticalUserFlows.map((flow) => replayPresentationEditorUserFlow(flow.id));

export const validatePresentationEditorReplaySuite = () => {
  const results = replayAllPresentationEditorUserFlows();
  return {
    pass: results.every((result) => result.pass),
    results,
    exportFlow: results.find((result) => result.flowId === 'blank-to-export'),
    warnings: results.flatMap((result) => result.finalState.warnings.map((warning) => `${result.flowId}: ${warning}`)),
  };
};
