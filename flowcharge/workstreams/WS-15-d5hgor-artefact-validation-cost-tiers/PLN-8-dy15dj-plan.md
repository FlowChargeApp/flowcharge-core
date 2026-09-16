---
id: PLN-8-dy15dj
type: plan
workstream: WS-15-d5hgor
slug: artefact-validation-cost-tiers
title: "A validate setting and one end-of-run validation pass"
status: ready
created: 2026-09-16
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: []
links: []
---

## Summary

This plan supersedes `PLN-81-msaorv` and that plan's task list `TL-98-fog3wn`, both now
marked `dropped` in their own frontmatter, so a reader who opens the older plan knows it is
stale.

Validation is always on, at full cost. The measured run charged about 37% of its tokens
and about 40% of its working time to two validation turns and the work that applied their
findings, and a project has no way to trade that against speed or token spend. The two
stages are not equally valuable: `validate-tasks` found three executor-invisible defects
in the verification itself, while `validate-plan` deleted two real acceptance criteria. A
single off switch would keep neither.

This plan adds one key to `flowcharge/agents.md`, `validate: on | off`, and replaces the
three single-artefact validation templates with one pass that runs once per run, after the
authoring stage and before the execute-tasks prompt. Under `on`, one subagent receives the
source and both authored artefacts and makes two comparisons in a fixed order: the source
against the upstream artefact first, then the upstream artefact against the task list
second. The two comparisons report under separately labelled headings, and the upstream
artefact is never edited to agree with the task list. The pass keeps today's
`validate-tasks` baseline gate inside its second comparison, because running a task list's
`verify` commands at its `base_commit` is the one check nothing else in the pipeline can
perform. Under `off`, the orchestrator spawns no validator at all.

The setting is not finished when it works. A run must also say what it skipped, so this
plan carries WS-106-6m67j5's item 4 as a completion condition: the pipeline line names the
validation stage, and the end-of-run summary reports a validation that did not run as
**waived** or as **missing**.

The two-comparison contract lands in `skills/fc-validate/SKILL.md`, which is already the
single authority the validation templates defer to. The templates carry the routing and
the source blocks only, exactly as they do today. Two templates are built, not one:
`validate-plan-and-tasks.md` for the plan path and `validate-issues-and-tasks.md` for the
issue path. Two path-specific templates is the deliberate, settled design and not a
deviation, because the validator covers both paths and one merged file would send every
spawn the other path's instructions to read past. The count of templates is two; the count
of validation spawns per run is still one, because a run takes exactly one path.

## Scope

### Acceptance criteria

1. `flowcharge/agents.md` accepts `validate: on | off` as a fourth key, written last in
   the fixed order; an absent key and an absent file both read as `on`.
2. A standing instruction to stop validating writes that one line and leaves the file's
   other lines untouched, reported as one plain `Noted:` statement with no question.
3. Under `validate: on`, a run spawns exactly one validation subagent, after the authoring
   stage's return and before the execute-tasks prompt.
4. That subagent makes two comparisons in a fixed order and reports each under its own
   labelled heading, carrying the summary line `skills/fc-validate/SKILL.md` already
   defines, one per comparison.
5. The upstream artefact is never edited to agree with the task list: a first-comparison
   finding corrects the upstream artefact against its source, and the task list is
   re-derived from the corrected upstream artefact.
6. The second comparison applies the baseline gate and runs the task list's runnable
   `verify` steps at its `base_commit`, reaching the same per-task judgment today's
   `validate-tasks` reaches.
7. Under `validate: off`, no validation subagent is spawned for the run.
8. The pipeline line names the validation stage as its own element, marked `(waived)`
   under `off`, and the end-of-run self-check reports a validation that the `validate`
   setting turned off as `waived` in prose. A validation that did not run for any other
   reason, a spoken request included, is reported as `missing`, with one numbered
   `/fc-validate` recommendation per affected artefact.

### Out of scope

- WS-14-xbmk31's merged-authoring mechanics. They are built and merged, and this plan
  consumes them unchanged.
- Per-stage model mapping. It is the cheaper lever the workstream record names, and it
  stays the owner's to schedule (Open questions).
- WS-117-efvwlp's rule against a validator deleting real acceptance criteria. The failure
  mode survives inside the first comparison, but the rule is that record's deliverable.
- Editing `~/Work/AK/flowcharge-core-archive/flowcharge/workstreams/WS-106-6m67j5-enforce-create-validate-pairing/workstream.md`.
  Item 4 is read here and implemented here; its own record is reference material.
- WS-121-iw16jq's task-shape work, and any change to `templates/execute-parent-task.md`.
- Any change to the frontmatter schema, the ID shapes, the status enum, or
  `fc-index.mjs`'s flags.
- A suite version bump. This plan writes the CHANGELOG line; the maintainer decides the
  release.

### Assumptions

- **Built-in default is `on`.** The workstream record calls `on` "the default", and every
  existing install validates today, so an absent key must not change behaviour.
- **The pass receives the authoring stage's own `{stages}` value and runs only the
  comparisons whose artefacts this run authored.** On `tasks-only` the upstream artefact
  was authored in an earlier run against a brief this run does not hold, so re-checking it
  against a source that is not present would invent one.
- **There is no spoken one-run skip path.** WS-106-6m67j5's item 8, the spoken per-run
  "skip validation" waiver, is superseded by the `validate` key itself, so the key is the
  one legitimate way to skip validation. Per WS-106 item 4, `waived` applies only to a skip
  the `validate` setting caused; a validation that did not run for any other reason,
  a spoken request included, is reported as `missing`.
- **The issue path is covered by the same design, although its value is unmeasured.** The
  workstream record leaves that half of its first question standing, but the run shape is
  the same, and giving the issue path a different shape would be a second mechanism to
  maintain.
- **WS-106 item 4's example pipeline string is superseded, its mechanism is not.** That
  item was written when each authoring stage had its own validate stage. Its example,
  `issues → validate → spec tasks → validate`, cannot hold once one pass covers both
  links. The mechanism (one element per stage, no folding, a marked waiver, an end-of-run
  self-check) carries over intact, and the example becomes the single-validate form.
- **The `validate` key is prose-only, read by the orchestrator and by no script.**
  `fc-index.mjs` does not read `agents.md` today and gains no reader here.
- **The project stays on `0.x`, and this is a MINOR change**: a new optional `agents.md`
  key, with everything existing still working.
- **No production data, no live users, no migration.** The suite is Markdown skills and
  templates on disk; rollback is a git revert.

## Key flows

**A run under `validate: on`**: **Actor:** the orchestrator. **Preconditions:**
`flowcharge/agents.md` sets `validate: on`, or the key is absent. **Main flow:** the
authoring stage returns both artefacts; hard rule 12's scenario trace runs on that return;
the orchestrator fills the path's validation template with both artefact paths, the
authoring stage's `{stages}` value and the source block, and spawns one subagent; the
subagent makes comparison 1, applies what its correction boundary permits, then makes
comparison 2 against the upstream artefact as it then stands; the return carries one
summary line and any open finding per comparison, under two headings. **Outcome:** the
stage report prints each comparison's summary line and its open findings; the correction
detail is withheld. **Edge cases:** a comparison with no artefact to check is skipped and
named as skipped; a failed baseline gate reports the drift and runs nothing.

**A run under `validate: off`**: **Actor:** the orchestrator. **Preconditions:**
`flowcharge/agents.md` sets `validate: off`. This is the only precondition that produces a
waiver; no spoken request waives validation for a run. **Main flow:** the pipeline line
names the validation stage marked `(waived)`; the authoring stage returns; no validation
subagent is spawned; the run continues to the
execute-tasks prompt. **Outcome:** the end-of-run summary reports the stage as `waived` in
prose, with no numbered item and no `/fc-validate` recommendation. **Edge cases:** a
validation that did not run for any other reason is `missing`, not `waived`, and does
raise the numbered recommendation.

**A first-comparison finding under `validate: on`**: **Actor:** the orchestrator.
**Preconditions:** comparison 1 reported an open finding against the upstream artefact.
**Main flow:** hard rule 10 settles or relays it; where it settles, the existing
validator-applied path or re-spawn path applies it to the upstream artefact; the
orchestrator then re-derives the task list with the merged authoring template at
`{stages}: tasks-only`, pointed at the corrected upstream artefact. **Outcome:** the task
list follows the corrected upstream artefact, and the run's one re-spawn for that stage is
consumed. **Edge cases:** the re-derived task list is not validated again, which the stage
report names; the fix never runs in the other direction.

## Design

### The `validate` key

`flowcharge/agents.md` gains one key, written last in the existing fixed order that
`skills/flowcharge/SKILL.md`'s "Standing vs. one-off instructions" section defines
(SKILL.md:236-240):

```
default_agent: <verbatim string>
task_list_mode: spec | diff
prompts: manual | assist | cruise
validate: on | off
```

Accepted values: `on`, `off`. Built-in default when the key and the file are both absent:
`on`. The partial-file write rule, the never-write-a-blank-value rule, the
write-the-default-rather-than-delete rule and the delete-the-file-when-empty rule all
apply unchanged; this key adds no new write mechanism.

### `skills/flowcharge/SKILL.md`: a new section

A new `## The validation setting` section is placed immediately after `## The prompt
policy` and its `### The setting contract` subsection, matching the key's position in the
order above. It states what the setting governs, that `on` runs one pass once per run
after the authoring stage and before the execute-tasks prompt, that `off` spawns no
validator, the accepted values and the built-in default, a pointer to `## Reporting` for
the visibility mechanism, and the "No script can check" note the prompt policy already
carries (SKILL.md:307-309).

The opening sentence of "Standing vs. one-off instructions" (SKILL.md:196-198) names hard
rules 3, 4, 8, 9 and 10 as the readers of `agents.md`. It gains the validation setting
alongside them. No new hard rule is added: `prompts:` already set the precedent of a
settings key owning its own section that the Operations table and the hard rules point at.

`POLICY_SECTION_END` in `skills/flowcharge/scripts/test/run-tests.mjs:5121` is the literal
`'## Operations'` and bounds the prompt-policy slice. Inserting a section between the two
widens that slice, so the constant is repointed to `'## The validation setting'` in the
same change.

### The two merged templates

`skills/flowcharge/templates/validate-plan.md`, `validate-issues.md` and
`validate-tasks.md` are replaced by two path-specific templates, mirroring the authoring
stage's own split between `plan-and-tasks-*.md` and `issues-and-tasks-*.md`. Two templates
is the settled design here, not a deviation from it: the validator's design covers the plan
path and the issue path, and a single merged file would send every spawn the other path's
instructions to read past. Each run still spawns one validator and fills one template, the
one its path selects.

| New template | Comparison 1 | Comparison 2 |
|---|---|---|
| `templates/validate-plan-and-tasks.md` | the brief and the workstream record against the plan | the plan against the task list |
| `templates/validate-issues-and-tasks.md` | the findings against the issue list | the issue list against the task list |

Slots, per template: `{stages}`, `{plan}` or `{issuelist}`, `{tasklist}`, `{ws_dir}`,
`{{context docs}}`, `{{source material}}`. `{{source material}}` keeps its present
contract in both files: the source only, never the authoring subagent's return, rationale
or self-report. The plan path's block carries the briefing text plus the workstream record
held in `{ws_dir}`; the issue path's block carries the findings as text, and the template
keeps today's sentence that no file sits behind them.

`{stages}` is the value the authoring stage already received, passed through unchanged:

| `{stages}` | Comparison 1 | Comparison 2 |
|---|---|---|
| `plan-only`, `issues-only` | runs | skipped, and named as skipped |
| `plan-and-tasks`, `issues-and-tasks` | runs | runs |
| `tasks-only` | skipped, and named as skipped | runs |

Each template keeps the structure the three it replaces already have: `# <Title>`,
`## Role`, `## Skills` naming `/fc-validate`, `## Context` with the shared context-docs
block and the fenced source block, `## Instructions`, `## Return`, and the verbatim
open-question return block. Each keeps the present deference sentence: the skill is the
authority for every rule named, and where a template and the skill appear to disagree the
skill is right. The plan path's `## Instructions` keeps `validate-plan.md`'s
"run no command" sentence scoped to comparison 1 only, and takes `validate-tasks.md`'s
verify-execution paragraph for comparison 2.

Both templates must be added to `RULE_H_TEMPLATES`
(`skills/flowcharge/scripts/test/run-tests.mjs:4863-4869`), and each needs a rule E
`DOCS_ALLOWLIST` entry for the word `gate` in "baseline gate", replacing the entry that
names `flowcharge/templates/validate-tasks.md` at line 4713.

### `skills/fc-validate/SKILL.md`: the sequenced pass

The skill is the single place the baseline gate and the runnable command class are
defined, so the two-comparison contract belongs there and not in the templates.

**Part 1, Inputs.** The four-pairing table stands unchanged. A second permitted shape is
added: a **sequenced pass**, two of those four pairings chained in one turn, in a fixed
order. Exactly two chains are permitted, and no others:

| Chain | First pairing | Second pairing |
|---|---|---|
| plan path | brief and workstream record → plan | plan → task list |
| issue path | findings → issue list | issue list → task list |

A chain whose first pairing has no artefact to check, or whose second has none, runs the
other alone and says which it skipped.

**The correction direction, new and load-bearing.** The first comparison completes before
the second begins, and every correction it applies lands before the second comparison
reads the upstream artefact. The upstream artefact is never edited to agree with the
downstream one. A discrepancy found in the second comparison is a finding against the task
list, whatever its apparent cause; where the second comparison reveals that the upstream
artefact itself is wrong against its source, that is reported as a first-comparison
finding under the first heading, never applied. The reason is stated plainly: a validator
holding both artefacts can "align" the upstream one to the downstream one, which launders
an error rather than finding it.

**Parts 2, 3 and 4 are unchanged in substance.** The three check classes apply to each
comparison against its own source. Part 3 applies to the second comparison only, because
only a task list carries `verify` commands. Part 4's correction boundary applies per
comparison, reading "the artefact under validation" as the upstream artefact in comparison
1 and as the task list in comparison 2. The fix label every open finding already carries
is unchanged, and it is what the orchestrator routes on.

**Part 5, the return.** A sequenced pass returns one heading per comparison, each carrying
the existing fixed summary line for that comparison's artefact, then that comparison's
open findings in the existing open-question block. The heading names the comparison
number, its source and its artefact, so a finding is never read against the wrong
artefact. The unrun/unjudged clause rides comparison 2's summary line. The withheld part
keeps its single heading and names, per correction, which comparison applied it.

### `skills/flowcharge/SKILL.md`: the wiring

**Operations table** (SKILL.md:320). The `validate` row becomes: templates
`templates/validate-plan-and-tasks.md` or `-issues-and-tasks.md`; slots `{stages}`,
`{plan}` or `{issuelist}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}`,
`{{source material}}`; consumes both artefacts the authoring stage returned plus the
source it authored from; returns one summary line per comparison, plus any open finding,
with correction detail withheld.

**The `**validate**` note** (SKILL.md:375-384). The interim two-spawn pairing, and its
sentence naming WS-15-d5hgor as its replacement, are removed. The note states instead:
one pass per run under `validate: on`, spawned after the authoring stage's return and
before the execute-tasks prompt; the path chooses the template; `{stages}` passes through
from the authoring stage; the fixed comparison order and the never-align-backwards rule,
by pointer to `skills/fc-validate/SKILL.md`, not restated; no spawn at all under
`validate: off`; the stage is still not prompted, and its report still carries the summary
lines and open findings only.

**Parsing the request** (SKILL.md:390-394). Both standard chains collapse their two
validate elements into one, placed after the authoring stage:
`issues-and-tasks → validate → [prompt] execute-tasks → [prompt] commit`, and
`plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit`.

**Chaining** (SKILL.md:488-501). "at most once per authoring stage per run" becomes "at
most once per run". One rule is added: where a first-comparison finding is applied to the
upstream artefact, by the validator-applied path or by the re-spawn path, the task list is
re-derived with the merged authoring template at `{stages}: tasks-only` pointed at the
corrected upstream artefact, because the existing task list derives from the uncorrected
one. That re-spawn is the one the existing budget already allows, and the re-derived task
list is not validated again, which is the residual gap the section already names. The
sentence at SKILL.md:493-495, that the user's findings reach `validate-issues.md` from the
user rather than from the authoring stage, is repointed at the new issue-path template and
otherwise unchanged.

### The visibility mechanism, WS-106 item 4

Both changes land in `## Reporting`, the section that item 4 names.

**The pipeline line** (SKILL.md:762-763). It names every stage the run will execute, one
element per stage, the validation stage included, with no abbreviation folding validation
into its authoring stage. The example becomes
`issues → spec tasks → validate → execute (prompted) → commit (prompted)`. A validation
the setting turned off appears in the line as `validate (waived)`.

**The end-of-run self-check** (SKILL.md:769-773). Before the consolidated summary prints,
the stages that ran are compared against the announced line. Where the validation stage
did not run and the run's resolved `validate` value is `off`, it is reported as **waived**,
in prose, never as a numbered item. That setting is the only cause of a waiver. Where it
did not run for any other reason, a spoken request included, it is reported as **missing**,
and each artefact it would have checked gets one numbered, self-contained item (ID, title,
one plain sentence, per
"Talking to the user") recommending a standalone `/fc-validate` on that artefact. The
re-spawn carve-out counts as validated once and never fires this check. The check reports
only and starts no stage. Exactly the two words `missing` and `waived` are used.

### Documentation

`README.md:103-109` says `agents.md` sets "three standing defaults" and lists three lines.
It becomes four, with `validate: on | off  # whether artefacts are checked against their
source` added to the block and two sentences below it: `on` runs one check of the run's
artefacts against what they were authored from, and `off` runs none and is the cheaper,
faster choice. `CHANGELOG.md`'s `## Unreleased` gains an `### Added` line for the key and
the two templates, a `### Changed` line for the single pass and the visibility mechanism,
and a `### Removed` line for the three superseded templates.

## Stages

1. **The sequenced-pass contract in `skills/fc-validate/SKILL.md`.** Riskiest first: it is
   the contract every later stage builds against, and the correction-direction rule is the
   safeguard the workstream record calls load-bearing. Observable at the end: the skill
   defines the two permitted chains, the ordering, the never-align-backwards rule and the
   per-comparison return, and a standalone `/fc-validate` can be asked for a sequenced
   pass. The orchestrator is untouched and still runs the interim pair.
2. **The two merged templates.** They are built from the three they replace, with the
   `{stages}` routing and the two-heading return added, and both are registered in the
   harness's rule H list and rule E allowlist. Observable: both files exist, carry the
   verbatim open-question block, and the project's check command passes. The orchestrator
   still runs the interim pair, so nothing has changed behaviourally yet.
3. **The setting, defined and obeyed.** The new SKILL.md section, the fourth `agents.md`
   key, the amended standing-instruction sentence, the rewritten Operations row and
   `**validate**` note, the two collapsed chains, the Chaining bounds and the
   re-derivation rule, and the repointed `POLICY_SECTION_END`. This is the stage where the
   behaviour flips. Observable: a run under `on` spawns one validator, a run under `off`
   spawns none.
4. **The visibility mechanism.** The pipeline line and the end-of-run self-check, per
   WS-106 item 4. It follows stage 3 because it reports on the stage shape stage 3
   creates. Observable: a run states its validation stage up front and reports a skip as
   `waived` or `missing`.
5. **Remove the superseded templates.** The three files are deleted, and the harness's two
   hardcoded lists are repointed in the same change so nothing goes stale; a pin case is
   added for the correction-direction rule, mirroring the existing prompt-policy pin.
   Observable: the templates directory holds two validation templates, and the check
   command passes.
6. **Documentation.** `README.md` and `CHANGELOG.md`. Observable: the README's key block
   and the changelog both describe what ships.

## Data & compatibility

No migration and no schema change. `flowcharge/agents.md` is an optional plain-text
preference file, not a tracked artefact (`skills/flowcharge/CONVENTIONS.md:15-16`), and it
is read as prose by the orchestrator alone. An existing file that omits `validate` reads
as `on`, so every existing install keeps today's behaviour and nothing breaks unless the
user opts in.

Backward compatibility with clients: none exists to break. `fc-index.mjs` neither reads
nor writes `agents.md`, and it ignores non-artefact files at the `flowcharge/` root
(CONVENTIONS.md:56-59), so the generator, the index and the board are untouched.

The one removal is the three validation templates. `skills/flowcharge/SKILL.md` names them
in three places: the Operations table, the `**validate**` note (lines 377 and 381) and the
Chaining sentence that names `validate-issues.md` (line 493). Stage 3 rewrites all three,
so it has already stopped naming them by the time stage 5 deletes them, and no dangling
path is left and rule G stays green.
Standalone `/fc-validate` invokes the skill and never a template, so the recovery path
WS-106 item 4 recommends is unaffected.

Rollback: revert the commits. An `agents.md` left carrying `validate: off` after a revert
names a key the reverted orchestrator does not read, and the file's other lines keep their
meaning, so the worst outcome is that validation silently returns to always-on, which is
the pre-change behaviour. This is reversible at every stage.

Versioning: MINOR, a new optional `agents.md` key with everything existing still working,
per `VERSIONING.md:64-72`. The CHANGELOG line is written here; the release is not.

## Testing strategy

The project's own check command, `node skills/flowcharge/scripts/test/run-tests.mjs`, is
the unit-level coverage and runs at every stage. Three of its cases are load-bearing here:
rule G, that every path written in skill prose resolves on disk; rule H, that every
open-question-capable template carries the verbatim return block; and the allowlist
staleness case, that every `DOCS_ALLOWLIST` entry still matches a live occurrence. Stage 2
extends the rule H list and the allowlist, stage 5 prunes them, and stage 3 repoints
`POLICY_SECTION_END`. Stage 5 adds one pin case for the correction-direction rule in
`skills/fc-validate/SKILL.md`, built the same way as the existing prompt-policy pin.

Integration coverage is a documented walkthrough, which is this suite's established method
for rules no script can check (`DEVELOPMENT.md:79-83`). After stage 4, walk the edited
`skills/flowcharge/SKILL.md` end to end against these cases and record the result:

- a plan-path run with the key absent, which must resolve to `on` and spawn one validator;
- an issue-path run under `validate: on`, which must spawn one validator and no more;
- a run under `validate: off`, which must spawn none and report `waived` in prose;
- a `tasks-only` run, which must run comparison 2 alone and name comparison 1 as skipped;
- a first-comparison finding settled under `prompts: cruise`, which must correct the
  upstream artefact and re-derive the task list, never the reverse;
- a validation that did not run for a reason other than the setting, which must report
  `missing` with one numbered `/fc-validate` item per artefact;
- a spoken one-run request to skip validation, which must not produce a waiver: the
  `validate` key is the only sanctioned skip, so the stage reports `missing` with the
  numbered `/fc-validate` item, and `agents.md` is not written.

## Open questions

- **Question:** Should per-stage model mapping be built before this setting, given that it
  reduces the same cost without removing any check and would make the product's "expensive
  model only where the work happens" claim true?
  **Recommendation:** Build this setting first and model mapping after, because the two
  are independent levers and this work is also the completion condition for WS-106-6m67j5's
  visibility item; the workstream record leaves this question expressly standing, so it is
  the owner's to close rather than this plan's.

- **Question:** When a first-comparison finding forces the task list to be re-derived,
  should that re-derived task list get a second, comparison-2-only check, so that its
  `verify` steps are still run at `base_commit`, or should it inherit the existing rule
  that a re-authored artefact is not validated again?
  **Recommendation:** Inherit the existing rule, name the gap in the stage report and
  recommend a standalone `/fc-validate`, because the run's one re-spawn budget and the
  no-loop carve-out already settled this shape, and a second spawn reintroduces the cost
  this workstream exists to remove.

## Adjacent opportunities

Not requested, listed as offers only.

- Give the validation stage its own `default_agent` override, so the check survives on a
  cheap model rather than being turned off to save money. Skip: it is per-stage model
  mapping under another name, which is the first open question above.
- Record in the workstream record, not only in the run's summary, whether each artefact
  was validated. Skip: the record is the owner's document and this plan touches no
  artefact schema.

## Alternatives considered and rejected

- One template with a path-routing slot, instead of two path-specific templates. Rejected:
  the authoring stage already splits by path, and a single file would send every spawn the
  other path's instructions to read past.
- Keep two validation spawns and let the setting only turn them off. Rejected: it keeps
  the spawn count the cost analysis targets, and the ordering safeguard would have no home.
- Put the two-comparison contract in the templates and leave `skills/fc-validate/SKILL.md`
  untouched. Rejected: the skill's "exactly four pairings" input rule and its
  single-artefact summary line would contradict the templates, and the templates are
  contracted not to restate the skill's rules.
- Add a new hard rule for validation instead of a dedicated section. Rejected: `prompts:`
  already set the precedent of a settings key owning a section that the Operations table
  and the hard rules point at, and a fourteenth hard rule would duplicate it.
- Keep the three superseded templates on disk, unreferenced. Rejected: a template is
  reachable from the Operations table, the `**validate**` note, and the Chaining mention of
  `validate-issues.md`, so an unreferenced one is dead text a later reader would treat as
  live.

## Final summary

One `validate: on | off` key in `flowcharge/agents.md`, and one end-of-run validation pass
that makes two comparisons in a fixed order and never edits the upstream artefact to match
the task list. Six stages, each small enough to finish and verify in one sitting; stages 1
to 3 carry most of the work. Top risks: the correction-direction rule is the safeguard
against laundering an error and must survive the merge into one subagent; a task list
re-derived after a first-comparison finding is never re-checked, so its `verify` steps are
never run at baseline for that run; and WS-106 item 4's example pipeline string cannot
hold under a single pass, so its mechanism ships and its example changes. Two open
questions need your answer: whether per-stage model mapping should be built first, and
whether a re-derived task list should get a second, comparison-2-only check.
