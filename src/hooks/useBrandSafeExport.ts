import { useCallback } from 'react';
import type { GeneratedAsset } from '@/types';
import type { BrandMode } from '@/types/brandProfile';
import { exportAssetsWithBrandPreflight } from '@/services/brandSafeExportService';
import { getActiveBrandMode, getActiveBrandProfile } from '@/services/brandProfileService';

interface UseBrandSafeExportOptions {
  eventName: string;
  assets: GeneratedAsset[];
  mode?: BrandMode;
}

export const useBrandSafeExport = ({ eventName, assets, mode }: UseBrandSafeExportOptions) => {
  const exportWithPreflight = useCallback(async (selectedAssetIds?: string[]) => {
    const activeProfile = getActiveBrandProfile();
    const activeMode = mode ?? getActiveBrandMode();
    const selectedAssets = selectedAssetIds?.length
      ? assets.filter((asset) => selectedAssetIds.includes(asset.id))
      : assets;

    return exportAssetsWithBrandPreflight({
      eventName,
      assets: selectedAssets,
      brandProfile: activeProfile,
      mode: activeMode,
      allowWarnings: activeMode !== 'locked',
    });
  }, [assets, eventName, mode]);

  return { exportWithPreflight };
};
