import { PRESENTATION_DRAG_DROP_ASSET_KITS } from '@/config/editableTemplates/presentationDragDropAssetKits';
import { GALLERY_IMAGE_ASSETS } from '@/components/powerpoint/composer/galleryImageAssets';
import { GALLERY_IMAGERY_DIRECTIVES } from '@/components/powerpoint/composer/galleryImageryDirectives';
import { PREBUILT_PRESENTATION_OBJECTS } from '@/components/powerpoint/composer/prebuiltPresentationObjects';
import { PREBUILT_DATA_VIZ_STYLES } from '@/components/powerpoint/composer/prebuiltDataVizStyles';
import { ADVANCED_DATA_STORY_BLOCKS } from '@/components/powerpoint/composer/advancedDataStoryBlocks';
import { getPresentationAssetDropZoneSummary } from './presentationAssetDropZoneService';

export interface PresentationAssetReadinessArea {
  id: string;
  label: string;
  score: number;
  status: 'strong' | 'needs-work' | 'critical';
  evidence: string[];
  nextMoves: string[];
}

export interface PresentationAssetReadinessReport {
  score: number;
  verdict: string;
  areas: PresentationAssetReadinessArea[];
  totals: {
    kits: number;
    kitItems: number;
    generatedGalleryImages: number;
    imageryDirectives: number;
    prebuiltObjects: number;
    dataVizStyles: number;
    advancedStoryBlocks: number;
    templatesWithDropZones: number;
    totalDropZones: number;
  };
}

const statusFor = (score: number): PresentationAssetReadinessArea['status'] => {
  if (score >= 85) return 'strong';
  if (score >= 60) return 'needs-work';
  return 'critical';
};

const area = (id: string, label: string, score: number, evidence: string[], nextMoves: string[]): PresentationAssetReadinessArea => ({
  id,
  label,
  score,
  status: statusFor(score),
  evidence,
  nextMoves,
});

export const getPresentationAssetReadinessReport = (): PresentationAssetReadinessReport => {
  const kitItems = PRESENTATION_DRAG_DROP_ASSET_KITS.flatMap((kit) => kit.items);
  const dropZoneSummary = getPresentationAssetDropZoneSummary();

  const generatedImageCoverage = Math.round(Math.min(100, (GALLERY_IMAGE_ASSETS.length / 10) * 100));
  const directiveCoverage = Math.round(Math.min(100, (GALLERY_IMAGERY_DIRECTIVES.length / 10) * 100));
  const objectCoverage = Math.round(Math.min(100, (PREBUILT_PRESENTATION_OBJECTS.length / 15) * 100));
  const dataCoverage = Math.round(Math.min(100, (PREBUILT_DATA_VIZ_STYLES.length / 20) * 100));
  const storyCoverage = Math.round(Math.min(100, (ADVANCED_DATA_STORY_BLOCKS.length / 12) * 100));
  const dropZoneCoverage = Math.round(Math.min(100, (dropZoneSummary.totalDropZones / 24) * 100));
  const kitCoverage = Math.round(Math.min(100, (kitItems.length / 36) * 100));

  const areas = [
    area(
      'asset-kits',
      'Asset kits and reusable source slots',
      kitCoverage,
      [`${PRESENTATION_DRAG_DROP_ASSET_KITS.length} kits`, `${kitItems.length} kit items`, 'Slots include logo, hero, map, chart, person, UI panel, QR, texture, product render, and sponsor-logo.'],
      ['Expand from starter kits into industry packs: boardroom, product, event, case study, editorial, training, governance, and data.', 'Add source/rights metadata, resolution guidance, and export-safe minimums per item.'],
    ),
    area(
      'drop-zones',
      'Template drop-zone coverage',
      dropZoneCoverage,
      [`${dropZoneSummary.templatesWithDropZones} templates with drop zones`, `${dropZoneSummary.totalDropZones} total drop zones`, `${dropZoneSummary.logoZones} logo zones`, `${dropZoneSummary.imageZones} image zones`],
      ['Require aspect ratio, accepted formats, safe-area notes, and crop behavior on every asset field.', 'Add per-zone validation for exact logos, QR scannability, and low-resolution images.'],
    ),
    area(
      'generated-imagery',
      'Generated gallery imagery',
      generatedImageCoverage,
      [`${GALLERY_IMAGE_ASSETS.length} generated gallery image assets`, 'SVG-backed thumbnails can be rendered directly in the gallery curation experience.'],
      ['Create real exportable PNG/WebP derivatives for every SVG and template thumbnail.', 'Add visual variants: dark, light, photographic, abstract, and data-driven.'],
    ),
    area(
      'imagery-directives',
      'Imagery direction and generation prompts',
      directiveCoverage,
      [`${GALLERY_IMAGERY_DIRECTIVES.length} imagery directive sets`, 'Each directive includes recommended imagery, slots, avoid-rules, and a generation prompt.'],
      ['Add directives for every template and every data-story block.', 'Attach negative prompts for logo misuse, fake UI text, stock clichés, and overcomplicated data graphics.'],
    ),
    area(
      'prebuilt-objects',
      'Prebuilt editable objects',
      objectCoverage,
      [`${PREBUILT_PRESENTATION_OBJECTS.length} prebuilt objects`, 'Objects include KPI cards, logo rails, device mockups, QR CTAs, speaker cards, and approval stamps.'],
      ['Add object thumbnails, insertion coordinates, editable field schemas, and PowerPoint export mapping.', 'Add industry-specific versions for healthcare, legal, tech, media, events, and enterprise sales.'],
    ),
    area(
      'data-visuals',
      'Graph and visual-data systems',
      dataCoverage,
      [`${PREBUILT_DATA_VIZ_STYLES.length} graph styles`, 'Styles include scorecards, heatmaps, waterfalls, funnels, maps, treemaps, Sankey flows, forecast bands, micro charts, and maturity ladders.'],
      ['Add chart-specific render thumbnails and theme-aware color rules.', 'Add data-shape validation so charts pick the right visual automatically.'],
    ),
    area(
      'compound-stories',
      'Compound data-story blocks',
      storyCoverage,
      [`${ADVANCED_DATA_STORY_BLOCKS.length} advanced data-story blocks`, 'Blocks combine graphs, objects, imagery, annotations, and decision logic into complete slide systems.'],
      ['Wire blocks into the agent planner so a user can request “make this boardroom-ready” and receive a structured multi-object slide.', 'Add QA checks for source labels, chart readability, and executive takeaway clarity.'],
    ),
  ];

  const score = Math.round(areas.reduce((sum, item) => sum + item.score, 0) / areas.length);

  return {
    score,
    verdict: score >= 85 ? 'Strong asset system, now needs runtime wiring and export proof.' : 'Good foundation, but not best-in-class until validation, thumbnails, and insertion wiring are complete.',
    areas,
    totals: {
      kits: PRESENTATION_DRAG_DROP_ASSET_KITS.length,
      kitItems: kitItems.length,
      generatedGalleryImages: GALLERY_IMAGE_ASSETS.length,
      imageryDirectives: GALLERY_IMAGERY_DIRECTIVES.length,
      prebuiltObjects: PREBUILT_PRESENTATION_OBJECTS.length,
      dataVizStyles: PREBUILT_DATA_VIZ_STYLES.length,
      advancedStoryBlocks: ADVANCED_DATA_STORY_BLOCKS.length,
      templatesWithDropZones: dropZoneSummary.templatesWithDropZones,
      totalDropZones: dropZoneSummary.totalDropZones,
    },
  };
};

export const buildPresentationAssetReadinessPromptBlock = () => {
  const report = getPresentationAssetReadinessReport();
  return [
    'PRESENTATION ASSET READINESS AUDIT',
    `Overall score: ${report.score}`,
    `Verdict: ${report.verdict}`,
    ...report.areas.map((item) => `- ${item.label}: ${item.score}/100 ${item.status}. Next: ${item.nextMoves[0]}`),
  ].join('\n');
};
