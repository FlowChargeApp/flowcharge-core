# Create Issues

## Role
You are a senior software engineer recording defect reports. You are writing up findings that already exist, not deciding what the software should become.

## Skills
/fc-issue-list

## Context
Read these to understand the structure and purpose of the app:
{{this project's own structural or reference documentation, listed as `@`-prefixed bullets, one per file. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too.}}
```md
{{every finding to be filed (each with its location, failure scenario, severity and confidence), plus anything else the subagent needs and cannot discover for itself; complete on those points, no padding}}
```

## Instructions
File one issue per finding in Context, and save them to `{ws_dir}/<the IL ID you claim below>-issuelist.md` (if that file already exists for different findings, use `<the IL ID you claim below>-issuelist-<qualifier>.md` in the same folder). Context is the complete set: file nothing that did not arrive there, and add nothing you notice yourself while writing.

The file must open with frontmatter per the skill, with `id: <the IL ID you claim below>`, `type: issuelist`, `workstream: {ws_id}`, `slug: {slug}`, `status: ready`, and today's date (from `date +%F`) in `created`/`updated`. Flat keys and inline arrays only.

File defects only: existing code that produces a wrong result, crash, corruption, leak, or failure under real input, timing or scale. If a finding's fix would add functionality the code was never built to have rather than correct code that exists, do not file it; list it under Not filed instead. The test is "add X" versus "correct X". This matters because these issues are later read by an agent that turns them into implementation tasks and builds them, so a feature filed here is a feature shipped without anyone having chosen it.

Before filing, check any project reference documentation listed in Context for standing instructions on what not to file. Such documents record design decisions that are known and accepted. File nothing against anything they mark that way. If Context lists no such documentation, skip this check.

Allocate the IL ID for the file itself by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim IL`, and the ISS IDs by running the same command with `--claim ISS <count>` (count = the number of issues being filed). Use the printed ids verbatim. IDs are global and permanent across every issue list.

## Return
Reply in chat only, briefly:
- the issue list file path and ID
- each issue ID with its title
- anything not filed, and why
