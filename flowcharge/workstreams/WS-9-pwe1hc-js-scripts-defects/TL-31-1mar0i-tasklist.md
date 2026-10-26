---
id: TL-31-1mar0i
type: tasklist
workstream: WS-9-pwe1hc
slug: js-scripts-defects
title: "Fix the generator, renamer and test-suite script defects"
status: ready
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: [IL-6-hfoqvz]
links: []
mode: spec
base_commit: c909873
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Generator, renamer and test-suite script defects

Fixes the thirteen defects IL-6-hfoqvz files against `skills/flowcharge/scripts/fc-index.mjs`, `skills/flowcharge/scripts/fc-rename-artefacts.mjs` and `skills/flowcharge/scripts/test/run-tests.mjs`, one task per issue. Each fix task also ends the `### Fixed` list under `## Unreleased` in `CHANGELOG.md` with its own bullet, creating that heading after the `### Changed` list when it is absent; task 8 also corrects one README.md sentence. No version changes. Every fix stays within Node 16 and adds no dependency. The test-update task adds, for each fix, a case in `run-tests.mjs` that fails at `base_commit` and passes once the fix lands, as the request requires, and updates the one existing case the `--check` wording change makes wrong. The fix for ISS-19-451hci corrects an existing case, which is its own test.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe.

- [x] 1. Refuse a filename prefix that disagrees with the file's id in the renamer
  ```yaml
  description: "fc-rename-artefacts.mjs refuses a file whose filename prefix names an id other than its frontmatter id, as a counted refusal, instead of prepending a second prefix"
  issues: [ISS-10-xtjs1c]
  implement:
    - "In skills/flowcharge/scripts/fc-rename-artefacts.mjs, in the per-file loop, directly after `if (fm.type && !PREFIXED_TYPES.has(fm.type)) continue;` and before `const plain`, read the filename's id prefix with `/^((?:PLN|IL|TL)-\\d+-[0-9a-z]{6})-/`. When one is present and differs from `fm.id`, print `fc-rename-artefacts: <rel(abs)>: filename prefix <prefix> disagrees with its id <fm.id>, refusing to rename` on stderr, increment `refusals` and `continue`, as the two existing refusals do. Comment it: prepending the id would bury the wrong prefix inside a name the generator no longer reads, stripping the prefix would rewrite the file silently, and a person decides whether the filename or the id is wrong."
    - "Reword the comment above `const plain` to say that only a correct prefix is left to strip, because a disagreeing one was refused above, and keep its sentence on idempotence. The `plain` and `target` lines stay as they are."
    - "In the header comment's Exit codes entry for 1, list the new refusal: a target name already taken, a filename prefix that disagrees with the file's own id, or a move that failed."
    - "In CHANGELOG.md, under `## Unreleased`, add a `### Fixed` heading after the `### Changed` list when it is absent, and end its list with: `- \\`fc-rename-artefacts.mjs\\` refuses a file whose filename prefix disagrees with its frontmatter id and exits 1. It no longer adds a second prefix, which hid the file from the generator.` Wrap it at about 80 columns with a two-space continuation indent, like the other entries."
  pattern: "skills/flowcharge/scripts/fc-rename-artefacts.mjs, CHANGELOG.md"
  compatibility: "The refusal takes the existing refusal shape: one `fc-rename-artefacts: ` line on stderr, `refusals++`, `continue`, so the run still reports every other file and exits 1 at the end. It sits before the target is composed, so no move, existence probe or containment test runs for a refused file, in the dry run and under --apply alike. No import is added."
  gotcha: "Of the two outcomes ISS-10-xtjs1c accepts, refusal is the one the comment above `const plain` already argues for: the disagreeing prefix may be the right one and the id the typo, so neither may be rewritten silently. A prefix of another type, such as IL-1-abcdef on a plan, also differs from the id and is refused the same way. A bare legacy name has no prefix and is still renamed, and a name carrying its own id still prints its ok line."
  verify:
    - "grep -cF 'disagrees with its id ${fm.id}, refusing to rename' skills/flowcharge/scripts/fc-rename-artefacts.mjs  # expect 1; 0 at base_commit"
    - "grep -c 'a filename prefix that disagrees with' skills/flowcharge/scripts/fc-rename-artefacts.mjs  # expect 1; 0 at base_commit"
    - "awk '/^## Unreleased/{u=1;next} /^## /{u=0} u && /^### Fixed/{n++} END{print n+0}' CHANGELOG.md  # expect 1; 0 at base_commit"
    - "grep -cF 'refuses a file whose filename prefix disagrees with' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: a file whose filename carries a PLN, IL or TL id prefix other than its frontmatter id prints one refusal line on stderr, counts one refusal and is neither moved nor reported as a move, with or without --apply"
    - "source: the plain-name and target lines are unchanged, so a bare legacy name still gains its id prefix and a name carrying its own id still prints its ok line"
    - "source: the header's Exit codes entry for 1 names the disagreeing-prefix refusal"
    - "source: CHANGELOG.md holds one ### Fixed heading under ## Unreleased, after the ### Changed list, and its list ends with this fix's bullet"
    - "source: the script still imports only node:fs, node:path and node:child_process"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: the per-file loop reads foundPrefix and, when it differs from fm.id, prints one fc-rename-artefacts refusal line on stderr, increments refusals and continues, before plain, target, the containment test and the apply gate; verify 1 returned 1"
      - result: YES
        measured: "source: the const plain and const target lines read as at base_commit"
      - result: YES
        measured: "source: the Exit codes entry for 1 reads: a target name already taken, a filename prefix that disagrees with the file's own id, or a move that failed; verify 2 returned 1"
      - result: YES
        measured: "source: verify 3 returned 1 ### Fixed heading under ## Unreleased, placed after the ### Changed list; verify 4 returned 1 and the bullet is the list's last item"
      - result: YES
        measured: "source: the import lines are node:fs, node:path and node:child_process only"
    failures:
      - item: "verify 2"
        reason: "the first wrap of the Exit codes entry split the phrase a filename prefix across two comment lines, so the grep counted 0"
        fix: "rewrapped the entry so the phrase sits on one line; the re-run returned 1"
  ```

- [x] 2. Skip checkbox lines inside fenced code blocks in the issue and task scanners
  ```yaml
  description: "parseIssues and parseTasks skip a checkbox line inside a fenced code block, so a quoted example is neither an issue nor a task"
  issues: [ISS-11-r98dyf]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, directly above parseIssues, add `function fencedLines(lines)`, which returns one boolean per line: true for a fence line and for every line inside a fence. A line of three or more backticks or tildes, at any indentation and with or without an info string, opens a fence. Inside one, a line of at least as many of the same character with nothing after it closes it, and so does the first non-blank line indented less than the fence's opening line, the way CommonMark ends a fence with the list item that holds it. Comment it with those rules and with why the last one exists (see Divergence 1)."
    - "In parseIssues, compute `const fenced = fencedLines(lines);` once and skip the heading match on a fenced line: `const h = fenced[i] ? null : lines[i].match(...)`. The inner loop that reads status, severity and author is unchanged."
    - "In parseTasks, split the text into `lines` once, compute `fenced` the same way, loop with `for (const [i, line] of lines.entries())`, and skip both task-line matches on a fenced line. Every key-reading branch below them is unchanged, so a task's own YAML block is still read whether or not it is fenced. Add `outside every fenced code block` to the first sentence of the comment above parseTasks."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- \\`fc-index.mjs\\` no longer counts a checkbox line inside a fenced code block as an issue or a task.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "Real issue and task lists write each record's YAML inside an indented ```yaml fence, and the run-tests.mjs fixtures write it with no fence; both must read exactly as before. A fence line never matches a checkbox regex, so marking it fenced changes nothing else. Array.prototype.entries and String.prototype.search exist in Node 16, and no import is added."
  gotcha: "See Divergence 1: a fence that only its closing line ends would hide every later task line in an executed list whose task YAML block lost its closing line, undercount it, and could let --sync close a list that still has open tasks. Task and issue lines sit at indentation 0 or 2 and their YAML fences at 2 or 4, so the indentation rule ends such a block at the next record line. A fence opened at column 0, the way an example is quoted, ends only at its closing line, and a four-backtick fence is not closed by a three-backtick line inside it."
  verify:
    - "grep -c '^function fencedLines' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -c 'fenced\\[i\\] ? null' skills/flowcharge/scripts/fc-index.mjs  # expect 2; 0 at base_commit"
    - "grep -cF 'no longer counts a checkbox line inside a fenced code block' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: fencedLines opens a fence on a line of three or more backticks or tildes, closes it on a line of at least as many of the same character with nothing after it, and also ends it at the first non-blank line indented less than its opening line"
    - "source: parseIssues and parseTasks skip the checkbox match on a fenced line and read every other line exactly as before"
    - "source: the keys of a task's own YAML block, fenced or not, still reach the task line above them"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
    - "source: no import is added and no API newer than Node 16 is used"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: fencedLines opens on ^(\\s*)(`{3,}|~{3,}), closes on the same character at least as long with an empty rest, and drops an open fence at a non-blank line whose indent is below fence.indent; verify 1 returned 1"
      - result: YES
        measured: "source: parseIssues tests fenced[i] before its heading match and parseTasks before both task-line matches; verify 2 returned 2"
      - result: YES
        measured: "source: every key-reading branch of parseTasks below the task-line match reads as at base_commit and runs for every line, fenced or not"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
      - result: YES
        measured: "source: the import lines are unchanged, and the new code uses only Array.prototype.map and entries and String.prototype.search and match"
  ```

- [x] 3. Read only the schema's list keys as inline arrays in parseFrontmatter
  ```yaml
  description: "parseFrontmatter reads an inline array only for the keys the schema declares as lists, so a scalar such as an author name that opens with a bracket is read as written"
  issues: [ISS-12-jp4fx6]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, directly above parseFrontmatter, add `const LIST_KEYS = ['depends_on', 'links', 'tags', 'e2e_tooling', 'test_commands'];` with a comment: the frontmatter keys CONVENTIONS.md declares as inline arrays; every other key is a scalar, so a value that only opens with a bracket, such as an author named [Bot] Alice, is read as written rather than split into a list."
    - "In parseFrontmatter, change the array test `if (v.startsWith('['))` to `if (LIST_KEYS.includes(km[1]) && v.startsWith('['))`. The scalar branch passes an unquoted value through unquoteScalar unchanged."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- \\`fc-index.mjs\\` reads an unquoted frontmatter value that opens with a bracket, such as \\`author: [Bot] Alice\\`, as written. Only the list keys are read as inline arrays.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "Every reader of a list key still receives an array: depends_on, links and tags through the `|| []` defaults of the scan, and test_commands through the Array.isArray test of the done-list check. The renamer has its own frontmatter reader, which reads only id and type, so it does not change."
  gotcha: "See Divergence 2: the author line --new-ws writes stays unquoted. A list key whose value does not open with a bracket is read as a scalar exactly as before."
  verify:
    - "grep -c '^const LIST_KEYS' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"LIST_KEYS.includes(km[1]) && v.startsWith('[')\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'reads an unquoted frontmatter value that opens with a bracket' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: parseFrontmatter splits a value into an array only for depends_on, links, tags, e2e_tooling and test_commands"
    - "source: every other key, author and title included, goes through unquoteScalar whatever its first character"
    - "source: the author line --new-ws writes is unchanged"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: LIST_KEYS holds depends_on, links, tags, e2e_tooling and test_commands, and the array branch tests LIST_KEYS.includes(km[1]) first; verify 1 and verify 2 returned 1"
      - result: YES
        measured: "source: the else branch passes every other value to unquoteScalar, unchanged from base_commit"
      - result: YES
        measured: "source: the --new-ws record still writes author: ${readGitAuthor(root)} unquoted"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 4. Write .gitignore only after the last argument parser
  ```yaml
  description: "The .gitignore write runs after the last argument parser, so a run that refuses its own arguments exits 1 having written nothing"
  issues: [ISS-13-nqpgsn]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, move the block that calls `ensureGitignore(root)`, with its comment, its `if` on --list, --check and --whoami and its try and catch, from below the flowcharge/workstreams/ check to directly after `const claimOpts = parseClaimArgs(args);`, the last argument parser, so that it precedes `if (claimOpts) {`. Move it; do not copy it."
    - "Add to the block's comment that this is the first write of any mode, placed after the last argument parser so that a run refusing its own arguments exits 1 having written nothing."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- An \\`fc-index.mjs\\` run that refuses its own arguments no longer creates or changes \\`.gitignore\\`.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "The parsers keep their order, sync, new-ws, whoami, list and claim, so a conflicting combination still prints the same refusal. --whoami and --list exit before the new position and --check stays excluded by flag, so the three read-only modes still write nothing. --claim, --new-ws, --sync, --init, --no-board and the default mode all reach the new position before their first write."
  gotcha: "Nothing between the old and the new position writes a file: the scan, the parsers and the --whoami and --list modes only read. The --init combination check and the missing flowcharge/workstreams/ exit already precede the old position. A --new-ws whose slug is already taken is refused inside the --new-ws mode, after every parser, and is outside this change."
  verify:
    - "awk '/const claimOpts = parseClaimArgs\\(args\\);/{c=NR} /ensureGitignore\\(root\\);/{g=NR} END{print (g>c)?\"after\":\"before\"}' skills/flowcharge/scripts/fc-index.mjs  # expect after; before at base_commit"
    - "grep -c 'ensureGitignore(root);' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 1 at base_commit, so this step guards that the call moved rather than doubled and cannot fail there"
    - "grep -cF 'run that refuses its own arguments no longer creates or' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the ensureGitignore call sits after parseClaimArgs and before the first write of the --claim, --new-ws, --sync and default modes"
    - "source: the call appears once and keeps its --list, --check and --whoami exclusion and its warning-only catch"
    - "source: the parsers run in their old order"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: verify 1 printed after; the call sits on the line after const claimOpts and before if (claimOpts), if (newWsOpts) and if (syncOpts) applySync()"
      - result: YES
        measured: "source: verify 2 returned 1; the block keeps its --list, --check and --whoami test and its warning-only catch"
      - result: YES
        measured: "source: the parse calls read sync, new-ws, whoami, list, claim in file order, as at base_commit"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 5. State the stale ids.md header as a finding under --check
  ```yaml
  description: "--check reports a stale ids.md header without the word rewritten, while a writing run keeps its wording"
  issues: [ISS-14-18ydcb]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, at the registry-header check that pushes `'ids.md: header text is out of date, rewritten'`, push `'ids.md: header text is out of date'` when `checkOnly` is set and the existing string otherwise."
    - "Update the comment above that check: the rewrite happens below with the index and board writes, so --check's early exit still prevents it without a mode test; only the wording reads the mode, because --check writes nothing and its line states the finding alone."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- \\`fc-index.mjs --check\\` reports a stale \\`ids.md\\` header without claiming that it rewrote it.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "The tag-pool check already words its missing-pool WARN by mode in the same way, created in a writing run and skipped under --check. The rewrite, its place after the --check early exit and REGISTRY_HEADER are unchanged."
  gotcha: "run-tests.mjs pins the old --check wording through HEADER_WARN in the case '--check reports the stale registry header and leaves the file byte-identical'. The test-update task changes that case; the default-mode case keeps HEADER_WARN."
  verify:
    - "grep -cF \"checkOnly ? 'ids.md: header text is out of date'\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"'ids.md: header text is out of date, rewritten'\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 1 at base_commit, so this step guards the writing-run wording and cannot fail there"
    - "grep -cF 'header without claiming that' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: under --check the stale-header WARN reads ids.md: header text is out of date"
    - "source: in a writing run the WARN still reads ids.md: header text is out of date, rewritten, and the rewrite still runs only after the --check early exit"
    - "source: the comment above the check says why the wording reads the mode"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: the check pushes checkOnly ? 'ids.md: header text is out of date' : the writing-run string; verify 1 returned 1"
      - result: YES
        measured: "source: verify 2 returned 1 for the writing-run string, and the registry rewrite at writeAtomic(registryPath, ...) still sits after the if (checkOnly) early exit"
      - result: YES
        measured: "source: the comment reads: only the wording reads the mode, because --check writes nothing and its line states the finding alone"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 6. Rank issue statuses in the issue lifecycle for --sort status
  ```yaml
  description: "--sort status ranks an issue by the six-value issue enum and sorts a status outside the order in use after every listed one"
  issues: [ISS-15-9egxn3]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, directly below `const STATUSES = [...]`, add `const ISSUE_STATUSES = ['backlog', 'ready', 'in-progress', 'blocked', 'done', 'dropped'];` with a comment: an issue's own enum, in the order skills/fc-issue-list/SKILL.md lists it, the artefact enum plus blocked; --sort status ranks an issue record by it."
    - "Give compareRecs a third parameter, the status order to rank by, and in its status branch, which today subtracts two `STATUSES.indexOf` results, rank each value by its index in that order, or by the order's length when the value is absent from it. Comment the parameter: a value outside the order ranks after every listed one, as an unknown severity does."
    - "In selectRows, pass `scope === 'issues' ? ISSUE_STATUSES : STATUSES` to compareRecs."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- \\`fc-index.mjs --sort status\\` ranks an issue's \\`blocked\\` status in the issue lifecycle order and sorts an unrecognised status after every known one, instead of first.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "Only --list issues holds issue records; every other scope holds artefacts and keeps ranking by STATUSES. compareRecs has one caller, selectRows. A missing status still returns before the comparison and sorts last in both directions, and ties still break on id ascending."
  gotcha: "--desc negates the comparison after it is computed, so it reverses the unknown-last rank too, exactly as it reverses the rank 9 an unknown severity takes; no special case is added. The issue enum puts blocked after in-progress, so backlog, blocked and in-progress sort as backlog, in-progress, blocked."
  verify:
    - "grep -cF \"const ISSUE_STATUSES = ['backlog', 'ready', 'in-progress', 'blocked', 'done', 'dropped'];\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"scope === 'issues' ? ISSUE_STATUSES : STATUSES\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'STATUSES.indexOf(av) - STATUSES.indexOf(bv)' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'lifecycle order and sorts an unrecognised status' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: --list issues --sort status ranks an issue by its index in ISSUE_STATUSES, so blocked sorts after in-progress and before done"
    - "source: every other --list scope still ranks by STATUSES"
    - "source: a status outside the order in use ranks after every listed one"
    - "source: a missing status still sorts last in both directions, and ties still break on id ascending"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: ISSUE_STATUSES lists backlog, ready, in-progress, blocked, done, dropped (verify 1 returned 1), and selectRows passes it when scope is issues (verify 2 returned 1)"
      - result: YES
        measured: "source: selectRows passes STATUSES for every scope other than issues"
      - result: YES
        measured: "source: rank returns statuses.length for a value statuses does not include; verify 3 returned 0 for the old indexOf subtraction"
      - result: YES
        measured: "source: the missing-value return before the comparison and the d || cmpListId(a, b) tie-break read as at base_commit"
      - result: YES
        measured: "source: verify 4 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 7. Read only files in the generator's per-folder scan
  ```yaml
  description: "The generator's scan lists each workstream folder with file types and reads only files, so a directory named like an artefact no longer crashes any mode"
  issues: [ISS-16-hs27pq]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, in the scan loop over ROOTS, change the per-folder listing `const files = fs.readdirSync(dirPath).filter(...).sort();` to list with `{ withFileTypes: true }`, keep an entry only when `d.isFile()` and `d.name` passes the unchanged artefact filename regex, map to `d.name`, then sort. Comment it: files only, because a directory whose name passes the filter is no artefact and reading it would crash every mode."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The generator skips a directory named like an artefact instead of crashing.`"
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "The workstream-folder listing just above already reads Dirent entries and keeps isDirectory() ones, so a symlinked folder is skipped there; isFile() likewise skips a symlinked artefact file. The regex, the sort and everything that reads `files` are unchanged. withFileTypes exists in Node 16."
  gotcha: "Only this listing changes. The --new-ws collision check, the folder-marker check and the lease listing already list directories with withFileTypes and stay as they are."
  verify:
    - "grep -cF '.readdirSync(dirPath, { withFileTypes: true })' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'd.isFile()' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'The generator skips a directory named like an artefact' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the scan reads only directory entries that are files whose names pass the artefact filename regex, in sorted name order"
    - "source: the regex itself is unchanged"
    - "source: no other directory listing in the file changes"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: the per-folder listing reads Dirent entries, keeps d.isFile() ones whose d.name passes the filter, maps to names and sorts; verify 1 and verify 2 returned 1"
      - result: YES
        measured: "source: the filter regex reads as at base_commit"
      - result: YES
        measured: "source: the other withFileTypes listings, for the marker directories, the workstream folders, the --new-ws collision check, the folder-marker check and the lease folders, read as at base_commit"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 8. Count an authored plan or issue list as a met dependency in ready work
  ```yaml
  description: "The index's ready-to-start section counts a plan or issue-list dependency as met once it is authored, and README.md states the same rule"
  issues: [ISS-17-jvj96o]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, replace `const isDone` at the head of the integrity checks with `const depMet`: an unknown id is not met, a target whose type is plan or issuelist is met at any status but backlog or dropped, and every other target is met only at done. Comment it with that rule and its source, CONVENTIONS.md's Frontmatter section."
    - "In the readyWork filter, change `a.depends_on.every(isDone)` to `a.depends_on.every(depMet)`. isDone has no other caller."
    - "In README.md, in the paragraph that opens `Dependencies are data.`, replace the clause saying the task list runs only once IL-3-k9d2s5 is `done` with the rule: a plan or issue-list dependency is met once that artefact is authored, at any status but `backlog` or `dropped`, and any other dependency once it is `done`. Keep the first sentence and the example ID, and wrap the paragraph to its surrounding width."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The index's ready-to-start section counts a plan or issue-list dependency as met once that artefact is authored, so a task list built from one is listed. The README states the same rule.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, README.md, CHANGELOG.md"
  compatibility: "byId holds each artefact with its frontmatter type and each issue with type issue, so the type test reads the record already in hand. readyWork's archived, status and blocked filters are unchanged. CONVENTIONS.md, skills/flowcharge/SKILL.md hard rule 5 and skills/fc-task-list/SKILL.md already state the rule and do not change."
  gotcha: "The unknown-id WARN for depends_on reads byId itself, not isDone, so it is unaffected. A dropped plan or issue list is not met, the same as one at backlog."
  verify:
    - "grep -c 'const isDone' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'a.depends_on.every(depMet)' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    - "grep -c 'runs only once IL-3-k9d2s5' README.md  # expect 0; 1 at base_commit"
    - "grep -cF 'at any status but' README.md  # expect 1; 0 at base_commit"
    - "grep -cF 'counts a plan or issue-list dependency as' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: depMet meets a plan or issue-list target at any status but backlog or dropped, any other target only at done, and an unknown id never"
    - "source: readyWork applies depMet and keeps its other filters unchanged"
    - "source: README.md's Dependencies are data paragraph states the same rule as CONVENTIONS.md"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: depMet returns false for an id byId lacks, status other than backlog and dropped for a plan or issuelist target, and status done otherwise; verify 1 returned 0 for isDone"
      - result: YES
        measured: "source: readyWork reads a.depends_on.every(depMet) beside its unchanged archived, status and blocked tests; verify 2 returned 1"
      - result: YES
        measured: "source: README.md now says a plan or issue-list dependency is met once that artifact is authored, at any status but backlog or dropped, and any other dependency once it is done, the README's own spelling of artifact kept; verify 3 returned 0 and verify 4 returned 1"
      - result: YES
        measured: "source: verify 5 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 9. Recognise leading-slash and trailing-glob .gitignore spellings as covering
  ```yaml
  description: "ensureGitignore counts a leading-slash or trailing-glob spelling of a covering entry, so a .gitignore holding /flowcharge/ or flowcharge/** gains no line"
  issues: [ISS-18-gffohk]
  implement:
    - "In skills/flowcharge/scripts/fc-index.mjs, above ensureGitignore, add `coverSpelling(line)`, which returns the covering form a .gitignore line spells: drop one leading slash from a line that starts with `/flowcharge`, then turn a trailing `/**` or `/*` into `/`. Comment it: a leading slash anchors a path at the project root, where every form that names flowcharge already sits, while /.lease keeps its slash because it matches the root entry alone; a trailing /** or /* covers everything inside a directory, as the directory itself does."
    - "In ensureGitignore, test GITIGNORE_COVERS against the lines mapped through coverSpelling instead of the raw lines. The managed-comment test keeps reading the raw lines."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- \\`fc-index.mjs\\` treats a leading-slash or trailing-glob \\`.gitignore\\` entry, such as \\`/flowcharge/\\` or \\`flowcharge/**\\`, as covering the paths it manages, and appends nothing for them.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/fc-index.mjs, CHANGELOG.md"
  compatibility: "GITIGNORE_COVERS and GITIGNORE_TARGETS are unchanged, and the write stays append-only: existing lines are copied through untouched and in their order."
  gotcha: "git treats /flowcharge/, /flowcharge, flowcharge/**, /flowcharge/** and flowcharge/* as covering all four managed paths, and /flowcharge/index.md, /flowcharge/kanban.md and /flowcharge/ids/ as covering their own. A bare /.lease covers no flowcharge/workstreams/<folder>/.lease file, so its slash must stay and the lease line must still be appended for it."
  verify:
    - "grep -c 'coverSpelling' skills/flowcharge/scripts/fc-index.mjs  # expect 2; 0 at base_commit"
    - "grep -cF 'lines.includes(form)' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'leading-slash or trailing-glob' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: a .gitignore line /flowcharge/, /flowcharge, flowcharge/**, /flowcharge/** or flowcharge/* counts as covering all four targets"
    - "source: a root-anchored spelling of index.md, kanban.md or ids/ covers its own target, and /.lease covers no lease target"
    - "source: the managed-comment test and the append-only write are unchanged"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: coverSpelling drops the slash of a /flowcharge line and turns a trailing /** or /* into /, so each of the five lines spells flowcharge/ or flowcharge, which GITIGNORE_COVERS lists for all four targets; verify 1 returned 2"
      - result: YES
        measured: "source: /flowcharge/index.md, /flowcharge/kanban.md and /flowcharge/ids/ spell their own targets' forms, and /.lease does not start with /flowcharge, so it stays /.lease, which no target lists"
      - result: YES
        measured: "source: the comment test still reads lines.includes(GITIGNORE_COMMENT), and the head, comment and missing write reads as at base_commit; verify 2 returned 0 for the raw-line comparison"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 10. Check each file against its own fixture in the second --sync case
  ```yaml
  description: "The case 'a second --sync run changes no file and prints no SYNC line' checks each file in its loop against that file's own path and fixture text"
  issues: [ISS-19-451hci]
  implement:
    - "In skills/flowcharge/scripts/test/run-tests.mjs, in the case 'a second --sync run changes no file and prints no SYNC line', build `after` from the pairs `[WS1, wsText]` and `[TL1, tlText]`, so each entry carries `rel`, `fixtureText`, `text` and `mtime`, and inside the loop call `expectClosedFile(dir, f.rel, f.fixtureText, day)` in place of `expectClosedFile(dir, TL1, tlText, day)`."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The second \\`--sync\\` test case checks each closed file against its own fixture.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, CHANGELOG.md"
  compatibility: "The loop's two snapshot assertions, on text and on mtime against the state after the first --sync, are unchanged; only the expectClosedFile call reads its own entry. wsText and tlText are already in scope in that case."
  gotcha: "No other case changes: every other expectClosedFile call already names its own file and fixture text."
  verify:
    - "grep -cF 'expectClosedFile(dir, f.rel, f.fixtureText, day);' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'expectClosedFile(dir, TL1, tlText, day);' skills/flowcharge/scripts/test/run-tests.mjs  # expect 2; 3 at base_commit"
    - "grep -cF 'test case checks each closed file against its own' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: each loop iteration calls expectClosedFile once, with its own entry's path and fixture text"
    - "source: the loop's text and mtime snapshot assertions are unchanged"
    - "source: no other case changes"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: after is built from [WS1, wsText] and [TL1, tlText], and the loop calls expectClosedFile(dir, f.rel, f.fixtureText, day); verify 1 returned 1"
      - result: YES
        measured: "source: the loop's text and mtime assertions read as at base_commit"
      - result: YES
        measured: "source: git diff of run-tests.mjs shows two changed lines, both in this case; verify 2 returned 2, the calls in the other two cases that close the task list"
      - result: YES
        measured: "source: verify 3 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [x] 11. Accept the day the generator wrote across local midnight in the date assertions
  ```yaml
  description: "The --sync and --new-ws cases accept the day the generator wrote when it is the day the case started or the day it ended, so a run across local midnight no longer fails"
  issues: [ISS-20-2ms98u]
  implement:
    - "In skills/flowcharge/scripts/test/run-tests.mjs, directly above expectClosedFile, add `function writtenDay(dir, rel, key, startDay)`: read the value of rel's column-0 `<key>: ` line, assert that it is startDay or the day `today()` returns now, naming rel, the key and both days on failure, and return it. Comment it: the generator reads its own clock, so a case that read its start day just before local midnight sees the next day written, and a wrong date still fails."
    - "Rename expectClosedFile's last parameter to startDay and build the expected text with `closedText(fixtureText, writtenDay(dir, rel, 'updated', startDay))`; add to its comment that startDay is the day the case read before the generator ran. Every expectClosedFile call keeps its arguments."
    - "In the cases '--new-ws writes a complete record and prints the claimed id and its path' and '--new-ws honours --tags and --status', pass `day: writtenDay(dir, rel, 'created', day)` to newWsRecord in place of `day`. newWsRecord writes that one day into both created: and updated:, so the byte comparison still requires the two to agree."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The \\`--sync\\` and \\`--new-ws\\` test cases accept the date the generator wrote when a run crosses local midnight.`, wrapped like the other entries."
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, CHANGELOG.md"
  compatibility: "writtenDay uses readRel and today(), both defined above it, and runs after the generator has exited, so its today() closes the window. The two cases that pin a file's mtime from the day they assert, 'an artefact modified two days after its updated date warns with both dates' and 'a tree carrying several schema and shape faults warns about each of them', read no second clock and stay as they are."
  gotcha: "Anchor the key at column 0 with a multiline match: issue and task YAML blocks in a fixture body carry indented status: and updated:-like keys, and only the frontmatter key sits at column 0."
  verify:
    - "grep -c '^function writtenDay' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"writtenDay(dir, rel, 'updated', startDay)\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"writtenDay(dir, rel, 'created', day)\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 2; 0 at base_commit"
    - "grep -cF '{ day }' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'accept the date the generator wrote' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: writtenDay accepts only the case's start day or the day read after the generator ran, and returns the day the file holds"
    - "source: expectClosedFile compares against the fixture text closed with the day writtenDay returned"
    - "source: both --new-ws cases build their expected record from the day writtenDay returned"
    - "source: the two mtime-pinned date cases are unchanged"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: true
    evidence:
      - result: YES
        measured: "source: writtenDay reads the column-0 key line with a multiline match, asserts the value is startDay or today() and returns it; verify 1 returned 1"
      - result: YES
        measured: "source: expectClosedFile builds its expected text from closedText(fixtureText, writtenDay(dir, rel, 'updated', startDay)); verify 2 returned 1"
      - result: YES
        measured: "source: both --new-ws cases pass day: writtenDay(dir, rel, 'created', day) to newWsRecord; verify 3 returned 2 and verify 4 returned 0"
      - result: YES
        measured: "source: the cases at lines 1337 and 1582 read as at base_commit; git diff of run-tests.mjs touches only the helper and the two --new-ws assertions"
      - result: YES
        measured: "source: verify 5 returned 1, and the bullet is the last item of ### Fixed under ## Unreleased"
  ```

- [ ] 12. Derive the test suite's own folder through fileURLToPath
  ```yaml
  description: "run-tests.mjs derives HERE through fileURLToPath, which strips the slash a Windows drive path carries in a file URL"
  issues: [ISS-21-uqa78u]
  implement:
    - "In skills/flowcharge/scripts/test/run-tests.mjs, add `import { fileURLToPath } from 'node:url';` among the node: imports, before the node:zlib import, and derive `const HERE = path.dirname(fileURLToPath(import.meta.url));` in place of the decoded-pathname expression. Comment HERE: fileURLToPath rather than the URL's pathname, which keeps a slash in front of a Windows drive letter that no path API resolves."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The test suite resolves its own folder correctly on Windows.`"
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs, CHANGELOG.md"
  compatibility: "fileURLToPath is in node:url on Node 16. On macOS and Linux it returns the same path as the old expression for this file, so every constant derived from HERE, GENERATOR, RENAMER, STAMPER and the skills-root paths among them, keeps its value there."
  gotcha: "The comment must not quote the old expression: the test-update task's guard case reads this file and fails on any remaining file-URL pathname derivation."
  verify:
    - "grep -c \"^import { fileURLToPath } from 'node:url';\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -c '^const HERE = path.dirname(fileURLToPath(import.meta.url));' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'new URL(import.meta.url).pathname' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
    - "grep -cF 'resolves its own folder correctly on Windows' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: HERE is path.dirname(fileURLToPath(import.meta.url)), with fileURLToPath imported from node:url"
    - "source: no file-URL pathname derivation remains in run-tests.mjs"
    - "source: no constant derived from HERE changes its own expression"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: false
  ```

- [ ] 13. Read only files in the renamer's per-folder scan
  ```yaml
  description: "The renamer lists each workstream folder with file types and reads only files, so a directory named like an artefact is skipped instead of crashing the scan"
  issues: [ISS-22-j2m4g3]
  implement:
    - "In skills/flowcharge/scripts/fc-rename-artefacts.mjs, in the folder loop, change `const files = fs.readdirSync(folderPath).filter((f) => ARTEFACT_FILE.test(f)).sort();` to list with `{ withFileTypes: true }`, keep an entry only when `d.isFile() && ARTEFACT_FILE.test(d.name)`, map to `d.name`, then sort. Comment it: files only, because a directory whose name passes ARTEFACT_FILE is no artefact and reading it would crash the scan before any file is reported."
    - "In CHANGELOG.md, end the `### Fixed` list under `## Unreleased` with: `- The renamer skips a directory named like an artefact instead of crashing.`"
  pattern: "skills/flowcharge/scripts/fc-rename-artefacts.mjs, CHANGELOG.md"
  compatibility: "The folder listing above it already reads Dirent entries with isDirectory(). `files` still holds names in sorted order, so the loop body, the workstream.md skip and every refusal are unchanged. withFileTypes exists in Node 16."
  gotcha: "This is the renamer's half of the defect task 7 fixes in fc-index.mjs. The two scripts share no code by design, so each changes on its own."
  verify:
    - "grep -cF '.readdirSync(folderPath, { withFileTypes: true })' skills/flowcharge/scripts/fc-rename-artefacts.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'd.isFile() && ARTEFACT_FILE.test(d.name)' skills/flowcharge/scripts/fc-rename-artefacts.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'The renamer skips a directory named like an artefact' CHANGELOG.md  # expect 1; 0 at base_commit"
  checklist:
    - "source: the per-folder scan keeps only file entries whose names pass ARTEFACT_FILE, in sorted order"
    - "source: the loop body after the listing is unchanged"
    - "source: no import is added"
    - "source: CHANGELOG.md's ### Fixed list under ## Unreleased ends with this fix's bullet"
  self_eval:
    passed: false
  ```

- [ ] 14. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update, for task 5 (ISS-14-18ydcb): directly after `const HEADER_WARN = ...`, add `const HEADER_CHECK_WARN = 'ids.md: header text is out of date';` with a one-line comment that --check states the finding without the action, and make the case '--check reports the stale registry header and leaves the file byte-identical' expect `[HEADER_CHECK_WARN]`. The default-mode case keeps HEADER_WARN."
    - "Add, for task 1 (ISS-10-xtjs1c): directly after the case 'rename: an existing target file is refused rather than overwritten', the case 'rename: a filename prefix that disagrees with the id is refused and the file keeps its name'. Its renameTree holds `${RENAME_DIR}/PLN-2-abcdef-plan.md` with plan({ id: 'PLN-1-abcdef' }). Run runRenamer(dir, ['--apply']) and assert exit 1, stderr matching /disagrees with its id PLN-1-abcdef/, no move line on stdout, and namesIn(dir) equal to ['PLN-2-abcdef-plan.md', 'workstream.md']."
    - "Add, for task 13 (ISS-22-j2m4g3): directly after that case, the case 'rename: a directory named like an artefact is skipped and the real artefacts still move'. Its renameTree holds `${RENAME_DIR}/plan.md` with plan({ id: 'PLN-1-abcdef' }), and the case creates the directory `${RENAME_DIR}/issuelist-notes.md` with fs.mkdirSync. Run --apply and assert exit 0 and namesIn(dir) equal to ['PLN-1-abcdef-plan.md', 'issuelist-notes.md', 'workstream.md']."
    - "Add, for task 2 (ISS-11-r98dyf): directly after the case 'a parent with three children shows each tick as it lands, counted by task line and by step', the case 'a checkbox line inside a fenced code block is neither an issue nor a task'. IL1 holds ISS-1-abcdef written as its heading line, an opening ```yaml line and its status and severity lines with no closing fence, then issueBlock('ISS-2-abcdef'), then a `## Notes` heading and a ```md fence quoting issueBlock('ISS-9-zzzzzz', { severity: 'critical' }). TL1 holds taskLine(1, true), an opening ```yaml line and one description line with no closing fence, taskLine(2, true), a four-backtick fence holding taskLine(3, false), a three-backtick line and the child line `  - [ ] 3.1 Fenced example child`, then taskLine(3, true) after the fence. With counters { IL: 1, TL: 1, ISS: 2 }, assert that --list issues opens with `## Issues (2)` and never names ISS-9-zzzzzz, that --list tasklists shows `| 3/3 |`, and that expectSync finds exactly `SYNC TL-1-abcdef (${TL1}): ready → done (all 3 tasks checked)`."
    - "Add, for task 3 (ISS-12-jp4fx6): directly after the case 'the index workstream row marks a blocked record in its status cell', the case 'an unquoted author that opens with a bracket renders as written in the index and on the board'. Its WS1 record gains the line `author: [Ada] Lovelace` right after its opening `---`. Run the default mode and assert exit 0, an indexSection(dir, 'Workstreams') row containing `| [Ada] Lovelace |`, and a kanban.md holding the card line `by [Ada] Lovelace` after two tabs."
    - "Add, for task 6 (ISS-15-9egxn3): directly after the case '--list marks a blocked record in its status cell', the case '--list issues --sort status ranks blocked in the issue lifecycle and an unknown status last'. IL1 holds ISS-1-abcdef to ISS-4-abcdef at backlog, blocked, in-progress and bogus, with counters { IL: 1, ISS: 4 }. Run --list issues --sort status and assert that the ID column reads ISS-1-abcdef, ISS-3-abcdef, ISS-2-abcdef, ISS-4-abcdef."
    - "Add, for task 8 (ISS-17-jvj96o): directly after the case 'a blocked record is left out of the index ready-work section', the case 'ready work counts an authored plan or issue list as a met dependency'. WS1's folder holds IL-1-abcdef (ready, one issue), PLN-1-abcdef (ready), PLN-2-abcdef (backlog), and the task lists TL-1-abcdef, TL-2-abcdef and TL-3-abcdef, each with one open task, depending on IL-1-abcdef, PLN-1-abcdef and PLN-2-abcdef respectively, with counters { PLN: 2, IL: 1, TL: 3, ISS: 1 }. Run the default mode and assert that indexSection(dir, 'Ready to start (deps satisfied)') names TL-1-abcdef and TL-2-abcdef and not TL-3-abcdef."
    - "Add, for task 11 (ISS-20-2ms98u): directly after the case 'a second --sync run changes no file and prints no SYNC line', the case 'a close written on the day after its case began still matches its fixture'. Build the fixture of '--sync closes a task list whose tasks are all checked' with one checked task; after expectSync finds the TL-1-abcdef close, call expectClosedFile(dir, TL1, tlText, daysAgo(1)), a start day one day back standing in for a case that read its day just before local midnight."
    - "Add, for task 7 (ISS-16-hs27pq): directly after the case 'a cross-type id-prefix warns for the filename and for the prefix', the case 'a directory named like an artefact is skipped and every mode still runs'. On baseTree(), create the directory flowcharge/workstreams/WS-1-abcdef-alpha/TL-9-zzzzzz-tasklist.md with fs.mkdirSync, then assert expectWarns(dir, []) and exit 0 for --list all and for the default mode."
    - "Add, for task 4 (ISS-13-nqpgsn): directly after the case '--new-ws --status blocked is refused and writes nothing', one case per refused argument set, ['--new-ws', 'bad slug!', '--title', 'Demo'], ['--new-ws'], ['--sync', '--claim', 'WS'] and ['--claim', 'BOGUS'], named `a refused <args> run creates no .gitignore`. On EMPTY_TREE, assert expectRefusal and that no .gitignore exists."
    - "Add, for task 9 (ISS-18-gffohk): directly after the case 'a writing run appends only the lease line to a .gitignore holding the other three', one case per covering line, /flowcharge/, /flowcharge, flowcharge/**, /flowcharge/** and flowcharge/*, named `a .gitignore holding only <line> gains no line`, each asserting that the default mode leaves that one-line .gitignore byte-identical; then the case 'root-anchored spellings cover their own paths and /.lease covers no lease file', whose .gitignore holds /flowcharge/index.md, /flowcharge/kanban.md, /flowcharge/ids/ and /.lease and gains exactly the managed comment line and the flowcharge/workstreams/*/.lease line."
    - "Add, for task 12 (ISS-21-uqa78u): after the case \"fc-git's operations sections live only in operations.md, which SKILL.md names\", a section headed `// ---- cases: the suite's own paths` holding the case 'the suite derives its own folder through fileURLToPath'. It reads this file through fileURLToPath(import.meta.url) and asserts a line matching /^const HERE = path\\.dirname\\(fileURLToPath\\(import\\.meta\\.url\\)\\);$/m and no match for /URL\\(import\\.meta\\.url\\)\\.pathname/."
    - "Task 10 (ISS-19-451hci) adds no case: its fix corrects the case 'a second --sync run changes no file and prints no SYNC line', which is its own test."
  verify:
    - "grep -cF 'expectWarns(dir, [HEADER_CHECK_WARN]);' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('rename: a filename prefix that disagrees with the id is refused and the file keeps its name'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('rename: a directory named like an artefact is skipped and the real artefacts still move'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('a checkbox line inside a fenced code block is neither an issue nor a task'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('an unquoted author that opens with a bracket renders as written in the index and on the board'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('--list issues --sort status ranks blocked in the issue lifecycle and an unknown status last'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('ready work counts an authored plan or issue list as a met dependency'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('a close written on the day after its case began still matches its fixture'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('a directory named like an artefact is skipped and every mode still runs'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'run creates no .gitignore' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF 'gains no line' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('root-anchored spellings cover their own paths and /.lease covers no lease file'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('the suite derives its own folder through fileURLToPath'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: false
  ```

- [ ] 15. Test-run task: run the project's test suites
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

## Divergences

1. **Task YAML blocks without a closing fence line.** ISS-11-r98dyf's fix direction tracks a fence from its opening line to its closing line. Executed task lists in this repository hold task YAML blocks whose closing fence line is missing: at c909873, `flowcharge/workstreams/WS-29-w3jbov-count-only-executable-tasks/TL-29-hz5t5b-tasklist.md` opens five ```yaml fences and closes two, and `flowcharge/workstreams/WS-30-nw2tqo-tick-subtask-when-passed/TL-30-q0ptrv-tasklist.md` and `flowcharge/workstreams/WS-3-t2lfk1-branch-name-ws-prefix/TL-3-ycaucg-tasklist.md` do the same. A fence that only its closing line ends would hide every later task line in such a file. Task 2 therefore also ends an indented fence at the first line indented less than its opening line, and its test case in task 14 includes one such block.
2. **The author line --new-ws writes.** ISS-12-jp4fx6's fix direction also suggests writing the author line in quoted form. At c909873, `skills/flowcharge/scripts/fc-index.mjs:230-233` records that the record --new-ws writes stays byte-identical for an ordinary name, and `skills/flowcharge/scripts/test/run-tests.mjs:1672` pins the unquoted line. The narrowed parse in task 3 alone renders the name as git reports it in every view, which is the issue's expected result, so no task quotes the author line.
