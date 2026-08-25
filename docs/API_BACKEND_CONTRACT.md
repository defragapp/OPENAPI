# Sovereign.OS API & Backend Contract

This document provides a concrete mapping of the Backend APIs and data model schemas currently supported by the `sovv-web` Cloudflare Worker in `apps/sovereign-worker`.

## 1. Request Flow & Routing
The Cloudflare Worker routes traffic primarily through `app.defrag.app/api/v1/`.

**Core Endpoints (from `apps/sovereign-worker/src/index.ts`):**

### 1.1 Authentication & Policy
- `POST /api/v1/auth/signup` - User sign-up (Turnstile protected)
- `POST /api/v1/auth/login` - Initiation of login flow
- `POST /api/v1/auth/redeem` - Redeem email recovery or magic codes
- `POST /api/v1/auth/passkey/login/options` & `verify` - WebAuthn/Passkey flows
- `GET /api/v1/auth/session` - Return current session
- `POST /api/v1/auth/logout` - Invalidate session

### 1.2 Core Product Contexts
- `GET /api/v1/today` - Today context
- `POST /api/v1/explore` - Explore context initiation
- `GET /api/v1/you` - You (User profile/Baseline)

### 1.3 Thread Management
- `GET /api/v1/threads` - Fetch user threads
- `GET /api/v1/threads/:threadId` - Fetch thread history
- `POST /api/v1/threads/:threadId/messages` - Sovereign conversational inference
- `POST /api/v1/threads/:threadId/corrections` - Post correction messages
- `POST /api/v1/threads/:threadId/covenant` - Covenant interaction within a thread

### 1.4 Billing & Operations
- `GET /api/v1/billing/entitlements` - Check Free/Sovereign+ entitlement
- `POST /api/v1/billing/checkout` & `portal` - Stripe integration
- `POST /api/v1/export-jobs` - Account data export
- `POST /api/v1/deletion-jobs` - Account deletion initialization

## 2. Frontend/Backend Interaction
The frontend (React 19 + Vite in `apps/web`) communicates exclusively with these endpoints through standard fetch calls, maintaining the "Sovereign AI experience" through the thread routes.
- The `v1/threads/:threadId/messages` route acts as the canonical entry point for AI interactions, wrapping requests to the Workers AI Gateway and returning deterministic, typed outputs suitable for rendering Sovereign Expression Fields.

## 3. Data Model Schema Mapping (D1 Migrations)
The D1 Database (`sovereign-openapi-db`) state and parity trace through `apps/sovereign-worker/migrations/`.

- `0001_initial.sql` - Core account schema
- `0013_workers_ai_free_capacity.sql` - Introduced the global capacity ledger for AI tracking. Retained for daily ledger lineage.
- `0015_release_evidence.sql` - Introduced release-evidence tables used in deployment gating.
- `0017_privacy_access_and_eligibility.sql` - Stabilized core privacy access policies. (Currently deployed and immutable).
- `0018_workers_ai_capacity_reservations.sql` - Upgrades capacity handling, currently marking the **candidate parity target** for any new launch.
