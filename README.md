# CodeRabbit Plugin for Antigravity

Run CodeRabbit reviews from Antigravity, understand the findings, and fix issues
within your requested scope. The plugin also provides a separate workflow for
unresolved CodeRabbit feedback on existing GitHub pull requests.

## Status

Initial package, version 0.1.0. The repository has package validation, regression
tests, and reproducible upstream imports. Loading and running the plugin in
Antigravity still requires the [smoke test](docs/smoke-test.md).
Marketplace review and publication are pending.

## Requirements

- Google Antigravity with native plugin support.
- Git and a project in an initialized Git repository.
- [CodeRabbit CLI](https://docs.coderabbit.ai/cli) installed from an official source
  and authenticated in the environment where the review runs.
- GitHub CLI (`gh`) authenticated for existing GitHub PR autofix workflows.

CodeRabbit reviews send the selected code diff to the CodeRabbit API. Use the
review scope you intend to share, and exclude secrets. The plugin does not
include an MCP server or automatically install software.

## Install

Clone this repository and install the local package with Antigravity CLI:

```bash
git clone https://github.com/coderabbitai/antigravity-plugin.git
cd antigravity-plugin
agy plugin install .
agy plugin list
```

Confirm that `coderabbit` appears with the two skills, agents, and routing rule.
Reload your Antigravity session if the components are not visible immediately.

For the standalone Antigravity IDE, clone the package to a workspace plugin folder:

```bash
git clone https://github.com/coderabbitai/antigravity-plugin.git .agents/plugins/coderabbit
```

For all IDE workspaces, use `~/.gemini/config/plugins/coderabbit` instead. Inspect
the loaded components through the agent panel's Customizations menu. Install at
one scope initially to avoid duplicate components.

These paths follow Google's [plugin installation documentation](https://antigravity.google/docs/plugins).
Local installation does not add the plugin to the Marketplace.

## Use

Ask the agent naturally:

```text
Use CodeRabbit to review my changes.
Review my uncommitted changes, including new untracked files.
Review this branch against main with CodeRabbit.
Build this feature, review it with CodeRabbit, fix the confirmed issues, and review again.
Show unresolved CodeRabbit feedback on this PR and propose fixes.
```

Antigravity converts skill names into slash commands. The bundled skills expose:

```text
/coderabbit-review
/coderabbit-autofix
```

See Google's [skill invocation documentation](https://antigravity.google/docs/skills).

### Local coding, review, and fix

The review skill checks the selected repository and authentication, then runs the
trusted CodeRabbit CLI with `review --agent` and the requested scope. It reports
the findings at their original severity. If you request fixes, the agent checks
the code, applies authorized changes, and runs relevant validation. Review loops
use your run limit or at most three review invocations per change set.

A failed, skipped, interrupted, or partial review is reported with its limitation.
It is not reported as a clean review. If login is needed, complete it in your
terminal; the plugin never reads or copies your credentials.

### Existing GitHub PR feedback

The autofix skill requires a clean worktree and local HEAD matching the exact PR
head, with a submitted CodeRabbit review for that commit. It fetches current,
unresolved threads, checks each issue locally, and presents proposed changes for
per-fix approval. Pushes and PR comments follow your explicit authorization.

Use `--no-commit` in your request to keep approved fixes local and uncommitted.
This workflow does not create a new PR or automatically publish comments.

## Package layout

```text
plugin.json
skills/
  coderabbit-review/SKILL.md
  coderabbit-review/references/
  coderabbit-autofix/SKILL.md
agents/
  coderabbit-reviewer.md
  coderabbit-autofix-planner.md
rules/
  coderabbit-review-routing.md
```

The root manifest uses Antigravity's format. Branding and package version live in
this README and development metadata, rather than unsupported manifest fields.
Skills and agents are adapted from pinned CodeRabbit sources. See
[upstream maintenance](CONTRIBUTING.md).

## Development and Marketplace submission

```bash
npm ci
npm run check
npm run package
```

Node.js 22 or newer is needed for development. Python 3 creates a deterministic
ZIP in `dist/` with `plugin.json` at its root. Antigravity users do not need Node
or Python merely to load these Markdown components.

The checks validate package files and references; they do not replace testing
actual discovery, authentication, review output, and fixes in Antigravity.
Follow the [smoke test](docs/smoke-test.md) and
[Marketplace submission guide](docs/marketplace-submission.md) before a release.

## License

MIT. See [LICENSE](LICENSE).
