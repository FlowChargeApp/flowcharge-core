---
id: WS-30-nw2tqo
type: workstream
workstream: WS-30-nw2tqo
slug: tick-subtask-when-passed
title: "Tick each subtask checkbox as soon as it passes"
status: in-progress
tags: [orchestration, prompts, feature]
created: 2026-10-25
updated: 2026-10-25
author: Anthony Koukoullis
depends_on: []
links: []
---
The executor ticks each subtask's checkbox as soon as that subtask passes, not once per parent task.

During a run the lease follows the current subtask, while the task list file stays unchanged until the parent task ends. A dashboard that counts every `- [ ] N.` and `- [x] N.` line therefore shows 0/11 for a whole parent task and then jumps to 5/11. The stage file `templates/execute-parent-task.md` says to write the task list once per parent task, in one edit that ticks every checkbox, records every `self_eval` and bumps `updated`.

Required change:
1. Tick each subtask `[x]` in its own edit, right after that subtask passes its checklist, and bump `updated` in that edit. Tick the parent only when every child passed and the parent's `self_eval` passed.
2. A subtask that aborts or stays failing stays unchecked, and so does its parent. Children that already passed stay ticked.
3. The stage file defines what a re-run of a parent task does when some children are already ticked.
4. A parent task without children, the test-run task and its recorded result keep working as they do now.
5. Every other statement of the once-per-parent-task rule agrees: the orchestrator SKILL.md, the task list skill, CONVENTIONS.md, fc-validate, and any script check. The file format is unchanged: `[x]` still means passed.
6. CHANGELOG.md gets an entry. The version is decided at release, per VERSIONING.md.

Acceptance: a simulated parent task with three children shows, on disk after each child passes, that child ticked and the parent unticked, and after the last child the parent ticked. The line counts, matched as `- [ ] N.` or `- [x] N.` over every task line, are reported after each step.

Out of scope: the application that reads the checkboxes, which already polls every 5 seconds.
