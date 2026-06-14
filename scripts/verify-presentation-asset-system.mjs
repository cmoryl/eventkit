#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  'src/services/presentationUnifiedAssetLibraryService.ts',
  'src/services/presentationAssetReadinessService.ts',
  'src/services/presentationAssetValidationService.ts',
  'src/services/presentationAssetGovernanceService.ts',
  'src/services/presentationAssetIntelligenceOrchestrator.ts',
  'src/config/editableTemplates/presentationAdvancedAssetPacks.ts',
  'src/config/editableTemplates/presentationAssetVariations.ts',
  'src/config/editableTemplates/presentationExtendedSystemAssets.ts',
];

const missing = files.filter((file) => !existsSync(resolve(process.cwd(), file)));
if (missing.length) throw new Error(`Missing presentation asset system files: ${missing.join(', ')}`);

const dashboard = readFileSync(resolve(process.cwd(), 'src/components/powerpoint/PresentationStudioIntelligenceDashboard.tsx'), 'utf8');
for (const panel of ['PresentationAssetReadinessPanel', 'PresentationAssetValidationPanel', 'PresentationAssetVariantsPanel', 'PresentationExtendedSystemAssetsPanel']) {
  if (!dashboard.includes(panel)) throw new Error(`Dashboard missing ${panel}`);
}

const orchestrator = readFileSync(resolve(process.cwd(), 'src/services/presentationAssetIntelligenceOrchestrator.ts'), 'utf8');
for (const section of ['buildPresentationAssetReadinessPromptBlock', 'buildPresentationAssetGovernancePromptBlock', 'buildUnifiedAssetLibraryPromptBlock', 'buildExtendedSystemAssetPromptBlock']) {
  if (!orchestrator.includes(section)) throw new Error(`Orchestrator missing ${section}`);
}

console.log('Presentation asset system verification passed.');
