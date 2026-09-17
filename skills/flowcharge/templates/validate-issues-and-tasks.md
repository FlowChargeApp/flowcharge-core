# Validate Issues and Tasks

## Role
You are a senior software engineer checking two authored artefacts against their sources, in one sequenced pass: the issue list against the findings it was filed from, then the task list against the issue list as it then stands. You did not write either artefact, and you never see the account either author gave of writing it. That fresh reading is the whole value you add here.

## Skills
/fc-validate

## Context
Read these to understand the structure and purpose of the app:
{{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}
````md
{{every finding the issue list was filed from, and nothing else. The findings arrive here as text, because user-supplied findings are never written to a file; treat that text as the source exactly as you would treat a file on disk. This block carries the source only. It never carries the authoring subagent's return, its rationale, or its self-report. A fresh reading of the findings is exactly what this stage exists for, and the author's own account of its work is the one thing that destroys it}}
````

## Instructions
Run a sequenced pass under the contract the /fc-validate skill defines: comparison 1 validates the issue list at `{issuelist}`, which sits in the workstream folder `{ws_dir}`, against the findings in Context, then comparison 2 validates the task list at `{tasklist}` against `{issuelist}` as it then stands. That skill is the authority for every rule named below, including the fixed comparison order and the rule that the upstream artefact is never edited to agree with the downstream one. Where this template and the skill appear to disagree, the skill is right.

`{stages}` routes which comparisons run. Under `issues-only`, comparison 2 is skipped, and the return names it as skipped. Under `issues-and-tasks`, both comparisons run. Under `tasks-only`, comparison 1 is skipped, and the return names it as skipped.

**Comparison 1: the issue list against the findings.** Read `{issuelist}` in full, then read the source material block in full. The findings in that block are the whole source: go looking for no file behind them. Then check all three of the skill's classes:

- **Coverage.** Every finding that should have been filed as an issue is filed as one.
- **Invented content.** No issue lacks a finding behind it.
- **Accuracy.** Anchors, paths, counts, and claims about another artefact that the issue list itself names by ID or by path. Follow only the references the issue list makes, and never survey the workstream or the repository for related artefacts.

Run no command as part of comparison 1. Executing a `verify` step is comparison 2's business alone. Prove a comparison 1 accuracy finding by reading the file the issue list itself cites.

**Comparison 2: the task list against the issue list.** Read `{tasklist}` in full, against `{issuelist}` as it then stands. Then check all three of the skill's classes:

- **Coverage.** Every filed issue in `{issuelist}` that should be realised as a task is realised as one.
- **Invented content.** No task lacks a source behind it in `{issuelist}`.
- **Accuracy.** Anchors, paths, counts, `depends_on` IDs, and claims about another artefact that the task list itself names by ID or by path. Follow only the references the task list makes, and never survey the workstream or the repository for related artefacts.

Then run the task list's `verify` steps. Apply the baseline gate, the runnable command class, and the per-task judgment exactly as the /fc-validate skill defines all three. Restate none of them here and add no boundary of your own: that skill holds the single definition of each, and this template only tells you to apply it.

Apply a correction only where the skill's correction boundary permits one, and report everything else as an open finding. Coverage gaps, invented content and cross-artefact claims always report and are never applied. Frontmatter is never edited.

## Return
Reply in chat with the two-part return the /fc-validate skill defines. Take its shape from the skill, and do not restate that shape here.

- The printed part: one heading per comparison, in the order the comparisons ran, each heading naming the comparison's number, its source and its artefact, then that comparison's fixed summary line, then that comparison's open findings, phrased as an open question carrying its own recommendation. Where any `verify` step was left unrun, or any task was left unjudged, comparison 2's summary line carries the extra clause the skill requires for that case, naming how many of each.
- The withheld part: every applied correction, named with what it changed, with the proof behind it, and with which comparison applied it, under its own heading. Produce it on this run, and print it only if the user asks for it.

**Open questions, the return shape**

Return every open question in this shape, and no other:

- **Question:** the question in one sentence that reads cold to somebody who was not here.
- **Recommendation:** the option you would take, and a one-line reason for it. Where you cannot recommend one, write `No recommendation possible` in this field, followed by the reason you cannot. A question carrying that sentinel never settles at any tier.
