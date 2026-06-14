import type { DeckTemplate } from '@/components/powerpoint/composer/TemplateGallery';
import { ADVANCED_DECK_TEMPLATES } from '@/components/powerpoint/composer/advancedDeckTemplates';

export interface TemplateGalleryCollection {
  id: string;
  label: string;
  description: string;
  templateIds: string[];
}

export const TEMPLATE_GALLERY_COLLECTIONS: TemplateGalleryCollection[] = [
  {
    id: 'ai-transformation',
    label: 'AI transformation',
    description: 'Command centers, operating models, governance, and transformation narratives.',
    templateIds: ['enterprise-ai-nexus', 'transperfect-2026', 'modern-dark', 'data-observatory-pro'],
  },
  {
    id: 'global-events',
    label: 'Global events',
    description: 'Launch keynotes, venue-led decks, sponsor moments, and event experience systems.',
    templateIds: ['global-launch-keynote', 'event-experience-system', 'transperfect-2026'],
  },
  {
    id: 'executive-boardroom',
    label: 'Executive boardroom',
    description: 'Decision packs, board-ready summaries, risk signals, and KPI narratives.',
    templateIds: ['boardroom-decision-pack', 'corporate-navy', 'data-observatory-pro'],
  },
  {
    id: 'product-launch',
    label: 'Product launch',
    description: 'Product renders, UI panels, feature reveals, roadmap slides, and CTA flows.',
    templateIds: ['product-os-launch', 'vibrant-startup', 'enterprise-ai-nexus'],
  },
  {
    id: 'brand-governance',
    label: 'Brand governance',
    description: 'Logo rules, usage examples, accessibility checks, and approval gates.',
    templateIds: ['brand-governance-kit', 'transperfect-2026', 'editorial-light'],
  },
  {
    id: 'case-study-storytelling',
    label: 'Case study storytelling',
    description: 'Cinematic proof stories, before/after, outcomes, and client success narratives.',
    templateIds: ['cinematic-case-study-system', 'data-observatory-pro', 'editorial-light'],
  },
  {
    id: 'editorial-thought-leadership',
    label: 'Thought leadership',
    description: 'Magazine-style keynotes, essays, pull quotes, and strategic POV decks.',
    templateIds: ['thought-leadership-editorial', 'editorial-light', 'warm-terracotta'],
  },
  {
    id: 'workshop-training',
    label: 'Workshop and training',
    description: 'Exercises, worksheets, recap grids, learning paths, and facilitator decks.',
    templateIds: ['immersive-workshop-lab', 'vibrant-startup', 'warm-terracotta'],
  },
];

export const getAdvancedTemplateById = (templateId: string): DeckTemplate | undefined => {
  return ADVANCED_DECK_TEMPLATES.find((template) => template.id === templateId);
};

export const getTemplateGalleryCollection = (collectionId: string) => {
  const collection = TEMPLATE_GALLERY_COLLECTIONS.find((item) => item.id === collectionId);
  if (!collection) return undefined;
  return {
    ...collection,
    advancedTemplates: collection.templateIds.map(getAdvancedTemplateById).filter(Boolean) as DeckTemplate[],
  };
};

export const buildTemplateGalleryCurationPromptBlock = (collectionId?: string) => {
  const collections = collectionId
    ? TEMPLATE_GALLERY_COLLECTIONS.filter((collection) => collection.id === collectionId)
    : TEMPLATE_GALLERY_COLLECTIONS;

  return [
    'TEMPLATE GALLERY CURATION',
    'Choose a complete deck system, not a loose visual style.',
    'Prioritize templates that match audience, content type, asset needs, and export goal.',
    ...collections.map((collection) => `- ${collection.label}: ${collection.description} templates=${collection.templateIds.join(', ')}`),
  ].join('\n');
};
