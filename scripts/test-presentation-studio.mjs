import { spawnSync } from 'node:child_process';

const applyToolbar = process.argv.includes('--apply-toolbar');

const commands = [
  ['node', ['scripts/prepare-slide-editor-consolidated-toolbar.mjs', applyToolbar ? '' : '--dry-run'].filter(Boolean)],
  ['node', ['scripts/verify-presentation-asset-system.mjs']],
  ['npx', ['vitest', 'run', 'src/services/presentationAssetIntelligenceOrchestrator.test.ts', 'src/services/presentationAssetScalingService.test.ts', 'src/services/presentationAssetStaticAudit.test.ts', 'src/services/presentationEditorUserFlowCombinationService.test.ts', 'src/services/presentationEditorFlowReplayService.test.ts', 'src/services/presentationEditorE2ECoverageService.test.ts']],
];

for (const [cmd, args] of commands) {
  const label = `${cmd} ${args.join(' ')}`;
  console.log(`\n▶ ${label}`);
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`\n✖ Presentation Studio verification failed at: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log(
  applyToolbar
    ? '\n✓ Presentation Studio verification passed after applying the SlideEditor toolbar migration.'
    : '\n✓ Presentation Studio verification passed with SlideEditor toolbar migration dry-run.'
);
