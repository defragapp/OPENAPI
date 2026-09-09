# MindWave global visual contract (owner-approved)

Owner decision (2026-09-09): the MindWave Framer template
(`https://slight-use-623506.framer.app/`,
`https://www.framer.com/marketplace/templates/mindwave/`) is the visual
design standard applied GLOBALLY and consistently through the platform —
every page, every surface.

This document supersedes the conflicting founder near-black/cream lock for
visual purposes. Product language authority remains
`docs/product-language-system.md`. Intelligence/behavior authority remains
`docs/inner-recognition-intelligence.md`. No mock auth, canned answers, fake
billing/consent, or required video workflow is imported — visual system only.

## MindWave tokens (global)

Light, soft, calming SaaS:

- page: `#f7f5f1` (warm off-white), section alt `#ffffff`
- ink: `#1c1a17`, muted `#6b645b`, faint `#a39b8f`
- line: `rgba(28,26,23,.10)`, line-strong `rgba(28,26,23,.18)`
- card: `#ffffff`, card tint `#fbf9f6`
- accent (primary CTA pill): `#1c1a17` (dark pill, cream text)
- accent soft: `#e9e2d6` (secondary pill / chip fill)
- sage calm: `#7d8b7a` (success / calm markers only)
- radius: card 24px, pill 999px, input 16px
- section spacing: 112px desktop / 72px mobile; container 1200px
- shadow: `0 20px 50px rgba(28,26,23,.08)`

Implemented as `--mw-*` tokens in `apps/web/src/design-system.css` alongside
(not destroying) legacy `--sov-*` tokens. All surfaces bind to `--mw-*` via
the global `[data-visual-system="mindwave"]` scope plus base body defaults.

## Global application

- Every route sets `data-visual-system="mindwave"`: `/`, `/how-it-works`,
  `/pricing`, `/faq`, `/privacy`, `/terms`, login/signup/redeem/invitation,
  onboarding, account, and the authenticated workspace
  (`Today, Explore, People, Systems, Library, You` +
  `SovereignIntelligenceWorkspace` thread).
- Shared components are the standard: MindWave nav, footer, buttons
  (`PrimaryButton`), cards (`GlassCard`), pills (`PillBadge`), FAQ accordion,
  pricing/testimonial/CTA sections.
- Typography stays self-hosted Geist Sans via existing `--font-*` tokens.
- CSS import order in `apps/web/src/main.tsx` is unchanged; no stylesheet
  loads after `passkey-auth.css`. MindWave globals live inside the existing
  consolidated sheets.
- Motion: soft fade/rise + marquee + accordion; never gates comprehension.
- Third-party template credit (`Made by Thanh Tran`) is removed, not shipped.

## Acceptance

- Desktop + iPhone human visual acceptance required.
- `pnpm typecheck`, `pnpm test`, `pnpm build` green.
