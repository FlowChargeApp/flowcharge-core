---
id: WS-13-ywk08u
type: workstream
workstream: WS-13-ywk08u
slug: skill-instructions-init-flag-gap
title: "flowcharge skill instructions never reference fc-index.mjs's --init mode"
status: done
tags: [skills, conventions, generator, issue]
created: 2026-09-16
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---
`skills/flowcharge/SKILL.md`'s Start of run upkeep instructions were not updated when `fc-index.mjs` gained `--init`, so an agent following the skill has no way to know the flag exists.

## Background

WS-12-zq2ms6 ("Give fc-index.mjs a mode to initialize an empty flowcharge/ tree with no workstream") added `--init` to `fc-index.mjs`, was fully executed, merged, and shipped in a cut release. Its task list explicitly scoped the documentation update to `CONVENTIONS.md`'s `.gitignore` writing-mode sentence and one `CHANGELOG.md` line, per its own plan. It never named `skills/flowcharge/SKILL.md` as something to update.

## The problem, as discovered

The user asked a separate agent session to initialize a new project's `flowcharge/` folder. That agent had no idea `--init` existed, because the orchestrator skill's own "Start of run" section still reads: "If `flowcharge/` itself is missing, create it plus a zeroed `ids.md` first" — a manual, by-hand procedure with no pointer to the now-available `--init` command. The agent proceeded to create the tree by hand instead of running `fc-index.mjs --init`.

Confirmed independently: `--init` appears once in `CONVENTIONS.md` (the `.gitignore` writing-mode list) but nowhere in the orchestrator's own procedural instructions for initializing a project.

## Scope

- Update `skills/flowcharge/SKILL.md`'s "Start of run" bullet (under "FlowCharge Core upkeep") so it directs the initialization case to run `fc-index.mjs --init` instead of describing a manual create-the-folder-and-ids.md procedure.
- Grep the rest of the `skills/` tree (not just this one file) for other stale references to the old missing-`flowcharge/`-folder behavior that should also point at `--init` now.
- This is new scope, not a reopening of WS-12-zq2ms6, which is already `done` and released.
