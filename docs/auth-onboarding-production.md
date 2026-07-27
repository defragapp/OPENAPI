# Sovereign.OS account and onboarding funnel

Status: implementation contract for the Cloudflare production application.

This repository uses React/Vite, a Cloudflare Worker, Hono, D1, Resend, Turnstile, and Stripe. It does not use Next.js or Supabase. The account funnel is implemented inside the existing Worker and D1 architecture rather than introducing a second application stack.

## User flow

### New account

1. A visitor chooses **Explore my Baseline**, Free, Sovereign+ monthly, or Sovereign+ annual.
2. The selected plan and billing interval are carried into `/signup`.
3. The person creates an account using a configured Apple or Google provider, or email and password.
4. The account opens a dedicated plan-selection step. The visitor can confirm or change Free, monthly Sovereign+, or annual Sovereign+.
5. The visitor enters the initial Baseline details: birth date, birthplace, birthplace timezone, and birth time when known.
6. Free opens the workspace after the Baseline is built.
7. Sovereign+ opens a server-created Stripe Checkout Session after the Baseline is built. A canceled Checkout returns to plan selection without deleting the account or Baseline.

### Existing account

1. Sign-in accepts Apple, Google, or email and password when those methods are configured for the account.
2. A paid-plan selection made on Pricing remains attached through sign-in.
3. An existing user with a completed Baseline can continue directly from plan selection to Stripe Checkout.
4. An existing user without a Baseline completes the Baseline step first.

### Password recovery

1. The user enters their email on `/forgot-password` and completes Turnstile.
2. The API gives the same public result whether an account exists or not.
3. For a matching account, Resend sends a single-use reset link that expires in 30 minutes.
4. The reset token is stored only as a SHA-256 hash.
5. The browser creates a replacement encrypted credential from the new password.
6. Saving it revokes existing sessions and creates a fresh session.

## Primary interface copy

### Create account

**Title:** Create your Sovereign.OS account.

**Support:** Create your account first. Then choose Free or Sovereign+ and build your Baseline.

**Primary action:** Create account and continue

**Provider actions:** Continue with Apple / Continue with Google

**Email divider:** or use email

### Plan selection

**Title:** Choose how far you want to begin.

**Support:** Free gives you the complete personal Baseline experience. Sovereign+ adds permission-based relationship comparisons, system mapping, saved continuity, and more conversations.

**Free:** Understand yourself. Your personal Baseline, shadow and light, alignment, current context, and 10 Sovereign responses each month. No card required.

**Sovereign+:** Understand relationships and systems. Everything in Free, plus consented comparisons, family and team maps, Library continuity, Covenant, and 300 responses each month.

### Baseline setup

**Title:** Build your starting map.

**Support:** Your birth details are reduced into private Baseline themes. Raw birth data and exact private location are not sent to the AI model.

### Password recovery email

**Subject:** Reset your Sovereign.OS password

**Body:** Reset your Sovereign.OS password using the secure link in this email. The link expires in 30 minutes. If you did not request this, you can ignore the email.

## Password protocol: `browser-key-v1`

Cloudflare Workers Free permits very little CPU time per request. Password stretching therefore runs in the user’s browser rather than inside the Worker.

### Account creation

1. The browser validates the password length.
2. The browser generates an Ed25519 signing key pair.
3. The browser derives a 256-bit AES-GCM key from the password with PBKDF2-HMAC-SHA-256, a random salt, and 600,000 iterations.
4. The browser encrypts the PKCS#8 private key with AES-GCM and a random IV.
5. The browser sends the public key, encrypted private key, salt, IV, iteration count, and credential version to the Worker.
6. The raw password and unencrypted private key never leave the browser.

### Sign-in

1. After Turnstile verification, the Worker creates a random one-time challenge that expires after five minutes.
2. The Worker returns the challenge and the encrypted private-key envelope. An unknown email receives a same-shaped dummy envelope.
3. The browser derives the AES key from the entered password and attempts to decrypt the private key.
4. The browser signs the challenge with Ed25519.
5. The Worker claims the challenge once, verifies the signature with the stored public key, and creates the session only after successful verification.

The signed message includes the normalized email, challenge ID, and challenge value. Challenges are single-use, short-lived, rate-limited by hashed email and hashed IP address, and removed by scheduled cleanup.

### Security boundary

`browser-key-v1` avoids running an expensive password KDF inside the Worker and keeps the password out of the request body. It does not make weak passwords safe. A copy of the encrypted credential can still be tested offline by someone who has stolen the database, so password strength and the 600,000-iteration KDF remain important. This is a repository-owned protocol and must receive focused security review before a public production release. Apple and Google remain preferable account options when configured.

## Other security and data handling

- Failed password challenge attempts are limited by hashed email and hashed IP address.
- Turnstile is required for signup, password-challenge creation, and password recovery.
- OAuth state and nonce values are random and stored only as hashes.
- OAuth state is also bound to the initiating browser with a short-lived HttpOnly, Secure cookie.
- Google and Apple ID tokens are checked for signature, issuer, audience, expiry, verified email, and nonce before account linking.
- Session cookies remain HttpOnly, Secure, SameSite=Lax, and server-revocable.
- Stripe Checkout remains server-created and must return an approved Stripe host before the browser follows it.
- Scheduled cleanup removes expired password challenges, OAuth state, password-reset records, and login-attempt records.
- Existing magic-link redemption remains available for accounts created during the earlier release, but it is no longer the primary public account flow.
- An earlier magic-link account can establish a password by using the password-recovery flow.

## Cloudflare production configuration

### Existing required configuration

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY` or the Cloudflare Email binding
- Stripe secret, webhook secret, monthly price, annual price, success URL, cancellation URL, and portal return URL

### Google

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=https://app.defrag.app/api/v1/auth/oauth/google/callback`

The exact callback URL must also be registered in the Google OAuth client.

### Apple

- `APPLE_CLIENT_ID`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_REDIRECT_URI=https://app.defrag.app/api/v1/auth/oauth/apple/callback`

The Services ID and return URL must be registered in Apple Developer. The private key must be stored as a Cloudflare secret, never in the repository.

Provider buttons are shown only when the corresponding production configuration is complete. Email and password remain available independently in current browsers with Ed25519 WebCrypto support.

## Release verification

Before merging and deployment:

1. Apply D1 migration `0010_auth_password_oauth_onboarding` in the target environment.
2. Run the repository Cloudflare build gate, Worker tests, web tests, typecheck, migration validation, and secret scan.
3. Complete an independent review of `browser-key-v1`, including challenge replay, offline credential testing, account enumeration, browser compatibility, reset, and session revocation.
4. Verify email/password signup, correct and incorrect password login, challenge expiry, challenge reuse rejection, rate limiting, logout, password recovery, reset expiry, and session revocation.
5. Verify Google and Apple callback registration and real provider login when their credentials are configured.
6. Verify Free setup reaches `/app` without Stripe.
7. Verify monthly and annual pricing links preserve their exact selection through signup and sign-in.
8. Verify Sovereign+ creates the correct Stripe Checkout Session and a canceled Checkout returns to onboarding.
9. Verify the Baseline form works at desktop and iPhone widths with visible labels and no horizontal overflow.
10. Confirm `/health` reports each authentication mode accurately and the live Worker reports the exact deployed commit.
