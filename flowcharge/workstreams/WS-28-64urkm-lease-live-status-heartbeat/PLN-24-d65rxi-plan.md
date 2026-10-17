---
id: PLN-24-d65rxi
type: plan
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Leaf-task refresh of the workstream lease"
status: done
created: 2026-10-17
updated: 2026-10-17
author: Anthony Koukoullis
base_commit: e1e391b
depends_on: []
links: [PLN-22-6khzm8, PLN-23-39k273]
---

# Leaf-task refresh of the workstream lease

## Summary

- **Problem:** the execute-tasks lease refresh runs once before each parent-task run, with `task` set to the parent number; a parent task's children run inside that one run, and the task list is ticked only when the parent ends, so no reader can tell which child is running.
- **For:** a dashboard that reads `.lease` and lists leaf tasks only, and anyone running the FlowCharge Core pipeline.
- **Success:** while a child task or a task with no children runs, the lease names that task by its own number, title and start time; no task key names a parent task that has children.
- **Approach:** see Design: a refresh before each child task and before each task with no children, none for a parent task that has children; the lease keys and the refresh command stay as they are.
- **Top risk:** a child-level refresh writes the `.lease` inside a stage run, where hard rule 8 binds the orchestrator to the stage file's "change no other file" limit and hard rule 1 admits only the listed sanctioned deviations; Design, Refresh inside a stage run, settles it.

## Scope

Acceptance criteria:

1. (Must) Before each child task, numbered `<N>.<K>`, the run refreshes the lease with the values of Content specification, Execute-tasks refresh values, child row.
2. (Must) Before each task with no children, the baseline run of the test-run task included, the run refreshes the lease once, with the values of the matching Content specification row.
3. (Must) No refresh writes a parent task that has children into `task`, `task_title` or `task_started`, and such a task gets no refresh of its own.
4. (Must) `task_started` is read once per task, as that task begins, and is the same on every refresh within it.
5. (Must) The execute-tasks rule states that, because a parent's children run inside one run of `templates/execute-parent-task.md`, the orchestrator writes each child-level refresh itself before it starts that child's steps, and "Sanctioned deviations" lists that refresh as a write the stage file's "change no other file" limit does not cover.
6. (Must) The lease file description states that `task` holds a task number such as `3` or a dotted child number such as `3.1`, and that a reader reads `task` as text.
7. (Must) Start of run, When execution starts and After every stage still write the three task keys empty, and no write happens when a task ends.
8. (Must) The eight-argument refresh command, the temporary-file-and-rename write, the session check, the exits and the shell quote escape rule are unchanged.
9. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes, with every lease case brought in line with the leaf-task rule and one new case that runs the SKILL.md refresh command with a dotted `task` and the baseline note (Testing strategy).
10. (Must) Every new or edited `skills/flowcharge/SKILL.md` sentence passes DEVELOPMENT.md's portability questions, and the docs-consistency, single-copy, pointer-resolution and spawn-word cases stay green.

Out of scope: dashboard-side work; the tool-call hook PLN-22-6khzm8 lists under Won't; `skills/flowcharge/scripts/fc-index.mjs`, which reads no task key; `skills/flowcharge/templates/execute-parent-task.md`; `skills/flowcharge/CONVENTIONS.md`, `README.md`, `skills/fc-validate/SKILL.md` and `flowcharge/tags.md`; `CHANGELOG.md` and every `metadata.version`, which the release process owns (one release ships this rule with the other lease keys); every installed skill copy; any edit to PLN-22-6khzm8, PLN-23-39k273, TL-26-9sq7bw or TL-27-lkn3cq, which are done (Design, Changes to PLN-22-6khzm8 and PLN-23-39k273).

Assumptions:

- **Leaf task.** A child task, or a top-level task with no children, is a leaf. The run refreshes before each leaf it runs, in the order it runs them, and the baseline run is one leaf run of the test-run task.
- **Child number placeholder.** SKILL.md writes a child number as `<N>.<K>`, so `<M>` keeps its one meaning, the number of parent tasks the stage enumerates. The note before child 3.1 of a seven-task list reads `parent task 3 of 7, subtask 3.1`.
- **Title source.** A child's title is the text after `<N>.<K> ` on its task-list line; a top-level task's title is the text after `<N>. `, as today.
- **Tests in the test-update task.** The fixture update and the new case are test work, so the list's test-update task carries both, and parent task 1 edits `skills/flowcharge/SKILL.md` only.
- **Deployment.** No data and no live service. A `.lease` is session-bound and never committed. Rollback is reverting the commits.

## Design

**Refresh points.** The execute-tasks Operations note (`skills/flowcharge/SKILL.md:404-418`) replaces its refresh "before every run of the stage file" with a refresh before each leaf task: before the baseline run, before each top-level task that has no children, and before each child task. A parent task that has children gets no refresh of its own. Every refresh keeps `stage` `execute-tasks` and the task list's ID as `artefact`, and passes the task values of Content specification, Execute-tasks refresh values.

**Refresh inside a stage run.** A parent task and its children run in one run of `templates/execute-parent-task.md`, which ticks the task list only when the parent ends, so neither a stage boundary nor the file shows which child runs. The orchestrator therefore writes each child-level refresh itself, before it starts that child's steps, and the note calls that refresh lease upkeep, not a step of the stage file. While the stage runs, hard rule 8 binds the orchestrator to the stage file's "change no other file" limit, and hard rule 1 admits only the deviations "Sanctioned deviations" lists (`skills/flowcharge/SKILL.md:507-516`). A new bullet there, after the one that keeps the execute-parent-task loop mechanics in this skill, names the child-level refresh as a write inside the stage run that the limit does not cover.

**Lease file.** The lease file bullet (`skills/flowcharge/SKILL.md:697-726`) keeps its nine keys, their order, the empty-value form, the refresh command, the exits and the quoting rule. Its `task`, `task_title` and `task_started` definitions name the task now running instead of the parent task whose run is in progress, with `task` holding a task number such as `3` or a dotted child number such as `3.1`. Its sentence on which refresh sets the three task keys names the refresh before each leaf task (see Operations, execute-tasks); every other refresh still writes them empty. Its reader rule adds that a reader reads `task` as text. Its `note` example is the Content specification, Lease file wording, value.

**Readers.** `checkLeases()` finds only `session`, `acquired` and `heartbeat` by key name (`skills/flowcharge/scripts/fc-index.mjs:904-906`), so the generator needs no change.

**Tests.** The `lease()` fixture (`skills/flowcharge/scripts/test/run-tests.mjs:2227-2237`) writes the lease the refresh before child task 1.1 writes. The run-and-assert helper inside the case "the lease refresh command in SKILL.md writes the three task keys, set and empty" (`run-tests.mjs:2286-2321`) moves to module scope, unchanged in what it asserts, so the new case reuses it.

**Changes to PLN-22-6khzm8 and PLN-23-39k273.** This plan replaces these statements. In PLN-22-6khzm8: the Per-parent-task refresh assumption; the Write points row "Before every run of `templates/execute-parent-task.md`"; and the silent window of one parent task in the Residual window assumption and the Won't line, which is now one leaf task. In PLN-23-39k273: the Summary's success and approach lines; criteria 2 and 3; the Task title source, Start time and Write points unchanged assumptions; the Design statement that only the refresh before a parent-task run sets the task keys; the Content specification values of `task`, `task_title` and `task_started` and its Write points row for a parent-task run; and the Testing strategy's fixture values `task: 1` and `task_title: Fixture task`. TL-26-9sq7bw task 1.4 (the refresh) and task 2.2 (the fixture's `note`), and TL-27-lkn3cq's summary and tasks 1, 1.1, 1.2 and 2, carry out the earlier rule and stay as the record of that work.

## Content specification

Execute-tasks refresh values (`stage` is `execute-tasks` and `artefact` the task list's ID on every row):

| Refresh | `task` | `task_title` | `task_started` | `note` |
|---|---|---|---|---|
| Before the baseline run of the test-run task | its number `<N>` | the text after `<N>. ` on its line | the time the baseline run begins | `parent task <N> of <M>, baseline run` |
| Before a top-level task with no children | `<N>` | the text after `<N>. ` on its line | the time that task begins | `parent task <N> of <M>` |
| Before a child task | `<N>.<K>` | the text after `<N>.<K> ` on its line | the time that child begins | `parent task <N> of <M>, subtask <N>.<K>` |
| Before a parent task that has children | no refresh | | | |

The whitespace collapse of `task_title`, the start-time command and the refresh command stay as PLN-23-39k273, Content specification, gives them.

Lease file wording:

| Element | Exact value | Rationale |
|---|---|---|
| `task` range | a task number such as `3` or a dotted child number such as `3.1` | names every leaf a run executes |
| Reader rule addition | a reader reads `task` as text | a whole-number parse misreads `3.1` |
| `note` example | `parent task 3 of 7, subtask 3.1` | matches the dotted `task` example |

## Stages

1. **Leaf-task refresh in the orchestrator.** `skills/flowcharge/SKILL.md`: the execute-tasks Operations note, the Sanctioned deviations list and the lease file bullet. One stage, because the rule, its sanctioned deviation and the format text that describes its values land together. Observable: criteria 1 to 8 and 10.

## Data & compatibility

- The lease keeps its nine keys and their order. The `task` value range widens to a dotted child number, and `note` gains a subtask suffix for a child.
- A reader that finds values by key name and treats `task` as text, as the dashboard does, reads every new lease. A reader that parses `task` as a whole number misreads a child's lease.
- A lease written under the earlier rule names a parent task in `task`, which reads as a task number, the form a task with no children still writes.
- Rollback: revert the commits. A lease is session-bound, so no file needs migrating.

## Testing strategy

- Stage 1: no case of its own. The docs-consistency, single-copy, pointer-resolution and spawn-word cases cover the new prose (criterion 10), and the refresh-command case still finds exactly one refresh command in SKILL.md.
- Test-update task: `lease()`, given a heartbeat age, writes `task: 1.1`, `task_title: Fixture subtask` and `note: parent task 1 of 2, subtask 1.1`, with its other lines unchanged, and its comment names the refresh before a child task as the refresh that set the fixture's task keys; the five generator lease cases keep their names, calls and expectations.
- Test-update task: the case "the lease refresh command in SKILL.md writes the three task keys, set and empty" keeps its runs and expectations, calls the module-scope helper, and its comment names its first run as the refresh before a task with no children.
- Test-update task: one new case directly after it, "the lease refresh command in SKILL.md writes a dotted subtask number and the baseline note as given", runs the refresh command twice, in run order, against a fixture lease. First the baseline refresh of test-run task 5: `5`, `Test-run task: run the project's test suites`, a fixed `task_started` and `parent task 5 of 5, baseline run`. Then the refresh before child task 1.1: `1.1`, a title, a second fixed `task_started` and `parent task 1 of 5, subtask 1.1`. After each run it asserts exit 0, the exact nine lines in key order (the heartbeat by its ISO 8601 shape), `task: 5` and then `task: 1.1` and each note byte for byte, no temporary file left, and no WARN from `--check`.

## Alternatives considered and rejected

- A refresh before each parent-task run plus one before each child: `task` would name a parent task that has children, which a board listing leaf tasks only cannot show.
- The stage file writes the child-level refresh: stage files are the user's own and change only when the user hands over a revision (DEVELOPMENT.md, Maintaining the skill suite), and the lease rule lives in this skill's upkeep, beside every other refresh.
- Tick each child in the task list as it ends: the stage file writes the task list once per parent task, and a tick marks an end, not a start.
- A separate `subtask` key: a reader would join two keys to name the running leaf, where one `task` value names it.
- A whole-number `task` with the child number in `note` only: a reader would parse free text again, which PLN-23-39k273's keys exist to avoid.
