import { getUnifiedPresentationAssetLibrary } from './presentationUnifiedAssetLibraryService';
import type { PresentationAssetKitItem, PresentationAssetSlot } from '@/config/editableTemplates/presentationDragDropAssetKits';

export interface PresentationAssetCandidate {
  id: string;
  label: string;
  slot: PresentationAssetSlot;
  format?: string;
  width?: number;
  height?: number;
  source?: string;
  rightsStatus?: 'approved' | 'needs-review' | 'unknown' | 'restricted';
  isExactLogo?: boolean;
  hasAltText?: boolean;
  isQrScannable?: boolean;
  hasTransparentBackground?: boolean;
}

export interface PresentationAssetValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface PresentationAssetValidationResult {
  candidate: PresentationAssetCandidate;
  matchedLibraryItem?: PresentationAssetKitItem;
  score: number;
  status: 'pass' | 'review' | 'fail';
  issues: PresentationAssetValidationIssue[];
}

const preferredMinimums: Partial<Record<PresentationAssetSlot, { width: number; height: number }>> = {
  background: { width: 1920, height: 1080 },
  hero: { width: 1600, height: 900 },
  gallery: { width: 1200, height: 800 },
  product-render: { width: 1200, height: 900 },
  device-mockup: { width: 1400, height: 900 },
  chart: { width: 1200, height: 700 },
  map: { width: 1400, height: 800 },
  person: { width: 900, height: 900 },
  logo: { width: 600, height: 200 },
  'sponsor-logo': { width: 600, height: 200 },
  qr: { width: 600, height: 600 },
};

const exactLogoSlots: PresentationAssetSlot[] = ['logo', 'sponsor-logo'];

const scoreFromIssues = (issues: PresentationAssetValidationIssue[]) => {
  const penalty = issues.reduce((sum, issue) => {
    if (issue.severity === 'error') return sum + 35;
    if (issue.severity === 'warning') return sum + 15;
    return sum + 5;
  }, 0);
  return Math.max(0, 100 - penalty);
};

const statusFromScore = (score: number, issues: PresentationAssetValidationIssue[]): PresentationAssetValidationResult['status'] => {
  if (issues.some((issue) => issue.severity === 'error')) return 'fail';
  if (score < 85) return 'review';
  return 'pass';
};

export const validatePresentationAssetCandidate = (candidate: PresentationAssetCandidate): PresentationAssetValidationResult => {
  const library = getUnifiedPresentationAssetLibrary();
  const matchedLibraryItem = library.items.find((item) => item.id === candidate.id || item.label === candidate.label);
  const issues: PresentationAssetValidationIssue[] = [];

  if (!matchedLibraryItem) {
    issues.push({ severity: 'warning', code: 'asset.not_in_library', message: 'Asset is not registered in the unified presentation asset library.' });
  }

  if (matchedLibraryItem && candidate.format && !matchedLibraryItem.formats.includes(candidate.format)) {
    issues.push({ severity: 'error', code: 'asset.format_mismatch', message: `Format ${candidate.format} is not allowed for ${matchedLibraryItem.label}. Allowed: ${matchedLibraryItem.formats.join(', ')}.` });
  }

  if (exactLogoSlots.includes(candidate.slot) && candidate.isExactLogo !== true) {
    issues.push({ severity: 'error', code: 'logo.not_exact', message: 'Logo assets must use exact source artwork. Do not redraw, recolor, stretch, or approximate logos.' });
  }

  const minimum = preferredMinimums[candidate.slot];
  if (minimum && candidate.width && candidate.height) {
    if (candidate.width < minimum.width || candidate.height < minimum.height) {
      issues.push({ severity: 'warning', code: 'asset.low_resolution', message: `Recommended minimum for ${candidate.slot} is ${minimum.width}×${minimum.height}px.` });
    }
  } else if (minimum) {
    issues.push({ severity: 'info', code: 'asset.dimensions_missing', message: 'Dimensions were not provided, so resolution could not be verified.' });
  }

  if (candidate.slot === 'qr' && candidate.isQrScannable !== true) {
    issues.push({ severity: 'error', code: 'qr.not_verified', message: 'QR assets must be scannable before export.' });
  }

  if (candidate.rightsStatus !== 'approved') {
    issues.push({ severity: 'warning', code: 'asset.rights_review', message: 'Asset rights/source status is not approved.' });
  }

  if (candidate.hasAltText !== true) {
    issues.push({ severity: 'info', code: 'asset.alt_text_missing', message: 'Add alt text or a descriptive accessibility label for this visual asset.' });
  }

  const score = scoreFromIssues(issues);
  return {
    candidate,
    matchedLibraryItem,
    score,
    status: statusFromScore(score, issues),
    issues,
  };
};

export const validatePresentationAssetCandidates = (candidates: PresentationAssetCandidate[]) => candidates.map(validatePresentationAssetCandidate);

export const buildPresentationAssetValidationPromptBlock = (candidates: PresentationAssetCandidate[]) => {
  const results = validatePresentationAssetCandidates(candidates);
  return [
    'PRESENTATION ASSET VALIDATION',
    'Validate every visual before inserting it into a deck or exporting to PowerPoint.',
    ...results.map((result) => `- ${result.candidate.label}: ${result.status} score=${result.score} issues=${result.issues.map((issue) => issue.code).join(', ') || 'none'}`),
  ].join('\n');
};
