import type { BrandProfile } from '@/types/brandProfile';

export type BrandProfileHealthStatus = 'production-ready' | 'usable' | 'needs-work' | 'incomplete';
export type BrandProfileCheckStatus = 'pass' | 'warning' | 'fail';

export interface BrandProfileHealthCheck {
  category: 'identity' | 'color' | 'typography' | 'logo' | 'imagery' | 'layout' | 'accessibility' | 'export' | 'governance';
  label: string;
  status: BrandProfileCheckStatus;
  score: number;
  message: string;
  recommendation?: string;
}

export interface BrandProfileHealthResult {
  score: number;
  status: BrandProfileHealthStatus;
  checks: BrandProfileHealthCheck[];
  passCount: number;
  warningCount: number;
  failCount: number;
  recommendations: string[];
}

const validHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

const scoreToStatus = (score: number): BrandProfileHealthStatus => {
  if (score >= 85) return 'production-ready';
  if (score >= 70) return 'usable';
  if (score >= 50) return 'needs-work';
  return 'incomplete';
};

const makeCheck = (
  category: BrandProfileHealthCheck['category'],
  label: string,
  condition: boolean,
  warningCondition: boolean,
  passMessage: string,
  warningMessage: string,
  failMessage: string,
  recommendation?: string
): BrandProfileHealthCheck => {
  if (condition) {
    return { category, label, status: 'pass', score: 100, message: passMessage };
  }

  if (warningCondition) {
    return { category, label, status: 'warning', score: 65, message: warningMessage, recommendation };
  }

  return { category, label, status: 'fail', score: 25, message: failMessage, recommendation };
};

export const evaluateBrandProfileHealth = (profile: BrandProfile): BrandProfileHealthResult => {
  const colorRoles = new Set(profile.colors.map((color) => color.role));
  const typographyRoles = new Set(profile.typography.map((type) => type.role));
  const hasExportRules = Boolean(
    profile.exportRules.socialDimensions ||
    profile.exportRules.printRules?.length ||
    profile.exportRules.deckRules?.length
  );

  const checks: BrandProfileHealthCheck[] = [
    makeCheck(
      'identity',
      'Profile identity',
      Boolean(profile.id && profile.name && profile.description && profile.defaultMode),
      Boolean(profile.id && profile.name),
      'Brand identity metadata is complete.',
      'Brand identity metadata is usable but needs a stronger description or default mode.',
      'Brand identity metadata is incomplete.',
      'Add a clear name, description, id, and default compliance mode.'
    ),
    makeCheck(
      'color',
      'Color palette depth',
      profile.colors.length >= 3 && profile.colors.every((color) => validHex(color.hex)),
      profile.colors.length > 0 && profile.colors.every((color) => validHex(color.hex)),
      'Palette has enough valid colors for generation and export.',
      'Palette is valid but thin. It may not support broad asset systems.',
      'Palette is missing or contains invalid HEX values.',
      'Add at least primary, secondary/accent, and neutral/background colors.'
    ),
    makeCheck(
      'color',
      'Color role coverage',
      colorRoles.has('primary') && (colorRoles.has('accent') || colorRoles.has('secondary')) && (colorRoles.has('neutral') || colorRoles.has('background')),
      colorRoles.has('primary'),
      'Palette covers primary, supporting, and neutral/background roles.',
      'Palette has a primary color but needs clearer supporting and neutral roles.',
      'Palette roles are not ready for automated design decisions.',
      'Tag colors by role so generators know how to use them.'
    ),
    makeCheck(
      'typography',
      'Typography system',
      typographyRoles.has('headline') && typographyRoles.has('body') && typographyRoles.has('fallback'),
      typographyRoles.has('headline') || typographyRoles.has('body'),
      'Typography covers headline, body, and fallback usage.',
      'Typography is usable but needs headline/body/fallback separation.',
      'Typography system is incomplete.',
      'Add headline, body, and fallback typography rules.'
    ),
    makeCheck(
      'logo',
      'Logo governance',
      profile.logoRules.some((rule) => rule.required) && profile.logoRules.length >= 1,
      profile.logoRules.length >= 1,
      'Logo rules include required governance.',
      'Logo rules exist but should identify required protections.',
      'Logo rules are missing.',
      'Add rules for clear space, colorways, distortion, effects, and placement.'
    ),
    makeCheck(
      'imagery',
      'Imagery guidance',
      profile.imageryRules.styleSummary.length > 20 && profile.imageryRules.requiredTraits.length >= 3 && profile.imageryRules.avoid.length >= 2,
      profile.imageryRules.styleSummary.length > 0 && profile.imageryRules.requiredTraits.length > 0,
      'Imagery direction is specific enough for generation.',
      'Imagery direction exists but needs more traits and avoid rules.',
      'Imagery direction is not ready for generation.',
      'Add style summary, required traits, avoid terms, and prompt guidance.'
    ),
    makeCheck(
      'layout',
      'Layout guidance',
      profile.layoutRules.styleSummary.length > 15 && profile.layoutRules.requiredTraits.length >= 2 && profile.layoutRules.avoid.length >= 1,
      profile.layoutRules.styleSummary.length > 0,
      'Layout guidance is clear enough for consistent templates.',
      'Layout guidance exists but needs stronger required/avoid rules.',
      'Layout guidance is missing.',
      'Define spacing, hierarchy, composition, and template drift rules.'
    ),
    makeCheck(
      'accessibility',
      'Accessibility baseline',
      profile.accessibilityRules.minimumContrastRatio >= 4.5 && profile.accessibilityRules.largeTextContrastRatio >= 3,
      profile.accessibilityRules.minimumContrastRatio >= 3,
      'Accessibility ratios meet standard digital baselines.',
      'Accessibility ratios are present but should be strengthened.',
      'Accessibility baseline is not defined.',
      'Set minimum contrast to 4.5:1 and large text to 3:1.'
    ),
    makeCheck(
      'export',
      'Export rules',
      hasExportRules,
      Boolean(profile.exportRules),
      'Export rules are defined for at least one channel.',
      'Export object exists but needs channel-specific rules.',
      'Export rules are missing.',
      'Add social dimensions, print rules, or deck rules.'
    ),
    makeCheck(
      'governance',
      'Restricted uses',
      profile.restrictedUses.length >= 2,
      profile.restrictedUses.length >= 1,
      'Governance includes multiple restricted uses.',
      'Governance has a restriction but needs more guardrails.',
      'Governance restrictions are missing.',
      'Add no-go rules for colors, logos, imagery, claims, and export readiness.'
    ),
  ];

  const score = Math.round(checks.reduce((total, check) => total + check.score, 0) / checks.length);
  const passCount = checks.filter((check) => check.status === 'pass').length;
  const warningCount = checks.filter((check) => check.status === 'warning').length;
  const failCount = checks.filter((check) => check.status === 'fail').length;
  const recommendations = checks
    .filter((check) => check.recommendation && check.status !== 'pass')
    .map((check) => check.recommendation as string);

  return {
    score,
    status: scoreToStatus(score),
    checks,
    passCount,
    warningCount,
    failCount,
    recommendations,
  };
};
