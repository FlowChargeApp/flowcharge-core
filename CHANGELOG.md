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
