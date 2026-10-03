// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
// All localStorage access lives here. If storage is blocked or full,
// PyPath keeps working from an in-memory copy for the current visit.
const memory = new Map();

export const KEYS = {
  user: "pypath_user",
  theme: "pypath_theme",
  last: "pypath_last_lesson",
  font: "pypath_fontsize",
  active: "pypath_active",
  days: "pypath_days",
  schema: "pypath_schema",
  progress: (id) => `pypath_progress_${id}`,
  code: (id) => `pypath_code_${id}`,
};

const RESET_PREFIXES = ["pypath_progress_", "pypath_code_", "pypath_last_lesson", "pypath_active", "pypath_days"];

export function getItem(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    /* storage unavailable: fall through to memory */
  }
  return memory.has(key) ? memory.get(key) : null;
}

export function setItem(key, value) {
  memory.set(key, String(value));
  try {
    window.localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// Removes only PyPath progress, the active lesson, study days, saved code and the last-lesson pointer.
// The name, theme and text size are kept.
export function resetProgressData() {
  const matches = (k) => RESET_PREFIXES.some((p) => k.startsWith(p));
  [...memory.keys()].filter(matches).forEach((k) => memory.delete(k));
  try {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) keys.push(window.localStorage.key(i));
    keys.filter((k) => k && matches(k)).forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// One-time upgrade to the 30-day course. Lesson ids were renumbered, so saved code and
// completed lessons move to their new ids. Old "in-progress" markers are dropped, because
// opening a lesson no longer counts as starting it.
const OLD_TO_NEW = { l08: "l09", l09: "l10", l10: "l26", l11: "l27", l12: "l11", l13: "l12", l14: "l13", l15: "l14", l16: "l15", l17: "l16", l25: "l30" };
export function migrateStorage() {
  if (getItem(KEYS.schema) === "2") return;
  const ids = Array.from({ length: 25 }, (_, i) => `l${String(i + 1).padStart(2, "0")}`);
  const saved = ids.map((id) => ({ id, code: getItem(KEYS.code(id)), progress: getItem(KEYS.progress(id)), })); 
  ids.forEach((id) => { removeItem(KEYS.code(id)); removeItem(KEYS.progress(id)); });
  saved.forEach(({ id, code, progress }) => {
    const to = OLD_TO_NEW[id] || id;
    if (code !== null) setItem(KEYS.code(to), code);
    if (progress === "completed") setItem(KEYS.progress(to), "completed");
  });
  const last = getItem(KEYS.last);
  if (last) setItem(KEYS.last, OLD_TO_NEW[last] || last);
  setItem(KEYS.schema, "2");
}
