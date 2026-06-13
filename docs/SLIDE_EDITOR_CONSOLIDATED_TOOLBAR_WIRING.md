# SlideEditor Consolidated Toolbar Wiring

## Goal

Replace the crowded SlideEditor top toolbar with the consolidated six-group editor toolbar while preserving all existing editing behavior.

## New building blocks

- `src/components/slides/SlideEditorConsolidatedToolbar.tsx`
- `src/components/slides/EditorConsolidatedActionBar.tsx`
- `src/hooks/useEditorConsolidatedActionDispatcher.ts`
- `src/services/slideEditorConsolidatedToolbarAdapter.ts`
- `src/services/presentationEditorActionContractService.ts`
- `scripts/prepare-slide-editor-consolidated-toolbar.mjs`
- `scripts/verify-presentation-studio-migration.mjs`

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
4. Pass the current `handleImportPptx` function into the toolbar as `onImportPptxChange`.
5. Replace the existing toolbar block with `SlideEditorConsolidatedToolbar`.
6. Keep canvas, slide rail, inspector, modals, import, export, and presentation mode behavior unchanged.

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
  exportPptx: () => exportSlidesToPptx(slides, assetName, { transition: slideTransition }),
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
  onImportPptxChange={handleImportPptx}
  handlers={consolidatedToolbarHandlers}
/>
```

## Migration commands

Preview the migration without changing `SlideEditor.tsx`:

```bash
node scripts/prepare-slide-editor-consolidated-toolbar.mjs --dry-run
```

Apply the migration:

```bash
node scripts/prepare-slide-editor-consolidated-toolbar.mjs
```

Run the full migration validation in preview mode:

```bash
node scripts/verify-presentation-studio-migration.mjs
```

Apply the migration and then run validation:

```bash
node scripts/verify-presentation-studio-migration.mjs --apply-toolbar
```

## Acceptance criteria

- The editor displays the consolidated toolbar instead of the old repeated toolbar buttons.
- All existing actions remain accessible through the six action groups.
- Present and Review & Export remain visible as high-priority actions.
- Add, duplicate, and delete slide still operate on the active slide.
- Brand Assets, Gallery, AI Generate, Save Template, Grid, Animated Backgrounds, Import, and Export still work.
- Export is routed through review/export language and readiness state.

## Validation

Run:

```bash
npm run test
npm run lint
npm run build
```
