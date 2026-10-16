---
id: TL-27-lkn3cq
type: tasklist
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Structured task fields in the workstream lease"
status: ready
created: 2026-10-16
updated: 2026-10-16
author: Anthony Koukoullis
depends_on: [PLN-23-39k273]
links: []
mode: spec
base_commit: c1bdfc5
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Structured task fields in the workstream lease

Implements PLN-23-39k273. The workstream `.lease` gains `task`, `task_title` and `task_started`, after `artefact` and before `note`. Only the refresh before a parent-task run sets them; every other refresh writes them empty, and no refresh runs when a task ends. The refresh command in `skills/flowcharge/SKILL.md` takes the three values as arguments, so `task_started` holds within one parent-task run. `skills/flowcharge/scripts/fc-index.mjs` stays unchanged, because it reads the lease by key name. The test-update task brings the `lease()` fixture, when given a heartbeat age, to the nine-key form and adds a case that runs the SKILL.md refresh command and checks the three task keys.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe. Every `skills/flowcharge/SKILL.md` edit in parent task 1 avoids what the suite's docs-consistency, single-copy, pointer-resolution and spawn-word cases reject: a `workstreams/` path with a bare slug, a `WS-N` with no `-SUFFIX`, an artefact filename with no ID in front of it, the product name without "Core" after it, the word gate, the retired `open_questions` key, a `skills/` or `templates/` path that does not resolve, a pinned single-copy phrase outside its canonical file, a `(CONVENTIONS.md, <Section>)` pointer to a section that does not exist, and a spawn or subagent word.

- [x] 1. Task fields in the lease file

  ```yaml
  description: "skills/flowcharge/SKILL.md defines the nine-key lease file and the eight-argument refresh command, writes the task keys empty at every write point but one, and sets them before each parent-task run. Realises PLN-23-39k273 stage 1 (criteria 1 to 7 and 9)."
  ```

  - [x] 1.1 Define the three task keys and the new refresh command
    ```yaml
    description: "The lease file bullet lists task, task_title and task_started between artefact and note, says which refresh sets them and that every other refresh writes them empty, and gives the eight-argument refresh command with its quoting rule"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## FlowCharge Core upkeep (automatic, every pipeline run)', bullet '- **The lease file**:', extend the key list so `task`, `task_title` and `task_started` follow `artefact` and precede `note`, each with its value rule from PLN-23-39k273, Content specification, The lease file, and say that every refresh writes all seven keys after `acquired`."
      - "In the same bullet, state that only the refresh before a parent-task run (see Operations, execute-tasks) sets the three task keys and that every other refresh writes them empty, so a finished task stops showing as current once its stage ends. State the empty-value form of PLN-23-39k273, Content specification, and that a reader finds each value by key name and reads a missing key as no value."
      - "In the same bullet, replace the example refresh command with the exact command of PLN-23-39k273, Content specification, Refresh command, on one line in one inline code span, still introduced with 'e.g.'. Add the quoting rule of PLN-23-39k273, Scope, Assumptions, Quoting: each value is one single-quoted argument, and a single quote inside a value is written with the shell's escape for it (`'\\''` in a POSIX shell). Keep the exits sentence, the halt and the No script can check sentence unchanged."
    verify:
      - "grep -cF \"[p,t,s='',a='',i='',u='',b='',n='']=process.argv.slice(1)\" skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF \"'artefact: '+a,'task: '+i,'task_title: '+u.replace(/\\s+/g,' '),'task_started: '+b,'note: '+n.replace(/\\s+/g,' ')\" skills/flowcharge/SKILL.md  # expect 1, the write order; 0 at base_commit"
      - "grep -cF \"'<artefact>' '<task>' '<task_title>' '<task_started>' '<note>'\" skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF \"[p,t,s='',a='',n='']\" skills/flowcharge/SKILL.md  # expect 0, the five-argument command gone; 1 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'task_started'  # expect at least 2 lines, the key list and the command; 0 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'POSIX shell'  # expect at least 1, the quoting rule; 0 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'by key name'  # expect at least 1, the reader rule; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: grep -cF of the eight-argument destructuring returned 1"
        - item: "verify 2"
          result: YES
          measured: "source: grep -cF of the artefact, task, task_title, task_started, note write order returned 1"
        - item: "verify 3"
          result: YES
          measured: "source: grep -cF of the eight quoted placeholders returned 1"
        - item: "verify 4"
          result: YES
          measured: "source: grep -cF of the five-argument destructuring returned 0"
        - item: "verify 5"
          result: YES
          measured: "source: the lease file bullet's range holds 3 lines with task_started"
        - item: "verify 6"
          result: YES
          measured: "source: the lease file bullet's range holds 1 line with POSIX shell"
        - item: "verify 7"
          result: YES
          measured: "source: the lease file bullet's range holds 1 line with by key name"
      unverified: []
      failures: []
    ```
  - [x] 1.2 Set the three task keys before every parent-task run
    ```yaml
    description: "The execute-tasks Operations note's refresh passes the parent task's number, its title and the run's start time, read once with the start-time command"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## Operations', note '- **execute-tasks**:', extend the sentence that opens 'Before every run of the stage file, the baseline run included, refresh the lease' so the refresh also passes the parent task's number as `task`, its title (the text after `<N>. ` on its task-list line) as `task_title`, and as `task_started` the time this run begins, read once with the start-time command of PLN-23-39k273, Content specification, on one line in one inline code span, and passed unchanged to every refresh within this run. Keep `stage`, `artefact`, the `parent task <N> of <M>` note with its baseline suffix, and the note's other sentences unchanged."
    verify:
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c 'task_started'  # expect at least 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c 'task_title'  # expect at least 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -cF 'node -e \"console.log(new Date().toISOString())\"'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c 'parent task <N> of <M>'  # expect 1; 1 at base_commit, so this step guards the kept note and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: the execute-tasks note range holds 1 line with task_started"
        - item: "verify 2"
          result: YES
          measured: "source: the execute-tasks note range holds 1 line with task_title"
        - item: "verify 3"
          result: YES
          measured: "source: grep -cF of the start-time command in the execute-tasks note range returned 1"
        - item: "verify 4"
          result: YES
          measured: "source: the execute-tasks note range holds 1 line with parent task <N> of <M>"
      unverified: []
      failures: []
    ```

- [x] 2. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update: in skills/flowcharge/scripts/test/run-tests.mjs, section '// ---- cases: leases and the registry header', `const lease = (session, minutesAgo, heartbeatMinutesAgo) =>`: when the third argument is given, append the seven refresh keys in PLN-23-39k273 order, `heartbeat: <ISO time>`, `stage: execute-tasks`, `artefact: TL-1-abcdef`, `task: 1`, `task_title: Fixture task`, `task_started: <the same ISO time>` and `note: parent task 1 of 2`, computing the ISO time once so both lines carry one value. Change its comment 'A third argument adds the four keys every refresh writes' to 'A third argument adds the seven keys every refresh writes'. The five lease cases keep their names, their calls and their expectations."
    - "Add: directly after the case 'clean: a lease acquired long ago with a fresh heartbeat warns about nothing', the case 'the lease refresh command in SKILL.md writes the three task keys, set and empty', per PLN-23-39k273, Testing strategy. It reads skills/flowcharge/SKILL.md (two directories above this file), takes the script of the one inline code span that holds the refresh command, asserts there is exactly one, and runs it with spawnSync(process.execPath, ['-e', script, <lease path>, 'sess-live', ...values]) against a withFixture(baseTree(...)) lease holding only `session: sess-live` and an `acquired` line. First run: `execute-tasks`, `TL-1-abcdef`, `3`, a title holding a line break, a whitespace run and an apostrophe, `2026-10-16T01:02:03.004Z`, `parent task 3 of 5`. Second run: `upkeep`, `TL-1-abcdef` and four empty values. After each run assert exit 0, the file's nine lines in key order with the trailing newline (the heartbeat line by its ISO 8601 shape, the title collapsed to single spaces, `task_started` as passed, and `task: `, `task_title: `, `task_started: ` and `note: ` on the second run), no `.tmp` file left in the workstream folder, and expectWarns(dir, []). The SKILL.md command sits in a double-quoted shell string, where bash leaves `\\n` and `\\s` as typed, so the span's script text passed to node -e unchanged is the program the shell passes; assert.match and spawnSync are within the Node 16 floor (DEVELOPMENT.md)."
  verify:
    - "grep -cF 'artefact: TL-1-abcdef\\ntask: 1\\ntask_title: Fixture task\\ntask_started: ' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the fixture's task keys; 0 at base_commit"
    - "grep -c 'adds the seven keys every refresh writes' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"testCase('the lease refresh command in SKILL.md writes the three task keys, set and empty'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -cF of the fixture's artefact, task, task_title and task_started lines returned 1"
      - item: "verify 2"
        result: YES
        measured: "source: grep -c of the seven-keys comment returned 1"
      - item: "verify 3"
        result: YES
        measured: "source: grep -cF of the new case's name returned 1"
  ```

- [ ] 3. Test-run task: run the project's test suites
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
