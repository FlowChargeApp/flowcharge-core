# Create Plan

## Role
You are a senior software architect.

## Skills
/fc-dev-principles
/fc-plan-feature
/fc-issue-list (for the frontmatter conventions it documents)

## Context
Read these to understand the structure and purpose of the app:
{{this project's own structural or reference documentation, listed as `@`-prefixed bullets, one per file. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too.}}
````md
{{everything the subagent needs and cannot discover for itself: the feature to be planned and why it is wanted, the decisions already taken, the constraints in play, and the parts of the codebase it touches, complete on those points, no padding}}
````

## Instructions
Write a plan for the feature described in Context, and save it to `{ws_dir}/<the PLN ID you claim below>-plan.md`. Plan what Context asks for and no more. Do not widen the feature, add capabilities it does not call for, or plan work it does not describe.

The file must open with frontmatter, exactly these keys:

```yaml
---
id: <the PLN ID you claim below>
type: plan
workstream: {ws_id}
slug: {slug}
title: "<a short title for the plan>"
status: ready
created: <today, YYYY-MM-DD, from `date +%F`>
updated: <same>
depends_on: []
links: []
---
```

Flat keys and inline arrays only. The index parser depends on it.

Allocate the PLN ID by running `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --claim PLN` and using the printed id verbatim. IDs are global and permanent across every plan.

You are running without a user, so answer the skill's prompts yourself rather than stopping at them:

- Do not stop for blocking questions, or for deployment and release constraints. Take the most reasonable reading, state it in the plan as an explicit assumption in the plan's Scope section, and raise a would-have-asked item as an Open question only where a wrong answer is not recoverable by a later follow-up change.
- Do not stop for approach approval. Weigh the candidate approaches, commit to one, and record the alternatives and why you rejected them in the plan.
- Never invent a requirement to fill a gap. Anything Context leaves unsettled is an assumption or an open question, recorded as one.

What you leave unresolved is honoured downstream: the prompt template that turns this plan into tasks authors nothing for a stage resting on an open question. Raising a question costs one round trip. A fabricated decision gets built as if the user had chosen it.

## Return
Reply in chat only, briefly:
- the plan's file path and ID
- a summary of the plan
- the approach you chose, and what you rejected
- the assumptions and open questions a user needs to settle

**Open questions, the return shape**

Return every open question in this shape, and no other:

- **Question:** the question in one sentence that reads cold to somebody who was not here.
- **Recommendation:** the option you would take, and a one-line reason for it. Where you cannot recommend one, write `No recommendation possible` in this field, followed by the reason you cannot. A question carrying that sentinel never settles at any tier.
