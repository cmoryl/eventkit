import { PRESENTATION_DRAG_DROP_ASSET_KITS } from '@/config/editableTemplates/presentationDragDropAssetKits';
import { PRESENTATION_ADVANCED_ASSET_PACKS } from '@/config/editableTemplates/presentationAdvancedAssetPacks';
import type { PresentationAssetKit, PresentationAssetKitItem, PresentationAssetSlot } from '@/config/editableTemplates/presentationDragDropAssetKits';

export interface UnifiedPresentationAssetLibrary {
  kits: PresentationAssetKit[];
  items: PresentationAssetKitItem[];
  summary: {
    totalKits: number;
    totalItems: number;
    starterKits: number;
    advancedPacks: number;
    slots: Record<PresentationAssetSlot, number>;
  };
}

const countBySlot = (items: PresentationAssetKitItem[]) => {
  return items.reduce((acc, item) => {
    acc[item.slot] = (acc[item.slot] ?? 0) + 1;
    return acc;
  }, {} as Record<PresentationAssetSlot, number>);
};

export const getUnifiedPresentationAssetLibrary = (): UnifiedPresentationAssetLibrary => {
  const kits = [...PRESENTATION_DRAG_DROP_ASSET_KITS, ...PRESENTATION_ADVANCED_ASSET_PACKS];
  const items = kits.flatMap((kit) => kit.items);
  return {
    kits,
    items,
    summary: {
      totalKits: kits.length,
      totalItems: items.length,
      starterKits: PRESENTATION_DRAG_DROP_ASSET_KITS.length,
      advancedPacks: PRESENTATION_ADVANCED_ASSET_PACKS.length,
      slots: countBySlot(items),
    },
  };
};

export const getUnifiedPresentationAssetsForTemplate = (templateId: string) => {
  return getUnifiedPresentationAssetLibrary().items.filter((item) => item.preferredTemplates.includes(templateId));
};

export const buildUnifiedAssetLibraryPromptBlock = (templateId?: string) => {
  const library = getUnifiedPresentationAssetLibrary();
  const items = templateId ? getUnifiedPresentationAssetsForTemplate(templateId) : library.items;
  return [
    'UNIFIED PRESENTATION ASSET LIBRARY',
    templateId ? `Template: ${templateId}` : 'Template: any',
    `Kits: ${library.summary.totalKits} total, ${library.summary.advancedPacks} advanced packs`,
    `Items: ${items.length} matching`,
    'Use assets only in matching slots. Keep logos exact, preserve safe zones, prefer editable/vector assets, and avoid low-resolution or fake UI text.',
    ...items.slice(0, 40).map((item) => `- ${item.label} [${item.slot}] formats=${item.formats.join(', ')} use=${item.usage}`),
  ].join('\n');
};
