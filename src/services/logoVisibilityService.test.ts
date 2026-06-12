import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { buildLogoVisibilityPromptBlock, getLogoVisibilityDecision } from './logoVisibilityService';

describe('logoVisibilityService', () => {
  it('requires logos on core brand-facing assets in auto mode', () => {
    const decision = getLogoVisibilityDecision(AssetType.Banner, 'auto', true);

    expect(decision.requirement).toBe('required');
    expect(decision.shouldShowLogo).toBe(true);
    expect(decision.shouldPassLogoReference).toBe(true);
  });

  it('hides logos when the user selects hidden mode', () => {
    const decision = getLogoVisibilityDecision(AssetType.Banner, 'hidden', true);

    expect(decision.requirement).toBe('hidden');
    expect(decision.shouldShowLogo).toBe(false);
    expect(decision.shouldPassLogoReference).toBe(false);
  });

  it('builds a strict no-logo prompt block when hidden', () => {
    const block = buildLogoVisibilityPromptBlock(AssetType.SocialPost, true, 'hidden');

    expect(block).toContain('LOGO_VISIBILITY: hidden');
    expect(block).toContain('do not show any logo');
    expect(block).toContain('brand look and feel');
  });
});
