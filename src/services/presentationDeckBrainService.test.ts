import { describe, expect, it } from 'vitest';
import { modernSaaS } from '@/brandPresets';
import { writeBrandGuideAssets, saveBrandGuideAsset, getBrandAssetGenerationContext } from './brandAssetLibraryService';
import { buildPresentationDeckBrainPayload } from './presentationDeckBrainService';

describe('presentationDeckBrainService', () => {
  it('builds a deck brain payload with brand tokens, QA, and exact logo rules', () => {
    writeBrandGuideAssets([]);
    saveBrandGuideAsset({
      id: 'deck-brain-logo',
      brandProfileId: modernSaaS.id,
      name: 'Deck Brain Logo',
      fileName: 'logo.png',
      mimeType: 'image/png',
      dataUrl: 'data:image/png;base64,abc',
      type: 'primary-logo',
      usage: 'logo-overlay',
      tags: ['approved'],
      isPrimary: true,
      createdAt: new Date().toISOString(),
    });

    const context = getBrandAssetGenerationContext(modernSaaS.id, modernSaaS);
    const payload = buildPresentationDeckBrainPayload({
      profile: modernSaaS,
      brandAssetContext: context,
      exportProfile: 'executive_presentation',
      sourceKind: 'prompt',
    });

    expect(payload.version).toBe('1.0');
    expect(payload.brandProfileId).toBe(modernSaaS.id);
    expect(payload.hasExactLogoSource).toBe(true);
    expect(payload.primaryLogo?.placementPolicy).toBe('deterministic_powerpoint_layer');
    expect(payload.promptBlock).toContain('PRESENTATION DECK BRAIN');
    expect(payload.promptBlock).toContain('Do not redraw, approximate, recolor, distort, crop, or invent any logo');
    expect(payload.powerpointRules.some((rule) => rule.includes('editable PowerPoint'))).toBe(true);
    expect(payload.qaChecklist.length).toBeGreaterThan(5);

    writeBrandGuideAssets([]);
  });
});
