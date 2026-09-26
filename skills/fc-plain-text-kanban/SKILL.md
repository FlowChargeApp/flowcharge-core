---
name: fc-plain-text-kanban
description: Manage the FlowCharge Core kanban board, a generated Obsidian "Plain Text Kanban" markdown file (kanban.md) whose thin cards are derived views of workstream records under flowcharge/. Use this skill whenever the user wants the FlowCharge Core board created, regenerated, read, or a card moved/added/edited. Card moves happen by editing workstream frontmatter status and regenerating, never by hand-editing the board. Also documents the plain-text-kanban plugin format (columns, cards, labels, tabs) for reading boards and for repairs. Part of the FlowCharge Core suite (parallel successor to ak-plain-text-kanban).
metadata:
  version: "0.5.0"
---

# Kanban Manager

Manages `flowcharge/kanban.md`, plain markdown that renders as an interactive
kanban board in Obsidian via the **Plain Text Kanban** plugin
(https://community.obsidian.md/plugins/plain-text-kanban).

**The FlowCharge Core board is a generated view, not a source of truth.** Every card is a thin
pointer to a workstream record at `flowcharge/workstreams/<WS-N-SUFFIX>-<slug>/workstream.md`; the card's column is
that record's frontmatter `status`, its text is the record's body, its `#labels` are the
record's `tags`. The data model is
`<skills-dir>/flowcharge/CONVENTIONS.md`.

## The one rule that replaces most board operations

To change the board, change the workstream records and regenerate:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

- **Move a card** → edit `status` in the workstream's `workstream.md` (enum: `backlog`,
  `ready`, `in-progress`, `done`, `dropped`), bump `updated`, regenerate.
- **Add a card** → create the workstream with `--new-ws` (CONVENTIONS.md, Creating a
  workstream), append the body, regenerate. The record starts at `status: backlog`, so
  the new card appears in the `Backlog` column.
- **Edit a card's title/text/labels** → edit the record's `title`, body, or `tags`,
  regenerate.
- **Clear a tag WARN** → tags are validated against the tag pool in `flowcharge/tags.md` by the index generator; edit the record's `tags` to a defined pool spelling, regenerate.
- **Remove a card** → set the workstream's status to `dropped` (with the reason in the
  body), regenerate. Never delete a workstream folder to clear a card.
- **Complete a board/workstream** → close out the underlying artefacts (tasks `[x]`,
  issues `done`/`dropped`, per their skills), set the workstream `status: done`,
  regenerate.
- **Archive a workstream** → see (CONVENTIONS.md, Archiving); the card moves to the
  hidden `Archive __archived__` column, and unarchiving moves it back.

Never hand-edit `kanban.md` to make any of these changes. If someone (or Obsidian
drag-and-drop) has hand-moved a card, the generator prints a WARN naming the divergence:
frontmatter wins and the board is rewritten. If the drag was the user's real intent,
apply it to the frontmatter first, then regenerate.

## Columns and cards

The generated board has fixed columns mapping the status enum:
`Backlog`, `Ready`, `In Progress`, `Done`, `Dropped __archived__`, and
`Archive __archived__` (the ` __archived__` suffix hides a column from the rendered
board; its cards stay in the file). `Archive` holds workstreams whose folders live
under `flowcharge/archive/`, whatever their terminal status; `Dropped` holds dropped
workstreams not yet archived.

Cards are **thin**. That is by design, and load-bearing. One card is:

A record carrying no `description`:

```
	- ## WS-4-a3x9k2 Fix scope service defects #services #bugfix
		Three defects from the scope-service bug hunt: tier inheritance, a silent catch, a stale cache key.
		→ flowcharge/workstreams/WS-4-a3x9k2-scope-service-bug-fixes/
```

The same card when the record carries a `description`:

```
	- ## WS-4-a3x9k2 Fix scope service defects #services #bugfix
		The scope-service bug hunt filed three defects against tier inheritance, error handling and caching; fix them together, because the cache key change moves the same code path as the inheritance fix.
		Three defects from the scope-service bug hunt: tier inheritance, a silent catch, a stale cache key.
		→ flowcharge/workstreams/WS-4-a3x9k2-scope-service-bug-fixes/
```

The same card when the record also carries a `blocked` reason:

```
	- ## WS-4-a3x9k2 Fix scope service defects #services #bugfix
		**Blocked:** waiting on the vendor API key
		The scope-service bug hunt filed three defects against tier inheritance, error handling and caching; fix them together, because the cache key change moves the same code path as the inheritance fix.
		Three defects from the scope-service bug hunt: tier inheritance, a silent catch, a stale cache key.
		→ flowcharge/workstreams/WS-4-a3x9k2-scope-service-bug-fixes/
```

Title line = `WS-N-SUFFIX` + the record's `title` + `#tags`; body = the record's optional
`blocked` reason first, as a bold `**Blocked:**` line directly under the title line, when
the record carries one, then the record's optional `description`, when the record carries
one, written in full and never truncated,
then the record's body first line (the card shows this one line only, truncated at 200
characters; the rest of the record's body is storage and never reaches the board), then
the author line and a pointer to the
workstream folder. If a card is growing prose (ordering constraints, carve-outs,
execution notes), that content belongs in the workstream record's artefacts and in
`depends_on`, not on the board. The board shows only what exists and where it
stands. The artefacts hold everything else.

## Plugin format (for reading boards and hand repairs)

The file is a nested markdown list; the only thing requiring care is whitespace:
**tabs, not spaces**.

```
<!-- kanban-labels: {"bug":"#e03e3e","feature":"#2f80ed"} -->
- # To Do
	- ## Fix login page #bug
		Some description in **markdown**.
- # In Progress
	- ## Refactor API #feature
		- [x] Extract helpers
		- [ ] Write tests
- # Done
```

- Optional metadata comments at top, the ONLY two the plugin understands:
  `<!-- kanban-labels: {"name":"#hex",...} -->` (label → color; lowercase names: the
  plugin lowercases JSON keys on save and matches labels case-insensitively) and
  `<!-- kanban-swimlanes: [...] -->` (each swimlane is `{"labels":[...]}` only, no
  `name` key; empty array = all labels; `"__no_label__"` matches unlabeled cards).
- **Column**: `- # Title` (zero indent, single `#`). Empty column = header line alone. A
  title ending in ` __archived__` is an archived column, hidden from the board.
- **Card**: `\t- ## Title #label1 #label2` (exactly one literal tab: the parser requires
  it; double `#`). Labels are `#hashtags` anywhere in the title text.
- **Card body** = every line below the card until the next card/column line, at **two
  literal tabs**. Checklist lines are GFM: `\t\t- [ ] Task` / `\t\t- [x] Task`.
- **Purity**: the plugin rewrites the whole file on every save and silently deletes
  anything it doesn't parse: YAML frontmatter, prose between columns, blank lines,
  unknown comments. This is why the board file itself can never be a FlowCharge Core artefact and
  never carries frontmatter: the board must contain ONLY the two metadata comments,
  columns, cards, and bodies. (The generator preserves existing label colors across
  regenerations.)
- **Whitespace**: copy tabs verbatim from a fresh read when building old/new text:
  editors and chat interfaces silently convert tabs to spaces.

Hand edits are legitimate only for **repair** (e.g. the plugin or a merge mangled the
file and the generator can't run) and follow read-first/minimal-unique-match/verify
discipline. After any repair, regenerate to restore the generated view.

## Verify

After regenerating (or repairing), check: card lines have exactly one leading tab, bodies
keep their two-tab indent, headers have zero, metadata JSON is valid. Deterministic
checks:

```bash
# Space-indented structure lines (tabs got converted). Expect no output:
grep -nE '^ +- #' flowcharge/kanban.md
# Card lines with wrong tab count (0 or 2+). Expect no output:
grep -nE '^- ## ' flowcharge/kanban.md; grep -nE $'^\t\t+- ## ' flowcharge/kanban.md
# Metadata JSON parses. Prints "JSON OK" or a JSON parse error:
sed -nE 's/^<!-- kanban-(labels|swimlanes): (.*) -->$/\2/p' flowcharge/kanban.md \
  | node -e "require('fs').readFileSync(0,'utf8').split('\n').filter(l=>l.trim()).forEach(l=>JSON.parse(l));console.log('JSON OK')"
# Board agrees with frontmatter. Expect no WARN lines:
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --check
```
