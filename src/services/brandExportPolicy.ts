import type { BrandMode } from '@/types/brandProfile';
import type { AssetPreflightResult } from './assetPreflightService';
import { getAssetSetPreflightSummary } from './assetPreflightService';

export interface BrandExportDecision {
  canExport: boolean;
  requiresAcknowledgement: boolean;
  status: 'approved' | 'warning' | 'blocked';
  message: string;
}

export const getBrandExportDecision = (
  results: AssetPreflightResult[],
  mode: BrandMode
): BrandExportDecision => {
  const summary = getAssetSetPreflightSummary(results);
  const hasErrors = results.some((result) => result.validation.issues.some((issue) => issue.severity === 'error'));
  const hasWarnings = results.some((result) => result.validation.issues.some((issue) => issue.severity === 'warning'));

  if (mode === 'locked' && hasErrors) {
    return {
      canExport: false,
      requiresAcknowledgement: false,
      status: 'blocked',
      message: `Export blocked. ${summary.blockingCount} asset(s) have locked brand errors.`,
    };
  }

  if (hasWarnings || hasErrors) {
    return {
      canExport: true,
      requiresAcknowledgement: true,
      status: 'warning',
      message: `Export allowed with review. ${summary.reviewCount} asset(s) need brand approval.`,
    };
  }

  return {
    canExport: true,
    requiresAcknowledgement: false,
    status: 'approved',
    message: 'Export approved. No blocking brand issues detected.',
  };
};
