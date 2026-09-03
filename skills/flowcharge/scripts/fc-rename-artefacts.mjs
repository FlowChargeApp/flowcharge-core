#!/usr/bin/env node
// FlowCharge Core artefact renamer. Renames plan, issue list and task list files under
// flowcharge/ to the ID-prefixed form <id>-<plain name>.md, where <id> is the
// file's own frontmatter id. No dependencies; node >= 16.
//
// Usage:
//   node fc-rename-artefacts.mjs [--root <dir>] [--apply]
//
//   --root <dir>  The directory that holds flowcharge/. Defaults to the current
//                 directory, then resolved to the repository's common root,
//                 exactly as fc-index.mjs resolves it.
//   --apply       Perform the moves. Without it the run reports them and
//                 writes nothing.
//
// Output is one line per artefact file, either "<old>  ->  <new>" for a move
// or "<file>  ok" when the name already complies. A second run over an
// already-renamed tree therefore moves nothing and prints only ok lines.
//
// Exit codes:
//   0  Every file was reported, and every requested move succeeded.
//   1  Bad root, or at least one refusal — a target name already taken, or a
//      move that failed.
//
// Scope: this script knows filenames and the frontmatter id, and nothing else.
// It never edits a file's contents, so every id, depends_on and links value
// stays byte-for-byte as it is. It knows nothing of the generated index, the
// board or the ID registry, and it regenerates none of them. Regenerating
// afterwards is the caller's own, explicit step.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const apply = args.includes('--apply');

let root = process.cwd();
const ri = args.indexOf('--root');
if (ri !== -1 && args[ri + 1]) root = path.resolve(args[ri + 1]);

// Resolved the way fc-index.mjs resolves it, so every git worktree of one
// repository shares one flowcharge/. A directory outside any repository falls
// back to itself rather than throwing.
function resolveProjectRoot(givenRoot) {
  try {
    const out = execFileSync('git',
      ['rev-parse', '--path-format=absolute', '--git-common-dir'],
      { cwd: givenRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return path.dirname(out);
  } catch { return givenRoot; }
}
root = resolveProjectRoot(root);

const workRoot = path.join(root, 'flowcharge');
const wsRoot = path.join(workRoot, 'workstreams');
const archiveRoot = path.join(workRoot, 'archive');

if (!fs.existsSync(wsRoot)) {
  console.error(`fc-rename-artefacts: no flowcharge/workstreams/ directory at ${root}`);
  process.exit(1);
}

// The workstream record keeps its plain name: its folder already carries the
// workstream id, and three separate scanners key on that plain filename as the
// workstream-folder marker. It is skipped by name, before any file is read.
const WORKSTREAM_FILE = 'workstream.md';

// The same enumerated scan filter fc-index.mjs applies, so this script sees
// the files the generator sees and sweeps no unrelated Markdown in.
const ARTEFACT_FILE = /^(?:(?:PLN|IL|TL)-\d+-[0-9a-z]{6}-)?(?:workstream|plan|issuelist|tasklist)(?:-[a-z0-9-]+)?\.md$/;

// The three types that take an id prefix. A record of any other type is left
// alone, whatever its filename.
const PREFIXED_TYPES = new Set(['plan', 'issuelist', 'tasklist']);

// The canonical artefact id, the same shape already embedded in ARTEFACT_FILE
// above. The id becomes part of a filename, so a malformed value must never
// reach a path. Declared here rather than imported from fc-index.mjs, for the
// same reason the frontmatter() helper below is local: the two scripts stay
// independent.
const ARTEFACT_ID = /^(?:PLN|IL|TL)-\d+-[0-9a-z]{6}$/;

// Frontmatter, reduced to the two scalar keys this script reads. Deliberately
// not imported from fc-index.mjs: the two scripts stay independent.
function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (km) fm[km[1]] = km[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

// A non-zero exit is how git reports an untracked path, which is the normal
// case in a project that does not track flowcharge/. It is the untracked signal,
// never an error to report.
function isTracked(abs) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', abs],
      { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch { return false; }
}

// Both paths are needed, because different projects track flowcharge/
// differently. git mv keeps the rename staged; fs.renameSync is the plain
// filesystem move for an untracked file or a project with no repository.
function move(absOld, absNew) {
  if (isTracked(absOld)) {
    execFileSync('git', ['mv', absOld, absNew],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'] });
  } else {
    fs.renameSync(absOld, absNew);
  }
}

const rel = (abs) => path.relative(root, abs);

let refusals = 0;

for (const scanRoot of [wsRoot, archiveRoot]) {
  if (!fs.existsSync(scanRoot)) continue;
  const folders = fs
    .readdirSync(scanRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const folder of folders) {
    const folderPath = path.join(scanRoot, folder);
    const files = fs.readdirSync(folderPath).filter((f) => ARTEFACT_FILE.test(f)).sort();
    for (const f of files) {
      if (f === WORKSTREAM_FILE) continue;
      const abs = path.join(folderPath, f);
      const fm = frontmatter(fs.readFileSync(abs, 'utf8'));
      // No frontmatter, or no id: there is no prefix to build, so the file is
      // left exactly as it is.
      if (!fm || !fm.id) continue;
      // A malformed id is skipped exactly as a missing one is: silently, with
      // no line printed, no refusal counted and no change to the exit code. The
      // check runs before the target name is composed, because the target is
      // built from the id.
      if (!ARTEFACT_ID.test(fm.id)) continue;
      if (fm.type && !PREFIXED_TYPES.has(fm.type)) continue;

      // Only a correct prefix is stripped. Stripping any prefix would let a
      // file whose prefix disagrees with its id be rewritten silently, and
      // stripping none would give an already-correct name a second prefix on
      // the next run, which is what would cost this script its idempotence.
      const plain = f.startsWith(`${fm.id}-`) ? f.slice(fm.id.length + 1) : f;
      const target = `${fm.id}-${plain}`;
      if (f === target) {
        process.stdout.write(`${rel(abs)}  ok\n`);
        continue;
      }

      const absNew = path.join(folderPath, target);
      // Defence in depth behind the id allow-list. It sits before the
      // already-exists probe, so a traversing destination is never even
      // probed, and before move(), because git mv accepts a destination
      // outside the repository just as fs.renameSync does. An empty relative
      // path means the two paths are equal, which is itself an escape; on
      // Windows a drive-absolute value returns an absolute path rather than
      // one starting with `..`, so both are tested too.
      const relNew = path.relative(folderPath, absNew);
      if (relNew === '' || path.isAbsolute(relNew) || relNew.startsWith('..')) {
        console.error(`fc-rename-artefacts: ${rel(abs)}: ${target} resolves outside ${rel(folderPath)} — refusing to move`);
        refusals++;
        continue;
      }
      if (fs.existsSync(absNew)) {
        console.error(`fc-rename-artefacts: ${rel(abs)}: ${target} already exists — refusing to overwrite`);
        refusals++;
        continue;
      }

      if (apply) {
        try {
          move(abs, absNew);
        } catch (e) {
          console.error(`fc-rename-artefacts: ${rel(abs)}: move failed — ${e.message}`);
          refusals++;
          continue;
        }
      }
      process.stdout.write(`${rel(abs)}  ->  ${rel(absNew)}\n`);
    }
  }
}

process.exit(refusals ? 1 : 0);
