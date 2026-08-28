# Brand Protection Report

Status: production brand audit

Reviewed: 2026-08-28

This report audits Sovereign.OS public brand language, visual identity usage, and protection measures. It verifies that public-facing language matches the approved product language system.

## Brand elements in production

### Product name

| Element | Usage | Consistency |
| --- | --- | --- |
| Sovereign.OS | Landing title, navigation wordmark, footer copyright, meta tags | Consistent |
| Sovereign | Used as shorthand in product descriptions ("Sovereign starts with you", "Sovereign's sharing permissions") | Consistent |
| sovereign.defrag.app | Primary production domain | Consistent |
| app.defrag.app | Authenticated app domain | Consistent |

### Hero statement

| Element | Current text | Source authority |
| --- | --- | --- |
| Founder hero | "Healing isn't optional. Holding onto the pain is." | `docs/product-language-system.md`, `PublicLanding.tsx:96-101` |
| Badge | "Personal AI for real life" | `PublicLanding.tsx:94` |
| Root product promise | "Know yourself. Understand your people. See the whole system." | `docs/product-language-system.md`, `PublicLanding.tsx:205` |

**Status**: Hero statement matches approved language. The product-language-system.md records "Holding the pain is" while the landing renders "Holding onto the pain is" — this is the approved founder hero text preserved from the v0 archive.

### Public navigation

| Link | Target | Status |
| --- | --- | --- |
| How it works | /how-it-works | Present |
| Pricing | /pricing | Present |
| FAQ | /faq | Present |
| Sign in | /login | Present |
| Get started | /signup | Present |
| Privacy | /privacy | Footer |
| Terms | /terms | Footer |
| Support | /pricing#support | Footer |
| Contact | mailto:info@sovereign.defrag.app | Footer |

**Status**: Complete navigation with required legal pages accessible.

### Public copy audit against product-language-system.md

| Rule | Landing compliance | Notes |
| --- | --- | --- |
| Do not lead with source mechanics | PASS | No Basis codes, framework abbreviations, or astronomical calculations visible |
| Self → People → Systems narrative | PASS | "Explore yourself" → "Understand your people" → "See the whole system" |
| Baseline is a private reference | PASS | "Build your Baseline once" — correct framing |
| No "foundation" metaphor | PASS | "foundation" does not appear |
| No "capacity" as public value prop | PASS | "capacity" does not appear in landing copy |
| No evidence-level language | PASS | No "evidence levels", "source layers", "model context" visible |
| No schema names in UI | PASS | "Basis", "sovereign-answer.v2" not visible (only in data attributes) |
| Interpretive, not deterministic | PASS | "Review, correct, or reject any interpretation" |
| 18+ not required on landing | PASS | Age gate is at signup, not landing |
| No diagnosis/claim language | PASS | No diagnostic or certainty claims |

**Status**: All product language rules pass.

## Visual identity

| Element | Implementation | Authority |
| --- | --- | --- |
| BrandMark component | SVG brand mark used in navigation and footer | `BrandMark.tsx` |
| Typography | Geist Sans (self-hosted) | `typography-system.css` |
| Color system | Near-black/cream founder system | `production-visual-authority-v1.css` |
| Visual contract markers | data-visual-contract, data-viewport-contract attributes | Landing element |

### Data-attribute contract markers

The landing carries machine-verifiable contract markers:

```
data-product-contract="baseline-first"
data-answer-contract="sovereign-answer.v2"
data-visual-contract="v0-landing-selective-port"
data-viewport-contract="v0-public-landing-v3"
data-public-release="approved-public-v8"
data-public-narrative="self-people-systems-v1"
```

These enable automated verification of the product and visual contract.

## Domain protection

| Domain | Status | Notes |
| --- | --- | --- |
| defrag.app | Active | Root domain, Cloudflare registrar |
| sovereign.defrag.app | Active | Primary production |
| app.defrag.app | Active | Authenticated app |

**Gaps**: Consider registering sovereign-os.com, sovereignos.com, and common misspellings to prevent cybersquatting.

## Social media / external presence

| Platform | Status | Notes |
| --- | --- | --- |
| Social accounts | Unknown | No social media links in production |
| GitHub repository | Private | Source code protected |
| App store listings | Not present | Web-only product |

**Recommendation**: Secure social media handles (@SovereignOS, @sovereign_os) on major platforms even if not actively used.

## Brand consistency issues

| Issue | Severity | Recommendation |
| --- | --- | --- |
| No formal brand guidelines document | Medium | Create brand guidelines covering logo usage, color, typography, voice |
| No logo/wordmark file set | Medium | Export brand assets in standard formats (SVG, PNG) |
| No trademark symbol usage | Low | Add TM symbol after first use once trademark is filed |
| SOVV internal name exposure | Low | Ensure SOVV does not appear in any user-facing surface |

## Third-party brand usage

| Third-party mark | Usage | Compliance |
| --- | --- | --- |
| Cloudflare | Not visible to users | N/A |
| Stripe | Not visible to users (checkout only) | N/A |
| React/Vite | Not visible to users | N/A |
| NASA/JPL | Not visible to users | N/A |
| Geist font | Self-hosted; no attribution required by license | Verify license terms |

**Status**: No unauthorized third-party brand usage in public surfaces.

## Source evidence

- `apps/web/src/PublicLanding.tsx` — landing page content
- `docs/product-language-system.md` — product language authority
- `apps/web/src/BrandMark.tsx` — brand mark component
- `apps/web/src/typography-system.css` — typography authority
- `apps/web/src/production-visual-authority-v1.css` — visual authority
