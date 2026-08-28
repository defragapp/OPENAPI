# IP Asset Register

Status: comprehensive intellectual property asset inventory

Reviewed: 2026-08-28

This register catalogs all intellectual property assets owned by Sovereign.OS for protection and management purposes. It extends `docs/legal/IP_PROTECTION_REGISTER.md` with registration tracking.

## Copyright assets

### Software

| Asset | Location | Creation date | Registration status |
| --- | --- | --- | --- |
| Full application source code | `apps/`, `packages/` | 2024–2026 | Unregistered (automatic copyright) |
| Baseline computation engine | `apps/sovereign-worker/src/baseline-engine.ts` | 2025 | Unregistered |
| Sovereign answer contract | `apps/sovereign-worker/src/agent/recognition.ts` | 2025 | Unregistered |
| Safety layer | `apps/sovereign-worker/src/agent/safety.ts` | 2025 | Unregistered |
| Relational consent system | `apps/sovereign-worker/src/relational-context.ts`, `db/people.ts` | 2025 | Unregistered |
| D1 migration history | `apps/sovereign-worker/migrations/` (0001–0018) | 2025–2026 | Unregistered |
| Release orchestrator | `scripts/cloudflare-production-text-release.mjs` | 2025–2026 | Unregistered |
| Verification suite | `scripts/verify-*.mjs` | 2025–2026 | Unregistered |
| Auth system | `apps/sovereign-worker/src/auth-public.ts`, `security/auth.ts` | 2025 | Unregistered |
| Billing integration | `apps/sovereign-worker/src/billing/stripe.ts` | 2025 | Unregistered |
| Privacy system | `apps/sovereign-worker/src/privacy-rights.ts`, `jobs.ts` | 2025–2026 | Unregistered |

### Visual assets

| Asset | Location | Registration status |
| --- | --- | --- |
| Typography system | `apps/web/src/typography-system.css` | Unregistered |
| Production visual authority | `apps/web/src/production-visual-authority-v1.css` | Unregistered |
| Sans typography authority | `apps/web/src/sans-typography-authority-v1.css` | Unregistered |
| Premium action styles | `apps/web/src/premium-action-static-v1.css` | Unregistered |
| Brand mark (SVG) | `apps/web/src/BrandMark.tsx` | Unregistered |
| Landing page design | `apps/web/src/PublicLanding.tsx` | Unregistered |
| Icon system | Various SVG components | Unregistered |
| Geist Sans font (self-hosted) | `apps/web/public/fonts/geist/` | Licensed (Vercel, SIL OFL) |

### Documentation

| Asset | Location | Registration status |
| --- | --- | --- |
| Product language system | `docs/product-language-system.md` | Unregistered |
| Privacy model | `docs/privacy-model.md` | Unregistered |
| Data flow register | `docs/privacy-data-flow-register.md` | Unregistered |
| AI safety boundary | `docs/production-ai-safety-boundary.md` | Unregistered |
| SOC 2 readiness controls | `docs/security/soc2-readiness-controls.md` | Unregistered |
| Production release procedure | `docs/production-release.md` | Unregistered |
| v0 visual port contract | `docs/v0-visual-port-contract.md` | Unregistered |
| All legal/company documents | `docs/legal/`, `docs/operations/`, etc. | Unregistered |

## Trademark assets

| Asset | Type | Registration status | Filing priority |
| --- | --- | --- | --- |
| Sovereign.OS | Product name | Unregistered; common law rights | Tier 1 — file immediately |
| Sovereign.OS logo | Design mark | Unregistered | Tier 1 — when finalized |
| Baseline Design | Product concept | Unregistered | Tier 2 — within 6 months |
| Sovereign Intelligence | Feature name | Unregistered | Tier 2 — within 6 months |
| Expression Field | Product object | Unregistered | Tier 3 — monitor |
| Alignment | Reasoning lens | Unregistered | Tier 3 — monitor |
| Covenant | Reasoning lens | Unregistered | Tier 3 — monitor |

See `docs/legal/TRADEMARK_STRATEGY.md` for filing plan.

## Trade secret assets

| Asset | Protection level | Source |
| --- | --- | --- |
| Baseline computation algorithms | High — private repo, server-side only | `docs/security/TRADE_SECRET_POLICY.md` |
| System prompt construction | High — private repo, server-side only | Same |
| Safety forbidden pattern list | Medium — observable in behavior, not exact rules | Same |
| Input disposition routing | High — private repo | Same |
| Model-safe context reduction rules | High — private repo | Same |
| D1 schema design | Medium — observable from API, design proprietary | Same |
| Consent enforcement architecture | Medium — observable from behavior | Same |

## Patent considerations

| Asset | Patent eligibility | Recommendation |
| --- | --- | --- |
| Baseline computation method | Potentially patentable (unique astronomical → interpretive pipeline) | Evaluate with patent counsel |
| Consent-gated relationship intelligence | Potentially patentable (novel consent architecture) | Evaluate with patent counsel |
| sovereign-answer.v2 contract | Potentially patentable (structured AI output enforcement) | Evaluate with patent counsel |
| Safety forbidden pattern system | Potentially patentable (AI output governance) | Evaluate with patent counsel |

**Note**: Patent applications must be filed within 1 year of public disclosure in the US. Evaluate before any public presentation of novel methods.

## Domain assets

| Domain | Registrar | Status | Renewal |
| --- | --- | --- | --- |
| defrag.app | Cloudflare | Active | Annual |
| sovereign.defrag.app | Cloudflare (subdomain) | Active | N/A |
| app.defrag.app | Cloudflare (subdomain) | Active | N/A |

**Recommended additions**: sovereign-os.com, sovereignos.com, sovereignos.ai

## License compliance

| Component | License | Obligation | Status |
| --- | --- | --- | --- |
| React | MIT | Preserve notice | Compliant |
| Hono | MIT | Preserve notice | Compliant |
| Zod | MIT | Preserve notice | Compliant |
| Vite | MIT | Preserve notice | Compliant |
| TypeScript | Apache-2.0 | Preserve notice + NOTICE file | Compliant |
| Playwright | Apache-2.0 | Preserve notice + NOTICE file | Compliant |
| sharp | Apache-2.0 | Preserve notice; check ICU sub-dep | Compliant |
| Geist Sans | SIL OFL | Free use and distribution | Compliant |

See `docs/legal/THIRD_PARTY_LICENSE_REPORT.md` for full inventory.

## IP protection checklist

| Action | Status | Priority |
| --- | --- | --- |
| Maintain private repository | DONE | Critical |
| Execute founder IP assignment | EXTERNAL | Critical |
| File trademark for Sovereign.OS | NOT STARTED | High |
| Register copyright for key code | NOT STARTED | Medium |
| Conduct patent evaluation | NOT STARTED | Medium |
| Register defensive domains | NOT STARTED | High |
| Implement trade secret markings | DONE (this document set) | Medium |
| Add license checker to CI | NOT STARTED | Low |
| Generate SBOM | NOT STARTED | Low |

## Source evidence

- Repository structure: `apps/`, `packages/`, `scripts/`, `docs/`
- `docs/legal/IP_PROTECTION_REGISTER.md` — original IP inventory
- `docs/legal/TRADEMARK_STRATEGY.md` — trademark filing plan
- `docs/security/TRADE_SECRET_POLICY.md` — trade secret identification
- `docs/legal/THIRD_PARTY_LICENSE_REPORT.md` — license compliance
