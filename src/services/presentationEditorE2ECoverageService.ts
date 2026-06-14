import { presentationEditorActionContracts } from './presentationEditorActionContractService';
import { validatePresentationEditorReplaySuite } from './presentationEditorFlowReplayService';
import { validatePresentationEditorUserFlowMatrix } from './presentationEditorUserFlowCombinationService';

export interface PresentationEditorE2ECoverageReport {
  verdict: 'ready' | 'review';
  score: number;
  actionCoverage: number;
  pairwiseCoverage: number;
  replayCoverage: number;
  exportGateCoverage: number;
  summary: string[];
}

export const buildPresentationEditorE2ECoverageReport = (): PresentationEditorE2ECoverageReport => {
  const matrix = validatePresentationEditorUserFlowMatrix();
  const replay = validatePresentationEditorReplaySuite();
  const actionCoverage = presentationEditorActionContracts.every((action) => action.currentSlideEditorHook && action.userFeedback) ? 100 : 0;
  const pairwiseCoverage = matrix.expectedPairwiseCount === 0 ? 0 : Math.round((matrix.actualPairwiseCount / matrix.expectedPairwiseCount) * 100);
  const replayCoverage = replay.pass ? 100 : 0;
  const exportGateCoverage = replay.exportFlow?.finalState.exported && matrix.exportFlowSafe ? 100 : 0;
  const score = Math.round((actionCoverage + pairwiseCoverage + replayCoverage + exportGateCoverage) / 4);
  const verdict = score >= 95 && matrix.pass && replay.pass ? 'ready' : 'review';

  return {
    verdict,
    score,
    actionCoverage,
    pairwiseCoverage,
    replayCoverage,
    exportGateCoverage,
    summary: [
      `Actions with canonical hooks: ${actionCoverage}%`,
      `Pairwise function combinations: ${matrix.actualPairwiseCount}/${matrix.expectedPairwiseCount}`,
      `Critical replay suite: ${replay.pass ? 'passed' : 'review'}`,
      `Export gate coverage: ${exportGateCoverage}%`,
    ],
  };
};

export const buildPresentationEditorE2ECoveragePromptBlock = () => {
  const report = buildPresentationEditorE2ECoverageReport();
  return [
    'PRESENTATION EDITOR E2E COVERAGE REPORT',
    `Verdict: ${report.verdict}`,
    `Score: ${report.score}`,
    ...report.summary.map((line) => `- ${line}`),
  ].join('\n');
};
