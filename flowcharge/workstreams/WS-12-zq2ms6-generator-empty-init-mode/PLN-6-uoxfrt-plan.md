---
id: PLN-6-uoxfrt
type: plan
workstream: WS-12-zq2ms6
slug: generator-empty-init-mode
title: "Add fc-index.mjs --init: create an empty flowcharge/ tree with zero workstreams"
status: done
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: []
links: []
---

## Summary

Add a new `--init` mode to `skills/flowcharge/scripts/fc-index.mjs` that creates
`flowcharge/workstreams/` (and, as a side effect of `mkdirSync(..., { recursive: true })`,
`flowcharge/` itself) when it does not already exist, allocates or writes nothing else, then
falls through into the exact same regenerate code path the default (no-flag) mode already
runs today. The chosen approach replaces the unconditional `if (!fs.existsSync(wsRoot))`
exit-1 guard at `fc-index.mjs:258-261` with a branch: when `--init` is present, check it
against the other five mode flags and `mkdirSync` the tree instead of exiting; when absent,
the guard's existing behavior is untouched. Every line of code after that guard (the
artefact scan, the integrity checks, the `index.md`/`kanban.md` writers, `ensureGitignore`)
already runs unmodified and already produces a correct empty output for zero workstreams,
confirmed directly by running the script against a manually pre-created empty
`flowcharge/workstreams/`. This makes `--init` the smallest possible change: no new
index/board-writing logic, no new mode-specific output format, just one guard turned
conditional.

## Scope

Acceptance criteria:

1. `fc-index.mjs --init` against a project root with no `flowcharge/` folder at all creates
   `flowcharge/`, an empty `flowcharge/workstreams/`, a valid empty `flowcharge/index.md` and
   `flowcharge/kanban.md`, exits 0, and prints only the two routine WARN lines for a missing
   `flowcharge/tags.md` and a missing `flowcharge/ids.md` plus the normal summary line.
2. `--init` never allocates an ID, never creates a marker directory under `flowcharge/ids/`,
   never writes `flowcharge/ids.md`, and never writes a workstream record anywhere.
3. `--init` against a project whose `flowcharge/workstreams/` already exists, whether empty
   or already holding one or more workstreams, succeeds as a no-op on that data (creates,
   deletes, and alters none of it) and still regenerates `index.md`/`kanban.md` from
   whatever is actually there.
4. `--init` combined with any other mode flag (`--check`, `--list`, `--claim`, `--new-ws`,
   `--sync`, `--whoami`) is refused: exit 1, one stderr line, nothing written or created.
5. `--init --no-board` writes `index.md` only and leaves `kanban.md` untouched, matching the
   default mode's own `--no-board` contract.
6. A run of `--init` appends the standard `flowcharge/index.md`, `flowcharge/kanban.md`, and
   `flowcharge/ids/` lines to the project root's `.gitignore`, the same as every other
   writing mode, since `--init` is not added to the flag-presence exclusion list at
   `fc-index.mjs:269`.
7. `--help` documents `--init`: a Usage line, a Modes entry, the exit-code note that the
   missing-`flowcharge/workstreams/` exit-1 case no longer applies when `--init` is given,
   and the `.gitignore` writing-mode enumeration at `fc-index.mjs:124-129` gains `--init`
   alongside the other five.
8. No existing flag, mode, or documented behavior changes: a caller that never passes
   `--init` sees byte-identical output to today.

Out of scope:

- Any change to the sibling `flowcharge` (web app) repository, including its WS-129 record.
- Proactively creating `flowcharge/tags.md` or `flowcharge/ids.md` (see Design decisions).
- Any change to `--new-ws`'s own behavior or output; it still claims and writes one
  workstream record exactly as it does today.
- Cutting an actual suite release (version bump, `release.mjs`, git tag). Only the
  `CHANGELOG.md` `## Unreleased` line this change earns is in scope.
- Updating the repo-root `README.md`: its Layout section describes the `flowcharge/` tree
  shape generically and does not name any individual `fc-index.mjs` flag today (`--new-ws`,
  `--claim`, `--list`, etc. do not appear there), so there is no existing flag-level
  documentation there to extend for `--init` either.

Assumptions:

- Flag name: `--init`, exactly as the brief suggests. Alternatives considered:
  `--bootstrap` and `--scaffold` were both weighed and rejected as no clearer than `--init`
  for "create the tree" while breaking from the brief's own stated default with no offsetting
  benefit.
- `--init` accepts `--no-board` with the same meaning it carries for the default mode. This
  follows directly from the chosen approach (fall through into the default mode's own code
  path) rather than being a separately invented option.
- Deployment/release: this is a MINOR, additive CLI change per `VERSIONING.md` (a new
  capability, everything existing still works). There is no production data, no migration,
  and no rollback story beyond "stop passing `--init`," because the flag adds a branch to a
  guard and touches no on-disk format. Cutting the next release is a separate, later,
  maintainer-driven act; this plan's only release-adjacent task is the one `CHANGELOG.md`
  line `VERSIONING.md` requires for every merged change.

## Key flows

**Initialize an empty flowcharge/ tree**
**Actor:** a person, or an automated caller such as the sibling FlowCharge web app's "Add
Project" flow, holding a project root that may or may not already have a `flowcharge/`
folder.
**Preconditions:** the project root is resolved (`--root`, defaulting to cwd, then resolved
to the git common root exactly as every other mode resolves it); no assumption is made about
whether `flowcharge/` or `flowcharge/workstreams/` already exist.
**Main flow:** the caller runs `node fc-index.mjs --root <project-root> --init`. The script
creates `flowcharge/workstreams/` if absent (which also creates `flowcharge/` itself),
appends the standard `.gitignore` entries, then continues into the same scan-and-regenerate
path the default mode runs, finding zero workstreams and writing an empty `index.md` and
`kanban.md`.
**Outcome:** exit 0; `flowcharge/`, an empty `flowcharge/workstreams/`, `flowcharge/index.md`
and `flowcharge/kanban.md` all exist; `flowcharge/ids.md` and `flowcharge/tags.md` do not yet
exist (each WARNed, left to their existing lazy self-heal); no workstream record exists
anywhere.
**Edge cases:** `flowcharge/workstreams/` already holds one or more workstreams — `--init` is
a no-op on that data and regenerates normally, surfacing whatever real WARNs that data would
already produce under a plain run. `--init` combined with `--check`/`--list`/`--claim`/
`--new-ws`/`--sync`/`--whoami` — refused before anything is created. `--init --no-board` —
`kanban.md` is left untouched (or, on a fresh tree, never created).

## Design

Files touched: `skills/flowcharge/scripts/fc-index.mjs` (the only code file), `CONVENTIONS.md`
(documentation of the `.gitignore`-writing mode list), `skills/flowcharge/scripts/test/run-tests.mjs`
(test coverage), `CHANGELOG.md` (one `### Added` line under `## Unreleased`).

**Interface.** A new no-argument flag, `--init`. Usage line added alongside the existing
ones: `node fc-index.mjs [--root <dir>] --init [--no-board]`. It takes no value and shares
`--no-board`'s existing meaning with every other writing mode.

**Guard replacement, at the existing site (`fc-index.mjs:258-261`).** The unconditional
`if (!fs.existsSync(wsRoot))` exit-1 check gains one branch: when `--init` is present, the
run checks itself against the other six mode flags (`--check`, `--list`, `--claim`,
`--new-ws`, `--sync`, `--whoami`) and dies with one stderr line on any of them, exactly the
`die()` style every other mode's own parse function already uses; otherwise it creates
`wsRoot` with `fs.mkdirSync(wsRoot, { recursive: true })` (the same call `--new-ws` already
uses, which is a no-op when the directory already exists and never touches anything already
inside it) and falls through. When `--init` is absent, the guard's existing branch is
untouched: the exit-1 case still fires exactly as it does today.

**Why the mutual-exclusion check lives at the guard site, not in a `parseInitArgs()`
alongside `parseSyncArgs`/`parseNewWsArgs`/`parseWhoamiArgs`.** Those five functions are
invoked around `fc-index.mjs:1108-1110`, roughly 850 lines after the guard, once the whole
artefact scan (which itself depends on `wsRoot` already existing) has already run. `--init`
must run before or instead of the guard, per the brief, so its own combination check must
run at the same point, not after a scan that a missing `wsRoot` would already have failed.
This is also why no change is needed to the other five parse functions' own exclusion lists:
because the guard-site check runs unconditionally, immediately after `--help`, any
invocation combining `--init` with another mode flag is already refused and the process has
already exited long before any of those five functions would otherwise run. One check,
placed where the brief's own constraint requires it to run, is sufficient and exhaustive;
duplicating it into the other five functions would be dead code on every path that reaches
them.

**No new proactive file creation.** `--init` creates exactly one thing beyond what a plain
run already creates on a populated tree: `flowcharge/workstreams/` (and transitively
`flowcharge/`). It does not create `flowcharge/tags.md` or `flowcharge/ids.md`. Rationale
recorded under Design decisions below.

**No new output format.** `--init` prints nothing of its own. Once past the guard, it is the
default mode (or `--no-board` mode) in every remaining respect: same WARN lines, same
`fc-index: <n> workstreams, <n> artefacts, <n> issues (<n> open) → index.md + kanban.md`
summary line (`fc-index.mjs:1544`), same `.gitignore` handling (`--init` is simply not added
to the exclusion list checked at `fc-index.mjs:269`, so `ensureGitignore` runs for it exactly
as it runs for the default mode today).

### Design decisions

- **Whether to proactively create `flowcharge/tags.md` and `flowcharge/ids.md`: no.** Both
  stay on their existing lazy, WARN-then-self-heal path (`CONVENTIONS.md`'s Registry
  section; `fc-index.mjs:1353` and `:1409`). No other file the script touches is created
  ahead of being needed, and `--new-ws` itself does not create `tags.md` either, so `--init`
  scaffolding either file ahead of time would be new, inconsistent behavior for a mode whose
  entire job is producing the empty tree and the empty generated views, nothing else.
- **What `--init` does when `flowcharge/workstreams/` already exists: succeeds as a no-op.**
  `fs.mkdirSync(wsRoot, { recursive: true })` against an existing directory is a documented
  no-op; nothing inside it is inspected, listed, or touched by the `--init` branch itself,
  and the fall-through into the default regenerate path is exactly as safe against existing
  workstreams as running the default mode already is today. Rejected alternative: refuse
  (exit 1) when `flowcharge/workstreams/` already exists, mirroring `--new-ws`'s
  already-taken-slug refusal. Rejected because it would force every caller (in particular the
  sibling web app's "Add Project" flow, the motivating use case) to check for the tree's
  existence before calling `--init`, which is exactly the ceremony `--init` exists to remove,
  for no safety benefit: idempotent creation can never lose data, so there is nothing a
  refusal would be protecting.
- **Early-exit mode (like `--new-ws`/`--claim`/`--list`) vs. fall-through mode (like
  `--sync`): fall-through.** The brief's own wording, "then produces the normal empty
  index.md/kanban.md output for it," describes one invocation doing both jobs. The default
  mode's regenerate logic is already independently confirmed correct for zero workstreams
  (a plain run against a manually pre-created empty `flowcharge/workstreams/` already
  produces a valid empty `index.md`/`kanban.md` with only the two routine WARNs), so
  fall-through needs no new index/board-writing code and no new tests for that logic;
  reaching it is the only new work. Rejected alternative: an early-exit mode mirroring
  `--new-ws`, printing a confirmation line and exiting 0, leaving `index.md`/`kanban.md` to a
  required separate plain run afterward. Rejected because it does not satisfy the brief's
  stated single-command behavior and would need its own new print-and-exit code path
  duplicating logic the default mode already has.

## Stages

1. **Implement `--init` in `fc-index.mjs`: flag wiring, the guard branch, and `--help`.**
   The risk-bearing change: the conditional guard (mutual exclusion plus idempotent
   `mkdirSync`) and the `HELP` template's Usage/Modes/Exit-codes text, including its
   `.gitignore` writing-mode enumeration. Holds this position
   because everything downstream (tests, docs) verifies or describes this behavior. Ends
   with a manual run of `node fc-index.mjs --root <fresh empty dir> --init` producing the
   tree and the empty views described in Scope, and `--help` naming `--init`.
2. **Add test coverage in `run-tests.mjs`.** A fixture builder that does not pre-create
   `flowcharge/workstreams/` (the existing `fixture()` always does, per its own comment at
   `run-tests.mjs:38-41`, so `--init`'s own cases need one that does not), plus cases for:
   the empty-tree happy path and its exact two WARN lines; no ID claimed and no workstream
   folder written; a no-op run against a tree already holding a workstream, with that
   record's bytes unchanged before and after; each of the six mode-combination refusals,
   mirroring the existing combo-refusal loop pattern (`run-tests.mjs:1856-1865`); `--no-board`
   honoured; and `.gitignore` gaining its three lines on a project that has none yet. `--init`
   is also added to the `HELP_FLAGS` inventory (`run-tests.mjs:2106-2110`), so the existing
   "--help documents every flag" case covers it with no new case of its own. Ends with
   `node skills/flowcharge/scripts/test/run-tests.mjs` passing, covering `--init`.
3. **Update `CONVENTIONS.md` and `CHANGELOG.md`.** `CONVENTIONS.md`'s sentence listing the
   writing modes that trigger the `.gitignore` update (the "the plain regenerate above,
   --no-board, --claim, --sync, --new-ws" list) gains `--init`. `CHANGELOG.md` gains one line under
   `## Unreleased` → `### Added`, describing the new mode, per `VERSIONING.md`'s MINOR
   mapping. Ends with both documents reflecting the shipped, tested flag.

## Data & compatibility

No data migration and no on-disk format change. No existing flag's or mode's contract
changes: the only touched code path is the `wsRoot`-missing guard, which gains one new
branch (`--init` present) beside its existing, otherwise-untouched branch (`--init` absent,
current exit-1 behavior unchanged byte-for-byte). A caller that never passes `--init` sees
identical behavior before and after this change. Rollback is reverting the four touched
files; nothing written by `--init` is in a format any other mode does not already produce
and read.

## Testing strategy

This repo has no unit-test framework and no `package.json`; all coverage lives in
`skills/flowcharge/scripts/test/run-tests.mjs`'s hand-rolled fixture-and-assert cases, run via
`node skills/flowcharge/scripts/test/run-tests.mjs` (the exact command `.github/workflows/ci.yml`'s
`test` job runs). New cases follow the file's existing patterns: a dedicated fixture builder
for a tree with no `flowcharge/workstreams/` pre-created; `outLines`/`compareWarnSets` for the
two-WARN empty-tree assertion; `wsFolders`/`idsEntries` for the no-workstream/no-ID
assertions the existing `--new-ws` refusal cases already use; and the existing
combo-refusal loop shape for the six mutual-exclusion cases. No new assertion helper is
needed beyond, possibly, one small fixture-builder function next to `fixture()`/
`withFixture()`.

## Open questions

None. Every point the brief left for this plan to decide (proactive `tags.md`/`ids.md`
creation, and behavior against an already-existing `flowcharge/workstreams/`) is answerable
from the existing code and `CONVENTIONS.md` alone and is recorded as a Design decision above.
Every other detail (flag name, mode-combination behavior, `--no-board` support, output
format) follows directly from the chosen fall-through approach and carries no
irreversible risk: this is a MINOR, additive, 0.x-era CLI flag with no on-disk format
implication, so nothing here is costly to revisit in a later change.

## Alternatives considered and rejected

- **An early-exit mode mirroring `--new-ws`** (create the tree, print and exit, leaving
  `index.md`/`kanban.md` to a required follow-up plain run). Rejected: does not satisfy the
  brief's single-command behavior and duplicates default-mode logic in a new code path.
- **Refusing `--init` when `flowcharge/workstreams/` already exists**, mirroring `--new-ws`'s
  slug-collision refusal. Rejected: adds an existence-check burden on every caller for no
  safety benefit, since idempotent creation cannot lose data.
- **Proactively creating `flowcharge/tags.md` and/or `flowcharge/ids.md`** alongside the
  tree. Rejected: breaks the script's uniform lazy-creation pattern and gives `--init` a job
  (`ids.md`/`tags.md` scaffolding) the brief explicitly scopes out of it.
- **Restructuring the script so the `wsRoot`-missing guard runs after mode parsing**, letting
  `--init`'s mutual-exclusion check live in a `parseInitArgs()` beside the other five parse
  functions. Rejected: the guard's current position is exactly where the brief requires the
  new mode to run "before or instead of," and moving it would touch the artefact-scan section
  that depends on `wsRoot` already existing, disproportionate to a one-flag addition.
- **Naming the flag `--bootstrap` or `--scaffold` instead of `--init`.** Rejected: neither
  reads more clearly than `--init` for "create the tree," and departing from the brief's own
  suggested name would need a stronger reason than stylistic preference.

### Final summary

Chosen approach: turn the existing `wsRoot`-missing exit-1 guard into a conditional branch
for a new `--init` flag that idempotently creates `flowcharge/workstreams/` and falls
through into the unmodified default regenerate path, producing an empty `index.md`/`kanban.md`
in the same run. Three stages: implement the flag and its guard/`--help` text; add fixture
test coverage in `run-tests.mjs`; update `CONVENTIONS.md` and add the `CHANGELOG.md` line.
Effort is small: one conditional guard, no new index/board-writing logic. Top risks: getting
the mutual-exclusion check's placement right (addressed in Design, single check at the guard
site) and not disturbing any existing mode's byte-for-byte output (addressed by touching only
the guard branch that fires when `--init` is absent, which is unchanged). No open questions.
