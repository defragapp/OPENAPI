#!/usr/bin/env bash
# Resend Email Configuration Verification Script
# This script verifies that the Resend email configuration is properly set up for CI/production

set -euo pipefail

echo "=== Resend Email Configuration Verification ==="
echo ""

# Check required environment variables
REQUIRED_VARS=(
    "RESEND_API_KEY"
    "TRANSACTIONAL_FROM_EMAIL"
    "TRANSACTIONAL_REPLY_TO_EMAIL"
    "EMAIL_SMOKE_TEST_RECIPIENT"
)

MISSING=0
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        echo "❌ MISSING: $var"
        MISSING=1
    else
        echo "✅ SET: $var"
    fi
done

if [[ $MISSING -eq 1 ]]; then
    echo ""
    echo "❌ FAILURE: Required environment variables are missing"
    echo "Please set the following in your CI environment:"
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            echo "  - $var"
        fi
    done
    echo ""
    echo "Expected values:"
    echo "  RESEND_API_KEY=re_... (from Resend dashboard)"
    echo "  TRANSACTIONAL_FROM_EMAIL=info@sovereign.defrag.app"
    echo "  TRANSACTIONAL_REPLY_TO_EMAIL=info@sovereign.defrag.app"
    echo "  EMAIL_SMOKE_TEST_RECIPIENT=delivered+sovereign-<sha>@resend.dev (or your test recipient)"
    exit 1
fi

echo ""
echo "✅ All required environment variables are set"
echo ""

# Run the email smoke test
echo "Running email smoke test..."
cd /Users/cjo/Downloads/AZUP-SOV/OPENAPI/openapiii
pnpm smoke:email

if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ Email smoke test passed!"
    echo "Resend email configuration verified successfully."
else
    echo ""
    echo "❌ Email smoke test failed"
    exit 1
fi