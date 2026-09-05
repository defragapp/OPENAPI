## 2026-09-05T07:33:40Z

You are worker_m1.
Your working directory is /Users/cjo/OPENAPI/.agents/worker_m1/.
Your parent is Project Orchestrator (conversation ID: d98ba1b1-afd7-4a1e-9dd5-16c5d31d2453).

MANDATORY: You MUST read /Users/cjo/OPENAPI/.agents/ORIGINAL_REQUEST.md, /Users/cjo/OPENAPI/PROJECT.md, and /Users/cjo/OPENAPI/.agents/teamwork_preview_explorer_survey_1/handoff.md before beginning work.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You EXCLUSIVELY OWN the following files:
- apps/web/src/PublicLanding.tsx
- apps/web/src/PublicHowItWorks.tsx
- apps/web/src/PublicPricing.tsx
- apps/web/src/PublicFAQ.tsx
- apps/web/src/LandingDemonstrationStage.tsx
- apps/web/src/LandingProductStories.tsx
- apps/web/src/PowderLanding.tsx
- apps/web/src/SovereignIntelligenceWorkspace.tsx
- apps/web/public/how-it-works.html
- apps/web/public/pricing.html
- apps/web/public/faq.html
- apps/sovereign-worker/src/agent/prompt-v1.ts

Your assigned tasks for Milestone 1 (Copy, Tone & Persona Alignment):
1. Standardize strictly around the core brand thesis: "Know yourself. Understand your people. See the whole system." Embed this tripartite framework into page headers/kickers across /how-it-works, /pricing, /faq, /login, /signup, /onboarding, and in the /app workspace arrival greeting in SovereignIntelligenceWorkspace.tsx.
2. In LandingDemonstrationStage.tsx (lines 106-107), eliminate the forbidden robotic greeting "Welcome back" / "How can I help you today?" and replace it with contemplative Sovereign inquiry: "What dynamic is alive for you right now?".
3. In LandingProductStories.tsx (lines 50-52, 124-126), eliminate test chips (U✓, U✓ test-fixture) from customer-facing product story cards.
4. In SovereignIntelligenceWorkspace.tsx (line 570), remove the redundant "Ask something new" button below the recent threads list to preserve clean sidebar anatomy.
5. In PublicHowItWorks.tsx and PublicFAQ.tsx, soften and refocus clinical/medical framing ("diagnosis", "mental-health conditions", "clinical labels") into sovereign reflection and discernment. NOTE: In PublicLanding.tsx line 98 and PowderLanding.tsx line 99, DO NOT alter the founder hero sentence "Healing isn’t optional. Holding onto the pain is." — this is strictly protected by release verifiers.
6. Synchronize copy and structural steps between static HTML files (public/how-it-works.html, public/pricing.html, public/faq.html) and their corresponding React components.
7. Verify that apps/sovereign-worker/src/agent/prompt-v1.ts maintains the singular Sovereign persona with Covenant and Systems as modular reasoning lenses.
8. Verify your work: run `pnpm -r typecheck` and relevant web tests. Ensure 0 errors.
9. Write a detailed handoff report in /Users/cjo/OPENAPI/.agents/worker_m1/handoff.md documenting all modified files, diffs, and verification commands/results.
10. Send a message to parent reporting completion.
