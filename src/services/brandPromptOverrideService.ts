import type { MasterPromptFamily } from './masterfulPromptTemplateService';

export type BrandPromptOverrideStatus = 'draft' | 'approved' | 'archived';
export type BrandPromptOverrideScope = MasterPromptFamily | 'global';

export interface BrandPromptOverride {
  id: string;
  brandProfileId: string;
  scope: BrandPromptOverrideScope;
  name: string;
  version: number;
  status: BrandPromptOverrideStatus;
  strategyNotes?: string;
  hierarchyRules: string[];
  layoutRules: string[];
  imageryRules: string[];
  motifRules: string[];
  typographyRules: string[];
  productionRules: string[];
  negativeRules: string[];
  qaRules: string[];
  createdAt: string;
  updatedAt: string;
}

const BRAND_PROMPT_OVERRIDES_KEY = 'eventkit-brand-prompt-overrides';
const hasStorage = () => typeof localStorage !== 'undefined';

const safeParse = (raw: string | null): BrandPromptOverride[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const readBrandPromptOverrides = (): BrandPromptOverride[] => {
  if (!hasStorage()) return [];
  return safeParse(localStorage.getItem(BRAND_PROMPT_OVERRIDES_KEY));
};

export const writeBrandPromptOverrides = (overrides: BrandPromptOverride[]) => {
  if (hasStorage()) localStorage.setItem(BRAND_PROMPT_OVERRIDES_KEY, JSON.stringify(overrides));
  return overrides;
};

export const getBrandPromptOverridesForProfile = (brandProfileId: string) =>
  readBrandPromptOverrides().filter((override) => override.brandProfileId === brandProfileId && override.status !== 'archived');

export const getApprovedBrandPromptOverrides = (brandProfileId: string, scope: BrandPromptOverrideScope) =>
  getBrandPromptOverridesForProfile(brandProfileId).filter((override) =>
    override.status === 'approved' && (override.scope === 'global' || override.scope === scope)
  );

export const createEmptyBrandPromptOverride = (brandProfileId: string, scope: BrandPromptOverrideScope): BrandPromptOverride => {
  const now = new Date().toISOString();
  return {
    id: `prompt-${brandProfileId}-${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brandProfileId,
    scope,
    name: `${scope.replace(/_/g, ' ')} override`,
    version: 1,
    status: 'draft',
    strategyNotes: '',
    hierarchyRules: [],
    layoutRules: [],
    imageryRules: [],
    motifRules: [],
    typographyRules: [],
    productionRules: [],
    negativeRules: [],
    qaRules: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const saveBrandPromptOverride = (override: BrandPromptOverride) => {
  const current = readBrandPromptOverrides();
  const now = new Date().toISOString();
  const existing = current.find((item) => item.id === override.id);
  const nextOverride: BrandPromptOverride = {
    ...override,
    version: existing ? Math.max(existing.version + 1, override.version || 1) : override.version || 1,
    createdAt: override.createdAt || now,
    updatedAt: now,
  };

  writeBrandPromptOverrides([...current.filter((item) => item.id !== override.id), nextOverride]);
  return nextOverride;
};

export const deleteBrandPromptOverride = (overrideId: string) => {
  const next = readBrandPromptOverrides().filter((override) => override.id !== overrideId);
  writeBrandPromptOverrides(next);
  return next;
};

export const archiveBrandPromptOverride = (overrideId: string) => {
  const next = readBrandPromptOverrides().map((override) =>
    override.id === overrideId ? { ...override, status: 'archived' as BrandPromptOverrideStatus, updatedAt: new Date().toISOString() } : override
  );
  writeBrandPromptOverrides(next);
  return next.find((override) => override.id === overrideId);
};

const lineList = (label: string, items: string[]) => items.length ? `${label}\n${items.map((item) => `  • ${item}`).join('\n')}` : '';

export const buildBrandPromptOverrideBlock = (brandProfileId: string, scope: BrandPromptOverrideScope) => {
  const overrides = getApprovedBrandPromptOverrides(brandProfileId, scope);
  if (!overrides.length) return '';

  return `
=== BRAND-SPECIFIC PROMPT OVERRIDES ===
These rules are approved for this brand and override generic defaults when there is a conflict. Never violate hard logo, accessibility, or production safety rules.
${overrides.map((override) => `
OVERRIDE: ${override.name}
SCOPE: ${override.scope}
VERSION: ${override.version}
${override.strategyNotes ? `Strategy: ${override.strategyNotes}` : ''}
${lineList('Hierarchy rules:', override.hierarchyRules)}
${lineList('Layout rules:', override.layoutRules)}
${lineList('Imagery rules:', override.imageryRules)}
${lineList('Motif rules:', override.motifRules)}
${lineList('Typography rules:', override.typographyRules)}
${lineList('Production rules:', override.productionRules)}
${lineList('Negative rules:', override.negativeRules)}
${lineList('QA rules:', override.qaRules)}
`).join('\n')}
=== END BRAND-SPECIFIC PROMPT OVERRIDES ===
`;
};

export const splitRules = (value: string) => value
  .split('\n')
  .map((line) => line.replace(/^[-•*]\s*/, '').trim())
  .filter(Boolean);

export const joinRules = (rules: string[]) => rules.join('\n');
