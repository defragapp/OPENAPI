# Sovereign.OS Secret Scanning Patterns

For GitHub Advanced Security Secret Scanning custom patterns (Issue #157).
Third-party credentials (Cloudflare, Stripe, Resend) are covered by GitHub's default patterns.

The custom Sovereign.OS credential prefix pattern guarantees that first-party private identifiers and credentials can be detected.

## Pattern

`sovv_(live|test)_[a-zA-Z0-9]{32}`

## Description

Catches Sovereign.OS internal credentials (e.g. `sovv_live_...` or `sovv_test_...`) ensuring they are never hardcoded or committed to the repository.
