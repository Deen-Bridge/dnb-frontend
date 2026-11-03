# PR malware guard

The `PR Malware Guard` workflow inspects all added/modified/renamed PR files using
GitHub's blob API. It does not check out the PR, follow its raw URLs, install its
dependencies, import its modules, or run any code supplied by its author.

## Actions taken

- **Close automatically:** newly introduced combinations of published PolinRider
  fingerprints; known campaign C2 hosts in runnable/configuration files; known
  malicious npm dependency references (including nested manifests and lockfiles);
  propagation scripts with commit-rewrite markers; VS Code folder-open tasks
  executing downloaded scripts or fake fonts; script loaders posing as fonts.
  The bot leaves a failure check on the scanned head commit and a comment listing
  rule IDs and paths. It does not quote payloads or blame the contributor.
- **Leave open, fail the check:** suspicious but potentially legitimate behaviors
  such as piping a download to a shell or directly executing decoded data.
  These require maintainer review rather than an automatic accusation.
- **Leave open, fail the check:** API errors, unsupported file objects, incomplete
  listings, files over 5 MiB, more than 1,000 changed files, or a 64 MiB scan budget
  exceeded (both head and baseline bytes count). Nothing is silently skipped.
- **Pass:** no newly introduced configured indicators found. This is not proof
  that code is harmless. Documentation mentions, passive indicator data, ordinary
  fonts, legitimate Tailwind packages, and removal of existing indicators have
  regression coverage. Existing unchanged findings are compared against the base
  file so a cleanup PR is not blamed for inherited malware.

All authors are scanned, including bots, maintainers, and fork contributors.
Compromised trusted accounts are part of the campaign's threat model.

## Trust and permissions

`pull_request_target` is used to allow closing fork PRs without contributor
approval. The workflow only loads scanner code from the repository's default
branch, uses SHA-pinned actions, disables persisted checkout credentials, and
requests only contents-read, PR-write, and checks-write permissions. PR fields
are passed through structured API arguments, never shell interpolation.

The scanner creates a separate `PR Malware Guard` check on the **actual PR head
SHA**; the default `pull_request_target` job status alone belongs to the base
revision and is not a sufficient merge gate. The existing merge bot now requires
this head check from GitHub Actions before merging. A manual workflow dispatch
with `pr_number` rescans an open PR with the current trusted rules.

## Installation and operation

1. Review and merge these files into the default branch of each repository.
   Until then, the target workflow is not active and its rules cannot be tested
   by editing the scanner in a contributor PR. Test candidate rules locally with
   `node --test .github/scripts/pr-malware-guard.test.cjs`.
2. Add `PR Malware Guard` (GitHub Actions) as a required check in branch protection
   for `main` and `dev`, where used. This additionally protects manual merges;
   the merge-bot gate is included in code but branch-protection settings are not
   changed by this patch. Select the new check after its first run.
3. Dispatch the workflow for existing open PRs; future open, reopened, updated,
   and ready-for-review PRs are scanned automatically, including drafts.
4. On a false positive, inspect the files without executing them, review/update
   the rule on the default branch, then reopen for a new scan. Findings remain
   visible in checks and the closing comment; no source branches are deleted.

Tests use inert, generated strings and mocked GitHub APIs. They neither execute
malware nor close real PRs. Keep the same scanner and tests in all three repos.

## Detection limits and rule maintenance

This is a deterministic static guard, not an antivirus verdict or a replacement
for human review, dependency scanning, CodeQL, or secret scanning. Unknown
payloads, alternate encodings, split-string obfuscation, archives, and changed
campaign infrastructure can evade its rules. Docs are not treated as executable
solely for quoting a fingerprint. Some malicious code may look legitimate.

Existing build/deploy workflows run independently and may start before this guard
finishes. Closing a PR does not undo an already-run install or revoke a deployed
preview. Keep untrusted CI tokens read-only and do not expose repository secrets
to PR builds. This patch does not execute or cancel those other workflows.

The PR head and base are rechecked before reporting and immediately before
closing. GitHub provides no atomic close-if-head-matches endpoint, so a very small
race between the last read and closure remains. Reopening triggers a new scan.
If a runner is terminated, its pending head check must not be treated as success.

Indicators are checked-in data, reviewed on 2026-11-03, not downloaded at runtime.
Update them as the campaign changes, with tests for both detection and false
positives. Attribution is based on published reporting, not a guarantee about a
particular PR's author. Sources:

- https://github.com/OpenSourceMalware/PolinRider/blob/main/README.md
- https://opensourcemalware.com/blog/polinrider-is-a-b-testing-its-way-past-your-detections
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target
