import { PRESENTATION_DRAG_DROP_ASSET_EXAMPLES, type PresentationDragDropAssetExample } from '@/config/editableTemplates/presentationDragDropAssetExamples';
import { PRESENTATION_DRAG_DROP_ASSET_KITS, type PresentationAssetKit, type PresentationAssetKitItem, type PresentationAssetSlot } from '@/config/editableTemplates/presentationDragDropAssetKits';

export interface PresentationAssetSuggestionRequest {
  templateId?: string;
  slot?: PresentationAssetSlot;
  query?: string;
  limit?: number;
}

export interface PresentationAssetSuggestionResult {
  kits: PresentationAssetKit[];
  kitItems: PresentationAssetKitItem[];
  examples: PresentationDragDropAssetExample[];
  promptBlock: string;
}

const normalize = (value?: string) => (value ?? '').trim().toLowerCase();

const matchesQuery = (query: string, values: Array<string | undefined>) => {
  if (!query) return true;
  return values.some((value) => normalize(value).includes(query));
};

export const getPresentationAssetSuggestions = ({
  templateId,
  slot,
  query,
  limit = 12,
}: PresentationAssetSuggestionRequest = {}): PresentationAssetSuggestionResult => {
  const q = normalize(query);

  const kitItems = PRESENTATION_DRAG_DROP_ASSET_KITS
    .flatMap((kit) => kit.items.map((item) => ({ kit, item })))
    .filter(({ item }) => !templateId || item.preferredTemplates.includes(templateId))
    .filter(({ item }) => !slot || item.slot === slot)
    .filter(({ kit, item }) => matchesQuery(q, [kit.name, kit.description, item.label, item.usage, item.slot, item.promptHint]))
    .slice(0, limit);

  const examples = PRESENTATION_DRAG_DROP_ASSET_EXAMPLES
    .filter((example) => !templateId || example.bestTemplates.includes(templateId))
    .filter((example) => matchesQuery(q, [example.label, example.recommendedUse, example.kind, example.promptHint]))
    .slice(0, limit);

  const kits = PRESENTATION_DRAG_DROP_ASSET_KITS
    .filter((kit) => kitItems.some(({ kit: matchedKit }) => matchedKit.id === kit.id))
    .slice(0, limit);

  const promptBlock = buildPresentationAssetSuggestionPromptBlock({
    templateId,
    slot,
    query,
    kitItems: kitItems.map(({ item }) => item),
    examples,
  });

  return {
    kits,
    kitItems: kitItems.map(({ item }) => item),
    examples,
    promptBlock,
  };
};

export const buildPresentationAssetSuggestionPromptBlock = ({
  templateId,
  slot,
  query,
  kitItems,
  examples,
}: {
  templateId?: string;
  slot?: PresentationAssetSlot;
  query?: string;
  kitItems: PresentationAssetKitItem[];
  examples: PresentationDragDropAssetExample[];
}) => [
  'PRESENTATION ASSET SUGGESTIONS',
  templateId ? `Template: ${templateId}` : 'Template: any',
  slot ? `Slot: ${slot}` : 'Slot: any',
  query ? `Search intent: ${query}` : 'Search intent: none',
  'Use approved exact logos. Do not redraw or approximate brand marks.',
  'Prioritize assets that match the selected template slot and recommended format.',
  ...kitItems.map((item) => `- Kit item: ${item.label} [${item.slot}] formats=${item.formats.join(', ')} use=${item.usage}`),
  ...examples.map((example) => `- Example: ${example.label} [${example.kind}] formats=${example.recommendedFormats.join(', ')} use=${example.recommendedUse}`),
].join('\n');

export const getPresentationAssetSuggestionCount = () => ({
  kits: PRESENTATION_DRAG_DROP_ASSET_KITS.length,
  kitItems: PRESENTATION_DRAG_DROP_ASSET_KITS.reduce((count, kit) => count + kit.items.length, 0),
  examples: PRESENTATION_DRAG_DROP_ASSET_EXAMPLES.length,
});
