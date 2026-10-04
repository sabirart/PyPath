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


test("every lesson has substantial teaching support, Do/Don't guidance, and a five-question gate", () => {
  classes.forEach((l) => {
    assert.ok(Array.isArray(l.teachingPoints) && l.teachingPoints.length >= 5, `${l.id} needs detailed teaching points`);
    assert.ok(Array.isArray(l.doDont) && l.doDont.length >= 4, `${l.id} needs Do/Don't guidance`);
    assert.equal(l.quiz.length, 5, `${l.id} needs exactly 5 quiz questions`);
    l.quiz.forEach((q) => { assert.equal(q.options.length, 4); assert.ok(q.answer >= 0 && q.answer < 4); });
  });
});

test("projects contain complete runnable code", () => {
  projects.forEach((p) => {
    assert.ok(p.interactive === true);
    assert.ok(p.fullExample.length >= 600, `${p.id} should contain a complete project, not a snippet`);
    assert.equal(p.starterCode, p.fullExample);
  });
});

test("important details include a short example for every teaching point", () => {
  classes.forEach((l) => {
    l.teachingPoints.forEach((item, i) => {
      assert.equal(typeof item, "object", `${l.id} teaching point ${i + 1} should include text and example`);
      assert.ok(item.text && item.example, `${l.id} teaching point ${i + 1} needs an example`);
    });
    l.doDont.forEach((row, i) => assert.ok(row.example, `${l.id} Do/Don't row ${i + 1} needs an example`));
  });
});

test("projects have a clear difficulty progression, bio, and class readiness range", () => {
  assert.deepEqual(projects.map((p) => p.difficulty), ["Beginner", "Beginner", "Intermediate", "Intermediate", "Advanced"]);
  assert.deepEqual(projects.map((p) => [p.classFrom, p.afterLesson]), [[1, 6], [7, 9], [10, 15], [16, 24], [25, 30]]);
  projects.forEach((p) => assert.ok(typeof p.bio === "string" && p.bio.length > 20, `${p.id} needs a short project bio`));
});
