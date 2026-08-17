# Historical SOVV adapter map

Status: historical porting reference. This document does not describe the current Sovereign.OS production runtime.

The earlier OPENAPI bootstrap inspected `/workspace/SOVV` read-only and mapped selected legacy contracts while the canonical OPENAPI implementation was being established. That work is retained for provenance only.

## Current authority

Current production behavior is defined by:

- `README.md` for repository and platform orientation;
- `docs/architecture.md` for runtime architecture;
- `docs/launch-product-contract.md` for product scope;
- `docs/inner-recognition-intelligence.md` for Baseline and answer contracts;
- `docs/tool-contracts.md` for current reduced tool interfaces;
- `docs/production-release.md` for release authority.

`defragapp/OPENAPI` is the production implementation. `defragapp/SOVV` remains read-only legacy reference material and is not a production service dependency, alternate API authority, or deployment source.

## Historical mapping

The legacy inspection covered SOVV auth/session behavior, Baseline routes and computation, NASA/JPL Horizons code, Library retrieval, entitlements, Worker bindings, and the old public route specification. Those observations helped establish compatibility during the port.

Do not use the former unresolved assumptions in this file to add a SOVV service binding, cross-domain cookie bridge, SOVV internal HTTP dependency, fallback inference path, or duplicate data authority to production.

Current OPENAPI production must fail closed when its own required dependencies are unavailable rather than attempting to call a legacy SOVV runtime.
