import type { SlideLayout } from '@/components/slides/slideTypes';

export type PresentationSmartBlockType =
  | 'executive_summary'
  | 'metric_stack'
  | 'before_after'
  | 'timeline'
  | 'process_map'
  | 'case_study'
  | 'quote_proof'
  | 'comparison_grid'
  | 'risk_matrix'
  | 'roadmap'
  | 'cta_panel'
  | 'appendix_table';

export interface PresentationSmartBlock {
  id: PresentationSmartBlockType;
  label: string;
  description: string;
  bestFor: string[];
  recommendedLayouts: (SlideLayout | string)[];
  requiredInputs: string[];
  editableRegions: string[];
  qualityChecks: string[];
}

export const presentationSmartBlocks: PresentationSmartBlock[] = [
  {
    id: 'executive_summary',
    label: 'Executive Summary',
    description: 'High-level takeaways with short narrative, proof points, and decision ask.',
    bestFor: ['leadership updates', 'board decks', 'sales summaries'],
    recommendedLayouts: ['hero', 'two-column', 'stats'],
    requiredInputs: ['headline', 'three takeaways', 'decision ask'],
    editableRegions: ['title', 'summary', 'takeaway cards', 'cta'],
    qualityChecks: ['No more than three key points', 'Clear decision ask', 'Readable at presentation distance'],
  },
  {
    id: 'metric_stack',
    label: 'Metric Stack',
    description: 'KPI-focused block with numbers, labels, trend notes, and confidence context.',
    bestFor: ['performance reporting', 'growth updates', 'ROI sections'],
    recommendedLayouts: ['stats', 'comparison'],
    requiredInputs: ['metrics', 'labels', 'timeframe', 'source'],
    editableRegions: ['stat values', 'stat labels', 'supporting note'],
    qualityChecks: ['Every metric has context', 'Numbers are not decorative', 'No unsupported claims'],
  },
  {
    id: 'before_after',
    label: 'Before / After',
    description: 'Transformation block that compares current state to future state.',
    bestFor: ['strategy', 'change management', 'product value'],
    recommendedLayouts: ['comparison', 'two-column'],
    requiredInputs: ['before state', 'after state', 'bridge insight'],
    editableRegions: ['before column', 'after column', 'bridge callout'],
    qualityChecks: ['Both sides are parallel', 'Change is measurable', 'Bridge is actionable'],
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Milestone-based block for sequencing events, releases, or rollout plans.',
    bestFor: ['roadmaps', 'event plans', 'implementation'],
    recommendedLayouts: ['timeline'],
    requiredInputs: ['steps', 'dates', 'owners'],
    editableRegions: ['timeline nodes', 'date labels', 'step details'],
    qualityChecks: ['Sequence is clear', 'Dates are consistent', 'No overlapping labels'],
  },
  {
    id: 'process_map',
    label: 'Process Map',
    description: 'Step-by-step system block with owner, input, output, and status.',
    bestFor: ['operations', 'workflows', 'training'],
    recommendedLayouts: ['process'],
    requiredInputs: ['steps', 'owners', 'outputs'],
    editableRegions: ['process steps', 'icons', 'handoff notes'],
    qualityChecks: ['Every step has a verb', 'No skipped handoffs', 'Flow direction is obvious'],
  },
  {
    id: 'case_study',
    label: 'Case Study',
    description: 'Problem, solution, result, and proof block for customer or internal wins.',
    bestFor: ['sales decks', 'case studies', 'proof sections'],
    recommendedLayouts: ['case-study', 'two-column', 'stats'],
    requiredInputs: ['problem', 'solution', 'result', 'proof'],
    editableRegions: ['problem', 'solution', 'result metrics', 'visual'],
    qualityChecks: ['Result is specific', 'Proof is credible', 'Customer language is concise'],
  },
  {
    id: 'quote_proof',
    label: 'Quote Proof',
    description: 'Quote plus proof context, attribution, and related metric.',
    bestFor: ['customer proof', 'leadership voice', 'testimonials'],
    recommendedLayouts: ['quote', 'hero'],
    requiredInputs: ['quote', 'speaker', 'context'],
    editableRegions: ['quote', 'attribution', 'supporting proof'],
    qualityChecks: ['Quote is short', 'Attribution is clear', 'Context does not overpower quote'],
  },
  {
    id: 'comparison_grid',
    label: 'Comparison Grid',
    description: 'Structured comparison across options, vendors, products, or strategies.',
    bestFor: ['competitive analysis', 'product choice', 'strategy tradeoffs'],
    recommendedLayouts: ['comparison', 'table'],
    requiredInputs: ['options', 'criteria', 'recommendation'],
    editableRegions: ['columns', 'criteria rows', 'recommendation callout'],
    qualityChecks: ['Criteria are consistent', 'Winner is clear', 'Grid is not overloaded'],
  },
  {
    id: 'risk_matrix',
    label: 'Risk Matrix',
    description: 'Risk, likelihood, impact, mitigation, and owner block.',
    bestFor: ['program planning', 'legal/compliance', 'enterprise review'],
    recommendedLayouts: ['table', 'comparison'],
    requiredInputs: ['risks', 'impact', 'mitigation', 'owner'],
    editableRegions: ['risk rows', 'impact markers', 'mitigation text'],
    qualityChecks: ['Mitigation exists for each risk', 'Owners are assigned', 'Severity is visible'],
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    description: 'Phase-based plan with now, next, later structure.',
    bestFor: ['product plans', 'transformation', 'launches'],
    recommendedLayouts: ['timeline', 'process'],
    requiredInputs: ['phases', 'outcomes', 'time horizons'],
    editableRegions: ['phase cards', 'outcomes', 'time labels'],
    qualityChecks: ['Phases are distinct', 'Outcomes are measurable', 'Time horizons are visible'],
  },
  {
    id: 'cta_panel',
    label: 'CTA Panel',
    description: 'Closing action block with decision, next step, contact, or meeting ask.',
    bestFor: ['sales decks', 'executive approvals', 'event decks'],
    recommendedLayouts: ['cta', 'hero'],
    requiredInputs: ['action', 'reason', 'next step'],
    editableRegions: ['headline', 'reason', 'button/CTA', 'contact'],
    qualityChecks: ['Action is specific', 'Next step is immediate', 'No vague closing language'],
  },
  {
    id: 'appendix_table',
    label: 'Appendix Table',
    description: 'Dense supporting information moved out of the main narrative.',
    bestFor: ['research notes', 'backup data', 'implementation detail'],
    recommendedLayouts: ['table'],
    requiredInputs: ['rows', 'columns', 'source'],
    editableRegions: ['table cells', 'source note', 'section label'],
    qualityChecks: ['Main deck stays light', 'Table is labeled', 'Source is visible'],
  },
];

export const recommendSmartBlocksForGoal = (goal: string) => {
  const normalized = goal.toLowerCase();
  return presentationSmartBlocks.filter((block) =>
    block.bestFor.some((item) => normalized.includes(item.split(' ')[0])) ||
    normalized.includes(block.label.toLowerCase().split(' ')[0])
  );
};

export const buildSmartBlockPromptBlock = (selectedIds?: PresentationSmartBlockType[]) => {
  const blocks = selectedIds?.length
    ? presentationSmartBlocks.filter((block) => selectedIds.includes(block.id))
    : presentationSmartBlocks;

  return [
    'PRESENTATION SMART BLOCKS',
    'Use these structured blocks to create slides that remain editable and export-safe.',
    ...blocks.map((block) => `- ${block.label}: ${block.description} Inputs: ${block.requiredInputs.join(', ')} Checks: ${block.qualityChecks.join('; ')}`),
  ].join('\n');
};
