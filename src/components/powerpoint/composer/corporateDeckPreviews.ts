// Registry of templates that have a real .pptx bundled as their source of truth.
// Used by TemplatePosterPreview to render the *actual* parsed first slide
// instead of the synthetic gradient-orb illustration, and by PowerPointAgent
// to load the deck as starter content + AI reference.
import transperfectDeckAsset from '@/assets/transperfect-general-deck.pptx.asset.json';

export interface CorporateDeckRef {
  /** Public URL of the bundled .pptx (asset CDN). */
  url: string;
  /** Original file name preserved for downloads / parse heuristics. */
  fileName: string;
  /** Friendly label used in toasts and the editor source pill. */
  label: string;
  /** File size in bytes — surfaced on template cards so users can confirm
   *  the correct deck is wired up. */
  sizeBytes?: number;
  /** ISO timestamp of when the asset was uploaded to the CDN. */
  uploadedAt?: string;
}

export const CORPORATE_DECK_PREVIEWS: Record<string, CorporateDeckRef> = {
  'transperfect-2026': {
    url: transperfectDeckAsset.url,
    fileName: 'TransPerfect_General_Deck.pptx',
    label: 'TransPerfect Corporate Deck',
    sizeBytes: transperfectDeckAsset.size,
    uploadedAt: transperfectDeckAsset.created_at,
  },
};

export const getCorporateDeckRef = (templateId?: string | null): CorporateDeckRef | undefined => {
  if (!templateId) return undefined;
  return CORPORATE_DECK_PREVIEWS[templateId];
};

export const formatDeckSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
