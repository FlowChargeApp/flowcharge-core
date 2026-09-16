---
id: TL-10-mb2dw5
type: tasklist
workstream: WS-15-d5hgor
slug: artefact-validation-cost-tiers
title: "A validate setting and one end-of-run validation pass"
status: ready
created: 2026-09-17
updated: 2026-09-17
author: Anthony Koukoullis
depends_on: [PLN-8-dy15dj]
links: []
mode: spec
base_commit: f512966
---

# FlowCharge Tasks

## A validate setting and one end-of-run validation pass

PLN-8-dy15dj adds one key to `flowcharge/agents.md`, `validate: on | off`, and replaces
the three single-artefact validation templates with one pass that runs once per run, after
the authoring stage and before the execute-tasks prompt. Under `on`, one subagent receives
the source and both authored artefacts and makes two comparisons in a fixed order: the
source against the upstream artefact first, then the upstream artefact against the task
list second. The upstream artefact is never edited to agree with the task list. Under
`off`, no validator is spawned. The run must also say what it skipped, so the plan carries
WS-106-6m67j5's item 4: the pipeline line names the validation stage, and the end-of-run
summary reports a validation that did not run as `waived` or as `missing`.

**Where the code lives.** Every task below edits the sibling live development repository
`~/Work/AK/flowcharge-core-public`. Run every `verify` command from that directory, not
from this archive project. Paths in `pattern`, `implement` and `verify` are relative to
`~/Work/AK/flowcharge-core-public` unless written in full.

**The project's own check command** is `node skills/flowcharge/scripts/test/run-tests.mjs`.
At `f512966` it prints `263/263 cases passed`, so it never discriminates on its own. Every
task below pairs it with a grep or a file check that does fail at `f512966`, and each such
step records the value the command actually returned at `f512966`.

**Stage order is load-bearing.** Stage 2 must create both new templates before stage 3
names them in `skills/flowcharge/SKILL.md`, because rule G requires every path written in
skill prose to resolve on disk. Stage 5 must delete the three superseded templates and
prune the harness's two hardcoded lists in one change, because rule E fails if the entry
goes first and rule H fails if the file goes first.

- [x] 1. The sequenced-pass contract in `skills/fc-validate/SKILL.md`

  ```yaml
  description: "Plan stage 1. Define the two permitted chains, the fixed comparison order, the never-align-backwards rule and the per-comparison return, in the skill that is the single authority the templates defer to. The orchestrator is untouched and still runs the interim pair."
  ```

  - [x] 1.1 Add the sequenced pass to Part 1, Inputs
    ```yaml
    description: "Add a second permitted input shape to fc-validate Part 1: two of the four pairings chained in one turn, in a fixed order, with exactly two chains permitted."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/fc-validate/SKILL.md`, in `## 1. Inputs`, leave the existing four-pairing table and the sentence `Exactly four pairings are permitted, and no others.` unchanged. The single-artefact shape stays exactly as it is."
      - "Below that table and above the issue-list-source paragraph, add a short passage introducing a second permitted shape, a sequenced pass: two of those four pairings chained in one turn, in a fixed order."
      - "Add a two-column table naming exactly the two permitted chains. The plan path chains `brief and workstream record -> plan` first, then `plan -> task list`. The issue path chains `findings -> issue list` first, then `issue list -> task list`. State that exactly two chains are permitted and no others."
      - "Add the skip rule: a chain whose first pairing has no artefact to check, or whose second has none, runs the other alone and says which it skipped."
      - "Leave the closing sentence `Where the pairing you are given is not one of these four, say so and stop.` reading correctly against both shapes; amend it only so far as is needed to cover a chain that is not one of the two."
    pattern: "skills/fc-validate/SKILL.md, the `## 1. Inputs` section only. No other section and no other file."
    imports: "None. This is a Markdown skill file."
    compatibility: "PLN-8-dy15dj, Design / `skills/fc-validate/SKILL.md`: the sequenced pass. The four-pairing table stands unchanged; the sequenced pass is added alongside it, never in place of it."
    gotcha: "The docs-consistency harness runs rule E over `skills/**/*.md` and flags the word `gate` unless allowlisted. Do not introduce a new bare `gate` occurrence in this section. The existing baseline-gate wording in Part 3 is already allowed and is untouched here."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'sequenced pass' skills/fc-validate/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`grep -c 'pairings are permitted' skills/fc-validate/SKILL.md` still returns 1, confirming the four-pairing rule survived. At f512966 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does `## 1. Inputs` still carry the unchanged four-pairing table?"
      - "Does it name exactly two permitted chains, the plan path and the issue path, and no third?"
      - "Does it fix the order within each chain, upstream comparison first?"
      - "Does it state that a chain missing one artefact runs the other alone and names the skip?"
      - "Is the word `gate` unchanged in count and placement in this file?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.2 Add the correction-direction rule to Part 1
    ```yaml
    description: "Add the load-bearing safeguard: the first comparison completes before the second begins, and the upstream artefact is never edited to agree with the task list."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/fc-validate/SKILL.md`, immediately after the sequenced-pass passage task 1.1 added in `## 1. Inputs`, add a bolded rule paragraph covering the correction direction."
      - "State that the first comparison completes before the second begins, and that every correction the first applies lands before the second comparison reads the upstream artefact."
      - "State that the upstream artefact is never edited to agree with the downstream one."
      - "State that a discrepancy found in the second comparison is a finding against the task list, whatever its apparent cause."
      - "State that where the second comparison reveals the upstream artefact itself is wrong against its source, that is reported as a first-comparison finding under the first heading, and never applied."
      - "State the reason plainly: a validator holding both artefacts can align the upstream one to the downstream one, which launders an error rather than finding it."
    pattern: "skills/fc-validate/SKILL.md, the `## 1. Inputs` section only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `The correction direction, new and load-bearing`. This rule is the safeguard the workstream record calls load-bearing, and stage 5 pins it with a test case, so its wording must be stable and greppable."
    gotcha: "Task 5.2 pins a literal substring of this paragraph. Write it as prose that survives a re-wrap, and do not split the key sentence across a list item boundary. The pin normalises whitespace, so a line wrap is safe, but a reworded sentence is not."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'launder' skills/fc-validate/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`tr '\\n' ' ' < skills/fc-validate/SKILL.md | grep -c 'never edited to agree'` returns 1 or more. At f512966 the same command returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does the rule fix the ordering, first comparison completes before the second begins?"
      - "Does it say the upstream artefact is never edited to agree with the task list?"
      - "Does it route an upstream error found in comparison 2 to the first heading, unapplied?"
      - "Does it state the laundering reason rather than only the rule?"
      - "Is the rule one contiguous passage, so a pin can slice it?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.3 Scope Parts 2, 3 and 4 per comparison
    ```yaml
    description: "Say how the three check classes, the verify-execution part and the correction boundary read under a sequenced pass, without changing any of them in substance."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/fc-validate/SKILL.md`, add a short passage stating that Parts 2, 3 and 4 are unchanged in substance under a sequenced pass, and how each is read per comparison. Place it where a reader meets it before Part 2, at the end of `## 1. Inputs`."
      - "State that the three check classes apply to each comparison against that comparison's own source."
      - "State that Part 3, verify execution, applies to the second comparison only, because only a task list carries `verify` commands."
      - "State that Part 4's correction boundary applies per comparison, reading `the artefact under validation` as the upstream artefact in comparison 1 and as the task list in comparison 2."
      - "State that the fix label every open finding already carries is unchanged, and that it is what the orchestrator routes on."
      - "Change no wording inside Parts 2, 3 or 4 themselves."
    pattern: "skills/fc-validate/SKILL.md. Add text at the end of `## 1. Inputs` only; Parts 2, 3 and 4 are read-only here."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `Parts 2, 3 and 4 are unchanged in substance`. The baseline gate, the runnable command class and the per-task judgment keep their single definitions, which acceptance criterion 6 depends on."
    gotcha: "Acceptance criterion 6 requires the second comparison to reach the same per-task judgment today's validate-tasks reaches. Restating any of Part 3's rules here would create a second wording of them, which is exactly what this file exists to prevent."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `tr '\\n' ' ' < skills/fc-validate/SKILL.md | grep -c 'the second comparison only'` returns 1 or more. At f512966 the same command returned 0."
      - "`git diff --stat -- skills/fc-validate/SKILL.md` shows insertions only within `## 1. Inputs`; read the diff and confirm no line inside `## 2.`, `## 3.` or `## 4.` changed."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Do the three check classes apply per comparison against that comparison's own source?"
      - "Is Part 3 scoped to the second comparison only?"
      - "Does Part 4 read `the artefact under validation` per comparison, as stated?"
      - "Are the bodies of Parts 2, 3 and 4 byte-identical to f512966?"
      - "Is no rule from Part 3 restated anywhere in the new text?"
    self_eval:
      passed: true
      failures: []
    ```
  - [x] 1.4 Rewrite Part 5 for a per-comparison return
    ```yaml
    description: "Give a sequenced pass a return with one heading per comparison, each carrying the existing fixed summary line for that comparison's artefact."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/fc-validate/SKILL.md`, in `## 5. The return, and what it prints`, keep the existing single-artefact return exactly as it stands, including the fixed summary line shape `Validated <artefact>. <N> fixes applied. <M> open findings.` and the open-question block."
      - "Add a passage for a sequenced pass: it returns one heading per comparison, each carrying that comparison's own fixed summary line, then that comparison's open findings in the existing open-question block."
      - "State that the heading names the comparison number, its source and its artefact, so a finding is never read against the wrong artefact."
      - "State that the unrun and unjudged clause rides comparison 2's summary line."
      - "State that the withheld part keeps its single heading, and names per correction which comparison applied it."
    pattern: "skills/fc-validate/SKILL.md, `## 5. The return, and what it prints` only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, acceptance criterion 4: two comparisons in a fixed order, each under its own labelled heading, carrying the summary line this skill already defines, one per comparison. The open-question block wording must stay byte-identical, because rule H pins it in the templates."
    gotcha: "The unrun/unjudged clause must ride comparison 2 alone. Attaching it to comparison 1 would claim a plan validation ran commands, and Part 3 says a plan validation runs none."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `tr '\\n' ' ' < skills/fc-validate/SKILL.md | grep -c 'one heading per comparison'` returns 1 or more. At f512966 the same command returned 0."
      - "`grep -c 'One summary line, in this fixed shape' skills/fc-validate/SKILL.md` still returns 1, confirming the single-artefact return survived. At f512966 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does a sequenced pass return exactly one heading per comparison?"
      - "Does each heading carry the existing fixed summary line, unchanged in shape?"
      - "Does each heading name the comparison number, its source and its artefact?"
      - "Does the unrun/unjudged clause ride comparison 2's summary line only?"
      - "Does the withheld part keep one heading and name which comparison applied each correction?"
    self_eval:
      passed: true
      failures: []
    ```

- [ ] 2. The two merged validation templates

  ```yaml
  description: "Plan stage 2. Build the two path-specific templates from the three they replace, with the {stages} routing and the two-heading return added, and register both in the harness's rule H list and rule E allowlist. The orchestrator still runs the interim pair, so nothing changes behaviourally yet."
  ```

  - [ ] 2.1 Author `templates/validate-plan-and-tasks.md`
    ```yaml
    description: "Create the plan-path merged validation template, whose comparison 1 checks the brief and workstream record against the plan and whose comparison 2 checks the plan against the task list."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create `skills/flowcharge/templates/validate-plan-and-tasks.md`. Build it from `validate-plan.md` and `validate-tasks.md` as they stand at f512966; read both first and copy their text rather than retyping it."
      - "Keep the structure those two already have: `# <Title>`, `## Role`, `## Skills` naming `/fc-validate`, `## Context` with the shared `{{context docs}}` block and the fenced `{{source material}}` block, `## Instructions`, `## Return`, and the verbatim open-question return block last."
      - "Copy the `{{context docs}}` placeholder line byte-for-byte from `validate-plan.md`; it is shared across every template and must not drift."
      - "Use these slots and no others: `{stages}`, `{plan}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}`, `{{source material}}`. The `{artefact}` and `{source}` slots of the templates this replaces do not appear."
      - "Write the `{{source material}}` block to carry the source only, never the authoring subagent's return, rationale or self-report: the briefing text the plan was planned against, plus the workstream record held in `{ws_dir}`. Keep `validate-plan.md`'s present wording of that contract."
      - "In `## Instructions`, instruct the two comparisons in the fixed order: comparison 1 validates the plan at `{plan}` against the source in Context; comparison 2 validates the task list at `{tasklist}` against `{plan}` as it then stands."
      - "Add the `{stages}` routing: on `plan-only`, comparison 2 is skipped and named as skipped; on `plan-and-tasks`, both run; on `tasks-only`, comparison 1 is skipped and named as skipped."
      - "Scope `validate-plan.md`'s `Run no command as part of this validation.` sentence to comparison 1 only, and take `validate-tasks.md`'s verify-execution paragraph for comparison 2, copied unchanged."
      - "Keep the deference sentence both templates already carry: the /fc-validate skill is the authority for every rule named, and where the template and the skill appear to disagree the skill is right. Restate none of the skill's rules."
      - "In `## Return`, ask for one labelled heading per comparison, per the per-comparison return task 1.4 defined in the skill, and take the shape from the skill rather than restating it."
    pattern: "skills/flowcharge/templates/validate-plan-and-tasks.md, a new file. The three existing validate templates are read-only in this task."
    imports: "None. This is a prompt template."
    compatibility: "PLN-8-dy15dj, Design: `The two merged templates`. Rule H requires the verbatim open-question block; rule G requires every path written in the file to resolve on disk; rule E allows the word `gate` only through the allowlist entry task 2.4 adds."
    gotcha: "Rule H compares the open-question block against the master copy in `plan-and-tasks-spec.md` with whitespace collapsed. Copy the block from an existing validate template rather than retyping it, or the check fails on a single reworded clause."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `test -f skills/flowcharge/templates/validate-plan-and-tasks.md` succeeds. At f512966 the file did not exist."
      - "`grep -c '{artefact}' skills/flowcharge/templates/validate-plan-and-tasks.md` returns 0."
      - "`grep -c '{stages}' skills/flowcharge/templates/validate-plan-and-tasks.md` returns 1 or more."
      - "`grep -c 'No recommendation possible' skills/flowcharge/templates/validate-plan-and-tasks.md` returns 1, confirming the open-question block is present."
    checklist:
      - "Does the file carry all seven sections in the order the three it replaces use?"
      - "Are the slots exactly `{stages}`, `{plan}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}` and `{{source material}}`?"
      - "Is the `{{context docs}}` line byte-identical to the one in `validate-plan.md` at f512966?"
      - "Is the `run no command` sentence scoped to comparison 1 only?"
      - "Does comparison 2 carry `validate-tasks.md`'s verify-execution paragraph unchanged?"
      - "Does the file restate none of the /fc-validate skill's own rules?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 2.2 Author `templates/validate-issues-and-tasks.md`
    ```yaml
    description: "Create the issue-path merged validation template, whose comparison 1 checks the findings against the issue list and whose comparison 2 checks the issue list against the task list."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Create `skills/flowcharge/templates/validate-issues-and-tasks.md`. Build it from `validate-issues.md` and `validate-tasks.md` as they stand at f512966; read both first and copy their text rather than retyping it."
      - "Mirror the structure and the section order task 2.1 used for the plan path, so the two merged templates differ only where the path differs."
      - "Copy the `{{context docs}}` placeholder line byte-for-byte from `validate-issues.md`."
      - "Use these slots and no others: `{stages}`, `{issuelist}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}`, `{{source material}}`."
      - "Write the `{{source material}}` block to carry the findings as text, and keep `validate-issues.md`'s present sentence that the findings arrive as text because user-supplied findings are never written to a file, and that no file sits behind them."
      - "In `## Instructions`, instruct comparison 1 first, the findings in Context against the issue list at `{issuelist}`, then comparison 2, the issue list against the task list at `{tasklist}`."
      - "Add the same `{stages}` routing: `issues-only` skips comparison 2 and names the skip; `issues-and-tasks` runs both; `tasks-only` skips comparison 1 and names the skip."
      - "Scope `validate-issues.md`'s `Run no command as part of this validation.` sentence to comparison 1 only, and take `validate-tasks.md`'s verify-execution paragraph for comparison 2, copied unchanged."
      - "Keep the deference sentence, and in `## Return` ask for one labelled heading per comparison, taking the shape from the skill."
    pattern: "skills/flowcharge/templates/validate-issues-and-tasks.md, a new file."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `The two merged templates`, and its Assumption that the issue path is covered by the same design. Rules E, G and H apply exactly as in task 2.1."
    gotcha: "The issue path's source is text, not a path. Do not add a `{source}` slot or any instruction to go looking for a file behind the findings; `validate-issues.md`'s existing sentence forbidding that must survive the merge."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `test -f skills/flowcharge/templates/validate-issues-and-tasks.md` succeeds. At f512966 the file did not exist."
      - "`grep -c '{artefact}' skills/flowcharge/templates/validate-issues-and-tasks.md` returns 0."
      - "`grep -c '{issuelist}' skills/flowcharge/templates/validate-issues-and-tasks.md` returns 1 or more."
      - "`grep -c 'No recommendation possible' skills/flowcharge/templates/validate-issues-and-tasks.md` returns 1, confirming the open-question block is present."
    checklist:
      - "Does the file mirror task 2.1's section order?"
      - "Are the slots exactly `{stages}`, `{issuelist}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}` and `{{source material}}`?"
      - "Does it keep the sentence that no file sits behind the findings?"
      - "Is the `run no command` sentence scoped to comparison 1 only?"
      - "Does comparison 2 carry `validate-tasks.md`'s verify-execution paragraph unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 2.3 Extend `RULE_H_TEMPLATES` with both new templates
    ```yaml
    description: "Register the two merged templates in the harness's rule H list, so the verbatim open-question block is checked in both. The three existing entries stay until stage 5."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, in the `RULE_H_TEMPLATES` array declared at line 4863 and closed at line 4869, add two entries: `'flowcharge/templates/validate-plan-and-tasks.md',` and `'flowcharge/templates/validate-issues-and-tasks.md',`."
      - "Add them, do not replace anything. `validate-plan.md`, `validate-issues.md` and `validate-tasks.md` still exist on disk at this stage, and task 5.1 prunes them. The plan's Testing strategy states this split: stage 2 extends the list, stage 5 prunes it."
      - "Match the existing entries' quoting, indentation and trailing comma exactly."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the `RULE_H_TEMPLATES` array only."
    imports: "None. Plain JavaScript array literal."
    compatibility: "PLN-8-dy15dj, Design: `Both templates must be added to RULE_H_TEMPLATES`, and Testing strategy: `Stage 2 extends the rule H list and the allowlist, stage 5 prunes them`."
    gotcha: "Rule H reads each listed file from disk. Adding an entry before tasks 2.1 and 2.2 have created the file makes the check fail on a missing file, so this task runs after both."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c \"flowcharge/templates/validate-plan-and-tasks.md\" skills/flowcharge/scripts/test/run-tests.mjs` returns 1 or more. At f512966 it returned 0."
      - "`grep -c \"flowcharge/templates/validate-issues-and-tasks.md\" skills/flowcharge/scripts/test/run-tests.mjs` returns 1 or more. At f512966 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, and the case `every open-question-capable prompt template carries the verbatim return block` is among the ok lines."
    checklist:
      - "Does `RULE_H_TEMPLATES` now hold five entries?"
      - "Are the three pre-existing entries unchanged?"
      - "Do both new entries use the same `flowcharge/templates/` prefix form as the others?"
      - "Does the rule H case pass, proving both new templates carry the verbatim block?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 2.4 Add a `DOCS_ALLOWLIST` entry for `gate` in each new template
    ```yaml
    description: "Allow the word gate in each merged template's baseline-gate reference, so rule E stays green. The existing validate-tasks.md entry stays until stage 5."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, next to the `DOCS_ALLOWLIST` entry at line 4713 whose `file` is `flowcharge/templates/validate-tasks.md` and whose `text` is `gate`, add two entries of the same shape, one for `flowcharge/templates/validate-plan-and-tasks.md` and one for `flowcharge/templates/validate-issues-and-tasks.md`."
      - "Give each a `why` in the same form as the existing one: rule E, the template tells the validator to apply fc-validate's baseline gate, which is the precondition for running verify steps, not a prompt."
      - "Add them, do not replace the existing entry. `validate-tasks.md` still carries `gate` at this stage, and task 5.1 removes both the file and its entry together."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the `DOCS_ALLOWLIST` array around line 4713 only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `each needs a rule E DOCS_ALLOWLIST entry for the word gate in \"baseline gate\"`, read with Testing strategy's stage 2 extends / stage 5 prunes split."
    gotcha: "The harness also runs an allowlist-staleness case: every entry must match a live occurrence. An entry added for a template that does not yet contain the word `gate` fails that case, so tasks 2.1 and 2.2 must have written the verify-execution paragraph first."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'gate' skills/flowcharge/templates/validate-plan-and-tasks.md` returns 1 or more, and the same for `validate-issues-and-tasks.md`. At f512966 neither file existed."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, with both `no unallowed gate word naming the interrupt mechanism` and `every docs-consistency allowlist entry matches a live occurrence` among the ok lines."
    checklist:
      - "Does `DOCS_ALLOWLIST` now hold a `gate` entry for each of the two new templates?"
      - "Is the existing `validate-tasks.md` entry untouched?"
      - "Does each new entry's `why` name rule E and the baseline gate, as the existing one does?"
      - "Does the allowlist-staleness case pass, proving each new entry matches a live occurrence?"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 3. The setting, defined and obeyed

  ```yaml
  description: "Plan stage 3. The new SKILL.md section, the fourth agents.md key, the amended standing-instruction sentence, the rewritten Operations row and **validate** note, the two collapsed chains, the Chaining bounds and the re-derivation rule, and the repointed POLICY_SECTION_END. This is the stage where the behaviour flips."
  ```

  - [ ] 3.1 Add `## The validation setting` to `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Add the section that defines what the validate key governs, its accepted values and its built-in default, placed immediately after the prompt policy's setting contract."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, insert a new `## The validation setting` section between the end of `### The setting contract` (which closes at line 309 with the `No script can check` note) and `## Operations` (line 311)."
      - "State what the setting governs: whether a run checks its authored artefacts against the source they were authored from."
      - "State that `on` runs one pass once per run, after the authoring stage's return and before the execute-tasks prompt, and that `off` spawns no validator at all."
      - "State the accepted values, `on` and `off`, and the built-in default when the key and the file are both absent, `on`."
      - "Point at `## Reporting` for the visibility mechanism rather than restating it."
      - "Carry the `No script can check` note in the same form the prompt policy's setting contract already uses at lines 307-309, pointing back at DEVELOPMENT.md's note on unverifiable rules."
      - "Add no new hard rule. `prompts:` already set the precedent of a settings key owning its own section that the Operations table and the hard rules point at."
    pattern: "skills/flowcharge/SKILL.md, a new section inserted between line 309 and line 311. No hard rule is added or renumbered."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `skills/flowcharge/SKILL.md: a new section`, and acceptance criteria 1, 3 and 7. The section's position matches the key's position in the fixed order task 3.2 writes."
    gotcha: "Task 3.7 repoints POLICY_SECTION_END to `'## The validation setting'`. Spell the heading exactly that, with no trailing punctuation and no different wording, or the pin slices an empty region and the test fails on its own empty-slice assertion."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -cF '## The validation setting' skills/flowcharge/SKILL.md` returns 1. At f512966 it returned 0."
      - "`grep -n '^## ' skills/flowcharge/SKILL.md` shows `## The validation setting` between `## The prompt policy` and `## Operations`, in that order."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Is the heading spelled exactly `## The validation setting`?"
      - "Does it sit immediately after `### The setting contract` and immediately before `## Operations`?"
      - "Does it name both accepted values and the built-in default of `on`?"
      - "Does it place the pass after the authoring stage and before the execute-tasks prompt?"
      - "Does it point at `## Reporting` rather than restating the visibility mechanism?"
      - "Was no hard rule added or renumbered?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.2 Add the key to "Standing vs. one-off instructions"
    ```yaml
    description: "Make the validation setting a reader of agents.md, add validate to the fixed key order, and give the standing write its Noted: example."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in the opening sentence of `## Standing vs. one-off instructions` at lines 196-198, which begins `Hard rules 3, 4, 8, 9 and 10 each read a starting default from \\`flowcharge/agents.md\\``, add the validation setting alongside those hard rules as a reader of the file. Add no new hard rule."
      - "In the fenced fixed-order block at lines 236-240, add `validate: on | off` as the fourth and last line, after `prompts: manual | assist | cruise`."
      - "In the `Noted:` examples at lines 224-229, add one for this key, in the same form as the existing ones, so a standing instruction to stop validating reports as a plain statement with no question."
      - "Change nothing else in the section. The partial-file write rule, the never-write-a-blank-value rule, the write-the-default-rather-than-delete rule and the delete-the-file-when-empty rule all apply unchanged, and this key adds no new write mechanism."
    pattern: "skills/flowcharge/SKILL.md, `## Standing vs. one-off instructions` only: the opening sentence, the Noted: examples, and the fenced key block."
    imports: "None."
    compatibility: "PLN-8-dy15dj, acceptance criteria 1 and 2: the key is written last in the fixed order, and a standing instruction to stop validating writes that one line, leaves the other lines untouched, and is reported as one plain `Noted:` statement with no question."
    gotcha: "The fixed order is what a partial write follows. Putting `validate` anywhere but last would change where an existing three-key file gains its fourth line, and the plan states the position explicitly."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -cF 'validate: on | off' skills/flowcharge/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`grep -n -E '^(default_agent|task_list_mode|prompts|validate):' skills/flowcharge/SKILL.md` prints four lines, in the order `default_agent`, `task_list_mode`, `prompts`, `validate`, with consecutive line numbers. At f512966 it printed three lines, 237 to 239."
      - "`grep -c 'Noted:.*validat' skills/flowcharge/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, with `no open_questions at all, the retired agents.md key` among the ok lines."
    checklist:
      - "Does the opening sentence name the validation setting as a reader of `agents.md`?"
      - "Is `validate: on | off` the fourth and last line of the fixed-order block?"
      - "Is there a `Noted:` example for the validation setting, phrased as a statement with no question?"
      - "Were the four write rules left unchanged?"
      - "Was no new hard rule added?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.3 Rewrite the Operations table's `validate` row
    ```yaml
    description: "Repoint the validate row at the two merged templates, their new slots, both artefacts and the per-comparison return."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, replace the `validate` row of the Operations table at line 320, which currently names `templates/validate-plan.md`, `-issues.md` or `-tasks.md` with slots `{artefact}`, `{source}`, `{ws_dir}`, `{{context docs}}`, `{{source material}}`."
      - "Template column: `templates/validate-plan-and-tasks.md` or `-issues-and-tasks.md`."
      - "Slots column: `{stages}`, `{plan}` or `{issuelist}`, `{tasklist}`, `{ws_dir}`, `{{context docs}}`, `{{source material}}`."
      - "Consumes column: both artefacts the authoring stage returned, plus the source it authored from."
      - "Returns column: one summary line per comparison, plus any open finding, with correction detail withheld."
      - "Change no other row of the table."
    pattern: "skills/flowcharge/SKILL.md, line 320, the `validate` row of the Operations table only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `Operations table (SKILL.md:320)`. Rule G requires every path written in skill prose to resolve on disk, so tasks 2.1 and 2.2 must have landed first."
    gotcha: "The templates named here resolve relative to `skills/flowcharge/`. Writing `templates/validate-plan-and-tasks.md` is correct; writing a repo-root path is not, and rule G reads the path as written."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c '^| validate | `templates/validate-plan.md`' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`grep -c 'validate-plan-and-tasks.md' skills/flowcharge/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`grep -c '{artefact}`, `{source}' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, with `every path written in the prose resolves on disk` among the ok lines."
    checklist:
      - "Does the row name both merged templates and neither old one?"
      - "Does the slots column list exactly the six slots the plan names?"
      - "Does the consumes column name both artefacts plus the source?"
      - "Does the returns column say one summary line per comparison, with correction detail withheld?"
      - "Are the other rows of the table unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.4 Rewrite the `**validate**` note
    ```yaml
    description: "Replace the interim two-spawn pairing with the single-pass contract, and remove the sentence naming WS-15-d5hgor as its replacement."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, rewrite the `- **validate**:` note at lines 376-384. Remove the interim two-spawn pairing for both paths and the sentence stating that WS-15-d5hgor later replaces that pair with a single pass."
      - "State instead: one pass per run under `validate: on`, spawned after the authoring stage's return and before the execute-tasks prompt."
      - "State that the path chooses the template, and that `{stages}` passes through unchanged from the authoring stage."
      - "State the fixed comparison order and the never-align-backwards rule by pointer to `skills/fc-validate/SKILL.md`, not restated here."
      - "State that no validation subagent is spawned at all under `validate: off`."
      - "Keep the two sentences the note already carries: the validation stage is not prompted, because it neither changes project code nor commits; and its stage report carries the validator's summary line and any open finding only, with the per-correction detail printed on request and not before."
    pattern: "skills/flowcharge/SKILL.md, the `- **validate**:` note at lines 376-384 only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `The **validate** note (SKILL.md:376-384)`, and acceptance criteria 3 and 7."
    gotcha: "Restating the comparison order or the correction-direction rule here would create a second wording of a rule `skills/fc-validate/SKILL.md` owns. The templates and this note both point at the skill; neither repeats it."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'WS-15-d5hgor' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`grep -c 'validate-plan.md' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 2, and task 3.3 removed the first of them."
      - "`grep -c 'skills/fc-validate/SKILL.md' skills/flowcharge/SKILL.md` returns 1 or more, confirming the pointer is present."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Is the interim two-spawn pairing gone for both paths?"
      - "Is the sentence naming WS-15-d5hgor as the replacement gone?"
      - "Does the note say one pass per run under `on` and no spawn under `off`?"
      - "Does it point at `skills/fc-validate/SKILL.md` for the order and the correction direction, without restating either?"
      - "Do the not-prompted sentence and the stage-report sentence survive unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.5 Collapse the two standard chains in "Parsing the request"
    ```yaml
    description: "Fold each chain's two validate elements into one, placed after the authoring stage."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Parsing the request` at lines 390-394, rewrite the issue chain to read `issues-and-tasks → validate → [prompt] execute-tasks → [prompt] commit`, keeping the existing parenthetical that the findings come from the conversation."
      - "Rewrite the plan chain to read `plan-and-tasks → validate → [prompt] execute-tasks → [prompt] commit`."
      - "Change no other chain in the list."
    pattern: "skills/flowcharge/SKILL.md, the first two bullets of `## Parsing the request`, lines 390-394."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `Parsing the request (SKILL.md:390-394)`. These two lines are the user-facing description of the pipeline and must agree with the `**validate**` note task 3.4 rewrote."
    gotcha: "The chain lines and the validate note are the two places a reader learns the spawn count. If one says a single validate and the other still says two, the file contradicts itself."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c '→ validate-plan → validate-tasks' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`grep -c '→ validate-issues → validate-tasks' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`grep -c 'plan-and-tasks → validate →' skills/flowcharge/SKILL.md` returns 1. At f512966 it returned 0."
      - "`grep -c 'issues-and-tasks → validate →' skills/flowcharge/SKILL.md` returns 1. At f512966 it returned 0."
    checklist:
      - "Does each standard chain name exactly one `validate` element?"
      - "Does that element sit immediately after the authoring stage in both chains?"
      - "Are both prompted stages still marked `[prompt]`?"
      - "Are the other chain bullets unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.6 Rebound the Chaining section and add the re-derivation rule
    ```yaml
    description: "Change the validation bound from once per authoring stage to once per run, add the rule that a first-comparison finding re-derives the task list, and repoint the findings sentence at the new issue-path template."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in the Chaining passage at lines 488-501, change `and it runs at most once per authoring stage per run` to `and it runs at most once per run`."
      - "At lines 493-495, repoint the sentence about the user's findings from `validate-issues.md` to `validate-issues-and-tasks.md`, changing nothing else about it."
      - "Add one rule to the passage: where a first-comparison finding is applied to the upstream artefact, by the validator-applied path or by the re-spawn path, the task list is re-derived with the merged authoring template at `{stages}: tasks-only` pointed at the corrected upstream artefact, because the existing task list derives from the uncorrected one."
      - "State that this re-spawn is the one the existing budget already allows, and that the re-derived task list is not validated again."
      - "Leave the existing residual-gap sentences intact, including that the gap is named in the stage report and is recoverable with a standalone `/fc-validate`. That is the settled answer to the plan's second open question and must survive this edit."
      - "Change no other part of the Chaining section."
    pattern: "skills/flowcharge/SKILL.md, the Chaining passage at lines 488-501 only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `Chaining (SKILL.md:488-501)`, acceptance criterion 5, and the plan's second open question as settled: a re-derived task list inherits the no-second-validation rule and the gap is named with a standalone `/fc-validate` recommendation."
    gotcha: "The re-derivation must run in one direction only. A rule that also re-derives the upstream artefact from the task list would reintroduce exactly the laundering the correction-direction rule forbids."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'at most once per authoring stage per run' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 1."
      - "`grep -c 'at most once per run' skills/flowcharge/SKILL.md` returns 1. At f512966 it returned 0."
      - "`grep -c 'validate-issues.md' skills/flowcharge/SKILL.md` returns 0. At f512966 it returned 2, and task 3.4 removed the first of them."
      - "`grep -c 'recoverable with a standalone' skills/flowcharge/SKILL.md` still returns 1, confirming the residual-gap sentence survived. At f512966 it returned 1."
    checklist:
      - "Is the validation bound now once per run rather than once per authoring stage?"
      - "Does the section carry the re-derivation rule at `{stages}: tasks-only`?"
      - "Does it say the re-derived task list is not validated again?"
      - "Does the residual-gap sentence with the standalone `/fc-validate` recovery survive?"
      - "Is the findings sentence repointed at `validate-issues-and-tasks.md`?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 3.7 Repoint `POLICY_SECTION_END`
    ```yaml
    description: "Narrow the prompt-policy pin's slice back to the prompt policy, now that a new section sits between it and ## Operations."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs` at line 5121, change `const POLICY_SECTION_END = '## Operations';` to `const POLICY_SECTION_END = '## The validation setting';`."
      - "Change nothing else in the pin case. `POLICY_SECTION_OPEN`, the empty-slice assertion and `NO_RECOMMENDATION_RULE` all stay as they are."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, the `POLICY_SECTION_END` constant at line 5121 only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `POLICY_SECTION_END in skills/flowcharge/scripts/test/run-tests.mjs:5121 ... is repointed to '## The validation setting' in the same change`."
    gotcha: "The new value must match task 3.1's heading byte for byte. A mismatch makes `text.indexOf` return -1, the slice comes out empty, and the case fails on its own empty-slice assertion rather than on the rule it pins."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c \"POLICY_SECTION_END = '## The validation setting'\" skills/flowcharge/scripts/test/run-tests.mjs` returns 1. At f512966 it returned 0."
      - "`grep -c \"POLICY_SECTION_END = '## Operations'\" skills/flowcharge/scripts/test/run-tests.mjs` returns 0. At f512966 it returned 1."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, with `the prompt policy still carries the no-recommendation rule` among the ok lines."
    checklist:
      - "Does `POLICY_SECTION_END` hold the new heading exactly as task 3.1 spelled it?"
      - "Is `POLICY_SECTION_OPEN` unchanged?"
      - "Is the empty-slice assertion unchanged?"
      - "Does the pin case still pass, proving the slice is non-empty and holds the rule?"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 4. The visibility mechanism, WS-106 item 4

  ```yaml
  description: "Plan stage 4. The pipeline line names the validation stage as its own element, and the end-of-run self-check reports a validation that did not run as waived or as missing. It follows stage 3 because it reports on the stage shape stage 3 creates."
  ```

  - [ ] 4.1 Name the validation stage in the pipeline line
    ```yaml
    description: "Require one element per stage in the announced pipeline, the validation stage included, with no folding, and mark a waived validation in the line."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Reporting` at lines 761-762, rewrite the pipeline bullet so it states that the line names every stage the run will execute, one element per stage, the validation stage included, with no abbreviation folding validation into its authoring stage."
      - "Change the example to `issues → spec tasks → validate → execute (prompted) → commit (prompted)`."
      - "State that a validation the setting turned off appears in the line as `validate (waived)`."
      - "Keep the existing clause naming the workstream the run runs under."
    pattern: "skills/flowcharge/SKILL.md, the first bullet of `## Reporting`, lines 761-762."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `The pipeline line (SKILL.md:761-762)`, and acceptance criterion 8. WS-106-6m67j5's item 4 supplies the mechanism; its own example string is superseded, and its record is not edited."
    gotcha: "WS-106 item 4's example, `issues → validate → spec tasks → validate`, cannot hold under a single pass. Use the plan's example, not that record's, and do not edit `WS-106-6m67j5-enforce-create-validate-pairing/workstream.md`, which the plan places out of scope."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'issues → spec tasks → validate' skills/flowcharge/SKILL.md` returns 1. At f512966 it returned 0."
      - "`grep -c 'validate (waived)' skills/flowcharge/SKILL.md` returns 1 or more. At f512966 it returned 0."
      - "`git status --porcelain` shows no change under `flowcharge/workstreams/WS-106-6m67j5-enforce-create-validate-pairing/`."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does the bullet require one element per stage, with the validation stage named?"
      - "Does it forbid folding validation into its authoring stage?"
      - "Is the example exactly the plan's single-validate form?"
      - "Does a waived validation still appear in the line, marked `(waived)`?"
      - "Is WS-106-6m67j5's own record untouched?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.2 Add the end-of-run validation self-check
    ```yaml
    description: "Compare the stages that ran against the announced line before the consolidated summary prints, and report a validation that did not run as waived or as missing."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/SKILL.md`, in `## Reporting`, add the self-check to the end-of-run bullet that begins at line 766 and carries the numbered-list rules at lines 769-773. State that before the consolidated summary prints, the stages that ran are compared against the announced line."
      - "State the waived case: where the validation stage did not run and the run's resolved `validate` value is `off`, it is reported as **waived**, in prose, never as a numbered item. The `validate` setting is the only cause of a waiver; there is no spoken one-run skip path."
      - "State the missing case: where it did not run for any other reason, it is reported as **missing**, and each artefact it would have checked gets one numbered, self-contained item (ID, title, one plain sentence, per \"Talking to the user\") recommending a standalone `/fc-validate` on that artefact."
      - "State that the re-spawn carve-out counts as validated once and never fires this check."
      - "State that the check reports only and starts no stage, and that exactly the two words `missing` and `waived` are used."
      - "Change nothing else in the end-of-run bullet, including the fc-validate fixes rule and the settled-decisions record."
    pattern: "skills/flowcharge/SKILL.md, the end-of-run bullet of `## Reporting`, around lines 766-773."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design: `The end-of-run self-check (SKILL.md:769-773)`, and acceptance criterion 8. There is no spoken one-run skip path: the `validate` key is the only cause of a waiver, and any other reason validation did not run, a spoken request included, is reported as `missing`, per the plan's own Assumptions."
    gotcha: "`waived` and `missing` are not interchangeable. A waived validation raises no numbered item and no recommendation; a missing one raises one numbered `/fc-validate` item per affected artefact. Collapsing the two would make a chosen skip read as an accident, which is the distinction the two words exist to carry."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'waived' skills/flowcharge/SKILL.md` returns 2 or more, counting task 4.1's occurrence and this one. At f512966 it returned 0."
      - "`tr '\\n' ' ' < skills/flowcharge/SKILL.md | grep -c 'The re-spawn carve-out'` returns 1. At f512966 the same command returned 0."
      - "`grep -c 'settled-decisions record' skills/flowcharge/SKILL.md` is unchanged from f512966, where it returned 2, confirming the surrounding bullet survived."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does the self-check run before the consolidated summary prints?"
      - "Is the waived case reported in prose with no numbered item and no recommendation?"
      - "Does the missing case raise one numbered `/fc-validate` item per affected artefact?"
      - "Does the re-spawn carve-out count as validated once and never fire the check?"
      - "Does the check report only and start no stage?"
      - "Are exactly the two words `missing` and `waived` used?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 4.3 Walk the seven integration cases against the edited `SKILL.md`
    ```yaml
    description: "Run the plan's documented walkthrough, this suite's established method for rules no script can check, over the edited skills/flowcharge/SKILL.md, and record the result per case in the task return."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Read the edited `skills/flowcharge/SKILL.md` end to end, then walk it against each case below and record, per case, the sections that decide it and whether the file's prose reaches the stated outcome. Record the result in this task's return; author no new file for it (see Divergence 1)."
      - "Case 1: a plan-path run with the key absent must resolve to `on` and spawn one validator."
      - "Case 2: an issue-path run under `validate: on` must spawn one validator and no more."
      - "Case 3: a run under `validate: off` must spawn none and report `waived` in prose."
      - "Case 4: a `tasks-only` run must run comparison 2 alone and name comparison 1 as skipped."
      - "Case 5: a first-comparison finding settled under `prompts: cruise` must correct the upstream artefact and re-derive the task list, never the reverse."
      - "Case 6: a validation that did not run for a reason other than the setting must report `missing` with one numbered `/fc-validate` item per artefact."
      - "Case 7: a spoken one-run skip must be reported `missing`, with a numbered `/fc-validate` recommendation, never `waived`, and not written to `agents.md`."
      - "Where a case does not reach its stated outcome, do not improvise a fix. Record which case failed and which section left it undecided, and stop."
      - "Change no file in this task. It is a read and a record."
    pattern: "skills/flowcharge/SKILL.md and skills/fc-validate/SKILL.md, read-only. No file is written."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Testing strategy: `Integration coverage is a documented walkthrough ... After stage 4, walk the edited skills/flowcharge/SKILL.md end to end against these cases and record the result`, and DEVELOPMENT.md:79-83 on unverifiable rules."
    gotcha: "The walkthrough is a reading, not an execution. It spawns no subagent and runs no pipeline. Cases 4 and 5 span both edited files, so the `{stages}` routing in the templates and the correction-direction rule in `skills/fc-validate/SKILL.md` must be read alongside the orchestrator prose."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `git status --porcelain` returns no line for any file, confirming the walkthrough wrote nothing. At f512966 the same command also returned nothing, so this step is a guard against an unintended write rather than a discriminating check."
      - "The task return names all seven cases and states, per case, the sections that decide it and the outcome the prose reaches. A return naming fewer than seven fails this step."
    checklist:
      - "Were all seven cases walked, with none skipped?"
      - "Does each case name the sections that decide it?"
      - "Did case 5 confirm the correction runs upstream-to-downstream only?"
      - "Did cases 3 and 6 confirm `waived` and `missing` are reported distinctly?"
      - "Was no file written during the walkthrough?"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 5. Remove the superseded templates

  ```yaml
  description: "Plan stage 5. Delete the three replaced templates and repoint the harness's two hardcoded lists in the same change so nothing goes stale, then add a pin case for the correction-direction rule."
  ```

  - [ ] 5.1 Delete the three templates and prune the harness's two lists
    ```yaml
    description: "Delete validate-plan.md, validate-issues.md and validate-tasks.md, and remove their RULE_H_TEMPLATES entries and the validate-tasks.md DOCS_ALLOWLIST entry, all in one change."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Delete `skills/flowcharge/templates/validate-plan.md`, `skills/flowcharge/templates/validate-issues.md` and `skills/flowcharge/templates/validate-tasks.md`."
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, remove the three matching entries from `RULE_H_TEMPLATES`, leaving the two entries task 2.3 added plus the two `plan-and-tasks-*` entries."
      - "In the same file, remove the `DOCS_ALLOWLIST` entry whose `file` is `flowcharge/templates/validate-tasks.md` and whose `text` is `gate`, leaving the two entries task 2.4 added."
      - "Apply all four edits in one change. Deleting a file while its rule H entry stands makes the rule read a missing file; removing the allowlist entry while the file stands makes rule E flag its `gate` occurrence. Neither half passes alone."
      - "Confirm before deleting that no prose in `skills/` still names any of the three files. Tasks 3.3, 3.4 and 3.6 removed the last such references, so rule G is already green without them."
    pattern: "skills/flowcharge/templates/validate-plan.md, validate-issues.md and validate-tasks.md (deleted), and skills/flowcharge/scripts/test/run-tests.mjs (RULE_H_TEMPLATES and DOCS_ALLOWLIST)."
    imports: "None."
    compatibility: "PLN-8-dy15dj, stage 5: `The three files are deleted, and the harness's two hardcoded lists are repointed in the same change so nothing goes stale`, and Data & compatibility: stage 3 has already stopped naming them, so no dangling path is left and rule G stays green."
    gotcha: "This task touches four files by design, against the usual one-file rule, because the plan requires the deletion and the repointing to land together and no intermediate state passes the check command. Do not split it."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `ls skills/flowcharge/templates/ | grep -c '^validate-'` returns 2. At f512966 it returned 3."
      - "`ls skills/flowcharge/templates/` shows exactly `validate-plan-and-tasks.md` and `validate-issues-and-tasks.md` among the validate templates."
      - "`grep -c \"templates/validate-tasks.md\" skills/flowcharge/scripts/test/run-tests.mjs` returns 0. At f512966 it returned 2, one rule H entry and one allowlist entry."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes, with `every path written in the prose resolves on disk`, `no unallowed gate word naming the interrupt mechanism`, `every open-question-capable prompt template carries the verbatim return block` and `every docs-consistency allowlist entry matches a live occurrence` all among the ok lines."
    checklist:
      - "Are all three superseded templates gone from disk?"
      - "Does `RULE_H_TEMPLATES` name only live files?"
      - "Is the `validate-tasks.md` allowlist entry gone, with the two new ones kept?"
      - "Did all four edits land in one change, with no intermediate commit?"
      - "Does the check command pass with rules E, G, H and the staleness case green?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 5.2 Add a pin case for the correction-direction rule
    ```yaml
    description: "Pin the never-align-backwards rule in skills/fc-validate/SKILL.md with a sliced containment case, built the same way as the existing prompt-policy pin."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `skills/flowcharge/scripts/test/run-tests.mjs`, add one `testCase` for the correction-direction rule, modelled on the prompt-policy pin at lines 5110-5145. Read that case first and mirror its shape."
      - "Declare an open constant and an end constant that bound the section of `skills/fc-validate/SKILL.md` holding the rule, and a rule constant holding the literal sentence task 1.2 wrote."
      - "Key both bounds on text, never on a line number, and normalise the slice's whitespace before the containment check, exactly as the prompt-policy pin does, because the rule wraps across source lines."
      - "Keep the empty-slice assertion: assert first that the slice is non-empty, with a message saying the case would otherwise pass on an empty slice."
      - "Write the failure message so it names the rule the pin protects, in the same form the existing pin's message uses."
      - "Add no allowlist entry and no rule to the docs-consistency set. This is a standalone pin case, exactly as the prompt-policy one is."
    pattern: "skills/flowcharge/scripts/test/run-tests.mjs, one new testCase beside the prompt-policy pin."
    imports: "The file's existing `fs`, `path`, `assert`, `testCase` and `SKILLS_ROOT` bindings. Add no new import."
    compatibility: "PLN-8-dy15dj, stage 5: `a pin case is added for the correction-direction rule, mirroring the existing prompt-policy pin`, and Testing strategy: `built the same way as the existing prompt-policy pin`."
    gotcha: "The pin reads `skills/fc-validate/SKILL.md`, not `skills/flowcharge/SKILL.md`. The prompt-policy pin joins `SKILLS_ROOT` with `'flowcharge'`; this one joins it with `'fc-validate'`. Copying the path unchanged would pin the wrong file and still pass."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `node skills/flowcharge/scripts/test/run-tests.mjs` passes and its total case count is one higher than at f512966, where it printed `263/263 cases passed`."
      - "Temporarily reword the pinned sentence in `skills/fc-validate/SKILL.md`, re-run the check command, confirm the new case fails, then restore the file and re-run to confirm it passes. `git diff --stat -- skills/fc-validate/SKILL.md` must be empty afterwards."
    checklist:
      - "Does the new case read `skills/fc-validate/SKILL.md` and not the orchestrator skill?"
      - "Does it slice a bounded section rather than searching the whole file?"
      - "Does it assert the slice is non-empty before the containment check?"
      - "Are both bounds keyed on text rather than on a line number?"
      - "Does the case fail when the pinned sentence is reworded, proven by the temporary edit?"
    self_eval:
      passed: false
      failures: []
    ```

- [ ] 6. Documentation

  ```yaml
  description: "Plan stage 6. README.md and CHANGELOG.md describe what ships. No suite version bump: the plan writes the changelog line and the maintainer decides the release."
  ```

  - [ ] 6.1 Add the key to `README.md`'s `agents.md` block
    ```yaml
    description: "Turn the README's three standing defaults into four, and explain in two sentences what on and off do."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `README.md` at lines 103-109, change the sentence `An optional \\`flowcharge/agents.md\\` in your project sets three standing defaults:` so it says four."
      - "Add a fourth line to the fenced block: `validate: on | off                 # whether artefacts are checked against their source`, aligned with the existing comment column."
      - "Below the block, add two sentences: `on` runs one check of the run's artefacts against what they were authored from; `off` runs none and is the cheaper, faster choice."
      - "Change nothing else in `## How often it stops for you`. The `prompts:` explanation and its three bullets stay as they are."
    pattern: "README.md, lines 103-109 and the two sentences added below the fenced block."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design / Documentation: `README.md:103-109`. The README is user-facing prose and states the default as `on`, matching acceptance criterion 1."
    gotcha: "The comment column in the fenced block is aligned by spaces. A new line that breaks the alignment makes the block read as hand-patched, and the README is the first thing a new user sees."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'three standing defaults' README.md` returns 0. At f512966 it returned 1."
      - "`grep -c 'four standing defaults' README.md` returns 1. At f512966 it returned 0."
      - "`grep -c 'validate: on' README.md` returns 1 or more. At f512966 it returned 0."
      - "`node skills/flowcharge/scripts/test/run-tests.mjs` passes. At f512966 it printed `263/263 cases passed`, so this step is a regression guard and cannot fail at f512966 on its own."
    checklist:
      - "Does the sentence now say four standing defaults?"
      - "Is `validate: on | off` the fourth line of the block, in the same order as the SKILL.md fixed order?"
      - "Do the two sentences below the block describe both values?"
      - "Is the comment column still aligned?"
      - "Is the `prompts:` explanation unchanged?"
    self_eval:
      passed: false
      failures: []
    ```
  - [ ] 6.2 Add the CHANGELOG entries
    ```yaml
    description: "Record the key and the two templates under Added, the single pass and the visibility mechanism under Changed, and the three superseded templates under Removed, all in ## Unreleased."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "In `CHANGELOG.md`, under `## Unreleased`, add to `### Added` one entry covering the `validate: on | off` key in `flowcharge/agents.md` and the two new templates `flowcharge/templates/validate-plan-and-tasks.md` and `flowcharge/templates/validate-issues-and-tasks.md`."
      - "Add to `### Changed` one entry covering the single end-of-run validation pass that makes two comparisons in a fixed order and never edits the upstream artefact to agree with the task list, and the visibility mechanism that names the validation stage in the pipeline line and reports a skip as `waived` or `missing`."
      - "Add a `### Removed` subsection under `## Unreleased` if one is not already present, and record the deletion of `flowcharge/templates/validate-plan.md`, `validate-issues.md` and `validate-tasks.md` as superseded by the two merged templates."
      - "Match the existing entries' voice and level of detail: each says what changed and why a reader would care, in the same prose style as the `plan-and-tasks-*` entries already under `### Added`."
      - "Write no release heading and bump no version. The suite version bump is out of scope; the maintainer decides the release."
    pattern: "CHANGELOG.md, the `## Unreleased` section only."
    imports: "None."
    compatibility: "PLN-8-dy15dj, Design / Documentation, and Out of scope: `A suite version bump. This plan writes the CHANGELOG line; the maintainer decides the release.` Versioning is MINOR per the plan, but no version heading is written here."
    gotcha: "`checkSuiteVersion` in `skills/flowcharge/scripts/fc-index.mjs` matches `^## (\\d+\\.\\d+\\.\\d+)`. Do not add a version heading, and do not bracket any existing one, or the file's own documented deviation is broken."
    verify:
      - "Run from `~/Work/AK/flowcharge-core-public`: `grep -c 'validate-plan-and-tasks' CHANGELOG.md` returns 1 or more. At f512966 it returned 0."
      - "`grep -c '^### Removed' CHANGELOG.md` returns 1 or more, and the entry sits under `## Unreleased`."
      - "`grep -cE '^## [0-9]+\\.[0-9]+\\.[0-9]+' CHANGELOG.md` is unchanged from f512966, confirming no release heading was added."
      - "`node skills/flowcharge/scripts/fc-index.mjs --root . --check` reports no new warning about the suite version."
    checklist:
      - "Does `### Added` name the key and both new templates?"
      - "Does `### Changed` name the single pass and the visibility mechanism?"
      - "Does `### Removed` name all three superseded templates?"
      - "Do all three entries sit under `## Unreleased`?"
      - "Was no version heading added and no version bumped?"
    self_eval:
      passed: false
      failures: []
    ```

## Divergences

1. **The walkthrough has no recorded destination.** The plan's Testing strategy says to walk
   the edited `skills/flowcharge/SKILL.md` against seven cases after stage 4 and "record the
   result", and cites `DEVELOPMENT.md:79-83` as this suite's established method. Reading
   `~/Work/AK/flowcharge-core-public/DEVELOPMENT.md:79-83` at `f512966` shows that passage
   states only that documented guidance is the defence for a rule no script can check; it
   names no file a walkthrough result is written to, and no such record exists elsewhere in
   the repository. Task 4.3 therefore records the result in the task return rather than
   authoring a new file, because inventing a destination file would add a deliverable the
   plan does not specify.

2. **Stage 2's allowlist wording resolves against the Testing strategy.** The plan's Design
   says each new template "needs a rule E `DOCS_ALLOWLIST` entry for the word `gate` ...
   replacing the entry that names `flowcharge/templates/validate-tasks.md` at line 4713",
   while its Testing strategy says "Stage 2 extends the rule H list and the allowlist, stage
   5 prunes them". At `f512966` the entry at
   `~/Work/AK/flowcharge-core-public/skills/flowcharge/scripts/test/run-tests.mjs:4713` is
   live and `skills/flowcharge/templates/validate-tasks.md` still carries the word, so
   removing it at stage 2 makes rule E fail on that file. Tasks 2.4 and 5.1 follow the
   Testing strategy: stage 2 adds the two entries, stage 5 removes the old one together
   with the file.

Every other file the plan cites matched what the plan assumes at `f512966`, by path and by
line: `skills/fc-validate/SKILL.md`'s five parts, `skills/flowcharge/SKILL.md` lines
196-198, 224-229, 236-240, 307-309, 320, 376-384, 390-394, 488-501 and 761-773,
`skills/flowcharge/scripts/test/run-tests.mjs` lines 4713, 4863-4869 and 5121,
`README.md:103-109`, `skills/flowcharge/CONVENTIONS.md:15-16` and `DEVELOPMENT.md:79-83`.
