export type PresentationEdgePriority = 'now' | 'next' | 'scale';

export interface PresentationCompetitiveEdge {
  id: string;
  label: string;
  baseline: string;
  eventKitMove: string;
  priority: PresentationEdgePriority;
}

export const presentationCompetitiveEdges: PresentationCompetitiveEdge[] = [
  {
    id: 'exact-source-logos',
    label: 'Exact source logos',
    baseline: 'AI presentation tools can blur the boundary between brand asset and generated decoration.',
    eventKitMove: 'Use exact uploaded logos as deterministic layers only, never as generated prompt output.',
    priority: 'now',
  },
  {
    id: 'brand-brain-everywhere',
    label: 'Brand Brain everywhere',
    baseline: 'Theme systems often stop at colors and fonts.',
    eventKitMove: 'Use brand guide assets, do and do-not examples, prompt overrides, style systems, and logo policy in every deck workflow.',
    priority: 'now',
  },
  {
    id: 'editable-powerpoint-native',
    label: 'Editable PowerPoint native',
    baseline: 'Exported decks can become visually close but hard to edit.',
    eventKitMove: 'Generate real editable text, shapes, data blocks, charts, notes, and PowerPoint-safe layouts.',
    priority: 'now',
  },
  {
    id: 'deterministic-template-slots',
    label: 'Deterministic template slots',
    baseline: 'Template substitution can be prompt-guided and inconsistent.',
    eventKitMove: 'Use named slots, required checks, fallback rules, length validation, and asset safety checks.',
    priority: 'now',
  },
  {
    id: 'export-fidelity-score',
    label: 'Export fidelity score',
    baseline: 'Editor, present, and export states may drift.',
    eventKitMove: 'Score decks before export and provide clear warnings and fixes.',
    priority: 'now',
  },
  {
    id: 'live-element-controls',
    label: 'Live element controls',
    baseline: 'Many tools optimize high-level card editing.',
    eventKitMove: 'Expose live toolbar, control panel, resolver, layer controls, media controls, data controls, and brand-safe fixes.',
    priority: 'next',
  },
  {
    id: 'content-graph-with-pptx',
    label: 'Content graph plus PPTX',
    baseline: 'Card models are strong for web-like outputs.',
    eventKitMove: 'Use a page/card/block graph while still treating professional PowerPoint as a first-class output.',
    priority: 'next',
  },
  {
    id: 'agent-qa-loop',
    label: 'Agent plus QA loop',
    baseline: 'Agent workflows create and shape content.',
    eventKitMove: 'Add brand QA, export QA, template-slot QA, source QA, and human approval checkpoints before building.',
    priority: 'next',
  },
  {
    id: 'enterprise-event-history',
    label: 'Enterprise event history',
    baseline: 'Public edit and audit surfaces may be limited.',
    eventKitMove: 'Track generation jobs, source inputs, template fills, brand decisions, exports, and user corrections as first-party events.',
    priority: 'scale',
  },
];

export const getPresentationCompetitiveEdges = (priority?: PresentationEdgePriority) =>
  priority ? presentationCompetitiveEdges.filter((edge) => edge.priority === priority) : presentationCompetitiveEdges;

export const buildPresentationCompetitiveEdgePromptBlock = () => [
  'PRESENTATION STUDIO COMPETITIVE EDGE MODEL',
  'Match AI-native creation speed while exceeding it in deterministic brand control, editable PowerPoint output, live control, slot validation, and export fidelity.',
  ...presentationCompetitiveEdges
    .filter((edge) => edge.priority !== 'scale')
    .map((edge) => `- ${edge.label}: ${edge.eventKitMove}`),
].join('\n');
