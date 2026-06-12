import {
  buildPresentationIntelligencePromptBlock,
  getPresentationLogoDataUrlForDeterministicLayer,
  type PresentationIntelligencePayload,
} from '../_shared/presentation-intelligence.ts';

export interface PresentationAwareDeckRequest {
  themeOverride?: string;
  presentationIntelligence?: PresentationIntelligencePayload;
  [key: string]: unknown;
}

export interface PresentationAwareDeckRequestResult<T extends PresentationAwareDeckRequest> {
  request: T;
  presentationIntelligenceBlock: string;
  deterministicLogoDataUrl?: string;
}

export const preparePresentationAwareDeckRequest = <T extends PresentationAwareDeckRequest>(
  request: T,
): PresentationAwareDeckRequestResult<T> => {
  const presentationIntelligenceBlock = buildPresentationIntelligencePromptBlock(request.presentationIntelligence);
  const deterministicLogoDataUrl = getPresentationLogoDataUrlForDeterministicLayer(request.presentationIntelligence);

  const mergedThemeOverride = [
    request.themeOverride,
    presentationIntelligenceBlock,
  ].filter(Boolean).join('\n\n');

  return {
    request: {
      ...request,
      themeOverride: mergedThemeOverride || request.themeOverride,
    },
    presentationIntelligenceBlock,
    deterministicLogoDataUrl,
  };
};

export const describePresentationAwareDeckRequestPatch = () => `
To wire Presentation Intelligence into generate-deck/index.ts:

1. Import preparePresentationAwareDeckRequest from ./presentation-aware-request.ts.
2. Add presentationIntelligence?: PresentationIntelligencePayload to DeckRequest.
3. At the top of planDeck(req, apiKey), call:

   const prepared = preparePresentationAwareDeckRequest(req);
   req = prepared.request;

4. Use prepared.deterministicLogoDataUrl later in pptx rendering for exact source logo insertion.

This keeps the current generate-deck behavior compatible because the Presentation Deck Brain is merged into themeOverride before the existing prompt is constructed.
`;
