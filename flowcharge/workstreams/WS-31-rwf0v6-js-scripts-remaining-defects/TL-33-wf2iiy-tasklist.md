---
id: TL-33-wf2iiy
type: tasklist
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "Fix the setup-labels entry guard, the path used as an import specifier, the CONVENTIONS .gitignore count and the tag pool's automatic tags"
status: ready
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: [IL-8-vsynnq]
links: []
mode: spec
base_commit: ada3d08
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## The setup-labels entry guard, a path used as an import specifier, the CONVENTIONS .gitignore count and the tag pool's automatic tags

Fixes the four defects IL-8-vsynnq files, one task per issue. Task 1 makes `.github/scripts/setup-labels.mjs` run `main()` when the real path of its own file equals the real path of `process.argv[1]`, through `fileURLToPath`, instead of comparing its module URL with a file URL built by hand, so the script runs from a path holding a space, through a symlinked folder and on Windows. Task 2 makes the suite's setup-labels table case import the script through `pathToFileURL`, so the import loads on Windows and from a folder whose name holds `#`. Task 3 corrects the CONVENTIONS.md paragraph that says the generator keeps three paths out of git; the generator is the right side and stays as it is. Task 4 adds the automatic tags `feature` and `issue` to this repository's own tag pool, which CONVENTIONS.md and the generator's seed both treat as pool entries. Tasks 1 to 3 each end the `### Fixed` list under `## Unreleased` in `CHANGELOG.md` with their own bullet, wrapped at about 80 columns with a two-space continuation indent; task 4 changes project data the release does not ship and takes no bullet. No version changes. Every change stays within Node 16 and adds no dependency. The test-update task adds, for each code fix in tasks 1, 2 and 4, a case in `run-tests.mjs` that fails at `base_commit` and passes once the fix lands; task 3 changes documentation only and takes no case.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Run setup-labels.mjs's entry point through real paths
  ```yaml
  description: "setup-labels.mjs runs main() when the real path of its own file equals the real path of process.argv[1], so it runs from a path holding a space, through a symlinked folder and on Windows, and an import of the module still runs nothing"
  issues: [ISS-27-z1hxj3]
  implement:
    - "In .github/scripts/setup-labels.mjs, extend the import block, which holds only `import { spawnSync } from 'node:child_process';`: add `import fs from 'node:fs';` above that line and `import { fileURLToPath } from 'node:url';` below it."
    - "Replace the entry guard at the end of the file, the `if` that compares import.meta.url with a file URL built from process.argv[1], with a function isEntryPoint() and the call `if (isEntryPoint()) { main(); }`. isEntryPoint returns whether fs.realpathSync(fileURLToPath(import.meta.url)) equals fs.realpathSync(process.argv[1]), inside a try/catch that returns false on any throw."
    - "Keep the first sentence of the comment above the guard, which names case L6, and continue it: main() runs only when node was asked to run this file, which is when the module's own file and process.argv[1] are the same real file; comparing real paths holds on Windows, for a path holding a space and through a symlinked folder; and a process.argv[1] that names no file, as under node -e or for a script read from stdin, throws in realpathSync and means the module was imported."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- \\`setup-labels.mjs\\` runs when started from a path that holds a space, through` then, on the next line, `  a symlinked folder or on Windows, instead of exiting without doing anything.`"
  pattern: ".github/scripts/setup-labels.mjs, CHANGELOG.md"
  imports: "fs from node:fs and fileURLToPath from node:url, both Node built-ins. No package is added."
  compatibility: "fs.realpathSync, fileURLToPath and a catch clause with no binding are in Node 16. Node sets process.argv[1] to the absolute path the command named and loads the entry module from the real path of that file, so the two real paths are equal exactly when this file is the entry point, on every platform, and also under --preserve-symlinks-main, because both sides go through realpathSync. Case L6 imports the module through node -e with no further argument, where process.argv[1] is undefined: realpathSync throws, the guard is false and no gh call runs, as at base_commit. HELP, LABELS, planLabelChanges and main() stay as they are."
  gotcha: "No code or comment in the file may spell a file URL by hand, from a template literal or by joining strings, because the test-update task's scan case flags that form in every script. Comparing fileURLToPath(import.meta.url) with process.argv[1] alone still misses a symlinked folder, so both sides go through fs.realpathSync. Without the try/catch, an importer whose process.argv[1] names no file, such as a script read from stdin, where it is '-', would crash on ENOENT."
  verify:
    - "grep -c \"^import fs from 'node:fs';$\" .github/scripts/setup-labels.mjs  # expect 1; 0 at base_commit"
    - "grep -c \"^import { fileURLToPath } from 'node:url';$\" .github/scripts/setup-labels.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])' .github/scripts/setup-labels.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'file://' .github/scripts/setup-labels.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'runs when started from a path that holds a space' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: setup-labels.mjs imports fs from node:fs and fileURLToPath from node:url"
    - "source: main() runs only when isEntryPoint() is true, and isEntryPoint compares fs.realpathSync(fileURLToPath(import.meta.url)) with fs.realpathSync(process.argv[1]) inside a try/catch that returns false"
    - "source: no file URL is spelled by hand anywhere in setup-labels.mjs, in code or in a comment"
    - "source: HELP, LABELS, planLabelChanges and main() read as at base_commit"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 and verify 2 each returned 1; the import block reads fs from node:fs, spawnSync from node:child_process, then fileURLToPath from node:url"
      - result: YES
        measured: "source: verify 3 returned 1; isEntryPoint() returns fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1]) inside a try whose catch returns false, and main() runs only under if (isEntryPoint())"
      - result: YES
        measured: "source: verify 4 returned 0; the new comment names real paths and does not spell a file URL"
      - result: YES
        measured: "source: git diff ada3d08 of setup-labels.mjs adds the two imports and replaces the guard and its comment only; HELP, LABELS, planLabelChanges and main() are untouched, and node --check passes"
      - result: YES
        measured: "source: verify 5 returned 1, and the two-line bullet, at most 78 columns wide, is the last item of ### Fixed under ## Unreleased"
    failures:
      - item: "checklist 4"
        reason: "the import edit also removed the space between const HELP = and the template literal's opening backtick"
        fix: "restored the space; git diff ada3d08 then showed no change to the HELP line"
  ```

- [x] 2. Import setup-labels.mjs through a file URL in the table case
  ```yaml
  description: "The setup-labels table case imports setup-labels.mjs through the file URL of its path, so the import loads on Windows and from a folder whose name holds #"
  issues: [ISS-28-40lzir]
  implement:
    - "In skills/flowcharge/scripts/test/run-tests.mjs, change the import line `import { fileURLToPath } from 'node:url';` to `import { fileURLToPath, pathToFileURL } from 'node:url';`."
    - "In the case 'setup-labels: the table holds exactly six entries, the six required names, capped descriptions, no priority label', build the specifier in the `const script` line from `JSON.stringify(pathToFileURL(SETUP_LABELS).href)` instead of `JSON.stringify(SETUP_LABELS)`, and leave the rest of that line and of the case as they are."
    - "Add a one-line comment above `const script`: an import specifier is a URL, so the path goes through pathToFileURL, which a Windows drive path and a # in a folder name both need."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- The test suite imports \\`setup-labels.mjs\\` through a file URL, so its label` then, on the next line, `  table case runs on Windows and from a folder whose name holds \\`#\\`.`"
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, CHANGELOG.md"
  imports: "pathToFileURL from node:url, a Node built-in, beside the fileURLToPath the suite already imports. No package is added."
  compatibility: "pathToFileURL is in node:url on Node 16, and the ESM loader accepts the file: URL it returns on every platform. On macOS and Linux it names the same file the plain path names for an ordinary folder, so the case keeps its assertions and its result. The static import of LABELS at the top of the suite is a relative specifier resolved against the suite's own file URL, and stays as it is."
  gotcha: "Keep JSON.stringify around the href: the specifier still sits inside a quoted string in the -e source. The test-update task's scan case flags an import specifier interpolated from JSON.stringify of anything but pathToFileURL(...), so the fixed line must read JSON.stringify(pathToFileURL(SETUP_LABELS).href)."
  verify:
    - "grep -c \"^import { fileURLToPath, pathToFileURL } from 'node:url';$\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'JSON.stringify(pathToFileURL(SETUP_LABELS).href)' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'from ${JSON.stringify(SETUP_LABELS)}' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'so its label' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: run-tests.mjs imports pathToFileURL from node:url beside fileURLToPath"
    - "source: the table case imports setup-labels.mjs through JSON.stringify(pathToFileURL(SETUP_LABELS).href), and its assertions read as at base_commit"
    - "source: no import specifier in run-tests.mjs is built from a plain path"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 1; line 28 imports fileURLToPath and pathToFileURL from node:url"
      - result: YES
        measured: "source: verify 2 returned 1 and verify 3 returned 0; git diff touches only the node:url import, the new comment and the specifier of the const script line, so the case's assertions read as at base_commit"
      - result: YES
        measured: "source: grep for an interpolated import specifier finds one site, line 4934, built from JSON.stringify(pathToFileURL(SETUP_LABELS).href)"
      - result: YES
        measured: "source: verify 4 returned 1, and the two-line bullet, at most 77 columns wide, is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 3. State the four ignored paths in CONVENTIONS.md
  ```yaml
  description: "CONVENTIONS.md states the four paths the generator keeps out of git, the workstream lease files included, as GITIGNORE_TARGETS lists them"
  issues: [ISS-29-92o4ay]
  implement:
    - "In skills/flowcharge/CONVENTIONS.md, section `## The index and the board are generated`, rewrite the paragraph that opens 'Because both outputs are disposable'. Its first sentence adds the lease files and their reason, each workstream's `.lease` file being a lock bound to the run that holds it, and says the script keeps all four out of git. Its second sentence lists what a writing run appends as `flowcharge/index.md`, `flowcharge/kanban.md`, `flowcharge/ids/` and `flowcharge/workstreams/*/.lease`."
    - "Keep the paragraph's list of writing modes and its other sentences word for word, and re-wrap the paragraph at the width the surrounding paragraphs use, about 86 columns."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- CONVENTIONS.md states the four paths the generator keeps out of git, the` then, on the next line, `  workstream lease files included.`"
  pattern: "skills/flowcharge/CONVENTIONS.md, CHANGELOG.md"
  compatibility: "The generator is the right side and stays unchanged: GITIGNORE_TARGETS in skills/flowcharge/scripts/fc-index.mjs lists flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease, its --help text names the same four, and README.md states four lines. The docs-consistency cases in run-tests.mjs scan skills/**/*.md: rule G resolves only paths that open with skills/ or templates/, and rule A matches only a workstreams/ path followed by a slug placeholder, so the lease glob trips neither."
  gotcha: "Write the lease path with its * glob, exactly as GITIGNORE_TARGETS spells it, so it reads as the pattern the .gitignore line holds. Rule E of the docs-consistency cases fails on the literal word gate in any skills/ Markdown file, so the new wording must not use it. The rest of the section, and the layout block at the top of the file, are not part of this change."
  verify:
    - "grep -cF 'keeps all four out of git' skills/flowcharge/CONVENTIONS.md  # expect 1; 0 at base_commit"
    - "grep -cF 'all three out of git' skills/flowcharge/CONVENTIONS.md  # expect 0; 1 at base_commit"
    - "grep -cF 'flowcharge/workstreams/*/.lease' skills/flowcharge/CONVENTIONS.md  # expect 1; 0 at base_commit"
    - "git diff --quiet ada3d08 -- skills/flowcharge/scripts/fc-index.mjs && echo unchanged  # expect unchanged; unchanged at base_commit, since it guards a file this task must not touch"
    - "grep -cF 'states the four paths the generator keeps out of git' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the paragraph says the script keeps all four paths out of git and names the lease files with their reason"
    - "source: the paragraph lists flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease as what a writing run appends, matching GITIGNORE_TARGETS"
    - "source: the list of writing modes and the paragraph's other sentences keep their words, and no line is wider than the surrounding paragraphs"
    - "source: fc-index.mjs is byte-identical to base_commit"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 1 and verify 2 returned 0; the first sentence names each workstream's .lease file as a lock bound to the run that holds it and says the script keeps all four out of git"
      - result: YES
        measured: "source: verify 3 returned 1; the second sentence lists flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease, the four GITIGNORE_TARGETS entries"
      - result: YES
        measured: "source: the list of writing modes and the four later sentences read word for word once the line breaks are joined, and the paragraph's widest line is 86 columns, the width of its widest line at base_commit"
      - result: YES
        measured: "source: verify 4 printed unchanged"
      - result: YES
        measured: "source: verify 5 returned 1, and the two-line bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 4. List the automatic tags in this repository's tag pool
  ```yaml
  description: "flowcharge/tags.md lists the automatic tags feature and issue, in its alphabetical order"
  issues: [ISS-30-fi8uta]
  pattern: "flowcharge/tags.md"
  implement:
    - "In flowcharge/tags.md, add the line `- feature` after `- data-integrity` and the line `- issue` after `- git`, so the list stays in alphabetical order, and change nothing else in the file. This pool is the repository's own project data, which the release does not ship, so CHANGELOG.md takes no bullet for it."
  verify:
    - "grep -cE '^- (feature|issue)$' flowcharge/tags.md  # expect 2; 0 at base_commit"
    - "grep '^- ' flowcharge/tags.md | LC_ALL=C sort -c && echo sorted  # expect sorted; sorted at base_commit too, since it guards the order the two lines join rather than detecting them"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 2; git diff adds - feature after - data-integrity and - issue after - git, and nothing else"
      - result: YES
        measured: "source: verify 2 printed sorted"
  ```

- [x] 5. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Add, for task 1 (ISS-27-z1hxj3): directly after the case 'setup-labels: the table holds exactly six entries, the six required names, capped descriptions, no priority label', the case 'setup-labels: runs from a path holding a space or through a symlinked folder, and runs nothing when imported'. Inside withFixture({}, ...), copy SETUP_LABELS to <dir>/with space/setup-labels.mjs and create the symbolic link <dir>/link to <dir>/with space. For the copy reached through each of the two folders, run spawnSync(process.execPath, [<copy>, '--help'], { cwd: dir, encoding: 'utf8' }) and assert exit 0 with stdout opening 'setup-labels.mjs: reconciles', then run it with '--bogus' and assert exit 1 with stderr naming the unknown argument. Then run node --input-type=module -e with an import of LABELS from JSON.stringify(pathToFileURL(<copy>).href) that writes String(LABELS.length), followed by the extra argument 'stray', and assert exit 0 with stdout '6': imported where process.argv[1] names no file, the module runs nothing and throws nothing. No run reaches gh, so the case needs no stub. Give it a comment naming the path spellings the entry guard must match."
    - "Add, for tasks 1 and 2 (ISS-27-z1hxj3, ISS-28-40lzir): directly after the case 'no script derives a path from a file URL pathname', the case 'no script builds a file URL or an import specifier from a path by hand'. It reads the same .mjs files in the same three folders and collects the repository-relative path of each file whose text holds any of three forms: a template literal in which file:// runs straight into an interpolation; a quoted file:// prefix joined to a value with +; and an import specifier interpolated from JSON.stringify of anything but pathToFileURL(...). It asserts with assert.deepStrictEqual that the list is empty, so a failure names each file. At base_commit it names .github/scripts/setup-labels.mjs and skills/flowcharge/scripts/test/run-tests.mjs. Give it a comment: a file URL comes from pathToFileURL and a path from fileURLToPath, because a URL spelled by hand from a path is wrong on Windows and for a path holding a character a URL encodes."
    - "Add, for task 4 (ISS-30-fi8uta): directly after the case '--check reports a missing tag pool and does not create it', the case 'the tag pool of this repository lists both automatic tags'. It reads flowcharge/tags.md under the repository root, resolved as path.resolve(HERE, '..', '..', '..', '..'), collects its entries with the pattern the generator reads a pool with, a line of '- ' followed by the tag, and asserts with assert.deepStrictEqual that the automatic tags feature and issue it lacks form an empty list. Give it a comment: unlike the cases around it, this one reads the repository's own pool rather than a fixture, because the orchestrator adds the automatic tags itself and a pool without them draws a WARN on every workstream that carries one."
    - "Task 3 (ISS-29-92o4ay) adds no case: it corrects CONVENTIONS.md, documentation, and the request asks for a case for each code fix."
  verify:
    - "grep -cF \"testCase('setup-labels: runs from a path holding a space or through a symlinked folder, and runs nothing when imported'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('no script builds a file URL or an import specifier from a path by hand'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('the tag pool of this repository lists both automatic tags'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -cF of the entry-point case returned 1; the case sits directly after the setup-labels table case"
      - item: "verify 2"
        result: YES
        measured: "source: grep -cF of the hand-built file URL scan case returned 1; the case sits directly after the file URL pathname scan case"
      - item: "verify 3"
        result: YES
        measured: "source: grep -cF of the tag pool case returned 1; the case sits directly after the missing-pool --check case, and node --check of run-tests.mjs passes"
  ```

- [ ] 6. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_baseline: []
    test_run_failures: []
  ```
