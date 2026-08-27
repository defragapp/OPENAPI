import { useEffect, useState } from 'react';

type Json = Record<string, any>;

type DeletionJob = {
  id: string;
  status: string;
  scheduledFor?: string;
};

export function PolicyGateAccountRights() {
  const [deletionJob, setDeletionJob] = useState<DeletionJob | null>(null);
  const [deleteApproval, setDeleteApproval] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    'Your account controls remain available while this review is required.'
  );

  async function requestJson(
    path: string,
    init: RequestInit = {},
    failureMessage = 'That account action could not be completed.'
  ): Promise<Json> {
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = new Headers(init.headers);

    headers.set('accept', 'application/json');

    if (method !== 'GET' && method !== 'HEAD') {
      headers.set('x-idempotency-key', crypto.randomUUID());
    }

    if (init.body != null && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
      headers
    });

    if (response.status === 401) {
      location.assign(
        `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`
      );
      throw new Error('Sign-in required.');
    }

    if (!response.ok) {
      const retryAfter = Number(response.headers.get('retry-after') ?? 0);
      throw new Error(
        response.status === 429 && retryAfter > 0
          ? `Try again in ${retryAfter} seconds.`
          : failureMessage
      );
    }

    if (!response.headers.get('content-type')?.includes('application/json')) {
      return {};
    }

    return await response.json().catch(() => ({})) as Json;
  }

  async function refreshDeletion() {
    try {
      const body = await requestJson(
        '/api/v1/deletion-jobs',
        {},
        'Account deletion status is temporarily unavailable.'
      );
      setDeletionJob(body.deletionJob ?? null);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Account deletion status is temporarily unavailable.'
      );
    }
  }

  useEffect(() => {
    void refreshDeletion();
  }, []);

  async function downloadPrivateExport() {
    if (loading) return;

    setLoading(true);
    setStatus('Preparing your private account download…');

    try {
      const response = await fetch('/api/v1/account/export', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'x-idempotency-key': crypto.randomUUID()
        }
      });

      if (response.status === 401) {
        location.assign(
          `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`
        );
        return;
      }

      if (!response.ok) {
        throw new Error('Your account download could not be generated.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'sovereign-account-export.json';

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 0);

      setStatus(
        'Private account download complete. Sovereign did not retain an export copy.'
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Your account download could not be generated.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function openBilling() {
    if (loading) return;

    setLoading(true);
    setStatus('Opening secure billing controls…');

    try {
      const body = await requestJson(
        '/api/v1/billing/portal',
        {
          method: 'POST',
          body: '{}'
        },
        'Billing controls are temporarily unavailable.'
      );

      if (typeof body.portal?.url !== 'string') {
        throw new Error('Billing controls are temporarily unavailable.');
      }

      location.assign(body.portal.url);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Billing controls are temporarily unavailable.'
      );
      setLoading(false);
    }
  }

  async function signOut(allSessions: boolean) {
    if (loading) return;

    setLoading(true);
    setStatus(allSessions ? 'Signing out all sessions…' : 'Signing out…');

    try {
      await requestJson(
        allSessions ? '/api/v1/auth/logout-all' : '/api/v1/auth/logout',
        { method: 'POST' },
        'Sign out could not be completed.'
      );

      setStatus(allSessions ? 'All sessions signed out.' : 'Signed out.');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Sign out could not be completed.'
      );
      setLoading(false);
    }
  }

  async function requestDeletion() {
    if (
      !deleteApproval ||
      deletePhrase !== 'DELETE' ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setStatus('Scheduling account deletion…');

    try {
      const body = await requestJson(
        '/api/v1/deletion-jobs',
        {
          method: 'POST',
          body: JSON.stringify({ approved: true })
        },
        'Account deletion could not be scheduled.'
      );

      setDeletionJob(body.deletionJob ?? null);
      setDeleteApproval(false);
      setDeletePhrase('');
      setStatus(
        'Deletion scheduled. You can cancel during the 14-day grace period.'
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Account deletion could not be scheduled.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function cancelDeletion() {
    if (!deletionJob || loading) return;

    setLoading(true);
    setStatus('Cancelling account deletion…');

    try {
      await requestJson(
        `/api/v1/deletion-jobs/${encodeURIComponent(deletionJob.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ action: 'cancel' })
        },
        'Account deletion could not be cancelled.'
      );

      setDeletionJob(null);
      setStatus('Account deletion cancelled.');
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Account deletion could not be cancelled.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside
      className="policy-gate-account-rights"
      aria-labelledby="policy-gate-rights-title"
    >
      <div className="policy-gate-rights-heading">
        <span>YOUR ACCOUNT</span>
        <h2 id="policy-gate-rights-title">
          Your account stays in your control.
        </h2>
        <p>
          Updated policies pause private intelligence, not your ability to
          download your data, manage billing, sign out, or manage account
          deletion.
        </p>
      </div>

      <p
        className="policy-gate-rights-status"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>

      <div
        className="policy-gate-rights-actions"
        aria-label="Available account controls"
      >
        <button
          type="button"
          disabled={loading}
          onClick={() => void downloadPrivateExport()}
        >
          Download my data
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => void openBilling()}
        >
          Manage billing
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => void signOut(false)}
        >
          Sign out
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => void signOut(true)}
        >
          Sign out all sessions
        </button>

        <a href="https://sovereign.defrag.app/privacy">
          Privacy
        </a>

        <a href="mailto:info@sovereign.defrag.app">
          Contact support
        </a>
      </div>

      <details className="policy-gate-deletion">
        <summary>Account deletion</summary>

        {deletionJob ? (
          <div className="policy-gate-deletion-body">
            <strong>Deletion scheduled</strong>

            <p>
              Status: {deletionJob.status}. Scheduled for{' '}
              {deletionJob.scheduledFor
                ? new Date(deletionJob.scheduledFor).toLocaleString()
                : 'the end of the 14-day grace period'}.
            </p>

            <button
              type="button"
              disabled={loading || deletionJob.status !== 'grace'}
              onClick={() => void cancelDeletion()}
            >
              Cancel account deletion
            </button>
          </div>
        ) : (
          <div className="policy-gate-deletion-body">
            <p>
              Scheduling deletion starts a 14-day grace period. You can cancel
              during that period.
            </p>

            <label className="approval-check">
              <input
                type="checkbox"
                checked={deleteApproval}
                onChange={(event) => setDeleteApproval(event.target.checked)}
              />

              <span>
                I understand that deletion removes my account and private data
                after the grace period, subject to required billing and legal
                retention.
              </span>
            </label>

            <label className="policy-gate-delete-confirmation">
              <span>Type DELETE to continue</span>

              <input
                value={deletePhrase}
                onChange={(event) => setDeletePhrase(event.target.value)}
                autoComplete="off"
              />
            </label>

            <button
              type="button"
              className="policy-gate-danger"
              disabled={
                loading ||
                !deleteApproval ||
                deletePhrase !== 'DELETE'
              }
              onClick={() => void requestDeletion()}
            >
              Schedule account deletion
            </button>
          </div>
        )}
      </details>
    </aside>
  );
}
