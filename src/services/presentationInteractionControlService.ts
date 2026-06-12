import type { SlideData } from '@/components/slides/slideTypes';

export type PresentationControlCategory =
  | 'content'
  | 'layout'
  | 'visual'
  | 'data'
  | 'media'
  | 'motion'
  | 'brand'
  | 'export';

export type PresentationControlLevel = 'slide' | 'section' | 'element' | 'deck';

export interface PresentationInteractionControl {
  id: string;
  label: string;
  category: PresentationControlCategory;
  level: PresentationControlLevel;
  description: string;
  enabled: boolean;
  reason?: string;
}

export interface PresentationInteractionModel {
  slideId: string;
  layout: SlideData['layout'];
  controls: PresentationInteractionControl[];
  summary: {
    total: number;
    enabled: number;
    elementLevel: number;
    categories: PresentationControlCategory[];
  };
}

const baseControls: PresentationInteractionControl[] = [
  { id: 'edit-title', label: 'Edit title', category: 'content', level: 'element', description: 'Inline-edit the slide title text.', enabled: true },
  { id: 'edit-subtitle', label: 'Edit subtitle', category: 'content', level: 'element', description: 'Inline-edit subtitle/eyebrow/supporting text.', enabled: true },
  { id: 'edit-body', label: 'Edit body copy', category: 'content', level: 'element', description: 'Edit body copy, bullets, or narrative text.', enabled: true },
  { id: 'change-layout', label: 'Change layout', category: 'layout', level: 'slide', description: 'Switch between title, content, image, stats, chart, timeline, process, and parallax layouts.', enabled: true },
  { id: 'layout-variation', label: 'Layout variation', category: 'layout', level: 'slide', description: 'Choose alternate compositions inside the current layout family.', enabled: true },
  { id: 'theme-variant', label: 'Theme variant', category: 'visual', level: 'slide', description: 'Switch default, dark, gradient, minimal, brand, or bold variants.', enabled: true },
  { id: 'background-control', label: 'Background control', category: 'visual', level: 'slide', description: 'Adjust color, image, opacity, and background effect.', enabled: true },
  { id: 'brand-assets', label: 'Brand asset replace', category: 'media', level: 'element', description: 'Replace imagery from BrandHub or Brand Assets.', enabled: true },
  { id: 'notes-edit', label: 'Speaker notes', category: 'content', level: 'slide', description: 'Edit presenter notes and talking points.', enabled: true },
  { id: 'brand-check', label: 'Brand check', category: 'brand', level: 'slide', description: 'Check brand color, font, logo, and style-system compliance.', enabled: true },
  { id: 'export-readiness', label: 'Export readiness', category: 'export', level: 'slide', description: 'Flag slide issues before PPTX/PDF export.', enabled: true },
];

const layoutSpecificControls = (slide: SlideData): PresentationInteractionControl[] => {
  const controls: PresentationInteractionControl[] = [];

  if (slide.layout === 'stats' || slide.stats?.length) {
    controls.push({ id: 'edit-stats', label: 'Edit stat cards', category: 'data', level: 'element', description: 'Edit stat values, labels, order, and emphasis.', enabled: true });
  }

  if (slide.layout === 'chart' || slide.chart) {
    controls.push({ id: 'edit-chart-data', label: 'Edit chart data', category: 'data', level: 'element', description: 'Edit chart series, labels, values, and chart type.', enabled: Boolean(slide.chart), reason: slide.chart ? undefined : 'No chart data on this slide.' });
  }

  if (slide.layout === 'timeline' || slide.timeline?.length) {
    controls.push({ id: 'edit-timeline', label: 'Edit timeline', category: 'data', level: 'element', description: 'Edit milestones, dates, descriptions, and sequence.', enabled: true });
  }

  if (slide.layout === 'process' || slide.process?.length) {
    controls.push({ id: 'edit-process', label: 'Edit process steps', category: 'data', level: 'element', description: 'Edit process steps, labels, and descriptions.', enabled: true });
  }

  if (slide.layout === 'parallax' || slide.parallaxLayers?.length) {
    controls.push(
      { id: 'edit-parallax-layers', label: 'Edit parallax layers', category: 'motion', level: 'element', description: 'Adjust depth, position, scale, blur, and opacity for parallax layers.', enabled: true },
      { id: 'motion-intensity', label: 'Motion intensity', category: 'motion', level: 'slide', description: 'Control parallax camera intensity and motion behavior.', enabled: true },
    );
  }

  if (slide.layout === 'demo-mock') {
    controls.push(
      { id: 'edit-demo-shapes', label: 'Edit template shapes', category: 'visual', level: 'element', description: 'Edit/hide/recolor individual demo template shapes.', enabled: true },
      { id: 'edit-demo-sections', label: 'Edit template sections', category: 'layout', level: 'section', description: 'Move, hide, or duplicate major template sections.', enabled: true },
      { id: 'edit-demo-content', label: 'Edit demo content system', category: 'content', level: 'deck', description: 'Apply content edits across the full generated template deck.', enabled: true },
    );
  }

  if (slide.imageUrl || slide.images?.length || ['image-left', 'image-right', 'full-image'].includes(slide.layout)) {
    controls.push({ id: 'edit-image-treatment', label: 'Edit image treatment', category: 'media', level: 'element', description: 'Replace, crop, opacity-adjust, or style the slide image.', enabled: true });
  }

  return controls;
};

export const buildPresentationInteractionModel = (slide: SlideData): PresentationInteractionModel => {
  const controls = [...baseControls, ...layoutSpecificControls(slide)];
  const categories = Array.from(new Set(controls.map((control) => control.category)));

  return {
    slideId: slide.id,
    layout: slide.layout,
    controls,
    summary: {
      total: controls.length,
      enabled: controls.filter((control) => control.enabled).length,
      elementLevel: controls.filter((control) => control.level === 'element').length,
      categories,
    },
  };
};

export const getMaximumInteractionRoadmap = () => [
  'Inline text editing for every text-bearing region.',
  'Element-level select, drag, resize, nudge, duplicate, hide, lock, and arrange controls.',
  'Layer panel with foreground/background depth and z-order for every live slide.',
  'Chart/stat/timeline/process data editors with no-code structured editing.',
  'Image crop, mask, opacity, replacement, and BrandHub asset controls.',
  'Parallax layer controls for depth, scale, blur, opacity, and motion intensity.',
  'Brand-safe guardrails that prevent off-brand colors, fake logos, and export failures.',
  'Keyboard shortcuts, multi-select, snapping, alignment, guides, and undo/redo history.',
];
