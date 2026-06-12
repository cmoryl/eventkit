import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { modernSaaS } from '@/brandPresets';
import { getAssetSetPreflightSummary, preflightAsset } from './assetPreflightService';

describe('assetPreflightService', () => {
  it('preflights a generated asset against a brand profile', () => {
    const result = preflightAsset({
      id: 'asset-1',
      type: AssetType.Palette,
      title: 'Palette',
      content: [],
      isLoading: false,
    }, modernSaaS, 'guided');

    expect(result.assetId).toBe('asset-1');
    expect(result.validation.overallScore).toBeGreaterThan(0);
  });

  it('summarizes a preflight result set', () => {
    const result = preflightAsset({
      id: 'asset-1',
      type: AssetType.Palette,
      title: 'Palette',
      content: [],
      isLoading: false,
    }, modernSaaS, 'guided');

    const summary = getAssetSetPreflightSummary([result]);
    expect(summary.overallScore).toBeGreaterThan(0);
    expect(summary.approvedCount + summary.reviewCount).toBe(1);
  });
});
