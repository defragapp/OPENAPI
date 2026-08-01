# Sovereign.OS public release — 2026-08-01

Production source: `main`

Approved visual source: the supplied v0 editorial landing and its canonical OPENAPI implementation restored from `96409463b69598b72496a5de5006a16a47c548c2`.

Release requirements:

- preserve the approved v0 landing composition and components;
- preserve persistent accounts, Baseline onboarding, AI answers, consent-aware People and Systems, Library, and account controls;
- preserve Free, Sovereign+ monthly ($20), Sovereign+ annual ($99), and founder-approved one-time support links;
- deploy through Cloudflare Workers Builds only;
- require `/health`, `/ready`, migration `0013_workers_ai_free_capacity`, and unauthenticated Expression Field `401` verification before certification.

This manifest exists to force and identify the clean production build. It does not alter application behavior.
