# Privacy and consent model

## Principle

Private context is not a convenience feature. It is a product boundary.

## Data zones

### Raw sensitive data

Birth inputs, exact location, invite tokens, authentication material, Stripe identifiers, and raw framework payloads stay server-side and are never placed in model context.

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

## Model-boundary rules

- Never send raw birth records.
- Never send exact private location.
- Never send unrelated Library history.
- Never expose private identifiers as renderer text.
- Never infer exact mood, intent, diagnosis, or future behavior.
- Always label unknown state.

## Audit events

Record privacy-safe events for consent grant, consent revocation, tool access decision, saved understanding, export request, deletion request, billing access change, and webhook processing. Do not log raw prompt text by default.
