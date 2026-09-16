---
id: WS-14-xbmk31
type: workstream
workstream: WS-14-xbmk31
slug: pipeline-stage-codebase-resurvey
title: "Each pipeline stage re-surveys the codebase the stage before it already read"
status: done
tags: [orchestration, prompts, correctness]
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: []
links: []
---

## The problem

Each pipeline stage runs in a fresh subagent, and the authoring templates order a full
codebase re-survey. The templates order that survey whether or not the stage before it
already read the same files. Plan authoring surveys the code, then task authoring surveys the
same code again, and the validation stages read much of it once more. Each stage rebuilds
knowledge that the stage before it already held.

## The defect in the templates

`tasks-from-plan-spec.md` carries an unconditional rule: read the target file as it stands
now, and copy SEARCH text from that file rather than from the plan. The rule exists to keep
SEARCH/REPLACE blocks accurate. A spec-mode task list contains no SEARCH/REPLACE blocks, so
the survey serves no purpose there. The same unconditional assumption sits in
`execute-parent-task.md`, which states that the task file carries literal SEARCH/REPLACE
blocks to apply verbatim. That claim is also false for a spec-mode task list. Both are the
same defect: a diff-mode rule placed in a code path that spec mode also takes.

## The settled direction

Plan authoring and task authoring merge into one subagent, on both the plan path and the
issue path. The second artefact inherits the first one's context instead of re-surveying the
codebase. No configuration runs the two authoring stages as separately spawned subagents.

Validation stays a separately spawned, fresh-context subagent in every case. Fresh context is
what makes a validator trustworthy. A validator running inside the authoring subagent would
inherit the author's own reasoning and check it against itself, which is the contamination the
stage exists to remove. The merge therefore removes authoring setup cost only, never
validation setup cost.

The four shared context documents are resolved once per run and passed to each stage, instead
of being inlined whole into every fresh subagent.

Where a staleness check can replace a full re-survey, it does. The plan path supports one: the
plan records a `base_commit` and names the files it touches, so the authoring stage compares
that commit against the current head and re-reads only the named files that changed. The issue
path carries no such key and keeps whatever survey it already needs. Issue authoring is a
write-up stage, not a reconnaissance stage. Its context block already carries each finding with
its location, failure scenario and severity, so it runs no large file survey and leaves little
for the next stage to duplicate.

## The safeguard on validation

The validation pass holds the brief and workstream record, the plan (or the issue list and the
findings behind it) and the task list. It makes two comparisons in a fixed order. The brief and
workstream record are checked against the plan first, and that comparison is settled. Only then
is the plan checked against the task list.

The plan is never edited to match the task list. A plan-level finding is corrected against the
brief, and the task list then follows the corrected plan. The correction never runs in the other
direction. The two comparisons report under separate headings, so a plan-level finding is never
filed as a task-level one.

## The cost the merge carries

A plan-level finding arrives after both artefacts already exist. Acting on it means correcting
the plan and re-deriving the task list from the corrected plan. This is the price of merging the
authoring stages, not a defect in the validator. The validator makes the cost visible rather
than leaving it silent.

## Relationship to other records

WS-15-d5hgor holds the `validate: on | off` setting and the two-comparison design of its single
validation pass.

WS-117-efvwlp holds a separate finding about a validator deleting real acceptance criteria, and
the rule proposed to prevent that failure.

## Out of scope for this record

The task list this investigation produced came out larger than the plan it derives from. That
verbosity is a separate concern for its own workstream and is not addressed here.
