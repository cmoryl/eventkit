import { describe, expect, it } from 'vitest';
import { AssetType } from '@/types';
import { modernSaaS } from '@/brandPresets';
import { getBrandAssetGenerationContext, saveBrandGuideAsset, writeBrandGuideAssets } from './brandAssetLibraryService';
import { auditExactLogoForAsset, auditLogoConsistencyAcrossAssets } from './logoConsistencyAuditService';

describe('logoConsistencyAuditService', () => {
  it('passes core assets when an exact source logo exists', () => {
    writeBrandGuideAssets([]);
    saveBrandGuideAsset({
      id: 'logo-audit-source',
      brandProfileId: modernSaaS.id,
      name: 'Audit Primary Logo',
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
    const report = auditLogoConsistencyAcrossAssets({
      brandAssetContext: context,
      mode: 'visible',
      assetTypes: [AssetType.Banner, AssetType.EventSignage, AssetType.NameTag, AssetType.SocialPost],
    });

    expect(report.fail).toBe(0);
    expect(report.rows.every((row) => row.modelReceivesLogo === false)).toBe(true);
    expect(report.rows.every((row) => row.overlayRequired === true)).toBe(true);
    expect(report.rows.every((row) => row.hardRulePresent === true)).toBe(true);

    writeBrandGuideAssets([]);
  });

  it('fails visible-logo assets when no exact source logo is available', () => {
    const context = getBrandAssetGenerationContext('missing-logo-brand');
    const row = auditExactLogoForAsset({
      assetType: AssetType.Banner,
      mode: 'visible',
      logoUrl: context.primaryLogo?.dataUrl,
    });

    expect(row.status).toBe('fail');
    expect(row.issues.join(' ')).toContain('no exact source logo');
  });

  it('passes hidden mode without overlay', () => {
    const row = auditExactLogoForAsset({
      assetType: AssetType.Banner,
      mode: 'hidden',
      logoUrl: 'data:image/png;base64,abc',
    });

    expect(row.status).toBe('pass');
    expect(row.overlayRequired).toBe(false);
    expect(row.modelReceivesLogo).toBe(false);
  });
});
