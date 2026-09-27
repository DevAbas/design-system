import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("the harness layout", () => {
  it("points Claude Code, git and CI at design-system/harness, never at .claude/hooks", () => {
    for (const file of ["settings.hooks.json", "pre-commit", "design-system.yml", "claude/with-node.sh", "run-gates.mjs"]) {
      const text = read(file);
      assert.doesNotMatch(text, /\.claude\/hooks/, file);
      assert.match(text, /design-system\/harness\//, file);
    }
  });

  it("runs every Claude hook through the adapter folder, and the gates through the one runner", () => {
    const commands = JSON.parse(read("settings.hooks.json")).hooks;
    const all = Object.values(commands).flat().flatMap((entry) => entry.hooks.map((hook) => hook.command));
    for (const command of all) assert.match(command, /^"\$CLAUDE_PROJECT_DIR"\/design-system\/harness\/claude\/with-node\.sh [a-z-]+\.mjs$/);
    assert.match(read("pre-commit"), /^node design-system\/harness\/run-gates\.mjs before-commit$/m);
    assert.match(read("design-system.yml"), /run: node design-system\/harness\/run-gates\.mjs before-commit/);
  });
});
