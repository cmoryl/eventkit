#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(process.cwd(), 'src/components/slides/SlideEditor.tsx');

if (!fs.existsSync(filePath)) {
  console.error(`SlideEditor not found: ${filePath}`);
  process.exit(1);
}

let source = fs.readFileSync(filePath, 'utf8');
let changed = false;

const importAnchor = "import { InlineEditOverlay } from './InlineEditOverlay';";
const importsToAdd = [
  "import { SlideEditorConsolidatedToolbar } from './SlideEditorConsolidatedToolbar';",
  "import { buildSlideEditorConsolidatedToolbarHandlers } from '@/services/slideEditorConsolidatedToolbarAdapter';",
];

if (!source.includes(importsToAdd[0])) {
  source = source.replace(importAnchor, `${importAnchor}\n${importsToAdd.join('\n')}`);
  changed = true;
}

const handlerBlock = `
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
`;

const deleteSlideAnchor = `  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(prev => Math.min(prev, slides.length - 2));
  }, [slides.length]);
`;

if (!source.includes('const consolidatedToolbarHandlers = buildSlideEditorConsolidatedToolbarHandlers')) {
  source = source.replace(deleteSlideAnchor, `${deleteSlideAnchor}${handlerBlock}`);
  changed = true;
}

const toolbarReplacement = `          {/* Toolbar */}
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

`;

const toolbarStart = source.indexOf('          {/* Toolbar */}');
const mainAreaStart = toolbarStart >= 0 ? source.indexOf('          {/* Main area */}', toolbarStart) : -1;
const alreadyReplaced = source.includes('<SlideEditorConsolidatedToolbar');

if (!alreadyReplaced && toolbarStart >= 0 && mainAreaStart > toolbarStart) {
  source = `${source.slice(0, toolbarStart)}${toolbarReplacement}${source.slice(mainAreaStart)}`;
  changed = true;
} else if (!alreadyReplaced && toolbarStart < 0) {
  console.warn('Could not find toolbar start marker. Manual replacement required.');
} else if (!alreadyReplaced && mainAreaStart < 0) {
  console.warn('Could not find main area marker. Manual replacement required.');
}

if (changed) {
  fs.writeFileSync(filePath, source);
  console.log('Prepared SlideEditor for consolidated toolbar wiring.');
} else {
  console.log('SlideEditor already contains consolidated toolbar preparation.');
}

console.log('\nValidation:');
console.log('npm run test && npm run lint && npm run build');
