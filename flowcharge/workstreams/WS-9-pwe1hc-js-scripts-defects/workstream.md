---
id: WS-9-pwe1hc
type: workstream
workstream: WS-9-pwe1hc
slug: js-scripts-defects
title: "Defects in this repository's own JavaScript generator scripts"
status: in-progress
tags: [correctness, generator, issue]
created: 2026-09-13
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: []
links: []
---
Fix the defects in the generator, renamer and test-suite scripts that a check against the current code still reproduces.

## Request

Check each finding below against the current `skills/flowcharge/scripts/fc-index.mjs`,
`skills/flowcharge/scripts/fc-rename-artefacts.mjs` and
`skills/flowcharge/scripts/test/run-tests.mjs` with a live reproduction in a throwaway
fixture tree, never in this repository's own `flowcharge/` folder. File an issue only for
a finding that still reproduces, and report each finding left out with its reason. Author
spec-mode fix tasks for the filed issues, validate them, execute every task, and commit
after each parent task lands, not after each child task.

Every fix:

- gets a test case in `skills/flowcharge/scripts/test/run-tests.mjs` that fails before
  the fix and passes after it;
- keeps the scripts' documented behaviour otherwise unchanged, stays compatible with
  Node 16 and adds no dependency;
- is recorded in `CHANGELOG.md` in a `### Fixed` section under `## Unreleased`. No
  version changes, because a release decides the version.

## Findings

The request supplies these fourteen findings, each to be checked before it is filed. All
fourteen were confirmed when they were first reported.

1. **The renamer adds a second id prefix.** `fc-rename-artefacts.mjs` strips only a prefix
   equal to the frontmatter id, so `PLN-2-abcdef-plan.md` carrying `id: PLN-1-abcdef`
   becomes `PLN-1-abcdef-PLN-2-abcdef-plan.md`, a name the generator no longer reads.
   Severity high.
2. **Checkbox lines inside fenced code blocks are counted.** `parseIssues` and
   `parseTasks` in `fc-index.mjs` match a checkbox line anywhere, so a quoted example
   counts as a live issue or task, enters the ID graph and the progress figure, and keeps
   a list open to `--sync`. Severity high.
3. **Frontmatter escapes are never decoded.** The frontmatter reader strips the outer
   quotes of a `--new-ws` title without undoing the escapes the writer emits, so the board
   and `--list` show literal backslash sequences. Severity medium.
4. **An unquoted value that opens with a bracket is parsed as an inline array.**
   `--new-ws` writes `author` unquoted, and `parseFrontmatter` splits any value that opens
   with `[` into a list, so `[Ada] Lovelace` renders as `Ada] Lovelace`. Severity medium.
5. **A refused run still writes `.gitignore`.** `ensureGitignore` runs before the argument
   parsers, so an invocation they refuse has already created or appended to `.gitignore`
   when it exits 1. Severity medium.
6. **`--check` claims it rewrote the `ids.md` header.** Under `--check` the stale-header
   WARN ends with the word rewritten, although nothing is written. Severity low.
7. **`--sort status` ranks a blocked issue first.** The comparator ranks by the five-value
   artefact enum, so `blocked` and every unrecognised status sort ahead of `backlog`.
   Severity low.
8. **A directory named like an artefact crashes the generator.** The per-folder listing
   reads every matching name, so such a directory throws an unhandled `EISDIR` in every
   mode. Severity low.
9. **The ready-to-start section hides a task list whose plan or issue-list dependency is
   authored.** `isDone` demands `done` of every dependency, against the rule that a plan
   or issue-list dependency is met once authored, and README.md states the same outdated
   rule. Severity low.
10. **The `.gitignore` coverage test misses equivalent spellings.** A covering entry
    written with a leading slash or a trailing glob, such as `/flowcharge/` or
    `flowcharge/**`, is not recognised, so redundant lines are appended. Severity low.
11. **The second `--sync` test case asserts a hard-coded target.** Its loop over the
    workstream record and the task list checks the task list twice and the record never.
    Severity low.
12. **Test date assertions race the generator's clock across local midnight.** Cases read
    the day before spawning the generator, which reads its own clock, so a run that
    crosses local midnight fails. Severity low.
13. **The test suite derives its folder from a file URL pathname.** The pathname keeps a
    slash in front of a Windows drive letter, so every path derived from it is invalid on
    Windows. Severity low.
14. **A directory named like an artefact crashes the renamer.** The renamer's per-folder
    scan reads every matching name, so such a directory throws an unhandled `EISDIR` in
    the dry run and under `--apply`. Severity low.
