import { spawnSync } from 'node:child_process';

const result = spawnSync('tsx', ['scripts/openai-smoke.ts'], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
