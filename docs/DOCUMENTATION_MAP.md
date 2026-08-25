# Sovereign.OS Documentation Map

This map organizes the existing documentation to provide a clear source of truth for the Sovereign.OS platform.

## 1. System
Documentation covering architecture, deployment topology, Workers, D1/Durable Objects, dependencies, environments, and ownership.
- **[Production Architecture](architecture.md)** — Canonical runtime architecture, covering TypeScript/pnpm monorepo structure, Cloudflare Workers (`sovv-web`), D1 (`sovereign-openapi-db`), and repository ownership.
- **[Namespace Authority](release/NAMESPACE_AUTHORITY.md)** — Defines product brand and verified controlled web domains (e.g., `sovereign.defrag.app`).
- **[Cloudflare Free-Tier Hardening](cloudflare-free-tier-hardening.md)** — Current production infrastructure guidance and repository facts.
- **[Preview Deployment](preview-deployment.md)** — Protected Cloudflare preview guidance for isolated review.
- **[Direct Cloudflare Preview](direct-cloudflare-preview.md)** — Isolated preview guidance for isolated review without deploying to production.
- **Historical References**:
  - [Historical Cloudflare Workers Builds production wiring](cloudflare-workers-builds-production.md)

## 2. Intelligence
Documentation covering Baseline, data flows, current conditions, relationship/system intelligence, evidence provenance, safety boundaries, and the core answer contract.
- **[Intelligence and Answer Contract](inner-recognition-intelligence.md)** — Defines the canonical Baseline information model, answer contract, Basis validation, relationship/system context, and Covenant behavior.
- **[Production AI Safety Boundary](production-ai-safety-boundary.md)** — Current safety/runtime boundary defining the product's non-clinical, private nature and server-owned authority.
- **[Privacy Model](privacy-model.md)** — The privacy and consent model establishing private context as a product boundary.
- **[Privacy Data-Flow and Provider Register](privacy-data-flow-register.md)** — Operational inventory of data flows and providers in the production repository.
- **[Baseline Question Universe](baseline-question-universe-and-demonstration-strategy.md)** — Product reference mapping the Baseline universe to the product.
- **[Tool Contracts](tool-contracts.md)** — Rules for tools to provide authorized evidence and facts without creating a second interpretation layer.

## 3. Backend
Documentation covering actual API/routes, authentication, authorization, data model, request/AI flows, and testing.
- **[API & Backend Contract](API_BACKEND_CONTRACT.md)** — Concrete mapping of Backend APIs, Request Flow, and Data Model Schemas.
- **[Launch Surface](launch-surface.md)** — Current route, access, plan, and launch-acceptance boundaries.
- **[AI Integration Notes](openai-integration.md)** — Details the production inference path via Cloudflare Workers AI and AI Gateway.
- **[Current-condition computation port](current-conditions-port.md)** — Implementation provenance for the current-condition layer.
- **[Secret Scanning Patterns](secret-scanning-patterns.md)** — Custom patterns for GitHub Advanced Security Secret Scanning.

## 4. Operations
Documentation covering deployment, release authority, readiness, rollback, migrations, failure handling, capacity, and scaling.
- **[Production Release Procedure](production-release.md)** — Canonical production release authority and sequence.
- **[Release Gates](release-gates.md)** — Current launch acceptance checklist and gates.
- **[Preview and Production Preparation](release-prep.md)** — Resource inventory and preparation guidance for releases.
- **[Launch Saturation and Rollback Runbook](launch-saturation-runbook.md)** — Runbook for controlled canary validation.
- **Historical References**:
  - [Historical production redeploy request (2026-07-26)](production-redeploy-2026-07-26.md)
  - [Historical production-safe convergence checkpoint](production-safe-convergence-rollback.md)

## 5. Governance
Documentation covering major architectural decisions, separating current from historical context, and security.
- **[Repository Operating Rules](../AGENTS.md)** — Canonical operating rules for the `defragapp/OPENAPI` repository.
- **[Security Policy](../SECURITY.md)** — Security policies and vulnerability reporting.
- **[SOC 2 Readiness Controls](security/soc2-readiness-controls.md)** — Readiness evidence and controls.
- **[Security Incident Response Runbook](security/incident-response-runbook.md)** — Current incident-response engineering runbook.
- **[Credential Management and Rotation Runbook](security/credential-rotation-runbook.md)** — Credential-replacement engineering procedure.
- **Historical References**:
  - [Historical SOVV adapter map](sovv-adapter-map.md)
  - [Historical validation checklist - ee4a937](release-fix-ee4a937-validation.md)
  - [Historical release integrity correction - ee4a937](release-fix-ee4a937.md)

## 6. Investor/Product Context
Documentation covering product positioning, founder contracts, launch contracts, and visual authority.
- **[Launch Product Contract](launch-product-contract.md)** — Canonical implementation and approval boundary for the launch product.
- **[Product Language System](product-language-system.md)** — Guide for public pages, authentication, onboarding, and AI answers.
- **[Founder v0 Visual-Port Contract](v0-visual-port-contract.md)** — Component and visual authority for the public landing and platform visual language.
- **[Product Positioning Companion](product-positioning-canonical.md)** — Supporting positioning reference for categorizing the product.
- **[Landing Visual Redesign](landing-visual-redesign.md)** — Supporting visual summary mapping to the founder visual contract.
- **Historical References**:
  - [Historical Landing experience audit](landing-experience-audit.md)
  - [Historical browser visual release audit](browser-visual-release-audit.md)
  - [Future Worlds private video contract](worlds-private-video-contract.md)
  - [Future Worlds experience contract](worlds-experience-contract.md)
  - [Release Manifests](releases/)
