import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { buildGenerationQualityPromptBlock, getAssetGenerationContract } from './generationQualityService';

describe('generationQualityService', () => {
  it('returns a specific contract for core asset types', () => {
    const contract = getAssetGenerationContract(AssetType.SocialPost);

    expect(contract.family).toBe('social');
    expect(contract.mustHave.length).toBeGreaterThan(0);
    expect(contract.productionChecks.join(' ')).toContain('mobile');
  });

  it('builds a production quality prompt block', () => {
    const block = buildGenerationQualityPromptBlock(AssetType.EventSignage, 'locked');

    expect(block).toContain('GENERATION QUALITY CONTRACT');
    expect(block).toContain('COMPLIANCE MODE: locked');
    expect(block).toContain('MUST AVOID');
  });
});
