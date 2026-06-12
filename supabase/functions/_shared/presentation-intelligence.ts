export interface PresentationIntelligencePayload {
  version?: string;
  brandProfileId?: string;
  brandName?: string;
  templateId?: string;
  templateName?: string;
  exportProfile?: string;
  sourceKind?: string;
  parallaxMode?: boolean;
  hasExactLogoSource?: boolean;
  primaryLogo?: {
    name?: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
    placementPolicy?: string;
  };
  brandTokens?: {
    colors?: Record<string, unknown>;
    fonts?: Record<string, unknown>;
    gradients?: string[];
  };
  brandAssets?: {
    logos?: number;
    visualReferences?: number;
    patternReferences?: number;
    layoutReferences?: number;
    doExamples?: number;
    dontExamples?: number;
    referenceNames?: string[];
  };
  styleSystems?: Array<{
    id?: string;
    name?: string;
    description?: string;
    presentationTranslation?: string;
  }>;
  approvedPromptOverrides?: {
    count?: number;
    scopes?: string[];
    promptBlock?: string;
  };
  powerpointRules?: string[];
  qaChecklist?: string[];
  promptBlock?: string;
}

export interface SanitizedPresentationIntelligence {
  version?: string;
  brandProfileId?: string;
  brandName?: string;
  templateId?: string;
  templateName?: string;
  exportProfile?: string;
  sourceKind?: string;
  parallaxMode?: boolean;
  hasExactLogoSource: boolean;
  primaryLogoName?: string;
  brandTokens?: PresentationIntelligencePayload['brandTokens'];
  brandAssets?: PresentationIntelligencePayload['brandAssets'];
  styleSystems?: PresentationIntelligencePayload['styleSystems'];
  approvedPromptOverrides?: PresentationIntelligencePayload['approvedPromptOverrides'];
  powerpointRules?: string[];
  qaChecklist?: string[];
  promptBlock?: string;
}

export const sanitizePresentationIntelligenceForModel = (
  input?: PresentationIntelligencePayload | null,
): SanitizedPresentationIntelligence | null => {
  if (!input) return null;

  return {
    version: input.version,
    brandProfileId: input.brandProfileId,
    brandName: input.brandName,
    templateId: input.templateId,
    templateName: input.templateName,
    exportProfile: input.exportProfile,
    sourceKind: input.sourceKind,
    parallaxMode: input.parallaxMode,
    hasExactLogoSource: Boolean(input.hasExactLogoSource),
    primaryLogoName: input.primaryLogo?.name || input.primaryLogo?.fileName,
    brandTokens: input.brandTokens,
    brandAssets: input.brandAssets,
    styleSystems: input.styleSystems,
    approvedPromptOverrides: input.approvedPromptOverrides ? {
      count: input.approvedPromptOverrides.count,
      scopes: input.approvedPromptOverrides.scopes,
      promptBlock: input.approvedPromptOverrides.promptBlock,
    } : undefined,
    powerpointRules: input.powerpointRules,
    qaChecklist: input.qaChecklist,
    promptBlock: input.promptBlock,
  };
};

const list = (items?: string[]) => items?.length ? items.map((item) => `  • ${item}`).join('\n') : '  • none';

export const buildPresentationIntelligencePromptBlock = (
  input?: PresentationIntelligencePayload | null,
): string => {
  const sanitized = sanitizePresentationIntelligenceForModel(input);
  if (!sanitized) return '';

  if (sanitized.promptBlock?.trim()) {
    return sanitized.promptBlock.trim();
  }

  const systems = sanitized.styleSystems?.map((system) =>
    `  • ${system.name || system.id}: ${system.presentationTranslation || system.description || 'Use consistently across slide masters and layouts.'}`,
  ).join('\n') || '  • none';

  const colors = sanitized.brandTokens?.colors
    ? Object.entries(sanitized.brandTokens.colors).map(([key, value]) => `${key}: ${String(value)}`).join(', ')
    : 'none';

  const fonts = sanitized.brandTokens?.fonts
    ? Object.entries(sanitized.brandTokens.fonts).map(([key, value]) => `${key}: ${String(value)}`).join(', ')
    : 'none';

  return `
=== PRESENTATION INTELLIGENCE ===
Brand: ${sanitized.brandName || 'Active brand'}
Export profile: ${sanitized.exportProfile || 'editable_working_deck'}
Source kind: ${sanitized.sourceKind || 'prompt'}
Template: ${sanitized.templateName || sanitized.templateId || 'none'}
Exact source logo available: ${sanitized.hasExactLogoSource ? 'yes' : 'no'}${sanitized.primaryLogoName ? ` (${sanitized.primaryLogoName})` : ''}

Brand tokens:
  Colors: ${colors}
  Fonts: ${fonts}

Style systems:
${systems}

PowerPoint production rules:
${list(sanitized.powerpointRules)}

QA checklist:
${list(sanitized.qaChecklist)}

Hard logo rule:
  • Never ask the model to redraw, approximate, recolor, distort, crop, or invent the logo.
  • If logo placement is needed, reserve a clean logo-safe zone and insert the exact source logo as a deterministic PowerPoint layer outside the model prompt.
=== END PRESENTATION INTELLIGENCE ===
`.trim();
};

export const getPresentationLogoDataUrlForDeterministicLayer = (
  input?: PresentationIntelligencePayload | null,
): string | undefined => input?.primaryLogo?.dataUrl;
