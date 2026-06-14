import { describe, expect, it } from 'vitest';
import { buildPresentationEditorUserFlowMatrix, validatePresentationEditorUserFlowMatrix } from './presentationEditorUserFlowCombinationService';

describe('presentation editor end-to-end user flow combinations', () => {
  it('covers every possible pairwise editor function combination', () => {
    const matrix = buildPresentationEditorUserFlowMatrix();
    const expectedPairwiseCount = (matrix.summary.actionCount * (matrix.summary.actionCount - 1)) / 2;
    expect(matrix.summary.pairwiseCount).toBe(expectedPairwiseCount);
    expect(matrix.pairwiseCombinations.length).toBe(expectedPairwiseCount);
  });

  it('includes every editor action in the combination matrix', () => {
    const matrix = buildPresentationEditorUserFlowMatrix();
    for (const action of matrix.actions) {
      expect(matrix.pairwiseCombinations.some((combo) => combo.actions.some((item) => item.id === action.id))).toBe(true);
    }
  });

  it('keeps export-gated actions high risk in combination testing', () => {
    const matrix = buildPresentationEditorUserFlowMatrix();
    const gated = matrix.pairwiseCombinations.filter((combo) => combo.actions.some((action) => action.blocksExportUntilComplete));
    expect(gated.length).toBeGreaterThan(0);
    expect(gated.every((combo) => combo.risk === 'high')).toBe(true);
  });

  it('validates critical editor flows from creation through QA/export', () => {
    const validation = validatePresentationEditorUserFlowMatrix();
    expect(validation.pass).toBe(true);
    expect(validation.missingHooks).toHaveLength(0);
    expect(validation.missingCriticalActions).toHaveLength(0);
    expect(validation.exportFlowSafe).toBe(true);
  });
});
