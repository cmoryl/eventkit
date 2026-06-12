import type { SlideData } from '@/components/slides/slideTypes';
import type { LiveSlideAction } from './presentationLiveActionRegistry';
import type { PresentationInteractionControl } from './presentationInteractionControlService';

export type LiveControlInspectorMode =
  | 'inline_text'
  | 'layout'
  | 'style'
  | 'background'
  | 'media'
  | 'crop'
  | 'chart'
  | 'stats'
  | 'timeline'
  | 'process'
  | 'parallax'
  | 'template_regions'
  | 'brand'
  | 'qa'
  | 'notes'
  | 'export';

export interface LiveControlResolution {
  mode: LiveControlInspectorMode;
  label: string;
  targetField?: keyof SlideData | string;
  slidePatch?: Partial<SlideData>;
  openPanel?: 'brand_assets' | 'ai_generator' | 'template_gallery' | 'properties' | 'none';
  message: string;
}

const normalizeId = (control: LiveSlideAction | PresentationInteractionControl | string) =>
  typeof control === 'string' ? control : control.id;

export const resolveLiveControl = (
  control: LiveSlideAction | PresentationInteractionControl | string,
  slide: SlideData,
): LiveControlResolution => {
  const id = normalizeId(control);

  switch (id) {
    case 'inline-edit-title':
    case 'edit-title':
      return { mode: 'inline_text', label: 'Edit title', targetField: 'title', message: 'Activate inline title editing on the live canvas.' };
    case 'inline-edit-subtitle':
    case 'edit-subtitle':
      return { mode: 'inline_text', label: 'Edit subtitle', targetField: 'subtitle', message: 'Activate inline subtitle editing on the live canvas.' };
    case 'inline-edit-body':
    case 'edit-body':
      return { mode: 'inline_text', label: 'Edit body copy', targetField: 'body', message: 'Activate inline body editing on the live canvas.' };
    case 'style-slide':
    case 'theme-variant':
      return { mode: 'style', label: 'Slide style', openPanel: 'properties', message: 'Open visual style controls for this slide.' };
    case 'layout-remix':
    case 'change-layout':
    case 'layout-variation':
      return { mode: 'layout', label: 'Layout remix', openPanel: 'properties', message: 'Open layout and variation controls while preserving slide content.' };
    case 'background-control':
      return { mode: 'background', label: 'Background controls', openPanel: 'properties', message: 'Open background color, image, and effect controls.' };
    case 'replace-image':
    case 'brand-assets':
      return { mode: 'media', label: 'Replace image', openPanel: 'brand_assets', message: 'Open Brand Assets / uploads to replace imagery.' };
    case 'crop-image':
    case 'edit-image-treatment':
      return { mode: 'crop', label: 'Crop and mask image', openPanel: 'properties', message: 'Open image crop, mask, opacity, and treatment controls.' };
    case 'edit-chart':
    case 'edit-chart-data':
      return { mode: 'chart', label: 'Chart data', targetField: 'chart', message: slide.chart ? 'Open chart data editor.' : 'Add chart data before editing this chart.' };
    case 'edit-stats':
      return { mode: 'stats', label: 'Stat cards', targetField: 'stats', message: 'Open stat value, label, order, and emphasis controls.' };
    case 'edit-timeline':
      return { mode: 'timeline', label: 'Timeline', targetField: 'timeline', message: 'Open timeline milestone editor.' };
    case 'edit-process':
      return { mode: 'process', label: 'Process steps', targetField: 'process', message: 'Open process step editor.' };
    case 'edit-motion':
    case 'edit-parallax-layers':
    case 'motion-intensity':
      return { mode: 'parallax', label: 'Motion and parallax', targetField: 'parallaxLayers', message: 'Open parallax depth, scale, blur, opacity, and intensity controls.' };
    case 'edit-template-regions':
    case 'edit-demo-shapes':
    case 'edit-demo-sections':
    case 'edit-demo-content':
      return { mode: 'template_regions', label: 'Template regions', openPanel: 'properties', message: 'Open live template region controls for demo-mock slides.' };
    case 'brand-guardrails':
    case 'brand-check':
      return { mode: 'brand', label: 'Brand guardrails', message: 'Run brand guardrails and show safe fixes.' };
    case 'qa-slide':
      return { mode: 'qa', label: 'Slide QA', message: 'Run readability, density, brand, and export-readiness QA.' };
    case 'notes-edit':
      return { mode: 'notes', label: 'Speaker notes', targetField: 'notes', openPanel: 'properties', message: 'Open speaker notes editor.' };
    case 'export-readiness':
      return { mode: 'export', label: 'Export readiness', message: 'Check PPTX export compatibility and missing assets.' };
    default:
      return { mode: 'style', label: 'Slide controls', openPanel: 'properties', message: 'Open slide properties for this control.' };
  }
};
