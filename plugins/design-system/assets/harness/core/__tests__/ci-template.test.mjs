import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const workflow = readFileSync(new URL("../design-system.yml", import.meta.url), "utf8");
const lines = workflow.split("\n");

describe("the CI template", () => {
  it("runs with read-only contents, cancels a superseded run, and has a time limit", () => {
    assert.match(workflow, /^permissions:\n {2}contents: read$/m);
    assert.match(workflow, /^concurrency:\n(?: {2}.*\n)* {2}cancel-in-progress: true$/m);
    assert.match(workflow, /^ {4}timeout-minutes: \d+$/m);
  });

  it("pins every action by a placeholder harness fills with a release's commit SHA, never a tag", () => {
    const uses = lines.filter((line) => /^\s*- uses:|^\s*uses:/.test(line));
    assert.ok(uses.length > 0);
    for (const line of uses) assert.match(line, /uses: [\w.-]+\/[\w.-]+@<sha> # <version>$/, line);
  });

  it("leaves the branch, Node version and install to the project", () => {
    for (const placeholder of ["<default-branch>", "<node-version-key>", "<install-command>", "<package-manager>"]) assert.ok(workflow.includes(placeholder), placeholder);
    assert.doesNotMatch(workflow, /branches: \[main\]/);
  });

  it("never uses pull_request_target", () => {
    assert.doesNotMatch(workflow, /pull_request_target/);
  });
});
