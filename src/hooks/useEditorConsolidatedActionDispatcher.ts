import { useCallback } from 'react';
import { toast } from 'sonner';
import type { PresentationEditorActionId } from '@/services/presentationEditorActionContractService';
import type { PresentationEditorActionGroupId } from '@/services/presentationEditorActionAuditService';

export interface EditorConsolidatedActionHandlers {
  openAIGenerator?: () => void;
  openTemplates?: () => void;
  importPptx?: () => void;
  addSlide?: () => void;
  openSmartBlocks?: () => void;
  focusTextEdit?: () => void;
  openLayout?: () => void;
  openImageTools?: () => void;
  openAlignment?: () => void;
  openStyle?: () => void;
  duplicateSlide?: () => void;
  deleteSlide?: () => void;
  openZoom?: () => void;
  toggleGrid?: () => void;
  toggleAnimatedBackgrounds?: () => void;
  openTransitions?: () => void;
  present?: () => void;
  openBrandAssets?: () => void;
  repairBrand?: () => void;
  runLogoCheck?: () => void;
  applyBrandTheme?: () => void;
  runQA?: () => void;
  openFixes?: () => void;
  checkExport?: () => void;
  exportPptx?: () => void;
  saveTemplate?: () => void;
  saveSnapshot?: () => void;
  saveDeckRecipe?: () => void;
  openVersionHistory?: () => void;
}

const fallback = (label: string) => toast.info(`${label} wiring is ready. Connect this action inside SlideEditor.`);

export const useEditorConsolidatedActionDispatcher = (handlers: EditorConsolidatedActionHandlers = {}) => {
  return useCallback((action: PresentationEditorActionId, _group?: PresentationEditorActionGroupId) => {
    switch (action) {
      case 'create_ai_generate': return (handlers.openAIGenerator || (() => fallback('AI Generate')))();
      case 'create_templates': return (handlers.openTemplates || (() => fallback('Templates')))();
      case 'create_import_pptx': return (handlers.importPptx || (() => fallback('Import PPTX')))();
      case 'create_add_slide': return (handlers.addSlide || (() => fallback('Add Slide')))();
      case 'create_smart_block': return (handlers.openSmartBlocks || (() => fallback('Smart Blocks')))();
      case 'edit_text': return (handlers.focusTextEdit || (() => fallback('Text Edit')))();
      case 'edit_layout': return (handlers.openLayout || (() => fallback('Layout')))();
      case 'edit_image': return (handlers.openImageTools || (() => fallback('Image Tools')))();
      case 'edit_align': return (handlers.openAlignment || (() => fallback('Alignment')))();
      case 'edit_style': return (handlers.openStyle || (() => fallback('Style')))();
      case 'edit_duplicate': return (handlers.duplicateSlide || (() => fallback('Duplicate')))();
      case 'edit_delete': return (handlers.deleteSlide || (() => fallback('Delete')))();
      case 'view_zoom': return (handlers.openZoom || (() => fallback('Zoom')))();
      case 'view_grid': return (handlers.toggleGrid || (() => fallback('Grid')))();
      case 'view_animated_backgrounds': return (handlers.toggleAnimatedBackgrounds || (() => fallback('Animated Backgrounds')))();
      case 'view_transitions': return (handlers.openTransitions || (() => fallback('Transitions')))();
      case 'view_present': return (handlers.present || (() => fallback('Present')))();
      case 'brand_assets': return (handlers.openBrandAssets || (() => fallback('Brand Assets')))();
      case 'brand_repair': return (handlers.repairBrand || (() => fallback('Brand Repair')))();
      case 'brand_logo_check': return (handlers.runLogoCheck || (() => fallback('Logo Check')))();
      case 'brand_apply_theme': return (handlers.applyBrandTheme || (() => fallback('Apply Brand Theme')))();
      case 'review_run_qa': return (handlers.runQA || (() => fallback('Run QA')))();
      case 'review_fix_issues': return (handlers.openFixes || (() => fallback('Fix Issues')))();
      case 'review_export_check': return (handlers.checkExport || (() => fallback('Export Check')))();
      case 'review_export_pptx': return (handlers.exportPptx || (() => fallback('Export PPTX')))();
      case 'reuse_save_template': return (handlers.saveTemplate || (() => fallback('Save Template')))();
      case 'reuse_save_snapshot': return (handlers.saveSnapshot || (() => fallback('Save Snapshot')))();
      case 'reuse_deck_recipe': return (handlers.saveDeckRecipe || (() => fallback('Deck Recipe')))();
      case 'reuse_version_history': return (handlers.openVersionHistory || (() => fallback('Version History')))();
      default: return fallback('Unknown action');
    }
  }, [handlers]);
};
