import { describe, expect, it } from 'vitest';
import { buildPresentationAssetDropZonePromptBlock, getPresentationAssetDropZoneSummary, getPresentationAssetDropZones } from './presentationAssetDropZoneService';

describe('presentationAssetDropZoneService', () => {
  it('summarizes presentation asset drop zones', () => {
    const summary = getPresentationAssetDropZoneSummary();
    expect(summary.templatesWithDropZones).toBeGreaterThan(0);
    expect(summary.totalDropZones).toBeGreaterThan(0);
    expect(summary.imageZones + summary.logoZones + summary.iconZones + summary.qrZones).toBe(summary.totalDropZones);
  });

  it('finds drop zones for the immersive product showcase', () => {
    const maps = getPresentationAssetDropZones('pres-immersive-product-showcase');
    expect(maps).toHaveLength(1);
    expect(maps[0].zones.some((zone) => zone.fieldId === 'product-render')).toBe(true);
  });

  it('builds a prompt block with valid field ids', () => {
    const promptBlock = buildPresentationAssetDropZonePromptBlock('pres-resource-qr-cta');
    expect(promptBlock).toContain('PRESENTATION ASSET DROP ZONES');
    expect(promptBlock).toContain('qr-code');
  });
});
