import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('presentation asset scaling static coverage', () => {
  it('defines scaling rules for every key presentation asset slot', () => {
    const scaling = read('src/services/presentationAssetScalingService.ts');
    for (const slot of ['background', 'hero', 'logo', 'sponsor-logo', 'chart', 'qr', 'map', 'ui-panel']) {
      expect(scaling).toContain(`${slot}`);
    }
  });

  it('tests the supported canvas size matrix', () => {
    const scaling = read('src/services/presentationAssetScalingService.ts');
    expect(scaling).toContain('wide-16-9');
    expect(scaling).toContain('classic-4-3');
    expect(scaling).toContain('social-square');
    expect(scaling).toContain('social-vertical');
    expect(scaling).toContain('thumbnail');
    expect(scaling).toContain('buildAssetScalingMatrix');
  });

  it('protects logos, sponsor marks, QR codes, and charts from bad scaling', () => {
    const scaling = read('src/services/presentationAssetScalingService.ts');
    expect(scaling).toContain('Never stretch exact logos');
    expect(scaling).toContain('Must be scannable at export size');
    expect(scaling).toContain('Labels must remain readable');
    expect(scaling).toContain('preserveAspectRatio: true');
  });
});
