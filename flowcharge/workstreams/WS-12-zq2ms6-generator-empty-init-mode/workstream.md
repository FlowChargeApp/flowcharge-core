---
id: WS-12-zq2ms6
type: workstream
workstream: WS-12-zq2ms6
slug: generator-empty-init-mode
title: "Give fc-index.mjs a mode to initialize an empty flowcharge/ tree with no workstream"
description: "fc-index.mjs currently has no way to create an empty, valid flowcharge/ tree (folder, workstreams/, index.md, kanban.md) with zero workstreams. --new-ws is the only path that creates the tree from scratch, and it always seeds one workstream as a side effect of allocating a WS id. A sibling project (the FlowCharge web app) wants to vendor this script to auto-initialize a brand-new project's flowcharge/ folder from its Add Project flow, and needs a clean empty-board init with no placeholder workstream."
status: done
tags: [generator, usability]
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: []
links: []
---
fc-index.mjs cannot create an empty flowcharge/ tree without also creating a first workstream, and there is no reason it needs one.

## The problem

The generator's plain regenerate mode refuses to run at all when flowcharge/workstreams/ does not already exist (`no flowcharge/workstreams/ directory`), and the only mode that creates the tree from scratch is `--new-ws`, which always allocates and writes one workstream record as part of claiming a WS id. There is no flag or mode that just creates flowcharge/, flowcharge/workstreams/, an empty index.md and an empty kanban.md, with zero workstreams. That gap was identified while investigating WS-129 in the sibling FlowCharge web-app repo (flowcharge, not flowcharge-core-public), whose "Add Project" flow wants to auto-initialize a brand-new project's flowcharge/ folder without ever requiring a coding-harness session first. WS-129's own workstream record already names this as a known limitation to fix here, in flowcharge-core-public, not there: "That requirement was an implementation choice made in flowcharge-core-public, not a hard requirement of the data model, and it should not need a workstream to produce an empty, valid board."

Confirmed directly by testing fc-index.mjs in this repo: a plain regenerate run against a manually pre-created, empty flowcharge/workstreams/ folder succeeds (exit 0) and writes a valid empty index.md and kanban.md with only routine WARNs for missing tags.md/ids.md. A plain regenerate run against a project with no flowcharge/ folder at all exits 1 and creates nothing. So the generator's own regenerate logic already tolerates zero workstreams once the tree exists; what is missing is a way to create that empty tree in the first place without going through --new-ws.

## The fix

Add a mode or flag to fc-index.mjs (for example `--init`) that creates flowcharge/, flowcharge/workstreams/ (empty), and the ids.md/tags.md/.gitignore bookkeeping --new-ws already handles, then regenerates an empty index.md and kanban.md, all without allocating or writing any workstream record. This should be built and land in this repo (flowcharge-core-public) because both the harness-based orchestrator and the sibling FlowCharge web app's planned vendored copy of fc-index.mjs can then share the exact same init capability, rather than the web app inventing its own separate empty-tree-creation logic.

## Why this belongs here, unified

There is no reason this capability should not exist in the canonical script. The web app (flowcharge) is going to vendor a synced copy of fc-index.mjs specifically to auto-create a project's flowcharge/ folder from its own "Add Project" UI; if the real fix lands here, that vendored copy picks it up automatically on its next sync, with no separate implementation needed on the app side.
