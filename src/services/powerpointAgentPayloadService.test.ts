import { describe, expect, it, vi } from 'vitest';
import { modernSaaS } from '@/brandPresets';
import { buildPresentationAwarePowerPointPayload } from './powerpointAgentPayloadService';

vi.mock('./brandAssetCloudService', async () => {
  const actual = await vi.importActual<any>('./brandAssetCloudService');
  return {
    ...actual,
    getCloudBackedBrandAssetGenerationContext: async () => ({
      context: {
        logos: [],
        visualReferences: [],
        patternReferences: [],
        layoutReferences: [],
        doExamples: [],
        dontExamples: [],
        promptBlock: '',
      },
      cloud: { ok: true, message: 'mock cloud' },
    }),
  };
});

describe('powerpointAgentPayloadService', () => {
  it('adds presentation intelligence to a deck payload', async () => {
    const result = await buildPresentationAwarePowerPointPayload({
      profile: modernSaaS,
      basePayload: {
        topic: 'Executive update deck',
        slideCount: 8,
        themeOverride: 'Use a dark executive theme.',
      },
      exportProfile: 'executive_presentation',
      sourceKind: 'prompt',
    });

    expect(result.payload.presentationIntelligenceVersion).toBe('1.0');
    expect(result.payload.presentationIntelligence.promptBlock).toContain('PRESENTATION DECK BRAIN');
    expect(result.payload.themeOverride).toContain('Use a dark executive theme.');
    expect(result.payload.themeOverride).toContain('PRESENTATION DECK BRAIN');
  });
});
