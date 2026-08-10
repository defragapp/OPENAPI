import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const launcher = readFileSync(new URL('./WorldVideoLauncher.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./world-video.css', import.meta.url), 'utf8');

describe('authenticated Worlds experience', () => {
  it('keeps Worlds inside the authenticated one-room workspace rather than navigation', () => {
    expect(workspace).toContain("import { WorldVideoLauncher } from './WorldVideoLauncher'");
    expect(workspace).toContain('<WorldVideoLauncher />');
    expect(workspace).toContain('data-workspace-contract="one-room"');
    expect(launcher).toContain("fetch('/api/v1/worlds/video/status'");
    expect(launcher).toContain("if (!status?.enabled || !status.eligible) return null");
  });

  it('requires explicit generation and never accepts an arbitrary renderer prompt', () => {
    expect(launcher).toContain("fetch('/api/v1/worlds/video', {");
    expect(launcher).toContain("method: 'POST'");
    expect(launcher).not.toContain('prompt:');
    expect(launcher).not.toContain('<textarea');
    expect(launcher).toContain('Generate World ·');
  });

  it('plays provider media only from a local blob URL and revokes it', () => {
    expect(launcher).toContain('URL.createObjectURL(blob)');
    expect(launcher).toContain('URL.revokeObjectURL');
    expect(launcher).toContain('autoPlay={!reduceMotion}');
    expect(launcher).toContain('muted');
    expect(launcher).toContain('loop');
    expect(launcher).toContain('playsInline');
  });

  it('respects reduced-motion preferences for generated video playback', () => {
    expect(launcher).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(launcher).toContain("query.addEventListener('change', update)");
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('uses the restrained monochrome world-first visual language', () => {
    expect(launcher).toContain('See the world you’re living in.');
    expect(css).toContain('background: #050505');
    expect(css).toContain('filter: grayscale(1)');
    expect(css).toContain('.worlds-stage__viewport');
    expect(css).not.toContain('grid-template-columns: repeat(3');
  });
});
