import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import lessonsData from "../data/lessons.json";
import useBreakpoint from "../hooks/useBreakpoint";
import { KEYS, getItem, setItem, removeItem, resetProgressData } from "../services/storage";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const lessons = Array.isArray(lessonsData) ? lessonsData : [];
const PROJECT_IDS = lessons.filter((l) => l.kind === "project").map((l) => l.id);
const FONT_STEPS = [87.5, 100, 112.5, 125];

// Only completed items are stored per lesson. The single active ("Pending") lesson has its own key.
const readCompleted = () => {
  const map = {};
  lessons.forEach((l) => { if (getItem(KEYS.progress(l.id)) === "completed") map[l.id] = "completed"; });
  return map;
};
const readActive = () => {
  const id = getItem(KEYS.active);
  return lessons.some((l) => l.id === id) && getItem(KEYS.progress(id)) !== "completed" ? id : null;
};
const readDays = () => {
  try { const v = JSON.parse(getItem(KEYS.days) || "[]"); return Array.isArray(v) ? v.filter((d) => typeof d === "string") : []; } catch { return []; }
};
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// Consecutive study days ending today (or yesterday, so the streak is not lost before today's lesson).
const streakOf = (days) => {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
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
    setThemeState((t) => {
      const next = t === "dark" ? "light" : "dark";
      setItem(KEYS.theme, next);
      return next;
    });
  }, []);

  const changeFont = useCallback((dir) => {
    setFontIdx((i) => {
      const next = Math.min(FONT_STEPS.length - 1, Math.max(0, i + dir));
      setItem(KEYS.font, FONT_STEPS[next]);
      return next;
    });
  }, []);

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

  // Only the first uncompleted lesson can be started. After completion, the next
  // lesson becomes the single in-progress ("active") lesson automatically.
  const startLesson = useCallback((id) => {
    if (!lessons.some((l) => l.id === id)) return;
    const firstIncomplete = lessons.find((l) => getItem(KEYS.progress(l.id)) !== "completed");
    if (!firstIncomplete || firstIncomplete.id !== id || activeId) return;
    setItem(KEYS.active, id);
    setActiveId(id);
  }, [activeId]);

  // Completion is sequential: only the current in-progress lesson can be completed.
  const completeLesson = useCallback((id) => {
    if (!lessons.some((l) => l.id === id) || activeId !== id) return;
    setItem(KEYS.progress(id), "completed");
    setCompleted((c) => ({ ...c, [id]: "completed" }));

    const next = lessons.find((l) => l.id !== id && getItem(KEYS.progress(l.id)) !== "completed");
    if (next) {
      setItem(KEYS.active, next.id);
      setActiveId(next.id);
    } else {
      removeItem(KEYS.active);
      setActiveId(null);
    }

    const today = dayKey();
    setStudyDays((d) => {
      if (d.includes(today)) return d;
      const nextDays = [...d, today].slice(-400);
      setItem(KEYS.days, JSON.stringify(nextDays));
      return nextDays;
    });
  }, [activeId]);

  const progress = useMemo(() => {
    const map = { ...completed };
    if (activeId && !map[activeId]) map[activeId] = "active";
    return map;
  }, [completed, activeId]);

  const resetProgress = useCallback(() => {
    resetProgressData();
    setCompleted({});
    setActiveId(null);
    setStudyDays([]);
    setLast(null);
    toast("Progress and saved code were reset.", "success");
  }, [toast]);

  const stats = useMemo(() => {
    const total = lessons.length;
    const done = lessons.filter((l) => progress[l.id] === "completed").length;
    const active = activeId ? 1 : 0;
    const lessonsDone = lessons.filter((l) => l.kind === "lesson" && progress[l.id] === "completed").length;
    const projectsDone = lessons.filter((l) => l.kind === "project" && progress[l.id] === "completed").length;
    return { total, completed: done, active, notStarted: total - done - active, lessonsDone, projectsDone, percent: total ? Math.round((done / total) * 100) : 0, streak: streakOf(studyDays), studiedToday: studyDays.includes(dayKey()) };
  }, [progress, activeId, studyDays]);

  // Where "Continue" leads: the active lesson, otherwise the first day not yet completed.
  const nextItem = lessons.find((l) => l.id === activeId) || lessons.find((l) => progress[l.id] !== "completed") || null;

  const value = {
    lessons, projectIds: PROJECT_IDS, getLesson: (id) => lessons.find((l) => l.id === id) || null,
    user, setUser, theme, toggleTheme, fontIdx, fontMax: FONT_STEPS.length - 1, changeFont,
    progress, activeId, nextItem, startLesson, completeLesson, touchLesson, resetProgress, stats, lastLesson,
    bp, panels, togglePanel, toasts, toast,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
