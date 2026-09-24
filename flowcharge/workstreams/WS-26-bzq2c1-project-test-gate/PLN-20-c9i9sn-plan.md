---
id: PLN-20-c9i9sn
type: plan
workstream: WS-26-bzq2c1
slug: project-test-gate
title: "Test-gate task: one fixed owner for the project's suites"
status: ready
created: 2026-09-24
updated: 2026-09-24
author: Anthony Koukoullis
base_commit: 486f241
depends_on: []
links: []
---

# Test-gate task: one fixed owner for the project's suites

## Summary

Every task list ends with one fixed, boilerplate test-gate task that runs the project's own suite commands, recorded in a new `test_commands` frontmatter key, after every other task. A failure is never fixed inline: the orchestrator files it as an issue in a new issue list in the same workstream, runs the existing issues-and-tasks stage, executes the fix list on the same branch, and re-runs the test-gate task, for at most 2 fix rounds. `fc-index.mjs --check` refuses a `done` task list with no passed test-gate record. The approach puts the one canonical definition in the fc-task-list skill, points every other file at it, and replaces every sentence that bans suites or names the user as their runner. It is structural: a fixed task an author adds verbatim and an executor runs by rule, with a script check on the record it leaves, so nothing depends on a model choosing to run tests.

## Scope

Acceptance criteria:

1. (Must) Every task list authored by plan-and-tasks or issues-and-tasks carries `test_commands` (every suite the project names, `[]` when none) and ends with the fixed test-gate task.
2. (Must) The executor runs the test-gate task after every other task, records `passed`, `failed` or `not-checked` (`not-checked` exactly when `test_commands` is `[]`, never a pass), and fixes no failure itself.
3. (Must) Every test-gate failure becomes an issue in a new issue list in the same workstream, and is fixed only by a task list the run executes on the same branch, after which the outer test-gate task runs again.
4. (Must) A fix list carries no full test-gate task and ends with one recheck task that re-runs only the failing checks, or the full recorded command where a check cannot run alone.
5. (Must) A failure that also failed at the baseline is filed as an issue and does not block the run, and the loop halts and reports after 2 fix rounds.
6. (Must) `fc-index.mjs --check` warns and exits 2 for a `done` task list carrying `test_commands` whose test-gate record is neither `passed` nor `not-checked` with `test_commands: []`, and a `run-tests.mjs` case pins each outcome.
7. (Must) `grep -rn --include='*.md' "user's own step" skills` returns nothing, every file that says where a suite runs names the test-gate task, and `run-tests.mjs` pins the new canonical phrase in `fc-task-list/SKILL.md` alone.
8. (Must) Every task other than the test-gate task keeps the `verify` rules, **Measure before you write** and the Verify tiers' Forbidden tier unchanged.

Out of scope: any `ARCHITECTURE.md` review task, any git pre-commit hook, any suite run per parent task, and every file outside the nine the workstream record names. `CHANGELOG.md` and the skills' `metadata.version` stay unchanged; the release process updates them.

Assumptions (the workstream record's ten decisions are confirmed by the user; these readings fill what the record leaves unsettled):

- **Baseline stands for `base_commit`.** Decision 6 needs a result at `base_commit`. The full-form test-gate task runs once before the list's first other task and records which checks fail there. "Fails at `base_commit`" reads as "fails in the tree before this list's first task". A list resumed after a task was already checked has no baseline, and every failure then blocks.
- **A check is one test.** A check is one failing test as the runner's output names it, or the whole command where the output names none, so a new failure inside a command that already failed at the baseline still blocks.
- **A command is recorded only where the project names it.** A `package.json` script, a Makefile target, a command a CI workflow runs, or an equivalent file that names it. A runner's default command that no project file names is not recorded, because decision 1 forbids inventing one.
- **Forward-only check.** A task list with no `test_commands` key predates the rule, and `--check` does not test it. This repository's own convention for new keys is forward-only (CONVENTIONS.md, `runtime` and `plan` `base_commit`), and a required key would warn on every task list already on disk.
- **Pre-existing failures are filed, not fixed.** Decision 6's issues are filed in the round's issue list with a `pre-existing` marker, left untasked, and relayed to the user as open issues.
- **Prompts are unchanged.** A fix round's execute-tasks stage is prompted exactly as hard rule 4 and the prompt policy already define, because the fix list did not exist when the user approved the first execution.
- **Round boundaries.** A fix round is one fix list authored and executed. A passing recheck returns control to the outer test-gate task, after every earlier fix list's still-unchecked recheck task re-runs. A failing recheck starts the next round directly.
- **Finding severity.** A blocking failure is filed at `high`, a pre-existing one at `medium`, both at confidence `confirmed`.
- **Deployment and release.** No production data and no live service: the change is skill prose plus one generator check. Rollback is reverting the four stage commits. The check is forward-only, so no existing tree gains a warning.

## Key flows

**The test-gate loop**: **Actor:** the orchestrator executing a task list. **Preconditions:** the list ends with a full-form test-gate task, and its frontmatter carries `test_commands`. **Main flow:** before the first parent task, the test-gate task's baseline run records the checks that already fail. Every other task executes. The test-gate task runs every command. Any failing check is filed through issues-and-tasks as a finding marked blocking or pre-existing. The fix list (blocking failures only, ending with its recheck task) is validated and executed on the same branch. On a passing recheck, the outer test-gate task runs again. **Outcome:** the outer test-gate task records `passed`, the list closes, and `--check` accepts it. **Edge cases:** `test_commands: []` records `not-checked` and is reported as NOT CHECKED. Only pre-existing failures: they are filed with `issues-only`, and the run goes on. A blocking failure after 2 fix rounds: the run halts under hard rule 7 and reports every failing check, issue and fix list. A resumed list with no baseline: every failure blocks.

## Design

**Vocabulary.** Rule E in `skills/flowcharge/scripts/test/run-tests.mjs` (line 4467, `ruleEMatches`) fails on any bare word `gate` in `skills/**/*.md` that has no allowlist entry. Skill prose therefore writes the concept as the hyphenated `test-gate` ("the test-gate task", "a test-gate failure") and the keys as `test_gate*`. Both clear the matcher's `(?<![\w-])` guard, so no allowlist entry is added. Section headings follow suit (`### Test-gate task`). The record and the workstream keep the user's term "test gate".

**Frontmatter key (task list).** `test_commands`: an inline array of double-quoted command strings, each run from the project root, in the project's own words, for example `["npm test", "npm run test:e2e"]`. `[]` means the project defines no suite. The key is required for a list authored under this rule, and its absence marks a list that predates it. The index parser splits inline arrays on commas, so `fc-index.mjs` reads only whether the array is empty. The executor reads the commands from the file text.

**Test-gate task, full form.** The last top-level adult task, numbered after every other task. Its YAML carries exactly `description`, `test_gate: full`, `implement` (one no-edit step), `verify` (one fixed step: every `test_commands` entry, in order, from the project root, so the task text is identical in every list and the commands live in the frontmatter alone) and `self_eval`, and no `pattern`, `checklist`, `imports`, `compatibility` or `gotcha`. It is exempt from **Measure before you write** and the Forbidden tier, and it sits outside the full-versus-mini shape test.

**Test-gate task, recheck form.** The last task of a list authored to fix test-gate failures, which carries no full form. `test_gate: recheck`, and `verify` names one command per failing check, or the full recorded command where a check cannot run alone.

**The test-gate record** (inside the task's `self_eval`):

| Key | Values | Form |
|---|---|---|
| `passed` | `true` on `passed` or `not-checked`, else `false` | both |
| `test_gate_result` | `pending`, `passed`, `failed`, `not-checked` | both |
| `test_gate_baseline` | `pending`, `unavailable`, or the list of checks that failed at the baseline run (`[]` when none did) | full only |
| `test_gate_failures` | one entry per failing check at the last run: `check` (string), `command` (string), `message` (the runner's failure text, trimmed), `blocking` (boolean: `false` when `check` is in the baseline, else `true`; always `true` in the recheck form) | both |

`passed` means no entry is blocking. The task is marked `[x]` only on `passed` or `not-checked`. This record replaces the Self-evaluation evidence for the task, which carries no checklist.

**Which run is which.** Decided from the file alone, never from a slot, so `execute-parent-task.md` keeps its two slots `{tasklist}` and `{parent_task}` and the stage-file slot case in `run-tests.mjs` (line 5233) still passes. A full-form run while no other top-level task is checked and `test_gate_baseline` is `pending` is the baseline run: it records the baseline and leaves the task unchecked. Any other run is the gate run. It sets a still-`pending` baseline to `unavailable`.

**One owner, one canonical sentence.** The fc-task-list skill's new `### Test-gate task` section is the only definition. Its `verify` bullet (`skills/fc-task-list/SKILL.md:272`) carries the canonical sentence, which contains the phrase `A suite runs in one place only` and which `run-tests.mjs`'s `SINGLE_COPY_PHRASES` pins to `fc-task-list/SKILL.md` alone, in place of the `Never add a test-suite or build command` entry (line 4919). A second entry, `user's own step` with an empty file list, pins that wording deleted from every skill file. Every other file points at the skill's section instead of restating it, as DEVELOPMENT.md's single-copy rule requires:

| File | Required content |
|---|---|
| `skills/fc-task-list/SKILL.md` | the `test_commands` frontmatter example line and key bullet; a `### Test commands detection` section; the rewritten `verify` sentence; a Mini shape exception; a Forbidden-tier exception; the `### Test-gate task` section with both literal forms, the record, the two runs, the never-fix rule and a no-script-can-check note |
| `skills/flowcharge/templates/execute-parent-task.md` | a test-gate bullet placed before the verify, evaluate and mark bullets, which it exempts the task from; the skip rule naming the test-gate task; a Return item for the record |
| `skills/fc-validate/SKILL.md` | the sentence at lines 163-164 naming the executor's static steps and the test-gate task, in place of "The executor runs them"; a paragraph making the test-gate task never a coverage gap, never invented content and never run or judged in Part 3, with only Form applying to it |
| `skills/flowcharge/templates/plan-and-tasks.md` | the `verify` sentence (line 69) excepting the test-gate task; `test_commands` in the frontmatter line; a bullet ending the list with the test-gate task |
| `skills/flowcharge/templates/issues-and-tasks.md` | the `verify` sentence (line 52) excepting the test-gate task; `test_commands` in the frontmatter line (line 39); a paragraph ending the list with the test-gate task; a paragraph for findings marked as test-gate failures: tasks for blocking ones only, pre-existing ones under Skipped, the list ending with the recheck form |
| `skills/flowcharge/SKILL.md` | hard rule 7 excluding a failed test-gate task; the execute-tasks note adding the baseline run; the commit note stating it runs no suite; a `## The test-gate loop` section with a no-script-can-check note |
| `skills/flowcharge/CONVENTIONS.md` | `test_commands` in the `tasklist` keys, the done-list rule, its two WARN strings and the forward-only exemption |
| `skills/flowcharge/scripts/fc-index.mjs` | `parseTasks` reading `test_gate` and `test_gate_result`; the artefact record carrying `testCommands`; the done-list check |
| `skills/flowcharge/scripts/test/run-tests.mjs` | the two pin entries; one fixture case per check outcome |

**Findings contract (orchestrator to issues-and-tasks).** One finding per `test_gate_failures` entry: location is the entry's `command` and `check`, the failure scenario is its `message`, severity is `high` when `blocking` and `medium` when not, confidence is `confirmed`, and the marker is `test-gate failure: blocking` or `test-gate failure: pre-existing`. A pre-existing failure already filed in the workstream is not supplied again. The entries are the validation stage's source material for that issue list.

**Generator check contract.** For every task list with `status: done` whose frontmatter carries the `test_commands` key, the last task carrying a `test_gate` key is its test-gate task. The check emits exactly one of these WARN strings, through the shared `warnings` array, so `--check` exits 2 and the default mode prints it:

- `<id> (<file>): status is "done" but it has no test-gate task`
- `<id> (<file>): status is "done" but its test-gate record is "<value>": expected passed, or not-checked with test_commands []` (`<value>` is `missing` when the task has no `test_gate_result`)

It accepts `passed`, and `not-checked` only when `test_commands` parses to an empty array. `fc-index.mjs` knows those two task keys and the frontmatter key only. It knows nothing of runs, baselines or the loop.

**Module boundaries.** The fc-task-list skill knows the task's shape, record and run rules, and nothing about issue lists or rounds. The executor template knows how to run one test-gate task and return its record. It never files issues or starts a round. The orchestrator knows the loop and reads only the record's fields. The issues-and-tasks template knows the finding marker and the recheck form, and nothing about rounds or the cap.

## Stages

1. **Single owner: the test-gate task contract.** Defines the task, its record and the detection rule in fc-task-list, and in the same commit rewrites every sentence that bans suites or names another runner (executor template, fc-validate, both authoring templates' `verify` sentence) and moves the `run-tests.mjs` pin, so the pinned phrase and its prose never disagree and no two files name different owners. It is first because every later stage builds on its contract. Observable: `grep -rn --include='*.md' "user's own step" skills` is empty and the new phrase is pinned.
2. **Authoring stages record `test_commands` and end every list with the test-gate task.** Makes plan-and-tasks and issues-and-tasks name the key and the closing task explicitly. It follows stage 1 because it points at stage 1's sections. Observable: both templates name `test_commands` and the closing task. Until stage 3 lands, a test-gate failure halts the run under hard rule 7, which is safe.
3. **The record-and-fix loop.** Adds the baseline run, the loop, the cap and the rule 7 exception to the orchestrator, and the fix-list recheck rule to issues-and-tasks. It follows stage 2 because it consumes lists that already end with the test-gate task. Observable: the orchestrator's `## The test-gate loop` section and the fix-list paragraph exist.
4. **The done-list check.** Adds the `fc-index.mjs --check` rule, its `run-tests.mjs` cases and its CONVENTIONS.md entry in one commit, as DEVELOPMENT.md requires of a new CONVENTIONS.md rule. It is last because it checks the record the earlier stages define, and being forward-only it changes nothing until a list carries `test_commands`. Observable: the new fixture cases pass and the existing ones stay green.

## Data & compatibility

No migration. Task lists already on disk carry no `test_commands` key: `--check` ignores them, and the executor finds no test-gate task in them and runs no suite, so their behaviour is unchanged. `parseTasks` gains two optional fields, and `checkMiniTasks` still reads only `verify` and `checklist`, so a test-gate task (with `verify`, no `checklist` and no `pattern`) raises no mini-shape warning. The `execute-parent-task.md` slot set is unchanged. Rollback is reverting the stage commits in reverse order. Each stage leaves the repository consistent on its own, so a partial rollback is also safe.

## Testing strategy

Stage 1: the `SINGLE_COPY_PHRASES` pins (the new phrase in `fc-task-list/SKILL.md` alone, `user's own step` nowhere) and the existing Rule E, G and H and stage-file slot cases, which the hyphenated vocabulary and the unchanged slot set must keep green. Stages 2 and 3: the same existing docs-consistency cases. Stage 4: one fixture case per outcome of the done-list check (passed, failed, no test-gate task, `not-checked` with `[]`, `not-checked` with a non-empty list, no `test_commands` key, and a list not yet `done`). The orchestrator's loop, the baseline run and the never-fix rule are prose no script reads. Each carries a no-script-can-check note in the style of the existing notes (see DEVELOPMENT.md's note on unverifiable rules), and only the record they leave is checked.

## Alternatives considered and rejected

- Classify a failure as pre-existing by re-running it in a temporary `git worktree` at `base_commit`: rejected, because the untracked dependency directories (for example `node_modules`) are absent there, so a real regression would fail "at base" and pass as pre-existing, which is the benchmark failure this work exists to stop.
- Classify it by checking out `base_commit` in place after the run: rejected, because stashing untracked files would remove the task list being executed, and an interrupted checkout risks the run's own work.
- Pass the run phase to the executor as a new `{gate_phase}` slot: rejected, because the file state already decides it, and a new slot changes the Operations table and the stage-file slot case for no gain.
- Allowlist each bare `gate` occurrence under Rule E: rejected, because every new collocation would need its own entry, while `test-gate` and `test_gate*` clear the matcher with none.
- Make `test_commands` a required key in `fc-index.mjs`: rejected, because it would warn on every task list already on disk, against the repository's forward-only convention for new keys.
