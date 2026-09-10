---
id: TL-1-fzkro7
type: tasklist
workstream: WS-1-qrec54
slug: execute-gate-approval-ambiguity
title: "Stop a blanket 'go with your recommendations' reply from satisfying the execute-tasks or commit gate"
status: done
created: 2026-08-09
updated: 2026-09-10
author: Anthony Koukoullis
depends_on: [PLN-1-kqwu53]
links: []
mode: spec
base_commit: 803e0e1
---

# FlowCharge Tasks

## Stop a blanket reply from satisfying a gate, keep an unasked-for gate out of the numbered list, and give a flagged task its own home

PLN-1-kqwu53 lands three agreed modifications in one file, `skills/flowcharge/SKILL.md` in
this repository (`/Users/akoukoullis/Work/AK/FlowCharge Core`). Three rules combine today to let
"go with your recommendations" satisfy the execute-tasks or commit gate. Hard rule 4 asks
for "an explicit yes". The "Gates" section asks for that yes as a numbered question with a
recommendation. "Talking to the user" promises a blanket reply always answers a numbered
question. The three modifications close each leg:

1. **A reply must be about the stage.** Hard rule 4 gains the direct-and-determinate test
   for the reply, not only for the original request, plus the one case where a bare "yes"
   is enough. "Gates" gains the procedure for a reply that settles other items but not the
   gate. "Talking to the user" scopes its promise.
2. **A gate the run was not asked to reach is never a numbered item.** "Parsing the
   request" gains the prose-only rule, copying the FlowCharge Core upkeep archiving offer.
   "Reporting" echoes the exclusion in its end-of-run bullet.
3. **A per-task risk flag gets a defined home.** "Gates" gains a **Flagged tasks** block
   between its two existing gate bullets.

Eight parent tasks, one per PLN-1-kqwu53 stage, in the plan's order. Tasks 1 to 6 are text edits
to `skills/flowcharge/SKILL.md`. Tasks 7 and 8 modify nothing; they are verification
passes.

**Out of scope, per PLN-1-kqwu53.** Every file under `skills/flowcharge/prompts/`,
`skills/flowcharge/CONVENTIONS.md`, `skills/flowcharge/scripts/fc-index.mjs`,
`README.md`, every other skill in the suite, and the installed copies under `~/.claude/skills/`
and `~/.config/opencode/skills/`. Hard rule 10 and the `open_questions` preference stay
unamended. No new `flowcharge/agents.md` key. The `gates: skip` waiver and the
"don't ask / no gates / run straight through" waiver stay untouched. No `risk:` key is
added to the task-list schema — modification 3 asks for a place in the gate **report**, not
a new data key. No hard rule is renumbered, moved, or deleted.

**Anchoring.** Every earlier task in this list shifts the line numbers the later ones would
otherwise use. Anchor on quoted text, never on a line number. The line numbers cited in
`pattern` fields are `base_commit` 803e0e1 positions, given only to locate a section
quickly.

**Verification tooling.** This project has no `package.json`, no linter and no
type-checker. Every verify step is therefore a `grep`, a file read, a `git` inspection, or
the index generator's own `--check` mode, which writes nothing. A user-level global
`.gitignore` excludes `flowcharge/` from git in this repository, so no file under
`flowcharge/workstreams/WS-1-qrec54-execute-gate-approval-ambiguity/` can ever appear in
`git status --short`. That absence is expected, per PLN-1-kqwu53 assumption A8, and is not a
scope defect.

- [x] 1. Stage 1 — Hard rule 4: the reply is judged, not only the request

  ```yaml
  description: "Insert PLN-1-kqwu53 design D2's paragraph into hard rule 4 so the explicit yes it demands must itself be direct and determinate about the gated stage, a blanket endorsement never satisfies a gate on its own, and a bare yes is sufficient only when the gate was the sole question outstanding."
  ```

  - [x] 1.1 Extend hard rule 4 in `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Split the line that carries two sentences and insert the reply test between them, leaving the direct/determinate definitions, the don't-ask waiver and the gates: skip sentence verbatim."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: hard rule 4 in the '## Hard rules' list, the item beginning '4. **Two gates: execute-tasks and commit.**'. Its continuation lines carry a 3-space indent, spaces only."
      - "Locate this exact line inside that rule, which carries TWO sentences: '   Otherwise: report and wait for an explicit yes. An explicit \"don't ask / no'. The insertion point is between them. Split that line — do not append to it, and do not move the 'An explicit \"don't ask / no gates / run straight through\"' sentence anywhere else in the rule."
      - "Insert, immediately after 'Otherwise: report and wait for an explicit yes.' and immediately before 'An explicit \"don't ask / no gates / run straight through\"', the text from PLN-1-kqwu53 design D2. Wording may be re-wrapped to the file's 3-space continuation indent and its line width, but every clause below must survive: 'That yes must itself be direct and determinate about this stage — the same two tests, applied to the reply. Direct: this stage is what the reply is about. Determinate: the reply names execution or commit, or is the unmistakable answer to a gate question that was the only thing outstanding. A blanket endorsement of your recommendations — \"go with your recommendations\", \"yes to all\", \"do what you think best\" — never satisfies a gate on its own, however many numbered items it resolves, and even when the gate was one of them.'"
      - "The clause 'or is the unmistakable answer to a gate question that was the only thing outstanding' is design decision D4 and is required by acceptance criterion 3. Do not drop it, and do not weaken it into a requirement for the literal words 'execute' or 'commit' in every case."
      - "Change nothing else in rule 4: the 'direct' and 'determinate' definitions, the 'Satisfied: proceed, reporting per \"Gates\"' sentence, the 'don't ask / no gates / run straight through' waiver, the 'Every other stage runs autonomously' sentence, and the 'A `gates: skip` line in `flowcharge/agents.md`' sentence all stay verbatim."
      - "Do not create a new hard rule, do not renumber rules 3 or 5, and do not touch the 'Gates' section — task 2 owns it."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, hard rule 4 (lines 46-56 at base_commit 803e0e1)."
    imports: "None. This is prose in a Markdown skill file. No code, no dependency, no build step."
    compatibility: "PLN-1-kqwu53 design D2 and D4. The new text reuses the rule's own 'direct' and 'determinate' vocabulary, defined two sentences earlier, and invents none. Rejected alternatives that must NOT be built: a new hard rule 12 for the reply test, and putting this text in the 'Gates' section instead of rule 4. The hard rules are the file's normative core and are cross-referenced by number, so the definition of what satisfies a gate belongs where the gate is defined."
    gotcha: "The insertion point is mid-line, not end-of-line: 'Otherwise: report and wait for an explicit yes.' and 'An explicit \"don't ask / no' share one physical line, so a naive append would place the new paragraph after the waiver and break acceptance criterion 6. The rule uses a 3-space continuation indent — 4 spaces would render the item as a code block. The file uses typographic em dashes and curly quotes nowhere; keep straight ASCII quotes, matching the surrounding text. Rule 4's item marker '4. **' must stay at column 0 so the acceptance criterion 20 hard-rule count stays at eleven."
    verify:
      - "Run: grep -n \"never satisfies a gate on its own\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must return exactly one line, and that line must sit inside hard rule 4."
      - "Run: grep -c \"don't ask / no gates / run straight through\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1."
      - "Run: grep -c \"gates: skip\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1."
      - "Run: grep -c \"^[0-9]\\{1,2\\}\\. \\*\\*\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print 11, confirming no hard rule was added, renumbered or lost."
      - "Read hard rule 4 end to end and confirm acceptance criteria 1, 2, 3 and 6. Read hard rules 3 and 5 and confirm both are unchanged."
    checklist:
      - "Does hard rule 4 now state that the explicit yes must itself be direct and determinate about that specific stage? (acceptance criterion 1)"
      - "Does it name 'go with your recommendations' as an example of a blanket endorsement that never satisfies a gate on its own, even when the gate was one numbered item in the endorsed list? (acceptance criterion 2)"
      - "Does it state the sufficient case — a bare yes answering a gate question that was the only thing outstanding? (acceptance criterion 3)"
      - "Do the direct and determinate definitions, the don't-ask waiver and the gates: skip sentence all survive verbatim, in their original order? (acceptance criterion 6)"
      - "Is the hard-rule count still eleven, with no rule renumbered or moved? (acceptance criterion 20)"
      - "Is skills/flowcharge/SKILL.md the only file this task changed?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. Verify greps: 'never satisfies a gate on its own' = 1 hit (line 57, inside rule 4); \"don't ask / no gates / run straight through\" = 1; 'gates: skip' = 1; hard-rule count = 11; git status --short lists skills/flowcharge/SKILL.md only. The waiver and gates: skip sentences were soft-re-wrapped where the insertion re-flowed the paragraph; their words and order are unchanged. That re-wrap also places the full waiver phrase on one line, which is what makes the verify grep read 1 (it read 0 at base_commit 803e0e1, where the phrase straddled a line break)."
    ```

- [x] 2. Stage 2 — "Gates": what to do with a reply that does not satisfy the gate

  ```yaml
  description: "Append PLN-1-kqwu53 design D3's paragraph to the Gates section so an orchestrator that correctly judges a reply insufficient has a stated next move: apply what the reply settled, say the gate is still open, and re-ask it alone."
  ```

  - [x] 2.1 Append the non-satisfying-reply procedure to `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Add one new paragraph at the end of the '## Gates' section, after its existing closing paragraph, leaving the section's opening paragraph and both gate bullets untouched."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: the '## Gates' section. Its closing paragraph reads, verbatim and unindented: 'A \"no\" or a revision request at a gate is a normal outcome, not a failure — apply' / 'the revision (which may mean re-running an authoring stage) or stop cleanly.'"
      - "Insert a new unindented paragraph after that closing paragraph, separated by one blank line, and still before the '## FlowCharge Core upkeep (automatic, every pipeline run)' heading. Do not merge it into the existing paragraph."
      - "Insert the text from PLN-1-kqwu53 design D3. Wording may be re-wrapped to the file's line width, but every clause below must survive: 'A reply that settles other items but does not name this stage leaves the gate unsatisfied (rule 4). Apply whatever else the reply settled, say plainly that the gate is still open, then ask it again on its own — the gate question and nothing else — and wait.'"
      - "The phrase 'on its own' is load-bearing: re-asking inside a fresh mixed numbered list would reproduce the ambiguity this whole change removes. Do not soften it, and do not add an instruction to re-ask as part of a list."
      - "Change nothing else in the section: the opening paragraph ('Same report content either way ...'), the '**Before execute-tasks**' bullet, the '**Before commit**' bullet, and the closing paragraph all stay verbatim. Task 6 owns the insertion between the two bullets; do not do any part of it here."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, the '## Gates' section (lines 349-362 at base_commit 803e0e1)."
    imports: "None."
    compatibility: "PLN-1-kqwu53 design D3, and depends on task 1 having landed so this text points at a rule that already says it. Rule 4 says what a reply means; 'Gates' says what to do about it. The two halves are deliberately split across the two sites, so do not restate rule 4's test here and do not move the procedure into rule 4."
    gotcha: "This section's opening paragraph still says to ask 'proceed?' as a numbered question with a recommendation. That sentence stays — task 1 and task 3 are what stop a blanket reply from answering it, and PLN-1-kqwu53 explicitly rejected rewriting the Gates format rule. The new paragraph is unindented prose, not a bullet; adding it as a bullet would put it in the same list as the two gate-report bullets. Line 349 onward shifts once task 1 lands, so locate the section by its '## Gates' heading, not by line number."
    verify:
      - "Run: grep -n \"ask it again on its own\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must return exactly one line, inside the '## Gates' section and after its closing paragraph."
      - "Run: grep -c \"a normal outcome, not a failure\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1."
      - "Run: grep -c \"numbered question with a recommendation\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1, confirming the section's opening paragraph is intact."
      - "Read the whole '## Gates' section and confirm the opening paragraph, the '**Before execute-tasks**' bullet, the '**Before commit**' bullet and the closing paragraph are all otherwise unchanged. Confirm acceptance criterion 4."
    checklist:
      - "Does the Gates section now state what to do with a reply that settles other items but does not name the gated stage? (acceptance criterion 4)"
      - "Does that text require all four actions — apply what was settled, say the gate is still open, re-ask the gate on its own, and wait?"
      - "Are the section's opening paragraph, both gate bullets and its closing paragraph all unchanged?"
      - "Was no text added between the '**Before execute-tasks**' and '**Before commit**' bullets by this task?"
      - "Is skills/flowcharge/SKILL.md the only file this task changed?"
    self_eval:
      passed: true
      failures: []
      notes: "All five checklist items YES. The new paragraph sits at lines 371-374, after the closing paragraph and before the '## FlowCharge Core upkeep' heading, unindented and separated by one blank line. Verify results: 'ask it again on its own' = 1 hit (line 373, inside '## Gates'); 'a normal outcome, not a failure' = 1; 'numbered question with a recommendation' = 1; git status --short and git diff --stat both list skills/flowcharge/SKILL.md only. The git diff hunk for this task is pure addition — neither gate bullet appears as an added or removed line, and both are outside the hunk entirely. The four required actions all survive: apply what the reply settled, say plainly the gate is still open, ask it again on its own, and wait. The load-bearing phrase 'on its own' is present and unsoftened, with no instruction to re-ask inside a list."
    ```

- [x] 3. Stage 3 — "Talking to the user": scope the blanket-reply promise

  ```yaml
  description: "Amend the 'Every question carries a recommendation' bullet so its promise is scoped to ordinary questions and it names the unsatisfied execute-tasks or commit gate as the one thing a blanket reply never answers, pointing at hard rule 4."
  ```

  - [x] 3.1 Amend the recommendation bullet in `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Rewrite the second bullet of '## Talking to the user' to keep its promise for every ordinary question while carving out the gate, removing the direct self-contradiction with the amended hard rule 4."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: the second bullet of the '## Talking to the user' section, which reads verbatim across two lines with a 2-space continuation indent: '- **Every question carries a recommendation** with a one-line reason. \"Go with' / '  your recommendations\" must always be a complete, safe reply.'"
      - "Amend that bullet so the promise is scoped rather than deleted. The blanket reply stays a complete, safe reply to the questions in a numbered list; the bullet then names the unsatisfied execute-tasks or commit gate as the one thing it does not answer, and cites rule 4."
      - "Illustrative wording, not literal — re-word to fit the file's voice, but keep the substring 'complete, safe reply' intact and keep the bullet's bold lead-in: '- **Every question carries a recommendation** with a one-line reason. \"Go with your recommendations\" must always be a complete, safe reply to the questions in a numbered list. The one thing it never answers is an unsatisfied execute-tasks or commit gate — that reply is neither direct nor determinate about the stage, so the gate stays open (rule 4).'"
      - "Do NOT delete the existing promise. It is correct for every other question, and modification 3 depends on it staying true — a flagged task is meant to be answerable by a blanket reply."
      - "Leave the other three bullets of '## Talking to the user' — 'No naked references', 'Ask outcomes, not constructs', and 'A few paragraphs, not a wall' — and the section's lead-in sentence verbatim."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, the '## Talking to the user' section (lines 331-347 at base_commit 803e0e1; the target bullet is lines 341-342)."
    imports: "None."
    compatibility: "PLN-1-kqwu53 design D2 and assumption A4, and depends on task 1 so the cited rule already carries the test. PLN-1-kqwu53 rejected deleting the promise outright: scoping it is right, deleting it is not, because task 6's Flagged tasks block relies on ordinary questions still being answerable by a blanket reply. This bullet is the third of the three rules that combine to cause the defect, so leaving it unamended would leave the file directly self-contradictory."
    gotcha: "The literal string 'complete, safe reply' is what task 3's and task 7's verify greps assert on, and it must remain exactly one hit in the file — do not repeat the phrase in the new carve-out sentence. The words 'Go with' and 'your recommendations' currently straddle a line break, so a grep for the whole phrase finds nothing either before or after this edit; do not treat that as a failure. Keep the bullet's 2-space continuation indent. This bullet must not acquire any Flagged-tasks wording — task 6 owns that text, in the Gates section."
    verify:
      - "Run: grep -c \"complete, safe reply\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1."
      - "Run: grep -n \"complete, safe reply\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — confirm the returned line sits inside '## Talking to the user' and that the sentence around it now names the execute-tasks or commit gate exception and cites rule 4."
      - "Run: grep -c \"No naked references\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md; grep -c \"Ask outcomes, not constructs\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md; grep -c \"A few paragraphs, not a wall\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — each must print 1."
      - "Read the whole '## Talking to the user' section and confirm the other three bullets and the lead-in sentence are unchanged. Confirm acceptance criterion 5."
    checklist:
      - "Does the bullet still promise that a blanket reply is a complete, safe answer to the questions in a numbered list? (the promise is scoped, not deleted)"
      - "Does it now name the unsatisfied execute-tasks or commit gate as the one thing that reply does not answer, and point at rule 4? (acceptance criterion 5)"
      - "Is 'complete, safe reply' still exactly one hit in the file?"
      - "Are the other three bullets in the section, and its lead-in sentence, unchanged?"
      - "Does the amended bullet contradict nothing in the hard rule 4 text task 1 landed?"
      - "Is skills/flowcharge/SKILL.md the only file this task changed?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. The bullet now spans lines 348-352 and keeps its bold lead-in and 2-space continuation indent. The promise is scoped, not deleted: the blanket reply stays a complete, safe reply to the questions in a numbered list, and the new sentence names the unsatisfied execute-tasks or commit gate as the one thing it never answers, citing rule 4 in the same terms rule 4 itself uses (neither direct nor determinate about the stage). Verify results: 'complete, safe reply' = 1 hit (line 349, inside '## Talking to the user'); 'No naked references' = 1; 'Ask outcomes, not constructs' = 1; 'A few paragraphs, not a wall' = 1; git status --short and git diff --stat list skills/flowcharge/SKILL.md only. The git diff hunk for this task touches only the second bullet — the lead-in sentence and the other three bullets are context lines. No Flagged-tasks wording was added; task 6 still owns that. The phrase 'complete, safe reply' was not repeated in the carve-out sentence, so the count stays at 1."
    ```

- [x] 4. Stage 4 — "Parsing the request": a gated stage the run skipped is prose, not a numbered item

  ```yaml
  description: "Append PLN-1-kqwu53 design D5's paragraph to the first rule of interpretation, so a gated stage the run stopped short of is mentioned in prose with no recommendation, copying the FlowCharge Core upkeep archiving offer, and a later request for it is judged fresh under rule 4."
  ```

  - [x] 4.1 Extend the "Only what the user asked for" bullet in `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Add the prose-only rule to the bullet that already says the run stops, completing it with how to talk about the stage it stopped short of."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: the first bullet under the 'Rules of interpretation:' line in the '## Parsing the request' section. It reads verbatim across two lines with a 2-space continuation indent: '- Only what the user asked for: \"bug hunt X and file the issues\" ends at' / '  create-issues — do not continue to tasks because the chain usually does.'"
      - "Append to that same bullet, continuing its 2-space indent. Do not create a new bullet, and do not place this text in the '## Gates' section — PLN-1-kqwu53 design D5 rejected that home explicitly, because Gates is about a gate the run reached and this rule is about one it did not."
      - "Append the text from PLN-1-kqwu53 design D5. Wording may be re-wrapped, but every clause below must survive: 'When the stage the run stopped short of is a gated one — execute-tasks or commit — do not put \"shall I proceed to it?\" into the end-of-run numbered list, and attach no recommendation to it. Mention it in prose as an available follow-up, the same way FlowCharge Core upkeep offers to archive a finished workstream, so a blanket reply can never sweep it up. If the user then asks for it, that request is a fresh instruction, judged under rule 4 like any other.'"
      - "The final sentence is required by acceptance criterion 9. Without it the follow-up mention could be read as pre-authorising the stage as soon as the user says anything about it."
      - "Leave the other three rules of interpretation — the 'Vague continuations' bullet, the ambiguous-input bullet, and the 'Every run belongs to a workstream' bullet — and the canonical-chain list above them verbatim."
      - "Do not touch the FlowCharge Core upkeep archiving sentence. It is cited as the pattern, not edited."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, the '## Parsing the request' section (lines 247-274 at base_commit 803e0e1; the target bullet is lines 264-265). PLN-1-kqwu53 cites 263-265; line 263 is blank, so anchor on the quoted text."
    imports: "None."
    compatibility: "PLN-1-kqwu53 design D5. The pattern being copied already exists in the file, in 'FlowCharge Core upkeep → Successful end of run': archiving is available, is mentioned, and is never a numbered recommendation-bearing item. The new text names that pattern so a reader can see the two are deliberately the same shape. PLN-1-kqwu53 also rejected the stronger form — never mentioning the stage at all — because the agreed wording says 'offered only as a follow-up mention in prose'."
    gotcha: "Task 4's verify expects 'available follow-up' to return exactly two lines afterwards: the pre-existing archiving offer in FlowCharge Core upkeep and this new one. If it returns one, the phrase was re-worded; if three, something was duplicated. Keep the 2-space continuation indent — a 4-space indent would render the appended text as a code block inside the list. Line numbers below rule 4 have already shifted by task 1, so locate the bullet by its quoted text."
    verify:
      - "Run: grep -n \"available follow-up\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must return exactly two lines: the existing archiving offer in '## FlowCharge Core upkeep' and the new one in '## Parsing the request'."
      - "Run: grep -c \"attach no recommendation\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1."
      - "Run: grep -c \"fresh instruction, judged under rule 4\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1."
      - "Read the whole '## Parsing the request' section and confirm the canonical-chain list and the other three rules of interpretation are unchanged. Confirm acceptance criteria 7, 8 and 9."
    checklist:
      - "Does the bullet now forbid adding 'shall I proceed to execute-tasks / commit?' to the end-of-run numbered list when the requested pipeline stopped before that gated stage? (acceptance criterion 7)"
      - "Does it require the stage to be mentioned in prose as an available follow-up with no recommendation, citing the FlowCharge Core upkeep archiving offer as the pattern? (acceptance criterion 8)"
      - "Does it state that a later request for that stage is a fresh instruction judged under rule 4? (acceptance criterion 9)"
      - "Is the new text part of the existing bullet rather than a new bullet or a new section?"
      - "Are the canonical-chain list and the other three rules of interpretation unchanged, and is the FlowCharge Core upkeep archiving sentence untouched?"
      - "Is skills/flowcharge/SKILL.md the only file this task changed?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. The appended text now runs from line 272 to line 278, inside the existing 'Only what the user asked for' bullet, at its 2-space continuation indent. No new bullet and no new section were created. All three required clauses survive: the end-of-run numbered list exclusion with no recommendation, the prose follow-up mention citing the FlowCharge Core upkeep archiving offer as the pattern, and the fresh-instruction sentence pointing at rule 4. Verify results: 'available follow-up' = 2 hits (line 275, the new one, and line 432, the pre-existing archiving offer in '## FlowCharge Core upkeep'); 'attach no recommendation' = 1; 'fresh instruction, judged under rule 4' = 1; git status --short and git diff --stat list skills/flowcharge/SKILL.md only. The canonical-chain list at lines 256-267 and the other three rules of interpretation at lines 279-287 were read end to end and are unchanged. The FlowCharge Core upkeep archiving sentence at line 432 was not edited."
    ```

- [x] 5. Stage 5 — "Reporting": echo the exclusion in the end-of-run list

  ```yaml
  description: "Add one clause to the end-of-run Reporting bullet stating that a gated stage the run was not asked to reach is never an item in its numbered list, pointing at 'Parsing the request', while leaving the existing '1 yes, 2 no' wording intact."
  ```

  - [x] 5.1 Extend the end-of-run bullet in `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Add the exclusion echo to the '## Reporting' end-of-run bullet, immediately after the sentence that invites '1 yes, 2 no' or a blanket reply, and leave the second numbered list added by PLN-20-cjvukq unchanged."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: the third bullet of the '## Reporting' section, which begins '- At the end: a consolidated summary — every artefact created (paths and IDs),' and whose first sentence ends 'user can answer \"1 yes, 2 no\" or just \"go with your recommendations\".' The bullet uses a 2-space continuation indent."
      - "Insert one short sentence immediately after that '1 yes, 2 no' sentence and before the sentence beginning 'Anything settled under `open_questions: auto` or `yolo` (rule 10)'."
      - "Illustrative wording, not literal: 'A gated stage this run was not asked to reach is never an item in this list — mention it in prose only, per \"Parsing the request\".' The substring 'never an item in this list' must survive verbatim; it is what task 5's and task 7's verify greps assert on."
      - "Leave the existing sentence's '1 yes, 2 no' and 'go with your recommendations' wording intact. After task 4 it is true again, because the list can no longer contain a gate."
      - "Leave the rest of the bullet unchanged, including the whole second-numbered-list passage for questions settled under `open_questions: auto` or `yolo`, and its risky-item marking sentence. Leave the section's other two bullets — the one-line-before-the-run bullet and the after-each-stage bullet — verbatim."
      - "Do not add a Flagged-tasks reference here. Modification 3 lives in the '## Gates' section only, and the per-stage Reporting bullet is not the gate report."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, the '## Reporting' section (lines 447-464 at base_commit 803e0e1; the end-of-run bullet starts at line 453, not 455 as PLN-1-kqwu53 Stage 5 states). Anchor on the quoted text."
    imports: "None."
    compatibility: "PLN-1-kqwu53 Stage 5 and design D5, and depends on task 4 so this echo points at a rule that already exists. This is the 'canonical rule plus authoring-point echo' pattern PLN-19-nnd694 named and PLN-20-cjvukq used: the rule lives in 'Parsing the request', and this is the one short echo at the site where the rule is actually applied. Do not restate the whole rule here."
    gotcha: "The end-of-run bullet carries two distinct numbered lists — the decisions-needed list and PLN-20-cjvukq's decisions-already-taken list. The new clause belongs to the first one only; attaching it to the second would say the wrong thing. Line numbers in this section have shifted by tasks 1 to 4, so anchor on the quoted sentence. Keep the 2-space continuation indent."
    verify:
      - "Run: grep -c \"never an item in this list\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1."
      - "Run: grep -n \"never an item in this list\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — confirm the returned line sits inside '## Reporting', in the end-of-run bullet, and after the '1 yes, 2 no' sentence."
      - "Run: grep -c \"second numbered list\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1, confirming PLN-20-cjvukq's decisions-already-taken list is intact."
      - "Run: grep -c \"1 yes, 2 no\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must still print 1."
      - "Read the whole '## Reporting' section and confirm the other two bullets and the second-numbered-list passage are unchanged. Confirm acceptance criterion 10."
    checklist:
      - "Does the end-of-run bullet now state that a gated stage the run was not asked to reach is never an item in its numbered list? (acceptance criterion 10)"
      - "Does it point the reader at 'Parsing the request' rather than restating the whole rule?"
      - "Are the existing '1 yes, 2 no' and 'go with your recommendations' wording both intact?"
      - "Is the second numbered list added by PLN-20-cjvukq, for questions settled under open_questions, unchanged?"
      - "Are the section's other two bullets unchanged, and was no Flagged-tasks text added here?"
      - "Is skills/flowcharge/SKILL.md the only file this task changed?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. The new sentence sits at lines 479-481 of skills/flowcharge/SKILL.md, inside the '## Reporting' end-of-run bullet, immediately after the '1 yes, 2 no' sentence and immediately before 'Anything settled under `open_questions: auto`'. It keeps the bullet's 2-space continuation indent. The substring 'never an item in this list' survives verbatim, and the sentence points at 'Parsing the request' instead of restating the rule. Verify results: 'never an item in this list' = 1 hit (line 480); 'second numbered list' = 1; '1 yes, 2 no' = 1; git status --short and git diff --stat list skills/flowcharge/SKILL.md only. The git diff hunk for this task rewrites one existing line only to append 'A' at its end, then adds two lines; the second-numbered-list passage and the section's other two bullets are context lines, unchanged. No Flagged-tasks text was added — grep for 'Flagged' returns nothing in the file, so task 6 still owns it."
    ```

- [x] 6. Stage 6 — "Gates": the Flagged tasks block

  ```yaml
  description: "Insert PLN-1-kqwu53 design D8's Flagged tasks bullet between the 'Before execute-tasks' and 'Before commit' bullets, giving a per-task risk flag a structurally separate home so approving the gate never approves a flagged task."
  ```

  - [x] 6.1 Insert the Flagged tasks bullet into `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Add a third, separately labelled bullet to the Gates section's report list, scoped to the execute-tasks gate and present only when there is something to flag, defining its risk test by reference to hard rule 10, its two sources, its per-entry content, its question type and its ordering rule."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Anchor: the two report bullets in the '## Gates' section. The first reads verbatim across three lines: '- **Before execute-tasks**: the task list path and ID, its parent-task count and' / '  one-line scope, the dependency check's result (rule 5), anything the authoring' / '  stage skipped or left open, and the resolved agent type.' The second reads verbatim across two lines: '- **Before commit**: `git status --short` of what would be committed, and the' / '  branch.'"
      - "Insert one new bullet BETWEEN them, at the same list level, with the same 2-space continuation indent. Do not alter either neighbouring bullet — the 'Before execute-tasks' bullet must not gain a sixth item, and the 'Before commit' bullet must stay byte-identical to its pre-change text."
      - "Insert the text from PLN-1-kqwu53 design D8. Wording may be adjusted to fit the file's voice, but acceptance criteria 11 to 17 must all hold afterwards, and every clause below must survive: '- **Flagged tasks (execute-tasks gate only, and only when there is something to flag)**: a separately labelled block, after the gate's own content. One numbered entry per task whose change is risky by rule 10's test — possibly catastrophic, an unavoidable effect no later caller can opt out of, or something significant forced elsewhere. A flag reaches you either in the authoring stage's return or from your own pre-gate read of the task list. Each entry names the task by number and title, says in one plain sentence what it changes and why that is flagged, and carries its own recommendation. These are ordinary questions: a blanket reply answers them. The gate's own \"proceed?\" is neither one of these entries nor numbered among them, and no reply to them satisfies it (rule 4). Do not begin execution until every flag raised for this task list has an answer — approving the gate approves running the list, never a flagged task.'"
      - "Cite rule 10's three-part risk test; do NOT write a second, competing definition of 'risky' here. Hard rule 10 already carries the test the user approved in WS-27-9kwnun, and two definitions in one file would drift."
      - "Do not amend hard rule 10 itself, and do not add anything about the `open_questions` preference. PLN-1-kqwu53 open question 1 recommends leaving rule 10 alone, and the plan takes that reading."
      - "Do not add a Flagged tasks block to the commit gate. PLN-1-kqwu53 open question 2 scopes it to the execute-tasks gate only (acceptance criterion 17)."
      - "Do not add a `risk:` key or any other field to the task-list schema, and do not touch any file under skills/flowcharge/prompts/. Both sources of a flag already exist: the tasking templates' Return section already asks for 'any item left for you to decide', and the Operations note on execute-tasks already requires reading the task list before the loop."
      - "Do not create a new top-level SKILL.md section for this. PLN-1-kqwu53 design D6 rejected option (c) because a reader of 'Gates' would not find it."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md, the '## Gates' section report list (lines 355-359 at base_commit 803e0e1). Anchor on the quoted bullets; tasks 1 to 5 have already shifted these line numbers."
    imports: "None."
    compatibility: "PLN-1-kqwu53 designs D6, D7 and D8, and depends on tasks 1 and 3. The block's separation argument rests on hard rule 4 rejecting a blanket reply for the gate and on 'Talking to the user' still accepting one for ordinary questions — three properties together deliver 'approving the gate never approves a flagged task': different question types, different places in the report, and the ordering rule. PLN-1-kqwu53 rejected the cheaper option (a), a sixth item in the existing 'Before execute-tasks' sentence, because it reproduces exactly the blending that caused the observed failure."
    gotcha: "This is the largest text block in the change and acceptance criteria 11 to 17 all land here. The ordering rule ('do not begin execution until every flag has an answer') is a derivation, not an optional extra — PLN-1-kqwu53 design D7 rejected the alternative of starting execution and holding only the flagged task, because hard rule 6 makes execution strictly serial in file order. The 'Before commit' bullet is the one thing task 6's verify reads byte-for-byte; touching its wrapping would fail acceptance criterion 17. The literal strings 'Flagged tasks', \"rule 10's test\" and 'Do not begin execution until every flag' are what the verify greps assert on and must each appear exactly once."
    verify:
      - "Run: grep -n \"Flagged tasks\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must return exactly one line, inside '## Gates', positioned between the '**Before execute-tasks**' and '**Before commit**' bullets."
      - "Run: grep -c \"rule 10's test\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1, confirming the risk definition is cited rather than restated."
      - "Run: grep -c \"Do not begin execution until every flag\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1."
      - "Run: git diff skills/flowcharge/SKILL.md — read the hunk covering the Gates report list and confirm the '**Before commit**' bullet and the '**Before execute-tasks**' bullet appear as context lines only, with no added or removed line inside either."
      - "Read the new bullet end to end and confirm acceptance criteria 11 to 17."
    checklist:
      - "Is the Flagged tasks block a structurally separate bullet adjacent to 'Before execute-tasks', present only when there is something to flag? (acceptance criteria 11 and 17)"
      - "Does it define flag-worthiness by reference to hard rule 10's three-part risk test, adding no second definition? (acceptance criterion 12)"
      - "Does it name both sources of a flag — the authoring stage's return and the orchestrator's own pre-gate read of the task list? (acceptance criterion 13)"
      - "Does each entry's stated content cover the task's number and title, one plain sentence of what it changes and why it is flagged, and its own recommendation? (acceptance criterion 14)"
      - "Does it state that flags are ordinary questions a blanket reply answers, and that the gate's own 'proceed?' is neither one of these entries nor numbered among them? (acceptance criterion 15)"
      - "Does it state that execution does not begin until every flag raised for this task list has an answer, and are the 'Before execute-tasks' and 'Before commit' bullets both unchanged? (acceptance criteria 16 and 17)"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. The new bullet sits at lines 374-386 of skills/flowcharge/SKILL.md, between the '**Before execute-tasks**' bullet (371-373) and the '**Before commit**' bullet (387-388), at the same list level with the same 2-space continuation indent. Every required clause survives: the execute-tasks-only and only-when-something-to-flag scope, the separately labelled block placed after the gate's own content, one numbered entry per task risky by rule 10's test with the three-part test cited rather than redefined, both flag sources (the authoring stage's return and the orchestrator's own pre-gate read), the per-entry content (number and title, one plain sentence of what changes and why it is flagged, its own recommendation), the ordinary-question status with the gate's 'proceed?' excluded from the entries and their numbering, and the ordering rule. Verify results: 'Flagged tasks' = 1 hit (line 374, inside '## Gates', between the two bullets); \"rule 10's test\" = 1; 'Do not begin execution until every flag' = 1; git status --short and git diff --stat list skills/flowcharge/SKILL.md only. The git diff hunk for this task is pure addition — both neighbouring bullets appear as context lines with no added or removed line inside either, so the 'Before commit' bullet is byte-identical. No new top-level section was created, hard rule 10 was not amended, no Flagged tasks block was added to the commit gate, and no schema key or prompts file was touched."
    ```

- [x] 7. Stage 7 — Repeat sweep and scope check

  ```yaml
  description: "Read-only proof that the six edits are complete, that no surviving text contradicts them, that the hard-rule count is unchanged, that nothing outside skills/flowcharge/SKILL.md changed, and that the index generator still reports what it reported before."
  ```

  - [x] 7.1 Sweep the repository and confirm the scope limit held
    ```yaml
    description: "Run PLN-1-kqwu53 Stage 7's seven checks: the blanket-reply sweep, the explicit-yes sweep, the hard-rule count, the numbered-question sweep, git diff --stat, git status --short, and the generator's --check run. This task modifies no file."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Modify nothing. This stage is verification only. If a check fails, report it and stop; do not repair another file to make a check pass, and do not edit README.md."
      - "Run every command from the repository root, /Users/akoukoullis/Work/AK/FlowCharge Core."
      - "Check 1 — blanket-reply sweep. Run: grep -rn \"go with your recommendations\" skills/ README.md. Confirm every hit either carries the new gate carve-out or sits in a context where no gate can appear. The pre-existing hit in the '## Reporting' end-of-run bullet is now carved out by task 5. The '## Talking to the user' bullet splits 'Go with' and 'your recommendations' across a line break and may therefore not appear in this grep at all; read that bullet directly instead of relying on the grep."
      - "Check 2 — explicit-yes sweep. Run: grep -rn \"explicit yes\" skills/ README.md. Read the README.md hit (line 129 at base_commit 803e0e1) and confirm it is still true after all three modifications, per PLN-1-kqwu53 design D11. Note that this README sentence carries one clause beyond PLN-1-kqwu53's quote of it — 'Mentioning a stage in your original request does not bypass its gate.' — which strengthens rather than contradicts the new rule. Record it; do not edit README.md. PLN-1-kqwu53 open question 3 recommends leaving it, and the plan takes that reading."
      - "Check 3 — hard-rule count. Run: grep -c \"^[0-9]\\{1,2\\}\\. \\*\\*\" skills/flowcharge/SKILL.md. It must print 11, confirming acceptance criterion 20."
      - "Check 4 — numbered-question sweep. Run: grep -rn \"numbered question with a recommendation\" skills/. The '## Gates' opening paragraph must be the only hit, and it must no longer contradict hard rule 4, because rule 4 now judges the reply and the Gates section now says what to do with an insufficient one."
      - "Check 5 — diff scope. Run: git diff --stat. Exactly one file must be listed: skills/flowcharge/SKILL.md."
      - "Check 6 — working-tree scope. Run: git status --short. skills/flowcharge/SKILL.md must be the only entry. No file under skills/flowcharge/prompts/, no CONVENTIONS.md, no fc-index.mjs, no README.md. WS-1-qrec54's own workstream folder will NOT appear, because flowcharge/ is excluded by the user's global gitignore — that absence is expected per PLN-1-kqwu53 assumption A8, not a defect."
      - "Check 7 — generator. Run: node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/FlowCharge Core --check. Confirm it prints no new warning against the baseline and exits 0, confirming acceptance criterion 19."
      - "Also confirm the three verbatim-survival greps from task 1 still hold after tasks 2 to 6: \"don't ask / no gates / run straight through\" prints 1, and \"gates: skip\" prints 1."
    pattern: "Read-only across the repository root /Users/akoukoullis/Work/AK/FlowCharge Core: skills/, README.md, flowcharge/, and git metadata. No file is modified."
    imports: "Node.js, to run skills/flowcharge/scripts/fc-index.mjs. No package install — the project has no package.json, no linter and no type-checker, so these greps, file reads and the generator's --check mode are the only checks available."
    compatibility: "PLN-1-kqwu53 acceptance criteria 18, 19 and 20, and regression risks 1 and 4 in its Testing strategy. Check 1 guards risk 1, a surviving contradiction between hard rule 4 and 'Talking to the user'. The verbatim-survival greps guard risk 4, the two waivers. Design D10 keeps fc-index.mjs unchanged, so its --check output must match the baseline: the generator never reads SKILL.md."
    gotcha: "The --check flag writes nothing, so the run is safe on a dirty tree; a plain run without --check rewrites index.md and kanban.md and would break Check 6. The generator exits non-zero when any warning stands, so treat a non-zero exit as a finding, not as a broken command. TL-23-i8p17c's own sweep recorded the same global-gitignore behaviour for WS-27-9kwnun, so a one-path git status is the expected result here too. Check 1 is a judgement check, not a count assertion — do not fail it merely because the hit count changed."
    verify:
      - "Run: grep -rn \"go with your recommendations\" skills/ README.md — confirm every hit is carved out or gate-free, and read the '## Talking to the user' bullet directly to confirm its carve-out."
      - "Run: grep -rn \"explicit yes\" skills/ README.md — confirm the README hit is still true and that no other file states a rule conflicting with hard rule 4."
      - "Run: grep -c \"^[0-9]\\{1,2\\}\\. \\*\\*\" skills/flowcharge/SKILL.md — it must print 11."
      - "Run: grep -rn \"numbered question with a recommendation\" skills/ — the Gates opening paragraph must be the only hit."
      - "Run: git diff --stat; git status --short — each must name skills/flowcharge/SKILL.md and nothing else."
      - "Run: node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/FlowCharge Core --check; echo \"EXIT=$?\" — expect no new warning and EXIT=0."
    checklist:
      - "Does git status --short list skills/flowcharge/SKILL.md and nothing else, with no prompts file, no CONVENTIONS.md, no fc-index.mjs and no README.md? (acceptance criterion 18)"
      - "Does the generator's --check run print no new warning and exit 0? (acceptance criterion 19)"
      - "Is the hard-rule count still eleven, with no rule renumbered, moved or deleted? (acceptance criterion 20)"
      - "Does every surviving 'go with your recommendations' and 'explicit yes' hit read consistently with the amended hard rule 4?"
      - "Do both waivers survive verbatim — the 'don't ask / no gates / run straight through' sentence and the gates: skip line?"
      - "Did this task modify zero files?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. This task modified no repository file; the only write was this task list's own checkbox and self_eval bookkeeping, which git ignores. Check 1, blanket-reply sweep: 'go with your recommendations' returns two hits, SKILL.md line 56 inside hard rule 4, which names it as a blanket endorsement that never satisfies a gate, and SKILL.md line 492 in the end-of-run Reporting bullet, which task 5 carved out at lines 493-494. The '## Talking to the user' bullet was read directly at lines 354-358; it splits 'Go with' and 'your recommendations' across a line break, so it does not appear in the grep, and it carries the gate carve-out citing rule 4. Check 2, explicit-yes sweep: two hits, SKILL.md line 51 inside rule 4 itself and README.md line 129. The README sentence reads 'The orchestrator stops, shows you numbered specifics, and waits for an explicit yes. Mentioning a stage in your original request does not bypass its gate.' It stays true after all three modifications and its second sentence strengthens the new rule, per PLN-1-kqwu53 design D11 and open question 3. README.md was not edited. Check 3, hard-rule count: 11. Check 4, numbered-question sweep: one hit, SKILL.md line 369, the Gates opening paragraph. It no longer contradicts rule 4, because rule 4 now judges the reply at lines 51-58 and the new Gates closing paragraph at lines 393-396 says what to do with an insufficient one. Check 5, git diff --stat: one file, skills/flowcharge/SKILL.md, 45 insertions and 9 deletions. Check 6, git status --short: one entry, ' M skills/flowcharge/SKILL.md', on branch feature/execute-gate-approval-ambiguity. No prompts file, no CONVENTIONS.md, no fc-index.mjs and no README.md appear. The WS-1-qrec54 workstream folder is absent because a user-level global gitignore excludes flowcharge/, which is expected per PLN-1-kqwu53 assumption A8 and matches TL-23-i8p17c's result for WS-27-9kwnun. Check 7, generator: node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/FlowCharge Core --check printed no output and exited 0, so no warning stands and acceptance criterion 19 holds. Both waivers survive: \"don't ask / no gates / run straight through\" = 1 and 'gates: skip' = 1, and rule 4 lines 58-63 were read to confirm the wording and order. The other task greps were re-run after all six edits and still hold: 'complete, safe reply' = 1, 'never an item in this list' = 1, 'Flagged tasks' = 1, \"rule 10's test\" = 1, 'ask it again on its own' = 1, 'available follow-up' = 2. Acceptance criteria 18, 19 and 20 all confirmed."
    ```

- [x] 8. Stage 8 — Behaviour walkthrough

  ```yaml
  description: "Read the finished SKILL.md and check the behaviour it now describes against the seven cases PLN-1-kqwu53 Stage 8 names. This is a review of the rules as written, not a live pipeline run."
  ```

  - [x] 8.1 Walk the seven cases against the finished `skills/flowcharge/SKILL.md`
    ```yaml
    description: "Read the six edited sites end to end and confirm the text yields the correct behaviour for seven inputs, covering the replayed observed failure, a later fresh request, an unsatisfied gate amid other questions, the re-ask, a satisfied gate with an unanswered flag, a run with no flags, and a project on gates: skip."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Modify nothing. If a case does not come out as stated below, report the wording gap and stop; do not rewrite the text to fit."
      - "Read, in the finished file: hard rule 4, the '## Parsing the request' first rule of interpretation, the '## Talking to the user' recommendation bullet, the whole '## Gates' section including the new Flagged tasks bullet and the new closing paragraph, and the end-of-run bullet in '## Reporting'."
      - "Case 1 — the observed failure, replayed. Requested pipeline is investigate then issues then spec tasks, and two tasks are flagged. The text must give four things: the execute-tasks gate is not offered as a numbered item at all; execution is mentioned in prose as an available follow-up with no recommendation; the two flags are numbered under Flagged tasks; and 'go with your recommendations' answers both flags and starts nothing."
      - "Case 2 — the same run, then the user says 'yes, execute it'. The text must give: this is a fresh instruction judged under hard rule 4, it is direct and determinate, and the run proceeds."
      - "Case 3 — a run that did ask for execution, the gate is unsatisfied, and other questions are outstanding. The user replies 'go with your recommendations'. The text must give three things: the other questions are settled, the gate is stated plainly as still open, and it is asked again on its own."
      - "Case 4 — the same run, after the re-ask, the user replies 'yes'. The gate is now the only question outstanding. The text must give: satisfied, per PLN-1-kqwu53 design decision D4."
      - "Case 5 — a gate satisfied while a flag is still unanswered. The text must give: execution does not begin, and the flag is asked and answered first."
      - "Case 6 — a run with no flagged tasks. The text must give: no Flagged tasks block appears at all, and the gate report is exactly what it is today."
      - "Case 7 — a project with `gates: skip` in flowcharge/agents.md. The text must give: both gates stay waived, unchanged by this work, and the Flagged tasks block still appears when there is something to flag, because a waived gate is not a waived flag."
      - "Record the outcome for each case in this task's self_eval, naming the sentence in the file that produces it."
      - "Do not create flowcharge/agents.md to test Case 7. PLN-1-kqwu53 puts writing that file out of scope."
    pattern: "Read-only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md. No file is modified."
    imports: "None. This is a document review."
    compatibility: "PLN-1-kqwu53 Testing strategy: no live pipeline run is planned, because all three modifications are text in existing mechanisms, so the document review is proportionate. Case 4 guards regression risk 2, the new rule being over-read so a plain 'yes' answering a gate asked alone is refused. Case 7 guards regression risk 4, the two waivers. Case 6 guards the data-and-compatibility claim that a run with no flagged tasks produces a report identical to today's."
    gotcha: "This is a check of what the text says, not of what the reader hopes it means. Read only the words on the page and do not supply intent from PLN-1-kqwu53. Case 4 must come out satisfied — a reading that refuses a bare 'yes' to a gate question asked alone is a finding, not a success. Case 7 must show the Flagged tasks block surviving a waived gate; if the new bullet reads as conditional on the gate being asked, that is a finding. Cases 1 and 3 are deliberately different: Case 1 is a run that stopped short of a gated stage, Case 3 is a run that reached one."
    verify:
      - "Read hard rule 4, the 'Only what the user asked for' bullet, the 'Talking to the user' recommendation bullet, the whole Gates section, and the Reporting end-of-run bullet, in that order."
      - "Record the outcome for each of the seven cases in this task's self_eval, naming the sentence in the file that produces it."
      - "Run: git status --short — confirm this task changed nothing, so the only path listed is the one task 7 already accounted for."
    checklist:
      - "Case 1: does the text keep the unasked-for gate out of the numbered list, offer it in prose with no recommendation, number both flags under Flagged tasks, and let a blanket reply answer the flags while starting nothing?"
      - "Case 2: does a later 'yes, execute it' read as a fresh instruction that is direct and determinate under hard rule 4?"
      - "Case 3: with other questions outstanding, does the text settle them, state the gate as still open, and require the gate to be re-asked on its own?"
      - "Case 4: after the re-ask, does a bare 'yes' satisfy the gate, per design decision D4?"
      - "Cases 5 and 6: does a satisfied gate with an unanswered flag hold execution, and does a run with no flags produce today's gate report with no Flagged tasks block?"
      - "Case 7: do both waivers survive under gates: skip while the Flagged tasks block still appears, and did this task modify zero files?"
    self_eval:
      passed: true
      failures: []
      notes: "Re-run of the seven-case walkthrough against the live skills/flowcharge/SKILL.md on branch feature/execute-gate-approval-ambiguity, after task 9 landed. This task modified no repository file; the only write was this task list's own checkbox and self_eval, which git ignores. git status --short lists ' M skills/flowcharge/SKILL.md' and nothing else, and git diff --stat names the same single file, 54 insertions and 9 deletions. The six edited sites were read end to end in the order the verify step names: hard rule 4 at lines 46-63, the 'Only what the user asked for' bullet at lines 271-278, the 'Every question carries a recommendation' bullet at lines 354-358, the whole '## Gates' section at lines 365-401 including the widened Flagged tasks bullet at 374-391 and the closing paragraph at 398-401, and the '## Reporting' end-of-run bullet at lines 492-509. Case 1, PASS, previously PARTIAL. All four parts now hold. The gate stays out of the numbered list: lines 273-275 say 'do not put \"shall I proceed to it?\" into the end-of-run numbered list, and attach no recommendation to it', and lines 498-499 repeat 'A gated stage this run was not asked to reach is never an item in this list'. The prose offer comes from lines 275-277, 'Mention it in prose as an available follow-up, the same way FlowCharge Core upkeep offers to archive a finished workstream', matching the archiving sentence at line 450. The two flags are now numbered under the Flagged tasks label, which was the part that failed on the first run: line 374 opens '**Flagged tasks (only when there is something to flag)**: a separately labelled block that belongs to the task list, not to the gate', and lines 376-379 give the second placement, 'When the run authored a task list it was not asked to execute, post the same block, under the same label, in the end-of-run summary instead — exactly as it would have read at the gate.' Lines 500-503 of '## Reporting' echo it: 'A flagged task is not the gate. When this run authored a task list that carries a flag but was not asked to execute it, that flag is still listed here, under the same **Flagged tasks** label the gate report would have used, per \"Gates\".' Case 1's run is investigate then issues then spec tasks, so it takes that second placement and the block has a host. Lines 379-380 make each flag a numbered entry, and lines 385-386 read 'These are ordinary questions: a blanket reply answers them', so 'go with your recommendations' answers both flags. It starts nothing, because rule 4 lines 55-58 say such an endorsement 'never satisfies a gate on its own, however many numbered items it resolves', and lines 388-389 add 'In a run that never reaches the gate there is no \"proceed?\" to offer at all: the flags are listed, the gate is not (see \"Parsing the request\").' Case 2, PASS. Lines 277-278 say 'If the user then asks for it, that request is a fresh instruction, judged under rule 4 like any other.' Rule 4 lines 46-50 make 'yes, execute it' direct, because that stage is the point of the message, and determinate, because the task list already existed and was identifiable. Lines 53-54 also make the reply determinate, because it 'names execution or commit'. The run proceeds. Case 3, PASS. Rule 4 lines 55-58 refuse the blanket reply for the gate. The Gates closing paragraph at lines 398-401 supplies all three moves: 'Apply whatever else the reply settled, say plainly that the gate is still open, then ask it again on its own — the gate question and nothing else — and wait.' Case 4, PASS. Rule 4 lines 53-55 read 'Determinate: the reply names execution or commit, or is the unmistakable answer to a gate question that was the only thing outstanding.' After a re-ask made on its own, a bare 'yes' is that unmistakable answer, and it is direct because the gate is what the reply is about. The gate is satisfied, per PLN-1-kqwu53 design decision D4, so regression risk 2 does not stand. Case 5, PASS. Lines 390-391 read 'Do not begin execution until every flag raised for this task list has an answer — approving the gate approves running the list, never a flagged task.' Lines 383-386 make each flag a numbered entry with its own recommendation and an ordinary question, so it is asked and answered first. Case 6, PASS. Line 374 scopes the block with 'only when there is something to flag', and the Reporting echo at lines 500-501 is conditional in the same way, on a task list 'that carries a flag'. A run with no flags therefore shows no block at either site, and the gate report is the 'Before execute-tasks' bullet at lines 371-373 exactly as today. Case 7, PASS. Rule 4 lines 58-63 keep the 'gates: skip' waiver intact, counting as the same explicit 'run straight through' waiver for both gates, standing until changed, and lines 58-60 keep the spoken waiver. Neither sentence was touched by task 9. The Flagged tasks block still appears, and task 9 strengthened this: line 375 now states the block 'belongs to the task list, not to the gate', so it is not conditional on the gate being asked. The Gates opening at lines 367-369 gives only two branches, and a waived gate falls in the first, 'Gate satisfied (rule 4): post it as a statement and continue', so the report is posted and carries the block. The ordering rule at lines 390-391 is likewise unconditional. A waived gate is not a waived flag. No file was created for this case; flowcharge/agents.md was not written. Regression check on the tasks 4 and 5 exclusion, which this re-run was asked to guard: task 5's sentence at lines 498-499 is present exactly once and unchanged, 'never an item in this list' = 1, and task 4's text is untouched, 'attach no recommendation' = 1 and 'fresh instruction, judged under rule 4' = 1. The new Reporting sentence names only 'a flagged task' and opens 'A flagged task is not the gate', so it admits no gate, no 'proceed?' question and no unasked-for stage to that list. The Gates side says the same at lines 388-389. The execute-tasks gate therefore still never appears as an item in the end-of-run list; only a flagged task may. Supporting greps, all against skills/flowcharge/SKILL.md: 'execute-tasks gate only' = 0; 'belongs to the task list, not to the gate' = 1; 'the flags are listed, the gate is not' = 1; 'A flagged task is not the gate' = 1; 'Flagged tasks' = 2, at line 374 in '## Gates' between the two gate bullets and at line 502 in '## Reporting'; \"rule 10's test\" = 1; 'Do not begin execution until every flag' = 1; 'never an item in this list' = 1; 'complete, safe reply' = 1; '1 yes, 2 no' = 1; 'second numbered list' = 1; \"don't ask / no gates / run straight through\" = 1; 'gates: skip' = 1; hard-rule count = 11. Summary: all seven cases pass as stated, the Case 1 gap recorded on the first run is closed, and task 9 disturbed nothing the first run found passing."
    ```

- [x] 9. Follow-up — widen the Flagged tasks scope to a run that never reaches the execute-tasks gate

  ```yaml
  description: "Close the gap task 8's Case 1 walkthrough found: the Flagged tasks block is scoped in its own opening clause to the execute-tasks gate report, so a run that authors a task list without being asked to execute it has no host for the block. Widen the scope so the same block, under the same label, appears in the end-of-run summary of such a run, without letting the gate itself back into that summary's numbered list."
  ```

  - [x] 9.1 Widen the Flagged tasks scope in `skills/flowcharge/SKILL.md` and echo it in "Reporting"
    ```yaml
    description: "Two edits in one file: rewrite the Flagged tasks bullet's scope clause and placement sentence in '## Gates' so the block follows the task list rather than the gate, and add one short echo sentence to the '## Reporting' end-of-run bullet that names a flag as an ordinary listed item and the gate as still excluded."
    author: Anthony Koukoullis
    issues: []
    implement:
      - "Edit 1 of 2 — anchor: the Flagged tasks bullet in the '## Gates' section. Its first two lines read verbatim, with a 2-space continuation indent: '- **Flagged tasks (execute-tasks gate only, and only when there is something to' / '  flag)**: a separately labelled block, after the gate's own content. One'. Rewrite the scope clause and the placement sentence only; the sentence starting 'One numbered entry per task whose change is risky by rule 10's test' must survive from the words 'One numbered entry' onward, unchanged."
      - "Illustrative wording for edit 1, not literal — re-wrap to the file's line width and its 2-space continuation indent, but every clause below must survive: '- **Flagged tasks (only when there is something to flag)**: a separately labelled block that belongs to the task list, not to the gate. When the run reaches the execute-tasks gate, post it after that gate's own content. When the run authored a task list it was not asked to execute, post the same block, under the same label, in the end-of-run summary instead — exactly as it would have read at the gate.'"
      - "The substring 'belongs to the task list, not to the gate' is load-bearing and must survive verbatim: it is the sentence that makes the block follow the artefact rather than the gate, and it is what task 9's verify greps assert on. The parenthesis must no longer contain the words 'execute-tasks gate only'."
      - "Edit 1, second part — anchor: the sentence later in the same bullet reading 'The gate's own \"proceed?\" is neither one of these entries nor numbered among them, and no reply to them satisfies it (rule 4).' Leave that sentence verbatim and append one new sentence immediately after it, inside the same bullet. Illustrative wording: 'In a run that never reaches the gate there is no \"proceed?\" to offer at all: the flags are listed, the gate is not (see \"Parsing the request\").' The substring 'the flags are listed, the gate is not' must survive verbatim. This sentence is what stops the widened block from readmitting the gate, so do not drop it and do not merge it into the preceding sentence."
      - "Leave the rest of the Flagged tasks bullet verbatim: the rule 10 risk test and its three parts, the two flag sources, the per-entry content, the 'These are ordinary questions: a blanket reply answers them' sentence, and the closing 'Do not begin execution until every flag raised for this task list has an answer — approving the gate approves running the list, never a flagged task.' That closing sentence is already scoped to the task list rather than to this run, so it already covers a later execution request. Do not add a second carry-over sentence about a flag surviving into a later run."
      - "Edit 2 of 2 — anchor: the end-of-run bullet of the '## Reporting' section. Task 5's sentence ends '... mention it in prose only, per \"Parsing the request\".' and the next sentence begins 'Anything settled under `open_questions: auto` or `yolo` (rule 10)'. Insert the new text between them, keeping the bullet's 2-space continuation indent."
      - "Illustrative wording for edit 2, not literal: 'A flagged task is not the gate. When this run authored a task list that carries a flag but was not asked to execute it, that flag is still listed here, under the same **Flagged tasks** label the gate report would have used, per \"Gates\".' The substrings 'A flagged task is not the gate' and 'Flagged tasks' must both survive verbatim, and the literal words 'Flagged tasks' must sit on one physical line so the verify grep finds them."
      - "Do NOT amend, weaken, duplicate or re-word task 5's sentence 'A gated stage this run was not asked to reach is never an item in this list — mention it in prose only, per \"Parsing the request\".' It stays exactly as it is, and the new sentence sits beside it as a separate statement about a different subject. The gate is still excluded from the numbered list; only the flag is included."
      - "Do NOT amend the '## Parsing the request' text task 4 landed, do not amend hard rule 4 or hard rule 10, do not add a Flagged tasks block to the commit gate, do not add a `risk:` key or any other task-list schema key, do not create a new top-level SKILL.md section, and do not touch any file under skills/flowcharge/prompts/, CONVENTIONS.md, fc-index.mjs or README.md."
      - "Do not edit tasks 1 to 8 of this task list. They are historical record, including task 8's self_eval, which stays exactly as task 8 wrote it."
    pattern: "One file only: /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md. Two sites: the Flagged tasks bullet in the '## Gates' section (lines 374-386 in the current working tree) and the end-of-run bullet in the '## Reporting' section (lines 487-500 in the current working tree). Line numbers have shifted repeatedly across tasks 1 to 6, so anchor on the quoted text, never on a line number."
    imports: "None. This is prose in a Markdown skill file. No code, no dependency, no build step. Node.js is needed only to run the index generator in the last verify step."
    compatibility: "This task implements the fix for the single Case 1 failure recorded in task 8's self_eval. It is deliberately compatible with tasks 4, 5 and 6 rather than a revision of them. Task 6's design stands: a flag is an ordinary, numbered, recommendation-bearing question that a blanket reply answers, and the gate's 'proceed?' is not. Tasks 4 and 5 stand: the execute-tasks or commit gate the run was not asked to reach is never an item in the end-of-run numbered list. A flag and a gate are two different things, and the amended text must keep them visibly different, exactly as task 6 already did. The Reporting sentence is only the short echo at the site where the rule is applied, per the 'canonical rule plus authoring-point echo' pattern PLN-19-nnd694 named and PLN-20-cjvukq and task 5 used — the canonical rule stays in '## Gates'. Rejected alternative, recorded in task 8's own fix field: leaving the Gates scope narrow and instead directing flags into a labelled sub-block from the Reporting bullet alone. That was not chosen, because it would leave the Gates bullet stating a scope its own file contradicts."
    gotcha: "Task 6's verify asserted that 'Flagged tasks' returns exactly one hit. After this task the correct count is two — one in '## Gates' and one in '## Reporting'. That change is intended, not a regression; do not remove the label from the Reporting sentence to restore a count of one, and do not edit task 6 to match. The words 'Flagged tasks' must not straddle a line break at either site, or the grep silently reads one hit instead of two. Both sites use a 2-space continuation indent; a 4-space indent renders the text as a code block. Keep straight ASCII quotes, matching the surrounding text. The Reporting insertion sits between two existing sentences, not at the end of the bullet, so appending would place it after the `open_questions` passage and attach it to the wrong numbered list. The Gates parenthesis loses the words 'execute-tasks gate only' but the bullet still names the execute-tasks gate in its next sentence, so a grep for 'execute-tasks' alone proves nothing — grep for the exact old phrase instead."
    verify:
      - "(a) New wording present, Gates site. Run: grep -c \"belongs to the task list, not to the gate\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1. Run: grep -c \"the flags are listed, the gate is not\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1. Run: grep -c \"execute-tasks gate only\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print 0, confirming the narrow scope clause is gone."
      - "(a) New wording present, Reporting site. Run: grep -c \"A flagged task is not the gate\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must print exactly 1. Run: grep -n \"Flagged tasks\" /Users/akoukoullis/Work/AK/FlowCharge Core/skills/flowcharge/SKILL.md — it must return exactly two lines, the first inside '## Gates' between the '**Before execute-tasks**' and '**Before commit**' bullets, the second inside the '## Reporting' end-of-run bullet."
      - "(a) Task 6's surviving clauses. Run: grep -c \"rule 10's test\" and grep -c \"Do not begin execution until every flag\" against the same file — each must still print exactly 1."
      - "(b) No duplication or contradiction of the task 4/5 exclusion. Run: grep -c \"never an item in this list\" — it must still print exactly 1, proving task 5's sentence was neither re-worded nor duplicated. Run: grep -c \"attach no recommendation\" and grep -c \"fresh instruction, judged under rule 4\" — each must still print exactly 1, proving task 4's text is untouched. Run: grep -c \"1 yes, 2 no\" and grep -c \"second numbered list\" — each must still print exactly 1."
      - "(b) Subject separation, by reading. Read the whole '## Reporting' end-of-run bullet. Confirm two adjacent sentences with two different subjects: task 5's sentence excludes 'a gated stage this run was not asked to reach' from the numbered list, and the new sentence includes 'a flagged task' in it. Confirm the new sentence never says a gate, a 'proceed?' question, or an unasked-for stage may be an item in that list. Then read the whole '## Gates' Flagged tasks bullet and confirm it still says the gate's own 'proceed?' is neither one of the flag entries nor numbered among them, and that its new closing sentence states the gate is not listed in a run that never reaches it."
      - "(c) Scope. Run from /Users/akoukoullis/Work/AK/FlowCharge Core: git status --short — it must list exactly one path, ' M skills/flowcharge/SKILL.md', and nothing else. Run: git diff --stat — the same single file. The WS-1-qrec54 workstream folder will not appear, because a user-level global gitignore excludes flowcharge/; that absence is expected, per PLN-1-kqwu53 assumption A8."
      - "(c) Diff shape. Run: git diff skills/flowcharge/SKILL.md — read the two hunks and confirm the '**Before execute-tasks**' bullet, the '**Before commit**' bullet, the Gates closing paragraphs, hard rule 4, hard rule 10 and the `open_questions` passage all appear as context lines only, with no added or removed line inside any of them."
      - "(d) Generator. Run: node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/FlowCharge Core --check; echo \"EXIT=$?\" — expect no output and EXIT=0, matching task 7's recorded baseline. The --check flag writes nothing, so the run is safe on a dirty tree."
    checklist:
      - "Does the Flagged tasks bullet now scope the block to the task list rather than to the execute-tasks gate, so the same block under the same label appears in the end-of-run summary of a run that authored a task list without executing it?"
      - "Do the greps prove the new wording is present — 'belongs to the task list, not to the gate' = 1, 'the flags are listed, the gate is not' = 1, 'A flagged task is not the gate' = 1, 'execute-tasks gate only' = 0, and 'Flagged tasks' = 2 with one hit in '## Gates' and one in '## Reporting'?"
      - "Is task 5's sentence still present exactly once and unchanged, and is task 4's appended text unchanged, so the gate itself is still excluded from the end-of-run numbered list?"
      - "Do the amended texts keep a flag and a gate visibly different — the flag an ordinary numbered item, the gate never an item — at both sites, with no sentence that could be read as admitting the gate to that list?"
      - "Do the rest of task 6's Flagged tasks bullet, the 'Before execute-tasks' bullet, the 'Before commit' bullet, hard rule 4 and hard rule 10 all survive unchanged?"
      - "Is skills/flowcharge/SKILL.md the only changed file, does the generator's --check still print no warning and exit 0, and were tasks 1 to 8 of this task list left untouched?"
    self_eval:
      passed: true
      failures: []
      notes: "All six checklist items YES. Both edits applied to skills/flowcharge/SKILL.md. Edit 1, the Flagged tasks bullet, now sits at lines 374-391, still between the '**Before execute-tasks**' bullet (371-373) and the '**Before commit**' bullet (392-393), at the same list level with the same 2-space continuation indent. Its parenthesis reads '(only when there is something to flag)' and no longer carries 'execute-tasks gate only'. The new scope sentence reads 'a separately labelled block that belongs to the task list, not to the gate', followed by the two placement cases: post it after the gate's own content when the run reaches the execute-tasks gate, and post the same block under the same label in the end-of-run summary when the run authored a task list it was not asked to execute. The new closing sentence 'In a run that never reaches the gate there is no \"proceed?\" to offer at all: the flags are listed, the gate is not (see \"Parsing the request\").' sits immediately after the untouched 'The gate's own \"proceed?\" is neither one of these entries nor numbered among them, and no reply to them satisfies it (rule 4).' sentence, as a separate sentence. Everything from 'One numbered entry per task whose change is risky by rule 10's test' onward survives word for word; only the line wrapping changed, and no second carry-over sentence was added. Edit 2, the '## Reporting' echo, sits at lines 500-503, between task 5's sentence (497-499) and the sentence beginning 'Anything settled under `open_questions: auto`' (504), at the bullet's 2-space continuation indent. Verify results: 'belongs to the task list, not to the gate' = 1; 'the flags are listed, the gate is not' = 1; 'execute-tasks gate only' = 0; 'A flagged task is not the gate' = 1; 'Flagged tasks' = 2, at line 374 in '## Gates' and line 502 in '## Reporting', neither straddling a line break; \"rule 10's test\" = 1; 'Do not begin execution until every flag' = 1; 'never an item in this list' = 1; 'attach no recommendation' = 1; 'fresh instruction, judged under rule 4' = 1; '1 yes, 2 no' = 1; 'second numbered list' = 1; 'complete, safe reply' = 1; hard-rule count = 11. Subject separation confirmed by reading: task 5's sentence excludes 'a gated stage this run was not asked to reach' from the numbered list and is unchanged, and the new adjacent sentence includes only 'a flagged task' in it. The new sentence never states that a gate, a 'proceed?' question, or an unasked-for stage may be an item in that list. Scope: git status --short lists ' M skills/flowcharge/SKILL.md' and nothing else, and git diff --stat names the same single file. The WS-1-qrec54 workstream folder is absent because a user-level global gitignore excludes flowcharge/, which is expected per PLN-1-kqwu53 assumption A8. Diff shape: git diff -U6 shows both neighbouring Gates bullets, the Gates closing paragraphs, hard rule 4, hard rule 10 and the `open_questions` passage as context lines only, with no added or removed line inside any of them. Generator: node skills/flowcharge/scripts/fc-index.mjs --root /Users/akoukoullis/Work/AK/FlowCharge Core --check printed no output and exited 0, matching task 7's baseline. Tasks 1 to 8 of this task list were not edited, including task 8's self_eval."
    ```

## Divergences

1. **Cited line numbers drifted.** Every anchor the plan names exists
   in the file as described, so no stage is untasked. Four cited line numbers have drifted by
   one or two lines: the "Only what the user asked for" bullet is at 264-265 (plan says
   263-265), the Operations note on execute-tasks is at line 234 (plan says 235), the
   end-of-run "Reporting" bullet starts at 453 (plan's Stage 5 says 455-458), and the
   "Gates" closing paragraph is at 361-362 as the plan states.
2. **README.md line 129 carries an extra sentence.** `README.md` line 129 also
   carries one sentence beyond the plan's D11 quote — "Mentioning a stage in your original
   request does not bypass its gate." — which strengthens the plan's conclusion that the
   README stays true and needs no edit. Task 7 records this rather than acting on it.
