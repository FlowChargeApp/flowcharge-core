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
