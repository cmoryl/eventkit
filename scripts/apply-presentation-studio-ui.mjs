#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const steps = [
  ['node', ['scripts/wire-slide-asset-search-panel.mjs', '--apply'], 'SlideEditor asset rail'],
  ['node', ['scripts/prepare-powerpoint-agent-sidebar-polish.mjs', '--apply'], 'PowerPoint agent sidebar polish'],
];

for (const [command, args, label] of steps) {
  console.log(`[presentation-ui] Applying ${label}...`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    console.error(`[presentation-ui] Failed while applying ${label}.`);
    process.exit(result.status ?? 1);
  }
}

console.log('[presentation-ui] Prepared Presentation Studio UI migrations are applied for this runtime.');
