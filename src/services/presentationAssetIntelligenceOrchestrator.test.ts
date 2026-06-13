import { describe, expect, it } from 'vitest';
import { getUnifiedPresentationAssetLibrary } from './presentationUnifiedAssetLibraryService';
import { getPresentationAssetReadinessReport } from './presentationAssetReadinessService';
import { validatePresentationAssetCandidate } from './presentationAssetValidationService';
import { buildPresentationAssetIntelligenceState } from './presentationAssetIntelligenceOrchestrator';
import { PRESENTATION_ASSET_VARIANT_FAMILIES } from '@/config/editableTemplates/presentationAssetVariations';
import { PRESENTATION_EXTENDED_SYSTEM_ASSETS } from '@/config/editableTemplates/presentationExtendedSystemAssets';

describe('presentation asset intelligence system', () => {
  it('combines starter kits and advanced asset packs into one library', () => {
    const library = getUnifiedPresentationAssetLibrary();
    expect(library.summary.starterKits).toBeGreaterThan(0);
    expect(library.summary.advancedPacks).toBeGreaterThan(0);
    expect(library.summary.totalKits).toBe(library.summary.starterKits + library.summary.advancedPacks);
    expect(library.summary.totalItems).toBe(library.items.length);
  });

  it('keeps every asset variant family usable with variants and sub-variants', () => {
    expect(PRESENTATION_ASSET_VARIANT_FAMILIES.length).toBeGreaterThanOrEqual(8);
    for (const family of PRESENTATION_ASSET_VARIANT_FAMILIES) {
      expect(family.variants.length).toBeGreaterThan(0);
      for (const variant of family.variants) {
        expect(variant.visualRules.length).toBeGreaterThan(0);
        expect(variant.subVariants.length).toBeGreaterThan(0);
      }
    }
  });

  it('keeps extended system assets complete enough for runtime display', () => {
    expect(PRESENTATION_EXTENDED_SYSTEM_ASSETS.length).toBeGreaterThanOrEqual(10);
    for (const asset of PRESENTATION_EXTENDED_SYSTEM_ASSETS) {
      expect(asset.components.length).toBeGreaterThan(0);
      expect(asset.variants.length).toBeGreaterThan(0);
      expect(asset.usageRules.length).toBeGreaterThan(0);
      expect(asset.promptHint.length).toBeGreaterThan(40);
    }
  });

  it('includes source governance in asset readiness scoring', () => {
    const report = getPresentationAssetReadinessReport();
    expect(report.areas.some((area) => area.id === 'source-governance')).toBe(true);
    expect(report.totals.advancedPacks).toBeGreaterThan(0);
    expect(report.totals.sourceGovernanceCoverage).toBeGreaterThanOrEqual(0);
  });

  it('fails logo assets that are not exact approved artwork', () => {
    const result = validatePresentationAssetCandidate({
      id: 'brand-primary-logo-svg',
      label: 'Primary approved logo',
      slot: 'logo',
      format: 'svg',
      width: 1200,
      height: 400,
      rightsStatus: 'approved',
      isExactLogo: false,
      hasAltText: true,
    });
    expect(result.status).toBe('fail');
    expect(result.issues.some((issue) => issue.code === 'logo.not_exact')).toBe(true);
  });

  it('builds one consolidated asset intelligence prompt block', () => {
    const state = buildPresentationAssetIntelligenceState({ query: 'executive data story' });
    expect(state.promptBlock).toContain('PRESENTATION ASSET INTELLIGENCE ORCHESTRATOR');
    expect(state.promptBlock).toContain('PRESENTATION ASSET READINESS AUDIT');
    expect(state.promptBlock).toContain('UNIFIED PRESENTATION ASSET LIBRARY');
    expect(state.promptBlock).toContain('EXTENDED PRESENTATION SYSTEM ASSETS');
  });
});
