// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const items = JSON.parse(readFileSync(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const FIELDS = ["id", "kind", "part", "title", "summary", "definition", "codeExample", "howItWorks", "fullExample", "practiceTask", "starterCode"];
const classes = items.filter((l) => l.kind === "lesson");
const projects = items.filter((l) => l.kind === "project");

test("the challenge has 30 lessons and 5 separate project checkpoints", () => {
  assert.equal(items.length, 35);
  assert.equal(classes.length, 30);
  assert.equal(projects.length, 5);
  classes.forEach((l, i) => { assert.equal(l.day, i + 1); assert.equal(l.number, i + 1); });
  projects.forEach((p, i) => {
    assert.equal(p.day, undefined);
    assert.equal(p.projectNumber, i + 1);
    assert.ok(p.afterLesson >= 1 && p.afterLesson <= 30);
  });
});

test("lesson and project IDs are unique and stable", () => {
  const ids = items.map((l) => l.id);
  assert.equal(new Set(ids).size, 35);
  classes.forEach((l, i) => assert.equal(l.id, `l${String(i + 1).padStart(2, "0")}`));
  projects.forEach((p, i) => assert.equal(p.id, `p${String(i + 1).padStart(2, "0")}`));
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

test("curriculum covers professional Python before projects", () => {
  assert.ok(classes.some((l) => /SQLite/i.test(l.title)));
  assert.ok(classes.some((l) => /Asyncio/i.test(l.title)));
  assert.ok(classes.some((l) => /Logging/i.test(l.title)));
  assert.ok(classes.some((l) => /Packaging/i.test(l.title)));
  assert.ok(classes.some((l) => /Architecture/i.test(l.title)));
  assert.deepEqual(projects.map((p) => p.afterLesson), [6, 9, 15, 24, 30]);
  projects.forEach((p) => assert.ok(p.tags.length >= 4));
});
