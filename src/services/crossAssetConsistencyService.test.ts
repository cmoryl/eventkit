import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { modernSaaS } from '@/brandPresets';
import { buildCrossAssetConsistencyPromptBlock, buildCrossAssetConsistencySystem } from './crossAssetConsistencyService';

describe('crossAssetConsistencyService', () => {
  it('builds a reusable multi-asset consistency system', () => {
    const system = buildCrossAssetConsistencySystem({
      eventDetails: { name: 'Launch Summit', description: 'A product launch event', date: '', location: '', website: '', email: '', incorporateLocationStyle: false },
      brandProfile: modernSaaS,
      mode: 'guided',
      colorPalette: [],
      assetTypes: [AssetType.Banner, AssetType.SocialPost, AssetType.NameTag, AssetType.Tshirt],
    });

    expect(system.visualSignature).toContain('Launch Summit');
    expect(system.globalAvoid.length).toBeGreaterThan(0);
    expect(system.assetFamilyRules.social.purpose).toContain('campaign');
  });

  it('creates an asset-family prompt block', () => {
    const system = buildCrossAssetConsistencySystem({
      eventDetails: { name: 'Launch Summit', description: 'A product launch event', date: '', location: '', website: '', email: '', incorporateLocationStyle: false },
      brandProfile: modernSaaS,
      mode: 'locked',
      colorPalette: [],
      assetTypes: [AssetType.EventSignage],
    });

    const block = buildCrossAssetConsistencyPromptBlock(system, AssetType.EventSignage);
    expect(block).toContain('CROSS-ASSET BRAND CONSISTENCY SYSTEM');
    expect(block).toContain('SIGNAGE');
    expect(block).toContain('same coordinated brand kit');
  });
});
