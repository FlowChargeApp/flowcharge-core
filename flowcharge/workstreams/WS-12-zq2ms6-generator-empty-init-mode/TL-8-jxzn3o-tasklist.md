---
id: TL-8-jxzn3o
type: tasklist
workstream: WS-12-zq2ms6
slug: generator-empty-init-mode
title: "Add fc-index.mjs --init: empty flowcharge/ tree with zero workstreams"
status: ready
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: [PLN-6-uoxfrt]
links: []
mode: diff
base_commit: 69b9d90
---

# FlowCharge Tasks

## Add fc-index.mjs --init: empty flowcharge/ tree with zero workstreams

Implements PLN-6-uoxfrt in full. Adds a new no-argument `--init` flag to
`skills/flowcharge/scripts/fc-index.mjs` that idempotently creates
`flowcharge/workstreams/` (and, transitively, `flowcharge/`) when it does not already
exist, then falls through into the exact same regenerate code path the default mode
already runs, producing an empty `index.md`/`kanban.md` for zero workstreams in one
command. The chosen approach turns the existing unconditional `wsRoot`-missing exit-1
guard at `fc-index.mjs:258-261` into a conditional branch: present, `--init` checks
itself against the other six mode flags (`--check`, `--list`, `--claim`, `--new-ws`,
`--sync`, `--whoami`) and dies on any of them, otherwise it `mkdirSync`s `wsRoot` and
falls through; absent, the guard's current behavior is untouched. No new index/board
logic, no proactive `tags.md`/`ids.md` creation, and no change to any existing flag's
byte-for-byte output. Three stages, one per plan stage: implement the flag, its guard
branch and `--help` text; add fixture test coverage in `run-tests.mjs`; update
`CONVENTIONS.md` and add the `CHANGELOG.md` line. Every SEARCH block below was copied
from the file as read at `base_commit` 69b9d90, and every `verify` step's baseline
figure was measured directly against that commit rather than assumed.

- [x] 1. Implement `--init` in `fc-index.mjs`: flag wiring, guard branch, and `--help`
  ```yaml
  description: "PLN-6-uoxfrt Stage 1: wire --init through fc-index.mjs's HELP text (Usage, Modes, Exit codes, .gitignore enumeration) and replace the wsRoot-missing exit-1 guard with a conditional branch that idempotently creates flowcharge/workstreams/ for --init and refuses any combination with another mode flag."
  ```

  - [x] 1.1 Add the `--init` usage line to `fc-index.mjs`'s `HELP` text
    ```yaml
    description: "HELP's Usage: block (fc-index.mjs:26-37) lists one line per mode but none for --init. Add `node fc-index.mjs [--root <dir>] --init [--no-board]` directly after the --sync usage line, per PLN-6-uoxfrt's Design: 'Usage line added alongside the existing ones.'"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
          node fc-index.mjs [--root <dir>] --sync [--no-board]
          node fc-index.mjs [--root <dir>] --list [<scope>] [--ws <WS-id>]
        =======
          node fc-index.mjs [--root <dir>] --sync [--no-board]
          node fc-index.mjs [--root <dir>] --init [--no-board]
          node fc-index.mjs [--root <dir>] --list [<scope>] [--ws <WS-id>]
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None"
    compatibility: "PLN-6-uoxfrt Design: '--init accepts --no-board with the same meaning it carries for the default mode.'"
    gotcha: "This is the Usage: block only; the Modes: paragraph describing --init is task 1.2."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "node skills/flowcharge/scripts/fc-index.mjs --help | grep -c -- '--init \\[--no-board\\]' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "The new usage line sits directly between the --sync and --list usage lines"
      - "No other usage line changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.2 Add the `--init` mode entry to `fc-index.mjs`'s `HELP` text
    ```yaml
    description: "HELP's Modes: paragraph (fc-index.mjs:39-76) documents each mode's behavior but has none for --init. Add one between --sync's and --list's entries stating the idempotent mkdirSync, the fall-through into the default regenerate path, and the six-flag mutual exclusion, per PLN-6-uoxfrt's Design and Stage 1."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
          --sync     Close what is mechanically decidable (task lists whose
                     tasks are all checked, issue lists with no open issue left,
                     and workstreams whose artefacts are all closed) by setting
                     status: done and updated: today. Print one SYNC line per
                     change, then regenerate as the default mode does. A plan is
                     never closed. Accepts --no-board only.
          --list     Print a Markdown table of artefacts on stdout. Writes
                     nothing. Exits 0.
        =======
          --sync     Close what is mechanically decidable (task lists whose
                     tasks are all checked, issue lists with no open issue left,
                     and workstreams whose artefacts are all closed) by setting
                     status: done and updated: today. Print one SYNC line per
                     change, then regenerate as the default mode does. A plan is
                     never closed. Accepts --no-board only.
          --init     Create flowcharge/workstreams/ (and, transitively,
                     flowcharge/) when it does not already exist, an idempotent
                     no-op when it does, then regenerate as the default mode
                     does. Refused when combined with --check, --list, --claim,
                     --new-ws, --sync, or --whoami. Accepts --no-board only.
          --list     Print a Markdown table of artefacts on stdout. Writes
                     nothing. Exits 0.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None"
    compatibility: "PLN-6-uoxfrt Design: a fall-through mode like --sync, not an early exit; mutual exclusion against the same six flags task 1.5 implements."
    gotcha: "Indentation must match the surrounding entries exactly (11 leading spaces on each flag's continuation lines)."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "node skills/flowcharge/scripts/fc-index.mjs --help | grep -c -- '^  --init ' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "The new --init entry sits directly between the --sync and --list entries"
      - "No other mode's entry changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.3 Note the `--init` exception in `fc-index.mjs`'s `HELP` Exit codes section
    ```yaml
    description: "HELP's Exit codes: block (fc-index.mjs:117-122) says exit 1 covers 'no flowcharge/workstreams/ directory under the root' unconditionally. Per PLN-6-uoxfrt's Scope acceptance criterion 7, note that this no longer applies when --init is given, since --init creates that directory instead of refusing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
        Exit codes:
          0  The run succeeded. --check with no warning exits 0 too.
          1  Invalid arguments, an invalid flag combination, no
             flowcharge/workstreams/ directory under the root, or a --new-ws slug
             that is already taken.
          2  --check found at least one warning.
        =======
        Exit codes:
          0  The run succeeded. --check with no warning exits 0 too.
          1  Invalid arguments, an invalid flag combination, no
             flowcharge/workstreams/ directory under the root (unless --init is
             given, which creates it instead), or a --new-ws slug that is
             already taken.
          2  --check found at least one warning.
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None"
    compatibility: "PLN-6-uoxfrt Scope acceptance criterion 7: HELP must carry 'the exit-code note that the missing-flowcharge/workstreams/ exit-1 case no longer applies when --init is given.'"
    gotcha: "Keep the --new-ws slug clause on exit code 1 unchanged; only the flowcharge/workstreams/ clause gains the --init parenthetical."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "node skills/flowcharge/scripts/fc-index.mjs --help | grep -c 'unless --init is given' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "Exit code 0 and 2 lines are unchanged"
      - "The --new-ws slug clause on exit code 1 is unchanged"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.4 Add `--init` to `fc-index.mjs`'s `HELP` `.gitignore` writing-mode enumeration
    ```yaml
    description: "HELP's closing .gitignore: paragraph (fc-index.mjs:124-129) names every writing mode that appends to .gitignore: the default, --no-board, --sync, --claim, --new-ws. Add --init, per PLN-6-uoxfrt's Scope acceptance criterion 7 and Design ('--init is simply not added to the exclusion list checked at fc-index.mjs:269')."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
        .gitignore: every writing mode (the default, --no-board, --sync,
        --claim and --new-ws) also appends to the project root's .gitignore
        whichever of flowcharge/index.md, flowcharge/kanban.md and flowcharge/ids/
        it does not already cover. Existing lines are never rewritten or
        reordered. A failed write is a warning only. --list, --check, --whoami
        and --help touch .gitignore no more than they touch anything else.
        `;
        =======
        .gitignore: every writing mode (the default, --no-board, --sync,
        --claim, --new-ws and --init) also appends to the project root's
        .gitignore whichever of flowcharge/index.md, flowcharge/kanban.md and
        flowcharge/ids/ it does not already cover. Existing lines are never
        rewritten or reordered. A failed write is a warning only. --list,
        --check, --whoami and --help touch .gitignore no more than they touch
        anything else.
        `;
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "None"
    compatibility: "Must stay consistent with CONVENTIONS.md's own writing-mode enumeration sentence, updated separately in task 3.1."
    gotcha: "The trailing backtick-semicolon closes the HELP template literal; keep it exactly as the last line."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "node skills/flowcharge/scripts/fc-index.mjs --help | grep -c -- '--claim, --new-ws and --init' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "The enumeration now reads: the default, --no-board, --sync, --claim, --new-ws and --init"
      - "The rest of the paragraph and the closing template literal are unchanged"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: true
      failures: []
    ```

  - [x] 1.5 Turn the `wsRoot`-missing guard into a conditional branch for `--init`
    ```yaml
    description: "fc-index.mjs:258-261 unconditionally exits 1 when flowcharge/workstreams/ is missing. Per PLN-6-uoxfrt's Design ('Guard replacement, at the existing site'), branch on --init: present, check the other six mode flags and die() on any of them, else idempotently mkdirSync(wsRoot) and fall through; absent, the existing exit-1 branch is untouched."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/fc-index.mjs
        <<<<<<< SEARCH
        if (!fs.existsSync(wsRoot)) {
          console.error(`fc-index: no flowcharge/workstreams/ directory at ${root}`);
          process.exit(1);
        }
        =======
        // --init runs its mutual-exclusion check here, immediately after --help,
        // because it must run before or instead of this guard: the artefact scan
        // a few hundred lines below already depends on wsRoot existing, so a
        // combination with another mode flag must be refused before that scan,
        // not inside that mode's own parse*Args() function.
        const initMode = args.includes('--init');
        if (initMode) {
          const OTHER_MODE_FLAGS = ['--check', '--list', '--claim', '--new-ws', '--sync', '--whoami'];
          if (OTHER_MODE_FLAGS.some((f) => args.includes(f))) {
            console.error('fc-index: --init cannot be combined with --check, --list, --claim, --new-ws, --sync, or --whoami');
            process.exit(1);
          }
          // Idempotent: a no-op when wsRoot already exists, live or empty, and it
          // never inspects or touches anything already inside it.
          fs.mkdirSync(wsRoot, { recursive: true });
        } else if (!fs.existsSync(wsRoot)) {
          console.error(`fc-index: no flowcharge/workstreams/ directory at ${root}`);
          process.exit(1);
        }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/fc-index.mjs"
    imports: "node:fs (fs.mkdirSync, already imported)"
    compatibility: "PLN-6-uoxfrt Design decisions: idempotent mkdirSync mirrors --new-ws's own fs.mkdirSync(wsDir, { recursive: true }) call; --init is deliberately absent from the .gitignore exclusion list at fc-index.mjs:269, so ensureGitignore still runs for it unmodified."
    gotcha: "When --init is absent, the else-if branch must remain byte-for-byte the guard's current behavior; do not change its message or exit code."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "TMPD=$(mktemp -d); node skills/flowcharge/scripts/fc-index.mjs --root \"$TMPD\" --init; echo \"exit=$?\" — must print exit=0 and create $TMPD/flowcharge/{workstreams,index.md,kanban.md} with no ids.md/tags.md (printed exit=1 and created nothing at base_commit 69b9d90); rm -rf \"$TMPD\""
      - "TMPD2=$(mktemp -d); mkdir -p \"$TMPD2/flowcharge/workstreams\"; node skills/flowcharge/scripts/fc-index.mjs --root \"$TMPD2\" --init --check; echo \"exit=$?\" — must print exit=1 with exactly one stderr line (printed exit=2 at base_commit 69b9d90, since --init was silently ignored as an unrecognised token); rm -rf \"$TMPD2\""
    checklist:
      - "--init alone against a project with no flowcharge/ at all creates flowcharge/workstreams/, flowcharge/index.md and flowcharge/kanban.md and exits 0"
      - "That same run claims no ID and writes no flowcharge/ids.md or flowcharge/tags.md"
      - "--init combined with any of --check, --list, --claim, --new-ws, --sync, --whoami exits 1 with one stderr line and creates nothing"
      - "A run with no --init flag against a project with no flowcharge/workstreams/ still exits 1, unchanged from before this task"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed"
    self_eval:
      passed: true
      failures: []
    ```

- [ ] 2. Add test coverage for `--init` in `run-tests.mjs`
  ```yaml
  description: "PLN-6-uoxfrt Stage 2: a fixture builder that does not pre-create flowcharge/workstreams/, plus cases proving the empty-tree happy path, no ID claimed and no workstream written, a no-op against an existing workstream, the six mode-combination refusals, --no-board honoured, and .gitignore gaining its three lines; --init also joins the HELP_FLAGS inventory."
  ```

  - [ ] 2.1 Add a fixture builder that does not pre-create `flowcharge/workstreams/`
    ```yaml
    description: "fixture() (run-tests.mjs:38-41) always pre-creates flowcharge/workstreams/, per its own comment, because every other mode requires it. --init's own cases need a tree that starts without it, so add fixtureNoWorkstreamsTree()/withNoWorkstreamsFixture(), mirroring fixture()/withFixture()'s own shape, right after withFixture()."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        function withFixture(spec, fn) {
          const dir = fixture(spec);
          try {
            return fn(dir);
          } finally {
            fs.rmSync(dir, { recursive: true, force: true });
          }
        }
        =======
        function withFixture(spec, fn) {
          const dir = fixture(spec);
          try {
            return fn(dir);
          } finally {
            fs.rmSync(dir, { recursive: true, force: true });
          }
        }

        // Like fixture(), but does not pre-create flowcharge/workstreams/: --init's
        // own happy path is proving the generator creates that directory itself, so
        // its fixture must start without it, unlike every other case in this file.
        function fixtureNoWorkstreamsTree(spec = {}) {
          const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
          for (const rel of Object.keys(spec)) {
            const filePath = path.join(dir, rel);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, spec[rel]);
          }
          return dir;
        }

        // Runs fn against a fresh tree built by fixtureNoWorkstreamsTree() and
        // removes the tree afterwards, including when fn throws. Mirrors
        // withFixture()'s shape.
        function withNoWorkstreamsFixture(spec, fn) {
          const dir = fixtureNoWorkstreamsTree(spec);
          try {
            return fn(dir);
          } finally {
            fs.rmSync(dir, { recursive: true, force: true });
          }
        }
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "node:fs, node:os, node:path (already imported); FIXTURE_PREFIX (already defined)"
    compatibility: "Mirrors fixture()/withFixture()'s own parameter and cleanup shape exactly, so task 2.2's cases read the same as every other case in this file."
    gotcha: "Do not touch fixture()/withFixture() themselves; every existing case depends on their current behavior byte-for-byte."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "grep -c 'function fixtureNoWorkstreamsTree' skills/flowcharge/scripts/test/run-tests.mjs — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "fixture()/withFixture() are unchanged"
      - "fixtureNoWorkstreamsTree() never calls mkdirSync on a workstreams/ path"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 252/252 passed (a new helper, no new case yet)"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.2 Add the `--init` mode test-case section
    ```yaml
    description: "Add one new section, '---- cases: --init mode ----', between the existing '--new-ws --status blocked' case and the ID graph section (run-tests.mjs:1867-1878), covering PLN-6-uoxfrt Stage 2's full list: the empty-tree happy path and its exact two WARN lines; no ID claimed and no workstream folder written; a no-op against an existing workstream; the six mode-combination refusals; --no-board honoured; and .gitignore gaining its three lines."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        // --status validates against the narrowed enum, so blocked is refused here the
        // same way any unknown value is, and the run claims nothing.
        testCase('--new-ws --status blocked is refused and writes nothing', () => {
          withFixture(EMPTY_TREE, (dir) => {
            const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo', '--status', 'blocked']);
            expectRefusal(res, '--new-ws --status blocked');
            assert.deepStrictEqual(wsFolders(dir), [], 'a refused run created a workstream folder');
            assert.deepStrictEqual(idsEntries(dir), [], 'a refused run claimed an id');
          });
        });

        // ---- cases: ID graph (orphan markers, counters ahead, links: and issues:) ---
        =======
        // --status validates against the narrowed enum, so blocked is refused here the
        // same way any unknown value is, and the run claims nothing.
        testCase('--new-ws --status blocked is refused and writes nothing', () => {
          withFixture(EMPTY_TREE, (dir) => {
            const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo', '--status', 'blocked']);
            expectRefusal(res, '--new-ws --status blocked');
            assert.deepStrictEqual(wsFolders(dir), [], 'a refused run created a workstream folder');
            assert.deepStrictEqual(idsEntries(dir), [], 'a refused run claimed an id');
          });
        });

        // ---- cases: --init mode ----------------------------------------------------
        // --init creates flowcharge/workstreams/ (and, transitively, flowcharge/) when
        // it does not already exist, then falls through into the same regenerate path
        // the default mode runs. These cases build from fixtureNoWorkstreamsTree()/
        // withNoWorkstreamsFixture(), not fixture()/withFixture(): the point of --init
        // is that it works when flowcharge/workstreams/ does not exist yet, the one
        // thing fixture() never leaves absent.

        testCase('--init on a tree with no flowcharge/ at all creates it and exits 0 with exactly two WARN lines', () => {
          withNoWorkstreamsFixture({}, (dir) => {
            const res = runGenerator(dir, ['--init']);
            assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
            assert.strictEqual(res.stderr, '', `--init wrote to stderr:\n${res.stderr}`);
            compareWarnSets(warnLines(res.stdout), [
              'flowcharge/tags.md missing, tag validation skipped',
              'flowcharge/ids.md missing: create it before allocating new IDs',
            ]);
            assert.ok(
              res.stdout.includes('fc-index: 0 workstreams, 0 artefacts, 0 issues (0 open)'),
              `--init summary line changed:\n${res.stdout}`,
            );
            assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'workstreams')), '--init did not create flowcharge/workstreams/');
            assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), '--init did not write index.md');
            assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), '--init did not write kanban.md');
          });
        });

        testCase('--init claims no id and writes no workstream folder or ids.md', () => {
          withNoWorkstreamsFixture({}, (dir) => {
            const res = runGenerator(dir, ['--init']);
            assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
            assert.deepStrictEqual(wsFolders(dir), [], '--init created a workstream folder');
            assert.deepStrictEqual(idsEntries(dir), [], '--init claimed an id');
            assert.ok(!fs.existsSync(path.join(dir, 'flowcharge', 'ids.md')), '--init wrote flowcharge/ids.md');
          });
        });

        // This case cannot discriminate against an unmodified generator: with
        // flowcharge/workstreams/ already present, an unrecognised --init token is
        // silently ignored today and the run already falls through to the default
        // regenerate path with no change from this task. It is here as a regression
        // guard for the no-op contract (PLN-6-uoxfrt Scope acceptance criterion 3),
        // not as proof the flag is implemented; that proof lives in the two cases
        // above and the refusal loop below.
        testCase('--init against a tree already holding a workstream is a no-op on that data and still regenerates', () => {
          withFixture(baseTree(), (dir) => {
            const before = readRel(dir, WS1);
            const res = runGenerator(dir, ['--init']);
            assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
            assert.strictEqual(readRel(dir, WS1), before, '--init altered an existing workstream record');
            assert.deepStrictEqual(wsFolders(dir), ['WS-1-abcdef-alpha'], '--init changed the workstream folder set');
            assert.ok(
              res.stdout.includes('fc-index: 1 workstreams, 1 artefacts, 0 issues (0 open)'),
              `--init summary line changed:\n${res.stdout}`,
            );
          });
        });

        for (const combo of [['--check'], ['--list'], ['--claim', 'WS'], ['--new-ws', 'demo', '--title', 'Demo'], ['--sync'], ['--whoami']]) {
          testCase(`--init ${combo.join(' ')} exits 1 with one stderr line and writes nothing`, () => {
            withFixture(EMPTY_TREE, (dir) => {
              const res = runGenerator(dir, ['--init', ...combo]);
              expectRefusal(res, `--init ${combo.join(' ')}`);
              assert.deepStrictEqual(wsFolders(dir), [], `--init ${combo.join(' ')} created a workstream folder`);
              assert.deepStrictEqual(idsEntries(dir), [], `--init ${combo.join(' ')} claimed an id`);
              for (const rel of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids.md', '.gitignore']) {
                assert.ok(!fs.existsSync(path.join(dir, rel)), `--init ${combo.join(' ')} wrote ${rel}`);
              }
            });
          });
        }

        testCase('--init --no-board writes index.md only and leaves kanban.md untouched', () => {
          withNoWorkstreamsFixture({}, (dir) => {
            const res = runGenerator(dir, ['--init', '--no-board']);
            assert.strictEqual(res.status, 0, `--init --no-board exited ${res.status}\n${res.stderr}`);
            assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), '--init --no-board did not write index.md');
            assert.ok(!fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), '--init --no-board wrote kanban.md');
          });
        });

        testCase('--init appends the standard three lines to a project with no .gitignore yet', () => {
          withNoWorkstreamsFixture({}, (dir) => {
            const res = runGenerator(dir, ['--init']);
            assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
            const gi = readRel(dir, '.gitignore');
            for (const line of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids/']) {
              assert.ok(gi.includes(line), `--init did not add "${line}" to .gitignore:\n${gi}`);
            }
          });
        });

        // ---- cases: ID graph (orphan markers, counters ahead, links: and issues:) ---
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "fixtureNoWorkstreamsTree, withNoWorkstreamsFixture (task 2.1); fixture, withFixture, EMPTY_TREE, baseTree, WS1, readRel, runGenerator, expectRefusal, wsFolders, idsEntries, warnLines, compareWarnSets, testCase, assert, fs, path (all already defined earlier in the file)"
    compatibility: "The six-combo refusal loop mirrors the existing --new-ws refusal loop's shape (run-tests.mjs:1856-1865) exactly, including expectRefusal()'s generic one-stderr-line assertion with no message text pinned."
    gotcha: "The 'no-op against an existing workstream' case cannot fail at base_commit for the right reason (see its own comment); its discriminating power is the byte-unchanged-record assertion once --init is implemented, not the exit code."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "grep -c 'against a tree already holding a workstream is a no-op' skills/flowcharge/scripts/test/run-tests.mjs — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "All 11 new --init cases sit in one new section between the --status blocked case and the ID graph section, with no existing case altered"
      - "The six-combo refusal case names combo flags exactly as --new-ws's own refusal loop does"
      - "The no-op case's comment records why it cannot discriminate against an unmodified generator, per this task's own gotcha"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 263/263 passed (252 baseline + 11 new cases; 252/252 with none of these cases present at base_commit 69b9d90)"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 2.3 Add `--init` to the `HELP_FLAGS` inventory
    ```yaml
    description: "HELP_FLAGS (run-tests.mjs:2106-2110) lists every flag the 'help documents every flag' case checks for. Add '--init' so that existing case covers the new flag with no new case of its own, per PLN-6-uoxfrt Stage 2."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/scripts/test/run-tests.mjs
        <<<<<<< SEARCH
        const HELP_FLAGS = [
          '--root', '--no-board', '--check', '--sync', '--list', '--ws', '--sort',
          '--desc', '--archived', '--claim', '--new-ws', '--title', '--description',
          '--tags', '--status', '--whoami', '--help',
        ];
        =======
        const HELP_FLAGS = [
          '--root', '--no-board', '--check', '--sync', '--init', '--list', '--ws', '--sort',
          '--desc', '--archived', '--claim', '--new-ws', '--title', '--description',
          '--tags', '--status', '--whoami', '--help',
        ];
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs"
    imports: "None"
    compatibility: "The 'help documents every flag' case (run-tests.mjs ~2131) already iterates HELP_FLAGS with no change needed there; it only passes for --init once task 1.1-1.4 have landed the flag in HELP."
    gotcha: "Add exactly one entry; do not reorder or remove any existing flag."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '/const HELP_FLAGS/,/\\];/p' skills/flowcharge/scripts/test/run-tests.mjs | grep -c -- \"'--init'\" — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "HELP_FLAGS gains exactly one new entry, '--init'"
      - "No existing entry in the array changed or moved"
      - "node skills/flowcharge/scripts/test/run-tests.mjs reports 263/263 passed"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 3. Update `CONVENTIONS.md` and `CHANGELOG.md` for `--init`
  ```yaml
  description: "PLN-6-uoxfrt Stage 3: add --init to CONVENTIONS.md's .gitignore writing-mode sentence and record the new mode as one CHANGELOG.md ### Added line under ## Unreleased, per VERSIONING.md's MINOR mapping."
  ```

  - [ ] 3.1 Add `--init` to `CONVENTIONS.md`'s `.gitignore` writing-mode sentence
    ```yaml
    description: "CONVENTIONS.md:395 lists the writing modes that trigger the .gitignore update: 'the plain regenerate above, --no-board, --claim, --sync, --new-ws'. Add --init so the doc matches fc-index.mjs's own HELP enumeration (task 1.4), per PLN-6-uoxfrt's Design/Stage 3."
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        skills/flowcharge/CONVENTIONS.md
        <<<<<<< SEARCH
        plain regenerate above, `--no-board`, `--claim`, `--sync`, `--new-ws`) checks the
        =======
        plain regenerate above, `--no-board`, `--claim`, `--sync`, `--new-ws`
        and `--init`) checks the
        >>>>>>> REPLACE
    pattern: "skills/flowcharge/CONVENTIONS.md"
    imports: "None"
    compatibility: "Must read the same list, in the same order, as fc-index.mjs's own HELP .gitignore enumeration (task 1.4): the default, --no-board, --sync, --claim, --new-ws, --init."
    gotcha: "This sentence spans the surrounding lines of one paragraph; keep the following line ('project root's .gitignore and appends whichever of...') unchanged apart from the rewrap this edit introduces."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '393,398p' skills/flowcharge/CONVENTIONS.md | grep -c -- '--init' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "The sentence now lists --init alongside the default, --no-board, --claim, --sync, --new-ws"
      - "No other sentence in the Registry or IDs sections changed"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 263/263 passed"
    self_eval:
      passed: false
      failures: []
    ```

  - [ ] 3.2 Add the `--init` `CHANGELOG.md` entry under `## Unreleased`
    ```yaml
    description: "CHANGELOG.md's ## Unreleased section (line 14) is currently empty, directly followed by ## 0.2.0. Add one ### Added line describing the new --init mode, per VERSIONING.md's MINOR mapping (a new capability, everything existing still working) and PLN-6-uoxfrt's Scope: 'Cutting an actual suite release... Only the CHANGELOG.md ## Unreleased line this change earns is in scope.'"
    author: Anthony Koukoullis
    issues: []
    implement:
      - |
        CHANGELOG.md
        <<<<<<< SEARCH
        ## Unreleased

        ## 0.2.0 - 2026-09-13
        =======
        ## Unreleased

        ### Added

        - `fc-index.mjs` gains an `--init` mode: create `flowcharge/workstreams/`
          (and, transitively, `flowcharge/`) when it does not already exist, then
          regenerate `index.md`/`kanban.md` in the same run, so a caller with no
          `flowcharge/` tree yet can produce one and its empty views in a single
          command.

        ## 0.2.0 - 2026-09-13
        >>>>>>> REPLACE
    pattern: "CHANGELOG.md"
    imports: "None"
    compatibility: "VERSIONING.md's mapping: MINOR, a new capability with everything existing still working; matches the ### Added section and the no-brackets release-heading format this file already uses."
    gotcha: "Do not touch the ## 0.2.0 heading or anything below it; this is the only Unreleased-section edit in scope."
    verify:
      - "node skills/flowcharge/scripts/test/run-tests.mjs"
      - "sed -n '/## Unreleased/,/## 0.2.0/p' CHANGELOG.md | grep -c -- '--init' — must print 1 (printed 0 at base_commit 69b9d90)"
    checklist:
      - "The block applied cleanly with no conflict markers left in the file"
      - "## Unreleased now carries one ### Added line describing --init, and nothing else"
      - "The ## 0.2.0 heading and every line below it are unchanged"
      - "node skills/flowcharge/scripts/test/run-tests.mjs still reports 263/263 passed"
    self_eval:
      passed: false
      failures: []
    ```
