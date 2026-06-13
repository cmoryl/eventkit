#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const run = (command, args) => {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const applyToolbar = process.argv.includes('--apply-toolbar');

run('node', [
  'scripts/prepare-slide-editor-consolidated-toolbar.mjs',
  applyToolbar ? '' : '--dry-run',
].filter(Boolean));

if (!applyToolbar) {
  console.log('\nDry run complete. Add --apply-toolbar to apply the SlideEditor toolbar migration before validation.');
}

run('npm', ['run', 'test']);
run('npm', ['run', 'lint']);
run('npm', ['run', 'build']);
