# Historical hosted-runner diagnosis

This document records a July 25, 2026 GitHub-hosted runner failure. It is historical evidence, not a current release instruction.

At that time, GitHub Actions could not allocate a hosted runner for the repository. PR #15 and the temporary runner probe failed before checkout or any shell command, with zero executed steps and no job logs across Ubuntu, macOS, and Windows images.

That diagnosis ruled out application code, workflow syntax, marketplace-action policy, and a single runner image as the immediate cause. The likely cause was repository/account-level hosted-runner admission, billing, quota, or platform policy outside the source tree.

The temporary probe and preview workflow described in the original report are no longer release paths. Do not restore or run them.

Current authority:

- Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the sole production release authority.
- Protected preview deployment uses the repository-owned `pnpm preview:bootstrap` path from a secure preview environment.
- GitHub Actions and ad-hoc local commands are not accepted as production release evidence.
