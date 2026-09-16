---
id: WS-15-d5hgor
type: workstream
workstream: WS-15-d5hgor
slug: artefact-validation-cost-tiers
title: "Every run pays full price for artefact checking, whatever the stakes"
status: done
tags: [configuration, gates, quality]
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: []
links: []
---

## The problem

FlowCharge Core checks each authored artefact against its source several times per
workstream. A plan is authored and checked, an issue list is authored and checked, a task
list is authored and checked. The checking is thorough and it is repetitive. It consolidates
into one pass.

## The request

Add a `validate` key to `flowcharge/agents.md`, alongside the existing `default_agent`,
`task_list_mode` and `prompts` keys. The key takes two values.

- `on` is the default. One validation pass runs, once, after both the plan (or issue list)
  and the task list exist. That pass holds the brief, the workstream record, the plan (or
  the issue list and the findings behind it) and the task list. It makes two comparisons in
  a fixed order: the brief and workstream record against the plan first, then the plan
  against the task list second.
- `off` runs no validation at all.

## The safeguard

The plan is never edited to match the task list. A plan-level finding is corrected against
the brief and the workstream record. The task list then follows the corrected plan. The
correction never runs in the other direction. The two comparisons report under separate
headings, so a plan-level finding is never filed as a task-level one.

## Visibility requirement

Every run states plainly which validation stages ran and which did not. A stage that did not
run falls into one of two classes, and the run names the class.

- **Waived** means the project's `validate` key is `off`. This outcome is expected and needs
  no action.
- **Missing** means the stage did not run for some other reason. This outcome is a fault, and
  the run recommends a standalone `/fc-validate` on the affected artefact.

## Relationship to other records

WS-14-xbmk31 holds the settled authoring direction: both authoring paths merge into one
subagent, the setting is `validate: on | off`, and the single `validate: on` pass checks the
brief against the plan and then the plan against the task list.

WS-117-efvwlp holds two validate-plan deletions that removed real acceptance criteria, and
proposes a rule that prevents that failure.
