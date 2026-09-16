# Development

Working notes for developing the FlowCharge Core skill suite itself: the rules a change to
any skill, template, or supporting script must follow. This is not the FlowCharge Core
*data model* (see `CONVENTIONS.md` for workstream/plan/issue-list/task-list schema) and it
is not the orchestration logic of any one skill (see that skill's own `SKILL.md`). It is the
authoring discipline that applies across all of them.

## Portability is the one non-negotiable rule

FlowCharge Core must run unchanged on any harness that provides exactly two things:

1. Skills in the established agent-skill format (a `SKILL.md` with a description that
   triggers it, invoked the way any compliant harness invokes a skill).
2. The ability to spawn a sub-agent.

Nothing else may ever be assumed. Not a specific model, not a specific harness, not a
specific harness feature, not a specific tool name. A skill, template, or script that only
works correctly in one harness or with one model family is broken, even if it works well
there, and even if no test can prove it broken until someone tries it somewhere else.

### What this rules out

- **Model-specific formatting preferences.** Example: structuring a prompt around XML tags
  because one model family is known to parse them well. Write plain instructional prose and
  standard Markdown structure instead — headings, lists, bold, code fences — which every
  model reads the same way.
- **Harness-specific features.** A slash command, a tool name, a permission-prompt
  mechanic, a UI affordance, a file-reference syntax, or any other capability that only one
  product's harness happens to offer. If a rule depends on a capability, name the capability
  generically, never the product that first shipped it.
- **Any instruction a differently-capable-but-compliant model, in a different
  compliant harness, could not follow exactly as written, with no translation.**

### What this allows

- Plain Markdown structure. Every harness that renders skills renders Markdown.
- Generic phrasing for a required capability, instead of a product name. This suite already
  does this correctly in one place worth reusing as the pattern: `flowcharge/SKILL.md`'s
  subagent-spawning rule says "your environment's own subagent-spawning capability," never
  the name of any one tool that does that spawning.
- Ordinary shell commands (`node`, `git`, `bash`), since running a shell command is not a
  feature of one harness — it is close to universal among coding agents, and FlowCharge
  Core's own scripts (`fc-index.mjs` and friends) already depend on a shell being available.

### Before merging a change to any template, `SKILL.md`, or `CONVENTIONS.md`

Ask, of every new or edited sentence:

1. Does it name a specific model, vendor, or harness product?
2. Does it depend on a tool, slash command, or UI feature only one harness offers?
3. Could a differently-capable but compliant model, in a different compliant harness,
   follow it exactly as written, with no translation?

Any "yes" to 1 or 2, or "no" to 3, means rewrite it generically before it ships.

## Maintaining the skill suite

The user owns the templates. When they hand over a revised prompt template or a new
operation, update or add the file under `templates/` verbatim and extend the Operations
table. Do not merge their text into `SKILL.md`'s prose. Schema changes belong in
CONVENTIONS.md, and in the FlowCharge Core schema skills where they repeat it.

A new rule added to CONVENTIONS.md ships with one of two things, and never with
neither: a matching check in `skills/flowcharge/scripts/fc-index.mjs` plus a
case in `skills/flowcharge/scripts/test/run-tests.mjs` that pins its output,
or an explicit "no script can check this" note in CONVENTIONS.md next to the rule
itself. A rule that has neither can go stale without anyone noticing, and these
checks exist to stop that.

A change to an on-disk name shape or an ID shape must grep the entire `skills/`
tree for the old pattern before it merges. Grep every file, not only the documents
you think of as documentation. The prompt templates under `templates/` are the layer
both previous migrations missed. The docs-consistency check in
`skills/flowcharge/scripts/test/run-tests.mjs` is the standing backstop for
rules A to H, the set it already knows. That check knows only those eight rules,
so a new shape change still needs the grep.

A rule put into a numbered procedure is anchored by execution order, placed at
the step where it must be applied, not by topical adjacency to related text.
**No script can check** this rule, and none can check the smell test in
CONVENTIONS.md either, so documented guidance is its only defence — this note on
unverifiable rules is the one `skills/flowcharge/SKILL.md` points back to.

## Instructions must be token-efficient

Every instruction in a skill, template, or script — every word a model has to read before
it can act — must be as token-efficient as possible, while staying 100% as effective and
carrying 100% of the originally intended information. Cut a word only if removing it loses
no instruction, no constraint, and no nuance. Never cut a word that trades clarity for
brevity; a shorter instruction a model follows incorrectly is not efficient.

