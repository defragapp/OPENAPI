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
- **Sender Identity:** `Sovereign.OS <info@defrag.app>` (or `info@defrag.app`)
- **Reply-To:** `info@defrag.app`
- **Inbound / Contact:** `info@defrag.app`
- **Resend Domain Status:** `defrag.app` is **Verified** with **Sending: Enabled** in the connected Resend production account.
- **Status:** Verified live and operational in production email pipeline.

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
The string `.os` in "Sovereign.OS" represents the product brand naming convention, not a valid Top-Level Domain (TLD). No TLD named `os` exists in the IANA root database. Deriving DNS records or email domains (`info@sovereign.os`) from the brand name is a namespace-design defect.

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
   - Outbound: `Sovereign.OS <info@defrag.app>`
   - Contact / Inbound: `info@defrag.app`
   - Resend Domain: `defrag.app` (currently verified and active).
