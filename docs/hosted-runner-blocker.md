# Hosted runner blocker

As of 2026-07-25, GitHub Actions cannot allocate any hosted runner for this repository.

Verified on PR #15:

- Standard CI using `actions/checkout` and `actions/setup-node` failed before checkout with zero steps and no logs.
- A shell-only CI with no marketplace actions also failed before its first command with zero steps and no logs.
- Runner Probe run `30141605928` tested `ubuntu-latest`, `macos-latest`, and `windows-latest`; all three jobs failed before their first step with no logs.
- Exact-head CI run `30141698918` repeated the same zero-step failure.
- The temporary probe was removed after diagnosis.

This rules out application code, workflow syntax, marketplace-action policy, and a single runner image as the immediate cause. The remaining blocker is repository/account-level hosted-runner admission, billing, quota, or platform policy outside the source tree.

The protected preview workflow is ready to run from `codex/inner-recognition-intelligence` as soon as hosted runner access is restored. It is shell-only, deploys only the isolated preview environment, requires Cloudflare Access service-token credentials, verifies the Access perimeter, and runs authenticated preview smokes. It cannot deploy production.
