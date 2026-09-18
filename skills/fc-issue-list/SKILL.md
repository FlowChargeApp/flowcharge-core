---
name: fc-issue-list
description: Manage FlowCharge Core issue list files stored as per-workstream Markdown in ./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{IL-N-SUFFIX}}-issuelist.md. Read, create, update, and close issues, understand frontmatter, issue schema, the uniform status enum, severities, global ID allocation from the registry, and rules. Issues are cross-referenced from task files using the `issues` key. Part of the FlowCharge Core suite (parallel successor to ak-issue-list-md).
metadata:
  version: "0.4.0"
---

## What I do

- Read, create, update, and close issues in a FlowCharge Core issue list Markdown file directly
- Enforce frontmatter, issue schema, ID conventions, severity/status rules, and formatting

## When to use me

Use this whenever you need to read, create, update, or close issues in a FlowCharge Core issue list, or understand issue schema, status transitions, severity levels, or the Markdown format.

The FlowCharge Core data model (layout, IDs, frontmatter, status lifecycle, index generation) lives in `<skills-dir>/flowcharge/CONVENTIONS.md`; this skill restates the parts issue lists need. Where they disagree, CONVENTIONS.md wins.

## Content

### Storage: workstream folders

Each workstream keeps ONE issue list at: `./flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/{{IL-N-SUFFIX}}-issuelist.md`, where `{{IL-N-SUFFIX}}` is the file's own frontmatter `id`. If a second, separate list is needed in the same workstream, name it `{{IL-N-SUFFIX}}-issuelist-{{qualifier}}.md` in the same folder. The qualifier stays a tail after the plain name. There are no date buckets and no `_done/` folders. Completion is `status: done` in frontmatter, and the file stays put.

The workstream's folder is `{{WS-N-SUFFIX}}-{{slug}}` (for example `WS-4-a3x9k2-scope-service-bug-fixes`) with `{{slug}}` remaining the bare, unprefixed slug used for collision-checking and reuse. Reuse an existing slug only to continue that workstream; for new work, choose a kebab-case slug describing the *specific* work (`lad-opencode-client-vitest-migration`, not `lad-opencode-client-tests`) and collision-check first with `ls flowcharge/workstreams/ | sed -E 's/^WS-[0-9]+-[0-9a-z]{6}-//'`, because every directory there carries a `WS-N-SUFFIX-` prefix that must be stripped before a slug can match. Never rename or displace another workstream's folder.

If no workstream is specified in a request, consult `index.md` (regenerate it if stale); if it stays undecidable, ask the user. Cross-cutting issues go in a `misc` workstream. Issues that span workstreams are filed under the most relevant one, with all affected areas in the `affected` key.

If the target file does not exist, create it with frontmatter and the heading only (no issues) before adding the first issue. If `flowcharge/` is missing, run `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --init` to create it. If the workstream folder is missing, run `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>"` to create it; a new workstream also needs a `workstream.md` record (see CONVENTIONS.md).

To query across workstreams (e.g. all open issues), read `index.md` (it lists every open issue with severity and file) or grep `flowcharge/workstreams/*/IL-*-issuelist*.md` for `status:` values. Regenerate the index after any edit here:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

### File frontmatter

Every issue list opens with frontmatter. Flat keys and inline arrays only. The index parser depends on it:

```yaml
---
id: IL-3-k9d2s5
type: issuelist
workstream: WS-2-h4t6m8
slug: scope-service-bug-fixes
title: "Scope service bug-hunt findings"
status: ready
created: 2026-07-29
updated: 2026-07-29
author: Ada Lovelace
depends_on: []
links: []
---
```

- `id`: an `IL-N-SUFFIX` claimed from the registry (see Issue IDs below, same procedure, `IL` counter)
- `status`: the uniform enum (below); `ready` when authored, `in-progress` while its issues are being worked, `done` when every issue is `done` or `dropped`
- `updated`: bump on EVERY edit to the file
- `depends_on` / `links`: IDs; ordering constraints are data here, never only prose

### Issue IDs

Issue IDs follow the format `ISS-N-SUFFIX`, where `SUFFIX` is exactly 6 lowercase base-36 characters (`[0-9a-z]{6}`) drawn at claim time. They are globally unique across every issue list in the project, and across independently cloned `flowcharge/` trees.

- Claim IDs by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim ISS [<count>]` and using the printed id(s) verbatim.
- IDs are **permanent**. Never renumber or reuse an ID.
- If the registry is missing, create it per CONVENTIONS.md, seeding each counter with the highest ID found by grepping `flowcharge/` (0 if none).

### Issue statuses: the uniform enum

Issues use a six-state enum, the five-value artefact enum plus `blocked`. See
`<skills-dir>/flowcharge/CONVENTIONS.md` for the artefact set:

- `backlog`: recorded, not yet triaged
- `ready`: triaged and actionable (the equivalent of "open")
- `in-progress`: actively being worked on (a task exists that addresses it)
- `blocked`: cannot proceed; name the blocker in `notes` and, where it is an artefact, in the file's `depends_on`
- `done`: fix implemented and verified; issue is marked `[x]`
- `dropped`: acknowledged but not addressed on purpose (wont-fix); issue is marked `[x]`, with the reason in `notes`

### Severity levels

- `critical`: system unusable, data loss, security vulnerability
- `high`: major feature broken, no workaround
- `medium`: feature partially broken, workaround exists
- `low`: minor issue, cosmetic, or edge case

### Issue List Format

The issue file follows this structure (after the file frontmatter):

````md
# FlowCharge Issue List

- [ ] ISS-1-n3b8x6. Short descriptive title

  ```yaml
  id: ISS-1-n3b8x6
  status: ready
  severity: high
  author: Ada Lovelace
  description: "Clear description of the problem observed"
  steps_to_reproduce:
    - "Step 1"
    - "Step 2"
    - "Step 3"
  expected: "What should happen"
  actual: "What actually happens"
  affected: "Files, modules, routes, or components involved"
  environment: "Runtime, OS, Node version, Docker, etc. if relevant"
  tasks: []
  notes: ""
  ```

- [x] ISS-2-p6z0c9. Short descriptive title (done)
  ```yaml
  id: ISS-2-p6z0c9
  status: done
  severity: medium
  author: Ada Lovelace
  description: "..."
  steps_to_reproduce:
    - "..."
  expected: "..."
  actual: "..."
  affected: "..."
  environment: ""
  tasks: [TL-4-a3x9k2 task 2]
  notes: "Fixed by normalising the JWT expiry field."
  ```
````

### Metadata Schema

Every issue includes an indented YAML block immediately after the issue line. These are the standard keys:

- `id`: the issue ID (e.g. `ISS-1-n3b8x6`). Always present, matches the heading
- `status`: one of `backlog`, `ready`, `in-progress`, `blocked`, `done`, `dropped`
- `severity`: one of `critical`, `high`, `medium`, `low`
- `author`: plaintext name of whoever authored the issue. See **Author attribution** below
- `description`: clear, concise description of the problem
- `steps_to_reproduce`: **ordered list** of steps to reproduce the issue. Use `"N/A"` as a single item if not applicable (e.g. for build-time issues).
- `expected`: what the correct behaviour should be
- `actual`: what actually happens (the symptom)
- `affected`: files, modules, routes, endpoints, or components involved
- `environment`: relevant runtime details (Node version, OS, Docker, browser, etc.). Use `""` if not applicable
- `tasks`: list of task references addressing this issue (e.g. `[TL-4-a3x9k2 task 2]`). Use `[]` if none.
- `notes`: any additional context, workarounds, findings, or resolution summary. Use `""` if none.

### Author attribution

Read the `author` value from the generator when you create an issue, and write the
printed line verbatim:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --whoami
```

The command prints exactly one line and writes nothing. It prints the literal string
`unknown` when `git config user.name` is unset or the call fails, so a missing local
git identity never blocks authoring an issue.

Treat the value as **local attribution, not a verified identity**, sourced from the
machine's own `git config user.name` at authoring time, which is self-reported, can
differ from the account that actually opens a GitHub pull request, and can be blank
or wrong on a misconfigured machine. No `--check` warning exists for a missing or
empty `author`; the field is optional and non-blocking by design.

### Linking issues to tasks

When a task in `fc-task-list` addresses an issue, the task's YAML includes an `issues` key:

```yaml
issues:
  - ISS-1-n3b8x6
  - ISS-4-r8f3l1
```

Conversely, the issue's `tasks` key should be updated to reference the task list ID and task number (`TL-4-a3x9k2 task 2`). Both sides of the link should be kept in sync when creating or updating either record.

### Rules

- **CRITICAL. Issue Numbering:** IDs come from the registry, sequentially and permanently. Never reuse or renumber an ID, and never write an issue without first advancing the registry.
- Checkbox rule: `- [x]` if and only if `status` is `done` or `dropped`; otherwise `- [ ]`.
- Issues are listed in ascending ID-number order (ISS-1-n3b8x6, ISS-2-p6z0c9, ISS-3-q2j5w7, ...). The `N` orders them, the suffix never does.
- Done/dropped issues remain in the file. Never delete them.
- When closing an issue, set `status` to `done` or `dropped`, mark `[x]`, and populate `notes` with a brief resolution summary.
- When a task is created to address an issue, update the issue's `status` to `in-progress` and add the task reference to `tasks`.
- When a task's `self_eval.passed` becomes true for all tasks linked to an issue, update the issue's `status` to `done`.
- When every issue is `done` or `dropped`, set the file's frontmatter `status` to `done`.
- Bump the frontmatter `updated` date on every edit, and regenerate the index (command above) after the edit lands.
- Preserve all existing content, ordering, indentation, and metadata exactly when editing.
- After writing, summarise what was added, updated, or closed.
- Where the edit filed a new issue list, close by offering a standalone `/fc-validate` of it against the findings it was filed from, which are supplied as text rather than as a file. Offer this only for a newly filed list, never after a status flip, a closure, or a one-line correction.

---

## File Operations for Large Issue List Files

### Reading

**Locate an issue** (get line number):

```bash
grep -n "ISS-14-t1k4n8" flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
```

**Read a fixed range** (once you have line numbers):

```bash
sed -n '122,155p' flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
```

**Read an issue to the next issue** (variable-length YAML):

```bash
sed -n '/^- \[.\] ISS-14-t1k4n8\./,/^- \[.\] ISS-15-u7m2p3\./p' flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
```

**Scan all issue status lines:**

```bash
grep -n "^- \[" flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
```

**Read N lines from a known issue line:**

```bash
START=$(grep -n "ISS-14-t1k4n8" file.md | head -1 | cut -d: -f1)
sed -n "${START},$((START+40))p" file.md
```

### Writing (patch)

1. `grep -n` to get line number → `sed -n` to read exact current content → write diff → apply.
2. Always include 3 lines of context above and below changes.
3. Dry-run before applying: `patch -p1 --dry-run < fix.patch`
4. If patch rejects, re-read file (lines may have shifted) and regenerate diff.
5. Never patch a file not re-read since last write in this session.

**Apply inline:**

```bash
patch -p1 <<'EOF'
--- a/flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
+++ b/flowcharge/workstreams/{{WS-N-SUFFIX}}-{{slug}}/IL-3-k9d2s5-issuelist.md
@@ -122,4 +122,4 @@
-- [ ] ISS-14-t1k4n8. Some issue title
+- [x] ISS-14-t1k4n8. Some issue title
EOF
```

**`@@` offset** = line number from `grep -n`.

---

## Housekeeping: Completion & the Index

There is no per-file archive sweep and no `_done/` folder in FlowCharge Core. Files never move individually. (A fully completed workstream may later be archived wholesale, folder and all, to `flowcharge/archive/<slug>/`, an explicit, user-directed act covered by CONVENTIONS.md, not by this skill.) Housekeeping is:

1. **Close out**: when no issue is left outside `done`/`dropped`, set the file's frontmatter `status: done` and bump `updated`.
2. **Regenerate**: run the index generator. Its Attention section is the reconcile report. It flags issue lists with no open issues whose status is not yet `done`, checkbox/status disagreements, registry drift, and items left stale by an `in-progress` status or a `blocked` reason. Closing flagged lists is **your** job under the rules above, confirmed with the user. An issue may legitimately stay open with its task done when the fix was partial.
3. **Never hand-edit** `index.md` or `kanban.md`. They are generated views; frontmatter here is the source of truth.
