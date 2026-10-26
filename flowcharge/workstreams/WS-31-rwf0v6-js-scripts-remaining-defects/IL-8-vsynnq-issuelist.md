---
id: IL-8-vsynnq
type: issuelist
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "The setup-labels entry guard, a path used as an import specifier, the CONVENTIONS .gitignore count and the tag pool's automatic tags"
status: ready
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [ ] ISS-27-z1hxj3. setup-labels.mjs compares its module URL with a hand-built file URL, so from a path holding a space, through a symlinked folder or on Windows it runs nothing

  ```yaml
  id: ISS-27-z1hxj3
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The entry guard at the end of setup-labels.mjs runs main() only when import.meta.url equals a file URL built by hand from process.argv[1]. Node percent-encodes the module URL and loads the entry module from its real path, while process.argv[1] is the plain absolute path the command named. Any difference in spelling between the two makes the guard false: a path holding a space or another percent-encoded character, a path reached through a symbolic link, and every Windows path, whose module URL reads file:///C:/... while the hand-built string reads file://C:\\.... The script then exits 0 having done nothing, and refuses nothing."
  steps_to_reproduce:
    - "Copy .github/scripts/setup-labels.mjs into a folder whose path holds a space, and run node <that copy> --help."
    - "Run the same copy with an unknown argument: node <that copy> --bogus."
    - "Create a symbolic link to a plain folder that holds a copy, and run node <link>/setup-labels.mjs --help."
    - "Evaluate the guard expression, read from the file, with the module URL and the process.argv[1] Node sets on Windows for C:\\Users\\me\\proj\\.github\\scripts\\setup-labels.mjs."
    - "Run node skills/flowcharge/scripts/test/run-tests.mjs from a checkout whose path holds a space."
  expected: "The script runs main() whenever node was asked to run this file, whatever path spelling reached it: --help prints the usage, an unknown argument is refused with exit 1, and an import of the module still runs nothing."
  actual: "From a path holding a space and through a symlinked folder, --help prints nothing and --bogus exits 0 with no refusal, while the same copy in a plain folder prints the 1423-byte usage and refuses --bogus with exit 1. Under Windows path semantics the guard compares file:///C:/Users/me/proj/.github/scripts/setup-labels.mjs with file://C:\\Users\\me\\proj\\.github\\scripts\\setup-labels.mjs and is false. From a checkout whose path holds a space the suite passes 316 of 320 cases: four of the five setup-labels cases that run the script fail, because it makes no gh call and exits 0, and the fifth, which asserts that no mutating call runs, passes only because nothing runs."
  affected: ".github/scripts/setup-labels.mjs:213-217 (the entry guard and its comment), :16 (the import block)"
  environment: "Node >= 16. A path holding a space or another percent-encoded character, a symlinked folder, or Windows."
  tasks: [TL-33-wf2iiy task 1]
  notes: "Reproduced against the current code in a scratch fixture. The fileURLToPath form the other scripts use, comparing fileURLToPath(import.meta.url) with process.argv[1], fixes the space and Windows cases but still misses a symlinked folder, because Node loads the entry module from its real path. Comparing the real path of the module's own file with the real path of process.argv[1] matches all three cases. realpathSync throws when process.argv[1] names no file, as under node -e with a stray argument or for a script read from stdin, where it is '-', so the comparison sits in a try/catch that reads a throw as not the entry point. Fix direction: import fs from node:fs and fileURLToPath from node:url, and run main() only when fs.realpathSync(fileURLToPath(import.meta.url)) equals fs.realpathSync(process.argv[1])."
  ```

- [ ] ISS-28-40lzir. The setup-labels table case imports the script through a plain path, which fails on Windows and for a folder whose name holds #

  ```yaml
  id: ISS-28-40lzir
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The case 'setup-labels: the table holds exactly six entries, the six required names, capped descriptions, no priority label' builds the module it runs with node --input-type=module -e as an import of LABELS from the JSON-quoted absolute path of setup-labels.mjs. An ESM import specifier is a URL, not a path. On Windows the loader reads C:\\... as a URL whose protocol is c: and refuses it, and on any platform a # in the path starts a URL fragment, so the import names a file that does not exist. The case then fails although the script is correct."
  steps_to_reproduce:
    - "Copy .github/scripts/setup-labels.mjs into a folder named a#b."
    - "Run node --input-type=module -e with the import line built as the case builds it, from the copy's absolute path."
    - "Run the same import with the specifier built from pathToFileURL(<path>).href."
  expected: "The case imports setup-labels.mjs through the file URL of its path, which loads on every platform and for every folder name."
  actual: "The plain-path import from the a#b folder exits 1 with ERR_MODULE_NOT_FOUND, and the same import through pathToFileURL(<path>).href exits 0 and reads the six labels. On Windows, new URL('C:\\Users\\me\\proj\\.github\\scripts\\setup-labels.mjs') parses with the protocol c:, which the ESM loader does not accept."
  affected: "skills/flowcharge/scripts/test/run-tests.mjs:4933 (the import line of that case), :28 (the node:url import)"
  environment: "Node >= 16 on Windows, or a checkout whose path holds #."
  tasks: [TL-33-wf2iiy task 2]
  notes: "Found by the sweep of file-URL and path derivations under skills/ and .github/. This is the only site that builds a module specifier from a path. The suite's own static import of setup-labels.mjs at :30 is a relative specifier resolved against the suite's file URL, and is correct. Fix direction: build the specifier from pathToFileURL(SETUP_LABELS).href, importing pathToFileURL from node:url beside fileURLToPath."
  ```

- [ ] ISS-29-92o4ay. CONVENTIONS.md says the generator keeps three paths out of git, but it writes four

  ```yaml
  id: ISS-29-92o4ay
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "The last paragraph of CONVENTIONS.md's 'The index and the board are generated' section says the generator keeps all three of flowcharge/index.md, flowcharge/kanban.md and flowcharge/ids/ out of git, and appends whichever of the three a project's .gitignore does not cover. fc-index.mjs manages four paths, those three and flowcharge/workstreams/*/.lease, and writes them under its managed comment line."
  steps_to_reproduce:
    - "Read skills/flowcharge/CONVENTIONS.md:435-444."
    - "In a project root with no .gitignore, run node skills/flowcharge/scripts/fc-index.mjs --root <project-root> once, then read .gitignore."
  expected: "CONVENTIONS.md states the four paths the generator keeps out of git, the workstream lease files included, as GITIGNORE_TARGETS in fc-index.mjs lists them."
  actual: "CONVENTIONS.md names three paths and says 'all three'. One default-mode run writes the comment line '# FlowCharge-managed: do not hand-edit (see fc-index.mjs)' and the four lines flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease, from the source generator and from the installed copy alike."
  affected: "skills/flowcharge/CONVENTIONS.md:435-444; skills/flowcharge/scripts/fc-index.mjs:159-164 (the comment, GITIGNORE_COMMENT and GITIGNORE_TARGETS), :126-132 (the --help text, which names the four paths)"
  environment: ""
  tasks: [TL-33-wf2iiy task 3]
  notes: "Reproduced against the current code. The generator is the right side: GITIGNORE_TARGETS, the comment above it and the --help text name four paths, and README.md states four lines. The sweep of every tracked document, skill file and code comment found no other statement of the ignored set or its line count that disagrees with the generator. The records under flowcharge/workstreams/ describe the generator as it stood when each was written. Fix direction: correct the CONVENTIONS.md paragraph and leave the generator unchanged."
  ```

- [ ] ISS-30-fi8uta. This repository's tag pool omits the automatic tags issue and feature, so 18 workstreams draw a tag pool warning

  ```yaml
  id: ISS-30-fi8uta
  status: in-progress
  severity: low
  author: Anthony Koukoullis
  description: "flowcharge/tags.md lists fifteen tags and neither automatic tag, issue or feature. The orchestrator adds those two to a workstream once its folder holds a plan, or an issue list with at least one filed issue, and the generator WARNs on every workstream tag the pool does not list, so every workstream that carries one draws a 'not in the tag pool' warning in --check and in the default run. CONVENTIONS.md's Tag pool rule defines a tag as one the pool lists, says the generator WARNs on any tag not listed, and seeds a missing pool with the automatic tags issue and feature. The generator seeds from AUTO_TAGS, ['issue', 'feature'], for the same purpose. The pool file is the side that disagrees: it predates the seeding."
  steps_to_reproduce:
    - "Copy every tracked file under flowcharge/ into a scratch folder outside any git repository."
    - "Run fc-index.mjs --root <copy> --check, then a default run, and count the lines that hold 'not in the tag pool'."
    - "Append '- feature' and '- issue' to the copy's flowcharge/tags.md and run both again."
  expected: "The pool lists both automatic tags, so neither --check nor the default run prints a tag pool warning for a workstream that carries issue or feature."
  actual: "Both runs print 18 such warnings, 13 for #feature and 5 for #issue, with the source generator and with the installed copy. With the two lines added, both runs print none."
  affected: "flowcharge/tags.md; skills/flowcharge/CONVENTIONS.md:183-190 (the Tag pool rule); skills/flowcharge/scripts/fc-index.mjs:323-325 (AUTO_TAGS), :1530-1563 (the pool read, the seed and the membership WARN)"
  environment: ""
  tasks: [TL-33-wf2iiy task 4]
  notes: "Reproduced against the current code. Exempting the automatic tags in the generator would contradict CONVENTIONS.md, which defines a tag as one the pool lists and warns on any tag not listed, and would leave the seeded entries without a purpose. The sweep found no other tag pool in the repository and no test fixture that carries an automatic tag. Fix direction: add '- feature' and '- issue' to flowcharge/tags.md in its alphabetical order, and pin the two entries in the suite."
  ```
