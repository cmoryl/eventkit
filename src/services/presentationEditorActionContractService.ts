import type { PresentationEditorActionGroupId } from './presentationEditorActionAuditService';

export type PresentationEditorActionId =
  | 'create_ai_generate'
  | 'create_templates'
  | 'create_import_pptx'
  | 'create_add_slide'
  | 'create_smart_block'
  | 'edit_text'
  | 'edit_layout'
  | 'edit_image'
  | 'edit_align'
  | 'edit_style'
  | 'edit_duplicate'
  | 'edit_delete'
  | 'view_zoom'
  | 'view_grid'
  | 'view_animated_backgrounds'
  | 'view_transitions'
  | 'view_present'
  | 'brand_assets'
  | 'brand_repair'
  | 'brand_logo_check'
  | 'brand_apply_theme'
  | 'review_run_qa'
  | 'review_fix_issues'
  | 'review_export_check'
  | 'review_export_pptx'
  | 'reuse_save_template'
  | 'reuse_save_snapshot'
  | 'reuse_deck_recipe'
  | 'reuse_version_history';

export interface PresentationEditorActionContract {
  id: PresentationEditorActionId;
  group: PresentationEditorActionGroupId;
  label: string;
  currentSlideEditorHook: string;
  userFeedback: string;
  blocksExportUntilComplete?: boolean;
}

export const presentationEditorActionContracts: PresentationEditorActionContract[] = [
  { id: 'create_ai_generate', group: 'create_insert', label: 'AI Generate', currentSlideEditorHook: 'setIsAIGeneratorOpen(true)', userFeedback: 'Open AI generation flow.' },
  { id: 'create_templates', group: 'create_insert', label: 'Templates', currentSlideEditorHook: 'setIsGalleryOpen(true) or template popover', userFeedback: 'Open unified template / gallery / recipe picker.' },
  { id: 'create_import_pptx', group: 'create_insert', label: 'Import PPTX', currentSlideEditorHook: 'handleImportPptx', userFeedback: 'Open file picker or accept PPTX drop.' },
  { id: 'create_add_slide', group: 'create_insert', label: 'Add Slide', currentSlideEditorHook: 'addSlide(activeIndex)', userFeedback: 'Insert a new editable slide after current slide.' },
  { id: 'create_smart_block', group: 'create_insert', label: 'Insert Smart Block', currentSlideEditorHook: 'open smart block picker', userFeedback: 'Insert a structured editable slide block.' },
  { id: 'edit_text', group: 'edit_canvas', label: 'Text', currentSlideEditorHook: 'InlineEditOverlay', userFeedback: 'Enable direct text editing on the canvas.' },
  { id: 'edit_layout', group: 'edit_canvas', label: 'Layout', currentSlideEditorHook: 'updateSlide(activeIndex, { layout })', userFeedback: 'Open layout chooser and preserve slide content.' },
  { id: 'edit_image', group: 'edit_canvas', label: 'Image', currentSlideEditorHook: 'setIsAssetsLibraryOpen(true) or canvas drop', userFeedback: 'Replace, insert, or reposition image content.' },
  { id: 'edit_align', group: 'edit_canvas', label: 'Align', currentSlideEditorHook: 'updateSlide(activeIndex, { textAlign })', userFeedback: 'Update alignment for selected slide content.' },
  { id: 'edit_style', group: 'edit_canvas', label: 'Style', currentSlideEditorHook: 'updateSlide active variant/color/font controls', userFeedback: 'Open style controls for theme, background, and typography.' },
  { id: 'edit_duplicate', group: 'edit_canvas', label: 'Duplicate', currentSlideEditorHook: 'duplicateSlide(activeIndex)', userFeedback: 'Duplicate the active slide.' },
  { id: 'edit_delete', group: 'edit_canvas', label: 'Delete', currentSlideEditorHook: 'deleteSlide(activeIndex)', userFeedback: 'Delete the active slide after safety checks.' },
  { id: 'view_zoom', group: 'view_present', label: 'Zoom', currentSlideEditorHook: 'setZoom()', userFeedback: 'Change canvas zoom level.' },
  { id: 'view_grid', group: 'view_present', label: 'Grid', currentSlideEditorHook: 'setIsGridView()', userFeedback: 'Toggle grid view for deck overview.' },
  { id: 'view_animated_backgrounds', group: 'view_present', label: 'Animated BG', currentSlideEditorHook: 'setAnimatedBackgrounds()', userFeedback: 'Toggle animated canvas backgrounds.' },
  { id: 'view_transitions', group: 'view_present', label: 'Transitions', currentSlideEditorHook: 'setSlideTransition()', userFeedback: 'Pick presentation transition style.' },
  { id: 'view_present', group: 'view_present', label: 'Present', currentSlideEditorHook: 'setIsPresentationMode(true)', userFeedback: 'Start presentation preview.' },
  { id: 'brand_assets', group: 'brand_assets', label: 'Brand Assets', currentSlideEditorHook: 'setIsAssetsLibraryOpen(true)', userFeedback: 'Open BrandHub assets.' },
  { id: 'brand_repair', group: 'brand_assets', label: 'Brand Repair', currentSlideEditorHook: 'apply brand-safe slide patch', userFeedback: 'Repair colors, fonts, and layout against Brand Brain.' },
  { id: 'brand_logo_check', group: 'brand_assets', label: 'Logo Check', currentSlideEditorHook: 'run logo audit', userFeedback: 'Check logo source usage and safe zones.', blocksExportUntilComplete: true },
  { id: 'brand_apply_theme', group: 'brand_assets', label: 'Apply Brand Theme', currentSlideEditorHook: 'update deck variants/colors/fonts', userFeedback: 'Apply current brand styling to the deck.' },
  { id: 'review_run_qa', group: 'review_export', label: 'Run QA', currentSlideEditorHook: 'auditPresentationDeck', userFeedback: 'Run QA checks before export.', blocksExportUntilComplete: true },
  { id: 'review_fix_issues', group: 'review_export', label: 'Fix Issues', currentSlideEditorHook: 'open fix plan', userFeedback: 'Open recommended fixes.' },
  { id: 'review_export_check', group: 'review_export', label: 'Check Export', currentSlideEditorHook: 'evaluatePresentationExportReadiness', userFeedback: 'Run export preflight.', blocksExportUntilComplete: true },
  { id: 'review_export_pptx', group: 'review_export', label: 'Export PPTX', currentSlideEditorHook: 'exportSlidesToPptx(slides, assetName)', userFeedback: 'Export editable PPTX after readiness check.' },
  { id: 'reuse_save_template', group: 'reuse_system', label: 'Save as Template', currentSlideEditorHook: 'setSaveTemplateOpen(true)', userFeedback: 'Save deck as reusable template.' },
  { id: 'reuse_save_snapshot', group: 'reuse_system', label: 'Save Snapshot', currentSlideEditorHook: 'savePresentationIntelligenceSnapshot', userFeedback: 'Save intelligence snapshot and history.' },
  { id: 'reuse_deck_recipe', group: 'reuse_system', label: 'Reuse Deck Recipe', currentSlideEditorHook: 'buildPresentationDeckRecipe', userFeedback: 'Save the structural recipe for reuse.' },
  { id: 'reuse_version_history', group: 'reuse_system', label: 'Version History', currentSlideEditorHook: 'loadPresentationEvents', userFeedback: 'Open event history and versions.' },
];

export const getPresentationEditorActionsByGroup = (group: PresentationEditorActionGroupId) => presentationEditorActionContracts.filter((action) => action.group === group);

export const buildPresentationEditorActionContractPromptBlock = () => [
  'PRESENTATION EDITOR ACTION CONTRACT',
  'All editor buttons must route through these canonical actions so duplicate buttons do not create duplicate logic.',
  ...presentationEditorActionContracts.map((action) => `- ${action.id} [${action.group}]: ${action.label} -> ${action.currentSlideEditorHook}`),
].join('\n');
