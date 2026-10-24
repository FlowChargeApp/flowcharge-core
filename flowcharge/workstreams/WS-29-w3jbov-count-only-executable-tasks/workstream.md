---
id: WS-29-w3jbov
type: workstream
workstream: WS-29-w3jbov
slug: count-only-executable-tasks
title: "Count only executable tasks in task-list progress totals"
status: in-progress
tags: [correctness, generator, board, feature]
created: 2026-10-17
updated: 2026-10-24
author: Anthony Koukoullis
depends_on: []
links: []
---

Task-list progress counts parent tasks that have children, which never run. Count only executable tasks: child tasks and tasks without children.

## Problem

A parent task that has children is a grouping. It is not executable: its children run, and the parent is ticked when they finish. A task with no children (an adult task) is executable. The progress figure `done/total` counts every task line, parents included, so the total overstates the steps left to finish the work. A list with 3 parents and 12 children shows 15, but only 12 steps run. The figure has counted this way since task lists were introduced.

The figure should answer one question: how many executable steps does this workstream need, and how many are done. A parent task adds no step.

## Where the count is made

`parseTasks()` in `skills/flowcharge/scripts/fc-index.mjs` increments `total` and `open` for every task line, whether `N.` or `N.M`. It already records `hasChildren` on each item. Its totals feed the Progress column of the workstream listing, the task-list figure on the board card, and the task-list rows of the index. A parent line precedes its children, so whether a line is a parent is known only after the next lines are read. The count must therefore be taken after the whole list is parsed.

## Required behaviour

- `total` counts child tasks (`N.M`) and top-level tasks with no children. It never counts a top-level task that has children.
- `open` counts the unticked tasks among those same tasks. The tick on a parent does not change `open` or `total`.
- The rule for closing a task list (all tasks ticked, so the list moves to `done`) stays correct. Decide in the plan whether it reads the leaf count or the full set, and keep the existing warning and `--sync` behaviour consistent with the figure shown.
- A list with no parent that has children is unchanged.

## Out of scope

The FlowCharge application may compute its own counts for workstream cards and its running-tasks widget. Aligning that computation is separate work in that application. This workstream changes the figure Core generates.

## Related

WS-11-os89sd requires at least two children per parent task. It does not change how tasks are counted.
