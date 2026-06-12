import { afterEach, describe, expect, it } from 'vitest';
import { modernSaaS } from '@/brandPresets';
import { getBrandAssetGenerationContext, saveBrandGuideAsset, writeBrandGuideAssets } from './brandAssetLibraryService';

describe('brandAssetLibraryService', () => {
  afterEach(() => {
    writeBrandGuideAssets([]);
  });

  it('builds a generation context from saved brand guide assets', () => {
    saveBrandGuideAsset({
      id: 'logo-1',
      brandProfileId: modernSaaS.id,
      name: 'Primary Logo',
      fileName: 'logo.svg',
      mimeType: 'image/svg+xml',
      dataUrl: 'data:image/svg+xml;base64,abc',
      type: 'primary-logo',
      usage: 'logo-overlay',
      tags: ['approved'],
      isPrimary: true,
      createdAt: new Date().toISOString(),
    });

    saveBrandGuideAsset({
      id: 'photo-1',
      brandProfileId: modernSaaS.id,
      name: 'Hero Visual',
      fileName: 'hero.png',
      mimeType: 'image/png',
      dataUrl: 'data:image/png;base64,def',
      type: 'photography',
      usage: 'generation-reference',
      tags: ['hero'],
      createdAt: new Date().toISOString(),
    });

    const context = getBrandAssetGenerationContext(modernSaaS.id, modernSaaS);

    expect(context.primaryLogo?.id).toBe('logo-1');
    expect(context.visualReferences).toHaveLength(1);
    expect(context.promptBlock).toContain('BRAND GUIDE ASSET LIBRARY');
    expect(context.promptBlock).toContain('Do not redraw, mutate, or approximate any uploaded logo');
  });
});
