---
id: WS-7-boovu9
type: workstream
workstream: WS-7-boovu9
slug: author-field-schema-mismatch
title: "Authoring templates omit the author field CONVENTIONS.md requires on every artefact"
status: backlog
tags: [schema, conventions, prompts]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
A plan's own frontmatter is missing an `author` field CONVENTIONS.md requires, and the create-plan template never instructs writing one — likely affects other artefact kinds too.

## What prompted this

A review of an authored plan's frontmatter in a sibling FlowCharge project found it
missing the `author` key. `CONVENTIONS.md` states `author` is required on all four
artefact kinds (workstream, plan, issue list, task list). Checking this repository's
own `skills/flowcharge/templates/create-plan.md`, its frontmatter template block
(the same one used to author this session's own PLN-2 and PLN-3) omits the `author`
key entirely — confirmed directly, not carried over as an assumption.
`skills/fc-plan-feature/SKILL.md` separately requires the field (its own line
naming `links`, and `author` among the required keys). The two sources disagree,
and the orchestrator template (`create-plan.md`) is what actually gets used when a
plan is authored via the pipeline, so the key silently never gets written that way.

This was confirmed on the template only. It has not been checked against issue-list
or task-list templates, against `fc-plan-feature` invoked standalone (outside the
orchestrator), or across the wider set of already-authored artefacts in this
repository.

## What to investigate

- Whether `author` is genuinely missing from `create-plan.md`'s frontmatter template
  block (confirmed above), and whether the equivalent templates for issue lists and
  task lists (`create-issues.md`, `tasks-from-plan-spec.md`, `tasks-from-plan-diff.md`,
  `tasks-from-issues-spec.md`, `tasks-from-issues-diff.md`) have the same gap or not.
- Whether `fc-plan-feature/SKILL.md`, `fc-issue-list/SKILL.md` and
  `fc-task-list/SKILL.md` each state the `author` requirement consistently with
  `CONVENTIONS.md`, or whether the disagreement is specific to the plan path.
- How many of this repository's own already-authored artefacts are actually missing
  `author` in practice — a census across `flowcharge/workstreams/*/*.md` gives real
  evidence of scope, not just the one template checked so far.
- Whether `fc-index.mjs`'s `--check` already warns on a missing `author` key or
  silently accepts it (`CONVENTIONS.md`'s own author-attribution section states the
  rule is "not machine-checkable" by design — confirm this is still accurate and
  understand why, since it affects whether a fix here is even something the
  generator could ever catch on its own).

## Recording note

This card records the bug for investigation, then issues, then tasks. No file is
edited yet.

### Copied from a sibling FlowCharge project's backlog — 2026-09-13

This workstream was originally recorded in a sibling FlowCharge project under a
different ID, with its own plan/issue/task-list artefacts already removed there as
stale (they targeted a pre-rebrand skill path that no longer exists even in that
project). Per this project's own practice, a backlog-status workstream carries only
this body until it's actually about to be executed — fresh artefacts get authored
at that time, grounded in this repository's codebase as it stands then.
