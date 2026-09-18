---
id: WS-23-jysiqw
type: workstream
workstream: WS-23-jysiqw
slug: remove-description-frontmatter-field
title: "Remove the redundant description frontmatter field from workstream records"
status: done
tags: [schema, conventions, generator, prompts, migration, feature]
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---
Drop the redundant `description` frontmatter key from FlowCharge Core workstream records: remove it from the schema, the generator and the prompts, and migrate the 32 records that carry it.

## Background

A prior discussion established that every workstream record already has an
unlimited-length markdown body below its frontmatter, and that all 88 existing
workstream records in this project already use it to store the full detail of their
originating request. Per `skills/flowcharge/CONVENTIONS.md`, only the body's first
line (plus `title` and `description`) ever reaches the generated board. A separate,
optional frontmatter `description` field (soft cap ~1000 characters) was added earlier,
before this was understood, specifically because `title` alone felt insufficient.
Comparing all 32 records that currently carry `description` against their own bodies
showed every `description` is a compressed restatement of that record's body — no fact
appears in `description` that the body lacks.

## Decision

This is a decided design correction, not an open question. Remove the `description`
field from the FlowCharge Core schema entirely. Keep `title` as the short name and the
body's first line as the board's scannable summary line; the body remains the full
record. The FlowCharge dashboard app (a separate sibling repo) has already been changed
on its side to render the body instead of `description` in its workstream detail modal —
that part is done and is explicitly **out of scope** for this workstream. This
workstream covers this repo (FlowCharge Core) only.

## What "remove the field" covers in this repo

- `skills/flowcharge/CONVENTIONS.md` — the `description` key's definition in the
  frontmatter block and its accompanying prose (currently documents it as optional,
  single-line, ~1000-character soft cap, workstream records only).
- `skills/flowcharge/SKILL.md` — every step that resolves or writes `description`
  for a new or existing workstream (the "Start of run" upkeep bullet's `--description`
  flag usage, and any other reference).
- `skills/flowcharge/scripts/fc-index.mjs` — the generator's handling of the
  `description` key: reading it, writing it to the board, and the length-cap WARN that
  checks it.
- `skills/flowcharge/templates/kanban-add.md`,
  `skills/flowcharge/templates/issues-and-tasks-spec.md`, and
  `skills/flowcharge/templates/issues-and-tasks-diff.md` — every instruction that
  tells an authoring subagent to resolve or write `description`.
- A migration pass over the 32 existing workstream records that currently carry a
  `description` key: for each, verify the `description` states nothing the body omits
  (expected, based on the sample already checked) and, only where it does, fold that
  missing sentence into the body before the key is deleted. Then remove the
  `description` line from all 32 records' frontmatter.
- Any other in-repo reference to the `description` field this list missed, found by a
  full grep of `skills/` for the word once this work actually starts.

## Recording note

This record captures the decision as future work only. No file is edited now, and no
plan or task list is authored yet — that happens in a later run, when the user
explicitly asks to execute this workstream. Per the "Maintaining the skill suite" rule
in `DEVELOPMENT.md`, a new rule in CONVENTIONS.md should ship with a
matching generator check plus a pinning test case, or an explicit "not machine-checkable"
note. The future plan or task list for this workstream should account for that when it
removes the `description` check.
