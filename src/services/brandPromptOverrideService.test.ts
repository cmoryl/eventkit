import { afterEach, describe, expect, it } from 'vitest';
import { buildBrandPromptOverrideBlock, createEmptyBrandPromptOverride, saveBrandPromptOverride, writeBrandPromptOverrides } from './brandPromptOverrideService';

describe('brandPromptOverrideService', () => {
  afterEach(() => {
    writeBrandPromptOverrides([]);
  });

  it('builds an approved override block for global and scoped rules', () => {
    const global = createEmptyBrandPromptOverride('brand-a', 'global');
    saveBrandPromptOverride({
      ...global,
      name: 'Global Brand Rule',
      status: 'approved',
      hierarchyRules: ['Use one primary message only.'],
      layoutRules: ['Keep a consistent footer brand band.'],
    });

    const banner = createEmptyBrandPromptOverride('brand-a', 'banner');
    saveBrandPromptOverride({
      ...banner,
      name: 'Banner Rule',
      status: 'approved',
      imageryRules: ['Use abstract transformation field as the hero background.'],
      negativeRules: ['No flyer-like clutter.'],
    });

    const block = buildBrandPromptOverrideBlock('brand-a', 'banner');

    expect(block).toContain('BRAND-SPECIFIC PROMPT OVERRIDES');
    expect(block).toContain('Global Brand Rule');
    expect(block).toContain('Banner Rule');
    expect(block).toContain('Use one primary message only.');
    expect(block).toContain('No flyer-like clutter.');
  });

  it('does not include drafts in the compiled override block', () => {
    const draft = createEmptyBrandPromptOverride('brand-a', 'social_post');
    saveBrandPromptOverride({
      ...draft,
      name: 'Draft Only',
      status: 'draft',
      layoutRules: ['This should not compile yet.'],
    });

    const block = buildBrandPromptOverrideBlock('brand-a', 'social_post');

    expect(block).toBe('');
  });
});
