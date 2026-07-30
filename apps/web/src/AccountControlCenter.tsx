import { useEffect, useMemo, useState } from 'react';

type Json = Record<string, any>;
type LibraryItem = {
  id: string;
  threadId?: string;
  kind?: string;
  body?: { title?: string; summary?: string; links?: Record<string, string>; uncertainty?: string };
  title?: string;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
};
type PersonItem = { id: string; displayName: string; invitationId?: string; invitationStatus?: string; invitationExpiresAt?: string };
type DeletionJob = { id: string; status: string; requestedAt?: string; scheduledFor?: string };

export function AccountControlCenter() {
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [deletionJob, setDeletionJob] = useState<DeletionJob | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [deleteApproval, setDeleteApproval] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const pendingInvitations = useMemo(() => people.filter((person) => person.invitationStatus === 'pending' && person.invitationId), [people]);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init.method && init.method !== 'GET' ? { 'x-idempotency-key': crypto.randomUUID() } : {}),
        ...(init.headers ?? {})
      }
    });
    if (response.status === 401) {
      location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
      throw new Error('Sign-in required');
    }
    const body = response.headers.get('content-type')?.includes('application/json')
      ? await response.json().catch(() => ({})) as Json
      : {};
    if (!response.ok) {
      const retry = Number(response.headers.get('retry-after') ?? body.retryAfterSeconds ?? 0);
      throw new Error(response.status === 429 && retry > 0 ? `Try again in ${retry} seconds.` : body.message || body.error || 'We could not complete that request.');
    }
    return body;
  }

  async function refresh() {
    setLoading(true);
    setStatus('Loading your account controls…');
    try {
      const [libraryData, peopleData, deletionData] = await Promise.all([
        api('/api/v1/library'),
        api('/api/v1/people'),
        api('/api/v1/deletion-jobs')
      ]);
      const items = Array.isArray(libraryData.understandings) ? libraryData.understandings as LibraryItem[] : [];
      setLibrary(items);
      setPeople(Array.isArray(peopleData.people) ? peopleData.people as PersonItem[] : []);
      setEdits(Object.fromEntries(items.map((item) => [item.id, item.body?.title ?? item.title ?? 'Saved insight'])));
      setDeletionJob(deletionData.deletionJob ?? null);
      setStatus('Your account controls are up to date.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Account controls are unavailable.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('sovereign:open-account-controls', show);
    return () => window.removeEventListener('sovereign:open-account-controls', show);
  }, []);

  useEffect(() => {
    if (!open) return;
    void refresh();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  async function rename(item: LibraryItem) {
    const title = (edits[item.id] ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (!title) {
      setStatus('Enter a title for this saved insight.');
      return;
    }
    setLoading(true);
    setStatus('Saving the new title…');
    try {
      await api(`/api/v1/library/${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify({ title }) });
      await refresh();
      setStatus('Title saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'We could not save that title.');
      setLoading(false);
    }
  }

  async function remove(item: LibraryItem) {
    if (!window.confirm('Delete this saved insight from Library? The original conversation will remain.')) return;
    setLoading(true);
    setStatus('Deleting saved insight…');
    try {
      await api(`/api/v1/library/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      await refresh();
      setStatus('Saved insight deleted.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'We could not delete that insight.');
      setLoading(false);
    }
  }

  async function changeInvitation(person: PersonItem, action: 'resend' | 'cancel') {
    if (!person.invitationId || loading) return;
    if (action === 'cancel' && !window.confirm(`Cancel the pending invitation for ${person.displayName}?`)) return;
    setLoading(true);
    setStatus(action === 'resend' ? `Sending a new invitation to ${person.displayName}…` : `Cancelling ${person.displayName}’s invitation…`);
    try {
      await api(`/api/v1/invitations/${encodeURIComponent(person.invitationId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action === 'resend' ? 'pending' : 'revoked' })
      });
      await refresh();
      setStatus(action === 'resend' ? 'A new one-time invitation link was sent.' : 'Invitation cancelled.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'We could not change that invitation.');
      setLoading(false);
    }
  }

  async function requestDeletion() {
    if (!deleteApproval || deletePhrase !== 'DELETE' || loading) return;
    setLoading(true);
    setStatus('Scheduling account deletion…');
    try {
      const result = await api('/api/v1/deletion-jobs', { method: 'POST', body: JSON.stringify({ approved: true }) });
      setDeletionJob(result.deletionJob ?? null);
      setDeleteApproval(false);
      setDeletePhrase('');
      setStatus('Deletion scheduled. You can cancel during the 14-day grace period.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'We could not schedule account deletion.');
    } finally {
      setLoading(false);
    }
  }

  async function cancelDeletion() {
    if (!deletionJob || loading) return;
    setLoading(true);
    setStatus('Cancelling account deletion…');
    try {
      await api(`/api/v1/deletion-jobs/${encodeURIComponent(deletionJob.id)}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) });
      setDeletionJob(null);
      setStatus('Account deletion cancelled.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'We could not cancel account deletion.');
    } finally {
      setLoading(false);
    }
  }

  async function openBilling() {
    setLoading(true);
    setStatus('Opening secure Stripe billing…');
    try {
      const body = await api('/api/v1/billing/portal', { method: 'POST', body: '{}' });
      if (body.portal?.url) location.assign(body.portal.url);
      else throw new Error('Stripe billing is unavailable.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Stripe billing is unavailable.');
      setLoading(false);
    }
  }

  function openPermissions() {
    setOpen(false);
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls')), 0);
  }

  return (
    <>
      {open && (
        <div className="account-control-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="account-control-dialog" role="dialog" aria-modal="true" aria-labelledby="account-control-title">
            <header><div><p>ACCOUNT CONTROLS</p><h2 id="account-control-title">Manage your account and saved insights.</h2></div><button onClick={() => setOpen(false)} aria-label="Close account controls">×</button></header>
            <p className="account-control-intro">Review invitations, saved insights, billing, permissions, and account deletion in one place.</p>
            <p className="account-control-status" role="status" aria-live="polite">{status}</p>

            <nav className="account-control-links" aria-label="Account links">
              <button onClick={openPermissions}>People & permissions</button><button onClick={() => void openBilling()} disabled={loading}>Manage billing</button><a href="https://sovereign.defrag.app/privacy">Privacy</a><a href="https://sovereign.defrag.app/terms">Terms</a><a href="mailto:info@defrag.app">Support</a>
            </nav>

            <section className="account-control-section">
              <div className="account-section-heading"><p>PENDING INVITATIONS</p><h3>Invitations that have not been accepted</h3><span>Resending creates a new one-time link and invalidates the previous one. Delivery limits prevent repeated sends.</span></div>
              {pendingInvitations.length === 0 ? <p className="account-empty">No invitations are waiting.</p> : <div className="pending-invitation-list">{pendingInvitations.map((person) => <article key={person.id}><div><strong>{person.displayName}</strong><small>{person.invitationExpiresAt ? `Expires ${new Date(person.invitationExpiresAt).toLocaleDateString()}` : 'Waiting for review'}</small></div><div><button disabled={loading} onClick={() => void changeInvitation(person, 'resend')}>Send a new link</button><button className="danger" disabled={loading} onClick={() => void changeInvitation(person, 'cancel')}>Cancel</button></div></article>)}</div>}
            </section>

            <section className="account-control-section">
              <div className="account-section-heading"><p>LIBRARY</p><h3>Insights you chose to save</h3><span>Rename or remove a saved insight without changing the original conversation.</span></div>
              {library.length === 0 ? <p className="account-empty">Nothing saved yet.</p> : <div className="account-library-list">{library.map((item) => <article key={item.id}><label>Title<input value={edits[item.id] ?? ''} maxLength={120} onChange={(event) => setEdits((current) => ({ ...current, [item.id]: event.target.value }))} /></label><p>{item.body?.summary ?? item.summary ?? 'No summary is available.'}</p><small>{item.updatedAt ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}` : 'Saved privately'}{item.body?.uncertainty ? ` · uncertainty ${item.body.uncertainty}` : ''}</small><div><button disabled={loading} onClick={() => void rename(item)}>Save title</button><button className="danger" disabled={loading} onClick={() => void remove(item)}>Delete</button></div></article>)}</div>}
            </section>

            <section className="account-control-section deletion-section">
              <div className="account-section-heading"><p>ACCOUNT DELETION</p><h3>Deletion starts after a 14-day grace period</h3><span>You can cancel the request during the grace period. After that, private account data is removed subject to required billing and legal retention.</span></div>
              {deletionJob ? <div className="active-deletion"><strong>Deletion scheduled</strong><p>Status: {deletionJob.status}. Scheduled for {deletionJob.scheduledFor ? new Date(deletionJob.scheduledFor).toLocaleString() : 'the end of the grace period'}.</p><button disabled={loading || deletionJob.status !== 'grace'} onClick={() => void cancelDeletion()}>Cancel account deletion</button></div> : <div className="deletion-approval"><label className="approval-check"><input type="checkbox" checked={deleteApproval} onChange={(event) => setDeleteApproval(event.target.checked)} /><span>I understand that deletion removes the account and its private data after the grace period, subject to required billing and legal retention.</span></label><label>Type DELETE to continue<input value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} autoComplete="off" /></label><button className="danger" disabled={loading || !deleteApproval || deletePhrase !== 'DELETE'} onClick={() => void requestDeletion()}>Schedule account deletion</button></div>}
            </section>
          </section>
        </div>
      )}
    </>
  );
}