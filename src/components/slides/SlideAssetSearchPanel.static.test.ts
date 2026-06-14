import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(process.cwd(), 'src/components/slides/SlideAssetSearchPanel.tsx'), 'utf8');

describe('SlideAssetSearchPanel static contract', () => {
  it('keeps source filters available in the right-rail asset browser', () => {
    expect(source).toContain("{ value: 'all', label: 'All' }");
    expect(source).toContain("{ value: 'current', label: 'Slide' }");
    expect(source).toContain("{ value: 'brandImagery', label: 'Brand' }");
    expect(source).toContain("{ value: 'brandHub', label: 'Hub' }");
  });

  it('keeps source-aware category filtering and filter recovery affordances', () => {
    expect(source).toContain('sourceScopedAssets');
    expect(source).toContain('categoryCounts');
    expect(source).toContain('visibleCategoryFilter');
    expect(source).toContain('Clear filters');
    expect(source).toContain('Reset asset filters');
  });

  it('resets category scope when the source filter changes', () => {
    expect(source).toContain('handleSourceFilterChange');
    expect(source).toContain('setCategoryFilter(\'all\')');
    expect(source).toContain('onClick={() => handleSourceFilterChange(filter.value)}');
  });

  it('keeps brand, hub, and current slide assets in the same searchable asset model', () => {
    expect(source).toContain('Brand imagery');
    expect(source).toContain('BrandHub');
    expect(source).toContain('Active slide');
    expect(source).toContain('filteredAssets');
  });

  it('keeps web URL paste behavior guarded before applying to a slide', () => {
    expect(source).toContain('const isWebUrl');
    expect(source).toContain('canApplyUrl');
    expect(source).toContain('disabled={!canApplyUrl}');
    expect(source).toContain("if (e.key === 'Enter') applyUrl();");
  });
});
