import { AssetType } from '@/types';
import type { BrandAssetGenerationContext } from './brandAssetLibraryService';
import type { LogoVisibilityMode } from './logoVisibilityService';
import { getLogoPlacementConstraints, getLogoVisibilityDecision } from './logoVisibilityService';
import { buildExactLogoGenerationInstruction, getLogoReferenceForGeneration, shouldApplyExactLogoOverlay } from './exactLogoEnforcementService';
import { positionFromAssetType, scaleFromAssetType } from './logoCompositor';

export type LogoAuditStatus = 'pass' | 'warn' | 'fail';

export interface LogoConsistencyAuditRow {
  assetType: AssetType;
  requirement: string;
  status: LogoAuditStatus;
  hasLogoSource: boolean;
  modelReceivesLogo: boolean;
  overlayRequired: boolean;
  overlayPosition: string;
  overlayScale: number;
  hardRulePresent: boolean;
  issues: string[];
  recommendation: string;
}

export interface LogoConsistencyAuditReport {
  mode: LogoVisibilityMode;
  primaryLogoName?: string;
  total: number;
  pass: number;
  warn: number;
  fail: number;
  rows: LogoConsistencyAuditRow[];
  summary: string;
}

export const defaultLogoAuditAssets: AssetType[] = [
  AssetType.Banner,
  AssetType.EmailHeader,
  AssetType.EventSignage,
  AssetType.RoomSignage,
  AssetType.NameTag,
  AssetType.Lanyard,
  AssetType.SocialPost,
  AssetType.SocialStory,
  AssetType.PresentationSlide,
  AssetType.BackWall,
  AssetType.Tshirt,
  AssetType.WifiSign,
  AssetType.QRCode,
];

const isVisibleRequirement = (requirement: string) => ['required', 'visible', 'optional'].includes(requirement);

export const auditExactLogoForAsset = (args: {
  assetType: AssetType;
  logoUrl?: string;
  mode: LogoVisibilityMode;
}): LogoConsistencyAuditRow => {
  const { assetType, logoUrl, mode } = args;
  const decision = getLogoVisibilityDecision(assetType, mode, Boolean(logoUrl));
  const constraints = getLogoPlacementConstraints(assetType, decision.requirement === 'hidden');
  const logoReferenceForModel = getLogoReferenceForGeneration(assetType, logoUrl, mode);
  const modelReceivesLogo = Boolean(logoReferenceForModel);
  const overlayRequired = shouldApplyExactLogoOverlay(assetType, logoUrl, mode);
  const instruction = buildExactLogoGenerationInstruction(assetType, logoUrl, mode);
  const hardRulePresent = instruction.includes('EXACT LOGO HARD RULE') && instruction.includes('deterministic overlay');
  const issues: string[] = [];

  if (isVisibleRequirement(decision.requirement) && !logoUrl) {
    issues.push('Visible logo policy is active but no exact source logo is available.');
  }

  if (modelReceivesLogo) {
    issues.push('Logo reference is being passed into the image model. This can create logo drift.');
  }

  if (decision.shouldShowLogo && logoUrl && !overlayRequired) {
    issues.push('Logo should be visible but deterministic overlay is not required.');
  }

  if (decision.shouldShowLogo && logoUrl && !hardRulePresent) {
    issues.push('Exact logo hard-rule instruction is missing or incomplete.');
  }

  if (decision.requirement === 'hidden' && overlayRequired) {
    issues.push('Logo overlay is active even though logo visibility is hidden.');
  }

  if (decision.shouldShowLogo && constraints.maxWidthPercent <= 0) {
    issues.push('Logo should show, but placement constraints suppress the logo size.');
  }

  const status: LogoAuditStatus = issues.some((issue) => issue.includes('no exact source') || issue.includes('passed into the image model'))
    ? 'fail'
    : issues.length
      ? 'warn'
      : 'pass';

  return {
    assetType,
    requirement: decision.requirement,
    status,
    hasLogoSource: Boolean(logoUrl),
    modelReceivesLogo,
    overlayRequired,
    overlayPosition: positionFromAssetType(assetType),
    overlayScale: Math.min(decision.constraints.maxWidthPercent / 100, scaleFromAssetType(assetType)),
    hardRulePresent,
    issues,
    recommendation: status === 'pass'
      ? 'Exact logo path is correct: AI reserves space and deterministic overlay uses the source logo.'
      : 'Set a primary source logo, keep logo mode Auto/Visible, and ensure generated image output is a compositable image URL/data URL.',
  };
};

export const auditLogoConsistencyAcrossAssets = (args: {
  brandAssetContext: BrandAssetGenerationContext;
  sessionLogoUrl?: string;
  mode: LogoVisibilityMode;
  assetTypes?: AssetType[];
}): LogoConsistencyAuditReport => {
  const { brandAssetContext, sessionLogoUrl, mode, assetTypes = defaultLogoAuditAssets } = args;
  const logoUrl = sessionLogoUrl || brandAssetContext.primaryLogo?.dataUrl;
  const rows = assetTypes.map((assetType) => auditExactLogoForAsset({ assetType, logoUrl, mode }));
  const pass = rows.filter((row) => row.status === 'pass').length;
  const warn = rows.filter((row) => row.status === 'warn').length;
  const fail = rows.filter((row) => row.status === 'fail').length;

  return {
    mode,
    primaryLogoName: brandAssetContext.primaryLogo?.name,
    total: rows.length,
    pass,
    warn,
    fail,
    rows,
    summary: fail > 0
      ? `${fail} asset type${fail === 1 ? '' : 's'} cannot guarantee exact logo output. Add/set a primary source logo and rerun.`
      : warn > 0
        ? `${warn} asset type${warn === 1 ? '' : 's'} need review, but no model-logo drift path was detected.`
        : `All ${rows.length} audited asset types use the exact-logo overlay path with no model-logo drift path detected.`,
  };
};

export const exportLogoConsistencyAuditJson = (report: LogoConsistencyAuditReport) => {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eventkit-logo-consistency-audit.json';
  link.click();
  URL.revokeObjectURL(url);
};
