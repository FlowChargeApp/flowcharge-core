# Changelog

All notable changes to the FlowCharge Core suite are recorded here.

The format follows Keep a Changelog, with one deliberate deviation: a release
heading is written as `## X.Y.Z - YYYY-MM-DD`, with no brackets around the
version. `checkSuiteVersion` in `skills/flowcharge/scripts/fc-index.mjs`
matches `^## (\d+\.\d+\.\d+)`, so a bracketed heading would not be read. Do not
add the brackets.

Versions follow Semantic Versioning. There is one FlowCharge Core suite version and every
skill mirrors it. See VERSIONING.md.

## Unreleased

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
