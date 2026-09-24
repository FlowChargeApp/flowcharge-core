---
id: TL-24-7m2280
type: tasklist
workstream: WS-26-bzq2c1
slug: project-test-gate
title: "Test-gate task: one fixed owner for the project's suites"
status: ready
created: 2026-09-24
updated: 2026-09-24
author: Anthony Koukoullis
depends_on: [PLN-20-c9i9sn]
links: []
mode: diff
base_commit: 486f241
runtime: none
e2e_tooling: []
---

# FlowCharge Tasks

## Test-gate task: one fixed owner for the project's suites

Implements PLN-20-c9i9sn. Every task list gains a `test_commands` frontmatter key (the project's own suite commands, `[]` when none) and ends with one fixed test-gate task that runs them after every other task, with a baseline run before the first task. A failure is never fixed inline: the orchestrator files it through issues-and-tasks, executes the fix list (which ends with a recheck task instead of its own full test-gate task) on the same branch, and re-runs the test-gate task, for at most 2 fix rounds. A failure that also failed at the baseline is filed and does not block. `fc-index.mjs --check` refuses a `done` task list carrying `test_commands` whose test-gate record is neither `passed` nor `not-checked` with `test_commands: []`. Skill prose writes the concept as `test-gate` and the keys as `test_gate*`, because Rule E in `run-tests.mjs` fails on a bare `gate` word in `skills/**/*.md` (PLN-20-c9i9sn, Design, Vocabulary).

Stage order keeps every commit consistent. Stage 1 rewrites every sentence that names who runs a suite and moves the `run-tests.mjs` pin in one parent task, so the pinned phrase and its prose never disagree and no two files name different owners at any commit boundary. Stage 4 lands the CONVENTIONS.md rule, the `fc-index.mjs` check and its `run-tests.mjs` cases together.

Measured at `base_commit` 486f241: every `grep -c` below that asserts a new string returns 0, `grep -rn --include='*.md' "user's own step" skills` returns 1 line (`skills/fc-task-list/SKILL.md:272`), and `grep -cF 'The executor runs them after' skills/fc-validate/SKILL.md` returns 1. The Rule E guard (`grep -cE` for a bare gate word) returns 1 for `fc-task-list/SKILL.md`, 6 for `fc-validate/SKILL.md`, 1 for `CONVENTIONS.md` and 0 for `execute-parent-task.md`, `plan-and-tasks.md`, `issues-and-tasks.md` and `flowcharge/SKILL.md`. Each guard step asserts that count is unchanged, so it passes at `base_commit` by design: it guards against a new bare gate word, which the change must not add. The repository configures no lint or type-check command, so no task carries one.

- [x] 1. Single owner: the test-gate task contract
  ```yaml
  description: "Define the test-gate task, its record and test_commands detection in fc-task-list, and in the same parent task rewrite every sentence that bans suites or names another runner (executor template, fc-validate, both authoring templates' verify sentence) and move the run-tests.mjs pin. Realises PLN-20-c9i9sn stage 1."
  ```

  - [x] 1.1 Add test_commands to the fc-task-list frontmatter example
    ```yaml
    description: "Add a test_commands line to the frontmatter example in skills/fc-task-list/SKILL.md, after e2e_tooling."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        e2e_tooling: [playwright] # browser/e2e tooling already present, or []
        =======
        e2e_tooling: [playwright] # browser/e2e tooling already present, or []
        test_commands: ["npm test", "npm run test:e2e"] # the project's own suite commands, or []; see Test commands detection
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Frontmatter key (task list): an inline array of double-quoted commands."
    gotcha: "The line sits inside the fenced frontmatter example; keep it before the closing --- line."
    verify:
      - "grep -cF 'test_commands: [\"npm test\", \"npm run test:e2e\"]' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-task-list/SKILL.md  # expect 1, unchanged from base_commit (Rule E guard)"
    checklist:
      - "Block applied cleanly at the single e2e_tooling example line"
      - "The new line uses an inline array of double-quoted strings"
      - "grep confirms exactly one test_commands example line"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Add the test_commands key bullet
    ```yaml
    description: "Add a test_commands bullet after the runtime / e2e_tooling bullet in skills/fc-task-list/SKILL.md's File frontmatter section."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - `runtime` / `e2e_tooling`: facts about the project, recorded at authoring per **Runtime detection** below, never choices.
        =======
        - `runtime` / `e2e_tooling`: facts about the project, recorded at authoring per **Runtime detection** below, never choices.
        - `test_commands`: the project's own suite commands, recorded at authoring per **Test commands detection** below, never chosen or invented; only the list's **Test-gate task** runs them.
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Frontmatter key (task list). Points at sections tasks 1.3 and 1.7 add."
    gotcha: "The bold section names must match the headings tasks 1.3 and 1.7 write: Test commands detection, Test-gate task."
    verify:
      - "grep -cF -e '- `test_commands`: the project' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-task-list/SKILL.md  # expect 1, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly after the runtime / e2e_tooling bullet"
      - "The bullet names Test commands detection and Test-gate task"
      - "grep confirms exactly one test_commands key bullet"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Add the Test commands detection section
    ```yaml
    description: "Insert a ### Test commands detection section in skills/fc-task-list/SKILL.md, directly before ### Two authoring modes, stating where test_commands comes from."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Two authoring modes: `spec` and `diff`
        =======
        ### Test commands detection

        At authoring time, record from disk alone, as `test_commands`, every test suite the project defines: an inline array of double-quoted commands, each run from the project root (e.g. `["npm test", "npm run test:e2e"]`).

        - Record a command only where a project file names it: a `package.json` script, a Makefile target, a command a CI workflow runs, or an equivalent. A runner's default command that no project file names is never recorded.
        - Record every suite (unit, integration, e2e), not one. Leave out a command that only runs other recorded ones, and every lint, type-check or build command.
        - `[]` means the project defines no suite.

        Detection only: never invent, install or configure anything. Only the **Test-gate task** runs these commands. A list with no `test_commands` key predates this rule.

        ### Two authoring modes: `spec` and `diff`
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Scope, Assumptions (a command is recorded only where the project names it) and Design, Frontmatter key (task list). Follows the Runtime detection section's shape."
    gotcha: "The heading must read exactly 'Test commands detection', which task 1.2 and stage 2 name. Write no bare gate word (Rule E)."
    verify:
      - "grep -c '^### Test commands detection$' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -n '^### Test commands detection$\\|^### Two authoring modes' skills/fc-task-list/SKILL.md  # expect the detection heading on the lower line number"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-task-list/SKILL.md  # expect 1, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the Two authoring modes heading"
      - "The new section sits directly before Two authoring modes"
      - "The section forbids a command no project file names"
      - "The section states [] means no suite"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 Rewrite the verify rule's suite sentence to name the test-gate task
    ```yaml
    description: "Replace the sentence in skills/fc-task-list/SKILL.md's verify bullet that makes running a suite the user's own step with one naming the test-gate task as the one place a suite runs. It carries the phrase task 1.8 pins."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        Never add a test-suite or build command as a verify step: it asserts nothing about the task, passes before the change as readily as after, and running a suite is the user's own step after execution.
        =======
        Never add a test-suite or build command as a verify step: it asserts nothing about the task and passes before the change as readily as after. A suite runs in one place only: the list's final test-gate task (see **Test-gate task**).
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, One owner, one canonical sentence. The SEARCH text is a substring of line 272; the rest of the line stays as it is."
    gotcha: "Task 1.8 moves the run-tests.mjs pin to 'A suite runs in one place only'; both tasks sit in this parent task so they land in one commit. Keep 'Measure before you write' later on the line untouched."
    verify:
      - "grep -cF 'A suite runs in one place only' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -rn --include='*.md' \"user's own step\" skills  # expect no output; 1 line at base_commit (the run-tests.mjs deletion pin itself carries the phrase, so only Markdown is searched)"
      - "grep -cF 'Measure before you write' skills/fc-task-list/SKILL.md  # expect 1, unchanged"
    checklist:
      - "Block applied cleanly inside the verify bullet"
      - "The user's own step wording is gone from every skill file"
      - "The canonical phrase appears exactly once"
      - "The Measure before you write rule on the same line is unchanged"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.5 Exempt the test-gate task from the Mini shape test
    ```yaml
    description: "Make the opening sentence of skills/fc-task-list/SKILL.md's Mini shape section exclude the test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        Every adult or child task takes one of two shapes, decided by a test on its own content, never by preference.
        =======
        Every adult or child task except the test-gate task (see **Test-gate task**) takes one of two shapes, decided by a test on its own content, never by preference.
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Test-gate task, full form: outside the full-versus-mini shape test."
    gotcha: "The SEARCH text is the first sentence of the Mini shape paragraph; the rest of that paragraph stays as it is."
    verify:
      - "grep -cF 'Every adult or child task except the test-gate task' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-task-list/SKILL.md  # expect 1, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the Mini shape opening sentence"
      - "The exception points at Test-gate task"
      - "The four-condition mini test below it is unchanged"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.6 Place the test-gate task outside the Verify tiers
    ```yaml
    description: "Append to the Forbidden tier bullet in skills/fc-task-list/SKILL.md a sentence placing the test-gate task outside the tiers, leaving the tier itself unchanged for every other task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - **Forbidden.** A full test suite, a full build, a deploy, a package install, anything that writes outside a temporary directory. The one exception is a probe's `runtime` setup build (see Probe), which may write the project's own build output.
        =======
        - **Forbidden.** A full test suite, a full build, a deploy, a package install, anything that writes outside a temporary directory. The one exception is a probe's `runtime` setup build (see Probe), which may write the project's own build output. The test-gate task is outside these tiers (see **Test-gate task**).
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Scope, criterion 8: the Forbidden tier stays unchanged for every task except the test-gate task."
    gotcha: "Only append; the existing Forbidden list and its probe exception stay word for word."
    verify:
      - "grep -cF 'The test-gate task is outside these tiers' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF -e '- **Forbidden.** A full test suite, a full build, a deploy, a package install' skills/fc-task-list/SKILL.md  # expect 1, unchanged"
    checklist:
      - "Block applied cleanly at the Forbidden bullet"
      - "The Forbidden list itself is unchanged"
      - "The new sentence points at Test-gate task"
      - "No other tier bullet changed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.7 Add the Test-gate task section
    ```yaml
    description: "Insert a ### Test-gate task section in skills/fc-task-list/SKILL.md, directly before ### Smoke Tests: both literal forms, the two runs, the record, the never-fix rule and a no-script-can-check note."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Smoke Tests
        =======
        ### Test-gate task

        Every task list ends with one test-gate task: the last top-level task, numbered after every other. Add it exactly as written below, predicting no edit. It checks the whole change and detects no single one, so **Measure before you write** and the Forbidden tier do not apply to it, and it takes neither the full nor the mini shape. Every other task keeps all three.

        ````md
        - [ ] N. Test-gate task: run the project's test suites
          ```yaml
          description: "Run every command in the frontmatter test_commands after every other task"
          test_gate: full
          implement:
            - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-gate task section"
          verify:
            - "Every command in the frontmatter test_commands, in order, from the project root"
          self_eval:
            passed: false
            test_gate_result: pending
            test_gate_baseline: pending
            test_gate_failures: []
          ```
        ````

        A list authored to fix test-gate failures ends with the recheck form instead, never the full form. Its `verify` names one command per failing check, or the full recorded command where a check cannot run alone:

        ````md
        - [ ] N. Test-gate recheck: re-run the failing checks
          ```yaml
          description: "Re-run the checks that failed in <TL-id> task <n>"
          test_gate: recheck
          implement:
            - "No edit; run every verify command per the fc-task-list skill's Test-gate task section"
          verify:
            - "<one command per failing check>"
          self_eval:
            passed: false
            test_gate_result: pending
            test_gate_failures: []
          ```
        ````

        **Two runs.** The full form runs twice. A run while no other top-level task is checked and `test_gate_baseline` is `pending` is the baseline run: run every command, record the baseline, and leave the task unchecked. The run after every other task is the check itself: run every command again, and set a baseline still `pending` to `unavailable`. The baseline stands for `base_commit`, the tree before the list's first task. The recheck form runs once and has no baseline.

        **The record**, in `self_eval`, replaces the evidence **Self-evaluation** asks of a checklist:

        - A check is one failing test as the runner's output names it, or the whole command where the output names none.
        - `test_gate_baseline`: `pending`, `unavailable`, or the list of checks that failed at the baseline run, `[]` when none did.
        - `test_gate_failures`: one entry per check failing at the last run, with `check`, `command`, `message` (the runner's failure text, trimmed) and `blocking`: `false` when the check is in the baseline, else `true`. In the recheck form every entry blocks.
        - `test_gate_result`: `passed` when no entry blocks, `failed` when one does, and `not-checked` when `test_commands` is `[]`, which is never a pass: report it as NOT CHECKED.
        - Set `passed: true` and mark the task `[x]` on `passed` or `not-checked` only. On `failed`, leave it unchecked.

        Never fix a failure, never edit a file to make a check pass, and never record a failing run as passed. Return every entry. A fix goes through a recorded issue and task, never inline; inside a flowcharge run, the orchestrator's test-gate loop does this.

        **No script can check** that the baseline ran first or that no failure was fixed inline, because no script reads a run. `fc-index.mjs --check` checks only the record a `done` list carrying `test_commands` holds: `passed`, or `not-checked` with `test_commands: []`.

        ### Smoke Tests
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design: Test-gate task (full and recheck forms), The test-gate record, Which run is which. Nested fences follow the Task List Format section (four-backtick md outer, three-backtick yaml inner)."
    gotcha: "Write no bare gate word (Rule E): test-gate and test_gate only. Do not write the pinned phrase 'A suite runs in one place only' here; task 1.4 owns its one copy."
    verify:
      - "grep -c '^### Test-gate task$' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'test_gate: recheck' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'test_gate_baseline: pending' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'A suite runs in one place only' skills/fc-task-list/SKILL.md  # expect 1, the copy task 1.4 wrote"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-task-list/SKILL.md  # expect 1, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the Smoke Tests heading"
      - "Both the full form (test_gate: full) and the recheck form (test_gate: recheck) are present"
      - "The record lists test_gate_result, test_gate_baseline and test_gate_failures with the plan's values"
      - "The section forbids fixing a failure inline"
      - "The section carries a No script can check note"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.8 Move the run-tests.mjs single-copy pin to the new phrase
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs's SINGLE_COPY_PHRASES, replace the 'Never add a test-suite or build command' entry with the new canonical phrase, and pin the user's own step wording deleted from every skill file."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          { phrase: 'Never add a test-suite or build command', files: ['fc-task-list/SKILL.md'] },
        =======
          { phrase: 'A suite runs in one place only', files: ['fc-task-list/SKILL.md'] },
          // A suite's one owner is the test-gate task, so the wording that made running
          // a suite the user's own step is pinned deleted from every skill file.
          { phrase: "user's own step", files: [] },
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, One owner, one canonical sentence. singleCopyViolations reads skills/**/*.md only, and an empty file list pins a deletion."
    gotcha: "Lands in the same parent task as task 1.4, so the pin and the prose agree at the commit. The phrase must match task 1.4's REPLACE text byte for byte."
    verify:
      - "grep -cF \"{ phrase: 'A suite runs in one place only', files: ['fc-task-list/SKILL.md'] },\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'own step\", files: [] },' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
      - "grep -cF \"phrase: 'Never add a test-suite or build command'\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
    checklist:
      - "Block applied cleanly at the old pin entry"
      - "The new pin names fc-task-list/SKILL.md alone"
      - "The deletion pin carries an empty file list"
      - "The old pin entry is gone"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.9 Add the test-gate branch to the executor template
    ```yaml
    description: "Add a bullet to skills/flowcharge/templates/execute-parent-task.md, after the mini-subtask bullet and before the verify bullet, sending a test-gate task to the fc-task-list skill's Test-gate task section and exempting it from the bullets below."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        Its `self_eval.evidence` holds one entry per `verify` step.
        =======
        Its `self_eval.evidence` holds one entry per `verify` step.
        - **A test-gate task (`test_gate:` key) has no edit.** Run it exactly as the fc-task-list skill's Test-gate task section says, which also decides whether this run records the baseline. The bullets below do not apply to it, except the `updated` bump. Never fix a failure it finds: return it.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Which run is which: decided from the file, so the template keeps its two slots {tasklist} and {parent_task}. DEVELOPMENT.md single-copy rule: the template points at the skill's section and does not restate it."
    gotcha: "The SEARCH text is the tail of the mini-subtask bullet line. Write no brace slot and no bare gate word."
    verify:
      - "grep -cF -e '- **A test-gate task (`test_gate:` key) has no edit.**' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -n 'A test-gate task (`test_gate:` key)\\|^- Run the task' skills/flowcharge/templates/execute-parent-task.md  # expect the test-gate bullet on the lower line number"
      - "grep -o '{[a-z_0-9]*}' skills/flowcharge/templates/execute-parent-task.md | sort -u  # expect only {parent_task} and {tasklist}, unchanged"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/execute-parent-task.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly after the mini-subtask bullet"
      - "The new bullet sits before the verify bullet"
      - "The template's slot set is unchanged"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.10 Name the test-gate task in the executor's skip rule
    ```yaml
    description: "Extend the executor template's full-suite skip sentence in skills/flowcharge/templates/execute-parent-task.md so it names the test-gate task as the one place a suite runs."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        Skip any step that runs a full test suite or a full build, even when the task lists one.
        =======
        Skip any step that runs a full test suite or a full build, even when the task lists one: a suite runs only in the test-gate task above.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, One owner, one canonical sentence. The probe setup-build exception after this sentence stays as it is."
    gotcha: "The SEARCH text is a substring of the verify bullet line; do not touch the rest of that line."
    verify:
      - "grep -cF 'even when the task lists one: a suite runs only in the test-gate task above.' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
      - "grep -cF \"The one exception is a probe's \\`runtime\\` setup build\" skills/flowcharge/templates/execute-parent-task.md  # expect 1, unchanged"
    checklist:
      - "Block applied cleanly inside the verify bullet"
      - "The skip rule names the test-gate task"
      - "The probe setup-build exception is unchanged"
      - "No bare gate word was added"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.11 Add the test-gate record to the executor template's Return
    ```yaml
    description: "Add a Return item to skills/flowcharge/templates/execute-parent-task.md that carries a test-gate task's result, baseline and failures."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        - The populated `self_eval` for the parent task
        =======
        - The populated `self_eval` for the parent task
        - For a test-gate task: its `test_gate_result`, its `test_gate_baseline`, and every `test_gate_failures` entry with its `check`, `command`, `message` and `blocking` value
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, The test-gate record and Findings contract: the orchestrator builds findings from these fields."
    gotcha: "Field names must match task 1.7's record exactly."
    verify:
      - "grep -cF -e '- For a test-gate task: its `test_gate_result`' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
    checklist:
      - "Block applied cleanly as the last Return item"
      - "The item names test_gate_result, test_gate_baseline and test_gate_failures"
      - "The entry fields are check, command, message and blocking"
      - "No bare gate word was added"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.12 Correct fc-validate's sentence on who runs suites
    ```yaml
    description: "Replace the sentence in skills/fc-validate/SKILL.md's runnable command class saying the executor runs lint, type-check and test commands with one naming the executor's static steps and the test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
        and no project-wide command can fail on unmodified code. The executor runs them after
        the change lands, which is where they catch something.
        =======
        and no project-wide command can fail on unmodified code. The executor runs lint and
        type-check as static steps after the change lands, and test suites run only in the task
        list's final test-gate task, which is where each catches something.
        >>>>>>> REPLACE
    pattern: "skills/fc-validate/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, One owner, one canonical sentence. The allowlisted 'gate a' occurrence later in this section stays untouched."
    gotcha: "Write test-gate hyphenated; the six Rule E occurrences in this file are allowlisted and must all survive."
    verify:
      - "grep -cF 'The executor runs them after' skills/fc-validate/SKILL.md  # expect 0; 1 at base_commit"
      - "grep -cF 'test suites run only in the task' skills/fc-validate/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-validate/SKILL.md  # expect 6, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly across the two SEARCH lines"
      - "The executor runs them wording is gone"
      - "The new sentence names the test-gate task"
      - "The Rule E guard count is still 6"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.13 Exempt the test-gate task from fc-validate's coverage, invention and tautology checks
    ```yaml
    description: "Add a paragraph after the opening sentence of skills/fc-validate/SKILL.md's Part 2 stating that a task list's test-gate task comes from the fc-task-list schema, is never a coverage gap or invented content, is never run or judged in Part 3, and is checked for Form only."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
        Read the artefact and its source in full, then check all four classes.
        =======
        Read the artefact and its source in full, then check all four classes.

        A task list's final test-gate task, in its full or recheck form (the fc-task-list skill's Test-gate task section), comes from that skill's schema, not from the source. It is never a coverage gap or invented content, Part 3 never runs or judges its `verify`, and Form, against its fixed shape, is the only class checked against it. The frontmatter `test_commands` is checked for Accuracy like any other command.
        >>>>>>> REPLACE
    pattern: "skills/fc-validate/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, table row for skills/fc-validate/SKILL.md. Without it the correction rule would delete the test-gate task as invented content."
    gotcha: "Write test-gate hyphenated; add no bare gate word."
    verify:
      - "grep -cF \"A task list's final test-gate task\" skills/fc-validate/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/fc-validate/SKILL.md  # expect 6, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly after the Part 2 opening sentence"
      - "The paragraph rules out coverage and invented-content findings on the test-gate task"
      - "The paragraph excludes the test-gate task from Part 3"
      - "The Rule E guard count is still 6"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.14 Except the test-gate task in plan-and-tasks' verify sentence
    ```yaml
    description: "Make the verify sentence in skills/flowcharge/templates/plan-and-tasks.md forbid a full test suite or build outside the test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks.md
        <<<<<<< SEARCH
        at most one runtime probe per task, never a full test suite or build. Where the plan names issue IDs
        =======
        at most one runtime probe per task, never a full test suite or build outside the test-gate task. Where the plan names issue IDs
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, table row for plan-and-tasks.md (line 69)."
    gotcha: "The SEARCH text is a substring of line 69; add no brace slot and no bare gate word."
    verify:
      - "grep -cF 'never a full test suite or build outside the test-gate task.' skills/flowcharge/templates/plan-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/plan-and-tasks.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly inside line 69"
      - "The sentence names the test-gate task as the exception"
      - "The template's slot set is unchanged"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.15 Except the test-gate task in issues-and-tasks' verify sentence
    ```yaml
    description: "Make the verify bullet in skills/flowcharge/templates/issues-and-tasks.md forbid a full test suite or build outside the test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks.md
        <<<<<<< SEARCH
        at most one runtime probe per task, never a full test suite or build. Tag every checklist item
        =======
        at most one runtime probe per task, never a full test suite or build outside the test-gate task. Tag every checklist item
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, table row for issues-and-tasks.md (line 52)."
    gotcha: "The SEARCH text is a substring of line 52; add no brace slot and no bare gate word."
    verify:
      - "grep -cF 'never a full test suite or build outside the test-gate task.' skills/flowcharge/templates/issues-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/issues-and-tasks.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly inside line 52"
      - "The sentence names the test-gate task as the exception"
      - "The template's slot set is unchanged"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: true
      failures: []
    ```

- [x] 2. Authoring stages record test_commands and end every list with the test-gate task
  ```yaml
  description: "Make plan-and-tasks and issues-and-tasks name test_commands in their frontmatter line and end every task list with the test-gate task. Realises PLN-20-c9i9sn stage 2."
  ```

  - [x] 2.1 Name test_commands in plan-and-tasks' frontmatter line
    ```yaml
    description: "Add test_commands per the skill's Test commands detection to the task-list frontmatter sentence in skills/flowcharge/templates/plan-and-tasks.md."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks.md
        <<<<<<< SEARCH
        `runtime` and `e2e_tooling` per the skill's Runtime detection (read from the project, never invented), and `depends_on: [<the plan's ID from its own frontmatter>]`.
        =======
        `runtime` and `e2e_tooling` per the skill's Runtime detection and `test_commands` per its Test commands detection (read from the project, never invented), and `depends_on: [<the plan's ID from its own frontmatter>]`.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Frontmatter key (task list). Names the section task 1.3 adds."
    gotcha: "The SEARCH text is a substring of line 47; the slots {ws_id}, {slug} and {mode} earlier on the line stay untouched."
    verify:
      - "grep -cF '`test_commands` per its Test commands detection' skills/flowcharge/templates/plan-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -o '{[a-z_0-9]*}' skills/flowcharge/templates/plan-and-tasks.md | sort -u  # expect {mode} {plan} {scale} {slug} {stages} {ws_dir} {ws_id}, unchanged"
    checklist:
      - "Block applied cleanly inside line 47"
      - "The line names test_commands and Test commands detection"
      - "The template's slot set is unchanged"
      - "No bare gate word was added"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 2.2 End every plan-and-tasks list with the test-gate task
    ```yaml
    description: "Add a bullet after 'Cover every stage' in skills/flowcharge/templates/plan-and-tasks.md telling the author to end the list with the test-gate task, as the skill writes it."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks.md
        <<<<<<< SEARCH
        * Cover every stage. This plan exists because partial implementation is the failure mode, and an untasked stage is how that happens.
        =======
        * Cover every stage. This plan exists because partial implementation is the failure mode, and an untasked stage is how that happens.
        * End the list with the test-gate task, added exactly as the skill's Test-gate task section writes it, after the last parent task.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/plan-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Scope, criterion 1."
    gotcha: "Keep the bullet marker '* ' the list already uses; add no bare gate word."
    verify:
      - "grep -c '^\\* End the list with the test-gate task' skills/flowcharge/templates/plan-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/plan-and-tasks.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly after the Cover every stage bullet"
      - "The bullet uses the list's own '* ' marker"
      - "The bullet points at the skill's Test-gate task section"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 2.3 Name test_commands in issues-and-tasks' frontmatter line
    ```yaml
    description: "Add test_commands per the skill's Test commands detection to the task-list frontmatter sentence in skills/flowcharge/templates/issues-and-tasks.md."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks.md
        <<<<<<< SEARCH
        `runtime` and `e2e_tooling` per the skill's Runtime detection (read from the project, never invented), and `depends_on: [<the issue list's ID from its own frontmatter>]`.
        =======
        `runtime` and `e2e_tooling` per the skill's Runtime detection and `test_commands` per its Test commands detection (read from the project, never invented), and `depends_on: [<the issue list's ID from its own frontmatter>]`.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Frontmatter key (task list)."
    gotcha: "The SEARCH text is a substring of line 39; the slots earlier on the line stay untouched."
    verify:
      - "grep -cF '`test_commands` per its Test commands detection' skills/flowcharge/templates/issues-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -o '{[a-z_0-9]*}' skills/flowcharge/templates/issues-and-tasks.md | sort -u  # expect {issuelist} {mode} {slug} {stages} {ws_dir} {ws_id}, unchanged"
    checklist:
      - "Block applied cleanly inside line 39"
      - "The line names test_commands and Test commands detection"
      - "The template's slot set is unchanged"
      - "No bare gate word was added"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 2.4 End every issues-and-tasks list with the test-gate task
    ```yaml
    description: "Add a paragraph before the Skipped paragraph in skills/flowcharge/templates/issues-and-tasks.md's Part 2 telling the author to end the list with the test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks.md
        <<<<<<< SEARCH
        Where Part 1's add-versus-correct test fails for an issue's fix, author no task for it; record it under Skipped.
        =======
        End the list with the test-gate task, added exactly as the fc-task-list skill's Test-gate task section writes it, after the last task.

        Where Part 1's add-versus-correct test fails for an issue's fix, author no task for it; record it under Skipped.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Scope, criterion 1. Task 3.5 later appends the fix-list exception after the same line's last sentence, which this block leaves intact."
    gotcha: "The SEARCH text is the start of line 54; keep its closing sentence 'Tasks in this file are executed as written, so a feature that slips in gets built.' unchanged, because task 3.5 anchors on it."
    verify:
      - "grep -c '^End the list with the test-gate task' skills/flowcharge/templates/issues-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -cF 'Tasks in this file are executed as written, so a feature that slips in gets built.' skills/flowcharge/templates/issues-and-tasks.md  # expect 1, unchanged"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/issues-and-tasks.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the start of the Skipped paragraph"
      - "The new paragraph points at the skill's Test-gate task section"
      - "The Skipped paragraph's closing sentence is unchanged"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: true
      failures: []
    ```

- [ ] 3. The record-and-fix loop
  ```yaml
  description: "Add the baseline run, the record-and-fix loop, the 2-round cap and the hard rule 7 exception to skills/flowcharge/SKILL.md, and the fix-list recheck rule to issues-and-tasks. Realises PLN-20-c9i9sn stage 3."
  ```

  - [ ] 3.1 Add The test-gate loop section to the orchestrator
    ```yaml
    description: "Insert a ## The test-gate loop section in skills/flowcharge/SKILL.md, directly before ## Talking to the user: baseline run, recording through issues-and-tasks, fix rounds, pre-existing failures, the cap, and a no-script-can-check note."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        ## Talking to the user
        =======
        ## The test-gate loop

        A task list's final test-gate task is where the project's suites run; the fc-task-list
        skill's Test-gate task section defines its runs and its record. This section is the
        orchestrator's part around it. A list with no test-gate task predates the rule: it
        takes no baseline, runs no suite and enters no loop.

        - **Baseline.** In an execute-tasks stage, after hard rule 13's check and before the
          first parent task, run `templates/execute-parent-task.md` once for the list's
          full-form test-gate task (`test_gate: full`). That run records the baseline only.
          The task runs again in file order, as the list's last task.
        - **Recording, never fixing.** When a test-gate task returns any `test_gate_failures`
          entry, fix nothing yourself. Run the issues-and-tasks stage for a new issue list in
          the same workstream, with `{stages}` as `issues-and-tasks`, or `issues-only` where
          no entry blocks. Supply one finding per entry: its `command` and `check` as the
          location, its `message` as the failure scenario, severity `high` when it blocks and
          `medium` when not, confidence `confirmed`, and the marker
          `test-gate failure: blocking` or `test-gate failure: pre-existing`. Supply no
          pre-existing failure this workstream has already filed. These entries are the
          validation source for that issue list.
        - **A fix round** is that stage, its validation per "The validation setting", and
          execute-tasks on the fix list it produced, under hard rules 4, 5 and 11 as they
          stand, on the same branch. When the fix list's recheck task passes, run every
          earlier fix list's recheck task still unchecked, then the outer test-gate task
          again, each through `templates/execute-parent-task.md`. A recheck or outer run that
          returns a blocking entry starts the next round.
        - **Pre-existing failures never block.** A test-gate task whose only entries are
          pre-existing passes, and the run goes on. Their issues stay open: list each in the
          final summary's numbered list.
        - **The cap.** After 2 fix rounds, a recheck or outer run that still returns a
          blocking entry halts the run under hard rule 7. Report every failing check, every
          issue filed and the state of each fix list.

        **No script can check** that a run takes the baseline, files every failure or stops at
        the cap, because no script reads this prose, so this section carries that note in the
        way this file's other unverifiable rules do (see DEVELOPMENT.md's note on unverifiable
        rules). `fc-index.mjs --check` checks only the record a `done` task list holds.

        ## Talking to the user
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design: Findings contract, Module boundaries; Scope, Assumptions (round boundaries, severity, prompts unchanged). Rule G resolves templates/execute-parent-task.md against disk."
    gotcha: "Write test-gate hyphenated and test_gate keys only (Rule E). Do not write the pinned phrase 'A suite runs in one place only'. Tasks 3.2 to 3.4 quote this section's heading, so it must read exactly '## The test-gate loop'."
    verify:
      - "grep -c '^## The test-gate loop$' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'After 2 fix rounds' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'test-gate failure: pre-existing' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/SKILL.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the Talking to the user heading"
      - "The section covers the baseline, recording, fix rounds, pre-existing failures and the cap"
      - "The findings carry the plan's location, scenario, severity, confidence and marker"
      - "The section carries a No script can check note"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 3.2 Exclude a failed test-gate task from hard rule 7's halt
    ```yaml
    description: "Append to hard rule 7 in skills/flowcharge/SKILL.md that a failed test-gate task enters The test-gate loop instead of halting the run."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
           completed, what failed and why, and what was not run. Do not improvise a fix, do
           not skip ahead.
        =======
           completed, what failed and why, and what was not run. Do not improvise a fix, do
           not skip ahead. A failed test-gate task is not such a failure: it enters "The
           test-gate loop", which halts the run itself at its cap.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Key flows, The test-gate loop."
    gotcha: "Keep the three-space continuation indent of the numbered rule."
    verify:
      - "grep -cF 'A failed test-gate task is not such a failure' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/SKILL.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the end of hard rule 7"
      - "The continuation lines keep the rule's three-space indent"
      - "The sentence names The test-gate loop"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 3.3 Add the baseline run to the execute-tasks note
    ```yaml
    description: "Extend the execute-tasks note in skills/flowcharge/SKILL.md's Operations notes so the test-gate task's baseline run follows hard rule 13's check."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
          result into the run's final report, at every tier. Apply hard rule 13 once, before the
          first parent task.
        =======
          result into the run's final report, at every tier. Apply hard rule 13 once, before the
          first parent task, then the test-gate task's baseline run ("The test-gate loop").
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Which run is which."
    gotcha: "Keep the two-space continuation indent of the note."
    verify:
      - "grep -cF \"then the test-gate task's baseline run\" skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/SKILL.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the end of the execute-tasks note"
      - "The baseline run is ordered after hard rule 13's check"
      - "The note names The test-gate loop"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 3.4 State in the commit note that the commit stage runs no suite
    ```yaml
    description: "Append to the commit note in skills/flowcharge/SKILL.md's Operations notes that the commit stage runs no suite, because the test-gate task already ran them."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
          what the run actually produced.
        =======
          what the run actually produced. The commit stage runs no suite: the task list's
          test-gate task already ran them ("The test-gate loop").
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, table row for skills/flowcharge/SKILL.md."
    gotcha: "The SEARCH text is the last line of the commit note and is unique in the file."
    verify:
      - "grep -cF 'The commit stage runs no suite' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/SKILL.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the end of the commit note"
      - "The note names the test-gate task as the one that ran the suites"
      - "The note keeps its two-space continuation indent"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 3.5 Add the fix-list recheck rule to issues-and-tasks
    ```yaml
    description: "Append a paragraph after the Skipped paragraph in skills/flowcharge/templates/issues-and-tasks.md: for findings marked as test-gate failures, task the blocking ones only, list pre-existing ones under Skipped, and end the list with the recheck form instead of the full test-gate task."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks.md
        <<<<<<< SEARCH
        Tasks in this file are executed as written, so a feature that slips in gets built.
        =======
        Tasks in this file are executed as written, so a feature that slips in gets built.

        Where the findings are test-gate failures a run supplied, each marked `test-gate failure: blocking` or `test-gate failure: pre-existing`, author tasks for the blocking ones only, and list each pre-existing one under Skipped as filed but not blocking. That list ends with the recheck form of the test-gate task, per the fc-task-list skill's Test-gate task section, never the full form: its `verify` re-runs only the blocking checks, or the full recorded command where a check cannot run alone.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/issues-and-tasks.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Findings contract and Test-gate task, recheck form. The marker strings must match task 3.1 byte for byte."
    gotcha: "The SEARCH text is the closing sentence of the Skipped paragraph, left intact by task 2.4. Add no brace slot and no bare gate word."
    verify:
      - "grep -cF 'test-gate failure: pre-existing' skills/flowcharge/templates/issues-and-tasks.md  # expect 1; 0 at base_commit"
      - "grep -o '{[a-z_0-9]*}' skills/flowcharge/templates/issues-and-tasks.md | sort -u  # expect {issuelist} {mode} {slug} {stages} {ws_dir} {ws_id}, unchanged"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/templates/issues-and-tasks.md  # expect 0, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly after the Skipped paragraph"
      - "The paragraph tasks blocking failures only"
      - "The paragraph ends the fix list with the recheck form, never the full form"
      - "The template's slot set is unchanged"
      - "The Rule E guard count is still 0"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 4. The done-list check
  ```yaml
  description: "Add the fc-index.mjs --check rule for a done task list's test-gate record, its run-tests.mjs fixture cases and its CONVENTIONS.md entry, in one parent task. Realises PLN-20-c9i9sn stage 4."
  ```

  - [ ] 4.1 Read test_gate and test_gate_result in parseTasks
    ```yaml
    description: "Extend the key match in skills/flowcharge/scripts/fc-index.mjs's parseTasks so each task item carries its test_gate and test_gate_result values."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
            const km = line.match(/^\s+(pattern|verify|checklist):\s*(.*)$/);
            if (km) {
              current.keys.add(km[1]);
              if (km[1] === 'pattern') current.pattern = unquoteScalar(km[2].trim());
            }
        =======
            // test_gate and test_gate_result feed the done-list test-gate check, which
            // takes the last task carrying test_gate as the list's test-gate task.
            const km = line.match(/^\s+(pattern|verify|checklist|test_gate|test_gate_result):\s*(.*)$/);
            if (km) {
              current.keys.add(km[1]);
              if (km[1] === 'pattern') current.pattern = unquoteScalar(km[2].trim());
              if (km[1] === 'test_gate') current.testGate = unquoteScalar(km[2].trim());
              if (km[1] === 'test_gate_result') current.testGateResult = unquoteScalar(km[2].trim());
            }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None; node >= 16 standard library only."
    compatibility: "PLN-20-c9i9sn, Design, Generator check contract. checkMiniTasks reads only verify and checklist from keys, so the two new keys change no mini-shape result."
    gotcha: "The alternation lists test_gate before test_gate_result; the regex backtracks to the longer name because ':' must follow, so both match."
    verify:
      - "grep -cF 'test_gate|test_gate_result' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -cF \"current.testGateResult = unquoteScalar\" skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "Block applied cleanly in parseTasks"
      - "The regex matches both test_gate and test_gate_result"
      - "The pattern handling is unchanged"
      - "No dependency or newer-than-Node-16 API was added"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 4.2 Carry test_commands on the artefact record
    ```yaml
    description: "Add a testCommands field, read from the test_commands frontmatter key, to the artefact record built in skills/flowcharge/scripts/fc-index.mjs's scan loop."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
                tags: fm.tags || [], mode: fm.mode || '', author: fm.author || '',
        =======
                tags: fm.tags || [], mode: fm.mode || '', author: fm.author || '',
                testCommands: fm.test_commands,
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Frontmatter key (task list): parseFrontmatter returns [] for an empty inline array, and only emptiness is read."
    gotcha: "Leave the value undefined when the key is absent; the check keys on fmKeys, not on this field."
    verify:
      - "grep -cF 'testCommands: fm.test_commands,' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "Block applied cleanly in the artefact record literal"
      - "The field reads fm.test_commands"
      - "No other record field changed"
      - "No dependency was added"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 4.3 Add the done-list test-gate check
    ```yaml
    description: "Add the check to skills/flowcharge/scripts/fc-index.mjs's integrity loop, after the all-tasks-checked warning: a done task list carrying test_commands must hold a passed test-gate record, or a not-checked one with test_commands []."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
          if (a.type === 'tasklist' && a.tasks.total > 0 && a.tasks.open === 0 && a.status !== 'done' && a.status !== 'dropped') {
            warnings.push(`${a.id} (${a.file}): all ${a.tasks.total} tasks checked but status is "${a.status}". Close it?`);
          }
        =======
          if (a.type === 'tasklist' && a.tasks.total > 0 && a.tasks.open === 0 && a.status !== 'done' && a.status !== 'dropped') {
            warnings.push(`${a.id} (${a.file}): all ${a.tasks.total} tasks checked but status is "${a.status}". Close it?`);
          }
          // CONVENTIONS.md's test-gate rule. A done list carrying test_commands must
          // hold a passed test-gate record, or a not-checked one where test_commands
          // is []. A list with no test_commands key predates the rule and is skipped,
          // because the rule is forward-only.
          if (a.type === 'tasklist' && a.status === 'done' && a.fmKeys.has('test_commands')) {
            const gate = a.tasks.items.filter((t) => t.testGate).pop();
            const result = gate && gate.testGateResult ? gate.testGateResult : 'missing';
            const noSuite = Array.isArray(a.testCommands) && a.testCommands.length === 0;
            if (!gate) {
              warnings.push(`${a.id} (${a.file}): status is "done" but it has no test-gate task`);
            } else if (result !== 'passed' && !(result === 'not-checked' && noSuite)) {
              warnings.push(`${a.id} (${a.file}): status is "done" but its test-gate record is "${result}": expected passed, or not-checked with test_commands []`);
            }
          }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None; uses the fields tasks 4.1 and 4.2 add."
    compatibility: "PLN-20-c9i9sn, Design, Generator check contract: the two WARN strings byte for byte, pushed to the shared warnings array so --check exits 2."
    gotcha: "The WARN strings must match task 4.4's expectations and task 4.5's CONVENTIONS.md text exactly. Archived done lists are checked too, which the forward-only key keeps harmless."
    verify:
      - "grep -cF 'but it has no test-gate task' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'expected passed, or not-checked with test_commands []' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "Block applied cleanly after the all-tasks-checked warning"
      - "The check runs only on a done task list whose frontmatter carries test_commands"
      - "passed is accepted, and not-checked only with an empty test_commands"
      - "Both WARN strings match the plan's Generator check contract"
      - "No dependency or newer-than-Node-16 API was added"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 4.4 Pin every outcome of the check in run-tests.mjs
    ```yaml
    description: "Insert a done-list test-gate record section of fixture cases in skills/flowcharge/scripts/test/run-tests.mjs, after the mini-shape audit cases: passed, failed, no test-gate task, not-checked with [], not-checked with a non-empty list, no test_commands key, and a list not yet done."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        testCase('clean: an issues target that resolves warns about nothing', () => {
        =======
        // ---- cases: done-list test-gate record --------------------------------------
        // A done task list that carries test_commands must hold a passed test-gate
        // record, or a not-checked one where test_commands is []. The owning
        // workstream is done too in each done case, so no close-it warning joins the
        // expected set.

        const WS1_DONE = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' });
        const withTestCommands = (text, value) => text.replace(/^mode: spec$/m, `mode: spec\ntest_commands: ${value}`);
        const testGateTask = (n, result) =>
          `- [x] ${n}. Test-gate task\n  test_gate: full\n  verify:\n    - "npm test"\n  self_eval:\n    passed: true\n    test_gate_result: ${result}\n`;
        const doneList = (value, tasks) => withTestCommands(tasklist({ id: 'TL-1-abcdef', status: 'done', tasks }), value);
        const testGateRecordWarn = (value) =>
          `TL-1-abcdef (${TL1}): status is "done" but its test-gate record is "${value}": expected passed, or not-checked with test_commands []`;

        testCase('clean: a done list with a passed test-gate record warns about nothing', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: doneList('["npm test"]', [taskLine(1, true), testGateTask(2, 'passed')]),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        testCase('a done list whose test-gate record is failed warns', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: doneList('["npm test"]', [taskLine(1, true), testGateTask(2, 'failed')]),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, [testGateRecordWarn('failed')]);
          });
        });

        testCase('a done list carrying test_commands with no test-gate task warns', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: doneList('["npm test"]', [taskLine(1, true)]),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, [`TL-1-abcdef (${TL1}): status is "done" but it has no test-gate task`]);
          });
        });

        testCase('clean: a done list with test_commands [] and a not-checked test-gate record warns about nothing', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: doneList('[]', [taskLine(1, true), testGateTask(2, 'not-checked')]),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        testCase('a not-checked test-gate record with a non-empty test_commands warns', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: doneList('["npm test"]', [taskLine(1, true), testGateTask(2, 'not-checked')]),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, [testGateRecordWarn('not-checked')]);
          });
        });

        testCase('clean: a done list with no test_commands key predates the test-gate rule and warns about nothing', () => {
          withFixture(baseTree({
            [WS1]: WS1_DONE,
            [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        testCase('clean: a list not yet done is not checked for a test-gate record', () => {
          withFixture(baseTree({
            [TL1]: withTestCommands(tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false), testGateTask(2, 'pending')] }), '["npm test"]'),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        testCase('clean: an issues target that resolves warns about nothing', () => {
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "Existing helpers only: withFixture, baseTree, workstream, tasklist, taskLine, expectWarns, TL1, WS1."
    compatibility: "PLN-20-c9i9sn, Testing strategy, stage 4. The WARN strings must match task 4.3 byte for byte. record() writes 'mode: spec' by default, which withTestCommands anchors on."
    gotcha: "Every done case overrides WS1 with a done workstream, or the generator adds an 'all 1 artefacts closed' warning. The test-gate fixture task carries verify and no checklist or pattern, so the mini-shape audit stays silent."
    verify:
      - "grep -c \"^testCase('.*test-gate\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 7; 0 at base_commit"
      - "grep -cF 'but it has no test-gate task' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "Block applied cleanly before the issues-target case"
      - "Seven cases cover passed, failed, no test-gate task, not-checked with [], not-checked with a list, no key, and not done"
      - "Every done case uses a done workstream"
      - "The expected WARN strings match the fc-index.mjs strings exactly"
      - "Only existing fixture helpers are used"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 4.5 Document test_commands and the done-list rule in CONVENTIONS.md
    ```yaml
    description: "Append to the tasklist bullet in skills/flowcharge/CONVENTIONS.md's additional keys: test_commands, the done-list test-gate record rule, its two WARN strings, and the forward-only exemption."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/CONVENTIONS.md
        <<<<<<< SEARCH
          fc-task-list skill, Runtime detection). The generator checks neither, and an
          absent key reads as `none` and `[]`, because the rule is forward-only.
        =======
          fc-task-list skill, Runtime detection). The generator checks neither, and an
          absent key reads as `none` and `[]`, because the rule is forward-only. Also
          `test_commands: [...]`, the project's own suite commands (see the fc-task-list
          skill, Test commands detection), which only the list's final test-gate task runs.
          A `done` task list carrying `test_commands` must hold a test-gate record of
          `passed`, or `not-checked` where `test_commands` is `[]`. Otherwise `--check` WARNs
          `status is "done" but it has no test-gate task` or `status is "done" but its
          test-gate record is "<value>": expected passed, or not-checked with test_commands []`
          and exits 2. A list with no `test_commands` key predates the rule and is not
          checked, because the rule is forward-only.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/CONVENTIONS.md"
    imports: "None."
    compatibility: "PLN-20-c9i9sn, Design, Generator check contract. DEVELOPMENT.md: a new CONVENTIONS.md rule ships with its fc-index.mjs check and run-tests.mjs case, which tasks 4.3 and 4.4 add in this parent task."
    gotcha: "Write test-gate hyphenated; CONVENTIONS.md's one allowlisted bare gate word must stay the only one. No (CONVENTIONS.md, Section) pointer form is added, so the pointer-resolution case is unaffected."
    verify:
      - "grep -cF 'but it has no test-gate task' skills/flowcharge/CONVENTIONS.md  # expect 1; 0 at base_commit"
      - "grep -cF 'test_commands' skills/flowcharge/CONVENTIONS.md  # expect 5; 0 at base_commit"
      - "grep -cE '(^|[^A-Za-z0-9_-])[Gg]ate(s|d|ways|way)?([^A-Za-z0-9_-]|$)' skills/flowcharge/CONVENTIONS.md  # expect 1, unchanged (Rule E guard)"
    checklist:
      - "Block applied cleanly at the end of the tasklist bullet"
      - "The entry documents test_commands and the done-list rule"
      - "Both WARN strings match the fc-index.mjs strings"
      - "The forward-only exemption is stated"
      - "The Rule E guard count is still 1"
    self_eval:
      passed: false
      failures: []
    ```
