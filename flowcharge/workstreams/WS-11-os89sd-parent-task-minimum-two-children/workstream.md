---
id: WS-11-os89sd
type: workstream
workstream: WS-11-os89sd
slug: parent-task-minimum-two-children
title: "Require at least two children per parent task"
status: backlog
tags: [schema, prompts, conventions, generator]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
A parent task with only one child must be authored as a standalone Adult task instead — add the minimum-two-children rule to the task-list schema and to the four authoring prompt templates.

## The observed problem

Noticed in a sibling FlowCharge project's board (a different repo than this one,
also using FlowCharge Core): a workstream's task list had a parent task with only
one child task under it. A parent task exists to group multiple children; a
parent with exactly one child adds a heading and a number level (`N.1`) for no
organisational benefit over just making that one task an Adult (standalone) task
numbered `N`.

This repository was checked first for a prior card discussing this exact issue —
none exists. No workstream, plan, issue list or task list, active or dropped, and
no rule in `skills/fc-task-list/SKILL.md`, currently addresses it.

## The rule to add

A parent task must have **at least two** children. When authoring a task list (or
revising one), if a task would be the only child under a parent, author it as an
**Adult** task instead — standalone, numbered at the top level, not nested under
a parent it would be the sole occupant of. This applies wherever task lists are
authored: `tasks-from-plan` (spec and diff modes) and `tasks-from-issues` (spec
and diff modes).

## Where this likely needs to change, in this repo

- `skills/fc-task-list/SKILL.md` — the **Parent** / **Adult** / **Child** task-type
  definitions need the new minimum-two-children constraint stated explicitly,
  plus whatever guidance section covers when to use each shape.
- `skills/flowcharge/templates/tasks-from-plan-spec.md`, `tasks-from-plan-diff.md`,
  `tasks-from-issues-spec.md`, and `tasks-from-issues-diff.md` — the authoring
  instructions each subagent follows when deciding whether a piece of work becomes
  a parent-with-children or a single Adult task.
- Per `skills/flowcharge/SKILL.md`'s "Maintaining this skill" rule, a new rule
  added to CONVENTIONS.md (or the task-list skill) ships with a matching check in
  `skills/flowcharge/scripts/fc-index.mjs` plus a pinning test case, or an explicit
  "no script can check this" note next to the rule. The generator currently has
  **no** check on parent/child task counts at all — this needs to be decided when
  this workstream is planned: whether a single-child parent can be mechanically
  detected and WARNed on, or whether it stays a human judgment call the author
  applies at authoring time.

## Recording note

This card records the rule as future work only. No file is edited now, and no
plan or task list is authored yet.

### Copied from a sibling FlowCharge project's backlog — 2026-09-13

This workstream was originally recorded in a sibling FlowCharge project, using
that project's older `fc-orchestrate`/`prx-orchestrate` skill and prompt paths.
This copy's "Where this likely needs to change" section is rewritten to name
this repository's own current paths (`skills/flowcharge/SKILL.md`,
`skills/flowcharge/templates/`, `skills/flowcharge/scripts/fc-index.mjs`)
instead.
