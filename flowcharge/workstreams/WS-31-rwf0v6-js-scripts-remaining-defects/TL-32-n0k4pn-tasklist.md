---
id: TL-32-n0k4pn
type: tasklist
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "Fix the Windows script paths, the manifest test date race, the refused --new-ws .gitignore write and the README .gitignore count"
status: ready
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: [IL-7-eho3cs]
links: []
mode: spec
base_commit: 5e725c0
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Windows script paths, the manifest test date race, the refused --new-ws .gitignore write and the README .gitignore count

Fixes the four defects IL-7-eho3cs files, one task per issue. Task 1 derives the own folder of `skills/flowcharge/scripts/fc-index.mjs` and of six scripts under `.github/scripts/` through `fileURLToPath`, the form `skills/flowcharge/scripts/test/run-tests.mjs` already uses. Task 2 makes the manifest case's generated-day check accept the day the case started or the day it reads afterwards, the form the `--sync` and `--new-ws` cases use, through one shared helper. Task 3 refuses a taken `--new-ws` slug before `fc-index.mjs` writes `.gitignore`. Task 4 corrects the README.md sentence that counts the `.gitignore` lines; the generator is the right side and stays as it is. Each fix task ends the `### Fixed` list under `## Unreleased` in `CHANGELOG.md` with its own bullet, wrapped at about 80 columns with a two-space continuation indent. No version changes. Every change stays within Node 16 and adds no dependency. The test-update task adds, for each code fix in tasks 1 to 3, a case in `run-tests.mjs` that fails at `base_commit` and passes once the fix lands; task 4 changes documentation only and takes no case.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Derive each script's own folder through fileURLToPath

  ```yaml
  description: "fc-index.mjs and the six .github/scripts that derive their own folder from a file URL pathname derive it through fileURLToPath, which gives a valid path on Windows"
  ```

  - [x] 1.1 Derive the generator's own repository root through fileURLToPath
    ```yaml
    description: "fc-index.mjs derives SELF_ROOT from path.dirname(fileURLToPath(import.meta.url)) instead of the decoded file URL pathname"
    issues: [ISS-23-jp7g43]
    implement:
      - "In skills/flowcharge/scripts/fc-index.mjs, add `import { fileURLToPath } from 'node:url';` directly after the last import line, `import { execFileSync } from 'node:child_process';`."
      - "In the `const SELF_ROOT = path.resolve(` declaration below the `const idsDir` line, replace the decoded-pathname argument with `path.dirname(fileURLToPath(import.meta.url))`, keeping the `'..', '..', '..'` arguments as they are."
      - "End the comment above SELF_ROOT with one sentence: the folder comes from fileURLToPath rather than from the URL's pathname, which keeps a slash in front of a Windows drive letter (/C:/...) that no path API resolves."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "fileURLToPath from node:url, a Node built-in. No package is added."
    compatibility: "fileURLToPath is in node:url on Node 16. On macOS and Linux it returns the same path as the old expression, percent-encoded characters such as a space included, so SELF_ROOT keeps its value there. SELF_ROOT has two readers, the realpath guard around the suite-version check and checkSuiteVersion(SELF_ROOT); neither changes."
    gotcha: "The comment must not quote the old expression: the test-update task's case scans this file for any file-URL pathname derivation and fails on a quoted one too. Keep the derivation inside path.resolve with its three '..' arguments: the script sits three directories below the repository root."
    verify:
      - "grep -c \"^import { fileURLToPath } from 'node:url';$\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'path.dirname(fileURLToPath(import.meta.url))' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'URL(import.meta.url).pathname' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
    checklist:
      - "source: fileURLToPath is imported from node:url directly after the other imports"
      - "source: SELF_ROOT is path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')"
      - "source: no file-URL pathname derivation remains in fc-index.mjs, in code or in a comment"
      - "source: the realpath guard and the checkSuiteVersion call that read SELF_ROOT read as at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 returned 1; the import sits at line 13, directly after the node:child_process import"
        - result: YES
          measured: "source: verify 2 returned 1; SELF_ROOT is path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')"
        - result: YES
          measured: "source: verify 3 returned 0, and the new comment sentence names fileURLToPath and the URL's pathname without quoting the old expression"
        - result: YES
          measured: "source: git diff of fc-index.mjs changes only the import, the comment and the SELF_ROOT argument; the realpath guard and the checkSuiteVersion call are untouched"
    ```

  - [x] 1.2 Derive the six release scripts' own folders through fileURLToPath
    ```yaml
    description: "build-release-zip.mjs, changelog-section.mjs, check-release.mjs, manifest.mjs, release.mjs and stamp-skill-versions.mjs derive their own folder through fileURLToPath"
    issues: [ISS-23-jp7g43]
    implement:
      - "In each of .github/scripts/build-release-zip.mjs, changelog-section.mjs, check-release.mjs, manifest.mjs, release.mjs and stamp-skill-versions.mjs, add `import { fileURLToPath } from 'node:url';` directly after the file's last import line."
      - "In build-release-zip.mjs, changelog-section.mjs, check-release.mjs, manifest.mjs and stamp-skill-versions.mjs, replace the decoded-pathname argument of `const SELF_ROOT = path.resolve(` with `path.dirname(fileURLToPath(import.meta.url))`, keeping the `'..', '..'` arguments. In release.mjs, make `const SELF_DIR = path.dirname(fileURLToPath(import.meta.url));`; SELF_ROOT, STAMPER and MANIFEST, which are built from SELF_DIR, stay as they are."
      - "End the comment above each changed constant with one sentence: the folder comes from fileURLToPath rather than from the URL's pathname, which keeps a slash in front of a Windows drive letter (/C:/...) that no path API resolves."
      - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- \\`fc-index.mjs\\` and the release scripts under \\`.github/scripts/\\` resolve their` then, on the next line, `  own folder correctly on Windows.`"
    pattern: ".github/scripts/build-release-zip.mjs, .github/scripts/changelog-section.mjs, .github/scripts/check-release.mjs, .github/scripts/manifest.mjs, .github/scripts/release.mjs, .github/scripts/stamp-skill-versions.mjs, CHANGELOG.md"
    imports: "fileURLToPath from node:url, a Node built-in, in each of the six scripts. No package is added."
    compatibility: "fileURLToPath is in node:url on Node 16. On macOS and Linux it returns the same folder as the old expression, so every path built from SELF_ROOT or SELF_DIR keeps its value there: CI on ubuntu-latest and the cases that copy each script into a fixture at <fixture>/.github/scripts/ behave as before. release.mjs still spawns the stamper and manifest.mjs beside its own copy."
    gotcha: "setup-labels.mjs is not part of this change: it derives no folder from import.meta.url, and the change leaves it byte-identical. No comment may quote the old expression, because the test-update task's case scans these files for it."
    verify:
      - "grep -lF \"import { fileURLToPath } from 'node:url';\" .github/scripts/*.mjs | wc -l  # expect 6; 0 at base_commit"
      - "grep -lF 'path.dirname(fileURLToPath(import.meta.url))' .github/scripts/*.mjs | wc -l  # expect 6; 0 at base_commit"
      - "cat .github/scripts/*.mjs | grep -cF 'URL(import.meta.url).pathname'  # expect 0; 6 at base_commit"
      - "git diff --quiet 5e725c0 -- .github/scripts/setup-labels.mjs && echo unchanged  # expect unchanged; unchanged at base_commit, since it guards a file this task must not touch"
      - "grep -cF 'the release scripts under `.github/scripts/`' CHANGELOG.md  # expect 1; 0 at base_commit"
    checklist:
      - "source: each of the six scripts imports fileURLToPath from node:url and derives its folder as path.dirname(fileURLToPath(import.meta.url))"
      - "source: release.mjs's SELF_ROOT, STAMPER and MANIFEST and the five other scripts' two '..' arguments read as at base_commit"
      - "source: no file-URL pathname derivation remains under .github/scripts/, in code or in a comment"
      - "source: setup-labels.mjs is byte-identical to base_commit"
      - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "source: verify 1 and verify 2 each returned 6: every one of the six scripts imports fileURLToPath from node:url after its last import line and derives its folder as path.dirname(fileURLToPath(import.meta.url))"
        - result: YES
          measured: "source: git diff 5e725c0 of .github/scripts/ changes only the six imports, six comments and six derivation lines; release.mjs's SELF_ROOT, STAMPER and MANIFEST and the other five scripts' '..', '..' arguments are untouched"
        - result: YES
          measured: "source: verify 3 returned 0, and no new comment quotes the old expression"
        - result: YES
          measured: "source: verify 4 printed unchanged"
        - result: YES
          measured: "source: verify 5 returned 1, and the two-line bullet, 79 columns wide, is the last item of ### Fixed under ## Unreleased"
    ```

- [x] 2. Accept the day manifest.mjs wrote across local midnight in the manifest case
  ```yaml
  description: "Case M2 reads its start day before manifest.mjs runs and accepts the generated day when it is that day or the day it reads afterwards, through the accepting check writtenDay already applies"
  issues: [ISS-24-fahe4r]
  implement:
    - "In skills/flowcharge/scripts/test/run-tests.mjs, directly above `function writtenDay(dir, rel, key, startDay)`, add `function acceptDay(what, day, startDay)`. It holds writtenDay's accepting check, `const days = [startDay, today()];` and the assert.ok whose message reads `${what} ${day} is neither ${days.join(' nor ')}`, and returns day. Move writtenDay's comment to it, worded for any script that writes a day from its own clock, and say that what names the value in the failure message."
    - "Make writtenDay read its key line as it does now and return `acceptDay(`${rel}: ${key}`, day, startDay)`, so its failure message stays byte-identical. Give it a one-line comment: the day the generator wrote on rel's key: line, accepted by acceptDay()."
    - "In the case 'manifest: M2 the document has the contracted key order, sorting, version invariant and generated day', add `const startDay = today();` as the first statement of the case body, before withManifestFixture and so before manifest.mjs runs. Replace `assert.strictEqual(parsed.generated, today(), 'generated is not the local calendar day');` with `acceptDay('generated', parsed.generated, startDay);`, and reword the comment above it: the script writes its own local-calendar day, the rule today() follows, where a toISOString() day would be UTC; and the script reads its own clock, so the day the case started is accepted as well as today()."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- The manifest test case accepts the date \\`manifest.mjs\\` wrote when a run` then, on the next line, `  crosses local midnight.`"
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, CHANGELOG.md"
  compatibility: "acceptDay and writtenDay are function declarations, so both are hoisted and callable from case M2 near the end of the file. writtenDay keeps its signature and its message, so expectClosedFile, the six --sync cases and the two --new-ws cases that call it read as at base_commit. today() and every other assertion of case M2 stay as they are."
  gotcha: "startDay must be read before generateManifest(dir) runs, and today() inside acceptDay after it: the two reads bracket the script's own clock read, which is what makes a run across local midnight pass while a wrong date still fails. Do not read the day back from manifest.json's text with writtenDay: its key: line pattern matches YAML frontmatter, not the JSON line, which is why the accepting check is shared rather than writtenDay itself. The two mtime-pinned cases read their day for setMtime and are not part of this change."
  verify:
    - "grep -c '^function acceptDay(what, day, startDay) {$' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"acceptDay('generated', parsed.generated, startDay);\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'parsed.generated, today()' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'The manifest test case accepts the date' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: acceptDay(what, day, startDay) holds the one accepting check, startDay or today(), and returns the day"
    - "source: writtenDay reads its key: line and returns acceptDay's result with the message `${rel}: ${key} ${day} is neither ...`, as at base_commit"
    - "source: case M2 reads startDay with today() before withManifestFixture runs manifest.mjs and checks parsed.generated through acceptDay with that start day"
    - "source: no assertion compares parsed.generated with a today() read after the run, and M2's other assertions read as at base_commit"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 returned 1; acceptDay builds days from startDay and today(), asserts the day is one of them and returns it"
      - result: YES
        measured: "source: writtenDay keeps its key-line read and returns acceptDay(`${rel}: ${key}`, day, startDay), so its message still reads `${rel}: ${key} ${day} is neither ...`; its three call sites, in expectClosedFile and the two --new-ws cases, are unchanged"
      - result: YES
        measured: "source: const startDay = today(); is the first statement of case M2, before withManifestFixture, and verify 2 returned 1"
      - result: YES
        measured: "source: verify 3 returned 0; git diff of run-tests.mjs touches only the two helpers, M2's first line and M2's generated-day check with its comment"
      - result: YES
        measured: "source: verify 4 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 3. Refuse a taken --new-ws slug before the .gitignore write
  ```yaml
  description: "fc-index.mjs checks whether a live or archived folder already carries the --new-ws slug before it writes .gitignore, so that refusal writes nothing, like every other refused run"
  issues: [ISS-25-nzbdds]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, move the slug-collision check out of the `if (newWsOpts) {` block of the --new-ws mode: the comment that opens 'Collision first, claim second' and the `for (const rootSpec of ROOTS)` loop that prints `slug \"${slug}\" is already taken by ...` and exits 1. Place it, inside its own `if (newWsOpts) { const { slug } = newWsOpts; ... }`, directly after `const claimOpts = parseClaimArgs(args);` and before the comment that opens 'Self-enforcing' above the .gitignore write. The loop body and its message stay byte-identical."
    - "Reword the moved comment: the check runs after the last argument parser and before both the .gitignore write and the claim, so a refused run exits 1 having written nothing and claimed nothing, and an id claimed and then abandoned would leave an orphan marker directory behind."
    - "In the comment above the .gitignore write, say it is placed after the last argument parser and the --new-ws slug check, so a run that refuses its own arguments or a taken slug exits 1 having written nothing."
    - "Leave the --new-ws mode block opening with `const { slug, title, tags, status } = newWsOpts;` followed by the claim."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- An \\`fc-index.mjs --new-ws\\` run refused for a taken slug no longer creates or` then, on the next line, `  changes \\`.gitignore\\`.`"
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "ROOTS, the live and archive roots the loop reads, is declared before the new position, as are newWsOpts and claimOpts. --new-ws cannot be combined with --list, --check, --whoami, --claim, --sync or --init, so the check runs only in a --new-ws run, and every parser that can refuse such a run has already run. The refusal keeps its one stderr line and exit 1, which the case '--new-ws refuses a slug an existing folder carries and leaks no marker' expects."
  gotcha: "Move the loop, do not copy it: the message must exist once, so verify 2 counts it. The check must stay before allocateIds('WS', 1), or a refused run leaks a marker directory. The two containment refusals inside the --new-ws block guard paths the slug allow-list already makes unreachable and are not part of this change. Do not change the --help text: 'Refused, with nothing claimed' stays true."
  verify:
    - "awk '/is already taken by/{t=NR} /^ +ensureGitignore\\(root\\);/{g=NR} END{print (t && g && t<g) ? \"before\" : \"after\"}' skills/flowcharge/scripts/fc-index.mjs  # expect before; after at base_commit"
    - "grep -c 'is already taken by' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 1 at base_commit, since it guards against a copied loop rather than detecting the move"
    - "grep -cF 'run refused for a taken slug' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the slug-collision check runs after the last argument parser and before the .gitignore write, for a live and an archived folder alike"
    - "source: the check still runs before allocateIds, so a refused run claims no id"
    - "source: the refusal message and exit code 1 are byte-identical to base_commit, and the message exists once"
    - "source: the comments above the moved check and the .gitignore write state the new order"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 printed before; the check sits at lines 1304-1320, after const claimOpts at 1302 and before ensureGitignore(root) at 1333, and loops over ROOTS, the live and archive roots"
      - result: YES
        measured: "source: allocateIds('WS', 1) sits at line 1356, inside the --new-ws block, after the check"
      - result: YES
        measured: "source: git diff shows the loop's lines removed from the --new-ws block and added unchanged at the new position; verify 2 returned 1"
      - result: YES
        measured: "source: the comment above the check says it runs before the .gitignore write and the claim, and the .gitignore comment names the --new-ws slug check before its write"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [ ] 4. State the four .gitignore lines in README.md
  ```yaml
  description: "README.md's Layout in a target project section states the four .gitignore lines the generator writes, the workstream lease files included"
  issues: [ISS-26-v95vp1]
  implement:
    - "In README.md, section `## Layout in a target project`, replace the opening sentence 'Core adds one folder, `flowcharge/`, plus three `.gitignore` lines for the two generated views and the temporary ID-claim markers.' with 'Core adds one folder, `flowcharge/`, plus four `.gitignore` lines, under one comment line, for the two generated views, the temporary ID-claim markers and the workstream lease files.' Re-wrap the paragraph at the width the surrounding paragraphs use, about 85 columns, and keep its other two sentences as they are."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with this bullet, wrapped as shown: `- README.md states the four \\`.gitignore\\` lines Core adds, the workstream lease` then, on the next line, `  files included.`"
  pattern: "README.md, CHANGELOG.md"
  compatibility: "The generator is the right side and stays unchanged: GITIGNORE_TARGETS in skills/flowcharge/scripts/fc-index.mjs lists flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease, and ensureGitignore writes GITIGNORE_COMMENT above them when the file lacks it. No case in run-tests.mjs reads the root README.md."
  gotcha: "The count is of ignore lines: the comment line is named separately, so a reader who opens .gitignore after one run finds exactly what the sentence describes. The layout block below the paragraph is not part of this change."
  verify:
    - "grep -cF 'plus four `.gitignore` lines' README.md  # expect 1; 0 at base_commit"
    - "grep -cF 'three `.gitignore` lines' README.md  # expect 0; 1 at base_commit"
    - "grep -cF 'workstream lease files' README.md  # expect 1; 0 at base_commit"
    - "grep -cF 'README.md states the four `.gitignore` lines' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: README.md states four .gitignore lines under one comment line, for the two generated views, the temporary ID-claim markers and the workstream lease files"
    - "source: the stated count matches GITIGNORE_TARGETS in fc-index.mjs, which is byte-identical to base_commit"
    - "source: the paragraph's other two sentences read as at base_commit, wrapped at about 85 columns"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: false
  ```

- [ ] 5. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Add, for task 1 (ISS-23-jp7g43): directly after the case 'the suite derives its own folder through fileURLToPath', the case 'no script derives a path from a file URL pathname'. It resolves the repository root as path.resolve(HERE, '..', '..', '..', '..'), reads every .mjs file directly inside skills/flowcharge/scripts/, skills/flowcharge/scripts/test/ and .github/scripts/, the three folders that hold every script the repository ships, collects the repository-relative path of each file whose text matches /URL\\(import\\.meta\\.url\\)\\.pathname/, and asserts with assert.deepStrictEqual that the list is empty, so a failure names each file. At base_commit it names fc-index.mjs and the six release scripts. Give it a comment: every script derives its own folder through fileURLToPath, for the reason the section comment gives."
    - "Add, for task 2 (ISS-24-fahe4r): directly after the case 'manifest: M2 the document has the contracted key order, sorting, version invariant and generated day', the case 'manifest: a generated day written just before local midnight passes the generated-day check'. In withManifestFixture({ specs: manSpecs() }), read `const startDay = daysAgo(1);`, write a preload clock.cjs at the fixture root that pins `new Date()` with no argument and `Date.now()` to 23:59:59 local time on startDay, run the fixture's manifest.mjs copy with spawnSync(process.execPath, ['--require', <clock.cjs>, <copy>, MAN_VERSION], { cwd: dir, encoding: 'utf8' }), and assert exit 0. Then assert that readManifest(dir).generated equals startDay and differs from today(), which is the run a check against a today() read after the script fails, and call acceptDay('generated', generated, startDay), the check case M2 applies. Illustrative preload text: `const T = <startDay at 23:59:59 local, in ms>; const D = Date; global.Date = class extends D { constructor(...a) { if (a.length) super(...a); else super(T); } static now() { return T; } };`"
    - "Add, for task 3 (ISS-25-nzbdds): directly after the loop of cases named `a refused <args> run creates no .gitignore`, a loop over a live and an archived folder, named `a --new-ws run refused for a slug ${where} folder carries creates no .gitignore` with where 'a live' and 'an archived'. Each case builds a fixture holding only flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md or flowcharge/archive/WS-1-abcdef-alpha/workstream.md, written with workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }) inside the case body, runs runGenerator(dir, ['--new-ws', 'alpha', '--title', 'Alpha again']), calls expectRefusal, and asserts that no .gitignore exists at the fixture root."
    - "Task 4 (ISS-26-v95vp1) adds no case: it corrects README.md, documentation that no case reads, and the request asks for a case for each code fix."
  verify:
    - "grep -cF \"testCase('no script derives a path from a file URL pathname'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('manifest: a generated day written just before local midnight passes the generated-day check'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'folder carries creates no .gitignore' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
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
