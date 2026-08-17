import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/text-first-ui-authority-v1.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('text-first authenticated launch', () => {
  it('loads a fail-closed UI authority before the React app mounts', () => {
    expect(indexHtml).toContain('/text-first-ui-authority-v1.css?v=20260817-text-first-v1');
    expect(indexHtml.indexOf('text-first-ui-authority-v1.css'))
      .toBeLessThan(indexHtml.indexOf('/src/main.tsx'));
  });

  it('removes the legacy Listen/TTS control from the authenticated workspace', () => {
    expect(workspace).not.toContain("import { useTTS } from './hooks/useTTS'");
    expect(workspace).not.toContain('tts-listen-button');
    expect(workspace).not.toContain('toggleTTS');
    expect(css).toContain('.tts-listen-button');
    expect(css).toContain('display: none !important;');
  });
});
