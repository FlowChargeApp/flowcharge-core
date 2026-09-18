## Role
* You are a senior software architect and senior product owner.

## Skills
/fc-plain-text-kanban

## Context
Read these for the project's vocabulary and structure, so your wording matches how the codebase describes itself, not to research the items themselves:
{{this project's own structural or reference documentation, resolved to repo-relative paths, one line per document, each line saying what that document covers and when to read it. Look at what actually exists at the project root (a README, a `docs/` folder, an architecture, layers or conventions document) and list only files you have confirmed are there. Invent nothing and never carry a path over from another project. If the project has no such documentation, delete this block and the sentence introducing it; if that leaves this section with no other content, delete its heading too. Close the list with one line telling the reader to read the documents this task needs, not all of them.}}

````md
{{what each backlog item below means and why it is wanted, in enough detail to word it well, plus anything else the subagent needs and cannot discover for itself; complete on those points, no padding}}
````

## Instructions
Record each of the following as a new FlowCharge Core backlog workstream, leaving every existing workstream untouched:
* {item1}
* {item2}

For each item:

1. Choose the `title` and a kebab-case slug, both describing the *specific* work, the slug per the skill's slug rules. **The title names the problem or feature in the target project**, never a FlowCharge Core stage or an artefact-authoring act such as creating issues or authoring tasks. Apply CONVENTIONS.md's smell test now, before step 3 creates the folder.
2. Resolve `tags`. Read `flowcharge/tags.md` first. If this item's own wording contains `#word` tokens, lowercase each; for each, check the pool for a spelling that already covers the same idea (including a different grammatical form of the same word) and reuse that spelling instead of the literal token; a word with no covering pool entry is registered as a new line in `flowcharge/tags.md`. Those words, once resolved, become this item's entire `tags` set. Do not also add tags the pool's subject-matching would otherwise have chosen. If any `#word` carries a trailing `+` (e.g. `#gates+`), strip the `+` and treat the resolved words as a seed instead of the entire set: keep them all, and also choose any further tags from the pool's existing spellings matching this item's subject, the same reuse-first judgment, registering a new pool entry only if nothing covers it. If this item's wording carries no `#` words, choose `tags` from the pool's existing spellings matching its subject; register one new pool entry only if nothing already covers it. Never invent a near-miss variant of a spelling already in the pool.
3. Create the workstream with one command, and use the id and the path it prints verbatim: `node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws <slug> --title "<title>" [--tags a,b]`: `--title` is required, `--tags` is optional. The command collision-checks the slug against every live and archived workstream and refuses, claiming nothing, if the slug is already taken; it claims the WS id; it creates the folder as `flowcharge/workstreams/<the printed WS id>-<slug>/`; and it writes `workstream.md` there with every required key present and valid at `status: backlog`. It prints two lines, the claimed id then the created record's path relative to the project root. **Do not create the folder by hand and do not claim the id by hand.** This command is the only supported way to create a workstream. Record any ordering constraint against another workstream as an ID in the created record's `depends_on`, not as prose.
4. Append the body to the record the command created, at the path it printed, per CONVENTIONS.md, which this echoes. The **first line is the card description**: one scannable line naming the thing and its intent, reworded in the project's own vocabulary, complete enough to act on months from now without this conversation, and inside 200 characters. The board shows this line and nothing else. **Below it, capture the originating request in as much detail as it gave**: its reasoning, constraints and examples, in the request's own words, so a later plan or task list can be authored from this record alone. Body length follows the request: a one-line ask stays one line; a request explained at length keeps that explanation, and there is no cap. Do not compress it to fit the board; nothing after the first line reaches the board. **That first line names the problem or feature in the target project**, never a FlowCharge Core stage or an artefact-authoring act such as creating issues or authoring tasks, the same rule step 1 applied to the title.

Then regenerate the views once, at the end:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

Do not hand-edit `kanban.md` or `index.md`. They are generated.

## Return
- each new workstream: WS ID, slug, and its body text exactly as written
- the board path, and any WARN lines the generator printed
