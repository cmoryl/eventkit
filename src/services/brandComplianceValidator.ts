import type { BrandProfile, BrandValidationInput, BrandValidationIssue, BrandValidationResult } from '@/types/brandProfile';

const normalizeHex = (value: string) => value.trim().toUpperCase();

const scoreFromIssues = (issues: BrandValidationIssue[], category?: BrandValidationIssue['category']) => {
  const scoped = category ? issues.filter((issue) => issue.category === category) : issues;
  const penalty = scoped.reduce((total, issue) => total + (issue.severity === 'error' ? 25 : issue.severity === 'warning' ? 12 : 4), 0);
  return Math.max(0, 100 - penalty);
};

export const validateAssetAgainstBrand = (asset: BrandValidationInput, brandProfile: BrandProfile): BrandValidationResult => {
  const mode = asset.mode ?? brandProfile.defaultMode;
  const isLocked = mode === 'locked';
  const issues: BrandValidationIssue[] = [];

  const approvedColors = new Set(brandProfile.colors.map((color) => normalizeHex(color.hex)));
  const approvedFonts = new Set(brandProfile.typography.map((type) => type.fontFamily.toLowerCase()));

  asset.colors?.forEach((color) => {
    if (!approvedColors.has(normalizeHex(color))) {
      issues.push({
        severity: isLocked ? 'error' : 'warning',
        category: 'color',
        message: `${color} is outside the active brand color system.`,
        suggestion: 'Use an approved brand color or switch to a less strict mode for exploration.'
      });
    }
  });

  asset.fontFamilies?.forEach((font) => {
    if (!approvedFonts.has(font.toLowerCase())) {
      issues.push({
        severity: isLocked ? 'error' : 'warning',
        category: 'typography',
        message: `${font} is outside the active brand typography system.`,
        suggestion: 'Use an approved brand typeface or add the font to the active brand profile.'
      });
    }
  });

  if (asset.hasLogo === false) {
    issues.push({
      severity: mode === 'experimental' ? 'info' : 'warning',
      category: 'logo',
      message: 'No logo detected on this asset.',
      suggestion: 'Confirm whether this asset type intentionally does not require a logo.'
    });
  }

  if (!asset.exportDimensions) {
    issues.push({
      severity: 'info',
      category: 'export',
      message: 'Export dimensions were not supplied.',
      suggestion: 'Validate final pixel dimensions before production export.'
    });
  }

  const colorScore = scoreFromIssues(issues, 'color');
  const typographyScore = scoreFromIssues(issues, 'typography');
  const logoScore = scoreFromIssues(issues, 'logo');
  const layoutScore = scoreFromIssues(issues, 'layout');
  const accessibilityScore = scoreFromIssues(issues, 'accessibility');
  const exportReadinessScore = scoreFromIssues(issues, 'export');
  const brandDriftScore = Math.round((colorScore + typographyScore + logoScore + layoutScore) / 4);
  const overallScore = Math.round((colorScore + typographyScore + logoScore + layoutScore + accessibilityScore + exportReadinessScore + brandDriftScore) / 7);
  const minimumScore = isLocked ? 92 : mode === 'guided' ? 82 : mode === 'inspired' ? 70 : 0;

  return {
    overallScore,
    colorScore,
    typographyScore,
    logoScore,
    layoutScore,
    accessibilityScore,
    exportReadinessScore,
    brandDriftScore,
    issues,
    approved: overallScore >= minimumScore && !issues.some((issue) => issue.severity === 'error')
  };
};

export const getBrandValidationSummary = (result: BrandValidationResult) => {
  if (result.approved) return 'Approved for export.';
  const errors = result.issues.filter((issue) => issue.severity === 'error').length;
  const warnings = result.issues.filter((issue) => issue.severity === 'warning').length;
  return `Needs review: ${errors} errors and ${warnings} warnings.`;
};
