---
id: PLN-7-7gnb3p
type: plan
workstream: WS-14-xbmk31
slug: pipeline-stage-codebase-resurvey
title: "Merge the paired authoring stages and stop the unconditional file re-survey"
status: done
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: []
links: []
---

## Summary

The authoring pipeline spawns one subagent per artefact, so every stage pays about 52,000
tokens of fixed setup and rebuilds the codebase knowledge the stage before it already had.
WS-14-xbmk31 measured one run: `create-plan` and `tasks-from-plan` each touched 32 files,
21 of them the same file.

This plan merges each authoring pair into one subagent, removes the re-survey rule that
made the duplication mandatory, and replaces it with a staleness check. Six plan-path and
issue-path template files become four merged ones, addressed by a `{stages}` slot that
selects which of the two artefacts the spawn writes. The first artefact's context is
inherited by the second for free. Two mode defects that assert SEARCH/REPLACE blocks in
spec-mode code paths are corrected at the same time, and the shared context documents stop
being inlined in full into every spawn.

Nothing here changes what the artefacts contain. It changes how many subagents write them
and how much each one re-reads.

## Scope

All code changes land in `~/Work/AK/flowcharge-core-public/`. This plan and its task list
live in `~/Work/AK/flowcharge-core-archive/`.

### Acceptance criteria

1. `templates/plan-and-tasks-spec.md` and `templates/plan-and-tasks-diff.md` exist, and
   `templates/create-plan.md`, `templates/tasks-from-plan-spec.md` and
   `templates/tasks-from-plan-diff.md` do not.
2. `templates/issues-and-tasks-spec.md` and `templates/issues-and-tasks-diff.md` exist, and
   `templates/create-issues.md`, `templates/tasks-from-issues-spec.md` and
   `templates/tasks-from-issues-diff.md` do not.
3. A merged template run with `{stages}` set to `plan-only` writes the plan and stops; set
   to `tasks-only` it reads the plan at `{plan}` and writes the task list only; the issue
   path behaves the same way with `issues-only`, `issues-and-tasks` and `tasks-only`.
4. In spec mode on the plan path, a target file is read again only when the staleness check
   names it, when the plan carries no `base_commit`, or when a SEARCH/REPLACE block is
   written for that file.
5. A plan authored by the merged stage carries `base_commit` in its frontmatter, and
   `CONVENTIONS.md` documents `base_commit` as an optional plan key.
6. `tasks-from-issues-spec.md`'s read-the-target-file-and-derive-the-anchor rule survives
   word for word in `issues-and-tasks-spec.md`.
7. `templates/execute-parent-task.md` branches on the task list's `mode` key: a diff-mode
   subtask applies its block verbatim, a spec-mode subtask derives the edit from
   `implement` prose and aborts when the named anchor is absent.
8. No template carries an `@`-prefixed context-document bullet; each carries a
   once-per-run resolved list of repo-relative paths with one line per document saying what
   it covers and when to read it.

### Out of scope

- The `validate` setting itself: its name, its values, and the single-pass two-comparison
  validator. WS-118-xjdovc owns them.
- The `validate-plan.md`, `validate-issues.md` and `validate-tasks.md` template bodies.
  This plan changes when they are spawned, never what they say, except for their shared
  context-document block under criterion 8.
- WS-106-6m67j5's item 4 visibility mechanism, and WS-121-iw16jq's task-shape verbosity.
- `fc-index.mjs` and its test fixtures. No generator behaviour changes.
- Historical artefacts under `flowcharge/workstreams/` in either repository, and the
  `dist/` release zip.

### Assumptions

- The three-value `{stages}` slot is the right way to keep the plan-only, issue-list-only
  and tasks-only entry points alive. The owner's rule bans split-stage authoring of a pair
  in one run; it does not ban a run that legitimately wants one artefact.
- `base_commit` on a plan is optional and forward-only, with no generator check. This
  follows `CONVENTIONS.md`'s own precedent for the automatic `issue` and `feature` tags: a
  required key would WARN across every plan already on disk.
- The merged stage claims both artefact IDs itself, as each template does today. The
  orchestrator still pre-claims nothing.
- The suite has no production data, no live users and no migration. A change is shippable
  at any commit, and `## Unreleased` in `CHANGELOG.md` collects the entries until a release
  is cut. Rollback is `git revert`.
- Removing `@`-inlining does not degrade output, because each document keeps a one-line
  note saying when it is needed and the subagent may read it in full.

## Key flows

**Plan a feature and author its tasks**: **Actor:** the orchestrator, on "plan X and build
it". **Preconditions:** the workstream folder exists and its lease is held. **Main flow:**
the orchestrator fills `plan-and-tasks-spec.md` with `{stages}: plan-and-tasks` and
`{plan}: none`, spawns one subagent, and that subagent claims a PLN ID, writes the plan
with `base_commit` set to HEAD, then claims a TL ID and writes the task list from the plan
it just wrote, re-reading no file because the staleness check finds no commit between
`base_commit` and HEAD. **Outcome:** two artefacts from one spawn, one fixed setup charge
instead of two. **Edge cases:** the subagent leaves an open question in the plan, so it
authors no task for the stage that rests on it and reports both artefacts with that gap; a
target file named by the plan is missing, so the divergence is recorded and the rest
continues.

**Correct a plan after its tasks exist**: **Actor:** the orchestrator, after `validate-plan`
reports a finding against the merged stage's plan. **Preconditions:** both artefacts exist
and the finding is settled or relayed under the prompt policy. **Main flow:** the fix
reaches the plan by the validator-applied path or the re-spawn path, the orchestrator bumps
the plan's `updated`, then re-spawns the merged template once with `{stages}: tasks-only`
and `{plan}` pointing at the corrected plan. **Outcome:** the task list is re-derived from
the corrected plan without re-authoring the plan. **Edge cases:** the finding is structural
and the plan itself must be rewritten, so the re-spawn uses `plan-and-tasks` and both
artefacts are authored again under new IDs.

## Design

### Template inventory

| Before | After | Note |
|---|---|---|
| `create-plan.md`, `tasks-from-plan-spec.md`, `tasks-from-plan-diff.md` | `plan-and-tasks-spec.md`, `plan-and-tasks-diff.md` | three files to two; spec and diff stay separate files because the mode rules genuinely differ |
| `create-issues.md`, `tasks-from-issues-spec.md`, `tasks-from-issues-diff.md` | `issues-and-tasks-spec.md`, `issues-and-tasks-diff.md` | three files to two |
| `execute-parent-task.md` | unchanged name, mode branch added | |
| `investigate.md`, `kanban-add.md`, `validate-plan.md`, `validate-issues.md`, `validate-tasks.md` | unchanged names, shared context block replaced | |

### Slot contracts

Both merged templates take the slots their predecessors took, plus one new slot. Values are
literal strings the orchestrator writes; the branch itself lives in the template, so hard
rule 1 holds and the orchestrator authors no instruction inline.

- `{stages}` on the plan path: exactly one of `plan-only`, `plan-and-tasks`, `tasks-only`.
- `{stages}` on the issue path: exactly one of `issues-only`, `issues-and-tasks`,
  `tasks-only`.
- `{plan}`: a repo-relative path to an existing plan when `{stages}` is `tasks-only`,
  otherwise the literal `none`.
- `{issuelist}`: the same, for the issue path.
- `{ws_dir}`, `{ws_id}`, `{slug}`: unchanged.
- `{{context docs}}` and one `{{briefing}}` block per template. The briefing block's own
  text must name what belongs in it for all three `{stages}` values, because one block now
  serves both parts.

The spec and diff variants differ only in the mode rules. A change to any rule they share
is made in both files in the same edit. The word-for-word copy between
`tasks-from-plan-spec.md` and `tasks-from-plan-diff.md` is what produced the defect this
plan fixes, so the merged pair keeps the shared text identical by intent and the task list
verifies it with a grep rather than by eye.

### Merged template structure

Each merged template carries these sections, in this order: `# <title>`, `## Role`,
`## Skills`, `## Context`, `## Instructions`, `## Return`. `## Instructions` holds two
labelled parts and one routing paragraph before them.

- The routing paragraph: when `{stages}` is `tasks-only`, read the artefact at `{plan}` (or
  `{issuelist}`) in full and start at Part 2; otherwise do Part 1, and when `{stages}` is
  `plan-only` (or `issues-only`), stop after it and report.
- Part 1 carries the current `create-plan.md` or `create-issues.md` instruction body, with
  its frontmatter block, its ID-claim command, and its no-user answers unchanged.
- Part 2 carries the current `tasks-from-plan-*` or `tasks-from-issues-*` instruction body,
  with `{plan}`/`{issuelist}` replaced by "the artefact you wrote in Part 1, or the one at
  `{plan}` when you skipped Part 1".
- The `## Return` section reports both artefacts, and reports only the one that was written
  when `{stages}` named one. The open-question return block stays word for word as
  `create-plan.md` holds it today, in both `plan-and-tasks-*` files.

What the merged subagent must not do: validate either artefact, settle an open question it
raised, bump any status or `updated` key outside the frontmatter it writes, or author a
task for a stage resting on an open question.

### Plan frontmatter: `base_commit`

A new optional plan key, written immediately after `author` and before `depends_on`, in
the same flat form every other key uses:

```yaml
base_commit: a1b2c3d
```

It is the short SHA of `HEAD` at the moment the plan is authored, read with
`git rev-parse --short HEAD`. `CONVENTIONS.md`'s "Additional keys by type" list gains a
`plan` entry saying the key is optional, that it dates the plan's reading of the codebase,
and that no script checks it. `fc-index.mjs` is not changed: `REQUIRED_KEYS_COMMON` and
`REQUIRED_KEYS_EXTRA` stay as they are, the flat-scalar parser already carries an unknown
key through without warning, and a required key would WARN across every plan already
written.

### The staleness check, and the read rule it replaces

`tasks-from-plan-spec.md`'s current precondition block orders a read of every target file
before any SEARCH/REPLACE block. Spec mode writes no blocks in the ordinary case, so the
survey satisfied a precondition that did not apply. `plan-and-tasks-spec.md` replaces that
block with three rules, in this order:

1. Run `git diff --name-only <the plan's base_commit>..HEAD`. Read again only those files
   the plan names that appear in that output. When it is empty, read nothing again.
2. When the plan carries no `base_commit`, read every file the plan names, which is
   today's behaviour and the safe fallback for a plan authored before this key existed.
3. Whenever a SEARCH/REPLACE block is written for a file, read that file first and copy the
   SEARCH text from it, whatever rules 1 and 2 decided. A spec-mode file may carry a block
   as the exception `fc-task-list` defines, and a block with unread SEARCH text is a stale
   block.

The divergence rule that sits beside the current read rule stands on its own and is kept:
where a file no longer matches what the plan assumes, author no task for it and record the
divergence.

`plan-and-tasks-diff.md` keeps the unconditional read, unchanged, because every task in
that file carries a block and rule 3 therefore covers every file anyway.

`issues-and-tasks-spec.md` keeps `tasks-from-issues-spec.md`'s own rule word for word. That
rule asks the anchor to be derived from the file as read, which a spec-mode `implement`
step genuinely needs, and deleting it would be wrong. `issues-and-tasks-diff.md` keeps
`tasks-from-issues-diff.md`'s rule unchanged.

### `execute-parent-task.md`: the mode branch

The template's single unconditional sentence asserting literal SEARCH/REPLACE blocks is
replaced by a branch on the task list's frontmatter `mode` key, which every task list
carries because the generator requires it. The branch reads:

- `mode: diff`: apply each block verbatim. The state test, the already-applied test and the
  stale-block abort stay exactly as written today.
- `mode: spec`: derive each edit from the subtask's `implement` prose and the anchor it
  names, against its `imports`, `compatibility` and `gotcha` constraints. The state test is
  whether the described outcome is already present in the target file. Where the named
  anchor is absent, abort that subtask exactly as a stale block aborts: leave it unchecked,
  record the mismatch in `self_eval.failures`, and report it.
- A subtask that carries a SEARCH/REPLACE block follows the diff rules whatever the file's
  `mode` says, which covers the spec-mode exception and the per-task `mode: diff` override
  `fc-task-list` allows. A task list with no `mode` key is handled by this rule alone.

`self_eval`, the checklist evaluation and the `updated` bump are unchanged.

### The shared context-document block

Every template's `{{context docs}}` placeholder resolves today to `@`-prefixed bullets,
which inline each document in full into every spawn. The block is replaced, in every
template that carries it, by a resolved list of repo-relative paths with one line per
document saying what it covers, closed by an instruction to read the documents the task
needs rather than all of them. The placeholder keeps its existing rules: list only files
confirmed to exist, invent nothing, carry no path over from another project, and delete the
block and its heading when the project has none.

`SKILL.md`'s sanctioned-deviation bullet for this block is widened by one clause: the
orchestrator resolves the documents and writes their one-line notes once per run, then
reuses that same block verbatim in every spawn of the run. This also removes a
harness-specific file-reference syntax, which `DEVELOPMENT.md`'s portability rule already
forbids.

### `SKILL.md` changes

- The Operations table rows `create-plan`, `tasks-from-plan`, `create-issues` and
  `tasks-from-issues` become two rows, `plan-and-tasks` and `issues-and-tasks`, each naming
  its two template files, its `{stages}` slot, and both artefacts it returns.
- Hard rule 9 keeps its meaning: the mode chooses which of the two merged files is used.
- Hard rule 12's trace runs on the merged stage's return rather than before a
  `tasks-from-plan` spawn, because in a merged run there is no spawn between the plan and
  the tasks. It still reads the plan and the workstream record, still states one line per
  scenario, and still halts before the next stage. In a `tasks-only` run it keeps its
  present position, before the spawn.
- The validate pairing note pairs the merged stage with both validation templates, run
  after it in a fixed order: `validate-plan` first, then `validate-tasks`, and the issue
  path likewise. Total validation coverage is unchanged from today. WS-118-xjdovc replaces
  this pair with its single pass.
- The standard chains in "Parsing the request" name the merged stages, "turn a plan
  into tasks" maps to the merged template with `{stages}: tasks-only`, and the "look into
  X" chain's "feed into create-plan or backlog-add" note names the merged plan stage.
- The chaining section's re-spawn paragraph names `tasks-only` as the route that re-derives
  a task list after a plan-level correction, so one re-spawn still covers it.
- The chaining section's first two bullets and its validation paragraph name the retired
  stages in passing (`create-issues {{findings}}`, `create-issues path → {issuelist};
  create-plan path → {plan}`, and `not from create-issues`). Each stage name becomes the
  merged one; the slot each path feeds is unchanged.
- The upkeep bullet that appends the automatic `issue` and `feature` tags fires after a
  merged stage instead of after `create-plan` or `create-issues`, and sets the status of
  both artefacts the stage produced.

### Other files that name a retired stage

- `README.md`'s operations table: the four stage rows become two.
- `skills/fc-plan-feature/SKILL.md`: the sentence stating that `tasks-from-plan` owns the
  task-list export and that `create-plan` authors a plan only.
- `skills/flowcharge/scripts/test/run-tests.mjs`: `RULE_H_TEMPLATES` names the three
  retired plan-path templates and must name the two merged ones instead, and the comment
  block above it, which counts six templates and names `create-plan.md` as the master
  copy, follows. The merged issue-path templates stay out of that list, for the reason
  the comment beside it already gives: neither returns an open question. Rule G's
  in-memory self-test fixture also names `templates/create-plan.md` twice, and one of
  those is resolved against disk, so it must name a surviving template before
  `create-plan.md` is deleted or the suite fails.

## Stages

1. **Plan-path merge.** Write both `plan-and-tasks-*` templates carrying the `{stages}`
   routing, the plan `base_commit` key, and the three-rule read gate; delete the three
   retired templates; update `CONVENTIONS.md`, `SKILL.md`, `README.md`,
   `fc-plan-feature/SKILL.md` and `RULE_H_TEMPLATES`. First because it is the riskiest
   change and every later stage builds on the shape it settles. Observable at its end: the
   test suite exits 0, no file under `skills/` names a retired plan-path template, and a
   real plan-and-tasks run in a scratch project produces both artefacts from one spawn.
2. **The execute mode branch.** Replace the unconditional block assertion in
   `execute-parent-task.md` with the per-mode branch. Second because it is independent of
   the merges, small, and it is the only change to the stage that writes code. Observable:
   a spec-mode task list executes without the template asserting blocks it does not hold,
   and a spec subtask with a missing anchor aborts and reports.
3. **Issue-path merge.** Write both `issues-and-tasks-*` templates, preserving the issue
   spec template's anchor rule word for word; delete the three retired templates; update
   `SKILL.md` and `README.md`. Third because it saves less than stage 1 (`create-issues` is
   a write-up stage that runs no large survey, so there is no earlier survey to duplicate)
   and because it reuses stage 1's proven shape. Observable: an issues-and-tasks run
   produces both artefacts from one spawn.
4. **Context documents resolved once per run.** Replace the shared context block in all ten
   surviving templates and widen the sanctioned-deviation bullet. Last because it edits
   every template, and doing it earlier would mean editing files stages 1 and 3 are about
   to delete. Observable: no `@`-prefixed bullet remains in any template, and a run's spawns
   carry the same resolved block.

Each stage appends its own entry under `## Unreleased` in `CHANGELOG.md`, per
`CONTRIBUTING.md`. No version is bumped: the release command stamps versions.

## Data & compatibility

- **Artefact formats.** One additive, optional key: `base_commit` on a plan. Every plan
  already on disk stays valid and takes the fallback read path. No issue list, task list or
  workstream record changes shape.
- **Generator.** No change, so `index.md`, `kanban.md`, `--check`, `--sync` and `--list`
  behave identically and the existing fixtures keep passing.
- **Installed skill folders.** Template files are deleted and added, so a user who unzips a
  release over an old folder keeps the retired templates on disk. `README.md` already
  instructs deleting the older folder of the same name first; the `CHANGELOG.md` entry
  states it again for this release.
- **Runs in flight.** A task list authored before this change executes unchanged under the
  new `execute-parent-task.md`, because the branch reads `mode`, which every task list
  carries, and a diff-mode list takes exactly today's path.
- **Re-spawn duplicates.** A re-spawned authoring stage claims fresh IDs and writes a second
  artefact file, as it does today. Merging widens that from one artefact to two when
  `{stages}` is `plan-and-tasks`. The `tasks-only` route keeps the common case at one.
- **Rollback.** Every change is Markdown prose plus one JavaScript array, two fixture
  strings and a comment in the test file.
  `git revert` restores the previous behaviour completely at any stage boundary, and no
  artefact written under the new templates becomes unreadable if it is reverted.

## Testing strategy

- **Suite.** `node skills/flowcharge/scripts/test/run-tests.mjs` is the only automated
  check and must exit 0 at every stage boundary. Rule G fails on any `SKILL.md` path that
  no longer resolves, so it catches a half-finished rename; rule H fails if the merged
  plan-path templates lose the open-question return block.
- **Per stage, grep-shaped verification.** Each stage's tasks assert the retired names
  appear nowhere under `skills/` and `README.md`, that the surviving rules appear in both
  variants of a merged pair, and that `tasks-from-issues-spec.md`'s anchor sentence is
  present byte for byte in `issues-and-tasks-spec.md`. Each count is measured at
  `base_commit` before it is written down.
- **Integration, by hand.** The only true test of a prompt template is a run. In a scratch
  project, exercise each `{stages}` value on both paths, and one spec-mode and one
  diff-mode execution, then confirm the subagent count and that the merged run re-reads no
  file when nothing has landed since the plan's `base_commit`.
- **No new unit tests.** No script changes, so there is no new code path a fixture could
  cover.

## Open questions

- **Question:** Should this work land before WS-118-xjdovc's `validate` setting, with the
  interim keeping both validation stages and running them one after the other at the end of
  the merged run, or should it wait for WS-118 so the validation sequencing is written once?
  **Recommendation:** Land this first with the interim. It preserves today's validation
  coverage exactly, it changes only when `validate-plan` runs, and it leaves WS-118 a single
  clean edit to collapse the two spawns into one pass.
- **Question:** With the plan and its tasks written in one spawn, should the
  originating-scenario trace (hard rule 12) still run, given it can now only halt after the
  task list already exists and so wastes that authoring work?
  **Recommendation:** Keep it, running it on the merged stage's return and halting before
  the next stage. The wasted authoring is one subagent, while losing the check reopens the
  failure WS-2-3rs9lo built it to catch.

## Adjacent opportunities

Not requested, listed as offers only.

- Let a re-spawned authoring stage reuse the ID it already claimed, so a correction does not
  leave a duplicate artefact file behind. Skip: it is a pre-existing behaviour this plan does
  not worsen for the common case.
- Merge `investigate` into the plan-path stage as a third part, on the same context-inheritance
  reasoning. Skip: the owner settled two pairs, not three, and investigation often ends
  deliberately without a plan.

## Alternatives considered and rejected

- Keep `create-plan.md` and `tasks-from-plan-*.md` beside new merged templates: rejected,
  because it grows the task-authoring rules from two near-identical copies to four, and
  that duplication is exactly what produced the defect this plan fixes.
- Merge by sending a second turn to the subagent that authored the first artefact, instead
  of one two-part template: rejected, because it assumes a harness can continue a subagent
  that already returned, which `DEVELOPMENT.md`'s portability rule forbids assuming.
- Delete the spec-mode read rule outright rather than gating it: rejected, because a
  spec-mode file may still carry a SEARCH/REPLACE block, and that block's SEARCH text must
  come from the file as read.
- Add a machine-readable file list to plan frontmatter for the staleness check: rejected as
  unnecessary, because the plan names its files in prose and an agent, not a script, runs
  the check.
- Replace the `@`-inlined documents with an orchestrator-authored digest: rejected, because
  a digest is lossy and moves the orchestrator closer to authoring content, while a path
  list with one-line notes keeps the full document one read away.

## Final summary

One subagent per authoring pair instead of two, with the file re-survey replaced by a
`git diff` staleness check against the plan's own `base_commit`.

Four stages: the plan-path merge, the execute-template mode branch, the issue-path merge,
and the context-document de-inlining. Each is a few files of Markdown plus small test-file
edits; a sitting each.

Top risks: the merged template carries a three-way branch that no automated test can
exercise, so only a real run proves it; hard rule 12's halt moves after task authoring; and
dropping `@`-inlining relies on subagents reading the documents they need.

Two questions need an answer: whether to land this before WS-118-xjdovc with the two
validation stages kept in the interim, and whether the originating-scenario trace survives
in its new, later position.
