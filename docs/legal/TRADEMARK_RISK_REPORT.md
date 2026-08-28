# Trademark Risk Report

Status: production trademark risk assessment

Reviewed: 2026-08-28

This report identifies potential trademark conflicts and registration considerations for Sovereign.OS product names and terminology. It is an engineering risk assessment, not legal advice.

## Marks in use

### Primary marks

| Mark | Usage | Registration status | Risk level |
| --- | --- | --- | --- |
| Sovereign.OS | Product name, public landing, authenticated app, security policy, all documentation | Unregistered; common law rights through use | Medium — see conflicts below |
| SOVV | Internal project name, archive reference | Unregistered; minimal public exposure | Low |
| Sovereign Intelligence | Feature name in code (`SovereignIntelligenceWorkspace`) | Unregistered | Medium — descriptive elements |

### Product terminology marks

| Mark | Usage | Registration status | Risk level |
| --- | --- | --- | --- |
| Baseline Design | Core product concept | Unregistered | Low–Medium |
| Expression Field | Product object | Unregistered | Low |
| Alignment | Reasoning lens | Unregistered | Low — common word, narrow product use |
| Covenant | Reasoning lens | Unregistered | Low — common word, narrow product use |
| Basis | Internal source value name | Unregistered | Low — internal use only |

## Potential conflicts

### "Sovereign" — high-frequency term

The word "sovereign" is used extensively across multiple industries:

| Existing mark | Industry | Relevance | Risk |
| --- | --- | --- | --- |
| Sovereign (various financial services) | Banking, insurance, investments | Different industry; different market | Low direct conflict for AI/personal-intelligence product |
| Sovereign (various software) | Various software products | Depends on specific marks and classes | Medium — trademark search needed for software/AI classes |
| Sovereign (healthcare, wellness) | Health and wellness services | Some overlap with "healing" brand language | Medium — brand language overlap requires monitoring |

**Assessment**: "Sovereign" is a common English word. Multiple entities use it across industries. The `.OS` suffix and specific product context differentiate Sovereign.OS, but a formal trademark search in IC 9 (software), IC 42 (scientific/tech services), and IC 44 (personal services) is recommended before filing.

### "Baseline" — descriptive risk

| Consideration | Assessment |
| --- | --- |
| "Baseline" in software | Commonly used term (baseline configuration, baseline testing) |
| "Baseline Design" as compound | More distinctive; less likely to conflict |
| Risk | Low–Medium — the compound "Baseline Design" in the personal-AI context is sufficiently distinctive |

### "Defrag" — domain brand

| Consideration | Assessment |
| --- | --- |
| Defrag in software | Historically associated with disk defragmentation |
| defrag.app domain | Current production domain |
| Risk | Low — different context (personal AI vs system utility); domain provides differentiation |

## Registration recommendations

### Priority 1 — file before or shortly after launch

1. **Sovereign.OS** — primary product name
   - Recommended classes: IC 9 (computer software), IC 42 (scientific and technological services), IC 44 (personal and social services)
   - Jurisdictions: US (USPTO), EU (EUIPO), consider UK (UKIPO)
   - Format: standard character mark + any logo/design mark when finalized

2. **Sovereign.OS logo/wordmark** — when visual identity is finalized
   - Design mark in same classes

### Priority 2 — file when product matures

3. **Baseline Design** — core product concept
   - If the term becomes strongly associated with the product
   - IC 9, IC 42

4. **sovereign.defrag.app / app.defrag.app** — domain names
   - Domain registration provides some protection; formal mark registration if brand value increases

### Priority 3 — monitor

5. **Expression Field, Alignment, Covenant** — monitor for adoption by others
   - Currently low risk due to narrow product use
   - File if terms become central to product marketing

## Defensive considerations

| Action | Purpose |
| --- | --- |
| Trademark search before filing | Identify conflicting marks in relevant classes |
| Monitor USPTO/EUIPO filings | Detect conflicting applications early |
| Document first-use dates | Establish common law priority |
| Use TM symbol | Put others on notice of claim |
| Maintain consistent usage | Strengthen distinctiveness over time |
| Domain variations | Consider registering common misspellings/TLDs to prevent cybersquatting |

## Current public language audit

The following marks appear in public-facing production surfaces:

- **Sovereign.OS**: Landing page title, meta tags, security policy, all documentation
- **Sovereign**: Used as the product name throughout ("Sovereign can move through...", "Sovereign uses...")
- **Baseline**: Used as a product object name in navigation and product descriptions
- **defrag.app**: Domain in security.txt contact, email sender address

No unauthorized third-party trademarks appear in Sovereign.OS public language.

## Source evidence

- `apps/web/src/PublicLanding.tsx` — public brand usage
- `SECURITY.md` — brand in security policy
- `apps/sovereign-worker/src/email.ts` — brand in email (info@sovereign.defrag.app)
- `docs/product-language-system.md` — product terminology authority
- DNS records: sovereign.defrag.app, app.defrag.app, defrag.app
