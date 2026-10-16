---
id: TL-26-9sq7bw
type: tasklist
workstream: WS-28-64urkm
slug: lease-live-status-heartbeat
title: "Lease live-status heartbeat"
status: ready
created: 2026-10-16
updated: 2026-10-16
author: Anthony Koukoullis
depends_on: [PLN-22-6khzm8]
links: []
mode: spec
base_commit: 0967f71
runtime: none
e2e_tooling: []
test_commands: ["node skills/flowcharge/scripts/test/run-tests.mjs"]
---

# FlowCharge Tasks

## Lease live-status heartbeat

Implements PLN-22-6khzm8. The workstream `.lease` gains `heartbeat`, `stage`, `artefact` and `note`, rewritten through a temporary file and a rename at every write point the plan lists; a refresh that finds another session's token or no file halts the run. The Start-of-run reclaim rule and `checkLeases()` in `fc-index.mjs` measure a lease's age from `heartbeat`, falling back to `acquired`, and the stale WARN reads "held by session <s>, silent for <n> minutes, stale". Every writing mode of the generator also keeps `flowcharge/workstreams/*/.lease` in the project's `.gitignore`.

Each parent task carries the `run-tests.mjs` edits that pin its own change, so the suite passes at every parent-task boundary (PLN-22-6khzm8, Design, Tests), and the test-update task has nothing left to update. Every `verify` step was run at `base_commit`: the value after "at base_commit" is what it returned there. A `grep -c` that counts zero exits 1, so its pass is the printed count. The repository configures no lint or type-check command, and `runtime` is `none`, so no task carries a lint step or a probe. Every `skills/flowcharge/SKILL.md` edit in parent task 1 avoids what the suite's docs-consistency cases reject: a spawn or subagent word, the product name without "Core" after it, the word gate, and a `skills/` path that does not resolve.

- [x] 1. Lease heartbeat in the orchestrator

  ```yaml
  description: "skills/flowcharge/SKILL.md defines the six-key lease file and its refresh command, refreshes the lease at every write point, and measures the reclaim age from heartbeat. Realises PLN-22-6khzm8 stage 1 (criteria 1 to 6 and 11)."
  ```

  - [x] 1.1 Define the lease file and its refresh command
    ```yaml
    description: "Add The lease file as the first bullet of FlowCharge Core upkeep: the six keys, the refresh command, the halt on exit 1 or 2, and a No script can check note"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## FlowCharge Core upkeep (automatic, every pipeline run)', insert a new bullet directly before '- **Start of run**:', labelled '- **The lease file**:', wrapped like the bullets around it."
      - "State that `<workstream folder>/.lease` marks a run working in that workstream now, and list its keys one `key: value` line each, in this order, with the value rules of PLN-22-6khzm8, Content specification, The lease file: `session` and `acquired`, written by the acquire command at Start of run and never changed; then `heartbeat`, `stage`, `artefact` and `note`, written by every refresh. Say times are ISO 8601 UTC, and that `artefact` and `note` are left empty when there is nothing to name."
      - "State that a refresh replaces the whole file through a temporary file in the same folder and a rename, so a reader never sees a half-written lease, and give the command introduced with 'e.g.', as the Start of run bullet introduces the acquire command: the exact command from PLN-22-6khzm8, Content specification, Refresh command, on one line in one inline code span."
      - "State the exits: 1 when no line of the file reads `session: <this run's token>`, 2 when the file is missing or the write fails; on either, this run no longer holds the workstream's lease, so halt per hard rule 7 and say so in the report."
      - "End with: **No script can check** that a run refreshes the lease at every write point, because no script reads a run; `fc-index.mjs` reports only a lease whose age passes `LEASE_STALE_MINUTES`."
    verify:
      - "grep -c '^- \\*\\*The lease file\\*\\*' skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -cF \"process.argv.slice(1),x=p+'.'+require('crypto').randomUUID()+'.tmp'\" skills/flowcharge/SKILL.md  # expect 1; 0 at base_commit"
      - "grep -c '\\*\\*No script can check\\*\\*' skills/flowcharge/SKILL.md  # expect 5; 4 at base_commit"
      - "sed -n '/^- \\*\\*The lease file\\*\\*/,/^- \\*\\*Start of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -cE '`(session|acquired|heartbeat|stage|artefact|note)`'  # expect at least 6 lines; 0 at base_commit, where the range is empty"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "grep -c returned 1"
        - item: "verify 2"
          result: YES
          measured: "grep -cF returned 1"
        - item: "verify 3"
          result: YES
          measured: "grep -c returned 5"
        - item: "verify 4"
          result: YES
          measured: "the bullet's range holds 7 lines naming a lease key in backticks"
      unverified: []
      failures: []
    ```
  - [x] 1.2 Reclaim from the heartbeat and refresh once the lease is held
    ```yaml
    description: "In the Start of run bullet, the EEXIST age reads heartbeat, or acquired when the lease has none, and the run refreshes the lease once it holds it, before it regenerates"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, bullet '- **Start of run**:', change the EEXIST sentence that reads the existing file's `acquired` timestamp so it reads the `heartbeat` timestamp, or the `acquired` timestamp when the lease carries no `heartbeat`, and computes the age from that. Keep `LEASE_STALE_MINUTES = 60`, the halt, the report of the holding `session` and age, the hand-deletion remark and the stale-reclaim retry unchanged."
      - "In the same bullet, directly before its closing 'Then regenerate.', add one sentence: once this run holds the lease, acquired or reclaimed, refresh it (see The lease file) with the first stage of the announced pipeline as `stage` and that stage's input artefact as `artefact` when it already exists (PLN-22-6khzm8, Content specification, Write points)."
    verify:
      - "sed -n '/^- \\*\\*Start of run\\*\\*/,/^- \\*\\*When execution starts\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'heartbeat'  # expect at least 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*Start of run\\*\\*/,/^- \\*\\*When execution starts\\*\\*/p' skills/flowcharge/SKILL.md | grep -ci 'refresh'  # expect at least 1; 0 at base_commit"
      - "grep -c 'LEASE_STALE_MINUTES = 60' skills/flowcharge/SKILL.md  # expect 1; 1 at base_commit, so this step guards the unchanged threshold and cannot fail there"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "the Start of run range holds 2 lines with heartbeat"
        - item: "verify 2"
          result: YES
          measured: "the Start of run range holds 1 line with refresh"
        - item: "verify 3"
          result: YES
          measured: "grep -c returned 1"
      unverified: []
      failures: []
    ```
  - [x] 1.3 Refresh the lease when execution starts
    ```yaml
    description: "The When execution starts bullet refreshes the lease with stage execute-tasks and the task list ID before it regenerates"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, bullet '- **When execution starts**:', between 'bump `updated`,' and 'and regenerate with the command above', add a refresh of the lease (see The lease file) with `stage` `execute-tasks`, the task list's ID as `artefact` and an empty `note` (PLN-22-6khzm8, Content specification, Write points). Keep the bullet's other sentences unchanged."
    verify:
      - "sed -n '/^- \\*\\*When execution starts\\*\\*/,/^- \\*\\*After every stage\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'lease'  # expect at least 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "the When execution starts range holds 1 line with lease"
      unverified: []
      failures: []
    ```
  - [x] 1.4 Refresh the lease before every parent-task run
    ```yaml
    description: "The execute-tasks Operations note refreshes the lease before every run of the stage file, the baseline run included, with the note parent task N of M"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, section '## Operations', the note '- **execute-tasks**:', add one sentence after the loop sentence that ends 'and only then begin the next.': before every run of the stage file, the baseline run included, refresh the lease (see FlowCharge Core upkeep, The lease file) with `stage` `execute-tasks`, the task list's ID as `artefact`, and the note `parent task <N> of <M>`, with `, baseline run` appended for the baseline run (PLN-22-6khzm8, Content specification, Write points). Keep the note's other sentences unchanged."
    verify:
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c 'lease'  # expect at least 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*execute-tasks\\*\\*:/,/^- \\*\\*commit\\*\\*:/p' skills/flowcharge/SKILL.md | grep -c 'parent task <N> of <M>'  # expect 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "the execute-tasks note range holds 2 lines with lease"
        - item: "verify 2"
          result: YES
          measured: "the execute-tasks note range holds 1 line with parent task <N> of <M>"
      unverified: []
      failures: []
    ```
  - [x] 1.5 Refresh the lease after every stage
    ```yaml
    description: "The After every stage bullet refreshes the lease for the stage that begins next, or upkeep, after any stage and before it regenerates"
    pattern: "skills/flowcharge/SKILL.md"
    implement:
      - "In skills/flowcharge/SKILL.md, bullet '- **After every stage**:', the closing clause '... whichever tag mode produced the workstream's other tags) and regenerate.' attaches the regenerate to the authoring-stage tag step. Rewrite that ending so the tag step closes with its parenthesis and a full stop, then add a sentence that applies after any stage: refresh the lease (see The lease file) with the stage that begins next as `stage`, or `upkeep` when only the end-of-run bookkeeping remains, then regenerate (PLN-22-6khzm8, Content specification, Write points). Keep 'Relay any WARN lines the script prints into your stage report.' as the last sentence."
      - "Illustrative only, not literal: '... other tags). After any stage, refresh the lease (see The lease file) for the stage that begins next, or `upkeep` when none does, then regenerate. Relay any WARN lines ...'"
    verify:
      - "sed -n '/^- \\*\\*After every stage\\*\\*/,/^- \\*\\*Successful end of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'lease'  # expect at least 1; 0 at base_commit"
      - "sed -n '/^- \\*\\*After every stage\\*\\*/,/^- \\*\\*Successful end of run\\*\\*/p' skills/flowcharge/SKILL.md | grep -c 'upkeep'  # expect at least 1; 0 at base_commit"
    self_eval:
      passed: true
      evidence:
        - item: "verify 1"
          result: YES
          measured: "the After every stage range holds 1 line with lease"
        - item: "verify 2"
          result: YES
          measured: "the After every stage range holds 1 line with upkeep"
      unverified: []
      failures: []
    ```

- [ ] 2. Generator staleness from heartbeat

  ```yaml
  description: "checkLeases() in fc-index.mjs measures a lease's age from heartbeat, falling back to acquired, with the new WARN text, pinned by the lease cases in run-tests.mjs. Realises PLN-22-6khzm8 stage 2 (criteria 7, 8 and 10)."
  ```

  - [ ] 2.1 Measure lease age from the heartbeat in checkLeases()
    ```yaml
    description: "checkLeases() parses heartbeat, takes the age from it when it parses and from acquired otherwise, skips a lease where neither parses, and WARNs 'held by session <s>, silent for <n> minutes, stale'; the four lease comments state the heartbeat rule"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In skills/flowcharge/scripts/fc-index.mjs, function checkLeases(wsDirs): parse a `heartbeat` value with the same `^<key>:[ \\t]*(.*)$` match the `session` and `acquired` lines use. Take the age from `Date.parse(heartbeat)` when that is a number, else from `Date.parse(acquired)`; keep the early `continue` when the chosen value is `NaN`. Replace the pushed WARN with the PLN-22-6khzm8 Content specification, Generator values, Stale WARN text. Keep the signature, the `LEASE_STALE_MINUTES * 60000` comparison and the report-only rule."
      - "Rewrite the comment inside checkLeases() that opens 'A lease the running session holds is fresh and correct' so it says the age runs from the last heartbeat, or from acquired for a lease that carries none, and that a lease where neither parses is reported by neither branch."
      - "Rewrite the comment above `const LEASE_STALE_MINUTES = 60;` so it says a lease whose last heartbeat, or acquisition when it carries none, is older than this many minutes is reported as stale; keep its sentence that SKILL.md publishes the value and the two must not drift."
      - "Add one sentence to the '// ---- leases ----' section comment: a lease's age runs from its heartbeat, the last write its holder made, and from acquired for a lease written before heartbeats existed. Change the call-site comment 'Workstream leases held past LEASE_STALE_MINUTES.' to 'Workstream leases silent past LEASE_STALE_MINUTES.'"
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None: Date.parse and the existing ageInMinutes() helper only."
    compatibility: "PLN-22-6khzm8, Design, Generator staleness and Data & compatibility: a lease with no heartbeat keeps today's acquired-based age. Node 16 floor (DEVELOPMENT.md): no newer syntax or API."
    gotcha: "Date.parse('') is NaN, so a lease with no heartbeat line falls back to acquired without a separate presence test. The WARN text is pinned by task 2.2, so it must match the plan's exact value, comma included."
    verify:
      - "grep -c 'silent for \\${ageInMinutes(age)}, stale' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
      - "grep -c 'held by session \\${session} for' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
      - "sed -n '/^function checkLeases/,/^}/p' skills/flowcharge/scripts/fc-index.mjs | grep -c 'heartbeat'  # expect at least 2; 0 at base_commit"
      - "grep -c 'Workstream leases silent past LEASE_STALE_MINUTES' skills/flowcharge/scripts/fc-index.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "source: checkLeases() takes the age from heartbeat when Date.parse returns a number, else from acquired, and skips the lease when both are NaN"
      - "source: the WARN pushed is exactly the plan's Stale WARN text, and the old 'held by session ${session} for' text is gone"
      - "source: checkLeases() keeps its signature, its LEASE_STALE_MINUTES comparison and deletes no file"
      - "source: the LEASE_STALE_MINUTES comment, the leases section comment, the in-function comment and the call-site comment each state the heartbeat rule"
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```
  - [ ] 2.2 Pin the heartbeat age and the new WARN text
    ```yaml
    description: "The lease() fixture builder takes an optional heartbeat age; the stale case becomes the acquired fallback case with the new text; two new cases pin a stale heartbeat and a fresh heartbeat on an old lease"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In skills/flowcharge/scripts/test/run-tests.mjs, section '// ---- cases: leases and the registry header', give `const lease = (session, minutesAgo) =>` an optional third parameter, the heartbeat age in minutes; when it is given, append the lines `heartbeat: <ISO time that many minutes ago>`, `stage: execute-tasks`, `artefact: TL-1-abcdef` and `note: parent task 1 of 2`, in that order. Update the section comment to say the heartbeat timestamp is fixed in the fixture the same way."
      - "Rename the case 'a lease held past sixty minutes warns with its session and its age' to 'a lease with no heartbeat, acquired past sixty minutes ago, warns from its acquire time', and change its expected line to 'flowcharge/workstreams/WS-1-abcdef-alpha/.lease: held by session sess-stale, silent for 90 minutes, stale'."
      - "Add, directly after it, the case 'a lease whose heartbeat is past sixty minutes old warns with its session and its silence': lease('sess-silent', 120, 90.5) expects exactly 'flowcharge/workstreams/WS-1-abcdef-alpha/.lease: held by session sess-silent, silent for 90 minutes, stale'."
      - "Add, directly after that, the case 'clean: a lease acquired long ago with a fresh heartbeat warns about nothing': lease('sess-live', 120, 5) expects no WARN line."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None: the existing withFixture, baseTree, expectWarns and LEASE1 helpers."
    compatibility: "PLN-22-6khzm8, Testing strategy, stage 2. The cases 'clean: a lease acquired five minutes ago warns about nothing' and 'no mode deletes a lease' stay unchanged and keep calling lease() with two arguments."
    gotcha: "The heartbeat-stale case acquires at 120 minutes and expects 'silent for 90 minutes', so it fails if the generator still measures from acquired. 90.5 minutes floors to 90 on any machine that runs the case within half a minute."
    verify:
      - "grep -c 'silent for 90 minutes, stale' skills/flowcharge/scripts/test/run-tests.mjs  # expect 2; 0 at base_commit"
      - "grep -c 'held by session sess-stale for 90 minutes' skills/flowcharge/scripts/test/run-tests.mjs  # expect 0; 1 at base_commit"
      - "grep -cF 'clean: a lease acquired long ago with a fresh heartbeat warns about nothing' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "source: lease() appends the heartbeat, stage, artefact and note lines only when its third argument is given"
      - "source: the fallback case, built with no heartbeat, expects the new WARN text for sess-stale"
      - "source: the heartbeat-stale case acquires at 120 minutes, sets heartbeat at 90.5, and expects 'silent for 90 minutes'"
      - "source: the fresh-heartbeat case acquires at 120 minutes, sets heartbeat at 5, and expects no WARN"
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```

- [ ] 3. Generator-managed .gitignore covers the lease

  ```yaml
  description: "Every writing mode of fc-index.mjs keeps flowcharge/workstreams/*/.lease in the project's .gitignore, named in the HELP text and the comments, pinned by two .gitignore cases. Realises PLN-22-6khzm8 stage 3 (criteria 9 and 10)."
  ```

  - [ ] 3.1 Add the lease pattern to the managed .gitignore targets
    ```yaml
    description: "GITIGNORE_TARGETS gains flowcharge/workstreams/*/.lease, GITIGNORE_COVERS gains its covering forms, and the HELP paragraph and the two comments above them name the fourth path"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In skills/flowcharge/scripts/fc-index.mjs, append 'flowcharge/workstreams/*/.lease' to `GITIGNORE_TARGETS` as its fourth entry, and add its `GITIGNORE_COVERS` entry exactly as PLN-22-6khzm8, Content specification, Generator values gives it."
      - "Rewrite the comment above `GITIGNORE_COMMENT` ('The three flowcharge/ paths this script regenerates or owns outright ...') so it names four paths: the three generated or owned paths plus the workstream lease files a run holds, which are session-bound and never worth tracking."
      - "Extend the comment above `GITIGNORE_COVERS` with the lease target's covering forms: a bare .lease, flowcharge/workstreams/ (or flowcharge/workstreams), and the bare flowcharge/ (or flowcharge) that already covers every target; its 'covers all three' becomes 'covers all four'."
      - "In the HELP constant, change the `.gitignore:` paragraph's list to the PLN-22-6khzm8 Content specification, Generator values, HELP text, rewrapped to the paragraph's existing width."
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None."
    compatibility: "PLN-22-6khzm8, Design, Gitignore: ensureGitignore() is unchanged and stays append-only. Node 16 floor (DEVELOPMENT.md)."
    gotcha: "The path contains '*/'. It is safe in a string, a template literal and a // comment, but it would close a /* */ block comment, so do not write it inside one."
    verify:
      - "grep -cF \"'flowcharge/workstreams/*/.lease'\" skills/flowcharge/scripts/fc-index.mjs  # expect at least 2 lines (the target, the covers entry); 0 at base_commit"
      - "tr '\\n' ' ' < skills/flowcharge/scripts/fc-index.mjs | grep -cF 'flowcharge/ids/ and flowcharge/workstreams/*/.lease it does not already cover'  # expect 1, the HELP list independent of its line wrap; 0 at base_commit"
      - "grep -c 'covers all three' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
      - "grep -c 'The three flowcharge/ paths' skills/flowcharge/scripts/fc-index.mjs  # expect 0; 1 at base_commit"
    checklist:
      - "source: GITIGNORE_TARGETS lists four entries, the fourth being 'flowcharge/workstreams/*/.lease'"
      - "source: GITIGNORE_COVERS carries the lease entry with exactly the six forms the plan gives"
      - "source: the HELP .gitignore paragraph names flowcharge/workstreams/*/.lease"
      - "source: ensureGitignore() is byte-identical to base_commit"
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```
  - [ ] 3.2 Pin the lease line in the .gitignore cases
    ```yaml
    description: "The --init .gitignore case asserts four lines, the lease pattern included, and a new case proves a default-mode run appends only the lease line to a .gitignore holding the other three"
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In skills/flowcharge/scripts/test/run-tests.mjs, rename the case '--init appends the standard three lines to a project with no .gitignore yet' to '--init appends the standard four lines to a project with no .gitignore yet', and add 'flowcharge/workstreams/*/.lease' to the array of lines it checks."
      - "Add, directly after it, the case 'a writing run appends only the lease line to a .gitignore holding the other three': withFixture(baseTree({ '.gitignore': 'flowcharge/index.md\\nflowcharge/kanban.md\\nflowcharge/ids/\\n' }), ...) runs the generator with no mode flag, asserts exit 0, and asserts with strictEqual that .gitignore reads exactly the three original lines, then the managed comment line '# FlowCharge-managed: do not hand-edit (see fc-index.mjs)', then 'flowcharge/workstreams/*/.lease', each ending in a newline."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None: the existing withFixture, withNoWorkstreamsFixture, baseTree, runGenerator and readRel helpers."
    compatibility: "PLN-22-6khzm8, Testing strategy, stage 3."
    gotcha: "The fixture tree is not a git repository, so the generator writes .gitignore at the fixture root. The managed comment line is appended because the fixture's .gitignore lacks it, so the expected text includes it."
    verify:
      - "grep -c 'appends the standard four lines' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
      - "grep -cF 'flowcharge/workstreams/*/.lease' skills/flowcharge/scripts/test/run-tests.mjs  # expect at least 2; 0 at base_commit"
      - "grep -cF 'a writing run appends only the lease line' skills/flowcharge/scripts/test/run-tests.mjs  # expect 1; 0 at base_commit"
    checklist:
      - "source: the --init case is named for four lines and checks all four, the lease pattern included"
      - "source: the new case starts from a .gitignore holding exactly the three earlier lines"
      - "source: the new case asserts the whole resulting file with strictEqual, comment line and lease line included"
      - "source: no other case changes"
    self_eval:
      passed: false
      evidence: []
      unverified: []
      failures: []
    ```

- [ ] 4. Test-update task: bring the tests in line with this change
  ```yaml
  description: "Update every test the other tasks make wrong or out of date; add only the tests the source asks for"
  test_update: true
  implement:
    - "No edit: tasks 2.2 and 3.2 already update and add every case PLN-22-6khzm8's Testing strategy asks for, inside the parent task whose change each pins (PLN-22-6khzm8, Design, Tests), so no test is left wrong or out of date"
  verify: []
  self_eval:
    passed: false
    evidence: []
  ```

- [ ] 5. Test-run task: run the project's test suites
  ```yaml
  description: "Run every command in the frontmatter test_commands after every other task"
  test_run: full
  implement:
    - "No edit; run the frontmatter test_commands per the fc-task-list skill's Test-run task section"
  verify:
    - "Every command in the frontmatter test_commands, in order, from the project root"
  self_eval:
    passed: false
    test_run_result: pending
    test_run_baseline: []
    test_run_failures: []
  ```
