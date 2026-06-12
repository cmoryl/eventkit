import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { buildLogoVisibilityPromptBlock, getLogoPlacementConstraints, getLogoVisibilityDecision } from './logoVisibilityService';

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
    expect(decision.constraints.priority).toBe('suppressed');
  });

  it('builds a strict no-logo prompt block when hidden', () => {
    const block = buildLogoVisibilityPromptBlock(AssetType.SocialPost, true, 'hidden');

    expect(block).toContain('LOGO_VISIBILITY: hidden');
    expect(block).toContain('do not show any logo');
    expect(block).toContain('brand look and feel');
  });

  it('adds placement constraints for signage', () => {
    const constraints = getLogoPlacementConstraints(AssetType.EventSignage);

    expect(constraints.priority).toBe('tertiary');
    expect(constraints.preferredLocations.join(' ')).toContain('footer');
    expect(constraints.safeAreaRule).toContain('directional message');
  });

  it('includes best practices and hard stops in prompt blocks', () => {
    const block = buildLogoVisibilityPromptBlock(AssetType.NameTag, true, 'visible');

    expect(block).toContain('PLACEMENT CONSTRAINTS');
    expect(block).toContain('BEST PRACTICES');
    expect(block).toContain('HARD STOPS');
    expect(block).toContain('attendee name');
  });
});
