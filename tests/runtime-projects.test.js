import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const lessons = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/data/lessons.json"), "utf8"));

test("projects do not depend on browser-incompatible sqlite3", () => {
  const p4 = lessons.find((x) => x.id === "p04");
  assert.equal(p4.title, "Project 4: Command-Line To-Do List");
  assert.doesNotMatch(p4.fullExample, /sqlite3/i);
});

test("project 1 is calculator-only", () => {
  const p1 = lessons.find((x) => x.id === "p01");
  assert.equal(p1.title, "Project 1: Calculator");
  assert.doesNotMatch(p1.fullExample, /bill|tip|discount/i);
});

test("quiz overlay leaves top spacing", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src/styles/index.css"), "utf8");
  assert.match(css, /quiz-backdrop[^\{]*\{[^}]*padding:72px 1rem 1rem/);
});

test("project 1 is calculator-only in all project-facing text", () => {
  const p1 = lessons.find((p) => p.id === "p01");
  const text = [p1.title, p1.summary, p1.definition, p1.outcome, p1.bio, p1.practiceTask, p1.starterCode, p1.codeExample, p1.howItWorks, p1.fullExample].flat().join(" ");
  assert.doesNotMatch(text, /\bbill(?:ing)?\b|\btips?\b|\bdiscount(?:s|ed)?\b/i);
});
