import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('workspace UX audit', () => {
  it('uses React state and semantic controls instead of mutation observers', () => {
    expect(index).not.toContain('ux-audit-runtime.js');
    expect(index).not.toContain('intelligence-ui.js');
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(workspace).not.toContain('MutationObserver');
  });

  it('keeps first-run guidance short and actionable', () => {
    expect(workspace).toContain('What do you want to understand?');
    expect(workspace).toContain('Ask about yourself, a decision, a relationship, or the system around you.');
    expect(workspace).toContain('Your conversations will appear here.');
    expect(workspace).toContain('Nothing saved yet.');
  });

  it('supports keyboard, mobile, contrast, and reduced motion', () => {
    expect(workspace).toContain("event.key === 'Enter'");
    expect(workspace).toContain('Shift + Enter for a new line');
    expect(styles).toContain(':focus');
    expect(styles).toContain('@media (max-width: 800px)');
    expect(styles).toContain('@media (prefers-contrast: more)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
  });
});
