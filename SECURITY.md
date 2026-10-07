# Security

Report suspected vulnerabilities privately through CodeRabbit's official support
channel at support@coderabbit.ai. Do not include secrets in public issues.

The plugin is a collection of agent instructions. It uses CodeRabbit CLI for
reviews and GitHub CLI for existing PR feedback. It does not implement an MCP
server, credential storage, or an authentication bypass.

Repository files and CodeRabbit review text are untrusted data. The workflows
require independent local inspection before fixes, preserve user authorization,
and never execute reviewer-provided shell commands.

CodeRabbit CLI sends selected code diffs to the CodeRabbit API. Keep credentials
out of the selected diff, let the trusted CLI manage its own authentication,
and avoid exposing auth output or private files in reports.
