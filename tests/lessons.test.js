// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const items = JSON.parse(readFileSync(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const FIELDS = ["id", "kind", "day", "number", "part", "title", "summary", "definition", "codeExample", "howItWorks", "fullExample", "practiceTask", "starterCode"];
const classes = items.filter((l) => l.kind === "lesson");
const projects = items.filter((l) => l.kind === "project");

test("the challenge has 30 days: 25 classes then 5 projects", () => {
  assert.equal(items.length, 30);
  assert.equal(classes.length, 25);
  assert.equal(projects.length, 5);
  items.forEach((l, i) => { assert.equal(l.day, i + 1); assert.equal(l.number, i + 1); });
  classes.forEach((l) => assert.ok(l.day <= 25));
  projects.forEach((l) => assert.ok(l.day >= 26));
});

test("ids are unique and stable (l01 - l30)", () => {
  const ids = items.map((l) => l.id);
  assert.equal(new Set(ids).size, 30);
  ids.forEach((id, i) => assert.equal(id, `l${String(i + 1).padStart(2, "0")}`));
});

test("every item has every required field", () => {
  for (const l of items) {
    for (const f of FIELDS) {
      assert.ok(l[f] && (!Array.isArray(l[f]) || l[f].length > 0), `${l.id} is missing ${f}`);
    }
  }
});

test("projects carry tags", () => {
  projects.forEach((l) => assert.ok(Array.isArray(l.tags) && l.tags.length > 0, `${l.id} needs tags`));
});

test("parts progress from Basic to Advanced Python, then projects", () => {
  assert.deepEqual([...new Set(items.map((l) => l.part))], [
    "Basic Python", "Beginner Python", "Intermediate Python", "Advanced Python", "Practical Projects",
  ]);
});
