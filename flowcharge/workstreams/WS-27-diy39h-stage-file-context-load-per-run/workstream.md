---
id: WS-27-diy39h
type: workstream
workstream: WS-27-diy39h
slug: stage-file-context-load-per-run
title: "Stage files load their full text into context on every run"
status: backlog
tags: [prompts, skills, orchestration, feature]
created: 2026-10-02
updated: 2026-10-03
author: Anthony Koukoullis
depends_on: []
links: []
---
Every run reads the full task-list, plan, validate and git skills, CONVENTIONS.md and two templates into context, and every later turn carries them; cut what a stage must read.

Each session loads the stage files it needs into context once, and every later turn of that session carries them, so the cost grows with the size of the files and the number of turns. A run split across fresh sessions pays it again in each. The largest files read are the task-list, plan, validate and git skill files, CONVENTIONS.md, and the plan-and-tasks and execute-parent-task templates. The instruction files grew slightly in the last wording pass, so this workstream is the one that must reduce instruction size.

## Changes to evaluate

1. Split each large stage file into a short core and sections that load on demand, so a stage reads only what it needs.
2. Trim prose in those files without changing a rule.
3. A few files are read two or three times inside one session. Check whether the extra reads are needed. Check the orchestrator's hard rule 1 (`skills/flowcharge/SKILL.md`, Hard rules) first, because it exists to stop stale cached skill text.

## What must not change

- Every rule, constraint and nuance in those files stays exactly as effective.
- The keep list stays: rejected alternatives with reasons in every plan; issue records with reproduction steps, the actual result and the fix; a failure recorded against the sub-task where it happened; verify commands and the measured result of each; every commit citing artefact IDs; the plan's numbered acceptance criteria.
- The portability rules in DEVELOPMENT.md hold, and the single-copy and pointer-resolution test cases in `skills/flowcharge/scripts/test/run-tests.mjs` still hold.
- `node skills/flowcharge/scripts/test/run-tests.mjs` passes every case.

## How success is measured

Measure before and after on the same sample: the size of the files a stage reads and the number of reads per run.
