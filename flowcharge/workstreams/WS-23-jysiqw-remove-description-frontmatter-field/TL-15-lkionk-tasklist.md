---
id: TL-15-lkionk
type: tasklist
workstream: WS-23-jysiqw
slug: remove-description-frontmatter-field
title: "Remove the description frontmatter field from workstream records"
status: ready
created: 2026-09-18
updated: 2026-09-18
author: Anthony Koukoullis
depends_on: [PLN-12-k8xy5t]
links: []
mode: diff
base_commit: 3bb00fc
---

# FlowCharge Tasks

## Remove the description frontmatter field from workstream records

Removes the optional `description` workstream frontmatter key end to end, per
`PLN-12-k8xy5t`: the generator's parsing, storage, WARN and board rendering of
it; the generator's own pinning test suite; the schema doc's definition of it;
the two authoring-flow documents that currently tell an agent to write it; and
the 12 workstream records in this repo that currently carry it. Stage 4 closes
with an aggregate check (task 4.3) confirming no `skills/flowcharge/` file
outside the plan's two named exclusions still references the key, since each
stage's own per-file greps confirm only their own file. Ends with
`node skills/flowcharge/scripts/test/run-tests.mjs` passing and zero
`description:` keys left under `flowcharge/workstreams/`.

- [x] 1. Generator (`fc-index.mjs`)

  ```yaml
  description: "Remove --description CLI flag, parsing, storage, WARN and board rendering from the generator"
  ```

  - [x] 1.1 Remove --description from the usage block
    ```yaml
    description: "Drop the --description line from the --help usage synopsis"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the --description token from the --new-ws usage line, per PLN-12-k8xy5t's Design section on the generator's --help block."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The usage synopsis must still read as valid, balanced bracket syntax after the token is removed."
    gotcha: "--tags stays optional and bracketed; only the --description token and its own bracket pair are removed, not the --tags bracket."
    verify:
      - "grep -n -- '--description' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm the usage-line hit is gone. Four hits remain until their own tasks land: the --help body entry (task 1.2), the parseNewWsArgs flag lookup and its die() message (task 1.5), and the scaffold comment (task 1.6)."
    checklist:
      - "The usage synopsis no longer mentions --description."
      - "The --tags bracket is untouched."
      - "No other line in the usage block moved."
      - "The file still parses as valid JavaScript (node --check)."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      node fc-index.mjs [--root <dir>] --new-ws <slug> --title "<title>"
                                        [--description "<text>"] [--tags a,b]
                                        [--status <enum>]
    =======
      node fc-index.mjs [--root <dir>] --new-ws <slug> --title "<title>"
                                        [--tags a,b] [--status <enum>]
    >>>>>>> REPLACE
    ```

  - [x] 1.2 Remove the --description flag's --help body paragraph
    ```yaml
    description: "Delete the --description entry from the --help flags-and-values body text"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the '--description \"<text>\"' flag entry and its four-line explanation from the --help body text, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The --title entry immediately above and the --tags entry immediately below must stay intact and adjacent once this entry is removed."
    gotcha: "The block is a template literal; removing lines must not leave a dangling blank line inconsistent with the block's existing one-entry-per-flag spacing."
    verify:
      - "grep -n -- '--description' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm the --help body entry is gone. Three hits remain until their own tasks land: the parseNewWsArgs flag lookup and its die() message (task 1.5), and the scaffold comment (task 1.6)."
    checklist:
      - "The --description entry and its explanation are gone."
      - "The --title and --tags entries are unchanged and adjacent."
      - "No stray blank line was introduced."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      --title "<title>" The workstream title. Required with --new-ws.
      --description "<text>"
                        A fuller one-line explanation of the request, for
                        --new-ws. Written as the record's description key,
                        and rendered as the card's first body line. The key
                        is omitted when the flag is absent or empty.
                        Default: none.
      --tags a,b        Comma-separated workstream tags for --new-ws.
    =======
      --title "<title>" The workstream title. Required with --new-ws.
      --tags a,b        Comma-separated workstream tags for --new-ws.
    >>>>>>> REPLACE
    ```

  - [x] 1.3 Remove the DESC_MAX constant
    ```yaml
    description: "Delete the DESC_MAX constant and its comment now that no check or writer reads it"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the DESC_MAX constant declaration and its two-line explanatory comment, per PLN-12-k8xy5t's Design section. Task 1.4 removes its only reader in the same parent task."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "CARD_DESC_MAX, the distinct constant for the card's first body line, is a different field and stays untouched."
    gotcha: "Do not confuse DESC_MAX with CARD_DESC_MAX; only the description-key constant is removed."
    verify:
      - "grep -n 'DESC_MAX' skills/flowcharge/scripts/fc-index.mjs | grep -v CARD_DESC_MAX"
      - "Confirm the declaration hit is gone and the only remaining hits are the two lines of task 1.4's WARN check; after both 1.3 and 1.4 land, this command returns zero matches. CARD_DESC_MAX is filtered out because it is a different constant and stays."
    checklist:
      - "DESC_MAX's declaration and comment are gone."
      - "CARD_DESC_MAX and its comment are unchanged."
      - "The line immediately after the deleted block (LEASE_STALE_MINUTES's comment) is unaffected."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
    // The soft cap on a workstream's description key. The board writes the
    // description in full, so a longer one loses nothing. It only crowds the
    // card. The cap is therefore advisory: it is reported, never enforced.
    const DESC_MAX = 1000;
    // A workstream lease held past this many minutes is reported as stale. The
    =======
    // A workstream lease held past this many minutes is reported as stale. The
    >>>>>>> REPLACE
    ```

  - [x] 1.4 Remove the description-length WARN from checkShape
    ```yaml
    description: "Delete the checkShape block that WARNs when a.description exceeds DESC_MAX"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the 'A separate statement...' comment and the a.description.length > DESC_MAX check from checkShape, per PLN-12-k8xy5t's Design section. Run after task 1.3, since this is DESC_MAX's only remaining reader."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The fmKeys-based blocked-key check that follows this block in checkShape is untouched."
    gotcha: "The comment above this block is specific to the description/first-body-line pairing; remove the whole comment, not just the if statement, since it no longer describes anything once description is gone."
    verify:
      - "grep -n 'a.description' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm zero remaining hits."
      - "node skills/flowcharge/scripts/test/run-tests.mjs (expect failures here until task 2 lands; this task's own change is confirmed by the two greps above and node --check)"
    checklist:
      - "The a.description.length WARN and its comment are gone."
      - "The first-body-line WARN immediately above it is unchanged."
      - "The fmKeys/blocked check immediately below it is unchanged."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      // A separate statement, not another else-if: a record can carry both an
      // over-long first body line and an over-long description, and both are
      // reported. An absent description is the empty string, so it never trips.
      if (a.description.length > DESC_MAX) {
        out.push(`${a.id} (${a.file}): description is ${a.description.length} characters, longer than the ${DESC_MAX} a card should carry`);
      }
      // fmKeys is what separates an absent key from an empty one: a record with no
    =======
      // fmKeys is what separates an absent key from an empty one: a record with no
    >>>>>>> REPLACE
    ```

  - [x] 1.5 Remove --description parsing from parseNewWsArgs
    ```yaml
    description: "Delete the --description flag parsing and its control-character guard from parseNewWsArgs, and drop description from the function's return shape"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the --description index lookup, its control-character die() guard, and the description property from parseNewWsArgs' return object and its doc comment, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The --status parsing that follows, and the --tags parsing that precedes, are both untouched; only the --description block between them is removed."
    gotcha: "The doc comment above parseNewWsArgs states the return shape '{ slug, title, tags, status, description }'; update it to drop description so it matches the new return shape."
    verify:
      - "grep -n \"'--description'\" skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm zero remaining hits."
    checklist:
      - "parseNewWsArgs no longer reads --description or validates it for control characters."
      - "The function's return object and its doc comment both list only { slug, title, tags, status }."
      - "The --tags and --status parsing blocks are unchanged."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
    // Returns null if --new-ws absent. Otherwise
    // { slug, title, tags, status, description }, or exits via die() on invalid
    // input. Mirrors parseClaimArgs' shape and die() style.
    =======
    // Returns null if --new-ws absent. Otherwise
    // { slug, title, tags, status }, or exits via die() on invalid
    // input. Mirrors parseClaimArgs' shape and die() style.
    >>>>>>> REPLACE
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      const di = argv.indexOf('--description');
      const description = di !== -1 && argv[di + 1] && !argv[di + 1].startsWith('--') ? argv[di + 1] : '';
      if (CONTROL_CHARS.test(description)) {
        die('--description must not hold a line break or any other control character');
      }
      let status = NEW_WS_STATUS;
    =======
      let status = NEW_WS_STATUS;
    >>>>>>> REPLACE
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      return { slug, title, tags, status, description };
    =======
      return { slug, title, tags, status };
    >>>>>>> REPLACE
    ```

  - [x] 1.6 Remove description from the --new-ws scaffold write
    ```yaml
    description: "Drop description from the newWsOpts destructure and remove the conditional description: line from the scaffolded record"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: drop description from the newWsOpts destructuring assignment, and delete the conditional 'description: ...' array entry (and its two-line comment) from the writeAtomic() call that scaffolds a new workstream record, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The record's key order after this change is title, status, tags, ... unchanged from before except description is absent; this matches CONVENTIONS.md's key order once task 3 removes the key from the schema."
    gotcha: "The comment ('Optional, and omitted entirely when unset...') explains only the description line; remove the whole comment along with the line, not just the array entry."
    verify:
      - "grep -n -- '--description\\|description:' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm the scaffold comment and the scaffolded description: line are gone. The one remaining hit is the artefact record's description: fm.description line (task 1.7). The file's card-description comments and WARN text do not match this pattern and are never removed."
    checklist:
      - "newWsOpts destructuring no longer names description."
      - "The scaffolded record's writeAtomic() array carries no description entry."
      - "The title line and status line immediately surrounding the deleted entry are unchanged and adjacent."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
      const { slug, title, tags, status, description } = newWsOpts;
    =======
      const { slug, title, tags, status } = newWsOpts;
    >>>>>>> REPLACE
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
        `title: ${JSON.stringify(title)}`,
        // Optional, and omitted entirely when unset: a record scaffolded without
        // --description is byte-for-byte the record this writer produced before
        // the flag existed.
        ...(description.trim() ? [`description: ${JSON.stringify(description)}`] : []),
        `status: ${status}`,
    =======
        `title: ${JSON.stringify(title)}`,
        `status: ${status}`,
    >>>>>>> REPLACE
    ```

  - [x] 1.7 Remove description from the artefact record build
    ```yaml
    description: "Drop the description: fm.description default from the in-memory artefact record every scan builds"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the 'description: fm.description || \\'\\',' line from the artefact object literal built while scanning each record, per PLN-12-k8xy5t's Design section. This is the field checkShape (task 1.4) and the board writer (task 1.8) both read from; both readers must already be gone, so this is the last of the three."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The blocked: (fm.blocked || '').trim() line immediately below is a distinct field and stays untouched."
    gotcha: "Run this task after 1.4 and 1.8 land, since removing the field before its readers are gone would make fc-index.mjs throw on a.description.length or ws.description."
    verify:
      - "grep -n 'fm.description' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm zero remaining hits."
    checklist:
      - "The artefact object literal no longer carries a description key."
      - "The blocked key immediately below is unchanged."
      - "No other field in the same object literal shifted position."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
            tags: fm.tags || [], mode: fm.mode || '', author: fm.author || '',
            description: fm.description || '',
            blocked: (fm.blocked || '').trim(),
    =======
            tags: fm.tags || [], mode: fm.mode || '', author: fm.author || '',
            blocked: (fm.blocked || '').trim(),
    >>>>>>> REPLACE
    ```

  - [x] 1.8 Remove the description card line from the board writer
    ```yaml
    description: "Delete the if (ws.description) card line from the kanban board writer"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/fc-index.mjs: delete the 'if (ws.description) card += ...' line from the kanban card-building loop, per PLN-12-k8xy5t's Design section. The card's blocked line and card-description line, immediately above and below it, stay in their existing order."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "The rendered card order becomes: title line, blocked line (if any), card-description line (if any), author line, folder pointer -- matching CONVENTIONS.md's description of the blocked line rendering 'directly under the title line' once description no longer sits between them."
    gotcha: "This is ws.description (the board-writer's per-record object), a different binding from a.description (checkShape's, task 1.4) and fm.description (the record builder's, task 1.7); this task only touches the board writer's line."
    verify:
      - "grep -n 'ws.description' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm zero remaining hits."
      - "grep -n -- '--description\\|\\.description\\|[^_]DESC_MAX\\|description:' skills/flowcharge/scripts/fc-index.mjs"
      - "Confirm zero remaining hits, since this is the last of the eight generator edits in this parent task. The pattern names every form the description key took (the flag, the .description properties, the DESC_MAX constant, the description: lines) and excludes CARD_DESC_MAX and the six card-description comment and WARN lines, which stay."
    checklist:
      - "The if (ws.description) line is gone."
      - "The ws.blocked line above and the desc (card-description) line below are unchanged and adjacent."
      - "The key-specific grep in verify returns zero matches; only card-description prose still contains the word."
      - "node --check skills/flowcharge/scripts/fc-index.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/fc-index.mjs
    <<<<<<< SEARCH
        if (ws.blocked) card += `\t\t**Blocked:** ${ws.blocked}\n`;
        if (ws.description) card += `\t\t${ws.description}\n`;
        if (desc) card += `\t\t${desc}\n`;
    =======
        if (ws.blocked) card += `\t\t**Blocked:** ${ws.blocked}\n`;
        if (desc) card += `\t\t${desc}\n`;
    >>>>>>> REPLACE
    ```

- [x] 2. Generator tests (`run-tests.mjs`)

  ```yaml
  description: "Bring the pinning test suite back into agreement with the generator's removed description behaviour"
  ```

  - [x] 2.1 Remove description opt-in from the workstream() fixture helper
    ```yaml
    description: "Delete the workstream() fixture helper's conditional description key and its comment"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: delete the 'Opt-in and workstream-only' comment and the 'if (type === 'workstream' && o.description !== undefined) keys.description = ...' line from the workstream() fixture helper, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "The blocked-key opt-in line immediately below, and its own comment, are untouched; they are unaffected by this change (they merely need their comment's 'the same way and for the same reason' framing to make sense on its own, which it still does)."
    gotcha: "Run this task before tasks 2.2-2.7, since every workstream() call in those tasks that currently passes a description: field must have that field removed from its call site by those tasks, not by this one; this task only removes the helper's ability to accept it."
    verify:
      - "grep -n 'o.description' skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm zero remaining hits after all of task 2's children land (some will remain until 2.2-2.7 also land, since those tasks still pass description: to workstream() until they are rewritten)."
    checklist:
      - "The workstream() helper's description opt-in line and comment are gone."
      - "The blocked opt-in line and comment immediately below are unchanged."
      - "keys.tags assignment immediately above is unchanged."
      - "node --check skills/flowcharge/scripts/test/run-tests.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
      if (type === 'workstream') keys.tags = arr(o.tags);
      // Opt-in and workstream-only: a fixture carries the optional description key
      // only when the case asks for one, so every existing fixture stays
      // byte-identical to what it produced before the key existed.
      if (type === 'workstream' && o.description !== undefined) keys.description = `"${o.description}"`;
      // The blocked key opts in the same way and for the same reason. Both land
    =======
      if (type === 'workstream') keys.tags = arr(o.tags);
      // The blocked key opts in the same way and for the same reason. Both land
    >>>>>>> REPLACE
    ```

  - [x] 2.2 Remove the two card-body description test cases
    ```yaml
    description: "Delete the 'card body's optional description line' test section: its comment header and its two test cases"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: delete the '---- cases: the card body's optional description line ----' comment block and both test cases under it ('a workstream carrying a description writes it as the card body first line', 'a workstream with no description key writes the unchanged three-line card body'), per PLN-12-k8xy5t's Design section. Neither case has any coverage value once the generator never reads description."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "The preceding 'board card in the column its status names' test case, and the following '---- cases: the card body's optional blocked line ----' section (rewritten by task 2.3), are unaffected."
    gotcha: "Delete the whole comment header, not just the two testCase() calls, since the header describes content that no longer exists."
    verify:
      - "grep -n \"card body's optional description line\" skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm zero remaining hits."
    checklist:
      - "Both description card-body test cases are gone."
      - "The section's comment header is gone."
      - "The preceding and following test sections are unchanged."
      - "node --check skills/flowcharge/scripts/test/run-tests.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
    // ---- cases: the card body's optional description line -----------------------
    // The generated card body carries the record's optional description first, then
    // the body's first line, then the author line, then the folder pointer. The pair
    // below pins the body either side of the key's presence.

    testCase('a workstream carrying a description writes it as the card body first line', () => {
      withFixture(baseTree({
        [WS1]: workstream({
          id: 'WS-1-abcdef',
          slug: 'alpha',
          title: 'Alpha',
          description: 'A fuller explanation of the request, on one line.',
          body: 'The card description line.\n',
        }),
      }), (dir) => {
        const { status, stderr } = runGenerator(dir, []);
        assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
        const expected =
          '\t- ## WS-1-abcdef Alpha\n' +
          '\t\tA fuller explanation of the request, on one line.\n' +
          '\t\tThe card description line.\n' +
          '\t\tby unknown\n' +
          '\t\t→ flowcharge/workstreams/WS-1-abcdef-alpha/\n';
        const boardText = readRel(dir, 'flowcharge/kanban.md');
        assert.ok(
          boardText.includes(expected),
          `card body does not match\n  expected:\n${JSON.stringify(expected)}\n  board:\n${JSON.stringify(boardText)}`,
        );
      });
    });

    testCase('a workstream with no description key writes the unchanged three-line card body', () => {
      withFixture(baseTree({
        [WS1]: workstream({
          id: 'WS-1-abcdef',
          slug: 'alpha',
          title: 'Alpha',
          body: 'The card description line.\n',
        }),
      }), (dir) => {
        const { status, stderr } = runGenerator(dir, []);
        assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
        const expected =
          '\t- ## WS-1-abcdef Alpha\n' +
          '\t\tThe card description line.\n' +
          '\t\tby unknown\n' +
          '\t\t→ flowcharge/workstreams/WS-1-abcdef-alpha/\n';
        const boardText = readRel(dir, 'flowcharge/kanban.md');
        assert.ok(
          boardText.includes(expected),
          `card body does not match\n  expected:\n${JSON.stringify(expected)}\n  board:\n${JSON.stringify(boardText)}`,
        );
      });
    });

    // ---- cases: the card body's optional blocked line ---------------------------
    =======
    // ---- cases: the card body's optional blocked line ---------------------------
    >>>>>>> REPLACE
    ```

  - [x] 2.3 Collapse the blocked-line test pair into one description-free case
    ```yaml
    description: "Rewrite the two blocked-line card-body test cases (with/without description) into the single case that remains meaningful: the blocked line renders directly under the title line"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: replace the '---- cases: the card body's optional blocked line ----' section's comment and its two test cases (one with a description key, one without) with one rewritten comment and one rewritten test case asserting the blocked line renders directly under the title line, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "The following '---- cases: the blocked flag's other rendered surfaces ----' section is unaffected."
    gotcha: "This reduces the suite's total case count by one (two cases become one), since a with-description/without-description pair has nothing left to contrast once description cannot appear at all."
    verify:
      - "grep -n \"blocked workstream\" skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm exactly one case matches, titled 'a blocked workstream writes the blocked line under the title'."
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm the new case passes."
    checklist:
      - "Exactly one blocked-card-body test case remains."
      - "The remaining case asserts the blocked line renders directly under the title line, with no description involved."
      - "The comment header no longer refers to a description."
      - "node --check skills/flowcharge/scripts/test/run-tests.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
    // ---- cases: the card body's optional blocked line ---------------------------
    // The blocked line sits directly under the title line, above the description and
    // above the card-description line. The pair below pins the body either side of a
    // description, so the two optional lines cannot swap places unnoticed.

    testCase('a workstream carrying a blocked reason writes it above its description', () => {
      withFixture(baseTree({
        [WS1]: workstream({
          id: 'WS-1-abcdef',
          slug: 'alpha',
          title: 'Alpha',
          blocked: 'waiting on the vendor API key',
          description: 'A fuller explanation of the request, on one line.',
          body: 'The card description line.\n',
        }),
      }), (dir) => {
        const { status, stderr } = runGenerator(dir, []);
        assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
        const expected =
          '\t- ## WS-1-abcdef Alpha\n' +
          '\t\t**Blocked:** waiting on the vendor API key\n' +
          '\t\tA fuller explanation of the request, on one line.\n' +
          '\t\tThe card description line.\n' +
          '\t\tby unknown\n' +
          '\t\t→ flowcharge/workstreams/WS-1-abcdef-alpha/\n';
        const boardText = readRel(dir, 'flowcharge/kanban.md');
        assert.ok(
          boardText.includes(expected),
          `card body does not match\n  expected:\n${JSON.stringify(expected)}\n  board:\n${JSON.stringify(boardText)}`,
        );
      });
    });

    testCase('a blocked workstream with no description key writes the blocked line under the title', () => {
    =======
    // ---- cases: the card body's optional blocked line ---------------------------
    // The blocked line sits directly under the title line, above the
    // card-description line.

    testCase('a blocked workstream writes the blocked line under the title', () => {
    >>>>>>> REPLACE
    ```

  - [x] 2.4 Remove the DESC_MAX boundary test pair
    ```yaml
    description: "Delete the two test cases pinning the description-length WARN boundary at 1000/1001 characters"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: delete the comment and both test cases ('a workstream description of 1001 characters warns', 'clean: a workstream description of 1000 characters warns about nothing'), per PLN-12-k8xy5t's Design section, since DESC_MAX no longer exists (task 1.3/1.4)."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "The preceding first-body-line-length boundary test pair (200/201 characters, a distinct CARD_DESC_MAX-backed check) is unaffected."
    gotcha: "Do not confuse this pair with the CARD_DESC_MAX-backed 'first body line' boundary pair immediately above it in the file; only the description-key pair is removed."
    verify:
      - "grep -n 'description of 100' skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm zero remaining hits."
    checklist:
      - "Both DESC_MAX boundary test cases are gone."
      - "The preceding CARD_DESC_MAX (first body line) boundary pair is unchanged."
      - "The following blocked-empty-value test section is unchanged."
      - "node --check skills/flowcharge/scripts/test/run-tests.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
    // The description cap is soft (the board writes the value in full), so the
    // boundary is asserted either side: 1001 characters warns, 1000 does not.
    testCase('a workstream description of 1001 characters warns', () => {
      withFixture(baseTree({
        [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', description: 'x'.repeat(1001) }),
      }), (dir) => {
        expectWarns(dir, [`WS-1-abcdef (${WS1}): description is 1001 characters, longer than the 1000 a card should carry`]);
      });
    });

    testCase('clean: a workstream description of 1000 characters warns about nothing', () => {
      withFixture(baseTree({
        [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', description: 'x'.repeat(1000) }),
      }), (dir) => {
        expectWarns(dir, []);
      });
    });

    =======
    >>>>>>> REPLACE
    ```

  - [x] 2.5 Remove description from the newWsRecord() frontmatter-builder helper
    ```yaml
    description: "Drop the conditional description: line and its comment from the --new-ws test helper newWsRecord()"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: rewrite the comment above newWsRecord() to stop describing description as optional (it can no longer appear at all), and delete the conditional 'description:' array entry, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "Every existing call site of newWsRecord() in the surviving tests (task 2.6 removes the ones that pass a description option) must keep working; this task only removes the helper's ability to render the key."
    gotcha: "Run this after or alongside task 2.6, since task 2.6 deletes the test cases that are the only callers passing a description option to newWsRecord()."
    verify:
      - "grep -n 'o.description' skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm this helper's hit is gone (some hits may remain until task 2.1 and 2.6 also land)."
    checklist:
      - "newWsRecord()'s conditional description: entry is gone."
      - "The comment above it no longer claims description is optional."
      - "The title line and status line immediately surrounding the deleted entry are unchanged and adjacent."
      - "node --check skills/flowcharge/scripts/test/run-tests.mjs exits 0."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
    // The exact record --new-ws writes: every required key at a valid value, in
    // CONVENTIONS.md's key order, and an empty body. description is optional and
    // appears only when the case passes one, so every other call site still
    // produces the record the command wrote before the flag existed.
    const newWsRecord = (id, slug, title, o = {}) =>
      [
        '---',
        `id: ${id}`,
        'type: workstream',
        `workstream: ${id}`,
        `slug: ${slug}`,
        `title: "${title}"`,
        ...(o.description !== undefined ? [`description: "${o.description}"`] : []),
        `status: ${o.status !== undefined ? o.status : 'backlog'}`,
    =======
    // The exact record --new-ws writes: every required key at a valid value, in
    // CONVENTIONS.md's key order, and an empty body.
    const newWsRecord = (id, slug, title, o = {}) =>
      [
        '---',
        `id: ${id}`,
        'type: workstream',
        `workstream: ${id}`,
        `slug: ${slug}`,
        `title: "${title}"`,
        `status: ${o.status !== undefined ? o.status : 'backlog'}`,
    >>>>>>> REPLACE
    ```

  - [x] 2.6 Remove the three --new-ws --description test cases
    ```yaml
    description: "Delete the comment and all three test cases exercising --new-ws --description (with the flag, without it, and the WARN-free scaffold check)"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: delete the '--description is optional...' comment and the three test cases ('--new-ws honours --description and writes the key after title', '--new-ws with no --description writes no description line', 'a tree scaffolded by --new-ws --description produces no new WARN'), per PLN-12-k8xy5t's Design section, since the flag no longer exists (task 1.5)."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "The 'a tree scaffolded by --new-ws produces no frontmatter WARN in a default scan' test case immediately following stays untouched; it already exercises --new-ws with no --description and remains the sole survivor of this coverage."
    gotcha: "The second of the three deleted cases ('--new-ws with no --description writes no description line') already duplicates what the --new-ws-with-no-flags test in task-list section 1's earlier case ('--new-ws writes a complete record and prints the claimed id and its path') covers; no replacement case is needed."
    verify:
      - "grep -n -- '--description' skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm the only remaining hit is the HELP_FLAGS entry, which task 2.7 removes."
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm every case passes except '--help documents every flag and every enum the script accepts', which fails until task 2.7 drops --description from HELP_FLAGS. Task 2.7 confirms the final 256/256 count (264 at base_commit minus the 8 cases removed across tasks 2.2, 2.3, 2.4 and 2.6: 2 card-body + 1 net blocked-pair + 2 DESC_MAX + 3 --description)."
    checklist:
      - "All three --new-ws --description test cases are gone."
      - "The following default-scan test case is unchanged."
      - "grep -n -- '--description' skills/flowcharge/scripts/test/run-tests.mjs returns only the HELP_FLAGS hit."
      - "The full suite fails only the --help flag-completeness case, pending task 2.7."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
    // --description is optional, so it is pinned either side of its presence: the
    // whole record is byte-compared with the flag and without it, because the key's
    // position after title is a contract the board and the schema both rest on.

    testCase('--new-ws honours --description and writes the key after title', () => {
      const day = today();
      const description = 'A fuller explanation of the request, on one line.';
      withFixture(EMPTY_TREE, (dir) => {
        const res = runGenerator(dir, [
          '--new-ws', 'demo', '--title', 'Demo workstream', '--description', description,
        ]);
        assert.strictEqual(res.status, 0, `--new-ws exited ${res.status}\n${res.stderr}`);
        const id = outLines(res.stdout)[0];
        assertIdShape(id, 'WS', '--new-ws printed id');
        const rel = `flowcharge/workstreams/${id}-demo/workstream.md`;
        assert.strictEqual(readRel(dir, rel), newWsRecord(id, 'demo', 'Demo workstream', { day, description }));
        assert.deepStrictEqual(idsEntries(dir), [id], 'the marker directory for the claimed id is missing');
      });
    });

    testCase('--new-ws with no --description writes no description line', () => {
      const day = today();
      withFixture(EMPTY_TREE, (dir) => {
        const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream']);
        assert.strictEqual(res.status, 0, `--new-ws exited ${res.status}\n${res.stderr}`);
        const id = outLines(res.stdout)[0];
        assertIdShape(id, 'WS', '--new-ws printed id');
        const rel = `flowcharge/workstreams/${id}-demo/workstream.md`;
        // The record the command wrote before the flag existed, byte for byte.
        assert.strictEqual(readRel(dir, rel), newWsRecord(id, 'demo', 'Demo workstream', { day }));
        assert.deepStrictEqual(idsEntries(dir), [id], 'the marker directory for the claimed id is missing');
      });
    });

    testCase('a tree scaffolded by --new-ws --description produces no new WARN', () => {
      // The pool file is the one thing the tree carries: --new-ws does not seed it,
      // and its absence would add an advisory line to the set asserted below.
      withFixture({ 'flowcharge/tags.md': tagPool() }, (dir) => {
        const scaffold = runGenerator(dir, [
          '--new-ws', 'demo', '--title', 'Demo workstream', '--description', 'A fuller explanation.',
        ]);
        assert.strictEqual(scaffold.status, 0, `--new-ws exited ${scaffold.status}\n${scaffold.stderr}`);
        const id = outLines(scaffold.stdout)[0];
        assertIdShape(id, 'WS', '--new-ws printed id');
        // The same single warning the no-description scaffold draws: the body the
        // command deliberately leaves for the agent to append. The description is
        // not a body, so it silences nothing and adds nothing.
        expectWarns(dir, [
          `${id} (flowcharge/workstreams/${id}-demo/workstream.md): body has no card-description line`,
        ]);
      });
    });

    testCase('a tree scaffolded by --new-ws produces no frontmatter WARN in a default scan', () => {
    =======
    testCase('a tree scaffolded by --new-ws produces no frontmatter WARN in a default scan', () => {
    >>>>>>> REPLACE
    ```

  - [x] 2.7 Remove --description from the HELP_FLAGS completeness list
    ```yaml
    description: "Drop the '--description' entry from HELP_FLAGS, the flag inventory the --help completeness test checks against"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/scripts/test/run-tests.mjs: delete the '--description' entry from the HELP_FLAGS array, per PLN-12-k8xy5t's Design section, so the '--help documents every flag' test stops expecting a flag the generator no longer parses (task 1.1-1.2 already removed it from --help's own text)."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None."
    compatibility: "Every other entry in HELP_FLAGS is unchanged and in the same order."
    gotcha: "Run this after task 1.1 and 1.2 land, otherwise the '--help documents every flag' test would still pass by coincidence (the flag would still be gone from HELP_FLAGS but also still present in --help text) -- ordering the removal this way keeps the test meaningful throughout."
    verify:
      - "grep -n \"'--description'\" skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm zero remaining hits."
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "Confirm 256/256 cases pass once every task in stages 1 and 2 has landed: 264 at base_commit minus the 8 cases tasks 2.2, 2.3, 2.4 and 2.6 removed. This task and tasks 1.1/1.2 change what is asserted, not the count."
    checklist:
      - "HELP_FLAGS no longer lists --description."
      - "The '--help documents every flag' test still passes."
      - "No other HELP_FLAGS entry moved."
      - "The full suite (node skills/flowcharge/scripts/test/run-tests.mjs) reports 256/256 cases passed."
    self_eval:
      passed: true
      failures: []
    ```
    ```js
    skills/flowcharge/scripts/test/run-tests.mjs
    <<<<<<< SEARCH
      '--desc', '--archived', '--claim', '--new-ws', '--title', '--description',
      '--tags', '--status', '--whoami', '--help',
    =======
      '--desc', '--archived', '--claim', '--new-ws', '--title',
      '--tags', '--status', '--whoami', '--help',
    >>>>>>> REPLACE
    ```

- [x] 3. Schema doc (`CONVENTIONS.md`)

  ```yaml
  description: "Remove the description key's schema definition and update blocked's positioning rule now that description cannot appear"
  ```

  - [x] 3.1 Delete the description bullet from the workstream schema
    ```yaml
    description: "Delete the entire `description` schema bullet from CONVENTIONS.md's workstream key list"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/CONVENTIONS.md: delete the `description` bullet (from '`description`: **optional**...' through '...so no existing record needs a change.'), per PLN-12-k8xy5t's Design section. The bullet sits between the workstream body-rules paragraph and the `blocked` bullet, which task 3.2 edits next."
    pattern: "skills/flowcharge/CONVENTIONS.md"
    imports: "None."
    compatibility: "The body-rules paragraph immediately above, and the blocked bullet immediately below, must remain adjacent list items with no blank line introduced between them, matching this list's existing single-spaced bullet style."
    gotcha: "This is prose documentation, not code; match the file's existing two-space list-continuation indentation exactly when constructing the SEARCH block."
    verify:
      - "grep -n '\\`description\\`' skills/flowcharge/CONVENTIONS.md"
      - "Confirm the only remaining hit is inside the `plan`/`tasklist` bullets' unrelated prose, if any, not a schema definition for the workstream description key."
    checklist:
      - "The description bullet is fully gone, comment-to-comment."
      - "The body-rules paragraph and the blocked bullet are adjacent with no stray blank line."
      - "No other bullet in the list shifted content."
      - "The file still renders as valid Markdown (no broken list nesting)."
    self_eval:
      passed: true
      failures: []
    ```
    ```md
    skills/flowcharge/CONVENTIONS.md
    <<<<<<< SEARCH
      notes belong in the plan / issue list / task list.
      `description`: **optional**, workstream records only, and a single-line
      double-quoted scalar like `title`, written immediately after `title`. It carries a
      fuller upfront explanation of the request. The three are distinct, and none replaces
      another: `title` names the work in one short phrase; the body's **first line** is the
      one scannable card-description line, capped at 200 characters; `description` is the
      fuller explanation, with a **soft cap of 1000 characters**. The generator checks that
      length and WARNs past it, while writing the value in full either way. It renders in
      one place only: the kanban card's **first body line**, above the card-description
      line. It reaches neither `index.md`'s workstream table nor `--list`. The key is
      optional and its absence never warns, so no existing record needs a change.
      `blocked`: **optional**, workstream records only, and a single-line double-quoted
      scalar like `description`. Write it immediately after `description` when the record
      carries one, and immediately after `title` when it does not, always before
      `status`. Its value is the reason the work cannot proceed. An absent key means the
    =======
      notes belong in the plan / issue list / task list.
      `blocked`: **optional**, workstream records only, and a single-line double-quoted
      scalar like `title`. Write it immediately after `title`, always before
      `status`. Its value is the reason the work cannot proceed. An absent key means the
    >>>>>>> REPLACE
    ```

- [x] 4. Authoring prompts (`SKILL.md`, `templates/kanban-add.md`)

  ```yaml
  description: "Stop the orchestrator SKILL.md and the kanban-add.md template from instructing an agent to resolve or write description"
  ```

  - [x] 4.1 Remove --description guidance from SKILL.md's Start-of-run upkeep step
    ```yaml
    description: "Delete the [--description \"<text>\"] token from the --new-ws command line, and the paragraph telling the agent when to pass it"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/SKILL.md: delete '[--description \"<text>\"]' from the documented --new-ws command line, and delete the following 'Pass --description \"<text>\"...' paragraph in full, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/SKILL.md"
    imports: "None."
    compatibility: "The 'Its body is empty. Append the body yourself...' sentence immediately before, and the 'For tags: read flowcharge/tags.md first...' paragraph immediately after, stay adjacent and unchanged."
    gotcha: "The deleted paragraph ends mid-topic ('A description never stands in for the body: append the body either way.'); its whole four-sentence paragraph is removed, not just the first sentence, since none of it applies once the flag is gone."
    verify:
      - "grep -n -- '--description' skills/flowcharge/SKILL.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The --new-ws command line no longer includes --description."
      - "The Pass --description paragraph is fully gone."
      - "The body-authoring sentence before it and the tags paragraph after it are unchanged."
      - "The file still renders as valid Markdown."
    self_eval:
      passed: true
      failures: []
    ```
    ```md
    skills/flowcharge/SKILL.md
    <<<<<<< SEARCH
      `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--description "<text>"] [--tags a,b]`.
      It claims the id, creates the folder as `flowcharge/workstreams/WS-N-SUFFIX-<slug>/`, writes
      its `workstream.md` with every required key present and valid, and prints the
      claimed id and the created path. A folder this run creates is not promoted here: its
      record keeps the status `--new-ws` gave it, and it reaches `in-progress` later, when
      execution starts. Its body is empty. Append the body yourself: first
      line the card description, then as much of the request's own detail as it carried,
      with no length cap (CONVENTIONS.md, `workstream` body).
      Pass `--description "<text>"` when the originating request carries enough upfront
      detail to warrant a fuller explanation than the title gives; omit the flag when the
      request is a one-line ask. **No script can check** that judgment: the generator
      checks the value's length, never whether the field should have been filled. A
      description never stands in for the body: append the body either way.
      For `tags`: read `flowcharge/tags.md` first. If the request contains `#word` tokens,
    =======
      `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--tags a,b]`.
      It claims the id, creates the folder as `flowcharge/workstreams/WS-N-SUFFIX-<slug>/`, writes
      its `workstream.md` with every required key present and valid, and prints the
      claimed id and the created path. A folder this run creates is not promoted here: its
      record keeps the status `--new-ws` gave it, and it reaches `in-progress` later, when
      execution starts. Its body is empty. Append the body yourself: first
      line the card description, then as much of the request's own detail as it carried,
      with no length cap (CONVENTIONS.md, `workstream` body).
      For `tags`: read `flowcharge/tags.md` first. If the request contains `#word` tokens,
    >>>>>>> REPLACE
    ```

  - [x] 4.2 Remove description guidance from templates/kanban-add.md
    ```yaml
    description: "Delete step 2's description-deciding sentence and step 3's [--description] token from kanban-add.md"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "skills/flowcharge/templates/kanban-add.md: delete the 'Then decide the optional description key...' sentence from step 2, and delete '[--description \"<text>\"]' plus its clause from step 3's --new-ws command documentation, per PLN-12-k8xy5t's Design section."
    pattern: "skills/flowcharge/templates/kanban-add.md"
    imports: "None."
    compatibility: "Step 2's tags-resolution instructions before the deleted sentence, and step 3's command-behaviour prose after the deleted token, stay unchanged."
    gotcha: "Step 3's sentence '`--title` is required, `--description` and `--tags` are optional' must also drop the `--description` clause (becoming '`--title` is required, `--tags` is optional'), not just the bracketed token in the command line -- both occurrences are in the same step."
    verify:
      - "grep -n -- '--description\\|`description`' skills/flowcharge/templates/kanban-add.md"
      - "Confirm zero remaining hits. Step 4's 'card description' prose does not match this pattern and stays."
    checklist:
      - "Step 2 no longer mentions deciding on a description key."
      - "Step 3's command line no longer includes [--description \"<text>\"]."
      - "Step 3's optional-flags sentence reads '--title is required, --tags is optional'."
      - "The file still renders as valid Markdown."
    self_eval:
      passed: true
      failures: []
    ```
    ```md
    skills/flowcharge/templates/kanban-add.md
    <<<<<<< SEARCH
    2. Resolve `tags`, then decide whether the item warrants a `description`. For `tags`: read `flowcharge/tags.md` first. If this item's own wording contains `#word` tokens, lowercase each; for each, check the pool for a spelling that already covers the same idea (including a different grammatical form of the same word) and reuse that spelling instead of the literal token; a word with no covering pool entry is registered as a new line in `flowcharge/tags.md`. Those words, once resolved, become this item's entire `tags` set. Do not also add tags the pool's subject-matching would otherwise have chosen. If any `#word` carries a trailing `+` (e.g. `#gates+`), strip the `+` and treat the resolved words as a seed instead of the entire set: keep them all, and also choose any further tags from the pool's existing spellings matching this item's subject, the same reuse-first judgment, registering a new pool entry only if nothing covers it. If this item's wording carries no `#` words, choose `tags` from the pool's existing spellings matching its subject; register one new pool entry only if nothing already covers it. Never invent a near-miss variant of a spelling already in the pool. **Then decide the optional `description` key**: when this item's own wording carries enough upfront detail that one card-description line cannot carry the explanation, write that fuller explanation as `description`; when the item is a one-line ask, omit the key entirely. It replaces nothing. The body's first line is still the card-description line, and the detail below it is still captured in full.
    3. Create the workstream with one command, and use the id and the path it prints verbatim: `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--description "<text>"] [--tags a,b]`: `--title` is required, `--description` and `--tags` are optional. The command collision-checks the slug against every live and archived workstream and refuses, claiming nothing, if the slug is already taken; it claims the WS id; it creates the folder as `flowcharge/workstreams/<the printed WS id>-<slug>/`; and it writes `workstream.md` there with every required key present and valid at `status: backlog`. It prints two lines, the claimed id then the created record's path relative to the project root. **Do not create the folder by hand and do not claim the id by hand.** This command is the only supported way to create a workstream. Record any ordering constraint against another workstream as an ID in the created record's `depends_on`, not as prose.
    =======
    2. Resolve `tags`. Read `flowcharge/tags.md` first. If this item's own wording contains `#word` tokens, lowercase each; for each, check the pool for a spelling that already covers the same idea (including a different grammatical form of the same word) and reuse that spelling instead of the literal token; a word with no covering pool entry is registered as a new line in `flowcharge/tags.md`. Those words, once resolved, become this item's entire `tags` set. Do not also add tags the pool's subject-matching would otherwise have chosen. If any `#word` carries a trailing `+` (e.g. `#gates+`), strip the `+` and treat the resolved words as a seed instead of the entire set: keep them all, and also choose any further tags from the pool's existing spellings matching this item's subject, the same reuse-first judgment, registering a new pool entry only if nothing covers it. If this item's wording carries no `#` words, choose `tags` from the pool's existing spellings matching its subject; register one new pool entry only if nothing already covers it. Never invent a near-miss variant of a spelling already in the pool.
    3. Create the workstream with one command, and use the id and the path it prints verbatim: `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--tags a,b]`: `--title` is required, `--tags` is optional. The command collision-checks the slug against every live and archived workstream and refuses, claiming nothing, if the slug is already taken; it claims the WS id; it creates the folder as `flowcharge/workstreams/<the printed WS id>-<slug>/`; and it writes `workstream.md` there with every required key present and valid at `status: backlog`. It prints two lines, the claimed id then the created record's path relative to the project root. **Do not create the folder by hand and do not claim the id by hand.** This command is the only supported way to create a workstream. Record any ordering constraint against another workstream as an ID in the created record's `depends_on`, not as prose.
    >>>>>>> REPLACE
    ```

  - [x] 4.3 Verify zero description references remain in skills/flowcharge/ (aggregate)
    ```yaml
    description: "Repo-wide check that skills/flowcharge/ carries no remaining reference to the workstream description key, after stages 1-4 have landed"
    author: Anthony Koukoullis
    mode: spec
    issues: []
    implement:
      - "No file edit. Run the key-specific aggregate grep below after tasks 1.1-4.2 have all landed, and confirm it returns zero lines. This is the aggregate check the plan's Scope section states; each stage's own per-file greps (1.1-1.8, 2.1-2.7, 3.1, 4.1-4.2) confirm only their own file, never this repo-wide result."
    pattern: "skills/flowcharge/"
    imports: "None."
    compatibility: "Depends on every task in stages 1 through 4 having landed first. The pattern names only the forms the workstream description key took (the --description flag, the backticked `description` key name in prose, the fm./ws./a./o.description bindings, and the DESC_MAX constant), so it does not match SKILL.md's own frontmatter description: trigger line, the 'issue description' wording in templates/issues-and-tasks-spec.md and -diff.md, the card-description prose in CONVENTIONS.md, fc-index.mjs and kanban-add.md, or run-tests.mjs's unrelated label and fixture-skill descriptions. No file exclusion is needed."
    gotcha: "This is a verification-only task with no SEARCH/REPLACE block, hence its per-task mode: spec override, matching the shape of task 5.13. A plain grep -rln for the bare word description can never return zero here, because the card-description prose keeps the word for good; that is why the pattern is key-specific. If the grep returns any line, the corresponding stage did not land cleanly and must be revisited, not patched here."
    verify:
      - "grep -rn -- '--description\\|`description`\\|fm\\.description\\|ws\\.description\\|a\\.description\\|o\\.description\\|[^_]DESC_MAX' skills/flowcharge/"
      - "Confirm zero output, down from the 26 lines across five files (skills/flowcharge/CONVENTIONS.md, skills/flowcharge/scripts/fc-index.mjs, skills/flowcharge/scripts/test/run-tests.mjs, skills/flowcharge/SKILL.md, skills/flowcharge/templates/kanban-add.md) this same command returns at base_commit 3bb00fc."
    checklist:
      - "The key-specific aggregate grep returns zero lines."
      - "skills/flowcharge/SKILL.md's frontmatter and the two issues-and-tasks templates are untouched by this task and do not match the pattern."
      - "No file outside stages 1-4's own scope was touched to make this check pass."
      - "Tasks 1.1 through 4.2 are all marked complete before this task is run."
    self_eval:
      passed: true
      failures: []
    ```

- [ ] 5. Migrate the 12 workstream records

  ```yaml
  description: "Delete the description: frontmatter line from each of the 12 records in this repo that currently carries one, folding any fact the body omits into the body first"
  ```

  - [ ] 5.1 Migrate WS-12-zq2ms6
    ```yaml
    description: "Remove the description: line from WS-12-zq2ms6's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-12-zq2ms6-generator-empty-init-mode/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line. Per PLN-12-k8xy5t's Design section and the plan's recorded assumption that this is expected to be a plain deletion."
    pattern: "flowcharge/workstreams/WS-12-zq2ms6-generator-empty-init-mode/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys (title immediately above, status immediately below) keep their existing values and position; only the description: line is removed."
    gotcha: "This is a judgment call, not a mechanical deletion: read the body before applying the block below, and if a fact is missing, fold it in as a body edit before removing the frontmatter line, recording that fold in this task's self_eval rather than silently expanding scope."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-12-zq2ms6-generator-empty-init-mode/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did (verified by re-reading, folded in first if not already present)."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses (node skills/flowcharge/scripts/fc-index.mjs --root . --check reports no new error for this file)."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-12-zq2ms6-generator-empty-init-mode/workstream.md
    <<<<<<< SEARCH
    title: "Give fc-index.mjs a mode to initialize an empty flowcharge/ tree with no workstream"
    description: "fc-index.mjs currently has no way to create an empty, valid flowcharge/ tree (folder, workstreams/, index.md, kanban.md) with zero workstreams. --new-ws is the only path that creates the tree from scratch, and it always seeds one workstream as a side effect of allocating a WS id. A sibling project (the FlowCharge web app) wants to vendor this script to auto-initialize a brand-new project's flowcharge/ folder from its Add Project flow, and needs a clean empty-board init with no placeholder workstream."
    status: done
    =======
    title: "Give fc-index.mjs a mode to initialize an empty flowcharge/ tree with no workstream"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.2 Migrate WS-13-ywk08u
    ```yaml
    description: "Remove the description: line from WS-13-ywk08u's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-13-ywk08u-skill-instructions-init-flag-gap/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-13-ywk08u-skill-instructions-init-flag-gap/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-13-ywk08u-skill-instructions-init-flag-gap/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-13-ywk08u-skill-instructions-init-flag-gap/workstream.md
    <<<<<<< SEARCH
    title: "flowcharge skill instructions never reference fc-index.mjs's --init mode"
    description: "WS-12-zq2ms6 shipped fc-index.mjs --init (creates an empty flowcharge/ tree with zero workstreams) and was merged and released as done. Its own task list scoped documentation updates to only CONVENTIONS.md and CHANGELOG.md. It never touched skills/flowcharge/SKILL.md, whose Start of run upkeep section still only says: 'If flowcharge/ itself is missing, create it plus a zeroed ids.md first,' with no mention of --init as the proper command. A separate agent asked to initialize a new project folder was unaware --init existed and created the tree by hand instead. The fix belongs in this repo's skill sources (this project's skills/flowcharge/ folder), not in the already-closed WS-12."
    status: backlog
    =======
    title: "flowcharge skill instructions never reference fc-index.mjs's --init mode"
    status: backlog
    >>>>>>> REPLACE
    ```

  - [ ] 5.3 Migrate WS-14-xbmk31
    ```yaml
    description: "Remove the description: line from WS-14-xbmk31's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-14-xbmk31-pipeline-stage-codebase-resurvey/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-14-xbmk31-pipeline-stage-codebase-resurvey/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-14-xbmk31-pipeline-stage-codebase-resurvey/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-14-xbmk31-pipeline-stage-codebase-resurvey/workstream.md
    <<<<<<< SEARCH
    title: "Each pipeline stage re-surveys the codebase the stage before it already read"
    description: "Across one measured run, create-plan and tasks-from-plan each touched 32 files and 21 were the same file, and the two validation stages read most of that set a third and fourth time, each in an empty context. The cause is not a thin plan: the plan was 552 lines and carried contracts and line anchors. tasks-from-plan-spec.md line 33 orders an unconditional re-read of every target file as a precondition for SEARCH/REPLACE blocks, and the spec-mode list it produced contained none. Six subagents each paid about 52,000 tokens of fixed setup before doing any work."
    status: done
    =======
    title: "Each pipeline stage re-surveys the codebase the stage before it already read"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.4 Migrate WS-15-d5hgor
    ```yaml
    description: "Remove the description: line from WS-15-d5hgor's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-15-d5hgor-artefact-validation-cost-tiers/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-15-d5hgor-artefact-validation-cost-tiers/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-15-d5hgor-artefact-validation-cost-tiers/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-15-d5hgor-artefact-validation-cost-tiers/workstream.md
    <<<<<<< SEARCH
    title: "Every run pays full price for artefact checking, whatever the stakes"
    description: "Validation turns cost about a third of a benchmark run's tokens and about 40 percent of its net pipeline wall time, and a project has no way to trade that against speed or token spend. Verified against the run log: the two validation turns alone are 18 percent, rising to 37 percent once the turns that apply their findings are charged to them. Removing validation entirely would still leave the run 5x the competitor's token cost, so the setting is not what closes that gap. Settled 2026-09-16 as a two-value setting named validate: on runs one validation pass at the end, checking the brief against the plan first and then the plan against the tasks, and off runs no validation at all."
    status: done
    =======
    title: "Every run pays full price for artefact checking, whatever the stakes"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.5 Migrate WS-16-1n524u
    ```yaml
    description: "Remove the description: line from WS-16-1n524u's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-16-1n524u-briefing-block-self-contradiction/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-16-1n524u-briefing-block-self-contradiction/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-16-1n524u-briefing-block-self-contradiction/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-16-1n524u-briefing-block-self-contradiction/workstream.md
    <<<<<<< SEARCH
    title: "Self-contradicting instruction in the plan-and-tasks briefing block"
    description: "In plan-and-tasks-spec.md line 16 and plan-and-tasks-diff.md line 16, the briefing placeholder text the orchestrator fills before every plan-authoring spawn contains one self-contradicting sentence: it opens with everything the subagent needs and cannot discover for itself and closes with the parts of the codebase it touches, which is exactly what the subagent can discover itself. Fix: delete the and the parts of the codebase it touches clause so the two clauses stop disagreeing. Evidence this is not cosmetic: on the run-3 benchmark the candidate orchestrator took 326 seconds and made 30 Bash calls and 13 Reads before its first spawn, 9 of them project source files that the authoring subagent then read again from a cold context moments later. Baseline orchestrator read zero project source files and took 102 seconds. Scope: the wording fix alone."
    status: done
    =======
    title: "Self-contradicting instruction in the plan-and-tasks briefing block"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.6 Migrate WS-17-m5tjnc
    ```yaml
    description: "Remove the description: line from WS-17-m5tjnc's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-17-m5tjnc-orchestrator-duplicate-source-reads/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-17-m5tjnc-orchestrator-duplicate-source-reads/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-17-m5tjnc-orchestrator-duplicate-source-reads/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-17-m5tjnc-orchestrator-duplicate-source-reads/workstream.md
    <<<<<<< SEARCH
    title: "Orchestrator reads project source files that the plan-authoring subagent re-reads from a cold context"
    description: "Reviewing subagent verbatim: Forbid the orchestrator from reading project source. Impact: 4-8 percent of total run. Files: plan-and-tasks-spec.md line 16 and plan-and-tasks-diff.md line 16 (the briefing block), plus hard rule 8 in flowcharge/SKILL.md. The briefing block contradicts itself, and hard rule 8 permits reading artefact files when a briefing needs facts, but the orchestrator stretched artefact files to cover project source. Change: delete the parts of the codebase it touches clause, name only what the orchestrator alone holds (the request, decisions taken, constraints, the workstream record), state the orchestrator opens no project source file to fill a briefing, and bound hard rule 8 to files under flowcharge/. Evidence: 326s and 55,661 output tokens in the candidate run, for information the next stage rediscovered; baseline spent 102s with zero source reads, also removing a 3x variance larger than several effects this series measures. Confidence: CONFIRMED."
    status: backlog
    =======
    title: "Orchestrator reads project source files that the plan-authoring subagent re-reads from a cold context"
    status: backlog
    >>>>>>> REPLACE
    ```

  - [ ] 5.7 Migrate WS-18-b52wnx
    ```yaml
    description: "Remove the description: line from WS-18-b52wnx's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-18-b52wnx-validator-whole-file-rereads/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-18-b52wnx-validator-whole-file-rereads/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-18-b52wnx-validator-whole-file-rereads/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-18-b52wnx-validator-whole-file-rereads/workstream.md
    <<<<<<< SEARCH
    title: "fc-validate's accuracy check re-reads whole files instead of the cited line range"
    description: "Reviewing subagent verbatim: Stop the validator re-reading whole files. Impact: 4-6 percent of total run. Files: fc-validate/SKILL.md section 2 (the Accuracy class) and validate-plan-and-tasks.md. The Accuracy class only requires checking a cited file:line that does not hold what the artefact says it holds, which needs the cited line range only. The candidate-lite validator instead ran cat -n on one file and sed -n 1,190p on another, plus whole-file reads of styles.css, home.ts, ARCHITECTURE.md and both test files: 27 Bash calls, about 15 of them full re-reads. The validator cost 406s and 476s, 22-32 percent of Phase A. Change: state that an anchor check reads the cited range plus a small margin, never the whole file. Confidence: HYPOTHESIS, not yet benchmark-confirmed, only inferred from the observed re-read pattern."
    status: backlog
    =======
    title: "fc-validate's accuracy check re-reads whole files instead of the cited line range"
    status: backlog
    >>>>>>> REPLACE
    ```

  - [ ] 5.8 Migrate WS-19-vncz2n
    ```yaml
    description: "Remove the description: line from WS-19-vncz2n's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-19-vncz2n-reduce-plan-vs-brief-comparison/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-19-vncz2n-reduce-plan-vs-brief-comparison/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-19-vncz2n-reduce-plan-vs-brief-comparison/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-19-vncz2n-reduce-plan-vs-brief-comparison/workstream.md
    <<<<<<< SEARCH
    title: "The plan-vs-brief validation comparison rarely finds anything worth its read cost"
    description: "Reviewing subagent verbatim: Reduce or drop comparison 1. Impact: 5-7 percent of total run. Files: validate-plan-and-tasks.md and the stages routing in flowcharge/SKILL.md. Comparison 1 checks the plan against the brief and workstream record. Across two runs it returned 0 fixes and 0 findings, then 1 cosmetic wording fix and 1 coverage finding (the one fix replaced exactly as the delete button already does with with no reload). Comparison 2 returned 2 real findings, then 0. Comparison 1 requires reading the plan in full plus the workstream record plus the brief, roughly half the validators reading. This is a value judgment, not only a speed judgment: run comparison 1 only when the plan carries open questions or unconfirmed assumptions. The findings-count evidence is CONFIRMED; the fix (run comparison 1 only conditionally) is the reviewing subagents own proposal, not yet tested."
    status: backlog
    =======
    title: "The plan-vs-brief validation comparison rarely finds anything worth its read cost"
    status: backlog
    >>>>>>> REPLACE
    ```

  - [ ] 5.9 Migrate WS-22-lq25m7
    ```yaml
    description: "Remove the description: line from WS-22-lq25m7's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-22-lq25m7-validate-accuracy-class-not-exercised/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-22-lq25m7-validate-accuracy-class-not-exercised/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-22-lq25m7-validate-accuracy-class-not-exercised/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-22-lq25m7-validate-accuracy-class-not-exercised/workstream.md
    <<<<<<< SEARCH
    title: "fc-validate's Accuracy class is defined but not exercised, so technical inaccuracies pass through"
    description: "Benchmark audits on 2026-09-18 found fc-validate repeatedly missing technical inaccuracies (a wrong line count, a false import claim, a miscounted set, a missing required CLI flag) that its own Accuracy class at SKILL.md:90-100 already covers. The mandate was never too narrow; three separate causes stop it being exercised: the skill's description reads as a blanket licence not to check technical correctness, the Accuracy bullet list is restated (not referenced) in both validate templates so a SKILL.md-only fix would stay invisible, and one ambiguous template sentence ('go looking for no file behind them') gets over-applied as grounds for checking nothing. Seven edits across three files close all three, with no new pipeline stage and no added time."
    status: done
    =======
    title: "fc-validate's Accuracy class is defined but not exercised, so technical inaccuracies pass through"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.10 Migrate WS-23-jysiqw (this workstream's own record)
    ```yaml
    description: "Remove the description: line from WS-23-jysiqw's own workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-23-jysiqw-remove-description-frontmatter-field/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line. This workstream's own record is included in the 12, per the plan's Context and Data & compatibility sections."
    pattern: "flowcharge/workstreams/WS-23-jysiqw-remove-description-frontmatter-field/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found. Run this task last among the 12, once every other stage has landed, so the record's own history reads cleanly against the finished work."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-23-jysiqw-remove-description-frontmatter-field/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-23-jysiqw-remove-description-frontmatter-field/workstream.md
    <<<<<<< SEARCH
    title: "Remove the redundant description frontmatter field from workstream records"
    description: "Every workstream record already carries an unlimited-length markdown body that holds the full detail of its originating request, and all 88 existing records use it that way. The optional frontmatter description key was added earlier, before that was understood, because title alone felt too thin. All 32 records that carry description restate their own body and add no fact the body lacks, so the key is pure duplication. Remove it from the schema, the generator, and the authoring prompts, and migrate the 32 records that still carry it. The dashboard app already renders the body instead of description on its own side, in a separate repo, so that half is out of scope here."
    status: backlog
    =======
    title: "Remove the redundant description frontmatter field from workstream records"
    status: backlog
    >>>>>>> REPLACE
    ```

  - [ ] 5.11 Migrate WS-5-geob84
    ```yaml
    description: "Remove the description: line from WS-5-geob84's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-5-geob84-unescape-frontmatter-quoted-values/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-5-geob84-unescape-frontmatter-quoted-values/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-5-geob84-unescape-frontmatter-quoted-values/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-5-geob84-unescape-frontmatter-quoted-values/workstream.md
    <<<<<<< SEARCH
    title: "Frontmatter parser leaves escaped quotes in title and description values"
    description: "parseFrontmatter strips only the outer quote marks from a quoted YAML scalar; it never undoes backslash-escaping inside the value. A title or description written with JSON.stringify (as fc-index.mjs now does for a value holding a literal quote) reads back with the backslashes still in the text, e.g. He said \\\"hi\\\" instead of He said \"hi\"."
    status: done
    =======
    title: "Frontmatter parser leaves escaped quotes in title and description values"
    status: done
    >>>>>>> REPLACE
    ```

  - [ ] 5.12 Migrate WS-8-r6d8n6
    ```yaml
    description: "Remove the description: line from WS-8-r6d8n6's workstream.md, after confirming its body already carries every fact the description states"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "flowcharge/workstreams/WS-8-r6d8n6-prevent-non-conforming-task-yaml/workstream.md: read the record's body in full and compare it against the description value. If the body already states every fact the description does, delete the description: line as-is. If the description states a fact the body omits, first append that fact to the body in the record's own words, then delete the description: line."
    pattern: "flowcharge/workstreams/WS-8-r6d8n6-prevent-non-conforming-task-yaml/workstream.md"
    imports: "None."
    compatibility: "The record's remaining frontmatter keys keep their existing values and position; only the description: line is removed."
    gotcha: "Read the body before applying the block below; fold in any missing fact first if one is found."
    verify:
      - "grep -n '^description:' flowcharge/workstreams/WS-8-r6d8n6-prevent-non-conforming-task-yaml/workstream.md"
      - "Confirm zero remaining hits."
    checklist:
      - "The description: line is gone from the frontmatter."
      - "The body states every fact the deleted description did."
      - "The title and status lines immediately surrounding the deleted line are unchanged."
      - "The file's frontmatter still parses cleanly."
    self_eval:
      passed: false
      failures: []
    ```
    ```yaml
    flowcharge/workstreams/WS-8-r6d8n6-prevent-non-conforming-task-yaml/workstream.md
    <<<<<<< SEARCH
    title: "Task lists can be authored with YAML block scalars the schema never sanctions"
    description: "Nothing in the schema states folded block scalars (>-) as a forbidden form for task-level string fields, nothing in the generator's --check validates it, and fc-task-list/SKILL.md gives no scalar-style rule at all — confirmed by direct inspection of this repository's own skill and generator, not carried over as an assumption."
    status: dropped
    =======
    title: "Task lists can be authored with YAML block scalars the schema never sanctions"
    status: dropped
    >>>>>>> REPLACE
    ```

  - [ ] 5.13 Verify zero description keys remain in this repo's workstream records
    ```yaml
    description: "Repo-wide check that no workstream record under flowcharge/workstreams/ carries a description: frontmatter line, after all 12 per-record migrations have landed"
    author: Anthony Koukoullis
    mode: spec
    issues: []
    implement:
      - "No file edit. Run the repo-wide grep this plan's acceptance criteria state, after tasks 5.1-5.12 have all landed, and confirm it returns zero matches."
    pattern: "flowcharge/workstreams/*/workstream.md"
    imports: "None."
    compatibility: "Depends on every one of tasks 5.1 through 5.12 having landed first."
    gotcha: "This is a verification-only task with no SEARCH/REPLACE block, hence its per-task mode: spec override; if the grep returns any match, the corresponding per-record task did not land cleanly and must be revisited, not patched here."
    verify:
      - "grep -rn '^description:' flowcharge/workstreams/*/workstream.md"
      - "Confirm zero matches, down from the 12 matches (WS-12-zq2ms6, WS-13-ywk08u, WS-14-xbmk31, WS-15-d5hgor, WS-16-1n524u, WS-17-m5tjnc, WS-18-b52wnx, WS-19-vncz2n, WS-22-lq25m7, WS-23-jysiqw, WS-5-geob84, WS-8-r6d8n6) present at base_commit 3bb00fc."
    checklist:
      - "grep -rn '^description:' flowcharge/workstreams/*/workstream.md returns zero matches."
      - "All 12 records named above are individually confirmed clean."
      - "No workstream record outside those 12 was touched."
      - "No new description: line was introduced anywhere else in flowcharge/workstreams/."
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 6. Changelog entry

  ```yaml
  description: "Log the description field's removal in CHANGELOG.md's Unreleased/Removed section"
  ```

  - [ ] 6.1 Add a Removed entry for the description field
    ```yaml
    description: "Append one bullet to CHANGELOG.md's ## Unreleased / ### Removed section documenting the description key's removal"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "CHANGELOG.md: append one bullet to the '### Removed' section under '## Unreleased', naming the removed description frontmatter key, the files it was removed from (CONVENTIONS.md, fc-index.mjs, SKILL.md, templates/kanban-add.md), and the migration of the 12 records that carried it, matching the section's existing style (a short lead clause, then the affected files, in prose)."
    pattern: "CHANGELOG.md"
    imports: "None."
    compatibility: "The three existing bullets in ### Removed (the three retired plan-path templates, the three retired issue-path templates, and the three retired validation templates) stay unchanged; the new bullet is appended after them, before the ### Fixed heading that follows."
    gotcha: "Match the section's existing bullet style exactly: a bold-free lead sentence naming what was removed, then backtick-quoted file paths, in flowing prose -- not a nested list."
    verify:
      - "grep -n 'description' CHANGELOG.md"
      - "Confirm the new bullet appears once, under ### Removed, above the ### Fixed heading."
    checklist:
      - "One new bullet is appended to ### Removed under ## Unreleased."
      - "The bullet names the description frontmatter key and every file it was removed from."
      - "The bullet mentions the 12-record migration."
      - "The three existing ### Removed bullets and the following ### Fixed heading are unchanged."
    self_eval:
      passed: false
      failures: []
    ```
    ```md
    CHANGELOG.md
    <<<<<<< SEARCH
    - `flowcharge/templates/validate-plan.md`, `flowcharge/templates/validate-issues.md`
      and `flowcharge/templates/validate-tasks.md`, retired in favour of the two
      merged validation templates. The delete-the-older-folder-first note above
      applies to these three files too.

    ### Fixed
    =======
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
    >>>>>>> REPLACE
    ```
