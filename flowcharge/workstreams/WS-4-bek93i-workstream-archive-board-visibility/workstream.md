---
id: WS-4-bek93i
type: workstream
workstream: WS-4-bek93i
slug: workstream-archive-board-visibility
title: "Archiving workstreams hides them from the board; the Done column grows without bound"
status: backlog
tags: [board, usability, conventions]
created: 2026-09-10
updated: 2026-09-10
author: Anthony Koukoullis
depends_on: []
links: []
---
# Archiving workstreams hides them from the board; the Done column grows without bound

On the Kanban board there are five columns, and the last one is done. There is a last column called dropped as well, but there is no archive. Archiving physically moves workstream folders out of the workstreams holding folder into the flowcharge parent folder, but that does not reflect on the Kanban board. Over time the done column fills up to an unmanageable degree.

## The problem, as the user described it

Properly archiving workstreams. On the Kanban board there are five columns, the last
being done. There is also a last column named dropped, but there is no archive. There
is the ability to physically move workstream folders out of the workstream holding
folder into the flowcharge parent folder, but that does not reflect on the Kanban board.
Over time, the done column just fills up, to an unmanageable degree.

There has to be a unified set of rules that relate to the physical folders for
workstreams, but also to the Kanban board. Options to consider:

- A new archived column, or
- a toggle that enables and disables, or views and hides, just the archived cards.

The archived cards should be identifiable visually in some way.

The user is unsure which visual approach is best and wants to discuss it further.

## What a later investigation must establish (do not re-litigate)

- CONVENTIONS.md already defines archiving: move the entire workstream folder to
  `flowcharge/archive/`, keep IDs, regenerate. The generator already renders archived
  workstreams into a hidden `Archive __archived__` column and lists them under the
  index's **Archived** section. So the physical-move mechanics and the hidden
  rendering already exist — what is missing is *visibility* on the board and the
  user-facing rules that tie the move to the view.
- The board currently shows: Backlog, Ready, In Progress, Blocked, Done, plus
  hidden `Dropped __archived__` and `Archive __archived__` columns.
- `flowcharge/archive/` currently holds nothing (all closed workstreams sit in the Done
  column), which is why the board looks five-column and the done column is the
  growth problem.

## Open scope (not yet investigated)

- Whether the Board-mechanics belong in `fc-index.mjs`/`CONVENTIONS.md` only, or
  also in `fc-plain-text-kanban/SKILL.md` (what it documents about archived
  columns, toggles, and visual markers).
- The best visual approach — a visible archived column, a toggle that shows/hides
  the archived cards, and how archived cards should be visually identified
  (e.g. dimmed, labelled, struck-through). Unsettled; to be discussed with the user.
