import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('presentation asset static audit', () => {
  it('has a unified asset library with advanced packs', () => {
    expect(read('src/services/presentationUnifiedAssetLibraryService.ts')).toContain('PRESENTATION_ADVANCED_ASSET_PACKS');
    expect(read('src/config/editableTemplates/presentationAdvancedAssetPacks.ts')).toContain('data-viz-asset-pack');
  });

  it('has variants and extended systems', () => {
    expect(read('src/config/editableTemplates/presentationAssetVariations.ts')).toContain('subVariants');
    expect(read('src/config/editableTemplates/presentationExtendedSystemAssets.ts')).toContain('PRESENTATION_EXTENDED_SYSTEM_ASSETS');
  });

  it('has scaling rules and matrix coverage', () => {
    const scaling = read('src/services/presentationAssetScalingService.ts');
    expect(scaling).toContain('PRESENTATION_ASSET_SLOT_SCALE_RULES');
    expect(scaling).toContain('buildAssetScalingMatrix');
    expect(scaling).toContain('Never stretch exact logos');
  });
});
