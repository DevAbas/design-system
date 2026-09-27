// PostToolUse, Bash: the files a shell command changed (`sed -i`, a heredoc, a
// `node -e` script) get the checks an Edit or Write gets in check-on-edit.mjs,
// so an agent that edits through the shell is told at once, not at the commit.
//
// Claude Code lists the changed files in `tool_response.bashEditDiff`
// (https://code.claude.com/docs/en/hooks, Bash; v2.1.269 or later). It records
// them in auto and bypassPermissions mode when it has the agent edit through
// Bash, and in every mode when the person's own settings set
// `bashEditDiffEnabled: true` (a project's settings cannot). In real auto-mode
// sessions it recorded every shell edit to token files and generated CSS. The
// docs call the list best effort and a public beta, for finding what to
// review: this hook reports, and the commit gate enforces. With no list, it
// passes.
//
// A command that changes a generated output runs the source checks too: the
// build's own output passes the staleness check, a hand edit fails it. The
// PreToolUse hook only sees the Edit and Write tools, so this is where a shell
// write to a generated file is caught before the commit.

import { bashChangedFiles, block, editProblems, hookInput, readGates } from "./gates.mjs";

const files = bashChangedFiles(hookInput());
if (files.length === 0) process.exit(0);
const gates = readGates();
const problem = editProblems(files, { ...gates, sources: [...(gates.sources ?? []), ...(gates.generated ?? [])] });
if (problem) block(problem);
process.exit(0);
