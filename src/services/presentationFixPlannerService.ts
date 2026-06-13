export type PresentationFixSeverity = 'low' | 'medium' | 'high' | 'critical';

export type PresentationFixCategory =
  | 'source'
  | 'brand'
  | 'logo'
  | 'template'
  | 'content_density'
  | 'layout'
  | 'data'
  | 'notes'
  | 'export'
  | 'review';

export interface PresentationFixFinding {
  id: string;
  category: PresentationFixCategory;
  severity: PresentationFixSeverity;
  slideId?: string;
  message: string;
}

export interface PresentationFixAction {
  id: string;
  category: PresentationFixCategory;
  label: string;
  description: string;
  severity: PresentationFixSeverity;
  targetSlideId?: string;
  command: string;
  canAutoApply: boolean;
}

const severityRank: Record<PresentationFixSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const actionLabelByCategory: Record<PresentationFixCategory, string> = {
  source: 'Reconnect source evidence',
  brand: 'Reapply Brand Brain rules',
  logo: 'Repair logo placement',
  template: 'Validate template slots',
  content_density: 'Reduce slide density',
  layout: 'Repair layout hierarchy',
  data: 'Validate data block',
  notes: 'Expand speaker notes',
  export: 'Repair export fidelity',
  review: 'Request human review',
};

const commandByCategory: Record<PresentationFixCategory, string> = {
  source: 'attach source and summarize evidence',
  brand: 'apply brand system and check slide consistency',
  logo: 'use exact source logo and validate safe zone',
  template: 'validate required template slots and fill missing content',
  content_density: 'compress dense text into smart blocks',
  layout: 'repair visual hierarchy and spacing',
  data: 'validate chart or metric source and editable data',
  notes: 'add speaker notes for this slide',
  export: 'check export fidelity and fix warnings',
  review: 'mark for human review before export',
};

export const buildPresentationFixPlan = (findings: PresentationFixFinding[]): PresentationFixAction[] => {
  return findings
    .map((finding, index) => ({
      id: `fix-${index + 1}-${finding.category}`,
      category: finding.category,
      label: actionLabelByCategory[finding.category],
      description: finding.message,
      severity: finding.severity,
      targetSlideId: finding.slideId,
      command: commandByCategory[finding.category],
      canAutoApply: !['logo', 'source', 'review'].includes(finding.category),
    }))
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
};

export const summarizePresentationFixPlan = (actions: PresentationFixAction[]) => {
  const critical = actions.filter((action) => action.severity === 'critical').length;
  const high = actions.filter((action) => action.severity === 'high').length;
  const autoApply = actions.filter((action) => action.canAutoApply).length;
  return {
    total: actions.length,
    critical,
    high,
    autoApply,
    needsHumanReview: actions.some((action) => !action.canAutoApply || action.category === 'review'),
  };
};

export const buildPresentationFixPromptBlock = (actions: PresentationFixAction[]) => [
  'PRESENTATION FIX PLAN',
  'Apply fixes in severity order. Preserve source data, brand rules, editable regions, and export readiness.',
  ...actions.map((action) => `- ${action.severity.toUpperCase()} ${action.label}: ${action.description}. Command: ${action.command}. Auto apply: ${action.canAutoApply ? 'yes' : 'review first'}`),
].join('\n');
