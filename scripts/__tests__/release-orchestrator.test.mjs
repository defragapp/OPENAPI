import { describe, expect, it, vi } from 'vitest';
import { configureCloudflareDmarc } from '../configure-cloudflare-dmarc.mjs';
import { orchestrateRelease } from '../release-orchestrator.mjs';

const sha = 'c'.repeat(40);

function releaseReadyControls() {
  return {
    d1: { readReplication: 'auto' },
    gateway: { management: 'verified', collectLogs: false },
    rateLimit: { management: 'verified' },
    schema: { management: 'verified' }
  };
}

function harness({
  preFailure = false,
  dmarcFailure = false,
  migrationFailure = false,
  controlFailure = false,
  externallyManagedControls = false,
  deployFailure = false,
  postFailure = false,
  evidenceFailure = false
} = {}) {
  const state = { evidenceB64: null, progressB64: null };
  const runWrangler = vi.fn((args) => {
    if (args[0] === 'd1' && args[1] === 'migrations') {
      return migrationFailure ? { status: 1, stderr: 'migration failed' } : { status: 0, stdout: 'applied' };
    }
    if (args[0] === 'deploy') {
      return deployFailure ? { status: 1, stderr: 'deploy failed' } : { status: 0, stdout: 'deployed' };
    }
    return { status: 0, stdout: '[]' };
  });
  const runNode = vi.fn((path) => {
    if (preFailure && path.includes('pre-check')) return { status: 1, stderr: 'pre failed' };
    if (postFailure && path.includes('post-check')) return { status: 1, stderr: 'post failed' };
    return { status: 0, stdout: 'ok' };
  });
  const d1Execute = vi.fn(({ sql }) => {
    if (sql.includes('INSERT INTO release_evidence')) {
      if (evidenceFailure) return { status: 1, stderr: 'evidence write failed' };
      state.evidenceB64 = sql.match(/'([A-Za-z0-9+/]+={0,2})', 'success'/)?.[1] || null;
      return { status: 0, stdout: '[{"results":[]}]' };
    }
    if (sql.includes('SELECT evidence_b64')) {
      return { status: 0, stdout: JSON.stringify([{ results: state.evidenceB64 ? [{ evidence_b64: state.evidenceB64 }] : [] }]) };
    }
    if (sql.includes('INSERT INTO release_progress')) {
      state.progressB64 = sql.match(/'([A-Za-z0-9+/]+={0,2})', datetime\('now'\)/)?.[1] || null;
      return { status: 0, stdout: '[{"results":[]}]' };
    }
    if (sql.includes('SELECT summary_b64')) {
      return { status: 0, stdout: JSON.stringify([{ results: state.progressB64 ? [{ summary_b64: state.progressB64 }] : [] }]) };
    }
    return { status: 0, stdout: '[{"results":[]}]' };
  });
  const fetchImpl = vi.fn(async (url, init) => {
    const isWorkerPost = init?.method === 'POST' && String(url).includes('/internal/release-evidence');
    if (isWorkerPost) {
      if (evidenceFailure) return Response.json({ ok: false, error: 'evidence write failed' }, { status: 500 });
      const body = JSON.parse(init.body || '{}');
      if (body.sha === sha && body.evidence_b64) {
        state.evidenceB64 = body.evidence_b64;
      }
      return Response.json({ ok: true });
    }
    const evidence = state.evidenceB64
      ? JSON.parse(Buffer.from(state.evidenceB64, 'base64').toString('utf8'))
      : null;
    return Response.json({
      ok: true,
      ready: true,
      version: sha,
      migrationVersion: '0018_workers_ai_capacity_reservations',
      latestMigrationVersion: '0018_workers_ai_capacity_reservations',
      dependencies: {
        migrationParity: 'current',
        policyAcceptanceReceipts: 'configured',
        privacyAccessControls: 'configured'
      },
      releaseEvidence: evidence
    });
  });
  return {
    state,
    runWrangler,
    runNode,
    d1Execute,
    fetchImpl,
    options: {
      sha,
      runWrangler,
      runNode,
      d1Execute,
      fetchImpl,
      releaseSecret: 'test-release-secret',
      preDeployChecks: [{ label: 'pre', path: 'pre-check.mjs' }],
      postDeployChecks: [{ label: 'post', path: 'post-check.mjs' }],
      prepareConfig: async () => ({
        generatedConfigPath: '/tmp/sovereign-release-test.jsonc',
        databaseId: 'database-id',
        databaseName: 'sovereign-openapi-db'
      }),
      cleanupConfig: vi.fn(),
      deployOptions: {
        ensureSecrets: async () => ({ configured: [] }),
        configureControls: async () => {
          if (controlFailure) {
            return {
              ...releaseReadyControls(),
              rateLimit: {
                management: 'unavailable',
                status: 500,
                reason: 'unexpected zone control failure'
              }
            };
          }
          if (externallyManagedControls) {
            return {
              ...releaseReadyControls(),
              rateLimit: {
                management: 'unavailable',
                status: 403,
                reason: 'WAF rate limiting reconciliation requires zone-level management permission'
              },
              schema: {
                management: 'unavailable',
                status: 403,
                reason: 'API Shield reconciliation requires zone-level management permission'
              }
            };
          }
          return releaseReadyControls();
        }
      },
      reconcileDmarc: async () => dmarcFailure
        ? ({ verified: false, output: 'DNS verification failed' })
        : ({ verified: true, output: 'verified' }),
      evidenceAttempts: 1,
      evidenceDelayMs: 0,
      browserRunRetryDelayMs: 0,
      ...(migrationFailure ? { applyMigrations: () => ({ status: 1, stderr: 'migration failed' }) } : {})
    }
  };
}

function deployCalls(runWrangler) {
  return runWrangler.mock.calls.filter(([args]) => args[0] === 'deploy').length;
}

describe('single-deploy release orchestrator', () => {
  it('pre-deploy failure performs zero deployments', async () => {
    const test = harness({ preFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('pre-deploy-failed');
    expect(result.deploys).toBe(0);
    expect(deployCalls(test.runWrangler)).toBe(0);
  });

  it('DMARC failure is a preflight blocker and performs zero deployments', async () => {
    const test = harness({ dmarcFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('dmarc-preflight-failed');
    expect(result.deploys).toBe(0);
    expect(deployCalls(test.runWrangler)).toBe(0);
    expect(test.d1Execute).not.toHaveBeenCalled();
  });

  it('migration failure performs zero deployments and no progress write', async () => {
    if (String(process.env.SKIP_D1_MIGRATIONS || '').trim() === 'true') return;
    const test = harness({ migrationFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('migration-failed');
    expect(result.deploys).toBe(0);
    expect(deployCalls(test.runWrangler)).toBe(0);
    expect(test.d1Execute).not.toHaveBeenCalled();
  });

  it('non-permission Cloudflare control failures block before any deploy', async () => {
    const test = harness({ controlFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('deploy-failed');
    expect(result.deploys).toBe(0);
    expect(deployCalls(test.runWrangler)).toBe(0);
    expect(result.output).toContain('unexpected zone control failure');
  });

  it('OAuth 403 zone controls remain externally managed and do not block deploy', async () => {
    const test = harness({ externallyManagedControls: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('success');
    expect(result.deploys).toBe(1);
    expect(deployCalls(test.runWrangler)).toBe(1);
  });

  it('successful release performs exactly one deploy and converges full evidence', async () => {
    const test = harness();
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('success');
    expect(result.deploys).toBe(1);
    expect(deployCalls(test.runWrangler)).toBe(1);
    expect(result.evidence.releaseEvidence.sha).toBe(sha);
    expect(result.evidence.releaseEvidence.routeCohesionVerified).toBe(false);
    expect(result.evidence.releaseEvidence.renderedVisualVerified).toBe(false);
    expect(test.fetchImpl).toHaveBeenCalledTimes(5);
  });

  it('marks browser evidence true only when the matching post-deploy checks complete', async () => {
    const test = harness();
    test.options.postDeployChecks = [
      { label: 'verify-runtime-v3', path: 'runtime.mjs' },
      { label: 'verify-secondary-public', path: 'secondary.mjs' },
      { label: 'verify-route-cohesion', path: 'route.mjs', browserRun: true },
      { label: 'verify-rendered-visuals', path: 'visual.mjs', browserRun: true }
    ];
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('success');
    expect(result.verification).toEqual({ routeCohesionVerified: true, renderedVisualVerified: true });
    expect(result.evidence.releaseEvidence.routeCohesionVerified).toBe(true);
    expect(result.evidence.releaseEvidence.renderedVisualVerified).toBe(true);
  });

  it('post-deploy failure performs one deploy and persists failure progress', async () => {
    const test = harness({ postFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('post-deploy-failed');
    expect(result.deploys).toBe(1);
    expect(result.progress.persisted).toBe(true);
  });

  it('evidence-writing failure performs one deploy, persists progress, and never redeploys', async () => {
    const test = harness({ evidenceFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('evidence-failed');
    expect(result.deploys).toBe(1);
    expect(deployCalls(test.runWrangler)).toBe(1);
    expect(result.progress.persisted).toBe(true);
  });

  it('failed wrangler deploy is counted as one invocation', async () => {
    const test = harness({ deployFailure: true });
    const result = await orchestrateRelease(test.options);
    expect(result.status).toBe('deploy-failed');
    expect(result.deploys).toBe(1);
    expect(deployCalls(test.runWrangler)).toBe(1);
  });
});

describe('DMARC release preflight', () => {
  it('verifies the exact publicly served TXT record without authenticated zone access', async () => {
    const fetchImpl = vi.fn(async () => Response.json({
      Status: 0,
      Answer: [{
        name: '_dmarc.defrag.app.',
        type: 16,
        TTL: 3600,
        data: '"v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100"'
      }]
    }));

    await expect(configureCloudflareDmarc({ fetchImpl })).resolves.toMatchObject({
      recordName: '_dmarc.defrag.app',
      content: 'v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100',
      operation: 'verified-public-dns'
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0][0]).toContain('cloudflare-dns.com/dns-query');
    expect(fetchImpl.mock.calls[0][1].headers).toEqual({ accept: 'application/dns-json' });
  });

  it('fails closed when the public DMARC value differs', async () => {
    const fetchImpl = vi.fn(async () => Response.json({
      Status: 0,
      Answer: [{ name: '_dmarc.defrag.app.', type: 16, TTL: 300, data: '"v=DMARC1; p=reject"' }]
    }));

    await expect(configureCloudflareDmarc({ fetchImpl })).rejects.toThrow(
      'Public DNS must serve exactly one verified _dmarc.defrag.app TXT record'
    );
  });

  it('fails closed when public DNS serves duplicate DMARC records', async () => {
    const data = '"v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100"';
    const fetchImpl = vi.fn(async () => Response.json({
      Status: 0,
      Answer: [
        { name: '_dmarc.defrag.app.', type: 16, TTL: 300, data },
        { name: '_dmarc.defrag.app.', type: 16, TTL: 300, data }
      ]
    }));

    await expect(configureCloudflareDmarc({ fetchImpl })).rejects.toThrow(
      'Public DNS must serve exactly one verified _dmarc.defrag.app TXT record'
    );
  });
});
