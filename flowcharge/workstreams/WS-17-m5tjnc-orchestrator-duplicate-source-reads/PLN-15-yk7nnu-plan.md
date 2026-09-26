---
id: PLN-15-yk7nnu
type: plan
workstream: WS-17-m5tjnc
slug: orchestrator-duplicate-source-reads
title: "Bound hard rule 8's briefing carve-out to flowcharge/ and forbid source reads"
status: dropped
created: 2026-09-19
updated: 2026-09-19
author: Anthony Koukoullis
base_commit: 3aa9d05
depends_on: []
links: [PLN-16-zn02av]
---

## Summary

A measured run showed the orchestrator opening project source files (files
outside `flowcharge/`) to fill a plan-authoring `{{briefing}}` block, and the
plan-authoring subagent then re-reading those same files moments later from a
cold context. The duplication cost roughly 4-8% of that run's total time
(326s / 55,661 output tokens, versus a 102s baseline that read zero source
files). The root cause is textual: hard rule 8 in `skills/flowcharge/SKILL.md`
licenses the orchestrator's own inline reading as "reading artefact files ...
when a briefing needs facts," naming no bound, while the "Filling a template"
procedure's step 4, a few dozen lines later in the same file, already says
briefing facts must come from "files under `flowcharge/`, never invent." The
looser of the two ("artefact files," unbound) can be, and was, stretched to
license reading project source. This plan makes hard rule 8 name the same
bound step 4 already uses, in the same words, and adds one plain sentence,
at the site where the orchestrator composes a plan-authoring briefing, saying
it never opens a project source file to fill one. No mechanism is added:
per `DEVELOPMENT.md`'s "no script can check this" pattern, nothing on disk
records why a file was opened, so a `--check` warning cannot enforce this;
the fix is wording, not a script.

## Scope

In scope, exactly three files, one edit each:

1. `skills/flowcharge/SKILL.md` — hard rule 8's carve-out clause only (the
   closing phrase of rule 8, currently "...and reading artefact files when a
   stage's return needs verifying or a briefing needs facts."). Renamed to use
   step 4's own bound, "files under `flowcharge/`," and to add the explicit
   prohibition on opening a project source file to fill a briefing.
2. `skills/flowcharge/templates/plan-and-tasks-spec.md` — the `{{briefing}}`
   placeholder paragraph at line 16, appending one sentence stating the same
   prohibition, in the same bound wording, at the exact site the orchestrator
   reads while composing that block.
3. `skills/flowcharge/templates/plan-and-tasks-diff.md` — line 16, the
   identical addition, byte-for-byte the same as file 2's.

Out of scope, per Context's decisions already taken: `issues-and-tasks-spec.md`,
`issues-and-tasks-diff.md`, `execute-parent-task.md`, and every hard rule other
than 8. The `{{context docs}}` block and its instructions are untouched (that
block is explicitly allowed to check the project root already). Validation
behavior is untouched. No script, `--check` warning, or test case is added;
this is a prose-only change to skill and template files, and `DEVELOPMENT.md`
already explains why no script can cover it.

Assumption: "files under `flowcharge/`" (the exact bound step 4 already uses,
and the exact wording the workstream record's own reasoning names) is the
correct, and only, wording to converge hard rule 8 on. A wrong reading here is
a wording tweak, recoverable by a follow-up edit, so this is an assumption,
not an open question.

## Design

Two edits, each a self-contained substring substitution, following the same
pattern the prior, now-done WS-16-1n524u round used for the same lines.

**1. `skills/flowcharge/SKILL.md`, hard rule 8's carve-out clause** (lines
90-97 at `base_commit`; the edited fragment is 96-97):

Before:
> ...writing `flowcharge/agents.md` when a standing preference
> is recognized (see "Standing vs. one-off instructions"), and reading artefact
> files when a stage's return needs verifying or a briefing needs facts.

After:
> ...writing `flowcharge/agents.md` when a standing preference
> is recognized (see "Standing vs. one-off instructions"), and reading files
> under `flowcharge/` when a stage's return needs verifying or a briefing
> needs facts, never a project source file — a file outside `flowcharge/` —
> to fill one.

This replaces "artefact files" with "files under `flowcharge/`" (now
word-for-word the same bound phrase step 4 already carries), and appends the
explicit prohibition, defining "project source file" inline as "a file
outside `flowcharge/`" so the bound and the prohibition read as one fact, not
two the reader must reconcile. Nothing else in rule 8, and no other hard
rule, changes. Two other places in `SKILL.md` (hard rules 12 and 13) paraphrase
rule 8's carve-out as "rule 8's carve-out for reading artefact files when a
briefing needs facts" without quoting it verbatim; per Context's explicit
exclusion of every hard rule but 8, these paraphrases are left as they stand.
They refer to the carve-out by concept, not by verbatim quotation, so they
stay accurate after rule 8's own wording changes.

**2. `skills/flowcharge/templates/plan-and-tasks-spec.md` and
`plan-and-tasks-diff.md`, line 16** (identical in both files today, confirmed
by an md5 comparison of the line taken while authoring this plan):

Before (one long line, wrapped here for readability):
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `plan-only`: the feature
> to be planned and why it is wanted, the decisions already taken and the
> constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus
> anything the task-authoring half needs that the plan itself will not
> carry. When `{stages}` is `tasks-only`: the decisions already taken and the
> constraints in play.}}

After:
> {{everything the subagent needs and cannot discover for itself, complete on
> the points below, no padding. When `{stages}` is `plan-only`: the feature
> to be planned and why it is wanted, the decisions already taken and the
> constraints in play. When `{stages}` is `plan-and-tasks`: the same, plus
> anything the task-authoring half needs that the plan itself will not
> carry. When `{stages}` is `tasks-only`: the decisions already taken and the
> constraints in play. Draw its facts from the conversation, the chained
> artefacts, and files under `flowcharge/`; never open a project source file
> — a file outside `flowcharge/` — to fill this block.}}

The appended sentence states the prohibition plainly, once, at the exact
point the orchestrator reads while composing this block (the "Filling a
template" step 4 procedure in `SKILL.md` instructs the orchestrator to fill
each `{{...}}` block by satisfying the points its own placeholder text names,
so the placeholder itself is where this instruction reaches the orchestrator
soonest). It reuses step 4's exact bound wording, "files under `flowcharge/`,"
so the template and `SKILL.md` never disagree on it. Nothing else on the
line changes, and the `{{context docs}}` block above it (which the request
explicitly excludes) is untouched.

## Stages

1. **Bound hard rule 8 to `flowcharge/` and state the prohibition.** Goal:
   land the `SKILL.md` edit above. Its own stage because it is a hard rule
   read by every stage of every run, independent of any one template.
   Observable when it ends: hard rule 8's carve-out clause reads "files under
   `flowcharge/`" and states the project-source prohibition; `git diff --stat`
   touches only `skills/flowcharge/SKILL.md`, and only at rule 8.
2. **State the same prohibition in the plan-and-tasks briefing placeholder,
   in both modes.** Goal: land the identical sentence in
   `plan-and-tasks-spec.md` and `plan-and-tasks-diff.md` line 16. One stage
   covering both files because the edit is one sentence appended to one
   shared, currently byte-identical line, with no sequencing between the two
   files. Observable when it ends: both files' line 16 carry the identical
   added sentence, an md5 (or `diff`) of the two lines matches, and
   `git diff --stat` for this stage touches only these two template files.

## Data & compatibility

None. This is a wording change in one skill-instructions file and two
prompt-template files, none of which hold runtime state, a schema, or an API
surface. `{ws_dir}`, `{ws_id}`, `{slug}`, `{plan}`, `{stages}`, and the
`{{context docs}}` block are untouched, so every existing chaining and
slot-filling behavior this suite already relies on is unaffected. No
migration or rollback beyond a normal `git revert` applies.

## Testing strategy

No unit or integration coverage applies: this suite ships no automated test
that parses briefing prose for the presence of a bound or a prohibition. Per
`DEVELOPMENT.md`, a rule "put into a numbered procedure is anchored by
execution order... documented guidance is its only defence," and the same
holds here: nothing on disk records why the orchestrator opened a file, so
verification is the greps this plan's acceptance criteria name (below),
plus `node skills/flowcharge/scripts/test/run-tests.mjs` run once as a
regression backstop — its docs-consistency check does not govern this free
prose, so a passing run only confirms this change introduces no unrelated
breakage, never that the new wording itself is correct.

## Acceptance criteria

- AC1: `skills/flowcharge/SKILL.md` hard rule 8's carve-out clause contains
  the phrase `` files under `flowcharge/` `` (measured now, at `base_commit`:
  the file contains this exact phrase once already, at line 459 in step 4;
  after this change it must appear twice — once there, unchanged, and once in
  rule 8).
- AC2: `grep -c 'reading artefact' skills/flowcharge/SKILL.md` drops from 3
  (measured now, at `base_commit`: lines 96, 157, 193) to 2 (only the
  paraphrases at hard rules 12 and 13 remain; rule 8's own occurrence is
  gone).
- AC3: `skills/flowcharge/SKILL.md` hard rule 8 states, in its own words, that
  the orchestrator never opens a project source file to fill a briefing
  (measured now, at `base_commit`: `grep -c "project source" skills/flowcharge/SKILL.md`
  returns 0; after this change, at least 1).
- AC4: `skills/flowcharge/templates/plan-and-tasks-spec.md` line 16 and
  `skills/flowcharge/templates/plan-and-tasks-diff.md` line 16 both contain
  the added sentence, and the two lines stay byte-identical (measured now, at
  `base_commit`: the two lines already match, confirmed by identical md5
  sums; after this change, the md5 sums of the two (still one-line) files'
  line 16 must still match each other).
- AC5: `grep -c "project source" skills/flowcharge/templates/plan-and-tasks-spec.md`
  and the same command against `plan-and-tasks-diff.md` both return 0 now, at
  `base_commit`, and both return 1 after this change.
- AC6: No file other than the three named in Scope changes
  (`git diff --stat` scoped to `skills/flowcharge/` shows exactly these
  three paths).
- AC7: `node skills/flowcharge/scripts/test/run-tests.mjs` reports the same
  pass count after this change as it does at `base_commit` (a regression
  backstop only; none of its rules govern this prose).

## Open questions

None. Context names the exact files, the exact bound wording ("files under
`flowcharge/`"), and the exact behavior to forbid; nothing is left for a
later call.

## Alternatives considered and rejected

- Add the prohibition sentence only to hard rule 8, and leave the two
  templates' line 16 unedited: rejected because Context's own decisions
  already taken name the templates' shared line-16 paragraph as in scope
  alongside hard rule 8, and because the workstream record's own reasoning
  states the fix as two coupled actions ("delete... Add one line... Bound
  hard rule 8's carve-out"), not one.
- Add the prohibition sentence only to the two templates, and leave hard rule
  8's "artefact files" wording as it stands: rejected because the finding
  this workstream is built on is precisely that rule 8's unbound wording is
  what let the looser reading happen; leaving it unbound would repeat the
  exact tension a future reader could exploit the same way, even with the
  templates fixed.
- Reference `flowcharge/CONVENTIONS.md`'s file-layout section instead of
  restating "files under `flowcharge/`" inline: rejected because it would
  require a reader to open a second document to learn the bound both rule 8
  and step 4 already state inline, and it would not make rule 8 and step 4
  agree "word-for-word," which Context requires.
- Fold the two stages into one: rejected because the two edits touch
  disjoint files with no shared anchor text and no ordering dependency;
  splitting them keeps each stage's `git diff --stat` scoped to what that
  stage alone changed, matching the pattern the prior WS-16-1n524u round used
  for the same kind of edit.

## Final summary

Two stages, two edits: bind hard rule 8's briefing carve-out in
`skills/flowcharge/SKILL.md` to the same "files under `flowcharge/`" bound
step 4 already states, and add its explicit "never a project source file"
prohibition there; then state the identical prohibition, in the same bound
wording, in the shared `{{briefing}}` placeholder line both
`plan-and-tasks-spec.md` and `plan-and-tasks-diff.md` carry. No mechanism,
no script check, no behavioral change beyond stopping project-source reads
for a briefing. No open questions.
