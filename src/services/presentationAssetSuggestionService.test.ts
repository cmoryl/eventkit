import { describe, expect, it } from 'vitest';
import { getPresentationAssetSuggestionCount, getPresentationAssetSuggestions } from './presentationAssetSuggestionService';

describe('presentationAssetSuggestionService', () => {
  it('returns a count of registered asset kits and examples', () => {
    const count = getPresentationAssetSuggestionCount();
    expect(count.kits).toBeGreaterThan(0);
    expect(count.kitItems).toBeGreaterThan(0);
    expect(count.examples).toBeGreaterThan(0);
  });

  it('suggests product assets for the immersive product showcase template', () => {
    const result = getPresentationAssetSuggestions({ templateId: 'pres-immersive-product-showcase' });
    expect(result.kitItems.some((item) => item.slot === 'product-render')).toBe(true);
    expect(result.promptBlock).toContain('pres-immersive-product-showcase');
  });

  it('filters suggestions by slot', () => {
    const result = getPresentationAssetSuggestions({ slot: 'logo' });
    expect(result.kitItems.length).toBeGreaterThan(0);
    expect(result.kitItems.every((item) => item.slot === 'logo')).toBe(true);
  });

  it('filters suggestions by query', () => {
    const result = getPresentationAssetSuggestions({ query: 'dashboard' });
    expect(result.promptBlock.toLowerCase()).toContain('dashboard');
  });
});
