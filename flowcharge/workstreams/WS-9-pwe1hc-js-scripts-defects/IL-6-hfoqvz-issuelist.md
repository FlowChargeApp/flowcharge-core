---
id: IL-6-hfoqvz
type: issuelist
workstream: WS-9-pwe1hc
slug: js-scripts-defects
title: "Generator, renamer and test-suite script defects"
status: done
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-10-xtjs1c. The renamer adds a second id prefix to a file whose prefix disagrees with its id, hiding the file from the generator

  ```yaml
  id: ISS-10-xtjs1c
  status: done
  severity: high
  author: Anthony Koukoullis
  description: "fc-rename-artefacts.mjs strips only a filename prefix that equals the file's frontmatter id. A file whose prefix names a different id keeps that prefix, and the renamer prepends the frontmatter id in front of it. The resulting name fails the generator's artefact filename filter, so the generator stops reading the file."
  steps_to_reproduce:
    - "In a workstream folder, create PLN-2-abcdef-plan.md whose frontmatter carries id: PLN-1-abcdef."
    - "Run fc-index.mjs --check and see the WARN that the filename id-prefix disagrees with the frontmatter id."
    - "Run node skills/flowcharge/scripts/fc-rename-artefacts.mjs --root <project-root> --apply."
    - "List the folder, then run fc-index.mjs --list all and --check."
  expected: "The renamer either corrects the filename to PLN-1-abcdef-plan.md, or refuses the file with a counted refusal. The artefact stays visible to the generator."
  actual: "The file becomes PLN-1-abcdef-PLN-2-abcdef-plan.md and the renamer exits 0. The new name fails ARTEFACT_FILE in the renamer and the scan filter in the generator, so the plan disappears from index.md, kanban.md, --list all, the ID graph and the --sync completeness test, and --check no longer warns about it. A second renamer run prints nothing for the file, so the loss persists until a person notices."
  affected: "skills/flowcharge/scripts/fc-rename-artefacts.mjs:152 (plain-name derivation), :153 (target composition), :71 (ARTEFACT_FILE); skills/flowcharge/scripts/fc-index.mjs:1154 (scan filter), :593-596 (the prefix-disagreement WARN that prompts a renamer run)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 1]
  notes: "Reproduced against the current code: PLN-2-abcdef-plan.md carrying id: PLN-1-abcdef became PLN-1-abcdef-PLN-2-abcdef-plan.md, and --list all then listed the workstream record alone. The comment above :152 records why the script never strips a prefix that differs from the id: stripping it would rewrite such a file silently. Fix direction: either outcome the expected result names, with the file left visible to the generator. Resolved by TL-31-1mar0i task 1: the renamer refuses a file whose prefix disagrees with its id, as a counted refusal, and leaves its name unchanged."
  ```

- [x] ISS-11-r98dyf. Issue and task scanners count checkbox lines inside fenced code blocks

  ```yaml
  id: ISS-11-r98dyf
  status: done
  severity: high
  author: Anthony Koukoullis
  description: "Neither parseIssues nor parseTasks tracks fenced-code-block state. Both match checkbox lines anywhere in the body, so an example quoted inside a fenced code block is counted as a live issue or a live task."
  steps_to_reproduce:
    - "Author an issue list with one real issue ISS-1-abcdef, then add a notes section that quotes an example issue line inside a fenced code block, for example - [ ] ISS-9-zzzzzz. Example issue from the schema docs."
    - "Author a task list with one checked real task, then quote two example task lines inside a fenced code block."
    - "Run the generator and read the Open issues table, --list issues and --list tasklists, then run --sync."
  expected: "Only the real issue and the real task are counted. A checkbox line inside a fenced code block quotes an example and is skipped."
  actual: "The fenced example is counted as an open issue, ranked by its own quoted severity, and registered in the ID graph, where it can satisfy a depends_on or links target, resolve an orphan marker, raise a false duplicate or a registry-behind WARN, and keep the issue list open to --sync. On the task side the fenced lines join the progress figure, which reads 1/3 for one checked real task and two fenced example lines, and they keep a fully checked list from closing under --sync."
  affected: "skills/flowcharge/scripts/fc-index.mjs:405-426 (parseIssues, heading regex at :409), :437-500 (parseTasks, task-line regex at :442)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 2]
  notes: "Reproduced against the current code on both paths: a fenced ISS-9-zzzzzz example showed as an open critical issue with a registry-behind WARN, and a task list whose only real task was checked showed 1/3 progress and stayed ready after --sync. The task path also covers a diff-mode SEARCH/REPLACE block that quotes task lines. Fix direction: track fence state in both scanners and skip checkbox lines while inside a fence. Resolved by TL-31-1mar0i task 2: both scanners skip a checkbox line inside a fenced code block, and an indented fence also ends with the list item that holds it."
  ```

- [x] ISS-12-jp4fx6. An unquoted frontmatter value that opens with a bracket, such as an author name, is parsed as an inline array

  ```yaml
  id: ISS-12-jp4fx6
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "parseFrontmatter treats every unquoted value that starts with an opening bracket as an inline array: it strips the brackets and splits the value on commas. --new-ws writes author unquoted, unlike title, so a git user.name that opens with a bracket is mangled, and so is a hand-written author: [Ada] Lovelace."
  steps_to_reproduce:
    - "In a repository whose git config user.name is [Ada] Lovelace, Byron, run fc-index.mjs --new-ws demo --title Demo."
    - "Regenerate the index and the board."
    - "Read the index Author cell, the board card's by line and the --whoami output."
  expected: "The author name renders exactly as git config user.name reports it, in every view."
  actual: "The index Author cell shows Ada] Lovelace,Byron and the card shows by Ada] Lovelace,Byron, while --whoami prints the name correctly, so the corruption is specific to reading the record back. A hand-written author: [Ada] Lovelace renders as Ada] Lovelace."
  affected: "skills/flowcharge/scripts/fc-index.mjs:392 (the inline-array test in parseFrontmatter), :1340 (the unquoted author line --new-ws writes), :234-240 (readGitAuthor)"
  environment: "Node >= 16. Needs a user.name or an author value that opens with a bracket."
  tasks: [TL-31-1mar0i task 3]
  notes: "Reproduced against the current code with a repository-local user.name of [Ada] Lovelace, Byron and with a hand-written record. The control-character strip in readGitAuthor does not cover this class of value. Fix direction: write author in the quoted form title uses, and narrow the array test to the keys the schema declares as lists. Resolved by TL-31-1mar0i task 3: parseFrontmatter reads an inline array only for the schema list keys; the author line --new-ws writes stays unquoted."
  ```

- [x] ISS-13-nqpgsn. .gitignore is written before argument validation, so a refused run still changes a tracked file

  ```yaml
  id: ISS-13-nqpgsn
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "ensureGitignore runs as soon as the flowcharge/workstreams/ check passes, gated only on flag presence in argv. parseSyncArgs, parseNewWsArgs, parseListArgs and parseClaimArgs all run later, so an invocation they refuse has already created or appended to the project's .gitignore before it exits 1."
  steps_to_reproduce:
    - "Start from a project root with no .gitignore."
    - "Run fc-index.mjs --new-ws 'bad slug!' --title T, then separately --new-ws demo --title T --sync, --sync --claim WS, --new-ws with no slug, and --claim BOGUS."
    - "Observe each run's error and exit code 1, then read .gitignore."
  expected: "A run that refuses its own arguments and exits 1 writes nothing."
  actual: ".gitignore is created with the managed comment and all four ignore lines, and then the process exits 1, for every one of those invocations."
  affected: "skills/flowcharge/scripts/fc-index.mjs:289-295 (the ensureGitignore call block), :1202-1204, :1214 and :1263 (the argument parsers that run after it)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 4]
  notes: "Reproduced against the current code for all five invocations. The --init combination check runs before the call and writes nothing. The appended lines match what a later valid run would append, so the effect is benign in content, but the write happens on a run that refuses itself and touches a tracked file before the script has validated its arguments. No refusal case in run-tests.mjs checks .gitignore, so the behaviour is unguarded. Fix direction: run the call after every argument parser. Resolved by TL-31-1mar0i task 4: the .gitignore write runs after the last argument parser."
  ```

- [x] ISS-14-18ydcb. --check prints a WARN claiming the ids.md header was rewritten when nothing is written

  ```yaml
  id: ISS-14-18ydcb
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The WARN for a stale ids.md header ends with the word rewritten, but under --check the early exit runs before the write, so the message reports an action the run did not take."
  steps_to_reproduce:
    - "Prepare a tree whose flowcharge/ids.md carries an outdated header text above its counter lines."
    - "Record a checksum of flowcharge/ids.md."
    - "Run fc-index.mjs --check."
    - "Read the WARN line and checksum the file again."
  expected: "Under --check the message states the finding only, because --check reports without writing."
  actual: "The run prints WARN ids.md: header text is out of date, rewritten and leaves the file byte-identical."
  affected: "skills/flowcharge/scripts/fc-index.mjs:1547 (the WARN string), :1579-1582 (the --check early exit), :1587 (the write); skills/flowcharge/scripts/test/run-tests.mjs:2314 and :2450 (the --check case that pins the wording)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 5]
  notes: "Reproduced against the current code: message printed, ids.md checksum unchanged. Fix direction: state the finding rather than an action taken, or choose the wording on checkOnly. The pinned test wording changes with the string. Resolved by TL-31-1mar0i task 5: under --check the WARN reads ids.md: header text is out of date, and a writing run keeps its wording."
  ```

- [x] ISS-15-9egxn3. --sort status ranks a blocked issue, and any unrecognised status, ahead of every other status

  ```yaml
  id: ISS-15-9egxn3
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The --sort status comparator ranks by STATUSES.indexOf, and STATUSES is the five-value artefact enum. An issue's blocked status is absent from it, so it scores -1 and sorts ahead of everything, backlog at index 0 included. Every unrecognised status shares the same -1 rank."
  steps_to_reproduce:
    - "Author issues at status backlog, blocked, in-progress and one unrecognised value."
    - "Run fc-index.mjs --list issues --sort status."
    - "Read the order of the rows."
  expected: "Rows sort in lifecycle order, as HELP promises: an issue ranks by its place in the six-value issue enum, and an unrecognised value sorts last."
  actual: "Rows come back blocked, then the unrecognised value, then backlog, then in-progress."
  affected: "skills/flowcharge/scripts/fc-index.mjs:1077 (the status branch of compareRecs), :298 (the five-value STATUSES enum); the six-value issue enum is defined in skills/fc-issue-list/SKILL.md"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 6]
  notes: "Reproduced against the current code with exactly that ordering. skills/fc-issue-list/SKILL.md lists the issue enum as backlog, ready, in-progress, blocked, done, dropped, so blocked ranks after in-progress and before done. Fix direction: rank an issue against the six-value issue enum, and sort an unrecognised value last rather than first. Resolved by TL-31-1mar0i task 6: --list issues --sort status ranks by the six-value issue enum, and an unrecognised status ranks after every known one."
  ```

- [x] ISS-16-hs27pq. A directory named like an artefact crashes every generator mode with an unhandled EISDIR

  ```yaml
  id: ISS-16-hs27pq
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The per-folder artefact listing in the scan calls readdirSync without withFileTypes, unlike the workstream-folder listing just above it. A directory whose name matches the artefact filename filter reaches fs.readFileSync and crashes the process."
  steps_to_reproduce:
    - "Create a directory named TL-9-zzzzzz-tasklist.md inside a workstream folder under flowcharge/workstreams/."
    - "Run the generator in any mode: --check, --list all, the default, --sync, --claim TL or --new-ws."
  expected: "Directory entries are skipped. No mode crashes on the shape of the tree."
  actual: "Every mode dies with an unhandled EISDIR stack trace at fc-index.mjs:1159 and exits 1, the code the script documents for invalid arguments, because the scan runs before any mode."
  affected: "skills/flowcharge/scripts/fc-index.mjs:1152-1155 (the readdirSync call), :1159 (the readFileSync that throws); sibling listings that already pass withFileTypes are at :1145-1149, :1502 and :1556"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 7]
  notes: "Reproduced against the current code in all six modes. Fix direction: list the folder with { withFileTypes: true } and keep only entries where isFile() is true. Resolved by TL-31-1mar0i task 7: the scan reads only file entries."
  ```

- [x] ISS-17-jvj96o. The index's ready-to-start section hides a task list whose plan or issue-list dependency is already authored

  ```yaml
  id: ISS-17-jvj96o
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "isDone requires status done for every depends_on target, with no exception by target type. CONVENTIONS.md states that a plan or issue-list dependency counts as met once that artefact is authored, meaning any status other than backlog or dropped."
  steps_to_reproduce:
    - "Author an issue list IL-1-abcdef at status ready and a task list carrying depends_on: [IL-1-abcdef]."
    - "Author a plan PLN-1-abcdef at status ready and a second task list carrying depends_on: [PLN-1-abcdef]."
    - "Regenerate the index and read the Ready to start (deps satisfied) section."
  expected: "Both task lists appear in the section, because their plan and issue-list dependencies are authored."
  actual: "The section lists the issue list, the plan and the workstream but neither task list, so the artefacts actually ready to execute are the ones hidden from it."
  affected: "skills/flowcharge/scripts/fc-index.mjs:1357-1360 (isDone), :1605-1607 (readyWork), :1629-1630 (the Ready to start section); README.md:31-32 carries text that contradicts CONVENTIONS.md and also needs correcting"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 8]
  notes: "Reproduced against the current code. CONVENTIONS.md states its own precedence, and skills/flowcharge/SKILL.md hard rule 5 and skills/fc-task-list/SKILL.md already encode the authored-is-enough exception, so README.md's sentence that such a task list runs only once its issue list is done is the outdated text. The defect is confined to the index's advisory section: the orchestrator's execute-tasks dependency check already applies the exception. Fix direction: treat a PLN or IL depends_on target as met once it exists at any status other than backlog or dropped, and correct README.md alongside the code so the two stay consistent. Resolved by TL-31-1mar0i task 8: ready work meets a plan or issue-list dependency once it is authored, and README.md states the same rule."
  ```

- [x] ISS-18-gffohk. The .gitignore coverage test misses equivalent spellings and appends redundant lines

  ```yaml
  id: ISS-18-gffohk
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "ensureGitignore tests coverage by exact string match against the literal forms GITIGNORE_COVERS lists. An entry that covers the same paths, written with a leading slash or a trailing glob, is not recognised as covering."
  steps_to_reproduce:
    - "Create a project root .gitignore holding only the line /flowcharge/."
    - "Run the generator in a writing mode, for example a plain regenerate."
    - "Read .gitignore."
  expected: "A broader entry that already covers a path counts, as CONVENTIONS.md and the generator's HELP promise, so nothing is appended."
  actual: "The file gains the managed comment and all four ignore lines. The same happens for /flowcharge, flowcharge/**, /flowcharge/** and flowcharge/*, each of which git check-ignore confirms covers all four paths."
  affected: "skills/flowcharge/scripts/fc-index.mjs:168-173 (GITIGNORE_COVERS), :183-185 (the comparison in ensureGitignore)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 9]
  notes: "Reproduced against the current code for all five spellings. Fix direction: recognise the leading-slash and trailing-glob spellings of each covering form, not only the bare literal forms. Resolved by TL-31-1mar0i task 9: a leading-slash or trailing-glob spelling of a covering entry counts as covering, and /.lease still covers no lease file."
  ```

- [x] ISS-19-451hci. The second --sync test case asserts a hard-coded target instead of the loop variable

  ```yaml
  id: ISS-19-451hci
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The case 'a second --sync run changes no file and prints no SYNC line' loops over the workstream record and the task list, but the assertion inside the loop calls expectClosedFile with the task list's path and fixture text instead of the loop variable's. The task list's closed content is checked twice, and the workstream record's never, inside this loop."
  steps_to_reproduce:
    - "Read the loop over after in that case and the expectClosedFile call inside it."
    - "Run the case with expectClosedFile recording each path it checks."
  expected: "Each iteration checks its own file once, against that file's own fixture text."
  actual: "Both iterations check flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md. A defect that corrupted the workstream record's closed content beyond its status and updated lines would pass this loop, provided the second --sync run left the corruption alone."
  affected: "skills/flowcharge/scripts/test/run-tests.mjs:1037-1041 (the loop), :1040 (the assertion)"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 10]
  notes: "Reproduced against the current code: an instrumented copy of the case recorded the task-list path twice and the workstream path never. No coverage is lost from the suite as a whole: the loop's own snapshot comparison still checks the workstream record against its state after the first --sync, and the case '--sync closes a workstream whose artefacts are all closed' pins its closed bytes. The defect is a wasted duplicate assertion in this one case. Fix direction: use the loop variable's own path and fixture text. Resolved by TL-31-1mar0i task 10: the loop checks each file against its own path and fixture text."
  ```

- [x] ISS-20-2ms98u. Seven test cases race the generator's clock across local midnight

  ```yaml
  id: ISS-20-2ms98u
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "Seven cases read the current day in the parent process before spawning fc-index.mjs, then assert against a date the generator derives from its own clock through localDay(). The two clock reads are independent, so a run that crosses local midnight between them fails."
  steps_to_reproduce:
    - "Run the suite so that a case's parent-side today() call and the generator's localDay() call fall on opposite sides of local midnight."
    - "Read the failing created: or updated: assertion."
  expected: "The assertion compares against the date the generator actually wrote, so it never depends on when the two processes read the clock."
  actual: "The case fails and reports a script defect that does not exist."
  affected: "skills/flowcharge/scripts/test/run-tests.mjs: the --sync cases whose day is read at :973, :985, :1000, :1013 and :1027 and asserted through expectClosedFile (:964-970), and the --new-ws cases whose day is read at :1711 and :1732 and asserted at :1725 and :1741-1744; skills/flowcharge/scripts/fc-index.mjs:353-354 (localDay)"
  environment: "Node >= 16. Fires only on a run that crosses local midnight."
  tasks: [TL-31-1mar0i task 11]
  notes: "Reproduced against the current code by moving the clock of every fc-index.mjs child one second past the next local midnight: all seven cases failed on updated: or created: values one day apart, while the two cases that pin a file's mtime from the same day value they assert, at :1327 and :1572, still passed. Fix direction: read the date back from the file the generator produced, or accept either of the two adjacent calendar days, at the seven assertions. Resolved by TL-31-1mar0i task 11: the seven assertions accept the day the generator wrote when it is the start day of the case or the day read after the spawn."
  ```

- [x] ISS-21-uqa78u. The test suite derives its own folder from a file URL pathname, which breaks on Windows

  ```yaml
  id: ISS-21-uqa78u
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "run-tests.mjs computes HERE as path.dirname of a decoded file URL pathname rather than through fileURLToPath. A file URL's pathname keeps a leading slash in front of a Windows drive letter, so the derived folder is invalid on Windows."
  steps_to_reproduce:
    - "Run node skills/flowcharge/scripts/test/run-tests.mjs on Windows."
    - "Observe the first spawnSync call of the generator."
  expected: "The generator, renamer, stamper and skills-root paths resolve correctly on every platform Node supports."
  actual: "HERE becomes /C:/.../scripts/test, so GENERATOR, RENAMER and every other path derived from HERE resolves to a path that does not exist, and the suite fails at its first spawnSync call."
  affected: "skills/flowcharge/scripts/test/run-tests.mjs:31"
  environment: "Node >= 16 on Windows."
  tasks: [TL-31-1mar0i task 12]
  notes: "Reproduced by direct computation with Windows path semantics: for the URL file:///C:/Users/me/proj/skills/flowcharge/scripts/test/run-tests.mjs the pathname form gives the folder /C:/Users/me/proj/skills/flowcharge/scripts/test and a generator path of \\C:\\Users\\me\\proj\\skills\\flowcharge\\scripts\\fc-index.mjs, while fileURLToPath gives C:\\Users\\me\\proj\\skills\\flowcharge\\scripts\\test. fc-index.mjs and fc-rename-artefacts.mjs already guard Windows drive-absolute paths in their containment checks, which confirms Windows is a contemplated platform. Fix direction: derive HERE with fileURLToPath(import.meta.url) from node:url. Resolved by TL-31-1mar0i task 12: HERE is derived through fileURLToPath."
  ```

- [x] ISS-22-j2m4g3. A directory named like an artefact crashes the renamer with an unhandled EISDIR

  ```yaml
  id: ISS-22-j2m4g3
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The renamer's per-folder scan calls fs.readdirSync without withFileTypes, unlike the folder listing just above it. It filters the names against ARTEFACT_FILE and reads every match with fs.readFileSync, with no check that a match is a file rather than a directory."
  steps_to_reproduce:
    - "Create a directory named issuelist-notes.md inside a workstream folder under flowcharge/workstreams/."
    - "Run node skills/flowcharge/scripts/fc-rename-artefacts.mjs --root <project-root> in the default dry-run mode."
    - "Run the same command with --apply."
  expected: "Directory entries are skipped, and the script reports or renames the real artefacts in every workstream."
  actual: "The script dies with an unhandled EISDIR stack trace at fc-rename-artefacts.mjs:137 and exits 1. The crash happens in the scan, before the --apply gate, so both modes fail and no workstream is processed while such a directory exists."
  affected: "skills/flowcharge/scripts/fc-rename-artefacts.mjs:133 (the readdirSync call), :137 (the readFileSync that throws), :71 (ARTEFACT_FILE); the folder listing that already passes withFileTypes is at :126-130; the --apply gate is at :179"
  environment: "Node >= 16"
  tasks: [TL-31-1mar0i task 13]
  notes: "Reproduced against the current code in both modes; a legacy plan.md in the same folder stayed unrenamed. This is the same defect shape as ISS-16-hs27pq, which covers the equivalent call in fc-index.mjs and not this file. Fix direction: pass { withFileTypes: true } and keep only entries where isFile() is true before filtering by ARTEFACT_FILE and reading them. Resolved by TL-31-1mar0i task 13: the renamer scan reads only file entries."
  ```
