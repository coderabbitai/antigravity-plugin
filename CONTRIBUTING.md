# Contributing

This repository owns Antigravity packaging, agents, routing, documentation, and
validation. It reuses the CodeRabbit review workflow and the existing Cursor
plugin's stricter GitHub PR identity and push workflow.

## Shared sources

`upstream.json` pins both source repositories and lists generated files. Do not
edit those files directly. Update their source or the explicit transformation in
`scripts/sync-upstream.mjs`, then regenerate.

Current transformations:

- Rename skill identifiers to `coderabbit-review` and `coderabbit-autofix` so
  explicit invocation is recognizable and avoids generic skill-name collisions.
- Replace the review introduction with scoped Antigravity wording.
- Bound local fix-review loops and reject incomplete output as clean evidence.
- Adapt the shared authentication guidance to Antigravity's supported command
  runner, permission controls, and manual terminal handoff.
- Replace Cursor references in the PR autofix skill with Antigravity.
- Preserve CodeRabbit severity instead of mapping it to different labels.
- Require relevant repository validation before publishing PR fixes.

The updater reads committed Git blobs, not working-tree files, and rejects
checkouts that do not match the pins.

```bash
git clone https://github.com/coderabbitai/skills.git /tmp/coderabbit-skills
git -C /tmp/coderabbit-skills checkout 59945da347a93f9937d3fb09f5ba81a16010351f
git clone https://github.com/coderabbitai/cursor-plugin.git /tmp/coderabbit-cursor
git -C /tmp/coderabbit-cursor checkout ec858d6b6b26949e0004d9f41b66be9c5d9321b2
npm run sync:upstream -- --skills-root /tmp/coderabbit-skills --cursor-root /tmp/coderabbit-cursor
npm run sync:upstream -- --skills-root /tmp/coderabbit-skills --cursor-root /tmp/coderabbit-cursor --check
```

When changing pins, review the source changes and transformations, update the
checkout refs in `.github/workflows/validate.yml`, regenerate, and inspect the
diff. CI verifies both structure and reproducibility from the pinned commits.

## Checks

Run `npm ci`, `npm run check`, and `npm run package`. The package validator catches
unsupported manifest fields, malformed YAML, invalid routing triggers, missing
references, unmapped tools, and symlinks in component directories. Regression
tests exercise failures that can prevent components from loading.

The `$schema` URL is included as Google's manifest example recommends. The URL
returned HTTP 404 during initial preparation, so validation checks the fields
documented on the Plugins page rather than claiming remote-schema validation.

Keep agent tool names compatible with the
[official agent specification](https://antigravity.google/docs/subagents).
Do not copy Cursor manifest fields or `.mdc` rule formats into Antigravity files.

Complete the [runtime smoke test](docs/smoke-test.md) and record the Antigravity
and CodeRabbit versions and results before changing runtime status to verified.

## Writing

Use concrete, plain language. Do not use em dashes or double hyphens as sentence
breaks. Never advertise Marketplace availability or completed validation without
evidence.
