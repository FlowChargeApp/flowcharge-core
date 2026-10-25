---
id: PLN-26-4hmfwm
type: plan
workstream: WS-30-nw2tqo
slug: tick-subtask-when-passed
title: "Tick each subtask checkbox as soon as it passes"
status: ready
created: 2026-10-25
updated: 2026-10-25
author: Anthony Koukoullis
base_commit: 01a57d2
depends_on: []
links: []
---

# Tick each subtask checkbox as soon as it passes

## Summary

- **Problem:** `templates/execute-parent-task.md` writes the task list once per parent task, so a reader that counts checkboxes sees no progress for the whole parent task and then a jump.
- **For:** anyone or anything that reads the task list file during a run.
- **Success:** after each subtask passes, the file on disk shows that subtask ticked and its parent unticked; the parent is ticked after the last subtask.
- **Approach:** the stage file defines one edit per subtask, one edit for the parent, and a re-run rule; the changelog records the change.
- **Top risk:** a re-run after an abort re-executes subtasks that already passed; Stage 1 defines the skip rule.

## Scope

Acceptance criteria:

1. (Must) The stage file says: when a subtask passes its checklist, one edit ticks its checkbox, records its `self_eval` and bumps `updated`, before the next subtask starts.
2. (Must) The stage file says a parent task with children is ticked only after every child is ticked, in its own edit.
3. (Must) The stage file says an aborted or still-failing subtask stays unticked, its parent stays unticked, and children that already passed stay ticked.
4. (Must) The stage file defines a re-run of a parent task with children: a ticked subtask is skipped and reported as already applied, only unticked subtasks run, a parent whose children are all ticked gets its tick only, and a ticked parent changes nothing.
5. (Must) A task with no children, the test-run task and its recorded result are written and re-run as before.
6. (Must) No statement of a once-per-parent-task write rule remains in `skills/`. The fc-task-list skill states none, and its rules already agree: a task is ticked only when its `self_eval` passes, and a parent when all its subtasks are complete. It gains no copy of the stage file's rule, because DEVELOPMENT.md keeps a rule in the stage file or in the skill that stage file loads, never in both.
7. (Must) `CHANGELOG.md` carries an entry under `## Unreleased`.
8. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes, with one case that pins the stage file wording and one case that simulates a parent with three children through five on-disk states: no tick, each child ticked in turn with the parent unticked, then the parent ticked. At each state the case asserts 4 lines matching `- [ ] N.` or `- [x] N.`, the ticked count (0, 1, 2, 3, then 4) and the index figure (0/3, 1/3, 2/3, 3/3, then 3/3). The run's report states these counts for each step.

Out of scope: the application that reads the checkboxes; the file format (`[x]` still means passed); `fc-index.mjs`, which already counts each ticked child (its progress figure counts child tasks, and its close rule waits for every task line, the parent's included); `flowcharge/SKILL.md`, `CONVENTIONS.md`, `fc-validate` and `fc-task-list`, none of which states the rule; the `0.5.1` entry in `CHANGELOG.md`, which records the old rule as released history; the suite version stamps and the version number, which a release decides (VERSIONING.md).

Assumptions:

- A parent task with children carries no `self_eval` (fc-task-list, Three task types), so its tick depends on its children alone. A task with no children keeps its own `self_eval`.
- The orchestrator's lease refresh before each child task needs no change.
- The Operations table row in `flowcharge/SKILL.md` that reads "once per parent task" says how often the stage file runs, not how often it writes, and stays.
- The fc-task-list test-run rule, which takes a run as the baseline run while no other top-level task is checked, needs no change: the orchestrator runs the baseline before the first parent task, so no subtask is ticked when it runs.

## Design

- `skills/flowcharge/templates/execute-parent-task.md`: the two bullets that set `self_eval.passed` and write the file become a per-subtask rule and a parent rule; one bullet is added for the re-run. No new slot.
- `CHANGELOG.md`: a `## Unreleased` section with a `### Changed` entry.
- `skills/flowcharge/scripts/test/run-tests.mjs`: two cases, one reading the stage file, one building a parent with three children at five tick states.

## Stages

### Stage 1: per-subtask tick in the stage file

- **Goal:** the stage file carries criteria 1 to 5, and criterion 6 holds once its old bullet is gone.
- **Position:** first, because every other change points at it.
- **Observable:** the stage file holds the per-subtask edit rule, the parent rule and the re-run rule, and no file under `skills/` holds once-per-parent-task wording.

### Stage 2: record the change

- **Goal:** criterion 7.
- **Position:** second; it describes Stage 1's rule.
- **Observable:** the changelog lists the change under `## Unreleased`.

## Testing strategy

One case pins the stage file wording. One case pins the task-line counts and the index figure at each of five on-disk states. The full suite runs in the test-run task.

## Alternatives considered and rejected

- Keep one write per parent task and add a progress file: the readers already read the task list, and a second file adds a second source of truth.
- Tick subtasks in batches of N: it keeps a delay and adds a counter to the rule.
