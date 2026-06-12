import { spawnSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'test']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'build']],
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

console.log('\n✓ Presentation Studio verification passed: tests, lint, and build completed.');
