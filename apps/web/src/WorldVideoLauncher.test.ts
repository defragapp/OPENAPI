import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const launcher = readFileSync(new URL('./WorldVideoLauncher.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../../../wrangler.jsonc', import.meta.url), 'utf8');
const videoContract = readFileSync(new URL('../../../docs/worlds-private-video-contract.md', import.meta.url), 'utf8');

describe('dormant Worlds video boundary', () => {
  it('keeps video generation out of the current authenticated text-first launch', () => {
    expect(workspace).not.toContain("import { WorldVideoLauncher } from './WorldVideoLauncher'");
    expect(workspace).not.toContain('<WorldVideoLauncher />');
    expect(workspace).not.toContain('/api/v1/worlds/video/status');
    expect(workspace).not.toContain('/api/v1/worlds/video');
    expect(workspace).toContain('data-workspace-contract="one-room"');
    expect(wrangler).toContain('"WORLDS_VIDEO_ENABLED": "false"');
    expect(videoContract).toContain('future/disabled reference only');
    expect(videoContract).toContain('Issue #198 was closed `not planned`');
  });

  it('keeps the future launcher fail-closed if the dormant component is ever revisited', () => {
    expect(launcher).toContain("fetch('/api/v1/worlds/video/status'");
    expect(launcher).toContain("if (!status?.enabled || !status.eligible) return null");
    expect(launcher).toContain("fetch('/api/v1/worlds/video', {");
    expect(launcher).toContain("method: 'POST'");
    expect(launcher).not.toContain('prompt:');
    expect(launcher).not.toContain('<textarea');
  });

  it('keeps future provider media private to a local blob URL and revokes it', () => {
    expect(launcher).toContain('URL.createObjectURL(blob)');
    expect(launcher).toContain('URL.revokeObjectURL');
    expect(launcher).toContain('autoPlay={!reduceMotion}');
    expect(launcher).toContain('muted');
    expect(launcher).toContain('loop');
    expect(launcher).toContain('playsInline');
  });

  it('has removed the dormant component stylesheet as part of visual system consolidation', () => {
    expect(existsSync(new URL('./world-video.css', import.meta.url))).toBe(false);
  });
});
