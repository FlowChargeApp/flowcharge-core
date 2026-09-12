---
id: IL-1-8o0id7
type: issuelist
workstream: WS-5-geob84
slug: unescape-frontmatter-quoted-values
title: "Frontmatter quote-strip parsing findings"
status: done
created: 2026-09-10
updated: 2026-09-13
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-1-j2knwc. parseFrontmatter never undoes JSON.stringify escaping on quoted scalars

  ```yaml
  id: ISS-1-j2knwc
  status: done
  severity: medium
  author: Anthony Koukoullis
  description: "The scalar-stripping line inside parseFrontmatter (skills/flowcharge/scripts/fc-index.mjs:356, within the block at :342-360) only strips the outer leading/trailing quote character with `fm[km[1]] = v.replace(/^[\"']|[\"']$/g, '');`. It never runs the inverse of JSON.stringify. The only two writers of JSON-stringified frontmatter scalars in this file are `title: ${JSON.stringify(title)}` and `description: ${JSON.stringify(description)}` in the --new-ws scaffold writer (skills/flowcharge/scripts/fc-index.mjs:1226 and :1230). Because the writer uses JSON.stringify, any JSON string escape sequence in a title or description corrupts on read the same way: an embedded double quote (\") producing He said \\\"hi\\\" instead of He said \"hi\", and a literal backslash (\\\\) both round-trip with the escape sequence still literally present in the text. The --new-ws writer refuses a control character in --title or --description (parseNewWsArgs, fc-index.mjs:612-633), so a control-character escape (\\n, \\t, \\r, \\u00XX) can reach a record only by hand-editing; parseFrontmatter then leaves it literally present in the same way."
  steps_to_reproduce:
    - "Run --new-ws with a --title or --description value containing a character JSON.stringify escapes, e.g. a title of He said \"hi\" or a title holding a backslash. A newline or any other control character cannot be used here: --new-ws refuses it before writing (fc-index.mjs:616-618 and :631-633)."
    - "Read the generated workstream.md frontmatter and observe the raw JSON-stringify output, e.g. title: \"He said \\\"hi\\\"\"."
    - "Run the generator's kanban.md generation or --list against that workstream and inspect the rendered title/description."
  expected: "The title/description text reads back exactly as authored, e.g. He said \"hi\", with no residual backslash-escape sequences."
  actual: "The value round-trips with the JSON escape sequence still literally in the text, e.g. He said \\\"hi\\\" instead of He said \"hi\", everywhere the generator reads that frontmatter and renders it onward."
  affected: "skills/flowcharge/scripts/fc-index.mjs:356 (parseFrontmatter); consumers: kanban.md card generation (fc-index.mjs:1511 card heading ws.title || ws.slug, and :1513 card body ws.description) and --list output (selectRows, fc-index.mjs:976-1014, Title column for every scope except issues, whose titles come from parseIssues); the description-length check (checkShape, fc-index.mjs:502) measures the still-escaped text. index.md's Workstreams table does not show title/description and is unaffected. --whoami renders no frontmatter value and is unaffected. Issue titles in index.md's Open Issues table and --list issues come from parseIssues, which extracts the title from a markdown heading via regex rather than a quoted YAML scalar, so they are not affected by this specific bug."
  environment: ""
  tasks: [TL-2-1dmeiz]
  notes: "Was always present in parseFrontmatter but was unreachable until the --new-ws scaffold writer started using JSON.stringify to escape title and description values, which is when an embedded quote or backslash could first appear in a quoted frontmatter scalar. Correctness / data-fidelity defect, not a security defect."
  ```

- [x] ISS-2-jvahxd. The same un-unescaping quote-strip pattern is duplicated at three more call sites in the frontmatter/issue/task parsers

  ```yaml
  id: ISS-2-jvahxd
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "The identical bare pattern `.replace(/^[\"']|[\"']$/g, '')` — the same un-unescaping quote-strip logic flagged in ISS-1-j2knwc — is duplicated at three further call sites: skills/flowcharge/scripts/fc-index.mjs:353 (array-element values inside parseFrontmatter), :377-379 (status/severity/author inside parseIssues), and :408 (the issues: id list inside parseTasks). The defect is in the shared parsing logic itself, not in any one call site. No writer today JSON.stringifies these particular fields, so this is not yet triggered by any current writer the way ISS-1-j2knwc is, but any future writer, or a hand-edited frontmatter value, that puts an escaped quoted scalar into an array element, status, severity, author, or the issues: list would hit the identical corruption on read."
  steps_to_reproduce:
    - "Hand-edit a frontmatter array element, status, severity, author, or an issues: id-list entry in a workstream, issue-list, or task-list file so the quoted value contains a JSON-style escape sequence, e.g. a backslash or an escaped quote."
    - "Run the generator (fc-index.mjs) to parse that file via parseFrontmatter, parseIssues, or parseTasks."
    - "Inspect the parsed field value and observe the escape sequence is still literally present rather than unescaped."
  expected: "A quoted scalar in any of these fields (array elements, status, severity, author, or the issues: id list) reads back with any JSON-style escaping fully undone, matching the authored value."
  actual: "The value round-trips with the escape sequence still literally in the text, identical in kind to ISS-1-j2knwc, but currently latent because no writer emits an escaped value at these sites yet."
  affected: "skills/flowcharge/scripts/fc-index.mjs:353 (parseFrontmatter array elements), :377-379 (parseIssues status/severity/author), :408 (parseTasks issues: id list)"
  environment: ""
  tasks: [TL-2-1dmeiz]
  notes: "Currently latent/unreachable in practice since no writer emits JSON.stringify-escaped values at these sites today; same root cause as ISS-1-j2knwc. A fix scoped only to title/description would leave this gap open."
  ```
