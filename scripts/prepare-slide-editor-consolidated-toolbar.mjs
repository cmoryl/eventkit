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
    exportPptx: () => exportSlidesToPptx(slides, assetName),
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

const toolbarExample = `
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
`;

if (changed) {
  fs.writeFileSync(filePath, source);
  console.log('Prepared SlideEditor for consolidated toolbar wiring.');
} else {
  console.log('SlideEditor already contains consolidated toolbar preparation.');
}

console.log('\nNext manual replacement target: replace the existing top toolbar JSX with:');
console.log(toolbarExample);
console.log('Then run: npm run test && npm run lint && npm run build');
