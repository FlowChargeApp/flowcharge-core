---
id: PLN-17-2ai3df
type: plan
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Forbid project reads at request intake and strip source facts from every briefing"
status: done
created: 2026-09-20
updated: 2026-09-20
author: Anthony Koukoullis
base_commit: a835a70
depends_on: []
links: []
---

## Scope

The first fix (`PLN-16-zn02av`, executed at `a835a70`) bound the orchestrator's read
permission to "files under `flowcharge/`" and stated a prohibition in "Filling a template"
step 4 and in the two `plan-and-tasks-*.md` briefing placeholders. A live benchmark showed the
orchestrator still opening `src/` and `e2e/` files and packing line numbers and quoted source
into its briefing. The prohibition failed for two reasons the workstream record states: it was
placed after the reads happen (the model opens the code at request intake, to understand the
request, before it reaches step 4), and it was scoped to one purpose ("to fill this block"), so
facts gathered under any other purpose entered the briefing legally as "facts from the
conversation".

This plan implements the six items the workstream record's "Reopened 2026-09-20" section lists:

1. An unconditional prohibition at "Parsing the request", before the operation chains.
2. A checkable content rule at "Filling a template" step 5: a filled briefing carries no path
   outside `flowcharge/`, no line number, no quoted source and no file contents, except what
   the request or a subagent's return supplied; anything else is deleted before the spawn.
3. The `{{briefing}}` placeholder in both `plan-and-tasks-*.md` templates reworded to drop
   "complete on the points below" and to ask for constraints on the outcome, not findings
   about the code.
4. The `{{context docs}}` placeholder in both templates narrowed to a bare listing: name
   project-root documents by path and by what their filename implies, never open them.
5. Every briefing authored fresh; an earlier briefing is never pasted into a later spawn.
6. Hard rule 8's clause reworded so it no longer frames briefing-writing as "a briefing needs
   facts".

**Files and passages touched, and nothing else** (line numbers at `base_commit` `a835a70`):
- `skills/flowcharge/SKILL.md`: hard rule 8's carve-out clause (lines 96-98); hard rule 12's
  citation of it (lines 163-164); hard rule 13's citation of it (lines 198-200); "Parsing the
  request", the paragraph before the chains (lines 425-427); "Filling a template" step 4
  (lines 473-477); step 5 (line 478).
- `skills/flowcharge/templates/plan-and-tasks-spec.md`: line 14 (`{{context docs}}`) and line
  16 (`{{briefing}}`).
- `skills/flowcharge/templates/plan-and-tasks-diff.md`: the same two lines, identical wording.
  Lines 14 and 16 are byte-identical between the two templates at `base_commit` and stay so.

**Explicitly out of scope**, per the workstream record: a scripted `fc-index.mjs --check`
enforcement of the content rule (needs a persisted-prompt file class and a `CONVENTIONS.md`
entry), and any backstop outside the skill.

**Assumption 1: the prohibition names `<skills-dir>` as well as `flowcharge/`.** The
orchestrator must read its own templates (hard rule 1) and this skill's scripts. Those live
under `<skills-dir>`, the token `SKILL.md` already uses for the skills directory, so the
prohibition permits `flowcharge/` and `<skills-dir>` and nothing else.

**Assumption 2: two exceptions, both already sanctioned.** The `{{context docs}}` block requires
a look at the project root; this plan makes that a directory listing, not a read. The commit
stage runs inline via the fc-git skill and reads the diff it commits. Both are named in the
intake paragraph so the rule has no unstated holes.

**Assumption 3: the content rule exempts what the request or a subagent's return supplied.**
A user may name `src/public/app.ts` in the request, and an issues-and-tasks briefing carries
finding locations that came from the user or from an investigate return. Those are not the
orchestrator's own reconnaissance. The rule bans only what the orchestrator gathered itself,
which is the traceable criterion: every path, line number or quotation in a briefing must be
present verbatim in a user message or a subagent return, or it is deleted.

**Assumption 4: hard rules 12 and 13 drop the purpose clause from their citation.** Both cite
"rule 8's carve-out for reading files under `flowcharge/` when a briefing needs facts". Once
rule 8 no longer says "needs facts", the shortest accurate citation is "rule 8's carve-out for
reading files under `flowcharge/`", and that is what both rules get.

**Assumption 5: the content rule applies to every `{{briefing}}` block, not to `{{context
docs}}` or `{{source material}}`.** The operations table names `{{briefing}}` as the slot for
plan-and-tasks, issues-and-tasks, execute-tasks and backlog-add. `{{context docs}}` lists
paths by design, and `{{source material}}` carries findings for validation to compare, so
neither is scanned.

**Assumption 6: the other three templates' `{{context docs}}` line is not edited.** The same
`{{context docs}}` text sits in `issues-and-tasks-spec.md` (line 13), `issues-and-tasks-diff.md`
(line 13) and `execute-parent-task.md` (line 17). The scope names only the two
`plan-and-tasks-*` templates, so those three keep the old wording. See Open questions.

## Approach

**Chosen: move the rule to intake, add a post-draft content check, remove the pressure.**

1. Insert a paragraph at the top of "Parsing the request" that forbids reading any file
   outside `flowcharge/` and `<skills-dir>` for the whole run, by any tool and for any purpose,
   with the two sanctioned exceptions named.
2. Extend step 5 with a second re-scan over every `{{briefing}}` block for the four banned
   content kinds, with the delete-do-not-paraphrase instruction.
3. Rewrite step 4 to point at the intake rule, to keep self-gathered facts out even when they
   sit in the conversation, to author every briefing fresh, and to describe the
   `{{context docs}}` look as a listing.
4. Reword rule 8's clause: "a briefing restates a decision already taken or a constraint on the
   outcome" replaces "a briefing needs facts", and "project-root listing" replaces
   "project-root check". Rules 12 and 13 cite the carve-out without the purpose clause.
5. Rewrite both templates' `{{briefing}}` placeholder to ask for "only what the subagent cannot
   discover for itself" and to state the content rule at the point of drafting, and both
   templates' `{{context docs}}` placeholder to list rather than open.

**Rejected: strengthen the step-4 wording only.** Step 4 is reached after the reads have
happened. A stronger sentence there changes nothing about intake behaviour.

**Rejected: an intent rule without a content rule.** The benchmark showed a loaded intent rule
being disregarded. A content rule is checkable on the drafted text, after the fact, by the same
model that drafted it, and gives the rule a concrete failure it can detect.

**Rejected: ban every path and line number outright.** That strips finding locations from an
issues-and-tasks briefing and strips a path the user typed. The exemption in Assumption 3 keeps
the rule precise.

**Rejected: a scripted check.** Out of scope per the workstream record; nothing on disk records
a filled prompt, so there is nothing for `--check` to scan until a persisted-prompt file class
exists.

## Design: the exact text changes

All "Current" blocks are the text at `base_commit` `a835a70`. Indentation is part of the text.
`SKILL.md` line numbers shift as earlier edits land: item 1 adds one line, item 3 removes one,
item 4 adds nine, item 5 adds four, item 6 adds four.

**1. `skills/flowcharge/SKILL.md`, hard rule 8's carve-out clause (lines 96-98).**

Current:
```
   is recognized (see "Standing vs. one-off instructions"), and reading
   files under `flowcharge/` (plus the project-root check the `{{context docs}}`
   block names) when a stage's return needs verifying or a briefing needs facts.
```
New:
```
   is recognized (see "Standing vs. one-off instructions"), and reading
   files under `flowcharge/` (plus the project-root listing the `{{context docs}}`
   block names) when a stage's return needs verifying or a briefing restates a
   decision already taken or a constraint on the outcome.
```

**2. `skills/flowcharge/SKILL.md`, hard rule 12's citation (lines 163-164).**

Current:
```
    own reading, under rule 8's carve-out for reading files under `flowcharge/`
    when a briefing needs facts, never a subagent's. When the workstream record
```
New:
```
    own reading, under rule 8's carve-out for reading files under `flowcharge/`,
    never a subagent's. When the workstream record
```

**3. `skills/flowcharge/SKILL.md`, hard rule 13's citation (lines 198-200).**

Current:
```
    the same stage. It is the orchestrator's own reading, under rule 8's
    carve-out for reading files under `flowcharge/` when a briefing needs facts,
    never a subagent's.
```
New:
```
    the same stage. It is the orchestrator's own reading, under rule 8's
    carve-out for reading files under `flowcharge/`, never a subagent's.
```

**4. `skills/flowcharge/SKILL.md`, "Parsing the request", opening paragraph (lines 425-427).**

Current:
```
## Parsing the request

Map the user's English onto an ordered subset of operations. The standard chains:
```
New:
```
## Parsing the request

From the moment a request arrives until the run ends, read no file outside
`flowcharge/` and `<skills-dir>`, by any tool: not to understand the request, not
to check feasibility, not to fill a briefing. The subagents read the target
project; you never do. What you need to know is what the user said and what the
chained artefacts record; everything else is the spawned stage's job to discover
from a cold context, by design. Two exceptions: the project-root listing the
`{{context docs}}` block names, which is a listing and not a read, and the commit
stage, where the fc-git skill reads the diff it commits.

Map the user's English onto an ordered subset of operations. The standard chains:
```

**5. `skills/flowcharge/SKILL.md`, "Filling a template" step 4 (lines 473-477).**

Current:
```
4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
   the points the placeholder text names. Draw facts from the conversation, the
   chained artefacts (read them if needed), and files under `flowcharge/`; never
   invent, never open a file outside `flowcharge/`. The `{{context docs}}` block is
   the one exception: its own text names the project-root files to check for.
```
New:
```
4. Replace each `{{...}}` block with a briefing you author now, satisfying exactly
   the points the placeholder text names. Draw on the conversation, the chained
   artefacts (read them if needed), and files under `flowcharge/`; never invent, and
   never open a file outside `flowcharge/` (see "Parsing the request"). Facts about
   the target project that you gathered yourself, by any read, stay out even when
   they sit in the conversation: the subagent rediscovers them from a cold context,
   by design. Author every briefing fresh from the placeholder's points, and
   never paste an earlier briefing. The project-root listing the `{{context docs}}`
   block names is the one look outside `flowcharge/`: a listing, not a read.
```

**6. `skills/flowcharge/SKILL.md`, "Filling a template" step 5 (line 478).**

Current:
```
5. Re-scan the result against the template: outside the slots, nothing changed.
```
New:
```
5. Re-scan the result against the template: outside the slots, nothing changed.
   Then re-scan every `{{briefing}}` block: it carries no path outside
   `flowcharge/`, no line number, no quoted source, and no file contents, except
   what the user's request or a subagent's return supplied verbatim. Delete any
   other such item; do not paraphrase it into a hint.
```

**7. `skills/flowcharge/templates/plan-and-tasks-spec.md`, line 14 (`{{context docs}}`).**

Current:
```
{{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
```
New:
```
{{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what its filename and location imply it covers, and so when to read it. List the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and name only files the listing showed; never open one to describe it. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
```

**8. `skills/flowcharge/templates/plan-and-tasks-spec.md`, line 16 (`{{briefing}}`).**

Current:
```
{{everything the subagent needs and cannot discover for itself, complete on the points below, no padding. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, the decisions already taken and the constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: the decisions already taken and the constraints in play. Never open a file outside `flowcharge/` to fill this block.}}
```
New:
```
{{only what the subagent cannot discover for itself: the request, the decisions already taken, and the constraints on the outcome (scope, compatibility, what must not change). Nothing about how the code is built: no path outside `flowcharge/`, line number or quoted source beyond what the request or a subagent's return supplied; the subagent reads the target project itself. When `{stages}` is `plan-only`: the feature to be planned and why it is wanted, pointing at `{ws_dir}/workstream.md` rather than restating its body, plus those decisions and constraints. When `{stages}` is `plan-and-tasks`: the same, plus anything the task-authoring half needs that the plan itself will not carry. When `{stages}` is `tasks-only`: those decisions and constraints only. Author this fresh; never paste an earlier briefing.}}
```

**9. `skills/flowcharge/templates/plan-and-tasks-diff.md`, lines 14 and 16.**

Identical changes to the same two lines, character-for-character matching items 7 and 8.

After all edits, `SKILL.md` contains "briefing needs facts" on no line (3 at `base_commit`:
lines 98, 164, 199), "project-root listing" on three lines (rule 8, intake paragraph, step 4),
"never paste an earlier briefing" once (step 4), "no line number" once (step 5) and "From the
moment a request arrives" once. Each template contains "never open one to describe it" once,
"only what the subagent cannot discover" once, "never paste an earlier briefing" once, and
"complete on the points below" on no line.

## Acceptance criteria

1. "Parsing the request" opens with the intake paragraph exactly as Design item 4's New block,
   before "Map the user's English", and names both exceptions.
2. Step 5 reads exactly as Design item 6's New block: the content re-scan names the four banned
   kinds, the verbatim-supplied exemption, and the delete-do-not-paraphrase instruction.
3. Step 4 reads exactly as Design item 5's New block: it points at "Parsing the request",
   keeps self-gathered facts out even when they sit in the conversation, requires every
   briefing to be authored fresh, and describes the `{{context docs}}` look as a listing.
4. Hard rule 8's clause reads exactly as Design item 1's New block. A single-line grep for
   "briefing needs facts" over `SKILL.md` returns 0 (3 at `base_commit`). Rules 12 and 13 cite
   "rule 8's carve-out for reading files under `flowcharge/`" with no purpose clause.
5. Both templates' line 16 reads exactly as Design item 8's New block. A grep for "complete on
   the points below" returns 0 in each (1 at `base_commit`).
6. Both templates' line 14 reads exactly as Design item 7's New block: it says "List the
   project root", "name only files the listing showed" and "never open one to describe it".
7. Lines 14 and 16 are byte-identical between the two templates after the edits, as they are
   at `base_commit`.
8. No other line in either template changes, and no file other than the three named in Scope
   is modified. `git diff` against `base_commit` shows hunks only at the passages Scope names.
9. No new text names a model, vendor or harness product, or depends on a harness-specific
   feature; `<skills-dir>` is the token `SKILL.md` already uses for the skills directory.
10. No task's `verify` step names a test-suite, build or lint command.

## Testing strategy

This is a prose change to skill files. No test-suite, build or lint command is added as a
verify step, per the `plan-and-tasks-*` templates. The repository's standing skill-file
consistency checks cover every `skills/**/*.md` and remain the user's own step after execution.

Verification is by direct reading of each edited passage against the Design section, and by
greps and diffs whose expected values are measured at `base_commit` before being written down:

- AC1: grep for "From the moment a request arrives" in `SKILL.md` (0 before, 1 after).
- AC2: grep for "no line number" in `SKILL.md` (0 before, 1 after).
- AC3: grep for "never paste an earlier briefing" in `SKILL.md` (0 before, 1 after).
- AC4: grep for "briefing needs facts" (3 before, 0 after) and "project-root listing" (0
  before, 3 after) in `SKILL.md`.
- AC5 and AC6: greps for "only what the subagent cannot discover", "never open one to describe
  it" (0 before, 1 after each template) and "complete on the points below" (1 before, 0 after
  each template).
- AC7: a diff of line 14 and of line 16 between the two templates (empty before and after).
- AC8: `git diff -U0 a835a70` limited to `skills/` shows three files and hunks only at the
  passages named in Scope.

## Open questions

- **Question:** Should the same `{{context docs}}` rewording (Design item 7) also be applied to
  the byte-identical line in `issues-and-tasks-spec.md` (line 13), `issues-and-tasks-diff.md`
  (line 13) and `execute-parent-task.md` (line 17), which after this plan will still tell the
  orchestrator to say "what that document covers", an instruction it can only satisfy by
  opening the document the intake rule now forbids?
- **Recommendation:** Yes, in a follow-up task list under this workstream with the identical
  SEARCH/REPLACE block for each, because the intake rule and those three placeholders
  otherwise contradict each other. It is left out of this plan because the reopened scope names
  only the two `plan-and-tasks-*` templates, and the contradiction is recoverable later.
