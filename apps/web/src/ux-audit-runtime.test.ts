import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./space-chat.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('space UX audit', () => {
  it('uses React state and semantic controls instead of DOM mutation layers', () => {
    expect(index).not.toContain('ux-audit-runtime.js');
    expect(index).not.toContain('intelligence-ui.js');
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(space).not.toContain('MutationObserver');
  });

  it('provides meaningful first-run guidance without administrative incomplete states', () => {
    expect(space).toContain('What do you want to understand?');
    expect(space).toContain('Your intelligence begins with your Baseline.');
    expect(space).toContain('Build my Baseline');
    expect(space).not.toContain('INCOMPLETE');
    expect(space).toContain('Nothing has been kept yet.');
  });

  it('supports keyboard, mobile sheets, and reduced motion', () => {
    expect(space).toContain("event.key === 'Enter'");
    expect(space).toContain('event.shiftKey');
    expect(space).toContain('role="dialog"');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
  });
});
