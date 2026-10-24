---
id: PLN-25-lqq122
type: plan
workstream: WS-29-w3jbov
slug: count-only-executable-tasks
title: "Count only executable tasks in task-list progress"
status: ready
created: 2026-10-24
updated: 2026-10-24
author: Anthony Koukoullis
base_commit: 44cfaea
depends_on: []
links: []
---

# Count only executable tasks in task-list progress

## Summary

- **Problem:** the `done/total` progress figure counts a parent task that has children, but a parent only groups its children and never runs, so the total overstates the steps left.
- **For:** anyone reading task-list progress in the index, in `--list tasklists` and on the board.
- **Success:** the figure counts child tasks and tasks with no children only, so a list of 3 parents with 12 children shows 12 steps.
- **Approach:** `parseTasks()` in `skills/flowcharge/scripts/fc-index.mjs` reports a step count beside its existing counts, and the three display sites print the step count.
- **Top risk:** the rule that closes a task list reads the same counts, so a shared edit could close a list early; Scope, Assumptions, fixes the close rule on the existing counts.

## Scope

Acceptance criteria:

1. (Must) A task line numbered `N.M` counts as one step, and a top-level task line numbered `N.` with no `N.M` line beneath it counts as one step.
2. (Must) A top-level task line with at least one `N.M` line beneath it adds nothing to the step total or to the done count, whether it is ticked or not.
3. (Must) The progress figure is `<ticked steps>/<steps>`, in the index Task lists table, in `--list tasklists` and on the board's task-list line.
4. (Must) A list with no parent that has children shows the figure it showed before this change.
5. (Must) The rule that sets a task list to `done` (every task line ticked), the `--check` warning `all <n> tasks checked but status is "<status>"` and the `--sync` line `all <n> tasks checked` read the same counts as before.
6. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes, with one case that pins the figure for a list holding a parent with children, and one case that pins the close rule.

Out of scope: the FlowCharge application's own task counts; the rule that closes a task list; every file other than `skills/flowcharge/scripts/fc-index.mjs` and `skills/flowcharge/scripts/test/run-tests.mjs`; `CHANGELOG.md` and every `SKILL.md` version line.

Assumptions:

- No document defines the progress figure: the index column is headed `Done/Total` and `CONVENTIONS.md` says only "task-list progress". No document is wrong after this change, so none changes.
- A top-level task line becomes a parent only through an `N.M` line beneath it. A task whose own record carries sub-steps in prose stays a step.
- Keeping the close rule on every task line is safe, because the executor ticks a parent when its children finish.

## Stages

### Stage 1: report and print the step count

- **Goal:** `parseTasks()` returns `steps`, the number of child tasks and top-level tasks with no children, and `stepsOpen`, the unticked ones among them; the three progress displays print them; the comment above `parseTasks()` says what each count means.
- **Design:** `parseTasks()` keeps `open` and `total` untouched, records whether each task line is ticked, and after the loop counts the items whose `hasChildren` is false. One helper in `fc-index.mjs` formats `<steps - stepsOpen>/<steps>`, and the three display sites call it: the `--list tasklists` row, the board line of a task list, and the index Task lists table.
- **Alternatives rejected:** changing `total` and `open` themselves, which would also change the close rule and the `all <n> tasks checked` messages; counting parents as ticked when their children are, which keeps the total inflated.
- **Verification:** the new cases in `skills/flowcharge/scripts/test/run-tests.mjs`; the full suite stays green.
