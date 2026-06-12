import { afterEach, describe, expect, it } from 'vitest';
import { modernSaaS, hospitality, sportsEvent } from '@/brandPresets';
import { buildBrandStyleSystemPromptBlock, inferBrandStyleSystemIds, setBrandStyleSystemIds } from './brandStyleSystemService';

describe('brandStyleSystemService', () => {
  afterEach(() => {
    setBrandStyleSystemIds(modernSaaS.id, []);
  });

  it('infers product/enterprise style systems for SaaS-like brands', () => {
    const ids = inferBrandStyleSystemIds(modernSaaS);

    expect(ids).toContain('modular-campaign-system');
    expect(ids.some((id) => ['enterprise-precision', 'product-tech', 'abstract-transformation'].includes(id))).toBe(true);
  });

  it('infers hospitality and sports systems for matching presets', () => {
    expect(inferBrandStyleSystemIds(hospitality)).toContain('hospitality-warmth');
    expect(inferBrandStyleSystemIds(sportsEvent)).toContain('sports-energy');
  });

  it('builds a full brand set prompt block', () => {
    setBrandStyleSystemIds(modernSaaS.id, ['enterprise-precision', 'modular-campaign-system']);
    const block = buildBrandStyleSystemPromptBlock(modernSaaS, []);

    expect(block).toContain('FULL BRAND SET STYLE SYSTEMS');
    expect(block).toContain('Enterprise Precision');
    expect(block).toContain('Modular Campaign System');
    expect(block).toContain('banners, social, signage, badges');
  });
});
