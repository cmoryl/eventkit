import { AssetType } from '@/types';
import { getAssetConfig } from '@/config/assetConfig';
import type { LogoPlacementPriority, LogoVisibilityMode, LogoVisibilityRequirement } from './logoVisibilityService';
import { getLogoVisibilityDecision } from './logoVisibilityService';

export interface LogoPlacementMatrixRow {
  assetType: AssetType;
  assetTitle: string;
  category: string;
  visibilityMode: LogoVisibilityMode;
  requirement: LogoVisibilityRequirement;
  placementPriority: LogoPlacementPriority;
  shouldShowLogo: boolean;
  shouldPassLogoReference: boolean;
  preferredLocations: string[];
  avoidLocations: string[];
  maxWidthPercent: number;
  maxHeightPercent: number;
  safeAreaRule: string;
  clearSpaceRule: string;
  backgroundRule: string;
  scalingRule: string;
  productionRecommendation: string;
  hardStops: string[];
}

const buildProductionRecommendation = (row: {
  requirement: LogoVisibilityRequirement;
  priority: LogoPlacementPriority;
  assetTitle: string;
  preferredLocations: string[];
}) => {
  if (row.requirement === 'hidden') {
    return `${row.assetTitle}: suppress logo and preserve brand recognition through approved colors, typography, motif, imagery, and layout rhythm.`;
  }

  if (row.priority === 'primary') {
    return `${row.assetTitle}: logo can be a primary repeated or central brand element, but only with approved source artwork and safe spacing.`;
  }

  if (row.priority === 'tertiary') {
    return `${row.assetTitle}: logo should behave as a small trust mark; message/function remains the hero.`;
  }

  if (row.requirement === 'optional') {
    return `${row.assetTitle}: logo is optional; use it only if it improves recognition without reducing readability or production quality.`;
  }

  return `${row.assetTitle}: place logo in ${row.preferredLocations[0] || 'a safe logo zone'} with strict clear space and no alteration.`;
};

export const getLogoPlacementMatrix = (
  mode: LogoVisibilityMode = 'auto',
  hasLogo = true,
  assetTypes: AssetType[] = Object.values(AssetType)
): LogoPlacementMatrixRow[] => {
  return assetTypes.map((assetType) => {
    const config = getAssetConfig(assetType);
    const decision = getLogoVisibilityDecision(assetType, mode, hasLogo);

    const baseRow = {
      assetType,
      assetTitle: config?.title || assetType.replace(/_/g, ' '),
      category: config?.category || 'uncategorized',
      visibilityMode: mode,
      requirement: decision.requirement,
      placementPriority: decision.constraints.priority,
      shouldShowLogo: decision.shouldShowLogo,
      shouldPassLogoReference: decision.shouldPassLogoReference,
      preferredLocations: decision.constraints.preferredLocations,
      avoidLocations: decision.constraints.avoidLocations,
      maxWidthPercent: decision.constraints.maxWidthPercent,
      maxHeightPercent: decision.constraints.maxHeightPercent,
      safeAreaRule: decision.constraints.safeAreaRule,
      clearSpaceRule: decision.constraints.clearSpaceRule,
      backgroundRule: decision.constraints.backgroundRule,
      scalingRule: decision.constraints.scalingRule,
      hardStops: decision.constraints.hardStops,
    };

    return {
      ...baseRow,
      productionRecommendation: buildProductionRecommendation({
        requirement: baseRow.requirement,
        priority: baseRow.placementPriority,
        assetTitle: baseRow.assetTitle,
        preferredLocations: baseRow.preferredLocations,
      }),
    };
  });
};

export const summarizeLogoPlacementMatrix = (rows: LogoPlacementMatrixRow[]) => ({
  total: rows.length,
  required: rows.filter((row) => row.requirement === 'required').length,
  visible: rows.filter((row) => row.requirement === 'visible').length,
  optional: rows.filter((row) => row.requirement === 'optional').length,
  hidden: rows.filter((row) => row.requirement === 'hidden').length,
  passingLogoReference: rows.filter((row) => row.shouldPassLogoReference).length,
});

export const exportLogoPlacementMatrixJson = (rows: LogoPlacementMatrixRow[]) => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eventkit-logo-placement-matrix.json';
  link.click();
  URL.revokeObjectURL(url);
};

export const exportLogoPlacementMatrixCsv = (rows: LogoPlacementMatrixRow[]) => {
  const headers = [
    'assetType',
    'assetTitle',
    'category',
    'visibilityMode',
    'requirement',
    'placementPriority',
    'shouldShowLogo',
    'preferredLocations',
    'avoidLocations',
    'maxWidthPercent',
    'maxHeightPercent',
    'productionRecommendation',
  ];

  const escape = (value: unknown) => `"${String(Array.isArray(value) ? value.join('; ') : value ?? '').replace(/"/g, '""')}"`;
  const body = rows.map((row) => headers.map((header) => escape(row[header as keyof LogoPlacementMatrixRow])).join(',')).join('\n');
  const blob = new Blob([`${headers.join(',')}\n${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eventkit-logo-placement-matrix.csv';
  link.click();
  URL.revokeObjectURL(url);
};
