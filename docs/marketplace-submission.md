# Marketplace Submission

Status: submission pending. This repository does not imply approval or a live
Antigravity Marketplace listing.

Google's [Marketplace documentation](https://antigravity.google/docs/marketplace#next-steps)
links to the [Antigravity Plugin Interest Form](https://forms.gle/2EX5RFYPoJe1UgxR9).
The form accepts plugins for review and possible inclusion, with follow-up from
Google if needed. Its first step asks for an email address. Complete later fields
according to the live form; the public docs do not specify an approval timeline,
mandatory dedicated repository, or ZIP-upload requirement.

## Prepare

- Run `npm run check` and `npm run package`.
- Complete and document the [runtime smoke test](smoke-test.md).
- Verify the repository and README are accessible to reviewers.
- Confirm the package includes its root `plugin.json`, skills, agents, rules,
  referenced resources, and license.
- Use a clean example project and capture install, review, and fix evidence.

The generated ZIP is a convenient package artifact. It is not described here as
Google's required submission format. Follow the live form and partner guidance
for the actual upload or repository-link step.

## Listing information

- Name: CodeRabbit
- Source: https://github.com/coderabbitai/antigravity-plugin
- Description: CodeRabbit code review and guarded autofix for Antigravity.
- Package version: 0.1.0
- Components: two skills, two agents, one routing rule
- Requirements: Git, CodeRabbit CLI, and GitHub CLI for existing PR feedback
- Code handling: selected review diffs are sent to the CodeRabbit API
- MCP server: none
- License: MIT

The native manifest uses Google's [documented plugin format](https://antigravity.google/docs/plugins).
Listing information such as branding and version stays separate from unsupported
manifest properties.

Submit with the designated CodeRabbit contact. Record Google's response and
listing URL here once confirmed. Do not change the README to claim Marketplace
availability before that confirmation.
