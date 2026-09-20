---
id: WS-18-b52wnx
type: workstream
workstream: WS-18-b52wnx
slug: validator-whole-file-rereads
title: "fc-validate's accuracy check re-reads whole files instead of the cited line range"
status: dropped
notes: "Benchmark flowcharge-benchmarks/runs/2026-09-20-card-last-touched-badge-v5 found the validate-stage effect mixed (-3.6% tokens, +5.2% time), well short of the hypothesized 4-6% saving; not merged. Work is complete on branch feature/WS-18-b52wnx-validator-whole-file-rereads; flip status back to resume and merge."
tags: [prompts, correctness, quality, feature]
created: 2026-09-17
updated: 2026-09-20
author: Anthony Koukoullis
depends_on: []
links: []
---
fc-validate's Accuracy check, which only needs a cited file:line and its line range, instead re-reads whole files end to end.

## The reviewing subagent's exact words

"Stop the validator re-reading whole files. Impact: 4-6% of total run."

Files: `skills/fc-validate/SKILL.md` section 2 (the Accuracy class) and `skills/flowcharge/templates/validate-plan-and-tasks.md`.

## Full reasoning

"The Accuracy class only requires this check: 'A cited `file:line` that does not hold what the artefact says it holds.' That needs the cited line range. The candidate-lite validator instead ran `cat -n src/lib/projects.ts`, `cat -n src/http/routes-projects.ts | sed -n '1,190p'`, plus whole-file reads of `styles.css`, `home.ts`, `ARCHITECTURE.md` and both test files — 27 Bash calls, about 15 of them full re-reads. The validator cost 406s and 476s, which is 22-32% of Phase A. Change: state that an anchor check reads the cited range plus a small margin, never the whole file."

Confidence: HYPOTHESIS — the reviewing subagent explicitly flagged this is not yet benchmark-confirmed, only inferred from the observed re-read pattern.

Cross-cutting context from the same review: reaching a 50 percent total reduction is not realistic while validation runs at full strength. Stacking this item with Items 2 and 5 gets to roughly 38 percent off baseline; adding Item 4 gets to roughly 43 percent. Reaching 50 percent appears to need `validate: off` combined with Items 2 and 5 — "the only path in the data" to that target.
