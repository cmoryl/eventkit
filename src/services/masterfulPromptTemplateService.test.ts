import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { buildMasterfulPromptTemplate, getMasterPromptFamily, inferBrandExpressionMode } from './masterfulPromptTemplateService';

const eventDetails = {
  name: 'Global Summit',
  description: 'A global leadership event.',
  date: '2026-09-01',
  location: 'New York',
  website: '',
  email: '',
  incorporateLocationStyle: false,
};

describe('masterfulPromptTemplateService', () => {
  it('maps core asset types into production families', () => {
    expect(getMasterPromptFamily(AssetType.Banner)).toBe('banner');
    expect(getMasterPromptFamily(AssetType.EventSignage)).toBe('signage');
    expect(getMasterPromptFamily(AssetType.NameTag)).toBe('badge');
    expect(getMasterPromptFamily(AssetType.Tshirt)).toBe('apparel');
    expect(getMasterPromptFamily(AssetType.WifiSign)).toBe('qr_wifi_functional');
    expect(getMasterPromptFamily(AssetType.PresentationSlide)).toBe('presentation');
  });

  it('builds an agency-grade prompt block with logo-safe and QA rules', () => {
    const result = buildMasterfulPromptTemplate({
      assetType: AssetType.Banner,
      eventDetails,
      colorPalette: ['#003B71', '#139DD8', '#FFFFFF'],
      hasExactLogoSource: true,
      hasVisualReferences: true,
      hasPatternReferences: true,
    });

    expect(result.family).toBe('banner');
    expect(result.renderMode).toBe('hybrid');
    expect(result.promptBlock).toContain('<master_template_system');
    expect(result.promptBlock).toContain('<layout_intelligence>');
    expect(result.promptBlock).toContain('deterministic overlay');
    expect(result.promptBlock).toContain('<qa_assertions>');
    expect(result.promptBlock).toContain('Use colors by role');
  });

  it('uses utility mode for functional assets', () => {
    expect(inferBrandExpressionMode(AssetType.WifiSign)).toBe('utility');
    const result = buildMasterfulPromptTemplate({
      assetType: AssetType.WifiSign,
      eventDetails,
      colorPalette: ['#003B71', '#139DD8'],
      hasExactLogoSource: true,
    });

    expect(result.renderMode).toBe('deterministic');
    expect(result.promptBlock).toContain('scanability');
    expect(result.promptBlock).toContain('quiet zone');
    expect(result.promptBlock).toContain('Function wins');
  });
});
