---
id: WS-31-rwf0v6
type: workstream
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "Windows script paths, a manifest test midnight race, a refused --new-ws .gitignore write and the README .gitignore count"
status: in-progress
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
