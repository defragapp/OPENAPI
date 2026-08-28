# Terms of Service Review

Status: Terms of Service gap analysis and required clauses

Reviewed: 2026-08-28

This document reviews the current Terms of Service against required clauses for a legitimate public product and identifies gaps that must be addressed.

## Current state

The Terms of Service exist and are presented at signup with:
- Version tracking (`POLICY_METADATA.terms.version`)
- Canonical content hash (`POLICY_CONTENT_HASH`)
- Append-only acceptance receipts with release SHA
- Material change re-presentation requirement

## Required clause analysis

### 1. Limitation of liability

**Required**: YES
**Current state**: MISSING

The Terms should include:
- Cap on total liability (e.g., amount paid in prior 12 months or $100)
- Exclusion of indirect, incidental, consequential, punitive damages
- Exclusion of damages for loss of profits, data, goodwill
- "AS IS" and "AS AVAILABLE" disclaimer
- Acknowledgment that AI output is interpretive, not guaranteed

**Recommended language**:
> TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOVEREIGN.OS IS PROVIDED "AS IS" AND "AS AVAILABLE." IN NO EVENT SHALL SOVEREIGN.OS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PRIOR 12 MONTHS OR $100, WHICHEVER IS GREATER.

### 2. AI disclaimer

**Required**: YES
**Current state**: PARTIAL (safety layer enforces prohibitions, but Terms should explicitly state)

The Terms should include:
- Sovereign.OS is a reflective tool, not a medical device
- Not a substitute for professional medical advice
- Not a psychological evaluation or diagnosis
- Not a prediction of future behavior
- AI output may be incomplete, uncertain, or incorrect
- User is responsible for decisions made based on AI output

**Recommended language**:
> Sovereign.OS is a reflective personal AI tool. It is not a medical device, not a substitute for professional medical or psychological advice, not a psychological evaluation, and not a prediction of future behavior. AI output is interpretive and may be incomplete, uncertain, or incorrect. You are responsible for decisions you make based on Sovereign.OS output. If you are in crisis, contact appropriate professional services.

### 3. No guarantees

**Required**: YES
**Current state**: MISSING

The Terms should include:
- No guarantee of accuracy, completeness, or reliability
- No guarantee of uninterrupted service
- No guarantee that AI output will meet user expectations
- Baseline and intelligence are interpretive references, not facts

### 4. No professional advice

**Required**: YES
**Current state**: MISSING

The Terms should include:
- Not medical advice
- Not psychological advice or diagnosis
- Not legal advice
- Not financial advice
- Not a substitute for professional consultation

### 5. User responsibility

**Required**: YES
**Current state**: MISSING

The Terms should include:
- User is responsible for their account
- User is responsible for content they provide
- User is responsible for decisions based on AI output
- User must be 18+ (already enforced at signup)
- User must not misuse the service

### 6. User content

**Required**: YES
**Current state**: MISSING

The Terms should define:
- **Ownership**: User retains ownership of content they provide (birth data, questions, corrections)
- **License**: User grants Sovereign.OS a limited license to process content for the purpose of providing the service
- **Restrictions**: User may not submit content that is illegal, infringing, or abusive
- **Moderation**: Sovereign.OS reserves the right to refuse service for abusive use
- **Deletion**: User can delete their content via account deletion

### 7. Account rules

**Required**: YES
**Current state**: PARTIAL (18+ gate exists; account mechanics implemented)

The Terms should define:
- **Misuse**: Attempting to circumvent security, abusing AI, attempting to extract restricted content
- **Abuse**: Harassment, hate speech, illegal content
- **Fraud**: False payment information, account takeover attempts
- **Termination**: Sovereign.OS may terminate accounts for violation of Terms
- **Effect of termination**: Access revoked; data subject to deletion policy

### 8. Governing law and dispute resolution

**Required**: YES
**Current state**: MISSING

The Terms should include:
- Governing law jurisdiction (e.g., state of operator's residence)
- Dispute resolution mechanism (arbitration clause or court jurisdiction)
- Class action waiver (if applicable)
- Statute of limitations for claims

### 9. Intellectual property

**Required**: YES
**Current state**: MISSING

The Terms should include:
- Sovereign.OS owns all rights to the service, software, algorithms, and frameworks
- User does not acquire any IP rights in the service
- Feedback/suggestions become Sovereign.OS property (or licensed)
- Trademark ownership of Sovereign.OS, Baseline Design, etc.

### 10. Refund policy

**Required**: YES (for consumer protection)
**Current state**: MISSING

The Terms should include:
- Free tier: no payment, no refund needed
- Paid tier: refund policy (e.g., pro-rated within billing period, or no refund after period start)
- Cancellation: subscription cancels at period end; no partial refunds
- Disputes: contact email for billing disputes

### 11. Service modifications

**Required**: Recommended
**Current state**: MISSING

The Terms should include:
- Right to modify or discontinue features
- Right to change pricing with notice
- Material changes require policy re-acceptance (already implemented)

### 12. Severability and waiver

**Required**: Recommended
**Current state**: MISSING

Standard boilerplate:
- If any provision is unenforceable, remaining provisions survive
- Failure to enforce a provision is not a waiver

### 13. Entire agreement

**Required**: Recommended
**Current state**: MISSING

Standard boilerplate:
- Terms constitute the entire agreement between user and Sovereign.OS
- Supersede prior agreements

## Priority actions

| Priority | Clause | Risk if missing |
| --- | --- | --- |
| 1 | Limitation of liability | Unlimited liability exposure |
| 2 | AI disclaimer | Liability for AI output decisions |
| 3 | Governing law | No defined dispute resolution |
| 4 | IP ownership | Unclear ownership of platform |
| 5 | Refund policy | Consumer protection exposure |
| 6 | User content | Unclear license/ownership |
| 7 | Account termination | No basis for account removal |
| 8 | No guarantees | Implied warranty exposure |

## Implementation

These clauses must be added to the Terms of Service document. When added:
1. Update `POLICY_METADATA.terms.version`
2. Recompute `POLICY_CONTENT_HASH`
3. All existing users must re-accept (workspace re-presentation)
4. New users accept at signup

## Source evidence

- `config/policies.ts` — policy configuration
- `apps/sovereign-worker/src/privacy-rights.ts` — policy acceptance
- `docs/product-language-system.md` — product claims
- `apps/sovereign-worker/src/agent/safety.ts` — AI safety (complementary to Terms disclaimer)
