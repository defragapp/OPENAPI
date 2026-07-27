import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../../sovereign-worker/src/agent/prompt-v1.ts', import.meta.url), 'utf8');

describe('conversation-first Baseline intelligence', () => {
  it('ships one React-owned workspace without legacy DOM enhancement layers', () => {
    expect(index).toContain('/src/main.tsx');
    for (const retired of ['recognition-ui.js', 'archetype-clarity.js', 'intelligence-ui.js', 'ux-audit-runtime.js']) {
      expect(index).not.toContain(retired);
    }
    expect(workspace).toContain('className="conversation-shell"');
    expect(workspace).toContain('className="chat-composer"');
  });

  it('keeps Baseline context available without turning the account into a dashboard', () => {
    expect(workspace).toContain('YOUR BASELINE · AVAILABLE IN EVERY CONVERSATION');
    expect(workspace).toContain('What do you want to understand?');
    expect(workspace).toContain('<BaselineOrbit compact />');
    expect(workspace).toContain("api('/api/v1/today')");
    expect(workspace).not.toContain('result-panel');
    expect(workspace).not.toContain('surface-main');
  });

  it('keeps every product level reachable as contextual tools', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(workspace).toContain(label);
    }
    expect(workspace).toContain('Manage permissions');
    expect(workspace).toContain('Only understandings you deliberately save appear here.');
    expect(workspace).toContain('Optional Christian and biblical lens for this conversation.');
  });

  it('is responsive and reduced-motion safe', () => {
    expect(styles).toContain('@media (max-width: 800px)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
    expect(styles).toContain('.conversation-shell');
    expect(styles).toContain('.workspace-context-panel');
  });

  it('keeps the agent Baseline-first and user-correctable', () => {
    expect(prompt).toContain('BASELINE-FIRST FLOW');
    expect(prompt).toContain('Do not require the user to explain an incident');
    expect(prompt).toContain('Shadow and light');
    expect(prompt).toContain('Alignment');
    expect(prompt).toContain('Relationship');
    expect(prompt).toContain('System');
    expect(prompt).toContain('Covenant');
  });

  it('uses typed server actions and confirms consequential operations', () => {
    expect(workspace).toContain("response.headers.get('x-sovereign-interface-actions')");
    expect(workspace).toContain("['open_baseline', 'open_person', 'open_system', 'open_decision', 'open_optional_lens', 'show_plan']");
    expect(workspace).toContain("window.confirm('Save this response to your private Library?')");
    expect(workspace).toContain('Send a private invitation to');
    expect(workspace).not.toContain('isReversibleAction(actions.primary)');
    expect(workspace).not.toContain('MutationObserver');
  });

  it('renders and restores validated visual stories and explicit module offers', () => {
    expect(workspace).toContain("response.headers.get('x-sovereign-visual-story')");
    expect(workspace).toContain("response.headers.get('x-sovereign-module-offer')");
    expect(workspace).toContain("response.headers.get('x-sovereign-module-title')");
    expect(workspace).toContain('validVisualStoryPayload(restored?.visualStory)');
    expect(workspace).toContain('validModuleOffer(restored?.moduleOffer)');
    expect(workspace).toContain('<VisualStoryCard');
    expect(workspace).toContain('/modules/latest');
    expect(workspace).toContain('window.confirm(`Save “${moduleOffer.title}” to your private Library?`)');
  });

  it('keeps personal and system-member selection isolated and restores explicit personal context', () => {
    expect(workspace).toContain("setSelectedPerson(restoredSystem ? '' : restoredPerson)");
    expect(workspace).toContain("setSelectedSystem(restoredPerson ? '' : restoredSystem)");
    expect(workspace).toContain("const [memberId, setMemberId] = useState('')");
    expect(workspace).toContain("person.activeScopes?.includes('system.include')");
    expect(workspace).not.toContain('if (actions?.primary &&');
  });

  it('restores user-controlled deletion and purpose-specific invitation scopes', () => {
    expect(workspace).toContain("api('/api/v1/deletion-jobs')");
    expect(workspace).toContain('Request account deletion');
    expect(workspace).toContain('Cancel account deletion');
    expect(workspace).toContain("'system.include'");
    expect(workspace).toContain("'covenant.include'");
  });

  it('advances the public cache without caching private workspace assets', () => {
    expect(serviceWorker).toContain("sovereign-public-v8");
    expect(serviceWorker).not.toContain("'/intelligence-ui.js'");
    expect(serviceWorker).not.toContain("'/ux-audit-runtime.js'");
    expect(serviceWorker).not.toContain("'/app'");
  });
});
