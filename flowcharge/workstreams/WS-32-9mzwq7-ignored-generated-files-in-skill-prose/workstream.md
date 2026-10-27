---
id: WS-32-9mzwq7
type: workstream
workstream: WS-32-9mzwq7
slug: ignored-generated-files-in-skill-prose
title: "Correct skill prose that treats git-ignored files as visible to git"
status: backlog
tags: [skills, correctness, git]
created: 2026-10-27
updated: 2026-10-27
author: Anthony Koukoullis
depends_on: []
links: []
---
Skill prose describes the generated index, the board and the lease file as visible in git status, but the generator keeps all three out of git.

Three passages state or assume the opposite of what the generator does:
- `skills/flowcharge/SKILL.md`, the "Before commit" prompt: it expects `git status --short` to list the regenerated `index.md` and `kanban.md` and the released `.lease`.
- `skills/flowcharge/SKILL.md`, the end-of-run upkeep: it says the commit stage captures every write the bookkeeping makes.
- `skills/fc-validate/SKILL.md`, the precondition: it says the generated index, the board and the workstream record are routinely modified, and the lease file is untracked.

The generator writes `flowcharge/index.md`, `flowcharge/kanban.md`, `flowcharge/ids/` and `flowcharge/workstreams/*/.lease` into `.gitignore`, so none of them can appear in git status or in a commit. Correct each passage to match, check every other skill file and template for the same assumption, and add a test case where a document claim can be pinned.
