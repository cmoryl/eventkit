import type { PresentationAssetSlot } from './presentationDragDropAssetKits';

export type PresentationExtendedSystemAssetCategory =
  | 'master-system'
  | 'navigation-system'
  | 'data-system'
  | 'governance-system'
  | 'global-system'
  | 'export-system'
  | 'accessibility-system'
  | 'motion-system'
  | 'workshop-system'
  | 'cta-system';

export interface PresentationExtendedSystemAsset {
  id: string;
  name: string;
  category: PresentationExtendedSystemAssetCategory;
  description: string;
  slots: PresentationAssetSlot[];
  preferredTemplates: string[];
  components: string[];
  variants: string[];
  usageRules: string[];
  promptHint: string;
}

export const PRESENTATION_EXTENDED_SYSTEM_ASSETS: PresentationExtendedSystemAsset[] = [
  {
    id: 'extended-master-background-system',
    name: 'Master Background System',
    category: 'master-system',
    description: 'Reusable title, section, data, quote, and closing backgrounds.',
    slots: ['background', 'texture', 'orb'],
    preferredTemplates: ['enterprise-ai-nexus', 'transperfect-2026', 'boardroom-decision-pack'],
    components: ['title background', 'section background', 'data background', 'quote background', 'closing background'],
    variants: ['dark orb', 'light report', 'global grid', 'editorial texture', 'data observatory'],
    usageRules: ['preserve title-safe space', 'avoid fake text', 'support 16:9 and 4:3 crop zones'],
    promptHint: 'Create reusable PowerPoint master backgrounds with safe areas, dark/light modes, and no fake text.',
  },
  {
    id: 'extended-navigation-agenda-system',
    name: 'Navigation + Agenda System',
    category: 'navigation-system',
    description: 'Agenda, breadcrumb, progress rail, and section-navigation assets for long decks.',
    slots: ['ui-panel', 'icon'],
    preferredTemplates: ['boardroom-decision-pack', 'immersive-workshop-lab', 'global-launch-keynote'],
    components: ['agenda rail', 'breadcrumb row', 'progress dots', 'chapter chip', 'current-section highlight'],
    variants: ['horizontal rail', 'vertical sidebar', 'top breadcrumb', 'workshop rail', 'executive agenda cards'],
    usageRules: ['keep compact', 'do not compete with content', 'make current section obvious'],
    promptHint: 'Create compact navigation assets with breadcrumb, progress, and current-section states.',
  },
  {
    id: 'extended-data-annotation-system',
    name: 'Data Annotation System',
    category: 'data-system',
    description: 'Reusable chart annotations, source labels, insight bands, benchmark markers, and recommendation chips.',
    slots: ['chart', 'icon', 'ui-panel'],
    preferredTemplates: ['data-observatory-pro', 'boardroom-decision-pack', 'enterprise-ai-nexus'],
    components: ['source footer', 'insight band', 'numbered callout', 'benchmark marker', 'recommendation chip'],
    variants: ['executive calm', 'dark observatory', 'light report', 'urgent risk', 'forecast note'],
    usageRules: ['directly label data', 'include source label', 'avoid tiny labels', 'support accessible contrast'],
    promptHint: 'Create reusable data annotation assets with insight bands, source labels, callouts, and benchmark markers.',
  },
  {
    id: 'extended-governance-qa-system',
    name: 'Governance + QA System',
    category: 'governance-system',
    description: 'Review-state assets for brand approval, logo verification, accessibility, and export readiness.',
    slots: ['icon', 'ui-panel', 'logo'],
    preferredTemplates: ['brand-governance-kit', 'transperfect-2026', 'boardroom-decision-pack'],
    components: ['approval stamp', 'needs-review stamp', 'logo-safe-zone marker', 'contrast badge', 'PPTX-ready chip'],
    variants: ['approved', 'needs review', 'logo verified', 'accessibility pass', 'export ready'],
    usageRules: ['keep review text editable', 'show verification state clearly', 'use strong contrast'],
    promptHint: 'Create QA assets with approval states, logo verification, accessibility badges, and export-readiness chips.',
  },
  {
    id: 'extended-global-localization-system',
    name: 'Global + Localization System',
    category: 'global-system',
    description: 'Global map, language, locale, market, and regional signal assets.',
    slots: ['map', 'icon', 'ui-panel'],
    preferredTemplates: ['transperfect-2026', 'global-launch-keynote', 'data-observatory-pro'],
    components: ['region cards', 'market pins', 'language chips', 'locale status badges', 'coverage legend'],
    variants: ['global coverage', 'regional focus', 'language matrix', 'market launch', 'localization readiness'],
    usageRules: ['source data for claims', 'avoid unsupported map coloring', 'use simplified maps and direct labels'],
    promptHint: 'Create global/localization assets with region cards, map pins, language chips, and coverage legends.',
  },
  {
    id: 'extended-export-handoff-system',
    name: 'Export + Handoff System',
    category: 'export-system',
    description: 'Final handoff, source notes, appendix, versioning, and print/digital readiness assets.',
    slots: ['ui-panel', 'qr', 'icon'],
    preferredTemplates: ['boardroom-decision-pack', 'product-os-launch', 'brand-governance-kit'],
    components: ['version badge', 'source note rail', 'appendix divider', 'file-ready checklist', 'print/digital toggle'],
    variants: ['client handoff', 'internal draft', 'print ready', 'digital ready', 'appendix ready'],
    usageRules: ['version info editable', 'QR must scan', 'source notes readable'],
    promptHint: 'Create handoff assets for versioning, source notes, appendix dividers, and print/digital states.',
  },
  {
    id: 'extended-accessibility-system',
    name: 'Accessibility Overlay System',
    category: 'accessibility-system',
    description: 'Contrast checks, reading-order markers, alt-text reminders, and accessible chart labels.',
    slots: ['icon', 'ui-panel', 'chart'],
    preferredTemplates: ['brand-governance-kit', 'data-observatory-pro', 'boardroom-decision-pack'],
    components: ['contrast badge', 'alt-text reminder', 'reading order marker', 'accessible chart label', 'color-safe legend'],
    variants: ['AA pass', 'AAA pass', 'contrast review', 'alt text missing', 'chart label required'],
    usageRules: ['do not obscure final art', 'work as review overlay', 'use accessible contrast'],
    promptHint: 'Create accessibility overlay assets for contrast, alt text, reading order, and chart labels.',
  },
  {
    id: 'extended-motion-storyboard-system',
    name: 'Motion Storyboard System',
    category: 'motion-system',
    description: 'Storyboard assets for animation builds, slide pacing, and static export-safe motion cues.',
    slots: ['ui-panel', 'icon', 'gallery'],
    preferredTemplates: ['global-launch-keynote', 'product-os-launch', 'enterprise-ai-nexus'],
    components: ['build step marker', 'motion arrow', 'reveal state card', 'speaker cue', 'transition note'],
    variants: ['fade build', 'data reveal', 'product reveal', 'chapter transition', 'speaker cue'],
    usageRules: ['motion cues optional', 'static export must work', 'speaker notes editable'],
    promptHint: 'Create storyboard assets for build steps, reveal states, transitions, and speaker pacing cues.',
  },
  {
    id: 'extended-workshop-facilitation-system',
    name: 'Workshop Facilitation System',
    category: 'workshop-system',
    description: 'Facilitator assets for activities, breakouts, exercises, voting, timing, and output capture.',
    slots: ['ui-panel', 'icon', 'qr'],
    preferredTemplates: ['immersive-workshop-lab', 'global-launch-keynote', 'brand-governance-kit'],
    components: ['activity card', 'timebox chip', 'breakout label', 'voting dot', 'output capture panel'],
    variants: ['warmup', 'breakout', 'vote', 'share-out', 'decision capture'],
    usageRules: ['show timebox clearly', 'keep instructions short', 'capture outputs visibly'],
    promptHint: 'Create workshop assets for activities, timeboxes, voting, breakout labels, and output capture.',
  },
  {
    id: 'extended-cta-resource-system',
    name: 'CTA + Resource System',
    category: 'cta-system',
    description: 'CTA, contact, QR, download, meeting, and next-step assets for follow-up slides.',
    slots: ['qr', 'ui-panel', 'icon'],
    preferredTemplates: ['product-os-launch', 'global-launch-keynote', 'event-experience-system'],
    components: ['primary CTA card', 'secondary action chip', 'contact rail', 'download QR block', 'resource list'],
    variants: ['scan to download', 'book a meeting', 'contact team', 'view resources', 'join session'],
    usageRules: ['QR must scan', 'CTA concise', 'contact details editable'],
    promptHint: 'Create CTA assets for downloads, meetings, contact rails, QR panels, and resource lists.',
  },
];

export const getExtendedSystemAssetsForTemplate = (templateId: string) => PRESENTATION_EXTENDED_SYSTEM_ASSETS.filter((asset) => asset.preferredTemplates.includes(templateId));

export const getExtendedSystemAssetsByCategory = (category: PresentationExtendedSystemAssetCategory) => PRESENTATION_EXTENDED_SYSTEM_ASSETS.filter((asset) => asset.category === category);

export const buildExtendedSystemAssetPromptBlock = (templateId?: string) => {
  const assets = templateId ? getExtendedSystemAssetsForTemplate(templateId) : PRESENTATION_EXTENDED_SYSTEM_ASSETS;
  return [
    'EXTENDED PRESENTATION SYSTEM ASSETS',
    templateId ? `Template: ${templateId}` : 'Template: any',
    'Use these system assets to make decks complete, governed, navigable, accessible, and export-ready.',
    ...assets.map((asset) => `- ${asset.name} [${asset.category}]: ${asset.components.join(', ')}. Rules: ${asset.usageRules.join('; ')}`),
  ].join('\n');
};
