// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dayKey, streakOf, canStart, nextActiveAfter, firstIncomplete, summarize } from "../src/services/progress.js";

const lessons = JSON.parse(readFileSync(new URL("../src/data/lessons.json", import.meta.url), "utf8"));
const done = (...ids) => Object.fromEntries(ids.map((id) => [id, "completed"]));

test("only the first incomplete day can be started, and only when nothing is active", () => {
  assert.equal(canStart(lessons, {}, null, "l01"), true);
  assert.equal(canStart(lessons, {}, null, "l02"), false);
  assert.equal(canStart(lessons, {}, "l01", "l01"), false);
  assert.equal(canStart(lessons, done("l01"), null, "l02"), true);
  assert.equal(canStart(lessons, done(...lessons.map((l) => l.id)), null, "l01"), false);
});

test("completing a day activates the next incomplete day, and ends the course after the last", () => {
  assert.equal(nextActiveAfter(lessons, {}, "l01"), "l02");
  assert.equal(nextActiveAfter(lessons, done("l01", "l03"), "l02"), "l04");
  const allButLast = done(...lessons.slice(0, -1).map((l) => l.id));
  assert.equal(nextActiveAfter(lessons, allButLast, "l30"), null);
  assert.equal(firstIncomplete(lessons, done("l01"))?.id, "l02");
});

test("streak counts consecutive study days ending today or yesterday", () => {
  const now = new Date(2026, 9, 4, 12);
  const day = (back) => dayKey(new Date(2026, 9, 4 - back));
  assert.equal(streakOf([], now), 0);
  assert.equal(streakOf([day(0), day(1), day(2)], now), 3);
  assert.equal(streakOf([day(1), day(2)], now), 2); // today not studied yet: streak survives
  assert.equal(streakOf([day(2), day(3)], now), 0); // a missed day breaks it
  assert.equal(streakOf([day(0), day(2)], now), 1);
});

test("summary counts come from the data, not hard-coded numbers", () => {
  const progress = { ...done("l01", "l02", "l26"), l03: "active" };
  const s = summarize(lessons, progress, "l03", [], new Date(2026, 9, 4));
  assert.equal(s.total, 30);
  assert.equal(s.classCount, 25);
  assert.equal(s.projectCount, 5);
  assert.equal(s.completed, 3);
  assert.equal(s.lessonsDone, 2);
  assert.equal(s.projectsDone, 1);
  assert.equal(s.active, 1);
  assert.equal(s.notStarted, 26);
  assert.equal(s.percent, 10);
});
