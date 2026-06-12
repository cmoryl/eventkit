import { describe, expect, it } from 'vitest';
import type { AssetPreflightResult } from './assetPreflightService';
import { getBrandExportDecision } from './brandExportPolicy';

const baseResult: AssetPreflightResult = {
  assetId: 'a1',
  assetTitle: 'Asset 1',
  assetType: 'SOCIAL_POST',
  validation: {
    overallScore: 100,
    colorScore: 100,
    typographyScore: 100,
    logoScore: 100,
    layoutScore: 100,
    accessibilityScore: 100,
    exportReadinessScore: 100,
    brandDriftScore: 100,
    issues: [],
    approved: true,
  },
};

describe('brandExportPolicy', () => {
  it('approves clean results', () => {
    const decision = getBrandExportDecision([baseResult], 'guided');
    expect(decision.status).toBe('approved');
    expect(decision.canExport).toBe(true);
  });

  it('blocks locked mode errors', () => {
    const decision = getBrandExportDecision([
      {
        ...baseResult,
        validation: {
          ...baseResult.validation,
          approved: false,
          issues: [{ severity: 'error', category: 'color', message: 'Bad color' }],
        },
      },
    ], 'locked');

    expect(decision.status).toBe('blocked');
    expect(decision.canExport).toBe(false);
  });
});
