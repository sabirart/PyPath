// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Code2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { KEYS, getItem } from "../services/storage";
import { downloadPython } from "../services/download";
import Missing from "../components/Missing";
import { EditorSkeleton } from "../components/Skeletons";
import usePython from "../hooks/usePython";
import useMedia from "../hooks/useMedia";
import useAutosave from "../hooks/useAutosave";
import LessonContent from "../components/LessonContent";
import TaskCard from "../components/TaskCard";
import Console from "../components/Console";
import NavButtons from "../components/NavButtons";
import Splitter from "../components/Splitter";

const CodeEditor = lazy(() => import("../components/CodeEditor"));

// Wide screens: lesson and editor sit side by side and scroll independently.
// Narrower screens: a Lesson / Code switch shows one full-height pane at a time.
function LessonView({ lesson, base, prev, next }) {
  const { touchLesson, startLesson, completeLesson, progress, panels, togglePanel, lessons, activeId, toast } = useApp();
  const split = useMedia("(min-width: 1180px)");
  const mobile = useMedia("(max-width: 767px)");
  const py = usePython();
  const gestureStart = useRef(null);
  const [code, setCode] = useState(() => getItem(KEYS.code(lesson.id)) ?? lesson.starterCode ?? "");
  const [colSize, setColSize] = useState(46);
  const [rowSize, setRowSize] = useState(mobile ? 70 : 60);
  const status = progress[lesson.id] || "not-started";
  const firstIncomplete = lessons.find((l) => progress[l.id] !== "completed");
  const canStart = !activeId && firstIncomplete?.id === lesson.id;
  const showCode = panels.compiler;
  const showLesson = split || !showCode;
  const sideBySide = split && showCode;
  const samples = lesson.sampleInput ? lesson.sampleInput.split("\n") : [];

  useEffect(() => { touchLesson(lesson.id); }, [lesson.id, touchLesson]);
  useEffect(() => { if (mobile) setRowSize(70); }, [mobile]);

  const change = (v) => setCode(v);
  useAutosave(KEYS.code(lesson.id), code);
  const loadExample = () => { change(lesson.fullExample); togglePanel("compiler", true); };
  const download = () => { try { downloadPython(code, `${lesson.id}.py`); } catch (e) { toast(e.message, "error"); } };
  const start = () => {
    startLesson(lesson.id);
  };
  const complete = () => { completeLesson(lesson.id); };
  const reset = () => {
    if (code !== lesson.starterCode && !window.confirm("Replace your code with the starter code? Your current code will be lost.")) return;
    change(lesson.starterCode);
  };

  const onTouchStart = (e) => {
    if (split || e.touches.length !== 1) return;
    const target = e.target;
    if (target.closest("button, a, input, textarea, select, .cm-editor")) return;
    gestureStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const startPoint = gestureStart.current;
    gestureStart.current = null;
    if (split || !startPoint || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - startPoint.x;
    const dy = e.changedTouches[0].clientY - startPoint.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy) * 1.25) return;
    if (dx < 0 && !showCode) togglePanel("compiler", true);
    if (dx > 0 && showCode) togglePanel("compiler", false);
  };

  return (
    <div className="workspace" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {!split && (
        <div className="tabbar" role="tablist" aria-label="Lesson view">
          <button role="tab" className="tab" aria-selected={!showCode} onClick={() => togglePanel("compiler", false)}><BookOpen size={16} /> Lesson</button>
          <button role="tab" className="tab" aria-selected={showCode} onClick={() => togglePanel("compiler", true)}><Code2 size={16} /> Code</button>
        </div>
      )}
      <div className="ws-panes">
        <section className={`pane pane-lesson ${showLesson ? "is-visible" : "is-hidden"}`} aria-label="Lesson" aria-hidden={!showLesson} inert={showLesson ? undefined : ""} style={sideBySide ? { flex: `${colSize} 1 0` } : undefined}>
            <div className="pane-scroll">
              {base === "projects" && <a href="#/projects" className="back-link"><ArrowLeft size={16} /> All projects</a>}
              <LessonContent lesson={lesson} onLoadExample={loadExample} onStart={start} canStart={canStart} />
              {lesson.practiceTask ? <TaskCard task={lesson.practiceTask} /> : <p className="content-error" role="alert">The practice task is missing from the lesson data.</p>}
            </div>
            <footer className="lesson-footer">
              <NavButtons prev={prev} next={next} status={status} canStart={canStart} onStart={start} onComplete={complete} />
            </footer>
          </section>
        {sideBySide && <Splitter orientation="col" value={colSize} onChange={setColSize} min={30} max={70} label="Resize lesson and editor" />}
        <section className={`pane pane-code ${showCode ? "is-visible" : "is-hidden"}`} aria-label="Code workspace" aria-hidden={!showCode} inert={showCode ? undefined : ""} style={sideBySide ? { flex: `${100 - colSize} 1 0` } : undefined}>
          <div className="stack-item" style={{ flex: `${rowSize} 1 0` }} onFocusCapture={py.warmup} onPointerDownCapture={py.warmup}>
            <Suspense fallback={<EditorSkeleton />}>
              <CodeEditor value={code} onChange={change} onRun={() => py.run(code)} onStop={py.stop} running={py.running}
                onDownload={download} onReset={reset} fileName={`${lesson.id}.py`} />
            </Suspense>
          </div>
          <Splitter orientation="row" value={rowSize} onChange={setRowSize} min={25} max={75} label="Resize editor and output" />
          <div className="stack-item" style={{ flex: `${100 - rowSize} 1 0` }}>
            <Console py={py} samples={samples} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LessonPage({ id, base = "lessons" }) {
  const { lessons, getLesson } = useApp();
  const lesson = getLesson(id);
  if (!lesson) return <Missing what={base === "projects" ? "project" : "lesson"} />;
  // Previous / Next walk through the whole 30-day course in order.
  const i = lessons.findIndex((l) => l.id === id);
  return <LessonView key={id} lesson={lesson} base={base} prev={lessons[i - 1]} next={lessons[i + 1]} />;
}
