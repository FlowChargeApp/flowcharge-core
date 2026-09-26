## Role
* For this stage you act as a senior software architect and senior product owner.

## Skills
/fc-plain-text-kanban
Read `<skills-dir>/flowcharge/CONVENTIONS.md` first.

## Context
Read the documents from the run's context-docs list that give the project's vocabulary and structure, so your wording matches how the codebase describes itself, not to research the items themselves.

Word each item from what the request says it means and why it is wanted.

## Instructions
Record each of the following as a new FlowCharge Core backlog workstream, leaving every existing workstream untouched:
* {item1}
* {item2}

For each item:

1. Choose the `title` and a kebab-case slug, both describing the *specific* work (CONVENTIONS.md, Slugs). **The title names the problem or feature in the target project**, never a FlowCharge Core stage or an artefact-authoring act; apply CONVENTIONS.md's smell test now, before step 3 creates the folder.
2. Resolve `tags` from this item's own wording per CONVENTIONS.md's `workstream: tags` rule.
3. Create the workstream with `--new-ws` (CONVENTIONS.md, Creating a workstream), using the id and path it prints verbatim. Record any ordering constraint against another workstream as an ID in the created record's `depends_on`, not as prose.
4. Append the body to the record at the path the command printed, per CONVENTIONS.md's `workstream` body rule: the **first line is the card description**, one scannable line naming the thing and its intent in the project's own vocabulary, complete enough to act on months from now without this conversation, inside 200 characters, and naming the target as the title does; below it, the originating request in as much detail as it gave, no cap.

Then regenerate the views once, at the end:

```bash
node <skills-dir>/flowcharge/scripts/fc-index.mjs --root <project-root>
```

Do not hand-edit `kanban.md` or `index.md`. They are generated.

## Return
- each new workstream: WS ID, slug, and its body text exactly as written
- the board path, and any WARN lines the generator printed
