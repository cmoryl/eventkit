import { describe, expect, it } from 'vitest';
import { getUnifiedPresentationAssetLibrary } from './presentationUnifiedAssetLibraryService';
import { buildAssetScalingMatrix, buildPresentationAssetScalePlan, PRESENTATION_ASSET_SLOT_SCALE_RULES, PRESENTATION_CANVAS_SIZES } from './presentationAssetScalingService';

describe('presentation asset scaling', () => {
  it('defines scaling rules for every slot used by the unified asset library', () => {
    const library = getUnifiedPresentationAssetLibrary();
    for (const item of library.items) {
      expect(PRESENTATION_ASSET_SLOT_SCALE_RULES[item.slot]).toBeDefined();
    }
  });

  it('tests every unified library asset across every supported canvas size', () => {
    const library = getUnifiedPresentationAssetLibrary();
    const matrix = buildAssetScalingMatrix();
    expect(matrix.totalAssets).toBe(library.items.length);
    expect(matrix.totalPlans).toBe(library.items.length * PRESENTATION_CANVAS_SIZES.length);
    expect(matrix.fail).toBe(0);
  });

  it('preserves aspect ratio for logo, sponsor-logo, and QR scale rules', () => {
    expect(PRESENTATION_ASSET_SLOT_SCALE_RULES.logo.preserveAspectRatio).toBe(true);
    expect(PRESENTATION_ASSET_SLOT_SCALE_RULES['sponsor-logo'].preserveAspectRatio).toBe(true);
    expect(PRESENTATION_ASSET_SLOT_SCALE_RULES.qr.preserveAspectRatio).toBe(true);
  });

  it('flags QR scaling for review when a canvas cannot support the required scan size', () => {
    const tinyCanvas = { id: 'tiny', label: 'Tiny', width: 320, height: 180 };
    const plan = buildPresentationAssetScalePlan('qr', tinyCanvas);
    expect(plan.status).toBe('review');
    expect(plan.issues.length).toBeGreaterThan(0);
  });

  it('keeps standard 16:9 logo sizing safe and non-distorted', () => {
    const canvas = PRESENTATION_CANVAS_SIZES.find((item) => item.id === 'wide-16-9');
    expect(canvas).toBeDefined();
    const plan = buildPresentationAssetScalePlan('logo', canvas!);
    expect(plan.status).toBe('pass');
    expect(plan.preserveAspectRatio).toBe(true);
    expect(plan.targetWidth).toBeLessThanOrEqual(canvas!.width * 0.28);
  });
});
