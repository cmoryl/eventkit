export interface AdvancedDataStoryBlock {
  id: string;
  name: string;
  description: string;
  complexity: 'advanced' | 'expert' | 'boardroom';
  bestFor: string[];
  preferredTemplates: string[];
  graphStyles: string[];
  objectBlocks: string[];
  layoutZones: string[];
  dataInputs: string[];
  narrativePattern: string;
  insertionPrompt: string;
}

export const ADVANCED_DATA_STORY_BLOCKS: AdvancedDataStoryBlock[] = [
  {
    id: 'story-boardroom-insight-stack',
    name: 'Boardroom Insight Stack',
    description: 'Executive slide combining KPI scorecard, waterfall driver view, and decision recommendation.',
    complexity: 'boardroom',
    bestFor: ['executive review', 'board decision', 'business case'],
    preferredTemplates: ['boardroom-decision-pack', 'data-observatory-pro'],
    graphStyles: ['viz-executive-scorecard-grid', 'viz-waterfall-impact-bridge', 'viz-bullet-performance-bars'],
    objectBlocks: ['object-executive-kpi-card', 'object-chart-insight-module', 'object-risk-signal-card'],
    layoutZones: ['top takeaway band', 'left KPI grid', 'right driver chart', 'bottom decision row'],
    dataInputs: ['headline takeaway', 'metrics', 'baseline', 'drivers', 'decision options', 'owner'],
    narrativePattern: 'What changed → why it changed → what decision is needed now.',
    insertionPrompt: 'Build a Boardroom Insight Stack with top takeaway, KPI grid, waterfall drivers, and bottom decision row. Keep all numbers editable and directly labeled.',
  },
  {
    id: 'story-ai-maturity-command-layer',
    name: 'AI Maturity Command Layer',
    description: 'AI transformation slide with maturity ladder, operating model map, and readiness scorecards.',
    complexity: 'expert',
    bestFor: ['AI strategy', 'operating model', 'transformation planning'],
    preferredTemplates: ['enterprise-ai-nexus', 'brand-governance-kit'],
    graphStyles: ['viz-maturity-ladder', 'viz-radial-progress-cluster', 'viz-network-node-map'],
    objectBlocks: ['object-operating-model-map', 'object-three-metric-stack', 'object-brand-approval-stamp'],
    layoutZones: ['left maturity ladder', 'center operating model', 'right readiness rings', 'footer governance notes'],
    dataInputs: ['maturity stages', 'current state', 'target state', 'readiness scores', 'governance notes'],
    narrativePattern: 'Current maturity → target operating model → readiness gaps → governance actions.',
    insertionPrompt: 'Build an AI Maturity Command Layer using maturity ladder, operating model map, readiness rings, and governance footer. Make gaps and next actions obvious.',
  },
  {
    id: 'story-risk-heatmap-mitigation-queue',
    name: 'Risk Heatmap + Mitigation Queue',
    description: 'Governance slide pairing a heatmap with prioritized mitigation cards and owner status.',
    complexity: 'advanced',
    bestFor: ['risk review', 'brand QA', 'program readiness'],
    preferredTemplates: ['brand-governance-kit', 'enterprise-ai-nexus', 'boardroom-decision-pack'],
    graphStyles: ['viz-heatmap-risk-grid', 'viz-bullet-performance-bars'],
    objectBlocks: ['object-risk-signal-card', 'object-brand-approval-stamp'],
    layoutZones: ['large heatmap', 'right mitigation queue', 'top severity legend', 'bottom approval stamp'],
    dataInputs: ['risk categories', 'severity scores', 'mitigations', 'owners', 'review status'],
    narrativePattern: 'Where risk is concentrated → which risks matter most → who owns mitigation.',
    insertionPrompt: 'Build a Risk Heatmap + Mitigation Queue with severity grid, right-side action cards, owners, and approval status. Avoid rainbow heatmaps.',
  },
  {
    id: 'story-funnel-segment-optimizer',
    name: 'Funnel Segment Optimizer',
    description: 'Conversion slide combining funnel, segment scorecards, and top drop-off recommendation.',
    complexity: 'advanced',
    bestFor: ['sales funnel', 'product adoption', 'event registration'],
    preferredTemplates: ['product-os-launch', 'global-launch-keynote', 'event-experience-system'],
    graphStyles: ['viz-funnel-conversion-stack', 'viz-kpi-ticker-strip', 'viz-dot-plot-rank-comparison'],
    objectBlocks: ['object-qr-resource-cta', 'object-chart-insight-module'],
    layoutZones: ['left funnel', 'right segment ranking', 'top KPI ticker', 'bottom CTA/action bar'],
    dataInputs: ['funnel stages', 'counts', 'conversion rates', 'segments', 'drop-off reasons', 'CTA'],
    narrativePattern: 'Where people drop → which segment is affected → what action improves conversion.',
    insertionPrompt: 'Build a Funnel Segment Optimizer with conversion funnel, segment ranking, KPI ticker, and action CTA. Highlight the biggest drop-off.',
  },
  {
    id: 'story-global-signal-command-map',
    name: 'Global Signal Command Map',
    description: 'Global operations slide with world map signal layer, regional scorecards, and trend strip.',
    complexity: 'expert',
    bestFor: ['global operations', 'localization coverage', 'market expansion'],
    preferredTemplates: ['transperfect-2026', 'global-launch-keynote', 'data-observatory-pro'],
    graphStyles: ['viz-world-map-signal-layer', 'viz-small-multiples-sparkline-wall', 'viz-executive-scorecard-grid'],
    objectBlocks: ['object-three-metric-stack', 'object-chart-insight-module'],
    layoutZones: ['full-width map', 'floating region cards', 'bottom sparkline wall', 'top summary metrics'],
    dataInputs: ['regions', 'market values', 'statuses', 'trends', 'top regions'],
    narrativePattern: 'Global coverage → regional signals → momentum changes → focus markets.',
    insertionPrompt: 'Build a Global Signal Command Map with map pins, region cards, top metrics, and sparkline wall. Use limited colors and direct labels.',
  },
  {
    id: 'story-before-after-impact-proof',
    name: 'Before / After Impact Proof',
    description: 'Case study slide combining before/after panels, waterfall impact, and outcome metric stack.',
    complexity: 'advanced',
    bestFor: ['case study', 'sales proof', 'transformation result'],
    preferredTemplates: ['cinematic-case-study-system', 'product-os-launch'],
    graphStyles: ['viz-waterfall-impact-bridge', 'viz-slopegraph-change-story'],
    objectBlocks: ['object-before-after-proof', 'object-three-metric-stack', 'object-image-caption-story'],
    layoutZones: ['left before/after split', 'right impact bridge', 'bottom metrics', 'caption rail'],
    dataInputs: ['before state', 'after state', 'drivers', 'metrics', 'proof image', 'caption'],
    narrativePattern: 'Before pain → change drivers → after outcome → proof metrics.',
    insertionPrompt: 'Build a Before / After Impact Proof slide with visual comparison, waterfall impact, metric stack, and proof caption.',
  },
  {
    id: 'story-cohort-action-system',
    name: 'Cohort Action System',
    description: 'Retention or engagement slide pairing cohort heatmap with action recommendations by segment.',
    complexity: 'advanced',
    bestFor: ['training follow-through', 'SaaS retention', 'audience engagement'],
    preferredTemplates: ['immersive-workshop-lab', 'product-os-launch', 'data-observatory-pro'],
    graphStyles: ['viz-cohort-retention-grid', 'viz-lollipop-priority-chart'],
    objectBlocks: ['object-workshop-agenda-card', 'object-chart-insight-module'],
    layoutZones: ['large cohort grid', 'right action list', 'top engagement score', 'bottom next steps'],
    dataInputs: ['cohorts', 'periods', 'retention values', 'segments', 'actions'],
    narrativePattern: 'Which cohorts retained → where engagement drops → what actions recover momentum.',
    insertionPrompt: 'Build a Cohort Action System with cohort grid, priority actions, and engagement score. Use one-hue intensity scale.',
  },
  {
    id: 'story-portfolio-decision-board',
    name: 'Portfolio Decision Board',
    description: 'Decision slide combining treemap allocation, quadrant matrix, and investment recommendation.',
    complexity: 'boardroom',
    bestFor: ['portfolio allocation', 'budget planning', 'resource decisions'],
    preferredTemplates: ['boardroom-decision-pack', 'data-observatory-pro'],
    graphStyles: ['viz-treemap-portfolio-map', 'viz-quadrant-priority-matrix', 'viz-dot-plot-rank-comparison'],
    objectBlocks: ['object-risk-signal-card', 'object-chart-insight-module'],
    layoutZones: ['left treemap', 'right quadrant matrix', 'bottom recommendation cards', 'top allocation summary'],
    dataInputs: ['portfolio items', 'values', 'impact scores', 'effort scores', 'recommendation'],
    narrativePattern: 'Where resources sit → what creates value → what to invest in next.',
    insertionPrompt: 'Build a Portfolio Decision Board with treemap, quadrant matrix, and recommendation cards. Highlight invest/hold/reduce decisions.',
  },
  {
    id: 'story-forecast-scenario-room',
    name: 'Forecast Scenario Room',
    description: 'Forecast slide with annotated line, forecast band, scenario cards, and decision threshold.',
    complexity: 'expert',
    bestFor: ['forecasting', 'strategic planning', 'market outlook'],
    preferredTemplates: ['data-observatory-pro', 'thought-leadership-editorial', 'boardroom-decision-pack'],
    graphStyles: ['viz-annotated-line-story', 'viz-bullet-performance-bars'],
    objectBlocks: ['object-chart-insight-module', 'object-risk-signal-card'],
    layoutZones: ['hero forecast chart', 'scenario cards', 'decision threshold band', 'source footer'],
    dataInputs: ['historical values', 'forecast range', 'scenario names', 'threshold', 'source'],
    narrativePattern: 'Trend to date → possible futures → threshold to watch → decision trigger.',
    insertionPrompt: 'Build a Forecast Scenario Room with annotated trend, forecast band, scenario cards, and decision threshold.',
  },
  {
    id: 'story-event-engagement-signal-wall',
    name: 'Event Engagement Signal Wall',
    description: 'Event performance slide with engagement KPIs, funnel, speaker/session ranking, and QR follow-up CTA.',
    complexity: 'advanced',
    bestFor: ['event recap', 'sponsor report', 'conference analytics'],
    preferredTemplates: ['global-launch-keynote', 'event-experience-system'],
    graphStyles: ['viz-kpi-ticker-strip', 'viz-funnel-conversion-stack', 'viz-lollipop-priority-chart'],
    objectBlocks: ['object-speaker-feature-card', 'object-qr-resource-cta', 'object-sponsor-logo-rail'],
    layoutZones: ['top KPI ticker', 'left engagement funnel', 'right session ranking', 'bottom QR CTA and sponsor rail'],
    dataInputs: ['registrations', 'attendance', 'session scores', 'speaker names', 'follow-up link', 'sponsor logos'],
    narrativePattern: 'Reach → engagement → content winners → follow-up action.',
    insertionPrompt: 'Build an Event Engagement Signal Wall with KPI ticker, funnel, session ranking, QR CTA, and sponsor rail.',
  },
  {
    id: 'story-editorial-data-proof-page',
    name: 'Editorial Data Proof Page',
    description: 'Magazine-style slide combining pull quote, supporting chart, image caption, and one thesis sentence.',
    complexity: 'advanced',
    bestFor: ['thought leadership', 'insight report', 'keynote essay'],
    preferredTemplates: ['thought-leadership-editorial', 'editorial-light'],
    graphStyles: ['viz-annotated-line-story', 'viz-donut-share-system', 'viz-lollipop-priority-chart'],
    objectBlocks: ['object-editorial-quote-pull', 'object-image-caption-story', 'object-chart-insight-module'],
    layoutZones: ['left editorial quote', 'right supporting chart', 'bottom image caption', 'top thesis line'],
    dataInputs: ['thesis', 'quote', 'attribution', 'chart data', 'image', 'caption'],
    narrativePattern: 'Thesis → human quote → data proof → visual context.',
    insertionPrompt: 'Build an Editorial Data Proof Page with thesis, quote, supporting chart, and image-caption story block.',
  },
];

export const getAdvancedDataStoryBlocksForTemplate = (templateId: string) => ADVANCED_DATA_STORY_BLOCKS.filter((block) => block.preferredTemplates.includes(templateId));

export const buildAdvancedDataStoryPromptBlock = (templateId: string) => {
  const blocks = getAdvancedDataStoryBlocksForTemplate(templateId);
  return [
    'ADVANCED DATA STORY BLOCKS',
    `Template: ${templateId}`,
    'Use these compound blocks when a single chart is not enough. Every block must remain editable, readable, and source-aware.',
    ...blocks.map((block) => `- ${block.name} [${block.complexity}]: ${block.insertionPrompt}`),
  ].join('\n');
};
