export type PrebuiltPresentationObjectKind =
  | 'kpi-card'
  | 'metric-stack'
  | 'timeline-rail'
  | 'process-map'
  | 'quote-pull'
  | 'logo-rail'
  | 'speaker-card'
  | 'qr-cta'
  | 'device-mockup'
  | 'chart-module'
  | 'comparison-block'
  | 'risk-signal'
  | 'agenda-card'
  | 'image-caption'
  | 'approval-stamp';

export interface PrebuiltPresentationObject {
  id: string;
  name: string;
  kind: PrebuiltPresentationObjectKind;
  description: string;
  bestFor: string[];
  preferredTemplates: string[];
  requiredSlots: string[];
  defaultFields: string[];
  visualTreatment: string;
  insertionPrompt: string;
}

export const PREBUILT_PRESENTATION_OBJECTS: PrebuiltPresentationObject[] = [
  {
    id: 'object-executive-kpi-card',
    name: 'Executive KPI Card',
    kind: 'kpi-card',
    description: 'Single high-impact metric with label, trend, short proof note, and confidence indicator.',
    bestFor: ['executive summary', 'board update', 'results slide', 'case study proof'],
    preferredTemplates: ['boardroom-decision-pack', 'cinematic-case-study-system', 'data-observatory-pro'],
    requiredSlots: ['metric', 'label', 'trend', 'proof note'],
    defaultFields: ['3.4x', 'Faster turnaround', '+18% QoQ', 'Validated against last-quarter baseline'],
    visualTreatment: 'Large number, small supporting label, thin accent line, compact trend chip, premium consulting spacing.',
    insertionPrompt: 'Insert an Executive KPI Card with a large metric, short label, trend chip, and one proof note. Keep it editable and avoid overcrowding.',
  },
  {
    id: 'object-three-metric-stack',
    name: 'Three-Metric Stack',
    kind: 'metric-stack',
    description: 'Vertical or horizontal stack of three related metrics with concise captions.',
    bestFor: ['results proof', 'product value', 'operations summary'],
    preferredTemplates: ['data-observatory-pro', 'product-os-launch', 'enterprise-ai-nexus'],
    requiredSlots: ['metric 1', 'metric 2', 'metric 3', 'caption'],
    defaultFields: ['42%', '2.1x', '18 days', 'Measured impact across pilot group'],
    visualTreatment: 'Three equal cards with subtle glass backgrounds, shared accent bar, and crisp numeric hierarchy.',
    insertionPrompt: 'Insert a Three-Metric Stack using three equal cards. Make the numbers oversized and captions short.',
  },
  {
    id: 'object-roadmap-rail',
    name: 'Roadmap Rail',
    kind: 'timeline-rail',
    description: 'Four-step roadmap with phase labels, dates, owners, and deliverables.',
    bestFor: ['implementation plan', 'event plan', 'product roadmap', 'AI rollout'],
    preferredTemplates: ['enterprise-ai-nexus', 'product-os-launch', 'event-experience-system'],
    requiredSlots: ['phase', 'date', 'owner', 'deliverable'],
    defaultFields: ['Discover', 'Design', 'Deploy', 'Scale'],
    visualTreatment: 'Glowing horizontal rail, milestone cards, small owner chips, clear phase progression.',
    insertionPrompt: 'Insert a Roadmap Rail with four editable phases, date chips, owners, and one deliverable per phase.',
  },
  {
    id: 'object-operating-model-map',
    name: 'Operating Model Map',
    kind: 'process-map',
    description: 'Layered process map for people, process, platform, governance, and measurement.',
    bestFor: ['AI transformation', 'platform strategy', 'workflow redesign'],
    preferredTemplates: ['enterprise-ai-nexus', 'boardroom-decision-pack', 'brand-governance-kit'],
    requiredSlots: ['layer title', 'layer description', 'connection labels'],
    defaultFields: ['People', 'Process', 'Platform', 'Governance', 'Measurement'],
    visualTreatment: 'Stacked horizontal layers with connecting nodes and restrained icon system.',
    insertionPrompt: 'Insert an Operating Model Map as five editable layers with short descriptors and visible governance connections.',
  },
  {
    id: 'object-editorial-quote-pull',
    name: 'Editorial Quote Pull',
    kind: 'quote-pull',
    description: 'Large pull quote with attribution, image caption, and optional theme tag.',
    bestFor: ['thought leadership', 'case study', 'keynote section break'],
    preferredTemplates: ['thought-leadership-editorial', 'cinematic-case-study-system', 'editorial-light'],
    requiredSlots: ['quote', 'attribution', 'context tag'],
    defaultFields: ['The best systems make the complex feel inevitable.', 'Executive sponsor', 'Key insight'],
    visualTreatment: 'Oversized quote marks, editorial crop, generous whitespace, one warm accent rule.',
    insertionPrompt: 'Insert an Editorial Quote Pull with one large editable quote, attribution, and optional context tag.',
  },
  {
    id: 'object-sponsor-logo-rail',
    name: 'Sponsor Logo Rail',
    kind: 'logo-rail',
    description: 'Controlled row of sponsor/partner logos with safe spacing and no distortion.',
    bestFor: ['event opener', 'sponsorship deck', 'partner slide', 'closing credits'],
    preferredTemplates: ['global-launch-keynote', 'event-experience-system', 'brand-governance-kit'],
    requiredSlots: ['logo 1', 'logo 2', 'logo 3', 'logo 4'],
    defaultFields: ['Partner logo', 'Sponsor logo', 'Media partner', 'Community partner'],
    visualTreatment: 'Equal logo cells, safe-zone padding, subtle separators, neutral background strip.',
    insertionPrompt: 'Insert a Sponsor Logo Rail with equal logo cells and strict no-stretch/no-redraw logo handling.',
  },
  {
    id: 'object-speaker-feature-card',
    name: 'Speaker Feature Card',
    kind: 'speaker-card',
    description: 'Speaker headshot, name, title, session, and short credential statement.',
    bestFor: ['event agenda', 'keynote lineup', 'webinar deck'],
    preferredTemplates: ['global-launch-keynote', 'event-experience-system', 'immersive-workshop-lab'],
    requiredSlots: ['headshot', 'name', 'title', 'session', 'credential'],
    defaultFields: ['Speaker Name', 'Title / Organization', 'Session topic', 'One-sentence credential'],
    visualTreatment: 'Cinematic image crop, dark overlay, clear type stack, small session chip.',
    insertionPrompt: 'Insert a Speaker Feature Card with image crop, name, title, session chip, and credential line.',
  },
  {
    id: 'object-qr-resource-cta',
    name: 'QR Resource CTA',
    kind: 'qr-cta',
    description: 'End-slide resource block with QR code, short URL, value statement, and contact CTA.',
    bestFor: ['closing slide', 'resource handout', 'event follow-up', 'sales handoff'],
    preferredTemplates: ['global-launch-keynote', 'product-os-launch', 'event-experience-system'],
    requiredSlots: ['qr code', 'CTA headline', 'short URL', 'contact line'],
    defaultFields: ['Scan for resources', 'Get the toolkit', 'your.link/resources', 'Contact the team'],
    visualTreatment: 'Large QR block, bold CTA line, small resource description, clean safe margins.',
    insertionPrompt: 'Insert a QR Resource CTA with a large QR placeholder, CTA headline, short URL, and contact line.',
  },
  {
    id: 'object-device-ui-mockup',
    name: 'Device UI Mockup',
    kind: 'device-mockup',
    description: 'Laptop or tablet frame with dashboard/product screenshot drop zone and feature callouts.',
    bestFor: ['product launch', 'platform demo', 'case study proof'],
    preferredTemplates: ['product-os-launch', 'enterprise-ai-nexus', 'data-observatory-pro'],
    requiredSlots: ['screenshot', 'callout 1', 'callout 2', 'caption'],
    defaultFields: ['Screenshot drop zone', 'Feature one', 'Feature two', 'Product interface preview'],
    visualTreatment: 'Realistic device frame, glass UI overlay, two callout pins, soft shadow.',
    insertionPrompt: 'Insert a Device UI Mockup with a screenshot drop zone, two editable callouts, and caption.',
  },
  {
    id: 'object-chart-insight-module',
    name: 'Chart Insight Module',
    kind: 'chart-module',
    description: 'Chart area with one-line insight, source note, and recommendation chip.',
    bestFor: ['data storytelling', 'business review', 'strategy deck'],
    preferredTemplates: ['data-observatory-pro', 'boardroom-decision-pack', 'enterprise-ai-nexus'],
    requiredSlots: ['chart', 'insight', 'source', 'recommendation'],
    defaultFields: ['Chart drop zone', 'Primary insight', 'Source note', 'Recommended action'],
    visualTreatment: 'Large chart frame, thin source footer, high-contrast insight band, small action chip.',
    insertionPrompt: 'Insert a Chart Insight Module with a chart frame, one-line insight, source note, and recommendation chip.',
  },
  {
    id: 'object-before-after-proof',
    name: 'Before / After Proof Block',
    kind: 'comparison-block',
    description: 'Two-column before/after comparison with outcome proof and visual evidence slots.',
    bestFor: ['case study', 'transformation story', 'product improvement'],
    preferredTemplates: ['cinematic-case-study-system', 'product-os-launch', 'boardroom-decision-pack'],
    requiredSlots: ['before image', 'after image', 'before points', 'after points', 'outcome'],
    defaultFields: ['Before', 'After', 'Manual workflow', 'Automated workflow', 'Outcome achieved'],
    visualTreatment: 'Cinematic split panel, clear before/after headings, outcome badge centered between panels.',
    insertionPrompt: 'Insert a Before / After Proof Block with image slots, concise bullet pairs, and an outcome badge.',
  },
  {
    id: 'object-risk-signal-card',
    name: 'Risk Signal Card',
    kind: 'risk-signal',
    description: 'Risk/opportunity/status card with severity indicator, mitigation, and owner.',
    bestFor: ['executive decision', 'governance review', 'project update'],
    preferredTemplates: ['boardroom-decision-pack', 'brand-governance-kit', 'enterprise-ai-nexus'],
    requiredSlots: ['signal', 'severity', 'mitigation', 'owner'],
    defaultFields: ['Risk signal', 'Medium', 'Mitigation plan', 'Owner'],
    visualTreatment: 'Compact status card, colored severity dot, owner chip, short mitigation line.',
    insertionPrompt: 'Insert a Risk Signal Card with severity dot, signal title, owner chip, and mitigation line.',
  },
  {
    id: 'object-workshop-agenda-card',
    name: 'Workshop Agenda Card',
    kind: 'agenda-card',
    description: 'Time-boxed agenda item with objective, activity type, and output.',
    bestFor: ['training', 'workshop', 'breakout session', 'facilitator guide'],
    preferredTemplates: ['immersive-workshop-lab', 'event-experience-system', 'global-launch-keynote'],
    requiredSlots: ['time', 'activity', 'objective', 'output'],
    defaultFields: ['10:00', 'Breakout exercise', 'Align on objectives', 'Output: decision matrix'],
    visualTreatment: 'Friendly card, time chip, activity icon placeholder, objective/output stack.',
    insertionPrompt: 'Insert a Workshop Agenda Card with time chip, activity name, objective, and expected output.',
  },
  {
    id: 'object-image-caption-story',
    name: 'Image Caption Story Block',
    kind: 'image-caption',
    description: 'Large image crop with caption, short insight, and optional source/context line.',
    bestFor: ['editorial deck', 'case study', 'event recap', 'thought leadership'],
    preferredTemplates: ['thought-leadership-editorial', 'cinematic-case-study-system', 'global-launch-keynote'],
    requiredSlots: ['image', 'caption', 'insight', 'source'],
    defaultFields: ['Image drop zone', 'Caption', 'Why it matters', 'Source/context'],
    visualTreatment: 'Editorial image crop, small caption rail, one insight sentence, restrained accent rule.',
    insertionPrompt: 'Insert an Image Caption Story Block with large image, caption rail, insight sentence, and source note.',
  },
  {
    id: 'object-brand-approval-stamp',
    name: 'Brand Approval Stamp',
    kind: 'approval-stamp',
    description: 'Approval badge for exact logo, contrast, spacing, and export readiness.',
    bestFor: ['brand governance', 'preflight', 'QA review', 'handoff slide'],
    preferredTemplates: ['brand-governance-kit', 'transperfect-2026', 'boardroom-decision-pack'],
    requiredSlots: ['status', 'reviewer', 'date', 'notes'],
    defaultFields: ['Approved', 'Reviewer', 'Date', 'No logo modifications detected'],
    visualTreatment: 'Compact approval pill, check icon, metadata row, clear status color.',
    insertionPrompt: 'Insert a Brand Approval Stamp with editable status, reviewer, date, and review notes.',
  },
];

export const getPrebuiltObjectsForTemplate = (templateId: string) => {
  return PREBUILT_PRESENTATION_OBJECTS.filter((object) => object.preferredTemplates.includes(templateId));
};

export const buildPrebuiltObjectPromptBlock = (templateId: string) => {
  const objects = getPrebuiltObjectsForTemplate(templateId);
  return [
    'PREBUILT PRESENTATION OBJECTS',
    `Template: ${templateId}`,
    'Use these editable objects when they strengthen clarity. Keep all objects brand-safe and editable.',
    ...objects.map((object) => `- ${object.name} [${object.kind}]: ${object.insertionPrompt}`),
  ].join('\n');
};
