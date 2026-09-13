---
id: WS-6-9sylpm
type: workstream
workstream: WS-6-9sylpm
slug: execute-tasks-staleness-check
title: "execute-tasks runs a task list without checking its base_commit against current HEAD"
status: done
tags: [orchestration, quality, correctness, feature]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
Add a staleness check to flowcharge's execute-tasks stage: before spawning the
first parent-task subagent, compare the task list's `base_commit` (or, absent that,
its `updated` date) against the current `HEAD`. If commits have landed on the branch
since the task list was authored, surface that fact and recommend a re-validate or
refresh pass — via `fc-validate` or a fresh diff-mode re-scan of the plan/issue-list
against the current tree — before proceeding, rather than silently executing
instructions that may already be stale.

## Where this came from

A task list's frontmatter carried a `base_commit` that predated a merge already
landed on the branch by the time execution actually ran. That merge had expanded
`skills/flowcharge/scripts/test/run-tests.mjs` with new test cases the task list
did not account for, and had moved a script referenced by one of the list's own
subtasks to a different location, invalidating that subtask outright.

None of this was checked before execution started. The orchestrator ran the first
parent task straight through, and the gap only surfaced when a later verify step's
suite-gate check failed on a fraction of the expected count — partway through the
work, not before it. A `base_commit`-vs-`HEAD` comparison, or simply re-running
`fc-validate`, would have caught this before any file was touched.

## What "done" looks like

- Before the first `execute-tasks` subagent spawn in a run, the orchestrator reads
  the task list's `base_commit` (diff-mode) or `updated` date (spec-mode, where no
  `base_commit` exists) and checks whether commits have landed on the current branch
  since.
- If drift is found, the orchestrator states it plainly — what changed, and roughly
  how much — and recommends re-validating or refreshing the artefact before
  proceeding, rather than proceeding silently.
- This should not block execution outright when the drift turns out to be harmless;
  it is a surfaced recommendation, not a hard gate, consistent with how the rest of
  flowcharge treats open questions and flagged tasks.

This workstream is a record only, for now — no plan or task list authored yet.

### Moved from a sibling FlowCharge project's backlog — 2026-09-13

This workstream was originally opened in a sibling FlowCharge project under a
different ID. Its "Where this came from" section above is a self-contained summary
of the incident that motivated it, rewritten to stand on its own — the original
named a specific task list, workstream and commit from that other project's own
history, none of which exist in this repository.
