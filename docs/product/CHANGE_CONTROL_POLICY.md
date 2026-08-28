# Change Control Policy

Status: product evolution governance

Reviewed: 2026-08-28

This policy governs how changes are made to the Sovereign.OS product to prevent uncontrolled modifications that could compromise safety, privacy, legal compliance, or product integrity.

## Scope

This policy applies to all changes to:
- Production code (apps/, packages/)
- Database schema (migrations/)
- Product language (docs/product-language-system.md)
- Legal documents (Terms, Privacy, policies)
- Security configuration (headers, auth, secrets)
- AI system (prompts, safety rules, model configuration)
- Visual system (typography, production visual authority)
- Release procedure (scripts, verification)

## Change categories

### Category 1 — Routine changes

Low-risk changes that follow established patterns:

| Examples | Review required |
| --- | --- |
| Bug fixes with no behavior change | Self-review + tests pass |
| Copy corrections (non-product-language) | Self-review |
| Dependency updates (patch versions) | `pnpm scan:dependencies` + tests pass |
| Documentation updates (non-policy) | Self-review |
| Test additions | Tests pass |

**Process**: Implement → verify → release through standard procedure.

### Category 2 — Significant changes

Changes that affect user-facing behavior, data handling, or product contracts:

| Examples | Review required |
| --- | --- |
| New API endpoints | Security + privacy review |
| Modified answer contract | AI safety review + test coverage |
| New data collection | Privacy review + policy update |
| Schema migrations | Migration validation + parity check |
| Product language changes | Product language system update |
| Visual system changes | Visual regression review |
| New consent scope | Consent architecture review |

**Process**: Plan → implement → review → verify → release.

### Category 3 — Critical changes

Changes that affect security, legal compliance, AI safety, or core product contracts:

| Examples | Review required |
| --- | --- |
| Authentication changes | Full security review |
| AI model change | Full AI governance review |
| Safety rule changes | Full safety review + regression |
| Policy content changes | Legal review + re-acceptance |
| Payment/billing changes | Full financial review |
| Data deletion changes | Privacy review + deletion inventory |
| Provider changes | Vendor review + DPA assessment |

**Process**: Plan → document impact → review → test extensively → verify → release → monitor.

## Required reviews per change type

### Safety review

Required when:
- Adding or modifying AI prompts
- Changing safety forbidden patterns
- Modifying output validation
- Changing input disposition routing
- Adding new AI capabilities

Checklist:
- [ ] Does the change introduce new forbidden patterns?
- [ ] Does the change weaken existing safety controls?
- [ ] Are uncertainty and limitations preserved?
- [ ] Is the answer contract still enforced?
- [ ] Are Basis refs still authorized?

### Privacy review

Required when:
- Adding new data collection
- Changing data retention
- Modifying consent requirements
- Adding new data flows to providers
- Changing export/deletion behavior

Checklist:
- [ ] Is the data flow documented in the data flow register?
- [ ] Is consent required and enforced?
- [ ] Is retention defined?
- [ ] Is the change compatible with privacy policy?
- [ ] Does the export include new data?
- [ ] Does deletion clean new data?

### Legal review

Required when:
- Changing Terms or Privacy content
- Adding new legal claims
- Modifying eligibility rules
- Changing refund/cancellation policy
- Adding new user-facing legal notices

Checklist:
- [ ] Is the change legally sound?
- [ ] Does it require policy version update?
- [ ] Does it require re-acceptance?
- [ ] Is the content hash updated?
- [ ] Are regulatory implications assessed?

### Technical review

Required when:
- Changing architecture
- Adding new dependencies
- Modifying release procedure
- Changing infrastructure configuration
- Adding new providers

Checklist:
- [ ] Does the change pass all verification?
- [ ] Are migrations validated?
- [ ] Is the bundle size acceptable?
- [ ] Are secrets properly managed?
- [ ] Is the change backward-compatible?
- [ ] Is rollback possible?

### Brand/product review

Required when:
- Changing product language
- Modifying visual system
- Adding new product terminology
- Changing public-facing copy

Checklist:
- [ ] Does the change follow product-language-system.md?
- [ ] Is the self → people → systems order preserved?
- [ ] Are internal terms kept internal?
- [ ] Is the founder hero preserved?
- [ ] Does the visual authority remain intact?

## Product evolution gate

Every new feature or significant change must demonstrate:

| Criterion | Question |
| --- | --- |
| User benefit | Does this serve the user's understanding of themselves? |
| Safety | Does this maintain or strengthen AI safety controls? |
| Privacy | Does this maintain or strengthen privacy protections? |
| Legal | Is this legally compliant in active jurisdictions? |
| Technical | Does this pass all verification gates? |
| Brand | Does this follow the product language system? |
| Consent | Does this respect consent boundaries? |
| Reversibility | Can this be undone if it causes problems? |

## Prohibited changes

The following changes are prohibited without explicit owner authorization:

| Prohibition | Reason |
| --- | --- |
| Removing safety forbidden patterns | Compromises AI safety |
| Weakening consent enforcement | Compromises privacy |
| Removing authentication requirements | Compromises security |
| Changing the founder hero statement | Brand integrity |
| Replacing the visual system with generic styling | Brand integrity |
| Adding analytics/tracking scripts | Privacy commitment |
| Removing deletion capability | Privacy right |
| Adding new data flows without documentation | Privacy compliance |
| Changing the answer contract without review | Product integrity |
| Removing source map exclusion | Security |

## Release gate integration

All changes must pass through the standard release gate:

```bash
pnpm verify:cloudflare-build  # Full repository gate
pnpm production:release:text  # Production release (same SHA)
```

The release gate includes:
- Foundation verification
- Migration validation
- Secret scanning
- Production fixture scanning
- Type checking
- Full test suite
- Build verification
- Worker bundle size check
- Auth/baseline/jobs/gateway/Stripe/product/release-closure smokes

## Source evidence

- `agents.md` — repository operating rules
- `docs/product-language-system.md` — product language authority
- `docs/production-release.md` — release procedure
- `docs/production-ai-safety-boundary.md` — AI safety
- `docs/privacy-model.md` — privacy model
