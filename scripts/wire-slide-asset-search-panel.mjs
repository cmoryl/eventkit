import { readFileSync, writeFileSync } from 'node:fs';

const target = 'src/components/slides/SlideEditor.tsx';
const apply = process.argv.includes('--apply');
let source = readFileSync(target, 'utf8');
const original = source;

const replaceOnce = (needle, replacement, label) => {
  if (!source.includes(needle)) {
    console.warn(`⚠ skipped ${label}: needle not found or already patched`);
    return;
  }
  source = source.replace(needle, replacement);
  console.log(`✓ ${label}`);
};

replaceOnce(
  "import { InlineEditOverlay } from './InlineEditOverlay';",
  "import { InlineEditOverlay } from './InlineEditOverlay';\nimport { SlideAssetSearchPanel } from './SlideAssetSearchPanel';",
  'import SlideAssetSearchPanel',
);

replaceOnce(
  'const { byCategory: brandFilesByCategory } = useBrandHubFiles({',
  'const { files: brandFiles, byCategory: brandFilesByCategory } = useBrandHubFiles({',
  'expose BrandHub files to properties rail',
);

const applyImageBlock = `
                <SlideAssetSearchPanel
                  slide={activeSlide}
                  brandImagery={brandImagery}
                  brandFiles={brandFiles}
                  onOpenAssetLibrary={() => setIsAssetsLibraryOpen(true)}
                  onApplyImage={(url) => {
                    const nextImages = [url, ...(activeSlide.images || []).filter((src) => src !== url)];
                    const needsImageLayout = !['image-left', 'image-right', 'full-image'].includes(activeSlide.layout);
                    updateSlide(activeIndex, {
                      imageUrl: url,
                      images: nextImages,
                      ...(needsImageLayout && { layout: 'image-left' as const }),
                    });
                  }}
                />

`;

replaceOnce(
  '                {/* Slide Images */}\n',
  `${applyImageBlock}                {/* Slide Images */}\n`,
  'mount asset search panel above slide images',
);

replaceOnce(
  '      onLoadDeck={handleLoadDeckFromBrandHub}\n      onReferenceSelectionChange={setReferenceFiles}',
  `      onLoadDeck={handleLoadDeckFromBrandHub}
      onUseImage={(file) => {
        const url = file.url;
        const nextImages = [url, ...(activeSlide.images || []).filter((src) => src !== url)];
        const needsImageLayout = !['image-left', 'image-right', 'full-image'].includes(activeSlide.layout);
        updateSlide(activeIndex, {
          imageUrl: url,
          images: nextImages,
          ...(needsImageLayout && { layout: 'image-left' as const }),
        });
        setIsAssetsLibraryOpen(false);
        toast.success(\`Applied \${file.name} to slide \${activeIndex + 1}\`);
      }}
      onReferenceSelectionChange={setReferenceFiles}`,
  'wire Brand Assets image use callback',
);

const requiredMarkers = [
  "import { SlideAssetSearchPanel } from './SlideAssetSearchPanel';",
  'files: brandFiles',
  '<SlideAssetSearchPanel',
  'brandFiles={brandFiles}',
  'onUseImage={(file) => {',
  'onReferenceSelectionChange={setReferenceFiles}',
];

const missingMarkers = requiredMarkers.filter((marker) => !source.includes(marker));
if (missingMarkers.length > 0) {
  console.error('\n✖ Slide asset rail wiring validation failed. Missing markers:');
  for (const marker of missingMarkers) console.error(`- ${marker}`);
  process.exit(1);
}

if (source === original) {
  console.log('No SlideEditor changes detected. The file may already be wired. Validation passed.');
  process.exit(0);
}

if (apply) {
  writeFileSync(target, source);
  console.log('\n✓ SlideAssetSearchPanel wired into SlideEditor properties rail and validated.');
} else {
  console.log('\nDry run only. SlideAssetSearchPanel wiring validated. Re-run with --apply to update SlideEditor.tsx.');
}
