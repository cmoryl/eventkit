import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { getLogoPlacementMatrix, summarizeLogoPlacementMatrix } from './logoPlacementMatrixService';

describe('logoPlacementMatrixService', () => {
  it('builds a matrix for selected asset types', () => {
    const rows = getLogoPlacementMatrix('auto', true, [AssetType.Banner, AssetType.SocialPost, AssetType.QRCode]);

    expect(rows).toHaveLength(3);
    expect(rows[0].assetType).toBe(AssetType.Banner);
    expect(rows[0].productionRecommendation).toContain(rows[0].assetTitle);
  });

  it('summarizes logo requirements', () => {
    const rows = getLogoPlacementMatrix('auto', true, [AssetType.Banner, AssetType.SocialPost, AssetType.QRCode]);
    const summary = summarizeLogoPlacementMatrix(rows);

    expect(summary.total).toBe(3);
    expect(summary.required).toBe(1);
    expect(summary.optional).toBe(1);
    expect(summary.hidden).toBe(1);
  });

  it('suppresses every row in hidden mode', () => {
    const rows = getLogoPlacementMatrix('hidden', true, [AssetType.Banner, AssetType.SocialPost]);

    expect(rows.every((row) => row.requirement === 'hidden')).toBe(true);
    expect(rows.every((row) => row.shouldPassLogoReference === false)).toBe(true);
  });
});
