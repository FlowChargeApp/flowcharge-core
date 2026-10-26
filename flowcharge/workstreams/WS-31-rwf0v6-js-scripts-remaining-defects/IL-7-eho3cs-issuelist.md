---
id: IL-7-eho3cs
type: issuelist
workstream: WS-31-rwf0v6
slug: js-scripts-remaining-defects
title: "Windows script paths, a manifest test date race, a refused --new-ws .gitignore write and the README .gitignore count"
status: done
created: 2026-10-26
updated: 2026-10-26
author: Anthony Koukoullis
depends_on: []
links: []
---

# FlowCharge Issue List

- [x] ISS-23-jp7g43. fc-index.mjs and six release scripts derive their own folder from a file URL pathname, which breaks on Windows

  ```yaml
  id: ISS-23-jp7g43
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "Seven scripts compute their own folder as path.dirname of the decoded pathname of new URL(import.meta.url) rather than through fileURLToPath. A file URL's pathname keeps a slash in front of a Windows drive letter, so every folder and root derived from it is invalid on Windows. run-tests.mjs already derives its own folder through fileURLToPath, and its case 'the suite derives its own folder through fileURLToPath' pins that form for the suite alone."
  steps_to_reproduce:
    - "On Windows, run one of the scripts named under affected, for example node .github/scripts/release.mjs 0.0.1, or run node skills/flowcharge/scripts/test/run-tests.mjs, whose cases copy each of these scripts into a fixture and run it."
    - "Read the folder the script derives from import.meta.url, and every path built from it."
  expected: "Each script derives its own folder through fileURLToPath(import.meta.url), which gives C:\\... on Windows and the same path as the current form on macOS and Linux."
  actual: "For the URL file:///C:/Users/me/proj/.github/scripts/release.mjs the pathname form gives the folder /C:/Users/me/proj/.github/scripts, and two levels up it resolves to C:\\C:\\Users\\me\\proj on a Windows host whose current drive is C:, a path with a drive letter inside it. Every path the release scripts build from that root, CHANGELOG.md, VERSIONING.md, skills/, dist/, the stamper and manifest.mjs that release.mjs spawns, and the working directory of release.mjs's git calls, names a location that does not exist. In fc-index.mjs the realpath of the derived root fails inside a try/catch, so on Windows the suite-version check is skipped without a word even when the generator runs against this repository."
  affected: "skills/flowcharge/scripts/fc-index.mjs:266-269 (SELF_ROOT, read at :1573 and :1576); .github/scripts/build-release-zip.mjs:64-67; .github/scripts/changelog-section.mjs:60-63; .github/scripts/check-release.mjs:56-59; .github/scripts/manifest.mjs:74-77; .github/scripts/release.mjs:72-73 (SELF_DIR and SELF_ROOT; STAMPER and MANIFEST at :75-76 are built from SELF_DIR); .github/scripts/stamp-skill-versions.mjs:48-51"
  environment: "Node >= 16 on Windows."
  tasks: [TL-32-n0k4pn task 1.1, TL-32-n0k4pn task 1.2]
  notes: "Reproduced by evaluating each site's own expression text, read from its file, under Windows path semantics with a Windows file URL: all seven gave a /C:/... folder, while fileURLToPath gave C:\\... for the same URL. No site is provably safe: each derived folder is used as a filesystem path, and run-tests.mjs copies every one of these scripts into a fixture and runs it, so a suite run on Windows exercises all seven. The search covered every tracked script. fc-rename-artefacts.mjs does not use import.meta.url. In setup-labels.mjs, import.meta.url appears only in the entry guard at :215, which derives no path, and :162 reads the host of an https URL. Fix direction: import fileURLToPath from node:url in each of the seven files and derive the folder as path.dirname(fileURLToPath(import.meta.url)). Resolved by TL-32-n0k4pn tasks 1.1 and 1.2: fc-index.mjs and the six release scripts derive their own folder as path.dirname(fileURLToPath(import.meta.url))."
  ```

- [x] ISS-24-fahe4r. The manifest test case's generated-day check races manifest.mjs's clock across local midnight

  ```yaml
  id: ISS-24-fahe4r
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "Case 'manifest: M2 the document has the contracted key order, sorting, version invariant and generated day' asserts that parsed.generated equals today() read after manifest.mjs has run. The script reads its own clock through localDay(), so a run in which the script reads its day just before local midnight and the case reads today() just after it fails. The --sync and --new-ws cases read their start day before the run and accept the day written when it is that start day or the day read afterwards, through writtenDay()."
  steps_to_reproduce:
    - "Run node skills/flowcharge/scripts/test/run-tests.mjs so that the manifest.mjs child of case M2 reads its clock just before local midnight and the case reads today() just after it."
    - "Read the result of case M2."
  expected: "Case M2 accepts the generated day when it is the day the case started or the day it reads after the run, as the --sync and --new-ws cases do, so the check never depends on when the two processes read the clock."
  actual: "Case M2 fails with 'generated is not the local calendar day' and reports a script defect that does not exist."
  affected: "skills/flowcharge/scripts/test/run-tests.mjs:4290-4293 (the generated-day assertion of case M2, :4264-4301), :1023-1032 (writtenDay, the accepting form the --sync and --new-ws cases use); .github/scripts/manifest.mjs:96-97 (localDay) and :238 (generated: localDay())"
  environment: "Node >= 16. Fires only on a run that crosses local midnight."
  tasks: [TL-32-n0k4pn task 2]
  notes: "Reproduced against the current code by running the full suite with only the manifest.mjs child's clock set to one second before the most recent local midnight: case M2 failed on generated 2026-10-25 against today() 2026-10-26, and the other 315 cases passed. M2 is the only case that reads the generated key. Fix direction: read the start day before the run and accept the generated day when it is the start day or the day read afterwards, sharing writtenDay()'s accepting check rather than repeating it. Resolved by TL-32-n0k4pn task 2: case M2 reads its start day before manifest.mjs runs and accepts the generated day through acceptDay, the check writtenDay now shares."
  ```

- [x] ISS-25-nzbdds. A --new-ws run refused for a taken slug still creates or appends to .gitignore

  ```yaml
  id: ISS-25-nzbdds
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "fc-index.mjs writes .gitignore once its last argument parser has run, and only afterwards does the --new-ws block check whether a live or archived workstream folder already carries the slug. A run refused for a taken slug therefore exits 1 after it has created or appended to the project's .gitignore. Every other refused run exits before that write."
  steps_to_reproduce:
    - "In a project root with no .gitignore, create flowcharge/workstreams/WS-1-abcdef-demo/workstream.md."
    - "Run node skills/flowcharge/scripts/fc-index.mjs --root <project-root> --new-ws demo --title Demo."
    - "Read the error, the exit code and the project root's .gitignore."
    - "Repeat with the folder under flowcharge/archive/, and with a .gitignore that holds one unrelated line."
  expected: "The run is refused with exit 1 and writes nothing, .gitignore included, as every other refused run is."
  actual: "The run prints 'slug \"demo\" is already taken by flowcharge/workstreams/WS-1-abcdef-demo/' and exits 1, and .gitignore now exists, holding the managed comment line and the four managed lines. A folder under flowcharge/archive/ gives the same result, and an existing .gitignore gains the same five lines after its own."
  affected: "skills/flowcharge/scripts/fc-index.mjs:1301-1315 (the ensureGitignore call block), :1334-1346 (the slug-collision check inside the --new-ws block, which runs after it)"
  environment: "Node >= 16"
  tasks: [TL-32-n0k4pn task 3]
  notes: "Reproduced against the current code for a live folder, an archived folder and an existing .gitignore. In the same fixture, --new-ws 'bad slug!' and --claim BOGUS exit 1 and write nothing. The refused run claims no id, because the collision check already runs before the claim. Fix direction: run the slug-collision check before the .gitignore write, which also keeps it before the claim. Resolved by TL-32-n0k4pn task 3: the slug-collision check runs before the .gitignore write and before the claim."
  ```

- [x] ISS-26-v95vp1. README.md says Core adds three .gitignore lines, but the generator writes four

  ```yaml
  id: ISS-26-v95vp1
  status: done
  severity: low
  author: Anthony Koukoullis
  description: "README.md's 'Layout in a target project' section says Core adds three .gitignore lines, for the two generated views and the temporary ID-claim markers. fc-index.mjs manages four lines, flowcharge/index.md, flowcharge/kanban.md, flowcharge/ids/ and flowcharge/workstreams/*/.lease, and writes them under one comment line."
  steps_to_reproduce:
    - "Read README.md:163-164."
    - "In a project root with no .gitignore, run node skills/flowcharge/scripts/fc-index.mjs --root <project-root> once, then read .gitignore."
  expected: "README.md states what the generator writes: four .gitignore lines, for the two generated views, the temporary ID-claim markers and the workstream lease files."
  actual: "README.md states three lines and leaves out the workstream lease files. One generator run writes the comment line '# FlowCharge-managed: do not hand-edit (see fc-index.mjs)' and four ignore lines."
  affected: "README.md:163-164; skills/flowcharge/scripts/fc-index.mjs:158-163 (GITIGNORE_COMMENT and GITIGNORE_TARGETS), :125-131 (the --help text, which names the four paths)"
  environment: ""
  tasks: [TL-32-n0k4pn task 4]
  notes: "Reproduced against the current code: one default-mode run in a fixture with no .gitignore wrote the comment line and the four lines. The generator is the right side. The comment above GITIGNORE_TARGETS names four paths, the --help text names all four, and run-tests.mjs pins the lease line in the case 'a writing run appends only the lease line to a .gitignore holding the other three'. Fix direction: correct the README.md sentence and leave the generator unchanged. Resolved by TL-32-n0k4pn task 4: README.md states four .gitignore lines under one comment line, the workstream lease files included."
  ```
