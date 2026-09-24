# Validate

## Role
For this stage you act as a senior software {role} checking two authored artefacts against their sources in one sequenced pass: the {upstream} against the source it was authored from, then the task list against the {upstream} as it then stands. Judge each against its cited source only, never against what you recall intending when you authored it earlier in this run, per the /fc-validate skill.

## Skills
/fc-validate

## Context
Read the documents this stage needs from the run's context-docs list, not all of them, to understand the structure and purpose of the app.

The source material for comparison 1 is the one the flowcharge skill's "Source material" note defines for the {upstream}, and nothing else.

## Instructions
Run a sequenced pass under the /fc-validate skill's contract, the authority for every rule below; where this template and the skill appear to disagree, the skill is right. Comparison 1 validates the {upstream} at `{upstream_path}`, in the workstream folder `{ws_dir}`, against that source material. Comparison 2 validates the task list at `{tasklist}` against `{upstream_path}` as it then stands.

`{stages}` routes: `tasks-only` skips comparison 1; `plan-only` or `issues-only` skips comparison 2; otherwise both run. Name any skipped comparison in the return.

For each comparison, read the artefact and its source in full, then check all four of the skill's classes against that source, following only the references the artefact itself makes. Run no command in comparison 1. After comparison 2, run the task list's `verify` steps under the skill's baseline gate, runnable command class and per-task judgment.

Fix every defect the skill's correction rule lets you prove wrong, in place and on your own authority, and report only what that rule says to report. Edit frontmatter only within its limits, and never `id`, `status`, `base_commit`, `created` or `updated`.

## Return
Reply in chat with the two-part return the /fc-validate skill defines for a sequenced pass: the printed part (one heading per comparison, its fixed summary line, then its open findings in the skill's open-question shape) and the withheld part, produced on every run and printed only if the user asks.
