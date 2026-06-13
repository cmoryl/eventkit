import type { SlideData } from '@/components/slides/slideTypes';

export type PresentationEditorZoneId =
  | 'top_toolbar'
  | 'slide_rail'
  | 'canvas'
  | 'floating_controls'
  | 'inspector'
  | 'status_bar'
  | 'command_palette';

export type PresentationEditorInteractionId =
  | 'inline_text_edit'
  | 'drag_drop_media'
  | 'slide_reorder'
  | 'quick_duplicate'
  | 'layout_swap'
  | 'brand_repair'
  | 'export_check'
  | 'keyboard_shortcuts';

export interface PresentationEditorUXZone {
  id: PresentationEditorZoneId;
  label: string;
  purpose: string;
  primaryActions: string[];
  uxRule: string;
}

export interface PresentationEditorInteraction {
  id: PresentationEditorInteractionId;
  label: string;
  trigger: string;
  feedback: string;
  successState: string;
}

export interface PresentationEditorUXState {
  activeSlideIndex: number;
  slideCount: number;
  activeLayout?: SlideData['layout'];
  zones: PresentationEditorUXZone[];
  interactions: PresentationEditorInteraction[];
  recommendedFocus: string;
  warnings: string[];
}

export const editorZones: PresentationEditorUXZone[] = [
  {
    id: 'top_toolbar',
    label: 'Top Toolbar',
    purpose: 'Global deck actions and view controls.',
    primaryActions: ['Present', 'Import', 'Gallery', 'AI Generate', 'Export', 'Save Template'],
    uxRule: 'Keep global actions persistent, compact, and grouped by job: create, view, export.',
  },
  {
    id: 'slide_rail',
    label: 'Slide Rail',
    purpose: 'Navigation, ordering, duplication, and slide-level actions.',
    primaryActions: ['Select slide', 'Drag reorder', 'Duplicate', 'Delete', 'Add slide'],
    uxRule: 'Make current slide obvious and make reorder/drop feedback visible before release.',
  },
  {
    id: 'canvas',
    label: 'Canvas',
    purpose: 'Primary editing surface for visual decisions and direct manipulation.',
    primaryActions: ['Inline edit', 'Drop media', 'Preview animation', 'Zoom'],
    uxRule: 'Canvas should feel like the source of truth; panels support it but should not overpower it.',
  },
  {
    id: 'floating_controls',
    label: 'Floating Controls',
    purpose: 'Contextual tools near the selected slide or element.',
    primaryActions: ['Edit text', 'Replace image', 'Change layout', 'Repair brand', 'Run QA'],
    uxRule: 'Only show controls that are relevant to the active slide state.',
  },
  {
    id: 'inspector',
    label: 'Inspector',
    purpose: 'Detailed slide properties, layout settings, and advanced controls.',
    primaryActions: ['Layout', 'Theme', 'Background', 'Typography', 'Motion', 'Data'],
    uxRule: 'Use tabs or sections so advanced settings do not create cognitive overload.',
  },
  {
    id: 'status_bar',
    label: 'Status Bar',
    purpose: 'Persistent production confidence and active editing context.',
    primaryActions: ['Readiness score', 'Slide position', 'Brand state', 'Export state'],
    uxRule: 'Keep confidence signals always visible without stealing canvas space.',
  },
  {
    id: 'command_palette',
    label: 'Command Palette',
    purpose: 'Fast natural-language and keyboard-driven access to editor actions.',
    primaryActions: ['Search commands', 'Route instructions', 'Execute common actions'],
    uxRule: 'Power users should be able to drive the editor without hunting through panels.',
  },
];

export const editorInteractions: PresentationEditorInteraction[] = [
  {
    id: 'inline_text_edit',
    label: 'Inline Text Edit',
    trigger: 'Click text on the canvas.',
    feedback: 'Text region highlights and editing overlay appears.',
    successState: 'Slide text updates without leaving canvas context.',
  },
  {
    id: 'drag_drop_media',
    label: 'Drag-and-drop Media',
    trigger: 'Drop images or PPTX files onto canvas or slide rail.',
    feedback: 'Drop target highlights and previews placement behavior.',
    successState: 'Media is applied to active slide or inserted as new slides.',
  },
  {
    id: 'slide_reorder',
    label: 'Slide Reorder',
    trigger: 'Drag a slide thumbnail.',
    feedback: 'Insertion line shows above or below target slide.',
    successState: 'Slide order changes and active index follows moved slide.',
  },
  {
    id: 'quick_duplicate',
    label: 'Quick Duplicate',
    trigger: 'Hover slide thumbnail or grid card and click duplicate.',
    feedback: 'New slide appears immediately after original.',
    successState: 'Duplicated slide becomes active for fast editing.',
  },
  {
    id: 'layout_swap',
    label: 'Layout Swap',
    trigger: 'Choose a layout from the inspector or floating toolbar.',
    feedback: 'Canvas updates while preserving slide content where possible.',
    successState: 'Same content appears in a better structure.',
  },
  {
    id: 'brand_repair',
    label: 'Brand Repair',
    trigger: 'Run brand action from floating controls or QA fixes.',
    feedback: 'Changed colors, fonts, and logo-safe regions are surfaced.',
    successState: 'Slide returns to approved brand system without redrawing logos.',
  },
  {
    id: 'export_check',
    label: 'Export Check',
    trigger: 'Click export or readiness action.',
    feedback: 'Export readiness and fidelity warnings appear before download.',
    successState: 'User exports with confidence and understands any warnings.',
  },
  {
    id: 'keyboard_shortcuts',
    label: 'Keyboard Shortcuts',
    trigger: 'Use command keys while editor is focused.',
    feedback: 'Toasts or subtle status messages confirm action.',
    successState: 'Common actions feel fast: duplicate, delete, present, zoom, command palette.',
  },
];

export const buildPresentationEditorUXState = (input: {
  slides: SlideData[];
  activeSlideIndex?: number;
}): PresentationEditorUXState => {
  const activeSlideIndex = Math.min(Math.max(input.activeSlideIndex ?? 0, 0), Math.max(input.slides.length - 1, 0));
  const activeSlide = input.slides[activeSlideIndex];
  const warnings: string[] = [];

  if (!input.slides.length) warnings.push('No slides available in the editor yet.');
  if (activeSlide && !activeSlide.title) warnings.push('Active slide has no title, which can make navigation and export review harder.');
  if (activeSlide?.layout === 'blank') warnings.push('Blank layout needs a clear next action so the user is not stranded.');

  return {
    activeSlideIndex,
    slideCount: input.slides.length,
    activeLayout: activeSlide?.layout,
    zones: editorZones,
    interactions: editorInteractions,
    recommendedFocus: activeSlide ? `Make slide ${activeSlideIndex + 1} (${activeSlide.layout}) directly editable with contextual controls.` : 'Start by generating or importing slides.',
    warnings,
  };
};
