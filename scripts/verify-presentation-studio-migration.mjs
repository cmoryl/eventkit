#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = ['scripts/test-presentation-studio.mjs'];
if (process.argv.includes('--apply-toolbar')) args.push('--apply-toolbar');

console.log(`\n$ node ${args.join(' ')}`);
const result = spawnSync('node', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
