import { describe, expect, it } from 'vitest';
import {
  gammaCreationPresets,
  gammaInspiredCapabilities,
  gammaCardBlocks,
  getGammaCapabilitiesByPriority,
  buildGammaDeckBrainPromptBlock,
} from './gammaPresentationResearchService';

describe('gammaPresentationResearchService', () => {
  it('includes the core Gamma-style creation modes', () => {
    expect(gammaCreationPresets.map((preset) => preset.mode)).toEqual([
      'generate',
      'paste',
      'import',
      'template',
      'agent',
    ]);
  });

  it('prioritizes implementation capabilities', () => {
    expect(gammaInspiredCapabilities.length).toBeGreaterThan(10);
    expect(getGammaCapabilitiesByPriority('ship_now').length).toBeGreaterThan(0);
    expect(getGammaCapabilitiesByPriority('next').length).toBeGreaterThan(0);
  });

  it('defines card/block primitives for future insert rail work', () => {
    expect(gammaCardBlocks.map((block) => block.type)).toContain('accent_image');
    expect(gammaCardBlocks.map((block) => block.type)).toContain('smart_layout');
    expect(gammaCardBlocks.map((block) => block.type)).toContain('toggle');
  });

  it('builds a Deck Brain prompt block', () => {
    const promptBlock = buildGammaDeckBrainPromptBlock();

    expect(promptBlock).toContain('GAMMA-INSPIRED PRESENTATION STUDIO INTELLIGENCE');
    expect(promptBlock).toContain('Creation modes:');
    expect(promptBlock).toContain('Priority capabilities:');
  });
});
