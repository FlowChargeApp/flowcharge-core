---
id: WS-20-f1416h
type: workstream
workstream: WS-20-f1416h
slug: task-decomposition-numeric-cap
title: "Project-wide lint, type-check and test commands are authored into every task and executed where they cannot fail"
status: in-progress
tags: [schema, prompts, conventions, generator, feature]
created: 2026-09-17
updated: 2026-09-19
author: Anthony Koukoullis
depends_on: []
links: []
---
Every task's `verify` block carries project-wide commands (lint, type-check, test suite) that assert nothing about that task and pass at `base_commit` regardless.

Those commands are executed against code where no task has been applied, so they pass by construction.

## The problem

`skills/flowcharge/templates/plan-and-tasks-spec.md`, Part 2, instructs the authoring subagent to add the project's lint, type-check, build or test commands to each task as verify steps. Every task in a list therefore carries the same project-wide command.

`skills/fc-validate/SKILL.md` Part 3 admits those commands in its runnable class and executes each task's verify steps at `base_commit`. At that point no task has been applied, so a project-wide command returns a pass regardless of the task it belongs to. The same file's judgment section already states that such a pass is expected and is not a defect, so the result is discarded after it is produced.

A tautology finding against a project-wide command is also unactionable. The correction boundary's remedy for a tautological step is a replacement step that fails at `base_commit`, and no rewrite of a lint or test command can fail on unmodified code.

Concretely, in `flowcharge/workstreams/WS-12-zq2ms6-generator-empty-init-mode/TL-8-jxzn3o-tasklist.md`: 10 child tasks, 10 `verify` blocks, and `node skills/flowcharge/scripts/test/run-tests.mjs` present as a line in all 10.

Lint and type-check do catch defects, but only once a change is in place. That is the executor's run, after the change lands. Whether a project has a test suite at all is the user's decision, and running one belongs after execution rather than inside each task.

## Scope

Three changes.

### 1. Stop authoring test-suite and build commands into tasks

File: `skills/flowcharge/templates/plan-and-tasks-spec.md`, Part 2, the paragraph beginning "Prefer the project's own lint, type-check, build, or test commands".

Lint and type-check stay, so the executor still runs them after a change lands. Test suites and builds go.

**Current text:**

> Prefer the project's own lint, type-check, build, or test commands as verify steps alongside the plan's acceptance checks. Discover them from the project's own configuration (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Only when the project has none of its own (no lint config, no typecheck config, no test command), fall back to a project-agnostic illustrative example, naming more than one toolchain rather than singling out one (e.g. `npm run lint` / `npx tsc --noEmit` for a Node project, `ruff` / `mypy` for a Python project, `go vet` for a Go project). Never issue a command against a project whose toolchain does not match it. Avoid slow, heavyweight integration/E2E suites as a task's primary verify step. Where the plan names issue IDs, record them in the task's `issues:` key.

**Replacement text:**

> Add the project's own lint or type-check command as a verify step alongside the plan's acceptance checks, and only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent). Where it has none, add none: never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step. Those assert nothing about the task, they pass before the change as readily as after, and running a suite is the user's own step after execution. Where the plan names issue IDs, record them in the task's `issues:` key.

The illustrative-fallback clause goes, because inventing a command for a project that has none is the behaviour this removes. The E2E clause goes, because it is dead once suites are excluded. The configuration-discovery sources, the toolchain-mismatch prohibition, and the `issues:` key sentence all stay.

### 2. Narrow the validator's runnable command class

File: `skills/fc-validate/SKILL.md`, Part 3, the `### The runnable command class` section.

The `grep` and file-existence class stays. Those are task-specific, and a badly written one can be rewritten to discriminate.

**Current text:**

> ### The runnable command class
>
> Run a `verify` step only when it is one of the project's own fast, side-effect-free
> checks.
>
> Admitted: linting, type-checking, a unit or single-file test run, `grep`, and
> file-existence checks.
>
> Excluded: builds, deploys, package installs, database or network operations, anything
> that needs a service to be up, and anything that writes outside a temporary directory.
>
> In this repository the class admits `node skills/flowcharge/scripts/test/run-tests.mjs`,
> which is the project's own check command.
>
> A step outside the class is reported as **unrun**. You never execute it, and an unrun
> step is neither a pass nor a failure.

**Replacement text:**

> ### The runnable command class
>
> Run a `verify` step only when it asserts something specific to the task's own change:
> a `grep`, a count, a file-existence check, or an equivalent read-only assertion about
> a named file.
>
> Excluded: lint, type-check, test suites, builds, deploys, package installs, database
> or network operations, anything that needs a service to be up, and anything that
> writes outside a temporary directory.
>
> Lint, type-check and test commands are excluded although they are fast and
> side-effect-free. They assert nothing about the task, so they pass at `base_commit`
> as readily as after the change, and a tautology finding against one is unactionable:
> the correction boundary's remedy is a replacement step that fails at `base_commit`,
> and no project-wide command can fail on unmodified code. The executor runs them after
> the change lands, which is where they catch something.
>
> A step outside the class is reported as **unrun**. You never execute it, and an unrun
> step is neither a pass nor a failure.

This also removes the naming of `node skills/flowcharge/scripts/test/run-tests.mjs` as an admitted command.

### 3. Delete the dead clause in the judgment

File: `skills/fc-validate/SKILL.md`, Part 3, `### The judgment`, second bullet.

After change 2 the validator never runs a project-wide lint or test step, so a sentence describing what to do when one passes describes a case that cannot occur.

**Current text:**

> - A task with at least one step that fails at `base_commit` passes this check. A
>   project-wide lint or test step that passes is expected and is not itself a defect.

**Replacement text:**

> - A task with at least one step that fails at `base_commit` passes this check.

The neighbouring bullets do not change. The third bullet already covers the case this creates: a task whose verify steps are all lint or type-check has no runnable step left, so it is reported as **unjudged**, which that bullet already states is not a pass. Nothing passes silently.

## Unchanged

- **The discriminating-assertion rule.** `skills/flowcharge/templates/plan-and-tasks-spec.md`, the "Measure before you write" paragraph, does not change. The authoring subagent still runs every count, file-existence and string assertion at `base_commit` and records what it actually returned.
- **The validator's tautology check.** `skills/fc-validate/SKILL.md` `### The judgment` still flags a task whose entire runnable list passes at `base_commit`. After change 2 that list holds only task-specific assertions, with no always-passing commands mixed in.
- **The accuracy class.** The correction boundary's accuracy corrections (a wrong path, anchor, count or ID, proved by reading the file the artefact itself cites) are not touched. This check catches a brief citing a file that does not exist in the project under work, it applies to plans and issue lists as well as task lists, and it executes no commands.
- **The baseline gate.** The `base_commit` prefix match and the modified-tracked-file condition do not change.
- **The task file format.** No frontmatter key, no numbering scheme and no YAML key changes. Existing task lists need no migration.

## Expected effect

Against a list comparable to `TL-8-jxzn3o-tasklist.md` (10 child tasks): 10 verify lines removed from the authored file, 10 test-suite executions removed from validation, and 10 removed from execution.
