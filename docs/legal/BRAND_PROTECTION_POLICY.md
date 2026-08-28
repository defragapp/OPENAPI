# Brand Protection Policy

Status: brand protection rules and abuse monitoring

Reviewed: 2026-08-28

This policy establishes rules for protecting the Sovereign.OS brand and monitoring for misuse.

## Brand elements

### Protected marks

| Element | Protected form | Usage rule |
| --- | --- | --- |
| Product name | Sovereign.OS | Always with .OS suffix in formal contexts; "Sovereign" acceptable in running text |
| Brand mark | BrandMark SVG component | Use only approved component; do not modify |
| Typography | Geist Sans (self-hosted) | Use --font-display token; do not substitute |
| Color system | Near-black/cream founder system | Do not replace with white/light/enterprise styling |
| Hero statement | "Healing isn't optional. Holding onto the pain is." | Do not alter wording |
| Product promise | "Know yourself. Understand your people. See the whole system." | Do not alter wording |
| Product category | "Private personal AI for real life." | Do not alter wording |

### Approved terminology

| Term | Approved usage |
| --- | --- |
| Baseline / Baseline Design | The private reference built around the person |
| Expression Field | Stable quality vs pressured expression |
| Alignment | Structured comparison, never a score |
| Covenant | Contextual reasoning lens (when explicitly confirmed) |
| Sources / Source details | User-facing label for Basis values |
| Sovereign | The single user-facing AI agent |

### Prohibited usage

| Prohibited | Reason |
| --- | --- |
| "foundation" / "personal foundation" as primary metaphor | Explicitly prohibited by product language system |
| Leading with source mechanics (Basis codes, framework abbreviations) | Must stay beneath primary experience |
| "capacity" as public value proposition | Internal concept; not for landing/demo |
| Evidence-level language in UI | Internal taxonomy; translate to plain language |
| Schema names in UI (Basis, sovereign-answer.v2) | Internal names; use "Sources" instead |
| Diagnostic or certainty claims | Prohibited by safety layer |
| Scored/gauged identity | Alignment is comparison, never a score |

## Brand consistency rules

### Visual consistency

| Rule | Authority |
| --- | --- |
| Title face is Geist Sans | `typography-system.css` |
| Visual proportions from production visual authority | `production-visual-authority-v1.css` |
| Do not replace near-black/cream system with white/light | agents.md visual rules |
| Do not add generic SaaS/dashboard styling | agents.md visual rules |
| Motion must not gate comprehension | agents.md visual rules |

### Language consistency

| Rule | Authority |
| --- | --- |
| Product language follows `docs/product-language-system.md` | Single source of truth |
| Self → People → Systems narrative order | Product language system |
| Interpretive, not deterministic | Certainty register |
| Contribution ≠ causation, feedback ≠ blame | Responsibility boundary |
| No internal taxonomy as interface copy | User-facing vocabulary boundary |

## Abuse monitoring

### Impersonation detection

| Monitor | Frequency | Action |
| --- | --- | --- |
| Social media impersonation | Monthly search | Report to platform; send cease-and-desist |
| Fake email domains | Quarterly | Monitor for lookalike domains |
| Fake support channels | Quarterly | Report to platform |

### Fake apps

| Monitor | Frequency | Action |
| --- | --- | --- |
| App stores (iOS, Android) | Quarterly | DMCA takedown for trademark/copyright infringement |
| Web app clones | Quarterly | DMCA takedown; evaluate trademark claim |
| Browser extensions | Quarterly | Report to browser vendor |

### Fake domains

| Monitor | Frequency | Action |
| --- | --- | --- |
| Domain variations (sovereign-os.com, etc.) | Before registration (defensive) | Register defensively |
| Lookalike domains | Quarterly | UDRP complaint if bad faith |
| Expired similar domains | Quarterly | Evaluate for acquisition |

### Trademark misuse

| Scenario | Action |
| --- | --- |
| Competitor using "Sovereign" in software/AI | Evaluate confusion; cease-and-desist if warranted |
| Unauthorized use of brand mark | DMCA takedown + trademark claim |
| Misrepresentation of affiliation | Cease-and-desist; correct public record |
| Domain cybersquatting | UDRP complaint |

## Brand usage guidelines for third parties

### Permitted without explicit permission

| Usage | Conditions |
| --- | --- |
| Factual reference to Sovereign.OS | "I use Sovereign.OS" — truthful, non-endorsed |
| Linking to sovereign.defrag.app | Standard HTML links |
| API integration (if available) | Following published API documentation |

### Requires explicit permission

| Usage | Process |
| --- | --- |
| Using Sovereign.OS logo | Written permission required |
| Claiming partnership/endorsement | Written agreement required |
| Using proprietary terminology in products | License agreement required |
| Reproducing product screenshots | Written permission required |

## Enforcement priorities

| Priority | Scenario | Response |
| --- | --- | --- |
| 1 | Active user fraud/scam using Sovereign.OS brand | Immediate takedown + legal notice |
| 2 | Confusingly similar product in AI/personal space | Trademark opposition/cease-and-desist |
| 3 | Cybersquatting on sovereign-related domains | UDRP complaint |
| 4 | Unauthorized use of brand mark | DMCA takedown |
| 5 | Non-confusing use in different industry | Monitor; no action needed |

## Source evidence

- `docs/product-language-system.md` — product language authority
- `apps/web/src/PublicLanding.tsx` — brand usage in production
- `apps/web/src/BrandMark.tsx` — brand mark component
- `apps/web/src/typography-system.css` — typography authority
- `apps/web/src/production-visual-authority-v1.css` — visual authority
- `docs/legal/TRADEMARK_STRATEGY.md` — trademark filing plan
