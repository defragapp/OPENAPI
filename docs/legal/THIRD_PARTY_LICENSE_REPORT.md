# Third-Party License Report

Status: production dependency audit

Reviewed: 2026-08-28

This report inventories all third-party dependencies in the Sovereign.OS production repository and assesses license compatibility. It covers runtime and development dependencies across all workspace packages.

## Dependency inventory

### Root workspace (devDependencies)

| Package | Version | License | Risk |
| --- | --- | --- | --- |
| @playwright/test | ^1.62.1 | Apache-2.0 | Low |
| @types/node | 22.12.0 | MIT | Low |
| playwright | ^1.62.1 | Apache-2.0 | Low |
| tsx | 4.23.1 | MIT | Low |
| typescript | 5.8.3 | Apache-2.0 | Low |
| vitest | 4.1.10 | MIT | Low |

### @sovereign/web (apps/web)

**Runtime dependencies:**

| Package | Version | License | Risk |
| --- | --- | --- | --- |
| @openai/chatkit-react | 1.5.1 | Apache-2.0 | Low |
| react | 19.2.7 | MIT | Low |
| react-dom | 19.2.7 | MIT | Low |

**Development dependencies:**

| Package | Version | License | Risk |
| --- | --- | --- | --- |
| @types/react | 19.2.17 | MIT | Low |
| @types/react-dom | 19.2.3 | MIT | Low |
| @vitejs/plugin-react | 6.0.3 | MIT | Low |
| sharp | 0.35.2 | Apache-2.0 (with ICU, MIT sub-deps) | Low — check ICU license in sub-deps |
| typescript | 5.8.3 | Apache-2.0 | Low |
| vite | 8.1.5 | MIT | Low |
| vitest | 4.1.10 | MIT | Low |

### @sovereign/worker (apps/sovereign-worker)

**Runtime dependencies:**

| Package | Version | License | Risk |
| --- | --- | --- | --- |
| hono | 4.12.31 | MIT | Low |
| zod | 4.4.3 | MIT | Low |
| @sovereign/agent-contracts | workspace:* | Internal | N/A |

**Development dependencies:**

| Package | Version | License | Risk |
| --- | --- | --- | --- |
| typescript | 5.8.3 | Apache-2.0 | Low |
| wrangler | 4.118.0 | MIT/Apache-2.0 | Low |
| vitest | 4.1.10 | MIT | Low |
| @cloudflare/workers-types | 5.20260730.1 | MIT | Low |

### Internal workspace packages

| Package | Type | Risk |
| --- | --- | --- |
| @sovereign/agent-contracts | Internal (workspace:*) | N/A |
| @sovereign/adapter-contracts | Internal (workspace:*) | N/A |
| @sovereign/db | Internal (workspace:*) | N/A |
| @sovereign/domain | Internal (workspace:*) | N/A |
| @sovereign/evals | Internal (workspace:*) | N/A |
| @sovereign/stripe | Internal (workspace:*) | N/A |
| @sovereign/ui | Internal (workspace:*) | N/A |

### Infrastructure providers (not npm dependencies but production-critical)

| Provider | Purpose | Agreement basis |
| --- | --- | --- |
| Cloudflare | Workers, D1, DO, AI Gateway, Turnstile, Assets, DNS | Cloudflare Terms of Service |
| Stripe | Payments, subscriptions, webhooks | Stripe Terms / SSA |
| Resend | Transactional email | Resend Terms |
| Deepgram | TTS (if active) | Deepgram Terms |
| NASA/JPL Horizons | Astronomical computation | Public API; NASA Terms of Use |

## License summary

| License | Count | Compatibility |
| --- | --- | --- |
| MIT | Majority of dependencies | Fully compatible with proprietary distribution |
| Apache-2.0 | TypeScript, Playwright, Vite sub-deps, sharp, ChatKit | Compatible; requires notice preservation |
| BSD (various) | Possible transitive deps | Compatible; requires notice preservation |
| ISC | Possible transitive deps | Compatible |

## Risk assessment

### Low risk (all current dependencies)

All direct dependencies use permissive open-source licenses (MIT, Apache-2.0). These licenses:
- Permit commercial use
- Permit distribution in proprietary products
- Require license/copyright notice preservation
- Do not require source code disclosure of the consuming work

### Compliance obligations

| Obligation | Action |
| --- | --- |
| Preserve license notices | Do not strip license headers from dependency source; bundled builds retain notices |
| Apache-2.0 NOTICE files | Check for NOTICE files in Apache-2.0 dependencies and include them in distribution |
| sharp ICU sub-dependency | Verify ICU license is permissive (it is — Unicode License, which is MIT-like) |

### Dependency overrides (pnpm overrides in root package.json)

| Override | From | To | Reason |
| --- | --- | --- | --- |
| undici | 7.28.0 | 7.29.0 | Security/stability fix |
| fast-uri | 3.1.4 | 3.1.5 | Security/stability fix |
| ip-address | 10.2.0 | 10.3.1 | Security/stability fix |
| nanoid | 3.3.16 | 3.3.18 | Security/stability fix |

These overrides demonstrate active dependency hygiene. The `pnpm scan:dependencies` script (`pnpm audit --audit-level=high`) runs as part of the production release gate.

### No copyleft risk

No GPL, AGPL, LGPL, MPL, or EUPL licensed dependencies are present in the direct dependency tree. This means:
- No obligation to release Sovereign.OS source code
- No obligation to license under copyleft terms
- No viral license exposure

## Monitoring

| Practice | Implementation |
| --- | --- |
| Dependency audit | `pnpm scan:dependencies` (pnpm audit --audit-level=high) |
| Secret scanning | `pnpm scan:secrets` on every release |
| Override management | pnpm overrides in root package.json for security patches |
| Release gate | `pnpm verify:cloudflare-build` runs before production deployment |

## Gaps

| Gap | Risk | Recommendation |
| --- | --- | --- |
| No automated license checker | Unknown transitive dependency could introduce incompatible license | Add license checker (e.g., license-checker, license-report) to CI |
| No SBOM generation | No Software Bill of Materials for regulatory review | Generate SBOM from pnpm lockfile for vendor/audit packages |
| Transitive dependency depth | Full transitive tree not audited in this report | Run `pnpm licenses list` for complete transitive license inventory |

## Source evidence

- `package.json` — root dependencies and overrides
- `apps/web/package.json` — web dependencies
- `apps/sovereign-worker/package.json` — worker dependencies
- `pnpm-lock.yaml` — full transitive dependency tree
- `pnpm scan:dependencies` — automated audit script
