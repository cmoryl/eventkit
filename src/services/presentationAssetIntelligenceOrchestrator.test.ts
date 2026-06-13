import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('presentation asset intelligence static coverage', () => {
  it('keeps the core asset intelligence files connected', () => {
    expect(read('src/services/presentationUnifiedAssetLibraryService.ts')).toContain('PRESENTATION_ADVANCED_ASSET_PACKS');
    expect(read('src/services/presentationAssetReadinessService.ts')).toContain('source-governance');
    expect(read('src/services/presentationAssetValidationService.ts')).toContain('logo.not_exact');
    expect(read('src/services/presentationAssetIntelligenceOrchestrator.ts')).toContain('PRESENTATION ASSET INTELLIGENCE ORCHESTRATOR');
  });
});
