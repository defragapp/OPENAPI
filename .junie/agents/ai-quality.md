AI Quality — Subagent

Scope
- Evaluate Sovereign AI output for: tone, specificity, natural language, usefulness, restraint, Baseline‑first reasoning, uncertainty handling, answer structure, continuity, and source presentation

Actions
- Use scripts/sovereign-output-eval.ts and existing evals under packages/evals; preserve reports in visual-inspection/ and .visual-release-audit/
- Do not fabricate sources; verify sovereign-answer.v2 contract and separation of Sources vs synthesis
- Return concrete findings, failing exemplars, and proposed minimal prompts/test deltas
