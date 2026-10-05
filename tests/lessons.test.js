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

test("curriculum follows beginner-to-professional progression", () => {
  assert.equal(classes[4].title, "Input & Type Conversion");
  assert.equal(classes[9].title, "Functions");
  assert.ok(classes.some((l) => /Errors & Debugging/i.test(l.title)));
  assert.ok(classes.some((l) => /Testing/i.test(l.title)));
  assert.ok(classes.some((l) => /SQLite/i.test(l.title)));
  assert.ok(classes.some((l) => /Git/i.test(l.title)));
  assert.ok(classes.some((l) => /Build, Test & Ship/i.test(l.title)));
  assert.deepEqual(projects.map((p) => p.afterLesson), [6, 9, 15, 24, 30]);
  projects.forEach((p) => assert.ok(p.tags.length >= 4));
});


test("every quiz is lesson-specific and includes feedback", () => {
  const toText = (value) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(toText).join(" ");
    if (value && typeof value === "object") return Object.entries(value).filter(([k]) => k !== "quiz").map(([,v]) => toText(v)).join(" ");
    return "";
  };
  classes.forEach((l) => {
    const lessonText = toText(l).toLowerCase();
    l.quiz.forEach((q, i) => {
      assert.ok(q.question && q.explanation, `${l.id} quiz question ${i + 1} needs a question and explanation`);
      assert.equal(q.options.length, 4);
      assert.ok(q.answer >= 0 && q.answer < 4);
      assert.ok(q.explanation.length >= 20);
      const topicWords = l.title.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 3);
      assert.ok(topicWords.some(word => lessonText.includes(word)), `${l.id} should contain its own topic`);
    });
  });
});

test("lessons provide measurable skills and three levels of practice", () => {
  classes.forEach((l) => {
    assert.ok(Array.isArray(l.skills) && l.skills.length >= 4, `${l.id} needs measurable skills`);
    assert.deepEqual(l.practiceLevels.map(x => x.level), ["Guided", "Independent", "Challenge"]);
    l.practiceLevels.forEach((x) => assert.ok(x.task && x.task.length > 15));
  });
});

test("projects contain complete runnable code", () => {
  projects.forEach((p) => {
    assert.ok(p.interactive === true);
    assert.ok(p.fullExample.length >= 600, `${p.id} should contain a complete project, not a snippet`);
    assert.equal(p.starterCode, p.fullExample);
  });
});

test("lessons use topic-specific Quick Info and no redundant Key Points data", () => {
  classes.forEach((l) => {
    assert.equal(l.teachingPoints, undefined, `${l.id} should not contain redundant Key Points data`);
    assert.ok(Array.isArray(l.quickInfo) && l.quickInfo.length >= 4, `${l.id} needs useful Quick Info`);
    l.quickInfo.forEach((row, i) => {
      assert.ok(Array.isArray(row) && row.length === 2, `${l.id} Quick Info row ${i + 1} must have a label and value`);
      assert.ok(row[0] && row[1], `${l.id} Quick Info row ${i + 1} cannot be empty`);
    });
    l.doDont.forEach((row, i) => assert.ok(row.example, `${l.id} Do/Don't row ${i + 1} needs an example`));
  });
});

test("projects have a clear difficulty progression, bio, and class readiness range", () => {
  assert.deepEqual(projects.map((p) => p.difficulty), ["Beginner", "Beginner", "Intermediate", "Intermediate", "Advanced"]);
  assert.deepEqual(projects.map((p) => [p.classFrom, p.afterLesson]), [[1, 6], [7, 9], [10, 15], [16, 24], [25, 30]]);
  projects.forEach((p) => assert.ok(typeof p.bio === "string" && p.bio.length > 20, `${p.id} needs a short project bio`));
});
