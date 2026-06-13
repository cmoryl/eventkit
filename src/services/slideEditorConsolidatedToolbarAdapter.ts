import type { EditorConsolidatedActionHandlers } from '@/hooks/useEditorConsolidatedActionDispatcher';

export interface SlideEditorConsolidatedToolbarAdapterInput {
  activeIndex: number;
  setIsAIGeneratorOpen?: (open: boolean) => void;
  setIsGalleryOpen?: (open: boolean) => void;
  triggerImportPptx?: () => void;
  addSlide?: (afterIndex: number) => void;
  duplicateSlide?: (index: number) => void;
  deleteSlide?: (index: number) => void;
  setIsGridView?: (value: boolean | ((previous: boolean) => boolean)) => void;
  setAnimatedBackgrounds?: (value: boolean | ((previous: boolean) => boolean)) => void;
  setIsPresentationMode?: (open: boolean) => void;
  setIsAssetsLibraryOpen?: (open: boolean) => void;
  setSaveTemplateOpen?: (open: boolean) => void;
  exportPptx?: () => void;
  runQA?: () => void;
  checkExport?: () => void;
  openFixes?: () => void;
  saveSnapshot?: () => void;
  saveDeckRecipe?: () => void;
  openVersionHistory?: () => void;
}

export const buildSlideEditorConsolidatedToolbarHandlers = ({
  activeIndex,
  setIsAIGeneratorOpen,
  setIsGalleryOpen,
  triggerImportPptx,
  addSlide,
  duplicateSlide,
  deleteSlide,
  setIsGridView,
  setAnimatedBackgrounds,
  setIsPresentationMode,
  setIsAssetsLibraryOpen,
  setSaveTemplateOpen,
  exportPptx,
  runQA,
  checkExport,
  openFixes,
  saveSnapshot,
  saveDeckRecipe,
  openVersionHistory,
}: SlideEditorConsolidatedToolbarAdapterInput): EditorConsolidatedActionHandlers => ({
  openAIGenerator: setIsAIGeneratorOpen ? () => setIsAIGeneratorOpen(true) : undefined,
  openTemplates: setIsGalleryOpen ? () => setIsGalleryOpen(true) : undefined,
  importPptx: triggerImportPptx,
  addSlide: addSlide ? () => addSlide(activeIndex) : undefined,
  openSmartBlocks: setIsGalleryOpen ? () => setIsGalleryOpen(true) : undefined,
  focusTextEdit: undefined,
  openLayout: undefined,
  openImageTools: setIsAssetsLibraryOpen ? () => setIsAssetsLibraryOpen(true) : undefined,
  openAlignment: undefined,
  openStyle: undefined,
  duplicateSlide: duplicateSlide ? () => duplicateSlide(activeIndex) : undefined,
  deleteSlide: deleteSlide ? () => deleteSlide(activeIndex) : undefined,
  toggleGrid: setIsGridView ? () => setIsGridView((previous) => !previous) : undefined,
  toggleAnimatedBackgrounds: setAnimatedBackgrounds ? () => setAnimatedBackgrounds((previous) => !previous) : undefined,
  present: setIsPresentationMode ? () => setIsPresentationMode(true) : undefined,
  openBrandAssets: setIsAssetsLibraryOpen ? () => setIsAssetsLibraryOpen(true) : undefined,
  repairBrand: undefined,
  runLogoCheck: runQA,
  applyBrandTheme: undefined,
  runQA,
  openFixes,
  checkExport,
  exportPptx,
  saveTemplate: setSaveTemplateOpen ? () => setSaveTemplateOpen(true) : undefined,
  saveSnapshot,
  saveDeckRecipe,
  openVersionHistory,
});

export const getMissingSlideEditorToolbarHandlers = (handlers: EditorConsolidatedActionHandlers) => Object.entries(handlers)
  .filter(([, handler]) => !handler)
  .map(([name]) => name);
