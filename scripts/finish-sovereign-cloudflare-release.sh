#!/usr/bin/env bash
set -euo pipefail

ACCOUNT="8b1954d216d65077c6480d62583fe2c2"
WORKER_TAG="12312246009643fab7b15750fa8e894e"
TRIGGER_UUID="459985f1-3479-4be9-8497-33728bc3a56d"
TARGET_SHA="2c89b1ea169c4108d04a5e1f7560813ada2c8c3a"
API="https://api.cloudflare.com/client/v4"

: "${CLOUDFLARE_BUILDS_ADMIN_TOKEN:?CLOUDFLARE_BUILDS_ADMIN_TOKEN must be set to the active sovv-builds-prod token}"

AUTH="Authorization: Bearer ${CLOUDFLARE_BUILDS_ADMIN_TOKEN}"
ok() { jq -e '.success == true' >/dev/null 2>&1; }

echo "=== 1. VERIFY ACTIVE TOKEN ==="
VERIFY="$(curl -sS -H "$AUTH" "$API/user/tokens/verify")"
printf '%s\n' "$VERIFY" | jq '{success,result:{id:.result.id,status:.result.status},errors}'
printf '%s' "$VERIFY" | ok || { echo "STOP: active token verification failed"; exit 2; }

TOKEN_ID="$(printf '%s' "$VERIFY" | jq -r '.result.id // empty')"
STATUS="$(printf '%s' "$VERIFY" | jq -r '.result.status // empty')"
[ "$STATUS" = "active" ] || { echo "STOP: token is not active"; exit 3; }

echo "TOKEN_ID: $TOKEN_ID"

echo
echo "=== 2. FIND EXACT WORKERS BUILDS WRAPPER ==="
TOKENS="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/tokens?per_page=200")"
printf '%s' "$TOKENS" | ok || { printf '%s\n' "$TOKENS" | jq .; exit 4; }

WRAPPER_UUID="$(
  printf '%s' "$TOKENS" | jq -r --arg tid "$TOKEN_ID" '
    [.result[]? | select(.cloudflare_token_id == $tid)]
    | last | .build_token_uuid // empty'
)"
WRAPPER_NAME="$(
  printf '%s' "$TOKENS" | jq -r --arg tid "$TOKEN_ID" '
    [.result[]? | select(.cloudflare_token_id == $tid)]
    | last | .build_token_name // empty'
)"

if [ -z "$WRAPPER_UUID" ]; then
  echo "STOP: no Workers Builds wrapper exists for active token ID $TOKEN_ID"
  exit 5
fi

echo "WRAPPER_UUID: $WRAPPER_UUID"
echo "WRAPPER_NAME: $WRAPPER_NAME"

echo
echo "=== 3. ENSURE PRODUCTION TRIGGER USES EXACT WRAPPER ==="
TRIGGERS="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/workers/$WORKER_TAG/triggers")"
TRIGGER="$(printf '%s' "$TRIGGERS" | jq -c --arg t "$TRIGGER_UUID" '.result[]? | select((.trigger_uuid // .id) == $t)')"
[ -n "$TRIGGER" ] || { echo "STOP: production trigger not found"; exit 6; }

CURRENT_UUID="$(printf '%s' "$TRIGGER" | jq -r '.build_token_uuid // empty')"
if [ "$CURRENT_UUID" != "$WRAPPER_UUID" ]; then
  PATCH_BODY="$(jq -nc --arg u "$WRAPPER_UUID" '{build_token_uuid:$u}')"
  PATCH="$(curl -sS -X PATCH \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    --data "$PATCH_BODY" \
    "$API/accounts/$ACCOUNT/builds/triggers/$TRIGGER_UUID")"
  printf '%s\n' "$PATCH" | jq '{success,result:{build_token_uuid:.result.build_token_uuid,build_token_name:.result.build_token_name},errors,messages}'
  printf '%s' "$PATCH" | ok || { echo "STOP: trigger wrapper PATCH failed"; exit 7; }
fi

TRIGGERS="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/workers/$WORKER_TAG/triggers")"
TRIGGER="$(printf '%s' "$TRIGGERS" | jq -c --arg t "$TRIGGER_UUID" '.result[]? | select((.trigger_uuid // .id) == $t)')"
CURRENT_UUID="$(printf '%s' "$TRIGGER" | jq -r '.build_token_uuid // empty')"
[ "$CURRENT_UUID" = "$WRAPPER_UUID" ] || { echo "STOP: trigger wrapper parity failed"; exit 8; }
echo "TRIGGER_TOKEN_PARITY: PASS"

echo
echo "=== 4. UPDATE BUILD-TIME DEPLOY TOKEN ==="
# Upsert only this variable; existing VITE_TURNSTILE_SITE_KEY and other build vars are preserved.
ENV_BODY="$(jq -nc --arg v "$CLOUDFLARE_BUILDS_ADMIN_TOKEN" \
  '{CLOUDFLARE_API_TOKEN:{value:$v,is_secret:true}}')"
ENV_PATCH="$(curl -sS -X PATCH \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  --data "$ENV_BODY" \
  "$API/accounts/$ACCOUNT/builds/triggers/$TRIGGER_UUID/environment_variables")"
unset ENV_BODY

printf '%s\n' "$ENV_PATCH" | jq '{
  success,
  CLOUDFLARE_API_TOKEN:(
    .result.CLOUDFLARE_API_TOKEN |
    {is_secret,created_on,value}
  ),
  errors,messages
}'
printf '%s' "$ENV_PATCH" | ok || { echo "STOP: CLOUDFLARE_API_TOKEN build-variable update failed"; exit 9; }
echo "BUILD_DEPLOY_TOKEN_UPDATED: YES"

echo
echo "=== 5. CREATE FRESH BUILD ==="
BUILD_BODY="$(jq -nc --arg branch main --arg sha "$TARGET_SHA" '{branch:$branch,commit_hash:$sha}')"
CREATE="$(curl -sS -X POST \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  --data "$BUILD_BODY" \
  "$API/accounts/$ACCOUNT/builds/triggers/$TRIGGER_UUID/builds")"
printf '%s\n' "$CREATE" | jq '{success,result,errors,messages}'
printf '%s' "$CREATE" | ok || { echo "STOP: build creation failed"; exit 10; }

BUILD_ID="$(printf '%s' "$CREATE" | jq -r '.result.build_uuid // empty')"
[ -n "$BUILD_ID" ] || { echo "STOP: no build_uuid returned"; exit 11; }
echo "NEW_BUILD_ID: $BUILD_ID"

echo
echo "=== 6. MONITOR BUILD ==="
OUTCOME=""
for i in $(seq 1 180); do
  DETAIL="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/builds/$BUILD_ID")"
  printf '%s' "$DETAIL" | ok || { printf '%s\n' "$DETAIL" | jq .; exit 12; }

  OUTCOME="$(printf '%s' "$DETAIL" | jq -r '.result.build_outcome // empty')"
  RUNNING="$(printf '%s' "$DETAIL" | jq -r '.result.running_on // empty')"
  STOPPED="$(printf '%s' "$DETAIL" | jq -r '.result.stopped_on // empty')"
  echo "poll=$i outcome=${OUTCOME:-pending} running_on=${RUNNING:-} stopped_on=${STOPPED:-}"

  case "$OUTCOME" in
    success|fail|skipped|cancelled|terminated) break;;
  esac
  sleep 5
done

echo
echo "=== 7. BUILD DETAIL + TOKEN CONSUMPTION ==="
DETAIL="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/builds/$BUILD_ID")"
USED_UUID="$(printf '%s' "$DETAIL" | jq -r '.result.build_trigger_metadata.build_token_uuid // empty')"
USED_NAME="$(printf '%s' "$DETAIL" | jq -r '.result.build_trigger_metadata.build_token_name // empty')"
SOURCE_SHA="$(printf '%s' "$DETAIL" | jq -r '.result.build_trigger_metadata.commit_hash // empty')"
OUTCOME="$(printf '%s' "$DETAIL" | jq -r '.result.build_outcome // empty')"

echo "EXPECTED_WRAPPER_UUID: $WRAPPER_UUID"
echo "BUILD_TOKEN_USED: ${USED_UUID:-<none>}"
echo "BUILD_TOKEN_USED_NAME: ${USED_NAME:-<none>}"
echo "BUILD_SOURCE_SHA: ${SOURCE_SHA:-<none>}"
echo "BUILD_OUTCOME: ${OUTCOME:-<none>}"

[ "$USED_UUID" = "$WRAPPER_UUID" ] || {
  echo "STOP: build consumed a different wrapper than expected"
  exit 13
}
echo "BUILD_TOKEN_CONSUMPTION_PARITY: PASS"

echo
echo "=== 8. BUILD LOGS ==="
LOGS="$(curl -sS -H "$AUTH" "$API/accounts/$ACCOUNT/builds/builds/$BUILD_ID/logs")"
printf '%s\n' "$LOGS" | jq -r '
  .result.lines[]? |
  if type=="array" then (map(tostring)|join(" ")) else tostring end
' | tail -160

REACHED_CLONE="$(printf '%s' "$LOGS" | jq -r '
  [.result.lines[]? |
    if type=="array" then (map(tostring)|join(" ")) else tostring end
  ] | any(test("Cloning repository";"i"))
' 2>/dev/null || echo false)"
[ "$REACHED_CLONE" = true ] && REACHED_CLONE=YES || REACHED_CLONE=NO

echo
echo "=== 9. LIVE HEALTH / READY ==="
APP_HEALTH="$(curl -sS https://app.defrag.app/health || true)"
APP_READY="$(curl -sS https://app.defrag.app/ready || true)"
PUB_HEALTH="$(curl -sS https://sovereign.defrag.app/health || true)"
PUB_READY="$(curl -sS https://sovereign.defrag.app/ready || true)"

APP_SHA="$(printf '%s' "$APP_READY" | jq -r '.version // .sha // empty' 2>/dev/null || true)"
PUB_SHA="$(printf '%s' "$PUB_READY" | jq -r '.version // .sha // empty' 2>/dev/null || true)"
MIGRATION="$(printf '%s' "$APP_READY" | jq -r '.migration // .migration_id // .schema_migration // empty' 2>/dev/null || true)"

printf '%s\n' "$APP_HEALTH" | jq . 2>/dev/null || true
printf '%s\n' "$APP_READY" | jq . 2>/dev/null || true
printf '%s\n' "$PUB_HEALTH" | jq . 2>/dev/null || true
printf '%s\n' "$PUB_READY" | jq . 2>/dev/null || true

SHA_PARITY=FAIL
if [ "$OUTCOME" = success ] &&
   [ "$SOURCE_SHA" = "$TARGET_SHA" ] &&
   [ "$APP_SHA" = "$TARGET_SHA" ] &&
   [ "$PUB_SHA" = "$TARGET_SHA" ]; then
  SHA_PARITY=PASS
fi

echo
echo "=== FINAL EVIDENCE ==="
cat <<EOF
SOVEREIGN.OS PRODUCTION BUILD
ACTIVE_TOKEN_ID: $TOKEN_ID
WRAPPER_UUID: $WRAPPER_UUID
TRIGGER_TOKEN_PARITY: PASS
BUILD_DEPLOY_TOKEN_UPDATED: YES
NEW_BUILD_ID: $BUILD_ID
BUILD_TOKEN_USED: ${USED_UUID:-<none>}
BUILD_TOKEN_CONSUMPTION_PARITY: PASS
BUILD_SOURCE_SHA: ${SOURCE_SHA:-<none>}
REACHED_CLONE: $REACHED_CLONE
BUILD_STATUS: ${OUTCOME:-<none>}
APP_READY_SHA: ${APP_SHA:-<none>}
PUBLIC_READY_SHA: ${PUB_SHA:-<none>}
MIGRATION: ${MIGRATION:-<none>}
SHA_PARITY: $SHA_PARITY
EOF

if [ "$REACHED_CLONE" != YES ]; then
  echo "RESULT: BLOCKED BEFORE CLONE"
  exit 20
fi
if [ "$OUTCOME" != success ]; then
  echo "RESULT: BUILD REACHED REPOSITORY BUT FAILED LATER"
  exit 21
fi
if [ "$SHA_PARITY" != PASS ]; then
  echo "RESULT: DEPLOYMENT COMPLETED BUT LIVE SHA PARITY FAILED"
  exit 22
fi

echo "SOVEREIGN.OS CLOUDFLARE RELEASE LAYER: VERIFIED"

