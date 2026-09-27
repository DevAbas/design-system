import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { changedPaths, editedPath, shellCommand } from "../hook-io.mjs";

describe("editedPath", () => {
  it("reads the path an Edit or Write call names", () => {
    assert.equal(editedPath({ tool_input: { file_path: "/repo/src/a.tsx" } }), "/repo/src/a.tsx");
    assert.equal(editedPath({ tool_input: {} }), undefined);
    assert.equal(editedPath({}), undefined);
  });
});

describe("shellCommand", () => {
  it("reads the command a Bash call runs", () => {
    assert.equal(shellCommand({ tool_input: { command: "git commit -m x" } }), "git commit -m x");
    assert.equal(shellCommand({ tool_input: {} }), undefined);
  });
});

describe("changedPaths", () => {
  const input = (bashEditDiff) => ({ tool_name: "Bash", tool_input: { command: "node -e '…'" }, tool_response: { stdout: "", bashEditDiff } });

  it("reads Claude Code's changed-file list in the shape a real session records", () => {
    const recorded = { files: [{}, {}], moreFiles: 0, changedFiles: ["/repo/design-system/tokens/semantic/colors.tokens.json", "/repo/lib/site.ts", "/repo/styles/theme.generated.css"] };
    assert.deepEqual(changedPaths(input(recorded)), recorded.changedFiles);
  });

  it("gives nothing without a list or for a skipped diff, and drops entries that are not paths", () => {
    assert.deepEqual(changedPaths({ tool_response: { stdout: "" } }), []);
    assert.deepEqual(changedPaths(input({ skipped: true, changedFiles: ["/repo/src/a.tsx"] })), []);
    assert.deepEqual(changedPaths(input({ changedFiles: [7, "", "/repo/src/a.tsx"] })), ["/repo/src/a.tsx"]);
    assert.deepEqual(changedPaths({}), []);
  });
});
