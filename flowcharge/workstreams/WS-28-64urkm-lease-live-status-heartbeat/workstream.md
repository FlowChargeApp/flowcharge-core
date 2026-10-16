---
id: WS-28-64urkm
type: workstream
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Show live run activity for an in-progress workstream from its .lease file"
status: backlog
tags: [schema, generator, orchestration]
created: 2026-10-16
updated: 2026-10-16
author: Anthony Koukoullis
depends_on: []
links: []
---

Extend the workstream `.lease` file into a live-status heartbeat, so a dashboard can tell a live run from a stopped one, and measure lease staleness from the last heartbeat.

## Problem

The board shows only the `workstream.md` `status` column (`backlog | ready | in-progress | done | dropped`). An `in-progress` workstream gives no signal whether a run is live, crashed or stopped. A dashboard that shows live status needs to know which artefact a run is working on, which pipeline stage it is at, and how recently the run last wrote anything.

`status: in-progress` (persistent, git-tracked, the board column) and "a session is actively working on this now" (ephemeral, session-bound) are two different facts. SKILL.md already keeps them apart: "Halt or user stop" leaves `in-progress` in place and releases the lease. So `in-progress` with no live signal is a truthful state. A crash and a deliberate stop both mean nobody is working on it now, and that is what a dashboard should show.

## Rejected design

A separate top-level `flowcharge/status/` folder, with one subfolder per active workstream, would record the same fact `.lease` already holds, in a second place. Two files for one fact drift apart. The polling-cost argument for it does not hold: `stat` on about 110 workstream folders takes well under a millisecond, and `fs.watch` with `recursive: true` gives change events with no polling.

## Design

1. **New `.lease` fields.** Add `heartbeat` (ISO timestamp, the liveness signal), `stage` (an Operations table name, the pipeline stage now running), `artefact` (the ID in hand, such as a TL or PLN ID) and `note` (one line of free text, such as "parent task 3 of 7"). The existing `session` and `acquired` fields never change after acquisition.
2. **Write points.** Use the moments the orchestrator already visits: acquire at "Start of run" (as today), "When execution starts", and "After every stage". Delete at "Successful end of run" and "Halt or user stop", with the existing session-match guard unchanged. Every rewrite goes through the atomic tmp-plus-rename pattern `fc-index.mjs` already uses (`writeAtomic`), so a reader never sees a half-written file.
3. **Staleness from `heartbeat`.** Today `LEASE_STALE_MINUTES = 60` is measured from `acquired`, so a run longer than 60 minutes has its own lease wrongly reclaimed by another session. Measure from `heartbeat` when present and fall back to `acquired` for a lease written before this change. Update the "Start of run" reclaim rule, `checkLeases()` and its WARN text and comment in `fc-index.mjs`, and add a `run-tests.mjs` case that pins the WARN text.
4. **No sweep script.** A stale `.lease` describes itself once a reader sees its age. Deleting it on a timer would destroy the evidence a dashboard wants to show, such as "session silent for 43 minutes at task 3". The existing reclaim, `checkLeases()` WARN and two release points are enough.
5. **`.gitignore` gap.** `ensureGitignore()` in `fc-index.mjs` adds `flowcharge/index.md`, `flowcharge/kanban.md` and `flowcharge/ids/` only. A crashed run can leave a `.lease` behind, and the next commit can capture it. Add `flowcharge/workstreams/*/.lease` to the same call.

## Dashboard contract (out of scope)

The FlowCharge application side is a separate piece of work. This workstream delivers only the Core side: the schema and the write points. For reference, the board column comes from `workstream.md` `status`, as today. A live badge comes from `.lease`: absent means no badge, a `heartbeat` under 15 minutes old means live and shows `stage` and `note`, an older one shows "silent for M minutes" plus `session`. The display threshold is 15 minutes and stays separate from the 60-minute reclaim threshold, because they answer different questions. The longest silent gap equals one long task, which can run 15 to 17 minutes. Reclaiming a lease that is still in use lets two sessions write one workstream, so the reclaim threshold stays conservative. A wrong badge costs nothing. The dashboard should also show the elapsed time next to the badge, such as "last update: 12m ago".

## Deferred

A Claude Code `PostToolUse` hook that touches the `.lease` heartbeat on every tool call would shrink the staleness window from about 60 minutes to a few minutes. It needs an owner-reviewed `.claude/settings.json` change, so no plan or task of this workstream writes it. The plan records it as an optional later install step.

## Target

This repository's tracked source: `skills/flowcharge/SKILL.md`, `skills/flowcharge/scripts/fc-index.mjs` and `skills/flowcharge/scripts/test/run-tests.mjs`. Verify against `skills/flowcharge/scripts/test/run-tests.mjs`. Never edit an installed copy of the skills.
