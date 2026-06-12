import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { buildExactLogoGenerationInstruction, enforceExactLogoOnGeneratedContent, getLogoReferenceForGeneration, shouldApplyExactLogoOverlay } from './exactLogoEnforcementService';

describe('exactLogoEnforcementService', () => {
  it('does not pass logo references into the image model for visible assets', () => {
    const logoReference = getLogoReferenceForGeneration(AssetType.Banner, 'data:image/png;base64,abc', 'visible');

    expect(logoReference).toBeUndefined();
  });

  it('requires post-generation overlay when logo should be visible', () => {
    expect(shouldApplyExactLogoOverlay(AssetType.Banner, 'data:image/png;base64,abc', 'visible')).toBe(true);
    expect(shouldApplyExactLogoOverlay(AssetType.Banner, 'data:image/png;base64,abc', 'hidden')).toBe(false);
  });

  it('adds a hard no-drift instruction for visible logos', () => {
    const instruction = buildExactLogoGenerationInstruction(AssetType.Banner, 'data:image/png;base64,abc', 'visible');

    expect(instruction).toContain('EXACT LOGO HARD RULE');
    expect(instruction).toContain('Do not draw, recreate, trace, recolor, distort, or approximate');
    expect(instruction).toContain('deterministic overlay');
  });

  it('does not invent logos when no source is available', async () => {
    const result = await enforceExactLogoOnGeneratedContent({
      assetType: AssetType.Banner,
      content: 'https://example.com/generated.png',
      logoUrl: undefined,
      mode: 'visible',
    });

    expect(result.applied).toBe(false);
    expect(result.reason).toContain('No exact logo source');
  });
});
