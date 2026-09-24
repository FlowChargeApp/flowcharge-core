#!/usr/bin/env node
// Test harness for this skill. It holds two kinds of case.
//
// Generator fixture cases: each builds a small flowcharge/ tree in a temp
// directory, runs fc-index.mjs against it as a child process, and asserts the
// exact set of WARN lines it prints.
//
// Skill-file consistency cases: each reads the repository's own skills/ tree
// and greps every skills/**/*.md file for two shapes that a past on-disk schema
// migration left stale in prose: a workstreams/ path with no WS id in front of
// the slug, and a bare WS-N with no -SUFFIX. These cases are not hermetic on
// purpose: an edit made anywhere under skills/ can fail this suite.
//
// The runner is hand-rolled: node >= 16 is the published floor, so node:test's
// describe/it API is not available, and the suite takes no dependency and needs
// no package.json.
//
// Usage: node run-tests.mjs
//   exit 0  every case passed
//   exit 1  at least one case failed (the runner names it and prints the
//           missing and unexpected WARN lines separately)

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';
import { LABELS } from '../../../../.github/scripts/setup-labels.mjs';

const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const GENERATOR = path.resolve(HERE, '..', 'fc-index.mjs');
const FIXTURE_PREFIX = 'fc-harness-';

// ---- fixtures --------------------------------------------------------------

// Builds a fresh tree under os.tmpdir() from a {relative path: content} map.
// flowcharge/workstreams/ is always created: the generator exits 1 without it.
function fixture(spec) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  fs.mkdirSync(path.join(dir, 'flowcharge', 'workstreams'), { recursive: true });
  for (const rel of Object.keys(spec)) {
    const filePath = path.join(dir, rel);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, spec[rel]);
  }
  return dir;
}

// Runs fn against a fresh tree and removes the tree afterwards, including when
// fn throws.
function withFixture(spec, fn) {
  const dir = fixture(spec);
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Like fixture(), but does not pre-create flowcharge/workstreams/: --init's
// own happy path is proving the generator creates that directory itself, so
// its fixture must start without it, unlike every other case in this file.
function fixtureNoWorkstreamsTree(spec = {}) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  for (const rel of Object.keys(spec)) {
    const filePath = path.join(dir, rel);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, spec[rel]);
  }
  return dir;
}

// Runs fn against a fresh tree built by fixtureNoWorkstreamsTree() and
// removes the tree afterwards, including when fn throws. Mirrors
// withFixture()'s shape.
function withNoWorkstreamsFixture(spec, fn) {
  const dir = fixtureNoWorkstreamsTree(spec);
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---- artefact content builders --------------------------------------------

const pad2 = (n) => String(n).padStart(2, '0');
const localDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const today = () => localDay(new Date());
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDay(d);
};

// The author --new-ws writes into its scaffold, resolved the same way the
// generator's own readGitAuthor() resolves it. Computed rather than pinned to
// a literal, because it is whatever this machine's git config says, and
// "unknown" on a machine with no user.name set.
const gitAuthor = () => {
  const res = spawnSync('git', ['config', 'user.name'], { cwd: os.tmpdir(), encoding: 'utf8' });
  return (res.status === 0 && (res.stdout || '').trim()) || 'unknown';
};

const arr = (v) => `[${(v || []).join(', ')}]`;

function frontmatter(keys) {
  const lines = Object.keys(keys).map((k) => `${k}: ${keys[k]}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

// One artefact file: frontmatter block, blank line, body.
function record(type, o = {}) {
  const keys = {
    id: o.id,
    type,
    workstream: o.workstream !== undefined ? o.workstream : (type === 'workstream' ? o.id : 'WS-1-abcdef'),
    slug: o.slug !== undefined ? o.slug : 'alpha',
    title: `"${o.title !== undefined ? o.title : 'Fixture artefact'}"`,
    status: o.status !== undefined ? o.status : 'ready',
    created: o.created !== undefined ? o.created : today(),
    updated: o.updated !== undefined ? o.updated : today(),
    depends_on: arr(o.depends_on),
    links: arr(o.links),
  };
  if (type === 'workstream') keys.tags = arr(o.tags);
  // The blocked key opts in the same way and for the same reason. Both land
  // after the array keys rather than in the documented write position, because
  // parseFrontmatter reads key order not at all and every existing fixture must
  // stay byte-identical.
  if (type === 'workstream' && o.blocked !== undefined) keys.blocked = `"${o.blocked}"`;
  if (type === 'tasklist') keys.mode = o.mode !== undefined ? o.mode : 'spec';
  const body = o.body !== undefined ? o.body : 'Fixture body line for this artefact.\n';
  return `${frontmatter(keys)}\n${body}`;
}

const workstream = (o) => record('workstream', o);
const plan = (o) => record('plan', o);
const issuelist = (o) => record('issuelist', { ...o, body: (o.issues || []).join('') });
const tasklist = (o) => record('tasklist', { ...o, body: (o.tasks || []).join('') });

const issueBlock = (id, o = {}) =>
  `- [${o.checked ? 'x' : ' '}] ${id}. ${o.title !== undefined ? o.title : 'Fixture issue'}\n` +
  `  status: ${o.status !== undefined ? o.status : 'ready'}\n` +
  `  severity: ${o.severity !== undefined ? o.severity : 'low'}\n`;

const taskLine = (n, checked, title) =>
  `- [${checked ? 'x' : ' '}] ${n}. ${title !== undefined ? title : 'Fixture task'}\n`;

// Drops one frontmatter key line from a produced record, so a case can omit
// exactly one required key without a second record builder. The pattern anchors
// at column 0, so an indented key inside an issue or task YAML block in the
// body is left alone.
const withoutKey = (text, key) => text.replace(new RegExp(`^${key}: .*\\n`, 'm'), '');

const REG_TYPES = ['WS', 'PLN', 'IL', 'TL', 'ISS'];

// The header text fc-index.mjs owns, pinned here the way the WARN strings are
// pinned: a change to the constant must fail a case rather than pass quietly.
const REGISTRY_HEADER = '# FlowCharge ID Registry\n\n'
  + 'Last-issued ID per type. To claim IDs, run node <skills-dir>/flowcharge/scripts/fc-index.mjs'
  + ' --root <project-root> --claim <TYPE> [<count>] and use the printed id(s) verbatim.\n\n';

// ids.md with one counter line per type, under the canonical header. Pass
// omit to leave a type out, or head to give the file a header of its own,
// which is what a stale-header case needs.
function registry(counters = {}, omit = [], head = REGISTRY_HEADER) {
  const lines = REG_TYPES.filter((t) => !omit.includes(t))
    .map((t) => `- ${t}: ${counters[t] !== undefined ? counters[t] : 0}`);
  return `${head}${lines.join('\n')}\n`;
}

// tags.md in the same one-per-line shape the real pool file carries. Every
// tag the fixtures use is listed here, so the membership check fires only for
// a case that deliberately carries an unlisted tag. gates and orchestration
// are the two entries the near-match cases measure against.
const TAG_POOL = ['gates', 'generator', 'orchestration', 'skills'];

const tagPool = (tags = TAG_POOL) =>
  `# FlowCharge Tag Pool\n\n${tags.map((t) => `- ${t}`).join('\n')}\n`;

const WS1 = 'flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md';
const WS2 = 'flowcharge/workstreams/WS-2-abcdef-beta/workstream.md';

// A tree that produces no WARN at all: one workstream, a matching registry and
// a tag pool. head overrides the registry's header text, which only a header
// case needs. extra is spread last, so a case can replace the pool.
function baseTree(extra = {}, counters = {}, omit = [], head = REGISTRY_HEADER) {
  return {
    'flowcharge/ids.md': registry({ WS: 1, ...counters }, omit, head),
    'flowcharge/tags.md': tagPool(),
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha' }),
    ...extra,
  };
}

// ---- generator invocation and assertions -----------------------------------

function runGenerator(dir, extraArgs = []) {
  const res = spawnSync(process.execPath, [GENERATOR, '--root', dir, ...extraArgs], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// Pins a fixture file's mtime to one calendar day, so a case that turns on the
// updated-vs-mtime drift is deterministic rather than wall-clock dependent. The
// time of day is local noon, which keeps the day the generator reads back equal
// to day, because the generator reads mtime on the local calendar. Call it after
// the file is written: the write resets mtime.
function setMtime(dir, rel, day) {
  const t = new Date(`${day}T12:00:00`);
  fs.utimesSync(path.join(dir, rel), t, t);
}

const warnLines = (stdout) =>
  stdout.split(/\r?\n/).filter((l) => l.startsWith('WARN ')).map((l) => l.slice(5));

function compareLineSets(actual, expected, what) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = [...expectedSet].filter((l) => !actualSet.has(l));
  const unexpected = [...actualSet].filter((l) => !expectedSet.has(l));
  if (!missing.length && !unexpected.length) return;
  const fmt = (label, lines, mark) =>
    lines.length
      ? `  ${label} (${lines.length}):\n${lines.map((l) => `    ${mark} ${l}`).join('\n')}`
      : `  ${label} (0): none`;
  throw new Error(
    [`${what} set does not match`, fmt('missing', missing, '-'), fmt('unexpected', unexpected, '+')].join('\n'),
  );
}

const compareWarnSets = (actual, expected) => compareLineSets(actual, expected, 'WARN');

// Runs the generator in --check mode and compares its WARN lines, as a set,
// against expectedLines. --check exits 2 whenever a warning exists, so the
// exit code is read as data, not as failure.
function expectWarns(dir, expectedLines, extraArgs = []) {
  const { status, stdout, stderr } = runGenerator(dir, ['--check', ...extraArgs]);
  // Compare the sets before the exit code, so a wrong expectation reports the
  // missing and unexpected lines rather than only a code mismatch.
  compareWarnSets(warnLines(stdout), expectedLines);
  const wantStatus = expectedLines.length ? 2 : 0;
  if (status !== wantStatus) {
    throw new Error(
      `--check exited ${status}, expected ${wantStatus}\n` +
      `  stdout:\n${stdout.trimEnd() || '    (empty)'}\n  stderr:\n${stderr.trimEnd() || '    (empty)'}`,
    );
  }
}

// ---- case registry ---------------------------------------------------------
// "case" is a reserved word, so the registrar is testCase(name, fn).

const cases = [];
const testCase = (name, fn) => cases.push({ name, fn });

// ---- cases: version check (git tag vs CHANGELOG.md) ------------------------
// checkSuiteVersion() only fires through the same-repository gate, which
// requires a real git repository whose own tag and own CHANGELOG.md the
// check reads directly. A plain fixture() tree is not a git repository at
// all, so every other case in this file already reads as "no tag" without
// this machinery. These cases build a real git repository per fixture and,
// by default, copy the shipped fc-index.mjs into it so the copy's own
// self-root derivation resolves to the fixture root and the gate matches.
// runGit (defined later, in the fc-rename-artefacts.mjs section) is a
// function declaration, so it is callable from here through hoisting.

// Turns a fixture directory into a real git repository: git init, identity
// and excludes configured on the fixture itself (never the machine's global
// config, matching the renamer section's runGit pattern), commit.gpgsign and
// tag.gpgSign turned off so a machine with either enabled cannot fail the
// commit or the tag, one commit of everything the fixture holds, then zero
// or more annotated release tags on that commit. When copyScript is true
// (the default), the real fc-index.mjs is copied into the fixture first, at
// the exact depth it ships from (skills/flowcharge/scripts/), before
// the commit. Task 2.3 needs the same builder with copyScript off, so the
// option lives here rather than being duplicated there.
function gitTagFixture(dir, { tags = [], copyScript = true } = {}) {
  if (copyScript) {
    const dest = path.join(dir, 'skills', 'flowcharge', 'scripts', 'fc-index.mjs');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(GENERATOR, dest);
  }
  runGit(dir, ['init', '-q']);
  runGit(dir, ['config', 'user.name', 'FlowCharge Fixture']);
  runGit(dir, ['config', 'user.email', 'fixture@example.invalid']);
  runGit(dir, ['config', 'core.excludesFile', '/dev/null']);
  runGit(dir, ['config', 'commit.gpgsign', 'false']);
  runGit(dir, ['config', 'tag.gpgSign', 'false']);
  runGit(dir, ['add', '-A']);
  runGit(dir, ['commit', '-q', '--no-verify', '-m', 'fixture commit']);
  for (const tag of tags) runGit(dir, ['tag', '-a', tag, '-m', tag]);
}

// A minimal CHANGELOG.md holding one release heading.
const changelog = (heading) => `## ${heading}\n\nRelease notes.\n`;

// Runs the copy of fc-index.mjs that gitTagFixture() placed inside the
// fixture, not the real GENERATOR. This is what proves the check fires
// against the fixture's own tag and own CHANGELOG.md rather than this
// repository's.
function runCopiedGenerator(dir, extraArgs = []) {
  const copy = path.join(dir, 'skills', 'flowcharge', 'scripts', 'fc-index.mjs');
  const res = spawnSync(process.execPath, [copy, '--root', dir, ...extraArgs], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// Runs the copy in --check mode and compares its WARN lines as a set, the
// same way expectWarns() does for the real generator.
function expectCopiedWarns(dir, expectedLines, extraArgs = []) {
  const { status, stdout, stderr } = runCopiedGenerator(dir, ['--check', ...extraArgs]);
  compareWarnSets(warnLines(stdout), expectedLines);
  const wantStatus = expectedLines.length ? 2 : 0;
  if (status !== wantStatus) {
    throw new Error(
      `--check exited ${status}, expected ${wantStatus}\n` +
      `  stdout:\n${stdout.trimEnd() || '    (empty)'}\n  stderr:\n${stderr.trimEnd() || '    (empty)'}`,
    );
  }
}

testCase('version check: a tag agreeing with the newest CHANGELOG.md heading is silent', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.1.0') }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.1.0'] });
    expectCopiedWarns(dir, []);
  });
});

testCase('version check: a tag disagreeing with the newest CHANGELOG.md heading warns once and exits 2', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.1.0') }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.2.0'] });
    expectCopiedWarns(dir, [
      'git tag "v0.2.0" at HEAD but the newest CHANGELOG.md release heading is "0.1.0": the suite version must be identical in both',
    ]);
  });
});

// No tag at HEAD is the state this repository lives in for the whole gap
// between this work and the first real release, so silence here is the
// shipping condition, not a nicety.
testCase('version check: no tag at HEAD is silent', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.1.0') }), (dir) => {
    gitTagFixture(dir, { tags: [] });
    expectCopiedWarns(dir, []);
  });
});

testCase('version check: a tag not matching vX.Y.Z is silent', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.1.0') }), (dir) => {
    gitTagFixture(dir, { tags: ['checkpoint-1'] });
    expectCopiedWarns(dir, []);
  });
});

// Two matching tags on the same commit read the same as none: picking one of
// two candidates would be a silent wrong answer, so the check stays silent.
testCase('version check: two matching tags on the same commit is silent', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.3.0') }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.1.0', 'v0.2.0'] });
    expectCopiedWarns(dir, []);
  });
});

testCase('version check: a matching tag with no CHANGELOG.md warns that no release heading was found', () => {
  withFixture(baseTree(), (dir) => {
    gitTagFixture(dir, { tags: ['v0.1.0'] });
    expectCopiedWarns(dir, [
      'CHANGELOG.md: no "## X.Y.Z" release heading found',
    ]);
  });
});

testCase('version check: a matching tag with a CHANGELOG.md holding no release heading warns the same way', () => {
  withFixture(baseTree({ 'CHANGELOG.md': '## Unreleased\n\nNothing shipped yet.\n' }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.1.0'] });
    expectCopiedWarns(dir, [
      'CHANGELOG.md: no "## X.Y.Z" release heading found',
    ]);
  });
});

// The first-match rule must read past a non-release heading, so the release
// heading sits second here. Writing it first would prove nothing.
testCase('version check: an Unreleased heading above a valid release heading is read past', () => {
  withFixture(baseTree({
    'CHANGELOG.md': `## Unreleased\n\nNothing shipped yet.\n\n${changelog('0.1.0')}`,
  }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.1.0'] });
    expectCopiedWarns(dir, []);
  });
});

// This case proves the same-repository gate holds by running the real
// script at its own path in this repository, never a copy, against a
// fixture that plants the same mismatch the copy warns about above.
// Consumers of the plugin are never warned about their own git tags or
// their own CHANGELOG.md, whatever those hold, and their CI can never fail
// on the exit code 2 that --check already uses because of this check.
testCase('version check: the real script never inspects a fixture\'s own tag or CHANGELOG.md', () => {
  withFixture(baseTree({ 'CHANGELOG.md': changelog('0.1.0') }), (dir) => {
    gitTagFixture(dir, { tags: ['v0.2.0'], copyScript: false });
    expectWarns(dir, []);
  });
});

// ---- cases: missing frontmatter or id (fc-index.mjs:273-276) --------------

testCase('missing frontmatter warns and excludes the file', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/plan.md': 'No frontmatter block at all.\n',
  }), (dir) => {
    expectWarns(dir, [
      'flowcharge/workstreams/WS-1-abcdef-alpha/plan.md: missing frontmatter or id, excluded from index',
    ]);
  });
});

testCase('clean: a file with frontmatter and an id warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef' }),
  }, { PLN: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: status enum (fc-index.mjs:283) --------------------------------

testCase('status outside the enum warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'nope' }),
  }), (dir) => {
    expectWarns(dir, [
      'flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md: status "nope" not in enum',
    ]);
  });
});

// blocked left the artefact enum: it is a frontmatter flag now, not a status.
// A record still carrying the old status is refused like any other unknown one.
testCase('status blocked is no longer in the enum and warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'blocked' }),
  }), (dir) => {
    expectWarns(dir, [
      'flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md: status "blocked" not in enum',
    ]);
  });
});

testCase('clean: a status inside the enum warns about nothing', () => {
  withFixture(baseTree(), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: archived but not done/dropped (fc-index.mjs:284-286) ----------

testCase('archived artefact with an open status warns', () => {
  withFixture(baseTree({
    'flowcharge/archive/WS-2-abcdef-beta/workstream.md': workstream({ id: 'WS-2-abcdef', slug: 'beta', status: 'ready' }),
  }, { WS: 2 }), (dir) => {
    expectWarns(dir, [
      'WS-2-abcdef (flowcharge/archive/WS-2-abcdef-beta/workstream.md): archived but status is "ready": only done/dropped belong in archive/',
    ]);
  });
});

testCase('clean: an archived done artefact warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/archive/WS-2-abcdef-beta/workstream.md': workstream({ id: 'WS-2-abcdef', slug: 'beta', status: 'done' }),
  }, { WS: 2 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: duplicate artefact id (fc-index.mjs:287) ----------------------

testCase('two artefacts carrying one id warn as a duplicate', () => {
  withFixture(baseTree({
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef', workstream: 'WS-1-abcdef' }),
    'flowcharge/workstreams/WS-2-abcdef-beta/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef', workstream: 'WS-2-abcdef', slug: 'beta' }),
  }, { WS: 2, PLN: 1 }), (dir) => {
    expectWarns(dir, [
      'duplicate id PLN-1-abcdef: flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md and flowcharge/workstreams/WS-2-abcdef-beta/PLN-1-abcdef-plan.md',
    ]);
  });
});

testCase('clean: two artefacts with distinct ids warn about nothing', () => {
  withFixture(baseTree({
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef', workstream: 'WS-1-abcdef' }),
    'flowcharge/workstreams/WS-2-abcdef-beta/PLN-2-abcdef-plan.md': plan({ id: 'PLN-2-abcdef', workstream: 'WS-2-abcdef', slug: 'beta' }),
  }, { WS: 2, PLN: 2 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: duplicate issue id (fc-index.mjs:298-301) ---------------------

testCase('two issue records carrying one id warn as a duplicate', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      issues: [issueBlock('ISS-1-abcdef'), issueBlock('ISS-1-abcdef', { title: 'Same id again' })],
    }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [
      'duplicate issue id ISS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md)',
    ]);
  });
});

testCase('clean: two issue records with distinct ids warn about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      issues: [issueBlock('ISS-1-abcdef'), issueBlock('ISS-2-abcdef')],
    }),
  }, { IL: 1, ISS: 2 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: unknown depends_on target (fc-index.mjs:415-419) --------------

testCase('an unresolved depends_on target warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', depends_on: ['WS-99-abcdef'] }),
  }), (dir) => {
    expectWarns(dir, [
      'WS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md): depends_on unknown id WS-99-abcdef',
    ]);
  });
});

testCase('clean: a depends_on target that resolves warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', depends_on: ['WS-2-abcdef'] }),
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
  }, { WS: 2 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: checkbox/status disagreement (fc-index.mjs:420-425) -----------

testCase('an issue checkbox disagreeing with its status warns', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'ready' })],
    }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [
      'ISS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md): checkbox [x] disagrees with status "ready"',
    ]);
  });
});

testCase('clean: an issue checkbox agreeing with its status warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      issues: [issueBlock('ISS-1-abcdef', { checked: false, status: 'ready' })],
    }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: all tasks checked, list still open (fc-index.mjs:427-429) -----

testCase('a task list with every task checked but an open status warns', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md': tasklist({
      id: 'TL-1-abcdef',
      status: 'ready',
      tasks: [taskLine(1, true), taskLine(2, true)],
    }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [
      'TL-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md): all 2 tasks checked but status is "ready". Close it?',
    ]);
  });
});

testCase('clean: a task list with an open task warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md': tasklist({
      id: 'TL-1-abcdef',
      status: 'ready',
      tasks: [taskLine(1, true), taskLine(2, false)],
    }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: no open issues, list still open (fc-index.mjs:430-432) --------

testCase('an issue list with every issue closed but an open status warns', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      status: 'ready',
      issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' })],
    }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [
      'IL-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md): no open issues left but status is "ready". Close it?',
    ]);
  });
});

testCase('clean: a closed issue list with every issue closed warns about nothing', () => {
  // WS-1-abcdef is closed too: a workstream whose every artefact is closed is itself a
  // reported condition, so leaving it open would make this case assert two.
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      status: 'done',
      issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' })],
    }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: stale in-progress artefact (fc-index.mjs:433-436) -------------

testCase('an in-progress artefact past the stale window warns with its age', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'in-progress', created: daysAgo(100), updated: daysAgo(100) }),
  }), (dir) => {
    // The fixture is written now, so its mtime is pinned back to its updated
    // date to keep the updated-vs-mtime drift check out of this case.
    setMtime(dir, WS1, daysAgo(100));
    expectWarns(dir, [
      'WS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md): in-progress but not updated for 100 days',
    ]);
  });
});

testCase('clean: a recently updated in-progress artefact warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'in-progress', updated: daysAgo(1) }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// The blocked key is the nag's second trigger, at any status. The message names
// the flags that actually apply, so the pair below pins both forms it can take.

testCase('a blocked backlog artefact past the stale window warns as blocked', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      status: 'backlog',
      blocked: 'waiting on the vendor API key',
      created: daysAgo(100),
      updated: daysAgo(100),
    }),
  }), (dir) => {
    setMtime(dir, WS1, daysAgo(100));
    expectWarns(dir, [
      'WS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md): blocked but not updated for 100 days',
    ]);
  });
});

testCase('a blocked in-progress artefact past the stale window names both flags', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      status: 'in-progress',
      blocked: 'waiting on the vendor API key',
      created: daysAgo(100),
      updated: daysAgo(100),
    }),
  }), (dir) => {
    setMtime(dir, WS1, daysAgo(100));
    expectWarns(dir, [
      'WS-1-abcdef (flowcharge/workstreams/WS-1-abcdef-alpha/workstream.md): in-progress and blocked but not updated for 100 days',
    ]);
  });
});

// ---- cases: registry drift (fc-index.mjs:440-455) -------------------------

testCase('a missing ids.md warns', () => {
  withFixture({ 'flowcharge/tags.md': tagPool(), [WS1]: workstream({ id: 'WS-1-abcdef' }) }, (dir) => {
    expectWarns(dir, [
      'flowcharge/ids.md missing: create it before allocating new IDs',
    ]);
  });
});

testCase('clean: a present ids.md warns about nothing', () => {
  withFixture(baseTree(), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a registry counter behind the scanned artefacts warns', () => {
  withFixture(baseTree({}, { WS: 0 }), (dir) => {
    expectWarns(dir, [
      'ids.md: WS counter is 0 but WS-1 exists, registry behind',
    ]);
  });
});

testCase('clean: a registry counter level with the scanned artefacts warns about nothing', () => {
  withFixture(baseTree({}, { WS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a registry with no counter line for a type warns', () => {
  withFixture(baseTree({}, {}, ['ISS']), (dir) => {
    expectWarns(dir, ['ids.md: no counter for ISS']);
  });
});

testCase('clean: a registry carrying every counter line warns about nothing', () => {
  withFixture(baseTree({}, {}, []), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: board divergence (fc-index.mjs:457-473) -----------------------

const board = (column, cardId, cardTitle) =>
  `- # ${column}\n\t- ## ${cardId} ${cardTitle}\n\t\t→ flowcharge/workstreams/WS-1-abcdef-alpha/\n`;

testCase('a board card in the wrong column warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'in-progress' }),
    'flowcharge/kanban.md': board('Ready', 'WS-1-abcdef', 'Alpha'),
  }), (dir) => {
    expectWarns(dir, [
      'board: WS-1-abcdef sits in "Ready" but frontmatter says "in-progress". Frontmatter wins, board regenerated',
    ]);
  });
});

testCase('clean: a board card in the column its status names warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', status: 'in-progress' }),
    'flowcharge/kanban.md': board('In Progress', 'WS-1-abcdef', 'Alpha'),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: the card body's optional blocked line ---------------------------
// The blocked line sits directly under the title line, above the
// card-description line.

testCase('a blocked workstream writes the blocked line under the title', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      slug: 'alpha',
      title: 'Alpha',
      blocked: 'waiting on the vendor API key',
      body: 'The card description line.\n',
    }),
  }), (dir) => {
    const { status, stderr } = runGenerator(dir, []);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    const expected =
      '\t- ## WS-1-abcdef Alpha\n' +
      '\t\t**Blocked:** waiting on the vendor API key\n' +
      '\t\tThe card description line.\n' +
      '\t\tby unknown\n' +
      '\t\t→ flowcharge/workstreams/WS-1-abcdef-alpha/\n';
    const boardText = readRel(dir, 'flowcharge/kanban.md');
    assert.ok(
      boardText.includes(expected),
      `card body does not match\n  expected:\n${JSON.stringify(expected)}\n  board:\n${JSON.stringify(boardText)}`,
    );
  });
});

// ---- cases: the blocked flag's other rendered surfaces -----------------------
// A blocked record is not ready work, and the flag is visible wherever a status
// is shown: the index's workstream table and the --list status cell.

testCase('a blocked record is left out of the index ready-work section', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      slug: 'alpha',
      title: 'Alpha',
      status: 'backlog',
      blocked: 'waiting on the vendor API key',
    }),
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta', title: 'Beta', status: 'backlog' }),
  }, { WS: 2 }), (dir) => {
    const { status, stderr } = runGenerator(dir, []);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    const section = indexSection(dir, 'Ready to start (deps satisfied)').join('\n');
    assert.ok(
      section.includes('WS-2-abcdef'),
      `the unblocked workstream is missing from ready work:\n${section}`,
    );
    assert.ok(
      !section.includes('WS-1-abcdef'),
      `the blocked workstream is still listed as ready work:\n${section}`,
    );
  });
});

testCase('the index workstream row marks a blocked record in its status cell', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      slug: 'alpha',
      title: 'Alpha',
      status: 'backlog',
      blocked: 'waiting on the vendor API key',
    }),
  }), (dir) => {
    const { status, stderr } = runGenerator(dir, []);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    const row = indexSection(dir, 'Workstreams').find((l) => l.startsWith('| WS-1-abcdef '));
    assert.ok(row, 'index.md carries no WS-1-abcdef row in its Workstreams table');
    assert.ok(
      row.includes('| backlog (blocked) |'),
      `the workstream row does not mark the blocked flag:\n${row}`,
    );
  });
});

testCase('--list marks a blocked record in its status cell', () => {
  withFixture(baseTree({
    [WS1]: workstream({
      id: 'WS-1-abcdef',
      slug: 'alpha',
      title: 'Alpha',
      status: 'backlog',
      blocked: 'waiting on the vendor API key',
    }),
  }), (dir) => {
    const { status, stdout, stderr } = runGenerator(dir, ['--list', 'workstreams']);
    assert.strictEqual(status, 0, `--list exited ${status}\n${stderr}`);
    assert.ok(
      stdout.includes('| backlog (blocked) |'),
      `--list does not mark the blocked flag:\n${stdout}`,
    );
  });
});

// The generated board carries one column per artefact status plus Archive.
// With blocked gone from the enum, that is six columns and no Blocked one.
testCase('the generated board carries six columns and no Blocked column', () => {
  withFixture(baseTree(), (dir) => {
    const { status, stderr } = runGenerator(dir, []);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    const boardText = readRel(dir, 'flowcharge/kanban.md');
    const headers = boardText.split(/\r?\n/).filter((l) => l.startsWith('- # '));
    assert.deepStrictEqual(headers, [
      '- # Backlog',
      '- # Ready',
      '- # In Progress',
      '- # Done',
      '- # Dropped __archived__',
      '- # Archive __archived__',
    ], `the board column set changed:\n${boardText}`);
    assert.ok(!boardText.includes('Blocked'), `the board still names a Blocked column:\n${boardText}`);
  });
});

// ---- case: root resolution --------------------------------------------------
// resolveProjectRoot (fc-index.mjs:47-56) redirects --root to the enclosing
// git repository's common directory. This case runs default mode and asserts
// the summary counts belong to the temp tree, so a misresolution onto this
// repository fails loudly instead of passing silently.

testCase('default mode reports the temp tree own counts, not this repository', () => {
  withFixture(baseTree({
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({
      id: 'IL-1-abcdef',
      issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' }), issueBlock('ISS-2-abcdef')],
    }),
  }, { WS: 2, IL: 1, ISS: 2 }), (dir) => {
    const { status, stdout, stderr } = runGenerator(dir, []);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    compareWarnSets(warnLines(stdout), []);
    const lines = stdout.split(/\r?\n/).filter((l) => l.trim());
    assert.strictEqual(
      lines[lines.length - 1],
      'fc-index: 2 workstreams, 3 artefacts, 2 issues (1 open) → index.md + kanban.md',
    );
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), 'index.md was not written into the temp tree');
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), 'kanban.md was not written into the temp tree');
  });
});

// ---- cases: --sync close mode ----------------------------------------------
// Write-mode cases. They run without --check, so they use --no-board where the
// board is not under test, and they re-read the produced files rather than
// trusting the exit code.

const TL1 = 'flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md';
const IL1 = 'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md';
const PLN1 = 'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md';

const readRel = (dir, rel) => fs.readFileSync(path.join(dir, rel), 'utf8');
const mtimeOf = (dir, rel) => fs.statSync(path.join(dir, rel)).mtimeMs;

// The lines of one named `## ` section of a generated index.md, from just
// below the heading to the line before the next `## ` heading. Built on readRel
// the way the board assertions are, so a case can assert what the index does
// and does not list without matching the whole file.
function indexSection(dir, heading) {
  const lines = readRel(dir, 'flowcharge/index.md').split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith(`## ${heading}`));
  assert.notStrictEqual(start, -1, `index.md carries no "## ${heading}" section`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith('## '));
  return end === -1 ? rest : rest.slice(0, end);
}

// The fixture text with only its status: and updated: frontmatter lines
// changed, the only bytes --sync is permitted to write. Both patterns anchor
// at column 0, so the indented status: lines inside issue and task YAML blocks
// in a body are left alone, exactly as the generator leaves them.
const closedText = (text, day) =>
  text.replace(/^status: .*$/m, 'status: done').replace(/^updated: .*$/m, `updated: ${day}`);

// Runs the generator in --sync mode and compares its SYNC lines, as a set,
// against expectedLines. Returns the full stdout so a case can also inspect
// the WARN lines the same run printed.
function expectSync(dir, expectedLines, extraArgs = ['--no-board']) {
  const { status, stdout, stderr } = runGenerator(dir, ['--sync', ...extraArgs]);
  compareLineSets(stdout.split(/\r?\n/).filter((l) => l.startsWith('SYNC ')), expectedLines, 'SYNC');
  if (status !== 0) {
    throw new Error(
      `--sync exited ${status}, expected 0\n` +
      `  stdout:\n${stdout.trimEnd() || '    (empty)'}\n  stderr:\n${stderr.trimEnd() || '    (empty)'}`,
    );
  }
  return stdout;
}

// Asserts rel is byte-for-byte the fixture text with only those two lines
// substituted, rather than spot-checking the two lines themselves.
function expectClosedFile(dir, rel, fixtureText, day) {
  assert.strictEqual(
    readRel(dir, rel),
    closedText(fixtureText, day),
    `${rel} differs from the fixture by more than its status: and updated: lines`,
  );
}

testCase('--sync closes a task list whose tasks are all checked', () => {
  const day = today();
  const tlText = tasklist({ id: 'TL-1-abcdef', status: 'ready', updated: daysAgo(3), tasks: [taskLine(1, true), taskLine(2, true)] });
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    [TL1]: tlText,
  }, { TL: 1 }), (dir) => {
    expectSync(dir, [`SYNC TL-1-abcdef (${TL1}): ready → done (all 2 tasks checked)`]);
    expectClosedFile(dir, TL1, tlText, day);
  });
});

testCase('--sync closes an issue list whose issues are all closed', () => {
  const day = today();
  const ilText = issuelist({
    id: 'IL-1-abcdef', status: 'ready', updated: daysAgo(3),
    issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' }), issueBlock('ISS-2-abcdef', { checked: true, status: 'dropped' })],
  });
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    [IL1]: ilText,
  }, { IL: 1, ISS: 2 }), (dir) => {
    expectSync(dir, [`SYNC IL-1-abcdef (${IL1}): ready → done (all 2 issues closed)`]);
    expectClosedFile(dir, IL1, ilText, day);
  });
});

testCase('--sync closes a workstream whose artefacts are all closed', () => {
  const day = today();
  const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready', updated: daysAgo(3) });
  withFixture(baseTree({
    [WS1]: wsText,
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
    [IL1]: issuelist({ id: 'IL-1-abcdef', status: 'dropped', issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' })] }),
  }, { TL: 1, IL: 1, ISS: 1 }), (dir) => {
    expectSync(dir, [`SYNC WS-1-abcdef (${WS1}): ready → done (all 2 artefacts closed)`]);
    expectClosedFile(dir, WS1, wsText, day);
  });
});

testCase('--sync closes a task list and then the workstream it completes, in one pass', () => {
  const day = today();
  const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'in-progress', updated: daysAgo(3) });
  const tlText = tasklist({ id: 'TL-1-abcdef', status: 'in-progress', updated: daysAgo(3), tasks: [taskLine(1, true)] });
  withFixture(baseTree({ [WS1]: wsText, [TL1]: tlText }, { TL: 1 }), (dir) => {
    expectSync(dir, [
      `SYNC TL-1-abcdef (${TL1}): in-progress → done (all 1 tasks checked)`,
      `SYNC WS-1-abcdef (${WS1}): in-progress → done (all 1 artefacts closed)`,
    ]);
    expectClosedFile(dir, TL1, tlText, day);
    expectClosedFile(dir, WS1, wsText, day);
  });
});

testCase('a second --sync run changes no file and prints no SYNC line', () => {
  const day = today();
  const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready', updated: daysAgo(3) });
  const tlText = tasklist({ id: 'TL-1-abcdef', status: 'ready', updated: daysAgo(3), tasks: [taskLine(1, true)] });
  withFixture(baseTree({ [WS1]: wsText, [TL1]: tlText }, { TL: 1 }), (dir) => {
    expectSync(dir, [
      `SYNC TL-1-abcdef (${TL1}): ready → done (all 1 tasks checked)`,
      `SYNC WS-1-abcdef (${WS1}): ready → done (all 1 artefacts closed)`,
    ]);
    const after = [WS1, TL1].map((rel) => ({ rel, text: readRel(dir, rel), mtime: mtimeOf(dir, rel) }));
    expectSync(dir, []);
    for (const f of after) {
      assert.strictEqual(readRel(dir, f.rel), f.text, `${f.rel} was rewritten by the second --sync run`);
      assert.strictEqual(mtimeOf(dir, f.rel), f.mtime, `${f.rel} was touched by the second --sync run`);
      expectClosedFile(dir, TL1, tlText, day);
    }
  });
});

testCase('--sync never closes a workstream owning no artefact', () => {
  const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready' });
  withFixture(baseTree({ [WS1]: wsText }), (dir) => {
    expectSync(dir, []);
    assert.strictEqual(readRel(dir, WS1), wsText, 'a workstream owning no artefact was written');
  });
});

testCase('--sync names the blocking plan and closes neither it nor its workstream', () => {
  const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'in-progress' });
  const plnText = plan({ id: 'PLN-1-abcdef', status: 'ready' });
  withFixture(baseTree({
    [WS1]: wsText,
    [PLN1]: plnText,
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
  }, { PLN: 1, TL: 1 }), (dir) => {
    const stdout = expectSync(dir, []);
    assert.ok(
      warnLines(stdout).includes('WS-1-abcdef: every artefact closed except PLN-1-abcdef (ready): close the plan to close the workstream'),
      `plan-blocker WARN missing from:\n${stdout}`,
    );
    assert.strictEqual(readRel(dir, WS1), wsText, 'the blocked workstream was written');
    assert.strictEqual(readRel(dir, PLN1), plnText, '--sync wrote a plan');
  });
});

testCase('--check warns about a workstream whose artefacts are all closed', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready' }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
    [IL1]: issuelist({ id: 'IL-1-abcdef', status: 'done', issues: [issueBlock('ISS-1-abcdef', { checked: true, status: 'done' })] }),
  }, { TL: 1, IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): all 2 artefacts closed but status is "ready". Close it?`]);
  });
});

testCase('clean: a workstream already closed alongside its artefacts warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('--check warns about a done workstream that still owns an open plan', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    [PLN1]: plan({ id: 'PLN-1-abcdef', status: 'ready' }),
  }, { PLN: 1 }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): status is "done" but 1 of its 1 artefacts are still open. Reopen it?`]);
  });
});

testCase('--check warns about a dropped workstream that still owns an open task list', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'dropped' }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'ready', tasks: [taskLine(1, false)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): status is "dropped" but 1 of its 1 artefacts are still open. Reopen it?`]);
  });
});

testCase('--check warns about a closed workstream that still carries a blocked reason', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done', blocked: 'waiting on the vendor API key' }),
  }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): status is "done" but it still carries a blocked reason: clear the blocked key`]);
  });
});

testCase('clean: a done workstream whose artefacts are all closed raises no reopen WARN', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'done', tasks: [taskLine(1, true)] }),
    [PLN1]: plan({ id: 'PLN-1-abcdef', status: 'dropped' }),
  }, { TL: 1, PLN: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: a done workstream carrying no blocked key warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'done' }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

for (const combo of [['--check'], ['--list'], ['--claim', 'WS']]) {
  testCase(`--sync ${combo.join(' ')} exits 1 with one stderr line and writes nothing`, () => {
    const wsText = workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready' });
    const tlText = tasklist({ id: 'TL-1-abcdef', status: 'ready', tasks: [taskLine(1, true)] });
    withFixture(baseTree({ [WS1]: wsText, [TL1]: tlText }, { TL: 1 }), (dir) => {
      const { status, stdout, stderr } = runGenerator(dir, ['--sync', ...combo]);
      assert.strictEqual(status, 1, `expected exit 1, got ${status}\n  stdout:\n${stdout}`);
      const errLines = stderr.split(/\r?\n/).filter((l) => l.trim());
      assert.strictEqual(errLines.length, 1, `expected one stderr line, got:\n${stderr}`);
      assert.strictEqual(stdout, '', `expected no stdout, got:\n${stdout}`);
      assert.strictEqual(readRel(dir, WS1), wsText, 'the workstream was written by a refused run');
      assert.strictEqual(readRel(dir, TL1), tlText, 'the task list was written by a refused run');
      for (const rel of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids']) {
        assert.ok(!fs.existsSync(path.join(dir, rel)), `${rel} was created by a refused run`);
      }
    });
  });
}

testCase('--sync --no-board writes index.md and leaves the board alone', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', status: 'ready' }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', status: 'ready', tasks: [taskLine(1, true)] }),
  }, { TL: 1 }), (dir) => {
    expectSync(dir, [
      `SYNC TL-1-abcdef (${TL1}): ready → done (all 1 tasks checked)`,
      `SYNC WS-1-abcdef (${WS1}): ready → done (all 1 artefacts closed)`,
    ]);
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), 'index.md was not written');
    assert.ok(!fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), 'kanban.md was written despite --no-board');
  });
});

// ---- cases: required frontmatter keys --------------------------------------
// One case per required key, omitting exactly that key from an otherwise clean
// record. `id` is absent from this list on purpose: a record with no id never
// reaches the schema check, because the scan excludes it first. The case below
// asserts that instead.

const WS_REQUIRED_KEYS = ['type', 'workstream', 'slug', 'title', 'status', 'created', 'updated', 'depends_on', 'links', 'tags'];

for (const key of WS_REQUIRED_KEYS) {
  testCase(`a workstream record missing ${key} warns, naming the key and the type`, () => {
    // Dropping type: leaves the record typeless, so the warning reports the
    // empty type it actually read, and the per-type keys no longer apply.
    const type = key === 'type' ? '' : 'workstream';
    const expected = [`WS-1-abcdef (${WS1}): missing required frontmatter key "${key}" for type "${type}"`];
    // An absent status also leaves the enum check an empty value to report.
    if (key === 'status') expected.push(`${WS1}: status "" not in enum`);
    withFixture(baseTree({
      [WS1]: withoutKey(workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha' }), key),
    }), (dir) => {
      expectWarns(dir, expected);
    });
  });
}

testCase('a record missing id is excluded by the scan before the schema check', () => {
  withFixture(baseTree({
    [WS1]: withoutKey(workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha' }), 'id'),
  }), (dir) => {
    // The excluded record takes WS-1-abcdef out of the scan, which leaves the WS
    // counter with neither an artefact nor a marker behind it. The second line
    // is that counter check firing correctly, not a side effect of the first.
    expectWarns(dir, [
      `${WS1}: missing frontmatter or id, excluded from index`,
      'ids.md: WS counter is 1 but no WS-1 artefact or marker exists',
    ]);
  });
});

testCase('clean: a workstream record carrying every required key warns about nothing', () => {
  withFixture(baseTree(), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a task list missing mode warns, naming the key and the type', () => {
  withFixture(baseTree({
    [TL1]: withoutKey(tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false)] }), 'mode'),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}): missing required frontmatter key "mode" for type "tasklist"`]);
  });
});

testCase('a task list whose mode is outside the enum warns', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', mode: 'neither', tasks: [taskLine(1, false)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}): mode "neither" not in enum (expected: spec, diff)`]);
  });
});

testCase('clean: a task list whose mode is diff warns about nothing', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', mode: 'diff', tasks: [taskLine(1, false)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: workstream self-reference --------------------------------------

testCase('a workstream whose workstream key names another id warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', workstream: 'WS-2-abcdef' }),
  }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): workstream key "WS-2-abcdef" is not its own id`]);
  });
});

testCase('clean: a workstream naming itself warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', workstream: 'WS-1-abcdef' }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: updated vs mtime -----------------------------------------------
// Both cases pin the file's mtime, so neither depends on when the run happens.

testCase('an artefact modified two days after its updated date warns with both dates', () => {
  const stale = daysAgo(2);
  const day = today();
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', updated: stale }),
  }), (dir) => {
    setMtime(dir, WS1, day);
    expectWarns(dir, [`WS-1-abcdef (${WS1}): updated ${stale} but file modified ${day}: bump updated on every edit`]);
  });
});

testCase('clean: an artefact modified inside the one-day grace warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', updated: daysAgo(1) }),
  }), (dir) => {
    setMtime(dir, WS1, today());
    expectWarns(dir, []);
  });
});

// ---- cases: filename, folder and body shape --------------------------------

testCase('a filename outside the allowed set for its type warns', () => {
  const rel = 'flowcharge/workstreams/WS-1-abcdef-alpha/plan-v2.md';
  withFixture(baseTree({ [rel]: plan({ id: 'PLN-1-abcdef' }) }, { PLN: 1 }), (dir) => {
    expectWarns(dir, [`${rel}: filename not allowed for type "plan" (expected: <PLN-id>-plan.md)`]);
  });
});

testCase('clean: a qualified issue-list filename is allowed', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist-second.md': issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: the ID-prefixed filename form ----------------------------------
// The prefix is the artefact's own frontmatter id, one hyphen, then the plain
// name, with any qualifier kept as a tail. The bare form stays valid and is
// warned about, never excluded, because no registered project's tree is
// migrated yet.

testCase('clean: an ID-prefixed plan filename is allowed', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef' }),
  }, { PLN: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// Two fixtures rather than two files in one tree: both names carry the same id,
// so a single tree holding both would report a duplicate id instead of a
// filename result.
testCase('clean: an ID-prefixed issue-list filename is allowed, primary and qualified', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist-second.md': issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: an ID-prefixed task-list filename is allowed, primary and qualified', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist.md': tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/TL-1-abcdef-tasklist-bugs.md': tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false)] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a legacy plan filename warns and names its ID-prefixed replacement', () => {
  const rel = 'flowcharge/workstreams/WS-1-abcdef-alpha/plan.md';
  withFixture(baseTree({ [rel]: plan({ id: 'PLN-1-abcdef' }) }, { PLN: 1 }), (dir) => {
    expectWarns(dir, [`${rel}: legacy filename: rename to PLN-1-abcdef-plan.md to carry its id`]);
  });
});

testCase('a legacy issue-list filename warns, bare and qualified alike', () => {
  const bare = 'flowcharge/workstreams/WS-1-abcdef-alpha/issuelist.md';
  withFixture(baseTree({ [bare]: issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }) }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [`${bare}: legacy filename: rename to IL-1-abcdef-issuelist.md to carry its id`]);
  });
  const qualified = 'flowcharge/workstreams/WS-1-abcdef-alpha/issuelist-second.md';
  withFixture(baseTree({ [qualified]: issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }) }, { IL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, [`${qualified}: legacy filename: rename to IL-1-abcdef-issuelist-second.md to carry its id`]);
  });
});

testCase('a legacy task-list filename warns and names its ID-prefixed replacement', () => {
  const rel = 'flowcharge/workstreams/WS-1-abcdef-alpha/tasklist.md';
  withFixture(baseTree({ [rel]: tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false)] }) }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`${rel}: legacy filename: rename to TL-1-abcdef-tasklist.md to carry its id`]);
  });
});

// A prefixed name carries no legacy fault, so this tree reports the
// disagreement alone. The two checks cannot both fire on one file.
testCase('a filename id-prefix disagreeing with the frontmatter id warns', () => {
  const rel = 'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-2-abcdef-plan.md';
  withFixture(baseTree({ [rel]: plan({ id: 'PLN-1-abcdef' }) }, { PLN: 1 }), (dir) => {
    expectWarns(dir, [
      `PLN-1-abcdef (${rel}): filename id-prefix "PLN-2-abcdef" disagrees with frontmatter id "PLN-1-abcdef"`,
    ]);
  });
});

// A prefix of the wrong type draws two lines, not one: the plan rule accepts a
// PLN prefix only, and the IL prefix also disagrees with the record's own id.
testCase('a cross-type id-prefix warns for the filename and for the prefix', () => {
  const rel = 'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-plan.md';
  withFixture(baseTree({ [rel]: plan({ id: 'PLN-1-abcdef' }) }, { PLN: 1 }), (dir) => {
    expectWarns(dir, [
      `${rel}: filename not allowed for type "plan" (expected: <PLN-id>-plan.md)`,
      `PLN-1-abcdef (${rel}): filename id-prefix "IL-1-abcdef" disagrees with frontmatter id "PLN-1-abcdef"`,
    ]);
  });
});

testCase('clean: a plain workstream.md filename raises no filename WARN', () => {
  withFixture(baseTree(), (dir) => {
    expectWarns(dir, []);
  });
});

// The workstream record keeps its plain name, and the scan filter admits a PLN,
// IL or TL prefix only. A WS-prefixed record therefore never enters the
// artefact scan at all, so what the tree reports is the folder marker missing,
// not a filename fault. See Divergence 1 in the task list.
testCase('an ID-prefixed workstream record leaves its folder unmarked', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-2-abcdef-beta/WS-2-abcdef-workstream.md': workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
  }), (dir) => {
    expectWarns(dir, ['flowcharge/workstreams/WS-2-abcdef-beta/: no workstream.md, not a workstream folder']);
  });
});

testCase('a workstream folder disagreeing with its id and slug warns', () => {
  // Not baseTree: the record sits in the wrong folder, and a second folder
  // holding the right name would report a missing record of its own.
  const rel = 'flowcharge/workstreams/WS-1-abcdef-wrong/workstream.md';
  withFixture({
    'flowcharge/ids.md': registry({ WS: 1 }),
    'flowcharge/tags.md': tagPool(),
    [rel]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha' }),
  }, (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${rel}): folder "WS-1-abcdef-wrong" should be "WS-1-abcdef-alpha" per its id and slug`]);
  });
});

testCase('clean: a workstream folder matching its id and slug warns about nothing', () => {
  withFixture({
    'flowcharge/ids.md': registry({ WS: 1 }),
    'flowcharge/tags.md': tagPool(),
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha' }),
  }, (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a folder under workstreams holding no workstream.md warns', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-2-abcdef-beta/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef', workstream: 'WS-2-abcdef', slug: 'beta' }),
  }, { PLN: 1 }), (dir) => {
    expectWarns(dir, ['flowcharge/workstreams/WS-2-abcdef-beta/: no workstream.md, not a workstream folder']);
  });
});

testCase('clean: every folder holding its own record warns about nothing', () => {
  withFixture(baseTree({
    [WS2]: workstream({ id: 'WS-2-abcdef', slug: 'beta' }),
    'flowcharge/workstreams/WS-2-abcdef-beta/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef', workstream: 'WS-2-abcdef', slug: 'beta' }),
  }, { WS: 2, PLN: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a workstream body of headings only warns that the card description is missing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', body: '# Heading\n\n## Another heading\n' }),
  }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): body has no card-description line`]);
  });
});

testCase('clean: a workstream body whose description follows a heading warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', body: '# Heading\n\nThe card description line.\n' }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// The board reads the trimmed line, so the boundary is asserted on the trimmed
// length: 201 characters warns, 200 does not.
testCase('a workstream first body line of 201 characters warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', body: `  ${'x'.repeat(201)}  \n` }),
  }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): first body line is 201 characters: the board shows only 200`]);
  });
});

testCase('clean: a workstream first body line of 200 characters warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', body: `  ${'x'.repeat(200)}  \n` }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// A present blocked key with no reason in it is a defect: an absent key already
// says "not blocked". Whitespace-only is the same defect, because the record
// field is trimmed at scan time.
const BLOCKED_EMPTY = `WS-1-abcdef (${WS1}): blocked is present but empty: give the reason or remove the key`;

testCase('a workstream with an empty blocked value warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', blocked: '' }),
  }), (dir) => {
    expectWarns(dir, [BLOCKED_EMPTY]);
  });
});

testCase('a workstream with a whitespace-only blocked value warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', blocked: '   ' }),
  }), (dir) => {
    expectWarns(dir, [BLOCKED_EMPTY]);
  });
});

// ---- case: several conditions in one tree ----------------------------------
// A single-condition case cannot see an ordering or duplication bug, so one
// tree carries five faults at once and the whole WARN set is asserted.

testCase('a tree carrying several schema and shape faults warns about each of them', () => {
  const stale = daysAgo(2);
  const day = today();
  const planRel = 'flowcharge/workstreams/WS-1-abcdef-alpha/plan-v2.md';
  const taskRel = 'flowcharge/workstreams/WS-2-abcdef-beta/TL-1-abcdef-tasklist.md';
  withFixture({
    'flowcharge/ids.md': registry({ WS: 1, PLN: 1, TL: 1 }),
    'flowcharge/tags.md': tagPool(),
    [WS1]: withoutKey(workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', body: `${'y'.repeat(201)}\n` }), 'tags'),
    [planRel]: plan({ id: 'PLN-1-abcdef', updated: stale }),
    [taskRel]: tasklist({ id: 'TL-1-abcdef', workstream: 'WS-2-abcdef', slug: 'beta', mode: 'neither', tasks: [taskLine(1, false)] }),
  }, (dir) => {
    setMtime(dir, planRel, day);
    expectWarns(dir, [
      `WS-1-abcdef (${WS1}): missing required frontmatter key "tags" for type "workstream"`,
      `WS-1-abcdef (${WS1}): first body line is 201 characters: the board shows only 200`,
      `${planRel}: filename not allowed for type "plan" (expected: <PLN-id>-plan.md)`,
      `PLN-1-abcdef (${planRel}): updated ${stale} but file modified ${day}: bump updated on every edit`,
      `TL-1-abcdef (${taskRel}): mode "neither" not in enum (expected: spec, diff)`,
      'flowcharge/workstreams/WS-2-abcdef-beta/: no workstream.md, not a workstream folder',
    ]);
  });
});

// ---- cases: tag pool membership --------------------------------------------
// The generator's own check is a literal edit-distance backstop, not a synonym
// finder: orchestrator sits two edits from orchestration and draws a
// suggestion, while gating sits three from gates and draws none. Both forms of
// the WARN are asserted in one case, so a change to either string fails here.

testCase('a workstream tag outside the pool warns, with a nearest match only when one is close', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', tags: ['orchestrator', 'gating'] }),
  }), (dir) => {
    expectWarns(dir, [
      `WS-1-abcdef (${WS1}): tag "#orchestrator" not in the tag pool, nearest defined tag: "#orchestration"`,
      `WS-1-abcdef (${WS1}): tag "#gating" not in the tag pool`,
    ]);
  });
});

testCase('clean: tags listed in the pool warn about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', tags: ['orchestration', 'gates'] }),
  }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: --new-ws scaffold mode -----------------------------------------
// Write-mode cases. They re-read the record the generator wrote rather than
// trusting its exit code, and they count the marker directories under
// flowcharge/ids/ so a leaked claim cannot pass unnoticed.

// The exact record --new-ws writes: every required key at a valid value, in
// CONVENTIONS.md's key order, and an empty body.
const newWsRecord = (id, slug, title, o = {}) =>
  [
    '---',
    `id: ${id}`,
    'type: workstream',
    `workstream: ${id}`,
    `slug: ${slug}`,
    `title: "${title}"`,
    `status: ${o.status !== undefined ? o.status : 'backlog'}`,
    `tags: [${(o.tags || []).join(', ')}]`,
    `created: ${o.day}`,
    `updated: ${o.day}`,
    `author: ${gitAuthor()}`,
    'depends_on: []',
    'links: []',
    '---',
    '',
  ].join('\n');

const idsEntries = (dir) => {
  const p = path.join(dir, 'flowcharge', 'ids');
  return fs.existsSync(p) ? fs.readdirSync(p).sort() : [];
};

const wsFolders = (dir) => fs.readdirSync(path.join(dir, 'flowcharge', 'workstreams')).sort();

const outLines = (s) => s.split(/\r?\n/).filter((l) => l.length);

// A fixture id carries the fixed sample suffix, but an id the generator claims
// carries a suffix drawn at claim time. Such an id is asserted by shape and
// then read back into whatever the case derives from it, never pinned to a
// literal.
const assertIdShape = (id, type, what) =>
  assert.ok(
    new RegExp(`^${type}-\\d+-[0-9a-z]{6}$`).test(id),
    `${what}: "${id}" is not a ${type}-N-SUFFIX id`,
  );

// Asserts one stderr line and no stdout, the shape every refusal takes.
function expectRefusal(res, what) {
  assert.strictEqual(res.status, 1, `${what}: expected exit 1, got ${res.status}\n  stdout:\n${res.stdout}`);
  assert.strictEqual(res.stdout, '', `${what}: expected no stdout, got:\n${res.stdout}`);
  const errLines = outLines(res.stderr);
  assert.strictEqual(errLines.length, 1, `${what}: expected one stderr line, got:\n${res.stderr}`);
}

// An empty spec: fixture() still creates flowcharge/workstreams/, which the
// generator requires, so --new-ws claims WS-1-abcdef in a tree holding nothing else.
const EMPTY_TREE = {};

testCase('--new-ws writes a complete record and prints the claimed id and its path', () => {
  const day = today();
  withFixture(EMPTY_TREE, (dir) => {
    const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream']);
    assert.strictEqual(res.status, 0, `--new-ws exited ${res.status}\n${res.stderr}`);
    // The claimed suffix is random, so the printed id is asserted by shape and
    // the folder, path, record and marker are all derived from it.
    const printed = outLines(res.stdout);
    assertIdShape(printed[0], 'WS', '--new-ws printed id');
    const id = printed[0];
    const rel = `flowcharge/workstreams/${id}-demo/workstream.md`;
    assert.deepStrictEqual(printed, [id, rel]);
    // Byte comparison, so an added, missing, misordered or misvalued key fails.
    // Defaults are asserted here: no --tags gives tags: [], no --status gives
    // status: backlog.
    assert.strictEqual(readRel(dir, rel), newWsRecord(id, 'demo', 'Demo workstream', { day }));
    assert.strictEqual(readRel(dir, rel).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ''), '', 'the body is not empty');
    assert.deepStrictEqual(idsEntries(dir), [id], 'the marker directory for the claimed id is missing');
  });
});

testCase('--new-ws honours --tags and --status', () => {
  const day = today();
  withFixture(EMPTY_TREE, (dir) => {
    const res = runGenerator(dir, [
      '--new-ws', 'demo', '--title', 'Demo workstream', '--tags', 'generator,skill-files', '--status', 'ready',
    ]);
    assert.strictEqual(res.status, 0, `--new-ws exited ${res.status}\n${res.stderr}`);
    const id = outLines(res.stdout)[0];
    assertIdShape(id, 'WS', '--new-ws printed id');
    const rel = `flowcharge/workstreams/${id}-demo/workstream.md`;
    assert.strictEqual(
      readRel(dir, rel),
      newWsRecord(id, 'demo', 'Demo workstream', { day, tags: ['generator', 'skill-files'], status: 'ready' }),
    );
  });
});

testCase('--new-ws with no --status writes the literal line status: backlog', () => {
  withFixture(EMPTY_TREE, (dir) => {
    const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream']);
    assert.strictEqual(res.status, 0, `--new-ws exited ${res.status}\n${res.stderr}`);
    const id = outLines(res.stdout)[0];
    assertIdShape(id, 'WS', '--new-ws printed id');
    const rel = `flowcharge/workstreams/${id}-demo/workstream.md`;
    // The expected line is written out here, not built from newWsRecord: this
    // case pins the script's own creation default, so the fixture and the
    // script cannot drift together unnoticed.
    assert.ok(
      outLines(readRel(dir, rel)).includes('status: backlog'),
      `the record does not carry the line "status: backlog":\n${readRel(dir, rel)}`,
    );
  });
});

testCase('a tree scaffolded by --new-ws produces no frontmatter WARN in a default scan', () => {
  // The pool file is the one thing the tree carries: --new-ws does not seed it,
  // and its absence would add an advisory line to the set asserted below.
  withFixture({ 'flowcharge/tags.md': tagPool() }, (dir) => {
    const scaffold = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream']);
    assert.strictEqual(scaffold.status, 0, `--new-ws exited ${scaffold.status}\n${scaffold.stderr}`);
    const id = outLines(scaffold.stdout)[0];
    assertIdShape(id, 'WS', '--new-ws printed id');
    const { status, stdout, stderr } = runGenerator(dir, []);
    // Exactly one warning, and it does not concern frontmatter: the body the
    // command deliberately leaves for the agent to append. --new-ws now writes
    // the registry back itself, so no registry warning applies.
    compareWarnSets(warnLines(stdout), [
      `${id} (flowcharge/workstreams/${id}-demo/workstream.md): body has no card-description line`,
    ]);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    // The scan writes both views into the fixture; that is expected output.
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), 'index.md was not written');
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), 'kanban.md was not written');
  });
});

testCase('--new-ws refuses a slug an existing folder carries and leaks no marker', () => {
  withFixture(EMPTY_TREE, (dir) => {
    const first = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream']);
    assert.strictEqual(first.status, 0, `the first --new-ws exited ${first.status}\n${first.stderr}`);
    const id = outLines(first.stdout)[0];
    assertIdShape(id, 'WS', '--new-ws printed id');
    const markersBefore = idsEntries(dir);
    const second = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo again']);
    expectRefusal(second, '--new-ws on a taken slug');
    assert.deepStrictEqual(idsEntries(dir), markersBefore, 'the refused run leaked a marker directory');
    assert.deepStrictEqual(wsFolders(dir), [`${id}-demo`], 'the refused run created a folder');
  });
});

testCase('--claim prints its ids and writes the registry back after the allocateIds refactor', () => {
  withFixture(baseTree(), (dir) => {
    const res = runGenerator(dir, ['--claim', 'TL', '2']);
    assert.strictEqual(res.status, 0, `--claim exited ${res.status}\n${res.stderr}`);
    // Two ids of the right shape, numbered 1 and 2: the suffixes are random, so
    // only the numbering and the shape are pinned, and the marker directories
    // are compared against the ids the run actually printed.
    const printed = outLines(res.stdout);
    assert.strictEqual(printed.length, 2, `--claim stdout changed:\n${res.stdout}`);
    for (const id of printed) assertIdShape(id, 'TL', '--claim printed id');
    assert.deepStrictEqual(printed.map((id) => id.split('-')[1]), ['1', '2'], '--claim numbering changed');
    assert.strictEqual(res.stderr, '', `--claim wrote to stderr:\n${res.stderr}`);
    assert.deepStrictEqual(idsEntries(dir), [...printed].sort(), '--claim did not create its marker directories');
    assert.strictEqual(
      readRel(dir, 'flowcharge/ids.md'),
      registry({ WS: 1, TL: 2 }),
      '--claim registry write-back changed',
    );
  });
});

for (const combo of [['--list'], ['--claim', 'WS'], ['--check'], ['--sync']]) {
  testCase(`--new-ws ${combo.join(' ')} exits 1 with one stderr line and writes nothing`, () => {
    withFixture(EMPTY_TREE, (dir) => {
      const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo workstream', ...combo]);
      expectRefusal(res, `--new-ws ${combo.join(' ')}`);
      assert.deepStrictEqual(wsFolders(dir), [], 'a refused run created a workstream folder');
      assert.deepStrictEqual(idsEntries(dir), [], 'a refused run claimed an id');
    });
  });
}

// --status validates against the narrowed enum, so blocked is refused here the
// same way any unknown value is, and the run claims nothing.
testCase('--new-ws --status blocked is refused and writes nothing', () => {
  withFixture(EMPTY_TREE, (dir) => {
    const res = runGenerator(dir, ['--new-ws', 'demo', '--title', 'Demo', '--status', 'blocked']);
    expectRefusal(res, '--new-ws --status blocked');
    assert.deepStrictEqual(wsFolders(dir), [], 'a refused run created a workstream folder');
    assert.deepStrictEqual(idsEntries(dir), [], 'a refused run claimed an id');
  });
});

// ---- cases: --init mode ----------------------------------------------------
// --init creates flowcharge/workstreams/ (and, transitively, flowcharge/) when
// it does not already exist, then falls through into the same regenerate path
// the default mode runs. These cases build from fixtureNoWorkstreamsTree()/
// withNoWorkstreamsFixture(), not fixture()/withFixture(): the point of --init
// is that it works when flowcharge/workstreams/ does not exist yet, the one
// thing fixture() never leaves absent.

testCase('--init on a tree with no flowcharge/ at all creates it and exits 0 with exactly two WARN lines', () => {
  withNoWorkstreamsFixture({}, (dir) => {
    const res = runGenerator(dir, ['--init']);
    assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
    assert.strictEqual(res.stderr, '', `--init wrote to stderr:\n${res.stderr}`);
    compareWarnSets(warnLines(res.stdout), [
      'flowcharge/tags.md missing, tag validation skipped',
      'flowcharge/ids.md missing: create it before allocating new IDs',
    ]);
    assert.ok(
      res.stdout.includes('fc-index: 0 workstreams, 0 artefacts, 0 issues (0 open)'),
      `--init summary line changed:\n${res.stdout}`,
    );
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'workstreams')), '--init did not create flowcharge/workstreams/');
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), '--init did not write index.md');
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), '--init did not write kanban.md');
  });
});

testCase('--init claims no id and writes no workstream folder or ids.md', () => {
  withNoWorkstreamsFixture({}, (dir) => {
    const res = runGenerator(dir, ['--init']);
    assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
    assert.deepStrictEqual(wsFolders(dir), [], '--init created a workstream folder');
    assert.deepStrictEqual(idsEntries(dir), [], '--init claimed an id');
    assert.ok(!fs.existsSync(path.join(dir, 'flowcharge', 'ids.md')), '--init wrote flowcharge/ids.md');
  });
});

// This case cannot discriminate against an unmodified generator: with
// flowcharge/workstreams/ already present, an unrecognised --init token is
// silently ignored today and the run already falls through to the default
// regenerate path with no change from this task. It is here as a regression
// guard for the no-op contract (PLN-6-uoxfrt Scope acceptance criterion 3),
// not as proof the flag is implemented; that proof lives in the two cases
// above and the refusal loop below.
testCase('--init against a tree already holding a workstream is a no-op on that data and still regenerates', () => {
  withFixture(baseTree(), (dir) => {
    const before = readRel(dir, WS1);
    const res = runGenerator(dir, ['--init']);
    assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
    assert.strictEqual(readRel(dir, WS1), before, '--init altered an existing workstream record');
    assert.deepStrictEqual(wsFolders(dir), ['WS-1-abcdef-alpha'], '--init changed the workstream folder set');
    assert.ok(
      res.stdout.includes('fc-index: 1 workstreams, 1 artefacts, 0 issues (0 open)'),
      `--init summary line changed:\n${res.stdout}`,
    );
  });
});

for (const combo of [['--check'], ['--list'], ['--claim', 'WS'], ['--new-ws', 'demo', '--title', 'Demo'], ['--sync'], ['--whoami']]) {
  testCase(`--init ${combo.join(' ')} exits 1 with one stderr line and writes nothing`, () => {
    withFixture(EMPTY_TREE, (dir) => {
      const res = runGenerator(dir, ['--init', ...combo]);
      expectRefusal(res, `--init ${combo.join(' ')}`);
      assert.deepStrictEqual(wsFolders(dir), [], `--init ${combo.join(' ')} created a workstream folder`);
      assert.deepStrictEqual(idsEntries(dir), [], `--init ${combo.join(' ')} claimed an id`);
      for (const rel of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids.md', '.gitignore']) {
        assert.ok(!fs.existsSync(path.join(dir, rel)), `--init ${combo.join(' ')} wrote ${rel}`);
      }
    });
  });
}

testCase('--init --no-board writes index.md only and leaves kanban.md untouched', () => {
  withNoWorkstreamsFixture({}, (dir) => {
    const res = runGenerator(dir, ['--init', '--no-board']);
    assert.strictEqual(res.status, 0, `--init --no-board exited ${res.status}\n${res.stderr}`);
    assert.ok(fs.existsSync(path.join(dir, 'flowcharge', 'index.md')), '--init --no-board did not write index.md');
    assert.ok(!fs.existsSync(path.join(dir, 'flowcharge', 'kanban.md')), '--init --no-board wrote kanban.md');
  });
});

testCase('--init appends the standard three lines to a project with no .gitignore yet', () => {
  withNoWorkstreamsFixture({}, (dir) => {
    const res = runGenerator(dir, ['--init']);
    assert.strictEqual(res.status, 0, `--init exited ${res.status}\n${res.stderr}`);
    const gi = readRel(dir, '.gitignore');
    for (const line of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids/']) {
      assert.ok(gi.includes(line), `--init did not add "${line}" to .gitignore:\n${gi}`);
    }
  });
});

// ---- cases: ID graph (orphan markers, counters ahead, links: and issues:) ---
// The marker cases pin the marker directory's mtime rather than accepting
// whatever the filesystem set at creation, because the age the WARN reports is
// derived from it. The two grace-period cases sit half a day and three days
// out, clearly on each side of the one-day boundary, so neither can flake.

// Creates flowcharge/ids/<id>/ as a directory (a marker is a directory, not a
// file, so fixture()'s spec map cannot express it) and ages it by ageDays.
function marker(dir, id, ageDays = 0) {
  const p = path.join(dir, 'flowcharge', 'ids', id);
  fs.mkdirSync(p, { recursive: true });
  if (ageDays) {
    const t = new Date(Date.now() - ageDays * 86400000);
    fs.utimesSync(p, t, t);
  }
}

// A task line carrying an indented issues: inline array below it, the way the
// key is written in task YAML. taskLine() above produces the bare line.
const taskIssues = (n, ids) => `- [ ] ${n}. Fixture task\n  issues: [${ids.join(', ')}]\n`;
const childTaskIssues = (n, ids) => `  - [ ] ${n} Fixture child task\n    issues: [${ids.join(', ')}]\n`;

testCase('a marker directory past the grace period with no artefact warns with its age', () => {
  withFixture(baseTree({}, { PLN: 2 }), (dir) => {
    marker(dir, 'PLN-2-abcdef', 3);
    expectWarns(dir, ['flowcharge/ids/PLN-2-abcdef: claimed 3 days ago but no artefact carries it']);
  });
});

testCase('clean: a marker directory inside the grace period warns about nothing', () => {
  withFixture(baseTree({}, { PLN: 2 }), (dir) => {
    marker(dir, 'PLN-2-abcdef', 0.5);
    expectWarns(dir, []);
  });
});

testCase('clean: an aged marker whose id an artefact carries warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef' }),
  }, { PLN: 1 }), (dir) => {
    marker(dir, 'PLN-1-abcdef', 5);
    expectWarns(dir, []);
  });
});

// Resolution goes through byId, which holds issue ids as well as artefact ids,
// so an ISS marker resolves against its issue record. Asserted, not assumed.
testCase('clean: an aged ISS marker resolving against an issue record warns about nothing', () => {
  withFixture(baseTree({
    'flowcharge/workstreams/WS-1-abcdef-alpha/IL-1-abcdef-issuelist.md': issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }),
  }, { IL: 1, ISS: 1 }), (dir) => {
    marker(dir, 'ISS-1-abcdef', 5);
    expectWarns(dir, []);
  });
});

testCase('a registry counter ahead of both the artefacts and the markers warns', () => {
  withFixture(baseTree({}, { PLN: 4 }), (dir) => {
    expectWarns(dir, ['ids.md: PLN counter is 4 but no PLN-4 artefact or marker exists']);
  });
});

// A counter with no artefact but a matching marker is a claim in flight, not
// drift: the marker is a source, so the counter is justified.
testCase('clean: a counter matched by a marker with no artefact yet warns about nothing', () => {
  withFixture(baseTree({}, { PLN: 4 }), (dir) => {
    marker(dir, 'PLN-4-abcdef', 0.5);
    expectWarns(dir, []);
  });
});

testCase('the counter-behind warning still fires with its original string beside the new checks', () => {
  withFixture(baseTree({}, { WS: 0 }), (dir) => {
    marker(dir, 'WS-1-abcdef', 0.5);
    expectWarns(dir, ['ids.md: WS counter is 0 but WS-1 exists, registry behind']);
  });
});

testCase('an unresolved links target warns', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', links: ['PLN-99-abcdef'] }),
  }), (dir) => {
    expectWarns(dir, [`WS-1-abcdef (${WS1}): links unknown id PLN-99-abcdef`]);
  });
});

testCase('clean: a links target that resolves warns about nothing', () => {
  withFixture(baseTree({
    [WS1]: workstream({ id: 'WS-1-abcdef', slug: 'alpha', title: 'Alpha', links: ['PLN-1-abcdef'] }),
    'flowcharge/workstreams/WS-1-abcdef-alpha/PLN-1-abcdef-plan.md': plan({ id: 'PLN-1-abcdef' }),
  }, { PLN: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('an unresolved issues target on a task line warns, naming the task number', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskIssues(1, ['ISS-99-abcdef'])] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1: issues unknown id ISS-99-abcdef`]);
  });
});

testCase('an unresolved issues target on a child task line names the child number', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskLine(1, false), childTaskIssues('1.1', ['ISS-99-abcdef'])] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1.1: issues unknown id ISS-99-abcdef`]);
  });
});

// ---- cases: mini-shape audit (checkMiniTasks) ------------------------------
// A mini task carries verify: and no checklist:. taskLine() carries no YAML, so
// it reads as neither shape and never trips the audit.

const miniTask = (n, pattern) =>
  `- [ ] ${n}. Fixture mini task\n  pattern: "${pattern}"\n  verify:\n    - "grep -c x file"\n`;
const miniChild = (n, pattern) =>
  `  - [ ] ${n} Fixture mini child\n    pattern: "${pattern}"\n    verify:\n      - "grep -c x file"\n`;
const fullTask = (n, pattern) =>
  `- [ ] ${n}. Fixture full task\n  pattern: "${pattern}"\n  verify:\n    - "grep -c x file"\n  checklist:\n    - "source: x"\n`;

testCase('a mini task whose pattern names two files warns', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [miniTask(1, 'src/a.ts, src/b.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1: mini shape but pattern names more than one file`]);
  });
});

testCase('a mini task whose pattern is a glob warns the same way', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [miniTask(1, 'src/**/*.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1: mini shape but pattern names more than one file`]);
  });
});

testCase('a mini task with a child line beneath it warns', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [miniTask(1, 'src/a.ts'), miniChild('1.1', 'src/b.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, [`TL-1-abcdef (${TL1}) task 1: mini shape but has sub-tasks`]);
  });
});

testCase('clean: a mini adult and a mini child naming one file each warn about nothing', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [miniTask(1, 'src/a.ts'), taskLine(2, false), miniChild('2.1', 'src/b.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: a mini task naming a source file and its test file warns about nothing', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [miniTask(1, 'src/a.ts, e2e/a.spec.ts'), miniTask(2, 'src/b.ts, src/b.test.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: a full task naming two files is not audited as mini', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [fullTask(1, 'src/a.ts, src/b.ts')] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: an issues target that resolves warns about nothing', () => {
  withFixture(baseTree({
    [IL1]: issuelist({ id: 'IL-1-abcdef', issues: [issueBlock('ISS-1-abcdef')] }),
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskIssues(1, ['ISS-1-abcdef'])] }),
  }, { IL: 1, TL: 1, ISS: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('clean: an empty issues array on a task line is not a reference', () => {
  withFixture(baseTree({
    [TL1]: tasklist({ id: 'TL-1-abcdef', tasks: [taskIssues(1, [])] }),
  }, { TL: 1 }), (dir) => {
    expectWarns(dir, []);
  });
});

// ---- cases: leases and the registry header ---------------------------------
// The lease cases fix the acquired timestamp in the fixture rather than letting
// the clock decide it, because the age the WARN reports is derived from it. The
// two ages sit clearly on each side of the sixty-minute boundary.

const LEASE1 = 'flowcharge/workstreams/WS-1-abcdef-alpha/.lease';

const lease = (session, minutesAgo) =>
  `session: ${session}\nacquired: ${new Date(Date.now() - minutesAgo * 60000).toISOString()}\n`;

// The header a registry carried before the script owned the text: the
// read-and-write-back method, which --claim replaced.
const STALE_HEADER = '# FlowCharge ID Registry\n\n'
  + 'Last-issued ID per type. To claim IDs: read this file, take the next N numbers for\n'
  + 'your type, write the incremented counter back IMMEDIATELY, then use them.\n\n';

const HEADER_WARN = 'ids.md: header text is out of date, rewritten';

testCase('clean: a lease acquired five minutes ago warns about nothing', () => {
  withFixture(baseTree({ [LEASE1]: lease('sess-fresh', 5) }), (dir) => {
    expectWarns(dir, []);
  });
});

testCase('a lease held past sixty minutes warns with its session and its age', () => {
  withFixture(baseTree({ [LEASE1]: lease('sess-stale', 90.5) }), (dir) => {
    expectWarns(dir, [
      'flowcharge/workstreams/WS-1-abcdef-alpha/.lease: held by session sess-stale for 90 minutes, stale',
    ]);
  });
});

// The generator reports a stale lease and never removes one: a lock deleted by
// a process that never held it is worse than a lock held too long.
testCase('no mode deletes a lease', () => {
  withFixture(baseTree({ [LEASE1]: lease('sess-stale', 90.5) }), (dir) => {
    const leasePath = path.join(dir, LEASE1);
    runGenerator(dir, ['--check']);
    assert.ok(fs.existsSync(leasePath), '--check deleted the lease');
    runGenerator(dir, []);
    assert.ok(fs.existsSync(leasePath), 'default mode deleted the lease');
  });
});

// The counters are the user's data: they survive the header rewrite exactly,
// which is why the fixture's counters are not all zero.
testCase('default mode rewrites a stale registry header and keeps every counter line', () => {
  const counters = { WS: 1, TL: 3 };
  withFixture(baseTree({}, counters, [], STALE_HEADER), (dir) => {
    marker(dir, 'TL-3-abcdef', 0.5); // justifies the TL counter, so only the header warns
    const { status, stdout, stderr } = runGenerator(dir, []);
    compareWarnSets(warnLines(stdout), [HEADER_WARN]);
    assert.strictEqual(status, 0, `default mode exited ${status}\n${stderr}`);
    assert.strictEqual(readRel(dir, 'flowcharge/ids.md'), registry(counters));
  });
});

testCase('--check reports the stale registry header and leaves the file byte-identical', () => {
  const counters = { WS: 1, TL: 3 };
  const fixtureText = registry(counters, [], STALE_HEADER);
  withFixture(baseTree({}, counters, [], STALE_HEADER), (dir) => {
    marker(dir, 'TL-3-abcdef', 0.5);
    expectWarns(dir, [HEADER_WARN]);
    assert.strictEqual(readRel(dir, 'flowcharge/ids.md'), fixtureText, '--check rewrote ids.md');
  });
});

// A correct registry is left alone rather than rewritten identically. The mtime
// is pinned to a past day first, so a repeated write shows up whatever the
// filesystem's timestamp resolution; the byte comparison backs it up.
testCase('default mode skips the write when the registry header already matches', () => {
  withFixture(baseTree({}, { WS: 1 }), (dir) => {
    setMtime(dir, 'flowcharge/ids.md', daysAgo(2));
    const before = mtimeOf(dir, 'flowcharge/ids.md');
    const text = readRel(dir, 'flowcharge/ids.md');
    const { status, stdout } = runGenerator(dir, []);
    compareWarnSets(warnLines(stdout), []);
    assert.strictEqual(status, 0, `default mode exited ${status}`);
    assert.strictEqual(mtimeOf(dir, 'flowcharge/ids.md'), before, 'ids.md was rewritten');
    assert.strictEqual(readRel(dir, 'flowcharge/ids.md'), text);
  });
});

testCase('the registry --claim seeds carries the same canonical header', () => {
  withFixture(EMPTY_TREE, (dir) => {
    const res = runGenerator(dir, ['--claim', 'WS']);
    assert.strictEqual(res.status, 0, `--claim exited ${res.status}\n${res.stderr}`);
    assert.strictEqual(readRel(dir, 'flowcharge/ids.md'), registry({ WS: 1 }));
    assert.ok(readRel(dir, 'flowcharge/ids.md').startsWith(REGISTRY_HEADER), 'the seeded header is not canonical');
  });
});

// ---- cases: --help ---------------------------------------------------------
// --help prints the script's whole interface on stdout and exits 0 before every
// other mode runs. The cases pin the output's head and tail, the flag and enum
// inventory the text must document, and, in two different trees, that the run
// reads no file and writes none.

// Every flag fc-index.mjs parses. A flag added to the script without an entry
// in HELP fails the completeness case below by name.
const HELP_FLAGS = [
  '--root', '--no-board', '--check', '--sync', '--init', '--list', '--ws', '--sort',
  '--desc', '--archived', '--claim', '--new-ws', '--title',
  '--tags', '--status', '--whoami', '--help',
];

// The four enum lists, each pinned as the exact unwrapped substring the help
// text carries on one line. A bare enum word such as id or title is
// deliberately not pinned on its own: those words occur in the surrounding
// prose, so such an assertion would pass whatever the enum lines said.
const HELP_ENUMS = [
  'workstreams | plans | issuelists | tasklists | issues | all',
  'id | created | updated | status | title | severity',
  'WS | PLN | IL | TL | ISS',
  'backlog | ready | in-progress | done | dropped',
];

testCase('--help prints the interface on stdout and exits 0', () => {
  withFixture(baseTree(), (dir) => {
    const { status, stdout, stderr } = runGenerator(dir, ['--help']);
    assert.strictEqual(status, 0, `--help exited ${status}\n${stderr}`);
    assert.strictEqual(stderr, '', `--help wrote to stderr:\n${stderr}`);
    assert.ok(stdout.startsWith('fc-index.mjs'), `--help stdout starts:\n${stdout.slice(0, 80)}`);
    assert.ok(stdout.includes('Usage:'), '--help printed no Usage: block');
    assert.ok(stdout.endsWith('\n'), '--help output does not end in a newline');
  });
});

testCase('--help documents every flag and every enum the script accepts', () => {
  withFixture(baseTree(), (dir) => {
    const { status, stdout, stderr } = runGenerator(dir, ['--help']);
    assert.strictEqual(status, 0, `--help exited ${status}\n${stderr}`);
    for (const flag of HELP_FLAGS) {
      assert.ok(stdout.includes(flag), `--help does not document ${flag}`);
    }
    for (const line of HELP_ENUMS) {
      assert.ok(stdout.includes(line), `--help does not carry the enum list "${line}"`);
    }
  });
});

testCase('--help answers in a tree with no flowcharge/ and creates nothing', () => {
  // fixture() and withFixture() always create flowcharge/workstreams/, which is
  // the one thing this case must not have: the point of the case is that help
  // answers outside a FlowCharge tree, where every other mode exits 1.
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  try {
    const { status, stdout, stderr } = runGenerator(dir, ['--help']);
    assert.strictEqual(status, 0, `--help exited ${status}\n${stderr}`);
    assert.strictEqual(stderr, '', `--help wrote to stderr:\n${stderr}`);
    assert.ok(stdout.startsWith('fc-index.mjs'), `--help stdout starts:\n${stdout.slice(0, 80)}`);
    // Zero entries, which is also the assertion that no .gitignore was created.
    assert.deepStrictEqual(fs.readdirSync(dir), [], '--help wrote into the directory');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

for (const combo of [['--check'], ['--claim', 'WS'], ['--sync'], ['--list', 'all']]) {
  testCase(`--help takes precedence over ${combo.join(' ')} in either order and writes nothing`, () => {
    // EMPTY_TREE, not baseTree(): baseTree() writes flowcharge/ids.md itself,
    // so the registry assertion below would pass for the wrong reason.
    withFixture(EMPTY_TREE, (dir) => {
      // Both orders, so neither one can regress on its own.
      for (const args of [[...combo, '--help'], ['--help', ...combo]]) {
        const what = `--help with ${args.join(' ')}`;
        const { status, stdout, stderr } = runGenerator(dir, args);
        assert.strictEqual(status, 0, `${what}: exited ${status}\n${stderr}`);
        assert.strictEqual(stderr, '', `${what}: wrote to stderr:\n${stderr}`);
        assert.ok(
          stdout.startsWith('fc-index.mjs'),
          `${what}: printed something other than help:\n${stdout.slice(0, 80)}`,
        );
        assert.strictEqual(warnLines(stdout).length, 0, `${what}: printed a WARN line`);
        assert.ok(!outLines(stdout).some((l) => l.startsWith('SYNC ')), `${what}: printed a SYNC line`);
        assert.deepStrictEqual(idsEntries(dir), [], `${what}: claimed an id`);
        assert.deepStrictEqual(wsFolders(dir), [], `${what}: created a workstream folder`);
        for (const rel of ['flowcharge/index.md', 'flowcharge/kanban.md', 'flowcharge/ids.md', '.gitignore']) {
          assert.ok(!fs.existsSync(path.join(dir, rel)), `${what}: wrote ${rel}`);
        }
      }
    });
  });
}

// ---- cases: fc-rename-artefacts.mjs ---------------------------------------
// The rename script is proved entirely through throwaway fixtures. The
// workstream that ships the script runs it against no real project tree, this
// repository's own included, so a fixture is the only evidence available and
// every case builds and removes its own.

const RENAMER = path.resolve(HERE, '..', 'fc-rename-artefacts.mjs');

// Runs the rename script against one fixture root as a child process. Every
// case passes a temp directory here; no case passes a real project root.
function runRenamer(dir, extraArgs = []) {
  const res = spawnSync(process.execPath, [RENAMER, '--root', dir, ...extraArgs], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const RENAME_DIR = 'flowcharge/workstreams/WS-1-abcdef-sample';

// One workstream folder holding its plain record, plus whatever artefact files
// a case adds. The renamer reads filenames and frontmatter only, so no
// registry and no tag pool are needed.
const renameTree = (extra = {}) => ({
  [`${RENAME_DIR}/workstream.md`]: workstream({ id: 'WS-1-abcdef', slug: 'sample', title: 'Sample' }),
  ...extra,
});

// The fixture folder's filenames, sorted. Cases assert on this set rather than
// on stdout ordering, which the script's contract does not fix.
const namesIn = (dir, rel = RENAME_DIR) => fs.readdirSync(path.join(dir, rel)).sort();

const moveLines = (stdout) => stdout.split(/\r?\n/).filter((l) => l.includes('  ->  '));

// git inside a fixture repository. A non-zero exit fails the case immediately,
// so a broken fixture never reads as a broken script.
function runGit(dir, gitArgs) {
  const res = spawnSync('git', gitArgs, { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  assert.strictEqual(res.status, 0, `git ${gitArgs.join(' ')} failed:\n${res.stderr}`);
  return res.stdout || '';
}

testCase('rename: each legacy artefact filename takes its own id as a prefix', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: plan({ id: 'PLN-1-abcdef' }),
    [`${RENAME_DIR}/issuelist.md`]: issuelist({ id: 'IL-1-abcdef' }),
    [`${RENAME_DIR}/tasklist.md`]: tasklist({ id: 'TL-1-abcdef' }),
  }), (dir) => {
    const { status, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), [
      'IL-1-abcdef-issuelist.md',
      'PLN-1-abcdef-plan.md',
      'TL-1-abcdef-tasklist.md',
      'workstream.md',
    ]);
  });
});

testCase('rename: the qualifier stays a tail after the plain name', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/issuelist-second.md`]: issuelist({ id: 'IL-1-abcdef' }),
  }), (dir) => {
    const { status, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), [
      'IL-1-abcdef-issuelist-second.md',
      'workstream.md',
    ]);
  });
});

testCase('rename: workstream.md is skipped by name and keeps its plain filename', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: plan({ id: 'PLN-1-abcdef' }),
  }), (dir) => {
    const { status, stdout, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), ['PLN-1-abcdef-plan.md', 'workstream.md']);
    assert.ok(!stdout.includes('workstream.md'), `the workstream record was reported:\n${stdout}`);
  });
});

testCase('rename: a file with no frontmatter id is skipped and keeps its name', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: withoutKey(plan({ id: 'PLN-1-abcdef' }), 'id'),
  }), (dir) => {
    const { status, stdout, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), ['plan.md', 'workstream.md']);
    assert.deepStrictEqual(moveLines(stdout), []);
  });
});

testCase('rename: an existing target file is refused rather than overwritten', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: plan({ id: 'PLN-1-abcdef' }),
    [`${RENAME_DIR}/PLN-1-abcdef-plan.md`]: plan({ id: 'PLN-1-abcdef' }),
  }), (dir) => {
    const { status, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 1, `--apply exited ${status}, expected 1\n${stderr}`);
    assert.ok(/already exists/.test(stderr), `no collision was reported:\n${stderr}`);
    // The source file is still in place: a refusal moves nothing.
    assert.deepStrictEqual(namesIn(dir), [
      'PLN-1-abcdef-plan.md',
      'plan.md',
      'workstream.md',
    ]);
  });
});

testCase('rename: a run without --apply reports the moves and writes nothing', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: plan({ id: 'PLN-1-abcdef' }),
    [`${RENAME_DIR}/tasklist.md`]: tasklist({ id: 'TL-1-abcdef' }),
  }), (dir) => {
    const before = namesIn(dir);
    const { status, stdout, stderr } = runRenamer(dir);
    assert.strictEqual(status, 0, `dry run exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), before, 'the dry run moved a file');
    assert.strictEqual(moveLines(stdout).length, 2, `move lines reported:\n${stdout}`);
    for (const name of ['PLN-1-abcdef-plan.md', 'TL-1-abcdef-tasklist.md']) {
      assert.ok(stdout.includes(name), `${name} was not reported:\n${stdout}`);
    }
  });
});

testCase('rename: a second run over a compliant tree moves nothing and exits 0', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/PLN-1-abcdef-plan.md`]: plan({ id: 'PLN-1-abcdef' }),
    [`${RENAME_DIR}/IL-1-abcdef-issuelist-second.md`]: issuelist({ id: 'IL-1-abcdef' }),
  }), (dir) => {
    const before = namesIn(dir);
    const { status, stdout, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(moveLines(stdout), [], `a compliant tree reported a move:\n${stdout}`);
    assert.deepStrictEqual(namesIn(dir), before);
  });
});

testCase('rename: a tracked file moves through git mv and stays tracked', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/plan.md`]: plan({ id: 'PLN-1-abcdef' }),
  }), (dir) => {
    runGit(dir, ['init', '-q']);
    // A fixture repository carries no identity of its own, and the machine may
    // carry no global one, so both are set on the fixture repository itself.
    runGit(dir, ['config', 'user.name', 'FlowCharge Fixture']);
    runGit(dir, ['config', 'user.email', 'fixture@example.invalid']);
    // The machine's own global excludes file may list flowcharge/, which would
    // stop the fixture staging its artefacts. The fixture repository ignores
    // nothing, so the case reads the same on every machine.
    runGit(dir, ['config', 'core.excludesFile', '/dev/null']);
    // Staged, not merely present: git ls-files --error-unmatch succeeds only
    // for a path the index knows.
    runGit(dir, ['add', `${RENAME_DIR}/plan.md`]);
    const { status, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), ['PLN-1-abcdef-plan.md', 'workstream.md']);
    const tracked = runGit(dir, ['ls-files']).split('\n').filter(Boolean);
    assert.deepStrictEqual(tracked, [`${RENAME_DIR}/PLN-1-abcdef-plan.md`]);
  });
});

testCase('rename: an untracked file in a tree with no repository moves through fs.renameSync', () => {
  withFixture(renameTree({
    [`${RENAME_DIR}/tasklist.md`]: tasklist({ id: 'TL-1-abcdef' }),
  }), (dir) => {
    assert.ok(!fs.existsSync(path.join(dir, '.git')), 'the fixture carries a git repository');
    const { status, stderr } = runRenamer(dir, ['--apply']);
    assert.strictEqual(status, 0, `--apply exited ${status}\n${stderr}`);
    assert.deepStrictEqual(namesIn(dir), ['TL-1-abcdef-tasklist.md', 'workstream.md']);
  });
});

// ---- cases: stamp-skill-versions.mjs ----------------------------------------
// stamp-skill-versions.mjs derives its own root from its own file location,
// not from a --root flag, so every case here copies the shipped script into
// the fixture at .github/scripts/ (two directories below the fixture root,
// the same depth the script itself sits at, and the same copied-script
// technique the version-check section above established for fc-index.mjs)
// before running it. Running STAMPER itself would point the script at this
// repository's real skills/ tree and rewrite this repository's own shipped
// SKILL.md files, so no case here ever spawns STAMPER directly.

const STAMPER = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'stamp-skill-versions.mjs');

// One fixture skills/<name>/SKILL.md: a minimal but documented-shape
// frontmatter block (name, description, an unrelated key, then the nested
// metadata: / version: pair), a heading and a body line. Deterministic and
// fully reproducible from (name, version) alone, so a case can assert
// untouched content by regenerating the expected string rather than diffing
// bytes by hand.
function skillFile(name, version) {
  return [
    '---',
    `name: ${name}`,
    'description: fixture skill for stamp-skill-versions.mjs tests',
    `custom-${name}: "keep-me-${name}"`,
    'metadata:',
    `  version: "${version}"`,
    '---',
    '',
    `# ${name}`,
    '',
    `Body line unique to ${name}.`,
    '',
  ].join('\n');
}

// The documented shape violated on purpose: a bare top-level `version:` key
// rather than the nested `metadata: / version:` pair.
function badShapeSkillFile(name, version) {
  return [
    '---',
    `name: ${name}`,
    'description: fixture skill with a bare top-level version key',
    `version: "${version}"`,
    '---',
    '',
    `# ${name}`,
    '',
    `Body line unique to ${name}.`,
    '',
  ].join('\n');
}

// specs: an array of { name, version[, badShape] }. One skills/<name>/SKILL.md
// per entry.
function skillsTree(specs) {
  const tree = {};
  for (const { name, version, badShape } of specs) {
    tree[`skills/${name}/SKILL.md`] = badShape ? badShapeSkillFile(name, version) : skillFile(name, version);
  }
  return tree;
}

// Builds the skills/ tree fixture() would build anyway, then copies the real
// stamp-skill-versions.mjs into it at the exact depth its own root
// derivation assumes, before handing the directory to fn. withFixture's
// finally block removes the tree afterwards, including when fn throws.
function withStamperFixture(specs, fn) {
  return withFixture(skillsTree(specs), (dir) => {
    const dest = path.join(dir, '.github', 'scripts', 'stamp-skill-versions.mjs');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(STAMPER, dest);
    return fn(dir);
  });
}

// Runs the copy of stamp-skill-versions.mjs that withStamperFixture() placed
// inside the fixture, not STAMPER itself. The script takes no --root flag.
function runStamper(dir, extraArgs = []) {
  const copy = path.join(dir, '.github', 'scripts', 'stamp-skill-versions.mjs');
  const res = spawnSync(process.execPath, [copy, ...extraArgs], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const readSkill = (dir, name) => fs.readFileSync(path.join(dir, 'skills', name, 'SKILL.md'), 'utf8');

const stampedLines = (stdout) => stdout.split(/\r?\n/).filter((l) => l.includes(': version -> "'));

testCase('stamp: a clean run rewrites every differing file and leaves the rest of each file untouched', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withStamperFixture(specs, (dir) => {
    const { status, stdout, stderr } = runStamper(dir, ['0.2.0']);
    assert.strictEqual(status, 0, `stamp exited ${status}\n${stderr}`);
    for (const { name } of specs) {
      assert.strictEqual(readSkill(dir, name), skillFile(name, '0.2.0'), `${name}/SKILL.md was not rewritten to 0.2.0 with everything else unchanged`);
    }
    assert.strictEqual(stampedLines(stdout).length, 3, `expected 3 per-file lines:\n${stdout}`);
    for (const { name } of specs) {
      assert.ok(stdout.includes(`skills/${name}/SKILL.md: version -> "0.2.0"`), `no per-file line for ${name}:\n${stdout}`);
    }
    assert.ok(stdout.trimEnd().endsWith('stamped 3 of 3 SKILL.md files'), `missing summary line:\n${stdout}`);
  });
});

testCase('stamp: a file already at the target value is left untouched and not counted', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.2.0' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withStamperFixture(specs, (dir) => {
    const betaPath = path.join(dir, 'skills', 'beta', 'SKILL.md');
    const betaMtimeBefore = fs.statSync(betaPath).mtimeMs;
    const { status, stdout, stderr } = runStamper(dir, ['0.2.0']);
    assert.strictEqual(status, 0, `stamp exited ${status}\n${stderr}`);
    assert.strictEqual(readSkill(dir, 'alpha'), skillFile('alpha', '0.2.0'));
    assert.strictEqual(readSkill(dir, 'gamma'), skillFile('gamma', '0.2.0'));
    // Byte-identical to its original content, and never rewritten at all,
    // not merely holding the same value after a redundant write.
    assert.strictEqual(readSkill(dir, 'beta'), skillFile('beta', '0.2.0'));
    assert.strictEqual(fs.statSync(betaPath).mtimeMs, betaMtimeBefore, 'beta/SKILL.md was rewritten despite already matching the target');
    assert.strictEqual(stampedLines(stdout).length, 2, `expected 2 per-file lines:\n${stdout}`);
    assert.ok(stdout.includes('skills/alpha/SKILL.md: version -> "0.2.0"'), `no per-file line for alpha:\n${stdout}`);
    assert.ok(stdout.includes('skills/gamma/SKILL.md: version -> "0.2.0"'), `no per-file line for gamma:\n${stdout}`);
    assert.ok(!stdout.includes('skills/beta/SKILL.md'), `beta was reported despite already matching the target:\n${stdout}`);
    assert.ok(stdout.trimEnd().endsWith('stamped 2 of 3 SKILL.md files'), `missing summary line:\n${stdout}`);
  });
});

testCase('stamp: a second, accidental run against an already-stamped tree writes nothing', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withStamperFixture(specs, (dir) => {
    const first = runStamper(dir, ['0.2.0']);
    assert.strictEqual(first.status, 0, `first run exited ${first.status}\n${first.stderr}`);
    const snapshot = Object.fromEntries(specs.map(({ name }) => [name, readSkill(dir, name)]));
    const second = runStamper(dir, ['0.2.0']);
    assert.strictEqual(second.status, 0, `second run exited ${second.status}\n${second.stderr}`);
    for (const { name } of specs) {
      assert.strictEqual(readSkill(dir, name), snapshot[name], `${name}/SKILL.md changed on the second run`);
    }
    assert.strictEqual(stampedLines(second.stdout).length, 0, `second run printed a per-file line:\n${second.stdout}`);
    assert.ok(second.stdout.trimEnd().endsWith('stamped 0 of 3 SKILL.md files'), `missing summary line:\n${second.stdout}`);
  });
});

for (const badVersion of ['v0.2.0', '0.2', '0.2.0-rc.1']) {
  testCase(`stamp: a malformed version argument (${badVersion}) is refused and writes nothing`, () => {
    const specs = [
      { name: 'alpha', version: '0.1.0' },
      { name: 'beta', version: '0.1.5' },
      { name: 'gamma', version: '0.1.9' },
    ];
    withStamperFixture(specs, (dir) => {
      const { status, stdout, stderr } = runStamper(dir, [badVersion]);
      assert.notStrictEqual(status, 0, `expected a non-zero exit for ${badVersion}`);
      assert.ok(stderr.length > 0, `expected an error on stderr for ${badVersion}`);
      assert.ok(stderr.includes(badVersion), `stderr did not name the bad argument ${badVersion}:\n${stderr}`);
      assert.strictEqual(stdout, '', `expected no stdout for a refused argument:\n${stdout}`);
      for (const { name, version } of specs) {
        assert.strictEqual(readSkill(dir, name), skillFile(name, version), `${name}/SKILL.md was written despite the invalid argument`);
      }
    });
  });
}

testCase('stamp: no version argument at all is refused and writes nothing', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withStamperFixture(specs, (dir) => {
    const { status, stdout, stderr } = runStamper(dir, []);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit with no argument');
    assert.ok(stderr.length > 0, 'expected an error on stderr with no argument');
    assert.strictEqual(stdout, '', `expected no stdout for a refused argument:\n${stdout}`);
    for (const { name, version } of specs) {
      assert.strictEqual(readSkill(dir, name), skillFile(name, version), `${name}/SKILL.md was written despite the missing argument`);
    }
  });
});

testCase('stamp: a SKILL.md carrying a bare top-level version key fails validation and writes nothing, including the well-formed files', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5', badShape: true },
    { name: 'gamma', version: '0.1.9' },
  ];
  withStamperFixture(specs, (dir) => {
    const { status, stdout, stderr } = runStamper(dir, ['0.2.0']);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit for a malformed SKILL.md');
    assert.ok(stderr.includes('skills/beta/SKILL.md'), `stderr did not name the offending file:\n${stderr}`);
    assert.strictEqual(stdout, '', `expected no stdout when validation fails:\n${stdout}`);
    for (const { name, version, badShape } of specs) {
      const expected = badShape ? badShapeSkillFile(name, version) : skillFile(name, version);
      assert.strictEqual(readSkill(dir, name), expected, `${name}/SKILL.md was written despite the validation failure`);
    }
  });
});

// The regression case for the defect that moved this script under .github/.
// A copy placed at the OLD depth, skills/legacy-skill/scripts/, walks two
// parents and so resolves its root to <dir>/skills. There is no
// <dir>/skills/skills, so listSkillFiles() returns an empty array and nothing
// is written. If the three-parent walk is ever restored, that same copy
// resolves its root to <dir>, finds <dir>/skills/<name>/SKILL.md, and stamps
// them, which is what this case exists to catch. The case builds its own
// copy step rather than reusing withStamperFixture(), which now copies to
// .github/scripts/.
testCase('stamp: a copy left at the old skills/legacy-skill/scripts/ depth resolves the wrong root and stamps nothing', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withFixture(skillsTree(specs), (dir) => {
    const wrongDepthCopy = path.join(dir, 'skills', 'legacy-skill', 'scripts', 'stamp-skill-versions.mjs');
    fs.mkdirSync(path.dirname(wrongDepthCopy), { recursive: true });
    fs.copyFileSync(STAMPER, wrongDepthCopy);

    const res = spawnSync(process.execPath, [wrongDepthCopy, '0.2.0'], { cwd: dir, encoding: 'utf8' });
    if (res.error) throw res.error;
    const stdout = res.stdout || '';
    assert.strictEqual(res.status, 0, `stamp exited ${res.status}\n${res.stderr || ''}`);
    assert.ok(
      stdout.trimEnd().endsWith('stamped 0 of 0 SKILL.md files'),
      `expected the wrong-depth copy to find no SKILL.md at all:\n${stdout}`,
    );
    for (const { name, version } of specs) {
      assert.strictEqual(readSkill(dir, name), skillFile(name, version), `${name}/SKILL.md was stamped by a copy at the old depth`);
    }
  });
});

// ---- cases: release.mjs -----------------------------------------------------
// release.mjs derives its own root from its own file location, two directories
// up, so every case here copies it (and the stamper it spawns) into the
// fixture at .github/scripts/ and runs that copy, the same copied-script
// technique the two sections above established. It drives git from end to end,
// so unlike every other fixture in this file the tree it acts on is a real git
// repository: git init on a branch named exactly main, identity, excludes and
// signing configured on the fixture itself so a machine's own config cannot
// change the outcome, then one commit holding everything the fixture starts
// with. Running RELEASE itself would point the command at this repository,
// where it would really stamp, really commit and really tag, so no case here
// ever spawns RELEASE directly.

const RELEASE = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'release.mjs');

// The version every case releases, and the tag that version produces.
const REL_VERSION = '0.2.0';
const REL_TAG = `v${REL_VERSION}`;

// The default skills/ tree. A function, so each case owns its own array and no
// case can mutate another's. Every count in this section is derived from the
// case's own specs, never written as a literal.
const relSpecs = () => [
  { name: 'alpha', version: '0.1.0' },
  { name: 'beta', version: '0.1.5' },
  { name: 'gamma', version: '0.1.9' },
];

// A real git repository holding a skills/ tree, a CHANGELOG.md, and copies of
// release.mjs and stamp-skill-versions.mjs at .github/scripts/.
//
// opts:
//   specs          skillsTree() specs, the only source of any skill count
//   changelogText  the CHANGELOG.md content, or null to leave the file out
//   branch         the branch to init on, so R4 can sit somewhere else
//   tags           annotated tags placed on the initial commit
//   files          extra {relative path: content} entries, committed too
//   initGit        false leaves the tree with no git repository at all
function withReleaseFixture(opts, fn) {
  const {
    specs,
    changelogText = changelog(`${REL_VERSION} - 2026-08-26`),
    branch = 'main',
    tags = [],
    files = {},
    initGit = true,
  } = opts;
  const tree = { ...skillsTree(specs), ...files };
  if (changelogText !== null) tree['CHANGELOG.md'] = changelogText;
  // release.mjs's own manifest step (see the manifest section below) spawns
  // manifest.mjs beside its own copy and refuses when VERSIONING.md is absent
  // from the fixture root, so every release fixture needs both, not only the
  // ones that exercise the manifest step directly.
  if (!('VERSIONING.md' in tree)) tree['VERSIONING.md'] = 'Fixture placeholder.\n';
  return withFixture(tree, (dir) => {
    for (const script of [RELEASE, STAMPER, MANIFEST]) {
      const dest = path.join(dir, '.github', 'scripts', path.basename(script));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(script, dest);
    }
    if (initGit) {
      // -b pins the branch name, so neither the positive cases nor R4's
      // negative case depends on the machine's init.defaultBranch.
      runGit(dir, ['init', '-q', '-b', branch]);
      runGit(dir, ['config', 'user.name', 'FlowCharge Fixture']);
      runGit(dir, ['config', 'user.email', 'fixture@example.invalid']);
      runGit(dir, ['config', 'core.excludesFile', '/dev/null']);
      runGit(dir, ['config', 'commit.gpgsign', 'false']);
      runGit(dir, ['config', 'tag.gpgSign', 'false']);
      runGit(dir, ['add', '-A']);
      runGit(dir, ['commit', '-q', '--no-verify', '-m', 'fixture commit']);
      for (const tag of tags) runGit(dir, ['tag', '-a', tag, '-m', tag]);
    }
    return fn(dir);
  });
}

// Runs the copy of release.mjs that withReleaseFixture() placed inside the
// fixture, never RELEASE itself. The command takes no --root flag.
function runRelease(dir, args) {
  const copy = path.join(dir, '.github', 'scripts', 'release.mjs');
  const res = spawnSync(process.execPath, [copy, ...args], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const gitLines = (dir, gitArgs) => runGit(dir, gitArgs).split(/\r?\n/).filter(Boolean);
const commitCount = (dir) => Number(runGit(dir, ['rev-list', '--count', 'HEAD']).trim());
const headSha = (dir) => runGit(dir, ['rev-parse', 'HEAD']).trim();
const tagsIn = (dir) => gitLines(dir, ['tag']);

// The SKILL.md paths the case's own specs imply, sorted the way git reports
// them. Derived from the fixture, so no count is ever written down.
const skillPaths = (specs) => specs.map(({ name }) => `skills/${name}/SKILL.md`).sort();

// Every fixture SKILL.md still byte-identical to what its own spec builds.
function assertSkillsUntouched(dir, specs, why) {
  for (const { name, version, badShape } of specs) {
    const expected = badShape ? badShapeSkillFile(name, version) : skillFile(name, version);
    assert.strictEqual(readSkill(dir, name), expected, `${name}/SKILL.md was written ${why}`);
  }
}

testCase('release: R1 a clean run stamps every SKILL.md, commits it, and creates a real annotated tag', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs }, (dir) => {
    const before = commitCount(dir);
    const { status, stdout, stderr } = runRelease(dir, [REL_VERSION]);
    assert.strictEqual(status, 0, `release exited ${status}\n${stdout}\n${stderr}`);
    for (const { name } of specs) {
      assert.strictEqual(readSkill(dir, name), skillFile(name, REL_VERSION), `${name}/SKILL.md does not carry ${REL_VERSION}`);
    }
    assert.strictEqual(commitCount(dir), before + 1, 'expected exactly one new commit');
    assert.strictEqual(runGit(dir, ['log', '-1', '--pretty=%s']).trim(), `chore(release): ${REL_TAG}`);
    assert.deepStrictEqual(
      gitLines(dir, ['diff', '--name-only', 'HEAD~1', 'HEAD']).sort(),
      [...skillPaths(specs), 'skills/manifest.json'].sort(),
      'the release commit touched something other than the SKILL.md files and the manifest',
    );
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'skills', 'manifest.json'), 'utf8'));
    assert.strictEqual(manifest.suite_version, REL_VERSION, 'the committed manifest does not record the released version');
    for (const entry of manifest.skills) {
      assert.strictEqual(entry.version, REL_VERSION, `${entry.name}'s manifest entry does not record ${REL_VERSION}`);
    }
    // A real annotated tag object, not a lightweight ref, and it points at the
    // commit the run just made.
    assert.strictEqual(runGit(dir, ['cat-file', '-t', REL_TAG]).trim(), 'tag', `${REL_TAG} is not an annotated tag object`);
    assert.strictEqual(runGit(dir, ['rev-parse', `${REL_TAG}^{commit}`]).trim(), headSha(dir), `${REL_TAG} does not point at the release commit`);
    assert.ok(stdout.includes(`git push origin ${REL_TAG}`), `stdout did not print the tag push command:\n${stdout}`);
  });
});

testCase('release: R2 a modified tracked file refuses the release and writes nothing', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, files: { 'NOTES.md': 'tracked and clean\n' } }, (dir) => {
    fs.writeFileSync(path.join(dir, 'NOTES.md'), 'tracked and now modified\n');
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal for a dirty tracked tree');
    assert.ok(stderr.length > 0, 'expected an error on stderr for a dirty tracked tree');
    assert.strictEqual(commitCount(dir), before, 'a commit was made despite the dirty tree');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created despite the dirty tree');
    assertSkillsUntouched(dir, specs, 'despite the dirty tree');
  });
});

testCase('release: R3 an untracked file alone is no refusal, and it stays out of the release commit', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs }, (dir) => {
    fs.writeFileSync(path.join(dir, 'scratch.txt'), 'untracked scratch file\n');
    const before = commitCount(dir);
    const { status, stdout, stderr } = runRelease(dir, [REL_VERSION]);
    assert.strictEqual(status, 0, `release exited ${status} for an untracked-only tree\n${stdout}\n${stderr}`);
    assert.strictEqual(commitCount(dir), before + 1, 'expected exactly one new commit');
    assert.deepStrictEqual(
      gitLines(dir, ['diff', '--name-only', 'HEAD~1', 'HEAD']).sort(),
      [...skillPaths(specs), 'skills/manifest.json'].sort(),
      'the untracked file reached the release commit, or the manifest did not',
    );
    assert.ok(!gitLines(dir, ['ls-files']).includes('scratch.txt'), 'the untracked file became tracked');
  });
});

testCase('release: R4 a branch that is not main refuses the release and writes nothing', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, branch: 'release-prep' }, (dir) => {
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal off main');
    assert.ok(stderr.includes('release-prep'), `stderr did not name the branch:\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a commit was made off main');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created off main');
    assertSkillsUntouched(dir, specs, 'off main');
  });
});

testCase('release: R5 a newest changelog heading that disagrees with the argument refuses the release', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, changelogText: changelog('0.3.0 - 2026-08-26') }, (dir) => {
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal for a disagreeing changelog');
    assert.ok(stderr.includes('0.3.0'), `stderr did not name the changelog's own version:\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a commit was made despite the disagreeing changelog');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created despite the disagreeing changelog');
    assertSkillsUntouched(dir, specs, 'despite the disagreeing changelog');
  });
});

testCase('release: R6 a missing CHANGELOG.md refuses the release', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, changelogText: null }, (dir) => {
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal with no CHANGELOG.md');
    assert.ok(stderr.includes('CHANGELOG.md'), `stderr did not name the missing file:\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a commit was made with no CHANGELOG.md');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created with no CHANGELOG.md');
    assertSkillsUntouched(dir, specs, 'with no CHANGELOG.md');
  });
});

testCase('release: R7 a CHANGELOG.md with no release heading at all refuses the release', () => {
  const specs = relSpecs();
  const noHeading = '# Changelog\n\n## Unreleased\n\nNothing released yet.\n';
  withReleaseFixture({ specs, changelogText: noHeading }, (dir) => {
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal with no release heading');
    assert.ok(stderr.length > 0, 'expected an error on stderr with no release heading');
    assert.strictEqual(commitCount(dir), before, 'a commit was made with no release heading');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created with no release heading');
    assertSkillsUntouched(dir, specs, 'with no release heading');
  });
});

// The mirror of the checkSuiteVersion case earlier in this file, "version
// check: an Unreleased heading above a valid release heading is read past".
// Both readers use the same regex, so both must read past it.
testCase('release: R8 an Unreleased heading above the matching release heading is read past', () => {
  const specs = relSpecs();
  const withUnreleased = `# Changelog\n\n## Unreleased\n\n${changelog(`${REL_VERSION} - 2026-08-26`)}`;
  withReleaseFixture({ specs, changelogText: withUnreleased }, (dir) => {
    const before = commitCount(dir);
    const { status, stdout, stderr } = runRelease(dir, [REL_VERSION]);
    assert.strictEqual(status, 0, `release exited ${status} with an Unreleased heading above the release heading\n${stdout}\n${stderr}`);
    assert.strictEqual(commitCount(dir), before + 1, 'expected exactly one new commit');
    assert.strictEqual(runGit(dir, ['cat-file', '-t', REL_TAG]).trim(), 'tag', `${REL_TAG} is not an annotated tag object`);
  });
});

// The tag check runs before the stamper, so an already-cut release adds no
// commit at all. Asserting only the exit code would pass even if the command
// stamped and committed first and failed at the tag step, which is exactly the
// broken ordering this case exists to forbid.
testCase('release: R9 an existing tag refuses the release with no commit added', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, tags: [REL_TAG] }, (dir) => {
    const before = commitCount(dir);
    const head = headSha(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal for an existing tag');
    assert.ok(stderr.includes(REL_TAG), `stderr did not name the existing tag:\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a commit was added despite the existing tag');
    assert.strictEqual(headSha(dir), head, 'HEAD moved despite the existing tag');
    assert.deepStrictEqual(tagsIn(dir), [REL_TAG], 'the tag set changed');
    assertSkillsUntouched(dir, specs, 'despite the existing tag: the stamper ran before the tag check');
  });
});

testCase('release: R10 every malformed version argument is refused and writes nothing', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs }, (dir) => {
    const before = commitCount(dir);
    for (const args of [['v0.2.0'], ['0.2'], ['0.2.0-rc.1'], []]) {
      const label = args.length ? args[0] : '(no argument)';
      const { status, stdout, stderr } = runRelease(dir, args);
      assert.notStrictEqual(status, 0, `expected a refusal for ${label}`);
      assert.ok(stderr.length > 0, `expected an error on stderr for ${label}`);
      assert.strictEqual(stdout, '', `expected no stdout for ${label}:\n${stdout}`);
      assert.strictEqual(commitCount(dir), before, `a commit was made for ${label}`);
      assert.deepStrictEqual(tagsIn(dir), [], `a tag was created for ${label}`);
      assertSkillsUntouched(dir, specs, `for ${label}`);
    }
  });
});

// No git repository at all, so any git call the command made would fail and
// step 3 would refuse. Exit 0 with the usage text is therefore the proof that
// --help returned before the first git call.
testCase('release: R11 --help prints usage, makes no git call and writes nothing', () => {
  const specs = relSpecs();
  withReleaseFixture({ specs, initGit: false }, (dir) => {
    const changelogBefore = fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8');
    const { status, stdout, stderr } = runRelease(dir, ['--help']);
    assert.strictEqual(status, 0, `--help exited ${status}\n${stderr}`);
    assert.ok(stdout.includes('<X.Y.Z>'), `--help did not print the usage line:\n${stdout}`);
    assert.strictEqual(stderr, '', `--help wrote to stderr:\n${stderr}`);
    assert.ok(!fs.existsSync(path.join(dir, '.git')), '--help reached git');
    assert.strictEqual(fs.readFileSync(path.join(dir, 'CHANGELOG.md'), 'utf8'), changelogBefore, '--help rewrote CHANGELOG.md');
    assertSkillsUntouched(dir, specs, 'by --help');
  });
});

testCase('release: R12 a malformed SKILL.md fails the stamper, so no commit and no tag are made', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5', badShape: true },
    { name: 'gamma', version: '0.1.9' },
  ];
  withReleaseFixture({ specs }, (dir) => {
    const before = commitCount(dir);
    const { status, stderr } = runRelease(dir, [REL_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit when the stamper fails');
    assert.ok(stderr.includes('skills/beta/SKILL.md'), `stderr did not name the offending file:\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a commit was made despite the stamper failing');
    assert.deepStrictEqual(tagsIn(dir), [], 'a tag was created despite the stamper failing');
    assertSkillsUntouched(dir, specs, 'despite the stamper failing');
  });
});

// The recovery path for a run that stamped and committed but failed before
// tagging, and the path the first release takes, because every file already
// carries that version.
testCase('release: R13 a tree already stamped and committed skips the commit and tags HEAD', () => {
  const specs = [
    { name: 'alpha', version: REL_VERSION },
    { name: 'beta', version: REL_VERSION },
    { name: 'gamma', version: REL_VERSION },
  ];
  withReleaseFixture({ specs }, (dir) => {
    // Bring the fixture to a genuinely already-released state by hand: since
    // release.mjs now stages skills/manifest.json alongside the SKILL.md
    // files, "already stamped and committed" must include a manifest that
    // already matches, or the run below would find something new to stage
    // and commit instead of skipping, which is the opposite of what this
    // case exists to prove.
    const manifestCopy = path.join(dir, '.github', 'scripts', 'manifest.mjs');
    const pre = spawnSync(process.execPath, [manifestCopy, REL_VERSION], { cwd: dir, encoding: 'utf8' });
    assert.strictEqual(pre.status, 0, `fixture setup: manifest generation failed\n${pre.stdout}\n${pre.stderr}`);
    runGit(dir, ['add', 'skills/manifest.json']);
    runGit(dir, ['commit', '-q', '--no-verify', '-m', 'fixture: pre-generated manifest']);

    const before = commitCount(dir);
    const head = headSha(dir);
    const { status, stdout, stderr } = runRelease(dir, [REL_VERSION]);
    assert.strictEqual(status, 0, `release exited ${status} on an already-stamped tree\n${stdout}\n${stderr}`);
    assert.strictEqual(commitCount(dir), before, 'a release commit was made for an already-stamped tree');
    assert.strictEqual(headSha(dir), head, 'HEAD moved for an already-stamped tree');
    assert.ok(stdout.includes('skipping the release commit'), `stdout did not say the commit was skipped:\n${stdout}`);
    assert.strictEqual(runGit(dir, ['cat-file', '-t', REL_TAG]).trim(), 'tag', `${REL_TAG} is not an annotated tag object`);
    assert.strictEqual(runGit(dir, ['rev-parse', `${REL_TAG}^{commit}`]).trim(), head, `${REL_TAG} does not point at HEAD`);
    assertSkillsUntouched(dir, specs, 'on an already-stamped tree');
  });
});

// ---- cases: check-release.mjs -----------------------------------------------
// check-release.mjs derives its own root from its own file location, two
// directories up, so every case here copies it into the fixture at
// .github/scripts/ and runs that copy, the same copied-script technique the
// sections above established. Running CHECK itself would verify this
// repository's own skills/ tree and its own CHANGELOG.md rather than the
// fixture's, so no case here ever spawns CHECK directly.
//
// Unlike the release.mjs section, nothing here needs a git repository: the
// verifier never calls git and never reads a tag, and the version it checks
// against arrives as its one argument. A plain fixture() tree plus a
// CHANGELOG.md is the whole fixture.

const CHECK = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'check-release.mjs');

// The version every case verifies, except the round trip, which uses its own.
const CHK_VERSION = '0.2.0';

// The default skills/ tree, already carrying CHK_VERSION. A function, so each
// case owns its own array. Every count in this section comes from the case's
// own specs or from a listing of its own fixture, never from a literal.
const chkSpecs = () => [
  { name: 'alpha', version: CHK_VERSION },
  { name: 'beta', version: CHK_VERSION },
  { name: 'gamma', version: CHK_VERSION },
];

// A skills/ tree, a CHANGELOG.md, and copies of the named scripts at
// .github/scripts/, the depth check-release.mjs's own two-parent root walk
// assumes, so the copy reads <dir>/skills/ and <dir>/CHANGELOG.md.
//
// opts:
//   specs          skillsTree() specs, the only source of any skill count
//   changelogText  the CHANGELOG.md content, or null to leave the file out
//   scripts        the scripts to copy in; the round trip needs the stamper too
function withCheckFixture(opts, fn) {
  const {
    specs,
    changelogText = changelog(`${CHK_VERSION} - 2026-08-26`),
    scripts = [CHECK],
  } = opts;
  const tree = skillsTree(specs);
  if (changelogText !== null) tree['CHANGELOG.md'] = changelogText;
  return withFixture(tree, (dir) => {
    for (const script of scripts) {
      const dest = path.join(dir, '.github', 'scripts', path.basename(script));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(script, dest);
    }
    return fn(dir);
  });
}

// Runs the copy of check-release.mjs inside the fixture, never CHECK itself.
function runCheck(dir, args) {
  const copy = path.join(dir, '.github', 'scripts', 'check-release.mjs');
  const res = spawnSync(process.execPath, [copy, ...args], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// The set of skill files the run actually named, deduplicated and sorted.
const namedSkillFiles = (stderr) =>
  [...new Set(stderr.match(/skills\/[^/\s]+\/SKILL\.md/g) || [])].sort();

// The set the fixture itself holds, read from its own skills/ directory rather
// than from any list written here.
const fixtureSkillFiles = (dir) =>
  fs.readdirSync(path.join(dir, 'skills')).sort().map((name) => `skills/${name}/SKILL.md`);

testCase('check-release: V1 every file and the changelog agreeing with the argument exits 0', () => {
  const specs = chkSpecs();
  withCheckFixture({ specs }, (dir) => {
    const { status, stdout, stderr } = runCheck(dir, [CHK_VERSION]);
    assert.strictEqual(status, 0, `check-release exited ${status}\n${stdout}\n${stderr}`);
    assert.strictEqual(stderr, '', `a passing run wrote to stderr:\n${stderr}`);
  });
});

testCase('check-release: V2 one disagreeing file exits 1 and names that file, its value and the expected value', () => {
  const specs = [
    { name: 'alpha', version: CHK_VERSION },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: CHK_VERSION },
  ];
  withCheckFixture({ specs }, (dir) => {
    const { status, stderr } = runCheck(dir, [CHK_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit for a disagreeing file');
    assert.deepStrictEqual(
      namedSkillFiles(stderr),
      ['skills/beta/SKILL.md'],
      `the wrong set of files was named:\n${stderr}`,
    );
    assert.ok(stderr.includes('"0.1.5"'), `stderr did not name the value the file carries:\n${stderr}`);
    assert.ok(stderr.includes(`"${CHK_VERSION}"`), `stderr did not name the expected value:\n${stderr}`);
  });
});

// The case a verifier that stops at the first disagreement would pass on the
// exit code alone. The assertion is therefore on the set of file names printed,
// compared with the fixture's own skills/ listing.
testCase('check-release: V3 files that agree with each other but not with the argument are every one named', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.0' },
    { name: 'gamma', version: '0.1.0' },
  ];
  withCheckFixture({ specs, changelogText: changelog('0.1.0 - 2026-08-26') }, (dir) => {
    const { status, stderr } = runCheck(dir, [CHK_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit when every file disagrees');
    assert.deepStrictEqual(
      namedSkillFiles(stderr),
      fixtureSkillFiles(dir),
      `not every disagreeing file was named:\n${stderr}`,
    );
    assert.ok(stderr.includes('CHANGELOG.md'), `the disagreeing changelog was not named:\n${stderr}`);
  });
});

testCase('check-release: V4 a SKILL.md carrying a bare top-level version key exits 1 and names it', () => {
  const specs = [
    { name: 'alpha', version: CHK_VERSION },
    { name: 'beta', version: CHK_VERSION, badShape: true },
    { name: 'gamma', version: CHK_VERSION },
  ];
  withCheckFixture({ specs }, (dir) => {
    const { status, stderr } = runCheck(dir, [CHK_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a non-zero exit for a malformed SKILL.md');
    assert.deepStrictEqual(
      namedSkillFiles(stderr),
      ['skills/beta/SKILL.md'],
      `the wrong set of files was named:\n${stderr}`,
    );
  });
});

// The round trip. check-release.mjs carries its own copy of the stamper's
// metadata.version read, because importing the stamper would execute a writer.
// This case is what keeps the two parsers in step: the real stamper writes the
// value and the real verifier reads it back, both against one shared tree.
testCase('check-release: V5 the real stamper then the real verifier agree on one shared tree', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  withCheckFixture({
    specs,
    changelogText: changelog('0.3.0 - 2026-08-26'),
    scripts: [CHECK, STAMPER],
  }, (dir) => {
    const stamp = runStamper(dir, ['0.3.0']);
    assert.strictEqual(stamp.status, 0, `the stamper exited ${stamp.status}\n${stamp.stderr}`);
    const { status, stdout, stderr } = runCheck(dir, ['0.3.0']);
    assert.strictEqual(status, 0, `the verifier rejected the tree the stamper just wrote\n${stdout}\n${stderr}`);
  });
});

// Discovery, not a list. Each fixture's output is compared with that same
// fixture's own skills/ listing, never with the other's and never with a
// literal count.
testCase('check-release: V6 one more and one fewer skill folder are both discovered by enumeration', () => {
  const base = chkSpecs();
  const more = [...base, { name: 'delta', version: '0.1.0' }];
  const fewer = base.slice(0, -1);
  const seen = [];
  for (const specs of [more, fewer]) {
    // Every folder disagrees with CHK_VERSION in `more` only through delta, so
    // give each fixture a version no file carries and read the whole set back.
    withCheckFixture({ specs, changelogText: changelog('9.9.9 - 2026-08-26') }, (dir) => {
      const { status, stderr } = runCheck(dir, ['9.9.9']);
      assert.notStrictEqual(status, 0, 'expected a non-zero exit when no file carries the argument');
      const named = namedSkillFiles(stderr);
      assert.deepStrictEqual(named, fixtureSkillFiles(dir), `the named set did not match this fixture's own folders:\n${stderr}`);
      assert.strictEqual(named.length, specs.length, "the named set did not match this fixture's own specs");
      seen.push(named.length);
    });
  }
  assert.strictEqual(seen[0] - seen[1], more.length - fewer.length, 'the two fixtures were not distinguished');
});

// ---- cases: changelog-section.mjs -------------------------------------------
// changelog-section.mjs derives its own root from its own file location, two
// directories up, so every case here copies it into the fixture at
// .github/scripts/ and runs that copy, the same copied-script technique the
// sections above established. Running SECTION itself would read this
// repository's own CHANGELOG.md rather than the fixture's, so no case here
// ever spawns SECTION directly.
//
// Nothing here needs a git repository or a skill tree: the reader never calls
// git, never reads a tag and never opens a skill file. A CHANGELOG.md alone is
// the whole fixture, and every expected value is derived from the same text
// the case itself wrote into that fixture, never from a literal copied out of
// the script.

const SECTION = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'changelog-section.mjs');

// A CHANGELOG.md holding changelogText, plus a copy of changelog-section.mjs at
// .github/scripts/, the depth the script's own two-parent root walk assumes,
// so the copy reads <dir>/CHANGELOG.md. Pass null to leave CHANGELOG.md out of
// the tree altogether: a missing file and an empty file are different cases.
function withChangelogFixture(changelogText, fn) {
  const tree = {};
  if (changelogText !== null) tree['CHANGELOG.md'] = changelogText;
  return withFixture(tree, (dir) => {
    const dest = path.join(dir, '.github', 'scripts', path.basename(SECTION));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(SECTION, dest);
    return fn(dir);
  });
}

// Runs the copy of changelog-section.mjs inside the fixture, never SECTION itself.
function runSection(dir, args) {
  const copy = path.join(dir, '.github', 'scripts', 'changelog-section.mjs');
  const res = spawnSync(process.execPath, [copy, ...args], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

// The equality assertion is what proves the heading line is dropped, the blank
// lines around the body are trimmed and the collection stops at the next
// heading: any one of those failing changes the whole string.
testCase('changelog-section: S1 a section prints without its heading, trimmed, and stops at the next heading', () => {
  const body = ['### Added', '', '- one added line.'].join('\n');
  const older = 'The older release.';
  const text = `## 0.2.0 - 2026-08-26\n\n${body}\n\n## 0.1.0 - 2026-08-01\n\n${older}\n`;
  withChangelogFixture(text, (dir) => {
    const { status, stdout, stderr } = runSection(dir, ['0.2.0']);
    assert.strictEqual(status, 0, `changelog-section exited ${status}\n${stdout}\n${stderr}`);
    assert.strictEqual(stdout, `${body}\n`, `the printed text is not this fixture's own section:\n${stdout}`);
  });
});

testCase('changelog-section: S2 the last section in the file runs to the end of the file', () => {
  const body = ['### Fixed', '', '- the last line the file holds.'].join('\n');
  const text = `## 0.2.0 - 2026-08-26\n\nThe newer release.\n\n## 0.1.0 - 2026-08-01\n\n${body}\n`;
  withChangelogFixture(text, (dir) => {
    const { status, stdout, stderr } = runSection(dir, ['0.1.0']);
    assert.strictEqual(status, 0, `changelog-section exited ${status}\n${stdout}\n${stderr}`);
    assert.strictEqual(stdout, `${body}\n`, `the last section was not read to the end of the file:\n${stdout}`);
  });
});

// A reader that took the first heading in the file, or the newest one, would
// pass on the newer version and fail on the older one. Both are asked for here,
// against one fixture.
testCase('changelog-section: S3 with an Unreleased heading above two releases the version asked for is the one returned', () => {
  const newer = '- the newer release.';
  const older = '- the older release.';
  const text = `## Unreleased\n\n## 0.2.0 - 2026-08-26\n\n${newer}\n\n## 0.1.0 - 2026-08-01\n\n${older}\n`;
  withChangelogFixture(text, (dir) => {
    const old = runSection(dir, ['0.1.0']);
    assert.strictEqual(old.status, 0, `changelog-section exited ${old.status}\n${old.stdout}\n${old.stderr}`);
    assert.strictEqual(old.stdout, `${older}\n`, `the older version returned the wrong section:\n${old.stdout}`);
    const recent = runSection(dir, ['0.2.0']);
    assert.strictEqual(recent.status, 0, `changelog-section exited ${recent.status}\n${recent.stdout}\n${recent.stderr}`);
    assert.strictEqual(recent.stdout, `${newer}\n`, `the newer version returned the wrong section:\n${recent.stdout}`);
  });
});

// The text reaches a release body through a JSON payload, so the characters a
// naive shell interpolation would break are the ones this case carries.
testCase('changelog-section: S4 backticks, double quotes and blank lines inside a section survive verbatim', () => {
  const body = [
    '### Changed',
    '',
    '- `fc-index.mjs` now names the "release" heading it read.',
    '',
    '  A second paragraph, after a blank line.',
  ].join('\n');
  const text = `## 0.2.0 - 2026-08-26\n\n${body}\n\n## 0.1.0 - 2026-08-01\n\nThe older release.\n`;
  withChangelogFixture(text, (dir) => {
    const { status, stdout, stderr } = runSection(dir, ['0.2.0']);
    assert.strictEqual(status, 0, `changelog-section exited ${status}\n${stdout}\n${stderr}`);
    assert.strictEqual(stdout, `${body}\n`, `the section did not survive character for character:\n${stdout}`);
  });
});

// Every refusal below asserts an empty stdout, not merely a missing section.
// The caller redirects stdout into the file it publishes, so a refusal that
// printed a partial section would still exit 1 and would still be published.
const assertRefused = (result, what) => {
  assert.strictEqual(result.status, 1, `expected exit 1 ${what}, got ${result.status}\n${result.stdout}\n${result.stderr}`);
  assert.strictEqual(result.stdout.length, 0, `stdout was not empty ${what}:\n${result.stdout}`);
  assert.ok(
    result.stderr.includes('changelog-section: '),
    `stderr did not carry the named reason ${what}:\n${result.stderr}`,
  );
};

testCase('changelog-section: S5 an argument that is not a bare X.Y.Z is refused with an empty stdout', () => {
  const version = '0.2.0';
  withChangelogFixture(changelog(`${version} - 2026-08-26`), (dir) => {
    assertRefused(runSection(dir, ['v0.2.0']), 'for an argument carrying a leading v');
  });
});

testCase('changelog-section: S6 a missing CHANGELOG.md is refused with an empty stdout', () => {
  withChangelogFixture(null, (dir) => {
    assertRefused(runSection(dir, ['0.2.0']), 'for a fixture holding no CHANGELOG.md');
  });
});

testCase('changelog-section: S7 a version no heading names is refused with an empty stdout', () => {
  const present = '0.2.0';
  const absent = '0.1.0';
  withChangelogFixture(changelog(`${present} - 2026-08-26`), (dir) => {
    assertRefused(runSection(dir, [absent]), `for a version no heading names (${absent})`);
  });
});

testCase('changelog-section: S8 a heading followed immediately by the next heading is refused with an empty stdout', () => {
  const text = '## 0.2.0 - 2026-08-26\n\n## 0.1.0 - 2026-08-01\n\nThe older release.\n';
  withChangelogFixture(text, (dir) => {
    assertRefused(runSection(dir, ['0.2.0']), 'for a section holding no text');
  });
});

// --help answers before any argument parsing and before any read, so it must
// answer in a fixture where a read would refuse.
testCase('changelog-section: S9 --help answers on stdout with exit 0 in a fixture holding no CHANGELOG.md', () => {
  withChangelogFixture(null, (dir) => {
    const { status, stdout, stderr } = runSection(dir, ['--help']);
    assert.strictEqual(status, 0, `--help exited ${status}\n${stdout}\n${stderr}`);
    assert.ok(stdout.length > 0, '--help printed nothing on stdout');
    assert.ok(
      stdout.includes('changelog-section.mjs'),
      `--help did not print this script's own help text:\n${stdout}`,
    );
  });
});

// ---- cases: build-release-zip.mjs -------------------------------------------
// build-release-zip.mjs derives its own root from its own file location, two
// directories up, so every case here copies it into the fixture at
// .github/scripts/ and runs that copy, the same copied-script technique the
// sections above established. Running BUILD_ZIP itself would read this
// repository's skills/ tree and write this repository's dist/.
//
// Each fixture holds skill folders with nested files plus decoy
// repository-root files that must never reach the archive, including one
// .github/scripts/x.mjs sitting beside the copied builder. One skill folder
// also holds its own LICENSE, whose name matches a decoy: the archive must
// carry that one and drop the root one, which is what proves the builder
// chooses by source directory rather than by filename.
//
// The archive is read back by the small central-directory reader below, so the
// suite needs no unzip binary and stays hermetic. The reader parses the central
// directory rather than scanning for local headers, so an archive written with
// a wrong central-directory offset fails a case instead of passing one.

const BUILD_ZIP = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'build-release-zip.mjs');

// The version every case builds, and the file name it implies. The name carries
// no leading v; the tag does, the asset does not.
const ZIP_VERSION = '0.3.0';
const ZIP_NAME = `flowcharge-core-${ZIP_VERSION}.zip`;

// The default skills/ tree. A function, so each case owns its own array. Every
// count in this section is derived from the case's own specs or from a listing
// of its own fixture, never written as a literal.
const zipSpecs = () => [
  { name: 'alpha', version: '0.1.0' },
  { name: 'beta', version: '0.1.0' },
  { name: 'gamma', version: '0.1.0' },
];

// The skill folder that carries the nested files, named once so the cases can
// name it too without writing the path twice.
const ZIP_NESTED_SKILL = 'alpha';
const ZIP_DEEP_PATH = 'prompts/deep/file.md';
const ZIP_DEEP_TEXT = 'Deeply nested fixture content, carried at every depth.\n';
const ZIP_SKILL_LICENSE_TEXT = 'The LICENSE that belongs to this skill folder, not to the repository.\n';

// Repository-root files that must never appear in the archive. Every one of
// them is a real file in this repository too, which is the point.
const zipDecoys = () => ({
  'README.md': 'root README decoy\n',
  'CHANGELOG.md': '## 0.3.0 - 2026-08-26\n\nRelease notes.\n',
  LICENSE: 'root LICENSE decoy\n',
  '.github/scripts/x.mjs': '// a decoy sitting beside the copied builder\n',
  'flowcharge/y.md': 'decoy inside flowcharge/\n',
});

// The nested files inside one skill folder, including the same-named LICENSE.
const zipNested = () => ({
  [`skills/${ZIP_NESTED_SKILL}/${ZIP_DEEP_PATH}`]: ZIP_DEEP_TEXT,
  [`skills/${ZIP_NESTED_SKILL}/LICENSE`]: ZIP_SKILL_LICENSE_TEXT,
});

// opts:
//   specs   skillsTree() specs, the only source of any skill count
//   files   extra {relative path: content} entries
//   decoys  false leaves the repository-root decoys out
//   nested  false leaves the nested skill files out
function withZipFixture(opts, fn) {
  const { specs, files = {}, decoys = true, nested = true } = opts;
  const tree = {
    ...skillsTree(specs),
    ...(nested ? zipNested() : {}),
    ...(decoys ? zipDecoys() : {}),
    ...files,
  };
  return withFixture(tree, (dir) => {
    const dest = path.join(dir, '.github', 'scripts', 'build-release-zip.mjs');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(BUILD_ZIP, dest);
    return fn(dir);
  });
}

// Runs the copy of build-release-zip.mjs inside the fixture, never BUILD_ZIP.
function runBuildZip(dir, args) {
  const copy = path.join(dir, '.github', 'scripts', 'build-release-zip.mjs');
  const res = spawnSync(process.execPath, [copy, ...args], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const zipPath = (dir) => path.join(dir, 'dist', ZIP_NAME);

// Whatever dist/ holds, dotfiles included, so a leftover temporary file is
// visible to the refusal cases. An absent dist/ reads as empty.
const distEntries = (dir) => {
  const distDir = path.join(dir, 'dist');
  return fs.existsSync(distDir) ? fs.readdirSync(distDir).sort() : [];
};

// A minimal ZIP reader. It finds the end-of-central-directory record, walks the
// central directory it points at, and for each entry follows the recorded local
// header offset to the file data, the same route a real unzip takes, so a
// wrong offset fails here rather than passing.
function readZipEntries(zipFile) {
  const buf = fs.readFileSync(zipFile);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  assert.notStrictEqual(eocd, -1, 'the archive holds no end-of-central-directory record');
  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < count; n++) {
    assert.strictEqual(buf.readUInt32LE(offset), 0x02014b50, `central directory record ${n} has the wrong signature`);
    const method = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const size = buf.readUInt32LE(offset + 24);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localOffset = buf.readUInt32LE(offset + 42);
    const name = buf.slice(offset + 46, offset + 46 + nameLen).toString('utf8');
    assert.strictEqual(buf.readUInt32LE(localOffset), 0x04034b50, `${name}: the central directory points at no local header`);
    const dataStart = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
    const stored = buf.slice(dataStart, dataStart + compressedSize);
    const data = method === 8 ? inflateRawSync(stored) : Buffer.from(stored);
    assert.strictEqual(data.length, size, `${name}: the entry inflated to the wrong length`);
    entries.push({ name, data });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

const entryNames = (dir) => readZipEntries(zipPath(dir)).map((e) => e.name).sort();

// The first path segment of an archive entry, and nothing else. Every top-level
// assertion in this section is made on this value: a whole-path assertion would
// either miss a wrongly stripped nested file or fail on a legitimate one.
const firstSegment = (name) => name.split('/')[0];

const archiveTopLevel = (dir) => [...new Set(entryNames(dir).map(firstSegment))].sort();

// The skill folders the fixture itself holds, read from its own skills/
// directory by the same rule the builder applies, never from a list here.
const fixtureSkillFolders = (dir) =>
  fs.readdirSync(path.join(dir, 'skills'))
    .filter((name) => fs.existsSync(path.join(dir, 'skills', name, 'SKILL.md')))
    .sort();

testCase('build-release-zip: Z1 a clean run writes dist/flowcharge-core-<version>.zip, with no leading v', () => {
  withZipFixture({ specs: zipSpecs() }, (dir) => {
    const { status, stdout, stderr } = runBuildZip(dir, [ZIP_VERSION]);
    assert.strictEqual(status, 0, `build-release-zip exited ${status}\n${stdout}\n${stderr}`);
    assert.deepStrictEqual(distEntries(dir), [ZIP_NAME], `dist/ holds the wrong set of files`);
    assert.ok(!ZIP_NAME.includes(`v${ZIP_VERSION}`), 'the asset name carries a leading v');
  });
});

testCase('build-release-zip: Z2 every entry sits under a skill folder, with no wrapper directory and no skills/ prefix', () => {
  const specs = zipSpecs();
  withZipFixture({ specs }, (dir) => {
    assert.strictEqual(runBuildZip(dir, [ZIP_VERSION]).status, 0);
    const folders = fixtureSkillFolders(dir);
    for (const name of entryNames(dir)) {
      assert.ok(folders.includes(firstSegment(name)), `${name} does not sit under a discovered skill folder`);
    }
    assert.ok(!entryNames(dir).some((n) => n.startsWith('skills/')), 'an entry kept its skills/ prefix');
  });
});

// The set of first path segments, compared with the fixture's own folder list.
// Asserting on whole paths here would either pass while <n>/LICENSE was wrongly
// stripped or fail on that same legitimate nested file.
testCase('build-release-zip: Z3 the top level is exactly the discovered skill folders and no decoy', () => {
  const specs = zipSpecs();
  withZipFixture({ specs }, (dir) => {
    assert.strictEqual(runBuildZip(dir, [ZIP_VERSION]).status, 0);
    const top = archiveTopLevel(dir);
    assert.deepStrictEqual(top, fixtureSkillFolders(dir), 'the archive top level is not the fixture\'s own skill folders');
    assert.strictEqual(top.length, specs.length, "the top level does not match the fixture's own specs");
    for (const decoy of [...Object.keys(zipDecoys()).map(firstSegment), 'dist', 'skills']) {
      assert.ok(!top.includes(decoy), `${decoy} reached the archive's top level`);
    }
  });
});

// The pair that separates a source-directory rule from a filename rule: the
// root LICENSE must be absent and the skill folder's own LICENSE must be
// present, with its bytes unchanged.
testCase('build-release-zip: Z4 nested files survive at every depth, including a skill folder LICENSE the root decoy shares a name with', () => {
  withZipFixture({ specs: zipSpecs() }, (dir) => {
    assert.strictEqual(runBuildZip(dir, [ZIP_VERSION]).status, 0);
    const entries = readZipEntries(zipPath(dir));
    const byName = new Map(entries.map((e) => [e.name, e.data]));

    const deep = `${ZIP_NESTED_SKILL}/${ZIP_DEEP_PATH}`;
    assert.ok(byName.has(deep), `${deep} is missing from the archive`);
    assert.strictEqual(byName.get(deep).toString('utf8'), ZIP_DEEP_TEXT, `${deep} did not arrive byte-identical`);

    const skillLicense = `${ZIP_NESTED_SKILL}/LICENSE`;
    assert.ok(byName.has(skillLicense), `${skillLicense} was stripped by a filename rule`);
    assert.strictEqual(byName.get(skillLicense).toString('utf8'), ZIP_SKILL_LICENSE_TEXT, `${skillLicense} did not arrive byte-identical`);

    assert.ok(!byName.has('LICENSE'), 'the repository-root LICENSE reached the archive');
    for (const decoy of Object.keys(zipDecoys())) {
      assert.ok(!byName.has(decoy), `the root decoy ${decoy} reached the archive`);
    }
  });
});

// Discovery, not a list: one more skill folder means one more top-level
// directory, and a skills/ entry with no SKILL.md is skipped. Both counts come
// from the fixtures' own folder lists.
testCase('build-release-zip: Z5 an added skill folder adds one top-level directory and a folder with no SKILL.md is skipped', () => {
  const base = zipSpecs();
  const more = [...base, { name: 'delta', version: '0.1.0' }];
  const notASkill = { 'skills/notaskill/notes.md': 'a skills/ entry with no SKILL.md\n' };
  const tops = [];
  for (const specs of [base, more]) {
    withZipFixture({ specs, files: notASkill }, (dir) => {
      assert.strictEqual(runBuildZip(dir, [ZIP_VERSION]).status, 0);
      const top = archiveTopLevel(dir);
      assert.deepStrictEqual(top, fixtureSkillFolders(dir), "the top level did not match this fixture's own skill folders");
      assert.ok(!top.includes('notaskill'), 'a skills/ folder with no SKILL.md reached the archive');
      tops.push(top.length);
    });
  }
  assert.strictEqual(tops[1] - tops[0], more.length - base.length, 'the added skill folder was not discovered');
});

testCase('build-release-zip: Z6 every refusal writes nothing, and --help writes nothing either', () => {
  const specs = zipSpecs();
  withZipFixture({ specs }, (dir) => {
    for (const args of [['v0.3.0'], ['0.3'], ['0.3.0-rc.1'], []]) {
      const label = args.length ? args[0] : '(no argument)';
      const { status, stdout, stderr } = runBuildZip(dir, args);
      assert.notStrictEqual(status, 0, `expected a refusal for ${label}`);
      assert.ok(stderr.length > 0, `expected an error on stderr for ${label}`);
      assert.strictEqual(stdout, '', `expected no stdout for ${label}:\n${stdout}`);
      assert.deepStrictEqual(distEntries(dir), [], `${label} wrote into dist/`);
    }
    const help = runBuildZip(dir, ['--help']);
    assert.strictEqual(help.status, 0, `--help exited ${help.status}\n${help.stderr}`);
    assert.ok(help.stdout.includes('<X.Y.Z>'), `--help did not print the usage line:\n${help.stdout}`);
    assert.deepStrictEqual(distEntries(dir), [], '--help wrote into dist/');
  });

  // A skills/ tree holding no skill folder at all: an empty release asset is
  // worse than a failed build, so the run refuses and writes nothing.
  withZipFixture({ specs: [], nested: false, files: { 'skills/notaskill/notes.md': 'no SKILL.md here\n' } }, (dir) => {
    const { status, stderr } = runBuildZip(dir, [ZIP_VERSION]);
    assert.notStrictEqual(status, 0, 'expected a refusal when no skill folder was discovered');
    assert.ok(stderr.length > 0, 'expected an error on stderr when no skill folder was discovered');
    assert.deepStrictEqual(distEntries(dir), [], 'a file was written despite discovering no skill folder');
  });
});

// ---- cases: manifest.mjs ----------------------------------------------------
// manifest.mjs derives its own root from its own file location, two directories
// up, and it takes no --root flag, so every case here copies it into the fixture
// at .github/scripts/ and runs that copy, the same copied-script technique the
// sections above established. Running MANIFEST itself would hash this
// repository's own skills/ tree and write this repository's own
// skills/manifest.json, so no case here ever spawns MANIFEST directly.
//
// Two things separate this section's fixtures from WS-76's. First, every
// fixture root carries a VERSIONING.md: it is the marker the generator's root
// derivation checks, and a fixture without one fails every case for the wrong
// reason. Second, the trees are built here rather than through fixture(),
// which always creates flowcharge/workstreams/, a directory this script
// neither needs nor may read, and one whose presence in a fixture would hide a
// mistake. WS-76's own builders each bind one script to one set of extra files
// and go through fixture(), so none of them is reusable as-is; this one mirrors
// withCheckFixture()'s scripts option instead.
//
// The stamper is copied in only for the round-trip case. manifest.mjs imports
// nothing from it, so every other case passing with the stamper absent is
// itself evidence that no hidden import exists.

const MANIFEST = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'manifest.mjs');

// The version every case generates at, except the round trip and the discovery
// pair, which carry their own.
const MAN_VERSION = '0.2.0';

// Where the copies land inside a fixture: the exact depth the script ships
// from. One refusal case overrides it to pin the old, wrong depth.
const MAN_SCRIPT_DIR = ['.github', 'scripts'];

// The marker file the generator's root derivation requires. Its content is
// never read, only its existence.
const MAN_VERSIONING = '# Versioning\n\nFixture marker file for the manifest cases.\n';

// The default skills/ tree, already carrying MAN_VERSION. A function, so each
// case owns its own array and no case can mutate another's. Every count in this
// section comes from the case's own specs or from a listing of its own fixture,
// never from a literal.
const manSpecs = () => [
  { name: 'alpha', version: MAN_VERSION },
  { name: 'beta', version: MAN_VERSION },
  { name: 'gamma', version: MAN_VERSION },
];

// opts:
//   specs       skillsTree() specs, the only source of any skill count
//   files       extra {relative path: content} entries
//   versioning  false leaves VERSIONING.md out, for the marker refusal
//   scripts     the scripts to copy in; only the round trip needs the stamper
//   scriptDir   where the copies land, relative to the fixture root, so the
//               old-depth regression case can put one somewhere wrong
//
// The tree is removed afterwards, including when fn throws, following the
// withFixture() pattern this file established.
function withManifestFixture(opts, fn) {
  const {
    specs,
    files = {},
    versioning = true,
    scripts = [MANIFEST],
    scriptDir = MAN_SCRIPT_DIR,
  } = opts;
  const tree = { ...skillsTree(specs), ...files };
  if (versioning) tree['VERSIONING.md'] = MAN_VERSIONING;
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  try {
    for (const rel of Object.keys(tree)) {
      const filePath = path.join(dir, rel);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, tree[rel]);
    }
    for (const script of scripts) {
      const dest = path.join(dir, ...scriptDir, path.basename(script));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(script, dest);
    }
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Runs the copy of manifest.mjs inside the fixture, never MANIFEST itself. The
// script takes no --root flag, so the copy's own location is what decides which
// tree it reads and writes.
function runManifest(dir, args, scriptDir = MAN_SCRIPT_DIR) {
  const copy = path.join(dir, ...scriptDir, 'manifest.mjs');
  const res = spawnSync(process.execPath, [copy, ...args], { cwd: dir, encoding: 'utf8' });
  if (res.error) throw res.error;
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const manifestFile = (dir) => path.join(dir, 'skills', 'manifest.json');
const manifestExists = (dir) => fs.existsSync(manifestFile(dir));
const manifestText = (dir) => fs.readFileSync(manifestFile(dir), 'utf8');
const readManifest = (dir) => JSON.parse(manifestText(dir));

// name -> sha256, so a case can compare two runs entry by entry without
// depending on the array's position of any one skill.
const digestsOf = (parsed) => Object.fromEntries(parsed.skills.map((s) => [s.name, s.sha256]));

// Runs the generator, asserts it succeeded, and hands back the parsed document.
// fixtureSkillFolders(), defined by the build-release-zip section above, reads
// the fixture's own skills/ directory by the same rule the generator applies.
function generateManifest(dir, args = [MAN_VERSION]) {
  const { status, stdout, stderr } = runManifest(dir, args);
  assert.strictEqual(status, 0, `manifest exited ${status}\n${stdout}\n${stderr}`);
  return { parsed: readManifest(dir), stdout, stderr };
}

testCase('manifest: M1 a clean run writes skills/manifest.json with one entry per folder its own fixture created', () => {
  const specs = [
    { name: 'alpha', version: MAN_VERSION },
    { name: 'beta', version: MAN_VERSION },
  ];
  withManifestFixture({ specs }, (dir) => {
    const { status, stdout, stderr } = runManifest(dir, [MAN_VERSION]);
    assert.strictEqual(status, 0, `manifest exited ${status}\n${stdout}\n${stderr}`);
    assert.ok(manifestExists(dir), 'no skills/manifest.json was written');
    const parsed = readManifest(dir);
    assert.deepStrictEqual(
      parsed.skills.map((s) => s.name),
      fixtureSkillFolders(dir),
      "the entries did not match this fixture's own skill folders",
    );
    assert.strictEqual(parsed.skills.length, specs.length, "the entry count did not match this fixture's own specs");
    assert.ok(stdout.includes('wrote skills/manifest.json'), `missing summary line:\n${stdout}`);
    assert.strictEqual(stderr, '', `a passing run wrote to stderr:\n${stderr}`);
  });
});

// The shape of the document, pinned at both levels. The folders are created out
// of alphabetical order on purpose: creating them sorted would make the sort
// assertion pass whatever the generator did. Key order is read off Object.keys
// of the PARSED value, never matched as a substring of the text, because a
// whole-string comparison would pin the fixture's exact bytes and fail on any
// unrelated content change. Indentation and the trailing newline are the only
// two properties read off the raw text, because JSON.parse discards both.
testCase('manifest: M2 the document has the contracted key order, sorting, version invariant and generated day', () => {
  const specs = [
    { name: 'gamma', version: MAN_VERSION },
    { name: 'alpha', version: MAN_VERSION },
    { name: 'beta', version: MAN_VERSION },
  ];
  const created = specs.map((s) => s.name);
  assert.notDeepStrictEqual(created, [...created].sort(), 'the fixture folders were created in alphabetical order');
  withManifestFixture({ specs }, (dir) => {
    const { parsed } = generateManifest(dir);

    assert.deepStrictEqual(Object.keys(parsed), ['suite_version', 'generated', 'skills'], 'the top-level key order is not the contracted one');
    for (const entry of parsed.skills) {
      assert.deepStrictEqual(Object.keys(entry), ['name', 'version', 'sha256'], `${entry.name}: the entry key order is not the contracted one`);
    }

    const names = parsed.skills.map((s) => s.name);
    assert.deepStrictEqual(names, [...names].sort(), 'the entries are not sorted by name ascending');
    assert.deepStrictEqual(names, fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
    assert.strictEqual(names.length, specs.length, "the entry count did not match this fixture's own specs");

    assert.strictEqual(parsed.suite_version, MAN_VERSION, 'suite_version is not the argument verbatim');
    for (const entry of parsed.skills) {
      assert.strictEqual(entry.version, parsed.suite_version, `${entry.name}: version does not mirror suite_version`);
    }

    // today() is this file's own local-calendar day, the same rule the script's
    // localDay() applies. A toISOString() day would be UTC and would disagree
    // with the script for anyone running the suite near midnight.
    assert.strictEqual(parsed.generated, today(), 'generated is not the local calendar day');

    const text = manifestText(dir);
    assert.ok(text.endsWith('\n'), 'the file does not end with a newline');
    assert.ok(!text.endsWith('\n\n'), 'the file ends with more than one newline');
    assert.ok(text.includes('\n  "suite_version"'), 'the file is not written with a two-space indent');
    assert.strictEqual(text, `${JSON.stringify(parsed, null, 2)}\n`, 'the raw text is not the parsed value at a two-space indent with a trailing newline');
  });
});

// The round trip. manifest.mjs carries its own read of metadata.version, because
// importing the stamper would execute a writer at module scope. This case is the
// only thing that keeps the two readers in step: the real stamper writes the
// value and the real generator reads it back, both against one shared tree. It
// is the same guard case V5 puts on check-release.mjs, and it is the one case in
// this section whose fixture carries the stamper at all.
testCase('manifest: M3 the real stamper then the real generator agree on one shared tree', () => {
  const specs = [
    { name: 'alpha', version: '0.1.0' },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: '0.1.9' },
  ];
  const roundTripVersion = '0.3.0';
  withManifestFixture({ specs, scripts: [MANIFEST, STAMPER] }, (dir) => {
    const stamp = runStamper(dir, [roundTripVersion]);
    assert.strictEqual(stamp.status, 0, `the stamper exited ${stamp.status}\n${stamp.stderr}`);
    const { status, stdout, stderr } = runManifest(dir, [roundTripVersion]);
    assert.strictEqual(status, 0, `the generator refused the tree the stamper just wrote\n${stdout}\n${stderr}`);
    const parsed = readManifest(dir);
    assert.strictEqual(parsed.suite_version, roundTripVersion);
    assert.deepStrictEqual(parsed.skills.map((s) => s.name), fixtureSkillFolders(dir));
    for (const entry of parsed.skills) {
      assert.strictEqual(entry.version, roundTripVersion, `${entry.name}: the generator read a value the stamper did not write`);
    }
  });
});

// The digest contract. These six cases are the frozen definition of a public
// value: once a release publishes digests, changing what the hash covers or how
// it is fed invalidates every published one. They assert observable properties
// only. No expected hex digest is written down anywhere in this section. A
// hard-coded digest would pin the harness to the fixture's exact bytes, fail on
// every unrelated fixture edit, and prove nothing these properties do not.

// One nested, non-SKILL.md file inside one skill folder, under a subdirectory,
// so the walk's recursion is exercised rather than assumed.
const MAN_NESTED_SKILL = 'alpha';
const MAN_NESTED_PATH = 'prompts/notes.md';
const MAN_NESTED_TEXT = 'A nested prompt file, hashed at depth.\n';
const manNested = () => ({ [`skills/${MAN_NESTED_SKILL}/${MAN_NESTED_PATH}`]: MAN_NESTED_TEXT });
const nestedFile = (dir, rel = MAN_NESTED_PATH) =>
  path.join(dir, 'skills', MAN_NESTED_SKILL, ...rel.split('/'));

// Every digest except the named one, so a case can say "this moved and nothing
// else did" in one comparison rather than one assertion per untouched folder.
const digestsExcept = (map, name) =>
  Object.fromEntries(Object.entries(map).filter(([k]) => k !== name));

testCase('manifest: M4 the same tree hashed twice produces byte-identical output', () => {
  withManifestFixture({ specs: manSpecs(), files: manNested() }, (dir) => {
    const first = generateManifest(dir);
    const firstText = manifestText(dir);
    const second = generateManifest(dir);
    // manifest.json sits directly under skills/, outside every skill folder, so
    // the first run's own write must not move a digest on the second run. This
    // asserts that rather than assuming it.
    assert.deepStrictEqual(digestsOf(second.parsed), digestsOf(first.parsed), 'a digest moved between two runs over an unchanged tree');
    assert.strictEqual(manifestText(dir), firstText, 'the two runs did not produce byte-identical output');
  });
});

testCase('manifest: M5 a one-byte edit to a nested file moves that skill\'s digest and no other', () => {
  withManifestFixture({ specs: manSpecs(), files: manNested() }, (dir) => {
    const before = digestsOf(generateManifest(dir).parsed);
    fs.appendFileSync(nestedFile(dir), 'x');
    const after = digestsOf(generateManifest(dir).parsed);
    assert.notStrictEqual(after[MAN_NESTED_SKILL], before[MAN_NESTED_SKILL], `${MAN_NESTED_SKILL}: the digest did not move after a nested file changed`);
    assert.deepStrictEqual(digestsExcept(after, MAN_NESTED_SKILL), digestsExcept(before, MAN_NESTED_SKILL), 'an unedited skill\'s digest moved');
  });
});

// The relative path is part of the hash, so a rename with unchanged bytes must
// move the digest. The bytes are read back and compared, because a rename that
// also changed the length would move the digest through the length alone and
// prove nothing about the path.
testCase('manifest: M6 renaming a file with its bytes unchanged moves that skill\'s digest', () => {
  withManifestFixture({ specs: manSpecs(), files: manNested() }, (dir) => {
    const before = digestsOf(generateManifest(dir).parsed);
    const from = nestedFile(dir);
    const to = nestedFile(dir, 'prompts/renamed.md');
    const bytes = fs.readFileSync(from);
    fs.renameSync(from, to);
    assert.deepStrictEqual(fs.readFileSync(to), bytes, 'the rename changed the file bytes');
    const after = digestsOf(generateManifest(dir).parsed);
    assert.notStrictEqual(after[MAN_NESTED_SKILL], before[MAN_NESTED_SKILL], `${MAN_NESTED_SKILL}: the digest did not move after a file was renamed`);
    assert.deepStrictEqual(digestsExcept(after, MAN_NESTED_SKILL), digestsExcept(before, MAN_NESTED_SKILL), 'an untouched skill\'s digest moved');
  });
});

testCase('manifest: M7 adding a dotfile inside a skill folder does not move its digest', () => {
  withManifestFixture({ specs: manSpecs(), files: manNested() }, (dir) => {
    const before = digestsOf(generateManifest(dir).parsed);
    fs.writeFileSync(path.join(dir, 'skills', MAN_NESTED_SKILL, '.hidden'), 'ignored at the top level\n');
    fs.writeFileSync(nestedFile(dir, 'prompts/.hidden'), 'ignored at depth\n');
    const after = digestsOf(generateManifest(dir).parsed);
    assert.deepStrictEqual(after, before, 'a dotfile moved a digest');
  });
});

// Two folders whose file trees are byte-identical, built from one shared
// SKILL.md string so the name cannot leak into the content. Their digests must
// be equal, and the two entries must differ in nothing but the name.
testCase('manifest: M8 two skill folders holding byte-identical files share one digest and differ only by name', () => {
  const twinFile = skillFile('twin', MAN_VERSION);
  const twinNested = 'A nested file both twins carry, byte for byte.\n';
  const files = {
    'skills/twin-a/SKILL.md': twinFile,
    'skills/twin-a/prompts/notes.md': twinNested,
    'skills/twin-b/SKILL.md': twinFile,
    'skills/twin-b/prompts/notes.md': twinNested,
  };
  withManifestFixture({ specs: [{ name: 'alpha', version: MAN_VERSION }], files }, (dir) => {
    const { parsed } = generateManifest(dir);
    const byName = new Map(parsed.skills.map((s) => [s.name, s]));
    const a = byName.get('twin-a');
    const b = byName.get('twin-b');
    assert.ok(a && b, 'both twin folders were not discovered');
    assert.strictEqual(a.sha256, b.sha256, 'byte-identical folders produced different digests');
    assert.deepStrictEqual({ ...a, name: null }, { ...b, name: null }, 'the two entries differ in something other than the name');
    assert.notStrictEqual(a.name, b.name, 'the two entries were not distinguished by name');
    assert.notStrictEqual(byName.get('alpha').sha256, a.sha256, 'a folder with different content shared the twins\' digest');
  });
});

testCase('manifest: M9 every digest is 64 lowercase hex characters, and folders that differ never share one', () => {
  const specs = manSpecs();
  withManifestFixture({ specs, files: manNested() }, (dir) => {
    const { parsed } = generateManifest(dir);
    for (const entry of parsed.skills) {
      assert.match(entry.sha256, /^[0-9a-f]{64}$/, `${entry.name}: sha256 is not 64 lowercase hex characters`);
    }
    const digests = parsed.skills.map((s) => s.sha256);
    assert.strictEqual(new Set(digests).size, digests.length, 'two folders whose contents differ share a digest');
    assert.strictEqual(digests.length, specs.length, "the digest count did not match this fixture's own specs");
  });
});

// The refusals. The real content of every case below is the absence of the
// file, not the exit code: a generator that wrote a partial manifest and only
// then exited 1 would pass on the code alone. The run is all-or-nothing, so
// each case asserts the code, one stderr line naming what is wrong, and that
// skills/manifest.json does not exist afterwards.
function assertManifestRefused(dir, res, needles, why) {
  assert.strictEqual(res.status, 1, `expected exit 1 ${why}, got ${res.status}\n${res.stdout}\n${res.stderr}`);
  assert.ok(res.stderr.trim().length > 0, `expected an error on stderr ${why}`);
  for (const needle of needles) {
    assert.ok(res.stderr.includes(needle), `stderr did not name ${JSON.stringify(needle)} ${why}:\n${res.stderr}`);
  }
  assert.strictEqual(res.stdout, '', `expected no stdout ${why}:\n${res.stdout}`);
  assert.ok(!manifestExists(dir), `skills/manifest.json was written ${why}`);
}

for (const badVersion of ['v0.2.0', '0.2', '0.2.0-rc.1']) {
  testCase(`manifest: M10 a malformed version argument (${badVersion}) is refused and writes nothing`, () => {
    withManifestFixture({ specs: manSpecs() }, (dir) => {
      assertManifestRefused(dir, runManifest(dir, [badVersion]), [badVersion], `for ${badVersion}`);
    });
  });
}

testCase('manifest: M11 no version argument at all is refused and writes nothing', () => {
  withManifestFixture({ specs: manSpecs() }, (dir) => {
    assertManifestRefused(dir, runManifest(dir, []), ['version'], 'with no argument');
  });
});

testCase('manifest: M12 a root holding no VERSIONING.md is refused and writes nothing', () => {
  withManifestFixture({ specs: manSpecs(), versioning: false }, (dir) => {
    assertManifestRefused(dir, runManifest(dir, [MAN_VERSION]), ['VERSIONING.md'], 'with no VERSIONING.md at the root');
  });
});

// The regression case for the defect this workstream was corrected to remove.
// A copy placed at the old planned depth, skills/legacy-skill/scripts/, walks
// two parents and resolves its root to <dir>/skills, which holds no
// VERSIONING.md. The marker guard is what turns that into a loud refusal
// instead of a manifest written into the wrong tree, so this case asserts both
// the refusal and that neither candidate path was written.
testCase('manifest: M13 a copy left at the old skills/legacy-skill/scripts/ depth resolves the wrong root and refuses', () => {
  const oldDepth = ['skills', 'legacy-skill', 'scripts'];
  withManifestFixture({ specs: manSpecs(), scriptDir: oldDepth }, (dir) => {
    const res = runManifest(dir, [MAN_VERSION], oldDepth);
    assertManifestRefused(dir, res, ['VERSIONING.md'], 'from a copy at the old depth');
    assert.ok(
      !fs.existsSync(path.join(dir, 'skills', 'skills', 'manifest.json')),
      'a manifest was written under the wrongly resolved root',
    );
  });
});

testCase('manifest: M14 a root with no skills/ directory at all is refused and writes nothing', () => {
  withManifestFixture({ specs: [] }, (dir) => {
    assert.ok(!fs.existsSync(path.join(dir, 'skills')), 'the fixture created a skills/ directory');
    assertManifestRefused(dir, runManifest(dir, [MAN_VERSION]), [path.join(dir, 'skills')], 'with no skills/ directory');
  });
});

testCase('manifest: M15 a skills/ directory holding no SKILL.md is refused rather than written as an empty manifest', () => {
  const files = { 'skills/notaskill/notes.md': 'a skills/ entry with no SKILL.md\n' };
  withManifestFixture({ specs: [], files }, (dir) => {
    assertManifestRefused(dir, runManifest(dir, [MAN_VERSION]), ['SKILL.md'], 'when no SKILL.md was discovered');
  });
});

// The documented shape violated on purpose. The fixture also carries two
// well-formed skills, so the case cannot be confused with the empty-scan
// refusal above, and so the absence assertion proves the well-formed files were
// not written either.
testCase('manifest: M16 a SKILL.md with a bare top-level version key is refused, naming it, and writes nothing', () => {
  const specs = [
    { name: 'alpha', version: MAN_VERSION },
    { name: 'beta', version: MAN_VERSION, badShape: true },
    { name: 'gamma', version: MAN_VERSION },
  ];
  withManifestFixture({ specs }, (dir) => {
    assert.ok(specs.some((s) => !s.badShape), 'the fixture carries no well-formed skill');
    assertManifestRefused(dir, runManifest(dir, [MAN_VERSION]), ['skills/beta/SKILL.md'], 'for a malformed SKILL.md');
  });
});

// What makes the manifest impossible to generate out of order: a tree that has
// not been stamped to the version being released is refused, naming the file
// and both values, rather than published with last release's versions.
testCase('manifest: M17 a SKILL.md whose version disagrees with the argument is refused, naming the file and both values', () => {
  const specs = [
    { name: 'alpha', version: MAN_VERSION },
    { name: 'beta', version: '0.1.5' },
    { name: 'gamma', version: MAN_VERSION },
  ];
  withManifestFixture({ specs }, (dir) => {
    const res = runManifest(dir, [MAN_VERSION]);
    assertManifestRefused(dir, res, ['skills/beta/SKILL.md', '"0.1.5"', `"${MAN_VERSION}"`], 'for a disagreeing SKILL.md');
  });
});

// The two tolerated shapes under skills/, which the generator treats
// differently on purpose: a directory that holds no SKILL.md is announced and
// skipped, because it may be a skill someone forgot to finish; a loose file is
// ignored in silence, because manifest.json itself is one.
const manSkippedWarn = (name) => `skills/${name}: no SKILL.md, skipped`;

testCase('manifest: M18 a directory under skills/ with no SKILL.md warns, stays out of the array, and still exits 0', () => {
  const specs = manSpecs();
  const files = { 'skills/notaskill/notes.md': 'a skills/ entry with no SKILL.md\n' };
  withManifestFixture({ specs, files }, (dir) => {
    const { parsed, stdout } = generateManifest(dir);
    compareWarnSets(warnLines(stdout), [manSkippedWarn('notaskill')]);
    const names = parsed.skills.map((s) => s.name);
    assert.ok(!names.includes('notaskill'), 'the skipped directory reached the skills array');
    assert.deepStrictEqual(names, fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
    assert.strictEqual(names.length, specs.length, "the entry count did not match this fixture's own specs");
  });
});

// The loose files sit directly under skills/, never inside a skill folder: a
// README.md placed inside one would be a legitimate part of that folder and
// would belong in its digest, which is the opposite of what this pins. The
// proof that they reach no digest is a comparison with an otherwise identical
// fixture that does not carry them.
testCase('manifest: M19 loose files directly under skills/ are ignored silently and reach no digest', () => {
  const specs = manSpecs();
  const loose = {
    'skills/manifest.json': '{"stale": true}\n',
    'skills/README.md': 'A loose README directly under skills/, not inside any skill folder.\n',
  };
  const seen = [];
  for (const files of [{}, loose]) {
    withManifestFixture({ specs, files }, (dir) => {
      const { parsed, stdout } = generateManifest(dir);
      compareWarnSets(warnLines(stdout), []);
      const names = parsed.skills.map((s) => s.name);
      assert.deepStrictEqual(names, fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
      for (const looseName of ['manifest.json', 'README.md']) {
        assert.ok(!names.includes(looseName), `the loose ${looseName} was treated as a skill`);
      }
      seen.push(digestsOf(parsed));
    });
  }
  assert.deepStrictEqual(seen[1], seen[0], 'a loose file directly under skills/ reached a digest');
});

// Discovery, not a list. Each fixture's output is compared with that same
// fixture's own folder listing and its own specs, never with a literal count.
// This is the case that fails the moment anyone writes a fixed skill list or a
// skill count into the generator. It mirrors check-release's V6.
testCase('manifest: M20 one more and one fewer skill folder are both discovered by enumeration', () => {
  const base = manSpecs();
  const more = [...base, { name: 'delta', version: MAN_VERSION }];
  const fewer = base.slice(0, -1);
  const counts = [];
  for (const specs of [more, fewer]) {
    withManifestFixture({ specs }, (dir) => {
      const { parsed } = generateManifest(dir);
      const names = parsed.skills.map((s) => s.name);
      assert.deepStrictEqual(names, fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
      assert.strictEqual(names.length, specs.length, "the entry count did not match this fixture's own specs");
      counts.push(names.length);
    });
  }
  assert.strictEqual(counts[0] - counts[1], more.length - fewer.length, 'the two fixtures were not distinguished');
});

// A folded YAML scalar, in the shape skills/fc-dev-principles/SKILL.md carries:
// `description: >-` followed by indented continuation lines, with the
// metadata: / version: pair below them. The continuation lines must stay
// indented exactly as the real file has them, or the case proves nothing about
// them never being misread as keys.
const foldedSkillFile = (name, version) => [
  '---',
  `name: ${name}`,
  'description: >-',
  '  Reference checklist of core software engineering principles: DRY, KISS,',
  '  YAGNI, POLA, Law of Demeter, SOLID, separation of concerns, modularity,',
  '  composition over inheritance, convention over configuration, task/scope',
  '  discipline, and implementation/operational principles (least privilege,',
  '  configuration safety, readability). Use when designing, reviewing, or',
  '  refactoring code and you want to sanity-check the approach against',
  '  established principles, or when the user asks to "apply best practices",',
  '  "check this against SOLID/DRY", or wants a principled second opinion on',
  '  a design or implementation decision. Also useful when decomposing work',
  '  into sub-tasks and wanting to keep scope disciplined and modular.',
  'metadata:',
  `  version: "${version}"`,
  '---',
  '',
  `# ${name}`,
  '',
  `Body line unique to ${name}.`,
  '',
].join('\n');

testCase('manifest: M21 a folded description scalar is read past, and the nested version is still found', () => {
  const specs = [{ name: 'alpha', version: MAN_VERSION }];
  const files = { 'skills/folded/SKILL.md': foldedSkillFile('folded', MAN_VERSION) };
  withManifestFixture({ specs, files }, (dir) => {
    const { parsed } = generateManifest(dir);
    const folded = parsed.skills.find((s) => s.name === 'folded');
    assert.ok(folded, 'the folded-scalar skill was not discovered');
    assert.strictEqual(folded.version, MAN_VERSION, 'the version under a folded scalar was not read correctly');
    assert.deepStrictEqual(parsed.skills.map((s) => s.name), fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
  });
});

// stdout must be parseable JSON and nothing else, so the case parses it rather
// than matching a substring: a substring assertion would pass even with a WARN
// line leaked onto stdout, which is the exact failure this pins.
testCase('manifest: M22 --stdout prints parseable JSON on stdout, writes no file, and puts the WARN and summary on stderr', () => {
  const specs = manSpecs();
  const files = { 'skills/notaskill/notes.md': 'a skills/ entry with no SKILL.md\n' };
  withManifestFixture({ specs, files }, (dir) => {
    const { status, stdout, stderr } = runManifest(dir, [MAN_VERSION, '--stdout']);
    assert.strictEqual(status, 0, `manifest --stdout exited ${status}\n${stdout}\n${stderr}`);
    const parsed = JSON.parse(stdout);
    assert.deepStrictEqual(parsed.skills.map((s) => s.name), fixtureSkillFolders(dir), "the entries did not match this fixture's own skill folders");
    assert.ok(!manifestExists(dir), '--stdout wrote skills/manifest.json');
    compareWarnSets(warnLines(stdout), []);
    compareWarnSets(warnLines(stderr), [manSkippedWarn('notaskill')]);
    assert.ok(stderr.includes('wrote nothing (--stdout)'), `the summary line did not reach stderr:\n${stderr}`);
  });
});

testCase('manifest: M23 --help answers in an empty directory, prints the usage on stdout, and writes nothing', () => {
  // Not the section's builder: that writes VERSIONING.md and the script copy,
  // and this case asserts the directory the run happens in is left completely
  // empty. The copy therefore lives in a second temp tree of its own, so this
  // case still never spawns this repository's own manifest.mjs.
  const holder = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  const empty = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), FIXTURE_PREFIX)));
  try {
    const copy = path.join(holder, ...MAN_SCRIPT_DIR, 'manifest.mjs');
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(MANIFEST, copy);
    const res = spawnSync(process.execPath, [copy, '--help'], { cwd: empty, encoding: 'utf8' });
    if (res.error) throw res.error;
    const stdout = res.stdout || '';
    assert.strictEqual(res.status, 0, `--help exited ${res.status}\n${res.stderr || ''}`);
    for (const flag of ['<X.Y.Z>', '--stdout', '--help']) {
      assert.ok(stdout.includes(flag), `--help did not name ${flag}:\n${stdout}`);
    }
    assert.deepStrictEqual(fs.readdirSync(empty), [], '--help wrote into the directory it ran in');
    assert.ok(!fs.existsSync(path.join(holder, 'skills')), '--help created a skills/ tree beside the script');
  } finally {
    fs.rmSync(holder, { recursive: true, force: true });
    fs.rmSync(empty, { recursive: true, force: true });
  }
});

// ---- cases: setup-labels.mjs ------------------------------------------------
// setup-labels.mjs (WS-71-hlbmjf) never touches the network in these cases: a
// stub gh executable is written into a temp fixture's bin/ and put first on
// PATH for the child process only. The stub answers --version, auth status,
// repo view and label list from a state file the case writes into the
// fixture, and logs EVERY invocation it receives, including the four it
// answers, to a log file the case then asserts on. Logging only the calls it
// does not answer would make a "no label list in the log" assertion pass
// whether or not the refusal under test actually fired.

const SETUP_LABELS = path.resolve(HERE, '..', '..', '..', '..', '.github', 'scripts', 'setup-labels.mjs');

// The stub is CommonJS, not ESM: it is invoked directly by its shebang as a
// file named exactly "gh" (spawnSync('gh', ...) resolves it off PATH by
// name), and with no package.json anywhere above it, node treats an
// extensionless script as CommonJS by default.
const GH_STUB = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = process.env.GH_STUB_DIR;
const args = process.argv.slice(2);
fs.appendFileSync(path.join(dir, 'gh-log.txt'), JSON.stringify(args) + '\\n');

const state = JSON.parse(fs.readFileSync(path.join(dir, 'gh-state.json'), 'utf8'));

if (args[0] === '--version') {
  process.stdout.write('gh version 2.98.0 (stub)\\n');
  process.exit(0);
}
if (args[0] === 'auth' && args[1] === 'status') {
  if (state.authStatus !== 0) {
    process.stderr.write('You are not logged into any GitHub hosts.\\n');
    process.exit(state.authStatus);
  }
  process.stdout.write('github.com\\n  \\u2713 Logged in\\n');
  process.exit(0);
}
if (args[0] === 'repo' && args[1] === 'view') {
  if (state.repoView.status !== 0) {
    process.stderr.write('none of the git remotes configured for this repository point to a known GitHub host\\n');
    process.exit(state.repoView.status);
  }
  process.stdout.write(JSON.stringify({ nameWithOwner: state.repoView.nameWithOwner || 'owner/repo', url: state.repoView.url }) + '\\n');
  process.exit(0);
}
if (args[0] === 'label' && args[1] === 'list') {
  process.stdout.write(JSON.stringify(state.labels) + '\\n');
  process.exit(0);
}
if (args[0] === 'label' && args[1] === 'create') {
  process.exit(0);
}
if (args[0] === 'label' && args[1] === 'delete') {
  process.exit(0);
}
process.stderr.write('gh-stub: unhandled invocation ' + JSON.stringify(args) + '\\n');
process.exit(1);
`;

// GitHub's nine seeded defaults, each with GitHub's own colour and
// description. bug and enhancement match LABELS' colour but differ in
// description, so they land as updates rather than creates or unchanged.
const GITHUB_DEFAULT_LABELS = [
  { name: 'bug', color: 'd73a4a', description: "Something isn't working" },
  { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' },
  { name: 'duplicate', color: 'cfd3d7', description: 'This issue or pull request already exists' },
  { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
  { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
  { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
  { name: 'invalid', color: 'e4e669', description: "This doesn't seem right" },
  { name: 'question', color: 'd876e3', description: 'Further information is requested' },
  { name: 'wontfix', color: 'ffffff', description: 'This will not be worked on' },
];

// Builds a fixture holding bin/gh (mode 0o755, stub above), writes the given
// state to gh-state.json, and hands the directory to fn. withFixture's
// finally block removes the tree afterwards, including when fn throws.
function withLabelFixture(state, fn) {
  return withFixture({}, (dir) => {
    const binDir = path.join(dir, 'bin');
    fs.mkdirSync(binDir, { recursive: true });
    const ghPath = path.join(binDir, 'gh');
    fs.writeFileSync(ghPath, GH_STUB);
    fs.chmodSync(ghPath, 0o755);
    fs.writeFileSync(path.join(dir, 'gh-log.txt'), '');
    setLabelState(dir, state);
    return fn(dir, binDir);
  });
}

function setLabelState(dir, state) {
  fs.writeFileSync(path.join(dir, 'gh-state.json'), JSON.stringify(state));
}

function readLabelLog(dir) {
  const text = fs.readFileSync(path.join(dir, 'gh-log.txt'), 'utf8');
  return text.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

// Runs the real setup-labels.mjs with the stub's bin/ prepended to PATH for
// this child process only: process.env.PATH itself is never mutated, or
// every later case would inherit the stub.
function runSetupLabels(dir, binDir, extraArgs = []) {
  const res = spawnSync(process.execPath, [SETUP_LABELS, ...extraArgs], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, PATH: binDir + path.delimiter + process.env.PATH, GH_STUB_DIR: dir },
  });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

const AUTHENTICATED_REPO_STATE = {
  authStatus: 0,
  repoView: { status: 0, nameWithOwner: 'FlowChargeApp/flowcharge-core', url: 'https://github.com/FlowChargeApp/flowcharge-core' },
  labels: GITHUB_DEFAULT_LABELS,
};

testCase('setup-labels: dry run prints 4 creates, 2 updates, 7 deletes and writes nothing', () => {
  withLabelFixture(AUTHENTICATED_REPO_STATE, (dir, binDir) => {
    const { status, stdout } = runSetupLabels(dir, binDir);
    assert.strictEqual(status, 0, `dry run exited ${status}: ${stdout}`);
    assert.match(stdout, /4 create, 2 update, 7 delete/, 'dry-run summary did not report 4 creates, 2 updates, 7 deletes');
    const log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'label' && a[1] === 'list').length, 1, 'expected exactly one label list call');
    assert.strictEqual(log.filter((a) => a[0] === 'label' && a[1] === 'create').length, 0, 'dry run must issue no label create');
    assert.strictEqual(log.filter((a) => a[0] === 'label' && a[1] === 'delete').length, 0, 'dry run must issue no label delete');
  });
});

testCase('setup-labels: --apply issues 6 creates then 7 deletes, none deleting bug or enhancement', () => {
  withLabelFixture(AUTHENTICATED_REPO_STATE, (dir, binDir) => {
    const { status } = runSetupLabels(dir, binDir, ['--apply']);
    assert.strictEqual(status, 0, 'apply did not exit 0');
    const log = readLabelLog(dir);
    const creates = log.filter((a) => a[0] === 'label' && a[1] === 'create');
    const deletes = log.filter((a) => a[0] === 'label' && a[1] === 'delete');
    assert.strictEqual(creates.length, 6, `expected 6 label create calls (4 creates + 2 updates), got ${creates.length}`);
    assert.ok(creates.every((a) => a.includes('--force')), 'every label create must carry --force');
    assert.strictEqual(deletes.length, 7, `expected 7 label delete calls, got ${deletes.length}`);
    assert.ok(deletes.every((a) => a.includes('--yes')), 'every label delete must carry --yes');
    assert.ok(!deletes.some((a) => a[2] === 'bug' || a[2] === 'enhancement'), 'bug or enhancement was deleted instead of updated');
    const lastCreateIdx = log.map((a, i) => (a[0] === 'label' && a[1] === 'create' ? i : -1)).filter((i) => i >= 0).pop();
    const firstDeleteIdx = log.map((a, i) => (a[0] === 'label' && a[1] === 'delete' ? i : -1)).filter((i) => i >= 0).shift();
    assert.ok(lastCreateIdx < firstDeleteIdx, 'a delete was issued before every create had run');
  });
});

testCase('setup-labels: --apply against an already-matching repository issues no call, case-insensitively', () => {
  const matching = {
    authStatus: 0,
    repoView: AUTHENTICATED_REPO_STATE.repoView,
    labels: LABELS,
  };
  withLabelFixture(matching, (dir, binDir) => {
    const first = runSetupLabels(dir, binDir, ['--apply']);
    assert.strictEqual(first.status, 0, 'first apply did not exit 0');
    let log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'label' && (a[1] === 'create' || a[1] === 'delete')).length, 0, 'an already-matching repository must get no mutating call');

    fs.writeFileSync(path.join(dir, 'gh-log.txt'), '');
    const recased = LABELS.map((l) => (l.name === 'bug' ? { ...l, name: 'Bug' } : l.name === 'format-change' ? { ...l, name: 'Format-Change' } : l));
    setLabelState(dir, { authStatus: 0, repoView: AUTHENTICATED_REPO_STATE.repoView, labels: recased });
    const second = runSetupLabels(dir, binDir, ['--apply']);
    assert.strictEqual(second.status, 0, 'second apply did not exit 0');
    log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'label' && (a[1] === 'create' || a[1] === 'delete')).length, 0, 'a differently-cased but matching repository must still get no mutating call: names compare case-insensitively');
  });
});

testCase('setup-labels: refuses a repository whose host gh cannot resolve, or that is not github.com', () => {
  withLabelFixture({ authStatus: 0, repoView: { status: 1 }, labels: [] }, (dir, binDir) => {
    const { status } = runSetupLabels(dir, binDir);
    assert.strictEqual(status, 1, 'a failing gh repo view must refuse');
    const log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'label' && a[1] === 'list').length, 0, 'no label list may run after a failing repo view');
    assert.strictEqual(log.filter((a) => a[0] === 'label').length, 0, 'no mutating label call may run after a failing repo view');
  });
  withLabelFixture({ authStatus: 0, repoView: { status: 0, nameWithOwner: 'owner/repo', url: 'https://github.example.com/owner/repo' }, labels: [] }, (dir, binDir) => {
    const { status } = runSetupLabels(dir, binDir);
    assert.strictEqual(status, 1, 'a non-github.com host must refuse');
    const log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'label' && a[1] === 'list').length, 0, 'no label list may run after a non-github.com host refusal');
  });
});

testCase('setup-labels: refuses when gh reports no authenticated host, and prints the fix', () => {
  withLabelFixture({ authStatus: 1, repoView: AUTHENTICATED_REPO_STATE.repoView, labels: [] }, (dir, binDir) => {
    const { status, stderr } = runSetupLabels(dir, binDir);
    assert.strictEqual(status, 1, 'an unauthenticated gh must refuse');
    assert.match(stderr, /gh auth login/, 'the refusal must print the gh auth login fix');
    const log = readLabelLog(dir);
    assert.strictEqual(log.filter((a) => a[0] === 'repo' && a[1] === 'view').length, 0, 'no repo view may run after an auth refusal');
    assert.strictEqual(log.filter((a) => a[0] === 'label').length, 0, 'no label call may run after an auth refusal');
    assert.ok(log.some((a) => a[0] === '--version'), '--version should still have been checked before the auth refusal');
    assert.ok(log.some((a) => a[0] === 'auth' && a[1] === 'status'), 'auth status should have been checked');
  });
});

testCase('setup-labels: the table holds exactly six entries, the six required names, capped descriptions, no priority label', () => {
  withLabelFixture(AUTHENTICATED_REPO_STATE, (dir, binDir) => {
    const script = `import { LABELS } from ${JSON.stringify(SETUP_LABELS)}; process.stdout.write(JSON.stringify(LABELS));`;
    const res = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, PATH: binDir + path.delimiter + process.env.PATH, GH_STUB_DIR: dir },
    });
    assert.strictEqual(res.status, 0, `importing setup-labels.mjs failed: ${res.stderr}`);
    const table = JSON.parse(res.stdout);
    assert.strictEqual(table.length, 6, 'the table must hold exactly six entries');
    const names = table.map((l) => l.name).sort();
    assert.deepStrictEqual(names, ['accepted', 'bug', 'declined', 'enhancement', 'format-change', 'needs-info'], 'the table names must be exactly the six required names');
    for (const l of table) {
      assert.ok(l.description.length <= 100, `${l.name}'s description exceeds 100 characters`);
      assert.ok(!/^(p[0-9]|priority)/i.test(l.name), `${l.name} looks like a priority label, which the design deliberately excludes`);
    }
    const log = readLabelLog(dir);
    assert.strictEqual(log.length, 0, 'importing the module must make no gh call');
  });
});

// ---- cases: skill-file docs consistency (skills/**/*.md) -------------------
// Every case above builds a temp tree. Every case below reads the repository's
// own skills/ tree instead, and greps its Markdown prose for the shapes listed
// below, each one something a migration or a naming decision can leave behind
// in documentation.
//
// Rule A: a workstream folder path written as workstreams/ plus a bare slug,
// with no WS id in front of it.
// Rule B: a workstream ID placeholder written as a bare WS-N, with no -SUFFIX.
// Rule C: a plan, issue list or task list filename written bare, with no
// artefact id in front of it.
// Rule E: the literal word gate, in any file, naming the interrupt mechanism
// the `prompts:` key governs instead of the prompt vocabulary.
// Rule F: the literal open_questions, the retired agents.md key, anywhere in
// the scanned files. Nothing documents the key any more, so no site is allowed.
// Rule G: a path written in the prose that does not resolve on disk.
// Rule H: an open-question-capable prompt template missing the verbatim block
// that fixes the shape an open question comes back in.
//
// The scan covers skills/**/*.md only. It does not read .mjs sources, the root
// README.md, or flowcharge/.

const SKILLS_ROOT = path.resolve(HERE, '..', '..', '..');

// Collects every .md file under skills/, recursively. Symlinks are skipped, so
// a link out of the tree cannot pull an unrelated file into the scan.
function skillMarkdownFiles(root = SKILLS_ROOT) {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) found.push(full);
    }
  };
  walk(root);
  return found;
}

// Reads the tree into the {file, text} sources the matchers consume. `file` is
// relative to skills/, which is also the shape an allowlist entry names.
function skillMarkdownSources() {
  return skillMarkdownFiles().map((full) => ({
    file: path.relative(SKILLS_ROOT, full),
    text: fs.readFileSync(full, 'utf8'),
  }));
}

// Rule A, wrong folder composition. The three wrong dialects are enumerated
// literally rather than tested against a correct prefix: the correct prefix has
// five live spellings, and a positive test would have to track all of them.
const RULE_A_FORMS = ['workstreams/{slug}', 'workstreams/<slug>', 'workstreams/{{slug}}'];

function ruleAMatches(line) {
  const out = [];
  for (const form of RULE_A_FORMS) {
    let at = line.indexOf(form);
    while (at !== -1) {
      out.push(form);
      at = line.indexOf(form, at + form.length);
    }
  }
  return out;
}

// Rule B, bare workstream ID. The lookbehind and lookahead guards keep a real
// id such as WS-12-a3x9k2 and a longer word such as WS-Number out of the
// results; the correct placeholder WS-N-SUFFIX matches and is then discarded.
function ruleBMatches(line) {
  const out = [];
  for (const m of line.matchAll(/(?<![\w-])WS-N(?:-SUFFIX)?(?![\w-])/g)) {
    if (m[0] !== 'WS-N-SUFFIX') out.push(m[0]);
  }
  return out;
}

// Rule C, bare artefact filename. The (?<![\w-]) guard is what does the work: a
// correctly prefixed name puts a hyphen directly before the name, so
// PLN-38-u1bo14-plan.md, <IL-id>-issuelist.md and the glob
// IL-*-issuelist*.md all pass, while a bare plan.md after a slash or a space
// fails. The slot name
// {plan} never matches, because the rule requires .md. workstream.md is
// absent from the alternation and is never flagged: its folder already carries
// the workstream ID, so it keeps its plain name by design.
function ruleCMatches(line) {
  const out = [];
  for (const m of line.matchAll(/(?<![\w-])(?:plan|issuelist|tasklist)(?:-[a-z0-9-]+)?\.md/g)) {
    out.push(m[0]);
  }
  return out;
}

// Rule D, bare product name. This suite calls itself FlowCharge Core, and the
// bare name FlowCharge now denotes the sibling application, so a capitalised
// FlowCharge that is not immediately followed by ` Core` is flagged. The
// (?<![\w-]) lookbehind and the (?![\w-]) guard are the pair rules B and C
// already use: together they keep a lowercase flowcharge/ path, an fc- name and
// a hyphenated token such as FlowCharge-managed out of the results. The
// negative lookahead on ` Core` rather than a capture comparison is what lets
// FlowCharge Core's own edits pass.
//
// The matched text is the word plus the word that follows it on the same line,
// and the bare word where none follows. That is load-bearing, not cosmetic: an
// allowlist entry keys on file plus matched text, so a bare `FlowCharge` as the
// match text would allowlist every occurrence in the whole file rather than the
// one site that earns the exception. Only the following word's word characters
// are taken, so a possessive or a trailing mark stays out of the key and the
// key text reads as the two plain words.
function ruleDMatches(line) {
  const out = [];
  for (const m of line.matchAll(/(?<![\w-])FlowCharge(?![\w-])(?! Core)(?:\s+(\w+))?/g)) {
    out.push(m[1] ? `FlowCharge ${m[1]}` : 'FlowCharge');
  }
  return out;
}

// Rule E, the mechanism word. This suite calls the thing that stops the user a
// prompt, and the `prompts:` key in flowcharge/agents.md governs it, so the word
// gate must never name that mechanism again. The word survives in this tree in
// several unrelated senses (a pre-commit safety gate, a baseline gate, a
// candidate filter, a `#gates+` tag token), so every live occurrence is
// allowlisted with the sense it carries, and only a new one fails. The
// (?<![\w-]) and (?![\w-]) guards are the pair rules B, C and D use:
// together they keep investigate, delegated, navigate and mitigate out of the
// results.
//
// The matched text follows rule D's precedent: the gate word plus the word that
// follows it on the same line, and the bare word where none follows. The key is
// not the bare word alone because an allowlist entry keys on file plus matched
// text, so a bare `gate` would allowlist every occurrence in the whole file
// rather than the sites that earn the exception.
function ruleEMatches(line) {
  const out = [];
  for (const m of line.matchAll(/(?<![\w-])([Gg]ate(?:s|d|ways|way)?)(?![\w-])(?:\s+(\w+))?/g)) {
    out.push(m[2] ? `${m[1]} ${m[2]}` : m[1]);
  }
  return out;
}

// Rule F, the retired key. `open_questions:` in flowcharge/agents.md was folded
// into `prompts:`, and nothing documents it any more, so the literal must not
// appear at all. Any occurrence is a live setting the reader will try to use.
// The allowlist grants this rule no exception.
//
// The matched text is the bare literal, as rules A and C return theirs. Rule D's
// following-word key is deliberately not used here: the rule admits no site, so
// a per-site key would have nothing to key on.
function ruleFMatches(line) {
  const out = [];
  let at = line.indexOf('open_questions');
  while (at !== -1) {
    out.push('open_questions');
    at = line.indexOf('open_questions', at + 'open_questions'.length);
  }
  return out;
}

// The allowlist. Each entry is { file, text, why }, where `file` is a path
// relative to skills/ and `text` is the exact matched text. `why` is required
// prose for the next reader; the check never interprets it.
//
// Two mechanism decisions, recorded here because both are easy to reverse by
// accident:
//   1. An entry matches on file plus matched text, never on a line number. A
//      line number goes stale the moment a paragraph is inserted above it.
//   2. An entry that matches no live occurrence is itself a failure, so a stale
//      exception cannot silently grant permission for text that no longer
//      exists. The case below pins that rule.
//
const DOCS_ALLOWLIST = [
  {
    file: 'flowcharge/CONVENTIONS.md',
    text: 'plan.md',
    why:
      'Rule C. The legacy-form paragraph explains that the generator still indexes ' +
      'an artefact carrying the old bare name and WARNs about it. The sentence has ' +
      'to show one bare name to name the form it describes.',
  },
  {
    file: 'flowcharge/SKILL.md',
    text: 'plan-and-tasks.md',
    why:
      'Rule C. This is a prompt template under templates/, not an artefact a ' +
      'workstream folder holds, so it carries no id prefix and never will. The ' +
      'name only matches because it starts with the word plan and follows a ' +
      'slash, which clears rule C\'s (?<![\\w-]) guard. The Operations table and ' +
      'the prompt policy have to write the path in full, because rule G resolves ' +
      'every templates/*.md short form in this file against disk.',
  },
  {
    file: 'flowcharge/CONVENTIONS.md',
    text: 'FlowCharge ID',
    why:
      'Rule D. The line mirrors REGISTRY_HEADER in fc-index.mjs, and the keep-list ' +
      'holds that literal because it names the shared on-disk format rather than ' +
      'this product. Renaming the header here would make the mirror disagree with ' +
      'what the generator writes, and would rewrite the registry header in every ' +
      'tree that already has one.',
  },
  {
    file: 'flowcharge/CONVENTIONS.md',
    text: 'FlowCharge application',
    why:
      'Rule D. The bare name here is correct: it denotes the sibling FlowCharge ' +
      'application and its repository, not this suite, so it must not gain the ' +
      'Core qualifier.',
  },
  {
    file: 'fc-task-list/SKILL.md',
    text: 'FlowCharge Tasks',
    why:
      'Rule D. The heading sits inside the fenced block that shows the on-disk ' +
      'shape of a generated task list, so it is an artefact literal in the same ' +
      'class as REGISTRY_HEADER in fc-index.mjs. The bare name names the shared ' +
      'on-disk format rather than this product, and adding the Core qualifier ' +
      'here would disagree with every task list already written to disk.',
  },
  {
    file: 'fc-issue-list/SKILL.md',
    text: 'FlowCharge Issue',
    why:
      'Rule D. The heading sits inside the fenced block that shows the on-disk ' +
      'shape of a generated issue list, so it is an artefact literal in the same ' +
      'class as REGISTRY_HEADER in fc-index.mjs. The bare name names the shared ' +
      'on-disk format rather than this product. The matched text is the two ' +
      'words Rule D produces, so the key stops at Issue and omits List.',
  },
  {
    file: 'flowcharge/SKILL.md',
    text: 'FlowCharge',
    why:
      'Rule D. Line 8 is this entry skill\'s own H1, the document heading every ' +
      'sibling skill carries for itself, naming the FlowCharge Core suite this ' +
      'skill belongs to.',
  },
  {
    file: 'fc-git/SKILL.md',
    text: 'gate',
    why:
      'Rule E. The pre-commit safety gate, which refuses a staged diff carrying ' +
      'secrets. It is a refusal in the skill itself, not a prompt to the user.',
  },
  {
    file: 'fc-git/SKILL.md',
    text: 'gate is',
    why:
      'Rule E. The same pre-commit safety gate, in the sentence recording that ' +
      'it is not skippable.',
  },
  {
    file: 'flowcharge/CONVENTIONS.md',
    text: 'gate',
    why:
      'Rule E. The "never a gate" remark about workstream status: the remark ' +
      'exists to deny that status blocks work, so the word is used to rule the ' +
      'sense out, not to name a mechanism.',
  },
  {
    file: 'flowcharge/templates/validate.md',
    text: 'gate',
    why:
      "Rule E. The template tells the validator to apply fc-validate's baseline " +
      'gate, which is the precondition for running verify steps, not a prompt.',
  },
  {
    file: 'fc-task-list/SKILL.md',
    text: 'gated on',
    why:
      'Rule E. "gated on" describes what depends_on does to execution order. It ' +
      'is a dependency constraint, not a stop that asks the user anything.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate and',
    why:
      "Rule E. The baseline gate, the precondition fc-validate applies before it " +
      'runs any command. Named alongside the runnable command class.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate',
    why:
      'Rule E. The "The baseline gate" heading, and the third correction class ' +
      'that is gated rather than exempt. Both are preconditions inside the ' +
      'skill, not the interrupt mechanism.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate is',
    why: 'Rule E. The baseline gate, in the sentence saying what it is never keyed on.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate would',
    why: 'Rule E. The baseline gate, in the sentence rejecting a clean-tree gate.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate fails',
    why: 'Rule E. The baseline gate, in the sentence saying what happens when it fails.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gate a',
    why:
      'Rule E. "to gate a change to project code": the executor sense of the ' +
      'verb, describing what a project test does.',
  },
  {
    file: 'fc-validate/SKILL.md',
    text: 'gated rather',
    why:
      'Rule E. The third correction class is gated rather than exempt. It names ' +
      "the class's own admission rules, not a user prompt.",
  },
];

// Runs one matcher over one set of sources. Every occurrence carries the file,
// the 1-based line number and the matched text, so a failure message can name
// all three and a reader can find the text without opening the rule.
function collectOccurrences(matcher, sources) {
  const out = [];
  for (const src of sources) {
    const lines = src.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const text of matcher(lines[i])) out.push({ file: src.file, line: i + 1, text });
    }
  }
  return out;
}

function unallowedOccurrences(occurrences, allowlist) {
  return occurrences.filter((o) => !allowlist.some((e) => e.file === o.file && e.text === o.text));
}

function describeOccurrences(occurrences) {
  return occurrences.map((o) => `  skills/${o.file}:${o.line}: ${o.text}`).join('\n');
}

// Rule G, cross-references resolve. Two path forms are written in this tree's
// prose, and both are checked against the disk:
//
//   form 1  a templates/<name>.md reference in flowcharge/SKILL.md, which the
//           Operations table and the hard rules use as a short form. It resolves
//           under skills/flowcharge/templates/.
//   form 2  a skills/-rooted path in any skills/**/*.md. It resolves from the
//           repository root, the directory above skills/.
//
// The <skills-dir>/ placeholder form is deliberately excluded: it is a slot the
// reader fills in, not a path, and it never resolves anywhere. Both guards do
// that for free: form 1 refuses a preceding slash, so <skills-dir>/…/templates/x
// is not read as a short form, and form 2's literal `skills/` never appears in
// `<skills-dir>/`.
//
// Unlike rules A to F this rule is per file, not per line, and it produces no
// occurrence record for a DOCS_ALLOWLIST entry to key on. That is why it calls
// neither collectOccurrences nor unallowedOccurrences, and why it adds no
// allowlist entries: a path either resolves or it does not, and a dangling path
// is never something to grant an exception for.
const REPO_ROOT = path.resolve(SKILLS_ROOT, '..');
const RULE_G_PROMPT_SHORT_FORM_FILE = 'flowcharge/SKILL.md';

function ruleGDanglingPaths(sources) {
  const out = [];
  for (const src of sources) {
    const lines = src.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const seen = [];
      if (src.file === RULE_G_PROMPT_SHORT_FORM_FILE) {
        for (const m of lines[i].matchAll(/(?<![\w/-])templates\/[A-Za-z0-9._-]+\.md/g)) {
          seen.push([m[0], path.join(SKILLS_ROOT, 'flowcharge', m[0])]);
        }
      }
      for (const m of lines[i].matchAll(/(?<![\w-])skills\/[A-Za-z0-9._/-]*[A-Za-z0-9._-]/g)) {
        seen.push([m[0], path.join(REPO_ROOT, m[0])]);
      }
      for (const [written, resolved] of seen) {
        if (!fs.existsSync(resolved)) out.push({ file: src.file, line: i + 1, written, resolved });
      }
    }
  }
  return out;
}

function describeDanglingPaths(dangling) {
  return dangling
    .map((d) => `  skills/${d.file}:${d.line}: "${d.written}" does not exist at ${d.resolved}`)
    .join('\n');
}

// Rule H, the verbatim block. Two stages can come back with an open question,
// and the prompt policy can only settle one that arrives in a fixed shape: a
// question field, a recommendation field, and the sentinel a stage writes
// when it cannot recommend anything. The block therefore lives in exactly two
// canonical copies, one per reader that needs it in context: the plan-and-tasks
// stage file, which loads no skill that carries it, and fc-validate's
// SKILL.md, which the validate template points at for its return shape. This
// rule pins both copies at once.
//
// The issues-and-tasks template is deliberately absent. It never returns an
// open question (a template that cannot author a task for an issue returns
// that issue as skipped instead), so the block would say nothing there.
//
// RULE_H_BLOCK is the block as it stands in plan-and-tasks.md, the master copy, with
// its whitespace already collapsed. Each file's text is collapsed the same way
// before the containment check, exactly as the hard-rule-10 prose pin below does
// it, so a re-wrap in one copy does not fail the rule spuriously.
//
// Like rule G this rule is per file, so it calls neither collectOccurrences nor
// unallowedOccurrences and it adds no DOCS_ALLOWLIST entries.
const RULE_H_TEMPLATES = [
  'flowcharge/templates/plan-and-tasks.md',
  'fc-validate/SKILL.md',
];

const RULE_H_BLOCK =
  '**Open questions, the return shape** '
  + 'Return every open question in this shape, and no other: '
  + '- **Question:** the question in one sentence that reads cold to somebody who was '
  + 'not here. '
  + '- **Recommendation:** the option you would take, and a one-line reason for it. '
  + 'Where you cannot recommend one, write `No recommendation possible` in this field, '
  + 'followed by the reason you cannot. A question carrying that sentinel never settles '
  + 'at any tier.';

function ruleHTemplatesMissingBlock(sources, templates = RULE_H_TEMPLATES) {
  const byFile = new Map(sources.map((s) => [s.file, s.text]));
  const out = [];
  for (const file of templates) {
    const text = byFile.get(file);
    if (text === undefined) out.push({ file, reason: 'the template was not found in the tree' });
    else if (!text.replace(/\s+/g, ' ').includes(RULE_H_BLOCK)) {
      out.push({ file, reason: 'the open-question return block is missing or has been reworded' });
    }
  }
  return out;
}

testCase('skills/**/*.md: no unallowed workstreams/ path written without its WS id', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleAMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule A: a workstream folder is written with no WS id in front of the slug:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: no unallowed bare WS-N workstream ID', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleBMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule B: a workstream ID is written bare, with no -SUFFIX:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: no unallowed bare artefact filename', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleCMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule C: an artefact filename is written bare, with no id prefix in front of it:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: no unallowed bare FlowCharge product name', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleDMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule D: the product name is written bare, with no Core after it:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: no unallowed gate word naming the interrupt mechanism', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleEMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule E: a gate word is written with no allowlist entry recording its sense. This suite calls the thing that stops the user a prompt:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: no open_questions at all, the retired agents.md key', () => {
  const found = unallowedOccurrences(
    collectOccurrences(ruleFMatches, skillMarkdownSources()),
    DOCS_ALLOWLIST,
  );
  assert.deepStrictEqual(
    found,
    [],
    `Rule F: the retired open_questions key is written in a file the docs scan covers. Nothing documents the key any more, so it must not appear at all:\n${describeOccurrences(found)}`,
  );
});

testCase('skills/**/*.md: every path written in the prose resolves on disk', () => {
  // In-memory samples first. The live tree passes today, so without this half
  // the case could silently stop discriminating and still report ok.
  const missing = ruleGDanglingPaths([
    { file: 'sample/SKILL.md', text: 'see skills/flowcharge/templates/does-not-exist.md' },
  ]);
  assert.deepStrictEqual(
    missing.map((d) => d.written),
    ['skills/flowcharge/templates/does-not-exist.md'],
    'Rule G did not flag a sample path that does not exist',
  );
  const present = ruleGDanglingPaths([
    { file: 'sample/SKILL.md', text: 'see skills/flowcharge/CONVENTIONS.md' },
    { file: RULE_G_PROMPT_SHORT_FORM_FILE, text: 'run templates/plan-and-tasks.md' },
    { file: 'sample/SKILL.md', text: 'the slot <skills-dir>/flowcharge/templates/plan-and-tasks.md' },
  ]);
  assert.deepStrictEqual(present, [], 'Rule G flagged a path that does resolve, or read the placeholder form as a path');

  const dangling = ruleGDanglingPaths(skillMarkdownSources());
  assert.deepStrictEqual(
    dangling,
    [],
    `Rule G: a path written in the prose does not resolve on disk:\n${describeDanglingPaths(dangling)}`,
  );
});

testCase('both canonical copies of the open-question return block are verbatim', () => {
  // In-memory samples first, for the same reason rule G checks them: the live
  // tree passes today, so the discriminating half has to be pinned separately.
  const sampleMissing = ruleHTemplatesMissingBlock(
    [{ file: 'sample/one.md', text: '## Return\n\n- the plan\n' }],
    ['sample/one.md'],
  );
  assert.deepStrictEqual(
    sampleMissing.map((m) => m.file),
    ['sample/one.md'],
    'Rule H did not flag a sample template missing the block',
  );
  const samplePresent = ruleHTemplatesMissingBlock(
    [{ file: 'sample/two.md', text: `## Return\n\n${RULE_H_BLOCK}\n` }],
    ['sample/two.md'],
  );
  assert.deepStrictEqual(samplePresent, [], 'Rule H flagged a sample template that carries the block');

  const missing = ruleHTemplatesMissingBlock(skillMarkdownSources());
  assert.deepStrictEqual(
    missing,
    [],
    `Rule H: a canonical copy no longer carries the fixed open-question return block:\n${missing.map((m) => `  skills/${m.file}: ${m.reason}`).join('\n')}`,
  );
});

// ---- cases: single-copy and pointer-resolution pins ------------------------
// Consolidation moved each shared rule into one canonical file and left a
// pointer behind everywhere else. Nothing runs the prose, so two static checks
// stand in for the discipline: a phrase that identifies a canonical rule may
// appear only in the files listed for it, so a copy pasted back somewhere else
// fails; and every `(CONVENTIONS.md, <Section>)` pointer must name a section
// that exists, as a `## ` heading or a `**<Section>.**` lead, so a renamed or
// deleted section fails every pointer that still names it.
//
// A phrase's file list is the complete set of files allowed to carry it; an
// empty list means the phrase must appear nowhere, which pins a deletion. The
// pointer regex admits only a plain section name, so the older
// `(CONVENTIONS.md, IDs: Registry)` and `(CONVENTIONS.md, \`workstream\` body)`
// forms stay out of its reach and are not checked.
const SINGLE_COPY_PHRASES = [
  // The orchestrator reads the target project itself now that every stage runs
  // in its session, so the rule that forbade opening a context doc is pinned
  // deleted.
  { phrase: 'never open one to describe it', files: [] },
  { phrase: "the authoring stage's own report, its rationale", files: ['flowcharge/SKILL.md'] },
  { phrase: 'Measure before you write', files: ['fc-task-list/SKILL.md'] },
  { phrase: 'Never add a test-suite or build command', files: ['fc-task-list/SKILL.md'] },
  { phrase: 'prints exactly one line and writes nothing', files: ['flowcharge/CONVENTIONS.md'] },
  { phrase: 'local attribution, not a verified identity', files: ['flowcharge/CONVENTIONS.md'] },
  { phrase: 'trailing `+`', files: ['flowcharge/CONVENTIONS.md'] },
  { phrase: 'Archive by moving the ENTIRE folder', files: ['flowcharge/CONVENTIONS.md'] },
  { phrase: 'refuses a taken slug', files: ['flowcharge/CONVENTIONS.md'] },
  { phrase: "sed -E 's/^WS-", files: [] },
  { phrase: 'this project\'s own structural or reference documentation', files: ['flowcharge/SKILL.md'] },
];

const POINTER_TARGET_FILE = 'flowcharge/CONVENTIONS.md';
const POINTER_RE = /\(CONVENTIONS\.md, ([A-Za-z][A-Za-z ]*[A-Za-z])\)/g;

// Whitespace is collapsed on both sides before the containment test, as rule H
// does it, because a phrase wraps across source lines in the prose.
function singleCopyViolations(sources, phrases = SINGLE_COPY_PHRASES) {
  const norm = (s) => s.replace(/\s+/g, ' ');
  const out = [];
  for (const { phrase, files } of phrases) {
    const p = norm(phrase);
    for (const src of sources) {
      if (norm(src.text).includes(p) && !files.includes(src.file)) {
        out.push({ file: src.file, phrase });
      }
    }
    for (const file of files) {
      const src = sources.find((s) => s.file === file);
      if (!src || !norm(src.text).includes(p)) out.push({ file, phrase, missing: true });
    }
  }
  return out;
}

function sectionExists(text, name) {
  return text.includes(`\n## ${name}\n`) || text.includes(`**${name}.**`) || text.includes(`**${name}**`);
}

function unresolvedPointers(sources, targetFile = POINTER_TARGET_FILE) {
  const target = sources.find((s) => s.file === targetFile);
  const out = [];
  for (const src of sources) {
    const lines = src.text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const m of lines[i].matchAll(POINTER_RE)) {
        if (!target || !sectionExists(target.text, m[1])) out.push({ file: src.file, line: i + 1, section: m[1] });
      }
    }
  }
  return out;
}

testCase('every consolidated rule lives only in its canonical file', () => {
  const sample = singleCopyViolations(
    [
      { file: 'a.md', text: 'Measure before you write.' },
      { file: 'b.md', text: 'Measure before you write.' },
    ],
    [{ phrase: 'Measure before you write', files: ['a.md'] }],
  );
  assert.deepStrictEqual(sample, [{ file: 'b.md', phrase: 'Measure before you write' }], 'the single-copy check did not flag a second copy');
  const found = singleCopyViolations(skillMarkdownSources());
  assert.deepStrictEqual(
    found,
    [],
    `a consolidated rule is duplicated outside its canonical file, or missing from it:\n${found.map((f) => `  skills/${f.file}: "${f.phrase}"${f.missing ? ' (missing)' : ''}`).join('\n')}`,
  );
});

testCase('every (CONVENTIONS.md, <Section>) pointer names a section that exists', () => {
  const sample = unresolvedPointers([
    { file: POINTER_TARGET_FILE, text: '\n## Archiving\n\n**Slugs.** text\n' },
    { file: 'x.md', text: 'see (CONVENTIONS.md, Archiving) and (CONVENTIONS.md, Slugs) and (CONVENTIONS.md, Nowhere)' },
  ]);
  assert.deepStrictEqual(sample.map((p) => p.section), ['Nowhere'], 'the pointer check did not resolve headings and bold leads correctly');
  const dangling = unresolvedPointers(skillMarkdownSources());
  assert.deepStrictEqual(
    dangling,
    [],
    `a pointer names a CONVENTIONS.md section that does not exist:\n${dangling.map((d) => `  skills/${d.file}:${d.line}: ${d.section}`).join('\n')}`,
  );
});

testCase('every docs-consistency allowlist entry matches a live occurrence', () => {
  const sources = skillMarkdownSources();
  const live = [
    ...collectOccurrences(ruleAMatches, sources),
    ...collectOccurrences(ruleBMatches, sources),
    ...collectOccurrences(ruleCMatches, sources),
    ...collectOccurrences(ruleDMatches, sources),
    ...collectOccurrences(ruleEMatches, sources),
    ...collectOccurrences(ruleFMatches, sources),
    // Rules G and H are absent on purpose. Neither produces an occurrence
    // record and neither carries an allowlist entry, so neither can go stale.
  ];
  const stale = DOCS_ALLOWLIST.filter(
    (e) => !live.some((o) => o.file === e.file && o.text === e.text),
  );
  assert.deepStrictEqual(
    stale,
    [],
    `allowlist entries that match nothing in the tree, so they grant permission for text that no longer exists:\n${stale.map((e) => `  skills/${e.file}: ${e.text}`).join('\n')}`,
  );
});

testCase('the consistency rules match the wrong forms and pass the correct ones', () => {
  // In-memory samples, not the real tree: this case pins the rules themselves.
  const wrong = [
    ['save it to flowcharge/workstreams/{slug}/plan.md', ruleAMatches, 'workstreams/{slug}'],
    ['save it to flowcharge/workstreams/<slug>/plan.md', ruleAMatches, 'workstreams/<slug>'],
    ['save it to flowcharge/workstreams/{{slug}}/plan.md', ruleAMatches, 'workstreams/{{slug}}'],
    ['restrict --list to one workstream with --ws WS-N', ruleBMatches, 'WS-N'],
    ['save the plan to {ws_dir}/plan.md', ruleCMatches, 'plan.md'],
    ['file the findings in {ws_dir}/issuelist.md', ruleCMatches, 'issuelist.md'],
    ['save the tasks to {ws_dir}/tasklist.md', ruleCMatches, 'tasklist.md'],
    ['the FlowCharge suite ships nine skills', ruleDMatches, 'FlowCharge suite'],
    ['the run stops at this gate until the user answers', ruleEMatches, 'gate until'],
    ['set open_questions to auto in flowcharge/agents.md', ruleFMatches, 'open_questions'],
  ];
  for (const [line, matcher, expected] of wrong) {
    assert.deepStrictEqual(matcher(line), [expected], `wrong form was not matched: ${line}`);
  }

  const correct = [
    'spell the placeholder WS-N-SUFFIX in prose',
    'the folder is <WS-N-SUFFIX>-<slug>',
    'the folder is {{WS-N-SUFFIX}}-{{slug}}',
    'the folder is {ws_id}-{slug}',
    'flowcharge/workstreams/WS-4-a3x9k2-scope-service-bug-fixes/PLN-4-a3x9k2-plan.md',
    'save the plan to {ws_dir}/<PLN-id>-plan.md',
    'file the findings in {ws_dir}/<IL-id>-issuelist.md',
    'extras go to <IL-id>-issuelist-second.md, the qualifier still a tail',
    'the existence test is the glob IL-*-issuelist*.md',
    'the workstream record keeps its plain name, workstream.md',
    'the slot name {plan} is a slot, not a filename',
    'the FlowCharge Core suite ships nine skills',
    "the status line lists FlowCharge Core's own edits",
    'investigate the finding before you file it',
    'the work is delegated to a subagent',
    'navigate to the workstream folder',
    'mitigate the risk the plan records',
    'set prompts to cruise in flowcharge/agents.md',
  ];
  for (const line of correct) {
    assert.deepStrictEqual(ruleAMatches(line), [], `Rule A matched a correct form: ${line}`);
    assert.deepStrictEqual(ruleBMatches(line), [], `Rule B matched a correct form: ${line}`);
    assert.deepStrictEqual(ruleCMatches(line), [], `Rule C matched a correct form: ${line}`);
    assert.deepStrictEqual(ruleDMatches(line), [], `Rule D matched a correct form: ${line}`);
    assert.deepStrictEqual(ruleEMatches(line), [], `Rule E matched a correct form: ${line}`);
    assert.deepStrictEqual(ruleFMatches(line), [], `Rule F matched a correct form: ${line}`);
  }
});

testCase('an allowlist entry suppresses its own file only, never the same text elsewhere', () => {
  const sources = [
    { file: 'sample-a/SKILL.md', text: 'see flowcharge/workstreams/{slug}/plan.md' },
    { file: 'sample-b/SKILL.md', text: 'see flowcharge/workstreams/{slug}/plan.md' },
  ];
  const allowlist = [
    { file: 'sample-a/SKILL.md', text: 'workstreams/{slug}', why: 'sample entry, this case only' },
  ];
  const found = unallowedOccurrences(collectOccurrences(ruleAMatches, sources), allowlist);
  assert.deepStrictEqual(
    found,
    [{ file: 'sample-b/SKILL.md', line: 1, text: 'workstreams/{slug}' }],
    'the allowlist suppressed the wrong file, or reported the wrong line or text',
  );
});

// ---- case: prompt-policy prose pin -----------------------------------------
// The prompt policy tells the orchestrator to relay an ambiguous recommendation
// unsettled, at every tier. That rule is what keeps `cruise` safe. The harness
// runs no agent, so a static prose check is the strongest available pin for
// that instruction.
//
// The slice is what makes the pin worth having. A containment check against the
// whole file would still pass if the rule were moved out of the policy section
// into unrelated prose, so the case cuts that section's own text first and
// searches only that. The empty-slice assertion is the other half: a slice
// pattern that stops matching would otherwise make the case pass on nothing.
//
// Both patterns key on text, never on a line number, and the slice's whitespace
// is normalised before the containment check, because the rule wraps across
// source lines in the file.

const POLICY_SECTION_OPEN = '## The prompt policy';
const POLICY_SECTION_END = '## The validation setting';
const NO_RECOMMENDATION_RULE =
  '**No recommendation, no settling.** A question or a flag that states no '
  + 'recommendation, states two that conflict, or makes one conditional on something '
  + 'the orchestrator cannot check, relays unsettled at every tier.';

testCase('the prompt policy still carries the no-recommendation rule', () => {
  const text = fs.readFileSync(path.join(SKILLS_ROOT, 'flowcharge', 'SKILL.md'), 'utf8');
  const from = text.indexOf(POLICY_SECTION_OPEN);
  const to = text.indexOf(POLICY_SECTION_END, from + 1);
  const slice = from === -1 || to === -1 ? '' : text.slice(from, to);
  assert.ok(
    slice.trim().length > 0,
    `the prompt policy ("${POLICY_SECTION_OPEN}") could not be sliced out of `
    + `flowcharge/SKILL.md: the case would otherwise pass on an empty slice`,
  );
  assert.ok(
    slice.replace(/\s+/g, ' ').includes(NO_RECOMMENDATION_RULE),
    `the prompt policy no longer carries the "No recommendation, no settling" rule, which `
    + `requires a question or a flag that states no recommendation, states two that `
    + `conflict, or makes one conditional on something the orchestrator cannot check, to `
    + `relay unsettled at every tier:\n  ${NO_RECOMMENDATION_RULE}`,
  );
});

// ---- case: correction-direction prose pin ----------------------------------
// A sequenced pass runs the first comparison to completion, applying its own
// corrections, before the second comparison reads the upstream artefact. That
// ordering is what stops a validator holding both artefacts from aligning the
// upstream one to the downstream one instead of finding the discrepancy. The
// harness runs no agent, so a static prose check is the strongest available
// pin for that instruction.
//
// The slice is what makes the pin worth having, exactly as it does for the
// prompt-policy pin above: a containment check against the whole file would
// still pass if the rule were moved out of `## 1. Inputs` into unrelated
// prose, so the case cuts that section's own text first and searches only
// that. The empty-slice assertion is the other half: a slice pattern that
// stops matching would otherwise make the case pass on nothing.
//
// Both patterns key on text, never on a line number, and the slice's
// whitespace is normalised before the containment check, because the rule
// wraps across source lines in the file.

const CORRECTION_DIRECTION_SECTION_OPEN = '## 1. Inputs';
const CORRECTION_DIRECTION_SECTION_END = '## 2. The three check classes';
const CORRECTION_DIRECTION_RULE =
  'The upstream artefact is never edited to agree with the downstream one.';

testCase('fc-validate still carries the correction-direction rule', () => {
  const text = fs.readFileSync(path.join(SKILLS_ROOT, 'fc-validate', 'SKILL.md'), 'utf8');
  const from = text.indexOf(CORRECTION_DIRECTION_SECTION_OPEN);
  const to = text.indexOf(CORRECTION_DIRECTION_SECTION_END, from + 1);
  const slice = from === -1 || to === -1 ? '' : text.slice(from, to);
  assert.ok(
    slice.trim().length > 0,
    `the inputs section ("${CORRECTION_DIRECTION_SECTION_OPEN}") could not be sliced out of `
    + `fc-validate/SKILL.md: the case would otherwise pass on an empty slice`,
  );
  assert.ok(
    slice.replace(/\s+/g, ' ').includes(CORRECTION_DIRECTION_RULE),
    `fc-validate/SKILL.md no longer carries the correction-direction rule, which requires `
    + `the upstream artefact to never be edited to agree with the downstream one:\n  `
    + `${CORRECTION_DIRECTION_RULE}`,
  );
});

// ---- cases: inline stage topology ------------------------------------------
// The orchestrator performs every stage itself, in the session it was loaded
// into, from the stage files under flowcharge/templates/. No stage is handed to
// a separate agent. The harness runs no agent, so these static checks pin the
// prose claims that design rests on: no skill file still describes a spawned
// stage, hard rule 8 reads as the inline rule, `default_agent` is kept but
// documented as unused, the four stage files stay separate and use only the
// slots the Operations table lists for them, no stage file carries a briefing
// block, and fc-validate carries the discipline an inline validation needs.

const FLOWCHARGE_SKILL = path.join(SKILLS_ROOT, 'flowcharge', 'SKILL.md');
const STAGE_FILES_DIR = path.join(SKILLS_ROOT, 'flowcharge', 'templates');
const SPAWN_WORD_RE = /(?<![\w-])(spawn\w*|sub-?agents?)(?![\w-])/gi;

function spawnWordOccurrences(sources) {
  return collectOccurrences((line) => [...line.matchAll(SPAWN_WORD_RE)].map((m) => m[1]), sources);
}

// Each Operations table row that names a templates/ stage file, with the slot
// names its Slots column lists.
function operationsStageRows(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('| ')) continue;
    const cols = line.split('|').map((c) => c.trim());
    const m = /`templates\/([A-Za-z0-9._-]+\.md)`/.exec(cols[2] || '');
    if (!m) continue;
    rows.push({ op: cols[1], file: m[1], slots: new Set([...(cols[3] || '').matchAll(/\{([a-z_0-9]+)\}/g)].map((s) => s[1])) });
  }
  return rows;
}

testCase('no skill file describes a stage spawned as a subagent', () => {
  const sample = spawnWordOccurrences([
    { file: 'a.md', text: 'spawn a subagent for this stage\nSpawned without a user\nrun it inline' },
  ]);
  assert.deepStrictEqual(sample.map((o) => o.text), ['spawn', 'subagent', 'Spawned'], 'the spawn-word matcher missed a form or matched the wrong text');
  const found = spawnWordOccurrences(skillMarkdownSources());
  assert.deepStrictEqual(
    found,
    [],
    `a skill file still describes spawning, which contradicts the inline stage design:\n${describeOccurrences(found)}`,
  );
});

testCase('hard rule 8 performs each stage inline, and the orchestrator may read the target project', () => {
  const text = fs.readFileSync(FLOWCHARGE_SKILL, 'utf8').replace(/\s+/g, ' ');
  assert.ok(text.includes('8. **Perform each stage yourself, in order.**'), 'hard rule 8 no longer tells the orchestrator to perform each stage itself');
  assert.ok(!text.includes("Never perform a stage's work inline"), "the retired rule forbidding inline stage work is back");
  assert.ok(!text.includes('read no file outside'), 'the retired rule forbidding the orchestrator from reading the target project is back');
  assert.ok(text.includes('You read the target project yourself'), '"Parsing the request" no longer says the orchestrator reads the target project');
});

testCase('default_agent stays a documented key, marked currently unused', () => {
  const text = fs.readFileSync(FLOWCHARGE_SKILL, 'utf8');
  assert.ok(text.includes('default_agent: <verbatim string>'), 'the agents.md key list no longer carries default_agent');
  assert.ok(
    text.replace(/\s+/g, ' ').includes('`default_agent` in `flowcharge/agents.md` is currently unused'),
    'hard rule 3 no longer documents default_agent as currently unused',
  );
});

testCase('the four stage files stay separate and use only the slots the Operations table lists', () => {
  for (const name of ['plan-and-tasks.md', 'issues-and-tasks.md', 'validate.md', 'execute-parent-task.md']) {
    assert.ok(fs.existsSync(path.join(STAGE_FILES_DIR, name)), `the stage file templates/${name} is missing`);
  }
  const rows = operationsStageRows(fs.readFileSync(FLOWCHARGE_SKILL, 'utf8'));
  assert.ok(rows.length >= 6, `the Operations table yielded ${rows.length} stage-file rows, expected at least 6`);
  const problems = [];
  for (const row of rows) {
    const full = path.join(STAGE_FILES_DIR, row.file);
    if (!fs.existsSync(full)) { problems.push(`${row.op}: templates/${row.file} does not exist`); continue; }
    const body = fs.readFileSync(full, 'utf8');
    if (body.includes('{{')) problems.push(`templates/${row.file} still carries a {{...}} briefing block`);
    for (const m of body.matchAll(/\{([a-z_0-9]+)\}/g)) {
      if (!row.slots.has(m[1])) problems.push(`templates/${row.file} uses {${m[1]}}, which the ${row.op} row does not list`);
    }
  }
  assert.deepStrictEqual([...new Set(problems)], [], 'a stage file and its Operations row disagree');
});

testCase('fc-validate carries the discipline for validating an artefact its own session authored', () => {
  const text = fs.readFileSync(path.join(SKILLS_ROOT, 'fc-validate', 'SKILL.md'), 'utf8').replace(/\s+/g, ' ');
  assert.ok(
    text.includes('judge the artefact against its cited source only, never against what you recall intending when you wrote it'),
    'fc-validate no longer tells an inline validation to judge against the cited source only',
  );
});

// ---- cases: LICENSE presence and agreement ---------------------------------
// A public visitor is granted no right to use, copy, modify or redistribute
// FlowCharge unless a LICENSE travels with the code. The root LICENSE carries
// the terms; every discovered skill folder carries its own byte-identical
// copy, so an installed skill folder ships those terms down every install
// path: the release zip, the ln -s install and the cp -R install. The three
// cases below read the repository's own tree, exactly as the skill-file docs
// consistency cases above do, rather than building a fixture.
//
// Discovery uses the same rule stamp-skill-versions.mjs uses: every immediate
// child of skills/ that holds a SKILL.md. These cases may know the skills/
// layout and how to compare two files' bytes; they must not know any skill
// name, any skill count, the licence text itself, or the copyright year.

const ROOT_LICENSE_PATH = path.join(REPO_ROOT, 'LICENSE');

// Every immediate child of skills/ that holds a SKILL.md, sorted for a
// deterministic scan and print order.
function discoverSkillFolders(skillsDir = SKILLS_ROOT) {
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

testCase('every discovered skill folder holds a LICENSE', () => {
  const missing = discoverSkillFolders().filter(
    (name) => !fs.existsSync(path.join(SKILLS_ROOT, name, 'LICENSE')),
  );
  assert.deepStrictEqual(
    missing,
    [],
    `every discovered skill folder must hold its own LICENSE; missing from:\n${missing.map((n) => `  skills/${n}`).join('\n')}`,
  );
});

testCase("every discovered skill folder's LICENSE matches the root LICENSE byte for byte", () => {
  // L1 owns presence; a folder with no LICENSE is skipped here rather than
  // thrown on, so a missing file produces one clear L1 failure instead of an
  // L1 failure plus an unhandled read error in this case.
  const rootLicense = fs.readFileSync(ROOT_LICENSE_PATH);
  const differing = discoverSkillFolders()
    .filter((name) => fs.existsSync(path.join(SKILLS_ROOT, name, 'LICENSE')))
    .filter((name) => !rootLicense.equals(fs.readFileSync(path.join(SKILLS_ROOT, name, 'LICENSE'))));
  assert.deepStrictEqual(
    differing,
    [],
    `every skill folder's LICENSE must equal the root LICENSE byte for byte; differs in:\n${differing.map((n) => `  skills/${n}`).join('\n')}`,
  );
});

testCase('the root LICENSE has the expected shape', () => {
  const text = fs.readFileSync(ROOT_LICENSE_PATH, 'utf8');
  assert.ok(
    text.startsWith('MIT License'),
    'the root LICENSE must start with the line "MIT License"',
  );
  assert.ok(
    /^Copyright \(c\) \d{4}(-\d{4})? Anthony Koukoullis$/m.test(text),
    'the root LICENSE must hold a copyright line matching '
    + '"Copyright (c) <year>[-<year>] Anthony Koukoullis"',
  );
  assert.ok(
    text.includes('shall be included in all'),
    'the root LICENSE must hold MIT\'s inclusion sentence',
  );
});

// ---- runner ----------------------------------------------------------------

// A fixture tree inside a git repository would be silently redirected by
// resolveProjectRoot, so refuse to run at all in that situation.
function assertTmpdirOutsideRepo() {
  const res = spawnSync('git', ['rev-parse', '--git-common-dir'], { cwd: os.tmpdir(), encoding: 'utf8' });
  if (res.status === 0) {
    console.error(`run-tests: ${os.tmpdir()} sits inside a git repository (${(res.stdout || '').trim()}).`);
    console.error('run-tests: fc-index.mjs would redirect --root away from the fixture. Set TMPDIR elsewhere.');
    process.exit(1);
  }
}

assertTmpdirOutsideRepo();

let failed = 0;
for (const c of cases) {
  try {
    c.fn();
    console.log(`ok   ${c.name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${c.name}`);
    console.log(String(e && e.message ? e.message : e).split('\n').map((l) => `     ${l}`).join('\n'));
  }
}
console.log(`\n${cases.length - failed}/${cases.length} cases passed`);
process.exit(failed ? 1 : 0);
