import { describe, expect, it, vi } from 'vitest';
import { buildSlideEditorConsolidatedToolbarHandlers, getMissingSlideEditorToolbarHandlers } from './slideEditorConsolidatedToolbarAdapter';

describe('slideEditorConsolidatedToolbarAdapter', () => {
  it('maps existing SlideEditor callbacks to consolidated handlers', () => {
    const setIsAIGeneratorOpen = vi.fn();
    const setIsGalleryOpen = vi.fn();
    const addSlide = vi.fn();
    const duplicateSlide = vi.fn();
    const deleteSlide = vi.fn();
    const setIsPresentationMode = vi.fn();
    const setIsAssetsLibraryOpen = vi.fn();
    const setSaveTemplateOpen = vi.fn();
    const exportPptx = vi.fn();

    const handlers = buildSlideEditorConsolidatedToolbarHandlers({
      activeIndex: 2,
      setIsAIGeneratorOpen,
      setIsGalleryOpen,
      addSlide,
      duplicateSlide,
      deleteSlide,
      setIsPresentationMode,
      setIsAssetsLibraryOpen,
      setSaveTemplateOpen,
      exportPptx,
    });

    handlers.openAIGenerator?.();
    handlers.openTemplates?.();
    handlers.addSlide?.();
    handlers.duplicateSlide?.();
    handlers.deleteSlide?.();
    handlers.present?.();
    handlers.openBrandAssets?.();
    handlers.saveTemplate?.();
    handlers.exportPptx?.();

    expect(setIsAIGeneratorOpen).toHaveBeenCalledWith(true);
    expect(setIsGalleryOpen).toHaveBeenCalledWith(true);
    expect(addSlide).toHaveBeenCalledWith(2);
    expect(duplicateSlide).toHaveBeenCalledWith(2);
    expect(deleteSlide).toHaveBeenCalledWith(2);
    expect(setIsPresentationMode).toHaveBeenCalledWith(true);
    expect(setIsAssetsLibraryOpen).toHaveBeenCalledWith(true);
    expect(setSaveTemplateOpen).toHaveBeenCalledWith(true);
    expect(exportPptx).toHaveBeenCalledTimes(1);
  });

  it('reports missing optional handlers', () => {
    const handlers = buildSlideEditorConsolidatedToolbarHandlers({ activeIndex: 0 });
    expect(getMissingSlideEditorToolbarHandlers(handlers)).toContain('openAIGenerator');
    expect(getMissingSlideEditorToolbarHandlers(handlers)).toContain('exportPptx');
  });
});
