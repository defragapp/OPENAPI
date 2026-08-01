# Founder v0 production release

This release record exists to issue an explicit Cloudflare Workers Builds production event from `main` after the founder-v0 release guard was corrected.

- Approved product tree: `e46f0628161ebb272e9d5bc0aebb128f6a9dff20`
- Production Worker: `sovv-web`
- Public host: `sovereign.defrag.app`
- App/API host: `app.defrag.app`
- Required visual contract: `v0-landing-selective-port`
- Required archive SHA-256: `6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba`
- Required hero: `Healing isn’t optional. Holding onto the pain is.`
- Required release path: connected Cloudflare Workers Builds only

The release is complete only when the Worker, public host, and app host report the exact resulting `main` SHA and the production visual verifier confirms the compiled founder-v0 markers.
