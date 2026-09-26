# Changelog

All notable changes to the FlowCharge Core suite are recorded here.

The format follows Keep a Changelog, with one deliberate deviation: a release
heading is written as `## X.Y.Z - YYYY-MM-DD`, with no brackets around the
version. `checkSuiteVersion` in `skills/flowcharge/scripts/fc-index.mjs`
matches `^## (\d+\.\d+\.\d+)`, so a bracketed heading would not be read. Do not
add the brackets.

Versions follow Semantic Versioning. There is one FlowCharge Core suite version and every
skill mirrors it. See VERSIONING.md.

## 0.5.0 - 2026-09-26

### Added

- `test_commands`, an optional task-list frontmatter key listing the test suites
  the project itself defines, `[]` when it defines none. Where it is not `[]`,
  every task list ends with a test-update task, which updates the tests the change
  makes wrong and adds only tests the request asks for, then a test-run task,
  which runs every recorded suite. A test-run failure is filed as an issue and
  fixed through its own task list, never inline, capped at 2 fix rounds. A project
  with no suite gets neither task.
- `fc-index.mjs --check` warns on a `done` task list with a non-empty
  `test_commands` that has no test-update task, no test-run task, or a test-run
  record other than `passed`.
- Only the recorded test-run baseline may classify a failure as non-blocking. An
  agent can no longer override that classification with its own invented recheck
  (a revert, a stash, a rerun outside the normal test entrypoint); a failure it
  believes predates the task list is still recorded as blocking, with its
  reasoning stated, and the fix-and-recheck path decides from there.
- Evidence-based checklist verification for task lists: a `runtime` frontmatter
  key records how the project runs itself (or `none`), detected from disk only,
  and `e2e_tooling` records what's already present. Every checklist item is
  tagged by evidence class — source, runtime, or rendered — and an item whose
  evidence can't be produced is marked `NOT CHECKED` rather than assumed done.
- A rendered-evidence probe may run the project's own recorded build as setup,
  when its `runtime` already needs one, without that build counting as evidence
  itself. Every other use of a build, a full test suite, a deploy, or an install
  as evidence stays forbidden.
- fc-plan-feature states real content decisions — headline copy, hex values,
  layout numbers — directly in the plan whenever a task author would otherwise
  have to invent them, in a new Content specification section, one table per
  artefact. Only production mechanics still defer to tasks.
- The whole pipeline may be started as one separate agent instance (for example,
  running in the background): that agent becomes the one session, every stage
  still runs inline in it, and a prompt the run can't satisfy or waive still
  stops it, since it cannot ask a user.
- `flowcharge/tags.md`, the tag pool, is now created automatically (from every
  tag already in use, plus the two automatic tags) whenever it's missing and a
  run writes files, matching the ID registry's existing self-seeding behavior.

### Changed

- The orchestrator and its four stage templates now run every pipeline stage —
  plan-and-tasks authoring, validation, execution — inline, in the orchestrator's
  own session, with zero subagent spawning, replacing the previous
  one-subagent-per-stage design. Every existing setting keeps its meaning
  unchanged: `task_list_mode`, all three `prompts` tiers, `validate: on/off`, and
  the workstream lease.
- fc-validate replaces its three-class correction boundary with one rule: it
  fixes anything the source or a cited file proves wrong, in place and on its own
  authority, including coverage gaps and invented content, and reports only a
  finding that would be irreversible or whose correct content the source does not
  determine. A fourth check class covers spelling, formatting, YAML and schema
  conformance. A settled open question now hands straight back to the validator
  instead of triggering an orchestrator-mediated re-spawn.
- Stage files no longer carry a briefing. Every stage runs in the orchestrator's
  own session, so no hand-written summary of project-source detail (line numbers,
  quoted fixture content) passes from one stage to the next: each stage reads the
  target project for itself, as its stage file directs.
- Plans and task lists scale to the size of the request: a companion test file
  (`e2e/*`, `*.spec.*`, `*.test.*`) no longer counts as a "second file" when
  judging scale or mini-task eligibility; empty plan sections are omitted rather
  than written as "none"; Requirements is merged into Scope with tier-tagged
  acceptance criteria; Final summary is dropped; the deployment-assumption line
  only appears when the plan actually touches data, an API, or the release path.
- The workstream lease now generates its own random token instead of identifying
  its holder through a harness-specific environment variable, fixing a real
  behavior bug tied to one harness.
- A full test suite no longer counts as the user's step after execution: it runs
  only in the test-run task.
- Every model-, harness-, or tech-stack-specific reference found in a full audit
  of `skills/` is removed (example text naming a specific model, an example
  commit citing a competing harness, a Python-only check command in an otherwise
  Node-based suite).
- 11 contradictions found by a skill-file audit are resolved, and 23 duplicated
  rules/procedures are consolidated into single canonical sources, so a rule is
  stated once and pointed to rather than restated with drift.

## 0.4.0 - 2026-09-18

### Added

- `flowcharge/templates/plan-and-tasks-spec.md` and
  `flowcharge/templates/plan-and-tasks-diff.md`: one merged plan-path template per
  mode, replacing the three that came before. A `{stages}` slot selects which
  artefact a spawn writes, taking one of `plan-only`, `plan-and-tasks` or
  `tasks-only`, so a plan and its task list are authored by a single subagent
  that keeps the codebase knowledge it already built.
- `flowcharge/templates/issues-and-tasks-spec.md` and
  `flowcharge/templates/issues-and-tasks-diff.md`: one merged issue-path template
  per mode, replacing the three that came before. Its `{stages}` slot takes one of
  `issues-only`, `issues-and-tasks` or `tasks-only`, so an issue list and the task
  list that fixes it are authored by a single subagent that keeps the codebase
  knowledge it already built.
- `base_commit` on a plan, an optional frontmatter key holding the short SHA of
  `HEAD` at the moment the plan is authored. It dates the plan's reading of the
  codebase. No script checks it, and a plan that omits it is read as undated.
- `validate: on | off` in `flowcharge/agents.md`, a fourth standing default
  governing whether a run checks its authored artefacts against the source
  they were authored from. `on` is the built-in default. Two new templates,
  `flowcharge/templates/validate-plan-and-tasks.md` and
  `flowcharge/templates/validate-issues-and-tasks.md`, carry the check, one
  per path.

### Changed

- Spec-mode task authoring no longer re-reads every file a plan names. It runs
  `git diff --name-only <the plan's base_commit>..HEAD` and reads again only the
  named files that appear in that output. A plan with no `base_commit` falls back
  to reading all of them, and a file a SEARCH/REPLACE block targets is always read
  first. Diff mode keeps its unconditional read, because every task there carries
  a block.
- `flowcharge/templates/execute-parent-task.md` now branches on the task list's
  `mode` key instead of asserting that every task carries a literal block. A
  `diff`-mode subtask applies its SEARCH/REPLACE block verbatim, with the same
  state test, already-applied test and stale-block abort as before. A `spec`-mode
  subtask derives the edit from its `implement` prose and the anchor it names, and
  aborts when that anchor is absent. A subtask that carries a block follows the
  diff rules whatever the file's `mode` says. A task list authored before this
  change executes unchanged, because a diff-mode list takes exactly the previous
  path.
- Every prompt template's shared context-document block is now a resolved list of
  repo-relative paths, one line per document saying what that document covers and
  when to read it, in place of documents inlined in full into every spawn. The
  harness-specific `@`-prefix file-reference syntax is gone, because
  DEVELOPMENT.md's portability rule forbids depending on one harness's own
  file-reference syntax. The orchestrator resolves that block once per run and
  reuses it verbatim in every spawn of the run.
- Validation is now one pass per run instead of one spawn per authored
  artefact. Under `validate: on`, a single subagent makes two comparisons in a
  fixed order, the source against the upstream artefact first, then the
  upstream artefact against the task list second, and the upstream artefact is
  never edited to agree with the task list. Under `validate: off`, no
  validator is spawned. The announced pipeline line now names the validation
  stage as its own element, and the end-of-run summary reports a validation
  that did not run as `waived`, when the `validate` setting caused the skip,
  or as `missing`, for any other reason, with one numbered `/fc-validate`
  recommendation per affected artefact.

### Removed

- `flowcharge/templates/create-plan.md`,
  `flowcharge/templates/tasks-from-plan-spec.md` and
  `flowcharge/templates/tasks-from-plan-diff.md`, retired in favour of the merged
  pair. Unzipping a release over an existing skill folder leaves these three files
  on disk, because unzipping adds and overwrites but never deletes. README.md's
  instruction to delete the older folder of the same name first applies to this
  release.
- `flowcharge/templates/create-issues.md`,
  `flowcharge/templates/tasks-from-issues-spec.md` and
  `flowcharge/templates/tasks-from-issues-diff.md`, retired in favour of the merged
  issue-path pair. The delete-the-older-folder-first note above applies to these
  three files too.
- `flowcharge/templates/validate-plan.md`, `flowcharge/templates/validate-issues.md`
  and `flowcharge/templates/validate-tasks.md`, retired in favour of the two
  merged validation templates. The delete-the-older-folder-first note above
  applies to these three files too.
- The optional workstream `description` frontmatter key, which restated the
  record's own body and added no fact the body lacked. Removed from
  `skills/flowcharge/CONVENTIONS.md`'s schema, `skills/flowcharge/scripts/fc-index.mjs`'s
  CLI flag, parsing, storage, WARN and board rendering, and
  `skills/flowcharge/SKILL.md` and `skills/flowcharge/templates/kanban-add.md`'s
  authoring guidance. The 12 workstream records in this repo that carried the
  key had it migrated out of their frontmatter.

### Fixed

- The `{{briefing}}` placeholder text in the plan-and-tasks, issues-and-tasks
  and execute-parent-task templates told the orchestrator to include detail a
  subagent can already discover for itself (the codebase parts a task
  touches, or the contents of an artefact the subagent is separately told to
  read in full), contradicting that same placeholder's own instruction to
  include only what the subagent "cannot discover for itself." Removed the
  redundant clauses from all five templates. `SKILL.md`'s "Filling a
  template" step 4 carried the same problem, licensing a briefing to draw
  facts from "the repo" generally; narrowed to files under `flowcharge/`,
  with an explicit exception for the `{{context docs}}` block it also
  governs, which still needs to check the project root.

## 0.3.0 - 2026-09-16

### Added

- `fc-index.mjs` gains an `--init` mode: create `flowcharge/workstreams/`
  (and, transitively, `flowcharge/`) when it does not already exist, then
  regenerate `index.md`/`kanban.md` in the same run, so a caller with no
  `flowcharge/` tree yet can produce one and its empty views in a single
  command.

## 0.2.0 - 2026-09-13

### Added

- A plan is now checked against the concrete scenario or failure case its
  workstream record names as the reason the work is needed, before tasks are
  authored from it.
- execute-tasks now checks a task list's `base_commit` or `updated` date
  against current `HEAD` before its first parent-task spawn, and reports what
  changed since instead of executing silently against a stale baseline.

### Changed

- Feature branch names now carry their workstream code:
  `feature/<WS-N-SUFFIX>-<slug>`, in place of a bare slug.

### Fixed

- A blanket "go with your recommendations" reply no longer satisfies the
  execute-tasks or commit prompt on its own; the reply must name that stage
  directly to count as an answer.
- The frontmatter parser now unescapes JSON-stringify-escaped quoted scalars,
  so a title or description saved with escaped quotes reads correctly instead
  of keeping the backslashes.
- The required `author` frontmatter key is now instructed everywhere
  CONVENTIONS.md requires it, across the authoring templates and
  `fc-issue-list`'s own schema example.

## 0.1.0 - 2026-09-03

### Added

Initial public release of the FlowCharge Core skill suite: a plain-English,
prompt-driven project-management pipeline for AI coding agents, plus the
tooling that keeps its board and artefacts consistent.

- `skills/flowcharge/`: the orchestrator, its hard rules, the operations
  table, the verbatim prompt templates, and the index/board generator.
- `skills/fc-plan-feature/`: feature planning, with codebase reconnaissance
  and staged plans carrying acceptance criteria and contracts-first design.
- `skills/fc-issue-list/`: issue-list schema, per-issue YAML blocks,
  severities, and cross-linking.
- `skills/fc-task-list/`: task-list schema, spec and diff authoring modes,
  the `base_commit` staleness guard, and self-eval.
- `skills/fc-plain-text-kanban/`: the generated Kanban board, plain-Markdown
  columns and cards derived from workstream frontmatter.
- `skills/fc-validate/`: checks an authored plan, issue list or task list
  against the source it was authored from.
- `skills/fc-git/`: disciplined git operations, commit, branch, merge,
  worktrees, tagging, and recovery.
- `skills/fc-dev-principles/`: an engineering-principles checklist loaded by
  the planning and tasking prompts.
