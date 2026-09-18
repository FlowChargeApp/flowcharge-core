---
id: TL-18-4gc9wg
type: tasklist
workstream: WS-20-f1416h
slug: task-decomposition-numeric-cap
title: "Stop authoring and validating project-wide test/build commands in tasks"
status: ready
mode: diff
base_commit: 52421d2
created: 2026-09-19
updated: 2026-09-19
author: Anthony Koukoullis
depends_on: [PLN-14-rsflea]
links: []
---

# FlowCharge Tasks

## Stop authoring project-wide test/build commands into tasks, and stop validating them

Implements `PLN-14-rsflea`. Four independent one-edit stages, each a standalone
Adult task since none decomposes into more than one file or edit: (1) stop the
authoring subagent from adding test-suite/build commands to a task's `verify` steps
in `skills/flowcharge/templates/plan-and-tasks-spec.md`, keeping lint/type-check;
(2) narrow the validator's runnable command class in `skills/fc-validate/SKILL.md`
to task-specific assertions only, excluding lint/type-check/test/build alike; (3)
delete the now-dead sentence in the validator's judgment section that describes a
project-wide lint-or-test pass as expected; (4) apply the same fix as (1) to
`skills/flowcharge/templates/plan-and-tasks-diff.md`, which carries the identical
paragraph. All four SEARCH blocks were copied from the files as read in this
session at `base_commit` `52421d2`; all `verify` counts below were measured at that
commit.

- [x] 1. Stop authoring test-suite and build commands into tasks
  ```yaml
  description: "Replace the lint/type-check/build/test verify-step guidance in plan-and-tasks-spec.md Part 2 so only lint and type-check remain admitted, and test-suite/build commands are explicitly forbidden."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      File: skills/flowcharge/templates/plan-and-tasks-spec.md

      <<<<<<< SEARCH
      Prefer the project's own lint, type-check, build, or test commands as verify steps alongside the plan's acceptance checks. Discover them from the project's own configuration (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Only when the project has none of its own (no lint config, no typecheck config, no test command), fall back to a project-agnostic illustrative example, naming more than one toolchain rather than singling out one (e.g. `npm run lint` / `npx tsc --noEmit` for a Node project, `ruff` / `mypy` for a Python project, `go vet` for a Go project). Never issue a command against a project whose toolchain does not match it. Avoid slow, heavyweight integration/E2E suites as a task's primary verify step. Where the plan names issue IDs, record them in the task's `issues:` key.
      =======
      Add the project's own lint or type-check command as a verify step alongside the plan's acceptance checks, and only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Where it has none, add none: never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step. Those assert nothing about the task, they pass before the change as readily as after, and running a suite is the user's own step after execution. Where the plan names issue IDs, record them in the task's `issues:` key.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md"
  imports: "None."
  compatibility: "PLN-14-rsflea Stage 1 / AC1. plan-and-tasks-diff.md carries the identical paragraph at its own line 85, now covered by task 4 (Stage 4 / AC6) in this same task list; do not touch it here."
  gotcha: "The SEARCH text is one long unwrapped paragraph line, not multiple lines; match it exactly as one line, including the trailing period before the newline."
  verify:
    - "grep -c \"Prefer the project's own lint, type-check, build, or test commands\" skills/flowcharge/templates/plan-and-tasks-spec.md — measured at base_commit 52421d2: returns 1; must return 0 after this task."
    - "grep -c \"Never add a test-suite or build command as a verify step\" skills/flowcharge/templates/plan-and-tasks-spec.md — measured at base_commit 52421d2: returns 0; must return 1 after this task."
  checklist:
    - "The SEARCH/REPLACE block applied cleanly against the file as it stood at base_commit 52421d2."
    - "The replacement paragraph still ends with the unchanged issues:-key sentence, verbatim."
    - "No other line in the file changed."
    - "The word 'lint' and the phrase 'type-check' both still appear in the replacement paragraph as admitted verify-step commands."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 2. Narrow the validator's runnable command class
  ```yaml
  description: "Replace fc-validate/SKILL.md's `### The runnable command class` section body so it admits only task-specific, read-only assertions and excludes lint/type-check/test/build, dropping the run-tests.mjs example."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      File: skills/fc-validate/SKILL.md

      <<<<<<< SEARCH
      ### The runnable command class

      Run a `verify` step only when it is one of the project's own fast, side-effect-free
      checks.

      Admitted: linting, type-checking, a unit or single-file test run, `grep`, and
      file-existence checks.

      Excluded: builds, deploys, package installs, database or network operations, anything
      that needs a service to be up, and anything that writes outside a temporary directory.

      In this repository the class admits `node skills/flowcharge/scripts/test/run-tests.mjs`,
      which is the project's own check command.

      A step outside the class is reported as **unrun**. You never execute it, and an unrun
      step is neither a pass nor a failure.
      =======
      ### The runnable command class

      Run a `verify` step only when it asserts something specific to the task's own change:
      a `grep`, a count, a file-existence check, or an equivalent read-only assertion about
      a named file.

      Excluded: lint, type-check, test suites, builds, deploys, package installs, database
      or network operations, anything that needs a service to be up, and anything that
      writes outside a temporary directory.

      Lint, type-check and test commands are excluded although they are fast and
      side-effect-free. They assert nothing about the task, so they pass at `base_commit`
      as readily as after the change, and a tautology finding against one is unactionable:
      the correction boundary's remedy is a replacement step that fails at `base_commit`,
      and no project-wide command can fail on unmodified code. The executor runs them after
      the change lands, which is where they catch something.

      A step outside the class is reported as **unrun**. You never execute it, and an unrun
      step is neither a pass nor a failure.
      >>>>>>> REPLACE
  pattern: "skills/fc-validate/SKILL.md"
  imports: "None."
  compatibility: "PLN-14-rsflea Stage 2 / AC2. The following section, ### The judgment, is a separate task (task 3) and is not touched here."
  gotcha: "The following paragraph (\"This class is wider than the class the executor template...\") is immediately below this block and must not be captured by SEARCH or altered; the block above ends cleanly at the 'neither a pass nor a failure.' line."
  verify:
    - "grep -c \"Admitted: linting, type-checking, a unit or single-file test run\" skills/fc-validate/SKILL.md — measured at base_commit 52421d2: returns 1; must return 0 after this task."
    - "grep -c \"run-tests.mjs\" skills/fc-validate/SKILL.md — measured at base_commit 52421d2: returns 1; must return 0 after this task."
    - "grep -c \"Excluded: lint, type-check, test suites, builds\" skills/fc-validate/SKILL.md — measured at base_commit 52421d2: returns 0; must return 1 after this task."
  checklist:
    - "The SEARCH/REPLACE block applied cleanly against the file as it stood at base_commit 52421d2."
    - "The grep/file-existence admission and the builds/deploys/network exclusion both survive in the replacement, alongside the new lint/type-check/test exclusion."
    - "The 'unrun' closing paragraph is present, unchanged, at the end of the replaced section."
    - "The immediately following paragraph referencing execute-parent-task.md is untouched."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 3. Delete the dead clause in the validator's judgment section
  ```yaml
  description: "Shorten the judgment section's second bullet in fc-validate/SKILL.md to drop the now-impossible 'project-wide lint or test step that passes is expected' sentence."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      File: skills/fc-validate/SKILL.md

      <<<<<<< SEARCH
      - A task with at least one step that fails at `base_commit` passes this check. A
        project-wide lint or test step that passes is expected and is not itself a defect.
      =======
      - A task with at least one step that fails at `base_commit` passes this check.
      >>>>>>> REPLACE
  pattern: "skills/fc-validate/SKILL.md"
  imports: "None."
  compatibility: "PLN-14-rsflea Stage 3 / AC3. Depends on task 2 landing first only in the sense that both touch the same file; the two edits are at non-adjacent sections (lines ~131-146 vs ~154-163) and do not overlap or reorder relative to each other, so either order applies cleanly."
  gotcha: "The first and third bullets of the judgment section's three-bullet list are unchanged and must not be re-typed; only the second bullet's trailing sentence is removed."
  verify:
    - "grep -c \"project-wide lint or test step that passes is expected\" skills/fc-validate/SKILL.md — measured at base_commit 52421d2: returns 1; must return 0 after this task."
  checklist:
    - "The SEARCH/REPLACE block applied cleanly against the file as it stood at base_commit 52421d2."
    - "The bullet list under ### The judgment still has exactly three bullets after the edit."
    - "The first bullet (tautology definition) and third bullet (unjudged) are byte-identical to before."
    - "The remaining second bullet still ends with a period and reads as a complete sentence."
  self_eval:
    passed: true
    failures: []
  ```

- [x] 4. Fix the identical paragraph in plan-and-tasks-diff.md
  ```yaml
  description: "Replace the lint/type-check/build/test verify-step guidance in plan-and-tasks-diff.md Part 2 so only lint and type-check remain admitted, and test-suite/build commands are explicitly forbidden -- the same fix task 1 applies to plan-and-tasks-spec.md."
  author: Anthony Koukoullis
  issues: []
  implement:
    - |
      File: skills/flowcharge/templates/plan-and-tasks-diff.md

      <<<<<<< SEARCH
      Prefer the project's own lint, type-check, build, or test commands as verify steps alongside the plan's acceptance checks. Discover them from the project's own configuration (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Only when the project has none of its own (no lint config, no typecheck config, no test command), fall back to a project-agnostic illustrative example, naming more than one toolchain rather than singling out one (e.g. `npm run lint` / `npx tsc --noEmit` for a Node project, `ruff` / `mypy` for a Python project, `go vet` for a Go project). Never issue a command against a project whose toolchain does not match it. Avoid slow, heavyweight integration/E2E suites as a task's primary verify step. Where the plan names issue IDs, record them in the task's `issues:` key.
      =======
      Add the project's own lint or type-check command as a verify step alongside the plan's acceptance checks, and only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Where it has none, add none: never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step. Those assert nothing about the task, they pass before the change as readily as after, and running a suite is the user's own step after execution. Where the plan names issue IDs, record them in the task's `issues:` key.
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md"
  imports: "None."
  compatibility: "PLN-14-rsflea Stage 4 / AC6. Same paragraph and same replacement text as task 1 (Stage 1 / AC1), applied to plan-and-tasks-diff.md instead of plan-and-tasks-spec.md; re-read in this session, the paragraph and its surrounding sentences (the 'open question/assumption' sentence before it, the 'Measure before you write' paragraph after it) are byte-identical in both files, so the replacement text needed no adjustment."
  gotcha: "The SEARCH text is one long unwrapped paragraph line, not multiple lines; match it exactly as one line, including the trailing period before the newline."
  verify:
    - "grep -c \"Prefer the project's own lint, type-check, build, or test commands\" skills/flowcharge/templates/plan-and-tasks-diff.md — measured at base_commit 52421d2: returns 1; must return 0 after this task."
    - "grep -c \"Never add a test-suite or build command as a verify step\" skills/flowcharge/templates/plan-and-tasks-diff.md — measured at base_commit 52421d2: returns 0; must return 1 after this task."
  checklist:
    - "The SEARCH/REPLACE block applied cleanly against the file as it stood at base_commit 52421d2."
    - "The replacement paragraph still ends with the unchanged issues:-key sentence, verbatim."
    - "No other line in the file changed."
    - "The word 'lint' and the phrase 'type-check' both still appear in the replacement paragraph as admitted verify-step commands."
  self_eval:
    passed: true
    failures: []
  ```
