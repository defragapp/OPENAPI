# Trade Secret Policy

Status: trade secret protection policy

Reviewed: 2026-08-28

This policy establishes trade secret protection for Sovereign.OS proprietary information.

## Scope

This policy covers all proprietary information that derives independent economic value from not being generally known and is subject to reasonable efforts to maintain its secrecy.

## Protected trade secrets

### 1. Algorithms and computation

| Trade secret | Description | Protection |
| --- | --- | --- |
| Baseline computation engine | Astronomical calculation → facet profile reduction pipeline | Private repository; hashed storage; model-safe reduction |
| Facet profile derivation | How raw birth data becomes model-safe context | Private repository; not disclosed in documentation |
| Current conditions computation | How astronomical data maps to interpretive conditions | Private repository; provider abstraction |
| Alignment computation | Structured comparison methodology | Private repository; not a score or gauge |

### 2. AI system architecture

| Trade secret | Description | Protection |
| --- | --- | --- |
| System prompt construction | How Baseline context, relationship context, and instructions are assembled | Private repository; not disclosed |
| sovereign-answer.v2 contract | Exact schema enforcement, section requirements, mode-specific rules | Private repository; observable in output but not implementation |
| Safety forbidden patterns | Complete list and auto-rewrite rules | Private repository; observable in behavior but not exact implementation |
| Input disposition routing | How questions are classified (standard/grounded/urgent/secure_refusal) | Private repository |
| Model-safe context reduction | Exact rules for what enters/exits model context | Documented at high level; exact rules proprietary |

### 3. Data architecture

| Trade secret | Description | Protection |
| --- | --- | --- |
| D1 schema design | 18 migrations of proprietary schema | Private repository |
| Consent enforcement architecture | Server-side consent gates, namespace-prefixed basis refs | Private repository |
| Namespace-prefixed data isolation | How participant data is prevented from merging | Private repository |
| Retention and cleanup system | Scheduled deletion logic and retention windows | Private repository |

### 4. Business logic

| Trade secret | Description | Protection |
| --- | --- | --- |
| Turn economics | Free/Plus allocation, capacity ledger, reservation system | Partially observable; exact implementation proprietary |
| Entitlement projection | How Stripe events map to product features | Private repository |
| Policy acceptance system | Canonical hash, version tuple, stale-client rejection | Private repository |

## Protection measures

### Technical measures

| Measure | Implementation |
| --- | --- |
| Private repository | GitHub private repository; access controlled |
| Authentication required | All proprietary logic behind authenticated API |
| No source maps | Production builds exclude source maps |
| Server-side only | All proprietary computation runs server-side |
| No client exposure | Trade secrets never sent to browser or model |
| Secret scanning | `pnpm scan:secrets` on every release |

### Organizational measures

| Measure | Implementation |
| --- | --- |
| Access control | Repository access limited to owner |
| No public disclosure | Trade secrets not in documentation, blog posts, or public talks |
| NDA coverage | Contractor/collaborator NDAs (external) |
| IP assignment | Founder IP assignment agreements (external) |

### Legal measures

| Measure | Implementation |
| --- | --- |
| Terms of Service | Prohibit reverse engineering, scraping, competitive use |
| Copyright | Source code copyrighted automatically |
| Trade secret marking | This document identifies trade secrets |

## Trade secret identification procedure

Before disclosing any Sovereign.OS information externally, evaluate:

1. **Is it generally known?** — If not, it may be a trade secret
2. **Does it have economic value from secrecy?** — If competitors would benefit, yes
3. **Are reasonable efforts taken to keep it secret?** — Check technical/organizational measures
4. **Is it marked as proprietary?** — Check this register

When in doubt, treat information as a trade secret and consult with the repository owner before disclosure.

## Incident response for trade secret exposure

If a trade secret is potentially exposed:

1. Assess scope of exposure
2. Determine if exposure was authorized
3. If unauthorized: contain (remove access, request takedown)
4. Document the incident
5. Evaluate legal remedies
6. Update protection measures

## Exclusions

The following are NOT trade secrets:
- Public product language (documented in `docs/product-language-system.md`)
- Public API contracts (observable from product use)
- Open-source dependencies (governed by their own licenses)
- Published documentation (this document, SECURITY.md, etc.)
- Observable product behavior (what users can see)

## Source evidence

- Repository access controls (GitHub private)
- `apps/sovereign-worker/src/` — proprietary implementation
- `docs/privacy-model.md` — high-level model (not exact rules)
- `docs/production-ai-safety-boundary.md` — high-level safety (not exact patterns)
- `SECURITY.md` — security policy
