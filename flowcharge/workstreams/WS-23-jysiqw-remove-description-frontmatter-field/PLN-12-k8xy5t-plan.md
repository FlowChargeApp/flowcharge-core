---
id: PLN-12-k8xy5t
type: plan
workstream: WS-23-jysiqw
slug: remove-description-frontmatter-field
title: "Remove the description frontmatter field from workstream records"
status: done
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
base_commit: 3bb00fc
depends_on: []
links: []
---

## Summary

The workstream frontmatter schema carries an optional `description` key that
restates the record's own body and adds no fact the body lacks. Remove it
entirely: from `CONVENTIONS.md`'s schema definition, from `fc-index.mjs`'s CLI
flag, parsing, storage, WARN check and board rendering, from its test coverage
in `run-tests.mjs`, and from the two authoring-flow documents that currently
tell an agent to resolve or write it (`SKILL.md`'s Start-of-run upkeep step and
`templates/kanban-add.md`). Migrate the 12 workstream records in this repo that
currently carry the key, deleting it from each after confirming (per record)
that its body already holds everything the key said. Log the removal in
`CHANGELOG.md`. The chosen approach is direct deletion with a verified
per-record migration, because the originating decision (recorded in
`WS-23-jysiqw`'s own workstream record) already established that `description`
is pure duplication of the body; the only remaining work is mechanical removal
plus the one-time check that no record's `description` actually carries
information the body omits.

## Scope

In scope, as acceptance criteria:

- `skills/flowcharge/CONVENTIONS.md` no longer defines a `description` key
  anywhere in the workstream schema, and its `blocked` key's positioning rule
  no longer refers to writing `blocked` "after `description`."
- `skills/flowcharge/scripts/fc-index.mjs` no longer accepts, parses, stores,
  length-checks, or renders a `description` value: `--description` is gone
  from `--help`'s flag list and body text, from `parseNewWsArgs`, from the
  scaffolded record `--new-ws` writes, from the in-memory artefact record
  (`fm.description`), from the `DESC_MAX` WARN, and from the generated kanban
  card body.
- `skills/flowcharge/scripts/test/run-tests.mjs` carries no test case that
  exercises a `description` key, the `DESC_MAX` WARN, or the `--description`
  flag, and the full suite (`node skills/flowcharge/scripts/test/run-tests.mjs`)
  passes with no case referencing a removed behaviour.
- `skills/flowcharge/SKILL.md`'s Start-of-run upkeep step no longer mentions
  `--description` or instructs an agent to decide whether to pass it.
- `skills/flowcharge/templates/kanban-add.md` no longer instructs an authoring
  subagent to decide on or write a `description` key, and no longer passes
  `--description` to the `--new-ws` command it documents.
- Each of the 12 workstream records in this repo that currently carries a
  frontmatter `description:` key (found by
  `grep -rl "^description:" flowcharge/workstreams/*/workstream.md`, listed
  in full under Data & compatibility) has that key removed. Where a record's
  `description` states a fact its body omits, that fact is folded into the
  body first, in the record's own words, before the key is deleted.
- `grep -rn "^description:" flowcharge/workstreams/*/workstream.md` returns
  zero matches once the migration stage completes.
- `grep -rln "description" skills/flowcharge/` (excluding the `SKILL.md`
  frontmatter `description:` key every skill carries as its own trigger text,
  and excluding `templates/issues-and-tasks-spec.md` /
  `templates/issues-and-tasks-diff.md`, whose only `description` occurrences
  name an *issue's* description text, not the workstream frontmatter field —
  see Alternatives) returns no reference to the workstream `description` key.
- `CHANGELOG.md`'s `## Unreleased` / `### Removed` section gains one entry
  naming the field, the files it was removed from, and the migration, in the
  section's existing style.

Out of scope:

- The FlowCharge dashboard app's rendering. It already reads the body instead
  of `description` on its own side, in a separate sibling repository, per the
  workstream record's Decision section.
- Any installed or symlinked copy of `skills/flowcharge/` elsewhere on the
  machine. This plan touches only this repository's own source tree.
- `templates/issues-and-tasks-spec.md` and `templates/issues-and-tasks-diff.md`.
  The workstream record's scope list named these two files as needing changes,
  but re-grepping them (this plan's Context correction 1 requires this) shows
  their only `description` occurrences ("never reconstruct them from the issue
  description") refer to an *issue's* description field from `fc-issue-list`,
  an unrelated schema this workstream does not touch. This is a divergence
  from the workstream record's scope list, not an open question: no edit is
  needed in either file. See Alternatives.
- Any workstream record outside this repository's 21 (for example the
  archive the workstream record's "88 existing records" / "32 records"
  figures describe). This plan's migration list is this repo's actual 12
  records, discovered by grep at plan-authoring time, per Context correction 2.

Assumptions:

- Every one of the 12 records' `description` values restates its body with no
  additional fact, matching the workstream record's own sampled finding. This
  plan does not re-verify all 12 in advance; each migration task carries its
  own per-record verification step, and any record where the assumption turns
  out false gets its missing fact folded into the body as part of that same
  task, per CONVENTIONS.md's existing rule that the body carries "as much
  detail... as the request actually gave."
- `--description` has no other caller in this repo (no script, CI job, or
  hook invokes `fc-index.mjs --new-ws --description`). Confirmed by grepping
  `skills/` for `--description`: the only occurrences are `SKILL.md`,
  `templates/kanban-add.md`, and `fc-index.mjs` itself, all in scope here.

## Design

**Schema (`CONVENTIONS.md`).** Delete the `description` bullet (currently
between the workstream body-rules paragraph and the `blocked` bullet). Reword
`blocked`'s positioning sentence, which currently reads "Write it immediately
after `description` when the record carries one, and immediately after
`title` when it does not, always before `status`," to state the single
remaining rule: write `blocked` immediately after `title`, always before
`status`. No other CONVENTIONS.md section names `description`.

**Generator (`fc-index.mjs`).** `description` currently touches six regions:
the `--help` flag list and its body text (`--description "<text>"` block), the
`DESC_MAX` constant and its comment, the `checkShape` WARN that compares
`a.description.length` against `DESC_MAX`, `parseNewWsArgs`'s parsing of the
`--description` flag (and its return shape), the `--new-ws` scaffold's
conditional `description:` line, and the artefact record's `description:
fm.description || ''` default plus the board writer's `if (ws.description)`
card line. All six are deleted; nothing is renamed or repurposed, because
CONVENTIONS.md's contract for the key (soft-capped, optional, one rendered
line) has no replacement, it is simply gone. `CARD_DESC_MAX` (the *first body
line's* cap) is untouched: it is a distinct constant for a distinct field.

**Generator tests (`run-tests.mjs`).** The `workstream()` fixture helper's
opt-in `description` key (and the comment explaining why it is opt-in) is
removed, since no fixture can carry a key the generator no longer reads. Every
test case that exists solely to pin `description` behaviour is deleted outright
(the two card-body cases, the two `DESC_MAX` boundary cases, the three
`--new-ws --description` cases). The two `blocked`-line cases that currently
exist in a with-description / without-description pair collapse to the single
case that remains meaningful once `description` cannot appear: the blocked
line renders directly under the title line. `HELP_FLAGS` drops `'--description'`
and the `newWsRecord()` frontmatter-builder helper drops its conditional
`description:` line, since after this change `--new-ws` never writes one.

**Authoring prompts.** `SKILL.md`'s Start-of-run upkeep step currently
documents `[--description "<text>"]` on the `--new-ws` command line and gives
a paragraph of guidance on when to pass it; both are deleted, leaving the
command's remaining flags (`--title`, `--tags`) and the body-authoring
instruction untouched. `templates/kanban-add.md` step 2's second sentence
("Then decide the optional `description` key...") and step 3's
`[--description "<text>"]` token are deleted the same way. Per Alternatives
below, `templates/issues-and-tasks-spec.md` and
`templates/issues-and-tasks-diff.md` need no change.

**Migration (12 workstream records).** For each record, read the current
`description:` value and the record's body, confirm the body already states
everything the description does (the recorded assumption), fold in any
missing sentence in the record's own words if it does not, then delete the
`description:` line. The line sits at a fixed position (immediately after
`title:`, immediately before `status:`) in all 12 records, confirmed by grep
at plan-authoring time, so each deletion is a single-line, single-file change.
`WS-23-jysiqw`'s own record is one of the 12 and is migrated the same way as
the other 11.

**Changelog.** One `### Removed` bullet, matching the section's existing
style (a short lead clause naming what was removed, then the files it
touched), is appended to `## Unreleased` in `CHANGELOG.md`.

## Stages

1. **Generator (`fc-index.mjs`)** — the highest-risk change, since every other
   stage either depends on the generator no longer requiring `description`
   (docs, prompts) or is unaffected by it (migration, changelog). Ends with
   the six `description`-handling regions removed and the script still
   functioning for every other flag.
2. **Generator tests (`run-tests.mjs`)** — brings the pinning suite back into
   agreement with stage 1's behaviour change. Ends with
   `node skills/flowcharge/scripts/test/run-tests.mjs` passing again, with no
   case exercising removed behaviour.
3. **Schema doc (`CONVENTIONS.md`)** — removes the key's contract from the
   canonical schema now that nothing implements it. Ends with the schema
   describing only the fields the generator actually enforces.
4. **Authoring prompts (`SKILL.md`, `templates/kanban-add.md`)** — stops a
   future agent from being told to resolve or write a key that no longer
   exists. Ends with both documents' `--new-ws` guidance matching the
   generator's actual flags.
5. **Migrate the 12 records** — the data cleanup, safe to do last since
   nothing upstream depends on any record's current `description` value. Ends
   with zero `description:` keys left in any workstream record in this repo.
6. **Changelog entry** — records the change for a reader of `CHANGELOG.md`.
   Ends with one new `### Removed` bullet under `## Unreleased`.

## Data & compatibility

No data migration tooling is needed beyond stage 5's per-record hand edits.
The 12 records this plan's grep found at `base_commit` (3bb00fc):

`WS-12-zq2ms6`, `WS-13-ywk08u`, `WS-14-xbmk31`, `WS-15-d5hgor`, `WS-16-1n524u`,
`WS-17-m5tjnc`, `WS-18-b52wnx`, `WS-19-vncz2n`, `WS-22-lq25m7`, `WS-23-jysiqw`,
`WS-5-geob84`, `WS-8-r6d8n6`.

Backward compatibility: a record written by an older copy of `fc-index.mjs`
(or by a person, by hand) that still carries a `description:` line is not
rejected by the updated generator — nothing in `checkShape` or elsewhere
treats an unrecognised frontmatter key as an error, so a stray `description:`
line left on disk by a source outside this repo's migration (for example an
unrelated clone that has not pulled this change) is silently ignored rather
than warned about or rendered. No rollback story is needed beyond `git
revert`, since every change here is a source-controlled text edit with no
external side effect.

## Testing strategy

Stage 1 and 2 are covered together by `run-tests.mjs`'s own suite: stage 2's
task list runs the full suite (`node skills/flowcharge/scripts/test/run-tests.mjs`)
as its primary verify step, which exercises stage 1's generator changes
end-to-end (CLI parsing, WARN output, board rendering) through the existing
fixture-tree harness. Stage 3 and 4 are documentation-only and verified by
grep (no live reference left) plus the suite's own docs-consistency checks,
which already run as part of the same full-suite pass. Stage 5 is verified
per record by grep (no `description:` line remains) and, in aggregate, by the
repo-wide zero-match grep this plan's acceptance criteria state. Stage 6 is
verified by inspection against `CHANGELOG.md`'s documented heading format.

## Open questions

None. Every part of this removal is either fully specified by the workstream
record's Decision section or resolved by this plan's own grep against the
current tree.

## Adjacent opportunities

- `title`'s own length is undocumented in CONVENTIONS.md (no cap is stated or
  enforced), which becomes slightly more conspicuous once `description`'s
  explicit 1000-character soft cap is gone. Not requested; skip unless a
  record's title is later found causing a problem.

## Alternatives considered and rejected

- **Keep `description` in the schema but stop the authoring prompts from
  filling it**, letting it wither from disuse rather than deleting it
  outright. Rejected: the workstream record's Decision section is explicit
  that the field is to be removed, not merely discouraged, and a key the
  generator still parses and renders is not removed.
- **Treat `templates/issues-and-tasks-spec.md` and
  `templates/issues-and-tasks-diff.md` as in scope**, per the workstream
  record's original file list. Rejected after re-grepping both files: their
  only `description` text concerns an issue's description field (a distinct,
  unrelated key from `fc-issue-list`'s schema), so editing them would touch
  content this workstream was never about and risk breaking unrelated
  guidance for no benefit.
- **Batch the 12-record migration as one multi-file task** instead of one
  task per record. Rejected: the task list's diff mode caps a task at one
  SEARCH/REPLACE block in one file, and each record's migration also carries
  its own per-record verification judgment (fold or not), which reads more
  clearly as 12 small, independently reviewable tasks than one large one.
- **Add a generator `--check` WARN for a stray legacy `description:` line**,
  to catch a record some other source reintroduces after this migration.
  Rejected as scope creep: the workstream record's Decision section calls for
  removal, not for a new enforcement rule, and DEVELOPMENT.md's
  check-or-note rule applies to a *new* CONVENTIONS.md rule, not to a
  rule being deleted.
