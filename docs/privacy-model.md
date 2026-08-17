# Privacy and consent model

## Principle

Private context is not a convenience feature. It is a product boundary.

## Data zones

### Raw sensitive data

Birth inputs, exact private location, invite tokens, authentication material, Stripe identifiers, and raw framework payloads stay server-side and are never placed in model context.

### Reduced machine context

The agent may receive only the translated signals needed for the current tool call. Reduced context should include provenance and explicit uncertainty.

### User-visible output

Outputs are inspectable and may be saved only through an explicit user action or a clearly disclosed setting.

## Consent scopes

- `pair.compare`
- `system.include`
- `trait.display`
- `framework.display`
- `current_conditions.use`
- `library.link`
- `covenant.include`

Every invited-person scope defaults to denied. Revocation takes effect immediately for new analysis. Previously saved outputs remain visible only according to the product's retention and deletion policy.

## Account policy and eligibility boundary

Signup requires affirmative acceptance of the exact current Terms and Privacy versions plus their canonical content hash. The public launch also requires a separate confirmation that the account holder is 18 or older. The 18+ rule is a Sovereign.OS product eligibility decision; it is not represented as a universal legal age requirement.

Terms and Privacy acceptance are stored as separate append-only receipts with policy version, content hash, accepted time, acceptance surface, exact release SHA, and hashed request evidence. Material policy changes can pause normal private product API/workspace use until the current policy set is reviewed again.

Policy review does not block the account holder from requesting their own data export, scheduling/cancelling deletion, signing out, or accessing bounded billing controls.

## Private data access

`POST /api/v1/account/export` provides an authenticated, same-origin JSON export of account-owned data. The export is assembled on demand from D1 and returned directly with `Cache-Control: private, no-store`. It is not written to R2 and is not retained as an export artifact.

The export includes account/product data and policy/consent history needed for user access. It excludes session and magic-link secrets/hashes, email-code secrets/hashes, passkey credential identifiers/public keys, invitation token hashes, Stripe customer/subscription identifiers, webhook payloads, and provider secrets.

The historical `/api/v1/export-jobs` path remains disabled.

## Model-boundary rules

- Never send raw birth records.
- Never send exact private location.
- Never send unrelated Library history.
- Never expose private identifiers as renderer text.
- Never infer exact mood, intent, diagnosis, or future behavior.
- Always label unknown state.

## Retention and deletion

- Unsaved thread content and complete AI responses are scheduled for deletion after 30 days under the current launch policy.
- Minimal security/operational metadata without conversation content may remain for up to 90 days.
- Library understandings remain until the user deletes them or closes the account.
- Expired authentication recovery records and passkey challenges are periodically removed.
- Account deletion has a 14-day grace period and removes account-bound magic links, email codes, sessions, passkeys/challenges, Baseline data, privacy settings, privacy-request events, People/Systems data, threads, Library data, audit/correction records, entitlement state, and AI usage state.
- Policy-acceptance receipts remain with the pseudonymized account as bounded audit evidence.
- Stripe subscription/customer state is minimized and retained only as needed for subscription operation, fraud prevention, accounting, and applicable law.

## Audit events

Record privacy-safe events for consent grant, consent revocation, tool access decision, saved understanding, public-link sharing, privacy access request, policy review, deletion request, billing access change, and webhook processing. Do not log raw prompt text by default.

See `docs/privacy-data-flow-register.md` for the operational provider/data-flow inventory and `docs/security/soc2-readiness-controls.md` for readiness evidence and external evidence gaps.
