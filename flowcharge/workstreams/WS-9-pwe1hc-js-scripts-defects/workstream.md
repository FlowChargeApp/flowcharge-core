---
id: WS-9-pwe1hc
type: workstream
workstream: WS-9-pwe1hc
slug: js-scripts-defects
title: "Defects in this repository's own JavaScript generator scripts"
status: backlog
tags: [correctness, generator]
created: 2026-09-13
updated: 2026-09-13
author: Anthony Koukoullis
depends_on: []
links: []
---
Comprehensive bug audit of this repository's own JavaScript generator/tooling
scripts: `skills/flowcharge/scripts/fc-index.mjs`, `fc-rename-artefacts.mjs`, and
`skills/flowcharge/scripts/test/run-tests.mjs`.

No findings exist yet — this workstream records the request, not a result. When
picked up, run a full bug hunt against these three files (a fresh audit against
this repository's own current code, not carried over from anywhere else), file
whatever it finds as tracked issues, then author fix tasks from those findings.

### Copied from a sibling FlowCharge project's backlog — 2026-09-13

The sibling project's equivalent workstream recorded a similar audit request
against its own copies of these scripts, plus a second, dependent workstream
that was meant to file that audit's 13 findings as issues. Neither the audit's
findings nor the dependent workstream's body ever recorded what those 13 bugs
actually were — the detail lived only in a conversation, not in any file — so
there is nothing substantive to carry over beyond the request itself. This
copy targets this repository's own three script files and starts the audit
fresh; the dependent workstream was not copied.
