# Antigravity Runtime Smoke Test

Status: not yet run. Initial preparation could validate package files but did not
have an Antigravity CLI executable available. Static checks do not verify that
Antigravity loads or executes the plugin.

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

Replace this section with dated evidence after testing. Until then, keep runtime
verification and Marketplace publication marked as pending.
