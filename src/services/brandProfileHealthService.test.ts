import { describe, expect, it } from 'vitest';
import { blankCustomBrand, modernSaaS } from '@/brandPresets';
import { evaluateBrandProfileHealth } from './brandProfileHealthService';

describe('brandProfileHealthService', () => {
  it('scores mature preset profiles higher than incomplete profiles', () => {
    const mature = evaluateBrandProfileHealth(modernSaaS);
    const incomplete = evaluateBrandProfileHealth(blankCustomBrand);

    expect(mature.score).toBeGreaterThan(incomplete.score);
    expect(mature.passCount).toBeGreaterThan(0);
  });

  it('returns recommendations for incomplete brand profiles', () => {
    const result = evaluateBrandProfileHealth(blankCustomBrand);

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.failCount + result.warningCount).toBeGreaterThan(0);
  });
});
