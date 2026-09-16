---
id: TL-9-sfeqhm
type: tasklist
workstream: WS-14-xbmk31
slug: pipeline-stage-codebase-resurvey
title: "Merge the paired authoring stages and stop the unconditional file re-survey"
status: ready
created: 2026-09-16
updated: 2026-09-16
author: Anthony Koukoullis
depends_on: [PLN-7-7gnb3p]
links: []
mode: spec
base_commit: c842070
---

# FlowCharge Tasks

## Merge the paired authoring stages and stop the unconditional file re-survey

The FlowCharge authoring pipeline spawns one subagent per artefact. Each spawn pays the
same fixed setup cost and rebuilds codebase knowledge the stage before it already had.
PLN-7-7gnb3p merges each authoring pair into one subagent, removes the re-survey rule
that made the duplication mandatory, and replaces it with a `git diff` staleness check
against a new optional plan key, `base_commit`.

Six plan-path and issue-path template files become four merged ones, addressed by a
`{stages}` slot that selects which of the two artefacts a spawn writes. Two mode defects
that assert SEARCH/REPLACE blocks in spec-mode code paths are corrected. The shared
context documents stop being inlined in full into every spawn.

All code changes land in `~/Work/AK/flowcharge-core-public/`. Every path in this file is
relative to that repository root. This task list lives in
`~/Work/AK/flowcharge-core-archive/`.

The project has no build, lint or type-check toolchain. Its own test command is
`node skills/flowcharge/scripts/test/run-tests.mjs`, which passed 263/263 and exited 0 at
`base_commit` c842070. Every other check here is a static file check: grep, file
existence, or a line count.

Two of the plan's open questions arrived already settled and are not re-raised here.
First, this work lands before WS-118-xjdovc's `validate` setting, so `validate-plan` and
`validate-tasks` stay separately spawned stages run one after the other at the end of the
merged authoring stage. Second, hard rule 12's originating-scenario trace still runs, now
on the merged authoring stage's return. Both are orchestration-process points recorded in
`SKILL.md` prose; neither adds a build step.

Stage ordering inside each parent task matters and is not free to rearrange. A merged
template must exist before any file names it, and a retired template may be deleted only
after no file under `skills/` names it any more. Test rule G fails on a `templates/*.md`
path in `skills/flowcharge/SKILL.md` that does not resolve on disk, and test rule H fails
on a `RULE_H_TEMPLATES` entry whose file is absent.

- [x] 1. Stage 1: plan-path merge

  ```yaml
  description: "Write both plan-and-tasks templates, add the plan base_commit key, retire the three plan-path templates, and update every file that named them."
  ```

  - [x] 1.1 Write `skills/flowcharge/templates/plan-and-tasks-spec.md`
    ```yaml
    description: "Create the merged spec-mode plan-path template carrying the {stages} routing, the plan base_commit key, and the three-rule read gate."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create the new file `skills/flowcharge/templates/plan-and-tasks-spec.md`. Its sections, in this order: `# <title>`, `## Role`, `## Skills`, `## Context`, `## Instructions`, `## Return` (PLN-7-7gnb3p, Design / Merged template structure)."
      - "Open `## Instructions` with the routing paragraph: when `{stages}` is `tasks-only`, read the artefact at `{plan}` in full and start at Part 2; otherwise do Part 1, and when `{stages}` is `plan-only`, stop after it and report."
      - "Part 1 carries the instruction body of `skills/flowcharge/templates/create-plan.md` as it stands now: its frontmatter block, its PLN ID-claim command, and its no-user answers, unchanged. Add `base_commit: <short SHA of HEAD, from git rev-parse --short HEAD>` to that frontmatter block, immediately after `author` and before `depends_on`."
      - "Part 2 carries the instruction body of `skills/flowcharge/templates/tasks-from-plan-spec.md` as it stands now, with its `{plan}` reference replaced by \"the artefact you wrote in Part 1, or the one at `{plan}` when you skipped Part 1\"."
      - "Replace that body's `Before writing any SEARCH/REPLACE block:` precondition block with the three read rules, in this order: (1) run `git diff --name-only <the plan's base_commit>..HEAD` and read again only those files the plan names that appear in that output, reading nothing again when it is empty; (2) when the plan carries no `base_commit`, read every file the plan names; (3) whenever a SEARCH/REPLACE block is written for a file, read that file first and copy the SEARCH text from it, whatever rules 1 and 2 decided."
      - "Keep the divergence rule that sits beside the current read rule, word for word: where a file no longer matches what the plan assumes, author no task for it and record the divergence."
      - "The `## Return` section reports both artefacts, and reports only the one that was written when `{stages}` named one. Close it with the open-question return block copied byte for byte from `create-plan.md`'s current `## Return` section, because test rule H pins that block."
      - "Carry the `{{context docs}}` placeholder over unchanged. Task 4.7 replaces it later."
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md (new file); source bodies read from skills/flowcharge/templates/create-plan.md and skills/flowcharge/templates/tasks-from-plan-spec.md"
    imports: "None. This is a Markdown prompt template with no code dependency."
    compatibility: "PLN-7-7gnb3p, Design / Merged template structure, Slot contracts and The staleness check. Slots: {stages}, {plan}, {ws_dir}, {ws_id}, {slug}, {{context docs}}, one {{briefing}} block. {stages} takes exactly one of plan-only, plan-and-tasks, tasks-only. {plan} is a repo-relative path when {stages} is tasks-only, otherwise the literal none. The {{briefing}} block's own text must name what belongs in it for all three {stages} values, because one block now serves both parts."
    gotcha: "Test rule H collapses whitespace and then requires RULE_H_BLOCK verbatim, so a reworded or retyped open-question block fails the suite. Copy it from create-plan.md, do not retype it. Test rule A rejects a workstream folder path written with no WS id in front of the slug. Do not delete create-plan.md or tasks-from-plan-spec.md in this task; task 1.13 does that after every reference is gone."
    verify:
      - "`test -f skills/flowcharge/templates/plan-and-tasks-spec.md` exits 0. At c842070 the file was absent and this exits 1."
      - "`grep -c '{stages}' skills/flowcharge/templates/plan-and-tasks-spec.md` returns 4 or more. At c842070 grep exits 2, no such file."
      - "`grep -c 'git diff --name-only' skills/flowcharge/templates/plan-and-tasks-spec.md` returns 1. At c842070 `grep -rn 'git diff --name-only' skills/` returned 0 lines across the whole tree."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0. This command already passed 263/263 at c842070, so it does not discriminate on its own; it is here as the regression guard the plan's testing strategy requires at every stage boundary."
    checklist:
      - "Does the file carry all six sections in the plan's stated order?"
      - "Does the routing paragraph name all three {stages} values?"
      - "Is the plan frontmatter block's base_commit key placed after author and before depends_on?"
      - "Are all three read rules present, with rule 1 running git diff against the plan's own base_commit?"
      - "Is the open-question return block byte-identical to the one in create-plan.md?"
      - "Does the file leave create-plan.md and tasks-from-plan-spec.md on disk untouched?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.2 Write `skills/flowcharge/templates/plan-and-tasks-diff.md`
    ```yaml
    description: "Create the merged diff-mode plan-path template, identical to the spec variant except for the mode rules and the retained unconditional read."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create the new file `skills/flowcharge/templates/plan-and-tasks-diff.md` with the same six sections, the same routing paragraph, and the same Part 1 as `plan-and-tasks-spec.md`, including the plan frontmatter `base_commit` key."
      - "Part 2 carries the instruction body of `skills/flowcharge/templates/tasks-from-plan-diff.md` as it stands now, with its `{plan}` reference replaced by the same \"the artefact you wrote in Part 1, or the one at `{plan}` when you skipped Part 1\" wording."
      - "Keep that body's `Before writing any SEARCH/REPLACE block:` precondition block unchanged. PLN-7-7gnb3p (The staleness check) keeps the unconditional read here, because every task in a diff-mode file carries a block."
      - "Close `## Return` with the same open-question return block, copied byte for byte from `create-plan.md`."
      - "Every line the two merged files share must be byte-identical between them. They differ only in the mode rules: the `**diff mode**` frontmatter sentence, the one-SEARCH/REPLACE-block-per-task clause in the decomposition bullet, and the retained precondition block."
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md (new file); source bodies read from skills/flowcharge/templates/create-plan.md and skills/flowcharge/templates/tasks-from-plan-diff.md"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Slot contracts: the spec and diff variants differ only in the mode rules, and a change to any rule they share is made in both files in the same edit. Same slot set as task 1.1."
    gotcha: "The word-for-word copy between tasks-from-plan-spec.md and tasks-from-plan-diff.md is what produced the defect this plan fixes, so the shared text is kept identical by intent and verified by diff rather than by eye. Test rule H requires the open-question block here too."
    verify:
      - "`test -f skills/flowcharge/templates/plan-and-tasks-diff.md` exits 0. At c842070 the file was absent and this exits 1."
      - "`diff skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md` reports only the mode-rule differences named in `implement`, and no difference in the routing paragraph, Part 1, or the `## Return` section. At c842070 diff exits 2, neither file exists."
      - "`grep -c 'Before writing any SEARCH/REPLACE block' skills/flowcharge/templates/plan-and-tasks-diff.md` returns 1, and the same grep against `plan-and-tasks-spec.md` returns 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Is the routing paragraph byte-identical to the one in plan-and-tasks-spec.md?"
      - "Is Part 1 byte-identical to Part 1 of plan-and-tasks-spec.md?"
      - "Does Part 2 keep the unconditional read precondition block unchanged?"
      - "Is the open-question return block byte-identical to the one in create-plan.md?"
      - "Are the only differences from the spec variant the mode rules named in implement?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.3 Document `base_commit` as an optional plan key in `CONVENTIONS.md`
    ```yaml
    description: "Add a plan entry to the Additional keys by type list saying base_commit is optional, that it dates the plan's reading of the codebase, and that no script checks it."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/CONVENTIONS.md`, find the `Additional keys by type:` list. It currently holds two entries: `- `workstream`: …` at line 203 and `- `tasklist`: …` at line 265. Add a `- `plan`:` entry in the same flat bullet form."
      - "State in it that `base_commit` is optional on a plan, that it is the short SHA of HEAD at the moment the plan is authored (read with `git rev-parse --short HEAD`), that it dates the plan's reading of the codebase, and that no script checks it."
      - "Give the reason the key is optional, following the same wording pattern the `workstream` entry uses for the automatic `issue` and `feature` tags: the rule is forward-only, and a required key would WARN across every plan already on disk."
      - "Change nothing in `skills/flowcharge/scripts/fc-index.mjs`. `REQUIRED_KEYS_COMMON` and `REQUIRED_KEYS_EXTRA` stay as they are, and the flat-scalar parser already carries an unknown key through without warning."
    pattern: "skills/flowcharge/CONVENTIONS.md, the `Additional keys by type:` list only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Plan frontmatter: base_commit, and Out of scope: fc-index.mjs and its test fixtures are untouched, no generator behaviour changes."
    gotcha: "`base_commit` already appears three times in this file, all inside the `tasklist` entry. A grep for the bare word will not discriminate; anchor the check on the new `plan` bullet. Do not add the key to REQUIRED_KEYS_COMMON or REQUIRED_KEYS_EXTRA: the plan forbids it and every plan already on disk would then WARN."
    verify:
      - "`grep -c '^- `plan`:' skills/flowcharge/CONVENTIONS.md` returns 1. At c842070 it returned 0."
      - "`git diff --name-only c842070..HEAD -- skills/flowcharge/scripts/fc-index.mjs` returns no line, confirming the generator was not touched."
      - "`node skills/flowcharge/scripts/fc-index.mjs --root . --check` prints no new WARN line for any existing plan."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the new entry sit inside the Additional keys by type list, in the same flat bullet form as its two siblings?"
      - "Does it state that base_commit is optional and that no script checks it?"
      - "Does it give the forward-only reason the key is not required?"
      - "Is fc-index.mjs unchanged?"
      - "Does --check produce no new WARN?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.4 Replace the plan-path rows and notes in `SKILL.md`'s Operations section
    ```yaml
    description: "Fold the create-plan and tasks-from-plan Operations rows into one plan-and-tasks row, and update the tasks-from-plan and validate notes below the table."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in the Operations table, replace the `| create-plan |` row (line 314) and the `| tasks-from-plan |` row (line 316) with one `| plan-and-tasks |` row. Leave the investigate, create-issues, tasks-from-issues, validate, execute-tasks, commit, backlog-add, upkeep and list rows alone; task 3.3 handles the issue-path rows."
      - "The new row names both template files (`templates/plan-and-tasks-spec.md` or `-diff.md`), its full slot set including `{stages}` and `{plan}`, what it consumes, and both artefacts it returns."
      - "In the Notes list below the table, rewrite the `- **tasks-from-plan**:` bullet so hard rule 12's trace applies to the merged stage's return rather than to a spawn that no longer exists, and rename the bullet to `- **plan-and-tasks**:`."
      - "In the `- **validate**:` bullet, pair the merged plan stage with both validation templates run after it in a fixed order, `validate-plan` first then `validate-tasks`, and note that WS-118-xjdovc later replaces this pair with its single pass. Leave the create-issues and tasks-from-issues half of that bullet for task 3.3."
      - "Leave hard rule 9 alone. It already says the mode chooses the template, and that meaning carries to the merged pair unchanged."
    pattern: "skills/flowcharge/SKILL.md, the `## Operations` table and its Notes list only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, and Out of scope: the validate-plan.md, validate-issues.md and validate-tasks.md template bodies are not touched, only when they are spawned. Total validation coverage is unchanged from today."
    gotcha: "Test rule G resolves every `templates/*.md` short form written in this one file against disk. Writing `templates/plan-and-tasks-spec.md` here before task 1.1 has created it fails the suite, so 1.1 and 1.2 must land first. Both merged templates already exist by this point, so the row is safe."
    verify:
      - "`grep -c '| plan-and-tasks |' skills/flowcharge/SKILL.md` returns 1. At c842070 it returned 0."
      - "`grep -c '| create-plan |' skills/flowcharge/SKILL.md` returns 0, and `grep -c '| tasks-from-plan |' skills/flowcharge/SKILL.md` returns 0. At c842070 each returned 1."
      - "`grep -c '{stages}' skills/flowcharge/SKILL.md` returns 1 or more. At c842070 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0. Test rule G is the discriminating case here: it fails on any templates/*.md path in this file that does not resolve."
    checklist:
      - "Does one plan-and-tasks row replace exactly the two plan-path rows, leaving every other row intact?"
      - "Does the row name both merged template files, the {stages} slot, and both returned artefacts?"
      - "Does the renamed notes bullet put hard rule 12's trace on the merged stage's return?"
      - "Does the validate bullet name validate-plan first, then validate-tasks?"
      - "Is hard rule 9 unchanged?"
      - "Does the test suite still exit 0?"
    self_eval:
      passed: true
      failures:
        - item: "Does the test suite still exit 0?"
          reason: "Test rule C flagged the new row's templates/plan-and-tasks-spec.md path in skills/flowcharge/SKILL.md as a bare artefact filename. ruleCMatches fires on plan followed by -<words>.md whenever the character in front of plan is neither a word character nor a hyphen, and the / of templates/ clears that guard. The retired tasks-from-plan-spec.md never matched, because its plan sat behind a hyphen. The suite dropped to 262/263. Neither PLN-7-7gnb3p nor this task list foresaw it, and the Divergences section does not record it."
          fix: "Added one DOCS_ALLOWLIST entry in skills/flowcharge/scripts/test/run-tests.mjs, keyed on file flowcharge/SKILL.md and text plan-and-tasks-spec.md, with a why recording that the match is a prompt template under templates/ rather than an artefact a workstream folder holds, so it carries no id prefix, and that the Operations table must write the path in full because test rule G resolves every templates/*.md short form in that file against disk. The suite returned to 263/263. This is the only edit made outside the files parent task 1 names."
    ```
  - [x] 1.5 Move hard rule 12's trace onto the merged stage's return in `SKILL.md`
    ```yaml
    description: "Rewrite hard rule 12 so the originating-scenario trace runs on the merged authoring stage's return, and keeps its present position before the spawn in a tasks-only run."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, hard rule 12 begins at line 142 with `**A plan is checked against its motivating scenario before tasks are authored from it.**` and its body opens `Before spawning the tasks-from-plan stage for any plan, …`."
      - "Change only the timing clause: in a merged run the trace runs on the merged stage's return, because there is no spawn between the plan and the tasks. In a `tasks-only` run it keeps its present position, before the spawn."
      - "Keep everything else word for word: it still reads the plan and the workstream record, still states one line per scenario, still halts before the next stage when a named scenario is not visibly handled, is still the orchestrator's own reading under rule 8's carve-out, and still supplements rather than replaces a walkthrough task."
      - "Do not build the halt mechanism. It is orchestration prose that already exists; this task only moves when it fires."
    pattern: "skills/flowcharge/SKILL.md, hard rule 12 only (from line 142 to the end of that numbered item)"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, third bullet. The plan's second open question arrived settled: the trace survives in its new, later position."
    gotcha: "The rule's own heading sentence says \"before tasks are authored from it\", which stops being literally true in a merged run. Reword the heading sentence too, or the rule contradicts its own body. Do not touch hard rule 13, which reads base_commit on a task list and is a different check."
    verify:
      - "`grep -c 'Before spawning the tasks-from-plan stage for any' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'tasks-only' skills/flowcharge/SKILL.md` returns 1 or more. At c842070 it returned 0."
      - "`grep -c 'halt and report instead of spawning' skills/flowcharge/SKILL.md` returns 1 or more, confirming the halt clause survived the rewrite."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the rule now fire on the merged stage's return?"
      - "Does it keep its present pre-spawn position for a tasks-only run?"
      - "Does the heading sentence still match the body after the edit?"
      - "Do the read-the-plan-and-record, one-line-per-scenario, and halt clauses survive unchanged?"
      - "Is hard rule 13 untouched?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.6 Name the merged plan stage in `SKILL.md`'s Parsing the request chains
    ```yaml
    description: "Update the standard chains so plan X maps to the merged stage and turn a plan into tasks maps to it with {stages}: tasks-only."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Parsing the request`, the chain at line 385 reads `- \"plan X [and build it]\" → create-plan → validate → tasks-from-plan → validate → [prompt] execute-tasks → [prompt] commit`. Rewrite it to run the merged stage once, followed by `validate-plan` and then `validate-tasks` in that fixed order, then the two prompted stages."
      - "In the same list, line 389 reads `- \"turn <issue list / plan> into tasks\" → tasks-from-issues / tasks-from-plan`. Rewrite its plan half to map to the merged template with `{stages}: tasks-only`. Leave its issue half for task 3.4."
      - "In the same list, the chain at lines 387 to 388 reads `- \"look into X\" / \"investigate X\" → investigate (then stop; feed into create-plan or backlog-add only if asked)`. Replace `create-plan` in it with the merged stage's name and change nothing else in the line."
      - "Leave the findings chain at line 382 and every other line in this section alone."
    pattern: "skills/flowcharge/SKILL.md, the standard-chains bullet list inside `## Parsing the request`"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, fifth bullet, and the settled first open question: both validation stages are kept and run one after the other at the end of the merged run until WS-118-xjdovc replaces the sequencing."
    gotcha: "The chain line is the user-facing description of the pipeline, so it must match the validate note edited in task 1.4. If one says validate-plan then validate-tasks and the other says a single validate, the file contradicts itself."
    verify:
      - "`grep -c 'create-plan → validate → tasks-from-plan' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'plan-and-tasks' skills/flowcharge/SKILL.md` returns 4 or more, covering the Operations row from task 1.4 and the three chain lines from this one. At c842070 it returned 0."
      - "`grep -c 'feed into create-plan' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -n 'turn <issue list / plan> into tasks' skills/flowcharge/SKILL.md` still returns one line, and that line's plan half names `{stages}: tasks-only`."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the plan X chain run one merged authoring stage instead of two?"
      - "Does it name validate-plan before validate-tasks?"
      - "Does the turn-a-plan-into-tasks line map to the merged template with {stages}: tasks-only?"
      - "Does the look-into-X chain's feed-into note name the merged stage instead of create-plan?"
      - "Is the issue half of that line left for stage 3?"
      - "Is the findings chain untouched?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.7 Name `tasks-only` as the re-spawn route in `SKILL.md`'s Chaining section
    ```yaml
    description: "Make the chaining section's re-spawn paragraph name tasks-only as the route that re-derives a task list after a plan-level correction, and rename the section's passing create-plan mention."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Chaining`, find the re-spawn paragraph inside the `- Open ends terminate chains:` bullet. It currently ends `… re-spawn that one stage once, with the question and the adopted answer in its `{{briefing}}`, rather than leaving the stage untasked. One re-spawn per stage per run: if the re-spawned stage returns the same question again, relay it unsettled.`"
      - "Add the plan-path case: after a plan-level correction, the re-spawn uses the merged template with `{stages}: tasks-only` and `{plan}` pointing at the corrected plan, so one re-spawn re-derives the task list without re-authoring the plan."
      - "In the same section, the second bullet (line 447 at `base_commit`) reads `- create-issues path → `{issuelist}`; create-plan path → `{plan}`; task-list path → `{tasklist}`.` Replace `create-plan` in it with the merged plan stage's name and keep the `{plan}` mapping as it is. Leave `create-issues` in that line for task 3.4."
      - "Keep the one-re-spawn-per-stage-per-run bound and the relay-unsettled fallback exactly as written. Leave the validator-applied path and the rest of the section alone."
    pattern: "skills/flowcharge/SKILL.md, the re-spawn paragraph inside `## Chaining`'s `- Open ends terminate chains:` bullet, and the plan half of that section's second bullet"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, sixth bullet, and Key flows / Correct a plan after its tasks exist."
    gotcha: "Do not widen the one-re-spawn bound. The plan changes which template the re-spawn uses, never how many re-spawns a run allows. The `{plan}` slot must be named too, or the route is underspecified: {stages}: tasks-only without a {plan} path has nothing to read."
    verify:
      - "`grep -c 'tasks-only' skills/flowcharge/SKILL.md` returns 3 or more, covering hard rule 12 from task 1.5, the chain line from task 1.6, and this paragraph. At c842070 it returned 0."
      - "`grep -c 'One re-spawn per stage per run' skills/flowcharge/SKILL.md` returns 1, confirming the bound survived. At c842070 it returned 1."
      - "`grep -c 'create-plan path' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "The re-spawn paragraph names both `{stages}: tasks-only` and `{plan}`, confirmed by reading the paragraph."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the paragraph name tasks-only as the plan-level-correction route?"
      - "Does it name the {plan} slot alongside it?"
      - "Is the one-re-spawn-per-stage-per-run bound unchanged?"
      - "Does the section's second bullet name the merged plan stage, with the {plan} mapping and its create-issues half unchanged?"
      - "Is the validator-applied path untouched?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.8 Fire the automatic-tag upkeep bullet after the merged plan stage
    ```yaml
    description: "Update SKILL.md's After every stage upkeep bullet so the automatic issue and feature tags fire after the merged plan stage, and both artefacts it produced get a status."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## FlowCharge Core upkeep`, the `- **After every stage**:` bullet reads `… then (after a create-issues or create-plan stage only) test the produced file for its trigger …`. Replace `create-plan` in that parenthesis with the merged plan stage's name. Leave `create-issues` in place; task 3.5 replaces it."
      - "In the same bullet, make the status-setting clause set the status of both artefacts a merged stage produced, not just one."
      - "Leave the two trigger definitions untouched: `issue` still fires on a filed issue list in the workstream folder, `feature` still fires on a `PLN-*-plan.md` file in it. CONVENTIONS.md's tags section is not changed by this task."
    pattern: "skills/flowcharge/SKILL.md, the `- **After every stage**:` bullet inside `## FlowCharge Core upkeep`"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, last bullet. CONVENTIONS.md's workstream `tags` entry already defines the two automatic tags and is out of this task's scope."
    gotcha: "The intermediate state between stage 1 and stage 3 is correct only if create-issues stays named here: it is still a separate stage until task 3.5 lands. Replacing both names now would make the file wrong for the whole window."
    verify:
      - "`grep -c 'after a create-issues or create-plan stage' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'create-issues' skills/flowcharge/SKILL.md` returns 1 or more, confirming create-issues is still named for its own still-live stage."
      - "The bullet's status clause names both artefacts a merged stage produced, confirmed by reading the bullet."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the parenthesis name the merged plan stage instead of create-plan?"
      - "Is create-issues still named, unchanged, in the same parenthesis?"
      - "Does the status clause cover both artefacts of a merged stage?"
      - "Are the issue and feature trigger definitions unchanged?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.9 Fold the plan-path rows in `README.md`'s operations table
    ```yaml
    description: "Replace README.md's create-plan and tasks-from-plan operation rows with one plan-and-tasks row."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `README.md`, in the operations table that starts at line 89 at `base_commit`, replace the `| create-plan ` row (line 93) and the `| tasks-from-plan ` row (line 95) with one `| plan-and-tasks ` row. Locate the rows by their leading text if the file has moved since `base_commit`."
      - "Keep the table's three columns and its existing column alignment: Operation, What it does, Say something like. The new row's What it does says it writes a staged plan and authors its task list in one stage; its Say something like keeps a plain-English phrase in the same register as the rows around it."
      - "Leave the backlog-add, investigate, create-issues, tasks-from-issues, execute-tasks, commit and list rows alone. Task 3.6 handles the issue-path rows."
    pattern: "README.md, the operations table only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, first bullet."
    gotcha: "README.md sits at the repository root, outside `skills/`, so no test rule scans it. Nothing catches a typo here; check it by reading. The table is whitespace-aligned in the source, so a longer operation name may need the separator row and the neighbouring cells re-padded for the source to stay readable."
    verify:
      - "`grep -c '^| create-plan ' README.md` returns 0, and `grep -c '^| tasks-from-plan ' README.md` returns 0. At c842070 each returned 1."
      - "`grep -c '^| plan-and-tasks ' README.md` returns 1. At c842070 it returned 0."
      - "`grep -c 'create-issues\\|tasks-from-issues' README.md` returns 2, unchanged from c842070, confirming the issue-path rows were left for stage 3."
      - "The table still has the same number of columns in every row, confirmed by reading it."
    checklist:
      - "Does one plan-and-tasks row replace exactly the two plan-path rows?"
      - "Are the issue-path rows untouched?"
      - "Does every row still carry three columns?"
      - "Does the new row's phrasing match the register of its neighbours?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.10 Retire the `tasks-from-plan` reference in `fc-plan-feature/SKILL.md`
    ```yaml
    description: "Rewrite the closing sentence that states tasks-from-plan owns the task-list export and that create-plan authors a plan only."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/fc-plan-feature/SKILL.md`, the sentence at lines 355 to 357 reads `Inside a `flowcharge` pipeline the `tasks-from-plan` operation owns this step, so the `create-plan` stage authors a plan only.`"
      - "Rewrite it to name the merged stage: inside a `flowcharge` pipeline, the merged plan-and-tasks operation owns the export step, and it authors the plan only when `{stages}` is `plan-only`."
      - "Leave the two sentences before it unchanged. They state that the export realises the plan's stages as tasks and that design and open questions stay in the plan file, and neither depends on the stage name."
    pattern: "skills/fc-plan-feature/SKILL.md, the final sentence of the file"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, second bullet."
    gotcha: "This file is scanned by every skills/**/*.md test rule. Rule G resolves `skills/`-rooted paths from the repository root but only reads `templates/*.md` short forms inside `skills/flowcharge/SKILL.md`, so naming a template here by its short form is not checked and is better avoided: name the operation, not the file."
    verify:
      - "`grep -c 'tasks-from-plan\\|create-plan' skills/fc-plan-feature/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'plan-and-tasks' skills/fc-plan-feature/SKILL.md` returns 1. At c842070 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the sentence name the merged operation instead of the two retired ones?"
      - "Does it say the plan-only value of {stages} is what authors a plan alone?"
      - "Are the preceding two sentences unchanged?"
      - "Does the sentence avoid writing a templates/*.md short form?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.11 Point `RULE_H_TEMPLATES` at the merged plan-path templates
    ```yaml
    description: "Replace the three retired plan-path entries in the test file's RULE_H_TEMPLATES array with the two merged ones, and update the comment naming the master copy."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, the `RULE_H_TEMPLATES` array at lines 4851 to 4858 holds six entries. Replace the three plan-path entries at lines 4852 to 4854 (`create-plan.md`, `tasks-from-plan-spec.md`, `tasks-from-plan-diff.md`) with two: `flowcharge/templates/plan-and-tasks-spec.md` and `flowcharge/templates/plan-and-tasks-diff.md`."
      - "Leave the three validate entries at lines 4855 to 4857 in place and in order."
      - "Update the comment at line 4844, which names `create-plan.md` as the master copy the collapsed `RULE_H_BLOCK` was taken from, so it names a template that still exists. In the same comment block, lines 4834 to 4838 count `Six prompt templates` and say the rule pins the block `in all six at once`; change both counts to five, because the array now holds five entries."
      - "Change `RULE_H_BLOCK` itself in no way. The block text is unchanged by this plan."
      - "Leave the comment at lines 4839 to 4842 about the tasks-from-issues templates alone. Task 3.7 updates it."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the RULE_H_TEMPLATES array and the comment block directly above it"
    imports: "None. Plain JavaScript array literal edit."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, third bullet, and Data & compatibility / Rollback: every change is Markdown prose plus one JavaScript array in the test file."
    gotcha: "ruleHTemplatesMissingBlock reports `the template was not found in the tree` for a listed file that is absent, so this array must name only files that exist when the suite runs. Tasks 1.1 and 1.2 have already created both merged templates, and task 1.13 has not yet deleted the retired ones, so this edit is safe at exactly this point in the order."
    verify:
      - "`grep -c \"'flowcharge/templates/plan-and-tasks\" skills/flowcharge/scripts/test/run-tests.mjs` returns 2. At c842070 it returned 0."
      - "`grep -c \"'flowcharge/templates/create-plan.md',\\|'flowcharge/templates/tasks-from-plan\" skills/flowcharge/scripts/test/run-tests.mjs` returns 0. At c842070 it returned 3."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, and its `every open-question-capable prompt template carries the verbatim return block` case reports ok. This is the discriminating check: if either merged template's open-question block was reworded in task 1.1 or 1.2, this case fails here."
    checklist:
      - "Does RULE_H_TEMPLATES hold five entries: two merged plan-path and three validate?"
      - "Are the three validate entries unchanged and in their original order?"
      - "Does the master-copy comment name a template that exists on disk?"
      - "Does the comment block's template count now say five, matching the array?"
      - "Is RULE_H_BLOCK byte-identical to what it was at c842070?"
      - "Does the rule H test case still report ok?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.12 Re-point the rule G self-test fixture away from `create-plan.md`
    ```yaml
    description: "Replace the two create-plan.md paths hard-coded in rule G's in-memory self-test so deleting the retired template does not fail the suite. See Divergence 1."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, the test case `skills/**/*.md: every path written in the prose resolves on disk` builds a `present` sample array at lines 4966 to 4970. Line 4968 is `{ file: RULE_G_PROMPT_SHORT_FORM_FILE, text: 'run templates/create-plan.md' },` and line 4969 is `{ file: 'sample/SKILL.md', text: 'the slot <skills-dir>/flowcharge/templates/create-plan.md' },`."
      - "Line 4968 is the discriminating one: rule G's form-1 branch resolves that short form against `skills/flowcharge/templates/`, and the assertion on line 4971 requires it to resolve. Once task 1.13 deletes `create-plan.md`, it does not, and the case fails. Change the filename in it to a template that survives, `plan-and-tasks-spec.md`."
      - "Line 4969 exercises the `<skills-dir>/` placeholder exclusion and is never resolved against disk, so it would keep passing either way. Change its filename to the same surviving template anyway, so the fixture does not name a file the tree no longer holds."
      - "Change nothing else in the case: the `missing` sample, the `does-not-exist.md` assertion, the `CONVENTIONS.md` sample and the live-tree sweep at line 4973 all stay as they are."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the `present` sample array inside rule G's test case"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, third bullet, extended: see Divergence 1. The plan names only RULE_H_TEMPLATES inside this file."
    gotcha: "This task must land before task 1.13. If the delete runs first, the suite fails and the stage boundary is not clean. The two lines are not interchangeable: only line 4968 is resolved against disk, because rule G's form-1 branch fires solely for RULE_G_PROMPT_SHORT_FORM_FILE."
    verify:
      - "`grep -c \"templates/create-plan.md\" skills/flowcharge/scripts/test/run-tests.mjs` returns 0. At c842070 it returned 3 (lines 4852, 4968 and 4969); once task 1.11 has cleared the array entry at line 4852 it returns 2, and this task clears the last two."
      - "`grep -c \"run templates/plan-and-tasks-spec.md\" skills/flowcharge/scripts/test/run-tests.mjs` returns 1. At c842070 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, and its rule G case reports ok."
    checklist:
      - "Do both fixture lines name a template that exists on disk?"
      - "Is the `missing` sample and its does-not-exist.md assertion unchanged?"
      - "Is the live-tree sweep at the end of the case unchanged?"
      - "Does the rule G case still report ok?"
      - "Did this task land before the retired templates were deleted?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.13 Delete the three retired plan-path templates
    ```yaml
    description: "Remove create-plan.md, tasks-from-plan-spec.md and tasks-from-plan-diff.md now that nothing names them."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Delete `skills/flowcharge/templates/create-plan.md`, `skills/flowcharge/templates/tasks-from-plan-spec.md` and `skills/flowcharge/templates/tasks-from-plan-diff.md` with `git rm`."
      - "Run the stage's two sweep greps first, and do not delete until both return 0. If either still returns a line, the file naming a retired template is a missed reference: fix it in whichever of tasks 1.4 to 1.12 owns that file rather than deleting anyway."
      - "The three deletions are one coherent change: each retired template is unreachable only once all three are gone, and the sweep greps and the test suite are a single verify sequence over the set."
    pattern: "skills/flowcharge/templates/create-plan.md, skills/flowcharge/templates/tasks-from-plan-spec.md, skills/flowcharge/templates/tasks-from-plan-diff.md"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Acceptance criterion 1, and Stages / stage 1's stated observable: no file under `skills/` names a retired plan-path template. Data & compatibility / Installed skill folders: a user unzipping a release over an old folder keeps the retired files, which task 1.14's CHANGELOG entry restates."
    gotcha: "Delete last in the stage. Test rule G fails on any templates/*.md short form left in skills/flowcharge/SKILL.md that no longer resolves, and test rule H fails on a RULE_H_TEMPLATES entry whose file is absent. Both are cleared by tasks 1.4, 1.11 and 1.12, which must all have landed."
    verify:
      - "`grep -rn 'create-plan\\|tasks-from-plan' skills/ | wc -l` returns 0. At c842070 it returned 19 lines, across skills/flowcharge/SKILL.md (12), skills/flowcharge/scripts/test/run-tests.mjs (6) and skills/fc-plan-feature/SKILL.md (1)."
      - "`ls skills/flowcharge/templates/create-plan.md skills/flowcharge/templates/tasks-from-plan-spec.md skills/flowcharge/templates/tasks-from-plan-diff.md 2>/dev/null | wc -l` returns 0. At c842070 it returned 3."
      - "`ls skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md 2>/dev/null | wc -l` returns 2, confirming acceptance criterion 1's positive half. At c842070 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0. Rules G and H are the discriminating cases: either fails immediately if a reference was missed."
    checklist:
      - "Are all three retired plan-path templates gone from the tree?"
      - "Do both merged plan-path templates exist?"
      - "Does the sweep grep over skills/ return zero lines?"
      - "Does the test suite still exit 0, with rules G and H both reporting ok?"
      - "Were the files removed with git rm rather than left as untracked deletions?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.14 Record stage 1 in `CHANGELOG.md`
    ```yaml
    description: "Append the stage 1 entry under ## Unreleased, including the note that an installed skill folder keeps the retired templates unless the older folder is deleted first."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `CHANGELOG.md`, append an entry under the `## Unreleased` heading at line 14, which is empty at `base_commit`. Use Keep a Changelog subsection headings (`### Added`, `### Changed`, `### Removed`) as the change warrants."
      - "Record: the two merged plan-path templates added; the three plan-path templates removed; the optional `base_commit` plan key; the `{stages}` slot; and the staleness check replacing the unconditional spec-mode re-survey."
      - "State that a user unzipping a release over an existing skill folder keeps the retired templates on disk, and that `README.md`'s instruction to delete the older folder of the same name first applies to this release."
      - "Bump no version. The release command stamps versions, per CONTRIBUTING.md."
    pattern: "CHANGELOG.md, the `## Unreleased` section only"
    imports: "None."
    compatibility: "CONTRIBUTING.md's changelog step, and PLN-7-7gnb3p's Stages closing note plus Data & compatibility / Installed skill folders. The release heading form is `## X.Y.Z - YYYY-MM-DD` with no brackets, because checkSuiteVersion matches `^## (\\d+\\.\\d+\\.\\d+)`."
    gotcha: "Do not add a version heading and do not bracket anything. The `## Unreleased` heading already exists; append under it rather than creating a second one."
    verify:
      - "`awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | grep -c .` returns 3 or more non-blank lines. At c842070 it returned 0."
      - "`grep -c '^## Unreleased' CHANGELOG.md` returns 1, confirming no second heading was created. At c842070 it returned 1."
      - "`grep -c '^## \\[' CHANGELOG.md` returns 0, confirming no bracketed heading was added. At c842070 it returned 0."
      - "`node skills/flowcharge/scripts/fc-index.mjs --root . --check` prints no suite-version warning."
    checklist:
      - "Does the entry sit under the existing ## Unreleased heading?"
      - "Does it record the added templates, the removed templates, the base_commit key, the {stages} slot and the staleness check?"
      - "Does it carry the delete-the-older-folder-first note?"
      - "Is no version number added or bumped?"
    self_eval:
      passed: true
      failures: []
    ```

- [x] 2. Stage 2: the execute-template mode branch

  ```yaml
  description: "Replace execute-parent-task.md's unconditional SEARCH/REPLACE assertion with a branch on the task list's mode key."
  ```

  - [x] 2.1 Branch `execute-parent-task.md` on the task list's `mode` key
    ```yaml
    description: "Replace the sentence asserting literal blocks, and the two state-test bullets under it, with a per-mode branch covering diff, spec, and a block-carrying subtask in either."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/execute-parent-task.md`, the `## Instructions` section opens at line 23 with `Execute the nominated parent task and its subtasks, and nothing else. Change no other file, fix no adjacent problem, refactor nothing you notice along the way. This file carries literal SEARCH/REPLACE blocks: apply them verbatim rather than redesigning the change.`"
      - "Keep the first two sentences. Replace the third, the one asserting the file carries literal blocks, with an instruction to read the task list's frontmatter `mode` key and follow the matching branch below."
      - "Rewrite the two bullets at lines 25 and 26, which today state the state test, the already-applied test and the stale-block abort, as three branch rules. `mode: diff`: apply each block verbatim, with the state test, the already-applied test and the stale-block abort exactly as written today. `mode: spec`: derive each edit from the subtask's `implement` prose and the anchor it names, against its `imports`, `compatibility` and `gotcha` constraints; the state test is whether the described outcome is already present in the target file; where the named anchor is absent, abort that subtask exactly as a stale block aborts, leaving it unchecked, recording the mismatch in `self_eval.failures`, and reporting it. Third rule: a subtask carrying a SEARCH/REPLACE block follows the diff rules whatever the file's `mode` says, which covers the spec-mode exception, the per-task `mode: diff` override, and a task list with no `mode` key at all."
      - "Leave the remaining bullets unchanged: the verify-step restriction at line 27, the checklist evaluation at line 28, the `self_eval.passed` rule at line 29, and the `updated` bump at line 30."
      - "Leave the `## Role`, `## Skills`, `## Parent Task Number`, `## Task List`, `## Context` and `## Return` sections unchanged. Task 4.6 replaces this file's context block later."
    pattern: "skills/flowcharge/templates/execute-parent-task.md, the `## Instructions` lead-in sentence and its first two bullets"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / execute-parent-task.md: the mode branch. fc-task-list's schema guarantees every task list carries `mode`, and its per-task `mode` override and spec-mode block exception are what the third rule covers. Data & compatibility / Runs in flight: a diff-mode list must take exactly today's path."
    gotcha: "The `## Role` line still says the executor is applying pre-authored changes to code, which is true of both branches, so leave it. Do not change the verify-step restriction: it already permits grep and file-existence checks, which a spec-mode task needs. Do not touch self_eval, the checklist evaluation or the updated bump, which the plan names as unchanged."
    verify:
      - "`grep -c 'This file carries literal SEARCH/REPLACE blocks' skills/flowcharge/templates/execute-parent-task.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'mode' skills/flowcharge/templates/execute-parent-task.md` returns 3 or more. At c842070 it returned 0, so the word does not appear anywhere in the file today."
      - "`grep -c 'self_eval.failures' skills/flowcharge/templates/execute-parent-task.md` returns 2 or more, confirming both the diff abort and the spec abort record a failure. At c842070 it returned 2, so pair this with the previous step rather than reading it alone."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the lead-in tell the executor to read the task list's frontmatter mode key?"
      - "Does the diff branch keep the state test, the already-applied test and the stale-block abort word for word?"
      - "Does the spec branch abort on a missing anchor, leaving the subtask unchecked and recording it in self_eval.failures?"
      - "Does the third rule make a block-carrying subtask follow the diff rules whatever the file's mode says?"
      - "Are the verify, checklist, self_eval.passed and updated bullets unchanged?"
      - "Would a diff-mode task list authored before this change still take exactly today's path?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 2.2 Record stage 2 in `CHANGELOG.md`
    ```yaml
    description: "Append the stage 2 entry under ## Unreleased, recording the execute template's mode branch."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `CHANGELOG.md`, add the stage 2 entry under the existing `## Unreleased` heading, alongside the stage 1 entry task 1.14 wrote. Use the same Keep a Changelog subsection headings; merge into an existing `### Changed` subsection rather than opening a second one."
      - "Record that `execute-parent-task.md` now branches on the task list's `mode` key: a diff-mode subtask applies its block verbatim, a spec-mode subtask derives the edit from its `implement` prose and aborts when the named anchor is absent, and a block-carrying subtask follows the diff rules whatever the file's mode says."
      - "State that a task list authored before this change executes unchanged, because a diff-mode list takes exactly the previous path."
      - "Bump no version."
    pattern: "CHANGELOG.md, the `## Unreleased` section only"
    imports: "None."
    compatibility: "CONTRIBUTING.md's changelog step, PLN-7-7gnb3p's Stages closing note, and Data & compatibility / Runs in flight."
    gotcha: "Task 1.14 has already opened subsections under `## Unreleased`. Adding a second `### Changed` under the same heading produces a malformed section."
    verify:
      - "`grep -c 'execute-parent-task' CHANGELOG.md` returns 1 or more. At c842070 it returned 0."
      - "`awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | grep -c '^### Changed'` returns 1 at most, confirming no duplicate subsection."
      - "`grep -c '^## Unreleased' CHANGELOG.md` returns 1. At c842070 it returned 1."
    checklist:
      - "Does the entry sit under the existing ## Unreleased heading?"
      - "Does it describe all three branch rules?"
      - "Does it state that a pre-existing task list executes unchanged?"
      - "Is there exactly one ### Changed subsection under ## Unreleased?"
      - "Is no version number added or bumped?"
    self_eval:
      passed: true
      failures: []
    ```

- [ ] 3. Stage 3: issue-path merge

  ```yaml
  description: "Write both issues-and-tasks templates preserving the issue spec template's anchor rule word for word, retire the three issue-path templates, and update SKILL.md and README.md."
  ```

  - [ ] 3.1 Write `skills/flowcharge/templates/issues-and-tasks-spec.md`
    ```yaml
    description: "Create the merged spec-mode issue-path template, keeping tasks-from-issues-spec.md's read-the-target-file-and-derive-the-anchor rule word for word."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create the new file `skills/flowcharge/templates/issues-and-tasks-spec.md` with the same six sections and the same shape stage 1 settled in `plan-and-tasks-spec.md`: `# <title>`, `## Role`, `## Skills`, `## Context`, `## Instructions`, `## Return`."
      - "Open `## Instructions` with the routing paragraph, in the issue path's three values: when `{stages}` is `tasks-only`, read the artefact at `{issuelist}` in full and start at Part 2; otherwise do Part 1, and when `{stages}` is `issues-only`, stop after it and report."
      - "Part 1 carries the instruction body of `skills/flowcharge/templates/create-issues.md` as it stands now, with its frontmatter block, its IL and ISS ID-claim commands, and its defects-only and reference-documentation rules unchanged."
      - "Part 2 carries the instruction body of `skills/flowcharge/templates/tasks-from-issues-spec.md` as it stands now, with each `{issuelist}` reference replaced by \"the artefact you wrote in Part 1, or the one at `{issuelist}` when you skipped Part 1\"."
      - "Keep that body's second bullet word for word. It is the sentence beginning `Express each source change in `implement` as prose that names the target file and the **anchor** within it`, through `Illustrative code is allowed at roughly ten lines or fewer and must be labelled as illustrative.` Do not gate it behind a staleness check: a spec-mode `implement` step genuinely needs the anchor derived from the file as read."
      - "The `## Return` section reports both artefacts, and reports only the one that was written when `{stages}` named one. Do not add the open-question return block: neither issue-path template returns an open question, and task 3.7's comment records why."
      - "Carry the `{{context docs}}` placeholder over unchanged. Task 4.9 replaces it later."
    pattern: "skills/flowcharge/templates/issues-and-tasks-spec.md (new file); source bodies read from skills/flowcharge/templates/create-issues.md and skills/flowcharge/templates/tasks-from-issues-spec.md"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Merged template structure and The staleness check, last paragraph. Slots: {stages}, {issuelist}, {ws_dir}, {ws_id}, {slug}, {{context docs}}, one {{briefing}} block. {stages} takes exactly one of issues-only, issues-and-tasks, tasks-only."
    gotcha: "Acceptance criterion 6 is byte-exact: the anchor sentence must survive word for word, so copy it from tasks-from-issues-spec.md rather than retyping it. Adding the open-question return block here would be wrong and would also add the file to rule H's obligations without it being in RULE_H_TEMPLATES."
    verify:
      - "`test -f skills/flowcharge/templates/issues-and-tasks-spec.md` exits 0. At c842070 the file was absent and this exits 1."
      - "`grep -c 'derive every anchor, line reference and quoted identifier from the file as read in this session' skills/flowcharge/templates/issues-and-tasks-spec.md` returns 1, satisfying acceptance criterion 6. At c842070 grep exits 2, no such file; the same string returned 1 in tasks-from-issues-spec.md."
      - "`grep -c 'issues-only' skills/flowcharge/templates/issues-and-tasks-spec.md` returns 1 or more. At c842070 `grep -rn 'issues-only' skills/` returned 0 lines."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the file carry all six sections in the same order as plan-and-tasks-spec.md?"
      - "Does the routing paragraph name issues-only, issues-and-tasks and tasks-only?"
      - "Is the anchor rule byte-identical to the one in tasks-from-issues-spec.md?"
      - "Is the anchor rule left ungated by any staleness check?"
      - "Does the Return section report both artefacts, and only one when {stages} named one?"
      - "Is the open-question return block correctly absent?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.2 Write `skills/flowcharge/templates/issues-and-tasks-diff.md`
    ```yaml
    description: "Create the merged diff-mode issue-path template, keeping tasks-from-issues-diff.md's rule unchanged."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create the new file `skills/flowcharge/templates/issues-and-tasks-diff.md` with the same six sections, the same routing paragraph, and the same Part 1 as `issues-and-tasks-spec.md`."
      - "Part 2 carries the instruction body of `skills/flowcharge/templates/tasks-from-issues-diff.md` as it stands now, with each `{issuelist}` reference replaced by the same \"the artefact you wrote in Part 1, or the one at `{issuelist}` when you skipped Part 1\" wording."
      - "Keep that body's block rule unchanged, the bullet beginning `Express every source change as a literal SEARCH/REPLACE block whose SEARCH text you copied from the file as read in this session.`"
      - "Every line the two merged issue-path files share must be byte-identical between them. They differ only in the mode rules: the `**diff mode**` frontmatter sentence, the one-block-one-file clause, and the prose-versus-block bullets in Part 2."
      - "Do not add the open-question return block, for the same reason as task 3.1."
    pattern: "skills/flowcharge/templates/issues-and-tasks-diff.md (new file); source bodies read from skills/flowcharge/templates/create-issues.md and skills/flowcharge/templates/tasks-from-issues-diff.md"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Slot contracts: the spec and diff variants differ only in the mode rules, and the merged pair keeps the shared text identical by intent, verified by grep rather than by eye. Same slot set as task 3.1."
    gotcha: "tasks-from-issues-spec.md and tasks-from-issues-diff.md already share most of their text; copying the wrong variant's Part 2 is the easy error. The diff variant's Part 2 has four `Each task must:` bullets, the spec variant has six."
    verify:
      - "`test -f skills/flowcharge/templates/issues-and-tasks-diff.md` exits 0. At c842070 the file was absent and this exits 1."
      - "`diff skills/flowcharge/templates/issues-and-tasks-spec.md skills/flowcharge/templates/issues-and-tasks-diff.md` reports only the mode-rule differences named in `implement`, and no difference in the routing paragraph, Part 1, or the `## Return` section. At c842070 diff exits 2, neither file exists."
      - "`grep -c 'Express every source change as a literal SEARCH/REPLACE block' skills/flowcharge/templates/issues-and-tasks-diff.md` returns 1, and the same grep against `issues-and-tasks-spec.md` returns 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Is the routing paragraph byte-identical to the one in issues-and-tasks-spec.md?"
      - "Is Part 1 byte-identical to Part 1 of issues-and-tasks-spec.md?"
      - "Does Part 2 come from tasks-from-issues-diff.md, not the spec variant?"
      - "Is the block rule unchanged?"
      - "Is the open-question return block correctly absent?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.3 Replace the issue-path rows and notes in `SKILL.md`'s Operations section
    ```yaml
    description: "Fold the create-issues and tasks-from-issues Operations rows into one issues-and-tasks row, and finish the validate pairing note."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in the Operations table, replace the `| create-issues |` row and the `| tasks-from-issues |` row with one `| issues-and-tasks |` row, in the same form task 1.4 used for the plan path."
      - "The new row names both template files (`templates/issues-and-tasks-spec.md` or `-diff.md`), its full slot set including `{stages}` and `{issuelist}`, what it consumes, and both artefacts it returns."
      - "In the `- **validate**:` bullet below the table, finish the pairing: the merged issue stage pairs with `validate-issues` first, then `validate-tasks`, in that fixed order, matching the plan path's treatment from task 1.4."
      - "Leave the `- **backlog-add**:` bullet alone. It describes a different operation that happens to write issue-adjacent records."
    pattern: "skills/flowcharge/SKILL.md, the `## Operations` table and its `- **validate**:` note"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Template inventory and SKILL.md changes, and Out of scope: the validate template bodies are untouched, only when they are spawned."
    gotcha: "Test rule G resolves every templates/*.md short form in this file against disk, so tasks 3.1 and 3.2 must land first. The retired issue-path templates still exist at this point and are deleted by task 3.8."
    verify:
      - "`grep -c '| issues-and-tasks |' skills/flowcharge/SKILL.md` returns 1. At c842070 it returned 0."
      - "`grep -c '| create-issues |' skills/flowcharge/SKILL.md` returns 0, and `grep -c '| tasks-from-issues |' skills/flowcharge/SKILL.md` returns 0. At c842070 each returned 1."
      - "The validate bullet names validate-issues before validate-tasks for the issue path, confirmed by reading it."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0. Test rule G is the discriminating case."
    checklist:
      - "Does one issues-and-tasks row replace exactly the two issue-path rows?"
      - "Does the row name both merged template files, the {stages} slot, and both returned artefacts?"
      - "Does the validate bullet now cover both merged stages, each with its two validation templates in a fixed order?"
      - "Is the backlog-add bullet untouched?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.4 Name the merged issue stage in `SKILL.md`'s Parsing the request chains
    ```yaml
    description: "Update the findings chain, the issue half of the turn-into-tasks line, the worked example, and the Chaining section's passing create-issues mentions to the merged issue stage."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Parsing the request`, the chain at line 382 reads `- \"file these findings as issues [then fix them]\" (findings come from the conversation) → create-issues → validate → tasks-from-issues → validate → [prompt] execute-tasks → [prompt] commit`. Rewrite it to run the merged issue stage once, followed by `validate-issues` and then `validate-tasks` in that fixed order, then the two prompted stages."
      - "In the `- \"turn <issue list / plan> into tasks\"` line, rewrite its issue half to map to the merged issue template with `{stages}: tasks-only`, matching the plan half task 1.6 already wrote."
      - "In the `Rules of interpretation:` list below, the first bullet uses `create-issues` as its worked example of stopping where the user stopped. Update the stage name in it, keeping the example's meaning."
      - "In `## Chaining`, three lines name the retired issue stage in passing: the first bullet (line 444 at `base_commit`) opens `- findings the user supplies → create-issues `{{findings}}`:`, the second bullet (line 447) opens `- create-issues path → `{issuelist}`;`, and the validation paragraph (line 480) reads `they reach the validation from the user, not from create-issues.` Replace `create-issues` in each with the merged issue stage's name and change nothing else in those lines. Task 1.7 has already renamed the plan half of line 447."
    pattern: "skills/flowcharge/SKILL.md, the standard-chains bullet list and the first Rules of interpretation bullet inside `## Parsing the request`, and the three passing create-issues mentions inside `## Chaining`"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, fifth and seventh bullets, and the settled first open question about the interim validation sequencing."
    gotcha: "The worked example in the Rules of interpretation bullet wraps across two lines at `base_commit`: line 395 ends `\"file these findings as issues\" ends at` and line 396 opens `create-issues.`, so a single-line grep for `ends at create-issues` returns 0 both before and after the edit and proves nothing. The stage-3 sweep grep in task 3.8 catches it either way."
    verify:
      - "`grep -c 'create-issues → validate → tasks-from-issues' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'issues-and-tasks' skills/flowcharge/SKILL.md` returns 3 or more, covering the Operations row from task 3.3 and both chain lines from this one. At c842070 it returned 0."
      - "`grep -A1 'file these findings as issues\" ends at' skills/flowcharge/SKILL.md | grep -c 'create-issues'` returns 0. At c842070 it returned 1, the wrapped continuation line."
      - "`grep -c 'create-issues `{{findings}}`\\|create-issues path\\|not from create-issues' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 3."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the findings chain run one merged authoring stage instead of two?"
      - "Does it name validate-issues before validate-tasks?"
      - "Does the turn-into-tasks line's issue half map to the merged template with {stages}: tasks-only?"
      - "Is the Rules of interpretation worked example updated without changing its meaning?"
      - "Do the three Chaining mentions name the merged issue stage, with their slot mappings unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.5 Finish the automatic-tag upkeep bullet for the issue path
    ```yaml
    description: "Replace the remaining create-issues reference in SKILL.md's After every stage upkeep bullet with the merged issue stage."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## FlowCharge Core upkeep`, the `- **After every stage**:` bullet still names `create-issues` in its trigger parenthesis after task 1.8. Replace it with the merged issue stage's name."
      - "Leave the two trigger definitions untouched: `issue` still fires on a filed issue list in the workstream folder, `feature` still fires on a `PLN-*-plan.md` file in it."
      - "Leave the Start of run, When execution starts, Successful end of run and Halt bullets alone."
    pattern: "skills/flowcharge/SKILL.md, the `- **After every stage**:` bullet inside `## FlowCharge Core upkeep`"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / SKILL.md changes, last bullet. Out of scope: fc-index.mjs is untouched, so the triggers are still unchecked by any script, exactly as CONVENTIONS.md records."
    gotcha: "Task 1.8 deliberately left create-issues in this parenthesis so the file stayed correct through the stage 1 to stage 3 window. This task closes that window and must not land before tasks 3.1 and 3.2 have created the merged templates."
    verify:
      - "`grep -c 'create-issues' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 8 lines in this file."
      - "The bullet's trigger parenthesis names both merged stages and no retired one, confirmed by reading it."
      - "`grep -c 'PLN-\\*-plan.md' skills/flowcharge/SKILL.md` returns 1, confirming the feature trigger definition survived. At c842070 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the trigger parenthesis name only merged stages?"
      - "Are the issue and feature trigger definitions unchanged?"
      - "Are the other four upkeep bullets untouched?"
      - "Is fc-index.mjs still unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.6 Fold the issue-path rows in `README.md`'s operations table
    ```yaml
    description: "Replace README.md's create-issues and tasks-from-issues operation rows with one issues-and-tasks row."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `README.md`, in the operations table, replace the `| create-issues ` row (line 94 at `base_commit`) and the `| tasks-from-issues ` row (line 96 at `base_commit`) with one `| issues-and-tasks ` row, in the same form task 1.9 used for the plan path."
      - "Keep the table's three columns and its column alignment. Both stage 1 and stage 3 have now removed a row each, so re-pad the separator row and the neighbouring cells if the widest operation name changed."
      - "Leave the surrounding prose alone, including the sentence about spec mode being the default and the paragraph about adding your own instructions to any operation."
    pattern: "README.md, the operations table only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, first bullet, and Acceptance criterion 2."
    gotcha: "README.md sits outside `skills/`, so no test rule scans it. Line numbers have shifted since `base_commit` because task 1.9 already collapsed two rows into one; locate the rows by their leading `| create-issues ` and `| tasks-from-issues ` text, not by line number."
    verify:
      - "`grep -c 'create-issues\\|tasks-from-issues' README.md` returns 0. At c842070 it returned 2."
      - "`grep -c '^| issues-and-tasks ' README.md` returns 1. At c842070 it returned 0."
      - "`grep -c 'create-plan\\|tasks-from-plan' README.md` returns 0, still clear from task 1.9. At c842070 it returned 2."
      - "The table still has the same number of columns in every row, confirmed by reading it."
    checklist:
      - "Does one issues-and-tasks row replace exactly the two issue-path rows?"
      - "Does every row still carry three columns?"
      - "Does README.md now name no retired stage at all?"
      - "Is the surrounding prose untouched?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.7 Update the rule H comment naming the excluded issue-path templates
    ```yaml
    description: "Rename the two templates the RULE_H_TEMPLATES comment records as deliberately absent, keeping the reason it already gives."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, the comment at lines 4839 to 4842 reads `// The two tasks-from-issues templates are deliberately absent from the list.` followed by the reason: neither returns an open question, because a template that cannot author a task for an issue returns that issue as skipped instead."
      - "Rename the two templates in that first line to the merged pair. Keep the reason word for word: it is still exactly why they stay out of the list."
      - "Do not add either merged issue-path template to `RULE_H_TEMPLATES`. Adding one would require it to carry the open-question block, which tasks 3.1 and 3.2 correctly leave out."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the comment block directly above the RULE_H_TEMPLATES array"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Other files that name a retired stage, third bullet: the merged issue-path templates stay out of that list, for the reason the comment beside it already gives."
    gotcha: "This is the last reference to a retired issue-path name under `skills/`, so task 3.8's sweep grep depends on it. Renaming the templates while accidentally adding them to the array turns a passing rule H into a failing one."
    verify:
      - "`grep -c 'tasks-from-issues' skills/flowcharge/scripts/test/run-tests.mjs` returns 0. At c842070 it returned 1."
      - "`grep -c 'issues-and-tasks' skills/flowcharge/scripts/test/run-tests.mjs` returns 1, the comment only. At c842070 it returned 0."
      - "`grep -c \"'flowcharge/templates/issues-and-tasks\" skills/flowcharge/scripts/test/run-tests.mjs` returns 0, confirming neither merged issue template entered the array. At c842070 it returned 0, so pair this with the previous step."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, and its rule H case reports ok."
    checklist:
      - "Does the comment name the merged issue-path pair?"
      - "Is its stated reason unchanged?"
      - "Is RULE_H_TEMPLATES still five entries, with no issue-path template added?"
      - "Does the rule H case still report ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.8 Delete the three retired issue-path templates
    ```yaml
    description: "Remove create-issues.md, tasks-from-issues-spec.md and tasks-from-issues-diff.md now that nothing names them."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Delete `skills/flowcharge/templates/create-issues.md`, `skills/flowcharge/templates/tasks-from-issues-spec.md` and `skills/flowcharge/templates/tasks-from-issues-diff.md` with `git rm`."
      - "Run the stage's sweep grep first, and do not delete until it returns 0. If it still returns a line, the file naming a retired template is a missed reference: fix it in whichever of tasks 3.3 to 3.7 owns that file rather than deleting anyway."
      - "The three deletions are one coherent change over one set of files, with one sweep-grep-and-test-suite verify sequence."
    pattern: "skills/flowcharge/templates/create-issues.md, skills/flowcharge/templates/tasks-from-issues-spec.md, skills/flowcharge/templates/tasks-from-issues-diff.md"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Acceptance criterion 2, and Stages / stage 3's stated observable."
    gotcha: "Delete last in the stage, after tasks 3.3 to 3.7 have cleared every reference. Test rule G fails on a templates/*.md short form left in skills/flowcharge/SKILL.md that no longer resolves."
    verify:
      - "`grep -rn 'create-issues\\|tasks-from-issues' skills/ | wc -l` returns 0. At c842070 it returned 12 lines, across skills/flowcharge/SKILL.md (11) and skills/flowcharge/scripts/test/run-tests.mjs (1)."
      - "`ls skills/flowcharge/templates/create-issues.md skills/flowcharge/templates/tasks-from-issues-spec.md skills/flowcharge/templates/tasks-from-issues-diff.md 2>/dev/null | wc -l` returns 0. At c842070 it returned 3."
      - "`ls skills/flowcharge/templates/issues-and-tasks-spec.md skills/flowcharge/templates/issues-and-tasks-diff.md 2>/dev/null | wc -l` returns 2, confirming acceptance criterion 2's positive half. At c842070 it returned 0."
      - "`ls skills/flowcharge/templates/*.md | wc -l` returns 10, the surviving template set stage 4 edits. At c842070 it returned 12."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0. Rules G and H are the discriminating cases."
    checklist:
      - "Are all three retired issue-path templates gone from the tree?"
      - "Do both merged issue-path templates exist?"
      - "Does the sweep grep over skills/ return zero lines?"
      - "Does templates/ now hold exactly ten files?"
      - "Does the test suite still exit 0, with rules G and H both reporting ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.9 Record stage 3 in `CHANGELOG.md`
    ```yaml
    description: "Append the stage 3 entry under ## Unreleased, recording the issue-path merge."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `CHANGELOG.md`, add the stage 3 entry under the existing `## Unreleased` heading, merging into the subsections tasks 1.14 and 2.2 already opened rather than adding new ones."
      - "Record the two merged issue-path templates added, the three issue-path templates removed, and the `{stages}` values the issue path takes."
      - "State that the delete-the-older-folder-first note from the stage 1 entry applies to these template removals too, or fold both removals into one note."
      - "Bump no version."
    pattern: "CHANGELOG.md, the `## Unreleased` section only"
    imports: "None."
    compatibility: "CONTRIBUTING.md's changelog step, PLN-7-7gnb3p's Stages closing note, and Data & compatibility / Installed skill folders."
    gotcha: "Three stages now write into one `## Unreleased` section. Keep one subsection of each kind; a second `### Added` or `### Removed` makes the section malformed."
    verify:
      - "`grep -c 'issues-and-tasks' CHANGELOG.md` returns 1 or more. At c842070 it returned 0."
      - "`awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | grep -c '^### '` returns 3 at most, one per subsection kind."
      - "`awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | sort | uniq -d | grep -c '^### '` returns 0, confirming no duplicate subsection heading."
      - "`grep -c '^## Unreleased' CHANGELOG.md` returns 1. At c842070 it returned 1."
    checklist:
      - "Does the entry sit under the existing ## Unreleased heading?"
      - "Does it record the added and removed issue-path templates?"
      - "Is there no duplicate subsection heading under ## Unreleased?"
      - "Is no version number added or bumped?"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 4. Stage 4: context documents resolved once per run

  ```yaml
  description: "Replace the @-inlining context block in all ten surviving templates with a resolved path list carrying one-line notes, and widen SKILL.md's sanctioned-deviation bullet."
  ```

  - [ ] 4.1 Replace the context block in `investigate.md` and fix the canonical wording
    ```yaml
    description: "Rewrite the shared {{context docs}} placeholder as a resolved path list with one-line notes, in investigate.md, establishing the exact text the nine sibling tasks copy."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/investigate.md`, line 7 holds the `{{context docs}}` placeholder. At `base_commit` the identical placeholder line appears in all twelve templates, byte for byte."
      - "Replace that placeholder with a new one that asks for a resolved list of repo-relative paths, one line per document saying what it covers and when to read it, closed by an instruction to read the documents the task needs rather than all of them."
      - "Keep the placeholder's four existing rules word for word in the new text: list only files confirmed to exist, invent nothing, carry no path over from another project, and delete the block and its introducing sentence (and the heading, if that empties the section) when the project has none."
      - "Remove the `@`-prefix instruction entirely. It is a harness-specific file-reference syntax, which DEVELOPMENT.md's portability rule forbids."
      - "This is the canonical wording. Tasks 4.2 to 4.10 copy this exact line into their own files, so write it once here and copy it, never retype it."
      - "Leave the introducing sentence on line 6 alone. Task 4.2 preserves the one variant sentence kanban-add.md carries."
    pattern: "skills/flowcharge/templates/investigate.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block, and Acceptance criterion 8. DEVELOPMENT.md's portability rule, which forbids assuming a harness-specific capability including a file-reference syntax."
    gotcha: "Two different introducing sentences exist above this placeholder: eleven templates say `Read these to understand the structure and purpose of the app:` and kanban-add.md says `Read these for the project's vocabulary and structure, …`. Replace the placeholder line, not the sentence, or kanban-add.md loses its variant wording."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/investigate.md` returns 0. At c842070 it returned 1."
      - "`grep -rn '`@`-prefixed' skills/ | wc -l` returns 10. At c842070 it returned 13 lines: twelve templates plus the note in skills/flowcharge/SKILL.md. Stage 1 and stage 3 have since removed six template files and added four that carry the placeholder unchanged, so the figure immediately before this task is 11 (ten templates plus the SKILL.md note), and this task takes it to 10."
      - "`grep -c 'list only files you have confirmed are there' skills/flowcharge/templates/investigate.md` returns 1, confirming the four existing rules survived. At c842070 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Does the new placeholder ask for repo-relative paths with a one-line note each?"
      - "Does it close with an instruction to read only the documents the task needs?"
      - "Do all four existing rules survive word for word?"
      - "Is every trace of the @-prefix instruction gone from this file?"
      - "Is the introducing sentence on line 6 unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.2 Replace the context block in `kanban-add.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into kanban-add.md, preserving its variant introducing sentence."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/kanban-add.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Leave the introducing sentence directly above it unchanged. This is the one template whose sentence reads `Read these for the project's vocabulary and structure, so your wording matches how the codebase describes itself, not to research the items themselves:`."
      - "Leave the `{item1}` / `{item2}` bullets and the four workstream-creation steps alone."
    pattern: "skills/flowcharge/templates/kanban-add.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block: the block is replaced in every template that carries it, and the placeholder keeps its existing rules."
    gotcha: "This file carries a DOCS_ALLOWLIST entry keyed on the word `gates`, from its `#gates+` tag-token example. That text sits well away from the context block, but an over-wide replacement that removes it fails the `every docs-consistency allowlist entry matches a live occurrence` test case."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/kanban-add.md` returns 0. At c842070 it returned 1."
      - "`grep -c \"Read these for the project's vocabulary and structure\" skills/flowcharge/templates/kanban-add.md` returns 1, confirming the variant sentence survived. At c842070 it returned 1."
      - "`grep -c 'gates' skills/flowcharge/templates/kanban-add.md` returns 1 or more, confirming the allowlisted example survived. At c842070 it returned 1 or more."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the allowlist case reporting ok."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is the variant introducing sentence unchanged?"
      - "Does the #gates+ example still exist?"
      - "Are the item bullets and the four creation steps untouched?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.3 Replace the context block in `validate-plan.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into validate-plan.md, changing nothing else in the template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/validate-plan.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Change nothing else. PLN-7-7gnb3p puts the validate template bodies out of scope except for this shared block."
      - "Leave the `{{source material}}` block, the `{artefact}` and `{source}` slots, and the open-question return block alone."
    pattern: "skills/flowcharge/templates/validate-plan.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Out of scope: the validate-plan.md, validate-issues.md and validate-tasks.md template bodies, except for their shared context-document block under criterion 8."
    gotcha: "This file is in RULE_H_TEMPLATES, so its open-question return block is pinned byte for byte after whitespace collapsing. Touching it fails rule H."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/validate-plan.md` returns 0. At c842070 it returned 1."
      - "`git diff --stat -- skills/flowcharge/templates/validate-plan.md` shows one line changed, one insertion and one deletion."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the rule H case reporting ok. Rule H is the discriminating check here."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is exactly one line changed in the file?"
      - "Is the open-question return block untouched?"
      - "Does the rule H case still report ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.4 Replace the context block in `validate-issues.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into validate-issues.md, changing nothing else in the template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/validate-issues.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Change nothing else, for the same out-of-scope reason as task 4.3."
    pattern: "skills/flowcharge/templates/validate-issues.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Out of scope: the validate template bodies, except for their shared context-document block under criterion 8."
    gotcha: "This file is in RULE_H_TEMPLATES, so its open-question return block is pinned byte for byte after whitespace collapsing."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/validate-issues.md` returns 0. At c842070 it returned 1."
      - "`git diff --stat -- skills/flowcharge/templates/validate-issues.md` shows one line changed, one insertion and one deletion."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the rule H case reporting ok."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is exactly one line changed in the file?"
      - "Is the open-question return block untouched?"
      - "Does the rule H case still report ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.5 Replace the context block in `validate-tasks.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into validate-tasks.md, changing nothing else in the template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/validate-tasks.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Change nothing else, for the same out-of-scope reason as task 4.3."
    pattern: "skills/flowcharge/templates/validate-tasks.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Out of scope: the validate template bodies, except for their shared context-document block under criterion 8."
    gotcha: "This file is in RULE_H_TEMPLATES and it also carries a DOCS_ALLOWLIST entry keyed on the word `gate`, from the sentence telling the validator to apply fc-validate's baseline gate. Removing either fails a test case."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/validate-tasks.md` returns 0. At c842070 it returned 1."
      - "`git diff --stat -- skills/flowcharge/templates/validate-tasks.md` shows one line changed, one insertion and one deletion."
      - "`grep -c 'gate' skills/flowcharge/templates/validate-tasks.md` returns 1 or more, confirming the allowlisted occurrence survived. At c842070 it returned 1 or more."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the rule H and allowlist cases reporting ok."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is exactly one line changed in the file?"
      - "Is the open-question return block untouched?"
      - "Does the allowlisted `gate` occurrence still exist?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.6 Replace the context block in `execute-parent-task.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into execute-parent-task.md, leaving stage 2's mode branch untouched."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/execute-parent-task.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Leave the `## Instructions` section alone. Task 2.1 rewrote it, and nothing in this stage touches it."
    pattern: "skills/flowcharge/templates/execute-parent-task.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block, and Acceptance criterion 8."
    gotcha: "This file was already edited in stage 2, so its line numbers no longer match `base_commit`. Locate the placeholder by its text, not by line 17."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/execute-parent-task.md` returns 0. At c842070 it returned 1."
      - "`grep -c 'This file carries literal SEARCH/REPLACE blocks' skills/flowcharge/templates/execute-parent-task.md` returns 0, confirming stage 2's change is still in place. At c842070 it returned 1."
      - "`git diff --stat -- skills/flowcharge/templates/execute-parent-task.md` shows one line changed relative to the commit that closed stage 2."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is stage 2's mode branch still present and unchanged?"
      - "Is exactly one line changed relative to the end of stage 2?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.7 Replace the context block in `plan-and-tasks-spec.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into the merged spec-mode plan-path template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/plan-and-tasks-spec.md`, replace the `{{context docs}}` placeholder line, carried over unchanged by task 1.1, with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Leave the routing paragraph, Part 1, Part 2's three read rules, and the open-question return block alone."
    pattern: "skills/flowcharge/templates/plan-and-tasks-spec.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block, and Acceptance criterion 8."
    gotcha: "This file is in RULE_H_TEMPLATES after task 1.11, so its open-question return block is pinned byte for byte after whitespace collapsing."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/plan-and-tasks-spec.md` returns 0. Immediately before this task it returned 1, inherited from task 1.1."
      - "`grep -c 'git diff --name-only' skills/flowcharge/templates/plan-and-tasks-spec.md` returns 1, confirming the staleness check survived. At c842070 the whole tree returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the rule H case reporting ok."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is the routing paragraph unchanged?"
      - "Are the three read rules unchanged?"
      - "Does the rule H case still report ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.8 Replace the context block in `plan-and-tasks-diff.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into the merged diff-mode plan-path template, keeping the pair byte-identical outside their mode rules."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/plan-and-tasks-diff.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "This edit and task 4.7's must land as the same change to a shared rule, per PLN-7-7gnb3p's Slot contracts: a change to any rule the spec and diff variants share is made in both files in the same edit."
    pattern: "skills/flowcharge/templates/plan-and-tasks-diff.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Slot contracts and The shared context-document block, and Acceptance criterion 8."
    gotcha: "This file is in RULE_H_TEMPLATES after task 1.11. Leaving one of the pair on the old placeholder is the exact duplication drift the plan's slot-contract rule exists to prevent."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/plan-and-tasks-diff.md` returns 0. Immediately before this task it returned 1, inherited from task 1.2."
      - "`diff skills/flowcharge/templates/plan-and-tasks-spec.md skills/flowcharge/templates/plan-and-tasks-diff.md` reports no difference on the context block line, and still only the mode-rule differences task 1.2 established."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the rule H case reporting ok."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is the context block line identical between the two plan-path variants?"
      - "Are the only remaining differences between them the mode rules?"
      - "Does the rule H case still report ok?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.9 Replace the context block in `issues-and-tasks-spec.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into the merged spec-mode issue-path template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/issues-and-tasks-spec.md`, replace the `{{context docs}}` placeholder line, carried over unchanged by task 3.1, with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "Leave the routing paragraph, Part 1, and Part 2's anchor rule alone."
    pattern: "skills/flowcharge/templates/issues-and-tasks-spec.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block, and Acceptance criteria 6 and 8."
    gotcha: "Acceptance criterion 6 pins the anchor sentence byte for byte. The context block sits above it, so a replacement that overreaches by one line breaks a criterion this stage does not own."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/issues-and-tasks-spec.md` returns 0. Immediately before this task it returned 1, inherited from task 3.1."
      - "`grep -c 'derive every anchor, line reference and quoted identifier from the file as read in this session' skills/flowcharge/templates/issues-and-tasks-spec.md` returns 1, confirming criterion 6 still holds. At c842070 the same string returned 1 in tasks-from-issues-spec.md."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is the anchor rule still byte-exact?"
      - "Is the routing paragraph unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.10 Replace the context block in `issues-and-tasks-diff.md`
    ```yaml
    description: "Copy task 4.1's canonical placeholder into the merged diff-mode issue-path template, keeping the pair byte-identical outside their mode rules."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/templates/issues-and-tasks-diff.md`, replace the `{{context docs}}` placeholder line with the exact line task 4.1 wrote in `investigate.md`. Copy it, do not retype it."
      - "This edit and task 4.9's must land as the same change to a shared rule, per PLN-7-7gnb3p's Slot contracts."
    pattern: "skills/flowcharge/templates/issues-and-tasks-diff.md, the `{{context docs}}` placeholder line only"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / Slot contracts and The shared context-document block, and Acceptance criterion 8."
    gotcha: "This is the last of the ten templates. After it, the only remaining `@`-prefixed occurrence under `skills/` is the note in skills/flowcharge/SKILL.md, which task 4.11 removes."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/templates/issues-and-tasks-diff.md` returns 0. Immediately before this task it returned 1, inherited from task 3.2."
      - "`grep -rln '`@`-prefixed' skills/flowcharge/templates/ | wc -l` returns 0, satisfying acceptance criterion 8's template half. At c842070 it returned 12."
      - "`diff skills/flowcharge/templates/issues-and-tasks-spec.md skills/flowcharge/templates/issues-and-tasks-diff.md` reports no difference on the context block line."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0 (regression guard; passed 263/263 at c842070)."
    checklist:
      - "Is the placeholder byte-identical to the one in investigate.md?"
      - "Is the context block line identical between the two issue-path variants?"
      - "Does no template under templates/ still carry an @-prefixed bullet?"
      - "Do all ten templates carry the same replacement block?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.11 Widen `SKILL.md`'s sanctioned-deviation bullet and update its `{{context docs}}` note
    ```yaml
    description: "Record that the orchestrator resolves the documents and their one-line notes once per run and reuses that block verbatim in every spawn, and stop the note describing @-prefixed bullets."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, the `- **`{{context docs}}`**:` note below the Operations table (around line 327 at `base_commit`) says the block resolves to this project's documentation as `@`-prefixed bullets. Rewrite it to describe the resolved path list with one-line notes instead, and remove the `@`-prefix wording."
      - "In `### Sanctioned deviations`, the first bullet (around line 434 at `base_commit`) already says to resolve the project's documentation once per run, not per stage. Add one clause: the orchestrator resolves the documents and writes their one-line notes once per run, then reuses that same block verbatim in every spawn of the run."
      - "Add nothing else to the sanctioned-deviations list. It is a closed set, and the plan widens exactly one bullet."
    pattern: "skills/flowcharge/SKILL.md, the `- **`{{context docs}}`**:` note and the first `### Sanctioned deviations` bullet"
    imports: "None."
    compatibility: "PLN-7-7gnb3p, Design / The shared context-document block, and Acceptance criterion 8. DEVELOPMENT.md's portability rule, which the @-prefix removal also serves."
    gotcha: "Line numbers have shifted: stages 1 and 3 both edited the Operations table above these lines. Locate both by their text. This file carries DOCS_ALLOWLIST entries keyed on `FlowCharge` and `gates`, neither near these two regions."
    verify:
      - "`grep -c '`@`-prefixed' skills/flowcharge/SKILL.md` returns 0. At c842070 it returned 1."
      - "`grep -rn '`@`-prefixed' skills/ | wc -l` returns 0, satisfying acceptance criterion 8 in full. At c842070 it returned 13."
      - "`grep -c 'once per run' skills/flowcharge/SKILL.md` returns 1 or more, and the sanctioned-deviation bullet names reusing the same block verbatim in every spawn, confirmed by reading it. At c842070 `grep -c 'once per run'` returned 3, so read the bullet rather than relying on the count alone."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, with the allowlist case reporting ok."
    checklist:
      - "Does the {{context docs}} note describe a resolved path list rather than @-prefixed bullets?"
      - "Does the sanctioned-deviation bullet say the block is resolved once per run and reused verbatim in every spawn?"
      - "Were no other bullets added to the sanctioned-deviations list?"
      - "Does the sweep grep over skills/ now return zero @-prefixed occurrences?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.12 Record stage 4 in `CHANGELOG.md`
    ```yaml
    description: "Append the stage 4 entry under ## Unreleased, recording the de-inlined context documents."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `CHANGELOG.md`, add the stage 4 entry under the existing `## Unreleased` heading, merging into the subsections tasks 1.14, 2.2 and 3.9 already opened."
      - "Record that every template's context-document block is now a resolved list of repo-relative paths with a one-line note each, that the harness-specific `@`-prefix file-reference syntax is gone, and that the orchestrator resolves the block once per run and reuses it verbatim in every spawn."
      - "Bump no version."
    pattern: "CHANGELOG.md, the `## Unreleased` section only"
    imports: "None."
    compatibility: "CONTRIBUTING.md's changelog step, and PLN-7-7gnb3p's Stages closing note."
    gotcha: "This is the fourth stage writing into one `## Unreleased` section. Keep one subsection of each kind."
    verify:
      - "`grep -c 'context' CHANGELOG.md` returns 1 or more inside the Unreleased section, confirmed with `awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | grep -ci context`. At c842070 the Unreleased section was empty and this returned 0."
      - "`awk '/^## Unreleased/{f=1;next}/^## [0-9]/{f=0}f' CHANGELOG.md | grep '^### ' | sort | uniq -d | wc -l` returns 0, confirming no duplicate subsection heading."
      - "`grep -c '^## Unreleased' CHANGELOG.md` returns 1. At c842070 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` exits 0, the final stage-boundary check the plan's testing strategy requires."
    checklist:
      - "Does the entry sit under the existing ## Unreleased heading?"
      - "Does it record the resolved path list, the removed @-prefix syntax, and the once-per-run resolution?"
      - "Is there no duplicate subsection heading under ## Unreleased?"
      - "Is no version number added or bumped?"
      - "Does the test suite exit 0 at this final stage boundary?"
    self_eval:
      passed: false
      failures: []
    ```

## Divergences

1. **Rule G's self-test fixture hard-codes `create-plan.md`.** PLN-7-7gnb3p's
   "Other files that name a retired stage" section, as first written, said that inside
   `skills/flowcharge/scripts/test/run-tests.mjs` only `RULE_H_TEMPLATES` names the
   retired plan-path templates and must be changed. The plan has since been corrected
   to name the two further places as well; this entry is kept as the record of why
   task 1.12 exists. At `c842070`, line 4844 is a comment stating `create-plan.md` is the master
   copy `RULE_H_BLOCK` was collapsed from, and lines 4968 and 4969 are in-memory
   fixtures inside the test case `skills/**/*.md: every path written in the prose
   resolves on disk`. Line 4968 is load-bearing: it is
   `{ file: RULE_G_PROMPT_SHORT_FORM_FILE, text: 'run templates/create-plan.md' },`, and
   the assertion on line 4971 requires rule G to find that path resolvable, which it
   does by joining it under `skills/flowcharge/templates/`. Deleting `create-plan.md`
   makes it unresolvable and the case fails, so the plan's own stage 1 observable, the
   test suite exiting 0, would not hold. Consequence: task 1.12 was authored to
   re-point both fixture lines at a surviving template, and task 1.11 also updates the
   line 4844 comment. No task was dropped for this.

2. **Two introducing sentences sit above the shared context block, not one.**
   PLN-7-7gnb3p's "The shared context-document block" section describes one block
   carried by every template. At `c842070` the `{{context docs}}` placeholder line is
   byte-identical across all twelve templates, but the sentence introducing it has two
   forms: eleven templates read `Read these to understand the structure and purpose of
   the app:`, while `skills/flowcharge/templates/kanban-add.md` reads `Read these for
   the project's vocabulary and structure, so your wording matches how the codebase
   describes itself, not to research the items themselves:`. Consequence: stage 4's
   tasks replace the placeholder line only and leave the introducing sentence alone, and
   task 4.2 carries an explicit instruction and a verify step preserving kanban-add.md's
   variant wording. No task was dropped for this.

Every other file the plan cites matched what it assumes: `create-plan.md`,
`tasks-from-plan-spec.md`, `tasks-from-plan-diff.md`, `create-issues.md`,
`tasks-from-issues-spec.md`, `tasks-from-issues-diff.md`, `execute-parent-task.md`,
`skills/flowcharge/SKILL.md`, `skills/flowcharge/CONVENTIONS.md`, `README.md` and
`skills/fc-plan-feature/SKILL.md` all carried the sections, rules and sentences the
plan names, at `c842070`.
