# Sovereign.OS — Legal Readiness Matrix

**Date:** 2026-08-28
**Status:** Production-deployed with public legal documents in place.

This matrix inventories the legal documents that exist, what they cover, and remaining gaps. It is an operational record, not legal advice.

---

## 1. Terms of Service — PRESENT

**Location:** `/terms` route on sovereign.defrag.app
**Version:** 2026-08-17.2
**Effective Date:** August 17, 2026

### Coverage Audit

| Required Topic | Covered | Evidence |
|---|---|---|
| Platform usage description | YES | "What Sovereign.OS provides" section |
| Account rules | YES | Implied through signup flow (name, email, terms acceptance, 18+ eligibility) |
| Prohibited activities | PARTIAL | "Interpretive limits" section prohibits diagnosis/prediction; no explicit scraping/reverse-engineering clause in public Terms |
| Intellectual property ownership | PARTIAL | No explicit IP ownership clause visible in public Terms sections |
| AI limitations | YES | "Interpretive limits" section: astrology/Human Design/Gene Keys are "symbolic interpretive frameworks, not scientifically verified psychological measurements"; no diagnosis/prediction/hidden motive determination |
| Liability limitations | NOT CONFIRMED | No explicit limitation-of-liability or indemnification clause visible in public Terms sections |
| Termination rights | PARTIAL | "Plans and usage" + "Billing and cancellation" cover subscription termination; no explicit account termination for cause clause |

### Gaps

1. **No explicit acceptable-use/prohibited-conduct clause** — scraping, reverse engineering, automated access, illegal use, account misuse are not enumerated in the public Terms.
2. **No explicit limitation of liability** — standard SaaS protection missing from visible Terms content.
3. **No explicit indemnification clause** — user indemnification of provider not visible.
4. **No explicit IP ownership clause** — who owns the prompts, the output, the Baseline data is not explicitly stated in public Terms.
5. **No explicit dispute resolution / governing law clause** — jurisdiction and arbitration not visible.
6. **No explicit modification/acceptance mechanism** — how Terms changes are communicated and accepted.

---

## 2. Privacy Policy — PRESENT

**Location:** `/privacy` route on sovereign.defrag.app
**Version:** 2026-08-17.2
**Effective Date:** August 17, 2026

### Coverage Audit

| Required Topic | Covered | Evidence |
|---|---|---|
| Data collected | YES | "Information you provide" section lists birth date, birthplace, timezone, birth-time certainty, birth time, location precision |
| Purpose of collection | YES | "How Baseline details are used", "AI requests and answers" |
| Storage | YES | "What is kept and for how long" section with retention periods |
| Processors/vendors | YES | "Service providers" section names Cloudflare, Stripe, Resend |
| User rights | YES | "Your controls" section covers correction, deletion, export, billing, permission revocation |
| Deletion requests | YES | 14-day grace period, account deletion, subscription cancellation |
| International transfers | NOT CONFIRMED | No explicit international data transfer mechanism described |
| Cookie/storage disclosure | YES | "Cookies and local storage" section with specific storage purposes |
| Tracking/advertising | YES | "Tracking and advertising" section explicitly states no behavioral-advertising pixels or third-party analytics |
| Children's data | YES | "Policy history and eligibility" section: 18+ launch eligibility |

### Gaps

1. **No explicit international data transfer mechanism** — GDPR Art. 46 SCCs or adequacy decision not referenced.
2. **No explicit legal basis for processing** — GDPR Art. 6 legal bases not enumerated.
3. **No explicit DPO or EU representative** — required for GDPR if processing EU residents' data.
4. **No explicit data breach notification timeline** — GDPR requires 72-hour notification; no timeline stated.

---

## 3. AI Disclosure — PARTIAL

### What Exists

- Terms "Interpretive limits" section: AI uses "symbolic interpretive frameworks, not scientifically verified psychological measurements"
- Terms: "does not diagnose, predict, establish hidden motives, or determine what another person feels"
- Terms: "does not replace medical, mental-health, legal, financial, emergency, or other qualified professional support"
- Privacy Policy: "AI requests and answers" section explains what is/isn't sent to the model
- Safety boundary doc: comprehensive AI safety rules (internal)

### What's Missing

1. **No standalone AI disclosure page** — a dedicated `/ai-disclosure` or `/ai-usage` page that explains in plain language what the AI does and doesn't do.
2. **No explicit "AI-generated content" notice in the workspace** — users should see a clear notice that responses are AI-generated and may contain errors.
3. **No explicit "no professional advice" disclaimer in the answer surface** — the safety layer prevents diagnosis but there's no user-visible disclaimer text.
4. **No explicit "no guaranteed outcomes" statement** — users should understand that reflection does not guarantee specific results.

---

## 4. Refund Policy — NOT PRESENT

### What Exists

- Terms "Billing and cancellation": "Ending Sovereign+ returns paid features to Free without deleting your workspace"
- Stripe portal for subscription management
- Cancellation flow in code

### What's Missing

1. **No explicit refund policy** — no statement about whether subscriptions are refundable, pro-rated, or non-refundable.
2. **No money-back guarantee or trial period disclosure** — if there is one, it's not documented; if there isn't, that should be stated.
3. **No proration policy** — what happens when upgrading/downgrading mid-cycle.

---

## 5. Acceptable Use Policy — NOT PRESENT (as standalone document)

### What Exists (scattered)

- SECURITY.md: safe research boundaries (do not access others' data, do not degrade availability, do not social engineer)
- Terms: "interpretive limits" (no diagnosis/prediction)
- Privacy: "no behavioral-advertising pixels"

### What's Missing

A standalone Acceptable Use Policy covering:

1. **Automated access / scraping** — rate limits, bot policy
2. **Reverse engineering** — explicit prohibition
3. **Illegal use** — jurisdictional compliance
4. **Account misuse** — sharing credentials, impersonation
5. **Content restrictions** — what users may not submit
6. **Enforcement** — suspension/termination for violations

---

## 6. Summary & Priority Actions

| Priority | Gap | Risk | Action |
|---|---|---|---|
| HIGH | No limitation of liability clause | Legal exposure | Add to Terms |
| HIGH | No explicit IP ownership clause | Ownership ambiguity | Add to Terms |
| HIGH | No standalone AI disclosure | User misunderstanding | Create /ai-disclosure page |
| HIGH | No refund policy | Consumer protection risk | Add to Terms or create separate page |
| MEDIUM | No acceptable use policy | Abuse/enforcement gap | Create standalone AUP |
| MEDIUM | No international data transfer mechanism | GDPR risk if EU users | Add to Privacy Policy or create SCCs |
| MEDIUM | No governing law / dispute resolution | Jurisdictional ambiguity | Add to Terms |
| MEDIUM | No explicit indemnification | Liability gap | Add to Terms |
| LOW | No DPO/EU representative | GDPR formality | Assess if EU users are expected |
| LOW | No data breach notification timeline | GDPR formality | Add to Privacy Policy |

---

**Note:** This matrix is an operational inventory. All legal documents should be reviewed by qualified counsel before any material change or if the product faces regulatory scrutiny.
