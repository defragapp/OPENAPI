#!/usr/bin/env bash
set -euo pipefail

ACCOUNT_ID="8b1954d216d65077c6480d62583fe2c2"
TURNSTILE_SITE_KEY="0x4AAAAAADhGIF8-iOLIg8MU"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# Production release authority is always the current origin/main.
git fetch --quiet origin refs/heads/main
TARGET_SHA="$(git rev-parse FETCH_HEAD)"
CHECKOUT_SHA="$(git rev-parse HEAD)"

if [[ "$CHECKOUT_SHA" != "$TARGET_SHA" ]]; then
  echo "ERROR: checkout is not current origin/main"
  echo "checkout=$CHECKOUT_SHA"
  echo "origin/main=$TARGET_SHA"
  exit 2
fi

export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"
export CF_ACCOUNT_ID="$ACCOUNT_ID"
export VITE_TURNSTILE_SITE_KEY="$TURNSTILE_SITE_KEY"
export WORKERS_CI=1
export WORKERS_CI_BRANCH=main
export WORKERS_CI_COMMIT_SHA="$TARGET_SHA"
export GITHUB_SHA="$TARGET_SHA"
export APP_VERSION="$TARGET_SHA"

# Wrangler gives CLOUDFLARE_API_TOKEN precedence over stored OAuth. Remove any
# under-scoped or stale inherited credentials before establishing the current-member
# OAuth session. Browser Rendering has its own preferred env var, so clear that too.
unset CLOUDFLARE_API_TOKEN || true
unset CF_API_TOKEN || true
unset CLOUDFLARE_BROWSER_API_TOKEN || true

WRANGLER=(pnpm --filter @sovereign/worker exec wrangler)

ensure_oauth() {
  local whoami status auth_json auth_type oauth_token
  set +e
  whoami="$("${WRANGLER[@]}" whoami 2>&1)"
  status=$?
  set -e

  if [[ $status -ne 0 ]] || grep -Eqi 'not authenticated|not logged|authentication error|login required' <<<"$whoami"; then
    echo "Wrangler OAuth is not usable. Opening Cloudflare authorization..."
    "${WRANGLER[@]}" login --use-keyring
    whoami="$("${WRANGLER[@]}" whoami 2>&1)"
  fi

  printf '%s\n' "$whoami"
  auth_json="$("${WRANGLER[@]}" auth token --json)"
  auth_type="$(printf '%s' "$auth_json" | jq -r '.type // empty')"
  oauth_token="$(printf '%s' "$auth_json" | jq -r '.token // empty')"

  if [[ "$auth_type" != "oauth" || -z "$oauth_token" ]]; then
    echo "ERROR: expected Wrangler OAuth authentication, got type=${auth_type:-none}"
    exit 3
  fi

  # Export CLOUDFLARE_BROWSER_API_TOKEN for Browser Rendering REST calls if needed,
  # but keep CLOUDFLARE_API_TOKEN unset so Wrangler uses its native stored OAuth credentials for D1.
  unset CLOUDFLARE_API_TOKEN || true
  unset CF_API_TOKEN || true
  export CLOUDFLARE_BROWSER_API_TOKEN="$oauth_token"
  echo "WRANGLER_OAUTH: PASS"
}

ensure_oauth

# Prove the authenticated member can see the production D1 before spending
# time on the full release gate.
D1_JSON="$("${WRANGLER[@]}" d1 list --json)"
DB_ID="$(printf '%s' "$D1_JSON" | jq -r '[.[]? | select((.name // .database_name) == "sovereign-openapi-db")][0] | (.uuid // .id // .database_id // empty)')"
if [[ -z "$DB_ID" ]]; then
  echo "ERROR: current-member OAuth cannot see sovereign-openapi-db"
  exit 4
fi
echo "D1_ACCESS: PASS"

pnpm verify:cloudflare-build
pnpm production:deploy

APP_READY="$(curl -fsS "https://app.defrag.app/ready?release=$TARGET_SHA")"
PUBLIC_READY="$(curl -fsS "https://sovereign.defrag.app/ready?release=$TARGET_SHA")"

APP_READY_BOOL="$(printf '%s' "$APP_READY" | jq -r '.ready // false')"
PUBLIC_READY_BOOL="$(printf '%s' "$PUBLIC_READY" | jq -r '.ready // false')"
APP_SHA="$(printf '%s' "$APP_READY" | jq -r '.version // .sha // empty')"
PUBLIC_SHA="$(printf '%s' "$PUBLIC_READY" | jq -r '.version // .sha // empty')"
APP_EVIDENCE_SHA="$(printf '%s' "$APP_READY" | jq -r '.releaseEvidence.sha // empty')"
PUBLIC_EVIDENCE_SHA="$(printf '%s' "$PUBLIC_READY" | jq -r '.releaseEvidence.sha // empty')"
MIGRATION="$(printf '%s' "$APP_READY" | jq -r '.migrationVersion // empty')"
LATEST_MIGRATION="$(printf '%s' "$APP_READY" | jq -r '.latestMigrationVersion // empty')"

cat <<EOF
SOVEREIGN.OS PRODUCTION RELEASE
TARGET_SHA: $TARGET_SHA
ORIGIN_MAIN_SHA: $TARGET_SHA
CHECKOUT_SHA: $CHECKOUT_SHA
WRANGLER_OAUTH: PASS
D1_ACCESS: PASS
BUILD_GATE: PASS
PRODUCTION_DEPLOY_COMMAND: PASS
APP_READY: $APP_READY_BOOL
APP_READY_SHA: $APP_SHA
APP_RELEASE_EVIDENCE_SHA: $APP_EVIDENCE_SHA
PUBLIC_READY: $PUBLIC_READY_BOOL
PUBLIC_READY_SHA: $PUBLIC_SHA
PUBLIC_RELEASE_EVIDENCE_SHA: $PUBLIC_EVIDENCE_SHA
MIGRATION: $MIGRATION
LATEST_MIGRATION: $LATEST_MIGRATION
EOF

if [[ "$APP_READY_BOOL" != "true" || "$PUBLIC_READY_BOOL" != "true" ]]; then
  echo "SHA_PARITY: FAIL"
  exit 20
fi
if [[ "$APP_SHA" != "$TARGET_SHA" || "$PUBLIC_SHA" != "$TARGET_SHA" ]]; then
  echo "SHA_PARITY: FAIL"
  exit 21
fi
if [[ "$APP_EVIDENCE_SHA" != "$TARGET_SHA" || "$PUBLIC_EVIDENCE_SHA" != "$TARGET_SHA" ]]; then
  echo "SHA_PARITY: FAIL"
  exit 22
fi
if [[ "$MIGRATION" != "0019_deprecate_manual_capacity" || "$LATEST_MIGRATION" != "0019_deprecate_manual_capacity" ]]; then
  echo "SHA_PARITY: FAIL"
  exit 23
fi

echo "SHA_PARITY: PASS"
echo "SOVEREIGN.OS PRODUCTION RELEASE: VERIFIED"
