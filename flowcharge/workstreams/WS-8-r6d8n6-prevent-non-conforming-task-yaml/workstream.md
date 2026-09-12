---
id: WS-8-r6d8n6
type: workstream
workstream: WS-8-r6d8n6
slug: prevent-non-conforming-task-yaml
title: "Task lists can be authored with YAML block scalars the schema never sanctions"
description: "Nothing in the schema states folded block scalars (>-) as a forbidden form for task-level string fields, nothing in the generator's --check validates it, and fc-task-list/SKILL.md gives no scalar-style rule at all — confirmed by direct inspection of this repository's own skill and generator, not carried over as an assumption."
status: backlog
tags: [skills, schema, generator]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
File issues for the non-conforming task-list schema gap, then open spec tasks from the recommended fixes below.

The bug: a task list can be authored with YAML folded block scalars (`>-`) on its
`implement`, `imports`, `compatibility`, and `gotcha` keys, instead of the plain
double-quoted single-line string form every other task list in this repository
uses. This broke a downstream renderer in a sibling FlowCharge project when it
happened there: the renderer could not parse the folded form, showed `Implement`
empty, and dumped the rest of the task into a fallback `Unparsed` field. No task
list in this repository currently uses the folded form — confirmed by a grep across
`flowcharge/workstreams/*/*.md` — but nothing here prevents one from being authored
that way, so the same class of defect is latent, not yet triggered.

Root cause, confirmed directly against this repository's own files:
- `skills/flowcharge/templates/tasks-from-issues-spec.md` and
  `tasks-from-plan-spec.md` tell an authoring subagent to make
  `imports`/`compatibility`/`gotcha` "rich" but never state what line form to use.
- `skills/fc-task-list/SKILL.md` gives no scalar-style rule at all — not even an
  example to follow, confirmed by a direct search for a block-scalar or
  single-line mention.
- `skills/flowcharge/scripts/fc-index.mjs`'s `--check` validates no task-level YAML
  field shape at all, so a non-conforming file would pass silently.

Recommended fixes, to be turned into spec tasks, in this order:
1. State the required single-line form as a rule in `skills/fc-task-list/SKILL.md`.
2. Add the same rule as `CONVENTIONS.md`'s tiebreaker sentence for task-list body
   shape.
3. Add a check to `fc-index.mjs` that warns on a block-scalar indicator on
   `description`/`pattern`/`imports`/`compatibility`/`gotcha`/`author`/`mode`,
   without flagging the normal `- >-` list-item form already used elsewhere in this
   project's own task lists (the `implement` key's own SEARCH/REPLACE blocks
   legitimately use that list-item form).
4. Add two pinned test cases to `run-tests.mjs`: one proving the new warning fires
   on the folded form, one proving it stays silent on the normal list-item form.
5. Add one sentence to the `tasks-from-issues-spec.md` and `tasks-from-plan-spec.md`
   templates naming the required single-line form.

### Copied from a sibling FlowCharge project's backlog — 2026-09-13

This workstream was originally recorded in a sibling FlowCharge project, where the
gap had actually been triggered by one specific task list there, kept deliberately
non-conforming as a live example and sequenced behind that task list's own
execution. Neither that task list nor that sequencing constraint exists in this
repository, so both are dropped here: this copy targets the schema/generator/skill
gap itself, grounded in this repository's own files as confirmed above, with no
dependency on work that only exists elsewhere. Its own plan/issue/task-list
artefacts were not carried over either, per this project's practice for a
backlog-status record: fresh artefacts get authored when this workstream is
actually picked up, grounded in the codebase as it stands then.
