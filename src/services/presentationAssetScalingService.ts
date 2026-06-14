import type { PresentationAssetSlot } from '@/config/editableTemplates/presentationDragDropAssetKits';
import { getUnifiedPresentationAssetLibrary } from './presentationUnifiedAssetLibraryService';

export type PresentationAssetScaleMode = 'contain' | 'cover' | 'fixed' | 'safe-fit';
export type PresentationAssetScaleStatus = 'pass' | 'review' | 'fail';

export interface PresentationCanvasSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface PresentationAssetSlotScaleRule {
  slot: PresentationAssetSlot;
  mode: PresentationAssetScaleMode;
  minWidth: number;
  minHeight: number;
  maxWidthRatio: number;
  maxHeightRatio: number;
  preserveAspectRatio: boolean;
  notes: string[];
}

export interface PresentationAssetScalePlan {
  slot: PresentationAssetSlot;
  canvas: PresentationCanvasSize;
  mode: PresentationAssetScaleMode;
  targetWidth: number;
  targetHeight: number;
  minWidth: number;
  minHeight: number;
  preserveAspectRatio: boolean;
  status: PresentationAssetScaleStatus;
  issues: string[];
}

export const PRESENTATION_CANVAS_SIZES: PresentationCanvasSize[] = [
  { id: 'wide-16-9', label: 'Presentation 16:9', width: 1920, height: 1080 },
  { id: 'classic-4-3', label: 'Presentation 4:3', width: 1600, height: 1200 },
  { id: 'social-square', label: 'Social Square', width: 1080, height: 1080 },
  { id: 'social-vertical', label: 'Social Vertical', width: 1080, height: 1350 },
  { id: 'thumbnail', label: 'Template Thumbnail', width: 800, height: 450 },
];

export const PRESENTATION_ASSET_SLOT_SCALE_RULES: Record<PresentationAssetSlot, PresentationAssetSlotScaleRule> = {
  background: { slot: 'background', mode: 'cover', minWidth: 1920, minHeight: 1080, maxWidthRatio: 1, maxHeightRatio: 1, preserveAspectRatio: true, notes: ['Must cover full canvas', 'Keep text-safe crop area'] },
  hero: { slot: 'hero', mode: 'cover', minWidth: 1200, minHeight: 675, maxWidthRatio: 0.72, maxHeightRatio: 0.86, preserveAspectRatio: true, notes: ['Use title-safe side space', 'Avoid cutting primary subject'] },
  logo: { slot: 'logo', mode: 'safe-fit', minWidth: 320, minHeight: 120, maxWidthRatio: 0.28, maxHeightRatio: 0.16, preserveAspectRatio: true, notes: ['Exact source logo only', 'Never stretch or distort'] },
  'sponsor-logo': { slot: 'sponsor-logo', mode: 'safe-fit', minWidth: 260, minHeight: 100, maxWidthRatio: 0.22, maxHeightRatio: 0.14, preserveAspectRatio: true, notes: ['Equal safe-zone cells', 'Never redraw sponsor marks'] },
  icon: { slot: 'icon', mode: 'fixed', minWidth: 48, minHeight: 48, maxWidthRatio: 0.08, maxHeightRatio: 0.08, preserveAspectRatio: true, notes: ['Consistent stroke weight', 'Minimum tappable/visible size'] },
  'product-render': { slot: 'product-render', mode: 'contain', minWidth: 900, minHeight: 600, maxWidthRatio: 0.62, maxHeightRatio: 0.72, preserveAspectRatio: true, notes: ['Transparent background preferred', 'Do not crop product edge'] },
  'device-mockup': { slot: 'device-mockup', mode: 'contain', minWidth: 900, minHeight: 560, maxWidthRatio: 0.68, maxHeightRatio: 0.72, preserveAspectRatio: true, notes: ['Screenshot safe area required', 'Perspective must remain accurate'] },
  chart: { slot: 'chart', mode: 'contain', minWidth: 900, minHeight: 520, maxWidthRatio: 0.78, maxHeightRatio: 0.68, preserveAspectRatio: true, notes: ['Labels must remain readable', 'Source line required'] },
  gallery: { slot: 'gallery', mode: 'cover', minWidth: 900, minHeight: 600, maxWidthRatio: 0.5, maxHeightRatio: 0.55, preserveAspectRatio: true, notes: ['Caption-safe crop', 'Avoid subject clipping'] },
  qr: { slot: 'qr', mode: 'fixed', minWidth: 220, minHeight: 220, maxWidthRatio: 0.24, maxHeightRatio: 0.24, preserveAspectRatio: true, notes: ['Must remain square', 'Must be scannable at export size'] },
  map: { slot: 'map', mode: 'contain', minWidth: 1000, minHeight: 560, maxWidthRatio: 0.82, maxHeightRatio: 0.72, preserveAspectRatio: true, notes: ['Direct region labels', 'No unsupported geographic coloring'] },
  texture: { slot: 'texture', mode: 'cover', minWidth: 1920, minHeight: 1080, maxWidthRatio: 1, maxHeightRatio: 1, preserveAspectRatio: true, notes: ['Subtle only', 'Must not reduce text contrast'] },
  person: { slot: 'person', mode: 'cover', minWidth: 720, minHeight: 720, maxWidthRatio: 0.42, maxHeightRatio: 0.72, preserveAspectRatio: true, notes: ['Face crop safe', 'Avoid awkward limb clipping'] },
  orb: { slot: 'orb', mode: 'contain', minWidth: 720, minHeight: 720, maxWidthRatio: 0.5, maxHeightRatio: 0.72, preserveAspectRatio: true, notes: ['Non-logo visual motif', 'Keep behind title-safe zone'] },
  'ui-panel': { slot: 'ui-panel', mode: 'contain', minWidth: 720, minHeight: 420, maxWidthRatio: 0.7, maxHeightRatio: 0.65, preserveAspectRatio: true, notes: ['No tiny fake text', 'Use editable-like blocks'] },
};

export const buildPresentationAssetScalePlan = (slot: PresentationAssetSlot, canvas: PresentationCanvasSize): PresentationAssetScalePlan => {
  const rule = PRESENTATION_ASSET_SLOT_SCALE_RULES[slot];
  const targetWidth = Math.round(canvas.width * rule.maxWidthRatio);
  const targetHeight = Math.round(canvas.height * rule.maxHeightRatio);
  const issues: string[] = [];

  if (targetWidth < rule.minWidth) issues.push(`target width ${targetWidth}px below minimum ${rule.minWidth}px`);
  if (targetHeight < rule.minHeight) issues.push(`target height ${targetHeight}px below minimum ${rule.minHeight}px`);
  if ((slot === 'qr' || slot === 'logo' || slot === 'sponsor-logo') && !rule.preserveAspectRatio) issues.push('aspect ratio must be preserved');

  const status: PresentationAssetScaleStatus = issues.some((issue) => issue.includes('below minimum')) ? 'review' : 'pass';

  return {
    slot,
    canvas,
    mode: rule.mode,
    targetWidth,
    targetHeight,
    minWidth: rule.minWidth,
    minHeight: rule.minHeight,
    preserveAspectRatio: rule.preserveAspectRatio,
    status,
    issues,
  };
};

export const buildAssetScalingMatrix = () => {
  const library = getUnifiedPresentationAssetLibrary();
  const plans = library.items.flatMap((item) => PRESENTATION_CANVAS_SIZES.map((canvas) => ({
    assetId: item.id,
    label: item.label,
    slot: item.slot,
    canvas: canvas.id,
    plan: buildPresentationAssetScalePlan(item.slot, canvas),
  })));

  const review = plans.filter((entry) => entry.plan.status === 'review');
  const fail = plans.filter((entry) => entry.plan.status === 'fail');

  return {
    totalAssets: library.items.length,
    totalPlans: plans.length,
    pass: plans.length - review.length - fail.length,
    review: review.length,
    fail: fail.length,
    plans,
  };
};

export const buildAssetScalingPromptBlock = () => {
  const matrix = buildAssetScalingMatrix();
  return [
    'PRESENTATION ASSET SCALING TEST',
    `Assets tested: ${matrix.totalAssets}`,
    `Scale plans: ${matrix.totalPlans}`,
    `Pass: ${matrix.pass}`,
    `Review: ${matrix.review}`,
    `Fail: ${matrix.fail}`,
    'Preserve aspect ratio for logos, sponsor marks, QR codes, device frames, product renders, and charts. Never stretch exact logos.',
  ].join('\n');
};
