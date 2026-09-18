---
id: WS-22-lq25m7
type: workstream
workstream: WS-22-lq25m7
slug: validate-accuracy-class-not-exercised
title: "fc-validate's Accuracy class is defined but not exercised, so technical inaccuracies pass through"
description: "Benchmark audits on 2026-09-18 found fc-validate repeatedly missing technical inaccuracies (a wrong line count, a false import claim, a miscounted set, a missing required CLI flag) that its own Accuracy class at SKILL.md:90-100 already covers. The mandate was never too narrow; three separate causes stop it being exercised: the skill's description reads as a blanket licence not to check technical correctness, the Accuracy bullet list is restated (not referenced) in both validate templates so a SKILL.md-only fix would stay invisible, and one ambiguous template sentence ('go looking for no file behind them') gets over-applied as grounds for checking nothing. Seven edits across three files close all three, with no new pipeline stage and no added time."
status: done
tags: [quality, correctness, prompts]
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: []
links: []
---
fc-validate's Accuracy class already covers commands, flags and arguments, but its description and templates discourage checking them, letting real inaccuracies through validation.

## Problem

`fc-validate` misses technical inaccuracies that its own rules already cover. Audits of three benchmark runs on 2026-09-18 found the same classes recurring: a wrong line count for `ARCHITECTURE.md`, a false "already imported" claim, a miscounted set of delegates, a `node --test` command missing the `--test-force-exit` flag its own cited test file says is required. Every one of these is an Accuracy finding under `fc-validate/SKILL.md:90-100` — a count, an anchor, or a claim disproved by a file the artefact itself cites. The mandate was never too narrow. It was not being exercised.

**Cause one: a brake in the description.** The `description` ends with "it never judges whether a task's approach actually works." The model reads the description first and takes that clause as a general licence not to look. Edit 1 narrows it to disclaim the *choice* of approach while stating that the technical accuracy of how it is expressed is in scope.

**Cause two: the Accuracy class is not restated where it is read.** `SKILL.md:14-17` claims the skill file is the single definition and that templates reference rather than restate. For the Accuracy class that is false — both validate templates restate the list inline, at lines 25 and 33 of each. The validator reads the template first. Adding a class to `SKILL.md` alone leaves four restatements showing the shorter list. Edits 2 and 4-7 add commands, flags and arguments to all five places at once.

**Cause three: one sentence is ungrammatical and over-applies.** `validate-issues-and-tasks.md:21` says "go looking for no file behind them." In `SKILL.md:53-55` this plainly means *the findings arrive as text, so do not hunt for a file containing them*. Stripped of that explanation it reads as "do not open files here", and it was quoted back as grounds for checking nothing. Edit 3 separates where the source lives from which files may be opened to check a claim.

**What this does not change.** The bounded-survey guard at `SKILL.md:102-104` — "You follow only the references the artefact itself makes" — is untouched. The new class sits inside it. Nothing here lets the validator survey the repo, judge whether an approach is sound, author a missing task, or delete an unsourced one. Coverage gaps, invented content and cross-artefact claims still report and are never applied.

**Why not a new pipeline stage.** The alternative considered was a final proofreading stage based on an ad-hoc review prompt. Rejected: the pipeline already takes 30-60 minutes per workstream, and reducing that is the current goal. These edits add no stage, no session and no measurable time.

**Verification.** `node skills/flowcharge/scripts/test/run-tests.mjs`, baseline 264/264 passing. No test asserts on the description text or the Accuracy list. One rule, "every path written in the prose resolves on disk", means new wording must introduce no path that does not exist.

## Recommended edits

Seven edits, three files.

**1. `fc-validate/SKILL.md:3`** — in `description`, replace:
> it never judges the code an executor produced, and it never judges whether a task's approach actually works.

with:
```
it never judges the code an executor produced or whether a task's chosen approach is right, but how that approach is expressed — every command, flag, argument, path, anchor and count — is in scope wherever a file the artefact cites disproves it.
```

**2. `fc-validate/SKILL.md`** — new bullet after line 97 (`A depends_on naming the wrong upstream ID.`):
```
- A command, flag or argument the artefact tells an executor to run, where a file it cites
  shows it wrong, incomplete or unrunnable as written.
```

**3. `validate-issues-and-tasks.md:21`** — replace:
> The findings in that block are the whole source: go looking for no file behind them.

with:
```
The findings in that block are the whole source, and no file holds them, so look for none. That limits where the source lives, not which files you may open to check the issue list's own claims.
```

**4-7. Both templates, lines 25 and 33** — in each `**Accuracy.**` bullet, replace `Anchors, paths, counts,` with:
```
Anchors, paths, counts, commands with their flags and arguments,
```
Applies to `validate-plan-and-tasks.md:25`, `:33`, `validate-issues-and-tasks.md:25`, `:33`. Nothing else in those four lines changes.

Edits 4-7 are the load-bearing ones — the templates are what the validator reads first, and without them edits 1 and 2 stay invisible. Re-run `node skills/flowcharge/scripts/test/run-tests.mjs` after; baseline is 264/264.
