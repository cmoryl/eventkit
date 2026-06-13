import { buildPresentationAssetSuggestionPromptBlock, getPresentationAssetSuggestions } from './presentationAssetSuggestionService';
import { buildPresentationAssetDropZonePromptBlock } from './presentationAssetDropZoneService';
import { buildPresentationAssetReadinessPromptBlock } from './presentationAssetReadinessService';
import { buildPresentationAssetGovernancePromptBlock } from './presentationAssetGovernanceService';
import { buildUnifiedAssetLibraryPromptBlock } from './presentationUnifiedAssetLibraryService';
import { buildPresentationAssetVariantPromptBlock } from '@/config/editableTemplates/presentationAssetVariations';
import { buildExtendedSystemAssetPromptBlock } from '@/config/editableTemplates/presentationExtendedSystemAssets';
import { buildPrebuiltObjectPromptBlock } from '@/components/powerpoint/composer/prebuiltPresentationObjects';
import { buildDataVizStylePromptBlock } from '@/components/powerpoint/composer/prebuiltDataVizStyles';
import { buildAdvancedDataStoryPromptBlock } from '@/components/powerpoint/composer/advancedDataStoryBlocks';
import { buildGalleryImageryPromptBlock } from '@/components/powerpoint/composer/galleryImageryDirectives';

export interface PresentationAssetIntelligenceRequest {
  templateId?: string;
  query?: string;
}

export interface PresentationAssetIntelligenceState {
  templateId?: string;
  query?: string;
  matchingAssets: number;
  promptBlock: string;
  sections: {
    readiness: string;
    governance: string;
    library: string;
    suggestions: string;
    dropZones: string;
    variants: string;
    extendedSystems: string;
    objects: string;
    dataViz: string;
    dataStories: string;
    imagery: string;
  };
}

export const buildPresentationAssetIntelligenceState = ({ templateId, query }: PresentationAssetIntelligenceRequest = {}): PresentationAssetIntelligenceState => {
  const suggestions = getPresentationAssetSuggestions({ templateId, query, limit: 16 });
  const sections = {
    readiness: buildPresentationAssetReadinessPromptBlock(),
    governance: buildPresentationAssetGovernancePromptBlock(),
    library: buildUnifiedAssetLibraryPromptBlock(templateId),
    suggestions: buildPresentationAssetSuggestionPromptBlock({
      templateId,
      query,
      kitItems: suggestions.kitItems,
      examples: suggestions.examples,
    }),
    dropZones: buildPresentationAssetDropZonePromptBlock(templateId),
    variants: buildPresentationAssetVariantPromptBlock(templateId),
    extendedSystems: buildExtendedSystemAssetPromptBlock(templateId),
    objects: templateId ? buildPrebuiltObjectPromptBlock(templateId) : buildPrebuiltObjectPromptBlock('any'),
    dataViz: templateId ? buildDataVizStylePromptBlock(templateId) : buildDataVizStylePromptBlock('any'),
    dataStories: templateId ? buildAdvancedDataStoryPromptBlock(templateId) : buildAdvancedDataStoryPromptBlock('any'),
    imagery: templateId ? buildGalleryImageryPromptBlock(templateId) : 'GALLERY IMAGERY DIRECTIVES\nTemplate: any\nSelect the closest template-specific imagery directive when a template is chosen.',
  };

  return {
    templateId,
    query,
    matchingAssets: suggestions.kitItems.length + suggestions.examples.length,
    sections,
    promptBlock: [
      'PRESENTATION ASSET INTELLIGENCE ORCHESTRATOR',
      templateId ? `Template: ${templateId}` : 'Template: any',
      query ? `Intent: ${query}` : 'Intent: none',
      'Use this as the source of truth for asset selection, generation, validation, and insertion.',
      sections.readiness,
      sections.governance,
      sections.library,
      sections.suggestions,
      sections.dropZones,
      sections.variants,
      sections.extendedSystems,
      sections.objects,
      sections.dataViz,
      sections.dataStories,
      sections.imagery,
    ].join('\n\n'),
  };
};
