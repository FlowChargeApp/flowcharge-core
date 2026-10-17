---
id: TL-28-ez34h3
type: tasklist
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Leaf-task refresh of the workstream lease"
status: done
created: 2026-10-17
updated: 2026-10-17
author: Anthony Koukoullis
depends_on: [PLN-24-d65rxi]
links: []
mode: spec
base_commit: e1e391b
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Leaf-task refresh of the workstream lease

Implements PLN-24-d65rxi. The execute-tasks lease refresh moves from one refresh before each parent-task run to one refresh before each leaf task: each child task, numbered `<N>.<K>`, and each task with no children, the baseline run of the test-run task included. A parent task that has children gets no refresh of its own. Because a parent's children run inside one run of `templates/execute-parent-task.md`, the orchestrator writes each child-level refresh itself, as lease upkeep, before it starts that child's steps, and "Sanctioned deviations" lists that refresh as a write the stage file's limit on changing other files does not cover. `task` holds `<N>` or `<N>.<K>`, and the child's `note` reads `parent task <N> of <M>, subtask <N>.<K>`. The lease keys, the refresh command, the stage-change writes and the quoting rule are unchanged. The test-update task brings the `lease()` fixture and the refresh-command case in line with the leaf-task rule and adds one case for a dotted `task` and the baseline note.

Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. A step that joins a range with `tr` before its `grep -c` matches a phrase whatever its line wrap, and counts 1 for the whole range. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe. Every `skills/flowcharge/SKILL.md` edit in parent task 1 avoids what the suite's docs-consistency, single-copy, pointer-resolution and spawn-word cases reject: a `workstreams/` path with a bare slug, a `WS-N` with no `-SUFFIX`, an artefact filename with no ID in front of it, the product name without "Core" after it, the word gate, the retired `open_questions` key, a `skills/` or `templates/` path that does not resolve, a pinned single-copy phrase outside its canonical file, a `(CONVENTIONS.md, <Section>)` pointer to a section that does not exist, and a spawn or subagent word.

- [x] 1. Leaf-task refresh in the orchestrator

  ```yaml
  description: "skills/flowcharge/SKILL.md refreshes the lease before each child task and each task with no children, never for a parent task that has children, lists the child-level refresh among its sanctioned deviations, and its lease file bullet describes the task now running, with a dotted task number read as text. Realises PLN-24-d65rxi stage 1 (criteria 1 to 8 and 10)."
  ```

  - [x] 1.1 Refresh the lease before each leaf task
    ```yaml
    description: "The execute-tasks Operations note refreshes the lease before each child task and each task with no children, none for a parent task that has children, and states that the orchestrator writes each child-level refresh itself as lease upkeep"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## Operations', note '- **execute-tasks**:', replace the sentence that opens 'Before every run of the stage file, the baseline run included, refresh the lease' and ends '`, baseline run` appended for the baseline run.' with the rule of PLN-24-d65rxi, Design, Refresh points: refresh the lease (see FlowCharge Core upkeep, The lease file) before each task that has no children, the baseline run included, and before each child task, never for a parent task that has children."
      - "In its place, also state PLN-24-d65rxi, Design, Refresh inside a stage run: a parent's children run inside one run of the stage file, so you write each child's refresh yourself before you start that child's steps; the refresh is lease upkeep, not a step of the stage file, with a pointer to Sanctioned deviations, where task 1.3 states the stage-file limit the refresh is exempt from."
      - "Then state the values each refresh passes, per PLN-24-d65rxi, Content specification, Execute-tasks refresh values: `stage` `execute-tasks`; the task list's ID as `artefact`; the task's number as `task` (`<N>`, or `<N>.<K>` for a child); its title as `task_title` (the text after `<N>. `, or after `<N>.<K> ` for a child, on its task-list line); as `task_started` the time that task begins, read once with the existing start-time command, kept on one line in one inline code span, and passed unchanged to every refresh within it; and the note `parent task <N> of <M>`, with `, subtask <N>.<K>` appended for a child and `, baseline run` for the baseline run."
      - "Keep the loop sentence before it and the sentences after it (the halt per rule 7, the NOT CHECKED lift, and hard rule 13 then the baseline run) unchanged."
    verify:
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'never for a parent task that has children'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'not a step of the stage file'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'subtask <N>\\.<K>'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'Before every run of the stage file'  # expect 0, the per-parent rule gone; 1 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -cF 'node -e \"console.log(new Date().toISOString())\"'  # expect 1; 1 at base_commit, so this step guards the kept start-time command and cannot fail there"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c ', baseline run'  # expect 1; 1 at base_commit, so this step guards the kept baseline note and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: the joined execute-tasks range counts 1 for never for a parent task that has children"
        - item: "verify 2"
          result: YES
          measured: "source: the joined execute-tasks range counts 1 for not a step of the stage file"
        - item: "verify 3"
          result: YES
          measured: "source: the joined execute-tasks range counts 1 for subtask <N>.<K>"
        - item: "verify 4"
          result: YES
          measured: "source: the joined execute-tasks range counts 0 for Before every run of the stage file"
        - item: "verify 5"
          result: YES
          measured: "source: grep -cF of the start-time command in the execute-tasks range returned 1"
        - item: "verify 6"
          result: YES
          measured: "source: the execute-tasks range holds 1 line with , baseline run"
      unverified: []
      failures: []
    ```
  - [x] 1.2 Describe the running task in the lease file bullet
    ```yaml
    description: "The lease file bullet defines task, task_title and task_started for the task now running, gives task's range as a task number or a dotted child number, adds that a reader reads task as text, and shows the subtask note"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## FlowCharge Core upkeep (automatic, every pipeline run)', bullet '- **The lease file**:', define `task` as the number of the task now running, a task number such as `3` or a dotted child number such as `3.1`, in place of 'the number of the parent task whose run is in progress'; keep `task_title` as that task's title, copied from its task-list line; and define `task_started` as the time that task began, the same on every refresh within it, in place of 'the time that parent-task run began' (PLN-24-d65rxi, Design, Lease file, and Content specification, Lease file wording)."
      - "In the same bullet, change the `note` example `parent task 3 of 7` to `parent task 3 of 7, subtask 3.1`, change 'Only the refresh before a parent-task run (see Operations, execute-tasks)' so it names the refresh before a task, and extend 'A reader finds each value by key name and reads a missing key as no value.' so a reader also reads `task` as text."
      - "Keep the key order, 'every other refresh writes them empty', the empty-value form, the whitespace-collapse sentence, the refresh command, the exits and halt, the quoting rule and the No script can check sentence unchanged. Edit no other upkeep bullet."
    verify:
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'dotted child number such as `3.1`'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'reads `task` as text'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'parent task 3 of 7, subtask 3\\.1'  # expect 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -cE 'parent-task run|parent task whose run'  # expect 0, no definition names a parent task's run; 1 at base_commit"
      - "grep -cF \"[p,t,s='',a='',i='',u='',b='',n='']=process.argv.slice(1)\" skills/flowcharge/SKILL.md  # expect 1; 1 at base_commit, so this step guards the unchanged eight-argument command and cannot fail there"
      - "diff <(git show e1e391b:skills/flowcharge/SKILL.md | sed -n '/^- \\*\\*Start of run\\*\\*/,/^- \\*\\*Successful end of run\\*\\*/p') <(sed -n '/^- \\*\\*Start of run\\*\\*/,/^- \\*\\*Successful end of run\\*\\*/p' skills/flowcharge/SKILL.md) && echo unchanged  # expect unchanged, the stage-change refreshes untouched; unchanged at base_commit, so this step guards them and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: the joined lease file range counts 1 for dotted child number such as `3.1`"
        - item: "verify 2"
          result: YES
          measured: "source: the joined lease file range counts 1 for reads `task` as text"
        - item: "verify 3"
          result: YES
          measured: "source: the joined lease file range counts 1 for parent task 3 of 7, subtask 3.1"
        - item: "verify 4"
          result: YES
          measured: "source: the joined lease file range counts 0 for parent-task run or parent task whose run"
        - item: "verify 5"
          result: YES
          measured: "source: grep -cF of the eight-argument destructuring returned 1"
        - item: "verify 6"
          result: YES
          measured: "source: diff of the Start of run to Successful end of run range against e1e391b printed unchanged"
      unverified: []
      failures: []
    ```
  - [x] 1.3 List the child-level refresh as a sanctioned deviation
    ```yaml
    description: "Sanctioned deviations lists the lease refresh before each child task as a write inside the stage run that the stage file's limit on changing other files does not cover"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## Running a stage: the procedure', subsection '### Sanctioned deviations', directly after the bullet that opens '- In execute-parent-task, the loop mechanics live in this skill, not the stage file;', add one bullet per PLN-24-d65rxi, Design, Refresh inside a stage run: in execute-parent-task, you write the lease refresh before each child task (see Operations, execute-tasks) inside the stage run, before that child's steps, and the stage file's limit on changing other files does not cover the `.lease`."
      - "Keep 'These, and nothing else:' and the three existing bullets unchanged."
    verify:
      - "sed -n '/^### Sanctioned deviations/,/^## Chaining/p' skills/flowcharge/SKILL.md | grep -c '^- '  # expect 4, the new bullet added; 3 at base_commit"
      - "sed -n '/^### Sanctioned deviations/,/^## Chaining/p' skills/flowcharge/SKILL.md | tr '\\n' ' ' | tr -s ' ' | grep -c 'does not cover the `.lease`'  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "source: the Sanctioned deviations range holds 4 bullets"
        - item: "verify 2"
          result: YES
          measured: "source: the joined Sanctioned deviations range counts 1 for does not cover the `.lease`"
      unverified: []
      failures: []
    ```

- [x] 2. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
  implement:
    - "Update: in skills/flowcharge/scripts/test/run-tests.mjs, section '// ---- cases: leases and the registry header', `const lease = (session, minutesAgo, heartbeatMinutesAgo) =>`: when the third argument is given, write `task: 1.1`, `task_title: Fixture subtask` and `note: parent task 1 of 2, subtask 1.1` in place of `task: 1`, `task_title: Fixture task` and `note: parent task 1 of 2`, keeping every other line, the key order and the one-line template. In the comment above it, change 'The refresh before a parent-task run sets the task keys' so it names the refresh before a child task (PLN-24-d65rxi, Testing strategy). The five generator lease cases keep their names, calls and expectations."
    - "Update: move the run-and-assert helper `refreshAndRead` out of the case 'the lease refresh command in SKILL.md writes the three task keys, set and empty' to module scope, directly after `REFRESH_SPAN_RE`, as `const refreshAndRead = (dir, script, acquired, values, expected) =>`, with the lease path taken as `path.join(dir, LEASE1)` and every assertion it makes unchanged; the case calls it with its own `dir`, `script` and `acquired`, and keeps its two runs and their expectations. In the comment above `SKILL_MD`, change 'The first run is the refresh before a parent-task run' to name the refresh before a task with no children."
    - "Add: directly after that case, the case 'the lease refresh command in SKILL.md writes a dotted subtask number and the baseline note as given', per PLN-24-d65rxi, Testing strategy. It takes the script of the one refresh-command span with the same `REFRESH_SPAN_RE` and the same exactly-one assertion, builds a withFixture(baseTree(...)) lease holding only `session: sess-live` and an `acquired` line, and calls `refreshAndRead` twice. First run: `execute-tasks`, `TL-1-abcdef`, `5`, `Test-run task: run the project's test suites`, `2026-10-17T01:02:03.004Z`, `parent task 5 of 5, baseline run`. Second run: `execute-tasks`, `TL-1-abcdef`, `1.1`, `Refresh the lease before each leaf task`, `2026-10-17T01:05:06.007Z`, `parent task 1 of 5, subtask 1.1`. Each run expects the six lines after `heartbeat` byte for byte, `task: 5` then `task: 1.1` included."
  verify:
    - "grep -cF 'artefact: TL-1-abcdef\\ntask: 1.1\\ntask_title: Fixture subtask\\ntask_started: ${beat}\\nnote: parent task 1 of 2, subtask 1.1\\n' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the fixture's leaf-task values; 0 at base_commit"
    - "grep -c 'parent-task run' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0, both lease comments updated; 2 at base_commit"
    - "grep -c '^const refreshAndRead = ' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the helper at module scope; 0 at base_commit"
    - "grep -cF \"testCase('the lease refresh command in SKILL.md writes a dotted subtask number and the baseline note as given'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    - "grep -cF \"'note: parent task 5 of 5, baseline run'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the baseline note pinned; 0 at base_commit"
    - "grep -cF \"'task: 1.1'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1, the dotted task pinned; 0 at base_commit"
  self_eval:
    passed: true
    evidence:
      - item: "verify 1"
        result: YES
        measured: "source: grep -cF of the fixture's artefact, task, task_title, task_started and note lines returned 1"
      - item: "verify 2"
        result: YES
        measured: "source: grep -c parent-task run returned 0; the shared comment above SKILL_MD now covers both refresh-command cases, and the first-run sentence sits above its own case"
      - item: "verify 3"
        result: YES
        measured: "source: grep -c of the module-scope refreshAndRead returned 1"
      - item: "verify 4"
        result: YES
        measured: "source: grep -cF of the new case's name returned 1"
      - item: "verify 5"
        result: YES
        measured: "source: grep -cF of the baseline note expectation returned 1"
      - item: "verify 6"
        result: YES
        measured: "source: grep -cF of the dotted task expectation returned 1"
  ```

- [x] 3. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: true
    test_run_result: passed
    test_run_baseline: []
    test_run_failures: []
  ```
