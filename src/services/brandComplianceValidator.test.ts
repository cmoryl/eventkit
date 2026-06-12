import { describe, expect, it } from 'vitest';
import { validateAssetAgainstBrand } from './brandComplianceValidator';
import { modernSaaS } from '@/brandPresets';

describe('brandComplianceValidator', () => {
  it('approves an asset that uses approved colors and typography', () => {
    const result = validateAssetAgainstBrand({
      colors: ['#111827', '#2563EB'],
      fontFamilies: ['Inter'],
      hasLogo: true,
      exportDimensions: '1080x1080',
      mode: 'guided',
    }, modernSaaS);

    expect(result.approved).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(82);
  });

  it('blocks unknown colors in locked mode', () => {
    const result = validateAssetAgainstBrand({
      colors: ['#FF00FF'],
      fontFamilies: ['Inter'],
      hasLogo: true,
      exportDimensions: '1080x1080',
      mode: 'locked',
    }, modernSaaS);

    expect(result.approved).toBe(false);
    expect(result.issues.some((issue) => issue.category === 'color' && issue.severity === 'error')).toBe(true);
  });
});
