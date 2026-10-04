// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import lessonsData from "../data/lessons.json";
import useBreakpoint from "../hooks/useBreakpoint";
import { KEYS, getItem, setItem, removeItem, resetProgressData } from "../services/storage";
import { dayKey, nextPendingAfter, pendingOf, summarize } from "../services/progress";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const lessons = Array.isArray(lessonsData) ? lessonsData : [];
const PROJECT_IDS = lessons.filter((l) => l.kind === "project").map((l) => l.id);
const DAY_LESSONS = lessons.filter((l) => l.kind === "lesson");
const BY_ID = new Map(lessons.map((l) => [l.id, l]));
const getLesson = (id) => BY_ID.get(id) || null;
const FONT_STEPS = [87.5, 100, 112.5, 125];

// Only completed items are stored per lesson. The single active ("Pending") lesson has its own key.
const readCompleted = () => {
  const map = {};
  lessons.forEach((l) => { if (getItem(KEYS.progress(l.id)) === "completed") map[l.id] = "completed"; });
  return map;
};
const readActive = () => {
  const id = getItem(KEYS.active);
  return DAY_LESSONS.some((l) => l.id === id) && getItem(KEYS.progress(id)) !== "completed" ? id : null;
};
const readPending = () => {
  const id = getItem(KEYS.pending);
  return DAY_LESSONS.some((l) => l.id === id) ? id : null;
};
const readDays = () => {
  try { const v = JSON.parse(getItem(KEYS.days) || "[]"); return Array.isArray(v) ? v.filter((d) => typeof d === "string") : []; } catch { return []; }
};
const mq = (q) => window.matchMedia(q).matches;
// The lesson and editor sit side by side from 1180px; the outline starts open only on wide screens.
const defaultsFor = (bp) => ({ sidebar: bp === "desktop" && mq("(min-width: 1360px)"), progress: false, compiler: mq("(min-width: 1180px)") });

export function AppProvider({ children }) {
  const bp = useBreakpoint();
  const [user, setUserState] = useState(() => getItem(KEYS.user));
  const [theme, setThemeState] = useState(() => {
    const saved = getItem(KEYS.theme);
    return saved === "light" ? "light" : "dark";
  });
  const [fontIdx, setFontIdx] = useState(() => {
    const n = Number(getItem(KEYS.font));
    return FONT_STEPS.includes(n) ? FONT_STEPS.indexOf(n) : 1;
  });
  const [completed, setCompleted] = useState(readCompleted);
  const [activeId, setActiveId] = useState(readActive);
  const [pendingId, setPendingId] = useState(readPending);
  const [studyDays, setStudyDays] = useState(readDays);
  const [lastLesson, setLast] = useState(() => getItem(KEYS.last));
  const [panels, setPanels] = useState(() => defaultsFor(bp));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#242726" : "#FAF9F5");
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_STEPS[fontIdx] + "%";
  }, [fontIdx]);
  // Each breakpoint starts with sensible panel defaults.
  useEffect(() => {
    setPanels((p) => ({ ...defaultsFor(bp), compiler: p.compiler, progress: p.progress }));
  }, [bp]);

  const toast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const setUser = useCallback((name) => {
    setItem(KEYS.user, name);
    setUserState(name);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setItem(KEYS.theme, next);
    setThemeState(next);
  }, [theme]);

  const changeFont = useCallback((dir) => {
    const next = Math.min(FONT_STEPS.length - 1, Math.max(0, fontIdx + dir));
    setItem(KEYS.font, FONT_STEPS[next]);
    setFontIdx(next);
  }, [fontIdx]);

  const togglePanel = useCallback((name, value) => {
    setPanels((p) => {
      const nextValue = value === undefined ? !p[name] : value;
      if (!nextValue) return { ...p, [name]: false };

      // The code workspace is independent from utility/navigation panels.
      // Opening the sidebar or progress panel must not hide the editor.
      if (name === "compiler") return { ...p, compiler: true };

      // Sidebar and progress are utility panels, so opening one closes the
      // other, while leaving the code workspace exactly as it is.
      if (name === "sidebar") return { ...p, sidebar: true, progress: false };
      if (name === "progress") return { ...p, progress: true, sidebar: false };

      return { ...p, [name]: true };
    });
  }, []);

  // Opening a lesson only remembers where the person was. It never changes the lesson's status.
  const touchLesson = useCallback((id) => {
    setItem(KEYS.last, id);
    setLast(id);
  }, []);

  // Only the first uncompleted ("Pending") lesson can be started, and only when nothing else is in progress.
  const startLesson = useCallback((id) => {
    if (!DAY_LESSONS.some((l) => l.id === id)) return;
    if (pendingOf(lessons, completed, activeId, pendingId) !== id) return;
    setItem(KEYS.active, id);
    setActiveId(id);
  }, [activeId, completed, pendingId]);

  // Completion is sequential: only the current in-progress lesson (or the first unfinished one) can be completed.
  // It reads the saved state fresh instead of trusting a render-time closure, so a quiz that
  // passes in the same moment the page re-renders can never miss and leave the class "In Progress".
  // `force` is used by the quiz: a passed quiz is proof enough, so it never depends on which lesson
  // happened to be marked active.
  const completeLesson = useCallback((id, { force = false } = {}) => {
    if (!DAY_LESSONS.some((l) => l.id === id)) return;

    const saved = readCompleted();
    const alreadyCompleted = saved[id] === "completed";
    const firstUnfinished = DAY_LESSONS.find((l) => saved[l.id] !== "completed");
    const isCurrent = getItem(KEYS.active) === id || firstUnfinished?.id === id;
    if (!force && !alreadyCompleted && !isCurrent) return;

    setItem(KEYS.progress(id), "completed");
    const nextCompleted = { ...saved, [id]: "completed" };
    setCompleted((current) => ({ ...current, ...nextCompleted }));

    // The finished class is Completed and nothing is in progress any more. The next unfinished class
    // becomes "Pending" (see `progress` below): it is unlocked and shows a Start button, and only
    // becomes "In Progress" when the learner presses Start.
    removeItem(KEYS.active);
    setActiveId(null);
    const nextId = nextPendingAfter(lessons, nextCompleted, id);
    if (nextId) setItem(KEYS.pending, nextId); else removeItem(KEYS.pending);
    setPendingId(nextId);

    const today = dayKey();
    const days = readDays();
    if (!days.includes(today)) {
      const nextDays = [...days, today].slice(-400);
      setItem(KEYS.days, JSON.stringify(nextDays));
      setStudyDays(nextDays);
    }
  }, []);

  // Projects are independent checkpoints. They never consume a course day or block the next lesson.
  const completeProject = useCallback((id) => {
    if (!PROJECT_IDS.includes(id)) return;
    setItem(KEYS.progress(id), "completed");
    setCompleted((current) => ({ ...current, [id]: "completed" }));
    const today = dayKey();
    if (!studyDays.includes(today)) {
      const nextDays = [...studyDays, today].slice(-400);
      setItem(KEYS.days, JSON.stringify(nextDays));
      setStudyDays(nextDays);
    }
    toast("Project checkpoint completed.", "success");
  }, [studyDays, toast]);

  // completed -> "completed"; the started lesson -> "active" (In Progress);
  // when nothing is in progress, the first unfinished lesson -> "pending" (ready to Start).
  const progress = useMemo(() => {
    const map = { ...completed };
    if (activeId && !map[activeId]) map[activeId] = "active";
    else if (!activeId) {
      const pending = pendingOf(lessons, map, null, pendingId);
      if (pending) map[pending] = "pending";
    }
    return map;
  }, [completed, activeId, pendingId]);

  const resetProgress = useCallback(() => {
    resetProgressData();
    setCompleted({});
    setActiveId(null);
    setPendingId(null);
    setStudyDays([]);
    setLast(null);
    toast("Progress and saved code were reset.", "success");
  }, [toast]);

  // Reset everything related to course progress, then immediately start Day 1
  // with the newly confirmed name.
  const resetAndRestart = useCallback((name) => {
    resetProgressData();
    setCompleted({});
    setPendingId(null);
    setStudyDays([]);
    setLast("l01");
    setUser(name);
    setItem(KEYS.active, "l01");
    setActiveId("l01");
    toast("Course reset. Day 1 is ready to start.", "success");
  }, [setUser, toast]);

  const stats = useMemo(() => summarize(lessons, progress, activeId, studyDays), [progress, activeId, studyDays]);

  // Where "Continue" leads: the active lesson, otherwise the first day not yet completed.
  const nextItem = DAY_LESSONS.find((l) => l.id === activeId) || DAY_LESSONS.find((l) => progress[l.id] === "pending") || DAY_LESSONS.find((l) => progress[l.id] !== "completed") || null;

  const value = useMemo(() => ({
    lessons, projectIds: PROJECT_IDS, getLesson,
    user, setUser, theme, toggleTheme, fontIdx, fontMax: FONT_STEPS.length - 1, changeFont,
    progress, activeId, nextItem, startLesson, completeLesson, completeProject, touchLesson, resetProgress, resetAndRestart, stats, lastLesson,
    bp, panels, togglePanel, toasts, toast,
  }), [user, setUser, theme, toggleTheme, fontIdx, changeFont, progress, activeId, nextItem, startLesson, completeLesson,
    touchLesson, resetProgress, resetAndRestart, stats, lastLesson, bp, panels, togglePanel, toasts, toast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
