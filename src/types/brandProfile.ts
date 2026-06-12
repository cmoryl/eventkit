export type BrandMode = 'locked' | 'guided' | 'inspired' | 'experimental';

export type BrandColorRole =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'background'
  | 'foreground'
  | 'semantic';

export interface BrandColor {
  name: string;
  hex: string;
  role: BrandColorRole;
  usage?: string;
  locked?: boolean;
}

export interface BrandGradient {
  name: string;
  stops: string[];
  usage?: string;
  locked?: boolean;
}

export interface BrandLogoRule {
  name: string;
  description: string;
  required?: boolean;
}

export interface BrandTypographyRule {
  role: 'headline' | 'subhead' | 'body' | 'caption' | 'fallback' | 'display';
  fontFamily: string;
  weight?: string;
  usage?: string;
  locked?: boolean;
}

export interface BrandImageryRules {
  styleSummary: string;
  requiredTraits: string[];
  avoid: string[];
  promptGuidance?: string;
}

export interface BrandLayoutRules {
  styleSummary: string;
  requiredTraits: string[];
  avoid: string[];
}

export interface BrandAccessibilityRules {
  minimumContrastRatio: number;
  largeTextContrastRatio: number;
  notes?: string[];
}

export interface BrandExportRules {
  socialDimensions?: Record<string, string>;
  printRules?: string[];
  deckRules?: string[];
}

export interface BrandProfile {
  id: string;
  name: string;
  description: string;
  defaultMode: BrandMode;
  colors: BrandColor[];
  gradients: BrandGradient[];
  typography: BrandTypographyRule[];
  logoRules: BrandLogoRule[];
  imageryRules: BrandImageryRules;
  layoutRules: BrandLayoutRules;
  accessibilityRules: BrandAccessibilityRules;
  exportRules: BrandExportRules;
  restrictedUses: string[];
  approvedExamples?: string[];
  promptKeywords?: string[];
}

export interface BrandValidationInput {
  colors?: string[];
  fontFamilies?: string[];
  hasLogo?: boolean;
  logoPlacement?: string;
  exportDimensions?: string;
  assetType?: string;
  mode?: BrandMode;
}

export interface BrandValidationIssue {
  severity: 'info' | 'warning' | 'error';
  category: 'color' | 'typography' | 'logo' | 'layout' | 'accessibility' | 'export' | 'imagery' | 'drift';
  message: string;
  suggestion?: string;
}

export interface BrandValidationResult {
  overallScore: number;
  colorScore: number;
  typographyScore: number;
  logoScore: number;
  layoutScore: number;
  accessibilityScore: number;
  exportReadinessScore: number;
  brandDriftScore: number;
  issues: BrandValidationIssue[];
  approved: boolean;
}
