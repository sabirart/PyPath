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
export const dayLessons = (items) => items.filter((l) => l.kind === "lesson");
export const firstIncomplete = (items, completed) => dayLessons(items).find((l) => completed[l.id] !== "completed") || null;

// Only the first uncompleted lesson can be started, and only when nothing else is in progress.
export function canStart(lessons, completed, activeId, id) {
  const first = firstIncomplete(lessons, completed);
  return !activeId && !!first && first.id === id;
}

// After finishing `id`, the next uncompleted lesson becomes the active one (null when the course is done).
export function nextActiveAfter(lessons, completed, id) {
  const done = { ...completed, [id]: "completed" };
  return dayLessons(lessons).find((l) => done[l.id] !== "completed")?.id ?? null;
}

// The class right after `id` in course order that is not completed. If everything after it is done,
// it falls back to the first unfinished class overall (null when the course is finished).
export function nextPendingAfter(lessons, completed, id) {
  const list = dayLessons(lessons);
  const done = { ...completed, [id]: "completed" };
  const idx = list.findIndex((l) => l.id === id);
  return list.slice(idx + 1).find((l) => done[l.id] !== "completed")?.id
    ?? list.find((l) => done[l.id] !== "completed")?.id
    ?? null;
}

// The single "Pending" class: unlocked and waiting for Start. None while a class is In Progress.
export function pendingOf(lessons, completed, activeId, preferredId) {
  if (activeId) return null;
  const list = dayLessons(lessons);
  if (preferredId && list.some((l) => l.id === preferredId) && completed[preferredId] !== "completed") return preferredId;
  return list.find((l) => completed[l.id] !== "completed")?.id ?? null;
}

export function summarize(lessons, progress, activeId, studyDays, now = new Date()) {
  const classes = dayLessons(lessons);
  const projects = lessons.filter((l) => l.kind === "project");
  const isDone = (l) => progress[l.id] === "completed";
  const completed = classes.filter(isDone).length;
  const active = activeId ? 1 : 0;
  const projectCompleted = projects.filter(isDone).length;
  const total = classes.length;
  return {
    total, completed, active, notStarted: total - completed - active,
    classCount: classes.length, projectCount: projects.length,
    lessonsDone: completed, projectsDone: projectCompleted,
    percent: total ? Math.round((completed / total) * 100) : 0,
    overallItems: total + projects.length, overallCompleted: completed + projectCompleted,
    streak: streakOf(studyDays, now), studiedToday: studyDays.includes(dayKey(now)),
  };
}
