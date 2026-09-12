---
id: WS-3-t2lfk1
type: workstream
workstream: WS-3-t2lfk1
slug: branch-name-ws-prefix
title: "Prefix feature branch names with their workstream code"
status: done
tags: [prompts, skills, git, feature]
created: 2026-09-10
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
# Prefix feature branch names with their workstream code in fc-git

`fc-git/SKILL.md`'s Branching section names branches `feature/<short-description>` with no workstream code in them, so a branch like `feature/gate-directness-determinacy-rewrite` can't be traced back to its `WS-N` card by name alone — matches the workstream-folder naming gap already fixed for `flowcharge/workstreams/` (now `WS-N-<slug>`).

Update the Branching section's naming convention so feature branches cut for FlowCharge Core workstreams are prefixed with the workstream code, e.g. `feature/WS-3-t2lfk1-branch-name-ws-prefix`, consistent with the folder convention.
