# Sovereign.OS Namespace Authority

## Product Brand
**Sovereign.OS** (Internal lenses: Defrag, Alignment, Covenant; Single Agent: Sovereign)

---

## Verified Controlled Web Domains
- **`https://sovereign.defrag.app`**
  - **Zone:** `defrag.app` (Cloudflare Account: `8b1954d216d65077c6480d62583fe2c2`)
  - **Nameservers:** Cloudflare Authoritative Nameservers
  - **Purpose:** Public Sovereign.OS landing, documentation, and marketing pages.
  - **Status:** Verified live, TLS valid, routed to Worker `sovv-web`.

- **`https://defrag.app`** / **`https://www.defrag.app`**
  - **Zone:** `defrag.app` (Cloudflare Account: `8b1954d216d65077c6480d62583fe2c2`)
  - **Purpose:** Parent domain with certified 308 permanent redirect to `https://sovereign.defrag.app`.
  - **Status:** Verified live and active.

---

## Verified Production App Domain
- **`https://app.defrag.app`**
  - **Zone:** `defrag.app` (Cloudflare Account: `8b1954d216d65077c6480d62583fe2c2`)
  - **Purpose:** Authenticated application runtime, `/auth/*`, `/ready`, `/health`, and API endpoints.
  - **Status:** Verified live, TLS valid, routed to Worker `sovv-web`.

---

## Verified Transactional Email Domain
- **Public Contact Identity:** `info@sovereign.os` (`PUBLIC_CONTACT_EMAIL`). Identity/configuration and runtime metadata only; the `sovereign.os` zone is not resolvable at the DNS root, so this address is never a mail routing target (from, reply-to, or mailto).
- **Sender Identity:** `Sovereign.OS <info@sovereign.defrag.app>` (or `info@sovereign.defrag.app`)
- **Reply-To:** `info@sovereign.defrag.app` (`TRANSACTIONAL_REPLY_TO_EMAIL`; deliverable operational inbox)
- **Inbound / Contact:** `info@sovereign.defrag.app`
- **Resend Domain Status:** `defrag.app` is **Verified** with **Sending: Enabled** in the connected Resend production account. The branded subdomain `sovereign.defrag.app` is the transactional from-domain and must be verified in Resend (SPF/DKIM/DMARC) before the new sender address is exercised in production.
- **Forwarding:** Inbound/contact mail to `info@sovereign.defrag.app` is a private control-plane destination (Cloudflare Email Routing resolves the address on the owned `defrag.app` zone); the personal delivery mailbox must never appear in repository sources or public surfaces.
- **Status:** Verified live in the production email pipeline; user-facing sender name is always `Sovereign.OS`.

---

## Invalid / Rejected Namespace Assumptions

### 1. `sovereign.os`
- **Status:** **INVALID AS PUBLIC PRODUCTION DOMAIN**
- **Authoritative DNS Root Evidence:** IANA WHOIS and root-servers.net query confirm that `.os` is not delegated in the public DNS root zone (query for `os` returns 0 objects; root servers respond with NSEC showing `.os` does not exist).
- **Technical Implication:** `sovereign.os` cannot resolve publicly, receive MX records, pass DKIM/SPF/DMARC checks, or be verified by Resend.

### 2. `sovereign.app` & `app.sovereign.app`
- **Status:** **UNCONTROLLED / CONFLICTING EXTERNAL PRODUCT**
- **Evidence:** `sovereign.app` is not an active zone in the project owner's Cloudflare account (`8b1954d216d65077c6480d62583fe2c2`). Authoritative nameservers point to Namecheap (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`), A records resolve to Webflow hosting (`199.60.103.57`, `199.60.103.157`), and the domain serves an unrelated active product ("Sovereign App Group, Inc. - Your Bitcoin. Your freedom. Together.").
- **Technical Implication:** The project owner does not control this domain in Cloudflare. It cannot be bound or pointed without independent external acquisition/transfer.

---

## sovereign.app Ownership/Conflict Finding
An earlier assumption that `sovereign.app` was an unallocated domain parked at Namecheap ready for nameserver migration to Cloudflare has been disproven. `sovereign.app` actively resolves to an external commercial Bitcoin product. Attempting to hijack or point `sovereign.app` or `app.sovereign.app` would fail and cause immediate routing failures and brand collisions.

---

## .os Root-Zone Finding
The string `.os` in "Sovereign.OS" represents the product brand naming convention, not a valid Top-Level Domain (TLD). No TLD named `os` exists in the IANA root database (re-confirmed 2026-08-29: NXDOMAIN for `os.` at the DNS root on Cloudflare, Google, and Quad9 resolvers). Deriving mail routing (from, reply-to, mailto) from the brand string remains prohibited. Decision recorded 2026-08-29: `info@sovereign.os` is adopted strictly as the public contact identity string (`PUBLIC_CONTACT_EMAIL` configuration and runtime metadata) with enforced operational separation — transactional sender, reply-to, support, and security inbound remain on the deliverable `info@sovereign.defrag.app` monitored inbox, and `scripts/verify-public-contact.mjs` fails closed on any routable use of the identity address.

---

## PR #200 Disposition
- **Classification:** **SUPERSEDED / MUST BE CLOSED**
- **Reason:** Draft PR #200 attempted to migrate the entire public, application, and mail namespace to `sovereign.app` and `sovereign.os`. Because `.os` is non-existent and `sovereign.app` is an external third-party domain, PR #200 is technically non-viable and cannot be merged.
- **Action:** PR #200 should be closed with this report cited as technical rationale.

---

## Recommended Release Authority
1. **Brand Identity:** Preserve `Sovereign.OS` across all UI, typography, metadata, and product copy.
2. **Web & App Authority:** Use the verified owner-controlled `defrag.app` infrastructure:
   - Public Landing: `https://sovereign.defrag.app`
   - Canonical Redirects: `https://defrag.app` and `https://www.defrag.app` → `https://sovereign.defrag.app`
   - Authenticated App & API: `https://app.defrag.app`
3. **Email Authority:**
   - Outbound: `Sovereign.OS <info@sovereign.defrag.app>`
   - Contact / Inbound: `info@sovereign.defrag.app`
   - Resend Domain: `sovereign.defrag.app` (branded subdomain; parent `defrag.app` verified and active).
