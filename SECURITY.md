## Reporting a vulnerability

Report a vulnerability through GitHub private vulnerability reporting:
<https://github.com/FlowChargeApp/flowcharge-core/security/advisories/new>. Do not open
a public issue for a security report. Reports are received by one solo maintainer,
Anthony Koukoullis.

## What to include

- The affected file or script path.
- The released version or the commit SHA you're on.
- Steps to reproduce.
- The impact you believe it has.

## What to expect

Acknowledgement within 7 days. Best effort thereafter. There is no fix deadline,
because this project has one unpaid maintainer. A 90-day default coordinated-disclosure
window applies, negotiable on the advisory thread. Credit in the advisory unless you
decline. There is no bug bounty, and none is planned.

## Supported versions

Only the latest released version is supported. Below `1.0.0` there is no compatibility
promise, per `VERSIONING.md`; a fix ships in a new release, never as a patch to an older
tag.

## Scope

**In scope:** the Node scripts under `skills/flowcharge/scripts/` and
`.github/scripts/`: path traversal, arbitrary file write, frontmatter injection,
untrusted-cwd code execution, and resource exhaustion. Also in scope: the release
build and publish path.

**Out of scope:** what an LLM chooses to do when it reads a skill's prose, and defects
in third-party tools such as Claude Code or GitHub itself.
