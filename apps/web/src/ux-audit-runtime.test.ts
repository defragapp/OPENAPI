import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('workspace UX audit', () => {
  it('uses React state and semantic controls instead of DOM mutation layers', () => {
    expect(index).not.toContain('ux-audit-runtime.js');
    expect(index).not.toContain('intelligence-ui.js');
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(workspace).not.toContain('MutationObserver');
  });

  it('provides meaningful first-run guidance and explicit incomplete states', () => {
    expect(workspace).toContain('What do you want to understand?');
    expect(workspace).toContain('Each mode opens a real exploration.');
    expect(workspace).toContain('Your Baseline facets are not ready yet.');
    expect(workspace).toContain('Nothing saved yet.');
  });

  it('supports keyboard, mobile sheets, and reduced motion', () => {
    expect(workspace).toContain("event.key === 'Enter'");
    expect(workspace).toContain('Shift + Enter for a new line');
    expect(workspace).toContain('role="dialog"');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
  });
});
