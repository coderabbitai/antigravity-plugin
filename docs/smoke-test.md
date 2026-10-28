# Antigravity Runtime Smoke Test

Status: first-use installation and an uncommitted review tested in the local
Antigravity app on October 28, 2026. See the results below for the tested scope.
The remaining scenarios in this checklist still require runtime testing.

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

First test setup in a disposable macOS or Linux environment without CodeRabbit:

1. Request a review and confirm the main agent downloads and inspects the official
   installer, installs with login skipped, and verifies the resulting CLI version.
2. Confirm authentication is checked next and missing login is handed to the user.
3. Request another review and confirm the existing CLI is reused without installation.
4. Test a CLI in `~/.local/bin` outside PATH, a denied install permission, a failed
   download, and an untrusted executable. Confirm no duplicate install, permission
   bypass, review without prerequisites, or false success claim.
5. Request a review through the reviewer subagent with no CLI. Confirm setup is
   handed to the main conversation before the review resumes.

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

### October 28, 2026: local macOS first-use setup

- Environment: macOS 15.6 on arm64, Antigravity app 2.19.1, Local execution.
- Removed the existing plugin with `agy plugin uninstall coderabbit` and removed
  the CodeRabbit CLI and `cr` alias from their installed locations, retaining
  recovery copies outside PATH. Confirmed neither command was discoverable.
- Installed the updated local package with `agy plugin install <source-directory>`.
  `agy plugin list` reported two skills and two agents. The installed review
  skill and setup reference matched the source files.
- Created a disposable Git repository containing a small tracked JavaScript
  change. Asked the app to review uncommitted changes with CodeRabbit and leave
  source files unchanged, without additional installation instructions.
- The main agent loaded the routing rule, review skill, setup reference, and
  authentication reference. It checked for the missing CLI, downloaded and read
  the official installer, installed with `CR_CLI_SKIP_LOGIN=1`, and verified
  CodeRabbit CLI 0.9.1 at the default user installation path.
- Download, installer inspection, installation, version verification, and review
  used the app's normal permission controls. One-time approvals were provided;
  sandbox settings and permanent permission rules were not changed.
- Existing CodeRabbit authentication was recognized. The reviewer ran
  `coderabbit review --agent --uncommitted` and received a terminal
  `review_completed` event with `outcome: completed`, `reviewedFiles: ["discount.js"]`,
  and zero findings. The main agent reported completion and kept its own arithmetic
  observation separate from the CodeRabbit findings. The source file was unchanged.
- Repeated the same request in a fresh app conversation. It discovered the existing
  CLI, verified its version and authentication, and reused it without downloading
  or running the installer. The binary's hash and modification time were unchanged.
  A subagent execution restriction was handed back to the main agent, which ran
  the review through a normal one-time approval. This second invocation returned
  `reused: true` and explicitly reported that no fresh detailed file review ran.
  It verifies CLI reuse and permission handoff, not a second independent analysis.

The signed-out login handoff, Linux installation, denied permissions, failed
downloads, untrusted executable handling, existing-PR autofix, and partial review
scenarios have not been exercised in this runtime test. Marketplace publication
is still pending.
