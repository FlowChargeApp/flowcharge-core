---
id: TL-25-ber2p8
type: tasklist
workstream: WS-27-diy39h
slug: stage-file-context-load-per-run
title: "Load each stage file once and only the sections a stage needs"
status: ready
created: 2026-10-03
updated: 2026-10-03
author: Anthony Koukoullis
depends_on: [PLN-21-ayjwfl]
links: []
mode: diff
base_commit: 1d1db92
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Load each stage file once and only the sections a stage needs

Implements PLN-21-ayjwfl. Hard rule 1 stops a second read of a file still in context and unchanged; plan-and-tasks loads fc-issue-list only for a plan that names issue IDs; fc-task-list and fc-git each split into a core `SKILL.md` and one sibling file read on demand (`authoring.md`, `operations.md`); the executor stage file points at fc-task-list sections instead of restating them. Every moved sentence is byte-identical in its new file except the pointer wording the plan's Content specification lists.

Each parent task carries the `run-tests.mjs` edits that pin its own change, so the suite passes at every parent-task boundary (PLN-21-ayjwfl, Design, Tests). Every SEARCH text was copied from the file at `base_commit`, or, inside one file, from the REPLACE text of an earlier task in this list; tasks touching one file never overlap. Each `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there, and each one fails there. A `grep -c` that counts zero exits 1, so its pass is the printed `0`. The repository configures no lint or type-check command, so no task carries one.

- [x] 1. Read each file once per session

  ```yaml
  description: "Hard rule 1 stops a second read of a stage file, skill or CONVENTIONS.md that is still in context and unchanged, and plan-and-tasks loads fc-issue-list only when the plan names issue IDs, each pinned by a test case. Realises PLN-21-ayjwfl stage 1 (criteria 1, 2 and 8)."
  ```

  - [x] 1.1 Add the read-once sentence to hard rule 1
    ```yaml
    description: "In skills/flowcharge/SKILL.md, hard rule 1 gains the read-once sentence and its no-script-can-check note (PLN-21-ayjwfl, Content specification, Hard rule 1)."
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - |
        skills/flowcharge/SKILL.md
        <<<<<<< SEARCH
        1. **Stage files are followed as written.** At the start of every stage, Read its
           stage file fresh from this skill's `templates/` directory and follow it exactly:
           every step, in its order, with its emphasis. Read each marked slot as the value
           this run resolved for it. Never paraphrase, trim, reorder, skip, or add a step.
           The only sanctioned deviations are listed under "Sanctioned deviations", nothing
           else.
        =======
        1. **Stage files are followed as written.** At the start of every stage, Read its
           stage file fresh from this skill's `templates/` directory and follow it exactly:
           every step, in its order, with its emphasis. Fresh means read in this session,
           never recalled. A stage file, skill or CONVENTIONS.md already read in full in
           this session is not read again while its full text is still in your context and
           its file is unchanged since that read; when unsure, read it again. Read each
           marked slot as the value this run resolved for it. Never paraphrase, trim,
           reorder, skip, or add a step. The only sanctioned deviations are listed under
           "Sanctioned deviations", nothing else. **No script can check** whether a file
           is read again, because no script reads a run (see DEVELOPMENT.md's note on
           unverifiable rules).
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'is not read again while its full text is still in your context and' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "grep -cF returned 1"
    ```

  - [x] 1.2 Load fc-issue-list only for a plan that names issue IDs
    ```yaml
    description: "In skills/flowcharge/templates/plan-and-tasks.md, the Skills line for fc-issue-list gains its condition (PLN-21-ayjwfl, Content specification)."
    pattern: "skills/flowcharge/templates/plan-and-tasks.md"
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks.md
        <<<<<<< SEARCH
        /fc-issue-list (for the frontmatter conventions it documents)
        =======
        /fc-issue-list, only when the plan names issue IDs
        >>>>>>> REPLACE
    verify:
      - "grep -cxF '/fc-issue-list, only when the plan names issue IDs' skills/flowcharge/templates/plan-and-tasks.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "grep -cxF returned 1"
    ```

  - [x] 1.3 Pin hard rule 1 and the fc-issue-list condition
    ```yaml
    description: "Add a prose-pin case to skills/flowcharge/scripts/test/run-tests.mjs after the hard rule 8 case (PLN-21-ayjwfl, Testing strategy, stage 1)."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          assert.ok(text.includes('You read the target project yourself'), '"Parsing the request" no longer says the orchestrator reads the target project');
        });
        =======
          assert.ok(text.includes('You read the target project yourself'), '"Parsing the request" no longer says the orchestrator reads the target project');
        });

        // Hard rule 1 keeps a file read once per session from being read again, and
        // plan-and-tasks loads fc-issue-list only when the plan names issue IDs. No
        // script reads a run, so these prose pins stand in for both reads.
        testCase('hard rule 1 reads a file once per session, and plan-and-tasks loads fc-issue-list only for issue IDs', () => {
          const rule = fs.readFileSync(FLOWCHARGE_SKILL, 'utf8').replace(/\s+/g, ' ');
          assert.ok(
            rule.includes('is not read again while its full text is still in your context and its file is unchanged since that read; when unsure, read it again.'),
            'hard rule 1 no longer stops a file already read in this session from being read again',
          );
          const stage = fs.readFileSync(path.join(STAGE_FILES_DIR, 'plan-and-tasks.md'), 'utf8');
          const from = stage.indexOf('## Skills');
          const to = stage.indexOf('## Context', from + 1);
          const skills = from === -1 || to === -1 ? '' : stage.slice(from, to);
          assert.ok(skills.trim().length > 0, 'the Skills section could not be sliced out of templates/plan-and-tasks.md');
          assert.ok(
            skills.includes('/fc-issue-list, only when the plan names issue IDs'),
            'templates/plan-and-tasks.md no longer loads fc-issue-list only when the plan names issue IDs',
          );
        });
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'hard rule 1 reads a file once per session' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - result: YES
          measured: "grep -cF returned 1"
    ```

- [ ] 2. fc-task-list core and authoring.md

  ```yaml
  description: "Move the eight authoring-only sections of skills/fc-task-list/SKILL.md, verbatim except pointer wording, into the new skills/fc-task-list/authoring.md, repoint every reader, move the two single-copy pins and pin the split. Realises PLN-21-ayjwfl stage 2 (criteria 3, 4, 7, 8 and 9)."
  ```

  - [ ] 2.1 Create skills/fc-task-list/authoring.md
    ```yaml
    description: "New file: the SEARCH section is empty. It holds the eight moved sections as ## headings, verbatim except pointer wording, and the Divergences prohibition gains the clause from the Rules bullet it absorbs (PLN-21-ayjwfl, Design, fc-task-list split)."
    pattern: "skills/fc-task-list/authoring.md"
    implement:
      - |
        skills/fc-task-list/authoring.md
        <<<<<<< SEARCH
        =======
        # fc-task-list: authoring

        The fc-task-list skill's authoring rules. `SKILL.md` in this folder holds the schema and everything an executor needs; read both before you create a task list, add a task to one, or validate one.

        ## Creating a list and adding a task

        **CRITICAL: "create a task list for X" means CREATE THE FILE, NOT A TASK.**

        When the user says "create a task list for X":

        1. Do NOT add any task to any existing file.
        2. Ask which authoring mode applies (see **Two authoring modes** in SKILL.md).
        3. Create `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md` with the frontmatter, heading, and summary block only (no tasks). Claim its `TL-N-SUFFIX` ID from the registry first (see SKILL.md, File frontmatter). The filename is built from it. If the workstream folder is new, create it with `--new-ws` (CONVENTIONS.md, Creating a workstream).
        4. Tell the user the file was created, with its ID and mode.

        When the user says "add a task to X":

        1. Resolve the file path: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`.
        2. If the file doesn't exist, create it first as above, then add the task.
        3. Resolve the file's mode before authoring the task. The mode determines the form of `implement`.

        ## Runtime detection

        At authoring time, record from disk alone how the project runs itself:

        - `runtime`: a double-quoted command or approach found in a `start`/`dev` script, a Makefile target, a binary entrypoint, or a static-file approach for plain HTML (e.g. `"npm run dev"`, `"make serve"`, `"static: index.html"`); `none` when nothing runs.
        - `e2e_tooling`: browser or e2e tooling already present (a Playwright, Cypress or Puppeteer config or dependency, an existing `e2e/` directory) as an inline array; `[]` when none.

        Detection only: never invent, install or configure anything. These two keys alone decide, for the whole list, whether a probe exists: `runtime: none` allows no probe, and `e2e_tooling: []` allows no `rendered` probe (see **Evidence classes** in SKILL.md). A list with no `runtime` key predates this rule: read it as `none`.

        ## Test commands detection

        At authoring time, record from disk alone, as `test_commands`, every test suite the project defines: an inline array of double-quoted commands, each run from the project root.

        - Record a command only where a project file names it: a build-tool script or target, a CI step, or an equivalent. A runner's default command that no project file names is never recorded.
        - Record every suite (unit, integration, e2e), not one. Leave out a command that only runs other recorded ones, and every lint, type-check or build command.
        - `[]` means the project defines no suite: the list then has no test-update or test-run task.

        Detection only: never invent, install or configure anything. Only the **Test-run task** (SKILL.md) runs these commands. A list with no `test_commands` key predates this rule.

        ## Writing verify steps

        See **Smoke Tests** below for tasks whose output is a class/method with observable state. Each step asserts something specific to the change (a grep, a count, a file-existence check). Add the project's own lint or type-check command alongside, only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent); never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step: it asserts nothing about the task and passes before the change as readily as after. A suite runs in one place only: the list's final test-run task (see **Test-run task** in SKILL.md). **Measure before you write.** Where a step asserts a count, a file's existence, or the presence or absence of a string, run it at `base_commit` before writing it down and record what it actually returned, not what you expect. Where it already passes with nothing changed it does not discriminate: rewrite it until it fails at `base_commit`, or state in the step why it cannot fail there. Rewriting makes the assertion specific to the change; it never deletes the step or weakens what it asserts.

        ## Where the detail sits, by mode

        Both modes use the same schema, but the informational load moves. Filling every key to the same depth in both modes is what makes task files bloat.

        | Key | `spec` | `diff` |
        | --- | --- | --- |
        | `implement` | **Terse.** Intent plus anchor. The executor derives the edit. | **Long.** The block *is* the task. |
        | `imports`, `compatibility`, `gotcha` | **Task-local when a plan backs the list.** Only facts the plan does not state, a few lines each, naming the plan section each extends; a key with nothing to add is omitted, and copying the plan's Design into a task is duplication. **Rich** only when no plan backs the list (e.g. authored from an issue list alone): then these constraints are what let the executor derive a correct edit. | **Terse.** The block already encodes them; restating is duplication. |
        | `checklist` | Outcome-based, "behaviour X holds", "no caller of Y is broken". | Mechanical, "block applied cleanly", "`grep` confirms Z", "type-check clean". |
        | `verify` | May require judgement about the result. | Should be a runnable command with an unambiguous pass/fail. |

        When a plan backs the list, each parent task realises one plan stage, and its child
        tasks are derived from that stage's goal, the plan's Design contracts and Content
        specification values, and its acceptance criteria. The plan carries no per-task
        detail to copy. A list authored
        from an issue list is unaffected.

        ## Divergences

        Record every divergence found while authoring the file in one section named exactly
        `Divergences`. Add no suffix and no artefact ID to the name. The source artefact is
        already in `depends_on`, and the fixed string is what makes the section greppable.

        Give the heading the level `##`, a sibling of the `## Feature Name` heading. Put the
        section last in the file, after the final task line and after any other trailing
        section.

        Write the section only when at least one divergence was found. Omit it entirely when
        nothing diverged. One optional closing sentence may record that every other cited file
        matched the plan.

        Write the entries as an ordered numbered list from 1, one entry per divergence. Open
        each entry with a bold short label, then state in prose:

        1. what the plan assumed,
        2. what the file or the project actually contains, cited by path and by the line or
           short SHA read at authoring time,
        3. the consequence: the tasks affected, or that no task was authored.

        Any task may point at an entry with the literal form `see Divergence N`, from
        `implement`, `gotcha`, `verify`, or `checklist`. Never renumber an entry once it is
        written, because those references are not updated with it.

        Two prohibitions:

        - Never use checkbox syntax in an entry. A `- [ ]` line here is counted as a task by
          the index generator.
        - Record a divergence in this section and nowhere else in the file, not in the feature
          summary, not inline in a task's prose, and not as a bold inline paragraph.

        ## Smoke Tests

        A smoke test is a minimal script that instantiates/calls the changed code with concrete inputs and asserts a concrete expected output/state, proving it runs and does the basic thing, without a full test suite.

        When generating a task that adds/changes a class or method with externally observable state (file written, DB row, API response, computed value), ask the user: *"Add a smoke-test verify step for this task?"* If yes, the `verify` entry must specify, inline, not just "run a smoke test":
        - exact instantiation/call (class, method, args)
        - concrete input values (e.g. temp dir, sample IDs)
        - exact expected output and how to compute it independently of the code under test
        - runtime to execute it with (match the project's actual entrypoint runtime, e.g. `tsx`, not `bun`, if the project runs via `tsx`; verify with the user or codebase if unknown)
        - cleanup step if it writes temp files

        ## Authoring rules

        - Always include a detailed-yet-concise summary of the feature, from the discussion recently conducted about it, to give the section context. It sits under the `## Feature Name` heading, after the frontmatter.
        - Only add tasks that don't already exist in the file.
        - Where the edit authored a new task list, close by offering a standalone `/fc-validate` of it against the plan or issue list it was authored from. Offer this only for a newly authored list, never after a status flip, a checkbox change, or a one-line correction.
        >>>>>>> REPLACE
    verify:
      - "grep -c '^## ' skills/fc-task-list/authoring.md  # expect 8; no such file at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.2 Add the authoring.md pointer and remove the create and add procedures
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, When to use me gains the authoring.md pointer, and Storage loses the create-a-list and add-a-task procedures that 2.1 moved."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        Inside a FlowCharge Core run, the flowcharge stage file answers every question this skill would ask a user (mode, smoke tests); follow it, and do not stop mid-stage to ask.

        ## Content

        ### Storage: workstream folders

        Each workstream keeps ONE task list at: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`, where `{{TL-N-SUFFIX}}` is the file's own frontmatter `id`. If a second, separate list is needed in the same workstream, name it `{{TL-N-SUFFIX}}-tasklist-{{qualifier}}.md` in the same folder. The qualifier stays a tail after the plain name. There are no date buckets and no `_done/` folders. Completion is `status: done` in frontmatter, and the file stays put.

        **Choosing the `{{slug}}`.** The workstream's folder is `{{WS-N-SUFFIX}}-{{slug}}` (for example `WS-4-a3x9k2-scope-service-bug-fixes`); `{{slug}}` stays bare and unprefixed (CONVENTIONS.md, Slugs).

        **CRITICAL: "create a task list for X" means CREATE THE FILE, NOT A TASK.**

        When the user says "create a task list for X":

        1. Do NOT add any task to any existing file.
        2. Ask which authoring mode applies (see **Two authoring modes** below).
        3. Create `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md` with the frontmatter, heading, and summary block only (no tasks). Claim its `TL-N-SUFFIX` ID from the registry first (see Frontmatter). The filename is built from it. If the workstream folder is new, create it with `--new-ws` (CONVENTIONS.md, Creating a workstream).
        4. Tell the user the file was created, with its ID and mode.

        When the user says "add a task to X":

        1. Resolve the file path: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`.
        2. If the file doesn't exist, create it first as above, then add the task.
        3. Resolve the file's mode before authoring the task. The mode determines the form of `implement`.

        =======
        Inside a FlowCharge Core run, the flowcharge stage file answers every question this skill would ask a user (mode, smoke tests); follow it, and do not stop mid-stage to ask.

        **Read `authoring.md` in this skill's folder in full before you create a task list, add a task to one, or validate one.** It holds **Creating a list and adding a task**, **Runtime detection**, **Test commands detection**, **Writing verify steps**, **Where the detail sits, by mode**, **Divergences**, **Smoke Tests** and **Authoring rules**. Executing a task needs only this file.

        ## Content

        ### Storage: workstream folders

        Each workstream keeps ONE task list at: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{TL-N-SUFFIX}}-tasklist.md`, where `{{TL-N-SUFFIX}}` is the file's own frontmatter `id`. If a second, separate list is needed in the same workstream, name it `{{TL-N-SUFFIX}}-tasklist-{{qualifier}}.md` in the same folder. The qualifier stays a tail after the plain name. There are no date buckets and no `_done/` folders. Completion is `status: done` in frontmatter, and the file stays put.

        **Choosing the `{{slug}}`.** The workstream's folder is `{{WS-N-SUFFIX}}-{{slug}}` (for example `WS-4-a3x9k2-scope-service-bug-fixes`); `{{slug}}` stays bare and unprefixed (CONVENTIONS.md, Slugs).

        >>>>>>> REPLACE
    verify:
      - "grep -cF 'CREATE THE FILE, NOT A TASK' skills/fc-task-list/SKILL.md  # expect 0; 1 at base_commit"
      - "grep -cF \"Read \\`authoring.md\\` in this skill's folder in full\" skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.3 Repoint the runtime and test_commands frontmatter bullets
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, the two frontmatter bullets point at authoring.md instead of below."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - `runtime` / `e2e_tooling`: facts about the project, recorded at authoring per **Runtime detection** below, never choices.
        - `test_commands`: the project's own suite commands, recorded at authoring per **Test commands detection** below, never chosen or invented; only the list's **Test-run task** runs them.
        =======
        - `runtime` / `e2e_tooling`: facts about the project, recorded at authoring per **Runtime detection** (authoring.md), never choices.
        - `test_commands`: the project's own suite commands, recorded at authoring per **Test commands detection** (authoring.md), never chosen or invented; only the list's **Test-run task** runs them.
        >>>>>>> REPLACE
    verify:
      - "grep -cF '(authoring.md), never' skills/fc-task-list/SKILL.md  # expect 2; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.4 Remove Runtime detection and Test commands detection from the core
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, delete the two sections 2.1 moved."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Runtime detection

        At authoring time, record from disk alone how the project runs itself:

        - `runtime`: a double-quoted command or approach found in a `start`/`dev` script, a Makefile target, a binary entrypoint, or a static-file approach for plain HTML (e.g. `"npm run dev"`, `"make serve"`, `"static: index.html"`); `none` when nothing runs.
        - `e2e_tooling`: browser or e2e tooling already present (a Playwright, Cypress or Puppeteer config or dependency, an existing `e2e/` directory) as an inline array; `[]` when none.

        Detection only: never invent, install or configure anything. These two keys alone decide, for the whole list, whether a probe exists: `runtime: none` allows no probe, and `e2e_tooling: []` allows no `rendered` probe (see **Evidence classes**). A list with no `runtime` key predates this rule: read it as `none`.

        ### Test commands detection

        At authoring time, record from disk alone, as `test_commands`, every test suite the project defines: an inline array of double-quoted commands, each run from the project root.

        - Record a command only where a project file names it: a build-tool script or target, a CI step, or an equivalent. A runner's default command that no project file names is never recorded.
        - Record every suite (unit, integration, e2e), not one. Leave out a command that only runs other recorded ones, and every lint, type-check or build command.
        - `[]` means the project defines no suite: the list then has no test-update or test-run task.

        Detection only: never invent, install or configure anything. Only the **Test-run task** runs these commands. A list with no `test_commands` key predates this rule.

        ### Two authoring modes: `spec` and `diff`
        =======
        ### Two authoring modes: `spec` and `diff`
        >>>>>>> REPLACE
    verify:
      - "grep -cE '^### (Runtime detection|Test commands detection)$' skills/fc-task-list/SKILL.md  # expect 0; 2 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.5 Remove Divergences from the core
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, delete the Divergences section 2.1 moved. The Task List Format example keeps its fenced ## Divergences sample."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Divergences

        Record every divergence found while authoring the file in one section named exactly
        `Divergences`. Add no suffix and no artefact ID to the name. The source artefact is
        already in `depends_on`, and the fixed string is what makes the section greppable.

        Give the heading the level `##`, a sibling of the `## Feature Name` heading. Put the
        section last in the file, after the final task line and after any other trailing
        section.

        Write the section only when at least one divergence was found. Omit it entirely when
        nothing diverged. One optional closing sentence may record that every other cited file
        matched the plan.

        Write the entries as an ordered numbered list from 1, one entry per divergence. Open
        each entry with a bold short label, then state in prose:

        1. what the plan assumed,
        2. what the file or the project actually contains, cited by path and by the line or
           short SHA read at authoring time,
        3. the consequence: the tasks affected, or that no task was authored.

        Any task may point at an entry with the literal form `see Divergence N`, from
        `implement`, `gotcha`, `verify`, or `checklist`. Never renumber an entry once it is
        written, because those references are not updated with it.

        Two prohibitions:

        - Never use checkbox syntax in an entry. A `- [ ]` line here is counted as a task by
          the index generator.
        - Record a divergence in this section and nowhere else in the file, not in the feature
          summary, and not as a bold inline paragraph.

        ### Metadata Schema
        =======
        ### Metadata Schema
        >>>>>>> REPLACE
    verify:
      - "grep -cx '### Divergences' skills/fc-task-list/SKILL.md  # expect 0; 1 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.6 Cut the verify key to its schema and point at Writing verify steps
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, the verify key keeps its schema sentences and points at Writing verify steps, which 2.1 moved."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - `verify`: **ordered list** of verification steps. The first item is the primary command or tool. Subsequent items are follow-up checks on the output of the previous step (e.g. inspect a value, hit an endpoint, assert a file exists). Steps are executed in sequence. Later steps may depend on earlier ones succeeding. Every step sits in one tier of **Verify tiers** below. See **Smoke Tests** below for tasks whose output is a class/method with observable state. Each step asserts something specific to the change (a grep, a count, a file-existence check). Add the project's own lint or type-check command alongside, only where the project already has one configured (`package.json` scripts, a Makefile, CI config, `pyproject.toml`, `go.mod`, or equivalent); never invent one, and never issue a command against a project whose toolchain does not match it. Never add a test-suite or build command as a verify step: it asserts nothing about the task and passes before the change as readily as after. A suite runs in one place only: the list's final test-run task (see **Test-run task**). **Measure before you write.** Where a step asserts a count, a file's existence, or the presence or absence of a string, run it at `base_commit` before writing it down and record what it actually returned, not what you expect. Where it already passes with nothing changed it does not discriminate: rewrite it until it fails at `base_commit`, or state in the step why it cannot fail there. Rewriting makes the assertion specific to the change; it never deletes the step or weakens what it asserts.
        =======
        - `verify`: **ordered list** of verification steps. The first item is the primary command or tool. Subsequent items are follow-up checks on the output of the previous step (e.g. inspect a value, hit an endpoint, assert a file exists). Steps are executed in sequence. Later steps may depend on earlier ones succeeding. Every step sits in one tier of **Verify tiers** below. How to write them: **Writing verify steps** (authoring.md).
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'How to write them: **Writing verify steps** (authoring.md).' skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.7 Remove Where the detail sits, by mode from the core
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, delete the section and its closing paragraph, which 2.1 moved."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Where the detail sits, by mode

        Both modes use the same schema, but the informational load moves. Filling every key to the same depth in both modes is what makes task files bloat.

        | Key | `spec` | `diff` |
        | --- | --- | --- |
        | `implement` | **Terse.** Intent plus anchor. The executor derives the edit. | **Long.** The block *is* the task. |
        | `imports`, `compatibility`, `gotcha` | **Task-local when a plan backs the list.** Only facts the plan does not state, a few lines each, naming the plan section each extends; a key with nothing to add is omitted, and copying the plan's Design into a task is duplication. **Rich** only when no plan backs the list (e.g. authored from an issue list alone): then these constraints are what let the executor derive a correct edit. | **Terse.** The block already encodes them; restating is duplication. |
        | `checklist` | Outcome-based, "behaviour X holds", "no caller of Y is broken". | Mechanical, "block applied cleanly", "`grep` confirms Z", "type-check clean". |
        | `verify` | May require judgement about the result. | Should be a runnable command with an unambiguous pass/fail. |

        When a plan backs the list, each parent task realises one plan stage, and its child
        tasks are derived from that stage's goal, the plan's Design contracts and Content
        specification values, and its acceptance criteria. The plan carries no per-task
        detail to copy. A list authored
        from an issue list is unaffected.

        ### Mini shape
        =======
        ### Mini shape
        >>>>>>> REPLACE
    verify:
      - "grep -cx '### Where the detail sits, by mode' skills/fc-task-list/SKILL.md  # expect 0; 1 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.8 Repoint the test-run task exemption
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, the Test-run task exemption names Writing verify steps in authoring.md instead of Measure before you write."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        Where `test_commands` is not `[]`, the list ends with one test-run task: the last top-level task, numbered after every other. Add it exactly as written below, predicting no edit. It checks the whole change and detects no single one, so **Measure before you write** and the Forbidden tier do not apply to it, and it takes neither the full nor the mini shape. Every other task keeps both rules.
        =======
        Where `test_commands` is not `[]`, the list ends with one test-run task: the last top-level task, numbered after every other. Add it exactly as written below, predicting no edit. It checks the whole change and detects no single one, so authoring.md's **Writing verify steps** and the Forbidden tier do not apply to it, and it takes neither the full nor the mini shape. Every other task keeps both.
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"so authoring.md's **Writing verify steps** and the Forbidden tier do not apply to it\" skills/fc-task-list/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF 'Measure before you write' skills/fc-task-list/SKILL.md  # expect 0; 2 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.9 Remove Smoke Tests and the first two Rules bullets from the core
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, delete Smoke Tests, the feature-summary bullet (moved by 2.1) and the divergence bullet (absorbed by the Divergences prohibition in 2.1)."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        ### Smoke Tests

        A smoke test is a minimal script that instantiates/calls the changed code with concrete inputs and asserts a concrete expected output/state, proving it runs and does the basic thing, without a full test suite.

        When generating a task that adds/changes a class or method with externally observable state (file written, DB row, API response, computed value), ask the user: *"Add a smoke-test verify step for this task?"* If yes, the `verify` entry must specify, inline, not just "run a smoke test":
        - exact instantiation/call (class, method, args)
        - concrete input values (e.g. temp dir, sample IDs)
        - exact expected output and how to compute it independently of the code under test
        - runtime to execute it with (match the project's actual entrypoint runtime, e.g. `tsx`, not `bun`, if the project runs via `tsx`; verify with the user or codebase if unknown)
        - cleanup step if it writes temp files

        ### Rules

        - Always include a detailed-yet-concise summary of the feature, from the discussion recently conducted about it, to give the section context. It sits under the `## Feature Name` heading, after the frontmatter.
        - Record every authoring-time divergence in the file's `## Divergences` section (see **Divergences** above) and never in the feature summary or inline in a task's prose.
        - **CRITICAL. Task Numbering:**
        =======
        ### Rules

        - **CRITICAL. Task Numbering:**
        >>>>>>> REPLACE
    verify:
      - "grep -cx '### Smoke Tests' skills/fc-task-list/SKILL.md  # expect 0; 1 at base_commit"
      - "grep -cF 'Always include a detailed-yet-concise summary' skills/fc-task-list/SKILL.md  # expect 0; 1 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.10 Remove the two authoring-only Rules bullets from the core
    ```yaml
    description: "In skills/fc-task-list/SKILL.md, delete the only-add-new-tasks bullet and the standalone validation offer, which 2.1 moved."
    pattern: "skills/fc-task-list/SKILL.md"
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - Only add tasks that don't already exist in the file.
        - Mark complete by switching `[ ]` → `[x]`.
        - When every task line is `[x]`, set the frontmatter `status` to `done`. Inside a flowcharge pipeline the orchestrator or `--sync` does this; the execute stage itself changes no frontmatter key but `updated`.
        - Bump the frontmatter `updated` date on every edit, and regenerate the index (command above) after the edit lands.
        - Preserve all existing content, ordering, indentation, and metadata exactly.
        - Never record a model, vendor, product, or tier name in a task file. Mode captures the instruction format; that is the only distinction the file needs.
        - After writing, summarise what was added/updated/completed, and state the mode used.
        - Where the edit authored a new task list, close by offering a standalone `/fc-validate` of it against the plan or issue list it was authored from. Offer this only for a newly authored list, never after a status flip, a checkbox change, or a one-line correction.
        =======
        - Mark complete by switching `[ ]` → `[x]`.
        - When every task line is `[x]`, set the frontmatter `status` to `done`. Inside a flowcharge pipeline the orchestrator or `--sync` does this; the execute stage itself changes no frontmatter key but `updated`.
        - Bump the frontmatter `updated` date on every edit, and regenerate the index (command above) after the edit lands.
        - Preserve all existing content, ordering, indentation, and metadata exactly.
        - Never record a model, vendor, product, or tier name in a task file. Mode captures the instruction format; that is the only distinction the file needs.
        - After writing, summarise what was added/updated/completed, and state the mode used.
        >>>>>>> REPLACE
    verify:
      - "grep -cE 'Only add tasks that|close by offering a standalone' skills/fc-task-list/SKILL.md  # expect 0; 2 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.11 Name authoring.md in plan-and-tasks
    ```yaml
    description: "In skills/flowcharge/templates/plan-and-tasks.md, the fc-task-list Skills line names authoring.md, read in full before Part 2 (PLN-21-ayjwfl, Content specification)."
    pattern: "skills/flowcharge/templates/plan-and-tasks.md"
    implement:
      - |
        skills/flowcharge/templates/plan-and-tasks.md
        <<<<<<< SEARCH
        /fc-task-list
        =======
        /fc-task-list and its `authoring.md`, read in full before Part 2
        >>>>>>> REPLACE
    verify:
      - "grep -cxF '/fc-task-list and its `authoring.md`, read in full before Part 2' skills/flowcharge/templates/plan-and-tasks.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.12 Name authoring.md in issues-and-tasks
    ```yaml
    description: "In skills/flowcharge/templates/issues-and-tasks.md, the fc-task-list Skills line names authoring.md, read in full before Part 2."
    pattern: "skills/flowcharge/templates/issues-and-tasks.md"
    implement:
      - |
        skills/flowcharge/templates/issues-and-tasks.md
        <<<<<<< SEARCH
        /fc-issue-list
        /fc-task-list
        =======
        /fc-issue-list
        /fc-task-list and its `authoring.md`, read in full before Part 2
        >>>>>>> REPLACE
    verify:
      - "grep -cxF '/fc-task-list and its `authoring.md`, read in full before Part 2' skills/flowcharge/templates/issues-and-tasks.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.13 Name authoring.md in fc-validate Form
    ```yaml
    description: "In skills/fc-validate/SKILL.md, the Form class names both fc-task-list files as the task list schema."
    pattern: "skills/fc-validate/SKILL.md"
    implement:
      - |
        skills/fc-validate/SKILL.md
        <<<<<<< SEARCH
          `fc-task-list` for a task list, `fc-issue-list` for an issue list.
        =======
          `fc-task-list` (its `SKILL.md` and `authoring.md`) for a task list, `fc-issue-list`
          for an issue list.
        >>>>>>> REPLACE
    verify:
      - "grep -cF '(its `SKILL.md` and `authoring.md`) for a task list' skills/fc-validate/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.14 Repoint the two CONVENTIONS.md tasklist pointers
    ```yaml
    description: "In skills/flowcharge/CONVENTIONS.md, the Runtime detection and Test commands detection pointers name authoring.md."
    pattern: "skills/flowcharge/CONVENTIONS.md"
    implement:
      - |
        skills/flowcharge/CONVENTIONS.md
        <<<<<<< SEARCH
          fc-task-list skill, Runtime detection). The generator checks neither, and an
          absent key reads as `none` and `[]`, because the rule is forward-only. Also
          `test_commands: [...]`, the project's own suite commands (see the fc-task-list
          skill, Test commands detection), which only the list's final test-run task runs;
        =======
          fc-task-list skill's `authoring.md`, Runtime detection). The generator checks
          neither, and an absent key reads as `none` and `[]`, because the rule is
          forward-only. Also `test_commands: [...]`, the project's own suite commands (see
          the fc-task-list skill's `authoring.md`, Test commands detection), which only the
          list's final test-run task runs;
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"skill's \\`authoring.md\\`, \" skills/flowcharge/CONVENTIONS.md  # expect 2; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.15 Move the two verify-step pins to authoring.md
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, SINGLE_COPY_PHRASES pins Measure before you write and A suite runs in one place only to fc-task-list/authoring.md."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          { phrase: 'Measure before you write', files: ['fc-task-list/SKILL.md'] },
          { phrase: 'A suite runs in one place only', files: ['fc-task-list/SKILL.md'] },
        =======
          { phrase: 'Measure before you write', files: ['fc-task-list/authoring.md'] },
          { phrase: 'A suite runs in one place only', files: ['fc-task-list/authoring.md'] },
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"files: ['fc-task-list/authoring.md']\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 2; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 2.16 Pin the fc-task-list split
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, add the on-demand section block before the LICENSE cases: the onDemandProblems helper, its fixture case and the fc-task-list case (PLN-21-ayjwfl, Design, Tests)."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        // ---- cases: LICENSE presence and agreement ---------------------------------
        =======
        // ---- cases: on-demand skill sections ---------------------------------------
        // A skill whose readers need different parts keeps a core SKILL.md and moves
        // the sections only some readers need into one file beside it. The core names
        // that file, and so does every stage file or skill that must read it. Nothing
        // runs the prose, so a static check pins the split: each moved section is a
        // `## ` heading in its file and no longer a heading in SKILL.md outside a fenced
        // example, SKILL.md names the file, and every listed reader names it too.

        function readSkillText(rel) {
          const full = path.join(SKILLS_ROOT, rel);
          return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
        }

        function onDemandProblems(entries, readText = readSkillText) {
          const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const problems = [];
          for (const e of entries) {
            const core = (readText(`${e.skill}/SKILL.md`) || '').replace(/^(`{3,}).*\n[\s\S]*?^\1[ \t]*$/gm, '');
            const part = readText(`${e.skill}/${e.file}`);
            if (part === null) { problems.push(`${e.skill}/${e.file} does not exist`); continue; }
            if (!core.includes(`\`${e.file}\``)) problems.push(`${e.skill}/SKILL.md does not name ${e.file}`);
            for (const s of e.sections) {
              if (!part.includes(`\n## ${s}\n`)) problems.push(`${e.skill}/${e.file} has no "## ${s}" heading`);
              if (new RegExp(`\\n#+ ${esc(s)}\\n`).test(core)) problems.push(`${e.skill}/SKILL.md still carries a "${s}" heading`);
            }
            for (const r of e.readers) {
              const text = readText(r);
              if (text === null || !text.includes(`\`${e.file}\``)) problems.push(`${r} does not name ${e.skill}'s ${e.file}`);
            }
          }
          return problems;
        }

        const FC_TASK_LIST_AUTHORING = {
          skill: 'fc-task-list',
          file: 'authoring.md',
          sections: [
            'Creating a list and adding a task',
            'Runtime detection',
            'Test commands detection',
            'Writing verify steps',
            'Where the detail sits, by mode',
            'Divergences',
            'Smoke Tests',
            'Authoring rules',
          ],
          readers: ['flowcharge/templates/plan-and-tasks.md', 'flowcharge/templates/issues-and-tasks.md', 'fc-validate/SKILL.md'],
        };

        testCase('the on-demand check flags a missing file, a section left in SKILL.md and a reader that does not name the file', () => {
          const files = {
            's/SKILL.md': 'Read `part.md`.\n### Kept\n### Moved\n```md\n## Fenced\n```\n',
            's/part.md': '# part\n\n## Moved\n',
            'r.md': 'no pointer here',
          };
          const read = (rel) => (rel in files ? files[rel] : null);
          assert.deepStrictEqual(
            onDemandProblems([{ skill: 's', file: 'part.md', sections: ['Moved', 'Fenced'], readers: ['r.md'] }], read),
            ['s/SKILL.md still carries a "Moved" heading', 's/part.md has no "## Fenced" heading', "r.md does not name s's part.md"],
            'the on-demand check missed a section left in SKILL.md or a reader that does not name the file',
          );
          assert.deepStrictEqual(
            onDemandProblems([{ skill: 's', file: 'gone.md', sections: [], readers: [] }], read),
            ['s/gone.md does not exist'],
            'the on-demand check missed a missing file',
          );
        });

        testCase("fc-task-list's authoring sections live only in authoring.md, and every authoring reader names it", () => {
          const problems = onDemandProblems([FC_TASK_LIST_AUTHORING]);
          assert.deepStrictEqual(problems, [], `the fc-task-list split is broken:\n${problems.map((p) => `  skills/${p}`).join('\n')}`);
        });

        // ---- cases: LICENSE presence and agreement ---------------------------------
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"fc-task-list's authoring sections live only in authoring.md\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

- [ ] 3. Executor stage file points instead of restating

  ```yaml
  description: "The mini-subtask and evaluate bullets of skills/flowcharge/templates/execute-parent-task.md point at fc-task-list sections instead of restating them, keeping every sentence those sections do not carry, with single-copy pins. Realises PLN-21-ayjwfl stage 3 (criteria 5, 7, 8 and 9)."
  ```

  - [ ] 3.1 Point the mini-subtask bullet at Self-evaluation and Mini shape
    ```yaml
    description: "In skills/flowcharge/templates/execute-parent-task.md, the mini-subtask bullet keeps its rule and its stop and points at the sections that state promotion and evidence (PLN-21-ayjwfl, Content specification)."
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        - **A mini subtask (`verify`, no `checklist`) is executed from `implement` and `pattern` alone.** If the edit needs a design decision (an approach to choose, a second file, a new dependency), stop: rewrite the subtask into the full shape in the task list file, record a `promoted` entry (`item`, `reason`) in its `self_eval`, then execute the full shape. Its `self_eval.evidence` holds one entry per `verify` step.
        =======
        - **A mini subtask (`verify`, no `checklist`) is executed from `implement` and `pattern` alone.** If the edit needs a design decision, stop and promote it to the full shape, per the fc-task-list skill's Self-evaluation. Its `self_eval.evidence` follows the skill's Mini shape.
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'stop and promote it to the full shape' skills/flowcharge/templates/execute-parent-task.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 3.2 Point the evaluate bullet at Evidence classes and Self-evaluation
    ```yaml
    description: "In skills/flowcharge/templates/execute-parent-task.md, the evaluate bullet points at Evidence classes, Self-evaluation and the Metadata Schema's self_eval key, and keeps the already-applied-subtask sentence."
    pattern: "skills/flowcharge/templates/execute-parent-task.md"
    implement:
      - |
        skills/flowcharge/templates/execute-parent-task.md
        <<<<<<< SEARCH
        - Evaluate every `checklist` item as YES, NO or NOT CHECKED under the skill's Evidence classes: YES only when the step its class needs was actually run; NOT CHECKED only on an `[unverified-by-execution]` item, with the frontmatter fact as its `measured` value, and listed in `self_eval.unverified`; a `[verify N]` item whose probe was not run, gave no measured value, or failed is NO. You never decide that tooling is missing: the frontmatter did. Record one `self_eval.evidence` entry per item, in checklist order (`result`, `measured`), holding the observed value, never "passes"; the entry's position names its item. An already-applied subtask still runs its steps: reading the file is evidence for a `source` item only. For each NO, record `item` (its position), `reason` and `fix` in `self_eval.failures`, apply the fix, and re-check by re-running the item's step, until no item is NO or no further progress is possible.
        =======
        - Evaluate every `checklist` item and record its `self_eval` entries under the skill's Evidence classes and Self-evaluation, in the shape its Metadata Schema gives `self_eval`, fixing and re-checking each NO as Self-evaluation says. An already-applied subtask still runs its steps: reading the file is evidence for a `source` item only.
        >>>>>>> REPLACE
    verify:
      - "grep -cF 'You never decide that tooling is missing' skills/flowcharge/templates/execute-parent-task.md  # expect 0; 1 at base_commit"
      - "test $(cat skills/flowcharge/templates/execute-parent-task.md skills/fc-task-list/SKILL.md | wc -c) -lt $(git show 1d1db92:skills/flowcharge/templates/execute-parent-task.md 1d1db92:skills/fc-task-list/SKILL.md | wc -c) && echo smaller  # expect smaller; no output, the sizes are equal at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 3.3 Pin the executor restatement deleted
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, SINGLE_COPY_PHRASES pins the executor phrase deleted and the fc-task-list phrase to its core."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          { phrase: "user's own step", files: [] },
        =======
          { phrase: "user's own step", files: [] },
          // The executor stage file points at fc-task-list's Evidence classes and
          // Self-evaluation instead of restating them, so its copy is pinned deleted.
          { phrase: 'You never decide that tooling is missing', files: [] },
          { phrase: 'never decides for itself that tooling is missing', files: ['fc-task-list/SKILL.md'] },
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"{ phrase: 'You never decide that tooling is missing', files: [] }\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

- [ ] 4. fc-git core and operations.md

  ```yaml
  description: "Move the six operation sections of skills/fc-git/SKILL.md, verbatim except one pointer, into the new skills/fc-git/operations.md, and pin the split. Realises PLN-21-ayjwfl stage 4 (criteria 6, 7, 8 and 9)."
  ```

  - [ ] 4.1 Create skills/fc-git/operations.md
    ```yaml
    description: "New file: the SEARCH section is empty. It holds the six moved sections as ## headings, verbatim except the tier-list pointer (PLN-21-ayjwfl, Design, fc-git split)."
    pattern: "skills/fc-git/operations.md"
    implement:
      - |
        skills/fc-git/operations.md
        <<<<<<< SEARCH
        =======
        # fc-git: operations

        The fc-git skill's sections for init, merge, rebase, worktrees, stashing, tags and pushing. `SKILL.md` in this folder holds the workflow, the risk tiers and the hard rules, which bind every operation here; read both before any of these operations.

        ## Init (new project)
        ```bash
        git init -b main
        # detect the stack from project files, THEN write .gitignore, THEN first commit
        git add .gitignore <scaffold paths>
        git commit -m "Initial commit"
        ```
        The .gitignore comes before the first commit because committed junk (node_modules,
        build output, .env) pollutes history forever even after later removal. Detect the
        stack from what's actually in the directory (package.json → node; pyproject.toml →
        python; etc.) and write an appropriate .gitignore. Offer remote setup
        (`gh repo create` / `git remote add`). Offer, don't assume; not every project wants
        a remote on day one.

        ## Merging & rebasing
        **The golden rule: rebase local/private history freely; NEVER rewrite history that
        exists on a shared remote.** Rewriting published commits strands everyone who has
        them. Check with `git branch -r --contains <sha>` if unsure whether commits are
        published.

        Before merging: working tree clean (verify, don't assume), target branch current
        (`git fetch` + check ahead/behind). Then:

        ```bash
        git switch main && git pull --ff-only
        git merge --no-ff feature/x        # default when history shows no other convention
        ```

        Merge style: detect the repo's convention from `git log --graph --oneline` (merge
        commits vs squash vs linear) and follow it; when there's no signal, use an explicit
        merge commit (`--no-ff`) so feature boundaries stay visible.

        On conflicts: resolve file-by-file. For anything non-mechanical, show the user both
        sides before choosing. Never resolve a conflict by silently discarding one side's
        logic, and never take "ours"/"theirs" wholesale without showing what the discarded
        side contained. A conflict means two authors changed the same code. Deleting
        one author's work silently causes regressions. After resolving, verify the result
        with the project's own build/type-check if one is available, before declaring the
        merge done.

        Rebase (local-only history, or with confirmation otherwise):
        ```bash
        git rebase main                    # never rebase -i; it's interactive
        ```
        For history editing use non-interactive equivalents (`git commit --amend` for the
        tip, `git rebase --onto` for surgery), and only on unpublished commits.

        ## Worktrees
        Prefer worktrees over stash juggling for parallel work on multiple branches. Each
        branch gets a real directory, nothing is in limbo.

        ```bash
        git worktree add ../<repo-name>-<branch-suffix> <branch>       # existing branch
        git worktree add ../<repo-name>-hotfix -b fix/urgent main      # new branch
        git worktree list
        git worktree remove <path>         # confirm first; check for dirty state before
        ```
        Create them under a consistent sibling path (`../<repo>-<purpose>`). Periodically
        list and offer to clean up stale ones (with confirmation) rather than accumulating
        them.

        ## Stashing
        ```bash
        git stash push -m "WIP: <what and why>"     # never a bare `git stash`
        git stash list                              # surface stashes older than a few days
        git stash pop                               # or `apply` if the stash should survive
        ```
        A bare stash carries no message, so you cannot tell later what it holds. The stash
        is a short-term shelf, not storage. Surface aging stashes when you see them in
        `git stash list`. Anything that must survive deserves a WIP commit on a branch
        instead: commits are on the reflog, named, and pushable; stashes are none of those.

        ## Tags & releases
        ```bash
        git tag -a v1.2.0 -m "Release v1.2.0: <what this release contains>"
        git push origin v1.2.0             # confirm first, outward-facing
        ```
        Always annotated (`-a`), never lightweight. Annotated tags carry author, date, and
        a message stating what the release contains or points to; lightweight tags are bare
        pointers with no context.

        ## Remotes & pushing
        Hosting default: GitHub with the `gh` CLI (`gh repo create`, and `gh pr create`
        after a push when the user wants a PR. That's in scope).

        Before any push, fetch and review divergence:
        ```bash
        git fetch origin
        git status                         # ahead/behind
        git log --oneline @{u}..HEAD       # exactly what would be pushed
        git push -u origin <branch>
        ```

        If a push is rejected, DIAGNOSE. The remote has commits you don't. Fetch, look at
        the divergence, then choose to rebase or merge. Never override a rejection with force.
        `--force-with-lease` is the only permitted force variant, and only after explicit
        confirmation with the reason stated (e.g. "re-pushing a rebased private branch only
        I work on"). Plain `--force` is never used: it overwrites without checking whether
        the remote moved, which is precisely how teammates' commits vanish.

        Protected branches: `main` (and `master` where it's the default). Every push to or
        merge into one is confirm-unless-directly-ordered, per the tier list in SKILL.md.
        >>>>>>> REPLACE
    verify:
      - "grep -c '^## ' skills/fc-git/operations.md  # expect 6; no such file at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 4.2 Replace Init with the operations.md pointer
    ```yaml
    description: "In skills/fc-git/SKILL.md, the Operations catalog opens with the operations.md pointer in place of the Init section 4.1 moved."
    pattern: "skills/fc-git/SKILL.md"
    implement:
      - |
        skills/fc-git/SKILL.md
        <<<<<<< SEARCH
        ## Operations catalog

        ### Init (new project)
        ```bash
        git init -b main
        # detect the stack from project files, THEN write .gitignore, THEN first commit
        git add .gitignore <scaffold paths>
        git commit -m "Initial commit"
        ```
        The .gitignore comes before the first commit because committed junk (node_modules,
        build output, .env) pollutes history forever even after later removal. Detect the
        stack from what's actually in the directory (package.json → node; pyproject.toml →
        python; etc.) and write an appropriate .gitignore. Offer remote setup
        (`gh repo create` / `git remote add`). Offer, don't assume; not every project wants
        a remote on day one.

        ### Committing
        =======
        ## Operations catalog

        **Read `operations.md` in this skill's folder in full before you init a repository, merge, rebase, use a worktree, stash, tag, push, or open a pull request.** It holds **Init (new project)**, **Merging & rebasing**, **Worktrees**, **Stashing**, **Tags & releases** and **Remotes & pushing**. Committing, branching and recovery follow here.

        ### Committing
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"Read \\`operations.md\\` in this skill's folder in full\" skills/fc-git/SKILL.md  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 4.3 Remove the five moved operation sections from the core
    ```yaml
    description: "In skills/fc-git/SKILL.md, delete Merging & rebasing through Remotes & pushing, which 4.1 moved."
    pattern: "skills/fc-git/SKILL.md"
    implement:
      - |
        skills/fc-git/SKILL.md
        <<<<<<< SEARCH
        for an ID.

        ### Merging & rebasing
        **The golden rule: rebase local/private history freely; NEVER rewrite history that
        exists on a shared remote.** Rewriting published commits strands everyone who has
        them. Check with `git branch -r --contains <sha>` if unsure whether commits are
        published.

        Before merging: working tree clean (verify, don't assume), target branch current
        (`git fetch` + check ahead/behind). Then:

        ```bash
        git switch main && git pull --ff-only
        git merge --no-ff feature/x        # default when history shows no other convention
        ```

        Merge style: detect the repo's convention from `git log --graph --oneline` (merge
        commits vs squash vs linear) and follow it; when there's no signal, use an explicit
        merge commit (`--no-ff`) so feature boundaries stay visible.

        On conflicts: resolve file-by-file. For anything non-mechanical, show the user both
        sides before choosing. Never resolve a conflict by silently discarding one side's
        logic, and never take "ours"/"theirs" wholesale without showing what the discarded
        side contained. A conflict means two authors changed the same code. Deleting
        one author's work silently causes regressions. After resolving, verify the result
        with the project's own build/type-check if one is available, before declaring the
        merge done.

        Rebase (local-only history, or with confirmation otherwise):
        ```bash
        git rebase main                    # never rebase -i; it's interactive
        ```
        For history editing use non-interactive equivalents (`git commit --amend` for the
        tip, `git rebase --onto` for surgery), and only on unpublished commits.

        ### Worktrees
        Prefer worktrees over stash juggling for parallel work on multiple branches. Each
        branch gets a real directory, nothing is in limbo.

        ```bash
        git worktree add ../<repo-name>-<branch-suffix> <branch>       # existing branch
        git worktree add ../<repo-name>-hotfix -b fix/urgent main      # new branch
        git worktree list
        git worktree remove <path>         # confirm first; check for dirty state before
        ```
        Create them under a consistent sibling path (`../<repo>-<purpose>`). Periodically
        list and offer to clean up stale ones (with confirmation) rather than accumulating
        them.

        ### Stashing
        ```bash
        git stash push -m "WIP: <what and why>"     # never a bare `git stash`
        git stash list                              # surface stashes older than a few days
        git stash pop                               # or `apply` if the stash should survive
        ```
        A bare stash carries no message, so you cannot tell later what it holds. The stash
        is a short-term shelf, not storage. Surface aging stashes when you see them in
        `git stash list`. Anything that must survive deserves a WIP commit on a branch
        instead: commits are on the reflog, named, and pushable; stashes are none of those.

        ### Tags & releases
        ```bash
        git tag -a v1.2.0 -m "Release v1.2.0: <what this release contains>"
        git push origin v1.2.0             # confirm first, outward-facing
        ```
        Always annotated (`-a`), never lightweight. Annotated tags carry author, date, and
        a message stating what the release contains or points to; lightweight tags are bare
        pointers with no context.

        ### Remotes & pushing
        Hosting default: GitHub with the `gh` CLI (`gh repo create`, and `gh pr create`
        after a push when the user wants a PR. That's in scope).

        Before any push, fetch and review divergence:
        ```bash
        git fetch origin
        git status                         # ahead/behind
        git log --oneline @{u}..HEAD       # exactly what would be pushed
        git push -u origin <branch>
        ```

        If a push is rejected, DIAGNOSE. The remote has commits you don't. Fetch, look at
        the divergence, then choose to rebase or merge. Never override a rejection with force.
        `--force-with-lease` is the only permitted force variant, and only after explicit
        confirmation with the reason stated (e.g. "re-pushing a rebased private branch only
        I work on"). Plain `--force` is never used: it overwrites without checking whether
        the remote moved, which is precisely how teammates' commits vanish.

        Protected branches: `main` (and `master` where it's the default). Every push to or
        merge into one is confirm-unless-directly-ordered, per the tier list.

        ### Recovery & undo
        =======
        for an ID.

        ### Recovery & undo
        >>>>>>> REPLACE
    verify:
      - "grep -cE '^### (Init \\(new project\\)|Merging & rebasing|Worktrees|Stashing|Tags & releases|Remotes & pushing)$' skills/fc-git/SKILL.md  # expect 0; 6 at base_commit"
      - "test $(wc -c < skills/fc-git/SKILL.md) -lt $(git show 1d1db92:skills/fc-git/SKILL.md | wc -c) && echo smaller  # expect smaller; no output, the sizes are equal at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 4.4 Pin the force-push rule to operations.md
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, SINGLE_COPY_PHRASES pins the plain-force rule to fc-git/operations.md."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
          { phrase: "sed -E 's/^WS-", files: [] },
        =======
          { phrase: "sed -E 's/^WS-", files: [] },
          { phrase: 'Plain `--force` is never used', files: ['fc-git/operations.md'] },
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"files: ['fc-git/operations.md']\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

  - [ ] 4.5 Pin the fc-git split
    ```yaml
    description: "In skills/flowcharge/scripts/test/run-tests.mjs, add the fc-git case before the runner, reusing onDemandProblems from 2.16."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        // ---- runner ----------------------------------------------------------------
        =======
        testCase("fc-git's operations sections live only in operations.md, which SKILL.md names", () => {
          const problems = onDemandProblems([
            {
              skill: 'fc-git',
              file: 'operations.md',
              sections: ['Init (new project)', 'Merging & rebasing', 'Worktrees', 'Stashing', 'Tags & releases', 'Remotes & pushing'],
              readers: [],
            },
          ]);
          assert.deepStrictEqual(problems, [], `the fc-git split is broken:\n${problems.map((p) => `  skills/${p}`).join('\n')}`);
        });

        // ---- runner ----------------------------------------------------------------
        >>>>>>> REPLACE
    verify:
      - "grep -cF \"fc-git's operations sections live only in operations.md\" skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    self_eval:
      passed: false
    ```

- [ ] 5. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  implement:
    - "No edit: tasks 1.3, 2.15, 2.16, 3.3, 4.4 and 4.5 already add or move every pin the plan asks for, inside the parent task whose change each pins (PLN-21-ayjwfl, Design, Tests), so no test is left wrong or out of date"
  verify: []
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
