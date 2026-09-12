---
id: TL-2-1dmeiz
type: tasklist
workstream: WS-5-geob84
slug: unescape-frontmatter-quoted-values
title: "Unescape frontmatter quoted values"
status: ready
created: 2026-09-10
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: [IL-1-8o0id7]
links: []
mode: diff
base_commit: 630bfdd
---

# FlowCharge Tasks

## Unescape frontmatter quoted values

Fixes the two open issues in IL-1-8o0id7: `parseFrontmatter`'s scalar-stripping
line only strips one leading/trailing quote character and never undoes
`JSON.stringify` escaping, so a title or description written by the `--new-ws`
scaffold writer (which does `JSON.stringify` both fields) round-trips with any
embedded quote or backslash still literally escaped everywhere it is read
(ISS-1-j2knwc); the writer refuses control characters, so a control-character
escape reaches a record only by hand-editing. The identical bare quote-strip pattern is
duplicated at three more call sites sharing the same gap — array-element
values in `parseFrontmatter`, `status`/`severity`/`author` in `parseIssues`,
and the `issues:` id list in `parseTasks` (ISS-2-jvahxd). Both issues trace to
one shared bare-strip pattern, so the fix factors a single `unquoteScalar`
helper (JSON.parse a double-quoted value, falling back to the existing
bare-strip on a parse failure, and passing an unquoted value through
unchanged) and calls it from all four sites: task 1 adds the helper and fixes
its own site (ISS-1-j2knwc); task 2's three children reuse the already-added
helper at the three remaining sites (ISS-2-jvahxd).

- [x] 1. Add the unquoteScalar helper and fix parseFrontmatter's scalar branch
  ```yaml
  description: "Undo JSON.stringify escaping on the scalar (non-array) branch of parseFrontmatter by factoring the corrected logic into a small unquoteScalar helper, called at the line 356 site. The array-element branch (line 353) is left untouched by this task — it is fixed by task 2.1, which reuses this helper."
  author: Anthony Koukoullis
  issues: [ISS-1-j2knwc]
  implement:
    - |
      skills/flowcharge/scripts/fc-index.mjs
      <<<<<<< SEARCH
      function parseFrontmatter(text) {
        const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!m) return null;
        const fm = {};
        for (const line of m[1].split(/\r?\n/)) {
          const km = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
          if (!km) continue;
          let v = km[2].trim();
          if (v.startsWith('[')) {
            const inner = v.replace(/^\[/, '').replace(/\]$/, '').trim();
            fm[km[1]] = inner
              ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
              : [];
          } else {
            fm[km[1]] = v.replace(/^["']|["']$/g, '');
          }
        }
        return fm;
      }
      =======
      // Undoes JSON.stringify's escaping on a double-quoted scalar (the only
      // form this file's writers emit) and falls back to the bare quote-strip
      // below when the value is not valid JSON, e.g. a hand-edited value or a
      // single-quoted YAML scalar. An unquoted value is returned unchanged.
      function unquoteScalar(v) {
        if (v.startsWith('"') && v.endsWith('"')) {
          try {
            return JSON.parse(v);
          } catch {
            // not valid JSON (hand-edited or malformed) — fall through to strip
          }
        }
        return v.replace(/^["']|["']$/g, '');
      }

      function parseFrontmatter(text) {
        const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!m) return null;
        const fm = {};
        for (const line of m[1].split(/\r?\n/)) {
          const km = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
          if (!km) continue;
          let v = km[2].trim();
          if (v.startsWith('[')) {
            const inner = v.replace(/^\[/, '').replace(/\]$/, '').trim();
            fm[km[1]] = inner
              ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
              : [];
          } else {
            fm[km[1]] = unquoteScalar(v);
          }
        }
        return fm;
      }
      >>>>>>> REPLACE
  pattern: "skills/flowcharge/scripts/fc-index.mjs — parseFrontmatter and the new unquoteScalar helper only."
  imports: "None. Pure function addition within fc-index.mjs; no new dependency."
  compatibility: "unquoteScalar must keep returning a string for every caller that already expects one (kanban.md card heading/body, --list Title column), including the fallback path for values JSON.parse rejects."
  gotcha: "JSON.parse must only be attempted on a value that both starts and ends with a double quote; a single-quoted or unquoted value must go straight to the bare-strip fallback without a parse attempt, and a double-quoted value that is not valid JSON (e.g. a hand-edited unescaped inner quote) must be caught rather than thrown."
  verify:
    - "node skills/flowcharge/scripts/test/run-tests.mjs — reports 252/252 passed, exit 0, at base_commit 630bfdd; no fixture exercises an embedded quote, backslash, or control character in a quoted scalar (confirmed by grep), so this run alone cannot discriminate the fix — it is the project's own regression suite and must still report 252/252 passed, exit 0, after this task lands."
    - "grep -cF \"function unquoteScalar(v) {\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands."
    - "grep -cF \"fm[km[1]] = unquoteScalar(v);\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands."
  checklist:
    - "unquoteScalar is defined exactly once in fc-index.mjs, immediately above parseFrontmatter."
    - "The scalar (non-array) branch of parseFrontmatter calls unquoteScalar(v) in place of the removed inline bare-strip call."
    - "The array-element branch (line 353 as read at base_commit) is left byte-for-byte unchanged by this task."
    - "unquoteScalar falls back to the original bare quote-strip regex when JSON.parse throws, so a single-quoted or malformed double-quoted value never crashes the generator."
    - "run-tests.mjs still reports 252/252 passed, exit 0, after the change."
  self_eval:
    passed: true
    failures: []
  ```
- [ ] 2. Reuse unquoteScalar at the three remaining duplicated call sites

  ```yaml
  description: "Fix the three call sites named in ISS-2-jvahxd that duplicate the same un-unescaping bare quote-strip pattern, each by calling the unquoteScalar helper task 1 adds. No call site redefines the helper."
  ```

  - [ ] 2.1 parseFrontmatter array-element values
    ```yaml
    description: "Fix the array-element branch of parseFrontmatter (line 353 as read at base_commit) to call unquoteScalar instead of the bare quote-strip."
    author: Anthony Koukoullis
    issues: [ISS-2-jvahxd]
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
              fm[km[1]] = inner
                ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
                : [];
        =======
              fm[km[1]] = inner
                ? inner.split(',').map((s) => unquoteScalar(s.trim())).filter(Boolean)
                : [];
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs — parseFrontmatter's array-value branch only."
    imports: "unquoteScalar, added to fc-index.mjs by task 1; this task must execute after task 1."
    compatibility: "Reuses the existing unquoteScalar helper rather than redefining it, per ISS-2-jvahxd's shared-logic requirement."
    gotcha: "Each array element is trimmed before stripping; the replacement must keep calling .trim() before unquoteScalar so surrounding whitespace around each comma-separated element is still removed."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs — reports 252/252 passed, exit 0, at base_commit 630bfdd; no fixture covers this call site, so the run alone does not discriminate the fix, and must still report 252/252 passed, exit 0, after this task lands."
      - "grep -cF \"unquoteScalar(s.trim())\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands."
    checklist:
      - "The array-element branch calls unquoteScalar(s.trim()) in place of the removed inline bare-strip call."
      - "No second definition of unquoteScalar is introduced by this task."
      - "The trailing .filter(Boolean) is left unchanged, so an empty element is still dropped."
      - "run-tests.mjs still reports 252/252 passed, exit 0, after the change."
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 2.2 parseIssues status/severity/author
    ```yaml
    description: "Fix the status/severity/author assignment lines of parseIssues (lines 377-379 as read at base_commit) to call unquoteScalar instead of the bare quote-strip."
    author: Anthony Koukoullis
    issues: [ISS-2-jvahxd]
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
              if (sm && !issue.status) issue.status = sm[1].replace(/^["']|["']$/g, '');
              if (vm && !issue.severity) issue.severity = vm[1].replace(/^["']|["']$/g, '');
              if (am && !issue.author) issue.author = am[1].trim().replace(/^["']|["']$/g, '');
        =======
              if (sm && !issue.status) issue.status = unquoteScalar(sm[1]);
              if (vm && !issue.severity) issue.severity = unquoteScalar(vm[1]);
              if (am && !issue.author) issue.author = unquoteScalar(am[1].trim());
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs — parseIssues's status/severity/author assignment lines only."
    imports: "unquoteScalar, added to fc-index.mjs by task 1; this task must execute after task 1."
    compatibility: "Reuses the existing unquoteScalar helper rather than redefining it, per ISS-2-jvahxd's shared-logic requirement."
    gotcha: "author is trimmed before stripping (am[1].trim()) while status/severity are not (sm[1]/vm[1] already match \\S+ with no surrounding whitespace); the replacement must preserve that same per-field input expression."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs — reports 252/252 passed, exit 0, at base_commit 630bfdd; no fixture covers this call site, so the run alone does not discriminate the fix, and must still report 252/252 passed, exit 0, after this task lands."
      - "grep -cF \"issue.status = unquoteScalar(sm[1]);\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands."
      - "grep -cF \"issue.author = unquoteScalar(am[1].trim());\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands, confirming the author trim-then-unquote order was preserved."
    checklist:
      - "issue.status, issue.severity, and issue.author each call unquoteScalar with the exact same input expression the removed bare-strip call used (sm[1], vm[1], am[1].trim())."
      - "No second definition of unquoteScalar is introduced by this task."
      - "The surrounding if (sm && !issue.status) / (vm && !issue.severity) / (am && !issue.author) guards are left unchanged."
      - "run-tests.mjs still reports 252/252 passed, exit 0, after the change."
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 2.3 parseTasks issues: id list
    ```yaml
    description: "Fix the issues: id-list loop of parseTasks (line 408 as read at base_commit) to call unquoteScalar instead of the bare quote-strip."
    author: Anthony Koukoullis
    issues: [ISS-2-jvahxd]
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
              for (const id of im[1].split(',')) {
                const v = id.trim().replace(/^["']|["']$/g, '');
                if (v) current.issues.push(v);
              }
        =======
              for (const id of im[1].split(',')) {
                const v = unquoteScalar(id.trim());
                if (v) current.issues.push(v);
              }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs — parseTasks's issues: id-list loop only."
    imports: "unquoteScalar, added to fc-index.mjs by task 1; this task must execute after task 1."
    compatibility: "Reuses the existing unquoteScalar helper rather than redefining it, per ISS-2-jvahxd's shared-logic requirement."
    gotcha: "id.trim() must still run before unquoteScalar, since split(',') leaves surrounding whitespace around each id."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs — reports 252/252 passed, exit 0, at base_commit 630bfdd; no fixture covers this call site, so the run alone does not discriminate the fix, and must still report 252/252 passed, exit 0, after this task lands."
      - "grep -cF \"const v = unquoteScalar(id.trim());\" skills/flowcharge/scripts/fc-index.mjs — returns 0 at base_commit 630bfdd; must return 1 after this task lands."
    checklist:
      - "The loop assigns const v = unquoteScalar(id.trim()) in place of the removed inline bare-strip call."
      - "No second definition of unquoteScalar is introduced by this task."
      - "The if (v) current.issues.push(v) guard is left unchanged, so an empty id is still dropped."
      - "run-tests.mjs still reports 252/252 passed, exit 0, after the change."
    self_eval:
      passed: false
      failures: []
    ```
