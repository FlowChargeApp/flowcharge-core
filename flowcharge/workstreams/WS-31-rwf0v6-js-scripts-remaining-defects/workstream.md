---
id: WS-31-rwf0v6
type: workstream
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "Windows script paths, a manifest test midnight race, a refused --new-ws .gitignore write and the README .gitignore count"
status: done
tags: [correctness, generator, issue]
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: []
links: []
---
Fix the Windows file-URL path derivation in the scripts, a midnight race in the manifest test, a .gitignore write on a refused --new-ws run, and README's .gitignore line count.

## Request

Check each defect below against the current code with a live reproduction in a
throwaway fixture outside this repository's own `flowcharge/` folder. File an issue
only for a defect that still reproduces. Author spec-mode fix tasks for the filed
issues, validate them, execute every task, and commit after each parent task lands,
not after each child task.

Every code fix:

- gets a test case in `skills/flowcharge/scripts/test/run-tests.mjs` that fails
  before the fix and passes after it;
- stays compatible with Node 16 and adds no dependency;
- is recorded in the `### Fixed` section under `## Unreleased` in `CHANGELOG.md`,
  wrapped at about 80 columns like the other entries. No version changes, because a
  release decides the version.

The suite runs with `node skills/flowcharge/scripts/test/run-tests.mjs`.

## Defects

1. **File-URL path building breaks on Windows.**
   `skills/flowcharge/scripts/fc-index.mjs` and the scripts under `.github/scripts/`
   derive a directory from `new URL(import.meta.url).pathname`, which keeps a slash in
   front of a Windows drive letter (`/C:/...`). `skills/flowcharge/scripts/test/run-tests.mjs`
   already derives its own folder through `fileURLToPath`, and a test case pins that
   form. Apply the same form to every remaining site, list each site found and fixed,
   and leave a site unchanged only where the pathname form is provably safe.
2. **The manifest test's date check races local midnight.** The manifest case compares
   the day `manifest.mjs` wrote with a day it reads after the script has run, so a run
   that crosses local midnight fails. The `--sync` and `--new-ws` cases already accept
   the day written when it is the day the case started or the day it reads afterwards.
   Reuse that form.
3. **A refused `--new-ws` run whose slug is taken still writes `.gitignore`.** Every
   other refused `fc-index.mjs` run writes nothing. This refusal must behave the same
   way.
4. **README.md miscounts the `.gitignore` lines.** README.md says Core adds three
   `.gitignore` lines, and the generator writes four. Decide from the generator's own
   code which side is right, then correct README.md, or the generator only if its code
   is clearly the wrong side.
5. **setup-labels.mjs's entry guard misses its own entry point.**
   `.github/scripts/setup-labels.mjs` decides whether it was run directly by comparing
   `import.meta.url` with a `file://` string built by hand from `process.argv[1]`. On
   Windows, or from a path that holds a space, the two never match, so the script
   exits 0 and does nothing. Fix it with the `fileURLToPath` form the other scripts
   already use, and pin it in the suite next to the case that scans the scripts for
   file-URL pathname derivations.
6. **CONVENTIONS.md miscounts the paths the generator keeps out of git.**
   `skills/flowcharge/CONVENTIONS.md` says the generator keeps three paths out of
   git, and the generator writes four: `flowcharge/index.md`, `flowcharge/kanban.md`,
   `flowcharge/ids/` and `flowcharge/workstreams/*/.lease`. Correct the document,
   with the generator's own list as the truth.
7. **The tag pool lacks the automatic tags.** `flowcharge/tags.md` does not list
   `issue` and `feature`, so every workstream that carries one draws a "not in the
   tag pool" warning. Decide from CONVENTIONS.md and the generator which side is
   wrong, the pool file or a generator that should exempt the automatic tags, and fix
   that side with a test case, so that `--check` and the default run print no such
   warning for this repository's own `flowcharge/` folder.

## Sweep

Search the whole repository for every other instance of the three defect families in
items 5 to 7, and fix or report each one:

- script entry guards, and file-URL or path derivations, under `skills/` and
  `.github/`;
- documents and code comments that state which paths the generator keeps out of
  git, or how many `.gitignore` lines it writes;
- the tag pool against the automatic tags.

Nothing outside these three families is in scope.
