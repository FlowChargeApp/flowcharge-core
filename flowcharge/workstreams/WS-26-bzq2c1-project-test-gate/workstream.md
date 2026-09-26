---
id: WS-26-bzq2c1
type: workstream
workstream: WS-26-bzq2c1
slug: project-test-gate
title: "Project test gate replaces the full-suite ban in task lists"
status: done
tags: [checks, quality, skills, feature]
created: 2026-09-24
updated: 2026-09-26
author: Anthony Koukoullis
depends_on: []
links: []
---
Every task list ends with a fixed test gate that runs the project's own suites; failures become recorded issues and tasks in the same workstream.

## Problem

FlowCharge Core's rules forbid any full-suite run and leave no pipeline stage owning it:

- `skills/fc-task-list/SKILL.md` line 272 says "Never add a test-suite or build command as a verify step ... running a suite is the user's own step after execution", and line 330 (Verify tiers, Forbidden) bans "A full test suite, a full build".
- `skills/flowcharge/templates/execute-parent-task.md` line 26 says "Skip any step that runs a full test suite or a full build, even when the task lists one."
- `skills/flowcharge/templates/plan-and-tasks.md` line 69 and `issues-and-tasks.md` line 52 say "never a full test suite or build".
- `skills/fc-validate/SKILL.md` lines 159-164 say "The executor runs them after the change lands", which contradicts the executor template.
- `skills/flowcharge/SKILL.md` commit stage (about lines 399-404) runs no tests.
- `skills/flowcharge/scripts/test/run-tests.mjs` line 4919 pins the phrase "Never add a test-suite or build command" to `fc-task-list/SKILL.md`.

The failure case: in the 2026-09-23 benchmark (`flowcharge-benchmarks/runs/2026-09-23-multi-stage-feature-self-benchmark-v2`), two arms obeyed the ban and shipped a regression that the project's own e2e suite catches. The arms that caught it ran the suite against these rules. The fix must be a model-agnostic, structural mechanism, not something that depends on a capable model acting on its own initiative, and it must stay general-purpose across projects and harnesses.

## Settled design

1. The task-list author records the project's own suite commands in a new task-list frontmatter key, read from `package.json` scripts, a Makefile, CI config or equivalent, never invented. Record every suite the project defines (for example unit and e2e), not one command. An empty list means the project has no suite.
2. Every task list ends with one fixed, boilerplate final task: the test gate. The author adds it as written, without predicting any edit. It is a gate, not a change detector, so it is exempt from "Measure before you write" (the rule that a verify step must fail at `base_commit`) and from the Forbidden tier. The ordinary per-task verify rules and Verify tiers stay unchanged for every other task.
3. The executor runs the gate task's recorded commands after all other tasks. With an empty command list the gate reports NOT CHECKED, never a pass.
4. The executor does not fix a gate failure inline. Each failure is recorded as an issue in a new issue list in the same workstream; the orchestrator runs the existing issues-and-tasks stage for those issues, executes the resulting tasks on the same branch, then runs the gate again. No fix goes in unrecorded.
5. A task list authored to fix gate failures does not carry its own gate. It ends with one task that re-runs only the failing checks (or the full recorded command if they cannot run alone), and control returns to the outer gate.
6. A failure that also fails at `base_commit` is recorded as an issue but does not block the run.
7. The record-and-fix loop halts after 2 fix rounds and reports to the user.
8. One owner runs the suite: the gate task. Remove the "user's own step" wording, fix fc-validate's "The executor runs them" sentence, and change the executor template's skip rule so every file names the gate as the one place a suite runs. Update the pinned phrase in `run-tests.mjs` to match.
9. `fc-index.mjs --check` refuses a task list at `status: done` that has no passed gate record (or a NOT CHECKED record where the frontmatter command list is empty), with a matching test in `run-tests.mjs`.
10. Out of scope: any `ARCHITECTURE.md` review task, a git pre-commit hook, and running the suite per parent task.

Files expected to change: `skills/fc-task-list/SKILL.md`, `skills/flowcharge/templates/execute-parent-task.md`, `skills/flowcharge/SKILL.md`, `skills/flowcharge/templates/plan-and-tasks.md`, `skills/flowcharge/templates/issues-and-tasks.md`, `skills/fc-validate/SKILL.md`, `skills/flowcharge/CONVENTIONS.md`, `skills/flowcharge/scripts/fc-index.mjs`, `skills/flowcharge/scripts/test/run-tests.mjs`.
