---
id: WS-10-6p7nqj
type: workstream
workstream: WS-10-6p7nqj
slug: execute-tasks-drift-adaptation
title: "execute-tasks aborts on a stale anchor instead of investigating and adapting"
status: backlog
tags: [orchestration, quality, correctness]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: [WS-6-9sylpm]
---
Give the execute-tasks stage a sanctioned way to investigate a stale anchor and
adapt, instead of a blanket abort.

## The current rule

`execute-parent-task.md`'s instructions say: "Establish each subtask's state
before acting. If the SEARCH text is present in the target file, the task is
outstanding — apply the block. If the REPLACE text is already there, it is done...
If neither is present, the block is stale. Abort that subtask: leave it unchecked,
record the mismatch in `self_eval.failures`, and report it. Never approximate,
re-derive, or fix up a block to make it apply."

This is deliberately conservative, and for good reason: a subagent that "fixes up"
a mismatched block on its own judgment can silently apply the wrong edit to the
wrong file. The rule exists to stop that failure mode.

## Where this became a real complaint

Executing a task list against a repository, a subtask's SEARCH/REPLACE anchor
targeted a file at a path an earlier, unrelated commit had already moved. The
subagent found and named the new location in its own report, but the rule
required it to abort rather than follow the file there.

On inspection, aborting turned out to be the right outcome in that case — the
new location sat outside that task list's own declared scope, so editing it
would have been out of bounds regardless. But that correctness was accidental:
the mechanism that produced it was a blanket "stale means stop," not an
investigation that could have reached the same conclusion (or a different,
better one) on its own reasoning.

The objection, stated directly: even under `prompts: cruise` (the setting meant
to grant the orchestrator more autonomy), there is currently no sanctioned path
for it to investigate a stale anchor, determine what actually changed, and
either fix it directly (when clearly safe and in scope) or author a corrective
task on the fly. It must abort and leave the subtask stale, full stop, regardless
of how easy the real answer was to find.

## What "done" looks like

- A subagent that finds a stale anchor is allowed to spend a bounded amount of
  investigation (grep, git log/blame, reading the file that actually exists at
  the described new location) to understand *why* it's stale, before deciding
  what to do.
- Three outcomes become distinguishable, where today there is only one (abort):
  1. The change is still needed and the new location is in scope — apply it
     there, record what happened and why, and note the divergence from the
     literal instruction.
  2. The change is still needed but the new location is out of scope for this
     task list — abort as today, but say so explicitly ("out of scope," not just
     "stale"), which is more informative than the current report.
  3. The change is no longer needed at all (already done elsewhere, or the thing
     it targeted no longer exists in any form) — abort as today, but say so
     explicitly rather than reporting a bare mismatch.
- The existing safety property — never silently apply a guessed edit to the wrong
  file — must survive. The change is in what the subagent is allowed to do with
  the extra information once it has gathered it, not in removing the requirement
  to be certain before acting.
- This is a different problem from `WS-6-9sylpm` (this repository's own
  base_commit-vs-HEAD staleness check, already done): that check runs once,
  before execution starts. This workstream is about drift discovered
  mid-execution, once a subtask is already running and its anchor doesn't
  match.

This workstream is a record only, for now — no plan or task list authored yet.

### Copied from a sibling FlowCharge project's backlog — 2026-09-13

This workstream was originally recorded in a sibling FlowCharge project, where
the incident that motivated it named a specific task list, workstream, and
file path from that project's own history. Those specifics are dropped here
in favor of the generalized incident above, since none of them exist in this
repository. Its `links` field points at `WS-6-9sylpm`, this repository's own
copy of the related staleness-check workstream; a second linked workstream in
the original (a formal rule for out-of-boundary drift) was not copied, so that
link is dropped.
