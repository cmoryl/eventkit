# SlideEditor Consolidated Toolbar Wiring

## Goal

Replace the crowded SlideEditor top toolbar with the consolidated six-group editor toolbar while preserving all existing editing behavior.

## New building blocks

- `src/components/slides/SlideEditorConsolidatedToolbar.tsx`
- `src/components/slides/EditorConsolidatedActionBar.tsx`
- `src/hooks/useEditorConsolidatedActionDispatcher.ts`
- `src/services/slideEditorConsolidatedToolbarAdapter.ts`
- `src/services/presentationEditorActionContractService.ts`

## Action groups

1. Create
2. Edit
3. View
4. Brand
5. Review & Export
6. Save System

## Wiring checklist

1. Import `SlideEditorConsolidatedToolbar` into `src/components/slides/SlideEditor.tsx`.
2. Import `buildSlideEditorConsolidatedToolbarHandlers` from `src/services/slideEditorConsolidatedToolbarAdapter.ts`.
3. Build toolbar handlers from the current local editor callbacks:
   - `setIsAIGeneratorOpen`
   - `setIsGalleryOpen`
   - `addSlide(activeIndex)`
   - `duplicateSlide(activeIndex)`
   - `deleteSlide(activeIndex)`
   - `setIsGridView`
   - `setAnimatedBackgrounds`
   - `setIsPresentationMode`
   - `setIsAssetsLibraryOpen`
   - `setSaveTemplateOpen`
   - `exportSlidesToPptx(slides, assetName)`
4. Replace the existing toolbar block with `SlideEditorConsolidatedToolbar`.
5. Keep canvas, slide rail, inspector, modals, import, export, and presentation mode behavior unchanged.

## Implementation snippet

Add the imports near the other slide editor imports:

```ts
import { SlideEditorConsolidatedToolbar } from './SlideEditorConsolidatedToolbar';
import { buildSlideEditorConsolidatedToolbarHandlers } from '@/services/slideEditorConsolidatedToolbarAdapter';
```

Build handlers inside `SlideEditor`, after the current callbacks exist:

```ts
const consolidatedToolbarHandlers = buildSlideEditorConsolidatedToolbarHandlers({
  activeIndex,
  setIsAIGeneratorOpen,
  setIsGalleryOpen,
  addSlide,
  duplicateSlide,
  deleteSlide,
  setIsGridView,
  setAnimatedBackgrounds,
  setIsPresentationMode,
  setIsAssetsLibraryOpen,
  setSaveTemplateOpen,
  exportPptx: () => exportSlidesToPptx(slides, assetName),
});
```

Replace the current top toolbar with:

```tsx
<SlideEditorConsolidatedToolbar
  assetName={assetName}
  slideCount={slides.length}
  zoom={zoom}
  isGridView={isGridView}
  hasBrand={Boolean(brand)}
  exportReady={true}
  onClose={onClose}
  handlers={consolidatedToolbarHandlers}
/>
```

## Acceptance criteria

- The editor displays the consolidated toolbar instead of the old repeated toolbar buttons.
- All existing actions remain accessible through the six action groups.
- Present and Review & Export remain visible as high-priority actions.
- Add, duplicate, and delete slide still operate on the active slide.
- Brand Assets, Gallery, AI Generate, Save Template, Grid, Animated Backgrounds, and Export still work.
- Export is routed through review/export language and readiness state.

## Validation

Run:

```bash
npm run test
npm run lint
npm run build
```
