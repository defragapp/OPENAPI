# Sovereign.OS safety resource catalog

**Catalog version:** `safety-resources.2026-07-31.1`  
**Reviewed:** July 31, 2026

This catalog is server-owned. The AI model cannot create, select, rename, or alter its entries. Resources are attached only to deterministic `supportive_resources`, `urgent`, and `emergency` responses. Grounded responses and secure refusals do not receive crisis-resource cards.

The current interface does not infer a visitor's country or claim that a specific number is local. It presents reviewed cards with explicit region labels so the user can choose the service that matches where they are. Local emergency services remain the instruction when immediate danger or a medical emergency is present.

## Reviewed entries

### United States and participating territories

- **Service:** 988 Suicide & Crisis Lifeline
- **Actions:** call `988`, text `988`, or use the official help page
- **Official source:** `https://988lifeline.org/get-help/`
- **Product wording:** free, confidential support available 24 hours a day

### Canada

- **Service:** 9-8-8 Suicide Crisis Helpline
- **Actions:** call or text `988`, or use the official site
- **Official source:** `https://988.ca/`
- **Product wording:** crisis support available 24 hours a day, every day of the year

### Australia

- **Service:** Lifeline
- **Actions:** call `13 11 14`, text `0477 13 11 14`, or use the official help page
- **Official source:** `https://www.lifeline.org.au/get-help/`
- **Product wording:** confidential crisis support available at any time

### United Kingdom and Ireland

- **Service:** Samaritans
- **Actions:** call `116 123` or use the official contact page
- **Official source:** `https://www.samaritans.org/how-we-can-help/contact-samaritan/talk-us-phone/`
- **Product wording:** free one-to-one listening support, day or night

## Interface rules

1. Display resource cards only when validated `sovereign-safety-response.v1` metadata is present.
2. Never infer a safety state from answer wording or a headline.
3. Suppress ordinary Basis evidence, continuation actions, plan prompts, saving, correction controls, and Covenant actions on safety-specific responses.
4. Keep resource actions keyboard accessible with a minimum 44-pixel target.
5. Use only `tel:`, `sms:`, or reviewed `https://` actions.
6. Keep the catalog version visible in the response metadata and release gate.
7. Update entries only after reviewing the official service source and incrementing the catalog version.

## Release evidence

The Cloudflare exact-SHA build runs `pnpm verify:safety-release` before typecheck, tests, and production build. The gate rejects:

- missing deterministic categories;
- safety execution after entitlements, Gateway resolution, or AI-turn reservation;
- hard-coded headline inference;
- missing resource links or catalog version;
- ordinary controls remaining visible on safety responses;
- missing multilingual, obfuscation, cross-account, and high-risk regression fixtures.
