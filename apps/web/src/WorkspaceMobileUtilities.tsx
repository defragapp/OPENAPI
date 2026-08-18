import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { VerifiedPlanStatus } from './VerifiedPlanStatus';

const mobileQuery = '(max-width: 820px)';

function closeContextSheet(): void {
  document.querySelector<HTMLButtonElement>('.intelligence-context > header button')?.click();
}

function openAfterContextClose(action: () => void): void {
  closeContextSheet();
  window.setTimeout(action, 140);
}

export function WorkspaceMobileUtilities() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia(mobileQuery);
    const sync = () => setMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!mobile) {
      setMount(null);
      return;
    }

    let currentMount: HTMLElement | null = null;
    const install = () => {
      const context = document.querySelector<HTMLElement>('.intelligence-context .context-scroll');
      if (!context) return;
      const existing = context.querySelector<HTMLElement>(':scope > .workspace-mobile-utilities-mount');
      if (existing) {
        currentMount = existing;
        setMount(existing);
        return;
      }
      const nextMount = document.createElement('div');
      nextMount.className = 'workspace-mobile-utilities-mount';
      context.prepend(nextMount);
      currentMount = nextMount;
      setMount(nextMount);
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      currentMount?.remove();
      setMount(null);
    };
  }, [mobile]);

  if (!mobile || !mount) return null;

  return createPortal(
    <details className="workspace-mobile-utilities">
      <summary>
        <span className="workspace-mobile-utilities-summary-copy">
          <strong>Workspace tools</strong>
          <span>Plan, account, sharing, and system controls</span>
        </span>
      </summary>
      <section className="workspace-mobile-utilities-content" aria-labelledby="workspace-mobile-utilities-title">
        <div className="workspace-mobile-utilities-heading">
          <span>WORKSPACE</span>
          <h3 id="workspace-mobile-utilities-title">Tools and controls</h3>
          <p>Open these only when you want to review or change something outside the conversation.</p>
        </div>
        <VerifiedPlanStatus expanded />
        <div className="workspace-mobile-utility-actions">
          <button type="button" onClick={() => openAfterContextClose(() => document.querySelector<HTMLButtonElement>('.expression-field-launcher')?.click())}>
            <strong>Expression Field</strong><span>Open the visual view of your Baseline</span>
          </button>
          <button type="button" onClick={() => openAfterContextClose(() => document.querySelector<HTMLButtonElement>('.system-membership-trigger')?.click())}>
            <strong>System members</strong><span>Choose who can be included</span>
          </button>
          <button type="button" onClick={() => openAfterContextClose(() => window.dispatchEvent(new CustomEvent('sovereign:open-account-controls')))}>
            <strong>Account & Library</strong><span>Plan, billing, sharing, and saved work</span>
          </button>
        </div>
      </section>
    </details>,
    mount
  );
}