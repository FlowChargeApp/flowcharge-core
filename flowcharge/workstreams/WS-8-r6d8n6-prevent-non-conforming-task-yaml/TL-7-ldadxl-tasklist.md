---
id: TL-7-ldadxl
type: tasklist
workstream: WS-8-r6d8n6
slug: prevent-non-conforming-task-yaml
title: "Ban YAML block scalars on the seven task-level string fields"
status: dropped
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [PLN-5-7hff4e]
links: []
mode: diff
base_commit: 8bb0105
---

# FlowCharge Tasks

## Ban YAML block scalars on the seven task-level string fields

Implements PLN-5-7hff4e. A FlowCharge Core task list can currently carry a YAML
folded (`>-`) or literal (`|`) block scalar on any of seven task-level fields
(`description`, `pattern`, `imports`, `compatibility`, `gotcha`, `author`, and the
per-task `mode` override) even though `fc-task-list/SKILL.md` states no rule against
it, and this already broke a downstream renderer in a sibling project. Stage 1 adds
a `SCALAR_FIELD_RE` extraction to `fc-index.mjs`'s `parseTasks`, a new `tasklist`-only
WARN loop in its `--check` integrity pass, and two pinned fixture cases in
`run-tests.mjs` (one proving the WARN fires on the folded/literal form, one proving
it stays silent on `implement`'s own `- |` list-item form). Stage 2 states the same
rule in `fc-task-list/SKILL.md` and adds one clarifying sentence to
`tasks-from-issues-spec.md`. Measured at `base_commit` 8bb0105: `node
skills/flowcharge/scripts/test/run-tests.mjs` passes 252/252; `node
skills/flowcharge/scripts/fc-index.mjs --root . --check --no-board` against this
repository's own `flowcharge/` tree prints exactly 9 WARN lines (none about a
block-scalar field, confirmed by `grep -rnE` for the seven-field pattern returning 0
matches today); and `grep -rn '^\s*- |\s*$'` under `flowcharge/workstreams/` returns
exactly 18 matches in the committed tree, all under `implement`. This task list itself
adds 5 more of the same form, so the same command returns 23 in a working tree that
holds it; every one of the 23 sits under `implement`.

- [ ] 1. Generator check, pinned by tests
  ```yaml
  description: "Extend fc-index.mjs's parseTasks/--check pass to WARN on a YAML block-scalar indicator on the seven task-level fields, and pin the behavior with two fixture cases in run-tests.mjs. Realises PLN-5-7hff4e stage 1."
  ```

  - [ ] 1.1 Extract each task's YAML block-scalar fields in parseTasks
    ```yaml
    description: "skills/flowcharge/scripts/fc-index.mjs's parseTasks(text) already tracks the current task and extracts its issues: array. Add a SCALAR_FIELD_RE constant and a mirroring current.scalars array so each task item also carries the block-scalar fields it wrote, per PLN-5-7hff4e's Design section."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
        // Task-tracker lines only: "- [ ] N." (parent/adult), "  - [ ] N.M" (child).
        // Returns the open/total counts the index and --list render, plus one item per
        // task carrying its number as written and the ids of its issues: key. An
        // issues: entry belongs to the last task line seen above it, which is how the
        // key is written in task YAML; an empty array contributes no id.
        function parseTasks(text) {
          let open = 0, total = 0;
          const items = [];
          let current = null;
          for (const line of text.split(/\r?\n/)) {
            const t = line.match(/^- \[( |x)\] (\d+)\./) || line.match(/^\s{2}- \[( |x)\] (\d+\.\d+)/);
            if (t) {
              total++;
              if (/\[ \]/.test(line.slice(0, 8))) open++;
              current = { n: t[2], issues: [] };
              items.push(current);
              continue;
            }
            if (!current) continue;
            const im = line.match(/^\s+issues:\s*\[(.*)\]\s*$/);
            if (im) {
              for (const id of im[1].split(',')) {
                const v = unquoteScalar(id.trim());
                if (v) current.issues.push(v);
              }
            }
          }
          return { open, total, items };
        }
        =======
        // Matches a bare block-scalar indicator ("|", ">", or a chomping/indentation
        // variant like "|-" or ">+2") as the entire value of one of the seven
        // task-level fields fc-task-list/SKILL.md's scalar-style rule governs. The key
        // name anchors at the start of the (whitespace-trimmed) line, so this can never
        // match "implement:" (which carries no value on its own line, only a following
        // "- |" sequence item) and can never match a "- |" / "- >-" sequence-item line
        // (which starts with "-", never with one of these key names).
        const SCALAR_FIELD_RE = /^\s*(description|pattern|imports|compatibility|gotcha|author|mode):\s*([|>][+-]?\d*)\s*$/;

        // Task-tracker lines only: "- [ ] N." (parent/adult), "  - [ ] N.M" (child).
        // Returns the open/total counts the index and --list render, plus one item per
        // task carrying its number as written and the ids of its issues: key. An
        // issues: entry belongs to the last task line seen above it, which is how the
        // key is written in task YAML; an empty array contributes no id.
        function parseTasks(text) {
          let open = 0, total = 0;
          const items = [];
          let current = null;
          for (const line of text.split(/\r?\n/)) {
            const t = line.match(/^- \[( |x)\] (\d+)\./) || line.match(/^\s{2}- \[( |x)\] (\d+\.\d+)/);
            if (t) {
              total++;
              if (/\[ \]/.test(line.slice(0, 8))) open++;
              current = { n: t[2], issues: [], scalars: [] };
              items.push(current);
              continue;
            }
            if (!current) continue;
            const im = line.match(/^\s+issues:\s*\[(.*)\]\s*$/);
            if (im) {
              for (const id of im[1].split(',')) {
                const v = unquoteScalar(id.trim());
                if (v) current.issues.push(v);
              }
            }
            const sm = line.match(SCALAR_FIELD_RE);
            if (sm) current.scalars.push({ key: sm[1], indicator: sm[2] });
          }
          return { open, total, items };
        }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None. Uses only the existing unquoteScalar helper already in scope."
    compatibility: "parseTasks must keep returning { open, total, items } unchanged in shape; each items entry now additionally carries scalars: [] (mirroring the existing issues: []), so every existing caller of a.tasks.items (checkIds's issues cross-reference loop, the --list renderer) keeps working unmodified."
    gotcha: "The SEARCH block is the whole function plus its leading comment, so the block only matches once, at its one real location. The regex must anchor the key name at line-start (after optional leading whitespace) so it never matches a - | or - >- sequence-item line, which starts with a dash, not a key name."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
    checklist:
      - "SCALAR_FIELD_RE is defined as a top-level constant, matching exactly the seven governed field names (description, pattern, imports, compatibility, gotcha, author, mode)"
      - "current.scalars is initialized to [] alongside issues: [] on every task item"
      - "A line matching SCALAR_FIELD_RE while current is set pushes { key, indicator } onto current.scalars"
      - "parseTasks still returns { open, total, items } with open/total counting unchanged"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 252/252 cases passed, unchanged from the base_commit baseline"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 1.2 WARN on every task-level YAML block-scalar field in --check
    ```yaml
    description: "Add a tasklist-only WARN pass over each task's new scalars array to fc-index.mjs's integrity-checks loop, in the same loop that already special-cases a.type === 'tasklist' for the mode enum, per PLN-5-7hff4e's Design section. Depends on task 1.1's current.scalars extraction existing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
          if (a.type === 'tasklist' && a.fmKeys.has('mode') && !TASKLIST_MODES.includes(a.mode)) {
            warnings.push(`${a.id} (${a.file}): mode "${a.mode}" not in enum (expected: ${TASKLIST_MODES.join(', ')})`);
          }
          // A workstream names itself. An absent key is reported by the loop above, so
          // this fires only on a key that is present and wrong.
        =======
          if (a.type === 'tasklist' && a.fmKeys.has('mode') && !TASKLIST_MODES.includes(a.mode)) {
            warnings.push(`${a.id} (${a.file}): mode "${a.mode}" not in enum (expected: ${TASKLIST_MODES.join(', ')})`);
          }
          if (a.type === 'tasklist') {
            for (const t of a.tasks.items) {
              for (const s of t.scalars) {
                warnings.push(`${a.id} (${a.file}) task ${t.n}: "${s.key}" is a YAML block scalar ("${s.indicator}"); use a single-line quoted string instead`);
              }
            }
          }
          // A workstream names itself. An absent key is reported by the loop above, so
          // this fires only on a key that is present and wrong.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "task 1.1's current.scalars extraction on a.tasks.items"
    compatibility: "Every artefact reaching this loop with type 'tasklist' already has a.tasks set unconditionally (fc-index.mjs's directory scan sets a.tasks = parseTasks(text) for every tasklist record before pushing it to artefacts), so no !a.tasks guard is needed here, unlike checkIds's defensive one."
    gotcha: "Uses the exact string style checkIds's own issues: cross-reference warning already uses (\"${a.id} (${a.file}) task ${t.n}: ...\"), per the plan's Design section, so the two per-task WARN families read consistently."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "node skills/flowcharge/scripts/fc-index.mjs --root . --check --no-board"
      - "Confirm the WARN lines match, as a set, exactly the 9 recorded at base_commit 8bb0105: WS-1-qrec54 first-body-line-length, WS-2-3rs9lo first-body-line-length, WS-3-t2lfk1 first-body-line-length, WS-2-3rs9lo tag \"#feature\" not in pool, WS-3-t2lfk1 tag \"#feature\" not in pool, WS-5-geob84 tag \"#issue\" not in pool, WS-6-9sylpm tag \"#feature\" not in pool, WS-7-boovu9 tag \"#issue\" not in pool, and flowcharge/ids/WS-4-bek93i orphan marker; none is a block-scalar-field warning. Two differences are time-dependent and do not count: the day count in the orphan-marker line, and a .lease staleness WARN for this workstream's own folder if its lease is older than 60 minutes at run time. No WARN line may contain the text 'is a YAML block scalar'"
    checklist:
      - "The new WARN loop fires only when a.type === 'tasklist'"
      - "The WARN string matches the plan's exact form: `${a.id} (${a.file}) task ${t.n}: \"${key}\" is a YAML block scalar (\"${indicator}\"); use a single-line quoted string instead`"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 252/252 cases passed, unchanged from the base_commit baseline"
      - "node skills/flowcharge/scripts/fc-index.mjs --root . --check --no-board prints exactly the same 9 WARN lines recorded at base_commit 8bb0105, none of them a block-scalar-field warning (time-dependent differences per the verify step aside): proof the new check false-positives on none of the 23 implement: - | occurrences in the working tree's own task lists (18 in the committed base_commit tree plus 5 in this task list itself)"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 1.3 Pin the folded-form and implement-list-item fixture cases in run-tests.mjs
    ```yaml
    description: "Add the two fixture cases PLN-5-7hff4e's Scope requires: a task list carrying a block scalar on a governed field fires exactly the new WARN, and a task list using implement's own - | list-item form fires none. Depends on tasks 1.1 and 1.2's check existing to pin against."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        testCase('clean: an empty issues array on a task line is not a reference', () => {
          withFixture(baseTree({
            [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskIssues(1, [])] }),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        // ---- cases: leases and the registry header ---------------------------------
        =======
        testCase('clean: an empty issues array on a task line is not a reference', () => {
          withFixture(baseTree({
            [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskIssues(1, [])] }),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        // A task line carrying one governed scalar-style field on its own indented
        // line, the way a task's YAML block would write a folded or literal form.
        const taskScalarField = (n, key, indicator) => `- [ ] ${n}. Fixture task\n  ${key}: ${indicator}\n`;

        testCase('a YAML block scalar on a governed task-level field warns, naming the task, field and indicator', () => {
          withFixture(baseTree({
            [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskScalarField(1, 'description', '>-')] }),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1: "description" is a YAML block scalar (">-"); use a single-line quoted string instead`]);
          });
        });

        testCase(`clean: implement's own "- |" list-item form never fires the scalar-field warning`, () => {
          withFixture(baseTree({
            [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [
              '- [ ] 1. Fixture task\n  implement:\n    - |\n      literal SEARCH/REPLACE content\n',
            ] }),
          }, { TL: 1 }), (dir) => {
            expectWarns(dir, []);
          });
        });

        // ---- cases: leases and the registry header ---------------------------------
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "withFixture, baseTree, tasklist, testCase, expectWarns, and the TL1 constant, all already defined earlier in the file; taskIssues appears only in the SEARCH context, not in the new cases"
    compatibility: "Follows the file's own fixture style exactly: a new task-line builder alongside taskLine/taskIssues, and two testCase() calls asserting via expectWarns the same way every case in this section already does."
    gotcha: "The positive case's expected WARN string must match task 1.2's exact format byte-for-byte, including the quoting around the field name and the indicator. The negative case's implement: - | block must not contain literal text that itself matches one of the seven governed key names, or it would produce a false positive of its own."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
    checklist:
      - "The positive case's tasklist fixture carries a block-scalar indicator on a governed field and expects exactly one WARN line for it"
      - "The negative case's tasklist fixture carries only implement's own - | list-item form and expects zero WARN lines"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 254/254 cases passed (252 at base_commit plus these 2 new pinned cases)"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 2. State the rule
  ```yaml
  description: "Add the scalar-style rule to fc-task-list/SKILL.md and one clarifying sentence to tasks-from-issues-spec.md, so the rule a human reads matches the rule the generator enforces. Realises PLN-5-7hff4e stage 2."
  ```

  - [ ] 2.1 State the scalar-style rule in fc-task-list/SKILL.md's Metadata Schema
    ```yaml
    description: "skills/fc-task-list/SKILL.md's Metadata Schema section lists self_eval, then the 'Parent tasks only have the description key' paragraph. Add the rule paragraph PLN-5-7hff4e's Design specifies between them: the seven governed fields stay single-line double-quoted strings, never a YAML block scalar, with implement's own - | list-item form named as the exception."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/fc-task-list/SKILL.md
        <<<<<<< SEARCH
        - `self_eval`: post-execution evaluation object with:
          - `passed`: boolean, true only if every checklist item passes
          - `failures`: array of failed checklist items, each with `item`, `reason`, and `fix`

        **Parent tasks only have the `description` key.** All other task types (adult, child) have the full set of keys above.
        =======
        - `self_eval`: post-execution evaluation object with:
          - `passed`: boolean, true only if every checklist item passes
          - `failures`: array of failed checklist items, each with `item`, `reason`, and `fix`

        **`description`, `pattern`, `imports`, `compatibility`, `gotcha`, `author`, and a
        per-task `mode` override are always single-line, double-quoted strings.** A YAML
        block scalar (`>-`, `|`, or any chomping/indentation variant) is never used on
        these seven fields. This does not apply to `implement`'s own list items, which
        legitimately use `- |` for literal SEARCH/REPLACE content under `diff` mode and
        under the **Diff-mode staleness guard**.

        **Parent tasks only have the `description` key.** All other task types (adult, child) have the full set of keys above.
        >>>>>>> REPLACE
    pattern: "skills/fc-task-list/SKILL.md"
    imports: "None"
    compatibility: "Placed after the self_eval bullet and before the existing 'Parent tasks only have the description key' paragraph, per PLN-5-7hff4e's Design section, so it sits with the other schema-wide statements about these keys rather than inside one field's own bullet."
    gotcha: "State the implement/- | exception explicitly in the same paragraph, so the new rule cannot be misread as banning implement's own legitimate diff-mode form."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "grep -n 'always single-line, double-quoted strings' skills/fc-task-list/SKILL.md"
    checklist:
      - "The new paragraph names all seven governed fields: description, pattern, imports, compatibility, gotcha, author, and the per-task mode override"
      - "The new paragraph states the implement - | list-item form as the named exception"
      - "The new paragraph sits between the self_eval bullet and the 'Parent tasks only have the description key' paragraph, not inside another bullet"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 254/254 cases passed (252 at base_commit plus the 2 cases task 1.3 pinned; this file is prose only, no fixture case targets it, and the suite's skills/**/*.md consistency cases stay green)"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.2 Add the single-line-string sentence to tasks-from-issues-spec.md
    ```yaml
    description: "skills/flowcharge/templates/tasks-from-issues-spec.md's existing sentence instructing implement terse and imports/compatibility/gotcha rich ends '...because those constraints are what let the executor derive a correct edit.' Add one sentence immediately after it, per PLN-5-7hff4e's Design section: these three fields stay single-line double-quoted strings, never a YAML block scalar, however rich their content."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/templates/tasks-from-issues-spec.md
        <<<<<<< SEARCH
        * Put the informational weight where spec mode wants it: `implement` terse (intent plus anchor: the executor derives the edit), and `imports`, `compatibility` and `gotcha` rich, because those constraints are what let the executor derive a correct edit. Make `checklist` items outcome-based ("behaviour X holds", "no caller of Y is broken"), not mechanical block-applied checks.
        =======
        * Put the informational weight where spec mode wants it: `implement` terse (intent plus anchor: the executor derives the edit), and `imports`, `compatibility` and `gotcha` rich, because those constraints are what let the executor derive a correct edit. These three stay single-line double-quoted strings, never a YAML block scalar, however rich their content. Make `checklist` items outcome-based ("behaviour X holds", "no caller of Y is broken"), not mechanical block-applied checks.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/templates/tasks-from-issues-spec.md"
    imports: "None"
    compatibility: "Matches PLN-5-7hff4e's Scope exactly: this is the one template whose existing 'rich' language could read as inviting a multi-line form; tasks-from-plan-spec.md, tasks-from-plan-diff.md, and tasks-from-issues-diff.md are explicitly out of scope and stay untouched."
    gotcha: "Insert the new sentence inside the same bullet, immediately after the existing sentence and before the checklist sentence that follows it in the same bullet; do not start a new bullet."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "grep -n 'never a YAML block scalar, however rich' skills/flowcharge/templates/tasks-from-issues-spec.md"
    checklist:
      - "The new sentence sits inside the same bullet as the existing 'rich' sentence, immediately after it"
      - "The new sentence names no field other than imports, compatibility, and gotcha"
      - "tasks-from-plan-spec.md, tasks-from-plan-diff.md, and tasks-from-issues-diff.md are left untouched"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 254/254 cases passed (252 at base_commit plus the 2 cases task 1.3 pinned; this file is prose only, no fixture case targets it)"
    self_eval:
      passed: false
      failures: []
    ```

## Dropped

Dropped on 2026-09-13, before execution began (no task was applied). See
WS-8-r6d8n6's own "Dropped" section for the full reasoning: the block-scalar
form this task list would have banned is valid YAML, and the real defect is in
a downstream renderer, already covered by that project's own WS-113-q8fl3u.
