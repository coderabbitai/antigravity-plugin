# Antigravity Runtime Smoke Test

Status: partially run on 2026-10-30. Discovery and an uncommitted-change review
passed in Antigravity CLI. The remaining steps have not been run; see
[Results](#results).

Use a disposable Git project with no secrets. Record the plugin commit,
Antigravity surface/version, CodeRabbit CLI version, operating system, and results.

## Discovery

1. Install the package using the README instructions at one scope.
2. Inspect `agy plugin list` for CLI or Customizations for the IDE.
3. Confirm both skills, both agents, and the routing rule are loaded.
4. Confirm `/coderabbit-review` and `/coderabbit-autofix` are available on the
   surfaces supporting automatic skill slash commands.
5. Ask for a CodeRabbit review and confirm the agent follows the bundled workflow.

## Review and local fixes

1. Make a small tracked change with a known correctness issue.
2. Ask to review uncommitted changes with CodeRabbit.
3. Observe trusted CLI discovery and `auth status --agent` in the review context.
4. Verify user-terminal sign-in handoff when authentication is missing. Confirm
   that credentials are not inspected and sandbox settings are not changed.
5. Verify `review --agent` runs with the requested scope, and completion status
   and native severity are reported correctly.
6. Ask for fixes and re-review. Confirm local inspection, relevant checks, bounded
   review invocations, and reporting of any remaining issues.
7. Add a new untracked file and request `--include-untracked`. Confirm its inclusion.
8. Exercise a failed or skipped review. Confirm the result does not claim a clean
   review. Test partial output when that can be reproduced safely.

## Existing PR feedback

Use an explicitly designated test PR that CodeRabbit has reviewed.

1. Start with a clean checkout matching the PR head.
2. Ask to propose fixes for unresolved CodeRabbit feedback.
3. Confirm exact PR URL/head checks and selection of unresolved, current bot threads.
4. Verify proposed diffs and per-fix approval before changes.
5. Exercise `--no-commit`; confirm no commit, push, or comment occurs.
6. Confirm a dirty worktree or mismatched PR head stops autofix without a stash,
   commit, or automatic synchronization.
7. If publishing fixes is explicitly authorized for the test PR, verify the exact
   push destination, remote head after push, and authorization for any summary comment.

## Results

Keep runtime verification and Marketplace publication marked as pending until
the remaining steps pass.

### 2026-10-30: Antigravity CLI 1.4.10, macOS 15.6 arm64

- Plugin commit `83e4be0`, skills pin `59945da`.
- CodeRabbit CLI 0.9.1, already installed and signed in.
- Surface: Antigravity CLI print mode (`agy -p`) with the default model.

Discovery (steps 1 to 3 and 5):

- `agy plugin install https://github.com/coderabbitai/antigravity-plugin` in a
  separate profile installed two skills (`coderabbit-autofix`,
  `coderabbit-review`), two agents (`coderabbit-autofix-planner`,
  `coderabbit-reviewer`), and one rule (`coderabbit-review-routing`).
- `agy plugin validate --strict .` passed. Its only note is the missing logo.
- The review run loaded a workspace copy from `.agents/plugins/` with a test-only
  manifest name, because an installed Marketplace `coderabbit` plugin uses the
  same plugin name. The Marketplace plugin was disabled during the run.

Review (steps 1 to 3 and 5):

- A disposable repository had two known bugs in one tracked file: an off-by-one
  loop bound and an assignment inside a lookup predicate.
- Prompt: review uncommitted changes with CodeRabbit, list every finding with its
  severity, and do not edit files.
- The agent read the routing rule, the `coderabbit-review` skill, and
  `references/auth-recovery.md`. It ran `git status`, `git diff`,
  `auth status --agent`, and `review --agent --uncommitted`, which took 80 seconds.
- CodeRabbit returned two `major` findings, one for each bug. The agent reported
  both with native severity, completion status, and the proposed diffs. No files
  changed.

Headless permission finding:

- The bundled guidance runs the CLI through a quoted absolute path. Antigravity
  allow rules did not match the quoted command name, so print mode denied
  `review --agent` even with explicit allow rules. Interactive sessions show an
  approval prompt instead.
- The recorded run told the agent to use the same absolute path without quotes.
  Headless or CI use needs either that change or an interactive approval.

Not run: slash command availability (step 4 of Discovery), sign-in handoff, fixes
and re-review, untracked files, failed or partial reviews, all existing PR
feedback steps, and the Antigravity App and IDE surfaces.
