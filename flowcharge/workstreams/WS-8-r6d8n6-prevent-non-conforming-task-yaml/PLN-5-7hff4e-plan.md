---
id: PLN-5-7hff4e
type: plan
workstream: WS-8-r6d8n6
slug: prevent-non-conforming-task-yaml
title: "Ban YAML block scalars on the seven task-level string fields"
status: dropped
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---

## Summary

A FlowCharge Core task list can currently be authored with a YAML folded (`>-`) or
literal (`|`) block scalar on any of seven task-level fields —
`description`, `pattern`, `imports`, `compatibility`, `gotcha`, `author`, and the
per-task `mode` override — even though every task list in this repository uses the
plain single-line double-quoted form, and `fc-task-list/SKILL.md` states no rule
against the block-scalar form. This already broke a downstream renderer in a sibling
FlowCharge project. The plan closes the gap the way `flowcharge/SKILL.md`'s
maintenance rule requires for a new schema rule: state the rule in the owning schema
skill, back it with a generator check in `fc-index.mjs`'s `--check` mode, and pin the
check with two test cases in `run-tests.mjs`, one proving the new WARN fires on the
folded form and one proving it stays silent on `implement`'s own legitimate `- |`
list-item form. A one-sentence template fix closes the one template whose existing
"rich" language could read as inviting a multi-line form.

## Scope

In-scope acceptance criteria:

- `fc-task-list/SKILL.md` states, as an explicit rule, that `description`,
  `pattern`, `imports`, `compatibility`, `gotcha`, `author`, and a per-task `mode`
  override must stay single-line double-quoted strings and must never be authored
  as a YAML block scalar, with `implement`'s own `- |` list-item form named as the
  one exception this rule does not cover.
- `fc-index.mjs --check` prints one WARN line for each of the seven fields whenever
  a task's YAML block gives that field a bare block-scalar indicator (`|`, `>`, or a
  chomping/indentation variant such as `|-`, `>+2`) as its entire value, naming the
  task list's id, file, task number, and field.
- `fc-index.mjs --check` never fires this WARN on `implement`'s own `- |`
  list-item form, and a `--check` run against this repository's current
  `flowcharge/` tree (six authored task lists, eighteen existing `- |`
  occurrences, all under `implement`) reports no new warning.
- `run-tests.mjs` pins two fixture cases for the new check: one task list carrying
  a folded or literal block scalar on one of the seven fields fires exactly the new
  WARN for that field; one task list using the normal `implement`/`- |` list-item
  form fires none.
- `tasks-from-issues-spec.md`'s existing sentence instructing `imports`,
  `compatibility`, and `gotcha` to be "rich" is immediately followed by one
  sentence stating that these three stay single-line double-quoted strings, never
  a YAML block scalar.

Out of scope:

- `tasks-from-plan-spec.md`, `tasks-from-plan-diff.md`, and
  `tasks-from-issues-diff.md`. None of the three uses "rich" language or otherwise
  invites a multi-line form for these fields, so none needs the sentence.
- Rewriting any task list currently in this repository. None uses the folded form
  on the seven fields today; there is nothing to fix.
- Any check or rule for YAML field shape in `fc-issue-list` issues, `workstream`
  records, or plan frontmatter. Context names task-level fields only.
- Enforcing double-quoting as such. The rule and the check both target the
  block-scalar indicator, not quote style; a task list using single quotes or no
  quotes on these fields is not the defect this plan closes.

Assumptions:

- The seven governed fields are exactly `description`, `pattern`, `imports`,
  `compatibility`, `gotcha`, `author`, and the per-task `mode` override, matching
  Context's own list; the frontmatter-level `mode: spec | diff` key is a different
  field (already covered by `fc-index.mjs`'s existing `TASKLIST_MODES` enum check)
  and is untouched by this plan.
- No `CONVENTIONS.md` tiebreaker sentence is needed. `CONVENTIONS.md` states the
  frontmatter schema shared by every artefact type, but nowhere governs the shape
  of a value inside a task's body-level YAML block for any field; that is
  `fc-task-list/SKILL.md`'s sole domain today (its own `mode`/`base_commit`
  frontmatter passage is the closest precedent, and even that is delegated
  entirely to the schema skill). Stating the rule only in `fc-task-list/SKILL.md`
  keeps one owner per rule and introduces no disagreement for `CONVENTIONS.md`'s
  "where a skill's prose and this document disagree" clause to arbitrate.
- The generator check is precise enough to ship without a "no script can check
  this" note. It is a deterministic, line-anchored regex over the same
  line-by-line state machine `parseTasks` already uses, its shape difference from
  `implement`'s own `- |` form is structural (a key-name match versus a
  sequence-item match) rather than heuristic, and both branches are pinned by a
  test case.
- Deployment/release: this repository ships skill files and a dependency-free
  Node script, consulted fresh from `<skills-dir>` (symlinked from a clone) or
  unzipped from a release archive; there is no running service, no production
  data, and no live user session to protect. The change lands the same way every
  other `fc-index.mjs --check` rule has: additive, git-revertable, and exercised
  by the existing `run-tests.mjs` suite before release.

## Design

**The rule (`fc-task-list/SKILL.md`).** Add a new paragraph in the **Metadata
Schema** section, placed after the `self_eval` bullet and before the existing
"**Parent tasks only have the `description` key.**" paragraph (so it sits with the
other schema-wide statements about these keys, not buried inside one field's own
bullet). Its content: `description`, `pattern`, `imports`, `compatibility`,
`gotcha`, `author`, and a per-task `mode` override are always single-line,
double-quoted strings; a YAML block scalar (`>-`, `|`, or any chomping/indentation
variant) is never used on these seven fields. State explicitly that this does not
apply to `implement`'s own list items, which legitimately use `- |` for literal
SEARCH/REPLACE content under `diff` mode and under the **Diff-mode staleness
guard**.

**The check (`fc-index.mjs`).** `parseTasks(text)` already walks a task list body
line by line, tracking the current task (`current`) between one task-checkbox line
and the next, and already extracts one field (`issues:`) from that region the same
way. Extend it, in the same loop, with one more extraction: a
`SCALAR_FIELD_RE` constant,

```
/^\s*(description|pattern|imports|compatibility|gotcha|author|mode):\s*([|>][+-]?\d*)\s*$/
```

tested against every line while `current` is set. On a match, push
`{ key: <group 1>, indicator: <group 2> }` onto a new `current.scalars` array
(mirroring `current.issues`). This anchor cannot match `implement:` (which carries
no value on its own line, only a following `- |` sequence item) and cannot match a
`- >-` or `- |` sequence-item line (which starts with `-`, never with one of the
seven key names), because the regex requires the key name at the start of the
(whitespace-trimmed) line.

`parseTasks` returns `{ open, total, items }` unchanged in shape; each `items`
entry now additionally carries `scalars: []` (mirroring the existing `issues: []`).
In the integrity-checks pass over `artefacts` (the loop that already special-cases
`a.type === 'tasklist'` for the `mode` enum), add one more `tasklist`-only pass:
for every task in `a.tasks.items`, for every entry in that task's `scalars`, push

```
`${a.id} (${a.file}) task ${t.n}: "${key}" is a YAML block scalar ("${indicator}"); use a single-line quoted string instead`
```

onto `warnings`, in the same string style `checkIds`'s `issues:` cross-reference
warning already uses (`${a.id} (${a.file}) task ${t.n}: ...`).

**The template sentence (`tasks-from-issues-spec.md`).** Immediately after the
existing sentence ending "...because those constraints are what let the executor
derive a correct edit." (the line instructing `implement` terse and
`imports`/`compatibility`/`gotcha` rich), add one sentence: these three fields
stay single-line double-quoted strings, never a YAML block scalar, however rich
their content.

## Stages

1. **Generator check, pinned by tests.** Add `SCALAR_FIELD_RE`, the
   `current.scalars` extraction in `parseTasks`, and the new `tasklist`-only WARN
   loop to `fc-index.mjs`; add the two pinned fixture cases to `run-tests.mjs`
   (folded form fires; `implement`'s `- |` form stays silent). Riskiest first: a
   detection regex that is even slightly wrong either misses the defect class
   entirely or fires a false positive across every existing task list's `- |`
   `implement` blocks. Demonstrable by `node run-tests.mjs` passing and by running
   `fc-index.mjs --check` against this repository's own `flowcharge/` tree and
   seeing no new warning.
2. **State the rule.** Add the scalar-style paragraph to `fc-task-list/SKILL.md`
   and the one sentence to `tasks-from-issues-spec.md`. Pure prose, no executable
   behavior; ordered second because it depends on nothing from stage 1 and carries
   no risk of its own, but the finished feature is only complete once the rule a
   human reads and the rule the generator enforces say the same thing.

## Data & compatibility

No data model, no migration, no stored format changes. The change is additive to
`fc-index.mjs --check`'s output: a task list that is already conforming (every
task list in this repository, confirmed by the census in Context) gets no new
warning, and a task list authored non-conformingly from this point on gets one
WARN per offending field, exactly like every other `--check` rule this generator
already enforces. `--check`'s exit-code contract (2 when at least one warning
exists) is unchanged; this only adds one more thing that can produce a warning.
Rollback is a plain revert of the `fc-index.mjs`, `run-tests.mjs`,
`fc-task-list/SKILL.md`, and `tasks-from-issues-spec.md` diffs; nothing else
depends on the new check existing.

## Testing strategy

- `run-tests.mjs` (unit-level, this repository's existing hand-rolled harness):
  the two pinned fixture cases in Scope, built with the file's existing
  `fixture`/`tasklist`/`taskLine` helpers, asserting the exact WARN line via the
  existing `expectWarns` helper.
- Manual regression check for stage 1: run
  `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --check`
  against this repository itself and confirm the WARN set is unchanged from before
  the change, given the confirmed-zero census of the seven-field block-scalar form
  here today.
- No integration or end-to-end coverage is warranted: this is a static-analysis
  rule inside an existing, already-tested generator pass.

## Open questions

None. Every point Context left to this plan's judgment (the CONVENTIONS.md
tiebreaker question and the check's precision) is resolved above as a decision,
each reversible by a later edit if it turns out wrong, and nothing here is
irreversible enough to warrant holding up authoring on it.

## Adjacent opportunities

- The same block-scalar defect class could exist on `fc-issue-list` issue fields
  (`description`, `expected`, `actual`, etc.), which are never mentioned in
  Context and were not part of the grounding investigation. Not requested; skip
  unless a future investigation confirms the same gap there.
- `fc-index.mjs`'s new `SCALAR_FIELD_RE` check reads only task-level fields;
  extending it to also flag a block scalar on the file-level frontmatter `title`,
  `description`, or `blocked` scalars is a related but separate shape check.
  Not requested; skip.

## Alternatives considered and rejected

- **A full YAML parser for exact validation.** Rejected: every existing check in
  `fc-index.mjs` (frontmatter, issues, tasks) is deliberately line-based and
  dependency-free; a real parser is a new category of complexity this file has
  never needed, for a defect a regex already catches precisely.
- **Restricting the scan to fenced ` ```yaml ` code blocks instead of the
  existing per-task line range.** Rejected: it adds bookkeeping without added
  precision, since the harder edge case (a `- |` block's own literal content
  coincidentally containing a line that looks like one of the seven keys) sits
  inside the fence either way; the existing `current`-tracked per-task range
  already matches this file's own established style for extracting a field
  (`issues:`) from a task's YAML block.
- **A `CONVENTIONS.md` tiebreaker sentence alongside the `SKILL.md` rule.**
  Rejected per the Assumptions above: `CONVENTIONS.md` owns no other task-body
  YAML shape rule for any field, so there is no existing or foreseeable
  disagreement for it to arbitrate, and adding one would duplicate a rule this
  plan can state once.
- **Updating all four task-list templates instead of only
  `tasks-from-issues-spec.md`.** Rejected: Context's own investigation confirms
  the "rich"-language ambiguity that motivates the sentence exists in that one
  template only; the other three never use the word or otherwise invite a
  multi-line form.
- **Enforcing single-quoted or unquoted forms as violations too, not just block
  scalars.** Rejected: the observed defect and the renderer failure it caused are
  both about the block-scalar indicator specifically; broadening the check to
  quote style would flag forms this repository already accepts and that Context
  never identifies as a problem.

### Final summary

Ban the YAML block-scalar form on seven task-level fields by stating the rule in
`fc-task-list/SKILL.md`, enforcing it with a two-line regex extension to
`fc-index.mjs`'s existing `parseTasks`/`--check` pass, pinning both the positive
and negative case in `run-tests.mjs`, and adding one clarifying sentence to
`tasks-from-issues-spec.md`. Two stages, small: the generator check first
(riskiest: it must catch the folded form and never fire on `implement`'s own
legitimate `- |` list-item form), documentation second. Top risks: a regex that
either misses the real defect or false-positives on the eighteen existing `- |`
occurrences in this repository's own task lists, both closed by the stage-1
pinned tests and the manual `--check` regression run. No open questions remain;
the two judgment calls Context asked this plan to make (CONVENTIONS.md tiebreaker,
check precision) are both settled as decisions above.

## Dropped

Dropped on 2026-09-13, along with workstream WS-8-r6d8n6 and TL-7-ldadxl. The
premise this plan implemented — that a YAML block scalar on a task field is a
defect to ban at the authoring source — was wrong; it is valid YAML, and the
actual defect is in a downstream renderer, already covered by that project's own
WS-113-q8fl3u. See WS-8-r6d8n6's own "Dropped" section for the full reasoning.
