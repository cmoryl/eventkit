import type { SlideData } from '@/components/slides/slideTypes';

export type LiveSlideActionCategory = 'edit' | 'style' | 'data' | 'media' | 'motion' | 'brand' | 'qa';

export interface LiveSlideAction {
  id: string;
  label: string;
  category: LiveSlideActionCategory;
  description: string;
  target: 'slide' | 'title' | 'subtitle' | 'body' | 'image' | 'chart' | 'stats' | 'timeline' | 'process' | 'parallax' | 'template';
  enabled: boolean;
  reason?: string;
}

const alwaysOnActions: LiveSlideAction[] = [
  { id: 'inline-edit-title', label: 'Title', category: 'edit', description: 'Edit the slide title directly on canvas.', target: 'title', enabled: true },
  { id: 'inline-edit-body', label: 'Copy', category: 'edit', description: 'Edit body copy, bullets, or narrative blocks.', target: 'body', enabled: true },
  { id: 'style-slide', label: 'Style', category: 'style', description: 'Open visual controls for variant, background, typography, and spacing.', target: 'slide', enabled: true },
  { id: 'layout-remix', label: 'Remix', category: 'style', description: 'Try a different layout or layout variation while preserving content.', target: 'slide', enabled: true },
  { id: 'brand-guardrails', label: 'Brand', category: 'brand', description: 'Run brand checks and apply safe brand styling.', target: 'slide', enabled: true },
  { id: 'qa-slide', label: 'QA', category: 'qa', description: 'Check readability, density, notes, brand usage, and export readiness.', target: 'slide', enabled: true },
];

export const buildLiveSlideActions = (slide: SlideData): LiveSlideAction[] => {
  const actions = [...alwaysOnActions];

  if (slide.subtitle) {
    actions.push({ id: 'inline-edit-subtitle', label: 'Subtitle', category: 'edit', description: 'Edit subtitle, eyebrow, or supporting text.', target: 'subtitle', enabled: true });
  }

  if (slide.imageUrl || slide.images?.length || ['image-left', 'image-right', 'full-image'].includes(slide.layout)) {
    actions.push(
      { id: 'replace-image', label: 'Replace image', category: 'media', description: 'Replace the live image from BrandHub, upload, or generated assets.', target: 'image', enabled: true },
      { id: 'crop-image', label: 'Crop/mask', category: 'media', description: 'Open crop, mask, opacity, and treatment controls.', target: 'image', enabled: true },
    );
  }

  if (slide.chart || slide.layout === 'chart') {
    actions.push({ id: 'edit-chart', label: 'Chart data', category: 'data', description: 'Edit chart data, labels, chart type, and scale.', target: 'chart', enabled: Boolean(slide.chart), reason: slide.chart ? undefined : 'No chart data on this slide yet.' });
  }

  if (slide.stats?.length || slide.layout === 'stats') {
    actions.push({ id: 'edit-stats', label: 'Stats', category: 'data', description: 'Edit KPI/stat values, labels, order, and emphasis.', target: 'stats', enabled: true });
  }

  if (slide.timeline?.length || slide.layout === 'timeline') {
    actions.push({ id: 'edit-timeline', label: 'Timeline', category: 'data', description: 'Edit milestone dates, titles, descriptions, and sequence.', target: 'timeline', enabled: true });
  }

  if (slide.process?.length || slide.layout === 'process') {
    actions.push({ id: 'edit-process', label: 'Process', category: 'data', description: 'Edit process steps and supporting descriptions.', target: 'process', enabled: true });
  }

  if (slide.parallaxLayers?.length || slide.layout === 'parallax') {
    actions.push({ id: 'edit-motion', label: 'Motion', category: 'motion', description: 'Edit parallax layers, depth, blur, scale, opacity, and motion intensity.', target: 'parallax', enabled: true });
  }

  if (slide.layout === 'demo-mock') {
    actions.push({ id: 'edit-template-regions', label: 'Template regions', category: 'style', description: 'Move, hide, duplicate, recolor, or swap live template regions.', target: 'template', enabled: true });
  }

  return actions;
};

export const getDefaultLiveActionForSlide = (slide: SlideData): LiveSlideAction => {
  const actions = buildLiveSlideActions(slide);
  if (slide.layout === 'chart') return actions.find((action) => action.id === 'edit-chart') || actions[0];
  if (slide.layout === 'stats') return actions.find((action) => action.id === 'edit-stats') || actions[0];
  if (slide.layout === 'timeline') return actions.find((action) => action.id === 'edit-timeline') || actions[0];
  if (slide.layout === 'process') return actions.find((action) => action.id === 'edit-process') || actions[0];
  if (slide.layout === 'parallax') return actions.find((action) => action.id === 'edit-motion') || actions[0];
  if (slide.imageUrl || slide.images?.length) return actions.find((action) => action.id === 'replace-image') || actions[0];
  return actions[0];
};
