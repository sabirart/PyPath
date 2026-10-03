// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
// Pure progress rules. No React and no storage access, so they can be unit-tested.

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Consecutive study days ending today (or yesterday, so the streak is not lost before today's lesson).
export function streakOf(days, now = new Date()) {
  const set = new Set(days);
  const d = new Date(now);
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// `completed` is a set-like object { [id]: "completed" }.
export const firstIncomplete = (lessons, completed) => lessons.find((l) => completed[l.id] !== "completed") || null;

// Only the first uncompleted lesson can be started, and only when nothing else is in progress.
export function canStart(lessons, completed, activeId, id) {
  const first = firstIncomplete(lessons, completed);
  return !activeId && !!first && first.id === id;
}

// After finishing `id`, the next uncompleted lesson becomes the active one (null when the course is done).
export function nextActiveAfter(lessons, completed, id) {
  const done = { ...completed, [id]: "completed" };
  return lessons.find((l) => done[l.id] !== "completed")?.id ?? null;
}

export function summarize(lessons, progress, activeId, studyDays, now = new Date()) {
  const total = lessons.length;
  const classes = lessons.filter((l) => l.kind === "lesson");
  const projects = lessons.filter((l) => l.kind === "project");
  const isDone = (l) => progress[l.id] === "completed";
  const completed = lessons.filter(isDone).length;
  const active = activeId ? 1 : 0;
  return {
    total, completed, active, notStarted: total - completed - active,
    classCount: classes.length, projectCount: projects.length,
    lessonsDone: classes.filter(isDone).length, projectsDone: projects.filter(isDone).length,
    percent: total ? Math.round((completed / total) * 100) : 0,
    streak: streakOf(studyDays, now), studiedToday: studyDays.includes(dayKey(now)),
  };
}
