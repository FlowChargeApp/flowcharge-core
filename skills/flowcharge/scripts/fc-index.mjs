#!/usr/bin/env node
// FlowCharge Core index/board generator. Scans flowcharge/ frontmatter and rewrites
// index.md + kanban.md. Files are the source of truth; both outputs are
// disposable views. No dependencies; node >= 16.
//
// The HELP constant below is this file's usage documentation and the text
// --help prints, so the interface is recorded in one place, not two.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

// The status --new-ws writes when the caller passes no --status. A record
// created a moment ago is recorded, not yet worked, per CONVENTIONS.md's
// Status lifecycle. HELP interpolates it, so the documented default and the
// applied default cannot drift.
const NEW_WS_STATUS = 'backlog';

const HELP = `fc-index.mjs: the FlowCharge Core index and board generator.

Scans flowcharge/ frontmatter and rewrites flowcharge/index.md and
flowcharge/kanban.md. The artefact files are the source of truth; both
outputs are disposable views. No dependencies; node >= 16.

Usage:
  node fc-index.mjs [--root <dir>] [--no-board]
  node fc-index.mjs [--root <dir>] --check
  node fc-index.mjs [--root <dir>] --sync [--no-board]
  node fc-index.mjs [--root <dir>] --init [--no-board]
  node fc-index.mjs [--root <dir>] --list [<scope>] [--ws <WS-id>]
                                    [--sort <key>] [--desc] [--archived]
  node fc-index.mjs [--root <dir>] --claim <TYPE> [<count>]
  node fc-index.mjs [--root <dir>] --new-ws <slug> --title "<title>"
                                    [--tags a,b] [--status <enum>]
  node fc-index.mjs [--root <dir>] --whoami
  node fc-index.mjs --help

Modes, one per run. With no mode flag the run regenerates. Two mode
flags together print one stderr line and exit 1.

  (default)  Rewrite flowcharge/index.md and flowcharge/kanban.md, and
             rewrite the flowcharge/ids.md header when it is stale. Print
             one WARN line per integrity finding, then one summary line.
             Exits 0 even when it warns.
  --check    Print the same WARN lines and write nothing. Exits 2 when at
             least one warning exists, 0 when none does. When pointed at
             this script's own repository and HEAD carries a release tag
             vX.Y.Z, also compares that tag with the newest CHANGELOG.md
             release heading, and says nothing when HEAD carries no such
             tag or CHANGELOG.md is absent.
  --sync     Close what is mechanically decidable (task lists whose
             tasks are all checked, issue lists with no open issue left,
             and workstreams whose artefacts are all closed) by setting
             status: done and updated: today. Print one SYNC line per
             change, then regenerate as the default mode does. A plan is
             never closed. Accepts --no-board only.
  --init     Create flowcharge/workstreams/ (and, transitively,
             flowcharge/) when it does not already exist, an idempotent
             no-op when it does, then regenerate as the default mode
             does. Refused when combined with --check, --list, --claim,
             --new-ws, --sync, or --whoami. Accepts --no-board only.
  --list     Print a Markdown table of artefacts on stdout. Writes
             nothing. Exits 0.
  --claim    Claim the next <count> id(s) for <TYPE>, atomically, through
             marker directories under flowcharge/ids/. Print only the
             claimed id(s), one per line. Write flowcharge/ids.md back.
             Exits 0.
  --new-ws   Scaffold one workstream: claim a WS id, create
             flowcharge/workstreams/<WS-id>-<slug>/, and write its
             workstream.md with every required key present and valid
             and an empty body. Print the claimed id and the created
             path, one per line. Exits 0.
  --whoami   Print the local git config user.name on one line, for the
             author: key. Prints "unknown" when it is unset or the call
             fails. Local attribution only, not a verified identity.
             Writes nothing. Exits 0.
  --help     Print this text on stdout and exit 0. Takes precedence over
             every other flag. Reads no file and writes no file, so it
             answers in a directory that holds no flowcharge/.

Options:
  --root <dir>      The directory that holds flowcharge/. Defaults to the
                    current directory. The value is then resolved to the
                    repository's common root, so every git worktree of
                    one repository shares one flowcharge/.
  --no-board        Rewrite flowcharge/index.md only and leave
                    flowcharge/kanban.md untouched. For the default mode
                    and for --sync.
  --ws <WS-id>      Restrict --list to one workstream. Takes the full
                    id, suffix included, as in WS-12-a3x9k2. The
                    Workstream column is dropped from the table.
  --desc            Reverse the --sort order. For --list only.
  --archived        Include archived artefacts in --list. They are
                    excluded by default.
  --title "<title>" The workstream title. Required with --new-ws.
  --tags a,b        Comma-separated workstream tags for --new-ws.
                    Default: none.

Values:
  --list <scope>    workstreams | plans | issuelists | tasklists | issues | all
                    Default: workstreams.
  --sort <key>      id | created | updated | status | title | severity
                    Default: id. status sorts in lifecycle order.
                    severity is for --list issues only; created and
                    updated are unavailable there, because issue records
                    carry no dates. Ties break on id ascending.
  --claim <TYPE>    WS | PLN | IL | TL | ISS
  --claim <count>   A positive integer, at most 100. Default: 1.
  --new-ws <slug>   A bare kebab-case slug. The folder created is
                    <WS-id>-<slug>. Refused, with nothing claimed, when
                    a live or archived folder already carries that slug.
  --status <enum>   backlog | ready | in-progress | done | dropped
                    For --new-ws only. Default: ${NEW_WS_STATUS}.

Exit codes:
  0  The run succeeded. --check with no warning exits 0 too.
  1  Invalid arguments, an invalid flag combination, no
     flowcharge/workstreams/ directory under the root (unless --init is
     given, which creates it instead), or a --new-ws slug that is
     already taken.
  2  --check found at least one warning.

.gitignore: every writing mode (the default, --no-board, --sync,
--claim, --new-ws and --init) also appends to the project root's
.gitignore whichever of flowcharge/index.md, flowcharge/kanban.md and
flowcharge/ids/ it does not already cover. Existing lines are never
rewritten or reordered. A failed write is a warning only. --list,
--check, --whoami and --help touch .gitignore no more than they touch
anything else.
`;

function writeAtomic(filePath, content) {
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${crypto.randomUUID()}.tmp`
  );
  try {
    fs.writeFileSync(tmpPath, content);
    fs.renameSync(tmpPath, filePath);
  } catch (e) {
    try { fs.unlinkSync(tmpPath); } catch { /* tmp may not exist yet, ignore */ }
    throw e;
  }
}

// The SUFFIX half of every id: exactly 6 lowercase base-36 characters, one
// CSPRNG draw per character. Lowercase only, so a folder name embedding an id
// means the same thing on a case-sensitive and a case-insensitive filesystem.
const SUFFIX_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
function randomSuffix() {
  let s = '';
  for (let i = 0; i < 6; i++) s += SUFFIX_ALPHABET[crypto.randomInt(SUFFIX_ALPHABET.length)];
  return s;
}

// The three flowcharge/ paths this script regenerates or owns outright. They are
// disposable views and ephemeral claim markers, so they are never worth
// tracking and always worth keeping out of a merge.
const GITIGNORE_COMMENT = '# FlowCharge-managed: do not hand-edit (see fc-index.mjs)';
const GITIGNORE_TARGETS = ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids/'];
// A target needs no line of its own when a broader pattern already covers it:
// a bare flowcharge/ (or flowcharge) covers all three, and a bare flowcharge/ids/ (or
// flowcharge/ids) covers the marker directory alone.
const GITIGNORE_COVERS = {
  'flowcharge/index.md': ['flowcharge/index.md', 'flowcharge/', 'flowcharge'],
  'flowcharge/kanban.md': ['flowcharge/kanban.md', 'flowcharge/', 'flowcharge'],
  'flowcharge/ids/': ['flowcharge/ids/', 'flowcharge/ids', 'flowcharge/', 'flowcharge'],
};

// Append-only: every pre-existing line is copied through unchanged and in its
// original order, and an already-compliant file is not touched at all, so its
// mtime and git status stay where they were.
function ensureGitignore(gitignoreRoot) {
  const gitignorePath = path.join(gitignoreRoot, '.gitignore');
  const exists = fs.existsSync(gitignorePath);
  const text = exists ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const lines = text.split(/\r?\n/);
  const missing = GITIGNORE_TARGETS.filter(
    (target) => !GITIGNORE_COVERS[target].some((form) => lines.includes(form)),
  );
  if (missing.length === 0) return;
  if (!exists) {
    writeAtomic(gitignorePath, `${[GITIGNORE_COMMENT, ...GITIGNORE_TARGETS].join('\n')}\n`);
    return;
  }
  const head = text.replace(/\n?$/, '\n');
  const comment = lines.includes(GITIGNORE_COMMENT) ? '' : `${GITIGNORE_COMMENT}\n`;
  writeAtomic(gitignorePath, `${head}${comment}${missing.join('\n')}\n`);
}

const args = process.argv.slice(2);

// --help before everything: before --root, before the git call in
// resolveProjectRoot(), before the missing-flowcharge/ exit and before
// ensureGitignore(). Help must answer in a directory that holds no
// flowcharge/, and must write nothing. A parseHelpArgs() that refused
// combination, mirroring parseWhoamiArgs(), was rejected on purpose:
// --help --check would then print an error instead of the help the
// caller asked for, which is the failure this flag exists to fix.
if (args.includes('--help')) {
  process.stdout.write(HELP);
  process.exit(0);
}

let root = process.cwd();
const ri = args.indexOf('--root');
if (ri !== -1 && args[ri + 1]) root = path.resolve(args[ri + 1]);

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

// Local attribution, not a verified identity: whatever this machine's own git
// config says. Falls back to the literal string "unknown" (never an empty
// string, never a thrown error), so a missing or broken local git identity
// never blocks a claim or an authoring step, the same way resolveProjectRoot()
// above falls back to its given root rather than throwing.
// The author key is written unquoted, so a name holding a line break or any
// other control character would forge a frontmatter key. Stripping the class,
// rather than quoting the value, keeps the generated record byte-identical for
// an ordinary name.
function readGitAuthor(forRoot) {
  try {
    return execFileSync('git', ['config', 'user.name'],
      { cwd: forRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).replace(/[\u0000-\u001F\u007F]/g, '').trim() || 'unknown';
  } catch { return 'unknown'; }
}

const noBoard = args.includes('--no-board');
const checkOnly = args.includes('--check');

const workRoot = path.join(root, 'flowcharge');
const wsRoot = path.join(workRoot, 'workstreams');
const archiveRoot = path.join(workRoot, 'archive');
const indexPath = path.join(workRoot, 'index.md');
const boardPath = path.join(workRoot, 'kanban.md');
const registryPath = path.join(workRoot, 'ids.md');
const tagPoolPath = path.join(workRoot, 'tags.md');
const idsDir = path.join(workRoot, 'ids');

// This script's own repository root, derived from its own file location
// rather than from --root: the suite-version check below must always read
// this repository's tag and CHANGELOG.md, never a consumer project's, no
// matter what --root points at.
const SELF_ROOT = path.resolve(
  path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)),
  '..', '..', '..',
);

// --init runs its mutual-exclusion check here, immediately after --help,
// because it must run before or instead of this guard: the artefact scan
// a few hundred lines below already depends on wsRoot existing, so a
// combination with another mode flag must be refused before that scan,
// not inside that mode's own parse*Args() function.
const initMode = args.includes('--init');
if (initMode) {
  const OTHER_MODE_FLAGS = ['--check', '--list', '--claim', '--new-ws', '--sync', '--whoami'];
  if (OTHER_MODE_FLAGS.some((f) => args.includes(f))) {
    console.error('fc-index: --init cannot be combined with --check, --list, --claim, --new-ws, --sync, or --whoami');
    process.exit(1);
  }
  // Idempotent: a no-op when wsRoot already exists, live or empty, and it
  // never inspects or touches anything already inside it.
  fs.mkdirSync(wsRoot, { recursive: true });
} else if (!fs.existsSync(wsRoot)) {
  console.error(`fc-index: no flowcharge/workstreams/ directory at ${root}`);
  process.exit(1);
}

// Self-enforcing: a clone never has to remember to gitignore the generated and
// ephemeral paths, because every writing invocation ensures them. --list,
// --check and --whoami are documented as write-free, so they are excluded on
// flag presence in argv alone, not on which mode ultimately runs or succeeds.
// A write failure is a warning only: it must not change the exit code, and
// must not stop the claimed ids printing or the index and board regenerating.
if (!args.includes('--list') && !args.includes('--check') && !args.includes('--whoami')) {
  try {
    ensureGitignore(root);
  } catch (e) {
    console.error(`fc-index: warning, failed to update .gitignore: ${e.message}`);
  }
}

const warnings = [];
const STATUSES = ['backlog', 'ready', 'in-progress', 'done', 'dropped'];
const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const STALE_DAYS = 14;
// `updated` is bumped on every edit, but a file's mtime also moves for reasons
// no edit caused: a copy, a checkout, a formatter. The two are therefore
// compared at day granularity, with this much slack before the drift is
// reported.
const UPDATED_GRACE_DAYS = 1;
// A marker directory under flowcharge/ids/ legitimately carries no artefact for
// the minutes between --claim and the authoring agent's return, and the
// generator runs at every stage boundary inside that window. A claim is
// therefore only reported as orphaned once it is this old: long enough to
// cover any single run, short enough to surface a leaked claim the next day.
const ORPHAN_GRACE_DAYS = 1;
// The board truncates a workstream's card description at this width, so a
// longer first body line loses its tail on the board.
const CARD_DESC_MAX = 200;
// A workstream lease held past this many minutes is reported as stale. The
// value SKILL.md publishes as LEASE_STALE_MINUTES; the two must not drift.
const LEASE_STALE_MINUTES = 60;
// An undefined tag names a pool entry as its likely intent only when it sits
// this close to one. The check is deliberately literal: a typo backstop, not
// a synonym finder. Choosing a tag by meaning is the authoring flows' job.
const TAG_NEAR_MAX = 2;

// The ids.md header text, owned by this script and defined exactly once.
// Three paths use it: the seeding write in the --claim block, the default-mode
// rewrite of a stale header, and the --check warning that reports the same
// mismatch and writes nothing. CONVENTIONS.md's documented example reproduces
// this string, so the documentation and the generated file cannot drift apart.
const REGISTRY_HEADER = '# FlowCharge ID Registry\n\n'
  + 'Last-issued ID per type. To claim IDs, run node <skills-dir>/flowcharge/scripts/fc-index.mjs'
  + ' --root <project-root> --claim <TYPE> [<count>] and use the printed id(s) verbatim.\n\n';

// The counter lines are the user's data and are carried down byte-for-byte;
// everything above the first of them is the header this script owns. Returns
// the rewritten file text, or null when nothing is to be done: either the
// header already matches, so a correct registry is never touched, or the file
// carries no counter line at all, in which case there is nothing to preserve
// and the absent counters are reported by the registry-drift check instead.
function registryHeaderRewrite(text) {
  const m = text.match(/^- (?:WS|PLN|IL|TL|ISS):[ \t]*\d+/m);
  if (!m) return null;
  if (text.slice(0, m.index) === REGISTRY_HEADER) return null;
  return REGISTRY_HEADER + text.slice(m.index);
}

// Two-digit zero padding for calendar fields.
const pad2 = (n) => String(n).padStart(2, '0');

// The local calendar day as YYYY-MM-DD: the value `date +%F` prints on this host.
const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// A closed status: the two terminal values. This generator never reopens a
// closed record. It only warns about one that still owns open work or still
// carries a blocked reason. The rule that does reopen a record lives in
// flowcharge/SKILL.md, and a person applies it.
const isClosedStatus = (s) => s === 'done' || s === 'dropped';

// Undoes JSON.stringify's escaping on a double-quoted scalar (the only
// form this file's writers emit) and falls back to the bare quote-strip
// below when the value is not valid JSON, e.g. a hand-edited value or a
// single-quoted YAML scalar. An unquoted value is returned unchanged.
function unquoteScalar(v) {
  if (v.startsWith('"') && v.endsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      // not valid JSON (hand-edited or malformed) — fall through to strip
    }
  }
  return v.replace(/^["']|["']$/g, '');
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!km) continue;
    let v = km[2].trim();
    if (v.startsWith('[')) {
      const inner = v.replace(/^\[/, '').replace(/\]$/, '').trim();
      fm[km[1]] = inner
        ? inner.split(',').map((s) => unquoteScalar(s.trim())).filter(Boolean)
        : [];
    } else {
      fm[km[1]] = unquoteScalar(v);
    }
  }
  return fm;
}

// Per-issue records: heading line then indented YAML block.
function parseIssues(text, file) {
  const issues = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^- \[( |x)\] (ISS-\d+-[0-9a-z]{6})\.\s*(.*)$/);
    if (!h) continue;
    const issue = { id: h[2], checked: h[1] === 'x', title: h[3].trim(), status: '', severity: '', author: '', file };
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].match(/^- \[/) || lines[j].match(/^#/)) break;
      const sm = lines[j].match(/^\s+status:\s*(\S+)/);
      const vm = lines[j].match(/^\s+severity:\s*(\S+)/);
      // author is plaintext and may contain spaces, so it captures the rest of
      // the line rather than one non-space token.
      const am = lines[j].match(/^\s+author:\s*(.+)/);
      if (sm && !issue.status) issue.status = unquoteScalar(sm[1]);
      if (vm && !issue.severity) issue.severity = unquoteScalar(vm[1]);
      if (am && !issue.author) issue.author = unquoteScalar(am[1].trim());
    }
    issues.push(issue);
  }
  return issues;
}

// Task-tracker lines only: "- [ ] N." (parent/adult), "  - [ ] N.M" (child).
// Returns the open/total counts the index and --list render, plus one item per
// task carrying its number as written and the ids of its issues: key. An
// issues: entry belongs to the last task line seen above it, which is how the
// key is written in task YAML; an empty array contributes no id.
function parseTasks(text) {
  let open = 0, total = 0;
  const items = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const t = line.match(/^- \[( |x)\] (\d+)\./) || line.match(/^\s{2}- \[( |x)\] (\d+\.\d+)/);
    if (t) {
      total++;
      if (/\[ \]/.test(line.slice(0, 8))) open++;
      current = { n: t[2], issues: [] };
      items.push(current);
      continue;
    }
    if (!current) continue;
    const im = line.match(/^\s+issues:\s*\[(.*)\]\s*$/);
    if (im) {
      for (const id of im[1].split(',')) {
        const v = unquoteScalar(id.trim());
        if (v) current.issues.push(v);
      }
    }
  }
  return { open, total, items };
}

// ---- schema and shape ------------------------------------------------------
// CONVENTIONS.md's frontmatter schema and its file/folder/body shape rules, as
// data and two small functions. requiredKeys knows the schema and nothing about
// files or warnings; checkShape knows one artefact record and neither the ID
// graph nor the registry, and reads no file.

const REQUIRED_KEYS_COMMON = [
  'id', 'type', 'workstream', 'slug', 'title', 'status', 'created', 'updated',
  'depends_on', 'links',
];
// base_commit is deliberately absent: CONVENTIONS.md requires it only wherever a
// SEARCH/REPLACE block appears, which is a body-dependent condition, while this
// table covers unconditional keys only.
const REQUIRED_KEYS_EXTRA = { workstream: ['tags'], tasklist: ['mode'] };
const TASKLIST_MODES = ['spec', 'diff'];

function requiredKeys(type) {
  return [...REQUIRED_KEYS_COMMON, ...(REQUIRED_KEYS_EXTRA[type] || [])];
}

// The filenames CONVENTIONS.md allows per type. Issue lists and task lists take
// an optional -<qualifier> suffix for extras; workstream records and plans do
// not. A type outside this table has no rule and is left alone.
const FILENAME_RULES = {
  workstream: { allowed: ['workstream.md'], re: /^workstream\.md$/ },
  plan: {
    allowed: ['<PLN-id>-plan.md'],
    re: /^(?:PLN-\d+-[0-9a-z]{6}-)?plan\.md$/,
    legacy: /^plan\.md$/,
  },
  issuelist: {
    allowed: ['<IL-id>-issuelist.md', '<IL-id>-issuelist-<qualifier>.md'],
    re: /^(?:IL-\d+-[0-9a-z]{6}-)?issuelist(-.+)?\.md$/,
    legacy: /^issuelist(-.+)?\.md$/,
  },
  tasklist: {
    allowed: ['<TL-id>-tasklist.md', '<TL-id>-tasklist-<qualifier>.md'],
    re: /^(?:TL-\d+-[0-9a-z]{6}-)?tasklist(-.+)?\.md$/,
    legacy: /^tasklist(-.+)?\.md$/,
  },
};

// The card description the board lifts: the first non-empty, non-heading body
// line, trimmed. Selected exactly the way the board selects it below, so the
// check and the board can never disagree about which line is the description.
const firstBodyLine = (body) =>
  body.split(/\r?\n/).map((l) => l.trim()).find((l) => l && !l.startsWith('#')) || '';

// Shape rules decidable from one artefact record alone: its filename, and for a
// workstream its folder name and its card-description line. Returns the warning
// strings rather than pushing them, so it stays free of shared state.
function checkShape(a) {
  const out = [];
  const rule = FILENAME_RULES[a.type];
  if (rule && !rule.re.test(a.basename)) {
    out.push(`${a.file}: filename not allowed for type "${a.type}" (expected: ${rule.allowed.join(', ')})`);
  }
  // The bare form stays valid and stays indexed; it is only warned about, so a
  // tree that has not been migrated yet still indexes cleanly apart from these
  // lines. A legacy name carries no prefix, so it can never also trip the
  // prefix-disagreement check below.
  if (rule && rule.legacy && rule.legacy.test(a.basename)) {
    out.push(`${a.file}: legacy filename: rename to ${a.id}-${a.basename} to carry its id`);
  }
  const foundPrefix = (a.basename.match(/^((?:PLN|IL|TL)-\d+-[0-9a-z]{6})-/) || [])[1];
  if (foundPrefix && foundPrefix !== a.id) {
    out.push(`${a.id} (${a.file}): filename id-prefix "${foundPrefix}" disagrees with frontmatter id "${a.id}"`);
  }
  if (a.type !== 'workstream') return out;
  // A record with no slug key falls back to its folder name, which would make
  // the comparison compare the folder against itself plus a prefix. The missing
  // key is already reported on its own, so the folder rule stays quiet there.
  if (a.fmKeys.has('slug')) {
    const expected = `${a.id}-${a.slug}`;
    if (a.dir !== expected) {
      out.push(`${a.id} (${a.file}): folder "${a.dir}" should be "${expected}" per its id and slug`);
    }
  }
  const first = firstBodyLine(a.body);
  if (!first) out.push(`${a.id} (${a.file}): body has no card-description line`);
  else if (first.length > CARD_DESC_MAX) {
    out.push(`${a.id} (${a.file}): first body line is ${first.length} characters: the board shows only ${CARD_DESC_MAX}`);
  }
  // fmKeys is what separates an absent key from an empty one: a record with no
  // blocked key is simply not blocked, while a present-but-empty one carries no
  // reason and is a defect. A whitespace-only value trims to empty and is caught
  // here too, because the record field is trimmed at scan time.
  if (a.fmKeys.has('blocked') && !a.blocked) {
    out.push(`${a.id} (${a.file}): blocked is present but empty: give the reason or remove the key`);
  }
  return out;
}

// ---- --list mode -----------------------------------------------------------
// Read-only artefact listing. Nothing in this region writes a file.
const LIST_SCOPES = ['workstreams', 'plans', 'issuelists', 'tasklists', 'issues', 'all'];
const SCOPE_TYPE = { plans: 'plan', issuelists: 'issuelist', tasklists: 'tasklist' };
const SCOPE_LABEL = { workstreams: 'Workstreams', plans: 'Plans', issuelists: 'Issue lists', tasklists: 'Task lists', issues: 'Issues', all: 'Artefacts' };
const SORT_KEYS = ['id', 'created', 'updated', 'status', 'title', 'severity'];

function parseListArgs(argv) {
  const li = argv.indexOf('--list');
  if (li === -1) return null;
  const die = (msg) => { console.error(`fc-index: ${msg}`); process.exit(1); };
  if (argv.includes('--check') || argv.includes('--no-board') || argv.includes('--claim')) die('--list cannot be combined with --check, --no-board, or --claim');
  const next = argv[li + 1];
  const scope = next && !next.startsWith('--') ? next : 'workstreams';
  if (!LIST_SCOPES.includes(scope)) die(`unknown --list scope "${scope}" (expected: ${LIST_SCOPES.join(', ')})`);
  const si = argv.indexOf('--sort');
  const sortKey = si !== -1 && argv[si + 1] && !argv[si + 1].startsWith('--') ? argv[si + 1] : 'id';
  if (!SORT_KEYS.includes(sortKey)) die(`unknown --sort key "${sortKey}" (expected: ${SORT_KEYS.join(', ')})`);
  if (scope === 'issues' && (sortKey === 'created' || sortKey === 'updated')) {
    die(`--sort ${sortKey} is unavailable for --list issues: issue records carry no dates; use id, title, status or severity`);
  }
  if (sortKey === 'severity' && scope !== 'issues') die('--sort severity is only available for --list issues');
  const wi = argv.indexOf('--ws');
  const wsId = wi !== -1 && argv[wi + 1] && !argv[wi + 1].startsWith('--') ? argv[wi + 1] : '';
  if (wsId && !workstreams.some((w) => w.id === wsId)) die(`unknown --ws id "${wsId}": no workstream record with that id`);
  return { scope, wsId, sortKey, desc: argv.includes('--desc'), archived: argv.includes('--archived') };
}

// Returns null if --claim absent. Otherwise { type, count }, or exits via
// die() on invalid input. Mirrors parseListArgs' shape and die() style.
const CLAIM_TYPES = ['WS', 'PLN', 'IL', 'TL', 'ISS'];
// Upper bound on a single --claim run. Each claimed id costs one mkdirSync
// under flowcharge/ids/, and every later scan walks that tree, so an unbounded
// count outlives the process. Documented in HELP's --claim <count> line.
const CLAIM_MAX = 100;

function parseClaimArgs(argv) {
  const ci = argv.indexOf('--claim');
  if (ci === -1) return null;
  const die = (msg) => { console.error(`fc-index: ${msg}`); process.exit(1); };
  if (argv.includes('--list') || argv.includes('--check') || argv.includes('--no-board')) {
    die('--claim cannot be combined with --list, --check, or --no-board');
  }
  const type = argv[ci + 1];
  if (!type || !CLAIM_TYPES.includes(type)) {
    die(`unknown --claim type "${type || ''}" (expected: ${CLAIM_TYPES.join(', ')})`);
  }
  const next = argv[ci + 2];
  let count = 1;
  if (next !== undefined && !next.startsWith('--')) {
    if (!/^\d+$/.test(next)) die(`invalid --claim count "${next}" (expected a positive integer)`);
    const n = Number(next);
    if (!Number.isInteger(n) || n <= 0) die(`invalid --claim count "${next}" (expected a positive integer)`);
    if (n > CLAIM_MAX) die(`invalid --claim count "${next}" (expected a positive integer, at most ${CLAIM_MAX})`);
    count = n;
  }
  return { type, count };
}

// Returns null if --sync absent, {} otherwise, or exits via die() on an
// invalid combination. Mirrors parseClaimArgs' shape and die() style. --sync
// is a fall-through mode, not an early exit: it applies its closes and the run
// continues into the integrity checks and the index/board writes, so one
// command both closes and regenerates. --no-board is the one flag it accepts.
function parseSyncArgs(argv) {
  if (!argv.includes('--sync')) return null;
  const die = (msg) => { console.error(`fc-index: ${msg}`); process.exit(1); };
  if (argv.includes('--list') || argv.includes('--check') || argv.includes('--claim')) {
    die('--sync cannot be combined with --list, --check, or --claim');
  }
  return {};
}

// Returns null if --new-ws absent. Otherwise
// { slug, title, tags, status }, or exits via die() on invalid
// input. Mirrors parseClaimArgs' shape and die() style.
function parseNewWsArgs(argv) {
  const ni = argv.indexOf('--new-ws');
  if (ni === -1) return null;
  const die = (msg) => { console.error(`fc-index: ${msg}`); process.exit(1); };
  if (argv.includes('--list') || argv.includes('--claim') || argv.includes('--check') || argv.includes('--sync')) {
    die('--new-ws cannot be combined with --list, --claim, --check, or --sync');
  }
  const slug = argv[ni + 1];
  if (!slug || slug.startsWith('--')) die('--new-ws requires a <slug> argument');
  // The slug is the only untrusted part of the folder name and of the record
  // path, so a strict kebab-case allow-list, the same character class the tag
  // pool uses, is what actually closes the traversal. Checked here, before any
  // id is claimed, so a refused run leaves no orphan marker directory behind.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    die(`invalid --new-ws slug "${slug}" (expected kebab-case: [a-z0-9] words joined by single hyphens)`);
  }
  // A line break is what lets an injected line become a real frontmatter key
  // (parseFrontmatter is line-based and last-value-wins) and what lets a bare
  // `---` line close the block early, because the frontmatter block regex is
  // lazy. The whole C0 range and DEL are refused rather than only CR and LF: a
  // vertical tab or a form feed is no safer inside a YAML double-quoted scalar.
  const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
  const ti = argv.indexOf('--title');
  const title = ti === -1 ? undefined : argv[ti + 1];
  if (!title || title.startsWith('--')) die('--new-ws requires --title "<title>"');
  if (CONTROL_CHARS.test(title)) {
    die('--title must not hold a line break or any other control character');
  }
  const gi = argv.indexOf('--tags');
  const tagsRaw = gi !== -1 && argv[gi + 1] && !argv[gi + 1].startsWith('--') ? argv[gi + 1] : '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
  // Tags are written unquoted inside an inline array, so they carry no quoting
  // of their own: every entry must match the tag pool's own character class.
  for (const tag of tags) {
    if (!/^[a-z0-9-]+$/.test(tag)) {
      die(`invalid --tags entry "${tag}" (expected the tag pool character class: [a-z0-9-])`);
    }
  }
  let status = NEW_WS_STATUS;
  const si = argv.indexOf('--status');
  if (si !== -1) {
    status = argv[si + 1];
    if (!status || !STATUSES.includes(status)) {
      die(`unknown --status "${status || ''}" (expected: ${STATUSES.join(', ')})`);
    }
  }
  return { slug, title, tags, status };
}

// Returns null if --whoami absent, {} otherwise, or exits via die() on an
// invalid combination. Mirrors parseSyncArgs' shape and die() style. --whoami
// is its own flag rather than an addition to --claim's output, because
// --claim's contract is "prints only the claimed id(s), one per line" and
// every caller depends on that exact shape.
function parseWhoamiArgs(argv) {
  if (!argv.includes('--whoami')) return null;
  const die = (msg) => { console.error(`fc-index: ${msg}`); process.exit(1); };
  if (argv.includes('--list') || argv.includes('--check') || argv.includes('--claim')
    || argv.includes('--sync') || argv.includes('--new-ws')) {
    die('--whoami cannot be combined with --list, --check, --claim, --sync, or --new-ws');
  }
  return {};
}

// ---- ID allocation ---------------------------------------------------------
// The atomic claim CONVENTIONS.md documents: the next number is the maximum of
// three sources, and a marker directory created with mkdir *without* the
// recursive flag is the lock. EEXIST means that exact id is already taken, so
// a fresh suffix is drawn at the same number and the claim is retried. One
// implementation, shared by --claim and --new-ws,
// rather than two copies that could drift apart. Returns the claimed ids and
// the next free number, which sits one past the last successful claim.
function allocateIds(type, count) {
  // Registry source: parse ids.md with the same regex the registry-drift
  // check uses. 0 if the file is missing or has no line for type.
  let registrySource = 0;
  if (fs.existsSync(registryPath)) {
    const regText = fs.readFileSync(registryPath, 'utf8');
    for (const m of regText.matchAll(/^- (WS|PLN|IL|TL|ISS):\s*(\d+)/gm)) {
      if (m[1] === type) registrySource = Math.max(registrySource, parseInt(m[2], 10));
    }
  }

  // Scan source: the highest type-N already present in byId. 0 if none.
  let scanSource = 0;
  for (const id of byId.keys()) {
    const m = id.match(/^(WS|PLN|IL|TL|ISS)-(\d+)-[0-9a-z]{6}$/);
    if (m && m[1] === type) scanSource = Math.max(scanSource, parseInt(m[2], 10));
  }

  // Marker-directory source: the highest type-N among entries of
  // flowcharge/ids/. 0 if the directory doesn't exist yet or has no match.
  let markerSource = 0;
  if (fs.existsSync(idsDir)) {
    const markerRe = new RegExp(`^${type}-(\\d+)-[0-9a-z]{6}$`);
    for (const entry of fs.readdirSync(idsDir)) {
      const m = entry.match(markerRe);
      if (m) markerSource = Math.max(markerSource, parseInt(m[1], 10));
    }
  }

  // Ensure flowcharge/ids/ exists, after computing the marker-directory
  // source (so an absent directory correctly contributes 0) and before the
  // claim loop. recursive: true makes this call itself race-safe.
  fs.mkdirSync(idsDir, { recursive: true });

  let n = Math.max(registrySource, scanSource, markerSource) + 1;
  const claimed = [];
  for (let i = 0; i < count; i++) {
    while (true) {
      const suffix = randomSuffix();
      const id = `${type}-${n}-${suffix}`;
      try {
        fs.mkdirSync(path.join(idsDir, id)); // no recursive flag
        claimed.push(id);
        n++;
        break;
      } catch (e) {
        if (e.code === 'EEXIST') continue; // suffix taken, redraw it at the same number
        throw e; // unexpected I/O error, not swallowed
      }
    }
  }
  return { claimed, next: n };
}

// ---- ID graph --------------------------------------------------------------
// The checks that need the whole ID graph rather than one record: a claimed id
// nothing carries, a registry counter ahead of every source that could justify
// it, and the two cross-reference keys (links: in frontmatter and issues: on a
// task line). It reads no artefact file: every record it needs is already in
// artefacts and byId, and its only filesystem access is listing idsDir, the one
// source with no other representation. Returns the warning strings rather than
// pushing them, the way checkShape does.
const ageInDays = (d) => {
  const n = Math.floor(d);
  return `${n} day${n === 1 ? '' : 's'}`;
};

function checkIds(artefacts, byId, idsDir, registry) {
  const out = [];
  const now = Date.now();

  // Marker directories: the orphans, and the highest number claimed per type.
  const markerMax = {};
  if (fs.existsSync(idsDir)) {
    for (const entry of fs.readdirSync(idsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
      if (!entry.isDirectory()) continue;
      const m = entry.name.match(/^(WS|PLN|IL|TL|ISS)-(\d+)-[0-9a-z]{6}$/);
      if (!m) continue;
      markerMax[m[1]] = Math.max(markerMax[m[1]] || 0, parseInt(m[2], 10));
      // byId holds issue ids alongside artefact ids, so an ISS-N marker
      // resolves against its issue record rather than against frontmatter.
      if (byId.has(entry.name)) continue;
      const age = (now - fs.statSync(path.join(idsDir, entry.name)).mtimeMs) / 86400000;
      if (age > ORPHAN_GRACE_DAYS) {
        out.push(`flowcharge/ids/${entry.name}: claimed ${ageInDays(age)} ago but no artefact carries it`);
      }
    }
  }

  // Counters ahead of both other sources. A counter with no artefact but a
  // matching marker is a claim in flight, not drift, so the marker counts. The
  // opposite drift, a counter behind, is reported by the registry check.
  for (const type of CLAIM_TYPES) {
    const counter = registry[type];
    if (counter === undefined) continue; // a missing counter line is reported on its own
    let scanMax = 0;
    for (const id of byId.keys()) {
      const m = id.match(/^(WS|PLN|IL|TL|ISS)-(\d+)-[0-9a-z]{6}$/);
      if (m && m[1] === type) scanMax = Math.max(scanMax, parseInt(m[2], 10));
    }
    if (counter > scanMax && counter > (markerMax[type] || 0)) {
      out.push(`ids.md: ${type} counter is ${counter} but no ${type}-${counter} artefact or marker exists`);
    }
  }

  for (const a of artefacts) {
    for (const target of a.links) {
      if (!byId.has(target)) out.push(`${a.id} (${a.file}): links unknown id ${target}`);
    }
    if (a.type !== 'tasklist' || !a.tasks) continue;
    for (const t of a.tasks.items) {
      for (const target of t.issues) {
        if (!byId.has(target)) out.push(`${a.id} (${a.file}) task ${t.n}: issues unknown id ${target}`);
      }
    }
  }
  return out;
}

// ---- leases ----------------------------------------------------------------
// A lease is one file in one workstream folder, so this check knows nothing
// else: not the ID graph, not the registry, not the artefact records. It
// reports and never deletes. Acquiring and releasing a lease stays in
// SKILL.md, and a lease the generator removed would be a lock removed by a
// process that never held it.
const ageInMinutes = (ms) => {
  const n = Math.floor(ms / 60000);
  return `${n} minute${n === 1 ? '' : 's'}`;
};

function checkLeases(wsDirs) {
  const out = [];
  const now = Date.now();
  for (const dir of wsDirs) {
    const leasePath = path.join(wsRoot, dir, '.lease');
    if (!fs.existsSync(leasePath)) continue;
    const text = fs.readFileSync(leasePath, 'utf8');
    const session = (text.match(/^session:[ \t]*(.*)$/m) || ['', ''])[1].trim();
    const acquired = (text.match(/^acquired:[ \t]*(.*)$/m) || ['', ''])[1].trim();
    const at = Date.parse(acquired);
    // A lease the running session holds is fresh and correct, so it is the age
    // that fires, never the presence. An unparseable timestamp yields no age at
    // all: it is reported by neither branch rather than crashing the run.
    if (Number.isNaN(at)) continue;
    const age = now - at;
    if (age > LEASE_STALE_MINUTES * 60000) {
      out.push(`flowcharge/workstreams/${dir}/.lease: held by session ${session} for ${ageInMinutes(age)}, stale`);
    }
  }
  return out;
}

// Suite-version model: the suite carries one version, authored by hand in two
// places that must agree: the newest "## X.Y.Z" heading in CHANGELOG.md, and
// the annotated tag vX.Y.Z at the release commit (the tag carries the leading
// v, CHANGELOG.md does not). At release time the same value is also stamped
// into every SKILL.md's metadata.version by stamp-skill-versions.mjs, a
// mirror copy that is never independent and never derived from the skills
// themselves. The maintainer chooses the release number by hand and types it
// twice: into CHANGELOG.md, and as the argument to the release command,
// which makes the tag and drives the stamping script itself. The
// human-facing release procedure lives in this repository's own
// CONTRIBUTING.md.
function checkSuiteVersion(selfRoot) {
  let tagVersion;
  try {
    const out = execFileSync('git', ['tag', '--points-at', 'HEAD'],
      { cwd: selfRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const matches = out.split('\n')
      .map((line) => line.match(/^v(\d+\.\d+\.\d+)$/))
      .filter(Boolean);
    if (matches.length !== 1) return [];
    tagVersion = matches[0][1];
  } catch {
    return [];
  }

  let changelogText;
  try {
    changelogText = fs.readFileSync(path.join(selfRoot, 'CHANGELOG.md'), 'utf8');
  } catch {
    return [`CHANGELOG.md: no "## X.Y.Z" release heading found`];
  }
  const headingMatch = changelogText.match(/^## (\d+\.\d+\.\d+)/m);
  if (!headingMatch) {
    return [`CHANGELOG.md: no "## X.Y.Z" release heading found`];
  }
  const changelogVersion = headingMatch[1];
  if (tagVersion === changelogVersion) return [];
  return [`git tag "v${tagVersion}" at HEAD but the newest CHANGELOG.md release heading is "${changelogVersion}": the suite version must be identical in both`];
}

// The artefacts a workstream owns: every non-workstream record naming it,
// matching the set the index reports for that workstream.
function ownedArtefacts(ws) {
  return artefacts.filter((a) => a.workstream === ws.id && a.type !== 'workstream');
}

// Levenshtein edit distance, iterative over a single row. Dependency-free and
// pure, in keeping with the rest of this file; the pool is a few dozen short
// words, so the full matrix costs nothing and no early cut-off is needed.
function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = row;
  }
  return prev[b.length];
}

// The pool entry closest to tag as {tag, distance}, or null when the closest
// sits further away than TAG_NEAR_MAX. The pool is walked in sorted order and
// a later entry never displaces an equally distant earlier one, so a tie
// breaks alphabetically and the suggestion is the same on every run.
function nearestTag(tag, pool) {
  let best = null;
  let bestDistance = Infinity;
  for (const entry of [...pool].sort()) {
    const d = levenshtein(tag, entry);
    if (d < bestDistance) { best = entry; bestDistance = d; }
  }
  return bestDistance <= TAG_NEAR_MAX ? { tag: best, distance: bestDistance } : null;
}

// The only function in this file permitted to write an artefact file. It runs
// over non-archived artefacts in one ordered pass: task lists and issue lists
// first (independent of each other), then workstreams, so a workstream sees
// the statuses step one just set. One pass suffices because no workstream owns
// another workstream. It only ever writes status: done plus updated: today,
// only inside the leading frontmatter block, and never to a plan.
function applySync() {
  const today = localDay();

  // Replaces the status: and updated: lines of the leading frontmatter block
  // and nothing else. The block is matched from the start of the file, so a
  // status: line inside a task or issue YAML block in the body is untouched.
  const closeRecord = (a) => {
    const abs = path.join(root, a.file);
    const text = fs.readFileSync(abs, 'utf8');
    const m = text.match(/^---\r?\n[\s\S]*?\r?\n---/);
    if (!m) return false;
    const before = m[0];
    if (!/^status:[ \t]*.*$/m.test(before)) return false;
    const after = before
      .replace(/^status:[ \t]*.*$/m, 'status: done')
      .replace(/^updated:[ \t]*.*$/m, `updated: ${today}`);
    if (after === before) return false;
    writeAtomic(abs, after + text.slice(before.length));
    a.status = 'done';
    a.updated = today;
    return true;
  };

  const live = artefacts.filter((a) => !a.archived && !isClosedStatus(a.status));

  for (const a of live) {
    if (a.type === 'tasklist' && a.tasks.total > 0 && a.tasks.open === 0) {
      const old = a.status;
      if (closeRecord(a)) console.log(`SYNC ${a.id} (${a.file}): ${old} → done (all ${a.tasks.total} tasks checked)`);
    } else if (a.type === 'issuelist' && a.issues.length > 0 && a.issues.every((i) => isClosedStatus(i.status))) {
      const old = a.status;
      if (closeRecord(a)) console.log(`SYNC ${a.id} (${a.file}): ${old} → done (all ${a.issues.length} issues closed)`);
    }
  }

  for (const ws of live) {
    if (ws.type !== 'workstream' || isClosedStatus(ws.status)) continue;
    const owned = ownedArtefacts(ws);
    if (!owned.length) continue; // a workstream owning nothing is never closed
    const open = owned.filter((a) => !isClosedStatus(a.status));
    if (open.length) {
      // --sync never sets a plan's status, so a workstream whose only open
      // artefacts are plans cannot close. Name the blocker instead.
      if (open.every((a) => a.type === 'plan')) {
        for (const p of open) {
          warnings.push(`${ws.id}: every artefact closed except ${p.id} (${p.status}): close the plan to close the workstream`);
        }
      }
      continue;
    }
    const old = ws.status;
    if (closeRecord(ws)) console.log(`SYNC ${ws.id} (${ws.file}): ${old} → done (all ${owned.length} artefacts closed)`);
  }
}

const cmpListId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });

function compareRecs(key, desc) {
  return (a, b) => {
    const av = a[key], bv = b[key];
    const aMissing = av === undefined || av === null || av === '';
    const bMissing = bv === undefined || bv === null || bv === '';
    if (aMissing || bMissing) return aMissing && bMissing ? cmpListId(a, b) : aMissing ? 1 : -1;
    let d;
    if (key === 'id') d = cmpListId(a, b);
    else if (key === 'status') d = STATUSES.indexOf(av) - STATUSES.indexOf(bv);
    else if (key === 'severity') d = (SEV_ORDER[av] ?? 9) - (SEV_ORDER[bv] ?? 9);
    else d = String(av).localeCompare(String(bv));
    if (desc) d = -d;
    return d || cmpListId(a, b);
  };
}

function selectRows(items, opts) {
  const { scope, wsId, sortKey, desc, archived } = opts;
  const wsCol = wsId ? [] : [['Workstream', 'workstream']];
  const inWs = (a) => !wsId || a.workstream === wsId || a.id === wsId;
  const live = archived ? items : items.filter((a) => !a.archived);
  let cols, recs;
  if (scope === 'workstreams') {
    cols = [['ID', 'id'], ['Slug', 'slug'], ['Title', 'title'], ['Status', 'status'], ['Tags', 'tags'], ['Updated', 'updated']];
    recs = live.filter((a) => a.type === 'workstream' && inWs(a));
  } else if (scope === 'issues') {
    cols = [['ID', 'id'], ...wsCol, ['Title', 'title'], ['Severity', 'severity'], ['Status', 'status']];
    recs = live
      .filter((a) => a.type === 'issuelist' && inWs(a))
      .flatMap((a) => a.issues.map((i) => ({ ...i, workstream: a.workstream, archived: a.archived })));
  } else if (scope === 'tasklists') {
    cols = [['ID', 'id'], ...wsCol, ['Title', 'title'], ['Status', 'status'], ['Progress', 'progress'], ['Updated', 'updated']];
    recs = live
      .filter((a) => a.type === 'tasklist' && inWs(a))
      .map((a) => ({ ...a, progress: `${a.tasks.total - a.tasks.open}/${a.tasks.total}` }));
  } else if (scope === 'all') {
    cols = [['ID', 'id'], ['Type', 'type'], ...wsCol, ['Title', 'title'], ['Status', 'status'], ['Updated', 'updated']];
    recs = live.filter(inWs);
  } else {
    cols = [['ID', 'id'], ...wsCol, ['Title', 'title'], ['Status', 'status'], ['Updated', 'updated']];
    recs = live.filter((a) => a.type === SCOPE_TYPE[scope] && inWs(a));
  }
  if (sortKey === 'created' && !cols.some((c) => c[1] === 'created')) cols.push(['Created', 'created']);
  recs.sort(compareRecs(sortKey, desc));
  const val = (r, k) => {
    if (k === 'tags') return (r.tags || []).join(', ');
    if (k === 'status') return `${r.status}${r.archived ? ' (archived)' : ''}${r.blocked ? ' (blocked)' : ''}`;
    return r[k];
  };
  return {
    heading: `${SCOPE_LABEL[scope]}${wsId ? ` in ${wsId}` : ''} (${recs.length})`,
    headers: cols.map((c) => c[0]),
    rows: recs.map((r) => cols.map((c) => val(r, c[1]))),
  };
}

const listCell = (v) => (v === undefined || v === null || v === '' ? '-' : String(v).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|'));

function renderTable(headers, rows) {
  if (!rows.length) return '_none_\n';
  let out = `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n`;
  for (const r of rows) out += `| ${r.map(listCell).join(' | ')} |\n`;
  return out;
}

// ---- scan ------------------------------------------------------------------
const artefacts = []; // {id,type,workstream,slug,title,status,created,updated,depends_on,links,tags,mode,file,issues?,tasks?}
const byId = new Map();

const ROOTS = [
  { dir: wsRoot, relParts: ['flowcharge', 'workstreams'], archived: false },
  { dir: archiveRoot, relParts: ['flowcharge', 'archive'], archived: true },
];

for (const rootSpec of ROOTS) {
  if (!fs.existsSync(rootSpec.dir)) continue;
  const dirs = fs
    .readdirSync(rootSpec.dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const dir of dirs) {
    const dirPath = path.join(rootSpec.dir, dir);
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => /^(?:(?:PLN|IL|TL)-\d+-[0-9a-z]{6}-)?(?:workstream|plan|issuelist|tasklist)(?:-[a-z0-9-]+)?\.md$/.test(f))
      .sort();
    for (const f of files) {
      const abs = path.join(dirPath, f);
      const rel = path.join(...rootSpec.relParts, dir, f);
      const text = fs.readFileSync(abs, 'utf8');
      const fm = parseFrontmatter(text);
      if (!fm || !fm.id) {
        warnings.push(`${rel}: missing frontmatter or id, excluded from index`);
        continue;
      }
      const a = {
        id: fm.id, type: fm.type || '', workstream: fm.workstream || '', slug: fm.slug || dir,
        title: fm.title || '', status: fm.status || '', created: fm.created || '',
        updated: fm.updated || '', depends_on: fm.depends_on || [], links: fm.links || [],
        tags: fm.tags || [], mode: fm.mode || '', author: fm.author || '',
        blocked: (fm.blocked || '').trim(),
        file: rel, archived: rootSpec.archived,
        // Fields the schema, freshness and shape checks need. fmKeys is the raw
        // key set, because the defaults above cannot tell an absent key from an
        // empty one. No extra file read: the text is already in hand.
        fmKeys: new Set(Object.keys(fm)), basename: f, dir,
        mtime: fs.statSync(abs).mtimeMs,
        body: text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ''),
      };
      if (!STATUSES.includes(a.status)) warnings.push(`${rel}: status "${a.status}" not in enum`);
      if (a.archived && a.status !== 'done' && a.status !== 'dropped') {
        warnings.push(`${a.id} (${rel}): archived but status is "${a.status}": only done/dropped belong in archive/`);
      }
      if (byId.has(a.id)) warnings.push(`duplicate id ${a.id}: ${byId.get(a.id).file} and ${rel}`);
      byId.set(a.id, a);
      if (a.type === 'issuelist') a.issues = parseIssues(text, rel);
      if (a.type === 'tasklist') a.tasks = parseTasks(text);
      artefacts.push(a);
    }
  }
}

const workstreams = artefacts.filter((a) => a.type === 'workstream');
const allIssues = artefacts.filter((a) => a.type === 'issuelist').flatMap((a) => a.issues);
for (const iss of allIssues) {
  if (byId.has(iss.id)) warnings.push(`duplicate issue id ${iss.id} (${iss.file})`);
  else byId.set(iss.id, { id: iss.id, status: iss.status, file: iss.file, type: 'issue' });
}

// Parsed before --list and --claim so an invalid combination exits 1 through
// --sync's or --new-ws's own die() rather than running the other mode.
const syncOpts = parseSyncArgs(args);
const newWsOpts = parseNewWsArgs(args);
const whoamiOpts = parseWhoamiArgs(args);

// ---- --whoami mode: print the local git author and exit. Read-only, like
// --list: it never reaches an integrity check or a file write.
if (whoamiOpts) {
  console.log(readGitAuthor(root));
  process.exit(0);
}

// ---- --list mode: read-only, exits before any integrity check or file write.
const listOpts = parseListArgs(args);
if (listOpts) {
  const { heading, headers, rows } = selectRows(artefacts, listOpts);
  process.stdout.write(`## ${heading}\n\n${renderTable(headers, rows)}`);
  process.exit(0);
}

// Cosmetic registry write-back: best effort, shared by --claim and --new-ws.
// A failure here must not change the caller's exit code, remove the
// already-claimed ids from stdout, or stop --new-ws creating its folder and
// record; the marker directories are the authoritative record. A lost update
// self-heals via the registry-drift warning on the next default-mode run.
function writeRegistryBack(type, highest) {
  try {
    if (fs.existsSync(registryPath)) {
      const regText = fs.readFileSync(registryPath, 'utf8');
      const lineRe = new RegExp(`^- ${type}:\\s*\\d+`, 'm');
      const newLine = `- ${type}: ${highest}`;
      const newText = lineRe.test(regText)
        ? regText.replace(lineRe, newLine)
        : `${regText.replace(/\n?$/, '\n')}${newLine}\n`;
      writeAtomic(registryPath, newText);
    } else {
      const seed = (t) => {
        if (t === type) return highest;
        let s = 0;
        for (const id of byId.keys()) {
          const m = id.match(/^(WS|PLN|IL|TL|ISS)-(\d+)-[0-9a-z]{6}$/);
          if (m && m[1] === t) s = Math.max(s, parseInt(m[2], 10));
        }
        if (fs.existsSync(idsDir)) {
          const re = new RegExp(`^${t}-(\\d+)-[0-9a-z]{6}$`);
          for (const entry of fs.readdirSync(idsDir)) {
            const mm = entry.match(re);
            if (mm) s = Math.max(s, parseInt(mm[1], 10));
          }
        }
        return s;
      };
      const counters = CLAIM_TYPES.map((t) => `- ${t}: ${seed(t)}`).join('\n') + '\n';
      writeAtomic(registryPath, REGISTRY_HEADER + counters);
    }
  } catch (e) {
    console.error(`fc-index: warning, failed to update ids.md after claim: ${e.message}`);
  }
}

// ---- --claim mode: atomic ID allocation via marker directories under
// flowcharge/ids/. Exits before any integrity check or file write.
const claimOpts = parseClaimArgs(args);
if (claimOpts) {
  const { type, count } = claimOpts;
  const { claimed, next } = allocateIds(type, count);

  writeRegistryBack(type, next - 1); // next sits one past the last successful claim

  for (const id of claimed) console.log(id);
  process.exit(0);
}

// ---- --new-ws mode: scaffold one workstream folder and its record. An
// early-exit mode like --list and --claim: it never reaches the integrity
// checks or the index/board writes. It does not acquire the lease. That stays
// in SKILL.md, which runs after the folder exists either way.
if (newWsOpts) {
  const { slug, title, tags, status } = newWsOpts;

  // Collision first, claim second: an ID claimed and then abandoned leaves an
  // orphan marker directory behind, so the common failure is checked before
  // anything is claimed.
  for (const rootSpec of ROOTS) {
    if (!fs.existsSync(rootSpec.dir)) continue;
    const dirs = fs.readdirSync(rootSpec.dir, { withFileTypes: true })
      .filter((d) => d.isDirectory()).map((d) => d.name).sort();
    for (const dir of dirs) {
      if (dir.replace(/^WS-\d+-[0-9a-z]{6}-/, '') !== slug) continue;
      console.error(`fc-index: slug "${slug}" is already taken by ${path.join(...rootSpec.relParts, dir)}/`);
      process.exit(1);
    }
  }

  const { claimed, next } = allocateIds('WS', 1);
  writeRegistryBack('WS', next - 1);
  const id = claimed[0];
  const dirName = `${id}-${slug}`;
  // Defence in depth behind the slug allow-list: path.join normalises `..`
  // lexically, so a containment test on the resolved path, not a string test
  // on the slug, is what proves the write stays under flowcharge/workstreams/.
  // An empty relative path means the two paths are equal, which is itself an
  // escape; on Windows a drive-absolute value returns an absolute path rather
  // than one starting with `..`, so both are tested too.
  const contained = (base, target) => {
    const relPath = path.relative(base, target);
    return relPath !== '' && !path.isAbsolute(relPath) && !relPath.startsWith('..');
  };
  const wsDir = path.join(wsRoot, dirName);
  if (!contained(wsRoot, wsDir)) {
    console.error(`fc-index: refusing to create a workstream folder outside flowcharge/workstreams/ (${wsDir})`);
    process.exit(1);
  }
  fs.mkdirSync(wsDir, { recursive: true });
  const rel = path.join('flowcharge', 'workstreams', dirName, 'workstream.md');
  const day = localDay();
  // Every required key, at a valid value, in CONVENTIONS.md's order, flat
  // keys and inline arrays only. The body is deliberately left empty: its
  // length follows the originating request and cannot be passed on a command
  // line, and the missing-card-description warning names it far better than a
  // placeholder string that could survive onto the board.
  const recPath = path.join(root, rel);
  if (!contained(wsRoot, recPath)) {
    console.error(`fc-index: refusing to write a workstream record outside flowcharge/workstreams/ (${recPath})`);
    process.exit(1);
  }
  writeAtomic(recPath, [
    '---',
    `id: ${id}`,
    'type: workstream',
    `workstream: ${id}`,
    `slug: ${slug}`,
    // JSON.stringify emits a correctly escaped YAML double-quoted scalar, and
    // is byte-identical to hand-placed quotes for an ordinary value.
    `title: ${JSON.stringify(title)}`,
    `status: ${status}`,
    `tags: [${tags.join(', ')}]`,
    `created: ${day}`,
    `updated: ${day}`,
    `author: ${readGitAuthor(root)}`,
    'depends_on: []',
    'links: []',
    '---',
    '',
  ].join('\n'));
  console.log(id);
  console.log(rel);
  process.exit(0);
}

// ---- --sync mode: the close pass. A fall-through, not an early exit. The
// integrity checks and the index/board writes below see the statuses it set,
// so one command both closes and regenerates.
if (syncOpts) applySync();

// ---- integrity checks ------------------------------------------------------
const isDone = (id) => {
  const t = byId.get(id);
  return t ? t.status === 'done' : false;
};
for (const a of artefacts) {
  for (const dep of a.depends_on) {
    if (!byId.has(dep)) warnings.push(`${a.id} (${a.file}): depends_on unknown id ${dep}`);
  }
}
for (const iss of allIssues) {
  const shouldCheck = iss.status === 'done' || iss.status === 'dropped';
  if (iss.checked !== shouldCheck) {
    warnings.push(`${iss.id} (${iss.file}): checkbox ${iss.checked ? '[x]' : '[ ]'} disagrees with status "${iss.status}"`);
  }
}
for (const a of artefacts) {
  if (a.type === 'tasklist' && a.tasks.total > 0 && a.tasks.open === 0 && a.status !== 'done' && a.status !== 'dropped') {
    warnings.push(`${a.id} (${a.file}): all ${a.tasks.total} tasks checked but status is "${a.status}". Close it?`);
  }
  if (a.type === 'issuelist' && a.issues.length > 0 && a.issues.every((i) => i.status === 'done' || i.status === 'dropped') && a.status !== 'done' && a.status !== 'dropped') {
    warnings.push(`${a.id} (${a.file}): no open issues left but status is "${a.status}". Close it?`);
  }
  if (a.type === 'workstream' && !isClosedStatus(a.status)) {
    const owned = ownedArtefacts(a);
    if (owned.length > 0 && owned.every((o) => isClosedStatus(o.status))) {
      warnings.push(`${a.id} (${a.file}): all ${owned.length} artefacts closed but status is "${a.status}". Close it?`);
    }
  }
  // The aftermath of a close. An archived tree already reports every unclosed
  // artefact in it, so both checks skip an archived record.
  if (a.type === 'workstream' && !a.archived && isClosedStatus(a.status)) {
    const owned = ownedArtefacts(a);
    const open = owned.filter((o) => !isClosedStatus(o.status));
    if (open.length > 0) {
      warnings.push(`${a.id} (${a.file}): status is "${a.status}" but ${open.length} of its ${owned.length} artefacts are still open. Reopen it?`);
    }
    if (a.blocked) {
      warnings.push(`${a.id} (${a.file}): status is "${a.status}" but it still carries a blocked reason: clear the blocked key`);
    }
  }
  if (!a.archived && (a.status === 'in-progress' || a.blocked) && a.updated) {
    const age = (Date.parse(localDay()) - Date.parse(a.updated)) / 86400000;
    if (age > STALE_DAYS) {
      const flags = [];
      if (a.status === 'in-progress') flags.push('in-progress');
      if (a.blocked) flags.push('blocked');
      warnings.push(`${a.id} (${a.file}): ${flags.join(' and ')} but not updated for ${Math.floor(age)} days`);
    }
  }
}

// Frontmatter schema, `updated` freshness, and file/folder/body shape.
for (const a of artefacts) {
  for (const key of requiredKeys(a.type)) {
    if (!a.fmKeys.has(key)) {
      warnings.push(`${a.id} (${a.file}): missing required frontmatter key "${key}" for type "${a.type}"`);
    }
  }
  if (a.type === 'tasklist' && a.fmKeys.has('mode') && !TASKLIST_MODES.includes(a.mode)) {
    warnings.push(`${a.id} (${a.file}): mode "${a.mode}" not in enum (expected: ${TASKLIST_MODES.join(', ')})`);
  }
  // A workstream names itself. An absent key is reported by the loop above, so
  // this fires only on a key that is present and wrong.
  if (a.type === 'workstream' && a.fmKeys.has('workstream') && a.workstream !== a.id) {
    warnings.push(`${a.id} (${a.file}): workstream key "${a.workstream}" is not its own id`);
  }
  if (a.updated) {
    const modified = localDay(new Date(a.mtime));
    const drift = (Date.parse(modified) - Date.parse(a.updated)) / 86400000;
    if (drift > UPDATED_GRACE_DAYS) {
      warnings.push(`${a.id} (${a.file}): updated ${a.updated} but file modified ${modified}: bump updated on every edit`);
    }
  }
  for (const w of checkShape(a)) warnings.push(w);
}

// Tag pool membership. The pool is registry-like infrastructure rather than an
// artefact: it sits at flowcharge/ root, outside the workstreams/ and archive/
// walk above, so it is read here instead of scanned. A missing pool disables
// the membership check for the whole run: one advisory line, rather than one
// WARN per tag in a corpus that has no pool yet.
let tagPool = null;
if (fs.existsSync(tagPoolPath)) {
  const poolText = fs.readFileSync(tagPoolPath, 'utf8');
  tagPool = new Set([...poolText.matchAll(/^- ([a-z0-9-]+)$/gm)].map((m) => m[1]));
} else {
  warnings.push('flowcharge/tags.md missing, tag validation skipped');
}
// Live and archived workstreams alike, lowercased the same way the board's
// label keys are. The WARN drives a fix; it never suppresses the label.
if (tagPool) {
  for (const ws of workstreams) {
    for (const raw of ws.tags) {
      const tag = raw.toLowerCase();
      if (tagPool.has(tag)) continue;
      const near = nearestTag(tag, tagPool);
      warnings.push(near
        ? `${ws.id} (${ws.file}): tag "#${tag}" not in the tag pool, nearest defined tag: "#${near.tag}"`
        : `${ws.id} (${ws.file}): tag "#${tag}" not in the tag pool`);
    }
  }
}

// A property of a folder rather than of an artefact, so it sits outside
// checkShape: every directory under flowcharge/workstreams/ is a workstream
// folder, and one without the record is not.
for (const dir of fs.readdirSync(wsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  if (!fs.existsSync(path.join(wsRoot, dir, 'workstream.md'))) {
    warnings.push(`flowcharge/workstreams/${dir}/: no workstream.md, not a workstream folder`);
  }
}

// The suite-version check only concerns this tool's own repository: a
// consumer project's own tags and its own CHANGELOG.md are not this tool's
// business, and warning about them could fail that project's CI through the
// exit code 2 that --check already uses. fs.realpathSync keeps a symlinked
// checkout matching, and a failed realpath (e.g. a missing path) skips the
// check rather than throwing.
try {
  const selfResolved = fs.realpathSync(resolveProjectRoot(SELF_ROOT));
  const rootResolved = fs.realpathSync(root);
  if (selfResolved === rootResolved) {
    for (const w of checkSuiteVersion(SELF_ROOT)) warnings.push(w);
  }
} catch { /* not running against this tool's own repository, skip */ }

// Registry drift. The parsed counters outlive the block: checkIds needs them
// and is not permitted to read the file for itself.
const reg = {};
if (fs.existsSync(registryPath)) {
  const regText = fs.readFileSync(registryPath, 'utf8');
  for (const m of regText.matchAll(/^- (WS|PLN|IL|TL|ISS):\s*(\d+)/gm)) reg[m[1]] = parseInt(m[2], 10);
  const maxSeen = { WS: 0, PLN: 0, IL: 0, TL: 0, ISS: 0 };
  for (const id of byId.keys()) {
    const m = id.match(/^(WS|PLN|IL|TL|ISS)-(\d+)-[0-9a-z]{6}$/);
    if (m) maxSeen[m[1]] = Math.max(maxSeen[m[1]], parseInt(m[2], 10));
  }
  for (const t of Object.keys(maxSeen)) {
    if (reg[t] === undefined) warnings.push(`ids.md: no counter for ${t}`);
    else if (maxSeen[t] > reg[t]) warnings.push(`ids.md: ${t} counter is ${reg[t]} but ${t}-${maxSeen[t]} exists, registry behind`);
  }
} else {
  warnings.push('flowcharge/ids.md missing: create it before allocating new IDs');
}

// The registry header. The mismatch is reported here, with the other integrity
// checks, and the rewrite it announces happens below with the index and board
// writes, so --check's early exit prevents the write without a mode test.
let registryRewrite = null;
if (fs.existsSync(registryPath)) {
  registryRewrite = registryHeaderRewrite(fs.readFileSync(registryPath, 'utf8'));
  if (registryRewrite) warnings.push('ids.md: header text is out of date, rewritten');
}

// The ID graph: orphan markers, counters ahead of every source, and the
// links: and issues: cross-references.
for (const w of checkIds(artefacts, byId, idsDir, reg)) warnings.push(w);

// Workstream leases held past LEASE_STALE_MINUTES. Reported only: no mode of
// this script ever deletes a lease.
const leaseDirs = fs.readdirSync(wsRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();
for (const w of checkLeases(leaseDirs)) warnings.push(w);

// Board divergence (before overwrite): frontmatter wins.
const COLUMN_OF = { backlog: 'Backlog', ready: 'Ready', 'in-progress': 'In Progress', done: 'Done', dropped: 'Dropped' };
if (fs.existsSync(boardPath)) {
  const old = fs.readFileSync(boardPath, 'utf8');
  let col = '';
  for (const line of old.split(/\r?\n/)) {
    const c = line.match(/^- # (.+?)(?: __archived__)?$/);
    if (c) { col = c[1]; continue; }
    const card = line.match(/^\t- ## (WS-\d+-[0-9a-z]{6})\b/);
    if (card) {
      const ws = byId.get(card[1]);
      if (ws && !ws.archived && COLUMN_OF[ws.status] && COLUMN_OF[ws.status] !== col) {
        warnings.push(`board: ${card[1]} sits in "${col}" but frontmatter says "${ws.status}". Frontmatter wins, board regenerated`);
      }
    }
  }
}

// ---- outputs ---------------------------------------------------------------
if (checkOnly) {
  for (const w of warnings) console.log(`WARN ${w}`);
  process.exit(warnings.length ? 2 : 0);
}

// Default mode only, and only when the header actually differs: the counter
// lines come through byte-for-byte, and a registry whose header already
// matches is not rewritten identically but left alone.
if (registryRewrite) writeAtomic(registryPath, registryRewrite);

const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
const wsArtefacts = (ws) =>
  artefacts
    .filter((a) => a.workstream === ws.id && a.type !== 'workstream')
    .map((a) => {
      let extra = '';
      if (a.type === 'tasklist') extra = ` ${a.tasks.total - a.tasks.open}/${a.tasks.total}`;
      if (a.type === 'issuelist') {
        const open = a.issues.filter((i) => i.status !== 'done' && i.status !== 'dropped').length;
        extra = ` ${a.issues.length - open}/${a.issues.length}`;
      }
      return `${a.id} (${a.status}${extra})`;
    })
    .join(', ') || '-';

const readyWork = artefacts.filter(
  (a) => !a.archived && (a.status === 'ready' || a.status === 'backlog') && !a.blocked && a.depends_on.every(isDone)
);

const openIssues = artefacts
  .filter((a) => a.type === 'issuelist' && !a.archived)
  .flatMap((a) => a.issues)
  .filter((i) => i.status !== 'done' && i.status !== 'dropped')
  .sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9) || a.id.localeCompare(b.id, undefined, { numeric: true }));

let idx = `<!-- GENERATED by fc-index.mjs ${now}. Do not edit. Regenerate: node fc-index.mjs --root <project-root> -->\n\n# FlowCharge Index\n\n`;
idx += `## Workstreams\n\n| ID | Slug | Status | Author | Depends on | Artefacts |\n|---|---|---|---|---|---|\n`;
for (const ws of workstreams.filter((w) => !w.archived).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
  idx += `| ${listCell(ws.id)} | ${listCell(ws.slug)} | ${listCell(ws.status + (ws.blocked ? ' (blocked)' : ''))} | ${listCell(ws.author || 'unknown')} | ${listCell(ws.depends_on.join(', ') || '-')} | ${listCell(wsArtefacts(ws))} |\n`;
}
idx += `\n## Open issues (${openIssues.length})\n\n| ID | Severity | Status | Author | Title | File |\n|---|---|---|---|---|---|\n`;
for (const i of openIssues) idx += `| ${listCell(i.id)} | ${listCell(i.severity)} | ${listCell(i.status)} | ${listCell(i.author || 'unknown')} | ${listCell(i.title)} | ${listCell(i.file)} |\n`;
idx += `\n## Task lists\n\n| ID | Workstream | Mode | Done/Total | Status | Author |\n|---|---|---|---|---|---|\n`;
for (const a of artefacts.filter((x) => x.type === 'tasklist' && !x.archived)) {
  idx += `| ${listCell(a.id)} | ${listCell(a.workstream)} | ${listCell(a.mode || '?')} | ${listCell(`${a.tasks.total - a.tasks.open}/${a.tasks.total}`)} | ${listCell(a.status)} | ${listCell(a.author || 'unknown')} |\n`;
}
const archivedWs = workstreams.filter((w) => w.archived).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
idx += `\n## Archived (${archivedWs.length})\n\n`;
idx += archivedWs.length ? archivedWs.map((w) => `- ${w.id} ${w.slug} (${w.status}), ${path.dirname(w.file)}/`).join('\n') + '\n' : '- none\n';
idx += `\n## Ready to start (deps satisfied)\n\n`;
idx += readyWork.length ? readyWork.map((a) => `- ${a.id} ${a.slug} (${a.type}, ${a.status})`).join('\n') + '\n' : '- none\n';
idx += `\n## Attention\n\n`;
idx += warnings.length ? warnings.map((w) => `- ${w}`).join('\n') + '\n' : '- clean\n';
writeAtomic(indexPath, idx);

if (!noBoard) {
  // Preserve existing label colours; assign from palette for new tags.
  const palette = ['#2f80ed', '#0f9d58', '#9b51e0', '#f2994a', '#00a3a3', '#eb5757', '#b8860b', '#607d8b'];
  let labels = {};
  if (fs.existsSync(boardPath)) {
    const m = fs.readFileSync(boardPath, 'utf8').match(/^<!-- kanban-labels: (\{.*\}) -->$/m);
    if (m) { try { labels = JSON.parse(m[1]); } catch { /* rebuild below */ } }
  }
  const allTags = [...new Set(workstreams.flatMap((w) => w.tags.map((t) => t.toLowerCase())))];
  let p = 0;
  for (const t of allTags) if (!labels[t]) labels[t] = palette[p++ % palette.length];
  labels = Object.fromEntries(Object.entries(labels).filter(([k]) => allTags.includes(k)));

  const cols = { Backlog: [], Ready: [], 'In Progress': [], Done: [], Dropped: [], Archive: [] };
  for (const ws of workstreams.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
    const col = ws.archived ? 'Archive' : COLUMN_OF[ws.status];
    if (!col) continue;
    const body = fs.readFileSync(path.join(root, ws.file), 'utf8');
    const afterFm = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const desc = (afterFm.split(/\r?\n/).map((l) => l.trim()).find((l) => l && !l.startsWith('#')) || '').slice(0, 200);
    const tags = ws.tags.map((t) => `#${t.toLowerCase()}`).join(' ');
    let card = `\t- ## ${ws.id} ${ws.title || ws.slug}${tags ? ' ' + tags : ''}\n`;
    if (ws.blocked) card += `\t\t**Blocked:** ${ws.blocked}\n`;
    if (desc) card += `\t\t${desc}\n`;
    card += `\t\tby ${ws.author || 'unknown'}\n`;
    card += `\t\t→ ${path.dirname(ws.file)}/\n`;
    cols[col].push(card);
  }
  let board = '';
  if (Object.keys(labels).length) board += `<!-- kanban-labels: ${JSON.stringify(labels)} -->\n`;
  for (const [name, cards] of Object.entries(cols)) {
    board += `- # ${name}${name === 'Dropped' || name === 'Archive' ? ' __archived__' : ''}\n`;
    for (const c of cards) board += c;
  }
  writeAtomic(boardPath, board);
}

for (const w of warnings) console.log(`WARN ${w}`);
console.log(`fc-index: ${workstreams.length} workstreams, ${artefacts.length} artefacts, ${allIssues.length} issues (${openIssues.length} open) → ${path.basename(indexPath)}${noBoard ? '' : ' + ' + path.basename(boardPath)}`);
