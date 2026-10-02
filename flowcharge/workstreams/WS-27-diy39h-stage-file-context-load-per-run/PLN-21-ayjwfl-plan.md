---
id: PLN-21-ayjwfl
type: plan
workstream: WS-27-diy39h
slug: stage-file-context-load-per-run
title: "Load each stage file once and only the sections a stage needs"
status: ready
created: 2026-10-03
updated: 2026-10-03
author: Anthony Koukoullis
base_commit: 1d1db92
depends_on: []
links: []
---

# Load each stage file once and only the sections a stage needs

## Summary

- **Problem:** every run loads whole skill files into context, some of them more than once per session, and every later turn carries them.
- **For:** anyone running the FlowCharge Core pipeline, on any harness.
- **Success:** each stage reads fewer bytes and each file is read once per session, with every rule as effective as before.
- **Approach:** hard rule 1 stops a second read of an unchanged file; fc-task-list and fc-git each split into a core `SKILL.md` and one sibling file read on demand; the executor stage file points at fc-task-list sections instead of restating them; plan-and-tasks loads fc-issue-list only when it needs it.
- **Top risk:** a moved or shortened sentence loses a rule; every move is verbatim and pinned by a test case.

## Scope

Acceptance criteria:

1. (Must) Hard rule 1 in `skills/flowcharge/SKILL.md` keeps its fresh-read rule and adds the read-once sentence and its no-script-can-check note (Content specification, Hard rule 1).
2. (Must) `skills/flowcharge/templates/plan-and-tasks.md` loads fc-issue-list only when the plan names issue IDs.
3. (Must) The eight sections listed in Design, fc-task-list split, live only in the new `skills/fc-task-list/authoring.md`, and `skills/fc-task-list/SKILL.md` keeps every other section and states when to read `authoring.md`.
4. (Must) Every reader of the authoring rules names `authoring.md`: both authoring stage files, read in full before Part 2, fc-validate's Form class, and the two CONVENTIONS.md pointers that name a moved section.
5. (Must) `skills/flowcharge/templates/execute-parent-task.md` points at fc-task-list's Self-evaluation, Evidence classes, Mini shape and the Metadata Schema's `self_eval` key instead of restating them, and keeps every sentence those sections do not carry.
6. (Must) The six sections listed in Design, fc-git split, live only in the new `skills/fc-git/operations.md`, and `skills/fc-git/SKILL.md` keeps the workflow, risk tiers, committing, branching, recovery and hard rules and states when to read `operations.md`.
7. (Must) No rule, constraint or nuance is lost: every moved sentence is byte-identical in its new file except the pointer wording in Content specification, and the record's keep list holds, because fc-plan-feature, fc-issue-list, fc-task-list's `self_eval` keys and Self-evaluation, and fc-git's Committing section are not edited.
8. (Must) `node skills/flowcharge/scripts/test/run-tests.mjs` passes every case after each stage, with the single-copy pins following each moved rule, new cases pinning criteria 1, 2, 3 and 6 and the stage-file and fc-validate readers of criterion 4, and two single-copy entries pinning criterion 5.
9. (Must) The execute stage's read set (`execute-parent-task.md` plus `fc-task-list/SKILL.md`) and the commit stage's (`fc-git/SKILL.md`) are smaller than at `base_commit`, and the plan-and-tasks stage no longer reads `fc-issue-list/SKILL.md` for a plan that names no issue ID.
10. (Must) Every new sentence passes DEVELOPMENT.md's portability questions: it names no model, vendor, harness product, tool name or spawn mechanism.

Out of scope: splitting `CONVENTIONS.md`, `fc-validate/SKILL.md` or `fc-plan-feature/SKILL.md` (Alternatives); splitting `templates/plan-and-tasks.md`, which a plan-and-tasks run follows in full; splitting `flowcharge/SKILL.md`, which the record does not name among the files to cut; rewording any rule in place; `CHANGELOG.md` and every `metadata.version`, which the release process owns; `README.md`, which no stage reads and whose links to `skills/fc-task-list/SKILL.md` still resolve.

Assumptions:

- **Measurement sample.** One session runs plan-and-tasks, validate, execute-tasks over a list of several parent tasks plus its baseline run, and commit, for a plan that names no issue ID. Read sets are measured with `wc -c` on the files each stage file and skill names, at `base_commit` and after the last stage.
- **Unchanged since that read.** The session judges this from its own edits, and reads again when unsure.
- **Release path.** Unchanged: the release zip and both install paths copy whole skill folders (`.github/scripts/build-release-zip.mjs`, the header comment), so the two new files ship with their skills.
- **Deployment.** No data and no live service. Rollback is reverting the stage commits.

## Design

**Loading mechanism.** A skill whose readers need different parts keeps a core `SKILL.md` and one sibling file in the same folder. The core carries one bold sentence naming the sibling, the acts that require reading it in full, and the sections it holds. Every stage file that needs the sibling names it in its Skills section, with the point at which to read it. Reading a file from the skill's own folder is the agent-skill format's reference-file pattern and needs no harness feature (DEVELOPMENT.md, Portability is the one non-negotiable rule). The sibling carries no frontmatter, so the release stamper and manifest generator treat it as an ordinary folder file.

**Read-once rule.** Hard rule 1 is the single home. "Fresh" keeps meaning read in this session, never recalled, which is the stale-text protection the rule exists for. A file already read in full in this session, still in context in full, and unchanged since, is not read again. This covers the execute-tasks loop, which follows `templates/execute-parent-task.md` once per parent task, and fc-task-list, which the authoring and execute stages both name. The Operations table and the execute-tasks note keep their wording, because hard rule 1 now decides when a read happens.

**fc-task-list split.** `authoring.md` holds, as `## ` headings in this order: Creating a list and adding a task (the create-a-list and add-a-task procedures from Storage), Runtime detection, Test commands detection, Writing verify steps (the authoring sentences of the `verify` key, from "See **Smoke Tests** below" to the end of the key), Where the detail sits, by mode, Divergences, Smoke Tests, and Authoring rules (the Rules bullets on the feature summary, adding only new tasks, and the standalone validation offer). The Rules bullet that restated the Divergences prohibition is folded into that prohibition, which gains its one extra clause, "not inline in a task's prose". `SKILL.md` keeps everything an executor needs: storage, frontmatter, modes, staleness guard, task types, format, Metadata Schema, author attribution, Mini shape, Evidence classes, Verify tiers, Self-evaluation, Test-run task, Test-update task, the remaining Rules, file operations and housekeeping. Readers: `templates/plan-and-tasks.md`, `templates/issues-and-tasks.md`, `fc-validate/SKILL.md`. `templates/execute-parent-task.md` reads the core only.

**Executor stage file.** Two bullets change. The mini-subtask bullet keeps its executed-from-`implement`-and-`pattern` rule and its stop, and points at Self-evaluation for promotion and at Mini shape for evidence. The evaluate bullet points at Evidence classes, Self-evaluation and the Metadata Schema's `self_eval` key, which holds the checklist-order and position rules, and keeps its one sentence none of them carries: an already-applied subtask still runs its steps, and reading the file is evidence for a `source` item only. Every other bullet is unchanged.

**fc-git split.** `operations.md` holds, as `## ` headings in their current order: Init (new project), Merging & rebasing, Worktrees, Stashing, Tags & releases, Remotes & pushing. `SKILL.md` keeps the workflow, the risk tiers, Committing, Branching, Recovery & undo and the hard rules, so the commit stage and hard rule 11's branch cut read the core alone. The core's risk tier already defines the protected branch, which hard rule 11 cites.

**Tests.** Each stage carries its own `run-tests.mjs` edits, so every stage commit passes the suite. A new `onDemandProblems(entries, readText)` helper checks one split: the sibling exists, the core names it, each listed section is a `## ` heading in the sibling and is no heading in the core outside a fenced example, and each listed reader names the sibling. One fixture case proves it flags each defect. The test-update task then has nothing left to update.

## Content specification

| Element | Exact value | Rationale |
|---|---|---|
| Hard rule 1, added after "with its emphasis." | "Fresh means read in this session, never recalled. A stage file, skill or CONVENTIONS.md already read in full in this session is not read again while its full text is still in your context and its file is unchanged since that read; when unsure, read it again." | Keeps the stale-text protection; "when unsure" makes the safe path the default. |
| Hard rule 1, closing note | "**No script can check** whether a file is read again, because no script reads a run (see DEVELOPMENT.md's note on unverifiable rules)." | DEVELOPMENT.md's rule for a rule no script can check. |
| plan-and-tasks Skills line | "/fc-issue-list, only when the plan names issue IDs" | The plan and task list frontmatter is in fc-plan-feature, fc-task-list and CONVENTIONS.md; fc-issue-list is needed only to update a named issue's `tasks` and `status`. |
| Both authoring stage files, Skills line | "/fc-task-list and its `authoring.md`, read in full before Part 2" | A plan-only or issues-only run reads neither. |
| fc-task-list core pointer, after the in-run paragraph of When to use me | "**Read `authoring.md` in this skill's folder in full before you create a task list, add a task to one, or validate one.** It holds **Creating a list and adding a task**, **Runtime detection**, **Test commands detection**, **Writing verify steps**, **Where the detail sits, by mode**, **Divergences**, **Smoke Tests** and **Authoring rules**. Executing a task needs only this file." | Names the trigger and every moved section, so a cross-file pointer to a section still resolves. |
| `authoring.md` opening | "# fc-task-list: authoring" then "The fc-task-list skill's authoring rules. `SKILL.md` in this folder holds the schema and everything an executor needs; read both before you create a task list, add a task to one, or validate one." | States the pairing from either file. |
| fc-task-list pointer wording | "below" becomes "(authoring.md)" in the `runtime` / `e2e_tooling` and `test_commands` frontmatter bullets; the `verify` key ends "How to write them: **Writing verify steps** (authoring.md)."; the Test-run task exemption reads "so authoring.md's **Writing verify steps** and the Forbidden tier do not apply to it, … Every other task keeps both."; in `authoring.md`, a pointer to a core section gains "in SKILL.md" or "(SKILL.md)", and the create procedure's "(see Frontmatter)" becomes "(see SKILL.md, File frontmatter)". | The only wording a move changes. |
| fc-validate Form bullet | "`fc-task-list` (its `SKILL.md` and `authoring.md`) for a task list" | The schema a validator checks now spans both files. |
| CONVENTIONS.md `tasklist` pointers | "the fc-task-list skill's `authoring.md`, Runtime detection" and "… `authoring.md`, Test commands detection" | Each pointer names the file that holds the section. |
| Executor mini-subtask bullet | "If the edit needs a design decision, stop and promote it to the full shape, per the fc-task-list skill's Self-evaluation. Its `self_eval.evidence` follows the skill's Mini shape." | Self-evaluation and Mini shape state the promotion and evidence rules in full. |
| Executor evaluate bullet | "Evaluate every `checklist` item and record its `self_eval` entries under the skill's Evidence classes and Self-evaluation, in the shape its Metadata Schema gives `self_eval`, fixing and re-checking each NO as Self-evaluation says. An already-applied subtask still runs its steps: reading the file is evidence for a `source` item only." | The second sentence is the bullet's one rule the skill does not carry. |
| fc-git core pointer, under Operations catalog | "**Read `operations.md` in this skill's folder in full before you init a repository, merge, rebase, use a worktree, stash, tag, push, or open a pull request.** It holds **Init (new project)**, **Merging & rebasing**, **Worktrees**, **Stashing**, **Tags & releases** and **Remotes & pushing**. Committing, branching and recovery follow here." | Names every act that needs the sibling. |
| `operations.md` opening | "# fc-git: operations" then "The fc-git skill's sections for init, merge, rebase, worktrees, stashing, tags and pushing. `SKILL.md` in this folder holds the workflow, the risk tiers and the hard rules, which bind every operation here; read both before any of these operations." | The hard rules bind every moved operation. |
| `operations.md`, Remotes & pushing | "per the tier list" becomes "per the tier list in SKILL.md" | The tier list stays in the core. |

## Stages

1. **Read each file once per session.** Changes hard rule 1 and the plan-and-tasks Skills line, with their pin case. First, because it changes a hard rule and every later stage's reading follows it. Observable: criteria 1 and 2.
2. **fc-task-list core and `authoring.md`.** Creates the sibling, removes the moved sections from the core, repoints every reader, and moves the two single-copy pins. After stage 1, because both authoring stage files' Skills sections change again here. Observable: criteria 3 and 4.
3. **Executor stage file points instead of restating.** After stage 2, which confirms the sections it points at stay in the core. Observable: criterion 5.
4. **fc-git core and `operations.md`.** Independent of stages 1 to 3 and the lowest risk, because the commit stage reads only the core. Observable: criterion 6.

## Data & compatibility

No data or API change. A skill folder installed by a copy made before this change keeps working, because the core files keep every rule a reader needs until the new files arrive with the same release. Rollback is reverting the stage commits in reverse order. Each stage leaves the suite green, so a partial rollback is also safe.

## Testing strategy

- Stage 1: one prose-pin case for criteria 1 and 2, in the style of the hard rule 8 case.
- Stage 2: the `onDemandProblems` fixture case, a case running it on the fc-task-list split (criteria 3 and 4), and `Measure before you write` and `A suite runs in one place only` moved to `fc-task-list/authoring.md` in `SINGLE_COPY_PHRASES`.
- Stage 3: two `SINGLE_COPY_PHRASES` entries for criterion 5: the executor's old "You never decide that tooling is missing" pinned deleted, and fc-task-list's "never decides for itself that tooling is missing" pinned to its core.
- Stage 4: a case running `onDemandProblems` on the fc-git split (criterion 6), and `Plain \`--force\` is never used` pinned to `fc-git/operations.md`.
- Every stage: the existing Rule A to H, single-copy, pointer-resolution, stage-file slot and spawn-word cases stay green (criteria 7, 8 and 10).

## Alternatives considered and rejected

- Split `CONVENTIONS.md`: every run needs its IDs, frontmatter, status and index sections, and the pointer-resolution case and five single-copy pins bind its sections to the one file.
- Split `fc-validate/SKILL.md`: every part applies to every pass the pipeline runs, which always includes a task list.
- Split `fc-plan-feature/SKILL.md` into in-run and standalone parts: the standalone-only steps sit inside a numbered workflow whose order carries rules, for a small saving.
- Trim prose by rewording rules in place: no test can detect a changed meaning, while a verbatim move is checkable by diff.
- Read a section of one file by line range instead of a sibling file: a range breaks when lines move, and it needs a shell command where a file read suffices.
