# Chat UI decision: Sovereign conversation surface

Status: accepted for public-release milestone.

## Context

Sovereign.OS must keep Cloudflare Worker authentication, D1 thread ownership, Durable Object turn sequencing, Cloudflare AI Gateway inference, consent enforcement, correction handling, save-to-Library actions, Covenant enablement, and entitlement failures inside the existing TypeScript Worker application.

## Option 1: ChatKit React with a Worker protocol adapter

ChatKit React is a strong candidate for future UI polish because it provides a mature visible chat layer, streaming affordances, cancellation, history, widgets, custom authentication fetches, and application context. The blocking issue for this milestone is not the React component; it is protocol ownership. A compliant adapter would need to preserve the current `/api/v1/threads/:threadId/messages` streaming contract, D1 persistence, Durable Object idempotency, consent errors, selected person/system context, correction controls, save-to-Library controls, and Covenant toggle semantics without duplicating message storage or adding a Python runtime.

## Option 2: Mature the existing custom React conversation UI

The existing React interface already calls same-origin Worker APIs, uses the current D1/Durable Object thread model, supports streamed text, cancellation, selected person/system context, correction controls, explicit Library saves, Covenant enablement, and mobile-first layout. It does not require moving inference away from Cloudflare AI Gateway or adding another service.

## Decision

Retain and mature the custom React conversation UI for this release. Do not add `@openai/chatkit-react` yet.

## Rationale

This keeps account data, consent enforcement, Baseline retrieval, Durable Object coordination, and public stream persistence in one Worker-owned protocol. ChatKit can be reconsidered after a thin Worker adapter is proven in tests and shown not to require duplicate thread persistence, a Python server, or a weakened authorization model.
